'use strict';

import React from 'react';
import SessionStorage from '../commons/CUK/session-storage';
import FetchData from '../commons/CUK/fetch-data';
import extractChildComponent from '../commons/CUK/extractChildComponent';
import moment from 'moment';
import { plainDateFormat } from '../commons/CUK/dateFormat';
import CalendarViewWeek from './calendarViewWeek';
import CalendarViewMonth from './calendarViewMonth';
import CalendarViewDay from './calendarViewDay';
import CalendarFilter from './calendarFilter';
import BookedActivities from './bookedActivities';
import DayPicker from 'react-day-picker';
import { getPaxNumber } from '../commons/CUK/login-data-utility';
import Link from '../commons/CUK/link';
import analytics from '../commons/CUK/analytics';
import validateSession from '../commons/CUK/validateSession';

class calendar extends React.Component {
    constructor(props) {
        super(props);

		const country = typeof props !== 'undefined' && typeof props.services !== 'undefined' && typeof props.services.headers !== 'undefined' &&
							props.services.headers.country;
        this.state = {
            view: 'day',
            eventList: [],
            datepicker: false,
            filters: ['all'],
            country: country
        };
    }
    componentDidMount() {
        // analytics.clickTracking(this);
    }

    componentWillMount() {
        if (!validateSession.checkCookie(['wcmmode'])) {
            var loggedPaxNumber = getPaxNumber();
            const header = SessionStorage.getItem('header');

            let passengersData = SessionStorage.getItem('orderedList')
                .passengers;
            let userData = SessionStorage.getItem('userData');

            let firstName = passengersData[0].firstName;
            let lastName = passengersData[0].lastName;
            let brandCode = userData.brandCode;
            let bookingNumber = userData.bookingRef;
            let shipCode = brandCode.toLowerCase() === 'po' ? 'POC' : 'CUN';

            this.setState(
                {
                    header: header,
                    firstName: firstName,
                    lastName: lastName,
                    brandCode: brandCode,
                    bookingNumber: bookingNumber,
                    shipCode: shipCode,
                    loggedPaxNumber: parseInt(loggedPaxNumber)
                },
                () => {
                    this.loadCruiseDetails();
                }
            );
        }
		
        let width =
            typeof window !== 'undefined'
                ? window.innerWidth ||
                  (typeof document !== 'undefined' && document.documentElement.clientWidth) ||
                  (typeof document !== 'undefined' && document.body.clientWidth)
                : 0;
        let height =
            typeof window !== 'undefined'
                ? window.innerHeight ||
                  (typeof document !== 'undefined' && document.documentElement.clientHeight) ||
                  (typeof document !== 'undefined' && document.body.clientHeight)
                : 0;

        if (typeof navigator !== 'undefined') {
            if (
                /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
                    navigator.userAgent
                )
            ) {
                if (width > 1023 || height > 1023) {
                    typeof document !== 'undefined' && document.body.classList.add('ipad-pro');
                } else {
                    typeof document !== 'undefined' && document.body.classList.add('mobile');
                }
            }
        }
    }
    loadCruiseDetails = () => {
        let passengersData = SessionStorage.getItem('orderedList').passengers;
        let portCalls = SessionStorage.getItem('portCalls').portCalls;
        let userData = SessionStorage.getItem('userData');

        let cruiseSummaryItinerary = this.findIDL(portCalls);

        let diff = moment(userData.disembarkationDate, 'YYYY-MM-DD').diff(
            moment(userData.embarkationDate, 'YYYY-MM-DD')
        );
        let dur = moment.duration(diff);

        this.setState(
            {
                embarkationDate: plainDateFormat(
                    userData.embarkationDate,
                    'YYYY-MM-DD'
                ),
                disembarkationDate: plainDateFormat(
                    userData.disembarkationDate,
                    'YYYY-MM-DD'
                ),
                itineraryEvents: cruiseSummaryItinerary,
                destination: userData.cruiseName,
                duration: dur.asDays(),
                totalGuests: passengersData.length
            },
            () => {
                this.loadItinerary();
            }
        );
    };

    findIDL = (events) => {
        for (let i = 0; i < events.length; i++) {
            let event = events[i];
            let preEvent = i !== 0 ? events[i - 1] : events[i + 1];
            event.isPlusIDL = false;
            event.isMinusIDL = false;
            if (event.port && event.port.startPortCode) {
                if (event.port.startPortCode.$ === 'IDL') {
                    if (
                        moment(event.port.portCall.startDate).isSame(
                            moment(preEvent.port.portCall.startDate)
                        )
                    ) {
                        //case day is available and IDL
                        event.isPlusIDL = true;
                    } else {
                        // case day is disabled and IDL
                        event.isMinusIDL = true;
                    }
                }
            }
        }
        return events;
    };
    findIfIsIDL = (date) => {
        let idleType = 'no';
        this.state.itineraryEvents.forEach((event) => {
            if (event.port && event.port.portCall) {
                if (
                    moment(event.port.portCall.startDate).isSame(moment(date))
                ) {
                    if (event.isPlusIDL) {
                        idleType = 'plus';
                    } else if (event.isMinusIDL) {
                        idleType = 'minus';
                    }
                }
            }
        });
        return idleType;
    };
    findDockingInfo = (date) => {
        let dockingInfo = '';
        this.state.itineraryEvents.forEach((event) => {
            if (moment(event.port.portCall.startDate).isSame(moment(date))) {
                if (event.eventInfo) {
                    event.eventInfo.forEach((info) => {
                        switch (info.infoCode.$) {
                            case 'TR':
                            case 'PT':
                                dockingInfo = info.infoText;
                        }
                    });
                }
            }
        });
        return dockingInfo;
    };
    findDayType = (date) => {
        let dt = '';
        this.state.itineraryEvents.forEach((event) => {
            if (moment(event.port.portCall.startDate).isSame(moment(date))) {
                if(event.typeCode.$ !== 'PKG'){
                    dt = event.typeCode.$;
                }
            }
        });
        switch (dt) {
            case 'SEA':
                dt = 'sea';
                break;
            case 'PV':
                dt = 'port';
                break;
            case 'DEB':
                dt = 'disEmbarkation';
                break;
            case 'EMB':
                dt = 'embarkation';
                break;
        }
        return dt;
    };

    findPortInfo = (date) => {
        let port = {};
        this.state.itineraryEvents.forEach((event) => {
            if (moment(event.port.portCall.startDate).isSame(moment(date))) {
                port = event;
            }
        });

        return port;
    };

    loadItinerary = () => {
        const { urls, headers } = this.props.services;
        const apikey =
            typeof window !== 'undefined' ? window.configs.apikeyMycruise : '';
        const url = `${urls.calendarApi}?lang=${headers.locale}&bookingRef=${
            this.state.bookingNumber
        }&firstName=${this.state.firstName}&lastName=${
            this.state.lastName
        }&shipCode=${this.state.shipCode}`;

        let productData = '';
        const productUrl = urls.calendarProductsApi;
        FetchData(productUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-commondata': JSON.stringify(this.state.header),
                'X-Source-Identity-Token-0': apikey
            }
        }).then((res) => {
            if (res) {
                productData = res;
            }
        });

        if (typeof url !== 'undefined' && url !== '') {
            
            FetchData(url, {
                method: 'GET',
                headers: {
                    'x-commondata': JSON.stringify(this.state.header),
                    'Content-Type' : 'application/json',
                    'X-Source-Identity-Token-0': apikey
                }
            }).then((res) => {
                if (res) {
                    this.setInfoFromPassenger(res, productData);
                } else {
                    this.setInfoFromPassenger();
                    // console.log('error');
                }
            });
        }
    };

    setInfoFromPassenger = (data, productData) => {
        let allEvents = [];
        let cruisepackageevents = [];
        let cruiseEvents = [];
        let flights = [];
        let transfers = [];
        let hotels = [];
        let landtours = [];

        if (data && data.passengers) {
            data.passengers.forEach((passengerInfo) => {
                //if (passengerInfo.paxNumber === this.state.loggedPaxNumber) {
                if (passengerInfo.cruiseevents) {
                    passengerInfo.cruiseevents.map((passenger, index) => {
                        if (passenger) {
                            passenger.pnOrigin = passengerInfo.paxNumber;
                        } else {
                            passengerInfo.cruiseevents = passengerInfo.cruiseevents.splice(
                                index,
                                1
                            );
                        }
                    });
                    cruiseEvents = cruiseEvents.concat(
                        passengerInfo.cruiseevents
                    );
                }

                if (passengerInfo.flightDetails) {
                    passengerInfo.flightDetails.forEach((e) => {
                        e.pnOrigin = passengerInfo.paxNumber;
                    });
                    flights = flights.concat(passengerInfo.flightDetails);
                }

                if (passengerInfo.packages) {
                    passengerInfo.packages.forEach((e) => {
                        e.pnOrigin = passengerInfo.paxNumber;
                    });
                    hotels = hotels.concat(passengerInfo.packages);
                    transfers = transfers.concat(passengerInfo.packages);
                    landtours = landtours.concat(passengerInfo.packages);
                }

                // if (passengerInfo.cruisepackageevents) {
                //     passengerInfo.cruisepackageevents.forEach((e) => {
                //         e.pnOrigin = passengerInfo.paxNumber;
                //     });
                //     cruisepackageevents = cruisepackageevents.concat(
                //         passengerInfo.cruisepackageevents
                //     );
                // }

                //}
            });
        }

        hotels = hotels.length !== 0 ? this.arrangeHotelData(hotels) : hotels;
        transfers =
            transfers.length !== 0
                ? this.arrangeTransfersData(transfers)
                : transfers;

        flights =
            flights.length !== 0 ? this.arrangeFlightData(flights) : flights;

        landtours =
            landtours.length !== 0
                ? this.arrangeLandtourData(landtours)
                : landtours;

        let products = '';

        

        allEvents = cruiseEvents.concat(hotels);

        allEvents = allEvents.concat(flights);

        allEvents = allEvents.concat(transfers);

        allEvents = allEvents.concat(landtours);

        let ipsEvents = this.findIPSEvents();

        allEvents = allEvents.concat(ipsEvents);
        
        if (productData) {
            products = this.arrangeProductsData(productData);
            allEvents = allEvents.concat(products);
            productData.events.forEach((events)=>{
                if(events.eventType === 'SPA_EVENT') {
                    cruisepackageevents = cruisepackageevents.concat(
                        events
                    );
                }                
            });
            productData.packageEvents.forEach((events)=>{
                cruisepackageevents = cruisepackageevents.concat(
                    events
                );
            });
        }
        //allEvents = allEvents.concat(this.state.itineraryEvents);

        this.setState({
            loggedPassengerCruiseEvents: allEvents,
            outOfCalendarEvents: cruisepackageevents
        });

        this.arrangeData();
    };
    findIPSEvents = () => {
        let ipsEvents = [];
        this.state.itineraryEvents.forEach((event) => {
            if (event.eventInfo) {
                let isIPS = false;
                event.eventInfo.forEach((info) => {
                    switch (info.infoCode.$) {
                        case 'CB':
                        case 'CO':
                            isIPS = true;
                    }
                });
                isIPS ? ipsEvents.push(event) : null;
            }
        });
        ipsEvents =
            ipsEvents.length > 0 ? this.arrangeIPSEvents(ipsEvents) : ipsEvents;

        return ipsEvents;
    };
    arrangeIPSEvents = (ipsEvents) => {
        ipsEvents.forEach((event) => {
            event.startDateTime = event.port.portCall.startDate;
            event.endDateTime = event.port.portCall.endDate;
            event.eventType = {};
            event.eventType.$ = 'IPS_EVENT';
            event.eventSource = 'ORDER_SOURCE';
            event.location = event.port.portCall.portFromCode.$;
            if (event.eventInfo) {
                event.eventInfo.forEach((info) => {
                    switch (info.infoCode.$) {
                        case 'B1':
                        case 'B2':
                        case 'B3':
                            event.customArrivalTime = info.infoText;
                    }
                });
            }
        });
        return ipsEvents;
    };
    arrangeProductsData = (products) => {
        let newPackage = [];
        products.events.forEach((product) => {
            let newProduct = {};
            newProduct.code = product.eventCode;
            newProduct.recipients = [];
            newProduct.eventType = {};
            newProduct.eventType.$ = product.eventType;
            newProduct.eventSource = 'ORDER_SOURCE';
            newProduct.startDateTime = product.startDateTime;
            newProduct.endDateTime = product.endDateTime;
            let recipient = {};
            product.recipientPassengers.forEach((passenger)=>{    
                recipient = {};            
                recipient.paxNo = parseInt(passenger.paxNo);
                newProduct.recipients.push(recipient);
            });
            newProduct.name = product.name;
            newProduct.eventSize = newProduct.recipients.length;
            newProduct.ownerPassenger = SessionStorage.getItem(
                'leadPassenger'
            );
            newProduct.dayCount = 1;
            newPackage.push(newProduct);
        });

        return newPackage;
    };
    arrangeLandtourData = (pkgs) => {
        let newPackage = [];
        let codeSet = new Set(
            pkgs.map((item) => (item.packageType === 'L' ? item.code.$ : null))
        );
        codeSet.delete(null);
        let uniqueLandtourCodes = [...codeSet];
        uniqueLandtourCodes.forEach((code) => {
            let newLandtour = {};
            newLandtour.code = code;
            newLandtour.recipients = [];
            newLandtour.eventType = {};
            newLandtour.eventType.$ = 'LANDTOUR_EVENT';
            newLandtour.eventSource = 'ORDER_SOURCE';

            pkgs.forEach((passengerPackage) => {
                if (passengerPackage.code.$ === code) {
                    if (passengerPackage.packageType === 'L') {
                        let sdt;
                        let edt;
                        let landtourDuration = parseInt(
                            passengerPackage.nbrOfNightsQuantity.$
                        );
                        if (passengerPackage.typeCode.$ === 'B') {
                            edt = moment(this.state.embarkationDate);
                            sdt = moment(edt).subtract(
                                landtourDuration,
                                'days'
                            );
                        } else if (passengerPackage.typeCode.$ === 'A') {
                            sdt = moment(this.state.disembarkationDate);
                            edt = moment(sdt).add(landtourDuration, 'days');
                        }
                        !newLandtour.startDateTime
                            ? (newLandtour.startDateTime = sdt.format(
                                  'YYYY-MM-DD'
                              ))
                            : null;
                        !newLandtour.endDateTime
                            ? (newLandtour.endDateTime = edt.format(
                                  'YYYY-MM-DD'
                              ))
                            : null;
                        !newLandtour.duration
                            ? (newLandtour.duration = landtourDuration)
                            : null;
                        //
                    }

                    let recipient = {};
                    recipient.paxNo = passengerPackage.pnOrigin;
                    newLandtour.recipients.push(recipient);
                }
                newLandtour.name = passengerPackage.nameText;
            });
            let landtourCode = newLandtour.code;
            newLandtour.eventSize = newLandtour.recipients.length;

            // let urlLandtour = this.props.landtourServletUrl.replace( // CK - removed this code in SIT minified file
            //     '{LAND_TOURS_CODE}',
            //     landtourCode
            // );
            newLandtour.ownerPassenger = SessionStorage.getItem(
                'leadPassenger'
            );
            // FetchData(urlLandtour, {
            //     method: 'GET'
            // }).then((res) => {
            //     if (res) {
            //         res.name ? (newLandtour.name = res.name) : null;
            //     }
            // });

            newLandtour.dayCount = 1;
            if (newLandtour.duration > 1) {
                for (let i = 1; i < newLandtour.duration; i++) {
                    //const nnlt = Object.assign({}, newLandtour);
                    const nnlt = Object.create(newLandtour);
                    nnlt.startDateTime = moment(newLandtour.startDateTime)
                        .add(i, 'days')
                        .format('YYYY-MM-DD');
                    nnlt.dayCount = i + 1;
                    newPackage.push(nnlt);
                }
            }
            newPackage.push(newLandtour);
        });

        return newPackage;
    };
    setNoNameLandtoursIfAny = (code, nametext) => {};
    arrangeFlightData = (flights) => {
        let newFlights = [];
        let codeSet = new Set(flights.map((item) => item.flightNumber));

        let uniqueFlightsNumbers = [...codeSet];

        uniqueFlightsNumbers.forEach((code) => {
            let newFlight = {};
            newFlight.flightNumber = code;
            newFlight.recipients = [];
            newFlight.eventType = {};
            newFlight.eventType.$ = 'FLIGHT_EVENT';
            newFlight.eventSource = 'ORDER_SOURCE';
            flights.forEach((flight) => {
                if (flight.flightNumber === code) {
                    !newFlight.startDateTime
                        ? (newFlight.startDateTime = flight.departureDate)
                        : null;
                    !newFlight.endDateTime
                        ? (newFlight.endDateTime = flight.arrivalDate)
                        : null;
                    !newFlight.carrierNameText
                        ? (newFlight.carrierNameText = flight.carrierNameText)
                        : null;

                    if (
                        !newFlight.departureCityCode ||
                        !newFlight.arrivalCityCode
                    ) {
                        newFlight.departureCityCode = {};
                        newFlight.arrivalCityCode = {};
                        newFlight.departureCityCode.$ = departCode;
                        newFlight.arrivalCityCode.$ = arrivalCode;
                        let departCode = flight.departureCityCode.$;
                        let arrivalCode = flight.arrivalCityCode.$;
                        let urlAirports = `${
                            this.props.airportServletUrl
                        }.${departCode}.${arrivalCode}.json`;
                        
                        FetchData(urlAirports, {
                            method: 'GET'
                        }).then((res) => {
                            if (res) {
                                newFlight.departureCityCode.$ = res[departCode]
                                    ? res[departCode]
                                    : departCode;
                                newFlight.arrivalCityCode.$ = res[arrivalCode]
                                    ? res[arrivalCode]
                                    : arrivalCode;
                            }
                        });
                    }
                    let recipient = {};
                    let count = 0;
                    recipient.paxNo = flight.pnOrigin;
                    newFlight && newFlight.recipients.length && newFlight.recipients.forEach((passenger)=>{
                        if(passenger.paxNo == flight.pnOrigin){
                            count = 1;
                        }
                    })
                    if(count === 0){newFlight.recipients.push(recipient)}
                }
            });
            newFlight.eventSize = newFlight.recipients.length;
            newFlights.push(newFlight);
        });
        return newFlights;
    };

    arrangeTransfersData = (pkgs) => {
        let newPackage = [];
        let codeSet = new Set(
            pkgs.map((item) => (item.packageType === 'T' ? item.code.$ : null))
        );
        codeSet.delete(null);
        let uniqueTransferCodes = [...codeSet];
        uniqueTransferCodes.forEach((code) => {
            let newTransfer = {};
            newTransfer.code = code;
            newTransfer.recipients = [];
            newTransfer.eventType = {};
            newTransfer.eventType.$ = 'TRANSFER_EVENT';
            newTransfer.eventSource = 'ORDER_SOURCE';

            pkgs.forEach((passengerPackage) => {
                if (passengerPackage.code.$ === code) {
                    if (passengerPackage.packageType === 'T') {
                        let sdt;
                        let edt;
                        let transferDuration = parseInt(
                            passengerPackage.nbrOfNightsQuantity.$
                        );
                        if (passengerPackage.typeCode.$ === 'B') {
                            edt = moment(this.state.embarkationDate);
                            sdt = moment(edt).subtract(
                                transferDuration,
                                'days'
                            );
                        } else if (passengerPackage.typeCode.$ === 'A') {
                            sdt = moment(this.state.disembarkationDate);
                            edt = moment(sdt).add(transferDuration, 'days');
                        }
                        !newTransfer.startDateTime
                            ? (newTransfer.startDateTime = sdt.format(
                                  'YYYY-MM-DD'
                              ))
                            : null;
                        !newTransfer.endDateTime
                            ? (newTransfer.endDateTime = edt.format(
                                  'YYYY-MM-DD'
                              ))
                            : null;
                        !newTransfer.duration
                            ? (newTransfer.duration = transferDuration)
                            : null;
                        !newTransfer.nameText
                            ? (newTransfer.nameText = passengerPackage.nameText)
                            : null;
                    }

                    let recipient = {};
                    recipient.paxNo = passengerPackage.pnOrigin;
                    newTransfer.recipients.push(recipient);
                }
            });
            newTransfer.eventSize = newTransfer.recipients.length;
            newPackage.push(newTransfer);
        });

        return newPackage;
    };

    arrangeHotelData = (pkgs) => {
        let newPackage = [];
        let codeSet = new Set(
            pkgs.map((item) => (item.packageType === 'H' ? item.code.$ : null))
        );
        codeSet.delete(null);
        let uniqueHotelReservationCodes = [...codeSet];
        uniqueHotelReservationCodes.forEach((code) => {
            let newReservation = {};
            newReservation.code = code;
            newReservation.recipients = [];
            newReservation.eventType = {};
            newReservation.eventType.$ = 'HOTEL_EVENT';
            newReservation.eventSource = 'ORDER_SOURCE';

            pkgs.forEach((passengerPackage) => {
                if (passengerPackage.code.$ === code) {
                    if (passengerPackage.packageType === 'H') {
                        let sdt;
                        let edt;
                        let numberOfHotelNights = parseInt(
                            passengerPackage.nbrOfNightsQuantity.$
                        );
                        if (passengerPackage.typeCode.$ === 'B') {
                            edt = moment(this.state.embarkationDate);
                            sdt = moment(edt).subtract(
                                numberOfHotelNights,
                                'days'
                            );
                        } else if (passengerPackage.typeCode.$ === 'A') {
                            sdt = moment(this.state.disembarkationDate);
                            edt = moment(sdt).add(numberOfHotelNights, 'days');
                        }
                        !newReservation.startDateTime
                            ? (newReservation.startDateTime = sdt.format(
                                  'YYYY-MM-DD'
                              ))
                            : null;
                        !newReservation.endDateTime
                            ? (newReservation.endDateTime = edt.format(
                                  'YYYY-MM-DD'
                              ))
                            : null;
                        !newReservation.duration
                            ? (newReservation.duration = numberOfHotelNights)
                            : null;
                        !newReservation.nameText
                            ? (newReservation.nameText =
                                  passengerPackage.nameText)
                            : null;
                    }

                    let recipient = {};
                    recipient.paxNo = passengerPackage.pnOrigin;
                    newReservation.recipients.push(recipient);
                }
            });
            newReservation.eventSize = newReservation.recipients.length;
            newPackage.push(newReservation);
        });

        return newPackage;
    };

    arrangeData = () => {
        this.state.loggedPassengerCruiseEvents.forEach((event) => {
            let loggedIsPartOf = false;

            let date = plainDateFormat(event.startDateTime, 'YYYY-MM-DD');
            let hour = plainDateFormat(event.startDateTime, 'h:mm A');
            let endDate = plainDateFormat(event.endDateTime, 'YYYY-MM-DD');
            let diff = moment(endDate).diff(moment(date), 'days') + 1;
            event.hasDuration = false;
            // duration of an event in hours
            if (diff === 1 && event.duration) {
                event.duration = event.duration;
                event.hasDuration = true;
                event.durationType = 'hours';
            } else {
                if (event.eventType.$ !== 'HOTEL_EVENT') {
                    event.duration = diff;
                }
                if (diff > 1) {
                    event.hasDuration = true;
                    event.durationType = 'days';
                }
            }

            // let ms = moment(event.endDateTime, 'YYYY-MM-DD HH:mm:ss').diff(
            //     moment(event.startDateTime, 'YYYY-MM-DD HH:mm:ss')
            // );
            // let d = moment.duration(ms);
            // let s = Math.floor(d.asHours()) + moment.utc(ms).format(':mm:ss');

            //

            event.customDate = date;
            event.customHour = hour;

            !event.eventSource && event.eventSourceNameText
                ? (event.eventSource = event.eventSourceNameText)
                : null;

            // check nameText and name
            !event.name && event.nameText
                ? (event.name = event.nameText)
                : null;
            !event.description && event.descriptionText
                ? (event.description = event.descriptionText)
                : null;

            event.customEventType = this.convertEventType(event.eventType);
            event.isSpecialEvent =
                event.customEventType === 'gift' ||
                event.customEventType === 'hotel' ||
                event.customEventType === 'transfer' ||
                event.customEventType === 'ips' ||
                event.customEventType === 'landtour'
                    ? true
                    : false;
            // create a fake time for gifts and hotels
            event.isSpecialEvent ? (event.customHour = '-1 G') : null;

            !event.ownerPassenger && event.owner
                ? (event.ownerPassenger = event.owner)
                : null;
            !event.recipientPassengers && event.recipients
                ? (event.recipientPassengers = event.recipients)
                : null;
            if (event.ownerPassenger) {
                !event.ownerPassenger.paxNo && event.ownerPassenger.paxNumber
                    ? (event.ownerPassenger.paxNo =
                          event.ownerPassenger.paxNumber)
                    : null;
                this.findPassengersName(event.ownerPassenger);
                event.ownerPassenger.paxNo === this.state.loggedPaxNumber
                    ? (loggedIsPartOf = true)
                    : null;
            }
            if (event.recipientPassengers) {
                event.recipientPassengers.forEach((passenger) => {
                    !passenger.paxNo && passenger.paxNumber
                        ? (passenger.paxNo = passenger.paxNumber)
                        : null;
                    this.findPassengersName(passenger);
                    passenger.paxNo === this.state.loggedPaxNumber
                        ? (loggedIsPartOf = true)
                        : null;
                });
            }
            if (event.pnOrigin) {
                event.pnOrigin === this.state.loggedPaxNumber
                    ? (loggedIsPartOf = true)
                    : null;
            }
            event.loggedIsPartOf = loggedIsPartOf;

            // 0 is for sunday
        });

        let temp = this.state.loggedPassengerCruiseEvents;

        let result = temp.reduce(function(r, a) {
            r[a.customDate] = r[a.customDate] || [];
            r[a.customDate].push(a);

            return r;
        }, Object.create(null));

        let calendarEventsData = Object.keys(result).map(function(key) {
            return { events: result[key] };
        });

        calendarEventsData.forEach((calendarEvent) => {
            let ev = calendarEvent.events[0];
            let date = plainDateFormat(ev.startDateTime, 'YYYY-MM-DD');

            calendarEvent.date = date;

            // put gifts first
            // to do : for hotel, transfer, land tour

            calendarEvent.events.sort((a, b) => {
                a.isSpecialEvent ? 0 : 1;
            });

            // arrange time of events
            calendarEvent.events.sort((lhs, rhs) => {
                return lhs.startDateTime > rhs.startDateTime &&
                    !lhs.isSpecialEvent
                    ? 1
                    : lhs.startDateTime < rhs.startDateTime &&
                      !lhs.isSpecialEvent
                        ? -1
                        : 0;
            });

            // find same time events
            let sameHourEventsResults = calendarEvent.events.reduce(function(
                r,
                a
            ) {
                r[a.customHour] = r[a.customHour] || [];
                r[a.customHour].push(a);

                return r;
            },
            Object.create(null));
            let sameHourEvents = Object.keys(sameHourEventsResults).map(
                function(key) {
                    return { sameTimeEvents: sameHourEventsResults[key] };
                }
            );

            // calendar events to use for display events (multiplie events)
            calendarEvent.calendarEvents = sameHourEvents;
        });

        let calendar = [];
        // find min and max for start end of calendar

        let alldaysOfCalendar = this.state.loggedPassengerCruiseEvents.map(
            function(event) {
                return moment(event.customDate, 'YYYY-MM-DD');
            }
        );

        let allDaysOfCruise = this.state.itineraryEvents.map(function(event) {
            return moment(event.port.portCall.startDate, 'YYYY-MM-DD');
        });

        let startCruiseDate = moment.min(allDaysOfCruise);
        let endCruiseDate = moment.max(allDaysOfCruise);
        let startCalendarDate, endCalendarDate;

        if (alldaysOfCalendar.length > 0) {
            startCalendarDate = moment.min(alldaysOfCalendar);
            endCalendarDate = moment.max(alldaysOfCalendar);

            startCruiseDate.isSameOrBefore(startCalendarDate)
                ? (startCalendarDate = startCruiseDate)
                : null;
            endCruiseDate.isSameOrAfter(endCalendarDate)
                ? (endCalendarDate = endCruiseDate)
                : null;
        } else {
            startCalendarDate = startCruiseDate;
            endCalendarDate = endCruiseDate;
        }

        let embarkationDate = moment(this.state.embarkationDate);
        let disembarkationDate = moment(this.state.disembarkationDate);
        //let endCalendarDate = moment(this.state.disembarkationDate);
        let startDate = startCalendarDate;

        let finalDate = endCalendarDate;

        let startCalendarDayOfweek =
            moment(startCalendarDate).day() !== 0
                ? moment(startCalendarDate).day()
                : 7;
        let endCalendarDayOfweek =
            moment(endCalendarDate).day() !== 0
                ? moment(endCalendarDate).day()
                : 7;

        if (startCalendarDayOfweek !== 1) {
            let diff = startCalendarDayOfweek - 1;

            startDate = moment(startDate).subtract(diff, 'days');
        }

        if (endCalendarDayOfweek !== 7) {
            let diff = 7 - endCalendarDayOfweek;

            finalDate = moment(finalDate).add(diff, 'days');
        }

        while (startDate <= finalDate) {
            let date = moment(startDate).format('YYYY-MM-DD');
            let dayOftheWeek =
                moment(startDate).day() !== 0 ? moment(startDate).day() : 7;
            // let inRange =
            //     startDate < embarkationDate || startDate > disembarkationDate
            //         ? false
            //         : true;
            let inRange =
                startDate < startCalendarDate || startDate > endCalendarDate
                    ? false
                    : true;
            let isEmbarkationDate =
                date === moment(embarkationDate).format('YYYY-MM-DD');
            let isDisembarkationDate =
                date === moment(disembarkationDate).format('YYYY-MM-DD');

            let formatedDay = plainDateFormat(date, 'DD');
            let formatedMonth = plainDateFormat(date, 'MMMM');

            let hours = this.create24Hours();

            // TN Transfer, EMB Embarkation, SEA Sea day, PV Port visit

            let dayType = this.findDayType(date);
            let port = this.findPortInfo(date);

            let idl = this.findIfIsIDL(date);
            let docking = this.findDockingInfo(date);

            idl === 'minus' ? (inRange = false) : null;

            calendar.push({
                date: date,
                dayType: dayType,
                port: port,
                idl: idl,
                docking: docking,
                hours: hours,
                formatedDay: formatedDay,
                formatedMonth: formatedMonth,
                dayOftheWeek: dayOftheWeek,
                inRange: inRange,
                isEmbarkationDate: isEmbarkationDate,
                isDisembarkationDate: isDisembarkationDate
            });

            startDate = moment(startDate).add(1, 'days');
        }

        let startTime = 7;
        let endTime = 19;

        calendar.forEach((entry) => {
            let earlyEventsTotal = 0;
            let laterEventsTotal = 0;
            let isNoEventDay = true;
            let hasShorexEvent = false;
            let hasSpaEvent = false;

            calendarEventsData.map((ced) => {
                if (ced.date === entry.date) {
                    entry.data = ced;
                    isNoEventDay = false;
                    entry.data.events.map((event, index) => {
                        event.customEventType === 'shorex'
                            ? (hasShorexEvent = true)
                            : null;
                        event.customEventType === 'spa'
                            ? (hasSpaEvent = true)
                            : null;

                        let isGift =
                            event.customEventType === 'gift' ? true : false;

                        let isSpecialEvent = event.isSpecialEvent;

                        let timeOfEvent = moment(event.startDateTime).format(
                            'hh A'
                        );

                        let timeFormat24Event = moment(
                            event.startDateTime
                        ).format('HH');

                        timeFormat24Event < startTime &&
                        !isGift &&
                        !isSpecialEvent
                            ? (earlyEventsTotal += 1)
                            : null;
                        timeFormat24Event > endTime
                            ? (laterEventsTotal += 1)
                            : null;

                        entry.hours.forEach((hour) => {
                            let formatedHourToCompare = moment(hour.time, [
                                'h:mm A'
                            ]).format('hh A');

                            hour.time === 'NO-TIME' &&
                            (isGift || isSpecialEvent)
                                ? hour.data.push(event)
                                : null;

                            if (
                                formatedHourToCompare === timeOfEvent &&
                                !isGift &&
                                !isSpecialEvent
                            ) {
                                hour.data.push(event);
                            }
                        });
                    });
                }
            });
            entry.earlyEventsTotal = earlyEventsTotal;
            entry.laterEventsTotal = laterEventsTotal;
            entry.isNoEventDay = isNoEventDay;
            entry.hasShorexEvent = hasShorexEvent;
            entry.hasSpaEvent = hasSpaEvent;
        });

        this.setState({
            calendar: calendar,
            eventList: this.state.loggedPassengerCruiseEvents
        });
        //this.arrangeHotelData();
    };

    create24Hours = () => {
        let day24hours = [];
        let hoursPerDay = 24;

        for (let i = 0; i < hoursPerDay + 1; i++) {
            let hour = moment(i, ['h:mm A']);

            hour = hour.format('hh:mm A');
            day24hours.push({ time: hour, data: [] });
        }

        day24hours.pop();
        day24hours.unshift({ time: 'NO-TIME', data: [] });

        return day24hours;
    };
    convertEventType = (typeEvent) => {
        let type = '';
        typeEvent = typeof typeEvent !== 'string' ? typeEvent.$ : typeEvent;

        switch (typeEvent) {
            case 'SHOREX_EVENT':
                type = 'shorex';
                break;
            case 'GIFT_EVENT':
                type = 'gift';
                break;
            case 'DINING_EVENT':
            case 'DININGBASED_EVENT':
                type = 'dining';
                break;
            case 'SPA_EVENT':
            case 'SPAPACKAGE_EVENT':
                type = 'spa';
                break;
            case 'SERVICES_EVENT':
                type = 'services';
                break;
            case 'HOTEL_EVENT':
                type = 'hotel';
                break;
            case 'FLIGHT_EVENT':
                type = 'flight';
                break;
            case 'TRANSFER_EVENT':
                type = 'transfer';
                break;
            case 'IPS_EVENT':
                type = 'ips';
                break;
            case 'LANDTOUR_EVENT':
                type = 'landtour';
                break;
        }

        return type;
    };
    findPassengersName = (passenger) => {
        let passengersData = SessionStorage.getItem('orderedList').passengers;
        passengersData.forEach((passengerData) => {
            if (String(passengerData.paxNumber) === String(passenger.paxNo)) {
                passenger.title = passengerData.title;
                passenger.firstName = passengerData.firstName;
                passenger.lastName = passengerData.lastName;
            }
        });
    };

    manageDatePicker(value) {
        analytics.clickTracking(this);
        let w = value ? 'monthmobile' : this.state.view;

        this.setState({
            datepicker: value,
            view: w
        });
        if (!this.state.datepicker) {
            typeof document !== 'undefined' && document.body.classList.add('openOverlay');
        } else {
            typeof document !== 'undefined' && document.body.classList.remove('openOverlay');
        }
    }
    updateFilters = (filtersList) => {
        filtersList.length === 0 ? filtersList.push('all') : null;
        this.setState({ filters: filtersList });
    };
    // date format 2018-06-02
    gotoDay = (date, index) => {
        this.setState(
            { selectedDay: date, view: 'day', selectedIndex: index },
            () => {
                window.scrollTo(0, 0);
            }
        );
    };
    handleDayClick = (day) => {
        let date = plainDateFormat(day, 'YYYY-MM-DD');
        let index = this.state.calendar.findIndex((k) => k.date === date);

        if (this.state.calendar[index].inRange) {
            this.manageDatePicker(false);
            this.setState(
                {
                    selectedDay: date,
                    view: 'day',
                    selectedIndex: index,
                    datepicker: false
                },
                () => {
                    window.scrollTo(0, 0);
                }
            );
        }
    };

    render() {
        const { labels, services } = this.props;
        const { dressCode } = services.urls;
        // const calendar = this;
        // const title = extractChildComponent(this.props.childComponents, 'titleH1Mycruise');
        const monthlyView = extractChildComponent(
            this.props.childComponents,
            'calendarViewMonth'
        );
        const dailyView = extractChildComponent(
            this.props.childComponents,
            'calendarViewDay'
        );
        const weeklyView = extractChildComponent(
            this.props.childComponents,
            'calendarViewWeek'
        );
        const calendarEvent = extractChildComponent(
            this.props.childComponents,
            'calendarEvent'
        );
        const calendarFilter = extractChildComponent(
            this.props.childComponents,
            'calendarFilter'
        );
        const bookedActivities = extractChildComponent(
            this.props.childComponents,
            'bookedActivities'
        );
        const emptyState = extractChildComponent(
            this.props.childComponents,
            'calendarEmptyState'
        );

        let array = [];

        if (this.state.calendar) {
            this.state.eventList.map((event, index) => {
                array.push(new Date(event.startDateTime));
            });
        }

        const modifiers = {
            highlighted: array
        };
        // TODO: in realtà è il primo giorno con eventi, non l'embarkation
        let embarkationDay = new Date(this.state.embarkationDate);
        let disembarkationDay = new Date(this.state.disembarkationDate);
        let selectedDays = [embarkationDay, disembarkationDay];
        let formatedEmbarkationDay = plainDateFormat(embarkationDay, 'DD');
        let formatedEmbarkationMonth = plainDateFormat(embarkationDay, 'MMM');
        let formatedDisembarkationDay = plainDateFormat(
            disembarkationDay,
            'DD'
        );
        let formatedDisembarkationMonth = plainDateFormat(
            disembarkationDay,
            'MMM'
        );
        let formatedEmbarkationYear = plainDateFormat(embarkationDay, 'YYYY');
        let formatedDisembarkationYear = plainDateFormat(
            embarkationDay,
            'YYYY'
        );
        let formatedEmbarkationDayOfWeek = moment(embarkationDay).format('ddd');
        let formatedDisembarkationDayOfWeek = moment(disembarkationDay).format(
            'ddd'
        );
        let disabledDays = [
            {
                after: disembarkationDay,
                before: embarkationDay
            }
        ];
        let cruiseName = labels.cruiseNameLabel
            .replace('{duration}', this.state.duration)
            .replace('{destination}', this.state.destination);

        let cruiseSummary = labels.cruiseSummaryLabel
            .replace('{EMBmonth}', formatedEmbarkationMonth)
            .replace('{DEBmonth}', formatedDisembarkationMonth)
            .replace('{EMBdayOfMonth}', formatedEmbarkationDay)
            .replace('{DEBdayOfMonth}', formatedDisembarkationDay)
            .replace('{DEByear}', formatedDisembarkationYear)
            .replace('{EMBdayOfWeek}', formatedEmbarkationDayOfWeek)
            .replace('{guestsNumber}', this.state.totalGuests)
            .replace('{DEBdayOfWeek}', formatedDisembarkationDayOfWeek);

        if (formatedDisembarkationYear !== formatedEmbarkationYear) {
            cruiseSummary = cruiseSummary.replace(
                '{EMByear}',
                formatedEmbarkationYear
            );
        } else {
            cruiseSummary = cruiseSummary.replace('{EMByear}', '');
        }

        let ctaUrl =
            typeof window !== 'undefined' &&
            window.configs &&
            window.configs.ordersPageUrl
                ? window.configs.ordersPageUrl
                : '#';

        return (
            <div>
                <header className="calendarHeader">
                    <div className="calendarTitle">
                        <h4 className="calendarTitle__name">{cruiseName}</h4>
                        <p className="calendarTitle__subname">
                            {cruiseSummary}
                        </p>
                    </div>
                    <div className="calendarViewBtns">
                        <ul className="calendarViewBtns-desktop">
                            <li
                                className={`day button ${
                                    this.state.view === 'day' ? 'active' : ''
                                }`}
                                // onClick={(e) => this.setState({ view: 'day' })}
                            >
                                {/* {labels.dayViewBtnLabel} */}

                                <Link
                                    ariaLabel={`${labels.dayViewBtnLabel} ${
                                        this.state.view === 'day'
                                            ? 'selected'
                                            : ''
                                    }`}
                                    url={'javascript:void(0)'}
                                    title={labels.dayViewBtnLabel}
                                    dataLinktext={labels.dayViewBtnLabel}
                                    linkClassName={``}
                                    onClick={() =>
                                        this.setState({ view: 'day' })
                                    }
                                >
                                    {labels.dayViewBtnLabel}
                                </Link>
                            </li>
                            <li
                                className={`week button ${
                                    this.state.view === 'week' ? 'active' : ''
                                }`}
                                // onClick={(e) => this.setState({ view: 'week' })}
                                // dataLinktext={'calendar:view:week'}
                            >
                                <Link
                                    ariaLabel={`${labels.weekViewBtnLabel} ${
                                        this.state.view === 'week'
                                            ? 'selected'
                                            : ''
                                    }`}
                                    url={'javascript:void(0)'}
                                    title={labels.weekViewBtnLabel}
                                    dataLinktext={labels.weekViewBtnLabel}
                                    linkClassName={``}
                                    onClick={() =>
                                        this.setState({ view: 'week' })
                                    }
                                >
                                    {labels.weekViewBtnLabel}
                                </Link>
                            </li>
                            <li
                                className={`month button ${
                                    this.state.view === 'month' ? 'active' : ''
                                }`}
                                // onClick={(e) =>
                                //     this.setState({ view: 'month' })
                                // }
                                // dataLinktext={'calendar:view:month'}
                            >
                                <Link
                                    ariaLabel={`${labels.monthViewBtnLabel} ${
                                        this.state.view === 'month'
                                            ? 'selected'
                                            : ''
                                    }`}
                                    url={'javascript:void(0)'}
                                    title={labels.monthViewBtnLabel}
                                    dataLinktext={labels.monthViewBtnLabel}
                                    linkClassName={``}
                                    onClick={() =>
                                        this.setState({ view: 'month' })
                                    }
                                >
                                    {labels.monthViewBtnLabel}
                                </Link>
                            </li>
                        </ul>
                        <button
                            className="calendarViewBtns-mobile button"
                            onClick={(e) => this.manageDatePicker(true)}
                        >
                            {labels.monthViewBtnLabel}
                        </button>
                    </div>
                </header>
                {this.state &&
                    this.state.datepicker && (
                        <div className="dayPickerOverlay">
                            <div className="action-bar">
                                <button
                                    className="cta-menu-close"
                                    onClick={(e) =>
                                        this.manageDatePicker(false)
                                    }
                                >
                                    Close
                                </button>
                            </div>
                            <DayPicker
                                disabledDays={disabledDays}
                                modifiers={modifiers}
                                onDayClick={this.handleDayClick}
                                selectedDays={selectedDays}
                                month={embarkationDay}
                                fromMonth={embarkationDay}
                                toMonth={disembarkationDay}
                            />
                        </div>
                    )}
                <CalendarFilter
                    {...calendarFilter}
                    updateFilters={this.updateFilters}
                />
                <div className="calendarView">
                    {this.state.calendar &&
                        this.state.view === 'day' && (
                            <CalendarViewDay
                                {...dailyView}
                                calendarEventData={calendarEvent}
                                emptyStateData={emptyState}
                                data={this.state.calendar}
                                selectedDay={this.state.selectedDay}
                                selectedIndex={this.state.selectedIndex}
                                filters={this.state.filters}
                                country={this.state.country}
                                shipCode={this.state.shipCode}
                                urlDressCode={dressCode}
                            />
                        )}
                    {this.state &&
                        this.state.view === 'week' && (
                            <CalendarViewWeek
                                {...weeklyView}
                                calendarEventData={calendarEvent}
                                data={this.state.calendar}
                                filters={this.state.filters}
                                array24={this.create24Hours()}
                                onDaySelect={this.gotoDay}
                            />
                        )}
                    {this.state &&
                        this.state.view === 'month' && (
                            <CalendarViewMonth
                                {...monthlyView}
                                calendarEventData={calendarEvent}
                                data={this.state.calendar}
                                filters={this.state.filters}
                                onDaySelect={this.gotoDay}
                            />
                        )}
                </div>
                <div className="react-component textCta">
                    <div className="textCta__cont">
                        <div className="textCta__aux">
                            <span className="textCta__icon">
                                <img src="/content/dam/po/phone.png" />
                            </span>
                            <p className="textCta__text">
                                {labels.flightsBoxLabel}
                            </p>
                        </div>
                    </div>
                </div>
                {this.state &&
                    this.state.outOfCalendarEvents && (
                        <BookedActivities
                            {...bookedActivities}
                            data={this.state.outOfCalendarEvents}
                        />
                    )}
                <div className="cta-footer">
                    <a
                        href={ctaUrl}
                        className="cta-secondary"
                        data-linktext={labels.ctaLabel}
                        data-componentname={this.props.type}
                    >
                        {labels.ctaLabel}
                    </a>
                </div>
            </div>
        );
    }
}

calendar.propTypes = {};

export default calendar;
