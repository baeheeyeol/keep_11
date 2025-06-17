(function() { 
	const toast = document.getElementById('save-toast');
	const msgEl = document.getElementById('save-toast-message');
	const undoBtn = document.getElementById('save-toast-undo');
	let hideTimer = null;
	let lastId = null;
      function err(message = '오류가 발생했습니다') {
              if (!toast) return;
              clearTimeout(hideTimer);
              msgEl.textContent = message;
              undoBtn.style.display = 'none';
              toast.classList.remove('hidden');
              requestAnimationFrame(() => toast.classList.add('show'));
              hideTimer = setTimeout(() => {
                      hide();
              }, 4000);
      }

      function showMessage(message) {
              err(message);
      }

	function hide() {
		if (!toast) return;
		toast.classList.remove('show');
		toast.addEventListener('transitionend', () => toast.classList.add('hidden'), { once: true });
	}

	function showSaving() {
		if (!toast) return;
		clearTimeout(hideTimer);
		msgEl.textContent = '저장중...';
		undoBtn.style.display = 'none';
		toast.classList.remove('hidden');
		requestAnimationFrame(() => toast.classList.add('show'));
	}

	function showSaved(id, undoFn) {
		if (!toast) return;
		lastId = id;
		msgEl.textContent = '저장되었습니다';
		undoBtn.style.display = 'inline';
		toast.classList.remove('hidden');
		requestAnimationFrame(() => toast.classList.add('show'));
		undoBtn.onclick = async () => {
			clearTimeout(hideTimer);
			hide();
			await undoFn(lastId);
		};
		hideTimer = setTimeout(() => {
			hide();
		}, 4000);
	}

        window.saveToast = {
                showSaving,
                showSaved,
                showMessage,
                hide
        };
})();
