//capture elements
const $ = (id) => document.getElementById(id);
//storage helpers
const set = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const get = (k) => JSON.parse(localStorage.getItem(k) || 'null');
//load interval
document.addEventListener('DOMContentLoaded', () => {
	const ms = get('interval') || 60000;
	$('hours').value = Math.floor(ms / 3600000);
	$('minutes').value = Math.floor((ms % 3600000) / 60000);
	loadSites();
});
//save interval
$('save-settings').onclick = () => {
	const h = +$('hours').value || 0,
		m = +$('minutes').value || 0;
	const ms = (h * 3600 + m * 60) * 1000;
	if (ms < 60000) return alert('>=1m');
	set('interval', ms);
	alert('Saved');
};
//toggle form & fields
$('toggle-form').onclick = () => $('site-form').classList.toggle('hidden');
$('method').onchange = () => {
	$('list-fields').classList.toggle('hidden', !['order', 'new_items'].includes($('method').value));
};
$('token-enabled').onchange = () => $('token-fields').classList.toggle('hidden', !$('token-enabled').checked);
//add site
$('add-site').onclick = (e) => {
	e.preventDefault();
	const data = {
		name: $('name').value,
		url: $('url').value,
		opens: $('opens').value || $('url').value,
		method: $('method').value,
		selector: $('selector').value,
		idAttr: $('id-attr').value,
		tokenEnabled: $('token-enabled').checked,
		tokenUrl: $('token-url').value,
		tokenSel: $('token-selector').value,
		tokenPh: $('token-placeholder').value,
		headers: $('headers').value,
		body: $('body').value,
		paused: false,
		content: '',
		lastChecked: 0,
	};
	const list = get('sites') || [];
	list.push(data);
	set('sites', list);
	loadSites();
};
//render sites
function loadSites() {
	const sites = get('sites') || [];
	$('sites').innerHTML = '';
	$('paused-sites').innerHTML = '';
	sites.forEach((s, i) => {
		const li = document.createElement('li');
		li.innerHTML = `<div>${s.name || s.url}</div><div><button data-i="${i}" class="toggle">${s.paused ? '▶️' : '⏸️'}</button></div>`;
		const btn = li.querySelector('.toggle');
		btn.onclick = () => {
			s.paused = !s.paused;
			set('sites', sites);
			loadSites();
		};
		(s.paused ? $('paused-sites') : $('sites')).append(li);
	});
}
