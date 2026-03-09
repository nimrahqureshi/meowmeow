/* ============================================================
   SCRIPT.JS — PAGE-SPECIFIC & CART FUNCTIONALITY
   ============================================================ */

(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {

    // ===== CART PAGE =====
    if (document.querySelector('.cart-page')) {
      initCartPage();
    }

    // ===== PRODUCTS PAGE FILTER =====
    if (document.querySelector('.products-page')) {
      initProductFilter();
    }

    // ===== QUICK VIEW MODAL =====
    initQuickView();

    // ===== WISHLIST PERSISTENCE =====
    initWishlist();

  });

  // ----- CART PAGE -----
  function initCartPage() {
    const cartContainer = document.getElementById('cartItems');
    const emptyState    = document.getElementById('emptyCart');
    const cartSection   = document.getElementById('cartSection');
    const subtotalEl    = document.getElementById('cartSubtotal');
    const totalEl       = document.getElementById('cartTotal');
    const countEl       = document.getElementById('cartItemCount');

    function getCart() {
      return JSON.parse(localStorage.getItem('meowmeow-cart') || '[]');
    }

    function saveCart(cart) {
      localStorage.setItem('meowmeow-cart', JSON.stringify(cart));
      window.updateCartCount?.();
    }

    function renderCart() {
      const cart = getCart();

      if (!cart.length) {
        if (emptyState)  emptyState.style.display = 'block';
        if (cartSection) cartSection.style.display = 'none';
        return;
      }

      if (emptyState)  emptyState.style.display  = 'none';
      if (cartSection) cartSection.style.display = 'block';

      if (!cartContainer) return;

      cartContainer.innerHTML = cart.map((item, i) => `
        <div class="cart-item" data-index="${i}">
          <img class="cart-item-img" src="${item.imgSrc || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80&h=80&fit=crop'}" alt="${item.name}">
          <div class="cart-item-details">
            <h4>${item.name}</h4>
            <div class="cart-item-platform"><i class="fas fa-globe"></i> Via Partner Store</div>
            <div class="cart-item-price">${item.price}</div>
            <div class="quantity-controls">
              <button class="qty-btn" data-action="minus" data-index="${i}">−</button>
              <span class="qty-display">${item.qty || 1}</span>
              <button class="qty-btn" data-action="plus" data-index="${i}">+</button>
            </div>
          </div>
          <button class="remove-item" data-index="${i}" aria-label="Remove">
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>
      `).join('');

      // Update totals
      const total = cart.reduce((sum, item) => {
        const price = parseFloat(item.price.replace(/[^0-9.]/g, '')) || 0;
        return sum + price * (item.qty || 1);
      }, 0);

      if (subtotalEl) subtotalEl.textContent = `$${total.toFixed(2)}`;
      if (totalEl)    totalEl.textContent    = `$${total.toFixed(2)}`;
      if (countEl)    countEl.textContent    = cart.reduce((s, i) => s + (i.qty||1), 0);
    }

    // Event delegation for cart actions
    document.addEventListener('click', function(e) {
      // Qty change
      const qtyBtn = e.target.closest('.qty-btn');
      if (qtyBtn) {
        const index  = parseInt(qtyBtn.dataset.index, 10);
        const action = qtyBtn.dataset.action;
        const cart   = getCart();
        if (action === 'plus')  cart[index].qty = (cart[index].qty || 1) + 1;
        if (action === 'minus') {
          cart[index].qty = Math.max(1, (cart[index].qty || 1) - 1);
        }
        saveCart(cart);
        renderCart();
      }

      // Remove
      const removeBtn = e.target.closest('.remove-item');
      if (removeBtn) {
        const index = parseInt(removeBtn.dataset.index, 10);
        const cart  = getCart();
        const name  = cart[index]?.name || 'Item';
        cart.splice(index, 1);
        saveCart(cart);
        renderCart();
        window.showToast?.(`Removed "${name}"`, 'warning');
      }

      // Clear all
      if (e.target.closest('#clearCart')) {
        if (confirm('Clear entire cart?')) {
          saveCart([]);
          renderCart();
          window.showToast?.('Cart cleared', 'info');
        }
      }
    });

    renderCart();
  }

  // ----- PRODUCT FILTER -----
  function initProductFilter() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card');

    filterBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        filterBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        const filter = this.dataset.filter || 'all';

        productCards.forEach(card => {
          const cat = card.dataset.category || '';
          if (filter === 'all' || cat === filter || cat.includes(filter)) {
            card.style.display = '';
            card.style.animation = 'fadeInUp 0.4s ease';
          } else {
            card.style.display = 'none';
          }
        });

        // Update count
        const visible = [...productCards].filter(c => c.style.display !== 'none').length;
        const countEl = document.getElementById('productsCount');
        if (countEl) countEl.textContent = visible;
      });
    });

    // Subcategory buttons
    document.querySelectorAll('.subcategory-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        document.querySelectorAll('.subcategory-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
      });
    });
  }

  // ----- QUICK VIEW -----
  function initQuickView() {
    // Modal HTML is injected once
    if (!document.getElementById('quickViewModal')) {
      const html = `
        <div class="modal-overlay" id="quickViewModal">
          <div class="modal" style="max-width:680px">
            <div class="modal-header">
              <h3>Quick View</h3>
              <button class="modal-close" aria-label="Close"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">
              <div class="quick-view-grid">
                <div class="quick-view-image">
                  <img id="qv-img" src="" alt="Product" loading="lazy">
                </div>
                <div class="quick-view-info">
                  <h2 id="qv-name"></h2>
                  <div id="qv-source" style="font-size:0.8rem;color:var(--text-tertiary);margin-bottom:12px"></div>
                  <div class="product-rating" style="margin-bottom:12px">
                    <div class="stars"><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star-half-alt"></i></div>
                    <span class="rating-count">(${Math.floor(Math.random()*2000)+200} reviews)</span>
                  </div>
                  <div class="price-current" id="qv-price" style="font-size:1.8rem;font-family:var(--font-heading);font-weight:900;background:var(--gradient-primary);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:16px;display:block"></div>
                  <p style="font-size:0.88rem;color:var(--text-secondary);margin-bottom:20px">Click "Buy Now" to view this product on our partner store. Prices may vary.</p>
                  <a id="qv-buy" href="#" target="_blank" rel="noopener noreferrer sponsored" class="btn btn-cta btn-block" style="margin-bottom:10px">
                    <i class="fas fa-shopping-cart"></i> Buy Now — Best Price
                  </a>
                  <p style="font-size:0.75rem;color:var(--text-muted);text-align:center"><i class="fas fa-shield-alt"></i> Affiliate link — no extra cost to you</p>
                </div>
              </div>
            </div>
          </div>
        </div>`;
      document.body.insertAdjacentHTML('beforeend', html);
    }
  }

  // ----- WISHLIST PERSISTENCE -----
  function initWishlist() {
    const saved = JSON.parse(localStorage.getItem('mm-wishlist') || '[]');

    document.querySelectorAll('.wishlist-toggle').forEach(btn => {
      const card = btn.closest('.product-card');
      const name = card?.querySelector('.product-name')?.textContent?.trim();

      if (name && saved.includes(name)) {
        btn.classList.add('active');
        const icon = btn.querySelector('i');
        if (icon) { icon.classList.remove('far'); icon.classList.add('fas'); }
      }
    });

    document.addEventListener('click', function(e) {
      const btn = e.target.closest('.wishlist-toggle');
      if (!btn) return;

      const card = btn.closest('.product-card');
      const name = card?.querySelector('.product-name')?.textContent?.trim();
      if (!name) return;

      const list = JSON.parse(localStorage.getItem('mm-wishlist') || '[]');

      if (btn.classList.contains('active')) {
        const idx = list.indexOf(name);
        if (idx > -1) list.splice(idx, 1);
      } else {
        if (!list.includes(name)) list.push(name);
      }

      localStorage.setItem('mm-wishlist', JSON.stringify(list));
    });
  }

})();
