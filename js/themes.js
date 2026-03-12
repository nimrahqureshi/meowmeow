/* ============================
   THEMES.JS — LIGHT / DARK TOGGLE
   ============================ */

(function() {
  'use strict';

  var STORAGE_KEY = 'meowmeow-theme';
  var body = document.documentElement; // Apply to <html> for immediate effect before body loads

  /* ===== GET PREFERRED THEME ===== */
  function getPreferredTheme() {
    var saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  /* ===== APPLY THEME ===== */
  function applyTheme(theme) {
    // Apply to both html and body for reliability
    document.documentElement.setAttribute('data-theme', theme);
    if (document.body) {
      document.body.setAttribute('data-theme', theme);
    }
    localStorage.setItem(STORAGE_KEY, theme);
    updateThemeIcon(theme);
    updateMobileToggle(theme);
  }

  /* ===== UPDATE DESKTOP ICON ===== */
  function updateThemeIcon(theme) {
    var themeIcon = document.getElementById('themeIcon');
    if (!themeIcon) return;
    if (theme === 'dark') {
      themeIcon.className = themeIcon.className.replace('fa-sun', 'fa-moon');
      if (!themeIcon.className.includes('fa-moon')) {
        themeIcon.classList.add('fa-moon');
      }
    } else {
      themeIcon.className = themeIcon.className.replace('fa-moon', 'fa-sun');
      if (!themeIcon.className.includes('fa-sun')) {
        themeIcon.classList.add('fa-sun');
      }
    }
  }

  /* ===== UPDATE MOBILE TOGGLE ===== */
  function updateMobileToggle(theme) {
    var mobileToggle = document.getElementById('mobileThemeToggle');
    if (!mobileToggle) return;
    mobileToggle.checked = (theme === 'dark');
  }

  /* ===== TOGGLE THEME ===== */
  function toggleTheme() {
    var current = document.documentElement.getAttribute('data-theme') || 'light';
    applyTheme(current === 'light' ? 'dark' : 'light');
  }

  /* ===== INIT IMMEDIATELY (prevent flash) ===== */
  var initialTheme = getPreferredTheme();
  document.documentElement.setAttribute('data-theme', initialTheme);

  /* ===== BIND EVENTS AFTER DOM LOADS ===== */
  function bindEvents() {
    var themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', toggleTheme);
    }

    var mobileToggle = document.getElementById('mobileThemeToggle');
    if (mobileToggle) {
      mobileToggle.addEventListener('change', function() {
        applyTheme(this.checked ? 'dark' : 'light');
      });
    }

    // Apply to body now that DOM is ready
    applyTheme(getPreferredTheme());
  }

  /* ===== SYSTEM THEME CHANGE ===== */
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
      // Only auto-switch if user hasn't manually set a preference
      if (!localStorage.getItem(STORAGE_KEY)) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindEvents);
  } else {
    bindEvents();
  }

  // Export for external use
  window.MeowTheme = {
    toggle: toggleTheme,
    apply: applyTheme,
    get: function() {
      return document.documentElement.getAttribute('data-theme') || 'light';
    }
  };

})();
