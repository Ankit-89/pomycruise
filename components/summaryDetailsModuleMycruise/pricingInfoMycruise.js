'use strict';

import React from 'react';
import CurrencyFormat from '../commons/CUK/currencyFormat';
import SessionStorage from '../commons/CUK/session-storage';

class pricingInfoMycruise extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            noError: true
        };
    }

    handleUpdate = (e) => {
        const { update } = this.props;
        update && update(e);
    };

    render() {
        const {
            labels,
            totalLoyaltyDiscount,
            totalChildDiscount,
            total
        } = this.props;
        const { noError } = this.state;

        const header = SessionStorage.getItem('header');

        const { loyaltyTier } = header.customer;

        return (
            <div className="payment-summary">
                <div className="payment-summary-subtotal">
                    <span className="label">{labels.subtotalLabel}</span>
                    <span className="value">
                        <CurrencyFormat
                            value={total.value + totalLoyaltyDiscount.value + totalChildDiscount.value }
                            currencyCode={total.currencyIso}
                            className="currency"
                            decimal={true}
                        />
                    </span>
                </div>
                {totalLoyaltyDiscount.value > 0 && (
                    <div className="payment-summary-loyality-discount">
                        <span className="label">
                            {labels.loyaltyDiscountTotalLabel}
                            <span className="loyaltyName">{loyaltyTier}</span>
                        </span>
                        <span className="label-subtitle">
                            {labels.discountSubtitle}
                        </span>
                        <span className="value">
                            -{totalLoyaltyDiscount.formattedValue}
                        </span>
                    </div>
                )}
                {totalChildDiscount.value > 0 && (
                    <div className="payment-summary-child-discount">
                        <span className="label">
                            {labels.childDiscountTotalLabel}
                        </span>
                        <span className="value">
                            -{totalChildDiscount.formattedValue}
                        </span>
                    </div>
                )}
                <div className="payment-summary-total">
                    <span className="label">{labels.totalLabel}</span>
                    <span className="value">{total.formattedValue}</span>
                </div>
                <div className="payment-summary-checkout">
                    <button
                        type="button"
                        className={`checkout-button ${
                            noError ? '' : 'cta-disabled'
                        }  `}
                        data-clicktype={`general`}
                        data-linktext={`${labels.checkoutCtaLabel}`}
                        onClick={this.handleUpdate}
                    >
                        {labels.checkoutCtaLabel}
                    </button>
                </div>
            </div>
        );
    }
}

export default pricingInfoMycruise;
