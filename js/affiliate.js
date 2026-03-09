/* =============================================
   AFFILIATE.JS — LINK TAGGING & TRACKING
   ============================================= */
'use strict';

(function() {
  const config = {
    amazon:     { param: 'tag',          value: 'trendshop-21' },
    daraz:      { param: 'aff_id',       value: 'TREND456' },
    temu:       { param: 'aff_id',       value: 'TRENDSHOP' },
    aliexpress: { param: 'aff_platform', value: 'trendshop' },
  };

  function tagLinks() {
    document.querySelectorAll('a[href^="http"]').forEach(link => {
      try {
        const url = new URL(link.href);
        for (const [platform, cfg] of Object.entries(config)) {
          if (url.hostname.includes(platform)) {
            if (!url.searchParams.has(cfg.param)) {
              url.searchParams.set(cfg.param, cfg.value);
              link.href = url.toString();
            }
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer sponsored');
            break;
          }
        }
      } catch { /* skip */ }
    });
  }

  function trackClicks() {
    document.addEventListener('click', e => {
      const link = e.target.closest('a[rel*="sponsored"]');
      if (!link) return;
      try {
        const url = new URL(link.href);
        let platform = 'unknown';
        for (const p in config) if (url.hostname.includes(p)) { platform = p; break; }
        const product = link.closest('.product-card')?.querySelector('.product-name')?.textContent || link.textContent.trim();
        console.log(`[Affiliate] ${platform} | ${product}`);
        if (typeof gtag === 'function') gtag('event', 'affiliate_click', { affiliate_platform: platform, item_name: product });
      } catch { /* skip */ }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    tagLinks();
    trackClicks();
    // Re-tag dynamically added links
    const observer = new MutationObserver(() => tagLinks());
    observer.observe(document.body, { childList: true, subtree: true });
  });
})();
