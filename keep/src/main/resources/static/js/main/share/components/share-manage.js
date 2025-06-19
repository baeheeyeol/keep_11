//keep/src/main/resources/static/js/main/share/components/share-manage.js
(function() {
    async function initShareManage() {
        const toggleBtns = document.querySelectorAll('.list-toggle .toggle-btn');
        const listContainer = document.querySelector('.list-container');
        const acceptAllBtn = document.getElementById('accept-all-btn');
        const rejectAllBtn = document.getElementById('reject-all-btn');
        let currentType = 'request';

        async function fetchList(url) {
            try {
                const res = await fetch(url);
                if (!res.ok) throw new Error('network');
                return await res.json();
            } catch (e) {
                console.error(e);
                return [];
            }
        }

        function render(list) {
            listContainer.innerHTML = '';
            if (list.length === 0) {
                listContainer.innerHTML = '<div class="placeholder">목록이 없습니다.</div>';
                return;
            }
            list.forEach(m => {
                const div = document.createElement('div');
                div.className = 'list-item';
                div.appendChild(document.createElement('span')).textContent = m.hname;
                const action = document.createElement('div');

                if (currentType === 'request') {
                    const readBtn = document.createElement('button');
                    readBtn.className = 'accept-btn';
                    readBtn.type = 'button';
                    readBtn.textContent = '읽기만 허용';
                    readBtn.addEventListener('click', async () => {
                        await fetch('/api/share/manage/requests/accept', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ receiverId: m.id, canEdit: 'N' })
                        });
                        load(currentType);
                    });

                    const editBtn = document.createElement('button');
                    editBtn.className = 'accept-btn';
                    editBtn.type = 'button';
                    editBtn.textContent = '수정까지 허용';
                    editBtn.addEventListener('click', async () => {
                        await fetch('/api/share/manage/requests/accept', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ receiverId: m.id, canEdit: 'Y' })
                        });
                        load(currentType);
                    });

                    const rejectBtn = document.createElement('button');
                    rejectBtn.className = 'reject-btn';
                    rejectBtn.type = 'button';
                    rejectBtn.textContent = '거절';
                    rejectBtn.addEventListener('click', async () => {
                        await fetch('/api/share/manage/requests/reject', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ receiverId: m.id })
                        });
                        load(currentType);
                    });

                    action.appendChild(readBtn);
                    action.appendChild(editBtn);
                    action.appendChild(rejectBtn);
                } else {
                    const acceptBtn = document.createElement('button');
                    acceptBtn.className = 'accept-btn';
                    acceptBtn.type = 'button';
                    acceptBtn.textContent = '수락';
                    acceptBtn.addEventListener('click', async () => {
                        await fetch('/api/share/manage/invitations/accept', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ sharerId: m.id })
                        });
                        load(currentType);
                    });

                    const rejectBtn = document.createElement('button');
                    rejectBtn.className = 'reject-btn';
                    rejectBtn.type = 'button';
                    rejectBtn.textContent = '거절';
                    rejectBtn.addEventListener('click', async () => {
                        await fetch('/api/share/manage/invitations/reject', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ sharerId: m.id })
                        });
                        load(currentType);
                    });

                    action.appendChild(acceptBtn);
                    action.appendChild(rejectBtn);
                }

                div.appendChild(action);
                listContainer.appendChild(div);
            });
        }

        async function load(type) {
            currentType = type;
            const url = type === 'request' ? '/api/share/manage/requests' : '/api/share/manage/invitations';
            const data = await fetchList(url);
            render(data);
        }

        acceptAllBtn?.addEventListener('click', async () => {
            const url = currentType === 'request'
                ? '/api/share/manage/requests/accept-all'
                : '/api/share/manage/invitations/accept-all';
            await fetch(url, { method: 'POST' });
            load(currentType);
        });

        rejectAllBtn?.addEventListener('click', async () => {
            const url = currentType === 'request'
                ? '/api/share/manage/requests/reject-all'
                : '/api/share/manage/invitations/reject-all';
            await fetch(url, { method: 'POST' });
            load(currentType);
        });

        toggleBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                toggleBtns.forEach(b => b.classList.toggle('active', b === btn));
                load(btn.dataset.target);
            });
        });

        // default view
        load('request');
    }

    window.initShareManage = initShareManage;
})();
