
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('notification-btn');
  const modal = document.getElementById('notification-modal');
  const close = document.getElementById('notification-close');
  if (!btn || !modal || !close) return;

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
});
