/* =============================================
   SEARCH.JS — LIVE SEARCH WITH RESULTS
   ============================================= */

(function() {
  'use strict';

  const PRODUCTS = [
    // Women
    { name: 'Floral Summer Dress', cat: 'Women', price: '$19.99', img: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=60&h=60&fit=crop', href: 'products.html?cat=women' },
    { name: 'Boho Maxi Skirt', cat: 'Women', price: '$24.99', img: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=60&h=60&fit=crop', href: 'products.html?cat=women' },
    { name: 'Leather Handbag', cat: 'Women', price: '$39.99', img: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=60&h=60&fit=crop', href: 'products.html?cat=women' },
    { name: 'Strappy Heeled Sandals', cat: 'Women', price: '$29.99', img: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=60&h=60&fit=crop', href: 'products.html?cat=women' },
    // Men
    { name: 'Classic Denim Jacket', cat: 'Men', price: '$49.99', img: 'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=60&h=60&fit=crop', href: 'products.html?cat=men' },
    { name: 'Slim Fit Chinos', cat: 'Men', price: '$34.99', img: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=60&h=60&fit=crop', href: 'products.html?cat=men' },
    { name: 'Running Sneakers', cat: 'Men', price: '$59.99', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=60&h=60&fit=crop', href: 'products.html?cat=men' },
    // Tech
    { name: 'Wireless Earbuds Pro', cat: 'Tech', price: '$39.99', img: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=60&h=60&fit=crop', href: 'products.html?cat=tech' },
    { name: 'Smart Watch Series 8', cat: 'Tech', price: '$129.99', img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=60&h=60&fit=crop', href: 'products.html?cat=tech' },
    { name: 'Mechanical Keyboard', cat: 'Tech', price: '$79.99', img: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=60&h=60&fit=crop', href: 'products.html?cat=tech' },
    { name: 'Power Bank 20000mAh', cat: 'Tech', price: '$29.99', img: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=60&h=60&fit=crop', href: 'products.html?cat=tech' },
    // Beauty
    { name: 'Vitamin C Serum', cat: 'Beauty', price: '$18.99', img: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=60&h=60&fit=crop', href: 'products.html?cat=beauty' },
    { name: 'Matte Lipstick Set', cat: 'Beauty', price: '$14.99', img: 'https://images.unsplash.com/photo-1586495777744-4e6232bf2262?w=60&h=60&fit=crop', href: 'products.html?cat=beauty' },
    { name: 'Hair Straightener', cat: 'Beauty', price: '$44.99', img: 'https://images.unsplash.com/photo-1562594980-47d7ee9c1e08?w=60&h=60&fit=crop', href: 'products.html?cat=beauty' },
    // Home
    { name: 'LED Pendant Lamp', cat: 'Home', price: '$54.99', img: 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=60&h=60&fit=crop', href: 'products.html?cat=home' },
    { name: 'Air Fryer 4L', cat: 'Home', price: '$89.99', img: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=60&h=60&fit=crop', href: 'products.html?cat=home' },
    { name: 'Throw Pillow Set', cat: 'Home', price: '$22.99', img: 'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=60&h=60&fit=crop', href: 'products.html?cat=home' },
    // Kids
    { name: 'Kids LEGO Building Set', cat: 'Kids', price: '$34.99', img: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=60&h=60&fit=crop', href: 'products.html?cat=kids' },
    // Fitness
    { name: 'Yoga Mat Premium', cat: 'Fitness', price: '$27.99', img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=60&h=60&fit=crop', href: 'products.html?cat=fitness' },
    { name: 'Resistance Bands Set', cat: 'Fitness', price: '$19.99', img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=60&h=60&fit=crop', href: 'products.html?cat=fitness' },
  ];

  document.addEventListener('DOMContentLoaded', () => {

    const searchToggle = document.getElementById('searchToggle');
    const navSearch    = document.getElementById('navSearch');
    const searchInput  = document.getElementById('searchInput');
    const searchClear  = document.getElementById('searchClear');
    const searchRes    = document.getElementById('searchResults');

    if (!searchInput) return;

    // Toggle mobile search
    if (searchToggle) {
      searchToggle.addEventListener('click', () => {
        navSearch.classList.toggle('mobile-open');
        if (navSearch.classList.contains('mobile-open')) searchInput.focus();
      });
    }

    // Input handler
    let debounceTimer;
    searchInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      const q = searchInput.value.trim();
      if (searchClear) searchClear.classList.toggle('visible', q.length > 0);
      if (q.length < 2) { hideResults(); return; }
      debounceTimer = setTimeout(() => showResults(q), 200);
    });

    // Clear button
    if (searchClear) {
      searchClear.addEventListener('click', () => {
        searchInput.value = '';
        searchClear.classList.remove('visible');
        hideResults();
        searchInput.focus();
      });
    }

    // Focus / blur
    searchInput.addEventListener('focus', () => {
      if (searchInput.value.trim().length >= 2) showResults(searchInput.value.trim());
    });
    document.addEventListener('click', e => {
      if (!navSearch?.contains(e.target)) hideResults();
    });

    function showResults(q) {
      if (!searchRes) return;
      const query = q.toLowerCase();
      const matches = PRODUCTS.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.cat.toLowerCase().includes(query)
      ).slice(0, 6);

      if (!matches.length) {
        searchRes.innerHTML = `<div class="search-result-item"><div class="search-result-info"><h4>No results for "${q}"</h4><p>Try different keywords</p></div></div>`;
      } else {
        searchRes.innerHTML = matches.map(p => `
          <a class="search-result-item" href="${p.href}" style="text-decoration:none">
            <img src="${p.img}" alt="${p.name}" loading="lazy" />
            <div class="search-result-info">
              <h4>${highlight(p.name, query)}</h4>
              <p>${p.cat} · ${p.price}</p>
            </div>
          </a>
        `).join('');
      }
      searchRes.classList.add('active');
    }

    function hideResults() {
      if (searchRes) searchRes.classList.remove('active');
    }

    function highlight(text, query) {
      const re = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})`, 'gi');
      return text.replace(re, '<mark style="background:var(--rose-light);color:var(--accent);padding:0 2px;border-radius:3px">$1</mark>');
    }

  });

})();
