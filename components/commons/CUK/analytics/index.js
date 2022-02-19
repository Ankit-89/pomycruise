/* eslint no-underscore-dangle: ["error", { "allow": ["_satellite"] }] */

'use strict';

import ReactDOM from 'react-dom';
import cookie from '../cookie';
import { isLoggedIn, getUserData } from '../login-data-utility';
import { getCurrencyData } from '../currencyFormat';
import moment from 'moment';

/** -- Exemption list of attributes that won't be formatted ( camel cased ) -- **/
// const exemptedAttributes = [
//     'localDayTime',
//     'bookingType',
//     'destName',
//     'depPortName',
//     'durationDays',
//     'searchSelections',
//     'destPortName',
//     'event',
//     'customCurrencyCode',
//     'KnownSts',
//     'userSegmentOne',
//     'userSegmentTwo',
//     'country',
//     'loginStatus',
//     'product',
//     'landTourID',
//     'voyageID',
//     'cruiseDateFrom',
//     'deckLocation',
//     'merchEvars',
//     'filterCategorySel',
//     'server',
//     'pageURL'
// ];

const exemptedAttributes = [];

/**
 * markupLinkTracking - For handling Analytics(on anchor) present in modal Text which we get as rich text from backend
 * @param  {object} e is event object used for getting selected target value
 * @param  {string} componentName represents the component under which this link is tracked
 */
const markupLinkTracking = (e, componentName) => {
    //console.log('inside markupLinkTracking of analytics index js file... ', e, componentName);
    if (e.target.nodeName === 'A') {
        const analyticsParams = {
            linkText: e.target.textContent,
            componentName: componentName || ''
        };

        customClicks(analyticsParams);
    }
};

/**
 * bookingType - Gives booking country code in particular format
 *
 * @returns {string} formatted booking country
 */
const bookingType = () => {
    //console.log('inside bookingType of analytics index js file... ', cookie.get('countryCode'));
    const country = cookie.get('countryCode');

    if (typeof country[0] !== 'undefined') {
        return `direct-${country[0].toLocaleLowerCase()}`;
    } else {
        return '';
    }
};

/**
 * getCamelCasedText - Converts a string to camelCased format
 *
 * @param { string } str any provided string
 * @returns {string} camelCased string
 */
const getCamelCasedText = (str) => {
    //console.log('inside getCamelCasedText of analytics index js file... ', str);
    if (str) {
        // str = str.toLowerCase();
        let convertedText = str
            .replace(/\s(.)/g, function($1) {
                return $1.toUpperCase();
            })
            .replace(/\s/g, '')
            .replace(/^(.)/, function($1) {
                return $1.toLowerCase();
            });

        return str.toLowerCase();
    }
};

/**
 * handleSpecials - Replaces white spaces and special character with camel case
 *
 * @param { string } content any provided string
 * @returns {string} replaced string
 * Checking wheather the string needs to be camel cased
 * Conditions :
 * input string is a single word ( input string doesn't have any spaces, '-' and '_' )
 * input string is not CAPITAL
 * first charecter of input string is not Capital
 */
const handleSpecials = (content) => {
   // console.log('inside handleSpecials of analytics index js file... ', content);
    /* -- In case of undefined content it's beeing converted to empty string --*/
    if (typeof content === 'undefined') {
        return '';
    } else if (typeof content === 'string') {

        return content.toLowerCase();  //    this is not handling any special chracter

        let isSingleWord =
            content.indexOf(' ') === -1 &&
            content.indexOf('-') === -1 &&
            content.indexOf('_') === -1;

        let isNotUppercased = content !== content.toUpperCase();

        let isFirstLetterNotCapital =
            content.charAt(0) !== content.charAt(0).toUpperCase();

        if (isSingleWord && isNotUppercased && isFirstLetterNotCapital) {
            return content;
        } else {
            content = content
                .split(':')
                .map((str, index) => {
                    str = str.trim();

                    return str;
                })
                .join(':');

            let txt = getCamelCasedText(content);

            txt =
                txt !== undefined
                    ? txt.replace(/[-",\[\]\(\)\.\?&;']/g, '')
                    : '';

            return txt;
        }
    } else {
        /* ---- For numbers and data types other than string ----*/
        return content;
    }
};

/**
 * getFormattedAttributes - converts attributes to camel cased format
 *
 * @param { object } attributesObj any provided object
 * @returns {object} with converted strings
 */
const getFormattedAttributes = (attributesObj) => {
    //console.log('inside getFormattedAttributes of analytics index js file... ', attributesObj);
    let formattedAttributes = {};

    for (let key in attributesObj) {
        if (typeof attributesObj[key] !== 'object') {
            /* --- Checking wheather the key is exempted from formatting ---*/
            let isExemptedAttribute = exemptedAttributes.indexOf(key) > -1;
            let newObj = {
                [key]: isExemptedAttribute
                    ? attributesObj[key]
                    : handleSpecials(attributesObj[key])
            };

            formattedAttributes = Object.assign(formattedAttributes, newObj);
        } else if (
            attributesObj[key] &&
            attributesObj[key].constructor === Array
        ) {
            /* ---- If the attribute is an array ---- */

            let newObj = {
                [key]: []
            };
            let attributesArray = attributesObj[key];

            for (let index in attributesArray) {
                /* -- for all the string elements it will directly convert -- */

                if (typeof attributesArray[index] !== 'object') {
                    newObj[key][index] = handleSpecials(attributesArray[index]);
                } else {
                    /* -- for all elements whose type is object it will call getFormattedAttributes -- */
                    newObj[key][index] = getFormattedAttributes(
                        attributesArray[index]
                    );
                }
            }

            formattedAttributes = Object.assign(formattedAttributes, newObj);
        } else {
            /* --- Converts the strings present in sub objects ---*/
            let formattedObj = {};

            formattedObj[key] = getFormattedAttributes(attributesObj[key]);
            formattedAttributes = Object.assign(
                formattedAttributes,
                formattedObj
            );
        }
    }

    return formattedAttributes;
};

/**
 * formatDate - Format the date into general date format
 *
 * @param { string } data any provided string
 * @returns {string} formatted date eg:(Aug062017)
 */
const formatDate = (data) => {
    //console.log('inside formateDate of analytics index js file... ', data);
    if (data !== undefined && data !== null && data !== '') {
        let newDate = '';
        let dateList = '';
        let dateFormat = 'MMDDYY';
        let locale = 'en_US';

        if (
            typeof window !== 'undefined' &&
            window.configs &&
            window.configs.locale
        ) {
            locale = window.configs.locale;
        }

        moment.locale(locale);

        if (typeof data === 'string') {
            data = [data];
        }
        for (var date in data) {
            dateList = moment(data[date]).format(dateFormat);

            if (newDate !== '') {
                dateList = handleSpecials(dateList);
                newDate.push(dateList);
            } else {
                newDate = [handleSpecials(dateList)];
            }
        }

        return newDate;
    } else {
        return '';
    }
};

const createData = (dataset) => {
   // console.log('inside createData of analytics index js file... ', dataset);
    return {
        linkType: dataset.linktype || 'o',
        linkText: dataset.linktext,
        linkPageName:
            typeof window.configs !== 'undefined'
                ? window.configs.pageName || ''
                : '',
        componentName: dataset.componentname || ''
    };
};

const imageData = (dataset) => {
   // console.log('inside imageData of analytics index js file... ', dataset);
    if (dataset.contentname || dataset.contenttype) {
        let contentName = dataset.contentname;

        if (dataset.contenttype) {
            return {
                contentType: dataset.contenttype,
                contentName
            };
        } else {
            return {
                contentName
            };
        }
    }

    return {};
};

const analyticsClickHandler = (event) => {
   // console.log('inside analyticsHandler of analytics index js file... ', event);
    let dataset = event.currentTarget.dataset,
        clickTracking = {},
        objCommon = createData(dataset),
        objImage = imageData(dataset);

    clickTracking = Object.assign({}, objCommon, objImage);
    window.dtm_digitalData.clickTracking = getFormattedAttributes(
        clickTracking
    );

    if (
        dataset.componentname === 'fullBleedImageAccordion' ||
        dataset.componentname === 'fullBleedOnboardActivities' ||
        dataset.componentname === 'shipAccordion'
    ) {
        let destName =
            event.currentTarget.children[1] !== undefined &&
            event.currentTarget.children[1].innerText.trim();

        if (destName !== false && typeof destName === 'string') {
            let destNameArray = destName.split(' '),
                destNameCamelCased = '';

            if (destNameArray.length > 0) {
                for (var i = 0; i < destNameArray.length; i++) {
                    destNameCamelCased += destNameArray[i];
                }
            }
            if (
                dataset.componentname === 'fullBleedImageAccordion' ||
                dataset.componentname === 'fullBleedOnboardActivities'
            ) {
                window.dtm_digitalData.clickTracking[
                    'destName'
                ] = destNameCamelCased;
            } else {
                window.dtm_digitalData.clickTracking[
                    'shipName'
                ] = destNameCamelCased;
            }
        }
    }

    try {
        window._satellite.track('linkTrack');
    } catch (e) {
        // console.error('analytics tracking failed');
    }
};

/**
 * clickTracking - Initializes clicks for elements has analytics attributes
 *
 * @param { object } comp component instance
 */
const clickTracking = (comp) => {
    if (typeof window._satellite === 'object') {
        let component = ReactDOM.findDOMNode(comp);

        let elements = component
            ? component.querySelectorAll('[data-linktext]')
            : [];

        for (let i = 0; i < elements.length; i++) {
            if (!elements[i].dataset.isClickTrackingEnabled) {
                if (!elements[i].dataset.componentname) {
                    elements[i].dataset.componentname = comp.props.component;
                }

                elements[i].dataset.isClickTrackingEnabled = true;
                elements[i].addEventListener('click', analyticsClickHandler);
            }
        }
    }
};

/**
 * setAdditionalPageTrackAttributes - Tracks component on load
 *
 * @param { object } obj object to be pushed to dtm_data }
 * @param { string } satelliteArg argument to _satellite method }
 */
const setAdditionalPageTrackAttributes = (obj) => {
   // console.log('inside setAdditionalPageTrackAttributes of analytics index js file... ', obj);
    if (
        typeof window !== 'undefined' &&
        typeof window._satellite === 'object' &&
        typeof window.configs !== 'undefined'
    ) {
        // const arg = satelliteArg ? satelliteArg : window.configs.pageName;
        for (let key in obj) {
            if (typeof obj[key] !== 'object') {
                let newObj = {
                    [key]: obj[key]
                };

                window.dtm_digitalData.general = Object.assign(
                    window.dtm_digitalData.general,
                    newObj
                );
                delete obj[key];
            }
        }

        window.dtm_digitalData.general = Object.assign(
            window.dtm_digitalData.general,
            obj
        );
        window.dtm_digitalData = getFormattedAttributes(window.dtm_digitalData);
    }
};

/**
 * overlayLoad - Tracks on overlay load
 *
 * @param { string } satelliteArg passed to _satellite method }
 * @param { object } overrideObj object to be pushed to dtm_data }
 */
const overlayLoad = (satelliteArg, overrideObj) => {
   // console.log('inside overlayLoad of analytics index js file.. ', satelliteArg, overrideObj);
    if (
        typeof window !== 'undefined' &&
        typeof window._satellite === 'object' &&
        typeof window.configs !== 'undefined'
    ) {
        const arg = satelliteArg ? satelliteArg : 'screenLoad';
        const windowDtmData = window.dtm_digitalData.general;
        const defaults = {
            country: windowDtmData.country || '',
            hostName: windowDtmData.host || '',
            sectionLevelOne: windowDtmData.sectionLevelOne || '',
            sectionLevelTwo: windowDtmData.sectionLevelTwo || '',
            sectionLevelThree: windowDtmData.sectionLevelThree || '',
            sectionLevelFour: windowDtmData.sectionLevelFour || '',
            pageDescription: windowDtmData.pageDescription || '',
            pageName: windowDtmData.pageName || '',
            pageChannel: windowDtmData.pageChannel || '',
            pageHier: windowDtmData.pageHier || '',
            pageType: 'overlay'
        };

        const tempObject =
            typeof overrideObj === 'object'
                ? Object.assign(defaults, overrideObj)
                : defaults;

        window.dtm_digitalData.general = tempObject;
        //console.log(window.dtm_digitalData.general);
        try {
            window._satellite.track(arg);
        } catch (e) {
            // console.error('analytics tracking failed');
        }
    }
};

/**
 * customClicks - For specific clicks which additional props to be sent
 *
 * @param { object } obj to be pushed to dtm_data }
 * @param { string } satelliteArg passed to _satellite method }
 */
const customClicks = (obj, satelliteArg) => {
   // console.log('inside customClicks of analytics index js file.. ', obj, satelliteArg);
    if (
        typeof window !== 'undefined' &&
        typeof window._satellite === 'object' &&
        typeof window.configs !== 'undefined'
    ) {
        let clickTracking;

        const arg = satelliteArg ? satelliteArg : 'linkTrack';

        const defaults = {
            linkType: 'o',
            linkPageName: window.configs.pageName || ''
        };

        clickTracking = Object.assign({}, defaults, obj);

        window.dtm_digitalData.clickTracking = getFormattedAttributes(
            clickTracking
        );

        try {
            window._satellite.track(arg);
        } catch (e) {
            // console.error('analytics tracking failed');
        }
    }
};

/**
 * updateLoginData - update page level analytics if logged in
 */
const updateLoginData = () => {
    // if ( isLoggedIn() ) {
    //     const userData = getUserData();
    //     if ( userData.mariner && window.dtm_digitalData ) {
    //         window.dtm_digitalData.general.marinerID = userData.mariner.marinerId ? userData.mariner.marinerId : '';
    //         window.dtm_digitalData.general.loginStatus = 'loggedin';
    //         window.dtm_digitalData.general.KnownSts = 'known';
    //         window.dtm_digitalData.general.memberLoyaltyLevel = userData.mariner.marinerLevel ? userData.mariner.marinerLevel : '';
    //     }
    // }
};
/**
 * lastVisitTime - update page level analytics if logged in
 * @returns {string} - returns time in MM/YYYY format
 */
const lastVisitTime = () => {
   // console.log('inside lastVisitTime of analytics index js file...');
    let today = new Date();

    const localoffset = -(today.getTimezoneOffset() / 60),
        destoffset = -7,
        offset = destoffset - localoffset;

    today = new Date(new Date().getTime() + offset * 3600 * 1000);

    let dd = today.getDate(),
        mm = today.getMonth() + 1, // January is 0!
        yyyy = today.getFullYear();

    if (dd < 10) {
        dd = `0${dd}`;
    }
    if (mm < 10) {
        mm = `0${mm}`;
    }
    today = `${mm}/${yyyy}`;

    return today;
};

/**
 * analyticsPageTrack - For sending props on page load
 */
const analyticsPageTrack = () => {
    //console.log('inside analyticsPageTrack function of analytics index js file...');
    if (
        typeof window._satellite === 'object' &&
        typeof window.configs !== 'undefined'
    ) {
        // eslint-disable-line no-underscore-dangle
        window.dtm_digitalData.general.customCurrencyCode = getCurrencyData()
            .currencyCode
            ? getCurrencyData().currencyCode.toUpperCase()
            : '';
        window.dtm_digitalData.general.lastVisit = lastVisitTime();
        window.dtm_digitalData.general = getFormattedAttributes(
            window.dtm_digitalData.general
        );
        Object.assign(window.dtm_digitalData.general, { localDayTime: Date() });
        setTimeout(() => {
            window._satellite.track(window.configs.template); // eslint-disable-line no-underscore-dangle
        }, 2500);
    }
};

const analyticsAjaxCallTrack = (obj) => {
   // console.log('inside analyticsAjaxCallTrack function of analytics index js file...');
    if (
        typeof window._satellite === 'object' &&
        typeof window.configs !== 'undefined'
    ) {
        // eslint-disable-line no-underscore-dangle
        window.dtm_digitalData.general = getFormattedAttributes(
            window.dtm_digitalData.general
        );
        Object.assign(window.dtm_digitalData.general, obj);
        window._satellite.track('screenLoad'); // eslint-disable-line no-underscore-dangle
    }
};

export default {
    clickTracking,
    setAdditionalPageTrackAttributes,
    updateLoginData,
    overlayLoad,
    customClicks,
    analyticsPageTrack,
    handleSpecials,
    formatDate,
    bookingType,
    markupLinkTracking,
    getCamelCasedText,
    analyticsAjaxCallTrack
};
