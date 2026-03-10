/* ============================
   PRODUCTS-DATA.JS — Shared Product Database
   ============================ */

const PRODUCTS = [
  // ── ELECTRONICS ──
  { id: 1, name: "Wireless Bluetooth Earbuds Pro", category: "electronics", price: 24.99, original: 44.99, rating: 4.5, reviews: 1240, badge: "hot", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=220&fit=crop", shop: "AliExpress", link: "https://www.aliexpress.com/", desc: "Noise cancellation, 30hr battery, IPX5 waterproof." },
  { id: 2, name: "Smart Watch Pro 2026", category: "electronics", price: 49.99, original: 89.99, rating: 4.7, reviews: 890, badge: "best", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=220&fit=crop", shop: "Amazon", link: "https://www.amazon.com/", desc: "Health tracking, sleep monitor, 7-day battery." },
  { id: 3, name: "Gaming Mouse RGB 6400 DPI", category: "electronics", price: 19.99, original: 35.00, rating: 4.4, reviews: 560, badge: "sale", image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&h=220&fit=crop", shop: "AliExpress", link: "https://www.aliexpress.com/", desc: "RGB lighting, programmable buttons, ergonomic design." },
  { id: 4, name: "Bluetooth Speaker Portable", category: "electronics", price: 29.99, original: 55.00, rating: 4.6, reviews: 780, badge: "hot", image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&h=220&fit=crop", shop: "Temu", link: "https://www.temu.com/", desc: "360° surround sound, 12hr playtime, IPX7 waterproof." },
  { id: 5, name: "Power Bank 20000mAh Fast Charge", category: "electronics", price: 22.99, original: 40.00, rating: 4.5, reviews: 430, badge: null, image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=300&h=220&fit=crop", shop: "Daraz", link: "https://www.daraz.pk/", desc: "Dual USB + USB-C, 22.5W fast charge." },
  { id: 6, name: "USB-C Hub 7-in-1 Adapter", category: "electronics", price: 17.99, original: 29.99, rating: 4.3, reviews: 310, badge: "new", image: "https://images.unsplash.com/photo-1625842268584-8f3296236761?w=300&h=220&fit=crop", shop: "Amazon", link: "https://www.amazon.com/", desc: "HDMI 4K, SD card, USB 3.0, 100W PD charging." },
  { id: 7, name: "LED Desk Lamp Touch Dimmer", category: "electronics", price: 15.99, original: 28.00, rating: 4.4, reviews: 210, badge: null, image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=300&h=220&fit=crop", shop: "AliExpress", link: "https://www.aliexpress.com/", desc: "3 colour modes, USB charging port, eye-care light." },
  { id: 8, name: "Mechanical Keyboard TKL", category: "electronics", price: 39.99, original: 69.99, rating: 4.6, reviews: 650, badge: "hot", image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300&h=220&fit=crop", shop: "Amazon", link: "https://www.amazon.com/", desc: "Blue switches, RGB backlight, anti-ghosting." },

  // ── WOMEN ──
  { id: 9, name: "Women Summer Floral Dress", category: "women", price: 19.99, original: 35.00, rating: 4.5, reviews: 920, badge: "hot", image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=300&h=220&fit=crop", shop: "AliExpress", link: "https://www.aliexpress.com/", desc: "Light chiffon, available in 8 colours, sizes S–XXL." },
  { id: 10, name: "Leather Handbag Designer Style", category: "women", price: 34.99, original: 65.00, rating: 4.7, reviews: 540, badge: "best", image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=300&h=220&fit=crop", shop: "Temu", link: "https://www.temu.com/", desc: "PU leather, multiple compartments, magnetic closure." },
  { id: 11, name: "Women Platform Sneakers", category: "women", price: 27.99, original: 50.00, rating: 4.4, reviews: 310, badge: null, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=220&fit=crop", shop: "AliExpress", link: "https://www.aliexpress.com/", desc: "Chunky sole, sizes 35–41, breathable mesh upper." },
  { id: 12, name: "Gold Pearl Jewellery Set", category: "women", price: 12.99, original: 25.00, rating: 4.6, reviews: 840, badge: "sale", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=300&h=220&fit=crop", shop: "Daraz", link: "https://www.daraz.pk/", desc: "Earrings + necklace + bracelet, hypoallergenic." },
  { id: 13, name: "Women Satin Pyjama Set", category: "women", price: 16.99, original: 30.00, rating: 4.5, reviews: 420, badge: "new", image: "https://images.unsplash.com/photo-1631221413776-83bdddb6dea0?w=300&h=220&fit=crop", shop: "Temu", link: "https://www.temu.com/", desc: "Silky soft, button top + long pants, sizes S–XL." },
  { id: 14, name: "Oversized Knit Cardigan", category: "women", price: 23.99, original: 45.00, rating: 4.3, reviews: 280, badge: null, image: "https://images.unsplash.com/photo-1548624313-0396c75e4b1a?w=300&h=220&fit=crop", shop: "AliExpress", link: "https://www.aliexpress.com/", desc: "Cosy ribbed knit, pockets, 6 colour options." },

  // ── MEN ──
  { id: 15, name: "Men's Slim Fit Oxford Shirt", category: "men", price: 18.99, original: 35.00, rating: 4.4, reviews: 610, badge: "sale", image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=300&h=220&fit=crop", shop: "Amazon", link: "https://www.amazon.com/", desc: "100% cotton, wrinkle-resistant, sizes S–3XL." },
  { id: 16, name: "Men Leather Wallet RFID Block", category: "men", price: 14.99, original: 28.00, rating: 4.6, reviews: 730, badge: "best", image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=300&h=220&fit=crop", shop: "Amazon", link: "https://www.amazon.com/", desc: "Slim bifold, 8 card slots, genuine leather." },
  { id: 17, name: "Men Running Sneakers", category: "men", price: 32.99, original: 60.00, rating: 4.5, reviews: 490, badge: "hot", image: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=300&h=220&fit=crop", shop: "AliExpress", link: "https://www.aliexpress.com/", desc: "Air cushion sole, breathable mesh, sizes 39–46." },
  { id: 18, name: "Casual Hoodie Streetwear", category: "men", price: 21.99, original: 40.00, rating: 4.3, reviews: 360, badge: null, image: "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=300&h=220&fit=crop", shop: "Temu", link: "https://www.temu.com/", desc: "Fleece lined, kangaroo pocket, 5 colour options." },
  { id: 19, name: "Men Aviator Sunglasses UV400", category: "men", price: 9.99, original: 20.00, rating: 4.2, reviews: 890, badge: "sale", image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=300&h=220&fit=crop", shop: "AliExpress", link: "https://www.aliexpress.com/", desc: "Polarised, metal frame, UV400 protection." },

  // ── KIDS ──
  { id: 20, name: "STEM Educational Robot Kit", category: "kids", price: 24.99, original: 45.00, rating: 4.8, reviews: 1120, badge: "best", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=220&fit=crop", shop: "Amazon", link: "https://www.amazon.com/", desc: "Ages 6+, build & programme your own robot." },
  { id: 21, name: "Kids Dinosaur Backpack", category: "kids", price: 16.99, original: 30.00, rating: 4.6, reviews: 750, badge: "hot", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=220&fit=crop", shop: "Daraz", link: "https://www.daraz.pk/", desc: "Waterproof, padded straps, fits A4 books." },
  { id: 22, name: "Wooden Blocks Building Set 100pc", category: "kids", price: 19.99, original: 35.00, rating: 4.7, reviews: 430, badge: "new", image: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=300&h=220&fit=crop", shop: "AliExpress", link: "https://www.aliexpress.com/", desc: "Non-toxic paint, natural wood, ages 3+." },
  { id: 23, name: "Kids LED Light-Up Sneakers", category: "kids", price: 18.99, original: 32.00, rating: 4.5, reviews: 560, badge: null, image: "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=300&h=220&fit=crop", shop: "Temu", link: "https://www.temu.com/", desc: "7 colour LED lights, USB rechargeable, sizes 25–37." },

  // ── BEAUTY ──
  { id: 24, name: "12-Piece Makeup Brush Set", category: "beauty", price: 13.99, original: 25.00, rating: 4.6, reviews: 1030, badge: "best", image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&h=220&fit=crop", shop: "AliExpress", link: "https://www.aliexpress.com/", desc: "Synthetic bristles, vegan, with storage bag." },
  { id: 25, name: "Vitamin C Serum 30ml", category: "beauty", price: 11.99, original: 22.00, rating: 4.7, reviews: 1850, badge: "hot", image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=300&h=220&fit=crop", shop: "Amazon", link: "https://www.amazon.com/", desc: "Brightens, anti-ageing, suitable for all skin types." },
  { id: 26, name: "Hair Straightener Ceramic", category: "beauty", price: 22.99, original: 45.00, rating: 4.4, reviews: 480, badge: "sale", image: "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=300&h=220&fit=crop", shop: "Daraz", link: "https://www.daraz.pk/", desc: "Adjustable temp 150–230°C, ionic technology." },
  { id: 27, name: "Facial Roller Rose Quartz", category: "beauty", price: 8.99, original: 18.00, rating: 4.5, reviews: 2100, badge: "new", image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=300&h=220&fit=crop", shop: "AliExpress", link: "https://www.aliexpress.com/", desc: "Natural stone, reduces puffiness, dual head." },

  // ── HOME ──
  { id: 28, name: "Digital Air Fryer 5L", category: "home", price: 45.99, original: 80.00, rating: 4.7, reviews: 2340, badge: "best", image: "https://images.unsplash.com/photo-1585515320310-259814833e62?w=300&h=220&fit=crop", shop: "Amazon", link: "https://www.amazon.com/", desc: "8 presets, non-stick basket, 1700W rapid heat." },
  { id: 29, name: "Smart LED Strip Lights 5m", category: "home", price: 12.99, original: 22.00, rating: 4.5, reviews: 3100, badge: "hot", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=220&fit=crop", shop: "Temu", link: "https://www.temu.com/", desc: "App + voice control, 16 million colours, cuttable." },
  { id: 30, name: "Non-Stick Cooking Pan Set 3pc", category: "home", price: 29.99, original: 55.00, rating: 4.4, reviews: 780, badge: "sale", image: "https://images.unsplash.com/photo-1584990347449-a2d4c2c044c9?w=300&h=220&fit=crop", shop: "AliExpress", link: "https://www.aliexpress.com/", desc: "Granite coating, PFOA-free, induction compatible." },
];

/* ============================
   PRODUCT CARD RENDERER
   ============================ */
function renderProductCard(p) {
  const stars = '★'.repeat(Math.floor(p.rating)) + (p.rating % 1 >= 0.5 ? '½' : '') + '☆'.repeat(5 - Math.ceil(p.rating));
  const discount = p.original ? Math.round((1 - p.price / p.original) * 100) : 0;
  const shopIcon = { Amazon: 'fab fa-amazon', AliExpress: 'fas fa-shopping-bag', Temu: 'fas fa-store', Daraz: 'fas fa-truck' }[p.shop] || 'fas fa-store';
  const badgeMap = { hot: 'badge-hot', best: 'badge-best', sale: 'badge-sale', new: 'badge-new' };

  return `
  <div class="product-card" data-category="${p.category}" data-id="${p.id}">
    <div class="product-badges">
      ${p.badge ? `<span class="badge ${badgeMap[p.badge]}">${p.badge.toUpperCase()}</span>` : ''}
      ${discount > 0 ? `<span class="badge badge-sale">-${discount}%</span>` : ''}
    </div>
    <button class="wishlist-toggle" data-id="${p.id}" aria-label="Wishlist">
      <i class="far fa-heart"></i>
    </button>
    <div class="product-image">
      <img src="${p.image}" alt="${p.name}" loading="lazy" />
      <div class="product-overlay">
        <button class="btn btn-outline btn-sm quick-view-btn" data-id="${p.id}"><i class="fas fa-eye"></i> Quick View</button>
      </div>
    </div>
    <div class="product-info">
      <div class="product-marketplace"><i class="${shopIcon}"></i> ${p.shop}</div>
      <h3 class="product-name">${p.name}</h3>
      <div class="product-rating">
        <div class="stars" title="${p.rating} stars">${'<i class="fas fa-star"></i>'.repeat(Math.floor(p.rating))}${p.rating % 1 >= 0.5 ? '<i class="fas fa-star-half-alt"></i>' : ''}</div>
        <span class="rating-count">(${p.reviews.toLocaleString()})</span>
      </div>
      <div class="product-price">
        <span class="price-current">$${p.price.toFixed(2)}</span>
        ${p.original ? `<span class="price-original">$${p.original.toFixed(2)}</span>` : ''}
      </div>
      <div class="product-actions">
        <button class="btn btn-primary btn-sm add-to-cart-btn" data-id="${p.id}" data-name="${p.name}" data-price="${p.price}" data-image="${p.image}">
          <i class="fas fa-cart-plus"></i> Add to Cart
        </button>
        <a href="${p.link}" target="_blank" rel="noopener noreferrer sponsored" class="btn btn-cta btn-sm">
          <i class="${shopIcon}"></i> Buy on ${p.shop}
        </a>
      </div>
    </div>
  </div>`;
}

/* ============================
   CART SYSTEM
   ============================ */
function getCart() {
  try { return JSON.parse(localStorage.getItem('mm_cart') || '[]'); } catch { return []; }
}
function saveCart(cart) {
  try { localStorage.setItem('mm_cart', JSON.stringify(cart)); } catch {}
  updateCartBadge();
}
function updateCartBadge() {
  const cart = getCart();
  const count = cart.reduce((sum, i) => sum + i.qty, 0);
  document.querySelectorAll('#cartCount, #mobileCartCount').forEach(el => { if (el) el.textContent = count; });
}
function addToCart(id) {
  const p = PRODUCTS.find(x => x.id === parseInt(id));
  if (!p) return;
  const cart = getCart();
  const existing = cart.find(x => x.id === p.id);
  if (existing) { existing.qty++; } else { cart.push({ id: p.id, name: p.name, price: p.price, image: p.image, qty: 1 }); }
  saveCart(cart);
  if (typeof showToast === 'function') showToast(`🛒 ${p.name} added to cart!`, 'success');
}

function initProductButtons() {
  document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', function() { addToCart(this.dataset.id); });
  });
  document.querySelectorAll('.wishlist-toggle').forEach(btn => {
    btn.addEventListener('click', function() {
      this.classList.toggle('active');
      const icon = this.querySelector('i');
      if (this.classList.contains('active')) {
        icon.classList.replace('far', 'fas');
        if (typeof showToast === 'function') showToast('❤️ Added to wishlist!', 'success');
      } else {
        icon.classList.replace('fas', 'far');
        if (typeof showToast === 'function') showToast('Removed from wishlist', 'warning');
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', updateCartBadge);
