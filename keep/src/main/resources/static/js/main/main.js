// 사이드바 토글
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebar       = document.getElementById('sidebar');
sidebarToggle.addEventListener('click', () => {
  sidebar.classList.toggle('open');
});

// 테마 토글
const themeToggle     = document.getElementById('themeToggle');
const themeStylesheet = document.getElementById('themeStylesheet');

themeToggle.addEventListener('click', () => {
  // 현재 링크 URL 가져오기
  const href = themeStylesheet.getAttribute('href');
  // 다크 ↔ 라이트 교체
  if (href.includes('dark.css')) {
    themeStylesheet.setAttribute('href', '/css/main/light.css');
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
  } else {
    themeStylesheet.setAttribute('href', '/css/main/dark.css');
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
  }
});
