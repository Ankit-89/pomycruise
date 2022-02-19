import React, { Component } from 'react';

class applyInfoSlot extends Component {
    constructor(props) {
        super(props);
    }

    handleConsentChange = (e) => {
        const { consentHandler } = this.props;
        const applyToOtherPassengers = e.target.checked;
        consentHandler && consentHandler(applyToOtherPassengers);
    };
    render() {
        const { label, section } = this.props;
        return (
            <div className="consent-wrapper">
                <input
                    type="checkbox"
                    className="input-check"
                    aria-labelledby="variation2-check"
                    name={`${section}ConsentAddress`}
                    id={`${section}ConsentAddress`}
                    ref={(checkbox) => (this.checkbox = checkbox)}
                    onChange={this.handleConsentChange}
                    // onChange={this.handleTextChange}
                />
                <label htmlFor="consent" className="checkbox-label">
                    {label}
                </label>
            </div>
        );
    }
}

export default applyInfoSlot;
