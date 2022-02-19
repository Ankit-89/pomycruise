/**
 * NOTE:
 * Since every test runs in its own environment, these scripts will be executed
 * in the testing environment immediately before executing the test code itself.
 *
 * This code will execute before ./jest.setup.tests.js
 */

/**
 * Setup Enzyme Adapter
 */
const { configure } = require('enzyme');
const Adapter = require('enzyme-adapter-react-15');

configure({ adapter: new Adapter() });

/**
 * Setup Mock Implementations (Fetch, SessionStorage, etc)
 */
const mocksGlobalSetup = require('./testConfig/mocks/mocksGlobalSetup');

mocksGlobalSetup();

/**
 * Global Data Setup - Set 'PO' brand as default for Platform Repository.
 */
window.configs = {
    searchResultsUrl: '/template/homePage',
    destinationFilter: '{!tag=disembarkTag}disembarkPortCode=S',
    brand: `po`,
    currencyMap: { EUR: '$', defaultValue: '$', USD: '$' },
    template: 'template',
    locale: 'en_GB',
    shipCode: 'AU',
    currencyLocale: 'en_US',
    taxCurrencyCodes: 'USD',
    legalServiceUrl: '/proxy/en_US/legal-information.legalContent.json',
    countryCodes: 'en,gb,at,ex',
    agencyId: '05128',
    apikeyMycruise: 'OqEqLqWO6wpQfNtVyPVA291m2SssinP1',
    cruiseId: '',
    productId: 'MEDI_SPA',
    cartUrl: '/template/shoppingCartMycruisePage',
    ordersUrl: '/template/myOrdersPage',
    homepageUrl: '/template/homePage',
    shorexListingUrl: '/template/shorexListingMycruisePage',
    confirmationPageUrl: '/template/confirmationMycruisePage',
    itineraryId: '',
    globalXdays: 3,
    accessibilitySeletedLabel: ' Selected',
    disableAnalyticsCookieId: 'disableAnalyticsCookie',
    disablePerfCookieId: 'disablePerfCookie',
    enableAudioDescription: true,
    urlPrefix: '/content/',
    eventType: 'COOKERY',
    beforeYouSailUrl: 'http://localhost:3033/template/beforeYouSailPage',
    diningLandingUrl:
        'http://localhost:3033/template/diningListingMycruisePage',

    minAdultAge: 18,
    countriesWithCurrency: {
        default: {
            currencyCode: 'USD',
            currencySymbol: '$'
        },
        AU: {
            currencyCode: 'AUD',
            currencySymbol: '$'
        },
        GB: {
            currencyCode: 'GBP',
            currencySymbol: '£'
        }
    },
    countriesHomepage: {
        en_GB: '/template/homePage',
        en_AU: '/en_AU/template/homePage',
        default: '/template/homePage'
    },
    jsLibsPath: '/etc/designs/carnival/po/postbooking/js/',
    countryOverride: true,
    marketHeader: 'UK',
    passportMonthsValidation: 6
};

window.SR = {};
global.windowEncoded = window;
