/* ============================
   THEME.JS — DARK / LIGHT TOGGLE
   ============================ */

(function () {
  'use strict';

  var STORAGE_KEY = 'meowmeow-theme';
  var body              = document.documentElement; // apply on <html> so CSS vars cascade
  var themeToggle       = document.getElementById('themeToggle');
  var themeIcon         = document.getElementById('themeIcon');
  var mobileThemeToggle = document.getElementById('mobileThemeToggle');

  /* ── Get saved theme or system preference ──── */
  function getSavedTheme() {
    var saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark' : 'light';
  }

  /* ── Apply theme ────────────────────────────── */
  function applyTheme(theme) {
    body.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);

    // Update desktop icon
    if (themeIcon) {
      if (theme === 'dark') {
        themeIcon.className = 'fas fa-sun';   // show sun so user can switch to light
      } else {
        themeIcon.className = 'fas fa-moon';  // show moon so user can switch to dark
      }
    }

    // Update mobile toggle
    if (mobileThemeToggle) {
      mobileThemeToggle.checked = (theme === 'dark');
    }
  }

  /* ── Toggle ─────────────────────────────────── */
  function toggleTheme() {
    var current = body.getAttribute('data-theme') || 'light';
    applyTheme(current === 'light' ? 'dark' : 'light');
  }

  /* ── Bind events ────────────────────────────── */
  if (themeToggle) themeToggle.addEventListener('click', toggleTheme);

  if (mobileThemeToggle) {
    mobileThemeToggle.addEventListener('change', function () {
      applyTheme(this.checked ? 'dark' : 'light');
    });
  }

  /* ── System preference changes ─────────────── */
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
      if (!localStorage.getItem(STORAGE_KEY)) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  /* ── Init ───────────────────────────────────── */
  applyTheme(getSavedTheme());

})();
