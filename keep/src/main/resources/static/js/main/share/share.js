document.addEventListener('DOMContentLoaded', () => {
        const fragmentContainer = document.getElementById('fragment-container');
        const viewBtns = document.querySelectorAll('.view-btn');
        const params = new URLSearchParams(window.location.search);
        const allowedViews = ['list', 'request', 'invite', 'manage', 'mylist'];
        let currentView = params.get('view');
        if (!allowedViews.includes(currentView)) {
                currentView = 'invite';
        }

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
                                document.getElementById('share-mylist-css').disabled = (view !== 'mylist');
                                if (view === 'invite') {
                                        if (typeof window.initShareInvite === 'function') {
                                                window.initShareInvite();
                                        }
                                } else if (view === 'request') {
                                        if (typeof window.initShareRequest === 'function') {
                                                window.initShareRequest();
                                        }
                                } else if (view === 'list') {
                                        if (typeof window.initShareList === 'function') {
                                                window.initShareList();
                                        }
                                } else if (view === 'manage') {
                                        if (typeof window.initShareManage === 'function') {
                                                window.initShareManage();
                                        }
                                } else if (view === 'mylist') {
                                        if (typeof window.initShareMyList === 'function') {
                                                window.initShareMyList();
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

        viewBtns.forEach(btn => {
                if (btn.dataset.view === currentView) {
                        btn.classList.add('active');
                } else {
                        btn.classList.remove('active');
                }
        });

        loadView(currentView);
});
