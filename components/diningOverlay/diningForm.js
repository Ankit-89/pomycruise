import React from 'react';

import SelectField from '../commons/CUK/selectField';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import Link from '../commons/CUK/link';
import DiningFormSummary from './diningFormSummary';
import DiningAddToCart from './diningAddToCart';
import PortSlot from './portSlot';
import SessionStorage from '../commons/CUK/session-storage';

import { plainDateFormat } from '../commons/CUK/dateFormat';
import { getPriceSymbolForCurrencyCode } from '../commons/CUK/currencyFormat';

class diningForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = this.createConfiguratorData();
    }

    componentDidMount() {
        const { headerData } = this.props;
        const guestCount = headerData.header.passengers.length;
        this.updateValue('Guests', guestCount, guestCount);
    }

    createConfiguratorData() {
        SessionStorage.setItem('diningEventType', 'SelectDining');
        const { products } = this.props.formData;
        const productsObject = {
            products: {
                productsOptions: []
            },
            guests: {
                guestsOptions: []
            }
        };
        const configuratorData = products
            ? products.reduce(this.rebuildProducts, productsObject)
            : false;
        const newState = {
            configuratorData,
            currency: getPriceSymbolForCurrencyCode(
                products[0].instances[0].price.currencyIso
            )
        };

        if (products.length === 1) {
            newState.selectedProduct = {
                title: products[0].mealPeriod.name,
                value: products[0].code
            };
        }

        return newState;
    }

    rebuildProducts = (productsObject, product) => {
        const { maxGuests } = this.props;

        for (let guestsNumber = 1; guestsNumber <= maxGuests; guestsNumber++) {
            const productObject = {
                days: {},
                hours: { hoursOptions: [] },
                guestsNumber
            };
            const instance = product.instances.sort((a, b) => (a.timeSlot > b.timeSlot) ? 1 : ((b.timeSlot > a.timeSlot) ? -1 : 0));
            const productData = instance.reduce(
                this.rebuildInstances,
                productObject
            );

            if (!productsObject.products[product.code]) {
                productsObject.products[product.code] = {
                    guests: { guestsOptions: [] }
                };
                productsObject.products.productsOptions.push({
                    label: product.mealPeriod.name,
                    value: product.code
                });
            }
            if (!productsObject.guests[guestsNumber]) {
                productsObject.guests[guestsNumber] = {
                    products: { productsOptions: [] }
                };
                productsObject.guests.guestsOptions.push({
                    label: guestsNumber,
                    value: guestsNumber
                });
            }
            if (!productsObject.products[product.code].guests[guestsNumber]) {
                productsObject.products[product.code].guests[
                    guestsNumber
                ] = productData;
                productsObject.products[product.code].guests.guestsOptions.push(
                    {
                        label: guestsNumber,
                        value: guestsNumber
                    }
                );
            }
            if (!productsObject.guests[guestsNumber].products[product.code]) {
                productsObject.guests[guestsNumber].products[
                    product.code
                ] = productData;
                productsObject.guests[
                    guestsNumber
                ].products.productsOptions.push({
                    label: product.mealPeriod.name,
                    value: product.code
                });
            }
        }

        return productsObject;
    };

    rebuildInstances = (productObject, instance) => {

        const { timeSlot, stock, tableInfo } = instance;
        const outOfStock = stock.stockLevelStatus === 'outOfStock';

        if (!outOfStock) {
            const dayValue = plainDateFormat(timeSlot.substring(0, timeSlot.length - 1), 'YYYY-MM-DD');
            const hourValue = plainDateFormat(timeSlot.substring(0, timeSlot.length - 1), 'hh.mm A');

            // let disabled = (stock.stockLevel < productObject.guestsNumber) ;
            let disabled = (tableInfo.tableSize < productObject.guestsNumber) || (tableInfo.minCover > productObject.guestsNumber);

            if (!disabled && !productObject.days[dayValue]) {
                productObject.days[dayValue] = {
                    disabled: !disabled ? false : true,
                    hours: { hoursOptions: [] }
                };
            }
            if (!disabled && !productObject.hours[hourValue]) {
                productObject.hours[hourValue] = {
                    days: {}
                };
                productObject.hours.hoursOptions.push({
                    label: hourValue,
                    value: hourValue
                });
            }

            if (!disabled && !productObject.days[dayValue].hours[hourValue]) {
                productObject.days[dayValue].hours[hourValue] = {
                    ...instance,
                    disabled
                };
                productObject.days[dayValue].hours.hoursOptions.push({
                    label: hourValue,
                    value: hourValue,
                    disabled
                });
            }

            if (!disabled && !productObject.hours[hourValue].days[dayValue]) {
                productObject.hours[hourValue].days[dayValue] = {
                    ...instance,
                    disabled
                };
            }
        }

        return productObject;
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
            selectedProduct,
            selectedGuests,
            selectedHour,
            configuratorData: { products }
        } = this.state;
        const daysOptions = selectedHour
            ? products[selectedProduct.value].guests[selectedGuests.value]
                .hours[selectedHour.value].days
            : products[selectedProduct.value].guests[selectedGuests.value].days;
        const dayValue = plainDateFormat(day, 'YYYY-MM-DD');

        return !daysOptions[dayValue] || daysOptions[dayValue].disabled;
    };

    updateValue = (name, value, title) => {
        const stateAddition = {};

        stateAddition[`selected${name}`] = value ? { title, value } : undefined;

        if (this.state.selectedDay || this.state.selectedHour) {
            if (name === 'Product' || name === 'Guests') {
                stateAddition.selectedDay = undefined;
                stateAddition.selectedHour = undefined;
            }
        }
        this.setState(() => stateAddition);
    };

    updateDay = (day) => {
        const formattedDate = plainDateFormat(day, 'YYYY-MM-DD');
        this.updateValue('Day', formattedDate, formattedDate);
    };

    handleReset = () => {
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

    render() {
        const { labels, services, headerData } = this.props;
        const {
            selectedProduct,
            selectedGuests,
            selectedDay,
            selectedHour,
            configuratorData: { products, guests },
            currency
        } = this.state;
        let selectedInstance;
        let guestsOptions;
        let productsOptions;
        let hoursOptions;


        if (products || guests) {
            guestsOptions = selectedProduct
                ? products[selectedProduct.value].guests.guestsOptions
                : guests.guestsOptions;
            productsOptions = selectedGuests
                ? guests[selectedGuests.value].products.productsOptions
                : products.productsOptions;
            if (selectedGuests && selectedProduct) {
                hoursOptions = selectedDay
                    ? products[selectedProduct.value].guests[
                        selectedGuests.value
                    ].days[selectedDay.value].hours.hoursOptions
                    : products[selectedProduct.value].guests[
                        selectedGuests.value
                    ].hours.hoursOptions;
            } else {
                hoursOptions = [];
            }
        }
        if (selectedProduct && selectedGuests && selectedDay && selectedHour) {
            selectedInstance =
                products[selectedProduct.value].guests[selectedGuests.value]
                    .days[selectedDay.value].hours[selectedHour.value];
        }
        const header = SessionStorage.getItem('header');
        let embarkationDay = new Date(header.embarkationDate);
        let disembarkationDay = new Date(header.disembarkationDate);
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

        return (
            (products || guests) && (
                <form className="modal-body" onSubmit={this.handleSubmit}>
                    <h6 className="selectHeading">{labels.guestsTitle}</h6>
                    <SelectField
                        ref={(guests) => (this.guests = guests)}
                        name="Guests"
                        label={labels.guestsLabel}
                        disableValidation={true}
                        showLabel={false}
                        title={selectedGuests && selectedGuests.title}
                        title={selectedGuests && selectedGuests.title}
                        options={guestsOptions}
                        disableDefaultOption={false}
                        readOnly={false}
                        changeCallback={this.updateValue}
                    />
                    <h6 className="selectHeading">{labels.mealTimeTitle}</h6>
                    <SelectField
                        name="Product"
                        label={labels.mealTimeLabel}
                        disableValidation={true}
                        showLabel={false}
                        value={selectedProduct && selectedProduct.value}
                        title={selectedProduct && selectedProduct.title}
                        options={productsOptions}
                        disableDefaultOption={productsOptions.length === 1}
                        readOnly={productsOptions.length <= 1}
                        changeCallback={this.updateValue}
                    />
                    <div className="search_filters--divider">
                        <span>{labels.searchFiltersLabel}</span>
                    </div>
                    <div
                        className={`${
                            selectedProduct && selectedGuests
                                ? 'active'
                                : 'disabled'
                            }`}
                    >
                        <h6 className="selectHeading">
                            {labels.calendarPickerTitle}
                        </h6>
                        <DayPickerInput
                            {...dayPickerInputProps}
                            ref={(days) => (this.days = days)}
                        />
                        {selectedDay && (
                            <PortSlot
                                day={selectedDay.value}
                                headerData={headerData}
                                mycruiseSummaryApiService={
                                    services.mycruiseItineraryApiV1
                                }
                            />
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
                            readOnly={!selectedProduct || !selectedGuests}
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
                        <DiningFormSummary
                            currency={currency}
                            pricePerPersonLabel={labels.pricePerPersonLabel}
                            totalLabel={labels.totalLabel}
                            selectedInstance={selectedInstance}
                            selectedGuests={selectedGuests}
                        />
                        <DiningAddToCart
                            name={this.props.name}
                            label={labels.addToCartLabel}
                            headerData={headerData}
                            updateCartApiService={services.updateCartApi}
                            errorHandler={this.handleError}
                            successHandler={this.handleSuccess}
                            selectedInstance={selectedInstance}
                            selectedGuests={selectedGuests}
                            currency={currency}
                            linkClassName={`${
                                !selectedInstance ? 'cta-disabled' : ''
                                } cta-primary`}
                        />
                    </div>
                </form>
            )
        );
    }
}

diningForm.defaultProps = {
    maxGuests: 6
};

export default diningForm;
