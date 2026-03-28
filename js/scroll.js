/* ============================
   SCROLL.JS — ANIMATIONS & PAGE INTERACTIONS  v2.0
   Reveal · Stat counters · Countdown timer
   Newsletter · Contact form · Filter buttons · Blog tilt
   ============================ */

(function () {
  'use strict';

  /* ── 1. SCROLL REVEAL ── */
  (function () {
    var els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) { els.forEach(function (el) { el.classList.add('revealed'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('revealed'); io.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (el) { io.observe(el); });
  })();

  /* ── 2. STAT COUNTER ANIMATION ── */
  (function () {
    var counters = document.querySelectorAll('.stat-number[data-count]');
    if (!counters.length) return;

    function animate(el) {
      if (el.dataset.animated) return;
      el.dataset.animated = '1';
      var target  = parseInt(el.getAttribute('data-count'), 10) || 0;
      var suffix  = el.getAttribute('data-suffix') || '';
      var step    = target / (1800 / 16);
      var current = 0;
      el.textContent = '0' + suffix;
      var timer = setInterval(function () {
        current += step;
        if (current >= target) {
          el.textContent = target.toLocaleString() + suffix;
          clearInterval(timer);
        } else {
          el.textContent = Math.floor(current).toLocaleString() + suffix;
        }
      }, 16);
    }

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { animate(entry.target); io.unobserve(entry.target); }
        });
      }, { threshold: 0.3 });
      counters.forEach(function (c) { io.observe(c); });
    } else {
      counters.forEach(animate);
    }
  })();

  /* ── 3. COUNTDOWN TIMER (24h deal timer) ── */
  (function () {
    var h = document.getElementById('hours')   || document.getElementById('timer-hours');
    var m = document.getElementById('minutes') || document.getElementById('timer-mins');
    var s = document.getElementById('seconds') || document.getElementById('timer-secs');
    if (!h || !m || !s) return;

    var KEY = 'mm-deal-timer-end';
    var end;
    try { end = parseInt(sessionStorage.getItem(KEY), 10); } catch (e) {}
    if (!end || Date.now() >= end) {
      end = Date.now() + 24 * 3600 * 1000;
      try { sessionStorage.setItem(KEY, end); } catch (e) {}
    }

    function tick() {
      var diff = Math.max(0, Math.floor((end - Date.now()) / 1000));
      h.textContent = String(Math.floor(diff / 3600)).padStart(2, '0');
      m.textContent = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
      s.textContent = String(diff % 60).padStart(2, '0');
      if (diff <= 0) {
        end = Date.now() + 24 * 3600 * 1000;
        try { sessionStorage.setItem(KEY, end); } catch (e) {}
      }
    }
    tick();
    setInterval(tick, 1000);
  })();

  /* ── 4. NEWSLETTER FORMS ── */
  (function () {
    document.querySelectorAll('.newsletter-form, .footer-newsletter form, #newsletter-form').forEach(function (form) {
      if (form._meowNewsletterBound) return;
      form._meowNewsletterBound = true;
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var inp  = form.querySelector('input[type="email"]');
        var note = form.querySelector('.form-note, #newsletter-msg, small');
        if (!inp || !inp.value.trim()) return;
        inp.value = '';
        if (note) note.innerHTML = '<i class="fas fa-check-circle" style="color:#22c55e"></i> Thank you! You\'re subscribed.';
        if (window.showToast) window.showToast('🎉 Subscribed! Welcome aboard.', 'success');
      });
    });
  })();

  /* ── 5. CONTACT FORM ── */
  (function () {
    var form = document.getElementById('contactForm');
    if (!form || form._meowContactBound) return;
    form._meowContactBound = true;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      if (btn) {
        btn.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
        btn.style.background = 'var(--success,#10b981)';
        setTimeout(function () { btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message'; btn.style.background = ''; form.reset(); }, 3000);
      }
      if (window.showToast) window.showToast('📬 Message sent! We\'ll reply within 24h.', 'success');
    });
  })();

  /* ── 6. FILTER BUTTONS ── */
  (function () {
    var btns = document.querySelectorAll('.filter-btn[data-filter]');
    btns.forEach(function (btn) {
      if (btn._scrollFilterBound) return;
      btn._scrollFilterBound = true;
      btn.addEventListener('click', function () {
        btns.forEach(function (b) { b.classList.remove('active'); });
        this.classList.add('active');
        var cat   = this.dataset.filter || 'all';
        var cards = document.querySelectorAll('.product-card[data-category]');
        var shown = 0;
        cards.forEach(function (card, i) {
          var match = (cat === 'all') || (card.dataset.category === cat);
          card.style.display = match ? '' : 'none';
          if (match) { card.style.animationDelay = (shown % 12 * 0.04) + 's'; card.classList.remove('card-enter'); void card.offsetWidth; card.classList.add('card-enter'); shown++; }
        });
        var noRes = document.getElementById('noResults');
        if (noRes) noRes.style.display = shown === 0 ? 'block' : 'none';
        try {
          var url = new URL(window.location.href);
          if (cat === 'all') url.searchParams.delete('cat'); else url.searchParams.set('cat', cat);
          history.replaceState(null, '', url.toString());
        } catch (e) {}
      });
    });
  })();

  /* ── 7. BLOG CARD TILT (desktop only) ── */
  (function () {
    if (window.innerWidth < 768) return;
    document.querySelectorAll('.blog-card').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r  = card.getBoundingClientRect();
        var dx = (e.clientX - r.left - r.width / 2) / r.width;
        var dy = (e.clientY - r.top  - r.height / 2) / r.height;
        card.style.transform = 'translateY(-6px) rotateX(' + (-dy * 4) + 'deg) rotateY(' + (dx * 4) + 'deg)';
      });
      card.addEventListener('mouseleave', function () { card.style.transform = ''; });
    });
  })();

})();
