/* ================================================================
   AFFILIATE.JS — LINK TAGGING, TRACKING, PRODUCT CARD BUILDER
   ShopLux v3.0
   ================================================================ */

(function () {
  'use strict';

  /* ── AFFILIATE PLATFORM CONFIG ────────────────────────────── */
  const PLATFORMS = {
    amazon     : { param:'tag',           value:'shoplux-20',    label:'Amazon',     icon:'fa-brands fa-amazon', color:'#ff9900', bg:'#fff4e0' },
    daraz      : { param:'aff_id',        value:'SHOPLUX123',    label:'Daraz',      icon:'fas fa-store',        color:'#f85606', bg:'#fff2ee' },
    aliexpress : { param:'aff_platform',  value:'shoplux',       label:'AliExpress', icon:'fas fa-globe',        color:'#ff4747', bg:'#fff0f0' },
    temu       : { param:'useTmtpID',     value:'SHOPLUXAFF',    label:'Temu',       icon:'fas fa-tag',          color:'#f17c23', bg:'#fff6f0' },
  };

  /* ── TAG ALL AFFILIATE LINKS ──────────────────────────────── */
  function tagLinks() {
    document.querySelectorAll('a[href^="http"]').forEach(link => {
      try {
        const url = new URL(link.href);
        for (const [key, conf] of Object.entries(PLATFORMS)) {
          const hostname = url.hostname.toLowerCase();
          if (hostname.includes(key)) {
            url.searchParams.set(conf.param, conf.value);
            link.href = url.toString();
            link.setAttribute('target', '_blank');
            link.setAttribute('rel',    'noopener noreferrer sponsored');
            link.dataset.platform = key;
            break;
          }
        }
      } catch { /* skip non-parseable URLs */ }
    });
  }

  /* ── CLICK TRACKING ───────────────────────────────────────── */
  function initTracking() {
    document.addEventListener('click', e => {
      const link = e.target.closest('a[rel*="sponsored"]');
      if (!link) return;

      const platform = link.dataset.platform || 'unknown';
      const card     = link.closest('.product-card');
      const name     = card?.querySelector('.product-name')?.textContent?.trim()
                    || link.textContent.trim().substring(0, 60)
                    || 'Unknown';
      const price    = card?.querySelector('.price-current')?.textContent?.trim() || '';

      /* Dev log */
      console.log(`[ShopLux Affiliate] ${platform.toUpperCase()} | ${name} ${price ? '| '+price : ''}`);

      /* Google Analytics 4 */
      if (typeof gtag === 'function') {
        gtag('event', 'affiliate_click', {
          affiliate_platform : platform,
          product_name       : name,
          product_price      : price,
        });
      }

      /* Facebook Pixel */
      if (typeof fbq === 'function') {
        fbq('track', 'ViewContent', {
          content_name     : name,
          content_category : platform,
          value            : parseFloat(price.replace(/[^0-9.]/g,'')) || 0,
          currency         : 'USD',
        });
      }

      /* Local click log */
      try {
        const log = JSON.parse(sessionStorage.getItem('sl_aff_log') || '[]');
        log.push({ platform, name, price, ts: Date.now() });
        sessionStorage.setItem('sl_aff_log', JSON.stringify(log.slice(-60)));
      } catch {}
    });
  }

  /* ── PRODUCT CARD HTML BUILDER ────────────────────────────── */
  function buildCard(p, opts = {}) {
    if (!window.ShopLux?.Utils || !window.ShopLux?.Products) return '';
    const { Utils, Products, Wishlist } = ShopLux;

    const afUrl    = Products.getAffiliateUrl(p);
    const discount = Utils.discount(p.orig, p.price);
    const plat     = PLATFORMS[p.platform] || PLATFORMS.amazon;
    const stars    = Utils.stars(p.rating);
    const wishlisted = Wishlist?.has(p.id) || false;
    const esc      = Utils.escapeHTML.bind(Utils);
    const compact  = opts.compact || false;

    return `
    <article class="product-card${compact ? ' compact' : ''}"
             data-id="${p.id}"
             data-category="${p.cat}"
             data-sub="${p.sub}">

      <!-- badges -->
      <div class="product-badges">
        ${p.badge ? `<span class="badge badge-${p.badge}">${p.badge.toUpperCase()}</span>` : ''}
        ${discount >= 10 ? `<span class="badge badge-discount">-${discount}%</span>` : ''}
      </div>

      <!-- wishlist -->
      <button class="wishlist-toggle${wishlisted ? ' active' : ''}"
              data-id="${p.id}"
              data-name="${esc(p.name)}"
              aria-label="${wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}">
        <i class="${wishlisted ? 'fas' : 'far'} fa-heart"></i>
      </button>

      <!-- image -->
      <a href="${afUrl}" target="_blank" rel="noopener noreferrer sponsored"
         data-platform="${p.platform}" class="product-image-wrap" tabindex="-1">
        <img
          src="${p.img}"
          alt="${esc(p.name)}"
          loading="lazy"
          onerror="this.src='https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=400&fit=crop'"
        />
        <div class="product-overlay">
          <span class="quick-buy-pill">
            <i class="fas fa-bolt"></i> Quick Buy
          </span>
        </div>
      </a>

      <!-- info -->
      <div class="product-info">
        <!-- platform badge -->
        <div class="product-source" style="--plat-color:${plat.color};--plat-bg:${plat.bg}">
          <i class="${plat.icon}"></i>
          <span>${plat.label}</span>
        </div>

        <h3 class="product-name">
          <a href="${afUrl}" target="_blank" rel="noopener noreferrer sponsored"
             data-platform="${p.platform}">${esc(p.name)}</a>
        </h3>

        <div class="product-rating" aria-label="${p.rating} out of 5 stars">
          <span class="stars">${stars}</span>
          <span class="rating-count">(${Utils.formatNum(p.reviews)})</span>
        </div>

        <div class="product-price">
          <span class="price-current">${Utils.formatPrice(p.price)}</span>
          ${p.orig > p.price
            ? `<del class="price-original">${Utils.formatPrice(p.orig)}</del>`
            : ''}
          ${discount >= 10
            ? `<span class="price-pill">-${discount}%</span>`
            : ''}
        </div>
      </div>

      <!-- actions -->
      <div class="product-actions">
        <a href="${afUrl}" target="_blank" rel="noopener noreferrer sponsored"
           data-platform="${p.platform}"
           class="btn btn-cta btn-sm">
          <i class="fas fa-bag-shopping"></i> Buy Now
        </a>
        <button class="btn btn-ghost btn-sm btn-icon add-to-cart-btn"
                data-id="${p.id}"
                aria-label="Add to cart">
          <i class="fas fa-cart-plus"></i>
        </button>
      </div>
    </article>`;
  }

  /* ── RENDER A PRODUCT GRID ────────────────────────────────── */
  function renderGrid(containerId, products, opts) {
    const container = document.getElementById(containerId);
    if (!container || !products?.length) return;
    container.innerHTML = products.map(p => buildCard(p, opts)).join('');
    bindDelegation(container);
    ShopLux.Wishlist?.sync();
  }

  /* ── DELEGATED CARD EVENTS ────────────────────────────────── */
  function bindDelegation(root) {
    root = root || document;

    /* wishlist */
    root.addEventListener('click', e => {
      const btn = e.target.closest('.wishlist-toggle[data-id]');
      if (!btn) return;
      e.preventDefault(); e.stopPropagation();
      ShopLux.Wishlist?.toggle(btn.dataset.id, btn.dataset.name || '');
    });

    /* add to cart */
    root.addEventListener('click', e => {
      const btn = e.target.closest('.add-to-cart-btn[data-id]');
      if (!btn) return;
      const product = ShopLux.Products?.getById(btn.dataset.id);
      if (!product) return;

      ShopLux.Cart.add(product);

      /* success flash */
      const icon = btn.querySelector('i');
      const orig = btn.innerHTML;
      btn.innerHTML = '<i class="fas fa-check"></i>';
      btn.style.cssText += ';background:var(--success,#10b981)!important;color:#fff!important;';
      setTimeout(() => {
        btn.innerHTML = orig;
        btn.style.background = '';
        btn.style.color = '';
      }, 1600);
    });
  }

  /* ── AUTO-RENDER GRIDS WITH DATA ATTRIBUTES ───────────────── */
  /* Usage: <div id="myGrid" data-product-grid="featured" data-limit="8"></div> */
  function autoRender() {
    if (!window.ShopLux?.Products) return;
    const { Products } = ShopLux;

    document.querySelectorAll('[data-product-grid]').forEach(container => {
      const type  = container.dataset.productGrid;
      const limit = parseInt(container.dataset.limit, 10) || 8;
      const cat   = container.dataset.category || '';

      let products;
      switch (type) {
        case 'featured':    products = Products.getFeatured(limit); break;
        case 'deals':       products = Products.getDeals(limit);    break;
        case 'new':         products = Products.getNewArrivals(limit); break;
        case 'top-rated':   products = Products.getTopRated(limit); break;
        case 'category':    products = Products.getByCategory(cat).slice(0, limit); break;
        case 'random':      products = Products.getRandom(limit);   break;
        default:            products = Products.getFeatured(limit);
      }

      renderGrid(container.id, products, { compact: container.dataset.compact === 'true' });
    });
  }

  /* ── AFFILIATE DISCLOSURE BANNER ──────────────────────────── */
  function ensureDisclosure() {
    if (document.getElementById('affiliateDisclosure')) return;
    const main = document.getElementById('mainContent') || document.querySelector('main');
    if (!main) return;

    const div = document.createElement('div');
    div.id        = 'affiliateDisclosure';
    div.className = 'affiliate-banner';
    div.setAttribute('role', 'note');
    div.innerHTML = `
      <i class="fas fa-circle-info"></i>
      <p>
        <strong>Affiliate Disclosure:</strong>
        ShopLux earns commissions from Amazon, Daraz, AliExpress & Temu at
        <strong>no extra cost</strong> to you.
        <a href="/disclosure.html" target="_blank">Learn more</a>
      </p>
      <button id="disclosureClose" aria-label="Dismiss">
        <i class="fas fa-xmark"></i>
      </button>
    `;
    main.prepend(div);
  }

  /* ── PAYMENT ICONS DISPLAY ────────────────────────────────── */
  /* injects beautiful payment card icons wherever .payment-icons exists */
  function renderPaymentIcons() {
    document.querySelectorAll('.payment-icons:not([data-rendered])').forEach(container => {
      container.setAttribute('data-rendered', '1');
      if (container.children.length) return; /* already has content */

      const cards = [
        { label:'Visa',       html:'<svg viewBox="0 0 780 500" style="height:28px;"><rect width="780" height="500" rx="40" fill="#1a1f71"/><text x="390" y="320" text-anchor="middle" font-family="Arial" font-size="200" font-weight="900" fill="#fff" font-style="italic">VISA</text></svg>' },
        { label:'Mastercard', html:'<svg viewBox="0 0 780 500" style="height:28px;"><rect width="780" height="500" rx="40" fill="#252525"/><circle cx="290" cy="250" r="190" fill="#eb001b"/><circle cx="490" cy="250" r="190" fill="#f79e1b"/><path d="M390 107 A190 190 0 0 1 490 250 A190 190 0 0 1 390 393 A190 190 0 0 0 290 250 A190 190 0 0 0 390 107Z" fill="#ff5f00"/></svg>' },
        { label:'PayPal',     html:'<svg viewBox="0 0 780 500" style="height:28px;"><rect width="780" height="500" rx="40" fill="#003087"/><text x="390" y="320" text-anchor="middle" font-family="Arial" font-size="130" font-weight="900" fill="#009cde">Pay</text><text x="520" y="320" text-anchor="start" font-family="Arial" font-size="130" font-weight="900" fill="#012169">Pal</text></svg>' },
        { label:'Amex',       html:'<svg viewBox="0 0 780 500" style="height:28px;"><rect width="780" height="500" rx="40" fill="#007bc1"/><text x="390" y="300" text-anchor="middle" font-family="Arial" font-size="100" font-weight="900" fill="#fff" letter-spacing="6">AMERICAN</text><text x="390" y="400" text-anchor="middle" font-family="Arial" font-size="100" font-weight="900" fill="#fff" letter-spacing="2">EXPRESS</text></svg>' },
        { label:'Cash on Delivery', html:'<div style="height:28px;padding:0 8px;background:#e8f5e9;border-radius:4px;display:flex;align-items:center;gap:5px;font-size:11px;font-weight:700;color:#2e7d32;white-space:nowrap;"><i class="fas fa-money-bill-wave"></i>COD</div>' },
      ];

      container.innerHTML = cards
        .map(c => `<span class="pay-icon" title="${c.label}" aria-label="${c.label}">${c.html}</span>`)
        .join('');
    });
  }

  /* ── INIT ─────────────────────────────────────────────────── */
  function init() {
    ensureDisclosure();
    tagLinks();
    initTracking();
    bindDelegation(document);
    autoRender();
    renderPaymentIcons();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* ── PUBLIC API ───────────────────────────────────────────── */
  window.ShopLux = window.ShopLux || {};
  ShopLux.Affiliate = { buildCard, renderGrid, PLATFORMS };

})();
