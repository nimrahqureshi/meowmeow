/* ============================
   SCRIPT.JS — PAGE INTERACTIONS
   ============================ */

(function() {
  'use strict';

  /* ===== WISHLIST TOGGLE ===== */
  document.querySelectorAll('.wishlist-toggle').forEach(function(btn) {
    // Prevent double-binding if navbar.js already handled it
    if (btn._meowBound) return;
    btn._meowBound = true;

    btn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      this.classList.toggle('active');
      var icon = this.querySelector('i');
      if (!icon) return;

      if (this.classList.contains('active')) {
        icon.classList.remove('far');
        icon.classList.add('fas');
        if (window.showToast) showToast('Added to wishlist! ❤️', 'success');
      } else {
        icon.classList.remove('fas');
        icon.classList.add('far');
        if (window.showToast) showToast('Removed from wishlist', 'warning');
      }
    });
  });

  /* ===== QUICK VIEW ===== */
  document.querySelectorAll('.quick-view-btn, .product-overlay .btn').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      var card = this.closest('.product-card');
      var name = card ? (card.querySelector('.product-name') || {}).textContent : 'Product';
      if (window.showToast) showToast('👁️ Quick view: ' + (name || 'Product'), 'info');
    });
  });

  /* ===== ADD TO CART ===== */
  document.querySelectorAll('.add-to-cart-btn, [data-action="add-to-cart"]').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      var card = this.closest('.product-card');
      var name = card ? (card.querySelector('.product-name') || {}).textContent : 'Item';
      var badge = document.querySelector('.cart-badge');

      if (badge) {
        var count = parseInt(badge.textContent) || 0;
        badge.textContent = count + 1;
        badge.style.transform = 'scale(1.3)';
        setTimeout(function() { badge.style.transform = ''; }, 300);
      }

      if (window.showToast) showToast('🛒 Added to cart!', 'success');
    });
  });

  /* ===== LAZY LOADING ===== */
  if ('IntersectionObserver' in window) {
    var imgObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            img.classList.add('loaded');
          }
          imgObserver.unobserve(img);
        }
      });
    }, { rootMargin: '200px' });

    document.querySelectorAll('img[data-src]').forEach(function(img) {
      imgObserver.observe(img);
    });
  }

  /* ===== PRODUCT CARD HOVER SOUND (optional UX) ===== */
  // No-op but placeholder for future use

  /* ===== AFFILIATE LINK HANDLING ===== */
  document.querySelectorAll('a[target="_blank"]').forEach(function(link) {
    if (!link.getAttribute('rel')) {
      link.setAttribute('rel', 'noopener noreferrer');
    }
  });

})();
