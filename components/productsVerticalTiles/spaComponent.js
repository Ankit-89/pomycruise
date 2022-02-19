import React, { Component } from 'react';
import { getCurrency } from '../commons/CUK/currencyFormat';

import ReadMoreOrLess from '../commons/CUK/readMoreOrLess';
import Link from '../commons/CUK/link';
import SessionStorage from '../commons/CUK/session-storage';
import analytics from '../commons/CUK/analytics';

class spaComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            active: false,
            readMore: false,
            longText: '',
            readMoreState: false
        };
    }
    componentDidMount() {
        this.readMore();
        // this.controlRestriction();
    }
    /**
     * readMore - Checks description's height against viewport's max-height
     * toggling state for "readMore" property
     */
    readMore() {
        const elm = this.desc || [];
        var originalDesc = elm.innerHTML;

        if (elm.innerHTML.length > 300) {
            const maxLength = 300;
            let trimmedString = '';
            if (elm.innerHTML.length > trimmedString.length) {
                trimmedString = elm.innerHTML.substr(0, maxLength);
                trimmedString = trimmedString.substr(0, Math.min(trimmedString.length, trimmedString.lastIndexOf(" ")));
            }
            this.setState(() => {
                elm.innerHTML = trimmedString;
                return {
                    readMoreState: true,
                    longText: originalDesc
                };
            });
        }
    }
    /**
     * createPrice - Handles creation of price converting currencyIso to symbol
     * with imported helper function
     *
     * @returns  {JSX} resulting markup for price to show
     */
    createPrice(minimumPrice) {
        const {
            labels: { from }
        } = this.props;

        return `${from} ${getCurrency()}${minimumPrice}`;
    }

    /**
     * handleReadMore - Click handler for readMore/readLess
     */
    handleReadMore = (e) => {
        e.preventDefault();
        analytics.clickTracking(this);
        const maxLength = 300;
        this.setState((prevState) => {
            const { active, longText } = prevState;
            let innerHTML = this.desc.innerHTML;
            if (active) {
                innerHTML = innerHTML.substr(0, maxLength);
                innerHTML = innerHTML.substr(0, Math.min(innerHTML.length, innerHTML.lastIndexOf(" ")));
            } else {
                innerHTML = longText
            }
            this.desc.innerHTML = innerHTML;
            return {
                active: !prevState.active
            };
        });
    };

    concatenateDuration = (durationsObj, singleInstance, index, instances) => {
        if (!durationsObj[singleInstance.duration]) {
            durationsObj[singleInstance.duration] = true;
        }
        return index !== instances.length - 1
            ? durationsObj
            : Object.keys(durationsObj)
                .sort((a, b) => a - b)
                .reduce(
                    (durationsString, duration, index, durations) =>
                        (durationsString += `${duration}' ${
                            index !== durations.length - 1 ? '/ ' : ''
                            }`),
                    ''
                );
    };

    handleOverlay = () => {
        const { configuratorClick, product } = this.props;
        configuratorClick && configuratorClick(product);
    };

    render() {
        let { product, labels, purchasable, steinerResponse } = this.props;
        const { active, readMoreState } = this.state;
        const { readLess, readMore, addToCartLabel, notAvailableLabel } = labels;
        const {
            name,
            instances,
            code,
            fromPrice
        } = product;
        const readLabel = active ? readLess : readMore;
        const userData = SessionStorage.getItem('userData');
        const { brandCode } = userData;
        purchasable = brandCode === 'PO' ? purchasable : false;
        let available = false;
        let ctaLabel = '';
        let notAvlLabel = '';

        let successResponsePresent = false;

        let minimumPrice;
        this.props.product.instances.forEach(element => {
            if (element.appointments) {
                element.appointments[0].appointment.forEach(
                    value => {
                        const newTreatementPrice = parseInt(value.treatementPrice);
                        minimumPrice = (minimumPrice) ? minimumPrice : (newTreatementPrice > 0) ? newTreatementPrice : minimumPrice;

                        if (newTreatementPrice > 0 && newTreatementPrice < minimumPrice) {
                            minimumPrice = newTreatementPrice;

                        }

                    }
                )


                successResponsePresent = true;
            }
        });

        if (minimumPrice > 0) {
            ctaLabel = addToCartLabel;
            available = true;
        };
        notAvlLabel = steinerResponse ? notAvailableLabel : "";
        let nonAvailabilityMessage = product.purchasable
            ? false
            : product.nonAvailabilityMessage;
        return (
            <div className="spaComponent">
                <div className="spaComponent__image">
                    <span>
                        <img src={instances[0].primaryImageUrl} alt={code} />
                    </span>
                </div>
                <div className="spaComponent__details">
                    <h3>{name}</h3>
                    <div className="spaComponent__description">
                        {(!nonAvailabilityMessage ||
                            nonAvailabilityMessage.code ===
                            'SPA_INSTANCE_SALABLE_DEADLINE_CRITERIA_MET') && (
                                <p className="spaComponent__tecnical">
                                    {minimumPrice > 0 && this.createPrice(minimumPrice)}
                                    <span className="spaComponent__duration">
                                        {instances.reduce(
                                            this.concatenateDuration,
                                            {}
                                        )}
                                    </span>
                                </p>
                            )}
                        <div
                            className=""
                            ref={(desc) => (this.desc = desc)}
                            dangerouslySetInnerHTML={{ __html: instances[0].description }}
                        />

                        {!available && <div style={{ color: 'red' }}>
                            {notAvlLabel}
                        </div>}

                        {readMoreState && (
                            <a
                                href="#"
                                className="spaComponent__cta"
                                onClick={this.handleReadMore}
                            >
                                {readLabel}
                            </a>
                        )}
                    </div>

                    {available &&
                        <div className="cta-block cta-addToCart">
                            <Link
                                ariaLabel={`${addToCartLabel}`}
                                url={'javascript:void(0)'}
                                title={addToCartLabel}
                                dataLinktext={addToCartLabel}
                                linkClassName={`cta-primary`}
                                onClick={this.handleOverlay}
                            >
                                {ctaLabel}
                            </Link>
                        </div>
                    }

                </div>
            </div>
        );
    }
}

export default spaComponent;
