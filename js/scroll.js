/* ============================
   SCROLL.JS
   ============================ */

(function() {
  'use strict';

  // ===== SCROLL PROGRESS BAR =====
  function updateScrollProgress() {
    const bar = document.getElementById('scrollProgress');
    if (!bar) return;
    const scrollTop = window.pageYOffset;
    const docH = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    bar.style.width = docH > 0 ? (scrollTop / docH * 100) + '%' : '0%';
  }

  // ===== BACK TO TOP =====
  const backToTop = document.getElementById('backToTop');

  function updateBackToTop() {
    backToTop?.classList.toggle('visible', window.pageYOffset > 400);
  }

  backToTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ===== SCROLL REVEAL =====
  function initScrollReveal() {
    const els = document.querySelectorAll(
      '.product-card, .category-card, .review-card, .blog-card, .trending-card, .feature-card, .team-card, .contact-item, .faq-item, .promo-card'
    );

    if (!('IntersectionObserver' in window)) {
      els.forEach(el => { el.style.opacity = '1'; el.style.transform = 'none'; });
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

    els.forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(28px)';
      el.style.transition = `opacity 0.55s ease ${(i % 5) * 0.07}s, transform 0.55s ease ${(i % 5) * 0.07}s`;
      observer.observe(el);

      // Handle already revealed
      el.addEventListener('transitionend', () => {
        if (el.classList.contains('revealed')) {
          el.style.opacity = '';
          el.style.transform = '';
          el.style.transition = '';
        }
      }, { once: true });
    });
  }

  // ===== COUNTER ANIMATION =====
  function initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        const decimals = el.dataset.decimals || 0;
        let current = 0;
        const steps = 60;
        const increment = target / steps;
        const interval = 2000 / steps;

        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          el.textContent = parseFloat(current.toFixed(decimals)).toLocaleString() + suffix;
        }, interval);

        observer.unobserve(el);
      });
    }, { threshold: 0.5 });

    counters.forEach(c => observer.observe(c));
  }

  // ===== COUNTDOWN TIMER =====
  function initCountdownTimer() {
    const h = document.getElementById('hours');
    const m = document.getElementById('minutes');
    const s = document.getElementById('seconds');
    if (!h || !m || !s) return;

    // Get or set end time
    let endTime = parseInt(sessionStorage.getItem('mm-countdown'));
    if (!endTime || endTime < Date.now()) {
      endTime = Date.now() + (8 * 3600 + 45 * 60 + 33) * 1000;
      sessionStorage.setItem('mm-countdown', endTime);
    }

    function update() {
      const diff = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
      if (diff === 0) {
        endTime = Date.now() + 24 * 3600 * 1000;
        sessionStorage.setItem('mm-countdown', endTime);
      }
      const hh = Math.floor(diff / 3600);
      const mm = Math.floor((diff % 3600) / 60);
      const ss = diff % 60;
      h.textContent = String(hh).padStart(2, '0');
      m.textContent = String(mm).padStart(2, '0');
      s.textContent = String(ss).padStart(2, '0');
    }

    update();
    setInterval(update, 1000);
  }

  // ===== FLASH SALE TIMER =====
  function initFlashTimers() {
    const timers = document.querySelectorAll('[data-flash-timer]');
    timers.forEach(timerEl => {
      let seconds = parseInt(timerEl.dataset.flashTimer) || 14400;
      const hEl = timerEl.querySelector('.t-h');
      const mEl = timerEl.querySelector('.t-m');
      const sEl = timerEl.querySelector('.t-s');
      if (!hEl || !mEl || !sEl) return;

      setInterval(() => {
        seconds = Math.max(0, seconds - 1);
        hEl.textContent = String(Math.floor(seconds / 3600)).padStart(2, '0');
        mEl.textContent = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
        sEl.textContent = String(seconds % 60).padStart(2, '0');
      }, 1000);
    });
  }

  // ===== ACTIVE NAV LINK ON SCROLL =====
  function updateActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const links = document.querySelectorAll('.nav-link[href^="#"]');
    const pos = window.pageYOffset + 100;

    sections.forEach(sec => {
      if (pos >= sec.offsetTop && pos < sec.offsetTop + sec.offsetHeight) {
        links.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === '#' + sec.id);
        });
      }
    });
  }

  // ===== THROTTLE =====
  function throttle(fn, limit) {
    let lastTime = 0;
    return function(...args) {
      const now = Date.now();
      if (now - lastTime >= limit) {
        lastTime = now;
        fn.apply(this, args);
      }
    };
  }

  // ===== SCROLL LISTENER =====
  window.addEventListener('scroll', throttle(() => {
    updateScrollProgress();
    updateBackToTop();
    updateActiveNav();
  }, 16), { passive: true });

  // ===== INIT =====
  document.addEventListener('DOMContentLoaded', () => {
    initScrollReveal();
    initCounters();
    initCountdownTimer();
    initFlashTimers();
    updateScrollProgress();
    updateBackToTop();
  });

})();
