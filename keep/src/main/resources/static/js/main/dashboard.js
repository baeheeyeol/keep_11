// static/js/main/dashboard.js
document.addEventListener('DOMContentLoaded', () => {
	const dateInput = document.getElementById('current-date');
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
	dateInput.value = `${yyyy}-${mm}-${dd}`;

	// 3) 숫자 외 문자 제거 + 최대 8자리(YMD 8자리) 제한
	dateInput.addEventListener('input', e => {
		let v = e.target.value.replace(/[^0-9]/g, '');
		if (v.length > 8) {
			v = v.slice(0, 8)
		};
		e.target.value = v;
	});

	// 4) YYYYMMDD → YYYY-MM-DD 포맷 함수
	function formatYYYYMMDD(v) {
		if (v.length !== 8) {
			return v;
		}
		const y = v.slice(0, 4);
		const m = v.slice(4, 6);
		const d = v.slice(6, 8);
		if (m >= '01' && m <= '12' && d >= '01' && d <= '31') {
			return `${y}-${m}-${d}`;
		}
		return v;
	}

	// 5) 포커스 아웃 혹은 Enter 키 시 포맷 적용
	dateInput.addEventListener('blur', e => {
		e.target.value = formatYYYYMMDD(e.target.value);
	});
	dateInput.addEventListener('keydown', e => {
		if (e.key === 'Enter') {
			e.preventDefault();
			dateInput.blur();
		}
	});

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

				if (view === 'daily') {
					// daily 전용 초기화
					if (window.initDailySchedule) {
						window.initDailySchedule();
					};
					if (window.initScheduleModal) {
						window.initScheduleModal();
					};


				}
			})
			.catch(err => console.error(err));
	}

	// 초기 로드: daily
	loadView('daily');

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
