Office.onReady(() => {
	document.getElementById('grabBtn').onclick = () => {
		Office.context.document.getSelectedDataAsync(Office.CoercionType.Text, (result) => {
			if (result.status === Office.AsyncResultStatus.Succeeded && result.value) {
				document.getElementById('wordInput').value = result.value.trim();
			}
		});
	};

	document.getElementById('actionSelect').onchange = () => {
		document.getElementById('wordFormSelect').style.display = document.getElementById('actionSelect').value === 'form' ? 'block' : 'none';
	};

	const resizeIframe = () => {
		let wrapper = document.getElementById('iframeWrapper');
		let iframe = document.getElementById('hippoFrame');

		if (wrapper.style.display === 'block') {
			// 665px bounds the left column.
			let scale = wrapper.clientWidth / 665;

			// 1010px gives WordHippo enough room for its 970px table + the vertical scrollbar, killing the X scrollbar entirely.
			iframe.style.width = '1010px';
			iframe.style.height = wrapper.clientHeight / scale + 'px';
			iframe.style.transform = 'scale(' + scale + ')';
		}
	};

	window.onresize = resizeIframe;

	document.getElementById('searchBtn').onclick = () => {
		if (!document.getElementById('wordInput').value.trim()) return;
		document.getElementById('placeholder').style.display = 'none';
		document.getElementById('iframeWrapper').style.display = 'block';

		resizeIframe(); // Trigger crop math instantly

		document.getElementById('hippoFrame').src = ((w, a, f) => {
			return a === 'form' ? 'https://www.wordhippo.com/what-is/' + f + '/' + w + '.html' : a === 'with-friends' ? 'https://www.wordhippo.com/what-is/words-with-friends-word-finder.html' : a === 'scrabble' ? 'https://www.wordhippo.com/what-is/scrabble-word-finder.html' : a === 'cross' ? 'https://www.wordhippo.com/what-is/crossword-codeword-finder-solver.html' : a === 'conjugations' ? 'https://www.wordhippo.com/what-is/search-page/conjugations.html' : 'https://www.wordhippo.com/what-is/' + (a === 'synonyms' ? 'another-word-for' : a === 'antonyms' ? 'the-opposite-of' : a === 'definitions' ? 'the-meaning-of-the-word' : a === 'rhymes' ? 'words-that-rhyme-with' : a === 'sentences' ? 'sentences-with-the-word' : a === 'starting-with' ? 'words-starting-with' : a === 'ending-with' ? 'words-ending-with' : a === 'containing' ? 'words-containing' : a === 'containing-the-letters' ? 'words-containing-the-letters' : 'how-do-you-pronounce-the-word') + '/' + w + '.html';
		})(encodeURIComponent(document.getElementById('wordInput').value.trim().toLowerCase()), document.getElementById('actionSelect').value, document.getElementById('wordFormSelect').value);
	};

	Office.context.document.getSelectedDataAsync(Office.CoercionType.Text, (result) => {
		if (result.status === Office.AsyncResultStatus.Succeeded && result.value) {
			document.getElementById('wordInput').value = result.value.trim();
		}
	});
});
