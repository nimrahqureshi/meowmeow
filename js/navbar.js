/* ============================================================
   NAVBAR.JS — NAVIGATION, SCROLL, MOBILE MENU
   ============================================================ */

(function() {
  'use strict';

  // ===== TRANSPARENT → SCROLLED =====
  const navbar = document.getElementById('navbar');

  function handleScroll() {
    if (!navbar) return;
    if (window.pageYOffset > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  // Initial check
  handleScroll();
  window.addEventListener('scroll', handleScroll, { passive: true });

  // ===== MOBILE MENU =====
  const menuToggle   = document.getElementById('menuToggle');
  const mobileMenu   = document.getElementById('mobileMenu');
  const mobileOverlay = document.getElementById('mobileOverlay');
  const mobileClose  = document.getElementById('mobileClose');

  function openMenu() {
    mobileMenu?.classList.add('active');
    mobileOverlay?.classList.add('active');
    menuToggle?.classList.add('active');
    document.body.classList.add('menu-open');
  }

  function closeMenu() {
    mobileMenu?.classList.remove('active');
    mobileOverlay?.classList.remove('active');
    menuToggle?.classList.remove('active');
    document.body.classList.remove('menu-open');
  }

  menuToggle?.addEventListener('click', () => {
    mobileMenu?.classList.contains('active') ? closeMenu() : openMenu();
  });

  mobileClose?.addEventListener('click', closeMenu);
  mobileOverlay?.addEventListener('click', closeMenu);

  // Close on nav link click
  document.querySelectorAll('.mobile-nav-links a').forEach(a => {
    a.addEventListener('click', closeMenu);
  });

  // ===== SETTINGS PANEL =====
  const settingsBtn   = document.getElementById('settingsBtn');
  const settingsPanel = document.getElementById('settingsPanel');
  const settingsClose = document.getElementById('settingsClose');
  const settingsOverlay = document.getElementById('settingsOverlay');

  function openSettings() {
    settingsPanel?.classList.add('active');
    settingsOverlay?.classList.add('active');
    document.body.classList.add('modal-open');
  }

  function closeSettings() {
    settingsPanel?.classList.remove('active');
    settingsOverlay?.classList.remove('active');
    document.body.classList.remove('modal-open');
  }

  settingsBtn?.addEventListener('click', openSettings);
  settingsClose?.addEventListener('click', closeSettings);
  settingsOverlay?.addEventListener('click', closeSettings);

  // ===== PROMO STRIP =====
  const promoClose = document.getElementById('promoClose');
  const promoStrip = document.getElementById('promoStrip');
  if (promoClose && promoStrip) {
    promoClose.addEventListener('click', () => {
      promoStrip.style.height = promoStrip.offsetHeight + 'px';
      promoStrip.style.overflow = 'hidden';
      promoStrip.style.transition = 'height 0.3s ease, opacity 0.3s ease';
      setTimeout(() => {
        promoStrip.style.height = '0';
        promoStrip.style.opacity = '0';
        promoStrip.style.padding = '0';
      }, 10);
      setTimeout(() => promoStrip.remove(), 350);
    });
  }

  // ===== SMOOTH SCROLL =====
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#' || !href || href.length < 2) return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const offset = target.getBoundingClientRect().top + window.pageYOffset - 88;
        window.scrollTo({ top: offset, behavior: 'smooth' });
        closeMenu();
      }
    });
  });

  // ===== KEYBOARD ===== (ESC to close menus)
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeMenu();
      closeSettings();
    }
    // Ctrl/Cmd + K = search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      const navSearch = document.getElementById('navSearch');
      const searchInput = document.getElementById('searchInput');
      if (navSearch) navSearch.classList.add('active');
      searchInput?.focus();
    }
  });

  // ===== ACTIVE NAV LINK =====
  function updateActiveLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    const scrollPos = window.pageYOffset + 100;

    sections.forEach(section => {
      const top    = section.offsetTop;
      const height = section.offsetHeight;
      const id     = section.id;

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}` ||
              link.getAttribute('href') === `./${id}.html`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });

  // ===== WISHLIST TOGGLE =====
  document.addEventListener('click', function(e) {
    const btn = e.target.closest('.wishlist-toggle');
    if (!btn) return;

    btn.classList.toggle('active');
    const icon = btn.querySelector('i');
    if (btn.classList.contains('active')) {
      if (icon) { icon.classList.remove('far'); icon.classList.add('fas'); }
      window.showToast?.('Added to wishlist! ❤️', 'success');
    } else {
      if (icon) { icon.classList.remove('fas'); icon.classList.add('far'); }
      window.showToast?.('Removed from wishlist', 'warning');
    }
  });

  // ===== QUICK VIEW =====
  document.addEventListener('click', function(e) {
    const btn = e.target.closest('.quick-view-btn');
    if (!btn) return;
    e.preventDefault();

    const card = btn.closest('.product-card');
    const name = card?.querySelector('.product-name')?.textContent || 'Product';
    const img  = card?.querySelector('.product-image img')?.src || '';
    const price = card?.querySelector('.price-current')?.textContent || '';
    const marketplace = card?.querySelector('.product-marketplace')?.textContent?.trim() || '';

    const modal = document.getElementById('quickViewModal');
    if (modal) {
      modal.querySelector('#qv-name').textContent    = name;
      modal.querySelector('#qv-price').textContent   = price;
      modal.querySelector('#qv-source').textContent  = marketplace;
      const imgEl = modal.querySelector('#qv-img');
      if (imgEl) imgEl.src = img;

      const buyBtn = modal.querySelector('#qv-buy');
      const cardBuy = card?.querySelector('.btn-cart, .btn-cta');
      if (buyBtn && cardBuy) buyBtn.href = cardBuy.href || '#';

      modal.classList.add('active');
      document.body.classList.add('modal-open');
    } else {
      window.showToast?.(`👁️ ${name}`, 'info');
    }
  });

  // ===== MODAL CLOSE =====
  document.addEventListener('click', function(e) {
    if (e.target.matches('.modal-overlay') ||
        e.target.closest('.modal-close')) {
      document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
      document.body.classList.remove('modal-open');
    }
  });

  // ===== RIPPLE EFFECT ON BUTTONS =====
  document.addEventListener('click', function(e) {
    const btn = e.target.closest('.btn-ripple');
    if (!btn) return;

    const rect   = btn.getBoundingClientRect();
    const size   = Math.max(btn.offsetWidth, btn.offsetHeight);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top  - size / 2;

    const circle = document.createElement('span');
    circle.className = 'ripple-circle';
    circle.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px;`;
    btn.appendChild(circle);
    setTimeout(() => circle.remove(), 700);
  });

})();
