'use strict';

import React from 'react';
import moment from 'moment';
import Image from '../commons/CUK/image';
import SessionStorage from '../commons/CUK/session-storage';
import { getPaxNumber } from '../commons/CUK/login-data-utility';
import Link from '../commons/CUK/link';
import debug from 'debug';

class diningGuestsList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            paxChecked: false,
            hover: false
        };
    }

    componentDidMount() {}

    componentWillMount() {}

    handleGuestSelect = (e) => {
        const { selectGuestHandler } = this.props;
        const { checked, value } = e.target;
        selectGuestHandler && selectGuestHandler(value, checked);
    };

    renderPassenger = (key, value) => {
        const { selectedGuest } = this.props;
        const guestValue = value + 1;
        const paxChecked =
            selectedGuest.findIndex((index) => +index === +guestValue) >= 0;
        return (
            <li key={guestValue} className="wrap pax-radio">
                <input
                    onChange={this.handleGuestSelect}
                    value={guestValue}
                    type="radio"
                    className="input-radio"
                    aria-labelledby="variation2-check"
                    name="spaTreatmentDuration"
                    id={`checkboxvalue${guestValue}`}
                    ref={(checkbox) => (this.checkbox = checkbox)}
                    checked={paxChecked}
                />
                <label
                    htmlFor={`checkboxvalue${guestValue}`}
                    className={`label ${paxChecked ? 'active' : ''}`}
                >
                    <h6 className="wheelchair">{`${guestValue}`}</h6>
                </label>
                <span className="error-label show-label" ref="checkbox" />
            </li>
        );
    };

    render() {
        const { labels } = this.props;
        const guests = ['1', '2', '3', '4', '5', '6'];

        return (
            <div className="spa-duration-container">
                <h3>{labels.selectGuestDiningLabel}</h3>
                <ul>{guests.map(this.renderPassenger)}</ul>
                <span className="more-label">{labels.moreThanSixPeopleLabel}</span>
            </div>
        );
    }
}

export default diningGuestsList;
