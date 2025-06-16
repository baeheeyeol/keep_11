//keep/src/main/resources/static/js/main/share/components/share-invite.js 에서 조회된 리스트 마우스 호버시 표가 나도록 수정하고 초대하기 구현하기
(function() {
	async function initShareInvite() {
		const list = document.getElementById('invite-list');
		const input = document.getElementById('invite-search-input');
		const btn = document.getElementById('invite-search-btn');

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
                                                const button = document.createElement('button');
                                                button.className = 'invite-btn';
                                                button.dataset.id = m.id;
                                                button.textContent = '초대하기';
                                                if (!m.invitable) {
                                                        button.disabled = true;
                                                        button.classList.add('disabled');
                                                } else {
                                                        button.addEventListener('click', () => {
                                                                fetch(`/api/share/invite`, {
                                                                        method: 'POST',
                                                                        headers: { 'Content-Type': 'application/json' },
                                                                        body: JSON.stringify({ receiverId: m.id})
                                                                }).then(res => {
                                                                        if (res.ok) {
                                                                                button.textContent = '초대 완료';
                                                                                button.disabled = true;
                                                                        }
                                                                });
                                                        });
                                                }
                                                div.appendChild(document.createElement('span')).textContent = m.hname;
                                                div.appendChild(button);
                                                list.appendChild(div);
                                        });
                                });
                });
	}
	window.initShareInvite = initShareInvite;
})();
