/* ============================
   SCROLL.JS — SCROLL REVEAL + TIMER + FORMS
   Load after main.js
   ============================ */

(function () {
  'use strict';

  /* ─────────────────────────────
     SCROLL REVEAL
  ───────────────────────────── */
  function initScrollReveal() {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.reveal').forEach(function (el) {
        el.classList.add('revealed');
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ─────────────────────────────
     ANIMATED STAT COUNTERS
     Works with data-target attribute OR reads existing number
  ───────────────────────────── */
  function initCounters() {
    if (!('IntersectionObserver' in window)) return;

    var ran = new WeakSet();

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting || ran.has(entry.target)) return;
        ran.add(entry.target);
        observer.unobserve(entry.target);

        var el = entry.target;
        var raw = el.dataset.target || el.textContent.replace(/[^0-9.]/g, '');
        var target = parseFloat(raw) || 0;
        var suffix = el.dataset.suffix || '';

        /* Try to infer suffix from existing text if not set in data-suffix */
        if (!suffix) {
          var existing = el.textContent.trim();
          suffix = existing.replace(/[0-9,.\s]/g, '') || '';
        }

        var duration = 1800;
        var start = performance.now();

        function tick(now) {
          var elapsed = now - start;
          var progress = Math.min(elapsed / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          var current = Math.floor(eased * target);
          el.textContent = current.toLocaleString() + suffix;
          if (progress < 1) {
            requestAnimationFrame(tick);
          } else {
            el.textContent = target.toLocaleString() + suffix;
          }
        }

        requestAnimationFrame(tick);
      });
    }, { threshold: 0.3 });

    document.querySelectorAll('.stat-number, [data-counter]').forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ─────────────────────────────
     COUNTDOWN TIMER
     Looks for .timer-number[data-unit] or #timerHours/#timerMins/#timerSecs
     Resets to 24h if expired (daily deals pattern)
  ───────────────────────────── */
  function initCountdownTimer() {
    var hoursEl = document.getElementById('timerHours')   || document.querySelector('.timer-number[data-unit="hours"]');
    var minsEl  = document.getElementById('timerMins')    || document.querySelector('.timer-number[data-unit="mins"]');
    var secsEl  = document.getElementById('timerSecs')    || document.querySelector('.timer-number[data-unit="secs"]');

    if (!hoursEl || !minsEl || !secsEl) return;

    var STORAGE_KEY = 'meowmeow-timer-end';
    var DURATION    = 24 * 60 * 60 * 1000; // 24 hours in ms

    function getEndTime() {
      try {
        var saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          var t = parseInt(saved, 10);
          if (t > Date.now()) return t;
        }
      } catch (e) {}
      var end = Date.now() + DURATION;
      try { localStorage.setItem(STORAGE_KEY, String(end)); } catch (e) {}
      return end;
    }

    var endTime = getEndTime();

    function pad(n) { return n < 10 ? '0' + n : String(n); }

    function tick() {
      var diff = Math.max(0, endTime - Date.now());
      var h = Math.floor(diff / 3600000);
      var m = Math.floor((diff % 3600000) / 60000);
      var s = Math.floor((diff % 60000) / 1000);

      hoursEl.textContent = pad(h);
      minsEl.textContent  = pad(m);
      secsEl.textContent  = pad(s);

      if (diff <= 0) {
        /* Reset timer */
        endTime = Date.now() + DURATION;
        try { localStorage.setItem(STORAGE_KEY, String(endTime)); } catch (e) {}
      }
    }

    tick();
    setInterval(tick, 1000);
  }

  /* ─────────────────────────────
     NEWSLETTER FORMS
     Handles both #newsletterForm and .footer-newsletter form
  ───────────────────────────── */
  function initNewsletterForms() {
    function handleSubmit(form) {
      if (form._meowNewsletterBound) return;
      form._meowNewsletterBound = true;

      form.addEventListener('submit', function (e) {
        e.preventDefault();

        var input = form.querySelector('input[type="email"], input[type="text"]');
        var email = input ? input.value.trim() : '';

        if (!email) {
          if (typeof window.showToast === 'function') {
            window.showToast('Please enter your email address.', 'warning');
          }
          return;
        }

        /* Simulate submit */
        var btn = form.querySelector('button[type="submit"], button');
        if (btn) {
          btn.disabled = true;
          btn.classList.add('loading');
        }

        setTimeout(function () {
          if (typeof window.showToast === 'function') {
            window.showToast('🎉 Subscribed! Check your inbox.', 'success');
          }
          var msg = form.querySelector('#newsletterMsg, .newsletter-msg');
          if (msg) msg.textContent = '✅ Thank you! You\'re subscribed.';
          form.reset();
          if (btn) {
            btn.disabled = false;
            btn.classList.remove('loading');
          }
        }, 600);
      });
    }

    document.querySelectorAll(
      '#newsletterForm, .newsletter-form, .footer-newsletter form'
    ).forEach(handleSubmit);
  }

  /* ─────────────────────────────
     CONTACT FORM
  ───────────────────────────── */
  function initContactForm() {
    var form = document.getElementById('contactForm');
    if (!form || form._meowContactBound) return;
    form._meowContactBound = true;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var btn = form.querySelector('button[type="submit"], .btn');
      if (btn) { btn.disabled = true; btn.classList.add('loading'); }

      setTimeout(function () {
        if (typeof window.showToast === 'function') {
          window.showToast('📬 Message sent! We\'ll reply within 24h.', 'success');
        }
        form.reset();
        if (btn) { btn.disabled = false; btn.classList.remove('loading'); }
      }, 700);
    });
  }

  /* ─────────────────────────────
     LAZY IMAGE LOADING
  ───────────────────────────── */
  function initLazyImages() {
    if (!('IntersectionObserver' in window)) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          img.classList.add('loaded');
        }
        observer.unobserve(img);
      });
    }, { rootMargin: '300px 0px' });

    document.querySelectorAll('img[data-src]').forEach(function (img) {
      observer.observe(img);
    });
  }

  /* ─────────────────────────────
     SMOOTH IMAGE FADE-IN ON LOAD
  ───────────────────────────── */
  function initImageFade() {
    document.querySelectorAll('img:not([data-src])').forEach(function (img) {
      if (img.complete) return;
      img.style.opacity = '0';
      img.style.transition = 'opacity 0.4s ease';
      img.addEventListener('load', function () { img.style.opacity = '1'; });
      img.addEventListener('error', function () { img.style.opacity = '0.4'; });
    });
  }

  /* ─────────────────────────────
     WISHLIST TOGGLE (static cards)
     Dynamic cards handled by render-*.js
  ───────────────────────────── */
  function initWishlistToggles() {
    document.querySelectorAll('.wishlist-toggle:not([data-wl-init])').forEach(function (btn) {
      btn.setAttribute('data-wl-init', '1');
      if (btn._meowBound) return;
      btn._meowBound = true;

      /* Load state */
      var card = btn.closest('.product-card');
      var id   = card ? (card.dataset.productId || card.dataset.id) : null;
      if (id) {
        try {
          var wl = JSON.parse(localStorage.getItem('meowmeow-wishlist') || '[]');
          if (wl.indexOf(id) !== -1) {
            btn.classList.add('active');
            var icon = btn.querySelector('i');
            if (icon) { icon.classList.remove('far'); icon.classList.add('fas'); }
          }
        } catch (e) {}
      }

      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();

        this.classList.toggle('active');
        var icon2 = this.querySelector('i');

        if (this.classList.contains('active')) {
          if (icon2) { icon2.classList.remove('far'); icon2.classList.add('fas'); }
          if (typeof window.showToast === 'function') window.showToast('Added to wishlist ❤️', 'success');
          if (id) saveWishlistId(id, true);
        } else {
          if (icon2) { icon2.classList.remove('fas'); icon2.classList.add('far'); }
          if (typeof window.showToast === 'function') window.showToast('Removed from wishlist', 'warning');
          if (id) saveWishlistId(id, false);
        }
      });
    });
  }

  function saveWishlistId(id, add) {
    try {
      var wl = JSON.parse(localStorage.getItem('meowmeow-wishlist') || '[]');
      var idx = wl.indexOf(id);
      if (add && idx === -1) wl.push(id);
      if (!add && idx !== -1) wl.splice(idx, 1);
      localStorage.setItem('meowmeow-wishlist', JSON.stringify(wl));
    } catch (e) {}
  }

  /* ─────────────────────────────
     BACK TO TOP BUTTON
  ───────────────────────────── */
  function initBackToTop() {
    var btn = document.getElementById('backToTop');
    if (!btn) return;

    window.addEventListener('scroll', function () {
      btn.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ─────────────────────────────
     INIT
  ───────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    initScrollReveal();
    initCounters();
    initCountdownTimer();
    initNewsletterForms();
    initContactForm();
    initLazyImages();
    initImageFade();
    initWishlistToggles();
    initBackToTop();

    /* Re-bind wishlist when dynamic cards are added */
    if ('MutationObserver' in window) {
      var mo = new MutationObserver(function () { initWishlistToggles(); });
      mo.observe(document.body, { childList: true, subtree: true });
    }
  });

})();
