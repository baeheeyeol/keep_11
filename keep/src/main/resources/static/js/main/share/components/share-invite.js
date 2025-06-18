//keep/src/main/resources/static/js/main/share/components/share-invite.js 에서
(function() {
	async function initShareInvite() {
		const list = document.querySelector('#invite-list');
		const input = document.querySelector('#invite-search-input');
		const btn = document.querySelector('#invite-search-btn');

		function renderEmpty(msg) {
			list.style.minHeight = '';
			list.innerHTML = `<div class="placeholder">${msg}</div>`;
		}
		if (btn && !btn.dataset.bound) {
			btn.dataset.bound = 'true';
			btn.addEventListener('click', () => {
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
						list.style.minHeight = 'auto';
						data.forEach(m => {
							const div = document.createElement('div');
							div.className = 'list-item';
							const button = document.createElement('button');
							button.className = 'invite-btn';
							button.dataset.id = m.id;

							if (!m.invitable) {
								button.textContent = '초대완료';
								button.disabled = true;
								button.classList.add('disabled');
							} else {
								button.textContent = '초대하기';
								button.addEventListener('click', () => {
									fetch(`/api/share/invite`, {
										method: 'POST',
										headers: { 'Content-Type': 'application/json' },
										body: JSON.stringify({ receiverId: m.id })
									}).then(res => {
										if (res.ok) {
											button.textContent = '초대완료';
											button.disabled = true;
											button.classList.add('disabled');
											if (window.saveToast && window.saveToast.showMessage) {
												window.saveToast.showMessage('초대가 완료되었습니다');
											}
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
	}
	window.initShareInvite = initShareInvite;
})();
