// static/js/main/components/daily.js
(function() {
	let draggingEvt      = null;
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
	    // 1) 리스너 해제
	    document.removeEventListener('pointermove', onDrag);
	    document.removeEventListener('pointerup',   onDrop);

	    // 2) 스냅된 최종 top 위치(px)
	    const snappedTop = parseFloat(draggingEvt.style.top);
	    // 3) 이동량: (새위치 – 원위치) 픽셀
	    const dy = snappedTop - origTop;
	    // 4) 시간 단위로 변환 (px → 시간)
	    const deltaHours = dy / H;
	    // 5) 30분 단위로 반올림
	    const deltaSnapped = Math.round(deltaHours * 2) / 2;

	    // 6) 서버에 전송
	    updateEventTime(draggingEvt.dataset.id, deltaSnapped);

	    // 7) 원래 left 복원
	    draggingEvt.style.left = draggingEvt._origLeft;
	    delete draggingEvt._origLeft;

	    draggingEvt = null;
	  }
	async function updateEventTime(id, deltaHours) {
	  try {
	    const res = await fetch(`/api/schedules/${id}`, {
	      method: 'PATCH',
	      headers: {
	        'Content-Type': 'application/json'
	      },
	      body: JSON.stringify({ deltaHours })
	    });
	    if (!res.ok) {
	      // 에러 메시지 파싱 (서버에서 {errors:…} 형태로 보낼 경우)
	      const err = await res.json().catch(()=>null);
	      const msg = err?.message || `HTTP ${res.status}`;
	      alert(`일정 이동에 실패했습니다: ${msg}`);
	      return;
	    }
	    // 이동 성공 시, 화면 다시 그리기
	    await initDailySchedule();  
	  }
	  catch (e) {
	    console.error(e);
	    alert('일정 이동 중 예외가 발생했습니다.');
	  }
	}

	function initDragAndDrop() {
	  const grid = document.querySelector('.schedule-grid');
	  if (!grid) return;

	  H    = parseFloat(getComputedStyle(document.documentElement)
	                   .getPropertyValue('--hour-height'));
	  STEP = H / 2;  // 30분 단위

	  grid.addEventListener('pointerdown', e => {
	    const evEl = e.target.closest('.event');
	    if (!evEl) return;
	    e.preventDefault();

	    draggingEvt = evEl;
	    startY      = e.clientY;
	    origTop     = parseFloat(getComputedStyle(evEl).top);

	    // **원래 left 저장하고, 드래그 중엔 왼쪽에 붙이기**
	    draggingEvt._origLeft = getComputedStyle(evEl).left;
	    draggingEvt.style.left = '0px';
		draggingEvt.style.zIndex = '9999';
	    document.addEventListener('pointermove', onDrag);
	    document.addEventListener('pointerup',   onDrop);
	  });
	}
	/**
	 * 일간 일정 렌더s링 + 현재시간선 그리기
	 */
	async function initDailySchedule() {
		const grid = document.querySelector('.schedule-grid');
		if (!grid) return;

		const dateInput = document.getElementById('current-date');
		if (!dateInput) return;
		const [year, month, day] = dateInput.value.split('-').map(n => +n);
		const dateParam = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

		// 1) API에서 일정 목록 가져오기
		let events = [];
		try {
			const res = await fetch(`/api/schedules?date=${dateParam}`);
			if (res.ok) events = await res.json();
		} catch (err) {
			console.error('일정 로드 실패', err);
		}

		// 2) 기존 이벤트 클리어
		const container = grid.querySelector('.events-container');
		container.innerHTML = '';

		// 3) CSS 변수에서 1시간 높이(px) 가져오기
		const H = parseFloat(getComputedStyle(document.documentElement)
			.getPropertyValue('--hour-height'));

		// 2) 빈 컬럼 리스트
		const columns = [];  // columns[i] = 해당 컬럼 마지막 이벤트의 endTs (숫자: ms)

		// 3) 각 이벤트에 colIndex 할당
		events.forEach(evt => {
			const start = new Date(evt.startTs).getTime();
			const end = new Date(evt.endTs).getTime();

			// 빈 칸 찾기
			let placed = false;
			for (let i = 0; i < columns.length; i++) {
				if (start >= columns[i]) {
					// i번 컬럼에 배치
					evt.colIndex = i;
					columns[i] = end;  // 이 컬럼의 마지막 종료 시각 갱신
					placed = true;
					break;
				}
			}
			if (!placed) {
				// 새 컬럼 추가
				evt.colIndex = columns.length;
				columns.push(end);
			}
		});

		// 블록 사이에 줄 간격으로 사용할 픽셀 수
		const GAP = 2;  // 원하시는 만큼 조정하세요
		const totalCols = columns.length;
		const colPct = 100 / totalCols;
		events.forEach(evt => {
			const start = new Date(evt.startTs);
			const end = new Date(evt.endTs);
			const durationHours = (end - start) / 1000 / 60 / 60;     // 시간 단위 길이
			const offsetHours = start.getHours() + start.getMinutes() / 60;

			// 위쪽 위치 (px)
			const offsetPx = offsetHours * H;
			// 높이 (px)
			const heightPx = durationHours * H;

			const div = document.createElement('div');
			div.className = 'event';

			// left/width 계산 (예전 대로)

			div.style.left = `calc(${evt.colIndex * colPct}% + ${GAP * evt.colIndex}px)`;
			div.style.width = `calc(${colPct}% - ${GAP}px)`;

			// **height에도 GAP을 빼 줍니다**
			div.style.top = `calc(${offsetPx}px)`;               // top 은 그대로
			div.style.height = `calc(${heightPx}px - ${GAP}px)`;   // 높이에서 GAP만큼 빼기

			div.style.backgroundColor = evt.category;
			div.dataset.id = evt.schedulesId;
			// 내용 세팅...
			div.innerHTML = `
		    <span class="event-title">${evt.title}</span>
		  `;
		  container.style.opacity = 0;
		  		  setTimeout(() => {
		  		    container.appendChild(div);
		  		    container.style.opacity = 1;
		  		  }, 200);

		});
		
		// 5) 현재 시간선 그리기 함수
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

	// 전역에 노출
	window.initDailySchedule = initDailySchedule;
})();
