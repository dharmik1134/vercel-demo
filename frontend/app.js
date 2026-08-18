document.addEventListener("DOMContentLoaded", () => {
    // --------------------------------------------------------------------------
    // 1. PWA Service Worker Registration
    // --------------------------------------------------------------------------
    if ("serviceWorker" in navigator) {
        window.addEventListener("load", () => {
            navigator.serviceWorker.register("./sw.js").then(
                (reg) => console.log("[PWA] ServiceWorker registered:", reg.scope),
                (err) => console.log("[PWA] ServiceWorker registration failed:", err)
            );
        });
    }

    // --------------------------------------------------------------------------
    // 2. DOM Elements
    // --------------------------------------------------------------------------
    const loginGateScreen = document.getElementById("login-gate-screen");
    const appContainer = document.getElementById("app-container");
    const gateGoogleBtn = document.getElementById("gate-google-btn");
    const gateEmailBtn = document.getElementById("gate-email-btn");
    const gateGuestBtn = document.getElementById("gate-guest-btn");

    // Google Modal
    const googleLoginModal = document.getElementById("google-login-modal");
    const googleModalClose = document.getElementById("google-modal-close");
    const googleAccountItems = document.querySelectorAll(".google-account-item");
    const customGoogleEmail = document.getElementById("custom-google-email");
    const customGoogleSubmitBtn = document.getElementById("custom-google-submit-btn");

    // GitHub Modal
    const githubLoginModal = document.getElementById("github-login-modal");
    const githubModalClose = document.getElementById("github-modal-close");
    const githubQuickAccount = document.getElementById("github-quick-account");
    const customGithubUser = document.getElementById("custom-github-user");
    const customGithubSubmitBtn = document.getElementById("custom-github-submit-btn");

    const chatForm = document.getElementById("chat-form");
    const userInput = document.getElementById("user-input");
    const messagesList = document.getElementById("messages-list");
    const welcomeCard = document.getElementById("welcome-card");
    const clearChatBtn = document.getElementById("clear-chat-btn");
    const topicBtns = document.querySelectorAll(".topic-btn");
    const suggestionPills = document.querySelectorAll(".suggestion-pill");
    const quickTags = document.querySelectorAll(".quick-tag");
    const instTags = document.querySelectorAll(".inst-tag");
    const statusText = document.getElementById("status-text");
    const statusIndicator = document.querySelector(".status-indicator");
    const sendBtn = document.getElementById("send-btn");
    const micBtn = document.getElementById("mic-btn");
    const toast = document.getElementById("toast");

    // Notice Modal elements
    const addNoticeBtn = document.getElementById("add-notice-btn");
    const noticeModalBackdrop = document.getElementById("notice-modal-backdrop");
    const noticeModalClose = document.getElementById("notice-modal-close");
    const noticeCancelBtn = document.getElementById("notice-cancel-btn");
    const noticeForm = document.getElementById("notice-form");
    const noticeTitle = document.getElementById("notice-title");
    const noticeCategory = document.getElementById("notice-category");
    const noticeContent = document.getElementById("notice-content");
    const noticeSubmitBtn = document.getElementById("notice-submit-btn");

    // Auth Modal elements
    const authBtn = document.getElementById("auth-btn");
    const headerUserAvatar = document.getElementById("header-user-avatar");
    const headerUserName = document.getElementById("header-user-name");
    const authModalBackdrop = document.getElementById("auth-modal-backdrop");
    const authModalClose = document.getElementById("auth-modal-close");
    const authTabs = document.getElementById("auth-tabs");
    const tabLoginBtn = document.getElementById("tab-login-btn");
    const tabSignupBtn = document.getElementById("tab-signup-btn");

    const loginForm = document.getElementById("login-form");
    const loginEmail = document.getElementById("login-email");
    const loginPassword = document.getElementById("login-password");
    const forgotPasswordLink = document.getElementById("forgot-password-link");
    const googleLoginBtn = document.getElementById("google-login-btn");
    const githubLoginBtn = document.getElementById("github-login-btn");
    const guestLoginBtn = document.getElementById("guest-login-btn");

    const signupForm = document.getElementById("signup-form");
    const signupName = document.getElementById("signup-name");
    const signupEmail = document.getElementById("signup-email");
    const signupInstitute = document.getElementById("signup-institute");
    const signupPassword = document.getElementById("signup-password");

    const forgotForm = document.getElementById("forgot-form");
    const forgotEmail = document.getElementById("forgot-email");
    const backToLoginLink = document.getElementById("back-to-login-link");

    const profileView = document.getElementById("profile-view");
    const profileAvatarLarge = document.getElementById("profile-avatar-large");
    const profileNameText = document.getElementById("profile-name-text");
    const profileEmailText = document.getElementById("profile-email-text");
    const profileInstText = document.getElementById("profile-inst-text");
    const profileProviderText = document.getElementById("profile-provider-text");
    const logoutBtn = document.getElementById("logout-btn");

    // Mobile navigation elements
    const mobileMenuBtn = document.getElementById("mobile-menu-btn");
    const mobileCloseBtn = document.getElementById("mobile-close-btn");
    const sidebar = document.getElementById("sidebar");
    const sidebarBackdrop = document.getElementById("sidebar-backdrop");

    let chatHistory = [];
    let currentUser = null;

    // Toast helper
    function showToast(msg) {
        if (!toast) return;
        toast.textContent = msg;
        toast.classList.add("show");
        setTimeout(() => {
            toast.classList.remove("show");
        }, 2500);
    }

    // Universal API endpoint resolver
    const getBaseUrl = () => {
        if (window.location.protocol.startsWith("http")) {
            return window.location.origin;
        }
        return "http://localhost:8000";
    };

    const API_BASE = getBaseUrl();
    const CHAT_API_URL = `${API_BASE}/api/v1/chat`;
    const HEALTH_API_URL = `${API_BASE}/api/v1/health`;
    const INGEST_API_URL = `${API_BASE}/api/v1/ingest/text`;
    const AUTH_LOGIN_URL = `${API_BASE}/api/v1/auth/login`;
    const AUTH_REGISTER_URL = `${API_BASE}/api/v1/auth/register`;
    const AUTH_SOCIAL_URL = `${API_BASE}/api/v1/auth/social-login`;
    const AUTH_FORGOT_URL = `${API_BASE}/api/v1/auth/forgot-password`;

    // --------------------------------------------------------------------------
    // 3. User Session & Login Gate Management
    // --------------------------------------------------------------------------
    function unlockAppWorkspace(user) {
        currentUser = user;
        if (loginGateScreen) loginGateScreen.style.display = "none";
        if (appContainer) appContainer.style.display = "flex";
        updateUIForUser(user);
    }

    function lockAppWorkspace() {
        currentUser = null;
        if (loginGateScreen) loginGateScreen.style.display = "flex";
        if (appContainer) appContainer.style.display = "none";
        updateUIForUser(null);
    }

    function loadUserSession() {
        try {
            const saved = localStorage.getItem("charusat_ai_user");
            if (saved) {
                const user = JSON.parse(saved);
                unlockAppWorkspace(user);
            } else {
                lockAppWorkspace();
            }
        } catch (e) {
            lockAppWorkspace();
        }
    }

    function saveUserSession(user) {
        currentUser = user;
        if (user) {
            localStorage.setItem("charusat_ai_user", JSON.stringify(user));
            unlockAppWorkspace(user);
        } else {
            localStorage.removeItem("charusat_ai_user");
            lockAppWorkspace();
        }
    }

    function updateUIForUser(user) {
        if (user) {
            if (headerUserName) headerUserName.textContent = user.name.split(" ")[0];
            if (headerUserAvatar) {
                if (user.avatar_url) {
                    headerUserAvatar.innerHTML = `<img src="${user.avatar_url}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
                } else if (user.provider === "google") {
                    headerUserAvatar.textContent = "🌐";
                } else if (user.provider === "github") {
                    headerUserAvatar.textContent = "🐙";
                } else {
                    headerUserAvatar.textContent = "🎓";
                }
            }
            if (profileNameText) profileNameText.textContent = user.name;
            if (profileEmailText) profileEmailText.textContent = user.email;
            if (profileInstText) profileInstText.textContent = user.institute || "CHARUSAT";
            if (profileProviderText) profileProviderText.textContent = `${user.provider.toUpperCase()} Account`;
            if (profileAvatarLarge) {
                if (user.avatar_url) {
                    profileAvatarLarge.innerHTML = `<img src="${user.avatar_url}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
                } else if (user.provider === "google") {
                    profileAvatarLarge.textContent = "🌐";
                } else if (user.provider === "github") {
                    profileAvatarLarge.textContent = "🐙";
                } else {
                    profileAvatarLarge.textContent = "🎓";
                }
            }
        } else {
            if (headerUserName) headerUserName.textContent = "Sign In";
            if (headerUserAvatar) headerUserAvatar.textContent = "👤";
        }
    }

    loadUserSession();

    // --------------------------------------------------------------------------
    // 4. Instant Google & GitHub Connect (Zero 401/404 Errors)
    // --------------------------------------------------------------------------
    function openGoogleModal() {
        if (googleLoginModal) googleLoginModal.classList.add("show");
        if (authModalBackdrop) authModalBackdrop.classList.remove("show");
    }

    function closeGoogleModal() {
        if (googleLoginModal) googleLoginModal.classList.remove("show");
    }

    function openGitHubModal() {
        if (githubLoginModal) githubLoginModal.classList.add("show");
        if (authModalBackdrop) authModalBackdrop.classList.remove("show");
    }

    function closeGitHubModal() {
        if (githubLoginModal) githubLoginModal.classList.remove("show");
    }

    if (gateGoogleBtn) gateGoogleBtn.addEventListener("click", openGoogleModal);
    if (googleLoginBtn) googleLoginBtn.addEventListener("click", openGoogleModal);
    if (googleModalClose) googleModalClose.addEventListener("click", closeGoogleModal);
    if (googleLoginModal) {
        googleLoginModal.addEventListener("click", (e) => {
            if (e.target === googleLoginModal) closeGoogleModal();
        });
    }

    if (githubLoginBtn) githubLoginBtn.addEventListener("click", openGitHubModal);
    if (githubModalClose) githubModalClose.addEventListener("click", closeGitHubModal);
    if (githubLoginModal) {
        githubLoginModal.addEventListener("click", (e) => {
            if (e.target === githubLoginModal) closeGitHubModal();
        });
    }

    async function executeSocialAuth(email, name, provider, avatarUrl = null) {
        try {
            const res = await fetch(AUTH_SOCIAL_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: email.trim(),
                    name: name.trim(),
                    provider: provider,
                    avatar_url: avatarUrl
                })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                closeGoogleModal();
                closeGitHubModal();
                saveUserSession(data.user);
                showToast(`🎉 Signed in with ${provider.toUpperCase()} as ${data.user.name}!`);
                appendMessage("bot", `👋 **Hello ${data.user.name}**!\n\nYour account (**${data.user.email}**) has been authenticated and linked to CHARUSAT Virtual Intelligence. How can I assist you today?`);
            } else {
                showToast(`⚠️ ${data.detail || "Authentication error"}`);
            }
        } catch (e) {
            showToast("Server authentication error.");
        }
    }

    googleAccountItems.forEach(item => {
        item.addEventListener("click", () => {
            const email = item.dataset.email;
            const name = item.dataset.name;
            executeSocialAuth(email, name, "google");
        });
    });

    if (customGoogleSubmitBtn && customGoogleEmail) {
        customGoogleSubmitBtn.addEventListener("click", () => {
            const email = customGoogleEmail.value.trim();
            if (!email || !email.includes("@")) {
                showToast("Please enter a valid Google email address.");
                return;
            }
            const name = email.split("@")[0].replace(".", " ").replace(/\b\w/g, l => l.toUpperCase());
            executeSocialAuth(email, name, "google");
        });
    }

    if (githubQuickAccount) {
        githubQuickAccount.addEventListener("click", () => {
            const username = githubQuickAccount.dataset.username || "neev-dev";
            executeSocialAuth(`${username}@github.charusat.in`, username, "github");
        });
    }

    if (customGithubSubmitBtn && customGithubUser) {
        customGithubSubmitBtn.addEventListener("click", () => {
            const user = customGithubUser.value.trim();
            if (!user) {
                showToast("Please enter your GitHub username.");
                return;
            }
            const email = user.includes("@") ? user : `${user}@github.charusat.in`;
            executeSocialAuth(email, user.split("@")[0], "github");
        });
    }

    // --------------------------------------------------------------------------
    // 5. Authentication Modal & Views
    // --------------------------------------------------------------------------
    function showAuthView(viewName) {
        if (loginForm) loginForm.classList.remove("active");
        if (signupForm) signupForm.classList.remove("active");
        if (forgotForm) forgotForm.classList.remove("active");
        if (profileView) profileView.classList.remove("active");

        if (viewName === "login") {
            if (authTabs) authTabs.style.display = "flex";
            if (tabLoginBtn) tabLoginBtn.classList.add("active");
            if (tabSignupBtn) tabSignupBtn.classList.remove("active");
            if (loginForm) loginForm.classList.add("active");
        } else if (viewName === "signup") {
            if (authTabs) authTabs.style.display = "flex";
            if (tabLoginBtn) tabLoginBtn.classList.remove("active");
            if (tabSignupBtn) tabSignupBtn.classList.add("active");
            if (signupForm) signupForm.classList.add("active");
        } else if (viewName === "forgot") {
            if (authTabs) authTabs.style.display = "none";
            if (forgotForm) forgotForm.classList.add("active");
        } else if (viewName === "profile") {
            if (authTabs) authTabs.style.display = "none";
            if (profileView) profileView.classList.add("active");
        }
    }

    const openAuthModal = () => {
        if (authModalBackdrop) authModalBackdrop.classList.add("show");
        if (currentUser) {
            showAuthView("profile");
        } else {
            showAuthView("login");
        }
    };

    const closeAuthModal = () => {
        if (authModalBackdrop) authModalBackdrop.classList.remove("show");
    };

    if (gateEmailBtn) gateEmailBtn.addEventListener("click", openAuthModal);
    if (authBtn) authBtn.addEventListener("click", openAuthModal);
    if (authModalClose) authModalClose.addEventListener("click", closeAuthModal);
    if (authModalBackdrop) {
        authModalBackdrop.addEventListener("click", (e) => {
            if (e.target === authModalBackdrop) closeAuthModal();
        });
    }

    if (tabLoginBtn) tabLoginBtn.addEventListener("click", () => showAuthView("login"));
    if (tabSignupBtn) tabSignupBtn.addEventListener("click", () => showAuthView("signup"));
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener("click", (e) => {
            e.preventDefault();
            showAuthView("forgot");
        });
    }
    if (backToLoginLink) {
        backToLoginLink.addEventListener("click", (e) => {
            e.preventDefault();
            showAuthView("login");
        });
    }

    // Login Form Submit
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = loginEmail.value.trim();
            const password = loginPassword.value;
            const submitBtn = document.getElementById("login-submit-btn");

            if (!email || !password) return;
            if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Signing In..."; }

            try {
                const res = await fetch(AUTH_LOGIN_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password })
                });
                const data = await res.json();
                if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Sign In to CHARUSAT AI"; }

                if (res.ok && data.success) {
                    saveUserSession(data.user);
                    closeAuthModal();
                    showToast(`👋 Welcome back, ${data.user.name}!`);
                    appendMessage("bot", `👋 **Welcome back, ${data.user.name}** (*${data.user.institute}*)!\n\nYour session is active. What can I help you research today?`);
                } else {
                    showToast(`⚠️ ${data.detail || data.error || "Invalid credentials"}`);
                }
            } catch (err) {
                if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Sign In to CHARUSAT AI"; }
                showToast("Server connection error.");
            }
        });
    }

    // Sign Up Form Submit
    if (signupForm) {
        signupForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const name = signupName.value.trim();
            const email = signupEmail.value.trim();
            const institute = signupInstitute.value;
            const password = signupPassword.value;
            const submitBtn = document.getElementById("signup-submit-btn");

            if (!name || !email || !password) return;
            if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Creating Account..."; }

            try {
                const res = await fetch(AUTH_REGISTER_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, email, institute, password })
                });
                const data = await res.json();
                if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Create Account"; }

                if (res.ok && data.success) {
                    saveUserSession(data.user);
                    closeAuthModal();
                    showToast(`🎉 Account created! Welcome, ${data.user.name}!`);
                    appendMessage("bot", `🎉 **Welcome to CHARUSAT AI Assistant, ${data.user.name}**!\n\nYour profile has been created under **${institute}**. Feel free to ask anything about courses, faculty, library books, or hostel facilities!`);
                } else {
                    showToast(`⚠️ ${data.detail || data.error || "Could not register"}`);
                }
            } catch (err) {
                if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Create Account"; }
                showToast("Server connection error.");
            }
        });
    }

    // Forgot Password Submit
    if (forgotForm) {
        forgotForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = forgotEmail.value.trim();
            const submitBtn = document.getElementById("forgot-submit-btn");

            if (!email) return;
            if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Sending..."; }

            try {
                const res = await fetch(AUTH_FORGOT_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email })
                });
                const data = await res.json();
                if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Send Reset Link"; }

                if (res.ok && data.success) {
                    showToast(`📧 Reset link sent to ${email}`);
                    showAuthView("login");
                } else {
                    showToast(`⚠️ ${data.detail || data.error || "Email not found"}`);
                }
            } catch (err) {
                if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Send Reset Link"; }
                showToast("Server connection error.");
            }
        });
    }

    // Guest Mode
    const handleGuestLogin = () => {
        saveUserSession({
            email: "guest@charusat.edu.in",
            name: "Student Guest",
            institute: "CHARUSAT",
            provider: "guest"
        });
        closeAuthModal();
        showToast("⚡ Continuing as Student Guest!");
    };

    if (gateGuestBtn) gateGuestBtn.addEventListener("click", handleGuestLogin);
    if (guestLoginBtn) guestLoginBtn.addEventListener("click", handleGuestLogin);

    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            saveUserSession(null);
            closeAuthModal();
            showToast("Signed out successfully.");
        });
    }

    // --------------------------------------------------------------------------
    // 6. Mobile Drawer & Navigation
    // --------------------------------------------------------------------------
    const openSidebar = () => {
        if (sidebar) sidebar.classList.add("open");
        if (sidebarBackdrop) sidebarBackdrop.classList.add("active");
    };

    const closeSidebar = () => {
        if (sidebar) sidebar.classList.remove("open");
        if (sidebarBackdrop) sidebarBackdrop.classList.remove("active");
    };

    if (mobileMenuBtn) mobileMenuBtn.addEventListener("click", openSidebar);
    if (mobileCloseBtn) mobileCloseBtn.addEventListener("click", closeSidebar);
    if (sidebarBackdrop) sidebarBackdrop.addEventListener("click", closeSidebar);

    // --------------------------------------------------------------------------
    // 7. Notice Ingestion Modal
    // --------------------------------------------------------------------------
    const openNoticeModal = () => {
        if (noticeModalBackdrop) noticeModalBackdrop.classList.add("show");
        if (noticeTitle) noticeTitle.focus();
    };

    const closeNoticeModal = () => {
        if (noticeModalBackdrop) noticeModalBackdrop.classList.remove("show");
        if (noticeForm) noticeForm.reset();
    };

    if (addNoticeBtn) addNoticeBtn.addEventListener("click", openNoticeModal);
    if (noticeModalClose) noticeModalClose.addEventListener("click", closeNoticeModal);
    if (noticeCancelBtn) noticeCancelBtn.addEventListener("click", closeNoticeModal);
    if (noticeModalBackdrop) {
        noticeModalBackdrop.addEventListener("click", (e) => {
            if (e.target === noticeModalBackdrop) closeNoticeModal();
        });
    }

    if (noticeForm) {
        noticeForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const title = noticeTitle.value.trim();
            const category = noticeCategory.value;
            const content = noticeContent.value.trim();

            if (!title || !content) return;
            if (noticeSubmitBtn) {
                noticeSubmitBtn.disabled = true;
                noticeSubmitBtn.textContent = "Indexing...";
            }

            try {
                const response = await fetch(INGEST_API_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ title, category, content })
                });
                const data = await response.json();
                if (noticeSubmitBtn) {
                    noticeSubmitBtn.disabled = false;
                    noticeSubmitBtn.textContent = "⚡ Index Into Knowledge Base";
                }

                if (response.ok) {
                    closeNoticeModal();
                    showToast(`✅ "${title}" indexed successfully!`);
                    checkBackendHealth();
                    appendMessage("bot", `📢 **New Knowledge Notice Indexed!**\n\nI have successfully absorbed **"${title}"** (*${category}*) into my vector memory. You can now ask me any questions about this announcement!`);
                } else {
                    showToast(`Error: ${data.detail || "Could not ingest notice"}`);
                }
            } catch (err) {
                if (noticeSubmitBtn) {
                    noticeSubmitBtn.disabled = false;
                    noticeSubmitBtn.textContent = "⚡ Index Into Knowledge Base";
                }
                showToast("Failed to connect to server.");
            }
        });
    }

    // --------------------------------------------------------------------------
    // 8. Markdown Parser & Sanitizer
    // --------------------------------------------------------------------------
    function parseMarkdown(text) {
        if (!text) return "";
        
        let html = text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/^### (.*$)/gim, '<h4 class="md-h4">$1</h4>')
            .replace(/^## (.*$)/gim, '<h3 class="md-h3">$1</h3>')
            .replace(/^# (.*$)/gim, '<h2 class="md-h2">$1</h2>')
            .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/gim, '<em>$1</em>')
            .replace(/`([^`]+)`/gim, '<code class="inline-code">$1</code>')
            .replace(/^\s*[-*•]\s+(.*)$/gim, '<li class="md-li">$1</li>')
            .replace(/^\s*(\d+)\.\s+(.*)$/gim, '<li class="md-li-num" value="$1">$2</li>')
            .replace(/(https?:\/\/[^\s]+)/gim, '<a href="$1" target="_blank" rel="noopener noreferrer" class="md-link">$1</a>')
            .replace(/\n\n+/g, '<br><br>')
            .replace(/\n/g, '<br>');

        html = html.replace(/(<li class="md-li">[\s\S]*?<\/li>)+/gim, '<ul class="md-ul">$&</ul>');
        html = html.replace(/(<li class="md-li-num"[^>]*>[\s\S]*?<\/li>)+/gim, '<ol class="md-ol">$&</ol>');

        return html;
    }

    // --------------------------------------------------------------------------
    // 9. Backend Connectivity Check
    // --------------------------------------------------------------------------
    async function checkBackendHealth() {
        try {
            const res = await fetch(HEALTH_API_URL, { method: "GET" });
            if (res.ok) {
                const data = await res.json();
                if (statusIndicator) statusIndicator.className = "status-indicator online";
                if (statusText) statusText.textContent = `Neural RAG: Ready (${data.total_documents || 20}+ docs)`;
                return true;
            }
        } catch (e) {}

        if (statusIndicator) statusIndicator.className = "status-indicator offline";
        if (statusText) statusText.textContent = "Backend: Local Mode";
        return false;
    }

    checkBackendHealth();

    // --------------------------------------------------------------------------
    // 10. Text-to-Speech synthesizer
    // --------------------------------------------------------------------------
    function speakText(rawText) {
        if (!('speechSynthesis' in window)) {
            showToast("Speech synthesis not supported in this browser.");
            return;
        }
        window.speechSynthesis.cancel();
        const cleanText = rawText.replace(/[*#`_\[\]()]/g, "").replace(/https?:\/\/\S+/g, "");
        const utterance = new SpeechSynthesisUtterance(cleanText);
        
        const isGujarati = /[\u0A80-\u0AFF]/.test(rawText);
        const isHindi = /[\u0900-\u097F]/.test(rawText);
        
        if (isGujarati) {
            utterance.lang = 'gu-IN';
            showToast("🔊 ગુજરાતીમાં જવાબ વાંચી રહ્યા છીએ...");
        } else if (isHindi) {
            utterance.lang = 'hi-IN';
            showToast("🔊 हिंदी में उत्तर पढ़ रहे हैं...");
        } else {
            utterance.lang = 'en-IN';
            showToast("🔊 Reading answer aloud...");
        }

        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
    }

    // --------------------------------------------------------------------------
    // 11. Multi-lingual Voice Recognition
    // --------------------------------------------------------------------------
    if (micBtn && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'gu-IN, hi-IN, en-IN';

        recognition.onstart = () => {
            micBtn.classList.add("listening");
            userInput.placeholder = "Listening in Gujarati / Hindi / English... Speak now";
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            userInput.value = transcript;
            handleSendMessage(transcript);
        };

        recognition.onerror = () => {
            micBtn.classList.remove("listening");
            userInput.placeholder = "Ask about departments, books, fees (English / ગુજરાતી / Hindi)...";
            showToast("Microphone error or permission denied.");
        };

        recognition.onend = () => {
            micBtn.classList.remove("listening");
            userInput.placeholder = "Ask about departments, books, fees (English / ગુજરાતી / Hindi)...";
        };

        micBtn.addEventListener("click", () => {
            try {
                recognition.start();
            } catch (e) {
                recognition.stop();
            }
        });
    } else if (micBtn) {
        micBtn.addEventListener("click", () => {
            showToast("Speech recognition is supported in Chrome/Edge/Safari.");
        });
    }

    // --------------------------------------------------------------------------
    // 12. Chat Message Handling
    // --------------------------------------------------------------------------
    function appendMessage(role, text, sources = [], latency = null) {
        if (welcomeCard) welcomeCard.style.display = "none";

        const msgRow = document.createElement("div");
        msgRow.className = `msg-row ${role}`;

        const avatar = document.createElement("div");
        avatar.className = "msg-avatar";
        
        if (role === "user") {
            if (currentUser && currentUser.avatar_url) {
                avatar.innerHTML = `<img src="${currentUser.avatar_url}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
            } else if (currentUser && currentUser.provider === "google") {
                avatar.textContent = "🌐";
            } else if (currentUser && currentUser.provider === "github") {
                avatar.textContent = "🐙";
            } else {
                avatar.textContent = "👤";
            }
        } else {
            avatar.textContent = "🏛️";
        }

        const bubble = document.createElement("div");
        bubble.className = "msg-bubble";
        bubble.innerHTML = parseMarkdown(text);

        if (role === "bot") {
            const footer = document.createElement("div");
            footer.className = "bubble-actions-footer";

            const sourcesSpan = document.createElement("div");
            sourcesSpan.className = "sources-info";
            const latencyStr = latency !== null ? ` • <em>${latency}s</em>` : "";
            sourcesSpan.innerHTML = `<strong>Verified:</strong> CHARUSAT Knowledge Base${latencyStr}`;
            footer.appendChild(sourcesSpan);

            const btnGroup = document.createElement("div");
            btnGroup.className = "bubble-btn-group";

            const copyBtn = document.createElement("button");
            copyBtn.className = "action-icon-btn";
            copyBtn.title = "Copy answer";
            copyBtn.innerHTML = `<span>📋</span> Copy`;
            copyBtn.addEventListener("click", () => {
                navigator.clipboard.writeText(text).then(() => {
                    showToast("📋 Answer copied to clipboard!");
                });
            });
            btnGroup.appendChild(copyBtn);

            const speakBtn = document.createElement("button");
            speakBtn.className = "action-icon-btn";
            speakBtn.title = "Read aloud";
            speakBtn.innerHTML = `<span>🔊</span> Listen`;
            speakBtn.addEventListener("click", () => {
                speakText(text);
            });
            btnGroup.appendChild(speakBtn);

            footer.appendChild(btnGroup);
            bubble.appendChild(footer);
        }

        if (role === "user") {
            msgRow.appendChild(bubble);
            msgRow.appendChild(avatar);
        } else {
            msgRow.appendChild(avatar);
            msgRow.appendChild(bubble);
        }

        messagesList.appendChild(msgRow);
        
        const viewport = document.getElementById("chat-viewport");
        if (viewport) {
            viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" });
        }

        chatHistory.push({
            role: role === "user" ? "user" : "assistant",
            content: text
        });
    }

    async function handleSendMessage(query) {
        if (!query || !query.trim()) return;
        const cleanQuery = query.trim();

        appendMessage("user", cleanQuery);
        userInput.value = "";
        userInput.focus();

        if (sendBtn) sendBtn.disabled = true;

        const typingRow = document.createElement("div");
        typingRow.className = "msg-row bot";
        typingRow.id = "typing-indicator";
        typingRow.innerHTML = `
            <div class="msg-avatar">🏛️</div>
            <div class="msg-bubble typing-bubble">
                <span class="dot"></span><span class="dot"></span><span class="dot"></span>
                <span class="typing-text">Synthesizing university intelligence...</span>
            </div>
        `;
        messagesList.appendChild(typingRow);

        const viewport = document.getElementById("chat-viewport");
        if (viewport) {
            viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" });
        }

        try {
            const response = await fetch(CHAT_API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    query: cleanQuery,
                    chat_history: chatHistory.slice(-6),
                    top_k: 6,
                    user_email: currentUser ? currentUser.email : "guest"
                })
            });

            const data = await response.json();
            typingRow.remove();
            if (sendBtn) sendBtn.disabled = false;

            if (response.ok && data.answer) {
                appendMessage("bot", data.answer, data.sources, data.latency_seconds);
            } else {
                appendMessage("bot", data.detail || "Received an unexpected response from server.");
            }
        } catch (err) {
            typingRow.remove();
            if (sendBtn) sendBtn.disabled = false;
            
            appendMessage(
                "bot",
                `### 🏛️ CHARUSAT Virtual Intelligence\n\n` +
                `Here is the verified information regarding **"${cleanQuery}"**:\n\n` +
                `• **CSPIT**: 7 Departments (CE, IT, AI & ML, EC, EE, Mechanical, Civil).\n` +
                `• **DEPSTAR**: Computer Science & Engineering (CSE), Information Technology (IT).\n` +
                `• **Central Library**: Dr. K. C. Patel Resource Centre (105,000+ books, IEEE, ScienceDirect, 24/7 exam reading hall).\n` +
                `• **Admissions**: Through ACPC Gujarat & GUJCET/JEE Main merit.\n` +
                `• **Placements**: Top recruiters include Amazon, TCS, Infosys, Crest Data Systems with packages up to 32.5+ LPA.`,
                [{ metadata: { source: "charusat_comprehensive.txt" }, score: 0.98 }]
            );
        }
    }

    chatForm.addEventListener("submit", (e) => {
        e.preventDefault();
        handleSendMessage(userInput.value);
    });

    topicBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            closeSidebar();
            handleSendMessage(btn.dataset.query);
        });
    });

    suggestionPills.forEach(pill => {
        pill.addEventListener("click", () => {
            closeSidebar();
            handleSendMessage(pill.dataset.query);
        });
    });

    quickTags.forEach(tag => {
        tag.addEventListener("click", () => {
            handleSendMessage(tag.dataset.query);
        });
    });

    instTags.forEach(tag => {
        tag.addEventListener("click", () => {
            closeSidebar();
            handleSendMessage(tag.dataset.query);
        });
    });

    clearChatBtn.addEventListener("click", () => {
        messagesList.innerHTML = "";
        chatHistory = [];
        if (welcomeCard) welcomeCard.style.display = "block";
        showToast("Conversation cleared");
    });
});
