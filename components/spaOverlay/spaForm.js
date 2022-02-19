import React from 'react';

import SelectField from '../commons/CUK/selectField';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import PortSlot from './portSlot';
import Link from '../commons/CUK/link';
import SpaPassengersList from './spaPassengersList';
import SpaFormSummary from './spaFormSummary';
import SpaAddToCart from './spaAddToCart';
import SessionStorage from '../commons/CUK/session-storage';

import { plainDateFormat, calculateAge } from '../commons/CUK/dateFormat';
import { getCurrency } from '../commons/CUK/currencyFormat';
import moment from 'moment';
import analytics from '../commons/CUK/analytics';

class spaForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = this.createConfiguratorData();
    }

    createConfiguratorData() {
        const { formData, maxSelectable } = this.props;
        let configuratorData = formData.instances.reduce(
            (configuratorData, instance) => {
                const {
                    appointments: [{ appointment }]
                } = instance;
                return appointment
                    ? appointment.reduce(
                        this.rebuildAppointments,
                        configuratorData
                    )
                    : configuratorData;
            },
            { treatments: { treatmentsOptions: [] } }
        );

        const orderedList = SessionStorage.getItem('orderedList');
        const { passengers } = orderedList;

        const currency = getCurrency();
        if (configuratorData.treatments.treatmentsOptions.length === 1) {
            configuratorData.selectedTreatment = {
                title: configuratorData.treatments.treatmentsOptions[0].label,
                value: configuratorData.treatments.treatmentsOptions[0].value
            };
        }
        return {
            configuratorData,
            passengers,
            selectedPassenger: [passengers[0].paxNumber],
            maxSelected: maxSelectable === 1,
            currency
        };
    }

    rebuildAppointments = (appointmentsObject, appointment, index) => {
        if (index !== 0) {
            const {
                duration,
                serviceDate,
                serviceTime,
                treatmentID,
                treatmentDesc
            } = appointment;
            const timeSlot = moment(
                `${serviceDate}T${
                serviceTime.length === 3 ? `0${serviceTime}` : serviceTime
                }`
            );

            const dayValue = plainDateFormat(timeSlot, 'YYYY-MM-DD');
            const hourValue = plainDateFormat(timeSlot, 'hh.mm A');

            if (!appointmentsObject.treatments[treatmentID]) {
                appointmentsObject.treatments[treatmentID] = {
                    days: {},
                    hours: { hoursOptions: [] }
                };
                appointmentsObject.treatments.treatmentsOptions.push({
                    label: `${treatmentDesc} - ${duration}'`,
                    value: treatmentID
                });
            }
            if (!appointmentsObject.treatments[treatmentID].hours[hourValue]) {
                appointmentsObject.treatments[treatmentID].hours[hourValue] = {
                    days: {}
                };
                appointmentsObject.treatments[
                    treatmentID
                ].hours.hoursOptions.push({
                    label: hourValue,
                    value: hourValue
                });
            }
            if (!appointmentsObject.treatments[treatmentID].days[dayValue]) {
                appointmentsObject.treatments[treatmentID].days[dayValue] = {
                    hours: { hoursOptions: [] }
                };
            }

            if (
                !appointmentsObject.treatments[treatmentID].hours[hourValue]
                    .days[dayValue]
            ) {
                appointmentsObject.treatments[treatmentID].hours[
                    hourValue
                ].days[dayValue] = appointment;
            }

            if (
                !appointmentsObject.treatments[treatmentID].days[dayValue]
                    .hours[hourValue]
            ) {
                appointmentsObject.treatments[treatmentID].days[dayValue].hours[
                    hourValue
                ] = appointment;
                appointmentsObject.treatments[treatmentID].days[
                    dayValue
                ].hours.hoursOptions.push({
                    label: hourValue,
                    value: hourValue
                });
            }
        }

        return appointmentsObject;
    };

    renderCalendarHeading({ localeUtils: { getMonths }, date }) {
        const months = getMonths();

        return (
            <div className="DayPicker-Caption" role="heading">
                <h5>{months[date.getMonth()].slice(0, 3)}</h5>
            </div>
        );
    }

    renderCalendarDay(day) {
        return <span>{day.getDate()}</span>;
    }

    renderWeekday({ weekday, className, localeUtils, locale }) {
        const weekdayName = localeUtils.formatWeekdayLong(weekday, locale);
        return (
            <div className={className} title={weekdayName}>
                {weekdayName.slice(0, 1)}
            </div>
        );
    }

    checkDisabledDay = (day) => {
        const {
            selectedTreatment,
            selectedHour,
            configuratorData: { treatments }
        } = this.state;
        if (selectedTreatment) {
            const daysOptions = selectedHour
                ? treatments[selectedTreatment.value].hours[selectedHour.value]
                    .days
                : treatments[selectedTreatment.value].days;
            const dayValue = plainDateFormat(day, 'YYYY-MM-DD');
            return !daysOptions[dayValue] || daysOptions[dayValue].disabled;
        } else {
            return true;
        }
    };

    updateValue = (name, value, title) => {
        this.setState((prevState) => {
            const { passengers, selectedPassenger } = this.state;
            const stateAddition = {};

            stateAddition[`selected${name}`] = value
                ? { title, value }
                : undefined;

            if (prevState.selectedDay || prevState.selectedHour) {
                if (name === 'Duration') {
                    stateAddition.selectedDay = undefined;
                    stateAddition.selectedHour = undefined;
                }
            }
            if (name === 'Day' && selectedPassenger.length > 0) {
                const { birthDate } = passengers.find(
                    (passenger) => passenger.paxNumber === selectedPassenger[0]
                );
                const passengerBirth = new Date(birthDate);
                const treatmentDate = new Date(value);
                const ageAtTreatment = calculateAge(
                    passengerBirth.getTime(),
                    treatmentDate.getTime()
                );
                if (ageAtTreatment < 18) {
                    stateAddition.selectedPassenger = [passengers[0].paxNumber];
                }
            }

            return stateAddition;
        });
    };

    updateDay = (day) => {
        const formattedDate = plainDateFormat(day, 'YYYY-MM-DD');
        this.updateValue('Day', formattedDate, formattedDate);
    };

    handleReset = () => {
        analytics.clickTracking(this);
        this.setState(() => ({
            selectedDay: undefined,
            selectedHour: undefined
        }));
    };

    handleError = (res) => {
        const { errorHandler } = this.props;
        this.handleReset();
        errorHandler && errorHandler(res);
    };

    handleSuccess = (currency, total, numberOfItems) => {
        const { successHandler } = this.props;
        successHandler && successHandler(currency, total, numberOfItems);
    };

    handlePassengerSelect = (passengerIndex, passengerEnabled) => {
        this.setState((prevState, props) => {
            const { maxSelectable } = props;
            const { selectedPassenger } = prevState;
            let newSelectedPassenger;
            if (maxSelectable === 1) {
                newSelectedPassenger = [passengerIndex];
            } else {
                if (passengerEnabled) {
                    newSelectedPassenger = [
                        ...selectedPassenger,
                        passengerIndex
                    ];
                } else {
                    newSelectedPassenger = selectedPassenger.filter(
                        (passenger) => passenger !== passengerIndex
                    );
                }
            }
            return {
                selectedPassenger: newSelectedPassenger,
                maxSelected: newSelectedPassenger.length >= maxSelectable
            };
        });
    };

    render() {
        const { labels, services, maxSelectable } = this.props;
        const {
            selectedTreatment,
            selectedDay,
            selectedHour,
            selectedPassenger,
            maxSelected,
            configuratorData = {},
            currency,
            passengers
        } = this.state;
        const { treatments = false } = configuratorData;
        const { treatmentsOptions = [] } = treatments;
        let selectedAppointment = false;
        let hoursOptions;

        if (treatments) {
            if (selectedTreatment) {
                hoursOptions = selectedDay
                    ? treatments[selectedTreatment.value].days[
                        selectedDay.value
                    ].hours.hoursOptions
                    : treatments[selectedTreatment.value].hours.hoursOptions;
            } else {
                hoursOptions = [];
            }
        }
        if (selectedTreatment && selectedDay && selectedHour) {
            selectedAppointment =
                treatments[selectedTreatment.value].days[selectedDay.value]
                    .hours[selectedHour.value];
        }
        const header = SessionStorage.getItem('header');
        const { embarkationDate, disembarkationDate } = header;
        const embarkationDay = new Date(embarkationDate);
        const disembarkationDay = new Date(disembarkationDate);
        const dayPickerInputProps = {
            classNames: {
                container: 'DayPickerInput select-group',
                overlayWrapper: 'DayPickerInput-OverlayWrapper',
                overlay: 'DayPickerInput-Overlay'
            },
            formatDate: (day) => plainDateFormat(day, 'DD MMM'),
            value: selectedDay ? new Date(selectedDay.value) : undefined,
            placeholder: labels.calendarPickerLabel,
            onDayChange: this.updateDay,
            dayPickerProps: {
                selectedDays: selectedDay
                    ? new Date(selectedDay.value)
                    : undefined,
                modifiers: {
                    disabled: this.checkDisabledDay
                },
                month: embarkationDay,
                renderDay: this.renderCalendarDay,
                weekdayElement: this.renderWeekday,
                captionElement: this.renderCalendarHeading,
                fromMonth: embarkationDay,
                toMonth: disembarkationDay
            }
        };

        return treatments ? (
            <form className="modal-body" onSubmit={this.handleSubmit}>
                <h6 className="selectHeading">{labels.durationsTitle}</h6>
                <SelectField
                    ref={(durations) => (this.durations = durations)}
                    name="Treatment"
                    label={labels.durationsLabel}
                    disableValidation={true}
                    showLabel={false}
                    value={selectedTreatment && selectedTreatment.value}
                    title={selectedTreatment && selectedTreatment.title}
                    options={treatmentsOptions}
                    disableDefaultOption={false}
                    readOnly={false}
                    changeCallback={this.updateValue}
                />
                <div className="search_filters--divider">
                    <span>{labels.searchFiltersLabel}</span>
                </div>
                <div className={`${selectedTreatment ? 'active' : 'disabled'}`}>
                    <h6 className="selectHeading">
                        {labels.calendarPickerTitle}
                    </h6>
                    <DayPickerInput
                        {...dayPickerInputProps}
                        ref={(days) => (this.days = days)}
                    />
                    {selectedDay && (
                        <PortSlot day={selectedDay.value} services={services} />
                    )}
                    <h6 className="selectHeading">{labels.hoursTitle}</h6>
                    <SelectField
                        ref={(hours) => (this.hours = hours)}
                        name="Hour"
                        label={labels.hoursLabel}
                        disableValidation={true}
                        value={selectedHour && selectedHour.value}
                        title={selectedHour && selectedHour.title}
                        options={hoursOptions}
                        showLabel={false}
                        errorMsg="error"
                        disableDefaultOption={false}
                        defaultLabel={labels.hoursLabel}
                        readOnly={!selectedTreatment}
                        changeCallback={this.updateValue}
                    />
                    {(selectedDay || selectedHour) && (
                        <div className="search_filters--reset">
                            <Link
                                label={labels.resetLabel}
                                url="#"
                                onClick={this.handleReset}
                                linkClassName={`cta-secondary`}
                                dataLinktext={labels.resetLabel}
                            />
                        </div>
                    )}
                    <SpaPassengersList
                        labels={labels}
                        currency={currency}
                        selectedPassenger={selectedPassenger}
                        selectPassengerHandler={this.handlePassengerSelect}
                        maxSelectable={maxSelectable}
                        maxSelected={maxSelected}
                        passengers={passengers}
                        selectedDay={selectedDay}
                        disembarkDate={disembarkationDate}
                        embarkDate={embarkationDate}
                    />
                    <SpaFormSummary
                        currency={currency}
                        totalLabel={labels.totalLabel}
                        selectedPassenger={selectedPassenger}
                        selectedInstance={selectedAppointment}
                    />
                    <SpaAddToCart
                        label={labels.addToCartLabel}
                        headerData={header}
                        updateCartApiService={services.urls.updateCartApi}
                        errorHandler={this.handleError}
                        successHandler={this.handleSuccess}
                        selectedInstance={selectedAppointment}
                        currency={currency}
                        maxSelected={maxSelected}
                        selectedPassenger={selectedPassenger}
                        name={this.props.name}
                    />
                </div>
            </form>
        ) : null;
    }
}

export default spaForm;
