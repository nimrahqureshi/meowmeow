/* ============================
   THEMES.JS — LIGHT / DARK TOGGLE  v2.0
   No flash · localStorage persist · OS preference
   Keyboard shortcut: T · Public API: window.MeowTheme
   ============================ */

(function () {
  'use strict';

  var STORAGE_KEY = 'meowmeow-theme';

  /* ── Get saved or preferred theme ── */
  function getPreferred() {
    var saved = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) {}
    if (saved === 'dark' || saved === 'light') return saved;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    return 'light';
  }

  /* ── Apply theme to both <html> and <body> ── */
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (document.body) document.body.setAttribute('data-theme', theme);
    try { localStorage.setItem(STORAGE_KEY, theme); } catch (e) {}
    syncIcon(theme);
    syncMobileToggle(theme);
    syncDesktopBtn(theme);
  }

  function syncIcon(theme) {
    var icon = document.getElementById('themeIcon');
    if (!icon) return;
    icon.className = (theme === 'dark') ? 'fas fa-moon' : 'fas fa-sun';
  }

  function syncMobileToggle(theme) {
    var chk = document.getElementById('mobileThemeToggle');
    if (chk) chk.checked = (theme === 'dark');
  }

  function syncDesktopBtn(theme) {
    var btn = document.getElementById('themeToggle');
    if (btn) btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  }

  function toggleTheme() {
    var cur = document.documentElement.getAttribute('data-theme') || 'light';
    applyTheme(cur === 'dark' ? 'light' : 'dark');
  }

  /* ── Apply immediately (before DOMContentLoaded) to prevent FOUC ── */
  var initial = getPreferred();
  document.documentElement.setAttribute('data-theme', initial);

  /* ── Bind controls after DOM is ready ── */
  function bindControls() {
    applyTheme(getPreferred()); /* re-apply now body + icons exist */

    var desktopBtn = document.getElementById('themeToggle');
    if (desktopBtn) desktopBtn.addEventListener('click', toggleTheme);

    var mobileChk = document.getElementById('mobileThemeToggle');
    if (mobileChk) {
      mobileChk.addEventListener('change', function () {
        applyTheme(this.checked ? 'dark' : 'light');
      });
    }

    /* OS dark-mode change listener (only if user hasn't manually set preference) */
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
        var stored = null;
        try { stored = localStorage.getItem(STORAGE_KEY); } catch (ex) {}
        if (!stored) applyTheme(e.matches ? 'dark' : 'light');
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindControls);
  } else {
    bindControls();
  }

  /* ── Keyboard shortcut: T ── */
  document.addEventListener('keydown', function (e) {
    if (e.key === 't' && !e.ctrlKey && !e.metaKey && !e.altKey &&
        e.target.tagName !== 'INPUT' &&
        e.target.tagName !== 'TEXTAREA' &&
        e.target.tagName !== 'SELECT') {
      toggleTheme();
    }
  });

  /* ── Public API ── */
  window.MeowTheme = {
    toggle: toggleTheme,
    apply:  applyTheme,
    get:    function () { return document.documentElement.getAttribute('data-theme') || 'light'; },
    isDark: function () { return window.MeowTheme.get() === 'dark'; }
  };

})();
