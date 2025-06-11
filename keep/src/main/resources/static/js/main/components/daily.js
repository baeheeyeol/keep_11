// static/js/main/components/daily.js 
(function() {
	let draggingEvt = null;
	let startY, origTop;
	let H, STEP;
	let isDragging = false;               // 실제 드래그 중인지 플래그
	const DRAG_THRESHOLD = 5;

	function onDrag(e) {
		if (!draggingEvt) return;
		const dy = e.clientY - startY;
		// 1) threshold 미만이면 아무 동작도 하지 않고 리턴
		if (!isDragging) {
			if (Math.abs(dy) < DRAG_THRESHOLD) return;

			// 2) 임계치 넘으면 진짜 드래그 시작!
			isDragging = true;
			// 드래그 중 스타일 변경
			draggingEvt._origLeft = getComputedStyle(draggingEvt).left;
			draggingEvt.style.left = '0px';
			draggingEvt.style.zIndex = '9999';
		}
		const contTop = origTop + dy;
		const maxTop = 24 * H - STEP;
		const snapped = Math.min(maxTop, Math.max(0, Math.round(contTop / STEP) * STEP));
		draggingEvt.style.top = `${snapped}px`;
	}

	function onDrop(e) {
		e.preventDefault();
                document.removeEventListener('pointermove', onDrag);
                document.removeEventListener('pointerup', onDrop);
                document.removeEventListener('pointercancel', onDrop);

		if (isDragging) {
			const snappedTop = parseFloat(draggingEvt.style.top);
			const dy = snappedTop - origTop;
			const deltaHours = dy / H;
			const deltaSnapped = Math.round(deltaHours * 4) / 4;
			updateEventTime(draggingEvt.dataset.id, deltaSnapped);
		} else {
			const card = e.target.closest('.event');
			window.loadAndOpenScheduleModal(card.dataset.id);
		}

		// 스타일 원복 및 상태 초기화
		draggingEvt.style.left = draggingEvt._origLeft;
		draggingEvt.style.zIndex = '';
		draggingEvt = null;
		isDragging = false;

	}
        async function updateEventTime(id, deltaHours) {
                if (window.saveToast && window.saveToast.showSaving) {
                        window.saveToast.showSaving();
                }
                try {
                        const res = await fetch(`/api/schedules/${id}`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ deltaHours })
                        });
                        if (!res.ok) {
                                const err = await res.json().catch(() => null);
                                const msg = err?.message || `HTTP ${res.status}`;
                                if (window.saveToast && window.saveToast.hide) {
                                        window.saveToast.hide();
                                }
                                alert(`일정 이동에 실패했습니다: ${msg}`);
                                return;
                        }
                        await initDailySchedule();
                        if (window.saveToast && window.saveToast.showSaved) {
                                window.saveToast.showSaved(id, async () => {
                                        await fetch(`/api/schedules/${id}`, {
                                                method: 'PATCH',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ deltaHours: -deltaHours })
                                        });
                                        await initDailySchedule();
                                });
                        }
                } catch (e) {
                        console.error(e);
                        if (window.saveToast && window.saveToast.hide) {
                                window.saveToast.hide();
                        }
                        alert('일정 이동 중 예외가 발생했습니다.');
                }
        }

	function initDragAndDrop() {
		const grid = document.querySelector('.schedule-grid');
		if (!grid) return;

		H = parseFloat(getComputedStyle(document.documentElement)
			.getPropertyValue('--hour-height'));
		STEP = H / 4;

		grid.addEventListener('pointerdown', e => {
			const evEl = e.target.closest('.event');
			if (!evEl) return;
			e.preventDefault();

			draggingEvt = evEl;
			isDragging = false;                    // 아직 드래그 안 함
			startY = e.clientY;
			origTop = parseFloat(getComputedStyle(evEl).top);

                        document.addEventListener('pointermove', onDrag);
                        document.addEventListener('pointerup', onDrop);
                        document.addEventListener('pointercancel', onDrop);
                });
	}

	function renderAllDayEvents(allDayEvents, dateStr) {
		const wrapperEl = document.querySelector('.events-all-day-wrapper');
		if (!wrapperEl) return;
		const listEl = wrapperEl.querySelector('.events-all-day-list');
		const oldToggle = wrapperEl.querySelector('.all-day-toggle');
		if (oldToggle) oldToggle.remove();
		const ROW_HEIGHT = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--all-day-row-height') || 20);
		const ROW_GAP = 2;

		const dayStart = new Date(dateStr + 'T00:00:00');
		const dayEnd = new Date(dayStart);
		dayEnd.setDate(dayEnd.getDate() + 1);

		const items = allDayEvents
			.map(e => ({
				id: e.schedulesId,
				title: e.title,
				category: e.category,
				start: new Date(e.startTs),
				end: new Date(e.endTs)
			}))
			.sort((a, b) => a.start - b.start);

		listEl.innerHTML = '';
		const totalRows = items.length;
		let visible = Math.min(2, totalRows);
		listEl.style.height = `${ROW_HEIGHT * visible + ROW_GAP * Math.max(0, visible - 1)}px`;

		items.forEach((evt, idx) => {
			const div = document.createElement('div');
			div.className = 'all-day-event';
			let txt = evt.title;
			if (evt.start < dayStart) txt = '◀ ' + txt;
			if (evt.end > dayEnd) txt = txt + ' ▶';
			div.textContent = txt;
			div.style.backgroundColor = evt.category;
			div.style.top = `${idx * (ROW_HEIGHT + ROW_GAP)}px`;
			div.dataset.id = evt.id;
			if (idx >= visible) div.style.display = 'none';
			div.addEventListener('click', () => {
				window.loadAndOpenScheduleModal(evt.id);
			});
			listEl.appendChild(div);
		});

		if (totalRows > 2) {
			const btn = document.createElement('button');
			btn.className = 'all-day-toggle';
			btn.textContent = `+${totalRows - 2}개 더보기`;
			let expanded = false;
			btn.onclick = () => {
				expanded = !expanded;
				visible = expanded ? totalRows : 2;
				listEl.style.height = `${ROW_HEIGHT * visible + ROW_GAP * Math.max(0, visible - 1)}px`;
				Array.from(listEl.children).forEach((el, idx) => {
					el.style.display = idx < visible ? '' : 'none';
				});
				btn.textContent = expanded ? '접기' : `+${totalRows - 2}개 더보기`;
			};
			wrapperEl.appendChild(btn);
		}
	}
	

	async function initDailySchedule() {
		const grid = document.querySelector('.schedule-grid');
		if (!grid) return;

		const dateInput = document.getElementById('current-date').dataset.selectDate;
		if (!dateInput) return;
		const [year, month, day] = dateInput.split('-').map(n => +n);
		let events = [];
		try {
			const res = await fetch(`/api/schedules?date=${dateInput}`);
			if (res.ok) events = await res.json();
		} catch (err) {
			console.error('일정 로드 실패', err);
		}

		const allDayEvents = events.filter(e => e.isFullDay);
		events = events.filter(e => !e.isFullDay);
		// 종일 일정 설정
		renderAllDayEvents(allDayEvents, dateInput);

		events.forEach(evt => {
			evt._start = new Date(evt.startTs).getTime();
			evt._end = new Date(evt.endTs).getTime();
		});

		const clusters = [];
		const seen = new Set();
		events.forEach(evt => {
			if (seen.has(evt)) return;
			const queue = [evt];
			const comp = [];
			seen.add(evt);
			while (queue.length) {
				const cur = queue.shift();
				comp.push(cur);
				events.forEach(other => {
					if (!seen.has(other) && other._start < cur._end && other._end > cur._start) {
						seen.add(other);
						queue.push(other);
					}
				});
			}
			clusters.push(comp);
		});

		clusters.forEach(cluster => {
			const cols = [];
			cluster.sort((a, b) => a._start - b._start);
			cluster.forEach(evt => {
				let placed = false;
				for (let i = 0; i < cols.length; i++) {
					if (evt._start >= cols[i]) {
						evt.colIndex = i;
						cols[i] = evt._end;
						placed = true;
						break;
					}
				}
				if (!placed) {
					evt.colIndex = cols.length;
					cols.push(evt._end);
				}
			});
			const clusterMax = cols.length;
			cluster.forEach(evt => {
				evt.clusterMaxCols = clusterMax;
			});
		});

		const container = grid.querySelector('.events-container');
		container.innerHTML = '';
                updateCurrentTimeLine();
		const H = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hour-height'));
		const GAP = 2;

		events.forEach(evt => {
			const startDate = new Date(evt.startTs);
			const durationHrs = (evt._end - evt._start) / 36e5;
			const offsetHrs = startDate.getHours() + startDate.getMinutes() / 60;
			const colPct = 100 / evt.clusterMaxCols;
			const left = evt.colIndex * colPct;
			const width = colPct;
                        const div = document.createElement('div');
                        div.className = 'event';
                        div.style.left = `calc(${left}% + ${GAP}px)`;
                        div.style.width = `calc(${width}% - ${GAP}px)`;
                        div.style.top = `${offsetHrs * H}px`;
                        div.style.height = `calc(${durationHrs * H}px - ${GAP}px)`;
                        div.style.backgroundColor = evt.category;
                        div.dataset.id = evt.schedulesId;
                        div.innerHTML = `<span class="event-title">${evt.title}</span>`;
                        container.appendChild(div);
                });
                initDragAndDrop();
                attachGridClick();
        }

        function updateCurrentTimeLine() {
                const line = document.querySelector('.current-time-line');
                if (!line) return;
                const now = new Date();
                const h = now.getHours() + now.getMinutes() / 60;
                const H = parseFloat(getComputedStyle(document.documentElement)
                        .getPropertyValue('--hour-height'));
                line.style.top = `${h * H}px`;
                const pad = n => String(n).padStart(2, '0');
                line.dataset.time = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
        }

	function attachGridClick() {
		const grid = document.querySelector('.schedule-grid');
		if (!grid || grid.dataset.modalClickAttached) return;
		const H = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hour-height'));
		const STEP = H / 4;
		let selecting = false;
		let startY = 0;
		let selectDiv = null;

		function formatTime(pos) {
			let minutes = Math.round((pos / H) * 60);
			minutes = Math.max(0, Math.min(24 * 60, Math.round(minutes / 15) * 15));
			const h = Math.floor(minutes / 60);
			const m = minutes % 60;
			return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
		}

                function openModalWithRange(topPx, bottomPx) {
                        const startMinTot = Math.round((topPx / H) * 60);
                        const endMinTot = Math.round((bottomPx / H) * 60);
                        let startHour = Math.floor(startMinTot / 60);
                        const startMin = startMinTot % 60;
                        let endHour = Math.floor(endMinTot / 60);
                        const endMin = endMinTot % 60;
                        const dateStr = document.getElementById('current-date').dataset.selectDate;
                        const [y, m, d] = dateStr.split('-').map(v => v.padStart(2, '0'));
                        const startDate = new Date(`${y}-${m}-${d}`);
                        const endDate = new Date(startDate);

                        if (startHour >= 24) {
                                startHour -= 24;
                                startDate.setDate(startDate.getDate() + 1);
                        }
                        if (endHour >= 24) {
                                endHour -= 24;
                                endDate.setDate(endDate.getDate() + 1);
                        }

                        const pad = n => String(n).padStart(2, '0');
                        document.getElementById('sched-start-day').value = `${startDate.getFullYear()}-${pad(startDate.getMonth() + 1)}-${pad(startDate.getDate())}`;
                        document.getElementById('sched-end-day').value = `${endDate.getFullYear()}-${pad(endDate.getMonth() + 1)}-${pad(endDate.getDate())}`;
                        document.getElementById('sched-start-hour').value = pad(startHour);
                        document.getElementById('sched-start-min').value = pad(startMin);
                        document.getElementById('sched-end-hour').value = pad(endHour);
                        document.getElementById('sched-end-min').value = pad(endMin);
                        if (window.openScheduleModal) window.openScheduleModal();
                }

                function pointerMove(eMove) {
                        if (!selecting) return;
                        const cur = eMove.clientY - grid.getBoundingClientRect().top;
                        const top = Math.min(startY, cur);
                        const bottom = Math.max(startY, cur);
                        selectDiv.style.top = `${top}px`;
                        selectDiv.style.height = `${bottom - top}px`;
                        selectDiv.dataset.time = `${formatTime(top)} - ${formatTime(bottom)}`;
                }

                function cancelSelection() {
                        if (!selecting) return;
                        document.removeEventListener('pointermove', pointerMove);
                        document.removeEventListener('pointerup', pointerUp);
                        document.removeEventListener('pointercancel', cancelSelection);
                        if (selectDiv) selectDiv.remove();
                        selecting = false;
                }

		function pointerUp(eUp) {
			if (!selecting) return;
                        document.removeEventListener('pointermove', pointerMove);
                        document.removeEventListener('pointerup', pointerUp);
                        document.removeEventListener('pointercancel', cancelSelection);
                        const cur = eUp.clientY - grid.getBoundingClientRect().top;
			let top = Math.min(startY, cur);
			let bottom = Math.max(startY, cur);
			top = Math.max(0, Math.round(top / STEP) * STEP);
			bottom = Math.min(24 * H, Math.round(bottom / STEP) * STEP);
			selectDiv.remove();
			selecting = false;
			openModalWithRange(top, bottom);
		}

                grid.addEventListener('pointerdown', e => {
                        if (e.target.closest('.event')) return;
                        const slot = e.target.closest('.hour-slot');
                        if (!slot) return;
                        const hourSlots = Array.from(grid.querySelectorAll('.hour-slot'));
                        const idx = hourSlots.indexOf(slot);
                        if (idx === hourSlots.length - 1) return;
                        selecting = true;
                        startY = e.clientY - grid.getBoundingClientRect().top;
                        selectDiv = document.createElement('div');
                        selectDiv.className = 'drag-select';
                        selectDiv.style.top = `${startY}px`;
                        grid.appendChild(selectDiv);
                        document.addEventListener('pointermove', pointerMove);
                        document.addEventListener('pointerup', pointerUp);
                        document.addEventListener('pointercancel', cancelSelection);
                });

                grid.addEventListener('contextmenu', e => {
                        if (!selecting) return;
                        e.preventDefault();
                        cancelSelection();
                });

                grid.addEventListener('click', e => {
                        if (selecting) return; // drag selection handled separately
                        const slot = e.target.closest('.hour-slot');
                        if (!slot) return;
                        const hourSlots = Array.from(grid.querySelectorAll('.hour-slot'));
                        const idx = hourSlots.indexOf(slot);
                        const lastIdx = hourSlots.length - 1;
                        if (idx === lastIdx) return; // ignore click on bottom dummy slot

                        const dateStr = document.getElementById('current-date').dataset.selectDate;
                        const [y, m, d] = dateStr.split('-').map(v => v.padStart(2, '0'));
                        const startDate = new Date(`${y}-${m}-${d}`);
                        const endDate = new Date(startDate);
                        let endHour = idx + 1;
                        if (endHour >= 24) {
                                endHour -= 24;
                                endDate.setDate(endDate.getDate() + 1);
                        }
                        const pad = n => String(n).padStart(2, '0');
                        document.getElementById('sched-start-day').value = `${startDate.getFullYear()}-${pad(startDate.getMonth() + 1)}-${pad(startDate.getDate())}`;
                        document.getElementById('sched-end-day').value = `${endDate.getFullYear()}-${pad(endDate.getMonth() + 1)}-${pad(endDate.getDate())}`;
                        document.getElementById('sched-start-hour').value = pad(idx);
                        document.getElementById('sched-start-min').value = '00';
                        document.getElementById('sched-end-hour').value = pad(endHour);
                        document.getElementById('sched-end-min').value = '00';
                        if (window.openScheduleModal) window.openScheduleModal();
                });
		grid.dataset.modalClickAttached = 'true';
	}

	window.initDailySchedule = initDailySchedule;
})();
