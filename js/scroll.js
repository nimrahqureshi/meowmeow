/* =============================================
   SCROLL.JS — SCROLL EFFECTS & ANIMATIONS
   ============================================= */
'use strict';

(function() {
  /* ── SCROLL PROGRESS ── */
  const progressBar = document.getElementById('scrollProgress');

  function updateProgress() {
    if (!progressBar) return;
    const scrollTop  = window.scrollY || window.pageYOffset;
    const docHeight  = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const progress   = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = Math.min(progress, 100) + '%';
  }

  /* ── BACK TO TOP ── */
  const backToTop = document.getElementById('backToTop');

  function handleBackToTop() {
    if (!backToTop) return;
    backToTop.classList.toggle('visible', window.scrollY > 400);
  }

  backToTop && backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ── SCROLL REVEAL ── */
  function initReveal() {
    const revealEls = document.querySelectorAll('.reveal, .product-card, .category-card, .blog-card, .review-card, .feature-card');

    if (!('IntersectionObserver' in window)) {
      revealEls.forEach(el => { el.style.opacity = '1'; el.style.transform = 'none'; });
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible', 'revealed');
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach((el, i) => {
      if (!el.classList.contains('revealed')) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(28px)';
        el.style.transition = `opacity 0.55s ease ${(i % 5) * 0.08}s, transform 0.55s ease ${(i % 5) * 0.08}s`;
        observer.observe(el);
      }
    });
  }

  /* ── COUNTER ANIMATION ── */
  function initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        const prefix = el.dataset.prefix || '';
        const duration = 1800;
        const steps = 60;
        const stepVal = target / steps;
        let current = 0;
        let frame = 0;

        const update = () => {
          current = Math.min(current + stepVal, target);
          frame++;
          const display = Number.isInteger(target) ? Math.floor(current) : current.toFixed(1);
          el.textContent = prefix + display.toLocaleString() + suffix;
          if (current < target) requestAnimationFrame(update);
        };

        requestAnimationFrame(update);
        observer.unobserve(el);
      });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
  }

  /* ── COUNTDOWN TIMER ── */
  function initTimer() {
    const h = document.getElementById('hours');
    const m = document.getElementById('minutes');
    const s = document.getElementById('seconds');
    if (!h || !m || !s) return;

    // Restore or set new end time (8 hours from now)
    let endTime = parseInt(sessionStorage.getItem('dealTimerEnd') || '0');
    if (!endTime || endTime < Date.now()) {
      endTime = Date.now() + 8 * 3600 * 1000 + 45 * 60 * 1000;
      sessionStorage.setItem('dealTimerEnd', endTime);
    }

    function pad(n) { return String(n).padStart(2, '0'); }

    function tick() {
      const diff = Math.max(0, endTime - Date.now());
      const totalSec = Math.floor(diff / 1000);
      const hh = Math.floor(totalSec / 3600);
      const mm = Math.floor((totalSec % 3600) / 60);
      const ss = totalSec % 60;

      h.textContent = pad(hh);
      m.textContent = pad(mm);
      s.textContent = pad(ss);

      if (diff <= 0) {
        // Reset timer
        endTime = Date.now() + 24 * 3600 * 1000;
        sessionStorage.setItem('dealTimerEnd', endTime);
      }
    }

    tick();
    setInterval(tick, 1000);
  }

  /* ── PARALLAX HERO ── */
  function initParallax() {
    const hero = document.querySelector('.hero');
    if (!hero || window.innerWidth < 768) return;

    window.addEventListener('mousemove', (e) => {
      const blobs = document.querySelectorAll('.hero-blob');
      const mx = (e.clientX / window.innerWidth - 0.5) * 2;
      const my = (e.clientY / window.innerHeight - 0.5) * 2;

      blobs.forEach((blob, i) => {
        const speed = (i + 1) * 8;
        blob.style.transform = `translate(${mx * speed}px, ${my * speed}px)`;
      });
    }, { passive: true });
  }

  /* ── STICKY CART SUMMARY ── */
  function initStickyCartSummary() {
    const summary = document.querySelector('.cart-summary');
    if (!summary) return;
    // Already handled with position: sticky in CSS
  }

  /* ── LAZY IMAGES ── */
  function initLazyImages() {
    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        img.classList.add('loaded');
        observer.unobserve(img);
      });
    });

    document.querySelectorAll('img[data-src]').forEach(img => observer.observe(img));
  }

  /* ── SMOOTH IMAGE REVEAL ── */
  function initImageReveal() {
    document.querySelectorAll('img:not([data-src])').forEach(img => {
      img.style.transition = 'opacity 0.4s ease';
      if (!img.complete) {
        img.style.opacity = '0';
        img.addEventListener('load', () => img.style.opacity = '1');
        img.addEventListener('error', () => { img.style.opacity = '1'; });
      }
    });
  }

  /* ── THROTTLE ── */
  function throttle(fn, ms) {
    let last = 0;
    return function(...args) {
      const now = Date.now();
      if (now - last >= ms) { last = now; fn.apply(this, args); }
    };
  }

  /* ── SCROLL LISTENER ── */
  window.addEventListener('scroll', throttle(() => {
    updateProgress();
    handleBackToTop();
  }, 16), { passive: true });

  /* ── INIT ── */
  document.addEventListener('DOMContentLoaded', () => {
    initReveal();
    initCounters();
    initTimer();
    initParallax();
    initLazyImages();
    initImageReveal();
  });
})();
