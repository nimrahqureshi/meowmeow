/* =============================================
   MAIN.JS — GLOBAL UTILITIES & STORE DATA
   ============================================= */
'use strict';

/* ── TOAST SYSTEM ── */
window.ShopToast = (function() {
  const icons = { success: 'fa-check-circle', error: 'fa-times-circle', warning: 'fa-exclamation-triangle', info: 'fa-info-circle' };
  const colors = { success: '#10B981', error: '#EF4444', warning: '#F59E0B', info: '#3B82F6' };

  function show(message, type = 'info', duration = 4000) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <i class="fas ${icons[type] || icons.info} toast-icon" style="color:${colors[type]}"></i>
      <span class="toast-msg">${message}</span>
      <button class="toast-close" aria-label="Close"><i class="fas fa-times"></i></button>
    `;

    container.appendChild(toast);

    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => removeToast(toast));

    const timer = setTimeout(() => removeToast(toast), duration);
    toast._timer = timer;

    return toast;
  }

  function removeToast(toast) {
    if (!toast.parentNode) return;
    clearTimeout(toast._timer);
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(12px) scale(0.95)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.parentNode && toast.remove(), 320);
  }

  return { show };
})();

// Shorthand
window.showToast = (msg, type = 'info') => window.ShopToast.show(msg, type);

/* ── CART SYSTEM ── */
window.Cart = (function() {
  let items = JSON.parse(localStorage.getItem('shop_cart') || '[]');

  function save() {
    localStorage.setItem('shop_cart', JSON.stringify(items));
    updateBadge();
    dispatchUpdate();
  }

  function dispatchUpdate() {
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { items, total: getTotal(), count: getCount() } }));
  }

  function add(product) {
    const existing = items.find(i => i.id === product.id);
    if (existing) {
      existing.qty = Math.min(existing.qty + 1, 10);
      showToast(`<strong>${product.name}</strong> quantity updated!`, 'success');
    } else {
      items.push({ ...product, qty: 1 });
      showToast(`<strong>${product.name}</strong> added to cart! 🛍️`, 'success');
    }
    save();
    animateCartBtn();
  }

  function remove(id) {
    items = items.filter(i => i.id !== id);
    save();
    showToast('Item removed from cart', 'info');
  }

  function updateQty(id, qty) {
    const item = items.find(i => i.id === id);
    if (!item) return;
    if (qty <= 0) { remove(id); return; }
    item.qty = Math.min(qty, 10);
    save();
  }

  function clear() {
    items = [];
    save();
    showToast('Cart cleared', 'info');
  }

  function getTotal() {
    return items.reduce((sum, i) => sum + (parseFloat(i.price.replace(/[^0-9.]/g, '')) * i.qty), 0);
  }

  function getCount() { return items.reduce((sum, i) => sum + i.qty, 0); }
  function getItems() { return [...items]; }

  function updateBadge() {
    const count = getCount();
    document.querySelectorAll('.cart-badge, .nav-badge[data-cart]').forEach(badge => {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    });
  }

  function animateCartBtn() {
    const btn = document.querySelector('[data-nav="cart"]');
    if (!btn) return;
    btn.style.transform = 'scale(1.3)';
    setTimeout(() => btn.style.transform = '', 300);
  }

  // Init
  updateBadge();
  return { add, remove, updateQty, clear, getTotal, getCount, getItems };
})();

/* ── WISHLIST SYSTEM ── */
window.Wishlist = (function() {
  let items = JSON.parse(localStorage.getItem('shop_wishlist') || '[]');

  function save() {
    localStorage.setItem('shop_wishlist', JSON.stringify(items));
    updateBadge();
  }

  function toggle(product) {
    const idx = items.findIndex(i => i.id === product.id);
    if (idx >= 0) {
      items.splice(idx, 1);
      showToast('Removed from wishlist', 'info');
      return false;
    } else {
      items.push(product);
      showToast(`<strong>${product.name}</strong> added to wishlist! ❤️`, 'success');
      return true;
    }
    save();
  }

  function has(id) { return items.some(i => i.id === id); }
  function getItems() { return [...items]; }

  function updateBadge() {
    document.querySelectorAll('.wishlist-badge, .nav-badge[data-wishlist]').forEach(b => {
      b.textContent = items.length;
      b.style.display = items.length > 0 ? 'flex' : 'none';
    });
  }

  // Init
  updateBadge();
  return { toggle, has, getItems };
})();

/* ── PRODUCT DATA ── */
window.PRODUCTS = [
  // Women's Fashion
  { id: 'w1',  name: "Floral Maxi Dress",            category: "women",    sub: "dresses",     price: "$24.99", originalPrice: "$45.00", rating: 4.7, reviews: 2340, badge: "hot",  image: "https://images.unsplash.com/photo-1572804013427-4d7ca7268217?w=400&h=400&fit=crop", store: "Amazon", storeIcon: "fa-amazon", link: "#" },
  { id: 'w2',  name: "High-Waist Skinny Jeans",      category: "women",    sub: "bottoms",     price: "$18.99", originalPrice: "$38.00", rating: 4.5, reviews: 1870, badge: "sale", image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&h=400&fit=crop", store: "Daraz",  storeIcon: "fa-store",  link: "#" },
  { id: 'w3',  name: "Oversized Knit Hoodie",        category: "women",    sub: "tops",        price: "$22.50", originalPrice: "$42.00", rating: 4.8, reviews: 3120, badge: "best", image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop", store: "Temu",   storeIcon: "fa-tag",    link: "#" },
  { id: 'w4',  name: "Leather Crossbody Handbag",    category: "women",    sub: "bags",        price: "$29.99", originalPrice: "$55.00", rating: 4.6, reviews: 956,  badge: "new",  image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop", store: "Amazon", storeIcon: "fa-amazon", link: "#" },
  { id: 'w5',  name: "Block Heel Sandals",           category: "women",    sub: "shoes",       price: "$19.99", originalPrice: "$35.00", rating: 4.4, reviews: 1450, badge: "sale", image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&h=400&fit=crop", store: "Daraz",  storeIcon: "fa-store",  link: "#" },
  { id: 'w6',  name: "Gold Chain Necklace Set",      category: "women",    sub: "jewelry",     price: "$12.99", originalPrice: "$28.00", rating: 4.9, reviews: 4210, badge: "hot",  image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop", store: "Amazon", storeIcon: "fa-amazon", link: "#" },
  { id: 'w7',  name: "Silk Slip Skirt",              category: "women",    sub: "bottoms",     price: "$16.50", originalPrice: "$32.00", rating: 4.3, reviews: 780,  badge: "new",  image: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400&h=400&fit=crop", store: "Temu",   storeIcon: "fa-tag",    link: "#" },
  { id: 'w8',  name: "Faux Leather Jacket",          category: "women",    sub: "tops",        price: "$34.99", originalPrice: "$70.00", rating: 4.7, reviews: 2890, badge: "best", image: "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=400&h=400&fit=crop", store: "Amazon", storeIcon: "fa-amazon", link: "#" },
  { id: 'w9',  name: "Rose Gold Watch",              category: "women",    sub: "watches",     price: "$39.99", originalPrice: "$80.00", rating: 4.6, reviews: 1230, badge: "sale", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop", store: "Amazon", storeIcon: "fa-amazon", link: "#" },
  { id: 'w10', name: "Crystal Hair Clips Set",       category: "women",    sub: "accessories", price: "$8.99",  originalPrice: "$18.00", rating: 4.8, reviews: 5430, badge: "hot",  image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=400&fit=crop", store: "Temu",   storeIcon: "fa-tag",    link: "#" },

  // Men's Fashion
  { id: 'm1',  name: "Classic Polo T-Shirt",         category: "men",      sub: "tops",        price: "$14.99", originalPrice: "$28.00", rating: 4.5, reviews: 3450, badge: "hot",  image: "https://images.unsplash.com/photo-1622445275576-721325763afe?w=400&h=400&fit=crop", store: "Daraz",  storeIcon: "fa-store",  link: "#" },
  { id: 'm2',  name: "Slim Fit Chino Pants",         category: "men",      sub: "bottoms",     price: "$21.99", originalPrice: "$45.00", rating: 4.6, reviews: 2100, badge: "sale", image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=400&fit=crop", store: "Amazon", storeIcon: "fa-amazon", link: "#" },
  { id: 'm3',  name: "Leather Sneakers",             category: "men",      sub: "shoes",       price: "$35.99", originalPrice: "$75.00", rating: 4.7, reviews: 1870, badge: "best", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop", store: "Amazon", storeIcon: "fa-amazon", link: "#" },
  { id: 'm4',  name: "Minimalist Watch",             category: "men",      sub: "watches",     price: "$44.99", originalPrice: "$90.00", rating: 4.8, reviews: 3240, badge: "hot",  image: "https://images.unsplash.com/photo-1539874754764-5a96559165b0?w=400&h=400&fit=crop", store: "Amazon", storeIcon: "fa-amazon", link: "#" },
  { id: 'm5',  name: "Aviator Sunglasses",           category: "men",      sub: "accessories", price: "$16.99", originalPrice: "$32.00", rating: 4.5, reviews: 2670, badge: "sale", image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop", store: "Temu",   storeIcon: "fa-tag",    link: "#" },
  { id: 'm6',  name: "Leather Wallet - RFID",        category: "men",      sub: "accessories", price: "$18.50", originalPrice: "$38.00", rating: 4.7, reviews: 4560, badge: "best", image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop", store: "Amazon", storeIcon: "fa-amazon", link: "#" },
  { id: 'm7',  name: "Pullover Hoodie",              category: "men",      sub: "tops",        price: "$24.99", originalPrice: "$48.00", rating: 4.6, reviews: 1980, badge: "new",  image: "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=400&h=400&fit=crop", store: "Daraz",  storeIcon: "fa-store",  link: "#" },
  { id: 'm8',  name: "Beard Care Grooming Kit",      category: "men",      sub: "grooming",    price: "$22.99", originalPrice: "$45.00", rating: 4.8, reviews: 3780, badge: "hot",  image: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=400&fit=crop", store: "Amazon", storeIcon: "fa-amazon", link: "#" },

  // Kids
  { id: 'k1',  name: "Dinosaur Print T-Shirt",       category: "kids",     sub: "clothes",     price: "$9.99",  originalPrice: "$18.00", rating: 4.9, reviews: 1230, badge: "hot",  image: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=400&h=400&fit=crop", store: "Daraz",  storeIcon: "fa-store",  link: "#" },
  { id: 'k2',  name: "Light-Up Sneakers Kids",       category: "kids",     sub: "shoes",       price: "$19.99", originalPrice: "$38.00", rating: 4.7, reviews: 890,  badge: "new",  image: "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=400&h=400&fit=crop", store: "Amazon", storeIcon: "fa-amazon", link: "#" },
  { id: 'k3',  name: "Educational STEM Toy Set",     category: "kids",     sub: "toys",        price: "$24.99", originalPrice: "$45.00", rating: 4.8, reviews: 2340, badge: "best", image: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400&h=400&fit=crop", store: "Amazon", storeIcon: "fa-amazon", link: "#" },
  { id: 'k4',  name: "Cute Backpack Kids",           category: "kids",     sub: "bags",        price: "$14.99", originalPrice: "$28.00", rating: 4.6, reviews: 670,  badge: "sale", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop", store: "Daraz",  storeIcon: "fa-store",  link: "#" },

  // Electronics
  { id: 'e1',  name: "Wireless Earbuds Pro",         category: "electronics", sub: "audio",   price: "$29.99", originalPrice: "$65.00", rating: 4.6, reviews: 5670, badge: "hot",  image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop", store: "Amazon", storeIcon: "fa-amazon", link: "#" },
  { id: 'e2',  name: "Smart Watch Fitness Band",     category: "electronics", sub: "wearables", price: "$49.99", originalPrice: "$110.00", rating: 4.7, reviews: 3450, badge: "best", image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400&h=400&fit=crop", store: "Amazon", storeIcon: "fa-amazon", link: "#" },
  { id: 'e3',  name: "20000mAh Power Bank",          category: "electronics", sub: "charging", price: "$19.99", originalPrice: "$40.00", rating: 4.5, reviews: 7890, badge: "sale", image: "https://images.unsplash.com/photo-1609592806596-b56cbc1a7e47?w=400&h=400&fit=crop", store: "Daraz",  storeIcon: "fa-store",  link: "#" },
  { id: 'e4',  name: "Mechanical Gaming Keyboard",   category: "electronics", sub: "gaming",  price: "$44.99", originalPrice: "$88.00", rating: 4.8, reviews: 2340, badge: "hot",  image: "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400&h=400&fit=crop", store: "Amazon", storeIcon: "fa-amazon", link: "#" },
  { id: 'e5',  name: "RGB Gaming Mouse",             category: "electronics", sub: "gaming",  price: "$24.99", originalPrice: "$50.00", rating: 4.7, reviews: 1890, badge: "new",  image: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&h=400&fit=crop", store: "Amazon", storeIcon: "fa-amazon", link: "#" },
  { id: 'e6',  name: "Phone Case MagSafe",           category: "electronics", sub: "mobile",  price: "$9.99",  originalPrice: "$20.00", rating: 4.4, reviews: 4560, badge: "sale", image: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&h=400&fit=crop", store: "Temu",   storeIcon: "fa-tag",    link: "#" },

  // Home
  { id: 'h1',  name: "5.8QT Digital Air Fryer",     category: "home",     sub: "kitchen",     price: "$59.99", originalPrice: "$120.00", rating: 4.8, reviews: 8970, badge: "best", image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&h=400&fit=crop", store: "Amazon", storeIcon: "fa-amazon", link: "#" },
  { id: 'h2',  name: "3-in-1 Bullet Blender",       category: "home",     sub: "kitchen",     price: "$28.99", originalPrice: "$58.00", rating: 4.6, reviews: 3450, badge: "hot",  image: "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=400&h=400&fit=crop", store: "Amazon", storeIcon: "fa-amazon", link: "#" },
  { id: 'h3',  name: "Nordic Style Table Lamp",     category: "home",     sub: "decor",       price: "$24.99", originalPrice: "$50.00", rating: 4.5, reviews: 1230, badge: "new",  image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=400&fit=crop", store: "Daraz",  storeIcon: "fa-store",  link: "#" },
  { id: 'h4',  name: "Boho Wall Art Prints Set",    category: "home",     sub: "decor",       price: "$18.99", originalPrice: "$38.00", rating: 4.7, reviews: 2100, badge: "sale", image: "https://images.unsplash.com/photo-1567016432779-094069958ea5?w=400&h=400&fit=crop", store: "Amazon", storeIcon: "fa-amazon", link: "#" },
  { id: 'h5',  name: "Luxury Bedsheet Set 1000TC",  category: "home",     sub: "bedroom",     price: "$34.99", originalPrice: "$70.00", rating: 4.8, reviews: 4560, badge: "hot",  image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=400&fit=crop", store: "Daraz",  storeIcon: "fa-store",  link: "#" },

  // Beauty
  { id: 'b1',  name: "Vitamin C Serum 30ml",        category: "beauty",   sub: "skincare",    price: "$14.99", originalPrice: "$30.00", rating: 4.8, reviews: 9870, badge: "best", image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop", store: "Amazon", storeIcon: "fa-amazon", link: "#" },
  { id: 'b2',  name: "HD Makeup Palette 48 Shades", category: "beauty",   sub: "makeup",      price: "$18.99", originalPrice: "$38.00", rating: 4.6, reviews: 5430, badge: "hot",  image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&h=400&fit=crop", store: "Temu",   storeIcon: "fa-tag",    link: "#" },
  { id: 'b3',  name: "Professional Hair Dryer",     category: "beauty",   sub: "hair",        price: "$32.99", originalPrice: "$68.00", rating: 4.7, reviews: 2340, badge: "sale", image: "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400&h=400&fit=crop", store: "Amazon", storeIcon: "fa-amazon", link: "#" },

  // Fitness
  { id: 'f1',  name: "Non-Slip Yoga Mat 6mm",       category: "fitness",  sub: "yoga",        price: "$22.99", originalPrice: "$45.00", rating: 4.7, reviews: 6780, badge: "best", image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=400&fit=crop", store: "Amazon", storeIcon: "fa-amazon", link: "#" },
  { id: 'f2',  name: "Percussion Massage Gun",      category: "fitness",  sub: "recovery",    price: "$44.99", originalPrice: "$90.00", rating: 4.8, reviews: 4560, badge: "hot",  image: "https://images.unsplash.com/photo-1603988363607-e1e4a66962c6?w=400&h=400&fit=crop", store: "Amazon", storeIcon: "fa-amazon", link: "#" },
  { id: 'f3',  name: "Whey Protein Powder 2kg",     category: "fitness",  sub: "supplements", price: "$38.99", originalPrice: "$78.00", rating: 4.6, reviews: 3450, badge: "sale", image: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&h=400&fit=crop", store: "Daraz",  storeIcon: "fa-store",  link: "#" },
];

/* ── CATEGORIES DATA ── */
window.CATEGORIES = [
  { id: 'women',       name: "Women's Fashion",  icon: 'fa-female',          count: 420, color: '#FF385C', bg: 'rgba(255,56,92,0.1)',     sub: ["Tops","Jeans","Dresses","Skirts","Jackets","Handbags","Shoes","Jewelry","Watches","Accessories"] },
  { id: 'men',         name: "Men's Fashion",    icon: 'fa-male',            count: 318, color: '#3B82F6', bg: 'rgba(59,130,246,0.1)',    sub: ["T-Shirts","Shirts","Hoodies","Jeans","Pants","Sneakers","Boots","Watches","Sunglasses","Wallets"] },
  { id: 'kids',        name: "Kids & Baby",      icon: 'fa-baby',            count: 195, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',    sub: ["Baby Clothes","Kids Shirts","Dresses","School Bags","Toys","Educational","Shoes","Accessories"] },
  { id: 'electronics', name: "Electronics",      icon: 'fa-microchip',       count: 267, color: '#7C3AED', bg: 'rgba(124,58,237,0.1)',    sub: ["Smartphones","Earbuds","Headphones","Smart Watches","Gaming Mouse","Keyboard","Power Banks","Chargers"] },
  { id: 'home',        name: "Home & Living",    icon: 'fa-home',            count: 356, color: '#10B981', bg: 'rgba(16,185,129,0.1)',    sub: ["Kitchen","Air Fryer","Blender","Storage","Home Decor","Lamps","Wall Art","Bedsheets"] },
  { id: 'beauty',      name: "Beauty & Care",    icon: 'fa-spa',             count: 284, color: '#EC4899', bg: 'rgba(236,72,153,0.1)',    sub: ["Skincare","Makeup","Hair Tools","Nail Care","Fragrance","Face Masks"] },
  { id: 'fitness',     name: "Sports & Fitness", icon: 'fa-dumbbell',        count: 178, color: '#EF4444', bg: 'rgba(239,68,68,0.1)',     sub: ["Yoga Mats","Massagers","Supplements","Resistance Bands","Protein","Gym Bags"] },
  { id: 'bags',        name: "Bags & Luggage",   icon: 'fa-briefcase',       count: 142, color: '#F97316', bg: 'rgba(249,115,22,0.1)',    sub: ["Handbags","Backpacks","Travel Bags","Wallets","Clutches","Suitcases"] },
];

/* ── REVIEWS DATA ── */
window.REVIEWS = [
  { name: "Sarah M.",     avatar: "https://i.pravatar.cc/100?img=5",  stars: 5, text: "Absolutely love my purchases! The quality is amazing and shipping was super fast. Will definitely order again from these affiliate links.", product: "Floral Maxi Dress", verified: true },
  { name: "James K.",     avatar: "https://i.pravatar.cc/100?img=8",  stars: 5, text: "The gaming keyboard is phenomenal. Mechanical switches feel crisp and the RGB lighting is gorgeous. Great price too!", product: "Mechanical Gaming Keyboard", verified: true },
  { name: "Fatima A.",    avatar: "https://i.pravatar.cc/100?img=9",  stars: 5, text: "The skincare serum transformed my skin in just 2 weeks. My dark spots have faded visibly. Highly recommend!", product: "Vitamin C Serum", verified: true },
  { name: "Ryan C.",      avatar: "https://i.pravatar.cc/100?img=12", stars: 4, text: "Air fryer is a game changer for quick healthy meals. Fries come out perfectly crispy every time. Worth every penny.", product: "5.8QT Air Fryer", verified: true },
  { name: "Priya S.",     avatar: "https://i.pravatar.cc/100?img=20", stars: 5, text: "The wireless earbuds have incredible sound quality and the noise cancellation is top notch for the price range.", product: "Wireless Earbuds Pro", verified: true },
  { name: "Ahmed B.",     avatar: "https://i.pravatar.cc/100?img=15", stars: 5, text: "Ordered the yoga mat and it's non-slip even during hot yoga. Great thickness and the material is premium quality.", product: "Non-Slip Yoga Mat", verified: true },
];

/* ── CONSOLE BRANDING ── */
console.log('%c✨ TrendShop %cv2.0 ', 'background:linear-gradient(135deg,#FF385C,#7C3AED);color:#fff;font-size:16px;font-weight:900;padding:8px 12px;border-radius:10px 0 0 10px;', 'background:#0D0D1A;color:#f1f5f9;font-size:14px;padding:8px 12px;border-radius:0 10px 10px 0;');
console.log('%cPowered by affiliate marketing 💼', 'color:#FF385C;font-size:12px;');
