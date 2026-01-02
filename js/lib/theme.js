/**
 * Theme Manager for USMC Tools
 * Handles dark (default), light, and night (tactical) themes
 * Uses OSMEAC-standard color scheme
 */
const ThemeManager = {
  STORAGE_KEY: 'usmc-tools-theme',
  themes: ['dark', 'light', 'night'],

  init() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved && this.themes.includes(saved)) {
      this.setTheme(saved);
    } else {
      // Default to dark mode (matches :root CSS)
      this.setTheme('dark');
    }
  },

  setTheme(theme) {
    if (!this.themes.includes(theme)) {
      theme = 'dark';
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
    return document.documentElement.getAttribute('data-theme') || 'dark';
  },

  updateToggleIcon() {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;

    const icons = {
      dark: '\u263D',   // Moon
      light: '\u2600',  // Sun
      night: '\u2605'   // Star (tactical)
    };

    const titles = {
      dark: 'Dark mode - Click for Light',
      light: 'Light mode - Click for Night',
      night: 'Night mode - Click for Dark'
    };

    const icon = btn.querySelector('.theme-icon');
    if (icon) {
      icon.textContent = icons[this.getCurrent()] || icons.dark;
    }
    btn.title = titles[this.getCurrent()] || titles.dark;
  }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => ThemeManager.init());

// Export for global access
window.toggleTheme = () => ThemeManager.toggle();
