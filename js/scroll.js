/* SCROLL.JS */
'use strict';
document.addEventListener('DOMContentLoaded',function(){
  const bar=document.getElementById('scrollProgress');
  const btn=document.getElementById('backToTop');

  function onScroll(){
    if(bar){
      const top=window.scrollY;
      const h=document.documentElement.scrollHeight-window.innerHeight;
      bar.style.width=(h>0?top/h*100:0)+'%';
    }
    if(btn)btn.classList.toggle('visible',window.scrollY>400);
  }
  window.addEventListener('scroll',onScroll,{passive:true});
  onScroll();
  btn?.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));

  // Reveal on scroll
  const reveals=document.querySelectorAll('.reveal,[data-aos]');
  if(reveals.length){
    const obs=new IntersectionObserver(entries=>{
      entries.forEach(e=>{
        if(e.isIntersecting){
          e.target.style.opacity='1';
          e.target.style.transform='translateY(0)';
          obs.unobserve(e.target);
        }
      });
    },{threshold:0.12,rootMargin:'0px 0px -40px 0px'});
    reveals.forEach(el=>{
      el.style.opacity='0';el.style.transform='translateY(24px)';
      el.style.transition='opacity .6s ease,transform .6s ease';
      obs.observe(el);
    });
  }

  // Counter animation
  function animateCounter(el){
    const target=parseInt(el.getAttribute('data-count')||el.textContent,10);
    if(isNaN(target))return;
    const dur=1800,start=performance.now();
    function tick(now){
      const p=Math.min((now-start)/dur,1);
      const ease=1-Math.pow(1-p,3);
      el.textContent=Math.round(ease*target).toLocaleString();
      if(p<1)requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  const counters=document.querySelectorAll('.stat-number[data-count]');
  if(counters.length){
    const cobs=new IntersectionObserver(entries=>{
      entries.forEach(e=>{if(e.isIntersecting){animateCounter(e.target);cobs.unobserve(e.target);}});
    },{threshold:0.3});
    counters.forEach(c=>cobs.observe(c));
  }

  // Countdown Timer
  const hEl=document.getElementById('timer-hours');
  const mEl=document.getElementById('timer-mins');
  const sEl=document.getElementById('timer-secs');
  if(hEl&&mEl&&sEl){
    const now=new Date(),mid=new Date(now);
    mid.setHours(24,0,0,0);
    let total=Math.floor((mid-now)/1000);
    function renderTimer(){
      const h=Math.floor(total/3600),m=Math.floor((total%3600)/60),s=total%60;
      hEl.textContent=String(h).padStart(2,'0');
      mEl.textContent=String(m).padStart(2,'0');
      sEl.textContent=String(s).padStart(2,'0');
    }
    renderTimer();
    setInterval(()=>{
      if(--total<0){const n=new Date(),n2=new Date(n);n2.setHours(24,0,0,0);total=Math.floor((n2-n)/1000);}
      renderTimer();
    },1000);
  }

  // Lazy images
  if('IntersectionObserver' in window){
    const imgObs=new IntersectionObserver(entries=>{
      entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('loaded');imgObs.unobserve(e.target);}});
    },{rootMargin:'200px'});
    document.querySelectorAll('img[loading="lazy"]').forEach(i=>imgObs.observe(i));
  }
});
