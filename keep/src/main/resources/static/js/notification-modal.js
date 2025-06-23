
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('notification-btn');
  const modal = document.getElementById('notification-modal');
  const close = document.getElementById('notification-close');
  const container = document.querySelector('.notification');
  if (!btn || !modal || !close || !container) return;

  const userId = container.dataset.userId;
  const listEl = document.createElement('div');
  modal.appendChild(listEl);

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

  function renderList(list) {
    listEl.innerHTML = '';
    if (!list || list.length === 0) {
      listEl.innerHTML = '<p>알림이 없습니다.</p>';
      return;
    }
    list.forEach(n => {
      const item = document.createElement('div');
      const a = document.createElement('a');
      a.href = n.targetUrl || '#';
      a.textContent = n.title;
      item.appendChild(a);
      listEl.appendChild(item);
    });
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
        renderList([notif, ...Array.from(listEl.children).map(li => ({
          title: li.textContent,
          targetUrl: li.querySelector('a')?.href
        }))]);
      });
    });
  }
});
