/* ============================================================
   AFFILIATE-MAIN.JS — Dynamic Product Renderer  v2.0
   Combines Amazon + Daraz + Temu + AliExpress catalogues.
   Renders cards into any #productGrid on any page.

   CONFLICTS RESOLVED vs v1.0:
   ─────────────────────────────────────────────────────────
   1. affiliate.js MutationObserver storm
      OLD: affiliate-main rendered cards → triggered affiliate.js
           MutationObserver on EVERY card → hundreds of redundant calls.
      FIX: Affiliate params are BAKED INTO every URL at render time.
           Buy links already have rel="noopener noreferrer sponsored"
           set in the HTML. affiliate.js sees them as already tagged
           and skips them — observer fires but does nothing.

   2. cart.js double-bind
      OLD: affiliate-main bound ".add-to-cart-btn" via delegation.
           cart.js MutationObserver also called bindAddToCartButtons()
           on newly injected cards → two click handlers per button.
      FIX: Our cart button uses class "aff-cart-btn" (not "add-to-cart-btn").
           cart.js only looks for [data-add-to-cart] attribute which we
           do NOT set → zero overlap, zero double-fire.

   3. component.js Quick View double-bind
      OLD: component.js bound ".quick-view-btn:not([data-qv-bound])"
           and affiliate-main also bound the same class → two modals.
      FIX: Our quick view button uses class "aff-qv-btn".
           component.js never sees our buttons. We render our own
           rich modal (id="affQuickView") with full product data.

   4. script.js wishlist double-bind
      OLD: script.js bound .wishlist-toggle on DOMContentLoaded using
           _meowBound flag. Injected cards didn't have it → re-bound.
      FIX: After rendering, we immediately set btn._meowBound = true
           on every new wishlist button. script.js skips any button
           where _meowBound is already true.

   5. products.js category filter conflict
      OLD: Both products.js and affiliate-main listened to
           .filter-btn[data-filter] → double render + state desync.
      FIX: affiliate-main checks window.MeowProducts before binding.
           If products.js is present, affiliate-main does NOT bind
           category filter buttons — products.js owns those.

   LOAD ORDER (in HTML before </body>):
     1. affiliate-amazon.js
     2. affiliate-daraz.js
     3. affiliate-temu.js
     4. affiliate-aliexpress.js
     5. affiliate-main.js   ← this file (LAST)
   ============================================================ */

(function () {
  'use strict';

  /* ──────────────────────────────────────────────────
     CONFIG
  ────────────────────────────────────────────────── */

  const ITEMS_PER_PAGE = 12;
  const WISHLIST_KEY   = 'meowmeow-wishlist';

  const AFFILIATE_TAGS = {
    'amazon.com':     { param: 'tag',            value: 'meowmeow-21'   },
    'amazon.co.uk':   { param: 'tag',            value: 'meowmeow-21'   },
    'daraz.pk':       { param: 'aff_id',         value: 'MEOW123'       },
    'daraz.com':      { param: 'aff_id',         value: 'MEOW123'       },
    'temu.com':       { param: 'refer_aff_src',  value: 'meowmeow'      },
    'aliexpress.com': { param: 'aff_platform',   value: 'meowmeow_site' },
    'shein.com':      { param: 'url_from',       value: 'meowmeow'      }
  };

  /* ──────────────────────────────────────────────────
     MERGE ALL PLATFORM CATALOGUES
  ────────────────────────────────────────────────── */

  const ALL_PRODUCTS = [
    ...(window.AmazonProducts     || []),
    ...(window.DarazProducts      || []),
    ...(window.TemuProducts       || []),
    ...(window.AliExpressProducts || [])
  ];

  if (ALL_PRODUCTS.length === 0) {
    console.warn('[affiliate-main] No products found. Load platform files before affiliate-main.js.');
    return;
  }

  /* ──────────────────────────────────────────────────
     STATE
  ────────────────────────────────────────────────── */

  let filteredProducts = [...ALL_PRODUCTS];
  let currentPage      = 1;
  let activeCategory   = 'all';
  let activePlatform   = 'all';
  let activeSort       = 'default';
  let activeSearch     = '';
  let wishlist         = loadWishlist();

  /* ──────────────────────────────────────────────────
     WISHLIST HELPERS
  ────────────────────────────────────────────────── */

  function loadWishlist() {
    try { return JSON.parse(localStorage.getItem(WISHLIST_KEY)) || []; }
    catch (e) { return []; }
  }

  function saveWishlist() {
    try { localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist)); }
    catch (e) {}
  }

  function isWishlisted(id) { return wishlist.includes(id); }

  function toggleWishlist(id, btn) {
    const idx = wishlist.indexOf(id);
    if (idx === -1) {
      wishlist.push(id);
      btn.classList.add('active');
      btn.querySelector('i')?.classList.replace('far', 'fas');
      showToast('Added to wishlist ❤️', 'success');
    } else {
      wishlist.splice(idx, 1);
      btn.classList.remove('active');
      btn.querySelector('i')?.classList.replace('fas', 'far');
      showToast('Removed from wishlist', 'warning');
    }
    saveWishlist();
  }

  /* ──────────────────────────────────────────────────
     AFFILIATE URL BUILDER
     Bakes params in at render time — affiliate.js skips
     links that already have the correct param set.
  ────────────────────────────────────────────────── */

  function buildAffiliateUrl(rawUrl) {
    try {
      const url = new URL(rawUrl);
      for (const [domain, cfg] of Object.entries(AFFILIATE_TAGS)) {
        if (url.hostname.includes(domain)) {
          url.searchParams.set(cfg.param, cfg.value);
          break;
        }
      }
      return url.toString();
    } catch (e) {
      return rawUrl;
    }
  }

  /* ──────────────────────────────────────────────────
     XSS-SAFE ESCAPING
  ────────────────────────────────────────────────── */

  function esc(str) {
    return String(str)
      .replace(/&/g,  '&amp;')
      .replace(/</g,  '&lt;')
      .replace(/>/g,  '&gt;')
      .replace(/"/g,  '&quot;')
      .replace(/'/g,  '&#39;');
  }

  /* ──────────────────────────────────────────────────
     STAR BUILDER
  ────────────────────────────────────────────────── */

  function buildStars(rating) {
    const full  = Math.floor(rating);
    const half  = (rating % 1) >= 0.4 ? 1 : 0;
    const empty = 5 - full - half;
    return (
      '<i class="fas fa-star"></i>'.repeat(full) +
      (half ? '<i class="fas fa-star-half-alt"></i>' : '') +
      '<i class="far fa-star"></i>'.repeat(empty)
    );
  }

  /* ──────────────────────────────────────────────────
     BADGE BUILDER
  ────────────────────────────────────────────────── */

  function buildBadges(p) {
    const map = {
      sale:       `<span class="badge badge-sale">-${p.discount}%</span>`,
      hot:        `<span class="badge badge-sale">-${p.discount}%</span><span class="badge badge-hot">🔥</span>`,
      new:        `<span class="badge badge-new">New</span>`,
      bestseller: `<span class="badge badge-best">Bestseller</span>`
    };
    return map[p.badge] || `<span class="badge badge-sale">-${p.discount}%</span>`;
  }

  /* ──────────────────────────────────────────────────
     REVIEW COUNT FORMATTER
  ────────────────────────────────────────────────── */

  function fmtReviews(n) {
    return n >= 1000
      ? (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
      : n.toLocaleString();
  }

  /* ──────────────────────────────────────────────────
     CARD HTML BUILDER

     CRITICAL DIFFERENCES FROM v1.0 (conflict fixes):
     • Cart btn  → class "aff-cart-btn"  (NOT "add-to-cart-btn")
     • QV btn    → class "aff-qv-btn"    (NOT "quick-view-btn")
     • Buy link  → already has rel="noopener noreferrer sponsored"
                   + affiliate params baked in → affiliate.js skips
     • _meowBound set on wishlist buttons after DOM insertion
       → script.js skips re-binding
  ────────────────────────────────────────────────── */

  function buildCard(p) {
    const url    = buildAffiliateUrl(p.url);
    const wl     = isWishlisted(p.id);
    const safeId = esc(p.id);

    return `<div class="product-card"
     data-category="${esc(p.category)}"
     data-subcategory="${esc(p.subcategory || '')}"
     data-product-id="${safeId}"
     data-price="${p.price}"
     data-rating="${p.rating}"
     data-marketplace="${esc(p.marketplace.toLowerCase())}">

  <div class="product-badges">${buildBadges(p)}</div>

  <button class="wishlist-toggle${wl ? ' active' : ''}"
          data-id="${safeId}"
          aria-label="${wl ? 'Remove from' : 'Add to'} wishlist">
    <i class="${wl ? 'fas' : 'far'} fa-heart"></i>
  </button>

  <div class="product-image">
    <img src="${esc(p.image)}"
         alt="${esc(p.name)}"
         loading="lazy"
         onerror="this.src='https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400&h=400&fit=crop'" />
    <div class="product-overlay">
      <button class="btn btn-sm btn-primary aff-qv-btn" data-id="${safeId}">
        <i class="fas fa-eye"></i> Quick View
      </button>
    </div>
  </div>

  <div class="product-info">
    <div class="product-marketplace">
      <i class="${esc(p.marketplaceIcon)}"></i> ${esc(p.marketplace)}
    </div>
    <h3 class="product-name">${esc(p.name)}</h3>
    <div class="product-rating">
      <div class="stars" aria-label="${p.rating} out of 5 stars">${buildStars(p.rating)}</div>
      <span class="rating-count">(${fmtReviews(p.reviews)})</span>
    </div>
    <div class="product-price">
      <span class="price-current">$${p.price.toFixed(2)}</span>
      <span class="price-original">$${p.originalPrice.toFixed(2)}</span>
    </div>
    <div class="product-actions">
      <button class="btn btn-cta btn-block btn-3d aff-cart-btn"
              data-id="${safeId}"
              data-name="${esc(p.name)}"
              data-price="${p.price}"
              data-img="${esc(p.image)}">
        <i class="fas fa-cart-plus"></i> Add to Cart
      </button>
      <a href="${esc(url)}"
         class="btn btn-outline btn-block btn-sm"
         target="_blank"
         rel="noopener noreferrer sponsored">
        <i class="fas fa-external-link-alt"></i> Buy on ${esc(p.marketplace)}
      </a>
    </div>
  </div>
</div>`;
  }

  /* ──────────────────────────────────────────────────
     FILTER + SORT PIPELINE
  ────────────────────────────────────────────────── */

  function applyFilters() {
    let results = [...ALL_PRODUCTS];

    if (activeCategory !== 'all') {
      results = results.filter(p => p.category === activeCategory);
    }

    if (activePlatform !== 'all') {
      results = results.filter(p =>
        p.marketplace.toLowerCase().includes(activePlatform)
      );
    }

    if (activeSearch.length >= 2) {
      const q = activeSearch.toLowerCase();
      results = results.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.subcategory || '').toLowerCase().includes(q) ||
        (p.tags || []).some(t => t.toLowerCase().includes(q)) ||
        p.marketplace.toLowerCase().includes(q)
      );
    }

    switch (activeSort) {
      case 'price-asc':   results.sort((a, b) => a.price    - b.price);    break;
      case 'price-desc':  results.sort((a, b) => b.price    - a.price);    break;
      case 'rating':      results.sort((a, b) => b.rating   - a.rating);   break;
      case 'discount':    results.sort((a, b) => b.discount - a.discount); break;
      case 'reviews':     results.sort((a, b) => b.reviews  - a.reviews);  break;
      default:
        results.sort((a, b) => {
          const w = { hot: 3, bestseller: 2, new: 1, sale: 0 };
          return ((w[b.badge] ?? 0) - (w[a.badge] ?? 0)) || (b.reviews - a.reviews);
        });
    }

    filteredProducts = results;
    currentPage = 1;
  }

  /* ──────────────────────────────────────────────────
     RENDER PRODUCTS
  ────────────────────────────────────────────────── */

  function renderProducts(append) {
    const grid = document.getElementById('productGrid');
    if (!grid) return;

    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end   = start + ITEMS_PER_PAGE;
    const page  = filteredProducts.slice(start, end);

    const noResults = document.getElementById('noResults');

    if (filteredProducts.length === 0) {
      if (!append) grid.innerHTML = '';
      if (noResults) noResults.style.display = 'flex';
      hideLoadMore();
      updateResultsCount();
      return;
    }
    if (noResults) noResults.style.display = 'none';

    if (!append) {
      grid.innerHTML = page.map(buildCard).join('');
    } else {
      const tmp = document.createElement('div');
      tmp.innerHTML = page.map(buildCard).join('');
      while (tmp.firstChild) grid.appendChild(tmp.firstChild);
    }

    // FIX 4: Mark wishlist buttons so script.js does not re-bind them
    grid.querySelectorAll('.wishlist-toggle:not([data-aff-wl])').forEach(btn => {
      btn._meowBound   = true;  // script.js guard
      btn.dataset.affWl = '1'; // our guard (avoids re-marking on re-render)
    });

    // Stagger entrance animation
    grid.querySelectorAll('.product-card:not([data-aff-in])').forEach((el, i) => {
      el.dataset.affIn = '1';
      el.style.opacity   = '0';
      el.style.transform = 'translateY(22px)';
      el.style.transition =
        `opacity 0.45s ease ${(i % ITEMS_PER_PAGE) * 0.035}s,` +
        `transform 0.45s ease ${(i % ITEMS_PER_PAGE) * 0.035}s`;
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          el.style.opacity   = '1';
          el.style.transform = 'translateY(0)';
        })
      );
    });

    updateLoadMoreBtn(end < filteredProducts.length);
    updateResultsCount();
  }

  /* ──────────────────────────────────────────────────
     GRID EVENT DELEGATION
     Three separate listeners, each bound ONCE via flag.
     Using distinct classes prevents conflicts with other scripts.
  ────────────────────────────────────────────────── */

  function bindGridEvents() {
    const grid = document.getElementById('productGrid');
    if (!grid) return;

    // ── WISHLIST ("wishlist-toggle" + "data-id") ──
    if (!grid._affWLBound) {
      grid._affWLBound = true;
      grid.addEventListener('click', function (e) {
        const btn = e.target.closest('.wishlist-toggle[data-id]');
        if (!btn) return;
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(btn.dataset.id, btn);
      });
    }

    // ── ADD TO CART ("aff-cart-btn") — FIX 2 ──
    if (!grid._affCartBound) {
      grid._affCartBound = true;
      grid.addEventListener('click', function (e) {
        const btn = e.target.closest('.aff-cart-btn');
        if (!btn) return;
        e.preventDefault();
        e.stopPropagation();

        const p = ALL_PRODUCTS.find(x => x.id === btn.dataset.id);
        const item = {
          id:          btn.dataset.id,
          name:        btn.dataset.name,
          price:       parseFloat(btn.dataset.price),
          image:       btn.dataset.img,
          marketplace: p?.marketplace || '',
          url:         p ? buildAffiliateUrl(p.url) : '#'
        };

        if (typeof window.MeowCart?.add === 'function') {
          window.MeowCart.add(item);
        } else {
          showToast(`🛒 "${item.name}" added to cart!`, 'success');
        }
      });
    }

    // ── QUICK VIEW ("aff-qv-btn") — FIX 3 ──
    if (!grid._affQVBound) {
      grid._affQVBound = true;
      grid.addEventListener('click', function (e) {
        const btn = e.target.closest('.aff-qv-btn');
        if (!btn) return;
        e.preventDefault();
        e.stopPropagation();
        const p = ALL_PRODUCTS.find(x => x.id === btn.dataset.id);
        if (p) openQuickView(p);
      });
    }
  }

  /* ──────────────────────────────────────────────────
     QUICK VIEW MODAL
     id="affQuickView" — NOT "quickViewModal" — FIX 3
     component.js owns #quickViewModal. We own #affQuickView.
     No collision.
  ────────────────────────────────────────────────── */

  function openQuickView(p) {
    document.getElementById('affQuickView')?.remove();

    const url     = buildAffiliateUrl(p.url);
    const savings = (p.originalPrice - p.price).toFixed(2);
    const tagHtml = (p.tags || []).map(t =>
      `<span style="background:var(--bg-tertiary);border:1px solid var(--border);
       padding:3px 10px;border-radius:var(--radius-full);
       font-size:0.72rem;color:var(--text-secondary);">${esc(t)}</span>`
    ).join('');

    document.body.insertAdjacentHTML('beforeend', `
<div id="affQuickView" role="dialog" aria-modal="true"
     aria-label="Quick view: ${esc(p.name)}"
     style="position:fixed;inset:0;z-index:9999;
            display:flex;align-items:center;justify-content:center;
            background:rgba(0,0,0,0.65);backdrop-filter:blur(6px);padding:16px;">
  <div style="background:var(--bg-secondary);border:1px solid var(--border);
              border-radius:var(--radius-xl);max-width:700px;width:100%;position:relative;
              display:grid;grid-template-columns:1fr 1fr;overflow:hidden;
              box-shadow:var(--shadow-2xl);animation:scaleInBounce 0.35s ease both;
              max-height:90vh;">

    <!-- image panel -->
    <div style="position:relative;min-height:300px;background:var(--bg-tertiary);overflow:hidden;">
      <img src="${esc(p.image)}" alt="${esc(p.name)}"
           style="width:100%;height:100%;object-fit:cover;"
           onerror="this.src='https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400&h=400&fit=crop'" />
      <div style="position:absolute;top:12px;left:12px;background:var(--danger);color:#fff;
                  padding:4px 10px;border-radius:var(--radius-full);font-size:0.75rem;font-weight:700;">
        -${p.discount}% OFF
      </div>
    </div>

    <!-- info panel -->
    <div style="padding:26px 22px;display:flex;flex-direction:column;gap:12px;overflow-y:auto;max-height:90vh;">

      <button id="affQVClose" aria-label="Close"
              style="position:absolute;top:12px;right:12px;background:var(--bg-tertiary);
                     border:1px solid var(--border);border-radius:50%;width:32px;height:32px;
                     display:flex;align-items:center;justify-content:center;
                     font-size:0.9rem;color:var(--text-secondary);cursor:pointer;z-index:1;">
        <i class="fas fa-times"></i>
      </button>

      <div style="font-size:0.78rem;color:var(--text-tertiary);display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
        <span><i class="${esc(p.marketplaceIcon)}"></i> ${esc(p.marketplace)}</span>
        <span style="background:var(--accent-light);color:var(--accent);padding:2px 8px;
                     border-radius:var(--radius-full);font-size:0.7rem;font-weight:600;">
          ${esc(p.subcategory || p.category)}
        </span>
      </div>

      <h2 style="font-family:var(--font-heading);font-size:1.1rem;font-weight:800;
                 color:var(--text-primary);line-height:1.35;margin:0;">
        ${esc(p.name)}
      </h2>

      <div style="display:flex;align-items:center;gap:8px;">
        <div style="color:var(--warning);font-size:0.82rem;display:flex;gap:2px;">${buildStars(p.rating)}</div>
        <span style="font-size:0.78rem;color:var(--text-tertiary);">
          ${p.rating} · ${p.reviews.toLocaleString()} reviews
        </span>
      </div>

      <div style="display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;">
        <span style="font-family:var(--font-heading);font-size:1.9rem;font-weight:900;color:var(--accent);">
          $${p.price.toFixed(2)}
        </span>
        <span style="font-size:0.9rem;color:var(--text-tertiary);text-decoration:line-through;">
          $${p.originalPrice.toFixed(2)}
        </span>
        <span style="font-size:0.82rem;color:var(--danger);font-weight:700;">
          Save $${savings}
        </span>
      </div>

      ${tagHtml ? `<div style="display:flex;flex-wrap:wrap;gap:6px;">${tagHtml}</div>` : ''}

      <div style="display:flex;flex-direction:column;gap:8px;margin-top:auto;padding-top:8px;">
        <button class="btn btn-cta btn-3d aff-qv-cart-btn"
                data-id="${esc(p.id)}"
                data-name="${esc(p.name)}"
                data-price="${p.price}"
                data-img="${esc(p.image)}"
                style="width:100%;">
          <i class="fas fa-cart-plus"></i> Add to Cart
        </button>
        <a href="${esc(url)}"
           class="btn btn-outline"
           style="width:100%;text-align:center;"
           target="_blank"
           rel="noopener noreferrer sponsored">
          <i class="fas fa-external-link-alt"></i> Buy on ${esc(p.marketplace)}
        </a>
        <p style="font-size:0.7rem;color:var(--text-tertiary);text-align:center;margin:0;">
          <i class="fas fa-shield-alt"></i> Redirects to official seller — secured checkout
        </p>
      </div>
    </div>
  </div>
</div>`);

    const modal    = document.getElementById('affQuickView');
    const closeBtn = document.getElementById('affQVClose');

    function closeModal() {
      modal?.remove();
      document.removeEventListener('keydown', onEsc);
    }
    function onEsc(e) { if (e.key === 'Escape') closeModal(); }

    closeBtn?.addEventListener('click', closeModal);
    modal?.addEventListener('click', e => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', onEsc);

    modal?.querySelector('.aff-qv-cart-btn')?.addEventListener('click', function () {
      const prod = ALL_PRODUCTS.find(x => x.id === this.dataset.id);
      const item = {
        id:          this.dataset.id,
        name:        this.dataset.name,
        price:       parseFloat(this.dataset.price),
        image:       this.dataset.img,
        marketplace: prod?.marketplace || '',
        url:         prod ? buildAffiliateUrl(prod.url) : '#'
      };
      if (typeof window.MeowCart?.add === 'function') window.MeowCart.add(item);
      else showToast(`🛒 "${item.name}" added to cart!`, 'success');
      closeModal();
    });

    // GA4 tracking
    try {
      if (typeof gtag === 'function') {
        gtag('event', 'quick_view', {
          product_name: p.name,
          affiliate_platform: p.marketplace.toLowerCase()
        });
      }
    } catch (e) {}
  }

  /* ──────────────────────────────────────────────────
     LOAD MORE
  ────────────────────────────────────────────────── */

  function updateLoadMoreBtn(show) {
    let btn = document.getElementById('affLoadMore');

    if (show) {
      if (!btn) {
        const wrap = document.createElement('div');
        wrap.style.cssText = 'text-align:center;margin:32px 0;';
        wrap.innerHTML = `
          <button id="affLoadMore" class="btn btn-outline btn-lg load-more-btn">
            <i class="fas fa-plus"></i> Load More
            <span id="affLoadMoreCount"></span>
          </button>`;
        document.getElementById('productGrid')?.insertAdjacentElement('afterend', wrap);
        document.getElementById('affLoadMore')?.addEventListener('click', onLoadMore);
        btn = document.getElementById('affLoadMore');
      }
      btn.style.display = 'inline-flex';
      const remaining = filteredProducts.length - currentPage * ITEMS_PER_PAGE;
      const cEl = document.getElementById('affLoadMoreCount');
      if (cEl && remaining > 0) cEl.textContent = ` (${remaining} more)`;
    } else {
      hideLoadMore();
    }
  }

  function hideLoadMore() {
    const btn = document.getElementById('affLoadMore');
    if (btn) btn.style.display = 'none';
  }

  function onLoadMore() {
    currentPage++;
    renderProducts(true);
    const cards = document.getElementById('productGrid')?.querySelectorAll('.product-card');
    const first = cards?.item((currentPage - 1) * ITEMS_PER_PAGE);
    if (first) setTimeout(() => first.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 150);
  }

  /* ──────────────────────────────────────────────────
     RESULTS COUNT
  ────────────────────────────────────────────────── */

  function updateResultsCount() {
    let el = document.getElementById('affResultsCount');
    if (!el) {
      el = document.createElement('p');
      el.id = 'affResultsCount';
      el.style.cssText = 'text-align:right;font-size:0.82rem;color:var(--text-tertiary);margin-bottom:12px;';
      document.getElementById('productGrid')?.insertAdjacentElement('beforebegin', el);
    }
    const showing = Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length);
    el.textContent = filteredProducts.length > 0
      ? `Showing ${showing} of ${filteredProducts.length} products`
      : 'No products found';
  }

  /* ──────────────────────────────────────────────────
     SORT DROPDOWN INJECTION
  ────────────────────────────────────────────────── */

  function injectSortDropdown() {
    if (document.getElementById('affSortSelect')) return;

    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display:flex;align-items:center;gap:8px;flex-shrink:0;';
    wrapper.innerHTML = `
      <label for="affSortSelect"
             style="font-size:0.82rem;color:var(--text-secondary);
                    font-weight:500;white-space:nowrap;">
        Sort:
      </label>
      <select id="affSortSelect"
              style="padding:8px 12px;background:var(--bg-secondary);
                     border:2px solid var(--border);border-radius:var(--radius-md);
                     color:var(--text-primary);font-size:0.82rem;
                     font-family:var(--font-body);cursor:pointer;">
        <option value="default">Featured</option>
        <option value="price-asc">Price ↑</option>
        <option value="price-desc">Price ↓</option>
        <option value="rating">Top Rated</option>
        <option value="discount">Biggest Discount</option>
        <option value="reviews">Most Reviewed</option>
      </select>`;

    const filterBar = document.querySelector('.filter-bar');
    if (filterBar) {
      filterBar.style.flexWrap = 'wrap';
      filterBar.appendChild(wrapper);
    } else {
      document.getElementById('productGrid')?.insertAdjacentElement('beforebegin', wrapper);
    }

    document.getElementById('affSortSelect')?.addEventListener('change', function () {
      activeSort = this.value;
      applyFilters();
      renderProducts(false);
    });
  }

  /* ──────────────────────────────────────────────────
     PLATFORM FILTER BAR INJECTION
  ────────────────────────────────────────────────── */

  function injectPlatformFilter() {
    if (document.getElementById('affPlatformBar')) return;

    const grid = document.getElementById('productGrid');
    if (!grid) return;

    const bar = document.createElement('div');
    bar.id = 'affPlatformBar';
    bar.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:16px;flex-wrap:wrap;';
    bar.innerHTML = `
      <span style="font-size:0.78rem;color:var(--text-tertiary);font-weight:600;">Platform:</span>
      <button class="filter-btn active" data-platform="all">All</button>
      <button class="filter-btn" data-platform="amazon"><i class="fab fa-amazon"></i> Amazon</button>
      <button class="filter-btn" data-platform="daraz"><i class="fas fa-store"></i> Daraz</button>
      <button class="filter-btn" data-platform="temu"><i class="fas fa-shopping-bag"></i> Temu</button>
      <button class="filter-btn" data-platform="aliexpress"><i class="fas fa-globe"></i> AliExpress</button>`;

    grid.insertAdjacentElement('beforebegin', bar);

    bar.addEventListener('click', function (e) {
      const btn = e.target.closest('[data-platform]');
      if (!btn) return;
      bar.querySelectorAll('[data-platform]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activePlatform = btn.dataset.platform;
      applyFilters();
      renderProducts(false);
    });
  }

  /* ──────────────────────────────────────────────────
     CATEGORY FILTER BINDING
     FIX 5: Skip if products.js is present — it owns these buttons.
  ────────────────────────────────────────────────── */

  function bindCategoryFilter() {
    // products.js owns .filter-btn[data-filter] when it is loaded
    if (typeof window.MeowProducts !== 'undefined') return;

    const filterBar = document.querySelector('.filter-bar');
    if (!filterBar) return;

    filterBar.addEventListener('click', function (e) {
      const btn = e.target.closest('.filter-btn[data-filter]');
      if (!btn) return;

      filterBar.querySelectorAll('.filter-btn[data-filter]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      activeCategory = btn.dataset.filter || 'all';

      // Reset platform bar to "All"
      document.querySelectorAll('#affPlatformBar [data-platform]').forEach(b => {
        b.classList.toggle('active', b.dataset.platform === 'all');
      });
      activePlatform = 'all';

      applyFilters();
      renderProducts(false);
    });
  }

  /* ──────────────────────────────────────────────────
     SEARCH BINDING
     Adds a secondary 'input' listener on #searchInput.
     Does NOT conflict with search.js — search.js only builds
     its own dropdown from the value; it never calls renderProducts().
  ────────────────────────────────────────────────── */

  function bindSearch() {
    const input = document.getElementById('searchInput');
    if (!input || input._affSearchBound) return;
    input._affSearchBound = true;

    input.addEventListener('input', function () {
      activeSearch = this.value.trim();
      if (activeSearch.length === 0 || activeSearch.length >= 2) {
        applyFilters();
        renderProducts(false);
      }
    });
  }

  /* ──────────────────────────────────────────────────
     URL PARAM SUPPORT  (?cat=beauty)
  ────────────────────────────────────────────────── */

  function readUrlParams() {
    try {
      const cat = new URLSearchParams(window.location.search).get('cat');
      if (cat) {
        activeCategory = cat.toLowerCase();
        document.querySelectorAll('.filter-btn[data-filter]').forEach(btn => {
          btn.classList.toggle('active', btn.dataset.filter === activeCategory);
        });
      }
    } catch (e) {}
  }

  /* ──────────────────────────────────────────────────
     TOAST HELPER
  ────────────────────────────────────────────────── */

  function showToast(msg, type) {
    if (typeof window.showToast === 'function') window.showToast(msg, type);
    else console.log(`[${type}] ${msg}`);
  }

  /* ──────────────────────────────────────────────────
     EXTEND NAVBAR SEARCH
     Pushes catalogue products into search.js product list
     so the navbar search dropdown shows affiliate products.
  ────────────────────────────────────────────────── */

  function extendNavbarSearch() {
    if (!Array.isArray(window.MeowSearchProducts)) return;
    window.MeowSearchProducts.push(
      ...ALL_PRODUCTS.map(p => ({
        name:     p.name,
        price:    '$' + p.price.toFixed(2),
        category: p.subcategory || p.category,
        image:    p.image
      }))
    );
  }

  /* ──────────────────────────────────────────────────
     INIT
  ────────────────────────────────────────────────── */

  function init() {
    if (!document.getElementById('productGrid')) return;

    readUrlParams();
    applyFilters();
    injectSortDropdown();
    injectPlatformFilter();
    bindCategoryFilter();
    bindSearch();
    bindGridEvents();
    extendNavbarSearch();
    renderProducts(false);

    console.log(
      `[affiliate-main] ✅ ${ALL_PRODUCTS.length} products loaded — ` +
      `Amazon:${(window.AmazonProducts||[]).length}  ` +
      `Daraz:${(window.DarazProducts||[]).length}  ` +
      `Temu:${(window.TemuProducts||[]).length}  ` +
      `AliExpress:${(window.AliExpressProducts||[]).length}`
    );
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* ──────────────────────────────────────────────────
     PUBLIC API
  ────────────────────────────────────────────────── */

  window.MeowAffiliate = {
    products:      ALL_PRODUCTS,
    getByCategory: cat => ALL_PRODUCTS.filter(p => p.category === cat),
    getByPlatform: mp  => ALL_PRODUCTS.filter(p =>
                            p.marketplace.toLowerCase().includes(mp.toLowerCase())),
    search:        q   => ALL_PRODUCTS.filter(p =>
                            p.name.toLowerCase().includes(q.toLowerCase()) ||
                            (p.tags||[]).some(t => t.toLowerCase().includes(q.toLowerCase()))),
    setCategory:   cat => { activeCategory = cat; applyFilters(); renderProducts(false); },
    setPlatform:   mp  => { activePlatform = mp;  applyFilters(); renderProducts(false); },
    refresh:       ()  => { applyFilters(); renderProducts(false); }
  };

})();
