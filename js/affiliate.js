/* =============================================
   AFFILIATE.JS — LINK TAGGING & TRACKING
   ============================================= */

(function() {
  'use strict';

  const CONFIG = {
    amazon:     { param: 'tag',          value: 'meowmeow-21' },
    daraz:      { param: 'aff_id',       value: 'MEOW123' },
    temu:       { param: 'refer_page',   value: 'meowmeow' },
    aliexpress: { param: 'aff_platform', value: 'meowmeow' },
  };

  function tagLinks() {
    document.querySelectorAll('a[href^="http"]').forEach(link => {
      try {
        const url = new URL(link.href);
        for (const [platform, cfg] of Object.entries(CONFIG)) {
          if (url.hostname.includes(platform)) {
            url.searchParams.set(cfg.param, cfg.value);
            link.href = url.toString();
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer sponsored');
            break;
          }
        }
      } catch {}
    });
  }

  function trackClicks() {
    document.querySelectorAll('a[rel*="sponsored"]').forEach(link => {
      link.addEventListener('click', () => {
        try {
          const url = new URL(link.href);
          let platform = 'unknown';
          for (const p in CONFIG) { if (url.hostname.includes(p)) { platform = p; break; } }
          const name = link.closest('.product-card')?.querySelector('.product-name')?.textContent || 'Direct';
          console.log(`[Affiliate] Click → ${platform} | ${name}`);
          if (typeof gtag === 'function') {
            gtag('event', 'affiliate_click', { affiliate_platform: platform, product_name: name });
          }
        } catch {}
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    tagLinks();
    trackClicks();
  });

})();
