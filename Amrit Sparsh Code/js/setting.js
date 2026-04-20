(function () {
    // ---- CONFIG & DEFAULTS ----
    const defaultConfig = {
        // Colors (5 total, ordered by visual prominence)
        background_color: "#f8f9fa",        // BACKGROUND - light grey
        surface_color: "#ffffff",           // SECONDARY_SURFACE - white card
        text_color: "#1a202c",              // TEXT - dark text
        primary_action_color: "#0A84FF",    // PRIMARY_ACTION - hospital blue
        secondary_action_color: "#e0f2fe",  // SECONDARY_ACTION - light blue

        // Typography
        font_family: "-apple-system",
        font_size: 16, // base size

        // Copy
        title_text: "Settings Page Coming Soon",
        subtitle_text: "This feature is under development and will be available shortly.",
        footer_text: "Amrit Sparsh – Digital MDR Tracking System"
    };

    // DOM references
    const appRoot = document.getElementById("app-root");
    const bgShape1 = document.getElementById("bg-shape-1");
    const bgShape2 = document.getElementById("bg-shape-2");
    const contentCard = document.getElementById("content-card");
    const iconContainer = document.getElementById("icon-container");
    const settingsIcon = document.getElementById("settings-icon");
    const title = document.getElementById("title");
    const subtitle = document.getElementById("subtitle");
    const divider = document.getElementById("divider");
    const footerNote = document.getElementById("footer-note");

    // Apply config-driven styles & text
    async function onConfigChange(config) {
        const cfg = Object.assign({}, defaultConfig, config || {});

        const baseFont = cfg.font_family || defaultConfig.font_family;
        const fontStack = baseFont + ", -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        const baseSize = Number(cfg.font_size) || defaultConfig.font_size;

        // Colors
        const bgColor = cfg.background_color || defaultConfig.background_color;
        const surfaceColor = cfg.surface_color || defaultConfig.surface_color;
        const textColor = cfg.text_color || defaultConfig.text_color;
        const primaryColor = cfg.primary_action_color || defaultConfig.primary_action_color;
        const secondaryColor = cfg.secondary_action_color || defaultConfig.secondary_action_color;

        // Root background
        appRoot.style.backgroundColor = bgColor;

        // Background gradient shapes
        bgShape1.style.background = `radial-gradient(circle, ${primaryColor}40, transparent 70%)`;
        bgShape2.style.background = `radial-gradient(circle, ${secondaryColor}, transparent 70%)`;

        // Content card
        contentCard.style.backgroundColor = surfaceColor;
        contentCard.style.border = `1px solid ${primaryColor}15`;

        // Icon container
        iconContainer.style.backgroundColor = secondaryColor;
        iconContainer.style.border = `1px solid ${primaryColor}20`;
        settingsIcon.style.color = primaryColor;

        // Title
        title.style.color = textColor;
        title.style.fontFamily = fontStack;
        title.style.fontSize = (baseSize * 1.875) + "px";
        title.textContent = cfg.title_text || defaultConfig.title_text;

        // Subtitle
        subtitle.style.color = textColor;
        subtitle.style.opacity = "0.65";
        subtitle.style.fontFamily = fontStack;
        subtitle.style.fontSize = baseSize + "px";
        subtitle.textContent = cfg.subtitle_text || defaultConfig.subtitle_text;

        // Divider
        divider.style.backgroundColor = primaryColor;
        divider.style.opacity = "0.3";

        // Footer note
        footerNote.style.color = primaryColor;
        footerNote.style.fontFamily = fontStack;
        footerNote.style.fontSize = (baseSize * 0.875) + "px";
        footerNote.textContent = cfg.footer_text || defaultConfig.footer_text;
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
                    ["title_text", cfg.title_text || defaultConfig.title_text],
                    ["subtitle_text", cfg.subtitle_text || defaultConfig.subtitle_text],
                    ["footer_text", cfg.footer_text || defaultConfig.footer_text]
                ]);
            }
        });
    } else {
        // Fallback if SDK not present
        onConfigChange(defaultConfig);
    }
})();
