/* =============================================
   NAVBAR.JS — MOBILE MENU + SCROLL + UI
   ============================================= */

(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {

    const navbar      = document.getElementById('navbar');
    const menuToggle  = document.getElementById('menuToggle');
    const mobileMenu  = document.getElementById('mobileMenu');
    const overlay     = document.getElementById('mobileOverlay');
    const mobileClose = document.getElementById('mobileClose');

    // ── NAVBAR SCROLL ──
    let lastY = 0;
    window.addEventListener('scroll', () => {
      const y = window.pageYOffset;
      if (navbar) {
        navbar.classList.toggle('scrolled', y > 60);
        // Hide on scroll down, show on scroll up
        navbar.style.transform = (y > lastY && y > 200) ? 'translateY(-100%)' : 'translateY(0)';
        navbar.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease, height 0.3s ease, background 0.3s ease';
      }
      lastY = y;
    }, { passive: true });

    // ── MOBILE MENU ──
    function openMenu() {
      mobileMenu.classList.add('active');
      overlay.classList.add('active');
      menuToggle.classList.add('active');
      menuToggle.setAttribute('aria-expanded', 'true');
      document.body.classList.add('menu-open');
    }

    function closeMenu() {
      mobileMenu.classList.remove('active');
      overlay.classList.remove('active');
      menuToggle.classList.remove('active');
      menuToggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
    }

    if (menuToggle) menuToggle.addEventListener('click', () => mobileMenu.classList.contains('active') ? closeMenu() : openMenu());
    if (mobileClose) mobileClose.addEventListener('click', closeMenu);
    if (overlay)     overlay.addEventListener('click', closeMenu);

    // Close on nav link click
    document.querySelectorAll('.mobile-nav-links a').forEach(a => a.addEventListener('click', closeMenu));

    // Escape key
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        closeMenu();
        const searchResults = document.getElementById('searchResults');
        if (searchResults) searchResults.classList.remove('active');
      }
    });

    // ── SMOOTH SCROLL for anchor links ──
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const id = a.getAttribute('href');
        if (id === '#' || !id) return;
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });

    // ── WISHLIST ──
    document.querySelectorAll('.wishlist-toggle').forEach(btn => {
      btn.addEventListener('click', function() {
        this.classList.toggle('active');
        const icon = this.querySelector('i');
        if (this.classList.contains('active')) {
          icon.classList.replace('far', 'fas');
          window.showToast && showToast('Added to wishlist! ❤️', 'success');
        } else {
          icon.classList.replace('fas', 'far');
          window.showToast && showToast('Removed from wishlist', 'info');
        }
      });
    });

    // ── QUICK VIEW ──
    document.querySelectorAll('.quick-view-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        const card = btn.closest('.product-card');
        const name = card?.querySelector('.product-name')?.textContent || 'Product';
        window.showToast && showToast(`👁 Quick view: ${name}`, 'info');
      });
    });

    // ── KEYBOARD SHORTCUTS ──
    document.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const si = document.getElementById('searchInput');
        const ns = document.getElementById('navSearch');
        if (ns) ns.classList.add('mobile-open');
        if (si) si.focus();
      }
    });

  });

})();
