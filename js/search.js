/* ============================================================
   SEARCH.JS — LIVE SEARCH BAR & RESULTS DROPDOWN
   MeowMeow Affiliate Site — Production v2.0
   ============================================================ */

(function() {
  'use strict';

  // ===== PRODUCT DATA (replace/extend with real data or API) =====
  var products = [
    { id: 'p1',  name: 'Premium Organic Cat Food',     price: '$24.99', category: 'Food',        image: 'https://images.unsplash.com/photo-1615497001839-b0a0eac3274c?w=80&h=80&fit=crop', url: '#deals' },
    { id: 'p2',  name: 'Interactive Dog Toy Set',       price: '$12.99', category: 'Toys',        image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=80&h=80&fit=crop', url: '#deals' },
    { id: 'p3',  name: 'Luxury Cat Tree Tower',         price: '$49.99', category: 'Furniture',   image: 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=80&h=80&fit=crop', url: '#deals' },
    { id: 'p4',  name: 'Orthopedic Dog Bed',            price: '$29.99', category: 'Beds',        image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=80&h=80&fit=crop', url: '#deals' },
    { id: 'p5',  name: 'Smart Pet Feeder WiFi',         price: '$89.99', category: 'Tech',        image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=80&h=80&fit=crop', url: '#deals' },
    { id: 'p6',  name: 'Automatic Laser Cat Toy',       price: '$15.99', category: 'Toys',        image: 'https://images.unsplash.com/photo-1518882174711-1de40238921b?w=80&h=80&fit=crop', url: '#deals' },
    { id: 'p7',  name: 'Pet Camera 360° HD',            price: '$45.99', category: 'Tech',        image: 'https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=80&h=80&fit=crop', url: '#deals' },
    { id: 'p8',  name: 'GPS Dog Collar Tracker',        price: '$34.99', category: 'Accessories', image: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=80&h=80&fit=crop', url: '#deals' },
    { id: 'p9',  name: 'Cat Grooming Kit Pro',          price: '$19.99', category: 'Grooming',    image: 'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=80&h=80&fit=crop', url: '#deals' },
    { id: 'p10', name: 'Dog Training Treats Pack',      price: '$8.99',  category: 'Food',        image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=80&h=80&fit=crop', url: '#deals' },
    { id: 'p11', name: 'Deluxe Bird Cage XL',           price: '$59.99', category: 'Housing',     image: 'https://images.unsplash.com/photo-1452857297128-d9c29adba80b?w=80&h=80&fit=crop', url: '#deals' },
    { id: 'p12', name: 'Aquarium LED Light Strip',      price: '$22.99', category: 'Aquarium',    image: 'https://images.unsplash.com/photo-1520301255226-bf5f144451c1?w=80&h=80&fit=crop', url: '#deals' },
    { id: 'p13', name: 'Self-Cleaning Litter Box',      price: '$79.99', category: 'Accessories', image: 'https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?w=80&h=80&fit=crop', url: '#deals' },
    { id: 'p14', name: 'Dog Raincoat Waterproof',       price: '$18.99', category: 'Clothing',    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=80&h=80&fit=crop', url: '#deals' },
    { id: 'p15', name: 'Pet First Aid Kit',             price: '$26.99', category: 'Health',      image: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=80&h=80&fit=crop', url: '#deals' }
  ];

  // ===== ELEMENTS =====
  var searchToggle  = document.getElementById('searchToggle');
  var navSearch     = document.getElementById('navSearch');
  var searchInput   = document.getElementById('searchInput');
  var searchClear   = document.getElementById('searchClear');
  var searchResults = document.getElementById('searchResults');

  var searchDebounceTimer = null;
  var currentFocus = -1;

  // ===== ESCAPE REGEX =====
  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // ===== HIGHLIGHT MATCH =====
  function highlight(text, query) {
    var escaped = escapeRegex(query);
    return text.replace(new RegExp('(' + escaped + ')', 'gi'),
      '<mark style="background:var(--accent-light,#ede9fe);color:var(--accent,#7C3AED);border-radius:2px;padding:0 2px;">$1</mark>');
  }

  // ===== TOGGLE SEARCH =====
  function openSearch() {
    if (!navSearch) return;
    navSearch.classList.add('active');
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
  }
  function closeSearch() {
    if (!navSearch) return;
    navSearch.classList.remove('active');
    hideResults();
  }

  if (searchToggle) searchToggle.addEventListener('click', function(e) {
    e.stopPropagation();
    navSearch && navSearch.classList.contains('active') ? closeSearch() : openSearch();
  });

  // Close on outside click
  document.addEventListener('click', function(e) {
    if (navSearch && !navSearch.contains(e.target) && e.target !== searchToggle) {
      closeSearch();
    }
  });

  // ===== DISPLAY RESULTS =====
  function displayResults(results, query) {
    if (!searchResults) return;

    if (!results || results.length === 0) {
      searchResults.innerHTML =
        '<div class="search-no-results">' +
          '<i class="fas fa-search-minus"></i>' +
          '<span>No results for "<strong>' + query + '</strong>"</span>' +
        '</div>';
      searchResults.classList.add('active');
      return;
    }

    var maxShow = 6;
    var html = results.slice(0, maxShow).map(function(p, i) {
      return '<a href="' + p.url + '" class="search-result-item" data-index="' + i + '">' +
        '<img src="' + p.image + '" alt="' + p.name + '" loading="lazy" />' +
        '<div class="search-result-info">' +
          '<h4>' + highlight(p.name, query) + '</h4>' +
          '<p>' + p.category + ' &bull; <strong>' + p.price + '</strong></p>' +
        '</div>' +
        '<button class="search-result-add" onclick="event.preventDefault();event.stopPropagation();window.addToCart({id:\'' + p.id + '\',name:\'' + p.name.replace(/'/g,'') + '\',price:\'' + p.price + '\',image:\'' + p.image + '\'})" aria-label="Add to cart"><i class="fas fa-cart-plus"></i></button>' +
      '</a>';
    }).join('');

    if (results.length > maxShow) {
      html += '<div class="search-see-all"><a href="#deals">See all ' + results.length + ' results →</a></div>';
    }

    searchResults.innerHTML = html;
    searchResults.classList.add('active');
    currentFocus = -1;
  }

  function hideResults() {
    if (searchResults) searchResults.classList.remove('active');
    currentFocus = -1;
  }

  // ===== SEARCH LOGIC =====
  function doSearch(query) {
    if (query.length < 2) { hideResults(); return; }
    var q = query.toLowerCase();
    var results = products.filter(function(p) {
      return p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    });
    displayResults(results, query);

    // Also highlight matching cards on page
    document.querySelectorAll('.product-card').forEach(function(card) {
      var name = card.querySelector('.product-name');
      if (!name) return;
      if (name.textContent.toLowerCase().includes(q)) {
        card.style.outline = '2px solid var(--accent, #7C3AED)';
        card.style.outlineOffset = '2px';
      } else {
        card.style.outline = '';
        card.style.outlineOffset = '';
      }
    });
  }

  function clearSearchHighlights() {
    document.querySelectorAll('.product-card').forEach(function(card) {
      card.style.outline = '';
      card.style.outlineOffset = '';
    });
  }

  // ===== INPUT EVENTS =====
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      var q = this.value.trim();
      if (searchClear) searchClear.classList.toggle('visible', q.length > 0);
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(function() { doSearch(q); }, 220);
    });

    searchInput.addEventListener('focus', function() {
      var q = this.value.trim();
      if (q.length >= 2) doSearch(q);
    });

    // Keyboard navigation in results
    searchInput.addEventListener('keydown', function(e) {
      var items = searchResults ? searchResults.querySelectorAll('.search-result-item') : [];
      if (!items.length) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        currentFocus = Math.min(currentFocus + 1, items.length - 1);
        setFocusedResult(items);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        currentFocus = Math.max(currentFocus - 1, 0);
        setFocusedResult(items);
      } else if (e.key === 'Enter' && currentFocus >= 0) {
        e.preventDefault();
        items[currentFocus].click();
      } else if (e.key === 'Escape') {
        closeSearch();
        clearSearchHighlights();
      }
    });
  }

  function setFocusedResult(items) {
    items.forEach(function(item, i) {
      item.classList.toggle('focused', i === currentFocus);
    });
    if (items[currentFocus]) items[currentFocus].scrollIntoView({ block: 'nearest' });
  }

  if (searchClear) {
    searchClear.addEventListener('click', function() {
      if (searchInput) { searchInput.value = ''; searchInput.focus(); }
      this.classList.remove('visible');
      hideResults();
      clearSearchHighlights();
    });
  }

  // Close results on blur (delayed to allow click)
  if (searchInput) {
    searchInput.addEventListener('blur', function() {
      setTimeout(function() { hideResults(); clearSearchHighlights(); }, 200);
    });
  }

  // ===== SEARCH OVERLAY (full screen on mobile) =====
  var searchOverlayToggle = document.getElementById('searchOverlayToggle');
  var searchOverlay = document.getElementById('searchOverlay');
  var searchOverlayClose = document.getElementById('searchOverlayClose');
  var searchOverlayInput = document.getElementById('searchOverlayInput');

  if (searchOverlayToggle && searchOverlay) {
    searchOverlayToggle.addEventListener('click', function() {
      searchOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      if (searchOverlayInput) setTimeout(function() { searchOverlayInput.focus(); }, 100);
    });
  }
  if (searchOverlayClose) {
    searchOverlayClose.addEventListener('click', function() {
      searchOverlay.classList.remove('active');
      document.body.style.overflow = '';
    });
  }
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && searchOverlay && searchOverlay.classList.contains('active')) {
      searchOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  });

  if (searchOverlayInput) {
    searchOverlayInput.addEventListener('input', function() {
      var q = this.value.trim();
      var overlayResults = document.getElementById('searchOverlayResults');
      if (!overlayResults || q.length < 2) {
        if (overlayResults) overlayResults.innerHTML = '';
        return;
      }
      var q2 = q.toLowerCase();
      var results = products.filter(function(p) {
        return p.name.toLowerCase().includes(q2) || p.category.toLowerCase().includes(q2);
      });
      if (!results.length) {
        overlayResults.innerHTML = '<p class="overlay-no-results">No results found for "' + q + '"</p>';
        return;
      }
      overlayResults.innerHTML = results.slice(0, 8).map(function(p) {
        return '<a href="' + p.url + '" class="overlay-result-item" onclick="document.getElementById(\'searchOverlay\').classList.remove(\'active\');document.body.style.overflow=\'\';">' +
          '<img src="' + p.image + '" alt="' + p.name + '" />' +
          '<div><strong>' + highlight(p.name, q) + '</strong><br><small>' + p.category + ' &bull; ' + p.price + '</small></div>' +
        '</a>';
      }).join('');
    });
  }

})();
