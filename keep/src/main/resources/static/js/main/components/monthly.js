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
    const start = new Date(year, month, 1 - first.getDay());
    const end = new Date(last);
    end.setDate(end.getDate() + (6 - end.getDay()));

    const res = await fetch(`/api/schedules?start=${formatYMD(start)}&end=${formatYMD(end)}`);
    const events = res.ok ? await res.json() : [];

    renderCalendar(first, events);
  }

  function adjustLayout(rowCount) {
    const container = document.querySelector('.monthly-calendar-container');
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const avail = window.innerHeight - rect.top;
    container.style.height = `${avail}px`;
    const header = container.querySelector('.weekday-header');
    const headerH = header ? header.offsetHeight : 0;
    const cellH = Math.floor((avail - headerH) / rowCount);
    document.documentElement.style.setProperty('--monthly-cell-height', `${cellH}px`);
  }

  function attachWheelNavigation() {
    const container = document.querySelector('.monthly-calendar-container');
    if (!container) return;
    if (container._wheelHandler) {
      container.removeEventListener('wheel', container._wheelHandler);
    }
    container._wheelHandler = function(e) {
      e.preventDefault();
      if (e.deltaY > 0) {
        document.getElementById('next-date')?.click();
      } else if (e.deltaY < 0) {
        document.getElementById('prev-date')?.click();
      }
    };
    container.addEventListener('wheel', container._wheelHandler, { passive: false });
  }

  function attachResize(rowCount) {
    if (window._monthlyResize) {
      window.removeEventListener('resize', window._monthlyResize);
    }
    window._monthlyResize = () => adjustLayout(rowCount);
    window.addEventListener('resize', window._monthlyResize);
  }

  function renderCalendar(firstDate, events) {
    const calendar = document.querySelector('.monthly-calendar');
    if (!calendar) return;
    calendar.innerHTML = '';

    const year = firstDate.getFullYear();
    const month = firstDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const rowCount = Math.ceil((firstDay + daysInMonth) / 7);
    const displayStart = new Date(year, month, 1 - firstDay);
    const displayEnd = new Date(displayStart);
    displayEnd.setDate(displayStart.getDate() + rowCount * 7 - 1);

    const dayMap = {};
    const segments = [];

    events.forEach(e => {
      const s = new Date(e.startTs);
      const eDate = new Date(e.endTs);
      const start = new Date(s.getFullYear(), s.getMonth(), s.getDate());
      const end = new Date(eDate.getFullYear(), eDate.getMonth(), eDate.getDate());
      if (end < displayStart || start > displayEnd) return;

      const isSingleDay = start.getTime() === end.getTime();

      if (isSingleDay) {
        const firstVisible = start < displayStart ? displayStart : start;
        const key = formatYMD(firstVisible);
        if (!dayMap[key]) dayMap[key] = [];
        dayMap[key].push(e);
      } else {
        let segStart = start < displayStart ? displayStart : start;
        const realEnd = end > displayEnd ? displayEnd : end;
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
      const date = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), d);
      const key = formatYMD(date);
      calendar.appendChild(createDayCell(date.getFullYear(), date.getMonth(), d, dayMap[key] || [], true));
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const key = formatYMD(date);
      const cell = createDayCell(year, month, d, dayMap[key] || []);
      calendar.appendChild(cell);
    }

    const totalCells = rowCount * 7;
    const nextMonth = new Date(year, month + 1, 1);
    let nextDay = 1;
    while (calendar.children.length < totalCells) {
      const date = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), nextDay++);
      const key = formatYMD(date);
      calendar.appendChild(createDayCell(date.getFullYear(), date.getMonth(), date.getDate(), dayMap[key] || [], true));
    }

    adjustLayout(rowCount);
    attachResize(rowCount);
    attachWheelNavigation();
    renderSegments(calendar, segments, displayStart);
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

  function renderSegments(calendar, segs, displayStart) {
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
      const sIdx = Math.floor((seg.start - displayStart) / 86400000);
      const eIdx = Math.floor((seg.end - displayStart) / 86400000);
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
      bar.dataset.col = col;
      bar.dataset.row = row;
      bar.dataset.span = span;
      bar.style.left = `calc(${pct * col}% + 2px)`;
      bar.style.width = `calc(${pct * span}% - 4px)`;
      bar.style.top = `${row * cellH + OFFSET + line * (BAR_H + GAP)}px`;
      bar.style.height = `${BAR_H}px`;
      overlay.appendChild(bar);
      enableMonthlyDrag(bar);
      bar.addEventListener('click', () => {
        if (window.loadAndOpenScheduleModal) {
          window.loadAndOpenScheduleModal(seg.id);
        }
      });
    });
  }

  function enableMonthlyDrag(bar) {
    const calendar = document.querySelector('.monthly-calendar');
    if (!calendar) return;
    const percentPerDay = 100 / 7;
    let startX, startCol, startPct, pointerId, ghost;

    function onMove(e) {
      if (e.pointerId !== pointerId) return;
      const deltaX = e.clientX - startX;
      const dayWidth = calendar.getBoundingClientRect().width / 7;
      const deltaDays = Math.round(deltaX / dayWidth);
      bar.style.left = `calc(${startPct + deltaDays * percentPerDay}% + 2px)`;
    }

    async function onUp(e) {
      if (e.pointerId !== pointerId) return;
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      if (ghost) ghost.remove();
      bar.style.zIndex = '';
      const endPctMatch = bar.style.left.match(/([\d.]+)%/);
      const endPct = endPctMatch ? parseFloat(endPctMatch[1]) : startPct;
      const deltaDays = Math.round((endPct - startPct) / percentPerDay);
      if (deltaDays !== 0) {
        if (window.saveToast && window.saveToast.showSaving) {
          window.saveToast.showSaving();
        }
        try {
          await fetch(`/api/schedules/${bar.dataset.id}/moveWeekly`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ deltaDays, deltaHours: 0 })
          });
          initMonthlySchedule();
          if (window.saveToast && window.saveToast.showSaved) {
            window.saveToast.showSaved(bar.dataset.id, async () => {
              await fetch(`/api/schedules/${bar.dataset.id}/moveWeekly`, {
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
      }
    }

    bar.style.touchAction = 'none';
    bar.addEventListener('pointerdown', e => {
      e.preventDefault();
      pointerId = e.pointerId;
      startX = e.clientX;
      startCol = Number(bar.dataset.col) || 0;
      const match = bar.style.left.match(/([\d.]+)%/);
      startPct = match ? parseFloat(match[1]) : startCol * percentPerDay;
      ghost = bar.cloneNode(true);
      ghost.classList.add('drag-ghost');
      ghost.style.pointerEvents = 'none';
      ghost.style.left = bar.style.left;
      ghost.style.top = bar.style.top;
      ghost.style.width = bar.style.width;
      ghost.style.height = bar.style.height;
      bar.parentNode.insertBefore(ghost, bar);
      bar.style.zIndex = '100';
      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
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
