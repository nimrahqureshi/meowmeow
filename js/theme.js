/* =============================================
   THEME.JS — DARK / LIGHT MODE
   ============================================= */
'use strict';

(function() {
  const STORAGE_KEY = 'trendshop-theme';
  const body = document.documentElement;

  function getPreferred() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function apply(theme) {
    document.body.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
    updateUI(theme);
  }

  function toggle() {
    const current = document.body.getAttribute('data-theme') || 'light';
    apply(current === 'light' ? 'dark' : 'light');
  }

  function updateUI(theme) {
    const isDark = theme === 'dark';

    // Desktop theme button icon
    document.querySelectorAll('#themeToggle, #themeBtn').forEach(btn => {
      const icon = btn.querySelector('i');
      if (icon) {
        icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
      }
      btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
      btn.title = isDark ? 'Light Mode' : 'Dark Mode';
    });

    // Mobile toggle switch
    const mobileToggle = document.getElementById('mobileThemeToggle');
    if (mobileToggle) mobileToggle.checked = isDark;

    // Meta theme-color
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.content = isDark ? '#0A0A16' : '#FFFFFF';
    }
  }

  // Event Listeners
  document.addEventListener('DOMContentLoaded', () => {
    // Init
    const initial = getPreferred();
    apply(initial);

    // Desktop button
    document.querySelectorAll('#themeToggle, #themeBtn').forEach(btn => {
      btn.addEventListener('click', toggle);
    });

    // Mobile toggle
    const mobileToggle = document.getElementById('mobileThemeToggle');
    if (mobileToggle) {
      mobileToggle.addEventListener('change', function() {
        apply(this.checked ? 'dark' : 'light');
      });
    }

    // System change listener
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (!localStorage.getItem(STORAGE_KEY)) {
        apply(e.matches ? 'dark' : 'light');
      }
    });
  });

  // Apply immediately to prevent flash
  apply(getPreferred());

  // Expose
  window.ThemeManager = { toggle, apply, current: () => document.body.getAttribute('data-theme') };
})();
