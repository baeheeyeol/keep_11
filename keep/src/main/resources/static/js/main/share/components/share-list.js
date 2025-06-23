// JS for share list view
//keep/src/main/resources/static/js/main/share/components/share-list.js

(function() {
    async function initShareList() {
        const listEl = document.getElementById('share-list');
        const toggleBtns = document.querySelectorAll('.list-toggle .toggle-btn');

        function createDoneButton(text) {
            const btn = document.createElement('button');
            btn.className = 'accept-btn disabled';
            btn.type = 'button';
            btn.textContent = text;
            btn.disabled = true;
            return btn;
        }

        function replaceWithDone(container, text) {
            const done = createDoneButton(text);
            container.innerHTML = '';
            container.appendChild(done);
        }

        function sendNotification(recipientId, action) {
            fetch('/api/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recipientId: recipientId, actionType: action, targetUrl: '/share?view=list' })
            });
        }

        async function acceptAndSetPermissions(id, canEdit, container, name, userId) {
            await fetch(`/api/requests/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ canEdit })
            });
            replaceWithDone(container, '완료');
            sendNotification(userId, 'SHARE_UPDATE');
            const perm = canEdit === 'Y' ? '수정' : '읽기';
            if (window.saveToast && window.saveToast.showMessage) {
                window.saveToast.showMessage(`${name}에게 ${perm} 권한이 부여되었습니다.`);
            }
        }

        async function rejectRequest(id, container, name, userId) {
            await fetch(`/api/requests/${id}`, {
                method: 'DELETE'
            });
            replaceWithDone(container, '삭제완료');
            sendNotification(userId, 'SHARE_DELETE');
            if (window.saveToast && window.saveToast.showMessage) {
                window.saveToast.showMessage(`${name}의 공유가 삭제되었습니다.`);
            }
        }

        async function load(target) {
            listEl.innerHTML = '';
            try {
                const res = await fetch(`/api/requests/shares?type=${target}`);
                if (!res.ok) throw new Error('network');
                const members = await res.json();
                if (members.length === 0) {
                    listEl.innerHTML = '<div class="placeholder">목록이 없습니다.</div>';
                    return;
                }
                members.forEach(m => {
                    const div = document.createElement('div');
                    div.className = 'list-item';
                    div.appendChild(document.createElement('span')).textContent = m.hname;

                    const action = document.createElement('div');

                    if (target === 'shared') {
                        const readBtn = document.createElement('button');
                        readBtn.className = 'accept-btn';
                        readBtn.type = 'button';
                        readBtn.textContent = '읽기';
                        readBtn.addEventListener('click', () => {
                            acceptAndSetPermissions(m.scheduleShareId, 'N', action, m.hname, m.receiverId);
                        });

                        const editBtn = document.createElement('button');
                        editBtn.className = 'accept-btn';
                        editBtn.type = 'button';
                        editBtn.textContent = '수정';
                        editBtn.addEventListener('click', () => {
                            acceptAndSetPermissions(m.scheduleShareId, 'Y', action, m.hname, m.receiverId);
                        });

                        if (m.canEdit === 'Y') {
                            editBtn.disabled = true;
                            editBtn.classList.add('disabled');
                        } else {
                            readBtn.disabled = true;
                            readBtn.classList.add('disabled');
                        }

                        const delBtn = document.createElement('button');
                        delBtn.className = 'reject-btn';
                        delBtn.type = 'button';
                        delBtn.textContent = '삭제';
                        delBtn.addEventListener('click', () => {
                            rejectRequest(m.scheduleShareId, action, m.hname, m.receiverId);
                        });

                        action.appendChild(readBtn);
                        action.appendChild(editBtn);
                        action.appendChild(delBtn);
                    } else {
                        const delBtn = document.createElement('button');
                        delBtn.className = 'reject-btn';
                        delBtn.type = 'button';
                        delBtn.textContent = '삭제';
                        delBtn.addEventListener('click', () => {
                            rejectRequest(m.scheduleShareId, action, m.hname, m.sharerId);
                        });

                        action.appendChild(delBtn);
                    }

                    div.appendChild(action);
                    listEl.appendChild(div);
                });
            } catch (e) {
                console.error(e);
                listEl.innerHTML = '<div class="placeholder">목록을 불러오지 못했습니다.</div>';
            }
        }

        toggleBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                toggleBtns.forEach(b => b.classList.toggle('active', b === btn));
                load(btn.dataset.target);
            });
        });

        load('shared');
    }
    window.initShareList = initShareList;
})();
