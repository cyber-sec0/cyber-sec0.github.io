// Wait for HTML to load before running any of the scripts below
document.addEventListener('DOMContentLoaded', () => {
	// 1. Form Submit Success Notification Logic
	const formNextUrlInput = document.getElementById('nextUrl');
	if (formNextUrlInput) {
		formNextUrlInput.value = window.location.href.split('?')[0] + '?success=true';
	}

	if (new URLSearchParams(window.location.search).get('success') === 'true') {
		const toast = document.getElementById('successToast');
		if (toast) {
			toast.style.display = 'flex';
			setTimeout(() => toast.classList.remove('translate-x-[150%]'), 50);
			setTimeout(() => {
				toast.classList.add('translate-x-[150%]');
				setTimeout(() => (toast.style.display = 'none'), 500);
			}, 5000);
		}
		window.history.replaceState({}, document.title, window.location.href.split('?')[0]);
	}

	// 2. Clipboard Copy Logic
	document.querySelectorAll('.wallet-address').forEach(function (td) {
		td.onclick = function () {
			navigator.clipboard.writeText(td.textContent.trim());

			const toast = document.getElementById('successToast');
			const title = document.getElementById('toastTitle');
			const desc = document.getElementById('toastDesc');
			const icon = document.getElementById('toastIcon');

			if (toast && title && desc && icon) {
				title.textContent = 'Copied!';
				desc.textContent = 'Wallet address copied to clipboard.';
				icon.className = 'fas fa-copy mr-3 text-xl';

				toast.style.display = 'flex';
				setTimeout(() => toast.classList.remove('translate-x-[150%]'), 50);
				setTimeout(() => {
					toast.classList.add('translate-x-[150%]');
					setTimeout(() => {
						toast.style.display = 'none';
						// Reset toast back to its original Form submit state for later use
						title.textContent = 'Success!';
						desc.textContent = 'Your form has been successfully sent.';
						icon.className = 'fas fa-check-circle mr-3 text-xl';
					}, 500);
				}, 3000);
			}
		};
	});

	// 3. Collapsible Crypto Table Logic
	const toggleCryptoBtn = document.getElementById('toggleCryptoBtn');
	const cryptoContainer = document.getElementById('cryptoContainer');
	const cryptoChevron = document.getElementById('cryptoChevron');

	if (toggleCryptoBtn && cryptoContainer && cryptoChevron) {
		toggleCryptoBtn.addEventListener('click', () => {
			cryptoContainer.classList.toggle('hidden');
			if (cryptoContainer.classList.contains('hidden')) {
				cryptoChevron.classList.remove('rotate-180');
			} else {
				cryptoChevron.classList.add('rotate-180');
			}
		});
	}
});

// 4. Matrix Background Effect (Self-executing, runs safely on its own)
(function (c) {
	document.body.appendChild(c).style.cssText = 'position:fixed;top:0;left:0;z-index:-1';
	c.width = window.innerWidth;
	c.height = window.innerHeight;
	(function (ctx, drops) {
		setInterval(() => {
			ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
			ctx.fillRect(0, 0, c.width, c.height);
			ctx.fillStyle = '#f00';
			drops.forEach((y, i) => {
				ctx.fillText(String.fromCharCode(33 + Math.random() * 94), i * 15, y * 15);
				drops[i] = y * 15 > c.height && Math.random() > 0.95 ? 0 : y + 1;
			});
		}, 50);
	})(c.getContext('2d'), Array(Math.floor(c.width / 15)).fill(1));
})(document.createElement('canvas'));
