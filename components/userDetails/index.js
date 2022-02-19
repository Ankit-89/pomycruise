/* eslint-disable quotes */
/* eslint-disable prettier/prettier */
import React from 'react';
import FetchData from '../commons/CUK/fetch-data';
import SessionStorage from '../commons/CUK/session-storage';
import SelectField from '../commons/CUK/selectField';
import PassengerForm from './passengerForm';
import LoyaltyTierSlot from '../loyaltyTierSlot';
import Link from '../commons/CUK/link';
import { createPassengersOptions } from './formHelpers';
import {
    cloneData,
    getConfig,
    generateUniqueCode,
    getToDoList,
    updateToDoList,
    getPaxConcent
} from '../commons/CUK/utilities';
import { calculateDiffDays } from '../commons/CUK/dateFormat';
import BookletBlock from './bookletBlock';
import PaxConsentBlock from './paxConsentBlock';
import Loader from '../commons/CUK/loader';
import analytics from '../commons/CUK/analytics';
import validateSession from '../commons/CUK/validateSession';
import { REQUEST_HEADER_FIELDS_TOO_LARGE } from 'http-status-codes';
import { checkForEticketAndLuggageLable } from '../loginMycruise/formHelpers';
import { calculateAge } from '../commons/CUK/dateFormat';
import moment from 'moment';

class userDetails extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            passengers: false,
            selectedPassenger: false,
            isEditing: false,
            leadPassenger: false,
            showThrobber: false,
            modified: false,
            apiError: false,
            apiErrorMsg: "",
            testUrl: '',
            hasConsent: true,
            isFetching: false
        };
    }

    // modifiedMethodToDisableButton=()=>{

    //     this.setState({modified:false})

    // }
    componentDidMount() {
        if (!validateSession.checkCookie(['wcmmode'])) {//YD to run on local
            this.fetchCruiseSummary()
                .then((res) => {
                    let cruiseSummaryData = SessionStorage.getItem('cruiseSummaryData') || {};
                    cruiseSummaryData = { ...cruiseSummaryData, ...res };
                    SessionStorage.setItem('cruiseSummaryData', cruiseSummaryData);
                    let resp = res;
                    resp && resp.passengers && resp.passengers.length && resp.passengers.forEach((passenger) => {
                        if (!passenger.hasOwnProperty("emergencyContact")) {
                            passenger['emergencyContact'] = {
                                "firstName": "",
                                "lastName": "",
                                "relationshipText": "",
                                "assistanceCompany": "",
                                "assistanceNumber": "",
                                "emailAddress": {
                                    "fullAddressText": ""
                                },
                                "contactPhone": [
                                    {
                                        "typeCode": {
                                            "$": "D"
                                        },
                                        "typeText": "Daytime",
                                        "number": ""
                                    },
                                    {
                                        "typeCode": {
                                            "$": "E"
                                        },
                                        "typeText": "Evening",
                                        "number": ""
                                    }
                                ],
                                "Address": [
                                    {
                                        "typeCode": {
                                            "$": "P"
                                        },
                                        "typeDescription": "Primary Address",
                                        "addressLine1": "",
                                        "addressLine2": "",
                                        "addressLine3": "",
                                        "buildingNameText": "",
                                        "cityNameText": "",
                                        "stateNameText": "",
                                        "countryCode": {
                                            "$": ""
                                        },
                                        "countryNameText": "",
                                        "postCode": {
                                            "$": ""
                                        },
                                        "countyNameText": ""
                                    }
                                ]
                            }
                        }
                    });
                    this.initFormData(resp, false);
                    this.handlePaxConsentBlock();
                })
                .catch((err) => { });
        }

        // analytics.clickTracking(this);
    }
    fetchCruiseSummary = () => {
        const {
            mycruiseSummaryApiV1 = '/api-mc/mc-getCruiseSummary/v1',
        } = this.props;
        const apikeyMycruise = getConfig('apikeyMycruise', '');
        const userData = SessionStorage.getItem('userData');
        const {
            bookingRef,
            companyCode,
            customer: { firstName, lastName },
        } = userData;
        const mycruiseSummaryApiUrl = `${mycruiseSummaryApiV1}?bookingRef=${bookingRef.toUpperCase()}&firstName=${firstName}&lastName=${lastName}&shipCode=${companyCode}`
        return FetchData(mycruiseSummaryApiUrl, {
            headers: {
                'X-Source-Identity-Token-0': apikeyMycruise
            }
        });
    };
    initFormData = (result, respError) => {

        // this.setState(
        //     () => ({
        //         apiError : respError,
        //     }))
        if (respError) {
            this.setState({ apiError: respError });
            return;
        }

        const newResult = cloneData(result);
        const { passengers } = newResult;
        const passengersOptions = createPassengersOptions(passengers);
        const userData = SessionStorage.getItem('userData');
        const { customer, embarkationDate } = userData;
        const today = new Date().getTime();
        const embark = new Date(embarkationDate).getTime();
        const xDays =
            typeof window !== 'undefined' ? window.configs.globalXdays : 0;
        const daysLeftForEdit = calculateDiffDays(today, embark) - xDays;

        const paxIndex = passengersOptions.findIndex(
            (x) => x.seqNumber === customer.paxNumber
        );
        const paxNumber = passengersOptions[paxIndex].seqNumber;

        const leadPax = SessionStorage.getItem('leadPassenger');
        const leadPaxIndex = passengersOptions.findIndex(
            (x) => x.seqNumber === leadPax.paxNumber
        );
        const leadPassenger = paxNumber === leadPax.paxNumber;

        this.setState(
            () => ({
                // apiError : respError,
                isEditing: false,
                stillEditable: daysLeftForEdit > 0,
                formData: newResult,
                leadPassenger,
                leadPaxName: `${leadPax.firstName} ${leadPax.lastName}`,
                leadPaxIndex: leadPaxIndex,
                passengers,
                passengersOptions,
                selectedPassenger: {
                    title: passengersOptions[paxIndex].label,
                    value: passengersOptions[paxIndex].value
                },
                showThrobber: false,
                throbberText: false,
                hasBooklet: false
            }),
            () => {
                if (leadPassenger) {
                    const { toDoListApi } = this.props;
                    getToDoList(toDoListApi)
                        .then((response) => { this.initPassengerConsents(result, response) })
                        .catch((err) => { });
                }
                // if (leadPassenger && leadPax.rateCode !== '') {
                //     this.fetchBooklet()
                //         .then(this.initBooklet)
                //         .catch((err) => { });
                // }
            }
        );
    };

    initFormDataTest = (result, respError, section) => {
        // this.setState(
        //     () => ({
        //         apiError : respError,
        //     }))
        // if(respError){
        //      this.setState({apiError:respError});
        //      return;
        // }

        const {
            apiError
        } = this.state;

        if (apiError) {
            return;
        }

        const newResult = cloneData(result);
        const { passengers } = newResult;
        const passengersOptions = createPassengersOptions(passengers);
        const userData = SessionStorage.getItem('userData');
        const { customer, embarkationDate } = userData;
        const today = new Date().getTime();
        const embark = new Date(embarkationDate).getTime();
        const xDays =
            typeof window !== 'undefined' ? window.configs.globalXdays : 0;
        const daysLeftForEdit = calculateDiffDays(today, embark) - xDays;

        const paxIndex = passengersOptions.findIndex(
            (x) => x.seqNumber === customer.paxNumber
        );
        const paxNumber = passengersOptions[paxIndex].seqNumber;

        const leadPax = SessionStorage.getItem('leadPassenger');
        const leadPaxIndex = passengersOptions.findIndex(
            (x) => x.seqNumber === leadPax.paxNumber
        );
        const leadPassenger = paxNumber === leadPax.paxNumber;

        const { selectedPassenger } = this.state;
        if (selectedPassenger.value) { }
        else {
            this.setState({
                selectedPassenger: {
                    title: passengersOptions[paxIndex].label,
                    value: passengersOptions[paxIndex].value
                }
            })
        }

        this.setState(
            () => ({
                // apiError : respError,
                isEditing: false,
                stillEditable: daysLeftForEdit > 0,
                formData: newResult,
                leadPassenger,
                leadPaxName: `${leadPax.firstName} ${leadPax.lastName}`,
                leadPaxIndex: leadPaxIndex,
                passengers,
                passengersOptions,
                // selectedPassenger: {
                //     title: passengersOptions[paxIndex].label,
                //     value: passengersOptions[paxIndex].value
                // },
                showThrobber: false,
                throbberText: false,
                hasBooklet: false,
                isFetching: false
            }),
            () => {
                this.checkEditMode(section);
            },
            () => {
                if (leadPassenger) {
                    const { toDoListApi } = this.props;
                    getToDoList(toDoListApi)
                        .then((response) => {
                            this.initPassengerConsents(result, response);
                        })
                        .catch((err) => {});
                }
                // if (leadPassenger && leadPax.rateCode !== '') {
                //     this.fetchBooklet()
                //         .then(this.initBooklet)
                //         .catch((err) => { });
                // }
            }
        );
    };

    initPassengerConsents = (res, resp) => {
        var consentsData = [];
        getPaxConcent()
            .then((response) => {
                if (response && response.leadPaxId && response.leadPaxId.length) {
                    consentsData = res.passengers.filter(function (n) { return !(this.indexOf(n.seqNumber.$) !== -1); }, response.leadPaxId);
                    console.log('consentsData', consentsData)
                    this.setState((prevState) => {
                        const { passengersOptions } = prevState;
                        const data = passengersOptions.reduce(
                            (data, passengerOption) => {
                                const paxConsent = resp.cruise.passengers.find(
                                    (passenger) =>
                                        +passengerOption.seqNumber === +passenger.paxNumber
                                );
                                data.passengersOptions.push({
                                    ...passengerOption,
                                    disabled: false//!paxConsent //YD TODO assuming that consent is already given by default
                                });
                                !!paxConsent &&
                                    data.consents.push(+passengerOption.seqNumber);
                                return data;
                            },
                            { passengersOptions: [], consents: [] }
                        );
                        return {
                            passengersOptions: data.passengersOptions,
                            consents: consentsData
                        };
                    });
                } else {
                    this.setState((prevState) => {
                        const { passengersOptions } = prevState;
                        const data = passengersOptions.reduce(
                            (data, passengerOption) => {
                                const paxConsent = resp.cruise.passengers.find(
                                    (passenger) =>
                                        +passengerOption.seqNumber === +passenger.paxNumber
                                );
                                data.passengersOptions.push({
                                    ...passengerOption,
                                    disabled: false//!paxConsent //YD TODO assuming that consent is already given by default
                                });
                                !!paxConsent &&
                                    data.consents.push(+passengerOption.seqNumber);
                                return data;
                            },
                            { passengersOptions: [], consents: [] }
                        );
                        return {
                            passengersOptions: data.passengersOptions,
                            consents: res.passengers
                        };
                    });
                }
            })
            .catch((err) => { });

    };

    updateSelectedPassenger = (name, value, title, event) => {
        let hasHoldConsent = false;
        getPaxConcent()
            .then((response) => {
                if (response && response.leadPaxId && response.leadPaxId.length) {
                    hasHoldConsent = !(response.leadPaxId.includes(JSON.stringify(parseInt(value) + 1)));
                } else {
                    hasHoldConsent = true;
                }
                this.setState(() => ({
                    selectedPassenger: {
                        title,
                        value
                    },
                    hasConsent: hasHoldConsent
                }));
            })
            .catch((err) => { });
    };
    setEditMode = (isEditing, section) => {
        this.setState(
            {
                isEditing: isEditing
            },
            () => {
                this.checkEditMode(section);
            }
        );
        this.setState({ apiError: true, apiErrorMsg: '' });
    };

    checkEditMode = (section) => {
        const headerElement = document.getElementsByTagName('header')[0];
        let titleElement = document.getElementsByClassName(
            'passenger_form--section'
        );
        let offset = 0;
        if (titleElement[0].id == section) {
            offset = titleElement[0].offsetTop;
        } else if (titleElement[1].id == section) {
            offset = titleElement[1].offsetTop;
        } else if (titleElement[2].id == section) {
            offset = titleElement[2].offsetTop;
        } else if (titleElement[3].id == section) {
            offset = titleElement[3].offsetTop;
        }
        let netOffset = offset + headerElement.offsetHeight + 50;
        window.scrollTo(0, netOffset);
    };

    handleSubmit = (
        dataToSubmit,
        apiUpdateUrlString,
        applyToOtherPassengers,
        section
    ) => {
        this.setState({
            isFetching: true
        }, () => {
            const { labels, toDoListApi } = this.props;
            let respError = false;
            const {
                formData,
                consents,
                leadPaxIndex,
                selectedPassenger
            } = this.state;
            const userData = SessionStorage.getItem('userData');
            const { bookingRef, passengers, customer } = userData;

            const newFormData = cloneData(formData);
            newFormData.passengers = dataToSubmit;

            const apikeyMycruise = getConfig('apikeyMycruise', '');

            const newPassengers = passengers.filter((passenger, index) => {
                const isLeadPax = index === leadPaxIndex;
                const hasGivenConsent =
                    consents &&
                    !!consents.find((consent) => +consent.seqNumber.$ === +passenger.paxNumber);
                const isSelectedPassenger = +selectedPassenger.value === +index;
                return (
                    (!applyToOtherPassengers && isSelectedPassenger) ||
                    (applyToOtherPassengers && (isLeadPax || hasGivenConsent))
                );
            });

            // //this.state.apiError = true;
            // //this.forceUpdate();
            // console.log(this.state.apiError);


            // this.setState(() => ({
            //     showThrobber: true,
            //     throbberText: labels.updateLabel,
            //     //apiError: true
            // }));
            newPassengers
                .reduce(
                    (previousApiCall, passenger) =>
                        previousApiCall
                            .then(() => {
                                // this.modifiedMethodToDisableButton();
                                const {
                                    firstName,
                                    lastName,
                                    birthDate
                                } = passenger;
                                const uniqueCode = generateUniqueCode(
                                    bookingRef,
                                    firstName,
                                    birthDate
                                );
                                newFormData.passengers.sort((a) => {
                                    return a.seqNumber.$ === passenger.paxNumber
                                        ? -1
                                        : 1;
                                });
                                const requestBody = {
                                    CruiseSummaryCBO: newFormData
                                };
                                // this.setState(() => ({
                                //     throbberText: labels.updateLabel.replace('{paxNumber}',paxNumber).replace('{guest}',`${firstName} ${lastName}`);
                                // }));
                                return FetchData(apiUpdateUrlString, {
                                    method: 'PUT',
                                    body: JSON.stringify(requestBody),
                                    headers: {
                                        'X-Source-Identity-Token-0': apikeyMycruise,
                                        'X-MessageID': uniqueCode,
                                        'Content-Type': 'application/json'
                                    }
                                });
                            })
                            //.then((res) => {res.error != undefined && res.error? respError = true : this.fetchCruiseSummary}) 
                            .then(this.handleSaveResp)
                            .then((res) => {
                                analytics.clickTracking(this);
                                const { firstName, lastName } = customer;
                                const checkForEticketAndLuggageLableValue = checkForEticketAndLuggageLable(firstName, lastName, res);
                                if (!this.state.apiError) {
                                    let cruiseSummaryData = SessionStorage.getItem('cruiseSummaryData') || {};
                                    cruiseSummaryData = { ...cruiseSummaryData, ...res };
                                    SessionStorage.setItem('cruiseSummaryData', cruiseSummaryData);
                                    newFormData.synchronizationId =
                                        res.synchronizationId;
                                    return Promise.resolve(res);
                                }
                            }).catch((err) => { console.log(err) }),
                    Promise.resolve()
                )
                .then((resp) => { this.initFormDataTest(resp, respError, section) })
                .catch((err) => { });
            newPassengers
                .reduce(
                    (previousApiCall, passenger) =>
                        previousApiCall
                            .then(() => {
                                return updateToDoList(
                                    toDoListApi,
                                    section,
                                    passenger.paxNumber
                                );
                            })
                            .then((res) => {
                                return Promise.resolve();
                            }),
                    Promise.resolve()
                )
                .catch((err) => { });
        })
    };


    handleSaveResp = (res) => {
        if (res && res.errors) {

            // console.log(this.state.apiError);
            this.setState({ apiError: true, apiErrorMsg: res.errors.length > 0 ? res.errors[0].message : "No error to display. Please check with admin." });
            Promise.resolve();
            // console.log(this.state.apiError);
        }
        else {
            this.setState({ apiError: false, apiErrorMsg: "", modified: false });
            return this.fetchCruiseSummary();
        }
    }

    renderLoyaltyTier() {
        const { labels, services, cta, loyaltyTiers } = this.props;
        const { passengers, selectedPassenger } = this.state;
        const userData = SessionStorage.getItem('userData');
        const adultAge = getConfig('minAdultAge', 0);

        const { loyaltyTierTitle, loyaltyTierLabel, noLoyaltyLabel } = labels;
        const { loyaltyApi } = services.urls;
        const { customer, brandCode } = userData;

        const passenger = passengers[selectedPassenger.value];
        const { ageQuantity } = passenger.individual;

        const isAdult = ageQuantity && +ageQuantity.$ >= adultAge;
        const isSameAsLogged = customer.paxNumber === passenger.seqNumber.$;
        const pastGuestNumber = passenger.pastGuestNumber
            ? passenger.pastGuestNumber.$
            : false;
        const canViewLoyalty = isSameAsLogged && isAdult;

        return canViewLoyalty ? (
            <div className="passenger-option-section">
                <h3 className="form-title">{loyaltyTierTitle}</h3>
                <div className="passenger-option-content">
                    <LoyaltyTierSlot
                        label={loyaltyTierLabel}
                        noTierLabel={noLoyaltyLabel}
                        loyaltyApi={loyaltyApi}
                        pastGuestNumber={pastGuestNumber}
                        brandCode={brandCode}
                        loyaltyTiers={loyaltyTiers}
                        hasTooltip={false}
                    />
                    <div className="option-row">
                        {this.renderMessageWithCta(cta.loyaltyTier)}
                    </div>
                </div>
            </div>
        ) : null;
    }
    fetchBooklet = () => {
        const bookletApi = this.props.services.urls.bookletApi;
        const { formData, passengers, selectedPassenger } = this.state;
        const { shipCode, cruise, id, agent } = formData;
        const { rateCode } = passengers[selectedPassenger.value];

        const apikeyMycruise = getConfig('apikeyMycruise', '');
        const params = {
            bookingRef: id.$,
            shipCode: cruise.ship.code.$,
            companyCode: shipCode.$,
            cruiseCode: cruise.cruiseItinerary.sailingID.$,
            agencyId: agent.userID.$,
            fareType: rateCode.$
        };
        let origin = typeof window !== 'undefined' && typeof window.location !== 'undefined' && window.location.origin;
        const url = new URL(bookletApi, origin);
        Object.entries(params).forEach(([key, val]) =>
            url.searchParams.append(key, val)
        );

        return FetchData(url.href, {
            headers: {
                'X-Source-Identity-Token-0': apikeyMycruise
            }
        });
    };

    handleBookletOptChange = (bool) => {
        const bookletApi = this.props.services.urls.updateBookletApi;

        const { formData } = this.state;
        const { shipCode, cruise, id } = formData;

        const apikeyMycruise = getConfig('apikeyMycruise', '');

        const requestBody = {
            setGoGreen: {
                companyCode: shipCode.$,
                shipCode: cruise.ship.code.$,
                cruiseCode: cruise.cruiseItinerary.sailingID.$,
                bookingRef: id.$,
                transmitMode: bool ? 'P' : 'E'
            }
        };

        FetchData(bookletApi, {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
                'Content-Type': 'application/json',
                'X-Source-Identity-Token-0': apikeyMycruise
            }
        })
            .then((res) => {
                // res.isGreenOption === 'success' &&
                // this.fetchBooklet().then(this.initBooklet);
            })
            .catch((err) => { });
    };

    initBooklet = (res) => {
        this.setState(() => ({
            hasBooklet:
                res.isGreenOption !== 'Not Eligible' &&
                res.isGreenOption !== 'NOT FOUND',
            bookletOpt: res.isGreenOption === 'TRUE'
        }));
    };

    dayToDepartureCruise() {
        const userData = SessionStorage.getItem('userData');
        const { embarkationDate } = userData;

        const dayOfCruiseDeparture = new Date(
            moment(embarkationDate, 'YYYY-MM-DD').format('ll')
        );
        const today = new Date();
        const oneDay = 1000 * 60 * 60 * 24;
        const dayToCruiseDeparture = Math.ceil(
            (dayOfCruiseDeparture.getTime() - today.getTime()) / oneDay
        );
        return dayToCruiseDeparture;
    }

    renderBookletOp() {
        const { labels } = this.props;
        const {
            leadPassenger,
            stillEditable,
            hasBooklet,
            bookletOpt
        } = this.state;

        const bookletMinDays = getConfig('bookletXdays', '');
        // const daysToLeft = this.dayToDepartureCruise();

        return leadPassenger && hasBooklet ? (
            <BookletBlock
                labels={labels}
                stillEditable={stillEditable}
                bookletOp={bookletOpt}
                bookletOptChangeHandler={this.handleBookletOptChange}
            />
        ) : null;
    }
    renderPassengerConsent() {
        const { labels } = this.props;
        const {
            leadPassenger,
            leadPaxName,
            passengers,
            selectedPassenger,
            hasConsent
        } = this.state;
        const adultAge =
            typeof window !== 'undefined' ? window.configs.minAdultAge : 0;

        return (
            <PaxConsentBlock
                labels={labels}
                minAdultAge={adultAge}
                pax={passengers[selectedPassenger.value]}
                isLeadPassenger={leadPassenger}
                leadPaxName={leadPaxName}
                updateCallBack={this.updateCallBackConsent}
                hasHoldConsent={hasConsent}
            />
        );
    }
    updateCallBackConsent = (param) => {
        let origin = typeof window !== 'undefined' && typeof window.location !== 'undefined' && window.location.origin;
        const updatePaxConsentUrl = getConfig('updatePaxConsentUrl', '') || `${origin}/api-mc/v1/mc-passengerconsent/amend`;
        const apikeyMycruise = getConfig('apikeyMycruise', '')
        const userData = SessionStorage.getItem('userData');
        const { bookingRef, cruiseCode, shipCode, brandCode, customer } = userData;
        const leadPassenger = SessionStorage.getItem('leadPassenger');
        const { paxNumber } = leadPassenger;
        const requestBody = {
            "brandCode": brandCode,
            "shipCode": shipCode,
            "cruiseCode": cruiseCode,
            "bookingRef": bookingRef,
            "paxId": `${customer.paxNumber}`,
            "leadPaxId": `${paxNumber}`,
            "hasGivenConsent": `${param}`,
            "userType": "GUEST"
        }
        FetchData(updatePaxConsentUrl, {
            method: 'PUT',
            body: JSON.stringify(requestBody),
            headers: {
                'Content-Type': 'application/json',
                'X-Source-Identity-Token-0': apikeyMycruise
            }
        })
            .then((res) => {
                this.handlePaxConsentBlock();
            })
            .catch((err) => { });
    }

    handlePaxConsentBlock() {
        let hasHoldConsent = false;
        const userData = SessionStorage.getItem('userData');
        const { customer } = userData;
        getPaxConcent()
            .then((response) => {
                if (response && response.leadPaxId && response.leadPaxId.length) {
                    hasHoldConsent = !(response.leadPaxId.includes(JSON.stringify(parseInt(customer.paxNumber))));
                } else {
                    hasHoldConsent = true;
                }

                this.setState({
                    hasConsent: hasHoldConsent
                })
            })
            .catch((err) => { });
    }

    renderMarketingOptions() {
        const { labels, cta } = this.props;
        return (
            <div className="passenger-option-section">
                <h3 className="form-title">{labels.marketingOptionsTitle}</h3>
                <div className="passenger-option-content">
                    <div className="option-row">
                        {this.renderMessageWithCta(cta.marketingOptions)}
                    </div>
                </div>
            </div>
        );
    }
    renderMessageWithCta(ctaData) {
        const [part1, part2] = ctaData.message.split('{{cta}}');
        return (
            <p className="option-text">
                {part1}
                <Link
                    url={ctaData.cta.url}
                    label={ctaData.cta.label}
                    linkClassName="cta-link"
                    dataLinktext={ctaData.cta.label}
                    dataComponentname={'userDetails'}
                >
                    {ctaData.cta.label}
                </Link>
                {part2}
            </p>
        );
    }
    renderConsentBanner() {
        const { labels } = this.props;

        return (
            <div className={`consent__failureState`}>
                <header className={`consent__failureStateHeader`}>
                    <span className={`consent__failureStateIcon`} />
                    <h3 className={`consent__failureStateText`} dangerouslySetInnerHTML={{ __html: labels.paxConsentPersonalInformationLabel }}>                    </h3>
                </header>
            </div>
        );
    }
    render() {
        const { labels, formFields, services } = this.props;
        const accesibilityLabels = this.props.accesibilityLabels ? this.props.accesibilityLabels : {};
        const style = { color: 'red' };
        const styleGrey = { color: 'grey' };
        const {
            passengers,
            passengersOptions,
            selectedPassenger,
            isEditing,
            leadPassenger,
            leadPaxIndex,
            consents,
            showThrobber,
            throbberText,
            apiError,
            apiErrorMsg,
            isFetching
        } = this.state;

        const adultAge =
            typeof window !== 'undefined' ? window.configs.minAdultAge : 0;
        const userData = SessionStorage.getItem('userData');
        const { customer: { birthDate } } = userData;
        const userBirthDate = new Date(birthDate);
        const isAdult = calculateAge(userBirthDate.getTime()) >= adultAge;
        let hasConsentValue = leadPassenger ? this.state.hasConsent : true;

        return passengers && passengers.length ? (
            <div className="passengers_details">
                {!isEditing && leadPassenger ? (
                    <div className="passenger_select">
                        <SelectField
                            selectClassName="select-passenger"
                            name="passengers"
                            showLabel={false}
                            label={'Select passenger'}
                            accesibilityLabels={accesibilityLabels}
                            disableValidation={true}
                            value={selectedPassenger.value}
                            title={selectedPassenger.title}
                            options={passengersOptions}
                            errorMsg="error"
                            disableDefaultOption={true}
                            changeCallback={this.updateSelectedPassenger}
                        />
                    </div>
                ) : null}
                {this.state.isFetching && (
                    <div className="throbberOverlay">
                        <Loader show={this.state.isFetching} />
                        <p className="throbberOverlay__text">
                            {labels.loadingLabel}
                        </p>
                    </div>
                )}
                {isEditing && apiError ? (
                    <p style={style}> {apiErrorMsg} </p>

                ) : null}

                {!isEditing ? (
                    <p style={styleGrey}> {labels.commonFormLabel} </p>
                ) : null}

                {!hasConsentValue && this.renderConsentBanner()}

                {hasConsentValue && (
                    <div className="passenger_form">
                        <PassengerForm
                            passengersData={passengers}
                            selectedPassengerIndex={selectedPassenger.value}
                            labels={labels}
                            accesibilityLabels={accesibilityLabels}
                            formFields={formFields}
                            editModeHandler={this.setEditMode}
                            services={services}
                            leadPassenger={leadPaxIndex == selectedPassenger.value}
                            handleSubmit={this.handleSubmit.bind(this)}
                            selectedSection={isEditing}
                            consents={consents}
                            modified={this.state.modified}
                            hasConsent={hasConsentValue}
                        />
                    </div>
                )}
                {hasConsentValue && !isEditing ? (
                    <div className="passenger_option">
                        <form
                            className="passengerForm-form"
                            name="passengerOption"
                            id="passengerOption"
                        >
                            {this.renderLoyaltyTier()}
                            {/* {this.renderBookletOp()} */}
                            {this.renderPassengerConsent()}
                            {isAdult && this.renderMarketingOptions()}
                        </form>
                    </div>
                ) : null}
                {showThrobber && (
                    <div className="throbberOverlay">
                        <Loader show={showThrobber} />
                        <p className="throbberOverlay__text">{throbberText}</p>
                    </div>
                )}
            </div>
        ) : (
            <div className="throbberOverlay">
                <Loader show={true} />
                <p className="throbberOverlay__text">{labels.loadingLabel}</p>
            </div>
        );
    }
}

export default userDetails;
