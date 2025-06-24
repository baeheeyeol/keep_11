//keep/src/main/resources/static/js/main/share/components/share-request.js 에서 조회시 리스트에 내가 초대 받은경우에는 선택 버튼대신 수락과 거절 버튼이 생성되도록 수정. 그리고 ScheduleShareUserDTO에서 
//Boolean pendingShare; 로 변경되었으니 invite.js에서도 관련 로직 수정
(function() {
        function initShareRequest() {
		const input = document.querySelector('.search-bar input');
		const btn = document.querySelector('.search-bar button');
		const messageEl = document.querySelector('.request-message');
		const requestBtn = document.querySelector('.request-btn');
		let list = document.getElementById('request-list');
		let selectedId = null;

		hideControls();

		function hideControls() {
			messageEl.style.display = 'none';
			requestBtn.style.display = 'none';
			requestBtn.textContent = '요청하기';
			requestBtn.disabled = false;
			messageEl.value = '';
		}

		function showControls() {
			messageEl.style.display = '';
			requestBtn.style.display = '';
		}

		function ensureList() {
			if (!list) {
				list = document.createElement('div');
				list.id = 'request-list';
				list.className = 'list-container';
				input.closest('.search-bar')?.after(list);
			}
		}

                function renderEmpty(msg) {
                        ensureList();
                        list.style.minHeight = '';
                        list.innerHTML = `<div class=\"placeholder\">${msg}</div>`;
                }

                function sendNotification(recipientId, action) {
                        let targetUrl = '/share?view=list';
                        if (action === 'REQUEST') {
                                targetUrl = '/share?view=manage&type=request';
                        } else if (action === 'INVITE_REJECT') {
                                targetUrl = '/share?view=invite';
                        } else if (action === 'REQUEST_REJECT') {
                                targetUrl = '/share?view=request';
                        } else if (action === 'INVITE') {
                                targetUrl = '/share?view=manage&type=invite';
                        }
                        fetch('/api/notifications', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ recipientId: recipientId, actionType: action, targetUrl })
                        });
                }

		btn?.addEventListener('click', () => {
			const name = input.value.trim();
			if (!name) return;
			hideControls();
			selectedId = null;
			ensureList();
                        fetch(`/api/requests/users?name=` + encodeURIComponent(name))
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
						const span = document.createElement('span');
						span.textContent = m.hname;
						const action = document.createElement('div');
						if (m.pendingShare) {
							if (m.acceptYn == 'Y') {
								const acceptBtn = document.createElement('button');
								acceptBtn.textContent = '완료';
								acceptBtn.disabled = true;
								acceptBtn.classList.add('disabled');
								action.appendChild(acceptBtn);
							} else {
								const acceptBtn = document.createElement('button');
								acceptBtn.className = 'accept-btn';
								acceptBtn.type = 'button';
								acceptBtn.textContent = '수락';
                                                                acceptBtn.addEventListener('click', () => {
                                                                        fetch(`/api/invitations/${m.scheduleShareId}`, {
                                                                               method: 'PATCH'
                                                                        }).then(res => {
                                                                               if (res.ok) {
                                                                               acceptBtn.textContent = '수락완료';
                                                                               acceptBtn.disabled = true;
                                                                               acceptBtn.classList.add('disabled');
                                                                               rejectBtn.remove();
                                                                               sendNotification(m.id, 'INVITE_ACCEPT');
                                                                               }
                                                                        });
                                                                });

								const rejectBtn = document.createElement('button');
								rejectBtn.className = 'reject-btn';
								rejectBtn.type = 'button';
								rejectBtn.textContent = '거절';
                                                                rejectBtn.addEventListener('click', () => {
                                                                        fetch(`/api/invitations/${m.scheduleShareId}`, {
                                                                               method: 'DELETE'
                                                                        }).then(res => {
                                                                               if (res.ok) {
                                                                               rejectBtn.textContent = '거절완료';
                                                                               rejectBtn.disabled = true;
                                                                               rejectBtn.classList.add('disabled');
                                                                               acceptBtn.remove();
                                                                               sendNotification(m.id, 'INVITE_REJECT');
                                                                               }
                                                                        });
                                                                });

								action.appendChild(acceptBtn);
								action.appendChild(rejectBtn);
							}
						} else {
							const button = document.createElement('button');
							button.className = 'select-btn';
							button.dataset.id = m.id;

							if (!m.invitable) {
								button.textContent = '요청완료';
								button.disabled = true;
								button.classList.add('disabled');
							} else {
								button.textContent = '선택';
								button.addEventListener('click', () => {
									Array.from(list.children).forEach(item => {
										if (item !== div) item.remove();
									});
									list.style.minHeight = 'auto';
									button.textContent = '선택완료';
									button.disabled = true;
									button.classList.add('disabled');
									selectedId = m.id;
									showControls();
								});
							}
							action.appendChild(button);
						}
						div.appendChild(span);
						div.appendChild(action);
						list.appendChild(div);
					});
				});
		});

		function showToast(message, duration = 3000) {
			const toast = document.createElement('div');
			toast.className = 'request-toast';
			toast.textContent = message;
			document.body.appendChild(toast);
			requestAnimationFrame(() => toast.classList.add('show'));
			setTimeout(() => {
				toast.classList.remove('show');
				toast.addEventListener('transitionend', () => toast.remove(), { once: true });
			}, duration);
		}

		requestBtn?.addEventListener('click', () => {
			if (!selectedId) return;
                        fetch('/api/requests', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
                               body: JSON.stringify({ sharerId: selectedId, message: messageEl.value })
                       }).then(res => {
                               if (res.ok) {
                                       showToast('요청이 완료되었습니다.');
                                        sendNotification(selectedId, 'REQUEST');
                                       input.value = '';
                                       selectedId = null;
                                       hideControls();
                                       renderEmpty('요청할 사람을 선택해 주세요.');
                               }
                       });
		});
	}
	window.initShareRequest = initShareRequest;
})();
