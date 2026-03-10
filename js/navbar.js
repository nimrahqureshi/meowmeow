/* =====================================================
   navbar.js — MeowMeow Complete Interactive Navbar
   Handles: mobile menu, theme, search, wishlist,
   quick view, countdown timer, counter animation,
   back-to-top, scroll progress, toast, affiliate
   ===================================================== */
(function () {
  'use strict';

  /* ── THEME ─────────────────────────────────── */
  function getTheme() {
    return localStorage.getItem('meowmeow-theme') ||
      (window.matchMedia && window.matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light');
  }
  function applyTheme(t) {
    document.body.setAttribute('data-theme', t);
    localStorage.setItem('meowmeow-theme', t);
    var ic = document.getElementById('themeIcon');
    if (ic) { ic.className = t === 'dark' ? 'fas fa-sun' : 'fas fa-moon'; }
    var mt = document.getElementById('mobileThemeToggle');
    if (mt) mt.checked = (t === 'dark');
  }
  applyTheme(getTheme());

  var themeBtn = document.getElementById('themeToggle');
  if (themeBtn) themeBtn.addEventListener('click', function () {
    applyTheme(document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });
  var mobTheme = document.getElementById('mobileThemeToggle');
  if (mobTheme) mobTheme.addEventListener('change', function () {
    applyTheme(this.checked ? 'dark' : 'light');
  });

  /* ── MOBILE MENU ────────────────────────────── */
  var menuToggle = document.getElementById('menuToggle');
  var mobileMenu = document.getElementById('mobileMenu');
  var mobileOverlay = document.getElementById('mobileOverlay');
  var mobileClose = document.getElementById('mobileClose');

  function openMenu() {
    if (mobileMenu) mobileMenu.classList.add('active');
    if (mobileOverlay) mobileOverlay.classList.add('active');
    if (menuToggle) menuToggle.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    if (mobileMenu) mobileMenu.classList.remove('active');
    if (mobileOverlay) mobileOverlay.classList.remove('active');
    if (menuToggle) menuToggle.classList.remove('active');
    document.body.style.overflow = '';
  }
  if (menuToggle) menuToggle.addEventListener('click', openMenu);
  if (mobileClose) mobileClose.addEventListener('click', closeMenu);
  if (mobileOverlay) mobileOverlay.addEventListener('click', closeMenu);

  /* ── NAVBAR SCROLL ──────────────────────────── */
  var navbar = document.getElementById('navbar');
  function onScroll() {
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 50);
    var bar = document.getElementById('scrollProgress');
    if (bar) {
      var pct = (window.scrollY / Math.max(1, document.body.scrollHeight - window.innerHeight)) * 100;
      bar.style.width = pct + '%';
    }
    var btt = document.getElementById('backToTop');
    if (btt) btt.classList.toggle('visible', window.scrollY > 400);
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ── BACK TO TOP ────────────────────────────── */
  var btt = document.getElementById('backToTop');
  if (btt) btt.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ── SEARCH TOGGLE ──────────────────────────── */
  var searchToggle = document.getElementById('searchToggle');
  var navSearch = document.getElementById('navSearch');
  var searchInput = document.getElementById('searchInput');
  if (searchToggle) searchToggle.addEventListener('click', function () {
    if (navSearch) {
      navSearch.classList.toggle('active');
      if (navSearch.classList.contains('active') && searchInput) searchInput.focus();
    }
  });

  /* ── TOAST ──────────────────────────────────── */
  window.showToast = function (msg, type) {
    var c = document.getElementById('toastContainer');
    if (!c) return;
    var t = document.createElement('div');
    var colors = { success: '#10B981', error: '#EF4444', warning: '#F59E0B', info: '#7C3AED' };
    t.style.cssText = 'display:flex;align-items:center;gap:12px;padding:14px 18px;' +
      'background:var(--bg-card,#fff);border-left:4px solid ' + (colors[type] || colors.info) + ';' +
      'border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,.18);margin-bottom:10px;' +
      'animation:fadeInUp .3s ease;max-width:360px;color:var(--text-primary,#111)';
    t.innerHTML = '<span style="flex:1">' + msg + '</span>' +
      '<button onclick="this.parentElement.remove()" style="background:none;border:none;' +
      'cursor:pointer;font-size:1.1rem;opacity:.5;color:inherit">&times;</button>';
    c.appendChild(t);
    setTimeout(function () {
      t.style.transition = 'opacity .4s';
      t.style.opacity = '0';
      setTimeout(function () { t.remove(); }, 400);
    }, 3500);
  };

  /* ── WISHLIST ───────────────────────────────── */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.wishlist-toggle');
    if (!btn) return;
    btn.classList.toggle('active');
    var ic = btn.querySelector('i');
    if (ic) {
      ic.classList.toggle('far', !btn.classList.contains('active'));
      ic.classList.toggle('fas', btn.classList.contains('active'));
    }
    window.showToast(
      btn.classList.contains('active') ? '❤️ Added to wishlist!' : 'Removed from wishlist',
      btn.classList.contains('active') ? 'success' : 'warning'
    );
  });

  /* ── QUICK VIEW ─────────────────────────────── */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.quick-view-btn');
    if (!btn) return;
    var modal = document.getElementById('quickViewModal');
    if (!modal) return;
    var d = btn.dataset;
    var card = btn.closest('.product-card');
    var name = d.name || (card && card.querySelector('.product-name') ? card.querySelector('.product-name').textContent : 'Product');
    var img = d.img || (card && card.querySelector('img') ? card.querySelector('img').src : '');
    var price = d.price || (card && card.querySelector('.price-current') ? card.querySelector('.price-current').textContent : '');
    var orig = d.orig || (card && card.querySelector('.price-original') ? card.querySelector('.price-original').textContent : '');
    var market = d.market || (card && card.querySelector('.product-marketplace') ? card.querySelector('.product-marketplace').textContent.trim() : '');
    var link = d.link || (card && card.querySelector('.btn-cta') ? card.querySelector('.btn-cta').href : '#');
    var desc = d.desc || 'Top-rated product available on ' + market + '. Click Buy Now to view on the platform.';

    var el = function (id) { return document.getElementById(id); };
    if (el('qvName')) el('qvName').textContent = name;
    if (el('qvImage')) { el('qvImage').src = img; el('qvImage').alt = name; }
    if (el('qvMarket')) el('qvMarket').textContent = market;
    if (el('qvDesc')) el('qvDesc').textContent = desc;
    if (el('qvPrice')) el('qvPrice').innerHTML =
      '<span class="price-current">' + price + '</span>&nbsp;<span class="price-original">' + orig + '</span>';
    if (el('qvLink')) el('qvLink').href = link;
    modal.style.display = 'flex';
  });
  var qvClose = document.getElementById('quickViewClose');
  if (qvClose) qvClose.addEventListener('click', function () {
    var m = document.getElementById('quickViewModal');
    if (m) m.style.display = 'none';
  });
  document.addEventListener('click', function (e) {
    if (e.target && e.target.id === 'quickViewModal') e.target.style.display = 'none';
  });

  /* ── AFFILIATE DISCLOSURE ───────────────────── */
  var discClose = document.getElementById('disclosureClose');
  if (discClose) discClose.addEventListener('click', function () {
    var disc = document.getElementById('affiliateDisclosure');
    if (disc) disc.style.display = 'none';
  });

  /* ── COUNTDOWN TIMER ────────────────────────── */
  function initTimer() {
    var ids = {
      h: ['timer-hours', 'hours'],
      m: ['timer-mins', 'minutes'],
      s: ['timer-secs', 'seconds']
    };
    function getEl(arr) {
      for (var i = 0; i < arr.length; i++) {
        var el = document.getElementById(arr[i]);
        if (el) return el;
      }
      return null;
    }
    var hEl = getEl(ids.h), mEl = getEl(ids.m), sEl = getEl(ids.s);
    if (!hEl) return;
    var stored = sessionStorage.getItem('mm-countdown');
    var total = stored ? parseInt(stored) : 23 * 3600 + 59 * 60 + 59;
    function tick() {
      var h = Math.floor(total / 3600), m = Math.floor((total % 3600) / 60), s = total % 60;
      if (hEl) hEl.textContent = String(h).padStart(2, '0');
      if (mEl) mEl.textContent = String(m).padStart(2, '0');
      if (sEl) sEl.textContent = String(s).padStart(2, '0');
      total--; if (total < 0) total = 24 * 3600 - 1;
      sessionStorage.setItem('mm-countdown', total);
    }
    tick();
    setInterval(tick, 1000);
  }

  /* ── COUNTER ANIMATION ──────────────────────── */
  function initCounters() {
    if (!('IntersectionObserver' in window)) return;
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseInt(el.getAttribute('data-count'));
        var curr = 0, step = Math.ceil(target / 80);
        var iv = setInterval(function () {
          curr += step;
          if (curr >= target) { curr = target; clearInterval(iv); }
          el.textContent = curr >= 1000 ? (curr / 1000).toFixed(0) + 'K+' : curr + '+';
        }, 25);
        obs.unobserve(el);
      });
    }, { threshold: 0.4 });
    document.querySelectorAll('[data-count]').forEach(function (el) { obs.observe(el); });
  }

  /* ── SCROLL REVEAL ──────────────────────────── */
  function initReveal() {
    if (!('IntersectionObserver' in window)) return;
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.style.opacity = '1';
          e.target.style.transform = 'translateY(0)';
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.product-card, .category-card, .blog-card, .contact-item').forEach(function (el, i) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(28px)';
      el.style.transition = 'opacity .5s ease ' + (i % 4) * 0.08 + 's, transform .5s ease ' + (i % 4) * 0.08 + 's';
      obs.observe(el);
    });
  }

  /* ── NEWSLETTER ─────────────────────────────── */
  document.addEventListener('submit', function (e) {
    var f = e.target;
    var isNewsletter = f.id === 'newsletterForm' || f.id === 'newsletter-form' ||
      f.hasAttribute('data-newsletter-form');
    var isContact = f.id === 'contactForm';
    if (!isNewsletter && !isContact) return;
    e.preventDefault();
    if (isContact) {
      window.showToast('📬 Message sent! We\'ll reply within 24h.', 'success');
      f.reset();
      return;
    }
    var note = f.querySelector('.form-note, small');
    if (note) { note.textContent = '✅ Subscribed! Check your inbox.'; note.style.color = '#10B981'; }
    f.reset();
    window.showToast('🎉 You\'re subscribed! Welcome aboard!', 'success');
  });

  /* ── FAQ ACCORDION ──────────────────────────── */
  document.addEventListener('click', function (e) {
    var q = e.target.closest('.faq-question');
    if (!q) return;
    var item = q.closest('.faq-item'), was = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(function (i) { i.classList.remove('open'); });
    if (!was) item.classList.add('open');
  });

  /* ── PRODUCT FILTER ─────────────────────────── */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-filter]');
    if (!btn) return;
    document.querySelectorAll('[data-filter]').forEach(function (b) {
      b.classList.remove('active');
    });
    btn.classList.add('active');
    var f = btn.dataset.filter;
    document.querySelectorAll('[data-category]').forEach(function (card) {
      var cats = card.dataset.category ? card.dataset.category.split(' ') : [];
      card.style.display = (f === 'all' || cats.includes(f)) ? '' : 'none';
    });
  });

  /* ── INIT ON DOM READY ──────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initTimer();
      initCounters();
      initReveal();
    });
  } else {
    initTimer();
    initCounters();
    initReveal();
  }

})();
