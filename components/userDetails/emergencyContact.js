import React, { Component } from 'react';
import FormSection from './formSection';
import AddressBlock from './addressBlock';
import ApplyInfoSlot from './applyInfoSlot';
import FieldWithOverview from './fieldWithOverview';

import { regex } from '../../library/js/config/regex';
import { cloneData } from '../commons/CUK/utilities';

class emergencyContact extends Component {
    constructor(props) {
        super(props);
        this.state = {
            emergencyContact: false,
            validate: true,
            modified: false
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
        // console.log('modified outside will receive props', nextProps);
        if (this.state.modified !== nextProps.modified) {
            // console.log('modified inside will receive props', this.state.modified);
            this.setState({
                modified: false
            })
        }
    }

    initPassengerState() {
        const { passengersData, selectedPassengerIndex } = this.props;
        const { emergencyContact } = passengersData[selectedPassengerIndex];
        if (emergencyContact) {
            const newEmergencyContact = cloneData(emergencyContact);

            const dayTimeIndex = newEmergencyContact.contactPhone.findIndex(
                ({ typeCode }) => typeCode.$ === 'D'
            );
            const eveningTimeIndex = newEmergencyContact.contactPhone.findIndex(
                ({ typeCode }) => typeCode.$ === 'E'
            );
            const addressIndex = newEmergencyContact.Address.findIndex(
                ({ typeCode }) => typeCode.$ === 'P'
            );

            return {
                dayTimeIndex,
                eveningTimeIndex,
                addressIndex,
                emergencyContact: newEmergencyContact
            };
        } else {
            return {
                dayTimeIndex: 0,
                eveningTimeIndex: 1,
                addressIndex: 0,
                emergencyContact: {
                    Address: [
                        {
                            typeCode: {
                                $: 'P'
                            },
                            typeDescription: 'Primary Address',
                            countryCode: { $: '' }
                        }
                    ],
                    contactPhone: [
                        {
                            typeText: 'Daytime',
                            number: '',
                            typeCode: {
                                $: 'D'
                            }
                        },
                        {
                            typeText: 'Evening',
                            number: '',
                            typeCode: {
                                $: 'E'
                            }
                        }
                    ]
                }
            };
        }
    }
    editModeHandler = (section, selectedSectionNode, s) => {
        const { editModeHandler } = this.props;
        editModeHandler && editModeHandler(section, selectedSectionNode, s);
    };
    editModeTrigger = () => {
        const { editModeHandler, section } = this.props;
        editModeHandler && editModeHandler(section);
    };

    handleTextChange = (event) => {
        const {
            target: { name, value }
        } = event;

        let currentCountry, index;
        if (name === "county") {
            index = this.state.addressIndex;
            currentCountry = this.state.emergencyContact.Address[index].countryCode && this.state.emergencyContact.Address[index].countryCode.$ ? this.state.emergencyContact.Address[index].countryCode.$ : '';
        }

        this.setState((prevState) => {
            const { addressIndex, dayTimeIndex, eveningTimeIndex } = prevState;
            const newState = cloneData(prevState);
            newState.modified = true;
            switch (name) {
                case 'contactName':
                    newState.emergencyContact.lastName = value;
                    break;
                case 'relationship':
                    newState.emergencyContact.relationshipText = value;
                    break;
                case 'houseNumber':
                    newState.emergencyContact.Address[
                        addressIndex
                    ].buildingNameText = value;
                    break;
                case 'city':
                    newState.emergencyContact.Address[
                        addressIndex
                    ].cityNameText = value;
                    break;
                case 'county':
                    // newState.emergencyContact.Address[
                    //     addressIndex
                    // ].countyNameText = value;
                    if (currentCountry === "US") //YD
                    {
                        newState.emergencyContact.Address[addressIndex].stateNameText = value;
                        newState.emergencyContact.Address[addressIndex].countyNameText = value;
                        if (newState.emergencyContact.Address[addressIndex].territoryNameText) {
                            delete newState.emergencyContact.Address[addressIndex].territoryNameText;
                        }
                        // if (newState.emergencyContact.Address[addressIndex].countyNameText) {
                        //     delete newState.emergencyContact.Address[addressIndex].countyNameText;
                        // }
                    }
                    else if (currentCountry === "AU") {
                        newState.emergencyContact.Address[addressIndex].territoryNameText = value;
                        newState.emergencyContact.Address[addressIndex].countyNameText = value;
                        if (newState.emergencyContact.Address[addressIndex].stateNameText) {
                            delete newState.emergencyContact.Address[addressIndex].stateNameText;
                        }
                        // if (newState.emergencyContact.Address[addressIndex].countyNameText) {
                        //     delete newState.emergencyContact.Address[addressIndex].countyNameText;
                        // }
                    }
                    else {
                        if (newState.emergencyContact.Address[addressIndex].stateNameText) {
                            delete newState.emergencyContact.Address[addressIndex].stateNameText;
                        }
                        if (newState.emergencyContact.Address[addressIndex].territoryNameText) {
                            delete newState.emergencyContact.Address[addressIndex].territoryNameText;
                        }
                        newState.emergencyContact.Address[addressIndex].countyNameText = value;
                    }
                    break;
                case 'postalCode':
                    newState.emergencyContact.Address[addressIndex].postCode = {
                        $: value
                    };
                    break;
                case 'addressLine1':
                    newState.emergencyContact.Address[
                        addressIndex
                    ].addressLine1 = value;
                    break;
                case 'addressLine2':
                    newState.emergencyContact.Address[
                        addressIndex
                    ].addressLine2 = value;
                    break;
                case 'dayTimeNumber':
                    newState.emergencyContact.contactPhone[
                        dayTimeIndex
                    ].number = value;
                    break;
                case 'eveningNumber':
                    newState.emergencyContact.contactPhone[
                        eveningTimeIndex
                    ].number = value;
                    break;
            }
            return newState;
        });
    };

    handleCountryChange = (name, value, title, event) => {
        this.setState((prevState) => {
            const newState = cloneData(prevState);
            const { addressIndex } = newState;
            newState.modified = true;
            newState.emergencyContact.Address[addressIndex].countryCode = {
                $: value
            };
            newState.emergencyContact.Address[
                addressIndex
            ].countryNameText = title;

            return newState;
        });
    };

    handleReset = () => {
        this.setState(() => {
            return {
                ...this.initPassengerState()
            };
        });
    };

    handleSubmit = (section) => {
        const {
            handleSubmit,
            passengersData,
            selectedPassengerIndex,
            consents
        } = this.props;
        const { emergencyContact, applyToOtherPassengers } = this.state;

        const clonedPassengersData = cloneData(passengersData);

        const dataToSubmit = clonedPassengersData.reduce(
            (passengersArray, passenger, index) => {
                if (+index === +selectedPassengerIndex) {
                    passenger.emergencyContact = emergencyContact;
                } else if (
                    applyToOtherPassengers &&
                    consents.find(
                        (consent) => +passenger.seqNumber.$ === +consent.seqNumber.$
                    )
                ) {
                    passenger.emergencyContact.firstName =
                        emergencyContact.firstName;
                    passenger.emergencyContact.lastName =
                        emergencyContact.lastName;
                    passenger.emergencyContact.Address =
                        emergencyContact.Address;
                    passenger.emergencyContact.contactPhone =
                        emergencyContact.contactPhone;
                }
                passengersArray.push(passenger);
                return passengersArray;
            },
            []
        );

        dataToSubmit.emergencyContact = emergencyContact;
        handleSubmit && handleSubmit(dataToSubmit, section);
    };
    handleConsent = (applyToOtherPassengers) => {
        this.setState(() => ({
            applyToOtherPassengers,
            modified : true
        }));
    };

    render() {
        const { emergencyContact } = this.state;
        if (emergencyContact) {
            const {
                formFields,
                labels,
                editMode,
                section,
                leadPassenger
            } = this.props;
            const {
                validate,
                dayTimeIndex,
                eveningTimeIndex,
                addressIndex,
                modified
            } = this.state;
            const {
                contactName,
                relationship,
                dayTimeNumber,
                eveningNumber,
                passengerConsent,
                contactAddress
            } = formFields;
            const { pleaseCompleteLabel } = labels;
            const {
                lastName,
                relationshipText,
                contactPhone,
                Address
            } = emergencyContact;
            const theAddress = Address[addressIndex];
            const accesibilityLabels = this.props.accesibilityLabels ? this.props.accesibilityLabels : {};

            return (
                <FormSection
                    key={section}
                    editMode={editMode}
                    editModeHandler={this.editModeHandler}
                    section={section}
                    labels={labels}
                    handleSubmit={this.handleSubmit}
                    handleReset={this.handleReset}
                    subtitle={false}
                    modified={modified}
                    hasConsent={this.props.hasConsent}
                >
                    <div className={`form-${editMode ? 'edit' : 'overview'}`}>
                        <form
                            className="passenger-form"
                            name="documentForm"
                            id="documentForm"
                        >
                            <FieldWithOverview
                                data={lastName || ''}
                                editMode={editMode}
                                hasTooltip={false}
                                pleaseCompleteLabel={pleaseCompleteLabel}
                                key="contactName"
                                name="contactName"
                                formField={contactName}
                                showAstrick={false}
                                validate={validate}
                                regex={atob(formFields.contactName.regex)}
                                changeHandler={this.handleTextChange}
                                editModeTrigger={this.editModeTrigger}
                                hasConsent={this.props.hasConsent}
                                accesibilityLabels={accesibilityLabels}
                            />
                            <FieldWithOverview
                                data={relationshipText || ''}
                                editMode={editMode}
                                hasTooltip={false}
                                pleaseCompleteLabel={pleaseCompleteLabel}
                                key="relationship"
                                name="relationship"
                                formField={relationship}
                                showAstrick={false}
                                validate={validate}
                                regex={regex.name}
                                changeHandler={this.handleTextChange}
                                editModeTrigger={this.editModeTrigger}
                                hasConsent={this.props.hasConsent}
                                accesibilityLabels={accesibilityLabels}
                            />
                            <FieldWithOverview
                                data={contactPhone[dayTimeIndex].number}
                                editMode={editMode}
                                hasTooltip={false}
                                pleaseCompleteLabel={pleaseCompleteLabel}
                                key="dayTimeNumber"
                                name="dayTimeNumber"
                                formField={dayTimeNumber}
                                showAstrick={false}
                                validate={this.state.validate}
                                regex={atob(formFields.dayTimeNumber.regex)}
                                changeHandler={this.handleTextChange}
                                editModeTrigger={this.editModeTrigger}
                                hasConsent={this.props.hasConsent}
                                accesibilityLabels={accesibilityLabels}
                            />
                            <FieldWithOverview
                                data={contactPhone[eveningTimeIndex].number}
                                editMode={editMode}
                                hasTooltip={false}
                                pleaseCompleteLabel={pleaseCompleteLabel}
                                key="eveningNumber"
                                name="eveningNumber"
                                formField={eveningNumber}
                                showAstrick={false}
                                validate={this.state.validate}
                                regex={atob(formFields.eveningNumber.regex)}
                                changeHandler={this.handleTextChange}
                                editModeTrigger={this.editModeTrigger}
                                hasConsent={this.props.hasConsent}
                                accesibilityLabels={accesibilityLabels}
                            />
                            <AddressBlock
                                {...theAddress}
                                key="emergencyContact"
                                addressType="emergencyContact"
                                editMode={editMode}
                                country={formFields.country}
                                editModeTrigger={this.editModeTrigger}
                                pleaseCompleteLabel={pleaseCompleteLabel}
                                formFields={formFields}
                                validate={validate}
                                textChangeHandler={this.handleTextChange}
                                countryChangeHandler={this.handleCountryChange}
                                address={contactAddress}
                                showAstrick={false}
                                hasConsent={this.props.hasConsent}
                                accesibilityLabels={accesibilityLabels}
                            />
                            {leadPassenger &&
                                editMode && (
                                    <ApplyInfoSlot
                                        consentHandler={this.handleConsent}
                                        label={passengerConsent.label}
                                        section={section}
                                    />
                                )}
                        </form>
                    </div>
                </FormSection>
            );
        } else {
            return null;
        }
    }
}

export default emergencyContact;
