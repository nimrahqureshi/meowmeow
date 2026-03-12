/* ============================
   NAVBAR.JS — NAVBAR INTERACTIONS
   ============================ */

(function() {
  'use strict';

  /* ===== DOM ELEMENTS ===== */
  var navbar       = document.getElementById('navbar');
  var menuToggle   = document.getElementById('menuToggle');
  var mobileMenu   = document.getElementById('mobileMenu');
  var mobileOverlay = document.getElementById('mobileOverlay');
  var mobileClose  = document.getElementById('mobileClose');
  var disclosureClose = document.getElementById('disclosureClose');
  var disclosure   = document.getElementById('affiliateDisclosure');

  /* ===== SCROLL EFFECT ===== */
  function handleScroll() {
    if (!navbar) return;
    if (window.pageYOffset > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // Run immediately

  /* ===== MOBILE MENU ===== */
  function openMobileMenu() {
    if (mobileMenu)    mobileMenu.classList.add('active');
    if (mobileOverlay) mobileOverlay.classList.add('active');
    if (menuToggle)    menuToggle.classList.add('active');
    document.body.classList.add('menu-open');
    // Set focus on close button for accessibility
    if (mobileClose) setTimeout(function() { mobileClose.focus(); }, 100);
  }

  function closeMobileMenu() {
    if (mobileMenu)    mobileMenu.classList.remove('active');
    if (mobileOverlay) mobileOverlay.classList.remove('active');
    if (menuToggle)    menuToggle.classList.remove('active');
    document.body.classList.remove('menu-open');
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', function() {
      if (mobileMenu && mobileMenu.classList.contains('active')) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });
  }

  if (mobileClose)   mobileClose.addEventListener('click', closeMobileMenu);
  if (mobileOverlay) mobileOverlay.addEventListener('click', closeMobileMenu);

  // Close on Escape
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeMobileMenu();
      var navSearch = document.getElementById('navSearch');
      if (navSearch) navSearch.classList.remove('active');
    }
  });

  // Close on nav link click (mobile)
  document.querySelectorAll('.mobile-nav-links a').forEach(function(link) {
    link.addEventListener('click', closeMobileMenu);
  });

  /* ===== SMOOTH SCROLL ===== */
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
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

  /* ===== ACTIVE NAV LINK ON SCROLL ===== */
  function updateActiveNavLink() {
    var sections = document.querySelectorAll('section[id]');
    var navLinks = document.querySelectorAll('.nav-link');
    if (!sections.length || !navLinks.length) return;

    var scrollPos = window.pageYOffset + 100;

    sections.forEach(function(section) {
      var top = section.offsetTop;
      var height = section.offsetHeight;
      var id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(function(link) {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + id) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', updateActiveNavLink, { passive: true });

  /* ===== DISCLOSURE CLOSE ===== */
  if (disclosureClose && disclosure) {
    disclosureClose.addEventListener('click', function() {
      disclosure.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      disclosure.style.opacity = '0';
      disclosure.style.transform = 'translateY(-10px)';
      setTimeout(function() {
        if (disclosure.parentNode) disclosure.remove();
      }, 320);
    });
  }

  /* ===== WISHLIST TOGGLE ===== */
  document.querySelectorAll('.wishlist-toggle').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      this.classList.toggle('active');
      var icon = this.querySelector('i');
      if (!icon) return;
      if (this.classList.contains('active')) {
        icon.classList.remove('far');
        icon.classList.add('fas');
        if (window.showToast) showToast('Added to wishlist! ❤️', 'success');
      } else {
        icon.classList.remove('fas');
        icon.classList.add('far');
        if (window.showToast) showToast('Removed from wishlist', 'warning');
      }
    });
  });

  /* ===== CART & WISHLIST BUTTONS ===== */
  var cartBtn = document.getElementById('cartBtn');
  if (cartBtn) {
    cartBtn.addEventListener('click', function() {
      // If cart page exists, navigate there
      if (document.querySelector('[href="cart.html"]')) {
        window.location.href = 'cart.html';
      } else if (window.showToast) {
        showToast('🛒 Opening cart...', 'info');
      }
    });
  }

  var wishlistBtn = document.getElementById('wishlistBtn');
  if (wishlistBtn) {
    wishlistBtn.addEventListener('click', function() {
      if (window.showToast) showToast('❤️ Wishlist coming soon!', 'info');
    });
  }

  /* ===== LAZY LOADING IMAGES ===== */
  if ('IntersectionObserver' in window) {
    var imageObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          img.classList.add('loaded');
          imageObserver.unobserve(img);
        }
      });
    }, { rootMargin: '200px 0px' });

    document.querySelectorAll('img[data-src]').forEach(function(img) {
      imageObserver.observe(img);
    });
  }

  /* ===== SMOOTH IMAGE LOAD ===== */
  document.querySelectorAll('img:not([data-src])').forEach(function(img) {
    if (!img.complete) {
      img.style.opacity = '0';
      img.style.transition = 'opacity 0.4s ease';
      img.addEventListener('load', function() {
        img.style.opacity = '1';
      });
      img.addEventListener('error', function() {
        img.style.opacity = '0.5';
      });
    }
  });

  /* ===== PARALLAX HERO SHAPES ===== */
  var heroSection = document.querySelector('.hero');
  if (heroSection && window.innerWidth >= 1024) {
    var shapes = document.querySelectorAll('.shape');
    var ticking = false;

    window.addEventListener('mousemove', function(e) {
      if (ticking || window.innerWidth < 768) return;
      ticking = true;

      requestAnimationFrame(function() {
        var mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        var mouseY = (e.clientY / window.innerHeight - 0.5) * 2;

        shapes.forEach(function(shape, i) {
          var speed = (i + 1) * 5;
          shape.style.transform = 'translate(' + (mouseX * speed) + 'px, ' + (mouseY * speed) + 'px)';
        });
        ticking = false;
      });
    });
  }

  /* ===== KEYBOARD SHORTCUTS ===== */
  document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + K = Focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      var navSearch = document.getElementById('navSearch');
      var searchInput = document.getElementById('searchInput');
      if (navSearch) navSearch.classList.add('active');
      if (searchInput) searchInput.focus();
    }

    // T = Toggle theme (when not in input)
    if (e.key === 't' && !e.ctrlKey && !e.metaKey &&
        e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'SELECT') {
      if (window.MeowTheme) window.MeowTheme.toggle();
    }
  });

  /* ===== SEARCH TOGGLE (mobile) ===== */
  var searchToggle = document.getElementById('searchToggle');
  var navSearch = document.getElementById('navSearch');
  if (searchToggle && navSearch) {
    searchToggle.addEventListener('click', function() {
      navSearch.classList.toggle('active');
      var input = navSearch.querySelector('input');
      if (navSearch.classList.contains('active') && input) {
        setTimeout(function() { input.focus(); }, 100);
      }
    });
  }

})();
