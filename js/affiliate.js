/* AFFILIATE.JS — Auto-tag affiliate links */
'use strict';
(function(){
  const IDS={amazon:'meowmeow-21',daraz:'MEOW123',temu:'MEOWAFF',aliexpress:'meowmeow_site'};
  const RULES=[
    {domains:['amazon.com','amazon.co.uk','amazon.ca','amazon.in','amazon.com.au','amazon.de','amazon.com.pk'],
     apply:u=>{const url=new URL(u);url.searchParams.set('tag',IDS.amazon);return url.toString();}},
    {domains:['daraz.pk','daraz.com','daraz.lk','daraz.com.bd'],
     apply:u=>{const url=new URL(u);url.searchParams.set('ref',IDS.daraz);return url.toString();}},
    {domains:['temu.com'],
     apply:u=>{const url=new URL(u);url.searchParams.set('refer_code',IDS.temu);return url.toString();}},
    {domains:['aliexpress.com','s.click.aliexpress.com'],
     apply:u=>{const url=new URL(u);url.searchParams.set('aff_id',IDS.aliexpress);return url.toString();}}
  ];
  function tag(a){
    try{
      const href=a.href;
      if(!href||/^(javascript|mailto|#|tel)/i.test(href))return;
      const host=new URL(href).hostname.replace(/^www\./,'');
      for(const r of RULES){
        if(r.domains.some(d=>host===d||host.endsWith('.'+d))){
          a.href=r.apply(href);
          a.setAttribute('target','_blank');
          a.setAttribute('rel','noopener noreferrer sponsored');
          a.dataset.affiliate='true';
          break;
        }
      }
    }catch(e){}
  }
  function tagAll(){document.querySelectorAll('a[href]:not([data-affiliate])').forEach(tag);}
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',tagAll):tagAll();
  new MutationObserver(ms=>{
    ms.forEach(m=>{m.addedNodes.forEach(n=>{
      if(n.nodeType===1){
        if(n.tagName==='A')tag(n);
        n.querySelectorAll?.('a[href]:not([data-affiliate])').forEach(tag);
      }
    });});
  }).observe(document.body||document.documentElement,{childList:true,subtree:true});
})();
