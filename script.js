document.querySelectorAll('.wallet-address').forEach(function (element) {
  // Loop through each wallet Addresses element
  element.onclick = function () {
    navigator.clipboard.writeText(element.textContent);

    const copyMessage = document.querySelector('#copyMessage'); // Get the next sibling which is the copy message

    copyMessage.style.display = 'block'; // Show copied message
    copyMessage.style.top = this.getBoundingClientRect().top - document.body.getBoundingClientRect().top - copyMessage.offsetHeight + 65 + 'px';
    copyMessage.style.left = '37%';

    setTimeout(function () {
      document.getElementById('copyMessage').style.display = 'none';
    }, 1000); // Hide message after 1 second
  };
});
