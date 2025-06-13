(function() {

	function initScheduleModal() {
		const overlay = document.getElementById('schedule-modal-overlay');
		const modal = document.getElementById('schedule-modal');
                const cancel = document.getElementById('modal-cancel');
                const deleteBtn = document.getElementById('modal-delete');
		const colors = document.querySelectorAll('.cat-color');
		const hiddenColorInput = document.getElementById('sched-color');
		const form = document.getElementById('schedule-form');
		const grid = document.querySelector('.schedule-grid');
		const startHour = document.getElementById('sched-start-hour');
		const startMin = document.getElementById('sched-start-min');
		const endHour = document.getElementById('sched-end-hour');
		const endMin = document.getElementById('sched-end-min');
		const currentDateInput = document.getElementById('current-date');

		// 필수 요소 체크
		if (!overlay || !modal || !cancel || !form) return;
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
                deleteBtn?.addEventListener('click', async () => {
                        const id = document.getElementById('sched-id').value;
                        if (!id) return;
                        if (!confirm('일정을 삭제하시겠습니까?')) return;
                        try {
                                const res = await fetch(`/api/schedules/${id}`, { method: 'DELETE' });
                                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                                closeModal();
                                const curView = currentDateInput.dataset.view;
                                if (curView === 'weekly') {
                                        window.initWeeklySchedule();
                                } else if (curView === 'daily') {
                                        window.initDailySchedule();
                                } else if (curView === 'monthly') {
                                        window.initMonthlySchedule();
                                }
                        } catch (err) {
                                console.error(err);
                                alert('일정을 삭제하는 데 실패했습니다.');
                        }
                });

		if (form.dataset.listenerAttached) return;
		// ❶ 폼 submit 이벤트 가로채기 (REST API용)
                form.addEventListener('submit', async e => {
                        e.preventDefault();

                        const url = '/api/schedules';
                        const formData = new FormData(form);
                        if (window.saveToast && window.saveToast.showSaving) {
                                window.saveToast.showSaving();
                        }

			try {
				const res = await fetch(url, {
					method: 'POST',
					body: formData
				});
				const body = await res.json();

                                if (!res.ok) {
                                        if (window.saveToast && window.saveToast.hide) {
                                                window.saveToast.hide();
                                        }
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
                                const curView = currentDateInput.dataset.view;
                                const refresh = () => {
                                        if (curView === 'weekly') {
                                                window.initWeeklySchedule();
                                        } else if (curView === 'daily') {
                                                window.initDailySchedule();
                                        } else if (curView === 'monthly') {
                                                window.initMonthlySchedule();
                                        }
                                };
                                refresh();
                                if (window.saveToast && window.saveToast.showSaved) {
                                        window.saveToast.showSaved(body.id, async (id) => {
                                                await fetch(`/api/schedules/${id}`, { method: 'DELETE' });
                                                refresh();
                                        });
                                }

			}
                       catch (err) {
                               console.error(err);
                                if (window.saveToast && window.saveToast.hide) {
                                        window.saveToast.hide();
                                }
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

                        // 삭제 버튼 표시
                        const delBtn = document.getElementById('modal-delete');
                        delBtn?.classList.remove('hidden');

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
                const delBtn = document.getElementById('modal-delete');
                if (delBtn) {
                       console.log(delBtn.classList.toggle('hidden', !document.getElementById('sched-id').value));
                }
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
                const delBtn = document.getElementById('modal-delete');
                delBtn?.classList.add('hidden');
                document.dispatchEvent(new Event('scheduleModalClosed'));
        }

	// 전역 호출용 및 초기화
	window.initScheduleModal = initScheduleModal;
	window.loadAndOpenScheduleModal = loadAndOpenScheduleModal;
	window.openScheduleModal = openModal;
})();
