/* =============================================
   NAVBAR.JS — MOBILE MENU & SCROLL EFFECTS
   ============================================= */
'use strict';

(function() {
  const navbar       = document.getElementById('navbar');
  const menuToggle   = document.getElementById('menuToggle');
  const mobileMenu   = document.getElementById('mobileMenu');
  const mobileOverlay= document.getElementById('mobileOverlay');
  const mobileClose  = document.getElementById('mobileClose');

  /* ── SCROLL EFFECT ── */
  function handleScroll() {
    if (!navbar) return;
    navbar.classList.toggle('scrolled', window.scrollY > 60);

    // Update active nav link
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    const scrollPos = window.scrollY + navbar.offsetHeight + 20;

    sections.forEach(section => {
      if (scrollPos >= section.offsetTop && scrollPos < section.offsetTop + section.offsetHeight) {
        const id = section.id;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === '#' + id);
        });
      }
    });
  }

  /* ── MOBILE MENU ── */
  function open() {
    if (!mobileMenu) return;
    mobileMenu.classList.add('active');
    mobileOverlay && mobileOverlay.classList.add('active');
    menuToggle && menuToggle.classList.add('active');
    document.body.classList.add('menu-open');
    mobileMenu.querySelector('a, button')?.focus();
  }

  function close() {
    mobileMenu && mobileMenu.classList.remove('active');
    mobileOverlay && mobileOverlay.classList.remove('active');
    menuToggle && menuToggle.classList.remove('active');
    document.body.classList.remove('menu-open');
  }

  menuToggle   && menuToggle.addEventListener('click', () => mobileMenu?.classList.contains('active') ? close() : open());
  mobileClose  && mobileClose.addEventListener('click', close);
  mobileOverlay && mobileOverlay.addEventListener('click', close);

  // Close on nav link click
  document.querySelectorAll('.mobile-nav-links a').forEach(link => {
    link.addEventListener('click', close);
  });

  // Keyboard
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { close(); }
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      document.getElementById('searchInput')?.focus();
    }
    if (e.key === 't' && !e.ctrlKey && !e.metaKey &&
        e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      window.ThemeManager?.toggle();
    }
  });

  /* ── SMOOTH SCROLL ── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#' || !href) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const offset = target.offsetTop - (navbar?.offsetHeight || 70) - 10;
      window.scrollTo({ top: offset, behavior: 'smooth' });
    });
  });

  /* ── INIT ── */
  window.addEventListener('scroll', handleScroll, { passive: true });
  document.addEventListener('DOMContentLoaded', handleScroll);
})();
