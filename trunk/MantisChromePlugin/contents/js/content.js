console.log(chrome.extension.onMessage);
chrome.extension.onMessage.addListener(function (msg, sender, sendResponse) {
	console.log(msg);

	if (msg.action == 'init') {
		var isMantis = MantisPage.init();
		sendResponse({ result: isMantis });
	}
});
