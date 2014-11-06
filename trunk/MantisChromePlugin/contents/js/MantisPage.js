
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
	function getNextMondyDelta() {
		var date = new Date();
		date.setDate(date.getDate() - ((date.getDay() + 6) % 7 + 1) + 8);
		//return date;
		return (date.valueOf() - (new Date()).valueOf()) / (1000 * 3600 * 24);
	}

	var MantisPageClass = function () { };
	MantisPageClass.prototype = {
		detect: function () {
			return $(document.body).html().indexOf("MantisBT") >= 0;
		},
		init: function () {
			if (!this.detect())
				return false;
			if (this.isGroupActionExPage()) {
				this.addActionExFeature();
			}
			else if (this.isGroupCommentPage()) { }
			else if (this.isGroupActionPage()) {
				this.addCommentFeatureToGroupActionPage();
			}
			if (this.isListPage()) {
				this.highlightLastUpdated();
				this.addBatchMonitorFeature();
			}
			this.addDatePickerFeature();
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
				$(dtp.year).hide();
				$(dtp.month).hide();
				$(dtp.day).hide();

				var jLast = $(dtp.day);

				var jInput = $("<input type=\"text\" style=\"height:24px; width: 0px; padding: 0; border-width: 0;\" class=\"wk_mantis_date_text\" readonly>");
				jLast.after(jInput);
				jLast = jInput;
				dtp.input = jInput[0];

				function syncDateToInput() {
					var dateExp = dtp.year.value + "-" + dtp.month.value + "-" + dtp.day.value;
					if (/^\d{4}\-\d{1,2}-\d{1,2}$/g.test(dateExp)) {
						var date = new Date(dateExp);
						if (isNaN(date.getFullYear()))
							date = new Date();
					}
					else {
						jDropBtn.text(dropDownText);
						jInput.val("");
						return;
					}
					dateExp = utils.paddingLeft(date.getFullYear().toString(), 4, "0")
						+ "-" + utils.paddingLeft((date.getMonth() + 1).toString(), 2, "0")
						+ "-" + utils.paddingLeft(date.getDate().toString(), 2, "0");
					jInput.val(dateExp);
					jDropBtn.text(dateExp + " " + dropDownText);
					$(this).datepicker("setDate", dateExp);
				}
				jInput.datepicker({
					dateFormat: "yy-mm-dd",
					changeYear: true,
					changeMonth: true,
					showAnim: "fadeIn",
					showMonthAfterYear: true,
					showOtherMonths: true,
					showButtonPanel: true,
					beforeShow: syncDateToInput,
					onSelect: function () {
						var nums = this.value.split("-");
						if (nums.length == 3) {
							var date = {
								year: parseInt(nums[0]),
								month: parseInt(nums[1]),
								day: parseInt(nums[2]),
							};
							fillDtp(dtp, date);
							syncDateToInput();
						}
					}
				});
				function showDatePicker() {
					jInput.datepicker("show");
				};
				var dropDownText = "▼";
				var jBtn = $("<button type=\"button\" style=\"text-align: right; width: 108px; white-space: nowrap;\" class=\"wk_mantis_date_pick\" ></button>");
				var jDropBtn = jBtn;
				jLast.after(jBtn);
				jLast = jBtn;
				jBtn.click(showDatePicker);

				var buttons = { "今": 0, "明": 1, "后": 2, "下周一": getNextMondyDelta(), "清空": null };
				for (btn in buttons) {
					var jBtn = $("<button type=\"button\" class=\"wk_mantis_date_plugin\">" + btn + "</button>");
					var elBtn = jBtn[0];
					elBtn.delta = buttons[btn];
					elBtn.dtp = dtp;
					jLast.after(jBtn);
					jLast = jBtn;
				}

				syncDateToInput();

				$(".wk_mantis_date_plugin").click(function () {
					fillDtp(this.dtp, (this.delta != null) ? getDate(this.delta) : null);
					syncDateToInput();
					return false;
				});
			});

		},
		isGroupActionPage: function () {
			return window.location.pathname.toLowerCase() == MantisAjax.get_rel_url().toLowerCase() + "/bug_actiongroup_page.php";
		},
		isGroupCommentPage: function () {
			if (!this.isGroupActionPage())
				return false;
			return this.getQueryValue("action") == "EXT_ADD_NOTE";
		},
		isGroupActionExPage: function () {
			if (!this.isGroupCommentPage())
				return false;
			return this.getQueryValue("actionex") != null;
		},
		isListPage: function () {
			return window.location.pathname.toLowerCase() == MantisAjax.get_rel_url().toLowerCase() + "/view_all_bug_page.php";
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
		addActionExFeature: function () {
			var actionex = this.getQueryValue("actionex");
			if (actionex == "ADD_MONITOR") {
				var jForm = null;
				$("form").each(function () {
					if ($(this).attr("action") == "bug_actiongroup_ext.php") {
						jForm = $(this);
						return false;
					}
				});
				if (jForm == null)
					return;
				jForm.find("tr.form-title td").text("添加监视");
				jForm.find("tr td textarea[name=bugnote_text]").parents("tr").first().find("td:first").text("注释");
				jForm.find("input[type=submit]").val("添加监视");
				jForm.submit(function () {
					var bugids = [];
					jForm.find("input[name^=bug_arr]").each(function () {
						bugids.push(this.value);
					});
					var comment = $("textarea[name=bugnote_text]").val();
					try{
						MantisAjax.batch_add_monitor(bugids);
						window.open("view_all_bug_page.php", "_self");
					}
					catch (e){
						console.log(e);
					}
					if (comment == "")
						return false;
				});
			}
		},
		addBatchMonitorFeature: function () {
			var jForm = null;
			$("form").each(function () {
				if ($(this).attr("action") == "bug_actiongroup_page.php") {
					jForm = $(this);
					return false;
				}
			});
			if (jForm == null)
				return;

			jForm.find("select[name=action]").prepend("<option value=WK_EX_ADD_MONITOR>添加监视</option>");

			jForm.submit(function () {
				var jForm = $(this);
				var action = jForm.find("select[name=action]").val();
				if (action.indexOf("WK_EX_") >= 0) {
					var actionex = action.substring("WK_EX_".length);
					jForm.append("<input name=actionex value=" + actionex + " type=hidden />");
					jForm.find("select[name=action]").val("EXT_ADD_NOTE");
					var search = jForm.serialize();
					jForm.find("input[name=actionex]").remove();
					var path = jForm.attr("action");
					window.open(path + "?" + search, "_self");
					return false;
				}
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
			var jTable = $(td).parents("TABLE").first();
			var dataRows = jTable.find("tr").filter(function () { return this.cells.length > 1 && (this.className == null || this.className == ""); });
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
				this.deltaMs = (deltaMs / msPerDay).toFixed(1).toString() + "天未更新";
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
				var summary = "本页统计：";
				var titleBgColor = "#ff0";
				if (alarmItems.length > 0) {
					titleBgColor = "#f00"
					summary += "\r\n" + alarmItems.length + "条问题超过7天未更新";
					$.each(alarmItems, function () {
						$(this.cells[td.cellIndex]).css("background", "#f00").attr("title", this.deltaMs);
					});
				}
				if (warnItems.length > 0) {
					summary += "\r\n" + warnItems.length + "条问题5-6天未更新";
					$.each(warnItems, function () {
						$(this.cells[td.cellIndex]).css("background", "#ff0").attr("title", this.deltaMs);
					});
				}
				$(td).css("background", titleBgColor).attr("title", summary);
			}
			if ($("#select7DaysMore").length == 0) {
				var checkRow = this.checkRow;
				var select7DaysMore = $("<a href='#' id='select7DaysMore' style='margin-left: 4px; margin-right: 4px;'>超过7天未更新</a>").click(function () {
					$.each(alarmItems, function () {
						checkRow(this);
					});
					return false;
				});
				var select5DaysMore = $("<a href='#' id='select5DaysMore' style='margin-left: 4px; margin-right: 4px;'>超过5天未更新</a>").click(function () {
					$.each(alarmItems, function () {
						checkRow(this);
					});
					$.each(warnItems, function () {
						checkRow(this);
					});
					return false;
				});
				var selectNone = $("<a href='#' id='selectNone' style='margin-left: 4px; margin-right: 4px;'>全不选</a>").click(function () {
					jTable.find("input[type=checkbox]").prop("checked", false);
					return false;
				});
				jTable.find("select[name=action]").before(select7DaysMore).before(select5DaysMore).before(selectNone);
			}
		},
		checkRow: function (tr, checked) {
			if (checked === undefined)
				checked = true;
			$(tr).find("td:first input[type=checkbox]").prop("checked", checked);
		},
		getQueryMap: function () {
			if (!window._urlQueryMap) {
				var queries = window.location.search.substring(1).split("&");
				var queryMap = {};
				for (var i = 0; i < queries.length; i++) {
					var nv = queries[i].split("=");

					var name = nv[0];
					var val = null;
					if (nv.length > 1)
						val = nv[1];
					if (!(name in queryMap))
						queryMap[name] = [];
					queryMap[name].push(val);
				}
				window._urlQueryMap = queryMap;
			}
			return window._urlQueryMap;
		},
		getQueryValue: function (name) {
			var queryMap = this.getQueryMap();
			if (name in queryMap)
				return queryMap[name][0];
			return null;
		},
		getQueryValues: function (name) {
			var queryMap = this.getQueryMap();
			var vals = [];
			if (name in queryMap) {
				for (var i = 0; i < queryMap[name].length; i++)
					vals.push(queryMap[name][i]);
			}
			return vals;
		}
	};
	window.MantisPage = new MantisPageClass();
})(window.jQuery);