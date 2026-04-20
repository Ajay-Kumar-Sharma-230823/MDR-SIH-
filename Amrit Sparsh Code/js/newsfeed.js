/****************************************************
 * CONFIG + STYLING (UNCHANGED)
 ****************************************************/
const defaultConfig = {
  main_title: "MDR HIGH ALERT — CITYWIDE LIVE NEWS FEED",
  subheading:
    "Critical MDR-positive patients detected across multi-hospital network • Active High Alerts • Last updated: 30 Nov 2025 • Auto-refresh ON",
  footer_text: "Amrit Sparsh — Real-Time MDR Surveillance Network",
  background_color: "#FFFFFF",
  surface_color: "#F4F6F8",
  text_color: "#1A2E4A",
  primary_action_color: "#1A2E4A",
  secondary_action_color: "#4A5568",
  font_family: "system-ui",
  font_size: 13
};

function applyConfig(config) {
  const merged = Object.assign({}, defaultConfig, config || {});

  const bgColor = merged.background_color;
  const surfaceColor = merged.surface_color;
  const textColor = merged.text_color;
  const primaryAction = merged.primary_action_color;
  const secondaryAction = merged.secondary_action_color;

  document.body.style.backgroundColor = bgColor;

  const cards = document.querySelectorAll("article");
  cards.forEach((card) => {
    card.style.backgroundColor = surfaceColor;
  });

  const mainTitleEl = document.getElementById("mdr-header");
  const subheadingEl = document.getElementById("mdr-subheading");
  const consoleTitleEl = document.getElementById("console-title");
  const consoleSubtitleEl = document.getElementById("console-subtitle");
  const footerTextEl = document.getElementById("footer-text");

  const baseFontStack =
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif";
  const customFont = merged.font_family || defaultConfig.font_family;
  const titleSizeBase = merged.font_size || defaultConfig.font_size;

  if (mainTitleEl) {
    mainTitleEl.textContent = merged.main_title || defaultConfig.main_title;
    mainTitleEl.style.fontFamily = `${customFont}, ${baseFontStack}`;
    mainTitleEl.style.color = textColor;
    mainTitleEl.style.fontSize = titleSizeBase * 1.1 + "px";
  }

  if (subheadingEl) {
    subheadingEl.textContent = merged.subheading || defaultConfig.subheading;
    subheadingEl.style.fontFamily = `${customFont}, ${baseFontStack}`;
    subheadingEl.style.fontSize = titleSizeBase * 0.9 + "px";
    subheadingEl.style.color = secondaryAction;
  }

  if (consoleTitleEl) {
    consoleTitleEl.style.fontFamily = `${customFont}, ${baseFontStack}`;
    consoleTitleEl.style.fontSize = titleSizeBase * 1.05 + "px";
    consoleTitleEl.style.color = textColor;
  }

  if (consoleSubtitleEl) {
    consoleSubtitleEl.style.fontFamily = `${customFont}, ${baseFontStack}`;
    consoleSubtitleEl.style.fontSize = titleSizeBase * 0.85 + "px";
    consoleSubtitleEl.style.color = "#64748b";
  }

  if (footerTextEl) {
    footerTextEl.textContent =
      merged.footer_text || defaultConfig.footer_text;
    footerTextEl.style.fontFamily = `${customFont}, ${baseFontStack}`;
    footerTextEl.style.fontSize = titleSizeBase * 0.9 + "px";
  }

  const cardText = document.querySelectorAll(
    "article p, article span, section p"
  );
  cardText.forEach((el) => {
    const isLabel = el.classList.contains("data-label");
    const isSmallMeta = el.classList.contains("data-value-small");
    const isValue = el.classList.contains("data-value");

    if (isLabel) {
      el.style.fontSize = titleSizeBase * 0.75 + "px";
    } else if (isSmallMeta) {
      el.style.fontSize = titleSizeBase * 0.9 + "px";
    } else if (isValue) {
      el.style.fontSize = titleSizeBase + "px";
    } else {
      el.style.fontSize = titleSizeBase + "px";
    }

    el.style.fontFamily = `${customFont}, ${baseFontStack}`;
  });
}

(function initElementSdk() {
  if (!window.elementSdk) {
    applyConfig(defaultConfig);
    return;
  }

  window.elementSdk.init({
    defaultConfig,
    onConfigChange: async (config) => {
      applyConfig(config);
    },
    mapToCapabilities: (config) => {
      const current = Object.assign({}, defaultConfig, config || {});

      const recolorables = [
        {
          get: () => current.background_color,
          set: (value) => {
            current.background_color = value;
            window.elementSdk.setConfig({ background_color: value });
          }
        },
        {
          get: () => current.surface_color,
          set: (value) => {
            current.surface_color = value;
            window.elementSdk.setConfig({ surface_color: value });
          }
        },
        {
          get: () => current.text_color,
          set: (value) => {
            current.text_color = value;
            window.elementSdk.setConfig({ text_color: value });
          }
        },
        {
          get: () => current.primary_action_color,
          set: (value) => {
            current.primary_action_color = value;
            window.elementSdk.setConfig({ primary_action_color: value });
          }
        },
        {
          get: () => current.secondary_action_color,
          set: (value) => {
            current.secondary_action_color = value;
            window.elementSdk.setConfig({ secondary_action_color: value });
          }
        }
      ];

      return {
        recolorables,
        borderables: [],
        fontEditable: {
          get: () => current.font_family,
          set: (value) => {
            current.font_family = value;
            window.elementSdk.setConfig({ font_family: value });
          }
        },
        fontSizeable: {
          get: () => current.font_size,
          set: (value) => {
            current.font_size = value;
            window.elementSdk.setConfig({ font_size: value });
          }
        }
      };
    },
    mapToEditPanelValues: (config) => {
      const current = Object.assign({}, defaultConfig, config || {});
      return new Map([
        ["main_title", current.main_title],
        ["subheading", current.subheading],
        ["footer_text", current.footer_text]
      ]);
    }
  });

  applyConfig(window.elementSdk.config || defaultConfig);
})();

/****************************************************
 * ⭐ DYNAMIC FEED LOGIC — NEWLY ADDED
 ****************************************************/
async function loadAlerts() {
  const container = document.getElementById("alerts-container");
  if (!container) return;

  try {
    const res = await fetch("http://127.0.0.1:8000/newsfeed/high-alerts");
    const data = await res.json();
    const alerts = data.alerts || [];

    container.innerHTML = "";

    if (alerts.length === 0) {
      container.innerHTML =
        `<p class="text-xs text-slate-500 text-center py-3">
          No high-risk alerts found
         </p>`;
      return;
    }

    alerts.forEach((a) => {
      const p = a.patient || {};
      const m = a.mdr || {};

      const html = `
        <article class="bg-white card-flat border border-slate-200 px-5 py-5"
            style="border-radius: 6px; background: #F4F6F8;">

            <div class="flex items-start justify-between gap-4 mb-4">
                <span class="alert-tag">HIGH ALERT</span>
                <div class="risk-tag">${a.risk_score || 0}% RISK SCORE</div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-5 cards-grid">

                <!-- LEFT -->
                <div class="flex flex-col gap-3">
                    <div>
                        <p class="data-label">Patient</p>
                        <p class="data-value">${p.name || "Unknown"}</p>
                        <p class="text-[10px] text-slate-500 mt-0.5">ID: ${p.id || "- -"}</p>
                    </div>

                    <div class="border-t divider-line pt-3">
                        <p class="data-label">Age</p>
                        <p class="data-value">${p.age || "- -"}</p>
                    </div>

                    <div class="border-t divider-line pt-3">
                        <p class="data-label">Unit Risk Level</p>
                        <p class="text-xs text-red-700 font-semibold">Critical</p>
                    </div>
                </div>

                <!-- MIDDLE -->
                <div class="flex flex-col gap-3">
                    <div>
                        <p class="data-label">MDR Organism</p>
                        <p class="text-sm font-semibold text-red-700">${m.organism || "- -"}</p>
                    </div>

                    <div class="border-t divider-line pt-3">
                        <p class="data-label">Detection Time</p>
                        <p class="data-value-small">${m.detection_time || "- -"}</p>
                    </div>

                    <div class="border-t divider-line pt-3">
                        <p class="data-label">Severity</p>
                        <p class="text-xs text-red-700 font-semibold">${m.severity || "- -"}</p>
                    </div>
                </div>

                <!-- RIGHT -->
                <div class="flex flex-col gap-3">
                    <div>
                        <p class="data-label">Alert Reason</p>
                        <p class="data-value-small">${a.alert_reason || "- -"}</p>
                    </div>

                    <div class="border-t divider-line pt-3">
                        <p class="data-label">AI Insight</p>
                        <p class="data-value-small">${a.ai_insight || "- -"}</p>
                    </div>

                    <div class="border-t divider-line pt-3">
                        <p class="data-label">Location</p>
                        <p class="data-value-small">${a.location || "- -"}</p>
                    </div>
                </div>

            </div>
        </article>
      `;

      container.insertAdjacentHTML("beforeend", html);
    });

    // Reapply config styling (important)
    applyConfig(window.elementSdk?.config || defaultConfig);

  } catch (err) {
    console.error("Error loading alerts:", err);
  }
}

document.addEventListener("DOMContentLoaded", loadAlerts);
