/* ================================================================
   SCRIPT.JS — PAGE INTERACTIONS, CART SIDEBAR, FILTER, SORT, FAQ
   ShopLux v3.0
   ================================================================ */

(function () {
  'use strict';

  /* ── CART SIDEBAR ─────────────────────────────────────────── */
  function initCartSidebar() {
    const sidebar    = document.getElementById('cartSidebar');
    const overlay    = document.getElementById('cartOverlay');
    const closeBtn   = document.getElementById('cartClose');
    const cartBtn    = document.getElementById('cartBtn');
    const itemsWrap  = document.getElementById('cartItemsList');
    const subtotalEl = document.getElementById('cartSubtotal');
    const totalEl    = document.getElementById('cartTotal');
    const emptyMsg   = document.getElementById('cartEmpty');
    const checkoutBtn= document.getElementById('checkoutBtn');

    if (!sidebar) return;

    function open()  {
      sidebar.classList.add('active');
      overlay?.classList.add('active');
      document.body.classList.add('cart-open');
      renderCartItems();
      /* focus trap */
      setTimeout(() => closeBtn?.focus(), 80);
    }

    function close() {
      sidebar.classList.remove('active');
      overlay?.classList.remove('active');
      document.body.classList.remove('cart-open');
      cartBtn?.focus();
    }

    cartBtn?.addEventListener('click',  open);
    closeBtn?.addEventListener('click', close);
    overlay?.addEventListener('click',  close);
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && sidebar.classList.contains('active')) close();
    });

    function renderCartItems() {
      if (!window.ShopLux?.Cart || !itemsWrap) return;
      const { Cart, Utils } = ShopLux;
      const items  = Cart.getAll();
      const count  = Cart.getCount();
      const total  = Cart.getTotal();

      if (!items.length) {
        itemsWrap.innerHTML = '';
        emptyMsg && (emptyMsg.style.display = 'flex');
        subtotalEl && (subtotalEl.textContent = '$0.00');
        totalEl   && (totalEl.textContent    = '$0.00');
        checkoutBtn && (checkoutBtn.disabled = true);
        return;
      }

      emptyMsg && (emptyMsg.style.display = 'none');
      checkoutBtn && (checkoutBtn.disabled = false);

      itemsWrap.innerHTML = items.map(item => `
        <div class="cart-item" data-id="${item.id}">
          <img src="${item.img || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80&h=80&fit=crop'}"
               alt="${ShopLux.Utils.escapeHTML(item.name)}"
               loading="lazy" />
          <div class="cart-item-body">
            <h4 class="cart-item-name">${ShopLux.Utils.escapeHTML(item.name)}</h4>
            <p class="cart-item-price">${Utils.formatPrice(item.price)}</p>
            <div class="qty-control">
              <button class="qty-btn dec" data-id="${item.id}" aria-label="Decrease">−</button>
              <span class="qty-value">${item.qty}</span>
              <button class="qty-btn inc" data-id="${item.id}" aria-label="Increase">+</button>
            </div>
          </div>
          <div class="cart-item-right">
            <span class="cart-item-total">${Utils.formatPrice(item.price * item.qty)}</span>
            <button class="cart-remove-btn" data-id="${item.id}" aria-label="Remove item">
              <i class="fas fa-trash-can"></i>
            </button>
          </div>
        </div>
      `).join('');

      subtotalEl && (subtotalEl.textContent = Utils.formatPrice(total));
      totalEl    && (totalEl.textContent    = Utils.formatPrice(total));
    }

    /* qty + remove buttons */
    itemsWrap?.addEventListener('click', e => {
      const dec = e.target.closest('.qty-btn.dec');
      const inc = e.target.closest('.qty-btn.inc');
      const rem = e.target.closest('.cart-remove-btn');

      if (dec) {
        const item = ShopLux.Cart.getAll().find(i => i.id === dec.dataset.id);
        if (item) {
          if (item.qty <= 1) {
            ShopLux.Cart.remove(dec.dataset.id);
            ShopLux.toast('Item removed from cart.', 'warning');
          } else {
            ShopLux.Cart.updateQty(dec.dataset.id, item.qty - 1);
          }
          renderCartItems();
        }
      } else if (inc) {
        const item = ShopLux.Cart.getAll().find(i => i.id === inc.dataset.id);
        if (item) { ShopLux.Cart.updateQty(inc.dataset.id, item.qty + 1); renderCartItems(); }
      } else if (rem) {
        ShopLux.Cart.remove(rem.dataset.id);
        ShopLux.toast('Item removed from cart.', 'warning');
        renderCartItems();
      }
    });

    /* clear cart */
    document.getElementById('clearCartBtn')?.addEventListener('click', () => {
      if (confirm('Clear your entire cart?')) {
        ShopLux.Cart.clear();
        renderCartItems();
      }
    });

    /* checkout — opens affiliate platform or cart page */
    checkoutBtn?.addEventListener('click', () => {
      ShopLux.toast('Redirecting to checkout…', 'info', 'Checkout');
      setTimeout(() => window.location.href = '/checkout.html', 800);
    });

    /* refresh on cart update */
    document.addEventListener('shoplux:cartUpdated', renderCartItems);

    /* Open with keyboard shortcut Ctrl+Shift+C */
    document.addEventListener('keydown', e => {
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        sidebar.classList.contains('active') ? close() : open();
      }
    });
  }

  /* ── PRODUCT FILTER & SORT ────────────────────────────────── */
  function initFilter() {
    const filterBtns   = document.querySelectorAll('.filter-btn[data-filter]');
    const sortSelect   = document.getElementById('sortSelect');
    const productsGrid = document.getElementById('productsGrid') || document.querySelector('.products-grid');
    const resultCount  = document.getElementById('resultCount');

    if (!productsGrid) return;

    let currentFilter = 'all';
    let currentSort   = 'default';

    function applyFilter() {
      const cards = [...productsGrid.querySelectorAll('.product-card')];

      let visible = cards;

      /* filter */
      if (currentFilter !== 'all') {
        visible = cards.filter(c =>
          c.dataset.category === currentFilter ||
          c.dataset.sub === currentFilter
        );
      }

      /* sort */
      visible.sort((a, b) => {
        const pA = parseFloat(a.querySelector('.price-current')?.textContent?.replace(/[^0-9.]/g,'') || 0);
        const pB = parseFloat(b.querySelector('.price-current')?.textContent?.replace(/[^0-9.]/g,'') || 0);
        const rA = parseFloat(a.querySelector('.rating-count')?.textContent?.replace(/[^0-9.]/g,'') || 0);
        const rB = parseFloat(b.querySelector('.rating-count')?.textContent?.replace(/[^0-9.]/g,'') || 0);

        switch (currentSort) {
          case 'price-asc':    return pA - pB;
          case 'price-desc':   return pB - pA;
          case 'rating':       return rB - rA;
          case 'reviews':      return rB - rA;
          default:             return 0;
        }
      });

      /* show/hide */
      cards.forEach(c => { c.style.display = 'none'; c.style.order = ''; });
      visible.forEach((c, i) => { c.style.display = ''; c.style.order = String(i); });

      resultCount && (resultCount.textContent = `${visible.length} product${visible.length !== 1 ? 's' : ''}`);
    }

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed','false'); });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
        currentFilter = btn.dataset.filter;
        applyFilter();
      });
    });

    sortSelect?.addEventListener('change', () => {
      currentSort = sortSelect.value;
      applyFilter();
    });
  }

  /* ── PRODUCT TAB SWITCHING ────────────────────────────────── */
  function initProductTabs() {
    const tabs = document.querySelectorAll('[data-tab]');
    const panes = document.querySelectorAll('[data-tab-content]');
    if (!tabs.length) return;

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.tab;

        tabs.forEach(t  => { t.classList.remove('active'); t.setAttribute('aria-selected','false'); });
        panes.forEach(p => { p.classList.remove('active'); p.hidden = true; });

        tab.classList.add('active');
        tab.setAttribute('aria-selected','true');

        const pane = document.querySelector(`[data-tab-content="${target}"]`);
        if (pane) { pane.classList.add('active'); pane.hidden = false; }
      });
    });
  }

  /* ── IMAGE ZOOM / LIGHTBOX ────────────────────────────────── */
  function initLightbox() {
    /* Simple lightbox for product images */
    const lightbox = document.getElementById('imageLightbox');
    if (!lightbox) return;

    const imgEl  = lightbox.querySelector('.lightbox-img');
    const closeL = lightbox.querySelector('.lightbox-close');

    document.querySelectorAll('[data-lightbox]').forEach(trigger => {
      trigger.style.cursor = 'zoom-in';
      trigger.addEventListener('click', e => {
        e.preventDefault();
        const src = trigger.dataset.lightbox || trigger.src || trigger.href;
        if (imgEl && src) imgEl.src = src;
        lightbox.classList.add('active');
        lightbox.setAttribute('aria-hidden', 'false');
        closeL?.focus();
      });
    });

    function closeLightbox() {
      lightbox.classList.remove('active');
      lightbox.setAttribute('aria-hidden','true');
    }

    closeL?.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });
  }

  /* ── VIEW TOGGLE (grid / list) ────────────────────────────── */
  function initViewToggle() {
    const gridBtn  = document.getElementById('viewGrid');
    const listBtn  = document.getElementById('viewList');
    const grid     = document.getElementById('productsGrid') || document.querySelector('.products-grid');
    if (!grid || !gridBtn) return;

    gridBtn.addEventListener('click', () => {
      grid.classList.remove('list-view');
      grid.classList.add('grid-view');
      gridBtn.classList.add('active');
      listBtn?.classList.remove('active');
      try { localStorage.setItem('sl_view', 'grid'); } catch {}
    });

    listBtn?.addEventListener('click', () => {
      grid.classList.add('list-view');
      grid.classList.remove('grid-view');
      listBtn.classList.add('active');
      gridBtn.classList.remove('active');
      try { localStorage.setItem('sl_view', 'list'); } catch {}
    });

    /* restore preference */
    const saved = localStorage.getItem('sl_view');
    if (saved === 'list' && listBtn) listBtn.click();
  }

  /* ── LOAD MORE ────────────────────────────────────────────── */
  function initLoadMore() {
    document.querySelectorAll('.load-more-btn[data-target]').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = document.getElementById(btn.dataset.target);
        if (!target) return;

        const hidden = [...target.querySelectorAll('.product-card[style*="display: none"]')]
          .slice(0, 8);

        if (!hidden.length) {
          btn.textContent = 'All products loaded';
          btn.disabled = true;
          return;
        }

        btn.classList.add('loading');
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading…';

        setTimeout(() => {
          hidden.forEach(c => { c.style.display = ''; });
          btn.classList.remove('loading');
          btn.innerHTML = 'Load More Products';

          const remaining = target.querySelectorAll('.product-card[style*="display: none"]').length;
          if (!remaining) {
            btn.textContent = 'All products loaded';
            btn.disabled = true;
          }
        }, 600);
      });
    });
  }

  /* ── SHARE BUTTONS ────────────────────────────────────────── */
  function initShare() {
    document.querySelectorAll('[data-share]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const url   = btn.dataset.shareUrl || window.location.href;
        const title = btn.dataset.shareTitle || document.title;
        const text  = btn.dataset.shareText || 'Check out ShopLux!';

        if (navigator.share) {
          try { await navigator.share({ title, text, url }); } catch {}
        } else {
          try {
            await navigator.clipboard.writeText(url);
            ShopLux?.toast('Link copied to clipboard! 🔗', 'success');
          } catch {
            ShopLux?.toast('Copy failed — please copy the URL manually.', 'error');
          }
        }
      });
    });
  }

  /* ── PROMO CODE ───────────────────────────────────────────── */
  function initPromoCode() {
    const form  = document.getElementById('promoForm');
    const input = document.getElementById('promoInput');
    const msgEl = document.getElementById('promoMsg');

    const CODES = {
      'SAVE10'  : { discount: 10, type: 'percent', message: '10% discount applied!' },
      'FIRST5'  : { discount: 5,  type: 'fixed',   message: '$5 off your order!' },
      'SHOPLUX' : { discount: 15, type: 'percent', message: '15% VIP discount applied! 🎉' },
      'FREESHIP': { discount: 0,  type: 'shipping', message: 'Free shipping unlocked! 📦' },
    };

    form?.addEventListener('submit', e => {
      e.preventDefault();
      const code = input?.value.trim().toUpperCase();
      const promo = CODES[code];

      if (!msgEl) return;

      if (promo) {
        msgEl.className = 'promo-msg promo-success';
        msgEl.innerHTML = `<i class="fas fa-check-circle"></i> ${promo.message}`;
        ShopLux?.toast(promo.message, 'success', 'Promo Applied!');
        try { sessionStorage.setItem('sl_promo', JSON.stringify({ code, ...promo })); } catch {}
      } else {
        msgEl.className = 'promo-msg promo-error';
        msgEl.innerHTML = `<i class="fas fa-times-circle"></i> Invalid code. Try SAVE10 or SHOPLUX.`;
        ShopLux?.toast('Invalid promo code.', 'error');
      }
    });
  }

  /* ── NEWSLETTER SUBSCRIBE ─────────────────────────────────── */
  function initNewsletter() {
    document.querySelectorAll('.newsletter-form, [data-newsletter-form]').forEach(form => {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        const emailInput = this.querySelector('input[type="email"]');
        const email = emailInput?.value.trim();

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          ShopLux?.toast('Please enter a valid email address.', 'warning');
          return;
        }

        const btn = this.querySelector('button[type="submit"]');
        if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'; }

        /* simulate API call */
        setTimeout(() => {
          ShopLux?.toast(
            '🎉 Subscribed! You\'ll get exclusive deals & a welcome gift.',
            'success', 'Welcome to ShopLux!'
          );
          this.reset();
          if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-paper-plane"></i> Subscribe'; }
          try { localStorage.setItem('sl_subscribed', email); } catch {}
        }, 900);
      });
    });
  }

  /* ── RATING STARS (interactive, review forms) ─────────────── */
  function initRatingInput() {
    document.querySelectorAll('.rating-input').forEach(wrap => {
      const stars  = wrap.querySelectorAll('i[data-rating]');
      const hidden = wrap.querySelector('input[type="hidden"]');
      let selected = 0;

      stars.forEach(star => {
        star.addEventListener('mouseenter', () => {
          const val = parseInt(star.dataset.rating, 10);
          stars.forEach((s, i) => s.classList.toggle('hover', i < val));
        });
        star.addEventListener('mouseleave', () => {
          stars.forEach(s => s.classList.remove('hover'));
        });
        star.addEventListener('click', () => {
          selected = parseInt(star.dataset.rating, 10);
          stars.forEach((s, i) => s.classList.toggle('selected', i < selected));
          if (hidden) hidden.value = String(selected);
        });
      });

      wrap.addEventListener('mouseleave', () => {
        stars.forEach((s, i) => {
          s.classList.remove('hover');
          s.classList.toggle('selected', i < selected);
        });
      });
    });
  }

  /* ── KEYBOARD SHORTCUTS ───────────────────────────────────── */
  function initKeyboard() {
    document.addEventListener('keydown', e => {
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      switch (true) {
        /* / = focus search */
        case e.key === '/':
          e.preventDefault();
          document.getElementById('navSearch')?.classList.add('active');
          document.getElementById('searchInput')?.focus();
          break;

        /* Ctrl+Shift+C = cart */
        case e.ctrlKey && e.shiftKey && e.key === 'C': {
          e.preventDefault();
          const sidebar = document.getElementById('cartSidebar');
          if (sidebar) sidebar.classList.toggle('active');
          break;
        }
      }
    });
  }

  /* ── IMAGE ERROR FALLBACK (global) ───────────────────────────*/
  function initImageFallback() {
    document.addEventListener('error', e => {
      const img = e.target;
      if (img.tagName !== 'IMG') return;
      /* only apply once to avoid loops */
      if (img.dataset.fbApplied) return;
      img.dataset.fbApplied = '1';
      img.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop&q=60';
    }, true);
  }

  /* ── CATEGORY PAGE ACCENT COLORS ─────────────────────────── */
  function initCategoryAccent() {
    const cat = document.body.dataset.category;
    if (!cat || !window.ShopLux?.Categories) return;
    const catObj = ShopLux.Categories.find(c => c.id === cat);
    if (catObj) {
      document.documentElement.style.setProperty('--accent', catObj.color);
    }
  }

  /* ── INIT ALL ─────────────────────────────────────────────── */
  function init() {
    initCartSidebar();
    initFilter();
    initProductTabs();
    initLightbox();
    initViewToggle();
    initLoadMore();
    initShare();
    initPromoCode();
    initNewsletter();
    initRatingInput();
    initKeyboard();
    initImageFallback();
    initCategoryAccent();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
