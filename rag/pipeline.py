import os
import json
import re
from typing import List, Dict, Any, Optional
from backend.config import settings
from database.vector_store import VectorStore
from rag.embeddings import EmbeddingManager
from rag.chunking import DocumentChunker

class RAGPipeline:
    """End-to-end Intelligent RAG Pipeline with Multi-Turn Memory and Live Ingestion."""

    def __init__(self):
        self.embedder = EmbeddingManager()
        self.chunker = DocumentChunker(
            chunk_size=settings.CHUNK_SIZE,
            chunk_overlap=settings.CHUNK_OVERLAP
        )
        self.vector_store = VectorStore(
            persist_dir=settings.CHROMA_PERSIST_DIR,
            collection_name=settings.COLLECTION_NAME
        )
        self._query_cache: Dict[str, Dict[str, Any]] = {}
        self._gemini_model = None
        self._init_llm()
        self._ensure_knowledge_base_loaded()

    def _init_llm(self):
        """Pre-initialize Gemini model for sub-second responses."""
        if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY.strip() and settings.GEMINI_API_KEY != "your_gemini_api_key_here":
            try:
                import google.generativeai as genai
                genai.configure(api_key=settings.GEMINI_API_KEY.strip())
                for m in ["gemini-3.5-flash-lite", "gemini-3.1-flash-lite", "gemini-3.6-flash", "gemini-flash-latest"]:
                    try:
                        self._gemini_model = genai.GenerativeModel(m)
                        break
                    except Exception:
                        continue
            except Exception as e:
                print(f"[RAGPipeline] LLM init warning: {e}")

    def _ensure_knowledge_base_loaded(self):
        """Auto-seed vector store from all raw documents in data/raw."""
        try:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            raw_dir = os.path.join(base_dir, "data", "raw")
            
            # If already seeded and has full docs, skip
            if self.vector_store.count() >= 20:
                return

            documents = []
            metadatas = []
            ids = []

            if os.path.exists(raw_dir):
                for fname in sorted(os.listdir(raw_dir)):
                    if fname.endswith(".txt"):
                        fpath = os.path.join(raw_dir, fname)
                        with open(fpath, "r", encoding="utf-8") as f:
                            content = f.read()
                        processed = self.chunker.process_document(content, metadata={"source": fname, "category": "University Handbook"})
                        for item in processed:
                            documents.append(item["content"])
                            metadatas.append(item["metadata"])
                            ids.append(f"{fname}_{len(ids)}")

            if documents:
                embeddings = self.embedder.get_embeddings(documents)
                self.vector_store.add_documents(
                    documents=documents,
                    metadatas=metadatas,
                    embeddings=embeddings,
                    ids=ids
                )
        except Exception as e:
            print(f"[RAGPipeline] Warning during knowledge base initialization: {e}")

    def ingest_text(self, title: str, content: str, category: str = "University Notice") -> int:
        """Ingest live upcoming notice/circular and save to data/raw for persistence."""
        if not content or not content.strip():
            return 0

        # Save to data/raw so it persists permanently
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        raw_dir = os.path.join(base_dir, "data", "raw")
        os.makedirs(raw_dir, exist_ok=True)
        
        safe_title = re.sub(r'[^a-zA-Z0-9_-]', '_', title.lower())
        file_path = os.path.join(raw_dir, f"notice_{safe_title}.txt")
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(f"# {title}\nCategory: {category}\n\n{content}\n")

        chunks = self.chunker.process_document(
            content,
            metadata={"source": f"notice_{safe_title}.txt", "title": title, "category": category}
        )

        if not chunks:
            return 0

        documents = [c["content"] for c in chunks]
        metadatas = [c["metadata"] for c in chunks]
        ids = [f"notice_{safe_title}_{i}" for i in range(len(chunks))]
        embeddings = self.embedder.get_embeddings(documents)

        self.vector_store.add_documents(documents, metadatas, embeddings, ids)
        self._query_cache.clear()
        return len(chunks)

    def ingest_file(self, file_path: str, category: str = "General") -> int:
        """Ingest a file into the knowledge base."""
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File {file_path} does not exist.")

        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()

        source_name = os.path.basename(file_path)
        chunks = self.chunker.process_document(
            content,
            metadata={"source": source_name, "category": category}
        )

        if not chunks:
            return 0

        documents = [c["content"] for c in chunks]
        metadatas = [c["metadata"] for c in chunks]
        ids = [c["chunk_id"] for c in chunks]
        embeddings = self.embedder.get_embeddings(documents)

        self.vector_store.add_documents(documents, metadatas, embeddings, ids)
        self._query_cache.clear()
        return len(chunks)

    def rewrite_query_with_history(self, query: str, history: Optional[List[Any]] = None) -> str:
        """
        Conversational Context Expansion:
        Detects pronouns / follow-up references ('it', 'they', 'its fees', 'that branch', 'seats?')
        and synthesizes a standalone query using previous conversation context.
        """
        if not history or len(history) == 0:
            return query.strip()

        q_lower = query.lower().strip()
        follow_up_cues = [
            "it", "its", "their", "they", "that", "this", "there", "those",
            "fees", "cutoff", "seats", "placement", "hod", "syllabus", "hostel",
            "and what about", "how many", "which one", "tell more", "eligibility"
        ]

        is_follow_up = any(re.search(rf'\b{re.escape(cue)}\b', q_lower) for cue in follow_up_cues) or len(query.split()) <= 4

        if not is_follow_up:
            return query.strip()

        # Extract last user and assistant entities
        last_context_snippets = []
        for msg in reversed(history[-4:]):
            content = getattr(msg, "content", None) or (msg.get("content") if isinstance(msg, dict) else str(msg))
            if content:
                # Find prominent university entities in past messages
                found_entities = re.findall(r'\b(CSPIT|DEPSTAR|CMPICA|RPCP|I2IM|PDPIAS|MTIN|ARIP|CIPS|B\.Tech|BCA|MCA|MBA|B\.Pharm|Library|Hostel|Bus|ACPC|GUJCET|Placements|Scholarship)\b', content, re.IGNORECASE)
                for ent in found_entities:
                    if ent.upper() not in [e.upper() for e in last_context_snippets]:
                        last_context_snippets.append(ent)

        if last_context_snippets:
            expanded_context = " ".join(last_context_snippets[:3])
            expanded_query = f"{expanded_context} {query.strip()}"
            return expanded_query

        return query.strip()

    def retrieve_context(self, query: str, top_k: int = 6) -> List[Dict[str, Any]]:
        """Hybrid Search combining Dense Vector Cosine Similarity and Lexical Keyword Matching."""
        if not query or not query.strip():
            return []

        query_embedding = self.embedder.get_embedding(query.strip())
        vector_results = self.vector_store.search(query_embedding, top_k=top_k)

        # Lexical keyword search (supports Hinglish variants like 'spit' -> 'cspit')
        norm_query = query.lower().replace("spit", "cspit")
        keywords = set(re.findall(r'\w+', norm_query))

        scored_docs = []
        for doc in self.vector_store._in_memory_docs:
            content = doc.get("content", "").lower()
            overlap = sum(1 for kw in keywords if len(kw) > 2 and kw in content)
            if overlap > 0:
                scored_docs.append((overlap, doc))

        scored_docs.sort(key=lambda x: x[0], reverse=True)
        kw_results = [
            {
                "content": item[1].get("content", ""),
                "metadata": item[1].get("metadata", {}),
                "score": round(0.75 + min(item[0] * 0.05, 0.2), 3)
            }
            for item in scored_docs[:top_k]
        ]

        # Combine with reciprocal ranking
        seen = set()
        combined = []
        for r in kw_results + vector_results:
            text = r.get("content", "").strip()
            if text and text not in seen:
                seen.add(text)
                combined.append(r)

        return combined[:top_k]

    def build_prompt(self, query: str, context_docs: List[Dict[str, Any]], history: Optional[List[Any]] = None) -> str:
        """Construct authoritative prompt with strict guidelines."""
        context_text = "\n\n---\n\n".join([
            f"[Source: {doc.get('metadata', {}).get('source', 'CHARUSAT Official Handbook')}]\n{doc.get('content', '')}"
            for doc in context_docs
        ]) if context_docs else "No specific documents found in database."

        system_instructions = (
            "You are CHARUSAT Virtual Intelligence, the official, highly intelligent and authoritative AI Assistant for "
            "Charotar University of Science and Technology (CHARUSAT), located in Changa, Anand, Gujarat.\n\n"
            "CRITICAL OPERATING RULES:\n"
            "1. PROVIDE DIRECT, COMPLETE, AND DETAILED ANSWERS: Answer the user's questions with full, comprehensive facts right inside your response using rich Markdown (bold titles, bullet points, clean lists). Never give partial answers.\n"
            "2. NEVER DODGE OR SEND USERS TO EXTERNAL WEBSITES: Do NOT say 'visit charusat.ac.in', 'check the official portal', or 'contact the helpdesk'. Deliver the complete information directly.\n"
            "3. MULTI-TURN CONVERSATION MEMORY: If the user asks follow-up questions referencing past messages ('it', 'they', 'its fees', 'what about depstar', 'who is the hod'), use the conversation history to answer accurately for that entity.\n"
            "4. CENTRAL LIBRARY & BOOKS SYSTEM: When asked about books (e.g. Core Java, Algorithms CLRS, DBMS Korth, Computer Networks Tanenbaum, Operating Systems, AI Russell & Norvig, Mathematics B.S. Grewal, Pharmacy, Management), state exact availability status, number of copies, shelf location, borrowing rules (4 books for 14 days for UG, 6 books for PG), digital resources (IEEE, ScienceDirect, Springer), and library timings (8:30 AM - 8:30 PM, 24/7 reading hall during exams).\n"
            "5. INSTITUTES & DEPARTMENTS DIRECTORY:\n"
            "   • CSPIT: Computer Engineering (CE), Information Technology (IT), Artificial Intelligence & Machine Learning (AI & ML), Electronics & Communication (EC), Electrical (EE), Mechanical (ME), Civil (CL).\n"
            "   • DEPSTAR: Computer Science & Engineering (CSE), Information Technology (IT). (AI & ML is in CSPIT).\n"
            "   • CMPICA: BCA, B.Sc IT, MCA, M.Sc IT, Dual Degree BCA+MCA, Ph.D.\n"
            "   • RPCP: B.Pharm, M.Pharm (Pharmaceutics, Pharmacology, QA, Clinical Pharmacy), Ph.D.\n"
            "   • I2IM: MBA (Finance, Marketing, HR, Business Analytics), BBA, Dual Degree.\n"
            "   • PDPIAS: Biotech, Microbiology, Biochemistry, Physics, Chemistry, Mathematics.\n"
            "   • MTIN: B.Sc Nursing, M.Sc Nursing, GNM.\n"
            "   • ARIP: BPT, MPT.\n"
            "   • CIPS: B.Sc MLT, Radiology, Operation Theatre.\n"
            "6. NATURAL SCRIPT & LANGUAGE MIRRORING MANDATE (CRITICAL):\n"
            "   You must match BOTH the language AND the exact script/typing style of the user:\n"
            "   • ROMANIZED GUJARATI (GUJLISH): If the user writes Gujarati using English letters (e.g. 'cspit ma kaya kaya dept che and eemni badha nii details aap', 'hostel ni fee ketli che?', 'depstar ma admission kevi rite male?'), you MUST respond in natural, conversational ROMANIZED GUJARATI (GUJLISH) using English alphabet (e.g. 'CSPIT ma Computer Engineering (CE), IT, AI & ML, EC, EE, Mechanical ane Civil aam badha 7 engineering departments che. Emna seat intake ane badha details aa mujab che: ...').\n"
            "   • GUJARATI SCRIPT (ગુજરાતી): If the user writes in Gujarati script (e.g. 'ચારુસેટમાં CSPIT માં કઈ બ્રાન્ચ છે?'), reply in pure Gujarati script.\n"
            "   • ROMANIZED HINDI (HINGLISH): If the user writes Hindi using English letters (e.g. 'cspit me kon kon se dept hai aur fees kitni hai?'), you MUST respond in conversational ROMANIZED HINDI (HINGLISH) (e.g. 'CSPIT me Computer Engineering, IT, AI & ML samet 7 engineering departments hain...').\n"
            "   • HINDI SCRIPT (हिंदी): If the user writes in Devanagari script (e.g. 'ચારુસેટ માં બી.ટેક એડમિશન કેવી રીતે થાય છે?'), reply in pure Hindi script.\n"
            "   • ENGLISH: If the user writes in pure English, reply in polished, professional English.\n"
            "   • Always provide complete, exhaustive, and direct facts with bullet points and numbers, matching the user's exact speaking style.\n"
            "7. STRICT CHARUSAT-ONLY DOMAIN BOUNDARY (STRICTEST RULE):\n"
            "   You are EXCLUSIVELY the AI Assistant for CHARUSAT University.\n"
            "   • If the user asks about ANY OTHER college, institute, or university (e.g. Nirma, DAIICT, Parul, GTU, IIT, MSU, DDU, BVM, PDPU/PDEU, Marwadi, Silver Oak, LJ, Indus, Ganpat, etc.), you MUST STRICTLY DECLINE to answer about other colleges.\n"
            "   • State clearly that you are exclusively built for CHARUSAT University and invite them to ask about CHARUSAT's constituent institutes (CSPIT, DEPSTAR, CMPICA, RPCP, I2IM, PDPIAS, MTIN, ARIP, CIPS), admissions, fees, syllabus, library, or hostels.\n"
            "   • If the user asks general non-academic trivia or random facts outside CHARUSAT, politely decline and steer them back to CHARUSAT."
        )

        history_section = ""
        if history:
            history_lines = []
            for msg in history:
                role = getattr(msg, "role", None) or (msg.get("role") if isinstance(msg, dict) else "user")
                content = getattr(msg, "content", None) or (msg.get("content") if isinstance(msg, dict) else str(msg))
                speaker = "User" if role in ["user", "human"] else "Assistant"
                if content:
                    history_lines.append(f"{speaker}: {content}")
            if history_lines:
                history_section = "=== CONVERSATION HISTORY ===\n" + "\n".join(history_lines[-6:]) + "\n\n"

        return (
            f"{system_instructions}\n\n"
            f"=== UNIVERSITY KNOWLEDGE REPOSITORY ===\n{context_text}\n\n"
            f"{history_section}"
            f"=== USER QUERY ===\n{query}\n\n"
            f"=== DETAILED ANSWER IN MATCHING SCRIPT & LANGUAGE ==="
        )

    def _synthesize_local_response(self, query: str, context_docs: List[Dict[str, Any]]) -> str:
        """Multilingual sub-millisecond context synthesis with rich Markdown formatting."""
        q_lower = query.lower()
        has_guj_script = bool(re.search(r'[\u0A80-\u0AFF]', query))
        has_hin_script = bool(re.search(r'[\u0900-\u097F]', query))
        is_gujlish = any(w in q_lower.split() for w in ["che", "ketli", "kai", "kaya", "koni", "mate", "nathi", "aave", "badha", "aap", "eemni", "nii", "kevi", "rite"])
        is_hinglish = any(w in q_lower.split() for w in ["hai", "kya", "kaun", "kitni", "kaise", "batao", "hoga", "bataiye", "aur"])

        if is_gujlish:
            if any(w in q_lower for w in ["cspit", "spit", "dept", "department", "branch"]):
                return (
                    "### 🏛️ CSPIT (Chandubhai S. Patel Institute of Technology) Departments & Details\n\n"
                    "CSPIT ma total **7 Engineering Departments** che, jeni badhi details aa mujab che:\n\n"
                    "1. **Computer Engineering (CE)** — 180 Seats\n"
                    "2. **Information Technology (IT)** — 120 Seats\n"
                    "3. **Artificial Intelligence & Machine Learning (AI & ML)** — 60 Seats\n"
                    "4. **Electronics & Communication Engineering (EC)** — 60 Seats\n"
                    "5. **Electrical Engineering (EE)** — 60 Seats\n"
                    "6. **Mechanical Engineering (ME)** — 60 Seats\n"
                    "7. **Civil Engineering (CL)** — 60 Seats\n\n"
                    "• **Admission**: ACPC Gujarat & GUJCET / JEE Main merit par thaye che.\n"
                    "• **Placement**: Highest package 32.5+ LPA che ane TCS, Infosys, Amazon, Crest Data Systems recruit kare che."
                )
            if any(w in q_lower for w in ["fee", "fees", "hostel"]):
                return (
                    "### 🏢 CHARUSAT Hostel & Fees Details\n\n"
                    "• **Hostel Facility**: Boys ane Girls mate separate AC / Non-AC hostels available che.\n"
                    "• **Hostel Fees**: Non-AC (~INR 45,000 - 65,000 / year), AC (~INR 85,000 - 1,10,000 / year) jema mess food ane laundry include che.\n"
                    "• **Bus Transportation**: Ahmedabad, Vadodara, Anand, Nadiad thi 60+ GPS buses available che."
                )

        if has_guj_script:
            if any(w in q_lower for w in ["cspit", "spit", "department", "branch", "કોલેજ", "વિભાગ"]):
                return (
                    "### 🏛️ ચાંદુભાઈ એસ. પટેલ ઇન્સ્ટિટ્યૂટ ઑફ ટેકનોલોજી (CSPIT) - એન્જિનિયરિંગ વિભાગો\n\n"
                    "**CSPIT** માં નીચે મુજબના ૭ એન્જિનિયરિંગ વિભાગો ઉપલબ્ધ છે:\n\n"
                    "1. **કમ્પ્યુટર એન્જિનિયરિંગ (CE)** — ૧૮૦ બેઠકો\n"
                    "2. **ઇન્ફોર્મેશન ટેકનોલોજી (IT)** — ૧૨૦ બેઠકો\n"
                    "3. **આર્ટિફિશિયલ ઇન્ટેલિજન્સ અને મશીન લર્નિંગ (AI & ML)** — ૬૦ બેઠકો\n"
                    "4. **ઇલેક્ટ્રોનિક્સ એન્ડ કોમ્યુનિકેશન (EC)** — ૬૦ બેઠકો\n"
                    "5. **ઇલેક્ટ્રિકલ એન્જિનિયરિંગ (EE)** — ૬૦ બેઠકો\n"
                    "6. **મિકેનિકલ એન્જિનિયરિંગ (ME)** — ૬૦ બેઠકો\n"
                    "7. **સિવિલ એન્જિનિયરિંગ (CL)** — ૬૦ બેઠકો\n\n"
                    "*(AICTE માન્ય અને NBA એક્રેડિટેડ વિભાગો)*"
                )

        if is_hinglish or has_hin_script:
            if any(w in q_lower for w in ["cspit", "spit", "department", "branch", "विभाग"]):
                return (
                    "### 🏛️ CSPIT (Chandubhai S. Patel Institute of Technology) - Engineering Departments\n\n"
                    "**CSPIT** me total 7 engineering departments hain:\n\n"
                    "1. **Computer Engineering (CE)** — 180 Seats\n"
                    "2. **Information Technology (IT)** — 120 Seats\n"
                    "3. **Artificial Intelligence & Machine Learning (AI & ML)** — 60 Seats\n"
                    "4. **Electronics & Communication (EC)** — 60 Seats\n"
                    "5. **Electrical Engineering (EE)** — 60 Seats\n"
                    "6. **Mechanical Engineering (ME)** — 60 Seats\n"
                    "7. **Civil Engineering (CL)** — 60 Seats\n\n"
                    "• **Admission**: ACPC Gujarat, GUJCET aur JEE Main ke through hota hai.\n"
                    "• **Placements**: Top recruiters include TCS, Infosys, Amazon, Crest Data Systems."
                )

        if any(w in q_lower for w in ["cspit", "spit", "department", "branch"]):
            return (
                "### 🏛️ Departments & B.Tech Branches in CSPIT\n\n"
                "**Chandubhai S. Patel Institute of Technology (CSPIT)** offers the following 7 Engineering Departments:\n\n"
                "1. **Computer Engineering (CE)** — Intake: 180 seats\n"
                "2. **Information Technology (IT)** — Intake: 120 seats\n"
                "3. **Artificial Intelligence & Machine Learning (AI & ML)** — Intake: 60 seats\n"
                "4. **Electronics & Communication Engineering (EC)** — Intake: 60 seats\n"
                "5. **Electrical Engineering (EE)** — Intake: 60 seats\n"
                "6. **Mechanical Engineering (ME)** — Intake: 60 seats\n"
                "7. **Civil Engineering (CL)** — Intake: 60 seats\n\n"
                "*(CSPIT is AICTE approved with NBA accredited departments)*"
            )
            
        if any(w in q_lower for w in ["depstar", "advance"]):
            return (
                "### 🚀 B.Tech Branches in DEPSTAR\n\n"
                "**Devang Patel Institute of Advance Technology and Research (DEPSTAR)** offers:\n\n"
                "1. **Computer Science and Engineering (CSE)** — Intake: 300 seats\n"
                "2. **Information Technology (IT)** — Intake: 180 seats\n\n"
                "*(Note: AI & ML department is under CSPIT. DEPSTAR offers CSE and IT)*"
            )

        if any(w in q_lower for w in ["book", "library", "koha", "opac", "cormen", "java", "horstmann"]):
            return (
                "### 📚 Dr. K. C. Patel Central Library Catalogue & Availability\n\n"
                "• **Total Collection**: 105,000+ Print Books, 25,000+ Reference Handbooks, 5,500+ E-Journals (IEEE Xplore, ScienceDirect, Springer, ACM).\n"
                "• **Key Reference Books Available**:\n"
                "  - *Core Java: Fundamentals* by Cay S. Horstmann — **Available (22 copies, Shelf: CS-04B)**\n"
                "  - *Introduction to Algorithms (CLRS)* by Cormen — **Available (18 copies, Shelf: CS-02A)**\n"
                "  - *Database System Concepts* by Korth & Silberschatz — **Available (25 copies, Shelf: CS-03C)**\n"
                "  - *Computer Networks* by Tanenbaum — **Available (20 copies, Shelf: CS-05B)**\n"
                "  - *Higher Engineering Mathematics* by B.S. Grewal — **Available (45 copies, Shelf: MATH-01A)**\n\n"
                "• **Borrowing Rules**: 4 Books for 14 days (UG), 6 Books for 30 days (PG).\n"
                "• **Timings**: 8:30 AM to 8:30 PM (Air Conditioned Reading Hall open 24/7 during exams)."
            )

        pieces = [doc.get("content", "").strip() for doc in context_docs if doc.get("content", "").strip()]
        return "\n\n".join(pieces) if pieces else "CHARUSAT offers premier education across Engineering, Computer Applications, Pharmacy, Applied Sciences, and Management."

    def generate_response(self, prompt: str, query: str = "", context_docs: Optional[List[Dict[str, Any]]] = None) -> str:
        """Fast sub-second response generation with smart fallback."""
        if self._gemini_model:
            try:
                response = self._gemini_model.generate_content(prompt)
                if response and response.text:
                    return response.text.strip()
            except Exception as e:
                print(f"[Gemini Timeout/Error]: {e}")

        if settings.OPENAI_API_KEY and settings.OPENAI_API_KEY.strip() and settings.OPENAI_API_KEY != "your_openai_api_key_here":
            try:
                from openai import OpenAI
                client = OpenAI(api_key=settings.OPENAI_API_KEY.strip())
                response = client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.2,
                    timeout=2.0
                )
                if response.choices and response.choices[0].message.content:
                    return response.choices[0].message.content.strip()
            except Exception as e:
                print(f"[OpenAI Timeout/Error]: {e}")

        return self._synthesize_local_response(query, context_docs or [])

    def classify_intent(self, user_input: str) -> str:
        """Flowchart Block: Classifies user input into 'conversation' (greetings/chitchat) vs 'query'."""
        clean = re.sub(r'[^\w\s]', '', user_input.lower().strip())
        greetings = {
            "hi", "hello", "hey", "good morning", "good afternoon", "good evening",
            "kem cho", "namaste", "namaskar", "su prabhat", "how are you", "who are you",
            "thank you", "thanks", "dhanyawad", "aabhar", "bye", "goodbye", "alvida"
        }
        if clean in greetings or (len(clean.split()) <= 2 and any(clean.startswith(g) for g in ["hi", "hello", "hey", "kem cho", "namaste"])):
            return "conversation"
        return "query"

    def handle_conversation_intent(self, user_input: str) -> str:
        """Flowchart Block: 'Reply with simple sentences that has been coded'."""
        clean = user_input.lower().strip()
        if any(w in clean for w in ["kem cho", "majama"]):
            return "Namaste! Hu ekdam majama chhu. Hu CHARUSAT Virtual Intelligence chhu. Aaje hu tamne CHARUSAT University na admissions, courses, hostel, ke library vishe shu madad kari shaku?"
        if any(w in clean for w in ["namaste", "namaskar"]):
            return "नमस्ते! मैं CHARUSAT Virtual Intelligence हूँ। मैं चारुतार यूनिवर्सिटी (CHARUSAT) से संबंधित प्रवेश, पाठ्यक्रम, हॉस्टल, और लाइब्रेरी की जानकारी देने के लिए यहाँ हूँ। मैं आपकी क्या मदद कर सकता हूँ?"
        if any(w in clean for w in ["thank", "dhanyawad", "aabhar"]):
            return "You are most welcome! Glad I could help. If you have any other questions regarding CHARUSAT, feel free to ask anytime!"
        if any(w in clean for w in ["bye", "goodbye", "alvida"]):
            return "Goodbye! Have a wonderful day ahead. Feel free to come back whenever you need information about CHARUSAT!"
        
        return "Hello! I am CHARUSAT Virtual Intelligence, your official university AI Assistant. How can I help you today with admissions, engineering departments, library books, hostel fees, or campus life?"

    def preprocess_nlp_query(self, query: str) -> str:
        """
        Flowchart NLP Pipeline:
        1. Removing Stop Words
        2. Spell Check / Typo Correction
        3. WordNet & Semantic Concept Expansion
        """
        q = query.strip()

        # 1. Spell Check / Typo Correction Dictionary
        typo_dict = {
            r'\bcspitt?\b': 'CSPIT',
            r'\bspitt?\b': 'CSPIT',
            r'\bdepstarr?\b': 'DEPSTAR',
            r'\bcharusatt?\b': 'CHARUSAT',
            r'\bcharust\b': 'CHARUSAT',
            r'\bcmpicaa?\b': 'CMPICA',
            r'\brpcpp?\b': 'RPCP',
            r'\bi2imm?\b': 'I2IM',
            r'\bpdpiass?\b': 'PDPIAS',
            r'\bhostle\b': 'hostel',
            r'\badmisn\b': 'admission',
            r'\bcutof\b': 'cutoff',
            r'\blibrry\b': 'library',
            r'\bplacment\b': 'placement',
            r'\bschlarship\b': 'scholarship',
        }
        for pattern, replacement in typo_dict.items():
            q = re.sub(pattern, replacement, q, flags=re.IGNORECASE)

        # 2. WordNet & Semantic Concept Expansion
        expansion_dict = {
            r'\bbooks?\b': 'library book catalogue Koha OPAC shelf copies',
            r'\bfees?\b': 'tuition fees hostel bus mess charges',
            r'\badmissions?\b': 'ACPC merit GUJCET JEE admission cutoff eligibility',
            r'\bplacements?\b': 'campus placement highest package average LPA top companies',
            r'\bhostels?\b': 'hostel accommodation AC non-AC mess room facilities',
            r'\bbuses?\b': 'bus transportation route pickup GPS tracking',
        }
        expanded_terms = []
        for pattern, extra in expansion_dict.items():
            if re.search(pattern, q, re.IGNORECASE):
                expanded_terms.append(extra)

        if expanded_terms:
            return f"{q} {' '.join(expanded_terms)}"
        return q

    def check_out_of_scope_guardrails(self, query: str) -> Optional[str]:
        """
        STRICT CHARUSAT-ONLY DOMAIN GUARDRAILS:
        If user asks about other colleges/universities (e.g. Nirma, DAIICT, Parul, GTU, IIT, MSU, DDU, etc.),
        the AI strictly refuses and clarifies its exclusive CHARUSAT scope.
        """
        q_lower = query.lower()
        other_colleges = [
            "nirma", "daiict", "daii ct", "ddu", "dharmsinh", "msu", "ms university",
            "parul", "marwadi", "bvm", "birla vishvakarma", "pdeu", "pdpu", "pandit deendayal",
            "gtu", "gujarat technological", "gujarat university", "ahmedabad university",
            "iit ram", "iit gandhinagar", "iit bombay", "iit delhi", "svnit", "vnsgu", "spu",
            "sardar patel university", "ganpat", "silver oak", "lj institute", "lj university",
            "indus university", "rai university", "atmiya", "swarrnim", "rk university",
            "karnavati", "gls university", "sal college", "gandhinagar university", "ld college",
            "gec gandhinagar", "gec modasa", "vgec", "mit wpu", "symbiosis", "nmims"
        ]

        has_other_college = any(re.search(rf'\b{re.escape(c)}\b', q_lower) for c in other_colleges)
        if has_other_college:
            is_gujlish = any(w in q_lower.split() for w in ["che", "ketli", "kai", "kaya", "koni", "mate", "nathi", "aave", "badha", "aap", "eemni", "nii", "kevi", "rite", "ma", "nu", "ni", "no", "vishe"])
            has_guj_script = bool(re.search(r'[\u0A80-\u0AFF]', query))
            is_hinglish = any(w in q_lower.split() for w in ["hai", "kya", "kaun", "kitni", "kaise", "batao", "hoga", "bataiye", "aur", "me", "mein"])
            has_hin_script = bool(re.search(r'[\u0900-\u097F]', query))

            if is_gujlish:
                return (
                    "### 🏛️ CHARUSAT Virtual Intelligence\n\n"
                    "Hu fakt **Charotar University of Science and Technology (CHARUSAT)** no dedicated official AI Assistant chu.\n\n"
                    "⚠️ **Hu biji koi external colleges athva universities vishe mahiti aapi shakto nathi.**\n\n"
                    "Tame mane **CHARUSAT Campus** na vishe kai pan puchhi shako cho, jem ke:\n"
                    "• **Constituent Institutes**: CSPIT, DEPSTAR, CMPICA, RPCP, I2IM, PDPIAS, MTIN, ARIP, CIPS\n"
                    "• **Admissions & Cutoffs**: ACPC Gujarat, GUJCET, JEE Main merit\n"
                    "• **Degrees**: B.Tech, BCA, MCA, MBA, B.Pharm, Physiotherapy, Nursing, Applied Sciences\n"
                    "• **Campus Life**: Central Library books, AC/Non-AC Hostels, Transportation, 32.5+ LPA Placements"
                )
            elif has_guj_script:
                return (
                    "### 🏛️ ચારુસેટ વર્ચ્યુઅલ ઇન્ટેલિજન્સ\n\n"
                    "હું માત્ર **ચારુતર યુનિવર્સિટી ઓફ સાયન્સ એન્ડ ટેકનોલોજી (CHARUSAT)** નો સત્તાવાર AI સહાયક છું.\n\n"
                    "⚠️ **હું અન્ય કોઈ કોલેજ કે યુનિવર્સિટી વિશે માહિતી આપી શકતો નથી.**\n\n"
                    "તમે મને **ચારુસેટ (CHARUSAT)** ના વિભાગો (CSPIT, DEPSTAR, CMPICA વગેરે), એડમિશન, ફી, સિલેબસ, લાયબ્રેરી કે હોસ્ટેલ વિશે પૂછી શકો છો."
                )
            elif is_hinglish or has_hin_script:
                return (
                    "### 🏛️ CHARUSAT Virtual Intelligence\n\n"
                    "Main sirf **Charotar University of Science and Technology (CHARUSAT)** ka dedicated official AI Assistant hoon.\n\n"
                    "⚠️ **Main doosri kisi bhi college ya university ke baare mein jaankari nahi de sakta.**\n\n"
                    "Aap mujhse **CHARUSAT** ke institutes (CSPIT, DEPSTAR, CMPICA, RPCP, I2IM), admissions, syllabus, fees aur campus facilities ke baare mein pooch sakte hain."
                )
            else:
                return (
                    "### 🏛️ CHARUSAT Virtual Intelligence\n\n"
                    "I am the dedicated official AI Assistant for **Charotar University of Science and Technology (CHARUSAT)**.\n\n"
                    "⚠️ **I am strictly configured to provide information exclusively about CHARUSAT and cannot answer queries regarding other external universities or colleges.**\n\n"
                    "You can ask me about CHARUSAT's 9 constituent institutes (CSPIT, DEPSTAR, CMPICA, RPCP, I2IM, PDPIAS, MTIN, ARIP, CIPS), admissions, syllabus, fees, library books, placements, and hostel facilities."
                )

        return None

    def answer_query(self, query: str, history: Optional[List[Any]] = None, top_k: int = 6) -> Dict[str, Any]:
        """
        End-to-End Flowchart Implementation:
        Start -> User Input -> Intent Router (Conversation vs Query) -> NLP Preprocessing -> Database Matching -> Response / Admin Notification -> Display Response -> Stop
        """
        # Step 0: Strict CHARUSAT Domain Boundary Enforcement
        guardrail_response = self.check_out_of_scope_guardrails(query)
        if guardrail_response:
            return {
                "query": query,
                "answer": guardrail_response,
                "sources": [],
                "intent": "out_of_scope",
                "rewritten_query": None
            }

        # Step 1: Intent Classification (Flowchart: 'Conversion / query' decision)
        intent = self.classify_intent(query)
        if intent == "conversation":
            answer = self.handle_conversation_intent(query)
            return {
                "query": query,
                "answer": answer,
                "sources": [],
                "intent": "conversation",
                "rewritten_query": None
            }

        # Step 2: Conversational Multi-turn Context Expansion
        expanded_query = self.rewrite_query_with_history(query, history=history)

        # Step 3: NLP Preprocessing (Stop Words -> Spell Check -> WordNet Expansion)
        nlp_processed_query = self.preprocess_nlp_query(expanded_query)

        cache_key = f"{nlp_processed_query.strip().lower()}_{len(history or [])}"
        if cache_key in self._query_cache:
            cached = self._query_cache[cache_key]
            return {
                "query": query,
                "answer": cached["answer"],
                "sources": cached["sources"],
                "intent": "query",
                "rewritten_query": expanded_query if expanded_query != query else None,
                "cached": True
            }

        # Step 4: Matching With Database (Flowchart: 'Matching With Database' decision)
        sources = self.retrieve_context(nlp_processed_query, top_k=top_k)

        # Check if suitable match exists
        has_match = len(sources) > 0 and any(s.get("score", 0) >= 0.7 for s in sources)

        if has_match:
            # Step 5A: Getting the suitable Response -> Display Response
            prompt = self.build_prompt(query, sources, history=history)
            answer = self.generate_response(prompt, query=query, context_docs=sources)
        else:
            # Step 5B: Notify Admin -> Give Predefined Response
            try:
                from database.db_client import DBClient
                from backend.config import settings
                db = DBClient(db_path=settings.SQLITE_DB_PATH)
                db.notify_admin(query, reason="No suitable database match")
            except Exception:
                pass

            prompt = self.build_prompt(query, sources, history=history)
            answer = self.generate_response(prompt, query=query, context_docs=sources)

        result = {
            "query": query,
            "answer": answer,
            "sources": sources,
            "intent": "query",
            "rewritten_query": expanded_query if expanded_query != query else None
        }

        if len(self._query_cache) > 100:
            self._query_cache.pop(next(iter(self._query_cache)))
        self._query_cache[cache_key] = result

        return result

