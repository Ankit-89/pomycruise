'use strict';

import React from 'react';
import EntertainmentTiles from '../entertainmentTiles';
import NotificationBanner from '../notificationBanner';

import { calculateAge, calculateDiffDays } from '../commons/CUK/dateFormat';
import FetchData from '../commons/CUK/fetch-data';
import Loader from '../commons/CUK/loader';
import SessionStorage from '../commons/CUK/session-storage';
import Link from '../commons/CUK/link';
import extractChildComponent from '../commons/CUK/extractChildComponent';
import analytics from '../commons/CUK/analytics';
import { getConfig, generateUniqueCode } from '../commons/CUK/utilities';
import moment from 'moment';
import PubSub from '../commons/CUK/pubsub';
import topics from '../../library/js/config/topics';

class eventscards extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showImageLodaer: false,
            purchasable: false,
            isTooLate: false,
            minorAgeCustomer: false,
            products: [],
            isNewSpaDetailTypeActive: true,
            customer: {},
            loadMore: 12,
            cardLoadonloadMore: 12,
            dataDays: 14,
            dataFetchedDate: null,
            reachedToLastDate: false,
            noEventsAvailable: false
        };
        this.showMoreEvents = this.showMoreEvents.bind(this);
    }

    componentDidMount() {
        const { isNewSpaDetailTypeActive } = this.state;
        const brand = getConfig('brand', '');
        this.getProductsList();
		const addToCartPopUp = SessionStorage.getItem('addToCartPopUp') || {};
        if (Object.keys(addToCartPopUp).length && addToCartPopUp.isPopUpShow) {
            const {
                name,
                total,
                currency,
                numberOfItems,
                eventDescription,
                eventLowerDescription,
                show_event_Description
            } = addToCartPopUp;
            this.showConfirmation(
                name,
                currency,
                total,
                numberOfItems,
                eventDescription,
                eventLowerDescription,
                show_event_Description
            );
            addToCartPopUp['isPopUpShow'] = false;
            SessionStorage.setItem('addToCartPopUp', addToCartPopUp);
        }
    }

    showConfirmation = (
        name,
        currency,
        total,
        numberOfItems,
        eventDescription,
        eventLowerDescription,
        show_event_Description
    ) => {
        PubSub.publish(topics.ADD_TO_CART, {
            name,
            currency,
            total,
            numberOfItems,
            eventDescription,
            eventLowerDescription,
            show_event_Description
        });
    };

    showMoreEvents(e) {
        e && e.preventDefault();
        if (
            this.state.loadMore + this.state.cardLoadonloadMore <=
                this.state.products.length ||
            this.state.reachedToLastDate
        ) {
            this.setState({
                loadMore: this.state.loadMore + this.state.cardLoadonloadMore
            });
        } else {
            this.setState({
                loadMore: this.state.loadMore + this.state.cardLoadonloadMore
            });
        }
    }
    /**
     * getProductList - API call to get the product instances
     */
    getProductsList() {
        const apikeyMycruise = getConfig('apikeyMycruise', '');
        const {
            services,
            productDetailServlet,
            heroVariation,
            solrCollectionName
        } = this.props;
        const { brand } = services.headers;
        const { shipEventAPi, pathSolrHandler, bookedEventAPi } = services.urls;
        const header = SessionStorage.getItem('header');
        const cruiseSummaryData = SessionStorage.getItem('cruiseSummaryData');
        const { customer } = JSON.parse(JSON.stringify(header));

        const cruiseData = SessionStorage.getItem('cruiseData');
        let pageUrl = window.location.href.split('/');
        const eventCategory = pageUrl[pageUrl.length - 1]; //SessionStorage.getItem('eventCategory');
        const imageRatioDecide = ['films'];
        header.passengers.forEach((passenger) => {
            if (customer.PaxNumber == passenger.paxNumber) {
                customer['guestId'] = passenger.guestId;
            }
        });
        const config = typeof window !== 'undefined' ? window.configs : '';
        const customCurrencyCode =
            config.brand.toLowerCase() === 'po' ? 'gbp' : 'usd';
        let startTime = cruiseSummaryData.itineraryBooking.embarkTime + '00';
        const { embarkationDate } = header;
        const API = `${shipEventAPi}/${header.shipCode}`;
        const bookedEventURL = `${bookedEventAPi}`;
        const SolarAPI = `${pathSolrHandler}${solrCollectionName}/getEvents?q=*%3A*&fq=`;
        const servlet = shipEventAPi;
        const preCruiseValue = 'PRE_CRUISE_AVAILABLE';
        const currentDate = header.embarkationDate;
        const { maxRequestdaysEvents } = window.configs;
        let embarkationEndDate = header.disembarkationDate;
        if (maxRequestdaysEvents) {
            const daysAdded = moment(currentDate, 'YYYY-MM-DD').add(
                maxRequestdaysEvents,
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
        // const startDate = `${currentDate.getFullYear()}${(
        //     currentDate.getMonth() + 1
        // )
        //     .toString()
        //     .padStart(2, '0')}${currentDate
        //     .getDate()
        //     .toString()
        //     .padStart(2, '0')}${currentDate
        //     .getHours()
        //     .toString()
        //     .padStart(2, '0')}${currentDate
        //     .getMinutes()
        //     .toString()
        //     .padStart(2, '0')}${currentDate
        //     .getSeconds()
        //     .toString()
        //     .padStart(2, '0')}`;

        // const endDate = `${embarkationEndDate.getFullYear()}${(
        //     embarkationEndDate.getMonth() + 1
        // )
        //     .toString()
        //     .padStart(2, '0')}${embarkationEndDate
        //     .getDate()
        //     .toString()
        //     .padStart(2, '0')}${embarkationEndDate
        //     .getHours()
        //     .toString()
        //     .padStart(2, '0')}${embarkationEndDate
        //     .getMinutes()
        //     .toString()
        //     .padStart(2, '0')}${embarkationEndDate
        //     .getSeconds()
        //     .toString()
        //     .padStart(2, '0')}`;
        const url = API; // brand === 'po' ? API : servlet;

        const requestBody = {
            data: {
                startDateTime: startDate, //'20210401170800',
                endDateTime: endDate, //'20210530170800',
                guests: [customer.guestId],
                partySize: 1,
                numberOfWheelchairsInParty: 0,
                venueCodes: [],
                types: [],
                categories: [`${eventCategory}`]
                // categories: ['RECEPTION']
            }
        };
        this.setState({
            showImageLodaer: true
        });
        const requestHeaders = {
            'Content-Type': 'application/json',
            'X-Source-Identity-Token-0': apikeyMycruise
        };
        return FetchData(url, {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: requestHeaders
        }).then((res) => {
            if (res && res.success === 'true') {
                if (res.data[0] && res.data[0].events) {
                    //ship events found in list
                    const { events } = res.data[0];
                    let filterEvents = [];
                    let solarRequest = [];
                    events.map((e, i) => {
                        if (
                            e.eventCode &&
                            e.categories.length &&
                            e.categories.indexOf(preCruiseValue) > '-1'
                        ) {
                            let index = solarRequest.indexOf(
                                `code:${e.eventCode}`
                            );
                            if (index == '-1') {
                                filterEvents.push(e);
                                solarRequest.push(`code:${e.eventCode}`);
                            } else {
                                filterEvents[index].inventory = [
                                    ...filterEvents[index].inventory,
                                    ...e.inventory
                                ];
                            }
                        }
                    });
                    if (solarRequest.length) {
                        let sr = solarRequest.join(' OR ');
                        sr = `${SolarAPI}(${sr} )&rows=${solarRequest.length +
                            5}`;
                        FetchData(sr, {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        }).then((solarData) => {
                            if (
                                solarData &&
                                solarData.response &&
                                solarData.response.numFound
                            ) {
                                let solarResult = solarData.response.docs;
                                let result = solarResult.map((obj) => {
                                    let data = filterEvents.find(
                                        (item) => item.eventCode === obj.code
                                    );
                                    return { ...obj, ...data };
                                });
                                const requestHeaders = {
                                    'Content-Type': 'application/json',
                                    'X-Source-Identity-Token-0': apikeyMycruise,
                                    'X-CommonData': JSON.stringify(header)
                                };

                                let bookedAPI = `${bookedEventAPi}?category=${eventCategory}&paxId=${
                                    header.customer.PaxNumber
                                }`;
                                return FetchData(bookedAPI, {
                                    method: 'GET',
                                    headers: requestHeaders
                                }).then((response) => {
                                    try {
                                        const { bookedEvents } = response;
                                        res = result;
                                        const treatments = res;
                                        let imageSize =
                                            imageRatioDecide.indexOf(
                                                eventCategory.toLowerCase()
                                            ) > '-1'
                                                ? 'image.420.560.low.jpg'
                                                : 'image.750.560.low.jpg';
                                        const newTreatments = treatments.map(
                                            (treatment) => {
                                                const image = {
                                                    alt: treatment.title,
                                                    0: {
                                                        '1x': `${
                                                            treatment.bannerImage
                                                        }.${imageSize}`,
                                                        '2x': `${
                                                            treatment.bannerImage
                                                        }.${imageSize}`
                                                    },
                                                    376: {
                                                        '1x': `${
                                                            treatment.bannerImage
                                                        }.${imageSize}`,
                                                        '2x': `${
                                                            treatment.bannerImage
                                                        }.${imageSize}`
                                                    },
                                                    769: {
                                                        '1x': `${
                                                            treatment.bannerImage
                                                        }.${imageSize}`,
                                                        '2x': `${
                                                            treatment.bannerImage
                                                        }.${imageSize}`
                                                    }
                                                };
                                                treatment['image'] = image;
                                                let bookedEvent = [];
                                                bookedEvent =
                                                    bookedEvents &&
                                                    bookedEvents.length &&
                                                    bookedEvents.filter(
                                                        (bookedevents) => {
                                                            if (
                                                                bookedevents.eventCode ==
                                                                    treatment.eventCode &&
                                                                treatment.categories.indexOf(
                                                                    'ONLY_ATTEND_ONCE'
                                                                ) > '-1'
                                                            ) {
                                                                return true;
                                                            }
                                                        }
                                                    );
                                                treatment[
                                                    'alreadyBooked'
                                                ] = bookedEvent.length
                                                    ? true
                                                    : false;

                                                return treatment;
                                            },
                                            {}
                                        );
                                        let tempProducts = [
                                            ...this.state.products,
                                            ...newTreatments
                                        ];
                                        // tempProducts.push(newTreatments)
                                        this.setState(
                                            () => ({
                                                products: tempProducts,
                                                embarkationDate,
                                                showImageLodaer: false
                                            }),
                                            () => Promise.resolve
                                        );
                                    } catch (e) {
                                        res = result;
                                        const treatments = res;
                                        let imageSize =
                                            imageRatioDecide.indexOf(
                                                eventCategory.toLowerCase()
                                            ) > '-1'
                                                ? 'image.420.560.low.jpg'
                                                : 'image.750.560.low.jpg';
                                        const newTreatments = treatments.map(
                                            (treatment) => {
                                                
                                                const image = {
                                                    alt: treatment.title,
                                                    0: {
                                                        '1x': `${
                                                            treatment.bannerImage
                                                        }.${imageSize}`,
                                                        '2x': `${
                                                            treatment.bannerImage
                                                        }.${imageSize}`
                                                    },
                                                    376: {
                                                        '1x': `${
                                                            treatment.bannerImage
                                                        }.${imageSize}`,
                                                        '2x': `${
                                                            treatment.bannerImage
                                                        }.${imageSize}`
                                                    },
                                                    769: {
                                                        '1x': `${
                                                            treatment.bannerImage
                                                        }.${imageSize}`,
                                                        '2x': `${
                                                            treatment.bannerImage
                                                        }.${imageSize}`
                                                    }
                                                };
                                                treatment['image'] = image;
                                                treatment[
                                                    'alreadyBooked'
                                                ] = false;

                                                return treatment;
                                            },
                                            {}
                                        );
                                        let tempProducts = [
                                            ...this.state.products,
                                            ...newTreatments
                                        ];
                                        // tempProducts.push(newTreatments)
                                        this.setState(
                                            () => ({
                                                products: tempProducts,
                                                embarkationDate,
                                                showImageLodaer: false
                                            }),
                                            () => Promise.resolve
                                        );
                                    }
                                });
                            } else {
                                // no solar record found as per response
                                this.setState({
                                    noEventsAvailable: true,
                                    showImageLodaer: false
                                });
                            }
                        });
                    } else {
                        // no any event having event code
                        this.setState({
                            noEventsAvailable: true,
                            showImageLodaer: false
                        });
                    }
                } else {
                    //no record found in particular category
                    this.setState({
                        noEventsAvailable: true,
                        showImageLodaer: false
                    });
                }
                const treatments = res;
            } else {
                //API error
                this.setState({
                    noEventsAvailable: true,
                    showImageLodaer: false
                });
            }

            // analytics.setAdditionalPageTrackAttributes({
            //     myCruiseDetails: {
            //         bookingNumber: header.bookingRef,
            //         voyageID: header.cruiseCode,
            //         voyageName: cruiseData.cruiseName,
            //         shipName: cruiseData.shipName,
            //         depDate: header.embarkationDate,
            //         destName: '',
            //         durationDays: header.physicalCruiseDuration,
            //         depPortName: cruiseData.embarkPort,
            //         destPortName: cruiseData.disembarkPort,
            //         stateroomType: '',
            //         numGuests: header.passengers.length,
            //         dob: dobArray
            //     },
            //     loginStatus: 'logged in',
            //     loginType: header.agent ? header.agent.agentType : 'customer',
            //     AgentID: header.agent ? header.agent.id : '',
            //     crmID: '',
            //     country: header.market,
            //     languageSelected: header.language.substring(0, 2),
            //     customCurrencyCode: customCurrencyCode,
            //     memberLoyaltyLevel: header.customer.loyaltyTier,
            //     server: '',
            //     localDayTime: new Date().toString(),
            //     timePartingCodes: '',
            //     pageType: config.pageName,
            //     //Please refer Page and Content Hierarchy Tabs for below values
            //     sectionLevelOne: '',
            //     sectionLevelTwo: '',
            //     sectionLevelThree: '',
            //     sectionLevelFour: '',
            //     pageName: config.pageName,
            //     pageChannel: '',
            //     pageHier: '',
            //     //Please refer Page and Content Hierarchy Tabs for above values
            //     ecomStep: '',
            //     event: 'prodView',
            //     myCruiseProduct: {
            //         status: '',
            //         productID: productIdForAnalytics,
            //         productName: '',
            //         productType: 'spa',
            //         startDateTime: '',
            //         unitSalePrice_GBP: '',
            //         unitPrice_GBP: '',
            //         unitSalePrice_local: '',
            //         unitPrice_local: '',
            //         shorexAttributes: {
            //             portName: '',
            //             language: '',
            //             activityLevel: '',
            //             duration: '',
            //             transport: '',
            //             minAge: '',
            //             maxAge: '',
            //             tourType: [''],
            //             tourCategory: '',
            //             tourFeatures: ''
            //         },
            //         diningCategory: '',
            //         unitPriceChild_GBP: '',
            //         unitPriceChild_local: '',
            //         skus: skusArr
            //     }
            // });
        });
    }

    renderNewSpaComponent = (product, index) => (
        <div className="entertainment-detail-tile tile-detail" key={index}>
            <EntertainmentTiles
                {...product}
                key={index}
                index={index}
                labels={this.props.labels}
                services={this.props.services}
                newType={true}
            />
        </div>
    );

    render() {
        const { childComponents, services, heroVariation, labels } = this.props;
        const { brand } = services.headers;
        const {
            products,
            minorAgeCustomer,
            chosenProduct,
            isNewSpaDetailTypeActive,
            noEventsAvailable
        } = this.state;
        const notificationBannerProps = extractChildComponent(
            childComponents,
            'notificationBanner'
        );
        const theProducts = Object.values(products);
        return (
            <div>
                {!noEventsAvailable &&
                    isNewSpaDetailTypeActive && (
                        <div className="entertainment-tiles-container">
                            <div className="tiles-container">
                                {theProducts.length > 0 &&
                                    theProducts
                                        .slice(0, this.state.loadMore)
                                        .map(this.renderNewSpaComponent)}
                            </div>
                            {this.state.showImageLodaer && (
                                <div className="throbberOverlay image-lazy-loader spinner" />
                            )}
                            {theProducts.length &&
                            !this.state.showImageLodaer &&
                            this.state.loadMore < theProducts.length ? (
                                <div className="cta-container">
                                    <a
                                        onClick={this.showMoreEvents}
                                        href="/#"
                                        className="cta-primary"
                                        data-linktext={
                                            'label: ' +
                                            this.props.labels.loadMoreLabel
                                        }
                                    >
                                        {this.props.labels.loadMoreLabel}
                                    </a>
                                </div>
                            ) : (
                                ''
                            )}
                        </div>
                    )}
                {noEventsAvailable && (
                    <div>
                        <div className={`tileH1-section`}>
                            <div className="title-component">
                                <div className="inner-container">
                                    <span className="icon-heading" />
                                    <h1 className="title entertainment">
                                        {labels.noEventsAvailableLabel}
                                    </h1>
                                </div>
                            </div>
                        </div>
                        <div className="cta-container center">
                            <Link
                                ariaLabel={labels.goBackLabel}
                                title={labels.goBackLabel}
                                linkClassName={`cta-primary`}
                                onClick={() => window.history.back()}
                            >
                                {labels.goBackLabel}
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

eventscards.defaultProps = {
    contentLabel: 'eventscards'
};

export default eventscards;
