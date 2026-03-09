/* ============================================================
   AFFILIATE.JS — LINK TAGGING, TRACKING, DISCLOSURE
   ============================================================ */

(function() {
  'use strict';

  const affiliateConfig = {
    amazon:     { params: { tag: 'meowmeow-21' } },
    daraz:      { params: { aff_id: 'MEOW123', utm_source: 'meowmeow' } },
    temu:       { params: { utm_source: 'meowmeow', ref: 'meow2024' } },
    aliexpress: { params: { aff_platform: 'meowmeow', aff_trace_key: 'mm2024' } },
    shein:      { params: { ref: 'meowmeow2024' } }
  };

  // Tag all external links with affiliate params
  function tagLinks() {
    document.querySelectorAll('a[href^="http"]').forEach(link => {
      try {
        const url = new URL(link.href);
        let platform = null;

        for (const [key] of Object.entries(affiliateConfig)) {
          if (url.hostname.includes(key)) { platform = key; break; }
        }

        if (!platform) return;

        const config = affiliateConfig[platform];
        Object.entries(config.params).forEach(([k, v]) => url.searchParams.set(k, v));

        link.href = url.toString();
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer sponsored');

        // Add small affiliate indicator on non-button links
        if (!link.classList.contains('btn') &&
            !link.querySelector('.aff-badge') &&
            link.textContent.trim().length > 0) {
          const badge = document.createElement('sup');
          badge.className = 'aff-badge';
          badge.style.cssText = 'font-size:0.55em;background:var(--accent-light);color:var(--accent);padding:1px 4px;border-radius:3px;margin-left:3px;font-weight:700;vertical-align:super;';
          badge.textContent = 'AD';
          link.appendChild(badge);
        }
      } catch (e) { /* skip invalid URLs */ }
    });
  }

  // Track clicks with GA4
  function trackClicks() {
    document.querySelectorAll('a[rel*="sponsored"]').forEach(link => {
      link.addEventListener('click', function() {
        try {
          const url      = new URL(this.href);
          const platform = Object.keys(affiliateConfig).find(k => url.hostname.includes(k)) || 'external';
          const card     = this.closest('.product-card');
          const product  = card?.querySelector('.product-name')?.textContent?.trim() || 'Unknown';
          const price    = card?.querySelector('.price-current')?.textContent?.trim() || '';

          if (typeof gtag === 'function') {
            gtag('event', 'affiliate_click', {
              event_category: 'Affiliate',
              event_label: platform,
              affiliate_platform: platform,
              product_name: product,
              product_price: price,
              page_url: window.location.pathname
            });
          }

          // Console log in dev
          console.log(`[Affiliate] ${platform} | ${product} | ${price}`);
        } catch (e) {}
      });
    });
  }

  // Cart wishlist tracking
  document.addEventListener('click', function(e) {
    const addCartBtn = e.target.closest('[data-add-cart]');
    if (addCartBtn) {
      const card    = addCartBtn.closest('.product-card');
      const name    = card?.querySelector('.product-name')?.textContent?.trim() || 'Product';
      const price   = card?.querySelector('.price-current')?.textContent?.trim() || '';
      const imgSrc  = card?.querySelector('.product-image img')?.src || '';
      const linkEl  = card?.querySelector('.btn-cart, .btn-cta');
      const buyUrl  = linkEl?.href || '#';

      const cart = JSON.parse(localStorage.getItem('meowmeow-cart') || '[]');
      const existing = cart.find(i => i.name === name);

      if (existing) {
        existing.qty = (existing.qty || 1) + 1;
      } else {
        cart.push({ name, price, imgSrc, buyUrl, qty: 1 });
      }

      localStorage.setItem('meowmeow-cart', JSON.stringify(cart));
      updateCartCount();
      window.showToast?.(`🛒 ${name} added!`, 'success');
    }
  });

  // Update cart count badge
  function updateCartCount() {
    const cart  = JSON.parse(localStorage.getItem('meowmeow-cart') || '[]');
    const count = cart.reduce((sum, i) => sum + (i.qty || 1), 0);
    document.querySelectorAll('#cartCount').forEach(el => {
      el.textContent = count;
      el.style.display = count > 0 ? 'flex' : 'none';
    });
  }

  document.addEventListener('DOMContentLoaded', function() {
    tagLinks();
    trackClicks();
    updateCartCount();
  });

  window.updateCartCount = updateCartCount;

})();
