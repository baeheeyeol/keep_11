(function() {
    //keep/src/main/resources/static/js/main/share/components/share-invite.js
    function initShareInvite() {
        const input = document.getElementById('invite-search-input');
        const btn = document.getElementById('invite-search-btn');
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

        async function handleAccept(id, canEdit, container) {
            await fetch('/api/share/manage/requests/accept', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ scheduleShareId: id, canEdit })
            });
            replaceWithDone(container);
        }

        async function handleReject(id, container) {
            await fetch(`/api/share/manage/requests?scheduleShareId=${id}`, {
                method: 'DELETE'
            });
            replaceWithDone(container);
        }

        btn?.addEventListener('click', () => {
            const name = input.value.trim();
            if (!name) return;
            ensureList();
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
                        div.dataset.scheduleShareId = m.scheduleShareId || '';

                        const span = document.createElement('span');
                        span.textContent = m.hname;
                        div.appendChild(span);

                        const action = document.createElement('div');

                        if (m.requested) {
                            const readBtn = document.createElement('button');
                            readBtn.className = 'invite-btn';
                            readBtn.type = 'button';
                            readBtn.textContent = '읽기';
                            readBtn.addEventListener('click', () => {
                                handleAccept(m.scheduleShareId, 'N', action);
                            });

                            const editBtn = document.createElement('button');
                            editBtn.className = 'invite-btn';
                            editBtn.type = 'button';
                            editBtn.textContent = '수정';
                            editBtn.addEventListener('click', () => {
                                handleAccept(m.scheduleShareId, 'Y', action);
                            });

                            const rejectBtn = document.createElement('button');
                            rejectBtn.className = 'invite-btn';
                            rejectBtn.type = 'button';
                            rejectBtn.textContent = '거절';
                            rejectBtn.addEventListener('click', () => {
                                handleReject(m.scheduleShareId, action);
                            });

                            action.appendChild(readBtn);
                            action.appendChild(editBtn);
                            action.appendChild(rejectBtn);
                        } else {
                            const inviteBtn = document.createElement('button');
                            inviteBtn.className = 'invite-btn';
                            inviteBtn.type = 'button';

                            if (m.invitable) {
                                inviteBtn.textContent = '초대하기';
                                inviteBtn.addEventListener('click', () => {
                                    fetch('/api/share/invite', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ receiverId: m.id })
                                    }).then(res => {
                                        if (res.ok) {
                                            inviteBtn.textContent = '초대완료';
                                            inviteBtn.disabled = true;
                                            inviteBtn.classList.add('disabled');
                                        }
                                    });
                                });
                            } else {
                                inviteBtn.textContent = '초대완료';
                                inviteBtn.disabled = true;
                                inviteBtn.classList.add('disabled');
                            }

                            action.appendChild(inviteBtn);
                        }

                        div.appendChild(action);
                        list.appendChild(div);
                    });
                });
        });
    }

    window.initShareInvite = initShareInvite;
})();
