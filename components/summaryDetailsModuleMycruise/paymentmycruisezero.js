'use strict';

import React from 'react';
// import jsencrypt from 'jsencrypt';
import InputField from '../commons/CUK/inputField';
import { regex } from '../../library/js/config/regex';
import SelectField from '../commons/CUK/selectField';
import CurrencyFormat from '../commons/CUK/currencyFormat';
import fetchData from '../commons/CUK/fetch-data';
import { plainDateFormat } from '../commons/CUK/dateFormat';
import Modal from '../commons/CUK/modal';
import Loader from '../commons/CUK/loader';
import SessionStorage from '../commons/CUK/session-storage';
import ReadMoreOrLess from '../commons/CUK/readMoreOrLess';
import analytics from '../commons/CUK/analytics';
import { getConfig, callForPaymentMonitoring } from '../commons/CUK/utilities';
import PubSub from '../commons/CUK/pubsub';
import topics from '../../library/js/config/topics';
import { checkCookie, getCookie } from '../commons/CUK/cookies';
import moment from 'moment';

class paymentmycruisezero extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            totalPriceWithTax: this.props.total,
            totalLoyaltyDiscount: this.props.totalLoyaltyDiscount,
            firstNameError: '',
            lastNameError: '',
            cityError: '',
            countyError: '',
            numberError: '',
            billingAddressError: '',
            countryError: '',
            titleError: '',
            zipCodeError: '',
            emailAddressError: {},
            errorCount: 0,
            handleErrorModal: '',
            errors: {},
            errorText: '',
            isFormSubmitted: false,
            monthsRef: {},
            yearsRef: {},
            titleRef: {},
            pubKey: '',
            newCart: {},
            encryptId: '',
            formCompleted: false,
            disabled: false,
            showModalExpired: false,
            showModalError: false,
            genericErrorLabel: '',
            showModalTerms: false,
            showThrobber: false,
            monthIsNotValid: false,
            hasReadMore: true,
            active: false,
            showContentForTerm: '',
            capturedAmountLabel: false,
            termsAndConditionCheckBoxChecked: false,
            termsAndConditionCheckBoxError: false,
            billingInfo: {
                title: {
                    value: '',
                    title: ''
                },
                firstName: '',
                lastName: '',
                city: '',
                country: {
                    value: '',
                    title: ''
                },
                billingAddress: '',
                number: '',
                billingAddress2: '',
                zipCode: '',
                email: '',
                county: ''
            }
        };
    }

    componentWillMount() {
        //before render
        this.initLocalData();
    }

    componentWillReceiveProps(nextProps) {
        // console.log('modified outside will receive props',nextProps);
        if (this.state.totalPriceWithTax.value !== nextProps.total.value) {
            // console.log('modified inside will receive props',this.state.modified);
            this.setState({
                totalPriceWithTax: this.props.total
            });
        }
    }

    componentDidMount() {
        //after render
        this.node.scrollIntoView({ block: 'start', behavior: 'smooth' });
        window.scrollTo(0, 0);
        const {
            formFields: { country }
        } = this.props.attributes;

        const userData = SessionStorage.getItem('userData');
        const customer = userData.customer;
        let helpers = this.state.billingInfo;
        let salutation = '';
        let countyVisible = false;
        if (customer.title && customer.title.toLowerCase() === 'mr') {
            salutation = 'Mr.';
        } else if (customer.title && customer.title.toLowerCase() === 'mrs') {
            salutation = 'Mrs.';
        } else if (customer.title && customer.title.toLowerCase() === 'ms') {
            salutation = 'Ms.';
        }
        helpers.firstName = customer.firstName ? customer.firstName : '';
        helpers.lastName = customer.lastName ? customer.lastName : '';
        helpers.title.value = customer.title
            ? customer.title.toLowerCase()
            : '';
        helpers.title.title = customer.title ? salutation : '';
        helpers.email = customer.email ? customer.email : '';

        const billingIfoFromSession =
            SessionStorage.getItem('billingInfo') || {};
        const paymentFailRedirect =
            SessionStorage.getItem('paymentFailRedirect') || false;
        let formCompleted = false;
        if (helpers.email) {
            SessionStorage.setItem('paymentFailRedirect', false);
            const ele =
                (typeof document !== 'undefined' &&
                    document.getElementsByClassName('checkoutForm')) ||
                [];
            if (ele.length) {
                ele[0].scrollIntoView();
            }
            // helpers = billingIfoFromSession;
            formCompleted = true;
        } else {
            formCompleted = false;
        }
        
        this.setState({
            billingInfo: helpers,
            formCompleted: formCompleted,
            countyVisible
        });
    }

    componentWillUnmount() {}

    initLocalData = () => {
        const { formFields, labels } = this.props.attributes;
        let months = {},
            years = {},
            titles = {},
            countries = {};
        let newOptionsMonth = [],
            newOptionsTitle = [],
            newOptionsCountry = [];
        //const monthOpt = {"label":"Month","options":[{"04":{"label":"April","value":"04"}},{"08":{"label":"August","value":"08"}},{"12":{"label":"December","value":"12"}},{"02":{"label":"February","value":"02"}},{"01":{"label":"January","value":"01"}},{"07":{"label":"July","value":"07"}},{"06":{"label":"June","value":"06"}},{"03":{"label":"March","value":"03"}},{"05":{"label":"May","value":"05"}},{"default":{"label":"Month","value":null}},{"11":{"label":"November","value":"11"}},{"10":{"label":"October","value":"10"}},{"09":{"label":"September","value":"09"}}],"error":{"invalid":"Month Invalid Error","empty":"Month Empty Error"}};

        //let monthField = monthOpt;
        let monthField = formFields.month;
        let titleField = formFields.title;
        let countryField = formFields.country;
        let firstNameError = {},
            lastNameError = {},
            cityError = {},
            countyError = {},
            monthError = {},
            numberError = {},
            billingAddressError = {},
            countryError = {},
            titleError = {},
            zipCodeError = {},
            emailAddressError = {},
            yearsError = {};

        if (monthField !== null && monthField !== undefined) {
            Array.from(Object.values(monthField.options)).forEach((m) => {
                for (const [key, val] of Object.entries(m)) {
                    let newObj = m;
                    // let newObj = Object.values(val)[0];
                    // newObj.key = Object.keys(val)[0];
                    // newObj.value = Object.keys(val)[0];
                    // newObj.fkey = key;
                    if (Object.values(val)[1] !== null) {
                        newOptionsMonth.push(newObj);
                    }
                }
                newOptionsMonth = newOptionsMonth.sort((a, b) => {
                    // return a.key - b.key;
                    return Object.keys(a)[0] - Object.keys(b)[0];
                });

                monthField.options = newOptionsMonth;
                delete monthField.months;
            });
        }

        if (titleField.title !== undefined && titleField.title !== null) {
            Array.from(Object.values(titleField.title)).forEach((t) => {
                for (const [key, val] of Object.entries(t)) {
                    let newObj = Object.values(val)[0];

                    newObj.key = Object.keys(val)[0];
                    newObj.fkey = key;
                    newObj.value = key;
                    newOptionsTitle.push(newObj);
                }

                newOptionsTitle = newOptionsTitle.sort((a, b) => {
                    return a.key - b.key;
                });

                titleField.options = newOptionsTitle;
                delete titleField.title;
            });
        }

        if (
            countryField.countries !== null &&
            countryField.countries !== undefined
        ) {
            Array.from(Object.values(countryField.countries)).forEach((c) => {
                for (const [key, val] of Object.entries(c)) {
                    let newObj = Object.values(val)[0];

                    newObj.key = Object.keys(val)[0];
                    newObj.fkey = key;
                    newObj.value = key;
                    // console.log(newObj)
                    if (
                        newObj === 'United States' ||
                        newObj === 'United Kingdom' ||
                        newObj === 'Germany' ||
                        newObj === 'Australia'
                    ) {
                        newOptionsCountry.shift(newObj);
                    } else {
                        newOptionsCountry.push(newObj);
                    }
                }
                let firstFourCountries = newOptionsCountry.splice(0, 4);

                newOptionsCountry = newOptionsCountry.sort((a, b) => {
                    return a.key - b.key;
                });

                newOptionsCountry = firstFourCountries.concat(
                    newOptionsCountry
                );

                //newOptionsCountry= [...firstFourCountries , ...newOptionsCountry];

                countryField.options = newOptionsCountry;
                delete countryField.countries;
            });
        }

        months = monthField;
        titles = titleField;
        countries = countryField;

        let currentYear = new Date().getFullYear();
        let startYear = currentYear;
        let finalYear = currentYear + 20;

        years = formFields.year;
        years.options = [];
        for (let i = startYear; i < finalYear; i++) {
            years.options.push({ label: i, value: i });
        }

        firstNameError.empty = formFields.firstName.error.empty;
        firstNameError.invalid = formFields.firstName.error.invalid;

        lastNameError.empty = formFields.lastName.error.empty;
        lastNameError.invalid = formFields.lastName.error.invalid;

        cityError.empty = formFields.city.error.empty;
        cityError.invalid = formFields.city.error.invalid;

        countyError.empty = formFields.county.error.empty;
        countyError.invalid = formFields.county.error.invalid;

        numberError.empty = formFields.houseNumber.error.empty;
        numberError.invalid = formFields.houseNumber.error.invalid;

        billingAddressError.empty = formFields.billingAddress.error.empty;
        billingAddressError.invalid = formFields.billingAddress.error.invalid;

        titleError.empty = formFields.title.error.empty;

        countryError.empty = formFields.country.error.empty;
        countryError.invalid = formFields.country.error.invalid;

        zipCodeError.empty = formFields.zip.error.empty;
        zipCodeError.invalid = formFields.zip.error.invalid;

        emailAddressError.empty = formFields.email.error.empty;
        emailAddressError.invalid = formFields.email.error.invalid;

        this.setState({
            yearsRef: years,
            yearsError: yearsError,
            monthError: monthError,
            monthsRef: months,
            titleRef: titles,
            countryRef: countries,
            firstNameError: firstNameError,
            lastNameError: lastNameError,
            cityError: cityError,
            countyError: countyError,
            numberError: numberError,
            billingAddressError: billingAddressError,
            countryError: countryError,
            titleError: titleError,
            zipCodeError: zipCodeError,
            emailAddressError: emailAddressError
        });
    };

    renderTitleDropdown() {
        const selectFieldTitle = (
            <SelectField
                selectClassName="select-title"
                name="title"
                // disableValidation={true}
                label={this.state.titleRef.label}
                defaultValue={this.state.titleRef.label}
                value={this.state.billingInfo.title.value}
                title={this.state.billingInfo.title.title}
                options={this.state.titleRef.options}
                showLabel={false}
                errorMsg={this.state.titleError}
                blurCallBack={this.enableSubmitButton}
                changeCallback={(name, value, title, event) =>
                    this.handleSelectBoxChange(name, value, title, event)
                }
                errorCallback={(errorState, errorMsg) =>
                    this.handleError('selectBox', errorState, errorMsg)
                }
            />
        );

        return selectFieldTitle;
    }
    handleEnterKeyPress = (e) => {
        if (e.key === 'Enter') {
            this.handleSubmit();
        }
    };
    handleError = (stateKey, errorState, errorMsg) => {
        let errors = this.state.errors;

        if (this.state.isFormSubmitted) {
            if (errorState) {
                if (errorMsg) {
                    errors[stateKey] = errorMsg;
                } else if (errors[stateKey]) {
                    /* selectField returns empty message with error value as false, which needs to be removed from error Sumary */
                    delete errors[stateKey];
                }
            } else {
                if (errors[stateKey]) {
                    delete errors[stateKey];
                }
            }
            this.setState({
                ...this.state,
                errors
            });
        }
    };
    handleTextChange = (evt) => {
        let newSelected = evt.target.value;
        let copyOfState = Object.assign({}, this.state.billingInfo);

        copyOfState[evt.target.name] = newSelected;
        this.setState({ billingInfo: copyOfState });
    };
    handleSelectBoxChange = (name, value, title, event) => {
        let newSelected = {
            value: value,
            title: title
        };

        let copyOfState = Object.assign({}, this.state.billingInfo);

        if (name === 'title' || name === 'country') {
            copyOfState[name] = newSelected;
        }

        this.setState({ billingInfo: copyOfState });

        if (name === 'country') {
            this.changeCountyLabel(value);
        }
    };

    /**
     * If the country has states parameters, show the county/state input field
     * @param {object} value option selected in country
     */
    changeCountyLabel = (value) => {
        let selectedCountry = this.state.countryRef.options.filter(
            (x, index) => x[value] !== undefined
        );

        let selected = selectedCountry[0][value];
        let states = selected.states;

        if (states !== undefined && states !== null) {
            this.setState({
                countyVisible: true,
                countyLabel: selected.regionLabel
            });
        } else {
            this.setState({
                countyVisible: false
            });
        }
    };

    /**
     * Payment process first step: check with stock reservation API to check if products still availables
     */
    handleSubmit = () => {
        const { termsAndConditionCheckBoxChecked } = this.state;
        if (termsAndConditionCheckBoxChecked) {
            let copyOfState = Object.assign({}, this.state.billingInfo);
            const houseNumber = copyOfState['number'];
            copyOfState['number'] = houseNumber.trim().substr(0, 10);
            // this.setState({ billingInfo: copyOfState });

            const analyticsParam = {
                event: 'event310'
            };
            // analytics.customClicks(analyticsParam);
            const { urls } = this.props.attributes.services;
            const errors = this.props.errorLabels.reserveHybris;
            const errors400 = this.props.errorLabels.errors400;
            let url = urls.reserveStockApi;
            let header = SessionStorage.getItem('header');
            const {
                customer: { loyaltyTier }
            } = header;
            let apikey =
                typeof window !== 'undefined'
                    ? window.configs.apikeyMycruise
                    : '';
            const obj = JSON.stringify({
                reservationMode: 'RESERVE'
            });
            if (
                typeof document !== 'undefined' &&
                document.getElementsByClassName('show-msg').length === 0
            ) {
                fetchData(url, {
                    method: 'POST',
                    body: obj,
                    headers: {
                        'X-CommonData': JSON.stringify(header),
                        'Content-Type': 'application/json',
                        'X-Source-Identity-Token-0': apikey
                    },
                    mode: 'cors'
                }).then((res) => {
                    // herror handling
                    if (res.status) {
                        let error =
                            parseInt(res.status) === 400
                                ? errors400[res.message]
                                : errors[res.status];
                        this.setState({
                            showThrobber: false,
                            showModalError: true,
                            genericErrorLabel: error,
                            billingInfo: copyOfState
                        });
                    } else if (res.errors && res.errors.length > 0) {
                        this.setState({
                            showModalExpired: true,
                            newCart: res,
                            billingInfo: copyOfState
                        });
                    } else {
                        // no errors, continue to acceptance of terms and condition
                        this.requestKeys();
                    }
                });
                // noErrors = true;
            }
        } else {
            const { labels } = this.props.attributes;
            // const obj = {
            //     componentName: this.props.type,
            //     linkType: 'o',
            //     linkPageName: getConfig('pageName'),
            //     validationError: labels.termsAndConditionsErrorLabel,
            //     event: 'event77'
            // };
            // analytics.customClicks(obj);
            this.setState({
                termsAndConditionCheckBoxError: true
            });
        }
    };

    handleModalExpired() {
        this.setState({
            showModalExpired: false
        });
        this.props.handleReserveStockError(this.state.newCart.cart);
    }

    handleModalError() {
        this.setState({
            showModalError: false,
            capturedAmountLabel: false
        });
        // this.props.handleReserveStockError(this.state.newCart.cart);
    }

    handleModal(status) {
        this.setState({
            showModalTerms: status
        });
    }

    //////// getCheckoutUrl from in this method , getChecoutUrl
    //, shoppingcartid
    requestKeys = () => {
        debugger;
        const { termsAndConditionCheckBoxChecked, formCompleted } = this.state;
        if (termsAndConditionCheckBoxChecked && formCompleted) {
            let copyOfState = Object.assign({}, this.state.billingInfo);
            const { urls } = this.props.attributes.services;
            const errors = this.props.errorLabels.reserveHybris;
            const errors400 = this.props.errorLabels.errors400;
            let url = urls.placeOrderZeroCartVal;
            let header = SessionStorage.getItem('header');
            const {
                customer: { loyaltyTier }
            } = header;
            let apikey =
                typeof window !== 'undefined'
                    ? window.configs.apikeyMycruise
                    : '';
            const userData = SessionStorage.getItem('userData');
            let bookingReference = userData.bookingRef;

            let billingAddress = {};
            let value = this.state.billingInfo.country.value;

            let selectedCountry = this.state.countryRef.options.find(
                (x) => Object.keys(x)[0] === value
            );

            billingAddress['title'] = this.state.billingInfo.title.value;
            billingAddress['firstName'] = this.state.billingInfo.firstName;
            billingAddress['lastName'] = this.state.billingInfo.lastName;
            billingAddress['streetNumber'] = this.state.billingInfo.number;
            billingAddress['line1'] = this.state.billingInfo.billingAddress;
            billingAddress['line2'] = this.state.billingInfo.billingAddress2;
            billingAddress['town'] = this.state.billingInfo.city;
            billingAddress['postalCode'] = this.state.billingInfo.zipCode;
            billingAddress['email'] = this.state.billingInfo.email;
            billingAddress['amount'] = this.state.totalPriceWithTax.value;
            billingAddress[
                'currency'
            ] = this.state.totalPriceWithTax.currencyIso;

            let country = {};
            //mock purpose
            // country['isoCode'] = Object.keys(selectedCountry)[0];
            // billingAddress['country'] = Object.keys(selectedCountry)[0];
            // billingAddress['isocode'] = Object.values(
            //     selectedCountry
            // )[0].isoCode;
            SessionStorage.setItem('billingAddress', billingAddress);
            let params = { billingAddress: billingAddress };
            const obj = JSON.stringify(params);
            debugger;
            fetchData(url, {
                method: 'POST',
                body: obj,
                headers: {
                    'X-CommonData': JSON.stringify(header),
                    'Content-Type': 'application/json',
                    'X-Source-Identity-Token-0': apikey
                },
                mode: 'cors'
            }).then((res) => {
                if (res.status.toLowerCase() != 'created') {
                    let error =
                        parseInt(res.status) === 400
                            ? errors400[res.message]
                            : errors[res.status];
                    this.setState({
                        showThrobber: false,
                        showModalError: true,
                        genericErrorLabel: error,
                        billingInfo: copyOfState
                    });
                } else if (res.errors && res.errors.length > 0) {
                    this.setState({
                        showModalExpired: true,
                        newCart: res,
                        billingInfo: copyOfState
                    });
                } else {
                    const orderId = res.code;
                    const zeroPaymentOrder = {
                        orderId: orderId,
                        payment: 0
                    };
                    SessionStorage.setItem('orderId', zeroPaymentOrder);
                    this.setState({
                        showModalTerms: false,
                        disabled: false,
                        billingInfo: copyOfState
                    });
                    const analyticsParam = {
                        event: 'event311'
                    };
                    // analytics.customClicks(analyticsParam);
                    debugger;
                    const { configs } = window;
                    let redirectLink =
                        configs.confirmationPageUrl + '?orderId=' + orderId;
                    window.location.href = redirectLink;
                }
            });
        } else {
            const { labels } = this.props.attributes;
            const obj = {
                componentName: this.props.type,
                linkType: 'o',
                linkPageName: getConfig('pageName'),
                validationError: labels.termsAndConditionsErrorLabel,
                event: 'event77'
            };
            if (!this.state.billingInfo.email) {
                this.setState({
                    ...this.state,
                    showError: true
                });
                // this.state.emailAddressError
                // this.handleError(
                //     'email',
                //     true,
                //     this.state.emailAddressError.empty
                // );
            }
            if (!termsAndConditionCheckBoxChecked) {
                this.setState({
                    termsAndConditionCheckBoxError: true
                });
            }
        }
    };

    /**
     * Every focus out form an input we verify if the form is completed so the complete payment button can be enabled
     */
    enableSubmitButton = () => {
        // CKS - disabling complete payment button on blur of any field
        this.setState({
            formCompleted: false
        });
        setTimeout(() => {
            let empty = 0;
            let noEmpty = false;
            let noErrors = false;

            Object.keys(this.state.billingInfo).map((field, index) => {
                if (field !== 'email') {
                    return false;
                }
                if (
                    typeof this.state.billingInfo[field] === 'string' &&
                    this.state.billingInfo[field] === ''
                ) {
                    empty++;
                }
            });
            // check if fields are filled
            if (empty === 0) {
                noEmpty = true;
                // check if there are other errors
                if (
                    typeof document !== 'undefined' &&
                    document.getElementsByClassName('show-msg').length === 0
                ) {
                    noErrors = true;
                }
            }

            // if both true, set state to show btn
            if (noErrors && noEmpty) {
                this.setState({
                    formCompleted: true
                });
                if (
                    typeof document !== 'undefined' &&
                    document.activeElement.textContent === 'Continue'
                ) {
                    this.handleSubmit();
                }
            } else {
                this.setState({
                    formCompleted: false
                });
            }
        }, 2000);
    };

    handleTermsAndConditionCheckBox = () => {
        const { termsAndConditionCheckBoxChecked } = this.state;
        this.setState({
            termsAndConditionCheckBoxChecked: !termsAndConditionCheckBoxChecked,
            termsAndConditionCheckBoxError: false
        });
    };

    render = () => {
        const style = {
            color: '#666',
            textAlign: 'left',
            fontSize: '80%',
            fontFamily: 'PraxisCom-Regular'
        };
        const {
            hasReadMore,
            active,
            termsAndConditionCheckBoxChecked,
            termsAndConditionCheckBoxError
        } = this.state;
        const { formFields, labels } = this.props.attributes;
        let termsAndConditionsText = this.state.termsAndConditionsText;
        const { total } = this.props;
        return (
            <div className="checkoutForm" ref={(node) => (this.node = node)}>
                <div className="checkoutForm-wrap zero-payment-wrapper">
                    <div className="checkoutForm-row">
                        <div className="checkoutForm-form-wrap">
                            <div
                                className={
                                    this.state.handleModal === true ||
                                    this.state.handleErrorModal === true
                                        ? 'checkoutForm-wrapper hide'
                                        : 'checkoutForm-wrapper'
                                }
                            >
                                <form
                                    className="checkoutForm-form zero-payment"
                                    name="checkoutForm"
                                    id="checkoutForm"
                                >
                                    <div className="input-formFields">
                                        <InputField
                                            type="text"
                                            required={true}
                                            id="email"
                                            name="email"
                                            blurCallBack={
                                                this.enableSubmitButton
                                            }
                                            changeCallback={
                                                this.handleTextChange
                                            }
                                            placeholder={formFields.email.label}
                                            value={this.state.billingInfo.email}
                                            regex={regex.email}
                                            validate={this.state.validate}
                                            errorMsg={
                                                this.state.emailAddressError
                                            }
                                            errorCallback={(
                                                errorState,
                                                errorMsg
                                            ) =>
                                                this.handleError(
                                                    'email',
                                                    errorState,
                                                    errorMsg
                                                )
                                            }
                                            showAstrick={true}
                                        />
                                    </div>
                                    <div className="checkbox_container">
                                        <li
                                            className="wrap"
                                            key={'pax.paxNumber'}
                                        >
                                            <input
                                                onChange={
                                                    this
                                                        .handleTermsAndConditionCheckBox
                                                }
                                                type="checkbox"
                                                className={`input-check ${
                                                    termsAndConditionCheckBoxError
                                                        ? 'error'
                                                        : ''
                                                }`}
                                                aria-labelledby="variation2-check"
                                                name="checkboxPrice"
                                                aria-describedby="tandc_err"
                                                id="checkbox_term"
                                                checked={
                                                    termsAndConditionCheckBoxChecked
                                                }
                                            />
                                            <label
                                                htmlFor={`checkbox_term`}
                                                className={`checkbox-label `}
                                            >
                                                <span>
                                                    {`${
                                                        labels.termsAndConditionsMessageLabel
                                                    } `}
                                                </span>
                                                <span
                                                    onClick={() => {
                                                        const obj = {
                                                            componentName: this
                                                                .props.type,
                                                            linkType: 'o',
                                                            linkText:
                                                                labels.termsAndConditionsLinkLabel,
                                                            linkPageName: getConfig(
                                                                'pageName'
                                                            )
                                                        };
                                                        analytics.customClicks(
                                                            obj
                                                        );
                                                        const pdfUrl = getConfig(
                                                            'termsAndConditionsPdfPath'
                                                        );
                                                        window.open(
                                                            pdfUrl,
                                                            '_blank'
                                                        );
                                                    }}
                                                >
                                                    <a href="#checkoutForm">
                                                        {
                                                            labels.termsAndConditionsLinkLabel
                                                        }
                                                    </a>
                                                </span>
                                            </label>
                                            {termsAndConditionCheckBoxError && (
                                                <span
                                                    className="error-label show-label"
                                                    ref="checkbox 1"
                                                    id="tandc_err"
                                                >
                                                    {` ${
                                                        labels.termsAndConditionsErrorLabel
                                                    } `}
                                                </span>
                                            )}
                                        </li>
                                    </div>
                                    <div className="submit-wrap cf input-formFields">
                                        {/* <button data-toggle="modal" data-target="#react-aria-modal-dialog" */}
                                        <button
                                            type="button"
                                            className="cta-secondary"
                                            onClick={(e) => this.props.cancel()}
                                        >
                                            {labels.cancelLabel}
                                        </button>
                                        <button
                                            type="button"
                                            className={`cta-primary ${
                                                this.state.formCompleted
                                                    ? ''
                                                    : 'cta-disabled'
                                            }  `}
                                            data-clicktype={`general`}
                                            data-linktext={`${
                                                labels.continueLabel
                                            }`}
                                            onClick={this.requestKeys}
                                        >
                                            {labels.continueLabel}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>

                {termsAndConditionsText && (
                    <Modal
                        mounted={this.state.showModalTerms}
                        onExit={() => this.handleModal(false)}
                        contentLabel="Terms and conditions"
                        ctaType={this.props.ctaType}
                        underlayClass="termsAndCondition-modal"
                    >
                        <a href="#" />
                        <div
                            dangerouslySetInnerHTML={{
                                __html: termsAndConditionsText
                            }}
                            className="disclaimer-text"
                        />

                        <div className="modal-alert boldText">
                            By clicking 'Pay now' you are accepting these terms
                            and conditions,and completing your purchase
                        </div>
                        <div className="modal-btns">
                            <button
                                className="cta-secondary"
                                onClick={() => this.handleModal(false)}
                            >
                                {labels.cancelLabel}
                            </button>
                            <button
                                className={`cta-primary ${
                                    this.state.disabled ? 'cta-disabled' : ''
                                }  `}
                                onClick={() => this.requestKeys()}
                            >
                                {/* <button
                                className="cta-primary"
                                onClick={() => this.finaliseOrder()}
                            > */}
                                {labels.confirmCtaLabel}
                            </button>
                        </div>
                    </Modal>
                )}
                {this.state.showModalExpired && (
                    <Modal
                        mounted={this.state.showModalExpired}
                        onExit={() => this.handleModalExpired()}
                        contentLabel="Expired Error"
                        ctaType={this.props.ctaType}
                        underlayClass="expired-modal"
                    >
                        <div className="">
                            <h4>{labels.paymentExpiredLabel}</h4>
                        </div>

                        <div className="modal-btns">
                            <button
                                className="cta-primary"
                                onClick={() => this.handleModalExpired()}
                            >
                                {labels.tryAgainLabel}
                            </button>
                        </div>
                    </Modal>
                )}
                {this.state.showModalError && (
                    <Modal
                        mounted={this.state.showModalError}
                        onExit={() => this.handleModalError()}
                        contentLabel="Error modal"
                        ctaType={this.props.ctaType}
                        underlayClass="expired-modal"
                    >
                        <div className="">
                            <h4>{this.state.genericErrorLabel}</h4>
                        </div>

                        <div className="modal-btns">
                            <button
                                className="cta-primary"
                                onClick={() => this.handleModalError()}
                            >
                                {this.state.capturedAmountLabel
                                    ? labels.capturedAmountMismatchErrorLabel
                                    : labels.tryAgainLabel}
                            </button>
                        </div>
                    </Modal>
                )}
                {this.state.showThrobber && (
                    <div className="throbberOverlay">
                        <Loader show={this.state.showThrobber} />
                        <p className="throbberOverlay__text">
                            We are processing your payment. Please do not
                            refresh the page.
                        </p>
                    </div>
                )}
            </div>
        );
    };
}

paymentmycruisezero.propTypes = {};

export default paymentmycruisezero;
