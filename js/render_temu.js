/* ============================================================
   RENDER-AMAZON.JS  v1.0
   Temu Product Renderer

   WHAT THIS FILE DOES:
   ────────────────────────────────────────────────────────────
   1. COLLECTS all Temu products loaded by the per-category
      files (Women.js … Flowers.js) from window.TemuProducts.

   2. EXPOSES per-category window vars that affiliate-main.js
      reads (TMU_Women, TMU_Men … TMU_Crafts). This bridges
      the category files → affiliate-main pipeline.

   3. RENDERS a standalone Temu product grid on any page
      that has id="amazonGrid" or id="productGrid" with
      data-platform="amazon".

   4. PROVIDES a platform filter bar, sort dropdown, category
      filter tabs, load-more, search integration, wishlist,
      and quick-view — all Temu-specific.

   LOAD ORDER (before </body>):
   ──────────────────────────────
     <!-- Per-category files first (push into window.TemuProducts) -->
     <script src="js/temu/Women.js"></script>
     <script src="js/temu/Men.js"></script>
     <script src="js/temu/Kids.js"></script>
     <script src="js/temu/Shoes.js"></script>
     <script src="js/temu/Bags.js"></script>
     <script src="js/temu/Jewelry.js"></script>
     <script src="js/temu/Watches.js"></script>
     <script src="js/temu/Beauty.js"></script>
     <script src="js/temu/Pets.js"></script>
     <script src="js/temu/Toys.js"></script>
     <script src="js/temu/Electronics.js"></script>
     <script src="js/temu/Crafts.js"></script>
     <script src="js/temu/Home.js"></script>
     <script src="js/temu/Accessories.js"></script>
     <script src="js/temu/Flowers.js"></script>
     <!-- Then this file -->
     <script src="js/render-temu.js"></script>
     <!-- Then affiliate-main.js (reads TMU_ vars we expose) -->
     <script src="js/affiliate-main.js"></script>

   CONFLICT NOTES (matches affiliate-main.js conventions):
   ──────────────────────────────
   • Cart btn   → class "aff-cart-btn"   (not "add-to-cart-btn")
   • QV btn     → class "aff-qv-btn"     (not "quick-view-btn")
   • QV modal   → id="affQuickView"      (not "quickViewModal")
   • Wishlist   → btn._meowBound = true  (stops script.js re-binding)
   • Buy links  → rel + params baked in  (affiliate.js skips them)
   ============================================================ */

(function () {
  'use strict';

  /* ──────────────────────────────────────────────────
     PLATFORM CONSTANTS
  ────────────────────────────────────────────────── */

  var PLATFORM    = 'Temu';
  var PLATFORM_LC = 'temu';
  var MP_ICON     = 'fas fa-shopping-bag';
  var AFF_PARAM   = 'refer_aff_src';
  var AFF_VALUE   = 'meowmeow';
  var AFF_DOMAIN  = 'temu.com';
  var BRAND_COLOR = '#FA5A28';  /* Temu orange — used in platform badge */

  var ITEMS_PER_PAGE = 12;
  var WISHLIST_KEY   = 'meowmeow-wishlist';
  var GRID_ID        = 'temuGrid';   /* preferred; falls back to productGrid */

  /* ──────────────────────────────────────────────────
     COLLECT ALL AMAZON PRODUCTS
     The per-category files (Women.js, Men.js …) all push
     into window.TemuProducts via the push() pattern.
     We read that single array here.
  ────────────────────────────────────────────────── */

  var ALL = window.TemuProducts || [];

  if (ALL.length === 0) {
    console.warn('[render-temu] No products found. Load Temu category files before render-temu.js.');
  }

  /* ──────────────────────────────────────────────────
     EXPOSE PER-CATEGORY VARS FOR affiliate-main.js
     affiliate-main.js reads window.TMU_Women, window.TMU_Men …
     We split the flat array by category and expose each slice.
  ────────────────────────────────────────────────── */

  var CATEGORY_MAP = {
    TMU_Women:       'women',
    TMU_Men:         'men',
    TMU_Kids:        'kids',
    TMU_Shoes:       'shoes',
    TMU_Bags:        'bags',
    TMU_Jewelry:     'jewelry',
    TMU_Watches:     'watches',
    TMU_Beauty:      'beauty',
    TMU_Pets:        'pets',
    TMU_Toys:        'toys',
    TMU_Electronics: 'electronics',
    TMU_Crafts:      'crafts',
    TMU_Home:        'home',
    TMU_Accessories: 'accessories',
    TMU_Flowers:     'flowers'
  };

  Object.keys(CATEGORY_MAP).forEach(function (varName) {
    var cat = CATEGORY_MAP[varName];
    window[varName] = ALL.filter(function (p) { return p.category === cat; });
  });

  /* ──────────────────────────────────────────────────
     STATE
  ────────────────────────────────────────────────── */

  var filtered    = ALL.slice();
  var currentPage = 1;
  var activeCat   = 'all';
  var activeSort  = 'default';
  var activeSearch = '';
  var wishlist    = loadWishlist();

  /* ──────────────────────────────────────────────────
     WISHLIST
  ────────────────────────────────────────────────── */

  function loadWishlist() {
    try { return JSON.parse(localStorage.getItem(WISHLIST_KEY)) || []; }
    catch (e) { return []; }
  }
  function saveWishlist() {
    try { localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist)); } catch (e) {}
  }
  function isWL(id) { return wishlist.indexOf(id) !== -1; }
  function toggleWL(id, btn) {
    var idx = wishlist.indexOf(id);
    if (idx === -1) {
      wishlist.push(id);
      btn.classList.add('active');
      var i = btn.querySelector('i');
      if (i) { i.classList.remove('far'); i.classList.add('fas'); }
      toast('Added to wishlist ❤️', 'success');
    } else {
      wishlist.splice(idx, 1);
      btn.classList.remove('active');
      var i2 = btn.querySelector('i');
      if (i2) { i2.classList.remove('fas'); i2.classList.add('far'); }
      toast('Removed from wishlist', 'warning');
    }
    saveWishlist();
  }

  /* ──────────────────────────────────────────────────
     AFFILIATE URL BUILDER
  ────────────────────────────────────────────────── */

  function affUrl(raw) {
    try {
      var url = new URL(raw);
      if (url.hostname.indexOf(AFF_DOMAIN) !== -1) {
        url.searchParams.set(AFF_PARAM, AFF_VALUE);
      }
      return url.toString();
    } catch (e) { return raw; }
  }

  /* ──────────────────────────────────────────────────
     XSS ESCAPE
  ────────────────────────────────────────────────── */

  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* ──────────────────────────────────────────────────
     STAR BUILDER
  ────────────────────────────────────────────────── */

  function stars(r) {
    var f = Math.floor(r), h = (r % 1) >= 0.4 ? 1 : 0, e = 5 - f - h;
    return '<i class="fas fa-star"></i>'.repeat(f) +
           (h ? '<i class="fas fa-star-half-alt"></i>' : '') +
           '<i class="far fa-star"></i>'.repeat(e);
  }

  /* ──────────────────────────────────────────────────
     BADGE BUILDER
  ────────────────────────────────────────────────── */

  function badges(p) {
    var m = {
      sale:       '<span class="badge badge-sale">-' + p.discount + '%</span>',
      hot:        '<span class="badge badge-sale">-' + p.discount + '%</span><span class="badge badge-hot">🔥</span>',
      new:        '<span class="badge badge-new">New</span>',
      bestseller: '<span class="badge badge-best">Bestseller</span>'
    };
    return m[p.badge] || '<span class="badge badge-sale">-' + p.discount + '%</span>';
  }

  /* ──────────────────────────────────────────────────
     FORMAT REVIEW COUNT
  ────────────────────────────────────────────────── */

  function fmtN(n) {
    return n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k' : n.toLocaleString();
  }

  /* ──────────────────────────────────────────────────
     BUILD SINGLE CARD HTML
  ────────────────────────────────────────────────── */

  function buildCard(p) {
    var url = affUrl(p.url);
    var wl  = isWL(p.id);
    return '<div class="product-card"' +
      ' data-category="' + esc(p.category) + '"' +
      ' data-subcategory="' + esc(p.subcategory || '') + '"' +
      ' data-product-id="' + esc(p.id) + '"' +
      ' data-price="' + p.price + '"' +
      ' data-rating="' + p.rating + '"' +
      ' data-marketplace="amazon">' +

      '<div class="product-badges">' + badges(p) + '</div>' +

      '<button class="wishlist-toggle' + (wl ? ' active' : '') + '"' +
        ' data-id="' + esc(p.id) + '"' +
        ' aria-label="' + (wl ? 'Remove from' : 'Add to') + ' wishlist">' +
        '<i class="' + (wl ? 'fas' : 'far') + ' fa-heart"></i>' +
      '</button>' +

      '<div class="product-image">' +
        '<img src="' + esc(p.image) + '" alt="' + esc(p.name) + '" loading="lazy"' +
          ' onerror="this.src=\'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400&h=400&fit=crop\'" />' +
        '<div class="product-overlay">' +
          '<button class="btn btn-sm btn-primary aff-qv-btn" data-id="' + esc(p.id) + '">' +
            '<i class="fas fa-eye"></i> Quick View' +
          '</button>' +
        '</div>' +
      '</div>' +

      '<div class="product-info">' +
        '<div class="product-marketplace">' +
          '<i class="' + esc(MP_ICON) + '"></i> ' + esc(PLATFORM) +
        '</div>' +
        '<h3 class="product-name">' + esc(p.name) + '</h3>' +
        '<div class="product-rating">' +
          '<div class="stars" aria-label="' + p.rating + ' out of 5 stars">' + stars(p.rating) + '</div>' +
          '<span class="rating-count">(' + fmtN(p.reviews) + ')</span>' +
        '</div>' +
        '<div class="product-price">' +
          '<span class="price-current">$' + p.price.toFixed(2) + '</span>' +
          '<span class="price-original">$' + p.originalPrice.toFixed(2) + '</span>' +
        '</div>' +
        '<div class="product-actions">' +
          '<button class="btn btn-cta btn-block btn-3d aff-cart-btn"' +
            ' data-id="' + esc(p.id) + '"' +
            ' data-name="' + esc(p.name) + '"' +
            ' data-price="' + p.price + '"' +
            ' data-img="' + esc(p.image) + '">' +
            '<i class="fas fa-cart-plus"></i> Add to Cart' +
          '</button>' +
          '<a href="' + esc(url) + '" class="btn btn-outline btn-block btn-sm"' +
            ' target="_blank" rel="noopener noreferrer sponsored">' +
            '<i class="fas fa-external-link-alt"></i> Buy on Temu' +
          '</a>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  /* ──────────────────────────────────────────────────
     FILTER + SORT PIPELINE
  ────────────────────────────────────────────────── */

  function applyFilters() {
    var r = ALL.slice();

    if (activeCat !== 'all') {
      r = r.filter(function (p) { return p.category === activeCat; });
    }

    if (activeSearch.length >= 2) {
      var q = activeSearch.toLowerCase();
      r = r.filter(function (p) {
        return p.name.toLowerCase().indexOf(q) !== -1 ||
               p.category.toLowerCase().indexOf(q) !== -1 ||
               (p.subcategory || '').toLowerCase().indexOf(q) !== -1 ||
               (p.tags || []).some(function (t) { return t.toLowerCase().indexOf(q) !== -1; });
      });
    }

    switch (activeSort) {
      case 'price-asc':   r.sort(function (a, b) { return a.price    - b.price;    }); break;
      case 'price-desc':  r.sort(function (a, b) { return b.price    - a.price;    }); break;
      case 'rating':      r.sort(function (a, b) { return b.rating   - a.rating;   }); break;
      case 'discount':    r.sort(function (a, b) { return b.discount - a.discount; }); break;
      case 'reviews':     r.sort(function (a, b) { return b.reviews  - a.reviews;  }); break;
      default:
        r.sort(function (a, b) {
          var w = { hot: 3, bestseller: 2, new: 1, sale: 0 };
          return ((w[b.badge] || 0) - (w[a.badge] || 0)) || (b.reviews - a.reviews);
        });
    }

    filtered    = r;
    currentPage = 1;
  }

  /* ──────────────────────────────────────────────────
     FIND GRID ELEMENT
     Prefers id="amazonGrid", falls back to
     id="productGrid"[data-platform="amazon"] or just id="productGrid"
  ────────────────────────────────────────────────── */

  function getGrid() {
    return document.getElementById(GRID_ID) ||
           document.querySelector('#productGrid[data-platform="temu"]') ||
           document.getElementById('productGrid');
  }

  /* ──────────────────────────────────────────────────
     RENDER
  ────────────────────────────────────────────────── */

  function render(append) {
    var grid = getGrid();
    if (!grid) return;

    var start  = (currentPage - 1) * ITEMS_PER_PAGE;
    var end    = start + ITEMS_PER_PAGE;
    var page   = filtered.slice(start, end);
    var noRes  = document.getElementById('noResults');

    if (filtered.length === 0) {
      if (!append) grid.innerHTML = '';
      if (noRes) noRes.style.display = 'flex';
      hideLoadMore();
      updateCount(grid);
      return;
    }
    if (noRes) noRes.style.display = 'none';

    if (!append) {
      grid.innerHTML = page.map(buildCard).join('');
    } else {
      var tmp = document.createElement('div');
      tmp.innerHTML = page.map(buildCard).join('');
      while (tmp.firstChild) grid.appendChild(tmp.firstChild);
    }

    /* Fix: mark wishlist buttons so script.js skips re-binding */
    var wlBtns = grid.querySelectorAll('.wishlist-toggle:not([data-tmu-wl])');
    for (var i = 0; i < wlBtns.length; i++) {
      wlBtns[i]._meowBound    = true;
      wlBtns[i].dataset.tmuWl = '1';
    }

    /* Stagger entrance animation */
    var newCards = grid.querySelectorAll('.product-card:not([data-tmu-in])');
    for (var j = 0; j < newCards.length; j++) {
      (function (el, idx) {
        el.dataset.tmuIn    = '1';
        el.style.opacity    = '0';
        el.style.transform  = 'translateY(20px)';
        var delay = (idx % ITEMS_PER_PAGE) * 0.035 + 's';
        el.style.transition = 'opacity .45s ease ' + delay + ', transform .45s ease ' + delay;
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            el.style.opacity   = '1';
            el.style.transform = 'translateY(0)';
          });
        });
      }(newCards[j], j));
    }

    updateLoadMoreBtn(end < filtered.length, grid);
    updateCount(grid);
  }

  /* ──────────────────────────────────────────────────
     GRID EVENT DELEGATION (bound once per grid via flags)
  ────────────────────────────────────────────────── */

  function bindGridEvents() {
    var grid = getGrid();
    if (!grid) return;

    /* WISHLIST */
    if (!grid._tmu_wl_bound) {
      grid._tmu_wl_bound = true;
      grid.addEventListener('click', function (e) {
        var btn = e.target.closest ? e.target.closest('.wishlist-toggle[data-id]') : null;
        if (!btn) return;
        e.preventDefault();
        e.stopPropagation();
        toggleWL(btn.dataset.id, btn);
      });
    }

    /* ADD TO CART — "aff-cart-btn" (no overlap with cart.js) */
    if (!grid._tmu_cart_bound) {
      grid._tmu_cart_bound = true;
      grid.addEventListener('click', function (e) {
        var btn = e.target.closest ? e.target.closest('.aff-cart-btn') : null;
        if (!btn) return;
        e.preventDefault();
        e.stopPropagation();
        var p = ALL.filter(function (x) { return x.id === btn.dataset.id; })[0];
        var item = {
          id:          btn.dataset.id,
          name:        btn.dataset.name,
          price:       parseFloat(btn.dataset.price),
          image:       btn.dataset.img,
          marketplace: PLATFORM,
          url:         p ? affUrl(p.url) : '#'
        };
        if (window.MeowCart && typeof window.MeowCart.add === 'function') {
          window.MeowCart.add(item);
        } else {
          toast('🛒 "' + item.name + '" added to cart!', 'success');
        }
      });
    }

    /* QUICK VIEW — "aff-qv-btn" (no overlap with component.js) */
    if (!grid._tmu_qv_bound) {
      grid._tmu_qv_bound = true;
      grid.addEventListener('click', function (e) {
        var btn = e.target.closest ? e.target.closest('.aff-qv-btn') : null;
        if (!btn) return;
        e.preventDefault();
        e.stopPropagation();
        var p = ALL.filter(function (x) { return x.id === btn.dataset.id; })[0];
        if (p) openQV(p);
      });
    }
  }

  /* ──────────────────────────────────────────────────
     QUICK VIEW MODAL
     id="affQuickView" — never conflicts with component.js "quickViewModal"
  ────────────────────────────────────────────────── */

  function openQV(p) {
    var old = document.getElementById('affQuickView');
    if (old) old.parentNode.removeChild(old);

    var url  = affUrl(p.url);
    var save = (p.originalPrice - p.price).toFixed(2);
    var tagHtml = (p.tags || []).map(function (t) {
      return '<span style="background:var(--bg-tertiary);border:1px solid var(--border);' +
             'padding:3px 9px;border-radius:var(--radius-full);font-size:.7rem;' +
             'color:var(--text-secondary);">' + esc(t) + '</span>';
    }).join('');

    var html =
      '<div id="affQuickView" role="dialog" aria-modal="true"' +
          ' aria-label="Quick view: ' + esc(p.name) + '"' +
          ' style="position:fixed;inset:0;z-index:9999;display:flex;align-items:center;' +
                  'justify-content:center;background:rgba(0,0,0,.65);' +
                  'backdrop-filter:blur(6px);padding:16px;">' +
        '<div style="background:var(--bg-secondary);border:1px solid var(--border);' +
                   'border-radius:var(--radius-xl);max-width:700px;width:100%;position:relative;' +
                   'display:grid;grid-template-columns:1fr 1fr;overflow:hidden;' +
                   'box-shadow:var(--shadow-2xl);animation:scaleInBounce .35s ease both;max-height:90vh;">' +

          /* Image panel */
          '<div style="position:relative;min-height:300px;background:var(--bg-tertiary);overflow:hidden;">' +
            '<img src="' + esc(p.image) + '" alt="' + esc(p.name) + '"' +
                 ' style="width:100%;height:100%;object-fit:cover;"' +
                 ' onerror="this.src=\'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400&h=400&fit=crop\'" />' +
            '<div style="position:absolute;top:12px;left:12px;background:var(--danger);color:#fff;' +
                        'padding:4px 10px;border-radius:var(--radius-full);font-size:.75rem;font-weight:700;">' +
              '-' + p.discount + '% OFF' +
            '</div>' +
          '</div>' +

          /* Info panel */
          '<div style="padding:26px 22px;display:flex;flex-direction:column;gap:12px;overflow-y:auto;max-height:90vh;">' +

            '<button id="affQVClose" aria-label="Close"' +
                    ' style="position:absolute;top:12px;right:12px;background:var(--bg-tertiary);' +
                            'border:1px solid var(--border);border-radius:50%;width:32px;height:32px;' +
                            'display:flex;align-items:center;justify-content:center;' +
                            'font-size:.9rem;color:var(--text-secondary);cursor:pointer;z-index:1;">' +
              '<i class="fas fa-times"></i>' +
            '</button>' +

            '<div style="font-size:.78rem;color:var(--text-tertiary);display:flex;align-items:center;gap:8px;flex-wrap:wrap;">' +
              '<span><i class="' + esc(MP_ICON) + '"></i> ' + esc(PLATFORM) + '</span>' +
              '<span style="background:var(--accent-light);color:var(--accent);padding:2px 8px;' +
                           'border-radius:var(--radius-full);font-size:.7rem;font-weight:600;">' +
                esc(p.subcategory || p.category) +
              '</span>' +
            '</div>' +

            '<h2 style="font-family:var(--font-heading);font-size:1.1rem;font-weight:800;' +
                       'color:var(--text-primary);line-height:1.35;margin:0;">' + esc(p.name) + '</h2>' +

            '<div style="display:flex;align-items:center;gap:8px;">' +
              '<div style="color:var(--warning);font-size:.82rem;display:flex;gap:2px;">' + stars(p.rating) + '</div>' +
              '<span style="font-size:.78rem;color:var(--text-tertiary);">' +
                p.rating + ' · ' + p.reviews.toLocaleString() + ' reviews' +
              '</span>' +
            '</div>' +

            '<div style="display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;">' +
              '<span style="font-family:var(--font-heading);font-size:1.9rem;font-weight:900;color:var(--accent);">$' + p.price.toFixed(2) + '</span>' +
              '<span style="font-size:.9rem;color:var(--text-tertiary);text-decoration:line-through;">$' + p.originalPrice.toFixed(2) + '</span>' +
              '<span style="font-size:.82rem;color:var(--danger);font-weight:700;">Save $' + save + '</span>' +
            '</div>' +

            (tagHtml ? '<div style="display:flex;flex-wrap:wrap;gap:6px;">' + tagHtml + '</div>' : '') +

            '<div style="display:flex;flex-direction:column;gap:8px;margin-top:auto;padding-top:8px;">' +
              '<button class="btn btn-cta btn-3d aff-qv-cart-btn"' +
                      ' data-id="' + esc(p.id) + '" data-name="' + esc(p.name) + '"' +
                      ' data-price="' + p.price + '" data-img="' + esc(p.image) + '"' +
                      ' style="width:100%;"><i class="fas fa-cart-plus"></i> Add to Cart</button>' +
              '<a href="' + esc(url) + '" class="btn btn-outline"' +
                 ' style="width:100%;text-align:center;" target="_blank" rel="noopener noreferrer sponsored">' +
                '<i class="fas fa-external-link-alt"></i> Buy on Temu' +
              '</a>' +
              '<p style="font-size:.7rem;color:var(--text-tertiary);text-align:center;margin:0;">' +
                '<i class="fas fa-shield-alt"></i> Redirects to official Temu listing' +
              '</p>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';

    document.body.insertAdjacentHTML('beforeend', html);

    var modal = document.getElementById('affQuickView');

    function closeQV() {
      if (modal && modal.parentNode) modal.parentNode.removeChild(modal);
      document.removeEventListener('keydown', onEsc);
    }
    function onEsc(e) { if (e.key === 'Escape') closeQV(); }

    document.getElementById('affQVClose').addEventListener('click', closeQV);
    modal.addEventListener('click', function (e) { if (e.target === modal) closeQV(); });
    document.addEventListener('keydown', onEsc);

    var cartBtn = modal.querySelector('.aff-qv-cart-btn');
    if (cartBtn) {
      cartBtn.addEventListener('click', function () {
        var prod = ALL.filter(function (x) { return x.id === this.dataset.id; }.bind(this))[0];
        var item = {
          id:          this.dataset.id,
          name:        this.dataset.name,
          price:       parseFloat(this.dataset.price),
          image:       this.dataset.img,
          marketplace: PLATFORM,
          url:         prod ? affUrl(prod.url) : '#'
        };
        if (window.MeowCart && typeof window.MeowCart.add === 'function') window.MeowCart.add(item);
        else toast('🛒 "' + item.name + '" added to cart!', 'success');
        closeQV();
      });
    }

    /* GA4 */
    try {
      if (typeof gtag === 'function') {
        gtag('event', 'quick_view', { product_name: p.name, affiliate_platform: PLATFORM_LC });
      }
    } catch (e) {}
  }

  /* ──────────────────────────────────────────────────
     LOAD MORE
  ────────────────────────────────────────────────── */

  function updateLoadMoreBtn(show, grid) {
    var btn = document.getElementById('affLoadMore');
    if (show) {
      if (!btn) {
        var wrap = document.createElement('div');
        wrap.style.cssText = 'text-align:center;margin:32px 0;';
        wrap.innerHTML =
          '<button id="affLoadMore" class="btn btn-outline btn-lg load-more-btn">' +
            '<i class="fas fa-plus"></i> Load More ' +
            '<span id="affLoadMoreCount"></span>' +
          '</button>';
        if (grid) grid.insertAdjacentElement('afterend', wrap);
        btn = document.getElementById('affLoadMore');
        if (btn) btn.addEventListener('click', onLoadMore);
      }
      if (btn) {
        btn.style.display = 'inline-flex';
        var rem = filtered.length - currentPage * ITEMS_PER_PAGE;
        var cel = document.getElementById('affLoadMoreCount');
        if (cel && rem > 0) cel.textContent = ' (' + rem + ' more)';
      }
    } else {
      hideLoadMore();
    }
  }

  function hideLoadMore() {
    var btn = document.getElementById('affLoadMore');
    if (btn) btn.style.display = 'none';
  }

  function onLoadMore() {
    currentPage++;
    render(true);
    var grid  = getGrid();
    var cards = grid ? grid.querySelectorAll('.product-card') : [];
    var first = cards[(currentPage - 1) * ITEMS_PER_PAGE];
    if (first) setTimeout(function () { first.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, 150);
  }

  /* ──────────────────────────────────────────────────
     RESULTS COUNT
  ────────────────────────────────────────────────── */

  function updateCount(grid) {
    var el = document.getElementById('affResultsCount');
    if (!el) {
      el    = document.createElement('p');
      el.id = 'affResultsCount';
      el.style.cssText = 'text-align:right;font-size:.82rem;color:var(--text-tertiary);margin-bottom:12px;';
      if (grid) grid.insertAdjacentElement('beforebegin', el);
    }
    var show = Math.min(currentPage * ITEMS_PER_PAGE, filtered.length);
    el.textContent = filtered.length > 0
      ? 'Showing ' + show + ' of ' + filtered.length + ' Temu products'
      : 'No Temu products found';
  }

  /* ──────────────────────────────────────────────────
     PLATFORM HEADER BADGE
     Injected above the grid to clearly label the section
  ────────────────────────────────────────────────── */

  function injectPlatformBadge() {
    if (document.getElementById('tmuPlatformBadge')) return;
    var grid = getGrid();
    if (!grid) return;
    var badge = document.createElement('div');
    badge.id = 'tmuPlatformBadge';
    badge.style.cssText =
      'display:inline-flex;align-items:center;gap:8px;' +
      'background:#FA5A28;color:#fff;' +
      'padding:6px 16px;border-radius:var(--radius-full);' +
      'font-size:.85rem;font-weight:700;margin-bottom:16px;';
    badge.innerHTML = '<i class="fas fa-shopping-bag"></i> Temu Deals';
    grid.insertAdjacentElement('beforebegin', badge);
  }

  /* ──────────────────────────────────────────────────
     SORT DROPDOWN
  ────────────────────────────────────────────────── */

  function injectSort() {
    if (document.getElementById('tmuSort')) return;
    var wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex;align-items:center;gap:8px;flex-shrink:0;';
    wrap.innerHTML =
      '<label for="tmuSort" style="font-size:.82rem;color:var(--text-secondary);font-weight:500;white-space:nowrap;">Sort:</label>' +
      '<select id="tmuSort" style="padding:8px 12px;background:var(--bg-secondary);border:2px solid var(--border);' +
              'border-radius:var(--radius-md);color:var(--text-primary);font-size:.82rem;font-family:var(--font-body);cursor:pointer;">' +
        '<option value="default">Featured</option>' +
        '<option value="price-asc">Price ↑</option>' +
        '<option value="price-desc">Price ↓</option>' +
        '<option value="rating">Top Rated</option>' +
        '<option value="discount">Biggest Discount</option>' +
        '<option value="reviews">Most Reviewed</option>' +
      '</select>';

    var bar = document.querySelector('.filter-bar');
    if (bar) { bar.style.flexWrap = 'wrap'; bar.appendChild(wrap); }
    else {
      var grid = getGrid();
      if (grid) grid.insertAdjacentElement('beforebegin', wrap);
    }

    var sel = document.getElementById('tmuSort');
    if (sel) {
      sel.addEventListener('change', function () {
        activeSort = this.value;
        applyFilters();
        render(false);
      });
    }
  }

  /* ──────────────────────────────────────────────────
     CATEGORY FILTER TABS (Temu-specific)
  ────────────────────────────────────────────────── */

  function injectCategoryFilter() {
    if (document.getElementById('tmuCatBar')) return;
    var grid = getGrid();
    if (!grid) return;

    var cats = [
      { val: 'all',         label: 'All' },
      { val: 'women',       label: '👗 Women' },
      { val: 'men',         label: '👔 Men' },
      { val: 'kids',        label: '🧒 Kids' },
      { val: 'electronics', label: '💻 Electronics' },
      { val: 'beauty',      label: '💄 Beauty' },
      { val: 'shoes',       label: '👟 Shoes' },
      { val: 'bags',        label: '👜 Bags' },
      { val: 'jewelry',     label: '💍 Jewelry' },
      { val: 'watches',     label: '⌚ Watches' },
      { val: 'pets',        label: '🐾 Pets' },
      { val: 'toys',        label: '🎲 Toys' },
      { val: 'home',        label: '🏠 Home' },
      { val: 'accessories', label: '🕶️ Accessories' },
      { val: 'flowers',     label: '🌸 Flowers' },
      { val: 'crafts',      label: '🎨 Crafts' }
    ];

    var bar = document.createElement('div');
    bar.id = 'tmuCatBar';
    bar.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px;';

    bar.innerHTML = cats.map(function (c) {
      return '<button class="filter-btn' + (c.val === 'all' ? ' active' : '') + '"' +
             ' data-tmu-cat="' + c.val + '">' + c.label + '</button>';
    }).join('');

    grid.insertAdjacentElement('beforebegin', bar);

    bar.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-tmu-cat]');
      if (!btn) return;
      bar.querySelectorAll('[data-tmu-cat]').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      activeCat = btn.dataset.tmuCat;
      applyFilters();
      render(false);
    });
  }

  /* ──────────────────────────────────────────────────
     SEARCH BINDING
  ────────────────────────────────────────────────── */

  function bindSearch() {
    var input = document.getElementById('searchInput');
    if (!input || input._tmu_search_bound) return;
    input._tmu_search_bound = true;
    input.addEventListener('input', function () {
      activeSearch = this.value.trim();
      if (activeSearch.length === 0 || activeSearch.length >= 2) {
        applyFilters();
        render(false);
      }
    });
  }

  /* ──────────────────────────────────────────────────
     URL PARAM  (?cat=beauty)
  ────────────────────────────────────────────────── */

  function readUrlParam() {
    try {
      var cat = new URLSearchParams(window.location.search).get('cat');
      if (cat) {
        activeCat = cat.toLowerCase();
        var btns = document.querySelectorAll('[data-tmu-cat]');
        btns.forEach(function (b) {
          b.classList.toggle('active', b.dataset.tmuCat === activeCat);
        });
      }
    } catch (e) {}
  }

  /* ──────────────────────────────────────────────────
     TOAST HELPER
  ────────────────────────────────────────────────── */

  function toast(msg, type) {
    if (typeof window.showToast === 'function') window.showToast(msg, type);
  }

  /* ──────────────────────────────────────────────────
     INIT — only runs if a Temu grid target exists
  ────────────────────────────────────────────────── */

  function init() {
    var grid = getGrid();
    if (!grid) return;   /* no grid on this page — skip */

    readUrlParam();
    applyFilters();
    injectPlatformBadge();
    injectSort();
    injectCategoryFilter();
    bindSearch();
    bindGridEvents();
    render(false);

    console.log('[render-temu] ✅ ' + ALL.length + ' Temu products loaded across 15 categories');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* ──────────────────────────────────────────────────
     PUBLIC API
  ────────────────────────────────────────────────── */

  window.RenderTemu = {
    products:      ALL,
    count:         function () { return ALL.length; },
    getByCategory: function (cat) { return ALL.filter(function (p) { return p.category === cat; }); },
    setCategory:   function (cat) { activeCat = cat; applyFilters(); render(false); },
    setSort:       function (s)   { activeSort = s;  applyFilters(); render(false); },
    search:        function (q)   { activeSearch = q; applyFilters(); render(false); },
    refresh:       function ()    { applyFilters(); render(false); }
  };

})();
