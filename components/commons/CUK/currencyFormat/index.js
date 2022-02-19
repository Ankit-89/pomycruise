/*
 * CurrencyFormat Module
 *
 */
'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { getCountryCode, getUserType } from '../utilities';

/**
 * getCurrencyData - fetches the currency code dynamically
 * @param {string} country code depicting country US/CA etc
 * @param {object} configs object with countryCode mapping with currencyCode and currencySymbol
 * @returns {object} with data for price
 */
const getCurrencyData = (country, configs) => {
    if (!configs) {
        configs =
            typeof window !== 'undefined' && window.configs
                ? window.configs
                : {};
    }

    const countryCode = country ? country : getCountryCode();

    let currencyCodes = configs.countriesWithCurrency;

    return currencyCodes
        ? currencyCodes[countryCode.toUpperCase()] ||
              currencyCodes[countryCode.toLowerCase()] ||
              currencyCodes.default ||
              currencyCodes.DEFAULT ||
              {}
        : {};
};

/**
 * getCurrency - Get currency symbol from page config
 * @param {string} countryCode - user locale code
 * @param {object} configs - Currency symbol configs
 * @returns {string} symbol
 */
const getCurrency = (countryCode, configs) => {
    countryCode = countryCode ? countryCode : getCountryCode();

    if (!configs) {
        configs =
            typeof window !== 'undefined' && window.configs
                ? window.configs
                : {};
    }

    if (configs.hasOwnProperty('countriesWithCurrency')) {
        return getCurrencyData(countryCode, configs).currencySymbol || '';
    } else {
        return '';
    }
};

/**
 * getPriceSymbolForCurrencyCode - Get getUserType from cookie
 * @param {string} code code depicting country currency code USD/AUD etc
 * @param {object} configs object with countryCode mapping with currencyCode and currencySymbol
 * @returns {string} currency symbol like $, € etc
 */
const getPriceSymbolForCurrencyCode = (code, configs) => {
    if (typeof code === 'undefined' || code === null || code === '') {
        return '';
    }

    if (!configs) {
        configs =
            typeof window !== 'undefined' && window.configs
                ? window.configs
                : {};
    }

    let currencyCodes = configs.countriesWithCurrency;

    for (let key in currencyCodes) {
        if (
            currencyCodes[key] &&
            currencyCodes[key].currencyCode &&
            currencyCodes[key].currencyCode.toLowerCase() === code.toLowerCase()
        ) {
            code = currencyCodes[key].currencySymbol;
            break;
        }
    }

    return code;
};

/**
 * getPriceInformation - Retrieve appropriate price info from object
 * @param {object} item item details including price in format price_CountryCode_userTier
 * @returns {price} returns price obtained from details
 */
const getPriceInformation = (item) => {
    const user = getUserType();
    const countryCode = getCountryCode();
    const currencyData = getCurrencyData(countryCode);

    return {
        price: item
            ? item[`price_${currencyData.currencyCode}_${user}`]
            : `price_${currencyData.currencyCode}_${user}`,
        currency: currencyData.currencyCode,
        symbol: currencyData.currencySymbol,
        tax: item
            ? item[`tax_${currencyData.currencyCode}_${user}`]
            : `tax_${currencyData.currencyCode}_${user}`
    };
};

const decimalLength = (value) => {
    return ((value && value.toString().split('.')[1]) || []).length;
};

/**
 * numberFormat - Number fomrat based on locale
 * @param {number} number - price
 * @returns {number} Formatted number
 */

const numberFormat = (number, decimal, decimalSup) => {
    let configs = {};

    if (typeof window !== 'undefined' && window.configs) {
        configs = (this && this.configs) || window.configs;
    }

    if (configs.hasOwnProperty('currencyLocale')) {
        const localePattern = /[a-zA-Z]{2}-[a-zA-Z]{2}/g;

        let locale = configs.currencyLocale.replace('_', '-');

        if (!locale.match(localePattern)) {
            locale = configs.locale
                ? configs.locale.replace('_', '-')
                : 'en-US';
        }

        if (
            decimal &&
            new Intl.NumberFormat(locale, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })
                .format(number)
                .split('.')[1] > 0
        ) {
            if (decimalSup) {
                return (
                    <span
                        dangerouslySetInnerHTML={{
                            __html: numberSplit(
                                new Intl.NumberFormat(locale, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                }).format(number)
                            )
                        }}
                    />
                );
            } else {
                return new Intl.NumberFormat(locale, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }).format(number);
            }
        } else if (decimalLength(number) === 1) {
            return new Intl.NumberFormat(locale, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(number);
        } else {
            return new Intl.NumberFormat(locale).format(number);
        }
    } else {
        return number;
    }
};

/**
 * numberSplit - Dynamically determine the price and break it into 2 floating point
 * @param {number} number
 * @returns {price} returns price in floating point
 */

const numberSplit = (number) => {
    const separator = number && number.charAt(number.length - 3);

    if (separator && isNaN(separator)) {
        let formatNumber = number.split(separator);

        if (typeof formatNumber[1] === 'undefined') {
            formatNumber[1] = '00';
        }

        return `${formatNumber[0]}<i>${separator}${formatNumber[1]}</i>`;
    }

    return number;
};

class currencyFormat extends React.PureComponent {
    constructor(props) {
        super(props);
        this.configs = {};
        if (typeof window !== 'undefined') {
            this.configs = window.configs || {};
        }
        this.numberFormat = numberFormat.bind(this);
    }

    render() {
        const {
            value,
            currencyCode,
            className = 'currency',
            decimal = false,
            decimalSup = false,
            ariaLabel = '',
            ariaHidden,
            selectedState = ''
        } = this.props;
        const attributes = {};
        const currencySymbol = getPriceSymbolForCurrencyCode(
            currencyCode,
            this.configs
        );

        if (ariaLabel && ariaLabel.length) {
            attributes['aria-label'] = `${ariaLabel}  ${this.numberFormat(
                value,
                decimal,
                decimalSup
            )} ${currencySymbol} ${selectedState}`;
        }
        if (ariaHidden) {
            attributes['aria-hidden'] = true;
        }

        return (
            <span
                {...attributes}
                className={`currency currency-${currencyCode} ${className}`}
            >
                <i> {currencySymbol}</i>
                {this.numberFormat(value, decimal, decimalSup)}
            </span>
        );
    }
}

currencyFormat.propTypes = {
    currencyCode: PropTypes.string,
    className: PropTypes.string
};

export {
    getCurrency,
    getCurrencyData,
    getPriceSymbolForCurrencyCode,
    getPriceInformation,
    numberFormat,
    decimalLength
};

export default currencyFormat;
