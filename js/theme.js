/* ============================
   THEME TOGGLE - LIGHT / DARK
   ============================ */

(function() {
  'use strict';

  const body = document.body;
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');
  const mobileThemeToggle = document.getElementById('mobileThemeToggle');

  // Get saved theme or detect system preference
  function getPreferredTheme() {
    var saved = localStorage.getItem('meowmeow-theme');
    if (saved) return saved;

    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  // Apply theme
  function applyTheme(theme) {
    body.setAttribute('data-theme', theme);
    localStorage.setItem('meowmeow-theme', theme);
    updateThemeIcon(theme);
    updateMobileToggle(theme);
  }

  // Update desktop icon
  function updateThemeIcon(theme) {
    if (!themeIcon) return;

    if (theme === 'dark') {
      themeIcon.classList.remove('fa-sun');
      themeIcon.classList.add('fa-moon');
    } else {
      themeIcon.classList.remove('fa-moon');
      themeIcon.classList.add('fa-sun');
    }
  }

  // Update mobile toggle
  function updateMobileToggle(theme) {
    if (!mobileThemeToggle) return;
    mobileThemeToggle.checked = (theme === 'dark');
  }

  // Toggle theme
  function toggleTheme() {
    var current = body.getAttribute('data-theme') || 'light';
    var newTheme = current === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
  }

  // Event listeners
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }

  if (mobileThemeToggle) {
    mobileThemeToggle.addEventListener('change', function() {
      var newTheme = this.checked ? 'dark' : 'light';
      applyTheme(newTheme);
    });
  }

  // Listen for system theme changes
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
      if (!localStorage.getItem('meowmeow-theme')) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  // Initialize theme on load
  var initialTheme = getPreferredTheme();
  applyTheme(initialTheme);

})();