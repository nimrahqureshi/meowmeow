/* ============================
   SEARCH.JS — SEARCH BAR & RESULTS
   ============================ */

(function() {
  'use strict';

  const searchToggle = document.getElementById('searchToggle');
  const navSearch = document.getElementById('navSearch');
  const searchInput = document.getElementById('searchInput');
  const searchClear = document.getElementById('searchClear');
  const searchResults = document.getElementById('searchResults');

  // Sample product data
  const products = [
    { name: 'Premium Organic Cat Food', price: '$24.99', category: 'Food', image: 'https://images.unsplash.com/photo-1615497001839-b0a0eac3274c?w=80&h=80&fit=crop' },
    { name: 'Interactive Dog Toy Set', price: '$12.99', category: 'Toys', image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=80&h=80&fit=crop' },
    { name: 'Luxury Cat Tree Tower', price: '$49.99', category: 'Furniture', image: 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=80&h=80&fit=crop' },
    { name: 'Orthopedic Dog Bed', price: '$29.99', category: 'Beds', image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=80&h=80&fit=crop' },
    { name: 'Smart Pet Feeder WiFi', price: '$89.99', category: 'Tech', image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=80&h=80&fit=crop' },
    { name: 'Laser Cat Toy', price: '$15.99', category: 'Toys', image: 'https://images.unsplash.com/photo-1518882174711-1de40238921b?w=80&h=80&fit=crop' },
    { name: 'Pet Camera 360°', price: '$45.99', category: 'Tech', image: 'https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=80&h=80&fit=crop' },
    { name: 'GPS Dog Collar', price: '$34.99', category: 'Accessories', image: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=80&h=80&fit=crop' },
    { name: 'Cat Grooming Kit', price: '$19.99', category: 'Grooming', image: 'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=80&h=80&fit=crop' },
    { name: 'Dog Training Treats', price: '$8.99', category: 'Food', image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=80&h=80&fit=crop' },
    { name: 'Bird Cage Deluxe', price: '$59.99', category: 'Housing', image: 'https://images.unsplash.com/photo-1452857297128-d9c29adba80b?w=80&h=80&fit=crop' },
    { name: 'Fish Tank LED Light', price: '$22.99', category: 'Aquarium', image: 'https://images.unsplash.com/photo-1520301255226-bf5f144451c1?w=80&h=80&fit=crop' }
  ];

  // Toggle search
  if (searchToggle) {
    searchToggle.addEventListener('click', () => {
      if (navSearch) {
        navSearch.classList.toggle('active');
        if (navSearch.classList.contains('active') && searchInput) {
          searchInput.focus();
        }
      }
    });
  }

  // Handle input
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.trim().toLowerCase();

      // Toggle clear button
      if (searchClear) {
        searchClear.classList.toggle('visible', query.length > 0);
      }

      // Show results
      if (query.length >= 2) {
        const results = products.filter(p =>
          p.name.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
        );
        displayResults(results, query);
      } else {
        hideResults();
      }
    });

    searchInput.addEventListener('focus', () => {
      if (searchInput.value.trim().length >= 2) {
        const query = searchInput.value.trim().toLowerCase();
        const results = products.filter(p =>
          p.name.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
        );
        displayResults(results, query);
      }
    });

    searchInput.addEventListener('blur', () => {
      setTimeout(hideResults, 200);
    });
  }

  // Clear search
  if (searchClear) {
    searchClear.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
      }
      searchClear.classList.remove('visible');
      hideResults();
    });
  }

  // Display results
  function displayResults(results, query) {
    if (!searchResults) return;

    if (results.length === 0) {
      searchResults.innerHTML = `
        <div class="search-result-item">
          <div class="search-result-info">
            <h4>No results found</h4>
            <p>Try different keywords</p>
          </div>
        </div>
      `;
    } else {
      searchResults.innerHTML = results.map(product => {
        const escapedQuery = escapeRegex(query);
        const highlightedName = product.name.replace(
          new RegExp(`(${escapedQuery})`, 'gi'),
          '<mark style="background: var(--accent-light); color: var(--accent); padding: 0 2px; border-radius: 2px;">$1</mark>'
        );

        return `
          <div class="search-result-item" onclick="location.hash='#deals'">
            <img src="${product.image}" alt="${product.name}" />
            <div class="search-result-info">
              <h4>${highlightedName}</h4>
              <p>${product.category} • ${product.price}</p>
            </div>
          </div>
        `;
      }).join('');
    }

    searchResults.classList.add('active');
  }

  function hideResults() {
    if (searchResults) {
      searchResults.classList.remove('active');
    }
  }

  function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navSearch) {
      navSearch.classList.remove('active');
      hideResults();
    }
  });

})();