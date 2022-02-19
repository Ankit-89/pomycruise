/*
 * Utilities Module
 *
 */
'use strict';

import cookie from '../cookie';
// import animatedScroll from '../animatedScroll';
import FetchData from '../fetch-data';
import SessionStorage from '../session-storage';
import validateSession from '../validateSession';
import moment from 'moment';

/**
 * getConfig - Get Property from config
 * @param {*} key
 * @returns {string} propertyValue
 */

const getConfig = (key, fallbackVal) =>
    typeof window !== 'undefined' ? window.configs[key] : fallbackVal;

/**
 * getUserLocale - Get Locale from config
 * @returns {string} userlocale
 */
const getUserLocale = () => {
    return typeof window !== 'undefined'
        ? window.configs && window.configs.locale
        : '';
};

/**
 * getCountryCode - Get countryCode from cookie
 * @returns {string} contryCode
 */
const getCountryCode = () => {
    return cookie.get('countryCode')[0] || 'default';
};
/**
 * getFavorites - Get favorites from cookie
 * @returns {array} favorites
 */
const getFavorites = () => {
    return cookie.get('favorites');
};
/**
 * getUserType - Get getUserType from cookie
 * @returns {string} user
 */
const getUserType = () => {
    return cookie.get('tier')[0] || 'anonymous';
};
/**
 * isCookieDisabled - Check if cookies are disabled by the user
 * @returns {bool} status
 */
const isCookieDisabled = () => {
    if (window.configs && window.configs.disablePerfCookieId) {
        return cookie.get(window.configs.disablePerfCookieId)[0] === 'false';
    }

    return true;
};
/**
 * isCollectionEmpty
 * @param {object | array} collection -
 * @returns {boolean}
 */
const isCollectionEmpty = collection => {
    if (!collection) return true;

    return (Object.keys(collection).length === 0);
};

/**
 * getShipVersionIdFrServeletCall - Get ship version id from page url
 * @param  {string} url page url
 * @returns {string} version id
 */
const getShipVersionIdFrServeletCall = (url) => {
    return url
        .split('/')
        .pop()
        .split('.html')[0];
};

/**
 * Knuth shuffle
 * @param {Array} array to shuffle
 * @returns {Array}
 */
export const shuffleArray = (array) => {
    let shuffledArray = [...array],
        temp = null;

    for (let i = shuffledArray.length - 1, j = 0; i > 0; i -= 1) {
        j = Math.floor(Math.random() * (i + 1));
        temp = shuffledArray[i];
        shuffledArray[i] = shuffledArray[j];
        shuffledArray[j] = temp;
    }

    return shuffledArray;
};

const getCamelizeText = (str) => {
    return str.toLowerCase().replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());
};
const msieversion = () => {
    let ua = window.navigator.userAgent,
        msie = ua.indexOf('MSIE '),
        result = '';

    if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {
        result = ua.substring(msie + 5, ua.indexOf('.', msie));
    } else {
        result = -1;
    }

    return result;
};
const setBodyMargin = (isIncrement, alertContainerHeight) => {
    let headerMarginTop = 0;
    let bodyHeight;

    bodyHeight = Number(
        typeof document !== 'undefined' && document
            .getElementsByTagName('body')[0]
            .style.marginTop.replace('px', '')
    );
    headerMarginTop += alertContainerHeight * isIncrement;
    if (typeof document !== 'undefined')
	{
		document.getElementsByTagName('body')[0].style.marginTop = `${bodyHeight +
        headerMarginTop}px`;
	}
	
};

/**
 * getOffSet
 * @param {object} element - element to which it should scroll to
 * @param {object} scrollToElement - element which has scroll
 * @returns {number} offSet - offSet height of the element
 */
const getOffset = (element, scrollToElement) => {
    let offset = 0,
        node = element;

    scrollToElement = scrollToElement ? scrollToElement : window;
    if (scrollToElement) {
        while (node) {
            offset += node.offsetTop;
            node = node.offsetParent;
        }

        return offset;
    } else {
        return 0;
    }
};

/**
 * findFixedHeaderHeight - calculates the height of the header,alertMessaging, compagin LandingHeader
 * @returns {number} headerOffset
 */
// const findFixedHeaderHeight = () => {
//     /* Check the heights of the below elements and account for these when scrolling down the page */
//     const headersClassNameArray = [ 'alert-header-wrapper', 'campaign-header', 'search-results-header' ];
//     let headerOffset = 0;

//     headersClassNameArray.forEach((el) => {
//         const headerElement = document.getElementsByClassName(el);

//         if (headerElement[0]) {
//             headerOffset += headerElement[0].offsetHeight;
//         }
//     });

//     return headerOffset;
// };

/**
 * scrollToTop - To create the animatedScroll
 * @param {obejct} targetElement - element that it should scroll back to
 * @param {obejct} scrollableElement - element that has scroll
 * @param {obejct} customMove - move to particular position from top
 */
const scrollToTop = (targetElement, scrollableElement, customMove = 0) => {
    // const componentPosition = getOffset(targetElement);
    // const headerOffset = findFixedHeaderHeight();
    // const offset = componentPosition + 10 + customMove - headerOffset;
    // animatedScroll(offset, 500, scrollableElement);
};

/**
 * background image - To apply style
 * @param {obejct} img - img parameter
 * @returns {number} style
 */
const renderBgStyle = (img) => {
    let style = {};

    if (typeof img === 'undefined' || img.trim() === '') {
        style = {
            background: ''
        };
    } else {
        let bgImg = encodeURI(img.trim());

        style = {
            backgroundImage: `url(${bgImg})`
        };
    }

    return style;
};

/**
 * Clean AEM PATH - removes /content/master/ in the URL
 * @param {string} val - path to be cleaned up
 * @param {string} str - pattern to be replaced
 * @returns {object}
 */
const cleanURL = (val) => {
    const pattern =
        typeof window !== 'undefined' && window.configs
            ? window.configs.urlPrefix
            : '';

    if (pattern !== '' && val && val !== '' && val.indexOf(pattern) > -1) {
        val = val.replace(pattern, '');
    }

    return val;
};

/**
 * daysToDeparture - calculate how many days left to departure day
 * @param {string} dateOfEmbarkation - embarkation day
 * @returns {number}
 */
const daysToDeparture = (dateOfEmbarkation) => {
    let dayOfCruiseDeparture, dayToCruiseDeparture;
    let today, oneDay, parts;

    dayOfCruiseDeparture = dateOfEmbarkation;
    parts = dayOfCruiseDeparture.split('/');
    dayOfCruiseDeparture = new Date(parts[2], parts[0] - 1, parts[1]);
    today = new Date();
    oneDay = 1000 * 60 * 60 * 24;
    dayToCruiseDeparture = Math.round(
        (dayOfCruiseDeparture.getTime() - today.getTime()) / oneDay
    );

    return dayToCruiseDeparture;
};

// @example af8a8416-6e18-a307-bd9c-f2c947bbb3aa --> 32
// XTVPGP --> 6
// 1529492232886 --> 13
// 1 --> 1
// nome --> dipende
//5b2a6f1e-sall-MDQx-1bdf-8000

// _p8(s) {
//     var p = (Math.random().toString(16)+"000000000").substr(2,8);
//     return s ? "-" + p.substr(0,4) + "-" + p.substr(4,4) : p ;
// }

const generateUniqueCode = (param2, param3, param4) => {
    // a - unix timestamp
    var time = Math.round(new Date().getTime());

    // b - booking reference
    var booking = window.btoa(param2.toString());

    // c - seq number / name
    var number = window.btoa(param3.toString());

    // d - birthdate
    var birthdate = param4.toString();

    // e - url
    var href = window.location.href;

    href = (href.length * href.length * href.length * 100000000000)
        .toString(16)
        .substring(0, 12);
    let str = `${time}${booking}${number}${birthdate}${href}`;
    var parts = [];

    parts.push(str.slice(0, 8));
    parts.push(str.slice(8, 12));
    parts.push(str.slice(12, 16));
    parts.push(str.slice(16, 20));
    parts.push(str.slice(20, 32));

    var GUID = parts.join('-');

    return GUID;
};
const cloneData = (o) => {
    let output, v, key;

    output = Array.isArray(o) ? [] : {};
    for (key in o) {
        v = o[key];
        output[key] = typeof v === 'object' ? cloneData(v) : v;
    }

    return output;
};

const redirectToCorrectShip = () => {
    if (
        validateSession.checkCookie(['wcmmode']) ||
        validateSession.checkSession(['userData'])
    ) {
        if (sessionStorage.getItem('redirectPageUrl')) {
            sessionStorage.removeItem('redirectPageUrl')
        }
        const shipUrl = getConfig('shipCode', '');
        const shipUser = validateSession.checkCookie(['wcmmode'])
            ? ''
            : SessionStorage.getItem('userData').shipCode;
        if (
            shipUrl === shipUser ||
            validateSession.checkCookie(['wcmmode']) ||
            process.env.NODE_ENV === 'development'
        ) {
            return false;
        } else {
            const urlHomepage = getConfig('homepageUrl', '');
            window.location.href = urlHomepage.replace('{shipCode}', shipUser);
        }
    } else {
        if (typeof window !== 'undefined') {
            const url = refineRedirectedURL(window.location.href, true);
            SessionStorage.setItem('redirectPageUrl', window.location.href);
            window.location.href = window.configs.mycruiseLoginPageUrl.includes('/mycruise/login') ? window.configs.mycruiseLoginPageUrl : `${window.configs.mycruiseLoginPageUrl}/mycruise/login`;
        }
    }
};

const checkForTheCorrectMarket = (data) => {
    if (data) {
        const locale = data ? data.locale : '';
        const redirectPageUrlValue = sessionStorage.getItem('redirectPageUrl');
        const marketArr = ['en-gb', 'en-au', 'en-us', 'de-de'];
        if (redirectPageUrlValue) {
            const redirectPageUrl = redirectPageUrlValue.split('/');
            let currentMarket = 'en_gb';
            let flag = false;
            marketArr.forEach((singleMarket) => {
                if (redirectPageUrl.indexOf(singleMarket) > -1) {
                    currentMarket = singleMarket.replace('-', '_');
                }
            });
            if (currentMarket == locale.toLowerCase()) {
                flag = true;
            };
            return flag;
        } else {
            return true;
        }
    } else {
        return true;
    }
}

const checkForTheCorrectShip = (data) => {
    const redirectPageUrlValue = sessionStorage.getItem('redirectPageUrl');
    if (data) {
        if (redirectPageUrlValue) {
            let flag = false;
            let insideURLShipCodeFlag = false;
            let ifPossibleValueChanged = false;
            const isRefineRedirectedURLReqiured =
                redirectPageUrlValue.indexOf('?') !== -1;
            const cruiseCode = data.cruise.cruiseItinerary.sailingID.$;
            const shipCode = data.cruise.ship.code.$;
            const redirectPageUrl = redirectPageUrlValue.split('/');
            if (redirectPageUrl.length > 1) {
                redirectPageUrl.forEach((singleValue) => {
                    if(!ifPossibleValueChanged && singleValue !== 'gifts' && singleValue.indexOf('-') < 0){
                        if (singleValue.length == 2 || singleValue.length == 4 || singleValue.length == 5) {
                            insideURLShipCodeFlag = true;
                            ifPossibleValueChanged = true;
                        }
                        if (
                            singleValue.toUpperCase() == cruiseCode &&
                            flag == false
                        ) {
                            const updatedPageURL = redirectPageUrlValue.replace(cruiseCode, shipCode);
                            sessionStorage.setItem(
                                'redirectPageUrl',
                                updatedPageURL
                            );
                            flag = true;
                            insideURLShipCodeFlag = true;
                            ifPossibleValueChanged = true;
                        } else if (
                            singleValue.toUpperCase() == shipCode &&
                            flag == false &&
                            singleValue.length == 2
                        ) {
                            flag = true;
                            insideURLShipCodeFlag = true;
                            ifPossibleValueChanged = true;
                        }
                    }
                });
                if (insideURLShipCodeFlag == false) {
                    let updatedPageURLWithShipCode = redirectPageUrlValue.replace('/mycruise/', `/mycruise/${shipCode}/`);
                    if (isRefineRedirectedURLReqiured) {
                        updatedPageURLWithShipCode = refineRedirectedURL(updatedPageURLWithShipCode, false);
                    }
                    sessionStorage.setItem(
                        'redirectPageUrl',
                        updatedPageURLWithShipCode
                    );
                    flag = true;
                }
                return flag;
            }
        } else {
            return true;
        }
    } else {
        return true;
    }
};

const refineRedirectedURL = (url, flag) => {
    let modifiedUrl = url;
    const isRefineRedirectedmodifiedUrlReqiured = url.indexOf('?') !== -1;
    if (flag == true) {
        sessionStorage.setItem('deepLinkedPageUrl', url);
    }
    if (isRefineRedirectedmodifiedUrlReqiured) {
        modifiedUrl = url.split('?');
        if (modifiedUrl.length) {
            if (modifiedUrl[0].indexOf('"') == 0) {
                modifiedUrl[0] = modifiedUrl[0].substring(1, modifiedUrl[0].length);
            }
            modifiedUrl = JSON.stringify(modifiedUrl[0]);
        }
    }
    return modifiedUrl;
};

const getToDoList = (toDoListApi) => {
    const apikeyMycruise = getConfig('apikeyMycruise', '');
    const userData = SessionStorage.getItem('userData');
    const leadPassenger = SessionStorage.getItem('leadPassenger');
    const {
        customer,
        bookingRef,
        cruiseCode,
        shipCode,
        companyCode,
        cabinNumber,
        embarkationCode,
        disembarkationCode
    } = userData;
    const { paxNumber, firstName, lastName } = customer;
    const paxNumbers = userData.passengers.reduce(
        (paxNumbers, pax) => [...paxNumbers, pax.paxNumber],
        []
    );
    const params = {
        firstName,
        lastName,
        bookingRef,
        paxNumber,
        leadPaxNumber: leadPassenger.paxNumber,
        paxNumberList: paxNumbers.toString(),
        cruiseCode,
        shipCode,
        companyCode,
        cabinNumber,
        embarkPierCode: embarkationCode,
        debarkPierCode: disembarkationCode
    };
    const getToDoListUrl = `${toDoListApi}/retrieve`;
    const url = new URL(getToDoListUrl, window.location.origin);
    Object.entries(params).forEach(([key, val]) =>
        url.searchParams.append(key, val)
    );

    return FetchData(url.href, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-Source-Identity-Token-0': apikeyMycruise
        }
    });
};
const updateToDoList = (toDoListApi, section, paxNumber) => {
    const userData = SessionStorage.getItem('userData');
    const {
        bookingRef,
        cruiseCode,
        shipCode,
        cabinNumber,
        companyCode,
        embarkationCode,
        disembarkationCode
    } = userData;

    const apikeyMycruise = getConfig('apikeyMycruise', '');
    const requestBody = {
        cruise: {
            cruiseCode: {
                $: cruiseCode
            },
            companyCode: {
                $: companyCode
            },
            shipCode: {
                $: shipCode
            },
            embarkPierCode: { $: embarkationCode },
            debarkPierCode: { $: disembarkationCode },
            cabinNumber,
            bookingRef,
            passengers: [
                {
                    paxNumber,
                    checklist: {
                        [section]: moment().format('YYYY-MM-DD hh:mm:ss.S')
                    }
                }
            ]
        }
    };
    const getToDoListUrl = `${toDoListApi}/amend`;

    return FetchData(getToDoListUrl, {
        method: 'PUT',
        body: JSON.stringify(requestBody),
        headers: {
            'Content-Type': 'application/json',
            'X-Source-Identity-Token-0': apikeyMycruise
        }
    });
};
const getPaxConcent = () => {
    const apikeyMycruise = getConfig('apikeyMycruise', '');
    const getPaxConsentUrl = getConfig('getPaxConsentUrl', '') || `${window.location.origin}/api-mc/v1/mc-passengerconsent/retrieve`;
    const userData = SessionStorage.getItem('userData');
    const { bookingRef, cruiseCode, shipCode, brandCode } = userData;
    const leadPassenger = SessionStorage.getItem('leadPassenger');
    const { paxNumber } = leadPassenger;
    const fetchUrl = `${getPaxConsentUrl}?bookingRef=${bookingRef}&brandCode=${brandCode}&shipCode=${shipCode}&cruiseCode=${cruiseCode}&leadPaxId=${paxNumber}`;

    return FetchData(fetchUrl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-Source-Identity-Token-0': apikeyMycruise
        }
    })
        .then((response) => {
            if (response.rs1 && response.rs1.length == 0) {
                return { "leadPaxId": [] };
            }
            return response;
        })
};

const convertValueToVaildDecimalPoint = (params) => {
    if (typeof params == 'number') {
        params = params.toFixed(2);
        params = parseFloat(params);
    }
    return params;
}

const callForPaymentMonitoring = (postData) => {
    const apikeyMycruise = getConfig('apikeyMycruise');
    const moniteringUrl = getConfig('paymentMonitoringAPIUrl');
    return FetchData(moniteringUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Source-Identity-Token-0': apikeyMycruise
        },
        body: JSON.stringify(postData)
    });
};

const sessionRedirectUrl = () => {
    window.location.href = window.configs.mycruiseLoginPageUrl.includes(
        '/mycruise/login'
    )
        ? window.configs.mycruiseLoginPageUrl
        : `${window.configs.mycruiseLoginPageUrl}/mycruise/login`;
};

const utilities = {
    getCountryCode,
    getUserType,
    getShipVersionIdFrServeletCall,
    getCamelizeText,
    scrollToTop,
    getOffset,
    renderBgStyle,
    isCookieDisabled,
    cleanURL,
    generateUniqueCode,
    cloneData,
    daysToDeparture,
    getConfig,
    redirectToCorrectShip,
    getToDoList,
    updateToDoList,
    getPaxConcent
};

export {
    daysToDeparture,
    getCountryCode,
    getUserType,
    getShipVersionIdFrServeletCall,
    getCamelizeText,
    msieversion,
    setBodyMargin,
    getUserLocale,
    getConfig,
    getFavorites,
    scrollToTop,
    getOffset,
    renderBgStyle,
    isCookieDisabled,
    cleanURL,
    generateUniqueCode,
    cloneData,
    redirectToCorrectShip,
    getToDoList,
    updateToDoList,
    isCollectionEmpty,
    getPaxConcent,
    checkForTheCorrectShip,
    checkForTheCorrectMarket,
    convertValueToVaildDecimalPoint,
    callForPaymentMonitoring,
    sessionRedirectUrl
};

export default utilities;
