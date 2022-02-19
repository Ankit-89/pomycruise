import React, { Component } from 'react';
import { calculateAge } from '../commons/CUK/dateFormat';
import { getConfig } from '../commons/CUK/utilities';

class entertainmentPassengersList extends Component {
    constructor(props) {
        super(props);
    }

    capitalizeString = (string) => {
        let stringArry = new Array();
        string = string.toLowerCase();
        string = string.split(' ');
        string.forEach((value) => {
            stringArry.push(value.charAt(0).toUpperCase() + value.slice(1));
        });
        return stringArry.join(' ');
    };

    handleSelect = (e) => {
        const { selectPassengerHandler } = this.props;
        const { checked, value } = e.target;

        selectPassengerHandler && selectPassengerHandler(value, checked);
    };

    renderRestrictedPax(passenger) {
        const { labels, maxSelectable } = this.props;
        const { ageRestrictedLabel } = labels;
        const { title, firstName, lastName, paxNumber } = passenger;
        const passengerName = `${title} ${firstName} ${lastName}`;
        const radioMode = maxSelectable === 1;
        const inputType = radioMode ? 'radio' : 'checkbox';
        return (
            <li
                className={`wrap wrap-restricted pax-${inputType}`}
                key={paxNumber}
            >
                <input
                    disabled
                    type={inputType}
                    className={`input-${inputType}`}
                    aria-labelledby="variation2-check"
                    name="passenger"
                />
                <label className="checkbox-label disabled">
                    {radioMode && (
                        <span className="passenger">
                            {this.capitalizeString(passengerName)}
                        </span>
                    )}
                    {radioMode && (
                        <span className="passenger-restricted">
                            {ageRestrictedLabel}
                        </span>
                    )}
                    {!radioMode && (
                        <div>
                            <span className="passenger">
                                {this.capitalizeString(passengerName)}
                            </span>
                            <span className="passenger-restricted">
                                {ageRestrictedLabel}
                            </span>
                        </div>
                    )}
                </label>
            </li>
        );
    }

    renderNotRestrictedPax(passenger) {
        const { maxSelectable, maxSelected, selectedPassenger } = this.props;
        const { title, firstName, lastName, paxNumber } = passenger;
        const passengerName = `${title} ${firstName} ${lastName}`;
        const paxChecked =
            selectedPassenger.findIndex((index) => +index === +paxNumber) >= 0;

        const radioMode = maxSelectable === 1;
        const paxDisabled =
            !paxChecked && maxSelected && !radioMode ? 'disabled' : '';
        const inputType = radioMode ? 'radio' : 'checkbox';
        return (
            <li className={`wrap pax-${inputType}`} key={paxNumber}>
                <input
                    onChange={this.handleSelect}
                    value={paxNumber}
                    type={inputType}
                    className={`input-${inputType}`}
                    aria-labelledby="variation2-check"
                    name="passenger"
                    id={`checkbox${paxNumber}`}
                    ref={(checkbox) => (this.checkbox = checkbox)}
                    checked={paxChecked}
                    disabled={paxDisabled}
                />
                <label
                    htmlFor={`checkbox${paxNumber}`}
                    className={`label ${paxDisabled} ${
                        paxChecked ? 'active' : ''
                    }`}
                >
                    <span className="passenger">
                        {this.capitalizeString(passengerName)}
                    </span>
                </label>
                <span className="error-label show-label" ref="checkbox" />
            </li>
        );
    }

    renderBookedPax(passenger) {
        const { labels, maxSelectable } = this.props;
        const { alreadyBookedLabel } = labels;
        const { title, firstName, lastName, paxNumber } = passenger;
        const passengerName = `${title} ${firstName} ${lastName}`;
        const radioMode = maxSelectable === 1;
        const inputType = radioMode ? 'radio' : 'checkbox';
        return (
            <li
                className={`wrap wrap-restricted pax-${inputType}`}
                key={paxNumber}
            >
                <input
                    disabled
                    type={inputType}
                    className={`input-${inputType}`}
                    aria-labelledby="variation2-check"
                    name="passenger"
                />
                <label className="checkbox-label disabled">
                    {radioMode && (
                        <span className="passenger">
                            {this.capitalizeString(passengerName)}
                        </span>
                    )}
                    {radioMode && (
                        <span className="passenger-restricted">
                            {alreadyBookedLabel}
                        </span>
                    )}
                    {!radioMode && (
                        <div>
                            <span className="passenger">
                                {this.capitalizeString(passengerName)}
                            </span>
                            <span className="passenger-restricted">
                                {alreadyBookedLabel}
                            </span>
                        </div>
                    )}
                </label>
            </li>
        );
    }

    renderPassenger = (passenger) => {
        const {
            selectedDay,
            embarkDate,
            disembarkDate,
            eventCatoryies,
            bookedEventData
        } = this.props;
        const { birthDate, guestId, paxNumber } = passenger;
        const attendOnlyOnce = eventCatoryies.find(
            (e) => e == 'ONLY_ATTEND_ONCE'
        );
        const guestBookedValue = bookedEventData.find(
            (eventsList) => eventsList.paxId == paxNumber
        );

        const checkAttendOnlyOnce =
            attendOnlyOnce == 'ONLY_ATTEND_ONCE'
                ? guestBookedValue != undefined
                    ? true
                    : false
                : false;
        const minSixteenAge = eventCatoryies.find((e) => e == 'MIN_AGE_16');
        const minEighteenAge = eventCatoryies.find((e) => e == 'MIN_AGE_18');
        const checkMinSixteenAge =
            minSixteenAge == 'MIN_AGE_16'
                ? 16
                : minEighteenAge == 'MIN_AGE_18'
                    ? 18
                    : '';
        const dateToCompare = new Date(
            selectedDay.date ? selectedDay.date : disembarkDate
        );
        const passengerBirth = new Date(birthDate);
        const ageAtDate = calculateAge(
            passengerBirth.getTime(),
            dateToCompare.getTime()
        );
        return checkAttendOnlyOnce
            ? this.renderBookedPax(passenger)
            : ageAtDate < checkMinSixteenAge
                ? this.renderRestrictedPax(passenger)
                : this.renderNotRestrictedPax(passenger);
    };

    render() {
        const { labels, passengers } = this.props;
        const { selectguestLabel } = labels;

        return passengers ? (
            <div className="guestsList">
                <h5>{selectguestLabel}</h5>
                <ul>{passengers.map(this.renderPassenger)}</ul>
            </div>
        ) : null;
    }
}

export default entertainmentPassengersList;
