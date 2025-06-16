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

    loadView('request');
});
