'use strict';

import React from 'react';
import moment from 'moment';
import Image from '../commons/CUK/image';
import SessionStorage from '../commons/CUK/session-storage';
import { getPaxNumber } from '../commons/CUK/login-data-utility';
import Link from '../commons/CUK/link';
import debug from 'debug';

class entertainmentWheelChair extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            paxChecked: false,
            notRequiredButton: false,
            hover: false
        };
    }

    componentDidMount() {}

    componentWillMount() {}

    handlewheelSelect = (e) => {
        const { selectWheelchairHandler } = this.props;
        const { checked, value } = e.target;
        selectWheelchairHandler && selectWheelchairHandler(value, checked);
        this.setState({
            notRequiredButton: false
        });
    };

    handleClick = () => {
        this.setState({
            notRequiredButton: !this.state.notRequiredButton
        });
        const { selectWheelchairHandler } = this.props;
        let value = 0;
        selectWheelchairHandler &&
            selectWheelchairHandler(value, this.state.notRequiredButton);
    };
    closeTooltip = (e) => {
        //analytics.clickTracking(this);
        e.preventDefault();
        this.setState({ hover: false });
    };
    handleMouseIn = () => {
        this.setState({ hover: true });
    };

    handleMouseOut = () => {
        this.setState({ hover: false });
    };

    renderPassenger = (key, value) => {
        const { maxSelectable, maxSelected, selectedWheelchair } = this.props;
        const { notRequiredButton } = this.state;
        const checkWheelChairValue = value + 1;
        const paxChecked =
            selectedWheelchair.findIndex(
                (index) => +index === +checkWheelChairValue
            ) >= 0;
        const radioMode = maxSelectable === 1;
        const paxDisabled =
            !paxChecked && maxSelected && !radioMode ? 'disabled' : '';
        return (
            <li key={checkWheelChairValue} className="wrap pax-radio">
                <input
                    onChange={this.handlewheelSelect}
                    value={checkWheelChairValue}
                    type="radio"
                    className="input-radio"
                    aria-labelledby="variation2-check"
                    name="spaTreatmentDuration"
                    id={`checkboxvalue${checkWheelChairValue}`}
                    ref={(checkbox) => (this.checkbox = checkbox)}
                    checked={!notRequiredButton ? paxChecked : false}
                    disabled={paxDisabled}
                />
                <label
                    htmlFor={`checkboxvalue${checkWheelChairValue}`}
                    className={`label ${paxDisabled} ${
                        !notRequiredButton ? (paxChecked ? 'active' : '') : ''
                    }`}
                >
                    <h6 className="wheelchair">{`${checkWheelChairValue}`}</h6>
                </label>
                <span className="error-label show-label" ref="checkbox" />
            </li>
        );
    };

    render() {
        const {
            labels,
            passengers,
            selectedPassenger,
            selectedWheelchair,
            maxSelectable,
            maxSelected,
            eventCatoryies
        } = this.props;
        const { notRequiredButton, hover } = this.state;
        const paxChecked = selectedWheelchair[0] == 0;
        const radioMode = maxSelectable === 1;
        const paxDisabled = !paxChecked ? 'disabled' : '';
        const storeSingleWheelChair = eventCatoryies.find(
            (e) => e == 'SNGL_WHL_CHR_BOOKINGS'
        );
        const checkSingleWheelChair =
            storeSingleWheelChair == 'SNGL_WHL_CHR_BOOKINGS' ? true : false;
        const display = hover ? 'block' : 'none';
        const tooltipStyle = { display };

        return selectedPassenger ? (
            <div className="spa-duration-container">
                <h3>
                    {'Wheelchair Spaces required?'}
                    <span
                        className="tooltip__icon"
                        onMouseOver={this.handleMouseIn}
                        onMouseOut={this.handleMouseOut}
                    >
                        <div className="tooltip__dd" style={tooltipStyle}>
                            <a
                                className="tooltip__close"
                                onClick={this.closeTooltip}
                            />
                            <p>{labels.helpTextEntDetailLabel}</p>
                        </div>
                    </span>
                </h3>

                <ul>
                    {checkSingleWheelChair
                        ? selectedPassenger
                              .slice(0, 1)
                              .map((key, index) =>
                                  this.renderPassenger(key, index)
                              )
                        : selectedPassenger.map((key, index) =>
                              this.renderPassenger(key, index)
                          )}
                    <Link
                        ariaLabel={labels.backLabel}
                        title={labels.backLabel}
                        //dataLinktext={seeDetailsLabel}
                        linkClassName={`${
                            !notRequiredButton
                                ? 'cta-button-false'
                                : 'cta-button-true'
                        }`}
                        onClick={this.handleClick}
                    >
                        <h6>{labels.notRequiredLabel}</h6>
                    </Link>
                </ul>
            </div>
        ) : null;
    }
}

export default entertainmentWheelChair;
