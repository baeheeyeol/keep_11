(function() {
    async function loadLists() {
        const select = document.getElementById('schedule-list-select');
        if (!select) return;
        try {
            const res = await fetch('/api/schedule-lists');
            if (!res.ok) throw new Error('network');
            const data = await res.json();
            select.innerHTML = '';
            data.forEach(l => {
                const opt = document.createElement('option');
                opt.value = l.scheduleListId;
                opt.textContent = l.title;
                select.appendChild(opt);
            });
            if (data.length > 0) {
                select.value = data[0].scheduleListId;
                window.currentScheduleListId = data[0].scheduleListId;
                if (typeof window.refreshSchedule === 'function') window.refreshSchedule();
            }
        } catch (e) {
            console.error(e);
        }
    }

    function openModal() {
        document.getElementById('schedule-list-modal-overlay').classList.remove('hidden');
        document.getElementById('schedule-list-modal').classList.remove('hidden');
        document.getElementById('schedule-list-title').value = '';
    }

    function closeModal() {
        document.getElementById('schedule-list-modal-overlay').classList.add('hidden');
        document.getElementById('schedule-list-modal').classList.add('hidden');
    }

    async function saveList() {
        const title = document.getElementById('schedule-list-title').value.trim();
        if (!title) return;
        const res = await fetch('/api/schedule-lists', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title })
        });
        if (res.ok) {
            await loadLists();
            closeModal();
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        const select = document.getElementById('schedule-list-select');
        const addBtn = document.getElementById('schedule-list-add');
        const saveBtn = document.getElementById('schedule-list-save');
        const cancelBtn = document.getElementById('schedule-list-cancel');
        const overlay = document.getElementById('schedule-list-modal-overlay');
        select && select.addEventListener('change', () => {
            window.currentScheduleListId = select.value;
            if (typeof window.refreshSchedule === 'function') window.refreshSchedule();
        });
        addBtn && addBtn.addEventListener('click', openModal);
        saveBtn && saveBtn.addEventListener('click', saveList);
        cancelBtn && cancelBtn.addEventListener('click', closeModal);
        overlay && overlay.addEventListener('click', closeModal);
        loadLists();
    });
})();
