// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"IfYP":[function(require,module,exports) {
/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var w = d * 7;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} [options]
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options) {
  options = options || {};
  var type = typeof val;
  if (type === 'string' && val.length > 0) {
    return parse(val);
  } else if (type === 'number' && isFinite(val)) {
    return options.long ? fmtLong(val) : fmtShort(val);
  }
  throw new Error(
    'val is not a non-empty string or a valid number. val=' +
      JSON.stringify(val)
  );
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = String(str);
  if (str.length > 100) {
    return;
  }
  var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
    str
  );
  if (!match) {
    return;
  }
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'weeks':
    case 'week':
    case 'w':
      return n * w;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
    default:
      return undefined;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtShort(ms) {
  var msAbs = Math.abs(ms);
  if (msAbs >= d) {
    return Math.round(ms / d) + 'd';
  }
  if (msAbs >= h) {
    return Math.round(ms / h) + 'h';
  }
  if (msAbs >= m) {
    return Math.round(ms / m) + 'm';
  }
  if (msAbs >= s) {
    return Math.round(ms / s) + 's';
  }
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtLong(ms) {
  var msAbs = Math.abs(ms);
  if (msAbs >= d) {
    return plural(ms, msAbs, d, 'day');
  }
  if (msAbs >= h) {
    return plural(ms, msAbs, h, 'hour');
  }
  if (msAbs >= m) {
    return plural(ms, msAbs, m, 'minute');
  }
  if (msAbs >= s) {
    return plural(ms, msAbs, s, 'second');
  }
  return ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, msAbs, n, name) {
  var isPlural = msAbs >= n * 1.5;
  return Math.round(ms / n) + ' ' + name + (isPlural ? 's' : '');
}

},{}],"MTTc":[function(require,module,exports) {

/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 */

function setup(env) {
	createDebug.debug = createDebug;
	createDebug.default = createDebug;
	createDebug.coerce = coerce;
	createDebug.disable = disable;
	createDebug.enable = enable;
	createDebug.enabled = enabled;
	createDebug.humanize = require('ms');

	Object.keys(env).forEach(key => {
		createDebug[key] = env[key];
	});

	/**
	* Active `debug` instances.
	*/
	createDebug.instances = [];

	/**
	* The currently active debug mode names, and names to skip.
	*/

	createDebug.names = [];
	createDebug.skips = [];

	/**
	* Map of special "%n" handling functions, for the debug "format" argument.
	*
	* Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
	*/
	createDebug.formatters = {};

	/**
	* Selects a color for a debug namespace
	* @param {String} namespace The namespace string for the for the debug instance to be colored
	* @return {Number|String} An ANSI color code for the given namespace
	* @api private
	*/
	function selectColor(namespace) {
		let hash = 0;

		for (let i = 0; i < namespace.length; i++) {
			hash = ((hash << 5) - hash) + namespace.charCodeAt(i);
			hash |= 0; // Convert to 32bit integer
		}

		return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
	}
	createDebug.selectColor = selectColor;

	/**
	* Create a debugger with the given `namespace`.
	*
	* @param {String} namespace
	* @return {Function}
	* @api public
	*/
	function createDebug(namespace) {
		let prevTime;

		function debug(...args) {
			// Disabled?
			if (!debug.enabled) {
				return;
			}

			const self = debug;

			// Set `diff` timestamp
			const curr = Number(new Date());
			const ms = curr - (prevTime || curr);
			self.diff = ms;
			self.prev = prevTime;
			self.curr = curr;
			prevTime = curr;

			args[0] = createDebug.coerce(args[0]);

			if (typeof args[0] !== 'string') {
				// Anything else let's inspect with %O
				args.unshift('%O');
			}

			// Apply any `formatters` transformations
			let index = 0;
			args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
				// If we encounter an escaped % then don't increase the array index
				if (match === '%%') {
					return match;
				}
				index++;
				const formatter = createDebug.formatters[format];
				if (typeof formatter === 'function') {
					const val = args[index];
					match = formatter.call(self, val);

					// Now we need to remove `args[index]` since it's inlined in the `format`
					args.splice(index, 1);
					index--;
				}
				return match;
			});

			// Apply env-specific formatting (colors, etc.)
			createDebug.formatArgs.call(self, args);

			const logFn = self.log || createDebug.log;
			logFn.apply(self, args);
		}

		debug.namespace = namespace;
		debug.enabled = createDebug.enabled(namespace);
		debug.useColors = createDebug.useColors();
		debug.color = selectColor(namespace);
		debug.destroy = destroy;
		debug.extend = extend;
		// Debug.formatArgs = formatArgs;
		// debug.rawLog = rawLog;

		// env-specific initialization logic for debug instances
		if (typeof createDebug.init === 'function') {
			createDebug.init(debug);
		}

		createDebug.instances.push(debug);

		return debug;
	}

	function destroy() {
		const index = createDebug.instances.indexOf(this);
		if (index !== -1) {
			createDebug.instances.splice(index, 1);
			return true;
		}
		return false;
	}

	function extend(namespace, delimiter) {
		const newDebug = createDebug(this.namespace + (typeof delimiter === 'undefined' ? ':' : delimiter) + namespace);
		newDebug.log = this.log;
		return newDebug;
	}

	/**
	* Enables a debug mode by namespaces. This can include modes
	* separated by a colon and wildcards.
	*
	* @param {String} namespaces
	* @api public
	*/
	function enable(namespaces) {
		createDebug.save(namespaces);

		createDebug.names = [];
		createDebug.skips = [];

		let i;
		const split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
		const len = split.length;

		for (i = 0; i < len; i++) {
			if (!split[i]) {
				// ignore empty strings
				continue;
			}

			namespaces = split[i].replace(/\*/g, '.*?');

			if (namespaces[0] === '-') {
				createDebug.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
			} else {
				createDebug.names.push(new RegExp('^' + namespaces + '$'));
			}
		}

		for (i = 0; i < createDebug.instances.length; i++) {
			const instance = createDebug.instances[i];
			instance.enabled = createDebug.enabled(instance.namespace);
		}
	}

	/**
	* Disable debug output.
	*
	* @return {String} namespaces
	* @api public
	*/
	function disable() {
		const namespaces = [
			...createDebug.names.map(toNamespace),
			...createDebug.skips.map(toNamespace).map(namespace => '-' + namespace)
		].join(',');
		createDebug.enable('');
		return namespaces;
	}

	/**
	* Returns true if the given mode name is enabled, false otherwise.
	*
	* @param {String} name
	* @return {Boolean}
	* @api public
	*/
	function enabled(name) {
		if (name[name.length - 1] === '*') {
			return true;
		}

		let i;
		let len;

		for (i = 0, len = createDebug.skips.length; i < len; i++) {
			if (createDebug.skips[i].test(name)) {
				return false;
			}
		}

		for (i = 0, len = createDebug.names.length; i < len; i++) {
			if (createDebug.names[i].test(name)) {
				return true;
			}
		}

		return false;
	}

	/**
	* Convert regexp to namespace
	*
	* @param {RegExp} regxep
	* @return {String} namespace
	* @api private
	*/
	function toNamespace(regexp) {
		return regexp.toString()
			.substring(2, regexp.toString().length - 2)
			.replace(/\.\*\?$/, '*');
	}

	/**
	* Coerce `val`.
	*
	* @param {Mixed} val
	* @return {Mixed}
	* @api private
	*/
	function coerce(val) {
		if (val instanceof Error) {
			return val.stack || val.message;
		}
		return val;
	}

	createDebug.enable(createDebug.load());

	return createDebug;
}

module.exports = setup;

},{"ms":"IfYP"}],"g5IB":[function(require,module,exports) {

// shim for using process in browser
var process = module.exports = {}; // cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
  throw new Error('setTimeout has not been defined');
}

function defaultClearTimeout() {
  throw new Error('clearTimeout has not been defined');
}

(function () {
  try {
    if (typeof setTimeout === 'function') {
      cachedSetTimeout = setTimeout;
    } else {
      cachedSetTimeout = defaultSetTimout;
    }
  } catch (e) {
    cachedSetTimeout = defaultSetTimout;
  }

  try {
    if (typeof clearTimeout === 'function') {
      cachedClearTimeout = clearTimeout;
    } else {
      cachedClearTimeout = defaultClearTimeout;
    }
  } catch (e) {
    cachedClearTimeout = defaultClearTimeout;
  }
})();

function runTimeout(fun) {
  if (cachedSetTimeout === setTimeout) {
    //normal enviroments in sane situations
    return setTimeout(fun, 0);
  } // if setTimeout wasn't available but was latter defined


  if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
    cachedSetTimeout = setTimeout;
    return setTimeout(fun, 0);
  }

  try {
    // when when somebody has screwed with setTimeout but no I.E. maddness
    return cachedSetTimeout(fun, 0);
  } catch (e) {
    try {
      // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
      return cachedSetTimeout.call(null, fun, 0);
    } catch (e) {
      // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
      return cachedSetTimeout.call(this, fun, 0);
    }
  }
}

function runClearTimeout(marker) {
  if (cachedClearTimeout === clearTimeout) {
    //normal enviroments in sane situations
    return clearTimeout(marker);
  } // if clearTimeout wasn't available but was latter defined


  if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
    cachedClearTimeout = clearTimeout;
    return clearTimeout(marker);
  }

  try {
    // when when somebody has screwed with setTimeout but no I.E. maddness
    return cachedClearTimeout(marker);
  } catch (e) {
    try {
      // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
      return cachedClearTimeout.call(null, marker);
    } catch (e) {
      // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
      // Some versions of I.E. have different rules for clearTimeout vs setTimeout
      return cachedClearTimeout.call(this, marker);
    }
  }
}

var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
  if (!draining || !currentQueue) {
    return;
  }

  draining = false;

  if (currentQueue.length) {
    queue = currentQueue.concat(queue);
  } else {
    queueIndex = -1;
  }

  if (queue.length) {
    drainQueue();
  }
}

function drainQueue() {
  if (draining) {
    return;
  }

  var timeout = runTimeout(cleanUpNextTick);
  draining = true;
  var len = queue.length;

  while (len) {
    currentQueue = queue;
    queue = [];

    while (++queueIndex < len) {
      if (currentQueue) {
        currentQueue[queueIndex].run();
      }
    }

    queueIndex = -1;
    len = queue.length;
  }

  currentQueue = null;
  draining = false;
  runClearTimeout(timeout);
}

process.nextTick = function (fun) {
  var args = new Array(arguments.length - 1);

  if (arguments.length > 1) {
    for (var i = 1; i < arguments.length; i++) {
      args[i - 1] = arguments[i];
    }
  }

  queue.push(new Item(fun, args));

  if (queue.length === 1 && !draining) {
    runTimeout(drainQueue);
  }
}; // v8 likes predictible objects


function Item(fun, array) {
  this.fun = fun;
  this.array = array;
}

Item.prototype.run = function () {
  this.fun.apply(null, this.array);
};

process.title = 'browser';
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues

process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) {
  return [];
};

process.binding = function (name) {
  throw new Error('process.binding is not supported');
};

process.cwd = function () {
  return '/';
};

process.chdir = function (dir) {
  throw new Error('process.chdir is not supported');
};

process.umask = function () {
  return 0;
};
},{}],"jD9Y":[function(require,module,exports) {
var process = require("process");
/* eslint-env browser */

/**
 * This is the web browser implementation of `debug()`.
 */
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = localstorage();
/**
 * Colors.
 */

exports.colors = ['#0000CC', '#0000FF', '#0033CC', '#0033FF', '#0066CC', '#0066FF', '#0099CC', '#0099FF', '#00CC00', '#00CC33', '#00CC66', '#00CC99', '#00CCCC', '#00CCFF', '#3300CC', '#3300FF', '#3333CC', '#3333FF', '#3366CC', '#3366FF', '#3399CC', '#3399FF', '#33CC00', '#33CC33', '#33CC66', '#33CC99', '#33CCCC', '#33CCFF', '#6600CC', '#6600FF', '#6633CC', '#6633FF', '#66CC00', '#66CC33', '#9900CC', '#9900FF', '#9933CC', '#9933FF', '#99CC00', '#99CC33', '#CC0000', '#CC0033', '#CC0066', '#CC0099', '#CC00CC', '#CC00FF', '#CC3300', '#CC3333', '#CC3366', '#CC3399', '#CC33CC', '#CC33FF', '#CC6600', '#CC6633', '#CC9900', '#CC9933', '#CCCC00', '#CCCC33', '#FF0000', '#FF0033', '#FF0066', '#FF0099', '#FF00CC', '#FF00FF', '#FF3300', '#FF3333', '#FF3366', '#FF3399', '#FF33CC', '#FF33FF', '#FF6600', '#FF6633', '#FF9900', '#FF9933', '#FFCC00', '#FFCC33'];
/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */
// eslint-disable-next-line complexity

function useColors() {
  // NB: In an Electron preload script, document will be defined but not fully
  // initialized. Since we know we're in Chrome, we'll just detect this case
  // explicitly
  if (typeof window !== 'undefined' && window.process && (window.process.type === 'renderer' || window.process.__nwjs)) {
    return true;
  } // Internet Explorer and Edge do not support colors.


  if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
    return false;
  } // Is webkit? http://stackoverflow.com/a/16459606/376773
  // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632


  return typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // Is firebug? http://stackoverflow.com/a/398120/376773
  typeof window !== 'undefined' && window.console && (window.console.firebug || window.console.exception && window.console.table) || // Is firefox >= v31?
  // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
  typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31 || // Double check webkit in userAgent just in case we are in a worker
  typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
}
/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */


function formatArgs(args) {
  args[0] = (this.useColors ? '%c' : '') + this.namespace + (this.useColors ? ' %c' : ' ') + args[0] + (this.useColors ? '%c ' : ' ') + '+' + module.exports.humanize(this.diff);

  if (!this.useColors) {
    return;
  }

  const c = 'color: ' + this.color;
  args.splice(1, 0, c, 'color: inherit'); // The final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into

  let index = 0;
  let lastC = 0;
  args[0].replace(/%[a-zA-Z%]/g, match => {
    if (match === '%%') {
      return;
    }

    index++;

    if (match === '%c') {
      // We only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });
  args.splice(lastC, 0, c);
}
/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */


function log(...args) {
  // This hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return typeof console === 'object' && console.log && console.log(...args);
}
/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */


function save(namespaces) {
  try {
    if (namespaces) {
      exports.storage.setItem('debug', namespaces);
    } else {
      exports.storage.removeItem('debug');
    }
  } catch (error) {// Swallow
    // XXX (@Qix-) should we be logging these?
  }
}
/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */


function load() {
  let r;

  try {
    r = exports.storage.getItem('debug');
  } catch (error) {} // Swallow
  // XXX (@Qix-) should we be logging these?
  // If debug isn't set in LS, and we're in Electron, try to load $DEBUG


  if (!r && typeof process !== 'undefined' && 'env' in process) {
    r = undefined;
  }

  return r;
}
/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */


function localstorage() {
  try {
    // TVMLKit (Apple TV JS Runtime) does not have a window object, just localStorage in the global context
    // The Browser also has localStorage in the global context.
    return localStorage;
  } catch (error) {// Swallow
    // XXX (@Qix-) should we be logging these?
  }
}

module.exports = require('./common')(exports);
const {
  formatters
} = module.exports;
/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

formatters.j = function (v) {
  try {
    return JSON.stringify(v);
  } catch (error) {
    return '[UnexpectedJSONParseError]: ' + error.message;
  }
};
},{"./common":"MTTc","process":"g5IB"}],"bEsR":[function(require,module,exports) {
"use strict";

const debug = require("debug")("GdfsEvent");
/**
 * Event class
 * @constructor
 * @param {HTMLElement} target An element that dispatch
 * @param {string} eventName An event name
 */


function GdfsEvent(target, eventName) {
  this._target = target;
  this._eventName = eventName;
}
/**
 * Listen this event.
 * @param {Function} handler An event handler
 * @returns {undefined}
 */


GdfsEvent.prototype.listen = function (handler) {
  debug(`GdfsEvent.listen: ${this._eventName}=>${handler.constructor.name}`);

  if (handler.constructor.name === "AsyncFunction") {
    this._target.addEventListener(this._eventName, async event => await handler(event));
  } else {
    this._target.addEventListener(this._eventName, handler);
  }
};
/**
 * Fire this event.
 * @param {Function} handler An event handler
 * @returns {undefined}
 */


GdfsEvent.prototype.fire = function (extraData = {}) {
  const event = new Event(this._eventName);

  for (const key of Object.keys(extraData)) {
    event[key] = extraData[key];
  }

  debug(`GdfsEvent.fire: ${this._eventName}`, `extraData: ${JSON.stringify(extraData)}`);

  this._target.dispatchEvent(event);
};

module.exports = GdfsEvent;
},{"debug":"jD9Y"}],"B8ln":[function(require,module,exports) {
"use strict";

const debug = require("debug")("GdfsPath");

debug("loading");
/**
 * Gdfs Path class.
 * @constructor
 * @param {string|undefined} pathname initial path.
 */

function GdfsPath(pathname) {
  this._lastSlash = true;
  this._absolute = true;
  this._paths = [];

  if (pathname != undefined) {
    this.parse(pathname);
  }
}
/**
 * Get a part of path.
 * @returns {GdfsPath} A path object including only path.
 */


GdfsPath.prototype.getPathPart = function () {
  if (this._lastSlash) {
    return new GdfsPath(this.toString());
  }

  const paths = this.elements();
  paths.splice(-1, 1, "");
  debug(`getPathPart: paths: ${JSON.stringify(paths)}`);
  return new GdfsPath(paths.join("/"));
};
/**
 * Get filename part of path.
 * @returns {string} A filename.
 */


GdfsPath.prototype.getFilename = function () {
  return this.elements().pop();
};
/**
 * Get paths elements.
 * @returns {Array<string>} the elements.
 */


GdfsPath.prototype.elements = function () {
  const elements = this._paths.map(item => item);

  if (this._absolute) {
    elements.unshift("");
  }

  if (this._lastSlash) {
    elements.push("");
  }

  return elements;
};
/**
 * Create a new path object with joining the two paths.
 * 
 * @param {Array<GdfsPath>} paths The paths to join.
 * @returns {GdfsPath} The path that was joined.
 */


GdfsPath.merge = (...paths) => {
  debug(`Gdfs.merge: ${paths.map(p => p.toString()).join(" | ")}`);
  return paths.reduce((pathA, pathB, index) => {
    debug(`Gdfs.merge: Reducing #${index}`);
    debug(`Gdfs.merge: pathA: ${pathA.toString()}`);
    debug(`Gdfs.merge: pathB: ${pathB.toString()}`);

    if (typeof pathA === "string") {
      pathA = new GdfsPath(pathA);
    }

    if (typeof pathB === "string") {
      pathB = new GdfsPath(pathB);
    }

    const a = pathA.toString();
    const b = pathB.toString();

    if (pathB.isAbsolute()) {
      debug(`returns ${b}`);
      return new GdfsPath(b);
    }

    const joined = new GdfsPath([a, b].join("/"));
    debug(`Gdfs.merge: returns ${joined.toString()}`);
    return joined;
  });
};

const split_path = pathname => {
  const paths = [];
  let escaped = false;
  let i = 0;
  let element = "";
  let chars = pathname.split("");

  while (i < chars.length) {
    const c = chars[i];

    if (escaped) {
      element += c;
      escaped = false;
    } else if (c === "\\") {
      escaped = true;
    } else if (c === "/") {
      paths.push(element);
      element = "";
    } else {
      element += c;
    }

    i++;
  }

  paths.push(element);

  if (escaped) {
    throw new Error(`Invalid pathname ${pathname}`);
  }

  if (paths.length == 0) {
    throw new Error("Invalid pathname. It should not be empty.");
  }

  return paths;
};
/**
 * Set a path repersented by a string.
 * @param {string} pathname A path name to parse
 * @return {undefined}
 */


GdfsPath.prototype.parse = function (pathname) {
  let paths = split_path(pathname.replace(/\/+/g, "/"));
  debug(`parse ${JSON.stringify(pathname)} => ${JSON.stringify(paths)}`);
  const lastSlash = paths[paths.length - 1] === "";
  const absolute = paths[0] === "";

  if (lastSlash) {
    paths.pop();
  }

  if (absolute) {
    paths.shift();
  }

  this._lastSlash = !!lastSlash;
  this._absolute = !!absolute;

  for (;;) {
    let replacement = false;

    if (paths.length >= 2) {
      paths = paths.reduce((acc, next) => {
        if (!Array.isArray(acc)) {
          acc = [acc];
        }

        const last = acc[acc.length - 1];

        if (last !== ".." && next === "..") {
          acc.pop();
          replacement = true;
        } else if (last !== "." && next === ".") {
          replacement = true;
        } else {
          acc.push(next);
        }

        return acc;
      });
    }

    if (!replacement) {
      this._paths = paths;
      debug(`this._paths:${JSON.stringify(this._paths)}`);
      break;
    }
  }
};
/**
 * Returns if this represents an absolute path.
 * @returns {Boolean} True if this represents an absolute path, otherwise false.
 */


GdfsPath.prototype.isAbsolute = function () {
  return this._absolute;
};
/**
 * Returns if this represents a directory.
 * @returns {Boolean} True if this represents a directory, otherwise false.
 */


GdfsPath.prototype.isDirSpec = function () {
  return this._lastSlash;
};
/**
 * Returns a path represented by string.
 * @returns {string} The path that this is representing.
 */


GdfsPath.prototype.toString = function () {
  if (this._paths.length === 0) {
    return "/";
  }

  const rootSpec = this._absolute ? "/" : "";
  const dirSpec = this._lastSlash ? "/" : "";
  const pathname = `${rootSpec}${this._paths.join("/")}${dirSpec}`;
  return pathname;
};

module.exports = GdfsPath;
},{"debug":"jD9Y"}],"YTm0":[function(require,module,exports) {
/*global gapi:false*/
"use strict";

const debug = require("debug")("gdfs");

debug("loading");

const GdfsEvent = require("./gdfs-event.js");

const GdfsPath = require("./gdfs-path.js");
/**
 * Gdfs class is an interface for the Google Drive API v3.
 *
 * The instance manages a current working directory(CWD) and offers methods
 * to operate files and folders on the Google Drive by its pathname.
 *
 * Before creating an instance, the APIs must be loaded by the class method
 * [`loadApi`](#.loadApi) with a ClientId and ApiKey.
 * These had to be created in a project of Google devloper Console.
 *
 * And to operates files, user must sign-in with the Google account.
 * See [signIn](#.signIn) and [signOut](#.signOut).
 *
 * Instance's CWD is initialized to the root on constructor. It can be changed
 * by [chdir](#chdir) method. When it is changed, the 'oncwdupdate' callback
 * is fired. To know where the CWD is, The [cwd](#cwd) method is available.
 *
 * @constructor
 */


function Gdfs() {
  this._oncwdupdate = null;
  this._currentPath = [{
    id: "root",
    name: ""
  }];
}
/**
 * Create Gdfs client.
 * @returns {Gdfs} The google drive interface that has a current directory.
 */


Gdfs.createClient = () => {
  return new Gdfs();
};
/**
 * signInStatusChangeEvent
 * @type {GdfsEvent}
 */


Gdfs.signInStatusChangeEvent = new GdfsEvent(window, "gdfs-signin-status-change");
/**
 * Load Google Drive APIs and initialize its client object.
 *
 * The loaded all APIs are accessible with a global `gapi` object.
 * But it is wrapped by this class so the users should not use it directly.
 *
 * @param {string} clientId A clientId from the Developer console.
 * @param {string} clientSecret An clientSecret from the Developer console.
 * @returns {Promise} A promise that will be resolved when the loading completed.
 */

Gdfs.loadApi = (clientId, clientSecret) => {
  debug("Start of Gdfs.loadApi");
  const script = document.createElement("SCRIPT");
  script.setAttribute("async", "async");
  script.setAttribute("src", "https://apis.google.com/js/api.js");
  const p = new Promise((resolve, reject) => {
    script.addEventListener("load", () => {
      script.onload = () => {};

      gapi.load("client:auth2", async () => {
        debug("initialize gapi.client");

        if (typeof clientId === "object" && clientSecret == null && "clientId" in clientId && "clientSecret" in clientId && "discoveryDocs" in clientId && "scope" in clientId) {
          await gapi.client.init(clientId);
        } else {
          await gapi.client.init({
            clientId,
            clientSecret,
            discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
            scope: ["https://www.googleapis.com/auth/drive", "https://www.googleapis.com/auth/drive.appdata", "https://www.googleapis.com/auth/drive.file", "https://www.googleapis.com/auth/drive.metadata", "https://www.googleapis.com/auth/drive.metadata.readonly", "https://www.googleapis.com/auth/drive.photos.readonly", "https://www.googleapis.com/auth/drive.readonly"].join(" ")
          });
        }

        gapi.auth2.getAuthInstance().isSignedIn.listen(() => {
          debug("the signed-in-status changed");
          Gdfs.signInStatusChangeEvent.fire();
        });
        Gdfs.signInStatusChangeEvent.fire();
        debug(`Gdfs.loadApi SignedIn: ${Gdfs.isSignedIn()}`);
        debug("Gdfs.loadApi is resolved");
        resolve();
      });
    });
    script.addEventListener("readystatechange", () => {
      debug(`readystatechange ${script.readyState}`);

      if (script.readyState === "complete") {
        script.onload();
      }
    });

    script.onerror = event => {
      debug("Gdfs.loadApi is rejected");
      reject(new URIError(`The script ${event.target.src} is not accessible.`));
    };

    document.body.appendChild(script);
  });
  debug("End of Gdfs.loadApi");
  return p;
};
/**
 * A mime type of the Google Drive's folder.
 * @type {string}
 */


Gdfs.mimeTypeFolder = "application/vnd.google-apps.folder";
/**
 * Check if gapi was signed in.
 * @returns {boolean} true if gapi is signed in, otherwise false.
 */

Gdfs.isSignedIn = () => {
  return gapi.auth2.getAuthInstance().isSignedIn.get();
};
/**
 * Sign in to Google Drive.
 * @async
 * @returns {undefined}
 */


Gdfs.signIn = async () => {
  return await gapi.auth2.getAuthInstance().signIn();
};
/**
 * Sign out from the Google Drive.
 * @async
 * @returns {undefined}
 */


Gdfs.signOut = async () => {
  return await gapi.auth2.getAuthInstance().signOut();
};
/**
 * Get file list.
 * @async
 * @param {object} queryParameters The parameters for the API.
 * @returns {Promise<object>} The result of the API.
 */


Gdfs.getFileList = async queryParameters => {
  const response = await gapi.client.drive.files.list(queryParameters);
  return response.result;
};
/**
 * Find a folder by name from a folder.
 * @async
 * @param {string} parentFolderId A parent folder id.
 * @param {string} folderName A folder name to find
 * @returns {Array<object>} A folder list that found.
 */


Gdfs.findFolderByName = async (parentFolderId, folderName) => {
  debug("No tests pass: Gdfs.findFolderByName");
  const folders = [];
  const q = [`parents in '${parentFolderId}'`, `name = '${folderName}'`, `mimeType = '${Gdfs.mimeTypeFolder}'`, "trashed = false"].join(" and ");
  const params = {
    "pageSize": 10,
    "pageToken": null,
    "q": q,
    "fields": "nextPageToken, " + "files(id, name, mimeType, webContentLink, webViewLink)"
  };
  debug(`${JSON.stringify(params)}`);

  try {
    do {
      const result = await Gdfs.getFileList(params);
      debug(`${JSON.stringify(result)}`);

      for (const file of result.files) {
        folders.push(file);
      }

      params.pageToken = result.nextPageToken;
    } while (params.pageToken != null);
  } catch (err) {
    debug(err.stack);
  }

  return folders;
};
/**
 * Find a file by name from a folder.
 * @async
 * @param {string} parentFolderId A parent folder id.
 * @param {string} fileName A file name to find
 * @returns {Promise<Array<object> >} A folder list that found.
 */


Gdfs.findFileByName = async (parentFolderId, fileName) => {
  debug("No tests pass: Gdfs.findFileByName");
  const files = [];
  const q = [`parents in '${parentFolderId}'`, `name = '${fileName}'`, "trashed = false"].join(" and ");
  const params = {
    "pageSize": 10,
    "pageToken": null,
    "q": q,
    "fields": "nextPageToken, " + "files(id, name, mimeType, webContentLink, webViewLink)"
  };
  debug(`findFileByName: params: ${JSON.stringify(params, null, "  ")}`);

  do {
    const result = await Gdfs.getFileList(params);

    for (const file of result.files) {
      debug(`findFileByName: found file: ${JSON.stringify(file)}`);
      files.push(file);
    }

    debug(`findFileByName: result.nextPageToken: ${result.nextPageToken}`);
    params.pageToken = result.nextPageToken;
  } while (params.pageToken != null);

  return files;
};
/**
 * Get file resource.
 * @async
 * @param {object} queryParameters The parameters for the API.
 * @returns {Promise<object>} The result of the API.
 */


Gdfs.getFileResource = async parameters => {
  const response = await gapi.client.drive.files.get(parameters);
  return response.result;
};
/**
 * Check if the file is a folder.
 * @param {object} file The file object provided from the result
 * of `getFileList` method.
 * @returns {boolean} The file is a folder or not.
 */


Gdfs.isFolder = file => {
  return file.mimeType === Gdfs.mimeTypeFolder;
};
/**
 * Get a file content as text from Google Drive.
 * Even if the file is not a text actually, it could be converted
 * to ArrayBuffer, Blob or JSON to use by Web App.
 * @param {string} fileId The file id to download.
 * @param {boolean|null} acknowledgeAbuse A user acknowledgment
 * status for the potential to abuse. This parameter is optional.
 * default value is false.
 * @returns {Promise<string>} A downloaded content as text.
 */


Gdfs.downloadFile = (fileId, acknowledgeAbuse) => {
  return requestWithAuth("GET", "https://www.googleapis.com/drive/v3/files/" + fileId, {
    alt: "media",
    acknowledgeAbuse: acknowledgeAbuse
  });
};
/**
 * Create a new file's resource.
 * @param {string} folderId The folder id where the file is created.
 * @param {string} filename The file name.
 * @param {string} mimeType The mime type for the new file.
 * @returns {Promise<object>} The response of the API.
 */


Gdfs.createFile = async (folderId, filename, mimeType) => {
  const response = await requestWithAuth("POST", "https://www.googleapis.com/drive/v3/files", {}, {
    "Content-Type": "application/json"
  }, JSON.stringify({
    name: filename,
    mimeType: mimeType,
    parents: [folderId]
  }));
  return JSON.parse(response);
};
/**
 * Upload a file content to update a existing file.
 * @param {string} fileId The file id to update.
 * @param {string} mimeType The content type of the file.
 * @param {any} data The file content.
 * @returns {Promise<object>} The response of the API.
 */


Gdfs.updateFile = async (fileId, mimeType, data) => {
  const response = await requestWithAuth("PATCH", "https://www.googleapis.com/upload/drive/v3/files/" + fileId, {
    uploadType: "media"
  }, {
    "Content-Type": mimeType
  }, data);
  return JSON.parse(response);
};
/**
 * @param {string} method The request method.
 * @param {string} endpoint The endpoint of API.
 * @param {object} queryParams The query parameters.
 * @param {object} headers The request headers.
 * @param {any} body The request body.
 * @returns {Promise<object>} The response of the request.
 */


const requestWithAuth = (method, endpoint, queryParams, headers, body) => {
  let xhr = new XMLHttpRequest();
  xhr.open(method, createUrl(endpoint, queryParams), true);
  headers = headers || {};
  Object.keys(headers).forEach(name => {
    xhr.setRequestHeader(name, headers[name]);
  });
  xhr.setRequestHeader("Authorization", "Bearer " + getAccessToken());
  xhr.timeout = 30000;
  return new Promise((resolve, reject) => {
    xhr.onload = () => {
      resolve(xhr.responseText);
    };

    xhr.onerror = () => {
      reject(new Error(xhr.statusText));
    };

    xhr.ontimeout = () => {
      reject(new Error("request timeout"));
    };

    xhr.send(body);
  });
};
/**
 * Get access-token on current session.
 * @returns {string} The access token.
 */


const getAccessToken = () => {
  const googleUser = gapi.auth2.getAuthInstance().currentUser.get();
  const authResponse = googleUser.getAuthResponse(true);
  const accessToken = authResponse.access_token;
  return accessToken;
};
/**
 * Create URI including query parameters.
 * @param {string} endpoint The endpoint of API.
 * @param {object|null} params The query parameters.
 * @returns {string} The URI.
 */


const createUrl = (endpoint, params) => {
  if (params == null) {
    return endpoint;
  }

  let keys = Object.keys(params).filter(key => key !== "");

  if (keys.length == 0) {
    return endpoint;
  }

  let queryString = keys.map(key => {
    let value = params[key];
    return value == null ? null : `${key}=${encodeURI(value)}`;
  }).join("&");
  return `${endpoint}?${queryString}`;
};
/**
 * Get actual root folder id.
 * @async
 * @return {Promise<string>} The root folder's id
 */


Gdfs.getActualRootFolderId = async () => {
  const res = await Gdfs.getFileResource({
    fileId: "root",
    fields: "id"
  });
  debug(`getActualRootFolderId: res ${JSON.stringify(res, null, "  ")}`);
  return res.id;
};
/**
 * Set oncwdchage callback hander.
 * @param {FUnction|AsyncFunction} handler a function to be invoked when
 *      the current directory is changed.
 * @returns {undefined|Function} the previous handler will be returned.
 */


Gdfs.prototype.onCwdUpdate = function (handler) {
  const prev = this._oncwdupdate;

  if (handler != null) {
    this._oncwdupdate = handler;
  }

  return prev;
};
/**
 * Fire cwdUpdate.
 * @returns {Promise} what the handler returns.
 */


Gdfs.prototype.fireCwdUpdate = async function () {
  if (this._oncwdupdate) {
    try {
      const result = this._oncwdupdate();

      if (result != null) {
        if (result.constructor === Promise) {
          return await result;
        }

        return result;
      }
    } catch (err) {
      debug(err.stack);
    }
  }
};
/**
 * Get current folder id.
 * @returns {string} The folder id that the instance is.
 */


Gdfs.prototype.getCurrentFolderId = function () {
  return this._currentPath.slice(-1)[0].id;
};
/**
 * Get current working directory as path object.
 * @returns {GdfsPath} the current working directory.
 */


Gdfs.prototype.getCurrentPath = function () {
  const path = this._currentPath.map(path => `${path.name}/`).join("");

  const cwd = new GdfsPath(path);
  debug(`getCurrentPath: ${cwd.toString()}`);
  return cwd;
};
/**
 * Set current working directory with path object.
 * @async
 * @param {GdfsPath} path the new current working directory.
 * @returns {Promise<boolean>} the status of the operation.
 */


Gdfs.prototype.setCurrentPath = async function (path) {
  debug("No tests pass: Gdfs#setCurrentPath");
  debug(`setCurrentPath(${path})`);

  if (!path.isAbsolute()) {
    debug(`The path must be absolute. ${path}`);
    return false;
  }

  if (!(await this.isDirectory(path))) {
    debug(`${path} is not a directory`);
    return false;
  }

  this._currentPath = await this.getPaths(path);
  await this.fireCwdUpdate();
  return true;
};
/**
 * Get an array of path element from root directory.
 * @async
 * @param {GdfsPath} path path object.
 * @returns {Promise<Array<object> >} the array of the object having an id and
 *      the name.
 */


Gdfs.prototype.getPaths = async function (path) {
  debug("No tests pass: Gdfs#getPaths");
  debug(`getPaths(${path})`);

  if (!path.isAbsolute()) {
    debug("getPaths: Error: the path must be absolute");
    return null;
  }

  const paths = [{
    id: "root",
    name: "",
    mimeType: Gdfs.mimeTypeFolder
  }];

  for (const name of path.elements().slice(1)) {
    if (name === "") {
      break;
    }

    const parent = paths.slice(-1)[0];
    debug(`name: ${name}, parent: ${JSON.stringify(parent)}`);
    const path = {
      id: null,
      name: null,
      mimeType: null
    };

    if (parent.id != null) {
      const children = await Gdfs.findFileByName(parent.id, name);

      if (children.length > 0) {
        const child = children.shift();
        path.id = child.id;
        path.name = child.name;
        path.mimeType = child.mimeType;
      }
    }

    paths.push(path);
  }

  debug(`getPaths: ${JSON.stringify(paths, null, "  ")}`);
  return paths;
};
/**
 * Get the file object that the path points to.
 * @param {GdfsPath} path the path.
 * @returns {file} the file object of google drive.
 */


Gdfs.prototype.getFileOfPath = async function (path) {
  const paths = await this.getPaths(path);

  if (!paths) {
    return null;
  }

  return paths.slice(-1)[0];
};
/**
 * Get the current working directory of gdrive-fs.
 * @returns {string} The current working directory.
 */


Gdfs.prototype.cwd = function () {
  return this.getCurrentPath().toString();
};
/**
 * Changes the current working directory of this client session.
 * @param {string} directory A pathname to operate.
 * @async
 * @returns {Promise<boolean>} the status of the operation.
 */


Gdfs.prototype.chdir = async function (directory) {
  debug("No tests pass: Gdfs#chdir");
  const cwd = this.getCurrentPath();
  const next_cwd = GdfsPath.merge(cwd, new GdfsPath(directory));
  return await this.setCurrentPath(next_cwd);
};
/**
 * Move current directory to root, parent or one of children.
 * @async
 * @param {string} folderId A destination file id to move.
 *      To move to parent, ".." is available.
 * @returns {Promise<boolean>} the status of the operation.
 */


Gdfs.prototype.chdirById = async function (folderId) {
  debug(`Gdfs.chdirById( ${folderId} )`);

  if (folderId === ".") {
    return true;
  }

  const currentFolderId = this.getCurrentFolderId();

  if (folderId === "/" || folderId === "root") {
    this._currentPath = [{
      id: "root",
      name: ""
    }];
    await this.fireCwdUpdate();
  } else if (folderId === "..") {
    if (currentFolderId === "root") {
      debug("Could not move to upper folder from root.");
      return false;
    }

    this._currentPath.pop();

    await this.fireCwdUpdate();
  } else if (folderId !== currentFolderId) {
    const paths = [];
    const root = await Gdfs.getFileResource({
      fileId: "root",
      fields: "id"
    });
    let searchId = folderId;

    for (;;) {
      const file = await Gdfs.getFileResource({
        fileId: searchId,
        fields: "id, name, parents, mimeType"
      });

      if (file == null) {
        debug(`folder ${searchId} is not found.`);
        return false;
      }

      if (file.mimeType !== Gdfs.mimeTypeFolder) {
        debug(`folder ${searchId} is not folder.`);
        return false;
      }

      debug(JSON.stringify(file, null, "  "));

      if (file.id == root.id) {
        paths.unshift({
          id: "root",
          name: ""
        });
        break;
      } else {
        paths.unshift({
          id: file.id,
          name: file.name
        });
      }

      searchId = file.parents.shift();
    }

    debug(JSON.stringify(paths, null, "  "));
    this._currentPath = paths;
    await this.fireCwdUpdate();
  }

  return true;
};
/**
 * Check the path is a directory.
 * @async
 * @param {GdfsPath} path A path to check
 * @returns {Promise<Boolean>} The path is a directory or not.
 */


Gdfs.prototype.isDirectory = async function (path) {
  debug("No tests pass: Gdfs#isDirectory");
  const file = await this.getFileOfPath(this.toAbsolutePath(path));

  if (!file) {
    return false;
  }

  return file.mimeType === Gdfs.mimeTypeFolder;
};
/**
 * Convert to absolute path.
 * @param {GdfsPath} path path to be converted
 * @returns {GdfsPath} An absolute path
 */


Gdfs.prototype.toAbsolutePath = function (path) {
  debug("No tests pass: Gdfs#toAbsolutePath");

  if (path.isAbsolute()) {
    return path;
  }

  const cwd = this.getCurrentPath();
  return GdfsPath.merge(cwd, path);
};
/**
 * Read the directory to get a list of filenames.
 *
 * This method may not returns all files in the directory.
 * To know all files were listed, check the `pageToken` field in the parameter
 * `options` after the invocation.
 * If the reading was completed, the field would be set `null`.
 * The rest files unread will be returned at the next invocation with same
 * parameters.
 *
 * ```javascript
 * const readDirAll = async path => {
 *     const opts = { pageSize: 10, pageToken: null };
 *     const files = [];
 *     do {
 *        for(const fn of await files.readdir(path, opts)) {
 *            files.push(fn);
 *        }
 *     } while(opts.pageToken != null);
 * };
 * ```
 *
 * @async
 * @since v1.1.0
 * @param {string} path A path to the directory.
 *
 * @param {object|null} options (Optional) options for this method.
 *
 * Only two fields are available:
 *
 * * "pageSize": Set maximum array size that this method returns at one
 * time.  The default value 10 will be used if this is not specified or
 * zero or negative value is specified.
 * * "pageToken": Set null to initial invocation to read from first
 * entry. This would be updated other value if the unread files are
 * remained. The value is used for reading next files. User should not
 * set the value except for null.
 *
 * If this parameter is ommited, all files will be read.
 * This is not recomended feature for the directory that has a number of files.
 *
 * @returns {Promise<Array<string> >} returns an array of filenames.
 */


Gdfs.prototype.readdir = async function (path, options) {
  path += path.match(/\/$/) ? "" : "/";
  const absPath = this.toAbsolutePath(new GdfsPath(path));
  const parentFolder = await this.getFileOfPath(absPath.getPathPart());
  debug(`readdir: parentFolder: ${JSON.stringify(parentFolder)}`);

  if (!parentFolder || parentFolder.id == null) {
    debug(`readdir: The path not exists ${path}`);
    return null;
  }

  if (!Gdfs.isFolder(parentFolder)) {
    debug(`readdir: The path is not a folder ${path}`);
    return null;
  }

  const files = [];
  const readAll = options == null;
  options = options || {};
  const pageSize = options.pageSize || 10;
  let pageToken = options.pageToken || null;

  const readFiles = async params => {
    debug(`readdir: params: ${JSON.stringify(params, null, "  ")}`);
    const result = await Gdfs.getFileList(params);
    debug(`readdir: result.nextPageToken: ${result.nextPageToken}`);

    for (const file of result.files) {
      files.push(file.name);
    }

    return result.nextPageToken;
  };

  const params = {
    "pageSize": pageSize <= 0 ? 10 : pageSize,
    "pageToken": pageToken,
    "q": `parents in '${parentFolder.id}' and trashed = false`,
    "fields": "nextPageToken, files(name)"
  };

  if (!readAll) {
    // eslint-disable-next-line require-atomic-updates
    options.pageToken = await readFiles(params);
  } else {
    do {
      // eslint-disable-next-line require-atomic-updates
      options.pageToken = await readFiles(params);
    } while (options.pageToken != null);
  }

  debug(`readdir: files: ${JSON.stringify(files)}`);
  return files;
};
/**
 * Get file's properties.
 * It is a file resource of Google Drive including id, name, mimeType,
 * webContentLink and webViewLink about the file or directory.
 *
 * @async
 * @param {string} path A pathname.
 * @returns {File} The file resource of Google Drive including id, name,
 *      mimeType, webContentLink and webViewLink about the file or directory.
 * @since v1.1.0
 */


Gdfs.prototype.stat = async function (path) {
  debug(`Gdfs#stat(${path})`);
  path = path.replace(/\/+$/, "");
  const absPath = this.toAbsolutePath(new GdfsPath(path));
  debug(`stat: absPath: ${absPath.toString()}`);
  path = absPath.toString();

  if (path === "/") {
    const file = await Gdfs.getFileResource({
      fileId: "root",
      fields: "id, name, mimeType, webContentLink, webViewLink"
    });
    debug(`stat: file ${JSON.stringify(file)}`);
    return file;
  }

  const parentFolder = await this.getFileOfPath(absPath.getPathPart());
  debug(`stat: parentFolder: ${JSON.stringify(parentFolder)}`);

  if (!parentFolder || parentFolder.id == null) {
    debug(`stat: The path not exists ${path}`);
    return null;
  }

  const filename = absPath.getFilename();
  debug(`stat: filename: ${filename}`);
  const files = await Gdfs.findFileByName(parentFolder.id, filename);

  if (files.length === 0) {
    debug(`stat: File not found ${path}`);
    return null;
  }

  const file = files.shift();
  debug(`stat: file ${JSON.stringify(file)}`);
  return file;
};
/**
 * Read a file.
 * The file must have webContentLink in its resource to read the contents,
 * To get the resource, Use [`Gdfs#stat`](#stat).
 *
 * @async
 * @param {string} path A pathname to operate.
 * @returns {Promise<string>} The file content.
 */


Gdfs.prototype.readFile = async function (path) {
  debug(`Gdfs#readFile(${path})`);
  const absPath = this.toAbsolutePath(new GdfsPath(path));
  const parentFolder = await this.getFileOfPath(absPath.getPathPart());
  debug(`readFile: parentFolder: ${JSON.stringify(parentFolder)}`);

  if (!parentFolder || parentFolder.id == null) {
    debug(`readFile: The path not exists ${path}`);
    return null;
  }

  const filename = absPath.getFilename();
  debug(`readFile: filename: ${filename}`);
  const files = await Gdfs.findFileByName(parentFolder.id, filename);
  debug(`readFile: files: ${JSON.stringify(files)}`);

  if (files.length === 0) {
    debug(`File not found ${path}`);
    return null;
  }

  const file = files.shift();

  if (!file.webContentLink) {
    debug(`File is not downloadable ${path}`);
    return null;
  }

  return await Gdfs.downloadFile(file.id);
};
/**
 * Make a directory.
 * @async
 * @param {string} path A pathname to operate.
 * @returns {Promise<object>} The API response.
 */


Gdfs.prototype.mkdir = async function (path) {
  debug(`mkdir(${path})`);
  path = path.replace(/\/+$/, "");
  const absPath = this.toAbsolutePath(new GdfsPath(path));
  const parentFolder = await this.getFileOfPath(absPath.getPathPart());
  debug(`mkdir: parentFolder ${JSON.stringify(parentFolder)}`);

  if (!parentFolder || parentFolder.id == null) {
    debug(`mkdir: The path not exists ${path}`);
    return null;
  }

  const pathname = absPath.getFilename();
  debug(`mkdir: pathname: ${pathname}`);
  const files = await Gdfs.findFileByName(parentFolder.id, pathname);
  debug(`mkdir: files: ${JSON.stringify(files)}`);

  if (files.length > 0) {
    debug(`mkdir: The directory exists ${path}`);
    return null;
  }

  const result = await Gdfs.createFile(parentFolder.id, pathname, Gdfs.mimeTypeFolder);

  if (parentFolder.id === this.getCurrentFolderId()) {
    await this.fireCwdUpdate();
  }

  return result;
};
/**
 * Remove the directory but not a normal file.
 * The operation will fail, if it is not a directory nor empty.
 * @async
 * @param {string} path A pathname to operate.
 * @returns {Promise<object|null>} Returns the API response.
 *      null means it was failed.
 */


Gdfs.prototype.rmdir = async function (path) {
  debug(`rmdir(${path})`);
  path = path.replace(/\/+$/, "");
  const absPath = this.toAbsolutePath(new GdfsPath(path));
  const parentFolder = await this.getFileOfPath(absPath.getPathPart());
  debug(`rmdir: parentFolder ${JSON.stringify(parentFolder)}`);

  if (!parentFolder || parentFolder.id == null) {
    debug(`rmdir: The path not exists ${path}`);
    return null;
  }

  const pathname = absPath.getFilename();
  debug(`rmdir: pathname: ${pathname}`);

  if (pathname === "") {
    debug(`rmdir: The root directory cannot be removed ${path}`);
    return null;
  }

  const dires = await Gdfs.findFolderByName(parentFolder.id, pathname);
  debug(`rmdir: dires: ${JSON.stringify(dires)}`);

  if (dires.length === 0) {
    debug(`rmdir: The directory not exists ${path}`);
    return null;
  }

  const dir = dires.shift();
  debug(`rmdir: dir ${JSON.stringify(dir)}`);
  debug(`rmdir: _currentPath ${JSON.stringify(this._currentPath, null, "  ")}`);

  if (this._currentPath.filter(parent => parent.id == dir.id).length > 0 || dir.id === (await Gdfs.getActualRootFolderId())) {
    debug(`rmdir: The path is a parent ${path}`);
    return null;
  }

  if (dir.mimeType !== Gdfs.mimeTypeFolder) {
    debug(`rmdir: The path is not folder ${path}`);
    return null;
  }

  const params = {
    "q": `parents in '${dir.id}' and trashed = false`,
    "fields": "files(id)"
  };
  debug(`rmdir: params ${JSON.stringify(params)}`);
  const children = await Gdfs.getFileList(params);
  debug(`rmdir: children: ${JSON.stringify(children, null, "  ")}`);

  if (children.files.length > 0) {
    debug(`rmdir: The folder is not empty ${path}`);
    return null;
  }

  const response = await gapi.client.drive.files.delete({
    fileId: dir.id
  });

  if (parentFolder.id === this.getCurrentFolderId()) {
    await this.fireCwdUpdate();
  }

  return response.result;
};
/**
 * Delete the file but not directory.
 * This does not move the file to the trash-box.
 *
 * @async
 * @param {string} path A pathname to operate.
 * @returns {Promise<object|null>} Returns the API response.
 *      null means it was failed.
 */


Gdfs.prototype.unlink = async function (path) {
  debug(`unlink(${path})`);
  const absPath = this.toAbsolutePath(new GdfsPath(path));
  const parentFolder = await this.getFileOfPath(absPath.getPathPart());
  debug(`unlink: parentFolder ${JSON.stringify(parentFolder)}`);

  if (!parentFolder || parentFolder.id == null) {
    debug(`unlink: The path not exists ${path}`);
    return null;
  }

  const pathname = absPath.getFilename();
  debug(`unlink: pathname: ${pathname}`);
  const files = await Gdfs.findFileByName(parentFolder.id, pathname);
  debug(`unlink: files: ${JSON.stringify(files)}`);

  if (files.length === 0) {
    debug(`unlink: The file not exists ${path}`);
    return null;
  }

  const file = files.shift();

  if (file.mimeType === Gdfs.mimeTypeFolder) {
    debug(`unlink: The file is a folder ${path}`);
    return null;
  }

  const response = await gapi.client.drive.files.delete({
    fileId: file.id
  });
  const result = response.result;

  if (parentFolder.id === this.getCurrentFolderId()) {
    await this.fireCwdUpdate();
  }

  return result;
};
/**
 * Write a file.
 * @async
 * @param {string} path A pathname to operate.
 * @param {string} mimeType A mimeType of the file content.
 * @param {string} data A file content.
 * @returns {Promise<object>} The API response.
 */


Gdfs.prototype.writeFile = async function (path, mimeType, data) {
  debug(`Gdfs#writeFile(${path},${mimeType}, ${JSON.stringify(data)})`);
  const absPath = this.toAbsolutePath(new GdfsPath(path));
  const parentFolder = await this.getFileOfPath(absPath.getPathPart());
  debug(`writeFile: parentFolder: ${JSON.stringify(parentFolder)}`);

  if (!parentFolder || parentFolder.id == null) {
    debug(`writeFile: The path not exists ${path}`);
    return null;
  }

  const filename = absPath.getFilename();
  debug(`writeFile: filename: ${filename}`);
  const files = await Gdfs.findFileByName(parentFolder.id, filename);
  debug(`writeFile: files: ${JSON.stringify(files)}`);

  if (files.length === 0) {
    const file = await Gdfs.createFile(parentFolder.id, filename, mimeType);
    const result = await Gdfs.updateFile(file.id, mimeType, data);

    if (parentFolder.id === this.getCurrentFolderId()) {
      await this.fireCwdUpdate();
    }

    return result;
  }

  const file = files.shift();

  if (file.mimeType === Gdfs.mimeTypeFolder) {
    debug(`writeFile: The path already exists as directory ${path}`);
    return null;
  }

  const result = await Gdfs.updateFile(file.id, mimeType, data);

  if (parentFolder.id === this.getCurrentFolderId()) {
    await this.fireCwdUpdate();
  }

  return result;
};

module.exports = Gdfs;
},{"debug":"jD9Y","./gdfs-event.js":"bEsR","./gdfs-path.js":"B8ln"}],"V4rw":[function(require,module,exports) {
"use strict";

const debug = require("debug")("gdfs-ui");

debug("loading");

const Gdfs = require("./gdfs.js");

const GdfsEvent = require("./gdfs-event.js");
/**
 * class GdfsUi
 * @constructor
 * @param {HTMLElement} The root element that UI widget will be built.
 * @param {Gdfs} The gapi client.
 */


function GdfsUi(element, opt) {
  debug("Start of GdfsUi ctor");
  this._element = element;
  this._gdfs = new Gdfs();
  this._pageSize = 10;
  this._trashed = false;
  this._pageToken = null;
  this._files = [];
  this._opt = {
    onFileListChange: () => {},
    onCurrentDirChange: () => {}
  };
  opt = opt || {};

  for (const key of Object.keys(this._opt)) {
    if (key in opt) {
      this._opt[key] = opt[key];
    }
  } // events


  this._fileListChangeEvent = new GdfsEvent(this._element, "gdfsui-filelist-change");
  this._currentDirChangeEvent = new GdfsEvent(this._element, "gdfsui-current-dir-change");

  this._currentDirChangeEvent.listen(this._opt.onCurrentDirChange);

  this._fileListChangeEvent.listen(this._opt.onFileListChange);

  this._gdfs.onCwdUpdate(async () => {
    debug("Start of _gdfs.onCwdUpdate");
    await this.reload();

    this._currentDirChangeEvent.fire();

    debug("End of _gdfs.onCwdUpdate");
  });

  const onSignedInStatusChange = async status => {
    debug("Start of signInStatusChange");

    if (status) {
      await this._gdfs.chdir("/");
    }

    debug("End of signInStatusChange");
  }; // Listen events


  Gdfs.signInStatusChangeEvent.listen(() => onSignedInStatusChange(Gdfs.isSignedIn()));
  onSignedInStatusChange(Gdfs.isSignedIn());
  debug("End of GdfsUi ctor");
}
/**
 * Returns the listing files in current directory is completed.
 * @returns {boolean} true if the listing files is completed.
 */


GdfsUi.prototype.isPageCompleted = function () {
  const status = this._pageToken == null;
  return status;
};
/**
 * Get current path as full path.
 * @returns {Array<string>} The array of file ids.
 */


GdfsUi.prototype.getCurrentPath = function () {
  return this._gdfs._currentPath;
};
/**
 * Get files list on current page.
 * @param {number} begin a file index
 * @param {number} end a file index
 * @returns {Array<File>} the files in current page.
 */


GdfsUi.prototype.getFiles = async function (begin, end) {
  debug(`GdfsUi#getFiles param:{begin:${begin}, end:${end})}`);
  debug(`_pageToken: ${this._pageToken}`);

  if (this._pageToken == null) {
    this._files = [];
  }

  while (end > this._files.length) {
    await this.readDir();

    this._fileListChangeEvent.fire();

    if (this._pageToken == null) {
      break;
    }
  }

  return this._files.slice(begin, end);
};
/**
 * Read the files on current directory.
 * @async
 * @returns {Promise<undefined>}
 */


GdfsUi.prototype.readDir = async function () {
  const andConditionsOfQuerySearchClauses = [`parents in '${this._gdfs.getCurrentFolderId()}'`, `trashed = ${this._trashed ? "true" : "false"}`];
  const queryParameters = {
    "pageSize": this._pageSize,
    "pageToken": this._pageToken,
    "q": andConditionsOfQuerySearchClauses.join(" and "),
    "fields": "nextPageToken, files(id, name, mimeType, webContentLink, webViewLink)"
  };
  const result = await Gdfs.getFileList(queryParameters);
  this._pageToken = result.nextPageToken;

  for (const file of result.files) {
    this._files.push(file);
  }
};
/**
 * Reload the file list.
 * @async
 * @returns {Promise} to sync
 */


GdfsUi.prototype.reload = async function () {
  this._pageToken = null;
  this._files = [];
  await this.readDir();

  this._fileListChangeEvent.fire();
};
/**
 * Move current directory to root, parent or one of children.
 * @param {string} folderId A destination file id to move.
 * To move to parent, ".." is available.
 * @returns {Promise<undefined>}
 */


GdfsUi.prototype.chdirById = async function (folderId) {
  await this._gdfs.chdirById(folderId);
};
/**
 * Get file resource.
 * @async
 * @param {string} fileId The file id of the target file.
 * @returns {Promise<object>} The resource object.
 */


GdfsUi.prototype.getFileResource = async function (fileId) {
  return await Gdfs.getFileResource({
    "fileId": fileId
  });
};
/**
 * Upload a file.
 * @param {File} file the file to be uploaded.
 * @return {Promise<File>} an uploaded File.
 */


GdfsUi.prototype.uploadFile = function (file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async () => {
      resolve((await this.writeFile(file.name, file.type, reader.result)));
    };

    reader.onerror = event => {
      reject(new Error(["Fail to upload. Could not read the file ", `${file.name}(${event.type}).`].join("")));
    };

    reader.readAsArrayBuffer(file);
  });
};
/**
 * Create or overwrite a file to current directory.
 * @param {string} filename The file name.
 * @param {string} mimeType The content type.
 * @param {any} data The file content.
 * @returns {Promise<object>} The response of update.
 */


GdfsUi.prototype.writeFile = async function (filename, mimeType, data) {
  // Find same file in current directory
  const fileIds = this._files.filter(file => file.name === filename).map(file => file.id);

  if (fileIds.length == 0) {
    //Create new file
    const response = await Gdfs.createFile(this._gdfs.getCurrentFolderId(), filename, mimeType);
    const file = JSON.parse(response);
    return await Gdfs.updateFile(file.id, mimeType, data);
  } // Overwrite the file


  return await Gdfs.updateFile(fileIds[0], mimeType, data);
};

module.exports = GdfsUi;
},{"debug":"jD9Y","./gdfs.js":"YTm0","./gdfs-event.js":"bEsR"}],"Focm":[function(require,module,exports) {
"use strict";

const debug = require("debug")("gdrive-fs");

const Gdfs = require("./lib/gdfs.js");

Gdfs.Ui = require("./lib/gdfs-ui.js");
Gdfs.Path = require("./lib/gdfs-path.js");

try {
  const context = Function("return this;")();

  if (context === window) {
    window.Gdfs = Gdfs;
  }
} catch (err) {
  debug(err.message);
}

module.exports = Gdfs;
},{"debug":"jD9Y","./lib/gdfs.js":"YTm0","./lib/gdfs-ui.js":"V4rw","./lib/gdfs-path.js":"B8ln"}]},{},["Focm"], null)