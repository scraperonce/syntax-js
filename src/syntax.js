/**
 * syntax-js
 * simple syntax highlighter on javascript
 *
 * Hisataka Ishii <scraper.once@gmail.com>
 * MIT License
 */
(function() {
	if (this === window) {
		var p; try {p = exports;} catch (e) {p = window["syntax"] = {}; }
		return arguments.callee.call(p);
	}
	
	this.highlight = function(elem, dict, pallet) {
		var hl = new this.SyntaxHighlight();
		if (dict) hl.setDictionary(dict);
		if (pallet) hl.setPallet(pallet);
		hl.applyTo(elem);
	};
	
	this.SyntaxHighlight = (function() {	
		// private methods (shared by all instances)
		var removeAllChildOf = function(e) {
			while (e.lastChild) {
				e.removeChild(e.lastChild);
			}
		}
		var replaceTagsToCR = function(e, tagname) {
			var ec = e.firstChild, next;
			while (ec) {
				next = ec.nextSibling;
				if (ec.tagName && ec.tagName == tagname) {
					e.insertBefore(document.createTextNode("\r"), ec);
					e.removeChild(ec);
				}
				ec = next;
			}
		}
		var buildFilter = function(filter, dict) {
			if (!dict) throw Error();
			filter.paint = [];
			var a =[], b;
			for (var i=0; i<16; i++) {
				if (dict[i] == undefined) continue;
				filter.paint[i] = new RegExp("^("+dict[i]+")$", "m");
				b = dict[i].split("|");
				for (var j=0; j<b.length; j++) {
					if (!(/\\?\W/.test(b[j]))) {
						b[j] = "\\b"+b[j]+"\\b";
					} else {
						b[j] = b[j]+".*?\r?";
					}
				}
				a.push(b.join("|"));
			}
			filter.main = new RegExp(a.join("|"), "gm");
		};
	
		// private properties(shared by all instances)
		var tabwidth = 4;

		// constructor
		var lambda = function(d, p) {
			if (this === window) {
				return new lambda();
			}
		
			// private properties (closed vars)
			var filter = {};
			var dict;
			var pallet;
		
			// public methods
			this.setDictionary = function(arg) {
				if (typeof arg === "string")
					arg = this.DICTIONARIES[arg];
				dict = arg;
				buildFilter(filter, dict);
			};
			this.setPallet = function(arg){
				if (typeof arg === "string")
					arg = this.PALLETS[arg];
				pallet = arg;
			};
			this.getDictionary = function() {
				return dict;
			};
			this.getPallet = function() {
				return pallet;
			}
			this.getFilter = function() {
				return {
					main: new RegExp(filter.main.source, "gm"),
					paint: filter.paint.concat()
				} || null;
			}
			this.setDictionary(d||lambda.DICTIONARIES["javascript"]);
			this.setPallet(p||lambda.PALLETS["default"]);
		}
	
		// prototype
		lambda.prototype = {
			setTabWidth: function(width) {
				tabwidth = width;
			},
			getTabWidth: function() {
				return tabwidth;
			},
			applyTo: function(e) {
				var filter = this.getFilter();
				var pallet = this.getPallet();
				setTimeout(function() {
					var str = e.innerHTML, b = false;
					if (!filter || !pallet) throw Error();
					str = str.replace(/ |\t|<.*?>/gm, function(m) {
						if (m==" ") {
							return "&nbsp;";
						} else if (m=="\t") {
							return "&nbsp;&nbsp;&nbsp;&nbsp;";
						}
						return "";
					});
					str = str.replace(filter.main, function(m) {
						m = m.replace(/<.*?>/i, function(p) {
							return "";
						});
						for (var i=-16; i<16; i++) {
							if (filter.paint[i] == undefined) continue;
							if (filter.paint[i].test(m)) {
								return "<span style=\"color:"+pallet[i]+"\">"+m+"</span>";
							}
						}
						return "<b>"+m+"</b>";
					});
					/*@cc_on str = str.replace(/\r/g, "<br />\r");@*/
					e.innerHTML = str;
					/*@cc_on replaceTagsToCR(e, "BR");@*/
				},0);
			},
			toString: function() {
				return "[object SyntaxHighlight]";
			}
		}
	
		// function properties
		lambda.DICTIONARIES = {
			javascript: {
				1: "true|false|"+
				   "\"(\\\\\"|.)*?\"|'(\\\\'|.)*?'|\\/(?!\\*).+?\\/[igm]*",
				2: "Array|Boolean|Date|Error|EvalError|Function|Math|Number|Object|RangeError|"+
				   "ReferenceError|RegExp|String|SyntaxError|TypeError|URIError",
				3: "new|break|delete|instanceof|null|return|typeof|document|for|in|while|do|"+
				   "with|let|get|set|undefined|if|else|each|import|export|const|continue|"+
				   "Infinity|NaN|throw|try|catch|switch|window|prototype|boolean|alert",
				6: "var|function|this|arguments|"+
				   "\\{|\\}|\\[|\\]",
				7: "\\/\\/.*$|\\/\\*[\\s\\S]*?\\*\\/"
			}
		};
		lambda.PALLETS = {
			default: [
				"#000000", "#800000", "#008000", "#808000",
				"#000080", "#800080", "#008080", "#c0c0c0",
				"#808080", "#ff0000", "#00ff00", "#ffff00",
				"#0000ff", "#ff00ff", "#ffff00", "#ffffff"
			]
		};
		return lambda;
	})();
})();
