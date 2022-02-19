import React from 'react';
import { plainDateFormat } from '../commons/CUK/dateFormat';
import analytics from '../commons/CUK/analytics';
import { sameDateFormat } from '../commons/CUK/dateFormat';

class orderItemShorex extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hover: false
        };
    }

    cancel = (e) => {
analytics.clickTracking(this)
        const { openOverlay, generalProductInfo, code } = this.props;
        e.preventDefault();
        openOverlay && openOverlay('group', generalProductInfo.groupID, code);
    };
    closeTooltip(e) {
        analytics.clickTracking(this)
        e.preventDefault();
        this.setState({ hover: false });
    }
    handleMouse(isHover) {
        this.setState(() => ({ hover: isHover }));
    }

    render() {
        const {
            totPrice,
            labels,
            accesibilityLabels,
            generalProductInfo,
            currSymbol,
            totDiscount,
            code,
            isCancelled,
            singleProduct,
            isCancellable,
            openOverlay,
            isCancelling
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
                        {generalProductInfo.attributes.port.longName}
                    </span>
                    <a className="productRow__title"  href={generalProductInfo.product.url}>
                        <h3 className="productRow__title">
                            {generalProductInfo.attributes.name}
                        </h3>
                    </a>

                    <span className="bodyText productRow__date">
                        {sameDateFormat(
                            new Date(
                                generalProductInfo.attributes.startDateTime
                            ),
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
                        <div className="cancelled">
                            <span className="">{labels.cancelledLabel}</span>
                        </div>
                    )}
                    {isCancelling && (
                        <div>
                            <span className="cancelled">
                                {labels.cancellingLabel}
                            </span>
                        </div>
                    )}
                </div>
                <div className="productRow__body">
                    <a
                        href={generalProductInfo.product.url}
                        className="productRow__img"
                        title={accesibilityLabels.imageAlt ? accesibilityLabels.imageAlt : ''}
                    >
                        <img src={generalProductInfo.product.primaryImageUrl} />
                    </a>
                    <div className="productRow__col">
                        <h5>{labels.guestsLabel}</h5>
                        <ul className="productRow__ul">
                            {entriesArray.map((entry, index) => {
                                const {
                                    status,
                                    passenger: { title, firstName, lastName },
                                    entryNumber,
                                    basePrice,
                                    cancellationDate,
                                    cancelledBy
                                } = entry;
                                let dateOfCancelling = cancellationDate
                                    ? plainDateFormat(
                                          new Date(cancellationDate),
                                          'MMM DD'
                                      )
                                    : '';
                                let hourOfCancelling = cancellationDate
                                    ? plainDateFormat(
                                          new Date(cancellationDate),
                                          'hh:mm A'
                                      )
                                    : '';
                                let cancelledMessage = cancellationDate
                                    ? labels.cancelledMsg
                                          .replace(
                                              '{date}',
                                              `<span class="info">${dateOfCancelling}</span>`
                                          )
                                          .replace(
                                              '{hour}',
                                              `<span class="info">${hourOfCancelling}</span>`
                                          )
                                          .replace(
                                              '{user}',
                                              `<span class="info">${cancelledBy}</span>`
                                          )
                                    : '';
                                return (
                                    <li
                                        key={`${index}entry`}
                                        className={`${status}`}
                                    >
                                        <span className="productRow__userName">
                                            {`${title} ${firstName} ${lastName}`}
                                        </span>
                                        {(status === 'CANCELLED' ||
                                            status === 'CANCELLING') && (
                                            <p className="productRow__cancelled">
                                                {labels.cancelledLabel}
                                                <span
                                                    className="tooltip__icon"
                                                    onMouseOver={(e) => {
                                                        this.handleMouse(true);
                                                    }}
                                                    onMouseOut={(e) => {
                                                        this.handleMouse(false);
                                                    }}
                                                >
                                                    {this.state.hover && (
                                                        <span className="tooltip__dd">
                                                            <a
                                                                className="tooltip__close"
                                                                onClick={(e) =>
                                                                    this.closeTooltip(
                                                                        e
                                                                    )
                                                                }
                                                            />
                                                            <span
                                                                dangerouslySetInnerHTML={{
                                                                    __html: cancelledMessage
                                                                }}
                                                            />
                                                        </span>
                                                    )}
                                                </span>
                                            </p>
                                        )}
                                        {status !== 'CANCELLED' &&
                                            status !== 'CANCELLING' &&
                                            isCancellable === true && (
                                                <a
                                                    href="#"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        openOverlay(
                                                            'entries',
                                                            entryNumber,
                                                            code
                                                        );
                                                    }}
                                                >
                                                    {labels.cancelLabel}
                                                </a>
                                            )}
                                        <span className="productRow__singlePrice">
                                            {`${currSymbol}${basePrice.value.toFixed(2)}`}
                                        </span>
                                    </li>
                                );
                            })}
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
                                    {`- ${currSymbol}${totDiscount.toFixed(2)}`}
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

export default orderItemShorex;
