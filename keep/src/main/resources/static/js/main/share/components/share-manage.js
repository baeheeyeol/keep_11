/*keep/src/main/resources/static/js/main/share/components/share-manage.js 에서 읽기 허용 ,수정 허용 버튼 선택시 각각 canEdit 값이 N,Y로 ScheduleShareApiController 의 acceptAndSetPermissions를 호출하고 거절은 rejectRequest를 호출한다. 수락 버튼 클릭시 acceptRequest를 호출한다.
*/
(function() {
	async function initShareManage() {
		const toggleBtns = document.querySelectorAll('.list-toggle .toggle-btn');
		const listContainer = document.querySelector('.list-container');
		let currentType = 'request';

		async function fetchList(url) {
			try {
				const res = await fetch(url);
				if (!res.ok) throw new Error('network');
				return await res.json();
			} catch (e) {
				console.error(e);
				return [];
			}
		}
		function render(list, type) {
			listContainer.innerHTML = '';
			if (list.length === 0) {
				listContainer.innerHTML = '<div class="placeholder">목록이 없습니다.</div>';
				return;
			}
			if (type == 'request') {
				list.forEach(m => {
					const div = document.createElement('div');
					div.className = 'list-item';
					div.appendChild(document.createElement('span')).textContent = m.hname;
					const action = document.createElement('div');
					const readBtn = document.createElement('button');
					readBtn.className = 'accept-btn';
					readBtn.type = 'button';
					readBtn.textContent = '읽기 허용';

					const editBtn = document.createElement('button');
					editBtn.className = 'accept-btn';
					editBtn.type = 'button';
					editBtn.textContent = '수정 허용';

					const rejectBtn = document.createElement('button');
					rejectBtn.className = 'reject-btn';
					rejectBtn.type = 'button';
					rejectBtn.textContent = '거절';

					action.appendChild(readBtn);
					action.appendChild(editBtn);
					action.appendChild(rejectBtn);
					
					div.appendChild(action);
					listContainer.appendChild(div);
				});
			} else {
				list.forEach(m => {
					const div = document.createElement('div');
					div.className = 'list-item';
					div.appendChild(document.createElement('span')).textContent = m.hname;
					const action = document.createElement('div');
					const acceptBtn = document.createElement('button');
					acceptBtn.className = 'accept-btn';
					acceptBtn.type = 'button';
					acceptBtn.textContent = '수락';

					const rejectBtn = document.createElement('button');
					rejectBtn.className = 'reject-btn';
					rejectBtn.type = 'button';
					rejectBtn.textContent = '거절';

					action.appendChild(acceptBtn);
					action.appendChild(rejectBtn);
					
					div.appendChild(action);
					listContainer.appendChild(div);
				});
			}

		}

		async function load(type) {
			const url = type === 'request' ? '/api/share/manage/requests' : '/api/share/manage/invitations';
			const data = await fetchList(url);
			render(data, type);
		}

		toggleBtns.forEach(btn => {
			btn.addEventListener('click', () => {
				toggleBtns.forEach(b => b.classList.toggle('active', b === btn));
				load(btn.dataset.target);
			});
		});

		// default view
		load('request');
	}

	window.initShareManage = initShareManage;
})();