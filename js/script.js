/* ============================================================
   SCRIPT.JS — PAGE INTERACTIONS, QUICK VIEW, MISC
   MeowMeow Affiliate Site — Production v2.0
   ============================================================ */

(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {

    // ===== QUICK VIEW MODAL =====
    var quickViewModal = document.getElementById('quickViewModal');
    var quickViewClose = document.getElementById('quickViewClose');

    document.addEventListener('click', function(e) {
      var btn = e.target.closest('.quick-view-btn, [data-quick-view]');
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();

      var card = btn.closest('.product-card');
      if (!card) return;

      var name  = (card.querySelector('.product-name') || {}).textContent || 'Product';
      var price = (card.querySelector('.current-price') || {}).textContent || '';
      var oldPrice = (card.querySelector('.old-price') || {}).textContent || '';
      var img   = card.querySelector('img');
      var imgSrc = img ? img.src : '';
      var desc  = card.dataset.description || 'Premium quality product for your beloved pet. Click buy now to get the best deal!';
      var stars = card.dataset.rating || '4.8';

      // Render star rating
      function renderStars(rating) {
        var full = Math.floor(parseFloat(rating));
        var half = parseFloat(rating) - full >= 0.5;
        var html = '';
        for (var i = 0; i < 5; i++) {
          if (i < full) html += '<i class="fas fa-star"></i>';
          else if (i === full && half) html += '<i class="fas fa-star-half-alt"></i>';
          else html += '<i class="far fa-star"></i>';
        }
        return html;
      }

      if (quickViewModal) {
        var content = quickViewModal.querySelector('.quick-view-content, .modal-body');
        if (content) {
          content.innerHTML =
            '<div class="qv-grid">' +
              '<div class="qv-image">' +
                (imgSrc ? '<img src="' + imgSrc + '" alt="' + name + '" />' : '<div class="qv-img-placeholder"><i class="fas fa-image"></i></div>') +
              '</div>' +
              '<div class="qv-details">' +
                '<h2 class="qv-name">' + name + '</h2>' +
                '<div class="qv-stars">' + renderStars(stars) + '<span class="qv-rating">(' + stars + ')</span></div>' +
                '<div class="qv-price">' +
                  '<span class="qv-current-price">' + price + '</span>' +
                  (oldPrice ? '<span class="qv-old-price">' + oldPrice + '</span>' : '') +
                '</div>' +
                '<p class="qv-desc">' + desc + '</p>' +
                '<div class="qv-actions">' +
                  '<button class="btn btn-primary qv-add-cart"><i class="fas fa-cart-plus"></i> Add to Cart</button>' +
                  '<button class="btn btn-outline qv-wishlist"><i class="far fa-heart"></i> Wishlist</button>' +
                '</div>' +
                '<div class="qv-badges">' +
                  '<span><i class="fas fa-shield-alt"></i> Secure Checkout</span>' +
                  '<span><i class="fas fa-truck"></i> Free Delivery</span>' +
                  '<span><i class="fas fa-undo"></i> Easy Returns</span>' +
                '</div>' +
                '<div class="qv-payment-icons">' +
                  '<i class="fab fa-cc-visa" title="Visa"></i>' +
                  '<i class="fab fa-cc-mastercard" title="Mastercard"></i>' +
                  '<i class="fab fa-cc-paypal" title="PayPal"></i>' +
                  '<i class="fab fa-cc-amex" title="Amex"></i>' +
                  '<i class="fab fa-cc-stripe" title="Stripe"></i>' +
                '</div>' +
              '</div>' +
            '</div>';

          // Add-to-cart from quick view
          var addBtn = content.querySelector('.qv-add-cart');
          if (addBtn) {
            addBtn.addEventListener('click', function() {
              window.addToCart && window.addToCart({
                id: card.dataset.id || ('qv-' + Date.now()),
                name: name, price: price, image: imgSrc
              });
            });
          }

          // Wishlist from quick view
          var wlBtn = content.querySelector('.qv-wishlist');
          if (wlBtn) {
            wlBtn.addEventListener('click', function() {
              window.toggleWishlist && window.toggleWishlist({
                id: card.dataset.id || ('qv-w-' + Date.now()),
                name: name, price: price, image: imgSrc
              }, null);
            });
          }
        }
        quickViewModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      } else {
        // Fallback toast if no modal in HTML
        window.showToast && window.showToast('👁️ Quick view: ' + name + ' — ' + price, 'info');
      }
    });

    // Quick view modal close
    function closeQuickView() {
      if (quickViewModal) quickViewModal.classList.remove('active');
      document.body.style.overflow = '';
    }
    if (quickViewClose) quickViewClose.addEventListener('click', closeQuickView);
    if (quickViewModal) {
      quickViewModal.addEventListener('click', function(e) {
        if (e.target === quickViewModal) closeQuickView();
      });
    }
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') closeQuickView();
    });

    // ===== LOAD MORE BUTTON =====
    var loadMoreBtn = document.querySelector('.load-more-btn, #loadMoreBtn');
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', function() {
        var hiddenCards = document.querySelectorAll('.product-card[style*="display: none"], .product-card.hidden-card');
        var shown = 0;
        hiddenCards.forEach(function(card) {
          if (shown < 4) {
            card.style.display = '';
            card.classList.remove('hidden-card');
            shown++;
          }
        });
        if (shown === 0) {
          loadMoreBtn.textContent = 'No more products';
          loadMoreBtn.disabled = true;
        }
      });
    }

    // ===== RATING STARS (interactive, e.g. review form) =====
    document.querySelectorAll('.star-rating-input').forEach(function(container) {
      var stars = container.querySelectorAll('.star-input');
      stars.forEach(function(star, i) {
        star.addEventListener('mouseenter', function() {
          stars.forEach(function(s, j) {
            var ic = s.querySelector('i');
            if (ic) {
              ic.className = j <= i ? 'fas fa-star' : 'far fa-star';
            }
          });
        });
        star.addEventListener('mouseleave', function() {
          var selected = parseInt(container.dataset.selected || '0') - 1;
          stars.forEach(function(s, j) {
            var ic = s.querySelector('i');
            if (ic) {
              ic.className = j <= selected ? 'fas fa-star' : 'far fa-star';
            }
          });
        });
        star.addEventListener('click', function() {
          container.dataset.selected = i + 1;
          var hidden = container.querySelector('input[type="hidden"]');
          if (hidden) hidden.value = i + 1;
          window.showToast && window.showToast('⭐ Rated ' + (i + 1) + '/5', 'success');
        });
      });
    });

    // ===== SHARE BUTTONS =====
    document.querySelectorAll('[data-share]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var platform = this.dataset.share;
        var url = encodeURIComponent(window.location.href);
        var text = encodeURIComponent(document.title);
        var shareUrls = {
          facebook: 'https://www.facebook.com/sharer/sharer.php?u=' + url,
          twitter:  'https://twitter.com/intent/tweet?url=' + url + '&text=' + text,
          whatsapp: 'https://wa.me/?text=' + text + '%20' + url,
          telegram: 'https://t.me/share/url?url=' + url + '&text=' + text,
          copy:     null
        };
        if (platform === 'copy') {
          navigator.clipboard && navigator.clipboard.writeText(window.location.href).then(function() {
            window.showToast && window.showToast('🔗 Link copied!', 'success');
          });
        } else if (shareUrls[platform]) {
          window.open(shareUrls[platform], '_blank', 'width=600,height=400');
        }
      });
    });

    // ===== COUPON / PROMO INPUT =====
    var couponForm = document.getElementById('couponForm');
    var couponInput = document.getElementById('couponInput');
    var couponApply = document.getElementById('couponApply');
    var VALID_COUPONS = { 'MEOW10': 10, 'SAVE20': 20, 'PET15': 15, 'WELCOME5': 5 };

    if (couponApply && couponInput) {
      couponApply.addEventListener('click', function() {
        var code = couponInput.value.trim().toUpperCase();
        if (!code) { window.showToast && window.showToast('Please enter a coupon code', 'warning'); return; }
        if (VALID_COUPONS[code] !== undefined) {
          var disc = VALID_COUPONS[code];
          window.showToast && window.showToast('🎉 Coupon applied! ' + disc + '% off your order', 'success');
          var discountEl = document.getElementById('discountAmount');
          if (discountEl) discountEl.textContent = '-' + disc + '%';
          localStorage.setItem('meowmeow-coupon', JSON.stringify({ code: code, discount: disc }));
        } else {
          window.showToast && window.showToast('❌ Invalid coupon code', 'error');
          couponInput.classList.add('error-shake');
          setTimeout(function() { couponInput.classList.remove('error-shake'); }, 600);
        }
      });
      if (couponForm) couponForm.addEventListener('submit', function(e) { e.preventDefault(); couponApply.click(); });
    }

    // ===== KEYBOARD SHORTCUTS =====
    document.addEventListener('keydown', function(e) {
      // Ctrl/Cmd+K → search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        var navSearch = document.getElementById('navSearch');
        var searchInput = document.getElementById('searchInput');
        if (navSearch) navSearch.classList.add('active');
        if (searchInput) searchInput.focus();
      }
      // T → toggle theme (not in input)
      if (e.key === 't' && !e.ctrlKey && !e.metaKey && !e.altKey &&
          e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'SELECT') {
        window.toggleTheme && window.toggleTheme();
      }
    });

    // ===== SCROLL-TO-SECTION BUTTONS =====
    document.querySelectorAll('[data-scroll-to]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var target = document.getElementById(this.dataset.scrollTo) || document.querySelector(this.dataset.scrollTo);
        if (!target) return;
        var navbar = document.getElementById('navbar');
        var offset = navbar ? navbar.offsetHeight + 16 : 80;
        window.scrollTo({ top: target.getBoundingClientRect().top + window.pageYOffset - offset, behavior: 'smooth' });
      });
    });

    // ===== PAYMENT ICON TOOLTIPS =====
    document.querySelectorAll('.fab.fa-cc-visa, .fab.fa-cc-mastercard, .fab.fa-cc-paypal, .fab.fa-cc-amex, .fab.fa-cc-stripe').forEach(function(icon) {
      var labels = {
        'fa-cc-visa': 'Visa',
        'fa-cc-mastercard': 'Mastercard',
        'fa-cc-paypal': 'PayPal',
        'fa-cc-amex': 'American Express',
        'fa-cc-stripe': 'Stripe'
      };
      for (var cls in labels) {
        if (icon.classList.contains(cls)) {
          icon.title = labels[cls];
          icon.setAttribute('aria-label', labels[cls]);
          break;
        }
      }
    });

    // ===== REVIEW READ MORE =====
    document.querySelectorAll('.review-text').forEach(function(p) {
      if (p.scrollHeight > p.clientHeight + 2) {
        var toggle = document.createElement('button');
        toggle.className = 'read-more-btn';
        toggle.textContent = 'Read more';
        toggle.style.cssText = 'background:none;border:none;color:var(--accent,#7C3AED);cursor:pointer;font-size:0.85rem;padding:0;margin-top:4px;';
        toggle.addEventListener('click', function() {
          var isExpanded = p.style.overflow !== 'hidden';
          if (!isExpanded) {
            p.style.overflow = 'hidden';
            p.style.display = '-webkit-box';
            this.textContent = 'Read more';
          } else {
            p.style.overflow = 'visible';
            p.style.display = 'block';
            this.textContent = 'Show less';
          }
        });
        p.parentNode.insertBefore(toggle, p.nextSibling);
      }
    });

  }); // end DOMContentLoaded

})();
