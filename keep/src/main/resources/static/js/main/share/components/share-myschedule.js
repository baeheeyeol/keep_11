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

                const left = document.createElement('div');
                const editBtn = document.createElement('button');
                editBtn.className = 'edit-btn';
                editBtn.textContent = '편집';
                const input = document.createElement('input');
                input.type = 'text';
                input.value = l.title;
                input.className = 'title-input';
                input.disabled = true;
                left.appendChild(editBtn);
                left.appendChild(input);

                const share = document.createElement('div');
                share.className = 'mylist-share';
                share.textContent = '공유여부 : ';
                const yBtn = document.createElement('button');
                yBtn.className = 'share-btn';
                yBtn.textContent = 'Y';
                const nBtn = document.createElement('button');
                nBtn.className = 'share-btn';
                nBtn.textContent = 'N';
                share.appendChild(yBtn);
                share.appendChild(nBtn);

                function refreshShare() {
                    yBtn.classList.toggle('active', l.isShareable === 'Y');
                    nBtn.classList.toggle('active', l.isShareable === 'N');
                }
                refreshShare();

                yBtn.addEventListener('click', async () => {
                    if (l.isShareable === 'Y') return;
                    await updateList(l.scheduleListId, { title: input.value, isShareable: 'Y' });
                    l.isShareable = 'Y';
                    refreshShare();
                    window.saveToast?.showMessage('해당 일정을 공유할수 있습니다.');
                });
                nBtn.addEventListener('click', async () => {
                    if (l.isShareable === 'N') return;
                    await updateList(l.scheduleListId, { title: input.value, isShareable: 'N' });
                    l.isShareable = 'N';
                    refreshShare();
                    window.saveToast?.showMessage('공유가 취소 되었습니다.');
                });

                editBtn.addEventListener('click', async () => {
                    if (editBtn.textContent === '편집') {
                        input.disabled = false;
                        input.classList.add('editable');
                        input.focus();
                        editBtn.textContent = '저장';
                    } else {
                        const newTitle = input.value.trim();
                        if (!newTitle) {
                            input.value = l.title;
                        } else if (newTitle !== l.title) {
                            await updateList(l.scheduleListId, { title: newTitle, isShareable: l.isShareable });
                            l.title = newTitle;
                            window.saveToast?.showMessage('저장되었습니다');
                        }
                        input.disabled = true;
                        input.classList.remove('editable');
                        editBtn.textContent = '편집';
                    }
                });

                div.appendChild(left);
                div.appendChild(share);
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
