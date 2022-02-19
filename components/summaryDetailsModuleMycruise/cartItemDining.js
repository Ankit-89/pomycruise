'use strict';

import React from 'react';
import { plainDateFormat } from '../commons/CUK/dateFormat';
import CurrencyFormat from '../commons/CUK/currencyFormat';
import SessionStorage from '../commons/CUK/session-storage';
import analytics from '../commons/CUK/analytics';

class cartItemDining extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            removed: false
        };
    }
    removeNotification = (e) => {
        analytics.clickTracking(this)
        e.preventDefault();
        e.currentTarget.parentNode.remove();
    };

    closeTooltip = (e) => {
        e.preventDefault();
        this.setState({ hover: false });
    };
    handleMouseIn = () => {
        this.setState({ hover: true });
    };

    handleMouseOut = () => {
        this.setState({ hover: false });
    };
    handleRemove = (e) => {
        const { data, onRemove } = this.props;
        const { groupID } = data[0];
        onRemove && onRemove(e, groupID);
    };

    render() {
        const style = {
            color: '#666',
            textAlign: 'left',
            fontSize: '80%',
            width: '100%',
            fontFamily: 'PraxisCom-Regular',
        };
        const { labels, data, removed, diningBasePath, accesibilityLabels } = this.props;
        const { subtotalPrice, loyalityDiscount, totalPrice } = data.pricing;
        const {
            groupID,
            product: {
                attributes: { name, startDateTime, mealPeriod, event, baseProduct },
                code,
                thumbnail,
                url,
                primaryImageUrl // CK
            },
            quantity,
            noOfGuests,
            basePrice: { currencyIso },
            basePrice: { formattedValue },
            status
        } = data[0];

        const thumbnail_logo = thumbnail || primaryImageUrl; // CK

        const notification = {
            __html: `${labels.removeNotificationLabel.replace(
                '{item}',
                `<a href='#'>${name}</a>`
            )}`
        };
        const userData = SessionStorage.getItem('userData');
        const { shipCode } = userData;

        if (!this.props.hasZeroValueItem && !removed && subtotalPrice - loyalityDiscount < 1) {
            const { onZeroValFound } = this.props;
            onZeroValFound && onZeroValFound();
        }

        return (
            <li
                className={
                    status && status != 'ACTIVE'
                        ? 'expired-wrapper productRow'
                        : 'productRow'
                }
                data-groupID={groupID}
            >
                {removed ? (
                    <div className="productRow__removeNotification">
                        <span dangerouslySetInnerHTML={notification} />
                        <span
                            className="close"
                            onClick={this.removeNotification}
                        />
                    </div>
                ) : (
                    <div
                        className={
                            status && status != 'ACTIVE' ? 'expired-main' : ''
                        }
                    >
                        <div className="productRow__header">
                            <span className="productRow__personalInfo bodyText">
                                {labels.diningLabel}
                            </span>
                            <a
                                className="productRow__title"
                                href={`${url}`}
                            >
                                {name}
                            </a>
                            <span className="bodyText productRow__dateTime">
                                {plainDateFormat(
                                    new Date(
                                        startDateTime.substring(
                                            0,
                                            startDateTime.length - 1
                                        )
                                    ),
                                    'MMM DD  | h:mm A'
                                )}
                            </span>
                            {status && status != 'ACTIVE' ? (
                                <a
                                    href="#"
                                    style={{ cursor: 'default' }}
                                    className="productRow__cta"
                                >
                                    <span>{labels.expiredLabel}</span>
                                </a>
                            ) : (
                                <a
                                    href="#"
                                    className="productRow__cta"
                                    onClick={this.handleRemove}
                                >
                                    <span>{labels.removeLabel}</span>
                                </a>
                            )}
                        </div>
                        <div className="productRow__body">
                            <a className="productRow__img" href={`${url}`} title={accesibilityLabels.imageAlt ? accesibilityLabels.imageAlt : ''}>
                                <img src={thumbnail_logo} />
                            </a>

                            <div className="productRow__col dining">
                                <h5>
                                    {noOfGuests} {labels.guestsLabel}
                                </h5>
                                {/* <ul className="productRow__ul">
                                    {mealPeriod && (
                                        <li>
                                            <span>
                                                {labels.mealPeriodLabel}
                                            </span>
                                            <span className="productRow__value">
                                                {' ' + mealPeriod}
                                            </span>
                                        </li>
                                    )}
                                    {event && (
                                        <li>
                                            <span>
                                                {event.eventType === 'COOKERY'
                                                    ? labels.eventLabel
                                                    : labels.entertainerTitle}
                                            </span>
                                            <span className="productRow__value">
                                                {' ' + event.name}
                                            </span>
                                        </li>
                                    )}
                                    <li>
                                        <span>{labels.guestNumberLabel} </span>
                                        <span className="productRow__value">
                                            {noOfGuests}
                                        </span>
                                    </li>
                                </ul> */}
                            </div>
                            <div className="productRow__col dining">
                                <h5>
                                    {formattedValue} {'X'} {noOfGuests}
                                </h5>
                            </div>
                            <div className="productRow__col dining pricing">
                                <h5>{labels.pricingLabel}</h5>
                                <p key="shoppingcart-item-pricing-subtotal">
                                    <span className="label__col">
                                        {`${labels.subtotalLabel}:`}
                                    </span>
                                    <span className="value__col">
                                        <CurrencyFormat
                                            value={subtotalPrice}
                                            currencyCode={currencyIso}
                                            decimal={true}
                                            decimalSup={true}
                                        />
                                    </span>
                                </p>
                                {loyalityDiscount > 0 && (
                                    <p key="shoppingcart-item-pricing-loyalitydiscount">
                                        <span className="label__col">
                                            {`${labels.loyaltyDiscountLabel}:`}
                                        </span>
                                        <span className="value__col">
                                            -<CurrencyFormat
                                                value={loyalityDiscount}
                                                currencyCode={currencyIso}
                                                decimal={true}
                                                decimalSup={true}
                                            />
                                        </span>
                                    </p>
                                )}
                                <p
                                    className="total-price"
                                    key="shoppingcart-item-pricing-total"
                                >
                                    <span className="label__col">
                                        {labels.totalLabel}
                                    </span>
                                    <span className="value__col">
                                        <CurrencyFormat
                                            value={
                                                subtotalPrice - loyalityDiscount
                                            }
                                            currencyCode={currencyIso}
                                            decimal={true}
                                            decimalSup={true}
                                        />
                                    </span>
                                </p>
                            </div>
                            {subtotalPrice - loyalityDiscount < 1 && (
                                <p style={style}>
                                    {' '}
                                    {labels.zeroValueProductInCartLabelone}{' '}
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </li>
        );
    }
}
export default cartItemDining;
