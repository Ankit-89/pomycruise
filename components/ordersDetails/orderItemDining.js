import React from 'react';
import { plainDateFormat, sameDateFormat } from '../commons/CUK/dateFormat';
import sessionStorage from '../commons/CUK/session-storage';

class orderItemDining extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hover: false
        };
    }

    cancel = (e) => {
        const { openOverlay, generalProductInfo, code } = this.props;
        e.preventDefault();
        openOverlay && openOverlay('group', generalProductInfo.groupID, code);
    };

    render() {
        const {
            totPrice,
            labels,
            accesibilityLabels,
            generalProductInfo: {
                product,
                quantity,
                attributes,
                noOfGuests,
                basePrice
            },
            currSymbol,
            totDiscount,
            isCancelled,
            isCancelling,
            isCancellable
        } = this.props;

        return (
            <div
                className={`productRow ${
                    isCancelled || isCancelling ? 'isCancelled' : ''
                } 
        `}
            >
                <div className="productRow__msg">
                    {labels.cancelledItemLabel}
                </div>
                <div className="productRow__header">
                    <span className="productRow__personalInfo bodyText">
                        {labels.diningLabel}
                    </span>
                    <a className="productRow__title" href={product.url ? product.url : '#'}><h3 className="productRow__title">{attributes.name}</h3></a>
                    <span className="bodyText productRow__date">
                        {sameDateFormat(
                            new Date(attributes.startDateTime),
                            'MMM DD  | hh:mm A'
                        )}
                    </span>
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
                    <a className="productRow__img" href={product.url ? product.url : '#'} title={accesibilityLabels.imageAlt ? accesibilityLabels.imageAlt : ''}>
                        <img className="" src={product.primaryImageUrl} />
                    </a>
                    <div className="productRow__col">
                        <h5>
                            {noOfGuests} {labels.guestsLabel}
                        </h5>
                        {/* <ul className="productRow__ul">
                            {product.mealPeriod && (
                                <li>
                                    <span>{labels.mealPeriodLabel} </span>
                                    <span className="productRow__value">
                                        {' ' + product.mealPeriod.name}
                                    </span>
                                </li>
                            )}
                            {product.event &&
                                product.event.eventType === 'COOKERY' && (
                                    <li>
                                        <span>{labels.eventLabel} </span>
                                        <span className="productRow__value">
                                            {' ' + product.event.name}
                                        </span>
                                    </li>
                                )}
                            {product.event &&
                                product.event.eventType === 'LIMELIGHT' && (
                                    <li>
                                        <span>{labels.entertainerTitle} </span>
                                        <span className="productRow__value">
                                            {' ' + product.event.name}
                                        </span>
                                    </li>
                                )}
                            <li>
                                <span>{labels.guestNumberLabel} </span>
                                <span className="productRow__value">
                                    {' ' + noOfGuests}
                                </span>
                            </li>
                        </ul> */}
                    </div>
                    <div className="productRow__col dining">
                        <h5>
                            {basePrice.formattedValue} {'X'} {noOfGuests}
                        </h5>
                    </div>
                    <div className="productRow__col pricing">
                        <h5>{labels.pricingLabel}</h5>
                        <p>
                            <span className="label__col">
                                {labels.subtotalLabel}
                            </span>
                            <span className="value__col">
                                {`${currSymbol}${totPrice.toFixed(2)}`}
                            </span>
                        </p>
                        {totDiscount > 0 && (
                            <p>
                                <span className="label__col">
                                    {labels.loyaltyDiscountLabel}
                                </span>
                                <span className="value__col">
                                    {` - ${currSymbol}${totDiscount.toFixed(
                                        2
                                    )}`}
                                </span>
                            </p>
                        )}
                        <p className="total-price">
                            <span className="label__col">
                                {labels.totalLabel}
                            </span>
                            <span className="value__col">
                                {`${currSymbol}${(
                                    totPrice - totDiscount
                                ).toFixed(2)}`}
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        );
    }
}

export default orderItemDining;
