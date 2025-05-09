// static/js/daily.js
document.addEventListener('DOMContentLoaded', () => {
  const timeColumn = document.querySelector('.time-column');
  const grid       = document.querySelector('.schedule-grid');
  const dateSpan   = document.getElementById('current-date');
  const now        = new Date();
  if (!timeColumn || !grid) {
     return;
   }
  // 오늘 날짜 텍스트 (예: "2025.5.8")
  dateSpan.textContent = `${now.getFullYear()}.${now.getMonth()+1}.${now.getDate()}`;

  // 1시간 높이 (px)
  const H = parseFloat(getComputedStyle(document.documentElement)
                       .getPropertyValue('--hour-height'));

  // 시간축 렌더링 (0~23시)
  timeColumn.innerHTML = '';
  for (let h = 0; h < 24; h++) {
    const label = document.createElement('div');
    label.className = 'hour-label';

    // 6시간 단위 그룹 시작인지 확인
    const isGroupStart = (h % 6 === 0);
    const ampm = h < 12 ? '오전' : '오후';
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    const text = isGroupStart
      ? `${ampm} ${hour12}시`
      : `${hour12}시`;

    // major/minor 클래스로 구분
    const span = document.createElement('span');
    span.className = isGroupStart ? 'hour-text-major' : 'hour-text-minor';
    span.textContent = text;

    label.appendChild(span);
    timeColumn.appendChild(label);
  }

  // 그리드 슬롯 24개 생성
  grid.innerHTML = '';
  for (let i = 0; i < 24; i++) {
    const slot = document.createElement('div');
    slot.className = 'hour-slot';
    slot.style.position = 'relative';  // later line absolute positioning
    grid.appendChild(slot);
  }

  // 현재 시각 실선 그리기
  function drawCurrentLine() {
    // 기존 선 제거
    const prev = grid.querySelector('.current-time-line');
    if (prev) prev.remove();

    // 오늘 날짜가 맞을 때만
    const parts = dateSpan.textContent.split('.').map(Number);
    if (
      parts[0] === now.getFullYear() &&
      parts[1] === now.getMonth()+1 &&
      parts[2] === now.getDate()
    ) {
      const offset = (now.getHours() + now.getMinutes()/60) * H;
      const line = document.createElement('div');
      line.className = 'current-time-line';
      line.style.top = `${offset}px`;
      grid.appendChild(line);
    }
  }

  // 초기 드로잉
  drawCurrentLine();

  // 리사이즈/스크롤 시 위치 보정
  window.addEventListener('resize', drawCurrentLine);
  window.addEventListener('scroll', drawCurrentLine);
});
