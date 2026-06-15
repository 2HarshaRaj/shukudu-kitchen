(() => {
  const storageKey = "shukudu-theme";
  const root = document.documentElement;
  const savedTheme = localStorage.getItem(storageKey);
  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const initialTheme = savedTheme || (systemPrefersDark ? "dark" : "light");

  root.dataset.theme = initialTheme;

  function updateToggle(button) {
    const isDark = root.dataset.theme === "dark";
    button.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
    button.setAttribute("aria-pressed", String(isDark));
    button.innerHTML = `<span aria-hidden="true">${isDark ? "☀" : "☾"}</span><span class="theme-toggle-text">${isDark ? "Light" : "Dark"}</span>`;
  }

  function buildHost() {
    const headerContainer = document.querySelector(".site-header .container");
    if (headerContainer) {
      headerContainer.style.display = "flex";
      headerContainer.style.alignItems = "flex-start";
      headerContainer.style.justifyContent = "space-between";
      headerContainer.style.gap = "18px";

      const textBlock = document.createElement("div");
      while (headerContainer.firstChild) {
        textBlock.appendChild(headerContainer.firstChild);
      }
      headerContainer.appendChild(textBlock);

      const host = document.createElement("div");
      headerContainer.appendChild(host);
      return host;
    }

    const recipeShell = document.querySelector(".recipe-shell");
    const backLink = recipeShell?.querySelector(".back-link");
    if (recipeShell && backLink) {
      const topbar = document.createElement("div");
      topbar.style.display = "flex";
      topbar.style.alignItems = "center";
      topbar.style.justifyContent = "space-between";
      topbar.style.gap = "18px";
      topbar.style.marginBottom = "22px";
      backLink.style.marginBottom = "0";

      recipeShell.insertBefore(topbar, recipeShell.firstChild);
      topbar.appendChild(backLink);

      const host = document.createElement("div");
      topbar.appendChild(host);
      return host;
    }

    return null;
  }

  function createToggle() {
    const host = buildHost();
    if (!host) return;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "theme-toggle";
    button.style.position = "static";
    button.style.top = "auto";
    button.style.right = "auto";
    updateToggle(button);

    button.addEventListener("click", () => {
      root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
      localStorage.setItem(storageKey, root.dataset.theme);
      updateToggle(button);
    });

    host.appendChild(button);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", createToggle, { once: true });
  } else {
    createToggle();
  }
})();