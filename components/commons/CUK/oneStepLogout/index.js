'use strict';

import fetch from '../fetch-data';
import { getLoginToken } from '../login-data-utility';

/**
 * oneStepLogout - To be used for Logout api calls when SSO is not involved
 *
 * @param { String } url - Login API url
 * @param { Object } headers - Headers to be passed to Login API
 *
 * @returns {Promise} Promise gets resolved if the response gets resolved. Else it gets rejected
*/
const oneStepLogout = (url, headers) => {

    const token = getLoginToken();

    const requestHeader = { ...headers, 'Content-Type': 'application/json', 'sessionToken': token };

    return new Promise(function (resolve, reject) {

        fetch(url, {
            method: 'DELETE',
            headers: requestHeader
        }).then(response => {

            resolve(response);
        }).catch(e => {

            // console.log(e);

            reject(e);
        });

    });
};

export default oneStepLogout;