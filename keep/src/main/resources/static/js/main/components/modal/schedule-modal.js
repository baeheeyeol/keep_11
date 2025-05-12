(function() {
  function initScheduleModal() {
	
	// flatpickr 초기화
	flatpickr('#sched-start, #sched-end', {
	  enableTime: true,            // 시간 활성화
	  time_24hr: false,            // 12시간제 (AM/PM)
	  dateFormat: 'Y-m-d h:i K',   // 예: 2025-05-08 03:30 PM
	  monthSelectorType: 'dropdown',// 월 드롭다운
	  locale: {
	    firstDayOfWeek: 1,         // 주 시작요일 월요일
	    weekdays: {
	      shorthand: ['일','월','화','수','목','금','토'],
	      longhand : ['일요일','월요일','화요일','수요일','목요일','금요일','토요일']
	    },
	    months: {
	      shorthand: ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'],
	      longhand : ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']
	    },
	  },
	  // 화살표 아이콘을 Dashboard 스타일로 교체
	  prevArrow: '<svg class="icon"><use xlink:href="#icon-chevron-left"/></svg>',
	  nextArrow: '<svg class="icon"><use xlink:href="#icon-chevron-right"/></svg>',
	  onReady: function(dp) {
	    // flatpickr 기본 테마를 Dashboard 느낌으로 살짝 덮어 씌우기
	    dp.calendarContainer.classList.add('dashboard-flatpickr');
	  }
	});

	
    const overlay = document.getElementById('schedule-modal-overlay');
    const modal   = document.getElementById('schedule-modal');
    const cancel  = document.getElementById('modal-cancel');
    const colors  = document.querySelectorAll('.cat-color');
    const hiddenColorInput = document.getElementById('sched-color');
    const form    = document.getElementById('schedule-form');
    const grid    = document.querySelector('.schedule-grid');

    // 필수 요소 체크
    if (!overlay || !modal || !cancel || !form || !grid) return;

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
      const today = document.getElementById('current-date').textContent;
      const [y, m, d] = today.split('.').map(n => n.padStart(2, '0'));
      const startInput = document.getElementById('sched-start');
      const endInput   = document.getElementById('sched-end');

      startInput.value = `${y}-${m}-${d}T${String(idx).padStart(2,'0')}:00`;
      endInput.value   = `${y}-${m}-${d}T${String(idx+1).padStart(2,'0')}:00`;

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
