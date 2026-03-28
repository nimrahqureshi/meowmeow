/* ============================
   SEARCH.JS — SEARCH BAR & RESULTS  (FIXED v2)
   ============================ */

(function () {
  'use strict';

  var searchInput      = document.getElementById('searchInput');
  var searchClear      = document.getElementById('searchClear');
  var searchResults    = document.getElementById('searchResults');
  var mobileSearchInput = document.querySelector('.mobile-search input');

  /* ─── SAMPLE PRODUCT DATA ─── */
  var products = [
    { name: 'Premium Organic Cat Food',  price: '$24.99', category: 'Food',        image: 'https://images.unsplash.com/photo-1615497001839-b0a0eac3274c?w=80&h=80&fit=crop' },
    { name: 'Interactive Dog Toy Set',   price: '$12.99', category: 'Toys',        image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=80&h=80&fit=crop' },
    { name: 'Luxury Cat Tree Tower',     price: '$49.99', category: 'Furniture',   image: 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=80&h=80&fit=crop' },
    { name: 'Orthopedic Dog Bed',        price: '$29.99', category: 'Beds',        image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=80&h=80&fit=crop' },
    { name: 'Smart Pet Feeder WiFi',     price: '$89.99', category: 'Tech',        image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=80&h=80&fit=crop' },
    { name: 'Laser Cat Toy',             price: '$15.99', category: 'Toys',        image: 'https://images.unsplash.com/photo-1518882174711-1de40238921b?w=80&h=80&fit=crop' },
    { name: 'Pet Camera 360°',           price: '$45.99', category: 'Tech',        image: 'https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=80&h=80&fit=crop' },
    { name: 'GPS Dog Collar',            price: '$34.99', category: 'Accessories', image: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=80&h=80&fit=crop' },
    { name: 'Cat Grooming Kit',          price: '$19.99', category: 'Grooming',    image: 'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=80&h=80&fit=crop' },
    { name: 'Dog Training Treats',       price: '$8.99',  category: 'Food',        image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=80&h=80&fit=crop' },
    { name: 'Bird Cage Deluxe',          price: '$59.99', category: 'Housing',     image: 'https://images.unsplash.com/photo-1452857297128-d9c29adba80b?w=80&h=80&fit=crop' },
    { name: 'Fish Tank LED Light',       price: '$22.99', category: 'Aquarium',    image: 'https://images.unsplash.com/photo-1520301255226-bf5f144451c1?w=80&h=80&fit=crop' },
    { name: 'Cat Water Fountain',        price: '$32.99', category: 'Accessories', image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=80&h=80&fit=crop' },
    { name: 'Dog Rain Jacket',           price: '$27.99', category: 'Clothing',    image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=80&h=80&fit=crop' }
  ];

  /* ─── SEARCH LOGIC ─── */
  function doSearch(query) {
    if (!query || query.length < 2) { hideResults(); return; }
    var q       = query.toLowerCase();
    var results = products.filter(function (p) {
      return p.name.toLowerCase().indexOf(q) !== -1 ||
             p.category.toLowerCase().indexOf(q) !== -1;
    });
    displayResults(results, q);
  }

  function escHTML(str) {
    return String(str)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function escRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function displayResults(results, query) {
    if (!searchResults) return;

    if (results.length === 0) {
      searchResults.innerHTML =
        '<div class="search-result-item">' +
          '<div class="search-result-info">' +
            '<h4>No results for "' + escHTML(query) + '"</h4>' +
            '<p>Try different keywords</p>' +
          '</div>' +
        '</div>';
    } else {
      var re = new RegExp('(' + escRegex(query) + ')', 'gi');
      searchResults.innerHTML = results.slice(0, 6).map(function (p) {
        var hi = escHTML(p.name).replace(re,
          '<mark style="background:var(--accent-light);color:var(--accent);' +
          'padding:0 2px;border-radius:2px;font-style:normal;">$1</mark>'
        );
        return (
          '<div class="search-result-item" role="option" tabindex="0">' +
            '<img src="' + p.image + '" alt="' + escHTML(p.name) + '" loading="lazy" width="42" height="42" />' +
            '<div class="search-result-info">' +
              '<h4>' + hi + '</h4>' +
              '<p>' + escHTML(p.category) + ' &bull; ' + escHTML(p.price) + '</p>' +
            '</div>' +
          '</div>'
        );
      }).join('');

      searchResults.querySelectorAll('.search-result-item').forEach(function (item, i) {
        item.addEventListener('click', function () {
          if (searchInput) searchInput.value = results[i].name;
          hideResults();
          var el = document.getElementById('deals') || document.getElementById('products');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        item.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); item.click(); }
        });
      });
    }

    searchResults.classList.add('active');
  }

  function hideResults() {
    if (searchResults) searchResults.classList.remove('active');
  }

  /* ─── DESKTOP SEARCH ─── */
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      var q = this.value.trim();
      if (searchClear) searchClear.classList.toggle('visible', q.length > 0);
      doSearch(q);
    });

    searchInput.addEventListener('focus', function () {
      if (this.value.trim().length >= 2) doSearch(this.value.trim());
    });

    searchInput.addEventListener('blur', function () {
      setTimeout(hideResults, 220);
    });

    searchInput.addEventListener('keydown', function (e) {
      if (!searchResults) return;
      var items = searchResults.querySelectorAll('.search-result-item');
      if (!items.length) return;
      if (e.key === 'ArrowDown') { e.preventDefault(); items[0].focus(); }
      else if (e.key === 'Escape') { hideResults(); this.blur(); }
    });
  }

  /* ─── CLEAR BUTTON ─── */
  if (searchClear) {
    searchClear.addEventListener('click', function () {
      if (searchInput) { searchInput.value = ''; searchInput.focus(); }
      this.classList.remove('visible');
      hideResults();
    });
  }

  /* ─── MOBILE SEARCH ─── */
  if (mobileSearchInput) {
    mobileSearchInput.addEventListener('input', function () {
      if (searchInput) {
        searchInput.value = this.value;
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
  }

  /* ─── CLICK OUTSIDE TO CLOSE ─── */
  document.addEventListener('click', function (e) {
    if (!searchResults) return;
    var wrapper = document.querySelector('.search-wrapper');
    if (wrapper && !wrapper.contains(e.target)) hideResults();
  });

})();
