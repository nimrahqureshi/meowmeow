/* ============================
   MAIN.JS — GLOBAL UTILITIES  (FIXED v2)
   Load FIRST before all other JS
   ============================ */

'use strict';

// ===== TOAST SYSTEM (GLOBAL) =====
window.showToast = function(message, type) {
  type = type || 'info';
  var container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    container.id = 'toastContainer';
    document.body.appendChild(container);
  }

  var toast = document.createElement('div');
  toast.className = 'toast toast-' + type;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'polite');
  toast.innerHTML =
    '<span>' + message + '</span>' +
    '<button class="toast-close" aria-label="Close notification">' +
      '<i class="fas fa-times"></i>' +
    '</button>';

  container.appendChild(toast);

  var closeBtn = toast.querySelector('.toast-close');
  if (closeBtn) closeBtn.addEventListener('click', function() { removeToast(toast); });

  function removeToast(el) {
    el.style.opacity = '0';
    el.style.transform = 'translateX(110%)';
    setTimeout(function() { if (el.parentNode) el.remove(); }, 350);
  }

  function startAutoRemove() {
    toast._timer = setTimeout(function() { removeToast(toast); }, 4000);
  }

  toast.addEventListener('mouseenter', function() { clearTimeout(toast._timer); });
  toast.addEventListener('mouseleave', startAutoRemove);
  startAutoRemove();
};

// ===== SCROLL PROGRESS BAR =====
// FIX: JS was creating class 'scroll-progress' but CSS targets '.scroll-progress-bar'
(function initScrollProgress() {
  document.addEventListener('DOMContentLoaded', function() {
    var bar = document.getElementById('scrollProgress');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'scrollProgress';
      bar.className = 'scroll-progress-bar'; // FIXED: was 'scroll-progress'
      document.body.prepend(bar);
    }

    window.addEventListener('scroll', function() {
      var scrollTop = window.scrollY || document.documentElement.scrollTop;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = pct + '%';
    }, { passive: true });
  });
})();

// ===== BACK TO TOP =====
(function initBackToTop() {
  document.addEventListener('DOMContentLoaded', function() {
    var btn = document.getElementById('backToTop');
    if (!btn) return;

    window.addEventListener('scroll', function() {
      btn.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });

    btn.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
})();

// ===== AFFILIATE DISCLOSURE CLOSE =====
(function initDisclosure() {
  document.addEventListener('DOMContentLoaded', function() {
    var closeBtn = document.getElementById('disclosureClose');
    var disclosure = document.getElementById('affiliateDisclosure');
    if (!closeBtn || !disclosure) return;

    try {
      if (sessionStorage.getItem('meowmeow-disclosure-closed') === '1') {
        disclosure.style.display = 'none';
        return;
      }
    } catch(e) {}

    closeBtn.addEventListener('click', function() {
      disclosure.style.opacity = '0';
      disclosure.style.transform = 'translateY(-10px)';
      setTimeout(function() { disclosure.style.display = 'none'; }, 300);
      try { sessionStorage.setItem('meowmeow-disclosure-closed', '1'); } catch(e) {}
    });
  });
})();

// ===== ANIMATED STAT COUNTERS =====
// FIX: stats were showing 0 — this now works with data attributes OR text content
(function initCounters() {
  document.addEventListener('DOMContentLoaded', function() {
    if (!('IntersectionObserver' in window)) return;

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        observer.unobserve(el);

        // Read target from data-target attr, or parse existing text
        var raw = el.dataset.target || el.textContent.replace(/[^0-9.]/g, '');
        var target = parseFloat(raw) || 0;
        var suffix = el.dataset.suffix || el.textContent.replace(/[0-9.,]/g, '').trim() || '';
        var duration = 1800;
        var start = performance.now();

        function tick(now) {
          var elapsed = now - start;
          var progress = Math.min(elapsed / duration, 1);
          // ease-out cubic
          var eased = 1 - Math.pow(1 - progress, 3);
          var current = Math.floor(eased * target);
          el.textContent = current.toLocaleString() + suffix;
          if (progress < 1) requestAnimationFrame(tick);
          else el.textContent = target.toLocaleString() + suffix;
        }

        requestAnimationFrame(tick);
      });
    }, { threshold: 0.3 });

    document.querySelectorAll('.stat-number, [data-counter]').forEach(function(el) {
      observer.observe(el);
    });
  });
})();

// ===== THEME INIT (prevents flash) =====
(function() {
  try {
    var saved = localStorage.getItem('meowmeow-theme');
    if (saved === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
  } catch(e) {}
})();

// ===== CONSOLE BRANDING =====
console.log(
  '%c🐱 MeowMeow %c v2.0 ',
  'background: linear-gradient(135deg, #7C3AED, #F472B6); color: white; font-size: 18px; font-weight: bold; padding: 8px 12px; border-radius: 8px 0 0 8px;',
  'background: #1e293b; color: #f1f5f9; font-size: 14px; padding: 8px 12px; border-radius: 0 8px 8px 0;'
);
