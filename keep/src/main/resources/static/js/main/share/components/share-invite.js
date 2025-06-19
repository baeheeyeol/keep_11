(function() {
    async function initShareInvite() {
        const list = document.querySelector('#invite-list');
        const input = document.querySelector('#invite-search-input');
        const btn = document.querySelector('#invite-search-btn');

        function renderEmpty(msg) {
            list.style.minHeight = '';
            list.innerHTML = `<div class="placeholder">${msg}</div>`;
        }

        function sendInvite(id, canEdit, cb) {
            fetch('/api/share/invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ receiverId: id, canEdit })
            }).then(res => {
                if (res.ok && cb) cb();
            });
        }

        function createInviteButtons(action, id) {
            const readBtn = document.createElement('button');
            readBtn.className = 'invite-btn';
            readBtn.textContent = '읽기 초대';

            const editBtn = document.createElement('button');
            editBtn.className = 'invite-btn';
            editBtn.textContent = '수정 초대';

            readBtn.addEventListener('click', () => {
                sendInvite(id, 'N', () => {
                    readBtn.textContent = '초대완료';
                    readBtn.disabled = true;
                    readBtn.classList.add('disabled');
                    editBtn.disabled = true;
                    window.saveToast?.showMessage('초대가 완료되었습니다');
                });
            });

            editBtn.addEventListener('click', () => {
                sendInvite(id, 'Y', () => {
                    readBtn.disabled = true;
                    editBtn.textContent = '초대완료';
                    editBtn.disabled = true;
                    editBtn.classList.add('disabled');
                    window.saveToast?.showMessage('초대가 완료되었습니다');
                });
            });

            action.appendChild(readBtn);
            action.appendChild(editBtn);
        }

        if (btn && !btn.dataset.bound) {
            btn.dataset.bound = 'true';
            btn.addEventListener('click', () => {
                const name = input.value.trim();
                if (!name) return;
                fetch(`/api/share/invite/users?name=` + encodeURIComponent(name))
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
                            span.textContent = m.hname + (m.requested ? ' (요청됨)' : '');
                            div.appendChild(span);

                            const action = document.createElement('div');

                            if (m.requested) {
                                const readBtn = document.createElement('button');
                                readBtn.className = 'accept-btn';
                                readBtn.textContent = '읽기 허용';

                                const editBtn = document.createElement('button');
                                editBtn.className = 'accept-btn';
                                editBtn.textContent = '수정 허용';

                                const rejectBtn = document.createElement('button');
                                rejectBtn.className = 'reject-btn';
                                rejectBtn.textContent = '거절';

                                readBtn.addEventListener('click', () => {
                                    fetch('/api/share/manage/requests/accept', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ sharerId: m.id, canEdit: 'N' })
                                    }).then(res => {
                                        if (res.ok) {
                                            editBtn.remove();
                                            rejectBtn.remove();
                                            readBtn.textContent = '처리완료';
                                            readBtn.disabled = true;
                                        }
                                    });
                                });

                                editBtn.addEventListener('click', () => {
                                    fetch('/api/share/manage/requests/accept', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ sharerId: m.id, canEdit: 'Y' })
                                    }).then(res => {
                                        if (res.ok) {
                                            readBtn.remove();
                                            rejectBtn.remove();
                                            editBtn.textContent = '처리완료';
                                            editBtn.disabled = true;
                                        }
                                    });
                                });

                                rejectBtn.addEventListener('click', () => {
                                    fetch(`/api/share/manage/requests?sharerId=${m.id}`, { method: 'DELETE' })
                                        .then(res => {
                                            if (res.ok) {
                                                action.innerHTML = '';
                                                createInviteButtons(action, m.id);
                                            }
                                        });
                                });

                                action.appendChild(readBtn);
                                action.appendChild(editBtn);
                                action.appendChild(rejectBtn);
                            } else if (!m.invitable) {
                                const done = document.createElement('button');
                                done.className = 'invite-btn disabled';
                                done.textContent = '초대완료';
                                done.disabled = true;
                                action.appendChild(done);
                            } else {
                                const readBtn = document.createElement('button');
                                readBtn.className = 'invite-btn';
                                readBtn.textContent = '읽기 초대';

                                const editBtn = document.createElement('button');
                                editBtn.className = 'invite-btn';
                                editBtn.textContent = '수정 초대';

                                readBtn.addEventListener('click', () => {
                                    sendInvite(m.id, 'N', () => {
                                        readBtn.textContent = '초대완료';
                                        readBtn.disabled = true;
                                        readBtn.classList.add('disabled');
                                        editBtn.disabled = true;
                                        window.saveToast?.showMessage('초대가 완료되었습니다');
                                    });
                                });

                                editBtn.addEventListener('click', () => {
                                    sendInvite(m.id, 'Y', () => {
                                        readBtn.disabled = true;
                                        editBtn.textContent = '초대완료';
                                        editBtn.disabled = true;
                                        editBtn.classList.add('disabled');
                                        window.saveToast?.showMessage('초대가 완료되었습니다');
                                    });
                                });

                                action.appendChild(readBtn);
                                action.appendChild(editBtn);
                            }

                            div.appendChild(action);
                            list.appendChild(div);
                        });
                    });
            });
        }
    }
    window.initShareInvite = initShareInvite;
})();
