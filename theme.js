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
    button.innerHTML = `
      <span class="theme-toggle-icon" aria-hidden="true">${isDark ? "☀" : "☾"}</span>
      <span class="theme-toggle-text">${isDark ? "Light" : "Dark"}</span>
    `;
  }

  function createToggle() {
    const host = document.querySelector("[data-theme-toggle-host]");
    if (!host) return;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "theme-toggle";
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