//keep/src/main/resources/static/js/main/share/components/share-request.js
(function() {
    function initShareRequest() {
        const input = document.querySelector('.search-bar input');
        const btn = document.querySelector('.search-bar button');
        const messageEl = document.querySelector('.request-message');
        const requestBtn = document.querySelector('.request-btn');
        let list = document.getElementById('request-list');
        let selected = null; // {sharerId, scheduleListId}

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
            list.innerHTML = `<div class="placeholder">${msg}</div>`;
        }

        function sendNotification(recipientId, action) {
            let targetUrl = '/share?view=list';
            if (action === 'REQUEST') {
                targetUrl = '/share?view=manage&type=request';
            }
            fetch('/api/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recipientId: recipientId, actionType: action, targetUrl })
            });
        }

        btn?.addEventListener('click', () => {
            const name = input.value.trim();
            if (!name) {
                return;
            }
            hideControls();
            selected = null;
            ensureList();
            fetch(`/api/requests/users-with-lists?name=` + encodeURIComponent(name))
                .then(res => res.json())
                .then(data => {
                    if (data.length === 0) {
                        renderEmpty('검색 결과가 없습니다.');
                        return;
                    }
                    list.innerHTML = '';
                    list.style.minHeight = 'auto';
                    data.forEach(u => {
                        const div = document.createElement('div');
                        div.className = 'list-item';
                        const span = document.createElement('span');
                        span.textContent = u.hname;

                        const select = document.createElement('select');
                        select.className = 'target-list-select';
                        u.schedules.forEach(sc => {
                            const opt = document.createElement('option');
                            opt.value = sc.scheduleListId;
                            opt.textContent = sc.title;
                            opt.dataset.requested = sc.requested ? 'Y' : 'N';
                            select.appendChild(opt);
                        });

                        const action = document.createElement('div');
                        const button = document.createElement('button');
                        button.className = 'select-btn';
                        button.type = 'button';

                        function updateButton() {
                            const opt = select.selectedOptions[0];
                            if (!opt) {
                                return;
                            }
                            const requested = opt.dataset.requested === 'Y';
                            if (button.textContent !== '선택완료') {
                                if (requested) {
                                    button.textContent = '요청완료';
                                    button.disabled = true;
                                    button.classList.add('disabled');
                                } else {
                                    button.textContent = '선택';
                                    button.disabled = false;
                                    button.classList.remove('disabled');
                                }
                            }
                            if (selected && selected.sharerId === u.id) {
                                selected.scheduleListId = select.value;
                                if (requested) {
                                    requestBtn.textContent = '요청완료';
                                    requestBtn.disabled = true;
                                    requestBtn.classList.add('disabled');
                                } else {
                                    requestBtn.textContent = '요청하기';
                                    requestBtn.disabled = false;
                                    requestBtn.classList.remove('disabled');
                                }
                            }
                        }
                        select.addEventListener('change', updateButton);
                        updateButton();

                        button.addEventListener('click', () => {
                            Array.from(list.children).forEach(item => {
                                if (item !== div) {
                                    item.remove();
                                }
                            });
                            list.style.minHeight = 'auto';
                            button.textContent = '선택완료';
                            button.disabled = true;
                            button.classList.add('disabled');
                            selected = { sharerId: u.id, scheduleListId: select.value };
                            showControls();
                            updateButton();
                        });

                        action.appendChild(select);
                        action.appendChild(button);
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
            if (!selected) {
                return;
            }
            fetch('/api/requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sharerId: selected.sharerId, scheduleListId: selected.scheduleListId, message: messageEl.value })
            }).then(res => {
                if (res.ok) {
                    showToast('요청이 완료되었습니다.');
                    sendNotification(selected.sharerId, 'REQUEST');
                    input.value = '';
                    selected = null;
                    hideControls();
                    renderEmpty('요청할 사람을 선택해 주세요.');
                }
            });
        });
    }
    window.initShareRequest = initShareRequest;
})();
