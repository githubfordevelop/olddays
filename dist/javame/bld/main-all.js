
/* SOURCE: polyfill/canvas-toblob.js */
/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */



if (inBrowser && !HTMLCanvasElement.prototype.toBlob) {
 Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
  value: function (callback, type, quality) {

    var binStr = atob( this.toDataURL(type, quality).split(',')[1] ),
        len = binStr.length,
        arr = new Uint8Array(len);

    for (var i=0; i<len; i++ ) {
     arr[i] = binStr.charCodeAt(i);
    }

    callback( new Blob( [arr], {type: type || 'image/png'} ) );
  }
 });
}


/* SOURCE: polyfill/fromcodepoint.js */
// Copyright Mathias Bynens <https://mathiasbynens.be/>
//
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

/*! https://mths.be/fromcodepoint v0.2.1 by @mathias */
if (!String.fromCodePoint) {
	(function() {
		var defineProperty = (function() {
			// IE 8 only supports `Object.defineProperty` on DOM elements
			try {
				var object = {};
				var $defineProperty = Object.defineProperty;
				var result = $defineProperty(object, object, object) && $defineProperty;
			} catch(error) {}
			return result;
		}());
		var stringFromCharCode = String.fromCharCode;
		var floor = Math.floor;
		var fromCodePoint = function(_) {
			var MAX_SIZE = 0x4000;
			var codeUnits = [];
			var highSurrogate;
			var lowSurrogate;
			var index = -1;
			var length = arguments.length;
			if (!length) {
				return '';
			}
			var result = '';
			while (++index < length) {
				var codePoint = Number(arguments[index]);
				if (
					!isFinite(codePoint) || // `NaN`, `+Infinity`, or `-Infinity`
					codePoint < 0 || // not a valid Unicode code point
					codePoint > 0x10FFFF || // not a valid Unicode code point
					floor(codePoint) != codePoint // not an integer
				) {
					throw RangeError('Invalid code point: ' + codePoint);
				}
				if (codePoint <= 0xFFFF) { // BMP code point
					codeUnits.push(codePoint);
				} else { // Astral code point; split in surrogate halves
					// https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
					codePoint -= 0x10000;
					highSurrogate = (codePoint >> 10) + 0xD800;
					lowSurrogate = (codePoint % 0x400) + 0xDC00;
					codeUnits.push(highSurrogate, lowSurrogate);
				}
				if (index + 1 == length || codeUnits.length > MAX_SIZE) {
					result += stringFromCharCode.apply(null, codeUnits);
					codeUnits.length = 0;
				}
			}
			return result;
		};
		if (defineProperty) {
			defineProperty(String, 'fromCodePoint', {
				'value': fromCodePoint,
				'configurable': true,
				'writable': true
			});
		} else {
			String.fromCodePoint = fromCodePoint;
		}
	}());
}


/* SOURCE: polyfill/codepointat.js */
// Copyright Mathias Bynens <https://mathiasbynens.be/>
//
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

/*! https://mths.be/codepointat v0.2.0 by @mathias */
if (!String.prototype.codePointAt) {
  (function() {
     // needed to support `apply`/`call` with `undefined`/`null`
    var defineProperty = (function() {
      // IE 8 only supports `Object.defineProperty` on DOM elements
      try {
        var object = {};
        var $defineProperty = Object.defineProperty;
        var result = $defineProperty(object, object, object) && $defineProperty;
      } catch(error) {}
      return result;
    }());
    var codePointAt = function(position) {
      if (this == null) {
        throw TypeError();
      }
      var string = String(this);
      var size = string.length;
      // `ToInteger`
      var index = position ? Number(position) : 0;
      if (index != index) { // better `isNaN`
        index = 0;
      }
      // Account for out-of-bounds indices:
      if (index < 0 || index >= size) {
        return undefined;
      }
      // Get the first code unit
      var first = string.charCodeAt(index);
      var second;
      if ( // check if it’s the start of a surrogate pair
        first >= 0xD800 && first <= 0xDBFF && // high surrogate
        size > index + 1 // there is a next code unit
      ) {
        second = string.charCodeAt(index + 1);
        if (second >= 0xDC00 && second <= 0xDFFF) { // low surrogate
          // https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
          return (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
        }
      }
      return first;
    };
    if (defineProperty) {
      defineProperty(String.prototype, 'codePointAt', {
        'value': codePointAt,
        'configurable': true,
        'writable': true
      });
    } else {
      String.prototype.codePointAt = codePointAt;
    }
  }());
}


/* SOURCE: polyfill/map.js */
/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */



if (!Map.prototype.clear) {
  Map.prototype.clear = function() {
    for (var keyVal of this) {
      this.delete(keyVal[0]);
    }
  };
}

if (!Map.prototype.forEach) {
  Map.prototype.forEach = function(callback, thisArg) {
    for (var keyVal of this) {
      callback.call(thisArg || null, keyVal[1], keyVal[0], this);
    }
  }
}


/* SOURCE: polyfill/contains.js */
/* -*- Mode: Java; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4 -*- */
/* vim: set shiftwidth=4 tabstop=4 autoindent cindent expandtab: */



if (!String.prototype.contains) {
    String.prototype.contains = function() {
        return String.prototype.indexOf.apply(this, arguments) !== -1;
    };
}


/* SOURCE: polyfill/find.js */
/* -*- Mode: Java; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4 -*- */
/* vim: set shiftwidth=4 tabstop=4 autoindent cindent expandtab: */



if (!Array.prototype.find) {
  Array.prototype.find = function(predicate) {
    if (this == null) {
      throw new TypeError('Array.prototype.find called on null or undefined');
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }
    var list = Object(this);
    var length = list.length >>> 0;
    var thisArg = arguments[1];
    var value;

    for (var i = 0; i < length; i++) {
      value = list[i];
      if (predicate.call(thisArg, value, i, list)) {
        return value;
      }
    }
    return undefined;
  };
}


/* SOURCE: polyfill/findIndex.js */
/* -*- Mode: Java; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4 -*- */
/* vim: set shiftwidth=4 tabstop=4 autoindent cindent expandtab: */



if (!Array.prototype.findIndex) {
  Array.prototype.findIndex = function(predicate) {
    if (this == null) {
      throw new TypeError('Array.prototype.find called on null or undefined');
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }
    var list = Object(this);
    var length = list.length >>> 0;
    var thisArg = arguments[1];
    var value;

    for (var i = 0; i < length; i++) {
      value = list[i];
      if (predicate.call(thisArg, value, i, list)) {
        return i;
      }
    }
    return -1;
  };
}


/* SOURCE: polyfill/fround.js */
/* -*- Mode: Java; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4 -*- */
/* vim: set shiftwidth=4 tabstop=4 autoindent cindent expandtab: */



if (!Math.fround) {
    Math.fround = (function() {
        var fa = new Float32Array(1);
        return function(v) {
            fa[0] = v;
            return fa[0];
        }
    })();
}


/* SOURCE: blackBox.js */
/*
 * This script can be black-boxed in the debugger to disable breaking
 * at unwanted exception points.
 */

function throwHelper(e) {
  J2ME.traceWriter && J2ME.traceWriter.writeLn("Throw " + e);
  throw e;
}

function throwPause() {
  throwHelper(VM.Pause);
}


/* SOURCE: timer.js */
/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */



// Only add nextTickBeforeEvents to the window object, and hide everything
// else in a closure.
(function() {
    var resolved = Promise.resolve();

    // Like setTimeout, but only takes a function argument.  There's
    // no time argument (always zero) and no arguments (you have to
    // use a closure).
    function nextTickBeforeEvents(fn) {
        resolved.then(fn);
    }

    // Add the one thing we want added to the window object.
    window.nextTickBeforeEvents = nextTickBeforeEvents;
})();

(function() {
  var cbs = [];
  var msg = 135921;

  function nextTickDuringEvents(fn) {
    cbs.push(fn);
    window.postMessage(msg, "*");
  }

  function recv(ev) {
    if (window !== ev.source || ev.data !== msg) {
      return;
    }

    ev.stopPropagation();
    cbs.shift()();
  }

  window.addEventListener("message", recv, true);

  window.nextTickDuringEvents = window.postMessage ? nextTickDuringEvents : setTimeout;
})();


/* SOURCE: util.js */
/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */



var util = (function () {
  var Utf8TextDecoder = new TextDecoder("utf-8");

  function decodeUtf8(array) {
    return Utf8TextDecoder.decode(array);
  }

  /**
   * Provides a UTF-8 decoder that will throw an exception on error rather
   * than silently sanitizing the output.
   */
  var fallibleUtf8Decoder = new TextDecoder("utf-8", { fatal: true });

  /**
   * Decodes a UTF-8 string stored in an ArrayBufferView.
   *
   * @param arr An ArrayBufferView to decode (such as a Uint8Array).
   * @returns The decoded string.
   * @throws An invalid enoding is encountered, see
   *         TextDecoder.prototype.decode().
   */
  function decodeUtf8Array(arr) {
    return fallibleUtf8Decoder.decode(arr);
  }

  var INT_MAX = Math.pow(2, 31) - 1;
  var INT_MIN = -INT_MAX - 1;

  var id = (function() {
    var gen = 0;
    return function() {
      return ++gen;
    }
  })();

  function pad(num, len) {
    return "0".repeat(len - num.toString().length) + num;
  }

  function toCodePointArray(str) {
    var chars = [];

    var str = str.slice();

    while (str.length > 0) {
      var ucsChars = String.fromCodePoint(str.codePointAt(0));
      chars.push(ucsChars);
      str = str.substr(ucsChars.length);
    }

    return chars;
  }

  // rgbaToCSS() can be called frequently. Using |rgbaBuf| avoids creating
  // many intermediate strings.
  var rgbaBuf = ["rgba(", 0, ",", 0, ",", 0, ",", 0, ")"];

  function rgbaToCSS(r, g, b, a) {
    rgbaBuf[1] = r;
    rgbaBuf[3] = g;
    rgbaBuf[5] = b;
    rgbaBuf[7] = a;
    return rgbaBuf.join('');
  }

  function abgrIntToCSS(pixel) {
    var a = (pixel >> 24) & 0xff;
    var b = (pixel >> 16) & 0xff;
    var g = (pixel >> 8) & 0xff;
    var r = pixel & 0xff;
    return rgbaToCSS(r, g, b, a/255);
  }

  function isPrintable(val) {
    // http://stackoverflow.com/questions/12467240/determine-if-javascript-e-keycode-is-a-printable-non-control-character
    return ((val >= 48 && val <= 57)  ||  // number keys
            val === 32 || val === 13 ||   // spacebar & return key(s) (if you want to allow carriage returns)
            (val >= 65 && val <= 90)   || // letter keys
            (val >= 96 && val <= 111)  || // numpad keys
            (val >= 186 && val <= 192) || // ;=,-./` (in order)
            (val >= 219 && val <= 222));  // [\]' (in order)
  }

  return {
    INT_MAX: INT_MAX,
    INT_MIN: INT_MIN,
    decodeUtf8: decodeUtf8,
    decodeUtf8Array: decodeUtf8Array,
    id: id,
    pad: pad,
    toCodePointArray: toCodePointArray,
    rgbaToCSS: rgbaToCSS,
    abgrIntToCSS: abgrIntToCSS,
    isPrintable: isPrintable,
  };
})();


/* SOURCE: native.js */
/* -*- Mode: Java; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4 -*- */
/* vim: set shiftwidth=4 tabstop=4 autoindent cindent expandtab: */



var asyncImpl = J2ME.asyncImplOld;

function preemptingImpl(returnKind, returnValue) {
  if (J2ME.Scheduler.shouldPreempt()) {
      asyncImpl(returnKind, Promise.resolve(returnValue));
      return;
  }
  return returnValue;
}

var Override = {};

Native["java/lang/System.arraycopy.(Ljava/lang/Object;ILjava/lang/Object;II)V"] =
function(addr, srcAddr, srcOffset, dstAddr, dstOffset, length) {
    if (srcAddr === J2ME.Constants.NULL || dstAddr === J2ME.Constants.NULL) {
        throw $.newNullPointerException("Cannot copy to/from a null array.");
    }

    var srcClassInfo = J2ME.getClassInfo(srcAddr);
    var dstClassInfo = J2ME.getClassInfo(dstAddr);

    if (!(srcClassInfo instanceof J2ME.ArrayClassInfo) || !(dstClassInfo instanceof J2ME.ArrayClassInfo)) {
        throw $.newArrayStoreException("Can only copy to/from array types.");
    }

    var srcLength = i32[srcAddr + J2ME.Constants.ARRAY_LENGTH_OFFSET >> 2];
    var dstLength = i32[dstAddr + J2ME.Constants.ARRAY_LENGTH_OFFSET >> 2];

    if (srcOffset < 0 || (srcOffset+length) > srcLength ||
        dstOffset < 0 || (dstOffset+length) > dstLength ||
        length < 0) {
        throw $.newArrayIndexOutOfBoundsException("Invalid index.");
    }

    var srcIsPrimitive = srcClassInfo instanceof J2ME.PrimitiveArrayClassInfo;
    var dstIsPrimitive = dstClassInfo instanceof J2ME.PrimitiveArrayClassInfo;
    if ((srcIsPrimitive && dstIsPrimitive && srcClassInfo !== dstClassInfo) ||
        (srcIsPrimitive && !dstIsPrimitive) ||
        (!srcIsPrimitive && dstIsPrimitive)) {
        throw $.newArrayStoreException("Incompatible component types: " + srcClassInfo + " -> " + dstClassInfo);
    }

    if (!dstIsPrimitive) {
        var src = (srcAddr + J2ME.Constants.ARRAY_HDR_SIZE >> 2) + srcOffset;
        var dst = (dstAddr + J2ME.Constants.ARRAY_HDR_SIZE >> 2) + dstOffset;

        if (srcClassInfo !== dstClassInfo && !J2ME.isAssignableTo(srcClassInfo.elementClass, dstClassInfo.elementClass)) {
            var copy = function(to, from) {
                var addr = i32[from];
                if (addr !== J2ME.Constants.NULL) {
                    var objClassInfo = J2ME.getClassInfo(addr);
                    if (!J2ME.isAssignableTo(objClassInfo, dstClassInfo.elementClass)) {
                        throw $.newArrayStoreException("Incompatible component types.");
                    }
                }
                i32[to] = addr;
            };
            if (dstAddr !== srcAddr || dstOffset < srcOffset) {
                for (var n = 0; n < length; ++n) {
                    copy(dst++, src++);
                }
            } else {
                dst += length;
                src += length;
                for (var n = 0; n < length; ++n) {
                    copy(--dst, --src);
                }
            }
        } else {
            if (srcAddr !== dstAddr || dstOffset < srcOffset) {
                for (var n = 0; n < length; ++n) {
                    i32[dst++] = i32[src++];
                }
            } else {
                dst += length;
                src += length;
                for (var n = 0; n < length; ++n) {
                    i32[--dst] = i32[--src];
                }
            }
        }

        return;
    }

    switch (srcClassInfo.bytesPerElement) {
        case 1:
            var src = (srcAddr + J2ME.Constants.ARRAY_HDR_SIZE) + srcOffset;
            var dst = (dstAddr + J2ME.Constants.ARRAY_HDR_SIZE) + dstOffset;
            i8.set(i8.subarray(src, src + length), dst);
            break;

        case 2:
            var src = (srcAddr + J2ME.Constants.ARRAY_HDR_SIZE >> 1) + srcOffset;
            var dst = (dstAddr + J2ME.Constants.ARRAY_HDR_SIZE >> 1) + dstOffset;
            i16.set(i16.subarray(src, src + length), dst);
            break;

        case 4:
            var src = (srcAddr + J2ME.Constants.ARRAY_HDR_SIZE >> 2) + srcOffset;
            var dst = (dstAddr + J2ME.Constants.ARRAY_HDR_SIZE >> 2) + dstOffset;
            i32.set(i32.subarray(src, src + length), dst);
            break;

        case 8:
            var src = (srcAddr + J2ME.Constants.ARRAY_HDR_SIZE >> 3) + srcOffset;
            var dst = (dstAddr + J2ME.Constants.ARRAY_HDR_SIZE >> 3) + dstOffset;
            f64.set(f64.subarray(src, src + length), dst);
            break;
    }
};

var stubProperties = {
  "com.nokia.multisim.slots": "1",
  "com.nokia.mid.imsi": "000000000000000",
  "com.nokia.mid.imei": "",
};

Native["java/lang/System.getProperty0.(Ljava/lang/String;)Ljava/lang/String;"] = function(addr, keyAddr) {
    var key = J2ME.fromStringAddr(keyAddr);
    var value;
    switch (key) {
    case "microedition.encoding":
        // The value of this property is different than the value on a real Nokia Asha 503 phone.
        // On the phone, it is: ISO8859_1.
        // If we changed this, we would need to remove the optimizations for UTF_8_Reader and
        // UTF_8_Writer and optimize the ISO8859_1 alternatives.
        value = "UTF-8";
        break;
    case "microedition.io.file.FileConnection.version":
        value = "1.0";
        break;
    case "microedition.locale":
        value = navigator.language;
        break;
    case "microedition.platform":
        value = config.platform ? config.platform : "Nokia503/14.0.4/java_runtime_version=Nokia_Asha_1_2";
        break;
    case "microedition.platformimpl":
        value = null;
        break;
    case "microedition.profiles":
        value = "MIDP-2.1"
        break;
    case "microedition.pim.version":
        value = "1.0";
        break;
    case "microedition.amms.version":
        value = "1.1";
        break;
    case "microedition.media.version":
        value = '1.2';
        break;
    case "mmapi-configuration":
        value = null;
        break;
    case "fileconn.dir.memorycard":
        value = "file:///MemoryCard/";
        break;
    // The names here should be localized.
    case "fileconn.dir.memorycard.name":
        value = "Memory card";
        break;
    case "fileconn.dir.private":
        value = "file:///Private/";
        break;
    case "fileconn.dir.private.name":
        value = "Private";
        break;
    case "fileconn.dir.applications.bookmarks":
        value = null;
        break;
    case "fileconn.dir.received":
        value = "file:///Phone/_my_downloads/";
        break;
    case "fileconn.dir.received.name":
        value = "Downloads";
        break;
    case "fileconn.dir.photos":
        value = "file:///Phone/_my_pictures/";
        break;
    case "fileconn.dir.photos.name":
        value = "Photos";
        break;
    case "fileconn.dir.videos":
        value = "file:///Phone/_my_videos/";
        break;
    case "fileconn.dir.videos.name":
        value = "Videos";
        break;
    case "fileconn.dir.recordings":
        value = "file:///Phone/_my_recordings/";
        break;
    case "fileconn.dir.recordings.name":
        value = "Recordings";
        break;
    case "fileconn.dir.roots.names":
        value = MIDP.fsRootNames.join(";");
        break;
    case "fileconn.dir.roots.external":
        value = MIDP.fsRoots.map(function(v) { return "file:///" + v }).join("\n");
        break;
    case "file.separator":
        value = "/";
        break;
    case "com.sun.cldc.util.j2me.TimeZoneImpl.timezone":
        // Date.toString() returns something like the following:
        //    "Wed Sep 17 2014 12:11:23 GMT-0700 (PDT)"
        //
        // Per http://www.spectrum3847.org/frc2013api/com/sun/cldc/util/j2me/TimeZoneImpl.html,
        // timezones can be of the format GMT+0600, which is what this
        // regex currently matches. (Those actually in GMT would not
        // match the regex, causing the default "GMT" to be returned.)
        // If we find this to be a problem, we could alternately return the
        // zone name as provided in parenthesis, but that seems locale-specific.
        var match = /GMT[+-]\d+/.exec(new Date().toString());
        value = (match && match[0]) || "GMT";
        break;
    case "javax.microedition.io.Connector.protocolpath":
        value = "com.sun.midp.io";
        break;
    case "javax.microedition.io.Connector.protocolpath.fallback":
        value = "com.sun.cldc.io";
        break;
    case "com.nokia.keyboard.type":
        value = "None";
        break;
    case "com.nokia.mid.batterylevel":
        // http://developer.nokia.com/community/wiki/Checking_battery_level_in_Java_ME
        value = Math.floor(navigator.battery.level * 100).toString();
        break;
    case "com.nokia.mid.ui.version":
        value = "1.7";
        break;
    case "com.nokia.mid.mnc":
        if (mobileInfo.icc.mcc && mobileInfo.icc.mnc) {
            // The concatenation of the MCC and MNC for the ICC (i.e. SIM card).
            value = util.pad(mobileInfo.icc.mcc, 3) + util.pad(mobileInfo.icc.mnc, 3);
        } else {
            value = null;
        }
        break;
    case "com.nokia.mid.networkID":
        if (mobileInfo.network.mcc && mobileInfo.network.mnc) {
            // The concatenation of MCC and MNC for the network.
            value = util.pad(mobileInfo.network.mcc, 3) + util.pad(mobileInfo.network.mnc, 3);
        } else {
            value = null;
        }
        break;
    case "com.nokia.mid.ui.customfontsize":
        value = "true";
        break;
    case "classpathext":
        value = null;
        break;
    case "supports.audio.capture":
        value = "true";
        break;
    case "supports.video.capture":
        value = "true";
        break;
    case "supports.recording":
        value = "true";
        break;
    case "audio.encodings":
        value = "encoding=audio/amr";
        break;
    case "video.snapshot.encodings":
        // FIXME Some MIDlets pass a string that contains lots of constraints
        // as the `imageType` which is not yet handled in DirectVideo.jpp, let's
        // just put the whole string here as a workaround and fix this in issue #688.
        value = "encoding=jpeg&quality=80&progressive=true&type=jfif&width=400&height=400";
        break;
    default:
        if (MIDP.additionalProperties[key]) {
            value = MIDP.additionalProperties[key];
        } else if (typeof stubProperties[key] !== "undefined") {
            value = stubProperties[key];
        } else {
            console.warn("UNKNOWN PROPERTY (java/lang/System): " + key);
            stubProperties[key] = value = null;
        }
        break;
    }

    return J2ME.newString(value);
};

Native["java/lang/System.currentTimeMillis.()J"] = function(addr) {
    return J2ME.returnLongValue(Date.now());
};

Native["com/sun/cldchi/jvm/JVM.unchecked_char_arraycopy.([CI[CII)V"] =
function(addr, srcAddr, srcOffset, dstAddr, dstOffset, length) {
    var src = (srcAddr + J2ME.Constants.ARRAY_HDR_SIZE >> 1) + srcOffset;
    var dst = (dstAddr + J2ME.Constants.ARRAY_HDR_SIZE >> 1) + dstOffset;
    i16.set(i16.subarray(src, src + length), dst);
};

Native["com/sun/cldchi/jvm/JVM.unchecked_int_arraycopy.([II[III)V"] =
function(addr, srcAddr, srcOffset, dstAddr, dstOffset, length) {
    var src = (srcAddr + J2ME.Constants.ARRAY_HDR_SIZE >> 2) + srcOffset;
    var dst = (dstAddr + J2ME.Constants.ARRAY_HDR_SIZE >> 2) + dstOffset;
    i32.set(i32.subarray(src, src + length), dst);
};

Native["com/sun/cldchi/jvm/JVM.unchecked_obj_arraycopy.([Ljava/lang/Object;I[Ljava/lang/Object;II)V"] =
function(addr, srcAddr, srcOffset, dstAddr, dstOffset, length) {
    var src = (srcAddr + J2ME.Constants.ARRAY_HDR_SIZE >> 2) + srcOffset;
    var dst = (dstAddr + J2ME.Constants.ARRAY_HDR_SIZE >> 2) + dstOffset;

    if (srcAddr !== dstAddr || dstOffset < srcOffset) {
        for (var n = 0; n < length; ++n) {
            i32[dst++] = i32[src++];
        }
    } else {
        dst += length;
        src += length;
        for (var n = 0; n < length; ++n)
            i32[--dst] = i32[--src];
    }
};

Native["com/sun/cldchi/jvm/JVM.monotonicTimeMillis.()J"] = function(addr) {
    return J2ME.returnLongValue(performance.now());
};

Native["java/lang/Object.getClass.()Ljava/lang/Class;"] = function(addr) {
    return $.getClassObjectAddress(J2ME.getClassInfo(addr));
};

Native["java/lang/Class.getSuperclass.()Ljava/lang/Class;"] = function(addr) {
    var self = getHandle(addr);
    var superClassInfo = J2ME.classIdToClassInfoMap[self.vmClass].superClass;
    if (!superClassInfo) {
      return J2ME.Constants.NULL;
    }
    return $.getClassObjectAddress(superClassInfo);
};

Native["java/lang/Class.invoke_clinit.()V"] = function(addr) {
    var self = getHandle(addr);
    var classInfo = J2ME.classIdToClassInfoMap[self.vmClass];
    var className = classInfo.getClassNameSlow();
    var clinit = classInfo.staticInitializer;
    J2ME.preemptionLockLevel++;
    if (clinit && clinit.classInfo.getClassNameSlow() === className) {
        $.ctx.executeMethod(clinit);
        if (U) {
            $.nativeBailout(J2ME.Kind.Void, J2ME.Bytecode.Bytecodes.INVOKESTATIC);
        }
    }
};

Native["java/lang/Class.invoke_verify.()V"] = function(addr) {
    // There is currently no verification.
};

Native["java/lang/Class.init9.()V"] = function(addr) {
    var self = getHandle(addr);
    release || J2ME.Debug.assert(self.vmClass in J2ME.classIdToClassInfoMap, "Class must be linked.");
    $.setClassInitialized(self.vmClass);
    J2ME.preemptionLockLevel--;
};

Native["java/lang/Class.getName.()Ljava/lang/String;"] = function(addr) {
    var self = getHandle(addr);
    var classInfo = J2ME.classIdToClassInfoMap[self.vmClass];
    return J2ME.newString(classInfo.getClassNameSlow().replace(/\//g, "."));
};

Native["java/lang/Class.forName0.(Ljava/lang/String;)V"] = function(addr, nameAddr) {
  var classInfo = null;
  try {
    if (nameAddr === J2ME.Constants.NULL) {
      throw new J2ME.ClassNotFoundException();
    }
    var className = J2ME.fromStringAddr(nameAddr).replace(/\./g, "/");
    classInfo = CLASSES.getClass(className);
  } catch (e) {
    if (e instanceof (J2ME.ClassNotFoundException)) {
      throw $.newClassNotFoundException("'" + e.message + "' not found.");
    }
    throw e;
  }
  // The following can trigger an unwind.
  J2ME.classInitCheck(classInfo);
  if (U) {
    $.nativeBailout(J2ME.Kind.Void, J2ME.Bytecode.Bytecodes.INVOKESTATIC);
  }
};

Native["java/lang/Class.forName1.(Ljava/lang/String;)Ljava/lang/Class;"] = function(addr, nameAddr) {
  var className = J2ME.fromStringAddr(nameAddr).replace(/\./g, "/");
  var classInfo = CLASSES.getClass(className);
  return $.getClassObjectAddress(classInfo);
};

Native["java/lang/Class.newInstance0.()Ljava/lang/Object;"] = function(addr) {
  var self = getHandle(addr);
  var classInfo = J2ME.classIdToClassInfoMap[self.vmClass];
  if (classInfo.isInterface ||
      classInfo.isAbstract) {
    throw $.newInstantiationException("Can't instantiate interfaces or abstract classes");
  }

  if (classInfo instanceof J2ME.ArrayClassInfo) {
    throw $.newInstantiationException("Can't instantiate array classes");
  }

  return J2ME.allocObject(classInfo);
};

Native["java/lang/Class.newInstance1.(Ljava/lang/Object;)V"] = function(addr, oAddr) {
  var classInfo = J2ME.getClassInfo(oAddr);
  var methodInfo = classInfo.getLocalMethodByNameString("<init>", "()V", false);
  if (!methodInfo) {
    throw $.newInstantiationException("Can't instantiate classes without a nullary constructor");
  }
  // The following can trigger an unwind.
  J2ME.getLinkedMethod(methodInfo)(oAddr);
  if (U) {
      $.nativeBailout(J2ME.Kind.Void, J2ME.Bytecode.Bytecodes.INVOKESPECIAL);
  }
};

Native["java/lang/Class.isInterface.()Z"] = function(addr) {
    var self = getHandle(addr);
    var classInfo = J2ME.classIdToClassInfoMap[self.vmClass];
    return classInfo.isInterface ? 1 : 0;
};

Native["java/lang/Class.isArray.()Z"] = function(addr) {
    var self = getHandle(addr);
    var classInfo = J2ME.classIdToClassInfoMap[self.vmClass];
    return classInfo instanceof J2ME.ArrayClassInfo ? 1 : 0;
};

Native["java/lang/Class.isAssignableFrom.(Ljava/lang/Class;)Z"] = function(addr, fromClassAddr) {
    var self = getHandle(addr);
    var selfClassInfo = J2ME.classIdToClassInfoMap[self.vmClass];
    if (fromClassAddr === J2ME.Constants.NULL) {
        throw $.newNullPointerException();
    }
    var fromClass = getHandle(fromClassAddr);
    var fromClassInfo = J2ME.classIdToClassInfoMap[fromClass.vmClass];
    return J2ME.isAssignableTo(fromClassInfo, selfClassInfo) ? 1 : 0;
};

Native["java/lang/Class.isInstance.(Ljava/lang/Object;)Z"] = function(addr, objAddr) {
    if (objAddr === J2ME.Constants.NULL) {
        return 0;
    }

    var self = getHandle(addr);
    var classInfo = J2ME.classIdToClassInfoMap[self.vmClass];
    var objClassInfo = J2ME.getClassInfo(objAddr);
    return J2ME.isAssignableTo(objClassInfo, classInfo) ? 1 : 0;
};

Native["java/lang/Float.floatToIntBits.(F)I"] = function(addr, f) {
    aliasedI32[0] = f;
    aliasedF32[0] = aliasedF32[0];
    return aliasedI32[0];
}

Native["java/lang/Float.intBitsToFloat.(I)F"] = function (addr, i) {
    return i;
}

Native["java/lang/Double.doubleToLongBits.(D)J"] = function (addr, l, h) {
    aliasedI32[0] = l;
    aliasedI32[1] = h;
    // Canonicalize the value.
    aliasedF64[0] = aliasedF64[0];
    return J2ME.returnLong(aliasedI32[0], aliasedI32[1]);
}

Native["java/lang/Double.longBitsToDouble.(J)D"] = function(addr, l, h) {
    aliasedI32[0] = l;
    aliasedI32[1] = h;
    return J2ME.returnDoubleValue(aliasedF64[0]);
}

Native["java/lang/Runtime.freeMemory.()J"] = function(addr) {
    return J2ME.returnLongValue(J2ME.getFreeMemory());
};

Native["java/lang/Runtime.gc.()V"] = function(addr) {
    // Force a bailout so that there are no native frames on the stack
    // so GC can be safely run.
    asyncImpl("V", new Promise(function(resolve, reject) {
        setTimeout(function() {
            ASM._forceCollection();
            resolve();
        });
    }));
};

Native["java/lang/Math.floor.(D)D"] = function(addr, valLow, valHigh) {
    aliasedI32[0] = valLow;
    aliasedI32[1] = valHigh;
    return J2ME.returnDoubleValue(Math.floor(aliasedF64[0]));
};

Native["java/lang/Math.asin.(D)D"] = function(addr, valLow, valHigh) {
    aliasedI32[0] = valLow;
    aliasedI32[1] = valHigh;
    return J2ME.returnDoubleValue(Math.asin(aliasedF64[0]));
};

Native["java/lang/Math.acos.(D)D"] = function(addr, valLow, valHigh) {
    aliasedI32[0] = valLow;
    aliasedI32[1] = valHigh;
    return J2ME.returnDoubleValue(Math.acos(aliasedF64[0]));
};

Native["java/lang/Math.atan.(D)D"] = function(addr, valLow, valHigh) {
    aliasedI32[0] = valLow;
    aliasedI32[1] = valHigh;
    return J2ME.returnDoubleValue(Math.atan(aliasedF64[0]));
};

Native["java/lang/Math.atan2.(DD)D"] = function(addr, xLow, xHigh, yLow, yHigh) {
    aliasedI32[0] = xLow;
    aliasedI32[1] = xHigh;
    var x = aliasedF64[0];
    aliasedI32[0] = yLow;
    aliasedI32[1] = yHigh;
    var y = aliasedF64[0];
    return J2ME.returnDoubleValue(Math.atan2(x, y));
};

Native["java/lang/Math.sin.(D)D"] = function(addr, valLow, valHigh) {
    aliasedI32[0] = valLow;
    aliasedI32[1] = valHigh;
    return J2ME.returnDoubleValue(Math.sin(aliasedF64[0]));
};

Native["java/lang/Math.cos.(D)D"] = function(addr, valLow, valHigh) {
    aliasedI32[0] = valLow;
    aliasedI32[1] = valHigh;
    return J2ME.returnDoubleValue(Math.cos(aliasedF64[0]));
};

Native["java/lang/Math.tan.(D)D"] = function(addr, valLow, valHigh) {
    aliasedI32[0] = valLow;
    aliasedI32[1] = valHigh;
    return J2ME.returnDoubleValue(Math.tan(aliasedF64[0]));
};

Native["java/lang/Math.sqrt.(D)D"] = function(addr, valLow, valHigh) {
    aliasedI32[0] = valLow;
    aliasedI32[1] = valHigh;
    return J2ME.returnDoubleValue(Math.sqrt(aliasedF64[0]));
};

Native["java/lang/Math.ceil.(D)D"] = function(addr, valLow, valHigh) {
    aliasedI32[0] = valLow;
    aliasedI32[1] = valHigh;
    return J2ME.returnDoubleValue(Math.ceil(aliasedF64[0]));
};

Native["java/lang/Math.floor.(D)D"] = function(addr, valLow, valHigh) {
    aliasedI32[0] = valLow;
    aliasedI32[1] = valHigh;
    return J2ME.returnDoubleValue(Math.floor(aliasedF64[0]));
};

Native["java/lang/Thread.currentThread.()Ljava/lang/Thread;"] = function(addr) {
    return $.ctx.threadAddress;
};

Native["java/lang/Thread.setPriority0.(II)V"] = function(addr, oldPriority, newPriority) {
    var ctx = NativeMap.get(addr);
    if (ctx) {
        ctx.priority = newPriority;
    }
};

Native["java/lang/Thread.start0.()V"] = function(addr) {
    var self = getHandle(addr);

    // The main thread starts during bootstrap and don't allow calling start()
    // on already running threads.
    if (addr === $.ctx.runtime.mainThread || self.nativeAlive)
        throw $.newIllegalThreadStateException();
    self.nativeAlive = 1;
    // XXX self.pid seems to be unused, so remove it.
    self.pid = util.id();
    // Create a context for the thread and start it.
    var newCtx = new Context($.ctx.runtime);
    newCtx.threadAddress = addr;
    J2ME.setNative(addr, newCtx);
    newCtx.priority = self.priority;

    var classInfo = CLASSES.getClass("org/mozilla/internal/Sys");
    var run = classInfo.getMethodByNameString("runThread", "(Ljava/lang/Thread;)V", true);
    newCtx.nativeThread.pushMarkerFrame(J2ME.FrameType.ExitInterpreter);
    newCtx.nativeThread.pushFrame(run);
    newCtx.nativeThread.frame.setParameter(J2ME.Kind.Reference, 0, addr);
    newCtx.start();
}

Native["java/lang/Thread.activeCount.()I"] = function(addr) {
    return $.ctx.runtime.threadCount;
};

var consoleBuffer = "";

function flushConsoleBuffer() {
    if (consoleBuffer.length) {
        var temp = consoleBuffer;
        consoleBuffer = "";
        console.info(temp);
    }
}

console.print = function(ch) {
    if (ch === 10) {
        flushConsoleBuffer();
    } else {
        consoleBuffer += String.fromCharCode(ch);
    }
};

Native["com/sun/cldchi/io/ConsoleOutputStream.write.(I)V"] = function(addr, ch) {
    console.print(ch);
};

Native["com/sun/cldc/io/ResourceInputStream.open.(Ljava/lang/String;)Ljava/lang/Object;"] = function(addr, nameAddr) {
    var fileName = J2ME.fromStringAddr(nameAddr);
    var data = JARStore.loadFile(fileName);
    var objAddr = J2ME.Constants.NULL;
    if (data) {
        objAddr = J2ME.allocObject(CLASSES.java_lang_Object);
        setNative(objAddr, {
            data: data,
            pos: 0,
        });
    }
    return objAddr;
};

Native["com/sun/cldc/io/ResourceInputStream.clone.(Ljava/lang/Object;)Ljava/lang/Object;"] = function(addr, sourceAddr) {
    var objAddr = J2ME.allocObject(CLASSES.java_lang_Object);
    var sourceDecoder = NativeMap.get(sourceAddr);
    setNative(objAddr, {
        data: new Uint8Array(sourceDecoder.data),
        pos: sourceDecoder.pos,
    });
    return objAddr;
};

Native["com/sun/cldc/io/ResourceInputStream.bytesRemain.(Ljava/lang/Object;)I"] = function(addr, fileDecoderAddr) {
    var handle = NativeMap.get(fileDecoderAddr);
    return handle.data.length - handle.pos;
};

Native["com/sun/cldc/io/ResourceInputStream.readByte.(Ljava/lang/Object;)I"] = function(addr, fileDecoderAddr) {
    var handle = NativeMap.get(fileDecoderAddr);
    return (handle.data.length - handle.pos > 0) ? handle.data[handle.pos++] : -1;
};

Native["com/sun/cldc/io/ResourceInputStream.readBytes.(Ljava/lang/Object;[BII)I"] =
function(addr, fileDecoderAddr, bAddr, off, len) {
    var b = J2ME.getArrayFromAddr(bAddr);
    var handle = NativeMap.get(fileDecoderAddr);
    var data = handle.data;
    var remaining = data.length - handle.pos;
    if (len > remaining)
        len = remaining;
    for (var n = 0; n < len; ++n)
        b[off+n] = data[handle.pos+n];
    handle.pos += len;
    return (len > 0) ? len : -1;
};

Native["com/sun/cldc/isolate/Isolate.registerNewIsolate.()V"] = function(addr) {
    var self = getHandle(addr);
    self._id = util.id();
};

Native["com/sun/cldc/isolate/Isolate.getStatus.()I"] = function(addr) {
    var runtime = NativeMap.get(addr);
    return runtime ? runtime.status : J2ME.RuntimeStatus.New;
};

Native["com/sun/cldc/isolate/Isolate.nativeStart.()V"] = function(addr) {
    $.ctx.runtime.jvm.startIsolate(addr);
};

Native["com/sun/cldc/isolate/Isolate.waitStatus.(I)V"] = function(addr, status) {
    var runtime = NativeMap.get(addr);
    asyncImpl("V", new Promise(function(resolve, reject) {
        if (runtime.status >= status) {
            resolve();
            return;
        }
        function waitForStatus() {
            if (runtime.status >= status) {
                resolve();
                return;
            }
            runtime.waitStatus(waitForStatus);
        }
        waitForStatus();
    }));
};

Native["com/sun/cldc/isolate/Isolate.currentIsolate0.()Lcom/sun/cldc/isolate/Isolate;"] = function(addr) {
    return $.ctx.runtime.isolateAddress;
};

Native["com/sun/cldc/isolate/Isolate.getIsolates0.()[Lcom/sun/cldc/isolate/Isolate;"] = function(addr) {
    var isolatesAddr = J2ME.newObjectArray(Runtime.all.size);
    var isolates = J2ME.getArrayFromAddr(isolatesAddr);
    var n = 0;
    Runtime.all.forEach(function(runtime) {
        isolates[n++] = runtime.isolateAddress;
    });
    return isolatesAddr;
};

Native["com/sun/cldc/isolate/Isolate.setPriority0.(I)V"] = function(addr, newPriority) {
    // XXX Figure out if there's anything to do here.  If not, say so.
};

Native["com/sun/j2me/content/AppProxy.midletIsAdded.(ILjava/lang/String;)V"] = function(addr, suiteId, classNameAddr) {
  console.warn("com/sun/j2me/content/AppProxy.midletIsAdded.(ILjava/lang/String;)V not implemented");
};

Native["com/nokia/mid/impl/jms/core/Launcher.handleContent.(Ljava/lang/String;)V"] = function(addr, contentAddr) {
    var fileName = J2ME.fromStringAddr(contentAddr);

    var ext = fileName.split('.').pop().toLowerCase();
    // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#Supported_image_formats
    if (["jpg", "jpeg", "gif", "apng", "png", "bmp", "ico"].indexOf(ext) == -1) {
        console.error("File not supported: " + fileName);
        throw $.newException("File not supported: " + fileName);
    }

    // `fileName` is supposed to be a full path, but we don't support
    // partition, e.g. `C:` or `E:` etc, so the `fileName` we got here
    // is something like: `Photos/sampleImage.jpg`, we need to prepend
    // the root dir to make sure it's valid.
    var imgData = fs.getBlob("/" + fileName);
    if (!imgData) {
        console.error("File not found: " + fileName);
        throw $.newException("File not found: " + fileName);
    }

    var maskId = "image-launcher";
    var mask = document.getElementById(maskId);

    function _revokeImageURL() {
        URL.revokeObjectURL(/url\((.+)\)/ig.exec(mask.style.backgroundImage)[1]);
    }

    if (mask) {
        _revokeImageURL();
    } else {
        mask = document.createElement("div");
        mask.id = maskId;
        mask.onclick = mask.ontouchstart = function() {
            _revokeImageURL();
            mask.parentNode.removeChild(mask);
        };

        document.getElementById("main").appendChild(mask);
    }

    mask.style.backgroundImage = "url(" +
      URL.createObjectURL(imgData) + ")";
};

function addUnimplementedNative(signature, returnValue) {
    var doNotWarn;

    if (typeof returnValue === "function") {
      doNotWarn = returnValue;
    } else {
      doNotWarn = function() { return returnValue };
    }

    var warnOnce = function() {
        console.warn(signature + " not implemented");
        warnOnce = doNotWarn;
        return doNotWarn();
    };

    Native[signature] = function(addr) { return warnOnce() };
}

Native["org/mozilla/internal/Sys.eval.(Ljava/lang/String;)V"] = function(addr, srcAddr) {
    if (!release) {
        eval(J2ME.fromStringAddr(srcAddr));
    }
};

Native["java/lang/String.intern.()Ljava/lang/String;"] = function(addr) {
  var self = getHandle(addr);
  var value = J2ME.getArrayFromAddr(self.value);
  var internedStringAddr = J2ME.internedStrings.getByRange(value, self.offset, self.count);
  if (internedStringAddr !== null) {
    return internedStringAddr;
  }
  J2ME.internedStrings.put(value.subarray(self.offset, self.offset + self.count), addr);
  return addr;
};

var profileStarted = false;
Native["org/mozilla/internal/Sys.startProfile.()V"] = function(addr) {
    if (profile === 4) {
        if (!profileStarted) {
            profileStarted = true;

            console.log("Start profile at: " + performance.now());
            startTimeline();
        }
    }
};

var profileSaved = false;
Native["org/mozilla/internal/Sys.stopProfile.()V"] = function(addr) {
    if (profile === 4) {
        if (!profileSaved) {
            profileSaved = true;

            console.log("Stop profile at: " + performance.now());
            setZeroTimeout(function() {
                stopAndSaveTimeline();
            });
        }
    }
};


/* SOURCE: libs/load.js */
/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */



function load(file, responseType) {
  return new Promise(function(resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", file, true);
    xhr.responseType = responseType;
    xhr.onload = function () {
      resolve(xhr.response);
    };
    xhr.onerror = function() {
      reject();
    };
    xhr.send(null);
  });
}

function loadWithProgress(file, responseType, successCb, failureCb, progressCb, length) {
  var xhr = new XMLHttpRequest({ mozSystem: true });
  xhr.open("GET", file, true);
  xhr.responseType = responseType;

  if (progressCb) {
    xhr.onprogress = function(e) {

      if (e.lengthComputable) {
        progressCb(e.loaded / e.total * 100);
      } else if (length) {
        progressCb(e.loaded / length * 100);
      }
    }
  }

  xhr.onload = function() {
    if (xhr.status === 200) {
      successCb(xhr.response);
    } else {
      failureCb();
    }
  };

  xhr.onerror = function(event) {
    failureCb();
  };

  xhr.send(null);
}

function loadScript(path) {
  return new Promise(function(resolve, reject) {
    var element = document.createElement('script');
    element.setAttribute("type", "text/javascript");
    element.setAttribute("src", path);
    document.getElementsByTagName("head")[0].appendChild(element);
    element.onload = resolve;
  });
}


/* SOURCE: libs/zipfile.js */
/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */



var codeLenCodeMap = new Int32Array([
  16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15
]);

var lengthDecode = new Int32Array([
  0x00003, 0x00004, 0x00005, 0x00006, 0x00007, 0x00008, 0x00009, 0x0000a,
  0x1000b, 0x1000d, 0x1000f, 0x10011, 0x20013, 0x20017, 0x2001b, 0x2001f,
  0x30023, 0x3002b, 0x30033, 0x3003b, 0x40043, 0x40053, 0x40063, 0x40073,
  0x50083, 0x500a3, 0x500c3, 0x500e3, 0x00102, 0x00102, 0x00102
]);

var distDecode = new Int32Array([
  0x00001, 0x00002, 0x00003, 0x00004, 0x10005, 0x10007, 0x20009, 0x2000d,
  0x30011, 0x30019, 0x40021, 0x40031, 0x50041, 0x50061, 0x60081, 0x600c1,
  0x70101, 0x70181, 0x80201, 0x80301, 0x90401, 0x90601, 0xa0801, 0xa0c01,
  0xb1001, 0xb1801, 0xc2001, 0xc3001, 0xd4001, 0xd6001
]);

var fixedLitCodeTab = [new Int32Array([
  0x70100, 0x80050, 0x80010, 0x80118, 0x70110, 0x80070, 0x80030, 0x900c0,
  0x70108, 0x80060, 0x80020, 0x900a0, 0x80000, 0x80080, 0x80040, 0x900e0,
  0x70104, 0x80058, 0x80018, 0x90090, 0x70114, 0x80078, 0x80038, 0x900d0,
  0x7010c, 0x80068, 0x80028, 0x900b0, 0x80008, 0x80088, 0x80048, 0x900f0,
  0x70102, 0x80054, 0x80014, 0x8011c, 0x70112, 0x80074, 0x80034, 0x900c8,
  0x7010a, 0x80064, 0x80024, 0x900a8, 0x80004, 0x80084, 0x80044, 0x900e8,
  0x70106, 0x8005c, 0x8001c, 0x90098, 0x70116, 0x8007c, 0x8003c, 0x900d8,
  0x7010e, 0x8006c, 0x8002c, 0x900b8, 0x8000c, 0x8008c, 0x8004c, 0x900f8,
  0x70101, 0x80052, 0x80012, 0x8011a, 0x70111, 0x80072, 0x80032, 0x900c4,
  0x70109, 0x80062, 0x80022, 0x900a4, 0x80002, 0x80082, 0x80042, 0x900e4,
  0x70105, 0x8005a, 0x8001a, 0x90094, 0x70115, 0x8007a, 0x8003a, 0x900d4,
  0x7010d, 0x8006a, 0x8002a, 0x900b4, 0x8000a, 0x8008a, 0x8004a, 0x900f4,
  0x70103, 0x80056, 0x80016, 0x8011e, 0x70113, 0x80076, 0x80036, 0x900cc,
  0x7010b, 0x80066, 0x80026, 0x900ac, 0x80006, 0x80086, 0x80046, 0x900ec,
  0x70107, 0x8005e, 0x8001e, 0x9009c, 0x70117, 0x8007e, 0x8003e, 0x900dc,
  0x7010f, 0x8006e, 0x8002e, 0x900bc, 0x8000e, 0x8008e, 0x8004e, 0x900fc,
  0x70100, 0x80051, 0x80011, 0x80119, 0x70110, 0x80071, 0x80031, 0x900c2,
  0x70108, 0x80061, 0x80021, 0x900a2, 0x80001, 0x80081, 0x80041, 0x900e2,
  0x70104, 0x80059, 0x80019, 0x90092, 0x70114, 0x80079, 0x80039, 0x900d2,
  0x7010c, 0x80069, 0x80029, 0x900b2, 0x80009, 0x80089, 0x80049, 0x900f2,
  0x70102, 0x80055, 0x80015, 0x8011d, 0x70112, 0x80075, 0x80035, 0x900ca,
  0x7010a, 0x80065, 0x80025, 0x900aa, 0x80005, 0x80085, 0x80045, 0x900ea,
  0x70106, 0x8005d, 0x8001d, 0x9009a, 0x70116, 0x8007d, 0x8003d, 0x900da,
  0x7010e, 0x8006d, 0x8002d, 0x900ba, 0x8000d, 0x8008d, 0x8004d, 0x900fa,
  0x70101, 0x80053, 0x80013, 0x8011b, 0x70111, 0x80073, 0x80033, 0x900c6,
  0x70109, 0x80063, 0x80023, 0x900a6, 0x80003, 0x80083, 0x80043, 0x900e6,
  0x70105, 0x8005b, 0x8001b, 0x90096, 0x70115, 0x8007b, 0x8003b, 0x900d6,
  0x7010d, 0x8006b, 0x8002b, 0x900b6, 0x8000b, 0x8008b, 0x8004b, 0x900f6,
  0x70103, 0x80057, 0x80017, 0x8011f, 0x70113, 0x80077, 0x80037, 0x900ce,
  0x7010b, 0x80067, 0x80027, 0x900ae, 0x80007, 0x80087, 0x80047, 0x900ee,
  0x70107, 0x8005f, 0x8001f, 0x9009e, 0x70117, 0x8007f, 0x8003f, 0x900de,
  0x7010f, 0x8006f, 0x8002f, 0x900be, 0x8000f, 0x8008f, 0x8004f, 0x900fe,
  0x70100, 0x80050, 0x80010, 0x80118, 0x70110, 0x80070, 0x80030, 0x900c1,
  0x70108, 0x80060, 0x80020, 0x900a1, 0x80000, 0x80080, 0x80040, 0x900e1,
  0x70104, 0x80058, 0x80018, 0x90091, 0x70114, 0x80078, 0x80038, 0x900d1,
  0x7010c, 0x80068, 0x80028, 0x900b1, 0x80008, 0x80088, 0x80048, 0x900f1,
  0x70102, 0x80054, 0x80014, 0x8011c, 0x70112, 0x80074, 0x80034, 0x900c9,
  0x7010a, 0x80064, 0x80024, 0x900a9, 0x80004, 0x80084, 0x80044, 0x900e9,
  0x70106, 0x8005c, 0x8001c, 0x90099, 0x70116, 0x8007c, 0x8003c, 0x900d9,
  0x7010e, 0x8006c, 0x8002c, 0x900b9, 0x8000c, 0x8008c, 0x8004c, 0x900f9,
  0x70101, 0x80052, 0x80012, 0x8011a, 0x70111, 0x80072, 0x80032, 0x900c5,
  0x70109, 0x80062, 0x80022, 0x900a5, 0x80002, 0x80082, 0x80042, 0x900e5,
  0x70105, 0x8005a, 0x8001a, 0x90095, 0x70115, 0x8007a, 0x8003a, 0x900d5,
  0x7010d, 0x8006a, 0x8002a, 0x900b5, 0x8000a, 0x8008a, 0x8004a, 0x900f5,
  0x70103, 0x80056, 0x80016, 0x8011e, 0x70113, 0x80076, 0x80036, 0x900cd,
  0x7010b, 0x80066, 0x80026, 0x900ad, 0x80006, 0x80086, 0x80046, 0x900ed,
  0x70107, 0x8005e, 0x8001e, 0x9009d, 0x70117, 0x8007e, 0x8003e, 0x900dd,
  0x7010f, 0x8006e, 0x8002e, 0x900bd, 0x8000e, 0x8008e, 0x8004e, 0x900fd,
  0x70100, 0x80051, 0x80011, 0x80119, 0x70110, 0x80071, 0x80031, 0x900c3,
  0x70108, 0x80061, 0x80021, 0x900a3, 0x80001, 0x80081, 0x80041, 0x900e3,
  0x70104, 0x80059, 0x80019, 0x90093, 0x70114, 0x80079, 0x80039, 0x900d3,
  0x7010c, 0x80069, 0x80029, 0x900b3, 0x80009, 0x80089, 0x80049, 0x900f3,
  0x70102, 0x80055, 0x80015, 0x8011d, 0x70112, 0x80075, 0x80035, 0x900cb,
  0x7010a, 0x80065, 0x80025, 0x900ab, 0x80005, 0x80085, 0x80045, 0x900eb,
  0x70106, 0x8005d, 0x8001d, 0x9009b, 0x70116, 0x8007d, 0x8003d, 0x900db,
  0x7010e, 0x8006d, 0x8002d, 0x900bb, 0x8000d, 0x8008d, 0x8004d, 0x900fb,
  0x70101, 0x80053, 0x80013, 0x8011b, 0x70111, 0x80073, 0x80033, 0x900c7,
  0x70109, 0x80063, 0x80023, 0x900a7, 0x80003, 0x80083, 0x80043, 0x900e7,
  0x70105, 0x8005b, 0x8001b, 0x90097, 0x70115, 0x8007b, 0x8003b, 0x900d7,
  0x7010d, 0x8006b, 0x8002b, 0x900b7, 0x8000b, 0x8008b, 0x8004b, 0x900f7,
  0x70103, 0x80057, 0x80017, 0x8011f, 0x70113, 0x80077, 0x80037, 0x900cf,
  0x7010b, 0x80067, 0x80027, 0x900af, 0x80007, 0x80087, 0x80047, 0x900ef,
  0x70107, 0x8005f, 0x8001f, 0x9009f, 0x70117, 0x8007f, 0x8003f, 0x900df,
  0x7010f, 0x8006f, 0x8002f, 0x900bf, 0x8000f, 0x8008f, 0x8004f, 0x900ff
]), 9];

var fixedDistCodeTab = [new Int32Array([
  0x50000, 0x50010, 0x50008, 0x50018, 0x50004, 0x50014, 0x5000c, 0x5001c,
  0x50002, 0x50012, 0x5000a, 0x5001a, 0x50006, 0x50016, 0x5000e, 0x00000,
  0x50001, 0x50011, 0x50009, 0x50019, 0x50005, 0x50015, 0x5000d, 0x5001d,
  0x50003, 0x50013, 0x5000b, 0x5001b, 0x50007, 0x50017, 0x5000f, 0x00000
]), 5];

function inflate(bytes, uncompressed_len) {
  var bytesPos = 0;

  var codeSize = 0;
  var codeBuf = 0;

  function getBits(bits) {
    var b;
    while (codeSize < bits) {
      b = bytes[bytesPos++] | 0;
      codeBuf |= b << codeSize;
      codeSize += 8;
    }
    b = codeBuf & ((1 << bits) - 1);
    codeBuf >>= bits;
    codeSize -= bits;
    return b;
  }

  function getCode(table) {
    var codes = table[0];
    var maxLen = table[1];

    while (codeSize < maxLen) {
      var b = bytes[bytesPos++] | 0;
      codeBuf |= (b << codeSize);
      codeSize += 8;
    }
    var code = codes[codeBuf & ((1 << maxLen) - 1)];
    var codeLen = code >> 16;
    var codeVal = code & 0xffff;
    if (codeSize == 0 || codeSize < codeLen || codeLen == 0)
      new Error('Bad encoding in flate stream');
    codeBuf >>= codeLen;
    codeSize -= codeLen;
    return codeVal;
  }

  function generateHuffmanTable(lengths) {
    var n = lengths.length;

    // find max code length
    var maxLen = 0;
    for (var i = 0; i < n; ++i) {
      if (lengths[i] > maxLen)
        maxLen = lengths[i];
    }

    // build the table
    var size = 1 << maxLen;
    var codes = new Int32Array(size);
    for (var len = 1, code = 0, skip = 2;
         len <= maxLen;
         ++len, code <<= 1, skip <<= 1) {
      for (var val = 0; val < n; ++val) {
        if (lengths[val] == len) {
          // bit-reverse the code
          var code2 = 0;
          var t = code;
          for (var i = 0; i < len; ++i) {
            code2 = (code2 << 1) | (t & 1);
            t >>= 1;
          }

          // fill the table entries
          for (var i = code2; i < size; i += skip)
            codes[i] = (len << 16) | val;

          ++code;
        }
      }
    }

    return [codes, maxLen];
  };

  var buffer = new Uint8Array(uncompressed_len);
  var bufferLength = 0;

  function readBlock() {
    var eof = false;

    // read block header
    var hdr = getBits(3);
    if (hdr & 1)
      eof = true;
    hdr >>= 1;

    if (hdr == 0) { // uncompressed block
      var b;

      if (typeof (b = bytes[bytesPos++]) == 'undefined')
        new Error('Bad block header in flate stream');
      var blockLen = b;
      if (typeof (b = bytes[bytesPos++]) == 'undefined')
        new Error('Bad block header in flate stream');
      blockLen |= (b << 8);
      if (typeof (b = bytes[bytesPos++]) == 'undefined')
        new Error('Bad block header in flate stream');
      var check = b;
      if (typeof (b = bytes[bytesPos++]) == 'undefined')
        new Error('Bad block header in flate stream');
      check |= (b << 8);
      if (check != (~blockLen & 0xffff))
        new Error('Bad uncompressed block length in flate stream');

      codeBuf = 0;
      codeSize = 0;

      var end = bufferLength + blockLen;
      for (; bufferLength < end && bytesPos < bytes.length; ++bufferLength, ++bytesPos) {
        buffer[bufferLength] = bytes[bytesPos];
      }

      return bytesPos === bytes.length;
    }

    var litCodeTable;
    var distCodeTable;
    if (hdr == 1) { // compressed block, fixed codes
      litCodeTable = fixedLitCodeTab;
      distCodeTable = fixedDistCodeTab;
    } else if (hdr == 2) { // compressed block, dynamic codes
      var numLitCodes = getBits(5) + 257;
      var numDistCodes = getBits(5) + 1;
      var numCodeLenCodes = getBits(4) + 4;

      // build the code lengths code table
      var codeLenCodeLengths = new Uint8Array(codeLenCodeMap.length);

      for (var i = 0; i < numCodeLenCodes; ++i)
        codeLenCodeLengths[codeLenCodeMap[i]] = getBits(3);
      var codeLenCodeTab = generateHuffmanTable(codeLenCodeLengths);

      // build the literal and distance code tables
      var len = 0;
      var i = 0;
      var codes = numLitCodes + numDistCodes;
      var codeLengths = new Uint8Array(codes);
      while (i < codes) {
        var code = getCode(codeLenCodeTab);
        if (code == 16) {
          var bitsLength = 2, bitsOffset = 3, what = len;
        } else if (code == 17) {
          var bitsLength = 3, bitsOffset = 3, what = (len = 0);
        } else if (code == 18) {
          var bitsLength = 7, bitsOffset = 11, what = (len = 0);
        } else {
          codeLengths[i++] = len = code;
          continue;
        }

        var repeatLength = getBits(bitsLength) + bitsOffset;
        while (repeatLength-- > 0)
          codeLengths[i++] = what;
      }

      litCodeTable = generateHuffmanTable(codeLengths.subarray(0, numLitCodes));
      distCodeTable = generateHuffmanTable(codeLengths.subarray(numLitCodes, codes));
    } else {
      new Error('Unknown block type in flate stream');
    }

    while (true) {
      var code1 = getCode(litCodeTable);
      if (code1 < 256) {
        buffer[bufferLength++] = code1;
        continue;
      }
      if (code1 == 256) {
        return eof;
      }
      code1 -= 257;
      code1 = lengthDecode[code1];
      var code2 = code1 >> 16;
      if (code2 > 0)
        code2 = getBits(code2);
      var len = (code1 & 0xffff) + code2;
      code1 = getCode(distCodeTable);
      code1 = distDecode[code1];
      code2 = code1 >> 16;
      if (code2 > 0)
        code2 = getBits(code2);
      var dist = (code1 & 0xffff) + code2;
      for (var k = 0; k < len; ++k, ++bufferLength)
        buffer[bufferLength] = buffer[bufferLength - dist];
    }
  };

  while (!readBlock())
    ;

  return buffer;
}

var arrays = J2ME.ArrayUtilities.makeArrays(256);

function ZipFile(buffer, extract) {
  var bytes = new Uint8Array(buffer);
  var view = new DataView(buffer);

  // check for magic signature
  if (view.getInt32(0, true) != 0x04034b50)
    return;

  // scan backwards to locate the central directory record
  var pos = bytes.length - 22;
  while (true) {
    if (pos < 0)
      return;
    if (bytes[pos] != 0x50) {
      --pos;
      continue;
    }
    if (view.getInt32(pos, true) == 0x06054b50)
      break;
    pos -= 4;
  }

  // read the central directory
  var directory = Object.create(null);
  var entries = view.getInt16(pos + 8, true);
  var pos = view.getInt32(pos + 16, true);
  while (entries--) {
    // check for directory entry signature
    if (view.getInt32(pos, true) != 0x02014b50)
      return;
    var compression_method = view.getInt16(pos + 10, true);
    var compressed_len = view.getInt32(pos + 20, true);
    var uncompressed_len = view.getInt32(pos + 24, true);
    var filename_len = view.getInt16(pos + 28, true);
    var extra_len = view.getInt16(pos + 30, true);
    var comment_len = view.getInt16(pos + 32, true);
    var local_header_offset = view.getInt32(pos + 42, true);
    // read the filename
    pos += 46;
    if (arrays.length < filename_len) {
      arrays = J2ME.ArrayUtilities.makeArrays(filename_len);
    }
    var array = arrays[filename_len];
    for (var n = 0; n < filename_len; ++n) {
      array[n] = String.fromCharCode(bytes[pos++]);
    }
    var filename = array.join("");
    // locate the compressed data
    var local_extra_len = view.getInt16(local_header_offset + 28, true);
    var data_offset = local_header_offset + 30 + filename_len + local_extra_len;

    // add the entry to the directory
    var compressed_data;
    var data = new Uint8Array(buffer, data_offset, compressed_len);
    if (extract) {
      compressed_data = new Uint8Array(compressed_len);
      compressed_data.set(data);
    } else {
      compressed_data = data;
    }

    directory[filename] = {
      compression_method: compression_method,
      compressed_data: compressed_data,
      uncompressed_len: uncompressed_len,
    };
    // advance to the next entry
    pos += extra_len + comment_len;
  }

  this.directory = directory;
}

ZipFile.prototype = {
  read: function(filename) {
    if (!this.directory)
      return null;
    var entry = this.directory[filename];
    if (!entry)
      return null;
    var data = entry.compressed_data;
    switch (entry.compression_method) {
    case 0: // stored
      return data;
    case 8: // deflated
      return inflate(data, entry.uncompressed_len);
    }
    return null;
  }
};

if (typeof module === 'object') {
  module.exports.ZipFile = ZipFile;
}


/* SOURCE: libs/jarstore.js */
/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */



var JARStore = (function() {
  var DATABASE = "JARStore";
  var VERSION = 2;
  var OBJECT_STORE_OLD = "files";
  var OBJECT_STORE_WITH_UNCOMPRESSED_LEN = "files_v2"
  var KEY_PATH = "jarName";

  var database;
  var jars = new Map();
  var jad;

  var upgrade = {
    "0to1": function(database, transaction, next) {
      database.createObjectStore(OBJECT_STORE_OLD, { keyPath: KEY_PATH });
      next();
    },
    "1to2": function(database, transaction, next) {
      database.deleteObjectStore(OBJECT_STORE_OLD);
      // We don't migrate data from the old format to the new one, but
      // rely on JARStore users to recreate the needed data.
      database.createObjectStore(OBJECT_STORE_WITH_UNCOMPRESSED_LEN, { keyPath: KEY_PATH });
      next();
    },
  };

  var openDatabase = new Promise(function(resolve, reject) {
    var request = indexedDB.open(DATABASE, VERSION);

    request.onerror = function() {
      console.error("error opening database: " + request.error.name);
      reject(request.error.name);
    };

    request.onupgradeneeded = function(event) {
      var database = request.result;
      var transaction = request.transaction;

      var version = event.oldVersion;
      (function next() {
        if (version < event.newVersion) {
          upgrade[version + "to" + ++version](database, transaction, next);
        }
      })();
    };

    request.onsuccess = function() {
      database = request.result;
      resolve();
    };
  });

  function addBuiltIn(jarName, jarData) {
    var zip = new ZipFile(jarData, false);

    jars.set(jarName, {
      directory: zip.directory,
      isBuiltIn: true,
    });
  }

  function installJAR(jarName, jarData, jadData) {
    return openDatabase.then(function() {
      return new Promise(function(resolve, reject) {
        var zip = new ZipFile(jarData, true);

        var transaction = database.transaction(OBJECT_STORE_WITH_UNCOMPRESSED_LEN, "readwrite");
        var objectStore = transaction.objectStore(OBJECT_STORE_WITH_UNCOMPRESSED_LEN);
        var request = objectStore.put({
          jarName: jarName,
          jar: zip.directory,
          jad: jadData || null,
        });

        request.onerror = function() {
          console.error("Error installing " + jarName + ": " + request.error.name);
          reject(request.error.name);
        };

        transaction.oncomplete = function() {
          jars.set(jarName, {
            directory: zip.directory,
            isBuiltIn: false,
          });
          jad = jadData;
          resolve();
        };
      });
    });
  }

  function loadJAR(jarName) {
    return openDatabase.then(function() {
      return new Promise(function(resolve, reject) {
        var transaction = database.transaction(OBJECT_STORE_WITH_UNCOMPRESSED_LEN, "readonly");
        var objectStore = transaction.objectStore(OBJECT_STORE_WITH_UNCOMPRESSED_LEN);
        var request = objectStore.get(jarName);

        request.onerror = function() {
          console.error("Error loading " + jarName + ": " + request.error.name);
          reject(request.error.name);
        };

        transaction.oncomplete = function() {
          if (request.result) {
            jars.set(jarName, {
              directory: request.result.jar,
              isBuiltIn: false,
            });

            if (request.result.jad) {
              jad = request.result.jad;
            }

            resolve(true);
          } else {
            resolve(false);
          }
        };
      });
    });
  }

  function loadFileFromJAR(jarName, fileName) {
    var jar = jars.get(jarName);
    if (!jar) {
      return null;
    }

    var entry = jar.directory[fileName];

    if (!entry) {
      return null;
    }

    var bytes;
    if (entry.compression_method === 0) {
      bytes = entry.compressed_data;
    } else if (entry.compression_method === 8) {
      bytes = inflate(entry.compressed_data, entry.uncompressed_len);
    } else {
      return null;
    }

    if (!jar.isBuiltIn && fileName.endsWith(".class")) {
      // Classes are loaded just once and then are cached in ClassRegistry::classes
      delete jar.directory[fileName];
    }

    return bytes;
  }

  function loadFile(fileName) {
    for (var jarName of jars.keys()) {
      var data = loadFileFromJAR(jarName, fileName);
      if (data) {
        return data;
      }
    }
  }

  function getJAD() {
    return jad;
  }

  function clear() {
    return openDatabase.then(function() {
      return new Promise(function(resolve, reject) {
        jars.clear();

        var transaction = database.transaction(OBJECT_STORE_WITH_UNCOMPRESSED_LEN, "readwrite");
        var objectStore = transaction.objectStore(OBJECT_STORE_WITH_UNCOMPRESSED_LEN);
        var request = objectStore.clear();

        request.onerror = function() {
          console.error("Error clearing: " + request.error.name);
          reject(request.error.name);
        };

        request.onsuccess = function() {
          resolve();
        };
      });
    });
  }

  function deleteDatabase() {
    return new Promise(function(resolve, reject) {
      database = null;
      var request = indexedDB.deleteDatabase(DATABASE);
      request.onsuccess = resolve;
      request.onerror = function() { reject(request.error.name) };
    });
  }

  return {
    addBuiltIn: addBuiltIn,
    installJAR: installJAR,
    loadJAR: loadJAR,
    loadFileFromJAR: loadFileFromJAR,
    loadFile: loadFile,
    getJAD: getJAD,
    clear: clear,
    deleteDatabase: deleteDatabase,
  };
})();

if (typeof module === 'object') {
  module.exports.JARStore = JARStore;
}


/* SOURCE: libs/encoding.js */
// Copyright 2014 Joshua Bell. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// If we're in node require encoding-indexes and attach it to the global.
if (typeof module !== "undefined" && module.exports) {
  this["encoding-indexes"] = require("./encoding-indexes.js")["encoding-indexes"];
}

(function(global) {
  

  //
  // Utilities
  //

  /**
   * @param {number} a The number to test.
   * @param {number} min The minimum value in the range, inclusive.
   * @param {number} max The maximum value in the range, inclusive.
   * @return {boolean} True if a >= min and a <= max.
   */
  function inRange(a, min, max) {
    return min <= a && a <= max;
  }

  /**
   * @param {number} n The numerator.
   * @param {number} d The denominator.
   * @return {number} The result of the integer division of n by d.
   */
  function div(n, d) {
    return Math.floor(n / d);
  }


  //
  // Implementation of Encoding specification
  // http://dvcs.w3.org/hg/encoding/raw-file/tip/Overview.html
  //

  //
  // 3. Terminology
  //

  //
  // 4. Encodings
  //

  /** @const */ var EOF_byte = -1;
  /** @const */ var EOF_code_point = -1;

  /**
   * @constructor
   * @param {Uint8Array} bytes Array of bytes that provide the stream.
   */
  function ByteInputStream(bytes) {
    /** @type {number} */
    var pos = 0;

    /**
     * @this {ByteInputStream}
     * @return {number} Get the next byte from the stream.
     */
    this.get = function() {
      return (pos >= bytes.length) ? EOF_byte : Number(bytes[pos]);
    };

    /** @param {number} n Number (positive or negative) by which to
     *      offset the byte pointer. */
    this.offset = function(n) {
      pos += n;
      if (pos < 0) {
        throw new Error('Seeking past start of the buffer');
      }
      if (pos > bytes.length) {
        throw new Error('Seeking past EOF');
      }
    };

    /**
     * @param {Array.<number>} test Array of bytes to compare against.
     * @return {boolean} True if the start of the stream matches the test
     *     bytes.
     */
    this.match = function(test) {
      if (test.length > pos + bytes.length) {
        return false;
      }
      var i;
      for (i = 0; i < test.length; i += 1) {
        if (Number(bytes[pos + i]) !== test[i]) {
          return false;
        }
      }
      return true;
    };
  }

  /**
   * @constructor
   * @param {Array.<number>} bytes The array to write bytes into.
   */
  function ByteOutputStream(bytes) {
    /** @type {number} */
    var pos = 0;

    /**
     * @param {...number} var_args The byte or bytes to emit into the stream.
     * @return {number} The last byte emitted.
     */
    this.emit = function(var_args) {
      /** @type {number} */
      var last = EOF_byte;
      var i;
      for (i = 0; i < arguments.length; ++i) {
        last = Number(arguments[i]);
        bytes[pos++] = last;
      }
      return last;
    };
  }

  /**
   * @constructor
   * @param {string} string The source of code units for the stream.
   */
  function CodePointInputStream(string) {
    /**
     * @param {string} string Input string of UTF-16 code units.
     * @return {Array.<number>} Code points.
     */
    function stringToCodePoints(string) {
      /** @type {Array.<number>} */
      var cps = [];
      // Based on http://www.w3.org/TR/WebIDL/#idl-DOMString
      var i = 0, n = string.length;
      while (i < string.length) {
        var c = string.charCodeAt(i);
        if (!inRange(c, 0xD800, 0xDFFF)) {
          cps.push(c);
        } else if (inRange(c, 0xDC00, 0xDFFF)) {
          cps.push(0xFFFD);
        } else { // (inRange(cu, 0xD800, 0xDBFF))
          if (i === n - 1) {
            cps.push(0xFFFD);
          } else {
            var d = string.charCodeAt(i + 1);
            if (inRange(d, 0xDC00, 0xDFFF)) {
              var a = c & 0x3FF;
              var b = d & 0x3FF;
              i += 1;
              cps.push(0x10000 + (a << 10) + b);
            } else {
              cps.push(0xFFFD);
            }
          }
        }
        i += 1;
      }
      return cps;
    }

    /** @type {number} */
    var pos = 0;
    /** @type {Array.<number>} */
    var cps = stringToCodePoints(string);

    /** @param {number} n The number of bytes (positive or negative)
     *      to advance the code point pointer by.*/
    this.offset = function(n) {
      pos += n;
      if (pos < 0) {
        throw new Error('Seeking past start of the buffer');
      }
      if (pos > cps.length) {
        throw new Error('Seeking past EOF');
      }
    };


    /** @return {number} Get the next code point from the stream. */
    this.get = function() {
      if (pos >= cps.length) {
        return EOF_code_point;
      }
      return cps[pos];
    };
  }

  /**
   * @constructor
   */
  function CodePointOutputStream() {
    /** @type {string} */
    var string = '';

    /** @return {string} The accumulated string. */
    this.string = function() {
      return string;
    };

    /** @param {number} c The code point to encode into the stream. */
    this.emit = function(c) {
      if (c <= 0xFFFF) {
        string += String.fromCharCode(c);
      } else {
        c -= 0x10000;
        string += String.fromCharCode(0xD800 + ((c >> 10) & 0x3ff));
        string += String.fromCharCode(0xDC00 + (c & 0x3ff));
      }
    };
  }

  /**
   * @constructor
   * @param {string} message Description of the error.
   */
  function EncodingError(message) {
    this.name = 'EncodingError';
    this.message = message;
    this.code = 0;
  }
  EncodingError.prototype = Error.prototype;

  /**
   * @param {boolean} fatal If true, decoding errors raise an exception.
   * @param {number=} opt_code_point Override the standard fallback code point.
   * @return {number} The code point to insert on a decoding error.
   */
  function decoderError(fatal, opt_code_point) {
    if (fatal) {
      throw new EncodingError('Decoder error');
    }
    return opt_code_point || 0xFFFD;
  }

  /**
   * @param {number} code_point The code point that could not be encoded.
   * @return {number} Always throws, no value is actually returned.
   */
  function encoderError(code_point) {
    throw new EncodingError('The code point ' + code_point +
                            ' could not be encoded.');
  }

  /**
   * @param {string} label The encoding label.
   * @return {?{name:string,labels:Array.<string>}}
   */
  function getEncoding(label) {
    label = String(label).trim().toLowerCase();
    if (Object.prototype.hasOwnProperty.call(label_to_encoding, label)) {
      return label_to_encoding[label];
    }
    return null;
  }

  /** @type {Array.<{encodings: Array.<{name:string,labels:Array.<string>}>,
   *      heading: string}>} */
  var encodings = [
    {
      "encodings": [
        {
          "labels": [
            "unicode-1-1-utf-8",
            "utf-8",
            "utf8"
          ],
          "name": "utf-8"
        }
      ],
      "heading": "The Encoding"
    },
    {
      "encodings": [
        {
          "labels": [
            "866",
            "cp866",
            "csibm866",
            "ibm866"
          ],
          "name": "ibm866"
        },
        {
          "labels": [
            "csisolatin2",
            "iso-8859-2",
            "iso-ir-101",
            "iso8859-2",
            "iso88592",
            "iso_8859-2",
            "iso_8859-2:1987",
            "l2",
            "latin2"
          ],
          "name": "iso-8859-2"
        },
        {
          "labels": [
            "csisolatin3",
            "iso-8859-3",
            "iso-ir-109",
            "iso8859-3",
            "iso88593",
            "iso_8859-3",
            "iso_8859-3:1988",
            "l3",
            "latin3"
          ],
          "name": "iso-8859-3"
        },
        {
          "labels": [
            "csisolatin4",
            "iso-8859-4",
            "iso-ir-110",
            "iso8859-4",
            "iso88594",
            "iso_8859-4",
            "iso_8859-4:1988",
            "l4",
            "latin4"
          ],
          "name": "iso-8859-4"
        },
        {
          "labels": [
            "csisolatincyrillic",
            "cyrillic",
            "iso-8859-5",
            "iso-ir-144",
            "iso8859-5",
            "iso88595",
            "iso_8859-5",
            "iso_8859-5:1988"
          ],
          "name": "iso-8859-5"
        },
        {
          "labels": [
            "arabic",
            "asmo-708",
            "csiso88596e",
            "csiso88596i",
            "csisolatinarabic",
            "ecma-114",
            "iso-8859-6",
            "iso-8859-6-e",
            "iso-8859-6-i",
            "iso-ir-127",
            "iso8859-6",
            "iso88596",
            "iso_8859-6",
            "iso_8859-6:1987"
          ],
          "name": "iso-8859-6"
        },
        {
          "labels": [
            "csisolatingreek",
            "ecma-118",
            "elot_928",
            "greek",
            "greek8",
            "iso-8859-7",
            "iso-ir-126",
            "iso8859-7",
            "iso88597",
            "iso_8859-7",
            "iso_8859-7:1987",
            "sun_eu_greek"
          ],
          "name": "iso-8859-7"
        },
        {
          "labels": [
            "csiso88598e",
            "csisolatinhebrew",
            "hebrew",
            "iso-8859-8",
            "iso-8859-8-e",
            "iso-ir-138",
            "iso8859-8",
            "iso88598",
            "iso_8859-8",
            "iso_8859-8:1988",
            "visual"
          ],
          "name": "iso-8859-8"
        },
        {
          "labels": [
            "csiso88598i",
            "iso-8859-8-i",
            "logical"
          ],
          "name": "iso-8859-8-i"
        },
        {
          "labels": [
            "csisolatin6",
            "iso-8859-10",
            "iso-ir-157",
            "iso8859-10",
            "iso885910",
            "l6",
            "latin6"
          ],
          "name": "iso-8859-10"
        },
        {
          "labels": [
            "iso-8859-13",
            "iso8859-13",
            "iso885913"
          ],
          "name": "iso-8859-13"
        },
        {
          "labels": [
            "iso-8859-14",
            "iso8859-14",
            "iso885914"
          ],
          "name": "iso-8859-14"
        },
        {
          "labels": [
            "csisolatin9",
            "iso-8859-15",
            "iso8859-15",
            "iso885915",
            "iso_8859-15",
            "l9"
          ],
          "name": "iso-8859-15"
        },
        {
          "labels": [
            "iso-8859-16"
          ],
          "name": "iso-8859-16"
        },
        {
          "labels": [
            "cskoi8r",
            "koi",
            "koi8",
            "koi8-r",
            "koi8_r"
          ],
          "name": "koi8-r"
        },
        {
          "labels": [
            "koi8-u"
          ],
          "name": "koi8-u"
        },
        {
          "labels": [
            "csmacintosh",
            "mac",
            "macintosh",
            "x-mac-roman"
          ],
          "name": "macintosh"
        },
        {
          "labels": [
            "dos-874",
            "iso-8859-11",
            "iso8859-11",
            "iso885911",
            "tis-620",
            "windows-874"
          ],
          "name": "windows-874"
        },
        {
          "labels": [
            "cp1250",
            "windows-1250",
            "x-cp1250"
          ],
          "name": "windows-1250"
        },
        {
          "labels": [
            "cp1251",
            "windows-1251",
            "x-cp1251"
          ],
          "name": "windows-1251"
        },
        {
          "labels": [
            "ansi_x3.4-1968",
            "ascii",
            "cp1252",
            "cp819",
            "csisolatin1",
            "ibm819",
            "iso-8859-1",
            "iso-ir-100",
            "iso8859-1",
            "iso88591",
            "iso_8859-1",
            "iso_8859-1:1987",
            "l1",
            "latin1",
            "us-ascii",
            "windows-1252",
            "x-cp1252"
          ],
          "name": "windows-1252"
        },
        {
          "labels": [
            "cp1253",
            "windows-1253",
            "x-cp1253"
          ],
          "name": "windows-1253"
        },
        {
          "labels": [
            "cp1254",
            "csisolatin5",
            "iso-8859-9",
            "iso-ir-148",
            "iso8859-9",
            "iso88599",
            "iso_8859-9",
            "iso_8859-9:1989",
            "l5",
            "latin5",
            "windows-1254",
            "x-cp1254"
          ],
          "name": "windows-1254"
        },
        {
          "labels": [
            "cp1255",
            "windows-1255",
            "x-cp1255"
          ],
          "name": "windows-1255"
        },
        {
          "labels": [
            "cp1256",
            "windows-1256",
            "x-cp1256"
          ],
          "name": "windows-1256"
        },
        {
          "labels": [
            "cp1257",
            "windows-1257",
            "x-cp1257"
          ],
          "name": "windows-1257"
        },
        {
          "labels": [
            "cp1258",
            "windows-1258",
            "x-cp1258"
          ],
          "name": "windows-1258"
        },
        {
          "labels": [
            "x-mac-cyrillic",
            "x-mac-ukrainian"
          ],
          "name": "x-mac-cyrillic"
        }
      ],
      "heading": "Legacy single-byte encodings"
    },
    {
      "encodings": [
        {
          "labels": [
            "chinese",
            "csgb2312",
            "csiso58gb231280",
            "gb18030",
            "gb2312",
            "gb_2312",
            "gb_2312-80",
            "gbk",
            "iso-ir-58",
            "x-gbk"
          ],
          "name": "gb18030"
        },
        {
          "labels": [
            "hz-gb-2312"
          ],
          "name": "hz-gb-2312"
        }
      ],
      "heading": "Legacy multi-byte Chinese (simplified) encodings"
    },
    {
      "encodings": [
        {
          "labels": [
            "big5",
            "big5-hkscs",
            "cn-big5",
            "csbig5",
            "x-x-big5"
          ],
          "name": "big5"
        }
      ],
      "heading": "Legacy multi-byte Chinese (traditional) encodings"
    },
    {
      "encodings": [
        {
          "labels": [
            "cseucpkdfmtjapanese",
            "euc-jp",
            "x-euc-jp"
          ],
          "name": "euc-jp"
        },
        {
          "labels": [
            "csiso2022jp",
            "iso-2022-jp"
          ],
          "name": "iso-2022-jp"
        },
        {
          "labels": [
            "csshiftjis",
            "ms_kanji",
            "shift-jis",
            "shift_jis",
            "sjis",
            "windows-31j",
            "x-sjis"
          ],
          "name": "shift_jis"
        }
      ],
      "heading": "Legacy multi-byte Japanese encodings"
    },
    {
      "encodings": [
        {
          "labels": [
            "cseuckr",
            "csksc56011987",
            "euc-kr",
            "iso-ir-149",
            "korean",
            "ks_c_5601-1987",
            "ks_c_5601-1989",
            "ksc5601",
            "ksc_5601",
            "windows-949"
          ],
          "name": "euc-kr"
        }
      ],
      "heading": "Legacy multi-byte Korean encodings"
    },
    {
      "encodings": [
        {
          "labels": [
            "csiso2022kr",
            "iso-2022-cn",
            "iso-2022-cn-ext",
            "iso-2022-kr"
          ],
          "name": "replacement"
        },
        {
          "labels": [
            "utf-16be"
          ],
          "name": "utf-16be"
        },
        {
          "labels": [
            "utf-16",
            "utf-16le"
          ],
          "name": "utf-16le"
        },
        {
          "labels": [
            "x-user-defined"
          ],
          "name": "x-user-defined"
        }
      ],
      "heading": "Legacy miscellaneous encodings"
    }
  ];

  var name_to_encoding = {};
  var label_to_encoding = {};
  encodings.forEach(function(category) {
    category['encodings'].forEach(function(encoding) {
      name_to_encoding[encoding['name']] = encoding;
      encoding['labels'].forEach(function(label) {
        label_to_encoding[label] = encoding;
      });
    });
  });

  //
  // 5. Indexes
  //

  /**
   * @param {number} pointer The |pointer| to search for.
   * @param {Array.<?number>|undefined} index The |index| to search within.
   * @return {?number} The code point corresponding to |pointer| in |index|,
   *     or null if |code point| is not in |index|.
   */
  function indexCodePointFor(pointer, index) {
    if (!index) return null;
    return index[pointer] || null;
  }

  /**
   * @param {number} code_point The |code point| to search for.
   * @param {Array.<?number>} index The |index| to search within.
   * @return {?number} The first pointer corresponding to |code point| in
   *     |index|, or null if |code point| is not in |index|.
   */
  function indexPointerFor(code_point, index) {
    var pointer = index.indexOf(code_point);
    return pointer === -1 ? null : pointer;
  }

  /**
   * @param {string} name Name of the index.
   * @return {(Array.<number>|Array.<Array.<number>>)}
   *  */
  function index(name) {
    if (!('encoding-indexes' in global))
      throw new Error("Indexes missing. Did you forget to include encoding-indexes.js?");
    return global['encoding-indexes'][name];
  }

  /**
   * @param {number} pointer The |pointer| to search for in the gb18030 index.
   * @return {?number} The code point corresponding to |pointer| in |index|,
   *     or null if |code point| is not in the gb18030 index.
   */
  function indexGB18030CodePointFor(pointer) {
    if ((pointer > 39419 && pointer < 189000) || (pointer > 1237575)) {
      return null;
    }
    var /** @type {number} */ offset = 0,
        /** @type {number} */ code_point_offset = 0,
        /** @type {Array.<Array.<number>>} */ idx = index('gb18030');
    var i;
    for (i = 0; i < idx.length; ++i) {
      var entry = idx[i];
      if (entry[0] <= pointer) {
        offset = entry[0];
        code_point_offset = entry[1];
      } else {
        break;
      }
    }
    return code_point_offset + pointer - offset;
  }

  /**
   * @param {number} code_point The |code point| to locate in the gb18030 index.
   * @return {number} The first pointer corresponding to |code point| in the
   *     gb18030 index.
   */
  function indexGB18030PointerFor(code_point) {
    var /** @type {number} */ offset = 0,
        /** @type {number} */ pointer_offset = 0,
        /** @type {Array.<Array.<number>>} */ idx = index('gb18030');
    var i;
    for (i = 0; i < idx.length; ++i) {
      var entry = idx[i];
      if (entry[1] <= code_point) {
        offset = entry[1];
        pointer_offset = entry[0];
      } else {
        break;
      }
    }
    return pointer_offset + code_point - offset;
  }


  //
  // 7. API
  //

  /** @const */ var DEFAULT_ENCODING = 'utf-8';

  // 7.1 Interface TextDecoder

  /**
   * @constructor
   * @param {string=} opt_encoding The label of the encoding;
   *     defaults to 'utf-8'.
   * @param {Object=} options
   */
  function TextDecoder(opt_encoding, options) {
    if (!(this instanceof TextDecoder)) {
      return new TextDecoder(opt_encoding, options);
    }
    opt_encoding = opt_encoding ? String(opt_encoding) : DEFAULT_ENCODING;
    options = Object(options);
    /** @private */
    this._encoding = getEncoding(opt_encoding);
    if (this._encoding === null || this._encoding.name === 'replacement')
      throw new TypeError('Unknown encoding: ' + opt_encoding);

    if (!this._encoding.getDecoder)
      throw new Error('Decoder not present. Did you forget to include encoding-indexes.js?');

    /** @private @type {boolean} */
    this._streaming = false;
    /** @private @type {boolean} */
    this._BOMseen = false;
    /** @private */
    this._decoder = null;
    /** @private @type {{fatal: boolean}} */
    this._options = { fatal: Boolean(options['fatal']) };

    if (Object.defineProperty) {
      Object.defineProperty(
          this, 'encoding',
          { get: function() { return this._encoding.name; } });
    } else {
      this.encoding = this._encoding.name;
    }

    return this;
  }

  // TODO: Issue if input byte stream is offset by decoder
  // TODO: BOM detection will not work if stream header spans multiple calls
  // (last N bytes of previous stream may need to be retained?)
  TextDecoder.prototype = {
    /**
     * @param {ArrayBufferView=} opt_view The buffer of bytes to decode.
     * @param {Object=} options
     */
    decode: function decode(opt_view, options) {
      if (opt_view && !('buffer' in opt_view && 'byteOffset' in opt_view &&
                        'byteLength' in opt_view)) {
        throw new TypeError('Expected ArrayBufferView');
      } else if (!opt_view) {
        opt_view = new Uint8Array(0);
      }
      options = Object(options);

      if (!this._streaming) {
        this._decoder = this._encoding.getDecoder(this._options);
        this._BOMseen = false;
      }
      this._streaming = Boolean(options['stream']);

      var bytes = new Uint8Array(opt_view.buffer,
                                 opt_view.byteOffset,
                                 opt_view.byteLength);
      var input_stream = new ByteInputStream(bytes);

      var output_stream = new CodePointOutputStream();

      /** @type {number} */
      var code_point;

      while (input_stream.get() !== EOF_byte) {
        code_point = this._decoder.decode(input_stream);
        if (code_point !== null && code_point !== EOF_code_point) {
          output_stream.emit(code_point);
        }
      }
      if (!this._streaming) {
        do {
          code_point = this._decoder.decode(input_stream);
          if (code_point !== null && code_point !== EOF_code_point) {
            output_stream.emit(code_point);
          }
        } while (code_point !== EOF_code_point &&
                 input_stream.get() != EOF_byte);
        this._decoder = null;
      }

      var result = output_stream.string();
      if (!this._BOMseen && result.length) {
        this._BOMseen = true;
        if (['utf-8', 'utf-16le', 'utf-16be'].indexOf(this.encoding) !== -1 &&
           result.charCodeAt(0) === 0xFEFF) {
          result = result.substring(1);
        }
      }

      return result;
    }
  };

  // 7.2 Interface TextEncoder

  /**
   * @constructor
   * @param {string=} opt_encoding The label of the encoding;
   *     defaults to 'utf-8'.
   * @param {{fatal: boolean}=} options
   */
  function TextEncoder(opt_encoding, options) {
    if (!(this instanceof TextEncoder)) {
      return new TextEncoder(opt_encoding, options);
    }
    opt_encoding = opt_encoding ? String(opt_encoding) : DEFAULT_ENCODING;
    options = Object(options);
    /** @private */
    this._encoding = getEncoding(opt_encoding);

    var allowLegacyEncoding = options.NONSTANDARD_allowLegacyEncoding;
    var isLegacyEncoding = (this._encoding.name !== 'utf-8' &&
                            this._encoding.name !== 'utf-16le' &&
                            this._encoding.name !== 'utf-16be');
    if (this._encoding === null || (isLegacyEncoding && !allowLegacyEncoding))
      throw new TypeError('Unknown encoding: ' + opt_encoding);

    if (!this._encoding.getEncoder)
      throw new Error('Encoder not present. Did you forget to include encoding-indexes.js?');

    /** @private @type {boolean} */
    this._streaming = false;
    /** @private */
    this._encoder = null;
    /** @private @type {{fatal: boolean}} */
    this._options = { fatal: Boolean(options['fatal']) };

    if (Object.defineProperty) {
      Object.defineProperty(
          this, 'encoding',
          { get: function() { return this._encoding.name; } });
    } else {
      this.encoding = this._encoding.name;
    }

    return this;
  }

  TextEncoder.prototype = {
    /**
     * @param {string=} opt_string The string to encode.
     * @param {{stream: boolean}=} options
     */
    encode: function encode(opt_string, options) {
      opt_string = opt_string ? String(opt_string) : '';
      options = Object(options);
      // TODO: any options?
      if (!this._streaming) {
        this._encoder = this._encoding.getEncoder(this._options);
      }
      this._streaming = Boolean(options['stream']);

      var bytes = [];
      var output_stream = new ByteOutputStream(bytes);
      var input_stream = new CodePointInputStream(opt_string);
      while (input_stream.get() !== EOF_code_point) {
        this._encoder.encode(output_stream, input_stream);
      }
      if (!this._streaming) {
        /** @type {number} */
        var last_byte;
        do {
          last_byte = this._encoder.encode(output_stream, input_stream);
        } while (last_byte !== EOF_byte);
        this._encoder = null;
      }
      return new Uint8Array(bytes);
    }
  };


  //
  // 8. The encoding
  //

  // 8.1 utf-8

  /**
   * @constructor
    * @param {{fatal: boolean}} options
   */
  function UTF8Decoder(options) {
    var fatal = options.fatal;
    var /** @type {number} */ utf8_code_point = 0,
        /** @type {number} */ utf8_bytes_needed = 0,
        /** @type {number} */ utf8_bytes_seen = 0,
        /** @type {number} */ utf8_lower_boundary = 0;

    /**
     * @param {ByteInputStream} byte_pointer The byte stream to decode.
     * @return {?number} The next code point decoded, or null if not enough
     *     data exists in the input stream to decode a complete code point.
     */
    this.decode = function(byte_pointer) {
      var bite = byte_pointer.get();
      if (bite === EOF_byte) {
        if (utf8_bytes_needed !== 0) {
          return decoderError(fatal);
        }
        return EOF_code_point;
      }
      byte_pointer.offset(1);

      if (utf8_bytes_needed === 0) {
        if (inRange(bite, 0x00, 0x7F)) {
          return bite;
        }
        if (inRange(bite, 0xC2, 0xDF)) {
          utf8_bytes_needed = 1;
          utf8_lower_boundary = 0x80;
          utf8_code_point = bite - 0xC0;
        } else if (inRange(bite, 0xE0, 0xEF)) {
          utf8_bytes_needed = 2;
          utf8_lower_boundary = 0x800;
          utf8_code_point = bite - 0xE0;
        } else if (inRange(bite, 0xF0, 0xF4)) {
          utf8_bytes_needed = 3;
          utf8_lower_boundary = 0x10000;
          utf8_code_point = bite - 0xF0;
        } else {
          return decoderError(fatal);
        }
        utf8_code_point = utf8_code_point * Math.pow(64, utf8_bytes_needed);
        return null;
      }
      if (!inRange(bite, 0x80, 0xBF)) {
        utf8_code_point = 0;
        utf8_bytes_needed = 0;
        utf8_bytes_seen = 0;
        utf8_lower_boundary = 0;
        byte_pointer.offset(-1);
        return decoderError(fatal);
      }
      utf8_bytes_seen += 1;
      utf8_code_point = utf8_code_point + (bite - 0x80) *
          Math.pow(64, utf8_bytes_needed - utf8_bytes_seen);
      if (utf8_bytes_seen !== utf8_bytes_needed) {
        return null;
      }
      var code_point = utf8_code_point;
      var lower_boundary = utf8_lower_boundary;
      utf8_code_point = 0;
      utf8_bytes_needed = 0;
      utf8_bytes_seen = 0;
      utf8_lower_boundary = 0;
      if (inRange(code_point, lower_boundary, 0x10FFFF) &&
          !inRange(code_point, 0xD800, 0xDFFF)) {
        return code_point;
      }
      return decoderError(fatal);
    };
  }

  /**
   * @constructor
   * @param {{fatal: boolean}} options
   */
  function UTF8Encoder(options) {
    var fatal = options.fatal;
    /**
     * @param {ByteOutputStream} output_byte_stream Output byte stream.
     * @param {CodePointInputStream} code_point_pointer Input stream.
     * @return {number} The last byte emitted.
     */
    this.encode = function(output_byte_stream, code_point_pointer) {
      /** @type {number} */
      var code_point = code_point_pointer.get();
      if (code_point === EOF_code_point) {
        return EOF_byte;
      }
      code_point_pointer.offset(1);
      if (inRange(code_point, 0xD800, 0xDFFF)) {
        return encoderError(code_point);
      }
      if (inRange(code_point, 0x0000, 0x007f)) {
        return output_byte_stream.emit(code_point);
      }
      var count, offset;
      if (inRange(code_point, 0x0080, 0x07FF)) {
        count = 1;
        offset = 0xC0;
      } else if (inRange(code_point, 0x0800, 0xFFFF)) {
        count = 2;
        offset = 0xE0;
      } else if (inRange(code_point, 0x10000, 0x10FFFF)) {
        count = 3;
        offset = 0xF0;
      }
      var result = output_byte_stream.emit(
          div(code_point, Math.pow(64, count)) + offset);
      while (count > 0) {
        var temp = div(code_point, Math.pow(64, count - 1));
        result = output_byte_stream.emit(0x80 + (temp % 64));
        count -= 1;
      }
      return result;
    };
  }

  /** @param {{fatal: boolean}} options */
  name_to_encoding['utf-8'].getEncoder = function(options) {
    return new UTF8Encoder(options);
  };
  /** @param {{fatal: boolean}} options */
  name_to_encoding['utf-8'].getDecoder = function(options) {
    return new UTF8Decoder(options);
  };

  //
  // 9. Legacy single-byte encodings
  //

  /**
   * @constructor
   * @param {Array.<number>} index The encoding index.
   * @param {{fatal: boolean}} options
   */
  function SingleByteDecoder(index, options) {
    var fatal = options.fatal;
    /**
     * @param {ByteInputStream} byte_pointer The byte stream to decode.
     * @return {?number} The next code point decoded, or null if not enough
     *     data exists in the input stream to decode a complete code point.
     */
    this.decode = function(byte_pointer) {
      var bite = byte_pointer.get();
      if (bite === EOF_byte) {
        return EOF_code_point;
      }
      byte_pointer.offset(1);
      if (inRange(bite, 0x00, 0x7F)) {
        return bite;
      }
      var code_point = index[bite - 0x80];
      if (code_point === null) {
        return decoderError(fatal);
      }
      return code_point;
    };
  }

  /**
   * @constructor
   * @param {Array.<?number>} index The encoding index.
   * @param {{fatal: boolean}} options
   */
  function SingleByteEncoder(index, options) {
    var fatal = options.fatal;
    /**
     * @param {ByteOutputStream} output_byte_stream Output byte stream.
     * @param {CodePointInputStream} code_point_pointer Input stream.
     * @return {number} The last byte emitted.
     */
    this.encode = function(output_byte_stream, code_point_pointer) {
      var code_point = code_point_pointer.get();
      if (code_point === EOF_code_point) {
        return EOF_byte;
      }
      code_point_pointer.offset(1);
      if (inRange(code_point, 0x0000, 0x007F)) {
        return output_byte_stream.emit(code_point);
      }
      var pointer = indexPointerFor(code_point, index);
      if (pointer === null) {
        encoderError(code_point);
      }
      return output_byte_stream.emit(pointer + 0x80);
    };
  }

  (function() {
    if (!('encoding-indexes' in global))
      return;
    encodings.forEach(function(category) {
      if (category['heading'] !== 'Legacy single-byte encodings')
        return;
      category['encodings'].forEach(function(encoding) {
        var idx = index(encoding['name']);
        /** @param {{fatal: boolean}} options */
        encoding.getDecoder = function(options) {
          return new SingleByteDecoder(idx, options);
        };
        /** @param {{fatal: boolean}} options */
        encoding.getEncoder = function(options) {
          return new SingleByteEncoder(idx, options);
        };
      });
    });
  }());

  //
  // 10. Legacy multi-byte Chinese (simplified) encodings
  //

  // 9.1 gb18030

  /**
   * @constructor
   * @param {{fatal: boolean}} options
   */
  function GB18030Decoder(options) {
    var fatal = options.fatal;
    var /** @type {number} */ gb18030_first = 0x00,
        /** @type {number} */ gb18030_second = 0x00,
        /** @type {number} */ gb18030_third = 0x00;
    /**
     * @param {ByteInputStream} byte_pointer The byte stream to decode.
     * @return {?number} The next code point decoded, or null if not enough
     *     data exists in the input stream to decode a complete code point.
     */
    this.decode = function(byte_pointer) {
      var bite = byte_pointer.get();
      if (bite === EOF_byte && gb18030_first === 0x00 &&
          gb18030_second === 0x00 && gb18030_third === 0x00) {
        return EOF_code_point;
      }
      if (bite === EOF_byte &&
          (gb18030_first !== 0x00 || gb18030_second !== 0x00 || gb18030_third !== 0x00)) {
        gb18030_first = 0x00;
        gb18030_second = 0x00;
        gb18030_third = 0x00;
        decoderError(fatal);
      }
      byte_pointer.offset(1);
      var code_point;
      if (gb18030_third !== 0x00) {
        code_point = null;
        if (inRange(bite, 0x30, 0x39)) {
          code_point = indexGB18030CodePointFor(
              (((gb18030_first - 0x81) * 10 + (gb18030_second - 0x30)) * 126 +
               (gb18030_third - 0x81)) * 10 + bite - 0x30);
        }
        gb18030_first = 0x00;
        gb18030_second = 0x00;
        gb18030_third = 0x00;
        if (code_point === null) {
          byte_pointer.offset(-3);
          return decoderError(fatal);
        }
        return code_point;
      }
      if (gb18030_second !== 0x00) {
        if (inRange(bite, 0x81, 0xFE)) {
          gb18030_third = bite;
          return null;
        }
        byte_pointer.offset(-2);
        gb18030_first = 0x00;
        gb18030_second = 0x00;
        return decoderError(fatal);
      }
      if (gb18030_first !== 0x00) {
        if (inRange(bite, 0x30, 0x39)) {
          gb18030_second = bite;
          return null;
        }
        var lead = gb18030_first;
        var pointer = null;
        gb18030_first = 0x00;
        var offset = bite < 0x7F ? 0x40 : 0x41;
        if (inRange(bite, 0x40, 0x7E) || inRange(bite, 0x80, 0xFE)) {
          pointer = (lead - 0x81) * 190 + (bite - offset);
        }
        code_point = pointer === null ? null :
            indexCodePointFor(pointer, index('gb18030'));
        if (pointer === null) {
          byte_pointer.offset(-1);
        }
        if (code_point === null) {
          return decoderError(fatal);
        }
        return code_point;
      }
      if (inRange(bite, 0x00, 0x7F)) {
        return bite;
      }
      if (bite === 0x80) {
        return 0x20AC;
      }
      if (inRange(bite, 0x81, 0xFE)) {
        gb18030_first = bite;
        return null;
      }
      return decoderError(fatal);
    };
  }

  /**
   * @constructor
   * @param {{fatal: boolean}} options
   */
  function GB18030Encoder(options) {
    var fatal = options.fatal;
    /**
     * @param {ByteOutputStream} output_byte_stream Output byte stream.
     * @param {CodePointInputStream} code_point_pointer Input stream.
     * @return {number} The last byte emitted.
     */
    this.encode = function(output_byte_stream, code_point_pointer) {
      var code_point = code_point_pointer.get();
      if (code_point === EOF_code_point) {
        return EOF_byte;
      }
      code_point_pointer.offset(1);
      if (inRange(code_point, 0x0000, 0x007F)) {
        return output_byte_stream.emit(code_point);
      }
      var pointer = indexPointerFor(code_point, index('gb18030'));
      if (pointer !== null) {
        var lead = div(pointer, 190) + 0x81;
        var trail = pointer % 190;
        var offset = trail < 0x3F ? 0x40 : 0x41;
        return output_byte_stream.emit(lead, trail + offset);
      }
      pointer = indexGB18030PointerFor(code_point);
      var byte1 = div(div(div(pointer, 10), 126), 10);
      pointer = pointer - byte1 * 10 * 126 * 10;
      var byte2 = div(div(pointer, 10), 126);
      pointer = pointer - byte2 * 10 * 126;
      var byte3 = div(pointer, 10);
      var byte4 = pointer - byte3 * 10;
      return output_byte_stream.emit(byte1 + 0x81,
                                     byte2 + 0x30,
                                     byte3 + 0x81,
                                     byte4 + 0x30);
    };
  }

  /** @param {{fatal: boolean}} options */
  name_to_encoding['gb18030'].getEncoder = function(options) {
    return new GB18030Encoder(options);
  };
  /** @param {{fatal: boolean}} options */
  name_to_encoding['gb18030'].getDecoder = function(options) {
    return new GB18030Decoder(options);
  };

  // 10.2 hz-gb-2312

  /**
   * @constructor
   * @param {{fatal: boolean}} options
   */
  function HZGB2312Decoder(options) {
    var fatal = options.fatal;
    var /** @type {boolean} */ hzgb2312 = false,
        /** @type {number} */ hzgb2312_lead = 0x00;
    /**
     * @param {ByteInputStream} byte_pointer The byte stream to decode.
     * @return {?number} The next code point decoded, or null if not enough
     *     data exists in the input stream to decode a complete code point.
     */
    this.decode = function(byte_pointer) {
      var bite = byte_pointer.get();
      if (bite === EOF_byte && hzgb2312_lead === 0x00) {
        return EOF_code_point;
      }
      if (bite === EOF_byte && hzgb2312_lead !== 0x00) {
        hzgb2312_lead = 0x00;
        return decoderError(fatal);
      }
      byte_pointer.offset(1);
      if (hzgb2312_lead === 0x7E) {
        hzgb2312_lead = 0x00;
        if (bite === 0x7B) {
          hzgb2312 = true;
          return null;
        }
        if (bite === 0x7D) {
          hzgb2312 = false;
          return null;
        }
        if (bite === 0x7E) {
          return 0x007E;
        }
        if (bite === 0x0A) {
          return null;
        }
        byte_pointer.offset(-1);
        return decoderError(fatal);
      }
      if (hzgb2312_lead !== 0x00) {
        var lead = hzgb2312_lead;
        hzgb2312_lead = 0x00;
        var code_point = null;
        if (inRange(bite, 0x21, 0x7E)) {
          code_point = indexCodePointFor((lead - 1) * 190 +
                                         (bite + 0x3F), index('gb18030'));
        }
        if (bite === 0x0A) {
          hzgb2312 = false;
        }
        if (code_point === null) {
          return decoderError(fatal);
        }
        return code_point;
      }
      if (bite === 0x7E) {
        hzgb2312_lead = 0x7E;
        return null;
      }
      if (hzgb2312) {
        if (inRange(bite, 0x20, 0x7F)) {
          hzgb2312_lead = bite;
          return null;
        }
        if (bite === 0x0A) {
          hzgb2312 = false;
        }
        return decoderError(fatal);
      }
      if (inRange(bite, 0x00, 0x7F)) {
        return bite;
      }
      return decoderError(fatal);
    };
  }

  /**
   * @constructor
   * @param {{fatal: boolean}} options
   */
  function HZGB2312Encoder(options) {
    var fatal = options.fatal;
    /** @type {boolean} */
    var hzgb2312 = false;
    /**
     * @param {ByteOutputStream} output_byte_stream Output byte stream.
     * @param {CodePointInputStream} code_point_pointer Input stream.
     * @return {number} The last byte emitted.
     */
    this.encode = function(output_byte_stream, code_point_pointer) {
      var code_point = code_point_pointer.get();
      if (code_point === EOF_code_point) {
        return EOF_byte;
      }
      code_point_pointer.offset(1);
      if (inRange(code_point, 0x0000, 0x007F) && hzgb2312) {
        code_point_pointer.offset(-1);
        hzgb2312 = false;
        return output_byte_stream.emit(0x7E, 0x7D);
      }
      if (code_point === 0x007E) {
        return output_byte_stream.emit(0x7E, 0x7E);
      }
      if (inRange(code_point, 0x0000, 0x007F)) {
        return output_byte_stream.emit(code_point);
      }
      if (!hzgb2312) {
        code_point_pointer.offset(-1);
        hzgb2312 = true;
        return output_byte_stream.emit(0x7E, 0x7B);
      }
      var pointer = indexPointerFor(code_point, index('gb18030'));
      if (pointer === null) {
        return encoderError(code_point);
      }
      var lead = div(pointer, 190) + 1;
      var trail = pointer % 190 - 0x3F;
      if (!inRange(lead, 0x21, 0x7E) || !inRange(trail, 0x21, 0x7E)) {
        return encoderError(code_point);
      }
      return output_byte_stream.emit(lead, trail);
    };
  }

  /** @param {{fatal: boolean}} options */
  name_to_encoding['hz-gb-2312'].getEncoder = function(options) {
    return new HZGB2312Encoder(options);
  };
  /** @param {{fatal: boolean}} options */
  name_to_encoding['hz-gb-2312'].getDecoder = function(options) {
    return new HZGB2312Decoder(options);
  };

  //
  // 11. Legacy multi-byte Chinese (traditional) encodings
  //

  // 11.1 big5

  /**
   * @constructor
   * @param {{fatal: boolean}} options
   */
  function Big5Decoder(options) {
    var fatal = options.fatal;
    var /** @type {number} */ big5_lead = 0x00,
        /** @type {?number} */ big5_pending = null;

    /**
     * @param {ByteInputStream} byte_pointer The byte steram to decode.
     * @return {?number} The next code point decoded, or null if not enough
     *     data exists in the input stream to decode a complete code point.
     */
    this.decode = function(byte_pointer) {
      // NOTE: Hack to support emitting two code points
      if (big5_pending !== null) {
        var pending = big5_pending;
        big5_pending = null;
        return pending;
      }
      var bite = byte_pointer.get();
      if (bite === EOF_byte && big5_lead === 0x00) {
        return EOF_code_point;
      }
      if (bite === EOF_byte && big5_lead !== 0x00) {
        big5_lead = 0x00;
        return decoderError(fatal);
      }
      byte_pointer.offset(1);
      if (big5_lead !== 0x00) {
        var lead = big5_lead;
        var pointer = null;
        big5_lead = 0x00;
        var offset = bite < 0x7F ? 0x40 : 0x62;
        if (inRange(bite, 0x40, 0x7E) || inRange(bite, 0xA1, 0xFE)) {
          pointer = (lead - 0x81) * 157 + (bite - offset);
        }
        if (pointer === 1133) {
          big5_pending = 0x0304;
          return 0x00CA;
        }
        if (pointer === 1135) {
          big5_pending = 0x030C;
          return 0x00CA;
        }
        if (pointer === 1164) {
          big5_pending = 0x0304;
          return 0x00EA;
        }
        if (pointer === 1166) {
          big5_pending = 0x030C;
          return 0x00EA;
        }
        var code_point = (pointer === null) ? null :
            indexCodePointFor(pointer, index('big5'));
        if (pointer === null) {
          byte_pointer.offset(-1);
        }
        if (code_point === null) {
          return decoderError(fatal);
        }
        return code_point;
      }
      if (inRange(bite, 0x00, 0x7F)) {
        return bite;
      }
      if (inRange(bite, 0x81, 0xFE)) {
        big5_lead = bite;
        return null;
      }
      return decoderError(fatal);
    };
  }

  /**
   * @constructor
   * @param {{fatal: boolean}} options
   */
  function Big5Encoder(options) {
    var fatal = options.fatal;
    /**
     * @param {ByteOutputStream} output_byte_stream Output byte stream.
     * @param {CodePointInputStream} code_point_pointer Input stream.
     * @return {number} The last byte emitted.
     */
    this.encode = function(output_byte_stream, code_point_pointer) {
      var code_point = code_point_pointer.get();
      if (code_point === EOF_code_point) {
        return EOF_byte;
      }
      code_point_pointer.offset(1);
      if (inRange(code_point, 0x0000, 0x007F)) {
        return output_byte_stream.emit(code_point);
      }
      var pointer = indexPointerFor(code_point, index('big5'));
      if (pointer === null) {
        return encoderError(code_point);
      }
      var lead = div(pointer, 157) + 0x81;
      //if (lead < 0xA1) {
      //  return encoderError(code_point);
      //}
      var trail = pointer % 157;
      var offset = trail < 0x3F ? 0x40 : 0x62;
      return output_byte_stream.emit(lead, trail + offset);
    };
  }

  /** @param {{fatal: boolean}} options */
  name_to_encoding['big5'].getEncoder = function(options) {
    return new Big5Encoder(options);
  };
  /** @param {{fatal: boolean}} options */
  name_to_encoding['big5'].getDecoder = function(options) {
    return new Big5Decoder(options);
  };


  //
  // 12. Legacy multi-byte Japanese encodings
  //

  // 12.1 euc.jp

  /**
   * @constructor
   * @param {{fatal: boolean}} options
   */
  function EUCJPDecoder(options) {
    var fatal = options.fatal;
    var /** @type {number} */ eucjp_first = 0x00,
        /** @type {number} */ eucjp_second = 0x00;
    /**
     * @param {ByteInputStream} byte_pointer The byte stream to decode.
     * @return {?number} The next code point decoded, or null if not enough
     *     data exists in the input stream to decode a complete code point.
     */
    this.decode = function(byte_pointer) {
      var bite = byte_pointer.get();
      if (bite === EOF_byte) {
        if (eucjp_first === 0x00 && eucjp_second === 0x00) {
          return EOF_code_point;
        }
        eucjp_first = 0x00;
        eucjp_second = 0x00;
        return decoderError(fatal);
      }
      byte_pointer.offset(1);

      var lead, code_point;
      if (eucjp_second !== 0x00) {
        lead = eucjp_second;
        eucjp_second = 0x00;
        code_point = null;
        if (inRange(lead, 0xA1, 0xFE) && inRange(bite, 0xA1, 0xFE)) {
          code_point = indexCodePointFor((lead - 0xA1) * 94 + bite - 0xA1,
                                         index('jis0212'));
        }
        if (!inRange(bite, 0xA1, 0xFE)) {
          byte_pointer.offset(-1);
        }
        if (code_point === null) {
          return decoderError(fatal);
        }
        return code_point;
      }
      if (eucjp_first === 0x8E && inRange(bite, 0xA1, 0xDF)) {
        eucjp_first = 0x00;
        return 0xFF61 + bite - 0xA1;
      }
      if (eucjp_first === 0x8F && inRange(bite, 0xA1, 0xFE)) {
        eucjp_first = 0x00;
        eucjp_second = bite;
        return null;
      }
      if (eucjp_first !== 0x00) {
        lead = eucjp_first;
        eucjp_first = 0x00;
        code_point = null;
        if (inRange(lead, 0xA1, 0xFE) && inRange(bite, 0xA1, 0xFE)) {
          code_point = indexCodePointFor((lead - 0xA1) * 94 + bite - 0xA1,
                                         index('jis0208'));
        }
        if (!inRange(bite, 0xA1, 0xFE)) {
          byte_pointer.offset(-1);
        }
        if (code_point === null) {
          return decoderError(fatal);
        }
        return code_point;
      }
      if (inRange(bite, 0x00, 0x7F)) {
        return bite;
      }
      if (bite === 0x8E || bite === 0x8F || (inRange(bite, 0xA1, 0xFE))) {
        eucjp_first = bite;
        return null;
      }
      return decoderError(fatal);
    };
  }

  /**
   * @constructor
   * @param {{fatal: boolean}} options
   */
  function EUCJPEncoder(options) {
    var fatal = options.fatal;
    /**
     * @param {ByteOutputStream} output_byte_stream Output byte stream.
     * @param {CodePointInputStream} code_point_pointer Input stream.
     * @return {number} The last byte emitted.
     */
    this.encode = function(output_byte_stream, code_point_pointer) {
      var code_point = code_point_pointer.get();
      if (code_point === EOF_code_point) {
        return EOF_byte;
      }
      code_point_pointer.offset(1);
      if (inRange(code_point, 0x0000, 0x007F)) {
        return output_byte_stream.emit(code_point);
      }
      if (code_point === 0x00A5) {
        return output_byte_stream.emit(0x5C);
      }
      if (code_point === 0x203E) {
        return output_byte_stream.emit(0x7E);
      }
      if (inRange(code_point, 0xFF61, 0xFF9F)) {
        return output_byte_stream.emit(0x8E, code_point - 0xFF61 + 0xA1);
      }

      var pointer = indexPointerFor(code_point, index('jis0208'));
      if (pointer === null) {
        return encoderError(code_point);
      }
      var lead = div(pointer, 94) + 0xA1;
      var trail = pointer % 94 + 0xA1;
      return output_byte_stream.emit(lead, trail);
    };
  }

  /** @param {{fatal: boolean}} options */
  name_to_encoding['euc-jp'].getEncoder = function(options) {
    return new EUCJPEncoder(options);
  };
  /** @param {{fatal: boolean}} options */
  name_to_encoding['euc-jp'].getDecoder = function(options) {
    return new EUCJPDecoder(options);
  };

  // 12.2 iso-2022-jp

  /**
   * @constructor
   * @param {{fatal: boolean}} options
   */
  function ISO2022JPDecoder(options) {
    var fatal = options.fatal;
    /** @enum */
    var state = {
      ASCII: 0,
      escape_start: 1,
      escape_middle: 2,
      escape_final: 3,
      lead: 4,
      trail: 5,
      Katakana: 6
    };
    var /** @type {number} */ iso2022jp_state = state.ASCII,
        /** @type {boolean} */ iso2022jp_jis0212 = false,
        /** @type {number} */ iso2022jp_lead = 0x00;
    /**
     * @param {ByteInputStream} byte_pointer The byte stream to decode.
     * @return {?number} The next code point decoded, or null if not enough
     *     data exists in the input stream to decode a complete code point.
     */
    this.decode = function(byte_pointer) {
      var bite = byte_pointer.get();
      if (bite !== EOF_byte) {
        byte_pointer.offset(1);
      }
      switch (iso2022jp_state) {
        default:
        case state.ASCII:
          if (bite === 0x1B) {
            iso2022jp_state = state.escape_start;
            return null;
          }
          if (inRange(bite, 0x00, 0x7F)) {
            return bite;
          }
          if (bite === EOF_byte) {
            return EOF_code_point;
          }
          return decoderError(fatal);

        case state.escape_start:
          if (bite === 0x24 || bite === 0x28) {
            iso2022jp_lead = bite;
            iso2022jp_state = state.escape_middle;
            return null;
          }
          if (bite !== EOF_byte) {
            byte_pointer.offset(-1);
          }
          iso2022jp_state = state.ASCII;
          return decoderError(fatal);

        case state.escape_middle:
          var lead = iso2022jp_lead;
          iso2022jp_lead = 0x00;
          if (lead === 0x24 && (bite === 0x40 || bite === 0x42)) {
            iso2022jp_jis0212 = false;
            iso2022jp_state = state.lead;
            return null;
          }
          if (lead === 0x24 && bite === 0x28) {
            iso2022jp_state = state.escape_final;
            return null;
          }
          if (lead === 0x28 && (bite === 0x42 || bite === 0x4A)) {
            iso2022jp_state = state.ASCII;
            return null;
          }
          if (lead === 0x28 && bite === 0x49) {
            iso2022jp_state = state.Katakana;
            return null;
          }
          if (bite === EOF_byte) {
            byte_pointer.offset(-1);
          } else {
            byte_pointer.offset(-2);
          }
          iso2022jp_state = state.ASCII;
          return decoderError(fatal);

        case state.escape_final:
          if (bite === 0x44) {
            iso2022jp_jis0212 = true;
            iso2022jp_state = state.lead;
            return null;
          }
          if (bite === EOF_byte) {
            byte_pointer.offset(-2);
          } else {
            byte_pointer.offset(-3);
          }
          iso2022jp_state = state.ASCII;
          return decoderError(fatal);

        case state.lead:
          if (bite === 0x0A) {
            iso2022jp_state = state.ASCII;
            return decoderError(fatal, 0x000A);
          }
          if (bite === 0x1B) {
            iso2022jp_state = state.escape_start;
            return null;
          }
          if (bite === EOF_byte) {
            return EOF_code_point;
          }
          iso2022jp_lead = bite;
          iso2022jp_state = state.trail;
          return null;

        case state.trail:
          iso2022jp_state = state.lead;
          if (bite === EOF_byte) {
            return decoderError(fatal);
          }
          var code_point = null;
          var pointer = (iso2022jp_lead - 0x21) * 94 + bite - 0x21;
          if (inRange(iso2022jp_lead, 0x21, 0x7E) &&
              inRange(bite, 0x21, 0x7E)) {
            code_point = (iso2022jp_jis0212 === false) ?
                indexCodePointFor(pointer, index('jis0208')) :
                indexCodePointFor(pointer, index('jis0212'));
          }
          if (code_point === null) {
            return decoderError(fatal);
          }
          return code_point;

        case state.Katakana:
          if (bite === 0x1B) {
            iso2022jp_state = state.escape_start;
            return null;
          }
          if (inRange(bite, 0x21, 0x5F)) {
            return 0xFF61 + bite - 0x21;
          }
          if (bite === EOF_byte) {
            return EOF_code_point;
          }
          return decoderError(fatal);
      }
    };
  }

  /**
   * @constructor
   * @param {{fatal: boolean}} options
   */
  function ISO2022JPEncoder(options) {
    var fatal = options.fatal;
    /** @enum */
    var state = {
      ASCII: 0,
      lead: 1,
      Katakana: 2
    };
    var /** @type {number} */ iso2022jp_state = state.ASCII;
    /**
     * @param {ByteOutputStream} output_byte_stream Output byte stream.
     * @param {CodePointInputStream} code_point_pointer Input stream.
     * @return {number} The last byte emitted.
     */
    this.encode = function(output_byte_stream, code_point_pointer) {
      var code_point = code_point_pointer.get();
      if (code_point === EOF_code_point) {
        return EOF_byte;
      }
      code_point_pointer.offset(1);
      if ((inRange(code_point, 0x0000, 0x007F) ||
           code_point === 0x00A5 || code_point === 0x203E) &&
          iso2022jp_state !== state.ASCII) {
        code_point_pointer.offset(-1);
        iso2022jp_state = state.ASCII;
        return output_byte_stream.emit(0x1B, 0x28, 0x42);
      }
      if (inRange(code_point, 0x0000, 0x007F)) {
        return output_byte_stream.emit(code_point);
      }
      if (code_point === 0x00A5) {
        return output_byte_stream.emit(0x5C);
      }
      if (code_point === 0x203E) {
        return output_byte_stream.emit(0x7E);
      }
      if (inRange(code_point, 0xFF61, 0xFF9F) &&
          iso2022jp_state !== state.Katakana) {
        code_point_pointer.offset(-1);
        iso2022jp_state = state.Katakana;
        return output_byte_stream.emit(0x1B, 0x28, 0x49);
      }
      if (inRange(code_point, 0xFF61, 0xFF9F)) {
        return output_byte_stream.emit(code_point - 0xFF61 - 0x21);
      }
      if (iso2022jp_state !== state.lead) {
        code_point_pointer.offset(-1);
        iso2022jp_state = state.lead;
        return output_byte_stream.emit(0x1B, 0x24, 0x42);
      }
      var pointer = indexPointerFor(code_point, index('jis0208'));
      if (pointer === null) {
        return encoderError(code_point);
      }
      var lead = div(pointer, 94) + 0x21;
      var trail = pointer % 94 + 0x21;
      return output_byte_stream.emit(lead, trail);
    };
  }

  /** @param {{fatal: boolean}} options */
  name_to_encoding['iso-2022-jp'].getEncoder = function(options) {
    return new ISO2022JPEncoder(options);
  };
  /** @param {{fatal: boolean}} options */
  name_to_encoding['iso-2022-jp'].getDecoder = function(options) {
    return new ISO2022JPDecoder(options);
  };

  // 12.3 shift_jis

  /**
   * @constructor
   * @param {{fatal: boolean}} options
   */
  function ShiftJISDecoder(options) {
    var fatal = options.fatal;
    var /** @type {number} */ shiftjis_lead = 0x00;
    /**
     * @param {ByteInputStream} byte_pointer The byte stream to decode.
     * @return {?number} The next code point decoded, or null if not enough
     *     data exists in the input stream to decode a complete code point.
     */
    this.decode = function(byte_pointer) {
      var bite = byte_pointer.get();
      if (bite === EOF_byte && shiftjis_lead === 0x00) {
        return EOF_code_point;
      }
      if (bite === EOF_byte && shiftjis_lead !== 0x00) {
        shiftjis_lead = 0x00;
        return decoderError(fatal);
      }
      byte_pointer.offset(1);
      if (shiftjis_lead !== 0x00) {
        var lead = shiftjis_lead;
        shiftjis_lead = 0x00;
        if (inRange(bite, 0x40, 0x7E) || inRange(bite, 0x80, 0xFC)) {
          var offset = (bite < 0x7F) ? 0x40 : 0x41;
          var lead_offset = (lead < 0xA0) ? 0x81 : 0xC1;
          var code_point = indexCodePointFor((lead - lead_offset) * 188 +
                                             bite - offset, index('jis0208'));
          if (code_point === null) {
            return decoderError(fatal);
          }
          return code_point;
        }
        byte_pointer.offset(-1);
        return decoderError(fatal);
      }
      if (inRange(bite, 0x00, 0x80)) {
        return bite;
      }
      if (inRange(bite, 0xA1, 0xDF)) {
        return 0xFF61 + bite - 0xA1;
      }
      if (inRange(bite, 0x81, 0x9F) || inRange(bite, 0xE0, 0xFC)) {
        shiftjis_lead = bite;
        return null;
      }
      return decoderError(fatal);
    };
  }

  /**
   * @constructor
   * @param {{fatal: boolean}} options
   */
  function ShiftJISEncoder(options) {
    var fatal = options.fatal;
    /**
     * @param {ByteOutputStream} output_byte_stream Output byte stream.
     * @param {CodePointInputStream} code_point_pointer Input stream.
     * @return {number} The last byte emitted.
     */
    this.encode = function(output_byte_stream, code_point_pointer) {
      var code_point = code_point_pointer.get();
      if (code_point === EOF_code_point) {
        return EOF_byte;
      }
      code_point_pointer.offset(1);
      if (inRange(code_point, 0x0000, 0x0080)) {
        return output_byte_stream.emit(code_point);
      }
      if (code_point === 0x00A5) {
        return output_byte_stream.emit(0x5C);
      }
      if (code_point === 0x203E) {
        return output_byte_stream.emit(0x7E);
      }
      if (inRange(code_point, 0xFF61, 0xFF9F)) {
        return output_byte_stream.emit(code_point - 0xFF61 + 0xA1);
      }
      var pointer = indexPointerFor(code_point, index('jis0208'));
      if (pointer === null) {
        return encoderError(code_point);
      }
      var lead = div(pointer, 188);
      var lead_offset = lead < 0x1F ? 0x81 : 0xC1;
      var trail = pointer % 188;
      var offset = trail < 0x3F ? 0x40 : 0x41;
      return output_byte_stream.emit(lead + lead_offset, trail + offset);
    };
  }

  /** @param {{fatal: boolean}} options */
  name_to_encoding['shift_jis'].getEncoder = function(options) {
    return new ShiftJISEncoder(options);
  };
  /** @param {{fatal: boolean}} options */
  name_to_encoding['shift_jis'].getDecoder = function(options) {
    return new ShiftJISDecoder(options);
  };

  //
  // 13. Legacy multi-byte Korean encodings
  //

  // 13.1 euc-kr

  /**
   * @constructor
   * @param {{fatal: boolean}} options
   */
  function EUCKRDecoder(options) {
    var fatal = options.fatal;
    var /** @type {number} */ euckr_lead = 0x00;
    /**
     * @param {ByteInputStream} byte_pointer The byte stream to decode.
     * @return {?number} The next code point decoded, or null if not enough
     *     data exists in the input stream to decode a complete code point.
     */
    this.decode = function(byte_pointer) {
      var bite = byte_pointer.get();
      if (bite === EOF_byte && euckr_lead === 0) {
        return EOF_code_point;
      }
      if (bite === EOF_byte && euckr_lead !== 0) {
        euckr_lead = 0x00;
        return decoderError(fatal);
      }
      byte_pointer.offset(1);
      if (euckr_lead !== 0x00) {
        var lead = euckr_lead;
        var pointer = null;
        euckr_lead = 0x00;

        if (inRange(lead, 0x81, 0xC6)) {
          var temp = (26 + 26 + 126) * (lead - 0x81);
          if (inRange(bite, 0x41, 0x5A)) {
            pointer = temp + bite - 0x41;
          } else if (inRange(bite, 0x61, 0x7A)) {
            pointer = temp + 26 + bite - 0x61;
          } else if (inRange(bite, 0x81, 0xFE)) {
            pointer = temp + 26 + 26 + bite - 0x81;
          }
        }

        if (inRange(lead, 0xC7, 0xFD) && inRange(bite, 0xA1, 0xFE)) {
          pointer = (26 + 26 + 126) * (0xC7 - 0x81) + (lead - 0xC7) * 94 +
              (bite - 0xA1);
        }

        var code_point = (pointer === null) ? null :
            indexCodePointFor(pointer, index('euc-kr'));
        if (pointer === null) {
          byte_pointer.offset(-1);
        }
        if (code_point === null) {
          return decoderError(fatal);
        }
        return code_point;
      }

      if (inRange(bite, 0x00, 0x7F)) {
        return bite;
      }

      if (inRange(bite, 0x81, 0xFD)) {
        euckr_lead = bite;
        return null;
      }

      return decoderError(fatal);
    };
  }

  /**
   * @constructor
   * @param {{fatal: boolean}} options
   */
  function EUCKREncoder(options) {
    var fatal = options.fatal;
    /**
     * @param {ByteOutputStream} output_byte_stream Output byte stream.
     * @param {CodePointInputStream} code_point_pointer Input stream.
     * @return {number} The last byte emitted.
     */
    this.encode = function(output_byte_stream, code_point_pointer) {
      var code_point = code_point_pointer.get();
      if (code_point === EOF_code_point) {
        return EOF_byte;
      }
      code_point_pointer.offset(1);
      if (inRange(code_point, 0x0000, 0x007F)) {
        return output_byte_stream.emit(code_point);
      }
      var pointer = indexPointerFor(code_point, index('euc-kr'));
      if (pointer === null) {
        return encoderError(code_point);
      }
      var lead, trail;
      if (pointer < ((26 + 26 + 126) * (0xC7 - 0x81))) {
        lead = div(pointer, (26 + 26 + 126)) + 0x81;
        trail = pointer % (26 + 26 + 126);
        var offset = trail < 26 ? 0x41 : trail < 26 + 26 ? 0x47 : 0x4D;
        return output_byte_stream.emit(lead, trail + offset);
      }
      pointer = pointer - (26 + 26 + 126) * (0xC7 - 0x81);
      lead = div(pointer, 94) + 0xC7;
      trail = pointer % 94 + 0xA1;
      return output_byte_stream.emit(lead, trail);
    };
  }

  /** @param {{fatal: boolean}} options */
  name_to_encoding['euc-kr'].getEncoder = function(options) {
    return new EUCKREncoder(options);
  };
  /** @param {{fatal: boolean}} options */
  name_to_encoding['euc-kr'].getDecoder = function(options) {
    return new EUCKRDecoder(options);
  };


  //
  // 14. Legacy miscellaneous encodings
  //

  // 14.1 replacement

  // Not needed - API throws TypeError

  // 14.2 utf-16

  /**
   * @constructor
   * @param {boolean} utf16_be True if big-endian, false if little-endian.
   * @param {{fatal: boolean}} options
   */
  function UTF16Decoder(utf16_be, options) {
    var fatal = options.fatal;
    var /** @type {?number} */ utf16_lead_byte = null,
        /** @type {?number} */ utf16_lead_surrogate = null;
    /**
     * @param {ByteInputStream} byte_pointer The byte stream to decode.
     * @return {?number} The next code point decoded, or null if not enough
     *     data exists in the input stream to decode a complete code point.
     */
    this.decode = function(byte_pointer) {
      var bite = byte_pointer.get();
      if (bite === EOF_byte && utf16_lead_byte === null &&
          utf16_lead_surrogate === null) {
        return EOF_code_point;
      }
      if (bite === EOF_byte && (utf16_lead_byte !== null ||
                                utf16_lead_surrogate !== null)) {
        return decoderError(fatal);
      }
      byte_pointer.offset(1);
      if (utf16_lead_byte === null) {
        utf16_lead_byte = bite;
        return null;
      }
      var code_point;
      if (utf16_be) {
        code_point = (utf16_lead_byte << 8) + bite;
      } else {
        code_point = (bite << 8) + utf16_lead_byte;
      }
      utf16_lead_byte = null;
      if (utf16_lead_surrogate !== null) {
        var lead_surrogate = utf16_lead_surrogate;
        utf16_lead_surrogate = null;
        if (inRange(code_point, 0xDC00, 0xDFFF)) {
          return 0x10000 + (lead_surrogate - 0xD800) * 0x400 +
              (code_point - 0xDC00);
        }
        byte_pointer.offset(-2);
        return decoderError(fatal);
      }
      if (inRange(code_point, 0xD800, 0xDBFF)) {
        utf16_lead_surrogate = code_point;
        return null;
      }
      if (inRange(code_point, 0xDC00, 0xDFFF)) {
        return decoderError(fatal);
      }
      return code_point;
    };
  }

  /**
   * @constructor
   * @param {boolean} utf16_be True if big-endian, false if little-endian.
   * @param {{fatal: boolean}} options
   */
  function UTF16Encoder(utf16_be, options) {
    var fatal = options.fatal;
    /**
     * @param {ByteOutputStream} output_byte_stream Output byte stream.
     * @param {CodePointInputStream} code_point_pointer Input stream.
     * @return {number} The last byte emitted.
     */
    this.encode = function(output_byte_stream, code_point_pointer) {
      /**
       * @param {number} code_unit
       * @return {number} last byte emitted
       */
      function convert_to_bytes(code_unit) {
        var byte1 = code_unit >> 8;
        var byte2 = code_unit & 0x00FF;
        if (utf16_be) {
          return output_byte_stream.emit(byte1, byte2);
        }
        return output_byte_stream.emit(byte2, byte1);
      }
      var code_point = code_point_pointer.get();
      if (code_point === EOF_code_point) {
        return EOF_byte;
      }
      code_point_pointer.offset(1);
      if (inRange(code_point, 0xD800, 0xDFFF)) {
        encoderError(code_point);
      }
      if (code_point <= 0xFFFF) {
        return convert_to_bytes(code_point);
      }
      var lead = div((code_point - 0x10000), 0x400) + 0xD800;
      var trail = ((code_point - 0x10000) % 0x400) + 0xDC00;
      convert_to_bytes(lead);
      return convert_to_bytes(trail);
    };
  }

  // 14.3 utf-16be
  /** @param {{fatal: boolean}} options */
  name_to_encoding['utf-16be'].getEncoder = function(options) {
    return new UTF16Encoder(true, options);
  };
  /** @param {{fatal: boolean}} options */
  name_to_encoding['utf-16be'].getDecoder = function(options) {
    return new UTF16Decoder(true, options);
  };

  // 14.4 utf-16le
  /** @param {{fatal: boolean}} options */
  name_to_encoding['utf-16le'].getEncoder = function(options) {
    return new UTF16Encoder(false, options);
  };
  /** @param {{fatal: boolean}} options */
  name_to_encoding['utf-16le'].getDecoder = function(options) {
    return new UTF16Decoder(false, options);
  };

  // 14.5 x-user-defined

  /**
   * @constructor
   * @param {{fatal: boolean}} options
   */
  function XUserDefinedDecoder(options) {
    var fatal = options.fatal;
    /**
     * @param {ByteInputStream} byte_pointer The byte stream to decode.
     * @return {?number} The next code point decoded, or null if not enough
     *     data exists in the input stream to decode a complete code point.
     */
    this.decode = function(byte_pointer) {
      var bite = byte_pointer.get();
      if (bite === EOF_byte) {
        return EOF_code_point;
      }
      byte_pointer.offset(1);
      if (inRange(bite, 0x00, 0x7F)) {
        return bite;
      }
      return 0xF780 + bite - 0x80;
    };
  }

  /**
   * @constructor
   * @param {{fatal: boolean}} options
   */
  function XUserDefinedEncoder(options) {
    var fatal = options.fatal;
    /**
     * @param {ByteOutputStream} output_byte_stream Output byte stream.
     * @param {CodePointInputStream} code_point_pointer Input stream.
     * @return {number} The last byte emitted.
     */
    this.encode = function(output_byte_stream, code_point_pointer) {
      var code_point = code_point_pointer.get();
      if (code_point === EOF_code_point) {
        return EOF_byte;
      }
      code_point_pointer.offset(1);
      if (inRange(code_point, 0x0000, 0x007F)) {
        return output_byte_stream.emit(code_point);
      }
      if (inRange(code_point, 0xF780, 0xF7FF)) {
        return output_byte_stream.emit(code_point - 0xF780 + 0x80);
      }
      return encoderError(code_point);
    };
  }

  /** @param {{fatal: boolean}} options */
  name_to_encoding['x-user-defined'].getEncoder = function(options) {
    return new XUserDefinedEncoder(options);
  };
  /** @param {{fatal: boolean}} options */
  name_to_encoding['x-user-defined'].getDecoder = function(options) {
    return new XUserDefinedDecoder(options);
  };

  // NOTE: currently unused
  /**
   * @param {string} label The encoding label.
   * @param {ByteInputStream} input_stream The byte stream to test.
   */
  function detectEncoding(label, input_stream) {
    if (input_stream.match([0xFF, 0xFE])) {
      input_stream.offset(2);
      return 'utf-16le';
    }
    if (input_stream.match([0xFE, 0xFF])) {
      input_stream.offset(2);
      return 'utf-16be';
    }
    if (input_stream.match([0xEF, 0xBB, 0xBF])) {
      input_stream.offset(3);
      return 'utf-8';
    }
    return label;
  }

  if (!('TextEncoder' in global)) global['TextEncoder'] = TextEncoder;
  if (!('TextDecoder' in global)) global['TextDecoder'] = TextDecoder;
}(this));


/* SOURCE: libs/fs.js */


var DEBUG_FS = false;

var fs = (function() {
  var reportRequestError = function(type, request) {
    console.error(type + " error " + request.error.name);
  }

  var Store = function() {
    this.map = new Map();

    // Pending changes to the persistent datastore, indexed by record key.
    //
    // Changes can represent puts or deletes and comprise a type and (for puts)
    // the value to write:
    //   key: { type: "delete" } or key: { type: "put", value: <value> }
    //
    // We index by key, storing only the most recent change for a given key,
    // to coalesce multiple changes, so that we always sync only the most recent
    // change for a given record.
    this.changesToSync = new Map();

    this.db = null;
  };

  Store.DBNAME = "asyncStorage";
  Store.DBVERSION = 4;
  Store.DBSTORENAME_1 = "keyvaluepairs";
  Store.DBSTORENAME_2 = "fs";
  Store.DBSTORENAME_4 = "fs4";
  Store.DBSTORENAME = Store.DBSTORENAME_4;

  Store.prototype.upgrade = {
    "1to2": function(db, transaction, next) {
      // Create new object store.
      var newObjectStore = db.createObjectStore(Store.DBSTORENAME_2);

      // Iterate the keys in the old object store and copy their values
      // to the new one, converting them from old- to new-style records.
      var oldObjectStore = transaction.objectStore(Store.DBSTORENAME_1);
      var oldRecords = {};
      oldObjectStore.openCursor().onsuccess = function(event) {
        var cursor = event.target.result;

        if (cursor) {
          oldRecords[cursor.key] = cursor.value;
          cursor.continue();
          return;
        }

        // Convert the old records to new ones.
        for (var key in oldRecords) {
          // Records that start with an exclamation mark are stats,
          // which we don't iterate (but do use below when processing
          // their equivalent data records).
          if (key[0] == "!") {
            continue;
          }

          var oldRecord = oldRecords[key];
          var oldStat = oldRecords["!" + key];
          var newRecord = oldStat;
          if (newRecord.isDir) {
            newRecord.files = oldRecord;
          } else {
            newRecord.data = oldRecord;
          }
          newObjectStore.put(newRecord, key);
        }

        db.deleteObjectStore(Store.DBSTORENAME_1);
        next();
      };
    },

    "2to3": function(db, transaction, next) {
      var objectStore = transaction.objectStore(Store.DBSTORENAME_2);
      objectStore.createIndex("parentDir", "parentDir", { unique: false });

      // Convert records to the new format:
      // 1. Delete the obsolete "files" property from directory records.
      // 2. Add the new "parentDir" property to all records.
      objectStore.openCursor().onsuccess = function(event) {
        var cursor = event.target.result;
        if (cursor) {
          var newRecord = cursor.value;
          if (newRecord.isDir) {
            delete newRecord.files;
          }
          var path = cursor.key;
          newRecord.parentDir = (path === "/" ? null : dirname(path));
          cursor.update(newRecord);
          cursor.continue();
        } else {
          next();
        }
      };
    },

    "3to4": function(db, transaction, next) {
      // Create new object store.
      var newObjectStore = db.createObjectStore(Store.DBSTORENAME_4, { keyPath: "pathname" });
      newObjectStore.createIndex("parentDir", "parentDir", { unique: false });

      // Iterate the keys in the old object store and copy their values
      // to the new one, converting them from old- to new-style records.
      var oldObjectStore = transaction.objectStore(Store.DBSTORENAME_2);
      oldObjectStore.openCursor().onsuccess = function(event) {
        var cursor = event.target.result;

        if (cursor) {
          var newRecord = cursor.value;
          newRecord.pathname = cursor.key;
          newObjectStore.put(newRecord);
          cursor.continue();
          return;
        }

        db.deleteObjectStore(Store.DBSTORENAME_2);
        next();
      };
    },
  };

  Store.prototype.init = function(cb) {
    var openreq = indexedDB.open(Store.DBNAME, Store.DBVERSION);

    openreq.onerror = function() {
      console.error("error opening database: " + openreq.error.name);
    };

    openreq.onupgradeneeded = (function(event) {
      if (DEBUG_FS) { console.log("upgrade needed from " + event.oldVersion + " to " + event.newVersion); }

      var db = event.target.result;
      var transaction = openreq.transaction;

      if (event.oldVersion == 0) {
        // If the database doesn't exist yet, then all we have to do
        // is create the object store for the latest version of the database.
        // XXX This is brittle, because there are two places where the latest
        // version of the database is created: here and in the most recent
        // upgrade function.  So we should refactor this code, perhaps moving
        // the initial object store creation into a "0to1" upgrade function,
        // or perhaps moving the latest object store creation into a function.
        var objectStore = openreq.result.createObjectStore(Store.DBSTORENAME, { keyPath: "pathname" });
        objectStore.createIndex("parentDir", "parentDir", { unique: false });
      } else {
        var version = event.oldVersion;
        var next = (function() {
          if (version < event.newVersion) {
            if (DEBUG_FS) { console.log("upgrading from " + version + " to " + (version + 1)); }
            this.upgrade[version + "to" + ++version].bind(this)(db, transaction, next);
          }
        }).bind(this);
        next();
      }
    }).bind(this);

    openreq.onsuccess = (function() {
      this.db = openreq.result;

      // Retrieve all records and put them into the in-memory map.
      var transaction = this.db.transaction(Store.DBSTORENAME, "readonly");
      if (DEBUG_FS) { console.log("getAll initiated"); }
      var objectStore = transaction.objectStore(Store.DBSTORENAME);
      var then = performance.now();
      objectStore.getAll().onsuccess = (function(event) {
        var records = event.target.result;
        for (var i = 0; i < records.length; ++i) {
          this.map.set(records[i].pathname, records[i]);
        };
        if (DEBUG_FS) { console.log("getAll completed in " + (performance.now() - then) + "ms"); }
        cb();
      }).bind(this);
    }).bind(this);
  };

  Store.prototype.getItem = function(key) {
    if (this.map.has(key)) {
      return this.map.get(key);
    }

    var value = null;
    this.map.set(key, value);
    return value;
  };

  Store.prototype.setItem = function(key, value) {
    this.map.set(key, value);
    this.changesToSync.set(key, { type: "put", value: value });
  };

  Store.prototype.removeItem = function(key) {
    this.map.set(key, null);
    this.changesToSync.set(key, { type: "delete" });
  };

  Store.prototype.clear = function() {
    this.map.clear();
    this.changesToSync.clear();

    var transaction = this.db.transaction(Store.DBSTORENAME, "readwrite");
    if (DEBUG_FS) { console.log("clear initiated"); }
    var objectStore = transaction.objectStore(Store.DBSTORENAME);
    var req = objectStore.clear();
    req.onerror = function() {
      console.error("Error clearing store: " + req.error.name);
    };
    transaction.oncomplete = function() {
      if (DEBUG_FS) { console.log("clear completed"); }
    };
  }

  Store.prototype.sync = function(cb) {
    cb = cb || function() {};

    // If there are no changes to sync, merely call the callback
    // (in a timeout so the callback always gets called asynchronously).
    if (this.changesToSync.size == 0) {
      nextTickBeforeEvents(cb);
      return;
    }

    var transaction = this.db.transaction(Store.DBSTORENAME, "readwrite");
    if (DEBUG_FS) { console.log("sync initiated"); }
    var objectStore = transaction.objectStore(Store.DBSTORENAME);

    this.changesToSync.forEach((function(change, key) {
      var req;
      if (change.type == "put") {
        change.value.pathname = key;
        req = objectStore.put(change.value);
        if (DEBUG_FS) { console.log("put " + key); }
        req.onerror = function() {
          console.error("Error putting " + key + ": " + req.error.name);
        };
      } else if (change.type == "delete") {
        req = objectStore.delete(key);
        if (DEBUG_FS) { console.log("delete " + key); }
        req.onerror = function() {
          console.error("Error deleting " + key + ": " + req.error.name);
        };
      }
    }).bind(this));

    this.changesToSync.clear();

    transaction.oncomplete = function() {
      if (DEBUG_FS) { console.log("sync completed"); }
      cb();
    };
  }

  Store.prototype.export = function(cb) {
    var records = {};
    var output = {};
    var promises = [];

    this.sync((function() {
      var transaction = this.db.transaction(Store.DBSTORENAME, "readonly");
      if (DEBUG_FS) { console.log("export initiated"); }
      var objectStore = transaction.objectStore(Store.DBSTORENAME);

      var req = objectStore.openCursor();
      req.onerror = function() {
        console.error("export error " + req.error);
      };
      req.onsuccess = function(event) {
        var cursor = event.target.result;
        if (cursor) {
          records[cursor.key] = cursor.value;
          cursor.continue();
        } else {
          Object.keys(records).forEach(function(key) {
            if (DEBUG_FS) { console.log("exporting " + key); }
            var record = records[key];
            if (record.isDir) {
              output[key] = record;
            } else if (record.size === 0) { // Chrome has problems exporting empty blobs.
              record.data = [];
              output[key] = record;
            } else {
              promises.push(new Promise(function(resolve, reject) {
                var reader = new FileReader();
                reader.addEventListener("error", function() {
                  reject("Failed to read: " + key);
                });
                reader.addEventListener("load", function() {
                  record.data = Array.prototype.slice.call(new Int8Array(reader.result));
                  output[key] = record;
                  resolve();
                });
                reader.readAsArrayBuffer(record.data);
              }));
            }
          });

          Promise.all(promises).then(function() {
            var blob = new Blob([JSON.stringify(output)]);
            if (DEBUG_FS) { console.log("export completed"); }
            cb(blob);
          }, function(reason) {
            console.error("Failed to export: " + reason);
          });
        }
      };
    }).bind(this));
  }

  Store.prototype.import = function(file, cb) {
    var reader = new FileReader();
    reader.onload = (function() {
      var input = JSON.parse(reader.result);
      var transaction = this.db.transaction(Store.DBSTORENAME, "readwrite");
      if (DEBUG_FS) { console.log("import initiated"); }
      this.map.clear();
      var objectStore = transaction.objectStore(Store.DBSTORENAME);
      var req = objectStore.clear();
      req.onerror = reportRequestError.bind(null, "import", req);
      Object.keys(input).forEach((function(key) {
        if (DEBUG_FS) { console.log("importing " + key); }
        var record = input[key];
        if (!record.isDir) {
          record.data = new Blob([new Int8Array(record.data)]);
        }
        this.map.set(key, record);
        record.pathname = key;
        var req = objectStore.put(record);
        req.onerror = reportRequestError.bind(null, "import", req);
      }).bind(this));
      transaction.oncomplete = function() {
        if (DEBUG_FS) { console.log("import completed"); }
        cb();
      };
    }).bind(this);
    reader.readAsText(file);
  }

  var store = new Store();

  var FileBuffer = function(array) {
    this.array = array;
    this.contentSize = array.byteLength;
  }

  FileBuffer.prototype.setSize = function(newContentSize) {
    if (newContentSize < this.array.byteLength) {
      this.contentSize = newContentSize;
      return;
    }

    var newBufferSize = 512;

    // The buffer grows exponentially until the content size
    // reaches 524288. After this threshold, it starts to grow
    // linearly in increments of 524288 bytes.
    if (newContentSize < 524288) {
      while (newContentSize > newBufferSize) {
        newBufferSize <<= 1;
      }
    } else {
      while (newContentSize > newBufferSize) {
        newBufferSize += 524288;
      }
    }

    var newArray = new Int8Array(newBufferSize);
    newArray.set(this.array);

    this.array = newArray;
    this.contentSize = newContentSize;
  }

  FileBuffer.prototype.getContent = function() {
    return this.array.subarray(0, this.contentSize);
  }

  function normalizePath(path) {
    // Remove a trailing slash.
    if (path.length != 1 && path.lastIndexOf("/") == path.length-1) {
      path = path.substring(0, path.length-1);
    }

    // Coalesce multiple consecutive slashes.
    path = path.replace(/\/{2,}/, "/");

    // XXX Replace "." and ".." parts.

    return path;
  }

  function dirname(path) {
    path = normalizePath(path);

    var index = path.lastIndexOf("/");
    if (index == -1) {
      return ".";
    }

    while (index >= 0 && path[index] == "/") {
      --index;
    }

    var dir = path.slice(0, index + 1);
    if (dir == "") {
      dir = "/";
    }
    return dir;
  }

  function basename(path) {
    return path.slice(path.lastIndexOf("/") + 1);
  }

  function initRootDir() {
    if (!store.getItem("/")) {
      store.setItem("/", {
        isDir: true,
        mtime: Date.now(),
        parentDir: null,
      });
    }
  }

  function init(cb) {
    store.init(function() {
      // Due to bug #227, we don't support Object::finalize(). But the Java
      // filesystem implementation requires the `finalize` method to save cached
      // file data if user doesn't flush or close the file explicitly. To avoid
      // losing data, we flush files periodically.
      // We start to flush periodically after startup has been completed (25 seconds
      // is a good estimate).
      setTimeout(function() {
        setInterval(flushAll, 5000);
      }, 20000);
      initRootDir();
      cb();
    });
  }

  var openedFiles = new Map();
  var lastId = 2;

  function getBlob(path) {
    var record = store.getItem(normalizePath(path));
    return record ? record.data : null;
  }

  function open(path, cb) {
    path = normalizePath(path);
    if (DEBUG_FS) { console.log("fs open " + path); }

    var record = store.getItem(path);
    if (record == null || record.isDir) {
      nextTickBeforeEvents(function() { cb(-1) });
    } else {
      var reader = new FileReader();
      reader.addEventListener("error", function() {
        console.error("Failed to read blob data from: " + path);
        nextTickBeforeEvents(function() { cb(-1) });
      });
      reader.addEventListener("load", function() {
        openedFiles.set(++lastId, {
          dirty: false,
          path: path,
          buffer: new FileBuffer(new Int8Array(reader.result)),
          mtime: record.mtime,
          size: record.size,
          position: 0,
          record: record,
        });
        cb(lastId);
      });
      reader.readAsArrayBuffer(record.data);
    }
  }

  function close(fd) {
    if (fd < 0) {
      return;
    }

    var file = openedFiles.get(fd);
    if (file) {
      if (DEBUG_FS) { console.log("fs close " + file.path); }
      flush(fd);
      openedFiles.delete(fd);
    }
  }

  function read(fd, from, to) {
    var file = openedFiles.get(fd);
    if (!file) {
      return null;
    }
    if (DEBUG_FS) { console.log("fs read " + file.path); }

    var buffer = file.buffer;

    if (typeof from === "undefined") {
      from = file.position;
    }

    if (!to || to > buffer.contentSize) {
      to = buffer.contentSize;
    }

    if (from > buffer.contentSize) {
      from = buffer.contentSize;
    }

    file.position += to - from;
    return buffer.array.subarray(from, to);
  }

  function write(fd, data, offset, length, from) {
    var file = openedFiles.get(fd);

    if (DEBUG_FS) { console.log("fs write " + file.path); }

    if (typeof from == "undefined") {
      from = file.position;
    }

    var buffer = file.buffer;

    if (from > buffer.contentSize) {
      from = buffer.contentSize;
    }

    var newLength = (from + length > buffer.contentSize) ? (from + length) : (buffer.contentSize);

    buffer.setSize(newLength);

    if (length > 128) {
      buffer.array.set(data.subarray(offset, offset + length), from);
    } else {
      for (var i = 0; i < length; i++) {
        buffer.array[from + i] = data[offset + i];
      }
    }

    file.position = from + length;
    file.mtime = Date.now();
    file.size = buffer.contentSize;
    file.dirty = true;
  }

  function getpos(fd) {
    return openedFiles.get(fd).position;
  }

  function setpos(fd, pos) {
    openedFiles.get(fd).position = pos;
  }

  function getsize(fd) {
    var file = openedFiles.get(fd);

    if (!file) {
      return -1;
    }

    return file.buffer.contentSize;
  }

  function flush(fd) {
    var openedFile = openedFiles.get(fd);

    if (DEBUG_FS) { console.log("fs flush " + openedFile.path); }

    // Bail early if the file has not been modified.
    if (!openedFile.dirty) {
      return;
    }

    openedFile.record.data = new Blob([openedFile.buffer.getContent()]);
    openedFile.record.mtime = openedFile.mtime;
    openedFile.record.size = openedFile.size;
    store.setItem(openedFile.path, openedFile.record);
    openedFile.dirty = false;

    // Update in-memory copies of the same file, only if they haven't been
    // modified.
    // If they've been modified, the behavior is undefined.
    for (var entry of openedFiles) {
      if (!entry[1].dirty && entry[1].path === openedFile.path) {
        entry[1].mtime = openedFile.mtime;
        entry[1].size = openedFile.size;
        entry[1].buffer = new FileBuffer(new Int8Array(openedFile.buffer.getContent()));
      }
    }
  }

  function flushAll() {
    for (var entry of openedFiles) {
      if (entry[1].dirty) {
        flush(entry[0]);
      }
    }

    // After flushing to the in-memory datastore, sync it to the persistent one.
    // We might want to decouple this from the flushAll calls, so we can do them
    // at different interval (f.e. flushing to memory every five seconds
    // but only syncing to the persistent datastore every minute or so), though
    // we should continue to do both immediately on pagehide.
    syncStore();
  }

  // Flush files when app goes into background.
  window.addEventListener("pagehide", flushAll);

  function list(path) {
    path = normalizePath(path);
    if (DEBUG_FS) { console.log("fs list " + path); }

    var record = store.getItem(path);
    if (record == null) {
      throw new Error("Path does not exist");
    }

    if (!record.isDir) {
      throw new Error("Path is not a directory");
    }

    var files = [];

    store.map.forEach(function(value, key) {
      if (value && value.parentDir === path) {
        files.push(basename(key) + (value.isDir ? "/" : ""));
      }
    });

    return files.sort();
  }

  function exists(path) {
    path = normalizePath(path);

    var record = store.getItem(path);
    if (DEBUG_FS) { console.log("fs exists " + path + ": " + !!record); }

    return !!record;
  }

  function truncate(path, size) {
    path = normalizePath(path);
    if (DEBUG_FS) { console.log("fs truncate " + path); }

    var record = store.getItem(path);
    if (record == null || record.isDir) {
      return false;
    }

    if (size >= record.size) {
      return true;
    }

    record.data = record.data.slice(0, size || 0, record.data.type);
    record.mtime = Date.now();
    record.size = size || 0;
    store.setItem(path, record);
    return true;
  }

  function ftruncate(fd, size) {
    var file = openedFiles.get(fd);

    if (DEBUG_FS) { console.log("fs ftruncate " + file.path); }

    if (size != file.buffer.contentSize) {
      file.buffer.setSize(size);
      file.dirty = true;
      file.mtime = Date.now();
      file.size = size;
    }
  }

  function remove(path) {
    path = normalizePath(path);
    if (DEBUG_FS) { console.log("fs remove " + path); }

    for (var file of openedFiles.values()) {
      if (file.path === path) {
        if (DEBUG_FS) { console.log("file is open"); }
        return false;
      }
    }

    var record = store.getItem(path);

    if (!record) {
      if (DEBUG_FS) { console.log("file does not exist"); }
      return false;
    }

    // If it's a directory that isn't empty, then we can't remove it.
    if (record.isDir) {
      for (var value of store.map.values()) {
        if (value && value.parentDir === path) {
          if (DEBUG_FS) { console.log("directory is not empty"); }
          return false;
        }
      }
    }

    store.removeItem(path);
    return true;
  }

  function createInternal(path, record) {
    var name = basename(path);
    var dir = dirname(path);

    var parentRecord = store.getItem(dir);

    // If the parent directory doesn't exist or isn't a directory,
    // then we can't create the file.
    if (parentRecord === null || !parentRecord.isDir) {
      console.error("parent directory '" + dir + "' doesn't exist or isn't a directory");
      return false;
    }

    var existingRecord = store.getItem(path);

    // If the file already exists, then we can't create it.
    if (existingRecord) {
      if (DEBUG_FS) { console.error("file '" + path + "' already exists"); }
      return false;
    }

    // Create the file.
    store.setItem(path, record);

    return true;
  }

  function create(path, blob) {
    path = normalizePath(path);
    if (DEBUG_FS) { console.log("fs create " + path); }

    var record = {
      isDir: false,
      mtime: Date.now(),
      data: blob,
      size: blob.size,
      parentDir: dirname(path),
    };

    return createInternal(path, record);
  }

  function mkdir(path) {
    path = normalizePath(path);
    if (DEBUG_FS) { console.log("fs mkdir " + path); }

    var record = {
      isDir: true,
      mtime: Date.now(),
      parentDir: dirname(path),
    };

    return createInternal(path, record);
  }

  function mkdirp(path) {
    if (DEBUG_FS) { console.log("fs mkdirp " + path); }

    if (path[0] !== "/") {
      console.error("mkdirp called on relative path: " + path);
      return false;
    }

    // Split the path into parts across "/", discarding the initial, empty part.
    var parts = normalizePath(path).split("/").slice(1);

    var partPath = "";

    function mkpart(created) {
      if (!created) {
        return false;
      }

      if (!parts.length) {
        return true;
      }

      partPath += "/" + parts.shift();

      var record = store.getItem(partPath);

      if (!record) {
        // The part doesn't exist; make it, then continue to next part.
        return mkpart(mkdir(partPath));
      } else if (record.isDir) {
        // The part exists and is a directory; continue to next part.
        return mkpart(true);
      } else {
        // The part exists but isn't a directory; fail.
        console.error("mkdirp called on path with non-dir part: " + partPath);
        return false;
      }
    }

    return mkpart(true);
  }

  function size(path) {
    path = normalizePath(path);
    if (DEBUG_FS) { console.log("fs size " + path); }

    var record = store.getItem(path);
    if (record == null || record.isDir) {
      return -1;
    } else {
      return record.size;
    }
  }

  // Callers of this function should make sure
  // newPath doesn't exist.
  function rename(oldPath, newPath) {
    oldPath = normalizePath(oldPath);
    newPath = normalizePath(newPath);
    if (DEBUG_FS) { console.log("fs rename " + oldPath + " -> " + newPath); }

    for (var file of openedFiles.values()) {
      if (file.path === oldPath) {
        if (DEBUG_FS) { console.log("file is open"); }
        return false;
      }
    }

    var oldRecord = store.getItem(oldPath);

    // If the old path doesn't exist, we can't move it.
    if (oldRecord == null) {
      return false;
    }

    // If the old path is a dir with files in it, then we don't move it.
    // XXX Move it along with its files.
    if (oldRecord.isDir) {
      for (var value of store.map.values()) {
        if (value && value.parentDir === oldPath) {
          console.error("rename directory containing files not implemented: " + oldPath + " to " + newPath);
          return false;
        }
      }
    }

    store.removeItem(oldPath);
    oldRecord.parentDir = dirname(newPath);
    store.setItem(newPath, oldRecord);
    return true;
  }

  function stat(path) {
    path = normalizePath(path);
    if (DEBUG_FS) { console.log("fs stat " + path); }

    var record = store.getItem(path);

    if (record === null) {
      return null;
    }

    return {
      isDir: record.isDir,
      mtime: record.mtime,
      size: record.size,
    };
  }

  function clear() {
    store.clear();
    initRootDir();
  }

  function syncStore(cb) {
    store.sync(cb);
  }

  function createUniqueFile(parentDir, completeName, blob) {
    var name = completeName;
    var ext = "";
    var extIndex = name.lastIndexOf(".");
    if (extIndex !== -1) {
      ext = name.substring(extIndex);
      name = name.substring(0, extIndex);
    }

    var i = 0;
    function tryFile(fileName) {
      if (exists(parentDir + "/" + fileName)) {
        i++;
        return tryFile(name + "-" + i + ext);
      } else {
        // XXX Shouldn't this be mkdirp if we really want to ensure
        // that the parent directory exists?
        mkdir(parentDir);
        create(parentDir + "/" + fileName, blob);
        return fileName;
      }
    }
    return tryFile(completeName);
  }

  function exportStore(cb) {
    return store.export(cb);
  }

  function importStore(blob, cb) {
    return store.import(blob, cb);
  }

  function deleteDatabase() {
    return new Promise(function(resolve, reject) {
      store.db = null;
      var request = indexedDB.deleteDatabase(Store.DBNAME);
      request.onsuccess = resolve;
      request.onerror = function() { reject(request.error.name) };
    });
  }

  return {
    normalize: normalizePath,
    dirname: dirname,
    init: init,
    open: open,
    close: close,
    read: read,
    write: write,
    getpos: getpos,
    setpos: setpos,
    getsize: getsize,
    flush: flush,
    list: list,
    exists: exists,
    truncate: truncate,
    ftruncate: ftruncate,
    remove: remove,
    create: create,
    mkdir: mkdir,
    mkdirp: mkdirp,
    size: size,
    rename: rename,
    stat: stat,
    clear: clear,
    syncStore: syncStore,
    exportStore: exportStore,
    importStore: importStore,
    deleteDatabase: deleteDatabase,
    createUniqueFile: createUniqueFile,
    getBlob: getBlob,
  };
})();


/* SOURCE: libs/fs-init.js */
/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */



// Directories in the filesystem.
var initialDirs = [
  "/MemoryCard",
  "/Persistent",
  "/Phone",
  "/Phone/_my_downloads",
  "/Phone/_my_pictures",
  "/Phone/_my_videos",
  "/Phone/_my_recordings",
  "/Private",
];

// Files in the filesystem.  We load the data from the source path on the real
// filesystem and write it to the target path on the virtual filesystem.
// Source paths are relative to APP_BASE_DIR.
var initialFiles = [
  { sourcePath: "certs/_main.ks", targetPath: "/_main.ks" },
];

var initFS = new Promise(function(resolve, reject) {
  fs.init(resolve);
}).then(function() {
  if (typeof config !== "undefined" && config.main === "com.ibm.tck.client.TestRunner") {
    initialDirs.push("/tcktestdir");
  }

  initialDirs.forEach(function(dir) {
    fs.mkdir(dir);
  });
}).then(function() {
  var filePromises = [];

  if (typeof config !== "undefined" && config.midletClassName == "RunTestsMIDlet") {
    initialFiles.push({ sourcePath: "certs/_test.ks", targetPath: "/_test.ks" });
  }

  initialFiles.forEach(function(file) {
    filePromises.push(new Promise(function(resolve, reject) {
      if (fs.exists(file.targetPath)) {
        resolve();
      } else {
        load(APP_BASE_DIR + file.sourcePath, "blob").then(function(data) {
          fs.create(file.targetPath, data);
          resolve();
        });
      }
    }));
  });

  return Promise.all(filePromises);
});


/* SOURCE: libs/forge/util.js */
/**
 * Utility functions for web applications.
 *
 * @author Dave Longley
 *
 * Copyright (c) 2010-2014 Digital Bazaar, Inc.
 */
(function() {
/* ########## Begin module implementation ########## */
function initModule(forge) {

/* Utilities API */
var util = forge.util = forge.util || {};

// define isArrayBuffer
util.isArrayBuffer = function(x) {
  return typeof ArrayBuffer !== 'undefined' && x instanceof ArrayBuffer;
};

// define isArrayBufferView
var _arrayBufferViews = [];
if(typeof DataView !== 'undefined') {
  _arrayBufferViews.push(DataView);
}
if(typeof Int8Array !== 'undefined') {
  _arrayBufferViews.push(Int8Array);
}
if(typeof Uint8Array !== 'undefined') {
  _arrayBufferViews.push(Uint8Array);
}
if(typeof Uint8ClampedArray !== 'undefined') {
  _arrayBufferViews.push(Uint8ClampedArray);
}
if(typeof Int16Array !== 'undefined') {
  _arrayBufferViews.push(Int16Array);
}
if(typeof Uint16Array !== 'undefined') {
  _arrayBufferViews.push(Uint16Array);
}
if(typeof Int32Array !== 'undefined') {
  _arrayBufferViews.push(Int32Array);
}
if(typeof Uint32Array !== 'undefined') {
  _arrayBufferViews.push(Uint32Array);
}
if(typeof Float32Array !== 'undefined') {
  _arrayBufferViews.push(Float32Array);
}
if(typeof Float64Array !== 'undefined') {
  _arrayBufferViews.push(Float64Array);
}
util.isArrayBufferView = function(x) {
  for(var i = 0; i < _arrayBufferViews.length; ++i) {
    if(x instanceof _arrayBufferViews[i]) {
      return true;
    }
  }
  return false;
};

// TODO: set ByteBuffer to best available backing
util.ByteBuffer = ByteStringBuffer;

/** Buffer w/BinaryString backing */

/**
 * Constructor for a binary string backed byte buffer.
 *
 * @param [b] the bytes to wrap (either encoded as string, one byte per
 *          character, or as an ArrayBuffer or Typed Array).
 */
function ByteStringBuffer(b) {
  // TODO: update to match DataBuffer API

  // the data in this buffer
  this.data = '';
  // the pointer for reading from this buffer
  this.read = 0;

  if(typeof b === 'string') {
    this.data = b;
  } else if(util.isArrayBuffer(b) || util.isArrayBufferView(b)) {
    // convert native buffer to forge buffer
    // FIXME: support native buffers internally instead
    var arr = new Uint8Array(b);
    try {
      this.data = String.fromCharCode.apply(null, arr);
    } catch(e) {
      for(var i = 0; i < arr.length; ++i) {
        this.putByte(arr[i]);
      }
    }
  } else if(b instanceof ByteStringBuffer ||
    (typeof b === 'object' && typeof b.data === 'string' &&
    typeof b.read === 'number')) {
    // copy existing buffer
    this.data = b.data;
    this.read = b.read;
  }
}
util.ByteStringBuffer = ByteStringBuffer;

/**
 * Gets the number of bytes in this buffer.
 *
 * @return the number of bytes in this buffer.
 */
util.ByteStringBuffer.prototype.length = function() {
  return this.data.length - this.read;
};

/**
 * Gets whether or not this buffer is empty.
 *
 * @return true if this buffer is empty, false if not.
 */
util.ByteStringBuffer.prototype.isEmpty = function() {
  return this.length() <= 0;
};

/**
 * Puts a byte in this buffer.
 *
 * @param b the byte to put.
 *
 * @return this buffer.
 */
util.ByteStringBuffer.prototype.putByte = function(b) {
  this.data += String.fromCharCode(b);
  return this;
};

/**
 * Puts a byte in this buffer N times.
 *
 * @param b the byte to put.
 * @param n the number of bytes of value b to put.
 *
 * @return this buffer.
 */
util.ByteStringBuffer.prototype.fillWithByte = function(b, n) {
  b = String.fromCharCode(b);
  var d = this.data;
  while(n > 0) {
    if(n & 1) {
      d += b;
    }
    n >>>= 1;
    if(n > 0) {
      b += b;
    }
  }
  this.data = d;
  return this;
};

/**
 * Puts bytes in this buffer.
 *
 * @param bytes the bytes (as a UTF-8 encoded string) to put.
 *
 * @return this buffer.
 */
util.ByteStringBuffer.prototype.putBytes = function(bytes) {
  // TODO: update to match DataBuffer API
  this.data += bytes;
  return this;
};

/**
 * Puts a UTF-16 encoded string into this buffer.
 *
 * @param str the string to put.
 *
 * @return this buffer.
 */
util.ByteStringBuffer.prototype.putString = function(str) {
  this.data += util.encodeUtf8(str);
  return this;
};

/**
 * Puts a 16-bit integer in this buffer in big-endian order.
 *
 * @param i the 16-bit integer.
 *
 * @return this buffer.
 */
util.ByteStringBuffer.prototype.putInt16 = function(i) {
  this.data +=
    String.fromCharCode(i >> 8 & 0xFF) +
    String.fromCharCode(i & 0xFF);
  return this;
};

/**
 * Puts a 24-bit integer in this buffer in big-endian order.
 *
 * @param i the 24-bit integer.
 *
 * @return this buffer.
 */
util.ByteStringBuffer.prototype.putInt24 = function(i) {
  this.data +=
    String.fromCharCode(i >> 16 & 0xFF) +
    String.fromCharCode(i >> 8 & 0xFF) +
    String.fromCharCode(i & 0xFF);
  return this;
};

/**
 * Puts a 32-bit integer in this buffer in big-endian order.
 *
 * @param i the 32-bit integer.
 *
 * @return this buffer.
 */
util.ByteStringBuffer.prototype.putInt32 = function(i) {
  this.data +=
    String.fromCharCode(i >> 24 & 0xFF) +
    String.fromCharCode(i >> 16 & 0xFF) +
    String.fromCharCode(i >> 8 & 0xFF) +
    String.fromCharCode(i & 0xFF);
  return this;
};

/**
 * Puts a 16-bit integer in this buffer in little-endian order.
 *
 * @param i the 16-bit integer.
 *
 * @return this buffer.
 */
util.ByteStringBuffer.prototype.putInt16Le = function(i) {
  this.data +=
    String.fromCharCode(i & 0xFF) +
    String.fromCharCode(i >> 8 & 0xFF);
  return this;
};

/**
 * Puts a 24-bit integer in this buffer in little-endian order.
 *
 * @param i the 24-bit integer.
 *
 * @return this buffer.
 */
util.ByteStringBuffer.prototype.putInt24Le = function(i) {
  this.data +=
    String.fromCharCode(i & 0xFF) +
    String.fromCharCode(i >> 8 & 0xFF) +
    String.fromCharCode(i >> 16 & 0xFF);
  return this;
};

/**
 * Puts a 32-bit integer in this buffer in little-endian order.
 *
 * @param i the 32-bit integer.
 *
 * @return this buffer.
 */
util.ByteStringBuffer.prototype.putInt32Le = function(i) {
  this.data +=
    String.fromCharCode(i & 0xFF) +
    String.fromCharCode(i >> 8 & 0xFF) +
    String.fromCharCode(i >> 16 & 0xFF) +
    String.fromCharCode(i >> 24 & 0xFF);
  return this;
};

/**
 * Puts an n-bit integer in this buffer in big-endian order.
 *
 * @param i the n-bit integer.
 * @param n the number of bits in the integer.
 *
 * @return this buffer.
 */
util.ByteStringBuffer.prototype.putInt = function(i, n) {
  do {
    n -= 8;
    this.data += String.fromCharCode((i >> n) & 0xFF);
  } while(n > 0);
  return this;
};

/**
 * Puts a signed n-bit integer in this buffer in big-endian order. Two's
 * complement representation is used.
 *
 * @param i the n-bit integer.
 * @param n the number of bits in the integer.
 *
 * @return this buffer.
 */
util.ByteStringBuffer.prototype.putSignedInt = function(i, n) {
  if(i < 0) {
    i += 2 << (n - 1);
  }
  return this.putInt(i, n);
};

/**
 * Puts the given buffer into this buffer.
 *
 * @param buffer the buffer to put into this one.
 *
 * @return this buffer.
 */
util.ByteStringBuffer.prototype.putBuffer = function(buffer) {
  this.data += buffer.getBytes();
  return this;
};

/**
 * Gets a byte from this buffer and advances the read pointer by 1.
 *
 * @return the byte.
 */
util.ByteStringBuffer.prototype.getByte = function() {
  return this.data.charCodeAt(this.read++);
};

/**
 * Gets a uint16 from this buffer in big-endian order and advances the read
 * pointer by 2.
 *
 * @return the uint16.
 */
util.ByteStringBuffer.prototype.getInt16 = function() {
  var rval = (
    this.data.charCodeAt(this.read) << 8 ^
    this.data.charCodeAt(this.read + 1));
  this.read += 2;
  return rval;
};

/**
 * Gets a uint24 from this buffer in big-endian order and advances the read
 * pointer by 3.
 *
 * @return the uint24.
 */
util.ByteStringBuffer.prototype.getInt24 = function() {
  var rval = (
    this.data.charCodeAt(this.read) << 16 ^
    this.data.charCodeAt(this.read + 1) << 8 ^
    this.data.charCodeAt(this.read + 2));
  this.read += 3;
  return rval;
};

/**
 * Gets a uint32 from this buffer in big-endian order and advances the read
 * pointer by 4.
 *
 * @return the word.
 */
util.ByteStringBuffer.prototype.getInt32 = function() {
  var rval = (
    this.data.charCodeAt(this.read) << 24 ^
    this.data.charCodeAt(this.read + 1) << 16 ^
    this.data.charCodeAt(this.read + 2) << 8 ^
    this.data.charCodeAt(this.read + 3));
  this.read += 4;
  return rval;
};

/**
 * Gets a uint16 from this buffer in little-endian order and advances the read
 * pointer by 2.
 *
 * @return the uint16.
 */
util.ByteStringBuffer.prototype.getInt16Le = function() {
  var rval = (
    this.data.charCodeAt(this.read) ^
    this.data.charCodeAt(this.read + 1) << 8);
  this.read += 2;
  return rval;
};

/**
 * Gets a uint24 from this buffer in little-endian order and advances the read
 * pointer by 3.
 *
 * @return the uint24.
 */
util.ByteStringBuffer.prototype.getInt24Le = function() {
  var rval = (
    this.data.charCodeAt(this.read) ^
    this.data.charCodeAt(this.read + 1) << 8 ^
    this.data.charCodeAt(this.read + 2) << 16);
  this.read += 3;
  return rval;
};

/**
 * Gets a uint32 from this buffer in little-endian order and advances the read
 * pointer by 4.
 *
 * @return the word.
 */
util.ByteStringBuffer.prototype.getInt32Le = function() {
  var rval = (
    this.data.charCodeAt(this.read) ^
    this.data.charCodeAt(this.read + 1) << 8 ^
    this.data.charCodeAt(this.read + 2) << 16 ^
    this.data.charCodeAt(this.read + 3) << 24);
  this.read += 4;
  return rval;
};

/**
 * Gets an n-bit integer from this buffer in big-endian order and advances the
 * read pointer by n/8.
 *
 * @param n the number of bits in the integer.
 *
 * @return the integer.
 */
util.ByteStringBuffer.prototype.getInt = function(n) {
  var rval = 0;
  do {
    rval = (rval << 8) + this.data.charCodeAt(this.read++);
    n -= 8;
  } while(n > 0);
  return rval;
};

/**
 * Gets a signed n-bit integer from this buffer in big-endian order, using
 * two's complement, and advances the read pointer by n/8.
 *
 * @param n the number of bits in the integer.
 *
 * @return the integer.
 */
util.ByteStringBuffer.prototype.getSignedInt = function(n) {
  var x = this.getInt(n);
  var max = 2 << (n - 2);
  if(x >= max) {
    x -= max << 1;
  }
  return x;
};

/**
 * Reads bytes out into a UTF-8 string and clears them from the buffer.
 *
 * @param count the number of bytes to read, undefined or null for all.
 *
 * @return a UTF-8 string of bytes.
 */
util.ByteStringBuffer.prototype.getBytes = function(count) {
  var rval;
  if(count) {
    // read count bytes
    count = Math.min(this.length(), count);
    rval = this.data.slice(this.read, this.read + count);
    this.read += count;
  } else if(count === 0) {
    rval = '';
  } else {
    // read all bytes, optimize to only copy when needed
    rval = (this.read === 0) ? this.data : this.data.slice(this.read);
    this.clear();
  }
  return rval;
};

/**
 * Gets a UTF-8 encoded string of the bytes from this buffer without modifying
 * the read pointer.
 *
 * @param count the number of bytes to get, omit to get all.
 *
 * @return a string full of UTF-8 encoded characters.
 */
util.ByteStringBuffer.prototype.bytes = function(count) {
  return (typeof(count) === 'undefined' ?
    this.data.slice(this.read) :
    this.data.slice(this.read, this.read + count));
};

/**
 * Gets a byte at the given index without modifying the read pointer.
 *
 * @param i the byte index.
 *
 * @return the byte.
 */
util.ByteStringBuffer.prototype.at = function(i) {
  return this.data.charCodeAt(this.read + i);
};

/**
 * Puts a byte at the given index without modifying the read pointer.
 *
 * @param i the byte index.
 * @param b the byte to put.
 *
 * @return this buffer.
 */
util.ByteStringBuffer.prototype.setAt = function(i, b) {
  this.data = this.data.substr(0, this.read + i) +
    String.fromCharCode(b) +
    this.data.substr(this.read + i + 1);
  return this;
};

/**
 * Gets the last byte without modifying the read pointer.
 *
 * @return the last byte.
 */
util.ByteStringBuffer.prototype.last = function() {
  return this.data.charCodeAt(this.data.length - 1);
};

/**
 * Creates a copy of this buffer.
 *
 * @return the copy.
 */
util.ByteStringBuffer.prototype.copy = function() {
  var c = util.createBuffer(this.data);
  c.read = this.read;
  return c;
};

/**
 * Compacts this buffer.
 *
 * @return this buffer.
 */
util.ByteStringBuffer.prototype.compact = function() {
  if(this.read > 0) {
    this.data = this.data.slice(this.read);
    this.read = 0;
  }
  return this;
};

/**
 * Clears this buffer.
 *
 * @return this buffer.
 */
util.ByteStringBuffer.prototype.clear = function() {
  this.data = '';
  this.read = 0;
  return this;
};

/**
 * Shortens this buffer by triming bytes off of the end of this buffer.
 *
 * @param count the number of bytes to trim off.
 *
 * @return this buffer.
 */
util.ByteStringBuffer.prototype.truncate = function(count) {
  var len = Math.max(0, this.length() - count);
  this.data = this.data.substr(this.read, len);
  this.read = 0;
  return this;
};

/**
 * Converts this buffer to a hexadecimal string.
 *
 * @return a hexadecimal string.
 */
util.ByteStringBuffer.prototype.toHex = function() {
  var rval = '';
  for(var i = this.read; i < this.data.length; ++i) {
    var b = this.data.charCodeAt(i);
    if(b < 16) {
      rval += '0';
    }
    rval += b.toString(16);
  }
  return rval;
};

/**
 * Converts this buffer to a UTF-16 string (standard JavaScript string).
 *
 * @return a UTF-16 string.
 */
util.ByteStringBuffer.prototype.toString = function() {
  return util.decodeUtf8(this.bytes());
};

/** End Buffer w/BinaryString backing */

/**
 * Creates a buffer that stores bytes. A value may be given to put into the
 * buffer that is either a string of bytes or a UTF-16 string that will
 * be encoded using UTF-8 (to do the latter, specify 'utf8' as the encoding).
 *
 * @param [input] the bytes to wrap (as a string) or a UTF-16 string to encode
 *          as UTF-8.
 * @param [encoding] (default: 'raw', other: 'utf8').
 */
util.createBuffer = function(input, encoding) {
  // TODO: deprecate, use new ByteBuffer() instead
  encoding = encoding || 'raw';
  if(input !== undefined && encoding === 'utf8') {
    input = util.encodeUtf8(input);
  }
  return new util.ByteBuffer(input);
};

/**
 * Fills a string with a particular value. If you want the string to be a byte
 * string, pass in String.fromCharCode(theByte).
 *
 * @param c the character to fill the string with, use String.fromCharCode
 *          to fill the string with a byte value.
 * @param n the number of characters of value c to fill with.
 *
 * @return the filled string.
 */
util.fillString = function(c, n) {
  var s = '';
  while(n > 0) {
    if(n & 1) {
      s += c;
    }
    n >>>= 1;
    if(n > 0) {
      c += c;
    }
  }
  return s;
};

/**
 * UTF-8 encodes the given UTF-16 encoded string (a standard JavaScript
 * string). Non-ASCII characters will be encoded as multiple bytes according
 * to UTF-8.
 *
 * @param str the string to encode.
 *
 * @return the UTF-8 encoded string.
 */
util.encodeUtf8 = function(str) {
  return unescape(encodeURIComponent(str));
};

} // end module implementation

/* ########## Begin module wrapper ########## */
var name = 'util';
if(typeof define !== 'function') {
  // NodeJS -> AMD
  if(typeof module === 'object' && module.exports) {
    var nodeJS = true;
    define = function(ids, factory) {
      factory(require, module);
    };
  } else {
    // <script>
    if(typeof forge === 'undefined') {
      forge = {};
    }
    return initModule(forge);
  }
}
// AMD
var deps;
var defineFunc = function(require, module) {
  module.exports = function(forge) {
    var mods = deps.map(function(dep) {
      return require(dep);
    }).concat(initModule);
    // handle circular dependencies
    forge = forge || {};
    forge.defined = forge.defined || {};
    if(forge.defined[name]) {
      return forge[name];
    }
    forge.defined[name] = true;
    for(var i = 0; i < mods.length; ++i) {
      mods[i](forge);
    }
    return forge[name];
  };
};
var tmpDefine = define;
define = function(ids, factory) {
  deps = (typeof ids === 'string') ? factory.slice(2) : ids.slice(2);
  if(nodeJS) {
    define = undefined;
    return tmpDefine.apply(null, Array.prototype.slice.call(arguments, 0));
  }
  define = tmpDefine;
  return define.apply(null, Array.prototype.slice.call(arguments, 0));
};
define(['require', 'module'], function() {
  defineFunc.apply(null, Array.prototype.slice.call(arguments, 0));
});
})();


/* SOURCE: libs/forge/md5.js */
/**
 * Message Digest Algorithm 5 with 128-bit digest (MD5) implementation.
 *
 * @author Dave Longley
 *
 * Copyright (c) 2010-2014 Digital Bazaar, Inc.
 */
(function() {
/* ########## Begin module implementation ########## */
function initModule(forge) {

var md5 = forge.md5 = forge.md5 || {};
forge.md = forge.md || {};
forge.md.algorithms = forge.md.algorithms || {};
forge.md.md5 = forge.md.algorithms.md5 = md5;

// A weak map from message digest objects to hashes containing their private
// _state and _input variables.  We store them in this map so other message
// digest objects can access them in md.clone.  They remain inaccessible outside
// the module.
var _privates = new WeakMap();

/**
 * Creates an MD5 message digest object.
 *
 * @return a message digest object.
 */
md5.create = function() {
  // do initialization as necessary
  if(!_initialized) {
    _init();
  }

  var _private = {
    // MD5 state contains four 32-bit integers
    _state: null,

    // input buffer
    _input: forge.util.createBuffer()
  };

  // used for word storage
  var _w = new Array(16);

  // message digest object
  var md = {
    algorithm: 'md5',
    blockLength: 64,
    digestLength: 16,
    // 56-bit length of message so far (does not including padding)
    messageLength: 0,
    // true 64-bit message length as two 32-bit ints
    messageLength64: [0, 0]
  };

  _privates.set(md, _private);

  /**
   * Starts the digest.
   *
   * @return this digest object.
   */
  md.start = function() {
    md.messageLength = 0;
    md.messageLength64 = [0, 0];
    _private._input = forge.util.createBuffer();
    _private._state = {
      h0: 0x67452301,
      h1: 0xEFCDAB89,
      h2: 0x98BADCFE,
      h3: 0x10325476
    };
    return md;
  };
  // start digest automatically for first time
  md.start();

  /**
   * Updates the digest with the given message input. The given input can
   * treated as raw input (no encoding will be applied) or an encoding of
   * 'utf8' maybe given to encode the input using UTF-8.
   *
   * @param msg the message input to update with.
   * @param encoding the encoding to use (default: 'raw', other: 'utf8').
   *
   * @return this digest object.
   */
  md.update = function(msg, encoding) {
    if(encoding === 'utf8') {
      msg = forge.util.encodeUtf8(msg);
    }

    // update message length
    md.messageLength += msg.length;
    md.messageLength64[0] += (msg.length / 0x100000000) >>> 0;
    md.messageLength64[1] += msg.length >>> 0;

    // add bytes to input buffer
    _private._input.putBytes(msg);

    // process bytes
    _update(_private._state, _w, _private._input);

    // compact input buffer every 2K or if empty
    if(_private._input.read > 2048 || _private._input.length() === 0) {
      _private._input.compact();
    }

    return md;
  };

  /**
   * Clones this message digest object, returning a new message digest object
   * whose state is identical to this object's state.
   */
  md.clone = function() {
    var clone = md5.create();

    clone.messageLength = md.messageLength;
    clone.messageLength64[0] = md.messageLength64[0];
    clone.messageLength64[1] = md.messageLength64[1];

    var clonePrivate = _privates.get(clone);

    if (clonePrivate) {
      clonePrivate._input.putBytes(_private._input.bytes());
      clonePrivate._state = {
        h0: _private._state.h0,
        h1: _private._state.h1,
        h2: _private._state.h2,
        h3: _private._state.h3
      };
    } else {
      console.warn("MD5.clone: couldn't find private for clone");
    }

    return clone;
  };

  /**
   * Produces the digest.
   *
   * @return a byte buffer containing the digest value.
   */
  md.digest = function() {
    /* Note: Here we copy the remaining bytes in the input buffer and
    add the appropriate MD5 padding. Then we do the final update
    on a copy of the state so that if the user wants to get
    intermediate digests they can do so. */

    /* Determine the number of bytes that must be added to the message
    to ensure its length is congruent to 448 mod 512. In other words,
    the data to be digested must be a multiple of 512 bits (or 128 bytes).
    This data includes the message, some padding, and the length of the
    message. Since the length of the message will be encoded as 8 bytes (64
    bits), that means that the last segment of the data must have 56 bytes
    (448 bits) of message and padding. Therefore, the length of the message
    plus the padding must be congruent to 448 mod 512 because
    512 - 128 = 448.

    In order to fill up the message length it must be filled with
    padding that begins with 1 bit followed by all 0 bits. Padding
    must *always* be present, so if the message length is already
    congruent to 448 mod 512, then 512 padding bits must be added. */

    // 512 bits == 64 bytes, 448 bits == 56 bytes, 64 bits = 8 bytes
    // _padding starts with 1 byte with first bit is set in it which
    // is byte value 128, then there may be up to 63 other pad bytes
    var padBytes = forge.util.createBuffer();
    padBytes.putBytes(_private._input.bytes());
    // 64 - (remaining msg + 8 bytes msg length) mod 64
    padBytes.putBytes(
      _padding.substr(0, 64 - ((md.messageLength64[1] + 8) & 0x3F)));

    /* Now append length of the message. The length is appended in bits
    as a 64-bit number in little-endian order. Since we store the length in
    bytes, we must multiply the 64-bit length by 8 (or left shift by 3). */
    padBytes.putInt32Le(md.messageLength64[1] << 3);
    padBytes.putInt32Le(
      (md.messageLength64[0] << 3) | (md.messageLength64[0] >>> 28));
    var s2 = {
      h0: _private._state.h0,
      h1: _private._state.h1,
      h2: _private._state.h2,
      h3: _private._state.h3
    };
    _update(s2, _w, padBytes);
    var rval = forge.util.createBuffer();
    rval.putInt32Le(s2.h0);
    rval.putInt32Le(s2.h1);
    rval.putInt32Le(s2.h2);
    rval.putInt32Le(s2.h3);
    return rval;
  };

  return md;
};

// padding, constant tables for calculating md5
var _padding = null;
var _g = null;
var _r = null;
var _k = null;
var _initialized = false;

/**
 * Initializes the constant tables.
 */
function _init() {
  // create padding
  _padding = String.fromCharCode(128);
  _padding += forge.util.fillString(String.fromCharCode(0x00), 64);

  // g values
  _g = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
    1, 6, 11, 0, 5, 10, 15, 4, 9, 14, 3, 8, 13, 2, 7, 12,
    5, 8, 11, 14, 1, 4, 7, 10, 13, 0, 3, 6, 9, 12, 15, 2,
    0, 7, 14, 5, 12, 3, 10, 1, 8, 15, 6, 13, 4, 11, 2, 9];

  // rounds table
  _r = [
    7, 12, 17, 22,  7, 12, 17, 22,  7, 12, 17, 22,  7, 12, 17, 22,
    5,  9, 14, 20,  5,  9, 14, 20,  5,  9, 14, 20,  5,  9, 14, 20,
    4, 11, 16, 23,  4, 11, 16, 23,  4, 11, 16, 23,  4, 11, 16, 23,
    6, 10, 15, 21,  6, 10, 15, 21,  6, 10, 15, 21,  6, 10, 15, 21];

  // get the result of abs(sin(i + 1)) as a 32-bit integer
  _k = new Array(64);
  for(var i = 0; i < 64; ++i) {
    _k[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 0x100000000);
  }

  // now initialized
  _initialized = true;
}

/**
 * Updates an MD5 state with the given byte buffer.
 *
 * @param s the MD5 state to update.
 * @param w the array to use to store words.
 * @param bytes the byte buffer to update with.
 */
function _update(s, w, bytes) {
  // consume 512 bit (64 byte) chunks
  var t, a, b, c, d, f, r, i;
  var len = bytes.length();
  while(len >= 64) {
    // initialize hash value for this chunk
    a = s.h0;
    b = s.h1;
    c = s.h2;
    d = s.h3;

    // round 1
    for(i = 0; i < 16; ++i) {
      w[i] = bytes.getInt32Le();
      f = d ^ (b & (c ^ d));
      t = (a + f + _k[i] + w[i]);
      r = _r[i];
      a = d;
      d = c;
      c = b;
      b += (t << r) | (t >>> (32 - r));
    }
    // round 2
    for(; i < 32; ++i) {
      f = c ^ (d & (b ^ c));
      t = (a + f + _k[i] + w[_g[i]]);
      r = _r[i];
      a = d;
      d = c;
      c = b;
      b += (t << r) | (t >>> (32 - r));
    }
    // round 3
    for(; i < 48; ++i) {
      f = b ^ c ^ d;
      t = (a + f + _k[i] + w[_g[i]]);
      r = _r[i];
      a = d;
      d = c;
      c = b;
      b += (t << r) | (t >>> (32 - r));
    }
    // round 4
    for(; i < 64; ++i) {
      f = c ^ (b | ~d);
      t = (a + f + _k[i] + w[_g[i]]);
      r = _r[i];
      a = d;
      d = c;
      c = b;
      b += (t << r) | (t >>> (32 - r));
    }

    // update hash state
    s.h0 = (s.h0 + a) | 0;
    s.h1 = (s.h1 + b) | 0;
    s.h2 = (s.h2 + c) | 0;
    s.h3 = (s.h3 + d) | 0;

    len -= 64;
  }
}

} // end module implementation

/* ########## Begin module wrapper ########## */
var name = 'md5';
if(typeof define !== 'function') {
  // NodeJS -> AMD
  if(typeof module === 'object' && module.exports) {
    var nodeJS = true;
    define = function(ids, factory) {
      factory(require, module);
    };
  } else {
    // <script>
    if(typeof forge === 'undefined') {
      forge = {};
    }
    return initModule(forge);
  }
}
// AMD
var deps;
var defineFunc = function(require, module) {
  module.exports = function(forge) {
    var mods = deps.map(function(dep) {
      return require(dep);
    }).concat(initModule);
    // handle circular dependencies
    forge = forge || {};
    forge.defined = forge.defined || {};
    if(forge.defined[name]) {
      return forge[name];
    }
    forge.defined[name] = true;
    for(var i = 0; i < mods.length; ++i) {
      mods[i](forge);
    }
    return forge[name];
  };
};
var tmpDefine = define;
define = function(ids, factory) {
  deps = (typeof ids === 'string') ? factory.slice(2) : ids.slice(2);
  if(nodeJS) {
    define = undefined;
    return tmpDefine.apply(null, Array.prototype.slice.call(arguments, 0));
  }
  define = tmpDefine;
  return define.apply(null, Array.prototype.slice.call(arguments, 0));
};
define(['require', 'module', './util'], function() {
  defineFunc.apply(null, Array.prototype.slice.call(arguments, 0));
});
})();


/* SOURCE: libs/jsbn/jsbn.js */
// Copyright (c) 2005  Tom Wu
// All Rights Reserved.
// See "LICENSE" for details.

// Basic JavaScript BN library - subset useful for RSA encryption.

// Bits per digit
var dbits;

// JavaScript engine analysis
var canary = 0xdeadbeefcafe;
var j_lm = ((canary&0xffffff)==0xefcafe);

// (public) Constructor
function BigInteger(a,b,c) {
  if(a != null)
    if("number" == typeof a) this.fromNumber(a,b,c);
    else if(b == null && "string" != typeof a) this.fromString(a,256);
    else this.fromString(a,b);
}

// return new, unset BigInteger
function nbi() { return new BigInteger(null); }

// am: Compute w_j += (x*this_i), propagate carries,
// c is initial carry, returns final carry.
// c < 3*dvalue, x < 2*dvalue, this_i < dvalue
// We need to select the fastest one that works in this environment.

// am1: use a single mult and divide to get the high bits,
// max digit bits should be 26 because
// max internal value = 2*dvalue^2-2*dvalue (< 2^53)
function am1(i,x,w,j,c,n) {
  while(--n >= 0) {
    var v = x*this[i++]+w[j]+c;
    c = Math.floor(v/0x4000000);
    w[j++] = v&0x3ffffff;
  }
  return c;
}
// am2 avoids a big mult-and-extract completely.
// Max digit bits should be <= 30 because we do bitwise ops
// on values up to 2*hdvalue^2-hdvalue-1 (< 2^31)
function am2(i,x,w,j,c,n) {
  var xl = x&0x7fff, xh = x>>15;
  while(--n >= 0) {
    var l = this[i]&0x7fff;
    var h = this[i++]>>15;
    var m = xh*l+h*xl;
    l = xl*l+((m&0x7fff)<<15)+w[j]+(c&0x3fffffff);
    c = (l>>>30)+(m>>>15)+xh*h+(c>>>30);
    w[j++] = l&0x3fffffff;
  }
  return c;
}
// Alternately, set max digit bits to 28 since some
// browsers slow down when dealing with 32-bit numbers.
function am3(i,x,w,j,c,n) {
  var xl = x&0x3fff, xh = x>>14;
  while(--n >= 0) {
    var l = this[i]&0x3fff;
    var h = this[i++]>>14;
    var m = xh*l+h*xl;
    l = xl*l+((m&0x3fff)<<14)+w[j]+c;
    c = (l>>28)+(m>>14)+xh*h;
    w[j++] = l&0xfffffff;
  }
  return c;
}
if(j_lm && (navigator.appName == "Microsoft Internet Explorer")) {
  BigInteger.prototype.am = am2;
  dbits = 30;
}
else if(j_lm && (navigator.appName != "Netscape")) {
  BigInteger.prototype.am = am1;
  dbits = 26;
}
else { // Mozilla/Netscape seems to prefer am3
  BigInteger.prototype.am = am3;
  dbits = 28;
}

BigInteger.prototype.DB = dbits;
BigInteger.prototype.DM = ((1<<dbits)-1);
BigInteger.prototype.DV = (1<<dbits);

var BI_FP = 52;
BigInteger.prototype.FV = Math.pow(2,BI_FP);
BigInteger.prototype.F1 = BI_FP-dbits;
BigInteger.prototype.F2 = 2*dbits-BI_FP;

// Digit conversions
var BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz";
var BI_RC = new Array();
var rr,vv;
rr = "0".charCodeAt(0);
for(vv = 0; vv <= 9; ++vv) BI_RC[rr++] = vv;
rr = "a".charCodeAt(0);
for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
rr = "A".charCodeAt(0);
for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;

function int2char(n) { return BI_RM.charAt(n); }
function intAt(s,i) {
  var c = BI_RC[s.charCodeAt(i)];
  return (c==null)?-1:c;
}

// (protected) copy this to r
function bnpCopyTo(r) {
  for(var i = this.t-1; i >= 0; --i) r[i] = this[i];
  r.t = this.t;
  r.s = this.s;
}

// (protected) set from integer value x, -DV <= x < DV
function bnpFromInt(x) {
  this.t = 1;
  this.s = (x<0)?-1:0;
  if(x > 0) this[0] = x;
  else if(x < -1) this[0] = x+this.DV;
  else this.t = 0;
}

// return bigint initialized to value
function nbv(i) { var r = nbi(); r.fromInt(i); return r; }

// (protected) set from string and radix
function bnpFromString(s,b) {
  var k;
  if(b == 16) k = 4;
  else if(b == 8) k = 3;
  else if(b == 256) k = 8; // byte array
  else if(b == 2) k = 1;
  else if(b == 32) k = 5;
  else if(b == 4) k = 2;
  else { this.fromRadix(s,b); return; }
  this.t = 0;
  this.s = 0;
  var i = s.length, mi = false, sh = 0;
  while(--i >= 0) {
    var x = (k==8)?s[i]&0xff:intAt(s,i);
    if(x < 0) {
      if(s.charAt(i) == "-") mi = true;
      continue;
    }
    mi = false;
    if(sh == 0)
      this[this.t++] = x;
    else if(sh+k > this.DB) {
      this[this.t-1] |= (x&((1<<(this.DB-sh))-1))<<sh;
      this[this.t++] = (x>>(this.DB-sh));
    }
    else
      this[this.t-1] |= x<<sh;
    sh += k;
    if(sh >= this.DB) sh -= this.DB;
  }
  if(k == 8 && (s[0]&0x80) != 0) {
    this.s = -1;
    if(sh > 0) this[this.t-1] |= ((1<<(this.DB-sh))-1)<<sh;
  }
  this.clamp();
  if(mi) BigInteger.ZERO.subTo(this,this);
}

// (protected) clamp off excess high words
function bnpClamp() {
  var c = this.s&this.DM;
  while(this.t > 0 && this[this.t-1] == c) --this.t;
}

// (public) return string representation in given radix
function bnToString(b) {
  if(this.s < 0) return "-"+this.negate().toString(b);
  var k;
  if(b == 16) k = 4;
  else if(b == 8) k = 3;
  else if(b == 2) k = 1;
  else if(b == 32) k = 5;
  else if(b == 4) k = 2;
  else return this.toRadix(b);
  var km = (1<<k)-1, d, m = false, r = "", i = this.t;
  var p = this.DB-(i*this.DB)%k;
  if(i-- > 0) {
    if(p < this.DB && (d = this[i]>>p) > 0) { m = true; r = int2char(d); }
    while(i >= 0) {
      if(p < k) {
        d = (this[i]&((1<<p)-1))<<(k-p);
        d |= this[--i]>>(p+=this.DB-k);
      }
      else {
        d = (this[i]>>(p-=k))&km;
        if(p <= 0) { p += this.DB; --i; }
      }
      if(d > 0) m = true;
      if(m) r += int2char(d);
    }
  }
  return m?r:"0";
}

// (public) -this
function bnNegate() { var r = nbi(); BigInteger.ZERO.subTo(this,r); return r; }

// (public) |this|
function bnAbs() { return (this.s<0)?this.negate():this; }

// (public) return + if this > a, - if this < a, 0 if equal
function bnCompareTo(a) {
  var r = this.s-a.s;
  if(r != 0) return r;
  var i = this.t;
  r = i-a.t;
  if(r != 0) return (this.s<0)?-r:r;
  while(--i >= 0) if((r=this[i]-a[i]) != 0) return r;
  return 0;
}

// returns bit length of the integer x
function nbits(x) {
  var r = 1, t;
  if((t=x>>>16) != 0) { x = t; r += 16; }
  if((t=x>>8) != 0) { x = t; r += 8; }
  if((t=x>>4) != 0) { x = t; r += 4; }
  if((t=x>>2) != 0) { x = t; r += 2; }
  if((t=x>>1) != 0) { x = t; r += 1; }
  return r;
}

// (public) return the number of bits in "this"
function bnBitLength() {
  if(this.t <= 0) return 0;
  return this.DB*(this.t-1)+nbits(this[this.t-1]^(this.s&this.DM));
}

// (protected) r = this << n*DB
function bnpDLShiftTo(n,r) {
  var i;
  for(i = this.t-1; i >= 0; --i) r[i+n] = this[i];
  for(i = n-1; i >= 0; --i) r[i] = 0;
  r.t = this.t+n;
  r.s = this.s;
}

// (protected) r = this >> n*DB
function bnpDRShiftTo(n,r) {
  for(var i = n; i < this.t; ++i) r[i-n] = this[i];
  r.t = Math.max(this.t-n,0);
  r.s = this.s;
}

// (protected) r = this << n
function bnpLShiftTo(n,r) {
  var bs = n%this.DB;
  var cbs = this.DB-bs;
  var bm = (1<<cbs)-1;
  var ds = Math.floor(n/this.DB), c = (this.s<<bs)&this.DM, i;
  for(i = this.t-1; i >= 0; --i) {
    r[i+ds+1] = (this[i]>>cbs)|c;
    c = (this[i]&bm)<<bs;
  }
  for(i = ds-1; i >= 0; --i) r[i] = 0;
  r[ds] = c;
  r.t = this.t+ds+1;
  r.s = this.s;
  r.clamp();
}

// (protected) r = this >> n
function bnpRShiftTo(n,r) {
  r.s = this.s;
  var ds = Math.floor(n/this.DB);
  if(ds >= this.t) { r.t = 0; return; }
  var bs = n%this.DB;
  var cbs = this.DB-bs;
  var bm = (1<<bs)-1;
  r[0] = this[ds]>>bs;
  for(var i = ds+1; i < this.t; ++i) {
    r[i-ds-1] |= (this[i]&bm)<<cbs;
    r[i-ds] = this[i]>>bs;
  }
  if(bs > 0) r[this.t-ds-1] |= (this.s&bm)<<cbs;
  r.t = this.t-ds;
  r.clamp();
}

// (protected) r = this - a
function bnpSubTo(a,r) {
  var i = 0, c = 0, m = Math.min(a.t,this.t);
  while(i < m) {
    c += this[i]-a[i];
    r[i++] = c&this.DM;
    c >>= this.DB;
  }
  if(a.t < this.t) {
    c -= a.s;
    while(i < this.t) {
      c += this[i];
      r[i++] = c&this.DM;
      c >>= this.DB;
    }
    c += this.s;
  }
  else {
    c += this.s;
    while(i < a.t) {
      c -= a[i];
      r[i++] = c&this.DM;
      c >>= this.DB;
    }
    c -= a.s;
  }
  r.s = (c<0)?-1:0;
  if(c < -1) r[i++] = this.DV+c;
  else if(c > 0) r[i++] = c;
  r.t = i;
  r.clamp();
}

// (protected) r = this * a, r != this,a (HAC 14.12)
// "this" should be the larger one if appropriate.
function bnpMultiplyTo(a,r) {
  var x = this.abs(), y = a.abs();
  var i = x.t;
  r.t = i+y.t;
  while(--i >= 0) r[i] = 0;
  for(i = 0; i < y.t; ++i) r[i+x.t] = x.am(0,y[i],r,i,0,x.t);
  r.s = 0;
  r.clamp();
  if(this.s != a.s) BigInteger.ZERO.subTo(r,r);
}

// (protected) r = this^2, r != this (HAC 14.16)
function bnpSquareTo(r) {
  var x = this.abs();
  var i = r.t = 2*x.t;
  while(--i >= 0) r[i] = 0;
  for(i = 0; i < x.t-1; ++i) {
    var c = x.am(i,x[i],r,2*i,0,1);
    if((r[i+x.t]+=x.am(i+1,2*x[i],r,2*i+1,c,x.t-i-1)) >= x.DV) {
      r[i+x.t] -= x.DV;
      r[i+x.t+1] = 1;
    }
  }
  if(r.t > 0) r[r.t-1] += x.am(i,x[i],r,2*i,0,1);
  r.s = 0;
  r.clamp();
}

// (protected) divide this by m, quotient and remainder to q, r (HAC 14.20)
// r != q, this != m.  q or r may be null.
function bnpDivRemTo(m,q,r) {
  var pm = m.abs();
  if(pm.t <= 0) return;
  var pt = this.abs();
  if(pt.t < pm.t) {
    if(q != null) q.fromInt(0);
    if(r != null) this.copyTo(r);
    return;
  }
  if(r == null) r = nbi();
  var y = nbi(), ts = this.s, ms = m.s;
  var nsh = this.DB-nbits(pm[pm.t-1]);	// normalize modulus
  if(nsh > 0) { pm.lShiftTo(nsh,y); pt.lShiftTo(nsh,r); }
  else { pm.copyTo(y); pt.copyTo(r); }
  var ys = y.t;
  var y0 = y[ys-1];
  if(y0 == 0) return;
  var yt = y0*(1<<this.F1)+((ys>1)?y[ys-2]>>this.F2:0);
  var d1 = this.FV/yt, d2 = (1<<this.F1)/yt, e = 1<<this.F2;
  var i = r.t, j = i-ys, t = (q==null)?nbi():q;
  y.dlShiftTo(j,t);
  if(r.compareTo(t) >= 0) {
    r[r.t++] = 1;
    r.subTo(t,r);
  }
  BigInteger.ONE.dlShiftTo(ys,t);
  t.subTo(y,y);	// "negative" y so we can replace sub with am later
  while(y.t < ys) y[y.t++] = 0;
  while(--j >= 0) {
    // Estimate quotient digit
    var qd = (r[--i]==y0)?this.DM:Math.floor(r[i]*d1+(r[i-1]+e)*d2);
    if((r[i]+=y.am(0,qd,r,j,0,ys)) < qd) {	// Try it out
      y.dlShiftTo(j,t);
      r.subTo(t,r);
      while(r[i] < --qd) r.subTo(t,r);
    }
  }
  if(q != null) {
    r.drShiftTo(ys,q);
    if(ts != ms) BigInteger.ZERO.subTo(q,q);
  }
  r.t = ys;
  r.clamp();
  if(nsh > 0) r.rShiftTo(nsh,r);	// Denormalize remainder
  if(ts < 0) BigInteger.ZERO.subTo(r,r);
}

// (public) this mod a
function bnMod(a) {
  var r = nbi();
  this.abs().divRemTo(a,null,r);
  if(this.s < 0 && r.compareTo(BigInteger.ZERO) > 0) a.subTo(r,r);
  return r;
}

// Modular reduction using "classic" algorithm
function Classic(m) { this.m = m; }
function cConvert(x) {
  if(x.s < 0 || x.compareTo(this.m) >= 0) return x.mod(this.m);
  else return x;
}
function cRevert(x) { return x; }
function cReduce(x) { x.divRemTo(this.m,null,x); }
function cMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }
function cSqrTo(x,r) { x.squareTo(r); this.reduce(r); }

Classic.prototype.convert = cConvert;
Classic.prototype.revert = cRevert;
Classic.prototype.reduce = cReduce;
Classic.prototype.mulTo = cMulTo;
Classic.prototype.sqrTo = cSqrTo;

// (protected) return "-1/this % 2^DB"; useful for Mont. reduction
// justification:
//         xy == 1 (mod m)
//         xy =  1+km
//   xy(2-xy) = (1+km)(1-km)
// x[y(2-xy)] = 1-k^2m^2
// x[y(2-xy)] == 1 (mod m^2)
// if y is 1/x mod m, then y(2-xy) is 1/x mod m^2
// should reduce x and y(2-xy) by m^2 at each step to keep size bounded.
// JS multiply "overflows" differently from C/C++, so care is needed here.
function bnpInvDigit() {
  if(this.t < 1) return 0;
  var x = this[0];
  if((x&1) == 0) return 0;
  var y = x&3;		// y == 1/x mod 2^2
  y = (y*(2-(x&0xf)*y))&0xf;	// y == 1/x mod 2^4
  y = (y*(2-(x&0xff)*y))&0xff;	// y == 1/x mod 2^8
  y = (y*(2-(((x&0xffff)*y)&0xffff)))&0xffff;	// y == 1/x mod 2^16
  // last step - calculate inverse mod DV directly;
  // assumes 16 < DB <= 32 and assumes ability to handle 48-bit ints
  y = (y*(2-x*y%this.DV))%this.DV;		// y == 1/x mod 2^dbits
  // we really want the negative inverse, and -DV < y < DV
  return (y>0)?this.DV-y:-y;
}

// Montgomery reduction
function Montgomery(m) {
  this.m = m;
  this.mp = m.invDigit();
  this.mpl = this.mp&0x7fff;
  this.mph = this.mp>>15;
  this.um = (1<<(m.DB-15))-1;
  this.mt2 = 2*m.t;
}

// xR mod m
function montConvert(x) {
  var r = nbi();
  x.abs().dlShiftTo(this.m.t,r);
  r.divRemTo(this.m,null,r);
  if(x.s < 0 && r.compareTo(BigInteger.ZERO) > 0) this.m.subTo(r,r);
  return r;
}

// x/R mod m
function montRevert(x) {
  var r = nbi();
  x.copyTo(r);
  this.reduce(r);
  return r;
}

// x = x/R mod m (HAC 14.32)
function montReduce(x) {
  while(x.t <= this.mt2)	// pad x so am has enough room later
    x[x.t++] = 0;
  for(var i = 0; i < this.m.t; ++i) {
    // faster way of calculating u0 = x[i]*mp mod DV
    var j = x[i]&0x7fff;
    var u0 = (j*this.mpl+(((j*this.mph+(x[i]>>15)*this.mpl)&this.um)<<15))&x.DM;
    // use am to combine the multiply-shift-add into one call
    j = i+this.m.t;
    x[j] += this.m.am(0,u0,x,i,0,this.m.t);
    // propagate carry
    while(x[j] >= x.DV) { x[j] -= x.DV; x[++j]++; }
  }
  x.clamp();
  x.drShiftTo(this.m.t,x);
  if(x.compareTo(this.m) >= 0) x.subTo(this.m,x);
}

// r = "x^2/R mod m"; x != r
function montSqrTo(x,r) { x.squareTo(r); this.reduce(r); }

// r = "xy/R mod m"; x,y != r
function montMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }

Montgomery.prototype.convert = montConvert;
Montgomery.prototype.revert = montRevert;
Montgomery.prototype.reduce = montReduce;
Montgomery.prototype.mulTo = montMulTo;
Montgomery.prototype.sqrTo = montSqrTo;

// (protected) true iff this is even
function bnpIsEven() { return ((this.t>0)?(this[0]&1):this.s) == 0; }

// (protected) this^e, e < 2^32, doing sqr and mul with "r" (HAC 14.79)
function bnpExp(e,z) {
  if(e > 0xffffffff || e < 1) return BigInteger.ONE;
  var r = nbi(), r2 = nbi(), g = z.convert(this), i = nbits(e)-1;
  g.copyTo(r);
  while(--i >= 0) {
    z.sqrTo(r,r2);
    if((e&(1<<i)) > 0) z.mulTo(r2,g,r);
    else { var t = r; r = r2; r2 = t; }
  }
  return z.revert(r);
}

// (public) this^e % m, 0 <= e < 2^32
function bnModPowInt(e,m) {
  var z;
  if(e < 256 || m.isEven()) z = new Classic(m); else z = new Montgomery(m);
  return this.exp(e,z);
}

// protected
BigInteger.prototype.copyTo = bnpCopyTo;
BigInteger.prototype.fromInt = bnpFromInt;
BigInteger.prototype.fromString = bnpFromString;
BigInteger.prototype.clamp = bnpClamp;
BigInteger.prototype.dlShiftTo = bnpDLShiftTo;
BigInteger.prototype.drShiftTo = bnpDRShiftTo;
BigInteger.prototype.lShiftTo = bnpLShiftTo;
BigInteger.prototype.rShiftTo = bnpRShiftTo;
BigInteger.prototype.subTo = bnpSubTo;
BigInteger.prototype.multiplyTo = bnpMultiplyTo;
BigInteger.prototype.squareTo = bnpSquareTo;
BigInteger.prototype.divRemTo = bnpDivRemTo;
BigInteger.prototype.invDigit = bnpInvDigit;
BigInteger.prototype.isEven = bnpIsEven;
BigInteger.prototype.exp = bnpExp;

// public
BigInteger.prototype.toString = bnToString;
BigInteger.prototype.negate = bnNegate;
BigInteger.prototype.abs = bnAbs;
BigInteger.prototype.compareTo = bnCompareTo;
BigInteger.prototype.bitLength = bnBitLength;
BigInteger.prototype.mod = bnMod;
BigInteger.prototype.modPowInt = bnModPowInt;

// "constants"
BigInteger.ZERO = nbv(0);
BigInteger.ONE = nbv(1);


/* SOURCE: libs/jsbn/jsbn2.js */
// Copyright (c) 2005-2009  Tom Wu
// All Rights Reserved.
// See "LICENSE" for details.

// Extended JavaScript BN functions, required for RSA private ops.

// Version 1.1: new BigInteger("0", 10) returns "proper" zero
// Version 1.2: square() API, isProbablePrime fix

// (public)
function bnClone() { var r = nbi(); this.copyTo(r); return r; }

// (public) return value as integer
function bnIntValue() {
  if(this.s < 0) {
    if(this.t == 1) return this[0]-this.DV;
    else if(this.t == 0) return -1;
  }
  else if(this.t == 1) return this[0];
  else if(this.t == 0) return 0;
  // assumes 16 < DB < 32
  return ((this[1]&((1<<(32-this.DB))-1))<<this.DB)|this[0];
}

// (public) return value as byte
function bnByteValue() { return (this.t==0)?this.s:(this[0]<<24)>>24; }

// (public) return value as short (assumes DB>=16)
function bnShortValue() { return (this.t==0)?this.s:(this[0]<<16)>>16; }

// (protected) return x s.t. r^x < DV
function bnpChunkSize(r) { return Math.floor(Math.LN2*this.DB/Math.log(r)); }

// (public) 0 if this == 0, 1 if this > 0
function bnSigNum() {
  if(this.s < 0) return -1;
  else if(this.t <= 0 || (this.t == 1 && this[0] <= 0)) return 0;
  else return 1;
}

// (protected) convert to radix string
function bnpToRadix(b) {
  if(b == null) b = 10;
  if(this.signum() == 0 || b < 2 || b > 36) return "0";
  var cs = this.chunkSize(b);
  var a = Math.pow(b,cs);
  var d = nbv(a), y = nbi(), z = nbi(), r = "";
  this.divRemTo(d,y,z);
  while(y.signum() > 0) {
    r = (a+z.intValue()).toString(b).substr(1) + r;
    y.divRemTo(d,y,z);
  }
  return z.intValue().toString(b) + r;
}

// (protected) convert from radix string
function bnpFromRadix(s,b) {
  this.fromInt(0);
  if(b == null) b = 10;
  var cs = this.chunkSize(b);
  var d = Math.pow(b,cs), mi = false, j = 0, w = 0;
  for(var i = 0; i < s.length; ++i) {
    var x = intAt(s,i);
    if(x < 0) {
      if(s.charAt(i) == "-" && this.signum() == 0) mi = true;
      continue;
    }
    w = b*w+x;
    if(++j >= cs) {
      this.dMultiply(d);
      this.dAddOffset(w,0);
      j = 0;
      w = 0;
    }
  }
  if(j > 0) {
    this.dMultiply(Math.pow(b,j));
    this.dAddOffset(w,0);
  }
  if(mi) BigInteger.ZERO.subTo(this,this);
}

// (protected) alternate constructor
function bnpFromNumber(a,b,c) {
  if("number" == typeof b) {
    // new BigInteger(int,int,RNG)
    if(a < 2) this.fromInt(1);
    else {
      this.fromNumber(a,c);
      if(!this.testBit(a-1))	// force MSB set
        this.bitwiseTo(BigInteger.ONE.shiftLeft(a-1),op_or,this);
      if(this.isEven()) this.dAddOffset(1,0); // force odd
      while(!this.isProbablePrime(b)) {
        this.dAddOffset(2,0);
        if(this.bitLength() > a) this.subTo(BigInteger.ONE.shiftLeft(a-1),this);
      }
    }
  }
  else {
    // new BigInteger(int,RNG)
    var x = new Array(), t = a&7;
    x.length = (a>>3)+1;
    b.nextBytes(x);
    if(t > 0) x[0] &= ((1<<t)-1); else x[0] = 0;
    this.fromString(x,256);
  }
}

// (public) convert to bigendian byte array
function bnToByteArray() {
  var i = this.t, r = new Array();
  r[0] = this.s;
  var p = this.DB-(i*this.DB)%8, d, k = 0;
  if(i-- > 0) {
    if(p < this.DB && (d = this[i]>>p) != (this.s&this.DM)>>p)
      r[k++] = d|(this.s<<(this.DB-p));
    while(i >= 0) {
      if(p < 8) {
        d = (this[i]&((1<<p)-1))<<(8-p);
        d |= this[--i]>>(p+=this.DB-8);
      }
      else {
        d = (this[i]>>(p-=8))&0xff;
        if(p <= 0) { p += this.DB; --i; }
      }
      if((d&0x80) != 0) d |= -256;
      if(k == 0 && (this.s&0x80) != (d&0x80)) ++k;
      if(k > 0 || d != this.s) r[k++] = d;
    }
  }
  return r;
}

function bnEquals(a) { return(this.compareTo(a)==0); }
function bnMin(a) { return(this.compareTo(a)<0)?this:a; }
function bnMax(a) { return(this.compareTo(a)>0)?this:a; }

// (protected) r = this op a (bitwise)
function bnpBitwiseTo(a,op,r) {
  var i, f, m = Math.min(a.t,this.t);
  for(i = 0; i < m; ++i) r[i] = op(this[i],a[i]);
  if(a.t < this.t) {
    f = a.s&this.DM;
    for(i = m; i < this.t; ++i) r[i] = op(this[i],f);
    r.t = this.t;
  }
  else {
    f = this.s&this.DM;
    for(i = m; i < a.t; ++i) r[i] = op(f,a[i]);
    r.t = a.t;
  }
  r.s = op(this.s,a.s);
  r.clamp();
}

// (public) this & a
function op_and(x,y) { return x&y; }
function bnAnd(a) { var r = nbi(); this.bitwiseTo(a,op_and,r); return r; }

// (public) this | a
function op_or(x,y) { return x|y; }
function bnOr(a) { var r = nbi(); this.bitwiseTo(a,op_or,r); return r; }

// (public) this ^ a
function op_xor(x,y) { return x^y; }
function bnXor(a) { var r = nbi(); this.bitwiseTo(a,op_xor,r); return r; }

// (public) this & ~a
function op_andnot(x,y) { return x&~y; }
function bnAndNot(a) { var r = nbi(); this.bitwiseTo(a,op_andnot,r); return r; }

// (public) ~this
function bnNot() {
  var r = nbi();
  for(var i = 0; i < this.t; ++i) r[i] = this.DM&~this[i];
  r.t = this.t;
  r.s = ~this.s;
  return r;
}

// (public) this << n
function bnShiftLeft(n) {
  var r = nbi();
  if(n < 0) this.rShiftTo(-n,r); else this.lShiftTo(n,r);
  return r;
}

// (public) this >> n
function bnShiftRight(n) {
  var r = nbi();
  if(n < 0) this.lShiftTo(-n,r); else this.rShiftTo(n,r);
  return r;
}

// return index of lowest 1-bit in x, x < 2^31
function lbit(x) {
  if(x == 0) return -1;
  var r = 0;
  if((x&0xffff) == 0) { x >>= 16; r += 16; }
  if((x&0xff) == 0) { x >>= 8; r += 8; }
  if((x&0xf) == 0) { x >>= 4; r += 4; }
  if((x&3) == 0) { x >>= 2; r += 2; }
  if((x&1) == 0) ++r;
  return r;
}

// (public) returns index of lowest 1-bit (or -1 if none)
function bnGetLowestSetBit() {
  for(var i = 0; i < this.t; ++i)
    if(this[i] != 0) return i*this.DB+lbit(this[i]);
  if(this.s < 0) return this.t*this.DB;
  return -1;
}

// return number of 1 bits in x
function cbit(x) {
  var r = 0;
  while(x != 0) { x &= x-1; ++r; }
  return r;
}

// (public) return number of set bits
function bnBitCount() {
  var r = 0, x = this.s&this.DM;
  for(var i = 0; i < this.t; ++i) r += cbit(this[i]^x);
  return r;
}

// (public) true iff nth bit is set
function bnTestBit(n) {
  var j = Math.floor(n/this.DB);
  if(j >= this.t) return(this.s!=0);
  return((this[j]&(1<<(n%this.DB)))!=0);
}

// (protected) this op (1<<n)
function bnpChangeBit(n,op) {
  var r = BigInteger.ONE.shiftLeft(n);
  this.bitwiseTo(r,op,r);
  return r;
}

// (public) this | (1<<n)
function bnSetBit(n) { return this.changeBit(n,op_or); }

// (public) this & ~(1<<n)
function bnClearBit(n) { return this.changeBit(n,op_andnot); }

// (public) this ^ (1<<n)
function bnFlipBit(n) { return this.changeBit(n,op_xor); }

// (protected) r = this + a
function bnpAddTo(a,r) {
  var i = 0, c = 0, m = Math.min(a.t,this.t);
  while(i < m) {
    c += this[i]+a[i];
    r[i++] = c&this.DM;
    c >>= this.DB;
  }
  if(a.t < this.t) {
    c += a.s;
    while(i < this.t) {
      c += this[i];
      r[i++] = c&this.DM;
      c >>= this.DB;
    }
    c += this.s;
  }
  else {
    c += this.s;
    while(i < a.t) {
      c += a[i];
      r[i++] = c&this.DM;
      c >>= this.DB;
    }
    c += a.s;
  }
  r.s = (c<0)?-1:0;
  if(c > 0) r[i++] = c;
  else if(c < -1) r[i++] = this.DV+c;
  r.t = i;
  r.clamp();
}

// (public) this + a
function bnAdd(a) { var r = nbi(); this.addTo(a,r); return r; }

// (public) this - a
function bnSubtract(a) { var r = nbi(); this.subTo(a,r); return r; }

// (public) this * a
function bnMultiply(a) { var r = nbi(); this.multiplyTo(a,r); return r; }

// (public) this^2
function bnSquare() { var r = nbi(); this.squareTo(r); return r; }

// (public) this / a
function bnDivide(a) { var r = nbi(); this.divRemTo(a,r,null); return r; }

// (public) this % a
function bnRemainder(a) { var r = nbi(); this.divRemTo(a,null,r); return r; }

// (public) [this/a,this%a]
function bnDivideAndRemainder(a) {
  var q = nbi(), r = nbi();
  this.divRemTo(a,q,r);
  return new Array(q,r);
}

// (protected) this *= n, this >= 0, 1 < n < DV
function bnpDMultiply(n) {
  this[this.t] = this.am(0,n-1,this,0,0,this.t);
  ++this.t;
  this.clamp();
}

// (protected) this += n << w words, this >= 0
function bnpDAddOffset(n,w) {
  if(n == 0) return;
  while(this.t <= w) this[this.t++] = 0;
  this[w] += n;
  while(this[w] >= this.DV) {
    this[w] -= this.DV;
    if(++w >= this.t) this[this.t++] = 0;
    ++this[w];
  }
}

// A "null" reducer
function NullExp() {}
function nNop(x) { return x; }
function nMulTo(x,y,r) { x.multiplyTo(y,r); }
function nSqrTo(x,r) { x.squareTo(r); }

NullExp.prototype.convert = nNop;
NullExp.prototype.revert = nNop;
NullExp.prototype.mulTo = nMulTo;
NullExp.prototype.sqrTo = nSqrTo;

// (public) this^e
function bnPow(e) { return this.exp(e,new NullExp()); }

// (protected) r = lower n words of "this * a", a.t <= n
// "this" should be the larger one if appropriate.
function bnpMultiplyLowerTo(a,n,r) {
  var i = Math.min(this.t+a.t,n);
  r.s = 0; // assumes a,this >= 0
  r.t = i;
  while(i > 0) r[--i] = 0;
  var j;
  for(j = r.t-this.t; i < j; ++i) r[i+this.t] = this.am(0,a[i],r,i,0,this.t);
  for(j = Math.min(a.t,n); i < j; ++i) this.am(0,a[i],r,i,0,n-i);
  r.clamp();
}

// (protected) r = "this * a" without lower n words, n > 0
// "this" should be the larger one if appropriate.
function bnpMultiplyUpperTo(a,n,r) {
  --n;
  var i = r.t = this.t+a.t-n;
  r.s = 0; // assumes a,this >= 0
  while(--i >= 0) r[i] = 0;
  for(i = Math.max(n-this.t,0); i < a.t; ++i)
    r[this.t+i-n] = this.am(n-i,a[i],r,0,0,this.t+i-n);
  r.clamp();
  r.drShiftTo(1,r);
}

// Barrett modular reduction
function Barrett(m) {
  // setup Barrett
  this.r2 = nbi();
  this.q3 = nbi();
  BigInteger.ONE.dlShiftTo(2*m.t,this.r2);
  this.mu = this.r2.divide(m);
  this.m = m;
}

function barrettConvert(x) {
  if(x.s < 0 || x.t > 2*this.m.t) return x.mod(this.m);
  else if(x.compareTo(this.m) < 0) return x;
  else { var r = nbi(); x.copyTo(r); this.reduce(r); return r; }
}

function barrettRevert(x) { return x; }

// x = x mod m (HAC 14.42)
function barrettReduce(x) {
  x.drShiftTo(this.m.t-1,this.r2);
  if(x.t > this.m.t+1) { x.t = this.m.t+1; x.clamp(); }
  this.mu.multiplyUpperTo(this.r2,this.m.t+1,this.q3);
  this.m.multiplyLowerTo(this.q3,this.m.t+1,this.r2);
  while(x.compareTo(this.r2) < 0) x.dAddOffset(1,this.m.t+1);
  x.subTo(this.r2,x);
  while(x.compareTo(this.m) >= 0) x.subTo(this.m,x);
}

// r = x^2 mod m; x != r
function barrettSqrTo(x,r) { x.squareTo(r); this.reduce(r); }

// r = x*y mod m; x,y != r
function barrettMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }

Barrett.prototype.convert = barrettConvert;
Barrett.prototype.revert = barrettRevert;
Barrett.prototype.reduce = barrettReduce;
Barrett.prototype.mulTo = barrettMulTo;
Barrett.prototype.sqrTo = barrettSqrTo;

// (public) this^e % m (HAC 14.85)
function bnModPow(e,m) {
  var i = e.bitLength(), k, r = nbv(1), z;
  if(i <= 0) return r;
  else if(i < 18) k = 1;
  else if(i < 48) k = 3;
  else if(i < 144) k = 4;
  else if(i < 768) k = 5;
  else k = 6;
  if(i < 8)
    z = new Classic(m);
  else if(m.isEven())
    z = new Barrett(m);
  else
    z = new Montgomery(m);

  // precomputation
  var g = new Array(), n = 3, k1 = k-1, km = (1<<k)-1;
  g[1] = z.convert(this);
  if(k > 1) {
    var g2 = nbi();
    z.sqrTo(g[1],g2);
    while(n <= km) {
      g[n] = nbi();
      z.mulTo(g2,g[n-2],g[n]);
      n += 2;
    }
  }

  var j = e.t-1, w, is1 = true, r2 = nbi(), t;
  i = nbits(e[j])-1;
  while(j >= 0) {
    if(i >= k1) w = (e[j]>>(i-k1))&km;
    else {
      w = (e[j]&((1<<(i+1))-1))<<(k1-i);
      if(j > 0) w |= e[j-1]>>(this.DB+i-k1);
    }

    n = k;
    while((w&1) == 0) { w >>= 1; --n; }
    if((i -= n) < 0) { i += this.DB; --j; }
    if(is1) {	// ret == 1, don't bother squaring or multiplying it
      g[w].copyTo(r);
      is1 = false;
    }
    else {
      while(n > 1) { z.sqrTo(r,r2); z.sqrTo(r2,r); n -= 2; }
      if(n > 0) z.sqrTo(r,r2); else { t = r; r = r2; r2 = t; }
      z.mulTo(r2,g[w],r);
    }

    while(j >= 0 && (e[j]&(1<<i)) == 0) {
      z.sqrTo(r,r2); t = r; r = r2; r2 = t;
      if(--i < 0) { i = this.DB-1; --j; }
    }
  }
  return z.revert(r);
}

// (public) gcd(this,a) (HAC 14.54)
function bnGCD(a) {
  var x = (this.s<0)?this.negate():this.clone();
  var y = (a.s<0)?a.negate():a.clone();
  if(x.compareTo(y) < 0) { var t = x; x = y; y = t; }
  var i = x.getLowestSetBit(), g = y.getLowestSetBit();
  if(g < 0) return x;
  if(i < g) g = i;
  if(g > 0) {
    x.rShiftTo(g,x);
    y.rShiftTo(g,y);
  }
  while(x.signum() > 0) {
    if((i = x.getLowestSetBit()) > 0) x.rShiftTo(i,x);
    if((i = y.getLowestSetBit()) > 0) y.rShiftTo(i,y);
    if(x.compareTo(y) >= 0) {
      x.subTo(y,x);
      x.rShiftTo(1,x);
    }
    else {
      y.subTo(x,y);
      y.rShiftTo(1,y);
    }
  }
  if(g > 0) y.lShiftTo(g,y);
  return y;
}

// (protected) this % n, n < 2^26
function bnpModInt(n) {
  if(n <= 0) return 0;
  var d = this.DV%n, r = (this.s<0)?n-1:0;
  if(this.t > 0)
    if(d == 0) r = this[0]%n;
    else for(var i = this.t-1; i >= 0; --i) r = (d*r+this[i])%n;
  return r;
}

// (public) 1/this % m (HAC 14.61)
function bnModInverse(m) {
  var ac = m.isEven();
  if((this.isEven() && ac) || m.signum() == 0) return BigInteger.ZERO;
  var u = m.clone(), v = this.clone();
  var a = nbv(1), b = nbv(0), c = nbv(0), d = nbv(1);
  while(u.signum() != 0) {
    while(u.isEven()) {
      u.rShiftTo(1,u);
      if(ac) {
        if(!a.isEven() || !b.isEven()) { a.addTo(this,a); b.subTo(m,b); }
        a.rShiftTo(1,a);
      }
      else if(!b.isEven()) b.subTo(m,b);
      b.rShiftTo(1,b);
    }
    while(v.isEven()) {
      v.rShiftTo(1,v);
      if(ac) {
        if(!c.isEven() || !d.isEven()) { c.addTo(this,c); d.subTo(m,d); }
        c.rShiftTo(1,c);
      }
      else if(!d.isEven()) d.subTo(m,d);
      d.rShiftTo(1,d);
    }
    if(u.compareTo(v) >= 0) {
      u.subTo(v,u);
      if(ac) a.subTo(c,a);
      b.subTo(d,b);
    }
    else {
      v.subTo(u,v);
      if(ac) c.subTo(a,c);
      d.subTo(b,d);
    }
  }
  if(v.compareTo(BigInteger.ONE) != 0) return BigInteger.ZERO;
  if(d.compareTo(m) >= 0) return d.subtract(m);
  if(d.signum() < 0) d.addTo(m,d); else return d;
  if(d.signum() < 0) return d.add(m); else return d;
}

var lowprimes = [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109,113,127,131,137,139,149,151,157,163,167,173,179,181,191,193,197,199,211,223,227,229,233,239,241,251,257,263,269,271,277,281,283,293,307,311,313,317,331,337,347,349,353,359,367,373,379,383,389,397,401,409,419,421,431,433,439,443,449,457,461,463,467,479,487,491,499,503,509,521,523,541,547,557,563,569,571,577,587,593,599,601,607,613,617,619,631,641,643,647,653,659,661,673,677,683,691,701,709,719,727,733,739,743,751,757,761,769,773,787,797,809,811,821,823,827,829,839,853,857,859,863,877,881,883,887,907,911,919,929,937,941,947,953,967,971,977,983,991,997];
var lplim = (1<<26)/lowprimes[lowprimes.length-1];

// (public) test primality with certainty >= 1-.5^t
function bnIsProbablePrime(t) {
  var i, x = this.abs();
  if(x.t == 1 && x[0] <= lowprimes[lowprimes.length-1]) {
    for(i = 0; i < lowprimes.length; ++i)
      if(x[0] == lowprimes[i]) return true;
    return false;
  }
  if(x.isEven()) return false;
  i = 1;
  while(i < lowprimes.length) {
    var m = lowprimes[i], j = i+1;
    while(j < lowprimes.length && m < lplim) m *= lowprimes[j++];
    m = x.modInt(m);
    while(i < j) if(m%lowprimes[i++] == 0) return false;
  }
  return x.millerRabin(t);
}

// (protected) true if probably prime (HAC 4.24, Miller-Rabin)
function bnpMillerRabin(t) {
  var n1 = this.subtract(BigInteger.ONE);
  var k = n1.getLowestSetBit();
  if(k <= 0) return false;
  var r = n1.shiftRight(k);
  t = (t+1)>>1;
  if(t > lowprimes.length) t = lowprimes.length;
  var a = nbi();
  for(var i = 0; i < t; ++i) {
    //Pick bases at random, instead of starting at 2
    a.fromInt(lowprimes[Math.floor(Math.random()*lowprimes.length)]);
    var y = a.modPow(r,this);
    if(y.compareTo(BigInteger.ONE) != 0 && y.compareTo(n1) != 0) {
      var j = 1;
      while(j++ < k && y.compareTo(n1) != 0) {
        y = y.modPowInt(2,this);
        if(y.compareTo(BigInteger.ONE) == 0) return false;
      }
      if(y.compareTo(n1) != 0) return false;
    }
  }
  return true;
}

// protected
BigInteger.prototype.chunkSize = bnpChunkSize;
BigInteger.prototype.toRadix = bnpToRadix;
BigInteger.prototype.fromRadix = bnpFromRadix;
BigInteger.prototype.fromNumber = bnpFromNumber;
BigInteger.prototype.bitwiseTo = bnpBitwiseTo;
BigInteger.prototype.changeBit = bnpChangeBit;
BigInteger.prototype.addTo = bnpAddTo;
BigInteger.prototype.dMultiply = bnpDMultiply;
BigInteger.prototype.dAddOffset = bnpDAddOffset;
BigInteger.prototype.multiplyLowerTo = bnpMultiplyLowerTo;
BigInteger.prototype.multiplyUpperTo = bnpMultiplyUpperTo;
BigInteger.prototype.modInt = bnpModInt;
BigInteger.prototype.millerRabin = bnpMillerRabin;

// public
BigInteger.prototype.clone = bnClone;
BigInteger.prototype.intValue = bnIntValue;
BigInteger.prototype.byteValue = bnByteValue;
BigInteger.prototype.shortValue = bnShortValue;
BigInteger.prototype.signum = bnSigNum;
BigInteger.prototype.toByteArray = bnToByteArray;
BigInteger.prototype.equals = bnEquals;
BigInteger.prototype.min = bnMin;
BigInteger.prototype.max = bnMax;
BigInteger.prototype.and = bnAnd;
BigInteger.prototype.or = bnOr;
BigInteger.prototype.xor = bnXor;
BigInteger.prototype.andNot = bnAndNot;
BigInteger.prototype.not = bnNot;
BigInteger.prototype.shiftLeft = bnShiftLeft;
BigInteger.prototype.shiftRight = bnShiftRight;
BigInteger.prototype.getLowestSetBit = bnGetLowestSetBit;
BigInteger.prototype.bitCount = bnBitCount;
BigInteger.prototype.testBit = bnTestBit;
BigInteger.prototype.setBit = bnSetBit;
BigInteger.prototype.clearBit = bnClearBit;
BigInteger.prototype.flipBit = bnFlipBit;
BigInteger.prototype.add = bnAdd;
BigInteger.prototype.subtract = bnSubtract;
BigInteger.prototype.multiply = bnMultiply;
BigInteger.prototype.divide = bnDivide;
BigInteger.prototype.remainder = bnRemainder;
BigInteger.prototype.divideAndRemainder = bnDivideAndRemainder;
BigInteger.prototype.modPow = bnModPow;
BigInteger.prototype.modInverse = bnModInverse;
BigInteger.prototype.pow = bnPow;
BigInteger.prototype.gcd = bnGCD;
BigInteger.prototype.isProbablePrime = bnIsProbablePrime;

// JSBN-specific extension
BigInteger.prototype.square = bnSquare;

// BigInteger interfaces not implemented in jsbn:

// BigInteger(int signum, byte[] magnitude)
// double doubleValue()
// float floatValue()
// int hashCode()
// long longValue()
// static BigInteger valueOf(long val)


/* SOURCE: libs/contacts.js */
/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */



var contacts = (function() {
  function forEach(callback) {
    var sender = DumbPipe.open("contacts", {}, function(message) {
      if (message) {
        callback(message);
      } else {
        DumbPipe.close(sender);
      }
    });
  }

  function getAll(callback) {
    var contacts = [];
    var sender = DumbPipe.open("contacts", {}, function(contact) {
      if (!contact) {
        callback(contacts);
        DumbPipe.close(sender);
        return;
      }

      contacts.push(contact);
    });
  }

  var requestHandler = null;
  function getNext(callback) {
    if (requestHandler) {
      callback(requestHandler());
      return;
    }

    getAll(function(contacts) {
      var idx = -1;

      requestHandler = function() {
        idx++;

        if (idx < contacts.length) {
          return contacts[idx];
        }

        requestHandler = null;

        return null;
      }

      callback(requestHandler());
    });
  }

  return {
    forEach: forEach,
    getNext: getNext,
  };
})();


/* SOURCE: libs/pipe.js */
/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

var DumbPipe = {
  recipients: {},
  nextPipeID: 0,

  open: function(type, message, recipient) {
    var pipeID = this.nextPipeID++;

    this.send({
      command: "open",
      type: type,
      pipeID: pipeID,
      message: message,
    });

    this.recipients[pipeID] = recipient;

    // Return a function that can be used to send a message to the other side.
    var sender = function(message) {
      var envelope = {
        command: "message",
        pipeID: pipeID,
        message: message,
      };
      //console.log("inner send: " + JSON.stringify(envelope));
      this.send(envelope);
    }.bind(this);

    sender.pipeID = pipeID;

    return sender;
  },

  close: function(sender) {
    delete this.recipients[sender.pipeID];

    this.send({
      command: "close",
      pipeID: sender.pipeID,
    });
  },

  sendQueue: [],
  isRunningSendQueue: false,

  send: function(envelope) {
    this.sendQueue.push(envelope);

    if (!this.isRunningSendQueue) {
      this.isRunningSendQueue = true;
      window.nextTickBeforeEvents(this.runSendQueue.bind(this));
    }
  },

  runSendQueue: function() {
    alert(JSON.stringify(this.sendQueue.shift()));

    if (this.sendQueue.length > 0) {
      window.nextTickBeforeEvents(this.runSendQueue.bind(this));
    } else {
      this.isRunningSendQueue = false;
    }
  },

  receiveMessage: function(event) {
    var envelope = event.data;

    if (typeof envelope !== "object" || !("pipeID" in envelope)) {
      return;
    }

    if (this.recipients[envelope.pipeID]) {
      try {
        this.recipients[envelope.pipeID](envelope.message);
      } catch(ex) {
        console.error(ex + "\n" + ex.stack);
      }
    } else {
      console.warn("nonexistent pipe " + envelope.pipeID + " received message " +
                   JSON.stringify(envelope.message));
    }
  },
};

window.addEventListener("message", DumbPipe.receiveMessage.bind(DumbPipe), false);

// If "mozbrowser" isn't enabled on the frame we're loaded in, then override
// the alert/prompt functions to funnel messages to the endpoint in the parent.
if (window.parent !== window) {
  alert = function(message) {
    window.parent.DumbPipe.handleEvent({
      detail: {
        promptType: "alert",
        message: message,
      }
    });
  };

  prompt = function(message) {
    var event = {
      detail: {
        promptType: "prompt",
        message: message,
        unblock: function() {},
      }
    };
    window.parent.DumbPipe.handleEvent(event);
    return event.detail.returnValue;
  };
}


/* SOURCE: libs/contact2vcard.js */
/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- /
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */



/**
 * ContactToVcard provides the functionality necessary to export from
 * MozContacts to vCard 3.0 (https://www.ietf.org/rfc/rfc2426.txt). The reason
 * to choose the 3.0 standard instead of the 4.0 one is that some systems
 * most notoriously Android 4.x don't seem to be able to import vCard 4.0.
 */
var contact2vcard = (function() {
  /** Mapping between contact fields and equivalent vCard fields */
  var VCARD_MAP = {
    'fax' : 'FAX',
    'faxoffice' : 'FAX,WORK',
    'faxhome' : 'FAX,HOME',
    'faxother' : 'FAX',
    'home' : 'HOME',
    'mobile' : 'CELL',
    'pager' : 'PAGER',
    'personal' : 'HOME',
    'pref' : 'PREF',
    'text' : 'TEXT',
    'textphone' : 'TEXTPHONE',
    'voice' : 'VOICE',
    'work' : 'WORK'
  };

  var CRLF = '\r\n';

  /** Field list to be skipped when converting to vCard */
  var VCARD_SKIP_FIELD = ['fb_profile_photo'];
  var VCARD_VERSION = '3.0';
  var HEADER = 'BEGIN:VCARD' + CRLF + 'VERSION:' + VCARD_VERSION + CRLF;
  var FOOTER = 'END:VCARD' + CRLF;

  function blobToBase64(blob, cb) {
    var reader = new FileReader();

    reader.onload = function() {
      var dataUrl = reader.result;
      var base64 = dataUrl.split(',')[1];
      cb(base64);
    };

    reader.readAsDataURL(blob);
  }

  function ISODateString(d) {
    if (typeof d === 'string') {
      d = new Date(d);
    }

    var str = d.toISOString();

    // Remove the milliseconds field
    return str.slice(0, str.indexOf('.')) + 'Z';
  }

  /**
   * Given an array with contact fields (usually containing only one field),
   * returns the equivalent vcard field
   *
   * @param {Array} sourceField source field from a MozContact
   * @param {String} vcardField vCard field name
   * @return {Array} Array of vCard string entries
   */
  function fromContactField(sourceField, vcardField) {
    if (!sourceField || !sourceField.length) {
      return [];
    }

    // Goes to the entries in the given field (usually only one but potentially
    // more) and transforms them into string-based, vCard ones.
    return sourceField.map(function(field) {
      var str = vcardField;
      /**
       * If the field doesn't have an equivalent in vcard standard.
       * Incompatible fields are stored in `VCARD_SKIP_FIELD`.
       *
       * @type {boolean}
       */
      var skipField = false;
      var types = [];

      // Checks existing types and converts them to vcard types if necessary
      // and fill `types` array with the final types.
      if (Array.isArray(field.type)) {
        var fieldType = field.type.map(function(aType) {
          var out = '';
          if (aType) {
            aType = aType.trim().toLowerCase();
            if (VCARD_SKIP_FIELD.indexOf(aType) !== -1) {
              skipField = true;
            }
            out = VCARD_MAP[aType] || aType;
          }
          return out;
        });

        types = types.concat(fieldType);
      }

      if (skipField) {
        return;
      }

      if (field.pref && field.pref === true) {
        types.push('PREF');
      }

      if (types.length) {
        str += ';TYPE=' + types.join(',');
      }

      return str + ':' + (field.value || '');
    });
  }

  function fromStringArray(sourceField, vcardField) {
    if (!sourceField) {
      return '';
    }

    return vcardField + ':' + sourceField.join(',');
  }

  function joinFields(fields) {
    return fields.filter(function(f) { return !!f; }).join(CRLF);
  }

  function toBlob(vcard) {
    return new Blob([vcard], {'type': 'text/vcard'});
  }

  /**
   * Convenience function that converts an array of contacts into a text/vcard
   * blob. The blob is passed to the callback once the conversion is done.
   *
   * @param {Array} contacts An array of mozContact objects.
   * @param {Function} callback A function invoked with the generated blob.
   */
  function ContactToVcardBlob(contacts, callback) {
    if (typeof callback !== 'function') {
      throw Error('callback() is undefined or not a function');
    }

    var str = '';

    ContactToVcard(contacts, function append(vcards, nCards) {
      str += vcards;
    }, function success() {
      callback(str ? toBlob(str) : null);
    });
  }

  /**
   * Converts an array of contacts to a string of vCards. The conversion is
   * done in batches. For every batch the append callback is invoked with a
   * string of vCards and the number of contacts in the batch. Once all
   * contacts have been processed the success callback is invoked.
   *
   * @param {Array} contacts An array of mozContact objects.
   * @param {Function} append A function taking two parameters, the first one
   *        will be passed a string of vCards and the second an integer
   *        representing the number of contacts in the string.
   * @param {Function} success A function with no parameters that will be
   *        invoked once all the contacts have been processed.
   * @param {Number} batchSize An optional parameter specifying the maximum
   *        number of characters that should be added to the output string
   *        before invoking the append callback. If this parameter is not
   *        provided a default value of 1MiB will be used instead.
   */
  function ContactToVcard(contacts, append, success, batchSize, skipPhoto) {
    var vCardsString = '';
    var nextIndex = 0;
    var cardsInBatch = 0;

    batchSize = batchSize || (1024 * 1024);

    if (typeof append !== 'function') {
      throw Error('append() is undefined or not a function');
    }

    if (typeof success !== 'function') {
      throw Error('append() is undefined or not a function');
    }

    /**
     * Append the vCard obtained by converting the contact to the string of
     * vCards and if necessary pass the string to the user-specified callback
     * function. If we're not done processing all the contacts start processing
     * the following one.
     *
     * @param {String} vcard The string obtained from the previously processed
     *        contact.
     */
    function appendVCard(vcard) {
      if (vcard.length > 0) {
        vCardsString += HEADER + vcard + CRLF + FOOTER;
      }

      nextIndex++;
      cardsInBatch++;

      /* Invoke the user-provided callback if we've filled the current batch or
       * if we don't have more contacts to process. */
      if ((vCardsString.length > batchSize) ||
          (nextIndex === contacts.length)) {
        append(vCardsString, cardsInBatch);
        cardsInBatch = 0;
        vCardsString = '';
      }

      if (nextIndex < contacts.length) {
        processContact(contacts[nextIndex]);
      } else {
        success();
      }
    }

    /**
     * Process a contact and invokes appendVCard with the resulting vCard
     * string.
     *
     * @param {Object} contacts A mozContact object.
     */
    function processContact(ct) {
      if (navigator.mozContact && !(ct instanceof navigator.mozContact)) {
        console.error('An instance of mozContact was expected');
        nextTickBeforeEvents(function() { appendVCard(''); });
        return;
      }

      /*
       * N TYPE
       * The structured type value corresponds, in
       * sequence, to the Family Name, Given Name, Additional Names, Honorific
       * Prefixes, and Honorific Suffixes. The text components are separated
       * by the SEMI-COLON character (ASCII decimal 59). Individual text
       * components can include multiple text values (e.g., multiple
       * Additional Names) separated by the COMMA character (ASCII decimal
       * 44). This type is based on the semantics of the X.520 individual name
       * attributes. The property MUST be present in the vCard object.
       **/
      var n = 'n:' + ([
        ct.familyName,
        ct.givenName,
        ct.additionalName,
        ct.honorificPrefix,
        ct.honorificSuffix
      ].map(function(f) {
        f = f || [''];
        return f.join(',') + ';';
      }).join(''));

      // vCard standard does not accept contacts without 'n' or 'fn' fields.
      if (n === 'n:;;;;;' || !ct.name) {
        nextTickBeforeEvents(function() { appendVCard(''); });
        return;
      }

      var allFields = [
        n,
        fromStringArray(ct.name, 'FN'),
        fromStringArray(ct.nickname, 'NICKNAME'),
        fromStringArray(ct.category, 'CATEGORY'),
        fromStringArray(ct.org, 'ORG'),
        fromStringArray(ct.jobTitle, 'TITLE'),
        fromStringArray(ct.note, 'NOTE'),
        fromStringArray(ct.key, 'KEY')
      ];

      if (ct.bday) {
        allFields.push('BDAY:' + ISODateString(ct.bday));
      }
      if (ct.anniversary) {
        allFields.push('ANNIVERSARY:' + ISODateString(ct.anniversary));
      }

      allFields.push('UID:' + ct.id.toString().substr(0,30));

      allFields.push.apply(allFields, fromContactField(ct.email, 'EMAIL'));
      allFields.push.apply(allFields, fromContactField(ct.url, 'URL'));
      allFields.push.apply(allFields, fromContactField(ct.tel, 'TEL'));

      var adrs = fromContactField(ct.adr, 'ADR');
      allFields.push.apply(allFields, adrs.map(function(adrStr, i) {
        var orig = ct.adr[i];
        return adrStr + ([
          '',
          '',
          orig.streetAddress || '', orig.locality || '', orig.region || '',
          orig.postalCode || '', orig.countryName || ''].join(';'));
      }));

      /**
       * PHOTO TYPE
       * The encoding MUST be reset to "b" using the ENCODING
       * parameter in order to specify inline, encoded binary data. If the
       * value is referenced by a URI value, then the default encoding of 8bit
       * is used and no explicit ENCODING parameter is needed.

       * Type value: A single value. The default is binary value. It can also
       * be reset to uri value. The uri value can be used to specify a value
       * outside of this MIME entity.

       * Type special notes: The type can include the type parameter "TYPE" to
       * specify the graphic image format type. The TYPE parameter values MUST
       * be one of the IANA registered image formats or a non-standard image
       * format.
      */
      if ((typeof skipPhoto == 'undefined' || skipPhoto === false) &&
          ct.photo && ct.photo.length) {
        var photoMeta = ['PHOTO', 'ENCODING=b'];
        var blob = ct.photo[0];

        blobToBase64(blob, function(b64) {
          if (blob.type) {
            photoMeta.push('TYPE=' + blob.type);
          }
          allFields.push(photoMeta.join(';') + ':' + b64);
          appendVCard(joinFields(allFields));
        });
      } else {
        nextTickBeforeEvents(function() { appendVCard(joinFields(allFields)); });
      }
    }

    processContact(contacts[0]);
  }

  return {
    ContactToVcard: ContactToVcard,
    ContactToVcardBlob: ContactToVcardBlob,
  };
})();


/* SOURCE: libs/emoji.js */
/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- /
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */



var emoji = (function() {
  // http://www.unicode.org/Public/UNIDATA/EmojiSources.txt
  // http://developer.nokia.com/resources/library/Java/developers-guides/data-handling/emoji.html
  var regexString = [
    '\ud83c[\udf00-\udfff]', // U+1F300 to U+1F3FF
    '\ud83d[\udc00-\ude4f]', // U+1F400 to U+1F64F
    '\ud83d[\ude80-\udeff]', // U+1F680 to U+1F6FF
    '[\u0023|\u0030-\u0039]\u20e3', // U+2320E3 to U+3920E3
    '\ud83c\uddef\ud83c\uddf5', // U+1F1EF U+1F1F5 (JP)
    '\ud83c\uddf0\ud83c\uddf7', // U+1F1F0 U+1F1F7 (KR)
    '\ud83c\udde9\ud83c\uddea', // U+1F1E9 U+1F1EA (DE)
    '\ud83c\udde8\ud83c\uddf3', // U+1F1E8 U+1F1F3 (CN)
    '\ud83c\uddfa\ud83c\uddf8', // U+1F1FA U+1F1F8 (US)
    '\ud83c\uddeb\ud83c\uddf7', // U+1F1EB U+1F1F7 (FR)
    '\ud83c\uddea\ud83c\uddf8', // U+1F1EA U+1F1F8 (ES)
    '\ud83c\uddee\ud83c\uddf9', // U+1F1EE U+1F1F9 (IT)
    '\ud83c\uddf7\ud83c\uddfa', // U+1F1F7 U+1F1FA (RU)
    '\ud83c\uddec\ud83c\udde7', // U+1F1EC U+1F1E7 (GB)
    '\ud83c\uddee\ud83c\uddf3', // U+1F1EE U+1F1F3 (IN)
    '\ud83c\uddf2\ud83c\uddfd', // U+1F1F2 U+1F1FD (MX)
    '\ud83c\udde7\ud83c\uddf7', // U+1F1E7 U+1F1F7 (BR)
    '\ud83c\uddf8\ud83c\udde6', // U+1F1F8 U+1F1E6 (SA)
    '\ud83c\uddff\ud83c\udde6', // U+1F1FF U+1F1E6 (ZA)
    '\ud83c\udde6\ud83c\uddf7', // U+1F1E6 U+1F1F7 (AR)
    '\ud83c\uddf3\ud83c\uddf1', // U+1F1F3 U+1F1F1 (NL)
    '\ud83c\uddf9\ud83c\uddf7', // U+1F1F9 U+1F1F7 (TR)
    '\ud83c\uddf2\ud83c\uddfe', // U+1F1F2 U+1F1FE (MY)
    '\ud83c\uddfb\ud83c\uddea', // U+1F1FB U+1F1EA (VE)
    '\ud83c\udde8\ud83c\uddf4', // U+1F1E8 U+1F1F4 (CO)
    '\ud83c\udde8\ud83c\uddf1', // U+1F1E8 U+1F1F1 (CL)
    '\ud83c\udded\ud83c\uddf0', // U+1F1ED U+1F1F0 (HK)
    '\ud83c\uddf3\ud83c\uddec', // U+1F1F3 U+1F1EC (NG)
    '\ud83c\udde8\ud83c\udded', // U+1F1E8 U+1F1ED (CH)
    '\ud83c\uddee\ud83c\uddf1', // U+1F1EE U+1F1F1 (IL)
    '\ud83c\uddf9\ud83c\udded', // U+1F1F9 U+1F1ED (TH)
    '\ud83c\uddf8\ud83c\uddec', // U+1F1F8 U+1F1EC (SG)
    '\ud83c\udde6\ud83c\uddea', // U+1F1E6 U+1F1EA (AE)
    '\ud83c\uddf9\ud83c\uddfc', // U+1F1F9 U+1F1FC (TW)
    '\ud83c\uddea\ud83c\uddec', // U+1F1EA U+1F1EC (EG)
    '\ud83c\udde8\ud83c\udde6', // U+1F1E8 U+1F1E6 (CA)
    '\ud83c\uddf2\ud83c\udde8', // U+1F1F2 U+1F1E8 (MC)
    '\ud83c\udde6\ud83c\uddf9', // U+1F1E6 U+1F1F9 (AT)
    '\ud83c\udde6\ud83c\uddfa', // U+1F1E6 U+1F1FA (AU)
    '\ud83c\udde7\ud83c\udde6', // U+1F1E7 U+1F1E6 (BA)
    '\ud83c\udde7\ud83c\uddea', // U+1F1E7 U+1F1EA (BE)
    '\ud83c\udde8\ud83c\uddee', // U+1F1E8 U+1F1EE (CI)
    '\ud83c\udde8\ud83c\uddf2', // U+1F1E8 U+1F1F2 (CM)
    '\ud83c\udde8\ud83c\uddf7', // U+1F1E8 U+1F1F7 (CR)
    '\ud83c\udde9\ud83c\uddff', // U+1F1E9 U+1F1FF (DZ)
    '\ud83c\uddea\ud83c\udde8', // U+1F1EA U+1F1E8 (EC)
    '\ud83c\uddec\ud83c\udded', // U+1F1EC U+1F1ED (GH)
    '\ud83c\uddec\ud83c\uddf7', // U+1F1EC U+1F1F7 (GR)
    '\ud83c\udded\ud83c\uddf3', // U+1F1ED U+1F1F3 (HN)
    '\ud83c\udded\ud83c\uddf7', // U+1F1ED U+1F1F7 (HR)
    '\ud83c\uddee\ud83c\uddf7', // U+1F1EE U+1F1F7 (IR)
    '\ud83c\uddef\ud83c\uddf4', // U+1F1EF U+1F1F4 (JO)
    '\ud83c\uddf0\ud83c\uddff', // U+1F1F0 U+1F1FF (KZ)
    '\ud83c\uddf1\ud83c\udde7', // U+1F1F1 U+1F1E7 (LB)
    '\ud83c\uddf5\ud83c\uddea', // U+1F1F5 U+1F1EA (PE)
    '\ud83c\uddf5\ud83c\uddf9', // U+1F1F5 U+1F1F9 (PT)
    '\ud83c\uddf8\ud83c\uddfe', // U+1F1F8 U+1F1FE (SY)
    '\ud83c\uddfa\ud83c\udde6', // U+1F1FA U+1F1E6 (UA)
    '\ud83c\uddfa\ud83c\uddfe', // U+1F1FA U+1F1FE (UY)
    '\ud83c\uddfd\ud83c\uddea', // U+1F1FD U+1F1EA (XE)
    '\u00a9',
    '\u00ae',
    '\u2122',
    '\u2139',
    '\u2194',
    '\u2195',
    '\u2196',
    '\u2197',
    '\u2198',
    '\u2199',
    '\u21A9',
    '\u21AA',
    '\u231A',
    '\u231B',
    '\u23E9',
    '\u23EA',
    '\u23EB',
    '\u23EC',
    '\u23F0',
    '\u23F3',
    '\u24C2',
    '\u25AA',
    '\u25AB',
    '\u25B6',
    '\u25C0',
    '\u25FB',
    '\u25FC',
    '\u25FD',
    '\u25FE',
    '\u2600',
    '\u2601',
    '\u260E',
    '\u2611',
    '\u2614',
    '\u2615',
    '\u261D',
    '\u2648',
    '\u2649',
    '\u264A',
    '\u264B',
    '\u264C',
    '\u264D',
    '\u264E',
    '\u264F',
    '\u2650',
    '\u2651',
    '\u2652',
    '\u2653',
    '\u2660',
    '\u2663',
    '\u2665',
    '\u2666',
    '\u2668',
    '\u267B',
    '\u267F',
    '\u2693',
    '\u26A0',
    '\u26A1',
    '\u26AA',
    '\u26AB',
    '\u26BD',
    '\u26BE',
    '\u26C4',
    '\u26C5',
    '\u26CE',
    '\u26D4',
    '\u26EA',
    '\u26FA',
    '\u26F2',
    '\u26F3',
    '\u26F5',
    '\u26FD',
    '\u2702',
    '\u2705',
    '\u2708',
    '\u2709',
    '\u270A',
    '\u270B',
    '\u270C',
    '\u270F',
    '\u2712',
    '\u2714',
    '\u2716',
    '\u2728',
    '\u2733',
    '\u2734',
    '\u2744',
    '\u2747',
    '\u274C',
    '\u274E',
    '\u2753',
    '\u2754',
    '\u2755',
    '\u2757',
    '\u2764',
    '\u2795',
    '\u2796',
    '\u2797',
    '\u27A1',
    '\u27B0',
    '\u27BF',
    '\u2934',
    '\u2935',
    '\u2B05',
    '\u2B06',
    '\u2B07',
    '\u2B1B',
    '\u2B1C',
    '\u2B50',
    '\u2B55',
    '\u3030',
    '\u303D',
    '\u3297',
    '\u3299',
    '\ud83c\udd70', // U+1F170
    '\ud83c\udd71', // U+1F171
    '\ud83c\udd7E', // U+1F17E
    '\ud83c\udd7F', // U+1F17F
    '\ud83c\udd8E', // U+1F18E
    '\ud83c\udd91', // U+1F191
    '\ud83c\udd92', // U+1F192
    '\ud83c\udd93', // U+1F193
    '\ud83c\udd94', // U+1F194
    '\ud83c\udd95', // U+1F195
    '\ud83c\udd96', // U+1F196
    '\ud83c\udd97', // U+1F197
    '\ud83c\udd98', // U+1F198
    '\ud83c\udd99', // U+1F199
    '\ud83c\udd9A', // U+1F19A
    '\ud83c\udE01', // U+1F201
    '\ud83c\udE02', // U+1F202
    '\ud83c\udE1A', // U+1F21A
    '\ud83c\udE2F', // U+1F22F
    '\ud83c\udE32', // U+1F232
    '\ud83c\udE33', // U+1F233
    '\ud83c\udE34', // U+1F234
    '\ud83c\udE35', // U+1F235
    '\ud83c\udE36', // U+1F236
    '\ud83c\udE37', // U+1F237
    '\ud83c\udE38', // U+1F238
    '\ud83c\udE39', // U+1F239
    '\ud83c\udE3A', // U+1F23A
    '\ud83c\udE50', // U+1F250
    '\ud83c\udE51', // U+1F251
  ].join("|");

  var data = {
    "1f466": { "sheet": 0, "x": 0 },
    "1f467": { "sheet": 0, "x": 1 },
    "1f48b": { "sheet": 0, "x": 2 },
    "1f468": { "sheet": 0, "x": 3 },
    "1f469": { "sheet": 0, "x": 4 },
    "1f455": { "sheet": 0, "x": 5 },
    "1f45f": { "sheet": 0, "x": 6 },
    "1f4f7": { "sheet": 0, "x": 7 },
    "260e": { "sheet": 0, "x": 8 },
    "1f4f1": { "sheet": 0, "x": 9 },
    "1f4e0": { "sheet": 0, "x": 10 },
    "1f4bb": { "sheet": 0, "x": 11 },
    "1f44a": { "sheet": 0, "x": 12 },
    "1f44d": { "sheet": 0, "x": 13 },
    "261d": { "sheet": 0, "x": 14 },
    "270a": { "sheet": 0, "x": 15 },
    "270c": { "sheet": 0, "x": 16 },
    "270b": { "sheet": 0, "x": 17 },
    "1f3bf": { "sheet": 0, "x": 18 },
    "26f3": { "sheet": 0, "x": 19 },
    "1f3be": { "sheet": 0, "x": 20 },
    "26be": { "sheet": 0, "x": 21 },
    "1f3c4": { "sheet": 0, "x": 22 },
    "26bd": { "sheet": 0, "x": 23 },
    "1f41f": { "sheet": 0, "x": 24 },
    "1f434": { "sheet": 0, "x": 25 },
    "1f697": { "sheet": 0, "x": 26 },
    "26f5": { "sheet": 0, "x": 27 },
    "2708": { "sheet": 0, "x": 28 },
    "1f683": { "sheet": 0, "x": 29 },
    "1f685": { "sheet": 0, "x": 30 },
    "2753": { "sheet": 0, "x": 31 },
    "2757": { "sheet": 0, "x": 32 },
    "2764": { "sheet": 0, "x": 33 },
    "1f494": { "sheet": 0, "x": 34 },
    "1f550": { "sheet": 0, "x": 35 },
    "1f551": { "sheet": 0, "x": 36 },
    "1f552": { "sheet": 0, "x": 37 },
    "1f553": { "sheet": 0, "x": 38 },
    "1f554": { "sheet": 0, "x": 39 },
    "1f555": { "sheet": 0, "x": 40 },
    "1f556": { "sheet": 0, "x": 41 },
    "1f557": { "sheet": 0, "x": 42 },
    "1f558": { "sheet": 0, "x": 43 },
    "1f559": { "sheet": 0, "x": 44 },
    "1f55a": { "sheet": 0, "x": 45 },
    "1f55b": { "sheet": 0, "x": 46 },
    "1f338": { "sheet": 0, "x": 47 },
    "1f531": { "sheet": 0, "x": 48 },
    "1f339": { "sheet": 0, "x": 49 },
    "1f384": { "sheet": 0, "x": 50 },
    "1f48d": { "sheet": 0, "x": 51 },
    "1f48e": { "sheet": 0, "x": 52 },
    "1f3e0": { "sheet": 0, "x": 53 },
    "26ea": { "sheet": 0, "x": 54 },
    "1f3e2": { "sheet": 0, "x": 55 },
    "1f689": { "sheet": 0, "x": 56 },
    "26fd": { "sheet": 0, "x": 57 },
    "1f5fb": { "sheet": 0, "x": 58 },
    "1f3a4": { "sheet": 0, "x": 59 },
    "1f3a5": { "sheet": 0, "x": 60 },
    "1f3b5": { "sheet": 0, "x": 61 },
    "1f511": { "sheet": 0, "x": 62 },
    "1f3b7": { "sheet": 0, "x": 63 },
    "1f3b8": { "sheet": 0, "x": 64 },
    "1f3ba": { "sheet": 0, "x": 65 },
    "1f374": { "sheet": 0, "x": 66 },
    "1f378": { "sheet": 0, "x": 67 },
    "2615": { "sheet": 0, "x": 68 },
    "1f370": { "sheet": 0, "x": 69 },
    "1f37a": { "sheet": 0, "x": 70 },
    "26c4": { "sheet": 0, "x": 71 },
    "2601": { "sheet": 0, "x": 72 },
    "2600": { "sheet": 0, "x": 73 },
    "2614": { "sheet": 0, "x": 74 },
    "1f319": { "sheet": 0, "x": 75 },
    "1f304": { "sheet": 0, "x": 76 },
    "1f47c": { "sheet": 0, "x": 77 },
    "1f431": { "sheet": 0, "x": 78 },
    "1f42f": { "sheet": 0, "x": 79 },
    "1f43b": { "sheet": 0, "x": 80 },
    "1f436": { "sheet": 0, "x": 81 },
    "1f42d": { "sheet": 0, "x": 82 },
    "1f433": { "sheet": 0, "x": 83 },
    "1f427": { "sheet": 0, "x": 84 },
    "1f60a": { "sheet": 0, "x": 85 },
    "1f603": { "sheet": 0, "x": 86 },
    "1f61e": { "sheet": 0, "x": 87 },
    "1f620": { "sheet": 0, "x": 88 },
    "1f4a9": { "sheet": 0, "x": 89 },

    "1f4ea": { "sheet": 1, "x": 0 },
    "1f4ee": { "sheet": 1, "x": 1 },
    "1f4e9": { "sheet": 1, "x": 2 },
    "1f4f2": { "sheet": 1, "x": 3 },
    "1f61c": { "sheet": 1, "x": 4 },
    "1f60d": { "sheet": 1, "x": 5 },
    "1f631": { "sheet": 1, "x": 6 },
    "1f613": { "sheet": 1, "x": 7 },
    "1f435": { "sheet": 1, "x": 8 },
    "1f419": { "sheet": 1, "x": 9 },
    "1f437": { "sheet": 1, "x": 10 },
    "1f47d": { "sheet": 1, "x": 11 },
    "1f680": { "sheet": 1, "x": 12 },
    "1f451": { "sheet": 1, "x": 13 },
    "1f4a1": { "sheet": 1, "x": 14 },
    "1f340": { "sheet": 1, "x": 15 },
    "1f48f": { "sheet": 1, "x": 16 },
    "1f381": { "sheet": 1, "x": 17 },
    "1f52b": { "sheet": 1, "x": 18 },
    "1f50d": { "sheet": 1, "x": 19 },
    "1f3c3": { "sheet": 1, "x": 20 },
    "1f528": { "sheet": 1, "x": 21 },
    "1f386": { "sheet": 1, "x": 22 },
    "1f341": { "sheet": 1, "x": 23 },
    "1f342": { "sheet": 1, "x": 24 },
    "1f47f": { "sheet": 1, "x": 25 },
    "1f47b": { "sheet": 1, "x": 26 },
    "1f480": { "sheet": 1, "x": 27 },
    "1f525": { "sheet": 1, "x": 28 },
    "1f4bc": { "sheet": 1, "x": 29 },
    "1f4ba": { "sheet": 1, "x": 30 },
    "1f354": { "sheet": 1, "x": 31 },
    "26f2": { "sheet": 1, "x": 32 },
    "26fa": { "sheet": 1, "x": 33 },
    "2668": { "sheet": 1, "x": 34 },
    "1f3a1": { "sheet": 1, "x": 35 },
    "1f3ab": { "sheet": 1, "x": 36 },
    "1f4bf": { "sheet": 1, "x": 37 },
    "1f4c0": { "sheet": 1, "x": 38 },
    "1f4fb": { "sheet": 1, "x": 39 },
    "1f4fc": { "sheet": 1, "x": 40 },
    "1f4fa": { "sheet": 1, "x": 41 },
    "1f47e": { "sheet": 1, "x": 42 },
    "303d": { "sheet": 1, "x": 43 },
    "1f004": { "sheet": 1, "x": 44 },
    "1f19a": { "sheet": 1, "x": 45 },
    "1f4b0": { "sheet": 1, "x": 46 },
    "1f3af": { "sheet": 1, "x": 47 },
    "1f3c6": { "sheet": 1, "x": 48 },
    "1f3c1": { "sheet": 1, "x": 49 },
    "1f3b0": { "sheet": 1, "x": 50 },
    "1f40e": { "sheet": 1, "x": 51 },
    "1f6a4": { "sheet": 1, "x": 52 },
    "1f6b2": { "sheet": 1, "x": 53 },
    "1f6a7": { "sheet": 1, "x": 54 },
    "1f6b9": { "sheet": 1, "x": 55 },
    "1f6ba": { "sheet": 1, "x": 56 },
    "1f6bc": { "sheet": 1, "x": 57 },
    "1f489": { "sheet": 1, "x": 58 },
    "1f4a4": { "sheet": 1, "x": 59 },
    "26a1": { "sheet": 1, "x": 60 },
    "1f460": { "sheet": 1, "x": 61 },
    "1f6c0": { "sheet": 1, "x": 62 },
    "1f6bd": { "sheet": 1, "x": 63 },
    "1f508": { "sheet": 1, "x": 64 },
    "1f4e2": { "sheet": 1, "x": 65 },
    "1f38c": { "sheet": 1, "x": 66 },
    "1f512": { "sheet": 1, "x": 67 },
    "1f513": { "sheet": 1, "x": 68 },
    "1f306": { "sheet": 1, "x": 69 },
    "1f373": { "sheet": 1, "x": 70 },
    "1f4d6": { "sheet": 1, "x": 71 },
    "1f4b1": { "sheet": 1, "x": 72 },
    "1f4b9": { "sheet": 1, "x": 73 },
    "1f4e1": { "sheet": 1, "x": 74 },
    "1f4aa": { "sheet": 1, "x": 75 },
    "1f3e6": { "sheet": 1, "x": 76 },
    "1f6a5": { "sheet": 1, "x": 77 },
    "1f17f": { "sheet": 1, "x": 78 },
    "1f68f": { "sheet": 1, "x": 79 },
    "1f6bb": { "sheet": 1, "x": 80 },
    "1f46e": { "sheet": 1, "x": 81 },
    "1f3e3": { "sheet": 1, "x": 82 },
    "1f3e7": { "sheet": 1, "x": 83 },
    "1f3e5": { "sheet": 1, "x": 84 },
    "1f3ea": { "sheet": 1, "x": 85 },
    "1f3eb": { "sheet": 1, "x": 86 },
    "1f3e8": { "sheet": 1, "x": 87 },
    "1f68c": { "sheet": 1, "x": 88 },
    "1f695": { "sheet": 1, "x": 89 },

    "1f6b6": { "sheet": 2, "x": 0 },
    "1f6a2": { "sheet": 2, "x": 1 },
    "1f201": { "sheet": 2, "x": 2 },
    "1f49f": { "sheet": 2, "x": 3 },
    "2734": { "sheet": 2, "x": 4 },
    "2733": { "sheet": 2, "x": 5 },
    "1f51e": { "sheet": 2, "x": 6 },
    "1f6ad": { "sheet": 2, "x": 7 },
    "1f530": { "sheet": 2, "x": 8 },
    "267f": { "sheet": 2, "x": 9 },
    "1f4f6": { "sheet": 2, "x": 10 },
    "2665": { "sheet": 2, "x": 11 },
    "2666": { "sheet": 2, "x": 12 },
    "2660": { "sheet": 2, "x": 13 },
    "2663": { "sheet": 2, "x": 14 },
    "0023-20e3": { "sheet": 2, "x": 15 },
    "27bf": { "sheet": 2, "x": 16 },
    "1f195": { "sheet": 2, "x": 17 },
    "1f199": { "sheet": 2, "x": 18 },
    "1f192": { "sheet": 2, "x": 19 },
    "1f236": { "sheet": 2, "x": 20 },
    "1f21a": { "sheet": 2, "x": 21 },
    "1f237": { "sheet": 2, "x": 22 },
    "1f238": { "sheet": 2, "x": 23 },
    "1f534": { "sheet": 2, "x": 24 },
    "1f532": { "sheet": 2, "x": 25 },
    "1f533": { "sheet": 2, "x": 26 },
    "0031-20e3": { "sheet": 2, "x": 27 },
    "0032-20e3": { "sheet": 2, "x": 28 },
    "0033-20e3": { "sheet": 2, "x": 29 },
    "0034-20e3": { "sheet": 2, "x": 30 },
    "0035-20e3": { "sheet": 2, "x": 31 },
    "0036-20e3": { "sheet": 2, "x": 32 },
    "0037-20e3": { "sheet": 2, "x": 33 },
    "0038-20e3": { "sheet": 2, "x": 34 },
    "0039-20e3": { "sheet": 2, "x": 35 },
    "0030-20e3": { "sheet": 2, "x": 36 },
    "1f250": { "sheet": 2, "x": 37 },
    "1f239": { "sheet": 2, "x": 38 },
    "1f202": { "sheet": 2, "x": 39 },
    "1f194": { "sheet": 2, "x": 40 },
    "1f235": { "sheet": 2, "x": 41 },
    "1f233": { "sheet": 2, "x": 42 },
    "1f22f": { "sheet": 2, "x": 43 },
    "1f23a": { "sheet": 2, "x": 44 },
    "1f446": { "sheet": 2, "x": 45 },
    "1f447": { "sheet": 2, "x": 46 },
    "1f448": { "sheet": 2, "x": 47 },
    "1f449": { "sheet": 2, "x": 48 },
    "2b06": { "sheet": 2, "x": 49 },
    "2b07": { "sheet": 2, "x": 50 },
    "27a1": { "sheet": 2, "x": 51 },
    "2b05": { "sheet": 2, "x": 52 },
    "2197": { "sheet": 2, "x": 53 },
    "2196": { "sheet": 2, "x": 54 },
    "2198": { "sheet": 2, "x": 55 },
    "2199": { "sheet": 2, "x": 56 },
    "25b6": { "sheet": 2, "x": 57 },
    "25c0": { "sheet": 2, "x": 58 },
    "23e9": { "sheet": 2, "x": 59 },
    "23ea": { "sheet": 2, "x": 60 },
    "1f52f": { "sheet": 2, "x": 61 },
    "2648": { "sheet": 2, "x": 62 },
    "2649": { "sheet": 2, "x": 63 },
    "264a": { "sheet": 2, "x": 64 },
    "264b": { "sheet": 2, "x": 65 },
    "264c": { "sheet": 2, "x": 66 },
    "264d": { "sheet": 2, "x": 67 },
    "264e": { "sheet": 2, "x": 68 },
    "264f": { "sheet": 2, "x": 69 },
    "2650": { "sheet": 2, "x": 70 },
    "2651": { "sheet": 2, "x": 71 },
    "2652": { "sheet": 2, "x": 72 },
    "2653": { "sheet": 2, "x": 73 },
    "26ce": { "sheet": 2, "x": 74 },
    "1f51d": { "sheet": 2, "x": 75 },
    "1f197": { "sheet": 2, "x": 76 },
    "00a9": { "sheet": 2, "x": 77 },
    "00ae": { "sheet": 2, "x": 78 },
    "1f4f3": { "sheet": 2, "x": 79 },
    "1f4f4": { "sheet": 2, "x": 80 },
    "26a0": { "sheet": 2, "x": 81 },
    "1f481": { "sheet": 2, "x": 82 },

    "1f4dd": { "sheet": 3, "x": 0 },
    "1f454": { "sheet": 3, "x": 1 },
    "1f33a": { "sheet": 3, "x": 2 },
    "1f337": { "sheet": 3, "x": 3 },
    "1f33b": { "sheet": 3, "x": 4 },
    "1f490": { "sheet": 3, "x": 5 },
    "1f334": { "sheet": 3, "x": 6 },
    "1f335": { "sheet": 3, "x": 7 },
    "1f6be": { "sheet": 3, "x": 8 },
    "1f3a7": { "sheet": 3, "x": 9 },
    "1f376": { "sheet": 3, "x": 10 },
    "1f37b": { "sheet": 3, "x": 11 },
    "3297": { "sheet": 3, "x": 12 },
    "1f6ac": { "sheet": 3, "x": 13 },
    "1f48a": { "sheet": 3, "x": 14 },
    "1f388": { "sheet": 3, "x": 15 },
    "1f4a3": { "sheet": 3, "x": 16 },
    "1f389": { "sheet": 3, "x": 17 },
    "2702": { "sheet": 3, "x": 18 },
    "1f380": { "sheet": 3, "x": 19 },
    "3299": { "sheet": 3, "x": 20 },
    "1f4bd": { "sheet": 3, "x": 21 },
    "1f4e3": { "sheet": 3, "x": 22 },
    "1f452": { "sheet": 3, "x": 23 },
    "1f457": { "sheet": 3, "x": 24 },
    "1f461": { "sheet": 3, "x": 25 },
    "1f462": { "sheet": 3, "x": 26 },
    "1f484": { "sheet": 3, "x": 27 },
    "1f485": { "sheet": 3, "x": 28 },
    "1f486": { "sheet": 3, "x": 29 },
    "1f487": { "sheet": 3, "x": 30 },
    "1f488": { "sheet": 3, "x": 31 },
    "1f458": { "sheet": 3, "x": 32 },
    "1f459": { "sheet": 3, "x": 33 },
    "1f45c": { "sheet": 3, "x": 34 },
    "1f3ac": { "sheet": 3, "x": 35 },
    "1f514": { "sheet": 3, "x": 36 },
    "1f3b6": { "sheet": 3, "x": 37 },
    "1f493": { "sheet": 3, "x": 38 },
    "1f497": { "sheet": 3, "x": 39 },
    "1f498": { "sheet": 3, "x": 40 },
    "1f499": { "sheet": 3, "x": 41 },
    "1f49a": { "sheet": 3, "x": 42 },
    "1f49b": { "sheet": 3, "x": 43 },
    "1f49c": { "sheet": 3, "x": 44 },
    "2728": { "sheet": 3, "x": 45 },
    "2b50": { "sheet": 3, "x": 46 },
    "1f4a8": { "sheet": 3, "x": 47 },
    "1f4a6": { "sheet": 3, "x": 48 },
    "2b55": { "sheet": 3, "x": 49 },
    "274c": { "sheet": 3, "x": 50 },
    "1f4a2": { "sheet": 3, "x": 51 },
    "1f31f": { "sheet": 3, "x": 52 },
    "2754": { "sheet": 3, "x": 53 },
    "2755": { "sheet": 3, "x": 54 },
    "1f375": { "sheet": 3, "x": 55 },
    "1f35e": { "sheet": 3, "x": 56 },
    "1f366": { "sheet": 3, "x": 57 },
    "1f35f": { "sheet": 3, "x": 58 },
    "1f361": { "sheet": 3, "x": 59 },
    "1f358": { "sheet": 3, "x": 60 },
    "1f35a": { "sheet": 3, "x": 61 },
    "1f35d": { "sheet": 3, "x": 62 },
    "1f35c": { "sheet": 3, "x": 63 },
    "1f35b": { "sheet": 3, "x": 64 },
    "1f359": { "sheet": 3, "x": 65 },
    "1f362": { "sheet": 3, "x": 66 },
    "1f363": { "sheet": 3, "x": 67 },
    "1f34e": { "sheet": 3, "x": 68 },
    "1f34a": { "sheet": 3, "x": 69 },
    "1f353": { "sheet": 3, "x": 70 },
    "1f349": { "sheet": 3, "x": 71 },
    "1f345": { "sheet": 3, "x": 72 },
    "1f346": { "sheet": 3, "x": 73 },
    "1f382": { "sheet": 3, "x": 74 },
    "1f371": { "sheet": 3, "x": 75 },
    "1f372": { "sheet": 3, "x": 76 },

    "1f652": { "sheet": 4, "x": 0 },
    "1f60f": { "sheet": 4, "x": 1 },
    "1f614": { "sheet": 4, "x": 2 },
    "1f601": { "sheet": 4, "x": 3 },
    "1f609": { "sheet": 4, "x": 4 },
    "1f623": { "sheet": 4, "x": 5 },
    "1f616": { "sheet": 4, "x": 6 },
    "1f62a": { "sheet": 4, "x": 7 },
    "1f61d": { "sheet": 4, "x": 8 },
    "1f60c": { "sheet": 4, "x": 9 },
    "1f628": { "sheet": 4, "x": 10 },
    "1f637": { "sheet": 4, "x": 11 },
    "1f633": { "sheet": 4, "x": 12 },
    "1f612": { "sheet": 4, "x": 13 },
    "1f630": { "sheet": 4, "x": 14 },
    "1f632": { "sheet": 4, "x": 15 },
    "1f62d": { "sheet": 4, "x": 16 },
    "1f602": { "sheet": 4, "x": 17 },
    "1f622": { "sheet": 4, "x": 18 },
    "263a": { "sheet": 4, "x": 19 },
    "1f604": { "sheet": 4, "x": 20 },
    "1f621": { "sheet": 4, "x": 21 },
    "1f61a": { "sheet": 4, "x": 22 },
    "1f618": { "sheet": 4, "x": 23 },
    "1f440": { "sheet": 4, "x": 24 },
    "1f443": { "sheet": 4, "x": 25 },
    "1f442": { "sheet": 4, "x": 26 },
    "1f444": { "sheet": 4, "x": 27 },
    "1f64f": { "sheet": 4, "x": 28 },
    "1f44b": { "sheet": 4, "x": 29 },
    "1f44f": { "sheet": 4, "x": 30 },
    "1f44c": { "sheet": 4, "x": 31 },
    "1f44e": { "sheet": 4, "x": 32 },
    "1f450": { "sheet": 4, "x": 33 },
    "1f645": { "sheet": 4, "x": 34 },
    "1f646": { "sheet": 4, "x": 35 },
    "1f491": { "sheet": 4, "x": 36 },
    "1f647": { "sheet": 4, "x": 37 },
    "1f64c": { "sheet": 4, "x": 38 },
    "1f46b": { "sheet": 4, "x": 39 },
    "1f46f": { "sheet": 4, "x": 40 },
    "1f3c0": { "sheet": 4, "x": 41 },
    "1f3c8": { "sheet": 4, "x": 42 },
    "1f3b1": { "sheet": 4, "x": 43 },
    "1f3ca": { "sheet": 4, "x": 44 },
    "1f699": { "sheet": 4, "x": 45 },
    "1f69a": { "sheet": 4, "x": 46 },
    "1f692": { "sheet": 4, "x": 47 },
    "1f691": { "sheet": 4, "x": 48 },
    "1f693": { "sheet": 4, "x": 49 },
    "1f3a2": { "sheet": 4, "x": 50 },
    "1f687": { "sheet": 4, "x": 51 },
    "1f684": { "sheet": 4, "x": 52 },
    "1f38d": { "sheet": 4, "x": 53 },
    "1f49d": { "sheet": 4, "x": 54 },
    "1f38e": { "sheet": 4, "x": 55 },
    "1f393": { "sheet": 4, "x": 56 },
    "1f392": { "sheet": 4, "x": 57 },
    "1f38f": { "sheet": 4, "x": 58 },
    "1f302": { "sheet": 4, "x": 59 },
    "1f492": { "sheet": 4, "x": 60 },
    "1f30a": { "sheet": 4, "x": 61 },
    "1f367": { "sheet": 4, "x": 62 },
    "1f387": { "sheet": 4, "x": 63 },
    "1f41a": { "sheet": 4, "x": 64 },
    "1f390": { "sheet": 4, "x": 65 },
    "1f300": { "sheet": 4, "x": 66 },
    "1f33e": { "sheet": 4, "x": 67 },
    "1f383": { "sheet": 4, "x": 68 },
    "1f391": { "sheet": 4, "x": 69 },
    "1f343": { "sheet": 4, "x": 70 },
    "1f385": { "sheet": 4, "x": 71 },
    "1f305": { "sheet": 4, "x": 72 },
    "1f307": { "sheet": 4, "x": 73 },
    "1f303": { "sheet": 4, "x": 74 },
    "1f308": { "sheet": 4, "x": 75 },

    "1f3e9": { "sheet": 5, "x": 0 },
    "1f3a8": { "sheet": 5, "x": 1 },
    "1f3a9": { "sheet": 5, "x": 2 },
    "1f3ec": { "sheet": 5, "x": 3 },
    "1f3ef": { "sheet": 5, "x": 4 },
    "1f3f0": { "sheet": 5, "x": 5 },
    "1f3a6": { "sheet": 5, "x": 6 },
    "1f3ed": { "sheet": 5, "x": 7 },
    "1f5fc": { "sheet": 5, "x": 8 },
    "UNKNOWN": { "sheet": 5, "x": 9 },
    "1f1ef-1f1f5": { "sheet": 5, "x": 10 },
    "1f1fa-1f1f8": { "sheet": 5, "x": 11 },
    "1f1eb-1f1f7": { "sheet": 5, "x": 12 },
    "1f1e9-1f1ea": { "sheet": 5, "x": 13 },
    "1f1ee-1f1f9": { "sheet": 5, "x": 14 },
    "1f1ec-1f1e7": { "sheet": 5, "x": 15 },
    "1f1ea-1f1f8": { "sheet": 5, "x": 16 },
    "1f1f7-1f1fa": { "sheet": 5, "x": 17 },
    "1f1e8-1f1f3": { "sheet": 5, "x": 18 },
    "1f1f0-1f1f7": { "sheet": 5, "x": 19 },
    "1f471": { "sheet": 5, "x": 20 },
    "1f472": { "sheet": 5, "x": 21 },
    "1f473": { "sheet": 5, "x": 22 },
    "1f474": { "sheet": 5, "x": 23 },
    "1f475": { "sheet": 5, "x": 24 },
    "1f476": { "sheet": 5, "x": 25 },
    "1f477": { "sheet": 5, "x": 26 },
    "1f478": { "sheet": 5, "x": 27 },
    "1f5fd": { "sheet": 5, "x": 28 },
    "1f482": { "sheet": 5, "x": 29 },
    "1f483": { "sheet": 5, "x": 30 },
    "1f42c": { "sheet": 5, "x": 31 },
    "1f426": { "sheet": 5, "x": 32 },
    "1f420": { "sheet": 5, "x": 33 },
    "1f424": { "sheet": 5, "x": 34 },
    "1f439": { "sheet": 5, "x": 35 },
    "1f41b": { "sheet": 5, "x": 36 },
    "1f418": { "sheet": 5, "x": 37 },
    "1f428": { "sheet": 5, "x": 38 },
    "1f412": { "sheet": 5, "x": 39 },
    "1f411": { "sheet": 5, "x": 40 },
    "1f43a": { "sheet": 5, "x": 41 },
    "1f42e": { "sheet": 5, "x": 42 },
    "1f430": { "sheet": 5, "x": 43 },
    "1f40d": { "sheet": 5, "x": 44 },
    "1f414": { "sheet": 5, "x": 45 },
    "1f417": { "sheet": 5, "x": 46 },
    "1f42b": { "sheet": 5, "x": 47 },
    "1f438": { "sheet": 5, "x": 48 },
    "1f170": { "sheet": 5, "x": 49 },
    "1f171": { "sheet": 5, "x": 50 },
    "1f18e": { "sheet": 5, "x": 51 },
    "1f17e": { "sheet": 5, "x": 52 },
    "1f463": { "sheet": 5, "x": 53 },
    "2122": { "sheet": 5, "x": 54 },

    "203c": { "sheet": 6, "x": 0 },
    "2049": { "sheet": 6, "x": 1 },
    "2139": { "sheet": 6, "x": 2 },
    "2194": { "sheet": 6, "x": 3 },
    "2195": { "sheet": 6, "x": 4 },
    "21a9": { "sheet": 6, "x": 5 },
    "21aa": { "sheet": 6, "x": 6 },
    "231a": { "sheet": 6, "x": 7 },
    "231b": { "sheet": 6, "x": 8 },
    "23eb": { "sheet": 6, "x": 9 },
    "23ec": { "sheet": 6, "x": 10 },
    "23f0": { "sheet": 6, "x": 11 },
    "23f3": { "sheet": 6, "x": 12 },
    "24c2": { "sheet": 6, "x": 13 },
    "25aa": { "sheet": 6, "x": 14 },
    "25ab": { "sheet": 6, "x": 15 },
    "2b1c": { "sheet": 6, "x": 16 },
    "2b1b": { "sheet": 6, "x": 17 },
    "25fd": { "sheet": 6, "x": 18 },
    "25fe": { "sheet": 6, "x": 19 },
    "2611": { "sheet": 6, "x": 20 },
    "267b": { "sheet": 6, "x": 21 },
    "2693": { "sheet": 6, "x": 22 },
    "26aa": { "sheet": 6, "x": 23 },
    "26ab": { "sheet": 6, "x": 24 },
    "26c5": { "sheet": 6, "x": 25 },
    "26d4": { "sheet": 6, "x": 26 },
    "2705": { "sheet": 6, "x": 27 },
    "2709": { "sheet": 6, "x": 28 },
    "270f": { "sheet": 6, "x": 29 },
    "2712": { "sheet": 6, "x": 30 },
    "2714": { "sheet": 6, "x": 31 },
    "2716": { "sheet": 6, "x": 32 },
    "2744": { "sheet": 6, "x": 33 },
    "2747": { "sheet": 6, "x": 34 },
    "274e": { "sheet": 6, "x": 35 },
    "2795": { "sheet": 6, "x": 36 },
    "2796": { "sheet": 6, "x": 37 },
    "2797": { "sheet": 6, "x": 38 },
    "27b0": { "sheet": 6, "x": 39 },
    "2934": { "sheet": 6, "x": 40 },
    "2935": { "sheet": 6, "x": 41 },
    "25fc": { "sheet": 6, "x": 42 },
    "25fb": { "sheet": 6, "x": 43 },
    "3030": { "sheet": 6, "x": 44 },
    "1f0cf": { "sheet": 6, "x": 45 },
    "1f191": { "sheet": 6, "x": 46 },
    "1f193": { "sheet": 6, "x": 47 },
    "1f196": { "sheet": 6, "x": 48 },
    "1f198": { "sheet": 6, "x": 49 },
    "1f232": { "sheet": 6, "x": 50 },
    "1f234": { "sheet": 6, "x": 51 },
    "1f251": { "sheet": 6, "x": 52 },
    "1f301": { "sheet": 6, "x": 53 },
    "1f309": { "sheet": 6, "x": 54 },
    "1f30b": { "sheet": 6, "x": 55 },
    "1f30c": { "sheet": 6, "x": 56 },
    "1f30d": { "sheet": 6, "x": 57 },
    "1f30e": { "sheet": 6, "x": 58 },
    "1f30f": { "sheet": 6, "x": 59 },
    "1f310": { "sheet": 6, "x": 60 },
    "1f311": { "sheet": 6, "x": 61 },
    "1f312": { "sheet": 6, "x": 62 },
    "1f313": { "sheet": 6, "x": 63 },
    "1f314": { "sheet": 6, "x": 64 },
    "1f315": { "sheet": 6, "x": 65 },
    "1f316": { "sheet": 6, "x": 66 },
    "1f317": { "sheet": 6, "x": 67 },
    "1f318": { "sheet": 6, "x": 68 },
    "1f31a": { "sheet": 6, "x": 69 },
    "1f31b": { "sheet": 6, "x": 70 },
    "1f31c": { "sheet": 6, "x": 71 },
    "1f31d": { "sheet": 6, "x": 72 },
    "1f31e": { "sheet": 6, "x": 73 },
    "1f320": { "sheet": 6, "x": 74 },
    "1f330": { "sheet": 6, "x": 75 },
    "1f331": { "sheet": 6, "x": 76 },
    "1f332": { "sheet": 6, "x": 77 },
    "1f333": { "sheet": 6, "x": 78 },

    "1f33c": { "sheet": 7, "x": 0 },
    "1f33d": { "sheet": 7, "x": 1 },
    "1f33f": { "sheet": 7, "x": 2 },
    "1f344": { "sheet": 7, "x": 3 },
    "1f347": { "sheet": 7, "x": 4 },
    "1f348": { "sheet": 7, "x": 5 },
    "1f34b": { "sheet": 7, "x": 6 },
    "1f34c": { "sheet": 7, "x": 7 },
    "1f34d": { "sheet": 7, "x": 8 },
    "1f34f": { "sheet": 7, "x": 9 },
    "1f350": { "sheet": 7, "x": 10 },
    "1f351": { "sheet": 7, "x": 11 },
    "1f352": { "sheet": 7, "x": 12 },
    "1f355": { "sheet": 7, "x": 13 },
    "1f356": { "sheet": 7, "x": 14 },
    "1f357": { "sheet": 7, "x": 15 },
    "1f360": { "sheet": 7, "x": 16 },
    "1f364": { "sheet": 7, "x": 17 },
    "1f365": { "sheet": 7, "x": 18 },
    "1f368": { "sheet": 7, "x": 19 },
    "1f369": { "sheet": 7, "x": 20 },
    "1f36a": { "sheet": 7, "x": 21 },
    "1f36b": { "sheet": 7, "x": 22 },
    "1f36c": { "sheet": 7, "x": 23 },
    "1f36d": { "sheet": 7, "x": 24 },
    "1f36e": { "sheet": 7, "x": 25 },
    "1f36f": { "sheet": 7, "x": 26 },
    "1f377": { "sheet": 7, "x": 27 },
    "1f379": { "sheet": 7, "x": 28 },
    "1f37c": { "sheet": 7, "x": 29 },
    "1f38a": { "sheet": 7, "x": 30 },
    "1f38b": { "sheet": 7, "x": 31 },
    "1f3a0": { "sheet": 7, "x": 32 },
    "1f3a3": { "sheet": 7, "x": 33 },
    "1f3aa": { "sheet": 7, "x": 34 },
    "1f3ad": { "sheet": 7, "x": 35 },
    "1f3ae": { "sheet": 7, "x": 36 },
    "1f3b2": { "sheet": 7, "x": 37 },
    "1f3b3": { "sheet": 7, "x": 38 },
    "1f3b4": { "sheet": 7, "x": 39 },
    "1f3b9": { "sheet": 7, "x": 40 },
    "1f3bb": { "sheet": 7, "x": 41 },
    "1f3bc": { "sheet": 7, "x": 42 },
    "1f3bd": { "sheet": 7, "x": 43 },
    "1f3c2": { "sheet": 7, "x": 44 },
    "1f3c7": { "sheet": 7, "x": 45 },
    "1f3c9": { "sheet": 7, "x": 46 },
    "1f3e1": { "sheet": 7, "x": 47 },
    "1f3e4": { "sheet": 7, "x": 48 },
    "1f3ee": { "sheet": 7, "x": 49 },
    "1f400": { "sheet": 7, "x": 50 },
    "1f401": { "sheet": 7, "x": 51 },
    "1f402": { "sheet": 7, "x": 52 },
    "1f403": { "sheet": 7, "x": 53 },
    "1f404": { "sheet": 7, "x": 54 },
    "1f405": { "sheet": 7, "x": 55 },
    "1f406": { "sheet": 7, "x": 56 },
    "1f407": { "sheet": 7, "x": 57 },
    "1f408": { "sheet": 7, "x": 58 },
    "1f409": { "sheet": 7, "x": 59 },
    "1f40a": { "sheet": 7, "x": 60 },
    "1f40b": { "sheet": 7, "x": 61 },
    "1f40c": { "sheet": 7, "x": 62 },
    "1f40f": { "sheet": 7, "x": 63 },
    "1f410": { "sheet": 7, "x": 64 },
    "1f413": { "sheet": 7, "x": 65 },
    "1f415": { "sheet": 7, "x": 66 },
    "1f416": { "sheet": 7, "x": 67 },
    "1f41c": { "sheet": 7, "x": 68 },
    "1f41d": { "sheet": 7, "x": 69 },
    "1f41e": { "sheet": 7, "x": 70 },
    "1f421": { "sheet": 7, "x": 71 },
    "1f422": { "sheet": 7, "x": 72 },
    "1f423": { "sheet": 7, "x": 73 },
    "1f425": { "sheet": 7, "x": 74 },
    "1f429": { "sheet": 7, "x": 75 },
    "1f42a": { "sheet": 7, "x": 76 },
    "1f432": { "sheet": 7, "x": 77 },
    "1f43c": { "sheet": 7, "x": 78 },

    "1f43d": { "sheet": 8, "x": 0 },
    "1f43e": { "sheet": 8, "x": 1 },
    "1f445": { "sheet": 8, "x": 2 },
    "1f453": { "sheet": 8, "x": 3 },
    "1f456": { "sheet": 8, "x": 4 },
    "1f45a": { "sheet": 8, "x": 5 },
    "1f45b": { "sheet": 8, "x": 6 },
    "1f45d": { "sheet": 8, "x": 7 },
    "1f45e": { "sheet": 8, "x": 8 },
    "1f464": { "sheet": 8, "x": 9 },
    "1f465": { "sheet": 8, "x": 10 },
    "1f46a": { "sheet": 8, "x": 11 },
    "1f46c": { "sheet": 8, "x": 12 },
    "1f46d": { "sheet": 8, "x": 13 },
    "1f470": { "sheet": 8, "x": 14 },
    "1f479": { "sheet": 8, "x": 15 },
    "1f47a": { "sheet": 8, "x": 16 },
    "1f48c": { "sheet": 8, "x": 17 },
    "1f495": { "sheet": 8, "x": 18 },
    "1f496": { "sheet": 8, "x": 19 },
    "1f49e": { "sheet": 8, "x": 20 },
    "1f4a0": { "sheet": 8, "x": 21 },
    "1f4a5": { "sheet": 8, "x": 22 },
    "1f4a7": { "sheet": 8, "x": 23 },
    "1f4ab": { "sheet": 8, "x": 24 },
    "1f4ac": { "sheet": 8, "x": 25 },
    "1f4ad": { "sheet": 8, "x": 26 },
    "1f4ae": { "sheet": 8, "x": 27 },
    "1f4af": { "sheet": 8, "x": 28 },
    "1f4b2": { "sheet": 8, "x": 29 },
    "1f4b3": { "sheet": 8, "x": 30 },
    "1f4b4": { "sheet": 8, "x": 31 },
    "1f4b5": { "sheet": 8, "x": 32 },
    "1f4b6": { "sheet": 8, "x": 33 },
    "1f4b7": { "sheet": 8, "x": 34 },
    "1f4b8": { "sheet": 8, "x": 35 },
    "1f4be": { "sheet": 8, "x": 36 },
    "1f4c1": { "sheet": 8, "x": 37 },
    "1f4c2": { "sheet": 8, "x": 38 },
    "1f4c3": { "sheet": 8, "x": 39 },
    "1f4c4": { "sheet": 8, "x": 40 },
    "1f4c5": { "sheet": 8, "x": 41 },
    "1f4c6": { "sheet": 8, "x": 42 },
    "1f4c7": { "sheet": 8, "x": 43 },
    "1f4c8": { "sheet": 8, "x": 44 },
    "1f4c9": { "sheet": 8, "x": 45 },
    "1f4ca": { "sheet": 8, "x": 46 },
    "1f4cb": { "sheet": 8, "x": 47 },
    "1f4cc": { "sheet": 8, "x": 48 },
    "1f4cd": { "sheet": 8, "x": 49 },
    "1f4ce": { "sheet": 8, "x": 50 },
    "1f4cf": { "sheet": 8, "x": 51 },
    "1f4d0": { "sheet": 8, "x": 52 },
    "1f4d1": { "sheet": 8, "x": 53 },
    "1f4d2": { "sheet": 8, "x": 54 },
    "1f4d3": { "sheet": 8, "x": 55 },
    "1f4d4": { "sheet": 8, "x": 56 },
    "1f4d5": { "sheet": 8, "x": 57 },
    "1f4d7": { "sheet": 8, "x": 58 },
    "1f4d8": { "sheet": 8, "x": 59 },
    "1f4d9": { "sheet": 8, "x": 60 },
    "1f4da": { "sheet": 8, "x": 61 },
    "1f4db": { "sheet": 8, "x": 62 },
    "1f4dc": { "sheet": 8, "x": 63 },
    "1f4de": { "sheet": 8, "x": 64 },
    "1f4df": { "sheet": 8, "x": 65 },
    "1f4e4": { "sheet": 8, "x": 66 },
    "1f4e5": { "sheet": 8, "x": 67 },
    "1f4e6": { "sheet": 8, "x": 68 },
    "1f4e7": { "sheet": 8, "x": 69 },
    "1f4e8": { "sheet": 8, "x": 70 },
    "1f4eb": { "sheet": 8, "x": 71 },
    "1f4ec": { "sheet": 8, "x": 72 },
    "1f4ed": { "sheet": 8, "x": 73 },
    "1f4ef": { "sheet": 8, "x": 74 },
    "1f4f0": { "sheet": 8, "x": 75 },
    "1f4f5": { "sheet": 8, "x": 76 },
    "1f4f9": { "sheet": 8, "x": 77 },
    "1f500": { "sheet": 8, "x": 78 },

    "1f501": { "sheet": 9, "x": 0 },
    "1f502": { "sheet": 9, "x": 1 },
    "1f503": { "sheet": 9, "x": 2 },
    "1f504": { "sheet": 9, "x": 3 },
    "1f505": { "sheet": 9, "x": 4 },
    "1f506": { "sheet": 9, "x": 5 },
    "1f507": { "sheet": 9, "x": 6 },
    "1f509": { "sheet": 9, "x": 7 },
    "1f50a": { "sheet": 9, "x": 8 },
    "1f50b": { "sheet": 9, "x": 9 },
    "1f50c": { "sheet": 9, "x": 10 },
    "1f50e": { "sheet": 9, "x": 11 },
    "1f50f": { "sheet": 9, "x": 12 },
    "1f510": { "sheet": 9, "x": 13 },
    "1f515": { "sheet": 9, "x": 14 },
    "1f516": { "sheet": 9, "x": 15 },
    "1f517": { "sheet": 9, "x": 16 },
    "1f518": { "sheet": 9, "x": 17 },
    "1f519": { "sheet": 9, "x": 18 },
    "1f51a": { "sheet": 9, "x": 19 },
    "1f51b": { "sheet": 9, "x": 20 },
    "1f51c": { "sheet": 9, "x": 21 },
    "1f51f": { "sheet": 9, "x": 22 },
    "1f520": { "sheet": 9, "x": 23 },
    "1f521": { "sheet": 9, "x": 24 },
    "1f522": { "sheet": 9, "x": 25 },
    "1f523": { "sheet": 9, "x": 26 },
    "1f524": { "sheet": 9, "x": 27 },
    "1f526": { "sheet": 9, "x": 28 },
    "1f527": { "sheet": 9, "x": 29 },
    "1f529": { "sheet": 9, "x": 30 },
    "1f52a": { "sheet": 9, "x": 31 },
    "1f52c": { "sheet": 9, "x": 32 },
    "1f52d": { "sheet": 9, "x": 33 },
    "1f52e": { "sheet": 9, "x": 34 },
    "1f535": { "sheet": 9, "x": 35 },
    "1f536": { "sheet": 9, "x": 36 },
    "1f537": { "sheet": 9, "x": 37 },
    "1f538": { "sheet": 9, "x": 38 },
    "1f539": { "sheet": 9, "x": 39 },
    "1f53a": { "sheet": 9, "x": 40 },
    "1f53b": { "sheet": 9, "x": 41 },
    "1f53c": { "sheet": 9, "x": 42 },
    "1f53d": { "sheet": 9, "x": 43 },
    "1f55c": { "sheet": 9, "x": 44 },
    "1f55d": { "sheet": 9, "x": 45 },
    "1f55e": { "sheet": 9, "x": 46 },
    "1f55f": { "sheet": 9, "x": 47 },
    "1f560": { "sheet": 9, "x": 48 },
    "1f561": { "sheet": 9, "x": 49 },
    "1f562": { "sheet": 9, "x": 50 },
    "1f563": { "sheet": 9, "x": 51 },
    "1f564": { "sheet": 9, "x": 52 },
    "1f565": { "sheet": 9, "x": 53 },
    "1f566": { "sheet": 9, "x": 54 },
    "1f567": { "sheet": 9, "x": 55 },
    "1f5fe": { "sheet": 9, "x": 56 },
    "1f5ff": { "sheet": 9, "x": 57 },
    "1f600": { "sheet": 9, "x": 58 },
    "1f605": { "sheet": 9, "x": 59 },
    "1f606": { "sheet": 9, "x": 60 },
    "1f607": { "sheet": 9, "x": 61 },
    "1f608": { "sheet": 9, "x": 62 },
    "1f60b": { "sheet": 9, "x": 63 },
    "1f60e": { "sheet": 9, "x": 64 },
    "1f610": { "sheet": 9, "x": 65 },
    "1f611": { "sheet": 9, "x": 66 },
    "1f615": { "sheet": 9, "x": 67 },
    "1f617": { "sheet": 9, "x": 68 },
    "1f619": { "sheet": 9, "x": 69 },
    "1f61b": { "sheet": 9, "x": 70 },
    "1f61f": { "sheet": 9, "x": 71 },
    "1f624": { "sheet": 9, "x": 72 },
    "1f626": { "sheet": 9, "x": 73 },
    "1f627": { "sheet": 9, "x": 74 },
    "1f629": { "sheet": 9, "x": 75 },
    "1f62b": { "sheet": 9, "x": 76 },
    "1f62c": { "sheet": 9, "x": 77 },
    "1f62e": { "sheet": 9, "x": 78 },

    "1f62f": { "sheet": 10, "x": 0 },
    "1f634": { "sheet": 10, "x": 1 },
    "1f635": { "sheet": 10, "x": 2 },
    "1f636": { "sheet": 10, "x": 3 },
    "1f638": { "sheet": 10, "x": 4 },
    "1f639": { "sheet": 10, "x": 5 },
    "1f63a": { "sheet": 10, "x": 6 },
    "1f63b": { "sheet": 10, "x": 7 },
    "1f63c": { "sheet": 10, "x": 8 },
    "1f63d": { "sheet": 10, "x": 9 },
    "1f63e": { "sheet": 10, "x": 10 },
    "1f63f": { "sheet": 10, "x": 11 },
    "1f640": { "sheet": 10, "x": 12 },
    "1f648": { "sheet": 10, "x": 13 },
    "1f649": { "sheet": 10, "x": 14 },
    "1f64a": { "sheet": 10, "x": 15 },
    "1f64b": { "sheet": 10, "x": 16 },
    "1f64d": { "sheet": 10, "x": 17 },
    "1f64e": { "sheet": 10, "x": 18 },
    "1f681": { "sheet": 10, "x": 19 },
    "1f682": { "sheet": 10, "x": 20 },
    "1f686": { "sheet": 10, "x": 21 },
    "1f688": { "sheet": 10, "x": 22 },
    "1f68a": { "sheet": 10, "x": 23 },
    "1f68b": { "sheet": 10, "x": 24 },
    "1f68d": { "sheet": 10, "x": 25 },
    "1f68e": { "sheet": 10, "x": 26 },
    "1f690": { "sheet": 10, "x": 27 },
    "1f694": { "sheet": 10, "x": 28 },
    "1f696": { "sheet": 10, "x": 29 },
    "1f698": { "sheet": 10, "x": 30 },
    "1f69b": { "sheet": 10, "x": 31 },
    "1f69c": { "sheet": 10, "x": 32 },
    "1f69d": { "sheet": 10, "x": 33 },
    "1f69e": { "sheet": 10, "x": 34 },
    "1f69f": { "sheet": 10, "x": 35 },
    "1f6a0": { "sheet": 10, "x": 36 },
    "1f6a1": { "sheet": 10, "x": 37 },
    "1f6a3": { "sheet": 10, "x": 38 },
    "1f6a6": { "sheet": 10, "x": 39 },
    "1f6a8": { "sheet": 10, "x": 40 },
    "1f6a9": { "sheet": 10, "x": 41 },
    "1f6aa": { "sheet": 10, "x": 42 },
    "1f6ab": { "sheet": 10, "x": 43 },
    "1f6ae": { "sheet": 10, "x": 44 },
    "1f6af": { "sheet": 10, "x": 45 },
    "1f6b0": { "sheet": 10, "x": 46 },
    "1f6b1": { "sheet": 10, "x": 47 },
    "1f6b3": { "sheet": 10, "x": 48 },
    "1f6b4": { "sheet": 10, "x": 49 },
    "1f6b5": { "sheet": 10, "x": 50 },
    "1f6b7": { "sheet": 10, "x": 51 },
    "1f6b8": { "sheet": 10, "x": 52 },
    "1f6bf": { "sheet": 10, "x": 53 },
    "1f6c1": { "sheet": 10, "x": 54 },
    "1f6c2": { "sheet": 10, "x": 55 },
    "1f6c3": { "sheet": 10, "x": 56 },
    "1f6c4": { "sheet": 10, "x": 57 },
    "1f6c5": { "sheet": 10, "x": 58 },

    "1f1ee-1f1f3": { "sheet": 12, "x": 0 },
    "1f1f2-1f1fd": { "sheet": 12, "x": 1 },
    "1f1e7-1f1f7": { "sheet": 12, "x": 2 },
    "1f1f8-1f1e6": { "sheet": 12, "x": 3 },
    "1f1ff-1f1e6": { "sheet": 12, "x": 4 },
    "1f1e6-1f1f7": { "sheet": 12, "x": 5 },
    "1f1f3-1f1f1": { "sheet": 12, "x": 6 },
    "1f1f9-1f1f7": { "sheet": 12, "x": 7 },
    "1f1f2-1f1fe": { "sheet": 12, "x": 8 },
    "1f1fb-1f1ea": { "sheet": 12, "x": 9 },
    "1f1e8-1f1f4": { "sheet": 12, "x": 10 },
    "1f1e8-1f1f1": { "sheet": 12, "x": 11 },
    "1f1ed-1f1f0": { "sheet": 12, "x": 12 },
    "1f1f3-1f1ec": { "sheet": 12, "x": 13 },
    "1f1e8-1f1ed": { "sheet": 12, "x": 14 },
    "1f1ee-1f1f1": { "sheet": 12, "x": 15 },
    "1f1f9-1f1ed": { "sheet": 12, "x": 16 },
    "1f1f8-1f1ec": { "sheet": 12, "x": 17 },
    "1f1e6-1f1ea": { "sheet": 12, "x": 18 },
    "1f1f9-1f1fc": { "sheet": 12, "x": 19 },
    "1f1ea-1f1ec": { "sheet": 12, "x": 20 },
    "1f1e8-1f1e6": { "sheet": 12, "x": 21 },
    "1f1f2-1f1e8": { "sheet": 12, "x": 22 },
    "1f1e6-1f1f9": { "sheet": 12, "x": 23 },
    "1f1e6-1f1fa": { "sheet": 12, "x": 24 },
    "1f1e7-1f1e6": { "sheet": 12, "x": 25 },
    "1f1e7-1f1ea": { "sheet": 12, "x": 26 },
    "1f1e8-1f1ee": { "sheet": 12, "x": 27 },
    "1f1e8-1f1f2": { "sheet": 12, "x": 28 },
    "1f1e8-1f1f7": { "sheet": 12, "x": 29 },
    "1f1e9-1f1ff": { "sheet": 12, "x": 30 },
    "1f1ea-1f1e8": { "sheet": 12, "x": 31 },
    "1f1ec-1f1ed": { "sheet": 12, "x": 32 },
    "1f1ec-1f1f7": { "sheet": 12, "x": 33 },
    "1f1ed-1f1f3": { "sheet": 12, "x": 34 },
    "1f1ed-1f1f7": { "sheet": 12, "x": 35 },
    "1f1ee-1f1f7": { "sheet": 12, "x": 36 },
    "1f1ef-1f1f4": { "sheet": 12, "x": 37 },
    "1f1f0-1f1ff": { "sheet": 12, "x": 38 },
    "1f1f1-1f1e7": { "sheet": 12, "x": 39 },
    "1f1f5-1f1ea": { "sheet": 12, "x": 40 },
    "1f1f5-1f1f9": { "sheet": 12, "x": 41 },
    "1f1f8-1f1fe": { "sheet": 12, "x": 42 },
    "1f1fa-1f1e6": { "sheet": 12, "x": 43 },
    "1f1fa-1f1fe": { "sheet": 12, "x": 44 },
    "1f1fd-1f1ea": { "sheet": 12, "x": 45 },
  };

  var images = [];

  var squareSize = 16;

  return {
    regEx: new RegExp(regexString, 'g'),

    squareSize: squareSize,

    loaded: false,
    loadData: function() {
      var promises = [];

      for (var i = 0; i < 13; i++) {
        if (i == 11) {
          continue;
        }

        images[i] = new Image();
        var num = i.toString(16);
        if (config.customEmojiImageFormat) {
          var fileName = config.customEmojiImageFormat.replace("NUM", num);
          images[i].src = URL.createObjectURL(new Blob([ JARStore.loadFile(fileName) ]));
        } else {
          images[i].src = "style/emoji/emoji" + num + ".png";
        }

        promises.push(new Promise(function(resolve, reject) {
          images[i].onload = resolve;
        }));
      }

      return Promise.all(promises).then(function() {
        emoji.loaded = true;
      });
    },

    getData: function(str, size) {
      var firstCodePoint = str.codePointAt(0);

      var unified = firstCodePoint.toString(16);
      if (unified.length == 2) {
        unified = "00" + unified;
      }

      var len = String.fromCodePoint(firstCodePoint).length;
      if (str.length > len) {
        unified += "-" + str.substr(len).codePointAt(0).toString(16);
      }

      var emoji = data[unified];

      return {
        img: images[emoji.sheet],
        x: emoji.x * squareSize,
      };
    },
  };
})();



/* SOURCE: libs/FileSaver/FileSaver.js */
/* FileSaver.js
 * A saveAs() FileSaver implementation.
 * 2014-12-17
 *
 * By Eli Grey, http://eligrey.com
 * License: X11/MIT
 *   See https://github.com/eligrey/FileSaver.js/blob/master/LICENSE.md
 */

/*global self */
/*jslint bitwise: true, indent: 4, laxbreak: true, laxcomma: true, smarttabs: true, plusplus: true */

/*! @source http://purl.eligrey.com/github/FileSaver.js/blob/master/FileSaver.js */

var saveAs = saveAs
  // IE 10+ (native saveAs)
  || (typeof navigator !== "undefined" &&
      navigator.msSaveOrOpenBlob && navigator.msSaveOrOpenBlob.bind(navigator))
  // Everyone else
  || (function(view) {
	
	// IE <10 is explicitly unsupported
	if (typeof navigator !== "undefined" &&
	    /MSIE [1-9]\./.test(navigator.userAgent)) {
		return;
	}
	var
		  doc = view.document
		  // only get URL when necessary in case Blob.js hasn't overridden it yet
		, get_URL = function() {
			return view.URL || view.webkitURL || view;
		}
		, save_link = doc.createElementNS("http://www.w3.org/1999/xhtml", "a")
		, can_use_save_link = "download" in save_link
		, click = function(node) {
			var event = doc.createEvent("MouseEvents");
			event.initMouseEvent(
				"click", true, false, view, 0, 0, 0, 0, 0
				, false, false, false, false, 0, null
			);
			node.dispatchEvent(event);
		}
		, webkit_req_fs = view.webkitRequestFileSystem
		, req_fs = view.requestFileSystem || webkit_req_fs || view.mozRequestFileSystem
		, throw_outside = function(ex) {
			(view.setImmediate || view.setTimeout)(function() {
				throw ex;
			}, 0);
		}
		, force_saveable_type = "application/octet-stream"
		, fs_min_size = 0
		// See https://code.google.com/p/chromium/issues/detail?id=375297#c7 and
		// https://github.com/eligrey/FileSaver.js/commit/485930a#commitcomment-8768047
		// for the reasoning behind the timeout and revocation flow
		, arbitrary_revoke_timeout = 500 // in ms
		, revoke = function(file) {
			var revoker = function() {
				if (typeof file === "string") { // file is an object URL
					get_URL().revokeObjectURL(file);
				} else { // file is a File
					file.remove();
				}
			};
			if (view.chrome) {
				revoker();
			} else {
				setTimeout(revoker, arbitrary_revoke_timeout);
			}
		}
		, dispatch = function(filesaver, event_types, event) {
			event_types = [].concat(event_types);
			var i = event_types.length;
			while (i--) {
				var listener = filesaver["on" + event_types[i]];
				if (typeof listener === "function") {
					try {
						listener.call(filesaver, event || filesaver);
					} catch (ex) {
						throw_outside(ex);
					}
				}
			}
		}
		, FileSaver = function(blob, name) {
			// First try a.download, then web filesystem, then object URLs
			var
				  filesaver = this
				, type = blob.type
				, blob_changed = false
				, object_url
				, target_view
				, dispatch_all = function() {
					dispatch(filesaver, "writestart progress write writeend".split(" "));
				}
				// on any filesys errors revert to saving with object URLs
				, fs_error = function() {
					// don't create more object URLs than needed
					if (blob_changed || !object_url) {
						object_url = get_URL().createObjectURL(blob);
					}
					if (target_view) {
						target_view.location.href = object_url;
					} else {
						var new_tab = view.open(object_url, "_blank");
						if (new_tab == undefined && typeof safari !== "undefined") {
							//Apple do not allow window.open, see http://bit.ly/1kZffRI
							view.location.href = object_url
						}
					}
					filesaver.readyState = filesaver.DONE;
					dispatch_all();
					revoke(object_url);
				}
				, abortable = function(func) {
					return function() {
						if (filesaver.readyState !== filesaver.DONE) {
							return func.apply(this, arguments);
						}
					};
				}
				, create_if_not_found = {create: true, exclusive: false}
				, slice
			;
			filesaver.readyState = filesaver.INIT;
			if (!name) {
				name = "download";
			}
			if (can_use_save_link) {
				object_url = get_URL().createObjectURL(blob);
				save_link.href = object_url;
				save_link.download = name;
				click(save_link);
				filesaver.readyState = filesaver.DONE;
				dispatch_all();
				revoke(object_url);
				return;
			}
			// Object and web filesystem URLs have a problem saving in Google Chrome when
			// viewed in a tab, so I force save with application/octet-stream
			// http://code.google.com/p/chromium/issues/detail?id=91158
			// Update: Google errantly closed 91158, I submitted it again:
			// https://code.google.com/p/chromium/issues/detail?id=389642
			if (view.chrome && type && type !== force_saveable_type) {
				slice = blob.slice || blob.webkitSlice;
				blob = slice.call(blob, 0, blob.size, force_saveable_type);
				blob_changed = true;
			}
			// Since I can't be sure that the guessed media type will trigger a download
			// in WebKit, I append .download to the filename.
			// https://bugs.webkit.org/show_bug.cgi?id=65440
			if (webkit_req_fs && name !== "download") {
				name += ".download";
			}
			if (type === force_saveable_type || webkit_req_fs) {
				target_view = view;
			}
			if (!req_fs) {
				fs_error();
				return;
			}
			fs_min_size += blob.size;
			req_fs(view.TEMPORARY, fs_min_size, abortable(function(fs) {
				fs.root.getDirectory("saved", create_if_not_found, abortable(function(dir) {
					var save = function() {
						dir.getFile(name, create_if_not_found, abortable(function(file) {
							file.createWriter(abortable(function(writer) {
								writer.onwriteend = function(event) {
									target_view.location.href = file.toURL();
									filesaver.readyState = filesaver.DONE;
									dispatch(filesaver, "writeend", event);
									revoke(file);
								};
								writer.onerror = function() {
									var error = writer.error;
									if (error.code !== error.ABORT_ERR) {
										fs_error();
									}
								};
								"writestart progress write abort".split(" ").forEach(function(event) {
									writer["on" + event] = filesaver["on" + event];
								});
								writer.write(blob);
								filesaver.abort = function() {
									writer.abort();
									filesaver.readyState = filesaver.DONE;
								};
								filesaver.readyState = filesaver.WRITING;
							}), fs_error);
						}), fs_error);
					};
					dir.getFile(name, {create: false}, abortable(function(file) {
						// delete file if it already exists
						file.remove();
						save();
					}), abortable(function(ex) {
						if (ex.code === ex.NOT_FOUND_ERR) {
							save();
						} else {
							fs_error();
						}
					}));
				}), fs_error);
			}), fs_error);
		}
		, FS_proto = FileSaver.prototype
		, saveAs = function(blob, name) {
			return new FileSaver(blob, name);
		}
	;
	FS_proto.abort = function() {
		var filesaver = this;
		filesaver.readyState = filesaver.DONE;
		dispatch(filesaver, "abort");
	};
	FS_proto.readyState = FS_proto.INIT = 0;
	FS_proto.WRITING = 1;
	FS_proto.DONE = 2;

	FS_proto.error =
	FS_proto.onwritestart =
	FS_proto.onprogress =
	FS_proto.onwrite =
	FS_proto.onabort =
	FS_proto.onerror =
	FS_proto.onwriteend =
		null;

	return saveAs;
}(
	   typeof self !== "undefined" && self
	|| typeof window !== "undefined" && window
	|| this.content
));
// `self` is undefined in Firefox for Android content script context
// while `this` is nsIContentFrameMessageManager
// with an attribute `content` that corresponds to the window

if (typeof module !== "undefined" && module.exports) {
  module.exports = saveAs;
} else if ((typeof define !== "undefined" && define !== null) && (define.amd != null)) {
  define([], function() {
    return saveAs;
  });
}


/* SOURCE: midp/midp.js */
/* -*- Mode: JavaScript; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */



var MIDP = (function() {
  var deviceCanvas = document.getElementById("canvas");
  var deviceContext = deviceCanvas.getContext("2d");

  // The foreground isolate will get the user events (keypresses, etc.)
  var FG = (function() {
    var isolateId = -1;
    var displayId = -1;
    var isValid = false;

    function reset() {
      isValid = false;
    }

    function set(i, d) {
      isolateId = i;
      displayId = d;
      isValid = true;
    }

    function sendNativeEventToForeground(e, shouldIncludeDisplayId) {
      if (!isValid) {
        return;
      }

      if (shouldIncludeDisplayId) {
        e.intParam4 = displayId;
      }

      sendNativeEvent(e, isolateId);
    }

    function isFGDisplay(d) {
      return isValid && displayId === d;
    }

    function isFullscreen() {
      return !isValid || FullscreenInfo.isFullscreen(displayId);
    }

    return {
      reset: reset,
      set: set,
      sendNativeEventToForeground: sendNativeEventToForeground,
      isFullscreen: isFullscreen,
      isFGDisplay: isFGDisplay,
    }
  })();

  var FullscreenInfo = (function() {
    var map = new Map();

    function set(id, isFullscreen) {
      var oldVal = map.get(id);
      if (oldVal === isFullscreen) {
        return;
      }

      map.set(id, isFullscreen);
      if (FG.isFGDisplay(id)) {
        updateCanvas();
      }
    }

    function isFullscreen(id) {
      return (0 !== map.get(id));
    }

    return {
      set: set,
      isFullscreen: isFullscreen,
    }
  })();

  function updatePhysicalScreenSize() {
    if (!config.autosize || /no|0/.test(config.autosize)) {
      physicalScreenWidth = document.getElementById('display').clientWidth;
      physicalScreenHeight = document.getElementById('display').clientHeight;
    }
  }

  function updateCanvas() {
    var sidebar = document.getElementById("sidebar");
    var header = document.getElementById("drawer").querySelector("header");
    var isFullscreen = FG.isFullscreen();
    sidebar.style.display = header.style.display =
        isFullscreen ? "none" : "block";
    var headerHeight = isFullscreen ? 0 : header.offsetHeight;
    var newHeight = physicalScreenHeight - headerHeight;
    var newWidth = physicalScreenWidth;

    if (newHeight != deviceCanvas.height || newWidth != deviceCanvas.width) {
      deviceCanvas.height = newHeight;
      deviceCanvas.width = newWidth;
      deviceCanvas.style.height = deviceCanvas.height + "px";
      deviceCanvas.style.width = deviceCanvas.width + "px";
      deviceCanvas.style.top = headerHeight + "px";
      deviceCanvas.dispatchEvent(new Event("canvasresize"));
    }
  };

  function onWindowResize(evt) {
    var newPhysicalScreenWidth = window.frameElement ? window.innerWidth : window.outerWidth - horizontalChrome;
    var newPhysicalScreenHeight = window.frameElement ? window.innerHeight : window.outerHeight - verticalChrome;

    if (newPhysicalScreenWidth != physicalScreenWidth || newPhysicalScreenHeight != physicalScreenHeight) {
      physicalScreenWidth = newPhysicalScreenWidth;
      physicalScreenHeight = newPhysicalScreenHeight;
      lastWindowInnerHeight = window.innerHeight;
      updateCanvas();
    } else if (lastWindowInnerHeight != window.innerHeight) {
      lastWindowInnerHeight = window.innerHeight;
      sendVirtualKeyboardEvent();
    } else {
      console.warn("Unhandled resize event!");
    }
  };

  var manifest = {};

  Native["com/sun/midp/lcdui/DisplayDevice.setFullScreen0.(IIZ)V"] = function(addr, hardwareId, displayId, mode) {
    FullscreenInfo.set(displayId, mode);
  };

  Native["com/sun/midp/log/LoggingBase.report.(IILjava/lang/String;)V"] =
  function(addr, severity, channelID, messageAddr) {
    console.info(J2ME.fromStringAddr(messageAddr));
  };

  Native["com/sun/midp/midlet/MIDletPeer.platformRequest.(Ljava/lang/String;)Z"] = function(addr, requestAddr) {
    request = J2ME.fromStringAddr(requestAddr);
    if (request.startsWith("http://") || request.startsWith("https://")) {
      if (request.endsWith(".jad")) {
        // The download will start after the MIDlet has terminated its execution.
        pendingMIDletUpdate = request;
        return 1;
      } else {
        DumbPipe.close(DumbPipe.open("windowOpen", request));
      }
    } else if (request.startsWith("x-contacts:add?")) {
      var params = {};

      var args = request.substring(request.indexOf("?") + 1).split("&");
      args.forEach(function(arg) {
        var numberIdx = arg.indexOf("number=");
        if (numberIdx != -1) {
          params.tel = arg.substring(numberIdx + 7);
        }
      });

      DumbPipe.close(DumbPipe.open("mozActivity", {
        name: "new",
        data: {
          type: "webcontacts/contact",
          params: params,
        },
      }));
    } else {
      console.warn("com/sun/midp/main/CldcPlatformRequest.dispatchPlatformRequest.(Ljava/lang/String;)Z not implemented for: " + request);
    }

    return 0;
  };

  Native["com/sun/midp/main/CommandState.restoreCommandState.(Lcom/sun/midp/main/CommandState;)V"] =
  function(addr, stateAddr) {
    var state = getHandle(stateAddr);
    var suiteId = (config.midletClassName === "internal") ? -1 : 1;
    state.suiteId = suiteId;
    state.midletClassName = J2ME.newString(config.midletClassName);
    var args = config.args;
    state.arg0 = J2ME.newString((args.length > 0) ? args[0] : "");
    state.arg1 = J2ME.newString((args.length > 1) ? args[1] : "");
    state.arg2 = J2ME.newString((args.length > 2) ? args[2] : "");
  };

  Native["com/sun/midp/main/MIDletSuiteUtils.getIsolateId.()I"] = function(addr) {
    return $.ctx.runtime.isolateId;
  };

  var AMS = (function() {
    var isolateId = -1;

    function set(id) {
      isolateId = id;
    }

    function reset() {
      isolateId = -1;
    }

    function get() {
      return isolateId;
    }

    function isAMSIsolate(id) {
      return (id === isolateId);
    }

    function sendNativeEventToAMSIsolate(e) {
      if (-1 === isolateId) {
        console.warn("Dropping native event sent to AMS isolate");
        return;
      }

      sendNativeEvent(e, isolateId);
    }

    return {
      set: set,
      get: get,
      reset: reset,
      isAMSIsolate: isAMSIsolate,
      sendNativeEventToAMSIsolate: sendNativeEventToAMSIsolate,
    }
  })();

  Native["com/sun/midp/main/MIDletSuiteUtils.registerAmsIsolateId.()V"] = function(addr) {
    AMS.set($.ctx.runtime.isolateId);
  };

  Native["com/sun/midp/main/MIDletSuiteUtils.getAmsIsolateId.()I"] = function(addr) {
    return AMS.get();
  };

  Native["com/sun/midp/main/MIDletSuiteUtils.isAmsIsolate.()Z"] = function(addr) {
    return AMS.isAMSIsolate($.ctx.runtime.isolateId) ? 1 : 0;
  };

  // This function is called before a MIDlet is created (in MIDletStateListener::midletPreStart).
  var loadingMIDletPromisesResolved = false;
  Native["com/sun/midp/main/MIDletSuiteUtils.vmBeginStartUp.(I)V"] = function(addr, midletIsolateId) {
    if (loadingMIDletPromisesResolved) {
      return;
    }

    loadingMIDletPromisesResolved = true;

    asyncImpl("V", Promise.all(loadingMIDletPromises));
  };

  Native["com/sun/midp/main/MIDletSuiteUtils.vmEndStartUp.(I)V"] = function(addr, midletIsolateId) {
  };

  Native["com/sun/midp/main/Configuration.getProperty0.(Ljava/lang/String;)Ljava/lang/String;"] =
  function(addr, keyAddr) {
    var key = J2ME.fromStringAddr(keyAddr);
    var value;
    switch (key) {
      case "com.sun.midp.publickeystore.WebPublicKeyStore":
        if (config.midletClassName == "RunTestsMIDlet" ||
            config.midletClassName.startsWith("benchmark")) {
          value = "_test.ks";
        } else {
          value = "_main.ks";
        }
        break;
      case "com.sun.midp.events.dispatchTableInitSize":
        value = "71";
        break;
      case "microedition.locale":
        value = navigator.language;
        break;
      case "datagram":
        value = "com.sun.midp.io.j2me.datagram.ProtocolPushImpl";
        break;
      case "com.sun.midp.io.j2me.socket.buffersize":
        value = null;
        break;
      case "com.sun.midp.io.http.proxy":
        value = null;
        break;
      case "com.sun.midp.io.http.force_non_persistent":
        value = null;
        break;
      case "com.sun.midp.io.http.max_persistent_connections":
        value = null;
        break;
      case "com.sun.midp.io.http.persistent_connection_linger_time":
        value = null;
        break;
      case "com.sun.midp.io.http.input_buffer_size":
        value = null;
        break;
      case "com.sun.midp.io.http.output_buffer_size":
        value = null;
        break;
      default:
        console.warn("UNKNOWN PROPERTY (com/sun/midp/main/Configuration): " + key);
        value = null;
        break;
    }
    return J2ME.newString(value);
  };

  Native["com/sun/midp/util/ResourceHandler.loadRomizedResource0.(Ljava/lang/String;)[B"] = function(addr, fileAddr) {
    var fileName = "assets/0/" +
                   J2ME.fromStringAddr(fileAddr).replace("_", ".").replace("_png", ".png").replace("_raw", ".raw");
    var data = JARStore.loadFile(fileName);
    if (!data) {
      console.warn("ResourceHandler::loadRomizedResource0: file " + fileName + " not found");
      return J2ME.Constants.NULL;
    }
    var len = data.byteLength;
    var arrayAddr = J2ME.newByteArray(len);
    var array = J2ME.getArrayFromAddr(arrayAddr);
    for (var n = 0; n < len; ++n) {
      array[n] = data[n];
    }
    return arrayAddr;
  };

  var verticalChrome;
  var horizontalChrome;
  var physicalScreenWidth;
  var physicalScreenHeight;
  var lastWindowInnerHeight;
  var isVKVisible;

  if (config.autosize && !/no|0/.test(config.autosize)) {
    document.documentElement.classList.add('autosize');

    // Chrome amounts:
    //   The difference between the outer[Height|Width] and the actual
    //   amount of space we have available. So far, horizontalChrome is
    //   always 0 and verticalChrome is always the size of the status bar,
    //   which has been 30px in testing. These are assumed to be static
    //   throughout the lifetime of the app, and things will break if that
    //   assumption is violated.
    verticalChrome = window.outerHeight - window.innerHeight;
    horizontalChrome = window.outerWidth - window.innerWidth;

    // "Physical" dimensions:
    //   The amount of space available to J2ME. This is always the
    //   outer[Height|Width] minus the [vertical|horizontal]Chrome amount.
    //
    //   Note that these values will not always equal the size of our window.
    //   Specifically, when the FxOS keyboard is visible, the window shrinks,
    //   so `window.inner[Height|Width]` will be
    //   smaller than these values. J2ME apps expect that the keyboard
    //   overlaps the window rather than squishing it, so we simulate that
    //   by keeping track of these "physical" values.
    //
    //   Note also that these values do not take into account the size of
    //   the header, which might shrink our canvas. To find out how much
    //   space is actually available to the current MIDlet, check
    //   `document.getElementById("canvas").[width|height]`.
    physicalScreenWidth = window.outerWidth - horizontalChrome;
    physicalScreenHeight = window.outerHeight - verticalChrome;

    // Cached value of `window.innerHeight` so that we can tell when it
    // changes. This is useful for determining when to send keyboard
    // visibility events.
    lastWindowInnerHeight = window.innerHeight;

    updateCanvas();
    isVKVisible = function() {
      var expectedHeightWithNoKeyboard = window.outerHeight - verticalChrome;
      if (window.innerHeight == expectedHeightWithNoKeyboard) {
        return false;
      } else if (window.innerHeight < expectedHeightWithNoKeyboard) {
        return true;
      } else {
        console.warn("window is taller than expected in isVKVisible!");
        return false;
      }
    };
    window.addEventListener("resize", onWindowResize);
  } else {
    document.documentElement.classList.add('debug-mode');
    physicalScreenWidth = document.getElementById('display').clientWidth;
    physicalScreenHeight = document.getElementById('display').clientHeight;

    updateCanvas();
    isVKVisible = function() {
      return false;
    };
  }

  function sendPenEvent(pt, whichType) {
    FG.sendNativeEventToForeground({
      type: PEN_EVENT,
      intParam1: whichType,
      intParam2: pt.x,
      intParam3: pt.y,
    }, true);
  }

  function sendGestureEvent(pt, distancePt, whichType, aFloatParam1, aIntParam7, aIntParam8, aIntParam9) {
    FG.sendNativeEventToForeground({
      type: GESTURE_EVENT,
      intParam1: whichType,
      intParam2: distancePt && distancePt.x || 0,
      intParam3: distancePt && distancePt.y || 0,
      intParam5: pt.x,
      intParam6: pt.y,
      floatParam1: Math.fround(aFloatParam1 || 0.0),
      intParam7: aIntParam7 || 0,
      intParam8: aIntParam8 || 0,
      intParam9: aIntParam9 || 0,
      intParam10: 0,
      intParam11: 0,
      intParam12: 0,
      intParam13: 0,
      intParam14: 0,
      intParam15: 0,
      intParam16: 0
    }, true);
  }

  // In the simulator and on device, use touch events; in desktop
  // mode, we must use mouse events (unless you enable touch events
  // in devtools).
  var supportsTouch = ("ontouchstart" in document.documentElement);

  // Cache the canvas position for future computation.
  var canvasRect = deviceCanvas.getBoundingClientRect();
  deviceCanvas.addEventListener("canvasresize", function() {
    canvasRect = deviceCanvas.getBoundingClientRect();
    sendRotationEvent();
  });

  function getEventPoint(event) {
    var item = ((event.touches && event.touches[0]) || // touchstart, touchmove
        (event.changedTouches && event.changedTouches[0]) || // touchend
        event); // mousedown, mouseup, mousemove
    return {
      x: item.pageX - (canvasRect.left | 0),
      y: item.pageY - (canvasRect.top | 0)
    };
  }

  // Input Handling: Some MIDlets (usually older ones) respond to
  // "pen" events; others respond to "gesture" events. We must fire
  // both. A distance threshold ensures that touches with an "intent
  // to tap" will likely result in a tap.

  var LONG_PRESS_TIMEOUT = 1000;
  var MIN_DRAG_DISTANCE_SQUARED = 5 * 5;
  var mouseDownInfo = null;
  var longPressTimeoutID = null;
  var longPressDetected = false;

  deviceCanvas.addEventListener(supportsTouch ? "touchstart" : "mousedown", function(event) {
    event.preventDefault(); // Prevent unnecessary fake mouse events.
    var pt = getEventPoint(event);
    sendPenEvent(pt, PRESSED);
    mouseDownInfo = pt;

    longPressDetected = false;
    longPressTimeoutID = setTimeout(function() {
      longPressDetected = true;
      sendGestureEvent(pt, null, GESTURE_LONG_PRESS);
    }, LONG_PRESS_TIMEOUT);
  });

  deviceCanvas.addEventListener(supportsTouch ? "touchmove" : "mousemove", function(event) {
    if (!mouseDownInfo) {
      return; // Mousemove on desktop; ignored.
    }
    event.preventDefault();

    if (longPressTimeoutID) {
      clearTimeout(longPressTimeoutID);
      longPressTimeoutID = null;
    }

    var pt = getEventPoint(event);
    sendPenEvent(pt, DRAGGED);
    var distance = {
      x: pt.x - mouseDownInfo.x,
      y: pt.y - mouseDownInfo.y
    };
    // If this gesture is dragging, or we've moved a substantial
    // amount since the original "down" event, begin or continue a
    // drag event. Using squared distance to avoid needing sqrt.
    if (mouseDownInfo.isDragging || (distance.x * distance.x + distance.y * distance.y > MIN_DRAG_DISTANCE_SQUARED)) {
      mouseDownInfo.isDragging = true;
      mouseDownInfo.x = pt.x;
      mouseDownInfo.y = pt.y;
      if (!longPressDetected) {
        sendGestureEvent(pt, distance, GESTURE_DRAG);
      }
    }

    // Just store the dragging event info here, then calc the speed and
    // determine whether the gesture is GESTURE_DROP or GESTURE_FLICK in
    // the mouseup event listener.
    if (!mouseDownInfo.draggingPts) {
      mouseDownInfo.draggingPts = [];
    }

    // Only store the latest two drag events.
    if (mouseDownInfo.draggingPts.length > 1) {
      mouseDownInfo.draggingPts.shift();
    }

    mouseDownInfo.draggingPts.push({
      pt: getEventPoint(event),
      time: new Date().getTime()
    });
  });

  function calcFlickSpeed() {
    var currentDragPT = mouseDownInfo.draggingPts[1];
    var lastDragPT = mouseDownInfo.draggingPts[0];

    var deltaX = currentDragPT.pt.x - lastDragPT.pt.x;
    var deltaY = currentDragPT.pt.y - lastDragPT.pt.y;
    var deltaTimeInMs = currentDragPT.time - lastDragPT.time;

    var speedX = Math.round(deltaX * 1000 / deltaTimeInMs);
    var speedY = Math.round(deltaY * 1000 / deltaTimeInMs);
    var speed  = Math.round(Math.sqrt(speedX * speedX + speedY * speedY));

    var direction = 0;
    if (deltaX >= 0 && deltaY >=0) {
      direction = Math.atan(deltaY / deltaX);
    } else if (deltaX < 0 && deltaY >= 0) {
      direction = Math.PI + Math.atan(deltaY / deltaX);
    } else if (deltaX < 0 && deltaY < 0) {
      direction = Math.atan(deltaY / deltaX) - Math.PI;
    } else if (deltaX >= 0 && deltaY < 0) {
      direction = Math.atan(deltaY / deltaX);
    }

    return {
      direction: direction,
      speed: speed,
      speedX: speedX,
      speedY: speedY
    };
  }

  // The end listener goes on `document` so that we properly detect touchend/mouseup anywhere.
  document.addEventListener(supportsTouch ? "touchend" : "mouseup", function(event) {
    if (!mouseDownInfo) {
      return; // Touchstart wasn't on the canvas.
    }
    event.preventDefault();

    if (longPressTimeoutID) {
      clearTimeout(longPressTimeoutID);
      longPressTimeoutID = null;
    }

    var pt = getEventPoint(event);
    sendPenEvent(pt, RELEASED);

    if (!longPressDetected) {
      if (mouseDownInfo.isDragging) {
        if (mouseDownInfo.draggingPts && mouseDownInfo.draggingPts.length == 2) {
          var deltaTime = new Date().getTime() - mouseDownInfo.draggingPts[1].time;
          var flickSpeed = calcFlickSpeed();
          // On the real Nokia device, if user touch on the screen and
          // move the finger, then stop moving for a while and lift
          // the finger, it will trigger a normal GESTURE_DROP instead
          // of GESTURE_FLICK event, so let's check if the time gap
          // between touchend event and the last touchmove event is
          // larger than a threshold.
          if (deltaTime > 300 || flickSpeed.speed == 0) {
            sendGestureEvent(pt, null, GESTURE_DROP);
          } else {
            sendGestureEvent(pt, null, GESTURE_FLICK,
                             flickSpeed.direction,
                             flickSpeed.speed,
                             flickSpeed.speedX,
                             flickSpeed.speedY);
          }
        } else {
          sendGestureEvent(pt, null, GESTURE_DROP);
        }
      } else {
        sendGestureEvent(pt, null, GESTURE_TAP);
      }
    }

    mouseDownInfo = null; // Clear the way for the next gesture.
  });

  Native["com/sun/midp/midletsuite/MIDletSuiteStorage.suiteIdToString.(I)Ljava/lang/String;"] = function(addr, id) {
    return J2ME.newString(id.toString());
  };

  Native["com/sun/midp/midletsuite/MIDletSuiteStorage.getMidletSuiteStorageId.(I)I"] = function(addr, suiteId) {
    // We should be able to use the same storage ID for all MIDlet suites.
    return 0; // storageId
  };

  Native["com/sun/midp/midletsuite/MIDletSuiteImpl.lockMIDletSuite.(IZ)V"] = function(addr, id, lock) {
    console.warn("MIDletSuiteImpl.lockMIDletSuite.(IZ)V not implemented (" + id + ", " + lock + ")");
  };

  Native["com/sun/midp/midletsuite/MIDletSuiteImpl.unlockMIDletSuite.(I)V"] = function(addr, suiteId) {
    console.warn("MIDletSuiteImpl.unlockMIDletSuite.(I)V not implemented (" + suiteId + ")");
  };

  Native["com/sun/midp/midletsuite/InstallInfo.load.()V"] = function(addr) {
    var self = getHandle(addr);
    // The MIDlet has to be trusted for opening SSL connections using port 443.
    self.trusted = 1;
    console.warn("com/sun/midp/midletsuite/InstallInfo.load.()V incomplete");
  };

  Native["com/sun/midp/midletsuite/SuiteProperties.load.()[Ljava/lang/String;"] = function(addr) {
    var keys = Object.keys(manifest);
    var arrAddr = J2ME.newStringArray(keys.length * 2);
    J2ME.setUncollectable(arrAddr);
    var arr = J2ME.getArrayFromAddr(arrAddr);
    var i = 0;
    keys.forEach(function(key) {
      arr[i++] = J2ME.newString(key);
      arr[i++] = J2ME.newString(manifest[key]);
    });
    J2ME.unsetUncollectable(arrAddr);
    return arrAddr;
  };

  Native["javax/microedition/lcdui/SuiteImageCacheImpl.loadAndCreateImmutableImageDataFromCache0.(Ljavax/microedition/lcdui/ImageData;ILjava/lang/String;)Z"] =
  function(addr, imageDataAddr, suiteId, fileNameAddr) {
    // We're not implementing the cache because looks like it isn't used much.
    // In a MIDlet I've been testing for a few minutes, there's been only one hit.
    return 0;
  };

  var interIsolateMutexes = [];
  var lastInterIsolateMutexID = -1;

  Native["com/sun/midp/util/isolate/InterIsolateMutex.getID0.(Ljava/lang/String;)I"] = function(addr, mutexNameAddr) {
    var name = J2ME.fromStringAddr(mutexNameAddr);

    var mutex;
    for (var i = 0; i < interIsolateMutexes.length; i++) {
      if (interIsolateMutexes[i].name === name) {
        mutex = interIsolateMutexes[i];
      }
    }

    if (!mutex) {
      mutex = {
        name: name,
        id: ++lastInterIsolateMutexID,
        locked: false,
        waiting: [],
      };
      interIsolateMutexes.push(mutex);
    }

    return mutex.id;
  };

  Native["com/sun/midp/util/isolate/InterIsolateMutex.lock0.(I)V"] = function(addr, id) {
    var ctx = $.ctx;
    var isolateId = $.ctx.runtime.isolateId;

    var mutex;
    for (var i = 0; i < interIsolateMutexes.length; i++) {
      if (interIsolateMutexes[i].id == id) {
        mutex = interIsolateMutexes[i];
        break;
      }
    }

    if (!mutex) {
      throw $.newIllegalStateException("Invalid mutex ID");
    }

    if (!mutex.locked) {
      mutex.locked = true;
      mutex.holder = isolateId;
      return;
    }

    if (mutex.holder == isolateId) {
      throw $.newRuntimeException("Attempting to lock mutex twice within the same Isolate");
    }

    asyncImpl("V", new Promise(function(resolve, reject) {
      mutex.waiting.push(function() {
        mutex.locked = true;
        mutex.holder = isolateId;
        resolve();
      });
    }));
  };

  Native["com/sun/midp/util/isolate/InterIsolateMutex.unlock0.(I)V"] = function(addr, id) {
    var isolateId = $.ctx.runtime.isolateId;
    var mutex;
    for (var i = 0; i < interIsolateMutexes.length; i++) {
      if (interIsolateMutexes[i].id == id) {
        mutex = interIsolateMutexes[i];
        break;
      }
    }

    if (!mutex) {
      throw $.newIllegalStateException("Invalid mutex ID");
    }

    if (!mutex.locked) {
      throw $.newRuntimeException("Mutex is not locked");
    }

    if (mutex.holder !== isolateId) {
      throw $.newRuntimeException("Mutex is locked by different Isolate");
    }

    mutex.locked = false;

    var firstWaiting = mutex.waiting.shift();
    if (firstWaiting) {
      firstWaiting();
    }
  };

  function exit(code) {
    $.stop();
    DumbPipe.open("exit", null, function(message) {});
    showExitScreen();
  }

  // If the user kills the app willingly, we will close it.
  // In some cases instead we want to kill the FG MIDlet only
  // to restart it.
  var destroyedForRestart = false;
  function setDestroyedForRestart(val) {
    destroyedForRestart = val;
  }

  var destroyedListener = null;
  function registerDestroyedListener(func) {
    destroyedListener = func;
  }

  var pendingMIDletUpdate = null;
  Native["com/sun/cldc/isolate/Isolate.stop.(II)V"] = function(addr, code, reason) {
    // XXX According to Isolate.java, Isolate.id() should return -1 if an
    // isolate has been terminated, so we should set this._id to -1 here.

    // XXX Other com/sun/cldc/isolate/Isolate natives are in native.js.
    // We should move this one there or those here.

    if (destroyedForRestart) {
      destroyedForRestart = false;
      if (destroyedListener) {
        destroyedListener();
      }
      FG.reset();
      return;
    }

    var isolateId = $.ctx.runtime.isolateId;
    console.info("Isolate " + isolateId + " stops with code " + code + " and reason " + reason);

    if (AMS.isAMSIsolate(isolateId)) {
      AMS.reset();
    }

    if (!pendingMIDletUpdate) {
      exit();
      return;
    }

    // Perform updating.
    performDownload(pendingMIDletUpdate, function(data) {
      Promise.all([
        JARStore.installJAR("midlet.jar", data.jarData, data.jadData),
        CompiledMethodCache.clear(),
      ]).then(function() {
        pendingMIDletUpdate = null;
        DumbPipe.close(DumbPipe.open("alert", "Update completed!"));
        DumbPipe.close(DumbPipe.open("reload", {}));
      });
    });
  };

  var nativeEventQueues = {};
  var waitingNativeEventQueue = {};

  function copyEvent(e, obj) {
    obj.type = e.type || 0;
    obj.intParam1 = e.intParam1 || 0;
    obj.intParam2 = e.intParam2 || 0;
    obj.intParam3 = e.intParam3 || 0;
    obj.intParam4 = e.intParam4 || 0;
    obj.intParam5 = e.intParam5 || 0;
    obj.intParam6 = e.intParam6 || 0;
    obj.intParam7 = e.intParam7 || 0;
    obj.intParam8 = e.intParam8 || 0;
    obj.intParam9 = e.intParam9 || 0;
    obj.intParam10 = e.intParam10 || 0;
    obj.intParam11 = e.intParam11 || 0;
    obj.intParam12 = e.intParam12 || 0;
    obj.intParam13 = e.intParam13 || 0;
    obj.intParam14 = e.intParam14 || 0;
    obj.intParam15 = e.intParam15 || 0;
    obj.intParam16 = e.intParam16 || 0;
    obj.floatParam1 = e.floatParam1 || 0.0;
    obj.stringParam1 = J2ME.newString(e.stringParam1);
    obj.stringParam2 = J2ME.newString(e.stringParam2);
    obj.stringParam3 = J2ME.newString(e.stringParam3);
    obj.stringParam4 = J2ME.newString(e.stringParam4);
    obj.stringParam5 = J2ME.newString(e.stringParam5);
    obj.stringParam6 = J2ME.newString(e.stringParam6);
  }

  function sendNativeEvent(e, isolateId) {
    var elem = waitingNativeEventQueue[isolateId];
    if (!elem) {
      nativeEventQueues[isolateId].push(e);
      return;
    }

    copyEvent(e, elem.nativeEvent);
    elem.resolve(nativeEventQueues[isolateId].length);

    delete waitingNativeEventQueue[isolateId];
  }

  function sendVirtualKeyboardEvent() {
    FG.sendNativeEventToForeground({
      type: VIRTUAL_KEYBOARD_EVENT,
      intParam1: 0,
      intParam2: 0,
      intParam3: 0,
    }, true);
  }

  function sendRotationEvent() {
    FG.sendNativeEventToForeground({
      type: ROTATION_EVENT,
      intParam1: 0,
      intParam2: 0,
      intParam3: 0,
    }, true);
  }

  function sendCommandEvent(id) {
    FG.sendNativeEventToForeground({
      type: COMMAND_EVENT,
      intParam1: id,
      intParam2: 0,
      intParam3: 0,
    }, true);
  }

  function sendEndOfMediaEvent(pId, duration) {
    FG.sendNativeEventToForeground({
      type: MMAPI_EVENT,
      intParam1: pId,
      intParam2: duration,
      intParam3: 0,
      intParam4: Media.EVENT_MEDIA_END_OF_MEDIA
    }, false);
  }

  function sendMediaSnapshotFinishedEvent(pId) {
    FG.sendNativeEventToForeground({
      type: MMAPI_EVENT,
      intParam1: pId,
      intParam2: 0,
      intParam3: 0,
      intParam4: Media.EVENT_MEDIA_SNAPSHOT_FINISHED,
    }, false);
  }

  function sendExecuteMIDletEvent(midletNumber, midletClassName) {
    AMS.sendNativeEventToAMSIsolate({
      type: NATIVE_MIDLET_EXECUTE_REQUEST,
      intParam1: midletNumber || fgMidletNumber,
      stringParam1: midletClassName || fgMidletClass,
    });
  }

  function sendDestroyMIDletEvent(midletClassName) {
    FG.sendNativeEventToForeground({
      type: DESTROY_MIDLET_EVENT,
      stringParam1: midletClassName,
    }, false);
  }

  var KEY_EVENT = 1;
  var PEN_EVENT = 2;
  var PRESSED = 1;
  var RELEASED = 2;
  var DRAGGED = 3;
  var COMMAND_EVENT = 3;
  var NATIVE_MIDLET_EXECUTE_REQUEST = 36;
  var DESTROY_MIDLET_EVENT = 14;
  var EVENT_QUEUE_SHUTDOWN = 31;
  var ROTATION_EVENT = 43;
  var MMAPI_EVENT = 45;
  var VIRTUAL_KEYBOARD_EVENT = 58;
  var GESTURE_EVENT = 71;
  var GESTURE_TAP = 0x1;
  var GESTURE_LONG_PRESS = 0x2;
  var GESTURE_DRAG = 0x4;
  var GESTURE_DROP = 0x8;
  var GESTURE_FLICK = 0x10;
  var GESTURE_LONG_PRESS_REPEATED = 0x20;
  var GESTURE_PINCH = 0x40;
  var GESTURE_DOUBLE_TAP = 0x80;
  var GESTURE_RECOGNITION_START = 0x4000;
  var GESTURE_RECOGNITION_END = 0x8000;

  var suppressKeyEvents = false;

  function sendKeyPress(keyCode) {
    if (!suppressKeyEvents) {
      FG.sendNativeEventToForeground({
        type: KEY_EVENT,
        intParam1: PRESSED,
        intParam2: keyCode,
        intParam3: 0
      }, true);
    }
  }

  function sendKeyRelease(keyCode) {
    if (!suppressKeyEvents) {
      FG.sendNativeEventToForeground({
        type: KEY_EVENT,
        intParam1: RELEASED,
        intParam2: keyCode,
        intParam3: 0,
      }, true);
    }
  };

  window.addEventListener("keydown", function(ev) {
    sendKeyPress(ev.which);
  });

  window.addEventListener("keyup", function(ev) {
    sendKeyRelease(ev.which);
  });

  Native["com/sun/midp/events/EventQueue.getNativeEventQueueHandle.()I"] = function(addr) {
    return 0;
  };

  Native["com/sun/midp/events/EventQueue.resetNativeEventQueue.()V"] = function(addr) {
    nativeEventQueues[$.ctx.runtime.isolateId] = [];
  };

  Native["com/sun/midp/events/EventQueue.sendNativeEventToIsolate.(Lcom/sun/midp/events/NativeEvent;I)V"] =
    function(addr, eventAddr, isolateId) {
      var e = getHandle(eventAddr);

      var obj = {
        type: e.type,
        intParam1: e.intParam1,
        intParam2: e.intParam2,
        intParam3: e.intParam3,
        intParam4: e.intParam4,
        intParam5: e.intParam5,
        intParam6: e.intParam6,
        intParam7: e.intParam7,
        intParam8: e.intParam8,
        intParam9: e.intParam9,
        intParam10: e.intParam10,
        intParam11: e.intParam11,
        intParam12: e.intParam12,
        intParam13: e.intParam13,
        intParam14: e.intParam14,
        intParam15: e.intParam15,
        intParam16: e.intParam16,
        floatParam1: e.floatParam1,
        stringParam1: J2ME.fromStringAddr(e.stringParam1),
        stringParam2: J2ME.fromStringAddr(e.stringParam2),
        stringParam3: J2ME.fromStringAddr(e.stringParam3),
        stringParam4: J2ME.fromStringAddr(e.stringParam4),
        stringParam5: J2ME.fromStringAddr(e.stringParam5),
        stringParam6: J2ME.fromStringAddr(e.stringParam6),
      };

      sendNativeEvent(obj, isolateId);
    };

  Native["com/sun/midp/events/NativeEventMonitor.waitForNativeEvent.(Lcom/sun/midp/events/NativeEvent;)I"] =
    function(addr, eventAddr) {
      var event = getHandle(eventAddr);
      var isolateId = $.ctx.runtime.isolateId;
      var nativeEventQueue = nativeEventQueues[isolateId];

      if (nativeEventQueue.length !== 0) {
        copyEvent(nativeEventQueue.shift(), event);
        return nativeEventQueue.length;
      }

      asyncImpl("I", new Promise(function(resolve, reject) {
        waitingNativeEventQueue[isolateId] = {
          resolve: resolve,
          nativeEvent: event,
        };
      }));
    };

  Native["com/sun/midp/events/NativeEventMonitor.readNativeEvent.(Lcom/sun/midp/events/NativeEvent;)Z"] =
    function(addr, eventAddr) {
      var isolateId = $.ctx.runtime.isolateId;
      var nativeEventQueue = nativeEventQueues[isolateId];
      if (!nativeEventQueue.length) {
        return 0;
      }
      var event = getHandle(eventAddr);
      copyEvent(nativeEventQueue.shift(), event);
      return 1;
    };

  var localizedStrings;

  Native["com/sun/midp/l10n/LocalizedStringsBase.getContent.(I)Ljava/lang/String;"] = function(addr, id) {
    if (!MIDP.localizedStrings) {
      var data = JARStore.loadFileFromJAR("java/classes.jar", "l10n/" + (config.language || navigator.language) + ".json");
      if (!data) {
        // Fallback to English
        data = JARStore.loadFileFromJAR("java/classes.jar", "l10n/en-US.json");

        if (!data) {
          throw $.newIOException();
        }
      }

      MIDP.localizedStrings = JSON.parse(util.decodeUtf8(data));
    }

    var value = MIDP.localizedStrings[id];

    if (!value) {
      throw $.newIllegalStateException("String with ID (" + id + ") doesn't exist");
    }

    return J2ME.newString(value);
  };

  Native["javax/microedition/lcdui/Display.drawTrustedIcon0.(IZ)V"] = function(addr, dispId, drawTrusted) {
    console.warn("Display.drawTrustedIcon0.(IZ)V not implemented (" + dispId + ", " + drawTrusted + ")");
  };

  Native["com/sun/midp/events/EventQueue.sendShutdownEvent.()V"] = function(addr) {
    sendNativeEvent({ type: EVENT_QUEUE_SHUTDOWN }, $.ctx.runtime.isolateId);
  };

  addUnimplementedNative("com/sun/midp/main/CommandState.saveCommandState.(Lcom/sun/midp/main/CommandState;)V");

  Native["com/sun/midp/main/CommandState.exitInternal.(I)V"] = function(addr, status) {
    console.info("Exit: " + status);
    exit();
  };

  Native["com/sun/midp/suspend/SuspendSystem$MIDPSystem.allMidletsKilled.()Z"] = function(addr) {
    console.warn("SuspendSystem$MIDPSystem.allMidletsKilled.()Z not implemented");
    return 0;
  };

  /* We don't care about the system keys SELECT,
     SOFT_BUTTON1, SOFT_BUTTON2, DEBUG_TRACE1, CLAMSHELL_OPEN, CLAMSHELL_CLOSE,
     but we do care about SYSTEM_KEY_CLEAR, so send it when the delete key is pressed.
     */

  var SYSTEM_KEY_POWER = 1;
  var SYSTEM_KEY_SEND = 2;
  var SYSTEM_KEY_END = 3;
  var SYSTEM_KEY_CLEAR = 4;

  var systemKeyMap = {
    8: SYSTEM_KEY_CLEAR, // Backspace
    112: SYSTEM_KEY_POWER, // F1
    116: SYSTEM_KEY_SEND, // F5
    114: SYSTEM_KEY_END, // F3
  };

  Native["javax/microedition/lcdui/KeyConverter.getSystemKey.(I)I"] = function(addr, key) {
    return systemKeyMap[key] || 0;
  };

  var keyMap = {
    1: 119, // UP
    2: 97, // LEFT
    5: 100, // RIGHT
    6: 115, // DOWN
    8: 32, // FIRE
    9: 113, // GAME_A
    10: 101, // GAME_B
    11: 122, // GAME_C
    12: 99, // GAME_D
  };

  Native["javax/microedition/lcdui/KeyConverter.getKeyCode.(I)I"] = function(addr, key) {
    return keyMap[key] || 0;
  };

  var keyNames = {
    119: "Up",
    97: "Left",
    100: "Right",
    115: "Down",
    32: "Select",
    113: "Calendar",
    101: "Addressbook",
    122: "Menu",
    99: "Mail",
  };

  Native["javax/microedition/lcdui/KeyConverter.getKeyName.(I)Ljava/lang/String;"] = function(addr, keyCode) {
    return J2ME.newString((keyCode in keyNames) ? keyNames[keyCode] : String.fromCharCode(keyCode));
  };

  var gameKeys = {
    119: 1,  // UP
    97: 2,   // LEFT
    115: 6,  // DOWN
    100: 5,  // RIGHT
    32: 8,   // FIRE
    113: 9,  // GAME_A
    101: 10, // GAME_B
    122: 11, // GAME_C
    99: 12   // GAME_D
  };

  Native["javax/microedition/lcdui/KeyConverter.getGameAction.(I)I"] = function(addr, keyCode) {
    return gameKeys[keyCode] || 0;
  };

  Native["javax/microedition/lcdui/game/GameCanvas.setSuppressKeyEvents.(Ljavax/microedition/lcdui/Canvas;Z)V"] =
  function(addr, canvasAddr, shouldSuppress) {
    suppressKeyEvents = shouldSuppress;
  };

  Native["com/sun/midp/main/MIDletProxyList.resetForegroundInNativeState.()V"] = function(addr) {
    FG.reset();
  };

  Native["com/sun/midp/main/MIDletProxyList.setForegroundInNativeState.(II)V"] = function(addr, isolateId, dispId) {
    FG.set(isolateId, dispId);
  };

  var connectionRegistry = {
    // The lastRegistrationId is in common between alarms and push notifications
    lastRegistrationId:  -1,
    pushRegistrations: [],
    alarms: [],
    readyRegistrations: [],
    addReadyRegistration: function(id) {
      this.readyRegistrations.push(id);
      this.notify();
    },
    notify: function() {
      if (!this.readyRegistrations.length || !this.pendingPollCallback) {
        return;
      }
      var cb = this.pendingPollCallback;
      this.pendingPollCallback = null;
      cb(this.readyRegistrations.pop());
    },
    pushNotify: function(protocolName) {
      for (var i = 0; i < this.pushRegistrations.length; i++) {
        if (protocolName == this.pushRegistrations[i].connection) {
          this.addReadyRegistration(this.pushRegistrations[i].id);
        }
      }
    },
    waitForRegistration: function(cb) {
      if (this.pendingPollCallback) {
        throw new Error("There can only be one waiter.");
      }
      this.pendingPollCallback = cb;
      this.notify();
    },
    addConnection: function(connection) {
      connection.id = ++this.lastRegistrationId;
      this.pushRegistrations.push(connection);
      return connection.id;
    },
    addAlarm: function(alarm) {
      alarm.id = ++this.lastRegistrationId;
      this.alarms.push(alarm);
      return alarm.id;
    }
  };

  Native["com/sun/midp/io/j2me/push/ConnectionRegistry.poll0.(J)I"] = function(addr, time) {
    asyncImpl("I", new Promise(function(resolve, reject) {
      connectionRegistry.waitForRegistration(function(id) {
        resolve(id);
      });
    }));
  };

  Native["com/sun/midp/io/j2me/push/ConnectionRegistry.add0.(Ljava/lang/String;)I"] = function(addr, connectionAddr) {
    var values = J2ME.fromStringAddr(connectionAddr).split(',');

    console.warn("ConnectionRegistry.add0.(IL...String;)I isn't completely implemented");

    connectionRegistry.addConnection({
      connection: values[0],
      midlet: values[1],
      filter: values[2],
      suiteId: values[3]
    });

    return 0;
  };

  Native["com/sun/midp/io/j2me/push/ConnectionRegistry.addAlarm0.([BJ)J"] =
  function(addr, midletAddr, jTimeLow, jTimeHigh) {
    var midlet = util.decodeUtf8(J2ME.getArrayFromAddr(midletAddr));
    var time = J2ME.longToNumber(jTimeLow, jTimeHigh);

    var lastAlarm = 0;
    var id = null;
    var alarms = connectionRegistry.alarms;
    for (var i = 0; i < alarms.length; i++) {
      if (alarms[i].midlet == midlet) {
        if (time != 0) {
          id = alarms[i].id;
          lastAlarm = alarms[i].time;
          alarms[i].time = time;
        } else {
          alarms[i].splice(i, 1);
        }

        break;
      }
    }

    if (lastAlarm == 0 && time != 0) {
      id = connectionRegistry.addAlarm({
        midlet: midlet,
        time: time
      });
    }

    if (id !== null) {
      var relativeTime = time - Date.now();
      if (relativeTime < 0) {
        relativeTime = 0;
      }

      setTimeout(function() {
        connectionRegistry.addReadyRegistration(id);
      }, relativeTime);
    }

    return J2ME.returnLongValue(lastAlarm);
  };

  Native["com/sun/midp/io/j2me/push/ConnectionRegistry.getMIDlet0.(I[BI)I"] =
  function(addr, handle, regentryAddr, entrysz) {
    var regentry = J2ME.getArrayFromAddr(regentryAddr);
    var reg;
    var alarms = connectionRegistry.alarms;
    for (var i = 0; i < alarms.length; i++) {
      if (alarms[i].id == handle) {
        reg = alarms[i];
      }
    }

    if (!reg) {
      var pushRegistrations = connectionRegistry.pushRegistrations;
      for (var i = 0; i < pushRegistrations.length; i++) {
        if (pushRegistrations[i].id == handle) {
          reg = pushRegistrations[i];
        }
      }
    }

    if (!reg) {
      console.error("getMIDlet0 returns -1, this should never happen");
      return -1;
    }

    var str;

    if (reg.time) {
      str = reg.midlet + ", 0, 1";
    } else {
      str = reg.connection + ", " + reg.midlet + ", " + reg.filter + ", " + reg.suiteId;
    }

    for (var i = 0; i < str.length; i++) {
      regentry[i] = str.charCodeAt(i);
    }
    regentry[str.length] = 0;

    return 0;
  };

  Native["com/sun/midp/io/j2me/push/ConnectionRegistry.checkInByMidlet0.(ILjava/lang/String;)V"] =
  function(addr, suiteId, classNameAddr) {
    console.warn("ConnectionRegistry.checkInByMidlet0.(IL...String;)V not implemented (" +
                 suiteId + ", " + J2ME.fromStringAddr(classNameAddr) + ")");
  };

  Native["com/sun/midp/io/j2me/push/ConnectionRegistry.checkInByName0.([B)I"] = function(addr, nameAddr) {
    var name = J2ME.getArrayFromAddr(nameAddr);
    console.warn("ConnectionRegistry.checkInByName0.([B)V not implemented (" + util.decodeUtf8(name) + ")");
    return 0;
  };

  Native["com/nokia/mid/ui/gestures/GestureInteractiveZone.isSupported.(I)Z"] = function(addr, gestureEventIdentity) {
    console.warn("GestureInteractiveZone.isSupported.(I)Z not implemented (" + gestureEventIdentity + ")");
    return 0;
  };

  addUnimplementedNative("com/nokia/mid/ui/gestures/GestureInteractiveZone.getGestures.()I", 0);

  Native["com/sun/midp/io/NetworkConnectionBase.initializeInternal.()V"] = function(addr) {
    console.warn("NetworkConnectionBase.initializeInternal.()V not implemented");
  };

  addUnimplementedNative("com/nokia/mid/ui/VirtualKeyboard.hideOpenKeypadCommand.(Z)V");
  addUnimplementedNative("com/nokia/mid/ui/VirtualKeyboard.suppressSizeChanged.(Z)V");

  Native["com/nokia/mid/ui/VirtualKeyboard.getCustomKeyboardControl.()Lcom/nokia/mid/ui/CustomKeyboardControl;"] =
  function(addr) {
    throw $.newIllegalArgumentException("VirtualKeyboard::getCustomKeyboardControl() not implemented");
  };

  var keyboardVisibilityListener = J2ME.Constants.NULL;
  Native["com/nokia/mid/ui/VirtualKeyboard.setVisibilityListener.(Lcom/nokia/mid/ui/KeyboardVisibilityListener;)V"] =
  function(addr, listenerAddr) {
    keyboardVisibilityListener = listenerAddr ? listenerAddr : J2ME.Constants.NULL;
  };

  Native["javax/microedition/lcdui/Display.getKeyboardVisibilityListener.()Lcom/nokia/mid/ui/KeyboardVisibilityListener;"] =
  function(addr) {
    return keyboardVisibilityListener;
  };

  Native["com/nokia/mid/ui/VirtualKeyboard.isVisible.()Z"] = function(addr) {
    return MIDP.isVKVisible() ? 1 : 0;
  };

  Native["com/nokia/mid/ui/VirtualKeyboard.getXPosition.()I"] = function(addr) {
    return 0;
  };

  Native["com/nokia/mid/ui/VirtualKeyboard.getYPosition.()I"] = function(addr) {
    // We should return the number of pixels between the top of the
    // screen and the top of the keyboard
    return deviceCanvas.height - getKeyboardHeight();
  };

  Native["com/nokia/mid/ui/VirtualKeyboard.getWidth.()I"] = function(addr) {
    // The keyboard is always the same width as our window
    return window.innerWidth;
  };

  Native["com/nokia/mid/ui/VirtualKeyboard.getHeight.()I"] = function(addr) {
    return getKeyboardHeight();
  };

  function getKeyboardHeight() {
    return physicalScreenHeight - window.innerHeight;
  };

  return {
    isVKVisible: isVKVisible,
    manifest: manifest,
    sendCommandEvent: sendCommandEvent,
    sendVirtualKeyboardEvent: sendVirtualKeyboardEvent,
    sendEndOfMediaEvent: sendEndOfMediaEvent,
    sendMediaSnapshotFinishedEvent: sendMediaSnapshotFinishedEvent,
    sendKeyPress: sendKeyPress,
    sendKeyRelease: sendKeyRelease,
    sendDestroyMIDletEvent: sendDestroyMIDletEvent,
    setDestroyedForRestart: setDestroyedForRestart,
    registerDestroyedListener: registerDestroyedListener,
    sendExecuteMIDletEvent: sendExecuteMIDletEvent,
    deviceContext: deviceContext,
    updatePhysicalScreenSize: updatePhysicalScreenSize,
    updateCanvas: updateCanvas,
    localizedStrings: localizedStrings,
  };
})();


/* SOURCE: midp/frameanimator.js */
/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */



var FrameAnimator = function() {};

FrameAnimator.numRegistered = 0;

FrameAnimator.prototype._isRegistered = false;

FrameAnimator.prototype.register = function(x, y, maxFps, maxPps, listener) {
  this.x = x;
  this.y = y;
  this.maxFps = maxFps;
  this.maxPps = maxPps;
  this.listener = listener;
  this._isRegistered = true;
  ++FrameAnimator.numRegistered;
};

FrameAnimator.prototype.unregister = function() {
  this.x = null;
  this.y = null;
  this.maxFps = null;
  this.maxPps = null;
  this.listener = J2ME.Constants.NULL;
  this._isRegistered = false;
  --FrameAnimator.numRegistered;
};

FrameAnimator.prototype.isRegistered = function() {
  return this._isRegistered;
};

Native["com/nokia/mid/ui/frameanimator/FrameAnimator.init.()V"] = function(addr) {
  setNative(addr, new FrameAnimator());
};

Native["com/nokia/mid/ui/frameanimator/FrameAnimator.register.(IISSLcom/nokia/mid/ui/frameanimator/FrameAnimatorListener;)Z"] =
function(addr, x, y, maxFps, maxPps, listenerAddr) {
  var nativeObject = NativeMap.get(addr);
  if (nativeObject.isRegistered()) {
    throw $.newIllegalStateException("FrameAnimator already registered");
  }

  if (listenerAddr === J2ME.Constants.NULL) {
    throw $.newNullPointerException("listener is null");
  }

  if (x < -65535 || x > 65535 || y < -65535 || y > 65535) {
    throw $.newIllegalArgumentException("coordinate out of bounds");
  }

  // XXX return false if FrameAnimator.numRegistered >= FRAME_ANIMATOR_MAX_CONCURRENT

  nativeObject.register(x, y, maxFps, maxPps, listenerAddr);
  return 1;
};

Native["com/nokia/mid/ui/frameanimator/FrameAnimator.unregister.()V"] = function(addr) {
  var nativeObject = NativeMap.get(addr);
  if (!nativeObject.isRegistered()) {
    throw $.newIllegalStateException("FrameAnimator not registered");
  }

  nativeObject.unregister();
};

addUnimplementedNative("com/nokia/mid/ui/frameanimator/FrameAnimator.drag.(II)V");
addUnimplementedNative("com/nokia/mid/ui/frameanimator/FrameAnimator.kineticScroll.(IIIF)V");
addUnimplementedNative("com/nokia/mid/ui/frameanimator/FrameAnimator.limitedKineticScroll.(IIIFII)V");
addUnimplementedNative("com/nokia/mid/ui/frameanimator/FrameAnimator.stop.()V");

Native["com/nokia/mid/ui/frameanimator/FrameAnimator.isRegistered.()Z"] = function(addr) {
  return NativeMap.get(addr).isRegistered() ? 1 : 0;
};

Native["com/nokia/mid/ui/frameanimator/FrameAnimator.getNumRegisteredFrameAnimators.()I"] = function(addr) {
  return FrameAnimator.numRegistered;
};


/* SOURCE: midp/fs.js */
/* -*- Mode: Java; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4 -*- */
/* vim: set shiftwidth=4 tabstop=4 autoindent cindent expandtab: */



var RECORD_STORE_BASE = "/RecordStore";

// The filesystem roots, which are used by both FileSystemRegistry.getRoots
// and System.getProperty to provide inquiring midlets with the list.  Each root
// must have a trailing slash.  See FileSystemRegistry.listRoots for more info.
MIDP.fsRoots = [
    "MemoryCard/",
    "Persistent/",
    "Phone/",
    "Private/",
];
// The names here should be localized.
MIDP.fsRootNames = [
    "Memory card",
    "Persistent",
    "Phone memory",
    "Private",
];

Native["com/sun/midp/io/j2me/storage/File.initConfigRoot.(I)Ljava/lang/String;"] = function(addr, storageId) {
    return J2ME.newString("assets/" + storageId + "/");
};

Native["com/sun/midp/io/j2me/storage/File.initStorageRoot.(I)Ljava/lang/String;"] = function(addr, storageId) {
    return J2ME.newString("assets/" + storageId + "/");
};

Native["com/sun/midp/midletsuite/MIDletSuiteStorage.getSecureFilenameBase.(I)Ljava/lang/String;"] = function(addr, id) {
    return J2ME.newString("");
};

Native["com/sun/midp/rms/RecordStoreUtil.exists.(Ljava/lang/String;Ljava/lang/String;I)Z"] =
function(addr, filenameBaseAddr, nameAddr, ext) {
    var path = RECORD_STORE_BASE + "/" + J2ME.fromStringAddr(filenameBaseAddr) +
               "/" + J2ME.fromStringAddr(nameAddr) + "." + ext;
    return fs.exists(path) ? 1 : 0;
};

Native["com/sun/midp/rms/RecordStoreUtil.deleteFile.(Ljava/lang/String;Ljava/lang/String;I)V"] =
function(addr, filenameBaseAddr, nameAddr, ext) {
    var path = RECORD_STORE_BASE + "/" + J2ME.fromStringAddr(filenameBaseAddr) +
               "/" + J2ME.fromStringAddr(nameAddr) + "." + ext;
    fs.remove(path);
};

Native["com/sun/midp/rms/RecordStoreFile.getNumberOfStores.(Ljava/lang/String;)I"] = function(addr, filenameBaseAddr) {
    var path = RECORD_STORE_BASE + "/" + J2ME.fromStringAddr(filenameBaseAddr);
    return fs.list(path).length;
};

Native["com/sun/midp/rms/RecordStoreFile.getRecordStoreList.(Ljava/lang/String;[Ljava/lang/String;)V"] =
function(addr, filenameBaseAddr, namesAddr) {
    var names = J2ME.getArrayFromAddr(namesAddr);
    var path = RECORD_STORE_BASE + "/" + J2ME.fromStringAddr(filenameBaseAddr);
    var files = fs.list(path);
    for (var i = 0; i < files.length; i++) {
        names[i] = J2ME.newString(files[i]);
    }
};

Native["com/sun/midp/rms/RecordStoreFile.spaceAvailableNewRecordStore0.(Ljava/lang/String;I)I"] =
function(addr, filenameBaseAddr, storageId) {
    // Pretend there is 50MiB available.  Our implementation is backed
    // by IndexedDB, which has no actual limit beyond space available on device,
    // which I don't think we can determine.  But this should be sufficient
    // to convince the MIDlet to use the API as needed.
    return 50 * 1024 * 1024;
};

Native["com/sun/midp/rms/RecordStoreFile.spaceAvailableRecordStore.(ILjava/lang/String;I)I"] =
function(addr, handle, filenameBaseAddr, storageId) {
    // Pretend there is 50MiB available.  Our implementation is backed
    // by IndexedDB, which has no actual limit beyond space available on device,
    // which I don't think we can determine.  But this should be sufficient
    // to convince the MIDlet to use the API as needed.
    return 50 * 1024 * 1024;
};

Native["com/sun/midp/rms/RecordStoreFile.openRecordStoreFile.(Ljava/lang/String;Ljava/lang/String;I)I"] =
function(addr, filenameBaseAddr, nameAddr, ext) {
    var ctx = $.ctx;

    var path = RECORD_STORE_BASE + "/" + J2ME.fromStringAddr(filenameBaseAddr) +
               "/" + J2ME.fromStringAddr(nameAddr) + "." + ext;

    function open() {
        asyncImpl("I", new Promise(function(resolve, reject) {
            fs.open(path, function(fd) {
                if (fd == -1) {
                    ctx.setAsCurrentContext();
                    reject($.newIOException("openRecordStoreFile: open failed"));
                } else {
                    resolve(fd); // handle
                }
            });
        }));
    }

    if (fs.exists(path)) {
        open();
    } else {
        // Per the reference impl, create the file if it doesn't exist.
        var dirname = fs.dirname(path);
        if (!fs.mkdirp(dirname)) {
            throw $.newIOException("openRecordStoreFile: mkdirp failed");
        }

        if (!fs.create(path, new Blob())) {
            throw $.newIOException("openRecordStoreFile: create failed");
        }

        open();
    }
};

Native["com/sun/midp/rms/RecordStoreFile.setPosition.(II)V"] = function(addr, handle, pos) {
    fs.setpos(handle, pos);
};

Native["com/sun/midp/rms/RecordStoreFile.readBytes.(I[BII)I"] = function(addr, handle, bufAddr, offset, numBytes) {
    var buf = J2ME.getArrayFromAddr(bufAddr);
    var from = fs.getpos(handle);
    var to = from + numBytes;
    var readBytes = fs.read(handle, from, to);

    if (readBytes.byteLength <= 0) {
        throw $.newIOException("handle invalid or segment indices out of bounds");
    }

    var subBuffer = buf.subarray(offset, offset + readBytes.byteLength);
    for (var i = 0; i < readBytes.byteLength; i++) {
        subBuffer[i] = readBytes[i];
    }
    return readBytes.byteLength;
};

Native["com/sun/midp/rms/RecordStoreFile.writeBytes.(I[BII)V"] = function(addr, handle, bufAddr, offset, numBytes) {
    var buf = J2ME.getArrayFromAddr(bufAddr);
    fs.write(handle, buf, offset, numBytes);
};

Native["com/sun/midp/rms/RecordStoreFile.commitWrite.(I)V"] = function(addr, handle) {
    fs.flush(handle);
};

Native["com/sun/midp/rms/RecordStoreFile.closeFile.(I)V"] = function(addr, handle) {
    fs.close(handle);
};

Native["com/sun/midp/rms/RecordStoreFile.truncateFile.(II)V"] = function(addr, handle, size) {
    fs.flush(handle);
    fs.ftruncate(handle, size);
};

MIDP.RecordStoreCache = [];

Native["com/sun/midp/rms/RecordStoreSharedDBHeader.getLookupId0.(ILjava/lang/String;I)I"] =
function(addr, suiteId, storeNameAddr, headerDataSize) {
    var storeName = J2ME.fromStringAddr(storeNameAddr);

    var sharedHeader =
        MIDP.RecordStoreCache.filter(function(v) { return (v && v.suiteId == suiteId && v.storeName == storeName); })[0];
    if (!sharedHeader) {
        sharedHeader = {
            suiteId: suiteId,
            storeName: storeName,
            headerVersion: 0,
            headerData: null,
            headerDataSize: headerDataSize,
            refCount: 0,
            // Use cache indices as IDs, so we can look up objects by index.
            lookupId: MIDP.RecordStoreCache.length,
        };
        MIDP.RecordStoreCache.push(sharedHeader);
    }
    ++sharedHeader.refCount;

    return sharedHeader.lookupId;
};

Native["com/sun/midp/rms/RecordStoreSharedDBHeader.shareCachedData0.(I[BI)I"] =
function(addr, lookupId, headerDataAddr, headerDataSize) {
    var sharedHeader = MIDP.RecordStoreCache[lookupId];
    if (!sharedHeader) {
        throw $.newIllegalStateException("invalid header lookup ID");
    }

    var headerData = J2ME.getArrayFromAddr(headerDataAddr);
    if (!headerData) {
        throw $.newIllegalArgumentException("header data is null");
    }

    var size = headerDataSize;
    if (size > sharedHeader.headerDataSize) {
        size = sharedHeader.headerDataSize;
    }
    sharedHeader.headerData = headerData.subarray(0, size);
    ++sharedHeader.headerVersion;

    return sharedHeader.headerVersion;
};

Native["com/sun/midp/rms/RecordStoreSharedDBHeader.updateCachedData0.(I[BII)I"] =
function(addr, lookupId, headerDataAddr, headerDataSize, headerVersion) {
    var sharedHeader = MIDP.RecordStoreCache[lookupId];
    if (!sharedHeader) {
        throw $.newIllegalStateException("invalid header lookup ID");
    }

    var headerData = J2ME.getArrayFromAddr(headerDataAddr);
    if (!headerData) {
        throw $.newIllegalArgumentException("header data is null");
    }

    if (sharedHeader.headerVersion > headerVersion && sharedHeader.headerData) {
        var size = sharedHeader.headerDataSize;
        if (size > headerDataSize) {
            size = headerDataSize;
        }
        var sharedHeaderData = sharedHeader.headerData;
        for (var i = 0; i < size; i++) {
            headerData[i] = sharedHeaderData[i];
        }
        return sharedHeader.headerVersion;
    }

    return headerVersion;
};

Native["com/sun/midp/rms/RecordStoreSharedDBHeader.getHeaderRefCount0.(I)I"] = function(addr, lookupId) {
    var sharedHeader = MIDP.RecordStoreCache[lookupId];
    if (!sharedHeader) {
        throw $.newIllegalStateException("invalid header lookup ID");
    }

    return sharedHeader.refCount;
};

Native["com/sun/midp/rms/RecordStoreSharedDBHeader.cleanup0.()V"] = function(addr) {
    var self = getHandle(addr);
    var lookupId = self.lookupId;
    if (MIDP.RecordStoreCache[lookupId] &&
        --MIDP.RecordStoreCache[lookupId].refCount <= 0) {
        // Set to null instead of removing from array to maintain
        // correspondence between lookup IDs and array indices.
        MIDP.RecordStoreCache[lookupId] = null;
    }
};

// In the reference implementation, finalize is identical to cleanup0.
Native["com/sun/midp/rms/RecordStoreSharedDBHeader.finalize.()V"] =
    Native["com/sun/midp/rms/RecordStoreSharedDBHeader.cleanup0.()V"];

Native["com/sun/midp/rms/RecordStoreRegistry.getRecordStoreListeners.(ILjava/lang/String;)[I"] =
function(addr, suiteId, storeNameAddr) {
    console.warn("RecordStoreRegistry.getRecordStoreListeners.(IL...String;)[I not implemented (" +
                 suiteId + ", " + J2ME.fromStringAddr(storeNameAddr) + ")");
    return J2ME.Constants.NULL;
};

Native["com/sun/midp/rms/RecordStoreRegistry.sendRecordStoreChangeEvent.(ILjava/lang/String;II)V"] =
function(addr, suiteId, storeNameAddr, changeType, recordId) {
    console.warn("RecordStoreRegistry.sendRecordStoreChangeEvent.(IL...String;II)V not implemented (" +
                 suiteId + ", " + J2ME.fromStringAddr(storeNameAddr) + ", " + changeType + ", " + recordId + ")");
};

Native["com/sun/midp/rms/RecordStoreRegistry.startRecordStoreListening.(ILjava/lang/String;)V"] =
function(addr, suiteId, storeNameAddr) {
    console.warn("RecordStoreRegistry.startRecordStoreListening.(IL...String;)V not implemented (" +
                 suiteId + ", " + J2ME.fromStringAddr(storeNameAddr) + ")");
};

Native["com/sun/midp/rms/RecordStoreRegistry.stopRecordStoreListening.(ILjava/lang/String;)V"] =
function(addr, suiteId, storeNameAddr) {
    console.warn("RecordStoreRegistry.stopRecordStoreListening.(IL...String;)V not implemented (" +
                 suiteId + ", " + J2ME.fromStringAddr(storeNameAddr) + ")");
};

Native["com/sun/midp/rms/RecordStoreRegistry.stopAllRecordStoreListeners.(I)V"] = function(addr, taskId) {
    console.warn("RecordStoreRegistry.stopAllRecordStoreListeners.(I)V not implemented (" + taskId + ")");
};

Native["com/sun/cdc/io/j2me/file/DefaultFileHandler.create.()V"] = function(addr) {
    var pathname = J2ME.fromStringAddr(getHandle(addr).nativePath);
    DEBUG_FS && console.log("DefaultFileHandler.create: " + pathname);
    if (config.ignoredFiles.has(pathname)) {
        DEBUG_FS && console.log("DefaultFileHandler.create: ignored file");
        return;
    }

    var stat = fs.stat(pathname);

    if (stat !== null || !fs.create(pathname, new Blob())) {
        throw $.newIOException("error creating " + pathname);
    }
};

Native["com/sun/cdc/io/j2me/file/DefaultFileHandler.exists.()Z"] = function(addr) {
    var pathname = J2ME.fromStringAddr(getHandle(addr).nativePath);
    DEBUG_FS && console.log("DefaultFileHandler.exists: " + pathname);
    if (config.ignoredFiles.has(pathname)) {
        DEBUG_FS && console.log("DefaultFileHandler.exists: ignored file");
        return 1;
    }

    var exists = fs.exists(pathname);
    DEBUG_FS && console.log("DefaultFileHandler.exists: " + exists);
    return exists ? 1 : 0;
};

Native["com/sun/cdc/io/j2me/file/DefaultFileHandler.isDirectory.()Z"] = function(addr) {
    var pathname = J2ME.fromStringAddr(getHandle(addr).nativePath);
    DEBUG_FS && console.log("DefaultFileHandler.isDirectory: " + pathname);
    if (config.ignoredFiles.has(pathname)) {
        DEBUG_FS && console.log("DefaultFileHandler.isDirectory: ignored file");
        return 0;
    }

    var stat = fs.stat(pathname);
    var isDirectory = !!stat && stat.isDir;
    DEBUG_FS && console.log("DefaultFileHandler.isDirectory: " + isDirectory);
    return isDirectory ? 1 : 0;
}

Native["com/sun/cdc/io/j2me/file/DefaultFileHandler.delete.()V"] = function(addr) {
    var pathname = J2ME.fromStringAddr(getHandle(addr).nativePath);
    DEBUG_FS && console.log("DefaultFileHandler.delete: " + pathname);
    if (config.ignoredFiles.has(pathname)) {
        DEBUG_FS && console.log("DefaultFileHandler.delete: ignored file");
        return;
    }

    if (!fs.remove(pathname)) {
        throw $.newIOException();
    }
};


Native["com/sun/cdc/io/j2me/file/DefaultFileHandler.rename0.(Ljava/lang/String;)V"] = function(addr, newNameAddr) {
    var pathname = J2ME.fromStringAddr(getHandle(addr).nativePath);
    var newPathname = J2ME.fromStringAddr(newNameAddr);
    DEBUG_FS && console.log("DefaultFileHandler.rename0: " + pathname + " to " + newPathname);

    if (fs.exists(newPathname)) {
        throw $.newIOException("file with new name exists");
    }

    if (!fs.rename(pathname, newPathname)) {
        throw $.newIOException("error renaming file");
    }
};

Native["com/sun/cdc/io/j2me/file/DefaultFileHandler.truncate.(J)V"] = function(addr, byteOffsetL, byteOffsetH) {
    var pathname = J2ME.fromStringAddr(getHandle(addr).nativePath);
    DEBUG_FS && console.log("DefaultFileHandler.lastModified: " + pathname);
    if (config.ignoredFiles.has(pathname)) {
        DEBUG_FS && console.log("DefaultFileHandler.lastModified: ignored file");
        return;
    }

    var stat = fs.stat(pathname);

    if (!stat) {
        throw $.newIOException("file does not exist");
    }

    if (stat.isDir) {
        throw $.newIOException("file is directory");
    }

    // TODO: If the file is open, flush it first.

    fs.truncate(pathname, J2ME.longToNumber(byteOffsetL, byteOffsetH));
};

Native["com/sun/cdc/io/j2me/file/DefaultFileHandler.fileSize.()J"] = function(addr) {
    var pathname = J2ME.fromStringAddr(getHandle(addr).nativePath);
    DEBUG_FS && console.log("DefaultFileHandler.fileSize: " + pathname);
    if (config.ignoredFiles.has(pathname)) {
        DEBUG_FS && console.log("DefaultFileHandler.fileSize: ignored file");
        return J2ME.returnLongValue(0);
    }

    return J2ME.returnLongValue(fs.size(pathname));
};

addUnimplementedNative("com/sun/cdc/io/j2me/file/DefaultFileHandler.directorySize.(Z)J",
                       function() { return J2ME.returnLongValue(0) });

Native["com/sun/cdc/io/j2me/file/DefaultFileHandler.canRead.()Z"] = function(addr) {
    var pathname = J2ME.fromStringAddr(getHandle(addr).nativePath);
    DEBUG_FS && console.log("DefaultFileHandler.canRead: " + pathname);
    if (config.ignoredFiles.has(pathname)) {
        DEBUG_FS && console.log("DefaultFileHandler.canRead: ignored file");
        return 1;
    }

    return J2ME.returnLongValue(fs.exists(pathname) ? 1 : 0);
};

Native["com/sun/cdc/io/j2me/file/DefaultFileHandler.canWrite.()Z"] = function(addr) {
    var pathname = J2ME.fromStringAddr(getHandle(addr).nativePath);
    DEBUG_FS && console.log("DefaultFileHandler.canWrite: " + pathname);
    if (config.ignoredFiles.has(pathname)) {
        DEBUG_FS && console.log("DefaultFileHandler.canWrite: ignored file");
        return 1;
    }

    return fs.exists(pathname) ? 1 : 0;
};

Native["com/sun/cdc/io/j2me/file/DefaultFileHandler.isHidden0.()Z"] = function(addr) {
    // Per the comment in DefaultFileHandler.isHidden, we pretend we're Unix
    // and always return false.
    return 0;
};

Native["com/sun/cdc/io/j2me/file/DefaultFileHandler.setReadable.(Z)V"] = function(addr) {
    var pathname = J2ME.fromStringAddr(getHandle(addr).nativePath);
    DEBUG_FS && console.log("DefaultFileHandler.setReadable: " + pathname);
    if (config.ignoredFiles.has(pathname)) {
        DEBUG_FS && console.log("DefaultFileHandler.setReadable: ignored file");
        return;
    }

    if (!fs.exists(pathname)) {
        throw $.newIOException("file does not exist");
    }

    // Otherwise this is a noop, as files are always readable in our filesystem.
};

Native["com/sun/cdc/io/j2me/file/DefaultFileHandler.setWritable.(Z)V"] = function(addr) {
    var pathname = J2ME.fromStringAddr(getHandle(addr).nativePath);
    DEBUG_FS && console.log("DefaultFileHandler.setWritable: " + pathname);
    if (config.ignoredFiles.has(pathname)) {
        DEBUG_FS && console.log("DefaultFileHandler.setWritable: ignored file");
        return;
    }

    if (!fs.exists(pathname)) {
        throw $.newIOException("file does not exist");
    }

    // Otherwise this is a noop, as files are always writable in our filesystem.
};

addUnimplementedNative("com/sun/cdc/io/j2me/file/DefaultFileHandler.setHidden0.(Z)V");

Native["com/sun/cdc/io/j2me/file/DefaultFileHandler.mkdir.()V"] = function(addr) {
    var pathname = J2ME.fromStringAddr(getHandle(addr).nativePath);
    DEBUG_FS && console.log("DefaultFileHandler.mkdir: " + pathname);

    if (!fs.mkdir(pathname)) {
        throw $.newIOException("error creating " + pathname);
    };
};

// Pretend there is 1GiB in total and available.
addUnimplementedNative("com/sun/cdc/io/j2me/file/DefaultFileHandler.availableSize.()J",
                       function() { return J2ME.returnLongValue(1024 * 1024 * 1024) });
addUnimplementedNative("com/sun/cdc/io/j2me/file/DefaultFileHandler.totalSize.()J",
                       function() { return J2ME.returnLongValue(1024 * 1024 * 1024) });

Native["com/sun/cdc/io/j2me/file/DefaultFileHandler.lastModified.()J"] = function(addr) {
    var pathname = J2ME.fromStringAddr(getHandle(addr).nativePath);
    DEBUG_FS && console.log("DefaultFileHandler.lastModified: " + pathname);
    if (config.ignoredFiles.has(pathname)) {
        DEBUG_FS && console.log("DefaultFileHandler.lastModified: ignored file");
        return J2ME.returnLongValue(0);
    }

    var stat = fs.stat(pathname);
    return J2ME.returnLongValue(stat != null ? stat.mtime : 0);
};

MIDP.markFileHandler = function(fileHandler, mode, state) {
    switch(mode) {
        case "read":
            fileHandler.isOpenForRead = state ? 1 : 0;
            break;
        case "write":
            fileHandler.isOpenForWrite = state ? 1 : 0;
            break;
    }
};

MIDP.openFileHandler = function(fileHandler, mode) {
    var pathname = J2ME.fromStringAddr(fileHandler.nativePath);
    DEBUG_FS && console.log("MIDP.openFileHandler: " + pathname + " for " + mode);
    if (config.ignoredFiles.has(pathname)) {
        DEBUG_FS && console.log("MIDP.openFileHandler: ignored file");
        return;
    }

    if (fileHandler.nativeDescriptor !== -1) {
        // The file is already open, so we only have to reset its position
        // and mark it as open.
        var fd = fileHandler.nativeDescriptor;
        fs.setpos(fd, 0);
        MIDP.markFileHandler(fileHandler, mode, true);
        return;
    }

    var stat = fs.stat(pathname);

    if (!stat) {
        throw $.newIOException("file does not exist");
    }

    if (stat.isDir) {
        throw $.newIOException("file is a directory");
    }

    var ctx = $.ctx;

    asyncImpl("V", new Promise(function(resolve, reject) {
        fs.open(pathname, function(fd) {
            if (fd === -1) {
              ctx.setAsCurrentContext();
              reject($.newIOException("Failed to open file handler for " + pathname));
              return;
            }
            fileHandler.nativeDescriptor = fd;
            MIDP.markFileHandler(fileHandler, mode, true);
            resolve();
        });
    }));
};

MIDP.closeFileHandler = function(fileHandler, mode) {
    DEBUG_FS && console.log("MIDP.closeFileHandler: " + J2ME.fromStringAddr(fileHandler.nativePath) + " for " + mode);
    if (fileHandler.nativeDescriptor === -1) {
        DEBUG_FS && console.log("MIDP.closeFileHandler: ignored file");
        return;
    }

    MIDP.markFileHandler(fileHandler, mode, false);

    var isOpenForOtherMode;
    switch(mode) {
        case "read":
            isOpenForOtherMode = fileHandler.isOpenForWrite;
            break;
        case "write":
            isOpenForOtherMode = fileHandler.isOpenForRead;
            break;
    }

    // If the file isn't open for the other mode, but it still has a native
    // descriptor, then it's time to close the native file.  Otherwise, we leave
    // it open until it gets closed for the other mode.
    if (isOpenForOtherMode === 0 && fileHandler.nativeDescriptor !== -1) {
        fs.close(fileHandler.nativeDescriptor);
        fileHandler.nativeDescriptor = -1;
    }
};

Native["com/sun/cdc/io/j2me/file/DefaultFileHandler.openForRead.()V"] = function(addr) {
    MIDP.openFileHandler(getHandle(addr), "read");
};

Native["com/sun/cdc/io/j2me/file/DefaultFileHandler.closeForRead.()V"] = function(addr) {
    MIDP.closeFileHandler(getHandle(addr), "read");
};

Native["com/sun/cdc/io/j2me/file/DefaultFileHandler.openForWrite.()V"] = function(addr) {
    MIDP.openFileHandler(getHandle(addr), "write");
};

Native["com/sun/cdc/io/j2me/file/DefaultFileHandler.closeForWrite.()V"] = function(addr) {
    MIDP.closeFileHandler(getHandle(addr), "write");
};

Native["com/sun/cdc/io/j2me/file/DefaultFileHandler.closeForReadWrite.()V"] = function(addr) {
    MIDP.closeFileHandler(getHandle(addr), "read");
    MIDP.closeFileHandler(getHandle(addr), "write");
};

Native["com/sun/cdc/io/j2me/file/DefaultFileHandler.read.([BII)I"] = function(addr, bAddr, off, len) {
    var self = getHandle(addr);
    var b = J2ME.getArrayFromAddr(bAddr);
    DEBUG_FS && console.log("DefaultFileHandler.read: " + J2ME.fromStringAddr(self.nativePath) + " " + len);
    if (self.nativeDescriptor === -1) {
        DEBUG_FS && console.log("DefaultFileHandler.read: ignored file");
        return -1;
    }

    var fd = self.nativeDescriptor;

    if (off < 0 || len < 0 || off > b.byteLength || (b.byteLength - off) < len) {
        throw $.newIOException();
    }

    if (b.byteLength == 0 || len == 0) {
        return 0;
    }

    var curpos = fs.getpos(fd);
    var data = fs.read(fd, curpos, curpos + len);
    b.set(data, off);

    return (data.byteLength > 0) ? data.byteLength : -1;
};

Native["com/sun/cdc/io/j2me/file/DefaultFileHandler.skip.(J)J"] = function(addr, l, h) {
    var self = getHandle(addr);
    DEBUG_FS && console.log("DefaultFileHandler.skip: " + J2ME.fromStringAddr(self.nativePath));
    if (self.nativeDescriptor === -1) {
        DEBUG_FS && console.log("DefaultFileHandler.skip: ignored file");
        return -1;
    }

    var toSkip = J2ME.longToNumber(l, h);

    if (toSkip < 0) {
        return J2ME.returnLongValue(0);
    }

    var fd = self.nativeDescriptor;
    var pos = fs.getpos(fd);
    var size = fs.getsize(fd);
    if (pos + toSkip > size) {
        fs.setpos(fd, size);
        return J2ME.returnLongValue(size - pos);
    } else {
        fs.setpos(fd, pos + toSkip);
        return J2ME.returnLong(l, h);
    }
};

Native["com/sun/cdc/io/j2me/file/DefaultFileHandler.write.([BII)I"] = function(addr, bAddr, off, len) {
    var self = getHandle(addr);
    var b = J2ME.getArrayFromAddr(bAddr);
    DEBUG_FS && console.log("DefaultFileHandler.write: " + J2ME.fromStringAddr(self.nativePath) + " " + off + "+" + len);
    if (self.nativeDescriptor === -1) {
        DEBUG_FS && console.log("DefaultFileHandler.write: ignored file");
        return preemptingImpl("I", len);
    }

    var fd = self.nativeDescriptor;
    fs.write(fd, b, off, len);
    // The return value is the "length of data really written," which is
    // always the same as the length requested in our implementation.
    return preemptingImpl("I", len);
};

Native["com/sun/cdc/io/j2me/file/DefaultFileHandler.positionForWrite.(J)V"] = function(addr, offsetLow, offsetHigh) {
    var self = getHandle(addr);
    DEBUG_FS && console.log("DefaultFileHandler.positionForWrite: " + J2ME.fromStringAddr(self.nativePath));
    if (self.nativeDescriptor === -1) {
        DEBUG_FS && console.log("DefaultFileHandler.positionForWrite: ignored file");
        return;
    }

    var fd = self.nativeDescriptor;
    fs.setpos(fd, J2ME.longToNumber(offsetLow, offsetHigh));
};

Native["com/sun/cdc/io/j2me/file/DefaultFileHandler.flush.()V"] = function(addr) {
    var self = getHandle(addr);
    DEBUG_FS && console.log("DefaultFileHandler.flush: " + J2ME.fromStringAddr(self.nativePath));
    if (self.nativeDescriptor === -1) {
        DEBUG_FS && console.log("DefaultFileHandler.flush: ignored file");
        return;
    }

    var fd = self.nativeDescriptor;
    fs.flush(fd);
};

Native["com/sun/cdc/io/j2me/file/DefaultFileHandler.close.()V"] = function(addr) {
    var self = getHandle(addr);
    DEBUG_FS && console.log("DefaultFileHandler.close: " + J2ME.fromStringAddr(self.nativePath));

    MIDP.closeFileHandler(self, "read");
    MIDP.closeFileHandler(self, "write");
};

// Not implemented because we don't use native pointers, so we've commented out
// calls to this private method in DefaultFileHandler.
addUnimplementedNative("com/sun/cdc/io/j2me/file/DefaultFileHandler.getNativeName.(Ljava/lang/String;J)J",
                       function() { return J2ME.returnLongValue(0) });

Native["com/sun/cdc/io/j2me/file/DefaultFileHandler.getFileSeparator.()C"] = function(addr) {
    return "/".charCodeAt(0);
}

MIDP.openDirs = new Map();
MIDP.openDirHandle = 0;

Native["com/sun/cdc/io/j2me/file/DefaultFileHandler.openDir.()J"] = function(addr) {
    var self = getHandle(addr);
    var pathname = J2ME.fromStringAddr(self.nativePath);
    DEBUG_FS && console.log("DefaultFileHandler.openDir: " + pathname);

    try {
        var files = fs.list(pathname);
    } catch(ex) {
        if (ex.message == "Path does not exist") {
            throw $.newIOException("Directory does not exist: file://" + pathname);
        }
        if (ex.message == "Path is not a directory") {
            throw $.newIOException("Connection is open on a file: file://" + pathname);
        }
    }

    var openDirHandle = ++MIDP.openDirHandle;

    MIDP.openDirs.set(openDirHandle, {
        files: files,
        index: -1,
    });

    return J2ME.returnLongValue(openDirHandle);
};

Native["com/sun/cdc/io/j2me/file/DefaultFileHandler.closeDir.(J)V"] = function(addr, dirHandleLow, dirHandleHigh) {
    MIDP.openDirs.delete(J2ME.longToNumber(dirHandleLow, dirHandleHigh));
};

Native["com/sun/cdc/io/j2me/file/DefaultFileHandler.dirGetNextFile.(JZ)Ljava/lang/String;"] =
function(addr, dirHandleLow, dirHandleHigh, includeHidden) {
    var iterator = MIDP.openDirs.get(J2ME.longToNumber(dirHandleLow, dirHandleHigh));
    var nextFile = iterator.files[++iterator.index];
    DEBUG_FS && console.log(iterator.index + " " + nextFile);
    return nextFile ? J2ME.newString(nextFile) : J2ME.Constants.NULL;
};

Native["com/sun/cdc/io/j2me/file/DefaultFileHandler.getNativePathForRoot.(Ljava/lang/String;)Ljava/lang/String;"] =
function(addr, rootAddr) {
    var root = J2ME.fromStringAddr(rootAddr);
    // XXX Ensure root is in MIDP.fsRoots?
    DEBUG_FS && console.log("getNativePathForRoot: " + root);
    return J2ME.newString("/" + root);
};

Native["com/sun/cdc/io/j2me/file/DefaultFileHandler.illegalFileNameChars0.()Ljava/lang/String;"] = function(addr) {
    return J2ME.newString('<>:"\\|?');
};

addUnimplementedNative("com/sun/cdc/io/j2me/file/DefaultFileHandler.initialize.()V");

Native["com/sun/cdc/io/j2me/file/DefaultFileHandler.getSuiteIdString.(I)Ljava/lang/String;"] = function(addr, id) {
DEBUG_FS && console.log("getSuiteIdString: " + id);
    // return J2ME.newString(id.toString());
    // The implementation adds this to the path of the file, presumably
    // to segregate files by midlet, but we only run a single midlet
    // per installation, so presumably we don't have to do that.
    return J2ME.newString("");
};

Native["com/sun/cdc/io/j2me/file/Protocol.available.()I"] = function(addr) {
    var self = getHandle(addr);
    var fileHandler = getHandle(self.fileHandler);
    var fd = fileHandler.nativeDescriptor;
    var available = fs.getsize(fd) - fs.getpos(fd);
    DEBUG_FS && console.log("Protocol.available: " + J2ME.fromStringAddr(fileHandler.nativePath) + ": " + available);
    return available;
};

Native["com/sun/midp/io/j2me/storage/RandomAccessStream.open.(Ljava/lang/String;I)I"] =
function(addr, fileNameAddr, mode) {
    var path = "/" + J2ME.fromStringAddr(fileNameAddr);

    var ctx = $.ctx;

    function open() {
        asyncImpl("I", new Promise(function(resolve, reject) {
            fs.open(path, function(fd) {
                if (fd == -1) {
                    ctx.setAsCurrentContext();
                    reject($.newIOException("RandomAccessStream::open(" + path + ") failed opening the file"));
                } else {
                    resolve(fd);
                }
            });
        }));
    }

    if (fs.exists(path)) {
        open();
    } else if (mode == 1) {
        throw $.newIOException("RandomAccessStream::open(" + path + ") file doesn't exist");
    } else if (fs.create(path, new Blob())) {
        open();
    } else {
        throw $.newIOException("RandomAccessStream::open(" + path + ") failed creating the file");
    }
};

Native["com/sun/midp/io/j2me/storage/RandomAccessStream.read.(I[BII)I"] =
function(addr, handle, bufferAddr, offset, length) {
    var buffer = J2ME.getArrayFromAddr(bufferAddr);
    var from = fs.getpos(handle);
    var to = from + length;
    var readBytes = fs.read(handle, from, to);

    if (readBytes.byteLength <= 0) {
        return -1;
    }

    var subBuffer = buffer.subarray(offset, offset + readBytes.byteLength);
    for (var i = 0; i < readBytes.byteLength; i++) {
        subBuffer[i] = readBytes[i];
    }
    return readBytes.byteLength;
};

Native["com/sun/midp/io/j2me/storage/RandomAccessStream.write.(I[BII)V"] =
function(addr, handle, bufferAddr, offset, length) {
    var buffer = J2ME.getArrayFromAddr(bufferAddr);
    fs.write(handle, buffer, offset, length);
};

Native["com/sun/midp/io/j2me/storage/RandomAccessStream.commitWrite.(I)V"] = function(addr, handle) {
    fs.flush(handle);
};

Native["com/sun/midp/io/j2me/storage/RandomAccessStream.position.(II)V"] = function(addr, handle, position) {
    fs.setpos(handle, position);
};

Native["com/sun/midp/io/j2me/storage/RandomAccessStream.sizeOf.(I)I"] = function(addr, handle) {
    var size = fs.getsize(handle);

    if (size == -1) {
        throw $.newIOException("RandomAccessStream::sizeOf(" + handle + ") failed");
    }

    return size;
};

Native["com/sun/midp/io/j2me/storage/RandomAccessStream.close.(I)V"] = function(addr, handle) {
    fs.close(handle);
};

Native["javax/microedition/io/file/FileSystemRegistry.getRoots.()[Ljava/lang/String;"] = function(addr) {
    var arrayAddr = J2ME.newStringArray(MIDP.fsRoots.length);
    J2ME.setUncollectable(arrayAddr);
    var array = J2ME.getArrayFromAddr(arrayAddr);

    for (var i = 0; i < MIDP.fsRoots.length; i++) {
        array[i] = J2ME.newString(MIDP.fsRoots[i]);
    }
    J2ME.unsetUncollectable(arrayAddr);
    return arrayAddr;
};


/* SOURCE: midp/crypto.js */
/* -*- Mode: Java; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4 -*- */
/* vim: set shiftwidth=4 tabstop=4 autoindent cindent expandtab: */



Native["com/sun/midp/crypto/PRand.getRandomBytes.([BI)Z"] = function(addr, bAddr, nbytes) {
    window.crypto.getRandomValues(J2ME.getArrayFromAddr(bAddr).subarray(0, nbytes));
    return 1;
};

MIDP.hashers = new Map();

/**
 * A 16-byte Int32Array whose values are all initialized to zero.
 * Useful for comparing with other such arrays to determine whether or not
 * they've been populated with other values.  Also useful for resetting
 * data arrays back to their initial state.
 */
MIDP.emptyDataArray = new Int32Array(16);

MIDP.getMD5Hasher = function(dataAddr) {
    if (!MIDP.hashers.has(dataAddr)) {
      var hasher = forge.md.md5.create();
      window.crypto.getRandomValues(J2ME.getArrayFromAddr(dataAddr));
      MIDP.hashers.set(dataAddr, hasher);
    }
    return MIDP.hashers.get(dataAddr);
};

var bin2StringResult = new Array();
MIDP.bin2String = function(array) {
  bin2StringResult.length = array.length;
  for (var i = 0; i < array.length; i++) {
    bin2StringResult[i] = String.fromCharCode(array[i] & 0xff);
  }
  return bin2StringResult.join("");
};

Native["com/sun/midp/crypto/MD5.nativeUpdate.([BII[I[I[I[I)V"] =
function(addr, inBufAddr, inOff, inLen, stateAddr, numAddr, countAddr, dataAddr) {
    var inBuf = J2ME.getArrayFromAddr(inBufAddr);
    MIDP.getMD5Hasher(dataAddr).update(MIDP.bin2String(new Int8Array(inBuf.subarray(inOff, inOff + inLen))));
};

Native["com/sun/midp/crypto/MD5.nativeFinal.([BII[BI[I[I[I[I)V"] =
function(addr, inBufAddr, inOff, inLen, outBufAddr, outOff, stateAddr, numAddr, countAddr, dataAddr) {
    var inBuf;
    var outBuf = J2ME.getArrayFromAddr(outBufAddr);
    var data = J2ME.getArrayFromAddr(dataAddr);
    var hasher = MIDP.getMD5Hasher(dataAddr);

    if (inBufAddr !== J2ME.Constants.NULL) {
        // digest passes `null` for inBuf, and there are no other callers,
        // so this should never happen; but I'm including it for completeness
        // (and in case a subclass ever uses it).
        inBuf = J2ME.getArrayFromAddr(inBufAddr);
        hasher.update(MIDP.bin2String(inBuf.subarray(inOff, inOff + inLen)));
    }

    var hash = hasher.digest();

    for (var i = 0; i < hash.length(); i++) {
        outBuf[outOff + i] = hash.at(i);
    }

    // XXX Call the reset method instead to completely reset the object.
    data.set(MIDP.emptyDataArray);

    MIDP.hashers.delete(dataAddr);
};

Native["com/sun/midp/crypto/MD5.nativeClone.([I[I)V"] = function(addr, selfDataAddr, dataAddr) {
    var hasher = MIDP.hashers.get(selfDataAddr);
    MIDP.hashers.set(dataAddr, hasher.clone());
};

Native["com/sun/midp/crypto/MD5.nativeReset.([I)V"] = function(addr, selfDataAddr) {
    MIDP.hashers.delete(selfDataAddr);
};

var hexEncodeArray = [ '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', ];

var bytesToHexStringResult = new Array();
function bytesToHexString(array) {
    bytesToHexStringResult.length = array.length * 2;
    for (var i = 0; i < array.length; i++) {
      var code = array[i] & 0xFF;
      bytesToHexStringResult[i * 2] = hexEncodeArray[code >>> 4];
      bytesToHexStringResult[i * 2 + 1] = hexEncodeArray[code & 0x0F];
    }
    return bytesToHexStringResult.join("");
}

function hexStringToBytes(hex) {
    // The jsbn library (that provides BigInteger support) produces a
    // hexadecimal string that doesn't contain a leading 0 (e.g. "010010" would
    // be "10010").
    var length = hex.length / 2;
    if (length % 1 !== 0) {
      hex = "0" + hex;
    }

    var bytes = new Int8Array(hex.length / 2);

    for (var i = 0; i < hex.length; i += 2) {
        bytes[i/2] = parseInt(hex.substr(i, 2), 16);
    }

    return bytes;
}

Native["com/sun/midp/crypto/RSA.modExp.([B[B[B[B)I"] = function(addr, dataAddr, exponentAddr, modulusAddr, resultAddr) {
    // The jsbn library doesn't work well with typed arrays, so we're using this
    // hack of translating the numbers to hexadecimal strings before handing
    // them to jsbn (and we're getting the result back in a hex string).

    var data = J2ME.getArrayFromAddr(dataAddr);
    var exponent = J2ME.getArrayFromAddr(exponentAddr);
    var modulus = J2ME.getArrayFromAddr(modulusAddr);
    var result = J2ME.getArrayFromAddr(resultAddr);

    var bnBase = new BigInteger(bytesToHexString(data), 16);
    var bnExponent = new BigInteger(bytesToHexString(exponent), 16);
    var bnModulus = new BigInteger(bytesToHexString(modulus), 16);
    var bnRemainder = bnBase.modPow(bnExponent, bnModulus);
    var remainder = hexStringToBytes(bnRemainder.toString(16));

    result.set(remainder);
    return remainder.length;
};

Native["com/sun/midp/crypto/ARC4.nativetx.([B[I[I[BII[BI)V"] =
function(addr, SAddr, XAddr, YAddr, inbufAddr, inoff, inlen, outbufAddr, outoff) {
    var S = J2ME.getArrayFromAddr(SAddr);
    var X = J2ME.getArrayFromAddr(XAddr);
    var Y = J2ME.getArrayFromAddr(YAddr);
    var inbuf = J2ME.getArrayFromAddr(inbufAddr);
    var outbuf = J2ME.getArrayFromAddr(outbufAddr);

    var x = X[0];
    var y = Y[0];

    for (var i = 0; i < inlen; i++) {
        x = (x + 1) & 0xff;
        y = (y + S[x]) & 0xff;

        var tx = S[x];
        S[x] = S[y];
        S[y] = tx;

        var ty = S[x] + S[y] & 0xff;

        outbuf[i+outoff] = S[ty] ^ inbuf[i+inoff];
    }

    X[0] = x;
    Y[0] = y;
};


/* SOURCE: midp/gfx.js */
/* -*- Mode: Java; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4 -*- */
/* vim: set shiftwidth=4 tabstop=4 autoindent cindent expandtab: */



var FONT_HEIGHT_MULTIPLIER = 1.3;

var currentlyFocusedTextEditor;
(function(Native) {
    if (!inBrowser) {
        return;
    }
    var offscreenCanvas = document.createElement("canvas");
    offscreenCanvas.width = MIDP.deviceContext.canvas.width;
    offscreenCanvas.height = MIDP.deviceContext.canvas.height;
    var offscreenContext2D = offscreenCanvas.getContext("2d");
    var screenContextInfo = new ContextInfo(offscreenContext2D);

    MIDP.deviceContext.canvas.addEventListener("canvasresize", function() {
        offscreenCanvas.width = MIDP.deviceContext.canvas.width;
        offscreenCanvas.height = MIDP.deviceContext.canvas.height;
        screenContextInfo.currentlyAppliedGraphicsInfo = null;
        offscreenContext2D.save();
    });

    var tempContext = document.createElement("canvas").getContext("2d");
    tempContext.canvas.width = 0;
    tempContext.canvas.height = 0;

    Native["com/sun/midp/lcdui/DisplayDeviceContainer.getDisplayDevicesIds0.()[I"] = function(addr) {
        var idsAddr = J2ME.newIntArray(1);
        var ids = J2ME.getArrayFromAddr(idsAddr);
        ids[0] = 1;
        return idsAddr;
    };

    Native["com/sun/midp/lcdui/DisplayDevice.getDisplayName0.(I)Ljava/lang/String;"] = function(addr, id) {
        return J2ME.Constants.NULL;
    };

    Native["com/sun/midp/lcdui/DisplayDevice.isDisplayPrimary0.(I)Z"] = function(addr, id) {
        console.warn("DisplayDevice.isDisplayPrimary0.(I)Z not implemented (" + id + ")");
        return 1;
    };

    Native["com/sun/midp/lcdui/DisplayDevice.isbuildInDisplay0.(I)Z"] = function(addr, id) {
        return 1;
    };

    Native["com/sun/midp/lcdui/DisplayDevice.getDisplayCapabilities0.(I)I"] = function(addr, id) {
        return 0x3ff;
    };

    Native["com/sun/midp/lcdui/DisplayDevice.isDisplayPenSupported0.(I)Z"] = function(addr, id) {
        return 1;
    };

    Native["com/sun/midp/lcdui/DisplayDevice.isDisplayPenMotionSupported0.(I)Z"] = function(addr, id) {
        return 1;
    };

    Native["com/sun/midp/lcdui/DisplayDevice.reverseOrientation0.(I)Z"] = function(addr, id) {
        return 0;
    };

    Native["com/sun/midp/lcdui/DisplayDevice.getReverseOrientation0.(I)Z"] = function(addr, id) {
        return 0;
    };

    Native["com/sun/midp/lcdui/DisplayDevice.getScreenWidth0.(I)I"] = function(addr, id) {
        return offscreenCanvas.width;
    };

    Native["com/sun/midp/lcdui/DisplayDevice.getScreenHeight0.(I)I"] = function(addr, id) {
        return offscreenCanvas.height;
    };

    Native["com/sun/midp/lcdui/DisplayDevice.displayStateChanged0.(II)V"] = function(addr, hardwareId, state) {
        console.warn("DisplayDevice.displayStateChanged0.(II)V not implemented (" + hardwareId + ", " + state + ")");
    };

    Native["com/sun/midp/lcdui/DisplayDevice.gainedForeground0.(II)V"] = function(addr, hardwareId, displayId) {
        hideSplashScreen();

        if (!emoji.loaded) {
          asyncImpl("V", Promise.all(loadingFGPromises));
        }

        if (profile === 2 || profile === 3) {
          // Use setTimeout to make sure our profiling enter/leave stack is not unpaired.
          setTimeout(function () {
            stopAndSaveTimeline();
          }, 0);
        }
    };

    Native["com/sun/midp/lcdui/DisplayDeviceAccess.vibrate0.(IZ)Z"] = function(addr, displayId, on) {
        return 1;
    };

    Native["com/sun/midp/lcdui/DisplayDeviceAccess.isBacklightSupported0.(I)Z"] = function(addr, displayId) {
        return 1;
    };

    var refreshStr = "refresh";
    Native["com/sun/midp/lcdui/DisplayDevice.refresh0.(IIIIII)V"] = function(addr, hardwareId, displayId, x1, y1, x2, y2) {
        x1 = Math.max(0, x1);
        y1 = Math.max(0, y1);
        x2 = Math.max(0, x2);
        y2 = Math.max(0, y2);

        var maxX = Math.min(offscreenCanvas.width, MIDP.deviceContext.canvas.width);
        x1 = Math.min(maxX, x1);
        x2 = Math.min(maxX, x2);

        var maxY = Math.min(offscreenCanvas.height, MIDP.deviceContext.canvas.height);
        y1 = Math.min(maxY, y1);
        y2 = Math.min(maxY, y2);

        var width = x2 - x1;
        var height = y2 - y1;
        if (width <= 0 || height <= 0) {
            return;
        }

        var ctx = $.ctx;
        window.requestAnimationFrame(function() {
            MIDP.deviceContext.drawImage(offscreenCanvas, x1, y1, width, height, x1, y1, width, height);
            J2ME.Scheduler.enqueue(ctx);
        });
        $.pause(refreshStr);
        $.nativeBailout(J2ME.Kind.Void);
    };

    function swapRB(pixel) {
        return (pixel & 0xff00ff00) | ((pixel >> 16) & 0xff) | ((pixel & 0xff) << 16);
    }

    function ABGRToARGB(abgrData, argbData, width, height, offset, scanlength) {
        var i = 0;
        for (var y = 0; y < height; y++) {
            var j = offset + y * scanlength;

            for (var x = 0; x < width; x++) {
                argbData[j++] = swapRB(abgrData[i++]);
            }
        }
    }

    function ABGRToARGB4444(abgrData, argbData, width, height, offset, scanlength) {
        var i = 0;
        for (var y = 0; y < height; y++) {
            var j = offset + y * scanlength;

            for (var x = 0; x < width; x++) {
                var abgr = abgrData[i++];
                argbData[j++] = (abgr & 0xF0000000) >>> 16 |
                                (abgr & 0x000000F0) << 4 |
                                (abgr & 0x0000F000) >> 8 |
                                (abgr & 0x00F00000) >>> 20;
            }
        }
    }

    var ABGRToRGB565_R_MASK = parseInt("000000000000000011111000", 2);
    var ABGRToRGB565_G_MASK = parseInt("000000001111110000000000", 2);
    var ABGRToRGB565_B_MASK = parseInt("111110000000000000000000", 2);

    function ABGRToRGB565(abgrData, rgbData, width, height, offset, scanlength) {
        var i = 0;
        for (var y = 0; y < height; y++) {
            var j = offset + y * scanlength;

            for (var x = 0; x < width; x++) {
                var abgr = abgrData[i++];
                rgbData[j++] = (abgr & ABGRToRGB565_R_MASK) << 8 |
                               (abgr & ABGRToRGB565_G_MASK) >>> 5 |
                               (abgr & ABGRToRGB565_B_MASK) >>> 19;
            }
        }
    }

    function ARGBToABGR(argbData, abgrData, width, height, offset, scanlength) {
        var i = 0;
        for (var y = 0; y < height; ++y) {
            var j = offset + y * scanlength;

            for (var x = 0; x < width; ++x) {
                abgrData[i++] = swapRB(argbData[j++]);
            }
        }
    }

    function ARGBTo1BGR(argbData, abgrData, width, height, offset, scanlength) {
        var i = 0;
        for (var y = 0; y < height; ++y) {
            var j = offset + y * scanlength;

            for (var x = 0; x < width; ++x) {
                abgrData[i++] = swapRB(argbData[j++]) | 0xFF000000;
            }
        }
    }

    function ARGB4444ToABGR(argbData, abgrData, width, height, offset, scanlength) {
        var i = 0;
        for (var y = 0; y < height; ++y) {
            var j = offset + y * scanlength;

            for (var x = 0; x < width; ++x) {
                var argb = argbData[j++];
                abgrData[i++] = (argb & 0xF000) << 16 |
                                (argb & 0x0F00) >>> 4 |
                                (argb & 0x00F0) << 8 |
                                (argb & 0x000F) << 20;
            }
        }
    }

    function initImageData(imageDataAddr, width, height, isMutable) {
        var canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        var contextInfo = new ContextInfo(canvas.getContext("2d"))
        setNative(imageDataAddr, contextInfo);

        var imageData = getHandle(imageDataAddr);

        imageData.width = width;
        imageData.height = height;

        imageData.isMutable = isMutable;

        return contextInfo.context;
    }

    Native["javax/microedition/lcdui/ImageDataFactory.createImmutableImageDecodeImage.(Ljavax/microedition/lcdui/ImageData;[BII)V"] =
    function(addr, imageDataAddr, bytesAddr, offset, length) {
        var bytes = J2ME.getArrayFromAddr(bytesAddr);
        var ctx = $.ctx;
        asyncImpl("V", new Promise(function(resolve, reject) {
            var blob = new Blob([bytes.subarray(offset, offset + length)], { type: "image/png" });
            var img = new Image();
            img.src = URL.createObjectURL(blob);
            img.onload = function() {
                var context = initImageData(imageDataAddr, img.naturalWidth, img.naturalHeight, 0);
                context.drawImage(img, 0, 0);

                URL.revokeObjectURL(img.src);
                resolve();
            }
            img.onerror = function(e) {
               URL.revokeObjectURL(img.src);
               ctx.setAsCurrentContext();
               reject($.newIllegalArgumentException("error decoding image"));
            }
        }));
    };

    Native["javax/microedition/lcdui/ImageDataFactory.createImmutableImageDataRegion.(Ljavax/microedition/lcdui/ImageData;Ljavax/microedition/lcdui/ImageData;IIIIIZ)V"] =
    function(addr, dataDestAddr, dataSourceAddr, x, y, width, height, transform, isMutable) {
        var context = initImageData(dataDestAddr, width, height, isMutable);
        renderRegion(context, NativeMap.get(dataSourceAddr).context.canvas, x, y, width, height, transform, 0, 0, TOP|LEFT);
    };

    Native["javax/microedition/lcdui/ImageDataFactory.createImmutableImageDataCopy.(Ljavax/microedition/lcdui/ImageData;Ljavax/microedition/lcdui/ImageData;)V"] =
    function(addr, destAddr, sourceAddr) {
        var sourceCanvas = NativeMap.get(sourceAddr).context.canvas;
        var context = initImageData(destAddr, sourceCanvas.width, sourceCanvas.height, 0);
        context.drawImage(sourceCanvas, 0, 0);
    };

    Native["javax/microedition/lcdui/ImageDataFactory.createMutableImageData.(Ljavax/microedition/lcdui/ImageData;II)V"] =
    function(addr, imageDataAddr, width, height) {
        var context = initImageData(imageDataAddr, width, height, 1);
        context.fillStyle = "rgb(255,255,255)"; // white
        context.fillRect(0, 0, width, height);
    };

    Native["javax/microedition/lcdui/ImageDataFactory.createImmutableImageDecodeRGBImage.(Ljavax/microedition/lcdui/ImageData;[IIIZ)V"] =
    function(addr, imageDataAddr, rgbDataAddr, width, height, processAlpha) {
        var rgbData = J2ME.getArrayFromAddr(rgbDataAddr);
        var context = initImageData(imageDataAddr, width, height, 0);
        var ctxImageData = context.createImageData(width, height);
        var abgrData = new Int32Array(ctxImageData.data.buffer);

        if (1 === processAlpha) {
            ARGBToABGR(rgbData, abgrData, width, height, 0, width);
        } else {
            ARGBTo1BGR(rgbData, abgrData, width, height, 0, width);
        }

        context.putImageData(ctxImageData, 0, 0);
    };

    Native["javax/microedition/lcdui/ImageData.getRGB.([IIIIIII)V"] =
    function(addr, rgbDataAddr, offset, scanlength, x, y, width, height) {
        var rgbData = J2ME.getArrayFromAddr(rgbDataAddr);
        var abgrData = new Int32Array(NativeMap.get(addr).context.getImageData(x, y, width, height).data.buffer);
        ABGRToARGB(abgrData, rgbData, width, height, offset, scanlength);
    };

    Native["com/nokia/mid/ui/DirectUtils.makeMutable.(Ljavax/microedition/lcdui/Image;)V"] = function(addr, imageAddr) {
        var imageData = getHandle(getHandle(imageAddr).imageData);
        imageData.isMutable = 1;
    };

    Native["com/nokia/mid/ui/DirectUtils.setPixels.(Ljavax/microedition/lcdui/Image;I)V"] = function(addr, imageAddr, argb) {
        var image = getHandle(imageAddr);
        var width = image.width;
        var height = image.height;

        // NOTE: This function will only ever be called by the variants
        // of `DirectUtils.createImage`. We don't have to worry about
        // the dimensions or the context info because this `Image` and
        // this `ImageData` were just created; nothing can be out of
        // sync yet.
        var ctx = NativeMap.get(image.imageData).context;

        var ctxImageData = ctx.createImageData(width, height);
        var pixels = new Int32Array(ctxImageData.data.buffer);

        var color = swapRB(argb);

        var i = 0;
        for (var y = 0; y < height; ++y) {
            for (var x = 0; x < width; ++x) {
                pixels[i++] = color;
            }
        }

        ctx.putImageData(ctxImageData, 0, 0);
    };

    var FACE_SYSTEM = 0;
    var FACE_MONOSPACE = 32;
    var FACE_PROPORTIONAL = 64;
    var STYLE_PLAIN = 0;
    var STYLE_BOLD = 1;
    var STYLE_ITALIC = 2;
    var STYLE_UNDERLINED = 4;
    var SIZE_SMALL = 8;
    var SIZE_MEDIUM = 0;
    var SIZE_LARGE = 16;

    Native["javax/microedition/lcdui/Font.init.(III)V"] = function(addr, face, style, size) {
        var self = getHandle(addr);
        var defaultSize = config.fontSize ? config.fontSize : Math.max(19, (offscreenCanvas.height / 35) | 0);
        if (size & SIZE_SMALL)
            size = defaultSize / 1.25;
        else if (size & SIZE_LARGE)
            size = defaultSize * 1.25;
        else
            size = defaultSize;
        size |= 0;

        if (style & STYLE_BOLD)
            style = "bold ";
        else if (style & STYLE_ITALIC)
            style = "italic ";
        else
            style = "";

        if (face & FACE_MONOSPACE)
            face = "monospace";
        else if (face & FACE_PROPORTIONAL)
            face = "sans-serif";
        else
            face = "Arial,Helvetica,sans-serif";

        self.baseline = size | 0;
        self.height = (size * FONT_HEIGHT_MULTIPLIER) | 0;

        var context = document.createElement("canvas").getContext("2d");
        setNative(addr, context);
        context.canvas.width = 0;
        context.canvas.height = 0;
        context.font = style + size + "px " + face;

        // This is a custom property that we set on the context so we can
        // access it in natives.  Note the difference between this value,
        // which represents the size of the font in pixels, and the Font.size
        // field, which stores one of the three font size bit mask constants
        // (SIZE_SMALL, SIZE_MEDIUM, SIZE_LARGE).
        context.fontSize = size;
    };

    function calcStringWidth(fontContext, str) {
        var emojiLen = 0;

        var len = fontContext.measureText(str.replace(emoji.regEx, function() {
            emojiLen += fontContext.fontSize;
            return "";
        })).width | 0;

        return len + emojiLen;
    }

    var defaultFontAddress;
    function getDefaultFontAddress() {
        if (!defaultFontAddress) {
            var classInfo = CLASSES.loadClass("javax/microedition/lcdui/Font");
            defaultFontAddress = J2ME.allocUncollectableObject(classInfo);
            var methodInfo = classInfo.getMethodByNameString("<init>", "(III)V", false);
            J2ME.preemptionLockLevel++;
            J2ME.getLinkedMethod(methodInfo)(defaultFontAddress, 0, 0, 0);
            release || J2ME.Debug.assert(!U, "Unexpected unwind during createException.");
            J2ME.preemptionLockLevel--;
        }
        return defaultFontAddress;
    }

    Native["javax/microedition/lcdui/Font.getDefaultFont.()Ljavax/microedition/lcdui/Font;"] = function(addr) {
        return getDefaultFontAddress();
    };

    Native["javax/microedition/lcdui/Font.stringWidth.(Ljava/lang/String;)I"] = function(addr, strAddr) {
        var fontContext = NativeMap.get(addr);
        return calcStringWidth(fontContext, J2ME.fromStringAddr(strAddr));
    };

    Native["javax/microedition/lcdui/Font.charWidth.(C)I"] = function(addr, char) {
        var fontContext = NativeMap.get(addr);
        return fontContext.measureText(String.fromCharCode(char)).width | 0;
    };

    Native["javax/microedition/lcdui/Font.charsWidth.([CII)I"] = function(addr, charsAddr, offset, len) {
        var fontContext = NativeMap.get(addr);
        return calcStringWidth(fontContext, J2ME.fromJavaChars(charsAddr, offset, len));
    };

    Native["javax/microedition/lcdui/Font.substringWidth.(Ljava/lang/String;II)I"] = function(addr, strAddr, offset, len) {
        var fontContext = NativeMap.get(addr);
        return calcStringWidth(fontContext, J2ME.fromStringAddr(strAddr).slice(offset, offset + len));
    };

    var HCENTER = 1;
    var VCENTER = 2;
    var LEFT = 4;
    var RIGHT = 8;
    var TOP = 16;
    var BOTTOM = 32;
    var BASELINE = 64;

    function withTextAnchor(c, fontContext, anchor, x, str) {
        if (anchor & RIGHT || anchor & HCENTER) {
            var w = calcStringWidth(fontContext, str);

            if (anchor & RIGHT) {
                x -= w;
            } else if (anchor & HCENTER) {
                x -= (w >>> 1) | 0;
            }
        }

        if (anchor & BOTTOM) {
            c.textBaseline = "bottom";
        } else if (anchor & BASELINE) {
            c.textBaseline = "alphabetic";
        } else if (anchor & VCENTER) {
            throw $.newIllegalArgumentException("VCENTER not allowed with text");
        } else {
            c.textBaseline = "top";
        }

        return x;
    }

    /**
     * create the outline of an elliptical arc
     * covering the specified rectangle.
     * @param x the x-coordinate of the center of the ellipse.
     * @param y y-coordinate of the center of the ellipse.
     * @param rw the horizontal radius of the arc.
     * @param rh the vertical radius of the arc.
     * @param arcStart the beginning angle
     * @param arcEnd the ending angle
     * @param closed if true, draw a closed arc sector.
     */
    function createEllipticalArc(c, x, y, rw, rh, arcStart, arcEnd, closed) {
          c.save();
          c.translate(x, y);
          if (closed) {
            c.moveTo(0, 0);
          }
          // draw circle arc which will be stretched into an oval arc
          c.scale(1, rh / rw);
          c.arc(0, 0, rw, arcStart, arcEnd, false);
          if (closed) {
            c.lineTo(0, 0);
          }
          c.restore();
    }

    /**
     * Create a round rectangle path.
     * @param x the x coordinate of the rectangle
     * @param y the y coordinate of the rectangle
     * @param width the width of the rectangle
     * @param height the height of the rectangle
     * @param arcWidth the horizontal diameter of the arc at the four corners
     * @param arcHeight the vertical diameter of the arc at the four corners
     */
    function createRoundRect(c, x, y, width, height, arcWidth, arcHeight) {
        var rw = arcWidth / 2;
        var rh = arcHeight / 2;
        c.moveTo(x + rw, y);
        c.lineTo(x + width - rw, y);
        createEllipticalArc(c, x + width - rw, y + rh, rw, rh, 1.5 * Math.PI, 2 * Math.PI, false);
        c.lineTo(x + width, y + height - rh);
        createEllipticalArc(c, x + width - rw, y + height - rh, rw, rh, 0, 0.5 * Math.PI, false);
        c.lineTo(x + rw, y + height);
        createEllipticalArc(c, x + rw, y + height - rh, rw, rh, 0.5 * Math.PI, Math.PI, false);
        c.lineTo(x, y + rh);
        createEllipticalArc(c, x + rw, y + rh, rw, rh, Math.PI, 1.5 * Math.PI, false);
    }

    Native["javax/microedition/lcdui/Graphics.getDisplayColor.(I)I"] = function(addr, color) {
        return color & 0x00FFFFFF;
    };

    Native["javax/microedition/lcdui/Graphics.resetGC.()V"] = function(addr) {
        NativeMap.get(addr).resetGC();
    };

    Native["javax/microedition/lcdui/Graphics.reset.(IIII)V"] = function(addr, x1, y1, x2, y2) {
        NativeMap.get(addr).reset(x1, y1, x2, y2);
    };

    Native["javax/microedition/lcdui/Graphics.reset.()V"] = function(addr) {
        var info = NativeMap.get(addr);
        info.reset(0, 0, info.contextInfo.context.canvas.width, info.contextInfo.context.canvas.height);
    };

    Native["javax/microedition/lcdui/Graphics.copyArea.(IIIIIII)V"] = function(addr, x_src, y_src, width, height, x_dest, y_dest, anchor) {
        var self = getHandle(addr);
        if (isScreenGraphics(self)) {
            throw $.newIllegalStateException();
        }
        console.warn("javax/microedition/lcdui/Graphics.copyArea.(IIIIIII)V not implemented");
    };

    Native["javax/microedition/lcdui/Graphics.setDimensions.(II)V"] = function(addr, w, h) {
        NativeMap.get(addr).resetNonGC(0, 0, w, h);
    };

    Native["javax/microedition/lcdui/Graphics.translate.(II)V"] = function(addr, x, y) {
        NativeMap.get(addr).translate(x, y);
    };

    Native["javax/microedition/lcdui/Graphics.getTranslateX.()I"] = function(addr) {
        return NativeMap.get(addr).transX;
    };

    Native["javax/microedition/lcdui/Graphics.getTranslateY.()I"] = function(addr) {
        return NativeMap.get(addr).transY;
    };

    Native["javax/microedition/lcdui/Graphics.getMaxWidth.()S"] = function(addr) {
        return NativeMap.get(addr).contextInfo.context.canvas.width;
    };

    Native["javax/microedition/lcdui/Graphics.getMaxHeight.()S"] = function(addr) {
        return NativeMap.get(addr).contextInfo.context.canvas.height;
    };

    Native["javax/microedition/lcdui/Graphics.getCreator.()Ljava/lang/Object;"] = function(addr) {
        var self = getHandle(addr);
        return self.creator;
    };

    Native["javax/microedition/lcdui/Graphics.setCreator.(Ljava/lang/Object;)V"] = function(addr, creatorAddr) {
        var self = getHandle(addr);
        // Per the original, non-native implementation of this method,
        // ignore repeated attempts to set creator.
        if (self.creator === J2ME.Constants.NULL) {
            self.creator = creatorAddr;
        }
    };

    Native["javax/microedition/lcdui/Graphics.getColor.()I"] = function(addr) {
        var info = NativeMap.get(addr);
        return (info.red << 16) | (info.green << 8) | info.blue;
    };

    Native["javax/microedition/lcdui/Graphics.getRedComponent.()I"] = function(addr) {
        return NativeMap.get(addr).red;
    };

    Native["javax/microedition/lcdui/Graphics.getGreenComponent.()I"] = function(addr) {
        return NativeMap.get(addr).green;
    };

    Native["javax/microedition/lcdui/Graphics.getBlueComponent.()I"] = function(addr) {
        return NativeMap.get(addr).blue;
    };

    Native["javax/microedition/lcdui/Graphics.getGrayScale.()I"] = function(addr) {
        var info = NativeMap.get(addr);
        return (info.red*76 + info.green*150 + info.blue*29) >>> 8;
    };

    Native["javax/microedition/lcdui/Graphics.setColor.(III)V"] = function(addr, red, green, blue) {
        if ((red < 0)   || (red > 255)
            || (green < 0) || (green > 255)
            || (blue < 0)  || (blue > 255)) {
            throw $.newIllegalArgumentException("Value out of range");
        }

        NativeMap.get(addr).setPixel(0xFF, red, green, blue);
    };

    Native["javax/microedition/lcdui/Graphics.setColor.(I)V"] = function(addr, rgb) {
        var red = (rgb >>> 16) & 0xFF;
        var green = (rgb >>> 8) & 0xFF;
        var blue = rgb & 0xFF;

        // NOTE: One would probably expect that `Graphics.setColor`
        // would always set the alpha value to 0xFF but that is not
        // the case if the current RGB value is the same as
        // value being set. This is the behavior
        // of the reference implementation so we are copying
        // that behavior.
        var info = NativeMap.get(addr);
        if (red != info.red || green != info.green || blue != info.blue) {
            info.setPixel(0xFF, red, green, blue);
        }
    };

    Native["javax/microedition/lcdui/Graphics.setGrayScale.(I)V"] = function(addr, value) {
        if ((value < 0) || (value > 255)) {
            throw $.newIllegalArgumentException("Gray value out of range");
        }

        // NOTE: One would probably expect that `Graphics.setGrayScale`
        // would always set the alpha value to 0xFF but that is not
        // the case if the red, green, and blue color values are
        // the same as the values being set. This is the behavior
        // of the reference implementation so we are copying
        // that behavior.
        var info = NativeMap.get(addr);
        if (value != info.red || value != info.green || value != info.blue) {
            info.setPixel(0xFF, value, value, value);
        }
    };

    Native["javax/microedition/lcdui/Graphics.getFont.()Ljavax/microedition/lcdui/Font;"] = function(addr) {
        return NativeMap.get(addr).currentFont;
    };

    Native["javax/microedition/lcdui/Graphics.setFont.(Ljavax/microedition/lcdui/Font;)V"] = function(addr, fontAddr) {
        NativeMap.get(addr).setFont(fontAddr);
    };

    var SOLID = 0;
    var DOTTED = 1;
    Native["javax/microedition/lcdui/Graphics.setStrokeStyle.(I)V"] = function(addr, style) {
        if ((style !== SOLID) && (style !== DOTTED)) {
            throw $.newIllegalArgumentException("Invalid stroke style");
        }

        // We don't actually implement DOTTED style so this is a no-op
    };

    Native["javax/microedition/lcdui/Graphics.getStrokeStyle.()I"] = function(addr) {
        return SOLID;
    };

    Native["javax/microedition/lcdui/Graphics.getClipX.()I"] = function(addr) {
        var info = NativeMap.get(addr);
        return info.clipX1 - info.transX;
    };

    Native["javax/microedition/lcdui/Graphics.getClipY.()I"] = function(addr) {
        var info = NativeMap.get(addr);
        return info.clipY1 - info.transY;
    };

    Native["javax/microedition/lcdui/Graphics.getClipWidth.()I"] = function(addr) {
        var info = NativeMap.get(addr);
        return info.clipX2 - info.clipX1;
    };

    Native["javax/microedition/lcdui/Graphics.getClipHeight.()I"] = function(addr) {
        var info = NativeMap.get(addr);
        return info.clipY2 - info.clipY1;
    };

    Native["javax/microedition/lcdui/Graphics.getClip.([I)V"] = function(addr, regionAddr) {
        var region = J2ME.getArrayFromAddr(regionAddr);
        var info = NativeMap.get(addr);
        region[0] = info.clipX1 - info.transX;
        region[1] = info.clipY1 - info.transY;
        region[2] = info.clipX2 - info.transX;
        region[3] = info.clipY2 - info.transY;
    };

    Native["javax/microedition/lcdui/Graphics.clipRect.(IIII)V"] = function(addr, x, y, width, height) {
        var info = NativeMap.get(addr);
        info.setClip(x, y, width, height, info.clipX1, info.clipY1, info.clipX2, info.clipY2);
    };

    // DirectGraphics constants
    var TYPE_USHORT_4444_ARGB = 4444;
    var TYPE_USHORT_565_RGB = 565;

    Native["com/nokia/mid/ui/DirectGraphicsImp.setARGBColor.(I)V"] = function(addr, argb) {
        var self = getHandle(addr);
        var alpha = (argb >>> 24);
        var red = (argb >>> 16) & 0xFF;
        var green = (argb >>> 8) & 0xFF;
        var blue = argb & 0xFF;
        NativeMap.get(self.graphics).setPixel(alpha, red, green, blue);
    };

    Native["com/nokia/mid/ui/DirectGraphicsImp.getAlphaComponent.()I"] = function(addr) {
        var self = getHandle(addr);
        return NativeMap.get(self.graphics).alpha;
    };

    Native["com/nokia/mid/ui/DirectGraphicsImp.getPixels.([SIIIIIII)V"] =
    function(addr, pixelsAddr, offset, scanlength, x, y, width, height, format) {
        var self = getHandle(addr);
        var pixels = J2ME.getArrayFromAddr(pixelsAddr);

        if (!pixels) {
            throw $.newNullPointerException("Pixels array is null");
        }

        var converterFunc = null;
        if (format === TYPE_USHORT_4444_ARGB) {
            converterFunc = ABGRToARGB4444;
        } else if (format === TYPE_USHORT_565_RGB) {
            converterFunc = ABGRToRGB565;
        } else {
            throw $.newIllegalArgumentException("Format unsupported");
        }

        var context = NativeMap.get(self.graphics).contextInfo.context;
        var abgrData = new Int32Array(context.getImageData(x, y, width, height).data.buffer);
        converterFunc(abgrData, pixels, width, height, offset, scanlength);
    };

    Native["com/nokia/mid/ui/DirectGraphicsImp.drawPixels.([SZIIIIIIII)V"] =
    function(addr, pixelsAddr, transparency, offset, scanlength, x, y, width, height, manipulation, format) {
        var self = getHandle(addr);
        var pixels = J2ME.getArrayFromAddr(pixelsAddr);

        if (!pixels) {
            throw $.newNullPointerException("Pixels array is null");
        }

        var converterFunc = null;
        if (format === TYPE_USHORT_4444_ARGB && transparency && !manipulation) {
            converterFunc = ARGB4444ToABGR;
        } else {
            throw $.newIllegalArgumentException("Format unsupported");
        }

        tempContext.canvas.width = width;
        tempContext.canvas.height = height;
        var imageData = tempContext.createImageData(width, height);
        var abgrData = new Int32Array(imageData.data.buffer);

        converterFunc(pixels, abgrData, width, height, offset, scanlength);

        tempContext.putImageData(imageData, 0, 0);

        var c = NativeMap.get(self.graphics).getGraphicsContext();

        c.drawImage(tempContext.canvas, x, y);
        tempContext.canvas.width = 0;
        tempContext.canvas.height = 0;
    };

    Native["javax/microedition/lcdui/Graphics.render.(Ljavax/microedition/lcdui/Image;III)Z"] =
    function(addr, imageAddr, x, y, anchor) {
        var image = getHandle(imageAddr);
        renderRegion(NativeMap.get(addr).getGraphicsContext(), NativeMap.get(image.imageData).context.canvas,
                     0, 0, image.width, image.height, TRANS_NONE, x, y, anchor);
        return 1;
    };

    Native["javax/microedition/lcdui/Graphics.drawRegion.(Ljavax/microedition/lcdui/Image;IIIIIIII)V"] =
    function(addr, srcAddr, x_src, y_src, width, height, transform, x_dest, y_dest, anchor) {
        if (srcAddr === J2ME.Constants.NULL) {
            throw $.newNullPointerException("src image is null");
        }

        var src = getHandle(srcAddr);
        renderRegion(NativeMap.get(addr).getGraphicsContext(), NativeMap.get(src.imageData).context.canvas,
                     x_src, y_src, width, height, transform, x_dest, y_dest, anchor);
    };

    Native["javax/microedition/lcdui/Graphics.drawImage.(Ljavax/microedition/lcdui/Image;III)V"] =
    function(addr, imageAddr, x, y, anchor) {
        if (imageAddr === J2ME.Constants.NULL) {
            throw $.newNullPointerException("image is null");
        }

        var image = getHandle(imageAddr);
        var imageData = getHandle(image.imageData);
        renderRegion(NativeMap.get(addr).getGraphicsContext(), NativeMap.get(image.imageData).context.canvas,
                     0, 0, imageData.width, imageData.height, TRANS_NONE, x, y, anchor);
    };

    function GraphicsInfo(contextInfo) {
        this.contextInfo = contextInfo;

        // non-GC info
        this.transX = 0;
        this.transY = 0;
        this.clipX1 = 0;
        this.clipY1 = 0;
        this.clipX2 = contextInfo.context.canvas.width;
        this.clipY2 = contextInfo.context.canvas.height;

        // GC info
        this.currentFont = getDefaultFontAddress();
        this.alpha = 0xFF;
        this.red = 0x00;
        this.green = 0x00;
        this.blue = 0x00;
    }

    GraphicsInfo.prototype.setFont = function(font) {
        if (J2ME.Constants.NULL === font) {
            font = getDefaultFontAddress();
        }

        if (this.currentFont !== font) {
            this.currentFont = font;
            if (this.contextInfo.currentlyAppliedGraphicsInfo === this) {
                this.contextInfo.currentlyAppliedGraphicsInfo = null;
            }
        }
    }

    GraphicsInfo.prototype.setPixel = function(alpha, red, green, blue) {
        if (this.alpha !== alpha || this.red !== red || this.green !== green || this.blue !== blue) {
            this.alpha = alpha;
            this.red = red;
            this.green = green;
            this.blue = blue;

            if (this.contextInfo.currentlyAppliedGraphicsInfo === this) {
                this.contextInfo.currentlyAppliedGraphicsInfo = null;
            }
        }
    }

    GraphicsInfo.prototype.resetGC = function() {
        this.setFont(J2ME.Constants.NULL);
        this.setPixel(0xFF, 0x00, 0x00, 0x00);
    }

    GraphicsInfo.prototype.reset = function(x1, y1, x2, y2) {
        this.resetGC();
        this.resetNonGC(x1, y1, x2, y2);
    }

    GraphicsInfo.prototype.resetNonGC = function(x1, y1, x2, y2) {
        this.translate(-this.transX, -this.transY);
        this.setClip(x1, y1, x2 - x1, y2 - y1, 0, 0, this.contextInfo.context.canvas.width, this.contextInfo.context.canvas.height);
    }

    GraphicsInfo.prototype.translate = function(x, y) {
        x = x | 0;
        y = y | 0;
        if (x !== 0 || y !== 0) {
            this.transX += x;
            this.transY += y;

            if (this.contextInfo.currentlyAppliedGraphicsInfo === this) {
                this.contextInfo.currentlyAppliedGraphicsInfo = null;
            }
        }
    }

    GraphicsInfo.prototype.setClip = function(x, y, width, height, minX, minY, maxX, maxY) {
        var newX1 = x + this.transX;
        var newY1 = y + this.transY;
        var newX2 = newX1 + width;
        var newY2 = newY1 + height;

        newX1 = Math.max(minX, newX1) & 0x7fff;
        newY1 = Math.max(minY, newY1) & 0x7fff;
        newX2 = Math.min(maxX, newX2) & 0x7fff;
        newY2 = Math.min(maxY, newY2) & 0x7fff;

        if (width <= 0 || height <= 0 || newX2 <= newX1 || newY2 <= newY1) {
            newX1 = newY1 = newX2 = newY2 = 0;
        }

        if (this.clipX1 === newX1 && this.clipY1 === newY1 && this.clipX2 === newX2 && this.clipY2 === newY2) {
            return;
        }

        if (this.contextInfo.currentlyAppliedGraphicsInfo === this) {
            this.contextInfo.currentlyAppliedGraphicsInfo = null;
        }

        this.clipX1 = newX1;
        this.clipY1 = newY1;
        this.clipX2 = newX2;
        this.clipY2 = newY2;
    }

    GraphicsInfo.prototype.getGraphicsContext = function() {
        if (this.contextInfo.currentlyAppliedGraphicsInfo !== this) {
            this.contextInfo.applyGraphics(this);
        }

        return this.contextInfo.context;
    }

    function ContextInfo(ctx) {
        this.currentlyAppliedGraphicsInfo = null;
        this.context = ctx;
        ctx.save();
    }

    ContextInfo.prototype.applyGraphics = function(graphicsInfo) {
        this.context.restore();
        this.context.save();

        this.context.textAlign = "left";

        this.context.fillStyle = this.context.strokeStyle = util.rgbaToCSS(graphicsInfo.red, graphicsInfo.green, graphicsInfo.blue, graphicsInfo.alpha / 255);
        this.context.font = NativeMap.get(graphicsInfo.currentFont).font;

        this.context.beginPath();
        this.context.rect(graphicsInfo.clipX1, graphicsInfo.clipY1, graphicsInfo.clipX2 - graphicsInfo.clipX1, graphicsInfo.clipY2 - graphicsInfo.clipY1);
        this.context.clip();
        this.context.translate(graphicsInfo.transX, graphicsInfo.transY);

        this.currentlyAppliedGraphicsInfo = graphicsInfo;
    };

    Native["javax/microedition/lcdui/Graphics.initScreen0.(I)V"] = function(addr, displayId) {
        var self = getHandle(addr);
        self.displayId = displayId;
        setNative(addr, new GraphicsInfo(screenContextInfo));
        self.creator = J2ME.Constants.NULL;
    };

    Native["javax/microedition/lcdui/Graphics.initImage0.(Ljavax/microedition/lcdui/Image;)V"] =
    function(addr, imgAddr) {
        var self = getHandle(addr);
        var img = getHandle(imgAddr);
        self.displayId = -1;
        setNative(addr, new GraphicsInfo(NativeMap.get(img.imageData)));
        self.creator = J2ME.Constants.NULL;
    };

    function isScreenGraphics(g) {
        return g.displayId !== -1;
    }

    Native["javax/microedition/lcdui/Graphics.setClip.(IIII)V"] = function(addr, x, y, w, h) {
        var info = NativeMap.get(addr);
        info.setClip(x, y, w, h, 0, 0, info.contextInfo.context.canvas.width, info.contextInfo.context.canvas.height);
    };

    function drawString(info, str, x, y, anchor) {
        var c = info.getGraphicsContext();
        var fontContext = NativeMap.get(info.currentFont);
        var fontSize = fontContext.fontSize;

        var finalText;
        if (!emoji.regEx.test(str)) {
            // No emojis are present.
            finalText = str;
        } else {
            // Emojis are present. Handle all the text up to the last emoji.
            var match;
            var lastIndex = 0;
            emoji.regEx.lastIndex = 0;
            while (match = emoji.regEx.exec(str)) {
                var text = str.substring(lastIndex, match.index);
                var match0 = match[0];
                lastIndex = match.index + match0.length;

                var textX = withTextAnchor(c, fontContext, anchor, x, text);

                c.fillText(text, textX, y);

                // Calculate the string width.
                x += c.measureText(text).width | 0;

                var emojiData = emoji.getData(match0, fontSize);
                c.drawImage(emojiData.img, emojiData.x, 0, emoji.squareSize, emoji.squareSize, x, y, fontSize, fontSize);
                x += fontSize;
            }
            finalText = str.substring(lastIndex);
        }

        // Now handle all the text after the final emoji. If there were no
        // emojis present, this is the entire string.
        if (finalText) {
            var textX = withTextAnchor(c, fontContext, anchor, x, finalText);
            c.fillText(finalText, textX, y);
        }
    }

    Native["javax/microedition/lcdui/Graphics.drawString.(Ljava/lang/String;III)V"] =
    function(addr, strAddr, x, y, anchor) {
        drawString(NativeMap.get(addr), J2ME.fromStringAddr(strAddr), x, y, anchor);
    };

    Native["javax/microedition/lcdui/Graphics.drawSubstring.(Ljava/lang/String;IIIII)V"] =
    function(addr, strAddr, offset, len, x, y, anchor) {
        drawString(NativeMap.get(addr), J2ME.fromStringAddr(strAddr).substr(offset, len), x, y, anchor);
    };

    Native["javax/microedition/lcdui/Graphics.drawChars.([CIIIII)V"] =
    function(addr, dataAddr, offset, len, x, y, anchor) {
        drawString(NativeMap.get(addr), J2ME.fromJavaChars(dataAddr, offset, len), x, y, anchor);
    };

    Native["javax/microedition/lcdui/Graphics.drawChar.(CIII)V"] = function(addr, jChr, x, y, anchor) {
        var chr = String.fromCharCode(jChr);
        var info = NativeMap.get(addr);

        var c = info.getGraphicsContext();

        x = withTextAnchor(c, NativeMap.get(info.currentFont), anchor, x, chr);

        c.fillText(chr, x, y);
    };

    Native["javax/microedition/lcdui/Graphics.fillTriangle.(IIIIII)V"] = function(addr, x1, y1, x2, y2, x3, y3) {
        var c = NativeMap.get(addr).getGraphicsContext();

        var dx1 = (x2 - x1) || 1;
        var dy1 = (y2 - y1) || 1;
        var dx2 = (x3 - x1) || 1;
        var dy2 = (y3 - y1) || 1;

        c.beginPath();
        c.moveTo(x1, y1);
        c.lineTo(x1 + dx1, y1 + dy1);
        c.lineTo(x1 + dx2, y1 + dy2);
        c.closePath();
        c.fill();
    };

    Native["javax/microedition/lcdui/Graphics.drawRect.(IIII)V"] = function(addr, x, y, w, h) {
        if (w < 0 || h < 0) {
            return;
        }

        var c = NativeMap.get(addr).getGraphicsContext();

        w = w || 1;
        h = h || 1;

        c.strokeRect(x, y, w, h);
    };

    Native["javax/microedition/lcdui/Graphics.drawRoundRect.(IIIIII)V"] = function(addr, x, y, w, h, arcWidth, arcHeight) {
        if (w < 0 || h < 0) {
            return;
        }

        var c = NativeMap.get(addr).getGraphicsContext();

        w = w || 1;
        h = h || 1;

        c.beginPath();
        createRoundRect(c, x, y, w, h, arcWidth, arcHeight);
        c.stroke();
    };

    Native["javax/microedition/lcdui/Graphics.fillRect.(IIII)V"] = function(addr, x, y, w, h) {
        if (w <= 0 || h <= 0) {
            return;
        }

        var c = NativeMap.get(addr).getGraphicsContext();

        w = w || 1;
        h = h || 1;

        c.fillRect(x, y, w, h);
    };

    Native["javax/microedition/lcdui/Graphics.fillRoundRect.(IIIIII)V"] = function(addr, x, y, w, h, arcWidth, arcHeight) {
        if (w <= 0 || h <= 0) {
            return;
        }

        var c = NativeMap.get(addr).getGraphicsContext();

        w = w || 1;
        h = h || 1;

        c.beginPath();
        createRoundRect(c, x, y, w, h, arcWidth, arcHeight);
        c.fill();
    };

    Native["javax/microedition/lcdui/Graphics.drawArc.(IIIIII)V"] = function(addr, x, y, width, height, startAngle, arcAngle) {
        if (width < 0 || height < 0) {
            return;
        }

        var c = NativeMap.get(addr).getGraphicsContext();

        var endRad = -startAngle * 0.0175;
        var startRad = endRad - arcAngle * 0.0175;
        c.beginPath();
        createEllipticalArc(c, x, y, width / 2, height / 2, startRad, endRad, false);
        c.stroke();
    };

    Native["javax/microedition/lcdui/Graphics.fillArc.(IIIIII)V"] = function(addr, x, y, width, height, startAngle, arcAngle) {
        if (width <= 0 || height <= 0) {
            return;
        }

        var c = NativeMap.get(addr).getGraphicsContext();

        var endRad = -startAngle * 0.0175;
        var startRad = endRad - arcAngle * 0.0175;
        c.beginPath();
        c.moveTo(x, y);
        createEllipticalArc(c, x, y, width / 2, height / 2, startRad, endRad, true);
        c.moveTo(x, y);
        c.fill();
    };

    var TRANS_NONE = 0;
    var TRANS_MIRROR_ROT180 = 1;
    var TRANS_MIRROR = 2;
    var TRANS_ROT180 = 3;
    var TRANS_MIRROR_ROT270 = 4;
    var TRANS_ROT90 = 5;
    var TRANS_ROT270 = 6;
    var TRANS_MIRROR_ROT90 = 7;

    function renderRegion(dstContext, srcCanvas, sx, sy, sw, sh, transform, absX, absY, anchor) {
        var w, h;
        switch (transform) {
            case TRANS_NONE:
            case TRANS_ROT180:
            case TRANS_MIRROR:
            case TRANS_MIRROR_ROT180:
                w = sw;
                h = sh;
                break;
            case TRANS_ROT90:
            case TRANS_ROT270:
            case TRANS_MIRROR_ROT90:
            case TRANS_MIRROR_ROT270:
                w = sh;
                h = sw;
                break;
        }

        // Make `absX` and `absY` the top-left coordinates where we will
        // place the image in absolute coordinates
        if (0 !== (anchor & HCENTER)) {
            absX -= ((w >>> 1) | 0);
        } else if (0 !== (anchor & RIGHT)) {
            absX -= w;
        }
        if (0 !== (anchor & VCENTER)) {
            absY -= ((h >>> 1) | 0);
        } else if (0 !== (anchor & BOTTOM)) {
            absY -= h;
        }

        var x, y;
        switch (transform) {
            case TRANS_NONE:
                x = absX;
                y = absY;
                break;
            case TRANS_ROT90:
                dstContext.rotate(Math.PI / 2);
                x = absY;
                y = -absX - w;
                break;
            case TRANS_ROT180:
                dstContext.rotate(Math.PI);
                x = -absX - w;
                y = -absY - h;
                break;
            case TRANS_ROT270:
                dstContext.rotate(Math.PI * 1.5);
                x = -absY - h;
                y = absX;
                break;
            case TRANS_MIRROR:
                dstContext.scale(-1, 1);
                x = -absX - w;
                y = absY;
                break;
            case TRANS_MIRROR_ROT90:
                dstContext.rotate(Math.PI / 2);
                dstContext.scale(-1, 1);
                x = -absY - h;
                y = -absX - w;
                break;
            case TRANS_MIRROR_ROT180:
                dstContext.scale(1, -1);
                x = absX;
                y = -absY - h;
                break;
            case TRANS_MIRROR_ROT270:
                dstContext.rotate(Math.PI * 1.5);
                dstContext.scale(-1, 1);
                x = absY;
                y = absX;
                break;
        }

        dstContext.drawImage(srcCanvas, sx, sy, sw, sh, x, y, sw, sh);

        switch (transform) {
            case TRANS_NONE:
                break;
            case TRANS_ROT90:
                dstContext.rotate(Math.PI * 1.5);
                break;
            case TRANS_ROT180:
                dstContext.rotate(Math.PI);
                break;
            case TRANS_ROT270:
                dstContext.rotate(Math.PI / 2);
                break;
            case TRANS_MIRROR:
                dstContext.scale(-1, 1);
                break;
            case TRANS_MIRROR_ROT90:
                dstContext.scale(-1, 1);
                dstContext.rotate(Math.PI * 1.5);
                break;
            case TRANS_MIRROR_ROT180:
                dstContext.scale(1, -1);
                break;
            case TRANS_MIRROR_ROT270:
                dstContext.scale(-1, 1);
                dstContext.rotate(Math.PI / 2);
                break;
        }
    };

    Native["javax/microedition/lcdui/Graphics.drawLine.(IIII)V"] = function(addr, x1, y1, x2, y2) {
        var c = NativeMap.get(addr).getGraphicsContext();

        // If we're drawing a completely vertical line that is
        // 1 pixel thick, we should draw it at half-pixel offsets.
        // Otherwise, half of the line's thickness lies to the left
        // of the pixel and half to the right.
        if (x1 === x2) {
            x1 += 0.5;
            x2 += 0.5;
        }

        // If we're drawing a completely horizontal line that is
        // 1 pixel thick, we should draw it at half-pixel offsets.
        // Otherwise, half of the line's thickness lies above
        // the pixel and half below.
        if (y1 === y2) {
            y1 += 0.5;
            y2 += 0.5;
        }

        c.beginPath();
        c.moveTo(x1, y1);
        c.lineTo(x2, y2);
        c.stroke();
        c.closePath();
    };

    Native["javax/microedition/lcdui/Graphics.drawRGB.([IIIIIIIZ)V"] =
    function(addr, rgbDataAddr, offset, scanlength, x, y, width, height, processAlpha) {
        var rgbData = J2ME.getArrayFromAddr(rgbDataAddr);
        tempContext.canvas.height = height;
        tempContext.canvas.width = width;
        var imageData = tempContext.createImageData(width, height);
        var abgrData = new Int32Array(imageData.data.buffer);

        if (1 === processAlpha) {
            ARGBToABGR(rgbData, abgrData, width, height, offset, scanlength);
        } else {
            ARGBTo1BGR(rgbData, abgrData, width, height, offset, scanlength);
        }

        tempContext.putImageData(imageData, 0, 0);

        var c = NativeMap.get(addr).getGraphicsContext();

        c.drawImage(tempContext.canvas, x, y);
        tempContext.canvas.width = 0;
        tempContext.canvas.height = 0;
    };

    var textEditorId = 0,
        textEditorResolve = null,
        dirtyEditors = [];

    function wakeTextEditorThread(textEditorAddr) {
        dirtyEditors.push(textEditorAddr);
        if (textEditorResolve) {
            textEditorResolve();
            textEditorResolve = null;
        }
    }

    function getTextEditorCaretPosition(nativeTextEditor, textEditor) {
        if (nativeTextEditor.isAttached()) {
            return nativeTextEditor.getSelectionStart();
        }
        if (textEditor.caretPosition !== null) {
            return textEditor.caretPosition;
        }
        return 0;
    }

    function setTextEditorCaretPosition(nativeTextEditor, textEditor, index) {
        if (nativeTextEditor.isAttached()) {
            nativeTextEditor.setSelectionRange(index, index);
        } else {
            textEditor.caretPosition = index;
        }
    };

    Native["com/nokia/mid/ui/TextEditor.init.(Ljava/lang/String;IIII)V"] =
    function(addr, textAddr, maxSize, constraints, width, height) {
        var self = getHandle(addr);

        if (constraints !== 0) {
            console.warn("TextEditor.constraints not implemented");
        }

        var textEditor = TextEditorProvider.getEditor(constraints, null, ++textEditorId);
        setNative(addr, textEditor);
        textEditor.setBackgroundColor(0xFFFFFFFF | 0); // opaque white
        textEditor.setForegroundColor(0xFF000000 | 0); // opaque black

        textEditor.setAttribute("maxlength", maxSize);
        textEditor.setSize(width, height);
        textEditor.setVisible(false);
        textEditor.setFont(self.font);

        textEditor.setContent(J2ME.fromStringAddr(textAddr));
        setTextEditorCaretPosition(textEditor, self, textEditor.getContentSize());

        textEditor.oninput(function(e) {
            wakeTextEditorThread(addr);
        });
    };

    Native["com/nokia/mid/ui/CanvasItem.attachNativeImpl.()V"] = function(addr) {
        var self = getHandle(addr);
        var textEditor = NativeMap.get(addr);
        if (textEditor) {
            textEditor.attach();
            if (self.caretPosition !== 0) {
                textEditor.setSelectionRange(self.caretPosition, self.caretPosition);
                self.caretPosition = null;
            }
        }
    };

    Native["com/nokia/mid/ui/CanvasItem.detachNativeImpl.()V"] = function(addr) {
        var self = getHandle(addr);
        var textEditor = NativeMap.get(addr);
        if (textEditor) {
            self.caretPosition = textEditor.getSelectionStart();
            textEditor.detach();
        }
    };

    Native["javax/microedition/lcdui/Display.setTitle.(Ljava/lang/String;)V"] = function(addr, titleAddr) {
        document.getElementById("display_title").textContent = J2ME.fromStringAddr(titleAddr);
    };

    Native["com/nokia/mid/ui/CanvasItem.setSize.(II)V"] = function(addr, width, height) {
        NativeMap.get(addr).setSize(width, height);
    };

    Native["com/nokia/mid/ui/CanvasItem.setVisible.(Z)V"] = function(addr, visible) {
        NativeMap.get(addr).setVisible(visible ? true : false);
    };

    Native["com/nokia/mid/ui/CanvasItem.getWidth.()I"] = function(addr) {
        return NativeMap.get(addr).getWidth();
    };

    Native["com/nokia/mid/ui/CanvasItem.getHeight.()I"] = function(addr) {
        return NativeMap.get(addr).getHeight();
    };

    Native["com/nokia/mid/ui/CanvasItem.setPosition0.(II)V"] = function(addr, x, y) {
        NativeMap.get(addr).setPosition(x, y);
    };

    Native["com/nokia/mid/ui/CanvasItem.getPositionX.()I"] = function(addr) {
        return NativeMap.get(addr).getLeft();
    };

    Native["com/nokia/mid/ui/CanvasItem.getPositionY.()I"] = function(addr) {
        return NativeMap.get(addr).getTop();
    };

    Native["com/nokia/mid/ui/CanvasItem.isVisible.()Z"] = function(addr) {
        return NativeMap.get(addr).visible ? 1 : 0;
    };

    Native["com/nokia/mid/ui/TextEditor.setConstraints.(I)V"] = function(addr, constraints) {
        var textEditor = NativeMap.get(addr);
        setNative(addr, TextEditorProvider.getEditor(constraints, textEditor, textEditor.id));
    };

    Native["com/nokia/mid/ui/TextEditor.getConstraints.()I"] = function(addr) {
        return NativeMap.get(addr).constraints;
    };

    Native["com/nokia/mid/ui/TextEditor.setFocus.(Z)V"] = function(addr, shouldFocus) {
        var textEditor = NativeMap.get(addr);
        var promise;
        if (shouldFocus && (currentlyFocusedTextEditor !== textEditor)) {
            promise = textEditor.focus();
            currentlyFocusedTextEditor = textEditor;
        } else if (!shouldFocus && (currentlyFocusedTextEditor === textEditor)) {
            promise = textEditor.blur();
            currentlyFocusedTextEditor = null;
        } else {
            return;
        }
        asyncImpl("V", promise);
    };

    Native["com/nokia/mid/ui/TextEditor.hasFocus.()Z"] = function(addr) {
        return (NativeMap.get(addr) === currentlyFocusedTextEditor) ? 1 : 0;
    };

    Native["com/nokia/mid/ui/TextEditor.setCaret.(I)V"] = function(addr, index) {
        var self = getHandle(addr);
        var textEditor = NativeMap.get(addr);

        if (index < 0 || index > textEditor.getContentSize()) {
            throw $.newStringIndexOutOfBoundsException();
        }

        setTextEditorCaretPosition(textEditor, self, index);
    };

    Native["com/nokia/mid/ui/TextEditor.getCaretPosition.()I"] = function(addr) {
        var self = getHandle(addr);
        var nativeTextEditor = NativeMap.get(addr);
        return getTextEditorCaretPosition(nativeTextEditor, self);
    };

    Native["com/nokia/mid/ui/TextEditor.getBackgroundColor.()I"] = function(addr) {
        return NativeMap.get(addr).getBackgroundColor();
    };
    Native["com/nokia/mid/ui/TextEditor.getForegroundColor.()I"] = function(addr) {
        return NativeMap.get(addr).getForegroundColor();
    };
    Native["com/nokia/mid/ui/TextEditor.setBackgroundColor.(I)V"] = function(addr, backgroundColor) {
        NativeMap.get(addr).setBackgroundColor(backgroundColor);
    };
    Native["com/nokia/mid/ui/TextEditor.setForegroundColor.(I)V"] = function(addr, foregroundColor) {
        NativeMap.get(addr).setForegroundColor(foregroundColor);
    };

    Native["com/nokia/mid/ui/TextEditor.getContent.()Ljava/lang/String;"] = function(addr) {
        return J2ME.newString(NativeMap.get(addr).getContent());
    };

    Native["com/nokia/mid/ui/TextEditor.setContent.(Ljava/lang/String;)V"] = function(addr, contentAddr) {
        var self = getHandle(addr);
        var nativeTextEditor = NativeMap.get(addr);
        var content = J2ME.fromStringAddr(contentAddr);
        nativeTextEditor.setContent(content);
        setTextEditorCaretPosition(nativeTextEditor, self, nativeTextEditor.getContentSize());
    };

    addUnimplementedNative("com/nokia/mid/ui/TextEditor.getLineMarginHeight.()I", 0);
    addUnimplementedNative("com/nokia/mid/ui/TextEditor.getVisibleContentPosition.()I", 0);

    Native["com/nokia/mid/ui/TextEditor.getContentHeight.()I"] = function(addr) {
        return NativeMap.get(addr).getContentHeight();
    };

    Native["com/nokia/mid/ui/TextEditor.insert.(Ljava/lang/String;I)V"] = function(addr, textAddr, pos) {
        var self = getHandle(addr);
        var nativeTextEditor = NativeMap.get(addr);
        var text = J2ME.fromStringAddr(textAddr);
        var len = util.toCodePointArray(text).length;
        if (nativeTextEditor.getContentSize() + len > nativeTextEditor.getAttribute("maxlength")) {
            throw $.newIllegalArgumentException();
        }
        nativeTextEditor.setContent(nativeTextEditor.getSlice(0, pos) + text + nativeTextEditor.getSlice(pos));
        setTextEditorCaretPosition(nativeTextEditor, self, pos + len);
    };

    Native["com/nokia/mid/ui/TextEditor.delete.(II)V"] = function(addr, offset, length) {
        var self = getHandle(addr);
        var nativeTextEditor = NativeMap.get(addr);
        var old = nativeTextEditor.getContent();

        var size = nativeTextEditor.getContentSize();
        if (offset < 0 || offset > size || length < 0 || offset + length > size) {
            throw $.newStringIndexOutOfBoundsException("offset/length invalid");
        }

        nativeTextEditor.setContent(nativeTextEditor.getSlice(0, offset) + nativeTextEditor.getSlice(offset + length));
        setTextEditorCaretPosition(nativeTextEditor, self, offset);
    };

    Native["com/nokia/mid/ui/TextEditor.getMaxSize.()I"] = function(addr) {
        return parseInt(NativeMap.get(addr).getAttribute("maxlength"));
    };

    Native["com/nokia/mid/ui/TextEditor.setMaxSize.(I)I"] = function(addr, maxSize) {
        var nativeTextEditor = NativeMap.get(addr);
        if (nativeTextEditor.getContentSize() > maxSize) {
            var self = getHandle(addr);
            var nativeTextEditor = NativeMap.get(addr);

            var oldCaretPosition = getTextEditorCaretPosition(nativeTextEditor, self);

            nativeTextEditor.setContent(nativeTextEditor.getSlice(0, maxSize));

            if (oldCaretPosition > maxSize) {
                setTextEditorCaretPosition(nativeTextEditor, self, maxSize);
            }
        }

        nativeTextEditor.setAttribute("maxlength", maxSize);

        // The return value is the assigned size, which could be less than
        // the size that was requested, although in this case we always set it
        // to the requested size.
        return maxSize;
    };

    Native["com/nokia/mid/ui/TextEditor.size.()I"] = function(addr) {
        return NativeMap.get(addr).getContentSize();
    };

    Native["com/nokia/mid/ui/TextEditor.setFont.(Ljavax/microedition/lcdui/Font;)V"] = function(addr, fontAddr) {
        var self = getHandle(addr);
        self.font = fontAddr;
        var nativeTextEditor = NativeMap.get(addr);
        nativeTextEditor.setFont(fontAddr);
    };

    Native["com/nokia/mid/ui/TextEditorThread.getNextDirtyEditor.()Lcom/nokia/mid/ui/TextEditor;"] = function(addr) {
        if (dirtyEditors.length) {
            return dirtyEditors.shift();
        }

        asyncImpl("Lcom/nokia/mid/ui/TextEditor;", new Promise(function(resolve, reject) {
            textEditorResolve = function() {
                resolve(dirtyEditors.shift());
            }
        }));
    };

    var curDisplayableId = 0;
    var nextMidpDisplayableId = 1;
    var PLAIN = 0;

    Native["javax/microedition/lcdui/DisplayableLFImpl.initialize0.()V"] = function(addr) {
    };

    Native["javax/microedition/lcdui/DisplayableLFImpl.deleteNativeResource0.(I)V"] = function(addr, nativeId) {
        var el = document.getElementById("displayable-" + nativeId);
        if (el) {
            el.parentElement.removeChild(el);
            if (currentlyFocusedTextEditor) {
                currentlyFocusedTextEditor.focus();
            }
        } else if (currentlyFocusedTextEditor) {
            currentlyFocusedTextEditor.blur();
        }
    };

    Native["javax/microedition/lcdui/DisplayableLFImpl.setTitle0.(ILjava/lang/String;)V"] =
    function(addr, nativeId, titleAddr) {
        document.getElementById("display_title").textContent = J2ME.fromStringAddr(titleAddr);
    };

    Native["javax/microedition/lcdui/CanvasLFImpl.createNativeResource0.(Ljava/lang/String;Ljava/lang/String;)I"] =
    function(addr, titleAddr, tickerAddr) {
        console.warn("javax/microedition/lcdui/CanvasLFImpl.createNativeResource0.(Ljava/lang/String;Ljava/lang/String;)I not implemented");
        curDisplayableId = nextMidpDisplayableId++;
        return curDisplayableId;
    };

    Native["javax/microedition/lcdui/AlertLFImpl.createNativeResource0.(Ljava/lang/String;Ljava/lang/String;I)I"] =
    function(addr, titleAddr, tickerAddr, type) {
        var nativeId = nextMidpDisplayableId++;
        var alertTemplateNode = document.getElementById("lcdui-alert");
        var el = alertTemplateNode.cloneNode(true);
        el.id = "displayable-" + nativeId;
        el.querySelector('h1.title').textContent = J2ME.fromStringAddr(titleAddr);
        alertTemplateNode.parentNode.appendChild(el);

        return nativeId;
    };

    Native["javax/microedition/lcdui/AlertLFImpl.setNativeContents0.(ILjavax/microedition/lcdui/ImageData;[ILjava/lang/String;)Z"] =
    function(addr, nativeId, imgIdAddr, indicatorBoundsAddr, textAddr) {
        var el = document.getElementById("displayable-" + nativeId);
        el.querySelector('p.text').textContent = J2ME.fromStringAddr(textAddr);

        return 0;
    };

    Native["javax/microedition/lcdui/AlertLFImpl.showNativeResource0.(I)V"] = function(addr, nativeId) {
        var el = document.getElementById("displayable-" + nativeId);
        el.style.display = 'block';
        el.classList.add('visible');
        if (currentlyFocusedTextEditor) {
            currentlyFocusedTextEditor.blur();
        }

        curDisplayableId = nativeId;
    };

    var INDEFINITE = -1;
    var CONTINUOUS_RUNNING = 2;

    Native["javax/microedition/lcdui/GaugeLFImpl.createNativeResource0.(ILjava/lang/String;IZII)I"] =
    function(addr, ownerId, labelAddr, layout, interactive, maxValue, initialValue) {
        if (labelAddr !== J2ME.Constants.NULL) {
            console.error("Expected null label");
        }

        if (layout !== PLAIN) {
            console.error("Expected PLAIN layout");
        }

        if (interactive) {
            console.error("Expected not interactive gauge");
        }

        if (maxValue !== INDEFINITE) {
            console.error("Expected INDEFINITE maxValue");
        }

        if (initialValue !== CONTINUOUS_RUNNING) {
            console.error("Expected CONTINUOUS_RUNNING initialValue")
        }

        var el = document.getElementById("displayable-" + ownerId);
        el.querySelector("progress").style.display = "inline";

        return nextMidpDisplayableId++;
    };

    Native["javax/microedition/lcdui/TextFieldLFImpl.createNativeResource0.(ILjava/lang/String;ILcom/sun/midp/lcdui/DynamicCharacterArray;ILjava/lang/String;)I"] =
    function(addr, ownerId, labelAddr, layout, bufferAddr, constraints, initialInputModeAddr) {
        console.warn("javax/microedition/lcdui/TextFieldLFImpl.createNativeResource0.(ILjava/lang/String;ILcom/sun/midp/lcdui/DynamicCharacterArray;ILjava/lang/String;)I not implemented");
        return nextMidpDisplayableId++;
    };

    Native["javax/microedition/lcdui/ImageItemLFImpl.createNativeResource0.(ILjava/lang/String;ILjavax/microedition/lcdui/ImageData;Ljava/lang/String;I)I"] =
    function(addr, ownerId, labelAddr, layout, imageDataAddr, altTextAddr, appearanceMode) {
        console.warn("javax/microedition/lcdui/ImageItemLFImpl.createNativeResource0.(ILjava/lang/String;ILjavax/microedition/lcdui/ImageData;Ljava/lang/String;I)I not implemented");
        return nextMidpDisplayableId++;
    };

    addUnimplementedNative("javax/microedition/lcdui/FormLFImpl.setScrollPosition0.(I)V");
    addUnimplementedNative("javax/microedition/lcdui/FormLFImpl.getScrollPosition0.()I", 0);

    addUnimplementedNative(
        "javax/microedition/lcdui/FormLFImpl.createNativeResource0.(Ljava/lang/String;Ljava/lang/String;)I",
        function() { return nextMidpDisplayableId++ }
    );

    addUnimplementedNative("javax/microedition/lcdui/FormLFImpl.showNativeResource0.(IIII)V");
    addUnimplementedNative("javax/microedition/lcdui/FormLFImpl.getViewportHeight0.()I", 0);

    addUnimplementedNative(
        "javax/microedition/lcdui/StringItemLFImpl.createNativeResource0.(ILjava/lang/String;ILjava/lang/String;ILjavax/microedition/lcdui/Font;)I",
        function() { return nextMidpDisplayableId++ }
    );

    Native["javax/microedition/lcdui/ItemLFImpl.setSize0.(III)V"] = function(addr, nativeId, w, h) {
        console.warn("javax/microedition/lcdui/ItemLFImpl.setSize0.(III)V not implemented");
    };

    Native["javax/microedition/lcdui/ItemLFImpl.setLocation0.(III)V"] = function(addr, nativeId, x, y) {
        console.warn("javax/microedition/lcdui/ItemLFImpl.setLocation0.(III)V not implemented");
    };

    Native["javax/microedition/lcdui/ItemLFImpl.show0.(I)V"] = function(addr, nativeId) {
        console.warn("javax/microedition/lcdui/ItemLFImpl.show0.(I)V not implemented");
    };

    Native["javax/microedition/lcdui/ItemLFImpl.hide0.(I)V"] = function(addr, nativeId) {
        console.warn("javax/microedition/lcdui/ItemLFImpl.hide0.(I)V not implemented");
    };

    addUnimplementedNative("javax/microedition/lcdui/ItemLFImpl.getMinimumWidth0.(I)I", 10);
    addUnimplementedNative("javax/microedition/lcdui/ItemLFImpl.getMinimumHeight0.(I)I", 10);
    addUnimplementedNative("javax/microedition/lcdui/ItemLFImpl.getPreferredWidth0.(II)I", 10);
    addUnimplementedNative("javax/microedition/lcdui/ItemLFImpl.getPreferredHeight0.(II)I", 10);
    addUnimplementedNative("javax/microedition/lcdui/ItemLFImpl.delete0.(I)V");

    var BACK = 2;
    var CANCEL = 3;
    var OK = 4;
    var STOP = 6;

    Native["javax/microedition/lcdui/NativeMenu.updateCommands.([Ljavax/microedition/lcdui/Command;I[Ljavax/microedition/lcdui/Command;I)V"] =
    function(addr, itemCommandsAddr, numItemCommands, commandsAddr, numCommands) {
        if (numItemCommands !== 0) {
            console.error("NativeMenu.updateCommands: item commands not yet supported");
        }

        var el = document.getElementById("displayable-" + curDisplayableId);

        if (!el) {
            document.getElementById("sidebar").querySelector("nav ul").innerHTML = "";
        }

        if (commandsAddr === J2ME.Constants.NULL) {
            return;
        }

        var commands = J2ME.getArrayFromAddr(commandsAddr);

        var validCommands = [];

        for (var i = 0; i < commands.length; i++) {
            if (commands[i]) {
                validCommands.push(getHandle(commands[i]));
            }
        }

        validCommands.sort(function(a, b) {
            return a.priority - b.priority;
        });

        function sendEvent(command) {
            MIDP.sendCommandEvent(command.id);
        }

        if (el) {
            if (numCommands > 2 && validCommands.length > 2) {
                console.error("NativeMenu.updateCommands: max two commands supported");
            }

            validCommands.slice(0, 2).forEach(function(command, i) {
                var button = el.querySelector(".button" + i);
                button.style.display = 'inline';
                button.textContent = J2ME.fromStringAddr(command.shortLabel);

                var commandType = command.commandType;
                if (numCommands === 1 || commandType === OK) {
                    button.classList.add('recommend');
                    button.classList.remove('cancel');
                } else if (commandType === CANCEL || commandType === BACK || commandType === STOP) {
                    button.classList.add('cancel');
                    button.classList.remove('recommend');
                }

                button.onclick = function(e) {
                    e.preventDefault();
                    sendEvent(command);
                };
            });
        } else {
            var menu = document.getElementById("sidebar").querySelector("nav ul");

            var okCommand = null;
            var backCommand = null;

            var isSidebarEmpty = true;
            validCommands.forEach(function(command) {
                var commandType = command.commandType;
                // Skip the OK command which will shown in the header.
                if (commandType === OK) {
                    okCommand = command;
                    return;
                }
                // Skip the BACK command which will shown in the footer.
                if (commandType === BACK) {
                    backCommand = command;
                    return;
                }
                var li = document.createElement("li");
                var text = J2ME.fromStringAddr(command.shortLabel);
                var a = document.createElement("a");
                a.textContent = text;
                li.appendChild(a);

                li.onclick = function(e) {
                    e.preventDefault();

                    window.location.hash = "";

                    sendEvent(command);
                };

                menu.appendChild(li);
                isSidebarEmpty = false;
            });

            document.getElementById("header-drawer-button").style.display =
                isSidebarEmpty ? "none" : "block";

            // If existing, the OK command will be shown in the header.
            var headerBtn = document.getElementById("header-ok-button");
            if (okCommand) {
                headerBtn.style.display = "block";
                headerBtn.onclick = sendEvent.bind(headerBtn, okCommand);
            } else {
                headerBtn.style.display = "none";
            }

            // If existing, the BACK command will be shown in the footer.
            var backBtn = document.getElementById("back-button");
            if (backCommand) {
                backBtn.style.display = "block";
                backBtn.onclick = sendEvent.bind(backBtn, backCommand);
            } else {
                backBtn.style.display = "none";
            }
        }
    };
})(Native);


/* SOURCE: midp/text_editor.js */


var TextEditorProvider = (function() {
    var eTextArea = document.getElementById('textarea-editor');
    var currentVisibleEditor = null;

    function extendsObject(targetObj, srcObj) {
        for (var m in srcObj) {
            targetObj[m] = srcObj[m];
        }
        return targetObj;
    }

    var CommonEditorPrototype = {
        attached: false,
        width: 0,
        height: 0,
        left: 0,
        top: 0,
        constraints: 0,
        type: "",
        content: "",
        visible: false,
        id: -1,
        selectionRange: [0, 0],
        focused: false,
        oninputCallback: null,
        inputmode: "",

        // opaque white
        backgroundColor:  0xFFFFFFFF | 0,

        // opaque black
        foregroundColor:  0xFF000000 | 0,

        attach: function() {
            this.attached = true;
        },

        detach: function() {
            this.attached = false;
        },

        isAttached: function() {
            return this.attached;
        },

        decorateTextEditorElem: function() {
            // Set attributes.
            if (this.attributes) {
                for (var attr in this.attributes) {
                    this.textEditorElem.setAttribute(attr, this.attributes[attr]);
                }
            }

            this.textEditorElem.setAttribute("x-inputmode", this.inputmode);

            this.setContent(this.content);

            this.setSelectionRange(this.selectionRange[0], this.selectionRange[1]);
            this.setSize(this.width, this.height);
            this.setFont(this.fontAddr);
            this.setPosition(this.left, this.top);
            this.setBackgroundColor(this.backgroundColor);
            this.setForegroundColor(this.foregroundColor);
        },

        _setStyle: function(styleKey, styleValue) {
            if (this.visible) {
                this.textEditorElem.style.setProperty(styleKey, styleValue);
            }
        },

        focus: function() {
            this.focused = true;
            return new Promise(function(resolve, reject) {
                if (currentVisibleEditor !== this ||
                    document.activeElement === this.textEditorElem) {
                    resolve();
                    return;
                }
                setTimeout(this.textEditorElem.focus.bind(this.textEditorElem));
                this.textEditorElem.onfocus = resolve;
            }.bind(this));
        },

        blur: function() {
            this.focused = false;
            return new Promise(function(resolve, reject) {
                if (currentVisibleEditor !== this ||
                    document.activeElement !== this.textEditorElem) {
                    resolve();
                    return;
                }
                setTimeout(this.textEditorElem.blur.bind(this.textEditorElem));
                this.textEditorElem.onblur = resolve;
            }.bind(this));
        },

        getVisible: function() {
            return this.visible;
        },

        setVisible: function(aVisible) {
            // Check if we need to show or hide the html editor elements.
            if ((currentVisibleEditor === this && aVisible) ||
                (currentVisibleEditor !== this && !aVisible)) {
                this.visible = aVisible;
                return;
            }

            this.visible = aVisible;

            if (aVisible) {
                if (currentVisibleEditor) {
                    currentVisibleEditor.visible = false;
                }
                currentVisibleEditor = this;
            } else {
                currentVisibleEditor = null;
            }

            if (aVisible) {
                this.textEditorElem.classList.add("show");
            } else {
                this.textEditorElem.classList.remove("show");
            }

            if (this.visible) {
                var oldId = this.textEditorElem.getAttribute("editorId") || -1;
                if (oldId !== this.id) {
                    this.textEditorElem.setAttribute("editorId", this.id);
                    this.decorateTextEditorElem();
                    if (this.focused) {
                        setTimeout(this.textEditorElem.focus.bind(this.textEditorElem));
                    }
                }
                this.activate();
            } else {
                if (!this.focused) {
                    setTimeout(this.textEditorElem.blur.bind(this.textEditorElem));
                }
                this.deactivate();
            }
        },

        setAttribute: function(attrName, value) {
            if (!this.attributes) {
                this.attributes = { };
            }

            this.attributes[attrName] = value;
            if (this.textEditorElem) {
                this.textEditorElem.setAttribute(attrName, value);
            }
        },

        getAttribute: function(attrName) {
            if (!this.attributes) {
                return null;
            }

            return this.attributes[attrName];
        },

        setFont: function(fontAddr) {
            // The *fontAddr* argument is an address to the Java Font instance.
            // We mostly access its native, which is a CanvasRenderingContext2D.
            this.fontAddr = fontAddr;
            this.fontContext = NativeMap.get(fontAddr);
            this._setStyle("font", this.fontContext.font);
        },

        setSize: function(width, height) {
            this.width = width;
            this.height = height;
            this._setStyle("width", width + "px");
            this._setStyle("height", height + "px");
        },

        getWidth: function() {
            return this.width;
        },

        getHeight: function() {
            return this.height;
        },

        setPosition: function(left, top) {
            this.left = left;
            this.top = top;
            var t = MIDP.deviceContext.canvas.offsetTop + top;
            this._setStyle("left", left + "px");
            this._setStyle("top",  t + "px");
        },

        getLeft: function() {
            return this.left;
        },

        getTop: function() {
            return this.top;
        },

        setBackgroundColor: function(color) {
            this.backgroundColor = color;
            this._setStyle("backgroundColor", util.abgrIntToCSS(color));
        },

        getBackgroundColor: function() {
            return this.backgroundColor;
        },

        setForegroundColor: function(color) {
            this.foregroundColor = color;
            this._setStyle("color", util.abgrIntToCSS(color));
        },

        getForegroundColor: function() {
            return this.foregroundColor;
        },

        oninput: function(callback) {
            if (typeof callback == 'function') this.oninputCallback = callback;
        },
    }

    function TextAreaEditor() {
        this.textEditorElem = eTextArea;
    }

    TextAreaEditor.prototype = extendsObject({
        html: '',

        activate: function() {
            this.textEditorElem.onkeydown = function(e) {
                if (this.getContentSize() >= this.getAttribute("maxlength")) {
                    return !util.isPrintable(e.keyCode);
                }

                return true;
            }.bind(this);

            this.textEditorElem.oninput = function(e) {
                if (e.isComposing) {
                    return;
                }

                // Save the current selection.
                var range = this.getSelectionRange();

                // Remove the last <br> tag if any.
                var html = this.textEditorElem.innerHTML;
                var lastBr = html.lastIndexOf("<br>");
                if (lastBr !== -1) {
                    html = html.substring(0, lastBr);
                }

                // Replace <br> by \n so that textContent attribute doesn't
                // strip new lines.
                html = html.replace(/<br>/g, "\n");

                // Convert the emoji images back to characters.
                // The original character is stored in the alt attribute of its
                // object tag with the format of <object ... name='X' ..>.
                html = html.replace(/<object[^>]*name="(\S*)"[^>]*><\/object>/g, '$1');

                this.textEditorElem.innerHTML = html;

                this.setContent(this.textEditorElem.textContent);

                // Restore the current selection after updating emoji images.
                this.setSelectionRange(range[0], range[1]);

                // Notify TextEditor listeners.
                if (this.oninputCallback) {
                    this.oninputCallback();
                }
            }.bind(this);
        },

        deactivate: function() {
            this.textEditorElem.onkeydown = null;
            this.textEditorElem.oninput = null;
        },

        getContent: function() {
            return this.content;
        },

        setContent: function(content) {
            // Filter all the \r characters as we use \n.
            content = content.replace(/\r/g, "");

            this.content = content;

            // Escape the content to avoid malicious injection via innerHTML.
            this.textEditorElem.textContent = content;
            var html = this.textEditorElem.innerHTML;

            if (!this.visible) {
                return;
            }

            var toImg = function(str) {
                var emojiData = emoji.getData(str, this.fontContext.fontSize);

                var scale = this.fontContext.fontSize / emoji.squareSize;

                var style = 'display:inline-block;';
                style += 'width:' + this.fontContext.fontSize + 'px;';
                style += 'height:' + this.fontContext.fontSize + 'px;';
                style += 'background:url(' + emojiData.img.src + ') -' + (emojiData.x * scale) + 'px 0px no-repeat;';
                style += 'background-size:' + (emojiData.img.naturalWidth * scale) + 'px ' + this.fontContext.fontSize + 'px;';

                // We use <object> instead of <img> to not allow image resizing.
                return '<object style="' + style + '" name="' + str + '"></object>';
            }.bind(this);

            // Replace "\n" by <br>
            html = html.replace(/\n/g, "<br>");

            html = html.replace(emoji.regEx, toImg) + "<br>";

            this.textEditorElem.innerHTML = html;
            this.html = html;
        },

        _getNodeTextLength: function(node) {
            if (node.nodeType == Node.TEXT_NODE) {
                return node.textContent.length;
            } else if (node instanceof HTMLBRElement) {
                // Don't count the last <br>
                return node.nextSibling ? 1 : 0;
            } else {
                // It should be an HTMLImageElement of a emoji.
                return util.toCodePointArray(node.name).length;
            }
        },

        _getSelectionOffset: function(node, offset) {
            if (!this.visible) {
                return 0;
            }

            if (node !== this.textEditorElem &&
                node.parentNode !== this.textEditorElem) {
                console.error("_getSelectionOffset called while the editor is unfocused");
                return 0;
            }

            var selectedNode = null;
            var count = 0;

            if (node.nodeType === Node.TEXT_NODE) {
                selectedNode = node;
                count = offset;
                var prev = node.previousSibling;
                while (prev) {
                    count += this._getNodeTextLength(prev);
                    prev = prev.previousSibling;
                }
            } else {
                var children = node.childNodes;
                for (var i = 0; i < offset; i++) {
                    var cur = children[i];
                    count += this._getNodeTextLength(cur);
                }
                selectedNode = children[offset - 1];
            }

            return count;
        },

        getSelectionEnd: function() {
            var sel = window.getSelection();
            return this._getSelectionOffset(sel.focusNode, sel.focusOffset);
        },

        getSelectionStart: function() {
            var sel = window.getSelection();
            return this._getSelectionOffset(sel.anchorNode, sel.anchorOffset);
        },

        getSelectionRange: function() {
            var start = this.getSelectionStart();
            var end = this.getSelectionEnd();

            if (start > end) {
                return [ end, start ];
            }

            return [ start, end ];
        },

        setSelectionRange: function(from, to) {
            this.selectionRange = [from, to];
            if (!this.visible) {
                return;
            }
            if (from != to) {
                console.error("setSelectionRange not supported when from != to");
            }

            var children = this.textEditorElem.childNodes;
            for (var i = 0; i < children.length; i++) {
                var cur = children[i];
                var length = this._getNodeTextLength(cur);

                if (length >= from) {
                    var selection = window.getSelection();
                    var range;
                    if (selection.rangeCount === 0) {
                        // XXX: This makes it so chrome does not break here, but
                        // text boxes still do not behave correctly in chrome.
                        range = document.createRange();
                        selection.addRange(range);
                    } else {
                        range = selection.getRangeAt(0);
                    }
                    if (cur.textContent) {
                        range.setStart(cur, from);
                    } else if (from === 0) {
                        range.setStartBefore(cur);
                    } else {
                        range.setStartAfter(cur);
                    }
                    range.collapse(true);
                    break;
                }

                from -= length;
            }
        },

        getSlice: function(from, to) {
            return util.toCodePointArray(this.content).slice(from, to).join("");
        },

        /*
         * The TextEditor::getContentSize() method returns the length of the content in codepoints
         */
        getContentSize: function() {
            return util.toCodePointArray(this.content).length;
        },

        /*
         * The height of the content is estimated by creating an hidden div
         * with the same style as the TextEditor element.
         */
        getContentHeight: function() {
            var div = document.getElementById("hidden-textarea-editor");
            div.style.setProperty("width", this.getWidth() + "px");
            div.style.setProperty("font", this.fontContext.font);
            div.innerHTML = this.html;
            var height = div.offsetHeight;

            div.innerHTML = "";

            return height;
        },
    }, CommonEditorPrototype);

    function InputEditor(type) {
        this.textEditorElem = document.getElementById(type + "-editor");
    }

    InputEditor.prototype = extendsObject({
        activate: function() {
            this.textEditorElem.onkeydown = function(e) {
                // maxlength is ignored when the input type is "number"
                if (this.textEditorElem.value.length >= this.getAttribute("maxlength")) {
                    return e.keyCode !== 0 && !util.isPrintable(e.keyCode);
                }

                return true;
            }.bind(this);

            this.textEditorElem.oninput = function() {
                this.content = this.textEditorElem.value;
                if (this.oninputCallback) {
                    this.oninputCallback();
                }
            }.bind(this);
        },

        deactivate: function() {
            this.textEditorElem.oninput = null;
        },

        getContent: function() {
            return this.content;
        },

        setContent: function(content) {
            this.content = content;

            if (this.visible) {
                this.textEditorElem.value = content;
            }
        },

        getSelectionStart: function() {
            if (this.visible) {
                return this.textEditorElem.selectionStart;
            }

            return 0;
        },

        getSelectionEnd: function() {
            if (this.visible) {
                return this.textEditorElem.selectionEnd;
            }

            return 0;
        },

        getSelectionRange: function() {
            var start = this.getSelectionStart();
            var end = this.getSelectionEnd();

            if (start > end) {
                return [ end, start ];
            }

            return [ start, end ];
        },

        setSelectionRange: function(from, to) {
            this.selectionRange = [from, to];
            if (!this.visible) {
                return;
            }
            this.textEditorElem.setSelectionRange(from, to);
        },

        getSlice: function(from, to) {
            return this.content.slice(from, to);
        },

        getContentSize: function() {
            return this.content.length;
        },

        getContentHeight: function() {
            return ((this.content.match(/\n/g) || []).length + 1) * ((this.fontContext.fontSize * FONT_HEIGHT_MULTIPLIER) | 0);
        },
    }, CommonEditorPrototype);

    return {
        getEditor: function(constraints, oldEditor, editorId) {
            // https://docs.oracle.com/javame/config/cldc/ref-impl/midp2.0/jsr118/javax/microedition/lcdui/TextField.html#constraints
            var TextField = {
                ANY:                          0,
                EMAILADDR:                    1,
                NUMERIC:                      2,
                PHONENUMBER:                  3,
                URL:                          4,
                DECIMAL:                      5,
                PASSWORD:               0x10000,
                NON_PREDICTIVE:         0x80000,
                INITIAL_CAPS_WORD:     0x100000,
                INITIAL_CAPS_SENTENCE: 0x200000,
                CONSTRAINT_MASK:         0xFFFF
            };

            function _createEditor(type, constraints, editorId, inputmode) {
                var editor;
                if (type === "textarea") {
                    editor = new TextAreaEditor();
                } else {
                    editor = new InputEditor(type);
                }
                editor.type = type;
                editor.constraints = constraints;
                editor.id = editorId;
                editor.inputmode = inputmode;
                return editor;
            }

            var type = "";
            var inputmode = "";
            var mode = constraints & TextField.CONSTRAINT_MASK;
            if (constraints & TextField.PASSWORD) {
                type = "password";
                if (mode === TextField.NUMERIC) {
                    inputmode = "number";
                }
            } else {
                switch (mode) {
                    case TextField.EMAILADDR:
                        type = "email";
                        break;
                    case TextField.DECIMAL: // fall through
                    case TextField.NUMERIC:
                        type = "number";
                        break;
                    case TextField.PHONENUMBER:
                        type = "tel";
                        break;
                    case TextField.URL:
                        type = "url";
                        break;
                    case TextField.ANY: // fall through
                    default:
                        type = "textarea";
                        break;
                }
                if (constraints & TextField.NON_PREDICTIVE) {
                    // No capitalization and no word suggestions
                    inputmode = "verbatim";
                } else if (constraints & TextField.INITIAL_CAPS_SENTENCE) {
                    // Word suggestions and capitalization at the start of sentences
                    inputmode = "latin-prose";
                } else if (constraints & TextField.INITIAL_CAPS_WORD) {
                    // Word suggestions and capitalization at each word
                    inputmode = "latin-name";
                } else {
                    // Word suggestions but no capitalization
                    inputmode = "latin";
                }
            }

            var newEditor;

            if (!oldEditor) {
                newEditor = _createEditor(type, constraints, editorId, inputmode);
                return newEditor;
            }

            if (type === oldEditor.type) {
                return oldEditor;
            }

            // The type is changed and we need to copy all the attributes.
            var newEditor = _createEditor(type, constraints, editorId, inputmode);
            ["attributes",
             "width", "height",
             "left", "top",
             "backgroundColor", "foregroundColor",
             "attached",
             "content",
             "fontAddr",
             "oninputCallback"].forEach(function(attr) {
                newEditor[attr] = oldEditor[attr];
            });

            // Call setVisible to update display.
            var visible = oldEditor.visible;
            oldEditor.setVisible(false);
            newEditor.setVisible(visible);
            return newEditor;
        }
    };
})();


/* SOURCE: midp/localmsg.js */
/* -*- Mode: Java; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4 -*- */
/* vim: set shiftwidth=4 tabstop=4 autoindent cindent expandtab: */



var LocalMsgConnectionMessage = function(data, offset, length) {
  this.data = data;
  this.offset = offset;
  this.length = length;
}

var LocalMsgConnection = function() {
    this.clientConnected = false;
    this.waitingForConnection = null;
    this.serverWaiting = [];
    this.clientWaiting = [];
    this.serverMessages = [];
    this.clientMessages = [];
}

LocalMsgConnection.prototype.reset = function() {
    var ctx = $.ctx;

    this.clientConnected = false;
    this.clientWaiting = [];
    this.clientMessages = [];
    while (this.serverWaiting.length > 0) {
        this.serverWaiting.shift()(false);
    }
    this.serverMessages = [];

    ctx.setAsCurrentContext();
}

LocalMsgConnection.prototype.notifyConnection = function() {
    this.clientConnected = true;

    if (this.waitingForConnection) {
        this.waitingForConnection();
    }
}

LocalMsgConnection.prototype.waitConnection = function() {
    return new Promise((function(resolve, reject) {
      this.waitingForConnection = function() {
          this.waitingForConnection = null;
          resolve();
      }
    }).bind(this));
}

LocalMsgConnection.prototype.copyMessage = function(messageQueue, dataAddr) {
    var msg = messageQueue.shift();
    var data = J2ME.getArrayFromAddr(dataAddr);
    for (var i = 0; i < msg.length; i++) {
        data[i] = msg.data[i + msg.offset];
    }
    J2ME.unsetUncollectable(dataAddr);
    return msg.length;
}

LocalMsgConnection.prototype.sendMessageToClient = function(dataAddr, offset, length) {
    this.clientMessages.push(new LocalMsgConnectionMessage(dataAddr, offset, length));

    if (this.clientWaiting.length > 0) {
        this.clientWaiting.shift()();
    }
}

LocalMsgConnection.prototype.getClientMessage = function(dataAddr) {
  return this.copyMessage(this.clientMessages, dataAddr);
}

LocalMsgConnection.prototype.waitClientMessage = function(dataAddr) {
    asyncImpl("I", new Promise((function(resolve, reject) {
        this.clientWaiting.push(function() {
            resolve(this.getClientMessage(dataAddr));
        }.bind(this));
    }).bind(this)));
}

LocalMsgConnection.prototype.sendMessageToServer = function(dataAddr, offset, length) {
    this.serverMessages.push(new LocalMsgConnectionMessage(dataAddr, offset, length));

    if (this.serverWaiting.length > 0) {
        this.serverWaiting.shift()(true);
    }
}

LocalMsgConnection.prototype.getServerMessage = function(dataAddr) {
  return this.copyMessage(this.serverMessages, dataAddr);
}

LocalMsgConnection.prototype.waitServerMessage = function(dataAddr) {
    var ctx = $.ctx;

    asyncImpl("I", new Promise((function(resolve, reject) {
        this.serverWaiting.push(function(successful) {
            if (successful) {
                resolve(this.getServerMessage(dataAddr));
            } else {
                J2ME.unsetUncollectable(dataAddr);
                ctx.setAsCurrentContext();
                reject($.newIOException("Client disconnected"));
            }
        }.bind(this));
    }).bind(this)));
}

var NokiaMessagingLocalMsgConnection = function() {
    LocalMsgConnection.call(this);
    window.addEventListener("nokia.messaging", function(e) {
        this.receiveSMS(e.detail);
    }.bind(this));
}

NokiaMessagingLocalMsgConnection.prototype = Object.create(LocalMsgConnection.prototype);

NokiaMessagingLocalMsgConnection.prototype.receiveSMS = function(sms) {
  var encoder = new DataEncoder();

  encoder.putStart(DataType.STRUCT, "event");
  encoder.put(DataType.METHOD, "name", "MessageNotify");
  encoder.put(DataType.USHORT, "trans_id", Date.now() % 255); // The meaning of this field is unknown
  encoder.put(DataType.STRING, "type", "SMS"); // The name of this field is unknown
  encoder.put(DataType.ULONG, "message_id", sms.id);
  encoder.putEnd(DataType.STRUCT, "event");

  var replyData = new TextEncoder().encode(encoder.getData());
  this.sendMessageToClient(replyData, 0, replyData.length);
}

NokiaMessagingLocalMsgConnection.prototype.sendMessageToServer = function(data, offset, length) {
  var encoder = new DataEncoder();

  var decoder = new DataDecoder(data, offset, length);

  decoder.getStart(DataType.STRUCT);
  var name = decoder.getValue(DataType.METHOD);

  switch (name) {
    case "Common":
      encoder.putStart(DataType.STRUCT, "event");
      encoder.put(DataType.METHOD, "name", "Common");
      encoder.putStart(DataType.STRUCT, "message");
      encoder.put(DataType.METHOD, "name", "ProtocolVersion");
      encoder.put(DataType.STRING, "version", "2.[0-10]");
      encoder.putEnd(DataType.STRUCT, "message");
      encoder.putEnd(DataType.STRUCT, "event");
    break;

    case "SubscribeMessages":
      promptForMessageText();
      encoder.putStart(DataType.STRUCT, "event");
      encoder.put(DataType.METHOD, "name", "SubscribeMessages");
      encoder.put(DataType.USHORT, "trans_id", decoder.getValue(DataType.USHORT)); // The meaning of this field is unknown
      encoder.put(DataType.STRING, "result", "OK"); // The name of this field is unknown
      encoder.putEnd(DataType.STRUCT, "event");
    break;

    case "GetMessageEntity":
      var trans_id = decoder.getValue(DataType.USHORT);
      var sms_id = decoder.getValue(DataType.ULONG);

      var sms;
      for (var i = 0; i < MIDP.nokiaSMSMessages.length; i++) {
        if (MIDP.nokiaSMSMessages[i].id == sms_id) {
          sms = MIDP.nokiaSMSMessages[i];
          break;
        }
      }

      encoder.putStart(DataType.STRUCT, "event");
      encoder.put(DataType.METHOD, "name", "GetMessageEntity");
      encoder.put(DataType.USHORT, "trans_id", trans_id); // The meaning of this field is unknown
      encoder.put(DataType.STRING, "result", "OK"); // The name of this field is unknown
      encoder.put(DataType.ULONG, "message_id", sms_id);
      encoder.putStart(DataType.LIST, "list_name_unknown"); // The name of this field is unknown
      encoder.put(DataType.WSTRING, "body_text", sms.text);
      encoder.put(DataType.STRING, "address", sms.addr);
      encoder.putEnd(DataType.LIST);
      encoder.putEnd(DataType.STRUCT, "event");
    break;

    case "DeleteMessages":
      decoder.getValue(DataType.USHORT);
      decoder.getStart(DataType.ARRAY);
      var sms_id = decoder.getValue(DataType.ULONG);

      for (var i = 0; i < MIDP.nokiaSMSMessages.length; i++) {
        if (MIDP.nokiaSMSMessages[i].id == sms_id) {
          MIDP.nokiaSMSMessages.splice(i, 1);
          break;
        }
      }

      return;
    break;

    default:
      console.error("(nokia.messaging) event " + name + " not implemented " +
                    util.decodeUtf8(data.subarray(offset, offset + length)));
      return;
  }

  var replyData = new TextEncoder().encode(encoder.getData());
  this.sendMessageToClient(replyData, 0, replyData.length);
}

var NokiaSASrvRegLocalMsgConnection = function() {
    LocalMsgConnection.call(this);
};

NokiaSASrvRegLocalMsgConnection.prototype = Object.create(LocalMsgConnection.prototype);

NokiaSASrvRegLocalMsgConnection.prototype.sendMessageToServer = function(data, offset, length) {
  var decoder = new DataDecoder(data, offset, length);

  decoder.getStart(DataType.STRUCT);
  var name = decoder.getValue(DataType.METHOD);

  var encoder = new DataEncoder();

  switch (name) {
    case "Common":
      encoder.putStart(DataType.STRUCT, "event");
      encoder.put(DataType.METHOD, "name", "Common");
      encoder.putStart(DataType.STRUCT, "message");
      encoder.put(DataType.METHOD, "name", "ProtocolVersion");
      encoder.put(DataType.STRING, "version", "2.0");
      encoder.putEnd(DataType.STRUCT, "message");
      encoder.putEnd(DataType.STRUCT, "event");
      break;
    case "Discovery":
      encoder.putStart(DataType.STRUCT, "event");
      encoder.put(DataType.METHOD, "name", "Discovery");
      encoder.put(DataType.BYTE, "unknown_byte_1", 1);
      encoder.put(DataType.STRING, "unknown_string_1", "");
      encoder.putStart(DataType.ARRAY, "services");
      encoder.putStart(DataType.STRUCT, "service");
      encoder.put(DataType.STRING, "ServiceName", "file_ui");
      encoder.put(DataType.URI, "ServiceURI", "nokia.file-ui");
      encoder.put(DataType.STRING, "unknown_string_2", "");
      encoder.put(DataType.WSTRING, "unknown_string_3", "");
      encoder.put(DataType.STRING, "unknown_string_4", "");
      encoder.putEnd(DataType.STRUCT, "service");
      encoder.putEnd(DataType.ARRAY, "services");
      encoder.putEnd(DataType.STRUCT, "event");
      break;
  }

  var replyData = new TextEncoder().encode(encoder.getData());
  this.sendMessageToClient(replyData, 0, replyData.length);
};

var NokiaPhoneStatusLocalMsgConnection = function() {
  LocalMsgConnection.call(this);

  this.listeners = {
    "battery": false,
    "network_status": false,
    "wifi_status": false,
  };

  window.addEventListener('online', (function() {
    if (this.listeners["network_status"]) {
      this.sendChangeNotify(this.buildNetworkStatus.bind(this), true);
    }

    if (this.listeners["wifi_status"]) {
      this.sendChangeNotify(this.buildWiFiStatus.bind(this), true);
    }
  }).bind(this));;

  window.addEventListener('offline', (function() {
    if (this.listeners["network_status"]) {
      this.sendChangeNotify(this.buildNetworkStatus.bind(this), false);
    }

    if (this.listeners["wifi_status"]) {
      this.sendChangeNotify(this.buildWiFiStatus.bind(this), false);
    }
  }).bind(this));
};

NokiaPhoneStatusLocalMsgConnection.prototype = Object.create(LocalMsgConnection.prototype);

NokiaPhoneStatusLocalMsgConnection.prototype.buildNetworkStatus = function(encoder, online) {
  encoder.putStart(DataType.STRUCT, "network_status");
  encoder.put(DataType.STRING, "", "Home");  // Name unknown (value is "None", "Home" or "Roam")
  encoder.put(DataType.BOOLEAN, "", online ? 1 : 0);  // Name unknown
  encoder.putEnd(DataType.STRUCT, "network_status");
}

NokiaPhoneStatusLocalMsgConnection.prototype.buildWiFiStatus = function(encoder, online) {
  encoder.putStart(DataType.STRUCT, "wifi_status");
  encoder.put(DataType.BOOLEAN, "", online ? 1 : 0);  // Name unknown, we're assuming we're connected to a wifi network.
  encoder.putEnd(DataType.STRUCT, "wifi_status");
}

NokiaPhoneStatusLocalMsgConnection.prototype.buildBattery = function(encoder) {
  encoder.putStart(DataType.STRUCT, "battery");
  encoder.put(DataType.BYTE, "", 1);  // Name unknown
  encoder.put(DataType.BOOLEAN, "", 1);  // Name unknown
  encoder.putEnd(DataType.STRUCT, "battery");
}

NokiaPhoneStatusLocalMsgConnection.prototype.sendChangeNotify = function(replyBuilder, online) {
  var encoder = new DataEncoder();
  encoder.putStart(DataType.STRUCT, "event");
  encoder.put(DataType.METHOD, "name", "ChangeNotify");
  encoder.put(DataType.STRING, "status", "OK"); // Name and value unknown
  encoder.putStart(DataType.LIST, "subscriptions");

  replyBuilder(encoder, online);

  encoder.putEnd(DataType.LIST, "subscriptions");
  encoder.putEnd(DataType.STRUCT, "event");

  var replyData = new TextEncoder().encode(encoder.getData());
  this.sendMessageToClient(replyData, 0, replyData.length);
}

NokiaPhoneStatusLocalMsgConnection.prototype.addListener = function(type) {
  if (type === "battery") {
    console.warn("Battery notifications not supported");
    return;
  }

  this.listeners[type] = true;
}

NokiaPhoneStatusLocalMsgConnection.prototype.removeListener = function(type) {
  this.listeners[type] = false;
}

NokiaPhoneStatusLocalMsgConnection.prototype.sendMessageToServer = function(data, offset, length) {
  var decoder = new DataDecoder(data, offset, length);

  decoder.getStart(DataType.STRUCT);
  var name = decoder.getValue(DataType.METHOD);

  var encoder = new DataEncoder();

  switch (name) {
    case "Common":
      encoder.putStart(DataType.STRUCT, "event");
      encoder.put(DataType.METHOD, "name", "Common");
      encoder.putStart(DataType.STRUCT, "message");
      encoder.put(DataType.METHOD, "name", "ProtocolVersion");
      encoder.put(DataType.STRING, "version", "1.[0-10]");
      encoder.putEnd(DataType.STRUCT, "message");
      encoder.putEnd(DataType.STRUCT, "event");

      var replyData = new TextEncoder().encode(encoder.getData());
      this.sendMessageToClient(replyData, 0, replyData.length);
      break;

    case "Query":
      // This will be true if there is at least one "CurrentStateOnly" request.
      var headerBuilt = false;

      // subscriptions
      decoder.getStart(DataType.LIST);
      while (decoder.getTag() == DataType.STRING) {
        var name = decoder.getName();
        var queryKind = decoder.getValue(DataType.STRING);

        if (queryKind === "CurrentStateOnly") {
          if (!headerBuilt) {
            encoder.putStart(DataType.STRUCT, "event");
            encoder.put(DataType.METHOD, "name", "Query");
            encoder.put(DataType.STRING, "status", "OK");
            encoder.putStart(DataType.LIST, "subscriptions");
            headerBuilt = true;
          }

          switch (name) {
            case "network_status":
              this.buildNetworkStatus(encoder, navigator.onLine);
              break;

            case "wifi_status":
              this.buildWiFiStatus(encoder, navigator.onLine);
              break;

            case "battery":
              this.buildBattery(encoder);
              break;

            default:
              console.error("(nokia.phone-status) Query " + decoder.getName() + " not implemented " +
                            util.decodeUtf8(data.subarray(offset, offset + length)));
              break;
          }
        } else if (queryKind === "Disable") {
          this.removeListener(name);
        } else if (queryKind === "Enable") {
          this.addListener(name);
        }
      }

      if (headerBuilt) {
        encoder.putEnd(DataType.LIST, "subscriptions");
        encoder.putEnd(DataType.STRUCT, "event");

        var replyData = new TextEncoder().encode(encoder.getData());
        this.sendMessageToClient(replyData, 0, replyData.length);
      }

      break;

    default:
      console.error("(nokia.phone-status) event " + name + " not implemented " +
                    util.decodeUtf8(data.subarray(offset, offset + length)));
      return;
  }
};

var NokiaContactsLocalMsgConnection = function() {
    LocalMsgConnection.call(this);
}

NokiaContactsLocalMsgConnection.prototype = Object.create(LocalMsgConnection.prototype);

NokiaContactsLocalMsgConnection.prototype.encodeContact = function(encoder, contact) {
    encoder.putStart(DataType.LIST, "Contact");

    encoder.put(DataType.WSTRING, "ContactID", contact.id.toString().substr(0,30));

    encoder.put(DataType.WSTRING, "DisplayName", contact.name[0]);

    encoder.putStart(DataType.ARRAY, "Numbers");
    contact.tel.forEach(function(tel) {
        encoder.putStart(DataType.LIST, "NumbersList"); // The name of this field is unknown
        // encoder.put(DataType.ULONG, "Kind", ???); // The meaning of this field is unknown
        encoder.put(DataType.WSTRING, "Number", tel.value);
        encoder.putEnd(DataType.LIST, "NumbersList");
    });
    encoder.putEnd(DataType.ARRAY, "Numbers");

    encoder.putEnd(DataType.LIST, "Contact");
}

NokiaContactsLocalMsgConnection.prototype.sendContact = function(trans_id, contact) {
    if (!contact.tel) {
        return;
    }

    var encoder = new DataEncoder();
    encoder.putStart(DataType.STRUCT, "event");
    encoder.put(DataType.METHOD, "name", "Notify");
    encoder.put(DataType.ULONG, "trans_id", trans_id); // The meaning of this field is unknown
    encoder.put(DataType.BYTE, "type", 1); // The name of this field is unknown (the value may be 1, 2, 3 according to the event (I'd guess CREATE, DELETE, UPDATE))
    this.encodeContact(encoder, contact);
    encoder.putEnd(DataType.STRUCT, "event");

    var replyData = new TextEncoder().encode(encoder.getData());
    this.sendMessageToClient(replyData, 0, replyData.length);
};

NokiaContactsLocalMsgConnection.prototype.getFirstOrNext = function(trans_id, method) {
  var gotContact = (function(contact) {
    if (contact && !contact.tel) {
      contacts.getNext(gotContact);
      return;
    }

    var encoder = new DataEncoder();
    encoder.putStart(DataType.STRUCT, "event");
    encoder.put(DataType.METHOD, "name", method);
    encoder.put(DataType.ULONG, "trans_id", trans_id);
    if (contact) {
      encoder.put(DataType.STRING, "result", "OK"); // Name unknown
      encoder.putStart(DataType.ARRAY, "contacts"); // Name unknown
      this.encodeContact(encoder, contact);
      encoder.putEnd(DataType.ARRAY, "contacts"); // Name unknown
    } else {
      encoder.put(DataType.STRING, "result", "Entry not found"); // Name unknown
    }
    encoder.putEnd(DataType.STRUCT, "event");

    var replyData = new TextEncoder().encode(encoder.getData());
    this.sendMessageToClient(replyData, 0, replyData.length);
  }).bind(this);

  contacts.getNext(gotContact);
};

NokiaContactsLocalMsgConnection.prototype.sendMessageToServer = function(data, offset, length) {
  var decoder = new DataDecoder(data, offset, length);

  decoder.getStart(DataType.STRUCT);
  var name = decoder.getValue(DataType.METHOD);

  switch (name) {
    case "Common":
      var encoder = new DataEncoder();

      encoder.putStart(DataType.STRUCT, "event");
      encoder.put(DataType.METHOD, "name", "Common");
      encoder.putStart(DataType.STRUCT, "message");
      encoder.put(DataType.METHOD, "name", "ProtocolVersion");
      encoder.put(DataType.STRING, "version", "2.[0-10]");
      encoder.putEnd(DataType.STRUCT, "message");
      encoder.putEnd(DataType.STRUCT, "event");

      var replyData = new TextEncoder().encode(encoder.getData());
      this.sendMessageToClient(replyData, 0, replyData.length);
    break;

    case "NotifySubscribe":
      contacts.forEach(this.sendContact.bind(this, decoder.getValue(DataType.ULONG)));
    break;

    case "getFirst":
      var trans_id = decoder.getValue(DataType.ULONG);
      decoder.getEnd(DataType.ARRAY); // Ignore the contents of the "sources" array
      var numEntries = decoder.getValue(DataType.ULONG);
      if (numEntries !== 1) {
        console.error("(nokia.contacts) event getFirst with numEntries != 1 not implemented " +
                      util.decodeUtf8(data.subarray(offset, offset + length)));
      }

      this.getFirstOrNext(trans_id, "getFirst");
    break;

    case "getNext":
      var trans_id = decoder.getValue(DataType.ULONG);
      decoder.getEnd(DataType.ARRAY); // Ignore the contents of the "sources" array
      decoder.getEnd(DataType.LIST); // Ignore the contents of the "filter" list
      decoder.getStart(DataType.LIST);
      var contactID = decoder.getValue(DataType.WSTRING);
      decoder.getEnd(DataType.LIST);
      var includeStartEntry = decoder.getValue(DataType.BOOLEAN);
      if (includeStartEntry == 1) {
        console.error("(nokia.contacts) event getNext with includeStartEntry == true not implemented " +
                      util.decodeUtf8(data.subarray(offset, offset + length)));
      }
      var numEntries = decoder.getValue(DataType.ULONG);
      if (numEntries !== 1) {
        console.error("(nokia.contacts) event getNext with numEntries != 1 not implemented " +
                      util.decodeUtf8(data.subarray(offset, offset + length)));
      }

      this.getFirstOrNext(trans_id, "getNext");
    break;

    default:
      console.error("(nokia.contacts) event " + name + " not implemented " +
                    util.decodeUtf8(data.subarray(offset, offset + length)));
      return;
  }
}

var NokiaFileUILocalMsgConnection = function() {
    LocalMsgConnection.call(this);
};

NokiaFileUILocalMsgConnection.prototype = Object.create(LocalMsgConnection.prototype);

NokiaFileUILocalMsgConnection.prototype.sendMessageToServer = function(data, offset, length) {
  var decoder = new DataDecoder(data, offset, length);

  decoder.getStart(DataType.STRUCT);
  var name = decoder.getValue(DataType.METHOD);

  switch (name) {
    case "Common":
      var encoder = new DataEncoder();

      encoder.putStart(DataType.STRUCT, "event");
      encoder.put(DataType.METHOD, "name", "Common");
      encoder.putStart(DataType.STRUCT, "message");
      encoder.put(DataType.METHOD, "name", "ProtocolVersion");
      encoder.put(DataType.STRING, "version", "1.0");
      encoder.putEnd(DataType.STRUCT, "message");
      encoder.putEnd(DataType.STRUCT, "event");

      var replyData = new TextEncoder().encode(encoder.getData());
      this.sendMessageToClient(replyData, 0, replyData.length);
      break;

    case "FileSelect":
      var trans_id = decoder.getValue(DataType.USHORT);
      var storageType = decoder.getValue(DataType.STRING);
      var mediaType = decoder.getValue(DataType.STRING);
      var multipleSelection = decoder.getValue(DataType.BOOLEAN);
      var startingURL = decoder.getValue(DataType.STRING);

      var accept = '';

      switch (mediaType) {
        case "Picture":
          accept = "image/*";
        break;

        case "Video":
          accept = "video/*";
        break;

        case "Music":
        case "Sound":
          accept = "audio/*";
        break;

        default:
          throw new Error("Media type '" + mediaType + "' not supported");
      }

      var promptTemplateNode = document.getElementById('nokia-fileui-prompt');
      var el = promptTemplateNode.cloneNode(true);
      el.style.display = 'block';
      el.classList.add('visible');

      var fileInput = el.querySelector('input');
      fileInput.accept = accept;

      var btnDone = el.querySelector('button.recommend');
      btnDone.disabled = true;

      var selectedFile = null;

      fileInput.addEventListener('change', function() {
        btnDone.disabled = false;
        selectedFile = this.files[0];
      });

      el.querySelector('button.cancel').addEventListener('click', function() {
        el.parentElement.removeChild(el);
      });

      btnDone.addEventListener('click', (function() {
        el.parentElement.removeChild(el);

        if (!selectedFile) {
          return;
        }

        var ext = "";
        var extIndex = selectedFile.name.lastIndexOf(".");
        if (extIndex != -1) {
          ext = selectedFile.name.substr(extIndex);
        }

        var fileName = fs.createUniqueFile("/Private/nokiafileui", "file" + ext, selectedFile);
        var encoder = new DataEncoder();

        encoder.putStart(DataType.STRUCT, "event");
        encoder.put(DataType.METHOD, "name", "FileSelect");
        encoder.put(DataType.USHORT, "trans_id", trans_id);
        encoder.put(DataType.STRING, "result", "OK"); // Name unknown
        encoder.putStart(DataType.ARRAY, "unknown_array"); // Name unknown
        encoder.putStart(DataType.STRUCT, "unknown_struct"); // Name unknown
        encoder.put(DataType.STRING, "unknown_string_1", ""); // Name and value unknown
        encoder.put(DataType.WSTRING, "unknown_string_2", ""); // Name and value unknown
        encoder.put(DataType.WSTRING, "unknown_string_3", "Private/nokiafileui/" + fileName); // Name unknown
        encoder.put(DataType.BOOLEAN, "unknown_boolean", 1); // Name and value unknown
        encoder.put(DataType.ULONG, "unknown_long", 0); // Name and value unknown
        encoder.putEnd(DataType.STRUCT, "unknown_struct"); // Name unknown
        encoder.putEnd(DataType.ARRAY, "unknown_array"); // Name unknown
        encoder.putEnd(DataType.STRUCT, "event");

        var replyData = new TextEncoder().encode(encoder.getData());
        this.sendMessageToClient(replyData, 0, replyData.length);
      }).bind(this));

      promptTemplateNode.parentNode.appendChild(el);
    break;

    default:
      console.error("(nokia.file-ui) event " + name + " not implemented " +
                    util.decodeUtf8(data.subarray(offset, offset + length)));
      return;
  }
};

var NokiaImageProcessingLocalMsgConnection = function() {
    LocalMsgConnection.call(this);
};

NokiaImageProcessingLocalMsgConnection.prototype = Object.create(LocalMsgConnection.prototype);

NokiaImageProcessingLocalMsgConnection.prototype.sendMessageToServer = function(data, offset, length) {
  var decoder = new DataDecoder(data, offset, length);

  decoder.getStart(DataType.STRUCT);
  var name = decoder.getValue(DataType.METHOD);

  switch (name) {
    case "Common":
      var encoder = new DataEncoder();

      encoder.putStart(DataType.STRUCT, "event");
      encoder.put(DataType.METHOD, "name", "Common");
      encoder.putStart(DataType.STRUCT, "message");
      encoder.put(DataType.METHOD, "name", "ProtocolVersion");
      encoder.put(DataType.STRING, "version", "1.0");
      encoder.putEnd(DataType.STRUCT, "message");
      encoder.putEnd(DataType.STRUCT, "event");

      var replyData = new TextEncoder().encode(encoder.getData());
      this.sendMessageToClient(replyData, 0, replyData.length);
      break;

    case "Scale":
      var trans_id = decoder.getValue(DataType.BYTE);
      var fileName = decoder.getValue(DataType.WSTRING);
      var max_vres = 0;
      var max_hres = 0;
      var max_kb = 0;
      decoder.getStart(DataType.LIST);
      while (true) {
        var paramName = decoder.getName();
        var value = decoder.getValue(DataType.USHORT);
        if (paramName === "limits")
          break;

        switch (paramName) {
          case "max_kb":
            max_kb = value;
            break;
          case "max_vres":
            max_vres = value;
            break;
          case "max_hres":
            max_hres = value;
            break;
          default:
            console.error("(nokia.image-processing) event " + name + " with " +
              paramName + " = " + value + " not implemented.");
            return;
        }
      }
      decoder.getEnd(DataType.LIST);
      var aspect = decoder.getValue(DataType.STRING);
      var quality = decoder.getValue(DataType.BYTE) || 80;

      if (aspect != "FullImage" && aspect != "LockToPartialView") {
        console.error("(nokia.image-processing) event " + name + " with aspect != 'FullImage' or 'LockToPartialView' not implemented " +
                      util.decodeUtf8(data.subarray(offset, offset + length)));
        return;
      }

      if (fileName.startsWith("file:///")) {
        fileName = fileName.substring("file:///".length);
      }

      if (!fileName.startsWith("/")) {
        fileName = "/" + fileName;
      }

      var imgData = fs.getBlob(fileName);
      var img = new Image();
      img.src = URL.createObjectURL(imgData);

      function _cleanupImg() {
        if (img) {
          URL.revokeObjectURL(img.src);
          img.src = '';
          img = null;
        }
      }

      var _sendBackScaledImage = function(blob) {
        _cleanupImg();

        var ext = "";
        var extIndex = fileName.lastIndexOf(".");
        if (extIndex != -1) {
          ext = fileName.substr(extIndex);
        }

        var uniqueFileName = fs.createUniqueFile("/Private/nokiaimageprocessing", "image" + ext, blob);
        var encoder = new DataEncoder();

        encoder.putStart(DataType.STRUCT, "event");
        encoder.put(DataType.METHOD, "name", "Scale");
        encoder.put(DataType.BYTE, "trans_id", trans_id);
        encoder.put(DataType.STRING, "result", "Complete"); // Name unknown
        encoder.put(DataType.WSTRING, "filename", "Private/nokiaimageprocessing/" + uniqueFileName); // Name unknown
        encoder.putEnd(DataType.STRUCT, "event");

        var replyData = new TextEncoder().encode(encoder.getData());
        this.sendMessageToClient(replyData, 0, replyData.length);
      }.bind(this);

      img.onload = (function() {
        // If the image size is less than the given max_kb, and height/width
        // are less than max_hres/max_wres, send the original image immediately
        // without any scaling.
        if (max_kb > 0 && (max_kb * 1024) >= imgData.size &&
            (max_hres <= 0 || img.naturalHeight <= max_vres) &&
            (max_vres <= 0 || img.naturalWidth <= max_hres)) {
          _sendBackScaledImage(imgData);
          return;
        }

        // Keep the aspect ratio of the image.
        var ratioX = max_hres / img.naturalWidth;
        var ratioY = max_vres / img.naturalHeight;
        var ratio = ratioX < ratioY ? ratioX : ratioY;
        max_hres = ratio * img.naturalWidth;
        max_vres = ratio * img.naturalHeight;

        function _imageToBlob(aCanvas, aImage, aHeight, aWidth, aQuality) {
          aCanvas.width = aWidth;
          aCanvas.height = aHeight;
          var ctx = aCanvas.getContext("2d");
          ctx.drawImage(aImage, 0, 0, aWidth, aHeight);

          return new Promise(function(resolve, reject) {
            aCanvas.toBlob(resolve, "image/jpeg", aQuality / 100);
          });
        }

        var canvas = document.createElement("canvas");
        if (max_kb <= 0) {
          _imageToBlob(canvas, img, Math.min(img.naturalHeight, max_vres),
                       Math.min(img.naturalWidth, max_hres), quality).then(_sendBackScaledImage);
          return;
        }

        _imageToBlob(canvas, img, img.naturalHeight,
                     img.naturalWidth, quality).then(function(blob) {
          var imgSizeInKb = blob.size / 1024;

          // Roughly recalc max_vres and max_hres based on the max_kb and the real resolution.
          var sizeRatio = Math.sqrt(max_kb / imgSizeInKb);
          max_hres = Math.min(img.naturalWidth * sizeRatio,
            max_hres <= 0 ? img.naturalWidth : max_hres);
          max_vres = Math.min(img.naturalHeight * sizeRatio,
            max_vres <=0 ? img.naturalHeight : max_vres);

          return _imageToBlob(canvas, img, Math.min(img.naturalHeight, max_vres),
                              Math.min(img.naturalWidth, max_hres), quality);
        }).then(_sendBackScaledImage);
      }).bind(this);

      img.onerror = function(e) {
        console.error("Error in decoding image");
        _cleanupImg();
      };
    break;

    default:
      console.error("(nokia.image-processing) event " + name + " not implemented " +
                    util.decodeUtf8(data.subarray(offset, offset + length)));
      return;
  }
};

var NokiaProductInfoLocalMsgConnection = function() {
    LocalMsgConnection.call(this);
};

NokiaProductInfoLocalMsgConnection.prototype = Object.create(LocalMsgConnection.prototype);

NokiaProductInfoLocalMsgConnection.prototype.sendMessageToServer = function(data, offset, length) {
  var encoder = new DataEncoder();
  var decoder = new DataDecoder(data, offset, length);
  decoder.getStart(DataType.STRUCT);

  var name = decoder.getValue(DataType.METHOD);
  switch (name) {
    case "Common":
      encoder.putStart(DataType.STRUCT, "event");
      encoder.put(DataType.METHOD, "name", "Common");
      encoder.putStart(DataType.STRUCT, "message");
      encoder.put(DataType.METHOD, "name", "ProtocolVersion");
      encoder.put(DataType.STRING, "version", "1.1");
      encoder.putEnd(DataType.STRUCT, "message");
      encoder.putEnd(DataType.STRUCT, "event");

      var replyData = new TextEncoder().encode(encoder.getData());
      this.sendMessageToClient(replyData, 0, replyData.length);
      break;
    case "ReadProductInfo":
      encoder.putStart(DataType.STRUCT, "event");
      encoder.put(DataType.METHOD, "name", "ReadProductInfo");
      encoder.put(DataType.STRING, "result", "OK");
      encoder.put(DataType.STRING, "unkown_str_1", "");
      encoder.put(DataType.STRING, "unkown_str_2", "");
      encoder.put(DataType.STRING, "unkown_str_3", "");
      encoder.put(DataType.STRING, "unkown_str_4", ""); // Probably RMCODE
      encoder.put(DataType.STRING, "unkown_str_5", "");
      encoder.putEnd(DataType.STRUCT, "event");

      var replyData = new TextEncoder().encode(encoder.getData());
      this.sendMessageToClient(replyData, 0, replyData.length);
      break;
    default:
      console.error("(nokia.status-info) event " + name + " not implemented " +
                    util.decodeUtf8(data.subarray(offset, offset + length)));
      return;
  }
};

var NokiaActiveStandbyLocalMsgConnection = function() {
    LocalMsgConnection.call(this);
}

NokiaActiveStandbyLocalMsgConnection.indicatorActive = false;
NokiaActiveStandbyLocalMsgConnection.pipeSender = null;

NokiaActiveStandbyLocalMsgConnection.prototype = Object.create(LocalMsgConnection.prototype);

NokiaActiveStandbyLocalMsgConnection.prototype.recipient = function(message) {
  switch (message.type) {
    case "close":
      DumbPipe.close(NokiaActiveStandbyLocalMsgConnection.pipeSender);
      NokiaActiveStandbyLocalMsgConnection.pipeSender = null;
    break;
  }
}

NokiaActiveStandbyLocalMsgConnection.prototype.sendMessageToServer = function(data, offset, length) {
  var encoder = new DataEncoder();

  var decoder = new DataDecoder(data, offset, length);

  decoder.getStart(DataType.STRUCT);
  var name = decoder.getValue(DataType.METHOD);

  switch (name) {
    case "Common":
      encoder.putStart(DataType.STRUCT, "event");
      encoder.put(DataType.METHOD, "name", "Common");
      encoder.putStart(DataType.STRUCT, "message");
      encoder.put(DataType.METHOD, "name", "ProtocolVersion");
      encoder.put(DataType.STRING, "version", "1.[0-10]");
      encoder.putEnd(DataType.STRUCT, "message");
      encoder.putEnd(DataType.STRUCT, "event");

      var replyData = new TextEncoder().encode(encoder.getData());
      this.sendMessageToClient(replyData, 0, replyData.length);
    break;

    case "Register":
      var client_id = decoder.getValue(DataType.STRING);
      var personalise_view_text = decoder.getValue(DataType.WSTRING);
      decoder.getValue(DataType.BOOLEAN);

      encoder.putStart(DataType.STRUCT, "event");
      encoder.put(DataType.METHOD, "name", "Register");
      encoder.put(DataType.WSTRING, "client_id", client_id);
      encoder.put(DataType.STRING, "result", "OK"); // Name unknown
      encoder.putEnd(DataType.STRUCT, "event");

      var replyData = new TextEncoder().encode(encoder.getData());
      this.sendMessageToClient(replyData, 0, replyData.length);

      nextTickBeforeEvents((function() {
        var encoder = new DataEncoder();

        encoder.putStart(DataType.STRUCT, "event");
        encoder.put(DataType.METHOD, "name", "Activated");
        encoder.put(DataType.WSTRING, "client_id", client_id);
        encoder.putStart(DataType.LIST, "unknown_list");
        // Unknown DataType.STRING elements
        encoder.putEnd(DataType.LIST, "unknown_list");
        encoder.put(DataType.BYTE, "unkown_byte", 1); // Name unknown
        encoder.put(DataType.SHORT, "unknown_short_1", 0); // Name and value unknown
        encoder.put(DataType.SHORT, "unknown_short_2", 0); // Name and value unknown
        encoder.putEnd(DataType.STRUCT, "event");

        var replyData = new TextEncoder().encode(encoder.getData());
        this.sendMessageToClient(replyData, 0, replyData.length);
      }).bind(this));
    break;

    case "Update":
      var client_id = decoder.getValue(DataType.STRING);
      var personalise_view_text = decoder.getValue(DataType.WSTRING);
      var activate_scroll_events = decoder.getValue(DataType.BOOLEAN);
      var content_icon = decoder.getNextValue();
      var mime_type = decoder.getValue(DataType.STRING);
      var context_text = decoder.getValue(DataType.WSTRING);

      if (NokiaActiveStandbyLocalMsgConnection.indicatorActive) {
        NokiaActiveStandbyLocalMsgConnection.pipeSender = DumbPipe.open("notification", {
          title: personalise_view_text,
          options: {
            body: context_text,
          },
          icon: content_icon,
          mime_type: mime_type,
        }, this.recipient.bind(this));
      }

      encoder.putStart(DataType.STRUCT, "event");
      encoder.put(DataType.METHOD, "name", "Update");
      encoder.put(DataType.WSTRING, "client_id", client_id);
      encoder.put(DataType.STRING, "result", "OK"); // Name unknown
      encoder.putEnd(DataType.STRUCT, "event");

      var replyData = new TextEncoder().encode(encoder.getData());
      this.sendMessageToClient(replyData, 0, replyData.length);
      break;

    default:
      console.error("(nokia.active-standby) event " + name + " not implemented " +
                    util.decodeUtf8(data.subarray(offset, offset + length)));
      return;
  }
}

Native["com/nokia/mid/ui/lcdui/Indicator.setActive.(Z)V"] = function(addr, active) {
  NokiaActiveStandbyLocalMsgConnection.indicatorActive = active;

  if (!active && NokiaActiveStandbyLocalMsgConnection.pipeSender) {
    NokiaActiveStandbyLocalMsgConnection.pipeSender({ type: "close" });
  }
};

MIDP.LocalMsgConnections = {};

// Add some fake servers because some MIDlets assume they exist.
// MIDlets are usually happy even if the servers don't reply, but we should
// remember to implement them in case they will be needed.
MIDP.FakeLocalMsgServers = [ "nokia.profile", "nokia.connectivity-settings" ];

MIDP.FakeLocalMsgServers.forEach(function(server) {
    MIDP.LocalMsgConnections[server] = LocalMsgConnection;
});

MIDP.LocalMsgConnections["nokia.contacts"] = NokiaContactsLocalMsgConnection;
MIDP.LocalMsgConnections["nokia.messaging"] = NokiaMessagingLocalMsgConnection;
MIDP.LocalMsgConnections["nokia.phone-status"] = NokiaPhoneStatusLocalMsgConnection;
MIDP.LocalMsgConnections["nokia.file-ui"] = NokiaFileUILocalMsgConnection;
MIDP.LocalMsgConnections["nokia.image-processing"] = NokiaImageProcessingLocalMsgConnection;
MIDP.LocalMsgConnections["nokia.sa.service-registry"] = NokiaSASrvRegLocalMsgConnection;
MIDP.LocalMsgConnections["nokia.active-standby"] = NokiaActiveStandbyLocalMsgConnection;
MIDP.LocalMsgConnections["nokia.product-info"] = NokiaProductInfoLocalMsgConnection;

var localmsgServerWait = null;

Native["org/mozilla/io/LocalMsgConnection.init.(Ljava/lang/String;)V"] = function(addr, nameAddr) {
    var name = J2ME.fromStringAddr(nameAddr);

    var info = {
      server: (name[2] == ":"),
      protocolName: name.slice((name[2] == ':') ? 3 : 2),
    };

    setNative(addr, info);

    if (info.server) {
        // It seems that one server only serves on client at a time, let's
        // store an object instead of the constructor.
        info.connection = MIDP.LocalMsgConnections[info.protocolName] = new LocalMsgConnection();
        if (localmsgServerWait) {
            localmsgServerWait();
        }

        return;
    }

    if (!MIDP.LocalMsgConnections[info.protocolName]) {
        if (info.protocolName.startsWith("nokia")) {
            console.error("localmsg server (" + info.protocolName + ") unimplemented");
            // Return without resolving the promise, we want the thread that is connecting
            // to this unimplemented server to stop indefinitely.
            return;
        }

        asyncImpl("V", new Promise(function(resolve, reject) {
            localmsgServerWait = function() {
                localmsgServerWait = null;
                info.connection = MIDP.LocalMsgConnections[info.protocolName];
                info.connection.notifyConnection();
                resolve();
            };
        }));

        return;
    }

    if (MIDP.FakeLocalMsgServers.indexOf(info.protocolName) != -1) {
        console.warn("connect to an unimplemented localmsg server (" + info.protocolName + ")");
    }

    info.connection = typeof MIDP.LocalMsgConnections[info.protocolName] === 'function' ?
        new MIDP.LocalMsgConnections[info.protocolName]() : MIDP.LocalMsgConnections[info.protocolName];

    info.connection.reset();

    info.connection.notifyConnection();
};

Native["org/mozilla/io/LocalMsgConnection.waitConnection.()V"] = function(addr) {
    var connection = NativeMap.get(addr).connection;

    if (connection.clientConnected) {
        return;
    }

    asyncImpl("V", connection.waitConnection());
};

Native["org/mozilla/io/LocalMsgConnection.sendData.([BII)V"] = function(addr, dataAddr, offset, length) {
    // Clone the data since it may be GC'ed.
    var dataClone = new Int8Array(length);
    var data = J2ME.getArrayFromAddr(dataAddr);
    for (var i = 0; i < length; i++) {
      dataClone[i] = data[offset + i];
    }

    var info = NativeMap.get(addr);
    var connection = info.connection;

    if (info.server) {
        connection.sendMessageToClient(dataClone, 0, dataClone.length);
    } else {
        if (MIDP.FakeLocalMsgServers.indexOf(info.protocolName) != -1) {
            console.warn("sendData (" + util.decodeUtf8(dataClone) +
                         ") to an unimplemented localmsg server (" + info.protocolName + ")");
        }

        connection.sendMessageToServer(dataClone, 0, dataClone.length);
    }
};

Native["org/mozilla/io/LocalMsgConnection.receiveData.([B)I"] = function(addr, dataAddr) {
    J2ME.setUncollectable(dataAddr);

    var info = NativeMap.get(addr);
    var connection = info.connection;

    if (info.server) {
        if (connection.serverMessages.length > 0) {
          return connection.getServerMessage(dataAddr);
        }

        connection.waitServerMessage(dataAddr);
        return;
    }

    if (MIDP.FakeLocalMsgServers.indexOf(info.protocolName) != -1) {
        console.warn("receiveData from an unimplemented localmsg server (" + info.protocolName + ")");
    }

    if (connection.clientMessages.length > 0) {
      return connection.getClientMessage(dataAddr);
    }

    connection.waitClientMessage(dataAddr);
};


/* SOURCE: midp/socket.js */
/* -*- Mode: Java; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4 -*- */
/* vim: set shiftwidth=4 tabstop=4 autoindent cindent expandtab: */



var SOCKET_OPT = {
  DELAY: 0,
  LINGER: 1,
  KEEPALIVE: 2,
  RCVBUF: 3,
  SNDBUF: 4,
};

Native["com/sun/midp/io/j2me/socket/Protocol.getIpNumber0.(Ljava/lang/String;[B)I"] =
function(addr, hostAddr, ipBytesAddr) {
    // We're supposed to write the IP address of the host into ipBytes,
    // but we don't actually have to do that, because we can defer resolution
    // until Protocol.open0 (and delegate it to the native socket impl).
    // So this is a no-op.
    return 0;
};

Native["com/sun/midp/io/j2me/socket/Protocol.getHost0.(Z)Ljava/lang/String;"] = function(addr, local) {
    // XXX We should probably retrieve the host directly from the Java object,
    // as Protocol.open0 does.  Then we wouldn't have to get the native socket,
    // and we might avoid an exception if the socket hasn't been opened yet
    // (so the native socket doesn't exist).
    // var self = getHandle(addr);
    // var host = J2ME.fromStringAddr(self.host);

    var socket = NativeMap.get(addr);
    return J2ME.newString(local ? "127.0.0.1" : socket.host);
};

function Socket(host, port, ctx, resolve, reject) {
    this.sender = DumbPipe.open("socket", { host: host, port: port }, this.recipient.bind(this));
    this.isClosed = false;

    this.options = {};
    this.options[SOCKET_OPT.DELAY] = 1;
    this.options[SOCKET_OPT.LINGER] = 0;
    this.options[SOCKET_OPT.KEEPALIVE] = 1;
    this.options[SOCKET_OPT.RCVBUF] = 8192;
    this.options[SOCKET_OPT.SNDBUF] = 8192;

    this.data = [];
    this.dataLen = 0;
    this.waitingData = null;

    // XXX Move the below functions to the prototype (if possible; they would
    // need to called with the socket instance as their *this* object, and it
    // isn't clear that they are).

    this.onopen = function() {
        // console.log("this.onopen");
        resolve();
    }

    this.onerror = function(message) {
        ctx.setAsCurrentContext();
        // console.log("this.onerror: " + message.error);
        reject($.newIOException(message.error));
    }

    this.onclose = function() {
        if (this.waitingData) {
            this.waitingData();
        }
    }.bind(this);

    this.ondata = function(message) {
        this.data.push(new Int8Array(message.data));
        this.dataLen += message.data.byteLength;

        if (this.waitingData) {
            this.waitingData();
        }
    }.bind(this);
}

Socket.prototype.recipient = function(message) {
    if (message.type == "close") {
        this.isClosed = true;
        DumbPipe.close(this.sender);
    }
    var callback = this["on" + message.type];
    if (callback) {
        callback(message);
    }
}

Socket.prototype.send = function(data, offset, length) {
    // Convert the data to a regular Array to traverse the mozbrowser boundary.
    data = Array.prototype.slice.call(data.subarray(offset, offset + length));
    data.constructor = Array;

    this.sender({ type: "send", data: data });
}

Socket.prototype.close = function() {
    this.sender({ type: "close" });
}

Native["com/sun/midp/io/j2me/socket/Protocol.open0.([BI)V"] = function(addr, ipBytesAddr, port) {
    var self = getHandle(addr);
    var host = J2ME.fromStringAddr(self.host);
    // console.log("Protocol.open0: " + host + ":" + port);
    asyncImpl("V", new Promise(function(resolve, reject) {
        setNative(addr, new Socket(host, port, $.ctx, resolve, reject));
    }));
};

Native["com/sun/midp/io/j2me/socket/Protocol.available0.()I"] = function(addr) {
    var socket = NativeMap.get(addr);
    // console.log("Protocol.available0: " + socket.data.byteLength);
    return socket.dataLen;
};

Native["com/sun/midp/io/j2me/socket/Protocol.read0.([BII)I"] = function(addr, dataAddr, offset, length) {
    var data = J2ME.getArrayFromAddr(dataAddr);
    var socket = NativeMap.get(addr);
    // console.log("Protocol.read0: " + socket.isClosed);

    asyncImpl("I", new Promise(function(resolve, reject) {
        // There might be data left in the buffer when the socket is closed, so we
        // should allow buffer reading even the socket has been closed.
        if (socket.isClosed && socket.dataLen === 0) {
            resolve(-1);
            return;
        }

        var copyData = function() {
            var toRead = (length < socket.dataLen) ? length : socket.dataLen;
            var read = 0;
            while (read < toRead) {
                var remaining = toRead - read;

                var array = socket.data[0];

                if (array.byteLength > remaining) {
                    data.set(array.subarray(0, remaining), read + offset);
                    socket.data[0] = array.subarray(remaining);
                    read += remaining;
                } else {
                    data.set(array, read + offset);
                    socket.data.shift();
                    read += array.byteLength;
                }
            }

            socket.dataLen -= read;

            resolve(read);
        };

        if (socket.dataLen === 0) {
            socket.waitingData = function() {
                socket.waitingData = null;
                copyData();
            };

            return;
        }

        copyData();
    }));
};

Native["com/sun/midp/io/j2me/socket/Protocol.write0.([BII)I"] = function(addr, dataAddr, offset, length) {
    var data = J2ME.getArrayFromAddr(dataAddr);
    var socket = NativeMap.get(addr);
    var ctx = $.ctx;
    asyncImpl("I", new Promise(function(resolve, reject) {
        if (socket.isClosed) {
          ctx.setAsCurrentContext();
          reject($.newIOException("socket is closed"));
          return;
        }

        socket.onsend = function(message) {
            socket.onsend = null;
            if ("error" in message) {
                console.error(message.error);
                ctx.setAsCurrentContext();
                reject($.newIOException("error writing to socket"));
            } else if (message.result) {
                resolve(length);
            } else {
                socket.ondrain = function() {
                    socket.ondrain = null;
                    resolve(length);
                };
            }
        };

        socket.send(data, offset, length);
    }));
};

Native["com/sun/midp/io/j2me/socket/Protocol.setSockOpt0.(II)V"] = function(addr, option, value) {
    var socket = NativeMap.get(addr);
    if (!(option in socket.options)) {
        throw $.newIllegalArgumentException("Unsupported socket option");
    }

    socket.options[option] = value;
};

Native["com/sun/midp/io/j2me/socket/Protocol.getSockOpt0.(I)I"] = function(addr, option) {
    var socket = NativeMap.get(addr);
    if (!(option in socket.options)) {
        throw new $.newIllegalArgumentException("Unsupported socket option");
    }

    return socket.options[option];
};

Native["com/sun/midp/io/j2me/socket/Protocol.close0.()V"] = function(addr) {
    var socket = NativeMap.get(addr);
    // console.log("Protocol.close0: " + socket.isClosed);

    asyncImpl("V", new Promise(function(resolve, reject) {
        if (socket.isClosed) {
            resolve();
            return;
        }

        socket.onclose = function() {
            // console.log("socket.onclose");
            socket.onclose = null;
            resolve();
        };

        socket.close();
    }));
};

Native["com/sun/midp/io/j2me/socket/Protocol.shutdownOutput0.()V"] = function(addr) {
    // We don't have the ability to close the output stream independently
    // of the connection as a whole.  But we don't seem to have to do anything
    // here, since this has just two call sites: one in Protocol.disconnect,
    // right before closing the socket; the other in Protocol.closeOutputStream,
    // which says it will be "called once by the child output stream," although
    // I can't find an actual caller.
};

Native["com/sun/midp/io/j2me/socket/Protocol.notifyClosedInput0.()V"] = function(addr) {
    var socket = NativeMap.get(addr);
    if (socket.waitingData) {
        console.warn("Protocol.notifyClosedInput0.()V unimplemented while thread is blocked on read0");
    }
};

Native["com/sun/midp/io/j2me/socket/Protocol.notifyClosedOutput0.()V"] = function(addr) {
    var socket = NativeMap.get(addr);
    if (socket.ondrain) {
        console.warn("Protocol.notifyClosedOutput0.()V unimplemented while thread is blocked on write0");
    }
};


/* SOURCE: midp/sms.js */
/* -*- Mode: Java; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4 -*- */
/* vim: set shiftwidth=4 tabstop=4 autoindent cindent expandtab: */



MIDP.lastSMSConnection = -1;
MIDP.lastSMSID = -1;
MIDP.smsConnections = {};
MIDP.j2meSMSMessages = [];
MIDP.j2meSMSWaiting = null;
MIDP.nokiaSMSMessages = [];

/**
 * Simulate a received SMS with the given text, sent to the specified addr.
 * (It appears the value of `addr` is unimportant for most apps.)
 */
function receiveSms(text, addr) {
    var sms = {
      text: text,
      addr: addr,
      id: ++MIDP.lastSMSID,
    };

    MIDP.nokiaSMSMessages.push(sms);
    MIDP.j2meSMSMessages.push(sms);

    window.dispatchEvent(new CustomEvent("nokia.messaging", {
      detail: sms
    }));

    if (MIDP.j2meSMSWaiting) {
      MIDP.j2meSMSWaiting();
    }
}

/**
 * This app is listening for SMS messages; for most apps, that means
 * they're looking for the content of a message the app's servers just
 * sent. Prompt the user to enter that code here, and forward it to
 * the app.
 */
function promptForMessageText() {
    startBackgroundAlarm();

    var smsTemplateNode = document.getElementById('sms-listener-prompt');
    var el = smsTemplateNode.cloneNode(true);
    el.style.display = 'block';
    el.classList.add('visible');

    el.querySelector('p.verificationText').textContent = MIDlet.SMSDialogVerificationText;

    var input = el.querySelector('input');
    if (MIDlet.SMSDialogInputType) {
      input.type = MIDlet.SMSDialogInputType;
    }
    var btnCancel = el.querySelector('button.cancel');
    var btnDone = el.querySelector('button.recommend');

    btnDone.disabled = true; // Wait for input before enabling.
    input.addEventListener('input', function() {
        btnDone.disabled = (input.value.length === 0);
    });
    if (MIDlet.SMSDialogInputMaxLength) {
      input.onkeydown = function(e) {
        if (input.value.length >= MIDlet.SMSDialogInputMaxLength) {
          return e.keyCode !== 0 && !util.isPrintable(e.keyCode);
        }

        return true;
      }
    }

    btnCancel.addEventListener('click', function() {
        console.warn('SMS prompt canceled.');
        clearInterval(intervalID);
        clearTimeout(timeoutID);
        el.parentElement.removeChild(el);
    });

    btnDone.addEventListener('click', function() {
        clearInterval(intervalID);
        clearTimeout(timeoutID);
        el.parentElement.removeChild(el);
        // We don't have easy access to our own phone number; use a
        // dummy unknown value instead.
        receiveSms(MIDlet.SMSDialogReceiveFilter(input.value), 'unknown');
    });

    function toTimeText(ms) {
      var seconds = ms / 1000;
      var minutes = Math.floor(seconds / 60);
      seconds -= minutes * 60;

      var text = minutes + ":";

      if (seconds >= 10) {
        text += seconds;
      } else {
        text += "0" + seconds;
      }

      return text;
    }

    el.querySelector('p.timeLeft').textContent = toTimeText(MIDlet.SMSDialogTimeout) +
                                                 " " + MIDlet.SMSDialogTimeoutText;

    smsTemplateNode.parentNode.appendChild(el);
    if (currentlyFocusedTextEditor) {
      currentlyFocusedTextEditor.blur();
      currentlyFocusedTextEditor = null;
    }

    var elapsedMS = 0;
    var intervalID = setInterval(function() {
      elapsedMS += 1000;
      el.querySelector('p.timeLeft').textContent = toTimeText(MIDlet.SMSDialogTimeout - elapsedMS) +
                                                   " " + MIDlet.SMSDialogTimeoutText;
      el.querySelector('progress.timeLeftBar').value = elapsedMS / MIDlet.SMSDialogTimeout * 100;
    }, 1000);

    // Remove the dialog after a timeout
    var timeoutID = setTimeout(function() {
        clearInterval(intervalID);
        el.parentElement.removeChild(el);
    }, MIDlet.SMSDialogTimeout);
}

Native["com/sun/midp/io/j2me/sms/Protocol.open0.(Ljava/lang/String;II)I"] = function(addr, hostAddr, msid, port) {
    MIDP.smsConnections[++MIDP.lastSMSConnection] = {
      port: port,
      msid: msid,
      host: J2ME.fromStringAddr(hostAddr),
    };

    return ++MIDP.lastSMSConnection;
};

Native["com/sun/midp/io/j2me/sms/Protocol.receive0.(IIILcom/sun/midp/io/j2me/sms/Protocol$SMSPacket;)I"] =
function(addr, port, msid, handle, smsPacketAddr) {
    var smsPacket = getHandle(smsPacketAddr);
    asyncImpl("I", new Promise(function(resolve, reject) {
        function receiveSMS() {
            var sms = MIDP.j2meSMSMessages.shift();
            var text = sms.text;
            var addr = sms.addr;

            var messageAddr = J2ME.newByteArray(text.length);
            smsPacket.message = messageAddr;
            var message = J2ME.getArrayFromAddr(messageAddr);
            for (var i = 0; i < text.length; i++) {
                message[i] = text.charCodeAt(i);
            }

            var addressAddr = J2ME.newByteArray(addr.length);
            smsPacket.address = addressAddr;
            var address = J2ME.getArrayFromAddr(addressAddr);
            for (var i = 0; i < addr.length; i++) {
                address[i] = addr.charCodeAt(i);
            }

            smsPacket.port = port;
            smsPacket.sentAt = Date.now();
            smsPacket.messageType = 0; // GSM_TEXT

            return text.length;
        }

        if (MIDP.j2meSMSMessages.length > 0) {
          resolve(receiveSMS());
        } else {
          MIDP.j2meSMSWaiting = function() {
            MIDP.j2meSMSWaiting = null;
            resolve(receiveSMS());
          }
        }
    }));
};

Native["com/sun/midp/io/j2me/sms/Protocol.close0.(III)I"] = function(addr, port, handle, deRegister) {
    delete MIDP.smsConnections[handle];
    return 0;
};

Native["com/sun/midp/io/j2me/sms/Protocol.numberOfSegments0.([BIIZ)I"] =
function(addr, msgBufferAddr, msgLen, msgType, hasPort) {
    console.warn("com/sun/midp/io/j2me/sms/Protocol.numberOfSegments0.([BIIZ)I not implemented");
    return 1;
};

Native["com/sun/midp/io/j2me/sms/Protocol.send0.(IILjava/lang/String;II[B)I"] =
function(addr, handle, type, hostAddr, destPort, sourcePort, messageAddr) {
    var message = J2ME.getArrayFromAddr(messageAddr);
    var ctx = $.ctx;
    asyncImpl("I", new Promise(function(resolve, reject) {
        var pipe = DumbPipe.open("mozActivity", {
            name: "new",
            data: {
                type: "websms/sms",
                number: J2ME.fromStringAddr(hostAddr),
                body: new TextDecoder('utf-16be').decode(message),
            },
        }, function(message) {
            switch (message.type) {
                case "onsuccess":
                    DumbPipe.close(pipe);
                    resolve(message.byteLength);
                    break;

                case "onerror":
                    ctx.setAsCurrentContext();
                    reject($.newIOException("Error while sending SMS message"));
                    break;
            }
        });
    }));
};


/* SOURCE: midp/codec.js */
/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */



var DataType = {
  BOOLEAN: 0,
  CHAR: 1,
  BYTE: 2,
  WCHAR: 3,
  SHORT: 4,
  USHORT: 5,
  LONG: 6,
  ULONG: 7,
  FLOAT: 8,
  DOUBLE: 9,
  STRING: 10,
  WSTRING: 11,
  URI: 12,
  METHOD: 13,
  STRUCT: 14,
  LIST: 15,
  ARRAY: 16,
};

var DataEncoder = function() {
  this.data = [];
}

DataEncoder.START = 1;
DataEncoder.END = 2;

DataEncoder.prototype.putStart = function(tag, name) {
  this.data.push({
    type: DataEncoder.START,
    tag: tag,
    name: name,
  });
}

DataEncoder.prototype.putEnd = function(tag, name) {
  this.data.push({
    type: DataEncoder.END,
    tag: tag,
    name: name,
  })
}

DataEncoder.prototype.put = function(tag, name, value) {
  this.data.push({
    tag: tag,
    name: name,
    value: value,
  });
}

DataEncoder.prototype.putNoTag = function(name, value) {
  this.data.push({
    name: name,
    value: value,
  });
}

DataEncoder.prototype.getData = function() {
  return JSON.stringify(this.data);
}

var DataDecoder = function(data, offset, length) {
  this.data = JSON.parse(util.decodeUtf8(data.subarray(offset, offset + length)));
  this.current = [];
}

DataDecoder.prototype.find = function(tag, type) {
  var elem;
  var i = 0;
  while (elem = this.data[i++]) {
    if ((!type || elem.type == type) && elem.tag == tag) {
      this.data = this.data.slice(i);
      return elem;
    }

    if (elem.type == DataEncoder.END) {
      break;
    }
  }
}

DataDecoder.prototype.getStart = function(tag) {
  var elem = this.find(tag, DataEncoder.START);
  if (!elem) {
    return false;
  }

  this.current.push(elem);

  return true;
}

DataDecoder.prototype.getEnd = function(tag) {
  var elem = this.find(tag, DataEncoder.END);
  if (!elem) {
    return false;
  }

  // If this happens, a father has ended before a child
  if (elem.tag != this.current[this.current.length - 1].tag ||
      elem.name != this.current[this.current.length - 1].name) {
    return false;
  }

  this.current.pop();

  return true;
}

DataDecoder.prototype.getValue = function(tag) {
  var elem = this.find(tag);
  return elem ? elem.value : undefined;
}

DataDecoder.prototype.getNextValue = function() {
  var elem = this.data.shift();
  return elem ? elem.value : undefined;
}

DataDecoder.prototype.getName = function() {
  return this.data[0].name;
}

DataDecoder.prototype.getTag = function() {
  return this.data[0].tag;
}

DataDecoder.prototype.getType = function() {
  return this.data[0].type || -1;
}

Native["com/nokia/mid/s40/codec/DataEncoder.init.()V"] = function(addr) {
  setNative(addr, new DataEncoder());
};

Native["com/nokia/mid/s40/codec/DataEncoder.putStart.(ILjava/lang/String;)V"] = function(addr, tag, nameAddr) {
  NativeMap.get(addr).putStart(tag, J2ME.fromStringAddr(nameAddr));
};

Native["com/nokia/mid/s40/codec/DataEncoder.put.(ILjava/lang/String;Ljava/lang/String;)V"] = function(addr, tag, nameAddr, valueAddr) {
  NativeMap.get(addr).put(tag, J2ME.fromStringAddr(nameAddr), J2ME.fromStringAddr(valueAddr));
};

Native["com/nokia/mid/s40/codec/DataEncoder.put.(ILjava/lang/String;J)V"] = function(addr, tag, nameAddr, valueLow, valueHigh) {
  NativeMap.get(addr).put(tag, J2ME.fromStringAddr(nameAddr), J2ME.longToNumber(valueLow, valueHigh));
};

Native["com/nokia/mid/s40/codec/DataEncoder.put.(ILjava/lang/String;Z)V"] = function(addr, tag, nameAddr, value) {
  NativeMap.get(addr).put(tag, J2ME.fromStringAddr(nameAddr), value);
};

Native["com/nokia/mid/s40/codec/DataEncoder.put.(Ljava/lang/String;[BI)V"] = function(addr, nameAddr, dataAddr, length) {
  var array = Array.prototype.slice.call(J2ME.getArrayFromAddr(dataAddr).subarray(0, length));
  array.constructor = Array;
  NativeMap.get(addr).putNoTag(J2ME.fromStringAddr(nameAddr), array);
};

Native["com/nokia/mid/s40/codec/DataEncoder.putEnd.(ILjava/lang/String;)V"] = function(addr, tag, nameAddr) {
  NativeMap.get(addr).putEnd(tag, J2ME.fromStringAddr(nameAddr));
};

Native["com/nokia/mid/s40/codec/DataEncoder.getData.()[B"] = function(addr) {
  var data = NativeMap.get(addr).getData();

  var arrayAddr = J2ME.newByteArray(data.length);
  var array = J2ME.getArrayFromAddr(arrayAddr);
  for (var i = 0; i < data.length; i++) {
    array[i] = data.charCodeAt(i);
  }

  return arrayAddr;
};

Native["com/nokia/mid/s40/codec/DataDecoder.init.([BII)V"] = function(addr, dataAddr, offset, length) {
  setNative(addr, new DataDecoder(J2ME.getArrayFromAddr(dataAddr), offset, length));
};

Native["com/nokia/mid/s40/codec/DataDecoder.getStart.(I)V"] = function(addr, tag) {
  if (!NativeMap.get(addr).getStart(tag)) {
    throw $.newIOException("no start found " + tag);
  }
};

Native["com/nokia/mid/s40/codec/DataDecoder.getEnd.(I)V"] = function(addr, tag) {
  if (!NativeMap.get(addr).getEnd(tag)) {
    throw $.newIOException("no end found " + tag);
  }
};

Native["com/nokia/mid/s40/codec/DataDecoder.getString.(I)Ljava/lang/String;"] = function(addr, tag) {
  var str = NativeMap.get(addr).getValue(tag);
  if (str === undefined) {
    throw $.newIOException("tag (" + tag + ") invalid");
  }
  return J2ME.newString(str);
};

Native["com/nokia/mid/s40/codec/DataDecoder.getInteger.(I)J"] = function(addr, tag) {
  var num = NativeMap.get(addr).getValue(tag);
  if (num === undefined) {
    throw $.newIOException("tag (" + tag + ") invalid");
  }
  return J2ME.returnLongValue(num);
};

Native["com/nokia/mid/s40/codec/DataDecoder.getBoolean.()Z"] = function(addr) {
  var val = NativeMap.get(addr).getNextValue();
  if (val === undefined) {
    throw $.newIOException();
  }
  return val === 1 ? 1 : 0;
};

Native["com/nokia/mid/s40/codec/DataDecoder.getName.()Ljava/lang/String;"] = function(addr) {
  var name = NativeMap.get(addr).getName();
  if (name === undefined) {
    throw $.newIOException();
  }
  return J2ME.newString(name);
};

Native["com/nokia/mid/s40/codec/DataDecoder.getType.()I"] = function(addr) {
  var tag = NativeMap.get(addr).getTag();
  if (tag === undefined) {
    throw $.newIOException();
  }
  return tag;
};

Native["com/nokia/mid/s40/codec/DataDecoder.listHasMoreItems.()Z"] = function(addr) {
  return NativeMap.get(addr).getType() != DataEncoder.END ? 1 : 0;
};


/* SOURCE: midp/pim.js */
/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */



var PIM = {};
PIM.CONTACT_LIST = 1;
PIM.EVENT_LIST = 2;
PIM.TODO_LIST = 3;
PIM.READ_ONLY = 1;
PIM.WRITE_ONLY = 2;
PIM.READ_WRITE = 3;

PIM.Contact = {
  FORMATTED_NAME: 105,
  TEL: 115,
  UID: 117,
};

PIM.PIMItem = {
  BINARY: 0,
  BOOLEAN: 1,
  DATE: 2,
  INT: 3,
  STRING: 4,
  STRING_ARRAY: 5,
};

PIM.supportedFields = [
{
  field: PIM.Contact.FORMATTED_NAME,
  dataType: PIM.PIMItem.STRING,
  maxValues: -1,
},
{
  field: PIM.Contact.TEL,
  dataType: PIM.PIMItem.STRING,
  maxValues: -1,
},
{
  field: PIM.Contact.UID,
  dataType: PIM.PIMItem.STRING,
  maxValues: 1,
},
];

PIM.lastListHandle = 0;
PIM.openLists = {};

Native["com/sun/j2me/pim/PIMProxy.getListNamesCount0.(I)I"] = function(addr, listType) {
  console.warn("PIMProxy.getListNamesCount0.(I)I incomplete");

  if (listType === PIM.CONTACT_LIST) {
    return 1;
  }

  return 0;
};

Native["com/sun/j2me/pim/PIMProxy.getListNames0.([Ljava/lang/String;)V"] = function(addr, namesAddr) {
  var names = J2ME.getArrayFromAddr(namesAddr);
  console.warn("PIMProxy.getListNames0.([Ljava/lang/String;)V incomplete");
  names[0] = J2ME.newString("ContactList");
};

Native["com/sun/j2me/pim/PIMProxy.listOpen0.(ILjava/lang/String;I)I"] = function(addr, listType, listNameAddr, mode) {
  console.warn("PIMProxy.listOpen0.(ILjava/lang/String;I)I incomplete");

  if (mode !== PIM.READ_ONLY) {
    console.warn("PIMProxy.listOpen0.(ILjava/lang/String;I)I in write mode not implemented");
    return 0;
  }

  if (listType === PIM.CONTACT_LIST) {
    PIM.openLists[++PIM.lastListHandle] = {};
    return PIM.lastListHandle;
  }

  return 0;
};

Native["com/sun/j2me/pim/PIMProxy.getNextItemDescription0.(I[I)Z"] = function(addr, listHandle, descriptionAddr) {
  var description = J2ME.getArrayFromAddr(descriptionAddr);
  console.warn("PIMProxy.getNextItemDescription0.(I[I)Z incomplete");

  asyncImpl("Z", new Promise(function(resolve, reject) {
    contacts.getNext(function(contact) {
      if (contact == null) {
        resolve(0);
        return;
      }

      var str = '';

      contact2vcard.ContactToVcard([ contact ], function(vcards, nCards) {
        str += vcards;
      }, function() {
        PIM.curVcard = new TextEncoder('utf8').encode(str);

        description[0] = contact.id;
        description[1] = PIM.curVcard.byteLength;
        description[2] = 1;

        resolve(1);
      });
    });
  }));
};

Native["com/sun/j2me/pim/PIMProxy.getNextItemData0.(I[BI)Z"] = function(addr, itemHandle, dataAddr, dataHandle) {
  var data = J2ME.getArrayFromAddr(dataAddr);
  console.warn("PIMProxy.getNextItemData0.(I[BI)Z incomplete");
  data.set(PIM.curVcard);
  return 1;
};

Native["com/sun/j2me/pim/PIMProxy.getItemCategories0.(II)Ljava/lang/String;"] = function(addr, itemHandle, dataHandle) {
  console.warn("PIMProxy.getItemCategories0.(II)Ljava/lang/String; not implemented");
  return J2ME.Constants.NULL;
};

Native["com/sun/j2me/pim/PIMProxy.listClose0.(I)Z"] = function(addr, listHandle, description) {
  if (!(listHandle in PIM.openLists)) {
    return 0;
  }

  delete PIM.openLists[listHandle];
  return 1;
};

Native["com/sun/j2me/pim/PIMProxy.getDefaultListName.(I)Ljava/lang/String;"] = function(addr, listType) {
  if (listType === PIM.CONTACT_LIST) {
    return J2ME.newString("ContactList");
  }

  if (listType === PIM.EVENT_LIST) {
    return J2ME.newString("EventList");
  }

  if (listType === PIM.TODO_LIST) {
    return J2ME.newString("TodoList");
  }

  return J2ME.Constants.NULL;
};

Native["com/sun/j2me/pim/PIMProxy.getFieldsCount0.(I[I)I"] = function(addr, listHandle, dataHandleAddr) {
  return PIM.supportedFields.length;
};

Native["com/sun/j2me/pim/PIMProxy.getFieldLabelsCount0.(III)I"] = function(addr, listHandle, fieldIndex, dataHandle) {
  console.warn("PIMProxy.getFieldLabelsCount0.(III)I not implemented");
  return 1;
};

Native["com/sun/j2me/pim/PIMProxy.getFields0.(I[Lcom/sun/j2me/pim/PIMFieldDescriptor;I)V"] =
function(addr, listHandle, descAddr, dataHandle) {
  var desc = J2ME.getArrayFromAddr(descAddr);
  console.warn("PIMProxy.getFields0.(I[Lcom/sun/j2me/pim/PIMFieldDescriptor;I)V incomplete");

  PIM.supportedFields.forEach(function(field, i) {
    var descObj = J2ME.getHandle(desc[i]);
    descObj.field = field.field;
    descObj.dataType = field.dataType;
    descObj.maxValues = field.maxValues;
  });
};

Native["com/sun/j2me/pim/PIMProxy.getAttributesCount0.(I[I)I"] = function(addr, listHandle, dataHandleAddr) {
  console.warn("PIMProxy.getAttributesCount0.(I[I)I not implemented");
  return 0;
};

Native["com/sun/j2me/pim/PIMProxy.getAttributes0.(I[Lcom/sun/j2me/pim/PIMAttribute;I)V"] =
function(addr, listHandle, attrAddr, dataHandle) {
  console.warn("PIMProxy.getAttributes0.(I[Lcom/sun/j2me/pim/PIMAttribute;I)V not implemented");
};


/* SOURCE: midp/device_control.js */
/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */



Native["com/nokia/mid/ui/DeviceControl.startVibra.(IJ)V"] = function(addr, freq, longDurationLow, longDurationHigh) {
  // If method is called during a previously called vibration that has been
  // activated from this method, the previous vibration is stopped and the new
  // one is activated using the new set of parameters.
  navigator.vibrate(0);

  // Value 0 can be used for detecting whether or not there is a vibration device.
  if (freq === 0) {
    return;
  }

  var duration = J2ME.longToNumber(longDurationLow, longDurationHigh);

  if (freq < 0 || freq > 100 || duration < 0) {
    throw new $.newIllegalArgumentException();
  }

  navigator.vibrate(duration);
};

Native["com/nokia/mid/ui/DeviceControl.stopVibra.()V"] = function(addr) {
  navigator.vibrate(0);
};


/* SOURCE: midp/background.js */
/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */



var fgMidletNumber;
var fgMidletClass;

var display = document.getElementById("display");

// The splash and download screens generate many style recalculations while
// attached to the DOM, regardless of their display styles, because of their
// animations.  So instead of setting their display styles, we add/remove them
// to/from the DOM.

var splashScreen = document.getElementById('splash-screen');
display.removeChild(splashScreen);
splashScreen.style.display = 'block';
function showSplashScreen() {
  display.appendChild(splashScreen);
}
function hideSplashScreen() {
  if (splashScreen.parentNode) {
    splashScreen.parentNode.removeChild(splashScreen);
  }
}

var downloadDialog = document.getElementById('download-screen');
display.removeChild(downloadDialog);
downloadDialog.style.display = 'block';
function showDownloadScreen() {
  display.appendChild(downloadDialog);
}
function hideDownloadScreen() {
  if (downloadDialog.parentNode) {
    downloadDialog.parentNode.removeChild(downloadDialog);
  }
}

// The exit screen is hidden by default, and we only ever show it,
// so we don't need a hideExitScreen function.
function showExitScreen() {
  document.getElementById("exit-screen").style.display = "block";
}

function backgroundCheck() {
  var bgServer = MIDP.manifest["Nokia-MIDlet-bg-server"];
  if (!bgServer) {
    showSplashScreen();
    return;
  }

  // We're assuming there are only two midlets
  fgMidletNumber = (bgServer == 2) ? 1 : 2;
  fgMidletClass = MIDP.manifest["MIDlet-" + fgMidletNumber].split(",")[2];

  if (MIDlet.shouldStartBackgroundService()) {
    startBackgroundAlarm();
  }
}

var backgroundAlarmStarted = false;

function startBackgroundAlarm() {
  if (!backgroundAlarmStarted) {
    backgroundAlarmStarted = true;
    DumbPipe.close(DumbPipe.open("backgroundCheck", {}));
  }
}

Native["com/nokia/mid/s40/bg/BGUtils.getFGMIDletClass.()Ljava/lang/String;"] = function(addr) {
  return J2ME.newString(fgMidletClass);
};

Native["com/nokia/mid/s40/bg/BGUtils.getFGMIDletNumber.()I"] = function(addr) {
  return fgMidletNumber;
};

MIDP.additionalProperties = {};

Native["com/nokia/mid/s40/bg/BGUtils.launchIEMIDlet.(Ljava/lang/String;Ljava/lang/String;ILjava/lang/String;Ljava/lang/String;)Z"] =
function(addr, midletSuiteVendorAddr, midletNameAddr, midletNumber, startupNoteTextAddr, argsAddr) {
  J2ME.fromStringAddr(argsAddr).split(";").splice(1).forEach(function(arg) {
    var elems = arg.split("=");
    MIDP.additionalProperties[elems[0]] = elems[1];
  });

  return 1;
};


/* SOURCE: midp/media.js */
/* -*- Mode: Java; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4 -*- */
/* vim: set shiftwidth=4 tabstop=4 autoindent cindent expandtab: */



var Media = {};

Media.ContentTypes = {
    memory: [
    ],

    file: [
        "audio/ogg",
        "audio/x-wav",
        "audio/mpeg",
        "image/jpeg",
        "image/png",
        "audio/amr"
    ],

    http: [
        "audio/x-wav",
        "audio/mpeg",
        "image/jpeg",
        "image/png",
        "audio/amr"
    ],

    https: [
        "audio/x-wav",
        "audio/mpeg",
        "image/jpeg",
        "image/png",
        "audio/amr"
    ],

    rtp: [],

    rtsp: [],

    capture: []
};

Media.ListCache = {
    create: function(data) {
        var id = this._nextId;
        this._cached[id] = data;
        if (++this._nextId > 0xffff) {
            this._nextId = 0;
        }
        return id;
    },

    get: function(id) {
        return this._cached[id];
    },

    remove: function(id) {
        delete this._cached[id];
    },

    _cached: {},
    // A valid ID should be greater than 0.
    _nextId: 1
}

Media.extToFormat = new Map([
    ["mp3", "MPEG_layer_3"],
    ["jpg", "JPEG"],
    ["jpeg", "JPEG"],
    ["png", "PNG"],
    ["wav", "wav"],
    ["ogg", "ogg"],
    ["mp4", "MPEG4"],
    ["webm", "WebM"],
    ["amr", "amr"],
]);

Media.contentTypeToFormat = new Map([
    ["audio/ogg", "ogg"],
    ["audio/amr", "amr"],
    ["audio/x-wav", "wav"],
    ["audio/mpeg", "MPEG_layer_3"],
    ["image/jpeg", "JPEG"],
    ["image/png", "PNG"],
    ["video/mp4", "MPEG4"],
    ["video/webm", "WebM"],
]);

Media.formatToContentType = new Map();
for (var elem of Media.contentTypeToFormat) {
    Media.formatToContentType.set(elem[1], elem[0])
}

Media.supportedAudioFormats = ["MPEG_layer_3", "wav", "amr", "ogg"];
Media.supportedImageFormats = ["JPEG", "PNG"];
Media.supportedVideoFormats = ["MPEG4", "WebM"];

Media.EVENT_MEDIA_END_OF_MEDIA = 1;
Media.EVENT_MEDIA_SNAPSHOT_FINISHED = 11;

Media.convert3gpToAmr = function(inBuffer) {
    // The buffer to store the converted amr file.
    var outBuffer = new Uint8Array(inBuffer.length);

    // Add AMR header.
    var AMR_HEADER = "#!AMR\n";
    outBuffer.set(new TextEncoder("utf-8").encode(AMR_HEADER));
    var outOffset = AMR_HEADER.length;

    var textDecoder = new TextDecoder("utf-8");
    var inOffset = 0;
    while (inOffset + 8 < inBuffer.length) {
        // Get the box size
        var size = 0;
        for (var i = 0; i < 4; i++) {
            size = inBuffer[inOffset + i] + (size << 8);
        }
        // Search the box of type mdat.
        var type = textDecoder.decode(inBuffer.subarray(inOffset + 4, inOffset + 8));
        if (type === "mdat" && inOffset + size <= inBuffer.length) {
            // Extract raw AMR data from the box and append to the out buffer.
            var data = inBuffer.subarray(inOffset + 8, inOffset + size);
            outBuffer.set(data, outOffset);
            outOffset += data.length;
        }
        inOffset += size;
    }

    if (outOffset === AMR_HEADER.length) {
        console.warn("Failed to extract AMR from 3GP file.");
    }
    return outBuffer.subarray(0, outOffset);
};

Native["com/sun/mmedia/DefaultConfiguration.nListContentTypesOpen.(Ljava/lang/String;)I"] =
function(addr, protocolAddr) {
    var protocol = J2ME.fromStringAddr(protocolAddr);
    var types = [];
    if (protocol) {
        types = Media.ContentTypes[protocol].slice();
        if (!types) {
            console.warn("Unknown protocol type: " + protocol);
            return 0;
        }
    } else {
        for (var p in Media.ContentTypes) {
            Media.ContentTypes[p].forEach(function(type) {
                if (types.indexOf(type) === -1) {
                    types.push(type);
                }
            });
        }
    }
    if (types.length == 0) {
        return 0;
    }
    return Media.ListCache.create(types);
};

Native["com/sun/mmedia/DefaultConfiguration.nListContentTypesNext.(I)Ljava/lang/String;"] = function(addr, hdlr) {
    var cached = Media.ListCache.get(hdlr);
    if (!cached) {
        console.error("Invalid hdlr: " + hdlr);
        return J2ME.Constants.NULL;
    }
    var s = cached.shift();
    return s ? J2ME.newString(s) : J2ME.Constants.NULL;
};

Native["com/sun/mmedia/DefaultConfiguration.nListContentTypesClose.(I)V"] = function(addr, hdlr) {
    Media.ListCache.remove(hdlr);
};

Native["com/sun/mmedia/DefaultConfiguration.nListProtocolsOpen.(Ljava/lang/String;)I"] = function(addr, mimeAddr) {
    var mime = J2ME.fromStringAddr(mimeAddr);
    var protocols = [];
    for (var protocol in Media.ContentTypes) {
        if (!mime || Media.ContentTypes[protocol].indexOf(mime) >= 0) {
            protocols.push(protocol);
        }
    }
    if (!protocols.length) {
        return 0;
    }
    return Media.ListCache.create(protocols);
};

Native["com/sun/mmedia/DefaultConfiguration.nListProtocolsNext.(I)Ljava/lang/String;"] = function(addr, hdlr) {
    var cached = Media.ListCache.get(hdlr);
    if (!cached) {
        console.error("Invalid hdlr: " + hdlr);
        return J2ME.Constants.NULL;
    }
    var s = cached.shift();
    return s ? J2ME.newString(s) : J2ME.Constants.NULL;
};

Native["com/sun/mmedia/DefaultConfiguration.nListProtocolsClose.(I)V"] = function(addr, hdlr) {
    Media.ListCache.remove(hdlr);
};

Media.PlayerCache = {
};

function AudioPlayer(playerContainer) {
    this.playerContainer = playerContainer;

    this.messageHandlers = {
        mediaTime: [],
        duration: []
    };

    this.sender = DumbPipe.open("audioplayer", {}, function(message) {
        switch (message.type) {
            case "end":
                MIDP.sendEndOfMediaEvent(this.playerContainer.pId, message.duration);
                break;
            case "mediaTime": // fall through
            case "duration":
                var f = this.messageHandlers[message.type].shift();
                if (f) {
                    f(message.data);
                }
                break;
            default:
                console.error("Unknown audioplayer message type: " + message.type)
                break;
        }
    }.bind(this));

    this.paused = true;
    this.loaded = false;
    this.volume = 100;
    this.muted = false;

    this.isVideoControlSupported = false;
    this.isVolumeControlSupported = true;
}

AudioPlayer.prototype.realize = function() {
    return Promise.resolve(1);
};

AudioPlayer.prototype.start = function() {
    if (this.playerContainer.contentSize == 0) {
        console.warn("Cannot start playing.");
        return;
    }

    var array = null;
    if (!this.loaded) {
        var data = this.playerContainer.data.subarray(0, this.playerContainer.contentSize);
        // Convert the data to a regular Array to traverse the mozbrowser boundary.
        var array = Array.prototype.slice.call(data);
        array.constructor = Array;
        this.loaded = true;
    }
    this.sender({
        type: "start",
        contentType: this.playerContainer.contentType,
        data: array
    });
    this.paused = false;
};

AudioPlayer.prototype.pause = function() {
    if (this.paused) {
        return;
    }
    this.sender({ type: "pause" });
    this.paused = true;
};

AudioPlayer.prototype.resume = function() {
    if (!this.paused) {
        return;
    }
    this.sender({ type: "play" });
    this.paused = false;
};

AudioPlayer.prototype.close = function() {
    this.sender({ type: "close" });
    this.paused = true;
    this.loaded = false;
    DumbPipe.close(this.sender);
};

AudioPlayer.prototype.getMediaTime = function() {
    return new Promise(function(resolve, reject) {
        this.sender({ type: "getMediaTime" });
        this.messageHandlers.mediaTime.push(function(data) {
            resolve(data);
        });
    }.bind(this));
};

// The range of ms has already been checked, we don't need to check it again.
AudioPlayer.prototype.setMediaTime = function(ms) {
    this.sender({ type: "setMediaTime", data: ms });
    return ms;
};

AudioPlayer.prototype.getVolume = function() {
    return this.volume;
};

AudioPlayer.prototype.setVolume = function(level) {
    if (level < 0) {
        level = 0;
    } else if (level > 100) {
        level = 100;
    }
    this.sender({ type: "setVolume", data: level });
    this.volume = level;
    return level;
};

AudioPlayer.prototype.getMute = function() {
    return this.muted;
};

AudioPlayer.prototype.setMute = function(mute) {
    this.muted = mute;
    this.sender({ type: "setMute", data: mute });
};

AudioPlayer.prototype.getDuration = function() {
    return new Promise(function(resolve, reject) {
        this.sender({ type: "getDuration" });
        this.messageHandlers.duration.push(function(data) {
            resolve(data);
        });
    }.bind(this));
};

function ImagePlayer(playerContainer) {
    this.url = playerContainer.url;

    this.image = new Image();
    this.image.style.position = "absolute";
    this.image.style.visibility = "hidden";

    this.isVideoControlSupported = true;
    this.isVolumeControlSupported = false;
}

ImagePlayer.prototype.realize = function() {
    var ctx = $.ctx;

    var p = new Promise((function(resolve, reject) {
        this.image.onload = resolve.bind(null, 1);
        this.image.onerror = function() {
            ctx.setAsCurrentContext();
            reject($.newMediaException("Failed to load image"));
        };

        if (this.url.startsWith("file")) {
            this.image.src = URL.createObjectURL(fs.getBlob(this.url.substring(7)));
        } else {
            this.image.src = this.url;
        }
    }).bind(this));

    p.catch(function() {
      // Ignore promise rejection, we only need to revoke the object URL
    }).then((function() {
        if (!this.image.src) {
            return;
        }
        URL.revokeObjectURL(this.image.src);
    }).bind(this));

    return p;
}

ImagePlayer.prototype.start = function() {
}

ImagePlayer.prototype.pause = function() {
}

ImagePlayer.prototype.close = function() {
    if (this.image.parentNode) {
        this.image.parentNode.removeChild(this.image);
    }
}

ImagePlayer.prototype.getMediaTime = function() {
    return -1;
}

ImagePlayer.prototype.getWidth = function() {
    return this.image.naturalWidth;
}

ImagePlayer.prototype.getHeight = function() {
    return this.image.naturalHeight;
}

ImagePlayer.prototype.setLocation = function(x, y, w, h) {
    this.image.style.left = x + "px";
    this.image.style.top = y + "px";
    this.image.style.width = w + "px";
    this.image.style.height = h + "px";
    document.getElementById("main").appendChild(this.image);
}

ImagePlayer.prototype.setVisible = function(visible) {
    this.image.style.visibility = visible ? "visible" : "hidden";
}

function VideoPlayer(playerContainer) {
    this.playerContainer = playerContainer;

    this.video = document.createElement("video");
    this.video.style.position = "absolute";
    this.video.style.visibility = "hidden";

    this.isVideoControlSupported = true;
    this.isVolumeControlSupported = true;

    // VideoPlayer::start could be called while the video element
    // is hidden, causing the call to HTMLVideoElement::play to be
    // ignored.
    // Thus, we need to call HTMLVideoElement::play when the element
    // gets visible.
    this.isPlaying = false;
}

VideoPlayer.prototype.realize = function() {
    var ctx = $.ctx;

    var p = new Promise((function(resolve, reject) {
        this.video.addEventListener("canplay", (function onCanPlay() {
            this.video.removeEventListener("canplay", onCanPlay);
            resolve(1);
        }).bind(this));

        this.video.onerror = function() {
            ctx.setAsCurrentContext();
            reject($.newMediaException("Failed to load video"));
        };

        if (this.playerContainer.url.startsWith("file")) {
            this.video.src = URL.createObjectURL(fs.getBlob(this.playerContainer.url.substring(7)),
                                                 { type: this.playerContainer.contentType });
        } else {
            this.video.src = this.playerContainer.url;
        }
    }).bind(this));

    p.catch(function() {
      // Ignore promise rejection, we only need to revoke the object URL
    }).then((function() {
        if (!this.video.src) {
            return;
        }
        URL.revokeObjectURL(this.video.src);
    }).bind(this));

    return p;
}

VideoPlayer.prototype.start = function() {
    if (this.video.style.visibility === "hidden") {
        this.isPlaying = true;
    } else {
        this.video.play();
    }
}

VideoPlayer.prototype.pause = function() {
    this.video.pause();
    this.isPlaying = false;
}

VideoPlayer.prototype.close = function() {
    if (this.video.parentNode) {
        this.video.parentNode.removeChild(this.video);
    }
    this.pause();
}

VideoPlayer.prototype.getMediaTime = function() {
    return Math.round(this.video.currentTime * 1000);
}

VideoPlayer.prototype.getWidth = function() {
    return this.video.videoWidth;
}

VideoPlayer.prototype.getHeight = function() {
    return this.video.videoHeight;
}

VideoPlayer.prototype.setLocation = function(x, y, w, h) {
    this.video.style.left = x + "px";
    this.video.style.top = y + "px";
    this.video.style.width = w + "px";
    this.video.style.height = h + "px";
    document.getElementById("main").appendChild(this.video);
}

VideoPlayer.prototype.setVisible = function(visible) {
    this.video.style.visibility = visible ? "visible" : "hidden";
    if (visible && this.isPlaying) {
        this.video.play();
    }
}

VideoPlayer.prototype.getVolume = function() {
    return Math.floor(this.video.volume * 100);
};

VideoPlayer.prototype.setVolume = function(level) {
    if (level < 0) {
        level = 0;
    } else if (level > 100) {
        level = 100;
    }
    this.video.volume = level / 100;
    return level;
};

function ImageRecorder(playerContainer) {
    this.playerContainer = playerContainer;

    this.sender = null;

    this.width = -1;
    this.height = -1;

    this.isVideoControlSupported = true;
    this.isVolumeControlSupported = false;

    this.realizeResolver = null;

    this.snapshotData = null;
    this.ctx = $.ctx;
}

ImageRecorder.prototype.realize = function() {
    return new Promise((function(resolve, reject) {
        this.realizeResolver = resolve;
        this.realizeRejector = reject;
        this.sender = DumbPipe.open("camera", {}, this.recipient.bind(this));
    }).bind(this));
}

ImageRecorder.prototype.recipient = function(message) {
    switch (message.type) {
        case "initerror":
            this.ctx.setAsCurrentContext();
            if (message.name == "PermissionDeniedError") {
                this.realizeRejector($.newSecurityException("Not permitted to init camera"));
            } else {
                this.realizeRejector($.newMediaException("Failed to init camera, no camera?"));
            }
            this.realizeResolver = null;
            this.realizeRejector = null;
            this.sender({ type: "close" });
            break;

        case "gotstream":
            this.width = message.width;
            this.height = message.height;
            this.realizeResolver(1);
            this.realizeResolver = null;
            this.realizeRejector = null;
            break;

        case "snapshot":
            this.snapshotData = new Int8Array(message.data.byteLength);
            this.snapshotData.set(new Int8Array(message.data));
            MIDP.sendMediaSnapshotFinishedEvent(this.playerContainer.pId);
            break;
    }
}

ImageRecorder.prototype.start = function() {
}

ImageRecorder.prototype.pause = function() {
}

ImageRecorder.prototype.close = function() {
    this.sender({ type: "close" });
}

ImageRecorder.prototype.getMediaTime = function() {
    return -1;
}

ImageRecorder.prototype.getWidth = function() {
    return this.width;
}

ImageRecorder.prototype.getHeight = function() {
    return this.height;
}

ImageRecorder.prototype.setLocation = function(x, y, w, h) {
    var displayContainer = document.getElementById("display-container");
    this.sender({
        type: "setPosition",
        x: x + displayContainer.offsetLeft,
        y: y + displayContainer.offsetTop,
        w: w,
        h: h,
    });
}

ImageRecorder.prototype.setVisible = function(visible) {
    this.sender({ type: "setVisible", visible: visible });
}

ImageRecorder.prototype.startSnapshot = function(imageType) {
    var type = imageType ? this.playerContainer.getEncodingParam(imageType) : "image/jpeg";
    if (type === "jpeg") {
        type = "image/jpeg";
    }

    this.sender({ type: "snapshot", imageType: type });
}

ImageRecorder.prototype.getSnapshotData = function(imageType) {
    return this.snapshotData;
}

function PlayerContainer(url, pId) {
    this.url = url;
    // `pId` is the player id used in PlayerImpl.java, don't confuse with the id we used
    // here in Javascript. The reason we need to hold this `pId` is we need to send it
    // back when dispatch events, such as Media.EVENT_MEDIA_SNAPSHOT_FINISHED and
    // Media.EVENT_MEDIA_END_OF_MEDIA.
    this.pId = pId;

    this.mediaFormat = url ? this.guessFormatFromURL(url) : "UNKNOWN";
    this.contentType = "";

    this.wholeContentSize = -1;
    this.contentSize = 0;
    this.data = null;

    this.player = null;
}

// default buffer size 1 MB
PlayerContainer.DEFAULT_BUFFER_SIZE  = 1024 * 1024;

PlayerContainer.prototype.isImageCapture = function() {
    return !!(this.url && this.url.startsWith("capture://image"));
};

PlayerContainer.prototype.isAudioCapture = function() {
    return !!(this.url && this.url.startsWith("capture://audio"));
};

PlayerContainer.prototype.getEncodingParam = function(url) {
    var encoding = null;

    var idx = url.indexOf("encoding=");
    if (idx > -1) {
        var encodingKeyPair = url.substring(idx).split("&")[0].split("=");
        encoding = encodingKeyPair.length == 2 ? encodingKeyPair[1] : encoding;
    }

    return encoding;
};

PlayerContainer.prototype.guessFormatFromURL = function() {
    if (this.isAudioCapture()) {
        var encoding = "audio/ogg" || this.getEncodingParam(this.url); // Same as system property |audio.encodings|

        var format = Media.contentTypeToFormat.get(encoding);

        return format || "UNKNOWN";
    }

    if (this.isImageCapture()) {
        return "JPEG";
    }

    return Media.extToFormat.get(this.url.substr(this.url.lastIndexOf(".") + 1)) || "UNKNOWN";
}

PlayerContainer.prototype.realize = function(contentType) {
    return new Promise((function(resolve, reject) {
        if (contentType) {
            this.contentType = contentType;
            this.mediaFormat = Media.contentTypeToFormat.get(contentType) || this.mediaFormat;
            if (this.mediaFormat === "UNKNOWN") {
                console.warn("Unsupported content type: " + contentType);
                resolve(0);
                return;
            }
        } else {
            this.contentType = Media.formatToContentType.get(this.mediaFormat);
        }

        if (Media.supportedAudioFormats.indexOf(this.mediaFormat) !== -1) {
            this.player = new AudioPlayer(this);
            if (this.isAudioCapture()) {
                this.audioRecorder = new AudioRecorder(contentType);
            }
            this.player.realize().then(resolve);
        } else if (Media.supportedImageFormats.indexOf(this.mediaFormat) !== -1) {
            if (this.isImageCapture()) {
                this.player = new ImageRecorder(this);
            } else {
                this.player = new ImagePlayer(this);
            }
            this.player.realize().then(resolve, reject);
        } else if (Media.supportedVideoFormats.indexOf(this.mediaFormat) !== -1) {
            this.player = new VideoPlayer(this);
            this.player.realize().then(resolve, reject);
        } else {
            console.warn("Unsupported media format (" + this.mediaFormat + ") for " + this.url);
            resolve(0);
        }
    }).bind(this));
};

PlayerContainer.prototype.close = function() {
    this.data = null;
    if (this.player) {
        this.player.close();
    }
};

/**
 * @return current time in ms.
 */
PlayerContainer.prototype.getMediaTime = function() {
    return this.player.getMediaTime();
};

PlayerContainer.prototype.getBufferSize = function() {
    return this.wholeContentSize === -1 ? PlayerContainer.DEFAULT_BUFFER_SIZE :
                                          this.wholeContentSize;
};

PlayerContainer.prototype.getMediaFormat = function() {
    if (this.contentSize === 0) {
        return this.mediaFormat;
    }

    var headerString = util.decodeUtf8(this.data.subarray(0, 50));

    // Refer to https://www.ffmpeg.org/doxygen/0.6/amr_8c-source.html.
    if (headerString.indexOf("#!AMR\n") === 0){
        return "amr";
    }

    // Refer to https://www.ffmpeg.org/doxygen/0.6/wav_8c-source.html
    if (headerString.indexOf("RIFF") === 0 && headerString.indexOf("WAVE") === 8) {
        return "wav";
    }

    // Refer to http://www.sonicspot.com/guide/midifiles.html
    if (headerString.indexOf("MThd") === 0) {
        return "mid";
    }

    // https://wiki.xiph.org/Ogg#Detecting_Ogg_files_and_extracting_information
    if (headerString.indexOf("OggS") === 0) {
        return "ogg";
    }

    return this.mediaFormat;
};

PlayerContainer.prototype.getContentType = function() {
    return this.contentType;
};

PlayerContainer.prototype.isHandledByDevice = function() {
    // TODO: Handle download in JS also for audio formats
    return this.url !== null && Media.supportedAudioFormats.indexOf(this.mediaFormat) === -1;
};

PlayerContainer.prototype.isVideoControlSupported = function() {
    return this.player.isVideoControlSupported;
};

PlayerContainer.prototype.isVolumeControlSupported = function() {
    return this.player.isVolumeControlSupported;
};

PlayerContainer.prototype.writeBuffer = function(buffer) {
    if (this.contentSize === 0) {
        this.data = new Int8Array(this.getBufferSize());
    }

    this.data.set(buffer, this.contentSize);
    this.contentSize += buffer.length;
};

PlayerContainer.prototype.start = function() {
    this.player.start();
};

PlayerContainer.prototype.pause = function() {
    this.player.pause();
};

PlayerContainer.prototype.resume = function() {
    this.player.resume();
};

PlayerContainer.prototype.getVolume = function() {
    return this.player.getVolume();
};

PlayerContainer.prototype.setVolume = function(level) {
    this.player.setVolume(level);
};

PlayerContainer.prototype.getMute = function() {
    return this.player.getMute();
};

PlayerContainer.prototype.setMute = function(mute) {
    return this.player.setMute(mute);
};

PlayerContainer.prototype.getWidth = function() {
    return this.player.getWidth();
}

PlayerContainer.prototype.getHeight = function() {
    return this.player.getHeight();
}

PlayerContainer.prototype.setLocation = function(x, y, w, h) {
    this.player.setLocation(x, y, w, h);
}

PlayerContainer.prototype.setVisible = function(visible) {
    this.player.setVisible(visible);
}

PlayerContainer.prototype.getRecordedSize = function() {
    return this.audioRecorder.data.byteLength;
};

PlayerContainer.prototype.getRecordedData = function(offset, size, buffer) {
    var toRead = (size < this.audioRecorder.data.length) ? size : this.audioRecorder.data.byteLength;
    buffer.set(this.audioRecorder.data.subarray(0, toRead), offset);
    this.audioRecorder.data = new Int8Array(this.audioRecorder.data.buffer.slice(toRead));
};

PlayerContainer.prototype.startSnapshot = function(imageType) {
    this.player.startSnapshot(imageType);
}

PlayerContainer.prototype.getSnapshotData = function() {
    var arr = this.player.getSnapshotData();
    if (!arr) {
        return Constants.NULL;
    }

    var retArr = J2ME.newByteArray(arr.length);
    J2ME.getArrayFromAddr(retArr).set(arr);
    return retArr;
}

PlayerContainer.prototype.getDuration = function() {
    return this.player.getDuration();
}

var AudioRecorder = function(aMimeType) {
    this.mimeType = aMimeType || "audio/3gpp";
    this.eventListeners = {};
    this.data = new Int8Array();
    this.sender = DumbPipe.open("audiorecorder", {
        mimeType: this.mimeType
    }, this.recipient.bind(this));
};

AudioRecorder.prototype.getContentType = function() {
    if (this.mimeType == "audio/3gpp") {
        return "audio/amr";
    }

    return this.mimeType;
};

AudioRecorder.prototype.recipient = function(message) {
    var callback = this["on" + message.type];
    if (typeof callback === "function") {
        callback(message);
    }

    if (this.eventListeners[message.type]) {
        this.eventListeners[message.type].forEach(function(listener) {
            if (typeof listener === "function") {
                listener(message);
            }
        });
    }
};

AudioRecorder.prototype.addEventListener = function(name, callback) {
    if (!callback || !name) {
        return;
    }

    if (!this.eventListeners[name]) {
        this.eventListeners[name] = [];
    }

    this.eventListeners[name].push(callback);
};

AudioRecorder.prototype.removeEventListener = function(name, callback) {
    if (!name || !callback || !this.eventListeners[name]) {
        return;
    }

    var newArray = [];
    this.eventListeners[name].forEach(function(listener) {
        if (callback != listener) {
            newArray.push(listener);
        }
    });

    this.eventListeners[name] = newArray;
};

AudioRecorder.prototype.start = function() {
    return new Promise(function(resolve, reject) {
        this.onstart = function() {
            this.onstart = null;
            this.onerror = null;
            resolve(1);
        }.bind(this);

        this.onerror = function() {
            this.onstart = null;
            this.onerror = null;
            resolve(0);
        }.bind(this);

        this.sender({ type: "start" });
    }.bind(this));
};

AudioRecorder.prototype.stop = function() {
    return new Promise(function(resolve, reject) {
        // To make sure the Player in Java can fetch data immediately, we
        // need to return after data is back.
        this.ondata = function ondata(message) {
            _cleanEventListeners();

            // The audio data we received are encoded with a proper format, it doesn't
            // make sense to concatenate them like the socket, so let just override
            // the buffered data here.
            var data = new Int8Array(message.data);
            if (this.getContentType() === "audio/amr") {
                data = Media.convert3gpToAmr(data);
            }
            this.data = data;
            resolve(1);
        }.bind(this);

        var _onerror = function() {
            _cleanEventListeners();
            resolve(0);
        }.bind(this);

        var _cleanEventListeners = function() {
            this.ondata = null;
            this.removeEventListener("error", _onerror);
        }.bind(this);

        this.addEventListener("error", _onerror);
        this.sender({ type: "stop" });
    }.bind(this));
};

AudioRecorder.prototype.pause = function() {
    return new Promise(function(resolve, reject) {
        // In Java, |stopRecord| might be called before |commit|, which triggers
        // the calling sequence:
        //    nPause -> nGetRecordedSize -> nGetRecordedData -> nClose
        //
        // to make sure the Player in Java can fetch data in such a case, we
        // need to request data immediately.
        //
        this.ondata = function ondata(message) {
            this.ondata = null;

            // The audio data we received are encoded with a proper format, it doesn't
            // make sense to concatenate them like the socket, so let just override
            // the buffered data here.
            this.data = new Int8Array(message.data);
            resolve(1);
        }.bind(this);

        // Have to request data first before pausing.
        this.requestData();
        this.sender({ type: "pause" });
    }.bind(this));
};

AudioRecorder.prototype.requestData = function() {
    this.sender({ type: "requestData" });
};

AudioRecorder.prototype.close = function() {
    if (this._closed) {
        return Promise.resolve(1);
    }

    // Make sure recording is stopped on the other side.
    return this.stop().then(function(result) {
        DumbPipe.close(this.sender);
        this._closed = true;
        return result;
    }.bind(this));
};

Native["com/sun/mmedia/PlayerImpl.nInit.(IILjava/lang/String;)I"] = function(addr, appId, pId, URIAddr) {
    var url = J2ME.fromStringAddr(URIAddr);
    var id = pId + (appId << 15);
    Media.PlayerCache[id] = new PlayerContainer(url, pId);
    return id;
};

/**
 * @return 0 - failed; 1 - succeeded.
 */
Native["com/sun/mmedia/PlayerImpl.nTerm.(I)I"] = function(addr, handle) {
    var player = Media.PlayerCache[handle];
    if (!player) {
        return 1;
    }
    player.close();
    delete Media.PlayerCache[handle];
    return 1;
};

Native["com/sun/mmedia/PlayerImpl.nGetMediaFormat.(I)Ljava/lang/String;"] = function(addr, handle) {
    var player = Media.PlayerCache[handle];
    player.mediaFormat = player.getMediaFormat();
    return J2ME.newString(player.mediaFormat);
};

Native["com/sun/mmedia/DirectPlayer.nGetContentType.(I)Ljava/lang/String;"] = function(addr, handle) {
    return J2ME.newString(Media.PlayerCache[handle].getContentType());
};

Native["com/sun/mmedia/PlayerImpl.nIsHandledByDevice.(I)Z"] = function(addr, handle) {
    return Media.PlayerCache[handle].isHandledByDevice() ? 1 : 0;
};

Native["com/sun/mmedia/PlayerImpl.nRealize.(ILjava/lang/String;)Z"] = function(addr, handle, mimeAddr) {
    var mime = J2ME.fromStringAddr(mimeAddr);
    var player = Media.PlayerCache[handle];
    asyncImpl("Z", player.realize(mime));
};

Native["com/sun/mmedia/MediaDownload.nGetJavaBufferSize.(I)I"] = function(addr, handle) {
    var player = Media.PlayerCache[handle];
    return player.getBufferSize();
};

Native["com/sun/mmedia/MediaDownload.nGetFirstPacketSize.(I)I"] = function(addr, handle) {
    var player = Media.PlayerCache[handle];
    return player.getBufferSize() >>> 1;
};

Native["com/sun/mmedia/MediaDownload.nBuffering.(I[BII)I"] = function(addr, handle, bufferAddr, offset, size) {
    var player = Media.PlayerCache[handle];
    var bufferSize = player.getBufferSize();

    // Check the parameters.
    if (bufferAddr === J2ME.Constants.NULL || size === 0) {
        return bufferSize >>> 1;
    }

    var buffer = J2ME.getArrayFromAddr(bufferAddr);
    player.writeBuffer(buffer.subarray(offset, offset + size));

    // Returns the package size and set it to the half of the java buffer size.
    return bufferSize >>> 1;
};

Native["com/sun/mmedia/MediaDownload.nNeedMoreDataImmediatelly.(I)Z"] = function(addr, handle) {
    console.warn("com/sun/mmedia/MediaDownload.nNeedMoreDataImmediatelly.(I)Z not implemented");
    return 1;
};

Native["com/sun/mmedia/MediaDownload.nSetWholeContentSize.(IJ)V"] = function(addr, handle, contentSizeLow, contentSizeHigh) {
    var player = Media.PlayerCache[handle];
    player.wholeContentSize = J2ME.longToNumber(contentSizeLow, contentSizeHigh);
};

Native["com/sun/mmedia/DirectPlayer.nIsToneControlSupported.(I)Z"] = function(addr, handle) {
    console.info("To support ToneControl, implement com.sun.mmedia.DirectTone.");
    return 0;
};

Native["com/sun/mmedia/DirectPlayer.nIsMIDIControlSupported.(I)Z"] = function(addr, handle) {
    console.info("To support MIDIControl, implement com.sun.mmedia.DirectMIDI.");
    return 0;
};

Native["com/sun/mmedia/DirectPlayer.nIsVideoControlSupported.(I)Z"] = function(addr, handle) {
    return Media.PlayerCache[handle].isVideoControlSupported() ? 1 : 0;
};

Native["com/sun/mmedia/DirectPlayer.nIsVolumeControlSupported.(I)Z"] = function(addr, handle) {
    var player = Media.PlayerCache[handle];
    return player.isVolumeControlSupported() ? 1 : 0;
};

Native["com/sun/mmedia/DirectPlayer.nIsNeedBuffering.(I)Z"] = function(addr, handle) {
    var player = Media.PlayerCache[handle];
    console.warn("com/sun/mmedia/DirectPlayer.nIsNeedBuffering.(I)Z not implemented.");
    return 0;
};

Native["com/sun/mmedia/DirectPlayer.nPcmAudioPlayback.(I)Z"] = function(addr, handle) {
    var player = Media.PlayerCache[handle];
    console.warn("com/sun/mmedia/DirectPlayer.nPcmAudioPlayback.(I)Z not implemented.");
    return 0;
};

// Device is available?
Native["com/sun/mmedia/DirectPlayer.nAcquireDevice.(I)Z"] = function(addr, handle) {
    var player = Media.PlayerCache[handle];
    console.warn("com/sun/mmedia/DirectPlayer.nAcquireDevice.(I)Z not implemented.");
    return 1;
};

// Relase device reference
Native["com/sun/mmedia/DirectPlayer.nReleaseDevice.(I)V"] = function(addr, handle) {
    var player = Media.PlayerCache[handle];
    console.warn("com/sun/mmedia/DirectPlayer.nReleaseDevice.(I)V not implemented.");
};

Native["com/sun/mmedia/DirectPlayer.nSwitchToForeground.(II)Z"] = function(addr, handle, options) {
    var player = Media.PlayerCache[handle];
    console.warn("com/sun/mmedia/DirectPlayer.nSwitchToForeground.(II)Z not implemented. ");
    return 1;
};

Native["com/sun/mmedia/DirectPlayer.nSwitchToBackground.(II)Z"] = function(addr, handle, options) {
    var player = Media.PlayerCache[handle];
    console.warn("com/sun/mmedia/DirectPlayer.nSwitchToBackground.(II)Z not implemented. ");
    return 1;
};

// Start Prefetch of Native Player
Native["com/sun/mmedia/DirectPlayer.nPrefetch.(I)Z"] = function(addr, handle) {
    var player = Media.PlayerCache[handle];
    console.warn("com/sun/mmedia/DirectPlayer.nPrefetch.(I)Z not implemented.");
    return 1;
};

Native["com/sun/mmedia/DirectPlayer.nGetMediaTime.(I)I"] = function(addr, handle) {
    var player = Media.PlayerCache[handle];
    var mediaTime = player.getMediaTime();
    if (mediaTime instanceof Promise) {
        asyncImpl("I", mediaTime);
    } else {
        return mediaTime;
    }
};

Native["com/sun/mmedia/DirectPlayer.nSetMediaTime.(IJ)I"] = function(addr, handle, msLow, msHigh) {
    var container = Media.PlayerCache[handle];
    return container.player.setMediaTime(J2ME.longToNumber(msLow, msHigh));
};

Native["com/sun/mmedia/DirectPlayer.nStart.(I)Z"] = function(addr, handle) {
    var player = Media.PlayerCache[handle];
    player.start();
    return 1;
};

Native["com/sun/mmedia/DirectPlayer.nStop.(I)Z"] = function(addr, handle) {
    var player = Media.PlayerCache[handle];
    player.close();
    return 1;
};

Native["com/sun/mmedia/DirectPlayer.nTerm.(I)I"] = function(addr, handle) {
    var player = Media.PlayerCache[handle];
    player.close();
    delete Media.PlayerCache[handle];
    return 1;
};

Native["com/sun/mmedia/DirectPlayer.nPause.(I)Z"] = function(addr, handle) {
    var player = Media.PlayerCache[handle];
    player.pause();
    return 1;
};

Native["com/sun/mmedia/DirectPlayer.nResume.(I)Z"] = function(addr, handle) {
    var player = Media.PlayerCache[handle];
    player.resume();
    return 1;
};

Native["com/sun/mmedia/DirectPlayer.nGetWidth.(I)I"] = function(addr, handle) {
    return Media.PlayerCache[handle].getWidth();
};

Native["com/sun/mmedia/DirectPlayer.nGetHeight.(I)I"] = function(addr, handle) {
    return Media.PlayerCache[handle].getHeight();
};

Native["com/sun/mmedia/DirectPlayer.nSetLocation.(IIIII)Z"] = function(addr, handle, x, y, w, h) {
    Media.PlayerCache[handle].setLocation(x, y, w, h);
    return 1;
};

Native["com/sun/mmedia/DirectPlayer.nSetVisible.(IZ)Z"] = function(addr, handle, visible) {
    Media.PlayerCache[handle].setVisible(visible);
    return 1;
};

Native["com/sun/mmedia/DirectPlayer.nIsRecordControlSupported.(I)Z"] = function(addr, handle) {
    return !!(Media.PlayerCache[handle] && Media.PlayerCache[handle].audioRecorder) ? 1 : 0;
};

Native["com/sun/mmedia/DirectPlayer.nGetDuration.(I)I"] = function(addr, handle) {
    var duration = Media.PlayerCache[handle].getDuration();
    if (duration instanceof Promise) {
        asyncImpl("I", duration);
    } else {
        return duration;
    }
};

Native["com/sun/mmedia/DirectRecord.nSetLocator.(ILjava/lang/String;)I"] = function(addr, handle, locatorAddr) {
    // Let the DirectRecord class handle writing to files / uploading via HTTP
    return 0;
};

Native["com/sun/mmedia/DirectRecord.nGetRecordedSize.(I)I"] = function(addr, handle) {
    return Media.PlayerCache[handle].getRecordedSize();
};

Native["com/sun/mmedia/DirectRecord.nGetRecordedData.(III[B)I"] = function(addr, handle, offset, size, bufferAddr) {
    var buffer = J2ME.getArrayFromAddr(bufferAddr);
    Media.PlayerCache[handle].getRecordedData(offset, size, buffer);
    return 1;
};

Native["com/sun/mmedia/DirectRecord.nCommit.(I)I"] = function(addr, handle) {
    // In DirectRecord.java, before nCommit, nPause or nStop is called,
    // which means all the recorded data has been fetched, so do nothing here.
    return 1;
};

Native["com/sun/mmedia/DirectRecord.nPause.(I)I"] = function(addr, handle) {
    asyncImpl("I", Media.PlayerCache[handle].audioRecorder.pause());
};

Native["com/sun/mmedia/DirectRecord.nStop.(I)I"] = function(addr, handle) {
    asyncImpl("I", Media.PlayerCache[handle].audioRecorder.stop());
};

Native["com/sun/mmedia/DirectRecord.nClose.(I)I"] = function(addr, handle) {
    var player = Media.PlayerCache[handle];

    if (!player || !player.audioRecorder) {
        // We need to check if |audioRecorder| is still available, because |nClose|
        // might be called twice in DirectRecord.java, and only IOException is
        // handled in DirectRecord.java, let use IOException instead of IllegalStateException.
        throw $.newIOException();
    }

    asyncImpl("I", player.audioRecorder.close().then(function(result) {
       delete player.audioRecorder;
       return result;
    }));
};

Native["com/sun/mmedia/DirectRecord.nStart.(I)I"] = function(addr, handle) {
    // In DirectRecord.java, nStart plays two roles: real start and resume.
    // Let's handle this on the other side of the DumbPipe.
    asyncImpl("I", Media.PlayerCache[handle].audioRecorder.start());
};

Native["com/sun/mmedia/DirectRecord.nGetRecordedType.(I)Ljava/lang/String;"] = function(addr, handle) {
    return J2ME.newString(Media.PlayerCache[handle].audioRecorder.getContentType());
};

/**
 * @return the volume level between 0 and 100 if succeeded. Otherwise -1.
 */
Native["com/sun/mmedia/DirectVolume.nGetVolume.(I)I"] = function(addr, handle) {
    var player = Media.PlayerCache[handle];
    return player.getVolume();
};

/**
 * @param level The volume level between 0 and 100.
 * @return the volume level set between 0 and 100 if succeeded. Otherwise -1.
 */
Native["com/sun/mmedia/DirectVolume.nSetVolume.(II)I"] = function(addr, handle, level) {
    var player = Media.PlayerCache[handle];
    player.setVolume(level);
    return level;
};

Native["com/sun/mmedia/DirectVolume.nIsMuted.(I)Z"] = function(addr, handle) {
    var player = Media.PlayerCache[handle];
    return player.getMute() ? 1 : 0;
};

Native["com/sun/mmedia/DirectVolume.nSetMute.(IZ)Z"] = function(addr, handle, mute) {
    var player = Media.PlayerCache[handle];
    player.setMute(mute);
    return 1;
};

Media.TonePlayerCache = {
};

function TonePlayer() {
    this.audioContext = new AudioContext();

    // Use oscillator to generate tone.
    // @type {OscillatorNode}
    this.oscillator = null;

    // The gain node to control volume.
    this.gainNode = this.audioContext.createGain();
    this.gainNode.connect(this.audioContext.destination);
}

// Volume fade time in seconds.
TonePlayer.FADE_TIME = 0.1;

/*
 * Play back a tone as specified by a note and its duration.
 * A note is given in the range of 0 to 127 inclusive.  The frequency
 * of the note can be calculated from the following formula:
 *     SEMITONE_CONST = 17.31234049066755 = 1/(ln(2^(1/12)))
 *     note = ln(freq/8.176)*SEMITONE_CONST
 *     The musical note A = MIDI note 69 (0x45) = 440 Hz.
 * For the Asha implementaion, the note is shift by adding 21.
 * @param  note  Defines the tone of the note as specified by the above formula.
 * @param  duration  The duration of the tone in milli-seconds. Duration must be
 * positive.
 * @param  volume Audio volume range from 0 to 100.
 */
TonePlayer.prototype.playTone = function(note, duration, volume) {
    if (duration <= 0) {
        return;
    }
    duration /= 1000;

    if (note < 0) {
        note = 0;
    } else if (note > 127) {
        note = 127;
    }
    if (volume < 0) {
        volume = 0;
    } else if (volume > 100) {
        volume = 100;
    }
    volume /= 100;

    // Abort the previous tone.
    if (this.oscillator) {
        this.oscillator.onended = null;
        this.oscillator.disconnect();
    }

    var current = this.audioContext.currentTime;

    this.oscillator = this.audioContext.createOscillator();
    this.oscillator.connect(this.gainNode);

    // The default fequency is equivalent to 69 - 21 note and while 1 note = 100
    // cents.
    // Detune the frequency to the target note.
    this.oscillator.detune.value = (note - 69 + 21) * 100;

    // Fade in.
    this.oscillator.start(current);
    this.gainNode.gain.linearRampToValueAtTime(0, current);
    this.gainNode.gain.linearRampToValueAtTime(volume, current + TonePlayer.FADE_TIME);

    // Fade out.
    this.oscillator.stop(current + duration);
    this.gainNode.gain.linearRampToValueAtTime(volume, current + duration - TonePlayer.FADE_TIME);
    this.gainNode.gain.linearRampToValueAtTime(0, current + duration);
    this.oscillator.onended = function() {
        this.oscillator.disconnect();
        this.oscillator = null;
    }.bind(this);
};

TonePlayer.prototype.stopTone = function() {
    if (!this.oscillator) {
        return;
    }
    var current = this.audioContext.currentTime;
    this.gainNode.gain.linearRampToValueAtTime(0, current + TonePlayer.FADE_TIME);
};

Native["com/sun/mmedia/NativeTonePlayer.nPlayTone.(IIII)Z"] = function(addr, appId, note, duration, volume) {
    if (!Media.TonePlayerCache[appId]) {
        Media.TonePlayerCache[appId] = new TonePlayer();
    }
    Media.TonePlayerCache[appId].playTone(note, duration, volume);
    return 1;
};

Native["com/sun/mmedia/NativeTonePlayer.nStopTone.(I)Z"] = function(addr, appId) {
    Media.TonePlayerCache[appId].stopTone();
    return 1;
};

Native["com/sun/mmedia/DirectPlayer.nStartSnapshot.(ILjava/lang/String;)V"] = function(addr, handle, imageTypeAddr) {
    Media.PlayerCache[handle].startSnapshot(J2ME.fromStringAddr(imageTypeAddr));
};

Native["com/sun/mmedia/DirectPlayer.nGetSnapshotData.(I)[B"] = function(addr, handle) {
    return Media.PlayerCache[handle].getSnapshotData();
};

Native["com/sun/amms/GlobalMgrImpl.nCreatePeer.()I"] = function(addr) {
    console.warn("com/sun/amms/GlobalMgrImpl.nCreatePeer.()I not implemented.");
    return 1;
};

Native["com/sun/amms/GlobalMgrImpl.nGetControlPeer.([B)I"] = function(addr, typeNameAddr) {
    console.warn("com/sun/amms/GlobalMgrImpl.nGetControlPeer.([B)I not implemented.");
    return 2;
};

Native["com/sun/amms/directcontrol/DirectVolumeControl.nSetMute.(Z)V"] = function(addr, mute) {
    console.warn("com/sun/amms/directcontrol/DirectVolumeControl.nSetMute.(Z)V not implemented.");
};

Native["com/sun/amms/directcontrol/DirectVolumeControl.nGetLevel.()I"] = function(addr) {
    console.warn("com/sun/amms/directcontrol/DirectVolumeControl.nGetLevel.()I not implemented.");
    return 100;
};

addUnimplementedNative("com/sun/amms/directcontrol/DirectVolumeControl.nIsMuted.()Z", 0);


/* SOURCE: midp/content.js */
/* -*- Mode: JavaScript; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */



var Content = (function() {
  // Allow configuring these values for MIDlets that don't register
  // the content handler in time.
  var chRegisteredID = config.chRegisteredID || null;
  var chRegisteredClassName = config.chRegisteredClassName || null;
  var chRegisteredStorageID = config.chRegisteredStorageID || -1;
  var chRegisteredRegistrationMethod = config.chRegisteredRegistrationMethod || -1;

  function serializeString(parts) {
    return parts.reduce(function(prev, current) {
      return prev + String.fromCharCode(current.length * 2) + current;
    }, "");
  }

  addUnimplementedNative("com/sun/j2me/content/RegistryStore.init.()Z", 1);

  Native["com/sun/j2me/content/RegistryStore.forSuite0.(I)Ljava/lang/String;"] = function(addr, suiteID) {
    if (!chRegisteredClassName) {
      return J2ME.Constants.NULL;
    }

    var serializedString = serializeString([
                                              chRegisteredID,
                                              chRegisteredStorageID.toString(16),
                                              chRegisteredClassName,
                                              chRegisteredRegistrationMethod.toString(16)
                                           ]);

    return J2ME.newString(String.fromCharCode(serializedString.length * 2) + serializedString);
  };

  addUnimplementedNative("com/sun/j2me/content/RegistryStore.findHandler0.(Ljava/lang/String;ILjava/lang/String;)Ljava/lang/String;", J2ME.Constants.NULL);

  Native["com/sun/j2me/content/RegistryStore.register0.(ILjava/lang/String;Lcom/sun/j2me/content/ContentHandlerRegData;)Z"] =
  function(addr, storageId, classNameAddr, handlerDataAddr) {
    var handlerData = getHandle(handlerDataAddr);
    var registerID = J2ME.fromStringAddr(handlerData.ID);
    if (chRegisteredID && chRegisteredID != registerID) {
      console.warn("Dynamic registration ID doesn't match the configuration");
    }

    var registerClassName = J2ME.fromStringAddr(classNameAddr);
    if (chRegisteredClassName && chRegisteredClassName != registerClassName) {
      console.warn("Dynamic registration class name doesn't match the configuration");
    }

    if (chRegisteredStorageID != -1 && chRegisteredStorageID != storageId) {
      console.warn("Dynamic registration storage ID doesn't match the configuration");
    }

    if (chRegisteredRegistrationMethod != -1 && chRegisteredRegistrationMethod != handlerData.registrationMethod) {
      console.warn("Dynamic registration registration method doesn't match the configuration");
    }

    chRegisteredID = registerID;
    chRegisteredClassName = registerClassName;
    chRegisteredStorageID = storageId;
    chRegisteredRegistrationMethod = handlerData.registrationMethod;

    return 1;
  };

  // When we have a BG and a FG MIDlet, we're statically registering the FG MIDlet (because the
  // BG MIDlet doesn't register the FG MIDlet in time).
  // So, when the BG MIDlet tries to register the content handler, it finds another one already
  // registered and unregisters it.
  addUnimplementedNative("com/sun/j2me/content/RegistryStore.unregister0.(Ljava/lang/String;)Z", 1);

  Native["com/sun/j2me/content/RegistryStore.getHandler0.(Ljava/lang/String;Ljava/lang/String;I)Ljava/lang/String;"] =
  function(addr, callerIdAddr, idAddr, mode) {
    if (!chRegisteredClassName) {
      return J2ME.Constants.NULL;
    }

    if (mode != 0) {
      console.warn("com/sun/j2me/content/RegistryStore.getHandler0.(Ljava/lang/String;Ljava/lang/String;I)Ljava/lang/String; expected mode = 0");
    }

    if (callerIdAddr !== J2ME.Constants.NULL) {
      console.warn("com/sun/j2me/content/RegistryStore.getHandler0.(Ljava/lang/String;Ljava/lang/String;I)Ljava/lang/String; expected callerIdAddr = null");
    }

    return J2ME.newString(serializeString([
                                            chRegisteredID,
                                            chRegisteredStorageID.toString(16),
                                            chRegisteredClassName,
                                            chRegisteredRegistrationMethod.toString(16)
                                          ]));
  };

  Native["com/sun/j2me/content/AppProxy.isInSvmMode.()Z"] = function(addr) {
    // We are in MVM mode (multiple MIDlets running concurrently)
    return 0;
  };

  addUnimplementedNative("com/sun/j2me/content/AppProxy.midletIsRemoved.(ILjava/lang/String;)V");
  addUnimplementedNative("com/sun/j2me/content/AppProxy.platformFinish0.(I)Z", 0);

  var invocation = null;

  function addInvocation(argument, action) {
    invocation = {
      argument: argument,
      action: action,
    };
  }

  var getInvocationCalled = false;

  DumbPipe.open("mozActivityHandler", {}, function(message) {
    var uniqueFileName = fs.createUniqueFile("/Private/j2meshare", message.fileName, new Blob([ message.data ]));
    // If ContentHandlerServer::.getRequest has already been called, we need
    // to destroy the MIDlet and restart it (because many MIDlets only check
    // on startup if they've been invoked to handle some content).
    if (!getInvocationCalled) {
      addInvocation("url=file:///Private/j2meshare/" + uniqueFileName, "share");
    } else {
      MIDP.setDestroyedForRestart(true);
      MIDP.sendDestroyMIDletEvent(chRegisteredClassName);
      MIDP.registerDestroyedListener(function() {
        MIDP.registerDestroyedListener(null);
        addInvocation("url=file:///Private/j2meshare/" + uniqueFileName, "share");
        MIDP.sendExecuteMIDletEvent(chRegisteredStorageID, chRegisteredClassName);
      });
    }
  });

  Native["com/sun/j2me/content/InvocationStore.get0.(Lcom/sun/j2me/content/InvocationImpl;ILjava/lang/String;IZ)I"] =
  function(addr, invocAddr, suiteId, classNameAddr, mode, shouldBlock) {
    var invoc = getHandle(invocAddr);

    getInvocationCalled = true;

    if (!invocation) {
      return 0;
    }

    var invocArguments = J2ME.getArrayFromAddr(invoc.arguments);

    if (invocArguments.length != 1) {
      invoc.argsLen = 1;
      return -1;
    }

    invocArguments[0] = J2ME.newString(invocation.argument);
    invoc.action = J2ME.newString(invocation.action);
    invoc.status = 2; // Invocation.ACTIVE

    invocation = null;

    return 1;
  };

  addUnimplementedNative("com/sun/j2me/content/InvocationStore.setCleanup0.(ILjava/lang/String;Z)V");
  addUnimplementedNative("com/sun/j2me/content/InvocationStore.getByTid0.(Lcom/sun/j2me/content/InvocationImpl;II)I", 0);
  addUnimplementedNative("com/sun/j2me/content/InvocationStore.resetFlags0.(I)V");

  return {
    addInvocation: addInvocation,
  };
})();


/* SOURCE: game-ui.js */
document.getElementById("up").onmousedown = function() {
  MIDP.sendKeyPress(119);
}

document.getElementById("up").onmouseup = function() {
  MIDP.sendKeyRelease(119);
}

document.getElementById("down").onmousedown = function() {
  MIDP.sendKeyPress(115);
}

document.getElementById("down").onmouseup = function() {
  MIDP.sendKeyRelease(115);
}

document.getElementById("left").onmousedown = function() {
  MIDP.sendKeyPress(97);
}

document.getElementById("left").onmouseup = function() {
  MIDP.sendKeyRelease(97);
}

document.getElementById("right").onmousedown = function() {
  MIDP.sendKeyPress(100);
}

document.getElementById("right").onmouseup = function() {
  MIDP.sendKeyRelease(100);
}

document.getElementById("fire").onmousedown = function() {
  MIDP.sendKeyPress(32);
}

document.getElementById("fire").onmouseup = function() {
  MIDP.sendKeyRelease(32);
}


/* SOURCE: midp/location.js */
/* -*- Mode: Java; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4 -*- */
/* vim: set shiftwidth=4 tabstop=4 autoindent cindent expandtab: */



var Location = {};

// We only support one single location provider via the geolocation API.
Location.PROVIDER_NAME = "browser";

Location.Providers = {};

// Provider ID should be greater or equal to 1.
Location.Providers.nextId = 1;

var LocationProvider = function() {
    this.state = LocationProvider.OUT_OF_SERVICE;
    this.position = {
        timestamp: 0,
        latitude: 0,
        longitude: 0,
        altitude: NaN,
        horizontalAccuracy: NaN,
        verticalAccuracy: NaN,
        speed: NaN,
        heading: NaN
    };

    // DumbPipe sender
    this.sender = null;

    // Called when location data is received.
    this.ondata = null;
};

LocationProvider.OUT_OF_SERVICE = 1;

// DumbPipe recipient
LocationProvider.prototype.recipient = function(message) {
    if (message.type === "data") {
        this.state = message.state;
        this.position = message.position;
        if (this.ondata) {
            this.ondata();
        }
    }
};

LocationProvider.prototype.start = function() {
    this.sender = DumbPipe.open("locationprovider", {},
                                this.recipient.bind(this));
};

LocationProvider.prototype.stop = function() {
    this.sender({ type: "close" });
    DumbPipe.close(this.sender);
};

LocationProvider.prototype.requestData = function() {
    return new Promise(function(resolve, reject) {
        this.sender({ type: "requestData" });
        this.ondata = resolve;
    }.bind(this));
};

Native["com/sun/j2me/location/PlatformLocationProvider.getListOfLocationProviders.()Ljava/lang/String;"] = function(addr) {
    // If there are more than one providers, separate them by comma.
    return J2ME.newString(Location.PROVIDER_NAME);
};

addUnimplementedNative("com/sun/j2me/location/CriteriaImpl.initNativeClass.()V");

Native["com/sun/j2me/location/PlatformLocationProvider.getBestProviderByCriteriaImpl.(Lcom/sun/j2me/location/CriteriaImpl;)Z"] =
function(addr, criteriaAddr) {
    var criteria = getHandle(criteriaAddr);
    criteria.providerName = J2ME.newString(Location.PROVIDER_NAME);
    return 1;
};

addUnimplementedNative("com/sun/j2me/location/LocationProviderInfo.initNativeClass.()V");
addUnimplementedNative("com/sun/j2me/location/LocationInfo.initNativeClass.()V");

Native["com/sun/j2me/location/PlatformLocationProvider.open.(Ljava/lang/String;)I"] = function(addr, nameAddr) {
    var provider = new LocationProvider();
    provider.start();
    var id = Location.Providers.nextId;
    Location.Providers.nextId = Location.Providers.nextId % 0xff + 1;
    Location.Providers[id] = provider;
    return id;
};

Native["com/sun/j2me/location/PlatformLocationProvider.resetImpl.(I)V"] = function(addr, providerId) {
    var provider = Location.Providers[providerId];
    provider.stop();
    Location.Providers[providerId] = null;
};

Native["com/sun/j2me/location/PlatformLocationProvider.getCriteria.(Ljava/lang/String;Lcom/sun/j2me/location/LocationProviderInfo;)Z"] =
function(addr, nameAddr, criteriaAddr) {
    var criteria = getHandle(criteriaAddr);
    criteria.canReportAltitude = 1;
    criteria.canReportSpeedCource = 1;
    criteria.averageResponseTime = 10000;
    return 1;
};

Native["com/sun/j2me/location/PlatformLocationProvider.setUpdateIntervalImpl.(II)V"] = function(addr, providerId, interval) {
    console.warn("com/sun/j2me/location/PlatformLocationProvider.setUpdateIntervalImpl.(II)V not implemented");
};

Native["com/sun/j2me/location/PlatformLocationProvider.getLastLocationImpl.(ILcom/sun/j2me/location/LocationInfo;)Z"] =
function(addr, providerId, locationInfoAddr) {
    var locationInfo = getHandle(locationInfoAddr);
    var provider = Location.Providers[providerId];
    var pos = provider.position;
    locationInfo.isValid = 1;
    locationInfo.timestamp = pos.timestamp;
    locationInfo.latitude = pos.latitude;
    locationInfo.longitude = pos.longitude;
    locationInfo.altitude = Math.fround(pos.altitude);
    locationInfo.horizontalAccuracy =  Math.fround(pos.horizontalAccuracy);
    locationInfo.verticalAccuracy =  Math.fround(pos.verticalAccuracy);
    locationInfo.speed = Math.fround(pos.speed);
    locationInfo.course =  Math.fround(pos.course);
    locationInfo.method = 0;
    return 1;
};

Native["com/sun/j2me/location/PlatformLocationProvider.getStateImpl.(I)I"] = function(addr, providerId) {
    var provider = Location.Providers[providerId];
    return provider.state;
};

Native["com/sun/j2me/location/PlatformLocationProvider.waitForNewLocation.(IJ)Z"] = function(addr, providerId, timeoutLow, timeoutHigh) {
    asyncImpl("Z", new Promise(function(resolve, reject) {
        var provider = Location.Providers[providerId];
        provider.requestData().then(resolve.bind(null, 1));
        setTimeout(resolve.bind(null, 0), J2ME.longToNumber(timeoutLow, timeoutHigh));
    }));
};

Native["com/sun/j2me/location/PlatformLocationProvider.receiveNewLocationImpl.(IJ)Z"] = function(addr, providerId, timestampLow, timestampHigh) {
    var provider = Location.Providers[providerId];
    var result = Math.abs(J2ME.longToNumber(timestampLow, timestampHigh) - provider.position.timestamp) < 10000;
    return result ? 1 : 0;
};


/* SOURCE: midp/sensor.js */
/* -*- Mode: Java; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4 -*- */
/* vim: set shiftwidth=4 tabstop=4 autoindent cindent expandtab: */



var AccelerometerSensor = {};

AccelerometerSensor.IS_MOBILE = navigator.userAgent.search("Mobile") !== -1;

AccelerometerSensor.model = {
    description: "Acceleration sensor measures acceleration in SI units for x, y and z - axis.",
    model: "FirefoxOS",
    quantity: "acceleration",
    contextType: "user",
    connectionType: 1, // ChannelType.TYPE_DOUBLE = 1
    maxBufferSize: 256,
    availabilityPush: 0,
    conditionPush: 0,
    channelCount: 3,
    properties: [
        "vendor", "FirefoxOS",
        "version", "1.0",
        "maxSamplingRate", "20.0",
        "location", "NoLoc",
        "security", "private"
    ]
};

var createLongArrayFromDoubles = (function() {
    var da = new Float64Array(1);
    var ia = new Int32Array(da.buffer);
    return function(doubles) {
        var ret = [];
        for (var i = 0; i < doubles.length; i++) {
            var val = doubles[i];
            da[0] = val;
            ret.push(ia[0], ia[1]);
        }
        return ret;
    };
})();

AccelerometerSensor.channels = [ {
        scale: 0,
        name: "axis_x",
        unit: "m/s^2",
        dataType: 1, // 1 == Double type
        accuracy: 1,
        mrangeArray: createLongArrayFromDoubles([
            -19.6, // smallest value
            19.6,  // largest value
            0.153  // resolution
        ])
    }, {
        scale: 0,
        name: "axis_y",
        unit: "m/s^2",
        dataType: 1, // 1 == Double type
        accuracy: 1,
        mrangeArray: createLongArrayFromDoubles([
            -19.6, // smallest value
            19.6,  // largest value
            0.153  // resolution
        ])
    }, {
        scale: 0,
        name: "axis_z",
        unit: "m/s^2",
        dataType: 1, // 1 == Double type
        accuracy: 1,
        mrangeArray: createLongArrayFromDoubles([
            -19.6, // smallest value
            19.6,  // largest value
            0.153  // resolution
        ])
    }
];

// Simulate acceleration data by moving mouse.
AccelerometerSensor.simulator = {
    _intervalId: -1,

    start: function() {
        var currentMouseX = -1;
        var currentMouseY = -1;
        var c = MIDP.deviceContext.canvas;
        c.onmousemove = function(ev) {
            currentMouseX =ev.layerX;
            currentMouseY =ev.layerY;
        };

        var time = 0;
        var mouseX = -1;
        var mouseY = -1;
        var velocityX = -1;
        var velocityY = -1;
        this._intervalId = setInterval(function() {
            var previousTime = time;
            var previousMouseX = mouseX;
            var previousMouseY = mouseY;
            var previousVelocityX = velocityX;
            var previousVelocityY = velocityY;

            time = Date.now();
            var dt = (time - previousTime) / 1000;
            mouseX = currentMouseX * c.width / c.offsetWidth / 5000;
            mouseY = currentMouseY * c.height / c.offsetHeight / 5000;
            velocityX = (mouseX - previousMouseX) / dt;
            velocityY = (mouseY - previousMouseY) / dt;
            var ax = (velocityX - previousVelocityX) / dt;
            var ay = ax;
            var az = (velocityY - previousVelocityY) / dt;

            AccelerometerSensor.handleEvent({
                accelerationIncludingGravity: { x: ax, y: ay, z: az }
            });
        }, 50);
    },

    stop: function() {
        MIDP.deviceContext.canvas.onmousemove = null;
        clearInterval(this._interalId);
    }
};

AccelerometerSensor.open = function() {
    window.addEventListener('devicemotion', this);
    if (!this.IS_MOBILE) {
        this.simulator.start();
    }
};

AccelerometerSensor.close = function() {
    window.removeEventListener('devicemotion', this);
    if (!this.IS_MOBILE) {
        this.simulator.stop();
    }
};

AccelerometerSensor.readBuffer = (function() {
    var offset = 0;

    var write_int32 = function(out, value) {
      var a = new Int8Array(4);
      new Int32Array(a.buffer)[0] = value;
      Array.prototype.reverse.apply(a);
      out.set(a, offset);
      offset += 4;
    };

    var write_boolean = function(out, value) {
      out[offset++] = value;
    };

    var write_float32 = function(out, value) {
      var a = new Int8Array(4);
      new Float32Array(a.buffer)[0] = value;
      Array.prototype.reverse.apply(a);
      out.set(a, offset);
      offset += 4;
    };

    var write_double64 = function(out, value) {
      var a = new Int8Array(8);
      new Float64Array(a.buffer)[0] = value;
      Array.prototype.reverse.apply(a);
      out.set(a, offset);
      offset += 8;
    };

    var DATA_LENGTH = 1;

    return function(channelNumber) {
        var resultAddr = J2ME.newByteArray(5 + DATA_LENGTH * 13);
        var result = J2ME.getArrayFromAddr(resultAddr);

        offset = 0;
        result[offset++] = this.channels[channelNumber].dataType;
        // Set data length
        write_int32(result, DATA_LENGTH);
        // Set validity
        write_boolean(result, 1);
        // Set uncertainty
        write_float32(result, 0);
        // Set sensor data.
        write_double64(result, this.acceleration[channelNumber]);

        return resultAddr;
    };
})();

AccelerometerSensor.acceleration = [0, 0, 0];

// Event handler to handle devicemotion event.
AccelerometerSensor.handleEvent = function(evt) {
    var a = evt.accelerationIncludingGravity;
    this.acceleration[0] = a.x;
    this.acceleration[1] = a.y;
    this.acceleration[2] = a.z;
};

Native["com/sun/javame/sensor/SensorRegistry.doGetNumberOfSensors.()I"] = function(addr) {
    // Only support the acceleration sensor.
    return 1;
};

Native["com/sun/javame/sensor/Sensor.doGetSensorModel.(ILcom/sun/javame/sensor/SensorModel;)V"] =
function(addr, number, modelAddr) {
    if (number !== 0) {
        console.error("Invalid sensor number: " + number);
        return;
    }
    var model = getHandle(modelAddr);
    var m = AccelerometerSensor.model;
    model.description = J2ME.newString(m.description);
    model.model = J2ME.newString(m.model);
    model.quantity = J2ME.newString(m.quantity);
    model.contextType = J2ME.newString(m.contextType);
    model.connectionType = m.connectionType;
    model.maxBufferSize = m.maxBufferSize;
    model.availabilityPush = m.availabilityPush;
    model.conditionPush = m.conditionPush;
    model.channelCount = m.channelCount;
    model.errorCodes = J2ME.newIntArray(0);
    model.errorMsgs = J2ME.newStringArray(0);

    var n = m.properties.length;
    var pAddr = J2ME.newStringArray(n);
    model.properties = pAddr;
    var p = J2ME.getArrayFromAddr(pAddr);
    for (var i = 0; i < n; i++) {
        p[i] = J2ME.newString(m.properties[i]);
    }
};

Native["com/sun/javame/sensor/ChannelImpl.doGetChannelModel.(IILcom/sun/javame/sensor/ChannelModel;)V"] =
function(addr, sensorsNumber, number, modelAddr) {
    if (sensorsNumber !== 0) {
        console.error("Invalid sensor number: " + sensorsNumber);
        return;
    }
    if (number < 0 || number >= AccelerometerSensor.channels.length) {
        console.error("Invalid channel number: " + number);
        return;
    }
    var model = getHandle(modelAddr);
    var c = AccelerometerSensor.channels[number];
    model.scale = c.scale;
    model.name = J2ME.newString(c.name);
    model.unit = J2ME.newString(c.unit);
    model.dataType = c.dataType;
    model.accuracy = c.accuracy;
    var n = c.mrangeArray.length / 2;
    model.mrangeCount = n;

    var n = c.mrangeArray.length;
    var arrayAddr = J2ME.newArray(J2ME.PrimitiveClassInfo.J, n);
    var array = J2ME.getArrayFromAddr(arrayAddr);
    var i32array = new Int32Array(array.buffer, array.byteOffset, array.length * 2);
    for (var i = 0; i < n; i++) {
        i32array[i * 2] = c.mrangeArray[i].low_;
        i32array[i * 2 + 1] = c.mrangeArray[i].high_;
    }
    model.mrageArray = arrayAddr;
};

Native["com/sun/javame/sensor/NativeSensor.doIsAvailable.(I)Z"] = function(addr, number) {
    // Only support the acceleration sensor with number = 0.
    return number === 0 ? 1 : 0;
};

Native["com/sun/javame/sensor/NativeSensor.doInitSensor.(I)Z"] = function(addr, number) {
    if (number !== 0) {
        return 0;
    }
    AccelerometerSensor.open();
    return 1;
};

Native["com/sun/javame/sensor/NativeSensor.doFinishSensor.(I)Z"] = function(addr, number) {
    if (number !== 0) {
        return 0;
    }
    AccelerometerSensor.close();
    return 1;
};

Native["com/sun/javame/sensor/NativeChannel.doMeasureData.(II)[B"] = function(addr, sensorNumber, channelNumber) {
    if (sensorNumber !== 0 || channelNumber < 0 || channelNumber >= 3) {
        if (sensorNumber !== 0) {
            console.error("Invalid sensor number: " + sensorsNumber);
        } else {
            console.error("Invalid channel number: " + channelNumber);
        }
        return J2ME.newByteArray(0);
    }

    var resultHolder = J2ME.gcMallocUncollectable(4);

    asyncImpl("[B", new Promise(function(resolve, reject) {
        var resultAddr = AccelerometerSensor.readBuffer(channelNumber);
        i32[resultHolder >> 2] = resultAddr;
        setTimeout(resolve.bind(null, resultAddr), 50);
    }), function() {
        ASM._gcFree(resultHolder);
    });
};


/* SOURCE: main.js */
/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */



// The real profile and release variable declaration in config.ts are folded away by closure. Until we
// make closure process this file also, make sure that |profile| is defined in this file.
var release;
var profile;

var jvm = new JVM();

if ("gamepad" in config && !/no|0/.test(config.gamepad)) {
  document.documentElement.classList.add('gamepad');
}

var jars = [];

if (typeof Benchmark !== "undefined") {
  Benchmark.startup.init();
}

if (config.jars) {
  jars = jars.concat(config.jars.split(":"));
}

// Mobile info gets accessed a lot, so we cache it on startup.
var mobileInfo;
var getMobileInfo = new Promise(function(resolve, reject) {
  var sender = DumbPipe.open("mobileInfo", {}, function(message) {
    mobileInfo = message;
    DumbPipe.close(sender);
    resolve();
  });
});

var loadingMIDletPromises = [getMobileInfo];
var loadingPromises = [initFS];

loadingPromises.push(load("java/classes.jar", "arraybuffer").then(function(data) {
  JARStore.addBuiltIn("java/classes.jar", data);
  CLASSES.initializeBuiltinClasses();
}));

jars.forEach(function(jar) {
  loadingMIDletPromises.push((jar === "local.jar" && parent.localJarData ? Promise.resolve(parent.localJarData) : load(jar, "arraybuffer")).then(function(data) {
    JARStore.addBuiltIn(jar, data);
  }));
});

function processJAD(data) {
  data
  .replace(/\r\n|\r/g, "\n")
  .replace(/\n /g, "")
  .split("\n")
  .forEach(function(entry) {
    if (entry) {
      var keyEnd = entry.indexOf(":");
      var key = entry.substring(0, keyEnd);
      var val = entry.substring(keyEnd + 1).trim();
      MIDP.manifest[key] = val;
    }
  });
}

function performDownload(url, callback) {
  showDownloadScreen();
  var progressBar = downloadDialog.querySelector('progress.pack-activity');

  var sender = DumbPipe.open("JARDownloader", url, function(message) {
    switch (message.type) {
      case "done":
        DumbPipe.close(sender);
        hideDownloadScreen();
        progressBar.value = 0;
        callback(message.data);

        break;

      case "progress":
        progressBar.value = message.progress;
        break;

      case "fail":
        DumbPipe.close(sender);
        hideDownloadScreen();
        progressBar.value = 0;

        var failureDialog = document.getElementById('download-failure-dialog');
        failureDialog.style.display = '';

        var btnRetry = failureDialog.querySelector('button.recommend');
        btnRetry.addEventListener('click', function onclick(e) {
          e.preventDefault();
          btnRetry.removeEventListener('click', onclick);
          failureDialog.style.display = 'none';
          performDownload(url, callback);
        });

        break;
    }
  });
}

if (config.downloadJAD) {
  loadingMIDletPromises.push(new Promise(function(resolve, reject) {
    JARStore.loadJAR("midlet.jar").then(function(loaded) {
      if (loaded) {
        // Show the splash screen as soon as possible.
        showSplashScreen();

        processJAD(JARStore.getJAD());
        resolve();
        return;
      }

      performDownload(config.downloadJAD, function(data) {
        // Show the splash screen as soon as possible after showing
        // the download screen while downloading the JAD/JAR files.
        showSplashScreen();

        JARStore.installJAR("midlet.jar", data.jarData, data.jadData).then(function() {
          processJAD(JARStore.getJAD());
          resolve();
        });
      });
    });
  }));
} else if (config.jad) {
  loadingMIDletPromises.push(load(config.jad, "text").then(processJAD));
}

if (config.jad || config.downloadJAD) {
  Promise.all(loadingMIDletPromises).then(backgroundCheck);
}

var loadingFGPromises = [ emoji.loadData() ];

if (jars.indexOf("tests/tests.jar") !== -1) {
  loadingPromises.push(loadScript("tests/native.js"),
                       loadScript("tests/mozactivitymock.unprivileged.js"),
                       loadScript("tests/config.js"));
}

function getIsOff(button) {
  return button.textContent.contains("OFF");
}
function toggle(button) {
  var isOff = getIsOff(button);
  button.textContent = button.textContent.replace(isOff ? "OFF" : "ON", isOff ? "ON" : "OFF");
}

var bigBang = 0;
var profiling = false;

function startTimeline() {
  jsGlobal.START_TIME = performance.now();
  jsGlobal.profiling = true;
  requestTimelineBuffers(function (buffers) {
    for (var i = 0; i < buffers.length; i++) {
      buffers[i].reset(jsGlobal.START_TIME);
    }
    for (var runtime of J2ME.RuntimeTemplate.all) {
      for (var ctx of runtime.allCtxs) {
        ctx.restartMethodTimeline();
      }
    }
  });
}

function stopTimeline(cb) {
  jsGlobal.profiling = false;
  requestTimelineBuffers(function(buffers) {
    // Some of the methods may have not exited yet. Leave them
    // so they show up in the profile.
    for (var i = 0; i < buffers.length; i++) {
      while(buffers[i].depth > 0) {
        buffers[i].leave();
      }
    }
    cb(buffers);
  });
}

function stopAndSaveTimeline() {
  console.log("Saving profile, please wait ...");
  var traceFormat = Shumway.Tools.Profiler.TraceFormat[profileFormat.toUpperCase()];
  var output = [];
  var writer = new J2ME.IndentingWriter(false, function (s) {
    output.push(s);
  });
  if (traceFormat === Shumway.Tools.Profiler.TraceFormat.CSV) {
    writer.writeLn("Name,Count,Self (ms),Total (ms)");
  }
  stopTimeline(function (buffers) {
    var snapshots = [];
    for (var i = 0; i < buffers.length; i++) {
      snapshots.push(buffers[i].createSnapshot());
    }
    // Trace Statistics
    for (var i = 0; i < snapshots.length; i++) {
      writer.writeLn("Timeline Statistics: " + snapshots[i].name);
      snapshots[i].traceStatistics(writer, 1, traceFormat); // Don't trace any totals below 1 ms.
    }
    // Trace Aggregate Method Statistics
    writer.writeLn("Timeline Statistics: All Threads");
    var methodSnapshots = snapshots.slice(2);
    new Shumway.Tools.Profiler.TimelineBufferSnapshotSet(methodSnapshots).traceStatistics(writer, 1, traceFormat);
    // Trace Events
    for (var i = 0; i < snapshots.length; i++) {
      writer.writeLn("Timeline Events: " + snapshots[i].name);
      snapshots[i].trace(writer, 0.1); // Don't trace anything below 0.1 ms.
    }
  });
  var text = output.join("\n");

  var fileExtension, mediaType;
  switch (traceFormat) {
    case Shumway.Tools.Profiler.TraceFormat.CSV:
      fileExtension = "csv";
      mediaType = "text/csv";
      break;
    case Shumway.Tools.Profiler.PLAIN:
    default:
      fileExtension = "txt";
      mediaType = "text/plain";
      break;
  }
  var profileFilename = "profile." + fileExtension;
  var blob = new Blob([text], {type : mediaType});
  saveAs(blob, profileFilename);
  console.log("Saved profile in: adb pull /sdcard/downloads/" + profileFilename);
}

function start() {
  var deferStartup = config.deferStartup | 0;
  if (deferStartup && typeof Benchmark !== "undefined") {
    setTimeout(function () {
      Benchmark.startup.setStartTime(performance.now());
      run();
    }, deferStartup);
  } else {
    run();
  }
  function run() {
    J2ME.Context.setWriters(new J2ME.IndentingWriter());
    // For profile mode 1, we start the profiler and wait 2 seconds and show the flame chart UI.
    profile === 1 && profiler.start(2000, false);
    bigBang = performance.now();
    // For profiler mode 2, we start the timeline and stop it later by calling |stopAndSaveTimeline|.
    profile === 2 && startTimeline();
    jvm.startIsolate0(config.main, config.args);
  }
}

// If we're not running a MIDlet, we need to wait everything to be loaded.
if (!config.midletClassName) {
  loadingPromises = loadingPromises.concat(loadingMIDletPromises);
}

Promise.all(loadingPromises).then(start, function (reason) {
  console.error("Loading failed: \"" + reason + "\"");
});

document.getElementById("start").onclick = function() {
  start();
};

document.getElementById("canvasSize").onchange = function() {
  Array.prototype.forEach.call(document.body.classList, function(c) {
    if (c.indexOf('size-') == 0) {
      document.body.classList.remove(c);
    }
  });

  if (this.value) {
    document.body.classList.add(this.value);
  }

  MIDP.updatePhysicalScreenSize();
  MIDP.updateCanvas();
  start();
};

if (typeof Benchmark !== "undefined") {
  Benchmark.initUI("benchmark");
}

window.onload = function() {
 document.getElementById("deleteDatabases").onclick = function() {
   fs.deleteDatabase().then(function() {
     console.log("Deleted fs database.");
   }).catch(function(error) {
     console.log("Error deleting fs database: " + error);
   });

   CompiledMethodCache.deleteDatabase().then(function() {
     console.log("Deleted CompiledMethodCache database.");
   }).catch(function(error) {
     console.log("Error deleting CompiledMethodCache database: " + error);
   });

   JARStore.deleteDatabase().then(function() {
     console.log("Deleted JARStore database.");
   }).catch(function(error) {
     console.log("Error deleting JARStore database: " + error);
   });
 };
 document.getElementById("exportstorage").onclick = function() {
   fs.exportStore(function(blob) {
     saveAs(blob, "fs-" + Date.now() + ".json");
   });
 };
 document.getElementById("importstorage").onclick = function() {
   function performImport(file) {
     fs.importStore(file, function() {
       DumbPipe.close(DumbPipe.open("alert", "Import completed."));
     });
   }

   var file = document.getElementById("importstoragefile").files[0];
   if (file) {
     performImport(file);
   } else {
     load(document.getElementById("importstorageurl").value, "blob").then(function(blob) {
       performImport(blob);
     });
   }
 };
 document.getElementById("clearCompiledMethodCache").onclick = function() {
   CompiledMethodCache.clear().then(function() { console.log("cleared compiled method cache") });
 };
 document.getElementById("printAllExceptions").onclick = function() {
   VM.DEBUG_PRINT_ALL_EXCEPTIONS = !VM.DEBUG_PRINT_ALL_EXCEPTIONS;
   toggle(this);
 };
 document.getElementById("clearCounters").onclick = function() {
   clearCounters();
 };

  function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  setInterval(function () {
    var el = document.getElementById("bytecodeCount");
    el.textContent = numberWithCommas(J2ME.bytecodeCount);

    var el = document.getElementById("interpreterCount");
    el.textContent = numberWithCommas(J2ME.interpreterCount);

    var el = document.getElementById("compiledCount");
    el.textContent = numberWithCommas(J2ME.compiledMethodCount) + "/" +
                     numberWithCommas(J2ME.cachedMethodCount) + "/" +
                     numberWithCommas(J2ME.aotMethodCount) + "/" +
                     numberWithCommas(J2ME.notCompiledMethodCount);

    var el = document.getElementById("onStackReplacementCount");
    el.textContent = numberWithCommas(J2ME.onStackReplacementCount);

    var el = document.getElementById("unwindCount");
    el.textContent = numberWithCommas(J2ME.unwindCount);

    var el = document.getElementById("preemptionCount");
    el.textContent = numberWithCommas(J2ME.preemptionCount);

  }, 500);

  function dumpCounters() {
    var writer = new J2ME.IndentingWriter();

    writer.writeLn("Frame Count: " + J2ME.frameCount);
    writer.writeLn("Unwind Count: " + J2ME.unwindCount);
    writer.writeLn("Bytecode Count: " + J2ME.bytecodeCount);
    writer.writeLn("OSR Count: " + J2ME.onStackReplacementCount);

    if (J2ME.interpreterCounter) {
      writer.enter("interpreterCounter");
      J2ME.interpreterCounter.traceSorted(writer);
      writer.outdent();
    }
    if (J2ME.interpreterMethodCounter) {
      writer.enter("interpreterMethodCounter");
      J2ME.interpreterMethodCounter.traceSorted(writer);
      writer.outdent();
    }
    if (J2ME.baselineMethodCounter) {
      writer.enter("baselineMethodCounter");
      J2ME.baselineMethodCounter.traceSorted(writer);
      writer.outdent();
    }
    if (J2ME.baselineCounter) {
      writer.enter("baselineCounter");
      J2ME.baselineCounter.traceSorted(writer);
      writer.outdent();
    }
    if (J2ME.nativeCounter) {
      writer.enter("nativeCounter");
      J2ME.nativeCounter.traceSorted(writer);
      writer.outdent();
    }
    if (J2ME.runtimeCounter) {
      writer.enter("runtimeCounter");
      J2ME.runtimeCounter.traceSorted(writer);
      writer.outdent();
    }
    if (J2ME.asyncCounter) {
      writer.enter("asyncCounter");
      J2ME.asyncCounter.traceSorted(writer);
      writer.outdent();
    }
  }
  function clearCounters() {
    J2ME.frameCount = 0;
    J2ME.unwindCount = 0;
    J2ME.bytecodeCount = 0;
    J2ME.interpreterCount = 0;
    J2ME.onStackReplacementCount = 0;

    J2ME.interpreterCounter && J2ME.interpreterCounter.clear();
    J2ME.interpreterMethodCounter && J2ME.interpreterMethodCounter.clear();
    J2ME.nativeCounter && J2ME.nativeCounter.clear();
    J2ME.runtimeCounter && J2ME.runtimeCounter.clear();
    J2ME.asyncCounter && J2ME.asyncCounter.clear();
    J2ME.baselineMethodCounter && J2ME.baselineMethodCounter.clear();
    J2ME.baselineCounter && J2ME.baselineCounter.clear();
  }

  document.getElementById("dumpCounters").onclick = function() {
    dumpCounters();
  };
  document.getElementById("sampleCounters1").onclick = function() {
    clearCounters();
    dumpCounters();
    setTimeout(function () {
      dumpCounters();
    }, 1000);
  };
  document.getElementById("sampleCounters2").onclick = function() {
    clearCounters();
    function sample() {
      var c = 1;
      function tick() {
        if (c-- > 0) {
          dumpCounters();
          clearCounters();
          setTimeout(tick, 16);
        }
      }

      setTimeout(tick, 100);
    }
    setTimeout(sample, 2000); // Wait 2s before starting.
  };
};

function requestTimelineBuffers(fn) {
  if (J2ME.timeline) {
    // If you change the position at which method timelines begin in this array,
    // then also update the method timeline aggregation in stopAndSaveTimeline.
    var activeTimeLines = [
      J2ME.threadTimeline,
      J2ME.timeline,
    ];
    var methodTimeLines = J2ME.methodTimelines;
    for (var i = 0; i < methodTimeLines.length; i++) {
      activeTimeLines.push(methodTimeLines[i]);
    }
    fn(activeTimeLines);
    return;
  }
  return fn([]);
}

var perfWriterCheckbox = document.querySelector('#perfWriter');

perfWriterCheckbox.checked = !!(J2ME.writers & J2ME.WriterFlags.Perf);
perfWriterCheckbox.addEventListener('change', function() {
  if (perfWriterCheckbox.checked) {
    J2ME.writers |= J2ME.WriterFlags.Perf;
  } else {
    J2ME.writers &= !J2ME.WriterFlags.Perf;
  }
});

var profiler = profile === 1 ? (function() {

  var elPageContainer = document.getElementById("pageContainer");
  elPageContainer.classList.add("profile-mode");

  var elProfilerContainer = document.getElementById("profilerContainer");
  var elProfilerToolbar = document.getElementById("profilerToolbar");
  var elProfilerMessage = document.getElementById("profilerMessage");
  var elProfilerPanel = document.getElementById("profilePanel");
  var elBtnStartStop = document.getElementById("profilerStartStop");
  var elBtnAdjustHeight = document.getElementById("profilerAdjustHeight");

  var controller;
  var startTime;
  var timerHandle;
  var timeoutHandle;

  var Profiler = function() {
    controller = new Shumway.Tools.Profiler.Controller(elProfilerPanel);
    elBtnStartStop.addEventListener("click", this._onStartStopClick.bind(this));
    elBtnAdjustHeight.addEventListener("click", this._onAdjustHeightClick.bind(this));

    var self = this;
    window.addEventListener("keypress", function (event) {
      if (event.altKey && event.keyCode === 114) { // Alt + R
        self._onStartStopClick();
      }
    }, false);
  }

  Profiler.prototype.start = function(maxTime, resetTimelines) {
    startTimeline();
    controller.deactivateProfile();
    maxTime = maxTime || 0;
    elProfilerToolbar.classList.add("withEmphasis");
    elBtnStartStop.textContent = "Stop";
    startTime = Date.now();
    timerHandle = setInterval(showTimeMessage, 1000);
    if (maxTime) {
      timeoutHandle = setTimeout(this.createProfile.bind(this), maxTime);
    }
    showTimeMessage();
  }

  Profiler.prototype.createProfile = function() {
    stopTimeline(function (buffers) {
      controller.createProfile(buffers);
      elProfilerToolbar.classList.remove("withEmphasis");
      elBtnStartStop.textContent = "Start";
      clearInterval(timerHandle);
      clearTimeout(timeoutHandle);
      timerHandle = 0;
      timeoutHandle = 0;
      showTimeMessage(false);
    });
  }

  Profiler.prototype.openPanel = function() {
    elProfilerContainer.classList.remove("collapsed");
  }

  Profiler.prototype.closePanel = function() {
    elProfilerContainer.classList.add("collapsed");
  }

  Profiler.prototype.resize = function() {
    controller.resize();
  }

  Profiler.prototype._onAdjustHeightClick = function(e) {
    elProfilerContainer.classList.toggle("max");
  };

  Profiler.prototype._onMinimizeClick = function(e) {
    if (elProfilerContainer.classList.contains("collapsed")) {
      this.openPanel();
    } else {
      this.closePanel();
    }
  }

  Profiler.prototype._onStartStopClick = function(e) {
    if (timerHandle) {
      this.createProfile();
      this.openPanel();
    } else {
      this.start(0, true);
    }
  }

  function showTimeMessage(show) {
    show = typeof show === "undefined" ? true : show;
    var time = Math.round((Date.now() - startTime) / 1000);
    elProfilerMessage.textContent = show ? "Running: " + time + " Seconds" : "";
  }

  return new Profiler();

})() : undefined;
