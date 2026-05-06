document.querySelectorAll('.wallet-address').forEach(function (element) {
	element.onclick = function () {
		navigator.clipboard.writeText(element.textContent); //Loop through each wallet Addresses element

		document.querySelector('#copyMessage').style.display = 'block'; //Show copied message
		document.querySelector('#copyMessage').style.top = this.getBoundingClientRect().top - document.body.getBoundingClientRect().top - document.querySelector('#copyMessage').offsetHeight + 52 + 'px'; //Get the next sibling which is the copy message
		document.querySelector('#copyMessage').style.left = '39%';

		setTimeout(function () {
			document.getElementById('copyMessage').style.display = 'none'; //Hide message after 1 second
		}, 1000);
	};
});

document.addEventListener('DOMContentLoaded', () => {
	// 1. Collapsible Crypto Toggle
	const toggleCryptoBtn = document.getElementById('toggleCryptoBtn');
	const cryptoContainer = document.getElementById('cryptoContainer');
	const cryptoChevron = document.getElementById('cryptoChevron');

	if (toggleCryptoBtn) {
		toggleCryptoBtn.addEventListener('click', () => {
			cryptoContainer.classList.toggle('hidden');
			if (cryptoContainer.classList.contains('hidden')) {
				cryptoChevron.classList.remove('rotate-180');
			} else {
				cryptoChevron.classList.add('rotate-180');
			}
		});
	}

	// 2. Form Submit Success Notification Logic (for the Ask a Question form)
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
});

// Matrix Background Effect
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
