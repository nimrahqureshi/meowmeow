/* ============================================================
   CART.JS — FULL CART MANAGEMENT SYSTEM
   MeowMeow Premium Affiliate Shopping Platform
   ============================================================ */

(function () {
  'use strict';

  const CART_KEY    = 'meowmeow-cart';
  const WISHLIST_KEY = 'mm-wishlist';

  /* ===== STORAGE HELPERS ===== */
  function getCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch { return []; }
  }

  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    dispatchCartUpdate(cart);
  }

  function getWishlist() {
    try { return JSON.parse(localStorage.getItem(WISHLIST_KEY)) || []; }
    catch { return []; }
  }

  function saveWishlist(list) {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
  }

  /* ===== DISPATCH EVENT ===== */
  function dispatchCartUpdate(cart) {
    const count = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
    const total = cart.reduce((sum, item) => sum + (parseFloat(item.price) * (item.qty || 1)), 0);
    document.dispatchEvent(new CustomEvent('cart-updated', { detail: { cart, count, total } }));
    updateCartBadges(count);
  }

  /* ===== UPDATE BADGE ===== */
  function updateCartBadges(count) {
    document.querySelectorAll('#cartCount, #cartCountMobile, .cart-badge').forEach(badge => {
      badge.textContent = count > 99 ? '99+' : count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    });
  }

  /* ===== CART OPERATIONS ===== */
  const Cart = {

    getAll() { return getCart(); },

    add(item) {
      const cart = getCart();
      const existing = cart.find(i =>
        i.name === item.name && i.buyUrl === item.buyUrl
      );

      if (existing) {
        existing.qty = (existing.qty || 1) + (item.qty || 1);
      } else {
        cart.push({
          id:     Date.now() + Math.random(),
          name:   item.name    || 'Unknown Product',
          price:  item.price   || '0',
          imgSrc: item.imgSrc  || item.img || '',
          buyUrl: item.buyUrl  || item.url || '#',
          qty:    item.qty     || 1
        });
      }

      saveCart(cart);

      if (typeof window.showToast === 'function') {
        window.showToast(`<i class="fas fa-check-circle"></i> ${item.name || 'Item'} added to cart`, 'success');
      }

      return cart;
    },

    remove(id) {
      let cart = getCart();
      const before = cart.length;
      cart = cart.filter(i => String(i.id) !== String(id));
      if (cart.length < before) saveCart(cart);
      return cart;
    },

    updateQty(id, qty) {
      const cart = getCart();
      const item = cart.find(i => String(i.id) === String(id));
      if (item) {
        item.qty = Math.max(1, parseInt(qty) || 1);
        saveCart(cart);
      }
      return cart;
    },

    clear() {
      saveCart([]);
      if (typeof window.showToast === 'function') {
        window.showToast('Cart cleared', 'info');
      }
    },

    count() {
      return getCart().reduce((sum, item) => sum + (item.qty || 1), 0);
    },

    subtotal() {
      return getCart().reduce((sum, item) => sum + parseFloat(item.price || 0) * (item.qty || 1), 0);
    }
  };

  /* ===== WISHLIST OPERATIONS ===== */
  const Wishlist = {
    getAll() { return getWishlist(); },

    toggle(name) {
      const list = getWishlist();
      const idx  = list.indexOf(name);
      if (idx > -1) {
        list.splice(idx, 1);
        if (typeof window.showToast === 'function') {
          window.showToast(`Removed from wishlist`, 'info');
        }
      } else {
        list.push(name);
        if (typeof window.showToast === 'function') {
          window.showToast(`<i class="fas fa-heart"></i> Added to wishlist`, 'success');
        }
      }
      saveWishlist(list);
      return list.includes(name);
    },

    has(name) { return getWishlist().includes(name); },

    remove(name) {
      const list = getWishlist().filter(n => n !== name);
      saveWishlist(list);
    }
  };

  /* ===== RENDER CART PAGE ===== */
  function renderCartPage() {
    const grid = document.getElementById('cartGrid');
    if (!grid) return;

    const cart = Cart.getAll();

    if (cart.length === 0) {
      grid.innerHTML = `
        <div class="cart-empty" style="grid-column:1/-1;text-align:center;padding:80px 20px">
          <div style="font-size:4rem;margin-bottom:20px">🛒</div>
          <h2 style="font-family:var(--font-heading);font-size:1.6rem;font-weight:800;color:var(--text-primary);margin-bottom:10px">Your cart is empty</h2>
          <p style="color:var(--text-secondary);margin-bottom:28px">Browse our curated collection and add something you love!</p>
          <a href="products.html" class="btn btn-primary btn-lg">
            <i class="fas fa-shopping-bag"></i> Browse Products
          </a>
        </div>`;
      return;
    }

    const subtotal = Cart.subtotal();
    const savings  = cart.reduce((sum, item) => {
      const orig = parseFloat(item.originalPrice || item.price) * 1.3;
      return sum + (orig - parseFloat(item.price)) * (item.qty || 1);
    }, 0);
    const shipping = subtotal >= 49 ? 0 : 4.99;
    const total    = subtotal + shipping;

    grid.innerHTML = `
      <div class="cart-items-col">
        <div class="cart-header-row">
          <h2 style="font-family:var(--font-heading);font-size:1.3rem;font-weight:800;color:var(--text-primary)">
            Cart <span style="color:var(--accent)">(${cart.length} item${cart.length !== 1 ? 's' : ''})</span>
          </h2>
          <button class="btn btn-ghost btn-sm" id="clearCartBtn">
            <i class="fas fa-trash"></i> Clear All
          </button>
        </div>
        <div class="cart-list" id="cartList">
          ${cart.map(item => renderCartItem(item)).join('')}
        </div>
        ${shipping === 0
          ? `<div class="free-shipping-bar">
               <i class="fas fa-truck"></i>
               <strong>🎉 You qualify for FREE shipping!</strong>
             </div>`
          : `<div class="free-shipping-bar">
               <i class="fas fa-truck"></i>
               Add <strong>$${(49 - subtotal).toFixed(2)} more</strong> for free shipping
               <div class="shipping-progress">
                 <div class="shipping-progress-fill" style="width:${Math.min(100, (subtotal / 49) * 100)}%"></div>
               </div>
             </div>`
        }
      </div>

      <div class="cart-summary-col">
        <div class="cart-summary">
          <h3>Order Summary</h3>

          <div class="promo-section">
            <label for="promoInput">Promo Code</label>
            <div class="promo-row">
              <input type="text" id="promoInput" class="promo-input" placeholder="Enter code (e.g. MEOW10)" />
              <button class="btn btn-outline btn-sm" id="applyPromoBtn">Apply</button>
            </div>
            <div id="promoMsg" class="promo-msg"></div>
          </div>

          <div class="summary-rows">
            <div class="summary-row">
              <span>Subtotal (${cart.reduce((s, i) => s + (i.qty || 1), 0)} items)</span>
              <span>$${subtotal.toFixed(2)}</span>
            </div>
            <div class="summary-row saving" id="savingsRow" style="${savings > 0 ? '' : 'display:none'}">
              <span><i class="fas fa-tag"></i> You save</span>
              <span>-$${savings.toFixed(2)}</span>
            </div>
            <div class="summary-row" id="shippingRow">
              <span>Shipping</span>
              <span id="shippingCost">${shipping === 0 ? '<span style="color:var(--success)">FREE</span>' : '$' + shipping.toFixed(2)}</span>
            </div>
            <div class="summary-row discount-row" id="discountRow" style="display:none">
              <span>Promo discount</span>
              <span id="discountAmount" style="color:var(--success)"></span>
            </div>
            <div class="summary-divider"></div>
            <div class="summary-row summary-total">
              <span>Total</span>
              <span id="totalAmount">$${total.toFixed(2)}</span>
            </div>
          </div>

          <div class="checkout-notice">
            <i class="fas fa-info-circle"></i>
            <p>Each item will redirect you to its respective retailer (Amazon, Daraz, etc.) to complete checkout.</p>
          </div>

          <div class="checkout-btns">
            ${cart.map(item => `
              <a href="${escapeHtml(item.buyUrl)}" target="_blank" rel="noopener sponsored"
                 class="btn btn-primary btn-lg" style="width:100%;text-align:center;margin-bottom:8px"
                 onclick="window.gtag && gtag('event','checkout_click',{item_name:'${escapeHtml(item.name)}'})">
                <i class="fas fa-shopping-cart"></i>
                Buy "${truncate(item.name, 28)}"
              </a>`).join('')}
          </div>

          <div class="trust-badges">
            <div class="trust-badge"><i class="fas fa-shield-alt"></i><span>Secure Links</span></div>
            <div class="trust-badge"><i class="fas fa-lock"></i><span>Safe Checkout</span></div>
            <div class="trust-badge"><i class="fas fa-undo"></i><span>Easy Returns</span></div>
          </div>
        </div>
      </div>`;

    bindCartEvents();
  }

  function renderCartItem(item) {
    return `
      <div class="cart-item" data-id="${item.id}">
        <div class="cart-item-img">
          <img src="${escapeHtml(item.imgSrc || '')}" alt="${escapeHtml(item.name)}"
               onerror="this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&q=60'" />
        </div>
        <div class="cart-item-info">
          <h4 class="cart-item-name">${escapeHtml(item.name)}</h4>
          <div class="cart-item-price">$${parseFloat(item.price).toFixed(2)}</div>
          <div class="cart-item-actions">
            <div class="qty-wrap cart-qty">
              <button class="qty-btn qty-btn-minus" data-cart-id="${item.id}">−</button>
              <input type="number" class="qty-input" value="${item.qty || 1}" min="1" max="99"
                     data-cart-id="${item.id}" readonly />
              <button class="qty-btn qty-btn-plus" data-cart-id="${item.id}">+</button>
            </div>
            <span class="cart-item-total">$${(parseFloat(item.price) * (item.qty || 1)).toFixed(2)}</span>
            <button class="cart-remove-btn" data-cart-id="${item.id}" aria-label="Remove">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
        <a href="${escapeHtml(item.buyUrl)}" target="_blank" rel="noopener sponsored"
           class="btn btn-cta btn-sm cart-buy-btn">
          Buy Now <i class="fas fa-external-link-alt"></i>
        </a>
      </div>`;
  }

  function bindCartEvents() {
    // Minus buttons
    document.querySelectorAll('.qty-btn-minus[data-cart-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id   = btn.dataset.cartId;
        const cart = getCart();
        const item = cart.find(i => String(i.id) === id);
        if (!item) return;
        if ((item.qty || 1) <= 1) {
          Cart.remove(id);
        } else {
          Cart.updateQty(id, (item.qty || 1) - 1);
        }
        renderCartPage();
      });
    });

    // Plus buttons
    document.querySelectorAll('.qty-btn-plus[data-cart-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id   = btn.dataset.cartId;
        const item = getCart().find(i => String(i.id) === id);
        if (item) Cart.updateQty(id, (item.qty || 1) + 1);
        renderCartPage();
      });
    });

    // Remove buttons
    document.querySelectorAll('.cart-remove-btn[data-cart-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.cartId;
        // Animate out
        const row = btn.closest('.cart-item');
        if (row) {
          row.style.transition = 'opacity 0.25s, transform 0.25s';
          row.style.opacity = '0';
          row.style.transform = 'translateX(20px)';
          setTimeout(() => { Cart.remove(id); renderCartPage(); }, 260);
        } else {
          Cart.remove(id);
          renderCartPage();
        }
      });
    });

    // Clear cart
    const clearBtn = document.getElementById('clearCartBtn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (confirm('Clear your entire cart?')) {
          Cart.clear();
          renderCartPage();
        }
      });
    }

    // Promo code
    const promoBtn = document.getElementById('applyPromoBtn');
    const promoInput = document.getElementById('promoInput');
    if (promoBtn && promoInput) {
      promoBtn.addEventListener('click', () => {
        const code    = promoInput.value.trim().toUpperCase();
        const msg     = document.getElementById('promoMsg');
        const discRow = document.getElementById('discountRow');
        const discAmt = document.getElementById('discountAmount');
        const totalEl = document.getElementById('totalAmount');
        const sub     = Cart.subtotal();
        const ship    = sub >= 49 ? 0 : 4.99;

        const codes = {
          'MEOW10': 0.10,
          'SAVE15': 0.15,
          'MEOW20': 0.20,
          'WELCOME': 0.10
        };

        if (codes[code]) {
          const discount = sub * codes[code];
          const newTotal = sub + ship - discount;
          if (discRow) discRow.style.display = '';
          if (discAmt) discAmt.textContent = `-$${discount.toFixed(2)}`;
          if (totalEl) totalEl.textContent = `$${newTotal.toFixed(2)}`;
          if (msg) { msg.textContent = `✓ "${code}" applied! ${Math.round(codes[code] * 100)}% off`; msg.className = 'promo-msg success'; }
          promoInput.disabled = true;
          promoBtn.disabled   = true;
          promoBtn.textContent = 'Applied';
          if (typeof window.showToast === 'function') {
            window.showToast(`🎉 Promo code "${code}" applied!`, 'success');
          }
        } else if (!code) {
          if (msg) { msg.textContent = 'Please enter a promo code.'; msg.className = 'promo-msg error'; }
        } else {
          if (msg) { msg.textContent = `"${code}" is not a valid code.`; msg.className = 'promo-msg error'; }
        }
      });

      // Allow enter key
      promoInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') promoBtn.click();
      });
    }
  }

  /* ===== WISHLIST BUTTON BINDING ===== */
  function bindWishlistButtons() {
    document.querySelectorAll('.btn-wishlist').forEach(btn => {
      const card = btn.closest('.product-card');
      const name = card?.querySelector('.product-name')?.textContent?.trim() || '';
      const icon = btn.querySelector('i');

      // Restore state
      if (name && Wishlist.has(name)) {
        btn.classList.add('wishlisted');
        if (icon) { icon.className = 'fas fa-heart'; }
      }

      btn.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        const isNow = Wishlist.toggle(name);
        btn.classList.toggle('wishlisted', isNow);
        if (icon) {
          icon.className = isNow ? 'fas fa-heart' : 'far fa-heart';
          icon.style.transform = 'scale(1.4)';
          setTimeout(() => { icon.style.transform = ''; }, 300);
        }
      });
    });
  }

  /* ===== ADD TO CART BUTTONS ===== */
  function bindAddToCartButtons() {
    document.querySelectorAll('[data-add-cart]').forEach(btn => {
      btn.addEventListener('click', e => {
        // Don't prevent default if it's an <a> tag going to a buy URL
        // Only intercept if it's a button
        if (btn.tagName === 'BUTTON') {
          e.preventDefault();
        }

        const name   = btn.dataset.name   || btn.closest('.product-card')?.querySelector('.product-name')?.textContent?.trim() || 'Product';
        const price  = btn.dataset.price  || btn.closest('.product-card')?.querySelector('.product-price')?.textContent?.replace(/[^0-9.]/g, '') || '0';
        const img    = btn.dataset.img    || btn.closest('.product-card')?.querySelector('img')?.src || '';
        const buyUrl = btn.dataset.url    || btn.href || btn.closest('[data-buy-url]')?.dataset.buyUrl || '#';

        Cart.add({ name, price, imgSrc: img, buyUrl });

        // Micro-animation on button
        const original = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> Added!';
        btn.style.background = 'var(--success)';
        setTimeout(() => {
          btn.innerHTML = original;
          btn.style.background = '';
        }, 1500);
      });
    });
  }

  /* ===== UTILS ===== */
  function escapeHtml(str) {
    return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function truncate(str, len) {
    return str && str.length > len ? str.slice(0, len) + '…' : (str || '');
  }

  /* ===== INIT ===== */
  function init() {
    // Initial badge update
    updateCartBadges(Cart.count());

    // Bind add-to-cart buttons
    bindAddToCartButtons();

    // Bind wishlist buttons
    bindWishlistButtons();

    // Render cart page if we're on it
    if (document.getElementById('cartGrid')) {
      renderCartPage();
    }

    // Listen for DOM mutations (for dynamically added cards)
    const observer = new MutationObserver(() => {
      bindAddToCartButtons();
      bindWishlistButtons();
    });

    const productsGrid = document.querySelector('.products-grid, #productsGrid');
    if (productsGrid) {
      observer.observe(productsGrid, { childList: true, subtree: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* ===== PUBLIC API ===== */
  window.MeowCart = Cart;
  window.MeowWishlist = Wishlist;
  window.initCartPage = renderCartPage;

  // Legacy compatibility (used by script.js)
  window.updateCartCount = () => updateCartBadges(Cart.count());

})();
