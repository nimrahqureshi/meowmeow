/* ============================
   THEME.JS — LIGHT / DARK & COLOR THEMES
   ============================ */

(function() {
  'use strict';

  const STORAGE_KEY = 'meowmeow-theme';
  const COLOR_KEY = 'meowmeow-color';

  // Accent color configurations
  const colorThemes = {
    purple: {
      accent: '#C026D3', accentHover: '#A21CAF',
      accentLight: 'rgba(192,38,211,0.10)',
      cta: '#F43F5E', ctaHover: '#E11D48',
      ctaLight: 'rgba(244,63,94,0.10)',
      gradientPrimary: 'linear-gradient(135deg, #C026D3 0%, #7C3AED 100%)',
      gradientCta: 'linear-gradient(135deg, #F43F5E 0%, #FB923C 100%)',
    },
    rose: {
      accent: '#F43F5E', accentHover: '#E11D48',
      accentLight: 'rgba(244,63,94,0.10)',
      cta: '#FB923C', ctaHover: '#EA7C22',
      ctaLight: 'rgba(251,146,60,0.10)',
      gradientPrimary: 'linear-gradient(135deg, #F43F5E 0%, #FB923C 100%)',
      gradientCta: 'linear-gradient(135deg, #FB923C 0%, #FCD34D 100%)',
    },
    blue: {
      accent: '#2563EB', accentHover: '#1D4ED8',
      accentLight: 'rgba(37,99,235,0.10)',
      cta: '#06B6D4', ctaHover: '#0891B2',
      ctaLight: 'rgba(6,182,212,0.10)',
      gradientPrimary: 'linear-gradient(135deg, #2563EB 0%, #06B6D4 100%)',
      gradientCta: 'linear-gradient(135deg, #06B6D4 0%, #818CF8 100%)',
    },
    green: {
      accent: '#059669', accentHover: '#047857',
      accentLight: 'rgba(5,150,105,0.10)',
      cta: '#10B981', ctaHover: '#059669',
      ctaLight: 'rgba(16,185,129,0.10)',
      gradientPrimary: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
      gradientCta: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
    },
    amber: {
      accent: '#D97706', accentHover: '#B45309',
      accentLight: 'rgba(217,119,6,0.10)',
      cta: '#F59E0B', ctaHover: '#D97706',
      ctaLight: 'rgba(245,158,11,0.10)',
      gradientPrimary: 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)',
      gradientCta: 'linear-gradient(135deg, #F59E0B 0%, #FCD34D 100%)',
    },
    teal: {
      accent: '#0D9488', accentHover: '#0F766E',
      accentLight: 'rgba(13,148,136,0.10)',
      cta: '#14B8A6', ctaHover: '#0D9488',
      ctaLight: 'rgba(20,184,166,0.10)',
      gradientPrimary: 'linear-gradient(135deg, #0D9488 0%, #14B8A6 100%)',
      gradientCta: 'linear-gradient(135deg, #14B8A6 0%, #06B6D4 100%)',
    },
  };

  // Get saved theme
  function getSavedTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function getSavedColor() {
    return localStorage.getItem(COLOR_KEY) || 'purple';
  }

  // Apply theme
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
    updateThemeToggleUI(theme);
  }

  // Apply color scheme
  function applyColorScheme(colorName) {
    const colors = colorThemes[colorName];
    if (!colors) return;

    const root = document.documentElement;
    root.style.setProperty('--accent', colors.accent);
    root.style.setProperty('--accent-hover', colors.accentHover);
    root.style.setProperty('--accent-light', colors.accentLight);
    root.style.setProperty('--cta', colors.cta);
    root.style.setProperty('--cta-hover', colors.ctaHover);
    root.style.setProperty('--cta-light', colors.ctaLight);
    root.style.setProperty('--gradient-primary', colors.gradientPrimary);
    root.style.setProperty('--gradient-cta', colors.gradientCta);

    localStorage.setItem(COLOR_KEY, colorName);

    // Update active swatch
    document.querySelectorAll('.color-swatch').forEach(s => {
      s.classList.toggle('active', s.dataset.color === colorName);
    });
  }

  // Toggle light/dark
  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    applyTheme(current === 'dark' ? 'light' : 'dark');
  }

  // Update toggle UI
  function updateThemeToggleUI(theme) {
    const icons = document.querySelectorAll('#themeIcon, .theme-icon-all');
    icons.forEach(icon => {
      if (theme === 'dark') {
        icon.className = icon.className.replace('fa-sun', 'fa-moon');
        if (!icon.className.includes('fa-moon')) icon.classList.add('fa-moon');
      } else {
        icon.className = icon.className.replace('fa-moon', 'fa-sun');
        if (!icon.className.includes('fa-sun')) icon.classList.add('fa-sun');
      }
    });

    // Mobile toggle
    const mobileToggle = document.getElementById('mobileThemeToggle');
    if (mobileToggle) mobileToggle.checked = (theme === 'dark');

    // Settings toggle
    const settingsToggle = document.getElementById('settingsThemeToggle');
    if (settingsToggle) settingsToggle.checked = (theme === 'dark');
  }

  // Public API
  window.ThemeManager = {
    toggle: toggleTheme,
    set: applyTheme,
    setColor: applyColorScheme,
    getTheme: () => document.documentElement.getAttribute('data-theme') || 'light',
    getColor: getSavedColor,
    colors: colorThemes,
  };

  // Init
  applyTheme(getSavedTheme());
  document.addEventListener('DOMContentLoaded', () => {
    applyColorScheme(getSavedColor());
  });

  // Event listeners - auto attach after DOM
  document.addEventListener('DOMContentLoaded', () => {
    // Theme toggle buttons
    document.querySelectorAll('[data-theme-toggle], #themeToggle').forEach(btn => {
      btn.addEventListener('click', toggleTheme);
    });

    // Mobile theme toggle
    const mobileThemeToggle = document.getElementById('mobileThemeToggle');
    if (mobileThemeToggle) {
      mobileThemeToggle.addEventListener('change', function() {
        applyTheme(this.checked ? 'dark' : 'light');
      });
    }

    // Color swatches
    document.querySelectorAll('.color-swatch[data-color]').forEach(swatch => {
      swatch.addEventListener('click', function() {
        applyColorScheme(this.dataset.color);
      });
    });
  });

  // System preference changes
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (!localStorage.getItem(STORAGE_KEY)) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

})();
