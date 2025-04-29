let currentDate = new Date(); // 현재 날짜를 기준으로 설정
let currentMonth = currentDate.getMonth(); // 현재 월 (0부터 시작)
let currentYear = currentDate.getFullYear(); // 현재 연도
// 날짜 헤더 클릭 시 모달 열기
   document.getElementById('date-header').addEventListener('click', function() {
     document.getElementById('calendar-modal').style.display = 'block';
	 const month = this.dataset.month;
	 if (month) {
	   generateCalendar(new Date(new Date().getFullYear(), month - 1, 1)); // 달력 생성 (현재 연도와 선택한 월)
	 }
   });

   // 모달 닫기 버튼
   document.getElementById('close-modal').addEventListener('click', function() {
     document.getElementById('calendar-modal').style.display = 'none';
   });

   // 모달 외부 클릭 시 모달 닫기
   window.addEventListener('click', function(event) {
     if (event.target === document.getElementById('calendar-modal')) {
       document.getElementById('calendar-modal').style.display = 'none';
     }
   });
   // 이전 달로 이동
   document.getElementById('prev-month').addEventListener('click', function() {
     currentMonth--;
     if (currentMonth < 0) {
       currentMonth = 11; // 12월로 돌아가기
       currentYear--; // 연도를 한 해 전으로 변경
     }
	 updateCalendarHeader();
     generateCalendar(currentYear, currentMonth);
   });

   // 다음 달로 이동
   document.getElementById('next-month').addEventListener('click', function() {
     currentMonth++;
     if (currentMonth > 11) {
       currentMonth = 0; // 1월로 돌아가기
       currentYear++; // 연도를 한 해 후로 변경
     }
	 updateCalendarHeader();
     generateCalendar(currentYear, currentMonth);
   });

   // 달력 생성 함수
   function generateCalendar(date) {
     const month = date.getMonth(); // 현재 월
     const year = date.getFullYear(); // 현재 년도

     const firstDay = new Date(year, month, 1); // 해당 월의 첫 번째 날
     const lastDay = new Date(year, month + 1, 0); // 해당 월의 마지막 날

     const daysInMonth = lastDay.getDate(); // 해당 월의 총 일 수
     const startDay = firstDay.getDay(); // 첫 번째 날이 시작하는 요일 (0=일요일)

     // 달력 헤더 업데이트
     document.getElementById('calendar-month').textContent = `${year}년 ${month + 1}월`;

     let calendarBody = '';
     let dayCounter = 1;

     // 1일이 시작하는 요일에 맞춰 빈 칸 추가
     for (let i = 0; i < startDay; i++) {
       calendarBody += '<div class="calendar-day empty"></div>';
     }

     // 날짜 채우기 (주말은 빨간색으로 표시)
     for (let i = startDay; i < 7; i++) {
          calendarBody += `<div class="calendar-day" onclick="updateDateHeader(${dayCounter}, ${month + 1})">${dayCounter}</div>`;
       dayCounter++;
     }

     // 두 번째 주부터 7개씩 표시
     while (dayCounter <= daysInMonth) {
       for (let i = 0; i < 7; i++) {
         if (dayCounter <= daysInMonth) {
           calendarBody += `<div class="calendar-day" onclick="updateDateHeader(${dayCounter}, ${month + 1})">${dayCounter}</div>`;
           dayCounter++;
         } else {
           calendarBody += '<div class="calendar-day empty"></div>';
         }
       }
     }

     document.querySelector('.calendar-body').innerHTML = calendarBody;
   }
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
	  function updateDateHeader(day, month) {
	      const dayOfWeek = new Date(new Date().getFullYear(), month - 1, day).toLocaleString('ko-KR', { weekday: 'long' });
	      document.getElementById('date-header').textContent = `${month}월 ${day}일 ${dayOfWeek}`;
	      document.getElementById('calendar-modal').style.display = 'none'; // 모달 닫기
	      document.getElementById('date-header').setAttribute('data-month', month); // data-month 속성 업데이트
	    }
	  // 달력 헤더 업데이트 함수
	  function updateCalendarHeader() {
	    document.getElementById('calendar-month').textContent = `${currentYear}년 ${currentMonth + 1}월`;
	  }
      // 페이지 로드 시 오늘 날짜를 설정
	  window.onload = function() {
	    formatDate();          // 오늘 날짜 포맷팅
	    updateCalendarHeader(); // 달력 헤더 업데이트
	  };
