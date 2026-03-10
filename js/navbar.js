/* ============================
   NAVBAR.JS
   ============================ */
(function() {
  'use strict';
  var navbar = document.getElementById('navbar');
  var menuToggle = document.getElementById('menuToggle');
  var mobileMenu = document.getElementById('mobileMenu');
  var mobileOverlay = document.getElementById('mobileOverlay');
  var mobileClose = document.getElementById('mobileClose');

  function handleScroll() {
    if (!navbar) return;
    navbar.classList.toggle('scrolled', window.pageYOffset > 50);
  }
  function openMobileMenu() {
    if (mobileMenu) mobileMenu.classList.add('active');
    if (mobileOverlay) mobileOverlay.classList.add('active');
    if (menuToggle) menuToggle.classList.add('active');
    document.body.classList.add('menu-open');
  }
  function closeMobileMenu() {
    if (mobileMenu) mobileMenu.classList.remove('active');
    if (mobileOverlay) mobileOverlay.classList.remove('active');
    if (menuToggle) menuToggle.classList.remove('active');
    document.body.classList.remove('menu-open');
  }
  if (menuToggle) menuToggle.addEventListener('click', function() {
    mobileMenu && mobileMenu.classList.contains('active') ? closeMobileMenu() : openMobileMenu();
  });
  if (mobileClose) mobileClose.addEventListener('click', closeMobileMenu);
  if (mobileOverlay) mobileOverlay.addEventListener('click', closeMobileMenu);
  document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeMobileMenu(); });
  document.querySelectorAll('.mobile-nav-links a').forEach(function(link) {
    link.addEventListener('click', closeMobileMenu);
  });
  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      var href = this.getAttribute('href');
      if (href === '#' || !href) return;
      var target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        window.scrollTo({ top: target.offsetTop - 72, behavior: 'smooth' });
      }
    });
  });
  // Newsletter
  var newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
      e.preventDefault();
      if (typeof showToast === 'function') showToast('🎉 Subscribed! Check your email.', 'success');
      this.reset();
    });
  }
  window.addEventListener('scroll', handleScroll);
  document.addEventListener('DOMContentLoaded', handleScroll);
})();
