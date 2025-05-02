document.addEventListener('DOMContentLoaded', () => {
	// 날짜 헤더 클릭 시 모달 열기
	document.getElementById('date-header').addEventListener('click', function() {
		document.getElementById('modal-calendar').style.display = 'block';
		const month = this.dataset.month;
		if (month) {
			generateCalendar(new Date(new Date().getFullYear(), month - 1, 1)); // 달력 생성 (현재 연도와 선택한 월)
		}
	});

	function formatDate() {
		const today = new Date();
		const month = today.getMonth() + 1; // 월은 0부터 시작, 그래서 1을 더해줌
		const date = today.getDate();
		const dayOfWeek = today.toLocaleString('ko-KR', { weekday: 'long' }); // 요일 가져오기 (예: '월요일')

		// "m월 dd일 x요일" 형식으로 날짜를 구성
		const formattedDate = `${month}월 ${date}일 ${dayOfWeek}`;
		document.getElementById('date-header').textContent = formattedDate;
		document.getElementById('date-header').setAttribute('data-month', month);
	}

	// daily 화면 전용 로직
	function updateDailyDateHeader(day, month) {
		const dayOfWeek = new Date(new Date().getFullYear(), month - 1, day).toLocaleString('ko-KR', { weekday: 'long' });
		document.getElementById('date-header').textContent = `${month}월 ${day}일 ${dayOfWeek}`;
		document.getElementById('modal-calendar').style.display = 'none'; // 모달 닫기
		document.getElementById('date-header').setAttribute('data-month', month); // data-month 속성 업데이트
	}
	formatDate();          // 오늘 날짜 포맷팅
});
