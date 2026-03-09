/* ============================================================
   THEME.JS — LIGHT/DARK THEME TOGGLE
   ============================================================ */

(function() {
  'use strict';

  const STORAGE_KEY = 'meowmeow-theme';

  function getPreferredTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);

    // Update all theme icons
    document.querySelectorAll('[id="themeIcon"]').forEach(icon => {
      icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    });

    // Update mobile toggle
    const mobileToggle = document.getElementById('mobileThemeToggle');
    if (mobileToggle) mobileToggle.checked = (theme === 'dark');

    // Update settings panel toggle
    const settingsToggle = document.getElementById('settingsThemeToggle');
    if (settingsToggle) settingsToggle.checked = (theme === 'dark');

    // Dispatch event for other JS to listen
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
  }

  function toggleTheme() {
    const current = document.body.getAttribute('data-theme') || 'light';
    applyTheme(current === 'light' ? 'dark' : 'light');
  }

  // Initialize
  applyTheme(getPreferredTheme());

  // Desktop toggle
  document.addEventListener('DOMContentLoaded', function() {
    const toggle = document.getElementById('themeToggle');
    if (toggle) toggle.addEventListener('click', toggleTheme);

    const mobileToggle = document.getElementById('mobileThemeToggle');
    if (mobileToggle) {
      mobileToggle.addEventListener('change', function() {
        applyTheme(this.checked ? 'dark' : 'light');
      });
    }

    const settingsToggle = document.getElementById('settingsThemeToggle');
    if (settingsToggle) {
      settingsToggle.addEventListener('change', function() {
        applyTheme(this.checked ? 'dark' : 'light');
      });
    }
  });

  // System preference changes
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
      if (!localStorage.getItem(STORAGE_KEY)) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  // Expose globally
  window.toggleTheme = toggleTheme;
  window.applyTheme = applyTheme;

})();
