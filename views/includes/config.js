module.exports = (brand, template, title) =>
    JSON.stringify({
        searchResultsUrl: '/template/homePage',
        destinationFilter: '{!tag=disembarkTag}disembarkPortCode=S',
        brand: `${brand}`,
        page: `/content/${brand}/master_website/`,
        pageName: `${brand}:en_US`,
        currencyMap: { EUR: '$', defaultValue: '$', USD: '$' },
        template: `${template}`,
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
        ships: {
            AU: {
                diningLanding:
                    'http://localhost:3033/template/diningListingMycruisePage',
                homePage: 'http://localhost:3033/template/homePage',
                entertainmentPath: '/template/entertainmentPage',
                beforeYouSailPath:
                    'http://localhost:3033/template/beforeYouSailPage'
            },
            BR: {
                diningLanding:
                    'http://localhost:3033/template/diningListingMycruisePage',
                homePage: 'http://localhost:3033/template/homePage',
                entertainmentPath:
                    'http://localhost:3033/template/entertainmentPage',
                beforeYouSailPath:
                    'http://localhost:3033/template/beforeYouSailPage'
            },
            OC: {
                diningLanding:
                    'http://localhost:3033/template/diningListingMycruisePage',
                homePage: 'http://localhost:3033/template/homePage',
                entertainmentPath: '/template/entertainmentPage',
                beforeYouSailPath:
                    'http://localhost:3033/template/beforeYouSailPage'
            },
            POC: {
                diningLanding:
                    'http://localhost:3033/template/diningListingMycruisePage',
                homePage: 'http://localhost:3033/template/homePage',
                entertainmentPath: '/template/entertainmentPage',
                beforeYouSailPath:
                    'http://localhost:3033/template/beforeYouSailPage'
            },
            '0002': {
                diningLanding:
                    'http://localhost:3033/template/diningListingMycruisePage',
                homePage: 'http://localhost:3033/template/homePage',
                entertainmentPath: '/template/entertainmentPage',
                spaLanding: 'http://localhost:3033/template/spaLandingPage',
                beforeYouSailPath: '/template/beforeYouSailPage'
            },
            VE: {
                diningLanding:
                    'http://localhost:3033/template/diningListingMycruisePage',
                homePage: 'http://localhost:3033/template/homePage',
                entertainmentPath: '/template/entertainmentPage',
                spaLanding: 'http://localhost:3033/template/spaLandingPage',
                beforeYouSailPath:
                    'http://localhost:3033/template/beforeYouSailPage'
            },
            pearl: {
                diningLanding:
                    'http://localhost:3033/template/diningListingMycruisePage',
                homePage: 'http://localhost:3033/template/homePage',
                entertainmentPath: '/template/entertainmentPage',
                spaLanding: 'path/spa/completo',
                beforeYouSailPath: '/template/beforeYouSailPage'
            }
        },
        minAdultAge: 18,
        countriesWithCurrency: {
            GG: {
                currencyCode: 'GBP',
                currencySymbol: '£'
            },
            DE: {
                currencyCode: 'EUR',
                currencySymbol: '€'
            },
            GI: {
                currencyCode: 'GBP',
                currencySymbol: '£'
            },
            IM: {
                currencyCode: 'GBP',
                currencySymbol: '£'
            },
            IN: {
                currencyCode: 'USD',
                currencySymbol: '$'
            },
            CN: {
                currencyCode: 'USD',
                currencySymbol: '$'
            },
            NZ: {
                currencyCode: 'AUD',
                currencySymbol: '$'
            },
            AR: {
                currencyCode: 'USD',
                currencySymbol: '$'
            },
            default: {
                currencyCode: 'USD',
                currencySymbol: '$'
            },
            AU: {
                currencyCode: 'AUD',
                currencySymbol: '$'
            },
            PG: {
                currencyCode: 'AUD',
                currencySymbol: '$'
            },
            NF: {
                currencyCode: 'AUD',
                currencySymbol: '$'
            },
            GB: {
                currencyCode: 'GBP',
                currencySymbol: '£'
            },
            JE: {
                currencyCode: 'GBP',
                currencySymbol: '£'
            },
            IE: {
                currencyCode: 'EUR',
                currencySymbol: '€'
            },
            US: {
                currencyCode: 'USD',
                currencySymbol: '$'
            },
            NL: {
                currencyCode: 'EUR',
                currencySymbol: '€'
            },
            CA: {
                currencyCode: 'CAD',
                currencySymbol: '$'
            }
        },
        countriesHomepage: {
            en_GB: '/template/homePage',
            de_DE: '/template/homePage',
            en_AU: '/template/homePage',
            en_US: '/template/homePage',
            default: '/template/homePage'
        },
        jsLibsPath: '/etc/designs/carnival/po/postbooking/js/',
        countryOverride: true,
        marketHeader: 'UK',
        passportMonthsValidation: 6,
        luggageLabelServletUrl:
            'https://www.aem-dev.pocruises.com/content/po/master_website/en_GB/mycruise/homepage.luggageLabel.pdf',
        luggageLabelDayX: '480',
        eticketServletUrl:
            'https://www.aem-dev.pocruises.com/content/po/master_website/en_GB/mycruise/homepage.eTicket.pdf',
        eticketDayX: '480'
    });
