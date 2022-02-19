'use strict';

import React from 'react';
import validateSession from '../commons/CUK/validateSession';
import DiningBookingConfigLabels from '../diningBookingConfigLabels';
import DiningKeyInfoMycruise from '../diningKeyInfoMycruise';
import SessionStorage from '../commons/CUK/session-storage';
import analytics from '../commons/CUK/analytics';

class diningBookingConfig extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            showLodaer: false,
            purchasable: true,
            bookedDiningData: [],
            bookedEventData: [],
            checkBookedPassengers: false,
            checkIncluded: false,
            checkErrorShipEventApi: false,
            limelightEvents: [],
            checkExperiencesValue: false
        };
    }

    componentDidMount() {
        if (!validateSession.checkCookie(['wcmmode'])) {
            // window.addEventListener('beforeunload', this.setSessionStorageInfo);
        }
    }

    componentWillMount() {
        this.setState({
            showLodaer: true
        });
    }

    setBookedDiningData = (data, eventList = [], e = []) => {
        const venueTypeValue =
            data[0].venueType != undefined ? data[0].venueType : '';
        const checkIncluded =
            venueTypeValue.toLowerCase() === 'included_bookable' ||
            venueTypeValue.toLowerCase() === 'included_nonbookable'
                ? true
                : false;
        const checkLimelightCookery =
            venueTypeValue.toLowerCase() === 'limelight' ||
            venueTypeValue.toLowerCase() === 'cookery'
                ? true
                : false;
        const checkVenueEvent = venueTypeValue != '' ? true : false;
        if (!checkLimelightCookery && checkVenueEvent) {
            this.setAnalyticsOnLoad(data[0].code, eventList);
        } else if (!checkLimelightCookery && !checkVenueEvent) {
            this.setAnalyticsOnLoad(data[0].venueCode, eventList);
        }
        this.setState({
            bookedDiningData: data,
            checkIncluded: checkIncluded,
            checkExperiencesValue: e.length ? false : true
        });
    };

    setAnalyticsOnLoad = (venueCode = '', eventCode = []) => {
        const header = SessionStorage.getItem('header');
        const cruiseData = SessionStorage.getItem('cruiseData');
        let dobArray = [];
        header.passengers.forEach((passenger) => {
            dobArray.push(passenger.birthDate);
        });
        const config = typeof window !== 'undefined' ? window.configs : '';
        const customCurrencyCode =
            config.brand.toLowerCase() === 'po' ? 'gbp' : 'usd';

        analytics.setAdditionalPageTrackAttributes({
            myCruiseDetails: {
                bookingNumber: header.bookingRef,
                voyageID: header.cruiseCode,
                voyageName: cruiseData.cruiseName,
                shipName: cruiseData.shipName,
                depDate: header.embarkationDate,
                destName: '',
                durationDays: header.physicalCruiseDuration,
                depPortName: cruiseData.embarkPort,
                destPortName: cruiseData.disembarkPort,
                stateroomType: '',
                numGuests: header.passengers.length,
                dob: dobArray
            },
            loginStatus: 'logged in',
            loginType: header.agent ? header.agent.agentType : 'customer',
            AgentID: header.agent ? header.agent.id : '',
            crmID: '',
            country: header.market,
            languageSelected: header.language.substring(0, 2),
            customCurrencyCode: customCurrencyCode,
            memberLoyaltyLevel: header.customer.loyaltyTier,
            server: '',
            localDayTime: new Date().toString(),
            timePartingCodes: '',
            pageType: config.pageName,
            //Please refer Page and Content Hierarchy Tabs for below values
            sectionLevelOne: '',
            sectionLevelTwo: '',
            sectionLevelThree: '',
            sectionLevelFour: '',
            pageName: config.pageName,
            pageChannel: '',
            pageHier: '',
            //Please refer Page and Content Hierarchy Tabs for above values
            ecomStep: '',
            myCruiseProduct: {
                productType: 'dining',
                productId: venueCode,
                skus: eventCode
            }
        });
    };

    errorShipEventApi = (e) => {
        this.setState({
            checkErrorShipEventApi: e
        });
    };

    eventsListCallBack = (e, el) => {
        let elist = [],
            eventsList = [];
        const checkVenueType =
            e.length &&
            (e[0].venueType === 'limelight' ||
                (e && e[0].venueType === 'cookery'))
                ? true
                : false;
        if (checkVenueType) {
            e.map((event, i) => {
                let eventList = {};
                eventList['label'] = event.title;
                eventList['eventCode'] = event.code;
                eventList['value'] = i;
                eventList['venueType'] = event.venueType;
                eventList['venueCode'] = event.venueCode;
                eventsList.push(eventList);
                elist.push(event.code);
            });
        }
        this.setState(
            {
                limelightEvents: eventsList
            },
            () => {
                if (e && e[0].venueCode) {
                    this.setAnalyticsOnLoad(e[0].venueCode, elist);
                }
            }
        );
    };

    render() {
        const {
            bookedEventData,
            checkBookedPassengers,
            bookedDiningData,
            checkIncluded,
            checkErrorShipEventApi,
            limelightEvents,
            checkExperiencesValue
        } = this.state;

        return (
            <div>
                <DiningKeyInfoMycruise
                    isBookingPage={true}
                    {...this.props}
                    {...this.props.labels}
                    {...this.props.diningLabels}
                    diningCallback={this.setBookedDiningData}
                    errorShipEventApi={this.errorShipEventApi}
                    eventsListCallBack={this.eventsListCallBack}
                />
                <DiningBookingConfigLabels
                    labels={this.props.labels}
                    services={this.props.services}
                    {...this.props}
                    bookedEventData={bookedEventData}
                    checkBookedPassengers={checkBookedPassengers}
                    bookedDiningData={bookedDiningData}
                    checkIncluded={checkIncluded}
                    checkErrorShipEventApi={checkErrorShipEventApi}
                    limelightEvents={limelightEvents}
                    checkExperiencesValue={checkExperiencesValue}
                />
            </div>
        );
    }
}

export default diningBookingConfig;
