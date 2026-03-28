/* ============================
   NAVBAR.JS — NAVBAR INTERACTIONS  v2.0
   Mobile menu · Scroll effect · Smooth scroll
   Active links · Search toggle · Lazy images · Parallax
   ============================ */

(function () {
  'use strict';

  var navbar        = document.getElementById('navbar');
  var menuToggle    = document.getElementById('menuToggle');
  var mobileMenu    = document.getElementById('mobileMenu');
  var mobileOverlay = document.getElementById('mobileOverlay');
  var mobileClose   = document.getElementById('mobileClose');
  var searchToggle  = document.getElementById('searchToggle');
  var navSearch     = document.getElementById('navSearch');

  /* ── Scroll effect ── */
  function handleScroll() {
    if (!navbar) return;
    navbar.classList.toggle('scrolled', window.pageYOffset > 50);
  }
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  /* ── Mobile menu ── */
  function openMenu() {
    if (mobileMenu)    mobileMenu.classList.add('active');
    if (mobileOverlay) mobileOverlay.classList.add('active');
    if (menuToggle)    menuToggle.classList.add('active');
    document.body.classList.add('menu-open');
    if (mobileClose) setTimeout(function () { mobileClose.focus(); }, 80);
  }

  function closeMenu() {
    if (mobileMenu)    mobileMenu.classList.remove('active');
    if (mobileOverlay) mobileOverlay.classList.remove('active');
    if (menuToggle)    menuToggle.classList.remove('active');
    document.body.classList.remove('menu-open');
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', function () {
      mobileMenu && mobileMenu.classList.contains('active') ? closeMenu() : openMenu();
    });
  }
  if (mobileClose)   mobileClose.addEventListener('click', closeMenu);
  if (mobileOverlay) mobileOverlay.addEventListener('click', closeMenu);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeMenu();
      if (navSearch) navSearch.classList.remove('active');
    }
  });

  document.querySelectorAll('.mobile-nav-links a').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  /* ── Mobile search toggle ── */
  if (searchToggle && navSearch) {
    searchToggle.addEventListener('click', function () {
      navSearch.classList.toggle('active');
      var inp = navSearch.querySelector('input');
      if (navSearch.classList.contains('active') && inp) {
        setTimeout(function () { inp.focus(); }, 80);
      }
    });
  }

  /* ── Smooth scroll ── */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var href = this.getAttribute('href');
      if (!href || href === '#') return;
      var target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      closeMenu();
      var offset = navbar ? navbar.offsetHeight : 72;
      window.scrollTo({ top: target.getBoundingClientRect().top + window.pageYOffset - offset, behavior: 'smooth' });
    });
  });

  /* ── Active nav link ── */
  function updateActiveLink() {
    var sections = document.querySelectorAll('section[id]');
    var navLinks = document.querySelectorAll('.nav-link');
    if (!sections.length || !navLinks.length) return;
    var pos = window.pageYOffset + 120;
    sections.forEach(function (section) {
      var id  = '#' + section.getAttribute('id');
      var top = section.offsetTop;
      if (pos >= top && pos < top + section.offsetHeight) {
        navLinks.forEach(function (link) {
          link.classList.toggle('active', link.getAttribute('href') === id);
        });
      }
    });
  }
  window.addEventListener('scroll', updateActiveLink, { passive: true });

  /* ── Disclosure close (early fallback; affiliate.js owns with _discBound) ── */
  (function () {
    if (window._discBound) return;
    var btn  = document.getElementById('disclosureClose');
    var disc = document.getElementById('affiliateDisclosure');
    if (!btn || !disc) return;
    window._discBound = true;
    btn.addEventListener('click', function () {
      disc.style.transition  = 'opacity 0.3s ease, transform 0.3s ease';
      disc.style.opacity     = '0';
      disc.style.transform   = 'translateY(-10px)';
      setTimeout(function () { disc.style.display = 'none'; }, 320);
      try { sessionStorage.setItem('meowmeow-disclosure-closed', '1'); } catch (e) {}
    });
  })();

  /* ── Wishlist toggle (static cards; _meowBound guard) ── */
  document.querySelectorAll('.wishlist-toggle').forEach(function (btn) {
    if (btn._meowBound || btn.dataset.nbBound) return;
    btn.dataset.nbBound = '1';
    btn._meowBound = true;
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      this.classList.toggle('active');
      var icon = this.querySelector('i');
      if (!icon) return;
      if (this.classList.contains('active')) {
        icon.classList.replace('far', 'fas');
        if (window.showToast) window.showToast('Added to wishlist ❤️', 'success');
      } else {
        icon.classList.replace('fas', 'far');
        if (window.showToast) window.showToast('Removed from wishlist', 'warning');
      }
    });
  });

  /* ── Lazy load data-src images ── */
  if ('IntersectionObserver' in window) {
    var imgIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var img = entry.target;
        if (img.dataset.src) { img.src = img.dataset.src; img.removeAttribute('data-src'); img.classList.add('loaded'); }
        imgIO.unobserve(img);
      });
    }, { rootMargin: '200px' });
    document.querySelectorAll('img[data-src]').forEach(function (img) { imgIO.observe(img); });
  }

  /* ── Hero parallax shapes ── */
  var hero   = document.querySelector('.hero');
  var shapes = document.querySelectorAll('.shape');
  if (hero && shapes.length && window.innerWidth >= 1024) {
    var ticking = false;
    window.addEventListener('mousemove', function (e) {
      if (ticking || window.innerWidth < 1024) return;
      ticking = true;
      requestAnimationFrame(function () {
        var mx = (e.clientX / window.innerWidth  - 0.5) * 2;
        var my = (e.clientY / window.innerHeight - 0.5) * 2;
        shapes.forEach(function (s, i) {
          var sp = (i + 1) * 5;
          s.style.transform = 'translate(' + (mx * sp) + 'px,' + (my * sp) + 'px)';
        });
        ticking = false;
      });
    }, { passive: true });
  }

  /* ── Keyboard shortcuts ── */
  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      if (navSearch) navSearch.classList.add('active');
      var inp = document.getElementById('searchInput');
      if (inp) inp.focus();
    }
    if (e.key === 't' && !e.ctrlKey && !e.metaKey &&
        e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      if (window.MeowTheme) window.MeowTheme.toggle();
    }
  });

})();
