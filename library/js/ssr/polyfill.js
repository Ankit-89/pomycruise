import 'babel-polyfill';
if ( typeof global === 'undefined' ) var global = this;

if ( typeof window === 'undefined' ) var window = this;

if ( typeof process === 'undefined' ) var process = { env: {} };

if ( typeof process === 'undefined' ) {

    var console = {
        debug: print,
        warn: print,
        log: print,
        error: print
    }
}