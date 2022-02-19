import React from 'react';
import PropTypes from 'prop-types';
/**
 * Common InputField component
 * Props :
 * name,
 * value,
 * inputClass,
 * errorMsg - {empty: 'error for empty value', invalid: 'invalid input'}
 * hideLabel - hide/show Label
 * customErrorMsg - string - custom error message
 * showError - show/hide errors, custom errors
 * readOnly
 * changeCallback - function to be invoked on change of input
 * blurCallBack - function to be invoked on focus out of input
 * blurCallBack - function to be invoked on focus out of input
 * keyPressCallback - function to be invoked on key press
 * @returns {ReactElement}  react element
 */
class InputField extends React.Component {

    constructor(props) {

        super(props);

        this.state = {
            showError: false,
            showBorderError: false,
            errorMsg: this.props.errorMsg ? this.props.errorMsg.empty : null,
            valueChanged: false,
            validate: this.props.validate,
            showCustomError: this.props.showCustomError,
            customErrorMsg: this.props.customErrorMsg,
            showClearInput: false
        };

        this.regex = new RegExp(this.props.regex);
    }

    /**
     * Checks for updated props for resulting them into state change
     * For custom error messages and custom error controls -
     *      showCustomError - controlls the visibility of error message
     *      customErrorMsg - error message to show
     *
     * @param {array} nextProps - contains the updated props
     */
    componentWillReceiveProps = (nextProps) => {

        this.regex = new RegExp(nextProps.regex);
        if (nextProps.validate === true && this.props.validate !== nextProps.validate ) {
            this.validate();
        }

        [ 'showCustomError', 'customErrorMsg' ]
            .every( propName => this.handleStateChangeForUpdatedProps(nextProps[propName], propName));
    }

    /**
     *  handleStateChangeForUpdatedProps - check for updated props and changes states accordingly
     * @param {string|boolean} propValue - value of the prop
     * @param {string} stateName - state to be updated
     * @returns {boolean} true
     */
    handleStateChangeForUpdatedProps = (propValue, stateName) => {
        if (typeof propValue !== 'undefined' && this.state[stateName] !== propValue ) {
            this.setState({
                [stateName]: propValue
            });
        }

        return true;
    }

    /**
     * handleChange - handles the input changes
     * @param {object} event - event that has been triggered
     */
    handleChange = (event) => {
        const inputValue = this.inputField.value;

        if ( !(inputValue && inputValue.length) ) {

            this.setState({
                showError: false,
                showClearInput: false
            });
        }

        if ( this.props.changeCallback ) {

            this.props.changeCallback( event );
        }

        this.setState({
            valueChanged: ( this.inputField.value.length > 0 )
        });
    }

    /**
     * callErrorCallback - handles error callbacks
     * @param {object} error - the error occured
     * @param {string} errorMsg - error message to display
     * @param {event} event - event
     */
    callErrorCallback = (error, errorMsg, event) => {

        if ( this.props.errorCallback ) {

            this.props.errorCallback(error, errorMsg, event);
        }
    }

    /**
     * Restricts negative values in date and year fields
     * @param {event} e key press event
     */
    allowNumbersOnly = (e) => {
        var inputKeyCode = e.keyCode ? e.keyCode : e.which;

        // Allow backspace, tab, enter, ctrl, alt, caps lock, escape, left arrow, up arrow, right arrow, down arrow, delete
        const allowedFunctions = [ 8, 9, 13, 17, 18, 20, 27, 37, 38, 39, 40, 46 ];

        if (inputKeyCode !== null) {

            let charVal = String.fromCharCode(inputKeyCode);

            if ( (isNaN(charVal)) && allowedFunctions.indexOf(inputKeyCode) === -1 ) {

                e.preventDefault();
            }
        }
    }

    /**
     * callKeyPressCallback - handles input error callbacks
     * @param {event} event - event
     */
    callKeyPressCallback = (event) => {

        this.props.numberOnly ? this.allowNumbersOnly(event) : '';

        if ( this.props.onKeyPressCallback ) {

            this.props.onKeyPressCallback(event);
        }
    }

    /**
     * getError - handles errors
     * @returns {object}
     */
    getError() {

        if ( this.props.errorMsg && this.props.errorMsg.empty && !this.inputField.value ) {
            return {
                error: true,
                borderError: false,
                errorMsg: this.props.errorMsg.empty
            };
        }

        else if ( this.props.errorMsg && this.props.errorMsg.invalid && !this.regex.test( this.inputField.value ) ) {

            return {
                error: true,
                borderError: true,
                errorMsg: this.props.errorMsg.invalid
            };
        }

        else {

            return {
                error: false,
                borderError: false
            };
        }
    }

    /**
     * validate - validates the value in input field.
     * @param {event} event - event
     */
    validate = (event) => {
        if ( this.inputField.value.length === 0 ) {
            this.setState({
                valueChanged: false
            });
        }

        const { error, errorMsg, borderError } = this.getError();

        if (error) {
            let prevState = this.state.showError;

            this.setState({
                showError: error,
                errorMsg: errorMsg
            });

            if ( !this.inputField.value || this.inputField.value === '' || this.inputField.value === null ) {
                this.setState({
                    showClearInput: false
                });
            }
            else {
                this.setState({
                    showClearInput: true
                }, () => {
                    if (!prevState) {
                        this.errorIcon.focus();
                    }
                });
            }
        }

        else {

            this.setState({
                showError: error
            });

        }

        this.setState({
            showBorderError: borderError,
            errorMsg: errorMsg
        });

        this.callErrorCallback(error, errorMsg, event);
    }

    /**
     * Handles Component mount - This sets the initial state for label if some value is already present
     */
    componentDidMount() {

        if ( this.inputField.value.length > 0 ) {

            this.setState({
                valueChanged: true
            });
        }

    }
    /**
     * handleOnFocus - event to hide placeholder on focus
     */
    handleOnFocus = () => {
        this.setState({
            valueChanged: true
        });
    }

    /**
     * Clears the input field , sets the value as empty string
     * @param {object} e - event triggered
     */
    clearInput = (e) => {
        this.setState({
            showError: false,
            showBorderError: false,
            valueChanged: false,
            showClearInput: false
        }, (e = {}) => {
            this.inputField.value = '';
            Object.assign(e, { target: { name: this.props.name, value: '' } });
            this.handleChange(e);
            this.inputField.focus();
        });
    }

    hasError = () => {
        return Boolean((this.state.showError || this.state.showBorderError || this.state.showCustomError));
    }

    render() {
        let {
                type,
                name,
                placeholder,
                value,
                inputClass,
                label,
                min,
                max,
                ariaLabel,
                maxLength,
                minLength,
                readOnly,
                blurCallBack,
                required,
                id,
                errorLabel,
                restrictAutoComplete
            } = this.props;

        const valueAttr = [];

        type = type || 'text';
        name = name || '';
        placeholder = placeholder || '';
        inputClass = inputClass || '';
        label = label || false;
        min = min;
        max = max;
        ariaLabel = ariaLabel;
        id = id || name;

        valueAttr['value'] = value;
        let bordertabIndex = this.state.showBorderError ? { tabIndex: 0 } : { tabIndex: -1 };
        let labelClass = this.state.valueChanged ? `input-label show` : `input-label`,
            placeHolderValue = placeholder;

        placeholder = this.state.valueChanged ? '' : ( label ? label : placeHolderValue);

        return (
            <div className={`common-input-group input-group ${inputClass} ${this.state.showBorderError || this.state.showError ? 'show-error' : ''} ${readOnly ? 'read-only' : ''}`}>
                <label htmlFor={id}
                    id={ `${ id }-label` }
                    className={`${labelClass}`}>{ariaLabel ? ariaLabel : (label ? label : placeHolderValue)}
                </label>
                <div className='input-error-wrapper'>
                    <input
                        ref={inputField => this.inputField = inputField}
                        type={type}
                        id={id}
                        aria-labelledby={ `${ id }-label` }
                        className='input-field'
                        name={name}
                        placeholder={placeholder}
                        onChange={this.handleChange}
                        onKeyPress={ this.callKeyPressCallback }
                        {...valueAttr}
                        onBlur={ (e) => {
                            this.validate(e);
                            blurCallBack(e);
                        }}
                        onFocus={this.handleOnFocus}
                        aria-required = { required }
                        aria-invalid={this.hasError()}
                        min={min}
                        max={max}
                        maxLength={maxLength}
                        minLength={minLength}
                        aria-label= {ariaLabel}
                        readOnly={readOnly}
                        autoComplete={ restrictAutoComplete && ( (name === 'email') ? `off` : `new-${name}` ) }
                    />
                    <span aria-label={errorLabel} role='button' className={`error-image ${this.state.showError && this.state.showClearInput ? 'show-image' : ''}`} {...bordertabIndex} ref={errorIcon => this.errorIcon = errorIcon} onKeyPress={(e) => this.clearInput(e)} onClick={(e) => this.clearInput(e)}></span>
                </div>
                <p className={`error-msg ${this.hasError() ? 'show-msg' : ''}`}>{this.state.showCustomError ? this.state.customErrorMsg : this.state.errorMsg}</p>
            </div>
        );
    }
}

export default InputField;

InputField.propTypes = {
    type: PropTypes.string,
    name: PropTypes.string,
    placeholder: PropTypes.string,
    value: PropTypes.string,
    inputClass: PropTypes.string,
    label: PropTypes.bool,
    min: PropTypes.string,
    max: PropTypes.string,
    ariaLabel: PropTypes.string,
    maxLength: PropTypes.string,
    minLength: PropTypes.string,
    readOnly: PropTypes.bool,
    keyPressCallback: PropTypes.func,
    blurCallBack: PropTypes.func,
    changeCallback: PropTypes.func,
    errorCallback: PropTypes.func,
    required: PropTypes.bool
};

InputField.defaultProps = {
    type: 'text',
    name: '',
    placeholder: '',
    inputClass: '',
    label: false,
    required: false,
    keyPressCallback: () => {},
    blurCallBack: () => {},
    changeCallback: () => {},
    errorCallback: () => {}
};
