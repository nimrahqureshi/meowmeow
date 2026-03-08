/* ================================================================
   SCROLL.JS — PROGRESS BAR, BACK-TO-TOP, REVEAL, COUNTERS,
                COUNTDOWN TIMER, PARALLAX, SOCIAL PROOF POPUPS
   ShopLux v3.0
   ================================================================ */

(function () {
  'use strict';

  /* ── SCROLL PROGRESS BAR ──────────────────────────────────── */
  const progressBar = document.getElementById('scrollProgress');

  function updateProgress() {
    if (!progressBar) return;
    const s = window.scrollY || window.pageYOffset;
    const m = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = (m > 0 ? Math.min(100, (s / m) * 100) : 0) + '%';
  }

  /* ── BACK TO TOP ──────────────────────────────────────────── */
  const bttBtn = document.getElementById('backToTop');

  function updateBTT() {
    bttBtn?.classList.toggle('visible', (window.scrollY || window.pageYOffset) > 400);
  }

  bttBtn?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ── COMBINED THROTTLED SCROLL LISTENER ───────────────────── */
  let raf = false;
  window.addEventListener('scroll', () => {
    if (!raf) {
      raf = true;
      requestAnimationFrame(() => {
        updateProgress();
        updateBTT();
        raf = false;
      });
    }
  }, { passive: true });

  updateProgress();
  updateBTT();

  /* ── SCROLL REVEAL ────────────────────────────────────────── */
  function initReveal() {
    const TARGETS = [
      '.product-card', '.category-card', '.review-card', '.blog-card',
      '.feature-card', '.trending-card', '.stat-card', '.team-card',
      '.deal-card', '.faq-item', '.contact-item', '.section-header',
      '.reveal', '[data-reveal]',
    ].join(', ');

    const els = document.querySelectorAll(TARGETS);
    if (!els.length) return;

    /* respect user motion pref */
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      els.forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      return;
    }

    if (!('IntersectionObserver' in window)) {
      els.forEach(el => { el.style.opacity='1'; el.style.transform='none'; });
      return;
    }

    els.forEach((el, i) => {
      const delay = (i % 5) * 90; /* stagger 0–360ms in groups of 5 */
      el.style.cssText += `
        opacity:0;
        transform:translateY(26px);
        transition:opacity 0.6s ease ${delay}ms, transform 0.65s cubic-bezier(.25,.46,.45,.94) ${delay}ms;
      `;
    });

    const io = new IntersectionObserver(entries => {
      entries.forEach(({ isIntersecting, target }) => {
        if (!isIntersecting) return;
        target.style.opacity   = '1';
        target.style.transform = 'translateY(0)';
        target.classList.add('revealed');
        io.unobserve(target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -56px 0px' });

    els.forEach(el => io.observe(el));
  }

  /* ── COUNTER ANIMATION ────────────────────────────────────── */
  function initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length || !('IntersectionObserver' in window)) return;

    const io = new IntersectionObserver(entries => {
      entries.forEach(({ isIntersecting, target }) => {
        if (!isIntersecting) return;

        const raw    = target.dataset.count;
        const target_n = parseFloat(raw) || 0;
        const suffix   = target.dataset.suffix || '';
        const prefix   = target.dataset.prefix || '';
        const dur      = 1800;
        const steps    = 64;
        const interval = dur / steps;
        let step = 0;

        const tick = setInterval(() => {
          step++;
          const progress = step / steps;
          /* ease-out-expo */
          const eased = step >= steps ? 1 : 1 - Math.pow(2, -10 * progress);
          const cur   = target_n * eased;

          target.textContent = prefix
            + (Number.isInteger(target_n) ? Math.round(cur).toLocaleString() : cur.toFixed(1))
            + suffix;

          if (step >= steps) {
            clearInterval(tick);
            target.textContent = prefix
              + (Number.isInteger(target_n) ? target_n.toLocaleString() : target_n.toFixed(1))
              + suffix;
          }
        }, interval);

        io.unobserve(target);
      });
    }, { threshold: 0.6 });

    counters.forEach(c => io.observe(c));
  }

  /* ── LIVE COUNTDOWN TIMER ─────────────────────────────────── */
  function initCountdown() {
    const hoursEl   = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    if (!hoursEl || !minutesEl || !secondsEl) return;

    /* Persist end-time so it survives page refresh */
    const KEY = 'shoplux_deal_end_v3';
    let end = parseInt(localStorage.getItem(KEY), 10);
    if (!end || end <= Date.now()) {
      end = Date.now() + 11 * 3600 * 1000 + 47 * 60 * 1000; /* 11h 47m */
      try { localStorage.setItem(KEY, String(end)); } catch {}
    }

    let lastSec = -1;

    function tick() {
      const rem  = Math.max(0, end - Date.now());
      const secs = Math.floor(rem / 1000);
      if (secs === lastSec) return;
      lastSec = secs;

      const h = Math.floor(secs / 3600);
      const m = Math.floor((secs % 3600) / 60);
      const s = secs % 60;

      const fmt = n => String(n).padStart(2, '0');

      /* animate flip on change */
      [[hoursEl, h], [minutesEl, m], [secondsEl, s]].forEach(([el, val]) => {
        const str = fmt(val);
        if (el.textContent !== str) {
          el.textContent = str;
          el.closest('.timer-block, .countdown-block')?.classList.add('flip');
          setTimeout(() =>
            el.closest('.timer-block, .countdown-block')?.classList.remove('flip')
          , 400);
        }
      });

      /* reset at zero */
      if (rem <= 0) {
        end = Date.now() + 24 * 3600 * 1000;
        try { localStorage.setItem(KEY, String(end)); } catch {}
      }
    }

    tick();
    setInterval(tick, 250); /* check 4× per second for smoothness */
  }

  /* ── PARALLAX HERO ORBS ON MOUSE MOVE ─────────────────────── */
  function initParallax() {
    const hero = document.querySelector('.hero');
    if (!hero || window.innerWidth < 768) return;

    const orbs   = hero.querySelectorAll('.hero-orb, .orb, .shape');
    let rafId    = null;

    hero.addEventListener('mousemove', e => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        const r  = hero.getBoundingClientRect();
        const cx = ((e.clientX - r.left) / r.width  - .5) * 2;
        const cy = ((e.clientY - r.top)  / r.height - .5) * 2;
        orbs.forEach((orb, i) => {
          const speed = (i + 1) * 14;
          orb.style.transform = `translate(${cx * speed}px, ${cy * speed}px)`;
        });
        rafId = null;
      });
    });

    hero.addEventListener('mouseleave', () => {
      orbs.forEach(orb => {
        orb.style.transition = 'transform .8s ease';
        orb.style.transform  = '';
        setTimeout(() => orb.style.transition = '', 820);
      });
    });
  }

  /* ── FAQ ACCORDION ────────────────────────────────────────── */
  function initAccordion() {
    document.querySelectorAll('.faq-item, [data-accordion-item]').forEach(item => {
      const trigger = item.querySelector('.faq-question, [data-accordion-trigger], h3, h4');
      const content = item.querySelector('.faq-answer, [data-accordion-content]');
      if (!trigger || !content) return;

      trigger.style.cursor = 'pointer';
      trigger.setAttribute('role', 'button');
      trigger.setAttribute('aria-expanded', 'false');

      content.style.cssText = 'max-height:0;overflow:hidden;transition:max-height .35s ease,opacity .3s ease;opacity:0;';

      trigger.addEventListener('click', () => {
        const open = item.classList.contains('open');

        /* close all siblings */
        item.closest('.faq-list, [data-accordion]')
          ?.querySelectorAll('.faq-item.open, [data-accordion-item].open')
          .forEach(other => {
            if (other !== item) {
              other.classList.remove('open');
              const c = other.querySelector('.faq-answer, [data-accordion-content]');
              const t = other.querySelector('.faq-question, [data-accordion-trigger], h3, h4');
              if (c) { c.style.maxHeight='0'; c.style.opacity='0'; }
              t?.setAttribute('aria-expanded','false');
            }
          });

        item.classList.toggle('open', !open);
        trigger.setAttribute('aria-expanded', String(!open));
        content.style.maxHeight = open ? '0' : content.scrollHeight + 'px';
        content.style.opacity   = open ? '0' : '1';
      });
    });
  }

  /* ── SOCIAL PROOF NOTIFICATION POPUPS ─────────────────────── */
  function initSocialProof() {
    const BUYERS = [
      { name:'Sarah K.',  loc:'New York',     prod:'Vitamin C Serum',      avatar:'SK', time:'2m ago' },
      { name:'Ahmed R.',  loc:'Dubai',        prod:'Mechanical Keyboard',  avatar:'AR', time:'5m ago' },
      { name:'Priya M.',  loc:'London',       prod:'Non-Slip Yoga Mat',    avatar:'PM', time:'8m ago' },
      { name:'Carlos L.', loc:'São Paulo',    prod:'Air Fryer XL',         avatar:'CL', time:'11m ago'},
      { name:'Fatima Z.', loc:'Karachi',      prod:'Korean Skincare Set',  avatar:'FZ', time:'14m ago'},
      { name:'James W.',  loc:'Sydney',       prod:'ANC Earbuds Pro',      avatar:'JW', time:'17m ago'},
      { name:'Mei L.',    loc:'Singapore',    prod:'AMOLED Smart Watch',   avatar:'ML', time:'21m ago'},
      { name:'Hassan A.', loc:'Cairo',        prod:'RGB Gaming Mouse',     avatar:'HA', time:'24m ago'},
      { name:'Liu W.',    loc:'Shanghai',     prod:'Hooded Fleece Jacket', avatar:'LW', time:'27m ago'},
      { name:'Amira N.',  loc:'Paris',        prod:'Glass Skin Routine',   avatar:'AN', time:'30m ago'},
    ];

    if (!document.getElementById('shoplux-sp-styles')) {
      const s = document.createElement('style');
      s.id = 'shoplux-sp-styles';
      s.textContent = `
        .sp-popup {
          position:fixed;bottom:28px;left:24px;z-index:9998;
          display:flex;align-items:center;gap:12px;
          padding:12px 16px;border-radius:16px;
          background:var(--card-bg,#fff);
          box-shadow:0 8px 40px rgba(0,0,0,.18),0 2px 8px rgba(0,0,0,.08);
          border:1px solid var(--border,#e5e7eb);
          animation:spIn .4s cubic-bezier(.34,1.56,.64,1) forwards;
          max-width:300px;cursor:default;
        }
        @keyframes spIn  { from{opacity:0;transform:translateX(-120px)} to{opacity:1;transform:none} }
        @keyframes spOut { from{opacity:1;transform:none} to{opacity:0;transform:translateX(-80px)} }
        [data-theme="dark"] .sp-popup {
          background:#1a1a2e;border-color:#2d2d44;
        }
        .sp-popup.out { animation:spOut .35s ease forwards; }
        .sp-av {
          width:40px;height:40px;border-radius:50%;flex-shrink:0;
          background:linear-gradient(135deg,#c026d3,#7c3aed);
          color:#fff;font-weight:700;font-size:.85rem;
          display:flex;align-items:center;justify-content:center;
          position:relative;
        }
        .sp-av::after {
          content:'';position:absolute;bottom:1px;right:1px;
          width:10px;height:10px;border-radius:50%;
          background:#10b981;border:2px solid var(--card-bg,#fff);
        }
        .sp-body { flex:1;min-width:0; }
        .sp-body p { margin:0;line-height:1.4; }
        .sp-name { font-size:.82rem;font-weight:700;color:var(--text-primary,#111); }
        .sp-prod { font-size:.78rem;color:var(--text-secondary,#555); }
        .sp-time { font-size:.72rem;color:var(--text-tertiary,#999);white-space:nowrap;flex-shrink:0; }
        @media(max-width:480px){ .sp-popup{left:12px;right:12px;max-width:none;bottom:16px;} }
      `;
      document.head.appendChild(s);
    }

    let idx = 0, popup = null;

    function showNext() {
      const b = BUYERS[idx % BUYERS.length]; idx++;

      if (popup) {
        popup.classList.add('out');
        setTimeout(() => popup?.remove(), 360);
      }

      popup = document.createElement('div');
      popup.className = 'sp-popup';
      popup.setAttribute('aria-live', 'polite');
      popup.innerHTML = `
        <div class="sp-av">${b.avatar}</div>
        <div class="sp-body">
          <p class="sp-name">${b.name} from ${b.loc}</p>
          <p class="sp-prod">Just bought <strong>${b.prod}</strong></p>
        </div>
        <span class="sp-time">${b.time}</span>
      `;

      document.body.appendChild(popup);

      const hide = setTimeout(() => {
        popup?.classList.add('out');
        setTimeout(() => popup?.remove(), 360);
      }, 4200);

      popup.addEventListener('click', () => { clearTimeout(hide); popup?.remove(); });
    }

    /* start after 7s, then every 9s */
    setTimeout(() => { showNext(); setInterval(showNext, 9000); }, 7000);
  }

  /* ── INIT ─────────────────────────────────────────────────── */
  function init() {
    initReveal();
    initCounters();
    initCountdown();
    initParallax();
    initAccordion();
    initSocialProof();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
