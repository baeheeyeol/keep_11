/*keep/src/main/resources/static/js/main/share/components/share-manage.js 에서 받은 요청및 받은 초대 버튼 클릭시 두번 클릭되는 현상이 발생하는데 안되도록 수정
*/
(function() {
        async function initShareManage() {
                const toggleBtns = document.querySelectorAll('.list-toggle .toggle-btn');
                const listContainer = document.querySelector('.list-container');
                const params = new URLSearchParams(window.location.search);
                let currentType = params.get('type') === 'invite' ? 'invite' : 'request';

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
                        let targetUrl = '/share?view=list';
                        if (action === 'INVITE_REJECT') {
                                targetUrl = '/share?view=invite';
                        } else if (action === 'REQUEST_REJECT') {
                                targetUrl = '/share?view=request';
                        }
                        fetch('/api/notifications', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ recipientId: recipientId, actionType: action, targetUrl })
                        });
                }

                async function acceptWithPermission(id, canEdit, container, name, userId) {
                        await fetch(`/api/requests/${id}`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ canEdit })
                        });
                        replaceWithDone(container, '완료');
                        sendNotification(userId, 'REQUEST_ACCEPT');
                        const perm = canEdit === 'Y' ? '수정' : '읽기';
                        if (window.saveToast && window.saveToast.showMessage) {
                                window.saveToast.showMessage(`${name}에게 ${perm} 권한이 부여되었습니다.`);
                        }
                }

                async function acceptRequest(id, container, name, userId) {
                        await fetch(`/api/invitations/${id}`, {
                                method: 'PATCH'
                        });
                        replaceWithDone(container, '수락완료');
                        sendNotification(userId, 'INVITE_ACCEPT');
                        if (window.saveToast && window.saveToast.showMessage) {
                                window.saveToast.showMessage(`${name}의 초대를 수락했습니다.`);
                        }
                }

                async function rejectRequest(id, isInvitation, container, name, userId) {
                        const base = isInvitation ? '/api/invitations' : '/api/requests';
                        await fetch(`${base}/${id}`, {
                                method: 'DELETE'
                        });
                        replaceWithDone(container, '거절완료');
                        const action = isInvitation ? 'INVITE_REJECT' : 'REQUEST_REJECT';
                        sendNotification(userId, action);
                        if (window.saveToast && window.saveToast.showMessage) {
                                window.saveToast.showMessage(`${name}의 요청을 거절했습니다.`);
                        }
                }

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
		function render(list, type) {
			listContainer.innerHTML = '';
			if (list.length === 0) {
				listContainer.innerHTML = '<div class="placeholder">목록이 없습니다.</div>';
				return;
			}
			if (type == 'request') {
                                list.forEach(m => {
                                        const div = document.createElement('div');
                                        div.className = 'list-item';

                                        const info = document.createElement('div');
                                        info.className = 'item-info';
                                        const titleSpan = document.createElement('span');
                                        titleSpan.className = 'schedule-title';
                                        titleSpan.textContent = m.title || '기본';
                                        const userSpan = document.createElement('span');
                                        userSpan.className = 'user-name';
                                        userSpan.textContent = m.hname;
                                        info.appendChild(titleSpan);
                                        info.appendChild(userSpan);
                                        div.appendChild(info);
					const action = document.createElement('div');
                                        const readBtn = document.createElement('button');
                                        readBtn.className = 'accept-btn';
                                        readBtn.type = 'button';
                                        readBtn.innerHTML = '✔️ 읽기 허용';
                                        readBtn.addEventListener('click', () => {
                                                acceptWithPermission(m.scheduleShareId, 'N', action, m.hname, m.receiverId);
                                        });

                                        const editBtn = document.createElement('button');
                                        editBtn.className = 'accept-btn';
                                        editBtn.type = 'button';
                                        editBtn.innerHTML = '✔️ 수정 허용';
                                        editBtn.addEventListener('click', () => {
                                                acceptWithPermission(m.scheduleShareId, 'Y', action, m.hname, m.receiverId);
                                        });

                                        const rejectBtn = document.createElement('button');
                                        rejectBtn.className = 'reject-btn';
                                        rejectBtn.type = 'button';
                                        rejectBtn.innerHTML = '✖️ 거절';
                                        rejectBtn.addEventListener('click', () => {
                                                rejectRequest(m.scheduleShareId, false, action, m.hname, m.receiverId);
                                        });

					action.appendChild(readBtn);
					action.appendChild(editBtn);
					action.appendChild(rejectBtn);

					div.appendChild(action);
					listContainer.appendChild(div);
				});
			} else {
                                list.forEach(m => {
                                        const div = document.createElement('div');
                                        div.className = 'list-item';

                                        const info = document.createElement('div');
                                        info.className = 'item-info';
                                        const titleSpan = document.createElement('span');
                                        titleSpan.className = 'schedule-title';
                                        titleSpan.textContent = m.title || '기본';
                                        const userSpan = document.createElement('span');
                                        userSpan.className = 'user-name';
                                        userSpan.textContent = m.hname;
                                        info.appendChild(titleSpan);
                                        info.appendChild(userSpan);
                                        div.appendChild(info);
					const action = document.createElement('div');
                                        const acceptBtn = document.createElement('button');
                                        acceptBtn.className = 'accept-btn';
                                        acceptBtn.type = 'button';
                                        acceptBtn.innerHTML = '✔️ 수락';
                                        acceptBtn.addEventListener('click', () => {
                                                acceptRequest(m.scheduleShareId, action, m.hname, m.sharerId);
                                        });

                                        const rejectBtn = document.createElement('button');
                                        rejectBtn.className = 'reject-btn';
                                        rejectBtn.type = 'button';
                                        rejectBtn.innerHTML = '✖️ 거절';
                                        rejectBtn.addEventListener('click', () => {
                                                rejectRequest(m.scheduleShareId, true, action, m.hname, m.sharerId);
                                        });

					action.appendChild(acceptBtn);
					action.appendChild(rejectBtn);

					div.appendChild(action);
					listContainer.appendChild(div);
				});
			}

		}

                async function load(type) {
                        const url = type === 'request' ? '/api/requests/received' : '/api/invitations/received';
                        const data = await fetchList(url);
                        render(data, type);
                }

                toggleBtns.forEach(btn => {
                        if (!btn.dataset.listenerAttached) {
                                btn.addEventListener('click', () => {
                                        toggleBtns.forEach(b => b.classList.toggle('active', b === btn));
                                        load(btn.dataset.target);
                                });
                                btn.dataset.listenerAttached = 'true';
                        }
                });

                toggleBtns.forEach(btn => {
                        if (btn.dataset.target === currentType) {
                                btn.classList.add('active');
                        } else {
                                btn.classList.remove('active');
                        }
                });

                load(currentType);
	}

	window.initShareManage = initShareManage;
})();