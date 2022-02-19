'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import Slider from 'react-slick';
import Image from '../commons/CUK/image';
// import SearchBar from '../searchBar/containers';
// import ReduxProvider from '../../library/js/provider/reduxProvider';
import cookie from '../commons/CUK/cookie';
// import RecentlyViewed from '../recentlyViewed';
import Link from '../commons/CUK/link';
import analytics from '../commons/CUK/analytics';
import fetchData from '../commons/CUK/fetch-data';
import SessionStorage from '../commons/CUK/session-storage';
import validateSession from '../commons/CUK/validateSession';
import {
    getUserType,
    getCountryCode,
    isCookieDisabled,
    getConfig
} from '../commons/CUK/utilities';
import { getCurrencyData } from '../commons/CUK/currencyFormat';
import {
    breakpointsMax as Breakpoints,
    VIEWPORT_TYPE,
    watchForBreakpoint
} from '../../library/js/config/breakpoints';
import { calculateDiffDays } from '../commons/CUK/dateFormat';

const UserCountryCode = getCountryCode();
const UserCurrency = getCurrencyData(UserCountryCode);
const USER = getUserType();

class heroMycruise extends React.Component {
    constructor(props) {
        super(props);

        this.loadTracking = true;

        this.state = {
            showRecentlyViewed: false,
            priceArray: [],
            dynmamicDataObjArray: [],
            cookiesDisabled: true,
            isSVP: false,
            noPrice: false,
            showCta: true,
            apiCalled: false
        };

        this.settings = {
            accessibility: true,
            dots: this.props.heroContentList.length > 1 ? true : false,
            infinite: false,
            arrows: false,
            mobileFirst: true,
            slidesToShow: 1,
            slidesToScroll: 1,
            centerMode: false,
            afterChange: this.setActiveSlide,
            beforeChange: this.svpActiveSlide,
            searchObj: {},
            enableSearch: false,
            swipe: false,
            responsive: [
                {
                    breakpoint:
                        Breakpoints.tabletLandscape +
                        1 /* TODO: update config tabletLandscape and others to have (+1 value) used in slider */,
                    settings: {
                        swipe: true
                    }
                },
                {
                    breakpoint: Breakpoints.mobileLandscape,
                    settings: {
                        swipe: true,
                        adaptiveHeight: true
                    }
                }
            ],
            customPaging: function(index) {
                return (
                    <button tabIndex="-1" aria-hidden="true">
                        {index}
                    </button>
                );
            }
        };
        // this.legalModalData = {
        //     closeLabel: this.props.labels ? this.props.labels.closeLabel : '',
        //     contentLabel: this.props.labels ? this.props.labels.contentLabel : '',
        //     hideLegalAccordion: this.props.hideLegalAccordion ? this.props.hideLegalAccordion : false
        // };
        this.slides = [];
        this.tabTargetList = [];
        this.tabListeners = [];
        this.dynamicDataObjArray = [];
    }

    handleModal = (bool) => {
        // this.setState({
        //     showRecentlyViewed: bool
        // }, () => {
        //     this.state.showRecentlyViewed && this.refs.recentlyViewedWrapper && scrollToTop(this.refs.recentlyViewedWrapper);
        // });

        const analyticsParams = {
            linkText: this.state.recentlyViewedLabel,
            componentName: this.props.component
        };

        analytics.customClicks(analyticsParams);
    };

    seeMoreDetails = (args, spot, campId) => {
        const analyticsHeroParams = {
            componentName: this.props.component,
            linkText: `hero-banner:${campId}`
        };

        analytics.customClicks(analyticsHeroParams);
    };

    componentWillMount() {
        const childObject = this.props.childComponents || [];

        this.setState({ totalSlides: this.props.heroContentList.length });

        for (let i = 0; i < childObject.length; i++) {
            if (
                childObject[i] !== null &&
                childObject[i].type === 'searchBar'
            ) {
                this.setState({
                    searchObj: childObject[i],
                    enableSearch: true,
                    enableRecentlyViewed:
                        childObject[i].attributes.enableRecentlyViewed,
                    recentlyViewedLabel:
                        childObject[i].attributes.labels.recentlyViewedLabel
                });
            }
        }
    }

    componentWillUnmount() {
        this.unBindTab();
    }

    componentDidMount() {
        // analytics.clickTracking(this);
        const { heroContentList } = this.props;
        let camapignIDsArray = [];
        const disableCookie = isCookieDisabled();

        if (!disableCookie) {
            this.setState({
                cookiesDisabled: false
            });
        }

        const mqlSVP = watchForBreakpoint(VIEWPORT_TYPE.MOBILE_L, true);
        const mqlSVP2 = watchForBreakpoint(VIEWPORT_TYPE.MOBILE, true);

        mqlSVP2.addListener((mql) => {
            if (this.state.isSVP) {
                setTimeout(() => {
                    this.customDotsSVP();
                }, 100);
            }
        });

        this.checkSVP(mqlSVP);

        mqlSVP.addListener((mql) => {
            this.checkSVP(mql);
        });

        if (heroContentList.length > 0) {
            const slides = heroContentList.filter((slide, index) => {
                return slide.showPrice === true;
            });

            if (slides.length > 0) {
                this.setState({
                    noPrice: true
                });
            }
        }

        if (this.loadTracking) {
            const loadTracking = {
                heroBanner: {
                    internalCampaignIDs: camapignIDsArray.length
                        ? camapignIDsArray.join('|')
                        : '',
                    event: 'event43'
                }
            };

            analytics.setAdditionalPageTrackAttributes(loadTracking);

            this.loadTracking = false;
        }

        this.bindTabKey();

        setTimeout(() => {
            this.adaptiveHeight(true, 0);
        }, 1000);

        // check if products are available. if not, remove ctas
        let { services, productType } = this.props;
        const page = getConfig('page', '');
        if(page && page.includes('spa')){
            productType = 'SPA'
        }
        if (
            productType === 'SPA' ||
            validateSession.checkCookie(['wcmmode']) ||
            !productType
        ) {
            this.setState({
                apiCalled: true,
                showCta: true
            });
        } else {
            const { productSearchApi } = services.urls;
            const pageSize = 1;
            let url = `${productSearchApi}?productType=${productType}&pageSize=${pageSize}`;
            const configs = typeof window !== 'undefined' ? window.configs : {};
            const apiKey = configs.apikeyMycruise;
            const header = SessionStorage.getItem('header');
            // check if there is ANY shorex
            fetchData(url, {
                method: 'GET',
                headers: {
                    'X-CommonData': JSON.stringify(header),
                    'X-Source-Identity-Token-0': apiKey
                }
            }).then((response) => {
                if (response.products.length <= 0) {
                    this.setState({
                        showCta: false
                    });
                }
                this.setState({
                    apiCalled: true
                });
            });
        }
    }

    adaptiveHeight = (bool, index) => {
        if (this.state.isSVP) {
            const element = this.sliderContainer.querySelectorAll(
                '.slick-list'
            )[0];

            if (typeof element !== 'undefined') {
                if (bool) {
                    element.style.height = 'auto';
                }
                this.state.isSVP
                    ? this.customDotsSVP()
                    : this.customDots(element, index);
            }
        }
    };

    customDots = (element, index) => {
        if (
            element
                .querySelectorAll('.slick-slide')
                [index].querySelectorAll('.no-price-container').length > 0
        ) {
            this.sliderContainer
                .querySelectorAll('.slick-slider')[0]
                .querySelectorAll('.slick-dots')[0].style.top =
                '87%';
        } else {
            this.sliderContainer
                .querySelectorAll('.slick-slider')[0]
                .querySelectorAll('.slick-dots')[0].style.top =
                '56%';
        }
    };

    customDotsSVP = () => {
        const heroImageHeight = this.sliderContainer.querySelectorAll(
            '.image-lazy-loader img'
        )[0].offsetHeight;
        const slickDotsOffset = heroImageHeight - 40;

        this.sliderContainer
            .querySelectorAll('.slick-slider')[0]
            .querySelectorAll(
                '.slick-dots'
            )[0].style.top = `${slickDotsOffset}px`;
    };

    svpActiveSlide = (oldIndex, newIndex) => {
        if (this.state.noPrice && this.state.isSVP) {
            this.adaptiveHeight(false, newIndex);
        }
    };

    checkSVP = (mql) => {
        this.setState({
            isSVP: mql.matches
        });
    };

    componentDidUpdate() {
        // analytics.clickTracking(this);
        const picturefill = require('picturefill');

        picturefill();
    }

    nextSlide = () => {
        analytics.clickTracking(this);
        if (!this.state.disableNext) {
            this.slider.slickNext();
        }
    };

    previousSlide = () => {
        analytics.clickTracking(this);
        if (!this.state.disablePrev) {
            this.slider.slickPrev();
        }
    };

    setActiveSlide = (index) => {
        let activeSlide = index + 1,
            disableNext = false,
            disablePrev = false;

        if (activeSlide === this.state.totalSlides) {
            disableNext = true;
        } else {
            disableNext = false;
        }

        if (activeSlide === 1) {
            disablePrev = true;
        } else {
            disablePrev = false;
        }

        this.setState({
            activeSlide,
            disablePrev,
            disableNext
        });
        if (this.focusTarget) {
            this.focusTarget.focus();
            this.focusTarget = null;
        }
    };

    getTFPEHtml(currency, taxesAndFeesCombined, tax, symbol) {
        let replaceMarkup;

        tax = tax !== undefined ? tax : 0;
        if (
            this.props.tfpeLabels &&
            Object.keys(this.props.tfpeLabels).length !== 0
        ) {
            if (
                currency &&
                (currency === 'USD' &&
                    taxesAndFeesCombined &&
                    taxesAndFeesCombined !== 'false')
            ) {
                tax = `${symbol}${tax}`;
                replaceMarkup =
                    this.props.tfpeLabels &&
                    this.props.tfpeLabels.taxLabelFrUsdTourIdRVY.replace(
                        '{{tax}}',
                        tax
                    );
                replaceMarkup = replaceMarkup
                    .split('{{currency}}')
                    .join(`${currency}${symbol}`);
            } else if (currency && (currency === 'USD' || currency === 'CAD')) {
                tax = `${symbol}${tax}`;
                replaceMarkup =
                    this.props.tfpeLabels &&
                    this.props.tfpeLabels.taxLabelFrRestUsdOrCad.replace(
                        '{{tax}}',
                        tax
                    );
                replaceMarkup = replaceMarkup
                    .split('{{currency}}')
                    .join(`${currency}${symbol}`);
            } else {
                replaceMarkup =
                    this.props.tfpeLabels &&
                    this.props.tfpeLabels.taxLabelFrRestAll;
                replaceMarkup = replaceMarkup
                    .split('{{currency}}')
                    .join(`${currency}${symbol}`);
            }
        }

        return replaceMarkup;
    }

    getApiUrl = (options) => {
        const {
            culture = '',
            costaClubCategory = '',
            destination = '',
            departDateFrom = '',
            departDateTo = '',
            shipCode = '',
            departurePort = '',
            paxType = '',
            occupancy = '',
            offerCode = ''
        } = options;

        let query = `Culture=${culture}&CostaClubCategory=${costaClubCategory}&Destination=${destination}&ShipCode=${shipCode}&DeparturePort=${departurePort}&FareCode=${paxType}&MaxItems=1&Occupancy=${occupancy}&DiscountCode=${offerCode}&Available=true`;

        if (departDateFrom) {
            query += `&FromPeriod=${departDateFrom}`;
        }
        if (departDateTo) {
            query += `&ToPeriod=${departDateTo}`;
        }

        return query;
    };

    // fetchPriceFromApi = (queryParameter, slideNo, slide) => {
    //     const query = this.getApiUrl(slide);

    //     this.apiCall(query, slideNo, (priceUrlReplace) => {
    //         this.fetchPrice(
    //             queryParameter,
    //             slideNo,
    //             slide.paxType,
    //             priceUrlReplace
    //         );
    //     });
    // };

    // apiCall = (query, slideNo, solrCall) => {
    //     let priceUrlReplace;
    //     let dynmamicDataObj = {};

    //     fetchData(`${this.props.services.urls.cruiseList}?${query}`, {
    //         method: 'GET',
    //         headers: this.props.services.headers
    //     }).then((res) => {
    //         let hasCruise = res && res.data && res.data && res.data.cruiseList;
    //         let cruiseList = hasCruise && res.data.cruiseList;
    //         let priceInfo = hasCruise && res.data.cruiseList[0].lowestPrice;
    //         let price = priceInfo.price;

    //         priceUrlReplace = `${cruiseList[0].cruiseCode}_${
    //             cruiseList[0].itineraryId
    //         }`;
    //         cruiseList[0].portCharges;

    //         dynmamicDataObj.portCharges = cruiseList[0].portCharges;
    //         dynmamicDataObj.serviceCharges = cruiseList[0].serviceCharges;
    //         if (dynmamicDataObj.portCharges) {
    //             dynmamicDataObj.portCharges.currencyCode = this.currencyCode;
    //         }
    //         this.dynamicDataObjArray[slideNo] = dynmamicDataObj;
    //         solrCall(priceUrlReplace);

    //         if (this.props.labels && this.props.labels.serviceChargeLabel) {
    //             let priceData = this.getPriceServiceChargeForFR(
    //                 price,
    //                 cruiseList[0].serviceCharges,
    //                 this.currencyCode
    //             );

    //             price = priceData.price;
    //         }

    //         // if (priceInfo) {
    //         //     this.setPriceInfo(
    //         //         {
    //         //             price,
    //         //             currency: priceInfo.currencyCode
    //         //         },
    //         //         slideNo,
    //         //         this.dynamicDataObjArray
    //         //     );
    //         // }
    //     });
    // };

    // getPriceServiceChargeForFR = (price, serviceCharges, currencyCode) => {
    //     let appliedServiceCharge = 0;
    //     let updatedPrice;

    //     if (serviceCharges && serviceCharges.length && currencyCode) {
    //         if (serviceCharges.length > 1) {
    //             appliedServiceCharge = serviceCharges.filter(
    //                 (charges) => charges.currency === currencyCode
    //             );
    //         } else {
    //             appliedServiceCharge = serviceCharges;
    //         }
    //         updatedPrice =
    //             parseFloat(price) +
    //             (appliedServiceCharge[0].totalAdultAmount
    //                 ? parseFloat(appliedServiceCharge[0].totalAdultAmount)
    //                 : 0);
    //     }

    //     return {
    //         price: updatedPrice,
    //         serviceCharges: appliedServiceCharge
    //     };
    // };

    // setPriceInfo(priceInfo, slideNo, dynmamicDataObjArray) {
    //     if (priceInfo.price) {
    //         let priceArray = this.state.priceArray;
    //         const priceObject = {
    //             price: priceInfo.price,
    //             currency: priceInfo.currency
    //         };

    //         priceArray[slideNo] = priceObject;

    //         if (this.taxesAndFeesCombined !== undefined) {
    //             this.replaceMarkup =
    //                 this.props.enableSegment !== 'true'
    //                     ? this.props.tfpeDefaultText
    //                     : this.getTFPEHtml(
    //                           priceInfo.currency,
    //                           this.taxesAndFeesCombined,
    //                           priceInfo.tax,
    //                           priceInfo.symbol
    //                       );
    //         } else {
    //             this.replaceMarkup = this.props.tfpeDefaultText;
    //         }
    //         this.setState(
    //             {
    //                 priceArray,
    //                 dynmamicDataObjArray
    //             },
    //             () => {
    //                 this.bindTabKey();
    //             }
    //         );
    //     }
    // }

    // fetchPrice = (queryParameter, slideNo, paxType, priceUrlReplace) => {
    //     let currencyCode = UserCurrency.currencyCode || '',
    //         loyaltyTier = getUserType();

    //     queryParameter = queryParameter.replace('{currencyCode}', currencyCode);

    //     queryParameter = queryParameter.replace('{loyaltyTier}', loyaltyTier);

    //     let url = `${
    //         this.props.services.urls.recentlyViewed
    //     }?${queryParameter}`;

    //     if (paxType && priceUrlReplace) {
    //         url = url.replace('{{cruiseId_itineraryId}}', priceUrlReplace);
    //     }

    //     this.currencyCode = currencyCode;
    //     this.loyaltyTier = loyaltyTier;

    //     let dynmamicDataObj = {};

    //     fetchData(url).then((res, currencyCode) => {
    //         const { labels } = this.props;
    //         let airportData = {},
    //             airportName = '';

    //         if (res && res.itineraryTiles && res.itineraryTiles.length) {
    //             if (!paxType) {
    //                 dynmamicDataObj.portCharges =
    //                     res.itineraryTiles[0].portCharges;
    //                 dynmamicDataObj.serviceCharges =
    //                     res.itineraryTiles[0].serviceCharges;
    //                 if (dynmamicDataObj.portCharges) {
    //                     dynmamicDataObj.portCharges.currencyCode = this.currencyCode;
    //                 }
    //             }
    //             dynmamicDataObj.documents = res.itineraryTiles[0].documents;
    //             this.taxesAndFeesCombined =
    //                 res.itineraryTiles[0][
    //                     `taxesAndFeesCombined_${this.currencyCode}_${
    //                         this.loyaltyTier
    //                     }`
    //                 ];
    //             airportName =
    //                 res.itineraryTiles[0][
    //                     `airportName_${this.currencyCode}_${USER}`
    //                 ];
    //             if (airportName && airportName.length > 1) {
    //                 const flightLabel =
    //                     labels &&
    //                     labels.flightIncludedLegalModelDescription &&
    //                     labels.flightIncludedLegalModelDescription.replace(
    //                         '{{airport.name}}',
    //                         airportName
    //                     );

    //                 airportData = {
    //                     flightRequired: true,
    //                     flightLabel,
    //                     flightNotincludedLabel: ''
    //                 };
    //             } else {
    //                 airportData = {
    //                     flightRequired: false,
    //                     flightLabel: '',
    //                     flightNotincludedLabel:
    //                         labels &&
    //                         labels.flightNotIncludedLegalModelDescription
    //                 };
    //             }

    //             dynmamicDataObj.flight = airportData;
    //             this.dynamicDataObjArray = this.state.dynmamicDataObjArray;

    //             // if (!paxType) {
    //             //     this.dynamicDataObjArray[slideNo] = dynmamicDataObj;
    //             //     this.setPriceInfo(
    //             //         getPriceInformation(res.itineraryTiles[0]),
    //             //         slideNo,
    //             //         this.dynamicDataObjArray
    //             //     );
    //             // } else {
    //             //     this.dynamicDataObjArray[slideNo].flight =
    //             //         dynmamicDataObj.flight;
    //             //     this.dynamicDataObjArray[slideNo].documents =
    //             //         dynmamicDataObj.documents;
    //             // }
    //         }
    //     });
    // };

    unBindTab() {
        this.tabTargetList.map((tabTarget, index) => {
            this.tabListeners[index]
                ? tabTarget.removeEventListener(
                      'keydown',
                      this.tabListeners[index]
                  )
                : null;
        });

        this.sliderContainer
            ? this.sliderContainer
                  .querySelectorAll('.slick-list')[0]
                  .removeEventListener('scroll', this.resetScroll)
            : null;
    }

    resetScroll = () => {
        const element = this.sliderContainer.querySelectorAll('.slick-list')[0];

        element.scrollLeft > 0 ? (element.scrollLeft = 0) : null;
    };

    bindTabKey = () => {
        this.unBindTab();

        this.tabTargetList = [];
        this.tabListeners = [];

        for (let i = 0; i < this.slides.length - 1; i++) {
            const links = this.slides[i].querySelectorAll('a');
            let targetLink,
                linkFound = false;

            for (let i = links.length - 1; i >= 0; i--) {
                if (links[i].offsetHeight > 0) {
                    targetLink = links[i];
                    linkFound = true;
                    break;
                }
            }
            const target = linkFound ? targetLink : this.slides[i];

            this.tabTargetList[i] = target;
            this.tabListeners[i] = (e) => {
                this.handleAccessibilityNext(e, i);
            };
            target.addEventListener('keydown', this.tabListeners[i]);
        }

        this.sliderContainer
            ? this.sliderContainer
                  .querySelectorAll('.slick-list')[0]
                  .addEventListener('scroll', this.resetScroll)
            : null;
    };

    handleAccessibilityNext(event, index) {
        if (
            event.target === event.currentTarget &&
            event.keyCode === 9 &&
            !event.shiftKey
        ) {
            event.preventDefault();
            this.slider.slickNext();
            this.focusTarget = this.slides[index + 1];
        }
    }

    handleAccessibilityPrev(event, index) {
        if (
            index > 0 &&
            event.keyCode === 9 &&
            event.shiftKey &&
            event.target === event.currentTarget
        ) {
            event.preventDefault();
            this.slider.slickPrev();
            const links = this.slides[index - 1].querySelectorAll('a');

            this.focusTarget =
                links && links.length
                    ? links[links.length - 1]
                    : this.slides[index - 1];
        }
    }

    render() {
        const {
            // heroStartingFromLabel,
            // perPersonLabel,
            heroContentList,
            // childComponents,
            // enableSearchBar,
            enableHero,
            previousLabel,
            nextLabel,
            bookingMinDayX,
            // accessibilityHeading,
            gradientToggle
        } = this.props;
        const header = SessionStorage.getItem('header');

        // let embarkDate = typeof header !== 'undefined' && new Date(header.embarkationDate) || "";
        // let disembarkDate = typeof header !== 'undefined' && new Date(header.disembarkationDate) || "";
        // let cruiseLength =
        //     calculateDiffDays(
        //         embarkDate.getTime(),
        //         disembarkDate.getTime()
        //     ) - 1;
        //let isShortCruise = cruiseLength < 5;
        let { showCta } = this.state;

        let minDaysToShowCta = true;
        const pageTag = getConfig('page', '');
        let CheckFlagForPage = pageTag.includes('drinks-landing');

        if(CheckFlagForPage){
            let cruiseDuration = SessionStorage.getItem('cruiseData').durationCruise;
            if(!bookingMinDayX =='' &&  parseInt(cruiseDuration) <  parseInt(bookingMinDayX)){
                minDaysToShowCta = false;
            }
        }
        // let recentlyViewed;

        let cruiseIdsLen = cookie.get('cruiseIds').splice(-6).length;

        cruiseIdsLen = cruiseIdsLen > 0 ? `(${cruiseIdsLen})` : '';

        const slidesHtml = heroContentList.map((slide, i) => (
            <div
                key={i}
                className="slide"
                tabIndex={0}
                role="slider"
                aria-valuemin="1"
                aria-valuenow={i + 1}
                aria-valuemax={heroContentList.length}
                aria-labelledby={`info-card-positioning${i}`}
                ref={(slide) => (this.slides[i] = slide)}
                onKeyDown={(e) => this.handleAccessibilityPrev(e, i)}
            >
                {slide.image && (
                    <Image {...slide.image} disableLazyLoad={true} />
                )}

                <div
                    id={`info-card-positioning${i}`}
                    className={`info-card-positioning ${
                        !slide.showPrice && this.state.isSVP
                            ? 'no-price-container'
                            : ''
                    }`}
                >
                    <div
                        className={`info-card-wrap grid-wrap ${
                            slide.heroCardAlignment
                        }`}
                    >
                        <div
                            className={`info-card no-price ${
                                slide.heroCardAlignment
                            }`}
                        >
                            {(slide.showCtaAnyways || showCta) &&
                            slide.primaryCta ? (
                                <Link
                                    {...slide.primaryCta}
                                    url={minDaysToShowCta ? slide.primaryCta.url: '#'}
                                    isExternal={slide.primaryCta.isExternal}
                                    linkClassName=""
                                    allowDefault={true}
                                    ariaLabel={`${slide.title} ${
                                        slide.primaryCta.label
                                    }`}
                                >
                                    <div className={`info-section`}>
                                        <h2>{slide.title}</h2>
                                        <p className="title-description">
                                            {slide.desc}
                                        </p>
                                    </div>
                                    {minDaysToShowCta && slide.primaryCta.label &&
                                        slide.primaryCta.label !== '' && (
                                            <div className="detail-section slide-cta">
                                                <a 
                                                    href={slide.primaryCta.url}
                                                    target={slide.primaryCta.isExternal ? '_blank' : ''}
                                                 >
                                                    {slide.primaryCta.label}
                                                </a>
                                            </div>
                                        )}
                                </Link>
                            ) : (
                                <div className={`info-section`}>
                                    <h2>{slide.title}</h2>
                                    <p className="title-description">
                                        {slide.desc}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        ));

        return (
            this.state.apiCalled && (
                <div
                    className={`hero-container ${
                        enableHero ? 'hero-enabled' : 'hero-disabled'
                    }`}
                >
                    {/* {accessibilityHeading && (
                        <h1 className="sr-only page-title">
                            {accessibilityHeading}
                        </h1>
                    )} */}
                    {!this.state.showRecentlyViewed && (
                        <div className="hero-content">
                            {enableHero && (
                                <div
                                    className={`hero-slides ${
                                        this.state.noPrice && this.state.isSVP
                                            ? 'price-container'
                                            : ''
                                    }`}
                                    ref={(sliderContainer) =>
                                        (this.sliderContainer = sliderContainer)
                                    }
                                >
                                    <Slider
                                        ref={(c) => (this.slider = c)}
                                        {...this.settings}
                                    >
                                        {slidesHtml}
                                    </Slider>
                                    {this.state.totalSlides > 1 && (
                                        <div className="slide-controls-wrapper">
                                            <div className="slide-controls">
                                                <button
                                                    tabIndex="-1"
                                                    className={`button prev-btn ${this
                                                        .state.disablePrev &&
                                                        'slick-disabled'}`}
                                                    data-linktext={
                                                        'slider-prev'
                                                    }
                                                    onClick={this.previousSlide}
                                                    aria-hidden="true"
                                                >
                                                    <span>{previousLabel}</span>
                                                </button>
                                                <button
                                                    tabIndex="-1"
                                                    className={`button next-btn ${this
                                                        .state.disableNext &&
                                                        'slick-disabled'}`}
                                                    data-linktext={
                                                        'slider-prev'
                                                    }
                                                    onClick={this.nextSlide}
                                                    aria-hidden="true"
                                                >
                                                    <span>{nextLabel}</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )
        );
    }
}

heroMycruise.propTypes = {
    enableHero: PropTypes.bool,
    heroContentList: PropTypes.arrayOf(
        PropTypes.shape({
            image: PropTypes.shape({
                alt: PropTypes.string,
                '0': PropTypes.shape({
                    '1x': PropTypes.string.isRequired
                })
            }),
            heroCardIcon: PropTypes.bool,
            title: PropTypes.string,
            cardIconAlt: PropTypes.string,
            desc: PropTypes.string,
            showPrice: PropTypes.bool,
            priceUrl: PropTypes.string,
            primaryCta: PropTypes.shape({
                label: PropTypes.string,
                url: PropTypes.string,
                isExternal: PropTypes.bool
            }),
            heroCardAlignment: PropTypes.string
        })
    )
};

heroMycruise.defaultProps = {
    heroCardAlignment: 'left'
};

export default heroMycruise;
