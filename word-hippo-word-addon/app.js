Office.onReady(function () {
	document.getElementById('grabBtn').onclick = function () {
		Office.context.document.getSelectedDataAsync(Office.CoercionType.Text, function (result) {
			if (result.status === Office.AsyncResultStatus.Succeeded && result.value) {
				document.getElementById('wordInput').value = result.value.trim();
			}
		});
	};

	document.getElementById('actionSelect').onchange = function () {
		document.getElementById('wordFormSelect').style.display = document.getElementById('actionSelect').value === 'form' ? 'block' : 'none';
	};

	document.getElementById('searchBtn').onclick = function () {
		if (!document.getElementById('wordInput').value.trim()) return;
		document.getElementById('placeholder').style.display = 'none';

		//show-wrapper-and-calculate-scale
		let wrapper = document.getElementById('iframeWrapper');
		wrapper.style.display = 'block';

		function fitIframe() {
			let iframe = document.getElementById('hippoFrame');
			let iframeWidth = 980; //forces-bounds-to-crop-empty-sides
			let scale = wrapper.clientWidth / iframeWidth;

			iframe.style.width = iframeWidth + 'px';
			iframe.style.height = wrapper.clientHeight / scale + 'px';
			iframe.style.transform = 'scale(' + scale + ')';
		}

		fitIframe();
		window.onresize = fitIframe;

		document.getElementById('hippoFrame').src = (function (w, a, f) {
			return a === 'form' ? 'https://www.wordhippo.com/what-is/' + f + '/' + w + '.html' : a === 'with-friends' ? 'https://www.wordhippo.com/what-is/words-with-friends-word-finder.html' : a === 'scrabble' ? 'https://www.wordhippo.com/what-is/scrabble-word-finder.html' : a === 'cross' ? 'https://www.wordhippo.com/what-is/crossword-codeword-finder-solver.html' : a === 'conjugations' ? 'https://www.wordhippo.com/what-is/search-page/conjugations.html' : 'https://www.wordhippo.com/what-is/' + (a === 'synonyms' ? 'another-word-for' : a === 'antonyms' ? 'the-opposite-of' : a === 'definitions' ? 'the-meaning-of-the-word' : a === 'rhymes' ? 'words-that-rhyme-with' : a === 'sentences' ? 'sentences-with-the-word' : a === 'starting-with' ? 'words-starting-with' : a === 'ending-with' ? 'words-ending-with' : a === 'containing' ? 'words-containing' : a === 'containing-the-letters' ? 'words-containing-the-letters' : 'how-do-you-pronounce-the-word') + '/' + w + '.html';
		})(encodeURIComponent(document.getElementById('wordInput').value.trim().toLowerCase()), document.getElementById('actionSelect').value, document.getElementById('wordFormSelect').value);
	};

	Office.context.document.getSelectedDataAsync(Office.CoercionType.Text, function (result) {
		if (result.status === Office.AsyncResultStatus.Succeeded && result.value) {
			document.getElementById('wordInput').value = result.value.trim();
		}
	});
});
