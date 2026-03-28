/* ============================
   AFFILIATE.JS  v4.0 — MeowMeow
   Link Tagging · AD Badges · Click Tracking · Disclosure
   LOAD LAST — runs after all other JS files
   ============================ */

(function () {
  'use strict';

  var CONFIG = {
    'amazon.com':     { param: 'tag',           value: 'meowmeow-21'   },
    'amazon.co.uk':   { param: 'tag',           value: 'meowmeow-21'   },
    'amzn.to':        { param: 'tag',           value: 'meowmeow-21'   },
    'daraz.pk':       { param: 'aff_id',        value: 'MEOW123'       },
    'daraz.com':      { param: 'aff_id',        value: 'MEOW123'       },
    'temu.com':       { param: 'refer_aff_src', value: 'meowmeow'      },
    'aliexpress.com': { param: 'aff_platform',  value: 'meowmeow_site' },
    'aliexpress.us':  { param: 'aff_platform',  value: 'meowmeow_site' },
    'shein.com':      { param: 'url_from',      value: 'meowmeow'      }
  };

  var GA4_ID = 'G-8QLN8M6LJ3';

  function matchDomain(hostname) {
    var domains = Object.keys(CONFIG);
    for (var i = 0; i < domains.length; i++) {
      if (hostname.indexOf(domains[i]) !== -1) return { domain: domains[i], cfg: CONFIG[domains[i]] };
    }
    return null;
  }

  function getPlatform(hostname) {
    var m = matchDomain(hostname);
    return m ? m.domain.split('.')[0] : 'unknown';
  }

  function shouldBadge(link) {
    if (link.classList.contains('btn')) return false;
    if (link.closest('nav')) return false;
    if (link.closest('footer')) return false;
    if (link.closest('header')) return false;
    if (link.querySelector('.affiliate-tag')) return false;
    if ((link.textContent || '').trim() === '') return false;
    return true;
  }

  function processLinks() {
    var links = document.querySelectorAll('a[href]');
    for (var i = 0; i < links.length; i++) {
      var link = links[i];
      if (link._affTagged) continue;
      link._affTagged = true;
      var matched = false, platform = 'unknown';
      try {
        var url   = new URL(link.href);
        var match = matchDomain(url.hostname);
        if (match) {
          matched  = true;
          platform = match.domain.split('.')[0];
          if (url.searchParams.get(match.cfg.param) !== match.cfg.value) {
            url.searchParams.set(match.cfg.param, match.cfg.value);
            link.href = url.toString();
          }
          link.setAttribute('target', '_blank');
          link.setAttribute('rel', 'noopener noreferrer sponsored');
          if (shouldBadge(link)) {
            var badge = document.createElement('sup');
            badge.className = 'affiliate-tag'; badge.textContent = 'AD';
            badge.setAttribute('aria-label', 'Affiliate link');
            badge.setAttribute('title', 'Affiliate link — we may earn a commission');
            link.appendChild(badge);
          }
        }
      } catch (e) {}
      if (matched) {
        (function (l, p) {
          l.addEventListener('click', function () { trackClick(l, p); });
        }(link, platform));
      }
    }
  }

  function trackClick(link, platform) {
    try {
      var card = link.closest('.product-card');
      var name = (card && card.querySelector('.product-name') && card.querySelector('.product-name').textContent.trim()) ||
                 link.textContent.trim().slice(0, 80) || 'Link';
      var ev   = card ? 'affiliate_buy_click' : 'affiliate_click';
      if (typeof gtag === 'function') gtag('event', ev, { send_to: GA4_ID, affiliate_platform: platform, product_name: name, link_url: link.href });
    } catch (e) {}
  }

  function initCardBuyTracking() {
    document.addEventListener('click', function (e) {
      var link = e.target.closest ? e.target.closest('.product-card a[rel~="sponsored"]') : null;
      if (!link) return;
      try { trackClick(link, getPlatform(new URL(link.href).hostname)); } catch (e) {}
    });
  }

  function initDisclosure() {
    if (window._discBound) return;
    var banner = document.getElementById('affiliateDisclosure');
    var closeEl = document.getElementById('disclosureClose');
    if (!banner) return;
    try { if (sessionStorage.getItem('meowmeow-disclosure-closed') === '1') { banner.style.display = 'none'; return; } } catch (e) {}
    banner.style.display = '';
    if (!closeEl) return;
    /* Clone to strip earlier handlers from navbar.js / main.js */
    var fresh = closeEl.cloneNode(true);
    closeEl.parentNode.replaceChild(fresh, closeEl);
    window._discBound = true;
    fresh.addEventListener('click', function () {
      banner.style.transition = 'opacity .35s ease,transform .35s ease,max-height .4s ease,padding .4s ease,margin .4s ease';
      banner.style.overflow   = 'hidden';
      banner.style.maxHeight  = banner.offsetHeight + 'px';
      void banner.offsetHeight;
      banner.style.opacity = '0'; banner.style.transform = 'translateY(-10px)';
      banner.style.maxHeight = '0'; banner.style.padding = '0'; banner.style.margin = '0';
      setTimeout(function () { banner.style.display = 'none'; }, 420);
      try { sessionStorage.setItem('meowmeow-disclosure-closed', '1'); } catch (e) {}
    });
  }

  function injectTagStyles() {
    if (document.getElementById('aff-tag-styles')) return;
    var s = document.createElement('style'); s.id = 'aff-tag-styles';
    s.textContent = '.affiliate-tag{display:inline-block;font-size:.58em;font-weight:700;line-height:1;padding:2px 5px;margin-left:5px;border-radius:3px;background:var(--warning,#F59E0B);color:#fff;vertical-align:super;letter-spacing:.04em;text-transform:uppercase;cursor:default;pointer-events:none;user-select:none;}[data-theme="dark"] .affiliate-tag{background:var(--warning,#D97706);}';
    document.head.appendChild(s);
  }

  function addPreconnects() {
    ['https://www.amazon.com','https://www.daraz.pk','https://www.temu.com','https://www.aliexpress.com'].forEach(function (origin) {
      if (!document.querySelector('link[rel="preconnect"][href="' + origin + '"]')) {
        var l = document.createElement('link'); l.rel = 'preconnect'; l.href = origin; document.head.appendChild(l);
      }
    });
  }

  function trackPageView() {
    try { if (typeof gtag === 'function') gtag('event','affiliate_page_view',{send_to:GA4_ID,page_title:document.title,page_location:window.location.href,page_path:window.location.pathname}); } catch (e) {}
  }

  var _debounce = null;
  function schedule() { clearTimeout(_debounce); _debounce = setTimeout(processLinks, 250); }

  window.MeowAffiliate = window.MeowAffiliate || {};
  Object.assign(window.MeowAffiliate, {
    tag:        processLinks,
    getConfig:  function (url) { try { var m = matchDomain(new URL(url).hostname); return m ? m.cfg : null; } catch (e) { return null; } },
    getPlatform:function (url) { try { return getPlatform(new URL(url).hostname); } catch (e) { return 'unknown'; } },
    trackClick: trackClick,
    showDisclosure: function () {
      var b = document.getElementById('affiliateDisclosure'); if (!b) return;
      b.style.cssText = ''; b.style.display = '';
      try { sessionStorage.removeItem('meowmeow-disclosure-closed'); } catch (e) {}
      window._discBound = false; initDisclosure();
    },
    domains: Object.keys(CONFIG),
    version: '4.0'
  });

  function init() {
    injectTagStyles(); addPreconnects();
    processLinks(); initDisclosure(); initCardBuyTracking(); trackPageView();
    if (typeof MutationObserver !== 'undefined') {
      new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
