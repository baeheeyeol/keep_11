//keep/src/main/resources/static/js/main/share/components/share-invite.js 에서 이름 검색할때 본인 아이디는 세션에 저장되어있으니 js로 보내지 말고 controller단에서 확인하도록 수정
(function() {
	async function initShareInvite() {
		const list = document.getElementById('invite-list');
		const input = document.getElementById('invite-search-input');
		const btn = document.getElementById('invite-search-btn');
		const scheduleId = document.getElementById('fragment-container').dataset.scheduleId;

		function renderEmpty(msg) {
			list.innerHTML = `<div class="placeholder">${msg}</div>`;
		}

		btn?.addEventListener('click', () => {
			const name = input.value.trim();
			if (!name) return;
			fetch(`/api/schedules/${scheduleId}/share/search?name=` + encodeURIComponent(name))
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
				const id = e.target.dataset.id;
				fetch(`/api/schedules/${scheduleId}/share/invite`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ receiverId: id })
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
