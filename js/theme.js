/* THEME.JS — Dark/Light Mode */
'use strict';
(function(){
  const KEY='meowmeow-theme';
  function applyTheme(t){
    document.documentElement.setAttribute('data-theme',t);
    document.body.setAttribute('data-theme',t);
    const icon=document.getElementById('themeIcon');
    if(icon)icon.className=t==='dark'?'fas fa-moon':'fas fa-sun';
    const mob=document.getElementById('mobileThemeToggle');
    if(mob)mob.checked=t==='dark';
  }
  function save(t){try{localStorage.setItem(KEY,t);}catch(e){}}
  function load(){try{return localStorage.getItem(KEY);}catch(e){return null;}}
  function preferred(){
    const s=load();if(s)return s;
    return window.matchMedia&&window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';
  }
  const init=preferred();
  applyTheme(init);
  document.addEventListener('DOMContentLoaded',function(){
    applyTheme(init);
    document.getElementById('themeToggle')?.addEventListener('click',function(){
      const cur=document.body.getAttribute('data-theme')||'light';
      const next=cur==='dark'?'light':'dark';
      applyTheme(next);save(next);
    });
    document.getElementById('mobileThemeToggle')?.addEventListener('change',function(){
      const next=this.checked?'dark':'light';
      applyTheme(next);save(next);
    });
    if(window.matchMedia){
      window.matchMedia('(prefers-color-scheme:dark)').addEventListener('change',function(e){
        if(!load())applyTheme(e.matches?'dark':'light');
      });
    }
  });
})();
