// static/js/main/components/daily.js
(function() {

	async function initWeeklySchedule() {
		// 1) 날짜 구간 계산
		const currentDateInput = document.getElementById('current-date');
		const range = currentDateInput.value;               // e.g. "05.25-05.31"
		const [sMM, sDD, eMM, eDD] = range.match(/(\d{2})\.(\d{2})-(\d{2})\.(\d{2})/).slice(1);
		const year = parseInt(currentDateInput.dataset.selectDate.split('-')[0], 10);
		const weekStart = new Date(year, sMM - 1, sDD);
		const weekEnd = new Date(year, eMM - 1, eDD);

		// 2) API 호출
		const res = await fetch(`/api/schedules?start=${formatYMD(weekStart)}&end=${formatYMD(weekEnd)}`);
		const schedules = await res.json();  // [{ id, title, startTs, endTs, color, ... }, ...]

		// 3) 초기화
		const container = document.querySelector('.events-container');
		container.innerHTML = '';

		// (선택) 현재시간선 위치 업데이트
		updateCurrentTimeLine();

		// 4) 일정 렌더링
		schedules.forEach(evt => {
			const start = new Date(evt.startTs);
			const end = new Date(evt.endTs);

			// 요일, 시간, 분 추출
			const dayIdx = start.getDay();           // 0~6
			const startH = start.getHours() + start.getMinutes() / 60;
			const duration = (end - start) / (1000 * 60 * 60); // 시간 단위

			// CSS 값 계산
			const slotHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hour-height'));
			const topPx = startH * slotHeight;
			const heightPx = duration * slotHeight;
			const colWidth = (container.clientWidth) / 7; // grid-template-columns 활용 시도 가능
			const leftPx = dayIdx * colWidth;

			// 이벤트 엘리먼트 생성
			const div = document.createElement('div');
			div.classList.add('event');
			div.style.top = `${topPx}px`;
			div.style.height = `${heightPx}px`;
			div.style.left = `${leftPx}px`;
			div.style.width = `${colWidth}px`;
			div.style.backgroundColor = evt.category;
			div.dataset.id = evt.schedulesId;
			div.innerHTML = `<span class="event-title">${evt.title}</span>`;
			// 툴팁, 클릭 핸들러 등 필요 기능 추가
			div.addEventListener('click', () => window.loadAndOpenScheduleModal(evt.schedulesId));

			container.appendChild(div);
		});
	}

	// 헬퍼: Date → "YYYY-MM-DD"
	function formatYMD(date) {
		const y = date.getFullYear();
		const m = String(date.getMonth() + 1).padStart(2, '0');
		const d = String(date.getDate()).padStart(2, '0');
		return `${y}-${m}-${d}`;
	}

	// 헬퍼: 현재 시간선 위치 업데이트
	function updateCurrentTimeLine() {
		const line = document.querySelector('.current-time-line');
		const now = new Date();
		const h = now.getHours() + now.getMinutes() / 60;
		const slotHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hour-height'));
		line.style.top = `${h * slotHeight + parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--weekday-header-height'))}px`;
		updateWeekDateNumbers();

	}
	function updateWeekDateNumbers() {

		const currentDateInput = document.getElementById('current-date');
		const val = currentDateInput.value;
		console.log(val)
		// "MM.DD-MM.DD" 포맷 매칭
		const m = val.match(/^(\d{2})\.(\d{2})-(\d{2})\.(\d{2})$/);
		if (!m) return;

		// 시작일, 종료일 파싱
		const startDay = parseInt(m[2], 10);
		const endDay = parseInt(m[4], 10);

		// 요일 헤더의 .day-label elements (첫 번째는 '요일'이므로 slice(1))
		const labels = Array.from(document.querySelectorAll('.weekday-header .day-label'))
			.slice(1, 1 + (endDay - startDay + 1));

		// 날짜 배열 생성
		const days = [];
		for (let d = startDay; d <= endDay; d++) days.push(d);

		// 각 .date-number 에 텍스트 채우기
		labels.forEach((el, idx) => {
			const numSpan = el.querySelector('.date-number');
			if (numSpan) numSpan.textContent = days[idx] + '';
		});
	}
	window.initWeeklySchedule = initWeeklySchedule;
	window.updateWeekDateNumbers = updateWeekDateNumbers;
})();
