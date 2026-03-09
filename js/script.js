/* ============================
   SCRIPT.JS — PAGE INTERACTIONS
   ============================ */

(function() {
  'use strict';

  // ===== WISHLIST TOGGLES =====
  document.addEventListener('click', function(e) {
    const btn = e.target.closest('.wishlist-toggle');
    if (!btn) return;

    const card = btn.closest('.product-card');
    const id = btn.dataset.productId;
    const name = card?.querySelector('.product-name')?.textContent || 'Product';
    const price = parseFloat(card?.querySelector('.price-current')?.textContent?.replace(/[^0-9.]/g, '')) || 0;
    const image = card?.querySelector('.product-image img')?.src || '';

    const product = { id: id || Date.now().toString(), name, price, image };
    const added = window.MeowMeow.toggleWishlist(product);
    window.MeowMeow.saveWishlist();

    btn.classList.toggle('active', added);
    const icon = btn.querySelector('i');
    if (icon) {
      icon.className = added ? 'fas fa-heart' : 'far fa-heart';
    }
  });

  // ===== ADD TO CART BUTTONS =====
  document.addEventListener('click', function(e) {
    const btn = e.target.closest('[data-add-cart]');
    if (!btn) return;

    const card = btn.closest('.product-card') || btn.closest('[data-product]');
    if (!card) return;

    const product = {
      id: btn.dataset.productId || card.dataset.productId || Date.now().toString(),
      name: card.querySelector('.product-name, [data-product-name]')?.textContent || 'Product',
      price: parseFloat(card.querySelector('.price-current, [data-product-price]')?.textContent?.replace(/[^0-9.]/g, '')) || 0,
      image: card.querySelector('.product-image img, [data-product-img]')?.src || '',
      platform: card.querySelector('.product-platform, [data-platform]')?.textContent?.trim() || ''
    };

    window.MeowMeow.addToCart(product);

    // Button feedback
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check"></i> Added!';
    btn.disabled = true;
    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.disabled = false;
    }, 1800);
  });

  // ===== QUICK VIEW =====
  document.addEventListener('click', function(e) {
    const btn = e.target.closest('.quick-view-btn');
    if (!btn) return;

    const card = btn.closest('.product-card');
    if (!card) return;

    const name = card.querySelector('.product-name')?.textContent || 'Product';
    const price = card.querySelector('.price-current')?.textContent || '$0.00';
    const orig = card.querySelector('.price-original')?.textContent || '';
    const image = card.querySelector('.product-image img')?.src || '';
    const rating = card.querySelector('.stars')?.innerHTML || '';
    const count = card.querySelector('.rating-count')?.textContent || '';
    const platform = card.querySelector('.product-platform')?.textContent?.trim() || '';

    openQuickView({ name, price, orig, image, rating, count, platform });
  });

  function openQuickView(product) {
    const modal = document.getElementById('quickViewModal');
    if (!modal) return;

    modal.querySelector('.qv-name').textContent = product.name;
    modal.querySelector('.qv-price-current').textContent = product.price;
    if (modal.querySelector('.qv-price-was')) modal.querySelector('.qv-price-was').textContent = product.orig;
    modal.querySelector('.qv-img').src = product.image;
    modal.querySelector('.qv-platform').textContent = product.platform;
    if (modal.querySelector('.qv-stars')) modal.querySelector('.qv-stars').innerHTML = product.rating;
    if (modal.querySelector('.qv-rating-count')) modal.querySelector('.qv-rating-count').textContent = product.count;

    modal.classList.add('active');
    document.body.classList.add('modal-open');
  }

  // ===== MODAL CLOSE =====
  document.addEventListener('click', function(e) {
    // Close modal on backdrop click or close button
    if (e.target.classList.contains('modal-overlay') || e.target.closest('.modal-close')) {
      document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
      document.body.classList.remove('modal-open');
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
      document.body.classList.remove('modal-open');
    }
  });

  // ===== FILTER BUTTONS =====
  document.querySelectorAll('.filter-btn[data-filter]').forEach(btn => {
    btn.addEventListener('click', function() {
      const group = this.closest('[data-filter-group]');
      if (group) {
        group.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      }
      this.classList.add('active');

      const filter = this.dataset.filter;
      const container = document.querySelector('[data-product-grid]') || document.querySelector('.product-grid');
      if (!container) return;

      const cards = container.querySelectorAll('[data-category]');
      cards.forEach(card => {
        const show = filter === 'all' || card.dataset.category === filter;
        card.style.display = show ? '' : 'none';
        if (show) {
          card.style.animation = 'fadeInUp 0.4s ease both';
        }
      });
    });
  });

  // ===== CAT TABS =====
  document.querySelectorAll('.cat-tab[data-cat]').forEach(tab => {
    tab.addEventListener('click', function() {
      document.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
      this.classList.add('active');

      const cat = this.dataset.cat;
      const cards = document.querySelectorAll('.category-card[data-type]');
      cards.forEach(card => {
        card.style.display = (cat === 'all' || card.dataset.type === cat) ? '' : 'none';
      });
    });
  });

  // ===== SUBCATEGORY BUTTONS =====
  document.addEventListener('click', function(e) {
    const btn = e.target.closest('.subcategory-btn');
    if (!btn) return;
    document.querySelectorAll('.subcategory-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });

  // ===== FAQ ACCORDION =====
  document.querySelectorAll('.faq-question').forEach(q => {
    q.addEventListener('click', function() {
      const item = this.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });

  // ===== SIZE SELECTOR =====
  document.addEventListener('click', function(e) {
    const btn = e.target.closest('.size-btn');
    if (!btn) return;
    const group = btn.closest('.qv-sizes');
    if (group) {
      group.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }
  });

  // ===== NEWSLETTER FORMS =====
  document.querySelectorAll('[data-newsletter-form]').forEach(form => {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const email = this.querySelector('input[type="email"]')?.value;
      if (!email) return;

      const btn = this.querySelector('button[type="submit"], button');
      if (btn) {
        btn.innerHTML = '<i class="fas fa-check"></i> Subscribed!';
        btn.disabled = true;
        setTimeout(() => {
          btn.innerHTML = btn.dataset.originalText || 'Subscribe';
          btn.disabled = false;
        }, 3000);
      }

      showToast(`🎉 You're subscribed! Check your email.`, 'success', '📧');
      this.reset();
    });
  });

  // ===== CONTACT FORM =====
  document.getElementById('contactForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const btn = this.querySelector('[type="submit"]');
    if (btn) { btn.innerHTML = '<i class="fas fa-check"></i> Sent!'; btn.disabled = true; }
    showToast('✅ Message sent! We\'ll reply within 24 hours.', 'success');
    this.reset();
    setTimeout(() => {
      if (btn) { btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message'; btn.disabled = false; }
    }, 3000);
  });

  // ===== PARALLAX HERO =====
  const hero = document.querySelector('.hero');
  if (hero && window.innerWidth > 768) {
    window.addEventListener('mousemove', function(e) {
      const blobs = hero.querySelectorAll('.shape-blob');
      const mx = (e.clientX / window.innerWidth - 0.5) * 2;
      const my = (e.clientY / window.innerHeight - 0.5) * 2;
      blobs.forEach((blob, i) => {
        const speed = (i + 1) * 6;
        blob.style.transform = `translate(${mx * speed}px, ${my * speed}px)`;
      });
    });
  }

  // ===== LAZY LOAD IMAGES =====
  if ('IntersectionObserver' in window) {
    const imgObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) { img.src = img.dataset.src; img.removeAttribute('data-src'); }
          img.classList.add('loaded');
          imgObserver.unobserve(img);
        }
      });
    }, { rootMargin: '50px' });

    document.querySelectorAll('img[data-src]').forEach(img => imgObserver.observe(img));
  }

  // ===== SETTINGS PANEL =====
  const settingsBtn = document.getElementById('settingsBtn');
  const settingsOverlay = document.getElementById('settingsOverlay');
  const settingsClose = document.getElementById('settingsClose');
  const settingsBackdrop = document.querySelector('.settings-backdrop');

  settingsBtn?.addEventListener('click', () => settingsOverlay?.classList.add('active'));
  settingsClose?.addEventListener('click', () => settingsOverlay?.classList.remove('active'));
  settingsBackdrop?.addEventListener('click', () => settingsOverlay?.classList.remove('active'));

  // Font size
  let fontSize = parseFloat(localStorage.getItem('mm-fontsize') || '16');
  const fontDisplay = document.getElementById('fontSizeDisplay');

  function applyFontSize(size) {
    fontSize = Math.min(20, Math.max(13, size));
    document.documentElement.style.fontSize = fontSize + 'px';
    if (fontDisplay) fontDisplay.textContent = fontSize + 'px';
    localStorage.setItem('mm-fontsize', fontSize);
  }

  document.getElementById('fontSizeIncrease')?.addEventListener('click', () => applyFontSize(fontSize + 1));
  document.getElementById('fontSizeDecrease')?.addEventListener('click', () => applyFontSize(fontSize - 1));

  // Restore font size
  applyFontSize(fontSize);

  // Language selector
  document.querySelectorAll('.lang-option[data-lang]').forEach(opt => {
    opt.addEventListener('click', function() {
      document.querySelectorAll('.lang-option').forEach(o => o.classList.remove('active'));
      this.classList.add('active');
      showToast(`Language changed to ${this.querySelector('span:last-child').textContent}`, 'info', '🌐');
    });
  });

  // Currency selector
  document.querySelectorAll('.currency-option[data-currency]').forEach(opt => {
    opt.addEventListener('click', function() {
      document.querySelectorAll('.currency-option').forEach(o => o.classList.remove('active'));
      this.classList.add('active');
      showToast(`Currency changed to ${this.dataset.currency}`, 'info', '💱');
    });
  });

  // ===== SMOOTH IMAGE LOAD =====
  document.querySelectorAll('img').forEach(img => {
    if (!img.complete) {
      img.style.opacity = '0';
      img.style.transition = 'opacity 0.4s ease';
      img.addEventListener('load', () => { img.style.opacity = '1'; });
      img.addEventListener('error', () => { img.style.opacity = '1'; });
    }
  });

})();
