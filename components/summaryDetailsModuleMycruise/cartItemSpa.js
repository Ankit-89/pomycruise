'use strict';

import React from 'react';
import { plainDateFormat } from '../commons/CUK/dateFormat';
import CurrencyFormat from '../commons/CUK/currencyFormat';
import analytics from '../commons/CUK/analytics';

class cartItemSpa extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            removed: false
        };
    }
    removeNotification = (e) => {
        analytics.clickTracking(this);
        e.preventDefault();
        e.currentTarget.parentNode.remove();
    };

    handleRemove = (e) => {
        const { data, onRemove } = this.props;
        const { groupID } = data[0];
        onRemove && onRemove(e, groupID);
    };

    renderPaxName = (p, i) => {
        const { title, firstName, lastName } = p.passenger;
        return (
            <span
                key={i}
                className="productRow__userName"
            >{`${title} ${firstName} ${lastName}`}</span>
        );
    };

    render() {
        const { labels, data, removed, hairLengthLabels, accesibilityLabels } = this.props;
        const { subtotalPrice, loyalityDiscount, totalPrice } = data.pricing;
        const { groupID, product, basePrice } = data[0];
        const {
            url,
            code,
            thumbnail,
            primaryImageUrl, // CK
            duration,
            variation,
            attributes,
            name
        } = product;
        const durationTreatment = data[0].attributes.treatmentDuration;
        const treatmentName = data[0].attributes.name;
        const { startDateTime } = attributes;
        const { currencyIso } = basePrice;
        const thumbnail_logo = thumbnail || primaryImageUrl; // CK
        const notification = {
            __html: `${labels.removeNotificationLabel.replace(
                '{item}',
                `<a href='#'>${name}</a>`
            )}`
        };
        const offeringType = data[0].attributes.offeringType;
        return (
            <li className="productRow" data-groupID={groupID}>
                {removed ? (
                    <div className="productRow__removeNotification">
                        <span dangerouslySetInnerHTML={notification} />
                        <span
                            className="close"
                            onClick={this.removeNotification}
                        />
                    </div>
                ) : (
                    <div>
                        <div className="productRow__header">
                            <span className="productRow__personalInfo bodyText">
                                {labels.spaLabel}
                            </span>
                            <a className="productRow__title" href={url}>
                                {name}
                            </a>
                            {offeringType !== 'MULTI_DAY_PASS' && (
                                <span className="bodyText productRow__dateTime">
                                    {offeringType !== 'ONE_DAY_PASS'
                                        ? plainDateFormat(
                                              new Date(
                                                  startDateTime.substring(
                                                      0,
                                                      startDateTime.length - 1
                                                  )
                                              ),
                                              'MMM DD | h:mm A'
                                          )
                                        : plainDateFormat(
                                              new Date(
                                                  startDateTime.substring(
                                                      0,
                                                      startDateTime.length - 1
                                                  )
                                              ),
                                              'MMM DD'
                                          )}
                                </span>
                            )}
                            <a
                                href="#"
                                className="productRow__cta"
                                onClick={this.handleRemove}
                            >
                                <span>{labels.removeLabel}</span>
                            </a>
                        </div>
                        <div className="productRow__body">
                            <a className="productRow__img" href={url} title={accesibilityLabels.imageAlt ? accesibilityLabels.imageAlt : ''}>
                                <img src={thumbnail_logo} />
                            </a>

                            <div className="productRow__col">
                                <h5>{labels.treatmentLabel}</h5>
                                <p className="productDes">{name}</p>
                                <ul className="productRow__ul">
                                    <li>
                                        <span>{labels.durationLabel} </span>
                                        <span>
                                            {durationTreatment + ' '}
                                        </span>
                                        <span>{labels.minLabel} </span>
                                    </li>
                                    {variation && (
                                        <li>
                                            <span>{labels.variation} </span>
                                            <span className="productRow__value">
                                                {hairLengthLabels[variation]}
                                            </span>
                                        </li>
                                    )}
                                    <li>
                                        <span>{labels.guestLabel} </span>
                                        <span className="productRow__value">
                                            {data.map(this.renderPaxName)}
                                        </span>
                                    </li>
                                </ul>
                            </div>
                            <div className="productRow__col pricing">
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
                                        {`${labels.totalLabel}`}
                                    </span>
                                    <span className="value__col">
                                        <CurrencyFormat
                                            value={subtotalPrice - loyalityDiscount}
                                            currencyCode={currencyIso}
                                            decimal={true}
                                            decimalSup={true}
                                            
                                        />
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </li>
        );
    }
}
export default cartItemSpa;
