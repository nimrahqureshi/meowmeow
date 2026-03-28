/* ============================
   PRODUCTS.JS — PRODUCTS PAGE  (FIXED v2)
   Category filter, subcategory bar, sort, load-more,
   wishlist persistence, URL params
   ============================ */

(function () {
  'use strict';

  /* ─── SUBCATEGORY MAP ─── */
  var subcategories = {
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

  /* ─── STATE ─── */
  var activeCategory    = 'all';
  var activeSubcategory = 'all';
  var activeSort        = 'default';
  var currentPage       = 1;
  var ITEMS_PER_PAGE    = 12;
  var allCards          = [];

  /* ─── WISHLIST ─── */
  function loadWishlist() {
    try { return JSON.parse(localStorage.getItem('meowmeow-wishlist')) || []; }
    catch (e) { return []; }
  }
  function saveWishlist(list) {
    try { localStorage.setItem('meowmeow-wishlist', JSON.stringify(list)); } catch (e) {}
  }

  var wishlist = loadWishlist();

  function toggleWishlist(id, btn) {
    var idx = wishlist.indexOf(id);
    if (idx === -1) {
      wishlist.push(id);
      btn.classList.add('active');
      var i = btn.querySelector('i');
      if (i) { i.classList.remove('far'); i.classList.add('fas'); }
      if (window.showToast) showToast('Added to wishlist \u2764\uFE0F', 'success');
    } else {
      wishlist.splice(idx, 1);
      btn.classList.remove('active');
      var i2 = btn.querySelector('i');
      if (i2) { i2.classList.remove('fas'); i2.classList.add('far'); }
      if (window.showToast) showToast('Removed from wishlist', 'warning');
    }
    saveWishlist(wishlist);
  }

  function applyWishlistState() {
    document.querySelectorAll('.wishlist-toggle').forEach(function (btn) {
      var card = btn.closest('.product-card');
      if (!card) return;
      var id = card.dataset.productId || card.dataset.id;
      if (!id) return;
      if (wishlist.indexOf(id) !== -1) {
        btn.classList.add('active');
        var i = btn.querySelector('i');
        if (i) { i.classList.remove('far'); i.classList.add('fas'); }
      }
    });
  }

  function bindWishlistButtons() {
    document.querySelectorAll('.wishlist-toggle:not([data-wl-bound])').forEach(function (btn) {
      btn.setAttribute('data-wl-bound', '1');
      btn._meowBound = true;
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var card = this.closest('.product-card');
        var id   = card ? (card.dataset.productId || card.dataset.id) : null;
        if (id) toggleWishlist(id, this);
      });
    });
  }

  /* ─── FILTER ─── */
  function getVisibleCards() {
    return allCards.filter(function (card) {
      var cat = card.dataset.category || 'all';
      var sub = card.dataset.subcategory || '';
      var catMatch = activeCategory    === 'all' || cat === activeCategory;
      var subMatch = activeSubcategory === 'all' || sub === activeSubcategory;
      return catMatch && subMatch;
    });
  }

  function getPrice(card) {
    var el = card.querySelector('.price-current');
    return el ? parseFloat(el.textContent.replace(/[^0-9.]/g, '')) || 0 : 0;
  }

  function getRating(card) {
    var el = card.querySelector('.rating-count');
    return el ? parseFloat(el.textContent.replace(/[^0-9.]/g, '')) || 0 : 0;
  }

  function sortCards(cards) {
    var sorted = cards.slice();
    if (activeSort === 'price-asc')  sorted.sort(function (a, b) { return getPrice(a) - getPrice(b); });
    if (activeSort === 'price-desc') sorted.sort(function (a, b) { return getPrice(b) - getPrice(a); });
    if (activeSort === 'rating')     sorted.sort(function (a, b) { return getRating(b) - getRating(a); });
    if (activeSort === 'newest')     sorted.reverse();
    return sorted;
  }

  function renderProducts() {
    var grid     = document.getElementById('productGrid');
    var noResults = document.getElementById('noResults');
    if (!grid) return;

    var visible   = sortCards(getVisibleCards());
    var paginated = visible.slice(0, currentPage * ITEMS_PER_PAGE);

    allCards.forEach(function (card) { card.style.display = 'none'; });

    paginated.forEach(function (card, i) {
      card.style.display = '';
      card.style.animationDelay = (i % ITEMS_PER_PAGE * 0.04) + 's';
      card.classList.remove('card-enter');
      void card.offsetWidth;
      card.classList.add('card-enter');
    });

    var countEl = document.getElementById('productCount');
    if (countEl) countEl.textContent = visible.length;

    if (noResults) noResults.style.display = visible.length === 0 ? 'block' : 'none';

    var loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
      loadMoreBtn.style.display = paginated.length < visible.length ? 'inline-flex' : 'none';
    }
  }

  /* ─── SUBCATEGORY BAR ─── */
  function renderSubcategories(category) {
    var bar = document.getElementById('subcategoryBar');
    if (!bar) return;
    var subs = subcategories[category];
    if (!subs || !subs.length) { bar.style.display = 'none'; return; }

    bar.style.display = 'flex';
    bar.innerHTML =
      '<button class="filter-btn active" data-subfilter="all">All ' + capitalize(category) + '</button>' +
      subs.map(function (s) {
        return '<button class="filter-btn" data-subfilter="' + slugify(s) + '">' + s + '</button>';
      }).join('');

    bar.querySelectorAll('[data-subfilter]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        bar.querySelectorAll('[data-subfilter]').forEach(function (b) { b.classList.remove('active'); });
        this.classList.add('active');
        activeSubcategory = this.dataset.subfilter;
        currentPage = 1;
        renderProducts();
      });
    });
  }

  /* ─── CATEGORY FILTER BUTTONS ─── */
  function initFilters() {
    document.querySelectorAll('.filter-btn[data-filter]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.filter-btn[data-filter]').forEach(function (b) { b.classList.remove('active'); });
        this.classList.add('active');
        activeCategory    = this.dataset.filter;
        activeSubcategory = 'all';
        currentPage       = 1;
        renderSubcategories(activeCategory);
        renderProducts();

        try {
          var url = new URL(window.location.href);
          if (activeCategory === 'all') url.searchParams.delete('cat');
          else url.searchParams.set('cat', activeCategory);
          history.replaceState(null, '', url.toString());
        } catch (e) {}
      });
    });
  }

  /* ─── SORT ─── */
  function initSort() {
    var sel = document.getElementById('sortSelect');
    if (!sel) return;
    sel.addEventListener('change', function () {
      activeSort  = this.value;
      currentPage = 1;
      renderProducts();
    });
  }

  /* ─── LOAD MORE ─── */
  function initLoadMore() {
    var btn = document.getElementById('loadMoreBtn');
    if (!btn) return;
    btn.addEventListener('click', function () {
      currentPage++;
      renderProducts();
      var grid  = document.getElementById('productGrid');
      if (!grid) return;
      var cards = grid.querySelectorAll('.product-card:not([style*="display: none"])');
      var newCard = cards[(currentPage - 1) * ITEMS_PER_PAGE];
      if (newCard) setTimeout(function () {
        newCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    });
  }

  /* ─── URL PARAMS ─── */
  function applyUrlParams() {
    try {
      var cat = new URLSearchParams(window.location.search).get('cat');
      if (cat) {
        var btn = document.querySelector('.filter-btn[data-filter="' + cat + '"]');
        if (btn) btn.click();
      }
    } catch (e) {}
  }

  /* ─── ENSURE TOOLBAR DOM ─── */
  function injectStyles() {
    if (document.getElementById('products-js-styles')) return;
    var style = document.createElement('style');
    style.id  = 'products-js-styles';
    style.textContent = [
      '#subcategoryBar{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0 28px;',
        'padding:16px;background:var(--bg-secondary);border-radius:var(--radius-lg);',
        'border:1px solid var(--border);}',
      '.products-toolbar{display:flex;align-items:center;justify-content:space-between;',
        'flex-wrap:wrap;gap:12px;margin-bottom:24px;}',
      '.products-toolbar .count-label{font-size:.9rem;color:var(--text-secondary);}',
      '.products-toolbar .count-label strong{color:var(--accent);}',
      '#sortSelect{padding:8px 14px;border:1px solid var(--border);border-radius:var(--radius-full);',
        'background:var(--bg-secondary);color:var(--text-primary);font-size:.9rem;cursor:pointer;}',
      '#loadMoreBtn{display:none;margin:40px auto 0;}',
      '#noResults{display:none;text-align:center;padding:60px 20px;grid-column:1/-1;}',
      '#noResults .no-results-icon{font-size:4rem;margin-bottom:16px;opacity:.4;display:block;}'
    ].join('');
    document.head.appendChild(style);
  }

  function ensureToolbar() {
    var grid = document.getElementById('productGrid');
    if (!grid) return;

    if (!document.getElementById('subcategoryBar')) {
      var bar = document.createElement('div');
      bar.id = 'subcategoryBar';
      bar.style.display = 'none';
      grid.before(bar);
    }

    if (!document.querySelector('.products-toolbar')) {
      var toolbar = document.createElement('div');
      toolbar.className = 'products-toolbar';
      toolbar.innerHTML =
        '<p class="count-label">Showing <strong id="productCount">' + allCards.length + '</strong> products</p>' +
        '<select id="sortSelect" aria-label="Sort products">' +
          '<option value="default">Sort: Featured</option>' +
          '<option value="price-asc">Price: Low \u2192 High</option>' +
          '<option value="price-desc">Price: High \u2192 Low</option>' +
          '<option value="rating">Highest Rated</option>' +
          '<option value="newest">Newest First</option>' +
        '</select>';
      grid.before(toolbar);
    }

    if (!document.getElementById('noResults')) {
      var nr = document.createElement('div');
      nr.id = 'noResults';
      nr.innerHTML =
        '<span class="no-results-icon">\uD83D\uDD0D</span>' +
        '<h3>No products found</h3>' +
        '<p>Try a different category or filter.</p>' +
        '<button class="btn btn-outline" onclick="document.querySelector(\'.filter-btn[data-filter=all]\')?.click()">' +
          'Show All Products</button>';
      grid.appendChild(nr);
    }

    if (!document.getElementById('loadMoreBtn')) {
      var btnWrap = document.createElement('div');
      btnWrap.style.cssText = 'text-align:center;margin-top:40px;';
      btnWrap.innerHTML =
        '<button class="btn btn-outline btn-lg" id="loadMoreBtn">' +
          '<i class="fas fa-plus"></i> Load More Products</button>';
      grid.after(btnWrap);
    }
  }

  /* ─── HELPERS ─── */
  function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function slugify(s)    { return s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''); }

  /* ─── INIT ─── */
  document.addEventListener('DOMContentLoaded', function () {
    var grid = document.getElementById('productGrid');
    if (!grid) return;

    injectStyles();
    allCards = Array.from(grid.querySelectorAll('.product-card'));
    ensureToolbar();
    initFilters();
    initSort();
    initLoadMore();
    applyWishlistState();
    bindWishlistButtons();
    renderProducts();
    applyUrlParams();

    var mo = new MutationObserver(function () {
      allCards = Array.from(grid.querySelectorAll('.product-card'));
      applyWishlistState();
      bindWishlistButtons();
    });
    mo.observe(grid, { childList: true });
  });

})();
