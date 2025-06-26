(function() {
  let map;
  let marker;
  let sidebar;
  let overlay;
  let searchInput;
  let registerBtn;
  function init() {
    sidebar = document.getElementById('location-sidebar');
    overlay = document.getElementById('location-sidebar-overlay');
    searchInput = document.getElementById('location-search-input');
    registerBtn = document.getElementById('location-register-btn');
    const closeBtn = document.getElementById('location-sidebar-close');
    const searchBtn = document.getElementById('location-search-btn');
    if (!sidebar || !overlay) return;
    if (sidebar.dataset.initialized) return;
    closeBtn?.addEventListener('click', close);
    overlay.addEventListener('click', close);
    searchBtn?.addEventListener('click', search);
    registerBtn?.addEventListener('click', registerLocation);
    sidebar.dataset.initialized = 'true';
  }
  async function search() {
    const keyword = searchInput.value.trim();
    if (!keyword) return;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(keyword)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const result = await res.json();
      if (!result || result.length === 0) {
        alert('검색 결과가 없습니다.');
        return;
      }
      const loc = result[0];
      const lat = parseFloat(loc.lat);
      const lon = parseFloat(loc.lon);
      if (!map) {
        map = L.map('location-map').setView([lat, lon], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);
      } else {
        map.setView([lat, lon], 15);
      }
      if (marker) marker.remove();
      marker = L.marker([lat, lon]).addTo(map).bindPopup(keyword).openPopup();
      sidebar.dataset.lat = lat;
      sidebar.dataset.lon = lon;
      sidebar.dataset.address = loc.display_name;
      sidebar.dataset.place = keyword;
    } catch(err) {
      console.error(err);
      alert('위치를 찾을 수 없습니다.');
    }
  }
  function registerLocation() {
    if (!sidebar.dataset.lat || !sidebar.dataset.lon) {
      alert('위치를 검색해주세요.');
      return;
    }
    document.getElementById('sched-location').value = sidebar.dataset.place || '';
    document.getElementById('sched-address').value = sidebar.dataset.address || '';
    document.getElementById('sched-place-name').value = sidebar.dataset.place || '';
    document.getElementById('sched-latitude').value = sidebar.dataset.lat;
    document.getElementById('sched-longitude').value = sidebar.dataset.lon;
    close();
  }
  function open() {
    overlay.classList.remove('hidden');
    sidebar.classList.remove('hidden');
    requestAnimationFrame(() => sidebar.classList.add('show'));
  }
  function close() {
    sidebar.classList.remove('show');
    sidebar.addEventListener('transitionend', () => sidebar.classList.add('hidden'), { once: true });
    overlay.classList.add('hidden');
  }
  window.locationSidebar = { init, open, close };
})();
