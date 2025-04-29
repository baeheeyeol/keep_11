// dashboard.js
document.addEventListener("DOMContentLoaded", function() {
  const periods = ["daily", "weekly", "monthly", "yearly"];
  const container = document.getElementById("view-container");
  const contextPath = /*[[ @{/dashboard/} ]]*/ "";

  function loadView(period) {
    fetch(contextPath + period)
      .then(res => res.text())
      .then(html => {
        container.innerHTML = html;
      });
  }

  periods.forEach(period => {
    const btn = document.getElementById(`btn-${period}`);
    btn.addEventListener("click", () => {
      // 뷰 교체
      loadView(period);
      // active 토글
      document.querySelector(".toggle-btn.active")
              .classList.remove("active");
      btn.classList.add("active");
    });
  });
});
