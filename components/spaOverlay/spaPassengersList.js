import React, { Component } from 'react';
import { calculateAge } from '../commons/CUK/dateFormat';
import { getConfig } from '../commons/CUK/utilities';

class spaPassengersList extends Component {
    constructor(props) {
        super(props);
    }

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
                    name="checkboxPrice"
                />
                <label className="checkbox-label disabled">
                    <h5>
                        <span className="passenger">{passengerName}</span>
                    </h5>
                    <span className="passenger-restricted">
                        {ageRestrictedLabel}
                    </span>
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
                    name="checkboxPrice"
                    id={`checkbox${paxNumber}`}
                    ref={(checkbox) => (this.checkbox = checkbox)}
                    checked={paxChecked}
                    disabled={paxDisabled}
                />
                <label
                    htmlFor={`checkbox${paxNumber}`}
                    className={`label ${paxDisabled}`}
                >
                    <h5>
                        <span className="passenger">{passengerName}</span>
                    </h5>
                </label>
                <span className="error-label show-label" ref="checkbox" />
            </li>
        );
    }

    renderPassenger = (passenger) => {
        const { selectedDay, disembarkDate, embarkDate } = this.props;
        const { birthDate } = passenger;
        const minAdultAge = getConfig('minAdultAge', 0);
        const dateToCompare = new Date(
            selectedDay ? selectedDay.value : embarkDate
        );
        const passengerBirth = new Date(birthDate);
        const ageAtDate = calculateAge(
            passengerBirth.getTime(),
            dateToCompare.getTime()
        );

        return ageAtDate < minAdultAge
            ? this.renderRestrictedPax(passenger)
            : this.renderNotRestrictedPax(passenger);
    };

    render() {
        const { labels, passengers } = this.props;
        const { selectGuestsLabel, selectGuestsDisclaimer } = labels;

        return passengers ? (
            <div className="guestsList">
                <h4>{selectGuestsLabel}</h4>
                <p>{selectGuestsDisclaimer}</p>
                {passengers.map(this.renderPassenger)}
            </div>
        ) : null;
    }
}

export default spaPassengersList;
