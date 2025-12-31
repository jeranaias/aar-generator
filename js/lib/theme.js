/**
 * Theme Manager for USMC Tools
 * Handles light, dark, and night (tactical) themes
 */
const ThemeManager = {
  STORAGE_KEY: 'usmc-tools-theme',
  themes: ['light', 'dark', 'night'],

  init() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved && this.themes.includes(saved)) {
      this.setTheme(saved);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      this.setTheme('dark');
    } else {
      this.setTheme('light');
    }

    // Listen for system preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem(this.STORAGE_KEY)) {
        this.setTheme(e.matches ? 'dark' : 'light');
      }
    });
  },

  setTheme(theme) {
    if (!this.themes.includes(theme)) {
      theme = 'light';
    }
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(this.STORAGE_KEY, theme);
    this.updateToggleIcon();
  },

  toggle() {
    const current = this.getCurrent();
    const nextIndex = (this.themes.indexOf(current) + 1) % this.themes.length;
    this.setTheme(this.themes[nextIndex]);
  },

  getCurrent() {
    return document.documentElement.getAttribute('data-theme') || 'light';
  },

  updateToggleIcon() {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;

    const icons = {
      light: '\u2600',  // Sun
      dark: '\u263D',   // Moon
      night: '\u2605'   // Star (tactical)
    };

    const icon = btn.querySelector('.theme-icon');
    if (icon) {
      icon.textContent = icons[this.getCurrent()] || icons.light;
    }
  }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => ThemeManager.init());
