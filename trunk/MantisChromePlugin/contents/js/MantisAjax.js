
; (function ($) {
	var MantisAjaxClass = function () {
	};
	MantisAjaxClass.prototype = {
		get_rel_url: function () {
			var rel = $(".menu a:first").attr("href");
			rel = rel.substring(0, rel.lastIndexOf("/main_page.php"));
			return rel;
		},
		validate_ids: function (ids) {
			if (!ids)
				return false;
			if (!$.isArray(ids))
				return false;
			if (ids.length == 0)
				return false;
			return true;
		},
		validate_comment: function (comment) {
			if (comment == null)
				return false;
			if ($.trim(comment.toString()).length == 0)
				return false;
			return true;
		},
		batch_add_comment: function (bugids, comment) {
			if (!this.validate_ids(bugids))
				return;
			if (!this.validate_comment(comment))
				return;
			var rel_url = this.get_rel_url();
			var queries = [];
			for (var i = 0; i < bugids.length; i++)
				queries.push(encodeURIComponent("bug_arr[]") + "=" + encodeURIComponent(bugids[i]));
			$.ajax({
				url: rel_url + "bug_actiongroup_page.php?action=EXT_ADD_NOTE&" + queries.join("&"),
				type: "GET",
				async: false,
				cache: false
			}).done(function (data) {
				var prefix = '<input type="hidden" name="bug_actiongroup_add_note_token" value="';
				var suffix = '"';
				var idx = data.indexOf(prefix);
				if (idx < 0)
					return;
				var searchIn = data.substring(idx + prefix.length);
				idx = searchIn.indexOf(suffix);
				var form_token = searchIn.substring(0, idx);
				var body = "bug_actiongroup_add_note_token=" + encodeURIComponent(form_token) + "&action=add_note&view_state=10&" + queries.join("&") + "&bugnote_text=" + encodeURIComponent(comment);
				$.ajax({
					url: rel_url + "bug_actiongroup_ext.php",
					type: "POST",
					async: false,
					cache: false,
					data: body
				}).done(function (data) {

				});
			});
		},
		batch_add_monitor: function (bugids, comment) {
			if (!this.validate_ids(bugids))
				return;
			var rel_url = this.get_rel_url();
			for (var i = 0; i < bugids.length; i++)
				this.add_monitor(bugids[i]);
		},
		add_monitor: function (bugid) {
			var rel_url = this.get_rel_url();
			$.ajax({
				url: rel_url + "view.php?id=" + bugid,
				type: "GET",
				async: false,
				cache: false
			}).done(function (data) {
				var prefix = '<input type="hidden" name="bug_monitor_add_token" value="';
				var suffix = '"';
				console.log(data);
				var idx = data.indexOf(prefix);
				if (idx < 0)
					return;
				var searchIn = data.substring(idx + prefix.length);
				idx = searchIn.indexOf(suffix);
				var form_token = searchIn.substring(0, idx);
				var body = "bug_monitor_add_token=" + encodeURIComponent(form_token) + "&bug_id=" + bugid;
				$.ajax({
					url: rel_url + "bug_monitor_add.php",
					type: "POST",
					async: false,
					cache: false,
					data: body
				}).done(function (data) {
					
				});
			});
		}
	};
	window.MantisAjax = new MantisAjaxClass();
})(window.jQuery);