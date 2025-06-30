(function(){
  const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('menu-toggle');
  const closeBtn = document.getElementById('sidebar-close');
  const overlay = document.getElementById('overlay');
  const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  let firstFocusable, lastFocusable;

  function openSidebar(){
    sidebar.classList.add('open');
    overlay.classList.add('active');
    toggleBtn.setAttribute('aria-expanded','true');
    sidebar.setAttribute('aria-hidden','false');
    trapFocus();
    firstFocusable.focus();
  }

  function closeSidebar(){
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
    toggleBtn.setAttribute('aria-expanded','false');
    sidebar.setAttribute('aria-hidden','true');
    toggleBtn.focus();
  }

  function trapFocus(){
    const focusables = sidebar.querySelectorAll(focusableSelectors);
    firstFocusable = focusables[0];
    lastFocusable = focusables[focusables.length - 1];
  }

  toggleBtn.addEventListener('click', openSidebar);
  closeBtn.addEventListener('click', closeSidebar);
  overlay.addEventListener('click', closeSidebar);
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape' && sidebar.classList.contains('open')){
      closeSidebar();
    }
    if(e.key === 'Tab' && sidebar.classList.contains('open')){
      const focusables = sidebar.querySelectorAll(focusableSelectors);
      if(focusables.length === 0) return;
      if(e.shiftKey){
        if(document.activeElement === firstFocusable){
          e.preventDefault();
          lastFocusable.focus();
        }
      }else{
        if(document.activeElement === lastFocusable){
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    }
  });
})();
