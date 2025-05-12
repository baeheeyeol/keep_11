// static/js/main/components/daily.js
(function() {
  function initDailySchedule() {
    const grid = document.querySelector('.schedule-grid');
    if (!grid) return;

    // ➊ 현재시간선 요소가 없으면 생성
    let line = grid.querySelector('.current-time-line');
    if (!line) {
      line = document.createElement('div');
      line.className = 'current-time-line';
      grid.appendChild(line);
    }
    // ➋ draw 함수를 분리
    function draw() {
      const now = new Date();
      const dateSpan = document.getElementById('current-date');
      if (!dateSpan) return;
      const [y, m, d] = dateSpan.textContent.split('.').map(n => +n);
      if (y !== now.getFullYear() || m !== now.getMonth()+1 || d !== now.getDate()) {
        line.style.display = 'none';
        return;
      }
      line.style.display = '';
      // CSS 변수에서 1시간 높이(px) 가져오기
      const H = parseFloat(getComputedStyle(document.documentElement)
                           .getPropertyValue('--hour-height'));
      const offset = (now.getHours() + now.getMinutes()/60) * H;
      line.style.top = `${offset}px`;
      // 툴팁 갱신(hover 시 시간)
      const hours   = now.getHours();
      const minutes = now.getMinutes();
      const ampm    = hours < 12 ? '오전' : '오후';
      const hour12  = hours % 12 === 0 ? 12 : hours % 12;
      const mm      = String(minutes).padStart(2, '0');
      line.setAttribute('data-time', `${ampm} ${hour12}:${mm}`);
    }

    // ➌ 즉시 위치 그리기
    draw();

    // ➍ 다음 정각까지 대기
    const now = new Date();
    const delay = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

    setTimeout(() => {
      // 정각에 한 번 더 그린 뒤, 매 1분마다 갱신
      draw();
      setInterval(draw, 60 * 1000);
    }, delay);
  }

  // 전역에 노출
  window.initDailySchedule = initDailySchedule;
})();