/* ================================================================
   NAVBAR.JS — MOBILE MENU, SCROLL EFFECTS, PROMO BAR
   ShopLux v3.0
   ================================================================ */

(function () {
  'use strict';

  /* ── ELEMENT REFS ─────────────────────────────────────────── */
  const navbar        = document.getElementById('navbar');
  const menuToggle    = document.getElementById('menuToggle');
  const mobileMenu    = document.getElementById('mobileMenu');
  const mobileOverlay = document.getElementById('mobileOverlay');
  const mobileClose   = document.getElementById('mobileClose');
  const promoBar      = document.getElementById('promoBar');
  const promoClose    = document.getElementById('promoClose');
  const disclosureClose = document.getElementById('disclosureClose');

  /* ── SCROLL STATE ─────────────────────────────────────────── */
  let lastScrollY = 0;
  let rafPending  = false;
  let menuIsOpen  = false;

  function onScroll() {
    if (!navbar) { rafPending = false; return; }
    const y = window.scrollY || window.pageYOffset;

    /* scrolled class → glass effect + shadow */
    navbar.classList.toggle('scrolled', y > 60);

    /* hide/show on direction (only if menu not open) */
    if (!menuIsOpen) {
      if (y > lastScrollY && y > 240) {
        navbar.setAttribute('data-hidden', '');
      } else {
        navbar.removeAttribute('data-hidden');
      }
    }

    lastScrollY = Math.max(0, y);
    rafPending  = false;
  }

  window.addEventListener('scroll', () => {
    if (!rafPending) {
      rafPending = true;
      requestAnimationFrame(onScroll);
    }
  }, { passive: true });

  onScroll(); /* run immediately */

  /* ── MOBILE MENU ──────────────────────────────────────────── */
  function openMenu() {
    menuIsOpen = true;
    mobileMenu?.classList.add('active');
    mobileOverlay?.classList.add('active');
    menuToggle?.classList.add('active');
    menuToggle?.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
    navbar?.removeAttribute('data-hidden'); // always show navbar when menu open
    /* Focus first link for accessibility */
    setTimeout(() => {
      const firstLink = mobileMenu?.querySelector('a, button');
      firstLink?.focus();
    }, 80);
  }

  function closeMenu() {
    menuIsOpen = false;
    mobileMenu?.classList.remove('active');
    mobileOverlay?.classList.remove('active');
    menuToggle?.classList.remove('active');
    menuToggle?.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
    menuToggle?.focus();
  }

  menuToggle?.addEventListener('click', () =>
    menuIsOpen ? closeMenu() : openMenu()
  );
  mobileClose?.addEventListener('click', closeMenu);
  mobileOverlay?.addEventListener('click', closeMenu);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (menuIsOpen) closeMenu();
    }
  });

  /* Close mobile menu on nav-link click */
  document.querySelectorAll(
    '.mobile-nav-links a, .mobile-nav-link, [data-mobile-nav-link]'
  ).forEach(a => a.addEventListener('click', closeMenu));

  /* ── SMOOTH SCROLL ────────────────────────────────────────── */
  document.addEventListener('click', function (e) {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href || href.length < 2) return;

    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();
    closeMenu();

    const navH = navbar ? navbar.offsetHeight : 72;
    const top  = target.getBoundingClientRect().top + window.scrollY - navH - 16;
    window.scrollTo({ top, behavior: 'smooth' });

    /* update URL without reload */
    history.replaceState(null, '', href);
  });

  /* ── ACTIVE NAV LINK ──────────────────────────────────────── */
  const NAV_LINKS = document.querySelectorAll('.nav-link, .mobile-nav-links a');

  const updateActive = typeof ShopLux !== 'undefined' && ShopLux.Utils
    ? ShopLux.Utils.throttle(_updateActive, 120)
    : _updateActive;

  function _updateActive() {
    const scrollPos = window.scrollY + (navbar?.offsetHeight || 72) + 24;
    let activeId    = null;

    document.querySelectorAll('section[id]').forEach(sec => {
      if (sec.offsetTop <= scrollPos) activeId = sec.id;
    });

    NAV_LINKS.forEach(link => {
      const isActive = link.getAttribute('href') === '#' + activeId;
      link.classList.toggle('active', isActive);
      link.setAttribute('aria-current', isActive ? 'page' : 'false');
    });
  }

  window.addEventListener('scroll', updateActive, { passive: true });

  /* ── PROMO BAR ────────────────────────────────────────────── */
  if (promoBar) {
    const dismissed = sessionStorage.getItem('shoplux_promo_v3');
    if (dismissed) {
      promoBar.remove();
      document.body.classList.remove('has-promo');
    }
  }

  promoClose?.addEventListener('click', () => {
    if (!promoBar) return;
    promoBar.style.maxHeight  = promoBar.offsetHeight + 'px';
    promoBar.style.overflow   = 'hidden';
    promoBar.style.transition = 'max-height .3s ease, opacity .3s ease, padding .3s ease';
    requestAnimationFrame(() => {
      promoBar.style.maxHeight = '0';
      promoBar.style.opacity   = '0';
      promoBar.style.padding   = '0';
    });
    setTimeout(() => {
      promoBar.remove();
      document.body.classList.remove('has-promo');
    }, 320);
    sessionStorage.setItem('shoplux_promo_v3', '1');
  });

  /* ── AFFILIATE DISCLOSURE ─────────────────────────────────── */
  const disclosure = document.getElementById('affiliateDisclosure');
  disclosureClose?.addEventListener('click', () => {
    if (!disclosure) return;
    disclosure.style.transition = 'opacity .3s ease, max-height .3s ease';
    disclosure.style.opacity    = '0';
    disclosure.style.maxHeight  = '0';
    disclosure.style.overflow   = 'hidden';
    setTimeout(() => disclosure.remove(), 320);
  });

  /* ── LAZY IMAGES ──────────────────────────────────────────── */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(({ isIntersecting, target: img }) => {
        if (!isIntersecting) return;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        img.classList.add('loaded');
        io.unobserve(img);
      });
    }, { rootMargin: '300px 0px' });

    document.querySelectorAll('img[data-src]').forEach(img => io.observe(img));
  }

  /* ── SMOOTH IMAGE FADE-IN ─────────────────────────────────── */
  document.querySelectorAll('img:not([data-src])').forEach(img => {
    if (img.complete && img.naturalHeight > 0) return;
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.4s ease';
    img.addEventListener('load',  () => { img.style.opacity = '1'; }, { once: true });
    img.addEventListener('error', () => { img.style.opacity = '0.5'; }, { once: true });
  });

  /* ── KEYBOARD SHORTCUT Ctrl/⌘+K → search ─────────────────── */
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      const navSearch = document.getElementById('navSearch');
      const input     = document.getElementById('searchInput');
      navSearch?.classList.add('active');
      input?.focus();
    }
  });

  /* ── FORMS ────────────────────────────────────────────────── */
  const newsletterForm = document.getElementById('newsletterForm');
  newsletterForm?.addEventListener('submit', function (e) {
    e.preventDefault();
    const email = this.querySelector('input[type="email"]')?.value.trim();
    if (!email) {
      ShopLux?.toast('Please enter your email address.', 'warning');
      return;
    }
    ShopLux?.toast('🎉 You\'re subscribed! Check your email for a welcome gift.', 'success', 'Welcome!');
    this.reset();
    /* Store subscription locally */
    try { localStorage.setItem('shoplux_subscribed', '1'); } catch {}
  });

  const contactForm = document.getElementById('contactForm');
  contactForm?.addEventListener('submit', function (e) {
    e.preventDefault();
    ShopLux?.toast('Message sent! We\'ll reply within 24 hours.', 'success', 'Got it!');
    this.reset();
  });

  /* ── WISHLIST TOGGLE (delegated) ──────────────────────────── */
  document.addEventListener('click', function (e) {
    const btn = e.target.closest('.wishlist-toggle[data-id]');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    if (window.ShopLux?.Wishlist) {
      ShopLux.Wishlist.toggle(btn.dataset.id, btn.dataset.name || '');
    }
  });

  /* ── CART BTN in navbar ───────────────────────────────────── */
  const cartBtn = document.getElementById('cartBtn');
  cartBtn?.addEventListener('click', () => {
    /* open cart sidebar, or navigate to cart page */
    const cartSidebar = document.getElementById('cartSidebar');
    if (cartSidebar) {
      cartSidebar.classList.toggle('active');
      document.getElementById('cartOverlay')?.classList.toggle('active');
    } else if (window.location.pathname !== '/cart.html') {
      ShopLux?.toast(
        `You have <strong>${ShopLux.Cart.getCount()}</strong> item(s) in your cart.`,
        'cart', 'Your Cart'
      );
    }
  });

})();
