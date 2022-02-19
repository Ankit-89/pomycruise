import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PersonalInformations from './personalInformations';
import TravelDocument from './travelDocument';
import TravelInsurance from './travelInsurance';
import EmergencyContact from './emergencyContact';
import { getConfig } from '../commons/CUK/utilities';

class passengerForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedSection: false
        };
    }
    componentDidUpdate(prevProps) {
        const { selectedSection } = this.props;
        if (prevProps.selectedSection !== selectedSection && !selectedSection) {
            this.setState(() => ({
                selectedSection: false
            }));
        }
    }
    editModeHandler = (selectedSection, selectedSectionNode, s) => {
        const { editModeHandler } = this.props;
        this.setState(() => ({
            selectedSection
        }));
        editModeHandler && editModeHandler(selectedSection ? true : false, s);

        if (selectedSection) {
            const node = ReactDOM.findDOMNode(this);
            window.scrollTo(0, node.offsetTop);
        }
    };

    handleSubmit = (dataToSubmitFromChild, section, applyToOtherPassengers) => {
        const {
            services: {
                urls: {
                    updatePassengerAddressApi,
                    updateEmergencyApi,
                    updatePassengerDocumentsApi
                }
            },
            handleSubmit
        } = this.props;
        let apiUrlString;

        switch (section) {
            case 'personalInformation':
                apiUrlString = updatePassengerAddressApi;
                break;
            case 'travelDocument':
                apiUrlString = updatePassengerDocumentsApi;
                break;
            case 'travelInsurance':
            case 'emergencyContact':
                apiUrlString = updateEmergencyApi;
                break;
        }

        handleSubmit &&
            handleSubmit(
                dataToSubmitFromChild,
                apiUrlString,
                applyToOtherPassengers,
                section
            );
    };

    render() {
        const {
            passengersData,
            selectedPassengerIndex,
            labels,
            formFields,
            leadPassenger,
            consents
        } = this.props;
        const { selectedSection } = this.state;
        const accesibilityLabels = this.props.accesibilityLabels ? this.props.accesibilityLabels : {};
        const locale = getConfig('locale');
        return (
            <div className="passenger_form--container">
                {(selectedSection === false ||
                    selectedSection === 'personalInformation') && (
                        <PersonalInformations
                            passengersData={passengersData}
                            selectedPassengerIndex={selectedPassengerIndex}
                            formFields={formFields}
                            labels={labels}
                            accesibilityLabels={accesibilityLabels}
                            editMode={selectedSection === 'personalInformation'}
                            editModeHandler={this.editModeHandler}
                            handleSubmit={this.handleSubmit.bind(this)}
                            section="personalInformation"
                            leadPassenger={leadPassenger}
                            consents={consents}
                            modified={this.props.modified}
                            hasConsent={this.props.hasConsent}
                        />
                    )}
                {(selectedSection === false ||
                    selectedSection === 'travelDocument') && (
                        <TravelDocument
                            passengersData={passengersData}
                            selectedPassengerIndex={selectedPassengerIndex}
                            formFields={formFields}
                            labels={labels}
                            editMode={selectedSection === 'travelDocument'}
                            editModeHandler={this.editModeHandler}
                            section="travelDocument"
                            handleSubmit={this.handleSubmit}
                            leadPassenger={leadPassenger}
                            consents={consents}
                            modified={this.props.modified}
                            hasConsent={this.props.hasConsent}
                            accesibilityLabels={accesibilityLabels}
                        />
                    )}
                {(selectedSection === false ||
                    selectedSection === 'travelInsurance') && (locale.toLowerCase() === "en_gb" ||
                        locale.toLowerCase() === "en_au") && (
                        <TravelInsurance
                            passengersData={passengersData}
                            selectedPassengerIndex={selectedPassengerIndex}
                            formFields={formFields}
                            labels={labels}
                            editMode={selectedSection === 'travelInsurance'}
                            editModeHandler={this.editModeHandler}
                            section="travelInsurance"
                            handleSubmit={this.handleSubmit}
                            leadPassenger={leadPassenger}
                            consents={consents}
                            hasConsent={this.props.hasConsent}
                            modified={this.props.modified}
                            accesibilityLabels={accesibilityLabels}
                        />
                    )}
                {(selectedSection === false ||
                    selectedSection === 'emergencyContact') && (
                        <EmergencyContact
                            passengersData={passengersData}
                            selectedPassengerIndex={selectedPassengerIndex}
                            formFields={formFields}
                            labels={labels}
                            editMode={selectedSection === 'emergencyContact'}
                            editModeHandler={this.editModeHandler}
                            section="emergencyContact"
                            handleSubmit={this.handleSubmit}
                            leadPassenger={leadPassenger}
                            consents={consents}
                            modified={this.props.modified}
                            hasConsent={this.props.hasConsent}
                            accesibilityLabels={accesibilityLabels}
                        />
                    )}
            </div>
        );
    }
}

export default passengerForm;
