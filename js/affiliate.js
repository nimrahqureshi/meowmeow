/* ============================
   AFFILIATE.JS
   ============================ */

(function() {
  'use strict';

  const affiliateConfig = {
    amazon: { param: 'tag', value: 'meowmeow-21', label: 'Amazon' },
    daraz: { param: 'aff_id', value: 'MEOW123', label: 'Daraz' },
    temu: { param: 'share_source', value: 'copy_link', label: 'Temu' },
    aliexpress: { param: 'af', value: 'meowmeow_aff', label: 'AliExpress' },
  };

  // Tag all affiliate links
  function tagLinks() {
    document.querySelectorAll('a[href^="http"]').forEach(link => {
      try {
        const url = new URL(link.href);
        for (const [platform, cfg] of Object.entries(affiliateConfig)) {
          if (url.hostname.includes(platform)) {
            url.searchParams.set(cfg.param, cfg.value);
            link.href = url.toString();
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer sponsored');

            // Add affiliate label to product cards (not buttons)
            if (!link.closest('.btn') && !link.closest('button') && !link.dataset.tagged) {
              link.dataset.tagged = '1';
            }
            break;
          }
        }
      } catch (_) {}
    });
  }

  // Track clicks
  function trackClicks() {
    document.addEventListener('click', function(e) {
      const link = e.target.closest('a[rel*="sponsored"]');
      if (!link) return;

      try {
        const url = new URL(link.href);
        let platform = 'unknown';
        for (const p in affiliateConfig) {
          if (url.hostname.includes(p)) { platform = p; break; }
        }

        const productName = link.closest('.product-card')?.querySelector('.product-name')?.textContent || link.textContent.trim();

        console.log('[Affiliate Click]', { platform, product: productName });

        if (typeof gtag === 'function') {
          gtag('event', 'affiliate_click', {
            affiliate_platform: platform,
            product_name: productName,
          });
        }
      } catch (_) {}
    });
  }

  // Disclosure banner
  function addDisclosure() {
    if (document.querySelector('.affiliate-disclosure')) return;

    const main = document.getElementById('mainContent');
    if (!main) return;

    // Check if dismissed in this session
    if (sessionStorage.getItem('mm-disclosure-dismissed')) return;

    const el = document.createElement('div');
    el.className = 'affiliate-disclosure';
    el.id = 'affiliateDisclosure';
    el.innerHTML = `
      <div class="disclosure-content">
        <i class="fas fa-info-circle" style="color:var(--warning);font-size:1rem;flex-shrink:0;"></i>
        <p><strong>Affiliate Disclosure:</strong> MeowMeow participates in affiliate programs including Amazon, Daraz, Temu & AliExpress. We may earn a small commission on purchases at no extra cost to you. <a href="disclosure.html" style="color:var(--accent);">Learn more</a></p>
        <button class="disclosure-close" id="disclosureClose" aria-label="Dismiss">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;
    main.prepend(el);

    document.getElementById('disclosureClose')?.addEventListener('click', () => {
      el.style.animation = 'slideDown 0.3s ease reverse';
      setTimeout(() => el.remove(), 300);
      sessionStorage.setItem('mm-disclosure-dismissed', '1');
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    tagLinks();
    trackClicks();
    addDisclosure();
  });

})();
