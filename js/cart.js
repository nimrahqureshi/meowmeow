/* ============================
   CART.JS — SHOPPING CART SYSTEM  (FIXED v2)
   ============================ */

(function () {
  'use strict';

  var STORAGE_KEY = 'meowmeow-cart';

  function loadCart() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch (e) { return []; }
  }

  function saveCart(cart) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); } catch (e) {}
  }

  var cart = loadCart();

  /* ─── BADGE UPDATE ─── */
  function updateCartBadge() {
    var total = cart.reduce(function (s, i) { return s + i.qty; }, 0);
    document.querySelectorAll('#cartCount, .cart-badge').forEach(function (el) {
      var prev = parseInt(el.textContent) || 0;
      el.textContent = total;
      if (prev !== total) {
        el.classList.remove('badge-bounce');
        void el.offsetWidth;
        el.classList.add('badge-bounce');
        setTimeout(function () { el.classList.remove('badge-bounce'); }, 400);
      }
    });
  }

  /* ─── ADD ─── */
  function addToCart(product) {
    var existing = null;
    for (var i = 0; i < cart.length; i++) {
      if (cart[i].id === product.id) { existing = cart[i]; break; }
    }
    if (existing) {
      existing.qty = Math.min(existing.qty + 1, 99);
    } else {
      var item = {
        id: product.id, name: product.name, price: product.price,
        image: product.image, marketplace: product.marketplace,
        url: product.url, qty: 1
      };
      cart.push(item);
    }
    saveCart(cart);
    updateCartBadge();
    renderCart();
    if (typeof window.showToast === 'function') {
      window.showToast('\uD83D\uDED2 "' + product.name + '" added to cart!', 'success');
    }
  }

  /* ─── REMOVE ─── */
  function removeItem(id) {
    var idx = -1;
    for (var i = 0; i < cart.length; i++) { if (cart[i].id === id) { idx = i; break; } }
    if (idx === -1) return;

    var itemEl = document.querySelector('.cart-item[data-id="' + id + '"]');
    if (itemEl) {
      itemEl.classList.add('cart-item-removing');
      setTimeout(function () {
        cart.splice(idx, 1);
        saveCart(cart); updateCartBadge(); renderCart();
      }, 420);
    } else {
      cart.splice(idx, 1);
      saveCart(cart); updateCartBadge(); renderCart();
    }

    if (typeof window.showToast === 'function') {
      window.showToast('Item removed from cart', 'warning');
    }
  }

  /* ─── QTY ─── */
  function changeQty(id, delta) {
    for (var i = 0; i < cart.length; i++) {
      if (cart[i].id === id) {
        cart[i].qty = Math.max(1, Math.min(99, cart[i].qty + delta));
        break;
      }
    }
    saveCart(cart); updateCartBadge(); renderCart();
  }

  /* ─── CLEAR ─── */
  function clearCart() {
    cart = [];
    saveCart(cart); updateCartBadge(); renderCart();
    if (typeof window.showToast === 'function') window.showToast('Cart cleared', 'info');
  }

  /* ─── TOTALS ─── */
  function getSubtotal() {
    return cart.reduce(function (s, i) { return s + i.price * i.qty; }, 0);
  }

  function getTax(sub) { return sub * 0.08; }

  function fmt(n) { return '$' + n.toFixed(2); }

  function esc(s) {
    return String(s)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  /* ─── RENDER CART PAGE ─── */
  function renderCart() {
    var cartItemsEl  = document.getElementById('cartItems');
    var emptyStateEl = document.getElementById('cartEmpty');
    var cartGridEl   = document.querySelector('.cart-grid');
    if (!cartItemsEl) return;

    var sub   = getSubtotal();
    var tax   = getTax(sub);
    var total = sub + tax;

    var el;
    el = document.getElementById('itemCount');    if (el) el.textContent = cart.reduce(function(s,i){return s+i.qty;},0);
    el = document.getElementById('cartSubtotal'); if (el) el.textContent = fmt(sub);
    el = document.getElementById('cartTax');      if (el) el.textContent = fmt(tax);
    el = document.getElementById('cartTotal');    if (el) el.innerHTML   = '<strong>' + fmt(total) + '</strong>';

    if (cart.length === 0) {
      if (cartGridEl)   cartGridEl.style.display   = 'none';
      if (emptyStateEl) emptyStateEl.style.display = 'block';
      return;
    }

    if (cartGridEl)   cartGridEl.style.display   = '';
    if (emptyStateEl) emptyStateEl.style.display = 'none';

    cartItemsEl.innerHTML = cart.map(function (item) {
      return '<div class="cart-item card-enter" data-id="' + esc(String(item.id)) + '">' +
        '<img src="' + esc(item.image) + '" alt="' + esc(item.name) + '"' +
          ' onerror="this.src=\'https://via.placeholder.com/80x80/f3f4f6/9ca3af?text=No+Image\'" />' +
        '<div class="cart-item-details">' +
          '<h4>' + esc(item.name) + '</h4>' +
          '<div class="product-marketplace"><i class="fas fa-globe"></i> ' + esc(item.marketplace || 'Online Store') + '</div>' +
          '<div class="quantity-controls">' +
            '<button class="qty-minus" data-id="' + item.id + '" aria-label="Decrease">\u2212</button>' +
            '<span>' + item.qty + '</span>' +
            '<button class="qty-plus"  data-id="' + item.id + '" aria-label="Increase">+</button>' +
          '</div>' +
        '</div>' +
        '<div style="text-align:right;display:flex;flex-direction:column;align-items:flex-end;gap:8px;">' +
          '<span class="cart-price">' + fmt(item.price * item.qty) + '</span>' +
          '<span style="font-size:.8rem;color:var(--text-tertiary);">' + fmt(item.price) + ' each</span>' +
          '<button class="remove-item" data-id="' + item.id + '" aria-label="Remove"><i class="fas fa-trash-alt"></i></button>' +
        '</div>' +
      '</div>';
    }).join('');

    cartItemsEl.querySelectorAll('.qty-minus').forEach(function (btn) {
      btn.addEventListener('click', function () { changeQty(btn.dataset.id, -1); });
    });
    cartItemsEl.querySelectorAll('.qty-plus').forEach(function (btn) {
      btn.addEventListener('click', function () { changeQty(btn.dataset.id, +1); });
    });
    cartItemsEl.querySelectorAll('.remove-item').forEach(function (btn) {
      btn.addEventListener('click', function () { removeItem(btn.dataset.id); });
    });
  }

  /* ─── ADD-TO-CART BUTTONS ─── */
  function bindAddToCartButtons() {
    document.querySelectorAll('[data-add-to-cart]:not([data-cart-bound])').forEach(function (btn) {
      btn.setAttribute('data-cart-bound', '1');
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var card = this.closest('.product-card') || this.closest('[data-product-id]');
        if (!card) return;

        var priceEl   = card.querySelector('.price-current');
        var priceText = priceEl ? priceEl.textContent.replace(/[^0-9.]/g, '') : '0';
        var mpEl      = card.querySelector('.product-marketplace');
        var imgEl     = card.querySelector('img');
        var nameEl    = card.querySelector('.product-name');
        var linkEl    = card.querySelector('a[href]');

        addToCart({
          id:          card.dataset.productId || card.dataset.id || String(Date.now()),
          name:        nameEl  ? nameEl.textContent.trim() : 'Product',
          price:       parseFloat(card.dataset.price) || parseFloat(priceText) || 0,
          image:       imgEl   ? imgEl.src : '',
          marketplace: mpEl    ? mpEl.textContent.trim() : 'Online',
          url:         linkEl  ? linkEl.href : '#'
        });
      });
    });
  }

  /* ─── CHECKOUT ─── */
  function bindCheckout() {
    var btn = document.getElementById('checkoutBtn');
    if (!btn) return;
    btn.addEventListener('click', function () {
      if (cart.length === 0) {
        if (window.showToast) showToast('Your cart is empty!', 'warning');
        return;
      }
      var first = cart[0];
      if (first && first.url && first.url !== '#') window.open(first.url, '_blank', 'noopener,noreferrer');
      if (window.showToast) showToast('Redirecting to store…', 'info');
    });
  }

  /* ─── CLEAR CART ─── */
  function bindClearCart() {
    var btn = document.getElementById('clearCartBtn');
    if (!btn) return;
    btn.addEventListener('click', function () {
      if (confirm('Clear all items from your cart?')) clearCart();
    });
  }

  /* ─── PUBLIC API ─── */
  window.MeowCart = {
    add:      addToCart,
    remove:   removeItem,
    clear:    clearCart,
    getCart:  function () { return cart.slice(); },
    getTotal: function () { var s = getSubtotal(); return s + getTax(s); }
  };

  /* ─── INIT ─── */
  document.addEventListener('DOMContentLoaded', function () {
    updateCartBadge();
    renderCart();
    bindAddToCartButtons();
    bindCheckout();
    bindClearCart();

    var observer = new MutationObserver(function () { bindAddToCartButtons(); });
    observer.observe(document.body, { childList: true, subtree: true });
  });

})();
