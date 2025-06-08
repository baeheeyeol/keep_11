(function() {

	function initScheduleModal() {
		const overlay = document.getElementById('schedule-modal-overlay');
		const modal = document.getElementById('schedule-modal');
		const cancel = document.getElementById('modal-cancel');
		const colors = document.querySelectorAll('.cat-color');
		const hiddenColorInput = document.getElementById('sched-color');
		const form = document.getElementById('schedule-form');
		const grid = document.querySelector('.schedule-grid');
		const startHour = document.getElementById('sched-start-hour');
		const startMin = document.getElementById('sched-start-min');
		const endHour = document.getElementById('sched-end-hour');
		const endMin = document.getElementById('sched-end-min');
		const currentDateInput = document.getElementById('current-date');
		const view = currentDateInput.dataset.view;
		// 필수 요소 체크
		if (!overlay || !modal || !cancel || !form || !grid) return;

		// 시 옵션 채우기 (00~23)
		for (let h = 0; h < 24; h++) {
			const hh = String(h).padStart(2, '0');
			[startHour, endHour].forEach(sel => {
				const opt = document.createElement('option');
				opt.value = hh;
				opt.textContent = hh;
				sel.appendChild(opt);
			});
		}

		// 분 옵션 채우기 (00~59)
		for (let m = 0; m < 60; m++) {
			const mm = String(m).padStart(2, '0');
			[startMin, endMin].forEach(sel => {
				const opt = document.createElement('option');
				opt.value = mm;
				opt.textContent = mm;
				sel.appendChild(opt);
			});
		}

		// 범주 색상 선택 이벤트
		colors.forEach(btn => {
			btn.addEventListener('click', () => {
				colors.forEach(b => b.classList.remove('selected'));
				btn.classList.add('selected');
				hiddenColorInput.value = btn.dataset.color;
			});
		});

		// 취소 버튼 및 오버레이 클릭 시 모달 닫기
		cancel.addEventListener('click', closeModal);
		overlay.addEventListener('click', closeModal);


		// 그리드 클릭 시 모달 열기 및 시간 세팅
		// 그리드 클릭 시 모달 열기 및 시간 세팅 (일간/주간 공용)

		grid.addEventListener('click', e => {
			const slot = e.target.closest('.hour-slot');
			if (!slot) return;
			// 해당 슬롯이 몇 번째인지 인덱스 계산
			let idx = Array.from(slot.parentNode.children).indexOf(slot);

			// "daily" or "weekly"
			let dateStr;
			if (view === 'weekly') {
				// 주간: 슬롯 id로 요일별 날짜 계산 (yyyy-MM-dd)
				dateStr = getDateForSlot(slot.id);
				idx = (idx / 7) | 0;
			} else {
				// 일간: 선택된 날짜 그대로 (yyyy-MM-dd)
				dateStr = currentDateInput.dataset.selectDate;
			}

			// y, m, d 분리
			const [y, m, d] = dateStr.split('-').map(n => n.padStart(2, '0'));

			// input 요소 가져오기
			const startDayInput = document.getElementById('sched-start-day');
			const endDayInput = document.getElementById('sched-end-day');

			// 날짜 세팅
			startDayInput.value = `${y}-${m}-${d}`;
			endDayInput.value = `${y}-${m}-${d}`;

			// 시간 세팅 (공통)
			startHour.value = String(idx).padStart(2, '0');
			startMin.value = '00';
			endHour.value = String(idx + 1).padStart(2, '0');
			endMin.value = '00';

			// 모달 열기 (공통)
			openModal();
		});
		function getDateForSlot(slotId) {
			// 1) 현재 선택일 (dataset.selectDate) 파싱
			const currentDateInput = document.getElementById('current-date');
			const selectDateStr = currentDateInput.dataset.selectDate; // e.g. "2025-05-30"
			const [y, m, d] = selectDateStr.split('-').map(Number);
			const selectedDate = new Date(y, m - 1, d);

			// 2) 그 주의 일요일(0) 날짜 계산
			const dayIdx = selectedDate.getDay();                    // 예: 금요일 → 5
			const weekStart = new Date(selectedDate);
			weekStart.setDate(selectedDate.getDate() - dayIdx);      // 일요일(25일)

			// 3) slotId 에서 숫자만 꺼내고 7로 나눈 나머지로 요일 인덱스 추출
			const slotNum = parseInt(slotId.replace(/\D/g, ''), 10); // e.g. 42
			const colIdx = slotNum % 7;                             // 0~6

			// 4) weekStart 에 colIdx 일 더해서 해당 날짜 계산
			const result = new Date(weekStart);
			result.setDate(weekStart.getDate() + colIdx);

			// 5) yyyy-MM-dd 포맷으로 반환
			const yyyy = result.getFullYear();
			const mm = String(result.getMonth() + 1).padStart(2, '0');
			const dd = String(result.getDate()).padStart(2, '0');
			return `${yyyy}-${mm}-${dd}`;
		}
		if (form.dataset.listenerAttached) return;
		// ❶ 폼 submit 이벤트 가로채기 (REST API용)
		form.addEventListener('submit', async e => {
			e.preventDefault();

			// API 엔드포인트로 변경
			const url = '/api/schedules';
			const formData = new FormData(form);

			try {
				const res = await fetch(url, {
					method: 'POST',
					body: formData
				});
				const body = await res.json();

				if (!res.ok) {
					// ❷ 유효성 검사 오류 표시
					if (body.errors) {
						// 기존에 출력된 에러 메시지 제거
						form.querySelectorAll('.error-message').forEach(el => el.remove());

						// field → message 매핑
						Object.entries(body.errors).forEach(([field, msg]) => {
							// input/select/textarea 요소 찾기
							const input = form.querySelector(`[name="${field}"], [name="${field.replace(/([A-Z])/g, "-$1").toLowerCase()}"]`);
							const err = document.createElement('p');
							err.className = 'error-message';
							err.textContent = msg;
							// 요소 아래에 에러 노출
							input?.insertAdjacentElement('afterend', err);
						});
					}
					else {
						alert('일정 저장에 실패했습니다.');
					}
					return;
				}

				// ❸ 저장 성공 시 모달 닫기 및 뷰 갱신
				closeModal();
				alert(view)
				if (view === 'weekly') {
					window.initWeeklySchedule();
				} else {
					window.initDailySchedule();
				}
			}
			catch (err) {
				console.error(err);
				alert('네트워크 에러로 일정 저장에 실패했습니다.');
			}
		});
		form.dataset.listenerAttached = 'true';
	}
	// ❶ 스케줄 ID로 단건 조회 후 모달 폼에 자동으로 채워 넣고 모달 열기
	async function loadAndOpenScheduleModal(scheduleId) {
		try {
			const res = await fetch(`/api/schedules/${scheduleId}`);
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const data = await res.json();

			// 날짜/시간 분리용 헬퍼
			const pad = n => String(n).padStart(2, '0');
			const start = new Date(data.startTs);
			const end = new Date(data.endTs);

			// 모달 제목 변경
			//	        document.getElementById('modal-title-text').textContent = '일정 수정';

			// 폼 요소에 값 채우기
			document.getElementById('sched-title').value = data.title;
			document.getElementById('sched-start-day').value = `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`;
			document.getElementById('sched-start-hour').value = pad(start.getHours());
			document.getElementById('sched-start-min').value = pad(start.getMinutes());
			document.getElementById('sched-end-day').value = `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}`;
			document.getElementById('sched-end-hour').value = pad(end.getHours());
			document.getElementById('sched-end-min').value = pad(end.getMinutes());
			document.getElementById('sched-location').value = data.location || '';
			document.getElementById('sched-desc').value = data.description || '';
			document.getElementById('sched-color').value = data.category;
			document.getElementById('sched-id').value = data.schedulesId;

			// 카테고리 버튼 선택 상태 동기화
			document.querySelectorAll('.cat-color').forEach(btn => {
				btn.classList.toggle('selected', btn.dataset.color === data.category);
			});

			// 모달 열기
			openModal();
		} catch (err) {
			console.error(err);
			alert('일정을 불러오는 데 실패했습니다.');
		}
	}
	// ────────────────────────────────────────────────────────────────────────

	function openModal() {
		document.getElementById('schedule-modal-overlay').classList.remove('hidden');
		document.getElementById('schedule-modal').classList.remove('hidden');

		// 기본 색상 표시
		const hiddenColorInput = document.getElementById('sched-color');
		document.querySelector('.cat-color[data-color="' + hiddenColorInput.value + '"]')
			?.classList.add('selected');
	}

	function closeModal() {
		document.getElementById('schedule-modal-overlay').classList.add('hidden');
		document.getElementById('schedule-modal').classList.add('hidden');
		document.getElementById('schedule-form').reset();
		document.getElementById('sched-id').value = '';
		document.querySelectorAll('.cat-color').forEach(b => b.classList.remove('selected'));
	}

	// 전역 호출용 및 초기화
        window.initScheduleModal = initScheduleModal;
        window.loadAndOpenScheduleModal = loadAndOpenScheduleModal;
        window.openScheduleModal = openModal;
})();
