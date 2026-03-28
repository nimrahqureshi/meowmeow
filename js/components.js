/* ============================
   COMPONENT.JS — UI COMPONENTS  (FIXED v2)
   Handles: theme toggle sync, quick view for static HTML cards
   ============================ */

(function () {
  'use strict';

  /* ─── THEME TOGGLE ─── */
  // Expose window.MeowTheme if themes.js hasn't already (safety fallback)
  if (!window.MeowTheme) {
    var THEME_KEY = 'meowmeow-theme';
    window.MeowTheme = {
      get    : function () { return document.documentElement.getAttribute('data-theme') || 'light'; },
      set    : function (t) {
        document.documentElement.setAttribute('data-theme', t);
        try { localStorage.setItem(THEME_KEY, t); } catch (e) {}
      },
      toggle : function () {
        window.MeowTheme.set(window.MeowTheme.get() === 'dark' ? 'light' : 'dark');
      }
    };
  }

  document.addEventListener('DOMContentLoaded', function () {

    /* Sync checkbox toggles */
    document.querySelectorAll('#themeCheckbox, #mobileThemeCheckbox, .theme-toggle-input').forEach(function (el) {
      if (el._compBound) return;
      el._compBound = true;
      el.addEventListener('change', function () {
        window.MeowTheme.set(this.checked ? 'dark' : 'light');
      });
    });

    /* Button toggles */
    document.querySelectorAll('[data-theme-btn], #themeToggleBtn, .theme-toggle-btn').forEach(function (btn) {
      if (btn._compBound) return;
      btn._compBound = true;
      btn.addEventListener('click', function (e) { e.preventDefault(); window.MeowTheme.toggle(); });
    });

    /* ─── QUICK VIEW for static HTML product cards ─── */
    // render-*.js uses .aff-qv-btn — this handles .quick-view-btn on static HTML only
    document.querySelectorAll('.quick-view-btn:not([data-qv-bound])').forEach(function (btn) {
      btn.setAttribute('data-qv-bound', '1');
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();

        var card  = this.closest('.product-card');
        if (!card) return;

        var name  = (card.querySelector('.product-name')    || {}).textContent || 'Product';
        var img   = (card.querySelector('.product-image img') || {}).src || '';
        var price = (card.querySelector('.price-current')   || {}).textContent || '';
        var orig  = (card.querySelector('.price-original')  || {}).textContent || '';
        var href  = (card.querySelector('a[href]')          || {}).href || '#';

        openQV({ name: name, image: img, price: price, originalPrice: orig, url: href });
      });
    });

  });

  /* ─── QUICK VIEW MODAL ─── */
  function openQV(p) {
    var old = document.getElementById('affQuickView');
    if (old) old.parentNode.removeChild(old);

    var esc = function (s) {
      return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;')
                      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    };

    var html =
      '<div id="affQuickView" role="dialog" aria-modal="true"' +
        ' style="position:fixed;inset:0;z-index:9999;display:flex;align-items:center;' +
                'justify-content:center;background:rgba(0,0,0,.65);' +
                'backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);padding:16px;">' +
        '<div style="background:var(--bg-secondary);border:1px solid var(--border);' +
                   'border-radius:var(--radius-xl);max-width:560px;width:100%;position:relative;' +
                   'padding:0;overflow:hidden;box-shadow:var(--shadow-2xl);' +
                   'animation:scaleInBounce .3s ease both;max-height:92vh;">' +

          (p.image ? '<img src="' + esc(p.image) + '" alt="' + esc(p.name) + '"' +
            ' style="width:100%;height:220px;object-fit:cover;display:block;" />' : '') +

          '<div style="padding:22px 24px;">' +
            '<button id="affQVClose" aria-label="Close"' +
                    ' style="position:absolute;top:10px;right:10px;background:rgba(0,0,0,.45);' +
                            'border:none;border-radius:50%;width:32px;height:32px;' +
                            'display:flex;align-items:center;justify-content:center;' +
                            'color:#fff;cursor:pointer;font-size:.9rem;">' +
              '<i class="fas fa-times"></i>' +
            '</button>' +

            '<h2 style="font-family:var(--font-heading);font-size:1.15rem;font-weight:800;' +
                       'color:var(--text-primary);margin-bottom:10px;line-height:1.35;">' + esc(p.name) + '</h2>' +

            '<div style="display:flex;gap:10px;align-items:baseline;margin-bottom:18px;">' +
              '<span style="font-size:1.6rem;font-weight:900;color:var(--accent);">' + esc(p.price) + '</span>' +
              (p.originalPrice ? '<span style="color:var(--text-tertiary);text-decoration:line-through;">' + esc(p.originalPrice) + '</span>' : '') +
            '</div>' +

            (p.url && p.url !== '#' ?
              '<a href="' + esc(p.url) + '" class="btn btn-cta btn-block" target="_blank" rel="noopener noreferrer sponsored">' +
                '<i class="fas fa-external-link-alt"></i> View Product</a>' : '') +
          '</div>' +
        '</div>' +
      '</div>';

    document.body.insertAdjacentHTML('beforeend', html);
    var modal = document.getElementById('affQuickView');

    function closeQV() {
      if (modal && modal.parentNode) modal.parentNode.removeChild(modal);
      document.removeEventListener('keydown', onEsc);
    }
    function onEsc(e) { if (e.key === 'Escape') closeQV(); }

    document.getElementById('affQVClose').addEventListener('click', closeQV);
    modal.addEventListener('click', function (e) { if (e.target === modal) closeQV(); });
    document.addEventListener('keydown', onEsc);
  }

  window.MeowComponents = { version: '2.0', openQuickView: openQV };

})();
