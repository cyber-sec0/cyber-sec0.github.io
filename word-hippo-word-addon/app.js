Office.onReady(() => {
	// Grab text manually
	document.getElementById('grabBtn').onclick = () => {
		Office.context.document.getSelectedDataAsync(Office.CoercionType.Text, (result) => {
			if (result.status === Office.AsyncResultStatus.Succeeded && result.value) {
				document.getElementById('wordInput').value = result.value.trim();
			}
		});
	};

	// Execute search based on dropdown
	document.getElementById('searchBtn').onclick = () => {
		let word = document.getElementById('wordInput').value.trim();
		let action = document.getElementById('actionSelect').value;

		if (!word) return;

		// Show iframe, hide the placeholder text
		document.getElementById('placeholder').style.display = 'none';
		document.getElementById('hippoFrame').style.display = 'block';

		let encodedWord = encodeURIComponent(word.toLowerCase());

		// 1. Logic for standard WordHippo server-side searches
		if (['synonyms', 'antonyms', 'definitions', 'rhymes', 'sentences', 'form', 'from_en', 'to_en', 'conjugations', 'pronunciation'].includes(action)) {
			let form = document.createElement('form');
			form.target = 'hippoFrame';
			form.method = 'POST';
			form.action = 'https://www.wordhippo.com/what-is/process-form.html';

			// Default languages included to prevent translation features from crashing the server
			let inputs = {
				action: action,
				word: word,
				phraselang: 'english',
				tolang: 'spanish',
				fromlang: 'spanish',
				audiolang: 'english',
				conjlang: 'english',
				wordformtype: 'noun',
			};

			for (let key in inputs) {
				let input = document.createElement('input');
				input.type = 'hidden';
				input.name = key;
				input.value = inputs[key];
				form.appendChild(input);
			}

			document.body.appendChild(form);
			form.submit();
			document.body.removeChild(form);

			// 2. Logic for letter/prefix matches
		} else if (['starting-with', 'ending-with', 'containing', 'containing-the-letters'].includes(action)) {
			document.getElementById('hippoFrame').src = 'https://www.wordhippo.com/what-is/words-' + action + '/' + encodedWord + '.html';

			// 3. Logic for game/Scrabble searches
		} else if (action === 'with-friends' || action === 'scrabble') {
			let form = document.createElement('form');
			form.target = 'hippoFrame';
			form.method = 'POST';
			form.action = action === 'with-friends' ? 'https://www.wordhippo.com/what-is/words-with-friends-word-finder.html' : 'https://www.wordhippo.com/what-is/scrabble-word-finder.html';

			let inputs = { matchword: word, length: 0, page: 1, length_match_type: 'E' };
			for (let key in inputs) {
				let input = document.createElement('input');
				input.type = 'hidden';
				input.name = key;
				input.value = inputs[key];
				form.appendChild(input);
			}
			document.body.appendChild(form);
			form.submit();
			document.body.removeChild(form);

			// 4. Logic for Crossword searches
		} else if (action === 'cross') {
			let form = document.createElement('form');
			form.target = 'hippoFrame';
			form.method = 'POST';
			form.action = 'https://www.wordhippo.com/what-is/crossword-codeword-finder-solver.html';

			let inputs = { matchword: word, page: 1, length_match_type: 'E' };
			for (let key in inputs) {
				let input = document.createElement('input');
				input.type = 'hidden';
				input.name = key;
				input.value = inputs[key];
				form.appendChild(input);
			}
			document.body.appendChild(form);
			form.submit();
			document.body.removeChild(form);
		}
	};

	// Auto grab text when panel opens
	Office.context.document.getSelectedDataAsync(Office.CoercionType.Text, (result) => {
		if (result.status === Office.AsyncResultStatus.Succeeded && result.value) {
			document.getElementById('wordInput').value = result.value.trim();
		}
	});
});
