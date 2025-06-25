document.addEventListener('DOMContentLoaded', () => {
	//Ensure the DOM is loaded before running the script.
	if (!window.wcm_api) {
		//Check if the Tampermonkey script's API is available.
		document.getElementById('scriptWarning').classList.remove('hidden');
		return; //Stop execution if the API bridge is not found.
	}

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

	let currentlyEditingKey = null; //Holds the key of the site being edited.

	const loadGlobalSettings = async () => {
		//Fetches and displays global settings.
		const settings = await window.wcm_api.getGlobalSettings();
		const totalMs = settings.interval || 60000;
		checkIntervalHoursInput.value = Math.floor(totalMs / 3600000);
		checkIntervalMinutesInput.value = Math.floor((totalMs % 3600000) / 60000);
	};

	saveSettingsBtn.addEventListener('click', async () => {
		//Saves the global check interval.
		const hours = parseInt(checkIntervalHoursInput.value, 10) || 0;
		const minutes = parseInt(checkIntervalMinutesInput.value, 10) || 0;
		const totalMs = hours * 3600000 + minutes * 60000;
		if (totalMs >= 60000) {
			await window.wcm_api.setGlobalSettings({ interval: totalMs });
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
		formContainer.classList.contains('hidden') ? (resetForm(), showForm()) : (hideForm(), resetForm());
	}); //Toggle form visibility.

	comparisonMethodInput.addEventListener('change', () => {
		listFields.classList.toggle('hidden', !['order', 'new_items'].includes(comparisonMethodInput.value));
	}); //Show/hide list-specific fields.
	tokenEnabledCheckbox.addEventListener('change', () => {
		tokenFields.classList.toggle('hidden', !tokenEnabledCheckbox.checked);
	}); //Show/hide token-specific fields.

	const resetForm = () => {
		//Clears the form fields for a new entry.
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

	addBtn.addEventListener('click', async () => {
		//Handles adding or updating a site.
		const name = nameInput.value.trim(),
			url = urlInput.value.trim(),
			website = websiteInput.value.trim();
		const comparisonMethod = comparisonMethodInput.value,
			selector = selectorInput.value.trim(),
			idAttribute = idAttributeInput.value.trim();
		const tokenEnabled = tokenEnabledCheckbox.checked,
			tokenUrl = tokenUrlInput.value.trim(),
			tokenSelector = tokenSelectorInput.value.trim();
		const tokenAttribute = tokenAttributeInput.value.trim(),
			tokenRegEx = tokenRegExInput.value.trim(),
			tokenPlaceholder = tokenPlaceholderInput.value.trim();

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
			const allData = await window.wcm_api.getValues();
			const existingData = allData[currentlyEditingKey] || {};
			await window.wcm_api.setValue(currentlyEditingKey, { ...existingData, ...data });
			alert(`"${name}" has been updated!`);
		} else {
			//ADD MODE
			const { counter } = await window.wcm_api.getGlobalSettings();
			const newCounter = counter + 1;
			const key = `Counter${newCounter}${url}`;
			const initialData = { ...data, content: '', lastChecked: 0 };
			await window.wcm_api.setValue(key, initialData); //Save the new site's configuration.
			await window.wcm_api.setGlobalSettings({ counter: newCounter }); //Increment the global counter.
			window.wcm_api.initialFetch(key, initialData); //Let the script fetch initial content in the background.
		}
		hideForm();
		resetForm();
		loadSites();
	});

	const loadSites = async () => {
		//Fetches all site data and renders the lists.
		sitesList.innerHTML = '';
		pausedSitesList.innerHTML = ''; //Clear current lists.
		document.getElementById('pausedSection').style.display = 'none';

		const allData = await window.wcm_api.getValues();
		const sortedKeys = Object.keys(allData).sort((a, b) => (allData[a].name || '').localeCompare(allData[b].name || '')); //Sort alphabetically by name.

		for (const key of sortedKeys) {
			const storedData = allData[key];
			const url = key.replace(/Counter\d+/, '');
			const li = document.createElement('li');
			const isPaused = storedData.isPaused || false;

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

			li.querySelector('.pause-btn').addEventListener('click', async () => {
				//Toggles the paused state of a site.
				storedData.isPaused = !storedData.isPaused;
				await window.wcm_api.setValue(key, storedData);
				loadSites();
			});
			li.querySelector('.delete-btn').addEventListener('click', async () => {
				//Deletes a site.
				if (confirm(`Stop monitoring "${storedData.name || url}"?`)) {
					await window.wcm_api.deleteValue(key);
					loadSites();
				}
			});
			li.querySelector('.edit-btn').addEventListener('click', () => {
				//Populates the form to edit a site.
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
					cancelBtn.style.backgroundColor = '#555';
					buttonGroup.appendChild(cancelBtn);
					cancelBtn.addEventListener('click', () => {
						hideForm();
						resetForm();
					});
				}
				window.scrollTo({ top: 0, behavior: 'smooth' });
			});

			if (isPaused) {
				//Append to the appropriate list.
				pausedSitesList.appendChild(li);
				document.getElementById('pausedSection').style.display = 'block';
			} else {
				sitesList.appendChild(li);
			}
		}
	};
	loadGlobalSettings(); //Initialize global settings fields.
	loadSites(); //Initial load of all monitored sites.
});
