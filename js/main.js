/* MAIN.JS — Global Utilities */
'use strict';

/* ── Toast ── */
window.showToast=function(msg,type='default',dur=3800){
  const c=document.getElementById('toastContainer');if(!c)return;
  const icons={success:'fas fa-check-circle',error:'fas fa-times-circle',warning:'fas fa-exclamation-circle',default:'fas fa-bell'};
  const t=document.createElement('div');
  t.className=`toast toast-${type}`;
  t.innerHTML=`<i class="${icons[type]||icons.default}" style="flex-shrink:0;font-size:1.1rem"></i><span style="flex:1;font-size:.9rem">${msg}</span><button class="toast-close" aria-label="Close"><i class="fas fa-times"></i></button>`;
  c.appendChild(t);
  t.querySelector('.toast-close').addEventListener('click',()=>removeToast(t));
  t._timer=setTimeout(()=>removeToast(t),dur);
};
function removeToast(t){
  clearTimeout(t._timer);
  t.style.transition='all .3s ease';t.style.opacity='0';t.style.transform='translateX(110%)';
  setTimeout(()=>t.remove(),300);
}

/* ── Cart ── */
window.getCart=function(){try{return JSON.parse(localStorage.getItem('mm_cart')||'[]');}catch(e){return[];}};
window.saveCart=function(cart){try{localStorage.setItem('mm_cart',JSON.stringify(cart));window.updateCartBadge();}catch(e){}};
window.updateCartBadge=function(){
  try{
    const cart=window.getCart();
    const total=cart.reduce((s,i)=>s+(i.qty||1),0);
    document.querySelectorAll('#cartCount').forEach(el=>{
      el.textContent=total;
      el.style.display=total>0?'flex':'none';
    });
  }catch(e){}
};
window.addToCart=function(name,price,img,shop){
  const cart=window.getCart();
  const idx=cart.findIndex(i=>i.name===name);
  if(idx>-1){cart[idx].qty=(cart[idx].qty||1)+1;}
  else{cart.push({name,price:parseFloat(price)||0,img:img||'',shop:shop||'',qty:1});}
  window.saveCart(cart);
  window.showToast(`"${name.substring(0,26)}…" added to cart 🛒`,'success');
};

/* ── Delegate clicks ── */
document.addEventListener('click',function(e){
  // Add to cart
  const addBtn=e.target.closest('.add-to-cart-btn');
  if(addBtn){
    e.preventDefault();
    window.addToCart(addBtn.dataset.name||'Product',addBtn.dataset.price||'0',addBtn.dataset.img||'',addBtn.dataset.shop||'');
    const orig=addBtn.innerHTML;
    addBtn.innerHTML='<i class="fas fa-check"></i> Added!';
    addBtn.style.background='var(--success)';
    setTimeout(()=>{addBtn.innerHTML=orig;addBtn.style.background='';},1800);
    return;
  }
  // Wishlist
  const wb=e.target.closest('.wishlist-toggle');
  if(wb){
    e.preventDefault();
    const active=wb.classList.toggle('active');
    const ic=wb.querySelector('i');
    if(ic)ic.className=active?'fas fa-heart':'far fa-heart';
    const name=wb.closest('.product-card')?.querySelector('.product-name')?.textContent||'Item';
    window.showToast(active?`❤️ "${name.substring(0,22)}…" saved`:'Removed from wishlist','default');
    return;
  }
  // Quick view
  if(e.target.closest('.quick-view-btn')){e.preventDefault();window.showToast('Quick view coming soon!','default');return;}
  // Load more
  const lb=e.target.closest('.load-more-btn');
  if(lb){lb.innerHTML='<i class="fas fa-spinner spin"></i> Loading…';setTimeout(()=>{lb.innerHTML='<i class="fas fa-check"></i> All posts loaded';lb.disabled=true;},1400);return;}
});

/* ── Newsletter forms ── */
document.addEventListener('submit',function(e){
  const f=e.target;
  const ids=['newsletter-form','newsletterForm','aboutNewsletterForm','blogNewsletterForm'];
  if(ids.includes(f.id)){
    e.preventDefault();
    const ei=f.querySelector('input[type="email"]');
    const msg=document.getElementById('newsletter-msg');
    if(ei?.value){
      if(msg){msg.textContent='✅ Thank you for subscribing!';msg.style.color='#10B981';}
      window.showToast('🎉 Subscribed successfully!','success');
      ei.value='';
    }
  }
});

/* ── Init ── */
document.addEventListener('DOMContentLoaded',function(){
  window.updateCartBadge();
  console.log('%c🐾 MeowMeow Store','color:#7C3AED;font-size:14px;font-weight:bold');
});
