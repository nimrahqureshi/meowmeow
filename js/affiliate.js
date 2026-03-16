/* ============================================================
   AFFILIATE.JS  v4.0 — MeowMeow
   Link Tagging · AD Badges · Click Tracking · Disclosure

   READ BEFORE EDITING — conflicts with every other JS file
   have been carefully resolved. Here is exactly what each
   file does that touches affiliate territory, and what this
   file does about it:

   ┌─────────────────┬────────────────────────────────────────────────────────────────┐
   │ OTHER FILE      │ CONFLICT & FIX                                                 │
   ├─────────────────┼────────────────────────────────────────────────────────────────┤
   │ navbar.js       │ Has its OWN disclosure close handler that calls .remove() on   │
   │                 │ the banner — no sessionStorage, no animation. Runs immediately  │
   │                 │ (not DOMContentLoaded). FIX: We check window._discBound before  │
   │                 │ binding. navbar.js runs first so it wins, but we patch it by   │
   │                 │ overriding its click handler with ours on DOMContentLoaded.     │
   ├─────────────────┼────────────────────────────────────────────────────────────────┤
   │ main.js         │ Has its OWN disclosure handler with sessionStorage. Binds on   │
   │                 │ DOMContentLoaded. FIX: window._discBound flag prevents both    │
   │                 │ main.js and this file from double-binding the same button.      │
   ├─────────────────┼────────────────────────────────────────────────────────────────┤
   │ script.js       │ Loops ALL a[target="_blank"] and sets rel="noopener noreferrer" │
   │                 │ (WITHOUT "sponsored") if no rel exists. Runs on page load       │
   │                 │ BEFORE DOMContentLoaded. FIX: We run processLinks() on         │
   │                 │ DOMContentLoaded, AFTER script.js. Our rel always includes     │
   │                 │ "sponsored" and we always overwrite whatever is there.          │
   ├─────────────────┼────────────────────────────────────────────────────────────────┤
   │ component.js    │ MutationObserver calls initQuickView(), initTooltips(),         │
   │                 │ initCopyButtons() on EVERY DOM mutation — including every card  │
   │                 │ affiliate-main renders. Our debounced observer also fires.      │
   │                 │ FIX: Both observers debounce. Our _affTagged guard means        │
   │                 │ processLinks() does nothing on already-processed links. Zero   │
   │                 │ performance impact from component.js triggering ours.           │
   ├─────────────────┼────────────────────────────────────────────────────────────────┤
   │ cart.js         │ MutationObserver calls bindAddToCartButtons() on every          │
   │                 │ mutation. Our cards use class "aff-cart-btn" not               │
   │                 │ "[data-add-to-cart]" so cart.js finds nothing to bind.          │
   │                 │ FIX: Already handled by affiliate-main.js class naming.         │
   ├─────────────────┼────────────────────────────────────────────────────────────────┤
   │ affiliate-main  │ Already bakes affiliate params + rel="sponsored" into every    │
   │ .js             │ rendered card link. FIX: We check if param already has correct  │
   │                 │ value before writing href (no URL corruption, no mutation loop).│
   │                 │ affiliate-main fires gtag "quick_view" — we fire               │
   │                 │ "affiliate_click" and "affiliate_buy_click" (no duplication).   │
   ├─────────────────┼────────────────────────────────────────────────────────────────┤
   │ scroll.js       │ Has its own filter binding on .filter-btn. No conflict with     │
   │                 │ affiliate.js — we don't touch filter buttons at all.            │
   └─────────────────┴────────────────────────────────────────────────────────────────┘

   CORRECT LOAD ORDER in HTML (before </body>):
     themes.js → main.js → navbar.js → search.js → scroll.js
     → script.js → cart.js → component.js
     → affiliate-amazon.js → affiliate-daraz.js
     → affiliate-temu.js → affiliate-aliexpress.js
     → affiliate-main.js → affiliate.js  ← LAST

   GA4 ID: G-8QLN8M6LJ3
   ============================================================ */

(function () {
  'use strict';

  /* ──────────────────────────────────────────────────
     1. PLATFORM CONFIG
     Domain → { param, value } for URL tagging.
     Matches affiliate-main.js config exactly.
  ────────────────────────────────────────────────── */

  var CONFIG = {
    'amazon.com':     { param: 'tag',           value: 'meowmeow-21'   },
    'amazon.co.uk':   { param: 'tag',           value: 'meowmeow-21'   },
    'amzn.to':        { param: 'tag',           value: 'meowmeow-21'   },
    'daraz.pk':       { param: 'aff_id',        value: 'MEOW123'       },
    'daraz.com':      { param: 'aff_id',        value: 'MEOW123'       },
    'temu.com':       { param: 'refer_aff_src', value: 'meowmeow'      },
    'aliexpress.com': { param: 'aff_platform',  value: 'meowmeow_site' },
    'aliexpress.us':  { param: 'aff_platform',  value: 'meowmeow_site' },
    'shein.com':      { param: 'url_from',      value: 'meowmeow'      },
    'shein.co.uk':    { param: 'url_from',      value: 'meowmeow'      }
  };

  var GA4_ID = 'G-8QLN8M6LJ3';

  /* ──────────────────────────────────────────────────
     2. HELPERS
  ────────────────────────────────────────────────── */

  /* Returns { domain, cfg } for a hostname, or null */
  function matchDomain(hostname) {
    var domains = Object.keys(CONFIG);
    for (var i = 0; i < domains.length; i++) {
      if (hostname.indexOf(domains[i]) !== -1) {
        return { domain: domains[i], cfg: CONFIG[domains[i]] };
      }
    }
    return null;
  }

  /* Returns platform slug: "amazon", "daraz", etc. */
  function getPlatformFromHostname(hostname) {
    var m = matchDomain(hostname);
    return m ? m.domain.split('.')[0] : 'unknown';
  }

  /*
   * Should this link get an AD badge?
   * NEVER badge:
   *   .btn          — product card buy/cart buttons
   *   nav           — site navigation
   *   footer        — footer links
   *   header        — header links
   *   .affiliate-tag already present
   *   empty text    — icon-only links
   */
  function shouldBadge(link) {
    if (link.classList.contains('btn'))       return false;
    if (link.closest('nav'))                  return false;
    if (link.closest('footer'))               return false;
    if (link.closest('header'))               return false;
    if (link.querySelector('.affiliate-tag')) return false;
    if ((link.textContent || '').trim() === '') return false;
    return true;
  }

  /* ──────────────────────────────────────────────────
     3. CORE: PROCESS LINKS
     Scans every <a href> and:
       • Injects affiliate param (only if not already correct)
       • Sets rel="noopener noreferrer sponsored"
       • Adds AD badge to plain text links
       • Attaches click tracker

     GUARD: link._affTagged → safe to call many times.
     After first pass each link is O(1) to skip.

     FIX vs script.js:
       script.js sets rel="noopener noreferrer" (no "sponsored")
       only when rel is absent. We run AFTER script.js on
       DOMContentLoaded and always overwrite rel to include
       "sponsored". This is the correct final value.

     FIX vs affiliate-main.js:
       affiliate-main bakes params into every card URL.
       We check existing param value before writing —
       if it's already correct we skip the href write,
       preventing a pointless DOM mutation that would
       re-trigger every other MutationObserver.
  ────────────────────────────────────────────────── */

  function processLinks() {
    var links = document.querySelectorAll('a[href]');

    for (var i = 0; i < links.length; i++) {
      var link = links[i];

      /* Already processed — O(1) skip */
      if (link._affTagged) continue;
      link._affTagged = true;

      var matched  = false;
      var platform = 'unknown';

      try {
        var url   = new URL(link.href);
        var match = matchDomain(url.hostname);

        if (match) {
          matched  = true;
          platform = match.domain.split('.')[0];

          /* ── INJECT PARAM (idempotent write) ── */
          var existing = url.searchParams.get(match.cfg.param);
          if (existing !== match.cfg.value) {
            url.searchParams.set(match.cfg.param, match.cfg.value);
            link.href = url.toString();
          }

          /* ── rel (always overwrite — fixes script.js "noopener noreferrer" without "sponsored") ── */
          link.setAttribute('target', '_blank');
          link.setAttribute('rel', 'noopener noreferrer sponsored');

          /* ── AD BADGE on plain text links only ── */
          if (shouldBadge(link)) {
            var badge = document.createElement('sup');
            badge.className   = 'affiliate-tag';
            badge.textContent = 'AD';
            badge.setAttribute('aria-label', 'Affiliate link');
            badge.setAttribute('title', 'Affiliate link — we may earn a commission');
            link.appendChild(badge);
          }
        }

      } catch (e) {
        /* Relative, blob:, data:, mailto: — skip silently */
      }

      /* ── CLICK TRACKER (affiliate links only) ── */
      if (matched) {
        /* Closure to capture platform per link */
        (function (l, p) {
          l.addEventListener('click', function () {
            trackLinkClick(l, p);
          });
        }(link, platform));
      }
    }
  }

  /* ──────────────────────────────────────────────────
     4. GA4 CLICK TRACKING

     Events fired:
       affiliate_buy_click  — link inside .product-card
       affiliate_click      — any other affiliate link

     affiliate-main.js fires "quick_view" — we never
     fire that event here. No duplication.
  ────────────────────────────────────────────────── */

  function trackLinkClick(link, platform) {
    try {
      var card        = link.closest('.product-card');
      var productName = (
        (card && card.querySelector('.product-name') && card.querySelector('.product-name').textContent.trim()) ||
        link.getAttribute('aria-label') ||
        link.getAttribute('title') ||
        (link.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 80) ||
        'Direct Link'
      );

      var eventName = card ? 'affiliate_buy_click' : 'affiliate_click';

      if (typeof gtag === 'function') {
        gtag('event', eventName, {
          send_to:            GA4_ID,
          affiliate_platform: platform,
          product_name:       productName,
          link_url:           link.href,
          page_path:          window.location.pathname
        });
      }

      /* Legacy Universal Analytics */
      if (typeof ga === 'function') {
        ga('send', 'event', 'Affiliate', 'Click', platform + ' — ' + productName);
      }

    } catch (e) { /* never crash on tracking */ }
  }

  /* ──────────────────────────────────────────────────
     5. CARD-LEVEL BUY CLICK — delegated from document
     Catches "Buy on X" links inside .product-card that
     are injected dynamically by affiliate-main.js.
     Uses event delegation so no per-card binding needed
     and no conflict with component.js / cart.js.
  ────────────────────────────────────────────────── */

  function initCardBuyTracking() {
    document.addEventListener('click', function (e) {
      var link = e.target.closest
        ? e.target.closest('.product-card a[rel~="sponsored"]')
        : null;
      if (!link) return;

      try {
        var hostname = new URL(link.href).hostname;
        var platform = getPlatformFromHostname(hostname);
        trackLinkClick(link, platform);
      } catch (e) {}
    });
  }

  /* ──────────────────────────────────────────────────
     6. DISCLOSURE BANNER

     THREE files touch #affiliateDisclosure:
       navbar.js  — binds click, calls .remove() (no sessionStorage)
       main.js    — binds click on DOMContentLoaded (has sessionStorage)
       affiliate.js (this file) — canonical handler

     FIX STRATEGY:
       • We use window._discBound to let only ONE handler win.
       • We run on DOMContentLoaded (AFTER navbar.js and main.js
         have already bound their handlers).
       • We REPLACE the close button's event listeners by cloning
         the button — this removes navbar.js's .remove() handler
         AND main.js's handler in one shot.
       • Our handler: smooth CSS animation + sessionStorage persist.
       • sessionStorage key: 'meowmeow-disclosure-closed'
         (matches main.js — so if main.js ran first it's still compatible)
  ────────────────────────────────────────────────── */

  function initDisclosure() {
    /* Only one file should own this */
    if (window._discBound) return;
    window._discBound = true;

    var banner  = document.getElementById('affiliateDisclosure');
    var closeEl = document.getElementById('disclosureClose');

    if (!banner) return;

    /* Already dismissed this session? */
    try {
      if (sessionStorage.getItem('meowmeow-disclosure-closed') === '1') {
        banner.style.display = 'none';
        return;
      }
    } catch (e) {}

    /* Make sure it is visible */
    banner.style.display   = '';
    banner.style.opacity   = '';
    banner.style.transform = '';

    if (!closeEl) return;

    /*
     * CLONE the close button to strip ALL previously bound handlers
     * (navbar.js binds synchronously before DOMContentLoaded).
     * The clone inherits the element but not the listeners.
     */
    var freshClose = closeEl.cloneNode(true);
    closeEl.parentNode.replaceChild(freshClose, closeEl);

    freshClose.addEventListener('click', function () {
      /* Smooth slide-up + fade */
      banner.style.transition  = 'opacity 0.35s ease, transform 0.35s ease, max-height 0.4s ease, padding 0.4s ease, margin 0.4s ease';
      banner.style.overflow    = 'hidden';
      banner.style.maxHeight   = banner.offsetHeight + 'px';

      /* Trigger reflow so transition plays */
      void banner.offsetHeight;

      banner.style.opacity   = '0';
      banner.style.transform = 'translateY(-10px)';
      banner.style.maxHeight = '0';
      banner.style.padding   = '0';
      banner.style.margin    = '0';

      setTimeout(function () {
        banner.style.display = 'none';
      }, 420);

      try {
        sessionStorage.setItem('meowmeow-disclosure-closed', '1');
      } catch (e) {}
    });
  }

  /* ──────────────────────────────────────────────────
     7. AFFILIATE-TAG STYLES (self-contained)
     Injected into <head> once. Works even when base.css
     is not loaded. Uses CSS variables with fallbacks.
  ────────────────────────────────────────────────── */

  function injectTagStyles() {
    if (document.getElementById('aff-tag-styles')) return;

    var style = document.createElement('style');
    style.id  = 'aff-tag-styles';
    style.textContent = [
      '.affiliate-tag {',
      '  display: inline-block;',
      '  font-size: 0.58em;',
      '  font-weight: 700;',
      '  line-height: 1;',
      '  padding: 2px 5px;',
      '  margin-left: 5px;',
      '  border-radius: 3px;',
      '  background: var(--warning, #F59E0B);',
      '  color: #fff;',
      '  vertical-align: super;',
      '  letter-spacing: 0.04em;',
      '  text-transform: uppercase;',
      '  cursor: default;',
      '  pointer-events: none;',
      '  user-select: none;',
      '  font-family: var(--font-body, Inter, sans-serif);',
      '}',
      '[data-theme="dark"] .affiliate-tag {',
      '  background: var(--warning, #D97706);',
      '}'
    ].join('\n');

    document.head.appendChild(style);
  }

  /* ──────────────────────────────────────────────────
     8. DNS PRECONNECT HINTS
     Adds <link rel="preconnect"> for affiliate domains.
     Browser resolves DNS before user clicks Buy Now.
     Only added if not already present.
  ────────────────────────────────────────────────── */

  function addPreconnects() {
    var origins = [
      'https://www.amazon.com',
      'https://www.daraz.pk',
      'https://www.temu.com',
      'https://www.aliexpress.com'
    ];

    origins.forEach(function (origin) {
      if (!document.querySelector('link[rel="preconnect"][href="' + origin + '"]')) {
        var link  = document.createElement('link');
        link.rel  = 'preconnect';
        link.href = origin;
        document.head.appendChild(link);
      }
    });
  }

  /* ──────────────────────────────────────────────────
     9. PAGE VIEW TRACKING
     One GA4 event per page load to track which pages
     drive affiliate clicks. Fires after gtag is ready.
  ────────────────────────────────────────────────── */

  function trackPageView() {
    try {
      if (typeof gtag !== 'function') return;
      gtag('event', 'affiliate_page_view', {
        send_to:       GA4_ID,
        page_title:    document.title,
        page_location: window.location.href,
        page_path:     window.location.pathname
      });
    } catch (e) {}
  }

  /* ──────────────────────────────────────────────────
     10. DEBOUNCED MUTATION OBSERVER
     Collapses rapid DOM bursts (affiliate-main injecting
     12 cards, component.js re-binding tooltips, cart.js
     re-binding buttons) into ONE processLinks() call.

     DEBOUNCE = 250ms — longer than component.js's implied
     synchronous re-run to ensure we run last.

     processLinks() is O(new links only) due to _affTagged
     so firing this 100 times costs nothing after first pass.
  ────────────────────────────────────────────────── */

  var _debounceTimer = null;

  function scheduleProcess() {
    clearTimeout(_debounceTimer);
    _debounceTimer = setTimeout(processLinks, 250);
  }

  /* ──────────────────────────────────────────────────
     11. PUBLIC API
     window.MeowAffiliate — shared with affiliate-main.js
     which also writes to this object. We use Object.assign
     so both files can contribute methods safely.
  ────────────────────────────────────────────────── */

  window.MeowAffiliate = window.MeowAffiliate || {};

  Object.assign(window.MeowAffiliate, {

    /**
     * Re-tag all links manually after injecting HTML.
     * Usage: window.MeowAffiliate.tag()
     */
    tag: processLinks,

    /**
     * Get the affiliate config for a URL.
     * Usage: window.MeowAffiliate.getConfig('https://amazon.com/dp/...')
     * Returns: { param, value } or null
     */
    getConfig: function (urlStr) {
      try {
        var m = matchDomain(new URL(urlStr).hostname);
        return m ? m.cfg : null;
      } catch (e) { return null; }
    },

    /**
     * Get the platform name for a URL.
     * Usage: window.MeowAffiliate.getPlatform('https://daraz.pk/...')
     * Returns: "daraz" | "amazon" | "temu" | "aliexpress" | "unknown"
     */
    getPlatform: function (urlStr) {
      try {
        return getPlatformFromHostname(new URL(urlStr).hostname);
      } catch (e) { return 'unknown'; }
    },

    /**
     * Manually fire a click tracking event.
     * Usage: window.MeowAffiliate.trackClick(linkEl, 'amazon')
     */
    trackClick: trackLinkClick,

    /**
     * Show the disclosure banner again (e.g. after navigation).
     * Usage: window.MeowAffiliate.showDisclosure()
     */
    showDisclosure: function () {
      var banner = document.getElementById('affiliateDisclosure');
      if (!banner) return;
      banner.style.cssText = '';
      banner.style.display = '';
      try { sessionStorage.removeItem('meowmeow-disclosure-closed'); } catch (e) {}
      /* Reset _discBound so initDisclosure() can re-bind */
      window._discBound = false;
      initDisclosure();
    },

    /** All configured affiliate domains */
    domains: Object.keys(CONFIG),

    /** Version */
    version: '4.0'
  });

  /* ──────────────────────────────────────────────────
     12. INIT
  ────────────────────────────────────────────────── */

  function init() {
    /* Run styles + preconnects immediately (no DOM needed) */
    injectTagStyles();
    addPreconnects();

    /* processLinks + disclosure need DOM */
    processLinks();
    initDisclosure();
    initCardBuyTracking();
    trackPageView();

    /* Watch for dynamic content */
    if (typeof MutationObserver !== 'undefined') {
      var observer = new MutationObserver(scheduleProcess);
      observer.observe(document.body, {
        childList: true,
        subtree:   true
      });
    }
  }

  /*
   * Run as late as possible so we run AFTER:
   *   navbar.js (sync, already ran)
   *   main.js DOMContentLoaded
   *   script.js (sync, already ran — sets rel without "sponsored")
   *
   * DOMContentLoaded fires after all sync scripts have run.
   * If it has already fired (script at end of body), run now.
   */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
