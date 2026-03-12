/* ============================
   SEARCH.JS — SEARCH BAR & RESULTS
   ============================ */

(function() {
  'use strict';

  var searchInput  = document.getElementById('searchInput');
  var searchClear  = document.getElementById('searchClear');
  var searchResults = document.getElementById('searchResults');
  var mobileSearchInput = document.querySelector('.mobile-search input');

  /* ===== SAMPLE PRODUCT DATA ===== */
  var products = [
    { name: 'Premium Organic Cat Food', price: '$24.99', category: 'Food',        image: 'https://images.unsplash.com/photo-1615497001839-b0a0eac3274c?w=80&h=80&fit=crop&auto=format' },
    { name: 'Interactive Dog Toy Set',  price: '$12.99', category: 'Toys',        image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=80&h=80&fit=crop&auto=format' },
    { name: 'Luxury Cat Tree Tower',    price: '$49.99', category: 'Furniture',   image: 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=80&h=80&fit=crop&auto=format' },
    { name: 'Orthopedic Dog Bed',       price: '$29.99', category: 'Beds',        image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=80&h=80&fit=crop&auto=format' },
    { name: 'Smart Pet Feeder WiFi',    price: '$89.99', category: 'Tech',        image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=80&h=80&fit=crop&auto=format' },
    { name: 'Laser Cat Toy',            price: '$15.99', category: 'Toys',        image: 'https://images.unsplash.com/photo-1518882174711-1de40238921b?w=80&h=80&fit=crop&auto=format' },
    { name: 'Pet Camera 360°',          price: '$45.99', category: 'Tech',        image: 'https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=80&h=80&fit=crop&auto=format' },
    { name: 'GPS Dog Collar',           price: '$34.99', category: 'Accessories', image: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=80&h=80&fit=crop&auto=format' },
    { name: 'Cat Grooming Kit',         price: '$19.99', category: 'Grooming',    image: 'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=80&h=80&fit=crop&auto=format' },
    { name: 'Dog Training Treats',      price: '$8.99',  category: 'Food',        image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=80&h=80&fit=crop&auto=format' },
    { name: 'Bird Cage Deluxe',         price: '$59.99', category: 'Housing',     image: 'https://images.unsplash.com/photo-1452857297128-d9c29adba80b?w=80&h=80&fit=crop&auto=format' },
    { name: 'Fish Tank LED Light',      price: '$22.99', category: 'Aquarium',    image: 'https://images.unsplash.com/photo-1520301255226-bf5f144451c1?w=80&h=80&fit=crop&auto=format' },
    { name: 'Cat Water Fountain',       price: '$32.99', category: 'Accessories', image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=80&h=80&fit=crop&auto=format' },
    { name: 'Dog Rain Jacket',          price: '$27.99', category: 'Clothing',    image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=80&h=80&fit=crop&auto=format' }
  ];

  /* ===== SEARCH LOGIC ===== */
  function doSearch(query) {
    if (!query || query.length < 2) {
      hideResults();
      return;
    }

    var q = query.toLowerCase();
    var results = products.filter(function(p) {
      return p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    });

    displayResults(results, q);
  }

  function displayResults(results, query) {
    if (!searchResults) return;

    if (results.length === 0) {
      searchResults.innerHTML =
        '<div class="search-result-item">' +
          '<div class="search-result-info">' +
            '<h4>No results found for "' + escapeHTML(query) + '"</h4>' +
            '<p>Try different keywords</p>' +
          '</div>' +
        '</div>';
    } else {
      var escaped = escapeRegex(query);
      var re = new RegExp('(' + escaped + ')', 'gi');

      searchResults.innerHTML = results.slice(0, 6).map(function(p) {
        var highlighted = escapeHTML(p.name).replace(re,
          '<mark style="background:var(--accent-light);color:var(--accent);padding:0 2px;border-radius:2px;font-style:normal;">$1</mark>'
        );
        return (
          '<div class="search-result-item" role="option" tabindex="0">' +
            '<img src="' + p.image + '" alt="' + escapeHTML(p.name) + '" loading="lazy" width="42" height="42" />' +
            '<div class="search-result-info">' +
              '<h4>' + highlighted + '</h4>' +
              '<p>' + escapeHTML(p.category) + ' &bull; ' + escapeHTML(p.price) + '</p>' +
            '</div>' +
          '</div>'
        );
      }).join('');

      // Click handlers
      searchResults.querySelectorAll('.search-result-item').forEach(function(item, i) {
        item.addEventListener('click', function() {
          var product = results[i];
          if (searchInput) searchInput.value = product.name;
          hideResults();
          // Navigate to products section or page
          var el = document.getElementById('deals') || document.getElementById('products');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });

        item.addEventListener('keydown', function(e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            item.click();
          }
        });
      });
    }

    searchResults.classList.add('active');
  }

  function hideResults() {
    if (searchResults) searchResults.classList.remove('active');
  }

  function escapeHTML(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /* ===== DESKTOP SEARCH INPUT ===== */
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      var q = this.value.trim();
      if (searchClear) searchClear.classList.toggle('visible', q.length > 0);
      doSearch(q);
    });

    searchInput.addEventListener('focus', function() {
      var q = this.value.trim();
      if (q.length >= 2) doSearch(q);
    });

    searchInput.addEventListener('blur', function() {
      setTimeout(hideResults, 220);
    });

    // Arrow key navigation
    searchInput.addEventListener('keydown', function(e) {
      if (!searchResults) return;
      var items = searchResults.querySelectorAll('.search-result-item');
      if (!items.length) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        items[0].focus();
      } else if (e.key === 'Escape') {
        hideResults();
        this.blur();
      }
    });
  }

  /* ===== CLEAR BUTTON ===== */
  if (searchClear) {
    searchClear.addEventListener('click', function() {
      if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
      }
      this.classList.remove('visible');
      hideResults();
    });
  }

  /* ===== MOBILE SEARCH ===== */
  if (mobileSearchInput) {
    mobileSearchInput.addEventListener('input', function() {
      // Mirror to desktop search for consistent results
      if (searchInput) {
        searchInput.value = this.value;
        var event = new Event('input', { bubbles: true });
        searchInput.dispatchEvent(event);
      }
    });
  }

  /* ===== CLICK OUTSIDE TO CLOSE ===== */
  document.addEventListener('click', function(e) {
    if (!searchResults) return;
    var wrapper = document.querySelector('.search-wrapper');
    if (wrapper && !wrapper.contains(e.target)) {
      hideResults();
    }
  });

})();
