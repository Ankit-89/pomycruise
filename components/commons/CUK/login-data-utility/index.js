'use strict';

import SessionStorage from '../session-storage';
import cookie from '../cookie';
import validateSession from '../validateSession';
import { getConfig } from '../utilities';

const USER_DATA = 'userData';
// const AUTH_TOKEN = 'authToken';

/**
 * setLoginToken - Sets login token to session data
 *
 * @param { object } token - login token
 */
// export const setLoginToken = ( token ) => {

//     SessionStorage.setItem(AUTH_TOKEN, token);
// };

/**
 * getLoginToken - Returns login token from session if present
 *
 * @returns {object} login token with type and key name
 */
export const getLoginToken = () => {
    const token = SessionStorage.getItem(AUTH_TOKEN);

    if (token && token.value) {
        return token.value;
    } else {
        return '';
    }
};

/**
 * isLoggedIn - Returns if the user is logged or not
 *
 * @returns {Boolean} is logged in or not
 */
export const isLoggedIn = () => {
    const userData = SessionStorage.getItem(USER_DATA);

    if (userData && userData.mariner) {
        return true;
    } else {
        return false;
    }
};

/**
 * setUserData - Sets user account data to session data
 *
 * @param { object } userData - User account data
 */
export const setUserData = (userData) => {
    if (userData.mariner.address) {
        const countryCode = userData.mariner.address.country;

      if (typeof document !== 'undefined') {
		  document.cookie = `countryCode=${countryCode};path=/`;
	  }   
		
    }
    SessionStorage.setItem(USER_DATA, userData);
};

/**
 * updateFavourites - Updates favourites to cookie
 *
 * @param { object } userData - User account data
 */
export const updateFavourites = (userData) => {
    if (!userData) {
        return;
    }
    const { mariner } = userData;

    if (mariner && mariner.favorites) {
        for (let idx in mariner.favorites) {
            if (mariner.favorites[idx].type === 'SHORE-X') {
                cookie.addTo('favoriteShoreX', mariner.favorites[idx].id1, 365);
            } else if (mariner.favorites[idx].type === 'CRUISE') {
                cookie.addTo('favorites', mariner.favorites[idx].id1, 365);
            }
        }
    }
};

/**
 * updateFavouritesToServer - Updates favourites to server
 *
 * @param { object } userData - User account data
 *
 * @returns {object} - returns promise object
 */
// export const updateFavouritesToServer = (userData) => {
//     if (!userData) {
//         return;
//     }
//     const { mariner, urls, headers } = userData,
//         loginToken = getLoginToken(),
//         requestHeader = { ...headers, 'Content-Type': 'application/json', 'sessionToken': loginToken },
//         shoreXCookie = cookie.get('favoriteShoreX'),
//         cruiseCookie = cookie.get('favorites');

//     let favoritesArray = [];

//     if (mariner && mariner.favorites) {
//         for (let idx in shoreXCookie) {

//             let filterById = mariner.favorites.filter(item => (item.type === 'SHORE-X' && item.id1 === shoreXCookie[idx]));

//             if (!filterById.length) {

//                 let tempObj = {
//                     'id1': shoreXCookie[idx],
//                     'type': 'SHORE-X',
//                     'action': 'add'
//                 };

//                 favoritesArray.push(tempObj);
//             }
//         }

//         for (let idx in cruiseCookie) {

//             let filterById = mariner.favorites.filter(item => (item.type === 'CRUISE' && item.id1 === cruiseCookie[idx]));

//             if (!filterById.length) {

//                 let tempObj = {
//                     'id1': cruiseCookie[idx],
//                     'type': 'CRUISE',
//                     'action': 'add'
//                 };

//                 favoritesArray.push(tempObj);
//             }
//         }

//         if ( favoritesArray && favoritesArray.length ) {
//             let requestBody = {
//                 'emailAddress': mariner.emailAddress,
//                 'favorites': favoritesArray
//             };

//             return new Promise((resolve, reject) => {
//                 fetch(urls.favouritesAPI, {
//                     method: 'POST',
//                     body: JSON.stringify(requestBody),
//                     headers: requestHeader
//                 }).then(response => {
//                     resolve(response);
//                 });
//             });
//         }
//         else {

//             return new Promise((resolve, reject) => {

//                 resolve({});
//             });
//         }

//     }
// };

/**
 * getUserData - Returns user account data from session if present
 *
 * @returns {object} login token with type and key name
 */
export const getUserData = () => {
    return SessionStorage.getItem(USER_DATA);
};

/**
 * needsSalutation - Returns if user label needs salutation
 *
 * @returns {Boolean} salutation needed
 */
export const needsSalutation = () => {
    let userData;

    if (validateSession.checkSession(['userData'])) {
        userData = SessionStorage.getItem(USER_DATA);
    }

    if (userData) {
        let brand = userData.brandCode.toLowerCase();
        let country = userData.lang;
        return brand === 'cunard' && country === 'de_DE' ? true : false;
    } else {
        return false;
    }
};

/**
 * getUserLabel - Returns user label from session if present
 *
 * @returns {String} login token with type and key name
 */
export const getUserLabel = () => {
    let userData, label;

    if (validateSession.checkSession(['userData'])) {
        userData = SessionStorage.getItem(USER_DATA);
    }

    if (userData) {
        const {
            lang,
            brandCode,
            customer: { title, firstName, genderText, lastName }
        } = userData;

        if (title === 'SIR' || title === 'DAME') {
            label = ` ${title} ${firstName}`;
        } else {
            switch (brandCode.toLowerCase()) {
                case 'po':
                    label = firstName;
                    break;

                case 'cunard':
                    if (lang === 'de_DE') {
                        label = ` ${genderText} ${title} ${lastName}`;
                    } else {
                        label = ` ${title} ${firstName} ${lastName}`;
                    }
                    break;
            }
        }
    }

    return label;
};

/**
 * getDataForApi - Returns login data to be sent to api from session
 *
 * @returns {object} login data with headers and body
 */
// export const getDataForApi = () => {

//     let data = {};

//     const token = getLoginToken();

//     const marinerLevel = getMarinerLevel();

//     if ( token && token.length ) {

//         data[ 'sessionToken' ] = token;
//     }

//     data[ 'loyaltyNumber' ] = marinerLevel;

//     return data;
// };

/**
 * clearLoginData - Clears login data from session Storage
 *
 */
export const clearLoginData = () => {
    const locale = getConfig('locale', '');
    const header = SessionStorage.getItem('header');
    const { bookingRef, customer } = header;
    SessionStorage.removeItem(USER_DATA);
    SessionStorage.removeItem('header');
    SessionStorage.removeItem('orderedList');
    SessionStorage.removeItem('portCalls');
    SessionStorage.removeItem('labelShorex');
    // SessionStorage.removeItem(AUTH_TOKEN);
    const encryptedDataForETicket = localStorage.getItem(
        'encryptedDataForETicket'
    )
        ? JSON.parse(localStorage.getItem('encryptedDataForETicket'))
        : {};
    delete encryptedDataForETicket[
        `${locale}_${bookingRef}_${customer.firstName}_${customer.lastName}`
    ];
    localStorage.setItem(
        'encryptedDataForETicket',
        JSON.stringify(encryptedDataForETicket)
    );
    const encryptedDataForLuggageLabel = localStorage.getItem(
        'encryptedDataForLuggageLabel'
    )
        ? JSON.parse(localStorage.getItem('encryptedDataForLuggageLabel'))
        : {};
    delete encryptedDataForLuggageLabel[
        `${locale}_${bookingRef}_${customer.firstName}_${customer.lastName}`
    ];
    localStorage.setItem(
        'encryptedDataForLuggageLabel',
        JSON.stringify(encryptedDataForLuggageLabel)
    );
};

/**
 * getPropertyFromUserData - Returns data associated with the passed key from user data in session
 *
 * @param { String } keyName - Key of the value required
 *
 * @returns {String} Mariner Id
 */
const getPropertyFromUserData = (keyName) => {
    let propertyValue = '';
    const userData = getUserData();

    if (userData && userData.mariner && userData.mariner[keyName]) {
        propertyValue = userData.mariner[keyName];
    }

    return propertyValue;
};

/**
 * getMarinerLevel - Returns mariner level from session
 *
 * @returns {String} Mariner level
 */
export const getMarinerLevel = () => {
    return getPropertyFromUserData('marinerLevel');
};

/**
 * getMarinerId - Returns mariner id from session
 *
 * @returns {String} Mariner Id
 */
export const getMarinerId = () => {
    return getPropertyFromUserData('marinerId');
};

/**
 * getCampaignId - Returns mariner id from session
 *
 * @returns {String} Campaign Id
 */
export const getCampaignId = () => {
    return getPropertyFromUserData('campaignIds');
};

/** getPaxNumber - Returns Pax Number of logged person
 *
 * @returns {String} Pax Number
 */
export const getPaxNumber = () => {
    let propertyValue = '';
    const userData = getUserData();

    if (userData && userData.customer) {
        propertyValue = userData.customer['paxNumber'];
    }

    return propertyValue;
};

export default {
    isLoggedIn,
    setUserData,
    getUserData,
    needsSalutation,
    getUserLabel,
    clearLoginData,
    getMarinerId,
    getCampaignId,
    getMarinerLevel,
    getPaxNumber
};
