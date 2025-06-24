(function() {
  function init() {
    const overlay = document.getElementById('notification-sidebar-overlay');
    const sidebar = document.getElementById('notification-sidebar');
    const closeBtn = document.getElementById('notification-sidebar-close');
    if (!overlay || !sidebar || !closeBtn) return;
    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', close);
  }

  function createItem(n) {
    const li = document.createElement('li');
    li.textContent = n.title;
    li.dataset.id = n.id;
    if (n.targetUrl) li.dataset.url = n.targetUrl;
    li.addEventListener('click', async () => {
      await fetch(`/api/notifications/${n.id}/read`, { method: 'PATCH' });
      li.remove();
      if (document.querySelectorAll('#notification-sidebar-list li').length === 0) {
        const empty = document.createElement('li');
        empty.textContent = '알림이 없습니다.';
        document.getElementById('notification-sidebar-list').appendChild(empty);
      }
      if (typeof window.refreshNotificationList === 'function') {
        window.refreshNotificationList();
      }
      if (li.dataset.url) {
        window.location.href = li.dataset.url;
      }
    });
    return li;
  }

  function open(list) {
    const overlay = document.getElementById('notification-sidebar-overlay');
    const sidebar = document.getElementById('notification-sidebar');
    const ul = document.getElementById('notification-sidebar-list');
    if (!overlay || !sidebar || !ul) return;
    ul.innerHTML = '';
    if (!list || list.length === 0) {
      const li = document.createElement('li');
      li.textContent = '알림이 없습니다.';
      ul.appendChild(li);
    } else {
      list.forEach(n => ul.appendChild(createItem(n)));
    }
    overlay.classList.remove('hidden');
    sidebar.classList.remove('hidden');
    requestAnimationFrame(() => sidebar.classList.add('show'));
  }

  function close() {
    const overlay = document.getElementById('notification-sidebar-overlay');
    const sidebar = document.getElementById('notification-sidebar');
    if (!overlay || !sidebar) return;
    sidebar.classList.remove('show');
    sidebar.addEventListener('transitionend', () => sidebar.classList.add('hidden'), { once: true });
    overlay.classList.add('hidden');
  }

  window.notificationSidebar = { init, open, close };
})();
