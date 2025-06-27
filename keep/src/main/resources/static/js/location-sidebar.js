(function() {
  const DEFAULT_LAT = 37.5665; // Seoul
  const DEFAULT_LON = 126.9780;
  const DEFAULT_PLACE = '서울';
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
    if (!sidebar || !overlay) {
      return;
    }
    if (sidebar.dataset.initialized) {
      return;
    }
    closeBtn?.addEventListener('click', close);
    overlay.addEventListener('click', close);
    searchBtn?.addEventListener('click', search);
    registerBtn?.addEventListener('click', registerLocation);
    searchInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        searchBtn?.click();
      }
    });
    sidebar.dataset.initialized = 'true';
  }

  async function updateInputFromCoords(lat, lon) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.display_name) {
          searchInput.value = data.display_name;
          sidebar.dataset.address = data.display_name;
          sidebar.dataset.place = data.display_name;
          return;
        }
      }
    } catch (_) { /* ignore */ }
    searchInput.value = `${lat}, ${lon}`;
    sidebar.dataset.address = searchInput.value;
    sidebar.dataset.place = searchInput.value;
  }

  async function searchKeyword(keyword) {
    if (!keyword) {
      return false;
    }
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          keyword
        )}`
      );
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const result = await res.json();
      if (!result || result.length === 0) {
        return false;
      }
      const loc = result[0];
      const lat = parseFloat(loc.lat);
      const lon = parseFloat(loc.lon);
      await ensureMapInitialized();
      map.setView([lat, lon], 15);
      if (marker) {
        marker.setLatLng([lat, lon]);
      }
      else {
        marker = L.marker([lat, lon], { draggable: true }).addTo(map);
        marker.on('dragend', async () => {
          const pos = marker.getLatLng();
          sidebar.dataset.lat = pos.lat;
          sidebar.dataset.lon = pos.lng;
          await updateInputFromCoords(pos.lat, pos.lng);
        });
      }
      sidebar.dataset.lat = lat;
      sidebar.dataset.lon = lon;
      sidebar.dataset.address = loc.display_name;
      sidebar.dataset.place = keyword;
      searchInput.value = keyword;
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  async function ensureMapInitialized() {
    if (map) {
      setTimeout(() => map.invalidateSize(), 200);
      return;
    }
    let lat;
    let lon;
    const latInput = document.getElementById('sched-latitude');
    const lonInput = document.getElementById('sched-longitude');
    const locInput = document.getElementById('sched-location');
    if (latInput && lonInput && latInput.value && lonInput.value) {
      lat = parseFloat(latInput.value);
      lon = parseFloat(lonInput.value);
    } else if (locInput && locInput.value.trim()) {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locInput.value.trim())}`);
        if (res.ok) {
          const r = await res.json();
          if (r && r.length) {
            lat = parseFloat(r[0].lat);
            lon = parseFloat(r[0].lon);
          }
        }
      } catch (_) { /* ignore */ }
    }
    if (lat === undefined || lon === undefined) {
      try {
        const pos = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        lat = pos.coords.latitude;
        lon = pos.coords.longitude;
      } catch (_) {
        lat = DEFAULT_LAT;
        lon = DEFAULT_LON;
      }
    }

    map = L.map('location-map').setView([lat, lon], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
    marker = L.marker([lat, lon], { draggable: true }).addTo(map);
    marker.on('dragend', async () => {
      const pos = marker.getLatLng();
      sidebar.dataset.lat = pos.lat;
      sidebar.dataset.lon = pos.lng;
      await updateInputFromCoords(pos.lat, pos.lng);
    });
    sidebar.dataset.lat = lat;
    sidebar.dataset.lon = lon;
  }
  async function search() {
    const keyword = searchInput.value.trim();
    const ok = await searchKeyword(keyword);
    if (!ok) {
      alert('검색 결과가 없습니다.');
    }
  }
  function registerLocation() {
    if (!sidebar.dataset.lat || !sidebar.dataset.lon) {
      alert('위치를 검색해주세요.');
      return;
    }
    const value = searchInput.value.trim();
    document.getElementById('sched-location').value = value;
    document.getElementById('sched-address').value = sidebar.dataset.address || '';
    document.getElementById('sched-place-name').value = value;
    document.getElementById('sched-latitude').value = sidebar.dataset.lat;
    document.getElementById('sched-longitude').value = sidebar.dataset.lon;
    close();
  }
  async function open() {
    overlay.classList.remove('hidden');
    sidebar.classList.remove('hidden');
    const schedLoc = document.getElementById('sched-location');
    searchInput.value = schedLoc ? schedLoc.value.trim() : '';
    await ensureMapInitialized();
    let keyword = searchInput.value;
    if (!keyword) {
      keyword = DEFAULT_PLACE;
    }
    let ok = await searchKeyword(keyword);
    if (!ok) {
      searchInput.value = DEFAULT_PLACE;
      await searchKeyword(DEFAULT_PLACE);
    }
    requestAnimationFrame(() => sidebar.classList.add('show'));
  }
  function close() {
    sidebar.classList.remove('show');
    sidebar.addEventListener('transitionend', () => sidebar.classList.add('hidden'), { once: true });
    overlay.classList.add('hidden');
  }
  window.locationSidebar = { init, open, close };
})();
