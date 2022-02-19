/*
* Moment js date format
*/
'use strict';
import moment from 'moment';
import React from 'react';

let locale = 'en_US';

if (typeof window !== 'undefined' && window.configs && window.configs.locale) {
    locale = window.configs.locale;
}

moment.locale(locale);

const capitalize = (value) => {
    if (value) {
        return value.replace(/(^|\s)\S/g, (l) => l.toUpperCase());
    }
};

const dateFormatString = (date, format) => {
    let momentDate;

    if (date && date !== '') {
        momentDate = moment(date.replace(/T\d.+/, '')).format(format);
    } else {
        momentDate = '';
    }

    return capitalize(momentDate);
};

const dateFormat = (date, format) => {
    let momentDate;

    if (date && date !== '') {
        momentDate = moment(date.replace(/T\d.+/, '')).format(format);
    } else {
        momentDate = '';
    }

    return <span className="formatted-date">{capitalize(momentDate)}</span>;
};

const plainDateFormat = (date, format) =>
    date ? moment(date).format(format) : '';

const sameDateFormat = (date, format) =>
    date ? moment.utc(date).format(format) : '';

const dateFormat2 = (startDate, endDate, displayDateWithoutDay) => {
    const startYear = moment(startDate).format('gggg');
    const endYear = moment(endDate).format('gggg');

    let s, e, date;

    if (startYear !== endYear) {
        if (displayDateWithoutDay) {
            s = moment(startDate).format('ll');
            e = moment(endDate).format('ll');
            date = `${s} - ${e}`;
        } else {
            s = moment(startDate).format('ddd, ll');
            e = moment(endDate).format('ddd, ll');
            date = `${s} - ${e}`;
        }
    } else {
        if (displayDateWithoutDay) {
            s = moment(startDate)
                .format('ll')
                .split(/(\s+)/);
            e = moment(endDate).format('ll');
            date = `${s[0]} ${s[2].replace(/[,.]+/g, ' ').trim()} - ${e}`;
        } else {
            s = moment(startDate)
                .format('ddd, ll')
                .split(/(\s+)/);
            e = moment(endDate).format('ddd, ll');
            date = `${s[0]} ${s[2]} ${s[4]
                .replace(/[,.]+/g, ' ')
                .trim()} - ${e}`;
        }
    }

    return <span className="formatted-date">{capitalize(date)}</span>;
};

const dateFormat3 = (date, format) => {
    let momentDate;

    if (typeof date !== 'undefined' && date !== '') {
        momentDate = moment(date.replace(/T\d.+/, ''))
            .format(format)
            .split(/(\s+)/);
    } else {
        momentDate = '';
    }

    return (
        <span className="formatted-date">{`${capitalize(momentDate[0])} ${
            momentDate[2]
                ? capitalize(momentDate[2].replace(/[,.]+/g, ' ').trim())
                : ''
            }`}</span>
    );
};
/**
 * calculateAge - Calculates age of customer given a date or at the moment
 *
 * @param {number} customerBirth customer birth date in milliseconds
 * @param {number} [ageAtTime = Date.now()] date to check age against in milliseconds
 * @returns {number} age of customer at given date or at the moment
 */
const calculateAge = (customerBirth, ageAtTime = Date.now()) => {
    let diffInMilliseconds = ageAtTime - customerBirth;
    let ageDifference = new Date(diffInMilliseconds);

    return Math.abs(ageDifference.getUTCFullYear() - 1970);
};

/**
 * calculateDiffDays - Calculates number of days
 * between two given dates.
 *
 * @param {number} firstDate first date in milliseconds
 * @param {number} seccondDate second date in milliseconds
 * @returns {number} number of days between given dates
 */
const calculateDiffDays = (firstDate, secondDate) => {
    const oneDayInMilliseconds = 24 * 60 * 60 * 1000;

    return Math.round((secondDate - firstDate) / oneDayInMilliseconds);
};

export {
    plainDateFormat,
    sameDateFormat,
    dateFormat,
    dateFormat2,
    dateFormat3,
    dateFormatString,
    calculateAge,
    calculateDiffDays
};
