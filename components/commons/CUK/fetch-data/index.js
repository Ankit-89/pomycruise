'use strict';

import { clearLoginData } from '../login-data-utility';
import { getCurrencyData } from '../currencyFormat';
import { getCountryCode } from '../utilities';

const defaults = {
    mode: 'cors',
    cache: 'default',
    method: 'GET',
    credentials: 'same-origin'
};

// * Export a standard `fetch` method containing necessary global options
// *
// * @module FetchData
// * @param {String} url Path to supply to `fetch` method
// * @param {String} [opts] Optional parameters to supply or override default options. Default value is {}
export default function(url, opts = {}) {
    const currencyData = getCurrencyData();

    const countryCode = getCountryCode();

    const configs = typeof window !== 'undefined' ? window.configs : {};

    // const loginData = getDataForApi();

    if (typeof opts !== 'undefined' && typeof opts.headers !== 'undefined' && opts.headers && url) {
        url = url
            .replace('{brand}', opts.headers.brand)
            .replace('{locale}', opts.headers.locale);

        if (
            url.indexOf('/api/') === 0 &&
            configs.apikey &&
            configs.apikey !== ''
        ) {
            opts.headers.apikey = configs.apikeyMycruise;
        }

        if (
            url.indexOf('/api/') === 0 &&
            configs.agencyId &&
            configs.agencyId !== ''
        ) {
            opts.headers.agencyId = configs.agencyId;
        }
    }

    let options = { ...defaults, ...opts };

    options.headers = { ...options.headers, ...opts.headers };

    if (configs.countryOverride && typeof options.headers !== 'undefined') {
        if (countryCode && countryCode !== 'default')
            options.headers.country = countryCode;

        options.headers.currencyCode = currencyData
            ? currencyData.currencyCode
            : '';
    }

    return fetch(url, options)
        .then((response) => {
            const responseHeader = getAjaxResponseHeader(response);
            const responseStatus = response.status;

            return response
                .json()
                .then((json) => {
                    for (var i = 0; i < responseHeader.length; i++) {
                        if (responseHeader[i].key === 'Authorization') {
                            json.loginToken = responseHeader[i];
                        }
                        if (responseHeader[i].key === 'Date') {
                            json.responseDate = responseHeader[i];
                        }
                        if (responseHeader[i].key === 'sysdate') {
                            json.responseSysDate = responseHeader[i];
                        }
                    }
                    if (
                        responseStatus === 412 &&
                        json.errors[0] &&
                        json.errors[0].code === '5004'
                    ) {
                        clearLoginData();
                    }
                    if (responseStatus === 400 || responseStatus === 409) {
                        json.status = responseStatus;
                    }
                  	if (responseStatus >= 400 &&  responseStatus < 510) {
                        json.httpstatus = responseStatus;
                    }
                    json.httpResponseStatus = responseStatus;
                    return json;
                })
                .catch((e) => {
                    const err = {
                        status: responseStatus,
                        error: e
                    };
                    return err;
                });
        })
        .then((responseData) => responseData)
        .catch((error) => {} /* console.error(error)*/);
}

/**
 * getAjaxResponseHeader - Returns header from response if present
 *
 * @param { object } responseObject - unparsed response object
 *
 * @returns { Array } array of response header
 */
const getAjaxResponseHeader = (responseObject) => {
    // headerKeys is an array of all the response header attribute which are needed
    const headerKeys = ['Authorization', 'Date', 'sysdate'];
    const headerResponse = [];

    for (var i = 0; i < headerKeys.length; i++) {
        let headerToken =
                responseObject.headers &&
                responseObject.headers.get(headerKeys[i]),
            headerRes = {};

        if (headerToken && headerToken.length) {
            headerRes = {
                type: 'header',
                name:
                    headerKeys[i] === 'Authorization'
                        ? headerKeys[i]
                        : 'sessionToken',
                value: headerToken,
                key: headerKeys[i]
            };
        } else {
            headerRes = {};
        }
        headerResponse.push(headerRes);
    }

    return headerResponse;
};
