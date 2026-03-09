/* =============================================
   MAIN.JS — GLOBAL UTILITIES & TOAST SYSTEM
   ============================================= */

(function() {
  'use strict';

  // ── TOAST SYSTEM ──
  window.showToast = function(message, type = 'info', duration = 4000) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || icons.info}</span>
      <span class="toast-msg">${message}</span>
      <button class="toast-close" aria-label="Close">✕</button>
    `;

    toast.querySelector('.toast-close').addEventListener('click', () => removeToast(toast));
    container.appendChild(toast);

    setTimeout(() => removeToast(toast), duration);
    return toast;
  };

  function removeToast(toast) {
    toast.style.animation = 'toastSlideIn 0.3s ease reverse forwards';
    setTimeout(() => toast.remove(), 300);
  }

  // ── IMAGE SMOOTH LOAD ──
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('img').forEach(img => {
      img.classList.add('lazy');
      if (img.complete && img.naturalHeight !== 0) {
        img.classList.add('loaded');
      } else {
        img.addEventListener('load',  () => img.classList.add('loaded'));
        img.addEventListener('error', () => { img.classList.add('loaded'); });
      }
    });

    // ── FILTER BAR ──
    document.querySelectorAll('.filter-bar').forEach(bar => {
      bar.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
          bar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
          this.classList.add('active');

          const filter = this.getAttribute('data-filter');
          const grid   = bar.closest('section')?.querySelector('.product-grid') || document.querySelector('.product-grid');
          if (!grid || !filter) return;

          grid.querySelectorAll('.product-card').forEach(card => {
            const cat = card.getAttribute('data-category') || '';
            const show = filter === 'all' || cat.toLowerCase().includes(filter.toLowerCase());
            card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            if (show) {
              card.style.opacity = '1';
              card.style.transform = '';
              card.style.display = '';
            } else {
              card.style.opacity = '0';
              card.style.transform = 'scale(0.95)';
              setTimeout(() => { if (card.style.opacity === '0') card.style.display = 'none'; }, 300);
            }
          });
        });
      });
    });

    // ── CONTACT FORM ──
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
      contactForm.addEventListener('submit', e => {
        e.preventDefault();
        showToast('📬 Message sent! We\'ll reply within 24h.', 'success');
        contactForm.reset();
      });
    }

    // ── AFFILIATE LINK HANDLING ──
    document.querySelectorAll('a[href*="amazon"], a[href*="daraz"], a[href*="temu"], a[href*="aliexpress"]').forEach(link => {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer sponsored');
    });

  });

  // ── CONSOLE BRANDING ──
  console.log(
    '%c🐾 MeowMeow%c v2.0 Pro',
    'background:linear-gradient(135deg,#FF3366,#FFB800);color:#fff;font-size:16px;font-weight:900;padding:8px 14px;border-radius:8px 0 0 8px;',
    'background:#0D0D14;color:#f0f0ff;font-size:13px;padding:8px 14px;border-radius:0 8px 8px 0;'
  );

})();
