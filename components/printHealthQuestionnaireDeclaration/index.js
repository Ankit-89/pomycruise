'use strict';

import React from 'react';
import SessionStorage from '../commons/CUK/session-storage';
import { getConfig } from '../commons/CUK/utilities';
import { calculateAge } from '../commons/CUK/dateFormat';
import moment from 'moment';

class printHealthQuestionnaireDeclaration extends React.Component {
    constructor(props) {
        super(props);
        this.brand = getConfig('brand', '');
        this.state = {
            status: 'success',
            passenger: []
        };
    }

    componentDidMount() {
        // const printDeclaration = SessionStorage.getItem('printDeclaration');
        const isIE = /*@cc_on!@*/ false || !!document.documentMode;
        let key;
        if (isIE) {
            key = this.decodeUrlParam('id');
        } else {
            const params = new URLSearchParams(window.location.search);
            key = params.get('id');
        }
        key = window.atob(key);
        const printDeclarationData = localStorage.getItem(
            'printDeclarationData'
        )
            ? JSON.parse(localStorage.getItem('printDeclarationData'))
            : {};
        const {
            status,
            paxNumber,
            passengers,
            embarkationDate,
            bookingRef,
            cabinNumber,
            shipName,
            sailingId
        } = printDeclarationData[`${key}`];
        const printStatus = status == 'PASS' ? 'success' : 'fail';
        const passenger = passengers.filter((singlePassenger) => {
            const passengerBirth = new Date(singlePassenger.birthDate);
            const embarkDate = new Date(embarkationDate);
            const ageAtEmbark = calculateAge(
                passengerBirth.getTime(),
                embarkDate.getTime()
            );
            if (((paxNumber == '1') && (ageAtEmbark < 18)) || paxNumber == singlePassenger.paxNumber) {
                return singlePassenger;
            }
        });

        this.setState({
            passenger: passenger,
            status: printStatus,
            paxNumber: paxNumber,
            embarkationDate: embarkationDate,
            bookingRef: bookingRef,
            cabinNumber: cabinNumber,
            shipName: shipName,
            sailingId: sailingId
        });

        setTimeout(() => {
            window.print();
        }, 5000);
    }

	//renderHeaderSection
    renderHeaderSection(status) {
        const { labels: {
            printHQDeclNotClearedLabel,
            printHQDeclClearedLabel,
        } } = this.props;

        const message = status == 'success' ? printHQDeclClearedLabel : printHQDeclNotClearedLabel
        return (
            <div className="header_container">
                <div className="header_logo">
                    <img src={"https://my.pocruises.com/content/dam/po/pno_logo.svg"} alt={""} />
                </div>
                {status == 'success' && <div className="Status_badge">
                    <div className="badge">
                        <span className="checkmark">
                            <div className="checkmark_circle"></div>
                            <div className="checkmark_stem"></div>
                            <div className="checkmark_kick"></div>
                        </span>
                        {/* <span className="badge_ellipse"></span> */}
                    </div>
                    <label className="badge_label">{message}</label>
                </div>}
                {status !== 'success' && <div className="Status_badge_fail">
                    <div className="badge">
                        <span className="badge_ellipse">&#x2298;</span>
                    </div>
                    <label className="badge_label">{message}</label>
                </div>}
            </div>
        )
    }

    renderPassangerSection() {
        const { labels: {
            printHQDeclPassengersLabel,
            printHQDeclCabinNumberLabel,
            printHQDeclBookingRefLabel,
            printHQDeclShipnameLabel,
            printHQDeclEmbarkationDateLabel,
            printHQDeclCruiseNumberLabel,
        } } = this.props;

        const {
            passenger,
            bookingRef,
            cabinNumber,
            embarkationDate,
            shipName,
            sailingId
        } = this.state;

        const embarkation_date = moment(embarkationDate, 'YYYY-MM-DD').format(
            'MMM DD gggg'
        );

        return (
            <div className="container_box">
                <div className="rectangle_11">
                    <div className="col-60">
                        <p className="passenger_label">{printHQDeclPassengersLabel}</p>
                        {passenger.map((singlePassenger, index) => (<p className="passenger_name" key={index}>{`${singlePassenger.title} ${singlePassenger.firstName} ${singlePassenger.lastName}`}</p>))}
                    </div>
                    <div className="col-40">
                        <div>
                            <p className="label_name">{printHQDeclCabinNumberLabel}</p>
                            <p className="label_value">{cabinNumber}</p>
                        </div>
                        <div>
                            <p className="label_name">{printHQDeclBookingRefLabel}</p>
                            <p className="label_value">{bookingRef}</p>
                        </div>
                    </div>
                </div>
                <div className="rectangle_12">
                    <div>
                        <p className="label_name">{printHQDeclShipnameLabel}</p>
                        <p className="label_value">{shipName}</p>
                    </div>
                    <div>
                        <p className="label_name">{printHQDeclEmbarkationDateLabel}</p>
                        <p className="label_value">{embarkation_date}</p>
                    </div>
                    <div>
                        <p className="label_name">{printHQDeclCruiseNumberLabel}</p>
                        <p className="label_value">{sailingId}</p>
                    </div>
                </div>
            </div>
        )
    }

    renderShowAtPortLabel() {
        const { labels: {
            printHQDeclShowAtPortLabel,
        } } = this.props;
        return (
            <div className="show_at_port_label_container">
                <label className="show_at_port_label">{printHQDeclShowAtPortLabel}</label>
            </div>
        )
    }

    renderThankyouSection() {
        const { status } = this.state
        const { labels: {
            printHQDeclCompletedTitleLabel,
            printHQDeclCompletedDescriptionLabel,
            printHQDeclCompletedFailedTitleLabel,
            printHQDeclCompletedFailedDescriptionLabel
        } } = this.props;
        return (
            <div className="complete_title_container">
                <p className="complete_title">{status == 'success' ? printHQDeclCompletedTitleLabel : printHQDeclCompletedFailedTitleLabel}</p>
                <p className="complete_sub_title">{status == 'success'? printHQDeclCompletedDescriptionLabel : printHQDeclCompletedFailedDescriptionLabel}</p>
            </div>
        )
    }

    renderWarningMsgTile() {
        const { labels: {
            printHQDeclEveryAdultCompleteTitleLabel,
            printHQDeclEveryAdultCompleteDescriptionLabel,
        } } = this.props;
        return (
            <div className="unable_to_travel_container">
                <div className="content_container">
                    <p className="content_title">{printHQDeclEveryAdultCompleteTitleLabel}</p>
                    <p className="content_sub_title">{printHQDeclEveryAdultCompleteDescriptionLabel}</p>
                </div>
            </div>
        )
    }

    renderUnableToTravelTile() {
        const { labels: {
            printHQDeclUnableToTravelTitleLabel,
            printHQDeclUnableToTravelDescriptionLabel,
            printHQDeclFaqLinkText,
            printHQDeclFaqLinkUrl
        } } = this.props;
        return (
            <div className="unable_to_travel_container">
                <div className="content_container">
                    <p className="content_title">{printHQDeclUnableToTravelTitleLabel}</p>
                    <p className="content_sub_title">
                        {`${printHQDeclUnableToTravelDescriptionLabel} `}
                        <a className='cta-secondary' href={printHQDeclFaqLinkUrl}>{printHQDeclFaqLinkText}</a>
                    </p>
                </div>
            </div>
        )
    }

    renderPrecruiseTitleSection() {
        const { status } = this.state
        const { labels: {
            printHQDeclPrecruiseTitleLabel,
            printHQDeclPrecruiseDescriptionLabel,
        } } = this.props;
        return (
            <div className="pre_cruise_section">
                <div className="title-component">
                    <div className="inner-container">
                        <span className="icon-heading" />
                    </div>
                    <p className="pre_cruise_title">{printHQDeclPrecruiseTitleLabel}</p>
                    <p className="pre_cruise_sub_title">{printHQDeclPrecruiseDescriptionLabel}</p>
                    {status == 'success' && <div className="pre_cruise_vector">
                        <div className="online_check_in">
                            <span className="icon icon-ico-checkin"></span>
                            <label>Online check in</label>
                        </div>
                        <div className="etickets">
                            <span className="icon icon-ico-tickets"></span>
                            <label>Print etickets</label>
                        </div>
                        <div className="luggage">
                            <span className="icon icon-ico-luggage"></span>
                            <label>Print luggage labels</label>
                        </div>
                    </div>}
                </div>
            </div>
        )
    }

    renderBookingCancelledTitleSection() {
        const { labels: {
            printHQDeclBookingCancelledTitleLabel,
            printHQDeclBookingCancelledDescriptionLabel,
            printHQDeclBookingCancelledDescription2Label,
        } } = this.props;
        return (
            <div className="pre_cruise_cancel_section">
                <div className="title-component">
                    <div className="inner-container">
                        <span className="icon-heading" />
                    </div>
                    <p className="pre_cruise_title">{printHQDeclBookingCancelledTitleLabel}</p>
                    <div className="pre_cruise_sub_title">
                        <p>{printHQDeclBookingCancelledDescriptionLabel}</p>
                        <p>{printHQDeclBookingCancelledDescription2Label}</p>
                    </div>
                </div>
            </div>
        )
    }

    render() {
        const { status } = this.state;

        return (
            <div className="print_declaration_container">
                {this.renderHeaderSection(status)}
                <div className="rectangle_25"></div>
                {this.renderPassangerSection()}
                <div className="rectangle_26"></div>
                {status == 'success' && this.renderShowAtPortLabel()}
                {this.renderThankyouSection()}
                {status == 'success' && this.renderWarningMsgTile()}
                {status !== 'success' && this.renderUnableToTravelTile()}
                {status == 'success' && this.renderPrecruiseTitleSection()}
                {status !== 'success' && this.renderBookingCancelledTitleSection()}
            </div>
        )
    }
}

export default printHealthQuestionnaireDeclaration;
