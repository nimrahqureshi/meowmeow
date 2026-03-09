/* =============================================
   SCRIPT.JS — MeowMeow Unified Script v2.0
   All-in-one: Theme · Navbar · Scroll · Search
   Cart · Filters · Affiliate · Components · Utils
   ============================================= */

(function () {
  'use strict';

  /* ════════════════════════════════════════════
     1. THEME MANAGEMENT
  ════════════════════════════════════════════ */
  const ThemeManager = {
    STORAGE_KEY: 'meowmeow-theme',

    get() {
      return localStorage.getItem(this.STORAGE_KEY) ||
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    },

    set(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      document.body.setAttribute('data-theme', theme);
      localStorage.setItem(this.STORAGE_KEY, theme);
      this.syncIcons(theme);
    },

    toggle() {
      this.set(this.get() === 'dark' ? 'light' : 'dark');
    },

    syncIcons(theme) {
      const icon = document.getElementById('themeIcon');
      if (icon) {
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
      }
      const mobileToggle = document.getElementById('mobileThemeToggle');
      if (mobileToggle) mobileToggle.checked = theme === 'dark';
    },

    init() {
      const theme = this.get();
      this.set(theme);

      document.addEventListener('DOMContentLoaded', () => {
        const btn = document.getElementById('themeToggle');
        if (btn) btn.addEventListener('click', () => this.toggle());

        const mobileToggle = document.getElementById('mobileThemeToggle');
        if (mobileToggle) {
          mobileToggle.addEventListener('change', () => this.toggle());
        }
      });
    }
  };

  // Apply theme immediately (before DOM ready) to prevent flash
  ThemeManager.set(ThemeManager.get());

  /* ════════════════════════════════════════════
     2. CART SYSTEM
  ════════════════════════════════════════════ */
  window.MeowCart = {
    STORAGE_KEY: 'mm-cart',
    items: [],

    load() {
      try { this.items = JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || []; }
      catch { this.items = []; }
      this.updateBadge();
    },

    save() {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.items));
      this.updateBadge();
    },

    add(product) {
      const existing = this.items.find(i => i.id === product.id);
      if (existing) {
        existing.qty = Math.min(existing.qty + 1, 99);
      } else {
        this.items.push({ ...product, qty: 1 });
      }
      this.save();
      showToast(`🛒 ${product.name} added!`, 'success');
      this._bumpBadge();
    },

    remove(id) {
      this.items = this.items.filter(i => i.id !== id);
      this.save();
    },

    updateQty(id, delta) {
      const item = this.items.find(i => i.id === id);
      if (!item) return;
      item.qty = Math.max(1, Math.min(99, item.qty + delta));
      this.save();
    },

    total() {
      return this.items.reduce((s, i) => s + parseFloat(i.price) * i.qty, 0);
    },

    count() {
      return this.items.reduce((s, i) => s + i.qty, 0);
    },

    clear() {
      this.items = [];
      this.save();
    },

    updateBadge() {
      const c = this.count();
      const label = c > 99 ? '99+' : c;
      document.querySelectorAll('#cartCount, #mobileCartCount').forEach(el => {
        if (el) el.textContent = label;
      });
    },

    _bumpBadge() {
      document.querySelectorAll('#cartCount').forEach(el => {
        el.classList.add('bump');
        setTimeout(() => el.classList.remove('bump'), 400);
      });
    }
  };

  /* ════════════════════════════════════════════
     3. TOAST SYSTEM
  ════════════════════════════════════════════ */
  window.showToast = function (message, type = 'info', duration = 4000) {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      container.id = 'toastContainer';
      document.body.appendChild(container);
    }

    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span>${icons[type] || icons.info}</span>
      <span style="flex:1">${message}</span>
      <button style="background:none;border:none;cursor:pointer;color:inherit;font-size:0.85rem;opacity:0.6;padding:0 2px;" aria-label="Close">✕</button>`;

    toast.querySelector('button').addEventListener('click', () => _removeToast(toast));
    container.appendChild(toast);

    const t = setTimeout(() => _removeToast(toast), duration);
    toast._timer = t;
    return toast;
  };

  function _removeToast(toast) {
    clearTimeout(toast._timer);
    toast.classList.add('out');
    setTimeout(() => toast.remove(), 280);
  }

  /* ════════════════════════════════════════════
     4. SCROLL EFFECTS
  ════════════════════════════════════════════ */
  const ScrollFX = {
    init() {
      this._progress();
      this._backToTop();
      this._reveal();
      this._counters();
      this._navHide();
    },

    _progress() {
      const bar = document.getElementById('scrollProgress');
      if (!bar) return;
      window.addEventListener('scroll', () => {
        const h = document.documentElement;
        const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
        bar.style.width = pct + '%';
      }, { passive: true });
    },

    _backToTop() {
      const btn = document.getElementById('backToTop');
      if (!btn) return;
      window.addEventListener('scroll', () => {
        btn.classList.toggle('visible', window.scrollY > 400);
      }, { passive: true });
      btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    },

    _reveal() {
      if (!('IntersectionObserver' in window)) return;
      const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('revealed');
            obs.unobserve(e.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

      document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => obs.observe(el));
    },

    _counters() {
      const counters = document.querySelectorAll('[data-count]');
      if (!counters.length) return;

      const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (!e.isIntersecting) return;
          const el  = e.target;
          const end = parseInt(el.getAttribute('data-count'), 10);
          const dur = 1800;
          const start = performance.now();

          function step(now) {
            const t = Math.min((now - start) / dur, 1);
            const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
            el.textContent = Math.floor(ease * end).toLocaleString();
            if (t < 1) requestAnimationFrame(step);
          }

          requestAnimationFrame(step);
          obs.unobserve(el);
        });
      }, { threshold: 0.5 });

      counters.forEach(el => obs.observe(el));
    },

    _navHide() {
      const nav = document.getElementById('navbar');
      if (!nav) return;
      let last = 0;
      window.addEventListener('scroll', () => {
        const cur = window.scrollY;
        if (cur > 80) {
          nav.classList.toggle('nav-hidden', cur > last && cur > 200);
        } else {
          nav.classList.remove('nav-hidden');
        }
        last = cur;
      }, { passive: true });
    }
  };

  /* ════════════════════════════════════════════
     5. NAVBAR & MOBILE MENU
  ════════════════════════════════════════════ */
  const NavManager = {
    init() {
      const menuToggle  = document.getElementById('menuToggle');
      const mobileClose = document.getElementById('mobileClose');
      const mobileMenu  = document.getElementById('mobileMenu');
      const overlay     = document.getElementById('mobileOverlay');

      const open = () => {
        mobileMenu?.classList.add('open');
        overlay?.classList.add('active');
        document.body.style.overflow = 'hidden';
        menuToggle?.setAttribute('aria-expanded', 'true');
      };

      const close = () => {
        mobileMenu?.classList.remove('open');
        overlay?.classList.remove('active');
        document.body.style.overflow = '';
        menuToggle?.setAttribute('aria-expanded', 'false');
      };

      menuToggle?.addEventListener('click', open);
      mobileClose?.addEventListener('click', close);
      overlay?.addEventListener('click', close);

      // Close on ESC
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape') close();
      });

      // Active nav link
      const path = window.location.pathname.split('/').pop() || 'index.html';
      document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href === path || (path === '' && href === 'index.html')) {
          link.classList.add('active');
        }
      });
    }
  };

  /* ════════════════════════════════════════════
     6. SEARCH
  ════════════════════════════════════════════ */
  const SearchManager = {
    // Sample product data — expand as needed
    products: [
      { id:'p1',  name:'Floral Wrap Dress',          cat:'Women', price:'$24.99', url:'products.html' },
      { id:'p2',  name:'Classic White T-Shirt',       cat:'Women', price:'$12.99', url:'products.html' },
      { id:'p3',  name:'High-Waist Skinny Jeans',     cat:'Women', price:'$34.99', url:'products.html' },
      { id:'p4',  name:'Crossbody Leather Bag',       cat:'Women', price:'$29.99', url:'products.html' },
      { id:'p5',  name:'Oversized Hoodie',            cat:'Men',   price:'$22.99', url:'products.html' },
      { id:'p6',  name:'Slim Fit Chinos',             cat:'Men',   price:'$28.99', url:'products.html' },
      { id:'p7',  name:'Wireless Earbuds Pro',        cat:'Tech',  price:'$19.99', url:'products.html' },
      { id:'p8',  name:'Portable Power Bank 20000mAh',cat:'Tech',  price:'$17.99', url:'products.html' },
      { id:'p9',  name:'Smart Watch Fitness Tracker', cat:'Tech',  price:'$39.99', url:'products.html' },
      { id:'p10', name:'Gaming Mouse RGB',             cat:'Tech',  price:'$14.99', url:'products.html' },
      { id:'p11', name:'Vitamin C Serum',              cat:'Beauty',price:'$11.99', url:'products.html' },
      { id:'p12', name:'Matte Lipstick Set',           cat:'Beauty',price:'$8.99',  url:'products.html' },
      { id:'p13', name:'Air Fryer 4L',                 cat:'Home',  price:'$49.99', url:'products.html' },
      { id:'p14', name:'Yoga Mat Non-Slip',            cat:'Fitness',price:'$16.99',url:'products.html' },
      { id:'p15', name:'Resistance Band Set',          cat:'Fitness',price:'$9.99', url:'products.html' },
      { id:'p16', name:'Kids Backpack Dinosaur',       cat:'Kids',  price:'$13.99', url:'products.html' },
      { id:'p17', name:'Kids Sneakers Light-Up',       cat:'Kids',  price:'$19.99', url:'products.html' },
      { id:'p18', name:'Men\'s Polarized Sunglasses',  cat:'Men',   price:'$11.99', url:'products.html' },
      { id:'p19', name:'Stainless Steel Watch',        cat:'Men',   price:'$29.99', url:'products.html' },
      { id:'p20', name:'Linen Jogger Pants',           cat:'Women', price:'$21.99', url:'products.html' },
    ],

    _debounce: null,

    init() {
      const input   = document.getElementById('searchInput');
      const results = document.getElementById('searchResults');
      const clear   = document.getElementById('searchClear');
      const toggle  = document.getElementById('searchToggle');
      const wrapper = document.querySelector('.nav-search');

      if (!input || !results) return;

      // Mobile search toggle
      toggle?.addEventListener('click', () => {
        wrapper?.classList.toggle('search-open');
        if (wrapper?.classList.contains('search-open')) input.focus();
      });

      // Ctrl+K shortcut
      document.addEventListener('keydown', e => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
          e.preventDefault();
          wrapper?.classList.add('search-open');
          input.focus();
        }
      });

      input.addEventListener('input', () => {
        clearTimeout(this._debounce);
        const q = input.value.trim();
        clear.style.display = q ? 'flex' : 'none';
        this._debounce = setTimeout(() => this._search(q, results), 220);
      });

      clear?.addEventListener('click', () => {
        input.value = '';
        clear.style.display = 'none';
        results.style.display = 'none';
        results.innerHTML = '';
        input.focus();
      });

      document.addEventListener('click', e => {
        if (!e.target.closest('.search-wrapper')) {
          results.style.display = 'none';
        }
      });

      input.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
          results.style.display = 'none';
          input.blur();
        }
      });
    },

    _highlight(text, q) {
      if (!q) return text;
      return text.replace(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'),
        '<mark style="background:var(--rose-light);color:var(--accent);border-radius:3px;padding:0 2px;">$1</mark>');
    },

    _search(q, results) {
      if (!q || q.length < 2) { results.style.display = 'none'; return; }

      const matches = this.products.filter(p =>
        p.name.toLowerCase().includes(q.toLowerCase()) ||
        p.cat.toLowerCase().includes(q.toLowerCase())
      ).slice(0, 6);

      if (!matches.length) {
        results.innerHTML = `<div style="padding:16px;color:var(--text-tertiary);font-size:0.85rem;text-align:center;">No results for "<strong>${q}</strong>"</div>`;
      } else {
        results.innerHTML = matches.map(p => `
          <a href="${p.url}" class="search-result-item" style="display:flex;align-items:center;gap:12px;padding:10px 14px;text-decoration:none;border-bottom:1px solid var(--border);transition:background var(--t-fast);">
            <span style="width:34px;height:34px;border-radius:var(--radius-md);background:var(--rose-light);color:var(--accent);display:flex;align-items:center;justify-content:center;font-size:0.8rem;flex-shrink:0;"><i class="fas fa-tag"></i></span>
            <span style="flex:1;min-width:0;">
              <span style="display:block;font-size:0.88rem;font-weight:600;color:var(--text-primary);">${this._highlight(p.name, q)}</span>
              <span style="font-size:0.74rem;font-family:var(--font-mono);color:var(--text-tertiary);">${p.cat} · ${p.price}</span>
            </span>
          </a>`).join('');
      }

      results.style.display = 'block';
    }
  };

  /* ════════════════════════════════════════════
     7. FILTER BAR
  ════════════════════════════════════════════ */
  const FilterManager = {
    init() {
      document.querySelectorAll('.filter-bar').forEach(bar => {
        bar.querySelectorAll('.filter-btn').forEach(btn => {
          btn.addEventListener('click', function () {
            bar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            const filter = this.getAttribute('data-filter') || 'all';
            // Look in same section first, then whole page
            const section = bar.closest('section');
            const grid = section?.querySelector('.product-grid, .blog-grid') ||
                         document.querySelector('.product-grid, .blog-grid');
            if (!grid) return;

            const cards = grid.querySelectorAll('[data-category]');
            cards.forEach(card => {
              const cat  = (card.getAttribute('data-category') || '').toLowerCase();
              const show = filter === 'all' || cat.includes(filter.toLowerCase());
              card.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
              if (show) {
                card.style.display = '';
                requestAnimationFrame(() => {
                  card.style.opacity = '1';
                  card.style.transform = 'scale(1)';
                });
              } else {
                card.style.opacity = '0';
                card.style.transform = 'scale(0.96)';
                setTimeout(() => {
                  if (card.style.opacity === '0') card.style.display = 'none';
                }, 260);
              }
            });
          });
        });
      });
    }
  };

  /* ════════════════════════════════════════════
     8. COUNTDOWN TIMER
  ════════════════════════════════════════════ */
  const CountdownTimer = {
    STORAGE_KEY: 'mm-countdown-end',

    init() {
      const els = {
        h: document.getElementById('timerH'),
        m: document.getElementById('timerM'),
        s: document.getElementById('timerS'),
      };
      if (!els.h && !els.m && !els.s) return;

      let end = parseInt(localStorage.getItem(this.STORAGE_KEY), 10);
      if (!end || end < Date.now()) {
        end = Date.now() + 8 * 3600 * 1000; // 8 hours
        localStorage.setItem(this.STORAGE_KEY, end);
      }

      const tick = () => {
        const diff = Math.max(0, end - Date.now());
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        if (els.h) els.h.textContent = String(h).padStart(2, '0');
        if (els.m) els.m.textContent = String(m).padStart(2, '0');
        if (els.s) els.s.textContent = String(s).padStart(2, '0');
        if (diff <= 0) clearInterval(timer);
      };

      tick();
      const timer = setInterval(tick, 1000);
    }
  };

  /* ════════════════════════════════════════════
     9. AFFILIATE LINKS
  ════════════════════════════════════════════ */
  const AffiliateManager = {
    PARAMS: {
      amazon:     { tag: 'meowmeow-20' },
      daraz:      { af_id: 'meowmeow' },
      temu:       { referral_code: 'meowmeow' },
      aliexpress: { aff_fcid: 'meowmeow' },
    },

    init() {
      document.querySelectorAll('a[href]').forEach(link => {
        const href = link.href;
        let platform = null;
        if (href.includes('amazon.'))     platform = 'amazon';
        else if (href.includes('daraz.')) platform = 'daraz';
        else if (href.includes('temu.'))  platform = 'temu';
        else if (href.includes('aliexpress.')) platform = 'aliexpress';

        if (platform) {
          link.setAttribute('target', '_blank');
          link.setAttribute('rel', 'noopener noreferrer sponsored');

          link.addEventListener('click', () => {
            if (typeof gtag !== 'undefined') {
              gtag('event', 'affiliate_click', {
                event_category: 'Affiliate',
                event_label: platform,
                value: 1
              });
            }
          });
        }
      });
    }
  };

  /* ════════════════════════════════════════════
     10. CART PAGE RENDERER
  ════════════════════════════════════════════ */
  function renderCartPage() {
    const container = document.getElementById('cartContainer');
    if (!container) return;

    window.renderCartUI = function () {
      const cart = window.MeowCart;
      if (!cart.items.length) {
        container.innerHTML = `
          <div class="cart-empty">
            <div class="cart-empty-icon"><i class="fas fa-shopping-cart"></i></div>
            <h3>Your cart is empty</h3>
            <p>Looks like you haven't added anything yet. Discover amazing products!</p>
            <a href="products.html" class="btn btn-primary btn-lg"><i class="fas fa-th-large"></i> Browse Products</a>
          </div>`;
        return;
      }

      const itemsHTML = cart.items.map(item => `
        <div class="cart-item" data-id="${item.id}">
          <img src="${item.img || 'https://via.placeholder.com/90'}" alt="${item.name}" loading="lazy" />
          <div class="cart-item-details">
            <h4>${item.name}</h4>
            <div class="mp-tag"><i class="fas fa-store"></i> ${item.platform || 'Partner Store'}</div>
            <div class="qty-controls">
              <button class="qty-btn" onclick="MeowCart.updateQty('${item.id}',-1);renderCartUI()">−</button>
              <span class="qty-display">${item.qty}</span>
              <button class="qty-btn" onclick="MeowCart.updateQty('${item.id}',1);renderCartUI()">+</button>
            </div>
          </div>
          <div>
            <div class="cart-price">$${(parseFloat(item.price.replace('$','')) * item.qty).toFixed(2)}</div>
            <div class="cart-item-unit-price">$${item.price} each</div>
          </div>
          <button class="remove-item" onclick="MeowCart.remove('${item.id}');renderCartUI()" aria-label="Remove"><i class="fas fa-trash-alt"></i></button>
        </div>`).join('');

      const total    = cart.total().toFixed(2);
      const savings  = (cart.items.reduce((s, i) => s + (parseFloat((i.originalPrice || i.price).toString().replace('$','')) * i.qty), 0) - cart.total());
      const savingsHTML = savings > 0 ? `<div class="summary-row"><span>You Save</span><strong style="color:var(--success)">-$${savings.toFixed(2)}</strong></div>` : '';

      container.innerHTML = `
        <div class="cart-grid">
          <div class="cart-items">
            <div class="cart-items-header">
              <h2>Shopping Cart</h2>
              <span class="cart-count-tag">${cart.count()} item${cart.count() !== 1 ? 's' : ''}</span>
              <button class="clear-cart-btn" onclick="MeowCart.clear();renderCartUI()"><i class="fas fa-trash"></i> Clear all</button>
            </div>
            ${itemsHTML}
          </div>
          <div class="summary-card">
            <h3><i class="fas fa-receipt"></i> Order Summary</h3>
            <div class="summary-row"><span>Subtotal (${cart.count()} items)</span><strong>$${total}</strong></div>
            ${savingsHTML}
            <div class="summary-row"><span>Shipping</span><span class="tag-free">FREE</span></div>
            <div class="divider"></div>
            <div class="summary-row summary-total"><span>Estimated Total</span><strong>$${total}</strong></div>
            <a href="products.html" class="btn btn-primary btn-block" style="margin-top:20px;">
              <i class="fas fa-external-link-alt"></i> Continue to Store
            </a>
            <p class="summary-disclaimer">You'll complete your purchase securely on the seller's site.</p>
            <div class="summary-payments">
              <i class="fab fa-cc-visa" title="Visa"></i>
              <i class="fab fa-cc-mastercard" title="Mastercard"></i>
              <i class="fab fa-cc-paypal" title="PayPal"></i>
              <i class="fab fa-cc-apple-pay" title="Apple Pay"></i>
              <i class="fab fa-google-pay" title="Google Pay"></i>
            </div>
          </div>
        </div>`;
    };

    renderCartUI();
  }

  /* ════════════════════════════════════════════
     11. FORMS
  ════════════════════════════════════════════ */
  const FormManager = {
    init() {
      // Contact form
      const cf = document.getElementById('contactForm');
      if (cf) {
        cf.addEventListener('submit', e => {
          e.preventDefault();
          showToast('📬 Message sent! We\'ll reply within 24h.', 'success');
          cf.reset();
        });
      }

      // Newsletter forms (any on page)
      document.querySelectorAll('[id$="NewsletterForm"], #footer-newsletter-form, .newsletter-form').forEach(form => {
        form.addEventListener('submit', e => {
          e.preventDefault();
          showToast('🎉 Subscribed! Check your inbox for deals.', 'success');
          const input = form.querySelector('input[type="email"]');
          if (input) input.value = '';
        });
      });

      // Blog load more
      const loadMoreBtn = document.getElementById('loadMoreBtn');
      if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
          showToast('📚 Loading more posts…', 'info');
          loadMoreBtn.innerHTML = '<span class="spinner-sm"></span> Loading…';
          setTimeout(() => {
            loadMoreBtn.innerHTML = 'Load More Posts <i class="fas fa-plus"></i>';
            showToast('✅ All posts loaded!', 'success');
          }, 1200);
        });
      }
    }
  };

  /* ════════════════════════════════════════════
     12. IMAGE LAZY LOAD
  ════════════════════════════════════════════ */
  function initImages() {
    document.querySelectorAll('img').forEach(img => {
      if (img.complete && img.naturalHeight !== 0) {
        img.classList.add('loaded');
      } else {
        img.addEventListener('load',  () => img.classList.add('loaded'));
        img.addEventListener('error', () => img.classList.add('loaded'));
      }
    });
  }

  /* ════════════════════════════════════════════
     13. WISHLIST BUTTONS
  ════════════════════════════════════════════ */
  function initWishlist() {
    const STORAGE_KEY = 'mm-wishlist';
    const wishlist = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

    document.querySelectorAll('.wishlist-btn').forEach(btn => {
      const card = btn.closest('[data-product]');
      if (!card) return;
      try {
        const p = JSON.parse(card.getAttribute('data-product'));
        if (wishlist.includes(p.id)) btn.classList.add('active');

        btn.addEventListener('click', e => {
          e.preventDefault();
          e.stopPropagation();
          btn.classList.toggle('active');
          const idx = wishlist.indexOf(p.id);
          if (idx === -1) {
            wishlist.push(p.id);
            showToast(`❤️ Saved to wishlist!`, 'success');
          } else {
            wishlist.splice(idx, 1);
            showToast(`Removed from wishlist`, 'info');
          }
          localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist));
        });
      } catch {}
    });
  }

  /* ════════════════════════════════════════════
     14. PARALLAX (hero blobs)
  ════════════════════════════════════════════ */
  function initParallax() {
    const blobs = document.querySelectorAll('.hero-blob');
    if (!blobs.length) return;
    document.addEventListener('mousemove', e => {
      const x = (e.clientX / window.innerWidth  - 0.5) * 30;
      const y = (e.clientY / window.innerHeight - 0.5) * 30;
      blobs.forEach((b, i) => {
        const factor = (i + 1) * 0.4;
        b.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
      });
    }, { passive: true });
  }

  /* ════════════════════════════════════════════
     INIT — Bootstrap everything on DOM ready
  ════════════════════════════════════════════ */
  function boot() {
    ThemeManager.init();
    ScrollFX.init();
    NavManager.init();
    SearchManager.init();
    FilterManager.init();
    CountdownTimer.init();
    AffiliateManager.init();
    FormManager.init();
    initImages();
    initWishlist();
    initParallax();
    MeowCart.load();

    // Cart page renderer
    if (window.location.pathname.includes('cart')) {
      renderCartPage();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  /* ════════════════════════════════════════════
     CONSOLE BRANDING
  ════════════════════════════════════════════ */
  console.log(
    '%c🐾 MeowMeow%c v2.0 Pro',
    'background:linear-gradient(135deg,#FF3366,#FFB800);color:#fff;font-size:16px;font-weight:900;padding:8px 14px;border-radius:8px 0 0 8px;',
    'background:#0D0D14;color:#f0f0ff;font-size:13px;padding:8px 14px;border-radius:0 8px 8px 0;'
  );

})();
