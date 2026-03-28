/* ============================
   THEMES.JS — THEME MANAGER  (FIXED v2)
   Load in <head> BEFORE body renders — prevents white flash on dark mode
   ============================ */

(function () {
  'use strict';

  var THEME_KEY = 'meowmeow-theme';

  /* Apply immediately (synchronous, in <head>) to prevent FOUC */
  try {
    var saved = localStorage.getItem(THEME_KEY);
    if (saved === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
  } catch (e) {}

  /* ─── Core functions ─── */

  function getCurrentTheme() {
    return document.documentElement.getAttribute('data-theme') || 'light';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}

    /* Sync all toggle checkboxes */
    document.querySelectorAll(
      '#themeCheckbox, #mobileThemeCheckbox, .theme-toggle-input'
    ).forEach(function (el) {
      if (el.type === 'checkbox') el.checked = (theme === 'dark');
    });

    /* Sync icon buttons */
    document.querySelectorAll('[data-theme-icon]').forEach(function (el) {
      el.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    });
  }

  function toggleTheme() {
    applyTheme(getCurrentTheme() === 'dark' ? 'light' : 'dark');
  }

  /* ─── Expose global API ─── */
  window.MeowTheme = {
    toggle : toggleTheme,
    set    : applyTheme,
    get    : getCurrentTheme
  };

  /* ─── Bind controls after DOM ready ─── */
  document.addEventListener('DOMContentLoaded', function () {
    /* Re-apply to sync checkboxes that are now in the DOM */
    applyTheme(getCurrentTheme());

    /* Checkbox toggles (mobile menu uses label + hidden checkbox) */
    document.querySelectorAll(
      '#themeCheckbox, #mobileThemeCheckbox, .theme-toggle-input'
    ).forEach(function (el) {
      if (el._themeBound) return;
      el._themeBound = true;
      el.addEventListener('change', function () {
        applyTheme(this.checked ? 'dark' : 'light');
      });
    });

    /* Button toggles */
    document.querySelectorAll(
      '[data-theme-btn], #themeToggleBtn, .theme-toggle-btn'
    ).forEach(function (btn) {
      if (btn._themeBound) return;
      btn._themeBound = true;
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        toggleTheme();
      });
    });
  });

})();
