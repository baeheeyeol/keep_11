/* static/js/main/components/weekly.js
*/

(function() {
	/**
	 * initWeeklySchedule:
	 *  1) 주간 시작·끝 날짜 계산
	 *  2) /api/schedules?start=YYYY-MM-DD&end=YYYY-MM-DD 호출
	 *  3) 기존 이벤트 제거, 현재 시간선 업데이트
	 *  4) 이벤트를 요일별로 모아서 “열(column)”을 동적으로 할당
	 *     - 같은 요일 내 이벤트들을 시작 시간 기준으로 정렬
	 *     - “slotEndTimes” 배열로 각 열이 사용 중인 끝 시간을 추적
	 *     - 각 이벤트를 가장 낮은 인덱스의 빈 열에 배치하거나 새 열 생성
	 *     - 최종적으로 각 열 수 = maxConcurrent → 너비 계산
	 *  5) createEventBlock 및 makeDraggable 호출
	 */
	async function initWeeklySchedule() {
		const currentDateInput = document.getElementById('current-date');
		const range = currentDateInput.value; // e.g. "06.02-06.08"
		const [sMM, sDD, eMM, eDD] = range.match(/(\d{2})\.(\d{2})-(\d{2})\.(\d{2})/).slice(1);
		const year = parseInt(currentDateInput.dataset.selectDate.split('-')[0], 10);
		const weekStart = new Date(year, sMM - 1, sDD);
		const weekEnd = new Date(year, eMM - 1, eDD);
		// 2) API 호출
		const res = await fetch(
			`/api/schedules?start=${formatYMD(weekStart)}&end=${formatYMD(weekEnd)}`
		);
		const schedules = await res.json(); // [{ schedulesId, title, startTs, endTs, category, ... }, ...]

		const ALL_DAY_MS = 24 * 60 * 60 * 1000;
		const allDayEvents = [];
		const normalSchedules = [];

		schedules.forEach(sch => {
			const s = new Date(sch.startTs);
			const e = new Date(sch.endTs);
			if (e - s >= ALL_DAY_MS) {
				allDayEvents.push(sch);
			} else {
				normalSchedules.push(sch);
			}
		});

		renderAllDayEvents(allDayEvents, weekStart, weekEnd);

		// 3) 기존 이벤트 제거 & 현재시간선 업데이트
		const container = document.querySelector('.events-container');
		container.innerHTML = '';
		updateCurrentTimeLine();
		// CSS 변수 읽기
		const slotHeight = parseFloat(
			getComputedStyle(document.documentElement).getPropertyValue('--hour-height')
		);
		const percentPerDay = 100 / 7;

		attachGridClick();

		// 4) 블록 데이터 생성 (단일/크로스데이 모두 모아서 한 리스트로)
		//    startMin/endMin: “분 단위”로 정렬 및 배치 판단에 사용
		const blocks = [];
		normalSchedules.forEach(evt => {
			const start = new Date(evt.startTs);
			const end = new Date(evt.endTs);
			const startHourFrac = start.getHours() + start.getMinutes() / 60;
			const endHourFrac = end.getHours() + end.getMinutes() / 60;

			if (sameDate(start, end)) {
				// 같은 날
				blocks.push({
					id: evt.schedulesId,
					dayIdx: start.getDay(),          // 0=일요일,1=월요일,...
					topPx: startHourFrac * slotHeight,
					heightPx: (endHourFrac - startHourFrac) * slotHeight,
					category: evt.category,
					title: evt.title,
					startMin: Math.round(startHourFrac * 60),
					endMin: Math.round(endHourFrac * 60)
				});
			} else {
				// 크로스데이 → 두 개로 분리
				// 첫째 날: start ~ 자정
				blocks.push({
					id: evt.schedulesId,
					dayIdx: start.getDay(),
					topPx: startHourFrac * slotHeight,
					heightPx: (24 - startHourFrac) * slotHeight,
					category: evt.category,
					title: evt.title,
					startMin: Math.round(startHourFrac * 60),
					endMin: 24 * 60
				});
				// 둘째 날: 자정 ~ end
				blocks.push({
					id: evt.schedulesId,
					dayIdx: end.getDay(),
					topPx: 0,
					heightPx: endHourFrac * slotHeight,
					category: evt.category,
					title: evt.title,
					startMin: 0,
					endMin: Math.round(endHourFrac * 60)
				});
			}
		});

		// 5) 요일별로 그룹화
		const byDay = {};
		for (let d = 0; d < 7; d++) byDay[d] = [];
		blocks.forEach((b, idx) => {
			// 추후 참조를 위해 인덱스를 데이터에 저장
			b._idx = idx;
			byDay[b.dayIdx].push(b);
		});

		// 6) 요일별 "열(column)" 동적 배치 - 겹치는 구간만 나눠서 계산
		Object.values(byDay).forEach(dayBlocks => {
			if (dayBlocks.length === 0) return;

			// 이벤트별 시작/끝 값 보조 속성
			dayBlocks.forEach(evt => {
				evt._start = evt.startMin;
				evt._end = evt.endMin;
			});

			const clusters = [];
			const seen = new Set();
			dayBlocks.forEach(evt => {
				if (seen.has(evt)) return;
				const queue = [evt];
				const comp = [];
				seen.add(evt);
				while (queue.length) {
					const cur = queue.shift();
					comp.push(cur);
					dayBlocks.forEach(other => {
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

			dayBlocks.forEach(evt => {
				const widthPerCluster = percentPerDay / evt.clusterMaxCols;
				evt.percentWidth = widthPerCluster;
				evt.leftOffsetPct = evt.dayIdx * percentPerDay + evt.colIndex * widthPerCluster;
			});
		});

		// 7) 실제 DOM에 이벤트 블록 생성
		blocks.forEach(b => {
			const el = createEventBlock({
				leftPct: b.leftOffsetPct,
				widthPct: b.percentWidth,
				topPx: b.topPx,
				heightPx: b.heightPx,
				schedulesId: b.id,
				category: b.category,
				title: b.title,
				dayIdx: b.dayIdx
			});
			makeDraggable([el]);
		});
	}

	/**
	 * createEventBlock(options):
	 *  - leftPct: 이벤트 블록의 left 위치(%)
	 *  - widthPct: 이벤트 블록의 width(%)
	 *  - topPx: 이벤트 블록의 top(px)
	 *  - heightPx: 이벤트 블록의 height(px)
	 *  - schedulesId: 블록에 할당할 일정 ID
	 *  - category: backgroundColor
	 *  - title: 카드 내 표시할 텍스트
	 *  - dayIdx: 원본 요일 인덱스(0~6) - 드래그 시 원본 칼럼 복원용
	 */
	function createEventBlock({ leftPct, widthPct, topPx, heightPx, schedulesId, category, title, dayIdx }) {
		const container = document.querySelector('.events-container');
		const div = document.createElement('div');
		div.classList.add('event');

		// 위치 및 크기 설정
		const GAP = 2; // events 간격
		div.style.left = `calc(${leftPct}% + ${GAP}px)`;
		div.style.width = `calc(${widthPct}% - ${GAP}px)`;
		div.style.top = `${topPx}px`;
		div.style.height = `calc(${heightPx}px - ${GAP}px)`;
		div.style.backgroundColor = category;
		div.innerHTML = `<span class="event-title">${title}</span>`;

		// 데이터 속성
		div.dataset.id = schedulesId;
		div.dataset.leftPct = leftPct;
		div.dataset.topPx = topPx;
		div.dataset.dayIdx = dayIdx;

		// “클릭 vs 드래그” 구분용 플래그
		div.__isDragging = false;
		div.addEventListener('click', e => {
			e.stopPropagation();
			if (div.__isDragging) {
				// 드래그 중에 발생한 클릭이라면 무시
				div.__isDragging = false;
				return;
			}
			window.loadAndOpenScheduleModal(schedulesId);
		});

                container.appendChild(div);
                return div;
	}

	/**
	 * makeDraggable(eventBlocks):
		 *  - eventBlocks: [HTMLElement, ...] 하나 또는 두 개(크로스데이) 블록
		 *  → 각 블록을 위아래(15분 단위)로 드래그 가능하며 같은 요일 내에서만 이동한다.
		 *  → 그리드 바깥으로 벗어나지 않도록 경계를 제한.
		 *  → 드래그 끝나면 fetch PATCH 요청( deltaDays, deltaHours ) 후 전체 다시 렌더링.
	 */
	function makeDraggable(eventBlocks) {
		const grid = document.getElementById('schedule-grid');
		if (!grid) return;

		let gridRect = grid.getBoundingClientRect();
		function updateGridRect() {
			gridRect = grid.getBoundingClientRect();
		}
		window.addEventListener('resize', updateGridRect);

		const slotHeight = parseFloat(
			getComputedStyle(document.documentElement).getPropertyValue('--hour-height')
		);
		const quarterSlot = slotHeight / 4;                     // 15분 단위
		const bottomSlotHeight = parseFloat(
			getComputedStyle(document.documentElement).getPropertyValue('--bottom-slot-height')
		);
		const totalGridHeight = 24 * slotHeight + bottomSlotHeight;
		const percentPerDay = 100 / 7;

		let originals, pressedPointerId, scheduleId, startX, startY;

		eventBlocks.forEach(block => {
			block.style.touchAction = 'none';  // 터치 스크롤 방지
			block.addEventListener('pointerdown', pointerDownHandler);
		});

		function pointerDownHandler(e) {
			e.preventDefault();
			e.stopPropagation();

			updateGridRect();
			pressedPointerId = e.pointerId;
			startX = e.clientX;
			startY = e.clientY;

			// 드래그 시작 전 원본 정보 저장
			originals = eventBlocks.map(el => {
				const origDayIdx = Number(el.dataset.dayIdx);
				const origTopPx = parseFloat(el.dataset.topPx);
				el.__isDragging = false;
				return { el, origDayIdx, origTopPx };
			});

			scheduleId = eventBlocks[0].dataset.id;
			eventBlocks.forEach(el => (el.style.zIndex = 50));

			document.addEventListener('pointermove', pointerMoveHandler);
			document.addEventListener('pointerup', pointerUpHandler);
		}

		function pointerMoveHandler(eMove) {
			if (eMove.pointerId !== pressedPointerId) return;
			eMove.preventDefault();

			// 드래그 중임을 표시
			eventBlocks.forEach(el => (el.__isDragging = true));

			const deltaX = eMove.clientX - startX;
			const deltaY = eMove.clientY - startY;
			const dayWidthPx = gridRect.width / 7;

			originals.forEach(o => {
				// 1) 세로 이동: 원본 top + deltaY → 15분 단위로 스냅
				let rawTop = o.origTopPx + deltaY;
				const minTop = 0;
				const maxTop = totalGridHeight - o.el.clientHeight;
				if (rawTop < minTop) rawTop = minTop;
				if (rawTop > maxTop) rawTop = maxTop;
				const snappedTop = Math.round(rawTop / quarterSlot) * quarterSlot;
				o.el.style.top = `${snappedTop}px`;

				// 2) 가로 이동: 요일 경계를 넘어 이동 가능
				let newDay = Math.round((o.origDayIdx * dayWidthPx + deltaX) / dayWidthPx);
				if (newDay < 0) newDay = 0;
				if (newDay > 6) newDay = 6;
				o.el.style.left = `calc(${newDay * percentPerDay}% )`;
			});
		}

		async function pointerUpHandler(eUp) {
			if (eUp.pointerId !== pressedPointerId) return;
			eventBlocks.forEach(el => (el.style.zIndex = ''));

			// origDayIdx과 실제 렌더된 leftPct를 바탕으로 deltaDays 계산
			const origDayIdx = originals[0].origDayIdx;
			const newLeftMatch = eventBlocks[0].style.left.match(/(\d+(\.\d+)?)%/);
			const newLeftPct = newLeftMatch
				? parseFloat(newLeftMatch[1])
				: origDayIdx * percentPerDay;
			const newDayIdx = Math.round(newLeftPct / percentPerDay);
			const deltaDays = newDayIdx - origDayIdx;

			// deltaHours 계산: (newTopPx - origTopPx) / slotHeight
			const origTopPx = originals[0].origTopPx;
			const newTopPx = parseFloat(eventBlocks[0].style.top.replace('px', ''));
			const deltaHours = (newTopPx - origTopPx) / slotHeight;

			if (isNaN(deltaDays) || isNaN(deltaHours)) {
				console.error('잘못된 delta 계산:', { deltaDays, deltaHours });
			} else {
				try {
					await fetch(`/api/schedules/${scheduleId}/moveWeekly`, {
						method: 'PATCH',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ deltaDays, deltaHours })
					});
				} catch (err) {
					console.error('일정 업데이트 중 오류:', err);
				}
			}

			// 드래그 후 전체 다시 렌더링
			initWeeklySchedule();

			document.removeEventListener('pointermove', pointerMoveHandler);
			document.removeEventListener('pointerup', pointerUpHandler);
		}
	}

	// 두 Date 객체가 “년·월·일”까지 같은지 비교
	function sameDate(d1, d2) {
		return (
			d1.getFullYear() === d2.getFullYear() &&
			d1.getMonth() === d2.getMonth() &&
			d1.getDate() === d2.getDate()
		);
	}

	// Date → "YYYY-MM-DD" 형식 문자열
	function formatYMD(date) {
		const y = date.getFullYear();
		const m = String(date.getMonth() + 1).padStart(2, '0');
		const d = String(date.getDate()).padStart(2, '0');
		return `${y}-${m}-${d}`;
	}

	function renderAllDayEvents(events, weekStart, weekEnd) {
		const wrapper = document.querySelector('.events-all-day-wrapper');
		if (!wrapper) return;
		const list = wrapper.querySelector('.events-all-day-list');
		list.innerHTML = '';
		const oldToggle = wrapper.querySelector('.all-day-toggle');
		if (oldToggle) oldToggle.remove();

		const ROW_HEIGHT = parseFloat(
			getComputedStyle(document.documentElement).getPropertyValue('--all-day-row-height') || 20
		);
		const ROW_GAP = 2;
		const percentPerDay = 100 / 7;

		const items = events
			.map(e => ({
				id: e.schedulesId,
				title: e.title,
				category: e.category,
				start: new Date(e.startTs),
				end: new Date(e.endTs)
			}))
			.sort((a, b) => a.start - b.start);

		const rows = [];
		const placed = [];

		items.forEach(evt => {
			const startIdx = Math.floor((evt.start - weekStart) / 86400000);
			const endIdx = Math.floor((evt.end - weekStart) / 86400000);
			const obj = {
				...evt,
				startIdx: Math.max(0, startIdx),
				endIdx: Math.min(6, endIdx),
				arrowLeft: startIdx < 0,
				arrowRight: endIdx > 6
			};

			let placedRow = -1;
			for (let r = 0; r < rows.length; r++) {
				if (rows[r] < obj.startIdx) {
					placedRow = r;
					break;
				}
			}
			if (placedRow === -1) {
				placedRow = rows.length;
				rows.push(obj.endIdx);
			} else {
				rows[placedRow] = obj.endIdx;
			}
			obj.row = placedRow;
			placed.push(obj);
		});

		const totalRows = rows.length;
		let visible = Math.min(2, totalRows);
		list.style.height = `${ROW_HEIGHT * visible + ROW_GAP * Math.max(0, visible - 1)}px`;

		const GAP = 2;
		placed.forEach(evt => {
			const div = document.createElement('div');
			div.className = 'all-day-event';
			let txt = evt.title;
			if (evt.arrowLeft) txt = '◀ ' + txt;
			if (evt.arrowRight) txt = txt + ' ▶';
			div.textContent = txt;
			div.style.backgroundColor = evt.category;
			div.style.left = `calc(${percentPerDay * evt.startIdx}% + ${GAP}px)`;
			const widthPct = percentPerDay * (evt.endIdx - evt.startIdx + 1);
			div.style.width = `calc(${widthPct}% - ${GAP}px)`;
			div.style.top = `${evt.row * (ROW_HEIGHT + ROW_GAP)}px`;
			div.dataset.id = evt.id;
			if (evt.row >= visible) div.style.display = 'none';
			div.addEventListener('click', () => {
				if (window.loadAndOpenScheduleModal) window.loadAndOpenScheduleModal(evt.id);
			});
			list.appendChild(div);
		});

		if (totalRows > 2) {
			const btn = document.createElement('button');
			btn.className = 'all-day-toggle';
			btn.textContent = `+${totalRows - 2}개 더보기`;
			let expanded = false;
			btn.addEventListener('click', () => {
				expanded = !expanded;
				visible = expanded ? totalRows : 2;
				list.style.height = `${ROW_HEIGHT * visible + ROW_GAP * Math.max(0, visible - 1)}px`;
				Array.from(list.children).forEach(el => {
					if (!el.classList.contains('all-day-event')) return;
					const rowIdx = parseInt(el.style.top) / (ROW_HEIGHT + ROW_GAP);
					el.style.display = rowIdx < visible ? '' : 'none';
				});
				btn.textContent = expanded ? '접기' : `+${totalRows - 2}개 더보기`;
			});
			wrapper.appendChild(btn);
		}
	}

	// 현재 시간선 위치 및 헤더의 날짜 숫자 업데이트
	function updateCurrentTimeLine() {
		const line = document.querySelector('.current-time-line');
		const now = new Date();
		const h = now.getHours() + now.getMinutes() / 60;
		const slotHeight = parseFloat(
			getComputedStyle(document.documentElement).getPropertyValue('--hour-height')
		);
		line.style.top = `${h * slotHeight}px`;
		updateWeekDateNumbers();
	}

	// 요일 헤더의 .date-number에 실제 날짜(숫자) 채우기
	function updateWeekDateNumbers() {
		const currentDateInput = document.getElementById('current-date');
		const val = currentDateInput.value; // "MM.DD-MM.DD"
		const m = val.match(/^(\d{2})\.(\d{2})-(\d{2})\.(\d{2})$/);
		if (!m) return;
		const startDay = parseInt(m[2], 10);
		const endDay = parseInt(m[4], 10);
		const labels = Array.from(
			document.querySelectorAll('.weekday-header .day-label')
		).slice(1, 1 + (endDay - startDay + 1));
		const days = [];
		for (let d = startDay; d <= endDay; d++) days.push(d);
		labels.forEach((el, idx) => {
			const numSpan = el.querySelector('.date-number');
			if (numSpan) numSpan.textContent = days[idx] + '';
		});
	}
	function attachGridClick() {
		const grid = document.getElementById('schedule-grid');
		if (!grid || grid.dataset.modalClickAttached) return;

		const slotHeight = parseFloat(
			getComputedStyle(document.documentElement).getPropertyValue('--hour-height')
		);
		const STEP = slotHeight / 4;
		let selecting = false;
		let startY = 0;
		let startColIdx = 0;
		let startDateStr = '';
		let selectDiv = null;
		const dayWidthPct = 100 / 7;

		function formatTime(pos) {
			let minutes = Math.round((pos / slotHeight) * 60);
			minutes = Math.max(0, Math.min(24 * 60, Math.round(minutes / 15) * 15));
			const h = Math.floor(minutes / 60);
			const m = minutes % 60;
			return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
		}

		function openModalWithRange(dateStr, topPx, bottomPx) {
			const startMinTot = Math.round((topPx / slotHeight) * 60);
			const endMinTot = Math.round((bottomPx / slotHeight) * 60);
			const startHour = Math.floor(startMinTot / 60);
			const startMin = startMinTot % 60;
			const endHour = Math.floor(endMinTot / 60);
			const endMin = endMinTot % 60;
			const [y, m, d] = dateStr.split('-').map(v => v.padStart(2, '0'));
			document.getElementById('sched-start-day').value = `${y}-${m}-${d}`;
			document.getElementById('sched-end-day').value = `${y}-${m}-${d}`;
			document.getElementById('sched-start-hour').value = String(startHour).padStart(2, '0');
			document.getElementById('sched-start-min').value = String(startMin).padStart(2, '0');
			document.getElementById('sched-end-hour').value = String(endHour).padStart(2, '0');
			document.getElementById('sched-end-min').value = String(endMin).padStart(2, '0');
			if (window.openScheduleModal) window.openScheduleModal();
		}

		function pointerMove(eMove) {
			if (!selecting) return;
			const rect = grid.getBoundingClientRect();
			const curY = eMove.clientY - rect.top;
			const curX = eMove.clientX - rect.left;
			const colIdx = Math.floor(curX / (rect.width / 7));
			console.log(colIdx)
			console.log(startColIdx)
			if (colIdx !== startColIdx) return;
			const top = Math.min(startY, curY);
			const bottom = Math.max(startY, curY);
			selectDiv.style.top = `${top}px`;
			selectDiv.style.height = `${bottom - top}px`;
			selectDiv.dataset.time = `${formatTime(top)} - ${formatTime(bottom)}`;
		}

		function pointerUp(eUp) {
			if (!selecting) return;
			document.removeEventListener('pointermove', pointerMove);
			document.removeEventListener('pointerup', pointerUp);
			const rect = grid.getBoundingClientRect();
			const curY = eUp.clientY - rect.top;
			const curX = eUp.clientX - rect.left;
			const colIdx = Math.floor(curX / (rect.width / 7));
			if (colIdx !== startColIdx) {
				selectDiv.remove();
				selecting = false;
				return;
			}
			let top = Math.min(startY, curY);
			let bottom = Math.max(startY, curY);
			top = Math.max(0, Math.round(top / STEP) * STEP);
			bottom = Math.min(24 * slotHeight, Math.round(bottom / STEP) * STEP);
			selectDiv.remove();
			selecting = false;
			openModalWithRange(startDateStr, top, bottom);
		}

		grid.addEventListener('pointerdown', e => {
			if (e.target.closest('.event')) return;
			const slot = e.target.closest('.hour-slot');
			if (!slot) return;
			console.log(slot)
			const rect = grid.getBoundingClientRect();
			const idx = Array.from(slot.parentNode.children).indexOf(slot);
			startColIdx = idx % 7;
			startDateStr = getDateForSlot(slot.id);
			startY = e.clientY - rect.top;
			selecting = true;
			selectDiv = document.createElement('div');
			selectDiv.className = 'drag-select';
			selectDiv.style.left = `calc(${startColIdx * dayWidthPct}% )`;
			selectDiv.style.width = `calc(${dayWidthPct}% )`;
			selectDiv.style.top = `${startY}px`;
			grid.appendChild(selectDiv);

			document.addEventListener('pointermove', pointerMove);
			document.addEventListener('pointerup', pointerUp);
		});

		grid.addEventListener('click', e => {
			if (selecting) return; // drag selection handled separately
			const slot = e.target.closest('.hour-slot');
			if (!slot) return;

			let idx = Array.from(slot.parentNode.children).indexOf(slot);
			const dateStr = getDateForSlot(slot.id);
			idx = (idx / 7) | 0;

			const [y, m, d] = dateStr.split('-').map(v => v.padStart(2, '0'));
			document.getElementById('sched-start-day').value = `${y}-${m}-${d}`;
			document.getElementById('sched-end-day').value = `${y}-${m}-${d}`;
			document.getElementById('sched-start-hour').value = String(idx).padStart(2, '0');
			document.getElementById('sched-start-min').value = '00';
			document.getElementById('sched-end-hour').value = String(idx + 1).padStart(2, '0');
			document.getElementById('sched-end-min').value = '00';
			if (window.openScheduleModal) window.openScheduleModal();
		});
		grid.dataset.modalClickAttached = 'true';
	}

	function getDateForSlot(slotId) {
		const currentDateInput = document.getElementById('current-date');
		const [y, m, d] = currentDateInput.dataset.selectDate.split('-').map(Number);
		const selectedDate = new Date(y, m - 1, d);
		const dayIdx = selectedDate.getDay();
		const weekStart = new Date(selectedDate);
		weekStart.setDate(selectedDate.getDate() - dayIdx);

		const slotNum = parseInt(slotId.replace(/\D/g, ''), 10);
		const colIdx = slotNum % 7;

		const result = new Date(weekStart);
		result.setDate(weekStart.getDate() + colIdx);

		const yyyy = result.getFullYear();
		const mm = String(result.getMonth() + 1).padStart(2, '0');
		const dd = String(result.getDate()).padStart(2, '0');
		return `${yyyy}-${mm}-${dd}`;
	}

	// 전역에 바인딩
	window.initWeeklySchedule = initWeeklySchedule;
	window.updateWeekDateNumbers = updateWeekDateNumbers;
})();