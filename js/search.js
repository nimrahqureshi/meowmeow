/* =============================================
   SEARCH.JS — LIVE SEARCH WITH RESULTS
   ============================================= */
'use strict';

(function() {
  const searchInput   = document.getElementById('searchInput');
  const searchClear   = document.getElementById('searchClear');
  const searchResults = document.getElementById('searchResults');
  const mobileSearchInput = document.getElementById('mobileSearchInput');

  if (!searchInput) return;

  function escapeRegex(str) { return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  function highlight(text, query) {
    if (!query) return text;
    const re = new RegExp(`(${escapeRegex(query)})`, 'gi');
    return text.replace(re, '<mark style="background:var(--accent-light);color:var(--accent);border-radius:2px;padding:0 2px;">$1</mark>');
  }

  function search(query) {
    const q = query.trim().toLowerCase();
    if (q.length < 2) { hideResults(); return; }

    const products = window.PRODUCTS || [];
    const results = products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.sub.toLowerCase().includes(q) ||
      p.store.toLowerCase().includes(q)
    ).slice(0, 8);

    renderResults(results, q);
  }

  function renderResults(results, query) {
    if (!searchResults) return;

    if (results.length === 0) {
      searchResults.innerHTML = `
        <div class="search-no-results">
          <i class="fas fa-search" style="font-size:2rem;margin-bottom:10px;opacity:0.4;display:block;"></i>
          <strong>No results for "${query}"</strong>
          <p>Try different keywords or browse our categories</p>
        </div>`;
    } else {
      searchResults.innerHTML = results.map(p => `
        <div class="search-result-item" onclick="location.href='${p.link || '#'}'" tabindex="0" role="button" aria-label="${p.name}">
          <img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.src='https://via.placeholder.com/44x44/f3f4f6/9ca3af?text=?'">
          <div class="search-result-info">
            <h4>${highlight(p.name, query)}</h4>
            <p>${p.category} · ${p.store}</p>
          </div>
          <span class="search-result-price">${p.price}</span>
        </div>`).join('');

      // Add keyboard nav to results
      searchResults.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('keydown', e => {
          if (e.key === 'Enter') item.click();
        });
      });
    }

    searchResults.classList.add('active');
  }

  function hideResults() {
    searchResults && searchResults.classList.remove('active');
  }

  function toggleClear(visible) {
    searchClear && searchClear.classList.toggle('visible', visible);
  }

  /* ── INPUT EVENTS ── */
  let debounceTimer;
  searchInput.addEventListener('input', function() {
    const val = this.value;
    toggleClear(val.length > 0);
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => search(val), 180);
  });

  searchInput.addEventListener('focus', function() {
    if (this.value.trim().length >= 2) search(this.value);
  });

  searchInput.addEventListener('blur', () => {
    setTimeout(hideResults, 220);
  });

  searchClear && searchClear.addEventListener('click', () => {
    searchInput.value = '';
    searchInput.focus();
    toggleClear(false);
    hideResults();
  });

  // Keyboard navigation in results
  searchInput.addEventListener('keydown', e => {
    if (e.key === 'Escape') { hideResults(); searchInput.blur(); }
    if (e.key === 'ArrowDown') {
      const first = searchResults?.querySelector('.search-result-item');
      first?.focus();
    }
  });

  /* ── MOBILE SEARCH ── */
  if (mobileSearchInput) {
    mobileSearchInput.addEventListener('input', function() {
      // Sync with desktop search
      if (searchInput) {
        searchInput.value = this.value;
        searchInput.dispatchEvent(new Event('input'));
      }
    });
  }
})();
