/* ============================
   NAVBAR.JS — SCROLL + MOBILE MENU + ACTIVE LINKS
   ============================ */

(function () {
  'use strict';

  const navbar   = document.getElementById('navbar');
  const toggle   = document.getElementById('menuToggle');
  const menu     = document.getElementById('mobileMenu');
  const overlay  = document.getElementById('mobileOverlay');
  const closeBtn = document.getElementById('mobileClose');

  /* ── Transparent → Solid on scroll ─────────────── */
  function handleScroll() {
    if (!navbar) return;
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // run on load

  /* ── Mobile menu open ───────────────────────────── */
  function openMenu() {
    if (!menu || !overlay) return;
    menu.classList.add('active');
    overlay.classList.add('active');
    if (toggle) toggle.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  /* ── Mobile menu close ──────────────────────────── */
  function closeMenu() {
    if (!menu || !overlay) return;
    menu.classList.remove('active');
    overlay.classList.remove('active');
    if (toggle) toggle.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (toggle)   toggle.addEventListener('click', openMenu);
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);
  if (overlay)  overlay.addEventListener('click', closeMenu);

  /* ── Keyboard: Escape closes menu ──────────────── */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });

  /* ── Close mobile menu when a mobile nav link is clicked ── */
  document.querySelectorAll('.mobile-nav-links a').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  /* ── Active nav link (highlight current page) ─── */
  var currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link, .mobile-nav-links a').forEach(function (link) {
    var href = link.getAttribute('href');
    if (href && (href === currentPage || href === './' + currentPage)) {
      link.classList.add('active');
    }
  });

})();
