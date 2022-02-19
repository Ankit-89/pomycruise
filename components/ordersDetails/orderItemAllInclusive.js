import React from 'react';
import sessionStorage from '../commons/CUK/session-storage';
import analytics from '../commons/CUK/analytics';

class orderItemAllInclusive extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hover: false
        };
    }

    cancel = (e) => {
        analytics.setAdditionalPageTrackAttributes({
            event: 'event312',
            productID: this.props.generalProductInfo.product.externalCode,
            productType: this.props.generalProductInfo.product.productType,
            canceltype: ''
        });
        analytics.clickTracking(this);
        const { openOverlay, generalProductInfo, code } = this.props;
        e.preventDefault();
        openOverlay && openOverlay('group', generalProductInfo.groupID, code);
    };

    closeTooltip = (e) => {
        analytics.clickTracking(this);
        e.preventDefault();
        this.setState({ hover: false });
    };
    handleMouseIn = () => {
        this.setState({ hover: true });
    };
    handleMouseOut = () => {
        this.setState({ hover: false });
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
            singleProduct
        } = this.props;
        const display = this.state.hover ? 'block' : 'none';
        const tooltipStyle = { display };

        const { embarkationDate, disembarkationDate } = sessionStorage.getItem(
            'userData'
        );

        const cruiseData = sessionStorage.getItem('cruiseData') || {};
        const {
           durationCruise = 0
               } = cruiseData;
        /* const eParts = embarkationDate.split('-');
        const dParts = disembarkationDate.split('-');
        const embarkationDay = new Date(eParts[0], eParts[1] - 1, eParts[2]);
        const disembarkationDay = new Date(dParts[0], dParts[1] - 1, dParts[2]);
        const oneDay = 1000 * 60 * 60 * 24;
        const cruiseLength = Math.round(
            ((disembarkationDay.getTime() - embarkationDay.getTime()) / oneDay)-1
        ); */
        const cruiseLength = durationCruise ;
        const entriesArray = Object.entries(singleProduct)[0][1];
        let totChildDiscount = entriesArray[0].totalChildDiscount.value;
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
                        {labels.drinksLabel}
                    </span>
                    <a className="productRow__title" href={generalProductInfo.product.url ? generalProductInfo.product.url : '#'}>
                        <h3 className="productRow__title">
                            {labels.allInclusiveLabel}
                        </h3>
                    </a>
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
                    <a className="productRow__img" href={generalProductInfo.product.url ? generalProductInfo.product.url : '#'} title={accesibilityLabels.imageAlt ? accesibilityLabels.imageAlt : ''}>
                        <img
                            className=""
                            src={generalProductInfo.product.primaryImageUrl}
                        />
                    </a>
                    <div className="productRow__col">
                        <h5>{labels.guestsLabel}</h5>
                        <ul className="productRow__ul">
                            {entriesArray.map((item, index) => {
                                const {
                                    passenger: { title, firstName, lastName },
                                    basePrice
                                } = item;
                                return (
                                    <li key={`${index}entry`}>
                                        <span className="productRow__userName">
                                            {`${title} ${firstName} ${lastName}`}
                                        </span>
                                        <h6 className="productRow__nameDetail">
                                            {generalProductInfo.attributes.name}
                                        </h6>
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
                        <p>
                            <span className="label__col">
                                {labels.cruiseLengthLabel}
                            </span>
                            <span className="value__col">
                                {`${cruiseLength} ${labels.daysLabel}`}
                            </span>
                        </p>
                        {totChildDiscount > 0 && (
                            <div className="productRow__info">
                                <div
                                    className="tooltip__icon left"
                                    onMouseOver={this.handleMouseIn}
                                    onMouseOut={this.handleMouseOut}
                                >
                                    <div
                                        className="tooltip__dd"
                                        style={tooltipStyle}
                                    >
                                        <a
                                            className="tooltip__close"
                                            onClick={this.closeTooltip}
                                        />
                                        <p>{labels.childDiscountDescription}</p>
                                    </div>
                                </div>
                                <p>
                                    <span className="label__col">
                                        {labels.childDiscountLabel}
                                    </span>
                                    <span className="value__col">
                                        {` - ${currSymbol}${totChildDiscount.toFixed(2)}`}
                                    </span>
                                </p>
                            </div>
                        )}
                        <p className="total-price">
                            <span className="label__col">
                                {labels.totalLabel}
                            </span>
                            <span className="value__col">
                                {currSymbol}
                                {(totPrice * cruiseLength - totDiscount).toFixed(2)}
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        );
    }
}

export default orderItemAllInclusive;
