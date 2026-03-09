/* =============================================
   SCRIPT.JS — PAGE-SPECIFIC INTERACTIONS
   ============================================= */
'use strict';

(function() {
  document.addEventListener('DOMContentLoaded', function() {

    /* ── CART PAGE ── */
    function initCartPage() {
      const cartPage = document.getElementById('cartPage');
      if (!cartPage) return;

      renderCart();

      window.addEventListener('cartUpdated', renderCart);

      function renderCart() {
        const items = window.Cart?.getItems() || [];
        const itemsList = document.getElementById('cartItemsList');
        const emptyState = document.getElementById('cartEmpty');
        const cartContent = document.getElementById('cartContent');

        if (!itemsList) return;

        if (items.length === 0) {
          emptyState && (emptyState.style.display = 'block');
          cartContent && (cartContent.style.display = 'none');
          return;
        }

        emptyState && (emptyState.style.display = 'none');
        cartContent && (cartContent.style.display = 'grid');

        itemsList.innerHTML = items.map(item => `
          <div class="cart-item" data-id="${item.id}">
            <img src="${item.image}" alt="${item.name}" class="cart-item-img"
              onerror="this.src='https://via.placeholder.com/86x86'">
            <div class="cart-item-info">
              <div class="cart-item-store"><i class="fas ${item.storeIcon}"></i> ${item.store}</div>
              <div class="cart-item-name">${item.name}</div>
              <div class="cart-item-price">${item.price}</div>
              <div class="qty-controls">
                <button class="qty-btn" data-action="dec" data-id="${item.id}" aria-label="Decrease quantity">−</button>
                <span class="qty-value">${item.qty}</span>
                <button class="qty-btn" data-action="inc" data-id="${item.id}" aria-label="Increase quantity">+</button>
              </div>
            </div>
            <button class="cart-item-remove" data-id="${item.id}" aria-label="Remove item">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>`).join('');

        // Update summary
        updateCartSummary(items);

        // Bind events
        document.querySelectorAll('.qty-btn').forEach(btn => {
          btn.addEventListener('click', function() {
            const id = this.dataset.id;
            const item = items.find(i => i.id === id);
            if (!item) return;
            const newQty = this.dataset.action === 'inc' ? item.qty + 1 : item.qty - 1;
            window.Cart?.updateQty(id, newQty);
          });
        });

        document.querySelectorAll('.cart-item-remove').forEach(btn => {
          btn.addEventListener('click', function() {
            window.Cart?.remove(this.dataset.id);
          });
        });

        document.getElementById('clearCartBtn')?.addEventListener('click', () => {
          if (confirm('Clear all items from cart?')) window.Cart?.clear();
        });
      }

      function updateCartSummary(items) {
        const subtotal = window.Cart?.getTotal() || 0;
        const shipping = subtotal > 50 ? 0 : 4.99;
        const tax = subtotal * 0.05;
        const total = subtotal + shipping + tax;

        document.getElementById('summarySubtotal') && (document.getElementById('summarySubtotal').textContent = `$${subtotal.toFixed(2)}`);
        document.getElementById('summaryShipping') && (document.getElementById('summaryShipping').textContent = shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`);
        document.getElementById('summaryTax') && (document.getElementById('summaryTax').textContent = `$${tax.toFixed(2)}`);
        document.getElementById('summaryTotal') && (document.getElementById('summaryTotal').textContent = `$${total.toFixed(2)}`);
        document.getElementById('cartCount') && (document.getElementById('cartCount').textContent = window.Cart?.getCount() || 0);

        const shippingNote = document.getElementById('shippingNote');
        if (shippingNote) {
          shippingNote.textContent = shipping === 0 ? '✅ You qualify for free shipping!' : `Add $${(50 - subtotal).toFixed(2)} more for free shipping`;
        }
      }

      // Coupon
      document.getElementById('applyCouponBtn')?.addEventListener('click', function() {
        const code = document.getElementById('couponInput')?.value.trim().toUpperCase();
        const codes = { 'SAVE10': 10, 'WELCOME20': 20, 'TRENDSHOP': 15 };
        if (codes[code]) {
          showToast(`🎉 Coupon applied! ${codes[code]}% discount added.`, 'success');
        } else {
          showToast('Invalid coupon code. Try SAVE10, WELCOME20 or TRENDSHOP', 'error');
        }
      });

      // Checkout
      document.getElementById('checkoutBtn')?.addEventListener('click', function() {
        const items = window.Cart?.getItems() || [];
        if (!items.length) { showToast('Your cart is empty!', 'warning'); return; }
        showToast('🛒 Redirecting to checkout... (Affiliate links will open)', 'info');
        // Open first item's affiliate link as demo
        if (items[0].link && items[0].link !== '#') window.open(items[0].link, '_blank');
      });
    }

    /* ── HOME PAGE BLOG SECTION ── */
    const blogGrid = document.getElementById('blogGrid');
    if (blogGrid) {
      const posts = [
        { title: "Top 10 Fashion Trends You Need This Season", category: "Fashion", date: "Mar 8, 2026", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=200&fit=crop", excerpt: "Discover the hottest fashion trends dominating runways and streets this season.", readTime: "5 min" },
        { title: "The Best Tech Gadgets for Under $50", category: "Tech", date: "Mar 5, 2026", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=200&fit=crop", excerpt: "You don't need to break the bank to get quality tech. Here are our top picks.", readTime: "7 min" },
        { title: "Skincare Routine for Glowing Skin in 2026", category: "Beauty", date: "Mar 2, 2026", image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=200&fit=crop", excerpt: "Achieve that lit-from-within glow with these affordable skincare products.", readTime: "6 min" },
        { title: "Home Decor Ideas on a Budget", category: "Home", date: "Feb 28, 2026", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=200&fit=crop", excerpt: "Transform your living space with these stylish yet budget-friendly decor tips.", readTime: "8 min" },
        { title: "Best Fitness Equipment for Home Workouts", category: "Fitness", date: "Feb 25, 2026", image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=200&fit=crop", excerpt: "Build your dream home gym without spending a fortune with these picks.", readTime: "5 min" },
        { title: "Kids Fashion: Cute & Comfortable Picks", category: "Kids", date: "Feb 22, 2026", image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=200&fit=crop", excerpt: "Dress your little ones in adorable outfits that keep them comfy all day.", readTime: "4 min" },
      ];

      blogGrid.innerHTML = posts.map((p, i) => `
        <article class="blog-card reveal reveal-delay-${(i % 3) + 1}">
          <div class="blog-image">
            <img src="${p.image}" alt="${p.title}" loading="lazy">
            <span class="blog-category">${p.category}</span>
          </div>
          <div class="blog-content">
            <div class="blog-meta">
              <span><i class="far fa-calendar"></i> ${p.date}</span>
              <span><i class="far fa-clock"></i> ${p.readTime} read</span>
            </div>
            <h3>${p.title}</h3>
            <p>${p.excerpt}</p>
            <a href="blog.html" class="blog-read-more">Read More <i class="fas fa-arrow-right"></i></a>
          </div>
        </article>`).join('');
    }

    /* ── TRENDING SECTION ── */
    const trendingGrid = document.getElementById('trendingGrid');
    if (trendingGrid) {
      const trends = [
        { title: "Street Style Outfits",    sub: "Women's Fashion",     price: "From $12.99", tag: "🔥 Trending",  image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&h=500&fit=crop", featured: true },
        { title: "Smart Watches 2026",      sub: "Electronics",         price: "From $39.99", tag: "⚡ New",        image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400&h=240&fit=crop" },
        { title: "Minimalist Home Decor",   sub: "Home & Living",       price: "From $9.99",  tag: "🏠 Popular",   image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=240&fit=crop" },
        { title: "Men's Casual Collection", sub: "Men's Fashion",       price: "From $14.99", tag: "👔 Hot Pick",  image: "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=400&h=240&fit=crop" },
        { title: "Skincare Essentials",     sub: "Beauty & Care",       price: "From $9.99",  tag: "✨ Best Seller",image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=240&fit=crop" },
      ];

      trendingGrid.innerHTML = trends.map((t, i) => `
        <div class="trending-card ${t.featured ? 'featured' : ''} reveal">
          <img src="${t.image}" alt="${t.title}" loading="lazy">
          <div class="trending-overlay">
            <span class="trending-tag">${t.tag}</span>
            <h3>${t.title}</h3>
            <p>${t.sub}</p>
            <span class="trending-price">${t.price}</span>
          </div>
        </div>`).join('');
    }

    /* ── INIT CART PAGE ── */
    initCartPage();
  });
})();
