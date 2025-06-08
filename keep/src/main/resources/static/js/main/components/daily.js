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
		const snapped = Math.min(1380,Math.max(0,Math.round(contTop / STEP) * STEP));
		draggingEvt.style.top = `${snapped}px`;
	}

	function onDrop(e) {
		e.preventDefault();
		document.removeEventListener('pointermove', onDrag);
		document.removeEventListener('pointerup', onDrop);

		if (isDragging) {
			const snappedTop = parseFloat(draggingEvt.style.top);
			const dy = snappedTop - origTop;
			const deltaHours = dy / H;
			const deltaSnapped = Math.round(deltaHours * 2) / 2;
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
		try {
			const res = await fetch(`/api/schedules/${id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ deltaHours })
			});
			if (!res.ok) {
				const err = await res.json().catch(() => null);
				const msg = err?.message || `HTTP ${res.status}`;
				alert(`일정 이동에 실패했습니다: ${msg}`);
				return;
			}
			await initDailySchedule();
		} catch (e) {
			console.error(e);
			alert('일정 이동 중 예외가 발생했습니다.');
		}
	}

	function initDragAndDrop() {
		const grid = document.querySelector('.schedule-grid');
		if (!grid) return;

		H = parseFloat(getComputedStyle(document.documentElement)
			.getPropertyValue('--hour-height'));
		STEP = H / 2;

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
		});
	}

	function renderAllDayEvents(allDayEvents) {
		const wrapperEl = document.querySelector('.events-all-day-wrapper');
		const listEl = wrapperEl.querySelector('.events-all-day-list');
		const toggleEl = wrapperEl.querySelector('.all-day-toggle');
		const MAX_SHOW = 5;

		function updateList() {
			listEl.innerHTML = '';
			const slice = allDayEvents.slice(0, MAX_SHOW);

			slice.forEach(evt => {
				const card = document.createElement('div');
				card.className = 'event-card';
				card.textContent = evt.title;
				card.style.backgroundColor = evt.category;
				card.dataset.id = evt.schedulesId;
				listEl.appendChild(card);
			});

			if (allDayEvents.length <= MAX_SHOW) {
				toggleEl.style.display = 'none';
			} else {
				toggleEl.style.display = '';
				toggleEl.textContent = `+ 더보기 (${allDayEvents.length - MAX_SHOW})`;
			}
		}
		listEl.addEventListener('click', e => {
			const card = e.target.closest('.event-card');
			if (!card) return;
			window.loadAndOpenScheduleModal(card.dataset.id);
		});
		updateList();
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
		//종일 일정 설정
		renderAllDayEvents(allDayEvents);

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
		//시간선 그리기 
		

		initDragAndDrop();
	}

	window.initDailySchedule = initDailySchedule;
})();
