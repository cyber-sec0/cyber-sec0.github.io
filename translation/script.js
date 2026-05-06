document.addEventListener('DOMContentLoaded', () => {
	// 1. Success Toast Logic
	document.getElementById('nextUrl').value = window.location.href.split('?')[0] + '?success=true';

	if (new URLSearchParams(window.location.search).get('success') === 'true') {
		const toast = document.getElementById('successToast');
		toast.style.display = 'flex';
		setTimeout(() => toast.classList.remove('translate-x-[150%]'), 50);
		setTimeout(() => {
			toast.classList.add('translate-x-[150%]');
			setTimeout(() => (toast.style.display = 'none'), 500);
		}, 5000);
		window.history.replaceState({}, document.title, window.location.href.split('?')[0]);
	}

	// 2. Wallet Copy Logic
	document.querySelectorAll('.wallet-address').forEach((td) => {
		td.addEventListener('click', () => {
			navigator.clipboard.writeText(td.textContent.trim());

			const toast = document.getElementById('successToast');
			const title = document.getElementById('toastTitle');
			const desc = document.getElementById('toastDesc');
			const icon = document.getElementById('toastIcon');

			title.textContent = 'Copied!';
			desc.textContent = 'Wallet address copied to clipboard.';
			icon.className = 'fas fa-copy mr-3 text-xl';

			toast.style.display = 'flex';
			setTimeout(() => toast.classList.remove('translate-x-[150%]'), 50);
			setTimeout(() => {
				toast.classList.add('translate-x-[150%]');
				setTimeout(() => {
					toast.style.display = 'none';
					title.textContent = 'Success!';
					desc.textContent = 'Your email has been successfully sent.';
					icon.className = 'fas fa-check-circle mr-3 text-xl';
				}, 500);
			}, 3000);
		});
	});

	// 3. Language Dropdown Logic
	const targetLanguageInput = document.getElementById('targetLanguage');
	const languageDropdown = document.getElementById('language-dropdown');

	if (targetLanguageInput && languageDropdown) {
		targetLanguageInput.addEventListener('focus', () => languageDropdown.classList.remove('hidden'));

		document.addEventListener('click', (e) => {
			if (!targetLanguageInput.contains(e.target) && !languageDropdown.contains(e.target)) {
				languageDropdown.classList.add('hidden');
			}
		});

		document.querySelectorAll('#language-dropdown li').forEach((i) => {
			i.addEventListener('click', () => {
				targetLanguageInput.value = i.getAttribute('data-value');
				languageDropdown.classList.add('hidden');
			});
		});
	}

	// 4. Crypto Container Toggle Logic
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

	// 5. Tab Switching Logic
	const tabRequest = document.getElementById('tabRequest');
	const tabQuestion = document.getElementById('tabQuestion');
	const formTitle = document.getElementById('formTitle');
	const formSubject = document.getElementById('formSubject');
	const messageLabel = document.getElementById('messageLabel');
	const messageInput = document.getElementById('message');
	const messageIcon = document.getElementById('messageIcon');
	const submitBtn = document.getElementById('submitBtn');
	const hideableFields = document.querySelectorAll('.hideable-field');

	if (tabRequest && tabQuestion) {
		tabRequest.addEventListener('click', () => {
			tabRequest.className = 'px-4 py-2 text-sm font-bold rounded-md bg-blue-600 text-white shadow transition-all';
			tabQuestion.className = 'px-4 py-2 text-sm font-medium rounded-md text-gray-400 hover:text-white hover:bg-gray-700 transition-all';

			formTitle.innerHTML = '<i class="fas fa-paper-plane mr-2 text-purple-400"></i>Send Your Request';
			formSubject.value = 'New Translation Request';
			submitBtn.textContent = 'Submit Request';

			messageLabel.textContent = 'Additional Notes';
			messageInput.placeholder = 'Specific instructions, formatting requests, etc...';
			messageInput.setAttribute('required', 'true');
			messageIcon.className = 'fas fa-sticky-note';

			hideableFields.forEach((f) => {
				f.classList.remove('hidden');
				const inputs = f.querySelectorAll('input');
				inputs.forEach((i) => i.setAttribute('required', 'true'));
			});
		});

		tabQuestion.addEventListener('click', () => {
			tabQuestion.className = 'px-4 py-2 text-sm font-bold rounded-md bg-blue-600 text-white shadow transition-all';
			tabRequest.className = 'px-4 py-2 text-sm font-medium rounded-md text-gray-400 hover:text-white hover:bg-gray-700 transition-all';

			formTitle.innerHTML = '<i class="fas fa-question-circle mr-2 text-blue-400"></i>Ask a Question';
			formSubject.value = 'New Translation Question';
			submitBtn.textContent = 'Send Question';

			messageLabel.textContent = 'Write your Question(s)';
			messageInput.placeholder = 'How does the translation process work?';
			messageInput.setAttribute('required', 'true');
			messageIcon.className = 'fas fa-comment-dots';

			hideableFields.forEach((f) => {
				f.classList.add('hidden');
				const inputs = f.querySelectorAll('input');
				inputs.forEach((i) => i.removeAttribute('required'));
			});
		});
	}
});
