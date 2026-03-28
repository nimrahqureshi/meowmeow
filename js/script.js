/* ============================
   SCRIPT.JS — PAGE INTERACTIONS  (FIXED v2)
   ============================ */

(function () {
  'use strict';

  /* ─── WISHLIST TOGGLE (static cards not yet bound) ─── */
  function bindWishlistButtons() {
    document.querySelectorAll('.wishlist-toggle').forEach(function (btn) {
      if (btn._meowBound) return;
      btn._meowBound = true;

      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        this.classList.toggle('active');
        var icon = this.querySelector('i');
        if (!icon) return;
        if (this.classList.contains('active')) {
          icon.classList.replace('far', 'fas');
          if (window.showToast) showToast('Added to wishlist! \u2764\uFE0F', 'success');
        } else {
          icon.classList.replace('fas', 'far');
          if (window.showToast) showToast('Removed from wishlist', 'warning');
        }
      });
    });
  }

  /* ─── ADD TO CART fallback (only when MeowCart not loaded) ─── */
  function bindAddToCart() {
    if (typeof window.MeowCart !== 'undefined') return;
    document.querySelectorAll('.add-to-cart-btn, [data-action="add-to-cart"]').forEach(function (btn) {
      if (btn._cartBound) return;
      btn._cartBound = true;
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        if (window.showToast) showToast('\uD83D\uDED2 Added to cart!', 'success');
      });
    });
  }

  /* ─── LAZY LOAD ─── */
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

  /* ─── AFFILIATE LINK rel= safety net ─── */
  function setMissingRel() {
    document.querySelectorAll('a[target="_blank"]').forEach(function (link) {
      if (link.getAttribute('rel')) return;
      link.setAttribute('rel', 'noopener noreferrer');
    });
  }

  /* ─── PARALLAX HERO ─── */
  function initParallax() {
    var hero   = document.querySelector('.hero');
    if (!hero || window.innerWidth < 768) return;
    var shapes  = document.querySelectorAll('.shape');
    var ticking = false;
    window.addEventListener('mousemove', function (e) {
      if (ticking || window.innerWidth < 768) return;
      ticking = true;
      requestAnimationFrame(function () {
        var mx = (e.clientX / window.innerWidth  - 0.5) * 2;
        var my = (e.clientY / window.innerHeight - 0.5) * 2;
        shapes.forEach(function (s, i) {
          var sp = (i + 1) * 5;
          s.style.transform = 'translate(' + (mx * sp) + 'px,' + (my * sp) + 'px)';
        });
        ticking = false;
      });
    }, { passive: true });
  }

  /* ─── NEWSLETTER FORM ─── */
  function bindNewsletter() {
    var form = document.getElementById('newsletterForm');
    if (!form || form._meowNewsletterBound) return;
    form._meowNewsletterBound = true;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (window.showToast) showToast('\uD83C\uDF89 Subscribed! Check your inbox.', 'success');
      var msg = document.getElementById('newsletterMsg');
      if (msg) msg.textContent = '\u2705 Thank you for subscribing!';
      this.reset();
    });
  }

  /* ─── CONTACT FORM ─── */
  function bindContactForm() {
    var form = document.getElementById('contactForm');
    if (!form || form._meowContactBound) return;
    form._meowContactBound = true;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (window.showToast) showToast('\uD83D\uDCEC Message sent! We\'ll reply shortly.', 'success');
      this.reset();
    });
  }

  /* ─── INIT ─── */
  document.addEventListener('DOMContentLoaded', function () {
    bindWishlistButtons();
    bindAddToCart();
    initLazyLoad();
    setMissingRel();
    initParallax();
    bindNewsletter();
    bindContactForm();
  });

})();
