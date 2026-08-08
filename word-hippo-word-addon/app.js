Office.onReady(() => {
	//grab-text-manually
	document.getElementById('grabBtn').onclick = () => {
		Office.context.document.getSelectedDataAsync(Office.CoercionType.Text, (result) => {
			if (result.status === Office.AsyncResultStatus.Succeeded && result.value) {
				document.getElementById('wordInput').value = result.value.trim();
			}
		});
	};

	//execute-search-based-on-dropdown
	document.getElementById('searchBtn').onclick = () => {
		let word = document.getElementById('wordInput').value.trim();
		let action = document.getElementById('actionSelect').value;
		if (word) {
			document.getElementById('hippoFrame').src = 'https://www.wordhippo.com/what-is/' + action + '/' + encodeURIComponent(word) + '.html';
		}
	};

	//auto-grab-on-first-load
	Office.context.document.getSelectedDataAsync(Office.CoercionType.Text, (result) => {
		if (result.status === Office.AsyncResultStatus.Succeeded && result.value) {
			document.getElementById('wordInput').value = result.value.trim();
		}
	});
});
