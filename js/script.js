/* SCRIPT.JS — Page-Specific Logic */
'use strict';
document.addEventListener('DOMContentLoaded',function(){

  /* ── PRODUCTS PAGE: Filter ── */
  const filterBtns=document.querySelectorAll('.filter-btn[data-filter]');
  const productGrid=document.getElementById('productGrid');
  const noResults=document.getElementById('noResults');
  if(filterBtns.length&&productGrid){
    function filterCards(cat){
      let visible=0;
      productGrid.querySelectorAll('.product-card').forEach(c=>{
        const show=cat==='all'||c.dataset.category===cat;
        c.style.display=show?'':'none';
        if(show)visible++;
      });
      if(noResults)noResults.style.display=visible===0?'block':'none';
    }
    filterBtns.forEach(btn=>btn.addEventListener('click',function(){
      filterBtns.forEach(b=>b.classList.remove('active'));
      this.classList.add('active');
      filterCards(this.dataset.filter||'all');
      const url=new URL(window.location);
      if(this.dataset.filter==='all')url.searchParams.delete('cat');
      else url.searchParams.set('cat',this.dataset.filter);
      history.replaceState({},'',url);
    }));
    const urlCat=new URLSearchParams(window.location.search).get('cat');
    if(urlCat){
      const mb=document.querySelector(`.filter-btn[data-filter="${urlCat}"]`);
      if(mb){filterBtns.forEach(b=>b.classList.remove('active'));mb.classList.add('active');filterCards(urlCat);}
      else filterCards('all');
    }else filterCards('all');
  }

  /* ── CART PAGE ── */
  const cartItems=document.getElementById('cartItems');
  const cartEmpty=document.getElementById('cartEmpty');
  const cartContent=document.getElementById('cartContent');
  if(cartItems!==null){
    function renderCart(){
      const cart=window.getCart?.()??[];
      if(cart.length===0){
        if(cartEmpty)cartEmpty.style.display='block';
        if(cartContent)cartContent.style.display='none';
        return;
      }
      if(cartEmpty)cartEmpty.style.display='none';
      if(cartContent)cartContent.style.display='block';
      let sub=0;
      cartItems.innerHTML=cart.map((item,idx)=>{
        const lt=((item.price||0)*(item.qty||1)).toFixed(2);
        sub+=parseFloat(lt);
        return`<div class="cart-item" data-idx="${idx}">
          <img class="cart-item-img" src="${item.img||'https://placehold.co/80x80/F3F4F6/9CA3AF?text=?'}" alt="${item.name}" onerror="this.src='https://placehold.co/80x80/F3F4F6/9CA3AF?text=?'">
          <div class="cart-item-info">
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-meta">${item.shop||'Online Store'}</div>
            <div class="cart-item-price">$${lt}</div>
            <div class="cart-item-controls">
              <div class="qty-control">
                <button class="qty-btn qty-minus" data-idx="${idx}">−</button>
                <span class="qty-num">${item.qty||1}</span>
                <button class="qty-btn qty-plus" data-idx="${idx}">+</button>
              </div>
              <button class="cart-remove-btn" data-idx="${idx}"><i class="fas fa-trash-alt"></i> Remove</button>
            </div>
          </div>
        </div>`;
      }).join('');
      const tax=(sub*0.08).toFixed(2);
      const total=(sub+parseFloat(tax)).toFixed(2);
      const s=e=>document.getElementById(e);
      if(s('cartSubtotal'))s('cartSubtotal').textContent='$'+sub.toFixed(2);
      if(s('cartTax'))s('cartTax').textContent='$'+tax;
      if(s('cartTotal'))s('cartTotal').innerHTML='<strong>$'+total+'</strong>';
      if(s('itemCount'))s('itemCount').textContent=cart.length;
      // Qty buttons
      cartItems.querySelectorAll('.qty-plus').forEach(b=>b.addEventListener('click',function(){
        const c=window.getCart();const i=parseInt(this.dataset.idx);
        if(c[i]){c[i].qty=(c[i].qty||1)+1;window.saveCart(c);renderCart();}
      }));
      cartItems.querySelectorAll('.qty-minus').forEach(b=>b.addEventListener('click',function(){
        const c=window.getCart();const i=parseInt(this.dataset.idx);
        if(c[i]){c[i].qty=(c[i].qty||1)-1;if(c[i].qty<1)c.splice(i,1);window.saveCart(c);renderCart();}
      }));
      cartItems.querySelectorAll('.cart-remove-btn').forEach(b=>b.addEventListener('click',function(){
        const c=window.getCart();c.splice(parseInt(this.dataset.idx),1);
        window.saveCart(c);window.showToast?.('Item removed','default');renderCart();
      }));
    }
    renderCart();
    document.getElementById('clearCartBtn')?.addEventListener('click',function(){
      if(confirm('Clear entire cart?')){window.saveCart([]);renderCart();window.showToast?.('Cart cleared','default');}
    });
  }

  /* ── Proceed to checkout ── */
  window.proceedToCheckout=function(){
    window.showToast?.('Redirecting you to partner stores…','default');
    const cart=window.getCart?.()??[];
    if(cart.length>0)setTimeout(()=>window.open('products.html','_self'),1200);
  };

  /* ── Contact Form ── */
  const contactForm=document.getElementById('contactForm');
  contactForm?.addEventListener('submit',function(e){
    e.preventDefault();
    const btn=this.querySelector('button[type="submit"]');
    if(btn){btn.innerHTML='<i class="fas fa-spinner spin"></i> Sending…';btn.disabled=true;}
    setTimeout(()=>{
      window.showToast?.('✅ Message sent! We\'ll reply within 24h.','success');
      this.reset();
      if(btn){btn.innerHTML='<i class="fas fa-check"></i> Message Sent!';btn.style.background='var(--success)';
        setTimeout(()=>{btn.innerHTML='<i class="fas fa-paper-plane"></i> Send Message';btn.style.background='';btn.disabled=false;},3000);}
    },1200);
  });

  /* ── Disclosure close ── */
  document.getElementById('disclosureClose')?.addEventListener('click',function(){
    const d=document.getElementById('affiliateDisclosure');if(d)d.style.display='none';
  });

  /* ── About / Blog newsletter ── */
  ['aboutNewsletterForm','blogNewsletterForm'].forEach(id=>{
    document.getElementById(id)?.addEventListener('submit',function(e){
      e.preventDefault();
      const ei=this.querySelector('input[type="email"]');
      if(ei?.value){window.showToast?.('🎉 Subscribed!','success');ei.value='';}
    });
  });
});
