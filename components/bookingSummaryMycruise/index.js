'use strict';

import React from 'react';
import Image from '../commons/CUK/image';
import Modal from '../commons/CUK/modal';
import TitleH1Mycruise from '../titleH1Mycruise';
import extractChildComponent from '../commons/CUK/extractChildComponent';
import analytics from '../commons/CUK/analytics';
import SessionStorage from '../commons/CUK/session-storage';
import moment from 'moment';
import Loader from '../commons/CUK/loader';
import { getConfig, updateToDoList, getToDoList } from '../commons/CUK/utilities';
import {
    printLuggageLabel,
    checkIfPrintIsAvailable,
    callForEticketMicroServiceServlet,
    printEticketWithoutMicroservices,
    callForLuggageLabelMicroServiceServlet,
    generateLuggageLabel
} from '../commons/CUK/printUtilities';
import LoyaltyTierSlot from '../loyaltyTierSlot';
import validateSession from '../commons/CUK/validateSession';
import fetchData from '../commons/CUK/fetch-data';
import { checkCookie, getCookie } from '../commons/CUK/cookies';

// import './styles/index.css';
// import 'platform-theme/styles/components/bookingSummaryMycruise/index.css';

class bookingSummaryMycruise extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showModal: false,
            overlayText: '',
            showThrobber: true,
            checkInAvaialbleFlag: false,
            personalInfoCheck: false,
            tooltipMsg: '',
            onlineCheckinAvailability: false,
            msg: '',
            // touchStart: false
        };
        // this.handleTouchStart = this.handleTouchStart.bind(this);
        // this.closeTooltip = this.closeTooltip.bind(this);
    }

    componentDidMount() {
        if (!validateSession.checkCookie(['wcmmode'])) {
            this.getOverlayText();
        } else {
            this.setState({ showThrobber: false });
        }
        this.checkIfCheckInAvailable();
        // const { toDoListApi } = this.props.services.urls;
        // getToDoList(toDoListApi)
        // .then((res) => {
        const luggageLabelData = SessionStorage.getItem('luggageLabelData');
        const fullPaymentReceivedInd = SessionStorage.getItem('fullPaymentReceivedInd');
        const checkForflagPersonalDetail = SessionStorage.getItem('checkForflagPersonalDetail');
        const checkForflagTravelDocDetail = SessionStorage.getItem('checkForflagTravelDocDetail');
        const cabinInfoCheck = luggageLabelData ? (luggageLabelData.itineraryBookingCabinLuggageDoor !== '' && luggageLabelData.cabinsDeckNumber !== '' && luggageLabelData.cabinsNumber !== '') ? true : false : false;
        // const checklist = res.cruise.passengers[0].checklist;
        if (cabinInfoCheck && checkForflagPersonalDetail && checkForflagTravelDocDetail && fullPaymentReceivedInd) {
            const valueFromAEMeTicketSwitch = getConfig('isETicketMicroServiceEnabled');
            const isCookieExistForMicroServicesEticket = checkCookie('microservicesEticket');
            const valueOfMicroServicesEticketAPIcall = isCookieExistForMicroServicesEticket && getCookie('microservicesEticket');
            if (valueFromAEMeTicketSwitch || (isCookieExistForMicroServicesEticket && valueOfMicroServicesEticketAPIcall == 'true')) {
                const apiCallForETicketsAvailable = checkIfPrintIsAvailable('eTicket');
                if (apiCallForETicketsAvailable) {
                    callForEticketMicroServiceServlet();
                }
            }
            const valueFromAEMluggageLabelSwitch = getConfig('isLuggagelabelMicroServiceEnabled');
            const isCookieExistForMicroServicesLuggageLabel = checkCookie('microservicesLuggageLabel');
            const valueOfMicroServicesLuggageLabelAPIcall = isCookieExistForMicroServicesLuggageLabel && getCookie('microservicesLuggageLabel');
            if (valueFromAEMluggageLabelSwitch || (isCookieExistForMicroServicesLuggageLabel && valueOfMicroServicesLuggageLabelAPIcall == 'true')) {
                const apiCallForLuggageLabelsAvailable = checkIfPrintIsAvailable('luggageLabel');
                if (apiCallForLuggageLabelsAvailable) {
                    callForLuggageLabelMicroServiceServlet();
                }
            }
            this.setState({
                personalInfoCheck: true,
            });
        }
        // })
        // .catch(this.handleApiError);
    }

    /**
     *Overlay text will be aquired from the fe with a call to AEM
     */
    getOverlayText() {
        const { necessaryStepsUrl } = this.props;
        // let url = urls.disclaimerApi;

        fetch(necessaryStepsUrl, {
            method: 'GET'
        })
            .then((res) => res.text())
            .then((html) => {
                this.setState(() => ({
                    overlayText: html,
                    showThrobber: false
                }));
            })
            .catch((err) => { });
    }

    //renderInfo
    renderInfo() {
        const { labels, services } = this.props;
        const {
            shipLabel,
            nightsLabel,
            guestsLabel,
            departsLabel,
            arrivesLabel
        } = labels;
        const { country } = services.urls;
        const cruiseData = SessionStorage.getItem('cruiseData') || {};
        const {
            shipName = '',
            cruiseName = '',
            durationCruise = 0,
            guestNumber = 0,
            embarkPort = '',
            embarkDate = 0,
            disembarkPort = '',
            disembarkDate = 0
        } = cruiseData;

        const dateFormat = country === 'US' ? 'MMM DD YYYY' : 'DD MMM YYYY';

        return (
            <div className="cruiseInfo">
                <div tabIndex="0">
                    <h5 className="cruiseInfo__shipName">
                        {shipLabel} {shipName}
                    </h5>
                    <h2 className="cruiseInfo__name">{cruiseName}</h2>
                    <div>
                        <span className="cruiseInfo__data">
                            {durationCruise} {nightsLabel}
                        </span>
                        <span className="cruiseInfo__data">
                            {guestNumber} {guestsLabel}
                        </span>
                    </div>
                </div>
                <div className="cruiseInfo__ports" tabIndex="0">
                    <div className="cruiseInfo__portData">
                        <p className="cruiseInfo__subtitle">{departsLabel}</p>
                        <h5>{embarkPort}</h5>
                        <p>{moment(embarkDate).format(dateFormat)}</p>
                    </div>
                    <div className="cruiseInfo__portData">
                        <p className="cruiseInfo__subtitle">{arrivesLabel}</p>
                        <h5>{disembarkPort}</h5>
                        <p>{moment(disembarkDate).format(dateFormat)}</p>
                    </div>
                </div>
            </div>
        );
    }

    closeTooltip(e) {
        analytics.clickTracking(this);
        e.preventDefault();
        this.setState(() => ({ hover: false }));
    }
    handleMouseIn = (e) => {
        const { currentTarget } = e;
        const { tooltipMsg } = this.state;
        const { notAvailableYetLabel } = this.props.labels;
        let msg = notAvailableYetLabel;
        if (
            currentTarget &&
            currentTarget.attributes &&
            currentTarget.attributes.length &&
            currentTarget.attributes.length >= 1 &&
            currentTarget.attributes[1].nodeValue === 'checkIn'
        ) {
            msg = tooltipMsg;
        }
        this.setState(() => ({
            hover: true,
            type: `${currentTarget.offsetLeft}px`,
            msg: msg
        }));
    };

    handleMouseOut = () => {
        this.setState(() => ({ hover: false }));
    };

    handleCheckin = () => {
        analytics.clickTracking(this);
        window.open(this.props.services.urls.onlineCheckinApi);
    };

    handlePrintETicket = () => {
        analytics.clickTracking(this);
        const { services } = this.props;
        const { toDoListApi } = services.urls;
        const locale = getConfig('locale', '');
        const userData = SessionStorage.getItem('userData');
        const { paxNumber } = userData.customer;
        updateToDoList(toDoListApi, 'e-ticket', paxNumber)
            .then(() => {
                const valueFromAEMeTicketSwitch = getConfig('isETicketMicroServiceEnabled');
                const isCookieExistForMicroServicesEticket = checkCookie('microservicesEticket');
                const valueOfMicroServicesEticketAPIcall = isCookieExistForMicroServicesEticket && getCookie('microservicesEticket');
                if (valueFromAEMeTicketSwitch || (isCookieExistForMicroServicesEticket && valueOfMicroServicesEticketAPIcall == 'true')) {
                    const stringValue = `${locale}_${userData.bookingRef}_${
                        userData.customer.firstName
                    }_${userData.customer.lastName}`;
                    const encodedUriString = encodeURI(window.btoa(stringValue));
                    const url = `eticketpdfpage?id=${encodedUriString}`;
                    const link = typeof document !== 'undefined' && document.createElement('a');
                    link.href = url;
                    link.target = '_blank';
                    link.click();
                } else {
                    printEticketWithoutMicroservices()
                }
            })
            .catch((err) => { });
    };
    handlePrintLuggageLabel = () => {
        analytics.clickTracking(this);
        const { services } = this.props;
        const { toDoListApi } = services.urls;
        const locale = getConfig('locale', '');
        const userData = SessionStorage.getItem('userData');
        const { paxNumber } = userData.customer;
        updateToDoList(toDoListApi, 'luggageLabel', paxNumber)
            .then(() => {
                const valueFromAEMluggageLabelSwitch = getConfig(
                    'isLuggagelabelMicroServiceEnabled'
                );
                const isCookieExistForMicroServicesLuggageLabel = checkCookie(
                    'microservicesLuggageLabel'
                );
                const valueOfMicroServicesLuggageLabelAPIcall =
                    isCookieExistForMicroServicesLuggageLabel &&
                    getCookie('microservicesLuggageLabel');
                if (
                    valueFromAEMluggageLabelSwitch ||
                    (isCookieExistForMicroServicesLuggageLabel &&
                        valueOfMicroServicesLuggageLabelAPIcall == 'true')
                ) {
                    const stringValue = `${locale}_${userData.bookingRef}_${
                        userData.customer.firstName
                    }_${userData.customer.lastName}`;
                    const encodedUriString = encodeURI(
                        window.btoa(stringValue)
                    );
                    const url = `luggagelabelpdfpage?id=${encodedUriString}`;
                    const link = document.createElement('a');
                    link.href = url;
                    link.target = '_blank';
                    link.click();
                } else {
                    printLuggageLabel()
                }
            })
            .catch((err) => { });
    };

    handleApiError = (error) => {
        //console.log(error);
    };

    renderNextSteps() {
        const { props, state } = this;
        const { labels } = props;
        const { hover, type, onlineCheckinAvailability, msg } = state;
        let apiCheck = this.state.personalInfoCheck;
        const checkinAvailable = this.state.checkInAvaialbleFlag;
        const checkinPossible = onlineCheckinAvailability;
        const luggageLabelAvailable = apiCheck && checkIfPrintIsAvailable('luggageLabel');
        const eTicketsAvailable = apiCheck && checkIfPrintIsAvailable('eTicket');
        const display = hover ? 'block' : 'none';

        const steps = [
            {
                label: labels.checkInLabel,
                icon: 'checkin',
                type: 'checkIn',
                available: checkinAvailable,
                possible: checkinPossible,
                onClick: checkinAvailable ? this.handleCheckin : ''
            },
            {
                label: labels.eTicketsLabel,
                icon: 'tickets',
                type: 'eTicket',
                available: eTicketsAvailable,
                onClick: eTicketsAvailable ? this.handlePrintETicket : ''
            },
            {
                label: labels.printLuggageLabel,
                icon: 'luggage',
                type: 'luggageLabel',
                available: luggageLabelAvailable,
                onClick: luggageLabelAvailable
                    ? this.handlePrintLuggageLabel
                    : ''
            }
        ];

        return (
            <div className="nextSteps">
                <div className={`tooltip__dd`} style={{ display, left: type }}>
                    <a className="tooltip__close" onClick={this.closeTooltip} />
                    <p> {msg} </p>
                </div>
                <ul className="nextSteps__list" tabIndex="0">
                    {steps.map(this.renderStep)}
                </ul>
                <a href="#" className="" onClick={this.handleModalOpen}>
                    <p>{labels.pleaseCompleteLabel + ' '}</p>
                    <span>{labels.clickHereLabel}</span>
                </a>
            </div>
        );
    }

    checkIfCheckInAvailable = () => {
        const { labels } = this.props;
        const apikeyMycruise2 = getConfig('apikeyMycruise2', '');
        const userData = SessionStorage.getItem('userData');
        const { firstName = '', lastName = '', birthDate = '' } = userData.customer
        const requestBody = {
            bookingno: userData.bookingRef,
            firstname: firstName,
            lastname: lastName,
            dateofbirth: birthDate.replace(/\-/g, '')
        };
        const olcDetailsApi = this.props.services.urls.olcDetailsApi;
        fetchData(olcDetailsApi, {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
                'X-Source-Identity-Token-0': apikeyMycruise2,
                'Content-Type': 'application/json'
            }
        }).then((response) => {
            if (
                response.statuscode == "00" &&
                response.onlineCheckinAvailability &&
                response.onlineCheckinAvailability.infoCode == "80"
            ) {
                this.setState(() => ({
                    checkInAvaialbleFlag: true,
                    onlineCheckinAvailability: true,
                    tooltipMsg: response.onlineCheckinAvailability.infoMessages
                }));
            } else if (
                response.statuscode == "00" &&
                response.onlineCheckinAvailability &&
                response.onlineCheckinAvailability.infoCode == "81"
            ) {
                this.setState(() => ({
                    checkInAvaialbleFlag: false,
                    onlineCheckinAvailability: true,
                    tooltipMsg: labels.checkInNotAvailableLabel || response.onlineCheckinAvailability.infoMessages
                }));
            } else if (
                response.statuscode == "00" &&
                response.onlineCheckinAvailability &&
                response.onlineCheckinAvailability.infoCode == "82"
            ) {
                this.setState(() => ({
                    checkInAvaialbleFlag: false,
                    onlineCheckinAvailability: true,
                    tooltipMsg: labels.checkInOpeningSoonLabel || response.onlineCheckinAvailability.infoMessages
                }));
            } else if (
                response.statuscode == "00" &&
                response.onlineCheckinAvailability &&
                response.onlineCheckinAvailability.infoCode == "83"
            ) {
                this.setState(() => ({
                    checkInAvaialbleFlag: false,
                    onlineCheckinAvailability: true,
                    tooltipMsg: labels.checkInClosedLabel || response.onlineCheckinAvailability.infoMessages
                }));
            } else if (
                response.statuscode !== "00"
            ) {
                this.setState(() => ({
                    checkInAvaialbleFlag: false,
                    onlineCheckinAvailability: false,
                    tooltipMsg: response.statusmessage
                }));
            }
        })
            .catch((err) => {

            })
    };

    renderStep = ({ type, possible, available, label, onClick, icon }) =>
        (type !== 'checkIn' || possible) && (
            <li
                className={`nextSteps__item ${available ? 'active' : ''}`}
                onMouseOver={!available ? this.handleMouseIn : ''}
                onMouseOut={!available ? this.handleMouseOut : ''}
                data-type={type}
            >
                <a
                    href="#"
                    onClick={onClick}
                    className={`iconSummary icon-ico-${icon}`}
                    tabIndex="-1"
                >
                    {label}
                </a>
            </li>
        );

    handleModalOpen = () => {
        analytics.clickTracking(this);
        this.setState(
            () => ({ showModal: true }),
            () => {
                const { ctaType, title } = this.props;
                analytics.overlayLoad('screenLoad', {
                    contentType: ctaType,
                    contentName: analytics.handleSpecials(title)
                });
            }
        );
    };

    handleModalClose = () => {
        this.setState(() => ({ showModal: false }));
    };

    render() {
        const {
            labels,
            loyaltyTiers,
            services,
            primaryImageUrl,
            defaultImageUrl,
            childComponents,
            ctaType
        } = this.props;
        const { showThrobber, showModal, overlayText } = this.state;
        const titleProps = extractChildComponent(
            childComponents,
            'titleH1Mycruise'
        );
        const locale = "en_GB";

        const cruiseData = SessionStorage.getItem('cruiseData') || {};
        const userData = SessionStorage.getItem('userData') || {};

        const { sailingId = '', cruiseName = '' } = cruiseData;
        const { customer = {}, bookingRef = '', brandCode = '' } = userData;
        const { pastGuestNumber = '' } = customer;

        const url =
            typeof primaryImageUrl !== 'undefined' &&
                typeof sailingId !== 'undefined'
                ? `${primaryImageUrl}/${sailingId}/images/${locale}_${sailingId}`
                : `${defaultImageUrl}`;
        const image = {
            alt: "",
            0: {
                '1x': `${url}_mobile_1x.jpg`,
                '2x': `${url}_mobile_2x.jpg`
            },
            376: {
                '1x': `${url}_tablet_1x.jpg `,
                '2x': `${url}_tablet_2x.jpg `
            },
            769: {
                '1x': `${url}_desktop_1x.jpg`,
                '2x': `${url}_desktop_2x.jpg`
            }
        };

        return (
            <div className="">
                <div className="tileH1-section">
                    <TitleH1Mycruise {...titleProps.attributes} />
                    <h4>
                        {labels.bookingNumberLabel} {bookingRef}
                    </h4>
                    <LoyaltyTierSlot
                        label={labels.loyaltyTierLabel}
                        loyaltyApi={services.urls.loyaltyApi}
                        pastGuestNumber={pastGuestNumber}
                        brandCode={brandCode}
                        loyaltyTiers={loyaltyTiers}
                    />
                </div>

                <div className="bookingSummary">
                    <Image {...image} alt={cruiseName} />
                    <div className="bookingSummary__info">
                        {cruiseData && this.renderInfo()}
                        {this.renderNextSteps()}
                    </div>
                    {showThrobber && (
                        <div className="throbberOverlay">
                            <Loader show={showThrobber} />
                        </div>
                    )}
                </div>
                {showModal && (
                    <Modal
                        mounted={showModal}
                        onExit={this.handleModalClose}
                        contentLabel="Necessary steps"
                        ctaType={ctaType}
                        underlayClass=""
                    >
                        <div
                            dangerouslySetInnerHTML={{
                                __html: overlayText
                            }}
                            className="overlay-text"
                        />
                    </Modal>
                )}
            </div>
        );
    }
}

export default bookingSummaryMycruise;
