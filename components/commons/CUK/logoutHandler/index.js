'use strict';

// import sessionStorage from '../session-storage';
// import oneStepLogout from '../oneStepLogout';
import { clearLoginData } from '../login-data-utility';

/**
 * directLogOut - clears user login data from sessionStorage and redirect to login page
 * @param {object}  redirectLink  - link for redirect
 */
const directLogOut = (redirectLink) => {
    // let { logoutAPIUrl, headers, postLogout } = logoutOptions;

    // oneStepLogout(logoutAPIUrl, headers).then(response => {

    //     cookie.delete('countryCode');
    //     postLogout(response);
    // }).catch(err => {
    //     console.log(err);
    // });
    clearLoginData();

    // redirect to loginPage
    window.location.href = redirectLink;
};

/**
 * handleLogOut - Logs the user out
 */
// const handleLogOut = () => {

//     const { urls, headers } = this.props.services;
//     const logoutOptions = {
//         logoutAPIUrl: urls.logoutAPIUrl,
//         headers: headers,
//         postLogout: this.resolveLogoutApiData
//     };

//     this.setState({ loader: true }, () => {

//         const analyticsParams = {
//             linkText: this.props.logOutCTACopy,
//             componentName: this.props.component || 'login'
//         };

//         analytics.customClicks(analyticsParams);

//         logoutHandler(logoutOptions);
//     });
// }

/**
 * resolveLogoutApiData - receive data from API and clear session and reload the page
 * @param {object}  response  - data received from API
 */
// const resolveLogoutApiData = (response) => {

//     this.setState({ loader: false }, () => {
//         if (!response.errors.length) {
//             clearLoginData();

//             this.triggerPubSub();

//             location.reload();
//         }
//         else {
//             let errors = response.errors;

//             if (errors[0].code === '5025') {
//                 clearLoginData();

//                 this.triggerPubSub();

//                 location.reload();
//             }
//         }
//     });
// }

/**
 * casLogout - clears user login data and reloads page without any api calls
 * @param {object}  redirectLink  - link for redirect
 */
const casLogout = (redirectLink) => {
    // var loginMethod = sessionStorage.getItem('login-method');

    // clearLoginData();
    // window.sessionStorage.setItem('loginStatus', 'not-logged-in');
    // sessionStorage.removeItem('login-method');

    // cookie.delete('countryCode');

    // if ( loginMethod !== 'member-login' && window.loginConfig && window.loginConfig.ssoLogoutUrl ) {

    //     windowEncoded.location.href = `${ window.loginConfig.ssoLogoutUrl }&url=${ windowEncoded.location.href.split('?')[0] }`;
    // }
    // else {

    //     location.reload();
    // }
    clearLoginData();
    // redirect to loginPage
    window.location.href = redirectLink;
};

/**
 * handleLogOut - decides the appropriate logout functionality
 * @param {object}  redirectLink  - link for redirect
 */
const logoutHandler = (redirectLink) => {
    !window.loginConfig || !window.loginConfig.loginMethod === 'CAS'
        ? directLogOut(redirectLink)
        : casLogout(redirectLink);
};

export default logoutHandler;
