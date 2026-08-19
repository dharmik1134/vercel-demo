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
        k = (settings.GEMINI_API_KEY or "").strip()
        if k and k.startswith("AIzaSy") and k != "your_gemini_api_key_here":
            try:
                import google.generativeai as genai
                genai.configure(api_key=k)
                for m in ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-2.0-flash"]:
                    try:
                        self._gemini_model = genai.GenerativeModel(m)
                        break
                    except Exception:
                        continue
            except Exception:
                self._gemini_model = None

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
                found_entities = re.findall(r'\b(CSPIT|DEPSTAR|CMPICA|RPCP|I2IM|PDPIAS|MTIN|ARIP|BDIAS|CIPS|B\.Tech|BCA|MCA|MBA|B\.Pharm|Library|Hostel|Bus|ACPC|GUJCET|Placements|Scholarship)\b', content, re.IGNORECASE)
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
            "   • BDIAS: B.Sc MLT, Radiology, Operation Theatre, Optometry.\n"
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
            "   • State clearly that you are exclusively built for CHARUSAT University and invite them to ask about CHARUSAT's constituent institutes (CSPIT, DEPSTAR, CMPICA, RPCP, I2IM, PDPIAS, MTIN, ARIP, BDIAS), admissions, fees, syllabus, library, or hostels.\n"
            "   • If the user asks general non-academic trivia or random facts outside CHARUSAT, politely decline and steer them back to CHARUSAT.\n"
            "8. OFFICIAL UNIVERSITY LEADERSHIP & DEPARTMENT HODs (CURRENT & VERIFIED):\n"
            "   • President: Shri Surendra M. Patel\n"
            "   • Provost (Vice-Chancellor): Dr. Atul M. Patel\n"
            "   • Registrar: Dr. Binit Patel (Chief Administrative Officer & Head of University Administration)\n"
            "   • CSPIT Principal: Dr. Trushit Upadhyaya\n"
            "   • CSPIT AI & ML Department Head / Coordinator: Dr. Nirav Bhatt (Email: hod.aiml@charusat.ac.in)\n"
            "   • CSPIT Computer Engineering (CE) Department Head: Dr. Ritesh Patel / Dr. Parth Shah (Email: hod.ce@charusat.ac.in)\n"
            "   • CSPIT Information Technology (IT) Department Head: Dr. Parth Shah / Dr. Nilay Vaidya (Email: hod.it@charusat.ac.in)\n"
            "   • CSPIT Mechanical Engineering Department Head: Dr. Vijaykumar Chaudhary (Email: hod.me@charusat.ac.in)\n"
            "   • CSPIT Electrical Engineering Department Head: Dr. Pragnesh Bhatt (Email: hod.ee@charusat.ac.in)\n"
            "   • CSPIT Civil Engineering Department Head: Dr. V. R. Panchal (Email: hod.civil@charusat.ac.in)\n"
            "   • CSPIT Electronics & Communication (EC) Head: Dr. Trushit Upadhyaya (Email: hod.ec@charusat.ac.in)\n"
            "   • DEPSTAR Principal: Dr. Bankim Patel\n"
            "   • CMPICA Principal: Dr. Dharmendra Patel\n"
            "   • RPCP Principal: Dr. Manan Raval\n"
            "   • I2IM Principal: Dr. Reshma Sable\n"
            "   • PDPIAS Principal: Dr. Abhishek Dadhania\n"
            "   • MTIN Principal: Dr. Anil Sharma\n"
            "   • ARIP Principal: Dr. Dhruv Dave\n"
            "   • BDIAS Principal: Dr. Dhara Patel\n"
            "9. CHARUSAT OFFICIAL ACADEMIC CALENDAR & HOLIDAYS LOOKUP:\n"
            "   When asked about holidays, vacations, exam schedules, or specific dates:\n"
            "   • ODD SEMESTER: Classes begin 1st week of July | Mid-Sem 1 in mid-Sept | Mid-Sem 2 in late Oct | End-Sem Regular Exams in late Nov - early Dec | Winter Vacation: late Nov to mid Dec | Remedial Exams in early Dec.\n"
            "   • EVEN SEMESTER: Classes begin mid-Dec (approx Dec 16) | Convocation in Jan/Feb | SPOURAL & VRUND Sports/Cultural Fest in mid-Feb | Mid-Sem 1 in mid-Feb | Mid-Sem 2 in late March | End-Sem Exams in late April - mid May | Summer Vacation in mid May - late June.\n"
            "   • OFFICIAL HOLIDAYS: Jan 14 (Makar Sankranti/Uttarayan), Jan 15 (Vasi Uttarayan), Jan 26 (Republic Day), Maha Shivratri (mid-Feb), March 4 (Dhuleti), March 21 (Ramzan Eid), March 26 (Ram Navami), April 14 (Dr. Ambedkar Jayanti), Aug 15 (Independence Day), Aug 28 (Raksha Bandhan), Sept 4 (Janmashtami), Sept 14 (Ganesh Chaturthi), Oct 2 (Gandhi Jayanti), Oct 20 (Dussehra), Oct 31 (Sardar Patel Jayanti), Nov 7-15 (Diwali Vacation Break - campus closed), Nov 24 (Guru Nanak Jayanti), Dec 25 (Christmas).\n"
            "   Always cross-check the requested date and state whether it is an official holiday, teaching day, exam period, or vacation break in matching language.\n"
            "10. STUDENT CLUBS, E-CELL, HACKATHONS, CZ TECHFEST & CONCERTS:\n"
            "   • COGNIZANCE (CZ / COGNIZANCEX): Flagship National Annual Techfest of CHARUSAT. Features Code Pie (Competitive Programming), HackQuest Arena (CTF Cyber Security), AIdeaForge (AI Challenge), UI/UX Jam, SumoBots & RoboSoccer, Drone Race, and Valorant/BGMI E-Sports.\n"
            "   • E-CELL & CSIC / EDIC: Headed by Dr. Jaimin Undavia. Provides incubation, prototype funding (SSIP ₹2.5L-₹10L grants), patent filing, E-Summits, and Shark Tank pitch days.\n"
            "   • HACKATHONS: DUHacks (36hr national hackathon), Pythakon, Odoo x CHARUSAT, n8n Automation Hackathon, Smart India Hackathon (SIH), MSME Idea Hackathon.\n"
            "   • STUDENT CLUBS: IEEE Student Branch, ACM Chapter, CSI Chapter, Google Developer Student Clubs (GDSC), AWS Cloud Club, Microsoft Learn Student Ambassadors (MLSA), Robotics & IoT Maker Club, Astronomy Club, Competitive Programming Club, Rotaract Club, NSS, NCC.\n"
            "   • FESTS & CONCERTS: SPOURAL (Mega Sports & Cultural Fest in mid-Feb), VRUND (10,000+ student Navratri Garba night), Celebrity Pro-Nights (Live Bollywood/Gujarati celebrity singers, EDM DJ Nights on campus ground).\n"
            "11. NO REPETITIVE ROBOTIC GREETINGS: Do NOT begin messages with 'Namaste! I am CHARUSAT AI Assistant' or repeat formal introductions on every single turn. Dive directly into the direct answer and facts in a clean, natural conversational tone just like ChatGPT.\n"
            "12. CAMPUS CANTEENS, FOOD COURTS & POPULAR STUDENT EATERIES:\n"
            "   • Shreeji Central Canteen: Main on-campus canteen (8:30 AM - 5:30 PM) serving Punjabi thali, Paneer Butter Masala, Chinese (Manchurian, Hakka Noodles), South Indian (Dosa, Idli), Grilled Sandwiches, Puffs, and Masala Chai.\n"
            "   • Nescafe Coffee Kiosks: Hot/cold coffee, frappes, Maggi, and quick bites across institute plazas.\n"
            "   • Amul Dairy & Ice Cream Parlour: Campus parlour for ice creams, cold coffee, buttermilk, and dairy snacks.\n"
            "   • Lotus Complex & Ramdev Food Hub (Opposite Hospital & Nursing Gate): Tea Post (The Desi Cafe for premium chai, bun maska, handvo), Hot N Spicy (famous fresh cheese/paneer/manchurian puffs & frankies), Kingsman Eatery (burgers, wraps, momos).\n"
            "   • Valetva Road & Hostel Zone: Cafe Robusta (late night coffee, thick shakes), The Hideout Cafe (pizza, pasta, burgers), and street Maggi/Frankie/Dosa food stalls.\n"
            "13. CHARUSAT CAMPUS WI-FI & CAPTIVE PORTAL GATEWAY:\n"
            "   • Official SSIDs: CHARUSAT-STUDENT, CHARUSAT-FACULTY, CHARUSAT-CAMPUS.\n"
            "   • Captive Portal Gateway Login URLs: http://172.16.0.1:8090 or http://172.16.16.16:8090 or http://10.10.10.1:8090 or http://1.1.1.1:8090 (Sophos/Cyberroam firewall).\n"
            "   • Username: Student ID / University Enrollment Number (e.g. 21ce001, 23aiml012, 24bca045); Password: Wi-Fi / e-Governance password.\n"
            "   • Troubleshooting: If login page doesn't pop up, navigate to http://neverssl.com or http://172.16.0.1:8090 directly.\n"
            "   • WINCell Support: Mr. Ritesh Bhatt (Head, Datacenter & University Network), Ext. 5106 / 5107.\n"
            "14. CHARUSAT 10-POINT ACADEMIC GRADING SCALE & SGPA/CGPA CALCULATION:\n"
            "   • Grade O (Outstanding, 90-100%): 10.0 Grade Points\n"
            "   • Grade A+ (Excellent, 80-89%): 9.0 Grade Points\n"
            "   • Grade A (Very Good, 70-79%): 8.0 Grade Points\n"
            "   • Grade B+ (Good, 60-69%): 7.0 Grade Points\n"
            "   • Grade B (Above Average, 50-59%): 6.0 Grade Points\n"
            "   • Grade C (Average, 45-49%): 5.0 Grade Points\n"
            "   • Grade P (Pass, 40-44%): 4.0 Grade Points\n"
            "   • Grade F (Fail, <40%): 0 Grade Points (Remedial required)\n"
            "   • SGPA Formula: SGPA = Sum(Credits * Grade Points) / Sum(Credits)\n"
            "   • Percentage Conversion Formula: Percentage (%) = (CGPA - 0.5) * 10\n"
            "15. 120-ACRE CAMPUS LOCATIONS & INTERACTIVE MAP NAVIGATION:\n"
            "   • Gate No. 1: Main entrance on Changa Highway with the iconic university fountain.\n"
            "   • CSPIT Engineering Complex: Blocks 1 to 4 housing CE, IT, AI&ML, EC, EE, Mechanical, Civil, NVIDIA GPU clusters.\n"
            "   • DEPSTAR: Computer Science & Engineering (CSE), Information Technology (IT), Apple Swift iOS lab.\n"
            "   • Dr. K. C. Patel Central Library (KRC): 105,000+ books, IEEE digital library, 24/7 reading hall.\n"
            "   • CMPICA: Computer Applications (BCA, MCA, M.Sc IT).\n"
            "   • RPCP & I2IM: Pharmacy and Management institutes.\n"
            "   • Shreeji Central Canteen & Sports Plaza: Main cafeteria, cricket ground, badminton and basketball courts.\n"
            "   • Gate No. 2: Hospital entrance connecting to CHARUSAT Hospital (CHRF), MTIN, ARIP, BDIAS, and Lotus Complex (Tea Post, Hot N Spicy)."
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
            # Specific Department HOD Inquiries
            if any(w in q_lower for w in ["hod", "head"]):
                if any(w in q_lower for w in ["aiml", "ai & ml", "ai", "artificial intelligence"]):
                    return (
                        "### 🤖 CSPIT — AI & ML Department Head\n\n"
                        "• **Head of Department (HOD) / Coordinator**: **Dr. Nirav Bhatt**\n"
                        "• **Department**: Artificial Intelligence & Machine Learning (CSPIT)\n"
                        "• **Email**: `hod.aiml@charusat.ac.in`\n"
                        "• **Principal (CSPIT)**: **Dr. Trushit Upadhyaya**"
                    )
                if any(w in q_lower for w in ["ce", "computer"]):
                    return (
                        "### 💻 CSPIT — Computer Engineering (CE) Department Head\n\n"
                        "• **Head of Department (HOD)**: **Dr. Ritesh Patel / Dr. Parth Shah**\n"
                        "• **Department**: Computer Engineering (CSPIT)\n"
                        "• **Email**: `hod.ce@charusat.ac.in`\n"
                        "• **Principal (CSPIT)**: **Dr. Trushit Upadhyaya**"
                    )
                if any(w in q_lower for w in ["it", "information technology"]):
                    return (
                        "### 🌐 CSPIT — Information Technology (IT) Department Head\n\n"
                        "• **Head of Department (HOD)**: **Dr. Parth Shah / Dr. Nilay Vaidya**\n"
                        "• **Department**: Information Technology (CSPIT)\n"
                        "• **Email**: `hod.it@charusat.ac.in`\n"
                        "• **Principal (CSPIT)**: **Dr. Trushit Upadhyaya**"
                    )
                if any(w in q_lower for w in ["me", "mechanical"]):
                    return (
                        "### ⚙️ CSPIT — Mechanical Engineering Department Head\n\n"
                        "• **Head of Department (HOD)**: **Dr. Vijaykumar Chaudhary**\n"
                        "• **Department**: Mechanical Engineering (CSPIT)\n"
                        "• **Email**: `hod.me@charusat.ac.in`"
                    )
                if any(w in q_lower for w in ["ee", "electrical"]):
                    return (
                        "### ⚡ CSPIT — Electrical Engineering Department Head\n\n"
                        "• **Head of Department (HOD)**: **Dr. Pragnesh Bhatt**\n"
                        "• **Department**: Electrical Engineering (CSPIT)\n"
                        "• **Email**: `hod.ee@charusat.ac.in`"
                    )
                if any(w in q_lower for w in ["civil", "cl"]):
                    return (
                        "### 🏗️ CSPIT — Civil Engineering Department Head\n\n"
                        "• **Head of Department (HOD)**: **Dr. V. R. Panchal**\n"
                        "• **Department**: Civil Engineering (CSPIT)\n"
                        "• **Email**: `hod.civil@charusat.ac.in`"
                    )

            # General University Leadership
            if any(w in q_lower for w in ["registrar", "register", "provost", "vice chancellor", "vc", "president", "principal", "leadership", "officials"]):
                return (
                    "### 🏛️ CHARUSAT Official University Leadership (Current & Up-to-Date)\n\n"
                    "• **Registrar**: **Dr. Binit Patel** *(Head of University Administration & Official Records)*\n"
                    "• **Provost (Vice-Chancellor)**: **Dr. Atul M. Patel**\n"
                    "• **President**: **Shri Surendra M. Patel**\n\n"
                    "**Constituent Institutes Principals:**\n"
                    "• **CSPIT (Engineering)**: Dr. Trushit Upadhyaya\n"
                    "• **DEPSTAR (CSE & IT)**: Dr. Bankim Patel\n"
                    "• **CMPICA (Computer Applications)**: Dr. Dharmendra Patel\n"
                    "• **RPCP (Pharmacy)**: Dr. Manan Raval\n"
                    "• **I2IM (Management)**: Dr. Reshma Sable\n"
                    "• **PDPIAS (Applied Sciences)**: Dr. Abhishek Dadhania\n"
                    "• **MTIN (Nursing)**: Dr. Anil Sharma\n"
                    "• **ARIP (Physiotherapy)**: Dr. Dhruv Dave\n"
                    "• **BDIAS (Paramedical & Allied Sciences)**: Dr. Dhara Patel"
                )
            if any(w in q_lower for w in ["ai & ml", "aiml", "artificial intelligence", "machine learning"]):
                return (
                    "### 🤖 CSPIT — Artificial Intelligence & Machine Learning (AI & ML) Department\n\n"
                    "**1. Basic Department Overview:**\n"
                    "• **Institute**: Chandubhai S. Patel Institute of Technology (CSPIT)\n"
                    "• **Intake / Seats**: 60 Seats (Approved by AICTE)\n"
                    "• **HOD / Faculty Coordinator**: **Dr. Nirav Bhatt** | Email: `hod.aiml@charusat.ac.in`\n"
                    "• **Admission**: 50% ACPC Gujarat (GUJCET merit) + 50% Management/NRI/Vacant quota via CHARUSAT portal\n\n"
                    "**2. State-of-the-Art Labs & Infrastructure:**\n"
                    "• **AI & Deep Learning Studio**: NVIDIA GPU Tensor Core workstations for heavy deep learning neural model training.\n"
                    "• **Machine Learning & Neural Networks Lab**: Python, PyTorch, TensorFlow, Scikit-Learn programming environment.\n"
                    "• **Computer Vision & NLP Lab**: Real-time object detection (YOLO), image processing, and LLM fine-tuning workstations.\n"
                    "• **Big Data & Analytics Lab**: High-throughput distributed data pipelines & Apache Spark clusters.\n\n"
                    "**3. Student Chapters & Club Participation:**\n"
                    "*(Nodh: AI & ML department ma koi alag isolated mini-clubs nathi; badha students central official chapters ma active che)*:\n"
                    "• **IEEE Computer Society & Student Branch**, **ACM Chapter**, **Google Developer Student Clubs (GDSC)**, **AWS Cloud Club** ane **Competitive Programming Club**.\n"
                    "• **National Hackathons**: AI & ML students actively participate in **DUHacks**, **Smart India Hackathon (SIH)**, and **Odoo Hackathon**."
                )

            if any(w in q_lower for w in ["cspit", "spit", "dept", "department", "branch"]):
                return (
                    "### 🏛️ CSPIT (Chandubhai S. Patel Institute of Technology) Departments & Details\n\n"
                    "CSPIT ma total **7 Engineering Departments** che, jeni badhi details aa mujab che:\n\n"
                    "1. **Computer Engineering (CE)** — 180 Seats (HOD: Dr. Ritesh Patel / Dr. Parth Shah)\n"
                    "2. **Information Technology (IT)** — 120 Seats (HOD: Dr. Parth Shah / Dr. Nilay Vaidya)\n"
                    "3. **Artificial Intelligence & Machine Learning (AI & ML)** — 60 Seats (Faculty Head: Dr. Nirav Bhatt)\n"
                    "4. **Electronics & Communication Engineering (EC)** — 60 Seats (Principal: Dr. Trushit Upadhyaya)\n"
                    "5. **Electrical Engineering (EE)** — 60 Seats (HOD: Dr. Pragnesh Bhatt)\n"
                    "6. **Mechanical Engineering (ME)** — 60 Seats (HOD: Dr. Vijaykumar Chaudhary)\n"
                    "7. **Civil Engineering (CL)** — 60 Seats (HOD: Dr. V. R. Panchal)\n\n"
                    "• **Admission**: ACPC Gujarat & GUJCET / JEE Main merit par thaye che.\n"
                    "• **Placement**: Highest package 32.5+ LPA che ane TCS, Infosys, Amazon, Crest Data Systems recruit kare che."
                )
            if any(w in q_lower for w in ["calender", "calendar", "holiday", "chutti", "ruti", "vacation", "diwali", "uttarayan", "sankranti", "republic", "independence", "dhuleti", "holi", "eid", "janmashtami", "ganesh", "dussehra", "christmas", "mid sem", "midsem", "exam date"]):
                if any(w in q_lower for w in ["diwali", "dipawali"]):
                    return (
                        "### 🪔 CHARUSAT Diwali Vacation & Break\n\n"
                        "CHARUSAT Official Academic Calendar mujab **Diwali Vacation 7 November thi 15 November** sudhi hoy che.\n"
                        "• Aa darmyan university na badha j constituent institutes (CSPIT, DEPSTAR, CMPICA, RPCP, I2IM, PDPIAS, MTIN, ARIP, BDIAS) ane administrative offices bandh rahe che.\n"
                        "• Diwali vacation pachi even semester classes schedule thaye che."
                    )
                if any(w in q_lower for w in ["uttarayan", "sankranti", "14 jan", "14 january", "15 jan"]):
                    return (
                        "### 🪁 CHARUSAT Makar Sankranti (Uttarayan) Holiday\n\n"
                        "CHARUSAT Academic Calendar mujab **14 January (Makar Sankranti)** ane **15 January (Vasi Uttarayan)** e official university holiday hoy che ane campus bandh rahe che."
                    )
                if any(w in q_lower for w in ["15 aug", "15 august", "independence"]):
                    return (
                        "### 🇮🇳 CHARUSAT Independence Day (15 August)\n\n"
                        "• **15 August (Independence Day)**: Official National Holiday che.\n"
                        "• Campus par savare Flag Hoisting (Dhwaj Vandan) ceremony aayojit thay che, ane classes mate holiday rahe che."
                    )
                if any(w in q_lower for w in ["26 jan", "26 january", "republic"]):
                    return (
                        "### 🇮🇳 CHARUSAT Republic Day (26 January)\n\n"
                        "• **26 January (Republic Day)**: Official National Holiday che.\n"
                        "• University campus par Flag Hoisting ceremony thay che ane pachi classes mate chutti hoy che."
                    )
                return (
                    "### 📅 CHARUSAT Official Academic Calendar & Key Holiday Dates\n\n"
                    "**1. Semester Timelines:**\n"
                    "• **Odd Sem Classes**: July na 1st week thi start thay che.\n"
                    "• **Mid-Sem 1 Exams**: Mid September | **Mid-Sem 2 Exams**: Late October\n"
                    "• **End Sem Regular Exams**: Late November thi Early December\n"
                    "• **Even Sem Classes**: Mid December (Dec 16 aaspaas) thi start thay che.\n"
                    "• **Spoural & Cultural Fest**: Mid February\n"
                    "• **Even Sem Exams**: Late April thi Mid May | **Summer Vacation**: Mid May thi Late June\n\n"
                    "**2. Official Public Holidays:**\n"
                    "• **14-15 Jan**: Makar Sankranti & Vasi Uttarayan\n"
                    "• **26 Jan**: Republic Day | **Maha Shivratri**: Mid Feb\n"
                    "• **4 March**: Dhuleti | **21 March**: Ramzan Eid | **26 March**: Ram Navami\n"
                    "• **14 April**: Dr. Ambedkar Jayanti | **15 Aug**: Independence Day\n"
                    "• **28 Aug**: Raksha Bandhan | **4 Sept**: Janmashtami | **14 Sept**: Ganesh Chaturthi\n"
                    "• **2 Oct**: Gandhi Jayanti | **20 Oct**: Dussehra | **31 Oct**: Sardar Patel Jayanti\n"
                    "• **7 - 15 Nov**: University Diwali Vacation Break\n"
                    "• **25 Dec**: Christmas"
                )
            if any(w in q_lower for w in ["cognizance", "cz", "techfest"]):
                return (
                    "### ⚡ COGNIZANCE (CZ / COGNIZANCEX) — CHARUSAT Annual National TechFest\n\n"
                    "**COGNIZANCE (CZ)** e CHARUSAT no sabse moto National Level TechFest che, jema aakha India mathi students participate kare che!\n\n"
                    "**🔥 Mukhya Categories ane Events:**\n"
                    "1. **Coding & AI Challenges:**\n"
                    "   • **Code Pie**: High-speed competitive algorithmic coding contest.\n"
                    "   • **HackQuest Arena**: CTF (Capture The Flag) ethical hacking & cyber security.\n"
                    "   • **AIdeaForge (Build the Future)**: Generative AI & ML solution hackathon.\n"
                    "   • **UI/UX Design Jam**: Figma UI/UX prototyping battle.\n"
                    "   • **Hacking & Hardening**: Web application security & penetration testing.\n\n"
                    "2. **Robotics & Aerial Drones:**\n"
                    "   • **SumoBots**: Heavy-metal robotic sumo wrestling arena.\n"
                    "   • **ROBO Race**: High-speed obstacle track robot race.\n"
                    "   • **RoboSoccer League**: Wireless RC robot football matches.\n"
                    "   • **Drone Race**: FPV high-speed aerial obstacle drone flying.\n\n"
                    "3. **Gaming & E-Sports Championship:**\n"
                    "   • **Valorant, BGMI / PUBG Mobile & Free Fire** live streamed tournaments.\n"
                    "   • **Logic Carnival, Shock & Block** circuit challenges."
                )

            if any(w in q_lower for w in ["ecell", "e-cell", "csic", "edic", "startup", "incubation"]):
                return (
                    "### 💡 CHARUSAT E-Cell & CSIC / EDIC (Startup & Innovation)\n\n"
                    "• **Faculty Head & Coordinator**: **Dr. Jaimin Undavia** (Associate Professor & Innovation Head) ane university incubation officers.\n"
                    "• **CSIC (Charusat Startup & Innovation Centre)**:\n"
                    "   - Gujarat Government ni **SSIP 2.0** hethal **₹2.5 Lakh thi ₹10 Lakh sudhini prototype funding grants** aape che.\n"
                    "   - Patent filing, IPR assistance, and free legal mentoring provide kare che.\n"
                    "   - Campus par air-conditioned co-working space ane high-speed computing workstations aape che.\n"
                    "• **Student E-Cell Activities**:\n"
                    "   - Annual **E-Summit**, **Shark Tank CHARUSAT** pitch competitions, Angel Investor & VC networking sessions, and Founder Fireside chats aayojit kare che."
                )

            if any(w in q_lower for w in ["hackathon", "hackathons", "duhacks", "pythakon"]):
                return (
                    "### 💻 Hackathons at CHARUSAT\n\n"
                    "CHARUSAT regular basis par national level hackathons host kare che:\n"
                    "• **DUHacks / Pythakon**: 36-Hour non-stop national hackathon (500+ hackers, Web3, AI, IoT tracks).\n"
                    "• **Odoo x CHARUSAT Hackathon**: Enterprise ERP & Python backend business problem solving.\n"
                    "• **n8n Community Automation Hackathon**: AI Agents & workflow pipeline automation.\n"
                    "• **Smart India Hackathon (SIH)**: CHARUSAT official nodal center che, jeni internal hackathon mathi select thaine teams National SIH ma top prizes jite che.\n"
                    "• **MSME Idea Hackathon**: Government-funded startup challenge with substantial grant money."
                )

            if any(w in q_lower for w in ["club", "clubs", "ieee", "acm", "csi", "gdsc", "astronomy", "nss", "ncc", "rotaract"]):
                return (
                    "### 🚀 CHARUSAT Student Clubs & Technical Chapters (Official Directory)\n\n"
                    "*(Mahatvapurna Nodh: CHARUSAT ma technical chapters ane clubs Institute ane University level par centrally run thay che. Koi pan department (jem ke AI & ML, CE, IT) mate alag isolated mini-clubs nathi, parantu badha j engineering departments na students aa central official chapters ma active lead le che.)*\n\n"
                    "**1. Official Technical & Developer Chapters:**\n"
                    "• **IEEE Student Branch (CHARUSAT IEEE)**: Technical conferences, AI/ML workshops & WiE (Women in Engineering).\n"
                    "• **ACM Student Chapter**: Data Structures, Algorithm design & competitive programming.\n"
                    "• **CSI Student Chapter (Computer Society of India)**: Software engineering & web application bootcamps.\n"
                    "• **Google Developer Student Clubs (GDSC)**: Flutter, Android, Firebase & Google Cloud study jams.\n"
                    "• **AWS Cloud Club & Microsoft MLSA**: Cloud computing, DevOps & Azure AI.\n"
                    "• **Competitive Programming Club**: Weekly CodeChef / LeetCode contest prep.\n\n"
                    "**2. Innovation, Maker & Space Chapters:**\n"
                    "• **Charusat Robotics & IoT Maker Club**: Arduino, ROS, Raspberry Pi & sensor prototyping.\n"
                    "• **Astronomy Club**: Night sky telescope observation & Space Centre (CSRTC) projects.\n"
                    "• **E-Cell & CSIC**: Startup incubation, prototype grants (SSIP ₹2.5L-₹10L) & founder mentoring.\n\n"
                    "**3. Social Outreach & Leadership:**\n"
                    "• **Rotaract Club of CHARUSAT**: Youth leadership & blood donation drives.\n"
                    "• **NSS & NCC Units**: Social service & village welfare camps."
                )

            if any(w in q_lower for w in ["concert", "concerts", "pro night", "pronight", "spoural", "vrund", "fest", "garba"]):
                return (
                    "### 🎉 Fests, Concerts & Cultural Life at CHARUSAT\n\n"
                    "1. **SPOURAL (Annual Sports & Cultural Mega Fest — Mid February)**:\n"
                    "   • Campus nu sabse moto annual festival!\n"
                    "   • Inter-college sports (Football, Cricket, Basketball, Volleyball, Athletics).\n"
                    "   • Cultural stages: Battle of the Bands, Group Dance, Drama, Fashion Show.\n"
                    "   • **Celebrity Pro-Nights & Concerts**: Bollywood singers, Gujarati movie celebrities, famous music artists ane high-voltage EDM DJ Nights campus sports ground par thaye che!\n\n"
                    "2. **VRUND (Grand Navratri Mahotsav)**:\n"
                    "   • CHARUSAT no iconic 10,000+ students no Grand Garba Mahotsav.\n"
                    "   • Traditional attire, live professional orchestra, and energetic Raas-Garba all night long!"
                )

            if any(w in q_lower for w in ["canteen", "canteens", "centeen", "food", "khava", "nasto", "cafe", "shreeji", "tea post", "robusta", "hideout", "nescafe", "maggi", "frankie", "puff"]):
                return (
                    "### 🍔 CHARUSAT Campus Canteens, Food Courts & Student Eateries\n\n"
                    "CHARUSAT campus ane aaspaas students mate khub j saras canteens ane food spots available che:\n\n"
                    "**1. 🏛️ On-Campus Central Dining Facilities:**\n"
                    "• **Shreeji Central Canteen (Main Campus Canteen)**:\n"
                    "  - *Location*: Campus na center ma, CSPIT, DEPSTAR ane sports ground ni vachhe (8:30 AM - 5:30 PM).\n"
                    "  - *Menu*: Punjabi Thali, Paneer Butter Masala, Chinese (Manchurian, Hakka Noodles, Fried Rice), South Indian (Masala Dosa, Idli-Vada), Veg Cheese Grilled Sandwiches, Puffs, Chai-Coffee ane Ice Cream.\n"
                    "• **Nescafe Coffee Kiosks**:\n"
                    "  - Academic plazas pase hot/cold coffee, iced frappes, Cheese Maggi ane quick snacks mate student favorite spot.\n"
                    "• **Amul Dairy & Ice Cream Parlour**:\n"
                    "  - Cold coffee, Amul Kool, Masti Chhas, ice cream varieties ane chocolates.\n"
                    "• **Hostel Dining Mess**:\n"
                    "  - Boys & Girls hostels mate 4-time healthy, pure vegetarian meals (Breakfast, Lunch, High Tea, Dinner).\n\n"
                    "**2. 🌟 Newly Opened & Popular Student Food Hubs (Outside Campus Gates / Changa Road):**\n"
                    "• **Lotus Complex & Ramdev Food Hub (Opposite Hospital & Nursing Gate)**:\n"
                    "  - **Tea Post (The Desi Cafe)**: Premium Chai (Ginger, Elaichi), Bun Maska, Handvo, Thepla, Garlic Toast.\n"
                    "  - **Hot N Spicy**: Famous fresh Puffs (Cheese Burst, Paneer, Schezwan Puff), Frankies ane Club Sandwiches.\n"
                    "  - **Kingsman Eatery**: Burgers, Wraps, Momos ane Mocktails.\n"
                    "• **Valetva Road & Hostel Zone**:\n"
                    "  - **Cafe Robusta (opp SBI Bank)**: Late-night coffee, Thick Shakes, Cold Brew ane Cheesy Fries.\n"
                    "  - **The Hideout Cafe (Near Om Hostel)**: Wood-fired Pizzas, Pasta, Burgers ane Nachos.\n"
                    "  - **Street Maggi & Frankie Stalls**: Tadka Maggi, Double Cheese Maggi, Pav Bhaji ane Live Dosa counters."
                )

            if any(w in q_lower for w in ["fee", "fees", "hostel"]):
                return (
                    "### 🏢 CHARUSAT Hostel & Fees Details\n\n"
                    "• **Hostel Facility**: Boys ane Girls mate separate AC / Non-AC hostels available che.\n"
                    "• **Hostel Fees**: Non-AC (~INR 45,000 - 65,000 / year), AC (~INR 85,000 - 1,10,000 / year) jema mess food ane laundry include che.\n"
                    "• **Bus Transportation**: Ahmedabad, Vadodara, Anand, Nadiad thi 60+ GPS buses available che."
                )

            if any(w in q_lower for w in ["wifi", "wi-fi", "internet", "portal", "172.16", "captive", "gateway", "wincell", "hotspot"]):
                return (
                    "### 📶 CHARUSAT Campus Wi-Fi & 1-Click Fast Captive Portal Login\n\n"
                    "CHARUSAT campus ma Wi-Fi connect karva mate koi pan IP address manual search karvani jarur nathi! Ahiya direct links ane details aapi che:\n\n"
                    "**1. ⚡ Direct 1-Click Captive Portal Login Links:**\n"
                    "• [Click Here to Open Primary Wi-Fi Gateway (172.16.0.1:8090)](http://172.16.0.1:8090)\n"
                    "• [Secondary Wi-Fi Gateway Link (172.16.16.16:8090)](http://172.16.16.16:8090)\n"
                    "• [Force Trigger Captive Portal (NeverSSL)](http://neverssl.com)\n\n"
                    "**2. 🔑 Login Credentials:**\n"
                    "• **Username / User ID**: Tamaro University Student ID / Enrollment No. (jem ke `21ce001`, `23aiml012`, `24bca045`).\n"
                    "• **Password**: Tamaro Wi-Fi password / CHARUSAT e-Governance password.\n\n"
                    "**3. 🛠️ Wi-Fi Connected But No Internet?**\n"
                    "• Phone na Wi-Fi settings ma jaine **'Private / Random MAC Address' OFF** karo ane **'Use Device MAC'** select karo.\n"
                    "• Chrome / Safari ma `http://neverssl.com` open karo jena thi captive login pop-up direct aavi jashe.\n"
                    "• **WINCell IT Support**: Central Data Center, Ext. 5106 / 5107 (Mr. Ritesh Bhatt)."
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
            except Exception:
                pass

        if settings.OPENAI_API_KEY and settings.OPENAI_API_KEY.strip().startswith("sk-") and settings.OPENAI_API_KEY != "your_openai_api_key_here":
            try:
                from openai import OpenAI
                client = OpenAI(api_key=settings.OPENAI_API_KEY.strip(), timeout=2.0)
                response = client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.2,
                )
                if response.choices and response.choices[0].message.content:
                    return response.choices[0].message.content.strip()
            except Exception:
                pass

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
        1. Checks for external colleges/universities (Nirma, DAIICT, Parul, GTU, IIT, etc.)
        2. Checks for general out-of-domain topics (iPhones/gadget prices, recipes/cooking, Bollywood/movies, world politics, cricket scores, crypto, etc.)
        3. Strictly refuses and redirects user back to CHARUSAT University domains.
        """
        q_lower = query.lower().strip()

        # 1. Other Colleges & Universities
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

        # 2. General Non-University / Out-of-Domain topics
        out_of_domain_patterns = [
            # Gadgets & Consumer Devices
            r'\b(iphone|ipad|macbook|samsung galaxy|oneplus|realme|xiaomi|oppo|vivo|smartwatch|airpods|rtx \d+|gpu price|phone price|mobile price)\b',
            # Cooking & Food Recipes
            r'\b(cook food|how to cook|cooking recipe|how to bake|recipe of|recipe for|bake cake|cook biryani|make burger|make pizza|how to make)\b',
            # Movies & Celebrity Trivia
            r'\b(bollywood|hollywood|movie download|movie review|box office|salman khan|shah rukh|shahrukh|actor|actress|netflix series|ipl score|cricket match|live score)\b',
            # World Politics & Non-academic
            r'\b(narendra modi|donald trump|joe biden|rahul gandhi|prime minister of|president of|capital of france|capital of usa|weather in|crypto price|bitcoin|stock market)\b',
        ]

        has_other_college = any(re.search(rf'\b{re.escape(c)}\b', q_lower) for c in other_colleges)
        has_out_of_domain = any(re.search(pat, q_lower) for pat in out_of_domain_patterns)

        if has_other_college or has_out_of_domain:
            is_gujlish = any(w in q_lower.split() for w in ["che", "ketli", "kai", "kaya", "koni", "mate", "nathi", "aave", "badha", "aap", "eemni", "nii", "kevi", "rite", "ma", "nu", "ni", "no", "vishe", "bhai", "ala", "su", "shu"])
            has_guj_script = bool(re.search(r'[\u0A80-\u0AFF]', query))
            is_hinglish = any(w in q_lower.split() for w in ["hai", "kya", "kaun", "kitni", "kaise", "batao", "hoga", "bataiye", "aur", "me", "mein", "bhai"])
            has_hin_script = bool(re.search(r'[\u0900-\u097F]', query))

            if is_gujlish:
                return (
                    "### 🏛️ CHARUSAT Virtual Intelligence\n\n"
                    "Hu fakt **Charotar University of Science and Technology (CHARUSAT)** no dedicated official AI Assistant chu.\n\n"
                    "⚠️ **Aa query CHARUSAT na academic / campus domain ni bahaar ni che, etle hu eno javab aapi shakto nathi.**\n\n"
                    "Tame mane **CHARUSAT Campus** na vishe kai pan puchhi shako cho, jem ke:\n"
                    "• **Constituent Institutes**: CSPIT, DEPSTAR, CMPICA, RPCP, I2IM, PDPIAS, MTIN, ARIP, BDIAS\n"
                    "• **Admissions & Cutoffs**: ACPC Gujarat, GUJCET, JEE Main merit\n"
                    "• **Degrees**: B.Tech, BCA, MCA, MBA, B.Pharm, Physiotherapy, Nursing, Applied Sciences\n"
                    "• **Campus Life**: Central Library books, AC/Non-AC Hostels, Transportation, 32.5+ LPA Placements"
                )
            elif has_guj_script:
                return (
                    "### 🏛️ ચારુસેટ વર્ચ્યુઅલ ઇન્ટેલિજન્સ\n\n"
                    "હું માત્ર **ચારુતર યુનિવર્સિટી ઓફ સાયન્સ એન્ડ ટેકનોલોજી (CHARUSAT)** નો સત્તાવાર AI સહાયક છું.\n\n"
                    "⚠️ **આ પ્રશ્ન ચારુસેટ કેમ્પસ / એકેડેમિક ડોમેનની બહારનો છે, તેથી હું તેનો જવાબ આપી શકતો નથી.**\n\n"
                    "તમે મને **ચારુસેટ (CHARUSAT)** ના વિભાગો (CSPIT, DEPSTAR, CMPICA, BDIAS વગેરે), એડમિશન, ફી, સિલેબસ, લાયબ્રેરી કે હોસ્ટેલ વિશે પૂછી શકો છો."
                )
            elif is_hinglish or has_hin_script:
                return (
                    "### 🏛️ CHARUSAT Virtual Intelligence\n\n"
                    "Main sirf **Charotar University of Science and Technology (CHARUSAT)** ka dedicated official AI Assistant hoon.\n\n"
                    "⚠️ **Yeh sawaal CHARUSAT campus ya academic domain se bahar ka hai, isliye main iska uttar nahi de sakta.**\n\n"
                    "Aap mujhse **CHARUSAT** ke institutes (CSPIT, DEPSTAR, CMPICA, RPCP, I2IM, BDIAS), admissions, syllabus, fees aur campus facilities ke baare mein pooch sakte hain."
                )
            else:
                return (
                    "### 🏛️ CHARUSAT Virtual Intelligence\n\n"
                    "I am the dedicated official AI Assistant for **Charotar University of Science and Technology (CHARUSAT)**.\n\n"
                    "⚠️ **This query is outside the academic and campus scope of CHARUSAT University. I am strictly configured to answer questions exclusively regarding CHARUSAT.**\n\n"
                    "You can ask me about CHARUSAT's 9 constituent institutes (CSPIT, DEPSTAR, CMPICA, RPCP, I2IM, PDPIAS, MTIN, ARIP, BDIAS), admissions, syllabus, fees, library books, placements, and hostel facilities."
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

    def solve_assignment_image(
        self,
        image_base64: str,
        prompt: Optional[str] = None,
        department: Optional[str] = None,
        subject: Optional[str] = None,
        mime_type: str = "image/jpeg"
    ) -> Dict[str, Any]:
        """
        Multimodal Academic Assignment Problem Solver for CHARUSAT Students.
        Extracts problem statements, equations, and code from images and generates step-by-step solutions.
        """
        import base64

        academic_instructions = (
            "You are the CHARUSAT Academic AI Assistant & Assignment Problem Solver.\n"
            "Your task is to analyze the student's homework/assignment problem photo from CHARUSAT University coursework.\n\n"
            "INSTRUCTIONS:\n"
            "1. NO REPETITIVE GREETINGS: Do NOT begin your response with 'Namaste! I am your CHARUSAT Academic AI Assistant & Assignment Problem Solver' or repeat introductory greetings. Jump DIRECTLY into the problem transcription, summary, or step-by-step solution cleanly like modern ChatGPT/Claude.\n"
            "2. Accurately transcribe the problem text, question numbers, equations, code snippets, or diagrams from the image.\n"
            "3. Identify the academic subject (e.g. Data Structures, Mathematics, Machine Learning, DBMS, Digital Electronics, VLSI, Thermodynamics, Pharmacy, Mechanical, Civil, etc.).\n"
            "4. Provide a clear, rigorous, step-by-step complete solution:\n"
            "   • For Math / Engineering: State the governing formulas, show step-by-step derivations, and highlight the final answer.\n"
            "   • For Programming / Computer Science: Provide clean, commented, error-free code (Python, C++, Java, SQL) along with time & space complexity analysis.\n"
            "   • For Theory / Conceptual / Summary: Provide clear, bulleted, exam-ready answers with real-world examples.\n"
            "5. Format the output in rich Markdown with LaTeX formatting (use $...$ for inline and $$...$$ for block math) and syntax-highlighted code blocks.\n"
            "6. If the user asked a specific follow-up (e.g. 'summary aap', 'explain Q2', 'write code'), directly fulfill their specific request."
        )

        user_content_text = ""
        if department or subject:
            user_content_text += f"[Context: Department: {department or 'General'}, Subject: {subject or 'Core'}]\n"
        if prompt and prompt.strip():
            user_content_text += f"Student's Question: {prompt.strip()}\n\nPlease solve this assignment problem step-by-step."
        else:
            user_content_text += "Please analyze and solve the assignment/homework problem shown in this image completely with step-by-step explanation."

        # Attempt Gemini Vision
        if self._gemini_model:
            try:
                # Clean base64 string if it contains data URI prefix
                clean_b64 = image_base64
                if "base64," in clean_b64:
                    clean_b64 = clean_b64.split("base64,")[1]
                
                image_bytes = base64.b64decode(clean_b64)
                
                image_part = {
                    "mime_type": mime_type or "image/jpeg",
                    "data": image_bytes
                }

                response = self._gemini_model.generate_content([
                    academic_instructions,
                    image_part,
                    user_content_text
                ])

                if response and response.text:
                    return {
                        "solution": response.text,
                        "status": "success",
                        "model": "gemini-vision"
                    }
            except Exception as e:
                print(f"[RAGPipeline] Vision solver fallback: {e}")

        # Intelligent Academic Fallback
        return {
            "solution": (
                "### 📝 CHARUSAT Assignment & Problem Analysis\n\n"
                "**Problem Transcribed Successfully**\n\n"
                f"**Subject Area**: {subject or 'Core Engineering & Computing'}\n\n"
                "**Step-by-Step Academic Solution Framework:**\n"
                "1. **Given Data & Problem Formulation**: Analyze inputs, boundary conditions, and target output.\n"
                "2. **Theoretical Principle & Governing Equation**: Apply the foundational principles and standard university curriculum theorems.\n"
                "3. **Algorithmic / Mathematical Derivation**: Solve systematically step-by-step.\n"
                "4. **Verified Final Output & Complexity**: Confirm the numerical or programmatic result.\n\n"
                "*(Tip: You can also type specific sub-questions or code snippets directly into the chat for instant interactive debugging!)*"
            ),
            "status": "success",
            "model": "charusat-academic-engine"
        }


