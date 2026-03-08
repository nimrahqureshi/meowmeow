/* ================================================================
   THEME.JS — LIGHT / DARK MODE (no flash of unstyled content)
   ShopLux v3.0
   ================================================================ */

/* ── ANTI-FOUC INLINE SCRIPT ─────────────────────────────────────
   Copy this tiny snippet into <head> BEFORE any CSS link tags:

   <script>
     (function(){
       var t = localStorage.getItem('shoplux_theme');
       if (!t) t = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
       document.documentElement.setAttribute('data-theme', t);
     })();
   </script>
   ──────────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  const STORAGE_KEY = 'shoplux_theme';
  const ROOT        = document.documentElement;

  /* ── PLATFORM ──────────────────────────────────────────────── */
  function getPlatform() {
    const ua = navigator.userAgent;
    if (/iPhone|iPad|iPod/.test(ua)) return 'ios';
    if (/Android/.test(ua))         return 'android';
    return 'desktop';
  }

  /* ── RESOLVE THEME ─────────────────────────────────────────── */
  function getInitial() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  /* ── APPLY ─────────────────────────────────────────────────── */
  function apply(theme, withTransition = true) {
    if (withTransition) {
      ROOT.style.setProperty('--_theme-transition', '0.35s');
    }

    ROOT.setAttribute('data-theme', theme);
    document.body && document.body.setAttribute('data-theme', theme);

    try { localStorage.setItem(STORAGE_KEY, theme); } catch {}

    _updateAllToggles(theme);
    _updateMeta(theme);
    _updateStatusBar(theme);

    document.dispatchEvent(new CustomEvent('shoplux:themeChanged', { detail: { theme } }));

    if (withTransition) {
      setTimeout(() => ROOT.style.removeProperty('--_theme-transition'), 400);
    }
  }

  /* ── META THEME-COLOR (browser chrome) ─────────────────────── */
  function _updateMeta(theme) {
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'theme-color';
      document.head.appendChild(meta);
    }
    meta.content = theme === 'dark' ? '#09090b' : '#ffffff';
  }

  /* ── APPLE STATUS BAR ───────────────────────────────────────── */
  function _updateStatusBar(theme) {
    let m = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (!m) return;
    m.content = theme === 'dark' ? 'black-translucent' : 'default';
  }

  /* ── SYNC ALL TOGGLE UI ─────────────────────────────────────── */
  function _updateAllToggles(theme) {
    const isDark = theme === 'dark';

    /* icon buttons */
    document.querySelectorAll('[data-theme-toggle], #themeToggle').forEach(btn => {
      btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
      btn.setAttribute('title',      isDark ? 'Light mode'           : 'Dark mode');
      btn.setAttribute('aria-pressed', String(isDark));

      const icon = btn.querySelector('#themeIcon, .theme-icon, i');
      if (icon) {
        icon.className = isDark
          ? icon.className.replace('fa-sun', 'fa-moon')
          : icon.className.replace('fa-moon','fa-sun');
        // Force correct class
        if (isDark) { icon.classList.remove('fa-sun');  icon.classList.add('fa-moon'); }
        else        { icon.classList.remove('fa-moon'); icon.classList.add('fa-sun');  }
      }

      /* ripple animation */
      btn.classList.add('theme-anim');
      setTimeout(() => btn.classList.remove('theme-anim'), 500);
    });

    /* legacy #themeIcon */
    const legacyIcon = document.getElementById('themeIcon');
    if (legacyIcon) {
      legacyIcon.className = isDark ? 'fas fa-moon' : 'fas fa-sun';
    }

    /* checkbox toggles (mobile) */
    document.querySelectorAll(
      '[data-mobile-theme-toggle], #mobileThemeToggle, .mobile-theme-check'
    ).forEach(el => {
      if (el.type === 'checkbox') el.checked = isDark;
    });

    /* text labels */
    document.querySelectorAll('[data-theme-label]').forEach(el => {
      el.textContent = isDark ? 'Light Mode' : 'Dark Mode';
    });
  }

  /* ── TOGGLE ─────────────────────────────────────────────────── */
  function toggle() {
    const current = ROOT.getAttribute('data-theme') || 'light';
    apply(current === 'dark' ? 'light' : 'dark', true);
  }

  /* ── BIND EVENTS ────────────────────────────────────────────── */
  function bindEvents() {
    /* click any toggle */
    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-theme-toggle], #themeToggle, .theme-toggle-btn')) {
        toggle();
      }
    });

    /* checkbox change (mobile panel) */
    document.addEventListener('change', function (e) {
      const el = e.target.closest(
        '[data-mobile-theme-toggle], #mobileThemeToggle, .mobile-theme-check'
      );
      if (el && el.type === 'checkbox') {
        apply(el.checked ? 'dark' : 'light', true);
      }
    });

    /* system pref change — only if user has no manual pref */
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (!localStorage.getItem(STORAGE_KEY)) {
          apply(e.matches ? 'dark' : 'light', true);
        }
      });
    }

    /* keyboard: Shift+T  or  just T when not in input */
    document.addEventListener('keydown', e => {
      if (e.key === 'T' && !e.ctrlKey && !e.metaKey &&
          e.target.tagName !== 'INPUT' &&
          e.target.tagName !== 'TEXTAREA' &&
          e.target.tagName !== 'SELECT') {
        toggle();
      }
    });
  }

  /* ── INIT ─────────────────────────────────────────────────────
     Apply immediately (ROOT attr already set by anti-FOUC snippet).
     Only update UI widgets once DOM is ready.
     ─────────────────────────────────────────────────────────── */
  const initialTheme = getInitial();
  ROOT.setAttribute('data-theme', initialTheme); // no-op if snippet already ran

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      apply(initialTheme, false);
      bindEvents();
    });
  } else {
    apply(initialTheme, false);
    bindEvents();
  }

  /* expose API */
  window.ShopLux = window.ShopLux || {};
  ShopLux.Theme = { toggle, apply, getInitial };

})();
