
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
	if (changeInfo.status == 'complete') {
		chrome.tabs.sendMessage(tabId, { action: "mx_detect" }, function (isMantis) {
			if (isMantis) {
				//chrome.pageAction.show(tabId);
				var resFiles = [
					{ "css/jquery-ui.css": "css" },
					{ "css/content.css": "css" },
					{ "js/jquery.js": "script" },
					{ "js/jquery-ui.js": "script" },
					{ "js/utils.js": "script" },
					{ "js/MantisPage.js": "script" },
					{ "js/MantisAjax.js": "script" }

				];

				function loadResFiles(resFiles, callback) {
					if (resFiles.length == 0) {
						callback();
						return;
					}
					function nextCall() {
						loadResFiles(resFiles, callback);
					}
					var res = resFiles[0];
					resFiles.splice(0, 1);

					for (var resFile in res) {
						var type = res[resFile];
						var loadFunc = null;

						if (type == "css")
							loadFunc = chrome.tabs.insertCSS;
						else if (type == "script")
							loadFunc = chrome.tabs.executeScript;

						if (loadFunc != null)
							loadFunc(tabId, { file: resFile }, nextCall);
						else
							nextCall();

						return;
					}
				}
				loadResFiles(resFiles, function () {
					chrome.tabs.sendMessage(tabId, { action: "mx_init" }, function () {
						return;
					});
				});
			}
		});
	}
});