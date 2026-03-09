/* ============================
   MAIN.JS — GLOBAL UTILITIES & STATE
   ============================ */

'use strict';

// ===== GLOBAL STATE =====
window.MeowMeow = {
  cart: JSON.parse(localStorage.getItem('mm-cart') || '[]'),
  wishlist: JSON.parse(localStorage.getItem('mm-wishlist') || '[]'),
  settings: JSON.parse(localStorage.getItem('mm-settings') || '{}'),

  saveCart() {
    localStorage.setItem('mm-cart', JSON.stringify(this.cart));
    this.updateCartBadge();
  },

  saveWishlist() {
    localStorage.setItem('mm-wishlist', JSON.stringify(this.wishlist));
    this.updateWishlistBadge();
  },

  addToCart(product) {
    const existing = this.cart.find(i => i.id === product.id);
    if (existing) {
      existing.qty += 1;
    } else {
      this.cart.push({ ...product, qty: 1 });
    }
    this.saveCart();
    showToast(`<strong>${product.name}</strong> added to cart!`, 'success', '🛍️');
    this.renderCartDropdown();
  },

  removeFromCart(id) {
    this.cart = this.cart.filter(i => i.id !== id);
    this.saveCart();
    this.renderCartDropdown();
  },

  updateQty(id, delta) {
    const item = this.cart.find(i => i.id === id);
    if (item) {
      item.qty = Math.max(1, item.qty + delta);
      this.saveCart();
      this.renderCartDropdown();
    }
  },

  getCartTotal() {
    return this.cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
  },

  getCartCount() {
    return this.cart.reduce((sum, i) => sum + i.qty, 0);
  },

  toggleWishlist(product) {
    const idx = this.wishlist.findIndex(i => i.id === product.id);
    if (idx > -1) {
      this.wishlist.splice(idx, 1);
      showToast(`Removed from wishlist`, 'warning', '💔');
      return false;
    } else {
      this.wishlist.push(product);
      showToast(`<strong>${product.name}</strong> saved to wishlist!`, 'success', '❤️');
      return true;
    }
    this.saveWishlist();
  },

  isInWishlist(id) {
    return this.wishlist.some(i => i.id === id);
  },

  updateCartBadge() {
    const count = this.getCartCount();
    document.querySelectorAll('.cart-badge, [data-cart-count]').forEach(el => {
      el.textContent = count;
      el.style.display = count > 0 ? 'flex' : 'none';
    });
  },

  updateWishlistBadge() {
    const count = this.wishlist.length;
    document.querySelectorAll('.wishlist-badge, [data-wishlist-count]').forEach(el => {
      el.textContent = count;
      el.style.display = count > 0 ? 'flex' : 'none';
    });
  },

  renderCartDropdown() {
    const list = document.getElementById('cartItemsList');
    const totalEl = document.getElementById('cartDropdownTotal');
    if (!list) return;

    if (this.cart.length === 0) {
      list.innerHTML = `
        <div class="cart-drop-empty">
          <i class="fas fa-shopping-bag"></i>
          <p>Your cart is empty</p>
        </div>`;
    } else {
      list.innerHTML = this.cart.map(item => `
        <div class="cart-drop-item">
          <img class="cart-drop-img" src="${item.image}" alt="${item.name}">
          <div class="cart-drop-info">
            <div class="cart-drop-name">${item.name}</div>
            <div class="cart-drop-qty">Qty: ${item.qty}</div>
          </div>
          <div class="cart-drop-price">$${(item.price * item.qty).toFixed(2)}</div>
          <button class="cart-drop-remove" onclick="MeowMeow.removeFromCart('${item.id}')">
            <i class="fas fa-times"></i>
          </button>
        </div>
      `).join('');
    }

    if (totalEl) totalEl.textContent = `$${this.getCartTotal().toFixed(2)}`;
  }
};

// ===== TOAST SYSTEM =====
window.showToast = function(message, type = 'info', icon = '') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  const displayIcon = icon || icons[type] || 'ℹ️';

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${displayIcon}</span>
    <span class="toast-msg">${message}</span>
    <button class="toast-close" onclick="this.parentElement.classList.add('fade-out'); setTimeout(()=>this.parentElement.remove(),300)">
      <i class="fas fa-times"></i>
    </button>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    if (toast.parentNode) {
      toast.classList.add('fade-out');
      setTimeout(() => { if (toast.parentNode) toast.remove(); }, 300);
    }
  }, 4000);
};

// ===== NOTIFICATION SYSTEM =====
window.showNotification = function(title, message, type = 'info') {
  showToast(`<strong>${title}</strong>: ${message}`, type);
};

// ===== INIT =====
document.addEventListener('DOMContentLoaded', function() {
  // Init cart & wishlist badges
  window.MeowMeow.updateCartBadge();
  window.MeowMeow.updateWishlistBadge();
  window.MeowMeow.renderCartDropdown();

  // Console branding
  console.log(
    '%c👗 MeowMeow %c Fashion Store v2.0 ',
    'background: linear-gradient(135deg, #C026D3, #7C3AED); color: #fff; font-size: 16px; font-weight: 900; padding: 8px 14px; border-radius: 10px 0 0 10px;',
    'background: #0D0D14; color: #E879F9; font-size: 13px; padding: 8px 14px; border-radius: 0 10px 10px 0;'
  );
});
