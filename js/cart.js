/* =============================================
   CART.JS — CART MANAGEMENT WITH LOCALSTORAGE
   ============================================= */

(function() {
  'use strict';

  window.MeowCart = {
    items: [],

    load() {
      try { this.items = JSON.parse(localStorage.getItem('mm-cart')) || []; } catch { this.items = []; }
      this.updateBadge();
    },

    save() {
      localStorage.setItem('mm-cart', JSON.stringify(this.items));
      this.updateBadge();
    },

    add(product) {
      const existing = this.items.find(i => i.id === product.id);
      if (existing) {
        existing.qty = Math.min(existing.qty + 1, 99);
      } else {
        this.items.push({ ...product, qty: 1 });
      }
      this.save();
      window.showToast && showToast(`🛒 ${product.name} added to cart!`, 'success');
      const badge = document.getElementById('cartCount');
      if (badge) { badge.classList.add('bump'); setTimeout(() => badge.classList.remove('bump'), 400); }
    },

    remove(id) {
      this.items = this.items.filter(i => i.id !== id);
      this.save();
    },

    updateQty(id, delta) {
      const item = this.items.find(i => i.id === id);
      if (!item) return;
      item.qty = Math.max(1, Math.min(99, item.qty + delta));
      this.save();
    },

    total() {
      return this.items.reduce((sum, i) => sum + parseFloat(i.price) * i.qty, 0);
    },

    count() {
      return this.items.reduce((sum, i) => sum + i.qty, 0);
    },

    clear() {
      this.items = [];
      this.save();
    },

    updateBadge() {
      const c = this.count();
      document.querySelectorAll('#cartCount, #mobileCartCount').forEach(el => {
        if (el) el.textContent = c > 99 ? '99+' : c;
      });
    }
  };

  // Load cart on startup
  document.addEventListener('DOMContentLoaded', () => {
    window.MeowCart.load();

    // Render cart page if we're on cart.html
    if (window.location.pathname.includes('cart')) {
      renderCart();
    }

    // Add to cart buttons
    document.querySelectorAll('.add-to-cart').forEach(btn => {
      btn.addEventListener('click', function() {
        const card = this.closest('[data-product]');
        if (!card) return;
        try {
          const p = JSON.parse(card.getAttribute('data-product'));
          window.MeowCart.add(p);
        } catch {}
      });
    });
  });

  function renderCart() {
    const container = document.getElementById('cartContainer');
    if (!container) return;

    function render() {
      const cart = window.MeowCart;
      if (!cart.items.length) {
        container.innerHTML = `
          <div class="cart-empty">
            <div class="cart-empty-icon"><i class="fas fa-shopping-cart"></i></div>
            <h3>Your cart is empty</h3>
            <p>Discover amazing products and add them to your cart.</p>
            <a href="products.html" class="btn btn-primary btn-lg">
              <i class="fas fa-th-large"></i> Browse Products
            </a>
          </div>`;
        return;
      }

      const itemsHTML = cart.items.map(item => `
        <div class="cart-item" data-id="${item.id}">
          <img src="${item.img}" alt="${item.name}" loading="lazy" />
          <div class="cart-item-details">
            <h4>${item.name}</h4>
            <div class="mp-tag"><i class="fas fa-store"></i> ${item.platform || 'External Store'}</div>
            <div class="qty-controls">
              <button class="qty-btn" onclick="MeowCart.updateQty('${item.id}',-1);renderCartUI()">−</button>
              <span class="qty-display">${item.qty}</span>
              <button class="qty-btn" onclick="MeowCart.updateQty('${item.id}',1);renderCartUI()">+</button>
            </div>
          </div>
          <div class="cart-price">$${(parseFloat(item.price) * item.qty).toFixed(2)}</div>
          <button class="remove-item" onclick="MeowCart.remove('${item.id}');renderCartUI()" aria-label="Remove">
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>
      `).join('');

      const total   = cart.total().toFixed(2);
      const savings = (cart.items.reduce((s,i) => s + (parseFloat(i.originalPrice || i.price) * i.qty), 0) - cart.total()).toFixed(2);

      container.innerHTML = `
        <div class="cart-grid">
          <div class="cart-items">
            <h2 style="margin-bottom:24px;font-family:var(--font-display)">Shopping Cart <span style="font-size:1rem;color:var(--text-tertiary);font-family:var(--font-mono)">(${cart.count()} items)</span></h2>
            ${itemsHTML}
          </div>
          <div class="summary-card">
            <h3><i class="fas fa-receipt"></i> Order Summary</h3>
            <div class="summary-row"><span>Subtotal</span><strong>$${total}</strong></div>
            ${parseFloat(savings) > 0 ? `<div class="summary-row"><span>You Save</span><strong style="color:var(--success)">-$${savings}</strong></div>` : ''}
            <div class="summary-row"><span>Shipping</span><span class="tag-free">FREE</span></div>
            <div class="divider"></div>
            <div class="summary-row summary-total"><span>Total</span><strong>$${total}</strong></div>
            <a href="products.html" class="btn btn-primary btn-block" style="margin-top:20px">
              <i class="fas fa-external-link-alt"></i> Continue to Store
            </a>
            <p style="font-size:0.75rem;text-align:center;margin-top:12px;color:var(--text-tertiary);font-family:var(--font-mono)">
              You'll complete purchase on the seller's site
            </p>
            <div style="display:flex;justify-content:center;gap:12px;font-size:1.4rem;color:var(--text-tertiary);margin-top:16px">
              <i class="fab fa-cc-visa"></i>
              <i class="fab fa-cc-mastercard"></i>
              <i class="fab fa-cc-paypal"></i>
              <i class="fab fa-cc-apple-pay"></i>
            </div>
          </div>
        </div>`;
    }

    window.renderCartUI = render;
    render();
  }

})();
