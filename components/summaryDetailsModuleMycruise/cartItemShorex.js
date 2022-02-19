'use strict';

import React from 'react';
import { plainDateFormat } from '../commons/CUK/dateFormat';
import CurrencyFormat from '../commons/CUK/currencyFormat';
import analytics from '../commons/CUK/analytics';

class cartItemShorex extends React.Component {
    constructor(props) {
        super(props);
    }

    removeNotification = (e) => {
        analytics.clickTracking(this)
        e.preventDefault();
        e.currentTarget.parentNode.remove();
    };

    handleRemove = (e) => {
        const { data, onRemove } = this.props;
        const { groupID } = data[0];
        onRemove && onRemove(e, groupID);
    };

    createPassenger = (p, i) => {
        const {
            passenger: { title, firstName, lastName },
            basePrice: { value, currencyIso }
        } = p;
        return (
            <li key={i}>
                <span className="productRow__userName">{`${title} ${firstName} ${lastName}`}</span>
                <span className="productRow__singlePrice">
                    <CurrencyFormat value={value} currencyCode={currencyIso} />
                </span>
            </li>
        );
    };
    render() {
        const { labels, data, removed, accesibilityLabels } = this.props;
        const {
            pricing: { subtotalPrice, loyalityDiscount, totalPrice }
        } = data;
        const {
            limitedStockNotificationLabel,
            removeNotificationLabel,
            notOnSaleAnymoreNotificationLabel,
            outOfStockNotificationLabel,
            onHoldNotificationLabel,
            guestsLabel,
            pricingLabel,
            subtotalLabel,
            totalLabel,
            loyaltyDiscountLabel,
            removeLabel
        } = labels;
        const {
            product: {
                attributes: { name, startDateTime },
                stock: { stockLevel, stockLevelStatus },
                thumbnail,
                primaryImageUrl, // CK
                code,
                url,
                port
            },
            groupID,
            basePrice: { currencyIso },
            instanceStatus,
            error
        } = data[0];

        const thumbnail_logo = thumbnail || primaryImageUrl; // CK

        const stockLevelNotification = limitedStockNotificationLabel.replace(
            '{stock}',
            stockLevel
        );

        const notification = {
            __html: `${removeNotificationLabel.replace(
                `{item}`,
                `<a href=${url}>${name}</a>`
            )}`
        };
        const notAvailableAnymore =
            error !== undefined && error !== null ? true : false;
        const isOutOfStock = stockLevel === 0 ? true : false;
        const isLowStock = stockLevelStatus === 'lowStock' ? true : false;
        const isOnHold =
            instanceStatus && instanceStatus === 'ON_HOLD' ? true : false;
        const notificationLabel =
            !removed &&
            (notAvailableAnymore
                ? notOnSaleAnymoreNotificationLabel
                : isOnHold
                    ? onHoldNotificationLabel.replace('{productCode}', code)
                    : isOutOfStock
                        ? outOfStockNotificationLabel
                        : isLowStock
                            ? stockLevelNotification
                            : false);
        return (
            <li className="productRow" data-groupID={groupID}>
                {notificationLabel && (
                    <div className="productRow__removeNotification errorNotification">
                        <span>{notificationLabel}</span>
                        <a
                            href="#"
                            className="productRow__cta"
                            onClick={this.handleRemove}
                        >
                            <span>{removeLabel}</span>
                        </a>
                    </div>
                )}
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
                            {port && (
                                <span className="productRow__personalInfo bodyText">
                                    {port.longName}
                                </span>
                            )}
                            <a className="productRow__title" href={url}>
                                {name}
                            </a>
                            <span className="bodyText productRow__dateTime">
                                {plainDateFormat(
                                     new Date(startDateTime.substring(0, startDateTime.length - 1)),
                                    'MMM DD  | h:mm A'
                                )}
                            </span>
                            {!notAvailableAnymore &&
                                !isOutOfStock &&
                                !isLowStock && (
                                    <a
                                        href="#"
                                        className="productRow__cta"
                                        onClick={this.handleRemove}
                                    >
                                        <span>{removeLabel}</span>
                                    </a>
                                )}
                        </div>
                        <div className="productRow__body">
                            <a className="productRow__img" href={url} title={accesibilityLabels.imageAlt ? accesibilityLabels.imageAlt : ''}>
                                <img src={thumbnail_logo} />
                            </a>

                            <div className="productRow__col">
                                <h5>{guestsLabel}</h5>
                                <ul className="productRow__ul">
                                    {data.map(this.createPassenger)}
                                </ul>
                            </div>
                            <div className="productRow__col pricing">
                                <h5>{pricingLabel}</h5>
                                <p key="shoppingcart-item-pricing-subtotal">
                                    <span className="label__col">
                                        {`${subtotalLabel}`}:
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
                                        <span className="label__col">{`${loyaltyDiscountLabel}:`}</span>
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
                                    <span className="label__col">{`${totalLabel}`}</span>
                                    <span className="value__col">
                                        <CurrencyFormat
                                            value={totalPrice}
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
export default cartItemShorex;
