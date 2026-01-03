const checkIntervalHoursInput = document.getElementById('checkIntervalHoursInput');
const checkIntervalMinutesInput = document.getElementById('checkIntervalMinutesInput');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');
const formContainer = document.getElementById('formContainer');
const formTitle = document.getElementById('formTitle');
const toggleFormBtn = document.getElementById('toggleFormBtn');
const nameInput = document.getElementById('nameInput');
const urlInput = document.getElementById('urlInput');
const websiteInput = document.getElementById('websiteInput');
const comparisonMethodInput = document.getElementById('comparisonMethodInput');
const listFields = document.getElementById('listFields');
const selectorInput = document.getElementById('selectorInput');
const idAttributeInput = document.getElementById('idAttributeInput');
const headersInput = document.getElementById('headersInput');
const bodyInput = document.getElementById('bodyInput');
const addBtn = document.getElementById('addBtn');
const sitesList = document.getElementById('sitesList');
const pausedSitesList = document.getElementById('pausedSitesList');
const notificationTypeInput = document.getElementById('notificationTypeInput');
const tokenEnabledCheckbox = document.getElementById('tokenEnabledCheckbox');
const tokenFields = document.getElementById('tokenFields');
const tokenUrlInput = document.getElementById('tokenUrlInput');
const tokenSelectorInput = document.getElementById('tokenSelectorInput');
const tokenAttributeInput = document.getElementById('tokenAttributeInput');
const tokenRegExInput = document.getElementById('tokenRegExInput');
const tokenPlaceholderInput = document.getElementById('tokenPlaceholderInput');

let currentlyEditingKey = null;

saveSettingsBtn.addEventListener('click', () => {
	const hours = parseInt(checkIntervalHoursInput.value, 10) || 0;
	const minutes = parseInt(checkIntervalMinutesInput.value, 10) || 0;
	const totalMs = hours * 3600000 + minutes * 60000;
	if (totalMs >= 60000) {
		window.gm_storage.setValue('check_interval_ms', totalMs);
		alert(`Check interval saved to ${hours} hour(s) and ${minutes} minute(s).`);
	} else {
		alert('Please enter a total interval of at least 1 minute.');
	}
});

const showForm = () => {
	formContainer.classList.remove('hidden');
	toggleFormBtn.textContent = '-';
	toggleFormBtn.title = 'Hide form';
};
const hideForm = () => {
	formContainer.classList.add('hidden');
	toggleFormBtn.textContent = '+';
	toggleFormBtn.title = 'Add new site';
};

toggleFormBtn.addEventListener('click', () => {
	if (formContainer.classList.contains('hidden')) {
		resetForm();
		showForm();
	} else {
		hideForm();
		resetForm();
	}
});

comparisonMethodInput.addEventListener('change', () => {
	listFields.classList.toggle('hidden', !['order', 'new_items'].includes(comparisonMethodInput.value));
});

tokenEnabledCheckbox.addEventListener('change', () => {
	tokenFields.classList.toggle('hidden', !tokenEnabledCheckbox.checked);
});

const resetForm = () => {
	formTitle.textContent = 'Add New Site or Endpoint';
	[nameInput, urlInput, websiteInput, selectorInput, idAttributeInput, headersInput, bodyInput, tokenUrlInput, tokenSelectorInput, tokenAttributeInput, tokenRegExInput, tokenPlaceholderInput].forEach((el) => (el.value = ''));
	comparisonMethodInput.value = 'text';
	tokenEnabledCheckbox.checked = false;
	notificationTypeInput.value = ''; // Reset notification dropdown
	urlInput.readOnly = false;
	addBtn.textContent = 'Add Site';
	currentlyEditingKey = null;
	listFields.classList.add('hidden');
	tokenFields.classList.add('hidden');
	document.getElementById('cancelBtn')?.remove();
};

addBtn.addEventListener('click', () => {
	const name = nameInput.value.trim();
	const url = urlInput.value.trim();
	const website = websiteInput.value.trim();
	const comparisonMethod = comparisonMethodInput.value;
	const selector = selectorInput.value.trim();
	const idAttribute = idAttributeInput.value.trim();
	const tokenEnabled = tokenEnabledCheckbox.checked;
	const tokenUrl = tokenUrlInput.value.trim();
	const tokenSelector = tokenSelectorInput.value.trim();
	const tokenAttribute = tokenAttributeInput.value.trim();
	const tokenRegEx = tokenRegExInput.value.trim();
	const tokenPlaceholder = tokenPlaceholderInput.value.trim();
	const notifType = notificationTypeInput.value;

	if (!name || !url) {
		alert('Name and Endpoint URL cannot be empty.');
		return;
	}
	if (['order', 'new_items'].includes(comparisonMethod) && (!selector || !idAttribute)) {
		alert('Selector and ID Attribute are required for this comparison method.');
		return;
	}
	if (tokenEnabled && (!tokenUrl || !tokenSelector || !tokenPlaceholder)) {
		alert('Token Fetch URL, Selector, and Placeholder are required for Dynamic Token Fetching.');
		return;
	}

	let headers = {};
	if (headersInput.value.trim()) {
		try {
			headers = JSON.parse(headersInput.value.trim());
		} catch (e) {
			alert('Invalid JSON headers!');
			return;
		}
	}
	const body = bodyInput.value.trim();

	const data = {
		name,
		website,
		comparisonMethod,
		selector,
		idAttribute,
		header: headers,
		body,
		tokenEnabled,
		tokenUrl,
		tokenSelector,
		tokenAttribute,
		tokenRegEx,
		tokenPlaceholder,
		notification: !!notifType, // True if 'show' or 'copy' is selected
		notificationType: notifType, // 'show', 'copy', or ''
	};

	if (currentlyEditingKey) {
		//EDIT MODE
		const currentData = window.gm_storage.getValue(currentlyEditingKey, {});
		window.gm_storage.setValue(currentlyEditingKey, { ...currentData, ...data });
		alert(`"${name}" has been updated!`);
	} else {
		//ADD MODE
		const counter = window.gm_storage.getValue('Number', 0) + 1;
		const key = `Counter${counter}${url}`;
		window.gm_storage.setValue(key, { ...data, isPaused: false, content: '', lastChecked: 0 });
		window.gm_storage.setValue('Number', counter);
	}
	hideForm();
	resetForm();
	loadSites();
});

const loadSites = () => {
	sitesList.innerHTML = '';
	pausedSitesList.innerHTML = '';
	document.getElementById('pausedSection').style.display = 'none';
	let pausedCount = 0;

	window.gm_storage.listValues().forEach((key) => {
		if (/^Number$|^check_interval_ms$|^lock_/.test(key)) {
			return;
		}
		const storedData = window.gm_storage.getValue(key, {});
		const url = key.replace(/Counter\d+/, '');
		const li = document.createElement('li');
		const isPaused = storedData.isPaused || false;
		li.style.opacity = isPaused ? '0.5' : '1';

		let detailsHtml = `<strong>${storedData.name || url}</strong><small><span class="detail-label">Endpoint:</span> ${url}</small>`;
		if (storedData.website && storedData.website !== url) {
			detailsHtml += `<small><span class="detail-label">Opens:</span> ${storedData.website}</small>`;
		}
		if (storedData.comparisonMethod) {
			detailsHtml += `<small><span class="detail-label">Method:</span> ${storedData.comparisonMethod.replace(/_/g, ' ')}</small>`;
		}
		if (storedData.tokenEnabled) {
			detailsHtml += `<small><span class="detail-label">Token:</span> Enabled</small>`;
		}
		if (storedData.notification) {
			const typeLabel = storedData.notificationType === 'copy' ? 'Copy' : 'Show';
			detailsHtml += `<small><span class="detail-label">Notify:</span> ${typeLabel}</small>`;
		}

		li.innerHTML = `<div class="entry-details">${detailsHtml}</div>
                              <div class="entry-actions">
                                  <button class="action-btn pause-btn" title="${isPaused ? 'Resume' : 'Pause'}">${isPaused ? '▶️' : '⏸️'}</button>
                                  <button class="action-btn edit-btn" title="Edit">✏️</button>
                                  <button class="action-btn delete-btn" title="Delete">❌</button>
                              </div>`;

		li.querySelector('.pause-btn').addEventListener('click', () => {
			const currentData = window.gm_storage.getValue(key, {});
			currentData.isPaused = !currentData.isPaused;
			window.gm_storage.setValue(key, currentData);
			loadSites();
		});
		li.querySelector('.delete-btn').addEventListener('click', () => {
			if (confirm(`Stop monitoring "${storedData.name || url}"?`)) {
				window.gm_storage.deleteValue(key);
				loadSites();
			}
		});
		li.querySelector('.edit-btn').addEventListener('click', () => {
			if (currentlyEditingKey && currentlyEditingKey !== key) {
				alert('Please save or cancel the current edit before starting another.');
				return;
			}
			showForm();
			formTitle.textContent = `Editing: ${storedData.name}`;
			nameInput.value = storedData.name || '';
			urlInput.value = url;
			urlInput.readOnly = true;
			websiteInput.value = storedData.website || '';
			comparisonMethodInput.value = storedData.comparisonMethod || 'text';
			listFields.classList.toggle('hidden', !['order', 'new_items'].includes(comparisonMethodInput.value));
			selectorInput.value = storedData.selector || '';
			idAttributeInput.value = storedData.idAttribute || '';

			tokenEnabledCheckbox.checked = storedData.tokenEnabled || false;
			tokenFields.classList.toggle('hidden', !tokenEnabledCheckbox.checked);
			tokenUrlInput.value = storedData.tokenUrl || '';
			tokenSelectorInput.value = storedData.tokenSelector || '';
			tokenAttributeInput.value = storedData.tokenAttribute || '';
			tokenRegExInput.value = storedData.tokenRegEx || '';
			tokenPlaceholderInput.value = storedData.tokenPlaceholder || '';

			if (storedData.notification) {
				notificationTypeInput.value = storedData.notificationType || 'show';
			} else {
				notificationTypeInput.value = '';
			}

			headersInput.value = JSON.stringify(storedData.header || {}, null, 2);
			bodyInput.value = storedData.body || '';
			currentlyEditingKey = key;
			addBtn.textContent = 'Save Changes';
			if (!document.getElementById('cancelBtn')) {
				const cancelBtn = document.createElement('button');
				cancelBtn.id = 'cancelBtn';
				cancelBtn.textContent = 'Cancel';
				document.querySelector('.button-group').appendChild(cancelBtn);
				cancelBtn.addEventListener('click', () => {
					hideForm();
					resetForm();
				});
			}
			window.scrollTo({ top: 0, behavior: 'smooth' });
		});

		if (isPaused) {
			pausedSitesList.appendChild(li);
			pausedCount++;
		} else {
			sitesList.appendChild(li);
		}
	});

	if (pausedCount > 0) {
		document.getElementById('pausedSection').style.display = 'block';
	}
};

//This function waits for the userscript to create the gm_storage object
function waitForStorage() {
	if (window.gm_storage) {
		const totalMs = window.gm_storage.getValue('check_interval_ms', 60000);
		const hours = Math.floor(totalMs / 3600000);
		const minutes = Math.floor((totalMs % 3600000) / 60000);
		checkIntervalHoursInput.value = hours;
		checkIntervalMinutesInput.value = minutes;

		loadSites();
	} else {
		setTimeout(waitForStorage, 100);
	}
}

waitForStorage();
