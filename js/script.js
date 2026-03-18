/* ============================
   SCRIPT.JS — PAGE INTERACTIONS  v2.0
   MeowMeow Affiliate Site

   CONFLICTS RESOLVED vs original:
   ─────────────────────────────────────────────────────────
   1. WISHLIST TOGGLE — original bound ALL .wishlist-toggle at
      load time. Dynamic cards injected by render_*.js /
      affiliate-main.js were not yet in DOM → missed.
      Also conflicted with navbar.js (which also binds .wishlist-toggle)
      and products.js (which uses data-wl-bound guard).
      FIX: Only bind buttons NOT already bound (_meowBound flag).
           Runs on DOMContentLoaded so static cards are caught.
           Dynamic cards are handled by render_*.js / products.js
           which set _meowBound = true after injection.

   2. QUICK VIEW — original bound '.quick-view-btn' directly.
      component.js also binds '.quick-view-btn:not([data-qv-bound])'.
      render_*.js uses '.aff-qv-btn' (different class — no conflict).
      FIX: We bind ONLY buttons that are NOT already bound by
           component.js ([data-qv-bound]). Emit a toast only as
           fallback if component.js hasn't handled it.

   3. ADD TO CART — original bound '.add-to-cart-btn' and manually
      incremented cart badge counter. cart.js ALSO handles
      '.add-to-cart-btn' via [data-add-to-cart] attr pattern AND
      a MutationObserver. render_*.js uses '.aff-cart-btn'.
      FIX: We remove the manual badge increment (cart.js does it).
           We only bind [data-add-to-cart] buttons as fallback
           when window.MeowCart is not available (i.e. cart.js not loaded).
           When MeowCart exists, we skip — cart.js owns those buttons.

   4. AFFILIATE LINK rel= — original added rel="noopener noreferrer"
      WITHOUT "sponsored" to ALL target="_blank" links.
      affiliate.js OVERWRITES this to "noopener noreferrer sponsored".
      FIX: We skip any link that already has a rel attribute set.
           affiliate.js runs after us and adds "sponsored" correctly.
           We only set rel on links with NO rel at all.

   5. DISCLOSURE BANNER — original had no disclosure handler here.
      navbar.js binds it synchronously (no sessionStorage).
      main.js binds it on DOMContentLoaded (has sessionStorage).
      affiliate.js is the canonical owner (clones button, strips all).
      FIX: We do NOT touch disclosure at all here. affiliate.js owns it.

   LOAD ORDER (this file runs after):
     themes.js → main.js → navbar.js → search.js → scroll.js
     → script.js (this) → cart.js → component.js
     → data files → render_*.js → affiliate-main.js → affiliate.js
   ============================ */

(function () {
  'use strict';

  /* ──────────────────────────────────────────────────
     1. WISHLIST TOGGLE
     Only binds buttons not already claimed by navbar.js
     or products.js (_meowBound flag guard).
     Dynamic cards are handled by render_*.js which sets
     _meowBound = true immediately after injection.
  ────────────────────────────────────────────────── */

  function bindWishlistButtons() {
    document.querySelectorAll('.wishlist-toggle').forEach(function (btn) {
      if (btn._meowBound) return;   /* already owned by navbar.js / products.js / render_*.js */
      btn._meowBound = true;

      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();

        this.classList.toggle('active');
        var icon = this.querySelector('i');
        if (!icon) return;

        if (this.classList.contains('active')) {
          icon.classList.remove('far');
          icon.classList.add('fas');
          if (typeof window.showToast === 'function') {
            window.showToast('Added to wishlist! ❤️', 'success');
          }
        } else {
          icon.classList.remove('fas');
          icon.classList.add('far');
          if (typeof window.showToast === 'function') {
            window.showToast('Removed from wishlist', 'warning');
          }
        }
      });
    });
  }

  /* ──────────────────────────────────────────────────
     2. QUICK VIEW
     Only binds buttons NOT already bound by component.js
     ([data-qv-bound] attr guard). render_*.js uses
     '.aff-qv-btn' class so never clashes here.
  ────────────────────────────────────────────────── */

  function bindQuickView() {
    document.querySelectorAll('.quick-view-btn:not([data-qv-bound])').forEach(function (btn) {
      /* component.js will bind these properly on DOMContentLoaded.
         We only attach a fallback toast in case component.js isn't loaded. */
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();

        /* If component.js is loaded it will stopPropagation before us
           via capture phase — this handler only fires as fallback. */
        if (typeof window.MeowComponents !== 'undefined') return;

        var card = this.closest('.product-card');
        var name = (card && card.querySelector('.product-name'))
          ? card.querySelector('.product-name').textContent.trim()
          : 'Product';
        if (typeof window.showToast === 'function') {
          window.showToast('👁️ Quick view: ' + name, 'info');
        }
      });
    });
  }

  /* ──────────────────────────────────────────────────
     3. ADD TO CART (STATIC CARDS ONLY)
     render_*.js uses class "aff-cart-btn" — no overlap.
     cart.js handles [data-add-to-cart] attr buttons via
     its own MutationObserver.
     We only handle ".add-to-cart-btn" on static HTML cards
     as a fallback when MeowCart is not available.
     When MeowCart IS available, we skip entirely — cart.js owns this.
  ────────────────────────────────────────────────── */

  function bindAddToCart() {
    /* If cart.js is loaded, it owns all add-to-cart buttons — skip */
    if (typeof window.MeowCart !== 'undefined') return;

    document.querySelectorAll('.add-to-cart-btn, [data-action="add-to-cart"]').forEach(function (btn) {
      if (btn._cartBound) return;
      btn._cartBound = true;

      btn.addEventListener('click', function (e) {
        e.preventDefault();
        /* Minimal fallback: show toast only */
        if (typeof window.showToast === 'function') {
          window.showToast('🛒 Added to cart!', 'success');
        }
      });
    });
  }

  /* ──────────────────────────────────────────────────
     4. LAZY LOADING (data-src images)
     Same as original — no conflicts.
  ────────────────────────────────────────────────── */

  function initLazyLoad() {
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
    }, { rootMargin: '200px' });

    document.querySelectorAll('img[data-src]').forEach(function (img) {
      observer.observe(img);
    });
  }

  /* ──────────────────────────────────────────────────
     5. AFFILIATE LINK rel= SAFETY NET
     Only sets rel on target="_blank" links that have
     NO rel attribute at all. affiliate.js runs AFTER us
     and overwrites with the correct "noopener noreferrer sponsored".
     We never overwrite an existing rel value.
  ────────────────────────────────────────────────── */

  function setMissingRel() {
    document.querySelectorAll('a[target="_blank"]').forEach(function (link) {
      /* Skip: already has rel set (affiliate.js will fix "sponsored" part) */
      if (link.getAttribute('rel')) return;
      link.setAttribute('rel', 'noopener noreferrer');
      /* Note: affiliate.js will upgrade this to include "sponsored"
         for affiliate domains when it runs after us. */
    });
  }

  /* ──────────────────────────────────────────────────
     6. PARALLAX HERO SHAPES
     Mouse-move parallax on hero section shapes.
     Throttled via requestAnimationFrame.
  ────────────────────────────────────────────────── */

  function initParallax() {
    var heroSection = document.querySelector('.hero');
    if (!heroSection || window.innerWidth < 768) return;

    var shapes  = document.querySelectorAll('.shape');
    var ticking = false;

    window.addEventListener('mousemove', function (e) {
      if (ticking || window.innerWidth < 768) return;
      ticking = true;

      requestAnimationFrame(function () {
        var mx = (e.clientX / window.innerWidth  - 0.5) * 2;
        var my = (e.clientY / window.innerHeight - 0.5) * 2;

        shapes.forEach(function (shape, i) {
          var speed = (i + 1) * 5;
          shape.style.transform = 'translate(' + (mx * speed) + 'px, ' + (my * speed) + 'px)';
        });
        ticking = false;
      });
    }, { passive: true });
  }

  /* ──────────────────────────────────────────────────
     7. NEWSLETTER FORM
     Handles #newsletterForm submit with toast feedback.
     scroll.js also handles newsletter forms via
     '.newsletter-form, .footer-newsletter form'.
     Guard: only bind #newsletterForm here if scroll.js
     hasn't already (_meowNewsletterBound flag).
  ────────────────────────────────────────────────── */

  function bindNewsletter() {
    var form = document.getElementById('newsletterForm');
    if (!form || form._meowNewsletterBound) return;
    form._meowNewsletterBound = true;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (typeof window.showToast === 'function') {
        window.showToast('🎉 Subscribed! Check your inbox.', 'success');
      }
      var msg = document.getElementById('newsletterMsg');
      if (msg) msg.textContent = '✅ Thank you for subscribing!';
      this.reset();
    });
  }

  /* ──────────────────────────────────────────────────
     8. CONTACT FORM
     scroll.js handles #contactForm. We skip if it exists.
  ────────────────────────────────────────────────── */

  function bindContactForm() {
    var form = document.getElementById('contactForm');
    if (!form || form._meowContactBound) return;
    form._meowContactBound = true;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (typeof window.showToast === 'function') {
        window.showToast('📬 Message sent! We\'ll reply shortly.', 'success');
      }
      this.reset();
    });
  }

  /* ──────────────────────────────────────────────────
     INIT
  ────────────────────────────────────────────────── */

  document.addEventListener('DOMContentLoaded', function () {
    bindWishlistButtons();
    bindQuickView();
    bindAddToCart();
    initLazyLoad();
    setMissingRel();
    initParallax();
    bindNewsletter();
    bindContactForm();
  });

})();
