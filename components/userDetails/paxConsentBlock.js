import React, { Component } from 'react';
import { calculateAge } from '../commons/CUK/dateFormat';

class paxConsentBlock extends Component {
    constructor(props) {
        super(props);
    }

    updateCallBackConsect = (e) => {
        const { currentTarget } = e;
        const { value } = currentTarget;
        this.props && this.props.updateCallBack && this.props.updateCallBack(value === "allow");
    }

    render() {
        const {
            labels: {
                personalDetailsConsentLabel,
                personalDetailsConsentAllow,
                personalDetailsConsentAllowDisclaimer,
                personalDetailsConsentDeny,
                personalDetailsConsentDenyDisclaimer
            },
            minAdultAge,
            isLeadPassenger,
            leadPaxName,
            pax,
            hasHoldConsent
        } = this.props;

        const { birthDate } = pax.individual;
        const userBirthDate = new Date(birthDate);
        const isAdult = calculateAge(userBirthDate.getTime()) >= minAdultAge;
        const canGiveConsent = !isLeadPassenger && isAdult;
        return canGiveConsent ? (
            <div className="passenger-option-section">
                <h3 className="form-title">{personalDetailsConsentLabel}</h3>
                <div className="passenger-option-content">
                    <div className="option-row">
                        <div className="option-field-col2">
                            <div className="form-field-row">
                                <input
                                    type="radio"
                                    className="input-radio"
                                    name="consent"
                                    id="allowConsent"
                                    value="allow"
                                    checked={hasHoldConsent}
                                    onChange={this.updateCallBackConsect}
                                />
                                <label
                                    className="radio-label"
                                    htmlFor="allowConsent"
                                >
                                    {personalDetailsConsentAllow.replace(
                                        '{{leadPassenger}}',
                                        leadPaxName
                                    )}
                                </label>
                            </div>
                            <p className="option-text">
                                {personalDetailsConsentAllowDisclaimer.replace(
                                    '{{leadPassenger}}',
                                    leadPaxName
                                )}
                            </p>
                        </div>
                        <div className="option-field-col2">
                            <div className="form-field-row">
                                <input
                                    type="radio"
                                    className="input-radio"
                                    name="consent"
                                    id="denyConsent"
                                    value="deny"
                                    checked={!hasHoldConsent}
                                    onChange={this.updateCallBackConsect}
                                />
                                <label
                                    className="radio-label"
                                    htmlFor="denyConsent"
                                >
                                    {personalDetailsConsentDeny.replace(
                                        '{{leadPassenger}}',
                                        leadPaxName
                                    )}
                                </label>
                            </div>
                            <p className="option-text">
                                {personalDetailsConsentDenyDisclaimer.replace(
                                    '{{leadPassenger}}',
                                    leadPaxName
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        ) : null;
    }
}

export default paxConsentBlock;
