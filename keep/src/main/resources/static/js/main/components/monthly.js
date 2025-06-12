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

    const singleMap = {};
    const segments = [];

    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);

    events.forEach(e => {
      const s = new Date(e.startTs);
      const eDate = new Date(e.endTs);
      const start = new Date(s.getFullYear(), s.getMonth(), s.getDate());
      const end = new Date(eDate.getFullYear(), eDate.getMonth(), eDate.getDate());
      if (end < monthStart || start > monthEnd) return;

      if (start.getTime() === end.getTime()) {
        if (start.getMonth() === month) {
          const d = start.getDate();
          if (!singleMap[d]) singleMap[d] = [];
          singleMap[d].push(e);
        }
      } else {
        let segStart = start < monthStart ? monthStart : start;
        const realEnd = end > monthEnd ? monthEnd : end;
        while (segStart <= realEnd) {
          const weekEnd = new Date(segStart);
          weekEnd.setDate(segStart.getDate() + (6 - weekEnd.getDay()));
          const segEnd = weekEnd < realEnd ? weekEnd : realEnd;
          segments.push({
            id: e.schedulesId,
            title: e.title,
            category: e.category,
            start: new Date(segStart),
            end: new Date(segEnd)
          });
          segStart = new Date(segEnd);
          segStart.setDate(segStart.getDate() + 1);
        }
      }
    });

    // fill blanks before first day
    for (let i = 0; i < firstDay; i++) {
      calendar.appendChild(createBlankCell());
    }
    // days
    for (let d = 1; d <= daysInMonth; d++) {
      const cell = createDayCell(year, month, d, singleMap[d] || []);
      calendar.appendChild(cell);
    }

    renderSegments(calendar, segments, firstDay);
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
      more.textContent = `+${events.length - MAX} 더보기`;
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

  function renderSegments(calendar, segs, firstDay) {
    if (!segs.length) return;
    const overlay = document.createElement('div');
    overlay.className = 'monthly-events-overlay';
    calendar.appendChild(overlay);

    const cellH = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue('--monthly-cell-height') || 120
    );
    const BAR_H = 18;
    const GAP = 2;
    const OFFSET = 18;
    const rows = {};
    const pct = 100 / 7;

    segs.sort((a, b) => a.start - b.start).forEach(seg => {
      const sIdx = firstDay + (seg.start.getDate() - 1);
      const eIdx = firstDay + (seg.end.getDate() - 1);
      const row = Math.floor(sIdx / 7);
      const col = sIdx % 7;
      const span = eIdx - sIdx + 1;
      if (!rows[row]) rows[row] = 0;
      const line = rows[row]++;
      const bar = document.createElement('div');
      bar.className = 'event-bar';
      bar.style.backgroundColor = seg.category;
      bar.textContent = seg.title;
      bar.dataset.id = seg.id;
      bar.style.left = `calc(${pct * col}% + 2px)`;
      bar.style.width = `calc(${pct * span}% - 4px)`;
      bar.style.top = `${row * cellH + OFFSET + line * (BAR_H + GAP)}px`;
      bar.style.height = `${BAR_H}px`;
      overlay.appendChild(bar);
      bar.addEventListener('click', () => {
        if (window.loadAndOpenScheduleModal) {
          window.loadAndOpenScheduleModal(seg.id);
        }
      });
    });
  }

  window.initMonthlySchedule = initMonthlySchedule;
})();
