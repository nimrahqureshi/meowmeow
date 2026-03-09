/* ============================================================
   SEARCH.JS — LIVE PRODUCT SEARCH
   ============================================================ */

(function() {
  'use strict';

  // Full product catalog for search
  const catalog = [
    // Women's Fashion
    { name: "Women's Floral Boho Dress", price: "$19.99", cat: "Women's Fashion", img: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=80&h=80&fit=crop" },
    { name: "High-Waist Skinny Jeans", price: "$28.99", cat: "Women's Fashion", img: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=80&h=80&fit=crop" },
    { name: "Mini Pleated Skirt", price: "$15.99", cat: "Women's Fashion", img: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=80&h=80&fit=crop" },
    { name: "Oversized Hoodie Women", price: "$23.99", cat: "Women's Fashion", img: "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=80&h=80&fit=crop" },
    { name: "Designer Leather Handbag", price: "$34.99", cat: "Women's Fashion", img: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=80&h=80&fit=crop" },
    { name: "Strappy High Heels", price: "$29.99", cat: "Women's Fashion", img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=80&h=80&fit=crop" },
    { name: "Gold Chain Necklace", price: "$12.99", cat: "Jewelry", img: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=80&h=80&fit=crop" },
    { name: "Rose Gold Watch Women", price: "$39.99", cat: "Watches", img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80&h=80&fit=crop" },
    // Men's Fashion
    { name: "Men's Graphic Tee", price: "$14.99", cat: "Men's Fashion", img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=80&h=80&fit=crop" },
    { name: "Slim Fit Shirt Men", price: "$22.99", cat: "Men's Fashion", img: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=80&h=80&fit=crop" },
    { name: "Men's Bomber Jacket", price: "$45.99", cat: "Men's Fashion", img: "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=80&h=80&fit=crop" },
    { name: "Cargo Jogger Pants", price: "$27.99", cat: "Men's Fashion", img: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=80&h=80&fit=crop" },
    { name: "White Sneakers Men", price: "$38.99", cat: "Shoes", img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=80&h=80&fit=crop" },
    { name: "Polarized Sunglasses", price: "$18.99", cat: "Accessories", img: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=80&h=80&fit=crop" },
    { name: "Leather Bifold Wallet", price: "$16.99", cat: "Accessories", img: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=80&h=80&fit=crop" },
    { name: "Professional Beard Trimmer", price: "$32.99", cat: "Men's Grooming", img: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=80&h=80&fit=crop" },
    { name: "Men's Grooming Kit 7-in-1", price: "$44.99", cat: "Men's Grooming", img: "https://images.unsplash.com/photo-1585751119414-ef2636f8aede?w=80&h=80&fit=crop" },
    // Kids
    { name: "Kids Rainbow Dress", price: "$16.99", cat: "Kids", img: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=80&h=80&fit=crop" },
    { name: "Boys Cartoon T-Shirt Set", price: "$12.99", cat: "Kids", img: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=80&h=80&fit=crop" },
    { name: "Kids School Backpack 20L", price: "$24.99", cat: "Kids", img: "https://images.unsplash.com/photo-1546519638700-99d7e5ed3b01?w=80&h=80&fit=crop" },
    { name: "STEM Building Blocks 500pcs", price: "$29.99", cat: "Toys & Kids", img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=80&h=80&fit=crop" },
    { name: "Kids LED Light-Up Shoes", price: "$19.99", cat: "Kids", img: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=80&h=80&fit=crop" },
    // Electronics
    { name: "Wireless Earbuds Pro ANC", price: "$49.99", cat: "Electronics", img: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=80&h=80&fit=crop" },
    { name: "Over-Ear Headphones 40H", price: "$79.99", cat: "Electronics", img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80&h=80&fit=crop" },
    { name: "Smart Watch Fitness 7-day", price: "$89.99", cat: "Electronics", img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80&h=80&fit=crop" },
    { name: "RGB Gaming Mouse 6400DPI", price: "$24.99", cat: "Electronics", img: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=80&h=80&fit=crop" },
    { name: "Mechanical Keyboard RGB", price: "$59.99", cat: "Electronics", img: "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=80&h=80&fit=crop" },
    { name: "20000mAh Power Bank", price: "$32.99", cat: "Electronics", img: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=80&h=80&fit=crop" },
    { name: "65W Fast Charger USB-C", price: "$18.99", cat: "Electronics", img: "https://images.unsplash.com/photo-1623126908029-58cb08a2b272?w=80&h=80&fit=crop" },
    { name: "Shockproof Phone Case", price: "$9.99", cat: "Electronics", img: "https://images.unsplash.com/photo-1601593346740-925612772716?w=80&h=80&fit=crop" },
    // Home & Kitchen
    { name: "5L Digital Air Fryer", price: "$59.99", cat: "Kitchen & Home", img: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=80&h=80&fit=crop" },
    { name: "1000W Countertop Blender", price: "$44.99", cat: "Kitchen & Home", img: "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=80&h=80&fit=crop" },
    { name: "Stackable Storage Boxes 6-set", price: "$26.99", cat: "Kitchen & Home", img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=80&h=80&fit=crop" },
    { name: "Bohemian Throw Pillow 4-set", price: "$22.99", cat: "Home Decor", img: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=80&h=80&fit=crop" },
    { name: "LED Bedside Lamp Dimmable", price: "$24.99", cat: "Home Decor", img: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=80&h=80&fit=crop" },
    { name: "Luxury 1000TC Bedsheet Set", price: "$34.99", cat: "Home Decor", img: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=80&h=80&fit=crop" },
    // Beauty
    { name: "Vitamin C Serum 30ml", price: "$22.99", cat: "Skincare", img: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=80&h=80&fit=crop" },
    { name: "Full Glam Makeup Palette", price: "$18.99", cat: "Makeup", img: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=80&h=80&fit=crop" },
    { name: "Curling Iron Ceramic 28mm", price: "$28.99", cat: "Hair Tools", img: "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=80&h=80&fit=crop" },
    // Sports & Fitness
    { name: "Resistance Bands Set 5-pack", price: "$16.99", cat: "Fitness", img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=80&h=80&fit=crop" },
    { name: "Non-slip Yoga Mat 6mm", price: "$24.99", cat: "Fitness", img: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=80&h=80&fit=crop" },
    { name: "Percussion Massage Gun 6-speed", price: "$69.99", cat: "Fitness", img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=80&h=80&fit=crop" },
    { name: "Whey Protein Powder 2lb", price: "$34.99", cat: "Supplements", img: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=80&h=80&fit=crop" }
  ];

  const searchToggle  = document.getElementById('searchToggle');
  const navSearch     = document.getElementById('navSearch');
  const searchInput   = document.getElementById('searchInput');
  const searchClear   = document.getElementById('searchClear');
  const searchResults = document.getElementById('searchResults');

  // Toggle search bar (mobile)
  searchToggle?.addEventListener('click', () => {
    navSearch?.classList.toggle('active');
    if (navSearch?.classList.contains('active')) searchInput?.focus();
  });

  // Input handler
  searchInput?.addEventListener('input', debounce(function() {
    const q = this.value.trim().toLowerCase();
    searchClear?.classList.toggle('visible', q.length > 0);
    if (q.length >= 2) {
      const results = catalog.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.cat.toLowerCase().includes(q)
      ).slice(0, 8);
      renderResults(results, q);
    } else {
      hideResults();
    }
  }, 200));

  searchInput?.addEventListener('focus', function() {
    if (this.value.trim().length >= 2) {
      const q = this.value.trim().toLowerCase();
      const results = catalog.filter(p =>
        p.name.toLowerCase().includes(q) || p.cat.toLowerCase().includes(q)
      ).slice(0, 8);
      renderResults(results, q);
    }
  });

  searchInput?.addEventListener('blur', () => setTimeout(hideResults, 220));

  searchClear?.addEventListener('click', () => {
    if (searchInput) searchInput.value = '';
    searchClear?.classList.remove('visible');
    hideResults();
    searchInput?.focus();
  });

  function renderResults(results, query) {
    if (!searchResults) return;

    if (!results.length) {
      searchResults.innerHTML = `
        <div class="search-result-item" style="opacity:0.6;cursor:default">
          <div class="search-result-info">
            <h4>No products found</h4>
            <p>Try different keywords</p>
          </div>
        </div>`;
    } else {
      const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      searchResults.innerHTML = results.map(p => {
        const hl = p.name.replace(new RegExp(`(${escaped})`, 'gi'),
          '<mark style="background:var(--accent-light);color:var(--accent);padding:0 2px;border-radius:3px">$1</mark>');
        return `
          <div class="search-result-item" onclick="window.location='products.html'">
            <img src="${p.img}" alt="${p.name}" loading="lazy">
            <div class="search-result-info">
              <h4>${hl}</h4>
              <p>${p.cat} • <span class="price">${p.price}</span></p>
            </div>
          </div>`;
      }).join('');
    }

    searchResults.classList.add('active');
  }

  function hideResults() {
    searchResults?.classList.remove('active');
  }

  function debounce(fn, delay) {
    let timer;
    return function(...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  // Keyboard nav in results
  searchInput?.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      hideResults();
      navSearch?.classList.remove('active');
    }
    if (e.key === 'Enter') {
      window.location = 'products.html';
    }
  });

  // Mobile search in menu
  const mobileSearchInput = document.getElementById('mobileSearchInput');
  mobileSearchInput?.addEventListener('input', function() {
    if (this.value.length >= 2) {
      searchInput.value = this.value;
      window.location = 'products.html';
    }
  });

  window.searchCatalog = catalog;

})();
