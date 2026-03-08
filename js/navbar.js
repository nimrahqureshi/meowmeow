/* ============================================================
   NAVBAR.JS — NAVBAR, MOBILE MENU, SMOOTH SCROLL
   MeowMeow Affiliate Site — Production v2.0
   ============================================================ */

(function() {
  'use strict';

  // ===== ELEMENTS =====
  var navbar      = document.getElementById('navbar');
  var menuToggle  = document.getElementById('menuToggle');
  var mobileMenu  = document.getElementById('mobileMenu');
  var mobileOverlay = document.getElementById('mobileOverlay');
  var mobileClose = document.getElementById('mobileClose');

  // ===== SCROLL EFFECT =====
  function handleNavbarScroll() {
    if (!navbar) return;
    if (window.pageYOffset > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleNavbarScroll, { passive: true });
  handleNavbarScroll(); // Run on init

  // ===== MOBILE MENU =====
  function openMobileMenu() {
    if (mobileMenu) mobileMenu.classList.add('active');
    if (mobileOverlay) mobileOverlay.classList.add('active');
    if (menuToggle) menuToggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
    document.body.style.overflow = 'hidden';
    // Focus first focusable element for a11y
    var firstLink = mobileMenu && mobileMenu.querySelector('a, button');
    if (firstLink) setTimeout(function() { firstLink.focus(); }, 100);
  }

  function closeMobileMenu() {
    if (mobileMenu) mobileMenu.classList.remove('active');
    if (mobileOverlay) mobileOverlay.classList.remove('active');
    if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
    document.body.style.overflow = '';
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', function() {
      var isOpen = mobileMenu && mobileMenu.classList.contains('active');
      isOpen ? closeMobileMenu() : openMobileMenu();
    });
  }
  if (mobileClose) mobileClose.addEventListener('click', closeMobileMenu);
  if (mobileOverlay) mobileOverlay.addEventListener('click', closeMobileMenu);

  // Close on ESC
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeMobileMenu();
  });

  // Close when a mobile nav link is clicked
  document.querySelectorAll('.mobile-nav-links a, .mobile-nav-link').forEach(function(link) {
    link.addEventListener('click', closeMobileMenu);
  });

  // ===== SMOOTH SCROLL =====
  document.addEventListener('click', function(e) {
    var anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;
    var href = anchor.getAttribute('href');
    if (!href || href === '#') return;
    var target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    var navH = navbar ? navbar.offsetHeight : 70;
    var top = target.getBoundingClientRect().top + window.pageYOffset - navH - 16;
    window.scrollTo({ top: top, behavior: 'smooth' });
    closeMobileMenu();
  });

  // ===== ACTIVE NAV LINK ON SCROLL =====
  function updateActiveNavLink() {
    var sections = document.querySelectorAll('section[id], div[id]');
    var navLinks = document.querySelectorAll('.nav-link, .mobile-nav-links a');
    var scrollPos = window.pageYOffset + 120;

    sections.forEach(function(section) {
      var top = section.offsetTop;
      var bottom = top + section.offsetHeight;
      if (scrollPos >= top && scrollPos < bottom) {
        var id = section.getAttribute('id');
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

  // ===== SMOOTH IMAGE LOAD =====
  document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('img:not([data-src])').forEach(function(img) {
      img.style.opacity = '0';
      img.style.transition = 'opacity 0.4s ease';
      if (img.complete && img.naturalWidth > 0) {
        img.style.opacity = '1';
      } else {
        img.addEventListener('load', function() { img.style.opacity = '1'; });
        img.addEventListener('error', function() { img.style.opacity = '1'; });
      }
    });
  });

  // ===== AFFILIATE DISCLOSURE CLOSE =====
  document.addEventListener('DOMContentLoaded', function() {
    var disclosureClose = document.getElementById('disclosureClose');
    var disclosure = document.getElementById('affiliateDisclosure');
    if (disclosureClose && disclosure) {
      disclosureClose.addEventListener('click', function() {
        disclosure.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        disclosure.style.opacity = '0';
        disclosure.style.transform = 'translateY(-10px)';
        setTimeout(function() {
          disclosure.style.display = 'none';
          localStorage.setItem('meowmeow-disclosure-closed', '1');
        }, 300);
      });
      // Keep hidden if previously closed
      if (localStorage.getItem('meowmeow-disclosure-closed') === '1') {
        disclosure.style.display = 'none';
      }
    }
  });

  // ===== COOKIE BANNER =====
  document.addEventListener('DOMContentLoaded', function() {
    var banner = document.getElementById('cookieBanner');
    var acceptBtn = document.getElementById('cookieAccept');
    var declineBtn = document.getElementById('cookieDecline');

    if (banner) {
      var cookieConsent = localStorage.getItem('meowmeow-cookie-consent');
      if (!cookieConsent) {
        setTimeout(function() { banner.classList.add('active'); }, 1200);
      }
    }
    if (acceptBtn) {
      acceptBtn.addEventListener('click', function() {
        localStorage.setItem('meowmeow-cookie-consent', 'accepted');
        if (banner) { banner.classList.remove('active'); }
        window.showToast && window.showToast('🍪 Preferences saved!', 'success');
      });
    }
    if (declineBtn) {
      declineBtn.addEventListener('click', function() {
        localStorage.setItem('meowmeow-cookie-consent', 'declined');
        if (banner) { banner.classList.remove('active'); }
      });
    }
  });

  // ===== ANNOUNCEMENT BAR CLOSE =====
  document.addEventListener('DOMContentLoaded', function() {
    var annClose = document.getElementById('announcementClose');
    var annBar = document.getElementById('announcementBar');
    if (annClose && annBar) {
      if (sessionStorage.getItem('meowmeow-ann-closed')) {
        annBar.style.display = 'none';
      }
      annClose.addEventListener('click', function() {
        annBar.style.transition = 'opacity 0.3s';
        annBar.style.opacity = '0';
        setTimeout(function() { annBar.style.display = 'none'; }, 300);
        sessionStorage.setItem('meowmeow-ann-closed', '1');
      });
    }
  });

  // ===== NEWSLETTER POPUP =====
  document.addEventListener('DOMContentLoaded', function() {
    var popup = document.getElementById('newsletterPopup');
    var popupClose = document.getElementById('popupClose');
    if (!popup) return;
    if (localStorage.getItem('meowmeow-popup-dismissed')) return;

    setTimeout(function() {
      popup.classList.add('active');
    }, 8000);

    if (popupClose) {
      popupClose.addEventListener('click', function() {
        popup.classList.remove('active');
        localStorage.setItem('meowmeow-popup-dismissed', '1');
      });
    }

    // Close on overlay click
    popup.addEventListener('click', function(e) {
      if (e.target === popup) {
        popup.classList.remove('active');
        localStorage.setItem('meowmeow-popup-dismissed', '1');
      }
    });
  });

  // ===== KEYBOARD SHORTCUTS =====
  document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd+K — focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      var navSearch = document.getElementById('navSearch');
      var searchInput = document.getElementById('searchInput');
      if (navSearch) navSearch.classList.add('active');
      if (searchInput) searchInput.focus();
    }
    // T — toggle theme (not in input)
    if (e.key === 't' && !e.ctrlKey && !e.metaKey && !e.altKey &&
        e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'SELECT') {
      if (window.toggleTheme) window.toggleTheme();
    }
  });

})();
