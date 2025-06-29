document.addEventListener('DOMContentLoaded', () => {
	//Executes when the HTML content is fully loaded.
	'use strict';
	//This script handles the UI and data management for the settings page.

	//A simple key-value store using localStorage.
	const store = {
		//Retrieves a value from localStorage, parsing it from JSON.
		get: (key, defaultValue = null) => JSON.parse(localStorage.getItem(key)) || defaultValue,
		//Saves a value to localStorage, converting it to a JSON string.
		set: (key, value) => localStorage.setItem(key, JSON.stringify(value)),
		//Removes a key from localStorage.
		remove: (key) => localStorage.removeItem(key),
		//Returns an array of all keys stored in localStorage.
		keys: () => Object.keys(localStorage),
	};

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
	const buttonGroup = document.querySelector('.button-group');
	const tokenEnabledCheckbox = document.getElementById('tokenEnabledCheckbox');
	const tokenFields = document.getElementById('tokenFields');
	const tokenUrlInput = document.getElementById('tokenUrlInput');
	const tokenSelectorInput = document.getElementById('tokenSelectorInput');
	const tokenAttributeInput = document.getElementById('tokenAttributeInput');
	const tokenRegExInput = document.getElementById('tokenRegExInput');
	const tokenPlaceholderInput = document.getElementById('tokenPlaceholderInput');

	let currentlyEditingKey = null;

	const loadGlobalSettings = () => {
		//Loads the check interval from storage and updates the input fields.
		const totalMs = store.get('check_interval_ms', 60000);
		checkIntervalHoursInput.value = Math.floor(totalMs / 3600000);
		checkIntervalMinutesInput.value = Math.floor((totalMs % 3600000) / 60000);
	};

	saveSettingsBtn.addEventListener('click', () => {
		//Saves the global check interval settings.
		const hours = parseInt(checkIntervalHoursInput.value, 10) || 0;
		const minutes = parseInt(checkIntervalMinutesInput.value, 10) || 0;
		const totalMs = hours * 3600000 + minutes * 60000;
		if (totalMs >= 60000) {
			store.set('check_interval_ms', totalMs);
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
		//Toggles the visibility of the form.
		if (formContainer.classList.contains('hidden')) {
			resetForm();
			showForm();
		} else {
			hideForm();
			resetForm();
		}
	});

	comparisonMethodInput.addEventListener('change', () => {
		//Shows or hides list-related fields based on the selected comparison method.
		listFields.classList.toggle('hidden', !['order', 'new_items'].includes(comparisonMethodInput.value));
	});

	tokenEnabledCheckbox.addEventListener('change', () => {
		//Shows or hides token-related fields.
		tokenFields.classList.toggle('hidden', !tokenEnabledCheckbox.checked);
	});

	const resetForm = () => {
		//Resets the form to its default state for adding a new site.
		formTitle.textContent = 'Add New Site or Endpoint';
		[nameInput, urlInput, websiteInput, selectorInput, idAttributeInput, headersInput, bodyInput, tokenUrlInput, tokenSelectorInput, tokenAttributeInput, tokenRegExInput, tokenPlaceholderInput].forEach((el) => (el.value = ''));
		comparisonMethodInput.value = 'text';
		tokenEnabledCheckbox.checked = false;
		urlInput.readOnly = false;
		addBtn.textContent = 'Add Site';
		currentlyEditingKey = null;
		listFields.classList.add('hidden');
		tokenFields.classList.add('hidden');
		document.getElementById('cancelBtn')?.remove();
	};

	addBtn.addEventListener('click', () => {
		//Handles adding or editing a site.
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
				alert('Headers are not valid JSON.');
				return;
			}
		}
		const body = bodyInput.value.trim();

		const data = { name, website, comparisonMethod, selector, idAttribute, header: headers, body, tokenEnabled, tokenUrl, tokenSelector, tokenAttribute, tokenRegEx, tokenPlaceholder, isPaused: false };

		if (currentlyEditingKey) {
			//EDIT MODE
			store.set(currentlyEditingKey, { ...store.get(currentlyEditingKey, {}), ...data });
			alert(`"${name}" has been updated!`);
		} else {
			//ADD MODE
			const counter = store.get('Number', 0) + 1;
			const key = `Counter${counter}${url}`;
			store.set(key, { ...data, content: '', lastChecked: 0 });
			store.set('Number', counter);
		}
		hideForm();
		resetForm();
		loadSites();
	});

	const loadSites = () => {
		//Loads all monitored sites from storage and populates the lists.
		sitesList.innerHTML = '';
		pausedSitesList.innerHTML = '';
		document.getElementById('pausedSection').style.display = 'none';
		let pausedCount = 0;

		store.keys().forEach((key) => {
			if (/^Number$|^check_interval_ms$|^lock_/.test(key)) {
				return;
			}
			const storedData = store.get(key, {});
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
			if (['order', 'new_items'].includes(storedData.comparisonMethod) && storedData.selector) {
				detailsHtml += `<small><span class="detail-label">Selector:</span> ${storedData.selector}</small>`;
			}
			if (storedData.tokenEnabled) {
				detailsHtml += `<small><span class="detail-label">Token Fetching:</span> Enabled</small>`;
			}

			li.innerHTML = `<div class="entry-details">${detailsHtml}</div>
                          <div class="entry-actions">
                              <button class="action-btn pause-btn" title="${isPaused ? 'Resume' : 'Pause'}">${isPaused ? '▶️' : '⏸️'}</button>
                              <button class="action-btn edit-btn" title="Edit">✏️</button>
                              <button class="action-btn delete-btn" title="Delete">❌</button>
                          </div>`;

			li.querySelector('.pause-btn').addEventListener('click', () => {
				//Pauses or resumes a site.
				const currentData = store.get(key, {});
				currentData.isPaused = !currentData.isPaused;
				store.set(key, currentData);
				loadSites();
			});
			li.querySelector('.delete-btn').addEventListener('click', () => {
				if (confirm(`Stop monitoring "${storedData.name || url}"?`)) {
					store.remove(key);
					loadSites();
				}
			});
			li.querySelector('.edit-btn').addEventListener('click', () => {
				//Populates the form with the site's data for editing.
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
				headersInput.value = JSON.stringify(storedData.header || {}, null, 2);
				bodyInput.value = storedData.body || '';
				currentlyEditingKey = key;
				addBtn.textContent = 'Save Changes';
				if (!document.getElementById('cancelBtn')) {
					const cancelBtn = document.createElement('button');
					cancelBtn.id = 'cancelBtn';
					cancelBtn.textContent = 'Cancel';
					buttonGroup.appendChild(cancelBtn);
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
	loadGlobalSettings();
	loadSites();
});
