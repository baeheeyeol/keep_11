
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('notification-btn');
  const badge = document.getElementById('notification-badge');
  const modal = document.getElementById('notification-modal');
  const close = document.getElementById('notification-close');
  const container = document.querySelector('.notification');
  const listEl = document.getElementById('notification-list');
  const moreBtn = document.getElementById('notification-more');
  if (!btn || !modal || !close || !container || !listEl || !moreBtn) return;

  const userId = container.dataset.userId;

  let allList = [];

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
      allList = allList.filter(i => i.id !== n.id);
      renderList(allList);
      if (typeof window.refreshNotificationList === 'function') {
        window.refreshNotificationList();
      }
      if (item.dataset.url) {
        window.location.href = item.dataset.url;
      }
    });
    return item;
  }

  function renderList(list) {
    allList = list.slice();
    listEl.innerHTML = '';
    const unread = allList.filter(n => n.isRead === 'N');
    const firstTen = unread.slice(0, 10);
    if (firstTen.length === 0) {
      listEl.innerHTML = '<p>알림이 없습니다.</p>';
      updateBadge(0);
      moreBtn.classList.add('hidden');
      return;
    }
    firstTen.forEach(n => listEl.appendChild(createItem(n)));
    updateBadge(unread.length);
    if (unread.length > 10) {
      moreBtn.classList.remove('hidden');
    } else {
      moreBtn.classList.add('hidden');
    }
  }

  async function loadList() {
    const res = await fetch('/api/notifications');
    const data = await res.json();
    renderList(data);
  }

  window.refreshNotificationList = loadList;

  loadList();

  if (window.SockJS && window.Stomp && userId) {
    const sock = new SockJS('/ws');
    const stomp = Stomp.over(sock);
    stomp.connect({}, () => {
      stomp.subscribe('/topic/notifications/' + userId, msg => {
        const notif = JSON.parse(msg.body);
        allList = [notif, ...allList];
        renderList(allList);
      });
    });
  }

  moreBtn.addEventListener('click', () => {
    if (window.notificationSidebar) {
      window.notificationSidebar.open(allList.filter(n => n.isRead === 'N'));
    }
    hide();
  });
});
