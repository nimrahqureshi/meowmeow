/* ============================
   SCRIPT.JS — PAGE INTERACTIONS  v2.0
   All conflicts resolved with guards:
   1. Wishlist: _meowBound flag
   2. Quick view: [data-qv-bound] guard (component.js primary)
   3. Add-to-cart: fallback only when MeowCart absent
   4. Affiliate rel: only sets when no rel exists
   5. Disclosure: not touched (affiliate.js owns it)
   ============================ */

(function () {
  'use strict';

  /* ── 1. WISHLIST TOGGLE ── */
  function bindWishlist() {
    document.querySelectorAll('.wishlist-toggle').forEach(function (btn) {
      if (btn._meowBound) return;
      btn._meowBound = true;
      btn.addEventListener('click', function (e) {
        e.preventDefault(); e.stopPropagation();
        this.classList.toggle('active');
        var icon = this.querySelector('i');
        if (!icon) return;
        if (this.classList.contains('active')) {
          icon.classList.replace('far', 'fas');
          if (window.showToast) window.showToast('Added to wishlist ❤️', 'success');
        } else {
          icon.classList.replace('fas', 'far');
          if (window.showToast) window.showToast('Removed from wishlist', 'warning');
        }
      });
    });
  }

  /* ── 2. QUICK VIEW (fallback) ── */
  function bindQuickView() {
    document.querySelectorAll('.quick-view-btn:not([data-qv-bound])').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault(); e.stopPropagation();
        if (typeof window.MeowComponents !== 'undefined') return;
        var card = this.closest('.product-card');
        var name = card && card.querySelector('.product-name') ? card.querySelector('.product-name').textContent.trim() : 'Product';
        if (window.showToast) window.showToast('👁️ Quick view: ' + name, 'info');
      });
    });
  }

  /* ── 3. ADD TO CART (fallback) ── */
  function bindAddToCart() {
    if (typeof window.MeowCart !== 'undefined') return;
    document.querySelectorAll('.add-to-cart-btn, [data-action="add-to-cart"]').forEach(function (btn) {
      if (btn._cartBound) return;
      btn._cartBound = true;
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        if (window.showToast) window.showToast('🛒 Added to cart!', 'success');
      });
    });
  }

  /* ── 4. LAZY LOAD ── */
  function initLazy() {
    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var img = entry.target;
        if (img.dataset.src) { img.src = img.dataset.src; img.removeAttribute('data-src'); img.classList.add('loaded'); }
        io.unobserve(img);
      });
    }, { rootMargin: '200px' });
    document.querySelectorAll('img[data-src]').forEach(function (img) { io.observe(img); });
  }

  /* ── 5. REL SAFETY NET ── */
  function setRel() {
    document.querySelectorAll('a[target="_blank"]').forEach(function (link) {
      if (link.getAttribute('rel')) return;
      link.setAttribute('rel', 'noopener noreferrer');
    });
  }

  /* ── 6. PARALLAX ── */
  function initParallax() {
    var hero = document.querySelector('.hero');
    var shapes = document.querySelectorAll('.shape');
    if (!hero || !shapes.length || window.innerWidth < 768) return;
    var ticking = false;
    window.addEventListener('mousemove', function (e) {
      if (ticking || window.innerWidth < 768) return;
      ticking = true;
      requestAnimationFrame(function () {
        var mx = (e.clientX / window.innerWidth  - 0.5) * 2;
        var my = (e.clientY / window.innerHeight - 0.5) * 2;
        shapes.forEach(function (s, i) { var sp = (i + 1) * 5; s.style.transform = 'translate(' + (mx * sp) + 'px,' + (my * sp) + 'px)'; });
        ticking = false;
      });
    }, { passive: true });
  }

  /* ── 7. NEWSLETTER (fallback) ── */
  function bindNewsletter() {
    var form = document.getElementById('newsletterForm');
    if (!form || form._meowNewsletterBound) return;
    form._meowNewsletterBound = true;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (window.showToast) window.showToast('🎉 Subscribed!', 'success');
      var note = document.getElementById('newsletterMsg');
      if (note) note.textContent = '✅ Thank you for subscribing!';
      this.reset();
    });
  }

  /* ── 8. CONTACT FORM (fallback) ── */
  function bindContact() {
    var form = document.getElementById('contactForm');
    if (!form || form._meowContactBound) return;
    form._meowContactBound = true;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (window.showToast) window.showToast('📬 Message sent!', 'success');
      this.reset();
    });
  }

  /* ── 9. SMOOTH IMAGE FADE-IN ── */
  function initImageFade() {
    document.querySelectorAll('img:not([data-src])').forEach(function (img) {
      if (img.complete) return;
      img.style.opacity = '0';
      img.style.transition = 'opacity 0.4s ease';
      img.addEventListener('load',  function () { img.style.opacity = '1'; });
      img.addEventListener('error', function () { img.style.opacity = '0.5'; });
    });
  }

  /* ── INIT ── */
  document.addEventListener('DOMContentLoaded', function () {
    bindWishlist();
    bindQuickView();
    bindAddToCart();
    initLazy();
    setRel();
    initParallax();
    bindNewsletter();
    bindContact();
    initImageFade();
  });

})();
