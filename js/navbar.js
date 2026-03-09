/* ============================
   NAVBAR.JS
   ============================ */

(function() {
  'use strict';

  const navbar = document.getElementById('navbar');
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileOverlay = document.getElementById('mobileOverlay');
  const mobileClose = document.getElementById('mobileClose');

  // ===== SCROLL EFFECT =====
  function onScroll() {
    if (!navbar) return;
    if (window.pageYOffset > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ===== MOBILE MENU =====
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

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeMenu();
      closeMobileSearch();
    }
  });

  // Close on nav link click
  document.querySelectorAll('.mobile-nav-links a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // ===== MOBILE SEARCH =====
  const mobileSearchToggle = document.getElementById('mobileSearchToggle');
  const mobileSearchBar = document.getElementById('mobileSearchBar');

  function closeMobileSearch() {
    mobileSearchBar?.classList.remove('active');
  }

  mobileSearchToggle?.addEventListener('click', () => {
    mobileSearchBar?.classList.toggle('active');
    if (mobileSearchBar?.classList.contains('active')) {
      mobileSearchBar.querySelector('input')?.focus();
    }
  });

  // ===== CART DROPDOWN =====
  const cartBtn = document.getElementById('cartNavBtn');
  const cartDropdown = document.getElementById('cartDropdown');
  let cartDropdownOpen = false;

  function openCartDropdown() {
    cartDropdown?.classList.add('active');
    cartDropdownOpen = true;
  }

  function closeCartDropdown() {
    cartDropdown?.classList.remove('active');
    cartDropdownOpen = false;
  }

  cartBtn?.addEventListener('click', e => {
    e.stopPropagation();
    cartDropdownOpen ? closeCartDropdown() : openCartDropdown();
  });

  document.addEventListener('click', e => {
    if (cartDropdownOpen && !cartDropdown?.contains(e.target) && !cartBtn?.contains(e.target)) {
      closeCartDropdown();
    }
  });

  // ===== SMOOTH SCROLL =====
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#' || !href || href.length < 2) return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const offset = target.offsetTop - (navbar ? navbar.offsetHeight : 72) - 10;
        window.scrollTo({ top: offset, behavior: 'smooth' });
        closeMenu();
      }
    });
  });

  // ===== KEYBOARD SHORTCUTS =====
  document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd+K = search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      const searchInput = document.getElementById('searchInput');
      if (searchInput) {
        document.getElementById('navSearch')?.classList.add('active');
        searchInput.focus();
      }
    }

    // T = toggle theme (not in inputs)
    if (e.key === 't' && !e.ctrlKey && !e.metaKey && !['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)) {
      window.ThemeManager?.toggle();
    }
  });

  // ===== WISHLIST BTN =====
  document.getElementById('wishlistNavBtn')?.addEventListener('click', () => {
    showToast('Your wishlist — coming soon!', 'info', '❤️');
  });

})();
