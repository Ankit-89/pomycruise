import React from 'react';

import SelectField from '../commons/CUK/selectField';
import Link from '../commons/CUK/link';
import SpaFormSummary from './spaFormSummary';
import SpaAddToCart from './spaAddToCart';
import PortSlot from './portSlot';

import { plainDateFormat } from '../commons/CUK/dateFormat';
import { getPriceSymbolForCurrencyCode } from '../commons/CUK/currencyFormat';
import analytics from '../commons/CUK/analytics';

class spaEventForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = this.createConfiguratorData();
    }

    createConfiguratorData() {
        const {
            formData: { products },
            type,
            maxGuestsCookery,
            maxGuestsLimelight
        } = this.props;
        const maxGuests =
            type === 'COOKERY' ? maxGuestsCookery : maxGuestsLimelight;
        const configuratorData = {
            guests: {
                guestsOptions: []
            }
        };

        for (let guestsNumber = 1; guestsNumber <= maxGuests; guestsNumber++) {
            const guestsObject = {
                products: {
                    productsOptions: []
                },
                timeSlots: {
                    timeSlotsOptions: []
                },
                guestsNumber
            };

            configuratorData.guests.guestsOptions.push({
                label: guestsNumber,
                value: guestsNumber
            });
            configuratorData.guests[guestsNumber] = products
                ? products.reduce(this.rebuildGuests, guestsObject)
                : false;
        }

        const newState = {
            configuratorData,
            currency: getPriceSymbolForCurrencyCode(
                products[0].instances[0].price.currencyIso
            )
        };

        if (products.length === 1) {
            newState.selectedProduct = {
                title: products[0].event.name,
                value: products[0].code
            };
        }

        return newState;
    }

    rebuildGuests = (guestsObject, product) => {
        guestsObject.product = {
            code: product.code,
            name: product.event.name
        };
        guestsObject = product.instances.reduce(
            this.rebuildInstances,
            guestsObject
        );

        return guestsObject;
    };

    rebuildInstances = (guestsObject, instance) => {
        const { product } = guestsObject;
        const { timeSlot, stock } = instance;
        const outOfStock = stock.stockLevelStatus === 'outOfStock';

        if (!outOfStock) {
            const timeSlotFormatted = plainDateFormat(
                timeSlot.substring(0, timeSlot.length - 1),
                'DD MMM - h.mm A'
            );
            const disabled = stock.stockLevel < guestsObject.guestsNumber;
            if (!guestsObject.products[product.code]) {
                guestsObject.products[product.code] = {
                    timeSlots: {
                        timeSlotsOptions: []
                    }
                };
                guestsObject.products.productsOptions.push({
                    label: product.name,
                    value: product.code
                });
            }
            if (!guestsObject.timeSlots[timeSlot]) {
                guestsObject.timeSlots[timeSlot] = {
                    products: {
                        productsOptions: []
                    }
                };
                guestsObject.timeSlots.timeSlotsOptions.push({
                    label: timeSlotFormatted,
                    value: timeSlot
                });
            }
            if (!guestsObject.products[product.code].timeSlots[timeSlot]) {
                guestsObject.products[product.code].timeSlots[
                    timeSlot
                ] = instance;
                guestsObject.products[
                    product.code
                ].timeSlots.timeSlotsOptions.push({
                    label: timeSlotFormatted,
                    value: timeSlot,
                    disabled
                });
            }
            if (!guestsObject.timeSlots[timeSlot].products[product.code]) {
                guestsObject.timeSlots[timeSlot].products[
                    product.code
                ] = instance;
                guestsObject.timeSlots[timeSlot].products.productsOptions.push({
                    label: product.name,
                    value: product.code,
                    disabled
                });
            }
        }

        return guestsObject;
    };

    updateValue = (name, value, title) => {
        const stateAddition = {};

        stateAddition[`selected${name}`] = value ? { title, value } : undefined;

        if (this.state.selectedProduct || this.state.selectedTimeSlot) {
            if (name === 'Guests') {
                stateAddition.selectedProduct = undefined;
                stateAddition.selectedTimeSlot = undefined;
            }
        }
        this.setState(() => stateAddition);
    };

    handleReset = () => {
        analytics.clickTracking(this);
        this.setState(() => ({
            selectedProduct: undefined,
            selectedTimeSlot: undefined
        }));
    };

    handleError = (res) => {
        const { errorHandler } = this.props;
        this.handleReset();
        errorHandler && errorHandler(res);
    };

    handleSuccess = (currency, total) => {
        const { successHandler } = this.props;
        successHandler && successHandler(currency, total);
    };

    render() {
        const { labels, services, type, headerData } = this.props;
        const {
            selectedProduct,
            selectedGuests,
            selectedTimeSlot,
            configuratorData: { guests },
            currency
        } = this.state;
        let selectedInstance;
        let guestsOptions;
        let productsOptions;
        let timeSlotsOptions;
        let productTitle;
        let productLabel;
        let filtersLabel;

        if (type === 'COOKERY') {
            productTitle = labels.classTitle;
            productLabel = labels.classLabel;
            filtersLabel = labels.searchFiltersCookeryLabel;
        } else {
            productTitle = labels.entertainerTitle;
            productLabel = labels.entertainerLabel;
            filtersLabel = labels.searchFiltersLimelightLabel;
        }
        if (guests) {
            guestsOptions = guests.guestsOptions;
            if (selectedGuests) {
                productsOptions = selectedTimeSlot
                    ? guests[selectedGuests.value].timeSlots[
                          selectedTimeSlot.value
                      ].products.productsOptions
                    : guests[selectedGuests.value].products.productsOptions;
                timeSlotsOptions = selectedProduct
                    ? guests[selectedGuests.value].products[
                          selectedProduct.value
                      ].timeSlots.timeSlotsOptions
                    : guests[selectedGuests.value].timeSlots.timeSlotsOptions;
            } else {
                productsOptions = [];
                timeSlotsOptions = [];
            }
        }
        if (selectedGuests && selectedProduct && selectedTimeSlot) {
            selectedInstance =
                guests[selectedGuests.value].products[selectedProduct.value]
                    .timeSlots[selectedTimeSlot.value];
        }

        return (
            guests && (
                <form className="modal-body" onSubmit={this.handleSubmit}>
                    <h6 className="selectHeading">{labels.guestsTitle}</h6>
                    <SelectField
                        ref={(guests) => (this.guests = guests)}
                        name="Guests"
                        label={labels.guestsLabel}
                        disableValidation={true}
                        showLabel={false}
                        value={selectedGuests && selectedGuests.value}
                        title={selectedGuests && selectedGuests.title}
                        options={guestsOptions}
                        disableDefaultOption={false}
                        readOnly={false}
                        changeCallback={this.updateValue}
                    />
                    <div className="search_filters--divider">
                        <span>{filtersLabel}</span>
                    </div>
                    <div
                        className={`${selectedGuests ? 'active' : 'disabled'}`}
                    >
                        <h6 className="selectHeading">{productTitle}</h6>
                        <SelectField
                            name="Product"
                            label={productLabel}
                            disableValidation={true}
                            showLabel={false}
                            value={selectedProduct && selectedProduct.value}
                            title={selectedProduct && selectedProduct.title}
                            options={productsOptions}
                            disableDefaultOption={productsOptions.length === 1}
                            defaultLabel={productLabel}
                            readOnly={productsOptions.length <= 1}
                            changeCallback={this.updateValue}
                        />
                        <h6 className="selectHeading">
                            {labels.timeSlotTitle}
                        </h6>
                        <SelectField
                            ref={(timeSlots) => (this.timeSlots = timeSlots)}
                            name="TimeSlot"
                            label={labels.timeSlotLabel}
                            disableValidation={true}
                            value={selectedTimeSlot && selectedTimeSlot.value}
                            title={selectedTimeSlot && selectedTimeSlot.title}
                            options={timeSlotsOptions}
                            showLabel={false}
                            errorMsg="error"
                            disableDefaultOption={false}
                            defaultLabel={labels.timeSlotLabel}
                            changeCallback={this.updateValue}
                        />
                        {selectedTimeSlot && (
                            <PortSlot
                                day={plainDateFormat(
                                    selectedTimeSlot.value,
                                    'YYYY-MM-DD'
                                )}
                                headerData={headerData}
                                mycruiseSummaryApiService={
                                    services.mycruiseItineraryApiV1
                                }
                            />
                        )}
                        {(selectedProduct || selectedTimeSlot) && (
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
                        <SpaFormSummary
                            currency={currency}
                            pricePerPersonLabel={labels.pricePerPersonLabel}
                            totalLabel={labels.totalLabel}
                            selectedInstance={selectedInstance}
                            selectedGuests={selectedGuests}
                        />
                        <SpaAddToCart
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

spaEventForm.defaultProps = {
    maxGuestsCookery: 20,
    maxGuestsLimelight: 6
};

export default spaEventForm;
