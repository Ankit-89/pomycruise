/* eslint-disable */

import 'babel-polyfill';
import es6Promise from 'es6-promise';
import 'isomorphic-fetch';
import 'classlist-polyfill';

es6Promise.polyfill();

// Array.prototype.findIndex Polyfill
// https://tc39.github.io/ecma262/#sec-array.prototype.findIndex
if (!Array.prototype.findIndex) {
    Object.defineProperty(Array.prototype, 'findIndex', {
        value(predicate) {
            // 1. Let O be ? ToObject(this value).
            if (this === null) {
                throw new TypeError('"this" is null or not defined');
            }

            const o = Object(this);

            // 2. Let len be ? ToLength(? Get(O, "length")).
            const len = o.length >>> 0;

            // 3. If IsCallable(predicate) is false, throw a TypeError exception.
            if (typeof predicate !== 'function') {
                throw new TypeError('predicate must be a function');
            }

            // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
            const thisArg = arguments[1];

            // 5. Let k be 0.
            let k = 0;

            // 6. Repeat, while k < len
            while (k < len) {
                // a. Let Pk be ! ToString(k).
                // b. Let kValue be ? Get(O, Pk).
                // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
                // d. If testResult is true, return k.
                const kValue = o[k];

                if (predicate.call(thisArg, kValue, k, o)) {
                    return k;
                }
                // e. Increase k by 1.
                k++;
            }

            // 7. Return -1.
            return -1;
        }
    });
}

if (!Array.prototype.fill) {
    Object.defineProperty(Array.prototype, 'fill', {
        value(value) {
            // Steps 1-2.
            if (this == null) {
                throw new TypeError('this is null or not defined');
            }

            const O = Object(this);

            // Steps 3-5.
            const len = O.length >>> 0;

            // Steps 6-7.
            const start = arguments[1];
            const relativeStart = start >> 0;

            // Step 8.
            let k =
                relativeStart < 0
                    ? Math.max(len + relativeStart, 0)
                    : Math.min(relativeStart, len);

            // Steps 9-10.
            const end = arguments[2];
            const relativeEnd = end === undefined ? len : end >> 0;

            // Step 11.
            const final =
                relativeEnd < 0
                    ? Math.max(len + relativeEnd, 0)
                    : Math.min(relativeEnd, len);

            // Step 12.
            while (k < final) {
                O[k] = value;
                k++;
            }

            // Step 13.
            return O;
        }
    });
}

if ( typeof NodeList.prototype.forEach === 'undefined' ) {
    NodeList.prototype.forEach = Array.prototype.forEach;
}

document.addEventListener('keydown', function (e) {
    if (e.keyCode === 9 || e.keyCode === 13) {
        document.body.classList.add('show-focus-outlines');
    }
});

document.addEventListener('click', function (e) {
    // Below line is to check if the click event was due to mouse click by user or from javascript/ keyboard input
    if ( (e.screenX && e.screenX > 0) || (e.screenY && e.screenY > 0) ) {
        document.body.classList.remove('show-focus-outlines');
    }
});

window.windowEncoded = {};

Object.defineProperty(window.windowEncoded, 'location', {
    enumerable: true,
    configurable: true,
    value: JSON.parse(JSON.stringify(window.location)),
    writable: true
});

Object.defineProperties(window.windowEncoded.location, {
    hash: {
        get() {
            return decodeURI(window.location.hash);
        },
        set(val) {
            window.location.hash = encodeURI(val);
        }
    },
    href: {
        get() {
            return decodeURI(window.location.href);
        },
        set(val) {
            window.location.href = encodeURI(val);
        }
    },
    pathname: {
        get() {
            return decodeURI(window.location.pathname);
        },
        set(val) {
            window.location.pathname = encodeURI(val);
        }
    }
});
