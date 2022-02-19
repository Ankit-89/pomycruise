/*
 * React Modal
 *
 * For examples and features: https://github.com/davidtheclark/react-aria-modal
 */
'use strict';

import React from 'react';
import moment from 'moment';
import EntertainmentForm from './entertainmentForm';
import { getConfig } from '../commons/CUK/utilities';
import { calculateAge, calculateDiffDays } from '../commons/CUK/dateFormat';
import SessionStorage from '../commons/CUK/session-storage';
import EntertainmentAddToCart from './entertainmentAddToCart';
import FetchData from '../commons/CUK/fetch-data';
import Loader from '../commons/CUK/loader';
import analytics from '../commons/CUK/analytics';
import Modal from '../commons/CUK/modal';
import Link from '../commons/CUK/link';
import {
    VIEWPORT_TYPE,
    watchForBreakpoint
} from '../../library/js/config/breakpoints';

class entertainmentConfigLabels extends React.Component {
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
            selectedDay: {},
            seletedTimeSlot: {},
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
            listOfInventoryData: [],
            checkSoldOutInventories: false,
            setCurrentTime: ''
        };
    }

    componentWillMount() {
        const header = SessionStorage.getItem('header');
        const { passengers } = header;
        const { eventsDetailsShipData } = this.props;
        const maxSelectable = passengers.length;
        let durationType = 'SINGLE_SLOT';

        this.setState({
            maxSelectable: maxSelectable,
            durationType: durationType,
            showError: false,
            eventCatoryies: eventsDetailsShipData.categories
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
        const skusList = [];
        const analyticsObject = {
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
                // spaTreatmentType: name,
                productType: 'entertainment',
                // productId: baseProduct,
                skus: skusList
            }
        };
        analytics.setAdditionalPageTrackAttributes(analyticsObject);
    }

    getShipEvntResOnWheelchairSel = (noOfGuestSel, noofWheelSel) => {
        console.log('props on ship event for wheelchair', this.props);
        const apikeyMycruise = getConfig('apikeyMycruise', '');
        const { services } = this.props;
        const { brand } = services.headers;
        const { shipEventAPi } = services.urls;
        const header = SessionStorage.getItem('header');
        const cruiseSummaryData = SessionStorage.getItem('cruiseSummaryData');
        const { customer } = header;
        let pageUrl = window.location.href.split('/');
        const eventCategory = pageUrl[pageUrl.length - 2]; //SessionStorage.getItem('eventCategory');
        const eventCode = pageUrl[pageUrl.length - 1]; //SessionStorage.getItem('eventCategory');
        //const eventId = '115006860'; //pageUrl[pageUrl.length - 1]; //SessionStorage.getItem('eventCategory');
        header.passengers.forEach((passenger) => {
            if (customer.PaxNumber == passenger.paxNumber) {
                customer['guestId'] = passenger.guestId;
            }
        });
        const { embarkationDate } = header;
        const API = `${shipEventAPi}/${header.shipCode}`;
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

        const requestBody = {
            data: {
                startDateTime: startDate, //'20210401170800',
                endDateTime: endDate, //'20210530170800',
                guests: [customer.guestId],
                partySize: noOfGuestSel,
                numberOfWheelchairsInParty: noofWheelSel,
                venueCodes: [],
                types: [],
                categories: [`${eventCategory}`] //categories: ['ENTERTAINMENT']
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
                if (res.data[0].events) {
                    //ship events found in list
                    const { events } = res.data[0];

                    const listOfInventory = [];
                    const listOfSoldOutInventory = [];

                    const checkEventsCode = events.find(
                        (item) => item.eventCode === eventCode
                    );

                    events.length > 0 &&
                        events
                            .filter((event) => event.eventCode === eventCode)
                            .map((event, index) => {
                                const preCruiseAva = event.categories.find(
                                    (e) => e == preCruiseValue
                                );

                                const preCruiseAvailable =
                                    preCruiseAva == preCruiseValue
                                        ? true
                                        : false;

                                preCruiseAvailable &&
                                    event.inventory.map((inventry, i) => {
                                        inventry.eventId = '';
                                        if (inventry.status == 'Available') {
                                            inventry.eventId = event.eventId;
                                            listOfInventory.push(inventry);
                                        } else if (
                                            inventry.status == 'Sold Out'
                                        ) {
                                            listOfSoldOutInventory.push(
                                                inventry
                                            );
                                        }
                                    });
                            });
                    // console.log('this', this);
                    const checkSoldOutInv =
                        events.length === listOfSoldOutInventory.length ||
                        checkEventsCode === '' ||
                        checkEventsCode === undefined
                            ? true
                            : false;
                    this.setState(
                        {
                            listOfInventoryData: listOfInventory,
                            proceedForDateSection: true,
                            showLodaer: false,
                            checkSoldOutInventories: checkSoldOutInv
                        },
                        () => {
                            this.sortCalendarDateRange();
                        }
                    );
                } else {
                    //no record found in particular category
                }
            } else {
                //API error
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
            selectedPassenger,
            selectedDuration,
            selectedWheelchair,
            selectedDay,
            seletedTimeSlot,
            durationType
        } = this.state;
        // if (durationType == 'SINGLE_SLOT') {
        if (
            Object.keys(selectedDay).length !== 0 &&
            Object.keys(seletedTimeSlot).length !== 0 &&
            selectedPassenger !== void 0 &&
            selectedPassenger.length !== 0 &&
            selectedWheelchair !== void 0 &&
            selectedWheelchair.length !== 0
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

    handlePassengerSelect = (passengerIndex, passengerEnabled) => {
        this.setState(
            (prevState, props) => {
                const { selectedPassenger, maxSelectable } = prevState;
                let newSelectedPassenger;
                if (maxSelectable === 1) {
                    newSelectedPassenger = [passengerIndex];
                } else {
                    if (passengerEnabled) {
                        newSelectedPassenger = [
                            ...selectedPassenger,
                            passengerIndex
                        ];
                    } else {
                        newSelectedPassenger = selectedPassenger.filter(
                            (passenger) => passenger !== passengerIndex
                        );
                    }
                }
                return {
                    selectedPassenger: newSelectedPassenger,
                    selectedWheelchair: [],
                    checkWheelChair: false,
                    checkWheelChairNo: false,
                    maxSelected: newSelectedPassenger.length >= maxSelectable,
                    proceedForDurationSection:
                        newSelectedPassenger.length >= maxSelectable,
                    proceedForDateSection: false,
                    proceedForTimeSection: false
                };
            },
            () => {
                this.checkOrderCanProceed();
            }
        );
        analytics.clickTracking(this);
        analytics.setAdditionalPageTrackAttributes({
            event: 'event323'
        });
    };

    handleWheelchairSelect = (wheelchair, checked) => {
        const { selectedPassenger } = this.state;
        const newSelectedWheelchair = [wheelchair];
        this.setState(
            {
                selectedWheelchair: newSelectedWheelchair,
                proceedForAddtoCart: true,
                proceedForDateSection: true,
                proceedForTimeSection: false,
                showLodaer: selectedPassenger.length ? true : false
            },
            () => {
                const { selectedWheelchair } = this.state;
                this.getShipEvntResOnWheelchairSel(
                    selectedPassenger.length,
                    selectedWheelchair.length ? selectedWheelchair[0] : 0
                );
            }
        );
    };

    handleDateChange = (day, index, value) => {
        this.setState(
            {
                selectedDay: day,
                monthTabValue: {
                    month_date: moment(day.date).format('MMM YYYY')
                },
                selectedDayTreatmentList: day.timeSlot,
                proceedForTimeSection: true,
                seletedTimeSlot: {},
                modified: !this.state.modified
            },
            () => {
                this.checkOrderCanProceed();
            }
        );
        analytics.clickTracking(this);
        analytics.setAdditionalPageTrackAttributes({
            event: 'event325'
        });
    };

    handleWheelChair = (value) => {
        const { selectedPassenger } = this.state;
        const wheelChairYes = value == 'Yes' ? true : false;
        const wheelChairNo = value == 0 ? true : false;
        this.setState(
            {
                checkWheelChair: wheelChairYes,
                checkWheelChairNo: wheelChairNo,
                selectedWheelchair: value == 0 ? value : [],
                proceedForAddtoCart: true,
                proceedForTimeSection: false,
                proceedForDateSection: wheelChairNo,
                showLodaer:
                    wheelChairNo && selectedPassenger.length ? true : false
            },
            () => {
                const { selectedWheelchair } = this.state;
                wheelChairNo &&
                    selectedPassenger.length &&
                    this.getShipEvntResOnWheelchairSel(
                        selectedPassenger.length,
                        selectedWheelchair.length ? selectedWheelchair[0] : 0
                    );
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

    sortCalendarDateRange = (key) => {
        const minAdultAge = getConfig('minAdultAge') || 18;
        const header = SessionStorage.getItem('header');
        const { passengers } = header;
        const {
            calendarDates,
            listOfInventoryData,
            selectedPassenger,
            maxSelectable
        } = this.state;
        const { bookedEventData } = this.props;

        let selectedPassengerArrary = new Array();
        selectedPassenger.forEach((value, index) => {
            bookedEventData
                .filter((bookedEvents) => bookedEvents.paxId == value)
                .map((bookedEvents) => {
                    const bookedDate = moment(
                        bookedEvents.startDateTime,
                        'YYYYMMDDhhmmss'
                    ).format('YYYY-MM-DD');
                    selectedPassengerArrary.push({
                        paxId: value,
                        bookedDate: bookedDate
                    });
                });
        });
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
                        const singleEventId = singleInventory.eventId;
                        const dateIsSame = moment(calendarDate.date).isSame(
                            singleAvailabilityDateTime
                        );
                        
                        if (selectedPassengerArrary.length > 0) {
                            const checkBookedDate = selectedPassengerArrary.find(
                                (dateValue) =>
                                    dateValue.bookedDate == calendarDate.date
                            );
                            if (dateIsSame && checkBookedDate == undefined) {
                                singleInventory[
                                    'time'
                                ] = singleAvailabilityTime;
                                singleInventory['eventId'] = singleEventId;
                                inRangeValue = true;
                                calendarDate.timeSlot.push(singleInventory);
                            }
                        } else {
                            if (dateIsSame) {
                                singleInventory[
                                    'time'
                                ] = singleAvailabilityTime;
                                singleInventory['eventId'] = singleEventId;
                                inRangeValue = true;
                                calendarDate.timeSlot.push(singleInventory);
                            }
                        }
                    });

                if (
                    inRangeValue &&
                    selectedPassenger.length &&
                    maxSelectable == 1
                ) {
                    passengers.forEach((singlePassenger) => {
                        if (singlePassenger.paxNumber == selectedPassenger[0]) {
                            const dateToCompare = new Date(calendarDate.date);
                            const passengerBirth = new Date(
                                singlePassenger.birthDate
                            );
                            const ageAtDate = calculateAge(
                                passengerBirth.getTime(),
                                dateToCompare.getTime()
                            );
                            if (ageAtDate < minAdultAge) {
                                inRangeValue = false;
                            }
                        }
                    });
                }

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
                            moment(monthTabValue.month_date, 'MMM YY').format(
                                'YYYY-MM-DD'
                            ) == singleDate.date
                    );
                    const clickIndex = index > -1 ? index : 1;
                    const ele = document.getElementsByClassName(
                        'calendar__day'
                    )[clickIndex];
                    ele && ele.click();
                }
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
        const {
            labels,
            eventsDetailsShipData,
            eventsDetailsSolrData,
            services
        } = this.props;
        const {
            selectedPassenger,
            selectedWheelchair,
            selectedDay,
            seletedTimeSlot
        } = this.state;
        const header = SessionStorage.getItem('header');
        const { eventAddToCart } = services.urls;
        const { customer } = header;
        const apikeyMycruise = getConfig('apikeyMycruise', '');
        const reservedTimeDuration = getConfig('reservedTimeDuration', '');
        const config = typeof window !== 'undefined' ? window.configs : '';
        let pageUrl = window.location.href.split('/');
        const eventCategory = pageUrl[pageUrl.length - 2];
        const enetertainmentValue = pageUrl[pageUrl.length - 4];
        const eventsDetailsValue = pageUrl[pageUrl.length - 3];
        const eventCodeValue = pageUrl[pageUrl.length - 1];
        let pageEntUrl = window.location.href.split('/entertainment');
        const rebookRedirectUrl =
            pageEntUrl[0] + '/entertainment/events/' + eventCategory;
        const eventPdpUrl =
            enetertainmentValue +
            '/' +
            eventsDetailsValue +
            '/' +
            eventCategory +
            '/' +
            eventCodeValue;
        const customCurrencyCode =
            config.brand.toLowerCase() === 'po' ? 'gbp' : 'usd';

        const requestData = { recipients: [] };
        selectedPassenger.forEach((value, index) => {
            requestData['recipients'].push({
                paxNo: value,
                bookingRef: header.bookingRef
            });
        });

        let stime = eventsDetailsShipData.startDateTime.replace(
            /^(\d{4})(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)$/,
            '$4:$5'
        );
        let etime = eventsDetailsShipData.endDateTime.replace(
            /^(\d{4})(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)$/,
            '$4:$5'
        );
        let startTime = this.convertToAMPM(stime);
        let endTime = this.convertToAMPM(etime);
        var stTime = moment(startTime, 'HH:mm a');
        var ennTime = moment(endTime, 'HH:mm a');
        var duration = moment.duration(ennTime.diff(stTime));
        var hours = parseInt(duration.asHours());
        var minutes = parseInt(duration.asMinutes()) - hours * 60;
        const finalMintes = minutes == 0 ? hours * 60 : minutes;

        const selectedDateValue = moment(selectedDay.date).format('YYYYMMDD');
        const selectedTimeValue = moment(
            seletedTimeSlot.time,
            'HH:mm A'
        ).format('HHmm');
        const serviceStartTime = `${selectedDateValue}${selectedTimeValue}00`;
        const covertToNumber = Number(serviceStartTime);
        const enTime =
            eventsDetailsShipData.endDateTime -
            eventsDetailsShipData.startDateTime;
        const serviceEndTime = (covertToNumber + enTime).toString();

        requestData['productCode'] = eventsDetailsShipData.eventCode;
        requestData['resHoldId'] = seletedTimeSlot.eventId;
        requestData['category'] = eventCategory;
        requestData['productType'] = 'ENTERTAINMENT';
        requestData['productTitle'] = eventsDetailsSolrData.title;
        requestData['noOfWheelchairSpace'] = Number(selectedWheelchair[0]);
        requestData['venueCode'] = eventsDetailsShipData.venueCode;
        requestData['venueTitle'] = eventsDetailsShipData.venueName;
        requestData['thumbnailImageUrl'] = eventsDetailsSolrData.thumbnailImage;
        requestData['serviceStartTime'] = serviceStartTime;
        requestData['serviceEndTime'] = serviceEndTime;
        requestData['noOfGuests'] = selectedPassenger.length;
        requestData['qty'] = 1;
        requestData['price'] = 0.0;
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
                        this.setState({
                            showLodaer: false,
                            setCurrentTime: currentTime
                        });
                        const eventId = requestData.resHoldId;

                        let eventDescriptionValue = '';
                        eventDescriptionValue = `${
                            labels.estimatedTimeLabel
                        } - ${finalMintes} Minutes | ${moment(
                            seletedTimeSlot.time,
                            'hh:mm A'
                        ).format('h.mm A')} | ${moment(selectedDay.date).format(
                            'DD MMM YY'
                        )}`;

                        const hoursValue =
                            reservedTimeDuration < 60
                                ? `${reservedTimeDuration} mins`
                                : `${Math.floor(
                                      reservedTimeDuration / 60
                                  )} hr ${reservedTimeDuration % 60} mins`;

                        const seatValues = labels.seatNumbersLabel.replace(
                            '{hours}',
                            `${hoursValue}`
                        );

                        const popUpObj = {
                            name: eventsDetailsSolrData.title,
                            total: labels.inculdedHolidayLabel,
                            currency: '',
                            numberOfItems: '1',
                            eventDescription: eventDescriptionValue,
                            eventLowerDescription: seatValues,
                            show_event_Description: true,
                            isPopUpShow: true
                        };
                        SessionStorage.setItem('addToCartPopUp', popUpObj);
                        window.location.href = rebookRedirectUrl;
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

    render() {
        const {
            labels,
            bestPriceImageUrl,
            VenueSolrData,
            checkSoldOutEvents,
            bookedEventData,
            checkBookedPassengers
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
            selectedDayTreatmentList,
            modified,
            seletedTimeSlot,
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
            checkSoldOutInventories
        } = this.state;
        const header = SessionStorage.getItem('header');
        let url = `/events`;

        return !checkSoldOutEvents && !checkBookedPassengers ? (
            <div className="entertainmentConfigPage-tile-container">
                <div className="eventLocation">
                    <h1>{labels.reserveSeatsLabel}</h1>
                    <span>
                        {labels.locationLabel}: {VenueSolrData.location}
                    </span>
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
                                url={url}
                                title={labels.goBackLabel}
                                linkClassName={`cta-button-outline`}
                                onClick={() => window.history.back()}
                            >
                                {labels.goBackLabel}
                            </Link>
                        </div>
                    </Modal>
                )}
                <EntertainmentForm
                    labels={labels}
                    calenderDateRange={calenderDateRange}
                    selectedPassenger={selectedPassenger}
                    selectPassengerHandler={this.handlePassengerSelect}
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
                    dateChangeHnadler={this.handleDateChange}
                    proceedForDurationSection={proceedForDurationSection}
                    proceedForDateSection={proceedForDateSection}
                    proceedForTimeSection={proceedForTimeSection}
                    selectedDayTreatmentList={selectedDayTreatmentList}
                    modified={modified}
                    selectTimeslotHandler={this.handleTimeSlotChange}
                    seletedTimeSlot={seletedTimeSlot}
                    durationType={durationType}
                    sliderChangeHandler={this.handleSliderChange}
                    tabClickHandler={this.handleTabClick}
                    tabIndex={tabIndex}
                    bestPriceImageUrl={bestPriceImageUrl}
                    monthTabs={monthTabs}
                    monthTabClickHandler={this.handleMonthTabClick}
                    isMonthTabClicked={isMonthTabClicked}
                    selectedMonthTab={monthTabValue}
                    handleWheelChair={this.handleWheelChair}
                    checkWheelChair={checkWheelChair}
                    checkWheelChairNo={checkWheelChairNo}
                    proceedForAddtoCart={proceedForAddtoCart}
                    dateChangeHandlerWhenNotInRange={
                        this.handleDateChangeWhenNotInRange
                    }
                    checkSoldOutInventories={checkSoldOutInventories}
                    eventCatoryies={eventCatoryies}
                    bookedEventData={bookedEventData}
                />
                {showError && (
                    <div className="error_msg_container">
                        {labels.addToCartErrorLabel}
                    </div>
                )}
                {orderCanProceed && (
                    <div>
                        <div className="type additional">
                            <span>{labels.inculdedHolidayLabel}</span>
                        </div>
                        <div className="botton-container">
                            <EntertainmentAddToCart
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
                <div className="soldout-icon" />
                <div className="soldout-message">
                    <h2>
                        {checkBookedPassengers
                            ? labels.alreadyBookedLabel
                            : labels.allSeatsSoldOutTitleLabel}
                    </h2>
                </div>
                <div className="soldout-content">
                    <span
                        dangerouslySetInnerHTML={{
                            __html: checkBookedPassengers
                                ? labels.alreadyBookedDescriptionLabel
                                : labels.allSeatsSoldOutDescriptionLabel
                        }}
                    />
                </div>

                <div className="category-book">
                    <Link
                        ariaLabel={labels.viewOtherEventsLabel}
                        url={url}
                        title={labels.viewOtherEventsLabel}
                        linkClassName={`cta-button-outline`}
                        onClick={() => window.history.back()}
                    >
                        {labels.viewOtherEventsLabel}
                    </Link>
                </div>
            </div>
        );
    }
}

export default entertainmentConfigLabels;
