import React, { Component } from 'react';
import FormSection from './formSection';
import ApplyInfoSlot from './applyInfoSlot';
import FieldWithOverview from './fieldWithOverview';

import { regex } from '../../library/js/config/regex';
import Link from '../commons/CUK/link';

import { cloneData } from '../commons/CUK/utilities';
import SessionStorage from '../commons/CUK/session-storage';

class travelInsurance extends Component {
    constructor(props) {
        super(props);
        this.state = {
            emergencyContact: false,
            insuranceTypeCode: false,
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
        const { emergencyContact, insuranceTypeCode } = passengersData[
            selectedPassengerIndex
        ];
        return {
            insuranceTypeCode: cloneData(insuranceTypeCode),
            emergencyContact: emergencyContact
                ? cloneData(emergencyContact)
                : {}
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

        this.setState((prevState) => {
            const newState = prevState;
            newState.modified = true;
            switch (name) {
                case 'insuranceCompanyName':
                    newState.emergencyContact.insuranceName = value;
                    break;
                case 'emergencyAssistanceCompanyName':
                    newState.emergencyContact.assistanceCompany = value;
                    break;
                case 'emergencyAssistancePhone':
                    newState.emergencyContact['assistanceNumber'] = value;
                    break;
            }
            return newState;
        });
    };

    handleConsent = (applyToOtherPassengers) => {
        this.setState(() => ({
            applyToOtherPassengers,
            modified : true
        }));
    };

    handleSubmit = (section) => {
        const {
            handleSubmit,
            passengersData,
            selectedPassengerIndex,
            consents
        } = this.props;
        const {
            emergencyContact,
            insuranceTypeCode,
            applyToOtherPassengers
        } = this.state;

        const clonedPassengersData = cloneData(passengersData);

        const dataToSubmit = clonedPassengersData.reduce(
            (passengersArray, passenger, index) => {
                if (+index === +selectedPassengerIndex) {
                    passenger.emergencyContact = emergencyContact;
                    passenger.insuranceTypeCode = insuranceTypeCode;
                } else if (
                    applyToOtherPassengers &&
                    consents.find(
                        (consent) => +passenger.seqNumber.$ === +consent.seqNumber.$
                    )
                ) {
                    passenger.insuranceTypeCode = insuranceTypeCode;
                    if (!passenger.emergencyContact) {
                        passenger.emergencyContact = {};
                    }
                    passenger.emergencyContact.assistanceCompany =
                        emergencyContact.assistanceCompany;
                    passenger.emergencyContact['assistanceNumber'] =
                        emergencyContact['assistanceNumber'];
                    passenger.emergencyContact.insuranceName =
                        emergencyContact.insuranceName;
                }
                passengersArray.push(passenger);
                return passengersArray;
            },
            []
        );

        handleSubmit && handleSubmit(dataToSubmit, section);
    };

    handleErrorCallback = (error, errorMsg, event) => {
        const { valueChanged } = this.state;
        this.setState({
            valueChanged: !valueChanged
        })
    }

    render() {
        if (this.state.emergencyContact) {
            const {
                formFields,
                labels,
                editMode,
                section,
                leadPassenger
            } = this.props;
            const {
                insuranceTypeCode,
                emergencyContact,
                validate,
                modified,
                valueChanged
            } = this.state;
            const accesibilityLabels = this.props.accesibilityLabels ? this.props.accesibilityLabels : {};
            const { insuranceName, assistanceCompany } = emergencyContact;

            const assistanceNumber = emergencyContact['assistanceNumber'];

            const {
                insuranceCompany,
                emergencyAssistanceCompany,
                emergencyAssistanceTelephone,
                passengerConsent
            } = formFields;

            const {
                ownTravelInsuranceTooltipMessage,
                providedTravelInsuranceTooltipMessage,
                emergencyAssistanceLabel,
                emergencyAssistanceTooltipMessage,
                pleaseCompleteLabel,
                affiliateLabell
            } = labels;

            let {affiliateUrl} = labels;

            if(affiliateUrl != ""){
               const shipCodde = SessionStorage.getItem('header').shipCode;

                affiliateUrl = affiliateUrl.replace(
                    '{shipCode}',
                    shipCodde
                );
            }

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
                    valueChanged={valueChanged}
                >
                    <div className={`form-${editMode ? 'edit' : 'overview'}`}>
                        <form
                            className="passenger-form"
                            name="documentForm"
                            id="documentForm"
                        >
                            <FieldWithOverview
                                data={insuranceName || ''}
                                editMode={editMode}
                                hasTooltip={true}
                                tooltipLabel={
                                    insuranceTypeCode.$ === 'O'
                                        ? ownTravelInsuranceTooltipMessage
                                        : providedTravelInsuranceTooltipMessage
                                }
                                pleaseCompleteLabel={pleaseCompleteLabel}
                                key="insuranceCompanyName"
                                name="insuranceCompanyName"
                                formField={insuranceCompany}
                                showAstrick={false}
                                validate={this.state.validate}
                                regex={atob(insuranceCompany.regex)}
                                changeHandler={this.handleTextChange}
                                editModeTrigger={this.editModeTrigger}
                                hasConsent={this.props.hasConsent}
                                accesibilityLabels={accesibilityLabels}
                            />
                            <div className="form-field-row">
                                <h3 className="form-title">
                                    {`${emergencyAssistanceLabel}`}
                                </h3>
                                <FieldWithOverview
                                    data={assistanceCompany || ''}
                                    editMode={editMode}
                                    hasTooltip={true}
                                    tooltipLabel={
                                        emergencyAssistanceTooltipMessage
                                    }
                                    pleaseCompleteLabel={pleaseCompleteLabel}
                                    key="emergencyAssistanceCompanyName"
                                    name="emergencyAssistanceCompanyName"
                                    formField={emergencyAssistanceCompany}
                                    showAstrick={false}
                                    validate={this.state.validate}
                                    regex={atob(emergencyAssistanceCompany.regex)}
                                    changeHandler={this.handleTextChange}
                                    editModeTrigger={this.editModeTrigger}
                                    hasConsent={this.props.hasConsent}
                                    accesibilityLabels={accesibilityLabels}
                                />
                                <FieldWithOverview
                                    data={assistanceNumber || ''}
                                    editMode={editMode}
                                    hasTooltip={false}
                                    pleaseCompleteLabel={pleaseCompleteLabel}
                                    key="emergencyAssistancePhone"
                                    name="emergencyAssistancePhone"
                                    formField={emergencyAssistanceTelephone}
                                    showAstrick={false}
                                    validate={this.state.validate}
                                    regex={atob(emergencyAssistanceTelephone.regex)}
                                    changeHandler={this.handleTextChange}
                                    editModeTrigger={this.editModeTrigger}
                                    handleErrorCallback={this.handleErrorCallback}
                                    hasConsent={this.props.hasConsent}
                                    accesibilityLabels={accesibilityLabels}
                                />

                                {!editMode && window.configs.locale.toLowerCase()== "en_gb" &&
                                (<Link
                                    url={affiliateUrl}
                                    ariaLabel={affiliateLabell}
                                    label={affiliateLabell}
                                    linkClassName="cta-secondary cta-secondary_aff"
                                ></Link>
                                )}

                                {leadPassenger &&
                                    editMode && (
                                        <div className="form-field-row">
                                            <ApplyInfoSlot
                                                consentHandler={
                                                    this.handleConsent
                                                }
                                                label={passengerConsent.label}
                                                section={section}
                                            />
                                        </div>
                                    )}
                            </div>
                        </form>
                    </div>
                </FormSection>
            );
        } else {
            return null;
        }
    }
}

export default travelInsurance;
