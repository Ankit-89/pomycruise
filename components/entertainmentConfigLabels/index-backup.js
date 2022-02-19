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
import SpaFormSummary from './spaFormSummary';
import EntertainmentAddToCart from './entertainmentAddToCart';
import FetchData from '../commons/CUK/fetch-data';
import Loader from '../commons/CUK/loader';
import analytics from '../commons/CUK/analytics';
import Modal from '../commons/CUK/modal';
import Link from '../commons/CUK/link';
import PubSub from '../commons/CUK/pubsub';
import topics from '../../library/js/config/topics';
import {
    VIEWPORT_TYPE,
    watchForBreakpoint
} from '../../library/js/config/breakpoints';

class entertainmentConfigLabels extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            showlodaer: false,
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
            checkTimeSlotClick: false
        };
    }

    componentWillMount() {
        const spaConfigPageData = SessionStorage.getItem('spaConfigPageData');
        const header = SessionStorage.getItem('header');
        const { passengers } = header;
        const { eventsDetailsData } = this.props;
        const eventConfigPageData = SessionStorage.getItem(
            'eventConfigPageData'
        );
        console.log('event config page data', eventConfigPageData);
        const {
            instances,
            productId,
            venueCode,
            inventory,
            categories
        } = eventConfigPageData;
        const maxSelectable = passengers.length;
        const checkInventory =
            eventsDetailsData.inventory.length > 0 ? true : false;
        let durationType = 'SINGLE_SLOT';

        this.setState({
            maxSelectable: maxSelectable,
            durationType: durationType,
            showError: false,
            checkSoldOut: checkInventory,
            eventCatoryies: eventsDetailsData.categories
        });
        this.buildDateRangeForTheCalender();
    }

    componentDidMount() {
        const { selectedDay, maxSelectable } = this.state;
        const { eventsDetailsData } = this.props;
        const eventConfigPageData = SessionStorage.getItem(
            'eventConfigPageData'
        );
        const {
            instances,
            productId,
            name,
            baseProduct,
            inventory
        } = eventConfigPageData;
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
        instances !== void 0 &&
            instances.length &&
            instances.forEach((value) => {
                skusList.push({
                    skusID: value.externalCode,
                    skusName: name,
                    unitPrice_GBP: '',
                    unitPrice_local: '',
                    spaTreatmentType: baseProduct,
                    spaDuration: value.duration
                });
            });
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
                spaTreatmentType: name,
                productType: 'spa',
                productId: baseProduct,
                skus: skusList
            }
        };
        analytics.setAdditionalPageTrackAttributes(analyticsObject);
    }

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
                    maxSelected: newSelectedPassenger.length >= maxSelectable,
                    proceedForDurationSection:
                        newSelectedPassenger.length >= maxSelectable
                };
            },
            () => {
                const { openTimeSlotData, selectedWheelchair } = this.state;
                if (true) {
                    this.sortCalendarDateRange();
                }
                this.checkOrderCanProceed();
            }
        );
        analytics.clickTracking(this);
        analytics.setAdditionalPageTrackAttributes({
            event: 'event323'
        });
    };

    handleDurationSelect = (duration, type) => {
        const newSelectedDuration = [duration];
        this.setState(
            {
                selectedDuration: newSelectedDuration,
                proceedForDateSection: true,
                durationType: type
            },
            () => {
                //this.createInstanceForBooking();
            }
        );
        analytics.clickTracking(this);
        analytics.setAdditionalPageTrackAttributes({
            event: 'event324'
        });
    };

    handleWheelchairSelect = (wheelchair, checked) => {
        const newSelectedWheelchair = [wheelchair];
        this.setState({
            selectedWheelchair: newSelectedWheelchair,
            proceedForAddtoCart: true
        });
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
                modified: !this.state.modified
            },
            () => {
                // this.sortInstancesForTheSelectedDay(!this.state.modified);
                // this.checkOrderCanProceed();
            }
        );
        analytics.clickTracking(this);
        analytics.setAdditionalPageTrackAttributes({
            event: 'event325'
        });
    };

    handleWheelChair = (value) => {
        const wheelChairYes = value == 'Yes' ? true : false;
        const wheelChairNo = value == 0 ? true : false;
        this.setState({
            checkWheelChair: wheelChairYes,
            checkWheelChairNo: wheelChairNo,
            selectedWheelchair: value == 0 ? value : [],
            proceedForAddtoCart: true
        });
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
        //debugger;
        const { openTimeSlotData, durationType } = this.state;
        const eventConfigPageData = SessionStorage.getItem(
            'eventConfigPageData'
        );
        const inventory = eventConfigPageData.inventory;
        console.log('eventConfigPageData--->', eventConfigPageData.inventory);
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
        const data = this.calculateModeValue(numOfDaysForApi, diffDays + 1);
        const dateTimeSlot = {};
        inventory.map((d, i) => {
            let cdate = d.availability.replace(
                /^(\d{4})(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)$/,
                '$1-$2-$3'
            );
            let ctime = d.availability.replace(
                /^(\d{4})(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)$/,
                '$4:$5'
            );
            if (!dateTimeSlot[cdate]) {
                dateTimeSlot[cdate] = [];
            }
            dateTimeSlot[cdate].push({
                time: this.convertToAMPM(ctime),
                status: d.status,
                capacity: d.capacity
            });
        });
        for (let i = 0; i <= diffDays; i++) {
            const date = moment(embarkationDate, 'YYYY-MM-DD')
                .add(i, 'days')
                .format('YYYY-MM-DD');
            dateArray.push({
                date: date,
                timeSlot: dateTimeSlot[date] ? dateTimeSlot[date] : []
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
                    openTimeSlotData.length &&
                        openTimeSlotData.forEach((singleTimeSlot) => {
                            const dateIsSame = moment(date).isSame(
                                singleTimeSlot.startDate
                            );
                            if (dateIsSame) {
                                inRangeValue = true;
                            }
                        });

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
                calendarDates: calenderDateRange,
                proceedForDateSection: true
            },
            () => {
                this.sortCalendarDateRange();
            }
        );
    };

    sortCalendarDateRange = (key) => {
        let sliderRange = 7;
        const mqlMVP = watchForBreakpoint(VIEWPORT_TYPE.TABLET, true);
        if (mqlMVP.matches) {
            sliderRange = 3;
        }
        const minAdultAge = getConfig('minAdultAge') || 18;
        const header = SessionStorage.getItem('header');
        const { passengers } = header;
        const {
            calendarDates,
            openTimeSlotData,
            selectedPassenger,
            maxSelectable
        } = this.state;
        const newalendarDateRange = calendarDates.reduce(
            (calendarObj, calendarDate) => {
                let inRangeValue = false;
                openTimeSlotData.length &&
                    openTimeSlotData.forEach((singleTimeSlot) => {
                        const dateIsSame = moment(calendarDate.date).isSame(
                            singleTimeSlot.startDate
                        );
                        if (dateIsSame) {
                            inRangeValue = true;
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

                // if (calendarDate.timeSlot.length) {
                //     inRangeValue = true;
                //     // if (key !== '' && key !== void 0) {
                //     calendarDate.timeSlot.map((singleSlot) => {
                //         if (
                //             singleSlot.capacity.length &&
                //             singleSlot.capacity.includes(
                //                 `${selectedPassenger.length}`
                //             )
                //         ) {
                //             inRangeValue = true;
                //         } else {
                //             inRangeValue = false;
                //         }
                //     });
                //     // }
                // } else {
                //     inRangeValue = false;
                // }

                calendarDate['inRange'] =
                    calendarDate['dayType'] !== 'EMB' &&
                    calendarDate['dayType'] !== 'DEB'
                        ? inRangeValue
                        : false;

                // if (!calendarObj.hasOwnProperty(month_year)) {
                //     calendarObj[month_year] = [];
                // }
                calendarObj.push(calendarDate);
                return calendarObj;
            },
            []
        );

        this.setState(
            {
                calenderDateRange: newalendarDateRange
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
                    // let inRangeValue = calenderDateRange[clickIndex].inRange;
                    // if (!inRangeValue) {
                    //     for (let i = 0; i < sliderRange; i++) {
                    //         if (
                    //             calenderDateRange[clickIndex + i].inRange &&
                    //             !inRangeValue
                    //         ) {
                    //             clickIndex = clickIndex + i;
                    //         }
                    //     }
                    // }
                    const ele = document.getElementsByClassName(
                        'calendar__day'
                    )[clickIndex];
                    ele && ele.click();
                }
            }
        );
    };

    sortInstancesForTheSelectedDay = (key) => {
        const { selectedDay, openTimeSlotData } = this.state;
        const newTreatmentObj = {};
        openTimeSlotData.map((singleTreatment) => {
            const treatmentDate = moment(singleTreatment.startDate).format(
                'YYYY-MM-DD'
            );
            if (treatmentDate) {
                if (!newTreatmentObj.hasOwnProperty(treatmentDate)) {
                    newTreatmentObj[treatmentDate] = [];
                    newTreatmentObj[treatmentDate].push(singleTreatment);
                } else {
                    newTreatmentObj[treatmentDate].push(singleTreatment);
                }
            }
        });

        let mimimumPrize = '';

        if (
            Object.keys(selectedDay).length &&
            newTreatmentObj[selectedDay.date] &&
            newTreatmentObj[selectedDay.date].length
        ) {
            for (var i = 0; i < newTreatmentObj[selectedDay.date].length; i++) {
                const promotionalPrice =
                    newTreatmentObj[selectedDay.date][i].promotionalPrice;
                const standardPrice =
                    newTreatmentObj[selectedDay.date][i].standardPrice;
                if (
                    (promotionalPrice < mimimumPrize || mimimumPrize == '') &&
                    promotionalPrice !== 0
                ) {
                    mimimumPrize = promotionalPrice;
                }
                if (standardPrice < mimimumPrize || mimimumPrize == '') {
                    mimimumPrize = standardPrice;
                }
            }

            for (var i = 0; i < newTreatmentObj[selectedDay.date].length; i++) {
                if (
                    newTreatmentObj[selectedDay.date][i].promotionalPrice ==
                        mimimumPrize ||
                    newTreatmentObj[selectedDay.date][i].standardPrice ==
                        mimimumPrize
                ) {
                    newTreatmentObj[selectedDay.date][i][`bestPrice`] = true;
                } else {
                    newTreatmentObj[selectedDay.date][i][`bestPrice`] = false;
                }
            }

            const isBestPrice =
                newTreatmentObj[selectedDay.date] !== void 0 &&
                newTreatmentObj[selectedDay.date].length &&
                newTreatmentObj[selectedDay.date].every(
                    (val) =>
                        val.promotionalPrice === mimimumPrize ||
                        val.standardPrice === mimimumPrize
                );

            if (isBestPrice) {
                newTreatmentObj[selectedDay.date].map((item) => {
                    item['bestPrice'] = false;
                });
            }
        }

        const selectedDayTreatmentList =
            newTreatmentObj[`${selectedDay.date}`] || [];

        this.setState(
            {
                treatment: newTreatmentObj,
                selectedDayTreatmentList: selectedDayTreatmentList,
                modified: key !== void 0 ? key : this.state.modified
            },
            () => {
                const { durationType, selectedDay } = this.state;
                if (
                    durationType == 'ONE_DAY_PASS' &&
                    Object.keys(selectedDay).length
                ) {
                    this.handleTreatmentSlotForOneDayPass();
                }
                this.checkOrderCanProceed();
            }
        );
    };

    handleTreatmentSlotForOneDayPass = () => {
        const { selectedDayTreatmentList } = this.state;
        selectedDayTreatmentList.sort((a, b) => {
            return moment(a.startDatetime) - moment(b.startDatetime);
        });
        selectedDayTreatmentList.sort((a, b) => {
            return a.promotionalPrice - b.promotionalPrice;
        });
        this.setState(
            {
                selectedSlotForOneDayPass: selectedDayTreatmentList[0]
            },
            () => {
                this.checkOrderCanProceed();
            }
        );
    };

    handleTimeSlotChange = (selectedTimeSlot) => {
        //debugger;
        this.setState(
            {
                seletedTimeSlot: selectedTimeSlot,
                checkTimeSlotClick: true
            },
            () => {
                this.checkOrderCanProceed();
            }
        );
        analytics.setAdditionalPageTrackAttributes({
            event: `event326 ${selectedTimeSlot.bestPrice ? `event327` : ''}`
        });
    };

    calculateDateDiff(a, b) {
        const date1 = moment(a); //first date
        const date2 = moment(b); // second date
        const duration = moment.duration(date1.diff(date2));
        const days = duration.asDays();
        return days;
    }

    handleSliderChange = (
        date,
        nextBtnClick,
        prevBtnClick,
        sliderToScrollDays,
        value
    ) => {
        this.setState({ isMonthTabClicked: false }, () => {
            const header = SessionStorage.getItem('header');
            const { embarkationDate, disembarkationDate } = header;
            let startDate, endDate;
            if (nextBtnClick) {
                startDate = date.date;
                endDate = moment(date.date).add(sliderToScrollDays - 1, 'days');
                const diffDays = this.calculateDateDiff(
                    disembarkationDate,
                    endDate
                );
                if (diffDays < 0) {
                    endDate = moment(endDate)
                        .subtract(Math.abs(diffDays) + 1, 'days')
                        .format('YYYY-MM-DD');

                    startDate = moment(endDate)
                        .subtract(sliderToScrollDays - 1, 'days')
                        .format('YYYY-MM-DD');
                }
            }
            if (prevBtnClick) {
                startDate = date.date;
                endDate = moment(date.date).add(sliderToScrollDays - 1, 'days');
                const diffDays = this.calculateDateDiff(
                    embarkationDate,
                    startDate
                );
                if (diffDays > 0) {
                    startDate = moment(embarkationDate).add(1, 'days');
                }
            }
            if (!nextBtnClick && !prevBtnClick) {
                startDate = date.date;
                endDate = moment(date.date).add(sliderToScrollDays - 1, 'days');
                const diffDays = this.calculateDateDiff(
                    disembarkationDate,
                    endDate
                );
                if (diffDays < 0) {
                    endDate = moment(endDate)
                        .subtract(Math.abs(diffDays) + 1, 'days')
                        .format('YYYY-MM-DD');
                }
            }
            if (value) {
                analytics.clickTracking(this);
                //this.createInstanceForBooking(startDate, endDate);
            }
        });
    };

    handleTreatmentSlotForMultiDayPass = () => {
        const { openTimeSlotData } = this.state;
        openTimeSlotData.sort((a, b) => {
            return moment(a.startDatetime) - moment(b.startDatetime);
        });
        openTimeSlotData.sort((a, b) => {
            return a.promotionalPrice - b.promotionalPrice;
        });
        this.setState(
            {
                selectedSlotForMultiDayPass: openTimeSlotData[0]
            },
            () => {
                this.checkOrderCanProceed();
            }
        );
    };

    handleSubmit = () => {
        //debugger;
        //analytics.clickTracking(this);
        const {
            labels
            // services: {
            //     urls: { updateCartApi }
            // }
        } = this.props;
        const {
            selectedPassenger,
            durationType,
            selectedWheelchair,
            selectedDay,
            openTimeSlotData,
            selectedDuration,
            seletedTimeSlot,
            selectedSlotForMultiDayPass,
            selectedSlotForOneDayPass
        } = this.state;
        const header = SessionStorage.getItem('header');
        const cruiseData = SessionStorage.getItem('cruiseData');
        const apikeyMycruise = getConfig(
            'apikeyMycruise',
            'OqEqLqWO6wpQfNtVyPVA291m2SssinP1'
        );
        const config = typeof window !== 'undefined' ? window.configs : '';
        const customCurrencyCode =
            config.brand.toLowerCase() === 'po' ? 'gbp' : 'usd';

        let dobArray = [];
        header.passengers.forEach((passenger) => {
            dobArray.push(passenger.birthDate);
        });
        const eventConfigPageData = SessionStorage.getItem(
            'eventConfigPageData'
        );
        const {
            venueCode,
            venueName,
            eventId,
            eventCode,
            location,
            startDateTime,
            endDateTime,
            thumbnailImage,
            title,
            categories,
            eventDuration,
            inventory
        } = eventConfigPageData;

        const requestData = { recipients: [] };
        selectedPassenger.forEach((value, index) => {
            requestData['recipients'].push({
                paxNo: value,
                bookingRef: header.bookingRef
            });
        });
        console.log(selectedDay, seletedTimeSlot);
        const serviceStartDate = moment(
            selectedDay.date + seletedTimeSlot
        ).format('YYYYMMDDHHMM');
        const serviceStartTime = moment(seletedTimeSlot).format('HHMM');
        // const startDateT = moment('20210617200000').format(
        //     'YYYY-MM-DD-HH:MM:SS'
        // );
        // const startTime = moment(seletedTimeSlot).format('HHMM');
        // console.log(startDateT, startTime);
        requestData['productCode'] = 'PO_HEADLINERS_00001';
        requestData['resHoldId'] = eventId;
        requestData['category'] = categories[0];
        requestData['productType'] = 'ENTERTAINMENT';
        requestData['productTitle'] = title;
        requestData['noOfWheelchairSpace'] = Number(selectedWheelchair[0]);
        requestData['venueCode'] = venueCode;
        requestData['venueTitle'] = venueName;
        requestData['thumbnailImageUrl'] = thumbnailImage;
        requestData['serviceStartTime'] = startDateTime;
        requestData['serviceEndTime'] = endDateTime;
        requestData['noOfGuests'] = selectedPassenger.length;
        requestData['qty'] = 1;
        requestData['price'] = 0.0;
        requestData['eventPdpUrl'] = '';
        requestData['guestIdOfBooker'] = '';
        // requestData['serviceDate'] = moment(seletedTimeSlot.startDate).format(
        //     'YYYYMMDD'
        // );
        // requestData['serviceTime'] = seletedTimeSlot.startTime;
        // requestData['qty'] = 1;
        // // if (durationType == 'SINGLE_SLOT') {
        // requestData['productCode'] = '';
        // requestData['productType'] = 'ENTERTAINMENT';
        // requestData['productPrice'] =
        //     seletedTimeSlot.promotionalPrice < seletedTimeSlot.standardPrice
        //         ? seletedTimeSlot.promotionalPrice
        //         : seletedTimeSlot.standardPrice;
        // requestData['resHoldId'] = seletedTimeSlot.priceId;
        // requestData['serviceDate'] = moment(seletedTimeSlot.startDate).format(
        //     'YYYYMMDD'
        // );
        // requestData['serviceTime'] = seletedTimeSlot.startTime;
        // requestData['qty'] = 1;
        // } else if (durationType == 'ONE_DAY_PASS') {
        //     requestData['productCode'] = selectedDuration[0].externalCode;
        //     requestData['productType'] = 'SPA';
        //     requestData['qty'] = 1;
        //     requestData['productPrice'] =
        //         selectedSlotForOneDayPass.promotionalPrice <
        //         selectedSlotForOneDayPass.standardPrice
        //             ? selectedSlotForOneDayPass.promotionalPrice
        //             : selectedSlotForOneDayPass.standardPrice;
        //     requestData['resHoldId'] = selectedSlotForOneDayPass.priceId;
        //     requestData['serviceDate'] = moment(
        //         selectedSlotForOneDayPass.startDate
        //     ).format('YYYYMMDD');
        //     requestData['serviceTime'] = selectedSlotForOneDayPass.startTime;
        // } else if (durationType == 'MULTI_DAY_PASS') {
        //     requestData['productCode'] = selectedDuration[0].externalCode;
        //     requestData['productType'] = 'SPA';
        //     requestData['qty'] = 1;
        //     requestData['productPrice'] =
        //         selectedSlotForMultiDayPass.promotionalPrice <
        //         selectedSlotForMultiDayPass.standardPrice
        //             ? selectedSlotForMultiDayPass.promotionalPrice
        //             : selectedSlotForMultiDayPass.standardPrice;
        //     requestData['resHoldId'] = selectedSlotForMultiDayPass.priceId;
        //     requestData['serviceDate'] = moment(
        //         selectedSlotForMultiDayPass.startDate
        //     ).format('YYYYMMDD');
        //     requestData['serviceTime'] = selectedSlotForMultiDayPass.startTime;
        // }
        // const updateCartApiUrl =
        //     updateCartApi ||
        //     '/api-mc/v1/mc-shopping-basket/PO-Site/users/current/carts/current/entries';
        const updateCartApiUrl =
            'https://sit.my-np.pocruises.com/api-mc/v2/mc-cart/PO-Site/users/current/carts/current/v2/entries';
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
                //debugger;
                if (res.error || (res.errors && res.errors.length)) {
                    this.setState({
                        showModal: true
                    });
                } else {
                    const ProductId = requestData.productCode;
                    let selectedProductId = ''; //  "Massage_Therapies_Oasis"
                    let selectedProductName = ''; //  "Massage"
                    let selectedSkuName = ''; //  "Bamboo Massage"
                    let startDateTime = '';
                    if (durationType == 'MULTI_DAY_PASS') {
                        startDateTime =
                            selectedSlotForMultiDayPass.startDatetime; // "2021-03-02T19:00:00"
                    } else if (durationType == 'ONE_DAY_PASS') {
                        startDateTime = selectedSlotForOneDayPass.startDatetime; // "2021-03-02T19:00:00"
                    } else {
                        startDateTime = seletedTimeSlot.startDatetime; // "2021-03-02T19:00:00"
                    }
                    const duration = selectedDuration[0].duration; // 60
                    res.entries.length &&
                        res.entries.forEach((value) => {
                            if (
                                value.product &&
                                value.product.code &&
                                value.product.code == ProductId
                            ) {
                                selectedProductId =
                                    value.product && value.product.baseProduct;
                                selectedProductName =
                                    value.product.attributes.name;
                                selectedSkuName =
                                    value.product && value.product.name;
                            }
                        });

                    let eventDescriptionValue = '';
                    // if (durationType == 'SINGLE_SLOT') {
                    eventDescriptionValue = `${eventDuration} | ${moment(
                        selectedDay.date
                    ).format('DD MMM YY')} | ${seletedTimeSlot}`;
                    // } else if (durationType == 'ONE_DAY_PASS') {
                    //     spaDescriptionValue = `${
                    //         selectedDuration[0].duration
                    //     } ${labels.minutesLabel} | ${moment(
                    //         startDateTime
                    //     ).format('DD MMM YY')}`;
                    // } else if (durationType == 'MULTI_DAY_PASS') {
                    //     spaDescriptionValue = `${
                    //         selectedDuration[0].duration
                    //     } ${labels.minutesLabel}`;
                    // }

                    // const popUpObj = {
                    //     rebookRedirectUrl: window.location.href,
                    //     currency: labels.currencyLabel,
                    //     totalPrice: res.totalPrice.value,
                    //     totalItemCount: res.totalItemsCount,
                    //     spaDescription: spaDescriptionValue,
                    //     show_spa_description: true,
                    //     isPopUpShow: true
                    // };
                    // const popUpObj = {
                    //     //rebookRedirectUrl: window.location.href,
                    //     currency: '$',
                    //     totalPrice: '0.00',
                    //     totalItemCount: '1',
                    //     spaDescription: 'Team Text',
                    //     show_spa_description: true,
                    //     isPopUpShow: true
                    // };
                    //SessionStorage.setItem('addToCartPopUp', popUpObj);
                    PubSub.publish(topics.ADD_TO_CART, {
                        name: title,
                        total: `Included with your holiday`,
                        currency: '',
                        numberOfItems: '1',
                        eventDescription: eventDescriptionValue,
                        eventLowerDescription: `Your seat numbers will be allocated automatically. Please checkout basket in 1 hr 30 mins to avoid disappointments.`,
                        show_event_Description: true
                    });
                    window.history.back(-1);
                }
            })
            .catch((error) => {
                // TODO: error menagement
            });
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
                const clickIndex = index > -1 ? index : 1;
                // let inRangeValue = calenderDateRange[clickIndex].inRange;
                // if (!inRangeValue) {
                //     for (let i = 0; i < sliderRange; i++) {
                //         if (
                //             calenderDateRange[clickIndex + i].inRange &&
                //             !inRangeValue
                //         ) {
                //             clickIndex = clickIndex + i;
                //         }
                //     }
                // }
                const ele = document.getElementsByClassName('calendar__day')[
                    clickIndex
                ];
                ele && ele.click();
            }
        );
    };

    handleClick = () => {
        //SessionStorage.removeItem('eventConfigPageData');
    };
    handleModalClose = () => {
        this.setState(() => ({ showModal: false }));
    };

    render() {
        const { labels, bestPriceImageUrl, eventsDetailsData } = this.props;
        const { reserveSeatsLabel, locationLabel } = labels;
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
            selectedSlotForMultiDayPass,
            selectedSlotForOneDayPass,
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
            checkTimeSlotClick
        } = this.state;
        const header = SessionStorage.getItem('header');
        const eventConfigPageData = SessionStorage.getItem(
            'eventConfigPageData'
        );
        const { location, inventory } = eventConfigPageData;
        let url = `/events`;

        return checkSoldOut ? (
            <div className="entertainmentConfigPage-tile-container">
                <div className="eventLocation">
                    <h3>{labels.reserveSeatsLabel}</h3>
                    <span>
                        {labels.locationLabel}: {eventsDetailsData.location}
                    </span>
                </div>
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
                            <h2>{labels.notAvailableLabel}</h2>
                            <p>{labels.noAvailabilityMessageLabel}</p>
                        </div>

                        <div className="modal-btns">
                            <Link
                                ariaLabel={labels.goBackLabel}
                                url={url}
                                title={labels.goBackLabel}
                                linkClassName={`cta-button-outline`}
                                onClick={false}
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
                    eventCatoryies={eventCatoryies}
                />
                {showError && (
                    <div className="error_msg_container">
                        {labels.addToCartErrorLabel}
                    </div>
                )}
                {orderCanProceed && (
                    <div className="botton-container">
                        <EntertainmentAddToCart
                            labels={labels.addtoBasketLabel}
                            maxSelected={maxSelected}
                            maxSelectable={maxSelectable}
                            orderCanProceed={orderCanProceed}
                            submitButtonHandler={this.handleSubmit}
                        />
                    </div>
                )}
            </div>
        ) : (
            <div className="soldout-container">
                <div className="soldout-message">
                    <h2>{labels.allSeatsSoldOutTitleLabel}</h2>
                </div>
                <div className="soldout-content">
                    <span>{labels.allSeatsSoldOutDescriptionLabel}</span>
                </div>

                <div className="category-book">
                    <a href={url} onClick={this.handleClick()}>
                        <span>{labels.viewOtherEventsLabel}</span>
                    </a>
                </div>
            </div>
        );
    }
}

export default entertainmentConfigLabels;
