/* ============================
   AFFILIATE.JS — AFFILIATE LINK MANAGEMENT  (FIXED v2)
   Runs LAST — after all other JS
   ============================ */

(function () {
  'use strict';

  var AFFILIATES = [
    { domain: 'amazon.com',     param: 'tag',           value: 'meowmeow-21'   },
    { domain: 'aliexpress.com', param: 'aff_platform',  value: 'meowmeow_site' },
    { domain: 'daraz.pk',       param: 'aff_id',        value: 'MEOW123'       },
    { domain: 'temu.com',       param: 'refer_aff_src', value: 'meowmeow'      }
  ];

  /* ─── TAG ALL AFFILIATE LINKS ─── */
  function tagLinks() {
    document.querySelectorAll('a[href]').forEach(function (link) {
      var href = link.getAttribute('href') || '';
      if (!href || href.charAt(0) === '#' || href.indexOf('http') === -1) return;

      var isAffiliate = false;
      AFFILIATES.forEach(function (aff) {
        if (href.indexOf(aff.domain) !== -1) {
          isAffiliate = true;
          try {
            var url = new URL(link.href);
            url.searchParams.set(aff.param, aff.value);
            link.href = url.toString();
          } catch (e) {}
        }
      });

      if (link.target === '_blank' || isAffiliate) {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', isAffiliate
          ? 'noopener noreferrer sponsored'
          : 'noopener noreferrer');
      }
    });
  }

  /* ─── DISCLOSURE BANNER ─── */
  function initDisclosure() {
    var closeBtn   = document.getElementById('disclosureClose');
    var disclosure = document.getElementById('affiliateDisclosure');
    if (!closeBtn || !disclosure || closeBtn._affBound) return;
    closeBtn._affBound = true;

    try {
      if (sessionStorage.getItem('meowmeow-disclosure-closed') === '1') {
        disclosure.style.display = 'none';
        return;
      }
    } catch (e) {}

    closeBtn.addEventListener('click', function () {
      disclosure.style.transition = 'opacity .3s ease, transform .3s ease';
      disclosure.style.opacity    = '0';
      disclosure.style.transform  = 'translateY(-10px)';
      setTimeout(function () { disclosure.style.display = 'none'; }, 320);
      try { sessionStorage.setItem('meowmeow-disclosure-closed', '1'); } catch (e) {}
    });
  }

  /* ─── GA4 CLICK TRACKING ─── */
  function trackClicks() {
    document.querySelectorAll('a[rel*="sponsored"]:not([data-aff-tracked])').forEach(function (link) {
      link.setAttribute('data-aff-tracked', '1');
      link.addEventListener('click', function () {
        try {
          if (typeof gtag === 'function') {
            gtag('event', 'affiliate_click', {
              link_url:  this.href,
              link_text: this.textContent.trim().slice(0, 100)
            });
          }
        } catch (e) {}
      });
    });
  }

  /* ─── INIT ─── */
  document.addEventListener('DOMContentLoaded', function () {
    tagLinks();
    initDisclosure();
    trackClicks();

    /* Re-tag when render-*.js injects new product cards */
    if ('MutationObserver' in window) {
      var mo = new MutationObserver(function () { tagLinks(); trackClicks(); });
      mo.observe(document.body, { childList: true, subtree: true });
    }
  });

})();
