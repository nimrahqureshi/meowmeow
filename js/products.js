/* ============================
   PRODUCTS.JS — PRODUCTS PAGE
   Category filter, subcategory bar, sort,
   load-more, wishlist persistence, URL params
   ============================ */

(function() {
  'use strict';

  /* ─────────────────────────────
     SUBCATEGORY MAP
  ───────────────────────────── */

  const subcategories = {
    women:       ['Dresses','Tops','Jeans','Skirts','Activewear','Swimwear','Lingerie'],
    men:         ['Shirts','T-Shirts','Pants','Suits','Activewear','Shorts','Underwear'],
    kids:        ['Boys','Girls','Baby','School Wear','Toys','Footwear'],
    shoes:       ['Sneakers','Heels','Flats','Boots','Sandals','Sport'],
    bags:        ['Handbags','Backpacks','Totes','Wallets','Clutches'],
    jewelry:     ['Necklaces','Rings','Earrings','Bracelets','Anklets','Watches'],
    watches:     ['Smart Watches','Analog','Digital','Luxury','Sport'],
    beauty:      ['Skincare','Makeup','Haircare','Fragrance','Nails','Tools'],
    pets:        ['Dogs','Cats','Birds','Fish','Small Pets','Supplies'],
    toys:        ['Action Figures','Board Games','Puzzles','Educational','Outdoor','STEM'],
    electronics: ['Phones','Laptops','Audio','Smart Home','Cameras','Gaming','Accessories'],
    crafts:      ['Painting','Sewing','Knitting','Paper Crafts','Resin','Scrapbooking'],
    home:        ['Furniture','Kitchen','Decor','Bedding','Lighting','Storage','Garden'],
    accessories: ['Hats','Belts','Sunglasses','Scarves','Gloves','Hair Accessories'],
    flowers:     ['Artificial','Fresh Bouquets','Dried','Seasonal','Gift Sets']
  };

  /* ─────────────────────────────
     STATE
  ───────────────────────────── */

  let activeCategory = 'all';
  let activeSubcategory = 'all';
  let activeSort = 'default';
  let currentPage = 1;
  const ITEMS_PER_PAGE = 12;
  let allCards = [];

  /* ─────────────────────────────
     WISHLIST PERSISTENCE
  ───────────────────────────── */

  function loadWishlist() {
    try { return JSON.parse(localStorage.getItem('meowmeow-wishlist')) || []; } catch(e) { return []; }
  }

  function saveWishlist(list) {
    try { localStorage.setItem('meowmeow-wishlist', JSON.stringify(list)); } catch(e) {}
  }

  let wishlist = loadWishlist();

  function toggleWishlist(id, btn) {
    const idx = wishlist.indexOf(id);
    if (idx === -1) {
      wishlist.push(id);
      btn.classList.add('active');
      btn.querySelector('i')?.classList.replace('far', 'fas');
      if (typeof window.showToast === 'function') window.showToast('Added to wishlist ❤️', 'success');
    } else {
      wishlist.splice(idx, 1);
      btn.classList.remove('active');
      btn.querySelector('i')?.classList.replace('fas', 'far');
      if (typeof window.showToast === 'function') window.showToast('Removed from wishlist', 'warning');
    }
    saveWishlist(wishlist);
  }

  function applyWishlistState() {
    document.querySelectorAll('.wishlist-toggle').forEach(btn => {
      const card = btn.closest('.product-card');
      if (!card) return;
      const id = card.dataset.productId || card.dataset.id;
      if (!id) return;
      if (wishlist.includes(id)) {
        btn.classList.add('active');
        btn.querySelector('i')?.classList.replace('far', 'fas');
      }
    });
  }

  function bindWishlistButtons() {
    document.querySelectorAll('.wishlist-toggle:not([data-wl-bound])').forEach(btn => {
      btn.setAttribute('data-wl-bound', '1');
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        const card = this.closest('.product-card');
        const id   = card?.dataset.productId || card?.dataset.id;
        if (id) toggleWishlist(id, this);
      });
    });
  }

  /* ─────────────────────────────
     FILTER
  ───────────────────────────── */

  function getVisibleCards() {
    return allCards.filter(card => {
      const cat  = card.dataset.category || 'all';
      const sub  = card.dataset.subcategory || '';
      const catMatch = activeCategory === 'all' || cat === activeCategory;
      const subMatch = activeSubcategory === 'all' || sub === activeSubcategory;
      return catMatch && subMatch;
    });
  }

  function sortCards(cards) {
    const sorted = [...cards];
    if (activeSort === 'price-asc') {
      sorted.sort((a, b) => getPrice(a) - getPrice(b));
    } else if (activeSort === 'price-desc') {
      sorted.sort((a, b) => getPrice(b) - getPrice(a));
    } else if (activeSort === 'rating') {
      sorted.sort((a, b) => getRating(b) - getRating(a));
    } else if (activeSort === 'newest') {
      sorted.reverse();
    }
    return sorted;
  }

  function getPrice(card) {
    const el = card.querySelector('.price-current');
    return el ? parseFloat(el.textContent.replace(/[^0-9.]/g, '')) || 0 : 0;
  }

  function getRating(card) {
    const el = card.querySelector('.rating-count');
    return el ? parseFloat(el.textContent.replace(/[^0-9.]/g, '')) || 0 : 0;
  }

  function renderProducts() {
    const grid = document.getElementById('productGrid');
    const noResults = document.getElementById('noResults');
    if (!grid) return;

    const visible = sortCards(getVisibleCards());
    const paginated = visible.slice(0, currentPage * ITEMS_PER_PAGE);

    // Hide all first
    allCards.forEach(card => { card.style.display = 'none'; });

    // Show paginated
    paginated.forEach((card, i) => {
      card.style.display = '';
      card.style.animationDelay = (i % ITEMS_PER_PAGE * 0.04) + 's';
      card.classList.remove('card-enter');
      void card.offsetWidth;
      card.classList.add('card-enter');
    });

    // Update count
    const countEl = document.getElementById('productCount');
    if (countEl) countEl.textContent = visible.length;

    // No results message
    if (noResults) {
      noResults.style.display = visible.length === 0 ? 'block' : 'none';
    }

    // Load more button
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
      loadMoreBtn.style.display = paginated.length < visible.length ? 'inline-flex' : 'none';
    }
  }

  /* ─────────────────────────────
     SUBCATEGORY BAR
  ───────────────────────────── */

  function renderSubcategories(category) {
    const bar = document.getElementById('subcategoryBar');
    if (!bar) return;

    const subs = subcategories[category];
    if (!subs || subs.length === 0) {
      bar.style.display = 'none';
      return;
    }

    bar.style.display = 'flex';
    bar.innerHTML = `
      <button class="filter-btn active" data-subfilter="all">All ${capitalize(category)}</button>
      ${subs.map(s => `<button class="filter-btn" data-subfilter="${slugify(s)}">${s}</button>`).join('')}
    `;

    bar.querySelectorAll('[data-subfilter]').forEach(btn => {
      btn.addEventListener('click', function() {
        bar.querySelectorAll('[data-subfilter]').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        activeSubcategory = this.dataset.subfilter;
        currentPage = 1;
        renderProducts();
      });
    });
  }

  /* ─────────────────────────────
     CATEGORY FILTER BUTTONS
  ───────────────────────────── */

  function initFilters() {
    document.querySelectorAll('.filter-btn[data-filter]').forEach(btn => {
      btn.addEventListener('click', function() {
        document.querySelectorAll('.filter-btn[data-filter]').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        activeCategory    = this.dataset.filter;
        activeSubcategory = 'all';
        currentPage       = 1;
        renderSubcategories(activeCategory);
        renderProducts();

        // Update URL param without reload
        try {
          const url = new URL(window.location.href);
          if (activeCategory === 'all') url.searchParams.delete('cat');
          else url.searchParams.set('cat', activeCategory);
          history.replaceState(null, '', url.toString());
        } catch(e) {}
      });
    });
  }

  /* ─────────────────────────────
     SORT SELECT
  ───────────────────────────── */

  function initSort() {
    const sortSelect = document.getElementById('sortSelect');
    if (!sortSelect) return;
    sortSelect.addEventListener('change', function() {
      activeSort = this.value;
      currentPage = 1;
      renderProducts();
    });
  }

  /* ─────────────────────────────
     LOAD MORE
  ───────────────────────────── */

  function initLoadMore() {
    const btn = document.getElementById('loadMoreBtn');
    if (!btn) return;
    btn.addEventListener('click', function() {
      currentPage++;
      renderProducts();
      // Scroll to newly appeared items
      const grid = document.getElementById('productGrid');
      if (grid) {
        const cards = grid.querySelectorAll('.product-card:not([style*="display: none"])');
        const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
        const newCard  = cards[startIdx];
        if (newCard) {
          setTimeout(() => {
            newCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }, 100);
        }
      }
    });
  }

  /* ─────────────────────────────
     URL PARAM: pre-select category
  ───────────────────────────── */

  function applyUrlParams() {
    try {
      const params = new URLSearchParams(window.location.search);
      const cat = params.get('cat');
      if (cat) {
        const btn = document.querySelector(`.filter-btn[data-filter="${cat}"]`);
        if (btn) btn.click();
      }
    } catch(e) {}
  }

  /* ─────────────────────────────
     PRICE RANGE SLIDER
  ───────────────────────────── */

  function initPriceRange() {
    const slider  = document.getElementById('priceRange');
    const display = document.getElementById('priceDisplay');
    if (!slider || !display) return;

    slider.addEventListener('input', function() {
      const maxPrice = parseInt(this.value);
      display.textContent = '$' + maxPrice;

      allCards.forEach(card => {
        const price = getPrice(card);
        // Mark card with price filter attribute
        card.dataset.priceVisible = (price === 0 || price <= maxPrice) ? '1' : '0';
      });

      renderProducts();
    });
  }

  /* ─────────────────────────────
     HELPERS
  ───────────────────────────── */

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function slugify(str) {
    return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }

  /* ─────────────────────────────
     INJECT PRODUCTS PAGE STYLES
  ───────────────────────────── */

  function injectStyles() {
    if (document.getElementById('products-js-styles')) return;
    const style = document.createElement('style');
    style.id = 'products-js-styles';
    style.textContent = `
      /* Subcategory bar */
      #subcategoryBar {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin: 12px 0 28px;
        padding: 16px;
        background: var(--bg-secondary);
        border-radius: var(--radius-lg);
        border: 1px solid var(--border);
      }

      /* Sort + count toolbar */
      .products-toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 12px;
        margin-bottom: 24px;
      }
      .products-toolbar .count-label {
        font-size: 0.9rem;
        color: var(--text-secondary);
      }
      .products-toolbar .count-label strong { color: var(--accent); }

      #sortSelect {
        padding: 8px 14px;
        border: 1px solid var(--border);
        border-radius: var(--radius-full);
        background: var(--bg-secondary);
        color: var(--text-primary);
        font-size: 0.9rem;
        cursor: pointer;
        transition: var(--transition-fast);
      }
      #sortSelect:hover { border-color: var(--accent); }

      /* Load more button */
      #loadMoreBtn {
        display: none;
        margin: 40px auto 0;
      }

      /* No results */
      #noResults {
        display: none;
        text-align: center;
        padding: 60px 20px;
        grid-column: 1/-1;
      }
      #noResults .no-results-icon {
        font-size: 4rem;
        margin-bottom: 16px;
        opacity: 0.4;
      }
    `;
    document.head.appendChild(style);
  }

  /* ─────────────────────────────
     CREATE MISSING DOM ELEMENTS
  ───────────────────────────── */

  function ensureToolbar() {
    const grid = document.getElementById('productGrid');
    if (!grid) return;

    // Subcategory bar
    if (!document.getElementById('subcategoryBar')) {
      const bar = document.createElement('div');
      bar.id = 'subcategoryBar';
      bar.style.display = 'none';
      grid.before(bar);
    }

    // Toolbar
    if (!document.querySelector('.products-toolbar')) {
      const toolbar = document.createElement('div');
      toolbar.className = 'products-toolbar';
      toolbar.innerHTML = `
        <p class="count-label">Showing <strong id="productCount">${allCards.length}</strong> products</p>
        <select id="sortSelect" aria-label="Sort products">
          <option value="default">Sort: Featured</option>
          <option value="price-asc">Price: Low → High</option>
          <option value="price-desc">Price: High → Low</option>
          <option value="rating">Highest Rated</option>
          <option value="newest">Newest First</option>
        </select>
      `;
      grid.before(toolbar);
    }

    // No results
    if (!document.getElementById('noResults')) {
      const nr = document.createElement('div');
      nr.id = 'noResults';
      nr.innerHTML = `
        <div class="no-results-icon">🔍</div>
        <h3>No products found</h3>
        <p>Try a different category or filter.</p>
        <button class="btn btn-outline" onclick="document.querySelector('.filter-btn[data-filter=all]')?.click()">
          Show All Products
        </button>
      `;
      grid.appendChild(nr);
    }

    // Load more button
    if (!document.getElementById('loadMoreBtn')) {
      const btnWrap = document.createElement('div');
      btnWrap.style.cssText = 'text-align:center; margin-top:40px;';
      btnWrap.innerHTML = `
        <button class="btn btn-outline btn-lg" id="loadMoreBtn">
          <i class="fas fa-plus"></i> Load More Products
        </button>
      `;
      grid.after(btnWrap);
    }
  }

  /* ─────────────────────────────
     INIT
  ───────────────────────────── */

  document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('productGrid');
    if (!grid) return; // Not on products page

    injectStyles();

    // Collect all product cards
    allCards = Array.from(grid.querySelectorAll('.product-card'));

    ensureToolbar();
    initFilters();
    initSort();
    initLoadMore();
    initPriceRange();
    applyWishlistState();
    bindWishlistButtons();
    renderProducts();
    applyUrlParams();

    // Re-run wishlist bindings when new cards are added
    const observer = new MutationObserver(() => {
      allCards = Array.from(grid.querySelectorAll('.product-card'));
      applyWishlistState();
      bindWishlistButtons();
    });
    observer.observe(grid, { childList: true });
  });

})();
