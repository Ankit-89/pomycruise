'use strict';

import React from 'react';
import moment from 'moment';
import { plainDateFormat } from '../commons/CUK/dateFormat';
import CurrencyFormat from '../commons/CUK/currencyFormat';
import analytics from '../commons/CUK/analytics';
import SessionStorage from '../commons/CUK/session-storage';
import { calculateAge, calculateDiffDays } from '../commons/CUK/dateFormat';
import { log } from 'debug';

class orderitementertainment extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hover: false
        };
        debugger;
    }

    cancel = (e) => {
        const { openOverlay, generalProductInfo, code } = this.props;
        e.preventDefault();
        debugger;
        openOverlay && openOverlay('group', generalProductInfo.groupID, code);
    };
    handleRemove = (e) => {
        const { data, onRemove } = this.props;
        const { groupID } = data[0];
        debugger;
        onRemove && onRemove(e, groupID);
    };

    renderPaxName = (p, i) => {
        const { title, firstName, lastName } = p;
        return (
            <span
                key={i}
                className="productRow__userName"
            >{`${title} ${firstName} ${lastName}`}</span>
        );
    };
    renderPaxSeatNo = (p, i) => {
        const allocatedSpace = p.allocatedSpace ? p.allocatedSpace : '';
        return (
            <span key={i} className="productRow__userName">
                {allocatedSpace}
            </span>
        );
    };

    checkPaxSeatNo = (p, i) => {
        const { allocatedSpace } = p;
        if (allocatedSpace) {
            return true;
        } else {
            return false;
        }
    };

    findPassengersName = (data) => {
        const { passengers } = SessionStorage.getItem('header');
        data.map((p) => {
            const pn = p.paxNo;
            passengers.forEach((passenger) => {
                if (+passenger.paxNumber === +pn) {
                    p.title = passenger.title;
                    p.firstName = passenger.firstName;
                    p.lastName = passenger.lastName;
                }
            });
        });
        return data;
    };

    render() {
        // const { labels, data, removed } = this.props;
        const {
            totPrice,
            labels,
            accesibilityLabels,
            generalProductInfo,
            currSymbol,
            totDiscount,
            isCancelled,
            isCancelling,
            isCancellable,
            singleProduct,
            hairLengthLabels
        } = this.props;
        const data = Object.entries(singleProduct)[0][1];
        debugger;
        let passengerList = Array.isArray(data[0].passenger)
            ? data[0].passenger
            : [data[0].passenger];
        if (
            data[0].additionalPassengers &&
            data[0].additionalPassengers.length
        ) {
            passengerList = [...passengerList, ...data[0].additionalPassengers];
        }
        data[0]['allpassenger'] = [];
        // data[0].passenger = this.findPassengersName(passengerList);
        data[0]['allpassenger'] = this.findPassengersName(passengerList);

        const { subtotalPrice, loyalityDiscount, totalPrice } = data[0];
        const { groupID, product, basePrice, status, attributes } = data[0];
        const {
            url,
            code,
            thumbnail,
            primaryImageUrl, // CK
            duration,
            name
        } = product;
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
        const { startDateTime } = attributes;
        const { currencyIso } = basePrice;
        const thumbnail_logo = thumbnail || primaryImageUrl; // CK

        return (
            <li
                className={`productRow ${
                    isCancelled || isCancelling ? 'isCancelled' : ''
                } 
    `}
                data-groupID={groupID}
            >
                <div>
                    <div>
                        <div className="productRow__msg">
                            {labels.cancelledItemLabel}
                        </div>
                        <div className="productRow__header">
                            <span className="productRow__personalInfo bodyText">
                                {labels.entertainmentLabel}
                            </span>
                            <a className="productRow__title" href={url} >
                                {attributes.name}
                            </a>
                            {!isCancelled &&
                                !isCancelling && (
                                    <span className="bodyText productRow__dateTime">
                                        {plainDateFormat(
                                            new Date(
                                                startDateTime.substring(
                                                    0,
                                                    startDateTime.length - 1
                                                )
                                            ),
                                            'MMM DD | h:mm A'
                                        )}
                                    </span>
                                )}

                            {!isCancelled &&
                                !isCancelling &&
                                isCancellable && (
                                    <a
                                        href="#"
                                        className="productRow__cta"
                                        onClick={this.cancel}
                                    >
                                        <span>{labels.cancelLabel}</span>
                                    </a>
                                )}

                            {isCancelled && (
                                <span className="cancelled">
                                    {labels.cancelledLabel}
                                </span>
                            )}
                            {isCancelling && (
                                <span className="cancelled">
                                    {labels.cancellingLabel}
                                </span>
                            )}
                        </div>
                        <div className="productRow__body">
                            <a className="productRow__img" href={url} title={accesibilityLabels.imageAlt ? accesibilityLabels.imageAlt : ''}>
                                <img
                                    src={thumbnail_logo.replace(/\\/g, '')}
                                />
                            </a>

                            <div className="productRow__col entertainment">
                                <h5>{labels.guestLabel}</h5>
                                <ul className="productRow__ul">
                                    {data[0].allpassenger.map((p, i) => (
                                        <li>
                                            <span className="productRow__value">
                                                {this.renderPaxName(p, i)}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            {/* <div className="productRow__col entertainment">
                                <h5>{labels.seatLabel}</h5>
                                <ul className="productRow__ul">
                                    {data[0].allpassenger.map((p, i) => (
                                        <li>
                                            <span className="productRow__value">
                                                {this.renderPaxSeatNo(p, i)}
                                            </span>
                                            {this.checkPaxSeatNo(p, i) ? (
                                                <span className="productRow__value holidaylabel">
                                                    <span className="productRow__holidaylabel">
                                                        {`${
                                                            labels.includedholidayLabel
                                                        }`}
                                                    </span>
                                                </span>
                                            ) : (
                                                ''
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div> */}
                            <div className="productRow__col entertainment pricing">
                                <h5>{labels.pricingLabel}</h5>
                                <p key="shoppingcart-item-pricing-subtotal">
                                    <span className="label__col">
                                        {`${labels.subtotalLabel}`}
                                    </span>
                                    <span className="value__col">
                                        <CurrencyFormat
                                            value={totPrice}
                                            currencyCode={currencyIso}
                                            decimal={true}
                                            decimalSup={true}
                                        />
                                    </span>
                                </p>
                                {totDiscount > 0 && (
                                    <p key="shoppingcart-item-pricing-loyalitydiscount">
                                        <span className="label__col">
                                            {`${labels.loyaltyDiscountLabel}:`}
                                        </span>
                                        <span className="value__col">
                                            -<CurrencyFormat
                                                value={totDiscount}
                                                currencyCode={currencyIso}
                                                decimal={true}
                                                decimalSup={true}
                                            />
                                        </span>
                                    </p>
                                )}
                                <p key="cruiseduration">
                                    <span className="label__col">
                                        {`${labels.cruisedurationLabel}:`}
                                    </span>
                                    <span className="value__col">
                                        {`${diffDays} ${labels.daysLabel}`}
                                    </span>
                                </p>
                                <p
                                    className="total-price"
                                    key="shoppingcart-item-pricing-total"
                                >
                                    <span className="label__col">
                                        {`${labels.totalLabel}`}
                                    </span>
                                    <span className="value__col">
                                        <CurrencyFormat
                                            value={totPrice - totDiscount}
                                            currencyCode={currencyIso}
                                            decimal={true}
                                            decimalSup={true}
                                        />
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </li>
        );
    }
}
export default orderitementertainment;
