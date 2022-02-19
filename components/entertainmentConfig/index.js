'use strict';

import React from 'react';
import SessionStorage from '../commons/CUK/session-storage';
import { getConfig } from '../commons/CUK/utilities';
import validateSession from '../commons/CUK/validateSession';
import EntertainmentConfigLabels from '../entertainmentConfigLabels';
import EntertainmentDetailHeroTile from '../entertainmentDetailHeroTile';
import FetchData from '../commons/CUK/fetch-data';
import moment from 'moment';
import Loader from '../commons/CUK/loader';

class entertainmentconfig extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            showLodaer: false,
            purchasable: true,
            solrEventData: [],
            shipEventData: [],
            solrVenueData: [],
            bookedEventData: [],
            checkSoldOutEvent: false,
            checkBookedPassengers: false
        };
    }

    componentDidMount() {
        if (!validateSession.checkCookie(['wcmmode'])) {
            // window.addEventListener('beforeunload', this.setSessionStorageInfo);
        }
    }

    componentWillMount() {
        this.getEventsDetails();
        this.setState({
            showLodaer: true
        });
    }

    getEventsDetails() {
        console.log('props on entertainment card list', this.props);
        const apikeyMycruise = getConfig('apikeyMycruise', '');
        const {
            services,
            productDetailServlet,
            heroVariation,
            solrCollectionName,
            solrVenueCollectionName
        } = this.props;
        const { brand } = services.headers;
        const { shipEventAPi, pathSolrHandler, bookedEventAPi } = services.urls;
        const header = SessionStorage.getItem('header');
        const { customer } = JSON.parse(JSON.stringify(header));
        const cruiseData = SessionStorage.getItem('cruiseData');
        const cruiseSummaryData = SessionStorage.getItem('cruiseSummaryData');
        let pageUrl = window.location.href.split('/');
        const eventCategory = pageUrl[pageUrl.length - 2]; //SessionStorage.getItem('eventCategory');
        const code = pageUrl[pageUrl.length - 1]; //SessionStorage.getItem('eventCategory');
        header.passengers.forEach((passenger) => {
            if (customer.PaxNumber == passenger.paxNumber) {
                customer['guestId'] = passenger.guestId;
            }
        });
        const config = typeof window !== 'undefined' ? window.configs : '';
        const customCurrencyCode =
            config.brand.toLowerCase() === 'po' ? 'gbp' : 'usd';
        const { embarkationDate } = header;
        const API = `${shipEventAPi}/${header.shipCode}`;
        const SolarAPI = `${pathSolrHandler}${solrCollectionName}/getEvents?q=*%3A*&fq=`;
        const SolarAPIVenue = `${pathSolrHandler}${solrVenueCollectionName}/getVenues?q=*%3A*&fq=`;
        const BookedAPI = `${bookedEventAPi}?category=${eventCategory}`;
        const servlet = shipEventAPi;
        const preCruiseValue = 'PRE_CRUISE_AVAILABLE';
        //const currentDate = new Date(header.embarkationDate);
        const currentDate = header.embarkationDate;
        const embarkConvertedDate = moment(currentDate, 'YYYY-MM-DD').format(
            'YYYYMMDD'
        );
        const embarkTime = cruiseSummaryData.itineraryBooking.embarkTime;
        const startDate = `${embarkConvertedDate}${embarkTime}00`;

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
        const debarkConvertedDate = moment(
            embarkationEndDate,
            'YYYY-MM-DD'
        ).format('YYYYMMDD');
        const endDate = `${debarkConvertedDate}030000`;

        const url = brand === 'po' ? API : servlet;
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
            }
        };
        const requestHeaders = {
            'Content-Type': 'application/json',
            'X-Source-Identity-Token-0': apikeyMycruise
        };
        return FetchData(url, {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: requestHeaders
        }).then((res) => {
            if (res.success === 'true') {
                if (res.data[0].events) {
                    //ship events found in list
                    const { events } = res.data[0];

                    const eventData = [];
                    const listOfSoldOutInventory = [];

                    events.length > 0 &&
                        events
                            .filter((event) => event.eventCode == code)
                            .map((event, index) => {
                                const preCruiseAva = event.categories.find(
                                    (e) => e == preCruiseValue
                                );

                                const preCruiseAvailable =
                                    preCruiseAva == preCruiseValue
                                        ? true
                                        : false;

                                preCruiseAvailable &&
                                    eventData.push(event) &&
                                    event.inventory.map((inventry, i) => {
                                        if (inventry.status == 'Sold Out') {
                                            listOfSoldOutInventory.push(
                                                inventry
                                            );
                                        }
                                    });
                            });

                    const checkSoldOutEvent =
                        eventData.length == listOfSoldOutInventory.length
                            ? true
                            : false;

                    this.setState({
                        shipEventData: eventData,
                        checkSoldOutEvent: checkSoldOutEvent
                    });

                    FetchData(BookedAPI, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CommonData': JSON.stringify(header),
                            'X-Source-Identity-Token-0': apikeyMycruise
                        }
                    }).then((bookedData) => {
                        if (
                            bookedData.error ||
                            (bookedData.errors && bookedData.errors.length)
                        ) {
                            this.setState({
                                showLodaer: false
                            });
                        } else {
                            let bookedResult = bookedData.bookedEvents;

                            const guestArray = new Array();
                            const guestTotalArray = new Array();
                            const onlyAttendOnce = eventData[0].categories.find(
                                (e) => e == 'ONLY_ATTEND_ONCE'
                            );

                            const checkAttendOnlyOnce =
                                onlyAttendOnce == 'ONLY_ATTEND_ONCE'
                                    ? true
                                    : false;
                            for (let i = 0; i < bookedResult.length; i++) {
                                const guestList = bookedResult[i].guests;
                                const eventId = bookedResult[i].eventId;
                                const eventCode = bookedResult[i].eventCode;
                                const startDateTime =
                                    bookedResult[i].startDateTime;

                                for (let j = 0; j < guestList.length; j++) {
                                    const paxId = guestList[j].paxId;
                                    const guestId = guestList[j].guestId;
                                    guestArray.push({
                                        guestId: guestId,
                                        paxId: paxId,
                                        eventId: eventId,
                                        eventCode: eventCode,
                                        startDateTime: startDateTime
                                    });
                                    if (checkAttendOnlyOnce) {
                                        const bookedGuestCheck = guestTotalArray.find(
                                            (paxIdList) =>
                                                paxIdList.paxId ==
                                                guestList[j].paxId
                                        );
                                        if (bookedGuestCheck == undefined) {
                                            guestTotalArray.push({
                                                paxId: paxId
                                            });
                                        }
                                    }
                                }
                            }
                            const checkBookedPassengerLength =
                                guestTotalArray.length ==
                                header.passengers.length
                                    ? true
                                    : false;

                            this.setState({
                                bookedEventData: guestArray,
                                showLodaer: false,
                                checkBookedPassengers: checkBookedPassengerLength
                            });
                        }
                    });
                    let sr = `${SolarAPI}(code:${eventData[0].eventCode} )`;
                    // solarRequest
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
                            this.setState({
                                solrEventData: solarResult,
                                showLodaer: false
                            });
                        } else {
                            // no solar record found as per response
                        }
                        let srVenue = `${SolarAPIVenue}(code:${
                            eventData[0].venueCode
                        } )`;
                        // solarRequest
                        FetchData(srVenue, {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        }).then((solarVenueData) => {
                            if (
                                solarVenueData &&
                                solarVenueData.response &&
                                solarVenueData.response.numFound
                            ) {
                                let solarVenueResult =
                                    solarVenueData.response.docs;
                                this.setState({
                                    solrVenueData: solarVenueResult
                                });
                            } else {
                                // no solar record found as per response
                            }
                        });
                    });
                    // } else {
                    //     // no any event having event code
                    // }
                } else {
                    //no record found in particular category
                }
            } else if (res.error) {
                //API error
                this.setState({
                    showLodaer: false
                });
            }
        });
    }

    render() {
        const {
            shipEventData,
            solrEventData,
            solrVenueData,
            checkSoldOutEvent,
            bookedEventData,
            checkBookedPassengers
        } = this.state;
        const theShipEventData = shipEventData[0];
        const theSolrEventData = solrEventData[0];
        const theSolrVenueData = solrVenueData.length
            ? solrVenueData[0]
            : solrVenueData;

        return (
            <div>
                {this.state.showLodaer && (
                    <div className="throbberOverlay">
                        <Loader show={this.state.showLodaer} />
                    </div>
                )}
                {theShipEventData &&
                    theSolrEventData &&
                    theSolrVenueData && (
                        <div>
                            <EntertainmentDetailHeroTile
                                labels={this.props.labels}
                                checkSoldOutEvents={checkSoldOutEvent}
                                eventsDetailsShipData={theShipEventData}
                                eventsDetailsSolrData={theSolrEventData}
                                VenueSolrData={theSolrVenueData}
                                bookedEventData={bookedEventData}
                                checkBookedPassengers={checkBookedPassengers}
                            />
                            <EntertainmentConfigLabels
                                labels={this.props.labels}
                                checkSoldOutEvents={checkSoldOutEvent}
                                services={this.props.services}
                                eventsDetailsShipData={theShipEventData}
                                eventsDetailsSolrData={theSolrEventData}
                                VenueSolrData={theSolrVenueData}
                                bookedEventData={bookedEventData}
                                checkBookedPassengers={checkBookedPassengers}
                            />
                        </div>
                    )}
            </div>
        );
    }
}

entertainmentconfig.defaultProps = {
    readMoreMaxHeight: {
        lvp: 154,
        mvp: 154,
        svp: 100
    }
};

export default entertainmentconfig;
