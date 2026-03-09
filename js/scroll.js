/* =============================================
   SCROLL.JS — SCROLL PROGRESS, BACK-TO-TOP, REVEAL
   ============================================= */

(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {

    const progressBar = document.getElementById('scrollProgress');
    const backToTop   = document.getElementById('backToTop');

    // ── SCROLL HANDLER ──
    function onScroll() {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;

      // Progress bar
      if (progressBar) {
        progressBar.style.width = (scrollTop / docHeight * 100) + '%';
      }

      // Back to top
      if (backToTop) {
        backToTop.classList.toggle('visible', scrollTop > 400);
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });

    // Back to top click
    if (backToTop) {
      backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    // ── SCROLL REVEAL ──
    const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

    if ('IntersectionObserver' in window && revealEls.length) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

      revealEls.forEach(el => observer.observe(el));
    } else {
      revealEls.forEach(el => el.classList.add('revealed'));
    }

    // ── COUNTER ANIMATION ──
    const counters = document.querySelectorAll('[data-count]');

    if ('IntersectionObserver' in window && counters.length) {
      const cObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const el     = entry.target;
          const target = +el.getAttribute('data-count');
          const duration = 1800;
          const start  = performance.now();

          function tick(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3); // cubic ease-out
            el.textContent = Math.floor(ease * target).toLocaleString();
            if (progress < 1) requestAnimationFrame(tick);
            else el.textContent = target.toLocaleString();
          }

          requestAnimationFrame(tick);
          cObs.unobserve(el);
        });
      }, { threshold: 0.5 });

      counters.forEach(el => cObs.observe(el));
    }

    // ── COUNTDOWN TIMER ──
    const hoursEl = document.getElementById('timer-hours');
    const minsEl  = document.getElementById('timer-mins');
    const secsEl  = document.getElementById('timer-secs');

    if (hoursEl && minsEl && secsEl) {
      // Get end time from storage or set 24h from now
      let endTime = +localStorage.getItem('mm-deal-end');
      if (!endTime || endTime < Date.now()) {
        endTime = Date.now() + 24 * 60 * 60 * 1000;
        localStorage.setItem('mm-deal-end', endTime);
      }

      function updateTimer() {
        const diff = Math.max(0, endTime - Date.now());
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);

        hoursEl.textContent = String(h).padStart(2, '0');
        minsEl.textContent  = String(m).padStart(2, '0');
        secsEl.textContent  = String(s).padStart(2, '0');

        if (diff === 0) {
          endTime = Date.now() + 24 * 60 * 60 * 1000;
          localStorage.setItem('mm-deal-end', endTime);
        }
      }

      updateTimer();
      setInterval(updateTimer, 1000);
    }

    // ── PARALLAX HERO (desktop only) ──
    if (window.innerWidth > 768) {
      const blobs = document.querySelectorAll('.hero-blob');
      window.addEventListener('mousemove', e => {
        const cx = (e.clientX / window.innerWidth  - 0.5) * 2;
        const cy = (e.clientY / window.innerHeight - 0.5) * 2;
        blobs.forEach((b, i) => {
          const speed = (i + 1) * 12;
          b.style.transform = `translate(${cx * speed}px, ${cy * speed}px)`;
        });
      }, { passive: true });
    }

  });

})();
