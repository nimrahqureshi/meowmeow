/* ============================================================
   SCROLL.JS — SCROLL PROGRESS, BACK TO TOP, REVEAL,
               COUNTERS, COUNTDOWN TIMER, PARALLAX
   MeowMeow Affiliate Site — Production v2.0
   ============================================================ */

(function() {
  'use strict';

  // ===== THROTTLE =====
  function throttle(fn, ms) {
    var last = 0;
    return function() {
      var now = Date.now();
      if (now - last >= ms) { last = now; fn.apply(this, arguments); }
    };
  }

  // ===== SCROLL PROGRESS BAR =====
  var scrollProgress = document.getElementById('scrollProgress');
  function updateScrollProgress() {
    if (!scrollProgress) return;
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    var scrollH = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    scrollProgress.style.width = (scrollH > 0 ? (scrollTop / scrollH) * 100 : 0) + '%';
  }

  // ===== BACK TO TOP =====
  var backToTop = document.getElementById('backToTop');
  function handleBackToTop() {
    if (!backToTop) return;
    if (window.pageYOffset > 400) backToTop.classList.add('visible');
    else backToTop.classList.remove('visible');
  }
  if (backToTop) {
    backToTop.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ===== SCROLL REVEAL =====
  var revealSelectors = [
    '.product-card', '.category-card', '.review-card', '.blog-card',
    '.trending-card', '.contact-item', '.feature-item', '.stat-card',
    '.reveal', '.reveal-left', '.reveal-right', '.reveal-up', '.team-card'
  ];

  function initScrollReveal() {
    var elements = document.querySelectorAll(revealSelectors.join(','));
    if (!elements.length) return;

    if (!('IntersectionObserver' in window)) {
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
          entry.target.style.transform = 'translateY(0) translateX(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    elements.forEach(function(el, i) {
      // Don't override if already visible
      if (el.classList.contains('revealed')) return;

      var delay = (i % 5) * 80;
      el.style.opacity = '0';
      el.style.transition = 'opacity 0.55s ease ' + delay + 'ms, transform 0.55s ease ' + delay + 'ms';

      if (el.classList.contains('reveal-left')) {
        el.style.transform = 'translateX(-30px)';
      } else if (el.classList.contains('reveal-right')) {
        el.style.transform = 'translateX(30px)';
      } else {
        el.style.transform = 'translateY(24px)';
      }
      observer.observe(el);
    });
  }

  // ===== COUNTER ANIMATION =====
  function initCounters() {
    var counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    if (!('IntersectionObserver' in window)) {
      counters.forEach(function(el) {
        el.textContent = parseInt(el.dataset.count).toLocaleString();
      });
      return;
    }

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseInt(el.dataset.count) || 0;
        var suffix = el.dataset.suffix || '';
        var prefix = el.dataset.prefix || '';
        var duration = 2000;
        var steps = 60;
        var stepVal = target / steps;
        var current = 0;
        var stepTime = duration / steps;

        function tick() {
          current += stepVal;
          if (current < target) {
            el.textContent = prefix + Math.floor(current).toLocaleString() + suffix;
            setTimeout(tick, stepTime);
          } else {
            el.textContent = prefix + target.toLocaleString() + suffix;
          }
        }
        tick();
        observer.unobserve(el);
      });
    }, { threshold: 0.5 });

    counters.forEach(function(el) { observer.observe(el); });
  }

  // ===== COUNTDOWN TIMER =====
  function initCountdownTimer() {
    // Support: data-countdown="ISO_DATE" on .countdown-timer elements
    document.querySelectorAll('[data-countdown]').forEach(function(el) {
      var targetDate = new Date(el.dataset.countdown).getTime();
      if (isNaN(targetDate)) return;

      function updateTimer() {
        var now = Date.now();
        var diff = targetDate - now;
        if (diff <= 0) {
          el.textContent = 'Expired';
          return;
        }
        var d = Math.floor(diff / 86400000);
        var h = Math.floor((diff % 86400000) / 3600000);
        var m = Math.floor((diff % 3600000) / 60000);
        var s = Math.floor((diff % 60000) / 1000);

        var dEl = el.querySelector('.cd-days, [data-unit="days"]');
        var hEl = el.querySelector('.cd-hours, #hours, [data-unit="hours"]');
        var mEl = el.querySelector('.cd-minutes, #minutes, [data-unit="minutes"]');
        var sEl = el.querySelector('.cd-seconds, #seconds, [data-unit="seconds"]');

        if (dEl) dEl.textContent = String(d).padStart(2, '0');
        if (hEl) hEl.textContent = String(h).padStart(2, '0');
        if (mEl) mEl.textContent = String(m).padStart(2, '0');
        if (sEl) sEl.textContent = String(s).padStart(2, '0');
      }
      updateTimer();
      setInterval(updateTimer, 1000);
    });

    // Fallback: classic #hours #minutes #seconds with fixed timer
    var hoursEl   = document.getElementById('hours');
    var minutesEl = document.getElementById('minutes');
    var secondsEl = document.getElementById('seconds');

    if (hoursEl && minutesEl && secondsEl && !hoursEl.closest('[data-countdown]')) {
      // Pull from localStorage or reset to 8h45m
      var savedEnd = parseInt(localStorage.getItem('meowmeow-timer-end') || '0');
      if (!savedEnd || savedEnd <= Date.now()) {
        savedEnd = Date.now() + (8 * 3600 + 45 * 60) * 1000;
        localStorage.setItem('meowmeow-timer-end', savedEnd.toString());
      }

      function updateFallbackTimer() {
        var diff = savedEnd - Date.now();
        if (diff <= 0) {
          savedEnd = Date.now() + 24 * 3600000;
          localStorage.setItem('meowmeow-timer-end', savedEnd.toString());
          diff = savedEnd - Date.now();
        }
        var h = Math.floor(diff / 3600000);
        var m = Math.floor((diff % 3600000) / 60000);
        var s = Math.floor((diff % 60000) / 1000);
        hoursEl.textContent = String(h).padStart(2, '0');
        minutesEl.textContent = String(m).padStart(2, '0');
        secondsEl.textContent = String(s).padStart(2, '0');
      }
      updateFallbackTimer();
      setInterval(updateFallbackTimer, 1000);
    }
  }

  // ===== PARALLAX HERO SHAPES =====
  function initParallax() {
    var hero = document.querySelector('.hero');
    if (!hero) return;
    document.addEventListener('mousemove', throttle(function(e) {
      if (window.innerWidth < 768) return;
      var shapes = document.querySelectorAll('.shape, .hero-shape');
      var mx = (e.clientX / window.innerWidth - 0.5) * 2;
      var my = (e.clientY / window.innerHeight - 0.5) * 2;
      shapes.forEach(function(shape, i) {
        var speed = (i + 1) * 5;
        shape.style.transform = 'translate(' + (mx * speed) + 'px, ' + (my * speed) + 'px)';
      });
    }, 16));
  }

  // ===== PROMO CODE COPY =====
  function initPromoCodes() {
    document.querySelectorAll('.promo-code-box, [data-promo-code]').forEach(function(el) {
      el.style.cursor = 'pointer';
      el.title = 'Click to copy';
      el.addEventListener('click', function() {
        var code = el.dataset.promoCode || el.querySelector('.code-text, code, strong')?.textContent || el.textContent;
        code = code.trim();
        if (!code) return;
        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(code).then(function() {
            window.showToast && window.showToast('📋 Code copied: ' + code, 'success');
          });
        } else {
          var ta = document.createElement('textarea');
          ta.value = code;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
          window.showToast && window.showToast('📋 Code copied: ' + code, 'success');
        }
        el.classList.add('copied');
        setTimeout(function() { el.classList.remove('copied'); }, 2000);
      });
    });
  }

  // ===== LAZY LOAD IMAGES =====
  function initLazyImages() {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('img[data-src]').forEach(function(img) {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
      });
      return;
    }
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (!entry.isIntersecting) return;
        var img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        img.classList.add('img-loaded');
        observer.unobserve(img);
      });
    }, { rootMargin: '200px 0px' });

    document.querySelectorAll('img[data-src], img.lazy').forEach(function(img) {
      observer.observe(img);
    });
  }

  // ===== FAQ ACCORDION =====
  function initAccordion() {
    document.querySelectorAll('.faq-item, .accordion-item').forEach(function(item) {
      var trigger = item.querySelector('.faq-question, .accordion-trigger, [data-accordion-trigger]');
      var content = item.querySelector('.faq-answer, .accordion-content, [data-accordion-content]');
      if (!trigger || !content) return;

      trigger.style.cursor = 'pointer';
      trigger.setAttribute('aria-expanded', 'false');
      content.style.overflow = 'hidden';
      content.style.maxHeight = '0';
      content.style.transition = 'max-height 0.35s ease, opacity 0.3s ease';
      content.style.opacity = '0';

      trigger.addEventListener('click', function() {
        var isOpen = item.classList.contains('open');

        // Close all
        document.querySelectorAll('.faq-item.open, .accordion-item.open').forEach(function(openItem) {
          openItem.classList.remove('open');
          var c = openItem.querySelector('.faq-answer, .accordion-content, [data-accordion-content]');
          var t = openItem.querySelector('.faq-question, .accordion-trigger, [data-accordion-trigger]');
          if (c) { c.style.maxHeight = '0'; c.style.opacity = '0'; }
          if (t) t.setAttribute('aria-expanded', 'false');
        });

        if (!isOpen) {
          item.classList.add('open');
          content.style.maxHeight = content.scrollHeight + 'px';
          content.style.opacity = '1';
          trigger.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  // ===== TABS =====
  function initTabs() {
    document.querySelectorAll('.tabs-bar, [role="tablist"]').forEach(function(tabBar) {
      var tabs = tabBar.querySelectorAll('.tab-btn, [role="tab"]');
      tabs.forEach(function(tab) {
        tab.addEventListener('click', function() {
          var target = this.dataset.tab || this.getAttribute('aria-controls');
          // Deactivate all in this bar
          tabs.forEach(function(t) { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
          this.classList.add('active');
          this.setAttribute('aria-selected', 'true');
          // Hide all panels in the parent group
          var parent = tabBar.closest('.tabs-wrapper, [data-tabs-wrapper]') || tabBar.parentElement;
          if (parent) {
            parent.querySelectorAll('.tab-content, [role="tabpanel"]').forEach(function(panel) {
              panel.classList.remove('active');
              panel.hidden = true;
            });
            var targetPanel = target ? document.getElementById(target) || parent.querySelector('[data-tab="' + target + '"]') : null;
            if (targetPanel) { targetPanel.classList.add('active'); targetPanel.hidden = false; }
          }
        });
      });
    });
  }

  // ===== FILTER BAR =====
  function initFilterBar() {
    document.querySelectorAll('.filter-bar, [data-filter-bar]').forEach(function(bar) {
      var btns = bar.querySelectorAll('.filter-btn, [data-filter]');
      btns.forEach(function(btn) {
        btn.addEventListener('click', function() {
          btns.forEach(function(b) { b.classList.remove('active'); });
          this.classList.add('active');
          var filter = this.dataset.filter || 'all';
          var grid = bar.closest('section') || document;
          grid.querySelectorAll('.product-card, .blog-card, [data-category]').forEach(function(card) {
            if (filter === 'all' || card.dataset.category === filter) {
              card.style.display = '';
              setTimeout(function() { card.style.opacity = '1'; card.style.transform = 'scale(1)'; }, 10);
            } else {
              card.style.opacity = '0';
              card.style.transform = 'scale(0.95)';
              setTimeout(function() { card.style.display = 'none'; }, 280);
            }
          });
        });
      });
    });
  }

  // ===== SUBSCRIBE FORMS =====
  function initSubscribeForms() {
    document.querySelectorAll('.newsletter-form, #newsletterForm, [data-subscribe-form]').forEach(function(form) {
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        var emailInput = form.querySelector('input[type="email"]');
        if (!emailInput || !emailInput.value.trim()) {
          window.showToast && window.showToast('Please enter a valid email', 'warning');
          return;
        }
        var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!re.test(emailInput.value.trim())) {
          window.showToast && window.showToast('Invalid email address', 'error');
          return;
        }
        var btn = form.querySelector('button[type="submit"], .subscribe-btn');
        var originalText = btn ? btn.textContent : '';
        if (btn) { btn.textContent = 'Subscribing...'; btn.disabled = true; }
        setTimeout(function() {
          window.showToast && window.showToast('🎉 Subscribed! Check your inbox.', 'success');
          form.reset();
          if (btn) { btn.textContent = originalText; btn.disabled = false; }
          var popup = document.getElementById('newsletterPopup');
          if (popup) popup.classList.remove('active');
        }, 1200);
      });
    });
  }

  // ===== CONTACT FORM =====
  function initContactForm() {
    var form = document.getElementById('contactForm');
    if (!form) return;
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      if (btn) { btn.textContent = 'Sending...'; btn.disabled = true; }
      setTimeout(function() {
        window.showToast && window.showToast('📬 Message sent! We\'ll reply within 24h.', 'success');
        form.reset();
        if (btn) { btn.textContent = 'Send Message'; btn.disabled = false; }
      }, 1400);
    });
  }

  // ===== STICKY BUY BAR =====
  function initStickyBuyBar() {
    var stickyBar = document.getElementById('stickyBuyBar');
    var productHero = document.querySelector('.product-hero, .hero');
    if (!stickyBar || !productHero) return;
    var observer = new IntersectionObserver(function(entries) {
      stickyBar.classList.toggle('visible', !entries[0].isIntersecting);
    }, { threshold: 0 });
    observer.observe(productHero);
  }

  // ===== PRODUCT IMAGE GALLERY =====
  function initProductGallery() {
    document.querySelectorAll('.product-gallery, [data-gallery]').forEach(function(gallery) {
      var mainImg = gallery.querySelector('.gallery-main, [data-gallery-main]');
      var thumbs = gallery.querySelectorAll('[data-thumb]');
      if (!mainImg || !thumbs.length) return;
      thumbs.forEach(function(thumb) {
        thumb.style.cursor = 'pointer';
        thumb.addEventListener('click', function() {
          mainImg.src = this.dataset.thumb;
          thumbs.forEach(function(t) { t.classList.remove('active-thumb'); });
          this.classList.add('active-thumb');
        });
      });
    });
  }

  // ===== BUTTON RIPPLE EFFECT =====
  function initRipple() {
    document.addEventListener('click', function(e) {
      var btn = e.target.closest('.btn, button:not(.toast-close):not(.cart-drawer-remove):not(.notif-dismiss)');
      if (!btn) return;
      if (btn.classList.contains('no-ripple')) return;
      var rect = btn.getBoundingClientRect();
      var ripple = document.createElement('span');
      var size = Math.max(rect.width, rect.height);
      ripple.className = 'ripple-effect';
      ripple.style.cssText =
        'position:absolute;border-radius:50%;background:rgba(255,255,255,0.35);' +
        'width:' + size + 'px;height:' + size + 'px;' +
        'left:' + (e.clientX - rect.left - size / 2) + 'px;' +
        'top:' + (e.clientY - rect.top - size / 2) + 'px;' +
        'transform:scale(0);animation:rippleAnim 0.6s linear forwards;pointer-events:none;';
      // Ensure btn has position
      var pos = getComputedStyle(btn).position;
      if (pos === 'static') btn.style.position = 'relative';
      btn.style.overflow = 'hidden';
      btn.appendChild(ripple);
      setTimeout(function() { if (ripple.parentNode) ripple.remove(); }, 700);
    });
    // Inject ripple keyframe once
    if (!document.getElementById('rippleStyle')) {
      var style = document.createElement('style');
      style.id = 'rippleStyle';
      style.textContent = '@keyframes rippleAnim{to{transform:scale(4);opacity:0}}';
      document.head.appendChild(style);
    }
  }

  // ===== SCROLL EVENT (THROTTLED) =====
  window.addEventListener('scroll', throttle(function() {
    updateScrollProgress();
    handleBackToTop();
  }, 16), { passive: true });

  // ===== INIT ALL ON DOM READY =====
  document.addEventListener('DOMContentLoaded', function() {
    updateScrollProgress();
    handleBackToTop();
    initScrollReveal();
    initCounters();
    initCountdownTimer();
    initParallax();
    initPromoCodes();
    initLazyImages();
    initAccordion();
    initTabs();
    initFilterBar();
    initSubscribeForms();
    initContactForm();
    initStickyBuyBar();
    initProductGallery();
    initRipple();
  });

})();
