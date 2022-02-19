/**
 * Component - C035 - ShoreX key Information
 */
'use strict';

import React from 'react';
// import PropTypes from 'prop-types';
import Image from '../commons/CUK/image';
import Loader from '../commons/CUK/loader';
import analytics from '../commons/CUK/analytics';
import Link from '../commons/CUK/link';
import Cookie from '../commons/CUK/cookie';
import Player from '../commons/CUK/videoplayer';
import ReadMoreOrLess from '../commons/CUK/readMoreOrLess';
import fetchData from '../commons/CUK/fetch-data';
import SessionStorage from '../commons/CUK/session-storage';
import { getPriceSymbolForCurrencyCode } from '../commons/CUK/currencyFormat';
import extractChildComponent from '../commons/CUK/extractChildComponent';
import DiningTabsMycruise from '../diningTabsMycruise';
import {
    getConfig,
    convertValueToVaildDecimalPoint
} from '../commons/CUK/utilities';
import validateSession from '../commons/CUK/validateSession';
import moment from 'moment';
import { calculateDiffDays } from '../commons/CUK/dateFormat';

import {
    VIEWPORT_TYPE,
    watchForBreakpoint
} from '../../library/js/config/breakpoints';
import DiningOverlay from '../diningOverlay';

const COOKIE_FAVORITE_SHOREX = 'favoriteShoreX';
const ERROR_CODES = {
    START_SALE_DATE_NOT_MET: 'notOnSaleYet',
    STOP_SALE_DATE_PASSED: 'notOnSaleAnymore',
    DINING_INSTANCE_NOT_VALID_FOR_CRUISE_SHIP: 'notOnSaleAnymore',
    PRODUCT_OUT_OF_STOCK: 'outOfStock',
    DINING_MASTER_NOT_APPROVED: 'notOnSaleAnymore',
    INSTANCE_IS_NOT_AVAILABLE: 'notOnSaleAnymore',
    DINING_INSTANCE_PRICE_MISSING: 'notOnSaleAnymore'
};
class diningKeyInfoMycruise extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            showModal: false,
            isLVP: false,
            isMVP: false,
            readMore: false,
            active: false,
            apiCalled: false,
            pricesFrom: false,
            mealPeriods: [],
            // ageRestricted: false,
            // pricesInfo: '',
            variations: '',
            // portLabel: '',
            purchasability: false,
            name: '',
            description: '',
            image: '',
            type: '',
            pdfMenuPath: '',
            dinnerType: [],
            location: '',
            venueType: '',
            diningDayX: false,
            limeLightEvents: [],
            showLodaer: true
            // portcode: ''
        };

        this.maxHeight = {
            lvp: 160,
            mvp: 160,
            svp: 100
        };
    }

    componentDidMount() {
        // window.addEventListener('beforeunload', this.setsessionStorageInfo);
        const mqlLVP = watchForBreakpoint(VIEWPORT_TYPE.DESKTOP);
        const mqlMVP = watchForBreakpoint([
            VIEWPORT_TYPE.TABLET,
            VIEWPORT_TYPE.DESKTOP
        ]);

        setTimeout(() => {
            this.checkVP(mqlLVP, mqlMVP);
        }, 400);

        window.addEventListener('resize', () => {
            this.checkVP(mqlLVP, mqlMVP);
        });

        mqlLVP.addListener((mql) => {
            this.checkVP(mql, mqlMVP);
        });

        // update session storage only when leaving the page, so doesnt show the current page in the recently viewed
        // window.addEventListener('beforeunload', this.setSessionStorageInfo);
        // analytics.clickTracking(this);
    }
    componentDidUpdate() {
        // analytics.clickTracking(this);
    }

    /**
     * toggleFavorite - set or reset favorites
     *
     * @param  {number} id  id of the itinerary
     * @param  {boolean} isFavorite flag status represents user favours this tour
     */
    // toggleFavorite = (id, isFavorite) => {

    //     const { services } = this.props;

    //     let props = {};

    //     if (isFavorite) {

    //         Cookie.addTo(COOKIE_FAVORITE_SHOREX, id, 730);
    //     }
    //     else {

    //         Cookie.removeFrom(COOKIE_FAVORITE_SHOREX, id, 730);
    //     }

    //     if (isLoggedIn() && services && services.urls.favouritesAPI) {

    //         props = {
    //             ...{ 'type': 'SHORE-X' },
    //             ...{ 'services': services },
    //             ...{ 'action': isFavorite ? 'add' : 'remove' },
    //             ...{ 'id': id }
    //         };

    //         updateFavourites(props);
    //     }

    //     PubSub.publish(topics.FAVOURITES_UPDATED);
    // }

    /**
     * checkVP - Set the component state information pertaining large viewport
     * @param {Object} lVP - media query object for largeViewPort
     * @param {Object} mVP - media query object for mediumViewPort
     */
    checkVP = (lVP, mVP) => {
        this.setState(() => {
            const elm =
                this.diningKeyInfoMycruise && this.diningKeyInfoMycruise.querySelectorAll('.desc') || [];
            const maxHeight = this.getMaxHeight();
            return {
                isLVP: lVP.matches,
                isMVP: mVP.matches,
                readMore:
                    elm.length && elm[0].offsetHeight > maxHeight ? false : false
            };
        });
    };

    componentWillMount() {
        this.getBannerData();
        const header = SessionStorage.getItem('header');
        const { embarkationDate } = header;
        const dayOfCruiseDeparture = new Date(
            moment(embarkationDate, 'YYYY-MM-DD').format('ll')
        );
        const today = new Date();
        const oneDay = 1000 * 60 * 60 * 24;
        const dayToCruiseDeparture = Math.ceil(
            (dayOfCruiseDeparture.getTime() - today.getTime()) / oneDay
        );
        const xDays = getConfig('diningDayX');
        const diffDays = +xDays - dayToCruiseDeparture;

        if (diffDays >= 0) {
            this.setState({
                diningDayX: true
            });
        }
    }

    handleOverlayOpen = () => {
        let pageUrl = window.location.href.split('/');
        const type = pageUrl[pageUrl.length - 2];
        const code = pageUrl[pageUrl.length - 1];

        let pageEntUrl = window.location.href.split('/dining-listing');
        window.location.href =
            pageEntUrl[0] + '/dining-listing/booking/' + type + '/' + code;
    };

    handleOverlayClose = () => {
        this.setState(() => ({
            showModal: false
        }));
    };

    setsessionStorageInfo = () => {
        let length;
        let pageUrl = window.location.href.split('/');
        let code = pageUrl[pageUrl.length - 1]; //'PO_FB_00019'; //'BR_CLUB_OR';
        let lang = this.props.services.headers.locale;
        const header = SessionStorage.getItem('header');
        const { bookingRef = '', customer } = header;
        const { firstName = '', lastName = '' } = customer;
        let { description, name, image, venueType, diningDayX } = this.state;
        const diningPageUrl = window.location.href;
        const purchasability = venueType ? venueType : diningDayX;
        const diningId = code;
        let included = false;
        // viewed = sessionStorage.getItem('viewed');
        let viewed = localStorage.getItem('viewed')
            ? JSON.parse(localStorage.getItem('viewed'))
            : {};
        !viewed[`${lang}_${bookingRef}_${firstName}_${lastName}`] &&
            (viewed[`${lang}_${bookingRef}_${firstName}_${lastName}`] = []);
        // check if product is already in recently viewed, if it is, we delete it to push ot in forst position
        viewed[`${lang}_${bookingRef}_${firstName}_${lastName}`].map((card, index) => {
            if (card.code === diningId) {
                viewed[`${lang}_${bookingRef}_${firstName}_${lastName}`].splice(index, 1);
            }
        });

        let detailsInfo = {};

        detailsInfo['type'] = 'diningCard';
        detailsInfo['code'] = diningId;
        detailsInfo['description'] = description;
        detailsInfo['name'] = name;
        detailsInfo['url'] = diningPageUrl;
        detailsInfo['image'] = image;
        detailsInfo['purchasability'] = purchasability;
        detailsInfo['diningDayX'] = diningDayX;
        detailsInfo['included'] = included;
        // detailsInfo['additionalSelector'] = 'additional';
        const itemViewedlength = viewed[`${lang}_${bookingRef}_${firstName}_${lastName}`].length;

        if (!itemViewedlength) {
            viewed[`${lang}_${bookingRef}_${firstName}_${lastName}`].push(detailsInfo);
        } else {
            itemViewedlength >= 12 && viewed[`${lang}_${bookingRef}_${firstName}_${lastName}`].pop();
            viewed[`${lang}_${bookingRef}_${firstName}_${lastName}`].unshift(detailsInfo);
        }
        // sessionStorage.setItem('viewed', viewed);
        localStorage.setItem('viewed', JSON.stringify(viewed));
    };

    createMealTimes = () => {
        return this.state.mealPeriods.map((mealTime, index) => {
            let connector =
                index === this.state.mealPeriods.length - 1 ? '' : ' / ';
            return `${mealTime.name}${connector}`;
        });
    };

    renderVariants = () => {
        const {
            bookableOnBoardLabel,
            bookableOnBoardInfo,
            addToCartLabel,
            comingSoonLabel,
            comingSoonInfo,
            soldOutLabel,
            bookableOnBoard,
            notOnSaleAnymoreLabel,
            notOnSaleAnymoreInfo,
            venueType,
            inculdedNonBookableVenueLabel,
            genericVenueTypeLabel
        } = this.props;
        // const { variations, title, description, name } = this.props.shoreXVariations;
        const display = this.state.hover ? 'block' : 'none';
        const tooltipStyle = { display };

        // let purchasability = bookableOnBoard
        //     ? 'bookableOnBoard'
        //     : this.state.purchasability;

        // if (venueType === 'speciality_np') {
        //     purchasability = 'bookableOnBoard';
        // }

        // if (purchasability === true) {
        //     purchasability = 'addToCart';
        // }
        const purchasability = this.state.venueType
            ? this.state.venueType
            : this.state.diningDayX;
        let purchasabilityValue = '';
        if (
            (purchasability === 'speciality_bookable' ||
                purchasability === 'included_bookable' ||
                purchasability === 'limelight' ||
                purchasability === 'cookery') &&
            this.state.diningDayX === true
        ) {
            purchasabilityValue = 'addToCart';
        } else if (
            (purchasability === 'speciality_bookable' ||
                purchasability === 'included_bookable' ||
                purchasability === 'limelight' ||
                purchasability === 'cookery') &&
            this.state.diningDayX === false
        ) {
            purchasabilityValue = 'genericVenueType';
        }

        if (purchasability === 'included_nonbookable') {
            purchasabilityValue = 'inculdedNonBookableVenue';
        }

        if (purchasability === 'speciality_nonbookable') {
            purchasabilityValue = 'bookableOnBoard';
        }

        if (purchasability === true) {
            purchasabilityValue = 'addToCart';
        } else if (purchasability === false) {
            purchasabilityValue = 'genericVenueType';
        }

        switch (purchasabilityValue) {
            case 'genericVenueType':
                return (
                    <div>
                        <div className="dining-variant-title comingSoon">
                            <div
                                className="dining-variant-title-info"
                                onMouseOver={this.handleMouseIn.bind(this)}
                                onMouseOut={this.handleMouseOut.bind(this)}
                            >
                                <div
                                    className="dining-variant-tooltip"
                                    style={tooltipStyle}
                                >
                                    <a
                                        className="dining-close"
                                        onClick={(e) => this.closeTooltip(e)}
                                    />
                                    <p> {genericVenueTypeLabel} </p>
                                </div>
                            </div>
                            {genericVenueTypeLabel}
                        </div>
                    </div>
                );
            case 'outOfStock':
                return (
                    <div>
                        <div className="dining-variant-title soldOut">
                            <div
                                className="dining-variant-title-info"
                                onMouseOver={this.handleMouseIn.bind(this)}
                                onMouseOut={this.handleMouseOut.bind(this)}
                            >
                                <div
                                    className="dining-variant-tooltip"
                                    style={tooltipStyle}
                                >
                                    <a
                                        className="dining-close"
                                        onClick={(e) => this.closeTooltip(e)}
                                    />
                                    <p> {soldOutLabel} </p>
                                </div>
                            </div>
                            {soldOutLabel}
                        </div>
                    </div>
                );
            case 'bookableOnBoard':
                return (
                    <div>
                        <div className="dining-variant-title bookOnBoard">
                            <div
                                className="dining-variant-title-info"
                                onMouseOver={this.handleMouseIn.bind(this)}
                                onMouseOut={this.handleMouseOut.bind(this)}
                            >
                                {/* <div
                                    className="dining-variant-tooltip"
                                    style={tooltipStyle}
                                >
                                    <a
                                        className="dining-close"
                                        onClick={(e) => this.closeTooltip(e)}
                                    />
                                    <p> {bookableOnBoardInfo} </p>
                                </div> */}
                            </div>
                            {bookableOnBoardLabel}
                        </div>
                    </div>
                );
            case 'inculdedNonBookableVenue':
                return (
                    <div>
                        <div className="dining-variant-title bookOnBoard">
                            <div
                                className="dining-variant-title-info"
                                onMouseOver={this.handleMouseIn.bind(this)}
                                onMouseOut={this.handleMouseOut.bind(this)}
                            >
                                {/* <div
                                    className="dining-variant-tooltip"
                                    style={tooltipStyle}
                                >
                                    <a
                                        className="dining-close"
                                        onClick={(e) => this.closeTooltip(e)}
                                    />
                                    <p> {inculdedNonBookableVenueLabel} </p>
                                </div> */}
                            </div>
                            {inculdedNonBookableVenueLabel}
                        </div>
                    </div>
                );
            case 'addToCart':
                return (
                    <div className="cta-holder">
                        <Link
                            url=""
                            ariaLabel={`${addToCartLabel}`}
                            label={addToCartLabel}
                            onClick={this.handleOverlayOpen}
                            linkClassName="secondary"
                            dataLinktext={`${addToCartLabel}`}
                        >
                            {addToCartLabel}
                        </Link>
                    </div>
                );
            default:
                return <div />;
        }
    };

    closeTooltip(e) {
        analytics.clickTracking(this);
        e.preventDefault();
        this.setState({ hover: false });
    }
    handleMouseIn() {
        this.setState({ hover: true });
    }

    handleMouseOut() {
        this.setState({ hover: false });
    }
    /**
     * createBackground - returns markup for background view
     * @returns {String} markup - appropriate html for background view
     */
    createBackground = () => {
        const { gifURL, video, image, type } = this.state;

        switch (type) {
            case 'video':
                if (this.state.isLVP) {
                    return (
                        <Player
                            video={video}
                            autoplay={true}
                            muted={true}
                            loop={true}
                            playsInline={true}
                            isBackground={true}
                        />
                    );
                } else {
                    return <Image {...image} />;
                }
            case 'image':
                return <Image {...image} />;

            case 'gif':
                return <img src={gifURL} alt="" />;
        }
    };
    //New implementation getting banner details from solar
    getEvents = (type, code, venueType) => {
        const { shipEventAPi } = this.props.services.urls;
        const HLEventIncluded = this.props.highlightedEventOnDining ? this.props.highlightedEventOnDining : [];
        const apikeyMycruise = getConfig('apikeyMycruise', '');
        const preCruiseValue = 'PRE_CRUISE_AVAILABLE';
        const HIGHLIGHTED_EVENT = 'HIGHLIGHTED_EVENT';
        const header = SessionStorage.getItem('header');
        const cruiseSummaryData = SessionStorage.getItem('cruiseSummaryData');
        const { customer } = JSON.parse(JSON.stringify(header));

        const cruiseData = SessionStorage.getItem('cruiseData');
        let startTime = cruiseSummaryData.itineraryBooking.embarkTime + '00';
        const currentDate = header.embarkationDate;
        const { maxRequestdaysEventsDining } = window.configs;
        let embarkationEndDate = header.disembarkationDate;
        if (maxRequestdaysEventsDining) {
            const daysAdded = moment(currentDate, 'YYYY-MM-DD').add(
                maxRequestdaysEventsDining,
                'days'
            );
            if (
                new Date(daysAdded).getTime() <
                new Date(header.disembarkationDate).getTime()
            ) {
                embarkationEndDate = daysAdded;
            }
        }
        const startDate =
            moment(currentDate, 'YYYY-MM-DD').format('YYYYMMDD') + startTime;
        const endDate =
            moment(embarkationEndDate, 'YYYY-MM-DD').format('YYYYMMDD') +
            '030000';
        let pageUrl = window.location.href.split('/');
        let categoryType,
            vcode = type == 'venue' ? [code] : [];
        let venueLimelightFlag = false;
        if (venueType && venueType.toLowerCase() == 'limelight') {
            categoryType = ['LIMELIGHT'];
            venueLimelightFlag = true;
        } else if (venueType && venueType.toLowerCase() == 'cookery') {
            categoryType = ['MASTER_CLASS', 'HOSTED_DINNER'];
            venueLimelightFlag = true;
        } else {
            categoryType = ['DINING'];
        }
        const requestBody = {
            data: {
                startDateTime: startDate,
                endDateTime: endDate,
                guests: [],
                partySize: 1,
                numberOfWheelchairsInParty: 0,
                venueCodes: vcode,
                types: [],
                categories: categoryType
                // categories: ['RECEPTION']
            }
        };
        const requestHeaders = {
            'Content-Type': 'application/json',
            'X-Source-Identity-Token-0': apikeyMycruise
        };
        let url = `${shipEventAPi}/${header.shipCode}`;
        return fetchData(url, {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: requestHeaders
        }).then((res) => {
            let dinnerType = [];
            let venueCode,
                eventCode,
                filterEvents = [],
                eventCodeList = [],
                eventCodeListwithoutCode = [];
            if (res && res.success === 'true') {
                if (res.data[0] && res.data[0].events) {
                    //ship events found in list
                    const { events } = res.data[0];
                    events.map((e, i) => {
                        if (type == 'venue' && code == e.venueCode) {
                            venueCode = e.venueCode;
                            eventCode = e.eventCode;
                            if (
                                e.eventCode &&
                                e.categories.length &&
                                e.categories.indexOf(preCruiseValue) > '-1' &&
                                HLEventIncluded.indexOf(venueType.toLowerCase()) > '-1'
                            ) {
                                let index = eventCodeList.indexOf(
                                    `code:${e.eventCode}`
                                );
                                if (index == '-1') {
                                    filterEvents.push(e);
                                    eventCodeList.push(`code:${e.eventCode}`);
                                    eventCodeListwithoutCode.push(`${e.eventCode}`);
                                } else {
                                    if (e.inventory) {
                                        if (filterEvents[index]['inventory']) {
                                            filterEvents[index].inventory = [
                                                ...filterEvents[index]
                                                    .inventory,
                                                ...e.inventory
                                            ];
                                        } else {
                                            filterEvents[index]['inventory'] =
                                                e.inventory;
                                        }
                                    }
                                }
                                if (e.categories.indexOf('DINNER') > '-1') {
                                    dinnerType.push('Dinner');
                                }
                                if (e.categories.indexOf('BREAKFAST') > '-1') {
                                    dinnerType.push('Breakfast');
                                }
                                if (e.categories.indexOf('LUNCH') > '-1') {
                                    dinnerType.push('Lunch');
                                }
                                if (
                                    (this.props.isBookingPage &&
                                        e.categories.indexOf('HI-TEA') >
                                            '-1') ||
                                    (this.props.isBookingPage &&
                                        e.categories.indexOf('AFTERNOON_TEA') >
                                            '-1')
                                ) {
                                    dinnerType.push('Hi-Tea');
                                }
                            } else if (
                                e.eventCode &&
                                e.categories.length &&
                                e.categories.indexOf(preCruiseValue) > '-1' &&
                                e.categories.indexOf(HIGHLIGHTED_EVENT) == '-1'
                            ) {
                                let index = eventCodeList.indexOf(
                                    `code:${e.eventCode}`
                                );
                                if (index == '-1') {
                                    filterEvents.push(e);
                                    eventCodeList.push(`code:${e.eventCode}`);
                                    eventCodeListwithoutCode.push(`${e.eventCode}`);
                                } else {
                                    if (e.inventory) {
                                        if (filterEvents[index]['inventory']) {
                                            filterEvents[index].inventory = [
                                                ...filterEvents[index]
                                                    .inventory,
                                                ...e.inventory
                                            ];
                                        } else {
                                            filterEvents[index]['inventory'] =
                                                e.inventory;
                                        }
                                    }
                                }
                                if (e.categories.indexOf('DINNER') > '-1') {
                                    dinnerType.push('Dinner');
                                }
                                if (e.categories.indexOf('BREAKFAST') > '-1') {
                                    dinnerType.push('Breakfast');
                                }
                                if (e.categories.indexOf('LUNCH') > '-1') {
                                    dinnerType.push('Lunch');
                                }
                                if (
                                    (this.props.isBookingPage &&
                                        e.categories.indexOf('HI-TEA') >
                                            '-1') ||
                                    (this.props.isBookingPage &&
                                        e.categories.indexOf('AFTERNOON_TEA') >
                                            '-1')
                                ) {
                                    dinnerType.push('Hi-Tea');
                                }
                            }
                        } else if (type == 'event' && code == e.eventCode) {
                            venueCode = e.venueCode;
                            eventCode = e.eventCode;
                            if (
                                e.eventCode &&
                                e.categories.length &&
                                e.categories.indexOf(preCruiseValue) > '-1'
                            ) {
                                if (e.categories.indexOf('DINNER') > '-1') {
                                    dinnerType.push('Dinner');
                                }
                                if (e.categories.indexOf('BREAKFAST') > '-1') {
                                    dinnerType.push('Breakfast');
                                }
                                if (e.categories.indexOf('LUNCH') > '-1') {
                                    dinnerType.push('Lunch');
                                }
                                if (
                                    (this.props.isBookingPage &&
                                        e.categories.indexOf('HI-TEA') >
                                            '-1') ||
                                    (this.props.isBookingPage &&
                                        e.categories.indexOf('AFTERNOON_TEA') >
                                            '-1')
                                ) {
                                    dinnerType.push('Hi-Tea');
                                }
                            }
                        }
                    });
                    dinnerType = dinnerType.length
                        ? [...new Set(dinnerType)]
                        : [];
                    eventCodeList = eventCodeList;
                    eventCodeListwithoutCode = eventCodeListwithoutCode;
                    return {
                        eventCode: eventCode,
                        venueCode: venueCode,
                        dinnerType: dinnerType,
                        filterEvents: filterEvents,
                        eventCodeList: eventCodeList,
                        eventCodeListwithoutCode: eventCodeListwithoutCode
                    };
                } else {
                    return {
                        eventCode: type == 'event' ? code : '',
                        venueCode: type == 'venue' ? code : '',
                        dinnerType: [],
                        filterEvents: [],
                        eventCodeList: [],
                        eventCodeListwithoutCode: []
                    };
                }
            } else {
                this.setState({
                    showLodaer: false,
                }, () => {
                    this.props.errorShipEventApi(true);
                });
                return {
                    eventCode: type == 'event' ? code : '',
                    venueCode: type == 'venue' ? code : '',
                    dinnerType: [],
                    filterEvents: [],
                    eventCodeList: [],
                    eventCodeListwithoutCode: []
                };
            }
        });
    };
    getVenueFromSolar = (venueCode) => {
        const {
            props: { solrCollectionNameVenue }
        } = this;
        const header = SessionStorage.getItem('header');
        const { pathSolrHandler } = this.props.services.urls;
        const shipCode = header.shipCode;
        let vennuURL;
        let rows = 9999;
        if (venueCode) {
            vennuURL = `${pathSolrHandler}${solrCollectionNameVenue}/getVenues?q=*%3A*&fq=( (code:${venueCode}) AND shipCode:${shipCode} )&rows=${rows}`;
            // vennuURL = `${pathSolrHandler}${solrCollectionNameVenue}/getVenues?q=*%3A*&fq=( (code:${venueCode}) AND shipCode:${shipCode} )`;
        } else {
            return false;
        }

        return fetchData(vennuURL, {
            method: 'GET'
        }).then((res) => {
            
            if (res && res.response && res.response.numFound > 0) {
                return res.response.docs[0];
            } else {
                return false;
            }
        });
    };
    getEventFromSolar = (eventCode) => {
        const {
            props: { solrCollectionName }
        } = this;
        const header = SessionStorage.getItem('header');
        const { pathSolrHandler } = this.props.services.urls;
        const shipCode = header.shipCode;
        let code;
        let rows = 1;
        if (typeof eventCode == 'object') {
            rows = eventCode.length;
            code = eventCode.join(' OR ');
        } else {
            code = `code:${eventCode}`;
            rows = 1;
        }
        let eventURL = `${pathSolrHandler}${solrCollectionName}/getEvents?&q=*%3A*&fq=( (${code}) AND shipCode:${shipCode} )&rows=${rows}`;
        // let eventURL = `${pathSolrHandler}${solrCollectionName}/getEvents?&q=*%3A*&fq=( (${code}) AND shipCode:${shipCode} )`;
        return fetchData(eventURL, {
            method: 'GET'
        }).then((res) => {
            
            if (res && res.response && res.response.numFound > 0) {
                if (typeof eventCode == 'object') {
                    return res.response.docs;
                } else {
                    return res.response.docs[0];
                }
            } else {
                return false;
            }
        });
    };
    getBannerData = () => {
        let pageUrl = window.location.href.split('/');
        let type1 = pageUrl[pageUrl.length - 3]; //'event';
        let type, code, ecode;
        if (type1 == 'venue') {
            type = pageUrl[pageUrl.length - 3]; //'event';
            code = pageUrl[pageUrl.length - 2]; //'PO_FB_00019'; //'BR_CLUB_OR';
            ecode = pageUrl[pageUrl.length - 1];
        } else {
            type = pageUrl[pageUrl.length - 2]; //'event';
            code = pageUrl[pageUrl.length - 1]; //'PO_FB_00019'; //'BR_CLUB_OR';
        }

        //type = 'venue';
        //code = 'BR_SLCT_LL';
        if (type == 'venue') {
            // const { dinnerType, eventCode, venueCode } = res;
            this.getVenueFromSolar(code).then((venueRes) => {
                if (venueRes) {
                    this.getEvents(type, code, venueRes.venueType).then(
                        (eventRes) => {
                            const image = {
                                alt: venueRes.title,
                                0: {
                                    '1x': `${venueRes.bannerImage}`,
                                    '2x': `${venueRes.bannerImage}`
                                },
                                376: {
                                    '1x': `${venueRes.bannerImage}`,
                                    '2x': `${venueRes.bannerImage}`
                                },
                                769: {
                                    '1x': `${venueRes.bannerImage}`,
                                    '2x': `${venueRes.bannerImage}`
                                }
                            };
                            if (
                                eventRes.eventCodeList &&
                                eventRes.eventCodeList.length
                            ) {
                                this.getEventFromSolar(
                                    eventRes.eventCodeList
                                ).then((eventResponse) => {
                                    let result = [];
                                    let newEventCode = {};
                                    let newVenueRes = [];
                                    if (
                                        eventResponse &&
                                        eventResponse.length > 0
                                    ) {
                                        result = eventResponse.map((obj) => {
                                            let data = eventRes.filterEvents.find(
                                                (item) =>
                                                    item.eventCode === obj.code
                                            );
                                            let newVenueType = {
                                                venueType: venueRes.venueType
                                            };
                                            newEventCode = {
                                                eventCode: obj.code
                                            };
                                            newVenueRes = {
                                                ...venueRes,
                                                ...newEventCode
                                            };
                                            return {
                                                ...data,
                                                ...obj,
                                                ...newVenueType
                                            };
                                        });
                                    } else {
                                        newVenueRes = {
                                            ...venueRes
                                        };
                                    }
                                    this.setState(
                                        {
                                            limeLightEvents: result,
                                            name: venueRes.title,
                                            description: venueRes.description,
                                            image: image,
                                            type: 'image',
                                            pdfMenuPath: venueRes.menu,
                                            dinnerType: eventRes.dinnerType ?  eventRes.dinnerType : [],
                                            location: venueRes.location
                                                ? venueRes.location
                                                : '',
                                            venueType: venueRes.venueType,
                                            showLodaer: false
                                        },
                                        () => {
                                            if (
                                                this.props.isBookingPage &&
                                                venueRes
                                            ) {
                                                let eventList =
                                                    eventRes &&
                                                    eventRes.eventCodeListwithoutCode
                                                        ? eventRes.eventCodeListwithoutCode
                                                        : [];
                                                this.props.diningCallback(
                                                    [newVenueRes],
                                                    [eventList],
                                                    result
                                                );
                                                this.props.eventsListCallBack(
                                                    result,
                                                    eventList
                                                );
                                            } else {
                                                this.setsessionStorageInfo();
                                            }
                                        }
                                    );
                                });
                            } else {
                                this.setState(
                                    {
                                        name: venueRes.title,
                                        description: venueRes.description,
                                        image: image,
                                        type: 'image',
                                        pdfMenuPath: venueRes.menu,
                                        dinnerType: [],
                                        location: venueRes.location
                                            ? venueRes.location
                                            : '',
                                        venueType: venueRes.venueType,
                                        showLodaer: false
                                    },
                                    () => {
                                        if (
                                            this.props.isBookingPage &&
                                            venueRes
                                        ) {
                                            this.props.diningCallback([
                                                venueRes,
                                                [],
                                                []
                                            ]);
                                        } else {
                                            this.setsessionStorageInfo();
                                        }
                                    }
                                );
                            }
                        }
                    );
                } else {
                    this.setState({
                        showLodaer: false
                    })
                }
            });
        } else {
            this.getEvents(type, code).then((res) => {
                const { dinnerType, eventCode, venueCode } = res;
                if (type == 'event') {
                    this.getEventFromSolar(code).then((eventsRes) => {
                        if (eventsRes) {
                            if (venueCode) {
                                this.getVenueFromSolar(venueCode).then(
                                    (venueRes) => {
                                        const image = {
                                            alt: eventsRes.title,
                                            0: {
                                                '1x': `${
                                                    eventsRes.bannerImage
                                                }`,
                                                '2x': `${eventsRes.bannerImage}`
                                            },
                                            376: {
                                                '1x': `${
                                                    eventsRes.bannerImage
                                                }`,
                                                '2x': `${eventsRes.bannerImage}`
                                            },
                                            769: {
                                                '1x': `${
                                                    eventsRes.bannerImage
                                                }`,
                                                '2x': `${eventsRes.bannerImage}`
                                            }
                                        };
                                        let newEventRes = [];
                                        let newVenueCode = {
                                            venueCode: venueCode
                                        };
                                        newEventRes = {
                                            ...eventsRes,
                                            ...newVenueCode
                                        };
                                        this.setState(
                                            {
                                                name: eventsRes.title,
                                                description:
                                                    eventsRes.description,
                                                image: image,
                                                type: 'image',
                                                pdfMenuPath:
                                                    eventsRes && eventsRes.menu
                                                        ? eventsRes.menu
                                                        : '',
                                                dinnerType: dinnerType,
                                                location:
                                                    venueRes &&
                                                    venueRes.location
                                                        ? venueRes.location
                                                        : '',
                                                showLodaer: false
                                            },
                                            () => {
                                                if (
                                                    this.props.isBookingPage &&
                                                    eventsRes
                                                ) {
                                                    this.props.diningCallback(
                                                        [newEventRes],
                                                        [eventsRes.code],
                                                        [eventsRes]
                                                    );
                                                } else {
                                                    this.setsessionStorageInfo();
                                                }
                                            }
                                        );
                                    }
                                );
                            } else {
                                const image = {
                                    alt: eventsRes.title,
                                    0: {
                                        '1x': `${eventsRes.bannerImage}`,
                                        '2x': `${eventsRes.bannerImage}`
                                    },
                                    376: {
                                        '1x': `${eventsRes.bannerImage}`,
                                        '2x': `${eventsRes.bannerImage}`
                                    },
                                    769: {
                                        '1x': `${eventsRes.bannerImage}`,
                                        '2x': `${eventsRes.bannerImage}`
                                    }
                                };
                                this.setState(
                                    {
                                        name: eventsRes.title,
                                        description: eventsRes.description,
                                        image: image,
                                        type: 'image',
                                        pdfMenuPath: eventsRes && eventsRes.menu ? eventsRes.menu : '',
                                        dinnerType: dinnerType,
                                        location: '',
                                        showLodaer: false
                                    },
                                    () => {
                                        if (
                                            this.props.isBookingPage &&
                                            eventsRes
                                        ) {
                                            this.props.diningCallback(
                                                [eventsRes],
                                                [eventsRes.code],
                                                [eventsRes]
                                            );
                                        } else {
                                            this.setsessionStorageInfo();
                                        }
                                    }
                                );
                            }
                        } else {
                            this.setState({
                                showLodaer: false
                            }) 
                        }
                    });
                } else {
                    this.setState({
                        showLodaer: false
                    })
                }
            });
        }
    };

    /**
     * getMaxHeight - returns maxHeight set in available view
     * @returns {number} maxHeight - max height
     */
    getMaxHeight = () => {
        const { isLVP = false, isMVP = false } = this.state;

        if (isLVP) {
            return this.maxHeight['lvp'];
        } else if (isMVP) {
            return this.maxHeight['mvp'];
        } else {
            return this.maxHeight['svp'];
        }
    };

    /**
     * handleReadMore - Click handler for readMore/readLess
     */
    handleReadMore = () => {
        this.setState(
            {
                active: !this.state.active
            },
            () => {
                let linkText = '';

                linkText = this.state.active
                    ? this.props.readMore
                    : this.props.readLess;

                let analyticsParams = {
                    linkText,
                    componentName: this.props.component
                };

                analytics.customClicks(analyticsParams);
            }
        );
    };

    /**
     * toggleFavorite - set or reset favorites
     *
     * @param  {number} favItemId  id of the shoreX
     * @returns {boolean} is shores users favorite?
     */
    isFavorite(favItemId) {
        return Cookie.get(COOKIE_FAVORITE_SHOREX).indexOf(favItemId) !== -1;
    }

    render() {
        const {
            readLess,
            backLabel,
            includedLabel,
            additionalLabel,
            fromPriceLabel, //CK
            perPersonLabel,
            viewMenuLabel,
            complementryLabel,
            diningNotAvailableLabel
        } = this.props;
        let readMoreLabel = this.props.readMore;
        let {
            mealPeriods,
            pricesFrom,
            isEvent,
            included,
            readMore,
            active,
            complementryVenues,
            venueType
        } = this.state;
        const venueTypeValue = venueType != undefined ? venueType : '';

        const currency = pricesFrom
            ? getPriceSymbolForCurrencyCode(pricesFrom.currencyIso)
            : '';
        return (
            <div className="with-diningtab">
                {this.state.showLodaer && (
                    <div className="throbberOverlay">
                        <Loader show={this.state.showLodaer} />
                    </div>
                )}
                <div
                    className="dining-key-info"
                    ref={(diningKeyInfoMycruise) =>
                        (this.diningKeyInfoMycruise = diningKeyInfoMycruise)
                    }
                >
                    <div className="ht-background">
                        <div className="overlay" />
                        {this.state.image && this.createBackground()}
                    </div>
                    <div className="infocard-wrapper">
                        <a
                            href="#"
                            className="infocard-back"
                            data-linktext={backLabel}
                            onClick={() => window.history.back()}
                        >
                            <span>{backLabel}</span>
                        </a>
                        <div className="infocard-wrapperAux">
                            <div className="infocard">
                                <div className="header">
                                    <h1 className="title">{this.state.name}</h1>

                                    {this.state.location && (
                                        <div
                                            className="subtitles"
                                            ref="scrollTarget"
                                        >
                                            <ul>
                                                <li className="subtitle">
                                                    <h4 className="subtitle-item--location">
                                                        {this.state.location}
                                                    </h4>
                                                </li>
                                            </ul>
                                        </div>
                                    )}
                                    <div
                                        className="subtitles"
                                        ref="scrollTarget"
                                    >
                                        <ul>
                                            <li className="subtitle">
                                                {venueTypeValue.toLowerCase() ==
                                                    'included_bookable' ||
                                                venueTypeValue.toLowerCase() ==
                                                    'included_nonbookable' ? (
                                                    <span className="subtitle-item--additional">
                                                        <span>
                                                            {includedLabel}{' '}
                                                        </span>
                                                    </span>
                                                ) : (
                                                    <span className="subtitle-item--additional">
                                                        <span>
                                                            {additionalLabel}{' '}
                                                        </span>
                                                    </span>
                                                )}
                                            </li>
                                            {this.state.dinnerType.length >
                                            0 ? (
                                                <li className="subtitle">
                                                    <span className="subtitle-item--dinnerType">
                                                        <span>
                                                            {this.state.dinnerType.join(
                                                                ', '
                                                            )}
                                                        </span>
                                                    </span>
                                                </li>
                                            ) : (
                                                ''
                                            )}
                                            {this.state.pdfMenuPath && (
                                                <li className="subtitle">
                                                    <a
                                                        href={
                                                            this.state
                                                                .pdfMenuPath
                                                        }
                                                        target="_blank"
                                                    >
                                                        <span className="subtitle-item--menu">
                                                            {viewMenuLabel}
                                                        </span>
                                                    </a>
                                                </li>
                                            )}
                                            {/* {!isEvent && (
                                                <li className="subtitle">
                                                    {mealPeriods &&
                                                        this.createMealTimes()}
                                                </li>
                                            )} */}
                                        </ul>
                                    </div>
                                    {!this.props.isBookingPage && (
                                        <div className="dining-variant">
                                            {this.renderVariants()}
                                        </div>
                                    )}
                                </div>

                                {!this.props.isBookingPage &&
                                    this.state.description && (
                                        <div
                                            className={`desc ${
                                                readMore ? 'readmore' : ''
                                            } ${active ? 'open' : ''} `}
                                            dangerouslySetInnerHTML={{
                                                __html: this.state.description
                                            }}
                                        />
                                    )}
                                {/* {!this.props.isBookingPage &&
                                 this.state.description &&
                                 readMore && (
                                     <ReadMoreOrLess
                                         active={active}
                                         clickHandler={this.handleReadMore}
                                         readMoreLabel={readMoreLabel}
                                         readLessLabel={readLess}
                                         scrollToTarget={this.refs.scrollTarget}
                                         name={name}
                                         linkText={`${
                                             active ? readLess : readMoreLabel
                                         }`}
                                     />
                                 )} */}
                            </div>
                        </div>
                    </div>
                    {/* {this.state.chosenProduct && this.createModal()} */}
                </div>
                {!this.props.isBookingPage &&
                    this.state.diningDayX &&
                    ( this.state.venueType == 'limelight' || this.state.venueType == 'cookery' ) &&
                    this.state.limeLightEvents &&
                    this.state.limeLightEvents.length > 0 && (
                        <div>
                            <div className="react-component" />
                            <DiningTabsMycruise
                                {...this.props}
                                labels={this.props}
                                diningEvents={this.state.limeLightEvents}
                            />
                        </div>
                    )}
            </div>
        );
    }
}

export default diningKeyInfoMycruise;
