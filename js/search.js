/* ============================
   SEARCH.JS
   ============================ */

(function() {
  'use strict';

  // Full product catalog
  const products = [
    // Women's Clothing
    { id: 'w1', name: 'Floral Wrap Midi Dress', price: 29.99, origPrice: 59.99, category: 'Dresses', subcategory: "Women's", image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=80&h=80&fit=crop', platform: 'Amazon' },
    { id: 'w2', name: 'Slim Fit High-Waist Jeans', price: 24.99, origPrice: 49.99, category: 'Jeans', subcategory: "Women's", image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=80&h=80&fit=crop', platform: 'Daraz' },
    { id: 'w3', name: 'Oversized Graphic Tee', price: 14.99, origPrice: 24.99, category: 'Tops', subcategory: "Women's", image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=80&h=80&fit=crop', platform: 'Temu' },
    { id: 'w4', name: 'Zip-Up Hoodie', price: 34.99, origPrice: 69.99, category: 'Hoodies', subcategory: "Women's", image: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=80&h=80&fit=crop', platform: 'Amazon' },
    { id: 'w5', name: 'Leather Crossbody Bag', price: 39.99, origPrice: 89.99, category: 'Bags', subcategory: "Women's", image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=80&h=80&fit=crop', platform: 'AliExpress' },
    { id: 'w6', name: 'Block Heel Sandals', price: 32.99, origPrice: 64.99, category: 'Shoes', subcategory: "Women's", image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=80&h=80&fit=crop', platform: 'Daraz' },
    { id: 'w7', name: 'Gold Hoop Earrings Set', price: 12.99, origPrice: 24.99, category: 'Jewelry', subcategory: "Women's", image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=80&h=80&fit=crop', platform: 'Amazon' },
    { id: 'w8', name: 'Rose Gold Watch', price: 49.99, origPrice: 99.99, category: 'Watches', subcategory: "Women's", image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80&h=80&fit=crop', platform: 'Temu' },

    // Men's Clothing
    { id: 'm1', name: 'Classic Polo Shirt', price: 19.99, origPrice: 39.99, category: 'Shirts', subcategory: "Men's", image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=80&h=80&fit=crop', platform: 'Amazon' },
    { id: 'm2', name: 'Slim Chino Pants', price: 27.99, origPrice: 54.99, category: 'Pants', subcategory: "Men's", image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=80&h=80&fit=crop', platform: 'Daraz' },
    { id: 'm3', name: 'Leather Chelsea Boots', price: 54.99, origPrice: 109.99, category: 'Boots', subcategory: "Men's", image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=80&h=80&fit=crop', platform: 'Amazon' },
    { id: 'm4', name: 'Aviator Sunglasses', price: 22.99, origPrice: 44.99, category: 'Sunglasses', subcategory: "Men's", image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop', platform: 'Temu' },
    { id: 'm5', name: 'Bifold Leather Wallet', price: 16.99, origPrice: 32.99, category: 'Wallets', subcategory: "Men's", image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=80&h=80&fit=crop', platform: 'AliExpress' },
    { id: 'm6', name: 'Electric Beard Trimmer', price: 29.99, origPrice: 59.99, category: 'Grooming', subcategory: "Men's", image: 'https://images.unsplash.com/photo-1585751119414-ef2636f8aede?w=80&h=80&fit=crop', platform: 'Amazon' },

    // Kids
    { id: 'k1', name: 'Kids Dinosaur T-Shirt', price: 12.99, origPrice: 24.99, category: "Kids' Shirts", subcategory: 'Kids', image: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=80&h=80&fit=crop', platform: 'Daraz' },
    { id: 'k2', name: 'Princess Dress Set', price: 19.99, origPrice: 39.99, category: "Kids' Dresses", subcategory: 'Kids', image: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=80&h=80&fit=crop', platform: 'Amazon' },
    { id: 'k3', name: 'Waterproof School Bag', price: 22.99, origPrice: 44.99, category: 'School Bags', subcategory: 'Kids', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=80&h=80&fit=crop', platform: 'Temu' },
    { id: 'k4', name: 'LEGO Creative Set 250pc', price: 34.99, origPrice: 64.99, category: 'Toys', subcategory: 'Kids', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=80&h=80&fit=crop', platform: 'Amazon' },
    { id: 'k5', name: 'Light-Up Sneakers', price: 24.99, origPrice: 48.99, category: "Kids' Shoes", subcategory: 'Kids', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=80&h=80&fit=crop', platform: 'Daraz' },

    // Electronics
    { id: 'e1', name: 'Wireless Earbuds Pro', price: 39.99, origPrice: 79.99, category: 'Earbuds', subcategory: 'Electronics', image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=80&h=80&fit=crop', platform: 'Amazon' },
    { id: 'e2', name: 'Over-Ear Headphones', price: 69.99, origPrice: 149.99, category: 'Headphones', subcategory: 'Electronics', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80&h=80&fit=crop', platform: 'Amazon' },
    { id: 'e3', name: 'Smart Watch Fitness', price: 59.99, origPrice: 119.99, category: 'Smartwatches', subcategory: 'Electronics', image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=80&h=80&fit=crop', platform: 'Temu' },
    { id: 'e4', name: 'Gaming Mouse RGB', price: 29.99, origPrice: 59.99, category: 'Gaming', subcategory: 'Electronics', image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=80&h=80&fit=crop', platform: 'Amazon' },
    { id: 'e5', name: 'Mechanical Keyboard', price: 44.99, origPrice: 89.99, category: 'Gaming', subcategory: 'Electronics', image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=80&h=80&fit=crop', platform: 'Temu' },
    { id: 'e6', name: '20000mAh Power Bank', price: 24.99, origPrice: 49.99, category: 'Power Banks', subcategory: 'Electronics', image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=80&h=80&fit=crop', platform: 'AliExpress' },
    { id: 'e7', name: 'Phone Case Collection', price: 9.99, origPrice: 19.99, category: 'Phone Cases', subcategory: 'Electronics', image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=80&h=80&fit=crop', platform: 'Daraz' },

    // Home & Kitchen
    { id: 'h1', name: 'Digital Air Fryer 5L', price: 69.99, origPrice: 139.99, category: 'Kitchen', subcategory: 'Home', image: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=80&h=80&fit=crop', platform: 'Amazon' },
    { id: 'h2', name: 'High-Speed Blender', price: 39.99, origPrice: 79.99, category: 'Kitchen', subcategory: 'Home', image: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=80&h=80&fit=crop', platform: 'Temu' },
    { id: 'h3', name: 'LED Desk Lamp', price: 22.99, origPrice: 44.99, category: 'Lamps', subcategory: 'Home', image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=80&h=80&fit=crop', platform: 'Amazon' },
    { id: 'h4', name: 'Abstract Wall Art Canvas', price: 29.99, origPrice: 59.99, category: 'Wall Art', subcategory: 'Home', image: 'https://images.unsplash.com/photo-1531685250784-7569952593d2?w=80&h=80&fit=crop', platform: 'Amazon' },
    { id: 'h5', name: 'Luxury Bedsheet Set', price: 34.99, origPrice: 69.99, category: 'Bedsheets', subcategory: 'Home', image: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=80&h=80&fit=crop', platform: 'Daraz' },

    // Beauty
    { id: 'b1', name: 'Vitamin C Serum 30ml', price: 19.99, origPrice: 39.99, category: 'Skincare', subcategory: 'Beauty', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=80&h=80&fit=crop', platform: 'Amazon' },
    { id: 'b2', name: 'Matte Lipstick Set 12pc', price: 14.99, origPrice: 29.99, category: 'Makeup', subcategory: 'Beauty', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=80&h=80&fit=crop', platform: 'Temu' },
    { id: 'b3', name: 'Hair Straightener Pro', price: 44.99, origPrice: 89.99, category: 'Hair Tools', subcategory: 'Beauty', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=80&h=80&fit=crop', platform: 'Amazon' },

    // Fitness
    { id: 'f1', name: 'Non-Slip Yoga Mat', price: 24.99, origPrice: 49.99, category: 'Fitness', subcategory: 'Sports', image: 'https://images.unsplash.com/photo-1601925228842-cdc4e29a19aa?w=80&h=80&fit=crop', platform: 'Amazon' },
    { id: 'f2', name: 'Full Body Massager', price: 32.99, origPrice: 64.99, category: 'Massagers', subcategory: 'Sports', image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=80&h=80&fit=crop', platform: 'Temu' },
    { id: 'f3', name: 'Whey Protein 2kg', price: 39.99, origPrice: 79.99, category: 'Supplements', subcategory: 'Sports', image: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=80&h=80&fit=crop', platform: 'Amazon' },
  ];

  window.productCatalog = products;

  const searchToggle = document.getElementById('searchToggle');
  const navSearch = document.getElementById('navSearch');
  const searchInput = document.getElementById('searchInput');
  const searchClear = document.getElementById('searchClear');
  const searchResults = document.getElementById('searchResults');

  // Toggle search visibility
  searchToggle?.addEventListener('click', () => {
    navSearch?.classList.toggle('active');
    if (navSearch?.classList.contains('active')) {
      searchInput?.focus();
    }
  });

  // Handle input
  searchInput?.addEventListener('input', handleSearch);
  searchInput?.addEventListener('focus', () => {
    if (searchInput.value.trim().length >= 2) showResults(searchInput.value.trim());
  });
  searchInput?.addEventListener('blur', () => setTimeout(hideResults, 200));

  function handleSearch() {
    const q = searchInput.value.trim();
    searchClear?.classList.toggle('visible', q.length > 0);
    if (q.length >= 2) {
      showResults(q);
    } else {
      hideResults();
    }
  }

  function showResults(query) {
    if (!searchResults) return;
    const q = query.toLowerCase();
    const matches = products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.subcategory.toLowerCase().includes(q)
    ).slice(0, 6);

    if (matches.length === 0) {
      searchResults.innerHTML = `
        <div class="search-no-results">
          <i class="fas fa-search" style="font-size:1.5rem;opacity:.3;margin-bottom:8px;display:block;"></i>
          No results for "<strong>${query}</strong>"
        </div>`;
    } else {
      searchResults.innerHTML = matches.map(p => {
        const hl = p.name.replace(new RegExp(`(${escReg(q)})`, 'gi'), '<mark style="background:var(--accent-light);color:var(--accent);border-radius:2px;padding:0 2px;">$1</mark>');
        return `
          <div class="search-result-item" onclick="addFromSearch('${p.id}')">
            <img src="${p.image}" alt="${p.name}">
            <div class="search-result-info">
              <h4>${hl}</h4>
              <p>${p.subcategory} · ${p.category}</p>
            </div>
            <span class="search-result-price">$${p.price}</span>
          </div>`;
      }).join('') + `<div style="padding:10px 16px;text-align:center;font-size:0.78rem;color:var(--text-tertiary);border-top:1px solid var(--border);">Press Enter to see all results</div>`;
    }

    searchResults.classList.add('active');
  }

  function hideResults() {
    searchResults?.classList.remove('active');
  }

  // Clear
  searchClear?.addEventListener('click', () => {
    if (searchInput) searchInput.value = '';
    searchClear.classList.remove('visible');
    hideResults();
    searchInput?.focus();
  });

  // Add to cart from search
  window.addFromSearch = function(id) {
    const product = products.find(p => p.id === id);
    if (product) {
      window.MeowMeow?.addToCart(product);
    }
  };

  function escReg(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  // Enter to "search"
  searchInput?.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      showToast('Full search coming soon!', 'info', '🔍');
      hideResults();
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      navSearch?.classList.remove('active');
      hideResults();
    }
  });

})();
