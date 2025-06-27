(function() {
    let scheduleStomp = null;
    let scheduleSub = null;

    function connectScheduleSocket(listId) {
        if (!window.SockJS || !window.Stomp || !listId) {
            return;
        }
        if (scheduleStomp) {
            try { scheduleStomp.disconnect(); } catch (e) {}
            scheduleStomp = null;
            scheduleSub = null;
        }
        const sock = new SockJS('/ws');
        scheduleStomp = Stomp.over(sock);
        scheduleStomp.connect({}, () => {
            scheduleSub = scheduleStomp.subscribe('/topic/schedules/' + listId, () => {
                if (typeof window.refreshSchedule === 'function') {
                    window.refreshSchedule();
                }
            });
        });
    }

    function updateEditButton() {
        const editBtn = document.getElementById('schedule-list-edit');
        const select = document.getElementById('schedule-list-select');
        if (!editBtn || !select) {
            return;
        }
        const opt = select.options[select.selectedIndex];
        const ownerId = Number(opt.dataset.owner);
        const myId = window.currentUserId;
        editBtn.style.display = (myId && ownerId === myId) ? '' : 'none';
    }

    async function loadLists() {
        const select = document.getElementById('schedule-list-select');
        if (!select) {
            return;
        }
        try {
            const res = await fetch('/api/schedule-lists');
            if (!res.ok) {
                throw new Error('network');
            }
            const data = await res.json();
            select.innerHTML = '';
            data.forEach(l => {
                const opt = document.createElement('option');
                opt.value = l.scheduleListId;
                opt.textContent = l.hname ? `${l.hname} : ${l.title}` : l.title;
                opt.dataset.title = l.title;
                opt.dataset.share = l.isShareable;
                opt.dataset.owner = l.userId;
                opt.dataset.canEdit = l.canEdit || 'N';
                opt.classList.add(l.isShareable === 'Y' ? 'share-yes' : 'share-no');
                select.appendChild(opt);
            });
            if (data.length > 0) {
                const first = data[0];
                select.value = first.scheduleListId;
                window.currentScheduleListId = first.scheduleListId;
                window.currentScheduleOwnerId = first.userId;
                window.currentCanEdit = first.canEdit || 'N';
                const hiddenInput = document.getElementById('current-schedule-list-id');
            if (hiddenInput) {
                hiddenInput.value = first.scheduleListId;
            }
                connectScheduleSocket(first.scheduleListId);
                updateEditButton();
            }
            document.dispatchEvent(new Event('scheduleListsLoaded'));
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
            titleInput.value = opt.dataset.title || opt.textContent;
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
        if (!title) {
            return;
        }
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
        const userEl = document.querySelector('.notification[data-user-id]');
    if (userEl) {
        window.currentUserId = Number(userEl.dataset.userId);
    }
        const select = document.getElementById('schedule-list-select');
        const addBtn = document.getElementById('schedule-list-add');
        const editBtn = document.getElementById('schedule-list-edit');
        const saveBtn = document.getElementById('schedule-list-save');
        const cancelBtn = document.getElementById('schedule-list-cancel');
        const overlay = document.getElementById('schedule-list-modal-overlay');
        select && select.addEventListener('change', () => {
            const opt = select.options[select.selectedIndex];
            window.currentScheduleListId = opt.value;
            window.currentScheduleOwnerId = Number(opt.dataset.owner);
            window.currentCanEdit = opt.dataset.canEdit || 'N';
            const hiddenInput = document.getElementById('current-schedule-list-id');
        if (hiddenInput) {
            hiddenInput.value = opt.value;
        }
        if (typeof window.refreshSchedule === 'function') {
            window.refreshSchedule();
        }
            connectScheduleSocket(opt.value);
            updateEditButton();
        });
        addBtn && addBtn.addEventListener('click', () => openModal(false));
        editBtn && editBtn.addEventListener('click', () => openModal(true));
        saveBtn && saveBtn.addEventListener('click', saveList);
        cancelBtn && cancelBtn.addEventListener('click', closeModal);
        overlay && overlay.addEventListener('click', closeModal);
        loadLists();
    });
})();
