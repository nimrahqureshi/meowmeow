/* ============================================================
   SCROLL.JS — SCROLL EFFECTS, BACK TO TOP, REVEAL
   ============================================================ */

(function() {
  'use strict';

  // ===== SCROLL PROGRESS BAR =====
  const progressBar = document.getElementById('scrollProgress');

  function updateProgress() {
    if (!progressBar) return;
    const scrollTop    = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const percent = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    progressBar.style.width = Math.min(percent, 100) + '%';
  }

  // ===== BACK TO TOP =====
  const backToTop = document.getElementById('backToTop');

  function handleBackToTop() {
    if (!backToTop) return;
    if (window.pageYOffset > 350) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  }

  backToTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ===== SCROLL REVEAL =====
  function initReveal() {
    const elements = document.querySelectorAll(
      '.product-card, .category-card, .blog-card, .review-card, .feature-card, .help-card, .team-member, .faq-item, .contact-item, .info-section, .reveal'
    );

    if (!('IntersectionObserver' in window)) {
      elements.forEach(el => { el.style.opacity = '1'; el.style.transform = 'none'; });
      return;
    }

    const observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry, i) {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = el.dataset.delay || (i % 5) * 80;
          setTimeout(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
            el.classList.add('revealed');
          }, delay);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    elements.forEach(function(el, i) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(28px)';
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.observe(el);
    });
  }

  // ===== COUNTER ANIMATION =====
  function initCounters() {
    const counters = document.querySelectorAll('.stat-number[data-count]');
    if (!counters.length) return;

    const observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (!entry.isIntersecting) return;
        const el     = entry.target;
        const target = parseInt(el.getAttribute('data-count'), 10);
        const suffix = el.dataset.suffix || '';
        let current  = 0;
        const step   = target / 70;

        const tick = () => {
          current = Math.min(current + step, target);
          el.textContent = Math.round(current).toLocaleString() + suffix;
          if (current < target) requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
        observer.unobserve(el);
      });
    }, { threshold: 0.5 });

    counters.forEach(el => observer.observe(el));
  }

  // ===== COUNTDOWN TIMER =====
  function initCountdown() {
    const hoursEl = document.getElementById('timer-hours');
    const minsEl  = document.getElementById('timer-mins');
    const secsEl  = document.getElementById('timer-secs');

    if (!hoursEl || !minsEl || !secsEl) return;

    // Parse stored end time or set new one
    let endTime = parseInt(sessionStorage.getItem('dealEnd') || '0', 10);
    const now   = Date.now();
    if (!endTime || endTime < now) {
      endTime = now + 23 * 3600 * 1000 + 59 * 60 * 1000 + 59 * 1000;
      sessionStorage.setItem('dealEnd', endTime.toString());
    }

    function update() {
      const diff = Math.max(0, endTime - Date.now());
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);

      hoursEl.textContent = String(h).padStart(2, '0');
      minsEl.textContent  = String(m).padStart(2, '0');
      secsEl.textContent  = String(s).padStart(2, '0');

      if (diff === 0) {
        sessionStorage.removeItem('dealEnd');
        endTime = Date.now() + 24 * 3600 * 1000;
        sessionStorage.setItem('dealEnd', endTime.toString());
      }
    }

    update();
    setInterval(update, 1000);
  }

  // ===== PARALLAX SHAPES =====
  function initParallax() {
    const hero = document.querySelector('.hero');
    if (!hero || window.innerWidth < 768) return;

    window.addEventListener('mousemove', function(e) {
      if (window.innerWidth < 768) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;

      document.querySelectorAll('.shape').forEach((shape, i) => {
        const speed = (i + 1) * 4;
        shape.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
      });
    });
  }

  // ===== LAZY IMAGES =====
  function initLazyImages() {
    if (!('IntersectionObserver' in window)) return;

    const imgs = document.querySelectorAll('img[data-src]');
    const observer = new IntersectionObserver(function(entries) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          observer.unobserve(img);
        }
      });
    });

    imgs.forEach(img => observer.observe(img));
  }

  // ===== STICKY SECTION HEADERS =====
  function initStickyFilter() {
    const filterBar = document.querySelector('.filter-bar.sticky');
    if (!filterBar) return;
    const top = filterBar.getBoundingClientRect().top + window.pageYOffset;

    window.addEventListener('scroll', function() {
      if (window.pageYOffset > top - 80) {
        filterBar.classList.add('stuck');
      } else {
        filterBar.classList.remove('stuck');
      }
    }, { passive: true });
  }

  // ===== THROTTLE =====
  function throttle(fn, limit) {
    let inThrottle;
    return function() {
      if (!inThrottle) {
        fn.apply(this, arguments);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // ===== SCROLL LISTENER =====
  window.addEventListener('scroll', throttle(function() {
    updateProgress();
    handleBackToTop();
  }, 16), { passive: true });

  // ===== INIT =====
  document.addEventListener('DOMContentLoaded', function() {
    updateProgress();
    handleBackToTop();
    initReveal();
    initCounters();
    initCountdown();
    initParallax();
    initLazyImages();
    initStickyFilter();
  });

})();
