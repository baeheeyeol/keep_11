(function() {
	function initCalendarModal(dateSource) {
		// ➊ dateSpan 엘리먼트 결정
		let dateSpan;
		if (typeof dateSource === 'string') {
			dateSpan = document.getElementById(dateSource);
		} else if (dateSource instanceof HTMLElement) {
			dateSpan = dateSource;
		}
		if (!dateSpan) return;  // 없으면 종료
		//달력	
		const overlay = document.getElementById('calendar-overlay');
		const modal = document.getElementById('calendar-modal');
		const yearDisplay = document.getElementById('cal-year-display');
		const monthDisplay = document.getElementById('cal-month-display');
		const yearDropdown = document.getElementById('year-dropdown');
		const monthDropdown = document.getElementById('month-dropdown');
		const prevBtn = document.getElementById('cal-prev');
		const nextBtn = document.getElementById('cal-next');
		const bodyTbody = document.getElementById('calendar-body');
		const today = new Date();
		let viewYear = today.getFullYear();
		let viewMonth = today.getMonth(); // 0-based

		// 드롭다운 목록 생성 (년)
		function populateYearDropdown() {
			yearDropdown.innerHTML = '';
			const start = today.getFullYear() - 10;
			const end = today.getFullYear() + 10;
			for (let y = start; y <= end; y++) {
				const li = document.createElement('li');
				li.textContent = `${y}`;
				li.dataset.year = y;
				li.addEventListener('click', () => {
					viewYear = y;
					renderCalendar(viewYear, viewMonth);
					yearDropdown.classList.add('hidden');
					modal.classList.remove('dimmed');
					monthDisplay.classList.remove('dimmed');
					yearDisplay.classList.remove('dimmed');
				});
				yearDropdown.appendChild(li);
			}
		}

		// 드롭다운 목록 생성 (월)
		function populateMonthDropdown() {
			monthDropdown.innerHTML = '';
			for (let m = 0; m < 12; m++) {
				const li = document.createElement('li');
				li.textContent = `${m + 1}`;
				li.dataset.month = m;
				li.addEventListener('click', () => {
					viewMonth = m;
					renderCalendar(viewYear, viewMonth);
					monthDropdown.classList.add('hidden');
					modal.classList.remove('dimmed');
					monthDisplay.classList.remove('dimmed');
					yearDisplay.classList.remove('dimmed');
				});
				monthDropdown.appendChild(li);
			}
		}
		
		// 달력 렌더링
		function renderCalendar(year, month) {
			// 헤더 표시
			yearDisplay.textContent = `${year}년`;
			monthDisplay.textContent = `${month + 1}월`;

			// 테이블 초기화
			bodyTbody.innerHTML = '';
			const firstDay = new Date(year, month, 1).getDay();
			const daysInMonth = new Date(year, month + 1, 0).getDate();

			let row = document.createElement('tr');
			// 빈 칸
			for (let i = 0; i < firstDay; i++) {
				row.appendChild(document.createElement('td'));
			}
			// 날짜 채우기
			for (let d = 1; d <= daysInMonth; d++) {
				if (row.children.length === 7) {
					bodyTbody.appendChild(row);
					row = document.createElement('tr');
				}
				const cell = document.createElement('td');
				cell.textContent = d;
				const dayOfWeek = new Date(year, month, d).getDay();
				// 주말 표시
				if (dayOfWeek === 0 || dayOfWeek === 6) {
					cell.classList.add('weekend');
				}
				// 오늘 강조
				//				if (year === today.getFullYear() && month === today.getMonth() && d === today.getDate()) {
				//					cell.style.backgroundColor = '#d0d7ff';
				//				}
				// 날짜 선택 시
				console.log(dateSpan)
				cell.addEventListener('click', () => {
					
					const selectedDate = new Date(year, month, d);
					const view = dateSpan.dataset.view;
					const zeroPad = num => String(num).padStart(2, '0');
					let formattedValue;
					if (view === 'weekly') {
						// 주간 포맷
						const dayIndex = selectedDate.getDay();
						const weekStart = new Date(selectedDate);
						const weekEnd = new Date(selectedDate);
						weekStart.setDate(selectedDate.getDate() - dayIndex);
						weekEnd.setDate(selectedDate.getDate() + (6 - dayIndex));

						const sMM = zeroPad(weekStart.getMonth() + 1);
						const sDD = zeroPad(weekStart.getDate());
						const eMM = zeroPad(weekEnd.getMonth() + 1);
						const eDD = zeroPad(weekEnd.getDate());

						formattedValue = `${sMM}.${sDD}-${eMM}.${eDD}`;
						// 선택한 날짜 (주간의 기준일) 저장
						dateSpan.dataset.selectDate = [
							selectedDate.getFullYear(),
							zeroPad(selectedDate.getMonth() + 1),
							zeroPad(selectedDate.getDate())
						].join('-');

						window.updateWeekDateNumbers();
					} else if (view === 'monthly') {
						const yyyy = selectedDate.getFullYear();
						const mm = zeroPad(selectedDate.getMonth() + 1);
						const dd = zeroPad(selectedDate.getDate());
						formattedValue = `${yyyy}.${mm}`;
						dateSpan.dataset.selectDate = `${yyyy}-${mm}-${dd}`;
						if (window.initMonthlySchedule) {
							window.initMonthlySchedule();
						}
					} else if (view === 'daily') {
						// 일간 포맷
						const yyyy = selectedDate.getFullYear();
						const mm = zeroPad(selectedDate.getMonth() + 1);
						const dd = zeroPad(selectedDate.getDate());
						formattedValue = `${yyyy}.${mm}.${dd}`;
						dateSpan.dataset.selectDate = `${yyyy}-${mm}-${dd}`;
					} else {
						const yyyy = selectedDate.getFullYear();
						const mm = zeroPad(selectedDate.getMonth() + 1);
						const dd = zeroPad(selectedDate.getDate());
						formattedValue = `${yyyy}-${mm}-${dd}`;
						dateSpan.dataset.selectDate = `${yyyy}-${mm}-${dd}`;
					}

					dateSpan.value = formattedValue;
					if (window.updateDisplay) {
						window.updateDisplay(view);
					}
					closeCalendar();
				});

				row.appendChild(cell);
			}
			// 마지막 줄 빈 칸 채우기
			while (row.children.length < 7) {
				row.appendChild(document.createElement('td'));
			}
			bodyTbody.appendChild(row);
		}
		
		// 모달 열기/닫기
		function openCalendar() {
			// 모달 위치
			const rect = dateSpan.getBoundingClientRect();
			//			modal.style.top = `${rect.bottom + window.scrollY + 4}px`;
			modal.style.top = `${rect.bottom + 4}px`;
			modal.style.left = `${rect.left}px`;

			renderCalendar(viewYear, viewMonth);
			overlay.classList.remove('hidden');
		}
		function closeCalendar() {
			overlay.classList.add('hidden');
			yearDropdown.classList.add('hidden');
			monthDropdown.classList.add('hidden');
			modal.classList.remove('dimmed');  // 반투명 해제
		}

		// 이벤트 바인딩
		dateSpan.addEventListener('click', openCalendar);
		prevBtn.addEventListener('click', () => {
			viewMonth--;
			if (viewMonth < 0) { viewMonth = 11; viewYear--; }
			renderCalendar(viewYear, viewMonth);
		});
		nextBtn.addEventListener('click', () => {
			viewMonth++;
			if (viewMonth > 11) { viewMonth = 0; viewYear++; }
			renderCalendar(viewYear, viewMonth);
		});

		//년,월 드롭다운 토글
		const elements = {
			year: {
				display: yearDisplay,
				dropdown: yearDropdown
			},
			month: {
				display: monthDisplay,
				dropdown: monthDropdown
			}
		};
		['year', 'month'].forEach(type => {
			const { display, dropdown } = elements[type];
			const other = elements[type === 'year' ? 'month' : 'year'];
			display.addEventListener('click', () => {
				const isOpening = dropdown.classList.contains('hidden');
				dropdown.classList.toggle('hidden');
				other.dropdown.classList.add('hidden');
				other.display.classList.toggle('dimmed', isOpening);
				modal.classList.toggle('dimmed', isOpening);
			});
		});

		// 오버레이 클릭 시 닫기
		overlay.addEventListener('click', e => {
			if (e.target === overlay) closeCalendar();
		});

		// 드롭다운 초기화
		populateYearDropdown();
		populateMonthDropdown();
		// 전역 호출용 및 초기화
	}
	window.initCalendarModal = initCalendarModal;
})();

