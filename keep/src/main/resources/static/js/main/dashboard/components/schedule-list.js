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
                opt.dataset.share = l.isShareable;
                opt.classList.add(l.isShareable === 'Y' ? 'share-yes' : 'share-no');
                select.appendChild(opt);
            });
            if (data.length > 0) {
                select.value = data[0].scheduleListId;
                window.currentScheduleListId = data[0].scheduleListId;
                const hiddenInput = document.getElementById('current-schedule-list-id');
                if (hiddenInput) hiddenInput.value = data[0].scheduleListId;
                if (typeof window.refreshSchedule === 'function') window.refreshSchedule();
            }
        } catch (e) {
            console.error(e);
        }
    }

    let editMode = false;
    let editingId = null;

    function openModal(isEdit = false) {
        editMode = isEdit;
        document.getElementById('schedule-list-modal-overlay').classList.remove('hidden');
        document.getElementById('schedule-list-modal').classList.remove('hidden');
        const titleInput = document.getElementById('schedule-list-title');
        const shareSelect = document.getElementById('schedule-list-share');
        if (isEdit) {
            const select = document.getElementById('schedule-list-select');
            const opt = select.options[select.selectedIndex];
            editingId = opt.value;
            titleInput.value = opt.textContent;
            shareSelect.value = opt.dataset.share || 'Y';
        } else {
            editingId = null;
            titleInput.value = '';
            shareSelect.value = 'Y';
        }
    }

    function closeModal() {
        document.getElementById('schedule-list-modal-overlay').classList.add('hidden');
        document.getElementById('schedule-list-modal').classList.add('hidden');
    }

    async function saveList() {
        const title = document.getElementById('schedule-list-title').value.trim();
        const share = document.getElementById('schedule-list-share').value;
        if (!title) return;
        const body = JSON.stringify({ title, isShareable: share });
        const url = editMode && editingId ? `/api/schedule-lists/${editingId}` : '/api/schedule-lists';
        const method = editMode && editingId ? 'PATCH' : 'POST';
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body
        });
        if (res.ok) {
            await loadLists();
            closeModal();
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        const select = document.getElementById('schedule-list-select');
        const addBtn = document.getElementById('schedule-list-add');
        const editBtn = document.getElementById('schedule-list-edit');
        const saveBtn = document.getElementById('schedule-list-save');
        const cancelBtn = document.getElementById('schedule-list-cancel');
        const overlay = document.getElementById('schedule-list-modal-overlay');
        select && select.addEventListener('change', () => {
            window.currentScheduleListId = select.value;
            const hiddenInput = document.getElementById('current-schedule-list-id');
            if (hiddenInput) hiddenInput.value = select.value;
            if (typeof window.refreshSchedule === 'function') window.refreshSchedule();
        });
        addBtn && addBtn.addEventListener('click', () => openModal(false));
        editBtn && editBtn.addEventListener('click', () => openModal(true));
        saveBtn && saveBtn.addEventListener('click', saveList);
        cancelBtn && cancelBtn.addEventListener('click', closeModal);
        overlay && overlay.addEventListener('click', closeModal);
        loadLists();
    });
})();
