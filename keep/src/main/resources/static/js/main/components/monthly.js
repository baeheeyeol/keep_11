// static/js/main/components/monthly.js
(function() {
  function formatYMD(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  async function initMonthlySchedule() {
    const input = document.getElementById('current-date');
    if (!input) return;

    const [yearStr, monthStr] = input.dataset.selectDate.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10) - 1;
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);

    const res = await fetch(`/api/schedules?start=${formatYMD(first)}&end=${formatYMD(last)}`);
    const events = res.ok ? await res.json() : [];

    renderCalendar(first, events);
  }

  function renderCalendar(firstDate, events) {
    const calendar = document.querySelector('.monthly-calendar');
    if (!calendar) return;
    calendar.innerHTML = '';

    const year = firstDate.getFullYear();
    const month = firstDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const eventMap = {};
    events.forEach(e => {
      const start = new Date(e.startTs);
      const end = new Date(e.endTs);
      const cur = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      const last = new Date(end.getFullYear(), end.getMonth(), end.getDate());
      while (cur <= last) {
        if (cur.getMonth() === month) {
          const d = cur.getDate();
          if (!eventMap[d]) eventMap[d] = [];
          eventMap[d].push(e);
        }
        cur.setDate(cur.getDate() + 1);
      }
    });

    // fill blanks before first day
    for (let i = 0; i < firstDay; i++) {
      calendar.appendChild(createBlankCell());
    }
    // days
    for (let d = 1; d <= daysInMonth; d++) {
      const cell = createDayCell(year, month, d, eventMap[d] || []);
      calendar.appendChild(cell);
    }
  }

  function createBlankCell() {
    const div = document.createElement('div');
    div.className = 'day-cell empty';
    return div;
  }

  function createDayCell(year, month, date, events) {
    const dayIdx = new Date(year, month, date).getDay();
    const cell = document.createElement('div');
    cell.className = 'day-cell';
    if (dayIdx === 0) cell.classList.add('sun');
    if (dayIdx === 6) cell.classList.add('sat');
    cell.dataset.date = `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;

    const num = document.createElement('span');
    num.className = 'day-number';
    num.textContent = date;
    cell.appendChild(num);

    const list = document.createElement('div');
    list.className = 'events-container';
    const MAX = 3;
    events.slice(0, MAX).forEach(evt => {
      const bar = document.createElement('div');
      bar.className = 'event-bar';
      bar.style.backgroundColor = evt.category;
      bar.textContent = evt.title;
      bar.dataset.id = evt.schedulesId;
      bar.dataset.date = cell.dataset.date;
      bar.draggable = true;
      bar.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', JSON.stringify({ id: evt.schedulesId, date: bar.dataset.date }));
      });
      list.appendChild(bar);
    });
    if (events.length > MAX) {
      const more = document.createElement('div');
      more.className = 'more-link';
      more.textContent = `+${events.length - MAX}`;
      more.addEventListener('click', e => {
        e.stopPropagation();
        if (window.openMonthlyMoreModal) {
          window.openMonthlyMoreModal(events);
        }
      });
      list.appendChild(more);
    }
    cell.appendChild(list);
    list.addEventListener('click', e => {
      const bar = e.target.closest('.event-bar');
      if (bar) {
        window.loadAndOpenScheduleModal(bar.dataset.id);
      }
    });

    cell.addEventListener('click', e => {
      if (e.target.closest('.event-bar')) return;
      const startDay = document.getElementById('sched-start-day');
      const endDay = document.getElementById('sched-end-day');
      if (startDay && endDay && window.openScheduleModal) {
        const currentInput = document.getElementById('current-date');
        currentInput.dataset.selectDate = cell.dataset.date;
        if (window.updateDisplay) window.updateDisplay(currentInput.dataset.view);
        startDay.value = cell.dataset.date;
        endDay.value = cell.dataset.date;
        document.getElementById('sched-start-hour').value = '00';
        document.getElementById('sched-start-min').value = '00';
        document.getElementById('sched-end-hour').value = '01';
        document.getElementById('sched-end-min').value = '00';
        window.openScheduleModal();
      }
    });

    cell.addEventListener('dragover', e => e.preventDefault());
    cell.addEventListener('drop', async e => {
      e.preventDefault();
      const data = e.dataTransfer.getData('text/plain');
      if (!data) return;
      const info = JSON.parse(data);
      const from = new Date(info.date);
      const to = new Date(cell.dataset.date);
      const deltaDays = (to - from) / (86400000);
      if (isNaN(deltaDays)) return;
      if (window.saveToast && window.saveToast.showSaving) {
        window.saveToast.showSaving();
      }
      try {
        await fetch(`/api/schedules/${info.id}/moveWeekly`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deltaDays, deltaHours: 0 })
        });
        initMonthlySchedule();
        if (window.saveToast && window.saveToast.showSaved) {
          window.saveToast.showSaved(info.id, async () => {
            await fetch(`/api/schedules/${info.id}/moveWeekly`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ deltaDays: -deltaDays, deltaHours: 0 })
            });
            initMonthlySchedule();
          });
        }
      } catch (err) {
        console.error(err);
        if (window.saveToast && window.saveToast.hide) {
          window.saveToast.hide();
        }
      }
    });

    return cell;
  }

  window.initMonthlySchedule = initMonthlySchedule;
})();
