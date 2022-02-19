/*
 * React Modal
 *
 * For examples and features: https://github.com/davidtheclark/react-aria-modal
 */
'use strict';

import React from 'react';
import moment from 'moment';
import DiningForm from './diningForm';
import { getConfig } from '../commons/CUK/utilities';
import { calculateAge, calculateDiffDays } from '../commons/CUK/dateFormat';
import SessionStorage from '../commons/CUK/session-storage';
import DiningAddToCart from './diningAddToCart';
import DiningFormSummary from './diningFormSummary';
import FetchData from '../commons/CUK/fetch-data';
import Loader from '../commons/CUK/loader';
import analytics from '../commons/CUK/analytics';
import Modal from '../commons/CUK/modal';
import Link from '../commons/CUK/link';
import {
    VIEWPORT_TYPE,
    watchForBreakpoint
} from '../../library/js/config/breakpoints';

class diningBookingConfigLabels extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            showLodaer: false,
            showLodaerAddtoBasket: false,
            showError: false,
            isTabClicked: true,
            errorMsg: '',
            selectedPassenger: [],
            maxSelectable: 0,
            selectedDuration: [],
            selectedWheelchair: [],
            selectedGuest: [],
            selectedDay: {},
            seletedTimeSlot: {},
            selectedMealPeriod: '',
            treatment: [],
            calendarDates: [],
            calenderDateRange: [],
            orderCanProceed: false,
            showDuration: true,
            showDate: true,
            showTimeSlot: true,
            modified: true,
            proceedForDurationSection: false,
            proceedForDateSection: false,
            proceedForTimeSection: false,
            proceedForMealPeriod: false,
            proceedForAddtoCart: false,
            openTimeSlotData: [],
            selectedSlotForMultiDayPass: [],
            tabIndex: 0,
            monthTabs: [],
            isMonthTabClicked: false,
            monthTabValue: {},
            APIURL: '',
            checkSoldOut: false,
            checkWheelChair: false,
            checkWheelChairNo: false,
            showModal: false,
            overlayText: '',
            eventCatoryies: [],
            checkTimeSlotClick: false,
            checkMealPeriodClick: false,
            listOfInventoryData: [],
            checkSoldOutInventories: false,
            setCurrentTime: '',
            guestBookedValue: [],
            yesButton: false,
            noButton: false,
            startDateInventory: '',
            endDateInventory: '',
            checkEventsCode: {},
            selectedLimelightEvent: {},
            checkLimelightEvent: false,
            selectedCookeryVenue: {},
            checkCookeryVenue: false
        };
    }

    componentWillMount() {
        const header = SessionStorage.getItem('header');
        const { passengers } = header;
        // const { eventsDetailsShipData } = this.props;
        const maxSelectable = passengers.length;
        let durationType = 'SINGLE_SLOT';

        this.setState({
            maxSelectable: maxSelectable,
            durationType: durationType,
            showError: false
        });
        this.buildDateRangeForTheCalender();
    }

    componentDidMount() {
        const { selectedDay, maxSelectable } = this.state;
        const header = SessionStorage.getItem('header');
        const cruiseData = SessionStorage.getItem('cruiseData');
        const config = typeof window !== 'undefined' ? window.configs : '';
        const customCurrencyCode =
            config.brand.toLowerCase() === 'po' ? 'gbp' : 'usd';

        let dobArray = [];
        header.passengers.forEach((passenger) => {
            dobArray.push(passenger.birthDate);
        });

        const { disembarkationDate, passengers } = header;
        if (passengers.length == 1) {
            let proceedForDurationSection = false;
            let selectedPassenger = [];
            passengers.map((value, index) => {
                const { birthDate } = value;
                const minAdultAge = getConfig('minAdultAge');
                const dateToCompare = new Date(
                    selectedDay.date ? selectedDay.date : disembarkationDate
                );
                const passengerBirth = new Date(birthDate);
                const ageAtDate = calculateAge(
                    passengerBirth.getTime(),
                    dateToCompare.getTime()
                );
                proceedForDurationSection = ageAtDate > minAdultAge;
                selectedPassenger = [value.paxNumber];
            });
            this.setState({
                selectedPassenger: selectedPassenger,
                proceedForDurationSection: proceedForDurationSection,
                maxSelected: selectedPassenger.length >= maxSelectable,
                showError: false
            });
        }
    }

    componentWillReceiveProps(nextProps) {
        this.updatedLimelightevent(nextProps.limelightEvents);
    }

    updatedLimelightevent(limelightEvents) {
        let pageUrl = window.location.href.split('/');
        let type1 = pageUrl[pageUrl.length - 3]; //'event';
        let ecode = '';
        if (type1 == 'venue') {
            ecode = pageUrl[pageUrl.length - 1];
        }
        //ecode = 'PO_GENT_00001';
        let checkEventCode = false;
        checkEventCode = ecode != '' && ecode != undefined ? true : false;
        let selectedEvent = {};
        limelightEvents &&
            limelightEvents.map((event) => {
                if (checkEventCode) {
                    if (event.eventCode === ecode) {
                        selectedEvent['title'] = event.label;
                        selectedEvent['eventCode'] = event.eventCode;
                        selectedEvent['value'] = event.value;
                        selectedEvent['venueCode'] = event.venueCode;
                        analytics.setAdditionalPageTrackAttributes({
                            event: 'event333'
                        });
                    }
                }
                if (!checkEventCode) {
                    if (event.value === 0) {
                        selectedEvent['title'] = event.label;
                        selectedEvent['eventCode'] = event.eventCode;
                        selectedEvent['value'] = event.value;
                        selectedEvent['venueCode'] = event.venueCode;
                        analytics.setAdditionalPageTrackAttributes({
                            event: 'event333'
                        });
                    }
                }
            });
        this.setState(
            {
                selectedLimelightEvent:
                    limelightEvents && limelightEvents[0] && limelightEvents[0].venueType &&
                    limelightEvents[0].venueType === 'limelight'
                        ? selectedEvent
                        : {},
                selectedCookeryVenue:
                    limelightEvents && limelightEvents[0] && limelightEvents[0].venueType &&
                    limelightEvents[0].venueType === 'cookery'
                        ? selectedEvent
                        : {},
                checkLimelightEvent:
                    limelightEvents && limelightEvents.length !== 0
                        ? limelightEvents[0].venueType === 'limelight'
                            ? true
                            : false
                        : false,
                checkCookeryVenue:
                    limelightEvents && limelightEvents.length !== 0
                        ? limelightEvents[0].venueType === 'cookery'
                            ? true
                            : false
                        : false
            }
        );
    }

    setAnalyticsOnLoad = (venueCode, eventCode = []) => {
        if (venueCode && eventCode) {
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
        }
    };

    getShipEvntResOnWheelchairSel = (
        noOfGuestSel,
        noofWheelSel,
        typeOfSlide
    ) => {
        //console.log('props on ship event for wheelchair', this.props);
        const apikeyMycruise = getConfig('apikeyMycruise', '');
        const { services, bookedDiningData } = this.props;
        const {
            selectedLimelightEvent,
            checkLimelightEvent,
            selectedCookeryVenue,
            checkCookeryVenue
        } = this.state;
        
        const { brand } = services.headers;
        const { shipEventAPi } = services.urls;
        const header = SessionStorage.getItem('header');
        const cruiseSummaryData = SessionStorage.getItem('cruiseSummaryData');
        const { customer } = header;
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
        } //const type = pageUrl[pageUrl.length - 2];
        //type = 'venue';
        //code = 'BR_FREE_MD';

        // const type = 'event';
        // const code = 'BR_FREE_0001';
        //const code = pageUrl[pageUrl.length - 1];
        header.passengers.forEach((passenger) => {
            if (customer.PaxNumber == passenger.paxNumber) {
                customer['guestId'] = passenger.guestId;
            }
        });
        const { embarkationDate } = header;
        const API = `${shipEventAPi}/${header.shipCode}`;
        const preCruiseValue = 'PRE_CRUISE_AVAILABLE';
        const HIGHLIGHTED_EVENT = 'HIGHLIGHTED_EVENT';
        const HLEventIncluded = this.props.highlightedEventOnDining ? this.props.highlightedEventOnDining : [];
        
        const currentDate = header.embarkationDate;
        const embarkConvertedDate = moment(currentDate, 'YYYY-MM-DD').format(
            'YYYYMMDD'
        );
        const embarkTime = cruiseSummaryData.itineraryBooking.embarkTime;
        const debarkTime = cruiseSummaryData.itineraryBooking.debarkTime;
        let numOfDaysForApi = 6;
        const mqlTabletMVP = watchForBreakpoint(VIEWPORT_TYPE.TABLET, true);
        const mqlMobileMVP = watchForBreakpoint(VIEWPORT_TYPE.MOBILE, true);
        if (mqlTabletMVP.matches || mqlMobileMVP.matches) {
            numOfDaysForApi = 2;
        }
        let startDate = '';
        let endDate = '';

        if (checkCookeryVenue || checkLimelightEvent) {
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
            startDate =
                moment(currentDate, 'YYYY-MM-DD').format('YYYYMMDD') +
                embarkTime +
                '00';
            endDate =
                moment(embarkationEndDate, 'YYYY-MM-DD').format('YYYYMMDD') +
                '235959';
        } else {
            if (typeOfSlide != undefined) {
                const dateIsSameDisembark = moment(typeOfSlide.date).isSame(
                    header.disembarkationDate
                );
                const dateIsSameEmbark = moment(typeOfSlide.date).isSame(
                    header.embarkationDate
                );
                if (!dateIsSameDisembark) {
                    var a = moment(typeOfSlide.date.split('-'));
                    var b = moment(header.disembarkationDate.split('-'));
                    const dayToCruiseDeparture = b.diff(a, 'days');
                    const checkDate =
                        dayToCruiseDeparture < numOfDaysForApi ? true : false;

                    if (!checkDate) {
                        const checkStartDate = moment(
                            typeOfSlide.date,
                            'YYYY-MM-DD'
                        ).format('YYYYMMDD');
                        startDate = `${checkStartDate}000000`;
                        const embarkationEndDate = moment(
                            typeOfSlide.date,
                            'YYYY-MM-DD'
                        )
                            .add(numOfDaysForApi, 'days')
                            .format('YYYYMMDD');
                        endDate = `${embarkationEndDate}235959`;
                    } else {
                        const checkStartDate = moment(
                            header.disembarkationDate,
                            'YYYY-MM-DD'
                        )
                            .subtract(numOfDaysForApi, 'days')
                            .format('YYYYMMDD');
                        startDate = `${checkStartDate}000000`;
                        const checkEndDate = moment(
                            header.disembarkationDate,
                            'YYYY-MM-DD'
                        ).format('YYYYMMDD');
                        endDate = `${checkEndDate}${debarkTime}00`;
                    }
                } else if (dateIsSameDisembark) {
                    const checkStartDate = moment(
                        typeOfSlide.date,
                        'YYYY-MM-DD'
                    )
                        .subtract(numOfDaysForApi, 'days')
                        .format('YYYYMMDD');
                    startDate = `${checkStartDate}000000`;
                    const checkEndDate = moment(
                        typeOfSlide.date,
                        'YYYY-MM-DD'
                    ).format('YYYYMMDD');
                    endDate = `${checkEndDate}${debarkTime}00`;
                } else if (dateIsSameEmbark) {
                    const checkStartDate = moment(
                        typeOfSlide.date,
                        'YYYY-MM-DD'
                    ).format('YYYYMMDD');
                    startDate = `${checkStartDate}${embarkTime}00`;
                    const embarkationEndDate = moment(
                        typeOfSlide.date,
                        'YYYY-MM-DD'
                    )
                        .add(numOfDaysForApi, 'days')
                        .format('YYYYMMDD');
                    endDate = `${embarkationEndDate}235959`;
                }
            } else {
                startDate = `${embarkConvertedDate}${embarkTime}00`;
                let embarkationEndDate = header.disembarkationDate;
                const daysAdded = moment(currentDate, 'YYYY-MM-DD').add(
                    numOfDaysForApi,
                    'days'
                );
                if (
                    new Date(daysAdded).getTime() <
                    new Date(header.disembarkationDate).getTime()
                ) {
                    embarkationEndDate = daysAdded;
                }
                const debarkConvertedDate = moment(
                    embarkationEndDate,
                    'YYYY-MM-DD'
                ).format('YYYYMMDD');
                endDate = `${debarkConvertedDate}235959`;
            }
        }

        const requestBody = {
            data: {
                startDateTime: startDate,
                endDateTime: endDate,
                guests: [customer.guestId],
                partySize: noOfGuestSel,
                numberOfWheelchairsInParty: noofWheelSel,
                venueCodes: type == 'venue' ? [code] : [],
                types: [],
                categories:
                    Object.keys(selectedLimelightEvent).length !== 0
                        ? ['LIMELIGHT']
                        : Object.keys(selectedCookeryVenue).length !== 0
                            ? ['MASTER_CLASS', 'HOSTED_DINNER']
                            : ['DINING']
            }
        };
        const requestHeaders = {
            'Content-Type': 'application/json',
            'X-Source-Identity-Token-0': apikeyMycruise
        };
        return FetchData(API, {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: requestHeaders
        }).then((res) => {
            if (res.success === 'true') {
                if (res.data[0] !== null && res.data.length !== 0) {
                    if (
                        res.data[0].events[0] !== null &&
                        res.data[0].events.length !== 0
                    ) {
                        const { events } = res.data[0];
                        let listOfInventory = [];
                        let listOfSoldOutInventory = [];
                        let checkEventsCode = {};
                        let productCodes = [];

                        if (type == 'venue') {
                            checkEventsCode = events.find(
                                (item) => item.venueCode === code
                            );
                        } else if (type == 'event') {
                            checkEventsCode = events.find(
                                (item) => item.eventCode === code
                            );
                        }

                        if (
                            type == 'event' ||
                            checkLimelightEvent ||
                            checkCookeryVenue
                        ) {
                            events.length > 0 &&
                                events.map((m, i) => {
                                    if (
                                        type == 'venue' &&
                                        code == m.venueCode
                                    ) {
                                        //check for limelight and cookery
                                        if (
                                            checkLimelightEvent ||
                                            checkCookeryVenue
                                        ) {
                                            let venueType = bookedDiningData[0]['venueType'] ? bookedDiningData[0]['venueType'] : '';
                                            if (
                                                m.eventCode &&
                                                m.categories.length &&
                                                m.categories.indexOf(
                                                    preCruiseValue
                                                ) > '-1' &&
                                                HLEventIncluded.indexOf(venueType.toLowerCase()) > '-1' &&
                                                (m.eventCode ===
                                                    selectedLimelightEvent.eventCode ||
                                                    m.eventCode ===
                                                        selectedCookeryVenue.eventCode)
                                            ) {
                                                m.inventory.map(
                                                    (inventory, i) => {
                                                        inventory.categories =
                                                            '';
                                                        if (
                                                            inventory.status ==
                                                            'Available'
                                                        ) {
                                                            productCodes.push(
                                                                m.eventCode
                                                            );
                                                            inventory.categories =
                                                                m.categories;
                                                            inventory.eventCode =
                                                                m.eventCode;
                                                            inventory.eventId =
                                                                m.eventId;
                                                            listOfInventory.push(
                                                                inventory
                                                            );
                                                        } else if (
                                                            inventory.status ==
                                                            'Sold Out'
                                                        ) {
                                                            listOfSoldOutInventory.push(
                                                                inventory
                                                            );
                                                        }
                                                    }
                                                );
                                            } else if (
                                                m.eventCode &&
                                                m.categories.length &&
                                                m.categories.indexOf(
                                                    preCruiseValue
                                                ) > '-1' &&
                                                m.categories.indexOf(

                                                    HIGHLIGHTED_EVENT
                                                ) == '-1' &&
                                                (m.eventCode ===
                                                    selectedLimelightEvent.eventCode ||
                                                    m.eventCode ===
                                                        selectedCookeryVenue.eventCode)
                                            ) {
                                                m.inventory.map(
                                                    (inventory, i) => {
                                                        inventory.categories =
                                                            '';
                                                        if (
                                                            inventory.status ==
                                                            'Available'
                                                        ) {
                                                            productCodes.push(
                                                                m.eventCode
                                                            );
                                                            inventory.categories =
                                                                m.categories;
                                                            inventory.eventCode =
                                                                m.eventCode;
                                                            inventory.eventId =
                                                                m.eventId;
                                                            listOfInventory.push(
                                                                inventory
                                                            );
                                                        } else if (
                                                            inventory.status ==
                                                            'Sold Out'
                                                        ) {
                                                            listOfSoldOutInventory.push(
                                                                inventory
                                                            );
                                                        }
                                                    }
                                                );
                                            }

                                        } else {
                                            if (
                                                m.eventCode &&
                                                m.categories.length &&
                                                m.categories.indexOf(
                                                    preCruiseValue
                                                ) > '-1'
                                            ) {
                                                m.inventory.map(
                                                    (inventory, i) => {
                                                        inventory.categories =
                                                            '';
                                                        if (
                                                            inventory.status ==
                                                            'Available'
                                                        ) {
                                                            if (
                                                                m.categories.indexOf(
                                                                    'DINNER'
                                                                ) > '-1'
                                                            ) {
                                                                inventory.categories =
                                                                    'Dinner';
                                                                productCodes.push(
                                                                    m.eventCode
                                                                );
                                                            }
                                                            if (
                                                                m.categories.indexOf(
                                                                    'BREAKFAST'
                                                                ) > '-1'
                                                            ) {
                                                                inventory.categories =
                                                                    'Breakfast';
                                                                productCodes.push(
                                                                    m.eventCode
                                                                );
                                                            }
                                                            if (
                                                                m.categories.indexOf(
                                                                    'LUNCH'
                                                                ) > '-1'
                                                            ) {
                                                                inventory.categories =
                                                                    'Lunch';
                                                                productCodes.push(
                                                                    m.eventCode
                                                                );
                                                            }
                                                            if (
                                                                m.categories.indexOf(
                                                                    'HI-TEA'
                                                                ) > '-1' ||
                                                                m.categories.indexOf(
                                                                    'AFTERNOON_TEA'
                                                                ) > '-1'
                                                            ) {
                                                                inventory.categories =
                                                                    'Hi-Tea';
                                                                productCodes.push(
                                                                    m.eventCode
                                                                );
                                                            }
                                                            inventory.eventCode =
                                                                m.eventCode;
                                                            inventory.eventId =
                                                                m.eventId;
                                                            listOfInventory.push(
                                                                inventory
                                                            );
                                                        } else if (
                                                            inventory.status ==
                                                            'Sold Out'
                                                        ) {
                                                            listOfSoldOutInventory.push(
                                                                inventory
                                                            );
                                                        }
                                                    }
                                                );
                                            }
                                        }
                                    } else if (
                                        type == 'event' &&
                                        code == m.eventCode
                                    ) {
                                        if (
                                            m.eventCode &&
                                            m.categories.length &&
                                            m.categories.indexOf(
                                                preCruiseValue
                                            ) > '-1'
                                        ) {
                                            m.inventory.map((inventory, i) => {
                                                inventory.categories = '';
                                                if (
                                                    inventory.status ==
                                                    'Available'
                                                ) {
                                                    if (
                                                        m.categories.indexOf(
                                                            'DINNER'
                                                        ) > '-1'
                                                    ) {
                                                        inventory.categories =
                                                            'Dinner';
                                                        productCodes.push(
                                                            m.eventCode
                                                        );
                                                    }
                                                    if (
                                                        m.categories.indexOf(
                                                            'BREAKFAST'
                                                        ) > '-1'
                                                    ) {
                                                        inventory.categories =
                                                            'Breakfast';
                                                        productCodes.push(
                                                            m.eventCode
                                                        );
                                                    }
                                                    if (
                                                        m.categories.indexOf(
                                                            'LUNCH'
                                                        ) > '-1'
                                                    ) {
                                                        inventory.categories =
                                                            'Lunch';
                                                        productCodes.push(
                                                            m.eventCode
                                                        );
                                                    }
                                                    if (
                                                        m.categories.indexOf(
                                                            'HI-TEA'
                                                        ) > '-1' ||
                                                        m.categories.indexOf(
                                                            'AFTERNOON_TEA'
                                                        ) > '-1' 
                                                    ) {
                                                        inventory.categories =
                                                            'Hi-Tea';
                                                        productCodes.push(
                                                            m.eventCode
                                                        );
                                                    }
                                                    inventory.eventCode =
                                                        m.eventCode;
                                                    inventory.eventId =
                                                        m.eventId;
                                                    listOfInventory.push(
                                                        inventory
                                                    );
                                                } else if (
                                                    inventory.status ==
                                                    'Sold Out'
                                                ) {
                                                    listOfSoldOutInventory.push(
                                                        inventory
                                                    );
                                                }
                                            });
                                        }
                                    }
                                });
                            let stdate = startDate.replace(
                                /^(\d{4})(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)$/,
                                '$1-$2-$3'
                            );
                            console.log(
                                'currentDate-->',
                                currentDate,
                                stdate,
                                stdate == currentDate ? 'true' : 'false'
                            );
                            const checkSoldOutInv =
                                (checkCookeryVenue || checkLimelightEvent) &&
                                (events.length ===
                                    listOfSoldOutInventory.length ||
                                    checkEventsCode === '' ||
                                    checkEventsCode === undefined)
                                    ? true
                                    : false;
                            this.setState(
                                {
                                    listOfInventoryData: listOfInventory,
                                    proceedForDateSection: true,
                                    proceedForTimeSection:
                                        checkLimelightEvent || checkCookeryVenue
                                            ? true
                                            : false,
                                    showLodaer: false,
                                    checkSoldOutInventories:
                                        checkLimelightEvent || checkCookeryVenue
                                            ? listOfInventory.length
                                                ? checkSoldOutInv
                                                : true
                                            : false,
                                    startDateInventory: startDate,
                                    endDateInventory: endDate,
                                    checkEventsCode: checkEventsCode,
                                    productCodes: productCodes.length
                                        ? [...new Set(productCodes)]
                                        : []
                                },
                                () => {
                                    this.sortCalendarDateRange();
                                }
                            );
                        } else {
                            //check for normal vneue
                            let eventCodeList = [];
                            let venueType = bookedDiningData[0]['venueType'] ? bookedDiningData[0]['venueType'] : '';
                            events.length > 0 &&
                                events.map((e, i) => {
                                    let index = eventCodeList.indexOf(
                                        `code:${e.eventCode}`
                                    );
                                    let checkPreCruise = e.categories.indexOf(
                                        preCruiseValue
                                    );
                                    if (
                                        index == '-1' &&
                                        checkPreCruise > '-1' &&
                                        HLEventIncluded.indexOf(venueType.toLowerCase()) > '-1' 
                                    ) {
                                        eventCodeList.push(
                                            `code:${e.eventCode}`
                                        );
                                    } else if (
                                        index == '-1' &&
                                        checkPreCruise > '-1' &&
                                        e.categories.indexOf(
                                            HIGHLIGHTED_EVENT
                                        ) == '-1'
                                    ) {
                                        eventCodeList.push(
                                            `code:${e.eventCode}`
                                        );
                                    }
                                });
                            this.getEventFromSolar(eventCodeList).then(
                                (eventResponse) => {
                                    let eventResults = [];
                                    events.length &&
                                        events.map((event) => {
                                            eventResponse.length &&
                                                eventResponse.forEach((k) => {
                                                    if (
                                                        k.code ==
                                                        event.eventCode
                                                    ) {
                                                        eventResults.push(
                                                            event
                                                        );
                                                    }
                                                });
                                        });
                                    let venueType = bookedDiningData[0]['venueType'] ? bookedDiningData[0]['venueType'] : '';
                                    eventResults.length &&
                                        eventResults.map((m, i) => {
                                            if (type == 'venue') {
                                                if(
                                                    m.eventCode &&
                                                    m.categories.length &&
                                                    m.categories.indexOf(
                                                        preCruiseValue
                                                    ) > '-1' &&
                                                    HLEventIncluded.indexOf(venueType.toLowerCase()) > '-1' 
                                                ) {
                                                    m.inventory.map(
                                                        (inventory, i) => {
                                                            inventory.categories =
                                                                '';
                                                            if (
                                                                inventory.status ==
                                                                'Available'
                                                            ) {
                                                                if (
                                                                    m.categories.indexOf(
                                                                        'DINNER'
                                                                    ) > '-1'
                                                                ) {
                                                                    inventory.categories =
                                                                        'Dinner';
                                                                    productCodes.push(
                                                                        m.eventCode
                                                                    );
                                                                }
                                                                if (
                                                                    m.categories.indexOf(
                                                                        'BREAKFAST'
                                                                    ) > '-1'
                                                                ) {
                                                                    inventory.categories =
                                                                        'Breakfast';
                                                                    productCodes.push(
                                                                        m.eventCode
                                                                    );
                                                                }
                                                                if (
                                                                    m.categories.indexOf(
                                                                        'LUNCH'
                                                                    ) > '-1'
                                                                ) {
                                                                    inventory.categories =
                                                                        'Lunch';
                                                                    productCodes.push(
                                                                        m.eventCode
                                                                    );
                                                                }
                                                                if (
                                                                    m.categories.indexOf(
                                                                        'HI-TEA'
                                                                    ) > '-1' ||
                                                                    m.categories.indexOf(
                                                                        'AFTERNOON_TEA'
                                                                    ) > '-1'
                                                                ) {
                                                                    inventory.categories =
                                                                        'Hi-Tea';
                                                                    productCodes.push(
                                                                        m.eventCode
                                                                    );
                                                                }
                                                                inventory.eventCode =
                                                                    m.eventCode;
                                                                inventory.eventId =
                                                                    m.eventId;
                                                                listOfInventory.push(
                                                                    inventory
                                                                );
                                                            } else if (
                                                                inventory.status ==
                                                                'Sold Out'
                                                            ) {
                                                                listOfSoldOutInventory.push(
                                                                    inventory
                                                                );
                                                            }
                                                        }
                                                    );
                                                } else if(
                                                    m.eventCode &&
                                                    m.categories.length &&
                                                    m.categories.indexOf(
                                                        preCruiseValue
                                                    ) > '-1' &&
                                                    m.categories.indexOf(
                                                        HIGHLIGHTED_EVENT
                                                    ) == '-1'
                                                ) {
                                                    m.inventory.map(
                                                        (inventory, i) => {
                                                            inventory.categories =
                                                                '';
                                                            if (
                                                                inventory.status ==
                                                                'Available'
                                                            ) {
                                                                if (
                                                                    m.categories.indexOf(
                                                                        'DINNER'
                                                                    ) > '-1'
                                                                ) {
                                                                    inventory.categories =
                                                                        'Dinner';
                                                                    productCodes.push(
                                                                        m.eventCode
                                                                    );
                                                                }
                                                                if (
                                                                    m.categories.indexOf(
                                                                        'BREAKFAST'
                                                                    ) > '-1'
                                                                ) {
                                                                    inventory.categories =
                                                                        'Breakfast';
                                                                    productCodes.push(
                                                                        m.eventCode
                                                                    );
                                                                }
                                                                if (
                                                                    m.categories.indexOf(
                                                                        'LUNCH'
                                                                    ) > '-1'
                                                                ) {
                                                                    inventory.categories =
                                                                        'Lunch';
                                                                    productCodes.push(
                                                                        m.eventCode
                                                                    );
                                                                }
                                                                if (
                                                                    m.categories.indexOf(
                                                                        'HI-TEA'
                                                                    ) > '-1' ||
                                                                    m.categories.indexOf(
                                                                        'AFTERNOON_TEA'
                                                                    ) > '-1'
                                                                ) {
                                                                    inventory.categories =
                                                                        'Hi-Tea';
                                                                    productCodes.push(
                                                                        m.eventCode
                                                                    );
                                                                }
                                                                inventory.eventCode =
                                                                    m.eventCode;
                                                                inventory.eventId =
                                                                    m.eventId;
                                                                listOfInventory.push(
                                                                    inventory
                                                                );
                                                            } else if (
                                                                inventory.status ==
                                                                'Sold Out'
                                                            ) {
                                                                listOfSoldOutInventory.push(
                                                                    inventory
                                                                );
                                                            }
                                                        }
                                                    );
                                                }
                                            } else if(
                                                m.eventCode &&
                                                m.categories.length &&
                                                m.categories.indexOf(
                                                    preCruiseValue
                                                ) > '-1'
                                            ) {
                                                m.inventory.map(
                                                    (inventory, i) => {
                                                        inventory.categories =
                                                            '';
                                                        if (
                                                            inventory.status ==
                                                            'Available'
                                                        ) {
                                                            if (
                                                                m.categories.indexOf(
                                                                    'DINNER'
                                                                ) > '-1'
                                                            ) {
                                                                inventory.categories =
                                                                    'Dinner';
                                                                productCodes.push(
                                                                    m.eventCode
                                                                );
                                                            }
                                                            if (
                                                                m.categories.indexOf(
                                                                    'BREAKFAST'
                                                                ) > '-1'
                                                            ) {
                                                                inventory.categories =
                                                                    'Breakfast';
                                                                productCodes.push(
                                                                    m.eventCode
                                                                );
                                                            }
                                                            if (
                                                                m.categories.indexOf(
                                                                    'LUNCH'
                                                                ) > '-1'
                                                            ) {
                                                                inventory.categories =
                                                                    'Lunch';
                                                                productCodes.push(
                                                                    m.eventCode
                                                                );
                                                            }
                                                            if (
                                                                m.categories.indexOf(
                                                                    'HI-TEA'
                                                                ) > '-1' ||
                                                                m.categories.indexOf(
                                                                    'AFTERNOON_TEA'
                                                                ) > '-1'
                                                            ) {
                                                                inventory.categories =
                                                                    'Hi-Tea';
                                                                productCodes.push(
                                                                    m.eventCode
                                                                );
                                                            }
                                                            inventory.eventCode =
                                                                m.eventCode;
                                                            inventory.eventId =
                                                                m.eventId;
                                                            listOfInventory.push(
                                                                inventory
                                                            );
                                                        } else if (
                                                            inventory.status ==
                                                            'Sold Out'
                                                        ) {
                                                            listOfSoldOutInventory.push(
                                                                inventory
                                                            );
                                                        }
                                                    }
                                                );
                                            }
                                        });
                                    const checkSoldOutInv =
                                        eventResults.length ===
                                            listOfSoldOutInventory.length ||
                                        checkEventsCode === '' ||
                                        checkEventsCode === undefined
                                            ? true
                                            : false;
                                    this.setState(
                                        {
                                            listOfInventoryData: listOfInventory,
                                            proceedForDateSection: true,
                                            proceedForTimeSection:
                                                checkLimelightEvent ||
                                                checkCookeryVenue
                                                    ? true
                                                    : false,
                                            showLodaer: false,
                                            checkSoldOutInventories:
                                                checkLimelightEvent ||
                                                checkCookeryVenue
                                                    ? listOfInventory.length
                                                        ? checkSoldOutInv
                                                        : true
                                                    : false,
                                            startDateInventory: startDate,
                                            endDateInventory: endDate,
                                            checkEventsCode: checkEventsCode,
                                            productCodes: productCodes.length
                                                ? [...new Set(productCodes)]
                                                : []
                                        },
                                        () => {
                                            this.sortCalendarDateRange();
                                        }
                                    );
                                }
                            );
                        }
                    } else {
                        this.setState({
                            showLodaer: false,
                            checkSoldOutInventories: false
                        });
                    }
                } else {
                    this.setState({
                        showLodaer: false,
                        checkSoldOutInventories: false
                    });
                }
            } else {
                //API error
            }
        });
    };

    getEventFromSolar = (eventCode) => {
        const { solrCollectionName, services } = this.props;
        const header = SessionStorage.getItem('header');
        const { pathSolrHandler } = services.urls;
        const shipCode = header.shipCode;
        let code,
            rows = 1;
        if (typeof eventCode == 'object') {
            code = eventCode.join(' OR ');
            rows = eventCode.length;
        } else {
            code = `code:${eventCode}`;
        }
        let eventURL = `${pathSolrHandler}${solrCollectionName}/getEvents?&q=*%3A*&fq=( (${code}) AND shipCode:${shipCode} )&rows=${rows}`;
        // let eventURL = `${pathSolrHandler}${solrCollectionName}/getEvents?&q=*%3A*&fq=( (${code}) AND shipCode:${shipCode} )`;
        return FetchData(eventURL, {
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

    handleTabClick = (index) => {
        const { isTabClicked } = this.state;
        const elementList = document.getElementsByClassName('nav_prev') || [];
        elementList.length &&
            isTabClicked &&
            elementList[0].classList.add('disabled');
        elementList.length && !isTabClicked && elementList[index].click();
        this.setState({
            tabIndex: index,
            isTabClicked: false
        });
    };

    checkOrderCanProceed() {
        const {
            selectedGuest,
            selectedLimelightEvent,
            selectedWheelchair,
            selectedDay,
            seletedTimeSlot,
            selectedMealPeriod,
            selectedCookeryVenue
        } = this.state;
        // if (durationType == 'SINGLE_SLOT') {
        if (
            (Object.keys(selectedDay).length !== 0 &&
                Object.keys(seletedTimeSlot).length !== 0 &&
                selectedGuest !== void 0 &&
                selectedGuest.length !== 0 &&
                selectedWheelchair !== void 0 &&
                selectedWheelchair.length !== 0) ||
            (Object.keys(selectedDay).length !== 0 &&
                Object.keys(seletedTimeSlot).length !== 0 &&
                selectedGuest !== void 0 &&
                selectedGuest.length !== 0 &&
                selectedWheelchair !== void 0 &&
                selectedWheelchair.length !== 0 &&
                selectedMealPeriod !== void 0 &&
                selectedMealPeriod.length !== 0) ||
            (Object.keys(selectedLimelightEvent).length !== 0 &&
                Object.keys(seletedTimeSlot).length !== 0 &&
                selectedGuest !== void 0 &&
                selectedGuest.length !== 0 &&
                selectedWheelchair !== void 0 &&
                selectedWheelchair.length !== 0) ||
            (Object.keys(selectedCookeryVenue).length !== 0 &&
                Object.keys(seletedTimeSlot).length !== 0 &&
                selectedGuest !== void 0 &&
                selectedGuest.length !== 0 &&
                selectedWheelchair !== void 0 &&
                selectedWheelchair.length !== 0)
        ) {
            this.setState({
                orderCanProceed: true,
                showError: false
            });
        } else {
            this.setState({
                orderCanProceed: false
            });
        }
    }

    handleWheelchairSelect = (wheelchair, index) => {
        const { selectedGuest } = this.state;
        const newSelectedWheelchair = [wheelchair];
        analytics.setAdditionalPageTrackAttributes({
            event: 'event329'
        });
        if (index === 'Yes') {
            this.setState({
                yesButton: !this.state.yesButton,
                noButton: false
            });
        } else if (index === 'No') {
            this.setState({
                yesButton: false,
                noButton: !this.state.noButton
            });
        }
        this.setState(
            {
                selectedWheelchair: newSelectedWheelchair,
                proceedForAddtoCart: true,
                proceedForDateSection: true,
                proceedForTimeSection: false,
                proceedForMealPeriod: false,
                seletedTimeSlot: {},
                showLodaer: selectedGuest.length ? true : false,
                orderCanProceed: false
            },
            () => {
                const { selectedWheelchair } = this.state;
                this.getShipEvntResOnWheelchairSel(
                    selectedGuest.length ? selectedGuest[0] : 0,
                    selectedWheelchair.length ? selectedWheelchair[0] : 0
                );
            }
        );
    };

    handleGuestsSelect = (guest, checked) => {
        const newSelectedGuest = [guest];
        analytics.setAdditionalPageTrackAttributes({
            event: 'event328'
        });
        this.setState({
            checkSoldOutInventories: false,
            selectedGuest: newSelectedGuest,
            selectedWheelchair: [],
            yesButton: false,
            noButton: false,
            proceedForDateSection: false,
            proceedForTimeSection: false,
            proceedForMealPeriod: false,
            seletedTimeSlot: {},
            orderCanProceed: false
        });
    };

    handleLimelightEvent = (value) => {
        const { limelightEvents } = this.props;
        analytics.setAdditionalPageTrackAttributes({
            event: 'event333'
        });
        let selectedEvent = {};
        limelightEvents.filter((event) => {
            if (event.value == value) {
                selectedEvent['title'] = event.label;
                selectedEvent['eventCode'] = event.eventCode;
                selectedEvent['value'] = event.value;
            }
        });
        this.setState({
            selectedLimelightEvent: selectedEvent,
            selectedGuest: [],
            selectedWheelchair: [],
            yesButton: false,
            noButton: false,
            proceedForDateSection: false,
            proceedForTimeSection: false,
            proceedForMealPeriod: false,
            checkSoldOutInventories: false,
            seletedTimeSlot: {},
            orderCanProceed: false
        });
    };

    handleCookeryVenue = (value) => {
        const { limelightEvents } = this.props;
        let selectedEvent = {};
        limelightEvents.filter((event) => {
            if (event.value == value) {
                selectedEvent['title'] = event.label;
                selectedEvent['eventCode'] = event.eventCode;
                selectedEvent['value'] = event.value;
            }
        });
        this.setState({
            selectedCookeryVenue: selectedEvent,
            selectedGuest: [],
            selectedWheelchair: [],
            yesButton: false,
            noButton: false,
            proceedForDateSection: false,
            proceedForTimeSection: false,
            proceedForMealPeriod: false,
            checkSoldOutInventories: false,
            seletedTimeSlot: {},
            orderCanProceed: false
        });
    };

    handleDateChange = (day, index, value) => {
        let categoriesList = [];
        let existValue = false;
        analytics.setAdditionalPageTrackAttributes({
            event: 'event330'
        });
        day.timeSlot.filter((items) => items.categories != '').map((items) => {
            existValue = categoriesList.find((e) => e == items.categories)
                ? true
                : false;
            if (!existValue) {
                categoriesList.push(items.categories);
            }
        });

        const checkAvalibilityCategories =
            categoriesList.length > 1 ? true : false;
        if (checkAvalibilityCategories) {
            this.setState(
                {
                    selectedDay: day,
                    monthTabValue: {
                        month_date: moment(day.date).format('MMM YYYY')
                    },
                    selectedDayTreatmentList: day.timeSlot,
                    proceedForMealPeriod: true,
                    proceedForTimeSection: false,
                    selectedMealPeriod: '',
                    seletedTimeSlot: {},
                    modified: !this.state.modified,
                    orderCanProceed: false
                },
                () => {
                    this.checkOrderCanProceed();
                }
            );
        } else if (!checkAvalibilityCategories) {
            this.setState(
                {
                    selectedDay: day,
                    monthTabValue: {
                        month_date: moment(day.date).format('MMM YYYY')
                    },
                    selectedDayTreatmentList: day.timeSlot,
                    proceedForTimeSection: true,
                    seletedTimeSlot: {},
                    selectedMealPeriod: '',
                    modified: !this.state.modified,
                    orderCanProceed: false
                },
                () => {
                    this.checkOrderCanProceed();
                }
            );
        }
    };

    handleMealPeriodChange = (e) => {
        analytics.setAdditionalPageTrackAttributes({
            event: 'event331'
        });
        this.setState(
            {
                selectedMealPeriod: e,
                checkMealPeriodClick: true,
                proceedForTimeSection: true,
                seletedTimeSlot: {},
                orderCanProceed: false
            },
            () => {
                this.checkOrderCanProceed();
            }
        );
    };

    handleTimeSlotChange = (selectedTimeSlot) => {
        this.setState(
            {
                seletedTimeSlot: selectedTimeSlot,
                checkTimeSlotClick: true
            },
            () => {
                this.checkOrderCanProceed();
            }
        );
    };

    handleDateChangeWhenNotInRange = () => {
        this.setState({ isMonthTabClicked: false });
    };

    calculateModeValue(x, y) {
        const a = Math.floor(y / x);
        const b = y - x * a;
        return x - b;
    }

    convertToAMPM(timeString) {
        let H = +timeString.substr(0, 2);
        let h = H % 12 || 12;
        let ampm = H < 12 ? ' AM' : ' PM';
        return h + timeString.substr(2, 3) + ampm;
    }

    buildDateRangeForTheCalender = () => {
        const { openTimeSlotData, durationType } = this.state;
        // const { eventsDetailsShipData, eventsDetailsSolrData } = this.props;  // AKS Not in use
        // const inventory = eventsDetailsShipData.inventory;
        let numOfDaysForApi = 7;
        const mqlMVP = watchForBreakpoint(VIEWPORT_TYPE.TABLET, true);
        if (mqlMVP.matches) {
            numOfDaysForApi = 3;
        }

        const header = SessionStorage.getItem('header');
        const { embarkationDate, disembarkationDate } = header;

        const dayOfCruiseEmbark = new Date(
            moment(embarkationDate, 'YYYY-MM-DD').format('ll')
        );
        const dayOfCruiseDeparture = new Date(
            moment(disembarkationDate, 'YYYY-MM-DD').format('ll')
        );
        const diffDays = calculateDiffDays(
            dayOfCruiseEmbark,
            dayOfCruiseDeparture
        );

        const calenderDateRange = [];
        const dateArray = new Array();
        const monthTabs = new Array();

        for (let i = 0; i <= diffDays; i++) {
            const date = moment(embarkationDate, 'YYYY-MM-DD')
                .add(i, 'days')
                .format('YYYY-MM-DD');
            dateArray.push({
                date: date,
                timeSlot: []
            });
            monthTabs.push({
                // date: date,
                month_date: moment(date).format('MMM YYYY')
            });
        }

        const portCalls = SessionStorage.getItem('portCalls');
        const port = portCalls['portCalls'].filter((singlePort) => {
            return singlePort.typeCode.$ !== 'PKG';
        });

        dateArray.map((singleDate, index) => {
            const date = singleDate.date;
            let inRangeValue = singleDate.timeSlot.length ? true : false;
            singleDate.name = '';
            singleDate.dayType = '';
            singleDate.port = {};
            singleDate.formatedDay = moment(singleDate.date).format('DD');
            singleDate.formatedMonth = moment(singleDate.date).format('MMM');
            singleDate.dayOftheWeek =
                moment(singleDate.date).day() !== 0
                    ? moment(singleDate.date).day()
                    : 7;
            singleDate.inRange = false;
            singleDate.isEmbarkationDate = false;
            singleDate.isDisembarkationDate = false;
            port.forEach((singlePort) => {
                const {
                    port: {
                        portCall: { startDate }
                    }
                } = singlePort;

                if (
                    date == startDate &&
                    (!singleDate.isEmbarkationDate &&
                        !singleDate.isDisembarkationDate)
                ) {
                    singleDate.name = singlePort.name ? singlePort.name : '';
                    singleDate.dayType = singlePort.typeCode
                        ? singlePort.typeCode.$
                        : '';
                    singleDate.port = singlePort.port;
                    singleDate.formatedDay = moment(startDate).format('DD');
                    singleDate.formatedMonth = moment(startDate).format('MMM');
                    singleDate.dayOftheWeek =
                        moment(startDate).day() !== 0
                            ? moment(startDate).day()
                            : 7;
                    singleDate.inRange = singlePort.typeCode
                        ? durationType !== 'MULTI_DAY_PASS'
                            ? singlePort.typeCode.$ == 'EMB' ||
                              singlePort.typeCode.$ == 'DEB'
                                ? false
                                : inRangeValue
                            : singlePort.typeCode.$ == 'EMB'
                                ? inRangeValue
                                : false
                        : inRangeValue;
                    singleDate.isEmbarkationDate = singlePort.typeCode
                        ? singlePort.typeCode.$ == 'EMB'
                            ? true
                            : false
                        : false;
                    singleDate.isDisembarkationDate = singlePort.typeCode
                        ? singlePort.typeCode.$ == 'DEB'
                            ? true
                            : false
                        : false;
                }
            });
            calenderDateRange.push(singleDate);
        });
        const jsonObject = monthTabs.map(JSON.stringify);
        const uniqueSet = new Set(jsonObject);
        const uniqueArray = Array.from(uniqueSet).map(JSON.parse);

        this.setState(
            {
                monthTabs: uniqueArray,
                calendarDates: calenderDateRange
                // proceedForDateSection: true
            },
            () => {
                this.sortCalendarDateRange();
            }
        );
    };

    getProductsPrice = () => {
        const { productPriceApi } = this.props.services.urls;
        let productCodes = '';
        if (this.state.productCodes && this.state.productCodes.length) {
            productCodes = this.state.productCodes.join(',');
        } else {
            return [];
        }
        const header = SessionStorage.getItem('header');
        const apikeyMycruise = getConfig('apikeyMycruise', '');
        const requestHeaders = {
            'Content-Type': 'application/json',
            'X-Source-Identity-Token-0': apikeyMycruise,
            'X-CommonData': JSON.stringify(header)
        };
        return FetchData(productPriceApi + '?productCodes=' + productCodes, {
            method: 'GET',
            headers: requestHeaders
        }).then((res) => {
            let products = {};
            res && res.products && res.products.length && res.products.map((d, i) => {
                let index = '-1';
                d.prices &&
                    d.prices.map((p, i) => {
                        if (p.type == 'BASE') {
                            index = i;
                        }
                    });
                if (index > '-1') {
                    d.basePrices = d.prices[index];
                    d.prices.splice(index, 1);
                }
                products[d.code] = d;
            });
            return products;
        });
    };

    sortCalendarDateRange = (key) => {
        const { checkIncluded } = this.props;
        const { calendarDates, listOfInventoryData, productCodes } = this.state;
        if (productCodes && productCodes.length > 0 && !checkIncluded) {
            this.getProductsPrice().then((products) => {
                const newcalendarDateRange = calendarDates.reduce(
                    (calendarObj, calendarDate) => {
                        let inRangeValue = false;
                        calendarDate.timeSlot = [];
                        listOfInventoryData.length &&
                            listOfInventoryData.forEach((singleInventory) => {
                                const singleAvailabilityDateTime = moment(
                                    singleInventory.availability,
                                    'YYYYMMDDhhmmss'
                                ).format('YYYY-MM-DD');
                                const singleAvailabilityTime =
                                    moment(
                                        singleInventory.availability,
                                        'YYYYMMDDhhmmss'
                                    ).format('mm') == '00'
                                        ? moment(
                                              singleInventory.availability,
                                              'YYYYMMDDhhmmss'
                                          ).format('ha')
                                        : moment(
                                              singleInventory.availability,
                                              'YYYYMMDDhhmmss'
                                          ).format('h.mma');

                                const singleCategories =
                                    singleInventory.categories;
                                const dateIsSame = moment(
                                    calendarDate.date
                                ).isSame(singleAvailabilityDateTime);
                                let price = '';
                                if (
                                    singleInventory.eventCode &&
                                    products[singleInventory.eventCode]
                                ) {
                                    let date = moment(
                                        singleInventory.availability,
                                        'YYYYMMDDhhmmss'
                                    ).format('YYYYMMDD');
                                    let pricearray = [];
                                    pricearray = products[
                                        singleInventory.eventCode
                                    ].prices.filter((p) => {
                                        if (
                                            p.validityStartDate <= date &&
                                            p.validityEndDate >= date
                                        ) {
                                            return true;
                                        }
                                    });
                                    if (pricearray.length) {
                                        price = pricearray[0].amount;
                                    } else if (
                                        products[singleInventory.eventCode]
                                            .basePrices
                                    ) {
                                        price =
                                            products[singleInventory.eventCode]
                                                .basePrices.amount;
                                    }
                                }
                                if (dateIsSame) {
                                    singleInventory[
                                        'time'
                                    ] = singleAvailabilityTime;
                                    singleInventory['price'] = price
                                        ? price
                                        : '';
                                    singleInventory[
                                        'categories'
                                    ] = singleCategories;
                                    inRangeValue = true;
                                    calendarDate.timeSlot.push(singleInventory);
                                }
                            });
                        calendarObj.push(calendarDate);
                        return calendarObj;
                    },
                    []
                );
                this.setState(
                    {
                        calenderDateRange: newcalendarDateRange
                    },
                    () => {
                        const { isMonthTabClicked } = this.state;
                        if (isMonthTabClicked) {
                            const {
                                calenderDateRange,
                                monthTabValue
                            } = this.state;
                            const index = calenderDateRange.findIndex(
                                (singleDate) =>
                                    moment(
                                        monthTabValue.month_date,
                                        'MMM YY'
                                    ).format('YYYY-MM-DD') == singleDate.date
                            );
                            const clickIndex = index > -1 ? index : 1;
                            const ele = document.getElementsByClassName(
                                'calendar__day'
                            )[clickIndex];
                            ele && ele.click();
                        }
                    }
                );
            });
        } else {
            const newcalendarDateRange = calendarDates.reduce(
                (calendarObj, calendarDate) => {
                    let inRangeValue = false;
                    calendarDate.timeSlot = [];
                    listOfInventoryData.length &&
                        listOfInventoryData.forEach((singleInventory) => {
                            const singleAvailabilityDateTime = moment(
                                singleInventory.availability,
                                'YYYYMMDDhhmmss'
                            ).format('YYYY-MM-DD');
                            const singleAvailabilityTime =
                                moment(
                                    singleInventory.availability,
                                    'YYYYMMDDhhmmss'
                                ).format('mm') == '00'
                                    ? moment(
                                            singleInventory.availability,
                                            'YYYYMMDDhhmmss'
                                        ).format('ha')
                                    : moment(
                                            singleInventory.availability,
                                            'YYYYMMDDhhmmss'
                                        ).format('h.mma');

                            const singleCategories = singleInventory.categories;
                            const dateIsSame = moment(calendarDate.date).isSame(
                                singleAvailabilityDateTime
                            );
                            if (dateIsSame) {
                                singleInventory[
                                    'time'
                                ] = singleAvailabilityTime;
                                singleInventory['price'] = '';
                                singleInventory[
                                    'categories'
                                ] = singleCategories;
                                inRangeValue = true;
                                calendarDate.timeSlot.push(singleInventory);
                            }
                        });
                    calendarObj.push(calendarDate);
                    return calendarObj;
                },
                []
            );
            this.setState(
                {
                    calenderDateRange: newcalendarDateRange
                },
                () => {
                    const { isMonthTabClicked } = this.state;
                    if (isMonthTabClicked) {
                        const { calenderDateRange, monthTabValue } = this.state;
                        const index = calenderDateRange.findIndex(
                            (singleDate) =>
                                moment(
                                    monthTabValue.month_date,
                                    'MMM YY'
                                ).format('YYYY-MM-DD') == singleDate.date
                        );
                        const clickIndex = index > -1 ? index : 1;
                        const ele = document.getElementsByClassName(
                            'calendar__day'
                        )[clickIndex];
                        ele && ele.click();
                    }
                }
            );
        }
    };


    handleSubmit = () => {
        this.setState({ showLodaer: true });
        const currentDate = new Date();
        const currentTime = moment(currentDate, 'HH:mm:ss a');
        const checkCurrentTime = moment.duration(
            currentTime.diff(this.state.setCurrentTime)
        );
        const hoursa = parseInt(checkCurrentTime.asHours());
        const minutesa = parseInt(checkCurrentTime.asMinutes()) - hoursa * 60;
        const secondsa = parseInt(checkCurrentTime.asSeconds()) - minutesa * 60;
        this.setState({
            setCurrentTime: currentTime
        });
        const { labels, bookedDiningData, services } = this.props;
        const {
            selectedGuest,
            selectedWheelchair,
            selectedDay,
            seletedTimeSlot,
            checkEventsCode
        } = this.state;
        const header = SessionStorage.getItem('header');
        const { eventAddToCart } = services.urls;
        const { customer } = header;
        const apikeyMycruise = getConfig('apikeyMycruise', '');
        const reservedTimeDuration = getConfig(
            'reservedTimeDurationDining',
            ''
        );
        const config = typeof window !== 'undefined' ? window.configs : '';
        let pageUrl = window.location.href.split('/booking');
        const redirectUrl = pageUrl[0];
        const eventPdpUrl = window.location.origin + window.location.pathname;
        const customCurrencyCode =
            config.brand.toLowerCase() === 'po' ? 'gbp' : 'usd';
        const selectedDateValue = moment(
            seletedTimeSlot.availability,
            'YYYYMMDDhhmmss'
        ).format('YYYYMMDD');
        const selectedTimeValue = moment(
            seletedTimeSlot.time,
            'HH:mm A'
        ).format('HHmm');
        const serviceStartTime = `${selectedDateValue}${selectedTimeValue}00`;
        const covertToNumber = Number(serviceStartTime);
        const enTime =
            checkEventsCode.endDateTime - checkEventsCode.startDateTime;
        const serviceEndTime = (covertToNumber + enTime).toString();
        const requestData = {};
        requestData['productCode'] = seletedTimeSlot.eventCode;
        requestData['resHoldId'] = seletedTimeSlot.eventId;
        requestData['category'] = 'DINING';
        requestData['productType'] = 'XDINING';
        requestData['productTitle'] = bookedDiningData[0].title;
        requestData['noOfWheelchairSpace'] = Number(selectedWheelchair[0]);
        requestData['venueCode'] = checkEventsCode.venueCode;
        requestData['venueTitle'] = checkEventsCode.venueName;
        requestData['thumbnailImageUrl'] = bookedDiningData[0].thumbnailImage;
        requestData['serviceStartTime'] = serviceStartTime;
        requestData['serviceEndTime'] = serviceEndTime;
        requestData['noOfGuests'] = selectedGuest[0];
        requestData['qty'] = 1;
        requestData['productPrice'] =
            seletedTimeSlot.price !== '' ? seletedTimeSlot.price : 0.0;
        requestData['eventPdpUrl'] = eventPdpUrl;
        header.passengers.forEach((passenger) => {
            if (customer.PaxNumber == passenger.paxNumber) {
                requestData['guestIdOfBooker'] = passenger.guestId;
            }
        });
        const updateCartApiUrl = eventAddToCart;
        if (secondsa > 3 || isNaN(secondsa)) {
            FetchData(updateCartApiUrl, {
                method: 'POST',
                body: JSON.stringify(requestData),
                headers: {
                    'Content-Type': 'application/json',
                    'X-CommonData': JSON.stringify(header),
                    'X-Source-Identity-Token-0': apikeyMycruise
                }
            })
                .then((res) => {
                    if (res.error || (res.errors && res.errors.length)) {
                        this.setState({
                            showLodaer: false,
                            showModal: true,
                            setCurrentTime: currentTime
                        });
                    } else {
                        analytics.customClicks(
                            {
                                event: 'scadd',
                                product_add2cart: {
                                    productId: requestData['venueCode'],
                                    skuID: requestData['productCode'],
                                    unitPrice: requestData['productPrice'],
                                    quantity: requestData['noOfGuests']
                                }
                            },
                            'AddToCartDining'
                        );

                        this.setState({
                            showLodaer: false,
                            setCurrentTime: currentTime
                        });
                        const checkCategories =
                            seletedTimeSlot.categories !== '' ? true : false;
                        let diningDescriptionValue = '';
                        diningDescriptionValue = checkCategories
                            ? `${seletedTimeSlot.categories}${'\u00a0\u00a0|\u00a0\u00a0'}${
                                  seletedTimeSlot.time
                              }${'\u00a0\u00a0|\u00a0\u00a0'}${moment(seletedTimeSlot.availability,
                                'YYYYMMDDhhmmss').format(
                                  'DD MMM YY'
                              )}${'\u00a0\u00a0|\u00a0\u00a0'}${selectedGuest[0]} ${labels.guestsLabel}`
                            : `${seletedTimeSlot.time}${'\u00a0\u00a0|\u00a0\u00a0'}${moment(
                                seletedTimeSlot.availability,
                                'YYYYMMDDhhmmss'
                              ).format('DD MMM YY')}${'\u00a0\u00a0|\u00a0\u00a0'}${selectedGuest[0]} ${
                                  labels.guestsLabel
                              }`;

                        const hoursValue =
                            reservedTimeDuration < 60
                                ? `${reservedTimeDuration} mins`
                                : `${Math.floor(
                                      reservedTimeDuration / 60
                                  )} hr ${reservedTimeDuration % 60} mins`;

                        const seatValues = labels.reservedDescriptionLabel.replace(
                            '{hours}',
                            `${hoursValue}`
                        );

                        const popUpObj = {
                            name: bookedDiningData[0].title,
                            currency: '',
                            total:
                                seletedTimeSlot.price !== ''
                                    ? `${labels.currencyLabel}${(
                                          Number(seletedTimeSlot.price) *
                                          selectedGuest[0]
                                      ).toFixed(2)}`
                                    : 0.0,
                            numberOfItems: '1',
                            diningDescription: diningDescriptionValue,
                            diningLowerDescription: seatValues,
                            show_dining_Description: true,
                            isDiningPopUpShow: true
                        };
                        SessionStorage.setItem('addToCartPopUp', popUpObj);
                        window.location.href = redirectUrl;
                    }
                })
                .catch((error) => {
                    // TODO: error menagement
                });
        }
    };

    handleMonthTabClick = (monthTab) => {
        this.setState(
            {
                monthTabValue: monthTab,
                isMonthTabClicked: true
            },
            () => {
                const { calenderDateRange } = this.state;
                const index = calenderDateRange.findIndex(
                    (singleDate) =>
                        moment(monthTab.month_date, 'MMM YYYY').format(
                            'YYYY-MM-DD'
                        ) == singleDate.date
                );
                const clickIndex = index > -1 ? index : 0;
                const ele = document.getElementsByClassName('calendar__day')[
                    clickIndex
                ];
                ele && ele.click();
            }
        );
    };

    handleModalClose = () => {
        this.setState(() => ({ showModal: false }));
    };
	
	gobackUrl = () => {
        let pageUrl = window.location.href.split('/booking');
        window.location.href = pageUrl[0];
    };

    render() {
        const {
            labels,
            bestPriceImageUrl,
            checkIncluded,
            checkErrorShipEventApi,
            limelightEvents,
            checkExperiencesValue
        } = this.props;
        const {
            showError,
            selectedPassenger,
            maxSelectable,
            selectedDuration,
            selectedDay,
            maxSelected,
            calenderDateRange,
            proceedForDurationSection,
            proceedForDateSection,
            proceedForTimeSection,
            proceedForMealPeriod,
            selectedDayTreatmentList,
            modified,
            seletedTimeSlot,
            selectedMealPeriod,
            orderCanProceed,
            durationType,
            tabIndex,
            monthTabs,
            isMonthTabClicked,
            monthTabValue,
            checkWheelChair,
            checkWheelChairNo,
            selectedWheelchair,
            showModal,
            overlayText,
            proceedForAddtoCart,
            checkSoldOut,
            eventCatoryies,
            checkSoldOutInventories,
            selectedGuest,
            yesButton,
            noButton,
            selectedLimelightEvent,
            checkLimelightEvent,
            selectedCookeryVenue,
            checkCookeryVenue
        } = this.state;
        const header = SessionStorage.getItem('header');
        let pageUrl = window.location.href.split('/booking');
        const redirectUrl = pageUrl[0];

        // return !checkSoldOutEvents && !checkBookedPassengers ? (
        return !checkErrorShipEventApi && !checkExperiencesValue ? (
            <div className="entertainmentConfigPage-tile-container">
                <div className="eventLocation">
                    <h2>
                        {checkCookeryVenue
                            ? labels.bookClassLabel
                            : labels.bookTableLabel}
                    </h2>
                </div>
                {this.state.showLodaer && (
                    <div className="throbberOverlay">
                        <Loader show={this.state.showLodaer} />
                    </div>
                )}
                {showModal && (
                    <Modal
                        mounted={showModal}
                        onExit={this.handleModalClose}
                        contentLabel="Not Available"
                        underlayClass=""
                    >
                        <div className="model_body">
                            <div className="icon__container">
                                <span className="icon-heading" />
                            </div>
                            <h1>{labels.notAvailableLabel}</h1>
                            <p>{labels.noAvailabilityMessageLabel}</p>
                        </div>

                        <div className="modal-btns">
                            <Link
                                ariaLabel={labels.goBackLabel}
                                url={redirectUrl}
                                title={labels.goBackLabel}
                                linkClassName={`cta-button-outline`}
                                onClick={this.gobackUrl}
                            >
                                {labels.goBackLabel}
                            </Link>
                        </div>
                    </Modal>
                )}
                <DiningForm
                    labels={labels}
                    calenderDateRange={calenderDateRange}
                    selectedPassenger={selectedPassenger}
                    maxSelectable={maxSelectable}
                    maxSelected={maxSelected}
                    passengers={header.passengers}
                    selectedDay={selectedDay}
                    disembarkDate={header.disembarkationDate}
                    embarkDate={header.embarkationDate}
                    selectedDuration={selectedDuration}
                    selectDurationHandler={this.handleDurationSelect}
                    selectWheelchairHandler={this.handleWheelchairSelect}
                    selectedWheelchair={selectedWheelchair}
                    selectGuestHandler={this.handleGuestsSelect}
                    selectedGuest={selectedGuest}
                    dateChangeHnadler={this.handleDateChange}
                    proceedForDurationSection={proceedForDurationSection}
                    proceedForDateSection={proceedForDateSection}
                    proceedForTimeSection={proceedForTimeSection}
                    proceedForMealPeriod={proceedForMealPeriod}
                    selectedDayTreatmentList={selectedDayTreatmentList}
                    modified={modified}
                    selectTimeslotHandler={this.handleTimeSlotChange}
                    selectMealPeriodHandler={this.handleMealPeriodChange}
                    seletedTimeSlot={seletedTimeSlot}
                    selectedMealPeriod={selectedMealPeriod}
                    durationType={durationType}
                    sliderChangeHandler={this.handleSliderChange}
                    tabClickHandler={this.handleTabClick}
                    tabIndex={tabIndex}
                    bestPriceImageUrl={bestPriceImageUrl}
                    monthTabs={monthTabs}
                    monthTabClickHandler={this.handleMonthTabClick}
                    isMonthTabClicked={isMonthTabClicked}
                    selectedMonthTab={monthTabValue}
                    checkWheelChair={checkWheelChair}
                    checkWheelChairNo={checkWheelChairNo}
                    proceedForAddtoCart={proceedForAddtoCart}
                    dateChangeHandlerWhenNotInRange={
                        this.handleDateChangeWhenNotInRange
                    }
                    checkSoldOutInventories={checkSoldOutInventories}
                    eventCatoryies={eventCatoryies}
                    yesButton={yesButton}
                    noButton={noButton}
                    getShipEventAPI={this.getShipEvntResOnWheelchairSel}
                    limelightEvents={limelightEvents}
                    selectLimelightEvent={this.handleLimelightEvent}
                    selectedLimelightEvent={selectedLimelightEvent}
                    checkLimelightEvent={checkLimelightEvent}
                    selectCookeryVenue={this.handleCookeryVenue}
                    selectedCookeryVenue={selectedCookeryVenue}
                    checkCookeryVenue={checkCookeryVenue}
                />
                {showError && (
                    <div className="error_msg_container">
                        {labels.addToCartErrorLabel}
                    </div>
                )}
                {orderCanProceed && (
                    <div>
                        {/* <div className="type additional">
                        <span>{labels.inculdedHolidayLabel}</span>
                    </div> */}
                        <hr />
                        <div className="botton-container">
                            <DiningFormSummary
                                labels={labels}
                                seletedTimeSlot={seletedTimeSlot}
                                selectedDay={selectedDay}
                                selectedGuest={selectedGuest}
                                currency={labels.currencyLabel}
                                checkIncluded={checkIncluded}
                            />
                            <DiningAddToCart
                                labels={labels.addtoBasketLabel}
                                maxSelected={maxSelected}
                                maxSelectable={maxSelectable}
                                orderCanProceed={orderCanProceed}
                                submitButtonHandler={this.handleSubmit}
                            />
                        </div>
                    </div>
                )}
            </div>
        ) : (
            <div className="soldout-container">
                <div className="soldout-message">
                    <h2>
                        {checkExperiencesValue
                            ? labels.comingSoonTitleDiningExperiencesLabel
                            : labels.allSeatsSoldOutTitleLabel}
                    </h2>
                </div>
                <div className="soldout-content">
                    <span
                        dangerouslySetInnerHTML={{
                            __html: checkExperiencesValue
                                ? labels.comingSoonDescriptionDiningExperiencesLabel
                                : labels.allSeatsSoldOutDescriptionLabel
                        }}
                    />
                </div>

                <div className="category-book">
                    <Link
                        ariaLabel={labels.viewOtherEventsLabel}
                        url={redirectUrl}
                        title={labels.viewOtherEventsLabel}
                        linkClassName={`cta-button-outline`}
                        onClick={this.gobackUrl}
                    >
                        {labels.viewOtherEventsLabel}
                    </Link>
                </div>
            </div>
        );
    }
}

export default diningBookingConfigLabels;
