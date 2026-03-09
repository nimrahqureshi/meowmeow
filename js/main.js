/* ============================
   MAIN.JS — TOAST · CART · WISHLIST · TIMER · COUNTER
   ============================ */

'use strict';

/* ══════════════════════════════════════════
   1.  TOAST NOTIFICATIONS
══════════════════════════════════════════ */
window.showToast = function (message, type) {
  type = type || 'info';
  var container = document.getElementById('toastContainer');
  if (!container) return;

  var icons = { success: 'fa-check-circle', error: 'fa-times-circle',
                warning: 'fa-exclamation-circle', info: 'fa-info-circle' };
  var colors = { success: '#10b981', error: '#ef4444',
                 warning: '#f59e0b', info: '#3b82f6' };

  var toast = document.createElement('div');
  toast.className = 'toast toast-' + type;
  toast.style.cssText = [
    'display:flex;align-items:center;gap:10px;',
    'padding:14px 18px;border-radius:10px;',
    'background:var(--bg-secondary,#fff);',
    'border-left:4px solid ' + (colors[type] || colors.info) + ';',
    'box-shadow:0 8px 24px rgba(0,0,0,.14);',
    'font-size:.9rem;color:var(--text-primary,#111);',
    'min-width:240px;max-width:340px;',
    'animation:slideInRight .35s ease forwards;',
    'margin-top:8px;cursor:pointer;'
  ].join('');

  toast.innerHTML = '<i class="fas ' + (icons[type] || icons.info) + '" style="color:' +
    (colors[type] || colors.info) + ';font-size:1.1rem;flex-shrink:0"></i>' +
    '<span style="flex:1">' + message + '</span>' +
    '<i class="fas fa-times" style="opacity:.4;font-size:.85rem"></i>';

  container.appendChild(toast);
  toast.addEventListener('click', function () { removeToast(toast); });

  setTimeout(function () { removeToast(toast); }, 3800);
};

function removeToast(toast) {
  toast.style.opacity = '0';
  toast.style.transform = 'translateX(100%)';
  toast.style.transition = 'all .3s ease';
  setTimeout(function () { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 350);
}

/* ══════════════════════════════════════════
   2.  CART (localStorage)
══════════════════════════════════════════ */
window.Cart = (function () {
  var KEY = 'mm_cart';

  function load()  { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch(e){ return []; } }
  function save(c) { localStorage.setItem(KEY, JSON.stringify(c)); updateBadge(); }

  function updateBadge() {
    var c = load(), count = c.reduce(function(s,i){ return s + (i.qty||1); }, 0);
    document.querySelectorAll('#cartCount,.cart-badge').forEach(function(el){
      el.textContent = count;
      el.style.display = count > 0 ? 'flex' : 'none';
    });
  }

  function add(product) {
    var c = load(), idx = c.findIndex(function(i){ return i.id === product.id; });
    if (idx > -1) { c[idx].qty = (c[idx].qty || 1) + 1; }
    else { c.push(Object.assign({}, product, { qty: 1 })); }
    save(c);
    window.showToast('🛒 ' + product.name + ' added to cart!', 'success');
    document.dispatchEvent(new CustomEvent('cartUpdated'));
  }

  function remove(id) {
    save(load().filter(function(i){ return i.id !== id; }));
    document.dispatchEvent(new CustomEvent('cartUpdated'));
  }

  function updateQty(id, qty) {
    var c = load(), idx = c.findIndex(function(i){ return i.id === id; });
    if (idx > -1) { if (qty < 1) { c.splice(idx, 1); } else { c[idx].qty = qty; } }
    save(c);
    document.dispatchEvent(new CustomEvent('cartUpdated'));
  }

  function clear()     { save([]); document.dispatchEvent(new CustomEvent('cartUpdated')); }
  function getItems()  { return load(); }
  function getCount()  { return load().reduce(function(s,i){ return s+(i.qty||1); }, 0); }
  function getTotal()  { return load().reduce(function(s,i){ return s+((parseFloat(i.price)||0)*(i.qty||1)); }, 0); }

  return { add, remove, updateQty, clear, getItems, getCount, getTotal, updateBadge };
})();

/* ══════════════════════════════════════════
   3.  WISHLIST (localStorage)
══════════════════════════════════════════ */
window.Wishlist = (function () {
  var KEY = 'mm_wishlist';
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch(e){ return []; } }
  function save(w) { localStorage.setItem(KEY, JSON.stringify(w)); updateBadge(); }

  function toggle(id) {
    var w = load(), idx = w.indexOf(id);
    if (idx > -1) { w.splice(idx, 1); } else { w.push(id); }
    save(w);
    return idx === -1; // true if just added
  }

  function has(id) { return load().includes(id); }
  function getItems() { return load(); }

  function updateBadge() {
    var count = load().length;
    document.querySelectorAll('.wishlist-badge').forEach(function(el){
      el.textContent = count;
      el.style.display = count > 0 ? 'flex' : 'none';
    });
  }

  return { toggle, has, getItems, updateBadge };
})();

/* ══════════════════════════════════════════
   4.  WISHLIST BUTTON HANDLERS (all pages)
══════════════════════════════════════════ */
function bindWishlistButtons() {
  document.querySelectorAll('.wishlist-toggle').forEach(function (btn) {
    if (btn._wishlistBound) return;
    btn._wishlistBound = true;

    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var card = btn.closest('[data-id]');
      var id   = card ? card.dataset.id : btn.dataset.id || Math.random().toString(36).slice(2);
      var added = window.Wishlist.toggle(id);
      var icon  = btn.querySelector('i');
      if (added) {
        if (icon) { icon.classList.remove('far'); icon.classList.add('fas'); }
        btn.classList.add('active');
        window.showToast('❤️ Added to wishlist!', 'success');
      } else {
        if (icon) { icon.classList.remove('fas'); icon.classList.add('far'); }
        btn.classList.remove('active');
        window.showToast('Removed from wishlist', 'warning');
      }
    });
  });
}

/* ══════════════════════════════════════════
   5.  COUNTDOWN TIMER
══════════════════════════════════════════ */
function initCountdown() {
  var hEl = document.getElementById('timer-hours');
  var mEl = document.getElementById('timer-mins');
  var sEl = document.getElementById('timer-secs');
  if (!hEl || !mEl || !sEl) return;

  var KEY = 'mm_timer_end';
  var end = parseInt(sessionStorage.getItem(KEY)) || 0;
  if (!end || end < Date.now()) {
    end = Date.now() + 24 * 60 * 60 * 1000;
    sessionStorage.setItem(KEY, end);
  }

  function tick() {
    var diff = Math.max(0, end - Date.now());
    var h = Math.floor(diff / 3600000);
    var m = Math.floor((diff % 3600000) / 60000);
    var s = Math.floor((diff % 60000) / 1000);
    hEl.textContent = String(h).padStart(2, '0');
    mEl.textContent = String(m).padStart(2, '0');
    sEl.textContent = String(s).padStart(2, '0');
  }

  tick();
  setInterval(tick, 1000);
}

/* ══════════════════════════════════════════
   6.  SCROLL-REVEAL (simple intersection)
══════════════════════════════════════════ */
function initScrollReveal() {
  var els = document.querySelectorAll(
    '.product-card,.category-card,.review-card,.blog-card,.feature-card,.stat-item,.reveal'
  );
  if (!('IntersectionObserver' in window)) {
    els.forEach(function(el){ el.style.opacity='1'; el.style.transform='none'; });
    return;
  }
  var obs = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if (!entry.isIntersecting) return;
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  els.forEach(function(el, i){
    el.style.opacity = '0';
    el.style.transform = 'translateY(28px)';
    el.style.transition = 'opacity .55s ease ' + (i % 5) * 0.08 + 's, transform .55s ease ' + (i % 5) * 0.08 + 's';
    obs.observe(el);
  });
}

/* ══════════════════════════════════════════
   7.  ANIMATED COUNTERS
══════════════════════════════════════════ */
function initCounters() {
  var els = document.querySelectorAll('.stat-number[data-count]');
  if (!('IntersectionObserver' in window)) {
    els.forEach(function(el){ el.textContent = el.dataset.count; });
    return;
  }
  var obs = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if (!entry.isIntersecting) return;
      obs.unobserve(entry.target);
      var target = parseInt(entry.target.dataset.count);
      var duration = 1800, step = Math.ceil(target / (duration / 20));
      var current = 0;
      var id = setInterval(function(){
        current = Math.min(current + step, target);
        entry.target.textContent = current.toLocaleString();
        if (current >= target) clearInterval(id);
      }, 20);
    });
  }, { threshold: 0.5 });
  els.forEach(function(el){ obs.observe(el); });
}

/* ══════════════════════════════════════════
   8.  SCROLL PROGRESS BAR + BACK TO TOP
══════════════════════════════════════════ */
function initScrollProgress() {
  var bar = document.getElementById('scrollProgress');
  var btn = document.getElementById('backToTop');

  window.addEventListener('scroll', function(){
    var scrolled = window.scrollY;
    var total    = document.documentElement.scrollHeight - window.innerHeight;

    if (bar) bar.style.width = (total > 0 ? (scrolled / total * 100) : 0) + '%';
    if (btn) btn.classList.toggle('visible', scrolled > 400);
  }, { passive: true });

  if (btn) btn.addEventListener('click', function(){
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ══════════════════════════════════════════
   9.  AFFILIATE DISCLOSURE CLOSE
══════════════════════════════════════════ */
function initDisclosure() {
  var btn = document.getElementById('disclosureClose');
  var bar = document.getElementById('affiliateDisclosure');
  if (btn && bar) {
    btn.addEventListener('click', function(){
      bar.style.display = 'none';
    });
  }
}

/* ══════════════════════════════════════════
   10.  NEWSLETTER FORMS
══════════════════════════════════════════ */
function initNewsletterForms() {
  document.querySelectorAll('.newsletter-form, #newsletterForm').forEach(function(form){
    if (form._nlBound) return;
    form._nlBound = true;
    form.addEventListener('submit', function(e){
      e.preventDefault();
      window.showToast('🎉 Subscribed! Check your inbox.', 'success');
      form.reset();
    });
  });
}

/* ══════════════════════════════════════════
   11.  CONTACT FORM
══════════════════════════════════════════ */
function initContactForm() {
  var form = document.getElementById('contactForm');
  if (!form) return;
  form.addEventListener('submit', function(e){
    e.preventDefault();
    window.showToast('📬 Message sent! We\'ll reply soon.', 'success');
    form.reset();
  });
}

/* ══════════════════════════════════════════
   12.  INIT ALL ON DOM READY
══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function(){
  window.Cart.updateBadge();
  window.Wishlist.updateBadge();
  bindWishlistButtons();
  initCountdown();
  initScrollReveal();
  initCounters();
  initScrollProgress();
  initDisclosure();
  initNewsletterForms();
  initContactForm();
});
