/* ============================
   COMPONENTS.JS — REUSABLE UI COMPONENTS  v2.0
   Quick View Modal · FAQ Accordion · Help Cards
   Tooltips · Copy Button · Tabs · Product Filters
   ============================ */

(function () {
  'use strict';

  /* ── QUICK VIEW MODAL ── */
  function initQuickView() {
    if (!document.getElementById('quickViewModal')) {
      var modal = document.createElement('div');
      modal.id = 'quickViewModal';
      modal.className = 'modal-overlay';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-label', 'Quick view');
      modal.innerHTML =
        '<div class="modal-box">' +
          '<button class="modal-close" id="quickViewClose" aria-label="Close"><i class="fas fa-times"></i></button>' +
          '<div class="modal-body" id="quickViewBody"></div>' +
        '</div>';
      document.body.appendChild(modal);
      modal.addEventListener('click', function (e) { if (e.target === modal) closeQV(); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeQV(); });
      var closeBtn = document.getElementById('quickViewClose');
      if (closeBtn) closeBtn.addEventListener('click', closeQV);
    }

    document.querySelectorAll('.quick-view-btn:not([data-qv-bound])').forEach(function (btn) {
      btn.setAttribute('data-qv-bound', '1');
      btn.addEventListener('click', function (e) {
        e.preventDefault(); e.stopPropagation();
        var card = this.closest('.product-card');
        if (!card) return;
        var name   = (card.querySelector('.product-name') || {}).textContent || 'Product';
        var price  = (card.querySelector('.price-current') || {}).textContent || '';
        var orig   = (card.querySelector('.price-original') || {}).textContent || '';
        var img    = (card.querySelector('img') || {}).src || '';
        var rating = (card.querySelector('.product-rating') || {}).innerHTML || '';
        var mkt    = (card.querySelector('.product-marketplace') || {}).textContent || '';
        var buy    = (card.querySelector('a.btn-cta') || {}).href || '#';

        function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

        document.getElementById('quickViewBody').innerHTML =
          '<div class="qv-grid">' +
            '<div class="qv-image"><img src="' + esc(img) + '" alt="' + esc(name) + '" /></div>' +
            '<div class="qv-info">' +
              '<div class="product-marketplace"><i class="fas fa-globe"></i> ' + esc(mkt) + '</div>' +
              '<h2 class="qv-title">' + esc(name) + '</h2>' +
              '<div class="product-rating">' + rating + '</div>' +
              '<div class="product-price"><span class="price-current">' + esc(price) + '</span>' + (orig ? '<span class="price-original">' + esc(orig) + '</span>' : '') + '</div>' +
              '<div class="qv-actions">' +
                '<a href="' + esc(buy) + '" class="btn btn-cta btn-lg btn-3d" target="_blank" rel="noopener noreferrer sponsored"><i class="fas fa-shopping-cart"></i> Buy Now</a>' +
                '<button class="btn btn-outline btn-lg wishlist-toggle" aria-label="Add to wishlist"><i class="far fa-heart"></i> Wishlist</button>' +
              '</div>' +
              '<p class="qv-note"><i class="fas fa-shield-alt"></i> Redirects to official seller — secured checkout</p>' +
            '</div>' +
          '</div>';
        openQV();
      });
    });
  }

  function openQV() { var m = document.getElementById('quickViewModal'); if (!m) return; m.classList.add('active'); document.body.style.overflow = 'hidden'; }
  function closeQV() { var m = document.getElementById('quickViewModal'); if (!m) return; m.classList.remove('active'); document.body.style.overflow = ''; }

  /* ── PRODUCT FILTER TABS ── */
  function initFilters() {
    var btns = document.querySelectorAll('.filter-btn');
    if (!btns.length) return;
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        btns.forEach(function (b) { b.classList.remove('active'); });
        this.classList.add('active');
        var cat = this.dataset.filter || 'all';
        document.querySelectorAll('.product-card[data-category]').forEach(function (card, i) {
          var match = cat === 'all' || card.dataset.category === cat;
          card.style.display = match ? '' : 'none';
          if (match) { card.style.animationDelay = (i % 8 * 0.05) + 's'; card.classList.remove('card-enter'); void card.offsetWidth; card.classList.add('card-enter'); }
        });
      });
    });
  }

  /* ── FAQ ACCORDION ── */
  function initAccordion() {
    var items = document.querySelectorAll('.faq-item');
    if (!items.length) return;
    items.forEach(function (item) {
      var q = item.querySelector('h3');
      if (!q) return;
      if (!q.querySelector('.faq-icon')) {
        var icon = document.createElement('i');
        icon.className = 'fas fa-chevron-down faq-icon';
        icon.style.cssText = 'float:right;transition:transform .3s;color:var(--accent);';
        q.appendChild(icon);
      }
      var ans = item.querySelector('p, .faq-answer');
      if (ans) { ans.style.overflow = 'hidden'; ans.style.transition = 'max-height .35s ease,opacity .35s ease'; ans.style.maxHeight = '0'; ans.style.opacity = '0'; item.classList.add('faq-closed'); }
      q.style.cursor = 'pointer';
      q.addEventListener('click', function () {
        var isOpen = item.classList.contains('faq-open');
        items.forEach(function (other) {
          if (other !== item && other.classList.contains('faq-open')) {
            var a = other.querySelector('p,.faq-answer'); var ic = other.querySelector('.faq-icon');
            if (a) { a.style.maxHeight='0'; a.style.opacity='0'; }
            if (ic) ic.style.transform = '';
            other.classList.replace('faq-open','faq-closed');
          }
        });
        var ic = q.querySelector('.faq-icon');
        if (!isOpen) {
          if (ans) { ans.style.maxHeight = ans.scrollHeight + 'px'; ans.style.opacity = '1'; }
          if (ic) ic.style.transform = 'rotate(180deg)';
          item.classList.replace('faq-closed','faq-open');
        } else {
          if (ans) { ans.style.maxHeight='0'; ans.style.opacity='0'; }
          if (ic) ic.style.transform = '';
          item.classList.replace('faq-open','faq-closed');
        }
      });
    });
  }

  /* ── HELP CARDS ── */
  function initHelpCards() {
    document.querySelectorAll('.help-card').forEach(function (card) {
      card.addEventListener('mouseenter', function () { var ic = this.querySelector('.help-icon'); if (ic) ic.classList.add('animate-pulse'); });
      card.addEventListener('mouseleave', function () { var ic = this.querySelector('.help-icon'); if (ic) ic.classList.remove('animate-pulse'); });
    });
  }

  /* ── TOOLTIPS ── */
  function initTooltips() {
    document.querySelectorAll('[data-tooltip]:not([data-tt-bound])').forEach(function (el) {
      el.setAttribute('data-tt-bound','1');
      var tip = null;
      el.addEventListener('mouseenter', function () {
        tip = document.createElement('div');
        tip.className = 'tooltip-bubble';
        tip.textContent = this.dataset.tooltip;
        tip.style.cssText = 'position:fixed;background:var(--bg-secondary);color:var(--text-primary);border:1px solid var(--border);padding:6px 12px;border-radius:var(--radius-md);font-size:.8rem;white-space:nowrap;z-index:9999;box-shadow:var(--shadow-md);pointer-events:none;animation:fadeInUp .2s ease;';
        document.body.appendChild(tip);
        var r = this.getBoundingClientRect();
        tip.style.left = (r.left + r.width/2 - tip.offsetWidth/2) + 'px';
        tip.style.top  = (r.top - tip.offsetHeight - 8) + 'px';
      });
      el.addEventListener('mouseleave', function () { if (tip) { tip.remove(); tip = null; } });
    });
  }

  /* ── COPY BUTTONS ── */
  function initCopyButtons() {
    document.querySelectorAll('[data-copy]:not([data-copy-bound])').forEach(function (btn) {
      btn.setAttribute('data-copy-bound','1');
      btn.addEventListener('click', function () {
        var text = this.dataset.copy;
        var orig = this.innerHTML;
        var self = this;
        if (navigator.clipboard) {
          navigator.clipboard.writeText(text).then(function () {
            self.innerHTML = '<i class="fas fa-check"></i> Copied!';
            setTimeout(function () { self.innerHTML = orig; }, 2000);
            if (window.showToast) window.showToast('Copied to clipboard!', 'success');
          });
        }
      });
    });
  }

  /* ── TABS ── */
  function initTabs() {
    document.querySelectorAll('.tabs-container').forEach(function (container) {
      var tabs   = container.querySelectorAll('.tab-btn');
      var panels = container.querySelectorAll('.tab-panel');
      tabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
          tabs.forEach(function (t) { t.classList.remove('active'); });
          panels.forEach(function (p) { p.style.display='none'; p.classList.remove('active'); });
          this.classList.add('active');
          var target = document.getElementById(this.dataset.tab);
          if (target) { target.style.display=''; target.classList.add('active','animate-fade-in'); }
        });
      });
      if (tabs[0]) tabs[0].click();
    });
  }

  /* ── MODAL STYLES ── */
  function injectStyles() {
    if (document.getElementById('component-styles')) return;
    var style = document.createElement('style');
    style.id = 'component-styles';
    style.textContent = '.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.65);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;z-index:var(--z-modal);opacity:0;visibility:hidden;transition:opacity .3s,visibility .3s;padding:16px}.modal-overlay.active{opacity:1;visibility:visible}.modal-box{background:var(--bg-secondary);border:1px solid var(--border);border-radius:var(--radius-xl);padding:32px;max-width:860px;width:100%;max-height:90vh;overflow-y:auto;position:relative;transform:scale(.92) translateY(20px);transition:transform .3s;box-shadow:var(--shadow-2xl)}.modal-overlay.active .modal-box{transform:scale(1) translateY(0)}.modal-close{position:absolute;top:16px;right:16px;width:36px;height:36px;background:var(--bg-tertiary);border-radius:var(--radius-full);display:flex;align-items:center;justify-content:center;color:var(--text-primary);font-size:1rem;transition:var(--transition-fast);cursor:pointer}.modal-close:hover{background:var(--danger);color:#fff}.qv-grid{display:grid;grid-template-columns:1fr 1fr;gap:32px;align-items:start}@media(max-width:640px){.qv-grid{grid-template-columns:1fr}}.qv-image img{width:100%;border-radius:var(--radius-lg);box-shadow:var(--shadow-lg)}.qv-title{font-size:1.3rem;margin:8px 0 12px;color:var(--text-primary)}.qv-actions{display:flex;flex-wrap:wrap;gap:12px;margin:20px 0 12px}.qv-note{font-size:.78rem;color:var(--text-tertiary);display:flex;align-items:center;gap:6px}.help-cards-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:24px;margin-top:20px}.help-card{display:block;background:var(--bg-secondary);border:1px solid var(--border);border-radius:var(--radius-lg);padding:32px 24px;text-align:center;text-decoration:none;transition:var(--transition);box-shadow:var(--shadow-sm);color:var(--text-primary)}.help-card:hover{transform:translateY(-6px);box-shadow:var(--shadow-xl);border-color:var(--accent)}.help-icon{width:64px;height:64px;margin:0 auto 16px;background:var(--accent-light);border-radius:var(--radius-lg);display:flex;align-items:center;justify-content:center;font-size:1.6rem;color:var(--accent);transition:var(--transition)}.help-card:hover .help-icon{background:var(--accent);color:#fff;transform:scale(1.1);box-shadow:var(--shadow-glow-accent)}.help-card h3{font-size:1.05rem;margin-bottom:6px}.help-card p{font-size:.88rem;color:var(--text-secondary);margin:0}.info-card{background:var(--accent-light);border:1px solid var(--accent);border-radius:var(--radius-lg);padding:24px 28px;margin-bottom:32px}.info-card h2{color:var(--accent);margin-bottom:8px}.info-sections{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:24px;margin:32px 0}.info-section{background:var(--bg-secondary);border:1px solid var(--border);border-radius:var(--radius-lg);padding:24px;box-shadow:var(--shadow-sm)}.info-section h3{display:flex;align-items:center;gap:10px;font-size:1.05rem;margin-bottom:12px;color:var(--accent)}.info-section ul,.info-section ol{padding-left:20px;list-style:disc}.info-section ol{list-style:decimal}.info-section li{margin-bottom:6px;color:var(--text-secondary);font-size:.95rem}.alert-box{background:var(--info-light);border-left:4px solid var(--info);border-radius:var(--radius-md);padding:16px 20px;font-size:.92rem;color:var(--text-secondary);display:flex;align-items:flex-start;gap:10px;margin:24px 0}.alert-box.alert-warning{background:var(--warning-light);border-left-color:var(--warning)}.tab-btn{cursor:pointer;padding:10px 20px;border-radius:var(--radius-full);background:var(--bg-tertiary);border:1px solid var(--border);font-weight:600;transition:var(--transition-fast);color:var(--text-secondary)}.tab-btn.active{background:var(--accent);color:#fff;border-color:var(--accent)}.tab-panel{display:none}.tab-panel.active{display:block}';
    document.head.appendChild(style);
  }

  /* ── INIT ── */
  document.addEventListener('DOMContentLoaded', function () {
    injectStyles();
    initQuickView();
    initFilters();
    initAccordion();
    initHelpCards();
    initTooltips();
    initCopyButtons();
    initTabs();
    var obs = new MutationObserver(function () { initQuickView(); initTooltips(); initCopyButtons(); });
    obs.observe(document.body, { childList: true, subtree: true });
  });

  window.MeowComponents = { openQuickView: openQV, closeQuickView: closeQV };

})();
