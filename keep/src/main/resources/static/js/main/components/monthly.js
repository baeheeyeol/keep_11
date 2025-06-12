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

    const dayMap = {};
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
          if (!dayMap[d]) dayMap[d] = [];
          dayMap[d].push(e);
        }
      } else {
        if (start >= monthStart && start <= monthEnd && start.getMonth() === month) {
          const d = start.getDate();
          if (!dayMap[d]) dayMap[d] = [];
          dayMap[d].push(e);
        }
        let nextWeek = new Date(start);
        nextWeek.setDate(nextWeek.getDate() + (7 - nextWeek.getDay()));
        while (nextWeek <= end) {
          if (nextWeek >= monthStart && nextWeek <= monthEnd && nextWeek.getMonth() === month) {
            const nd = nextWeek.getDate();
            if (!dayMap[nd]) dayMap[nd] = [];
            dayMap[nd].push(e);
          }
          nextWeek.setDate(nextWeek.getDate() + 7);
        }
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
            end: new Date(segEnd),
            eventStart: start
          });
          segStart = new Date(segEnd);
          segStart.setDate(segStart.getDate() + 1);
        }
      }
    });

    const prevMonth = new Date(year, month, 0);
    const prevDays = prevMonth.getDate();
    for (let i = firstDay - 1; i >= 0; i--) {
      const d = prevDays - i;
      calendar.appendChild(createDayCell(prevMonth.getFullYear(), prevMonth.getMonth(), d, [], true));
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const cell = createDayCell(year, month, d, dayMap[d] || []);
      calendar.appendChild(cell);
    }

    const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
    const nextMonth = new Date(year, month + 1, 1);
    let nextDay = 1;
    while (calendar.children.length < totalCells) {
      calendar.appendChild(createDayCell(nextMonth.getFullYear(), nextMonth.getMonth(), nextDay++, [], true));
    }

    renderSegments(calendar, segments, firstDay);
    attachRangeSelection(calendar);
  }

  function createDayCell(year, month, date, events, otherMonth = false) {
    const dayIdx = new Date(year, month, date).getDay();
    const cell = document.createElement('div');
    cell.className = 'day-cell';
    if (dayIdx === 0) cell.classList.add('sun');
    if (dayIdx === 6) cell.classList.add('sat');
    if (otherMonth) cell.classList.add('other-month');
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
        if (e.dataTransfer.setDragImage) {
          e.dataTransfer.setDragImage(bar, 0, 0);
        }
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
    const OFFSET = 2;
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
      bar.dataset.date = formatYMD(seg.eventStart);
      bar.draggable = true;
      bar.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', JSON.stringify({ id: seg.id, date: bar.dataset.date }));
        if (e.dataTransfer.setDragImage) {
          e.dataTransfer.setDragImage(bar, 0, 0);
        }
      });
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

  function attachRangeSelection(calendar) {
    if (!calendar) return;
    let selecting = false;
    let startCell = null;

    function pointerUp(e) {
      document.removeEventListener('pointerup', pointerUp);
      document.removeEventListener('pointercancel', cancel);
      if (!selecting) return;
      selecting = false;
      const endCell = e.target.closest('.day-cell') || startCell;
      if (!endCell || !startCell) return;
      let start = new Date(startCell.dataset.date);
      let end = new Date(endCell.dataset.date);
      if (start > end) {
        const tmp = start;
        start = end;
        end = tmp;
      }
      const startDay = document.getElementById('sched-start-day');
      const endDay = document.getElementById('sched-end-day');
      if (startDay && endDay && window.openScheduleModal) {
        startDay.value = formatYMD(start);
        endDay.value = formatYMD(end);
        document.getElementById('sched-start-hour').value = '00';
        document.getElementById('sched-start-min').value = '00';
        document.getElementById('sched-end-hour').value = '01';
        document.getElementById('sched-end-min').value = '00';
        window.openScheduleModal();
      }
    }

    function cancel() {
      selecting = false;
      document.removeEventListener('pointerup', pointerUp);
      document.removeEventListener('pointercancel', cancel);
    }

    calendar.addEventListener('pointerdown', e => {
      if (e.target.closest('.event-bar') || e.target.classList.contains('more-link')) return;
      const cell = e.target.closest('.day-cell');
      if (!cell || cell.classList.contains('other-month')) return;
      e.preventDefault();
      selecting = true;
      startCell = cell;
      document.addEventListener('pointerup', pointerUp);
      document.addEventListener('pointercancel', cancel);
    });
  }

  window.initMonthlySchedule = initMonthlySchedule;
})();
