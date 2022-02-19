import React, { Component } from 'react';

class bookletBlock extends Component {
    constructor(props) {
        super(props);
    }

    handleBookletOptChange = (e) => {
        const { currentTarget } = e;
        const { value } = currentTarget;

        const { bookletOptChangeHandler } = this.props;
        bookletOptChangeHandler && bookletOptChangeHandler(value === 'allow');
    };

    render() {
        const {
            labels: {
                bookletOptLabel,
                bookletOptDisclaimer,
                bookletOptAllow,
                bookletOptDeny,
                bookletOptNoMoreEditable
            },
            stillEditable,
            bookletOp
        } = this.props;

        return (
            <div className="passenger-option-section">
                <h3 className="form-title">{bookletOptLabel}</h3>
                <div
                    className={`${
                        !stillEditable ? 'disable' : ''
                    } passenger-option-content`}
                >
                    <div className="option-row">
                        <p className="option-text">{bookletOptDisclaimer}</p>
                    </div>
                    <div className="option-row">
                        <div className="option-field-col2">
                            <div className="form-field-row">
                                <input
                                    type="radio"
                                    className="input-radio"
                                    name="leadConsent"
                                    id="allowLeadConsent"
                                    value="allow"
                                    disabled={!stillEditable}
                                    checked={!bookletOp}
                                    onChange={this.handleBookletOptChange}
                                    //defaultChecked={hasBooklet}
                                />
                                <label
                                    className="radio-label"
                                    htmlFor="allowLeadConsent"
                                >
                                    {bookletOptAllow}
                                </label>
                            </div>
                        </div>
                        <div className="option-field-col2">
                            <div className="form-field-row">
                                <input
                                    type="radio"
                                    className="input-radio"
                                    name="leadConsent"
                                    id="denyLeadConsent"
                                    disabled={!stillEditable}
                                    value="deny"
                                    checked={bookletOp}
                                    onChange={this.handleBookletOptChange}
                                    // defaultChecked={!hasBooklet}
                                />
                                <label
                                    className="radio-label"
                                    htmlFor="denyLeadConsent"
                                >
                                    {bookletOptDeny}
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                {!stillEditable && (
                    <p className="noMoreEditable">{bookletOptNoMoreEditable}</p>
                )}
            </div>
        );
    }
}

export default bookletBlock;
