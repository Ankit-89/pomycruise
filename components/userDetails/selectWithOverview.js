import React, { PureComponent } from 'react';
import SelectField from '../commons/CUK/selectField';
import WithTooltip from './withTooltip';

class selectWithOverview extends PureComponent {
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
    handleSelectBoxChange = (name, value, title, event) => {
        const { changeHandler } = this.props;
        changeHandler && changeHandler(name, value, title, event);
    };
    handleErrorCallback = (error, errorMsg) => {
        const { handleErrorCallback } = this.props;
        handleErrorCallback && handleErrorCallback(error, errorMsg);
    }
    renderForm() {
        const { name, formField, selectedOption, options, showAstrick, tooltipLabel } = this.props;
        const hasData = selectedOption.label && selectedOption.label !== '';
        return (
            <div
                className={`form-field-row ${!hasData &&
                    formField.required &&
                    'form-missing-field'} ${formField.required &&
                    'required-field'}`}
            >
                <label className="form-label">{`${
                    formField.required && showAstrick ? '*' : ''
                    }${formField.label}`}</label>
                {(options.length > 1 || selectedOption.value === '') ? (this.props.toolTip ? (
                    <WithTooltip customClassName={`selectField`} tooltipLabel={tooltipLabel}>
                        <SelectField
                            selectClassName={`select-${name}`}
                            required={formField.required}
                            ariaRequired={formField.required}
                            id={name}
                            name={name}
                            label={formField.label}
                            showLabel={false}
                            value={selectedOption.value}
                            title={selectedOption.label}
                            options={options}
                            errorMsg={formField.error}
                            changeCallback={this.handleSelectBoxChange}
                            errorCallback={this.handleErrorCallback}
                        />
                    </WithTooltip>
                ) : (
                        <SelectField
                            selectClassName={`select-${name}`}
                            required={formField.required}
                            ariaRequired={formField.required}
                            id={name}
                            name={name}
                            label={formField.label}
                            showLabel={false}
                            value={selectedOption.value}
                            title={selectedOption.label}
                            options={options}
                            errorMsg={formField.error}
                            changeCallback={this.handleSelectBoxChange}
                            errorCallback={this.handleErrorCallback}
                        />
                    )
                ) : (
                        <div className={`common-input-group input-group read-only`}>
                            <div className="input-error-wrapper">
                                <input
                                    className="input-field"
                                    name={name}
                                    type="text"
                                    value={selectedOption.label}
                                    readOnly={true}
                                />
                            </div>
                        </div>
                    )}
            </div>
        );
    }
    renderOverview() {
        const { formField, pleaseCompleteLabel, selectedOption, showAstrick } = this.props;
        const hasData = selectedOption.label && selectedOption.label !== '';
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
                        selectedOption.label
                    ) : this.props.hasConsent && (
                        <span tabIndex={0} onKeyPress={this.handleEditMode} onClick={this.handleEditMode}>
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

export default selectWithOverview;
