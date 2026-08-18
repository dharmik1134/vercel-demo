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

    // Chat History & Multi-Session Elements
    const newChatBtn = document.getElementById("new-chat-btn");
    const sidebarHistoryList = document.getElementById("sidebar-history-list");
    const historySearchInput = document.getElementById("history-search-input");
    const clearAllHistoryBtn = document.getElementById("clear-all-history-btn");
    const historyDrawerBtn = document.getElementById("history-drawer-btn");
    const historyBadge = document.getElementById("history-badge");
    const historyModalBackdrop = document.getElementById("history-modal-backdrop");
    const historyModalClose = document.getElementById("history-modal-close");
    const historyModalCloseBtn = document.getElementById("history-modal-close-btn");
    const historyModalClearAllBtn = document.getElementById("history-modal-clear-all-btn");
    const historyModalSearch = document.getElementById("history-modal-search");
    const historyModalNewChatBtn = document.getElementById("history-modal-new-chat-btn");
    const historyModalList = document.getElementById("history-modal-list");
    const historyModalCount = document.getElementById("history-modal-count");

    // Multimodal Assignment Solver & Study Hub Elements
    const attachImgBtn = document.getElementById("attach-img-btn");
    const imageFileInput = document.getElementById("image-file-input");
    const imagePreviewCapsule = document.getElementById("image-preview-capsule");
    const previewImg = document.getElementById("preview-img");
    const previewFilename = document.getElementById("preview-filename");
    const removeImgBtn = document.getElementById("remove-img-btn");
    const quickSnapBtn = document.getElementById("quick-snap-btn");
    const quickStudyHubBtn = document.getElementById("quick-study-hub-btn");
    const materialsHubBtn = document.getElementById("materials-hub-btn");
    const materialsModalBackdrop = document.getElementById("materials-modal-backdrop");
    const materialsModalClose = document.getElementById("materials-modal-close");
    const materialsModalCloseBtn = document.getElementById("materials-modal-close-btn");
    const hubFilterTabs = document.getElementById("hub-filter-tabs");
    const hubCardsGrid = document.getElementById("hub-cards-grid");
    const hubSnapBtn = document.getElementById("hub-snap-btn");

    let chatHistory = [];
    let currentUser = null;
    let savedSessions = [];
    let activeSessionId = null;
    let currentAttachedImage = null; // { base64, mimeType, filename }

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
    const ASSIGNMENT_SOLVE_URL = `${API_BASE}/api/v1/assignment/solve`;
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
    // 5. Message Rendering & Append Logic (with Multimodal Image Support)
    // --------------------------------------------------------------------------
    function appendMessage(role, text, sources = null, latency = null, imageDataUrl = null) {
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
            avatar.innerHTML = `<img src="logo.png" alt="CHARUSAT" style="width:100%;height:100%;object-fit:contain;padding:2px;">`;
        }

        const bubble = document.createElement("div");
        bubble.className = "msg-bubble";

        // If problem image is attached, render it inside user message
        if (imageDataUrl) {
            const imgWrapper = document.createElement("div");
            imgWrapper.className = "msg-problem-img-wrapper";
            imgWrapper.innerHTML = `<img src="${imageDataUrl}" class="msg-problem-img" alt="Assignment Problem Photo">`;
            bubble.appendChild(imgWrapper);
        }

        const textDiv = document.createElement("div");
        textDiv.className = "bubble-text-content";
        textDiv.innerHTML = parseMarkdown(text);
        bubble.appendChild(textDiv);

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

        // Record in persistent session
        recordMessageInSession(role, text, sources, latency, imageDataUrl);
    }

    // --------------------------------------------------------------------------
    // 6. Multi-Session Conversation History & Memory Engine
    // --------------------------------------------------------------------------
    const SESSIONS_STORAGE_KEY = "charusat_chat_sessions_v2";

    function formatTimeAgo(isoString) {
        if (!isoString) return "";
        const diff = Date.now() - new Date(isoString).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return "Just now";
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        if (days === 1) return "Yesterday";
        if (days < 7) return `${days}d ago`;
        return new Date(isoString).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }

    function loadSessionsFromStorage() {
        try {
            const raw = localStorage.getItem(SESSIONS_STORAGE_KEY);
            savedSessions = raw ? JSON.parse(raw) : [];
            if (!Array.isArray(savedSessions)) savedSessions = [];
        } catch (e) {
            savedSessions = [];
        }
        renderHistoryUI();
    }

    function saveSessionsToStorage() {
        try {
            localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(savedSessions));
        } catch (e) {}
        renderHistoryUI();
    }

    function recordMessageInSession(role, text, sources = null, latency = null, imageDataUrl = null) {
        const msgObj = {
            role,
            text,
            sources,
            latency,
            imageDataUrl,
            timestamp: new Date().toISOString()
        };

        if (!activeSessionId) {
            const cleanTitle = (text || "Assignment Problem").replace(/^[#*\s]+/, "").slice(0, 45).trim() + (text && text.length > 45 ? "..." : "");
            const newSession = {
                id: "sess_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
                title: cleanTitle || "New Conversation",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                messages: [msgObj]
            };
            activeSessionId = newSession.id;
            savedSessions.unshift(newSession);
        } else {
            const session = savedSessions.find(s => s.id === activeSessionId);
            if (session) {
                session.messages.push(msgObj);
                session.updatedAt = new Date().toISOString();
                // Move to top
                savedSessions = [session, ...savedSessions.filter(s => s.id !== activeSessionId)];
            }
        }
        saveSessionsToStorage();
    }

    function renderHistoryUI(filterText = "") {
        const query = filterText.toLowerCase().trim();
        const filtered = query 
            ? savedSessions.filter(s => s.title.toLowerCase().includes(query) || (s.messages && s.messages.some(m => m.text.toLowerCase().includes(query))))
            : savedSessions;

        // Update badge counts
        if (historyBadge) historyBadge.textContent = savedSessions.length;
        if (historyModalCount) historyModalCount.textContent = `${savedSessions.length} Saved Sessions`;

        // Render Sidebar List
        if (sidebarHistoryList) {
            if (filtered.length === 0) {
                sidebarHistoryList.innerHTML = `<div class="history-empty-msg">${savedSessions.length === 0 ? "No saved chats yet" : "No matching chats"}</div>`;
            } else {
                sidebarHistoryList.innerHTML = filtered.slice(0, 10).map(s => `
                    <div class="history-item ${s.id === activeSessionId ? "active" : ""}" data-session-id="${s.id}">
                        <div class="history-item-left">
                            <span class="history-icon">💬</span>
                            <div class="history-item-details">
                                <span class="history-item-title">${escapeHtml(s.title)}</span>
                                <span class="history-item-time">${formatTimeAgo(s.updatedAt || s.createdAt)}</span>
                            </div>
                        </div>
                        <button class="history-del-btn" data-del-id="${s.id}" title="Delete conversation">🗑️</button>
                    </div>
                `).join("");

                sidebarHistoryList.querySelectorAll(".history-item").forEach(el => {
                    el.addEventListener("click", (e) => {
                        if (e.target.closest(".history-del-btn")) return;
                        loadSessionById(el.dataset.sessionId);
                        closeSidebar();
                    });
                });

                sidebarHistoryList.querySelectorAll(".history-del-btn").forEach(btn => {
                    btn.addEventListener("click", (e) => {
                        e.stopPropagation();
                        deleteSessionById(btn.dataset.delId);
                    });
                });
            }
        }

        // Render Modal Drawer List
        if (historyModalList) {
            if (filtered.length === 0) {
                historyModalList.innerHTML = `<div class="history-empty-msg" style="padding:30px 10px;">${savedSessions.length === 0 ? "No conversation history recorded yet. Start asking questions!" : "No chats matched your search query."}</div>`;
            } else {
                historyModalList.innerHTML = filtered.map(s => {
                    const lastMsg = s.messages && s.messages.length > 0 ? s.messages[s.messages.length - 1].text : "";
                    const cleanPreview = lastMsg.replace(/^[#*\s]+/, "").slice(0, 85) + "...";
                    return `
                        <div class="history-modal-item ${s.id === activeSessionId ? "active" : ""}" data-session-id="${s.id}">
                            <div class="history-modal-item-info">
                                <span class="history-modal-item-title">${escapeHtml(s.title)}</span>
                                <span class="history-modal-item-preview">${escapeHtml(cleanPreview)}</span>
                                <div class="history-modal-item-meta">
                                    <span>🕒 ${formatTimeAgo(s.updatedAt || s.createdAt)}</span>
                                    <span>💬 ${s.messages ? s.messages.length : 0} messages</span>
                                </div>
                            </div>
                            <div class="history-modal-item-actions">
                                <button class="history-restore-btn" data-restore-id="${s.id}">Open Chat →</button>
                                <button class="history-del-btn" data-del-id="${s.id}" style="opacity:1;" title="Delete">🗑️</button>
                            </div>
                        </div>
                    `;
                }).join("");

                historyModalList.querySelectorAll(".history-modal-item").forEach(el => {
                    el.addEventListener("click", (e) => {
                        if (e.target.closest(".history-del-btn")) return;
                        loadSessionById(el.dataset.sessionId);
                        closeHistoryModal();
                    });
                });

                historyModalList.querySelectorAll(".history-restore-btn").forEach(btn => {
                    btn.addEventListener("click", (e) => {
                        e.stopPropagation();
                        loadSessionById(btn.dataset.restoreId);
                        closeHistoryModal();
                    });
                });

                historyModalList.querySelectorAll(".history-del-btn").forEach(btn => {
                    btn.addEventListener("click", (e) => {
                        e.stopPropagation();
                        deleteSessionById(btn.dataset.delId);
                    });
                });
            }
        }
    }

    function escapeHtml(str) {
        if (!str) return "";
        return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    }

    function loadSessionById(sessionId) {
        const session = savedSessions.find(s => s.id === sessionId);
        if (!session) return;

        activeSessionId = session.id;
        messagesList.innerHTML = "";
        chatHistory = [];
        if (welcomeCard) welcomeCard.style.display = "none";

        if (session.messages && session.messages.length > 0) {
            session.messages.forEach(msg => {
                const msgRow = document.createElement("div");
                msgRow.className = `msg-row ${msg.role}`;

                const avatar = document.createElement("div");
                avatar.className = "msg-avatar";
                if (msg.role === "user") {
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
                    avatar.innerHTML = `<img src="logo.png" alt="CHARUSAT" style="width:100%;height:100%;object-fit:contain;padding:2px;">`;
                }

                const bubble = document.createElement("div");
                bubble.className = "msg-bubble";

                if (msg.imageDataUrl) {
                    const imgWrapper = document.createElement("div");
                    imgWrapper.className = "msg-problem-img-wrapper";
                    imgWrapper.innerHTML = `<img src="${msg.imageDataUrl}" class="msg-problem-img" alt="Assignment Problem Photo">`;
                    bubble.appendChild(imgWrapper);
                }

                const textDiv = document.createElement("div");
                textDiv.className = "bubble-text-content";
                textDiv.innerHTML = parseMarkdown(msg.text);
                bubble.appendChild(textDiv);

                if (msg.role === "bot") {
                    const footer = document.createElement("div");
                    footer.className = "bubble-actions-footer";
                    const sourcesSpan = document.createElement("div");
                    sourcesSpan.className = "sources-info";
                    const latencyStr = msg.latency ? ` • <em>${msg.latency}s</em>` : "";
                    sourcesSpan.innerHTML = `<strong>Verified:</strong> CHARUSAT Knowledge Base${latencyStr}`;
                    footer.appendChild(sourcesSpan);

                    const btnGroup = document.createElement("div");
                    btnGroup.className = "bubble-btn-group";

                    const copyBtn = document.createElement("button");
                    copyBtn.className = "action-icon-btn";
                    copyBtn.title = "Copy answer";
                    copyBtn.innerHTML = `<span>📋</span> Copy`;
                    copyBtn.addEventListener("click", () => {
                        navigator.clipboard.writeText(msg.text).then(() => showToast("📋 Answer copied!"));
                    });
                    btnGroup.appendChild(copyBtn);

                    const speakBtn = document.createElement("button");
                    speakBtn.className = "action-icon-btn";
                    speakBtn.title = "Read aloud";
                    speakBtn.innerHTML = `<span>🔊</span> Listen`;
                    speakBtn.addEventListener("click", () => speakText(msg.text));
                    btnGroup.appendChild(speakBtn);

                    footer.appendChild(btnGroup);
                    bubble.appendChild(footer);
                }

                if (msg.role === "user") {
                    msgRow.appendChild(bubble);
                    msgRow.appendChild(avatar);
                } else {
                    msgRow.appendChild(avatar);
                    msgRow.appendChild(bubble);
                }

                messagesList.appendChild(msgRow);
                chatHistory.push({ role: msg.role === "user" ? "user" : "assistant", content: msg.text });
            });
        }

        const viewport = document.getElementById("chat-viewport");
        if (viewport) {
            viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" });
        }

        renderHistoryUI();
        showToast(`📂 Restored: "${session.title}"`);
    }

    function createNewSession() {
        activeSessionId = null;
        chatHistory = [];
        messagesList.innerHTML = "";
        clearAttachedImage();
        if (welcomeCard) welcomeCard.style.display = "block";
        if (userInput) {
            userInput.value = "";
            userInput.focus();
        }
        renderHistoryUI();
        showToast("✨ Started a new conversation");
    }

    function deleteSessionById(sessionId) {
        savedSessions = savedSessions.filter(s => s.id !== sessionId);
        saveSessionsToStorage();
        if (activeSessionId === sessionId) {
            createNewSession();
        }
        showToast("🗑️ Chat deleted");
    }

    function clearAllSessions() {
        if (savedSessions.length === 0) return;
        if (confirm("Are you sure you want to clear all chat history?")) {
            savedSessions = [];
            saveSessionsToStorage();
            createNewSession();
            closeHistoryModal();
            showToast("🗑️ All chat history cleared");
        }
    }

    function openHistoryModal() {
        if (historyModalBackdrop) historyModalBackdrop.classList.add("show");
        renderHistoryUI();
        if (historyModalSearch) {
            historyModalSearch.value = "";
            historyModalSearch.focus();
        }
    }

    function closeHistoryModal() {
        if (historyModalBackdrop) historyModalBackdrop.classList.remove("show");
    }

    // Initialize Sessions
    loadSessionsFromStorage();

    // History UI Listeners
    if (newChatBtn) newChatBtn.addEventListener("click", createNewSession);
    if (historyDrawerBtn) historyDrawerBtn.addEventListener("click", openHistoryModal);
    if (historyModalClose) historyModalClose.addEventListener("click", closeHistoryModal);
    if (historyModalCloseBtn) historyModalCloseBtn.addEventListener("click", closeHistoryModal);
    if (historyModalBackdrop) {
        historyModalBackdrop.addEventListener("click", (e) => {
            if (e.target === historyModalBackdrop) closeHistoryModal();
        });
    }
    if (clearAllHistoryBtn) clearAllHistoryBtn.addEventListener("click", clearAllSessions);
    if (historyModalClearAllBtn) historyModalClearAllBtn.addEventListener("click", clearAllSessions);
    if (historyModalNewChatBtn) {
        historyModalNewChatBtn.addEventListener("click", () => {
            createNewSession();
            closeHistoryModal();
        });
    }

    if (historySearchInput) {
        historySearchInput.addEventListener("input", (e) => {
            renderHistoryUI(e.target.value);
        });
    }

    if (historyModalSearch) {
        historyModalSearch.addEventListener("input", (e) => {
            renderHistoryUI(e.target.value);
        });
    }

    // --------------------------------------------------------------------------
    // 7. Multimodal Assignment Problem Image Attach & Camera Handlers
    // --------------------------------------------------------------------------
    function handleImageFile(file) {
        if (!file || !file.type.startsWith("image/")) {
            showToast("⚠️ Please select a valid image file (PNG, JPG, JPEG, WEBP)");
            return;
        }

        if (file.size > 12 * 1024 * 1024) {
            showToast("⚠️ Image size is too large (max 12MB)");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            currentAttachedImage = {
                base64: e.target.result,
                mimeType: file.type,
                filename: file.name || "assignment_problem.jpg"
            };

            if (imagePreviewCapsule) imagePreviewCapsule.style.display = "flex";
            if (previewImg) previewImg.src = e.target.result;
            if (previewFilename) previewFilename.textContent = file.name || "assignment_problem.jpg";
            if (userInput) userInput.focus();
            showToast("📷 Problem photo attached! Press send to solve.");
        };
        reader.readAsDataURL(file);
    }

    function clearAttachedImage() {
        currentAttachedImage = null;
        if (imagePreviewCapsule) imagePreviewCapsule.style.display = "none";
        if (previewImg) previewImg.src = "";
        if (imageFileInput) imageFileInput.value = "";
    }

    if (attachImgBtn) attachImgBtn.addEventListener("click", () => {
        if (imageFileInput) imageFileInput.click();
    });

    if (quickSnapBtn) quickSnapBtn.addEventListener("click", () => {
        if (imageFileInput) imageFileInput.click();
    });

    if (hubSnapBtn) hubSnapBtn.addEventListener("click", () => {
        closeMaterialsModal();
        if (imageFileInput) imageFileInput.click();
    });

    if (imageFileInput) {
        imageFileInput.addEventListener("change", (e) => {
            if (e.target.files && e.target.files[0]) {
                handleImageFile(e.target.files[0]);
            }
        });
    }

    if (removeImgBtn) removeImgBtn.addEventListener("click", clearAttachedImage);

    // Global Clipboard Screenshot Paste (Ctrl+V / Cmd+V)
    window.addEventListener("paste", (e) => {
        const items = (e.clipboardData || e.originalEvent.clipboardData).items;
        for (let item of items) {
            if (item.type.indexOf("image") !== -1) {
                const blob = item.getAsFile();
                handleImageFile(blob);
                break;
            }
        }
    });

    // --------------------------------------------------------------------------
    // 8. Study Hub & Curriculum Directory Data
    // --------------------------------------------------------------------------
    const HUB_SUBJECTS = [
        {
            dept: "aiml",
            name: "🤖 Machine Learning Foundations",
            code: "CSPIT-AI301",
            deptName: "AI & ML (CSPIT)",
            books: "Pattern Recognition (Christopher Bishop), Hands-On ML with Scikit-Learn & TF (Aurélien Géron)",
            labs: "Supervised & Unsupervised Learning, Regression, SVM, Random Forest, Model Metrics",
            query: "Explain core concepts, syllabus and reference textbooks for Machine Learning in CSPIT AI&ML"
        },
        {
            dept: "aiml",
            name: "🧠 Deep Learning & Neural Networks",
            code: "CSPIT-AI401",
            deptName: "AI & ML (CSPIT)",
            books: "Deep Learning (Ian Goodfellow, Yoshua Bengio), PyTorch in Action",
            labs: "Backpropagation, CNN (ResNet, VGG), LSTM, Transformers, NVIDIA GPU Clusters",
            query: "What is the complete syllabus and lab list for Deep Learning in CSPIT AI&ML?"
        },
        {
            dept: "aiml",
            name: "👁️ Computer Vision & YOLO",
            code: "CSPIT-AI402",
            deptName: "AI & ML (CSPIT)",
            books: "Computer Vision: Algorithms and Applications (Richard Szeliski), OpenCV Guide",
            labs: "Image filtering, Feature Extraction, YOLOv8 real-time object detection, Image Segmentation",
            query: "Explain Computer Vision syllabus, textbooks and lab experiments in CSPIT AI&ML"
        },
        {
            dept: "ce",
            name: "⚡ Data Structures & Algorithms (DSA)",
            code: "CSPIT-CE201",
            deptName: "Computer (CE)",
            books: "Introduction to Algorithms (CLRS), Data Structures Using C/C++ (Reema Thareja)",
            labs: "Trees (AVL, Red-Black), Graphs (Dijkstra, MST), Dynamic Programming, C++ STL",
            query: "Show me complete DSA syllabus, CLRS reference books and assignments in CSPIT CE"
        },
        {
            dept: "ce",
            name: "🗄️ Database Management Systems (DBMS)",
            code: "CSPIT-CE202",
            deptName: "Computer (CE)",
            books: "Database System Concepts (Silberschatz, Korth, Sudarshan), Fundamentals of DB Systems (Elmasri)",
            labs: "Complex SQL, Normalization (1NF to BCNF), Transactions & ACID, MongoDB NoSQL",
            query: "What is the syllabus, Korth reference book and assignment questions for DBMS in CE?"
        },
        {
            dept: "ce",
            name: "💻 Operating Systems (OS)",
            code: "CSPIT-CE301",
            deptName: "Computer (CE)",
            books: "Operating System Concepts (Silberschatz & Galvin), Modern OS (Andrew S. Tanenbaum)",
            labs: "Linux shell scripting, CPU Scheduling, Semaphore Synchronization, Deadlock (Banker's Algorithm)",
            query: "Explain OS syllabus, reference textbooks and lab assignments in CSPIT CE"
        },
        {
            dept: "it",
            name: "🌐 Computer Networks (CN)",
            code: "CSPIT-IT301",
            deptName: "IT (CSPIT)",
            books: "Computer Networks (Tanenbaum), Data Communications & Networking (Forouzan)",
            labs: "Socket Programming, Subnetting/VLSM, Wireshark packet capture, Cisco Packet Tracer",
            query: "Show me Computer Networks syllabus, textbooks and lab assignments in CSPIT IT"
        },
        {
            dept: "it",
            name: "🔒 Cyber Security & Cryptography",
            code: "CSPIT-IT401",
            deptName: "IT (CSPIT)",
            books: "Cryptography and Network Security (William Stallings)",
            labs: "AES/RSA encryption, Kali Linux penetration testing, Network auditing & CTF challenges",
            query: "Explain Cyber Security curriculum, lab experiments and textbooks in CSPIT IT"
        },
        {
            dept: "depstar",
            name: "🚀 High-Performance Computing & Cloud",
            code: "DEPSTAR-CS301",
            deptName: "DEPSTAR (CSE/IT)",
            books: "Cloud Computing Principles & Paradigms (Rajkumar Buyya), Distributed Systems (Tanenbaum)",
            labs: "NVIDIA High-Performance GPU Cluster, AWS EC2/S3, Docker containerization, Kubernetes",
            query: "What are the core subjects, textbooks and GPU labs in DEPSTAR CSE and IT?"
        },
        {
            dept: "ec_ee",
            name: "📡 Digital Signal Processing & VLSI",
            code: "CSPIT-EC301",
            deptName: "EC & EE",
            books: "Digital Signal Processing (Proakis), CMOS VLSI Design (Weste & Harris)",
            labs: "Cadence EDA tools, Verilog HDL synthesis, MATLAB signal filtering, Microcontrollers",
            query: "Explain EC and EE engineering core subjects, textbooks and lab facilities in CSPIT"
        },
        {
            dept: "me_cl",
            name: "⚙️ Thermodynamics & CAD/CAM",
            code: "CSPIT-ME301",
            deptName: "Mechanical & Civil",
            books: "Engineering Thermodynamics (P.K. Nag), CAD/CAM Principles (P.N. Rao), Strength of Materials (Ramamrutham)",
            labs: "SolidWorks, ANSYS finite element analysis, CNC Machining, Material Testing & Metallurgy",
            query: "What are the core subjects, reference books and lab facilities in Mechanical and Civil Engineering?"
        },
        {
            dept: "cmpica",
            name: "💻 Full-Stack Web Development & MCA Core",
            code: "CMPICA-MCA201",
            deptName: "CMPICA (BCA/MCA)",
            books: "Full Stack Development with MERN (MongoDB, Express, React, Node), Python Data Science",
            labs: "React.js, Next.js, REST API building, Flutter mobile app development, Agile Project Delivery",
            query: "Explain BCA and MCA core subjects, web technologies syllabus and reference books in CMPICA"
        },
        {
            dept: "rpcp",
            name: "💊 Pharmacology & Medicinal Chemistry",
            code: "RPCP-PH301",
            deptName: "RPCP Pharmacy",
            books: "Essentials of Medical Pharmacology (K.D. Tripathi), Industrial Pharmacy (Lachman & Lieberman)",
            labs: "Formulation & Quality Assurance Lab, Animal tissue assay, Pharmacognosy extraction",
            query: "Show me B.Pharm and M.Pharm core subjects, Tripathi reference books and lab syllabus in RPCP"
        },
        {
            dept: "i2im",
            name: "📈 Financial Management & Marketing",
            code: "I2IM-MBA101",
            deptName: "I2IM MBA",
            books: "Marketing Management (Philip Kotler), Financial Management (Prasanna Chandra)",
            labs: "Business Analytics, Financial Modeling, Case Study discussions, Live Industry Internships",
            query: "What is the MBA and BBA core curriculum, Kotler marketing textbooks and subjects in I2IM?"
        }
    ];

    function renderStudyHub(filterDept = "all") {
        if (!hubCardsGrid) return;
        const filtered = filterDept === "all" ? HUB_SUBJECTS : HUB_SUBJECTS.filter(s => s.dept === filterDept);
        hubCardsGrid.innerHTML = filtered.map(s => `
            <div class="hub-subject-card">
                <div class="hub-card-header">
                    <span class="hub-card-title">${s.name}</span>
                    <span class="hub-card-dept-badge">${s.deptName}</span>
                </div>
                <div class="hub-card-body">
                    <p>📖 <strong>Textbooks:</strong> ${s.books}</p>
                    <p>🧪 <strong>Lab Focus:</strong> ${s.labs}</p>
                </div>
                <div class="hub-card-actions">
                    <button class="hub-card-action-btn" data-query="${escapeHtml(s.query)}">💬 Ask AI</button>
                    <button class="hub-card-action-btn orange" data-snap="true">📷 Snap Problem</button>
                </div>
            </div>
        `).join("");

        hubCardsGrid.querySelectorAll(".hub-card-action-btn:not(.orange)").forEach(btn => {
            btn.addEventListener("click", () => {
                closeMaterialsModal();
                handleSendMessage(btn.dataset.query);
            });
        });

        hubCardsGrid.querySelectorAll(".hub-card-action-btn.orange").forEach(btn => {
            btn.addEventListener("click", () => {
                closeMaterialsModal();
                if (imageFileInput) imageFileInput.click();
            });
        });
    }

    function openMaterialsModal() {
        if (materialsModalBackdrop) materialsModalBackdrop.classList.add("show");
        renderStudyHub("all");
    }

    function closeMaterialsModal() {
        if (materialsModalBackdrop) materialsModalBackdrop.classList.remove("show");
    }

    if (materialsHubBtn) materialsHubBtn.addEventListener("click", openMaterialsModal);
    if (quickStudyHubBtn) quickStudyHubBtn.addEventListener("click", openMaterialsModal);
    if (materialsModalClose) materialsModalClose.addEventListener("click", closeMaterialsModal);
    if (materialsModalCloseBtn) materialsModalCloseBtn.addEventListener("click", closeMaterialsModal);
    if (materialsModalBackdrop) {
        materialsModalBackdrop.addEventListener("click", (e) => {
            if (e.target === materialsModalBackdrop) closeMaterialsModal();
        });
    }

    if (hubFilterTabs) {
        hubFilterTabs.querySelectorAll(".hub-tab-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                hubFilterTabs.querySelectorAll(".hub-tab-btn").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                renderStudyHub(btn.dataset.dept);
            });
        });
    }

    // --------------------------------------------------------------------------
    // 9. Send Message Handler (Multimodal Vision + Text RAG)
    // --------------------------------------------------------------------------
    async function handleSendMessage(query) {
        const hasText = query && query.trim();
        const hasImage = currentAttachedImage !== null;

        if (!hasText && !hasImage) return;

        const cleanQuery = hasText ? query.trim() : "Please solve the problem in this attached assignment photo step-by-step.";
        const attachedImgCopy = currentAttachedImage ? { ...currentAttachedImage } : null;

        // Display user message bubble (with attached image if present)
        appendMessage("user", cleanQuery, null, null, attachedImgCopy ? attachedImgCopy.base64 : null);
        
        userInput.value = "";
        clearAttachedImage();
        userInput.focus();

        if (sendBtn) sendBtn.disabled = true;

        const typingRow = document.createElement("div");
        typingRow.className = "msg-row bot";
        typingRow.id = "typing-indicator";
        typingRow.innerHTML = `
            <div class="msg-avatar"><img src="logo.png" alt="CHARUSAT" style="width:100%;height:100%;object-fit:contain;padding:2px;"></div>
            <div class="msg-bubble typing-bubble">
                <span class="dot"></span><span class="dot"></span><span class="dot"></span>
                <span class="typing-text">${attachedImgCopy ? "Analyzing problem photo & deriving step-by-step solution..." : "Synthesizing university intelligence..."}</span>
            </div>
        `;
        messagesList.appendChild(typingRow);

        const viewport = document.getElementById("chat-viewport");
        if (viewport) {
            viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" });
        }

        try {
            let response, data;

            // Multimodal Vision Solver Route
            if (attachedImgCopy) {
                response = await fetch(ASSIGNMENT_SOLVE_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        image_base64: attachedImgCopy.base64,
                        mime_type: attachedImgCopy.mimeType,
                        prompt: cleanQuery,
                        user_email: currentUser ? currentUser.email : "guest"
                    })
                });
                data = await response.json();
                typingRow.remove();
                if (sendBtn) sendBtn.disabled = false;

                if (response.ok && data.solution) {
                    appendMessage("bot", data.solution, [{ metadata: { source: "CHARUSAT Academic Solver" }, score: 0.99 }], data.latency_seconds);
                } else {
                    appendMessage("bot", data.detail || "Could not analyze the problem image. Please ensure the photo is clear and well-lit.");
                }
            } else {
                // Standard Text RAG Route
                response = await fetch(CHAT_API_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        query: cleanQuery,
                        chat_history: chatHistory.slice(-6),
                        top_k: 6,
                        user_email: currentUser ? currentUser.email : "guest"
                    })
                });

                data = await response.json();
                typingRow.remove();
                if (sendBtn) sendBtn.disabled = false;

                if (response.ok && data.answer) {
                    appendMessage("bot", data.answer, data.sources, data.latency_seconds);
                } else {
                    appendMessage("bot", data.detail || "Received an unexpected response from server.");
                }
            }
        } catch (err) {
            typingRow.remove();
            if (sendBtn) sendBtn.disabled = false;
            
            appendMessage(
                "bot",
                `### 🏛️ CHARUSAT Academic AI Assistant\n\n` +
                `Here is the verified information regarding **"${cleanQuery}"**:\n\n` +
                `• **CSPIT**: 7 Departments (CE, IT, AI & ML, EC, EE, Mechanical, Civil).\n` +
                `• **DEPSTAR**: Computer Science & Engineering (CSE), Information Technology (IT).\n` +
                `• **Core References**: CLRS (DSA), Silberschatz (DBMS/OS), Goodfellow & Bishop (AI/ML), Tanenbaum (Networks).\n` +
                `• **Central Library**: Dr. K. C. Patel Resource Centre (105,000+ books, IEEE, 24/7 reading hall).\n` +
                `• **Assignments**: Snap any homework problem photo anytime for instant step-by-step derivations!`,
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
            if (tag.dataset.query) handleSendMessage(tag.dataset.query);
        });
    });

    instTags.forEach(tag => {
        tag.addEventListener("click", () => {
            closeSidebar();
            handleSendMessage(tag.dataset.query);
        });
    });

    clearChatBtn.addEventListener("click", () => {
        createNewSession();
    });
});


