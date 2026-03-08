/* ============================================================
   AFFILIATE.JS — LINK TAGGING, TRACKING, DISCLOSURE
   MeowMeow Affiliate Site — Production v2.0
   ============================================================ */

(function() {
  'use strict';

  // ===== AFFILIATE CONFIG =====
  // Replace values with your real affiliate IDs
  var affiliateConfig = {
    amazon:     { params: { tag: 'meowmeow-21' } },
    daraz:      { params: { aff_id: 'MEOW123', aff_sub: 'site' } },
    temu:       { params: { useTmtpID: 'MEOWAFF' } },
    aliexpress: { params: { aff_platform: 'meowmeow_site', aff_trace_key: 'meow' } },
    ebay:       { params: { campid: '5338123456', toolid: '10001' } },
    walmart:    { params: { affiliates_id: 'meowmeow' } }
  };

  // ===== TAG AFFILIATE LINKS =====
  function tagAffiliateLinks() {
    var links = document.querySelectorAll('a[href^="http"], a[href^="//"]');
    links.forEach(function(link) {
      try {
        var url = new URL(link.href);
        var matched = null;
        var platform = null;

        for (var p in affiliateConfig) {
          if (url.hostname.includes(p)) {
            platform = p;
            matched = affiliateConfig[p];
            break;
          }
        }
        if (!matched) return;

        // Add all params for this platform
        for (var param in matched.params) {
          url.searchParams.set(param, matched.params[param]);
        }
        link.href = url.toString();
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer sponsored');
        link.dataset.affiliatePlatform = platform;

        // Add visible "Affiliate" badge — skip on buttons and image-only links
        var hasText = link.textContent.trim().length > 0;
        var isBtn = link.classList.contains('btn') || link.closest('.btn');
        if (hasText && !isBtn && !link.querySelector('.aff-badge')) {
          var badge = document.createElement('sup');
          badge.className = 'aff-badge';
          badge.textContent = 'AD';
          badge.setAttribute('aria-label', 'Affiliate link');
          badge.style.cssText =
            'font-size:0.55rem;font-weight:700;background:var(--accent-light,#ede9fe);' +
            'color:var(--accent,#7C3AED);padding:1px 4px;border-radius:3px;' +
            'margin-left:3px;vertical-align:super;white-space:nowrap;letter-spacing:0.05em;';
          link.appendChild(badge);
        }
      } catch (e) {
        // Skip malformed URLs
      }
    });
  }

  // ===== TRACK AFFILIATE CLICKS =====
  function trackAffiliateClicks() {
    document.addEventListener('click', function(e) {
      var link = e.target.closest('a[data-affiliate-platform]');
      if (!link) return;

      var platform = link.dataset.affiliatePlatform || 'unknown';
      var card = link.closest('.product-card');
      var productName = (card && card.querySelector('.product-name'))
        ? card.querySelector('.product-name').textContent.trim()
        : link.textContent.trim() || 'Direct Link';
      var productPrice = (card && card.querySelector('.current-price'))
        ? card.querySelector('.current-price').textContent.trim()
        : '';

      // Log to console (replace/extend with your analytics)
      console.log('[Affiliate Click]', {
        platform: platform,
        product: productName,
        price: productPrice,
        url: link.href,
        timestamp: new Date().toISOString()
      });

      // Store in localStorage for basic stats
      try {
        var stats = JSON.parse(localStorage.getItem('meowmeow-aff-stats') || '{}');
        stats[platform] = (stats[platform] || 0) + 1;
        stats._total = (stats._total || 0) + 1;
        stats._lastClick = new Date().toISOString();
        localStorage.setItem('meowmeow-aff-stats', JSON.stringify(stats));
      } catch (ex) {}

      // Google Analytics 4
      if (typeof gtag === 'function') {
        gtag('event', 'affiliate_click', {
          affiliate_platform: platform,
          product_name: productName,
          product_price: productPrice
        });
      }

      // Facebook Pixel
      if (typeof fbq === 'function') {
        fbq('track', 'ViewContent', {
          content_name: productName,
          content_category: platform
        });
      }
    });
  }

  // ===== AFFILIATE DISCLOSURE =====
  function injectDisclosure() {
    // Don't inject if already exists in HTML
    if (document.getElementById('affiliateDisclosure')) return;
    if (localStorage.getItem('meowmeow-disclosure-closed') === '1') return;

    var main = document.getElementById('mainContent') || document.querySelector('main') || document.body;
    var disclosure = document.createElement('div');
    disclosure.className = 'affiliate-disclosure';
    disclosure.id = 'affiliateDisclosure';
    disclosure.setAttribute('role', 'note');
    disclosure.setAttribute('aria-label', 'Affiliate disclosure');
    disclosure.innerHTML =
      '<div class="disclosure-inner">' +
        '<i class="fas fa-info-circle" aria-hidden="true"></i>' +
        '<p><strong>Disclosure:</strong> MeowMeow participates in affiliate programs including Amazon, Daraz, Temu &amp; AliExpress. ' +
        'We may earn a small commission at no extra cost to you when you purchase through our links. ' +
        '<a href="/affiliate-disclosure" target="_blank" rel="noopener">Learn more</a></p>' +
        '<button class="disclosure-close" id="disclosureClose" aria-label="Close disclosure"><i class="fas fa-times"></i></button>' +
      '</div>';

    main.prepend(disclosure);

    var closeBtn = disclosure.querySelector('#disclosureClose');
    if (closeBtn) {
      closeBtn.addEventListener('click', function() {
        disclosure.style.transition = 'opacity 0.3s ease, max-height 0.3s ease';
        disclosure.style.opacity = '0';
        disclosure.style.maxHeight = '0';
        setTimeout(function() { disclosure.remove(); }, 300);
        localStorage.setItem('meowmeow-disclosure-closed', '1');
      });
    }
  }

  // ===== OUTBOUND LINK INDICATOR =====
  function markExternalLinks() {
    document.querySelectorAll('a[target="_blank"]').forEach(function(link) {
      if (!link.querySelector('.sr-only-external') && !link.dataset.noExternalIcon) {
        link.setAttribute('aria-describedby', 'new-tab-desc');
      }
    });
    // Add hidden description once
    if (!document.getElementById('new-tab-desc')) {
      var desc = document.createElement('span');
      desc.id = 'new-tab-desc';
      desc.className = 'sr-only';
      desc.textContent = 'Opens in a new tab';
      desc.style.cssText = 'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);border:0;';
      document.body.appendChild(desc);
    }
  }

  // ===== AFFILIATE STATS DASHBOARD (console helper) =====
  window.meowAffStats = function() {
    var stats = JSON.parse(localStorage.getItem('meowmeow-aff-stats') || '{}');
    console.table(stats);
    return stats;
  };

  // ===== INIT =====
  document.addEventListener('DOMContentLoaded', function() {
    injectDisclosure();
    tagAffiliateLinks();
    trackAffiliateClicks();
    markExternalLinks();

    // Re-tag dynamically loaded content (e.g., after AJAX)
    if (window.MutationObserver) {
      var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(m) {
          if (m.addedNodes.length) {
            // Debounce re-tagging
            clearTimeout(window._affRetag);
            window._affRetag = setTimeout(tagAffiliateLinks, 500);
          }
        });
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }
  });

})();
