/**
 * ==============================================================================
 * CHARUSAT AI Assistant - Embeddable Floating Chat Widget
 * Official AI Intelligence for CHARUSAT University & e-Governance Portals
 * ==============================================================================
 */

(function () {
    if (window.CharusatAIWidgetLoaded) return;
    window.CharusatAIWidgetLoaded = true;

    // Detect base URL of script
    const currentScript = document.currentScript || (function() {
        const scripts = document.getElementsByTagName('script');
        return scripts[scripts.length - 1];
    })();

    let apiBase = "http://localhost:8000";
    if (currentScript && currentScript.src) {
        try {
            const scriptUrl = new URL(currentScript.src);
            apiBase = scriptUrl.origin;
        } catch (e) {
            apiBase = window.location.origin;
        }
    } else if (window.location.protocol.startsWith("http")) {
        apiBase = window.location.origin;
    }

    const CHAT_ENDPOINT = `${apiBase}/api/v1/chat`;

    // Inject Styles
    const style = document.createElement("style");
    style.id = "charusat-ai-widget-styles";
    style.innerHTML = `
        /* Root container */
        #charusat-widget-root {
            position: fixed;
            bottom: 24px;
            right: 24px;
            z-index: 999999;
            font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            -webkit-font-smoothing: antialiased;
        }

        /* Floating Trigger Button */
        .charusat-float-btn {
            position: relative;
            width: 62px;
            height: 62px;
            border-radius: 50%;
            background: linear-gradient(135deg, #004B87 0%, #0284c7 50%, #0ea5e9 100%);
            color: #ffffff;
            border: 2px solid rgba(255, 255, 255, 0.4);
            box-shadow: 0 8px 30px rgba(0, 75, 135, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.2);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
            outline: none;
        }

        .charusat-float-btn:hover {
            transform: scale(1.08) translateY(-3px);
            box-shadow: 0 12px 35px rgba(2, 132, 199, 0.6), 0 0 20px rgba(14, 165, 233, 0.5);
        }

        .charusat-float-btn:active {
            transform: scale(0.95);
        }

        .charusat-float-btn .icon-chat,
        .charusat-float-btn .icon-close {
            position: absolute;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .charusat-float-btn .icon-close {
            opacity: 0;
            transform: rotate(-90deg) scale(0.5);
        }

        .charusat-float-btn.active .icon-chat {
            opacity: 0;
            transform: rotate(90deg) scale(0.5);
        }

        .charusat-float-btn.active .icon-close {
            opacity: 1;
            transform: rotate(0) scale(1);
        }

        /* Pulse Ring */
        .charusat-pulse-ring {
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            border: 2px solid #38bdf8;
            animation: charusat-pulse 2.4s cubic-bezier(0.24, 0, 0.38, 1) infinite;
            pointer-events: none;
        }

        @keyframes charusat-pulse {
            0% { transform: scale(1); opacity: 0.9; }
            50% { transform: scale(1.4); opacity: 0.3; }
            100% { transform: scale(1.7); opacity: 0; }
        }

        /* Tooltip callout badge */
        .charusat-tooltip-badge {
            position: absolute;
            right: 74px;
            top: 50%;
            transform: translateY(-50%);
            background: rgba(15, 23, 42, 0.92);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            color: #ffffff;
            font-size: 13px;
            font-weight: 600;
            padding: 8px 14px;
            border-radius: 20px;
            white-space: nowrap;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
            border: 1px solid rgba(255, 255, 255, 0.15);
            pointer-events: none;
            opacity: 1;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .charusat-tooltip-badge .live-dot {
            width: 7px;
            height: 7px;
            background: #10b981;
            border-radius: 50%;
            box-shadow: 0 0 8px #10b981;
        }

        .charusat-float-btn.active + .charusat-tooltip-badge,
        .charusat-tooltip-badge.hide {
            opacity: 0;
            transform: translateY(-50%) translateX(10px);
            visibility: hidden;
        }

        /* Popup Chat Window */
        .charusat-chat-window {
            position: absolute;
            bottom: 80px;
            right: 0;
            width: 390px;
            max-width: calc(100vw - 32px);
            height: 600px;
            max-height: calc(100vh - 120px);
            background: #0f172a;
            border-radius: 24px;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.1);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            opacity: 0;
            visibility: hidden;
            transform: scale(0.9) translateY(20px);
            transform-origin: bottom right;
            transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
            color: #f8fafc;
        }

        .charusat-chat-window.open {
            opacity: 1;
            visibility: visible;
            transform: scale(1) translateY(0);
        }

        /* Chat Header */
        .charusat-chat-header {
            background: linear-gradient(135deg, #003666 0%, #004B87 50%, #0284c7 100%);
            padding: 16px 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 1px solid rgba(255, 255, 255, 0.12);
        }

        .charusat-header-info {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .charusat-avatar {
            width: 42px;
            height: 42px;
            border-radius: 12px;
            background: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            overflow: hidden;
        }

        .charusat-avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .charusat-title-wrap h4 {
            margin: 0;
            font-size: 15px;
            font-weight: 700;
            color: #ffffff;
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .charusat-title-wrap p {
            margin: 2px 0 0;
            font-size: 12px;
            color: #bae6fd;
            display: flex;
            align-items: center;
            gap: 5px;
        }

        .charusat-status-dot {
            width: 6px;
            height: 6px;
            background: #10b981;
            border-radius: 50%;
            display: inline-block;
            box-shadow: 0 0 6px #10b981;
        }

        .charusat-header-actions {
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .charusat-icon-btn {
            background: rgba(255, 255, 255, 0.15);
            border: none;
            color: #ffffff;
            width: 32px;
            height: 32px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .charusat-icon-btn:hover {
            background: rgba(255, 255, 255, 0.25);
            transform: scale(1.05);
        }

        /* University Motto / e-Governance Tag */
        .charusat-subbanner {
            background: rgba(2, 132, 199, 0.15);
            padding: 6px 16px;
            font-size: 11px;
            font-weight: 600;
            color: #38bdf8;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        /* Messages Body */
        .charusat-chat-body {
            flex: 1;
            padding: 16px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 14px;
            background: #090d16;
            scroll-behavior: smooth;
        }

        .charusat-chat-body::-webkit-scrollbar {
            width: 6px;
        }

        .charusat-chat-body::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.15);
            border-radius: 4px;
        }

        /* Message Bubble */
        .charusat-msg {
            display: flex;
            flex-direction: column;
            max-width: 86%;
            animation: charusat-msg-in 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes charusat-msg-in {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .charusat-msg.bot {
            align-self: flex-start;
        }

        .charusat-msg.user {
            align-self: flex-end;
        }

        .charusat-msg-content {
            padding: 12px 15px;
            border-radius: 18px;
            font-size: 13.5px;
            line-height: 1.5;
            word-break: break-word;
        }

        .charusat-msg.bot .charusat-msg-content {
            background: #1e293b;
            color: #f1f5f9;
            border-bottom-left-radius: 4px;
            border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .charusat-msg.user .charusat-msg-content {
            background: linear-gradient(135deg, #004B87 0%, #0284c7 100%);
            color: #ffffff;
            border-bottom-right-radius: 4px;
            box-shadow: 0 4px 15px rgba(2, 132, 199, 0.3);
        }

        .charusat-msg-time {
            font-size: 10.5px;
            color: #64748b;
            margin-top: 4px;
            padding: 0 4px;
        }

        .charusat-msg.user .charusat-msg-time {
            text-align: right;
        }

        /* Quick Suggestion Chips */
        .charusat-quick-chips {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            margin-top: 6px;
        }

        .charusat-chip {
            background: rgba(56, 189, 248, 0.12);
            color: #38bdf8;
            border: 1px solid rgba(56, 189, 248, 0.25);
            padding: 6px 11px;
            border-radius: 14px;
            font-size: 12px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .charusat-chip:hover {
            background: rgba(56, 189, 248, 0.25);
            border-color: #38bdf8;
            transform: translateY(-1px);
        }

        /* Typing Loader */
        .charusat-typing {
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 10px 14px;
            background: #1e293b;
            border-radius: 18px;
            border-bottom-left-radius: 4px;
            align-self: flex-start;
            border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .charusat-typing span {
            width: 6px;
            height: 6px;
            background: #38bdf8;
            border-radius: 50%;
            animation: charusat-bounce 1.2s infinite ease-in-out;
        }

        .charusat-typing span:nth-child(2) { animation-delay: 0.2s; }
        .charusat-typing span:nth-child(3) { animation-delay: 0.4s; }

        @keyframes charusat-bounce {
            0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
            30% { transform: translateY(-5px); opacity: 1; }
        }

        /* Chat Input Footer */
        .charusat-chat-footer {
            padding: 12px 14px;
            background: #0f172a;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .charusat-input-box {
            flex: 1;
            background: #1e293b;
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 20px;
            padding: 10px 14px;
            color: #ffffff;
            font-size: 13.5px;
            outline: none;
            transition: all 0.2s ease;
        }

        .charusat-input-box:focus {
            border-color: #38bdf8;
            box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.2);
        }

        .charusat-send-btn,
        .charusat-mic-btn {
            background: linear-gradient(135deg, #004B87, #0284c7);
            border: none;
            color: #ffffff;
            width: 38px;
            height: 38px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s ease;
            flex-shrink: 0;
        }

        .charusat-mic-btn {
            background: #1e293b;
            border: 1px solid rgba(255, 255, 255, 0.12);
        }

        .charusat-mic-btn.recording {
            background: #ef4444;
            color: #ffffff;
            animation: charusat-pulse 1.2s infinite;
        }

        .charusat-send-btn:hover {
            transform: scale(1.06);
            box-shadow: 0 4px 15px rgba(2, 132, 199, 0.4);
        }

        .charusat-send-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        /* Mobile responsiveness */
        @media (max-width: 480px) {
            #charusat-widget-root {
                bottom: 16px;
                right: 16px;
            }
            .charusat-chat-window {
                position: fixed;
                bottom: 0;
                right: 0;
                left: 0;
                top: 0;
                width: 100vw;
                height: 100vh;
                max-width: 100vw;
                max-height: 100vh;
                border-radius: 0;
            }
        }
    `;
    document.head.appendChild(style);

    // Create Widget DOM Structure
    const root = document.createElement("div");
    root.id = "charusat-widget-root";
    root.innerHTML = `
        <!-- Floating Trigger Button -->
        <button class="charusat-float-btn" id="charusat-trigger-btn" aria-label="Open CHARUSAT AI Assistant">
            <div class="charusat-pulse-ring"></div>
            <!-- Chat SVG Icon -->
            <svg class="icon-chat" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                <circle cx="9" cy="10" r="1" fill="currentColor"></circle>
                <circle cx="15" cy="10" r="1" fill="currentColor"></circle>
                <path d="M9.5 13.5c.5.5 1.5.5 2 0"></path>
            </svg>
            <!-- Close SVG Icon -->
            <svg class="icon-close" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>

        <!-- Tooltip Badge -->
        <div class="charusat-tooltip-badge" id="charusat-tooltip">
            <span class="live-dot"></span>
            Ask CHARUSAT AI
        </div>

        <!-- Popup Chat Window -->
        <div class="charusat-chat-window" id="charusat-chat-modal">
            <!-- Header -->
            <div class="charusat-chat-header">
                <div class="charusat-header-info">
                    <div class="charusat-avatar">
                        <img src="${apiBase}/logo.png" alt="CHARUSAT Logo" onerror="this.src='https://raw.githubusercontent.com/neevp5356-ship-it/CHARUSAT_AI_AGENT-/main/frontend/logo.png'">
                    </div>
                    <div class="charusat-title-wrap">
                        <h4>CHARUSAT AI <span style="font-size:10px; background:#0284c7; padding:2px 6px; border-radius:10px;">Official</span></h4>
                        <p><span class="charusat-status-dot"></span> Online | RAG University Bot</p>
                    </div>
                </div>
                <div class="charusat-header-actions">
                    <button class="charusat-icon-btn" id="charusat-clear-btn" title="Clear Chat">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                    <button class="charusat-icon-btn" id="charusat-close-modal-btn" title="Close">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
            </div>

            <!-- Subbanner -->
            <div class="charusat-subbanner">
                <span>🏛️ e-Governance Smart Assistant</span>
                <span>NAAC 'A+' | Changa</span>
            </div>

            <!-- Chat Messages Area -->
            <div class="charusat-chat-body" id="charusat-msg-container">
                <div class="charusat-msg bot">
                    <div class="charusat-msg-content">
                        Namaste! Hu **CHARUSAT University AI Assistant** chu. 🎓<br><br>
                        Tame mane e-Governance, Attendance, BDIAS/CSPIT/DEPSTAR departments, Exam timetable, Fees, ke Hostel vishe kai pan puchhi shako cho!
                        
                        <div class="charusat-quick-chips">
                            <button class="charusat-chip" data-q="Attendance criteria and 80% rule shu che?">📊 Attendance Rules</button>
                            <button class="charusat-chip" data-q="BDIAS paramedical ma kaya courses che?">🧪 BDIAS Courses</button>
                            <button class="charusat-chip" data-q="CSPIT CE & AI-ML department details aap">💻 CSPIT Depts</button>
                            <button class="charusat-chip" data-q="Mid Sem ane End Sem exam timetable kyare che?">📅 Exam Dates</button>
                        </div>
                    </div>
                    <span class="charusat-msg-time">Just now</span>
                </div>
            </div>

            <!-- Footer / Input -->
            <form class="charusat-chat-footer" id="charusat-input-form">
                <button type="button" class="charusat-mic-btn" id="charusat-mic" title="Voice Input">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                        <line x1="12" y1="19" x2="12" y2="23"></line>
                        <line x1="8" y1="23" x2="16" y2="23"></line>
                    </svg>
                </button>
                <input type="text" class="charusat-input-box" id="charusat-text-input" placeholder="Ask in Gujlish, Gujarati, English..." autocomplete="off" required />
                <button type="submit" class="charusat-send-btn" id="charusat-submit" title="Send">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                </button>
            </form>
        </div>
    `;

    document.body.appendChild(root);

    // State & References
    let chatHistory = [];
    const triggerBtn = document.getElementById("charusat-trigger-btn");
    const chatModal = document.getElementById("charusat-chat-modal");
    const tooltip = document.getElementById("charusat-tooltip");
    const closeBtn = document.getElementById("charusat-close-modal-btn");
    const clearBtn = document.getElementById("charusat-clear-btn");
    const msgContainer = document.getElementById("charusat-msg-container");
    const inputForm = document.getElementById("charusat-input-form");
    const textInput = document.getElementById("charusat-text-input");
    const micBtn = document.getElementById("charusat-mic");

    // Toggle Modal
    function toggleChat() {
        const isOpen = chatModal.classList.contains("open");
        if (isOpen) {
            chatModal.classList.remove("open");
            triggerBtn.classList.remove("active");
            tooltip.classList.remove("hide");
        } else {
            chatModal.classList.add("open");
            triggerBtn.classList.add("active");
            tooltip.classList.add("hide");
            textInput.focus();
            scrollToBottom();
        }
    }

    triggerBtn.addEventListener("click", toggleChat);
    closeBtn.addEventListener("click", toggleChat);

    // Auto hide tooltip after 7 seconds
    setTimeout(() => {
        if (tooltip) tooltip.classList.add("hide");
    }, 7000);

    // Scroll helper
    function scrollToBottom() {
        msgContainer.scrollTop = msgContainer.scrollHeight;
    }

    // Markdown Parser Helper
    function parseMarkdown(text) {
        if (!text) return "";
        let html = text
            .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
            .replace(/\*(.*?)\*/g, "<em>$1</em>")
            .replace(/`([^`]+)`/g, "<code style='background:rgba(255,255,255,0.1);padding:2px 5px;border-radius:4px;'>$1</code>")
            .replace(/\n\n/g, "<br><br>")
            .replace(/\n• /g, "<br>• ")
            .replace(/\n/g, "<br>");
        return html;
    }

    // Add Message to DOM
    function appendMessage(role, text) {
        const msgDiv = document.createElement("div");
        msgDiv.className = `charusat-msg ${role}`;
        
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        msgDiv.innerHTML = `
            <div class="charusat-msg-content">${parseMarkdown(text)}</div>
            <span class="charusat-msg-time">${timeStr}</span>
        `;
        msgContainer.appendChild(msgDiv);
        scrollToBottom();
    }

    // Show Typing Indicator
    function showTyping() {
        const typingDiv = document.createElement("div");
        typingDiv.className = "charusat-typing";
        typingDiv.id = "charusat-typing-indicator";
        typingDiv.innerHTML = `<span></span><span></span><span></span>`;
        msgContainer.appendChild(typingDiv);
        scrollToBottom();
    }

    function removeTyping() {
        const typingDiv = document.getElementById("charusat-typing-indicator");
        if (typingDiv) typingDiv.remove();
    }

    // Send Query to API
    async function sendQuery(queryText) {
        if (!queryText || !queryText.trim()) return;
        const q = queryText.trim();
        textInput.value = "";

        appendMessage("user", q);
        chatHistory.push({ role: "user", content: q });
        showTyping();

        try {
            const response = await fetch(CHAT_ENDPOINT, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: q, history: chatHistory.slice(-6) })
            });

            removeTyping();

            if (response.ok) {
                const data = await response.json();
                const answer = data.answer || "Khali charusat campus na vishe puchho.";
                appendMessage("bot", answer);
                chatHistory.push({ role: "assistant", content: answer });
            } else {
                appendMessage("bot", "⚠️ Network issue aave che, thodi vaar pachi try karo.");
            }
        } catch (err) {
            removeTyping();
            console.error("Widget API Error:", err);
            appendMessage("bot", "⚠️ Server connect nathi thai shakyu. Check if backend is running.");
        }
    }

    // Handle Form Submit
    inputForm.addEventListener("submit", function (e) {
        e.preventDefault();
        sendQuery(textInput.value);
    });

    // Quick Chip Clicks
    msgContainer.addEventListener("click", function (e) {
        const chip = e.target.closest(".charusat-chip");
        if (chip) {
            const q = chip.getAttribute("data-q");
            sendQuery(q);
        }
    });

    // Clear Chat
    clearBtn.addEventListener("click", function () {
        chatHistory = [];
        msgContainer.innerHTML = `
            <div class="charusat-msg bot">
                <div class="charusat-msg-content">
                    Chat history clear thai gayi che. Navi query puchho! 🎓
                </div>
                <span class="charusat-msg-time">Just now</span>
            </div>
        `;
    });

    // Web Speech API Voice Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "gu-IN"; // Gujarati / Indian English

        let isRecording = false;

        micBtn.addEventListener("click", function () {
            if (isRecording) {
                recognition.stop();
            } else {
                try {
                    recognition.start();
                    micBtn.classList.add("recording");
                    isRecording = true;
                } catch (e) {
                    console.warn("Speech start failed", e);
                }
            }
        });

        recognition.onresult = function (event) {
            const transcript = event.results[0][0].transcript;
            textInput.value = transcript;
            sendQuery(transcript);
        };

        recognition.onend = function () {
            micBtn.classList.remove("recording");
            isRecording = false;
        };

        recognition.onerror = function () {
            micBtn.classList.remove("recording");
            isRecording = false;
        };
    } else {
        if (micBtn) micBtn.style.display = "none";
    }

})();
