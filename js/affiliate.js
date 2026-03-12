/* ============================
   AFFILIATE.JS — LINK TAGGING & TRACKING
   ============================ */

(function() {
  'use strict';

  const affiliateConfig = {
    'amazon.com':     { param: 'tag',          value: 'meowmeow-21'       },
    'amazon.co.uk':   { param: 'tag',          value: 'meowmeow-21'       },
    'daraz.pk':       { param: 'aff_id',       value: 'MEOW123'           },
    'daraz.com':      { param: 'aff_id',       value: 'MEOW123'           },
    'temu.com':       { param: 'refer_aff_src', value: 'meowmeow'         },
    'aliexpress.com': { param: 'aff_platform', value: 'meowmeow_site'     },
    'shein.com':      { param: 'url_from',     value: 'meowmeow'          }
  };

  // ---- Tag affiliate links with params ----
  function tagAffiliateLinks() {
    const links = document.querySelectorAll('a[href]');
    links.forEach(link => {
      try {
        const url = new URL(link.href);
        let matched = false;

        for (const [domain, config] of Object.entries(affiliateConfig)) {
          if (url.hostname.includes(domain)) {
            url.searchParams.set(config.param, config.value);
            link.href = url.toString();
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer sponsored');
            matched = true;
            break;
          }
        }

        // Add visual "AD" badge to plain text links (not buttons)
        if (matched && !link.querySelector('.affiliate-tag') && !link.classList.contains('btn')) {
          const tag = document.createElement('sup');
          tag.className = 'affiliate-tag';
          tag.textContent = 'AD';
          link.appendChild(tag);
        }
      } catch(e) {
        // Skip invalid URLs
      }
    });
  }

  // ---- Track clicks via GA4 / gtag ----
  function trackAffiliateClicks() {
    document.querySelectorAll('a[rel*="sponsored"]').forEach(link => {
      if (link._affTracked) return;
      link._affTracked = true;

      link.addEventListener('click', () => {
        try {
          const url = new URL(link.href);
          let platform = 'unknown';

          for (const domain of Object.keys(affiliateConfig)) {
            if (url.hostname.includes(domain)) {
              platform = domain.split('.')[0];
              break;
            }
          }

          const productName =
            link.closest('.product-card')?.querySelector('.product-name')?.textContent?.trim()
            || link.textContent?.trim()
            || 'Direct Link';

          console.log(`[Affiliate Click] Platform: ${platform} | Product: ${productName}`);

          if (typeof gtag === 'function') {
            gtag('event', 'affiliate_click', {
              affiliate_platform: platform,
              product_name: productName,
              link_url: link.href
            });
          }

          if (typeof ga === 'function') {
            ga('send', 'event', 'Affiliate', 'Click', platform + ' - ' + productName);
          }
        } catch(e) {}
      });
    });
  }

  // ---- Init ----
  document.addEventListener('DOMContentLoaded', () => {
    tagAffiliateLinks();
    trackAffiliateClicks();

    // Re-run if dynamic content added later
    const observer = new MutationObserver(() => {
      tagAffiliateLinks();
      trackAffiliateClicks();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  });

})();
