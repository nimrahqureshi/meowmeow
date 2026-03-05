/* ============================
   SCROLL FUNCTIONALITY
   ============================ */

(function() {
  'use strict';

  // Scroll Progress Bar
  function updateScrollProgress() {
    const scrollProgress = document.getElementById('scrollProgress');
    if (!scrollProgress) return;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const progress = (scrollTop / scrollHeight) * 100;
    scrollProgress.style.width = progress + '%';
  }

  // Back to Top Button
  function handleBackToTop() {
    const backToTop = document.getElementById('backToTop');
    if (!backToTop) return;

    if (window.pageYOffset > 400) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  }

  // Smooth scroll to top
  const backToTopBtn = document.getElementById('backToTop');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', function() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // Scroll Reveal - IntersectionObserver
  function initScrollReveal() {
    const revealElements = document.querySelectorAll('.product-card, .category-card, .review-card, .blog-card, .trending-card, .contact-item');

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      });

      revealElements.forEach(function(el, index) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease ' + (index % 4) * 0.1 + 's, transform 0.6s ease ' + (index % 4) * 0.1 + 's';
        observer.observe(el);
      });
    } else {
      revealElements.forEach(function(el) {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      });
    }
  }

  // Active nav link on scroll
  function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    const scrollPos = window.pageYOffset + 100;

    sections.forEach(function(section) {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        navLinks.forEach(function(link) {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + sectionId) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  // Count up animation for stats
  function animateCounters() {
    const counters = document.querySelectorAll('.stat-number[data-count]');

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            const counter = entry.target;
            const target = parseInt(counter.getAttribute('data-count'));
            let current = 0;
            const increment = target / 60;
            const duration = 2000;
            const stepTime = duration / 60;

            function updateCounter() {
              current += increment;
              if (current < target) {
                counter.textContent = Math.floor(current).toLocaleString();
                setTimeout(updateCounter, stepTime);
              } else {
                counter.textContent = target.toLocaleString();
              }
            }

            updateCounter();
            observer.unobserve(counter);
          }
        });
      }, { threshold: 0.5 });

      counters.forEach(function(counter) {
        observer.observe(counter);
      });
    }
  }

  // Countdown Timer
  function initCountdownTimer() {
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    if (!hoursEl || !minutesEl || !secondsEl) return;

    // Set countdown to 8 hours, 45 minutes, 30 seconds from now
    let totalSeconds = 8 * 3600 + 45 * 60 + 30;

    function updateTimer() {
      if (totalSeconds <= 0) {
        totalSeconds = 24 * 3600; // Reset to 24 hours
      }

      const h = Math.floor(totalSeconds / 3600);
      const m = Math.floor((totalSeconds % 3600) / 60);
      const s = totalSeconds % 60;

      hoursEl.textContent = String(h).padStart(2, '0');
      minutesEl.textContent = String(m).padStart(2, '0');
      secondsEl.textContent = String(s).padStart(2, '0');

      totalSeconds--;
    }

    updateTimer();
    setInterval(updateTimer, 1000);
  }

  // Throttle function
  function throttle(func, limit) {
    let inThrottle;
    return function() {
      if (!inThrottle) {
        func.apply(this, arguments);
        inThrottle = true;
        setTimeout(function() { inThrottle = false; }, limit);
      }
    };
  }

  // Scroll event listener
  window.addEventListener('scroll', throttle(function() {
    updateScrollProgress();
    handleBackToTop();
    updateActiveNavLink();
  }, 16));

  // Init on DOM ready
  document.addEventListener('DOMContentLoaded', function() {
    initScrollReveal();
    animateCounters();
    initCountdownTimer();
  });

})();