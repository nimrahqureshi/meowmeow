/* ============================================================
   THEME.JS — DARK/LIGHT MODE + SEASONAL AUTO-THEME
   MeowMeow Affiliate Site — Production v2.0
   ============================================================ */

(function() {
  'use strict';

  var STORAGE_KEY = 'meowmeow-theme';
  var body = document.documentElement; // apply to <html> for CSS var cascade

  // ===== SEASONAL CONFIG =====
  var SEASONS = {
    spring:  { months: [2, 3, 4],    emoji: '🌸', label: 'Spring Sale',  bar: '🌸 Spring is here! Fresh deals on pet essentials. Shop now →' },
    summer:  { months: [5, 6, 7],    emoji: '☀️', label: 'Summer Deals', bar: '☀️ Summer Sale Live! Beat the heat with hot pet deals →' },
    autumn:  { months: [8, 9],       emoji: '🍂', label: 'Fall Finds',   bar: '🍂 Autumn Specials! Cozy up your pet this season →' },
    holiday: { months: [10, 11],     emoji: '🎄', label: 'Holiday Sale', bar: '🎄 Holiday Sale! Best gifts for your furry friends →' },
    winter:  { months: [0, 1],       emoji: '❄️', label: 'Winter Deals', bar: '❄️ Winter Warmers! Keep your pet cozy this season →' }
  };

  // ===== DETECT CURRENT SEASON =====
  function getCurrentSeason() {
    var month = new Date().getMonth(); // 0-11
    for (var season in SEASONS) {
      if (SEASONS[season].months.indexOf(month) > -1) return season;
    }
    return 'winter';
  }

  // ===== APPLY SEASON =====
  function applySeason(season) {
    body.setAttribute('data-season', season);
    var cfg = SEASONS[season];
    if (!cfg) return;

    // Update announcement/promo bar text
    var barText = document.querySelector('.announcement-text, .promo-bar-text, #announcementText');
    if (barText) barText.textContent = cfg.bar;

    // Update page title emoji if wanted
    var seasonBadge = document.querySelector('.season-badge');
    if (seasonBadge) seasonBadge.textContent = cfg.emoji + ' ' + cfg.label;

    // Spawn particles for winter/holiday
    if (season === 'winter' || season === 'holiday') {
      spawnSeasonalParticles(season === 'holiday' ? ['❄️','🎄','🎁','⭐','✨'] : ['❄️','❄️','❄️','✨','💙']);
    } else if (season === 'spring') {
      spawnSeasonalParticles(['🌸','🌺','🌷','🌻','🍀']);
    } else if (season === 'autumn') {
      spawnSeasonalParticles(['🍂','🍁','🍃','🌰','🎃']);
    }
  }

  // ===== SEASONAL PARTICLES =====
  function spawnSeasonalParticles(emojis) {
    var existing = document.getElementById('seasonParticles');
    if (existing) return; // Already running

    var container = document.createElement('div');
    container.id = 'seasonParticles';
    container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:1;overflow:hidden;';
    document.body.prepend(container);

    var count = 0;
    var maxParticles = 18;

    function createParticle() {
      if (count >= maxParticles) return;
      count++;
      var p = document.createElement('span');
      var emoji = emojis[Math.floor(Math.random() * emojis.length)];
      var left = Math.random() * 100;
      var delay = Math.random() * 3;
      var dur = 6 + Math.random() * 8;
      var size = 14 + Math.random() * 14;
      p.textContent = emoji;
      p.style.cssText =
        'position:absolute;top:-40px;left:' + left + '%;' +
        'font-size:' + size + 'px;' +
        'animation:seasonFall ' + dur + 's linear ' + delay + 's forwards;' +
        'opacity:0.7;';
      container.appendChild(p);
      setTimeout(function() { if (p.parentNode) p.remove(); count--; }, (dur + delay) * 1000 + 500);
    }

    // Inject keyframe if not present
    if (!document.getElementById('seasonFallStyle')) {
      var style = document.createElement('style');
      style.id = 'seasonFallStyle';
      style.textContent = '@keyframes seasonFall{0%{transform:translateY(0) rotate(0deg);opacity:.7}100%{transform:translateY(110vh) rotate(360deg);opacity:0}}';
      document.head.appendChild(style);
    }

    // Spawn particles over time
    var interval = setInterval(createParticle, 600);
    setTimeout(function() {
      clearInterval(interval);
    }, maxParticles * 600 + 1000);
  }

  // ===== GET PREFERRED THEME =====
  function getPreferredTheme() {
    var saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    return 'light';
  }

  // ===== APPLY THEME =====
  function applyTheme(theme) {
    body.setAttribute('data-theme', theme);
    document.body && document.body.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
    updateAllThemeIcons(theme);
    updateMobileToggles(theme);
  }

  // ===== UPDATE ICONS =====
  function updateAllThemeIcons(theme) {
    document.querySelectorAll('.theme-icon, #themeIcon').forEach(function(icon) {
      if (theme === 'dark') {
        icon.classList.remove('fa-sun'); icon.classList.add('fa-moon');
      } else {
        icon.classList.remove('fa-moon'); icon.classList.add('fa-sun');
      }
    });
    // Update aria-label on toggle buttons
    document.querySelectorAll('#themeToggle, .theme-toggle-btn').forEach(function(btn) {
      btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    });
  }

  // ===== UPDATE MOBILE TOGGLES =====
  function updateMobileToggles(theme) {
    document.querySelectorAll('#mobileThemeToggle, .mobile-theme-input').forEach(function(input) {
      if (input.tagName === 'INPUT') input.checked = (theme === 'dark');
    });
  }

  // ===== TOGGLE THEME =====
  window.toggleTheme = function() {
    var current = body.getAttribute('data-theme') || 'light';
    applyTheme(current === 'light' ? 'dark' : 'light');
  };

  // ===== EXPOSE setTheme GLOBALLY =====
  window.setTheme = applyTheme;

  // ===== EVENT LISTENERS =====
  document.addEventListener('DOMContentLoaded', function() {
    // Desktop toggle
    var themeToggle = document.getElementById('themeToggle');
    if (themeToggle) themeToggle.addEventListener('click', window.toggleTheme);

    // Any .theme-toggle-btn
    document.querySelectorAll('.theme-toggle-btn').forEach(function(btn) {
      btn.addEventListener('click', window.toggleTheme);
    });

    // Mobile checkbox toggle
    var mobileToggle = document.getElementById('mobileThemeToggle');
    if (mobileToggle) {
      mobileToggle.addEventListener('change', function() {
        applyTheme(this.checked ? 'dark' : 'light');
      });
    }

    // Apply season
    var season = getCurrentSeason();
    applySeason(season);
  });

  // ===== SYSTEM THEME CHANGE LISTENER =====
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
      if (!localStorage.getItem(STORAGE_KEY)) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  // ===== APPLY THEME IMMEDIATELY (before DOMContentLoaded to prevent flash) =====
  applyTheme(getPreferredTheme());

})();
