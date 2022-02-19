'use strict';

import React from 'react';
import ReactAriaModal from 'react-aria-modal';
import { getPriceSymbolForCurrencyCode } from '../commons/CUK/currencyFormat';
import SelectField from '../commons/CUK/selectField';
import scroller from '../commons/CUK/scroller';
import Link from '../commons/CUK/link';
import SessionStorage from '../commons/CUK/session-storage';
import fetchData from '../commons/CUK/fetch-data';
import { calculateAge } from '../commons/CUK/dateFormat';
import { cloneData, getConfig, convertValueToVaildDecimalPoint } from '../commons/CUK/utilities';
import PubSub from '../commons/CUK/pubsub';
import topics from '../../library/js/config/topics';
import analytics from '../commons/CUK/analytics';

class allInclusiveOverlay extends React.Component {
    constructor(props) {
        super(props);

        const {
            allInclusivePackages,
            allInclusivePassengers,
            subtotal,
            total
        } = this.enrichData();
        this.initialPassengers = allInclusivePassengers;
        this.state = {
            products: allInclusivePackages,
            passengers: allInclusivePassengers,
            subtotal: subtotal,
            total: total,
            hideLabel: '',
            disabled: 'cta-disabled',
            // hover: false,
            showError: false,
            errorMsg: ''
        };
    }

    componentDidMount() {
        // analytics.clickTracking(this);
    }
    componentDidUpdate() {
        // analytics.clickTracking(this);
    }

    /**
     *  enrichData - Handles passengers' and products'
     * data enrichment for later use.
     *
     * @returns {enrichedData} Object with enriched data
     */

    /**
     * @typedef {Object} enrichedData Resulting data returned from enrichment
     * @property {array} allInclusivePackages Array containing enriched packages' data
     * @property {array} allInclusivePassengers Array containing enriched passengers' data
     * @property {number} subtotal Price per day
     * @property {number} total Price per day multiplied for cruiseLength
     */

    enrichData = () => {
        const { cruiseLength, products, passengers } = this.props;
        const allInclusivePackages = products
            .filter(
                (allInclusivePackage) =>
                    allInclusivePackage.stock &&
                    allInclusivePackage.stock.stockLevel > 0
            )
            .map((allInclusivePackage) =>
                this.enrichPackageData(allInclusivePackage)
            );
        const allInclusivePassengers = passengers.map((passenger) =>
            this.enrichPassengerData(passenger, allInclusivePackages)
        );
        let subtotal = allInclusivePassengers.reduce(
            (total, passenger) => (total += passenger.selectedDataPrice),
            0
        );
        const total = subtotal * cruiseLength;
        const enrichedData = {
            allInclusivePackages,
            allInclusivePassengers,
            subtotal,
            total
        };

        return enrichedData;
    };
    /**
     * enrichPassengerData - Handles data enrichment for single passenger
     * with data regarding age at present, age at embark date, price group
     * and price group label.
     * As last step filters packages available for the passenger and
     * if only one option is available pre populates the data
     * with that particular option.
     *
     * @param {object} passenger Single passenger's data to enrich
     * @param {array} allInclusivePackages All available products
     * @returns {object} Single passenger enriched data
     */
    enrichPassengerData = (passenger, allInclusivePackages) => {
        const { embarkDate, minAlcoholicAge, labels } = this.props;
        const passengerBirth = new Date(passenger.birthDate);
        const age = calculateAge(passengerBirth.getTime());
        const ageAtEmbark = calculateAge(
            passengerBirth.getTime(),
            embarkDate.getTime()
        );
        let availablePackages;
        let hasOnlyOneOption;

        if (
            (passenger.ageCode && passenger.ageCode === 'AD') ||
            age >= minAlcoholicAge
        ) {
            passenger.priceGroupLabel = labels.adultLabel;
            passenger.priceGroup = 'Adults';
        } else if (
            (passenger.ageCode && passenger.ageCode === 'CH') ||
            (age < minAlcoholicAge && age >= 4)
        ) {
            if (ageAtEmbark >= minAlcoholicAge) {
                passenger.priceGroupLabel = labels.adultLabel;
                passenger.priceGroup = 'Adults';
            } else {
                passenger.priceGroupLabel = labels.childLabel;
                passenger.priceGroup = 'Children';
            }
        } else if (
            (passenger.ageCode && passenger.ageCode === 'IN') ||
            age < 4
        ) {
            passenger.priceGroupLabel = labels.infantLabel;
            passenger.priceGroup = 'Infants';
        }

        if (passenger.priceGroup === 'Infants') {
            availablePackages = allInclusivePackages.filter(
                (aibPackage) => aibPackage.code === this.props.basePackageCode
            );
            return {
                ...passenger,
                age,
                ageAtEmbark,
                selectedDataValue: availablePackages[0].code,
                selectedDataLabel: availablePackages[0].label,
                selectedDataPrice: availablePackages[0].fromPrice.value
            };
        } else {
            availablePackages = this.filterPackagesForPassenger(
                allInclusivePackages,
                passenger
            );

            hasOnlyOneOption =
                availablePackages && availablePackages.length === 1;

            return {
                ...passenger,
                age,
                ageAtEmbark,
                selectedDataValue: hasOnlyOneOption
                    ? availablePackages[0].code
                    : '',
                selectedDataLabel: hasOnlyOneOption
                    ? availablePackages[0].label
                    : labels.selectLabel,
                selectedDataPrice: hasOnlyOneOption
                    ? availablePackages[0].fromPrice.value
                    : 0
            };
        }
    };

    /**
     *  filterPackagesForPassenger - Handles filtering of packages
     * against a particular passenger.
     *
     * @param {array} packages Packages to be filtered
     * @param {object} passenger Passenger to filter packages against
     * @returns {array} Filtered available packages
     */
    filterPackagesForPassenger = (packages, passenger) =>
        packages.filter(
            (allInclusivePackage) =>
                allInclusivePackage[`availableFor${passenger.priceGroup}`]
        );

    /**
     * enrichPackageData - Handles enrichment of single package
     * with data regarding availability for adults only and
     * data to be used from select field like value, label and disabled
     *
     * @param {object} allInclusivePackage Package data to enrich
     * @returns {object} Enriched package data
     */
    enrichPackageData = (allInclusivePackage) => {
        const { isAdultLogged } = this.props;
        const {
            name,
            code,
            availableForInfants,
            availableForChildren,
            availableForAdults,
            fromPrice
        } = allInclusivePackage;
        const onlyForAdults =
            !availableForInfants && !availableForChildren && availableForAdults;

        return {
            ...allInclusivePackage,
            label: fromPrice
                ? `${name} - ${getPriceSymbolForCurrencyCode(fromPrice.currencyIso)}${
                fromPrice.value
                }`
                : `${name}`,
            value: code,
            disabled: onlyForAdults && !isAdultLogged
        };
    };

    /**
     * handleSubmit - Handles data submission for purchase
     * and cart update ,builds body for the Put request,
     * providing behaviours in case of success and in case of failure.
     */
    handleSubmit = () => {
        analytics.clickTracking(this);
        const url = this.props.services.urls.updateCartApi;
        let { passengers } = this.state;
        let obj = {
            groupID: '',
            qty: passengers.length,
            recipients: [],
            productType: 'AIBEVERAGE'
        };
        const header = SessionStorage.getItem('header');
        const cruiseData = SessionStorage.getItem('cruiseData');
        let dobArray = [];
        header.passengers.forEach((passenger) => {
            dobArray.push(passenger.birthDate);
        })
        const config =
            typeof window !== 'undefined'
                ? window.configs
                : '';
        const customCurrencyCode = config.brand.toLowerCase() === "po" ? "gbp" : "usd";
        const { bookingRef } = header;
        const apiKey = getConfig('apikeyMycruise', '');

        const currencyLocale =
            typeof window !== 'undefined'
                ? window.configs.currencyLocale
                : '';

        passengers.map((passenger) => {
            obj.recipients.push({
                bookingRef,
                paxNo: passenger.paxNumber,
                productCode: passenger.selectedDataValue
            });
        });

        let analyticsObj = [];
        passengers.map((passenger) => {
            analyticsObj.push({
                productName: passenger.selectedDataValue.replace('_', ' '),
                productType: "aibeverage",
                productID: passenger.selectedDataValue,
                skuID: passenger.selectedDataValue,
                skuName: passenger.selectedDataValue.replace('_', ' '),
                unitPrice_GBP: convertValueToVaildDecimalPoint(passenger.selectedDataPrice),
                unitSalePrice_GBP: convertValueToVaildDecimalPoint(passenger.selectedDataPrice),
                unitSalePrice_local: convertValueToVaildDecimalPoint(passenger.selectedDataPrice),
                unitPrice_local: convertValueToVaildDecimalPoint(passenger.selectedDataPrice),
                quantity: cruiseData.durationCruise && parseInt(cruiseData.durationCruise)
            });
        });

        fetchData(url, {
            method: 'POST',
            body: JSON.stringify(obj),
            headers: {
                'X-CommonData': JSON.stringify(header),
                'X-Source-Identity-Token-0': apiKey,
                'Content-type': 'Application/json'
            }
        })
            .then((res) => {

                let hasErrors = res.errors && res.errors.length > 0;

                if (!hasErrors) {

                    analytics.setAdditionalPageTrackAttributes({
                        myCruiseDetails: {
                            bookingNumber: header.bookingRef,
                            voyageID: header.cruiseCode,
                            voyageName: cruiseData.cruiseName,
                            shipName: cruiseData.shipName,
                            depDate: header.embarkationDate,
                            destName: "",
                            durationDays: header.physicalCruiseDuration,
                            depPortName: cruiseData.embarkPort,
                            destPortName: cruiseData.disembarkPort,
                            stateroomType: "",
                            numGuests: header.passengers.length,
                            dob: dobArray,
                        },
                        loginStatus: "logged in",
                        loginType: (header.agent) ? header.agent.agentType : 'customer',
                        AgentID: (header.agent) ? header.agent.id : '',
                        crmID: "",
                        country: header.market,
                        languageSelected: header.language.substring(0, 2),
                        customCurrencyCode: customCurrencyCode,
                        memberLoyaltyLevel: header.customer.loyaltyTier,
                        server: "",
                        localDayTime: new Date().toString(),
                        timePartingCodes: "",
                        pageType: config.pageName,
                        //Please refer Page and Content Hierarchy Tabs for below values
                        sectionLevelOne: "",
                        sectionLevelTwo: "",
                        sectionLevelThree: "",
                        sectionLevelFour: "",
                        pageName: config.pageName,
                        pageChannel: "",
                        pageHier: "",
                        //Please refer Page and Content Hierarchy Tabs for above values
                        ecomStep: "",
                        event: 'scAdd',
                        product_add2cart_aib: analyticsObj,
                        product_add2cart_other: {
                            productID: "",
                            productName: "",
                            skuID: "",
                            skuName: "",
                            productType: "",
                            startDateTime: "",
                            shorexAttributes: {
                                portName: "",
                                activityLevel: "",
                                language: "",
                                duration: "",
                                transport: "",
                                minAge: "",
                                maxAge: "",
                                tourType: [""],
                                tourCategory: "",
                                tourFeatures: ""
                            },
                            diningMealPeriod: "",
                            diningCategory: "",
                            spaTreatmentType: "",
                            spaDuration: "",
                            unitPrice_GBP: "",
                            unitPrice_local: "",
                            quantity: "",
                        },
                        subtotal_GBP: convertValueToVaildDecimalPoint(this.state.total),
                        subtotal_local: convertValueToVaildDecimalPoint(this.state.total)

                    });
                }
                // analytics.clickTracking(this);


                hasErrors ? this.showError(res) : this.showConfirmation(res);
            })
            .catch((error) => {
                // TODO: error menagement
            });
    };

    /**
     * showError - Handles error management from Api response
     * scrolls to the top of modal displaing returned error
     *
     * @param {object} res response object
     */
    showError = (res) => {
        /*  if (res.errors[ 0 ].type === 'InsufficientStockError') {
             if (res.errors[ 0 ].availableStock > 0) {
                 this.setState({
                     errorMsg: this.props.labels.errorLimitedAvailability
                 });
                 this.getInstances();
             }
             else {
                 // verify if only instance out of stock or all instances
                 let url = this.props.service.instancesApi;

                 fetchData(url, {
                     method: 'GET',
                     headers: {
                         'X-CommonData': SessionStorage.getItem('header')
                     }
                 }).then(res => {
                     let instanceWithStock = res.instances.filter((instance) => {
                         return (instance.stock.stockLevelStatus !== 'outOfStock');
                     });
                     let onlyInstanceOutOfStock = instanceWithStock.length > 0 ? true : false;
                     let errorToShow = onlyInstanceOutOfStock ? this.props.labels.errorOutOfStockInstance : this.props.labels.errorOutOfStockProduct;

                     // if there are other instances, re-render the form
                     if (onlyInstanceOutOfStock) {
                         this.createForm(res.instances);
                     }
                     // else set everything as unclickable
                     else {
                         this.setState({
                             allOutOfStock: 'disableForm'
                         });
                     }
                     this.setState({
                         errorMsg: errorToShow
                     });
                 });
             }
         }
         else if (res.errors[ 0 ].type === 'NotAvailableProductError') {
             // not outofstock but not purchasable
             this.setState({
                 errorMsg: this.props.labels.errorNoPurchasable
             });
         } */
        // scroll up to show the error
        this.scrollToTop(
            typeof document !== 'undefined' && document.getElementsByClassName('modal-content-wrapper')[0]
        );
        this.setState({
            errorMsg: 'oooooops!',
            showError: true
        });
    };
    /**
     * showConfirmation - Handles overlay exit
     * and minicart update with PubSub
     */
    showConfirmation = (res) => {
        const numberOfItems = res.totalItemsCount;
        const {
            title,
            onExit,
            products: [product]
        } = this.props;
        const currency = product
            ? getPriceSymbolForCurrencyCode(product.fromPrice.currencyIso)
            : '';

        this.setState({
            disabled: 'cta-disabled'
        });
        onExit();

        PubSub.publish(topics.ADD_TO_CART, {
            name: title,
            total: this.state.total.toFixed(2),
            currency: currency,
            numberOfItems
        });
    };
    /**
     * scrollToTop - Handles scroll to top of page or modal
     *
     * @param {DomElement} element dom node to check scroll position against
     */
    scrollToTop = (element) => {
        if (element.parentNode.parentNode) {
            element.parentNode.parentNode.scrollTop = 0;
        } else {
            this.content.scrollTop = 0;
        }
        if (typeof this.props.trackBackButton === 'function') {
            this.props.trackBackButton();
        }
    };
    /**
     * getApplicationNode - Handles retrievment of wrapper object
     *
     * @returns {DomElement} Wrapping Dom element
     *
     */
    getApplicationNode = () => typeof document !== 'undefined' && document.querySelector('.wrapper');

    /**
     * onEnter - Handles overal entering providing proper scroller
     */
    onEnter = () => {
        this.content = typeof document !== 'undefined' && document.querySelector('.aria-modal');
        this.scroller = scroller({
            element: typeof document !== 'undefined' && document.querySelector('.aria-modal'),
            callback: this.handleScroll
        });
        this.props.onEnter && this.props.onEnter();
    };

    /**
     * onExit - Handles overlay exit providing form reset
     */
    onExit = () => {
        analytics.clickTracking(this);
        const { onExit } = this.props;
        this.resetConfiguration();

        onExit && onExit();
    };

    /**
     * resetConfiguration - Sets component to its initial state
     */
    resetConfiguration = () => {
        let passengers = cloneData(this.initialPassengers);
        let subtotal = this.calculateSubTotal(passengers);
        let total = subtotal * this.props.cruiseLength;

        this.setState({
            showError: false,
            passengers: passengers,
            subtotal,
            total
        });
    };
    /**
     * createDiscountLabel - Handles discount label creation
     * with tooltip
     *
     * @returns {JSX} Discount label related markup
     */
    createDiscountLabel = () => {
        const { labels } = this.props;

        return (
            <div className="discount-tooltip-title">
                <div
                    className="discount-tooltip-title-info"
                // onMouseOver={(e) => this.handleMouse(true)}
                // onMouseOut={(e) => this.handleMouse(false)}
                >
                    {/* <div className="discount-tooltip" style={{
                        display: this.state.hover ? 'block' : 'none'
                    }}>
                        <a className='discount-close' onClick={(e) => this.closeTooltip(e)}></a>
                        <p>{labels.disclaimerInfo}</p>
                    </div> */}
                </div>
                {labels.disclaimerLabel}
            </div>
        );
    };

    /**
     * handleMouse - Handles "mouse" events toggling
     * @param {boolean} state "hover" property.
     */
    handleMouse = (state) => {
        this.setState({ hover: state });
    };

    /**
     * closeTooltip - handleClosing of tooltip preventing default click behaviour
     * and toggling state "hover" property to false.
     * TODO: Seems that is not needed because show/hide of tooltip is triggered with hover
     *
     * @param {any} event close button click event
     */
    closeTooltip = (event) => {
        event.preventDefault();
        this.setState({ hover: false });
    };
    /**
     * createGuestList - Handles Guest List creation
     * looping trough passenger and creating proper select field
     *
     * @returns {JSX} Guest list related markup
     */
    createGuestList = () => {
        const { labels } = this.props;
        const { passengers, products } = this.state;

        return passengers.map((passenger, index) => {
            const {
                title,
                firstName,
                lastName,
                priceGroup,
                priceGroupLabel
            } = passenger;
            const options = this.filterPackagesForPassenger(
                products,
                passenger
            );

            return (
                <li className="wrap" key={index}>
                    <h6>
                        {`${title} ${firstName} ${lastName} `} |{' '}
                        <span className="priceGroup">{`${priceGroupLabel}`}</span>
                    </h6>
                    {priceGroup === 'Infants' ? (
                        <SelectField
                            name={`passenger${index}`}
                            label={labels.selectLabel}
                            disableValidation={true}
                            defaultValue={labels.selectLabel}
                            value={passengers[index].selectedDataValue}
                            title={passengers[index].selectedDataLabel}
                            options={options}
                            errorMsg="error"
                            disableDefaultOption={true}
                            readOnly={true}
                            changeCallback={(name, value, title, event) =>
                                this.updateForm(value, title, index)
                            }
                        />
                    ) : (
                            <SelectField
                                name={`passenger${index}`}
                                label={labels.selectLabel}
                                disableValidation={true}
                                defaultValue={labels.selectLabel}
                                value={passengers[index].selectedDataValue}
                                title={passengers[index].selectedDataLabel}
                                options={options}
                                errorMsg="error"
                                disableDefaultOption={options.length === 1}
                                readOnly={options.length === 1}
                                changeCallback={(name, value, title, event) =>
                                    this.updateForm(value, title, index)
                                }
                            />
                        )}
                </li>
            );
        });
    };

    /**
     * calculateSubTotal - Handles sum of selectedData prices for all passengers
     *
     * @param {array} passengers pasengers to sum prices from
     * @returns {number} subtotal derived from passengers' selectedData prices
     */
    calculateSubTotal = (passengers) =>
        passengers.reduce(
            (total, passenger) => (total += passenger.selectedDataPrice),
            0
        );

    /**
     * updateForm - Handles overlay update according to received value.
     * Filters packages against received package value
     * Updates every same priceGroup passenger with selcted package.
     * Updates subtotal and total based on new values.
     * If all passengers have an option selected cta gets enabled.
     *
     * @param {string} value Selected package value
     * @param {string} label Selected package label
     * @param {number} index Updated passenger's index
     */
    updateForm = (value, label, index) => {
        const { cruiseLength } = this.props;
        let passengers = cloneData(this.state.passengers);
        const { priceGroup } = passengers[index];
        const theProduct = this.state.products.filter(
            (product) => product.code === value
        );
        let subtotal;
        let total;
        let selectedPax = 0;
        let allPaxSelected;

        passengers = passengers.map((passenger) => {
            if (passenger.priceGroup === priceGroup) {
                passenger.selectedDataValue = value !== undefined ? value : '';
                passenger.selectedDataLabel = label;
                passenger.selectedDataPrice =
                    theProduct.length === 1 ? theProduct[0].fromPrice.value : 0;
            }
            passenger.selectedDataValue !== '' && selectedPax++;

            return passenger;
        });

        subtotal = this.calculateSubTotal(passengers);
        total = subtotal * cruiseLength;
        allPaxSelected = selectedPax === passengers.length;

        this.setState({
            passengers,
            subtotal,
            total,
            disabled: allPaxSelected ? '' : 'cta-disabled'
        });
    };

    render() {
        const {
            underlayClass,
            dialogClass,
            defaultUnderlayClass,
            defaultDialogClass,
            title,
            shortDescription,
            labels,
            isAdultLogged,
            ctaType
        } = this.props;
        const dialog = `${defaultDialogClass} ${dialogClass}`;
        const underlay = `${defaultUnderlayClass} ${underlayClass}`;
        const currency = this.state.products[0]
            ? getPriceSymbolForCurrencyCode(
                this.state.products[0].fromPrice.currencyIso
            )
            : '';

        return (
            <ReactAriaModal
                {...this.props}
                dialogClass={dialog}
                underlayClass={underlay}
                onEnter={() => this.onEnter()}
                titleText="configuration"
                verticallyCenter={false}
                getApplicationNode={this.getApplicationNode}
                includeDefaultStyles={false}
            >
                <div className="modal-close-wrap">
                    <button
                        className="close"
                        data-linktext={`${labels.closeLabel}`}
                        aria-label={`${ctaType} ${labels.closeLabel}`}
                        onClick={this.onExit}
                        ref={(close) => (this.close = close)}
                    >
                        <span
                            className={`close-label${
                                this.state.hideLabel ? ' fade-out' : ''
                                }`}
                        >
                            {labels.closeLabel}
                        </span>
                    </button>
                </div>
                <div className={`modal-content-wrapper`}>
                    <div className="modal-content">
                        {this.state.showError && (
                            <div className="modal-error">
                                <p>{this.state.errorMsg}</p>
                            </div>
                        )}
                        <div className="modal-header">
                            <h1 className="title"> {title} </h1>
                            <p className="paragraph"> {shortDescription} </p>
                            <div className="discountMessage">
                                {isAdultLogged
                                    ? labels.disclaimerMessage
                                    : this.state.passengers[0].ageAtEmbark >=
                                        this.props.minAlcoholicAge
                                        ? labels.disclaimerForMinorToBeAdultMessage
                                        : labels.disclaimerForMinorMessage}
                            </div>
                        </div>
                        <form
                            className="modal-body"
                            onSubmit={this.handleSubmit}
                        >
                            <div className="guestsList">
                                <h4>{labels.guestsLabel}</h4>
                                <ul>{this.createGuestList()}</ul>
                                <div className="subtotal">
                                    <h5 className="subtotal__label">
                                        {labels.subtotalLabel}
                                        <br />
                                        {/* <small>{labels.subtotalSubtitle}</small> */}
                                    </h5>
                                    <h5 className="subtotal__price">
                                        {currency} {this.state.subtotal.toFixed(2)}
                                        {/* this.state.subtotal > 0 && ',00' */}
                                    </h5>
                                </div>
                                <div className="cruiseLength">
                                    <h4 className="cruiseLength__label">
                                        {labels.cruiseLengthLabel}
                                        {/* <br /><small>{labels.cruiseLengthSubtitle}</small> */}
                                    </h4>
                                    <h4 className="cruiseLength__length">
                                        {this.props.cruiseLength}{' '}
                                        {labels.daysLabel}
                                    </h4>
                                </div>
                                <div className="discountLabel">
                                    {this.createDiscountLabel()}
                                </div>
                                <div className="total">
                                    <h3 className="total__label">
                                        {labels.totalLabel}
                                    </h3>{' '}
                                    <h3 className="total__price">
                                        {currency} {this.state.total.toFixed(2)}
                                        {/* this.state.total > 0 && ',00' */}
                                    </h3>
                                </div>
                            </div>
                            <div>
                                <Link
                                    url=""
                                    ariaLabel={labels.addToCartLabel}
                                    label={labels.addToCartLabel}
                                    url="#"
                                    onClick={(e) => this.handleSubmit()}
                                    linkClassName={`${
                                        this.state.disabled
                                        } cta-primary`}
                                    dataLinktext="add to cart"
                                >
                                    {labels.addToCartLabel}
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </ReactAriaModal>
        );
    }
}

allInclusiveOverlay.defaultProps = {
    ctaType: '',
    underlayClass: '',
    dialogClass: '',
    defaultUnderlayClass: 'aria-modal-underlay',
    defaultDialogClass: 'aria-modal'
};

export default allInclusiveOverlay;
