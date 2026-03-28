/* ============================
   MAIN.JS — GLOBAL UTILITIES  v2.0
   Toast system · Scroll progress · Back-to-top · Disclosure
   Load FIRST before all other JS
   ============================ */

'use strict';

/* ===== TOAST SYSTEM ===== */
window.showToast = function (message, type) {
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
    '<button class="toast-close" aria-label="Close notification"><i class="fas fa-times"></i></button>';

  container.appendChild(toast);

  var closeBtn = toast.querySelector('.toast-close');
  if (closeBtn) closeBtn.addEventListener('click', function () { removeToast(toast); });

  function removeToast(el) {
    el.style.opacity = '0';
    el.style.transform = 'translateX(110%)';
    setTimeout(function () { if (el.parentNode) el.remove(); }, 350);
  }

  function startAutoRemove() {
    toast._timer = setTimeout(function () { removeToast(toast); }, 4000);
  }

  toast.addEventListener('mouseenter', function () { clearTimeout(toast._timer); });
  toast.addEventListener('mouseleave', startAutoRemove);
  startAutoRemove();
};

/* ===== SCROLL PROGRESS BAR ===== */
(function initScrollProgress() {
  document.addEventListener('DOMContentLoaded', function () {
    var bar = document.getElementById('scrollProgress');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'scrollProgress';
      bar.className = 'scroll-progress';
      document.body.prepend(bar);
    }

    window.addEventListener('scroll', function () {
      var st = window.scrollY || document.documentElement.scrollTop;
      var dh = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (dh > 0 ? (st / dh) * 100 : 0) + '%';
    }, { passive: true });
  });
})();

/* ===== BACK TO TOP ===== */
(function initBackToTop() {
  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('backToTop');
    if (!btn) return;
    window.addEventListener('scroll', function () {
      btn.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
})();

/* ===== AFFILIATE DISCLOSURE CLOSE ===== */
(function initDisclosure() {
  document.addEventListener('DOMContentLoaded', function () {
    /* affiliate.js is the canonical owner via window._discBound.
       We only run as fallback if affiliate.js hasn't loaded yet. */
    if (window._discBound) return;

    var closeBtn   = document.getElementById('disclosureClose');
    var disclosure = document.getElementById('affiliateDisclosure');
    if (!closeBtn || !disclosure) return;

    try {
      if (sessionStorage.getItem('meowmeow-disclosure-closed') === '1') {
        disclosure.style.display = 'none';
        return;
      }
    } catch (e) {}

    window._discBound = true;
    closeBtn.addEventListener('click', function () {
      disclosure.style.opacity = '0';
      disclosure.style.transform = 'translateY(-10px)';
      disclosure.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      setTimeout(function () { disclosure.style.display = 'none'; }, 320);
      try { sessionStorage.setItem('meowmeow-disclosure-closed', '1'); } catch (e) {}
    });
  });
})();

/* ===== CONSOLE BRANDING ===== */
console.log(
  '%c🐱 MeowMeow %c v1.0 ',
  'background:linear-gradient(135deg,#7C3AED,#F472B6);color:#fff;font-size:18px;font-weight:bold;padding:8px 12px;border-radius:8px 0 0 8px;',
  'background:#1e293b;color:#f1f5f9;font-size:14px;padding:8px 12px;border-radius:0 8px 8px 0;'
);
