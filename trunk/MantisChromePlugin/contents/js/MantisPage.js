
; (function ($) {
	function getDate(delta) {
		var d = new Date();
		if (delta !== undefined && delta) {
			d.setDate(d.getDate() + delta);
		}
		var ret = {};
		ret.year = d.getYear() + 1900;
		ret.month = d.getMonth() + 1;
		ret.day = d.getDate();
		return ret;
	};
	function fillDtp(dtp, value) {
		if (value && value != null) {
			dtp.year.value = value.year.toString();
			dtp.month.value = value.month.toString();
			dtp.day.value = value.day.toString();
		}
		else {
			dtp.year.value = "";
			dtp.month.value = "";
			dtp.day.value = "";
		}
	};

	var MantisPageClass = function () { };
	MantisPageClass.prototype = {
		detect: function () {
			return $(document.body).html().indexOf("MantisBT") >= 0;
		},
		init: function () {
			if (!this.detect())
				return false;
			
			this.addDatePickerFeature();
			if (this.isGroupActionPage()) {
				this.addCommentFeatureToGroupActionPage();
			}
			this.highlightLastUpdated();
			return true;
		},
		addDatePickerFeature: function () {
			$("select[name$=_year]").each(function () {
				var prefix = this.name.substring(0, this.name.length - "_year".length);
				if (!$(this).next().is("select[name=" + prefix + "_month]"))
					return;
				if (!$(this).next().next().is("select[name=" + prefix + "_day]"))
					return;
				var dtp = {
					year: this,
					month: $(this).next()[0],
					day: $(this).next().next()[0]
				};

				var jLast = $(dtp.day);

				var jInput = $("<input type=\"text\" class=\"wk_mantis_date_text\">");
				jLast.after(jInput);
				jLast = jInput;

				var jBtn = $("<button type=\"button\" class=\"wk_mantis_date_pick\">" + "▼" + "</button>");
				jLast.after(jBtn);
				jLast = jBtn;
				jInput.datepicker({
					dateFormat: "yy-mm-dd",
					changeYear: true,
					changeMonth: true,
					showAnim: "fadeIn",
					showMonthAfterYear: true,
					showOtherMonths: true,
					showButtonPanel: true,
					beforeShow: function () {
						var dateExp = dtp.year.value + "-" + dtp.month.value + "-" + dtp.day.value;
						if (/^\d{4}\-\d{1,2}-\d{1,2}$/g.test(dateExp)) {
							var date = new Date(dateExp);
							if (isNaN(date.getFullYear()))
								date = new Date();
						}
						else
							date = new Date();
						dateExp = utils.paddingLeft(date.getFullYear().toString(), 4, "0")
							+ "-" + utils.paddingLeft((date.getMonth() + 1).toString(), 2, "0")
							+ "-" + utils.paddingLeft(date.getDate().toString(), 2, "0");
						jInput.val(dateExp);
						$(this).datepicker("setDate", dateExp);
					},
					onSelect: function () {
						var nums = this.value.split("-");
						if (nums.length == 3) {
							var date = {
								year: parseInt(nums[0]),
								month: parseInt(nums[1]),
								day: parseInt(nums[2]),
							};
							fillDtp(dtp, date);
						}
					}
				});
				function showDatePicker() {
					jInput.datepicker("show");
				};
				jBtn.click(showDatePicker);

				var buttons = { "今": 0, "明": 1, "后": 2, "清空": null };
				for (btn in buttons) {
					var jBtn = $("<button type=\"button\" class=\"wk_mantis_date_plugin\">" + btn + "</button>");
					var elBtn = jBtn[0];
					elBtn.delta = buttons[btn];
					elBtn.dtp = dtp;
					jLast.after(jBtn);
					jLast = jBtn;
				}

				$(".wk_mantis_date_plugin").click(function () {
					fillDtp(this.dtp, (this.delta != null) ? getDate(this.delta) : null);
					return false;
				});
			});

		},
		isGroupActionPage: function () {
			return window.location.pathname.toLowerCase() == MantisAjax.get_rel_url().toLowerCase() + "/bug_actiongroup_page.php";
		},
		addCommentFeatureToGroupActionPage: function () {
			var jForm = null;
			$("form").each(function () {
				if ($(this).attr("action") == "bug_actiongroup.php") {
					jForm = $(this);
					return false;
				}
			});
			if (jForm == null)
				return;
			if (jForm.find("textarea[name=bugnote_text]").length > 0)
				return;

			jForm.find(":submit:first").parents("tr").first()
				.before("<tr class=\"row-2\"><td class=\"category\">添加注释</td><td><textarea id=\"bugnote_text\" cols=\"80\" rows=\"10\"></textarea></td></tr>");
			jForm.submit(function () {
				var bugids = [];
				jForm.find("input[name^=bug_arr]").each(function () {
					bugids.push(this.value);
				});
				var comment = $("#bugnote_text").val();
				MantisAjax.batch_add_comment(bugids, comment);
			});
		},
		get_column_header_in_list_view: function (column) {
			var jA = $("#buglist tr.row-category").find("a[href]").filter(function (index) { return this.href.indexOf("view_all_set.php?sort=" + column) >= 0; });
			if (jA == null)
				return null;
			var jParents = jA.parents("TD");
			if (jParents.length == 0)
				return null;
			return jParents[0];
		},
		isClosed: function (tr) {
			return $(tr).attr("bgColor") == "#c9ccc4";
		},
		highlightLastUpdated: function () {
			var td = this.get_column_header_in_list_view("last_updated");
			var dataRows = $(td).parents("TABLE").first().find("tr").filter(function () { return this.cells.length > 1 && (this.className == null || this.className == ""); });
			var now = new Date();
			var msPerDay = 1000 * 60 * 60 * 24;
			var warnDays = 5;
			var alarmDays = 7;
			var warnMs = msPerDay * warnDays
			var alarmMs = msPerDay * alarmDays;
			var alarmItems = [];
			var warnItems = [];
			var isClosed = this.isClosed;
			dataRows.each(function () {
				if (isClosed(this))
					return;
				var text = $(this.cells[td.cellIndex]).text();
				var dtUpdate = new Date(text);
				var deltaMs = now - dtUpdate;
				if (deltaMs > alarmMs) {
					alarmItems.push(this);
					return;
				}
				if (deltaMs > warnMs) {
					warnItems.push(this);
					return;
				}
			});
			if (alarmItems.length + warnItems.length > 0) {
				$(td).css("background", "#f00");
				$.each(alarmItems, function () {
					$(this.cells[td.cellIndex]).css("background", "#f00");
				});
				$.each(warnItems, function () {
					$(this.cells[td.cellIndex]).css("background", "#ff0");
				});
			}
		}

	};
	window.MantisPage = new MantisPageClass();
})(window.jQuery);