
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('notification-btn');
  const badge = document.getElementById('notification-badge');
  const modal = document.getElementById('notification-modal');
  const close = document.getElementById('notification-close');
  const container = document.querySelector('.notification');
  const listEl = document.getElementById('notification-list');
  if (!btn || !modal || !close || !container || !listEl) return;

  const userId = container.dataset.userId;

  const hide = () => modal.classList.add('hidden');

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    modal.classList.toggle('hidden');
  });

  close.addEventListener('click', hide);

  document.addEventListener('click', (e) => {
    if (!modal.classList.contains('hidden') && !modal.contains(e.target) && e.target !== btn) {
      hide();
    }
  });

  function updateBadge(count) {
    if (!badge) return;
    if (count > 0) {
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  }

  function createItem(n) {
    const item = document.createElement('div');
    item.className = 'notification-item';
    item.textContent = n.title;
    item.dataset.id = n.id;
    if (n.targetUrl) item.dataset.url = n.targetUrl;
    item.addEventListener('click', async () => {
      await fetch(`/api/notifications/${n.id}/read`, { method: 'PATCH' });
      item.remove();
      updateBadge(listEl.querySelectorAll('.notification-item').length);
      if (listEl.children.length === 0) {
        listEl.innerHTML = '<p>알림이 없습니다.</p>';
      }
      if (item.dataset.url) {
        window.location.href = item.dataset.url;
      }
    });
    return item;
  }

  function renderList(list) {
    listEl.innerHTML = '';
    const unread = (list || []).filter(n => n.isRead === 'N');
    if (unread.length === 0) {
      listEl.innerHTML = '<p>알림이 없습니다.</p>';
      updateBadge(0);
      return;
    }
    unread.forEach(n => listEl.appendChild(createItem(n)));
    updateBadge(unread.length);
  }

  fetch('/api/notifications')
    .then(res => res.json())
    .then(renderList);

  if (window.SockJS && window.Stomp && userId) {
    const sock = new SockJS('/ws');
    const stomp = Stomp.over(sock);
    stomp.connect({}, () => {
      stomp.subscribe('/topic/notifications/' + userId, msg => {
        const notif = JSON.parse(msg.body);
        const existing = Array.from(listEl.querySelectorAll('.notification-item')).map(li => ({
          id: Number(li.dataset.id),
          title: li.textContent,
          targetUrl: li.dataset.url,
          isRead: 'N'
        }));
        renderList([notif, ...existing]);
      });
    });
  }
});
