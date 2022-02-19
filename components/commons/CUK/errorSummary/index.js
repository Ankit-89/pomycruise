/**
 * Error Summary Module to be used in all the forms
 */
'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import Link from '../link';

/**
 * focusInput function to focus on input field with error message
 * @param  {object} e - input type event
 * @param  {string} field - name of field where focus has to be moved
 * @param  {string} formId - id of form
 * @param  {array} errorFields - error fields array
 */
const focusInput = (e, field, formId, errorFields) => {
    e.preventDefault();

    if (field === 'dateError') {
        if (errorFields && errorFields.length) {
            let fieldName = errorFields[0];

            focusField(formId, fieldName);
        }
    } else if (field === 'dateOfBirth') {
        if (errorFields[0]) {
            focusField(formId, 'date');
        } else {
            focusField(formId, 'month');
        }
    } else if (field === 'tnC') {
        focusField(formId, 'terms-condition');
    } else if (field === 'genderMismatch') {
        focusField(formId, 'gender');
    } else {
        focusField(formId, field);
    }
};

/**
 * focus the form field
 * @param {string} formId - form id
 * @param {string} field - form field which need to be focused
 */
const focusField = (formId, field) => {
    typeof document !== 'undefined' && document.getElementById(formId).elements[field].focus();
};

/**
 * Gives markup for Validation Summary
 *
 * @param {React-props} props - Props passed to this module
 * @returns {React-markup} - Returns React markup to be rendered on page
 */
const errorSummary = (props) => {
    return (
        <div className="error-summary-wrapper" role="alert">
            <p tabIndex={0} ref={props.summaryRef}>
                {props.errorHeading}
            </p>
            <ul className="error-summary">
                {Object.keys(props.errors).map((error) => {
                    return (
                        <li key={error} className="error">
                            <Link
                                url="javascript:void(0)"
                                onClick={(e) =>
                                    focusInput(
                                        e,
                                        error,
                                        props.formId,
                                        props.errorFields
                                    )
                                }
                            >
                                {props.errors[error]}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

errorSummary.propTypes = {
    errors: PropTypes.object.isRequired,
    inputRef: PropTypes.func,
    formId: PropTypes.string.isRequired,
    errorHeader: PropTypes.string,
    errorFields: PropTypes.array
};

errorSummary.defaultProps = {
    errors: {}
};

export default errorSummary;
