/* ================================================================
   SEARCH.JS — LIVE PRODUCT SEARCH (real catalog, keyboard nav)
   ShopLux v3.0
   ================================================================ */

(function () {
  'use strict';

  /* ── REFS ─────────────────────────────────────────────────── */
  const searchToggle  = document.getElementById('searchToggle');
  const navSearch     = document.getElementById('navSearch');
  const searchInput   = document.getElementById('searchInput');
  const searchClear   = document.getElementById('searchClear');
  const searchResults = document.getElementById('searchResults');
  const mobileInput   = document.getElementById('mobileSearchInput');

  if (!searchInput && !mobileInput) return;

  let selectedIdx = -1;

  /* ── TOGGLE SEARCH BAR ────────────────────────────────────── */
  searchToggle?.addEventListener('click', () => {
    const open = navSearch?.classList.toggle('active');
    searchToggle.setAttribute('aria-expanded', String(!!open));
    if (open) setTimeout(() => searchInput?.focus(), 60);
  });

  /* ── SEARCH EXECUTION ─────────────────────────────────────── */
  function doSearch(q) {
    q = (q || '').trim();
    if (q.length < 2) { hideResults(); return; }

    const products = window.ShopLux?.Products
      ? ShopLux.Products.search(q)
      : [];

    renderResults(products, q);
  }

  /* ── RENDER RESULTS ───────────────────────────────────────── */
  function renderResults(products, query) {
    if (!searchResults) return;

    const u      = window.ShopLux?.Utils;
    const escRe  = u ? u.escapeRegex(query) : query.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    const escHtml= u ? u.escapeHTML.bind(u)  : s => s;
    const re     = new RegExp(`(${escRe})`, 'gi');

    const PLATFORM_ICONS = {
      amazon    : { icon:'fa-brands fa-amazon', color:'#ff9900', label:'Amazon' },
      daraz     : { icon:'fas fa-store',         color:'#f85606', label:'Daraz'  },
      aliexpress: { icon:'fas fa-globe',         color:'#ff4747', label:'AliExpress' },
      temu      : { icon:'fas fa-tag',           color:'#f17c23', label:'Temu'   },
    };

    if (products.length === 0) {
      searchResults.innerHTML = `
        <div class="search-empty">
          <div class="search-empty-icon"><i class="fas fa-magnifying-glass"></i></div>
          <p class="search-empty-title">No results for <strong>"${escHtml(query)}"</strong></p>
          <p class="search-empty-hint">Try: dress, sneakers, earbuds, skincare…</p>
        </div>
      `;
    } else {
      const show = products.slice(0, 9);
      const rest = products.length - show.length;

      const highlight = str => str.replace(re, '<mark>$1</mark>');

      const html = show.map((p, idx) => {
        const afUrl    = ShopLux.Products.getAffiliateUrl(p);
        const discount = u ? u.discount(p.orig, p.price) : 0;
        const plat     = PLATFORM_ICONS[p.platform] || PLATFORM_ICONS.amazon;

        return `
          <a class="search-result-item"
             href="${afUrl}"
             target="_blank"
             rel="noopener noreferrer sponsored"
             data-platform="${p.platform}"
             data-idx="${idx}"
             tabindex="-1"
             aria-label="${escHtml(p.name)} — $${p.price.toFixed(2)} on ${plat.label}">
            <div class="sri-img">
              <img src="${p.img}" alt="${escHtml(p.name)}" loading="lazy"
                   onerror="this.parentNode.innerHTML='<div class=\'sri-img-fallback\'><i class=\'fas fa-image\'></i></div>'" />
            </div>
            <div class="sri-body">
              <h4 class="sri-name">${highlight(escHtml(p.name))}</h4>
              <p class="sri-meta">
                <span class="sri-cat">${p.cat}</span>
                <span class="sri-dot">·</span>
                <i class="${plat.icon}" style="color:${plat.color}"></i>
                <span>${plat.label}</span>
              </p>
            </div>
            <div class="sri-price">
              <span class="sri-current">$${p.price.toFixed(2)}</span>
              ${discount >= 10 ? `<span class="sri-discount">-${discount}%</span>` : ''}
            </div>
          </a>
        `;
      }).join('');

      const footer = rest > 0
        ? `<div class="search-results-footer">
             Showing ${show.length} of ${products.length} results
           </div>`
        : '';

      searchResults.innerHTML = html + footer;
    }

    searchResults.classList.add('active');
    selectedIdx = -1;
  }

  function hideResults() {
    searchResults?.classList.remove('active');
    selectedIdx = -1;
  }

  /* ── DEBOUNCED INPUT ──────────────────────────────────────── */
  const debounceSearch = window.ShopLux?.Utils
    ? ShopLux.Utils.debounce(doSearch, 180)
    : (() => { let t; return q => { clearTimeout(t); t = setTimeout(() => doSearch(q), 180); }; })();

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const q = searchInput.value;
      searchClear?.classList.toggle('visible', q.length > 0);
      debounceSearch(q);
    });

    searchInput.addEventListener('focus', () => {
      if (searchInput.value.trim().length >= 2) doSearch(searchInput.value);
    });
  }

  /* mobile search */
  mobileInput?.addEventListener('input', () => debounceSearch(mobileInput.value));

  /* ── CLEAR ────────────────────────────────────────────────── */
  searchClear?.addEventListener('click', () => {
    if (searchInput) { searchInput.value = ''; searchInput.focus(); }
    searchClear.classList.remove('visible');
    hideResults();
  });

  /* ── KEYBOARD NAVIGATION ──────────────────────────────────── */
  searchInput?.addEventListener('keydown', function (e) {
    if (!searchResults?.classList.contains('active')) return;

    const items = searchResults.querySelectorAll('.search-result-item');
    if (!items.length) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        selectedIdx = Math.min(selectedIdx + 1, items.length - 1);
        _highlightItem(items);
        break;

      case 'ArrowUp':
        e.preventDefault();
        if (selectedIdx <= 0) { selectedIdx = -1; searchInput.focus(); }
        else { selectedIdx--; _highlightItem(items); }
        break;

      case 'Enter':
        e.preventDefault();
        if (selectedIdx >= 0 && items[selectedIdx]) {
          items[selectedIdx].click();
        } else if (items[0]) {
          items[0].click();
        }
        break;

      case 'Escape':
        hideResults();
        navSearch?.classList.remove('active');
        searchInput.blur();
        break;
    }
  });

  function _highlightItem(items) {
    items.forEach((item, i) => {
      const on = i === selectedIdx;
      item.classList.toggle('focused', on);
      if (on) item.scrollIntoView({ block: 'nearest' });
    });
  }

  /* ── CLOSE ON OUTSIDE CLICK ───────────────────────────────── */
  document.addEventListener('click', function (e) {
    const inSearch  = navSearch?.contains(e.target);
    const isToggle  = searchToggle?.contains(e.target);
    if (!inSearch && !isToggle) {
      hideResults();
      if (window.innerWidth < 1100) {
        navSearch?.classList.remove('active');
        searchToggle?.setAttribute('aria-expanded', 'false');
      }
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      hideResults();
      navSearch?.classList.remove('active');
    }
  });

  /* ── INJECT SEARCH STYLES (once) ─────────────────────────── */
  if (!document.getElementById('shoplux-search-styles')) {
    const s = document.createElement('style');
    s.id = 'shoplux-search-styles';
    s.textContent = `
      .search-result-item mark {
        background:color-mix(in srgb,var(--accent,#c026d3) 18%,transparent);
        color:var(--accent,#c026d3);
        padding:0 2px;border-radius:3px;font-weight:700;
      }
      .search-result-item.focused,
      .search-result-item:focus-visible {
        outline:none;
        background:var(--surface-hover,rgba(192,38,211,.06));
        box-shadow:inset 3px 0 0 var(--accent,#c026d3);
      }
      .search-empty { text-align:center;padding:32px 16px; }
      .search-empty-icon { font-size:2.5rem;color:var(--text-tertiary,#aaa);margin-bottom:12px; }
      .search-empty-title { font-size:.9rem;font-weight:600;color:var(--text-primary,#111); }
      .search-empty-hint  { font-size:.8rem;color:var(--text-tertiary,#999);margin-top:6px; }
      .search-results-footer {
        text-align:center;padding:10px 16px;font-size:.78rem;
        color:var(--text-tertiary,#999);border-top:1px solid var(--border,#e5e7eb);
      }
    `;
    document.head.appendChild(s);
  }

})();
