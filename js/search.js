/* SEARCH.JS */
'use strict';
document.addEventListener('DOMContentLoaded',function(){
  const input=document.getElementById('searchInput');
  const results=document.getElementById('searchResults');
  const clear=document.getElementById('searchClear');
  const toggle=document.getElementById('searchToggle');
  const navSearch=document.getElementById('navSearch');
  if(!input)return;

  // Product data — populated from PRODUCTS global if available
  function getProducts(){return window.PRODUCTS&&Array.isArray(window.PRODUCTS)?window.PRODUCTS:[];}

  function hl(text,q){
    const r=new RegExp('('+q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','gi');
    return text.replace(r,'<strong style="color:var(--accent)">$1</strong>');
  }

  function renderResults(q){
    if(!q||q.length<2){close();return;}
    const ps=getProducts();
    const matches=ps.filter(p=>
      p.name.toLowerCase().includes(q.toLowerCase())||
      (p.category||'').toLowerCase().includes(q.toLowerCase())
    ).slice(0,7);
    if(!matches.length){
      results.innerHTML=`<div class="search-no-results"><i class="fas fa-search"></i> No results for "<strong>${q}</strong>"</div>`;
    }else{
      results.innerHTML=matches.map(p=>`
        <div class="search-result-item" data-link="${p.link||'products.html'}">
          <img src="${p.image||''}" alt="${p.name}" loading="lazy" onerror="this.src='https://placehold.co/42x42/F3F4F6/9CA3AF?text=?'">
          <div><div class="result-name">${hl(p.name,q)}</div><div class="result-price">$${p.price}</div></div>
        </div>`).join('');
      results.querySelectorAll('.search-result-item').forEach(it=>{
        it.addEventListener('click',function(){
          if(this.dataset.link&&this.dataset.link!=='#')window.open(this.dataset.link,'_blank','noopener');
          close();input.value='';
        });
      });
    }
    results.classList.add('open');results.style.display='block';
  }

  function close(){
    if(results){results.classList.remove('open');results.style.display='none';}
  }

  let dt;
  input.addEventListener('input',function(){
    const v=this.value.trim();
    if(clear)clear.style.display=v?'block':'none';
    clearTimeout(dt);dt=setTimeout(()=>renderResults(v),220);
  });
  clear?.addEventListener('click',()=>{input.value='';clear.style.display='none';close();input.focus();});
  toggle?.addEventListener('click',()=>{
    if(navSearch){
      const vis=navSearch.style.display==='block';
      navSearch.style.display=vis?'':'block';
      if(!vis)input.focus();
    }
  });
  document.addEventListener('click',e=>{
    if(!e.target.closest('#navSearch')&&!e.target.closest('#searchToggle'))close();
  });
  input.addEventListener('keydown',e=>{
    if(e.key==='Escape'){close();input.blur();}
    if(e.key==='Enter'){const f=results?.querySelector('.search-result-item');if(f)f.click();}
  });
});
