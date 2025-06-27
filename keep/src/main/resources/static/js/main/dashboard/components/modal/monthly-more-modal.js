(function() {
  function init() {
    const overlay = document.getElementById('monthly-more-overlay');
    const modal = document.getElementById('monthly-more-modal');
    const closeBtn = document.getElementById('monthly-more-close');
    if (!overlay || !modal || !closeBtn) {
      return;
    }

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);
  }

  function openModal(events) {
    const overlay = document.getElementById('monthly-more-overlay');
    const modal = document.getElementById('monthly-more-modal');
    const list = document.getElementById('monthly-more-list');
    if (!overlay || !modal || !list) {
      return;
    }
    list.innerHTML = '';
    events.forEach(e => {
      const li = document.createElement('li');
      li.textContent = e.title;
      li.style.borderLeft = `4px solid ${e.category}`;
      li.dataset.id = e.schedulesId;
      li.addEventListener('click', () => {
        if (window.loadAndOpenScheduleModal) {
          window.loadAndOpenScheduleModal(e.schedulesId);
        }
      });
      list.appendChild(li);
    });
    overlay.classList.remove('hidden');
    modal.classList.add('show');
    modal.classList.remove('hidden');
  }

  function closeModal() {
    const overlay = document.getElementById('monthly-more-overlay');
    const modal = document.getElementById('monthly-more-modal');
    if (!overlay || !modal) {
      return;
    }
    modal.classList.remove('show');
    modal.addEventListener('transitionend', () => modal.classList.add('hidden'), { once: true });
    overlay.classList.add('hidden');
  }

  window.initMonthlyMoreModal = init;
  window.openMonthlyMoreModal = openModal;
})();
