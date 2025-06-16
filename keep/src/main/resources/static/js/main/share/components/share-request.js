//keep/src/main/resources/static/js/main/share/components/share-request.js
(function() {
    function initShareRequest() {
        const input = document.querySelector('.search-bar input');
        const btn = document.querySelector('.search-bar button');
        const messageEl = document.querySelector('.request-message');
        const requestBtn = document.querySelector('.request-btn');
        let list = document.getElementById('request-list');
        let selectedId = null;

        hideControls();
        renderEmpty('요청할 사람을 선택해 주세요.');

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
            list.innerHTML = `<div class="placeholder">${msg}</div>`;
        }

        btn?.addEventListener('click', () => {
            const name = input.value.trim();
            if (!name) return;
            hideControls();
            selectedId = null;
            ensureList();
            fetch(`/api/share/search?name=` + encodeURIComponent(name))
                .then(res => res.json())
                .then(data => {
                    if (data.length === 0) {
                        renderEmpty('검색 결과가 없습니다.');
                        return;
                    }
                    list.innerHTML = '';
                    data.forEach(m => {
                        const div = document.createElement('div');
                        div.className = 'list-item';
                        const span = document.createElement('span');
                        span.textContent = m.hname;
                        const button = document.createElement('button');
                        button.className = 'select-btn';
                        button.dataset.id = m.id;

                        if (!m.invitable) {
                            button.textContent = '선택완료';
                            button.disabled = true;
                            button.classList.add('disabled');
                        } else {
                            button.textContent = '선택';
                            button.addEventListener('click', () => {
                                Array.from(list.children).forEach(item => {
                                    if (item !== div) item.remove();
                                });
                                button.textContent = '선택완료';
                                button.disabled = true;
                                button.classList.add('disabled');
                                selectedId = m.id;
                                showControls();
                            });
                        }
                        div.appendChild(span);
                        div.appendChild(button);
                        list.appendChild(div);
                    });
                });
        });

        requestBtn?.addEventListener('click', () => {
            if (!selectedId) return;
            fetch('/api/share/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sharerId: selectedId, message: messageEl.value })
            }).then(res => {
                if (res.ok) {
                    requestBtn.textContent = '요청 완료';
                    requestBtn.disabled = true;
                }
            });
        });
    }
    window.initShareRequest = initShareRequest;
})();
