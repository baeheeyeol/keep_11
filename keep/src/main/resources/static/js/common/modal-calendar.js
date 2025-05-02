let currentDate = new Date(); // 현재 날짜를 기준으로 설정
let currentMonth = currentDate.getMonth(); // 현재 월 (0부터 시작)
let currentYear = currentDate.getFullYear(); // 현재 연도

// 달력 헤더 업데이트 함수
	  function updateCalendarHeader() {
	    document.getElementById('month-calendar').textContent = `${currentYear}년 ${currentMonth + 1}월`;
	  }
   // 모달 닫기 버튼
   document.getElementById('modal-close-calendar').addEventListener('click', function() {
     document.getElementById('modal-calendar').style.display = 'none';
   });

   // 모달 외부 클릭 시 모달 닫기
   window.addEventListener('click', function(event) {
     if (event.target === document.getElementById('modal-calendar')) {
       document.getElementById('modal-calendar').style.display = 'none';
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
     generateCalendar(new Date(currentYear, currentMonth,1));
   });

   // 다음 달로 이동
   document.getElementById('next-month').addEventListener('click', function() {
     currentMonth++;
     if (currentMonth > 11) {
       currentMonth = 0; // 1월로 돌아가기
       currentYear++; // 연도를 한 해 후로 변경
     }
	 updateCalendarHeader();
     generateCalendar(new Date(currentYear, currentMonth,1));
   });

   // 달력 생성 함수
   function generateCalendar(date) {
     const month = date.getMonth();
     const year  = date.getFullYear();
     const firstDay = new Date(year, month, 1);
     const lastDay  = new Date(year, month + 1, 0);
     const daysInMonth = lastDay.getDate();
     const startDay = firstDay.getDay();

     document.getElementById('modal-calendar-month')
             .textContent = `${year}년 ${month+1}월`;

     let html = '';
     let day = 1;

     // 빈 칸
     for (let i = 0; i < startDay; i++) {
       html += `<div class="modal-calendar-day modal-empty"></div>`;
     }

     // 1주차
     for (let i = startDay; i < 7; i++) {
       const cls = (i === 0 || i === 6) ? 'modal-calendar-weekend' : 'modal-calendar-day';
       html += `<div class="${cls}"
                    data-day="${day}"
                    data-month="${month+1}">
                  ${day}
                </div>`;
       day++;
     }

     // 나머지 주
     while (day <= daysInMonth) {
       for (let i = 0; i < 7; i++) {
         if (day <= daysInMonth) {
           const cls = (i === 0 || i === 6) ? 'modal-calendar-weekend' : 'modal-calendar-day';
           html += `<div class="${cls}"
                        data-day="${day}"
                        data-month="${month+1}">
                      ${day}
                    </div>`;
           day++;
         } else {
           html += `<div class="modal-calendar-day modal-empty"></div>`;
         }
       }
     }

     document.querySelector('.modal-calendar-body').innerHTML = html;

     // 여기서 이벤트 바인딩 호출
     bindDateSelectHandlers();
   }
   function bindDateSelectHandlers() {
     const modal = document.getElementById('calendar-modal');
     // data-on-select 에 지정한 함수 이름 가져오기
     const callbackName = modal.dataset.onSelect;
     const callback = window[callbackName] || function() {};

     document.querySelectorAll('.modal-calendar-day, .modal-calendar-weekend')
       .forEach(el => {
         // 빈 칸(modal-empty)은 제외
         if (!el.classList.contains('modal-empty')) {
           el.addEventListener('click', () => {
             const day   = el.dataset.day;
             const month = el.dataset.month;
             callback(day, month);
           });
         }
       });
   }
