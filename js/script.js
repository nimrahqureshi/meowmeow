/* ============================
   SCRIPT.JS — PAGE-SPECIFIC INTERACTIONS
   ============================ */

(function() {
  'use strict';

  // Cart Button
  const cartBtn = document.getElementById('cartBtn');
  if (cartBtn) {
    cartBtn.addEventListener('click', () => {
      showToast('🛒 Cart feature coming soon!', 'info');
    });
  }

  // Wishlist Toggle
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

  // Quick View
  document.querySelectorAll('.quick-view-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const card = this.closest('.product-card');
      const name = card?.querySelector('.product-name')?.textContent || 'Product';
      showToast(`👁️ Quick view: ${name}`, 'info');
    });
  });

  // Newsletter Form
  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
      e.preventDefault();
      showToast('🎉 Subscribed successfully! Check your email.', 'success');
      this.reset();
    });
  }

  // Contact Form
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      showToast('📬 Message sent! We\'ll get back to you soon.', 'success');
      this.reset();
    });
  }

  // Lazy Loading Images
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

  // Parallax Hero Shapes
  const heroSection = document.querySelector('.hero');
  if (heroSection) {
    window.addEventListener('mousemove', function(e) {
      if (window.innerWidth < 768) return;

      const shapes = document.querySelectorAll('.shape');
      const mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      const mouseY = (e.clientY / window.innerHeight - 0.5) * 2;

      shapes.forEach((shape, index) => {
        const speed = (index + 1) * 5;
        shape.style.transform = `translate(${mouseX * speed}px, ${mouseY * speed}px)`;
      });
    });
  }

  // Keyboard Shortcuts
  document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + K = Focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      const searchInput = document.getElementById('searchInput');
      if (searchInput) {
        document.getElementById('navSearch')?.classList.add('active');
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

})();