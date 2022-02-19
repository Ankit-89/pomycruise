/*
 * React Modal
 *
 * For examples and features: https://github.com/davidtheclark/react-aria-modal
 */
'use strict';

import React from 'react';
import moment from 'moment';
import SpaForm from './spaForm';
import { getConfig } from '../commons/CUK/utilities';
import { calculateAge, calculateDiffDays } from '../commons/CUK/dateFormat';
import SessionStorage from '../commons/CUK/session-storage';
import SpaFormSummary from './spaFormSummary';
import SpaAddToCart from './spaAddToCart';
import FetchData from '../commons/CUK/fetch-data';
import Loader from '../commons/CUK/loader';
import analytics from '../commons/CUK/analytics';
import {
    VIEWPORT_TYPE,
    watchForBreakpoint
} from '../../library/js/config/breakpoints';

class spaConfigLabels extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isTooEarly: false,
            isAvailableForBooking: false,
            showlodaer: false,
            showError: false,
            isTabClicked: true,
            errorMsg: '',
            selectedPassenger: [],
            maxSelectable: 1,
            selectedDuration: [],
            selectedDay: {},
            seletedTimeSlot: {},
            treatment: [],
            calendarDates: [],
            calenderDateRange: [],
            orderCanProceed: false,
            showDuration: true,
            showDate: true,
            showTimeSlot: true,
            modified: false,
            proceedForDurationSection: false,
            proceedForDateSection: false,
            proceedForTimeSection: false,
            openTimeSlotData: [],
            selectedSlotForMultiDayPass: [],
            tabIndex: 0,
            monthTabs: [],
            isMonthTabClicked: false,
            monthTabValue: {}
        };
    }

    componentWillMount() {
        this.checkInstanceIsAvailableForBooking();
        this.sendDataToAnalytics();
    }

    sendDataToAnalytics() {
        const spaConfigPageData = SessionStorage.getItem('spaConfigPageData');
        const { instances, productId, name, baseProduct } = spaConfigPageData;
        const header = SessionStorage.getItem('header');
        const cruiseData = SessionStorage.getItem('cruiseData');
        const config = typeof window !== 'undefined' ? window.configs : '';
        const customCurrencyCode =
            config.brand.toLowerCase() === 'po' ? 'gbp' : 'usd';

        let dobArray = [];
        header.passengers.forEach((passenger) => {
            dobArray.push(passenger.birthDate);
        });
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

    componentDidMount() {
        const { isAvailableForBooking } = this.state;
        isAvailableForBooking && this.loadInitialDataAfterRenderComponent();
    }

    checkInstanceIsAvailableForBooking = () => {
        const header = SessionStorage.getItem('header');
        const { embarkationDate } = header;
        const spaDayX = getConfig('spaDayX', 10) || 100;
        const isTooEarly =
            calculateDiffDays(Date.now(), new Date(embarkationDate)) > spaDayX;

        this.setState(
            {
                isTooEarly: isTooEarly,
                isAvailableForBooking: false
            },
            () => {
                const { isTooEarly } = this.state;
                if (!isTooEarly) {
                    this.loadInitialDataBeforeRenderComponent();
                }
            }
        );
    };

    loadInitialDataBeforeRenderComponent = () => {
        // const { isTooEarly, isAvailableForBooking } = this.state;
        const spaConfigPageData = SessionStorage.getItem('spaConfigPageData');
        const { instances, productId, purchasable } = spaConfigPageData;
        const maxSelectable = productId.includes('Couples_Treatments') ? 2 : 1;
        let durationType = '';
        let available = false;
        if (purchasable) {
            this.getAvailablilty()
                .then((res) => {
                    if (res.data && res.data.length) {
                        instances.map((singleInstance) => {
                            durationType = singleInstance.productOffering;
                            available = !available
                                ? res.data.some(
                                      (singleService) =>
                                          singleService.serviceId ==
                                          singleInstance.externalCode
                                  )
                                : available;
                        });
                        this.setState({
                            maxSelectable: maxSelectable,
                            durationType: durationType,
                            showError: false,
                            isAvailableForBooking: available
                        });
                        if (durationType !== 'MULTI_DAY_PASS') {
                            available && this.buildDateRangeForTheCalender();
                        }
                    } else {
                        this.setState({
                            isAvailableForBooking: available
                        });
                    }
                })
                .catch(() => {
                    this.setState({
                        isAvailableForBooking: available
                    });
                });
        } else {
            this.setState({
                isAvailableForBooking: available
            });
        }
    };

    getAvailablilty = () => {
        const { categoryId } = this.props;
        const apikeyMycruise = getConfig('apikeyMycruise', '');
        const brand = getConfig('brand', '');
        const shipCode = getConfig('shipCode', '');
        const header = SessionStorage.getItem('header');
        const { embarkationDate, disembarkationDate } = header;
        const embarkDate = moment(embarkationDate, 'YYYY-MM-DD').format(
            'YYYYMMDD'
        );
        const disEmbarkDate = moment(disembarkationDate, 'YYYY-MM-DD')
            .subtract(1, 'days')
            .format('YYYYMMDD');
        const url = getConfig('spaServiceAvailabilityAPIURL')
            .replace('{brand}', brand)
            .replace('{vesselCode}', shipCode)
            .replace('{categoryId}', categoryId)
            .replace('{embarkationDay}', embarkDate)
            .replace('{disembarkationDay}', disEmbarkDate);
        return FetchData(url, {
            method: 'GET',
            headers: {
                'X-Source-Identity-Token-0': apikeyMycruise,
                'cache-control': 'no-cache'
            }
        });
    };

    loadInitialDataAfterRenderComponent() {
        const { selectedDay, maxSelectable } = this.state;
        const header = SessionStorage.getItem('header');
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
            selectedDay,
            seletedTimeSlot,
            durationType
        } = this.state;
        if (durationType == 'SINGLE_SLOT') {
            if (
                Object.keys(selectedDay).length !== 0 &&
                Object.keys(seletedTimeSlot).length !== 0 &&
                selectedPassenger !== void 0 &&
                selectedPassenger.length !== 0 &&
                selectedDuration !== void 0 &&
                selectedDuration.length !== 0
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
        } else if (durationType == 'MULTI_DAY_PASS') {
            if (
                selectedPassenger !== void 0 &&
                selectedPassenger.length !== 0
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
        } else if (durationType == 'ONE_DAY_PASS') {
            if (
                Object.keys(selectedDay).length !== 0 &&
                selectedPassenger !== void 0 &&
                selectedPassenger.length !== 0
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
                const { openTimeSlotData } = this.state;
                if (openTimeSlotData.length) {
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
        const { selectedDuration } = this.state;
        const functionTobeCalled = selectedDuration.length ? true : false;
        this.setState(
            {
                selectedDuration: newSelectedDuration,
                proceedForDateSection: true,
                durationType: type,
                selectedDay: {}
            },
            () => {
                this.createInstanceForBooking();
                functionTobeCalled && this.handleActiveCalenderDate(false);
            }
        );
        analytics.clickTracking(this);
        analytics.setAdditionalPageTrackAttributes({
            event: 'event324'
        });
    };

    handleActiveCalenderDate = (elsePart) => {
        if (!elsePart) {
            const eleList = document.getElementsByClassName('active');
            if (eleList.length) {
                for (let i = 0; i < eleList.length; i++) {
                    if (eleList[i].classList.contains('calendar__day')) {
                        eleList[i].classList.add('inactive');
                        eleList[i].classList.remove('active');
                    }
                }
            }
        } else {
            const eleList = document.getElementsByClassName('active');
            if (eleList.length) {
                let flag = false;
                for (let i = 0; i < eleList.length; i++) {
                    if (eleList[i].classList.contains('calendar__day')) {
                        flag = true;
                    }
                }
                if (!flag) {
                    const element = document.getElementsByClassName(
                        'inactive'
                    )[0];
                    element.classList.remove('inactive');
                    element.classList.add('active');
                }
            }
        }
    };

    handleDateChange = (day, index, value) => {
        this.setState(
            {
                selectedDay: day,
                monthTabValue: {
                    month_date: moment(day.date).format('MMM YY')
                },
                proceedForTimeSection: true,
                seletedTimeSlot: {}
            },
            () => {
                this.handleActiveCalenderDate(true);
                this.sortInstancesForTheSelectedDay(!this.state.modified);
                this.checkOrderCanProceed();
            }
        );
        analytics.clickTracking(this);
        analytics.setAdditionalPageTrackAttributes({
            event: 'event325'
        });
    };

    calculateModeValue(x, y) {
        const a = Math.floor(y / x);
        const b = y - x * a;
        return x - b;
    }

    buildDateRangeForTheCalender = () => {
        const { openTimeSlotData, durationType } = this.state;

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

        for (let i = 0; i <= diffDays + data; i++) {
            const date = moment(embarkationDate, 'YYYY-MM-DD')
                .add(i, 'days')
                .format('YYYY-MM-DD');
            dateArray.push({ date: date });
            monthTabs.push({
                // date: date,
                month_date: moment(date).format('MMM YY')
            });
        }

        const portCalls = SessionStorage.getItem('portCalls');
        const port = portCalls['portCalls'].filter((singlePort) => {
            return singlePort.typeCode.$ !== 'PKG';
        });

        dateArray.map((singleDate, index) => {
            const date = singleDate.date;
            let inRangeValue = false;
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
                calendarDates: calenderDateRange
            },
            () => {
                this.sortCalendarDateRange();
            }
        );
    };

    sortCalendarDateRange = () => {
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

    createInstanceForBooking = (date1, date2) => {
        const { durationType } = this.state;
        let numOfDaysForApi = 6;
        const mqlMVP = watchForBreakpoint(VIEWPORT_TYPE.TABLET, true);
        if (mqlMVP.matches) {
            numOfDaysForApi = 2;
        }
        this.setState({ showlodaer: true }, () => {
            const { selectedDuration } = this.state;
            const apikeyMycruise = getConfig('apikeyMycruise', '');
            const brand = getConfig('brand', '');
            const shipCode = getConfig('shipCode', '');
            const header = SessionStorage.getItem('header');
            const { embarkationDate, disembarkationDate } = header;
            const embarkDate = moment(embarkationDate, 'YYYY-MM-DD').format(
                'YYYYMMDD'
            );
            const startDate = date1
                ? moment(date1, 'YYYY-MM-DD').format('YYYYMMDD')
                : moment(embarkDate)
                      .add(
                          `${durationType !== 'MULTI_DAY_PASS' ? 1 : 0}`,
                          'days'
                      )
                      .format('YYYYMMDD');
            let endDate = date2
                ? moment(date2, 'YYYY-MM-DD').format('YYYY-MM-DD')
                : moment(embarkDate)
                      .add(numOfDaysForApi, 'days')
                      .format('YYYY-MM-DD');

            const diffDays = this.calculateDateDiff(
                disembarkationDate,
                endDate
            );
            if (diffDays < 0) {
                endDate = moment(endDate)
                    .subtract(Math.abs(diffDays) + 1, 'days')
                    .format('YYYYMMDD');
            } else {
                endDate = moment(endDate).format('YYYYMMDD');
            }

            let url = getConfig('spaAppointmentsAvailableTimeSlotAPIURL');
            url = url
                .replace('{brand}', brand)
                .replace('{vesselCode}', shipCode)
                .replace('{serviceId}', selectedDuration[0].externalCode)
                .replace('{startDate}', startDate)
                .replace('{endDate}', endDate);
            FetchData(url, {
                method: 'GET',
                headers: {
                    'X-Source-Identity-Token-0': apikeyMycruise,
                    'cache-control': 'no-cache'
                }
            }).then((response) => {
                const availableOpenTimeSlot = [];
                if (response.data && response.data.length) {
                    response.data.map((singleAvailableSlot) => {
                        const time = singleAvailableSlot.startDatetime;
                        let flag = true;
                        availableOpenTimeSlot.length &&
                            availableOpenTimeSlot.forEach((value) => {
                                if (value.startDatetime == time && flag) {
                                    flag = false;
                                }
                            });
                        if (flag) {
                            availableOpenTimeSlot.push(singleAvailableSlot);
                        }
                    });
                }
                this.setState(
                    {
                        openTimeSlotData: availableOpenTimeSlot,
                        showlodaer: false
                    },
                    () => {
                        const { durationType } = this.state;
                        if (durationType !== 'MULTI_DAY_PASS') {
                            this.sortCalendarDateRange();
                            this.sortInstancesForTheSelectedDay();
                        }
                        if (durationType == 'MULTI_DAY_PASS') {
                            this.handleTreatmentSlotForMultiDayPass();
                        }
                    }
                );
            });
        });
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
        this.setState(
            {
                seletedTimeSlot: selectedTimeSlot
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
                this.createInstanceForBooking(startDate, endDate);
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
        analytics.clickTracking(this);
        const {
            labels,
            services: {
                urls: { updateCartApi }
            }
        } = this.props;
        const {
            selectedPassenger,
            durationType,
            openTimeSlotData,
            selectedDuration,
            seletedTimeSlot,
            selectedSlotForMultiDayPass,
            selectedSlotForOneDayPass
        } = this.state;
        const header = SessionStorage.getItem('header');
        const cruiseData = SessionStorage.getItem('cruiseData');
        const apikeyMycruise = getConfig('apikeyMycruise', '');
        const config = typeof window !== 'undefined' ? window.configs : '';
        const customCurrencyCode =
            config.brand.toLowerCase() === 'po' ? 'gbp' : 'usd';

        let dobArray = [];
        header.passengers.forEach((passenger) => {
            dobArray.push(passenger.birthDate);
        });

        const requestData = { recipients: [] };
        selectedPassenger.forEach((value, index) => {
            requestData['recipients'].push({
                paxNo: value,
                guestId: '',
                bookingRef: header.bookingRef
            });
        });
        if (durationType == 'SINGLE_SLOT') {
            requestData['productCode'] = selectedDuration[0].externalCode;
            requestData['productType'] = 'SPA';
            requestData['productPrice'] =
                seletedTimeSlot.promotionalPrice < seletedTimeSlot.standardPrice
                    ? seletedTimeSlot.promotionalPrice
                    : seletedTimeSlot.standardPrice;
            requestData['resHoldId'] = seletedTimeSlot.priceId;
            requestData['serviceDate'] = moment(
                seletedTimeSlot.startDate
            ).format('YYYYMMDD');
            requestData['serviceTime'] = seletedTimeSlot.startTime;
            requestData['qty'] = 1;
        } else if (durationType == 'ONE_DAY_PASS') {
            requestData['productCode'] = selectedDuration[0].externalCode;
            requestData['productType'] = 'SPA';
            requestData['qty'] = 1;
            requestData['productPrice'] =
                selectedSlotForOneDayPass.promotionalPrice <
                selectedSlotForOneDayPass.standardPrice
                    ? selectedSlotForOneDayPass.promotionalPrice
                    : selectedSlotForOneDayPass.standardPrice;
            requestData['resHoldId'] = selectedSlotForOneDayPass.priceId;
            requestData['serviceDate'] = moment(
                selectedSlotForOneDayPass.startDate
            ).format('YYYYMMDD');
            requestData['serviceTime'] = selectedSlotForOneDayPass.startTime;
        } else if (durationType == 'MULTI_DAY_PASS') {
            requestData['productCode'] = selectedDuration[0].externalCode;
            requestData['productType'] = 'SPA';
            requestData['qty'] = 1;
            requestData['productPrice'] =
                selectedSlotForMultiDayPass.promotionalPrice <
                selectedSlotForMultiDayPass.standardPrice
                    ? selectedSlotForMultiDayPass.promotionalPrice
                    : selectedSlotForMultiDayPass.standardPrice;
            requestData['resHoldId'] = selectedSlotForMultiDayPass.priceId;
            requestData['serviceDate'] = moment(
                selectedSlotForMultiDayPass.startDate
            ).format('YYYYMMDD');
            requestData['serviceTime'] = selectedSlotForMultiDayPass.startTime;
        }
        const updateCartApiUrl =
            updateCartApi ||
            '/api-mc/v1/mc-shopping-basket/PO-Site/users/current/carts/current/entries';
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
                        showError: true
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
                        loginType: header.agent
                            ? header.agent.agentType
                            : 'customer',
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
                        event: 'scAdd',
                        product_add2cart_aib: [
                            {
                                productName: '',
                                productType: '',
                                skuID: '',
                                skuName: '',
                                unitPrice_GBP: '',
                                unitPrice_local: '',
                                quantity: ''
                            }
                        ],
                        product_add2cart_other: {
                            productID: selectedProductId,
                            productName: selectedProductName,
                            skuID: ProductId,
                            skuName: selectedSkuName,
                            productType: 'spa',
                            startDateTime: startDateTime,
                            shorexAttributes: {
                                portName: '',
                                activityLevel: '',
                                language: '',
                                duration: '',
                                transport: '',
                                minAge: '',
                                maxAge: '',
                                tourType: [''],
                                tourCategory: '',
                                tourFeatures: ''
                            },
                            diningMealPeriod: '',
                            diningCategory: '',
                            spaTreatmentType: selectedProductName,
                            spaDuration: duration,
                            unitPrice_GBP: requestData.productPrice,
                            unitSalePrice_GBP: requestData.productPrice,
                            unitSalePrice_local: requestData.productPrice,
                            unitPrice_local: requestData.productPrice,
                            quantity: requestData.qty
                        },

                        subtotal_GBP:
                            requestData.productPrice * requestData.qty,
                        subtotal_local:
                            requestData.productPrice * requestData.qty
                    };

                    analytics.setAdditionalPageTrackAttributes(analyticsObject);
                    let spaDescriptionValue = '';
                    if (durationType == 'SINGLE_SLOT') {
                        spaDescriptionValue = `${
                            selectedDuration[0].duration
                        } ${labels.minutesLabel} | ${moment(
                            startDateTime
                        ).format('DD MMM YY')} | ${moment(startDateTime).format(
                            'h:mm A'
                        )}`;
                    } else if (durationType == 'ONE_DAY_PASS') {
                        spaDescriptionValue = `${
                            selectedDuration[0].duration
                        } ${labels.minutesLabel} | ${moment(
                            startDateTime
                        ).format('DD MMM YY')}`;
                    } else if (durationType == 'MULTI_DAY_PASS') {
                        spaDescriptionValue = `${
                            selectedDuration[0].duration
                        } ${labels.minutesLabel}`;
                    }

                    const popUpObj = {
                        rebookRedirectUrl: window.location.href,
                        currency: labels.currencyLabel,
                        totalPrice: res.totalPrice.value,
                        totalItemCount: res.totalItemsCount,
                        spaDescription: spaDescriptionValue,
                        show_spa_description: true,
                        isPopUpShow: true
                    };
                    SessionStorage.setItem('addToCartPopUp', popUpObj);
                    window.history.back(-1);
                }
            })
            .catch((error) => {
                // TODO: error menagement
            });
    };

    handleMonthTabClick = (monthTab) => {
        this.setState(
            { isMonthTabClicked: true, monthTabValue: monthTab },
            () => {
                const header = SessionStorage.getItem('header');
                const { embarkationDate, disembarkationDate } = header;
                let numOfDaysForApi = 6;
                const mqlMVP = watchForBreakpoint(VIEWPORT_TYPE.TABLET, true);
                if (mqlMVP.matches) {
                    numOfDaysForApi = 2;
                }
                let startDate = moment(monthTab.month_date, 'MMM YY').format(
                    'YYYY-MM-DD'
                );
                const diffDaysForEmb = this.calculateDateDiff(
                    embarkationDate,
                    startDate
                );
                if (diffDaysForEmb > 0) {
                    startDate = moment(embarkationDate).add(1, 'days');
                }
                let endDate = moment(startDate)
                    .add(numOfDaysForApi, 'days')
                    .format('YYYY-MM-DD');

                const diffDays = this.calculateDateDiff(
                    disembarkationDate,
                    endDate
                );
                if (diffDays == 0) {
                    endDate = moment(endDate)
                        .subtract(1, 'days')
                        .format('YYYY-MM-DD');
                }
                if (diffDays < 0) {
                    endDate = moment(endDate)
                        .subtract(Math.abs(diffDays) + 1, 'days')
                        .format('YYYY-MM-DD');
                }
                this.createInstanceForBooking(startDate, endDate);
            }
        );
    };

    renderMsgIfInstanceIsNotAvailble() {
        const { labels } = this.props;
        const { isTooEarly } = this.state;
        return (
            <div className="spaConfigPage-tile-container">
                <h2 className="msg_label">
                    {' '}
                    {isTooEarly
                        ? labels.notAvailableLabel
                        : labels.spaOnboardMessageLabel}
                </h2>
            </div>
        );
    }

    renderBookingComponent() {
        const { labels, bestPriceImageUrl } = this.props;
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
            monthTabValue
        } = this.state;
        const header = SessionStorage.getItem('header');

        return (
            <div className="spaConfigPage-tile-container">
                <SpaForm
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
                />
                {showError && (
                    <div className="error_msg_container">
                        {labels.addToCartErrorLabel}
                    </div>
                )}
                {orderCanProceed && (
                    <div className="botton-container">
                        <SpaFormSummary
                            labels={labels}
                            seletedTimeSlot={seletedTimeSlot}
                            selectedDay={selectedDay}
                            currency={labels.currencyLabel}
                            durationType={durationType}
                            selectedSlotForMultiDayPass={
                                selectedSlotForMultiDayPass
                            }
                            selectedSlotForOneDayPass={
                                selectedSlotForOneDayPass
                            }
                        />
                        <SpaAddToCart
                            labels={labels.addToCart}
                            maxSelected={maxSelected}
                            maxSelectable={maxSelectable}
                            orderCanProceed={orderCanProceed}
                            submitButtonHandler={this.handleSubmit}
                        />
                    </div>
                )}
                {this.state.showlodaer && (
                    <div className="throbberOverlay">
                        <Loader show={this.state.showlodaer} />
                    </div>
                )}
            </div>
        );
    }

    render() {
        const { isAvailableForBooking } = this.state;

        return isAvailableForBooking
            ? this.renderBookingComponent()
            : this.renderMsgIfInstanceIsNotAvailble();
    }
}

export default spaConfigLabels;
