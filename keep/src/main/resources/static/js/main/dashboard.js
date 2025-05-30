// static/js/main/dashboard.js
document.addEventListener('DOMContentLoaded', () => {
	let dateInput = document.getElementById('current-date');
	if (!dateInput) {
		return;
	}
	// 1) current-date 에 달력 모달 바인딩
	if (window.initCalendarModal) {
		window.initCalendarModal('current-date');
		window.initCalendarModal('sched-start-day');
		window.initCalendarModal('sched-end-day');
	}
	// 2) 오늘 날짜를 YYYY-MM-DD 형식으로 세팅
	const today = new Date();
	const yyyy = today.getFullYear();
	const mm = String(today.getMonth() + 1).padStart(2, '0');
	const dd = String(today.getDate()).padStart(2, '0');

	dateInput.dataset.view = 'weekly';


	const fragmentContainer = document.getElementById('fragment-container');
	const viewBtns = document.querySelectorAll('.view-btn');

	// 6) 컴포넌트 로드 함수
	function loadView(view) {
		fetch(`/dashboard/fragment/${view}`)
			.then(response => {
				if (!response.ok) throw new Error('네트워크 에러');
				return response.text();
			})
			.then(html => {
				fragmentContainer.innerHTML = html;

				document.getElementById('daily-css').disabled = (view !== 'daily');
				document.getElementById('weekly-css').disabled = (view !== 'weekly');
				dateInput.dataset.view = view;
				if (dateInput.dataset.view === 'daily') {
					dateInput.value = `${yyyy}.${mm}.${dd}`;
				} else if (dateInput.dataset.view === 'weekly') {
					// 오늘의 요일 인덱스 (0:일요일, 1:월요일, …, 6:토요일)
					const dayIndex = today.getDay();

					// 주 시작(일요일) 계산
					const weekStart = new Date(today);
					weekStart.setDate(today.getDate() - dayIndex);

					// 주 끝(토요일) 계산
					const weekEnd = new Date(today);
					weekEnd.setDate(today.getDate() + (6 - dayIndex));

					// 포맷팅
					const startMM = String(weekStart.getMonth() + 1).padStart(2, '0');
					const startDD = String(weekStart.getDate()).padStart(2, '0');
					const endMM = String(weekEnd.getMonth() + 1).padStart(2, '0');
					const endDD = String(weekEnd.getDate()).padStart(2, '0');

					// 예: "05.25-05.31"
					dateInput.value = `${startMM}.${startDD}-${endMM}.${endDD}`;
				}
				dateInput.dataset.selectDate = `${yyyy}-${mm}-${dd}`;

				if (view === 'daily') {
					// daily 전용 초기화
					if (window.initDailySchedule) {
						window.initDailySchedule();
					};
					if (window.initScheduleModal) {
						window.initScheduleModal();
					};

				}
				else if (view == 'weekly') {
					if (window.window.initScheduleModal) {
						window.initWeeklySchedule();
					}
					if (window.initScheduleModal) {
						window.initScheduleModal();
					}
				}
			})
			.catch(err => console.error(err));
	}

	// 초기 로드: daily
	loadView('weekly');

	// 뷰 버튼 이벤트
	viewBtns.forEach(btn => {
		btn.addEventListener('click', () => {
			const view = btn.dataset.view;
			viewBtns.forEach(b => b.classList.toggle('active', b === btn));
			loadView(view);
		});
	});
	window.loadView = loadView;
});
