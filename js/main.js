/* ============================================================
   MAIN.JS — GLOBAL UTILITIES, TOAST, SETTINGS, COOKIE
   ============================================================ */

(function() {
  'use strict';

  // ===== TOAST SYSTEM =====
  window.showToast = function(message, type = 'info', duration = 4000) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const icons = { success: 'fa-check-circle', error: 'fa-times-circle', warning: 'fa-exclamation-triangle', info: 'fa-info-circle' };
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <i class="fas ${icons[type] || icons.info}" style="flex-shrink:0;color:var(--${type === 'info' ? 'info' : type})"></i>
      <span>${message}</span>
      <button class="toast-close" aria-label="Close"><i class="fas fa-times"></i></button>`;

    container.appendChild(toast);

    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => removeToast(toast));

    const timer = setTimeout(() => removeToast(toast), duration);
    toast._timer = timer;

    toast.addEventListener('mouseenter', () => clearTimeout(toast._timer));
    toast.addEventListener('mouseleave', () => {
      toast._timer = setTimeout(() => removeToast(toast), 1500);
    });
  };

  function removeToast(toast) {
    toast.style.transition = 'all 0.3s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100px)';
    setTimeout(() => toast.remove(), 320);
  }

  // ===== NEWSLETTER FORMS =====
  document.addEventListener('submit', function(e) {
    const form = e.target;
    if (form.id === 'newsletter-form' || form.id === 'newsletterForm' ||
        form.classList.contains('newsletter-form')) {
      e.preventDefault();
      const emailInput = form.querySelector('input[type="email"]');
      const msgEl = form.querySelector('#newsletter-msg, .newsletter-msg');

      if (emailInput && emailInput.value) {
        window.showToast('🎉 Subscribed! Check your inbox.', 'success');
        if (msgEl) {
          msgEl.textContent = '✅ Thank you for subscribing!';
          msgEl.style.color = 'var(--success)';
        }
        emailInput.value = '';

        // GA4 event
        if (typeof gtag === 'function') {
          gtag('event', 'newsletter_signup', { email: emailInput.value });
        }
      }
    }

    // Contact form
    if (form.id === 'contactForm') {
      e.preventDefault();
      window.showToast('📬 Message sent! We\'ll reply soon.', 'success');
      form.reset();
    }
  });

  // ===== SETTINGS PANEL =====
  document.addEventListener('DOMContentLoaded', function() {

    // Font size control
    const fsDisplay = document.getElementById('fontSizeDisplay');
    const fsMinus = document.getElementById('fsMinus');
    const fsPlus  = document.getElementById('fsPlus');

    let fontSize = parseInt(localStorage.getItem('mm-fontsize') || '16', 10);

    function applyFontSize(size) {
      fontSize = Math.min(20, Math.max(12, size));
      document.documentElement.style.fontSize = fontSize + 'px';
      localStorage.setItem('mm-fontsize', fontSize);
      if (fsDisplay) fsDisplay.textContent = fontSize + 'px';
    }

    applyFontSize(fontSize);
    fsMinus?.addEventListener('click', () => applyFontSize(fontSize - 1));
    fsPlus?.addEventListener('click',  () => applyFontSize(fontSize + 1));

    // Language selector
    const langSelect = document.getElementById('langSelect');
    const savedLang  = localStorage.getItem('mm-lang') || 'en';
    if (langSelect) {
      langSelect.value = savedLang;
      langSelect.addEventListener('change', function() {
        localStorage.setItem('mm-lang', this.value);
        window.showToast(`Language changed to ${this.options[this.selectedIndex].text}`, 'info');
        // Note: Full i18n would require more infrastructure
      });
    }

    // Accent color swatches
    document.querySelectorAll('.color-swatch').forEach(swatch => {
      swatch.addEventListener('click', function() {
        const color = this.dataset.color;
        if (!color) return;

        document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
        this.classList.add('active');

        document.documentElement.style.setProperty('--accent', color);
        const lightColor = color + '1a';
        document.documentElement.style.setProperty('--accent-light', lightColor);
        localStorage.setItem('mm-accent', color);
        window.showToast('Accent color updated!', 'success');
      });
    });

    // Restore saved accent
    const savedAccent = localStorage.getItem('mm-accent');
    if (savedAccent) {
      document.documentElement.style.setProperty('--accent', savedAccent);
      document.documentElement.style.setProperty('--accent-light', savedAccent + '1a');
      document.querySelectorAll('.color-swatch').forEach(s => {
        if (s.dataset.color === savedAccent) s.classList.add('active');
      });
    }

    // Animation toggle
    const animToggle = document.getElementById('animToggle');
    const savedAnim  = localStorage.getItem('mm-anim') !== 'false';
    if (animToggle) {
      animToggle.checked = savedAnim;
      if (!savedAnim) document.body.classList.add('no-animations');

      animToggle.addEventListener('change', function() {
        localStorage.setItem('mm-anim', this.checked);
        document.body.classList.toggle('no-animations', !this.checked);
      });
    }

    // Cookie consent
    if (!localStorage.getItem('mm-cookie-consent')) {
      const banner = document.getElementById('cookieConsent');
      if (banner) banner.style.display = 'flex';
    }

    document.getElementById('acceptCookies')?.addEventListener('click', function() {
      localStorage.setItem('mm-cookie-consent', 'true');
      const banner = document.getElementById('cookieConsent');
      if (banner) {
        banner.style.opacity = '0';
        banner.style.transform = 'translateY(20px)';
        setTimeout(() => banner.remove(), 350);
      }
      window.showToast('Cookie preferences saved ✓', 'success');
    });

    document.getElementById('declineCookies')?.addEventListener('click', function() {
      localStorage.setItem('mm-cookie-consent', 'minimal');
      const banner = document.getElementById('cookieConsent');
      if (banner) {
        banner.style.opacity = '0';
        setTimeout(() => banner.remove(), 350);
      }
    });

    // ===== FAQ ACCORDION =====
    document.querySelectorAll('.faq-question').forEach(q => {
      q.addEventListener('click', function() {
        const item = this.closest('.faq-item');
        const isOpen = item.classList.contains('open');
        document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
        if (!isOpen) item.classList.add('open');
      });
    });

    // ===== ACCORDION (general) =====
    document.querySelectorAll('.accordion-header').forEach(h => {
      h.addEventListener('click', function() {
        const item = this.closest('.accordion-item');
        item.classList.toggle('open');
      });
    });

    // ===== TABS =====
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const target = this.dataset.tab;
        const group  = this.closest('[data-tab-group]');
        if (!group) return;

        group.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        group.querySelectorAll('.tab-content').forEach(c => {
          c.style.display = c.dataset.tab === target ? 'block' : 'none';
        });
      });
    });

    // ===== SMOOTH IMAGE LOAD =====
    document.querySelectorAll('img:not([data-src])').forEach(img => {
      if (!img.complete) {
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.4s ease';
        img.addEventListener('load', () => { img.style.opacity = '1'; });
        img.addEventListener('error', () => { img.style.opacity = '0.4'; });
      }
    });

  });

  // ===== CONSOLE BRANDING =====
  console.log(
    '%c🐾 MeowMeow %cv2.0 ',
    'background:linear-gradient(135deg,#6C47FF,#FF4D8D);color:#fff;font-size:18px;font-weight:900;padding:8px 12px;border-radius:8px 0 0 8px;letter-spacing:1px;',
    'background:#0D0A1E;color:#8B6FFF;font-size:14px;padding:8px 12px;border-radius:0 8px 8px 0;font-weight:600;'
  );

})();
