/* ============================
   SCROLL.JS — SCROLL FEATURES
   ============================ */

(function() {
  'use strict';

  /* ===== SCROLL REVEAL ===== */
  function initScrollReveal() {
    var selectors = [
      '.product-card',
      '.category-card',
      '.review-card',
      '.blog-card',
      '.trending-card',
      '.feature-card',
      '.team-member',
      '.faq-item',
      '.contact-item'
    ].join(', ');

    var elements = document.querySelectorAll(selectors);
    if (!elements.length) return;

    if (!('IntersectionObserver' in window)) {
      // Fallback: show everything immediately
      elements.forEach(function(el) {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      return;
    }

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.08,
      rootMargin: '0px 0px -40px 0px'
    });

    elements.forEach(function(el, i) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = 'opacity 0.55s ease ' + ((i % 5) * 0.08) + 's, transform 0.55s ease ' + ((i % 5) * 0.08) + 's';
      observer.observe(el);
    });
  }

  /* ===== STAT COUNTER ANIMATION ===== */
  function initCounters() {
    var counters = document.querySelectorAll('.stat-number[data-count]');
    if (!counters.length) return;

    if (!('IntersectionObserver' in window)) {
      counters.forEach(function(counter) {
        counter.textContent = parseInt(counter.getAttribute('data-count')).toLocaleString();
      });
      return;
    }

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (!entry.isIntersecting) return;

        var counter = entry.target;
        var target = parseInt(counter.getAttribute('data-count')) || 0;
        var suffix = counter.getAttribute('data-suffix') || '';
        var duration = 1800;
        var steps = 60;
        var stepTime = duration / steps;
        var current = 0;
        var increment = target / steps;

        observer.unobserve(counter);

        var timer = setInterval(function() {
          current += increment;
          if (current >= target) {
            clearInterval(timer);
            current = target;
          }
          counter.textContent = Math.floor(current).toLocaleString() + suffix;
        }, stepTime);
      });
    }, { threshold: 0.5 });

    counters.forEach(function(counter) {
      observer.observe(counter);
    });
  }

  /* ===== COUNTDOWN TIMER ===== */
  function initCountdownTimer() {
    var hoursEl   = document.getElementById('hours');
    var minutesEl = document.getElementById('minutes');
    var secondsEl = document.getElementById('seconds');

    if (!hoursEl || !minutesEl || !secondsEl) return;

    // Persist timer across page loads using sessionStorage
    var storageKey = 'meowmeow-timer-end';
    var endTime = parseInt(sessionStorage.getItem(storageKey)) || 0;
    var now = Date.now();

    // If no saved timer or it's expired, set a new 8h45m30s countdown
    if (!endTime || endTime <= now) {
      endTime = now + (8 * 3600 + 45 * 60 + 30) * 1000;
      sessionStorage.setItem(storageKey, endTime);
    }

    function updateTimer() {
      var remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));

      if (remaining <= 0) {
        // Reset timer
        endTime = Date.now() + 24 * 3600 * 1000;
        sessionStorage.setItem(storageKey, endTime);
        remaining = 24 * 3600;
      }

      var h = Math.floor(remaining / 3600);
      var m = Math.floor((remaining % 3600) / 60);
      var s = remaining % 60;

      hoursEl.textContent   = String(h).padStart(2, '0');
      minutesEl.textContent = String(m).padStart(2, '0');
      secondsEl.textContent = String(s).padStart(2, '0');
    }

    updateTimer();
    setInterval(updateTimer, 1000);
  }

  /* ===== PRODUCT FILTER ===== */
  function initFilter() {
    var filterBtns = document.querySelectorAll('.filter-btn');
    if (!filterBtns.length) return;

    filterBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        var group = this.closest('.filter-bar');
        if (group) {
          group.querySelectorAll('.filter-btn').forEach(function(b) {
            b.classList.remove('active');
          });
        }
        this.classList.add('active');

        var filter = this.getAttribute('data-filter');
        var cards  = document.querySelectorAll('.product-card[data-category]');

        cards.forEach(function(card) {
          if (!filter || filter === 'all') {
            card.style.display = '';
          } else {
            var cat = (card.getAttribute('data-category') || '').toLowerCase();
            card.style.display = cat.includes(filter.toLowerCase()) ? '' : 'none';
          }
        });
      });
    });
  }

  /* ===== SUBCATEGORY FILTER ===== */
  function initSubcategoryFilter() {
    document.querySelectorAll('.subcategory-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var bar = this.closest('.subcategory-list') || this.closest('.subcategory-bar');
        if (bar) {
          bar.querySelectorAll('.subcategory-btn').forEach(function(b) {
            b.classList.remove('active');
          });
        }
        this.classList.add('active');
      });
    });
  }

  /* ===== NEWSLETTER FORMS ===== */
  function initNewsletterForms() {
    document.querySelectorAll('.newsletter-form, .footer-newsletter form').forEach(function(form) {
      if (form._meowBound) return;
      form._meowBound = true;

      form.addEventListener('submit', function(e) {
        e.preventDefault();
        var input = this.querySelector('input[type="email"], input[type="text"]');
        var email = input ? input.value.trim() : '';

        if (!email) {
          if (window.showToast) showToast('Please enter your email address', 'warning');
          return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          if (window.showToast) showToast('Please enter a valid email address', 'error');
          return;
        }

        if (window.showToast) showToast('🎉 Subscribed! Check your inbox.', 'success');
        this.reset();
      });
    });
  }

  /* ===== CONTACT FORM ===== */
  function initContactForm() {
    var form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      if (window.showToast) showToast('📬 Message sent! We\'ll reply shortly.', 'success');
      this.reset();
    });
  }

  /* ===== INIT ON DOM READY ===== */
  function init() {
    // Small delay for scroll reveal so layout is settled
    requestAnimationFrame(function() {
      initScrollReveal();
    });
    initCounters();
    initCountdownTimer();
    initFilter();
    initSubcategoryFilter();
    initNewsletterForms();
    initContactForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
