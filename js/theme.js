/* ============================================================
   THEME.JS — DARK / LIGHT MODE SYSTEM
   MeowMeow Premium Affiliate Shopping Platform
   ============================================================ */

(function () {
  'use strict';

  const STORAGE_KEY = 'meowmeow-theme';
  const HTML = document.documentElement;

  /* ===== GET PREFERRED THEME ===== */
  function getPreferred() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  /* ===== APPLY THEME ===== */
  function applyTheme(theme) {
    HTML.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);

    // Update all toggle icons
    const icon = document.getElementById('themeIcon');
    if (icon) {
      icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    // Update all toggle checkboxes
    ['settingsThemeToggle', 'mobileThemeToggle'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.checked = (theme === 'dark');
    });

    // Dispatch event
    document.dispatchEvent(new CustomEvent('theme-changed', { detail: { theme } }));
  }

  /* ===== TOGGLE THEME ===== */
  function toggleTheme() {
    const current = HTML.getAttribute('data-theme') || 'light';
    applyTheme(current === 'dark' ? 'light' : 'dark');
  }

  /* ===== INIT ===== */
  function init() {
    // Apply immediately (before render to avoid flash)
    applyTheme(getPreferred());

    // Main toggle button
    const btn = document.getElementById('themeToggle');
    if (btn) btn.addEventListener('click', toggleTheme);

    // Settings panel toggle
    const settingsToggle = document.getElementById('settingsThemeToggle');
    if (settingsToggle) {
      settingsToggle.addEventListener('change', () => {
        applyTheme(settingsToggle.checked ? 'dark' : 'light');
      });
    }

    // Mobile menu toggle
    const mobileToggle = document.getElementById('mobileThemeToggle');
    if (mobileToggle) {
      mobileToggle.addEventListener('change', () => {
        applyTheme(mobileToggle.checked ? 'dark' : 'light');
      });
    }

    // System preference change listener
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (!localStorage.getItem(STORAGE_KEY)) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  // Run immediately to avoid FOUC
  const initialTheme = localStorage.getItem(STORAGE_KEY) ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  HTML.setAttribute('data-theme', initialTheme);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Public API
  window.toggleTheme = toggleTheme;
  window.applyTheme  = applyTheme;

})();
