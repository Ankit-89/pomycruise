import React from 'react';
import InputField from '../commons/CUK/inputField';
import SelectField from '../commons/CUK/selectField';
import { regex } from '../../library/js/config/index';

class styleGuide extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            inputBox: '',
            selectBox: '',
            dropDownValue: '',
            dropDownTitle: '',
            inputValidate: false,
            selectValidate: false,
            errors: {},
            checkBox: true
        };
    }

    handleInputBoxChange = (evt) => {
        if (evt.target.name === 'inputBox') {
            this.setState({
                inputBox: evt.target.value
            });
        }
    };

    handleError = (stateKey, errorState, errorMsg) => {
        let errors = this.state.errors;

        if (errorState) {
            if (errorMsg) {
                errors[stateKey] = errorMsg;
            } else if (errors[stateKey]) {
                /* selectField returns empty message with error value as false, which needs to be removed from error Summary */
                delete errors[stateKey];
            }
        } else {
            if (errors[stateKey]) {
                delete errors[stateKey];
            }
        }
        this.setState({
            ...this.state,
            errors
        });
    };

    handleSelectBoxChange = (name, value, title, event) => {
        this.setState({
            selectValidate: true,
            dropDownValue: value,
            dropDownTitle: title
        });
    };

    handleCheckBoxChange = (event) => {
        const target = event.target;
        const value =
            target.type === 'checkbox' ? target.checked : target.value;

        this.setState({
            checkBox: value
        });
    };

    render() {
        const { inputBox, selectBox, checkBox } = this.props;

        return (
            <form name="sampleForm">
                <li className="item">
                    <InputField
                        type="text"
                        required={true}
                        label={inputBox.label}
                        name="inputBox"
                        changeCallback={this.handleInputBoxChange}
                        placeholder={inputBox.label}
                        value={this.state.inputBox}
                        regex={regex.inputBox}
                        validate={this.state.inputValidate}
                        errorMsg={inputBox.error}
                        errorCallback={(errorState, errorMsg) =>
                            this.handleError('inputBox', errorState, errorMsg)
                        }
                        showAstrick={true}
                    />
                    <pre>@apply input-group;</pre>
                </li>
                <li className="item">
                    <SelectField
                        name="selectBox"
                        label={selectBox.label}
                        validate={this.state.selectValidate}
                        defaultValue={selectBox.label}
                        value={this.state.dropDownValue}
                        title={this.state.dropDownTitle}
                        options={selectBox.options}
                        showLabel={true}
                        errorMsg={selectBox.error}
                        changeCallback={(name, value, title, event) =>
                            this.handleSelectBoxChange(
                                name,
                                value,
                                title,
                                event
                            )
                        }
                        errorCallback={(errorState, errorMsg) =>
                            this.handleError('selectBox', errorState, errorMsg)
                        }
                    />
                    <pre>@apply select-group;</pre>
                </li>
                <li className="item">
                    <input
                        type="checkbox"
                        id="sampleCheckBox"
                        checked={this.state.checkBox}
                        onChange={this.handleCheckBoxChange}
                    />
                    <label htmlFor="sampleCheckBox" className="checkbox-label">
                        {checkBox.label}
                    </label>
                    <pre>@mixin input-checkbox;</pre>
                </li>
            </form>
        );
    }
}

export default styleGuide;
