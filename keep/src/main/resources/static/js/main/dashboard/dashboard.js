// static/js/main/dashboard.js
function InsertFoodRoomImageFrm(urls) {
	/*이미지1,2*/
	var flag1 = $("#img_r_file_name").val();

	var getfile1 = document.getElementById("getfile1").files[0] == null ? 0 : document.getElementById("getfile1").files[0].size;

	var maxSize = 2 * 1024 * 1024;//2MB
	var gfile1 = $("#getfile1").val();
	var loc_code = $("#locations_code").val();
	if ((loc_code == 10 && loc == 1) || (loc_code == 30 && loc == 2)) {
		if (getfile1 > maxSize) {
			alert("이미지는 2MB까지 업로드 할 수 있습니다.");
		} else {
			if (flag1 == "") {
				alert("식단이미지 등록시 공백이 있습니다.");
			} else {
				if (confirm("식단이미지를 등록하시겠습니까?")) {

					$("#submit_flag").eq(0).val("ins");
					//한글 인코딩함. 컨트롤러에서 디코딩 필수
					$("#img_r_file_name").val(encodeURIComponent(flag1));
					$("#getfile1").val(encodeURIComponent(gfile1));
					var form = $("#insert_form").serialize().replace(/%/g, '%25');
					var formdata = new FormData(document.getElementById('insert_form'));
					$.ajax({
						type: "POST",
						url: urls,
						cache: false,
						processData: false,
						contentType: false,
						data: formdata,
						success: function(json, status) {
							var e = $(json).find('#insert_form');
							var e2 = $(json).find('#title_line');
							var e3 = $(json).find('#body_line');
							var e4 = $(json).find('#modal_main');

							decodeURIComponent($("#img_r_file_name").val());

							$("#insert_form").html(e);
							$("#title_line").html(e2);
							$("#body_line").html(e3);
							$("#modal_main").html(e4);

							//					location.reload();

							/*중복된 날짜가 있으면 메시지 출력(저장이 안되었음)*/
							var result_check = $("#result_check").val();
							if (result_check > 0) {
								alert(result_check + "개의 중복된 이미지가 있어 이미지가 등록이 되지 않았습니다.\n재등록해 주세요");
							} else {
								alert("주간식단이미지 등록이 되었습니다.");
							}
							location.href = urls;
						},
						error: function(json, status) {
							/*alert("주간식단이미지 등록 시 오류가 발생하였습니다.["+JSON.stringify(data)+"]");*/
							alert("주간식단이미지 등록 이 취소되었습니다.");

							var modal = document.getElementById("loading");
							modal.style.display = 'none';
						}
					});
				}
			}
		}
	} else {
		alert("지역을 확인해주십시오");
	}
}



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

	async function refreshSchedule() {
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
	// CSS가 실제로 적용될 때까지 다음 페인트를 기다리는 함수
	function waitForCssApply(id) {
		const link = document.getElementById(id);
		if (!link) {
			return Promise.resolve();
		}
		return new Promise(resolve => {
			// 한 프레임(약 16ms) 뒤에 resolve
			requestAnimationFrame(() => {
				requestAnimationFrame(resolve);
			});
		});
	}
	async function loadView(view) {
		// 0) 숨김 클래스 붙여서 fade‐out 시작
		fragmentContainer.classList.add('hidden');
		// 6) 날짜표시 업데이트
		dateInput.dataset.view = view;
		updateDisplay(view);

		try {
			// 1) HTML 가져오기
			const res = await fetch(`/dashboard/fragment/${view}`);
			if (!res.ok) {
				throw new Error('네트워크 에러');
			}
			const html = await res.text();

			// 2) 내용 교체
			fragmentContainer.innerHTML = html;

			// 3) CSS 링크 토글
			['daily', 'weekly', 'monthly'].forEach(v => {
				const link = document.getElementById(`${v}-css`);
				if (link) {
					link.disabled = (v !== view);
				}
			});
			// CSS 적용 완료까지 대기
			await waitForCssApply(`${view}-css`);

			// 4) 뷰별 초기화 (반드시 Promise 반환)
			if (view === 'daily' && window.initDailySchedule) {
				await window.initDailySchedule();
			}
			if (view === 'weekly' && window.initWeeklySchedule) {
				await window.initWeeklySchedule();
			}
			if (view === 'monthly') {
				if (window.initMonthlySchedule) {
					await window.initMonthlySchedule();
				}
				if (window.initMonthlyMoreModal) {
					await window.initMonthlyMoreModal();
				}
			}

			// 5) 공통 모달 초기화
			if (window.initScheduleModal) {
				await window.initScheduleModal();
			}


		} catch (err) {
			console.error(err);
		} finally {
			// 7) 다음 리페인트 때 숨김 클래스 제거 → fade‐in
			requestAnimationFrame(() => {
				fragmentContainer.classList.remove('hidden');
			});
		}
	}

	// 일정 목록이 준비되면 초기 뷰 로드
	document.addEventListener('scheduleListsLoaded', () => {
		loadView(initialView || 'daily');
	}, { once: true });

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
