// JS for share Manage view
(function() {
        async function initShareManage() {
                const list = document.getElementById('manage-list');
                const input = document.getElementById('manage-search-input');
                const btn = document.getElementById('manage-search-btn');

                function renderEmpty(msg) {
                        list.innerHTML = `<div class="placeholder">${msg}</div>`;
                }

                btn?.addEventListener('click', () => {
                        const name = input.value.trim();
                        if (!name) return;
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
                                                        button.textContent = '선택된';
                                                        button.disabled = true;
                                                });
                                                div.appendChild(span);
                                                div.appendChild(button);
                                                list.appendChild(div);
                                        });
                                });
                });
        }
        window.initShareManage = initShareManage;
})();