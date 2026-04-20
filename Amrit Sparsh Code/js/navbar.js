(function () {
  const defaultConfig = {
    background_color: "#ffffff",
    surface_color: "#f8f9fa",
    text_color: "#1a1a1a",
    primary_action_color: "#0A84FF",
    secondary_action_color: "#6b7280",
    font_family: "-apple-system",
    font_size: 14,
    home_text: "HOME",
    pages_text: "PAGES",
    greeting_light: "HEY BHIYAON,",
    greeting_bold: "AJAY"
  };

  const navbar = document.getElementById("navbar");
  const mainContent = document.getElementById("main-content");
  const mountContainer = document.getElementById('custom-navbar-content');

  // Resolve refs lazily after mount
  function getRefs() {
    return {
      homeLink: document.getElementById("home-link"),
      pagesButton: document.getElementById("pages-button"),
      pagesText: document.getElementById("pages-text"),
      pagesArrow: document.getElementById("pages-arrow"),
      greetingLight: document.getElementById("greeting-light-text"),
      greetingBold: document.getElementById("greeting-bold"),
      userArrow: document.getElementById("user-arrow")
    };
  }

  async function onConfigChange(config) {
    const cfg = Object.assign({}, defaultConfig, config || {});

    const baseFont = cfg.font_family || defaultConfig.font_family;
    const fontStack = baseFont + ", -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    const baseSize = Number(cfg.font_size) || defaultConfig.font_size;

    const bgColor = cfg.background_color || defaultConfig.background_color;
    const surfaceColor = cfg.surface_color || defaultConfig.surface_color;
    const textColor = cfg.text_color || defaultConfig.text_color;
    const primaryColor = cfg.primary_action_color || defaultConfig.primary_action_color;
    const secondaryColor = cfg.secondary_action_color || defaultConfig.secondary_action_color;

    if (navbar) {
      navbar.style.backgroundColor = bgColor;
      navbar.style.boxShadow = "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)";
    }
    if (mainContent) mainContent.style.backgroundColor = surfaceColor;

    const { homeLink, pagesButton, pagesText, pagesArrow, greetingLight, greetingBold, userArrow } = getRefs();

    if (homeLink) {
      homeLink.style.color = primaryColor;
      homeLink.style.fontFamily = fontStack;
      homeLink.style.fontSize = baseSize + "px";
      homeLink.textContent = cfg.home_text || defaultConfig.home_text;
    }

    if (pagesButton) {
      pagesButton.style.color = secondaryColor;
      pagesButton.style.fontFamily = fontStack;
      pagesButton.style.fontSize = baseSize + "px";
    }
    if (pagesText) pagesText.textContent = cfg.pages_text || defaultConfig.pages_text;
    if (pagesArrow) pagesArrow.style.color = secondaryColor;

    // Use profile from sessionStorage (set by login)
    const sessionProfileRaw = sessionStorage.getItem("profile");
    let dynamicFirstName = null;
    if (sessionProfileRaw) {
      try {
        const profileObj = JSON.parse(sessionProfileRaw);
        if (profileObj && profileObj.full_name) {
          dynamicFirstName = profileObj.full_name.split(" ")[0];
        } else if (sessionStorage.getItem("userFirstName")) {
          dynamicFirstName = sessionStorage.getItem("userFirstName");
        }
      } catch (e) {
        // ignore parse errors
      }
    }

    if (greetingLight) {
      greetingLight.style.color = secondaryColor;
      greetingLight.style.fontFamily = fontStack;
      greetingLight.style.fontSize = baseSize + "px";
      greetingLight.textContent = cfg.greeting_light || defaultConfig.greeting_light;
    }

    if (greetingBold) {
      greetingBold.style.color = (cfg.text_color || defaultConfig.text_color);
      greetingBold.style.fontFamily = fontStack;
      greetingBold.style.fontSize = baseSize + "px";
      // If we have a dynamic user name, show it; otherwise fallback to configured bold text
      greetingBold.textContent = dynamicFirstName || cfg.greeting_bold || defaultConfig.greeting_bold;
    }

    if (userArrow) userArrow.style.color = (cfg.text_color || defaultConfig.text_color);
  }

  async function mountFragment() {
    if (!mountContainer) return;
    try {
      // Compute relative path to component from current page
      const possiblePaths = [
        'components/navbar.html',
        '../pages/components/navbar.html',
        './pages/components/navbar.html',
        '../components/navbar.html'
      ];
      let html = null;
      for (const p of possiblePaths) {
        try {
          const res = await fetch(p, { cache: 'no-store' });
          if (res.ok) { html = await res.text(); break; }
        } catch {}
      }
      if (html) {
        mountContainer.innerHTML = html;
      }
    } catch {}
  }

  function applyUserToNavbar() {
    const name = sessionStorage.getItem("userFirstName");
    if (!name) return;

    const greetingBold = document.getElementById("greeting-bold");
    const greetingLight = document.getElementById("greeting-light");

    if (greetingBold) greetingBold.textContent = name.toUpperCase();

    if (greetingLight) {
        // You can update this to whatever prefix you want
        greetingLight.textContent = "HEY";
    }
}

// Run after navbar fragment loads
setTimeout(applyUserToNavbar, 200);


  function initWithConfig() {
    if (window.elementSdk && typeof window.elementSdk.init === "function") {
      window.elementSdk.init({
        defaultConfig: defaultConfig,
        onConfigChange: async (config) => { await onConfigChange(config); },
        mapToCapabilities: () => ({ recolorables: [], borderables: [], fontEditable: null, fontSizeable: null }),
        mapToEditPanelValues: (config) => new Map([
          ["home_text", (config && config.home_text) || defaultConfig.home_text],
          ["pages_text", (config && config.pages_text) || defaultConfig.pages_text],
          ["greeting_light", (config && config.greeting_light) || defaultConfig.greeting_light],
          ["greeting_bold", (config && config.greeting_bold) || defaultConfig.greeting_bold]
        ])
      });
    } else {
      onConfigChange(defaultConfig);
    }
  }

  (async function start() {
    await mountFragment();
    initWithConfig();
  })();
})();

function applyNavbarGreeting() {
    const name = sessionStorage.getItem("userFirstName");

    if (!name) return;

    const bold = document.getElementById("greeting-bold");
    const light = document.getElementById("greeting-light");

    if (bold) bold.textContent = name.toUpperCase();
    if (light) light.textContent = "HEY";
}

// Wait for navbar fragment to load
setTimeout(applyNavbarGreeting, 200);
