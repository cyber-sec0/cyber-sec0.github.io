document.querySelectorAll('.wallet-address').forEach(function (element) {
  // Loop through each wallet Addresses element
  element.onclick = function () {
    navigator.clipboard.writeText(element.textContent);

    const copyMessage = document.querySelector('#copyMessage'); // Get the next sibling which is the copy message

    copyMessage.style.display = 'block'; // Show copied message
    copyMessage.style.top = this.getBoundingClientRect().top - document.body.getBoundingClientRect().top - copyMessage.offsetHeight + 52 + 'px';
    copyMessage.style.left = '22%';

    setTimeout(function () {
      document.getElementById('copyMessage').style.display = 'none';
    }, 1000); // Hide message after 1 second
  };
});

(function (c) {
	document.body.appendChild(c).style.cssText = 'position:fixed;top:0;left:0;z-index:-1';
	c.width = window.innerWidth;
	c.height = window.innerHeight;
	(function (ctx, drops) {
		setInterval(() => {
			ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
			ctx.fillRect(0, 0, c.width, c.height);
			ctx.fillStyle = '#f00';
			drops.forEach((y, i) => {
				ctx.fillText(String.fromCharCode(33 + Math.random() * 94), i * 15, y * 15);
				drops[i] = y * 15 > c.height && Math.random() > 0.95 ? 0 : y + 1;
			});
		}, 50);
	})(c.getContext('2d'), Array(Math.floor(c.width / 15)).fill(1));
})(document.createElement('canvas'));