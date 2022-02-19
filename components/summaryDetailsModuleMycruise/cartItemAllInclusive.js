'use strict';

import React from 'react';
import SessionStorage from '../commons/CUK/session-storage';
import CurrencyFormat from '../commons/CUK/currencyFormat';
import { calculateDiffDays } from '../commons/CUK/dateFormat';
import analytics from '../commons/CUK/analytics';

class cartItemAllInclusive extends React.Component {
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

    closeTooltip(e) {
        analytics.clickTracking(this);
        e.preventDefault();
        this.setState({ hover: false });
    }
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

    renderDataItem = (p, i) => {
        const {
            passenger: { title, firstName, lastName },
            basePrice: { value, currencyIso }
        } = p;
        const { data } = this.props;
        const {
            product: {
                attributes: { name }
            }
        } = data[i];
        return (
            <li key={i}>
                <span className="productRow__userName">{`${title} ${firstName} ${lastName}`}</span>
                <span className="productRow__singlePrice">
                    <CurrencyFormat value={value} currencyCode={currencyIso} 
                     decimalSup={true}
                     decimal={true}
                     />
                </span>
                <h6 className="productRow__nameDetail">{name}</h6>
            </li>
        );
    };

    renderLoyaltyDiscount() {
        const { labels, data } = this.props;
        const { hover } = this.state;
        const display = hover ? 'block' : 'none';
        const tooltipStyle = { display };
        return (
            <div className="productRow__info">
                <div
                    className="tooltip__icon left"
                    onMouseOver={this.handleMouseIn}
                    onMouseOut={this.handleMouseOut}
                >
                    <div className="tooltip__dd" style={tooltipStyle}>
                        <a
                            className="tooltip__close"
                            onClick={(e) => this.closeTooltip(e)}
                        />
                        <p>{labels.childDiscountDescription}</p>
                    </div>
                </div>
                <p key="shoppingcart-item-pricing-loyalitydiscount">
                    <span className="label__col">{`${
                        labels.childDiscountLabel
                    }:`}</span>
                    <span className="value__col">
                        -<CurrencyFormat
                            value={data.pricing.loyalityDiscount}
                            currencyCode={data[0].basePrice.currencyIso}
                            decimal={true}
                            decimalSup={true}
                        />
                    </span>
                </p>
            </div>
        );
    }

    render() {
        const { labels, data, removed, accesibilityLabels } = this.props;

        const {
            groupID,
            product: {
                attributes: { name },
                stock: { stockLevel },
                thumbnail,
                primaryImageUrl, 
                code,
                url
            },
            basePrice
        } = data[0];

        const thumbnail_logo = thumbnail || primaryImageUrl; 

        const stockLevelNotification = labels.limitedStockNotificationLabel.replace(
            '{stock}',
            stockLevel
        );

        const notification = {
            __html: `${labels.removeNotificationLabel.replace(
                '{item}',
                `<a href='#'>${name}</a>`
            )}`
        };

        //const userData = SessionStorage.getItem('userData');
        const cruiseData = SessionStorage.getItem('cruiseData') || {};
        const {
            durationCruise = 0
        } = cruiseData;
        // const { embarkationDate, disembarkationDate } = userData;
        // let parts;

        // parts = embarkationDate.split('-');
        // const embarkationDay = new Date(parts[0], parts[1] - 1, parts[2]);
        // parts = disembarkationDate.split('-');
        // const disembarkationDay = new Date(parts[0], parts[1] - 1, parts[2]);

        // const cruiseLength =
        //     calculateDiffDays(
        //         embarkationDay.getTime(),
        //         disembarkationDay.getTime()
        //     ) - 1;

        // const cruiseLength = Math.round(
        //     (disembarkationDay.getTime() - embarkationDay.getTime()) / oneDay
        // );
        const cruiseLength  = durationCruise ;
        const subtotal = data.reduce(
            (subtotal, dataItem) => (subtotal += dataItem.basePrice.value),
            0
        );
        let total = subtotal * cruiseLength - data.pricing.loyalityDiscount;

        return (
            <li className="productRow" data-groupID={groupID}>
                {removed && (
                    <div className="productRow__removeNotification">
                        <span dangerouslySetInnerHTML={notification} />
                        <span
                            className="close"
                            onClick={this.removeNotification}
                        />
                    </div>
                )}
                {!removed && (
                    <div>
                        <div className="productRow__header">
                            <span className="productRow__personalInfo bodyText">
                                {labels.drinksLabel}
                            </span>
                            <a className="productRow__title" href={url}>
                                {labels.allInclusiveLabel}
                            </a>
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
                                <h5>{labels.guestsLabel}</h5>
                                <ul className="productRow__ul">
                                    {data.map(this.renderDataItem)}
                                </ul>
                            </div>
                            <div className="productRow__col pricing">
                                <h5>{labels.pricingLabel}</h5>
                                <p key="shoppingcart-item-pricing-subtotal">
                                    <span className="label__col">
                                        {labels.subtotalLabel}:
                                    </span>
                                    <span className="value__col">
                                        <CurrencyFormat
                                            value={subtotal}
                                            currencyCode={basePrice.currencyIso}
                                            decimalSup={true}
                                            decimal={true}
                                        />
                                    </span>
                                </p>
                                <p>
                                    <span className="label__col">
                                        {labels.cruiseLengthLabel}
                                    </span>
                                    <span className="value__col">
                                        {cruiseLength} days
                                    </span>
                                </p>
                                {data.pricing.loyalityDiscount > 0 &&
                                    this.renderLoyaltyDiscount()}
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
                                                subtotal * cruiseLength -
                                                    data.pricing
                                                        .loyalityDiscount}
                                            currencyCode={basePrice.currencyIso}
                                            decimalSup={true}
                                            decimal={true}
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
export default cartItemAllInclusive;
