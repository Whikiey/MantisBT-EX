; (function () {

	function detect() {
		var weight = (document.head.innerHTML.indexOf('<link rel="search" type="application/opensearchdescription+xml" title="MantisBT: Text Search"') > 0 ? 1 : 0)
			+ (document.body.innerHTML.indexOf('<td class="menu"><a href="/main_page.php">') > 0 ? 0.5 : 0)
			+ (document.body.innerHTML.indexOf('<a href="/my_view_page.php">') > 0 ? 0.5 : 0)
			+ (document.body.innerHTML.indexOf('<a href="/view_all_bug_page.php">') > 0 ? 0.5 : 0)
			+ (document.body.innerHTML.indexOf('<a href="/bug_report_page.php">') > 0 ? 0.5 : 0)
			+ (document.body.innerHTML.indexOf('<a href="/my_view_page.php">') > 0 ? 0.5 : 0)
			+ (document.body.innerHTML.indexOf("MantisBT") > 0 ? 0.8 : 0);
		return weight >= 1;
	};
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
