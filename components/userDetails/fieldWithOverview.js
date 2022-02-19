import React, { PureComponent } from 'react';
import WithTooltip from './withTooltip';
import InputField from '../commons/CUK/inputField';

class fieldWithOverview extends PureComponent {
    constructor(props) {
        super(props);
    }
    handleEditMode = (e) => {
        if( e.type === 'keypress' && e.key !== 'Enter' ) {
            return false;
        } 
        const { editModeTrigger } = this.props;
        editModeTrigger && editModeTrigger(e);
    };
    handleTextChange = (e) => {
        const { changeHandler } = this.props;
        changeHandler && changeHandler(e);
    };
    returnFlagValue = (e, v) => {
        const { returnFlagValue } = this.props;
        returnFlagValue && returnFlagValue(e, v);
    }
    handleErrorCallback = (error, errorMsg, event) => {
        const { handleErrorCallback } = this.props;
        handleErrorCallback && handleErrorCallback(error, errorMsg, event);
    }
    renderForm() {
        const {
            name,
            hasTooltip,
            tooltipLabel,
            formField,
            validate,
            regex,
            data,
            showAstrick
        } = this.props;
        const hasData = data && data !== '';
        const accesibilityLabels = this.props.accesibilityLabels ? this.props.accesibilityLabels : {};
        const clearFeild = accesibilityLabels.clearFeild ? accesibilityLabels.clearFeild : '';
        return (
            <div
                className={`form-field-row ${!hasData &&
                    formField.required && showAstrick &&
                    'form-missing-field'} ${formField.required &&
                    'required-field'}`}
            >
                {hasTooltip ? (
                    <WithTooltip tooltipLabel={tooltipLabel}>
                        <InputField
                            type="text"
                            required={formField.required}
                            id={name}
                            name={name}
                            placeholder={`${formField.required && showAstrick ? '*' : ''}${
                                formField.label
                                }`}
                            regex={regex}
                            value={data}
                            changeCallback={this.handleTextChange}
                            validate={validate}
                            errorMsg={formField.error}
                            returnFlagValue={this.returnFlagValue}
                            showAstrick={showAstrick}
                            errorCallback={this.handleErrorCallback}
                            errorLabel={clearFeild}
                        />
                    </WithTooltip>
                ) : (
                        <InputField
                            type="text"
                            required={formField.required}
                            id={name}
                            name={name}
                            placeholder={`${formField.required && showAstrick ? '*' : ''}${
                                formField.label
                                }`}
                            regex={regex}
                            value={data}
                            changeCallback={this.handleTextChange}
                            validate={validate}
                            errorMsg={formField.error}
                            showAstrick={showAstrick}
                            errorCallback={this.handleErrorCallback}
                            errorLabel={clearFeild}
                        />
                    )}
            </div>
        );
    }
    renderOverview() {
        const { formField, pleaseCompleteLabel, data, showAstrick } = this.props;
        const hasData = data && data !== '';
        return (
            <div className="form-field-row">
                <label className="form-label">{`${
                    formField.required && showAstrick ? '*' : ''
                }${formField.label}:`}</label>
                 <span
                    className={`form-field-value ${!hasData &&
                        'form-label-empty'} ${!hasData &&
                        formField.required &&
                        'form-missing-field'} ${formField.required &&
                        'required-field'}`}
                >
                    {hasData ? (
                        data
                    ) : (
                        showAstrick && this.props.hasConsent && <span tabIndex={0} onKeyPress={this.handleEditMode} onClick={this.handleEditMode}>
                            {pleaseCompleteLabel}
                        </span>
                    )}
                </span>
            </div>
        );
    }
    render() {
        const { editMode } = this.props;
        return editMode ? this.renderForm() : this.renderOverview();
    }
}

export default fieldWithOverview;
