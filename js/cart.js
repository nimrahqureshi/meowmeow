/* ============================
   CART.JS — SHOPPING CART SYSTEM  v2.0
   localStorage persist · XSS-safe rendering
   Public API: window.MeowCart
   ============================ */

(function () {
  'use strict';

  var STORAGE_KEY = 'meowmeow-cart';

  function loadCart() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch (e) { return []; } }
  function saveCart(c) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(c)); } catch (e) {} }

  var cart = loadCart();

  function updateBadge() {
    var total = cart.reduce(function (s, i) { return s + i.qty; }, 0);
    document.querySelectorAll('#cartCount, .cart-badge').forEach(function (el) {
      var prev = parseInt(el.textContent) || 0;
      el.textContent = total;
      if (prev !== total) { el.classList.remove('badge-bounce'); void el.offsetWidth; el.classList.add('badge-bounce'); setTimeout(function () { el.classList.remove('badge-bounce'); }, 400); }
    });
  }

  function addToCart(product) {
    var ex = cart.find(function (i) { return i.id === product.id; });
    if (ex) { ex.qty = Math.min(ex.qty + 1, 99); } else { cart.push(Object.assign({}, product, { qty: 1 })); }
    saveCart(cart); updateBadge(); renderCart();
    if (window.showToast) window.showToast('🛒 "' + product.name + '" added to cart!', 'success');
  }

  function removeItem(id) {
    var idx = cart.findIndex(function (i) { return i.id === id; });
    if (idx === -1) return;
    var el = document.querySelector('.cart-item[data-id="' + id + '"]');
    function doRemove() { cart.splice(idx, 1); saveCart(cart); updateBadge(); renderCart(); }
    if (el) { el.classList.add('cart-item-removing'); setTimeout(doRemove, 420); } else { doRemove(); }
    if (window.showToast) window.showToast('Item removed from cart', 'warning');
  }

  function changeQty(id, delta) {
    var item = cart.find(function (i) { return i.id === id; });
    if (!item) return;
    item.qty = Math.max(1, Math.min(99, item.qty + delta));
    saveCart(cart); updateBadge(); renderCart();
  }

  function clearCart() {
    cart = []; saveCart(cart); updateBadge(); renderCart();
    if (window.showToast) window.showToast('Cart cleared', 'info');
  }

  function getSubtotal() { return cart.reduce(function (s, i) { return s + i.price * i.qty; }, 0); }
  function getTax(sub)    { return sub * 0.08; }
  function fmt(n)         { return '$' + n.toFixed(2); }

  function esc(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  function renderCart() {
    var cartItemsEl  = document.getElementById('cartItems');
    var emptyStateEl = document.getElementById('cartEmpty');
    var cartGridEl   = document.querySelector('.cart-grid');
    if (!cartItemsEl) return;

    var sub   = getSubtotal();
    var tax   = getTax(sub);
    var total = sub + tax;

    var ic = document.getElementById('itemCount');
    var cs = document.getElementById('cartSubtotal');
    var ct = document.getElementById('cartTax');
    var tt = document.getElementById('cartTotal');
    if (ic) ic.textContent  = cart.reduce(function (s, i) { return s + i.qty; }, 0);
    if (cs) cs.textContent  = fmt(sub);
    if (ct) ct.textContent  = fmt(tax);
    if (tt) tt.innerHTML    = '<strong>' + fmt(total) + '</strong>';

    if (cart.length === 0) {
      if (cartGridEl)   cartGridEl.style.display   = 'none';
      if (emptyStateEl) emptyStateEl.style.display = 'block';
      return;
    }
    if (cartGridEl)   cartGridEl.style.display   = '';
    if (emptyStateEl) emptyStateEl.style.display = 'none';

    cartItemsEl.innerHTML = cart.map(function (item) {
      return '<div class="cart-item card-enter" data-id="' + esc(String(item.id)) + '">' +
        '<img src="' + esc(item.image || '') + '" alt="' + esc(item.name) + '" onerror="this.src=\'https://via.placeholder.com/80x80/f3f4f6/9ca3af?text=No+Image\'" />' +
        '<div class="cart-item-details">' +
          '<h4>' + esc(item.name) + '</h4>' +
          '<div class="product-marketplace"><i class="fas fa-globe"></i> ' + esc(item.marketplace || 'Online Store') + '</div>' +
          '<div class="quantity-controls">' +
            '<button class="qty-minus" data-id="' + esc(String(item.id)) + '" aria-label="Decrease">−</button>' +
            '<span>' + item.qty + '</span>' +
            '<button class="qty-plus" data-id="' + esc(String(item.id)) + '" aria-label="Increase">+</button>' +
          '</div>' +
        '</div>' +
        '<div style="text-align:right;display:flex;flex-direction:column;align-items:flex-end;gap:8px;">' +
          '<span class="cart-price">' + fmt(item.price * item.qty) + '</span>' +
          '<span style="font-size:.8rem;color:var(--text-tertiary);">' + fmt(item.price) + ' each</span>' +
          '<button class="remove-item" data-id="' + esc(String(item.id)) + '" aria-label="Remove"><i class="fas fa-trash-alt"></i></button>' +
        '</div>' +
      '</div>';
    }).join('');

    cartItemsEl.querySelectorAll('.qty-minus').forEach(function (btn) { btn.addEventListener('click', function () { changeQty(btn.dataset.id, -1); }); });
    cartItemsEl.querySelectorAll('.qty-plus').forEach(function (btn)  { btn.addEventListener('click', function () { changeQty(btn.dataset.id, +1); }); });
    cartItemsEl.querySelectorAll('.remove-item').forEach(function (btn) { btn.addEventListener('click', function () { removeItem(btn.dataset.id); }); });
  }

  function bindAddToCartButtons() {
    document.querySelectorAll('[data-add-to-cart]:not([data-cart-bound])').forEach(function (btn) {
      btn.setAttribute('data-cart-bound', '1');
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var card = this.closest('.product-card') || this.closest('[data-product-id]');
        if (!card) return;
        var priceEl = card.querySelector('.price-current');
        addToCart({
          id:          card.dataset.productId || card.dataset.id || Date.now().toString(),
          name:        (card.querySelector('.product-name') || {}).textContent || 'Product',
          price:       parseFloat(card.dataset.price) || parseFloat((priceEl && priceEl.textContent || '').replace(/[^0-9.]/g,'')) || 0,
          image:       (card.querySelector('img') || {}).src || '',
          marketplace: (card.querySelector('.product-marketplace') || {}).textContent || 'Online',
          url:         (card.querySelector('a[href]') || {}).href || '#'
        });
      });
    });
  }

  function bindCheckout() {
    var btn = document.getElementById('checkoutBtn');
    if (!btn) return;
    btn.addEventListener('click', function () {
      if (!cart.length) { if (window.showToast) window.showToast('Your cart is empty!', 'warning'); return; }
      var first = cart[0];
      if (first && first.url && first.url !== '#') window.open(first.url, '_blank', 'noopener,noreferrer');
      if (window.showToast) window.showToast('Redirecting to store...', 'info');
    });
  }

  function bindClearCart() {
    var btn = document.getElementById('clearCartBtn');
    if (!btn) return;
    btn.addEventListener('click', function () { if (confirm('Clear all items from your cart?')) clearCart(); });
  }

  window.MeowCart = {
    add:      addToCart,
    remove:   removeItem,
    clear:    clearCart,
    getCart:  function () { return cart.slice(); },
    getTotal: function () { var s = getSubtotal(); return s + getTax(s); }
  };

  document.addEventListener('DOMContentLoaded', function () {
    updateBadge();
    renderCart();
    bindAddToCartButtons();
    bindCheckout();
    bindClearCart();
    var obs = new MutationObserver(bindAddToCartButtons);
    obs.observe(document.body, { childList: true, subtree: true });
  });

})();
