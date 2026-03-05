/* ============================
   AFFILIATE.JS — LINK TAGGING & TRACKING
   ============================ */

(function() {
  'use strict';

  const affiliateConfig = {
    amazon: { param: 'tag', value: 'meowmeow-21' },
    daraz: { param: 'aff_id', value: 'MEOW123' },
    temu: { param: 'useTmtpID', value: 'MEOWAFF' },
    aliexpress: { param: 'aff_platform', value: 'meowmeow_site' }
  };

  // Add affiliate tags
  function tagAffiliateLinks() {
    const links = document.querySelectorAll('a[href^="http"]');

    links.forEach(link => {
      try {
        const url = new URL(link.href);
        let modified = false;

        for (const [platform, config] of Object.entries(affiliateConfig)) {
          if (url.hostname.includes(platform)) {
            url.searchParams.set(config.param, config.value);
            link.href = url.toString();
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer sponsored');
            modified = true;
            break;
          }
        }

        if (modified && !link.querySelector('.affiliate-tag') && !link.classList.contains('btn')) {
          const tag = document.createElement('span');
          tag.className = 'affiliate-tag';
          tag.style.cssText = 'font-size:0.65rem; background:var(--accent-light); color:var(--accent); padding:1px 6px; border-radius:4px; margin-left:4px; font-weight:600;';
          tag.textContent = 'Affiliate';
          link.appendChild(tag);
        }
      } catch (e) {
        // Skip invalid URLs
      }
    });
  }

  // Track clicks
  function trackAffiliateClicks() {
    document.querySelectorAll('a[rel*="sponsored"]').forEach(link => {
      link.addEventListener('click', () => {
        try {
          const url = new URL(link.href);
          let platform = 'unknown';
          for (const p in affiliateConfig) {
            if (url.hostname.includes(p)) {
              platform = p;
              break;
            }
          }

          const productName = link.closest('.product-card')?.querySelector('.product-name')?.textContent || 'Direct Link';

          console.log(`[Affiliate Click] Platform: ${platform}, Product: ${productName}`);

          // Google Analytics (if available)
          if (typeof gtag === 'function') {
            gtag('event', 'affiliate_click', {
              affiliate_platform: platform,
              product_name: productName
            });
          }
        } catch (e) {
          console.error('Error tracking affiliate click:', e);
        }
      });
    });
  }

  // Disclosure
  function addDisclosure() {
    const main = document.getElementById('mainContent');
    if (!main || document.querySelector('.affiliate-disclosure')) return;

    const disclosure = document.createElement('div');
    disclosure.className = 'affiliate-disclosure';
    disclosure.id = 'affiliateDisclosure';
    disclosure.innerHTML = `
      <div class="disclosure-content">
        <i class="fas fa-info-circle"></i>
        <p><strong>Disclosure:</strong> MeowMeow participates in Amazon, Daraz, Temu & AliExpress affiliate programs. We may earn a commission at no extra cost to you.</p>
        <button class="disclosure-close" id="disclosureClose" aria-label="Close disclosure">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;
    main.prepend(disclosure);

    // Close handler
    document.getElementById('disclosureClose')?.addEventListener('click', () => {
      disclosure.style.animation = 'fadeUp 0.3s ease reverse forwards';
      setTimeout(() => { disclosure.remove(); }, 300);
    });
  }

  // Init
  document.addEventListener('DOMContentLoaded', () => {
    addDisclosure();
    tagAffiliateLinks();
    trackAffiliateClicks();
  });

})();