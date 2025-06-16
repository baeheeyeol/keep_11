//keep/src/main/resources/static/js/main/share/components/share-invite.js 에서 조회된 리스트 마우스 호버시 표가 나도록 수정하고 초대하기 구현하기
(function() {
	async function initShareInvite() {
		const list = document.getElementById('invite-list');
		const input = document.getElementById('invite-search-input');
		const btn = document.getElementById('invite-search-btn');
		const id = document.getElementById('fragment-container').dataset.Id;

		function renderEmpty(msg) {
			list.innerHTML = `<div class="placeholder">${msg}</div>`;
		}

                btn?.addEventListener('click', () => {
                        const name = input.value.trim();
                        if (!name) return;
                        fetch(`/api/share/invite?name=` + encodeURIComponent(name))
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
                                                div.innerHTML = `<span>${m.hname}</span><button class="invite-btn" data-id="${m.id}">초대하기</button>`;
                                                list.appendChild(div);
                                        });
                                });
                });

		list?.addEventListener('click', e => {
			if (e.target.classList.contains('invite-btn')) {
				const receiverId = e.target.dataset.id;
				fetch(`/api/share/invite`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ receiverId: receiverId})
				}).then(res => {
					if (res.ok) {
						e.target.textContent = '초대 완료';
						e.target.disabled = true;
					}
				});
			}
		});
	}
	window.initShareInvite = initShareInvite;
})();
