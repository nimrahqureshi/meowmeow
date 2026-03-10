/* ================================================================
   navbar.js  —  MeowMeow  —  All interactivity
   Mobile menu · Theme toggle · Search · Wishlist · Quick View
   Toast · Countdown timer · Stat counters · Scroll effects · FAQ
   ================================================================ */
(function () {
  'use strict';

  /* ─── THEME ──────────────────────────────────────────────────── */
  function getSavedTheme() {
    return localStorage.getItem('mm-theme') ||
      (window.matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light');
  }
  function applyTheme(t) {
    document.body.setAttribute('data-theme', t);
    localStorage.setItem('mm-theme', t);
    var icon = document.getElementById('themeIcon');
    if (icon) icon.className = t === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    var mob = document.getElementById('mobileThemeToggle');
    if (mob) mob.checked = (t === 'dark');
  }
  applyTheme(getSavedTheme());

  document.addEventListener('click', function (e) {
    if (e.target.closest('#themeToggle')) {
      applyTheme(document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    }
  });
  document.addEventListener('change', function (e) {
    if (e.target.id === 'mobileThemeToggle') {
      applyTheme(e.target.checked ? 'dark' : 'light');
    }
  });

  /* ─── MOBILE MENU ────────────────────────────────────────────── */
  function openMenu() {
    ['mobileMenu', 'mobileOverlay'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.classList.add('active');
    });
    var toggle = document.getElementById('menuToggle');
    if (toggle) toggle.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    ['mobileMenu', 'mobileOverlay'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.classList.remove('active');
    });
    var toggle = document.getElementById('menuToggle');
    if (toggle) toggle.classList.remove('active');
    document.body.style.overflow = '';
  }
  document.addEventListener('click', function (e) {
    if (e.target.closest('#menuToggle')) openMenu();
    if (e.target.closest('#mobileClose') || e.target.id === 'mobileOverlay') closeMenu();
  });

  /* ─── NAVBAR SCROLL ──────────────────────────────────────────── */
  function onScroll() {
    var nb = document.getElementById('navbar');
    if (nb) nb.classList.toggle('scrolled', window.scrollY > 60);

    var bar = document.getElementById('scrollProgress');
    if (bar) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
    }
    var btt = document.getElementById('backToTop');
    if (btt) btt.classList.toggle('visible', window.scrollY > 400);
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ─── BACK TO TOP ────────────────────────────────────────────── */
  document.addEventListener('click', function (e) {
    if (e.target.closest('#backToTop')) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  /* ─── SEARCH TOGGLE ──────────────────────────────────────────── */
  document.addEventListener('click', function (e) {
    if (e.target.closest('#searchToggle')) {
      var ns = document.getElementById('navSearch');
      if (ns) {
        ns.classList.toggle('active');
        var si = document.getElementById('searchInput');
        if (si && ns.classList.contains('active')) si.focus();
      }
    }
  });

  /* ─── TOAST ──────────────────────────────────────────────────── */
  window.showToast = function (msg, type) {
    var c = document.getElementById('toastContainer');
    if (!c) { c = document.createElement('div'); c.id = 'toastContainer'; document.body.appendChild(c); }
    c.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:8px';
    var colours = { success: '#10B981', error: '#EF4444', warning: '#F59E0B', info: '#7C3AED' };
    var t = document.createElement('div');
    t.style.cssText = 'display:flex;align-items:center;gap:12px;padding:14px 18px;' +
      'background:var(--bg-card,#fff);color:var(--text-primary,#111);' +
      'border-left:4px solid ' + (colours[type] || colours.info) + ';' +
      'border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,.2);min-width:260px;max-width:360px;' +
      'animation:mmFadeUp .3s ease';
    t.innerHTML = '<span style="flex:1;font-size:.9rem">' + msg + '</span>' +
      '<button onclick="this.parentElement.remove()" style="background:none;border:none;cursor:pointer;' +
      'font-size:1.2rem;opacity:.5;color:inherit;padding:0;line-height:1">&times;</button>';
    c.appendChild(t);
    setTimeout(function () { t.style.opacity = '0'; t.style.transition = '.4s'; setTimeout(function () { t.remove(); }, 400); }, 3500);
  };

  /* ─── AFFILIATE DISCLOSURE CLOSE ────────────────────────────── */
  document.addEventListener('click', function (e) {
    if (e.target.closest('#disclosureClose')) {
      var disc = document.getElementById('affiliateDisclosure');
      if (disc) { disc.style.opacity = '0'; setTimeout(function () { disc.style.display = 'none'; }, 300); }
    }
  });

  /* ─── WISHLIST ───────────────────────────────────────────────── */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.wishlist-toggle');
    if (!btn) return;
    btn.classList.toggle('active');
    var ic = btn.querySelector('i');
    if (ic) {
      if (btn.classList.contains('active')) { ic.classList.replace('far', 'fas'); window.showToast('❤️ Added to wishlist!', 'success'); }
      else { ic.classList.replace('fas', 'far'); window.showToast('💔 Removed from wishlist', 'warning'); }
    }
  });

  /* ─── QUICK VIEW ─────────────────────────────────────────────── */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.quick-view-btn');
    if (!btn) return;
    var modal = document.getElementById('quickViewModal');
    if (!modal) return;
    var card = btn.closest('.product-card');
    var d = btn.dataset;
    var name    = d.name    || (card && card.querySelector('.product-name')    ? card.querySelector('.product-name').textContent    : 'Product');
    var img     = d.img     || (card && card.querySelector('img')              ? card.querySelector('img').src                      : '');
    var price   = d.price   || (card && card.querySelector('.price-current')   ? card.querySelector('.price-current').textContent   : '');
    var orig    = d.orig    || (card && card.querySelector('.price-original')  ? card.querySelector('.price-original').textContent  : '');
    var market  = d.market  || (card && card.querySelector('.product-marketplace') ? card.querySelector('.product-marketplace').textContent.trim() : '');
    var link    = d.link    || (card && card.querySelector('a[target="_blank"]') ? card.querySelector('a[target="_blank"]').href    : '#');
    var desc    = d.desc    || 'Highly rated product on ' + market + '. Click Buy Now to view the full listing.';

    function set(id, val) { var el = document.getElementById(id); if (el) el.textContent = val; }
    function setHTML(id, val) { var el = document.getElementById(id); if (el) el.innerHTML = val; }
    set('qvName', name);
    set('qvMarket', market);
    set('qvDesc', desc);
    setHTML('qvPrice', '<span class="price-current">' + price + '</span> <span class="price-original">' + orig + '</span>');
    var qi = document.getElementById('qvImage'); if (qi) { qi.src = img; qi.alt = name; }
    var ql = document.getElementById('qvLink'); if (ql) ql.href = link;
    modal.style.display = 'flex';
  });
  document.addEventListener('click', function (e) {
    if (e.target.closest('#quickViewClose') || e.target.id === 'quickViewModal') {
      var m = document.getElementById('quickViewModal');
      if (m) m.style.display = 'none';
    }
  });

  /* ─── NEWSLETTER & CONTACT FORMS ────────────────────────────── */
  document.addEventListener('submit', function (e) {
    var f = e.target;
    var isContact = (f.id === 'contactForm');
    var isNewsletter = !isContact && (
      f.id === 'newsletterForm' || f.id === 'newsletter-form' ||
      f.hasAttribute('data-newsletter-form') ||
      f.classList.contains('newsletter-form') ||
      f.closest('.newsletter-form')
    );
    if (!isContact && !isNewsletter) return;
    e.preventDefault();
    if (isContact) { window.showToast('📬 Message sent! We\'ll reply within 24h.', 'success'); f.reset(); return; }
    var note = f.querySelector('.form-note, small, [id*="msg"]');
    if (note) { note.textContent = '✅ Subscribed! Check your inbox.'; note.style.color = '#10B981'; }
    f.reset();
    window.showToast('🎉 Subscribed! Welcome to MeowMeow.', 'success');
  });

  /* ─── FAQ ACCORDION ──────────────────────────────────────────── */
  document.addEventListener('click', function (e) {
    var q = e.target.closest('.faq-question');
    if (!q) return;
    var item = q.closest('.faq-item');
    var wasOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(function (i) { i.classList.remove('open'); });
    if (!wasOpen) item.classList.add('open');
  });

  /* ─── PRODUCT FILTER ─────────────────────────────────────────── */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-filter]');
    if (!btn || !btn.closest('.filter-bar, .products-filter-bar, [class*="filter"]')) return;
    document.querySelectorAll('[data-filter]').forEach(function (b) { b.classList.remove('active'); });
    btn.classList.add('active');
    var f = btn.dataset.filter;
    document.querySelectorAll('[data-category]').forEach(function (card) {
      var cats = (card.dataset.category || '').split(/\s+/);
      card.style.display = (f === 'all' || cats.includes(f)) ? '' : 'none';
    });
  });

  /* ─── COUNTDOWN TIMER ────────────────────────────────────────── */
  function startTimer() {
    var IDS = { h: ['timer-hours','hours'], m: ['timer-mins','minutes'], s: ['timer-secs','seconds'] };
    function getEl(arr) { for (var i=0;i<arr.length;i++){var e=document.getElementById(arr[i]);if(e)return e;} return null; }
    var hEl=getEl(IDS.h), mEl=getEl(IDS.m), sEl=getEl(IDS.s);
    if (!hEl) return;
    var stored = sessionStorage.getItem('mm-cd');
    var total = stored ? parseInt(stored) : (23*3600 + 59*60 + 59);
    function tick() {
      var h=Math.floor(total/3600), m=Math.floor((total%3600)/60), s=total%60;
      if(hEl) hEl.textContent=String(h).padStart(2,'0');
      if(mEl) mEl.textContent=String(m).padStart(2,'0');
      if(sEl) sEl.textContent=String(s).padStart(2,'0');
      total--; if(total<0) total=24*3600-1;
      sessionStorage.setItem('mm-cd', total);
    }
    tick(); setInterval(tick, 1000);
  }

  /* ─── STAT COUNTER ANIMATION ─────────────────────────────────── */
  function startCounters() {
    if (!('IntersectionObserver' in window)) return;
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseInt(el.getAttribute('data-count')) || 0;
        var curr = 0, steps = 60, step = Math.ceil(target / steps);
        var iv = setInterval(function () {
          curr = Math.min(curr + step, target);
          el.textContent = curr >= 1000 ? Math.round(curr/1000) + 'K+' : curr + '+';
          if (curr >= target) clearInterval(iv);
        }, 25);
        obs.unobserve(el);
      });
    }, { threshold: 0.4 });
    document.querySelectorAll('[data-count]').forEach(function (el) { obs.observe(el); });
  }

  /* ─── SCROLL REVEAL ──────────────────────────────────────────── */
  function startReveal() {
    if (!('IntersectionObserver' in window)) return;
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.style.opacity = '1';
          e.target.style.transform = 'translateY(0)';
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('.product-card,.category-card,.blog-card,.contact-item,.faq-item').forEach(function (el, i) {
      el.style.cssText += ';opacity:0;transform:translateY(24px);transition:opacity .5s ease '+(i%4*.08)+'s,transform .5s ease '+(i%4*.08)+'s';
      obs.observe(el);
    });
  }

  /* ─── INIT ───────────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { startTimer(); startCounters(); startReveal(); });
  } else {
    startTimer(); startCounters(); startReveal();
  }

})();
