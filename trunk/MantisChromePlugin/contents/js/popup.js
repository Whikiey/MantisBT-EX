(function ($) {
	var version = chrome.app.getDetails().version;
	var key = "mx_" + version;
	function loadSettings() {
		var settings = window.localStorage.getItem(key);
		if (!settings)
			settings = {};
		else
			settings = window.JSON.parse(settings);
		return settings;
	}
	function saveSettings(settings) {
		window.localStorage.setItem(key, window.JSON.stringify(settings));
	}
	$(function () {
		var settings = loadSettings();
		if (settings.firstRun === undefined || settings.firstRun) {
			$(".version-history").show();
			settings.firstRun = false;
		}
		saveSettings(settings);
	});
})(window.jQuery);
