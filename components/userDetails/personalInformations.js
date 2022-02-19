import React, { Component } from 'react';
import FormSection from './formSection';
import DateBlock from './dateBlock';
import ApplyInfoSlot from './applyInfoSlot';
import FieldWithOverview from './fieldWithOverview';
import AddressBlock from './addressBlock';

import { composeName } from './formHelpers';
import { cloneData } from '../commons/CUK/utilities';

import { regex } from '../../library/js/config/regex';

class personalInformations extends Component {
    constructor(props) {
        super(props);
        this.state = {
            contactPoint: false,
            validate: true,
            modified: false,
            valueChanged: false,
        };
    }

    componentDidMount() {
        this.setState(() => ({
            ...this.initPassengerState()
        }));
    }

    componentDidUpdate(prevProps) {
        const { seqNumber } = this.props.passengersData[
            this.props.selectedPassengerIndex
        ];
        const { passengersData, selectedPassengerIndex } = prevProps;
        if (
            passengersData[selectedPassengerIndex].seqNumber.$ !== seqNumber.$
        ) {
            this.setState(() => ({
                ...this.initPassengerState()
            }));
        }
    }
    componentWillReceiveProps(nextProps) {
        // console.log('modified outside will receive props',nextProps);
        if (this.state.modified !== nextProps.modified) {
            // console.log('modified inside will receive props',this.state.modified);
            this.setState({
                modified: false
            })
        }
    }
    initPassengerState() {
        const { passengersData, selectedPassengerIndex } = this.props;
        const {
            individual: { birthDate, contactPoints }
        } = passengersData[selectedPassengerIndex];

        const contactPointIndex = 0;
        const contactPoint = cloneData(contactPoints[contactPointIndex]);

        const postalAddressIndex = contactPoint.postalAddress.findIndex(
            (postalAddress) => postalAddress.typeCode.$ === 'H'
        );
        contactPoint.emailAddress =
            contactPoint.emailAddress !== undefined
                ? contactPoint.emailAddress
                : {
                      fullAddressText: ''
                  };
        contactPoint.phoneNumber =
            contactPoint.phoneNumber !== undefined
                ? contactPoint.phoneNumber
                : {
                      descText: 'HOME',
                      typeCode: {
                          $: 'H'
                      },
                      numberText: ''
                  };
        return {
            contactPointIndex,
            postalAddressIndex,
            contactPoint,
            birthDate
        };
    }

    editModeHandler = (section, selectedSectionNode, s) => {
        const { editModeHandler } = this.props;
        editModeHandler && editModeHandler(section, selectedSectionNode, s);
    };

    editModeTrigger = (e) => {
        const { editModeHandler, section } = this.props;
        editModeHandler && editModeHandler(section);
    };

    handleConsent = (applyToOtherPassengers) => {
        this.setState(() => ({
            applyToOtherPassengers,
            modified : true
        }));
    };

    /*validateRequiredField(form, details) {
        details.map((item)=>{
            if(item === ''){
                this.setState({
                    requiredFieldFilled: false
                });
                break;
            }
        });
    }*/

    handleSubmit = (section) => {
        const {
            handleSubmit,
            passengersData,
            selectedPassengerIndex,
            consents
        } = this.props;
        const {
            contactPoint,
            contactPointIndex,
            postalAddressIndex,
            birthDate,
            applyToOtherPassengers
        } = this.state;

        const postalAddress = contactPoint.postalAddress[postalAddressIndex];

        const clonedPassengersData = cloneData(passengersData);

        const dataToSubmit = clonedPassengersData.reduce(
            (passengersArray, passenger, index) => {
                if (+index === +selectedPassengerIndex) {
                    passenger.individual.birthDate = birthDate;
                    passenger.individual.contactPoints[
                        contactPointIndex
                    ] = contactPoint;
                } else if (
                    applyToOtherPassengers &&
                    consents.find(
                        (consent) => +passenger.seqNumber.$ === +consent.seqNumber.$
                    )
                ) {
                    passenger.individual.contactPoints[
                        contactPointIndex
                    ].postalAddress[postalAddressIndex] = postalAddress;
                }
                passengersArray.push(passenger);
                return passengersArray;
            },
            []
        );

        handleSubmit && //validateRequiredField(form, details) &&
            handleSubmit(dataToSubmit, section, applyToOtherPassengers);
    };

    handleReset = () => {
        this.setState(() => {
            return {
                ...this.initPassengerState()
            };
        });
    };

    handleTextChange = (event) => {
        const {
            target: { name, value }
        } = event;

        let currentCountry, index;
        if(name === "county"){
            index= this.state.postalAddressIndex;
            currentCountry = this.state.contactPoint.postalAddress[index].countryCode && this.state.contactPoint.postalAddress[index].countryCode.$ ? this.state.contactPoint.postalAddress[index].countryCode.$ : '';
        }

        const dataCheck = this.checkVailidation;
        this.setState((prevState) => {
            const { postalAddressIndex } = prevState;
            const newState = cloneData(prevState);
            newState.modified = true;
            switch (name) {
                case 'postalCode':
                    newState.contactPoint.postalAddress[
                        postalAddressIndex
                    ].postCode = { $: value };
                    break;
                case 'houseNumber':
                    newState.contactPoint.postalAddress[
                        postalAddressIndex
                    ].buildingNameText = value;
                    break;
                case 'city':
                    newState.contactPoint.postalAddress[
                        postalAddressIndex
                    ].cityNameText = value;
                    break;
                case 'county':
                    if(currentCountry === "US") //YD
                    {
                        newState.contactPoint.postalAddress[postalAddressIndex].stateNameText = value;
                        newState.contactPoint.postalAddress[postalAddressIndex].countyNameText = value;
                        if(newState.contactPoint.postalAddress[postalAddressIndex].territoryNameText)
                            delete newState.contactPoint.postalAddress[postalAddressIndex].territoryNameText; 
                        // if(newState.contactPoint.postalAddress[postalAddressIndex].countyNameText)     
                        //     delete newState.contactPoint.postalAddress[postalAddressIndex].countyNameText;
                    }
                    else if(currentCountry === "AU"){
                        if(newState.contactPoint.postalAddress[postalAddressIndex].stateNameText)
                            delete newState.contactPoint.postalAddress[postalAddressIndex].stateNameText;

                        newState.contactPoint.postalAddress[postalAddressIndex].territoryNameText = value;
                        newState.contactPoint.postalAddress[postalAddressIndex].countyNameText = value;
                        // if(newState.contactPoint.postalAddress[postalAddressIndex].countyNameText)     
                        //     delete newState.contactPoint.postalAddress[postalAddressIndex].countyNameText;
                    }
                    else {
                       if(newState.contactPoint.postalAddress[postalAddressIndex].stateNameText)
                            delete newState.contactPoint.postalAddress[postalAddressIndex].stateNameText;
                       if(newState.contactPoint.postalAddress[postalAddressIndex].territoryNameText)
                            delete newState.contactPoint.postalAddress[postalAddressIndex].territoryNameText; 
                            
                        newState.contactPoint.postalAddress[postalAddressIndex].countyNameText = value;
                    }
                    break;
                case 'addressLine1':
                    newState.contactPoint.postalAddress[
                        postalAddressIndex
                    ].addressLine1 = value;
                    break;
                case 'addressLine2':
                    newState.contactPoint.postalAddress[
                        postalAddressIndex
                    ].addressLine2 = value;
                    break;
                case 'phone':
                    newState.contactPoint.phoneNumber.numberText = value;
                    break;
                case 'email':
                    newState.contactPoint.emailAddress.fullAddressText = value;
                    break;
            }
            return newState;
        });
    };

    handleCountryChange = (name, value, title, event) => {
        this.setState((prevState) => {
            const newState = cloneData(prevState);
            const { postalAddressIndex } = newState;
            newState.modified = true;
            newState.contactPoint.postalAddress[
                postalAddressIndex
            ].countryCode = { $: value };
            newState.contactPoint.postalAddress[
                postalAddressIndex
            ].countryNameText = title;

            return newState;
        });
    };

    handleSelectDate = (dateType, date) => {
        this.setState(() => ({ [`${dateType}Date`]: date, modified: true }));
    };

    renderOverviewPersonalInfo() {
        const {
            formFields: { name },
            passengersData,
            selectedPassengerIndex
        } = this.props;
        const {
            individual: { individualName }
        } = passengersData[selectedPassengerIndex];

        return (
            <div className="form-field-row">
                <label className="form-label">{`${name.label}:`}</label>
                <span className="form-field-value">
                    {composeName(individualName)}
                </span>
            </div>
        );
    }

    renderEditableFormFieldReadOnly(label, value, mandatory) {
        return (
            <div className="form-field-row">
                {mandatory?
                    (<label className="form-label">{`*${label}`}</label>)
                :    
                    (<label className="form-label">{`${label}`}</label>)}

                <div className={`common-input-group input-group read-only`}>
                    <div className="input-error-wrapper">
                        <input
                            className="input-field"
                            name={label}
                            type="text"
                            value={value}
                            readOnly={true}
                        />
                    </div>
                </div>
            </div>
        );
    }

    returnFlagValue = (e, v) => {
        const name = e.target.name;
        const value = v;
        this.setState({
            [`${name}value`]: value,
        }, () => {
            this.checkVailidation()
        })
    }

    checkVailidation() {
        Object.keys(this.state).map((key, value) => {
            if (key.endsWith("value") && value) {
                this.setState({
                    modified: false
                });
               // break;
            }
        })
    }

    handleErrorCallback = (error, errorMsg, event) => {
        const { valueChanged } = this.state;
        this.setState({
            valueChanged: !valueChanged
        })
    }

    render() {
        // console.log('props', this.props);
        if (this.state.contactPoint) {
            const {
                labels,
                editMode,
                section,
                formFields,
                passengersData,
                selectedPassengerIndex,
                leadPassenger
            } = this.props;
            const accesibilityLabels = this.props.accesibilityLabels ? this.props.accesibilityLabels : {};
            const {
                contactPoint,
                validate,
                postalAddressIndex,
                birthDate,
                modified,
                valueChanged
            } = this.state;

            const {
                title,
                firstName,
                middleName,
                lastName,
                phone,
                email,
                passengerConsent,
                address
            } = formFields;

            const { pleaseCompleteLabel, emailAddressTooltipMessage } = labels;

            const {
                individual: {
                    individualName: {
                        titleCode,
                        firstNameText,
                        middleNameText,
                        familyNameText
                    }
                }
            } = passengersData[selectedPassengerIndex];

            const {
                postalAddress,
                phoneNumber: { numberText },
                emailAddress: { fullAddressText }
            } = contactPoint;

            const theAddress = postalAddress[postalAddressIndex];

            //const { telephone_generic } = regex;

            let middleNameValue;
                if (middleNameText === "NMN") {
                middleNameValue = '';
                } else {
                middleNameValue = middleNameText;
                }

            return (
                <FormSection
                    key={section}
                    editMode={editMode}
                    editModeHandler={this.editModeHandler}
                    section={section}
                    labels={labels}
                    accesibilityLabels={accesibilityLabels}
                    handleSubmit={this.handleSubmit}
                    handleReset={this.handleReset}
                    subtitle={false}
                    modified={modified}
                    hasConsent={this.props.hasConsent}
                    valueChanged={valueChanged}
                >
                    <div className={`form-overview`}>
                        <form
                            className="passenger-form"
                            name="passengerForm"
                            id="passengerForm"
                        >
                            {this.renderOverviewPersonalInfo()}
                            <DateBlock
                                key="birth"
                                date={birthDate}
                                formField={formFields.birthDate}
                                dateType="birth"
                                editMode={editMode}
                                validate={this.state.validate}
                                updateHandler={this.handleSelectDate}
                                editModeTrigger={this.editModeTrigger}
                                pleaseCompleteLabel={pleaseCompleteLabel}
                                formFields={{
                                    month: formFields.month,
                                    year: formFields.year,
                                    day: formFields.day
                                }}
                                section={section}
                            />
                            <AddressBlock
                                {...theAddress}
                                key="primary"
                                addressType="primary"
                                editMode={editMode}
                                country={formFields.country}
                                editModeTrigger={this.editModeTrigger}
                                pleaseCompleteLabel={pleaseCompleteLabel}
                                formFields={formFields}
                                accesibilityLabels={accesibilityLabels}
                                validate={this.state.validate}
                                textChangeHandler={this.handleTextChange}
                                countryChangeHandler={this.handleCountryChange}
                                address={address}
                                country={formFields.country}
                                showAstrick={true}
                                hasConsent={this.props.hasConsent}
                                handleErrorCallback={this.handleErrorCallback}
                            />
                            {leadPassenger &&
                                editMode && (
                                    <div className="form-field-row">
                                        <ApplyInfoSlot
                                            consentHandler={this.handleConsent}
                                            label={passengerConsent.label}
                                            section={section}
                                        />
                                    </div>
                                )}
                            <FieldWithOverview
                                data={numberText}
                                editMode={editMode}
                                hasTooltip={false}
                                accesibilityLabels={accesibilityLabels}
                                pleaseCompleteLabel={pleaseCompleteLabel}
                                key="phone"
                                name="phone"
                                formField={phone}
                                showAstrick={true}
                                validate={this.state.validate}
                                regex={atob(formFields.phone.regex)}
                                changeHandler={this.handleTextChange}
                                editModeTrigger={this.editModeTrigger}
                                returnFlagValue={this.returnFlagValue}
                                handleErrorCallback={this.handleErrorCallback}
                                hasConsent={this.props.hasConsent}
                            />
                            <FieldWithOverview
                                accesibilityLabels={accesibilityLabels}
                                data={fullAddressText}
                                editMode={editMode}
                                hasTooltip={true}
                                tooltipLabel={emailAddressTooltipMessage}
                                pleaseCompleteLabel={pleaseCompleteLabel}
                                key="email"
                                name="email"
                                formField={email}
                                showAstrick={false}
                                validate={this.state.validate}
                                regex={atob(formFields.email.regex)}
                                changeHandler={this.handleTextChange}
                                editModeTrigger={this.editModeTrigger}
                                handleErrorCallback={this.handleErrorCallback}
                                hasConsent={this.props.hasConsent}
                            />
                        </form>
                    </div>
                </FormSection>
            );
        } else {
            return null;
        }
    }
}

export default personalInformations;


