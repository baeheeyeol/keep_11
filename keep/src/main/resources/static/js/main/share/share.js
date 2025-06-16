document.addEventListener('DOMContentLoaded', () => {
	const fragmentContainer = document.getElementById('fragment-container');
	const viewBtns = document.querySelectorAll('.view-btn');

	function loadView(view) {
		fragmentContainer.style.opacity = 0;
		fetch(`/share/fragment/${view}`)
			.then(res => {
				if (!res.ok) throw new Error('network');
				return res.text();
			})
			.then(html => {
				fragmentContainer.innerHTML = html;
				document.getElementById('share-invite-css').disabled = (view !== 'invite');
				document.getElementById('share-request-css').disabled = (view !== 'request');
				document.getElementById('share-list-css').disabled = (view !== 'list');
				document.getElementById('share-manage-css').disabled = (view !== 'manage');
				if (view === 'invite') {
					if (window.initShareInvite()) {
						window.initShareInvite();
					}
				} else if (view === 'request') {
					if (window.initShareRequest()) {
						window.initShareInvite();
					}
				} else if (view === 'list') {
					if (window.initShareList()) {
						window.initShareInvite();
					}
				} else if (view === 'manage') {
					if (window.initShareManage()) {
						window.initShareInvite();
					}
				}
				requestAnimationFrame(() => {
					fragmentContainer.style.opacity = 1;
				});
			})
			.catch(err => console.error(err));
	}

	viewBtns.forEach(btn => {
		btn.addEventListener('click', () => {
			const view = btn.dataset.view;
			viewBtns.forEach(b => b.classList.toggle('active', b === btn));
			loadView(view);
		});
	});

	loadView('invite');
});
