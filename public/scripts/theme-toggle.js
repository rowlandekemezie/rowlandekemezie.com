(() => {
  const KEY = 'rowland.theme';
  const DARK = 'dark';
  const LIGHT = 'light';
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');

  const getStoredTheme = () => {
    try {
      const value = window.localStorage.getItem(KEY);
      return value === DARK || value === LIGHT ? value : null;
    } catch {
      return null;
    }
  };

  const resolveTheme = () => {
    const stored = getStoredTheme();
    if (stored) return stored;
    return systemTheme.matches ? DARK : LIGHT;
  };

  const applyTheme = (theme) => {
    document.documentElement.dataset.theme = theme;
    document.querySelectorAll('[data-theme-toggle]').forEach((el) => {
      if (el instanceof HTMLButtonElement) {
        el.setAttribute('aria-checked', theme === DARK ? 'true' : 'false');
      }
    });
    window.dispatchEvent(new CustomEvent('rowland:theme-change', { detail: { theme } }));
  };

  const saveTheme = (theme) => {
    try {
      window.localStorage.setItem(KEY, theme);
    } catch {
      // no-op
    }
  };

  const init = () => {
    applyTheme(resolveTheme());

    document.querySelectorAll('[data-theme-toggle]').forEach((el) => {
      if (!(el instanceof HTMLButtonElement)) return;

      el.addEventListener('click', () => {
        const nextTheme = document.documentElement.dataset.theme === DARK ? LIGHT : DARK;
        applyTheme(nextTheme);
        saveTheme(nextTheme);
      });
    });

    systemTheme.addEventListener('change', (event) => {
      if (getStoredTheme()) return;
      applyTheme(event.matches ? DARK : LIGHT);
    });

    window.addEventListener('storage', (event) => {
      if (event.key === KEY) applyTheme(resolveTheme());
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
