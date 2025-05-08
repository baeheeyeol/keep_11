document.addEventListener('DOMContentLoaded', () => {
	const dateSpan = document.getElementById('current-date');
	if (!dateSpan) return;

	const today = new Date();
	const year = today.getFullYear();
	const month = today.getMonth() + 1;  // 0~11 이므로 +1
	const day = today.getDate();

	// "2025.5.8" 형태
	dateSpan.textContent = `${year}.${month}.${day}`;

	const fragmentContainer = document.getElementById('fragment-container');
	const viewBtns = document.querySelectorAll('.view-btn');

	// fragment 로드 함수
	function loadView(view) {
		fetch(`/dashboard/fragment/${view}`)
			.then(response => {
				if (!response.ok) throw new Error('네트워크 에러');
				return response.text();
			})
			.then(html => {
				fragmentContainer.innerHTML = html;
			})
			.catch(err => console.error(err));
	}

	// 초기 로드: 일간
	loadView('daily');

	// 버튼 이벤트
	viewBtns.forEach(btn => {
		btn.addEventListener('click', () => {
			const view = btn.dataset.view;
			// Active 상태 토글 (생략 가능)
			viewBtns.forEach(b => b.classList.toggle('active', b === btn));
			// 해당 fragment 로드
			loadView(view);
		});
	});
	//달력
	const overlay       = document.getElementById('calendar-overlay');
	const modal         = document.getElementById('calendar-modal');
	const yearDisplay   = document.getElementById('cal-year-display');
	const monthDisplay  = document.getElementById('cal-month-display');
	const yearDropdown  = document.getElementById('year-dropdown');
	const monthDropdown = document.getElementById('month-dropdown');
	const prevBtn       = document.getElementById('cal-prev');
	const nextBtn       = document.getElementById('cal-next');
	const bodyTbody     = document.getElementById('calendar-body');

	let viewYear    = today.getFullYear();
	let viewMonth   = today.getMonth(); // 0-based

	// 드롭다운 목록 생성
	function populateYearDropdown() {
	  yearDropdown.innerHTML = '';
	  const start = today.getFullYear() - 10;
	  const end   = today.getFullYear() + 10;
	  for (let y = start; y <= end; y++) {
	    const li = document.createElement('li');
	    li.textContent = `${y}`;
	    li.dataset.year = y;
	    li.addEventListener('click', () => {
	      viewYear = y;
	      renderCalendar(viewYear, viewMonth);
	      yearDropdown.classList.add('hidden');
	    });
	    yearDropdown.appendChild(li);
	  }
	}

	function populateMonthDropdown() {
	  monthDropdown.innerHTML = '';
	  for (let m = 0; m < 12; m++) {
	    const li = document.createElement('li');
	    li.textContent = `${m+1}`;
	    li.dataset.month = m;
	    li.addEventListener('click', () => {
	      viewMonth = m;
	      renderCalendar(viewYear, viewMonth);
	      monthDropdown.classList.add('hidden');
	    });
	    monthDropdown.appendChild(li);
	  }
	}

	// 달력 렌더링
	function renderCalendar(year, month) {
	  // 헤더 표시
	  yearDisplay.textContent  = `${year}년`;
	  monthDisplay.textContent = `${month+1}월`;

	  // 테이블 초기화
	  bodyTbody.innerHTML = '';
	  const firstDay    = new Date(year, month, 1).getDay();
	  const daysInMonth = new Date(year, month+1, 0).getDate();

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
	    if (year === today.getFullYear() && month === today.getMonth() && d === today.getDate()) {
	      cell.style.backgroundColor = '#d0d7ff';
	    }
	    // 날짜 선택 시
	    cell.addEventListener('click', () => {
	      dateSpan.textContent = `${year}.${month+1}.${d}`;
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
	  modal.style.top  = `${rect.bottom + window.scrollY + 4}px`;
	  modal.style.left = `${rect.left + window.scrollX}px`;

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
	prevBtn .addEventListener('click', () => {
	  viewMonth--;
	  if (viewMonth < 0) { viewMonth = 11; viewYear--; }
	  renderCalendar(viewYear, viewMonth);
	});
	nextBtn.addEventListener('click', () => {
	  viewMonth++;
	  if (viewMonth > 11) { viewMonth = 0; viewYear++; }
	  renderCalendar(viewYear, viewMonth);
	});

	// 드롭다운 토글
	yearDisplay .addEventListener('click', () => {
		const opened = !yearDropdown.classList.contains('hidden');
	  yearDropdown.classList.toggle('hidden');
	  monthDropdown.classList.add('hidden');
	  if (opened) modal.classList.remove('dimmed');
	    else       modal.classList.add('dimmed');
	});
	monthDisplay.addEventListener('click', () => {
	   const opened = !monthDropdown.classList.contains('hidden');
	  monthDropdown.classList.toggle('hidden');
	  yearDropdown.classList.add('hidden');
	  if (opened) modal.classList.remove('dimmed');
	    else       modal.classList.add('dimmed');
	});

	// 오버레이 클릭 시 닫기
	overlay.addEventListener('click', e => {
	  if (e.target === overlay) closeCalendar();
	});

	// 드롭다운 초기화
	populateYearDropdown();
	populateMonthDropdown();
});

