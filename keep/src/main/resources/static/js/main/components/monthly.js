// static/js/main/components/monthly.js
(function() {
  let suppressCellClick = false;
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

  function attachResize(rowCount, callback) {
    if (window._monthlyResize) {
      window.removeEventListener('resize', window._monthlyResize);
    }
    window._monthlyResize = () => {
      adjustLayout(rowCount);
      if (callback) callback();
    };
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


    const cellMap = {};
    const prevMonth = new Date(year, month, 0);
    const prevDays = prevMonth.getDate();
    for (let i = firstDay - 1; i >= 0; i--) {
      const d = prevDays - i;
      const date = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), d);
      const cell = createDayCell(date.getFullYear(), date.getMonth(), d, [], true);
      calendar.appendChild(cell);
      cellMap[formatYMD(date)] = cell;
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const cell = createDayCell(year, month, d, []);
      calendar.appendChild(cell);
      cellMap[formatYMD(date)] = cell;
    }

    const totalCells = rowCount * 7;
    const nextMonth = new Date(year, month + 1, 1);
    let nextDay = 1;
    while (calendar.children.length < totalCells) {
      const date = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), nextDay++);
      const cell = createDayCell(date.getFullYear(), date.getMonth(), date.getDate(), [], true);
      calendar.appendChild(cell);
      cellMap[formatYMD(date)] = cell;
    }

    adjustLayout(rowCount);
    const drawOverlay = () => renderEventOverlay(events, displayStart, displayEnd, calendar, cellMap, rowCount);
    drawOverlay();
    attachResize(rowCount, drawOverlay);
    attachWheelNavigation();
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
    cell.appendChild(list);

    cell.addEventListener('click', e => {
      if (suppressCellClick) {
        suppressCellClick = false;
        return;
      }
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
      suppressCellClick = true;
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

  function renderEventOverlay(events, displayStart, displayEnd, calendar, cellMap, rowCount) {
    if (!calendar) return;
    let overlay = calendar.querySelector('.monthly-events-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'monthly-events-overlay';
      calendar.appendChild(overlay);
    }
    overlay.innerHTML = '';

    const temp = document.createElement('div');
    temp.className = 'event-bar';
    temp.style.visibility = 'hidden';
    overlay.appendChild(temp);
    const BAR_HEIGHT = temp.offsetHeight || 16;
    overlay.removeChild(temp);
    const GAP = 2;
    const MAX_VISIBLE_ROWS = 3;

    const rows = Array.from({ length: rowCount }, () => []);
    const parts = [];

    const sorted = events
      .map(e => ({ ...e, start: new Date(e.startTs), end: new Date(e.endTs) }))
      .sort((a, b) => a.start - b.start);

    sorted.forEach(evt => {
      let s = evt.start;
      let e = evt.end;
      if (e < displayStart || s > displayEnd) return;
      if (s < displayStart) s = new Date(displayStart);
      if (e > displayEnd) e = new Date(displayEnd);

      let sIdx = Math.floor((s - displayStart) / 86400000);
      const eIdx = Math.floor((e - displayStart) / 86400000);

      while (sIdx <= eIdx) {
        const weekIdx = Math.floor(sIdx / 7);
        const weekEnd = (weekIdx + 1) * 7 - 1;
        const partEnd = Math.min(eIdx, weekEnd);

        const rowArr = rows[weekIdx];
        let r = -1;
        for (let i = 0; i < rowArr.length; i++) {
          if (rowArr[i] < sIdx) {
            r = i;
            break;
          }
        }
        if (r === -1) {
          r = rowArr.length;
          rowArr.push(partEnd);
        } else {
          rowArr[r] = partEnd;
        }

        parts.push({ evt, startIdx: sIdx, endIdx: partEnd, weekIdx, row: r });
        sIdx = partEnd + 1;
      }
    });

    const calRect = calendar.getBoundingClientRect();
    const eventsByDate = {};
    const hiddenCount = {};
    parts.forEach(p => {
      for (let idx = p.startIdx; idx <= p.endIdx; idx++) {
        const d = new Date(displayStart);
        d.setDate(displayStart.getDate() + idx);
        const key = formatYMD(d);
        if (!eventsByDate[key]) eventsByDate[key] = [];
        eventsByDate[key].push(p.evt);
        if (p.row >= MAX_VISIBLE_ROWS) {
          hiddenCount[key] = (hiddenCount[key] || 0) + 1;
        }
      }
    });

    parts.forEach(p => {
      if (p.row >= MAX_VISIBLE_ROWS) return;
      const sDate = new Date(displayStart);
      sDate.setDate(displayStart.getDate() + p.startIdx);
      const eDate = new Date(displayStart);
      eDate.setDate(displayStart.getDate() + p.endIdx);
      const startKey = formatYMD(sDate);
      const endKey = formatYMD(eDate);
      const startCell = cellMap[startKey];
      const endCell = cellMap[endKey];
      if (!startCell || !endCell) return;
      const sc = startCell.querySelector('.events-container').getBoundingClientRect();
      const ec = endCell.querySelector('.events-container').getBoundingClientRect();
      const left = sc.left - calRect.left;
      const right = ec.left - calRect.left + ec.width;
      const top = sc.top - calRect.top + p.row * (BAR_HEIGHT + GAP);

      const bar = document.createElement('div');
      bar.className = 'event-bar';
      bar.style.backgroundColor = p.evt.category;
      bar.textContent = p.evt.title;
      bar.dataset.id = p.evt.schedulesId;
      bar.dataset.date = formatYMD(p.evt.start);
      bar.style.left = left + 'px';
      bar.style.top = top + 'px';
      bar.style.width = (right - left) + 'px';
      bar.draggable = true;
      bar.addEventListener('dragstart', e => {
        bar._dragging = true;
        const ghost = bar.cloneNode(true);
        ghost.classList.add('drag-ghost');
        bar._ghost = ghost;
        bar.parentNode.insertBefore(ghost, bar);
        e.dataTransfer.setData('text/plain', JSON.stringify({ id: p.evt.schedulesId, date: bar.dataset.date }));
        if (e.dataTransfer.setDragImage) {
          e.dataTransfer.setDragImage(bar, 0, 0);
        }
      });
      bar.addEventListener('dragend', () => {
        if (bar._ghost) bar._ghost.remove();
        setTimeout(() => { bar._dragging = false; }, 0);
      });
      bar.addEventListener('click', () => {
        if (!bar._dragging && window.loadAndOpenScheduleModal) {
          window.loadAndOpenScheduleModal(bar.dataset.id);
        }
      });

      overlay.appendChild(bar);
    });

    Object.keys(cellMap).forEach(key => {
      const cell = cellMap[key];
      const count = hiddenCount[key] || 0;
      let link = cell.querySelector('.more-link');
      if (count > 0) {
        if (!link) {
          link = document.createElement('div');
          link.className = 'more-link';
          link.addEventListener('click', e => {
            e.stopPropagation();
            if (window.openMonthlyMoreModal) {
              window.openMonthlyMoreModal(eventsByDate[key] || []);
            }
          });
          cell.querySelector('.events-container').appendChild(link);
        }
        link.textContent = `+${count}개 더보기`;
      } else if (link) {
        link.remove();
      }
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
