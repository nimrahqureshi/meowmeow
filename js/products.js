/* ============================
   PRODUCTS.JS — PRODUCTS PAGE  v2.0
   Category filter · Subcategory bar · Sort · Load-more
   Wishlist persistence · URL params · Price range
   ============================ */

(function () {
  'use strict';

  var SUBCATS = {
    women:['Dresses','Tops','Jeans','Skirts','Activewear','Swimwear','Lingerie'],
    men:['Shirts','T-Shirts','Pants','Suits','Activewear','Shorts','Underwear'],
    kids:['Boys','Girls','Baby','School Wear','Toys','Footwear'],
    shoes:['Sneakers','Heels','Flats','Boots','Sandals','Sport'],
    bags:['Handbags','Backpacks','Totes','Wallets','Clutches'],
    jewelry:['Necklaces','Rings','Earrings','Bracelets','Anklets'],
    watches:['Smart Watches','Analog','Digital','Luxury','Sport'],
    beauty:['Skincare','Makeup','Haircare','Fragrance','Nails','Tools'],
    pets:['Dogs','Cats','Birds','Fish','Small Pets','Supplies'],
    toys:['Action Figures','Board Games','Puzzles','Educational','Outdoor','STEM'],
    electronics:['Phones','Laptops','Audio','Smart Home','Cameras','Gaming','Accessories'],
    crafts:['Painting','Sewing','Knitting','Paper Crafts','Resin','Scrapbooking'],
    home:['Furniture','Kitchen','Decor','Bedding','Lighting','Storage','Garden'],
    accessories:['Hats','Belts','Sunglasses','Scarves','Gloves','Hair Accessories'],
    flowers:['Artificial','Fresh Bouquets','Dried','Seasonal','Gift Sets']
  };

  var activeCat  = 'all', activeSub = 'all', activeSort = 'default';
  var page       = 1, PER_PAGE = 12, allCards = [];
  var WL_KEY     = 'meowmeow-wishlist';

  function loadWL()  { try { return JSON.parse(localStorage.getItem(WL_KEY)) || []; } catch(e) { return []; } }
  function saveWL(l) { try { localStorage.setItem(WL_KEY, JSON.stringify(l)); } catch(e) {} }
  var wl = loadWL();

  function toggleWL(id, btn) {
    var idx = wl.indexOf(id);
    if (idx === -1) { wl.push(id); btn.classList.add('active'); var i=btn.querySelector('i'); if(i) i.classList.replace('far','fas'); if(window.showToast) window.showToast('Added to wishlist ❤️','success'); }
    else { wl.splice(idx,1); btn.classList.remove('active'); var i2=btn.querySelector('i'); if(i2) i2.classList.replace('fas','far'); if(window.showToast) window.showToast('Removed from wishlist','warning'); }
    saveWL(wl);
  }

  function applyWL() {
    document.querySelectorAll('.wishlist-toggle').forEach(function(btn){
      var card=btn.closest('.product-card'); var id=card&&(card.dataset.productId||card.dataset.id); if(!id) return;
      btn.classList.toggle('active', wl.indexOf(id)!==-1);
      var icon=btn.querySelector('i'); if(icon) icon.className=wl.indexOf(id)!==-1?'fas fa-heart':'far fa-heart';
    });
  }

  function bindWLBtns() {
    document.querySelectorAll('.wishlist-toggle:not([data-wl-bound])').forEach(function(btn){
      btn.setAttribute('data-wl-bound','1'); btn._meowBound=true;
      btn.addEventListener('click',function(e){ e.stopPropagation(); var card=this.closest('.product-card'); var id=card&&(card.dataset.productId||card.dataset.id); if(id) toggleWL(id,this); });
    });
  }

  function price(card) { var el=card.querySelector('.price-current'); return el?parseFloat(el.textContent.replace(/[^0-9.]/g,''))||0:0; }
  function rating(card){ var el=card.querySelector('.rating-count'); return el?parseFloat(el.textContent.replace(/[^0-9.]/g,''))||0:0; }

  function getVisible() {
    return allCards.filter(function(card){
      var cat=(card.dataset.category||'all'), sub=(card.dataset.subcategory||'');
      return (activeCat==='all'||cat===activeCat) && (activeSub==='all'||sub===activeSub);
    });
  }

  function sortCards(cards) {
    var s=cards.slice();
    if(activeSort==='price-asc') s.sort(function(a,b){return price(a)-price(b);});
    else if(activeSort==='price-desc') s.sort(function(a,b){return price(b)-price(a);});
    else if(activeSort==='rating') s.sort(function(a,b){return rating(b)-rating(a);});
    else if(activeSort==='newest') s.reverse();
    return s;
  }

  function render() {
    var grid=document.getElementById('productGrid'); if(!grid) return;
    var vis=sortCards(getVisible()), paged=vis.slice(0,page*PER_PAGE);
    allCards.forEach(function(c){c.style.display='none';});
    paged.forEach(function(c,i){ c.style.display=''; c.style.animationDelay=(i%PER_PAGE*.04)+'s'; c.classList.remove('card-enter'); void c.offsetWidth; c.classList.add('card-enter'); });
    var cnt=document.getElementById('productCount'); if(cnt) cnt.textContent=vis.length.toLocaleString();
    var nr=document.getElementById('noResults'); if(nr) nr.style.display=vis.length===0?'block':'none';
    var lm=document.getElementById('loadMoreBtn'); if(lm) { lm.style.display=paged.length<vis.length?'inline-flex':'none'; var rem=document.getElementById('loadMoreRemaining'); if(rem) rem.textContent='('+( vis.length-paged.length)+' more)'; }
  }

  function renderSubs(cat) {
    var bar=document.getElementById('subcategoryBar'); if(!bar) return;
    var subs=SUBCATS[cat];
    if(!subs||!subs.length){bar.style.display='none';return;}
    bar.style.display='flex';
    bar.innerHTML='<button class="filter-btn active" data-subfilter="all">All '+cap(cat)+'</button>'+subs.map(function(s){return '<button class="filter-btn" data-subfilter="'+slug(s)+'">'+s+'</button>';}).join('');
    bar.querySelectorAll('[data-subfilter]').forEach(function(btn){
      btn.addEventListener('click',function(){ bar.querySelectorAll('[data-subfilter]').forEach(function(b){b.classList.remove('active');}); this.classList.add('active'); activeSub=this.dataset.subfilter; page=1; render(); });
    });
  }

  function initFilters() {
    var btns=document.querySelectorAll('.filter-btn[data-filter]');
    btns.forEach(function(btn){
      btn.addEventListener('click',function(){ btns.forEach(function(b){b.classList.remove('active');}); this.classList.add('active');
        activeCat=this.dataset.filter; activeSub='all'; page=1; renderSubs(activeCat); render();
        try{var u=new URL(window.location.href); activeCat==='all'?u.searchParams.delete('cat'):u.searchParams.set('cat',activeCat); history.replaceState(null,'',u.toString());}catch(e){}
      });
    });
  }

  function initSort() {
    var sel=document.getElementById('sortSelect'); if(!sel) return;
    sel.addEventListener('change',function(){activeSort=this.value;page=1;render();});
  }

  function initLoadMore() {
    var btn=document.getElementById('loadMoreBtn'); if(!btn) return;
    btn.addEventListener('click',function(){page++; render(); var grid=document.getElementById('productGrid'); if(grid){var cards=grid.querySelectorAll('.product-card:not([style*="none"])'); var first=cards[(page-1)*PER_PAGE]; if(first) setTimeout(function(){first.scrollIntoView({behavior:'smooth',block:'nearest'});},100);}});
  }

  function initPriceRange() {
    var slider=document.getElementById('priceRange'); var disp=document.getElementById('priceDisplay'); if(!slider) return;
    slider.addEventListener('input',function(){ var max=parseInt(this.value); if(disp) disp.textContent='$'+max; allCards.forEach(function(c){var p=price(c); c.dataset.priceVisible=(p===0||p<=max)?'1':'0';}); page=1; render(); });
  }

  function applyUrl() {
    try{var cat=new URLSearchParams(window.location.search).get('cat'); if(cat){var btn=document.querySelector('.filter-btn[data-filter="'+cat+'"]'); if(btn) btn.click();}}catch(e){}
  }

  function ensureToolbar() {
    var grid=document.getElementById('productGrid'); if(!grid) return;
    if(!document.getElementById('subcategoryBar')){var sb=document.createElement('div');sb.id='subcategoryBar';sb.style.cssText='display:none;flex-wrap:nowrap;overflow-x:auto;gap:8px;padding:10px 0;-webkit-overflow-scrolling:touch;';grid.insertAdjacentElement('beforebegin',sb);}
    if(!document.querySelector('.products-toolbar')){var tb=document.createElement('div');tb.className='products-toolbar';tb.style.cssText='display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:20px;';tb.innerHTML='<p style="font-size:.9rem;color:var(--text-secondary);">Showing <strong id="productCount">'+allCards.length+'</strong> products</p><select id="sortSelect" style="padding:8px 14px;border:2px solid var(--border);border-radius:var(--radius-full);background:var(--bg-secondary);color:var(--text-primary);font-size:.85rem;cursor:pointer;"><option value="default">Sort: Featured</option><option value="price-asc">Price: Low → High</option><option value="price-desc">Price: High → Low</option><option value="rating">Highest Rated</option><option value="newest">Newest First</option></select>';grid.insertAdjacentElement('beforebegin',tb);}
    if(!document.getElementById('noResults')){var nr=document.createElement('div');nr.id='noResults';nr.style.cssText='display:none;text-align:center;padding:60px 20px;';nr.innerHTML='<div style="font-size:3rem;opacity:.3">🔍</div><h3 style="color:var(--text-primary);margin:16px 0 8px;">No products found</h3><p style="color:var(--text-secondary);">Try a different category.</p><button class="btn btn-outline" onclick="document.querySelector(\'.filter-btn[data-filter=all]\')?.click()">Show All</button>';grid.appendChild(nr);}
    if(!document.getElementById('loadMoreBtn')){var lw=document.createElement('div');lw.style.cssText='text-align:center;margin-top:40px;';lw.innerHTML='<button id="loadMoreBtn" class="btn btn-outline btn-lg" style="display:none;"><i class="fas fa-plus"></i> Load More <span id="loadMoreRemaining"></span></button>';grid.insertAdjacentElement('afterend',lw);}
  }

  function cap(s){return s.charAt(0).toUpperCase()+s.slice(1);}
  function slug(s){return s.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'');}

  document.addEventListener('DOMContentLoaded', function () {
    var grid=document.getElementById('productGrid'); if(!grid) return;
    allCards=Array.from(grid.querySelectorAll('.product-card'));
    ensureToolbar(); initFilters(); initSort(); initLoadMore(); initPriceRange();
    applyWL(); bindWLBtns(); render(); applyUrl();
    new MutationObserver(function(){allCards=Array.from(grid.querySelectorAll('.product-card'));applyWL();bindWLBtns();}).observe(grid,{childList:true});
  });

})();
