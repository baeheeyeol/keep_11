// static/js/main/dashboard.js
document.addEventListener('DOMContentLoaded', () => {
        const headerEl = document.querySelector('.dashboard-header');
        if (headerEl) {
                document.documentElement.style.setProperty('--dashboard-header-height', `${headerEl.offsetHeight}px`);
        }
        const params = new URLSearchParams(window.location.search);
        const initialView = params.get('view');
        const shareId = params.get('shareId');
        if (shareId) {
                window.currentShareId = shareId;
        }
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

        dateInput.dataset.view = initialView || 'weekly';
	dateInput.dataset.selectDate = `${yyyy}-${mm}-${dd}`;


	const fragmentContainer = document.getElementById('fragment-container');
	const viewBtns = document.querySelectorAll('.view-btn');
	const prevBtn = document.getElementById('prev-date');
	const nextBtn = document.getElementById('next-date');

	function updateDisplay(view) {
		const [y, m, d] = dateInput.dataset.selectDate.split('-').map(Number);
		const pad = n => String(n).padStart(2, '0');
		const dateObj = new Date(y, m - 1, d);

		if (view === 'daily') {
			dateInput.value = `${y}.${pad(m)}.${pad(d)}`;
		} else if (view === 'weekly') {
			const dayIdx = dateObj.getDay();
			const weekStart = new Date(dateObj);
			const weekEnd = new Date(dateObj);
			weekStart.setDate(dateObj.getDate() - dayIdx);
			weekEnd.setDate(dateObj.getDate() + (6 - dayIdx));
			const sMM = pad(weekStart.getMonth() + 1);
			const sDD = pad(weekStart.getDate());
			const eMM = pad(weekEnd.getMonth() + 1);
			const eDD = pad(weekEnd.getDate());
			dateInput.value = `${sMM}.${sDD}-${eMM}.${eDD}`;
		} else if (view === 'monthly') {
			dateInput.value = `${y}.${pad(m)}`;
		}
	}

	updateDisplay(dateInput.dataset.view);

	function refreshSchedule() {
		const view = dateInput.dataset.view;
		if (view === 'daily') {
			window.initDailySchedule && await window.initDailySchedule();
		} else if (view === 'weekly') {
			window.initWeeklySchedule && await window.initWeeklySchedule();
		} else if (view === 'monthly') {
			window.initMonthlySchedule && await window.initMonthlySchedule();
		}
	}

	function changeDate(delta) {
		const [y, m, d] = dateInput.dataset.selectDate.split('-').map(Number);
		const dateObj = new Date(y, m - 1, d);
		const view = dateInput.dataset.view;
		if (view === 'daily') {
			dateObj.setDate(dateObj.getDate() + delta);
		} else if (view === 'weekly') {
			dateObj.setDate(dateObj.getDate() + delta * 7);
		} else if (view === 'monthly') {
			dateObj.setMonth(dateObj.getMonth() + delta);
		}
		const yyyy = dateObj.getFullYear();
		const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
		const dd = String(dateObj.getDate()).padStart(2, '0');
		dateInput.dataset.selectDate = `${yyyy}-${mm}-${dd}`;
		updateDisplay(view);
		if (view === 'weekly' && window.updateWeekDateNumbers) {
			window.updateWeekDateNumbers();
		}
		refreshSchedule();
	}

        // CSS 로드 대기 함수
        function waitForCss(id) {
                const link = document.getElementById(id);
                return new Promise(resolve => {
                        if (!link || link.sheet) return resolve();
                        const timer = setTimeout(resolve, 3000);
                        link.addEventListener('load', () => {
                                clearTimeout(timer);
                                resolve();
                        }, { once: true });
                });
        }

        // 6) 컴포넌트 로드 함수
        async function loadView(view) {
                fragmentContainer.style.opacity = 0;
                try {
                        const response = await fetch(`/dashboard/fragment/${view}`);
                        if (!response.ok) throw new Error('네트워크 에러');
                        const html = await response.text();

                        fragmentContainer.innerHTML = html;

                        document.getElementById('daily-css').disabled = (view !== 'daily');
                        document.getElementById('weekly-css').disabled = (view !== 'weekly');
                        document.getElementById('monthly-css').disabled = (view !== 'monthly');

                        await waitForCss(`${view}-css`);

                        dateInput.dataset.view = view;
                        updateDisplay(view);
                        if (view === 'daily') {
                                // daily 전용 초기화
                                if (window.initDailySchedule) {
                                        await window.initDailySchedule();
                                }
                        } else if (view === 'weekly') {
                                if (window.initWeeklySchedule) {
                                        await window.initWeeklySchedule();
                                }
                        } else if (view === 'monthly') {
                                if (window.initMonthlySchedule) {
                                        await window.initMonthlySchedule();
                                }
                        }
                        await window.initScheduleModal();
                        if (window.initMonthlyMoreModal) {
                                await window.initMonthlyMoreModal();
                        }
                } catch (err) {
                        console.error(err);
                } finally {
                        requestAnimationFrame(() => {
                                fragmentContainer.style.opacity = 1;
                        });
                }
        }

        // 초기 로드
        loadView(initialView || 'weekly');

	// 뷰 버튼 이벤트
	viewBtns.forEach(btn => {
		btn.addEventListener('click', () => {
			const view = btn.dataset.view;
			viewBtns.forEach(b => b.classList.toggle('active', b === btn));
			loadView(view);
		});
	});
	window.loadView = loadView;
	window.updateDisplay = updateDisplay;
	window.refreshSchedule = refreshSchedule;

	if (prevBtn) {
		prevBtn.addEventListener('click', () => changeDate(-1));
	}
	if (nextBtn) {
		nextBtn.addEventListener('click', () => changeDate(1));
	}
});
