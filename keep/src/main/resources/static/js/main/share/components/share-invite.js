(function() {
	//keep/src/main/resources/static/js/main/share/components/share-invite.js
	function initShareInvite() {
               const input = document.getElementById('invite-search-input');
               const btn = document.getElementById('invite-search-btn');
               const listSelect = document.getElementById('schedule-list-select');
               const searchBar = input.closest('.search-bar');
                let list = document.getElementById('invite-list');

		function ensureList() {
			if (!list) {
				list = document.createElement('div');
				list.id = 'invite-list';
				list.className = 'list-container';
				input.closest('.search-bar')?.after(list);
			}
		}

                function renderEmpty(msg) {
                        ensureList();
                        list.style.minHeight = '';
                        list.innerHTML = `<div class="placeholder">${msg}</div>`;
                }

               function renderNoShareable() {
                       ensureList();
                       list.style.minHeight = '';
                       list.innerHTML = `<div class="placeholder"><span>공유가능한 일정이 없습니다.</span><button id="go-mylist" class="invite-btn go-mylist">나의 일정으로 바로가기</button></div>`;
                       document.getElementById('go-mylist')?.addEventListener('click', () => {
                               window.location.href = '/share?view=mylist';
                       });
               }

                fetch('/api/schedule-lists')
                        .then(res => res.json())
                        .then(data => {
                                const shareable = data.filter(l => l.isShareable === 'Y');
                                if (shareable.length === 0) {
                                        btn.disabled = true;
                                        listSelect.style.display = 'none';
                                        input.style.display = 'none';
                                        if (searchBar) {
                                            searchBar.style.display = 'none';
                                        }
                                        renderNoShareable();
                                } else {
                                        listSelect.innerHTML = shareable.map(l => `<option value="${l.scheduleListId}">${l.title}</option>`).join('');
                                }
                        });

		function createDoneButton(text) {
			const btn = document.createElement('button');
			btn.className = 'invite-btn disabled';
			btn.type = 'button';
			btn.textContent = text;
			btn.disabled = true;
			return btn;
		}

               function replaceWithDone(target, text = '요청완료') {
                       const done = createDoneButton(text);
                       target.innerHTML = '';
                       target.appendChild(done);
               }

                function sendNotification(recipientId, action) {
                        let targetUrl = '/share?view=list';
                        if (action === 'INVITE') {
                                targetUrl = '/share?view=manage&type=invite';
                        } else if (action === 'INVITE_REJECT') {
                                targetUrl = '/share?view=invite';
                        } else if (action === 'REQUEST_REJECT') {
                                targetUrl = '/share?view=request';
                        } else if (action === 'REQUEST') {
                                targetUrl = '/share?view=manage&type=request';
                        }
                        fetch('/api/notifications', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ recipientId: recipientId, actionType: action, targetUrl })
                        });
                }
                async function handleInvite(id, canEdit, container, name) {
                       fetch('/api/invitations', {
                               method: 'POST',
                               headers: { 'Content-Type': 'application/json' },
                               body: JSON.stringify({ receiverId: id, canEdit: canEdit, scheduleListId: listSelect.value })
                       });
                       replaceWithDone(container, '초대완료');
                        sendNotification(id, 'INVITE');
                       if (window.saveToast && window.saveToast.showMessage) {
                               window.saveToast.showMessage(`${name}에게 초대가 완료되었습니다.`);
                       }
               }
                async function handleAccept(id, canEdit, container, name, userId) {
                       await fetch(`/api/requests/${id}`, {
                               method: 'PATCH',
                               headers: { 'Content-Type': 'application/json' },
                               body: JSON.stringify({ canEdit: canEdit })
                       });
                       replaceWithDone(container);
                        sendNotification(userId, 'REQUEST_ACCEPT');
                       const perm = canEdit === 'Y' ? '수정' : '읽기';
                       if (window.saveToast && window.saveToast.showMessage) {
                               window.saveToast.showMessage(`${name}에게 ${perm} 권한이 부여되었습니다.`);
                       }
               }

                async function handleReject(id, container, name, userId) {
                       await fetch(`/api/requests/${id}`, {
                               method: 'DELETE'
                       });
                       replaceWithDone(container, '거절완료');
                        sendNotification(userId, 'REQUEST_REJECT');
                       if (window.saveToast && window.saveToast.showMessage) {
                               window.saveToast.showMessage(`${name}의 요청을 거절했습니다.`);
                       }
               }

		btn?.addEventListener('click', () => {
			const name = input.value.trim();
                        if (!name) {
                            return;
                        }
			ensureList();
                        fetch(`/api/invitations/users?name=` + encodeURIComponent(name) + `&scheduleListId=` + listSelect.value)
				.then(res => res.json())
				.then(data => {
					if (data.length === 0) {
						renderEmpty('검색 결과가 없습니다.');
						return;
					}

					list.innerHTML = '';
					list.style.minHeight = 'auto';

					data.forEach(m => {
						const div = document.createElement('div');
						div.className = 'list-item';
						div.dataset.scheduleShareId = m.scheduleShareId || '';

						const span = document.createElement('span');
						span.textContent = m.hname;
						div.appendChild(span);

						const action = document.createElement('div');

						if (m.pendingShare) {
							const readBtn = document.createElement('button');
							readBtn.className = 'invite-btn';
							readBtn.type = 'button';
							readBtn.textContent = '읽기승락';
                                                        readBtn.addEventListener('click', () => {
                                                                handleAccept(m.scheduleShareId, 'N', action, m.hname, m.id);
                                                        });

							const editBtn = document.createElement('button');
							editBtn.className = 'invite-btn';
							editBtn.type = 'button';
							editBtn.textContent = '수정승락';
                                                        editBtn.addEventListener('click', () => {
                                                                handleAccept(m.scheduleShareId, 'Y', action, m.hname, m.id);
                                                        });

							const rejectBtn = document.createElement('button');
							rejectBtn.className = 'invite-btn';
							rejectBtn.type = 'button';
							rejectBtn.textContent = '거절';
                                                        rejectBtn.addEventListener('click', () => {
                                                                handleReject(m.scheduleShareId, action, m.hname, m.id);
                                                        });

							action.appendChild(readBtn);
							action.appendChild(editBtn);
							action.appendChild(rejectBtn);
						} else {
							const inviteBtn = document.createElement('button');
							inviteBtn.className = 'invite-btn';
							inviteBtn.type = 'button';

							if (!m.invitable) {
								inviteBtn.textContent = '초대완료';
								inviteBtn.disabled = true;
								inviteBtn.classList.add('disabled');
								action.appendChild(inviteBtn);

							} else {
								const readBtn = document.createElement('button');
								readBtn.className = 'invite-btn';
								readBtn.type = 'button';
								readBtn.textContent = '읽기초대';
                                                                readBtn.addEventListener('click', () => {
                                                                        handleInvite(m.id, 'N', action, m.hname);
                                                                });

								const editBtn = document.createElement('button');
								editBtn.className = 'invite-btn';
								editBtn.type = 'button';
								editBtn.textContent = '수정초대';
                                                                editBtn.addEventListener('click', () => {
                                                                        handleInvite(m.id, 'Y', action, m.hname);
                                                                });
								action.appendChild(readBtn);
								action.appendChild(editBtn);


							}

						}

						div.appendChild(action);
						list.appendChild(div);
					});
				});
		});
	}

	window.initShareInvite = initShareInvite;
})();
