/* ============================
   NAVBAR.JS — MOBILE MENU, SCROLL EFFECTS, UI INTERACTIONS
   ============================ */

(function() {
  'use strict';

  // ===== DOM ELEMENTS =====
  const navbar = document.getElementById('navbar');
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileOverlay = document.getElementById('mobileOverlay');
  const mobileClose = document.getElementById('mobileClose');
  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-links a');
  const disclosureClose = document.getElementById('disclosureClose');
  const disclosure = document.getElementById('affiliateDisclosure');
  const newsletterForm = document.getElementById('newsletterForm');
  const contactForm = document.getElementById('contactForm');

  // ===== SCROLL EFFECT =====
  function handleScroll() {
    if (!navbar) return;
    if (window.pageYOffset > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  // ===== MOBILE MENU =====
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

  // Event Listeners - Mobile Menu
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      if (mobileMenu && mobileMenu.classList.contains('active')) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });
  }

  if (mobileClose) {
    mobileClose.addEventListener('click', closeMobileMenu);
  }

  if (mobileOverlay) {
    mobileOverlay.addEventListener('click', closeMobileMenu);
  }

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMobileMenu();
    }
  });

  // Close on link click
  navLinks.forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  // ===== SMOOTH SCROLL =====
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#' || !href) return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const offsetTop = target.offsetTop - (navbar ? navbar.offsetHeight : 70);
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    });
  });

  // ===== WISHLIST TOGGLE =====
  document.querySelectorAll('.wishlist-toggle').forEach(btn => {
    btn.addEventListener('click', function() {
      this.classList.toggle('active');
      const icon = this.querySelector('i');
      if (this.classList.contains('active')) {
        icon.classList.remove('far');
        icon.classList.add('fas');
        showToast('Added to wishlist! ❤️', 'success');
      } else {
        icon.classList.remove('fas');
        icon.classList.add('far');
        showToast('Removed from wishlist', 'warning');
      }
    });
  });

  // ===== PRODUCT QUICK VIEW =====
  document.querySelectorAll('.product-overlay .btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const card = this.closest('.product-card');
      const productName = card ? card.querySelector('.product-name').textContent : 'Product';
      showToast('👁️ Quick view: ' + productName, 'info');
    });
  });

  // ===== DISCLOSURE CLOSE =====
  if (disclosureClose && disclosure) {
    disclosureClose.addEventListener('click', () => {
      disclosure.style.animation = 'fadeUp 0.3s ease reverse forwards';
      setTimeout(() => {
        disclosure.style.display = 'none';
      }, 300);
    });
  }

  // ===== FORM HANDLERS =====
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
      e.preventDefault();
      showToast('🎉 Subscribed successfully! Check your email.', 'success');
      this.reset();
    });
  }

  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      showToast('📬 Message sent! We\'ll get back to you soon.', 'success');
      this.reset();
    });
  }

  // ===== CART & WISHLIST BUTTONS =====
  const cartBtn = document.getElementById('cartBtn');
  if (cartBtn) {
    cartBtn.addEventListener('click', () => {
      showToast('🛒 Cart feature coming soon!', 'info');
    });
  }

  const wishlistBtn = document.getElementById('wishlistBtn');
  if (wishlistBtn) {
    wishlistBtn.addEventListener('click', () => {
      showToast('❤️ Wishlist feature coming soon!', 'info');
    });
  }

  // ===== LAZY LOADING IMAGES =====
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          img.classList.add('loaded');
          imageObserver.unobserve(img);
        }
      });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }

  // ===== PARALLAX EFFECT ON HERO SHAPES =====
  const heroSection = document.querySelector('.hero');
  if (heroSection) {
    window.addEventListener('mousemove', function(e) {
      if (window.innerWidth < 768) return; // Skip on mobile

      const shapes = document.querySelectorAll('.shape');
      const mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      const mouseY = (e.clientY / window.innerHeight - 0.5) * 2;

      shapes.forEach((shape, index) => {
        const speed = (index + 1) * 5;
        shape.style.transform = `translate(${mouseX * speed}px, ${mouseY * speed}px)`;
      });
    });
  }

  // ===== KEYBOARD SHORTCUTS =====
  document.addEventListener('keydown', function(e) {
    // Ctrl+K or Cmd+K = Focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      const navSearch = document.getElementById('navSearch');
      const searchInput = document.getElementById('searchInput');
      if (navSearch) {
        navSearch.classList.add('active');
      }
      if (searchInput) {
        searchInput.focus();
      }
    }

    // T = Toggle theme
    if (e.key === 't' && !e.ctrlKey && !e.metaKey && 
        e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      const themeToggle = document.getElementById('themeToggle');
      if (themeToggle) themeToggle.click();
    }
  });

  // ===== SMOOTH IMAGE LOAD =====
  document.querySelectorAll('img').forEach(img => {
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.5s ease';

    if (img.complete) {
      img.style.opacity = '1';
    } else {
      img.addEventListener('load', () => {
        img.style.opacity = '1';
      });
      img.addEventListener('error', () => {
        img.style.opacity = '1';
        img.alt = 'Image not available';
      });
    }
  });

  // ===== INIT =====
  window.addEventListener('scroll', handleScroll);
  document.addEventListener('DOMContentLoaded', handleScroll);

})();