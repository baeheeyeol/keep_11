//keep/src/main/resources/static/js/main/share/components/share-request.js
(function() {
    function initShareRequest() {
        const input = document.querySelector('.search-bar input');
        const btn = document.querySelector('.search-bar button');
        let list = document.getElementById('request-list');

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
                        button.textContent = '선택';
                        button.addEventListener('click', () => {
                            Array.from(list.children).forEach(item => {
                                if (item !== div) item.remove();
                            });
                            button.textContent = '선택됨';
                            button.disabled = true;
                        });
                        div.appendChild(span);
                        div.appendChild(button);
                        list.appendChild(div);
                    });
                });
        });
    }
    window.initShareRequest = initShareRequest;
})();