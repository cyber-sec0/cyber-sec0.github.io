let editingKey = null; //Currently editing entry key

//Storage interface - communicates with Tampermonkey script
const storage = {
	getValue: (key, defaultValue) => {
		return new Promise((resolve) => {
			const messageId = Date.now() + Math.random();
			const handler = (event) => {
				if (event.data.type === 'storage_response' && event.data.messageId === messageId) {
					window.removeEventListener('message', handler);
					resolve(event.data.value !== undefined ? event.data.value : defaultValue);
				}
			};
			window.addEventListener('message', handler);
			window.postMessage({ type: 'storage_get', key, messageId }, '*');
		});
	},
	setValue: (key, value) => {
		return new Promise((resolve) => {
			const messageId = Date.now() + Math.random();
			const handler = (event) => {
				if (event.data.type === 'storage_response' && event.data.messageId === messageId) {
					window.removeEventListener('message', handler);
					resolve();
				}
			};
			window.addEventListener('message', handler);
			window.postMessage({ type: 'storage_set', key, value, messageId }, '*');
		});
	},
	deleteValue: (key) => {
		return new Promise((resolve) => {
			const messageId = Date.now() + Math.random();
			const handler = (event) => {
				if (event.data.type === 'storage_response' && event.data.messageId === messageId) {
					window.removeEventListener('message', handler);
					resolve();
				}
			};
			window.addEventListener('message', handler);
			window.postMessage({ type: 'storage_delete', key, messageId }, '*');
		});
	},
	listValues: () => {
		return new Promise((resolve) => {
			const messageId = Date.now() + Math.random();
			const handler = (event) => {
				if (event.data.type === 'storage_response' && event.data.messageId === messageId) {
					window.removeEventListener('message', handler);
					resolve(event.data.value || []);
				}
			};
			window.addEventListener('message', handler);
			window.postMessage({ type: 'storage_list', messageId }, '*');
		});
	},
};

//Initialize the page
document.addEventListener('DOMContentLoaded', async () => {
	const scriptWarning = document.getElementById('scriptWarning');
	if (scriptWarning) {
		//Check if element exists before trying to access its classList
		scriptWarning.classList.remove('hidden');
	}
	await loadGlobalSettings();
	await loadEntries();
	setupEventListeners();
});

//Load global settings
const loadGlobalSettings = async () => {
	const intervalMs = await storage.getValue('check_interval_ms', 60000);
	const hours = Math.floor(intervalMs / 3600000);
	const minutes = Math.floor((intervalMs % 3600000) / 60000);
	document.getElementById('checkIntervalHoursInput').value = hours;
	document.getElementById('checkIntervalMinutesInput').value = minutes;
};

//Save global settings
const saveGlobalSettings = async () => {
	const hours = parseInt(document.getElementById('checkIntervalHoursInput').value) || 0;
	const minutes = parseInt(document.getElementById('checkIntervalMinutesInput').value) || 0;
	const totalMs = hours * 3600000 + minutes * 60000;
	if (totalMs < 60000) {
		alert('Minimum interval is 1 minute.');
		return;
	}
	await storage.setValue('check_interval_ms', totalMs);
	alert('Global settings saved!');
};

//Setup event listeners
const setupEventListeners = () => {
	document.getElementById('saveSettingsBtn').addEventListener('click', saveGlobalSettings);
	document.getElementById('toggleFormBtn').addEventListener('click', toggleForm);
	document.getElementById('comparisonMethodInput').addEventListener('change', toggleListFields);
	document.getElementById('tokenEnabledCheckbox').addEventListener('change', toggleTokenFields);
	document.getElementById('addBtn').addEventListener('click', addEntry);
	document.getElementById('updateBtn').addEventListener('click', updateEntry);
	document.getElementById('cancelBtn').addEventListener('click', cancelEdit);
};

//Toggle form visibility
const toggleForm = () => {
	const formContainer = document.getElementById('formContainer');
	const toggleBtn = document.getElementById('toggleFormBtn');
	if (formContainer.classList.contains('hidden')) {
		formContainer.classList.remove('hidden');
		toggleBtn.textContent = '−';
		resetForm();
	} else {
		formContainer.classList.add('hidden');
		toggleBtn.textContent = '+';
		cancelEdit();
	}
};

//Toggle list fields based on comparison method
const toggleListFields = () => {
	const method = document.getElementById('comparisonMethodInput').value;
	const listFields = document.getElementById('listFields');
	if (method === 'order' || method === 'new_items') {
		listFields.classList.remove('hidden');
	} else {
		listFields.classList.add('hidden');
	}
};

//Toggle token fields
const toggleTokenFields = () => {
	const enabled = document.getElementById('tokenEnabledCheckbox').checked;
	const tokenFields = document.getElementById('tokenFields');
	if (enabled) {
		tokenFields.classList.remove('hidden');
	} else {
		tokenFields.classList.add('hidden');
	}
};

//Reset form to default state
const resetForm = () => {
	document.getElementById('formTitle').textContent = 'Add New Site or Endpoint';
	document.getElementById('nameInput').value = '';
	document.getElementById('urlInput').value = '';
	document.getElementById('websiteInput').value = '';
	document.getElementById('comparisonMethodInput').value = 'text';
	document.getElementById('selectorInput').value = '';
	document.getElementById('idAttributeInput').value = '';
	document.getElementById('tokenEnabledCheckbox').checked = false;
	document.getElementById('tokenUrlInput').value = '';
	document.getElementById('tokenSelectorInput').value = '';
	document.getElementById('tokenAttributeInput').value = '';
	document.getElementById('tokenRegExInput').value = '';
	document.getElementById('tokenPlaceholderInput').value = '';
	document.getElementById('advancedSelectorInput').value = '';
	document.getElementById('headerInput').value = '';
	document.getElementById('bodyInput').value = '';
	document.getElementById('addBtn').classList.remove('hidden');
	document.getElementById('updateBtn').classList.add('hidden');
	document.getElementById('cancelBtn').classList.add('hidden');
	toggleListFields();
	toggleTokenFields();
	editingKey = null;
};

//Add new entry
const addEntry = async () => {
	const data = getFormData();
	if (!data) return;

	const counter = await storage.getValue('Number', 0);
	const newCounter = counter + 1;
	const key = data.url + 'Counter' + newCounter;

	await storage.setValue('Number', newCounter);
	await storage.setValue(key, data);

	alert('Entry added successfully!');
	resetForm();
	await loadEntries();
};

//Update existing entry
const updateEntry = async () => {
	if (!editingKey) return;

	const data = getFormData();
	if (!data) return;

	await storage.setValue(editingKey, data);
	alert('Entry updated successfully!');
	resetForm();
	await loadEntries();
};

//Cancel edit mode
const cancelEdit = () => {
	resetForm();
	editingKey = null;
};

//Get form data
const getFormData = () => {
	const name = document.getElementById('nameInput').value.trim();
	const url = document.getElementById('urlInput').value.trim();

	if (!name || !url) {
		alert('Name and URL are required.');
		return null;
	}

	const data = {
		name,
		url,
		website: document.getElementById('websiteInput').value.trim(),
		comparisonMethod: document.getElementById('comparisonMethodInput').value,
		selector: document.getElementById('advancedSelectorInput').value.trim(),
		tokenEnabled: document.getElementById('tokenEnabledCheckbox').checked,
		lastChecked: 0,
		content: '',
		isPaused: false,
	};

	//List-specific fields
	if (data.comparisonMethod === 'order' || data.comparisonMethod === 'new_items') {
		data.selector = document.getElementById('selectorInput').value.trim();
		data.idAttribute = document.getElementById('idAttributeInput').value.trim();
		if (!data.selector || !data.idAttribute) {
			alert('CSS Selector and ID Attribute are required for list-based comparisons.');
			return null;
		}
	}

	//Token fields
	if (data.tokenEnabled) {
		data.tokenUrl = document.getElementById('tokenUrlInput').value.trim();
		data.tokenSelector = document.getElementById('tokenSelectorInput').value.trim();
		data.tokenAttribute = document.getElementById('tokenAttributeInput').value.trim();
		data.tokenRegEx = document.getElementById('tokenRegExInput').value.trim();
		data.tokenPlaceholder = document.getElementById('tokenPlaceholderInput').value.trim();

		if (!data.tokenUrl || !data.tokenSelector || !data.tokenPlaceholder) {
			alert('Token URL, CSS Selector, and Placeholder are required when token fetching is enabled.');
			return null;
		}
	}

	//Advanced fields
	const headerText = document.getElementById('headerInput').value.trim();
	if (headerText) {
		try {
			data.header = JSON.parse(headerText);
		} catch (e) {
			alert('Invalid JSON in Custom Headers field.');
			return null;
		}
	}

	data.body = document.getElementById('bodyInput').value.trim();

	return data;
};

//Load and display entries
const loadEntries = async () => {
	const keys = await storage.listValues();
	const entryList = document.getElementById('entryList');
	entryList.innerHTML = '';

	for (const key of keys) {
		if (/^Number$|^I_am_a_Dev$|^check_interval_ms$|^lock_/.test(key)) continue;

		const data = await storage.getValue(key, {});
		if (!data.name) continue;

		const li = document.createElement('li');
		li.innerHTML = `
            <div class="entry-details">
                <strong>${escapeHtml(data.name)}</strong>
                <small><span class="detail-label">URL:</span> ${escapeHtml(data.url || key.replace(/Counter\d+/, ''))}</small>
                ${data.website ? `<small><span class="detail-label">Opens:</span> ${escapeHtml(data.website)}</small>` : ''}
                <small><span class="detail-label">Method:</span> ${escapeHtml(data.comparisonMethod || 'text')}</small>
                ${data.selector ? `<small><span class="detail-label">Selector:</span> ${escapeHtml(data.selector)}</small>` : ''}
                ${data.isPaused ? '<small style="color: #ff9800;">⏸️ PAUSED</small>' : ''}
                ${data.lastChecked ? `<small><span class="detail-label">Last Check:</span> ${new Date(data.lastChecked).toLocaleString()}</small>` : ''}
            </div>
            <div class="entry-actions">
                <button class="action-btn" onclick="editEntry('${key}')" title="Edit">✏️</button>
                <button class="action-btn" onclick="togglePause('${key}')" title="${data.isPaused ? 'Resume' : 'Pause'}">${data.isPaused ? '▶️' : '⏸️'}</button>
                <button class="action-btn" onclick="deleteEntry('${key}')" title="Delete">🗑️</button>
            </div>
        `;
		entryList.appendChild(li);
	}
};

//Edit entry
window.editEntry = async (key) => {
	const data = await storage.getValue(key, {});
	if (!data.name) return;

	editingKey = key;
	document.getElementById('formTitle').textContent = 'Edit Entry';
	document.getElementById('nameInput').value = data.name || '';
	document.getElementById('urlInput').value = data.url || key.replace(/Counter\d+/, '');
	document.getElementById('websiteInput').value = data.website || '';
	document.getElementById('comparisonMethodInput').value = data.comparisonMethod || 'text';
	document.getElementById('selectorInput').value = data.comparisonMethod === 'order' || data.comparisonMethod === 'new_items' ? data.selector || '' : '';
	document.getElementById('idAttributeInput').value = data.idAttribute || '';
	document.getElementById('tokenEnabledCheckbox').checked = data.tokenEnabled || false;
	document.getElementById('tokenUrlInput').value = data.tokenUrl || '';
	document.getElementById('tokenSelectorInput').value = data.tokenSelector || '';
	document.getElementById('tokenAttributeInput').value = data.tokenAttribute || '';
	document.getElementById('tokenRegExInput').value = data.tokenRegEx || '';
	document.getElementById('tokenPlaceholderInput').value = data.tokenPlaceholder || '';
	document.getElementById('advancedSelectorInput').value = data.comparisonMethod === 'text' ? data.selector || '' : '';
	document.getElementById('headerInput').value = data.header ? JSON.stringify(data.header, null, 2) : '';
	document.getElementById('bodyInput').value = data.body || '';

	document.getElementById('addBtn').classList.add('hidden');
	document.getElementById('updateBtn').classList.remove('hidden');
	document.getElementById('cancelBtn').classList.remove('hidden');
	document.getElementById('formContainer').classList.remove('hidden');
	document.getElementById('toggleFormBtn').textContent = '−';

	toggleListFields();
	toggleTokenFields();
};

//Toggle pause state
window.togglePause = async (key) => {
	const data = await storage.getValue(key, {});
	data.isPaused = !data.isPaused;
	await storage.setValue(key, data);
	await loadEntries();
};

//Delete entry
window.deleteEntry = async (key) => {
	if (confirm('Are you sure you want to delete this entry?')) {
		await storage.deleteValue(key);
		await loadEntries();
	}
};

//Escape HTML for safe display
const escapeHtml = (text) => {
	const div = document.createElement('div');
	div.textContent = text;
	return div.innerHTML;
};
