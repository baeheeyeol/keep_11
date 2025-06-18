// JS for share list view
//keep/src/main/resources/static/js/main/share/components/share-list.js
(function() {
    async function initShareList() {
        const listEl = document.getElementById('share-list');
        const toggleBtns = document.querySelectorAll('.list-toggle .toggle-btn');

        async function load(target) {
            listEl.innerHTML = '';
            try {
                const res = await fetch(`/api/share/list?type=${target}`);
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
                    const readBtn = document.createElement('button');
                    readBtn.className = 'accept-btn';
                    readBtn.type = 'button';
                    readBtn.textContent = '읽기';
                    const editBtn = document.createElement('button');
                    editBtn.className = 'accept-btn';
                    editBtn.type = 'button';
                    editBtn.textContent = '수정';
                    const delBtn = document.createElement('button');
                    delBtn.className = 'reject-btn';
                    delBtn.type = 'button';
                    delBtn.textContent = '권한 삭제';

                    if (m.canEdit === 'Y') {
                        editBtn.disabled = true;
                        editBtn.classList.add('disabled');
                    } else {
                        readBtn.disabled = true;
                        readBtn.classList.add('disabled');
                    }

                    action.appendChild(readBtn);
                    action.appendChild(editBtn);
                    action.appendChild(delBtn);
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