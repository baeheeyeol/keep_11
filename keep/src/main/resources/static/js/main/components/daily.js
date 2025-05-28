// static/js/main/components/daily.js
(function() {
	let draggingEvt = null;
	let startY, origTop;
	let H, STEP;

	function onDrag(e) {
		if (!draggingEvt) return;
		const dy = e.clientY - startY;
		const contTop = origTop + dy;
		const snapped = Math.round(contTop / STEP) * STEP;
		draggingEvt.style.top = `${snapped}px`;
	}

	function onDrop(e) {
		document.removeEventListener('pointermove', onDrag);
		document.removeEventListener('pointerup', onDrop);

		const snappedTop = parseFloat(draggingEvt.style.top);
		const dy = snappedTop - origTop;
		const deltaHours = dy / H;
		const deltaSnapped = Math.round(deltaHours * 2) / 2;

		updateEventTime(draggingEvt.dataset.id, deltaSnapped);
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
			startY = e.clientY;
			origTop = parseFloat(getComputedStyle(evEl).top);

			draggingEvt._origLeft = getComputedStyle(evEl).left;
			draggingEvt.style.left = '0px';
			draggingEvt.style.zIndex = '9999';

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
				card.dataset.id = evt.scheduleId;
				listEl.appendChild(card);
			});

			if (allDayEvents.length <= MAX_SHOW) {
				toggleEl.style.display = 'none';
			} else {
				toggleEl.style.display = '';
				toggleEl.textContent = `+ 더보기 (${allDayEvents.length - MAX_SHOW})`;
			}
		}
		updateList();
	}

	async function initDailySchedule() {
		const grid = document.querySelector('.schedule-grid');
		if (!grid) return;

		const dateInput = document.getElementById('current-date');
		if (!dateInput) return;
		const [year, month, day] = dateInput.value.split('-').map(n => +n);
		const dateParam = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

		let events = [];
		try {
			const res = await fetch(`/api/schedules?date=${dateParam}`);
			if (res.ok) events = await res.json();
		} catch (err) {
			console.error('일정 로드 실패', err);
		}

		const allDayEvents = events.filter(e => e.isFullDay);
		events = events.filter(e => !e.isFullDay);
		renderAllDayEvents(allDayEvents);

		events.forEach(evt => {
			evt._start = new Date(evt.startTs).getTime();
			evt._end = new Date(evt.endTs).getTime();
		});
		events.sort((a, b) => a._start - b._start);

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

		// 렌더링 최대 9개, 초과 시 더보기 블록
		const MAX_NORMAL = 9;
		events.slice(0, MAX_NORMAL).forEach(evt => {
			
			const startDate = new Date(evt.startTs);
			const durationHrs = (evt._end - evt._start) / 36e5;
			const offsetHrs = startDate.getHours() + startDate.getMinutes() / 60;

			const colPct = 100 / evt.clusterMaxCols;
			const left = evt.colIndex * colPct;
			const width = colPct;

			const div = document.createElement('div');
			div.className = 'event';
			div.style.left = `calc(${left}% + ${GAP * evt.colIndex}px)`;
			div.style.width = `calc(${width}% - ${GAP}px)`;
			div.style.top = `${offsetHrs * H}px`;
			div.style.height = `calc(${durationHrs * H}px - ${GAP}px)`;
			div.style.backgroundColor = evt.category;
			div.dataset.id = evt.scheduleId;
			div.innerHTML = `<span class="event-title">${evt.title}</span>`;
			container.appendChild(div);
		});
		
		if (events.length > MAX_NORMAL) {
			const moreBlock = document.createElement('div');
			moreBlock.className = 'event normal-more';
			moreBlock.textContent = `+더보기 (${events.length - MAX_NORMAL})`;
			container.appendChild(moreBlock);
		}
		function drawTimeLine() {
			let line = grid.querySelector('.current-time-line');
			if (!line) {
				line = document.createElement('div');
				line.className = 'current-time-line';
				grid.appendChild(line);
			}
			const now = new Date();
			// 날짜가 다르면 숨기기
			if (now.getFullYear() !== year
				|| now.getMonth() + 1 !== month
				|| now.getDate() !== day) {
				line.style.display = 'none';
				return;
			}
			line.style.display = '';
			const offset = (now.getHours() + now.getMinutes() / 60) * H;
			line.style.top = `${offset}px`;
			// 툴팁에 시간 갱신
			const ampm = now.getHours() < 12 ? '오전' : '오후';
			const h12 = now.getHours() % 12 === 0 ? 12 : now.getHours() % 12;
			const mm = String(now.getMinutes()).padStart(2, '0');
			line.setAttribute('data-time', `${ampm} ${h12}:${mm}`);
		}

		// 즉시 + 매분 갱신
		drawTimeLine();
		const now = new Date();
		const delay = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
		setTimeout(() => {
			drawTimeLine();
			setInterval(drawTimeLine, 60 * 1000);
		}, delay);

		initDragAndDrop();
	}

	window.initDailySchedule = initDailySchedule;
})();
