'use strict';
/**
 * Redirect - Utility class for redirecting to pages when required cookie or sessionStorage is not present.
 */
import SessionStorage from './session-storage';

/**
 * getCookie - gets the cookie for specified key and returns
 *
 * @param   {string} name   contains the name of the cookie
 * @returns {string}        returns the cookie value
 */
const getCookie = (name) => {
    if (typeof name !== undefined && document && document.cookie) {
        let cookiePartialExp = '=([^;]+)';

        let cookieDataExpression = new RegExp(`${name}${cookiePartialExp}`);

        let cookieData = cookieDataExpression.exec(document.cookie);

        return cookieData !== null ? cookieData[1] : false;
    }
};

/**
 * checkCookie - checks the required cookie data and returns boolean value
 *
 * @param   {array} cookies   containing the cookie and session data attributes and the redirect URL
 * @returns {boolean}        returns true if valid data is present
 */

const checkCookie = (cookies) => {
    if (typeof cookies !== undefined) {
        let cookieIsValid;

        if (cookies.length) {
            cookieIsValid = cookies.reduce(function(cookiePresent, key) {
                return cookiePresent && getCookie(key);
            }, true);
        }

        return cookieIsValid;
    }
};

/**
 * checkSession - checks the required session data and returns boolean value
 *
 * @param   {array} sessionKeys   containing the cookie and session data attributes and the redirect URL
 * @returns {boolean}        returns true if valid data is present
 */
const checkSession = (sessionKeys) => {
    if (typeof sessionKeys !== undefined) {
        let sessionIsValid;

        if (sessionKeys.length) {
            sessionIsValid = sessionKeys.reduce(function(
                sessionIsPresent,
                key
            ) {
                return sessionIsPresent && SessionStorage.getItem(key);
            },
            true);
        }

        return sessionIsValid;
    }
};

export default {
    checkCookie,
    checkSession
};
