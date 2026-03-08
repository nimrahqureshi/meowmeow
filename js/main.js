/* ================================================================
   MAIN.JS — SHOPLUX GLOBAL STATE, TOAST, CART, WISHLIST & CATALOG
   Professional Affiliate Store v3.0
   ================================================================ */

'use strict';

/* ── NAMESPACE ─────────────────────────────────────────────────── */
window.ShopLux = window.ShopLux || {};

/* ================================================================
   TOAST NOTIFICATION ENGINE
   Usage: ShopLux.toast('Message', 'success|error|warning|info|cart|heart')
   ================================================================ */
ShopLux.toast = (function () {

  const ICONS = {
    success : 'fa-circle-check',
    error   : 'fa-circle-xmark',
    warning : 'fa-triangle-exclamation',
    info    : 'fa-circle-info',
    cart    : 'fa-bag-shopping',
    heart   : 'fa-heart',
    default : 'fa-bell',
  };

  const COLORS = {
    success : '#10b981',
    error   : '#ef4444',
    warning : '#f59e0b',
    info    : '#3b82f6',
    cart    : '#c026d3',
    heart   : '#f43f5e',
    default : '#6366f1',
  };

  /* inject container once */
  function getContainer() {
    let c = document.getElementById('toastContainer');
    if (!c) {
      c = document.createElement('div');
      c.id = 'toastContainer';
      c.setAttribute('aria-live', 'polite');
      c.setAttribute('aria-atomic', 'false');
      c.style.cssText = `
        position:fixed;bottom:24px;right:24px;z-index:99999;
        display:flex;flex-direction:column-reverse;gap:10px;
        pointer-events:none;max-width:360px;width:calc(100vw - 32px);
      `;
      document.body.appendChild(c);
    }
    return c;
  }

  function dismiss(toast) {
    if (!toast || !toast.parentNode) return;
    toast.style.animation = 'toastOut 0.35s cubic-bezier(.4,0,.2,1) forwards';
    setTimeout(() => toast.parentNode && toast.remove(), 360);
  }

  /* inject keyframes once */
  if (!document.getElementById('shoplux-toast-styles')) {
    const s = document.createElement('style');
    s.id = 'shoplux-toast-styles';
    s.textContent = `
      @keyframes toastIn  { from{opacity:0;transform:translateX(110%)} to{opacity:1;transform:translateX(0)} }
      @keyframes toastOut { from{opacity:1;transform:translateX(0)}    to{opacity:0;transform:translateX(110%)} }
      #toastContainer .toast-item {
        pointer-events:all;
        display:flex;align-items:center;gap:12px;
        padding:14px 16px;border-radius:14px;
        background:var(--card-bg,#fff);
        box-shadow:0 8px 32px rgba(0,0,0,.18),0 2px 8px rgba(0,0,0,.1);
        border:1px solid var(--border,#e5e7eb);
        animation:toastIn .35s cubic-bezier(.4,0,.2,1) forwards;
        cursor:pointer;user-select:none;position:relative;overflow:hidden;
        min-width:240px;
      }
      [data-theme="dark"] #toastContainer .toast-item {
        background:#1e1e2e;border-color:#2a2a3e;
        box-shadow:0 8px 32px rgba(0,0,0,.5);
      }
      #toastContainer .toast-item::after {
        content:'';position:absolute;left:0;top:0;bottom:0;width:4px;
        background:var(--_tc,#6366f1);border-radius:4px 0 0 4px;
      }
      #toastContainer .toast-icon {
        width:36px;height:36px;border-radius:50%;display:flex;
        align-items:center;justify-content:center;flex-shrink:0;
        background:color-mix(in srgb,var(--_tc,#6366f1) 15%,transparent);
        color:var(--_tc,#6366f1);font-size:1rem;
      }
      #toastContainer .toast-body { flex:1;min-width:0; }
      #toastContainer .toast-title { font-weight:700;font-size:.85rem;color:var(--text-primary,#111);margin:0 0 2px; }
      #toastContainer .toast-msg   { font-size:.82rem;color:var(--text-secondary,#555);margin:0;line-height:1.4; }
      #toastContainer .toast-close {
        background:none;border:none;cursor:pointer;padding:4px;
        color:var(--text-tertiary,#999);border-radius:6px;flex-shrink:0;
        font-size:.9rem;transition:color .2s;
      }
      #toastContainer .toast-close:hover { color:var(--text-primary,#111); }
      #toastContainer .toast-progress {
        position:absolute;bottom:0;left:0;height:3px;
        background:var(--_tc,#6366f1);
        animation:linear forwards;opacity:.6;
      }
      @keyframes toastProgress { from{width:100%} to{width:0} }
      @media(max-width:480px){
        #toastContainer{bottom:12px;right:12px;left:12px;max-width:none;}
      }
    `;
    document.head.appendChild(s);
  }

  function show(message, type = 'default', title = '') {
    const container = getContainer();
    const icon  = ICONS[type]  || ICONS.default;
    const color = COLORS[type] || COLORS.default;
    const dur   = 4500;

    const toast = document.createElement('div');
    toast.className = 'toast-item';
    toast.style.setProperty('--_tc', color);
    toast.setAttribute('role', 'status');
    toast.innerHTML = `
      <span class="toast-icon"><i class="fas ${icon}"></i></span>
      <div class="toast-body">
        ${title ? `<p class="toast-title">${title}</p>` : ''}
        <p class="toast-msg">${message}</p>
      </div>
      <button class="toast-close" aria-label="Dismiss"><i class="fas fa-xmark"></i></button>
      <div class="toast-progress" style="animation-name:toastProgress;animation-duration:${dur}ms;"></div>
    `;

    toast.querySelector('.toast-close').addEventListener('click', e => { e.stopPropagation(); dismiss(toast); });
    toast.addEventListener('click', () => dismiss(toast));
    container.appendChild(toast);

    /* cap visible toasts */
    const all = container.querySelectorAll('.toast-item');
    if (all.length > 6) dismiss(all[0]);

    const timer = setTimeout(() => dismiss(toast), dur);
    toast.addEventListener('mouseenter', () => clearTimeout(timer));

    return toast;
  }

  return show;
})();

/* legacy global alias */
window.showToast = (msg, type) => ShopLux.toast(msg, type);


/* ================================================================
   CART — localStorage-backed
   ================================================================ */
ShopLux.Cart = (function () {
  const KEY = 'shoplux_cart_v3';
  let items = [];

  function _load() {
    try { items = JSON.parse(localStorage.getItem(KEY)) || []; } catch { items = []; }
  }

  function _save() {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch {}
    _badge();
    document.dispatchEvent(new CustomEvent('shoplux:cartUpdated', { detail: summary() }));
  }

  function _badge() {
    const n = items.reduce((s, i) => s + i.qty, 0);
    document.querySelectorAll('[data-cart-badge]').forEach(el => {
      el.textContent = n > 99 ? '99+' : n;
      el.style.display = n > 0 ? 'flex' : 'none';
    });
  }

  function add(product) {
    _load();
    const ex = items.find(i => i.id === product.id);
    if (ex) { ex.qty += 1; }
    else {
      items.push({
        id       : product.id,
        name     : product.name,
        price    : product.price,
        img      : product.img,
        platform : product.platform,
        qty      : 1,
      });
    }
    _save();
    ShopLux.toast(`<strong>${_esc(product.name)}</strong> added to cart`, 'cart');
    _animateBadge();
  }

  function remove(id) {
    _load();
    items = items.filter(i => i.id !== id);
    _save();
  }

  function updateQty(id, qty) {
    _load();
    const item = items.find(i => i.id === id);
    if (item) { item.qty = Math.max(1, parseInt(qty, 10) || 1); _save(); }
  }

  function clear() { items = []; _save(); }

  function summary() {
    _load();
    return {
      items,
      count : items.reduce((s, i) => s + i.qty, 0),
      total : items.reduce((s, i) => s + parseFloat(i.price) * i.qty, 0),
    };
  }

  function getAll()   { _load(); return [...items]; }
  function getCount() { return summary().count; }
  function getTotal() { return summary().total; }

  function _animateBadge() {
    document.querySelectorAll('[data-cart-badge]').forEach(el => {
      el.style.transform = 'scale(1.5)';
      setTimeout(() => el.style.transform = '', 300);
    });
  }

  function _esc(s) { return String(s).replace(/[<>"']/g, c => ({'<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

  _load(); _badge();
  return { add, remove, updateQty, clear, getAll, getCount, getTotal, summary };
})();


/* ================================================================
   WISHLIST — localStorage-backed
   ================================================================ */
ShopLux.Wishlist = (function () {
  const KEY = 'shoplux_wl_v3';
  let ids = new Set();

  function _load() {
    try { ids = new Set(JSON.parse(localStorage.getItem(KEY)) || []); } catch { ids = new Set(); }
  }

  function _save() {
    try { localStorage.setItem(KEY, JSON.stringify([...ids])); } catch {}
    _badge();
    _sync();
  }

  function _badge() {
    document.querySelectorAll('[data-wishlist-badge]').forEach(el => {
      el.textContent = ids.size > 99 ? '99+' : ids.size;
      el.style.display = ids.size > 0 ? 'flex' : 'none';
    });
  }

  function _sync() {
    document.querySelectorAll('.wishlist-toggle[data-id]').forEach(btn => {
      const on = ids.has(btn.dataset.id);
      btn.classList.toggle('active', on);
      btn.setAttribute('aria-label', on ? 'Remove from wishlist' : 'Add to wishlist');
      const ico = btn.querySelector('i');
      if (ico) ico.className = on ? 'fas fa-heart' : 'far fa-heart';
    });
  }

  function toggle(id, name) {
    _load();
    if (ids.has(id)) {
      ids.delete(id);
      _save();
      ShopLux.toast(`Removed from wishlist`, 'warning');
      return false;
    }
    ids.add(id);
    _save();
    ShopLux.toast(`<strong>${name || 'Item'}</strong> saved to wishlist ❤️`, 'heart');
    return true;
  }

  function has(id)  { _load(); return ids.has(id); }
  function getAll() { _load(); return [...ids]; }
  function count()  { _load(); return ids.size; }

  _load(); _badge(); _sync();
  return { toggle, has, getAll, count, sync: _sync };
})();


/* ================================================================
   COMPLETE PRODUCT CATALOG — ALL AFFILIATE CATEGORIES
   ================================================================ */
ShopLux.Products = (function () {

  /* ── FULL CATALOG ─────────────────────────────────────────── */
  const catalog = [

    /* ── WOMEN'S FASHION ──────────────────────────────── */
    { id:'w001', name:'Floral Wrap Midi Dress',          cat:'women', sub:'dresses',      price:28.99, orig:49.99, platform:'amazon',     rating:4.7, reviews:1243, badge:'sale',   img:'https://images.unsplash.com/photo-1572804013427-4d7ca7268217?w=400&h=400&fit=crop&q=80' },
    { id:'w002', name:'Oversized Satin Slip Dress',      cat:'women', sub:'dresses',      price:22.99, orig:39.99, platform:'daraz',      rating:4.5, reviews:876,  badge:'hot',    img:'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=400&h=400&fit=crop&q=80' },
    { id:'w003', name:'Ribbed Cropped Tank Top',         cat:'women', sub:'tops',         price:12.99, orig:21.99, platform:'aliexpress', rating:4.4, reviews:2109, badge:'',       img:'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop&q=80' },
    { id:'w004', name:'High-Rise Skinny Stretch Jeans',  cat:'women', sub:'jeans',        price:34.99, orig:54.99, platform:'amazon',     rating:4.6, reviews:2103, badge:'best',   img:'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&h=400&fit=crop&q=80' },
    { id:'w005', name:'Mini Pleated Tennis Skirt',       cat:'women', sub:'skirts',       price:17.99, orig:28.99, platform:'aliexpress', rating:4.4, reviews:654,  badge:'new',    img:'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400&h=400&fit=crop&q=80' },
    { id:'w006', name:'Sherpa Zip-Up Crop Hoodie',       cat:'women', sub:'hoodies',      price:24.99, orig:39.99, platform:'daraz',      rating:4.8, reviews:987,  badge:'hot',    img:'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=400&h=400&fit=crop&q=80' },
    { id:'w007', name:'Quilted Chain Crossbody Bag',     cat:'women', sub:'handbags',     price:36.99, orig:64.99, platform:'amazon',     rating:4.7, reviews:1321, badge:'sale',   img:'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop&q=80' },
    { id:'w008', name:'Block Heel Strappy Sandals',      cat:'women', sub:'shoes',        price:31.99, orig:52.99, platform:'daraz',      rating:4.5, reviews:723,  badge:'',       img:'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&h=400&fit=crop&q=80' },
    { id:'w009', name:'Crystal Statement Drop Earrings', cat:'women', sub:'jewelry',      price:11.99, orig:21.99, platform:'aliexpress', rating:4.6, reviews:2341, badge:'best',   img:'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop&q=80' },
    { id:'w010', name:'Rose Gold Mesh Bracelet Watch',   cat:'women', sub:'watches',      price:49.99, orig:89.99, platform:'amazon',     rating:4.8, reviews:3102, badge:'hot',    img:'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop&q=80' },
    { id:'w011', name:'Matte 24-Piece Makeup Palette',   cat:'women', sub:'makeup',       price:14.99, orig:26.99, platform:'daraz',      rating:4.6, reviews:1987, badge:'',       img:'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&h=400&fit=crop&q=80' },
    { id:'w012', name:'Hyaluronic Acid Glow Serum',      cat:'women', sub:'skincare',     price:19.99, orig:34.99, platform:'amazon',     rating:4.7, reviews:4532, badge:'best',   img:'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop&q=80' },
    { id:'w013', name:'Satin Scrunchie Set 10pc',        cat:'women', sub:'accessories',  price:8.99,  orig:14.99, platform:'aliexpress', rating:4.5, reviews:5412, badge:'',       img:'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400&h=400&fit=crop&q=80' },

    /* ── MEN'S FASHION ────────────────────────────────── */
    { id:'m001', name:'Oxford Button-Down Dress Shirt',  cat:'men',   sub:'shirts',       price:26.99, orig:44.99, platform:'amazon',     rating:4.7, reviews:1876, badge:'best',   img:'https://images.unsplash.com/photo-1598032895397-b9472444bf93?w=400&h=400&fit=crop&q=80' },
    { id:'m002', name:'Essential Crew-Neck Tee 3-Pack',  cat:'men',   sub:'tshirts',      price:19.99, orig:34.99, platform:'daraz',      rating:4.5, reviews:3211, badge:'hot',    img:'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop&q=80' },
    { id:'m003', name:'Slim-Fit Stretch Chino Pants',    cat:'men',   sub:'pants',        price:31.99, orig:52.99, platform:'daraz',      rating:4.5, reviews:943,  badge:'',       img:'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&h=400&fit=crop&q=80' },
    { id:'m004', name:'Heavyweight 400gsm Fleece Hoodie',cat:'men',   sub:'hoodies',      price:38.99, orig:64.99, platform:'amazon',     rating:4.8, reviews:2213, badge:'hot',    img:'https://images.unsplash.com/photo-1509942774463-acf339cf87d5?w=400&h=400&fit=crop&q=80' },
    { id:'m005', name:'Moto Genuine Leather Jacket',     cat:'men',   sub:'jackets',      price:88.99, orig:149.99,platform:'daraz',      rating:4.6, reviews:671,  badge:'sale',   img:'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop&q=80' },
    { id:'m006', name:'Slim Tapered Distressed Jeans',   cat:'men',   sub:'jeans',        price:33.99, orig:57.99, platform:'aliexpress', rating:4.4, reviews:1123, badge:'',       img:'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop&q=80' },
    { id:'m007', name:'Air-Cushion Running Sneakers',    cat:'men',   sub:'sneakers',     price:48.99, orig:79.99, platform:'amazon',     rating:4.7, reviews:3421, badge:'best',   img:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop&q=80' },
    { id:'m008', name:'Chelsea Side-Zip Leather Boots',  cat:'men',   sub:'boots',        price:64.99, orig:104.99,platform:'daraz',      rating:4.6, reviews:876,  badge:'sale',   img:'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=400&h=400&fit=crop&q=80' },
    { id:'m009', name:'Polarized Acetate Aviators',      cat:'men',   sub:'sunglasses',   price:18.99, orig:33.99, platform:'daraz',      rating:4.5, reviews:876,  badge:'hot',    img:'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop&q=80' },
    { id:'m010', name:'Minimalist Stainless Mesh Watch', cat:'men',   sub:'watches',      price:74.99, orig:129.99,platform:'amazon',     rating:4.8, reviews:4231, badge:'best',   img:'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400&h=400&fit=crop&q=80' },
    { id:'m011', name:'RFID-Blocking Slim Bifold Wallet',cat:'men',   sub:'wallets',      price:21.99, orig:37.99, platform:'aliexpress', rating:4.6, reviews:1567, badge:'sale',   img:'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&h=400&fit=crop&q=80' },
    { id:'m012', name:'Pro Cordless Beard Trimmer 40L',  cat:'men',   sub:'beard',        price:33.99, orig:58.99, platform:'amazon',     rating:4.7, reviews:2876, badge:'hot',    img:'https://images.unsplash.com/photo-1621607512022-6aecc4fed814?w=400&h=400&fit=crop&q=80' },
    { id:'m013', name:'7-Piece Complete Grooming Kit',   cat:'men',   sub:'grooming',     price:43.99, orig:72.99, platform:'daraz',      rating:4.5, reviews:1023, badge:'sale',   img:'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=400&fit=crop&q=80' },

    /* ── KIDS & BABY ──────────────────────────────────── */
    { id:'k001', name:'Rainbow Unicorn Print Dress',     cat:'kids',  sub:'girls-dress',  price:15.99, orig:26.99, platform:'daraz',      rating:4.8, reviews:1234, badge:'hot',    img:'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=400&h=400&fit=crop&q=80' },
    { id:'k002', name:'Dino Print Long-Sleeve Shirt',    cat:'kids',  sub:'kids-shirts',  price:9.99,  orig:16.99, platform:'aliexpress', rating:4.6, reviews:876,  badge:'sale',   img:'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=400&h=400&fit=crop&q=80' },
    { id:'k003', name:'Soft Cotton Baby Bodysuit 3-Pack',cat:'kids',  sub:'baby',         price:14.99, orig:24.99, platform:'amazon',     rating:4.9, reviews:3421, badge:'best',   img:'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=400&h=400&fit=crop&q=80' },
    { id:'k004', name:'LED Light-Up Flash Sneakers',     cat:'kids',  sub:'kids-shoes',   price:23.99, orig:41.99, platform:'amazon',     rating:4.7, reviews:2103, badge:'best',   img:'https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?w=400&h=400&fit=crop&q=80' },
    { id:'k005', name:'Waterproof School Backpack 18L',  cat:'kids',  sub:'school-bags',  price:21.99, orig:35.99, platform:'daraz',      rating:4.7, reviews:1654, badge:'hot',    img:'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop&q=80' },
    { id:'k006', name:'Magnetic STEM Building Blocks',   cat:'kids',  sub:'toys',         price:28.99, orig:48.99, platform:'amazon',     rating:4.9, reviews:3241, badge:'best',   img:'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=400&fit=crop&q=80' },
    { id:'k007', name:'4WD RC Off-Road Car 1:18 Scale',  cat:'kids',  sub:'toys',         price:33.99, orig:58.99, platform:'daraz',      rating:4.6, reviews:987,  badge:'hot',    img:'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400&h=400&fit=crop&q=80' },
    { id:'k008', name:'Kids Smart Learning Tablet 7"',   cat:'kids',  sub:'educational',  price:48.99, orig:78.99, platform:'amazon',     rating:4.7, reviews:1432, badge:'new',    img:'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=400&fit=crop&q=80' },
    { id:'k009', name:'Cartoon Backpack Accessories Set',cat:'kids',  sub:'accessories',  price:12.99, orig:21.99, platform:'aliexpress', rating:4.5, reviews:876,  badge:'',       img:'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop&q=80' },

    /* ── ELECTRONICS ──────────────────────────────────── */
    { id:'e001', name:'ANC True Wireless Earbuds Pro',   cat:'tech',  sub:'earbuds',      price:48.99, orig:89.99, platform:'amazon',     rating:4.7, reviews:8432, badge:'best',   img:'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop&q=80' },
    { id:'e002', name:'40hr Over-Ear BT Headphones',     cat:'tech',  sub:'headphones',   price:78.99, orig:129.99,platform:'daraz',      rating:4.8, reviews:4231, badge:'hot',    img:'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop&q=80' },
    { id:'e003', name:'GPS AMOLED Fitness Smart Watch',  cat:'tech',  sub:'smartwatches', price:68.99, orig:118.99,platform:'amazon',     rating:4.6, reviews:5632, badge:'sale',   img:'https://images.unsplash.com/photo-1523475496153-3e6d63b0b6b0?w=400&h=400&fit=crop&q=80' },
    { id:'e004', name:'Optical RGB Gaming Mouse 16K',    cat:'tech',  sub:'gaming',       price:38.99, orig:63.99, platform:'aliexpress', rating:4.7, reviews:2187, badge:'hot',    img:'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&h=400&fit=crop&q=80' },
    { id:'e005', name:'TKL Mechanical RGB Keyboard',     cat:'tech',  sub:'gaming',       price:58.99, orig:98.99, platform:'amazon',     rating:4.8, reviews:3421, badge:'best',   img:'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400&h=400&fit=crop&q=80' },
    { id:'e006', name:'20000mAh PD 65W Power Bank',      cat:'tech',  sub:'power',        price:23.99, orig:38.99, platform:'daraz',      rating:4.7, reviews:6712, badge:'hot',    img:'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&h=400&fit=crop&q=80' },
    { id:'e007', name:'65W GaN Quad-Port Fast Charger',  cat:'tech',  sub:'chargers',     price:28.99, orig:48.99, platform:'amazon',     rating:4.6, reviews:4231, badge:'sale',   img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&q=80' },
    { id:'e008', name:'MagSafe Clear Shockproof Case',   cat:'tech',  sub:'cases',        price:11.99, orig:21.99, platform:'aliexpress', rating:4.4, reviews:9876, badge:'',       img:'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&h=400&fit=crop&q=80' },
    { id:'e009', name:'6.7" Dual-SIM 5G Smartphone',    cat:'tech',  sub:'phones',       price:148.99,orig:198.99,platform:'daraz',      rating:4.5, reviews:2341, badge:'new',    img:'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop&q=80' },

    /* ── HOME & KITCHEN ───────────────────────────────── */
    { id:'h001', name:'5.5L XXL Digital Air Fryer',      cat:'home',  sub:'air-fryer',    price:58.99, orig:98.99, platform:'amazon',     rating:4.8, reviews:7431, badge:'best',   img:'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=400&h=400&fit=crop&q=80' },
    { id:'h002', name:'High-Speed Pro Countertop Blender',cat:'home', sub:'blender',      price:43.99, orig:72.99, platform:'daraz',      rating:4.7, reviews:2341, badge:'hot',    img:'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=400&h=400&fit=crop&q=80' },
    { id:'h003', name:'12-Piece Premium Kitchen Knives',  cat:'home', sub:'kitchen',      price:34.99, orig:59.99, platform:'amazon',     rating:4.6, reviews:1876, badge:'sale',   img:'https://images.unsplash.com/photo-1593618998160-e34014e67546?w=400&h=400&fit=crop&q=80' },
    { id:'h004', name:'Bamboo Organizer Storage Boxes 3pc',cat:'home',sub:'storage',      price:21.99, orig:33.99, platform:'aliexpress', rating:4.5, reviews:1234, badge:'',       img:'https://images.unsplash.com/photo-1619937950119-b68ab8f40e26?w=400&h=400&fit=crop&q=80' },
    { id:'h005', name:'Boho Macramé Woven Wall Art',      cat:'home', sub:'wall-art',     price:17.99, orig:28.99, platform:'amazon',     rating:4.6, reviews:876,  badge:'new',    img:'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop&q=80' },
    { id:'h006', name:'Nordic Arc Floor Lamp Dimmable',   cat:'home', sub:'lamps',        price:33.99, orig:57.99, platform:'daraz',      rating:4.7, reviews:1543, badge:'hot',    img:'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=400&h=400&fit=crop&q=80' },
    { id:'h007', name:'1000TC Egyptian Cotton Bedsheets', cat:'home', sub:'bedsheets',    price:38.99, orig:63.99, platform:'amazon',     rating:4.8, reviews:3241, badge:'best',   img:'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400&h=400&fit=crop&q=80' },
    { id:'h008', name:'Abstract Framed Canvas Print',     cat:'home', sub:'wall-art',     price:26.99, orig:43.99, platform:'aliexpress', rating:4.4, reviews:654,  badge:'',       img:'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=400&fit=crop&q=80' },

    /* ── BEAUTY ───────────────────────────────────────── */
    { id:'b001', name:'20% Vitamin C Brightening Serum', cat:'beauty',sub:'skincare',     price:18.99, orig:33.99, platform:'amazon',     rating:4.7, reviews:5432, badge:'best',   img:'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop&q=80' },
    { id:'b002', name:'Korean Glass Skin Routine Set 5pc',cat:'beauty',sub:'skincare',    price:33.99, orig:57.99, platform:'aliexpress', rating:4.8, reviews:2187, badge:'new',    img:'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&h=400&fit=crop&q=80' },
    { id:'b003', name:'32-Shade Pro Eyeshadow Palette',  cat:'beauty',sub:'makeup',      price:13.99, orig:23.99, platform:'daraz',      rating:4.6, reviews:3241, badge:'hot',    img:'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&h=400&fit=crop&q=80' },
    { id:'b004', name:'Velvet Matte Liquid Lipstick 12pc',cat:'beauty',sub:'makeup',     price:11.99, orig:20.99, platform:'daraz',      rating:4.5, reviews:1876, badge:'',       img:'https://images.unsplash.com/photo-1586495777744-4e6232bf2fdf?w=400&h=400&fit=crop&q=80' },
    { id:'b005', name:'Ionic Ceramic Hair Straightener', cat:'beauty',sub:'hair-tools',  price:28.99, orig:48.99, platform:'amazon',     rating:4.7, reviews:4321, badge:'sale',   img:'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400&h=400&fit=crop&q=80' },

    /* ── FITNESS & HEALTH ─────────────────────────────── */
    { id:'f001', name:'6mm Non-Slip TPE Yoga Mat',       cat:'fitness',sub:'yoga',       price:21.99, orig:37.99, platform:'amazon',     rating:4.7, reviews:6543, badge:'best',   img:'https://images.unsplash.com/photo-1601925228184-55e8b5eac01c?w=400&h=400&fit=crop&q=80' },
    { id:'f002', name:'Adjustable Hex Dumbbell Set 20kg',cat:'fitness',sub:'equipment',  price:78.99, orig:128.99,platform:'daraz',      rating:4.8, reviews:2341, badge:'hot',    img:'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=400&fit=crop&q=80' },
    { id:'f003', name:'Percussion Massage Gun 30-Speed', cat:'fitness',sub:'massagers',  price:48.99, orig:88.99, platform:'amazon',     rating:4.7, reviews:4321, badge:'sale',   img:'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=400&h=400&fit=crop&q=80' },
    { id:'f004', name:'Whey Protein Chocolate 2kg',      cat:'fitness',sub:'supplements',price:38.99, orig:63.99, platform:'daraz',      rating:4.6, reviews:1987, badge:'',       img:'https://images.unsplash.com/photo-1579722820903-e72a61f03d2b?w=400&h=400&fit=crop&q=80' },
    { id:'f005', name:'Resistance Bands Set 11pc Heavy', cat:'fitness',sub:'equipment',  price:15.99, orig:25.99, platform:'aliexpress', rating:4.5, reviews:3421, badge:'new',    img:'https://images.unsplash.com/photo-1517344884509-a0c97ec11bcc?w=400&h=400&fit=crop&q=80' },
  ];

  /* ── PLATFORM SEARCH URLS ─────────────────────────────────── */
  const PLATFORM_URLS = {
    amazon     : 'https://www.amazon.com/s?k=',
    daraz      : 'https://www.daraz.pk/catalog/?q=',
    aliexpress : 'https://www.aliexpress.com/wholesale?SearchText=',
    temu       : 'https://www.temu.com/search_result.html?search_key=',
  };

  /* ── API ──────────────────────────────────────────────────── */
  const getAll         = ()      => catalog;
  const getByCategory  = cat    => catalog.filter(p => p.cat === cat);
  const getBySubcat    = sub    => catalog.filter(p => p.sub === sub);
  const getById        = id     => catalog.find(p => p.id === id);
  const getFeatured    = (n=8)  => catalog.filter(p => p.badge==='best'||p.badge==='hot').slice(0,n);
  const getDeals       = (n=6)  => catalog.filter(p => p.badge==='sale').slice(0,n);
  const getNewArrivals = (n=6)  => catalog.filter(p => p.badge==='new').slice(0,n);
  const getTopRated    = (n=8)  => [...catalog].sort((a,b)=>b.rating-a.rating).slice(0,n);
  const getMostReviewed= (n=8)  => [...catalog].sort((a,b)=>b.reviews-a.reviews).slice(0,n);
  const getRandom      = (n=8)  => [...catalog].sort(()=>Math.random()-.5).slice(0,n);

  function search(q) {
    q = q.toLowerCase().trim();
    if (!q) return [];
    return catalog.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.sub.toLowerCase().replace(/-/g,' ').includes(q) ||
      p.cat.toLowerCase().includes(q)
    );
  }

  function getAffiliateUrl(product) {
    const base = PLATFORM_URLS[product.platform] || PLATFORM_URLS.amazon;
    return base + encodeURIComponent(product.name);
  }

  function getRelated(product, n = 4) {
    return catalog
      .filter(p => p.cat === product.cat && p.id !== product.id)
      .sort(() => Math.random() - .5)
      .slice(0, n);
  }

  return {
    getAll, getByCategory, getBySubcat, getById,
    getFeatured, getDeals, getNewArrivals, getTopRated, getMostReviewed, getRandom,
    search, getAffiliateUrl, getRelated,
  };
})();


/* ================================================================
   CATEGORY TAXONOMY
   ================================================================ */
ShopLux.Categories = [
  { id:'women',   label:"Women's Fashion", icon:'fa-female',  color:'#c026d3',
    subs:['Dresses','Tops & T-shirts','Jeans & Pants','Skirts','Jackets & Hoodies','Handbags','Shoes & Sandals','Jewelry','Watches','Makeup','Skincare','Hair accessories'] },
  { id:'men',     label:"Men's Fashion",   icon:'fa-male',    color:'#2563eb',
    subs:['T-shirts','Shirts','Hoodies','Jackets','Jeans','Pants','Sneakers','Boots','Watches','Sunglasses','Wallets','Beard trimmers','Grooming kits'] },
  { id:'kids',    label:'Kids & Baby',     icon:'fa-child',   color:'#f59e0b',
    subs:['Baby clothes','Kids shirts','Kids dresses','School bags','Toys','Educational toys','Kids shoes','Kids accessories'] },
  { id:'tech',    label:'Electronics',     icon:'fa-laptop',  color:'#0ea5e9',
    subs:['Smartphones','Earbuds','Headphones','Smart watches','Gaming mouse','Keyboard','Power banks','Chargers','Phone cases'] },
  { id:'home',    label:'Home & Kitchen',  icon:'fa-house',   color:'#10b981',
    subs:['Kitchen tools','Air fryer','Blender','Storage boxes','Home decor','Lamps','Wall art','Bedsheets'] },
  { id:'beauty',  label:'Beauty',          icon:'fa-spa',     color:'#f43f5e',
    subs:['Skincare','Makeup','Hair tools'] },
  { id:'fitness', label:'Fitness',         icon:'fa-dumbbell',color:'#8b5cf6',
    subs:['Fitness equipment','Yoga mats','Massagers','Supplements'] },
];


/* ================================================================
   UTILITIES
   ================================================================ */
ShopLux.Utils = {
  formatPrice  : n     => '$' + Number(n).toFixed(2),
  discount     : (o,c) => Math.round((1 - c/o) * 100),
  formatNum    : n     => Number(n).toLocaleString(),
  escapeHTML   : str   => String(str).replace(/[&<>"']/g, s =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s])),
  escapeRegex  : s     => s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),
  clamp        : (v,mn,mx) => Math.min(mx, Math.max(mn, v)),
  isMobile     : ()    => window.innerWidth < 768,
  isTablet     : ()    => window.innerWidth < 1100,

  debounce(fn, ms) {
    let t;
    return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
  },
  throttle(fn, ms) {
    let last = 0, raf;
    return (...a) => {
      const now = Date.now();
      if (now - last >= ms) { last = now; raf = requestAnimationFrame(() => fn(...a)); }
    };
  },

  stars(rating) {
    const full = Math.floor(rating), half = (rating % 1) >= .5;
    let h = '';
    for (let i=0;i<full;i++) h += '<i class="fas fa-star"></i>';
    if (half) h += '<i class="fas fa-star-half-stroke"></i>';
    for (let i=full+(half?1:0);i<5;i++) h += '<i class="far fa-star"></i>';
    return h;
  },

  once(fn) {
    let called = false, result;
    return (...a) => called ? result : (called = true, result = fn(...a));
  },
};


/* ── CONSOLE BRANDING ──────────────────────────────────────────── */
console.log(
  '%c⚡ ShopLux %c v3.0 ',
  'background:linear-gradient(135deg,#c026d3,#7c3aed,#2563eb);color:#fff;font-size:16px;font-weight:900;padding:8px 14px;border-radius:8px 0 0 8px;letter-spacing:.5px;',
  'background:#09090b;color:#fafafa;font-size:13px;padding:8px 14px;border-radius:0 8px 8px 0;font-weight:600;'
);
console.log('%cProfessional Affiliate Store — Women · Men · Kids · Tech · Home · Beauty · Fitness','color:#c026d3;font-size:11px;');
