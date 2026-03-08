/* ============================================================
   MAIN.JS — GLOBAL UTILITIES, CART, WISHLIST, TOAST
   MeowMeow Affiliate Site — Production v2.0
   Load this FIRST before all other JS files
   ============================================================ */

'use strict';

// ===== CART & WISHLIST STATE =====
window.cart = JSON.parse(localStorage.getItem('meowmeow-cart') || '[]');
window.wishlist = JSON.parse(localStorage.getItem('meowmeow-wishlist') || '[]');

function saveCart() { localStorage.setItem('meowmeow-cart', JSON.stringify(window.cart)); }
function saveWishlist() { localStorage.setItem('meowmeow-wishlist', JSON.stringify(window.wishlist)); }

// ===== UPDATE ALL BADGES =====
window.updateBadges = function() {
  var cartCount = window.cart.reduce(function(s, i) { return s + (i.qty || 1); }, 0);
  var wishCount = window.wishlist.length;
  document.querySelectorAll('.cart-badge, #cartCount').forEach(function(el) {
    el.textContent = cartCount;
    el.style.display = cartCount > 0 ? 'flex' : 'none';
  });
  document.querySelectorAll('.wishlist-badge, #wishlistCount').forEach(function(el) {
    el.textContent = wishCount;
    el.style.display = wishCount > 0 ? 'flex' : 'none';
  });
};

// ===== ADD TO CART =====
window.addToCart = function(product) {
  if (!product.id) product.id = 'prod-' + Math.random().toString(36).substr(2, 9);
  var existing = window.cart.find(function(i) { return i.id === product.id; });
  if (existing) {
    existing.qty = (existing.qty || 1) + 1;
  } else {
    product.qty = 1;
    window.cart.push(product);
  }
  saveCart();
  window.updateBadges();
  window.showToast('🛒 Added: ' + product.name, 'success');
  window.renderCartDrawer();
};

// ===== REMOVE FROM CART =====
window.removeFromCart = function(productId) {
  window.cart = window.cart.filter(function(i) { return i.id !== productId; });
  saveCart();
  window.updateBadges();
  window.renderCartDrawer();
  window.showToast('Removed from cart', 'warning');
};

// ===== CHANGE QUANTITY =====
window.changeQty = function(productId, delta) {
  var item = window.cart.find(function(i) { return i.id === productId; });
  if (!item) return;
  item.qty = Math.max(1, (item.qty || 1) + delta);
  saveCart();
  window.updateBadges();
  window.renderCartDrawer();
};

// ===== TOGGLE WISHLIST =====
window.toggleWishlist = function(product, btnEl) {
  if (!product.id) product.id = 'wish-' + Math.random().toString(36).substr(2, 9);
  var idx = window.wishlist.findIndex(function(i) { return i.id === product.id; });
  if (idx > -1) {
    window.wishlist.splice(idx, 1);
    if (btnEl) {
      btnEl.classList.remove('active');
      var ic = btnEl.querySelector('i');
      if (ic) { ic.classList.remove('fas'); ic.classList.add('far'); }
    }
    window.showToast('Removed from wishlist', 'warning');
  } else {
    window.wishlist.push(product);
    if (btnEl) {
      btnEl.classList.add('active');
      var ic2 = btnEl.querySelector('i');
      if (ic2) { ic2.classList.remove('far'); ic2.classList.add('fas'); }
    }
    window.showToast('Added to wishlist! ❤️', 'success');
  }
  saveWishlist();
  window.updateBadges();
};

// ===== RENDER CART DRAWER =====
window.renderCartDrawer = function() {
  var body = document.getElementById('cartDrawerBody');
  if (!body) return;
  var footer = document.getElementById('cartDrawerFooter');

  if (window.cart.length === 0) {
    body.innerHTML = '<div class="cart-empty-state"><i class="fas fa-shopping-cart"></i><p>Your cart is empty</p><a href="#deals" onclick="window.closeCartDrawer()" class="btn btn-primary btn-sm">Shop Now</a></div>';
    if (footer) footer.style.display = 'none';
    return;
  }

  var total = window.cart.reduce(function(s, item) {
    var p = parseFloat((item.price || '0').toString().replace(/[^0-9.]/g, '')) || 0;
    return s + p * (item.qty || 1);
  }, 0);

  body.innerHTML = window.cart.map(function(item) {
    var safeId = (item.id || '').replace(/'/g, '');
    var safeName = (item.name || 'Product').replace(/'/g, '&apos;');
    return '<div class="cart-drawer-item">' +
      (item.image ? '<img class="cart-drawer-thumb" src="' + item.image + '" alt="' + safeName + '" loading="lazy" />' : '<div class="cart-drawer-thumb-placeholder"><i class="fas fa-image"></i></div>') +
      '<div class="cart-drawer-info"><span class="cart-drawer-name">' + safeName + '</span><span class="cart-drawer-price">' + (item.price || '') + '</span></div>' +
      '<div class="cart-drawer-qty"><button onclick="window.changeQty(\'' + safeId + '\',-1)" aria-label="Decrease">−</button><span>' + (item.qty || 1) + '</span><button onclick="window.changeQty(\'' + safeId + '\',1)" aria-label="Increase">+</button></div>' +
      '<button class="cart-drawer-remove" onclick="window.removeFromCart(\'' + safeId + '\')" aria-label="Remove"><i class="fas fa-trash-alt"></i></button>' +
    '</div>';
  }).join('');

  if (footer) {
    footer.style.display = 'block';
    var totalEl = document.getElementById('cartDrawerTotal');
    if (totalEl) totalEl.textContent = '$' + total.toFixed(2);
  }
};

// ===== OPEN/CLOSE CART DRAWER =====
window.openCartDrawer = function() {
  var drawer = document.getElementById('cartDrawer');
  var overlay = document.getElementById('cartOverlay');
  if (drawer) drawer.classList.add('active');
  if (overlay) overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
  window.renderCartDrawer();
};
window.closeCartDrawer = function() {
  var drawer = document.getElementById('cartDrawer');
  var overlay = document.getElementById('cartOverlay');
  if (drawer) drawer.classList.remove('active');
  if (overlay) overlay.classList.remove('active');
  document.body.style.overflow = '';
};

// ===== TOAST SYSTEM =====
window.showToast = function(message, type, duration) {
  type = type || 'info';
  duration = duration || 4000;
  var container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:99999;display:flex;flex-direction:column;gap:10px;pointer-events:none;';
    document.body.appendChild(container);
  }
  var icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', warning: 'fa-exclamation-triangle', info: 'fa-info-circle' };
  var toast = document.createElement('div');
  toast.className = 'toast toast-' + type;
  toast.style.pointerEvents = 'all';
  toast.innerHTML =
    '<i class="fas ' + (icons[type] || 'fa-info-circle') + ' toast-icon"></i>' +
    '<span class="toast-msg">' + message + '</span>' +
    '<button class="toast-close" aria-label="Close toast"><i class="fas fa-times"></i></button>' +
    '<div class="toast-timer-bar"></div>';
  container.appendChild(toast);

  // Animate in
  requestAnimationFrame(function() { requestAnimationFrame(function() { toast.classList.add('toast-show'); }); });

  // Timer bar
  var bar = toast.querySelector('.toast-timer-bar');
  if (bar) {
    setTimeout(function() {
      bar.style.transition = 'width ' + duration + 'ms linear';
      bar.style.width = '0%';
    }, 50);
  }

  function dismiss() {
    clearTimeout(timer);
    toast.classList.add('toast-hide');
    setTimeout(function() { if (toast.parentNode) toast.remove(); }, 400);
  }

  var closeBtn = toast.querySelector('.toast-close');
  if (closeBtn) closeBtn.addEventListener('click', dismiss);
  var timer = setTimeout(dismiss, duration);
};

// ===== NOTIFICATION SYSTEM =====
window.notifData = JSON.parse(localStorage.getItem('meowmeow-notifs') || JSON.stringify([
  { id: 1, text: '🔥 Flash sale! 50% off cat toys today only', read: false, time: '2m ago' },
  { id: 2, text: '📦 Your order has been shipped!', read: false, time: '1h ago' },
  { id: 3, text: '❤️ 3 items in your wishlist are on sale', read: false, time: '3h ago' }
]));

window.getUnreadCount = function() {
  return window.notifData.filter(function(n) { return !n.read; }).length;
};

window.updateNotifBadge = function() {
  var count = window.getUnreadCount();
  document.querySelectorAll('.notif-badge, #notifCount').forEach(function(el) {
    el.textContent = count;
    el.style.display = count > 0 ? 'flex' : 'none';
  });
};

window.renderNotifPanel = function() {
  var list = document.getElementById('notifList');
  if (!list) return;
  if (window.notifData.length === 0) {
    list.innerHTML = '<div class="notif-empty"><i class="fas fa-bell-slash"></i><p>No notifications</p></div>';
    return;
  }
  list.innerHTML = window.notifData.map(function(n) {
    return '<div class="notif-item' + (n.read ? ' read' : '') + '" data-id="' + n.id + '">' +
      '<div class="notif-dot"></div>' +
      '<div class="notif-body"><p>' + n.text + '</p><small>' + n.time + '</small></div>' +
      '<button class="notif-dismiss" onclick="window.dismissNotif(' + n.id + ')" aria-label="Dismiss"><i class="fas fa-times"></i></button>' +
    '</div>';
  }).join('');
};

window.dismissNotif = function(id) {
  window.notifData = window.notifData.filter(function(n) { return n.id !== id; });
  localStorage.setItem('meowmeow-notifs', JSON.stringify(window.notifData));
  window.updateNotifBadge();
  window.renderNotifPanel();
};

window.markAllNotifsRead = function() {
  window.notifData.forEach(function(n) { n.read = true; });
  localStorage.setItem('meowmeow-notifs', JSON.stringify(window.notifData));
  window.updateNotifBadge();
  window.renderNotifPanel();
};

// ===== CONSOLE BRANDING =====
console.log('%c🐱 MeowMeow %c v2.0 Production ', 'background:linear-gradient(135deg,#7C3AED,#F472B6);color:#fff;font-size:16px;font-weight:bold;padding:6px 10px;border-radius:6px 0 0 6px;', 'background:#1e293b;color:#f1f5f9;font-size:13px;padding:6px 10px;border-radius:0 6px 6px 0;');

// ===== DOM READY =====
document.addEventListener('DOMContentLoaded', function() {
  window.updateBadges();
  window.updateNotifBadge();
  window.renderCartDrawer();
  window.renderNotifPanel();

  // Cart button
  var cartBtn = document.getElementById('cartBtn');
  if (cartBtn) cartBtn.addEventListener('click', window.openCartDrawer);

  // Mobile cart button
  var mobileCartBtn = document.getElementById('mobileCartBtn');
  if (mobileCartBtn) mobileCartBtn.addEventListener('click', window.openCartDrawer);

  // Cart overlay + close
  var cartOverlay = document.getElementById('cartOverlay');
  if (cartOverlay) cartOverlay.addEventListener('click', window.closeCartDrawer);
  var cartClose = document.getElementById('cartClose');
  if (cartClose) cartClose.addEventListener('click', window.closeCartDrawer);

  // Checkout button in drawer
  var checkoutBtn = document.getElementById('cartCheckout');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', function() {
      if (window.cart.length === 0) { window.showToast('Your cart is empty!', 'warning'); return; }
      window.showToast('🎉 Proceeding to checkout!', 'success');
    });
  }

  // Wishlist button
  var wishlistBtn = document.getElementById('wishlistBtn');
  if (wishlistBtn) {
    wishlistBtn.addEventListener('click', function() {
      window.showToast('❤️ ' + window.wishlist.length + ' item(s) in your wishlist', 'info');
    });
  }

  // Add-to-cart buttons (data-driven)
  document.addEventListener('click', function(e) {
    var btn = e.target.closest('.add-to-cart-btn, [data-add-to-cart]');
    if (!btn) return;
    e.preventDefault();
    var card = btn.closest('.product-card');
    window.addToCart({
      id: btn.dataset.id || (card && card.dataset.id) || ('p' + Date.now()),
      name: (card && card.querySelector('.product-name')) ? card.querySelector('.product-name').textContent.trim() : (btn.dataset.name || 'Product'),
      price: (card && card.querySelector('.current-price')) ? card.querySelector('.current-price').textContent.trim() : (btn.dataset.price || ''),
      image: (card && card.querySelector('img')) ? card.querySelector('img').src : ''
    });
  });

  // Wishlist toggle buttons (delegated)
  document.addEventListener('click', function(e) {
    var btn = e.target.closest('.wishlist-toggle');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    var card = btn.closest('.product-card');
    window.toggleWishlist({
      id: btn.dataset.id || (card && card.dataset.id) || ('w' + Date.now()),
      name: (card && card.querySelector('.product-name')) ? card.querySelector('.product-name').textContent.trim() : 'Product',
      price: (card && card.querySelector('.current-price')) ? card.querySelector('.current-price').textContent.trim() : '',
      image: (card && card.querySelector('img')) ? card.querySelector('img').src : ''
    }, btn);
  });

  // Notification panel toggle
  var notifBtn = document.getElementById('notifBtn');
  var notifPanel = document.getElementById('notifPanel');
  if (notifBtn && notifPanel) {
    notifBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      var isOpen = notifPanel.classList.toggle('active');
      if (isOpen) {
        window.renderNotifPanel();
        window.markAllNotifsRead();
      }
    });
    document.addEventListener('click', function(e) {
      if (!notifPanel.contains(e.target) && e.target !== notifBtn) {
        notifPanel.classList.remove('active');
      }
    });
  }

  // Mark-all-read button
  var markAllBtn = document.getElementById('markAllRead');
  if (markAllBtn) markAllBtn.addEventListener('click', window.markAllNotifsRead);

  // Escape closes cart
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') window.closeCartDrawer();
  });
});
