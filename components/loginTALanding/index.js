'use strict';

import React from 'react';
import TitleH1Mycruise from '../titleH1Mycruise';
import SessionStorage from '../commons/CUK/session-storage';
import { getConfig } from '../commons/CUK/utilities';
import FetchData from '../commons/CUK/fetch-data';
import extractChildComponent from '../commons/CUK/extractChildComponent';
import Loader from '../commons/CUK/loader';
import moment from 'moment';
import CryptoJS from 'crypto-js';
import validateSession from '../../components/commons/CUK/validateSession';
import {
    checkForEticketAndLuggageLable
} from '../loginMycruise/formHelpers';
import analytics from '../commons/CUK/analytics';


class loginTALanding extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showThrobber: false,
            loyalityList: [],
            passenger: '',
            bookingNumber: '',
            cruiseCode: '',
            shipCode: '',
            dob: '',
            bookingIdError: false,
            showThrobber: false,
            selectedMonth: { label: '', value: '' },
            selectedDay: { label: '', value: '' },
            selectedYear: { label: '', value: '' },
            selectedBrand: { label: '', value: '' },
            agentFirstName: '',
            agentLastName: '',
            agentType: '',
            agencyId: '',
            agentTitle: '',
        };
    }

    componentWillMount() {
        if (validateSession.checkCookie(['wcmmode']) !== 'edit' && validateSession.checkCookie(['wcmmode']) !== 'design') {
            this.setState({
                showThrobber: true
            }, () => {
                let search = window.location.search;
                let isIE = /*@cc_on!@*/false || (typeof document !== 'undefined' && !!document.documentMode);
                let params;
                let TAParamKey;

                if (isIE) {
                    TAParamKey = this.decodeUrlParam('stringTA')
                }
                else {
                    params = new URLSearchParams(search);
                    TAParamKey = params.get('stringTA');
                }
                if (TAParamKey !== null && TAParamKey !== undefined && TAParamKey !== '') {
                    this.getLoginDetailsForTA()
                } else {
                    let decodedStr;
                    let ivValue;
                    let agentType;

                    if (isIE) {
                        let type = search.substring(search.indexOf("?type") + 6, search.indexOf("%26string"));
                        let stringdecode = search.substring(search.indexOf("%26string") + 10, search.indexOf("&IV="));

                        decodedStr = decodeURIComponent(stringdecode);
                        agentType = type;
                        ivValue = this.decodeUrlParam('IV');
                    }
                    else {
                        let search = decodeURIComponent(window.location.search);
                        let searchURL = decodeURIComponent(window.location.href);
                        let params = new URLSearchParams(search);
                        let param = new URL(searchURL);

                        let type = param.searchParams.get('type');
                        let iv = params.get('IV');
                        let stringdecode = search.substring(search.indexOf("&string") + 8, search.indexOf("&IV="));

                        decodedStr = stringdecode;
                        ivValue = iv;
                        agentType = type;
                    }
                    this.getLoginDetailsForCCA(agentType, decodedStr, ivValue);
                }

            });
        }
        // wcmmode=disabled
    }

    decodeUrlParam = (name) => {

        let results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
        if (results == null) {
            return null;
        }
        else {
            return decodeURI(results[1]) || 0;
        }
    }

    getLoginDetailsForTA = () => {
        let search = window.location.search;
        //let params = new URLSearchParams(search);

        //let stringTA = params.get('stringTA');
        let stringTA = search.substring(search.indexOf("stringTA=") + 9, search.length);
        stringTA = this.decryptCodeData(stringTA);
        stringTA = JSON.parse(stringTA);
        const { ref, id, agTyp, locl, time, afn, aln, agt } = stringTA;

        //var date1 = new Date(parseInt(time)).toUTCString();
        var date = new Date();
        var date2 = moment.utc(date).valueOf();

        // the following is to handle cases where the times are on the opposite side of
        // midnight e.g. when you want to get the difference between 9:00 PM and 5:00 AM

        var diff = date2 - time;

        if (diff < 1000 * 60 * 60 * 2) {

            let url = '/content/po/master_website/en_GB/mycruise.talogin.json';
            url = url + '?type=' + agTyp + '&' + 'bookingRef=' + ref + '&agencyId=' + id + '&locale=' + locl;
            // console.log(url);
            //console.log(JSON.stringify(obj));
            FetchData(url, {
                method: 'GET',
            })
                .then((res) => {
                    if (res.RedirectUrl) {
                        // const date3 = moment.utc(date).valueOf();
                        // let strToEncry = `type=${agTyp.toUpperCase()}&timespan=${date3}`;
                        // const text = this.encryptedData(strToEncry);
                        // let url1 = "http://poukcp2-uat.carnivaluk.com/login";
                        // let uri = `${url1}?string=${text}`;
                        let uri = res.RedirectUrl;
                        uri ? window.location.href = uri : "";
                    }
                    else if (res.error) {
                        let redirectionUrl = window.location.origin + '/mycruise/login'
                        window.location.href = redirectionUrl;
                    }
                    else if (res) {
                        // console.log(res);
                        const {
                            passenger,
                            agentType,
                            bookingNumber,
                            agencyId,
                            cruiseCode,
                            shipCode
                        } = res;
                        this.setState({
                            passenger,
                            agentType,
                            bookingNumber,
                            agencyId,
                            cruiseCode,
                            shipCode,
                            showThrobber: false,
                            agentFirstName: afn,
                            agentLastName: aln,
                            agentTitle: agt
                        });

                    }
                    else {
                        let redirectionUrl = window.location.origin + '/mycruise/login'
                        window.location.href = redirectionUrl;
                    }
                })
                .catch((error) => {
                    this.setState({
                        showThrobber: false
                    })
                });
        }
        else {
            //do nothing
        }
    }
    getLoginDetailsForCCA = (type, decodedStr, ivValue) => {
        // const { servletRedirectionUrl } = this.props.services.urls;

        let iv = ivValue;
        let stringdecode = decodedStr;

        let url = '/content/po/master_website/en_GB/mycruise.talogin.json';
        url = url + '?type=' + type + '&' + 'string=' + stringdecode + '&IV=' + iv;

        var date = new Date();

        FetchData(url, {
            method: 'GET',
        })
            .then((res) => {
                if (res.RedirectUrl) {
                    // const locale = typeof window !== 'undefined' ? window.configs.locale : '';
                    // var url1;
                    // if (locale.includes("AU")) {
                    //     url1 = this.props.services.urls.redirectCunPoAU;
                    // }
                    // else {
                    //     url1 = this.props.services.urls.redirectCunPoUk;
                    // }
                    // const date3 = moment.utc(date).valueOf();
                    // let strToEncry = `type=${type.toUpperCase()}&timespan=${date3}`;
                    // const text = this.encryptedData(strToEncry);
                    // let uri = `${url1}?string=${text}`;

                    let uri = res.RedirectUrl;
                    uri ? window.location.href = uri : "";
                }
                else if (res.error) {
                    let redirectionUrl = window.location.origin + '/mycruise/login'
                    window.location.href = redirectionUrl;
                }
                else if (res) {
                    // console.log(res);
                    const {
                        passenger,
                        agentType,
                        bookingNumber,
                        agencyId,
                        cruiseCode,
                        shipCode
                    } = res;
                    this.setState({
                        passenger,
                        agentType,
                        bookingNumber,
                        agencyId,
                        cruiseCode,
                        shipCode,
                        showThrobber: false,
                    });

                }
                else {
                    let redirectionUrl = window.location.origin + '/mycruise/login'
                    window.location.href = redirectionUrl;
                }
            })
            .catch((error) => {
                this.setState({
                    showThrobber: false
                })
            });
    };

    encryptedData = (type) => {
        const currentTime = new Date().getTime() / 1000;
        const secretKey = "Bar12345Bar12345";
        const key = `type=${type}&timespan=${currentTime}`;
        var ciphertext = CryptoJS.AES.encrypt(key, secretKey);
        return ciphertext;
    }

    decryptCodeData = (ciphertext) => {
        let secretKey = "Bar12345Bar12345";
        secretKey = CryptoJS.enc.Utf8.parse(secretKey);
        var bytes = CryptoJS.AES.decrypt(ciphertext.toString(), secretKey, {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7
        });
        var plaintext = bytes.toString(CryptoJS.enc.Utf8);
        return plaintext;
    }

    getCookie(name) {
        var value = '; ' + typeof document !== 'undefined' && document.cookie;
        var parts = value.split('; ' + name + '=');
        if (parts.length == 2)
            return parts
                .pop()
                .split(';')
                .shift();
    }

    getMonthTitle(date) {
        const monthNames = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December'
        ];
        return monthNames[date.getMonth()];
    }

    handleSelectBtn = (key) => () => {
        analytics.clickTracking(this);
        const currentUser = key;
        const birthDateValue = moment(currentUser.birthdate, "MMDDYYYY").format('YYYY-MM-DD');
        const dateBirth = new Date(birthDateValue);
        const year = JSON.stringify(dateBirth.getFullYear());
        const mmTitle = JSON.stringify(dateBirth.getMonth());
        const mmValue = this.getMonthTitle(dateBirth);
        const dd = JSON.stringify(dateBirth.getDate());
        this.setState(
            {
                dob: birthDateValue,
                firstName: currentUser.firstName,
                lastName: currentUser.lastName,
                selectedDay: { label: dd, value: dd },
                selectedMonth: { label: mmTitle, value: mmValue },
                selectedYear: { label: year, value: year },
                showThrobber: true,
            },
            () => {
                this.handleSubmit();
            }
        );
    };

    handleSubmit = () => {
        const { services, showTermsAndConditions } = this.props;
        const { brand } = services.headers;
        const { mycruiseBookingApi } = services.urls;
        // console.log(mycruiseBookingApi);
        const {
            firstName,
            bookingNumber,
            selectedMonth,
            selectedDay,
            selectedYear,
            lastName,
            errors
        } = this.state;

        if (
            firstName &&
            bookingNumber &&
            selectedDay.value &&
            selectedMonth.value &&
            selectedYear.value &&
            lastName
        ) {
            const companyCode = brand.toLowerCase() === 'po' ? 'POC' : 'CUN';
            const apikeyMycruise = getConfig('apikeyMycruise', '');
            const birthDate = moment(`${selectedMonth.value}${selectedDay.value}${selectedYear.value}`, 'MMDDYYYY').format('YYYY-MM-DD');
            const url = `${mycruiseBookingApi}?bookingRef=${bookingNumber}&firstName=${firstName}&lastName=${lastName}&shipCode=${companyCode}&birthDate=${birthDate}`; // YD TODO need to uncomment
            //const url = "https://carnivaljson.s3.us-east-2.amazonaws.com/bookingref.json";

            FetchData(url, {
                method: 'GET',
                headers: {
                    'X-Source-Identity-Token-0': apikeyMycruise
                }
            })
                .then(this.handleCruisBookingResponse) //YD call the function with response coming from api
                .catch((error) => {
                    this.setState(() => ({
                        bookingIdError: true,
                        showThrobber: false
                    }));
                });
        }
    };

    handleCruisBookingResponse = (cruiseBooking) => {
        const {
            firstName,
            lastName,
            dob
        } = this.state;

        if (cruiseBooking.errors && cruiseBooking.errors.length > 0) {
            this.setState(() => ({
                bookingIdError: true,
                showThrobber: false
            }));
        } else {
            let birthDateValueCheck = dob.toString();
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
                        firstName.toLowerCase();//.replace(/\s/g, '');
                    const lastNameOk =
                        familyNameText.toLowerCase() ===
                        lastName.toLowerCase();//.replace(/\s/g, '');
                    const birthDateOk =
                        !birthDate ||
                        (birthDate && birthDate.toString() === birthDateValueCheck);
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
        const locale =
            typeof window !== 'undefined' ? window.configs.locale : '';
        var countryCode;
        if (locale.includes('AU')) {
            countryCode = 'AU';
        } else if (locale.includes('US')) {
            countryCode = 'US';
        } else if (locale.includes('DE')) {
            countryCode = 'DE';
        } else {
            countryCode = 'UK';
        }
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
                                const checkForEticket = checkForEticketAndLuggageLable(firstName, lastName, cruiseSummary);
                                let embarkationTime;

                                if (cruiseSummary.embarkationInfos !== undefined && cruiseSummary.embarkationInfos[0].time !== undefined)
                                    embarkationTime = cruiseSummary.embarkationInfos[0].time;
                                else
                                    embarkationTime = '1200';

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
                                const dateEmbark = new Date(
                                    ...startVoyageDateSeparate
                                ).valueOf();
                                const today = new Date().valueOf();
                                const diffInHour = (dateEmbark - today) / 1000 / 60 / 60;
                                // if more than one day before departure
                                if (diffInHour > 24) {
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
                            })
                            .catch((err) => { });
                    })
                    .catch((err) => { console.log(err) })
            })
            .catch((err) => { console.log(err) })

    }

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
        const cruiseName = this.getCruiseName(cruiseBooking); //YD taking our cruise name
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

    setSessionStorageInfo(
        cruiseBooking,
        cruiseSummary,
        passengerSeqNumber,
        cruiseName,
        showFlight,
        loyalty
    ) {
        // let agentData = this.getCookie('agentData');
        // agentData = JSON.parse(JSON.parse(agentData));
        const { agentType, agencyId, agentTitle, agentFirstName, agentLastName } = this.state;
        const { id, cruise } = cruiseBooking;
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
            debarks
        } = cruiseSummary;
        const { services, loyaltyTiers } = this.props;
        const { brand } = services.headers;
        const minAdultAge = getConfig('minAdultAge', '');
        const localeConfig = locale === 'de_DE' ? 'de' : locale;
        const marketHeader = locale === 'de_DE' ? 'GERMANY' : locale === 'en_AU' ? 'AUS' : locale === 'en_US' ? 'US' : 'UK';
        const passenger = passengers.find(
            (pax) => +pax.seqNumber.$ === +passengerSeqNumber
        );
        const { seqNumber, individual, pastGuestNumber, fareType } = passenger;
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
            embarkationPort: embarks.port.code.$
        };
        const customerInfo = {
            PaxNumber: seqNumber.$,
            title: individual.individualName.titleCode.$,
            firstName: individual.individualName.firstNameText,
            lastName: individual.individualName.familyNameText,
            email: individual.contactPoints[0].emailAddress.fullAddressText,
            customerType: 'Passenger',
            loyaltyTier
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

        const agentDataValue = {
            id: agencyId.toUpperCase(),
            title: agentTitle,
            firstName: agentFirstName,
            lastName: agentLastName,
            agentType: (agentType.toUpperCase() === 'TA') ? 'travelAgencyAgent' : 'customerServiceAgent',
        };

        info.customer = customerInfo;

        info.agent = agentDataValue;

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
            ...userDataMoreInfo
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

        SessionStorage.setItem('userData', userData);
        SessionStorage.setItem('header', info);
        SessionStorage.setItem('orderedList', orderedList);
        SessionStorage.setItem('showFlight', showFlight);
        SessionStorage.setItem('leadPassenger', leadPassenger);
        SessionStorage.setItem('luggageLabelData', luggageLabelData);

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

        const portCallsArr = [];
        const portCalls = cruiseSummary.ItineraryEvents
            ? cruiseSummary.ItineraryEvents.reduce(
                (ports, itineraryEvent, index) => {
                    const { typeCode, port } = itineraryEvent;
                    if (
                        typeCode.$ === 'PV' ||
                        typeCode.$ === 'EMB' ||
                        typeCode.$ === 'DEB'
                    ) {
                        const { portDetailsServletUrl } = this.props;
                        const url = portDetailsServletUrl.replace(
                            '{port_code}',
                            port.startPortCode.$
                        );

                        portCallsArr.push(
                            FetchData(url, {
                                method: 'GET',
                                'Content-Type': 'application/json'
                            }).then((res) => {
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
                                ports.portCalls[index] = {
                                    ...ports.portCalls[index],
                                    ...res
                                };
                            })
                        );
                    }
                    ports.portCalls.push(itineraryEvent);
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

                const redirectPageUrl = SessionStorage.getItem('redirectPageUrl');
                if (redirectPageUrl) {
                    window.location.href = redirectPageUrl;
                } else {
                    window.location.href = urlForRedirect.replace(
                        '{shipCode}',
                        ship.code.$
                    );
                }
            });
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

    render() {
        const { childComponents, labels } = this.props;
        const titleProps = extractChildComponent(
            this.props.childComponents,
            'titleH1Mycruise'
        );

        const { passenger, bookingNumber } = this.state;

        return (
            <div>
                <div className="tileH1-section">
                    {childComponents.length > 0 &&
                        childComponents[0] !== null && (
                            <TitleH1Mycruise {...titleProps.attributes} />
                        )}
                    <h4>
                        {labels.bookingNumberLabel} {bookingNumber}
                    </h4>
                </div>
                <ul>
                    {passenger && passenger.length > 0 && passenger.map((singlePassenger, index) => {
                        return (
                            <li key={index} className="passengerRow">
                                <input
                                    className="checkbox--hidden"
                                    type="checkbox"
                                    // onChange={this.updateInfo.bind(this)}
                                    value={index}
                                    id={index}
                                />
                                <label htmlFor={index}>
                                    <span>
                                        {singlePassenger.salution}{' '}
                                        {singlePassenger.firstName}{' '}
                                        {singlePassenger.lastName} | {'Age'}{' '}
                                        {singlePassenger.age}
                                    </span>
                                    {this.state.loyalityList[index] !==
                                        'No Tier' && (
                                            <span className="passengerRow__loyality">
                                                {labels.loyalityLabel}
                                                <span className="passengerRow__loyalityValue">
                                                    {this.state.loyalityList[index]}
                                                </span>
                                            </span>
                                        )}
                                    {this.state.loyalityList[index] ===
                                        'No Tier' && (
                                            <span className="passengerRow__loyality">
                                                {labels.noLoyalityLabel}
                                            </span>
                                        )}
                                    <span
                                        className="cta-primary passengerRow__cta"
                                        onClick={this.handleSelectBtn(
                                            singlePassenger
                                        )}
                                    >
                                        {labels.ctaLabel}
                                    </span>
                                </label>
                            </li>
                        );
                    })}
                </ul>
                {this.state.showThrobber && (
                    <div className="throbberOverlay">
                        <Loader show={this.state.showThrobber} />
                    </div>
                )}
            </div>
        );
    }
}

export default loginTALanding;
