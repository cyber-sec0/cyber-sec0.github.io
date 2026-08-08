Office.onReady(() => {
	document.getElementById('grabBtn').onclick = () => {
		Office.context.document.getSelectedDataAsync(Office.CoercionType.Text, (result) => {
			if (result.status === Office.AsyncResultStatus.Succeeded && result.value) {
				document.getElementById('wordInput').value = result.value.trim();
			}
		});
	};

	document.getElementById('actionSelect').onchange = () => {
		//sub-dropdown-toggle
		document.getElementById('wordFormSelect').style.display = document.getElementById('actionSelect').value === 'form' ? 'block' : 'none';
	};

	document.getElementById('searchBtn').onclick = () => {
		if (!document.getElementById('wordInput').value.trim()) return;
		document.getElementById('placeholder').style.display = 'none';
		document.getElementById('iframeWrapper').style.display = 'block'; //show-wrapper-and-calculate-scale

		(function fitIframe() {
			document.getElementById('hippoFrame').style.width = '980px'; //forces-bounds-to-crop-empty-sides
			document.getElementById('hippoFrame').style.height = document.getElementById('iframeWrapper').clientHeight / (document.getElementById('iframeWrapper').clientWidth / 980) + 'px';
			document.getElementById('hippoFrame').style.transform = 'scale(' + document.getElementById('iframeWrapper').clientWidth / 980 + ')';
		})();

		window.onresize = () => {
			document.getElementById('hippoFrame').style.width = '980px'; //forces-bounds-to-crop-empty-sides
			document.getElementById('hippoFrame').style.height = document.getElementById('iframeWrapper').clientHeight / (document.getElementById('iframeWrapper').clientWidth / 980) + 'px';
			document.getElementById('hippoFrame').style.transform = 'scale(' + document.getElementById('iframeWrapper').clientWidth / 980 + ')';
		};

		document.getElementById('hippoFrame').src = ((w, a, f) => {
			//build-exact-urls
			return a === 'form' ? 'https://www.wordhippo.com/what-is/' + f + '/' + w + '.html' : a === 'with-friends' ? 'https://www.wordhippo.com/what-is/words-with-friends-word-finder.html' : a === 'scrabble' ? 'https://www.wordhippo.com/what-is/scrabble-word-finder.html' : a === 'cross' ? 'https://www.wordhippo.com/what-is/crossword-codeword-finder-solver.html' : a === 'conjugations' ? 'https://www.wordhippo.com/what-is/search-page/conjugations.html' : 'https://www.wordhippo.com/what-is/' + (a === 'synonyms' ? 'another-word-for' : a === 'antonyms' ? 'the-opposite-of' : a === 'definitions' ? 'the-meaning-of-the-word' : a === 'rhymes' ? 'words-that-rhyme-with' : a === 'sentences' ? 'sentences-with-the-word' : a === 'starting-with' ? 'words-starting-with' : a === 'ending-with' ? 'words-ending-with' : a === 'containing' ? 'words-containing' : a === 'containing-the-letters' ? 'words-containing-the-letters' : 'how-do-you-pronounce-the-word') + '/' + w + '.html';
		})(encodeURIComponent(document.getElementById('wordInput').value.trim().toLowerCase()), document.getElementById('actionSelect').value, document.getElementById('wordFormSelect').value);
	};

	Office.context.document.getSelectedDataAsync(Office.CoercionType.Text, (result) => {
		//auto-grab
		if (result.status === Office.AsyncResultStatus.Succeeded && result.value) {
			document.getElementById('wordInput').value = result.value.trim();
		}
	});

	document.addEventListener('keydown', (e) => {
		//handle-shortcuts
		if (e.altKey && e.key.toLowerCase() === 's') {
			Office.addin.hide();
		}
		if (e.altKey && e.key.toLowerCase() === 'w') {
			Office.context.document.getSelectedDataAsync(Office.CoercionType.Text, (result) => {
				if (result.status === Office.AsyncResultStatus.Succeeded && result.value) {
					document.getElementById('wordInput').value = result.value.trim();
					document.getElementById('searchBtn').click();
				}
			});
		}
	});
});
