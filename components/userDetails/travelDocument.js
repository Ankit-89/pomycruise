import React, { Component } from 'react';
import FormSection from './formSection';
import DateBlock from './dateBlock';
import { cloneData } from '../commons/CUK/utilities';
import { createOptionsArray, compareAndCreateOption } from './formHelpers';
import SelectWithOverview from './selectWithOverview';
import FieldWithOverview from './fieldWithOverview';
import { regex } from '../../library/js/config/regex';

class travelDocument extends Component {
    constructor(props) {
        super(props);
        this.state = {
            identityDocuments: false,
            validate: true,
            modified: false,
            docTypeIdentityCard: false,
            valueChanged: false
			
        };
    }

    componentDidMount() {
        const {
            formFields: { country, documentType }
        } = this.props;

        this.countryOptions = createOptionsArray(country.options);
        // const locale =
        //     typeof window !== 'undefined' ? window.configs.locale : '';

        // const documentOptions =
        //     locale !== 'en_GB'
        //         ? documentType.options
        //         : documentType.options.filter((opt) => opt['P']);
        let passportDocumentTypeOption = [];
        let nonPassportDocumentTypeOption2 = [];
        documentType.options.forEach((singleDocumentType) => {
            if (singleDocumentType && singleDocumentType.P && singleDocumentType.P.value.toLowerCase() === "passport") {
                passportDocumentTypeOption.push(singleDocumentType);
            } else {
                nonPassportDocumentTypeOption2.push(singleDocumentType);
            }
        })
        const documentTypeOption = passportDocumentTypeOption.concat(nonPassportDocumentTypeOption2);
        this.documentTypeOptions = createOptionsArray(documentTypeOption);
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
        const selectedPassenger = passengersData[selectedPassengerIndex];
        const {
            individual: {
                identityDocuments,
                nationalityCode,
                nationalityNameText,
                countryOfResidenceNameText,
                countryOfResidenceCode
            }
        } = selectedPassenger;

        const newDocuments = identityDocuments
            ? cloneData(identityDocuments[0])
            : {
                birthPlaceCode: { $: '' },
                issuePlaceCode: { $: '' },
                typeCode: { $: '' },
                issueDate: '',
                expiryDate: '',
                id: { $: '' }
            };
        const newNationalityCode = nationalityCode
            ? cloneData(nationalityCode)
            : { $: '' };
        const newCountryOfResidenceCode = countryOfResidenceCode
            ? cloneData(countryOfResidenceCode)
            : { $: '' };

        const { birthPlaceCode, issuePlaceCode, typeCode } = newDocuments;

        if (typeCode.$.toLowerCase() == 'i') {
            this.state.docTypeIdentityCard = true;
        } else {
            this.state.docTypeIdentityCard = false;
        }

        const selectedCountryOfBirth = compareAndCreateOption(
            this.countryOptions,
            birthPlaceCode ? birthPlaceCode.$ : ''
        );

        const selectedNationality = compareAndCreateOption(
            this.countryOptions,
            newNationalityCode ? newNationalityCode.$ : ''
        );

        const selectedCountryOfResidence = compareAndCreateOption(
            this.countryOptions,
            newCountryOfResidenceCode ? newCountryOfResidenceCode.$ : ''
        );

        const selectedCountryOfIssue = compareAndCreateOption(
            this.countryOptions,
            issuePlaceCode ? issuePlaceCode.$ : ''
        );

        const selectedType = compareAndCreateOption(
            this.documentTypeOptions,
            typeCode ? typeCode.$ : ''
        );

        return {
            identityDocuments: newDocuments,
            nationalityNameText,
            nationalityCode: newNationalityCode,
            countryOfResidenceNameText,
            countryOfResidenceCode: newCountryOfResidenceCode,
            selectedType,
            selectedNationality,
            selectedCountryOfBirth,
            selectedCountryOfResidence,
            selectedCountryOfIssue
        };
    }

    handleTextChange = (event) => {
        const {
            target: { name, value }
        } = event;

        this.setState((prevState) => {
            const newState = prevState;
            newState.modified = true;
            switch (name) {
                case 'documentNumber':
                    newState.identityDocuments.id = { $: value };
                    break;
            }
            return newState;
        });
    };

    handleSelectBoxChange = (name, value, title, event) => {
        this.setState((prevState, props) => {
            const newState = cloneData(prevState);
            const selectedOption = {
                value,
                label: title
            };

            newState.modified = true;
            switch (name) {
                case 'documentType':
                    if (value && value.toLowerCase() == 'i') {
                        newState.docTypeIdentityCard = true;
                    } else {
                        newState.docTypeIdentityCard = false;
                    }
                    newState.identityDocuments.typeCode = { $: value };
                    newState.selectedType = selectedOption;
                    break;
                case 'nationality':
                    newState.nationalityCode = { $: value };
                    newState.nationalityNameText = title;
                    newState.selectedNationality = selectedOption;
                    break;
                case 'countryOfResidence':
                    newState.countryOfResidenceCode = { $: value };
                    newState.countryOfResidenceNameText = title;
                    newState.selectedCountryOfResidence = selectedOption;
                    break;
                case 'countryOfBirth':
                    newState.identityDocuments.birthPlaceCode = { $: value };
                    newState.identityDocuments.birthPlaceName = title;
                    newState.selectedCountryOfBirth = selectedOption;
                    break;
                case 'countryOfIssue':
                    newState.identityDocuments.issuePlaceCode = { $: value };
                    newState.identityDocuments.issuePlaceNameText = title;
                    newState.selectedCountryOfIssue = selectedOption;
                    break;
            }
            return newState;
        });
    };

    handleSelectDate = (dateType, date) => {
        this.setState((prevState) => {
            const newState = cloneData(prevState);
            newState.identityDocuments[`${dateType}Date`] = date;
            newState.modified = true;
            return newState;
        });
    };

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

    handleSubmit = (section) => {
        const {
            handleSubmit,
            passengersData,
            selectedPassengerIndex
        } = this.props;
        const {
            identityDocuments,
            countryOfResidenceNameText,
            countryOfResidenceCode,
            nationalityNameText,
            nationalityCode
        } = this.state;

        const dataToSubmit = cloneData(passengersData);

        if (
            !dataToSubmit[selectedPassengerIndex].individual.identityDocuments
        ) {
            dataToSubmit[
                selectedPassengerIndex
            ].individual.identityDocuments = [identityDocuments];
        } else {
            dataToSubmit[
                selectedPassengerIndex
            ].individual.identityDocuments[0] = identityDocuments;
        }

        dataToSubmit[
            selectedPassengerIndex
        ].individual.nationalityNameText = nationalityNameText;
        dataToSubmit[
            selectedPassengerIndex
        ].individual.nationalityCode = nationalityCode;
        dataToSubmit[
            selectedPassengerIndex
        ].individual.countryOfResidenceNameText = countryOfResidenceNameText;
        dataToSubmit[
            selectedPassengerIndex
        ].individual.countryOfResidenceCode = countryOfResidenceCode;

        handleSubmit && handleSubmit(dataToSubmit, section);
    };


    handleErrorCallback = (error, errorMsg, event) => {
        const { valueChanged } = this.state;
        this.setState({
            valueChanged: !valueChanged
        })
    }

    render() {
        if (this.state.identityDocuments) {
            const { formFields, labels, editMode, section } = this.props;
            const {
                selectedType,
                selectedNationality,
                selectedCountryOfBirth,
                selectedCountryOfResidence,
                selectedCountryOfIssue,
                identityDocuments,
                validate,
                modified,
                docTypeIdentityCard,
                valueChanged
            } = this.state;

            const { id, issueDate, expiryDate } = identityDocuments;

            const {
                documentType,
                documentNumber,
                nationality,
                countryOfResidence,
                countryOfBirth,
                countryOfIssue,
                
            } = formFields;
            const accesibilityLabels = this.props.accesibilityLabels ? this.props.accesibilityLabels : {};
            const { pleaseCompleteLabel } = labels;
            const locale = typeof window !== 'undefined' ? window.configs.locale : '';

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
                            <SelectWithOverview
                                selectedOption={selectedType}
                                options={this.documentTypeOptions}
                                editMode={editMode}
                                pleaseCompleteLabel={pleaseCompleteLabel}
                                key="documentType"
                                name="documentType"
                                formField={documentType}
                                showAstrick={true}
                                validate={validate}
                                regex={null}
                                changeHandler={this.handleSelectBoxChange}
                                editModeTrigger={this.editModeTrigger}
                                handleErrorCallback={this.handleErrorCallback}
                                hasConsent={this.props.hasConsent}
                                tooltipLabel={labels.documentTypeTooltipMessage}
                                toolTip={true}
                                accesibilityLabels={accesibilityLabels}
                            />
                            <FieldWithOverview
                                data={id ? id.$ : ''}
                                editMode={editMode}
                                hasTooltip={true}
                                tooltipLabel={labels.documentNumberTooltipMessage}
                                pleaseCompleteLabel={pleaseCompleteLabel}
                                key="documentNumber"
                                name="documentNumber"
                                formField={documentNumber}
                                showAstrick={true}
                                validate={this.state.validate}
                                regex={atob(documentNumber.regex)}
                                changeHandler={this.handleTextChange}
                                editModeTrigger={this.editModeTrigger}
                                handleErrorCallback={this.handleErrorCallback}
                                hasConsent={this.props.hasConsent}
                                accesibilityLabels={accesibilityLabels}
                            />
                            <SelectWithOverview
                                selectedOption={selectedNationality}
                                options={this.countryOptions}
                                editMode={editMode}
                                pleaseCompleteLabel={pleaseCompleteLabel}
                                key="nationality"
                                name="nationality"
                                formField={nationality}
                                showAstrick={true}
                                validate={validate}
                                regex={null}
                                changeHandler={this.handleSelectBoxChange}
                                editModeTrigger={this.editModeTrigger}
                                handleErrorCallback={this.handleErrorCallback}
                                hasConsent={this.props.hasConsent}
                                accesibilityLabels={accesibilityLabels}
                            />
                            <SelectWithOverview
                                selectedOption={selectedCountryOfResidence}
                                options={this.countryOptions}
                                editMode={editMode}
                                pleaseCompleteLabel={pleaseCompleteLabel}
                                key="countryOfResidence"
                                name="countryOfResidence"
                                formField={countryOfResidence}
                                showAstrick={true}
                                validate={validate}
                                regex={null}
                                changeHandler={this.handleSelectBoxChange}
                                editModeTrigger={this.editModeTrigger}
                                handleErrorCallback={this.handleErrorCallback}
                                hasConsent={this.props.hasConsent}
                                accesibilityLabels={accesibilityLabels}
                            />
                            <SelectWithOverview
                                selectedOption={selectedCountryOfBirth}
                                options={this.countryOptions}
                                editMode={editMode}
                                pleaseCompleteLabel={pleaseCompleteLabel}
                                key="countryOfBirth"
                                name="countryOfBirth"
                                formField={countryOfBirth}
                                showAstrick={true}
                                validate={validate}
                                regex={null}
                                changeHandler={this.handleSelectBoxChange}
                                editModeTrigger={this.editModeTrigger}
                                handleErrorCallback={this.handleErrorCallback}
                                hasConsent={this.props.hasConsent}
                                accesibilityLabels={accesibilityLabels}
                            />
                            {!docTypeIdentityCard &&
                                (<SelectWithOverview
                                    selectedOption={selectedCountryOfIssue}
                                    options={this.countryOptions}
                                    editMode={editMode}
                                    pleaseCompleteLabel={pleaseCompleteLabel}
                                    key="countryOfIssue"
                                    name="countryOfIssue"
                                    formField={countryOfIssue}
                                    showAstrick={true}
                                    validate={validate}
                                    regex={null}
                                    changeHandler={this.handleSelectBoxChange}
                                    editModeTrigger={this.editModeTrigger}
                                    handleErrorCallback={this.handleErrorCallback}
                                    hasConsent={this.props.hasConsent}
                                    accesibilityLabels={accesibilityLabels}
                                />)}
                            <DateBlock
                                key="issue"
                                date={issueDate}
                                formField={formFields.issueDate}
                                dateType="issue"
                                editMode={editMode}
                                validate={validate}
                                updateHandler={this.handleSelectDate}
                                editModeTrigger={this.editModeTrigger}
                                pleaseCompleteLabel={pleaseCompleteLabel}
                                formFields={{
                                    month: formFields.month,
                                    year: formFields.year,
                                    day: formFields.day
                                }}
                                hasConsent={this.props.hasConsent}
                                section={section}
                                accesibilityLabels={accesibilityLabels}
                            />
                            <DateBlock
                                key="expiry"
                                date={expiryDate}
                                formField={formFields.expiryDate}
                                dateType="expiry"
                                expiryLabel={labels.dateRangeExpireSoonErrorLabel}
                                editMode={editMode}
                                validate={validate}
                                updateHandler={this.handleSelectDate}
                                editModeTrigger={this.editModeTrigger}
                                pleaseCompleteLabel={pleaseCompleteLabel}
                                formFields={{
                                    month: formFields.month,
                                    year: formFields.year,
                                    day: formFields.day
                                }}
                                hasConsent={this.props.hasConsent}
                                section={section}
                                accesibilityLabels={accesibilityLabels}
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

travelDocument.defaultProps = {
    daysRange: 31,
    yearsRange: 20
};

export default travelDocument;
