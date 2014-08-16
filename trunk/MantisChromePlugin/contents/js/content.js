; (function () {

	function detect() {
		return document.body.innerHTML.indexOf("MantisBT") >= 0;
	}
	chrome.extension.onMessage.addListener(function (msg, sender, sendResponse) {
		if (msg.action == "mx_detect") {
			sendResponse(detect());
			return;
		}
		if (msg.action == 'mx_init') {
			MantisPage.init();
			sendResponse(null);
			return;
		}
	});
})();
