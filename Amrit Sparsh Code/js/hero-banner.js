(function () {
    // ---- CONFIG & DEFAULTS ----
    const defaultConfig = {
        // Colors (5 total, ordered by visual prominence)
        background_color: "#ffffff",        // BACKGROUND - pure white
        surface_color: "#f0fdfa",           // SECONDARY_SURFACE - very light teal
        text_color: "#0f172a",              // TEXT - dark slate
        primary_action_color: "#14b8a6",    // PRIMARY_ACTION - teal
        secondary_action_color: "#06b6d4",  // SECONDARY_ACTION - cyan/aqua

        // Typography
        font_family: "system-ui",
        font_size: 18, // base size

        // Copy
        main_line: "Every heartbeat matters. AI just helps protect it better.",
        sub_line: "",
        footer_note: ""
    };

    // DOM references
    const root = document.getElementById("app-root");
    const bannerContainer = document.getElementById("banner-container");
    const bannerBg = document.getElementById("banner-bg");
    const bgGradientLeft = document.getElementById("bg-gradient-left");
    const bgGradientRight = document.getElementById("bg-gradient-right");

    const badge = document.getElementById("badge");
    const badgePulseOuter = document.getElementById("badge-pulse-outer");
    const badgePulseInner = document.getElementById("badge-pulse-inner");
    const badgeText = document.getElementById("badge-text");

    const headline = document.getElementById("headline");
    const subLineEl = document.getElementById("sub-line");
    const footerNoteEl = document.getElementById("footer-note");

    const orbContainer = document.getElementById("orb-container");
    const orbOuterGlow = document.getElementById("orb-outer-glow");
    const orbRing1 = document.getElementById("orb-ring-1");
    const orbRing2 = document.getElementById("orb-ring-2");
    const orbSphere = document.getElementById("orb-sphere");
    const orbEcgContainer = document.getElementById("orb-ecg-container");

    const particle1 = document.getElementById("particle-1");
    const particle2 = document.getElementById("particle-2");
    const particle3 = document.getElementById("particle-3");
    const particle4 = document.getElementById("particle-4");

    // Apply config-driven styles & text
    async function onConfigChange(config) {
        const cfg = Object.assign({}, defaultConfig, config || {});

        const baseFont = cfg.font_family || defaultConfig.font_family;
        const fontStack = baseFont + ", system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
        const baseSize = Number(cfg.font_size) || defaultConfig.font_size;

        // Colors
        const bgColor = cfg.background_color || defaultConfig.background_color;
        const surfaceColor = cfg.surface_color || defaultConfig.surface_color;
        const textColor = cfg.text_color || defaultConfig.text_color;
        const primaryColor = cfg.primary_action_color || defaultConfig.primary_action_color;
        const secondaryColor = cfg.secondary_action_color || defaultConfig.secondary_action_color;

        // Root background - pure white
        if (root) root.style.backgroundColor = bgColor;

        // Banner container background
        if (bannerContainer) bannerContainer.style.backgroundColor = bgColor;

        // Soft gradient edges
        if (bgGradientLeft) bgGradientLeft.style.background =
            "radial-gradient(circle, " + surfaceColor + ", transparent 70%)";
        if (bgGradientRight) bgGradientRight.style.background =
            "radial-gradient(circle, " + primaryColor + "15, transparent 70%)";

        // Badge styling
        if (badge) {
            badge.style.backgroundColor = surfaceColor;
            badge.style.border = "1px solid " + primaryColor + "30";
        }

        if (badgePulseOuter) {
            badgePulseOuter.style.backgroundColor = primaryColor + "40";
            badgePulseOuter.style.boxShadow = "0 0 10px " + primaryColor + "60";
        }
        if (badgePulseInner) badgePulseInner.style.backgroundColor = primaryColor;

        if (badgeText) {
            badgeText.style.color = primaryColor;
            badgeText.style.fontFamily = fontStack;
            badgeText.style.fontSize = (baseSize * 0.6) + "px";
        }

        // Headline
        if (headline) {
            headline.style.color = textColor;
            headline.style.fontFamily = fontStack;
            headline.style.fontSize = (baseSize * 2) + "px";
            headline.textContent = cfg.main_line || defaultConfig.main_line;
        }

        // Sub line
        if (subLineEl) {
            subLineEl.style.color = textColor;
            subLineEl.style.opacity = "0.75";
            subLineEl.style.fontFamily = fontStack;
            subLineEl.style.fontSize = (baseSize * 1.05) + "px";
            subLineEl.textContent = cfg.sub_line || "";
            subLineEl.style.display = (cfg.sub_line && cfg.sub_line.trim() !== "") ? "block" : "none";
        }

        // Footer note
        if (footerNoteEl) {
            footerNoteEl.style.color = textColor;
            footerNoteEl.style.fontFamily = fontStack;
            footerNoteEl.style.fontSize = (baseSize * 0.9) + "px";
            footerNoteEl.textContent = cfg.footer_note || "";
            footerNoteEl.style.display = (cfg.footer_note && cfg.footer_note.trim() !== "") ? "block" : "none";
        }

        // Orb outer glow
        if (orbOuterGlow) orbOuterGlow.style.background =
            "radial-gradient(circle, " + primaryColor + "40, " + secondaryColor + "30, transparent 70%)";

        // Orb rings
        if (orbRing1) {
            orbRing1.style.borderColor = primaryColor + "25";
            orbRing1.style.borderWidth = "1px";
        }

        if (orbRing2) {
            orbRing2.style.borderColor = secondaryColor + "30";
            orbRing2.style.borderWidth = "1px";
        }

        // Main orb sphere with gradient
        if (orbSphere) {
            orbSphere.style.backgroundImage =
                "radial-gradient(circle at 30% 30%, " + secondaryColor + ", " + primaryColor + " 60%, #0891b2 100%)";
            orbSphere.style.boxShadow =
                "0 20px 60px " + primaryColor + "40, 0 0 80px " + secondaryColor + "30, inset 0 0 60px rgba(255,255,255,0.3)";
        }

        // ECG container subtle overlay
        if (orbEcgContainer) orbEcgContainer.style.background =
            "radial-gradient(circle at 50% 50%, transparent 30%, " + primaryColor + "10 70%)";

        // Floating particles
        if (particle1) {
            particle1.style.width = "12px";
            particle1.style.height = "12px";
            particle1.style.backgroundColor = primaryColor + "50";
            particle1.style.boxShadow = "0 0 20px " + primaryColor + "60";
        }

        if (particle2) {
            particle2.style.width = "10px";
            particle2.style.height = "10px";
            particle2.style.backgroundColor = secondaryColor + "50";
            particle2.style.boxShadow = "0 0 18px " + secondaryColor + "60";
        }

        if (particle3) {
            particle3.style.width = "14px";
            particle3.style.height = "14px";
            particle3.style.backgroundColor = primaryColor + "45";
            particle3.style.boxShadow = "0 0 22px " + primaryColor + "55";
        }

        if (particle4) {
            particle4.style.width = "8px";
            particle4.style.height = "8px";
            particle4.style.backgroundColor = secondaryColor + "55";
            particle4.style.boxShadow = "0 0 16px " + secondaryColor + "65";
        }

        // Global font
        if (root) root.style.fontFamily = fontStack;
    }

    // Initialize Element SDK
    if (window.elementSdk && typeof window.elementSdk.init === "function") {
        window.elementSdk.init({
            defaultConfig: defaultConfig,
            onConfigChange: async (config) => {
                await onConfigChange(config);
            },
            mapToCapabilities: (config) => {
                const recolorables = [
                    {
                        // BACKGROUND
                        get: () => window.elementSdk.config.background_color || defaultConfig.background_color,
                        set: (value) => {
                            window.elementSdk.config.background_color = value;
                            window.elementSdk.setConfig({ background_color: value });
                        }
                    },
                    {
                        // SECONDARY_SURFACE
                        get: () => window.elementSdk.config.surface_color || defaultConfig.surface_color,
                        set: (value) => {
                            window.elementSdk.config.surface_color = value;
                            window.elementSdk.setConfig({ surface_color: value });
                        }
                    },
                    {
                        // TEXT
                        get: () => window.elementSdk.config.text_color || defaultConfig.text_color,
                        set: (value) => {
                            window.elementSdk.config.text_color = value;
                            window.elementSdk.setConfig({ text_color: value });
                        }
                    },
                    {
                        // PRIMARY_ACTION
                        get: () => window.elementSdk.config.primary_action_color || defaultConfig.primary_action_color,
                        set: (value) => {
                            window.elementSdk.config.primary_action_color = value;
                            window.elementSdk.setConfig({ primary_action_color: value });
                        }
                    },
                    {
                        // SECONDARY_ACTION
                        get: () => window.elementSdk.config.secondary_action_color || defaultConfig.secondary_action_color,
                        set: (value) => {
                            window.elementSdk.config.secondary_action_color = value;
                            window.elementSdk.setConfig({ secondary_action_color: value });
                        }
                    }
                ];

                const fontEditable = {
                    get: () => window.elementSdk.config.font_family || defaultConfig.font_family,
                    set: (value) => {
                        window.elementSdk.config.font_family = value;
                        window.elementSdk.setConfig({ font_family: value });
                    }
                };

                const fontSizeable = {
                    get: () => window.elementSdk.config.font_size || defaultConfig.font_size,
                    set: (value) => {
                        window.elementSdk.config.font_size = value;
                        window.elementSdk.setConfig({ font_size: value });
                    }
                };

                return {
                    recolorables,
                    borderables: [],
                    fontEditable,
                    fontSizeable
                };
            },
            mapToEditPanelValues: (config) => {
                const cfg = Object.assign({}, defaultConfig, config || {});
                return new Map([
                    ["main_line", cfg.main_line || defaultConfig.main_line],
                    ["sub_line", cfg.sub_line || ""],
                    ["footer_note", cfg.footer_note || ""]
                ]);
            }
        });
    } else {
        // Fallback if SDK not present
        onConfigChange(defaultConfig);
    }
})();
