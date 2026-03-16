/* ============================
   COMPONENT.JS — REUSABLE UI COMPONENTS
   Quick View Modal, Filters, Accordion/FAQ,
   Help Cards, Tooltips, Copy Button, Tabs
   ============================ */

(function() {
  'use strict';

  /* ─────────────────────────────
     QUICK VIEW MODAL
  ───────────────────────────── */

  function initQuickView() {
    // Create modal DOM once
    if (!document.getElementById('quickViewModal')) {
      const modal = document.createElement('div');
      modal.id = 'quickViewModal';
      modal.className = 'modal-overlay';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-label', 'Quick view');
      modal.innerHTML = `
        <div class="modal-box">
          <button class="modal-close" id="quickViewClose" aria-label="Close">
            <i class="fas fa-times"></i>
          </button>
          <div class="modal-body" id="quickViewBody">
            <!-- populated dynamically -->
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      // Close on overlay click
      modal.addEventListener('click', e => {
        if (e.target === modal) closeQuickView();
      });

      // Close on Escape
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeQuickView();
      });

      document.getElementById('quickViewClose')?.addEventListener('click', closeQuickView);
    }

    // Bind all quick-view buttons
    document.querySelectorAll('.quick-view-btn:not([data-qv-bound])').forEach(btn => {
      btn.setAttribute('data-qv-bound', '1');
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const card = this.closest('.product-card');
        if (!card) return;

        const name        = card.querySelector('.product-name')?.textContent?.trim() || 'Product';
        const price       = card.querySelector('.price-current')?.textContent?.trim() || '';
        const origPrice   = card.querySelector('.price-original')?.textContent?.trim() || '';
        const img         = card.querySelector('img')?.src || '';
        const rating      = card.querySelector('.product-rating')?.innerHTML || '';
        const marketplace = card.querySelector('.product-marketplace')?.textContent?.trim() || '';
        const buyLink     = card.querySelector('a.btn-cta')?.href || '#';

        document.getElementById('quickViewBody').innerHTML = `
          <div class="qv-grid">
            <div class="qv-image">
              <img src="${img}" alt="${escapeHtml(name)}" />
            </div>
            <div class="qv-info">
              <div class="product-marketplace"><i class="fas fa-globe"></i> ${escapeHtml(marketplace)}</div>
              <h2 class="qv-title">${escapeHtml(name)}</h2>
              <div class="product-rating">${rating}</div>
              <div class="product-price">
                <span class="price-current">${escapeHtml(price)}</span>
                ${origPrice ? `<span class="price-original">${escapeHtml(origPrice)}</span>` : ''}
              </div>
              <div class="qv-actions">
                <a href="${buyLink}" class="btn btn-cta btn-lg btn-3d" target="_blank" rel="noopener noreferrer sponsored">
                  <i class="fas fa-shopping-cart"></i> Buy Now
                </a>
                <button class="btn btn-outline btn-lg wishlist-toggle" aria-label="Add to wishlist">
                  <i class="far fa-heart"></i> Wishlist
                </button>
              </div>
              <p class="qv-note"><i class="fas fa-shield-alt"></i> Redirects to official seller — secured checkout</p>
            </div>
          </div>
        `;

        openQuickView();
      });
    });
  }

  function openQuickView() {
    const modal = document.getElementById('quickViewModal');
    if (!modal) return;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeQuickView() {
    const modal = document.getElementById('quickViewModal');
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  /* ─────────────────────────────
     PRODUCT FILTER TABS
  ───────────────────────────── */

  function initProductFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    if (!filterBtns.length) return;

    filterBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        // Update active state
        filterBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        const category = this.dataset.filter || 'all';
        const cards = document.querySelectorAll('.product-card[data-category]');

        cards.forEach((card, i) => {
          const match = category === 'all' || card.dataset.category === category;
          if (match) {
            card.style.display = '';
            card.style.animationDelay = (i % 8 * 0.05) + 's';
            card.classList.remove('card-enter');
            void card.offsetWidth;
            card.classList.add('card-enter');
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  /* ─────────────────────────────
     FAQ / ACCORDION
  ───────────────────────────── */

  function initAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    if (!faqItems.length) return;

    faqItems.forEach(item => {
      const question = item.querySelector('h3');
      if (!question) return;

      // Add toggle icon if not present
      if (!question.querySelector('.faq-icon')) {
        const icon = document.createElement('i');
        icon.className = 'fas fa-chevron-down faq-icon';
        icon.style.cssText = 'float:right; transition:transform 0.3s ease; color:var(--accent);';
        question.appendChild(icon);
      }

      const answer = item.querySelector('p, .faq-answer');
      if (answer) {
        answer.style.overflow  = 'hidden';
        answer.style.transition = 'max-height 0.35s ease, opacity 0.35s ease';
        answer.style.maxHeight = '0';
        answer.style.opacity   = '0';
        item.classList.add('faq-closed');
      }

      question.style.cursor = 'pointer';
      question.style.userSelect = 'none';

      question.addEventListener('click', () => {
        const isOpen = item.classList.contains('faq-open');

        // Close all others
        faqItems.forEach(other => {
          if (other !== item && other.classList.contains('faq-open')) {
            const ans = other.querySelector('p, .faq-answer');
            const ico = other.querySelector('.faq-icon');
            if (ans) { ans.style.maxHeight = '0'; ans.style.opacity = '0'; }
            if (ico)  ico.style.transform = 'rotate(0deg)';
            other.classList.replace('faq-open', 'faq-closed');
          }
        });

        // Toggle current
        if (!isOpen) {
          if (answer) { answer.style.maxHeight = answer.scrollHeight + 'px'; answer.style.opacity = '1'; }
          const ico = question.querySelector('.faq-icon');
          if (ico) ico.style.transform = 'rotate(180deg)';
          item.classList.replace('faq-closed', 'faq-open');
        } else {
          if (answer) { answer.style.maxHeight = '0'; answer.style.opacity = '0'; }
          const ico = question.querySelector('.faq-icon');
          if (ico) ico.style.transform = 'rotate(0deg)';
          item.classList.replace('faq-open', 'faq-closed');
        }
      });
    });
  }

  /* ─────────────────────────────
     HELP CARDS (help.html)
  ───────────────────────────── */

  function initHelpCards() {
    document.querySelectorAll('.help-card').forEach(card => {
      card.addEventListener('mouseenter', function() {
        this.querySelector('.help-icon')?.classList.add('animate-pulse');
      });
      card.addEventListener('mouseleave', function() {
        this.querySelector('.help-icon')?.classList.remove('animate-pulse');
      });
    });
  }

  /* ─────────────────────────────
     TOOLTIP
  ───────────────────────────── */

  function initTooltips() {
    document.querySelectorAll('[data-tooltip]:not([data-tt-bound])').forEach(el => {
      el.setAttribute('data-tt-bound', '1');

      let tip = null;

      el.addEventListener('mouseenter', function() {
        tip = document.createElement('div');
        tip.className = 'tooltip-bubble';
        tip.textContent = this.dataset.tooltip;
        tip.style.cssText = `
          position:fixed;
          background:var(--bg-secondary);
          color:var(--text-primary);
          border:1px solid var(--border);
          padding:6px 12px;
          border-radius:var(--radius-md);
          font-size:0.8rem;
          white-space:nowrap;
          z-index:9999;
          box-shadow:var(--shadow-md);
          pointer-events:none;
          animation:fadeInUp 0.2s ease;
        `;
        document.body.appendChild(tip);

        const rect = this.getBoundingClientRect();
        tip.style.left = rect.left + rect.width / 2 - tip.offsetWidth / 2 + 'px';
        tip.style.top  = rect.top - tip.offsetHeight - 8 + 'px';
      });

      el.addEventListener('mouseleave', () => {
        if (tip) { tip.remove(); tip = null; }
      });
    });
  }

  /* ─────────────────────────────
     COPY-TO-CLIPBOARD
  ───────────────────────────── */

  function initCopyButtons() {
    document.querySelectorAll('[data-copy]:not([data-copy-bound])').forEach(btn => {
      btn.setAttribute('data-copy-bound', '1');
      btn.addEventListener('click', function() {
        const text = this.dataset.copy;
        navigator.clipboard?.writeText(text).then(() => {
          const orig = this.innerHTML;
          this.innerHTML = '<i class="fas fa-check"></i> Copied!';
          setTimeout(() => { this.innerHTML = orig; }, 2000);
          if (typeof window.showToast === 'function') {
            window.showToast('Copied to clipboard!', 'success');
          }
        }).catch(() => {
          if (typeof window.showToast === 'function') {
            window.showToast('Could not copy. Please copy manually.', 'warning');
          }
        });
      });
    });
  }

  /* ─────────────────────────────
     TABS
  ───────────────────────────── */

  function initTabs() {
    document.querySelectorAll('.tabs-container').forEach(container => {
      const tabs    = container.querySelectorAll('.tab-btn');
      const panels  = container.querySelectorAll('.tab-panel');

      tabs.forEach(tab => {
        tab.addEventListener('click', function() {
          tabs.forEach(t  => t.classList.remove('active'));
          panels.forEach(p => { p.style.display = 'none'; p.classList.remove('active'); });

          this.classList.add('active');
          const target = document.getElementById(this.dataset.tab);
          if (target) {
            target.style.display = '';
            target.classList.add('active');
            target.classList.add('animate-fade-in');
          }
        });
      });

      // Activate first tab by default
      if (tabs[0]) tabs[0].click();
    });
  }

  /* ─────────────────────────────
     MODAL CSS (injected once)
  ───────────────────────────── */

  function injectModalStyles() {
    if (document.getElementById('component-styles')) return;
    const style = document.createElement('style');
    style.id = 'component-styles';
    style.textContent = `
      /* Quick View Modal */
      .modal-overlay {
        position: fixed; inset: 0;
        background: rgba(0,0,0,0.65);
        backdrop-filter: blur(6px);
        display: flex; align-items: center; justify-content: center;
        z-index: var(--z-modal);
        opacity: 0; visibility: hidden;
        transition: opacity 0.3s ease, visibility 0.3s ease;
        padding: 16px;
      }
      .modal-overlay.active { opacity: 1; visibility: visible; }
      .modal-box {
        background: var(--bg-secondary);
        border: 1px solid var(--border);
        border-radius: var(--radius-xl);
        padding: 32px;
        max-width: 860px; width: 100%;
        max-height: 90vh; overflow-y: auto;
        position: relative;
        transform: scale(0.92) translateY(20px);
        transition: transform 0.3s ease;
        box-shadow: var(--shadow-2xl);
      }
      .modal-overlay.active .modal-box {
        transform: scale(1) translateY(0);
      }
      .modal-close {
        position: absolute; top: 16px; right: 16px;
        width: 36px; height: 36px;
        background: var(--bg-tertiary);
        border-radius: var(--radius-full);
        display: flex; align-items: center; justify-content: center;
        color: var(--text-primary);
        font-size: 1rem;
        transition: var(--transition-fast);
        cursor: pointer;
      }
      .modal-close:hover { background: var(--danger); color: #fff; }

      /* QV grid */
      .qv-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 32px;
        align-items: start;
      }
      @media (max-width: 640px) { .qv-grid { grid-template-columns: 1fr; } }
      .qv-image img {
        width: 100%; border-radius: var(--radius-lg);
        box-shadow: var(--shadow-lg);
      }
      .qv-title {
        font-size: 1.3rem; margin: 8px 0 12px;
        color: var(--text-primary);
      }
      .qv-actions { display: flex; flex-wrap: wrap; gap: 12px; margin: 20px 0 12px; }
      .qv-note {
        font-size: 0.78rem; color: var(--text-tertiary);
        display: flex; align-items: center; gap: 6px;
      }

      /* Help cards grid */
      .help-cards-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 24px;
        margin-top: 20px;
      }
      .help-card {
        display: block;
        background: var(--bg-secondary);
        border: 1px solid var(--border);
        border-radius: var(--radius-lg);
        padding: 32px 24px;
        text-align: center;
        text-decoration: none;
        transition: var(--transition);
        box-shadow: var(--shadow-sm);
        color: var(--text-primary);
      }
      .help-card:hover {
        transform: translateY(-6px);
        box-shadow: var(--shadow-xl);
        border-color: var(--accent);
      }
      .help-icon {
        width: 64px; height: 64px;
        margin: 0 auto 16px;
        background: var(--accent-light);
        border-radius: var(--radius-lg);
        display: flex; align-items: center; justify-content: center;
        font-size: 1.6rem; color: var(--accent);
        transition: var(--transition);
      }
      .help-card:hover .help-icon {
        background: var(--accent); color: #fff;
        transform: scale(1.1);
        box-shadow: var(--shadow-glow-accent);
      }
      .help-card h3 { font-size: 1.05rem; margin-bottom: 6px; }
      .help-card p  { font-size: 0.88rem; color: var(--text-secondary); margin: 0; }

      /* Info cards (shipping, returns) */
      .info-card {
        background: var(--accent-light);
        border: 1px solid var(--accent);
        border-radius: var(--radius-lg);
        padding: 24px 28px;
        margin-bottom: 32px;
      }
      .info-card h2 { color: var(--accent); margin-bottom: 8px; }
      .info-sections {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 24px;
        margin: 32px 0;
      }
      .info-section {
        background: var(--bg-secondary);
        border: 1px solid var(--border);
        border-radius: var(--radius-lg);
        padding: 24px;
        box-shadow: var(--shadow-sm);
      }
      .info-section h3 {
        display: flex; align-items: center; gap: 10px;
        font-size: 1.05rem; margin-bottom: 12px; color: var(--accent);
      }
      .info-section h3 i { font-size: 1.1rem; }
      .info-section ul, .info-section ol {
        padding-left: 20px; list-style: disc;
      }
      .info-section ol { list-style: decimal; }
      .info-section li { margin-bottom: 6px; color: var(--text-secondary); font-size: 0.95rem; }
      .alert-box {
        background: var(--info-light);
        border-left: 4px solid var(--info);
        border-radius: var(--radius-md);
        padding: 16px 20px;
        font-size: 0.92rem;
        color: var(--text-secondary);
        display: flex; align-items: flex-start; gap: 10px;
        margin: 24px 0;
      }
      .alert-box.alert-warning {
        background: var(--warning-light);
        border-left-color: var(--warning);
      }
      .alert-box i { color: var(--info); flex-shrink: 0; margin-top: 2px; }
      .alert-box.alert-warning i { color: var(--warning); }

      /* Tab active */
      .tab-btn { cursor: pointer; padding: 10px 20px; border-radius: var(--radius-full); background: var(--bg-tertiary); border: 1px solid var(--border); font-weight: 600; transition: var(--transition-fast); color: var(--text-secondary); }
      .tab-btn.active { background: var(--accent); color: #fff; border-color: var(--accent); }
      .tab-panel { display: none; }
      .tab-panel.active { display: block; }
    `;
    document.head.appendChild(style);
  }

  /* ─────────────────────────────
     XSS HELPER
  ───────────────────────────── */

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* ─────────────────────────────
     INIT ALL COMPONENTS
  ───────────────────────────── */

  document.addEventListener('DOMContentLoaded', () => {
    injectModalStyles();
    initQuickView();
    initProductFilters();
    initAccordion();
    initHelpCards();
    initTooltips();
    initCopyButtons();
    initTabs();

    // Re-run for dynamically added elements
    const observer = new MutationObserver(() => {
      initQuickView();
      initTooltips();
      initCopyButtons();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  });

  // Expose for external use
  window.MeowComponents = { openQuickView, closeQuickView };

})();
