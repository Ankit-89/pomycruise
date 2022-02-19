import React from 'react';
import Image from '../commons/CUK/image';
import SessionStorage from '../commons/CUK/session-storage';
import FetchData from '../commons/CUK/fetch-data';
import {
    generateUniqueCode,
    getConfig,
    checkForTheCorrectShip,
    checkForTheCorrectMarket
} from '../commons/CUK/utilities';
import analytics from '../commons/CUK/analytics';
import LegalModal from '../commons/CUK/legalModal';
import InputField from '../commons/CUK/inputField';
import ErrorSummary from '../commons/CUK/errorSummary';
import { regex } from '../../library/js/config/regex';
import TitleH1Mycruise from '../../components/titleH1Mycruise';
import SelectField from '../commons/CUK/selectField';
import extractChildComponent from '../commons/CUK/extractChildComponent';
import Loader from '../commons/CUK/loader';
import CryptoJS from 'crypto-js'
import moment from 'moment';
import Modal from '../commons/CUK/modal';
import LocalStorage from '../commons/CUK/localStorage';
import {
    createOptionsArray,
    createDaysOptions,
    createYearsOptions,
    checkForEticketAndLuggageLable
} from './formHelpers';

class loginMycruise extends React.Component {
    constructor(props) {
        super(props);
        this.loadTracking = true;

        this.state = {
            selectedMonth: { label: '', value: '' },
            selectedDay: { label: '', value: '' },
            selectedYear: { label: '', value: '' },
            selectedBrand: { label: '', value: '' },
            daysRange: props.daysRange,
            showError: false,
            handleErrorModal: '',
            showErrorHeader: false,
            handleModal: false,
            checkBoxChecked: true,
            validate: false,
            errors: {},
            isFormSubmitted: false,
            showThrobber: false,
            bookingIdError: false,
            showModal: false,
            checkForTheCorrectShipValue: true,
            checkForTheCorrectMarketValue: true
        };
    }
    //Added by YD as it was giving error for this obj on dev
    // const monthOpt = {"label":"Month","options":[{"04":{"label":"April","value":"04"}},{"08":{"label":"August","value":"08"}},{"12":{"label":"December","value":"12"}},{"02":{"label":"February","value":"02"}},{"01":{"label":"January","value":"01"}},{"07":{"label":"July","value":"07"}},{"06":{"label":"June","value":"06"}},{"03":{"label":"March","value":"03"}},{"05":{"label":"May","value":"05"}},{"default":{"label":"Month","value":null}},{"11":{"label":"November","value":"11"}},{"10":{"label":"October","value":"10"}},{"09":{"label":"September","value":"09"}}],"error":{"invalid":"Month Invalid Error","empty":"Month Empty Error"}};
    componentDidMount() {
        const { variation } = this.props;
        variation === 'guestLogin'
            ? this.createGuestLogin()
            : this.createContactCenterLogin();

        // analytics.clickTracking(this);
        if (this.loadTracking) {
            analytics.setAdditionalPageTrackAttributes({
                loginMycruise: {
                    leadType: 'loginMycruise',
                    event: 'event76'
                }
            });
            this.loadTracking = false;
        }
        analytics.clickTracking(this);
        this.callAnalyticsData(false);
    }

    mapAuthorableMsgAccToErrorCode = (errorRes) => {
        const { errorCodeMap } = this.props;
        const errorCode =
            (errorRes &&
                errorRes.errors &&
                errorRes.errors.length &&
                errorRes.errors[0].code) ||
            'defaultErrorCode';
        const errorMsg = errorCodeMap[errorCode];
        this.setState(() => ({
            bookingIdError: true,
            showThrobber: false,
            errorMessage: errorMsg
        }), () => {
            document
                .getElementsByClassName('faild-message')[0]
                .focus();
        });
    };

    callAnalyticsData(flag) {
        const redirectPageUrl = sessionStorage.getItem('deepLinkedPageUrl');
        if (
            redirectPageUrl !== null &&
            (redirectPageUrl !== '' || redirectPageUrl !== undefined)
        ) {
            const isRefineRedirectedURLReqiured = redirectPageUrl.indexOf('?') !== -1;
            const search = isRefineRedirectedURLReqiured ? redirectPageUrl.split('?') : redirectPageUrl;
            const params = search.length > 1 ? new URLSearchParams(search[1]) : new URLSearchParams(search);
            const CID = params.get('CID');
            const S_KWCID = params.get('S_KWCID');
            const analyticsObj = {
                "deep link flag": true,
                'referrer': "",
                'goal': redirectPageUrl,
                'CID': CID || "",
                "S_KWCID": S_KWCID || ""
            }
            if (flag == true) {
                analyticsObj.correctCruiseFlag = !flag;
            }
            analytics.setAdditionalPageTrackAttributes({
                deepLinkAnalytics: analyticsObj
            });
        }
    }

    createGuestLogin() {
        const {
            formFields: { month },
            yearsRange
        } = this.props;

        //Added by YD as it was giving error for this obj on dev
        const monthOpt = { "label": "Month", "options": [{ "04": { "label": "April", "value": "04" } }, { "08": { "label": "August", "value": "08" } }, { "12": { "label": "December", "value": "12" } }, { "02": { "label": "February", "value": "02" } }, { "01": { "label": "January", "value": "01" } }, { "07": { "label": "July", "value": "07" } }, { "06": { "label": "June", "value": "06" } }, { "03": { "label": "March", "value": "03" } }, { "05": { "label": "May", "value": "05" } }, { "default": { "label": "Month", "value": null } }, { "11": { "label": "November", "value": "11" } }, { "10": { "label": "October", "value": "10" } }, { "09": { "label": "September", "value": "09" } }], "error": { "invalid": "Month Invalid Error", "empty": "Month Empty Error" } };

        const { daysRange } = this.state;

        this.daysOptions = createDaysOptions(daysRange);
        this.monthsOptions = createOptionsArray(month.options);
        //this.monthsOptions = createOptionsArray(monthOpt.options); //Added by YD as it was giving error for this obj on dev
        this.yearsOptions = createYearsOptions(yearsRange, 'birth');
        this.setState(() => ({
            selectedDate: ''
        }));
    }
    createContactCenterLogin() {
        const {
            formFields: { brand }
        } = this.props;

        this.brandsOptions = createOptionsArray(brand.options);
    }

    getCruiseInfo(cruiseBooking, passengerSeqNumber) {
        const { services } = this.props;
        const { bookingNumber, firstName, lastName } = this.state;
        const {
            mycruiseSummaryApiV1 = '/api-mc/mc-getCruiseSummary/v1',
            mycruiseItineraryApiV1 = '/api-mc/mc-getItinerary/v1',
            mycruiseDiningAvailabilityApiV1 = '/api-mc/mc-getDiningAvailability/v1',
        } = services.urls;
        const { brand } = services.headers;
        // to retreive some info we have to call the cruise summary api
        const shipCode = brand.toLowerCase() === 'po' ? 'POC' : 'CUN';
        const locale = typeof window !== 'undefined' ? window.configs.locale : '';
        var countryCode;
        if (locale.includes("AU")) {
            countryCode = "AU";
        }
        else if (locale.includes("US")) {
            countryCode = "US";
        }
        else if (locale.includes("DE")) {
            countryCode = "DE";
        }
        else {
            countryCode = "UK";
        }

        countryCode = cruiseBooking.countryCode;

        const apikeyMycruise = getConfig('apikeyMycruise', '');

        const mycruiseSummaryApiUrl = `${mycruiseSummaryApiV1}?bookingRef=${bookingNumber.toUpperCase()}&firstName=${firstName}&lastName=${lastName}&shipCode=${shipCode}&countryCode=${countryCode}`
        const mycruiseItineraryApiUrl = `${mycruiseItineraryApiV1}?bookingRef=${bookingNumber.toUpperCase()}&firstName=${firstName}&lastName=${lastName}&shipCode=${shipCode}&countryCode=${countryCode}`
        const mycruiseDiningAvailabilityApiUrl = `${mycruiseDiningAvailabilityApiV1}?bookingRef=${bookingNumber.toUpperCase()}&firstName=${firstName}&lastName=${lastName}&shipCode=${shipCode}&countryCode=${countryCode}`
        let cruiseSummary = {};

        FetchData(mycruiseSummaryApiUrl, {
            headers: {
                'X-Source-Identity-Token-0': apikeyMycruise
            }
        })
            .then((cruiseSummaryRes) => {
                cruiseSummary = { ...cruiseSummary, ...cruiseSummaryRes }
                FetchData(mycruiseItineraryApiUrl, {
                    headers: {
                        'X-Source-Identity-Token-0': apikeyMycruise
                    }
                })
                    .then((cruiseItineraryRes) => {
                        cruiseSummary = { ...cruiseSummary, ...cruiseItineraryRes }
                        FetchData(mycruiseDiningAvailabilityApiUrl, {
                            headers: {
                                'X-Source-Identity-Token-0': apikeyMycruise
                            }
                        })
                            .then((cruiseDiningAvailabilityRes) => {
                                cruiseSummary = { ...cruiseSummary, ...cruiseDiningAvailabilityRes }
                                SessionStorage.setItem('cruiseSummaryData', cruiseSummary);
                                const checkForTheCorrectShipValue = checkForTheCorrectShip(
                                    cruiseSummary
                                );
                                const checkForTheCorrectMarketValue = checkForTheCorrectMarket(
                                    cruiseSummary
                                )
                                if (checkForTheCorrectShipValue && checkForTheCorrectMarketValue) {
                                    this.setState(
                                        () => ({
                                            checkForTheCorrectShipValue: true,
                                            cruiseSummaryData: cruiseSummary,
                                            cruiseBooking: cruiseBooking,
                                            passengerSeqNumber: passengerSeqNumber,
                                            checkForTheCorrectMarketValue: checkForTheCorrectMarketValue
                                        }),
                                        () => {
                                            this.correctShipRedirection(cruiseSummary);
                                        }
                                    );
                                } else {
                                    this.setState(() => ({
                                        bookingIdError: true,
                                        showThrobber: false,
                                        showModal: true,
                                        checkForTheCorrectShipValue: false,
                                        cruiseSummaryData: cruiseSummary,
                                        cruiseBooking: cruiseBooking,
                                        passengerSeqNumber: passengerSeqNumber,
                                        checkForTheCorrectMarketValue: checkForTheCorrectMarketValue
                                    }));
                                }
                            })
                            .catch((err) => {
                                this.mapAuthorableMsgAccToErrorCode(err);
                            });
                    })
                    .catch((err) => { console.log(err) })
            })
            .catch((err) => {
                console.log(err);
                this.mapAuthorableMsgAccToErrorCode(err);
            });
    }

    correctShipRedirection = (cruiseSummary) => {
        const {
            firstName,
            lastName,
            cruiseBooking,
            passengerSeqNumber
        } = this.state;
        const checkForEticket = checkForEticketAndLuggageLable(
            firstName,
            lastName,
            cruiseSummary
        );
        let embarkationTime;

        if (
            cruiseSummary.embarkationInfos !== undefined &&
            cruiseSummary.embarkationInfos[0].time !== undefined
        )
            embarkationTime = cruiseSummary.embarkationInfos[0].time;
        else embarkationTime = '1200';

        const startVoyageDate = moment(
            cruiseSummary.itineraryBooking.embarkDate,
            'MMDDYYYY'
        ).format('YYYY-MM-DD');
        let startVoyageDateSeparate = startVoyageDate.split('-');
        // -1 for month date values
        startVoyageDateSeparate[1] = startVoyageDateSeparate[1] - 1;

        startVoyageDateSeparate = [
            ...startVoyageDateSeparate,
            ...embarkationTime.match(/..?/g)
        ];
        const dateEmbark = new Date(...startVoyageDateSeparate).valueOf();
        const today = new Date().valueOf();
        const diffInHour = (dateEmbark - today) / 1000 / 60 / 60;
        // if more than one day before departure
        if (diffInHour > 1) {
            this.setSessionInfo(
                cruiseBooking,
                cruiseSummary,
                passengerSeqNumber
            );
        } else {
            this.setState(() => ({
                bookingIdError: true,
                showThrobber: false
            }));
        }
    };

    setSessionInfo(cruiseBooking, cruiseSummary, passengerSeqNumber) {
        const { embarks, debarks } = cruiseBooking;
        const { passengers } = cruiseSummary;
        const passenger = passengers.find(
            (pax) => pax.seqNumber.$ === passengerSeqNumber
        );
        const pastGuestNumber = passenger.pastGuestNumber
            ? passenger.pastGuestNumber.$
            : '';
        const embarkCode = embarks.port.code.$;
        const debarksCode = debarks.port.code.$;
        const southamptonEmbark = embarkCode === 'SOU' && debarksCode === 'SOU';
        const flights = southamptonEmbark
            ? this.getFlightApi(cruiseBooking, passengerSeqNumber)
            : Promise.resolve(true);
        const cruiseName = this.getCruiseName(cruiseBooking);//YD taking our cruise name
        const loyalty =
            pastGuestNumber && pastGuestNumber !== ''
                ? this.getLoyaltyApi(pastGuestNumber)
                : Promise.resolve(undefined);
        const promiseArr = [cruiseName, flights, loyalty];
        const reflect = (p) =>
            p.then(
                (v) => ({ v, status: 'fulfilled' }),
                (e) => ({ e, status: 'rejected' })
            );
        Promise.all(promiseArr.map(reflect))
            .then(([cruiseName, showFlight, loyalty]) => {
                this.setSessionStorageInfo(
                    cruiseBooking,
                    cruiseSummary,
                    passengerSeqNumber,
                    cruiseName.v ? cruiseName.v.txName : '',
                    showFlight.v || false,
                    loyalty.v || ''
                );
            })
            .catch((err) => { });
    }

    getCruiseName(cruiseBooking) {
        const { voyageServlet } = this.props;
        const { sailingID } = cruiseBooking.cruise.cruiseItinerary;
        const servletUrl = voyageServlet.replace('{code}', sailingID.$);

        return FetchData(servletUrl, {
            method: 'GET',
            'Content-Type': 'application/json'
        }).then((response) => response);
    }

    getFlightApi(cruiseBooking, passengerSeqNumber) {
        const { services } = this.props;
        const { flightsApi } = services.urls;
        const { brand } = services.headers;
        const { lastName, firstName } = this.state;
        const apikeyMycruise = getConfig('apikeyMycruise', '');
        const {
            id,
            cruise: { ship, cruiseItinerary }
        } = cruiseBooking;

        const url = `${flightsApi}?bookingRef=${id.$}&shipCode=${
            ship.code.$
            }&lastName=${lastName}&firstName=${firstName}&companyCode=${brand.toUpperCase()}&cruiseCode=${
            cruiseItinerary.sailingID.$
            }&paxNumber=${passengerSeqNumber}`;
        return FetchData(url, {
            method: 'GET',
            headers: {
                'X-Source-Identity-Token-0': apikeyMycruise
            }
        }).then(this.checkAirFlags);
    }
    checkAirFlags = (res) =>
        res.passengers.reduce(
            (ischeckAirFlag, passenger) =>
                passenger.flightBookings.reduce(
                    (ischeckAirFlag, flightBooking) => {
                        const { paxAir, airFlag } = flightBooking;
                        const showFlight =
                            paxAir.$ !== 'N' || airFlag.$ !== null;
                        const val = ischeckAirFlag
                            ? showFlight
                            : ischeckAirFlag;
                        return val;
                    },
                    ischeckAirFlag
                ),
            true
        );

    getLoyaltyApi(pastGuestNumber) {
        const { services } = this.props;
        const { loyaltyApi } = services.urls;
        const url = loyaltyApi.replace('{{paxUrn}}', pastGuestNumber);
        const apikeyMycruise = getConfig('apikeyMycruise', '');
        return fetch(url, {
            method: 'GET',
            headers: {
                'X-Source-Identity-Token-0': apikeyMycruise
            }
        })
            .then((res) => {
                return res.status === 200 ? res.json() : Promise.reject(res);
            })
            .then((res) => res.LocyaltyAccount[0]);
    }

    //setSessionStorageInfo
    setSessionStorageInfo(
        cruiseBooking,
        cruiseSummary,
        passengerSeqNumber,
        cruiseName,
        showFlight,
        loyalty
    ) {
        const { id, cruise, countryCode } = cruiseBooking;
        const { ship, cruiseItinerary } = cruise;
        const {
            locale,
            disembarkDate,
            startVoyageDate,
            embarks,
            itineraryBooking,
            passengers,
            cabins,
            shipCode,
            debarks,
            fullPaymentReceivedInd
        } = cruiseSummary;
        const { services, loyaltyTiers } = this.props;
        const { brand } = services.headers;
        const minAdultAge = getConfig('minAdultAge', '');
        const localeConfig = locale === 'de_DE' ? 'de' : locale;
        const marketHeader = locale === 'de_DE' ? 'GERMANY' : locale === 'en_AU' ? 'AUS' : locale === 'en_US' ? 'US' : 'UK';
        const passenger = passengers.find(
            (pax) => +pax.seqNumber.$ === +passengerSeqNumber
        );
        const { seqNumber, individual, pastGuestNumber, fareType, transportations, flightDetail } = passenger;
        const leadPassenger = passengers.reduce(
            (leadPaxObj, passenger, index) => {
                const { individual, fareType, seqNumber, rateCode } = passenger;
                const {
                    ageQuantity,
                    individualName,
                    contactPoints
                } = individual;
                const isAdult = +ageQuantity.$ >= +minAdultAge;

                if (seqNumber.$ < leadPaxObj.paxNumber && isAdult) {
                    leadPaxObj = {
                        paxNumber: seqNumber.$,
                        rateCode: rateCode ? rateCode.$ : '',
                        fareType: fareType || '',
                        index,
                        title: individualName.titleCode.$,
                        firstName: individualName.firstNameText,
                        lastName: individualName.familyNameText,
                        phone: contactPoints[0].phoneNumber
                            ? contactPoints[0].phoneNumber.numberText
                            : ''
                    };
                }
                return leadPaxObj;
            },
            {
                paxNumber: 100,
                index: -1,
                firstName: '',
                lastName: '',
                title: ''
            }
        );

        const loyaltyTier = loyalty.loyaltyTier ? loyalty.loyaltyTier.$ : '';
        const loyaltyData = loyaltyTiers[loyaltyTier.toLowerCase()];
        const loyaltyDesc = loyaltyData ? loyaltyData.itemDescription : false;
        const loyaltyName = loyaltyData ? loyaltyData.itemLabel : loyaltyTier;

        const info = {
            bookingRef: id.$,
            brandCode: brand.toUpperCase(),
            cruiseCode: cruiseItinerary.sailingID.$,
            embarkationDate: cruiseItinerary.sailDate,
            disembarkationDate: disembarkDate,
            shipCode: ship.code.$,
            market: marketHeader,
            language: localeConfig,
            physicalCruiseDate: startVoyageDate,
            physicalCruiseDuration: cruiseItinerary.durationDays,
            embarkationPort: embarks.port.code.$
        };
        const customerInfo = {
            PaxNumber: seqNumber.$,
            title: individual.individualName.titleCode.$,
            firstName: individual.individualName.firstNameText,
            lastName: individual.individualName.familyNameText,
            email: individual.contactPoints[0].emailAddress.fullAddressText,
            customerType: 'Passenger',
            loyaltyTier: loyaltyTier
        };

        let flagShowFlightMessage = 8;
        let flightSegmentDetail = '';
        let isFlightDetailsPresent = false;
        if (flightDetail && flightDetail.length > 0) {
            isFlightDetailsPresent = true;
            flightSegmentDetail = {
                airOrigin: flightDetail[0].flightSegmentDetail.airOrigin,
                carrierCode: flightDetail[0].flightSegmentDetail.carrierCode,
                flightNumber: flightDetail[0].flightSegmentDetail.flightNumber
            };
        };

        const customerInfo2 = {
            paxNumber: seqNumber.$,
            pastGuestNumber: pastGuestNumber ? pastGuestNumber.$ : '',
            title: individual.individualName.titleCode.$,
            firstName: individual.individualName.firstNameText,
            lastName: individual.individualName.familyNameText,
            genderCode: individual.genderCode.$,
            genderText: individual.individualName.suffixText,
            age: individual.ageQuantity.$,
            email: individual.contactPoints[0].emailAddress.fullAddressText,
            customerType: 'passenger',
            loyaltyTier,
            loyaltyName,
            loyaltyDesc,
            birthDate: individual.birthDate
        };

        info.customer = customerInfo;
        const userDataMoreInfo = {
            embarkationCode: embarks.port.code.$,
            disembarkationCode: cruiseItinerary.destinationCode.$,
            disembarkationCodeForLuggageLabel: debarks.port.code.$,
            cabinCode: itineraryBooking.categoryCode.$,
            cabinType: itineraryBooking.cabinType,
            cruiseName,
            fareCode: fareType,
            cabinNumber: cabins[0].number,
            companyCode: shipCode.$
        };

        //status is 'active' for every passenger we are receiving from the api, if is cancelled, we will not receive it (checked with polar team)
        const passengersInfo = cruiseBooking.passengers.reduce(
            (passengers, passenger) => {
                const { seqNumber, individual, guestId = '' } = passenger;
                passengers.push({
                    paxNumber: seqNumber.$,
                    title: individual.individualName.titleCode.$,
                    firstName: individual.individualName.firstNameText,
                    lastName: individual.individualName.familyNameText,
                    birthDate: individual.birthDate,
                    status: 'active',
                    guestId: guestId
                });
                return passengers;
            },
            []
        );
        const passengersInfo2 = cruiseBooking.passengers.reduce(
            (passengers, passenger) => {
                const { seqNumber, individual, pastGuestNumber, guestId = '' } = passenger;
                passengers.push({
                    paxNumber: seqNumber.$,
                    pastGuestNumber: pastGuestNumber ? pastGuestNumber.$ : '',
                    title: individual.individualName.titleCode.$,
                    firstName: individual.individualName.firstNameText,
                    lastName: individual.individualName.familyNameText,
                    birthDate: individual.birthDate,
                    customerType: 'passenger',
                    genderCode: individual.genderCode.$,
                    genderText: individual.individualName.suffixText,
                    age: individual.ageQuantity.$,
                    guestId: guestId
                });
                return passengers;
            },
            []
        );

        info.passengers = passengersInfo;

        // remove current logged from list and sort the rest
        const passengersHelper = passengersInfo2
            .filter((pax) => pax.paxNumber !== passenger.seqNumber.$)
            .sort(
                (a, b) =>
                    new Date(moment(a.birthDate, 'YYYY-MM-DD').format('ll')) -
                    new Date(moment(b.birthDate, 'YYYY-MM-DD').format('ll'))
            );

        // first position: the logged user
        // then all the other in decrescent age
        const orderedList = {
            passengers: [customerInfo2, ...passengersHelper]
        };

        const userData = {
            ...info,
            customer: customerInfo2,
            passengers: passengersInfo2,
            ...userDataMoreInfo,
            countryCode
        };

        const luggageLabelData = {
            shipName: itineraryBooking.shipName,
            cabinsNumber: cabins[0].number,
            cabinsDeckName: cabins[0].deckName,
            cabinsDeckNumber: cabins[0].deckNumber,
            cabinsCabinLocationsTypeCode:
                cabins[0].cabinLocations[0].typeCode.$,
            cabinsCabinLocationsDesc: cabins[0].cabinLocations[0].desc,
            itineraryBookingCabinNumber: itineraryBooking.cabinNumber,
            itineraryBookingCabinType: itineraryBooking.cabinType,
            itineraryBookingCabinPosition: itineraryBooking.cabinPosition,
            itineraryBookingCabinLuggageDoor: itineraryBooking.cabinLuggageDoor
        };

        const fullPaymentReceivedIndValue = fullPaymentReceivedInd !== "N" ? true : false;

        const countryCodeData = {
            countryCode: countryCode
        }

        SessionStorage.setItem('userData', userData);
        SessionStorage.setItem('header', info);
        SessionStorage.setItem('orderedList', orderedList);
        SessionStorage.setItem('countryCodeData', countryCodeData);
        SessionStorage.setItem('leadPassenger', leadPassenger);
        SessionStorage.setItem('luggageLabelData', luggageLabelData);
        SessionStorage.setItem('fullPaymentReceivedInd', fullPaymentReceivedIndValue);

        const cruiseData = {
            shipName: itineraryBooking.shipName,
            cruiseName: cruiseName || '',
            durationCruise: cruiseItinerary.durationDays,
            guestNumber: passengers.length,
            embarkDate: cruiseItinerary.sailDate,
            disembarkDate: disembarkDate,
            sailingId: cruiseItinerary.sailingID.$,
            embarkPort: itineraryBooking.embarkPortName,
            disembarkPort: itineraryBooking.debarkPortName
        };

        const embarkCode = cruiseBooking.embarks.port.code.$;
        const debarksCode = cruiseBooking.debarks.port.code.$;
        const southamptonEmbark = embarkCode === 'SOU' && debarksCode === 'SOU';


        let localeFlag;
        if (locale.includes("US") || locale.includes("GB")) {
            localeFlag = true;
        }

        let localeFlagDEAU;
        if (locale.includes("AU") || locale.includes("DE")) {
            localeFlagDEAU = true;
        }

        const airLinkFlag = (transportations && (transportations.typeCode.$ === 'A' || transportations.typeCode.$.toUpperCase() === 'O')) && isFlightDetailsPresent;
        // console.log(' airLink Flag is **** ', airLinkFlag, localeFlag, southamptonEmbark);
        SessionStorage.setItem('showFlight', true);

        if ((localeFlag && southamptonEmbark && !airLinkFlag) || (localeFlagDEAU)) {
            SessionStorage.setItem('showFlight', false);
        }
        else if (localeFlag && southamptonEmbark && transportations.typeCode.$ !== 'A' && isFlightDetailsPresent && flightSegmentDetail.airOrigin === 'N') // airlink flag = n  //&& flightSegmentDetail.airOrigin === 'N')
        {
            flagShowFlightMessage = '2';
        }
        else if (localeFlag && !southamptonEmbark && transportations.typeCode.$ === 'A' && isFlightDetailsPresent && flightSegmentDetail.airOrigin === 'NULL') {
            flagShowFlightMessage = '3';
        }
        else if (localeFlag && !southamptonEmbark && transportations.typeCode.$ === 'A' && isFlightDetailsPresent && flightSegmentDetail.airOrigin === 'N') {
            flagShowFlightMessage = '4';
        }
        else if (localeFlag && !southamptonEmbark && transportations.typeCode.$ === 'A' && isFlightDetailsPresent && flightSegmentDetail.airOrigin === 'P'
            && (flightSegmentDetail.carrierCode === 'XX' || flightSegmentDetail.carrierCode === 'TBA' || flightSegmentDetail.carrierCode === '999'
                || flightSegmentDetail.flightNumber.trim().substring(0, 3) === 'TBA' || flightSegmentDetail.flightNumber.trim().substring(0, 3) === '999'
                || flightSegmentDetail.flightNumber.trim().substring(0, 3) === 'XX')) {
            flagShowFlightMessage = '5';
        }
        else if (localeFlag && !southamptonEmbark && transportations && transportations.typeCode.$ !== 'A' &&
            (!isFlightDetailsPresent || (isFlightDetailsPresent && flightSegmentDetail.airOrigin === 'NULL'))) {
            flagShowFlightMessage = '6';
        }
        else if (!(transportations || transportations.typeCode.$ === 'A') && isFlightDetailsPresent && flightSegmentDetail.airOrigin === 'N') {
            flagShowFlightMessage = '7';
        }

        SessionStorage.setItem('flagShowFlightMessage', flagShowFlightMessage);

        const portCallsArr = [];

        const { portDetailsServletUrl } = this.props;
        let portCode = '';
        cruiseSummary.ItineraryEvents && cruiseSummary.ItineraryEvents.forEach((itineraryEvent, index) => {
            const { typeCode, port } = itineraryEvent;
            if (
                typeCode.$ === 'PV' ||
                typeCode.$ === 'EMB' ||
                typeCode.$ === 'DEB'
            ) {
                if (portCode == '') {
                    portCode = port.startPortCode.$
                } else {
                    portCode = portCode + "." + port.startPortCode.$
                }
            }
        })

        if (portCode !== '') {
            const url = portDetailsServletUrl.replace(
                '{port_code}',
                portCode
            );
            FetchData(url, {
                method: 'GET',
                'Content-Type': 'application/json'
            })
                .then((response) => {
                    const portCalls = cruiseSummary.ItineraryEvents
                        ? cruiseSummary.ItineraryEvents.reduce(
                            (ports, itineraryEvent, index) => {
                                const { typeCode, port } = itineraryEvent;
                                if (
                                    typeCode.$ === 'PV' ||
                                    typeCode.$ === 'EMB' ||
                                    typeCode.$ === 'DEB'
                                ) {
                                    const res = response[port.startPortCode.$];
                                    if (typeCode.$ === 'EMB') {
                                        cruiseData.embarkPierCode =
                                            itineraryEvent.port.startPierCode.$;
                                        cruiseData.embarkPort = res.shortName
                                            ? res.shortName
                                            : cruiseData.embarkPort; //YD
                                    } else if (typeCode.$ === 'DEB') {
                                        cruiseData.debarkPierCode =
                                            itineraryEvent.port.startPierCode.$;
                                        cruiseData.disembarkPort = res.shortName
                                            ? res.shortName
                                            : cruiseData.disembarkPort;
                                    }
                                    ports.portCalls.push(itineraryEvent);
                                    portCallsArr.push(
                                        ports.portCalls[index] = {
                                            ...ports.portCalls[index],
                                            ...res
                                        }
                                    );
                                } else {
                                    ports.portCalls.push(itineraryEvent);
                                }
                                return ports;
                            },
                            { portCalls: [] }
                        )
                        : [];
                    Promise.all(portCallsArr)
                        .then(() => {
                            SessionStorage.setItem('portCalls', portCalls);
                            SessionStorage.setItem('cruiseData', cruiseData);
                        })
                        .finally(() => {
                            const countriesHomepage = getConfig('countriesHomepage', {});
                            const urlForRedirect = countriesHomepage[locale]
                                ? countriesHomepage[locale]
                                : countriesHomepage.default;
                            const analyticsParms = {
                                componentName: this.props.component,
                                linkText: this.props.labels.loginLabel,
                                event: 'event5,event28'
                            };
                            analytics.customClicks(analyticsParms);
                            const redirectPageUrl = JSON.parse(
                                sessionStorage.getItem('redirectPageUrl')
                            );
                            const sessionRedirectPageUrl = JSON.parse(
                                sessionStorage.getItem('sessionRedirectPageUrl')
                            );

                            if (redirectPageUrl && this.state.checkForTheCorrectShipValue) {
                                window.location.href = redirectPageUrl;
                            } else if (sessionRedirectPageUrl && this.state.checkForTheCorrectShipValue) {
                                window.location.href = sessionRedirectPageUrl;
                            } else {
                                window.location.href = urlForRedirect.replace(
                                    '{shipCode}',
                                    ship.code.$
                                );
                            }
                        });
                })
                .catch((response) => { });
        }
    }
    handleSubmit = () => {
        analytics.clickTracking(this);
        const { services, showTermsAndConditions } = this.props;
        const { brand } = services.headers;
        const { mycruiseBookingApi } = services.urls;
        // console.log(mycruiseBookingApi);
        const {
            checkBoxChecked,
            firstName,
            bookingNumber,
            selectedMonth,
            selectedDay,
            selectedYear,
            lastName,
            errors
        } = this.state;

        // let isCheckMandatory = showTermsAndConditions ? false : true;
        let checkboxUpdated = !showTermsAndConditions ? true : checkBoxChecked;

        /* if (
             checkboxUpdated &&
             firstName !== '' &&
             bookingNumber !== '' &&
             selectedDay.value !== '' &&
             selectedMonth.value !== '' &&
             selectedYear.value !== '' &&
             lastName !== ''
         ) { */



        if (
            checkboxUpdated &&
            firstName &&
            bookingNumber &&
            selectedDay.value &&
            selectedMonth.value &&
            selectedYear.value &&
            lastName
        ) {
            const companyCode = brand.toLowerCase() === 'po' ? 'POC' : 'CUN';
            const apikeyMycruise = getConfig('apikeyMycruise', '');
            // const dateOfBirth = `${selectedMonth.value}${selectedDay.value}${selectedYear.value}`;
            // const uniqueCode = generateUniqueCode(
            //     bookingNumber,
            //     firstName,
            //     dateOfBirth
            // );
            const birthDate = moment(`${selectedMonth.value}${selectedDay.value}${selectedYear.value}`, 'MMDDYYYY').format('YYYY-MM-DD');
            const url = `${mycruiseBookingApi}?bookingRef=${bookingNumber}&firstName=${firstName}&lastName=${lastName}&shipCode=${companyCode}&birthDate=${birthDate}`;
            if (Object.values(errors).length === 0) {
                this.setState(() => ({
                    showThrobber: true
                }),
                    () => {
                        document
                            .getElementsByClassName('throbberOverlay__text')[0]
                            .focus();
                    }
                );
            }
            FetchData(url, {
                method: 'GET',
                headers: {
                    'X-Source-Identity-Token-0': apikeyMycruise
                    // 'X-MessageID': uniqueCode
                }
            })
                .then(this.handleCruisBookingResponse)
                .catch((error) => {
                    this.mapAuthorableMsgAccToErrorCode(error);
                });
        } else {
            const firstNameInput = typeof document !== 'undefined' && document.getElementsByName('firstName')[0];
            const lastNameInput = typeof document !== 'undefined' && document.getElementsByName('lastName')[0];
            const bookingNumberInput = typeof document !== 'undefined' && document.getElementsByName(
                'bookingNumber'
            )[0];
            const monthDropdown = typeof document !== 'undefined' &&  document.getElementsByName('month')[0];
            const dayDropdown = typeof document !== 'undefined' &&  document.getElementsByName('day')[0];
            const yearDropdown = typeof document !== 'undefined' && document.getElementsByName('year')[0];

            /*   if (firstName === '') {
                   firstNameInput.focus();
                   firstNameInput.blur();
               }
               if (lastName === '') {
                   lastNameInput.focus();
                   lastNameInput.blur();
               }
               if (bookingNumber === '') {
                   bookingNumberInput.focus();
                   bookingNumberInput.blur();
               }
               if (selectedDay.value === '') {
                   dayDropdown.focus();
                   dayDropdown.blur();
               }
               if (selectedMonth.value === '') {
                   monthDropdown.focus();
                   monthDropdown.blur();
               }
               if (selectedYear.value === '') {
                   yearDropdown.focus();
                   yearDropdown.blur();
               }
   */




            if (!firstName) {
                firstNameInput.focus();
                firstNameInput.blur();
            }
            if (!lastName) {
                lastNameInput.focus();
                lastNameInput.blur();
            }
            if (!bookingNumber) {
                bookingNumberInput.focus();
                bookingNumberInput.blur();
            }
            if (!selectedDay.value) {
                dayDropdown.focus();
                dayDropdown.blur();
            }
            if (!selectedMonth.value) {
                monthDropdown.focus();
                monthDropdown.blur();
            }
            if (!selectedYear.value) {
                yearDropdown.focus();
                yearDropdown.blur();
            }



            if (showTermsAndConditions) {
                const checkboxTerms = typeof document !== 'undefined' && document.getElementsByName('checkbox')[0];
                if (checkBoxChecked !== true) {
                    checkboxTerms.click();
                    checkboxTerms.click();
                }
            } else {
                this.setState(() => ({
                    bookingIdError: true,
                    showThrobber: false
                }),
                    () => {
                        document
                            .getElementsByClassName('faild-message')[0]
                            .focus();
                    }
                );
            }
        }
    };

    handleCruisBookingResponse = (cruiseBooking) => {
        const {
            firstName,
            lastName,
            selectedDay,
            selectedMonth,
            selectedYear,
            errorMessage
        } = this.state;
        // errors handling
        if (cruiseBooking.errors && cruiseBooking.errors.length > 0) {
            this.mapAuthorableMsgAccToErrorCode(cruiseBooking);
            const analyticsObjectForClick = {
                event: "event77",
                componentName: "api_mc-crise-booking",
                validationError: errorMessage !== '' && typeof errorMessage !== 'undefined' ? errorMessage : cruiseBooking.errors[0].message
            }
            analytics.customClicks(analyticsObjectForClick);
            analytics.setAdditionalPageTrackAttributes({
                loginMycruise: {
                    linkType: 'o',
                    linkPageName: 'login',
                    validationError: 'login unsuccessful'
                }
            });
            // analytics.clickTracking(this);
        } else {
            const loggedPassenger = cruiseBooking.passengers.find(
                (passenger) => {
                    const {
                        individual: {
                            individualName: { firstNameText, familyNameText },
                            birthDate
                        }
                    } = passenger;
                    const firstNameOk =
                        firstNameText.toLowerCase() ===
                        firstName.trim().toLowerCase();//.replace(/\s/g, '')
                    const lastNameOk =
                        familyNameText.toLowerCase() ===
                        lastName.trim().toLowerCase();//.replace(/\s/g, '')
                    const birthDateOk =
                        !birthDate ||
                        (birthDate &&
                            birthDate ===
                            moment(
                                `${selectedMonth.value}${
                                selectedDay.value
                                }${selectedYear.value}`,
                                'MMDDYYYY'
                            ).format('YYYY-MM-DD'));

                    return firstNameOk && lastNameOk && birthDateOk;
                }
            );
            this.setState(
                () => ({
                    bookingIdError: !loggedPassenger,
                    showThrobber: !!loggedPassenger
                }),
                () => {
                    // loggedPassenger &&
                    this.getCruiseInfo(
                        cruiseBooking,
                        loggedPassenger.seqNumber.$
                    );
                }
            );
        }
    };
    handleError = (stateKey, errorState, errorMsg) => {
        const { errors } = this.state;
        if (errorState && errorMsg) {
            errors[stateKey] = errorMsg;
        } else {
            if (errors[stateKey]) {
                delete errors[stateKey];
            }
        }
        this.setState(() => {
            errors;
        });
    };
    handleTextChange = (evt) => {
        const {
            target: { name, value, checked }
        } = evt;
        const { isFormSubmitted } = this.state;
        const { showTermsAndConditions } = this.props;
        const checkbox = this.refs.checkbox;
        if (isFormSubmitted) {
            this.setState(() => ({
                showErrorHeader: false,
                validate: false
            }));
        }
        if (name === 'checkbox') {
            checkbox.classList.toggle('show', !checked);
            checkbox.classList.toggle('error-field', !checked);

            this.setState(() => ({
                checkBoxChecked: showTermsAndConditions ? checked : false
            }));
        } else {
            this.setState(() => ({
                [name]: value
            }));
        }
    };
    createMarkup = (html) => ({ __html: html });
    focusHandler = (event) => {
        const { target } = event;
        target.classList.remove('error-input');
        target.previousSibling.classList.add('input-label-focus');
    };
    blurHandler = (event) => {
        const { target } = event;
        if (!target.value) {
            target.previousSibling.classList.remove('input-label-focus');
        }
    };
    selectCheckBox = (e) => {
        e.key === 'Enter' && this.checkbox ? this.checkbox.click() : null;
    };
    getDaysInMonth = (month) => new Date(2000, month, 0).getDate();
    handleBrandChange = (name, value, title, event) => {
        this.setState(() => ({
            selectedBrand: {
                value,
                title
            }
        }));
    };
    handleDateChange = (name, value, title, event) => {
        this.setState((prevState) => {
            const newState = prevState;
            const selectedOption = {
                value,
                title
            };
            switch (name) {
                case 'month':
                    newState.selectedMonth = selectedOption;
                    newState.daysRange = new Date(
                        newState.selectedYear.value,
                        value,
                        0
                    ).getDate();
                    break;

                case 'day':
                    newState.selectedDay = selectedOption;
                    break;

                case 'year':
                    newState.selectedYear = selectedOption;
                    newState.daysRange = new Date(
                        value,
                        newState.selectedMonth.value,
                        0
                    ).getDate();
                    break;
            }
            return newState;
        });
    };
    renderTitle() {
        const { childComponents } = this.props;
        const titleProps = extractChildComponent(
            childComponents,
            'titleH1Mycruise'
        );
        const cookiePolicyHeader = LocalStorage.getItem('cookiePolicyHeader') || false;
        const customHeaderClass = !cookiePolicyHeader ? { 'margin-top': '90px' } : {};
        return titleProps ? (
            <div className={`tileH1-section cookiePolicyHeader`} style={customHeaderClass}>
                <TitleH1Mycruise {...titleProps.attributes} />
            </div>
        ) : null;
    }
    renderMonthDropdown() {
        const {
            formFields: { month }
        } = this.props;
        const { selectedMonth } = this.state;
        return (
            <SelectField
                selectClassName="select-month"
                name="month"
                label={month.label}
                validate={false}
                defaultValue={month.label}
                value={selectedMonth.value}
                title={selectedMonth.title}
                options={this.monthsOptions}
                showLabel={false}
                errorMsg={''}
                changeCallback={this.handleDateChange}
                errorCallback={(errorState, errorMsg) =>
                    this.handleError('selectBox', errorState, errorMsg)
                }
            />
        );
    }
    renderDayDropdown() {
        const {
            formFields: { day, birthDate }
        } = this.props;
        const { selectedDay, daysRange } = this.state;

        return (
            <SelectField
                selectClassName="select-day"
                name="day"
                label={day.label}
                validate={false}
                defaultValue={day.label}
                value={selectedDay.value}
                title={selectedDay.title}
                options={this.daysOptions.slice(0, daysRange)}
                showLabel={false}
                errorMsg={birthDate.error}
                changeCallback={this.handleDateChange}
                errorCallback={(errorState, errorMsg) =>
                    this.handleError('selectBox', errorState, errorMsg)
                }
            />
        );
    }
    renderYearDropdown() {
        const {
            formFields: { year }
        } = this.props;
        const { selectedYear } = this.state;

        return (
            <SelectField
                selectClassName="select-year"
                name="year"
                label={year.label}
                validate={false}
                defaultValue={year.label}
                value={selectedYear.value}
                title={selectedYear.title}
                options={this.yearsOptions}
                showLabel={false}
                errorMsg={''}
                changeCallback={this.handleDateChange}
                errorCallback={(errorState, errorMsg) =>
                    this.handleError('selectBox', errorState, errorMsg)
                }
            />
        );
    }
    renderBrandSelect() {
        const {
            formFields: { brand }
        } = this.props;
        const { selectedBrand } = this.state;
        return (
            <div className="brands">
                <SelectField
                    name="brand"
                    label={brand.label}
                    validate={validate}
                    defaultValue={brand.label}
                    value={selectedBrand.value}
                    title={selectedBrand.title}
                    options={this.brandsOptions}
                    showLabel={false}
                    errorMsg={brand.error}
                    changeCallback={this.handleBrandChange}
                    errorCallback={(errorState, errorMsg) =>
                        this.handleError('selectBox', errorState, errorMsg)
                    }
                />
            </div>
        );
    }
    renderBookingIdInput() {
        const { formFields, labels, accesibilityLabels } = this.props;
        const { bookingNumber, validate } = this.state;
        const clearFeild = accesibilityLabels.clearFeild ? accesibilityLabels.clearFeild : '';

        return (
            <InputField
                type="text"
                required={true}
                id="bookingNumber"
                name="bookingNumber"
                changeCallback={this.handleTextChange}
                placeholder={formFields.bookingNumber.label}
                value={bookingNumber || ''}
                validate={validate}
                maxLength="6"
                errorMsg={formFields.bookingNumber.error}
                errorCallback={(errorState, errorMsg) =>
                    this.handleError('bookingNumber', errorState, errorMsg)
                }
                errorLabel={clearFeild}
                showAstrick={true}
            />
        );
    }
    renderFirstNameInput() {
        const { formFields, labels, accesibilityLabels } = this.props;
        const { validate, firstName } = this.state;
        const clearFeild = accesibilityLabels.clearFeild ? accesibilityLabels.clearFeild : '';
        return (
            <InputField
                type="text"
                required={true}
                id="firstName"
                name="firstName"
                changeCallback={this.handleTextChange}
                placeholder={formFields.firstName.label}
                value={firstName || ''}
                regex={regex.name}
                validate={validate}
                errorMsg={formFields.firstName.error}
                errorCallback={(errorState, errorMsg) =>
                    this.handleError('firstName', errorState, errorMsg)
                }
                errorLabel={clearFeild}
                showAstrick={true}
            />
        );
    }
    renderLastNameInput() {
        const { formFields, labels, accesibilityLabels } = this.props;
        const { validate, lastName } = this.state;
        const clearFeild = accesibilityLabels.clearFeild ? accesibilityLabels.clearFeild : '';

        return (
            <InputField
                type="text"
                required={true}
                id="lastName"
                name="lastName"
                changeCallback={this.handleTextChange}
                placeholder={formFields.lastName.label}
                value={lastName || ''}
                regex={regex.name}
                validate={validate}
                errorMsg={formFields.lastName.error}
                errorCallback={(errorState, errorMsg) =>
                    this.handleError('lastName', errorState, errorMsg)
                }
                errorLabel={clearFeild}
                showAstrick={true}
            />
        );
    }
    renderBirthDateBlock() {
        const { formFields, services } = this.props;
        const { country } = services.headers;
        const dateOfBirthOrder = country === 'US' ? false : true;
        return (
            <div className="bithdate" data-birth={dateOfBirthOrder}>
                <div className="birthdate-title">
                    {formFields.birthDate.label}
                </div>
                {dateOfBirthOrder
                    ? this.renderDayDropdown()
                    : this.renderMonthDropdown()}
                {dateOfBirthOrder
                    ? this.renderMonthDropdown()
                    : this.renderDayDropdown()}
                {this.renderYearDropdown()}
            </div>
        );
    }
    renderTermsAndConditions() {
        const { labels, termsAndConditionsLink, type } = this.props;
        const { checkBoxChecked } = this.state;
        return (
            <div className="tnc-wrap">
                <input
                    type="checkbox"
                    className="input-check"
                    aria-labelledby="variation2-check"
                    name="checkbox"
                    id="checkboxb"
                    ref={(checkbox) => (this.checkbox = checkbox)}
                    onKeyPress={this.selectCheckBox}
                    onChange={this.handleTextChange}
                    checked={checkBoxChecked}
                />
                <label htmlFor="checkboxb" className="checkbox-label">
                    Checkbox
                </label>
                <a
                    href={`${termsAndConditionsLink}`}
                    className="tnc"
                    id="variation2-check"
                    dangerouslySetInnerHTML={this.createMarkup(
                        labels.termsAcceptance
                    )}
                    data-linktext={`link:${labels.termsAcceptance}`}
                    data-componentname={type}
                />
                <span className="error-label show-label" ref="checkbox">
                    {labels.validationMessage}
                </span>
            </div>
        );
    }
    renderErrorSummary() {
        const { variation, labels } = this.props;
        const { errors } = this.state;
        const isGuest = variation === 'guestLogin';
        return (
            <div className="error-summary-wrapper">
                <ErrorSummary
                    errors={errors}
                    formId={`${isGuest ? 'guest' : 'contact-center'}-login`}
                    errorHeading={labels.requiredErrorMessage}
                    summaryRef={(el) => (this.errorMessageContainerB = el)}
                />
            </div>
        );
    }
    renderPrivacyPolicy() {
        const { type, labels, privacyPolicyLink, cookiePolicyLink } = this.props;
        const pramsObject = {
            componentName: "loginMycruise",
            linkText: "privacyNotice ",
        };
        analytics.customClicks(pramsObject);
        return (
            <div className="privacy-cookie-container">
                <div className="privacy-wrap">
                    <a
                        href={`${privacyPolicyLink}`}
                        target="_blank"
                        dangerouslySetInnerHTML={{
                            __html: labels.privacyPolicy
                        }}
                        data-linktext={`link:${labels.privacyPolicy}`}
                        data-componentname={type}
                    />
                </div>
                <div className="privacy-wrap">
                    <a
                        // href={`${window.location.origin}/${locale.toLowerCase()}/mycruise/CookiePage`}
                        href={`${cookiePolicyLink}`}
                        target="_blank"
                        dangerouslySetInnerHTML={{
                            __html: labels.cookiePolicy
                        }}
                        data-linktext={`link:${labels.privacyPolicy}`}
                        data-componentname={type}
                    />
                </div>
            </div>
        );
    }

    renderCCLogin() {
        return (
            <div className="input-formFields">
                {this.renderBookingIdInput()}
                {this.renderBrandSelect()}
            </div>
        );
    }
    renderGuestLogin() {
        return (
            <div className="input-formFields">
                {this.renderBookingIdInput()}
                {this.renderFirstNameInput()}
                {this.renderLastNameInput()}
                {this.renderBirthDateBlock()}
            </div>
        );
    }
    renderLogin() {
        const {
            variation,
            image,
            showPrivacyPolicy,
            showTermsAndConditions,
            labels,
            component,
            errorCodeMap
        } = this.props;
        const {
            handleModal,
            handleErrorModal,
            showError,
            showThrobber,
            bookingIdError,
            firstName,
            bookingNumber,
            selectedMonth,
            selectedDay,
            selectedYear,
            lastName,
            errorMessage
        } = this.state;//PR
        const isGuest = variation === 'guestLogin';
        const isMandatorErrorLabel =
            firstName == undefined ||
            bookingNumber == undefined ||
            selectedDay.value == undefined ||
            selectedDay.value == "" ||
            selectedMonth.value == undefined ||
            selectedMonth.value == "" ||
            selectedYear.value == undefined ||
            selectedYear.value == "" ||
            lastName == undefined
                ? labels.mandatoryFieldMessage
                : (errorMessage == '' || errorMessage == undefined)
                    ? errorCodeMap
                        ? errorCodeMap.defaultErrorCode
                        : labels.loginFailedMessage
                    : errorMessage; //PR
        if (isMandatorErrorLabel) {
            const analyticsParms = {
                componentName: component,
                linkText: labels.loginLabel,
                validationError: isMandatorErrorLabel
            };
            analytics.customClicks(analyticsParms);
        }
        const hiddenModal =
            handleModal === true || handleErrorModal === true ? 'hide' : '';
        return (
            <div className="log-in">
                <div
                    className={`log-in-wrap log-in-container login-grid ${!isGuest &&
                        'log-in-container-cc'}`}
                >
                    {this.renderTitle()}
                    <div className="login-row">
                        <div className="login-image login-row-6">
                            {image && <Image {...image} />}
                        </div>
                        <div className="login-form-wrap login-row-5">
                            <div className={`login-wrapper ${hiddenModal}`}>
                                {showError && this.renderErrorSummary()}
                                <form
                                    name="login"
                                    id={`${
                                        isGuest ? 'guest' : 'contact-center'
                                        }-login`}
                                    className={
                                        bookingIdError === true
                                            ? 'form-has-error'
                                            : ''
                                    }
                                >
                                    <div className="input-formFields">
                                        {isGuest &&
                                            this.daysOptions &&
                                            this.renderGuestLogin()}
                                        {!isGuest && this.renderCCLogin()}
                                    </div>
                                    {isGuest &&
                                        showTermsAndConditions &&
                                        this.renderTermsAndConditions()}
                                    <p
                                        tabIndex={
                                            bookingIdError === false
                                                ? '-1'
                                                : '1'
                                        }
                                        className={
                                            bookingIdError === false
                                                ? 'faild-message hide'
                                                : 'faild-message'
                                        }
                                    >
                                        <span className="faild-message-icon" />

                                        {isMandatorErrorLabel}
                                    </p>
                                    <div className="submit-wrap cf input-formFields">
                                        <button
                                            type="button"
                                            className="login-button"
                                            id="mycruise-login-button"
                                            data-clicktype={`general`}
                                            data-linktext={`${
                                                labels.loginLabel
                                                }`}
                                            onClick={this.handleSubmit}
                                        >
                                            {labels.loginLabel}
                                        </button>
                                    </div>
                                </form>
                                {isGuest &&
                                    showPrivacyPolicy &&
                                    this.renderPrivacyPolicy()}
                            </div>
                        </div>
                    </div>
                </div>
                {showThrobber && (
                    <div className="throbberOverlay">
                        <Loader show={showThrobber} />
                        <p tabIndex="0" className="throbberOverlay__text">
                            {this.props.labels.loginLoadingMessage}
                        </p>
                    </div>
                )}
            </div>
        );
    }
    handleModalExpired = () => {
        this.callAnalyticsData();
        this.setState({
            selectedMonth: { label: '', value: '' },
            selectedDay: { label: '', value: '' },
            selectedYear: { label: '', value: '' },
            showModal: false,
            lastName: '',
            firstName: '',
            bookingNumber: ''
        });
    };

    handleDeclinedMessage = () => {
        const { cruiseSummaryData } = this.state;
        this.callAnalyticsData(true);
        this.setState(
            () => ({
                showThrobber: true
            }),
            () => {
                this.correctShipRedirection(cruiseSummaryData);
            }
        );
    };

    render() {
        const {
            closeText,
            contentLabel,
            hideLegalAccordion,
            labels
        } = this.props;
        const {
            bookingIdError,
            firstName,
            bookingNumber,
            selectedMonth,
            selectedDay,
            selectedYear,
            lastName
        } = this.state;
        // const isMandatorErrorLabel =
        //     firstName == undefined ||
        //     bookingNumber == undefined ||
        //     selectedDay.value == undefined ||
        //     selectedMonth.value == undefined ||
        //     selectedYear.value == undefined ||
        //     lastName == undefined
        //         ? labels.mandatoryFieldMessage
        //         : labels.loginFailedMessage;

        return (
            <div>
                <div className="login-mycruise">
                    <LegalModal
                        closeLabel={closeText}
                        contentLabel={contentLabel}
                        underlayClass="legal-modal"
                        hideLegalAccordion={hideLegalAccordion}
                        taxFeesBlock={this.renderLogin()}
                    />
                </div>
                {this.state.showModal && (
                    <Modal
                        mounted={this.state.showModal}
                        onExit={() => this.handleModalExpired(false)}
                        contentLabel="loginInfoLabel"
                        ctaType={''}
                        underlayClass="loginInfoLabel"
                    >
                        <div className="">
                            <h4
                                className={
                                    bookingIdError === false
                                        ? 'faild-message hide'
                                        : 'faild-message'
                                }
                            >
                                {!this.state.checkForTheCorrectMarketValue ? labels.loginDeepLinkedURLDifferentMarketMessage : labels.loginDeepLinkedURLDifferentCruiseMessage}
                            </h4>
                        </div>

                        <div className="modal-btns">
                            <button
                                className="cta-primary"
                                onClick={() => this.handleDeclinedMessage()}
                            >
                                {'No'}
                            </button>
                            <button
                                className="cta-primary"
                                onClick={() => this.handleModalExpired()}
                            >
                                {'Yes'}
                            </button>
                        </div>
                    </Modal>
                )}
            </div>
        );
    }
}

loginMycruise.defaultProps = {
    yearsRange: 137,
    daysRange: 31,
    backtopLabel: 'Back to Top',
    closeLabel: 'Close',
    contentLabel: 'Privacy Policy Modal'
};

export default loginMycruise;
