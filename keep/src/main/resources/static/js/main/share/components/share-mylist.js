(function() {
    async function updateList(id, body) {
        await fetch(`/api/schedule-lists/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
    }

    async function loadLists() {
        const container = document.getElementById('mylist-container');
        container.innerHTML = '';
        try {
            const res = await fetch('/api/schedule-lists');
            const data = await res.json();
            if (data.length === 0) {
                container.innerHTML = '<div class="placeholder">목록이 없습니다.</div>';
                return;
            }
            data.forEach(l => {
                const div = document.createElement('div');
                div.className = 'mylist-item';

                const titleText = document.createElement('span');
                titleText.className = 'title-text';
                titleText.textContent = l.title;

                const input = document.createElement('input');
                input.type = 'text';
                input.className = 'title-input';
                input.value = l.title;

                const share = document.createElement('div');
                share.className = 'mylist-share';
                const yBtn = document.createElement('button');
                yBtn.className = 'share-btn';
                yBtn.textContent = 'Y';
                const nBtn = document.createElement('button');
                nBtn.className = 'share-btn';
                nBtn.textContent = 'N';
                share.appendChild(yBtn);
                share.appendChild(nBtn);

                const actions = document.createElement('div');
                const editBtn = document.createElement('button');
                editBtn.className = 'edit-btn';
                editBtn.textContent = '✎';
                editBtn.title = '편집';
                editBtn.setAttribute('aria-label', '편집');

                const saveBtn = document.createElement('button');
                saveBtn.className = 'save-btn';
                saveBtn.textContent = '✔︎';
                saveBtn.title = '저장';
                saveBtn.setAttribute('aria-label', '저장');

                const cancelBtn = document.createElement('button');
                cancelBtn.className = 'cancel-btn';
                cancelBtn.textContent = '✖';
                cancelBtn.title = '취소';
                cancelBtn.setAttribute('aria-label', '취소');

                actions.appendChild(editBtn);
                actions.appendChild(saveBtn);
                actions.appendChild(cancelBtn);

                function refreshShare() {
                    yBtn.classList.toggle('active', l.isShareable === 'Y');
                    nBtn.classList.toggle('active', l.isShareable === 'N');
                }
                refreshShare();

                yBtn.addEventListener('click', async () => {
                    if (l.isShareable === 'Y') return;
                    await updateList(l.scheduleListId, { title: l.title, isShareable: 'Y' });
                    l.isShareable = 'Y';
                    refreshShare();
                    window.saveToast?.showMessage('해당 일정을 공유할수 있습니다.');
                });
                nBtn.addEventListener('click', async () => {
                    if (l.isShareable === 'N') return;
                    await updateList(l.scheduleListId, { title: l.title, isShareable: 'N' });
                    l.isShareable = 'N';
                    refreshShare();
                    window.saveToast?.showMessage('공유가 취소 되었습니다.');
                });

                function startEdit() {
                    div.classList.add('editing');
                    input.value = l.title;
                    input.focus();
                }

                async function saveEdit() {
                    const newTitle = input.value.trim();
                    div.classList.remove('editing');
                    if (!newTitle) {
                        input.value = l.title;
                        return;
                    }
                    if (newTitle !== l.title) {
                        await updateList(l.scheduleListId, { title: newTitle, isShareable: l.isShareable });
                        l.title = newTitle;
                        titleText.textContent = newTitle;
                        window.saveToast?.showMessage('저장되었습니다');
                    }
                }

                function cancelEdit() {
                    div.classList.remove('editing');
                    input.value = l.title;
                }

                editBtn.addEventListener('click', startEdit);
                cancelBtn.addEventListener('click', cancelEdit);
                saveBtn.addEventListener('click', () => {
                    saveEdit().then(() => input.blur());
                });

                input.addEventListener('keydown', e => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        saveEdit().then(() => input.blur());
                    } else if (e.key === 'Escape') {
                        cancelEdit();
                        input.blur();
                    }
                });
                input.addEventListener('blur', () => {
                    if (div.classList.contains('editing')) cancelEdit();
                });

                div.appendChild(titleText);
                div.appendChild(input);
                div.appendChild(share);
                div.appendChild(actions);
                container.appendChild(div);
            });
        } catch (e) {
            console.error(e);
            container.innerHTML = '<div class="placeholder">불러오지 못했습니다.</div>';
        }
    }

    function initAdd() {
        const overlay = document.getElementById('schedule-list-modal-overlay');
        const modal = document.getElementById('schedule-list-modal');
        const titleInput = document.getElementById('schedule-list-title');
        const shareSel = document.getElementById('schedule-list-share');
        const saveBtn = document.getElementById('schedule-list-save');
        const cancelBtn = document.getElementById('schedule-list-cancel');
        const addBtn = document.getElementById('mylist-add');

        function openModal() {
            titleInput.value = '';
            shareSel.value = 'Y';
            overlay.classList.remove('hidden');
            modal.classList.remove('hidden');
        }
        function closeModal() {
            overlay.classList.add('hidden');
            modal.classList.add('hidden');
        }
        async function save() {
            const title = titleInput.value.trim();
            if (!title) return;
            await fetch('/api/schedule-lists', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, isShareable: shareSel.value })
            });
            closeModal();
            loadLists();
            window.saveToast?.showMessage('저장되었습니다');
        }

        addBtn?.addEventListener('click', openModal);
        saveBtn?.addEventListener('click', save);
        cancelBtn?.addEventListener('click', closeModal);
        overlay?.addEventListener('click', closeModal);
    }

    window.initShareMyList = function() {
        loadLists();
        initAdd();
		
    };
})();
