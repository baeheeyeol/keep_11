(function() {
  function initScheduleModal() {
	
    const overlay = document.getElementById('schedule-modal-overlay');
    const modal   = document.getElementById('schedule-modal');
    const cancel  = document.getElementById('modal-cancel');
    const colors  = document.querySelectorAll('.cat-color');
    const hiddenColorInput = document.getElementById('sched-color');
    const form    = document.getElementById('schedule-form');
    const grid    = document.querySelector('.schedule-grid');
	
	const startHour = document.getElementById('sched-start-hour');
	const startMin  = document.getElementById('sched-start-min');
	const endHour   = document.getElementById('sched-end-hour');
	const endMin    = document.getElementById('sched-end-min');

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
	grid.addEventListener('click', e => {
	  const slot = e.target.closest('.hour-slot');
	  if (!slot) return;
	  const idx = Array.from(slot.parentNode.children).indexOf(slot);

	  // 오늘 날짜 (예: "2025.5.16")를 "2025-05-16" 형태로 변환
	  const today = document.getElementById('current-date').textContent;
	  const [y, m, d] = today.split('.').map(n => n.padStart(2, '0'));

	  // input 요소 가져오기
	  const startDayInput   = document.getElementById('sched-start-day');	  
	  const endDayInput     = document.getElementById('sched-end-day');
	  
	  // 값 세팅
	  startDayInput.value  = `${y}-${m}-${d}`;
	  endDayInput.value    = `${y}-${m}-${d}`;
	 
	  startHour.value = String(idx).padStart(2, '0');
	  startMin.value  = '00';
	  endHour.value   = String(idx + 1).padStart(2, '0');
	  endMin.value    = '00';

	  openModal();
	});

  }

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
    document.querySelectorAll('.cat-color').forEach(b => b.classList.remove('selected'));
  }

  // 전역 호출용 및 초기화
  window.initScheduleModal = initScheduleModal;
})();
