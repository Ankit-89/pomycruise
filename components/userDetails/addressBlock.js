import React, { Component } from 'react';
import InputField from '../commons/CUK/inputField';
import SelectField from '../commons/CUK/selectField';
import { regex } from '../../library/js/config/regex';
import { createOptionsArray, compareAndCreateOption } from './formHelpers';

class addressBlock extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedCountry: { label: '', value: '' },
            countyVisible: false
        };
    }

    componentDidMount() {
        const { country } = this.props;
        this.countryOptions = createOptionsArray(country.options);
        this.setState(() => ({
            ...this.initAddress()
        }));
    }

    componentDidUpdate(prevProps) {
        if (prevProps !== this.props) {
            this.setState(() => ({
                ...this.initAddress()
            }));
        }
    }

    initAddress() {
        const { countryCode = { $: '' } } = this.props;
        const selectedCountry = compareAndCreateOption(
            this.countryOptions,
            countryCode ? countryCode.$ : ''
        );
        let countyVisible = selectedCountry.regionLabel !== undefined;

        if (window.configs.locale.toLowerCase() == "de_de") {
            countyVisible = false
        }

        let countyLabell;
        if (countryCode.$.toLowerCase() == "us") {
            countyLabell = "State";
        }
        else if (countryCode.$.toLowerCase() == "au") {
            countyLabell = "Territory";
        }
        else {
            countyLabell = this.props.formFields.county.label;
        }

        return {
            selectedCountry,
            countyVisible,
            countyLabell
        };
    }
    handleEditMode = (e) => {
        if( e.type === 'keypress' && e.key !== 'Enter' ) {
            return false;
        } 
        const { editModeTrigger } = this.props;
        editModeTrigger && editModeTrigger(e);
    };

    handleTextChange = (event) => {
        const { textChangeHandler } = this.props;
        textChangeHandler && textChangeHandler(event);
    };

    handleCountryChange = (name, value, title, event) => {
        const { countryChangeHandler } = this.props;
        countryChangeHandler && countryChangeHandler(name, value, title, event);
    };

    renderOverview() {
        const {
            pleaseCompleteLabel,
            address,
            addressLine1 = '',
            addressLine2 = '',
            cityNameText = '',
            postCode = '',
            buildingNameText = '',
            countyNameText = '',
            countryCode = { $: '' },
            showAstrick,
            addressType
        } = this.props;

        const { selectedCountry, countyVisible } = this.state;

        const isAddressCompleted = (addressType === "emergencyContact") ? true : addressLine1 !== '' && cityNameText !== '' && (postCode && postCode.$ !== '') && (countryCode && countryCode.$ !== '');

        return (
            <div className="form-field-row">
                <label className="form-label">{`${address.required && showAstrick ? '*' : ''}${
                    address.label
                    }:`}</label>
                <span
                    className={`form-field-value ${!isAddressCompleted &&
                        'form-label-empty'} ${!isAddressCompleted &&
                        address.required && showAstrick &&
                        'form-missing-field'} ${address.required &&
                        'required-field'}`}
                >
                    {isAddressCompleted ? (
                        <span>
                            {`${addressLine1} ${
                                addressLine2 !== '' ? `${addressLine2} ` : ''
                                }`}
                            <br />
                            {`${cityNameText}, ${postCode && postCode.$ ? `${postCode.$}` : ''}`}
                            <br />
                            {`${countyVisible ? `${countyNameText} - ` : ``}${
                                selectedCountry.label
                                }`}
                        </span>
                    ) : showAstrick && this.props.hasConsent ? (
                        <span tabIndex={0} onKeyPress={this.handleEditMode} onClick={this.handleEditMode}>
                            {pleaseCompleteLabel}
                        </span>
                    ) : ''}
                </span>
            </div>
        );
    }
    handleErrorCallback = (error, errorMsg, event) => {
        const { handleErrorCallback } = this.props;
        handleErrorCallback && handleErrorCallback(error, errorMsg, event);
    }
    renderForm() {
        const {
            formFields,
            validate,
            addressLine1,
            addressLine2,
            cityNameText,
            countryCode,
            postCode,
            buildingNameText,
            countyNameText,
            address,
            showAstrick,
            countryNameText,
        } = this.props;
        const accesibilityLabels = this.props.accesibilityLabels ? this.props.accesibilityLabels : {};
        const clearFeild = accesibilityLabels.clearFeild ? accesibilityLabels.clearFeild : '';
        const { selectedCountry, countyVisible, countyLabell } = this.state;
        const { zip, houseNumber, country, city, county } = formFields;
        const disableValidation = showAstrick ? false : true;
        let countyValue; //YD for the first time it will go in default as we are not getting countryNameText field, stateNameText or territory in the booking summary response but when the states get change it will go as per the country.
        if (countryNameText == "United States")
            countyValue = this.props.stateNameText;
        else if (countryNameText == "Australia")
            countyValue = this.props.territoryNameText;
        else
            countyValue = this.props.countyNameText;

        const isAddressCompleted =
            addressLine1 !== '' &&
            cityNameText !== '' &&
            (postCode && postCode.$ !== '') &&
            (countryCode && countryCode.$ !== '');
        return (
            <div
                className={`${!isAddressCompleted &&
                    address.required && showAstrick &&
                    'form-missing-field'} ${address.required &&
                    'required-field'}`}
                style={{ marginTop: '25px' }}
            >
                {/* <div className="form-field-row">
                    <InputField
                        type="text"
                        required={true}
                        id="houseNumber"
                        name="houseNumber"
                        placeholder={`*${houseNumber.label}`}
                        value={buildingNameText}
                        changeCallback={this.handleTextChange}
                        validate={this.state.validate}
                        regex={regex.houseNumber}
                        errorMsg={houseNumber.error}
                        showAstrick={showAstrick}
                    />
                </div> */}
                <div className="form-field-row">
                    <InputField
                        type="text"
                        required={true}
                        id="addressLine1"
                        name="addressLine1"
                        placeholder={showAstrick ? `*${formFields.addressLine1.label}` : `${formFields.addressLine1.label}`}
                        value={addressLine1}
                        changeCallback={this.handleTextChange}
                        validate={validate}
                        regex={atob(formFields.addressLine1.regex)}
                        errorMsg={formFields.addressLine1.error}
                        showAstrick={showAstrick}
                        errorCallback={this.handleErrorCallback}
                        errorLabel={clearFeild}
                    />
                    <div className="common-input-group input-group">
                        <input
                            className="input-field"
                            id="addressLine2"
                            name="addressLine2"
                            type="text"
                            value={addressLine2}
                            placeholder={`${formFields.addressLine1.label}`}
                            onChange={this.handleTextChange}
                        />
                    </div>
                </div>
                <div className="form-field-row">
                    <label className="form-label-1">
                        {showAstrick ? `*${country.label}` : `${country.label}`}
                    </label>
                    {this.countryOptions && (
                        <SelectField
                            selectClassName="select-passenger-country"
                            ariaRequired={true}
                            name="country"
                            label={country.label}
                            showLabel={false}
                            defaultValue={country.label}
                            value={selectedCountry.value}
                            title={selectedCountry.label}
                            options={this.countryOptions}
                            errorMsg={country.error}
                            changeCallback={this.handleCountryChange}
                            disableValidation={disableValidation}
                            errorCallback={this.handleErrorCallback}
                        />
                    )}
                </div>
                <div className="form-field-row">
                    <InputField
                        type="text"
                        required={true}
                        id="city"
                        name="city"
                        placeholder={showAstrick ? `*${city.label}` : `${city.label}`}
                        value={cityNameText}
                        changeCallback={this.handleTextChange}
                        validate={this.state.validate}
                        regex={regex.city}
                        errorMsg={city.error}
                        showAstrick={showAstrick}
                        errorCallback={this.handleErrorCallback}
                        errorLabel={clearFeild}
                    />
                </div>
                {countyVisible && (
                    <div className="form-field-row">
                        <InputField
                            type="text"
                            required={true}
                            id="county"
                            name="county"
                            placeholder={`${countyLabell}`}
                            value={countyValue}
                            changeCallback={this.handleTextChange}
                            validate={this.state.validate}
                            errorMsg={county.error}
                            regex={regex.county}
                            showAstrick={false}
                            errorCallback={this.handleErrorCallback}
                            errorLabel={clearFeild}
                        />
                    </div>
                )}
                <div className="form-field-row">
                    <InputField
                        type="text"
                        required={true}
                        id="postalCode"
                        name="postalCode"
                        placeholder={showAstrick ? `*${zip.label}` : `${zip.label}`}
                        value={postCode ? postCode.$ : ''}
                        changeCallback={this.handleTextChange}
                        validate={this.state.validate}
                        regex={atob(formFields.zip.regex)}
                        errorMsg={zip.error}
                        showAstrick={showAstrick}
                        errorCallback={this.handleErrorCallback}
                        errorLabel={clearFeild}
                    />
                </div>
            </div>
        );
    }
    render() {
        const { editMode } = this.props;
        return editMode ? this.renderForm() : this.renderOverview();
    }
}

export default addressBlock;

// WEBPACK FOOTER //
// ./components/userDetails/addressBlock.js
