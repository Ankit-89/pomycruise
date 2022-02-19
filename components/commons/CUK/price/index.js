'use strict';

import React from 'react';
import LegalModal from '../legalModal';
import CurrencyFormat from '../currencyFormat';

const getTermsAndConditions = (props, handleAnalytics) => {
    if (props.legalModalData) {
        const {
            closeLabel,
            contentLabel,
            dynamicData,
            hideLegalAccordion
        } = props.legalModalData;

        return (
            <LegalModal
                closeLabel={closeLabel}
                currency={props.currency}
                contentLabel={contentLabel}
                underlayClass="legal-modal"
                dynamicData={dynamicData}
                hideLegalAccordion={hideLegalAccordion}
                taxFeesBlock={getTermsLinks(props, handleAnalytics)}
            />
        );
    } else {
        return getTermsLinks(props, handleAnalytics);
    }
};

const getTermsLinks = (props, handleAnalytics) => {
    return (
        <div
            dangerouslySetInnerHTML={{ __html: props.termsAndConditionsText }}
            className="disclaimer-text"
            onKeyPress={handleAnalytics}
            onClick={handleAnalytics}
        />
    );
};

const price = (props) => {
    const {
        fromLabel,
        price,
        currency,
        perPersonLabel,
        termsAndConditionsText,
        roomTypeName = ''
    } = props;

    const handleAnalytics = (evt) => {
        props.handleAnalytics && props.handleAnalytics(evt);
    };

    return (
        <div className="price-block" tabIndex="0">
            <div className="label-one">
                {roomTypeName && <span>{roomTypeName}</span>} {fromLabel}
            </div>
            <CurrencyFormat value={price} currencyCode={currency} sup={true} />
            {perPersonLabel && (
                <div className="label-two">{perPersonLabel}</div>
            )}
            {termsAndConditionsText &&
                getTermsAndConditions(props, handleAnalytics)}
        </div>
    );
};

export default price;
