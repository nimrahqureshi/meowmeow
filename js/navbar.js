/* ============================
   NAVBAR.JS — NAVBAR INTERACTIONS  (FIXED v2)
   ============================ */

(function () {
  'use strict';

  var navbar        = document.getElementById('navbar');
  var menuToggle    = document.getElementById('menuToggle');
  var mobileMenu    = document.getElementById('mobileMenu');
  var mobileOverlay = document.getElementById('mobileOverlay');
  var mobileClose   = document.getElementById('mobileClose');

  /* ─── SCROLL EFFECT ─── */
  function handleScroll() {
    if (!navbar) return;
    navbar.classList.toggle('scrolled', window.pageYOffset > 50);
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  /* ─── MOBILE MENU ─── */
  function openMobileMenu() {
    if (mobileMenu)    mobileMenu.classList.add('active');
    if (mobileOverlay) mobileOverlay.classList.add('active');
    if (menuToggle)    menuToggle.classList.add('active');
    document.body.classList.add('menu-open');
    if (mobileClose) setTimeout(function () { mobileClose.focus(); }, 100);
  }

  function closeMobileMenu() {
    if (mobileMenu)    mobileMenu.classList.remove('active');
    if (mobileOverlay) mobileOverlay.classList.remove('active');
    if (menuToggle)    menuToggle.classList.remove('active');
    document.body.classList.remove('menu-open');
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', function () {
      if (mobileMenu && mobileMenu.classList.contains('active')) closeMobileMenu();
      else openMobileMenu();
    });
  }

  if (mobileClose)   mobileClose.addEventListener('click', closeMobileMenu);
  if (mobileOverlay) mobileOverlay.addEventListener('click', closeMobileMenu);

  /* Close on Escape */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeMobileMenu();
      var navSearch = document.getElementById('navSearch');
      if (navSearch) navSearch.classList.remove('active');
    }

    /* T = toggle theme (when not focused on an input) */
    if (e.key === 't' && !e.ctrlKey && !e.metaKey &&
        e.target.tagName !== 'INPUT' &&
        e.target.tagName !== 'TEXTAREA' &&
        e.target.tagName !== 'SELECT') {
      if (window.MeowTheme) window.MeowTheme.toggle();
    }

    /* Ctrl/Cmd + K = focus search */
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      var navSearch2 = document.getElementById('navSearch');
      var searchInput = document.getElementById('searchInput');
      if (navSearch2) navSearch2.classList.add('active');
      if (searchInput) searchInput.focus();
    }
  });

  /* Close on mobile nav-link click */
  document.querySelectorAll('.mobile-nav-links a').forEach(function (link) {
    link.addEventListener('click', closeMobileMenu);
  });

  /* ─── SMOOTH SCROLL for anchor links ─── */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var href = this.getAttribute('href');
      if (!href || href === '#') return;
      var target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        closeMobileMenu();
        var offset = navbar ? navbar.offsetHeight : 72;
        var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });

  /* ─── ACTIVE NAV LINK ON SCROLL ─── */
  function updateActiveNavLink() {
    var sections = document.querySelectorAll('section[id]');
    var navLinks = document.querySelectorAll('.nav-link');
    if (!sections.length || !navLinks.length) return;

    var scrollPos = window.pageYOffset + 100;

    sections.forEach(function (section) {
      var top    = section.offsetTop;
      var height = section.offsetHeight;
      var id     = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(function (link) {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + id) link.classList.add('active');
        });
      }
    });
  }

  window.addEventListener('scroll', updateActiveNavLink, { passive: true });

  /* ─── SEARCH TOGGLE (mobile) ─── */
  var searchToggle = document.getElementById('searchToggle');
  var navSearch    = document.getElementById('navSearch');
  if (searchToggle && navSearch) {
    searchToggle.addEventListener('click', function () {
      navSearch.classList.toggle('active');
      var input = navSearch.querySelector('input');
      if (navSearch.classList.contains('active') && input) {
        setTimeout(function () { input.focus(); }, 100);
      }
    });
  }

  /* ─── CART BUTTON ─── */
  var cartBtn = document.getElementById('cartBtn');
  if (cartBtn) {
    cartBtn.addEventListener('click', function () {
      window.location.href = 'cart.html';
    });
  }

  /* ─── WISHLIST BUTTON ─── */
  var wishlistBtn = document.getElementById('wishlistBtn');
  if (wishlistBtn) {
    wishlistBtn.addEventListener('click', function () {
      if (window.showToast) showToast('❤️ Wishlist coming soon!', 'info');
    });
  }

  /* ─── WISHLIST TOGGLE (static cards) ─── */
  document.querySelectorAll('.wishlist-toggle').forEach(function (btn) {
    if (btn._meowBound) return;
    btn._meowBound = true;

    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      this.classList.toggle('active');
      var icon = this.querySelector('i');
      if (!icon) return;
      if (this.classList.contains('active')) {
        icon.classList.replace('far', 'fas');
        if (window.showToast) showToast('Added to wishlist! ❤️', 'success');
      } else {
        icon.classList.replace('fas', 'far');
        if (window.showToast) showToast('Removed from wishlist', 'warning');
      }
    });
  });

  /* ─── PARALLAX HERO SHAPES ─── */
  var heroSection = document.querySelector('.hero');
  if (heroSection && window.innerWidth >= 1024) {
    var shapes  = document.querySelectorAll('.shape');
    var ticking = false;

    window.addEventListener('mousemove', function (e) {
      if (ticking || window.innerWidth < 768) return;
      ticking = true;
      requestAnimationFrame(function () {
        var mx = (e.clientX / window.innerWidth  - 0.5) * 2;
        var my = (e.clientY / window.innerHeight - 0.5) * 2;
        shapes.forEach(function (shape, i) {
          var speed = (i + 1) * 5;
          shape.style.transform = 'translate(' + (mx * speed) + 'px, ' + (my * speed) + 'px)';
        });
        ticking = false;
      });
    });
  }

  /* ─── LAZY LOADING ─── */
  if ('IntersectionObserver' in window) {
    var imgObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          img.classList.add('loaded');
        }
        imgObserver.unobserve(img);
      });
    }, { rootMargin: '200px 0px' });

    document.querySelectorAll('img[data-src]').forEach(function (img) {
      imgObserver.observe(img);
    });
  }

})();
