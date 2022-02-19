import React from 'react';
import { plainDateFormat } from '../commons/CUK/dateFormat';
import { sameDateFormat } from '../commons/CUK/dateFormat';

class orderItemSpa extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hover: false
        };
    }

    cancel = (e) => {
        const {
            openOverlay,
            generalProductInfo,
            code
        } = this.props;
        e.preventDefault();
        openOverlay && openOverlay('group', generalProductInfo.groupID, code);
    };

    render() {
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
        const entriesArray = Object.entries(singleProduct)[0][1];

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
                        {labels.spaLabel}
                    </span>
                    <a className="productRow__title" href={generalProductInfo.product.url ? generalProductInfo.product.url : '#'}>
                        <h3 className="productRow__title">
                            {generalProductInfo.attributes.name}
                        </h3>
                    </a>
                    {generalProductInfo.attributes.offeringType !==
                        'MULTI_DAY_PASS' && (
                        <span className="bodyText productRow__date">
                            {generalProductInfo.attributes.offeringType !==
                            'ONE_DAY_PASS'
                                ? sameDateFormat(
                                      new Date(
                                          generalProductInfo.attributes.startDateTime
                                      ),
                                      'MMM DD  | hh:mm A'
                                  )
                                : sameDateFormat(
                                      new Date(
                                          generalProductInfo.attributes.startDateTime
                                      ),
                                      'MMM DD'
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
                    <a href={generalProductInfo.product.url ? generalProductInfo.product.url : '#'} title={accesibilityLabels.imageAlt ? accesibilityLabels.imageAlt : ''} className="productRow__img">
                        <img className="" src={generalProductInfo.product.primaryImageUrl} />
                    </a>
                    <div className="productRow__col">
                        <h5>{labels.treatmentLabel}</h5>
                        <ul className="productRow__ul">
                            <li>
                                <span>{labels.durationLabel} </span>
                                <span className="productRow__value">
                                    {
                                        generalProductInfo.attributes
                                            .treatmentDuration
                                    }
                                </span>
                                <span>{labels.minLabel} </span>
                            </li>
                            {generalProductInfo.product.variation && (
                                <li>
                                    <span>{labels.variation} </span>
                                    <span className="productRow__value">
                                        {hairLengthLabels[generalProductInfo.product.variation]}
                                    </span>
                                </li>
                            )}
                            <li>
                                <span>{labels.guestLabel} </span>
                                <span className="productRow__value">
                                    {entriesArray.map((entry, index) => {
                                        const {
                                            status,
                                            passenger: {
                                                title,
                                                firstName,
                                                lastName
                                            }
                                        } = entry;
                                        return (
                                            <span
                                                key={`${index}entry`}
                                                className={`${status}`}
                                            >
                                                {`${title} ${firstName} ${lastName}`}
                                            </span>
                                        );
                                    })}
                                </span>
                            </li>
                        </ul>
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
                                    {` - ${currSymbol}${totDiscount.toFixed(2)}`}
                                </span>
                            </p>
                        )}
                        <p className="total-price">
                            <span className="label__col">
                                {labels.totalLabel}
                            </span>
                            <span className="value__col">
                                {`${currSymbol}${(totPrice - totDiscount).toFixed(2)}`}
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        );
    }
}

export default orderItemSpa;
