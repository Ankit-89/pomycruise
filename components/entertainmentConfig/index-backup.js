'use strict';

import React from 'react';
import SessionStorage from '../commons/CUK/session-storage';
import { getConfig } from '../commons/CUK/utilities';
import validateSession from '../commons/CUK/validateSession';
import EntertainmentConfigLabels from '../entertainmentConfigLabels';
import EntertainmentDetailHeroTile from '../entertainmentDetailHeroTile';
import FetchData from '../commons/CUK/fetch-data';
import moment from 'moment';
import PubSub from '../commons/CUK/pubsub';
import topics from '../../library/js/config/topics';

class entertainmentconfig extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            purchasable: true,
            products: []
        };
        // debugger;
    }

    componentDidMount() {
        if (!validateSession.checkCookie(['wcmmode'])) {
            // window.addEventListener('beforeunload', this.setSessionStorageInfo);
        }
    }

    componentWillMount() {
        this.getEventsDetails();
    }

    getEventsDetails() {
        console.log('props on entertainment card list', this.props);
        const apikeyMycruise = getConfig('apikeyMycruise', '');
        const {
            services,
            productDetailServlet,
            heroVariation,
            solrCollectionName
        } = this.props;
        const { brand } = services.headers;
        const { shipEventAPi, pathSolrHandler } = services.urls;
        const header = SessionStorage.getItem('header');
        const { customer } = header;

        const cruiseData = SessionStorage.getItem('cruiseData');
        let pageUrl = window.location.href.split('/');
        const eventCategory = pageUrl[pageUrl.length - 2]; //SessionStorage.getItem('eventCategory');
        const eventId = pageUrl[pageUrl.length - 1]; //SessionStorage.getItem('eventCategory');
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
        const SolarAPIVenue = `${pathSolrHandler}${solrCollectionName}/getVenues?q=*%3A*&fq=`;
        const servlet = shipEventAPi;

        const currentDate = new Date(header.embarkationDate);
        const { maxRequestdaysEvents } = window.configs;
        //const maxRequestdaysEvents = 14;
        let embarkationEndDate = '';
        if (maxRequestdaysEvents) {
            const daysAdded = moment(currentDate, 'YYYY-MM-DD').add(
                maxRequestdaysEvents,
                'days'
            );
            embarkationEndDate = new Date(daysAdded);
        }

        const startDate = `${currentDate.getFullYear()}${(
            currentDate.getMonth() + 1
        )
            .toString()
            .padStart(2, '0')}${currentDate
            .getDate()
            .toString()
            .padStart(2, '0')}${currentDate
            .getHours()
            .toString()
            .padStart(2, '0')}${currentDate
            .getMinutes()
            .toString()
            .padStart(2, '0')}${currentDate
            .getSeconds()
            .toString()
            .padStart(2, '0')}`;

        const endDate = `${embarkationEndDate.getFullYear()}${(
            embarkationEndDate.getMonth() + 1
        )
            .toString()
            .padStart(2, '0')}${embarkationEndDate
            .getDate()
            .toString()
            .padStart(2, '0')}${embarkationEndDate
            .getHours()
            .toString()
            .padStart(2, '0')}${embarkationEndDate
            .getMinutes()
            .toString()
            .padStart(2, '0')}${embarkationEndDate
            .getSeconds()
            .toString()
            .padStart(2, '0')}`;

        //const url = brand === 'po' ? API : servlet;
        const url = brand === 'po' ? API : servlet;
        //debugger;
        const requestBody = {
            data: {
                startDateTime: startDate, //'20210401170800',
                endDateTime: endDate, //'20210530170800',
                //startDateTime: '20210510053000', //'20210401170800',
                //endDateTime: '20210524053000', //'20210530170800',
                guests: [customer.guestId],
                //guests: ['4E736015-859A-4B7F-A5EA-ED4AB2A7EEA2'],
                partySize: 1,
                numberOfWheelchairsInParty: 0,
                venueCodes: [],
                types: [],
                categories: [`${eventCategory}`]
                //categories: ['ENTERTAINMENT']
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
            // debugger;
            if (res.success === 'true') {
                if (res.data[0].events) {
                    //ship events found in list
                    const { events } = res.data[0];
                    //debugger;
                    let eventData = events.find(
                        (item) => item.eventId === eventId
                    );
                    let sr = `${SolarAPI}(code:${eventData.eventCode} )`;
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
                            let result = solarResult.map((obj) => {
                                let eventsData = events.find(
                                    (item) => item.eventId === eventId
                                );
                                return { ...obj, ...eventsData };
                            });
                            let eventDetailResult = [result];
                            //res = result;
                            //debugger;
                            console.log('result==>', JSON.stringify(result));
                            //debugger;
                            this.setState(
                                () => ({
                                    products: eventDetailResult
                                }),
                                () => Promise.resolve
                            );
                            //debugger;
                        } else {
                            // no solar record found as per response
                        }
                    });
                    // } else {
                    //     // no any event having event code
                    // }
                } else {
                    //no record found in particular category
                }
            } else {
                //API error
            }
        });
    }

    render() {
        const { products } = this.state;
        const theProducts = products[0];
        // console.log('heroTileProps===>', heroTileProps);
        return (
            <div>
                <EntertainmentDetailHeroTile
                    labels={this.props.labels}
                    eventsDetailsData={theProducts}
                />
                <EntertainmentConfigLabels
                    labels={this.props.labels}
                    eventsDetailsData={theProducts}
                />
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
