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

    // Campus Wi-Fi Captive Portal Elements
    const wifiPortalBtn = document.getElementById("wifi-portal-btn");
    const quickWifiBtn = document.getElementById("quick-wifi-btn");
    const wifiModalBackdrop = document.getElementById("wifi-modal-backdrop");
    const wifiModalClose = document.getElementById("wifi-modal-close");
    const wifiModalCloseBtn = document.getElementById("wifi-modal-close-btn");
    const wifiUsernameInput = document.getElementById("wifi-username-input");
    const wifiPasswordInput = document.getElementById("wifi-password-input");
    const wifiRememberCheck = document.getElementById("wifi-remember-check");
    const wifiAutoConnectBtn = document.getElementById("wifi-auto-connect-btn");
    const wifiAuthForm = document.getElementById("wifi-auth-form");

    // ChatGPT-Style User Profile Popover & Sub-Modal Elements
    const sidebarUserBtn = document.getElementById("sidebar-user-btn");
    const sidebarUserAvatar = document.getElementById("sidebar-user-avatar");
    const sidebarUserName = document.getElementById("sidebar-user-name");
    const sidebarUserPlan = document.getElementById("sidebar-user-plan");
    const chatgptProfileMenu = document.getElementById("chatgpt-profile-menu");
    const menuUserHeaderBtn = document.getElementById("menu-user-header-btn");
    const menuUserAvatar = document.getElementById("menu-user-avatar");
    const menuUserName = document.getElementById("menu-user-name");
    const menuUserPlan = document.getElementById("menu-user-plan");
    const menuUpgradeBtn = document.getElementById("menu-upgrade-btn");
    const menuPersonalizeBtn = document.getElementById("menu-personalize-btn");
    const menuProfileBtn = document.getElementById("menu-profile-btn");
    const menuSettingsBtn = document.getElementById("menu-settings-btn");
    const menuHelpBtn = document.getElementById("menu-help-btn");
    const menuLogoutBtn = document.getElementById("menu-logout-btn");

    const personalizationModalBackdrop = document.getElementById("personalization-modal-backdrop");
    const personalizeModalClose = document.getElementById("personalize-modal-close");
    const personalizeCancelBtn = document.getElementById("personalize-cancel-btn");
    const personalizationForm = document.getElementById("personalization-form");
    const prefDepartment = document.getElementById("pref-department");
    const prefLanguage = document.getElementById("pref-language");
    const prefCustomPrompt = document.getElementById("pref-custom-prompt");

    const settingsModalBackdrop = document.getElementById("settings-modal-backdrop");
    const settingsModalClose = document.getElementById("settings-modal-close");
    const settingsModalCloseBtn = document.getElementById("settings-modal-close-btn");
    const settingVoiceSpeed = document.getElementById("setting-voice-speed");
    const settingSoundToggle = document.getElementById("setting-sound-toggle");
    const settingThemeSelect = document.getElementById("setting-theme-select");
    const settingClearCacheBtn = document.getElementById("setting-clear-cache-btn");

    const upgradeModalBackdrop = document.getElementById("upgrade-modal-backdrop");
    const upgradeModalClose = document.getElementById("upgrade-modal-close");
    const upgradeModalCloseBtn = document.getElementById("upgrade-modal-close-btn");

    const helpModalBackdrop = document.getElementById("help-modal-backdrop");
    const helpModalClose = document.getElementById("help-modal-close");
    const helpModalCloseBtn = document.getElementById("help-modal-close-btn");

    // CGPA & SGPA Calculator Elements
    const cgpaCalcBtn = document.getElementById("cgpa-calc-btn");
    const quickCgpaBtn = document.getElementById("quick-cgpa-btn");
    const cgpaModalBackdrop = document.getElementById("cgpa-modal-backdrop");
    const cgpaModalClose = document.getElementById("cgpa-modal-close");
    const cgpaModalCloseBtn = document.getElementById("cgpa-modal-close-btn");
    const cgpaAddSubjectBtn = document.getElementById("cgpa-add-subject-btn");
    const cgpaResetBtn = document.getElementById("cgpa-reset-btn");
    const cgpaSubjectsBody = document.getElementById("cgpa-subjects-body");
    const cgpaResultSgpa = document.getElementById("cgpa-result-sgpa");
    const cgpaResultPercent = document.getElementById("cgpa-result-percent");
    const cgpaResultCredits = document.getElementById("cgpa-result-credits");
    const cgpaResultClass = document.getElementById("cgpa-result-class");

    // Campus Map & Navigator Elements
    const campusMapBtn = document.getElementById("campus-map-btn");
    const quickMapBtn = document.getElementById("quick-map-btn");
    const mapModalBackdrop = document.getElementById("map-modal-backdrop");
    const mapModalClose = document.getElementById("map-modal-close");
    const mapModalCloseBtn = document.getElementById("map-modal-close-btn");
    const campusBuildingsGrid = document.getElementById("campus-buildings-grid");
    const routeFromSelect = document.getElementById("route-from-select");
    const routeToSelect = document.getElementById("route-to-select");
    const mapFindRouteBtn = document.getElementById("map-find-route-btn");
    const mapDirectionsBox = document.getElementById("map-directions-box");
    const directionsSummaryText = document.getElementById("directions-summary-text");
    const directionsDescText = document.getElementById("directions-desc-text");

    // Live Voice Mode Elements
    const voiceLiveBtn = document.getElementById("voice-live-btn");
    const quickVoiceBtn = document.getElementById("quick-voice-btn");
    const voiceOverlayBackdrop = document.getElementById("voice-overlay-backdrop");
    const voiceCloseBtn = document.getElementById("voice-close-btn");
    const voiceEndCallBtn = document.getElementById("voice-end-call-btn");
    const voiceOrb = document.getElementById("voice-orb");
    const voiceStatusText = document.getElementById("voice-status-text");
    const voiceTranscriptText = document.getElementById("voice-transcript-text");
    const voiceToggleMicBtn = document.getElementById("voice-toggle-mic-btn");
    const voiceStopSpeechBtn = document.getElementById("voice-stop-speech-btn");

    // Prompt Enhancer
    const enhanceQueryBtn = document.getElementById("enhance-query-btn");

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
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get("login") === "true") {
                lockAppWorkspace();
                return;
            }

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

    function getInitials(name) {
        if (!name) return "NP";
        const parts = name.trim().split(" ");
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
        return name.slice(0, 2).toUpperCase();
    }

    function updateUIForUser(user) {
        const defaultName = "Neev Patel";
        const displayName = user ? user.name : defaultName;
        const displayInitials = getInitials(displayName);
        const displayPlan = user ? `${user.institute || "CHARUSAT"} • Pro` : "Free";

        if (sidebarUserName) sidebarUserName.textContent = displayName;
        if (sidebarUserAvatar) sidebarUserAvatar.textContent = displayInitials;
        if (sidebarUserPlan) sidebarUserPlan.textContent = displayPlan;

        if (menuUserName) menuUserName.textContent = displayName;
        if (menuUserAvatar) menuUserAvatar.textContent = displayInitials;
        if (menuUserPlan) menuUserPlan.textContent = displayPlan;

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
    // 6. ChatGPT-Style User Profile Popover & Personalization Hub
    // --------------------------------------------------------------------------
    const PERSONALIZATION_KEY = "charusat_user_personalization_v1";
    const SETTINGS_KEY = "charusat_app_settings_v1";

    function toggleProfileMenu() {
        if (!chatgptProfileMenu) return;
        const isShowing = chatgptProfileMenu.classList.contains("show");
        if (isShowing) {
            chatgptProfileMenu.classList.remove("show");
        } else {
            chatgptProfileMenu.classList.add("show");
        }
    }

    function closeProfileMenu() {
        if (chatgptProfileMenu) chatgptProfileMenu.classList.remove("show");
    }

    if (sidebarUserBtn) {
        sidebarUserBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            toggleProfileMenu();
        });
    }

    // Close menu when clicking outside
    window.addEventListener("click", (e) => {
        if (chatgptProfileMenu && chatgptProfileMenu.classList.contains("show")) {
            if (!chatgptProfileMenu.contains(e.target) && (!sidebarUserBtn || !sidebarUserBtn.contains(e.target))) {
                closeProfileMenu();
            }
        }
    });

    // Menu Item Actions
    if (menuUserHeaderBtn || menuProfileBtn) {
        const openProfile = () => {
            closeProfileMenu();
            openAuthModal();
        };
        if (menuUserHeaderBtn) menuUserHeaderBtn.addEventListener("click", openProfile);
        if (menuProfileBtn) menuProfileBtn.addEventListener("click", openProfile);
    }

    if (menuUpgradeBtn) {
        menuUpgradeBtn.addEventListener("click", () => {
            closeProfileMenu();
            if (upgradeModalBackdrop) upgradeModalBackdrop.classList.add("show");
        });
    }

    if (upgradeModalClose) upgradeModalClose.addEventListener("click", () => upgradeModalBackdrop.classList.remove("show"));
    if (upgradeModalCloseBtn) upgradeModalCloseBtn.addEventListener("click", () => upgradeModalBackdrop.classList.remove("show"));
    if (upgradeModalBackdrop) {
        upgradeModalBackdrop.addEventListener("click", (e) => {
            if (e.target === upgradeModalBackdrop) upgradeModalBackdrop.classList.remove("show");
        });
    }

    // Personalization Modal
    function loadPersonalization() {
        try {
            const raw = localStorage.getItem(PERSONALIZATION_KEY);
            if (raw) {
                const data = JSON.parse(raw);
                if (prefDepartment && data.department) prefDepartment.value = data.department;
                if (prefLanguage && data.language) prefLanguage.value = data.language;
                if (prefCustomPrompt && data.customPrompt) prefCustomPrompt.value = data.customPrompt;
            }
        } catch (e) {}
    }

    function savePersonalization() {
        const data = {
            department: prefDepartment ? prefDepartment.value : "CSPIT - AI & ML",
            language: prefLanguage ? prefLanguage.value : "gujlish",
            customPrompt: prefCustomPrompt ? prefCustomPrompt.value.trim() : ""
        };
        localStorage.setItem(PERSONALIZATION_KEY, JSON.stringify(data));
        showToast("⚡ Personalization preferences saved!");
    }

    if (menuPersonalizeBtn) {
        menuPersonalizeBtn.addEventListener("click", () => {
            closeProfileMenu();
            loadPersonalization();
            if (personalizationModalBackdrop) personalizationModalBackdrop.classList.add("show");
        });
    }

    if (personalizeModalClose) personalizeModalClose.addEventListener("click", () => personalizationModalBackdrop.classList.remove("show"));
    if (personalizeCancelBtn) personalizeCancelBtn.addEventListener("click", () => personalizationModalBackdrop.classList.remove("show"));
    if (personalizationModalBackdrop) {
        personalizationModalBackdrop.addEventListener("click", (e) => {
            if (e.target === personalizationModalBackdrop) personalizationModalBackdrop.classList.remove("show");
        });
    }
    if (personalizationForm) {
        personalizationForm.addEventListener("submit", (e) => {
            e.preventDefault();
            savePersonalization();
            personalizationModalBackdrop.classList.remove("show");
        });
    }

    // Settings Modal
    function loadSettings() {
        try {
            const raw = localStorage.getItem(SETTINGS_KEY);
            if (raw) {
                const data = JSON.parse(raw);
                if (settingVoiceSpeed && data.voiceSpeed) settingVoiceSpeed.value = data.voiceSpeed;
                if (settingSoundToggle) settingSoundToggle.checked = !!data.soundEnabled;
                if (settingThemeSelect && data.theme) {
                    settingThemeSelect.value = data.theme;
                    applyTheme(data.theme);
                }
            }
        } catch (e) {}
    }

    function saveSettings() {
        const data = {
            voiceSpeed: settingVoiceSpeed ? settingVoiceSpeed.value : "1.0",
            soundEnabled: settingSoundToggle ? settingSoundToggle.checked : true,
            theme: settingThemeSelect ? settingThemeSelect.value : "charusat-dark"
        };
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(data));
    }

    function applyTheme(themeName) {
        if (themeName === "midnight-black") {
            document.documentElement.style.setProperty("--charusat-deep-navy", "#000000");
            document.documentElement.style.setProperty("--charusat-sidebar-bg", "#09090b");
            document.documentElement.style.setProperty("--charusat-chat-bg", "#000000");
        } else if (themeName === "cyber-blue") {
            document.documentElement.style.setProperty("--charusat-deep-navy", "#061826");
            document.documentElement.style.setProperty("--charusat-sidebar-bg", "#0a2239");
            document.documentElement.style.setProperty("--charusat-chat-bg", "#040f1a");
        } else {
            document.documentElement.style.removeProperty("--charusat-deep-navy");
            document.documentElement.style.removeProperty("--charusat-sidebar-bg");
            document.documentElement.style.removeProperty("--charusat-chat-bg");
        }
    }

    if (settingThemeSelect) {
        settingThemeSelect.addEventListener("change", (e) => {
            applyTheme(e.target.value);
            saveSettings();
        });
    }

    if (settingVoiceSpeed) settingVoiceSpeed.addEventListener("change", saveSettings);
    if (settingSoundToggle) settingSoundToggle.addEventListener("change", saveSettings);

    if (settingClearCacheBtn) {
        settingClearCacheBtn.addEventListener("click", () => {
            if (confirm("Clear local cache, saved forms and offline drafts?")) {
                localStorage.removeItem(WIFI_CREDS_KEY);
                localStorage.removeItem(PERSONALIZATION_KEY);
                showToast("🗑️ Local cache and temporary data cleared.");
            }
        });
    }

    if (menuSettingsBtn) {
        menuSettingsBtn.addEventListener("click", () => {
            closeProfileMenu();
            loadSettings();
            if (settingsModalBackdrop) settingsModalBackdrop.classList.add("show");
        });
    }

    if (settingsModalClose) settingsModalClose.addEventListener("click", () => settingsModalBackdrop.classList.remove("show"));
    if (settingsModalCloseBtn) settingsModalCloseBtn.addEventListener("click", () => settingsModalBackdrop.classList.remove("show"));
    if (settingsModalBackdrop) {
        settingsModalBackdrop.addEventListener("click", (e) => {
            if (e.target === settingsModalBackdrop) settingsModalBackdrop.classList.remove("show");
        });
    }

    // Help Modal
    if (menuHelpBtn) {
        menuHelpBtn.addEventListener("click", () => {
            closeProfileMenu();
            if (helpModalBackdrop) helpModalBackdrop.classList.add("show");
        });
    }

    if (helpModalClose) helpModalClose.addEventListener("click", () => helpModalBackdrop.classList.remove("show"));
    if (helpModalCloseBtn) helpModalCloseBtn.addEventListener("click", () => helpModalBackdrop.classList.remove("show"));
    if (helpModalBackdrop) {
        helpModalBackdrop.addEventListener("click", (e) => {
            if (e.target === helpModalBackdrop) helpModalBackdrop.classList.remove("show");
        });
    }

    // Logout from Popover
    if (menuLogoutBtn) {
        menuLogoutBtn.addEventListener("click", () => {
            closeProfileMenu();
            saveUserSession(null);
            showToast("Signed out successfully.");
        });
    }

    // Initialize saved settings
    loadSettings();

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

            const pdfBtn = document.createElement("button");
            pdfBtn.className = "action-icon-btn";
            pdfBtn.title = "Export solution as PDF / Study Notes";
            pdfBtn.innerHTML = `<span>📄</span> PDF Notes`;
            pdfBtn.addEventListener("click", () => {
                exportToPdf(text);
            });
            btnGroup.appendChild(pdfBtn);

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

                    const pdfBtn = document.createElement("button");
                    pdfBtn.className = "action-icon-btn";
                    pdfBtn.title = "Export solution as PDF / Study Notes";
                    pdfBtn.innerHTML = `<span>📄</span> PDF Notes`;
                    pdfBtn.addEventListener("click", () => exportToPdf(msg.text));
                    btnGroup.appendChild(pdfBtn);

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
    // 9. Campus Wi-Fi Captive Portal & 1-Click Fast Connect Logic
    // --------------------------------------------------------------------------
    const WIFI_CREDS_KEY = "charusat_wifi_credentials_v1";

    function loadSavedWifiCredentials() {
        try {
            const raw = localStorage.getItem(WIFI_CREDS_KEY);
            if (raw) {
                const creds = JSON.parse(raw);
                if (wifiUsernameInput && creds.username) wifiUsernameInput.value = creds.username;
                if (wifiPasswordInput && creds.password) wifiPasswordInput.value = creds.password;
                if (wifiRememberCheck) wifiRememberCheck.checked = true;
            }
        } catch (e) {}
    }

    function saveWifiCredentials() {
        if (!wifiUsernameInput || !wifiPasswordInput) return;
        if (wifiRememberCheck && wifiRememberCheck.checked) {
            const creds = {
                username: wifiUsernameInput.value.trim(),
                password: wifiPasswordInput.value
            };
            localStorage.setItem(WIFI_CREDS_KEY, JSON.stringify(creds));
        } else {
            localStorage.removeItem(WIFI_CREDS_KEY);
        }
    }

    function openWifiModal() {
        if (wifiModalBackdrop) wifiModalBackdrop.classList.add("show");
        loadSavedWifiCredentials();
    }

    function closeWifiModal() {
        if (wifiModalBackdrop) wifiModalBackdrop.classList.remove("show");
    }

    if (wifiPortalBtn) wifiPortalBtn.addEventListener("click", openWifiModal);
    if (quickWifiBtn) quickWifiBtn.addEventListener("click", openWifiModal);
    if (wifiModalClose) wifiModalClose.addEventListener("click", closeWifiModal);
    if (wifiModalCloseBtn) wifiModalCloseBtn.addEventListener("click", closeWifiModal);
    if (wifiModalBackdrop) {
        wifiModalBackdrop.addEventListener("click", (e) => {
            if (e.target === wifiModalBackdrop) closeWifiModal();
        });
    }

    if (wifiAutoConnectBtn) {
        wifiAutoConnectBtn.addEventListener("click", () => {
            saveWifiCredentials();
            showToast("🚀 Authenticating with CHARUSAT Gateway (172.16.0.1)...");
            if (wifiAuthForm) wifiAuthForm.submit();
        });
    }

    if (wifiAuthForm) {
        wifiAuthForm.addEventListener("submit", () => {
            saveWifiCredentials();
            showToast("🚀 Connecting to Wi-Fi Gateway...");
        });
    }

    // --------------------------------------------------------------------------
    // 10. Send Message Handler (Multimodal Vision + Text RAG)
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
            
            const qLower = cleanQuery.toLowerCase();
            const isOutOfDomain = /iphone|ipad|macbook|samsung|price|cook|food|recipe|movie|bollywood|cricket|score|nirma|daiict|parul|gtu|iit/i.test(qLower);

            if (isOutOfDomain) {
                appendMessage(
                    "bot",
                    `### 🏛️ CHARUSAT Virtual Intelligence\n\n` +
                    `Hu fakt **Charotar University of Science and Technology (CHARUSAT)** no dedicated AI Assistant chu.\n\n` +
                    `⚠️ **Aa query CHARUSAT na academic / campus domain ni bahaar ni che, etle hu eno javab aapi shakto nathi.**\n\n` +
                    `Tame mane **CHARUSAT Campus** na vishe kai pan puchhi shako cho, jem ke:\n` +
                    `• **Constituent Institutes**: CSPIT, DEPSTAR, CMPICA, RPCP, I2IM, PDPIAS, MTIN, ARIP, BDIAS\n` +
                    `• **Admissions & Cutoffs**: ACPC Gujarat, GUJCET, JEE Main merit\n` +
                    `• **Degrees**: B.Tech, BCA, MCA, MBA, B.Pharm, Physiotherapy, Nursing, Applied Sciences\n` +
                    `• **Campus Life**: Central Library books, AC/Non-AC Hostels, Transportation, 32.5+ LPA Placements`
                );
            } else {
                appendMessage(
                    "bot",
                    `⚠️ Server connect karva ma issue aave che. Krupaya check karo ke backend active che.`
                );
            }
        }
    }

    // --------------------------------------------------------------------------
    // 11. PDF Notes Exporter & Document Generator
    // --------------------------------------------------------------------------
    function exportToPdf(rawMarkdown) {
        const titleMatch = rawMarkdown.match(/^###?\s*(.+)$/m);
        const docTitle = titleMatch ? titleMatch[1].replace(/[*_#]/g, "").trim() : "CHARUSAT Academic Study Notes";
        const cleanHtml = parseMarkdown(rawMarkdown);

        const printWindow = window.open("", "_blank");
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${escapeHtml(docTitle)} - CHARUSAT</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
                    body {
                        font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
                        color: #1e293b;
                        background: #ffffff;
                        padding: 40px;
                        line-height: 1.6;
                        max-width: 800px;
                        margin: 0 auto;
                    }
                    .header {
                        border-bottom: 2px solid #0066B3;
                        padding-bottom: 15px;
                        margin-bottom: 25px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                    .header-title h1 {
                        font-size: 20px;
                        color: #0066B3;
                        margin: 0;
                        font-weight: 800;
                    }
                    .header-title p {
                        font-size: 11px;
                        color: #64748b;
                        margin: 2px 0 0;
                    }
                    .badge {
                        background: #f8fafc;
                        border: 1px solid #cbd5e1;
                        padding: 4px 10px;
                        border-radius: 6px;
                        font-size: 11px;
                        font-weight: 600;
                        color: #0066B3;
                    }
                    .content {
                        font-size: 13.5px;
                    }
                    h1, h2, h3, h4 {
                        color: #0f172a;
                        margin-top: 20px;
                        margin-bottom: 8px;
                    }
                    code {
                        font-family: 'JetBrains Mono', monospace;
                        background: #f1f5f9;
                        padding: 2px 5px;
                        border-radius: 4px;
                        font-size: 12px;
                    }
                    pre {
                        background: #0f172a;
                        color: #f8fafc;
                        padding: 14px;
                        border-radius: 8px;
                        overflow-x: auto;
                        font-family: 'JetBrains Mono', monospace;
                        font-size: 12px;
                    }
                    pre code {
                        background: transparent;
                        color: inherit;
                        padding: 0;
                    }
                    ul, ol {
                        padding-left: 20px;
                        margin: 8px 0;
                    }
                    li {
                        margin-bottom: 4px;
                    }
                    .footer {
                        margin-top: 40px;
                        border-top: 1px solid #e2e8f0;
                        padding-top: 15px;
                        font-size: 11px;
                        color: #94a3b8;
                        text-align: center;
                    }
                    @media print {
                        body { padding: 20px; }
                        button { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="header-title">
                        <h1>CHAROTAR UNIVERSITY OF SCIENCE AND TECHNOLOGY</h1>
                        <p>CHARUSAT Virtual Intelligence • Academic Verification System</p>
                    </div>
                    <div class="badge">Official Study Notes</div>
                </div>
                <div class="content">
                    ${cleanHtml}
                </div>
                <div class="footer">
                    Generated via CHARUSAT Virtual Intelligence AI Assistant • ${new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })} • Changa, Gujarat
                </div>
                <script>
                    window.onload = function() {
                        setTimeout(function() { window.print(); }, 500);
                    };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
        showToast("📄 Generating printable PDF study notes...");
    }

    // --------------------------------------------------------------------------
    // 12. Smart Prompt Enhancer & Polisher
    // --------------------------------------------------------------------------
    function enhanceCurrentPrompt() {
        if (!userInput) return;
        const query = userInput.value.trim();
        if (!query) {
            userInput.value = "Explain the core syllabus, reference textbooks, and lab experiments in detail.";
            userInput.focus();
            showToast("✨ Sample academic prompt added!");
            return;
        }

        const qLower = query.toLowerCase();
        let enhanced = query;

        if (qLower.includes("aiml") || qLower.includes("ai & ml") || qLower.includes("machine learning")) {
            enhanced = "Please provide the complete, detailed semester-wise core curriculum, reference textbooks (Bishop, Goodfellow), and NVIDIA GPU lab experiments for CSPIT AI & ML department.";
        } else if (qLower.includes("dsa") || qLower.includes("data structure") || qLower.includes("algorithm")) {
            enhanced = "Explain Data Structures & Algorithms concepts with step-by-step logic, CLRS reference chapters, C++/Python implementation, and Time/Space complexity analysis.";
        } else if (qLower.includes("canteen") || qLower.includes("food")) {
            enhanced = "List all on-campus canteens (Shreeji), Nescafe kiosks, Amul parlour, and newly opened student food hubs around CHARUSAT with menu highlights and timings.";
        } else if (qLower.includes("wifi") || qLower.includes("internet")) {
            enhanced = "Provide direct 1-click captive portal login URLs (172.16.0.1:8090), credentials format, and troubleshooting steps for CHARUSAT campus Wi-Fi.";
        } else if (qLower.includes("cgpa") || qLower.includes("sgpa") || qLower.includes("grade")) {
            enhanced = "Explain CHARUSAT 10-point academic grading scale, SGPA/CGPA calculation formulas, and passing criteria according to university examination rules.";
        } else {
            enhanced = `Please provide a detailed, verified, and exam-ready explanation regarding: "${query}". Include key concepts, examples, and relevant CHARUSAT academic context.`;
        }

        userInput.value = enhanced;
        userInput.focus();
        showToast("✨ Prompt polished for high-yield AI solution!");
    }

    if (enhanceQueryBtn) {
        enhanceQueryBtn.addEventListener("click", enhanceCurrentPrompt);
    }

    // --------------------------------------------------------------------------
    // 13. Interactive CGPA / SGPA University Calculator
    // --------------------------------------------------------------------------
    const DEFAULT_SUBJECTS = [
        { name: "Design & Analysis of Algorithms", credits: 4, grade: 9 }, // A+
        { name: "Database Management Systems", credits: 4, grade: 8 }, // A
        { name: "Operating Systems", credits: 4, grade: 9 }, // A+
        { name: "Computer Networks", credits: 4, grade: 8 }, // A
        { name: "University Elective / Python Lab", credits: 4, grade: 10 } // O
    ];

    let currentSubjects = [...DEFAULT_SUBJECTS];

    function calculateCgpa() {
        let totalCredits = 0;
        let totalPoints = 0;

        const rows = cgpaSubjectsBody ? cgpaSubjectsBody.querySelectorAll("tr") : [];
        rows.forEach(row => {
            const credInput = row.querySelector(".cgpa-cred-input");
            const gradeSelect = row.querySelector(".cgpa-grade-select");
            if (credInput && gradeSelect) {
                const cred = parseFloat(credInput.value) || 0;
                const gp = parseFloat(gradeSelect.value) || 0;
                totalCredits += cred;
                totalPoints += (cred * gp);
            }
        });

        const sgpa = totalCredits > 0 ? (totalPoints / totalCredits) : 0;
        const percent = sgpa > 0 ? ((sgpa - 0.5) * 10) : 0;

        let classDist = "Pass Class (P)";
        if (sgpa >= 8.5) classDist = "Distinction (O / A+)";
        else if (sgpa >= 7.5) classDist = "First Class with Distinction";
        else if (sgpa >= 6.5) classDist = "First Class (A / B+)";
        else if (sgpa >= 5.5) classDist = "Higher Second Class (B)";
        else if (sgpa >= 4.5) classDist = "Second Class (C)";

        if (cgpaResultSgpa) cgpaResultSgpa.textContent = sgpa.toFixed(2);
        if (cgpaResultPercent) cgpaResultPercent.textContent = percent.toFixed(1) + "%";
        if (cgpaResultCredits) cgpaResultCredits.textContent = totalCredits;
        if (cgpaResultClass) cgpaResultClass.textContent = classDist;
    }

    function renderCgpaRows() {
        if (!cgpaSubjectsBody) return;
        cgpaSubjectsBody.innerHTML = currentSubjects.map((s, idx) => `
            <tr>
                <td>
                    <input type="text" class="cgpa-input cgpa-name-input" value="${escapeHtml(s.name)}" placeholder="Subject Name" />
                </td>
                <td>
                    <input type="number" min="1" max="8" class="cgpa-input cgpa-cred-input" value="${s.credits}" />
                </td>
                <td>
                    <select class="cgpa-input cgpa-grade-select">
                        <option value="10" ${s.grade === 10 ? "selected" : ""}>O (90-100%) - 10 Pt</option>
                        <option value="9" ${s.grade === 9 ? "selected" : ""}>A+ (80-89%) - 9 Pt</option>
                        <option value="8" ${s.grade === 8 ? "selected" : ""}>A (70-79%) - 8 Pt</option>
                        <option value="7" ${s.grade === 7 ? "selected" : ""}>B+ (60-69%) - 7 Pt</option>
                        <option value="6" ${s.grade === 6 ? "selected" : ""}>B (50-59%) - 6 Pt</option>
                        <option value="5" ${s.grade === 5 ? "selected" : ""}>C (45-49%) - 5 Pt</option>
                        <option value="4" ${s.grade === 4 ? "selected" : ""}>P (40-44%) - 4 Pt</option>
                        <option value="0" ${s.grade === 0 ? "selected" : ""}>F (&lt;40%) - 0 Pt</option>
                    </select>
                </td>
                <td>
                    <button type="button" class="cgpa-del-btn" data-idx="${idx}" title="Delete Row">✕</button>
                </td>
            </tr>
        `).join("");

        cgpaSubjectsBody.querySelectorAll(".cgpa-cred-input, .cgpa-grade-select").forEach(el => {
            el.addEventListener("input", calculateCgpa);
        });

        cgpaSubjectsBody.querySelectorAll(".cgpa-del-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const idx = parseInt(btn.dataset.idx);
                currentSubjects.splice(idx, 1);
                renderCgpaRows();
            });
        });

        calculateCgpa();
    }

    if (cgpaAddSubjectBtn) {
        cgpaAddSubjectBtn.addEventListener("click", () => {
            currentSubjects.push({ name: `Subject ${currentSubjects.length + 1}`, credits: 4, grade: 8 });
            renderCgpaRows();
        });
    }

    if (cgpaResetBtn) {
        cgpaResetBtn.addEventListener("click", () => {
            currentSubjects = [...DEFAULT_SUBJECTS];
            renderCgpaRows();
            showToast("🔄 Calculator reset to defaults.");
        });
    }

    function openCgpaModal() {
        if (cgpaModalBackdrop) cgpaModalBackdrop.classList.add("show");
        renderCgpaRows();
    }

    function closeCgpaModal() {
        if (cgpaModalBackdrop) cgpaModalBackdrop.classList.remove("show");
    }

    if (cgpaCalcBtn) cgpaCalcBtn.addEventListener("click", openCgpaModal);
    if (quickCgpaBtn) quickCgpaBtn.addEventListener("click", openCgpaModal);
    if (cgpaModalClose) cgpaModalClose.addEventListener("click", closeCgpaModal);
    if (cgpaModalCloseBtn) cgpaModalCloseBtn.addEventListener("click", closeCgpaModal);
    if (cgpaModalBackdrop) {
        cgpaModalBackdrop.addEventListener("click", (e) => {
            if (e.target === cgpaModalBackdrop) closeCgpaModal();
        });
    }

    // --------------------------------------------------------------------------
    // 14. Interactive 120-Acre Campus Map & Location Navigator
    // --------------------------------------------------------------------------
    const CAMPUS_BUILDINGS = [
        {
            id: "cspit",
            name: "CSPIT Engineering Complex",
            icon: "💻",
            desc: "7 Departments (CE, IT, AI&ML, EC, EE, ME, Civil), NVIDIA GPU Cluster, Robotics Lab, Mechanical Workshops.",
            loc: "Blocks 1-4, Central Academic Zone",
            query: "Tell me all departments, laboratories, and facilities inside CSPIT Engineering Complex"
        },
        {
            id: "depstar",
            name: "DEPSTAR Building",
            icon: "🚀",
            desc: "Devang Patel Institute: CSE & IT, Apple iOS Swift Development Lab, Cloud Computing & AI Centers.",
            loc: "East Academic Wing",
            query: "What facilities, Apple lab, and programs are located in DEPSTAR?"
        },
        {
            id: "library",
            name: "Dr. K. C. Patel Central Library (KRC)",
            icon: "📚",
            desc: "105,000+ books, IEEE Xplore, ScienceDirect digital lab, and 24/7 exam reading hall.",
            loc: "Opposite CSPIT Admin Plaza",
            query: "Which books, digital resources and timings are available at Central Library?"
        },
        {
            id: "cmpica",
            name: "CMPICA (Computer Applications)",
            icon: "🖥️",
            desc: "BCA, MCA, M.Sc IT, Full-Stack Web Innovation Labs, Mobile App Prototyping.",
            loc: "Adjacent to Central Library",
            query: "What courses and labs are inside CMPICA building?"
        },
        {
            id: "rpcp",
            name: "RPCP (Pharmacy College)",
            icon: "💊",
            desc: "B.Pharm, M.Pharm, Medicinal Chemistry, Pharmacology & Formulation R&D Labs.",
            loc: "South Campus Wing",
            query: "Explain pharmacy laboratories and research facilities in RPCP"
        },
        {
            id: "i2im",
            name: "I2IM (Management Studies)",
            icon: "📈",
            desc: "BBA, MBA, Financial Simulation Lab, Live Case Study Amphitheater, Executive Boardroom.",
            loc: "South-West Wing",
            query: "What MBA specializations and simulation labs are in I2IM?"
        },
        {
            id: "canteen",
            name: "Shreeji Central Canteen & Food Court",
            icon: "🍔",
            desc: "Main university cafeteria (Punjabi, Chinese, South Indian, Sandwiches, Puffs, Chai-Coffee).",
            loc: "Central Sports Plaza",
            query: "What food items, timings, and prices are available at Shreeji Canteen?"
        },
        {
            id: "hospital",
            name: "CHARUSAT Hospital (CHRF) & Medical Wing",
            icon: "🏥",
            desc: "24/7 Emergency Medical Care, Ambulance, MTIN Nursing, ARIP Physiotherapy, BDIAS.",
            loc: "Gate No. 2, Changa Road",
            query: "What medical facilities and nursing colleges are near CHARUSAT Hospital?"
        },
        {
            id: "lotus",
            name: "Lotus Complex & Ramdev Hub",
            icon: "☕",
            desc: "Tea Post (The Desi Cafe), Hot N Spicy (Famous Puffs & Frankies), Kingsman Eatery.",
            loc: "Directly Outside Gate No. 2",
            query: "What cafes, Tea Post and food spots are in Lotus Complex outside campus?"
        },
        {
            id: "hostels",
            name: "University Hostels & Sports Ground",
            icon: "🏢",
            desc: "AC & Non-AC Boys/Girls Hostels, Mess Dining Hall, Cricket Ground, Basketball Courts.",
            loc: "North Campus Residential Zone",
            query: "Tell me about hostel rooms, mess food, and sports facilities at CHARUSAT"
        }
    ];

    const CAMPUS_ROUTES = {
        "gate1-cspit": "Enter Gate 1 -> Walk straight past the central fountain and administrative lawn -> CSPIT Building is right in front (1 min, 90m).",
        "cspit-canteen": "Exit CSPIT Block 2 -> Head South past the open auditorium -> Shreeji Canteen is adjacent to the sports ground (2 mins, 150m).",
        "cspit-library": "Exit CSPIT Main Entrance -> Cross the central plaza -> Central Library (KRC) is directly opposite (1 min, 60m).",
        "cspit-depstar": "Walk East along the main academic boulevard -> DEPSTAR building is situated on the left wing (2 mins, 180m).",
        "gate1-canteen": "Enter Gate 1 -> Walk straight along the main tree-lined road past CSPIT -> Reach Shreeji Canteen & Sports Plaza (3 mins, 240m).",
        "canteen-lotus": "Walk South from sports ground towards Gate 2 -> Exit Gate 2 -> Lotus Complex & Tea Post is immediately opposite (4 mins, 300m).",
        "hostels-cspit": "Head South from the residential blocks along the paved walkway -> Arrive at CSPIT Academic Complex (4 mins, 350m)."
    };

    function renderCampusMap() {
        if (!campusBuildingsGrid) return;
        campusBuildingsGrid.innerHTML = CAMPUS_BUILDINGS.map(b => `
            <div class="building-node-card" data-query="${escapeHtml(b.query)}">
                <div class="node-header">
                    <span class="node-icon">${b.icon}</span>
                    <span class="node-title">${b.name}</span>
                </div>
                <span class="node-desc">${b.desc}</span>
                <div class="node-action">📍 ${b.loc} • 💬 Ask AI →</div>
            </div>
        `).join("");

        campusBuildingsGrid.querySelectorAll(".building-node-card").forEach(card => {
            card.addEventListener("click", () => {
                closeMapModal();
                handleSendMessage(card.dataset.query);
            });
        });
    }

    if (mapFindRouteBtn) {
        mapFindRouteBtn.addEventListener("click", () => {
            const from = routeFromSelect.value;
            const to = routeToSelect.value;

            if (from === to) {
                if (directionsSummaryText) directionsSummaryText.textContent = "You are already at this location!";
                if (directionsDescText) directionsDescText.textContent = "Selected source and destination are the same building.";
                if (mapDirectionsBox) mapDirectionsBox.style.display = "block";
                return;
            }

            const routeKey1 = `${from}-${to}`;
            const routeKey2 = `${to}-${from}`;
            const routeDesc = CAMPUS_ROUTES[routeKey1] || CAMPUS_ROUTES[routeKey2] || 
                `Follow the central paved boulevard from ${routeFromSelect.options[routeFromSelect.selectedIndex].text} towards ${routeToSelect.options[routeToSelect.selectedIndex].text}. Walking distance is approximately 2 to 4 minutes (150-300m) with campus directional signboards.`;

            if (directionsSummaryText) directionsSummaryText.textContent = `Route: ${routeFromSelect.options[routeFromSelect.selectedIndex].text} ➔ ${routeToSelect.options[routeToSelect.selectedIndex].text}`;
            if (directionsDescText) directionsDescText.textContent = routeDesc;
            if (mapDirectionsBox) mapDirectionsBox.style.display = "block";
        });
    }

    function openMapModal() {
        if (mapModalBackdrop) mapModalBackdrop.classList.add("show");
        renderCampusMap();
    }

    function closeMapModal() {
        if (mapModalBackdrop) mapModalBackdrop.classList.remove("show");
    }

    if (campusMapBtn) campusMapBtn.addEventListener("click", openMapModal);
    if (quickMapBtn) quickMapBtn.addEventListener("click", openMapModal);
    if (mapModalClose) mapModalClose.addEventListener("click", closeMapModal);
    if (mapModalCloseBtn) mapModalCloseBtn.addEventListener("click", closeMapModal);
    if (mapModalBackdrop) {
        mapModalBackdrop.addEventListener("click", (e) => {
            if (e.target === mapModalBackdrop) closeMapModal();
        });
    }

    // --------------------------------------------------------------------------
    // 15. ChatGPT / Gemini Live Voice Mode Controller
    // --------------------------------------------------------------------------
    let voiceRecognition = null;
    let isVoiceActive = false;

    function initVoiceRecognition() {
        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRec) {
            showToast("⚠️ Speech Recognition is supported in Chrome, Edge, and Safari.");
            return null;
        }

        const rec = new SpeechRec();
        rec.continuous = false;
        rec.interimResults = true;
        rec.lang = "en-US";

        rec.onstart = () => {
            if (voiceStatusText) voiceStatusText.textContent = "Listening... Speak your query";
            if (voiceOrb) voiceOrb.classList.remove("speaking");
        };

        rec.onresult = (e) => {
            const transcript = Array.from(e.results).map(r => r[0].transcript).join("");
            if (voiceTranscriptText) voiceTranscriptText.textContent = `"${transcript}"`;
            if (e.results[0].isFinal) {
                processVoiceQuery(transcript);
            }
        };

        rec.onerror = () => {
            if (voiceStatusText) voiceStatusText.textContent = "Paused. Tap mic to speak again.";
        };

        rec.onend = () => {
            if (isVoiceActive && !window.speechSynthesis.speaking) {
                try { rec.start(); } catch (e) {}
            }
        };

        return rec;
    }

    async function processVoiceQuery(queryText) {
        if (!queryText || !queryText.trim()) return;
        if (voiceStatusText) voiceStatusText.textContent = "Thinking & synthesizing...";
        if (voiceOrb) voiceOrb.classList.add("speaking");

        try {
            const res = await fetch(CHAT_API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    query: queryText,
                    chat_history: chatHistory.slice(-4),
                    user_email: currentUser ? currentUser.email : "guest"
                })
            });

            const data = await res.json();
            const answer = data.answer || "I found verified information in the CHARUSAT knowledge base.";
            
            if (voiceTranscriptText) voiceTranscriptText.textContent = `"${answer.replace(/[*_#`]/g, "").slice(0, 180)}..."`;
            if (voiceStatusText) voiceStatusText.textContent = "Speaking response...";

            appendMessage("user", queryText);
            appendMessage("bot", answer, data.sources, data.latency_seconds);

            speakText(answer, () => {
                if (voiceOrb) voiceOrb.classList.remove("speaking");
                if (voiceStatusText) voiceStatusText.textContent = "Listening... Speak next question";
                if (isVoiceActive && voiceRecognition) {
                    try { voiceRecognition.start(); } catch (e) {}
                }
            });
        } catch (e) {
            if (voiceStatusText) voiceStatusText.textContent = "Could not connect to AI engine.";
            if (voiceOrb) voiceOrb.classList.remove("speaking");
        }
    }

    function openVoiceMode() {
        isVoiceActive = true;
        if (voiceOverlayBackdrop) voiceOverlayBackdrop.classList.add("show");
        if (!voiceRecognition) voiceRecognition = initVoiceRecognition();
        if (voiceRecognition) {
            try { voiceRecognition.start(); } catch (e) {}
        }
    }

    function closeVoiceMode() {
        isVoiceActive = false;
        if (voiceOverlayBackdrop) voiceOverlayBackdrop.classList.remove("show");
        if (voiceRecognition) {
            try { voiceRecognition.stop(); } catch (e) {}
        }
        if (window.speechSynthesis) window.speechSynthesis.cancel();
    }

    if (voiceLiveBtn) voiceLiveBtn.addEventListener("click", openVoiceMode);
    if (quickVoiceBtn) quickVoiceBtn.addEventListener("click", openVoiceMode);
    if (voiceCloseBtn) voiceCloseBtn.addEventListener("click", closeVoiceMode);
    if (voiceEndCallBtn) voiceEndCallBtn.addEventListener("click", closeVoiceMode);
    if (voiceStopSpeechBtn) {
        voiceStopSpeechBtn.addEventListener("click", () => {
            if (window.speechSynthesis) window.speechSynthesis.cancel();
            if (voiceOrb) voiceOrb.classList.remove("speaking");
            if (voiceStatusText) voiceStatusText.textContent = "Audio stopped. Tap mic to speak.";
        });
    }

    if (voiceToggleMicBtn) {
        voiceToggleMicBtn.addEventListener("click", () => {
            if (voiceRecognition) {
                try {
                    voiceRecognition.start();
                    voiceToggleMicBtn.classList.add("active");
                } catch (e) {
                    voiceRecognition.stop();
                    voiceToggleMicBtn.classList.remove("active");
                }
            }
        });
    }

    // --------------------------------------------------------------------------
    // 16. Regular Event Handlers
    // --------------------------------------------------------------------------
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



