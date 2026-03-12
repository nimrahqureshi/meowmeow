/* ============================
   CART.JS — SHOPPING CART SYSTEM
   Persists via localStorage
   ============================ */

(function() {
  'use strict';

  const STORAGE_KEY = 'meowmeow-cart';

  /* ─────────────────────────────
     CART STATE
  ───────────────────────────── */

  function loadCart() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch(e) {
      return [];
    }
  }

  function saveCart(cart) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch(e) {}
  }

  let cart = loadCart();

  /* ─────────────────────────────
     CART BADGE UPDATE
  ───────────────────────────── */

  function updateCartBadge() {
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    document.querySelectorAll('#cartCount, .cart-badge').forEach(el => {
      const prev = parseInt(el.textContent) || 0;
      el.textContent = totalItems;
      if (prev !== totalItems) {
        el.classList.remove('badge-bounce');
        void el.offsetWidth; // reflow
        el.classList.add('badge-bounce');
        setTimeout(() => el.classList.remove('badge-bounce'), 400);
      }
    });
  }

  /* ─────────────────────────────
     ADD ITEM
  ───────────────────────────── */

  function addToCart(product) {
    // product: { id, name, price, image, marketplace, url }
    const existing = cart.find(i => i.id === product.id);
    if (existing) {
      existing.qty = Math.min(existing.qty + 1, 99);
    } else {
      cart.push({ ...product, qty: 1 });
    }
    saveCart(cart);
    updateCartBadge();
    renderCart();
    if (typeof window.showToast === 'function') {
      window.showToast(`🛒 "${product.name}" added to cart!`, 'success');
    }
  }

  /* ─────────────────────────────
     REMOVE ITEM
  ───────────────────────────── */

  function removeItem(id) {
    const idx = cart.findIndex(i => i.id === id);
    if (idx === -1) return;

    const itemEl = document.querySelector(`.cart-item[data-id="${id}"]`);
    if (itemEl) {
      itemEl.classList.add('cart-item-removing');
      setTimeout(() => {
        cart.splice(idx, 1);
        saveCart(cart);
        updateCartBadge();
        renderCart();
      }, 420);
    } else {
      cart.splice(idx, 1);
      saveCart(cart);
      updateCartBadge();
      renderCart();
    }

    if (typeof window.showToast === 'function') {
      window.showToast('Item removed from cart', 'warning');
    }
  }

  /* ─────────────────────────────
     CHANGE QUANTITY
  ───────────────────────────── */

  function changeQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.qty = Math.max(1, Math.min(99, item.qty + delta));
    saveCart(cart);
    updateCartBadge();
    renderCart();
  }

  /* ─────────────────────────────
     CLEAR CART
  ───────────────────────────── */

  function clearCart() {
    cart = [];
    saveCart(cart);
    updateCartBadge();
    renderCart();
    if (typeof window.showToast === 'function') {
      window.showToast('Cart cleared', 'info');
    }
  }

  /* ─────────────────────────────
     TOTALS
  ───────────────────────────── */

  function getSubtotal() {
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  }

  function getTax(subtotal) {
    return subtotal * 0.08;
  }

  function formatPrice(num) {
    return '$' + num.toFixed(2);
  }

  /* ─────────────────────────────
     RENDER CART PAGE
  ───────────────────────────── */

  function renderCart() {
    const cartItemsEl  = document.getElementById('cartItems');
    const emptyStateEl = document.getElementById('cartEmpty');
    const cartGridEl   = document.querySelector('.cart-grid');

    if (!cartItemsEl) return; // Not on cart page

    // Update summary numbers
    const subtotal = getSubtotal();
    const tax      = getTax(subtotal);
    const total    = subtotal + tax;

    const itemCountEl   = document.getElementById('itemCount');
    const subtotalEl    = document.getElementById('cartSubtotal');
    const taxEl         = document.getElementById('cartTax');
    const totalEl       = document.getElementById('cartTotal');

    if (itemCountEl)  itemCountEl.textContent  = cart.reduce((s, i) => s + i.qty, 0);
    if (subtotalEl)   subtotalEl.textContent   = formatPrice(subtotal);
    if (taxEl)        taxEl.textContent        = formatPrice(tax);
    if (totalEl)      totalEl.innerHTML        = `<strong>${formatPrice(total)}</strong>`;

    // Empty state
    if (cart.length === 0) {
      if (cartGridEl)   cartGridEl.style.display   = 'none';
      if (emptyStateEl) emptyStateEl.style.display = 'block';
      return;
    }

    if (cartGridEl)   cartGridEl.style.display   = '';
    if (emptyStateEl) emptyStateEl.style.display = 'none';

    // Build cart items HTML
    cartItemsEl.innerHTML = cart.map(item => `
      <div class="cart-item card-enter" data-id="${escapeHtml(String(item.id))}">
        <img src="${escapeHtml(item.image)}"
             alt="${escapeHtml(item.name)}"
             onerror="this.src='https://via.placeholder.com/80x80/f3f4f6/9ca3af?text=No+Image'" />
        <div class="cart-item-details">
          <h4>${escapeHtml(item.name)}</h4>
          <div class="product-marketplace">
            <i class="fas fa-globe"></i> ${escapeHtml(item.marketplace || 'Online Store')}
          </div>
          <div class="quantity-controls">
            <button class="qty-minus" data-id="${item.id}" aria-label="Decrease quantity">−</button>
            <span aria-label="Quantity">${item.qty}</span>
            <button class="qty-plus" data-id="${item.id}" aria-label="Increase quantity">+</button>
          </div>
        </div>
        <div style="text-align:right; display:flex; flex-direction:column; align-items:flex-end; gap:8px;">
          <span class="cart-price">${formatPrice(item.price * item.qty)}</span>
          <span style="font-size:0.8rem; color:var(--text-tertiary);">${formatPrice(item.price)} each</span>
          <button class="remove-item" data-id="${item.id}" aria-label="Remove ${escapeHtml(item.name)} from cart">
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>
      </div>
    `).join('');

    // Attach events to new elements
    cartItemsEl.querySelectorAll('.qty-minus').forEach(btn => {
      btn.addEventListener('click', () => changeQty(btn.dataset.id, -1));
    });
    cartItemsEl.querySelectorAll('.qty-plus').forEach(btn => {
      btn.addEventListener('click', () => changeQty(btn.dataset.id, +1));
    });
    cartItemsEl.querySelectorAll('.remove-item').forEach(btn => {
      btn.addEventListener('click', () => removeItem(btn.dataset.id));
    });
  }

  /* ─────────────────────────────
     ADD-TO-CART BUTTONS (all pages)
  ───────────────────────────── */

  function bindAddToCartButtons() {
    document.querySelectorAll('[data-add-to-cart]:not([data-cart-bound])').forEach(btn => {
      btn.setAttribute('data-cart-bound', '1');
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        const card = this.closest('.product-card') || this.closest('[data-product-id]');
        if (!card) return;

        const product = {
          id:          card.dataset.productId || card.dataset.id || Date.now().toString(),
          name:        card.querySelector('.product-name')?.textContent?.trim()     || 'Product',
          price:       parseFloat(card.dataset.price)  || parseFloat(card.querySelector('.price-current')?.textContent?.replace(/[^0-9.]/g, '')) || 0,
          image:       card.querySelector('img')?.src   || '',
          marketplace: card.querySelector('.product-marketplace')?.textContent?.trim() || 'Online',
          url:         card.querySelector('a[href]')?.href || '#'
        };

        addToCart(product);
      });
    });
  }

  /* ─────────────────────────────
     CHECKOUT BUTTON
  ───────────────────────────── */

  function bindCheckout() {
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (!checkoutBtn) return;

    checkoutBtn.addEventListener('click', function() {
      if (cart.length === 0) {
        if (typeof window.showToast === 'function') {
          window.showToast('Your cart is empty!', 'warning');
        }
        return;
      }
      // Redirect to first affiliate link in cart (affiliate store pattern)
      const firstItem = cart[0];
      if (firstItem && firstItem.url && firstItem.url !== '#') {
        window.open(firstItem.url, '_blank', 'noopener,noreferrer');
      }
      if (typeof window.showToast === 'function') {
        window.showToast('Redirecting to store to complete your purchase...', 'info');
      }
    });
  }

  /* ─────────────────────────────
     CLEAR CART BUTTON
  ───────────────────────────── */

  function bindClearCart() {
    const clearBtn = document.getElementById('clearCartBtn');
    if (!clearBtn) return;
    clearBtn.addEventListener('click', () => {
      if (confirm('Clear all items from your cart?')) clearCart();
    });
  }

  /* ─────────────────────────────
     XSS HELPER
  ───────────────────────────── */

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* ─────────────────────────────
     EXPOSE PUBLIC API
  ───────────────────────────── */

  window.MeowCart = {
    add:     addToCart,
    remove:  removeItem,
    clear:   clearCart,
    getCart: () => [...cart],
    getTotal: () => getSubtotal() + getTax(getSubtotal())
  };

  /* ─────────────────────────────
     INIT
  ───────────────────────────── */

  document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
    renderCart();
    bindAddToCartButtons();
    bindCheckout();
    bindClearCart();

    // Re-bind if new products are injected dynamically
    const observer = new MutationObserver(() => bindAddToCartButtons());
    observer.observe(document.body, { childList: true, subtree: true });
  });

})();
