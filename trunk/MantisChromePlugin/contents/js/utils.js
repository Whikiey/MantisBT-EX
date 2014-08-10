
; (function ($) {
	window.utils = {
		paddingLeft: function (str, len, char) {
			if (char === undefined || char === null || char.toString().length == 0)
				char = " ";
			char = char.toString().charAt(0);
			if (str.length > len)
				return str.substring(0, len);
			for (var i = str.length; i < len; i++)
				str = char + str;
			return str;
		},
		parseUrlParams: function (urlParam) {
			var o = {};
			if (urlParam.charAt(0) == "?")
				urlParam = urlParam.substring(1);
			var params = urlParam.split("&");
			for (var i = 0; i < params.length; i++) {
				var p = params[i].split("=");
				var k = decodeURIComponent(p[0]), v = decodeURIComponent(p[1]);
				if (k in o) {
					if (!$.isArray(o[k]))
						o[k] = [o[k]];
					o[k].push(v);
				}
				else
					o[k] = v;
			}
			return o;
		}
	};
})(window.jQuery);