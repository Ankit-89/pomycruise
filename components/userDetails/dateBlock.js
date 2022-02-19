import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import SelectField from '../commons/CUK/selectField';
import { dateFormat } from '../commons/CUK/dateFormat';
import SessionStorage from '../commons/CUK/session-storage';
import {
    createOptionsArray,
    createDaysOptions,
    createYearsOptions,
    compareAndCreateOption
} from './formHelpers';
import moment from 'moment';

class dateBlock extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedMonth: { label: '', value: '' },
            selectedDay: { label: '', value: '' },
            selectedYear: { label: '', value: '' },
            daysRange: props.daysRange
        };
    }

    componentDidMount() {
        const {
            daysRange,
            yearsRange,
            dateType,
            formFields: { month },
            date
        } = this.props;
        this.daysOptions = createDaysOptions(daysRange);
        this.monthsOptions = createOptionsArray(month.options);
        this.yearsOptions = createYearsOptions(yearsRange, dateType);
        this.setState(() => {
            return {
                ...this.initDateBlock(date)
            };
        });
    }
    componentDidUpdate(prevProps) {
        const { date } = this.props;
        if (date !== prevProps.date) {
            this.setState(() => ({
                ...this.initDateBlock(date)
            }));
        }
    }

    handleEditMode = (e) => {
        if( e.type === 'keypress' && e.key !== 'Enter' ) {
            return false;
        } 
        const { editModeTrigger } = this.props;
        editModeTrigger && editModeTrigger(e);
    };

    initDateBlock(date) {
        const dateArr = date.length === 10 ? date.split('-') : [];
        const newState = {
            selectedMonth: compareAndCreateOption(
                this.monthsOptions,
                dateArr[1] || ''
            ),
            selectedDay: {
                value: dateArr[2] || '',
                label: dateArr[2] || ''
            },
            selectedYear: {
                value: dateArr[0] || '',
                label: dateArr[0] || ''
            }
        };
        if (
            newState.selectedMonth.value !== '' &&
            newState.selectedYear.value !== ''
        ) {
            newState.daysRange = new Date(
                newState.selectedYear.value,
                newState.selectedMonth.value,
                0
            ).getDate();
        }
        return newState;
    }

    handleSelectDate = (name, value, title) => {
        this.setState(
            (prevState, props) => {
                const { dateType } = props;
                const newState = prevState;
                const selectedOption = {
                    value,
                    label: title
                };
                switch (name) {
                    case 'month':
                        newState.selectedMonth = selectedOption;
                        newState.daysRange = new Date(
                            newState.selectedYear.value,
                            value,
                            0
                        ).getDate();
                        break;

                    case 'day':
                        newState.selectedDay = selectedOption;
                        break;

                    case 'year':
                        newState.selectedYear = selectedOption;
                        newState.daysRange = new Date(
                            value,
                            newState.selectedMonth.value,
                            0
                        ).getDate();
                        break;
                }
                const date = `${newState.selectedYear.value}-${
                    newState.selectedMonth.value
                }-${newState.selectedDay.value}`;
                const passportMonthsValidation =
                    typeof window !== 'undefined'
                        ? window.configs.passportMonthsValidation
                        : '';
                if (date) {
                    newState.date = date.length === 10 ? date : '';
                }
                if (date.length === 10 && dateType === 'expiry') {
                    const header = SessionStorage.getItem('header');

                    const disembarkDate = new Date(header.disembarkationDate);
                    const monthsInFuture = moment(disembarkDate).add(
                        passportMonthsValidation,
                        'months'
                    );
                    newState.expiryTooSoon = moment(date).isBefore(
                        monthsInFuture
                    );
                }
                return newState;
            },
            () => {
                const { updateHandler, dateType, formField } = this.props;
                const { date, expiryTooSoon } = this.state;
                updateHandler && updateHandler(dateType, date);
                if (expiryTooSoon) {
                    const node = ReactDOM.findDOMNode(this);
                    const select = node.getElementsByClassName(
                        'select-month'
                    )[0];
                    const error = select.getElementsByClassName('error-msg')[0];

                    error.innerHTML = this.props.expiryLabel;
                }
            }
        );
    };

    renderOverview() {
        const { formField, pleaseCompleteLabel, date, dateType } = this.props;
        const isDateCompleted = date.length === 10;
        const formattedDate =
            isDateCompleted && dateFormat(date, 'DD MMMM YYYY');
        return (
            <div className="form-field-row">
                <label className="form-label">{`${
                    formField.required && dateType !== 'birth' ? '*' : ''
                }${formField.label}:`}</label>
                <span
                    className={`form-field-value ${!isDateCompleted &&
                        'form-label-empty'} ${!isDateCompleted &&
                        formField.required &&
                        'form-missing-field'} ${formField.required &&
                        'required-field'}`}
                >
                    {isDateCompleted ? (
                        formattedDate
                    ) : this.props.hasConsent && (
                        <span tabIndex={0} onKeyPress={this.handleEditMode} onClick={this.handleEditMode}>
                            {pleaseCompleteLabel}
                        </span>
                    )}
                </span>
            </div>
        );
    }

    renderForm() {
        const {
            formField,
            validate,
            formFields: { month, day, year },
            date,
            dateType
        } = this.props;
        const {
            daysRange,
            selectedDay,
            selectedMonth,
            selectedYear,
            expiryTooSoon
        } = this.state;

        const isDateCompleted = date.length === 10;

        return (
            <div
                className={`form-field-row ${(expiryTooSoon ||
                    !isDateCompleted) &&
                    'form-missing-field'} ${formField.required &&
                    'required-field'}`}
            >
                <label className="form-label">{`${
                    formField.required && dateType !== 'birth' ? '*' : ''
                }${formField.label}`}</label>
                {this.daysOptions && (
                    <div
                        className={`common-input-group input-group input-group-date read-only`}
                    >
                        {dateType === 'birth' && isDateCompleted ? (
                            <div className="input-group-wrapper ">
                                <span className="input-wrapper">
                                    <input
                                        className="input-field"
                                        name="month"
                                        type="text"
                                        value={selectedMonth.label}
                                        readOnly={true}
                                    />
                                </span>
                                <span className="input-wrapper">
                                    <input
                                        className="input-field"
                                        name="day"
                                        type="text"
                                        value={selectedDay.label}
                                        readOnly={true}
                                    />
                                </span>
                                <span className="input-wrapper">
                                    <input
                                        className="input-field"
                                        name="year"
                                        type="text"
                                        value={selectedYear.label}
                                        readOnly={true}
                                    />
                                </span>
                            </div>
                        ) : (
                            <div>
                                <SelectField
                                    selectClassName="select-day"
                                    name="day"
                                    ariaRequired={true}
                                    label={day.label}
                                    showLabel={false}
                                    validate={validate}
                                    value={selectedDay.value}
                                    title={selectedDay.label}
                                    options={this.daysOptions.slice(
                                        0,
                                        daysRange
                                    )}
                                    changeCallback={this.handleSelectDate}
                                    errorMsg={day.error}
                                />
                                <SelectField
                                    selectClassName="select-month"
                                    name="month"
                                    ariaRequired={true}
                                    label={month.label}
                                    showLabel={false}
                                    validate={validate}
                                    value={selectedMonth.value}
                                    title={selectedMonth.label}
                                    options={this.monthsOptions}
                                    changeCallback={this.handleSelectDate}
                                    additionalError={
                                        dateType === 'expiry' && expiryTooSoon
                                    }
                                    errorMsg={month.error}
                                />
                                <SelectField
                                    selectClassName="select-year"
                                    name="year"
                                    ariaRequired={true}
                                    label={year.label}
                                    showLabel={false}
                                    validate={validate}
                                    value={selectedYear.value}
                                    title={selectedYear.label}
                                    options={this.yearsOptions}
                                    changeCallback={this.handleSelectDate}
                                    errorMsg={year.error}
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }
    render() {
        const { editMode, section } = this.props;
        return editMode && section != 'personalInformation'
            ? this.renderForm()
            : this.renderOverview();
    }
}

dateBlock.defaultProps = {
    daysRange: 31,
    yearsRange: 20
};

export default dateBlock;
