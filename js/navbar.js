/* NAVBAR.JS */
'use strict';
document.addEventListener('DOMContentLoaded',function(){
  const navbar=document.getElementById('navbar');
  const menuToggle=document.getElementById('menuToggle');
  const mobileMenu=document.getElementById('mobileMenu');
  const mobileClose=document.getElementById('mobileClose');
  const overlay=document.getElementById('mobileOverlay');

  function openMenu(){
    mobileMenu?.classList.add('active');
    overlay?.classList.add('active');
    document.body.classList.add('menu-open');
    menuToggle?.setAttribute('aria-expanded','true');
  }
  function closeMenu(){
    mobileMenu?.classList.remove('active');
    overlay?.classList.remove('active');
    document.body.classList.remove('menu-open');
    menuToggle?.setAttribute('aria-expanded','false');
  }
  menuToggle?.addEventListener('click',openMenu);
  mobileClose?.addEventListener('click',closeMenu);
  overlay?.addEventListener('click',closeMenu);
  document.querySelectorAll('.mobile-nav-links a').forEach(l=>l.addEventListener('click',closeMenu));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});

  // Scroll effect
  function onScroll(){
    if(!navbar)return;
    navbar.classList.toggle('scrolled',window.scrollY>60);
  }
  window.addEventListener('scroll',onScroll,{passive:true});
  onScroll();

  // Active link
  const page=window.location.pathname.split('/').pop()||'index.html';
  document.querySelectorAll('.nav-link,.mobile-nav-links a').forEach(l=>{
    const h=l.getAttribute('href');
    if(h===page||(page===''&&h==='index.html')||(page==='index.html'&&h==='index.html'))
      l.classList.add('active');
  });

  // Smooth scroll anchors
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click',function(e){
      const t=document.querySelector(this.getAttribute('href'));
      if(t){
        e.preventDefault();closeMenu();
        const off=parseInt(getComputedStyle(document.documentElement).getPropertyValue('--navbar-height'))||72;
        window.scrollTo({top:t.getBoundingClientRect().top+window.scrollY-off,behavior:'smooth'});
      }
    });
  });
});
