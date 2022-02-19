/**
 *
 * A keyFacts module that renders an icon along with key information.
 *
 * @module modules/KeyFacts
 *
 */
'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import {
    getPriceSymbolForCurrencyCode,
    numberFormat
} from '../commons/CUK/currencyFormat';

class keyFacts extends React.Component {
    /**
     * constructor
     * @param {React-props} props - Props passed to this module
     */
    constructor(props) {
        super(props);
    }

    /**
     * Gives markup for anchor tag
     * @returns {React-markup} - Returns React markup to generate anchor tag
     */
    render() {
        let {
            id,
            caption,
            statistic,
            currencyType,
            showShorePrice,
            shorexMealIncludedLabel,
            shorexRefreshmentIncludedLabel,
            shorexMealAndRefreshmentIncludedLabel
        } = this.props;

        var adultlabelDisplay = false,
            currencyLabel = '';
        let currencySymbol = getPriceSymbolForCurrencyCode(currencyType);

        if (this.props.id === 'costLabel' && showShorePrice === false) {
            for (let i = 0; i < parseInt(statistic); i++) {
                currencyLabel = `${currencyLabel} ${currencySymbol}`;
            }
            statistic = currencyLabel;
        }

        if (this.props.id === 'costLabel' && showShorePrice === true) {
            statistic = numberFormat(statistic, true, false);
            currencyLabel = currencySymbol + statistic;
            statistic = currencyLabel;
        }

        if (this.props.id === 'costLabel' && this.props.adultLabel !== '') {
            adultlabelDisplay = true;
        }

        if(statistic.trim().toLowerCase().includes('mi') && statistic.trim().toLowerCase().includes('ri')){
            statistic = shorexMealAndRefreshmentIncludedLabel;
        }else if(statistic.trim().toLowerCase() === 'ri'){
            statistic = shorexRefreshmentIncludedLabel;
        }else if(statistic.trim().toLowerCase() === 'mi'){
            statistic = shorexMealIncludedLabel;
        }

        // Code snippet for eventual parsing of event duration

        // if (this.props.id === 'duration') {
        //     const string = 'Approximately 3.15 hours';
        //     const regex = /(\.\d*)/g;
        //     const extract = string.match(regex)[0];
        //     const andLabel = 'and';
        //     const minutesLabel = 'minutes';

        //     let newString = string.replace(regex, '');
        //     if (extract !== '00') {
        //         const newExtract = extract.substr(1);
        //         newString += ` ${andLabel} ${newExtract} ${minutesLabel}`;
        //     }
        //     console.log(newString);
        // }

        return (
            <li className="key-fact">
                <div className={`key-icon ${id.toLowerCase()}-icon`} />
                <div className="text-content">
                    <p className="caption">{caption}</p>
                    {adultlabelDisplay &&
                        showShorePrice && (
                            <p className="caption adult-label">
                                {this.props.adultLabel}
                                {showShorePrice === false ? (
                                    <span className="stats cost">
                                        {' '}
                                        {currencyLabel}
                                    </span>
                                ) : (
                                    ''
                                )}{' '}
                            </p>
                        )}
                    <p
                        className="stats"
                        dangerouslySetInnerHTML={{ __html: statistic }}
                    />
                </div>
            </li>
        );
    }
}

/**
 * propTypes
 * @property {object} passed properties to generate anchor tag
 */
keyFacts.propTypes = {
    id: PropTypes.string.isRequired,
    caption: PropTypes.string.isRequired,
    statistic: PropTypes.string
};

/**
 * defaultProps
 * @property {object} default properties to generate anchor tag when props was not provided with these prop
 */
keyFacts.defaultProps = {
    statistic: 'N/A'
};

export default keyFacts;
