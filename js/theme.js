/* =============================================
   THEME.JS — DARK/LIGHT MODE TOGGLE
   ============================================= */

(function() {
  'use strict';

  function getTheme() {
    return localStorage.getItem('mm-theme') ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('mm-theme', theme);
    updateIcons(theme);
  }

  function updateIcons(theme) {
    const icon   = document.getElementById('themeIcon');
    const mobile = document.getElementById('mobileThemeToggle');
    if (icon) {
      icon.classList.toggle('fa-sun',  theme === 'light');
      icon.classList.toggle('fa-moon', theme === 'dark');
    }
    if (mobile) mobile.checked = (theme === 'dark');
  }

  function toggle() {
    const current = document.body.getAttribute('data-theme') || 'light';
    applyTheme(current === 'light' ? 'dark' : 'light');
  }

  // Apply immediately (before render) to avoid flash
  applyTheme(getTheme());

  document.addEventListener('DOMContentLoaded', () => {
    const btn    = document.getElementById('themeToggle');
    const mobile = document.getElementById('mobileThemeToggle');

    if (btn)    btn.addEventListener('click', toggle);
    if (mobile) mobile.addEventListener('change', () => {
      applyTheme(mobile.checked ? 'dark' : 'light');
    });

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (!localStorage.getItem('mm-theme')) applyTheme(e.matches ? 'dark' : 'light');
    });
  });

})();
