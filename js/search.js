/* ============================
   SEARCH.JS — LIVE SEARCH  v2.0
   Merges sample data + live render data
   Keyboard nav · Highlight matches · Click outside
   ============================ */

(function () {
  'use strict';

  var SAMPLE = [
    { name: 'Floral Summer Dress — Boho Style',    cat: 'Women',       price: '$19.99', img: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=80&h=80&fit=crop' },
    { name: 'Smart Watch Pro — Fitness Tracker',   cat: 'Electronics', price: '$29.99', img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80&h=80&fit=crop' },
    { name: 'Bohemian Throw Pillow Covers Set',    cat: 'Home',        price: '$16.99', img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=80&h=80&fit=crop' },
    { name: 'Vitamin C Glow Skincare Set 5pcs',    cat: 'Beauty',      price: '$22.99', img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=80&h=80&fit=crop' },
    { name: "Men's Lightweight Running Shoes",     cat: 'Shoes',       price: '$34.99', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=80&h=80&fit=crop' },
    { name: 'Interactive Cat Toy Set 12 Pieces',   cat: 'Pets',        price: '$12.99', img: 'https://images.unsplash.com/photo-1601758003122-53c40e686a19?w=80&h=80&fit=crop' },
    { name: 'Creative Building Blocks Set 500pcs', cat: 'Toys',        price: '$18.99', img: 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=80&h=80&fit=crop' },
    { name: 'Wireless Noise-Cancelling Headphones',cat: 'Electronics', price: '$39.99', img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80&h=80&fit=crop' },
    { name: 'Gold-Plated Layered Jewelry Set',     cat: 'Jewelry',     price: '$14.99', img: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=80&h=80&fit=crop' },
    { name: 'LED Fairy String Lights 10m',         cat: 'Home',        price: '$8.99',  img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop' },
    { name: 'Professional Makeup Brush Set 18pcs', cat: 'Beauty',      price: '$17.99', img: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=80&h=80&fit=crop' },
    { name: 'Slim Leather RFID Blocking Wallet',   cat: 'Accessories', price: '$11.99', img: 'https://images.unsplash.com/photo-1594938298603-e8d9e3fa6b35?w=80&h=80&fit=crop' }
  ];

  function getData() {
    var data = SAMPLE.slice();
    var pools = [window.AmazonProducts, window.DarazProducts, window.TemuProducts, window.AliExpressProducts];
    pools.forEach(function (pool) {
      if (!Array.isArray(pool)) return;
      pool.forEach(function (p) {
        data.push({ name: p.name, cat: (p.category || '').charAt(0).toUpperCase() + (p.category || '').slice(1), price: '$' + (p.price || 0).toFixed(2), img: p.image || '' });
      });
    });
    return data;
  }

  var searchInput   = document.getElementById('searchInput');
  var searchClear   = document.getElementById('searchClear');
  var searchResults = document.getElementById('searchResults');
  if (!searchInput || !searchResults) return;

  function esc(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  function escRx(s) { return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'); }
  function hide() { searchResults.classList.remove('active'); }

  function search(query) {
    if (!query || query.trim().length < 2) { hide(); return; }
    var q = query.trim().toLowerCase();
    var results = getData().filter(function (p) {
      return p.name.toLowerCase().indexOf(q) !== -1 || (p.cat || '').toLowerCase().indexOf(q) !== -1;
    });

    if (!results.length) {
      searchResults.innerHTML = '<div class="search-result-item" style="pointer-events:none;"><div class="search-result-info"><h4>No results for "' + esc(query.trim()) + '"</h4><p>Try different keywords</p></div></div>';
    } else {
      var re = new RegExp('(' + escRx(esc(q)) + ')', 'gi');
      searchResults.innerHTML = results.slice(0, 7).map(function (p, i) {
        var hi = esc(p.name).replace(re, '<mark style="background:var(--accent-light);color:var(--accent);padding:0 2px;border-radius:2px;">$1</mark>');
        return '<div class="search-result-item" tabindex="0" data-idx="' + i + '">' +
          (p.img ? '<img src="' + esc(p.img) + '" alt="" width="42" height="42" loading="lazy"/>' : '') +
          '<div class="search-result-info"><h4>' + hi + '</h4><p>' + esc(p.cat) + ' · ' + esc(p.price) + '</p></div></div>';
      }).join('');

      var sliced = results.slice(0, 7);
      searchResults.querySelectorAll('.search-result-item').forEach(function (item) {
        var idx = parseInt(item.dataset.idx, 10);
        function select() {
          searchInput.value = sliced[idx].name;
          if (searchClear) searchClear.classList.add('visible');
          hide();
          var target = document.getElementById('deals') || document.getElementById('productGrid');
          if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        item.addEventListener('click', select);
        item.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(); }
          if (e.key === 'ArrowDown') { var n = item.nextElementSibling; if (n) n.focus(); }
          if (e.key === 'ArrowUp') { var p = item.previousElementSibling; if (p) p.focus(); else searchInput.focus(); }
        });
      });
    }
    searchResults.classList.add('active');
  }

  searchInput.addEventListener('input', function () {
    var q = this.value.trim();
    if (searchClear) searchClear.classList.toggle('visible', q.length > 0);
    search(q);
  });
  searchInput.addEventListener('focus', function () { if (this.value.trim().length >= 2) search(this.value.trim()); });
  searchInput.addEventListener('blur', function () { setTimeout(hide, 200); });
  searchInput.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); var f = searchResults.querySelector('.search-result-item'); if (f) f.focus(); }
    if (e.key === 'Escape') { hide(); this.blur(); }
  });

  if (searchClear) {
    searchClear.addEventListener('click', function () {
      searchInput.value = '';
      this.classList.remove('visible');
      hide();
      searchInput.focus();
    });
  }

  document.addEventListener('click', function (e) {
    var w = document.querySelector('.search-wrapper, .nav-search');
    if (w && !w.contains(e.target)) hide();
  });

})();
