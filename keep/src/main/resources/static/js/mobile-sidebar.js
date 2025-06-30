(function() {
  let placeholder;
  document.addEventListener('DOMContentLoaded', function() {
    const openBtn = document.getElementById('sidebar-open');
    const container = document.getElementById('mobile-sidebar');
    if (!openBtn || !container) {
      return;
    }
    const closeBtn = container.querySelector('.sidebar-close');
    const content = container.querySelector('.sidebar-content');
    const header = document.querySelector('.header-top');

    function open() {
      if (!header || !content) return;
      placeholder = document.createElement('div');
      header.parentNode.insertBefore(placeholder, header);
      content.appendChild(header);
      container.classList.remove('hidden');
      requestAnimationFrame(() => container.classList.add('show'));
    }

    function close() {
      container.classList.remove('show');
      container.addEventListener(
        'transitionend',
        () => {
          if (placeholder && placeholder.parentNode) {
            placeholder.parentNode.replaceChild(header, placeholder);
            placeholder = null;
          }
          if (!container.querySelector('#location-sidebar.show')) {
            container.classList.add('hidden');
          }
        },
        { once: true }
      );
    }

    openBtn.addEventListener('click', open);
    closeBtn && closeBtn.addEventListener('click', close);
    window.mobileSidebar = { open, close };
  });
})();
