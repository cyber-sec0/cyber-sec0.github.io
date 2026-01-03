document.addEventListener('DOMContentLoaded', () => {
	// --- WEBSITE MONITOR LOGIC ---

	const storage = window.gm_storage; // Bridge to Tampermonkey
	if (!storage) {
		console.warn('Tampermonkey storage bridge not found. Make sure the Userscript is running.');
		return;
	}

	// DOM Elements
	const els = {
		hours: document.getElementById('checkIntervalHoursInput'),
		minutes: document.getElementById('checkIntervalMinutesInput'),
		saveGlobal: document.getElementById('saveSettingsBtn'),
		toggleForm: document.getElementById('toggleFormBtn'),
		form: document.getElementById('formContainer'),
		formTitle: document.getElementById('formTitle'),
		inputs: {
			name: document.getElementById('nameInput'),
			url: document.getElementById('urlInput'),
			website: document.getElementById('websiteInput'),
			method: document.getElementById('comparisonMethodInput'),
			selector: document.getElementById('selectorInput'),
			idAttr: document.getElementById('idAttributeInput'),
			notification: document.getElementById('notificationCheckbox'), // New Checkbox
			tokenEnabled: document.getElementById('tokenEnabledCheckbox'),
			tokenUrl: document.getElementById('tokenUrlInput'),
			tokenSelector: document.getElementById('tokenSelectorInput'),
			tokenRegEx: document.getElementById('tokenRegExInput'),
			tokenAttr: document.getElementById('tokenAttributeInput'),
			tokenPlaceholder: document.getElementById('tokenPlaceholderInput'),
			headers: document.getElementById('headersInput'),
			body: document.getElementById('bodyInput'),
		},
		listFields: document.getElementById('listFields'),
		tokenFields: document.getElementById('tokenFields'),
		addBtn: document.getElementById('addBtn'),
		list: document.getElementById('sitesList'),
		pausedList: document.getElementById('pausedSitesList'),
	};

	let editingKey = null;

	// Load Global Settings
	const loadGlobalSettings = () => {
		const ms = storage.getValue('check_interval_ms', 3600000); // Default 1 hour
		const totalMinutes = Math.floor(ms / 60000);
		els.hours.value = Math.floor(totalMinutes / 60);
		els.minutes.value = totalMinutes % 60;
	};

	// Save Global Settings
	els.saveGlobal.addEventListener('click', () => {
		const ms = ((parseInt(els.hours.value) || 0) * 60 + (parseInt(els.minutes.value) || 0)) * 60000;
		if (ms < 60000) return alert('Minimum interval is 1 minute.');
		storage.setValue('check_interval_ms', ms);
		alert('Settings Saved!');
	});

	// Toggle Form Visibility
	els.toggleForm.addEventListener('click', () => {
		els.form.classList.toggle('hidden');
		resetForm();
	});

	// Toggle List/Token Fields based on selection
	els.inputs.method.addEventListener('change', () => {
		els.listFields.classList.toggle('hidden', els.inputs.method.value === 'text');
	});
	els.inputs.tokenEnabled.addEventListener('change', () => {
		els.tokenFields.classList.toggle('hidden', !els.inputs.tokenEnabled.checked);
	});

	// Reset Form
	const resetForm = () => {
		editingKey = null;
		els.formTitle.textContent = 'Add New Site or Endpoint';
		els.addBtn.textContent = 'Add Site';
		Object.values(els.inputs).forEach((el) => {
			if (el.type === 'checkbox') el.checked = false;
			else el.value = '';
		});
		els.inputs.method.value = 'text';
		els.listFields.classList.add('hidden');
		els.tokenFields.classList.add('hidden');
	};

	// Save/Add Site
	els.addBtn.addEventListener('click', () => {
		const name = els.inputs.name.value.trim();
		const url = els.inputs.url.value.trim();
		if (!name || !url) return alert('Name and URL are required.');

		let headers = {},
			body = '';
		try {
			if (els.inputs.headers.value.trim()) headers = JSON.parse(els.inputs.headers.value);
		} catch (e) {
			return alert('Invalid JSON in Headers');
		}
		body = els.inputs.body.value.trim();

		const data = {
			name,
			content: editingKey ? storage.getValue(editingKey, {}).content || '' : '', // Preserve existing content
			header: headers,
			body: body,
			lastChecked: editingKey ? storage.getValue(editingKey, {}).lastChecked || 0 : 0,
			website: els.inputs.website.value.trim(),
			comparisonMethod: els.inputs.method.value,
			selector: els.inputs.selector.value.trim(),
			idAttribute: els.inputs.idAttr.value.trim(),
			notification: els.inputs.notification.checked, // Save Notification Setting
			tokenEnabled: els.inputs.tokenEnabled.checked,
			tokenUrl: els.inputs.tokenUrl.value.trim(),
			tokenSelector: els.inputs.tokenSelector.value.trim(),
			tokenAttribute: els.inputs.tokenAttr.value.trim(),
			tokenRegEx: els.inputs.tokenRegEx.value.trim(),
			tokenPlaceholder: els.inputs.tokenPlaceholder.value.trim(),
			isPaused: editingKey ? storage.getValue(editingKey, {}).isPaused || false : false,
		};

		const key = editingKey || `Counter${Date.now()}${url}`;
		storage.setValue(key, data);
		resetForm();
		els.form.classList.add('hidden');
		renderSites();
	});

	// Render List
	const renderSites = () => {
		els.list.innerHTML = '';
		els.pausedList.innerHTML = '';
		const keys = storage.listValues();

		keys.forEach((key) => {
			if (/^check_interval_ms$|^lock_/.test(key)) return;
			const data = storage.getValue(key, {});
			const li = document.createElement('li');
			li.innerHTML = `
                <div class="site-info">
                    <strong>${data.name}</strong>
                    <div class="actions">
                        <button class="edit">Edit</button>
                        <button class="pause">${data.isPaused ? 'Resume' : 'Pause'}</button>
                        <button class="delete">Delete</button>
                    </div>
                </div>
            `;

			// Edit
			li.querySelector('.edit').addEventListener('click', () => {
				editingKey = key;
				els.formTitle.textContent = 'Edit Site';
				els.addBtn.textContent = 'Save Changes';
				els.form.classList.remove('hidden');
				window.scrollTo({ top: 0, behavior: 'smooth' });

				els.inputs.name.value = data.name || '';
				els.inputs.url.value = key.replace(/Counter\d+/, '');
				els.inputs.website.value = data.website || '';
				els.inputs.method.value = data.comparisonMethod || 'text';
				els.inputs.selector.value = data.selector || '';
				els.inputs.idAttr.value = data.idAttribute || '';
				els.inputs.notification.checked = data.notification || false; // Load Notification Setting

				els.inputs.tokenEnabled.checked = data.tokenEnabled || false;
				els.inputs.tokenUrl.value = data.tokenUrl || '';
				els.inputs.tokenSelector.value = data.tokenSelector || '';
				els.inputs.tokenRegEx.value = data.tokenRegEx || '';
				els.inputs.tokenAttr.value = data.tokenAttribute || '';
				els.inputs.tokenPlaceholder.value = data.tokenPlaceholder || '';

				els.inputs.headers.value = JSON.stringify(data.header || {}, null, 2);
				els.inputs.body.value = data.body || '';

				// Trigger change events to show/hide fields
				els.inputs.method.dispatchEvent(new Event('change'));
				els.inputs.tokenEnabled.dispatchEvent(new Event('change'));
			});

			// Pause/Resume
			li.querySelector('.pause').addEventListener('click', () => {
				data.isPaused = !data.isPaused;
				storage.setValue(key, data);
				renderSites();
			});

			// Delete
			li.querySelector('.delete').addEventListener('click', () => {
				if (confirm(`Delete ${data.name}?`)) {
					storage.deleteValue(key);
					renderSites();
				}
			});

			if (data.isPaused) els.pausedList.appendChild(li);
			else els.list.appendChild(li);
		});
	};

	// Init
	loadGlobalSettings();
	renderSites();
});

// --- WALLET ADDRESS COPY LOGIC (Original Code) ---
document.querySelectorAll('.wallet-address').forEach(function (element) {
	// Loop through each wallet Addresses element
	element.onclick = function () {
		navigator.clipboard.writeText(element.textContent);

		const copyMessage = document.querySelector('#copyMessage'); // Get the next sibling which is the copy message

		copyMessage.style.display = 'block'; // Show copied message
		// Fixed positioning logic slightly for safety
		const topPos = this.getBoundingClientRect().top - document.body.getBoundingClientRect().top - copyMessage.offsetHeight + 52;
		copyMessage.style.top = topPos + 'px';
		copyMessage.style.left = '22%';

		setTimeout(function () {
			if (document.getElementById('copyMessage')) {
				document.getElementById('copyMessage').style.display = 'none';
			}
		}, 1000); // Hide message after 1 second
	};
});
