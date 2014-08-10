
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
	if (changeInfo.status == 'complete') {
		chrome.tabs.sendMessage(tabId, { action: "init" }, function (isMantis) {
			if (isMantis.result)
				chrome.pageAction.show(tabId) ;
		});
	}
});