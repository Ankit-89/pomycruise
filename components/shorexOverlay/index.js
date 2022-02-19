/*
 * React Modal
 *
 * For examples and features: https://github.com/davidtheclark/react-aria-modal
 */
'use strict';

import React from 'react';
import ReactAriaModal from 'react-aria-modal';
import SelectField from '../commons/CUK/selectField';
import Link from '../commons/CUK/link';
import ContinueShopping from '../continueShopping';
// import moment from 'moment';
import scroller from '../commons/CUK/scroller';
import SessionStorage from '../commons/CUK/session-storage';
import fetchData from '../commons/CUK/fetch-data';
import PubSub from '../commons/CUK/pubsub';
import topics from '../../library/js/config/topics';
import { plainDateFormat } from '../commons/CUK/dateFormat';
import { breakpoint } from '../../library/js/config/index';
import { getPriceSymbolForCurrencyCode } from '../commons/CUK/currencyFormat';
import extractChildComponent from '../commons/CUK/extractChildComponent';
import analytics from '../commons/CUK/analytics';

import { convertValueToVaildDecimalPoint } from '../commons/CUK/utilities';
const { VIEWPORT_TYPE, watchForBreakpoint } = breakpoint;

class shorexOverlay extends React.Component {
    constructor(props) {
        super(props);

        //this.entered = false;
        this.state = {
            hideLabel: '',
            disabled: '',
            readOnly: false,
            daysOptions: [],
            hoursOptions: [],
            days: {},
            total: 0,
            selectedDay: {},
            selectedHour: {},
            selectedPax: [],
            lowStock: false,
            verticallyCenter: props.verticallyCenter,
            showError: false,
            errorMsg: '',
            allOutOfStock: '',
            currency: '',
            portName: '',
            checkedBoxes: []
            // mustRegisterInterest: false
        };
    }

    componentDidMount() {
        const { DESKTOP } = VIEWPORT_TYPE;
        const mqlLVP = watchForBreakpoint(DESKTOP);
        mqlLVP.addListener((mql) => {
            this.handleResize(mql);
        });
        this.handleResize(mqlLVP);
        // this.getLongNamePort();
    }

    handleResize(mql) {
        this.setState(() => ({
            verticallyCenter: mql.matches
        }));
        // this.checkContentHeight();
    }

    checkContentHeight = () => {
        // let modalContent = document.getElementsByClassName('modal-content-wrapper');
        // setTimeout( () =>{
        //     if ( this.entered && modalContent[0].scrollHeight > modalContent[0].clientHeight ) {
        //     }
        // }, 100);
    };

    onEnter = () => {
        const picturefill = require('picturefill');
        this.content = typeof document !== 'undefined' && document.querySelector('.aria-modal');
        this.scroller = typeof this.content !== 'undefined' && scroller({
            element: this.content,
            callback: this.handleScroll
        });

        picturefill();

        this.getInstances();
    };

    onExit = () => {
        analytics.clickTracking(this);
        const { onExit } = this.props;

        this.resetCheckbox();
        this.setState(() => ({
            showError: false,
            hideLabel: false,
            selectedDay: {},
            selectedHour: {},
            checkedBoxes: []
        }));

        onExit && onExit(false);
    };

    handleScroll(ev) {
        this.setState((prevState) => {
            const topPosition = this.content.getBoundingClientRect().top;
            const { hideLabel } = prevState;
            if (topPosition > -20 && hideLabel) {
                return { hideLabel: true };
            } else if (topPosition <= -20 && !hideLabel) {
                return { hideLabel: false };
            } else {
                return {};
            }
        });
    }

    scrollToTop = (ev) => {
        const {
            parentNode: { parentNode }
        } = ev;
        const { content } = this;
        const { trackBackButton } = this.props;

        parentNode ? (parentNode.scrollTop = 0) : (content.scrollTop = 0);

        typeof trackBackButton === 'function' ? trackBackButton() : null;
    };

    getApplicationNode() {
        typeof document !== 'undefined' && document.querySelector('.wrapper');
    }
    /**
     * calling instances API to retreive information about the shorex instances
     * url/shorexCode/instances
     */

    getInstances = () => {
        const { services, id } = this.props;
        const serviceUrl = services.urls.instancesApi;
        const url = serviceUrl.replace('{{productCode}}', id);
        const configs = typeof window !== 'undefined' ? window.configs : {};
        const apiKey = configs.apikeyMycruise;
        const header = SessionStorage.getItem('header');

        fetchData(url, {
            method: 'GET',
            headers: {
                'X-CommonData': JSON.stringify(header),
                'X-Source-Identity-Token-0': apiKey
            }
        }).then((res) => {
            this.createForm(res.instances);
        });
    };
    /**
     * creating the form based on the info retreive by the instances api
     * @param  {object} instances  api response
     */
    createForm = (instances) => {
        const productPrices = instances[0].prices;
        const { country, languages } = this.props;

        const langObj = languages.options.reduce((langObj, lang) => {
            return { ...langObj, ...lang };
        }, {});
        const firstLang = 'en';
        const secondLang = 'de';

        instances = Object.entries(
            instances.reduce((instancesObj, instance) => {
                const { startDateTime, language } = instance;
                instance = {
                    ...instance,
                    langLabel: langObj[language].label
                };
                if (!instancesObj[startDateTime]) {
                    instancesObj[startDateTime] = {
                        [firstLang]: [],
                        [secondLang]: [],
                        others: []
                    };
                }
                if (language === firstLang || language === secondLang) {
                    instancesObj[startDateTime][language].push(instance);
                } else {
                    instancesObj[startDateTime].others.push(instance);
                }
                return instancesObj;
            }, {})
        ).reduce((instancesArr, [key, instances]) => {
            instances.others.sort(
                (a, b) =>
                    a.langLabel.toLowerCase() > b.langLabel.toLowerCase()
                        ? -1
                        : 1
            );
            instancesArr = [
                ...instancesArr,
                ...instances[firstLang],
                ...instances[secondLang],
                ...instances.others
            ];
            return instancesArr;
        }, []);

        const dateFormat = country === 'US' ? 'MMM DD' : 'DD MMM';
        let days = {};
        let daysOptions = [];

        instances.map((instance) => {
            const {
                startDateTime,
                stock,
                purchasable,
                referenceCode,
                paxWithPrices,
                langLabel
            } = instance;
            // get day
            const day = plainDateFormat(startDateTime, dateFormat);
            const dayValue = plainDateFormat(startDateTime, 'YYYY-MM-DD');
            // get time
            const hour = plainDateFormat(startDateTime, 'h.mm A');
            // if not purchasable notPurchasable = true

            // if out of stock outOfStock = true
            const outOfStock =
                stock.stockLevelStatus === 'outOfStock' ? true : false;
            const limitedAvailbility =
                stock.stockLevelStatus === 'lowStock'
                    ? stock.stockLevel
                    : false;

            // create options for day if doesn't exist
            if (!days[dayValue]) {
                days[dayValue] = {
                    label: day,
                    value: dayValue,
                    hours: [],
                    pax: [],
                    outOfStock: outOfStock
                };

                daysOptions.push({
                    value: dayValue,
                    label: day
                });
            }

            // for each hour create an object and push it in hours array
            days[dayValue].hours.push({
                label: `${hour} - ${langLabel} Guide`,
                code: instance.language,
                value: instance.referenceCode,
                outOfStock: outOfStock,
                disabled: !purchasable,
                lowStock: limitedAvailbility
            });

            // set prices for instance, each instance has different prices
            if (!days[dayValue].pax[referenceCode]) {
                days[dayValue].pax[referenceCode] = [];
                days[dayValue].pax[referenceCode] = paxWithPrices;
            }
            if (
                days[dayValue].outOfStock === true
            ) {
                daysOptions.pop();
                daysOptions.push({
                    value: dayValue,
                    label: day,
                    disabled: outOfStock
                });
            } else {
                daysOptions.pop();
                daysOptions.push({
                    value: dayValue,
                    label: day,
                    disabled: false
                });
            }
        });
        let firstNotDisabledDay = daysOptions.findIndex(
            (day) => day.disabled === false
        );
        firstNotDisabledDay =
            firstNotDisabledDay !== -1 ? firstNotDisabledDay : 0;
        const defaultDay = this.state.selectedDay.value
            ? this.state.selectedDay
            : {
                value: daysOptions[firstNotDisabledDay].value,
                title: daysOptions[firstNotDisabledDay].label
            };
        let hourIndex = days[defaultDay.value].hours.findIndex(
            (hour) => hour.referenceCode === this.state.selectedHour.value
        );
        hourIndex = hourIndex !== -1 ? hourIndex : 0;
        const defaultHour = {
            value: days[defaultDay.value].hours[hourIndex].value,
            title: days[defaultDay.value].hours[hourIndex].label
            // mustRegister: days[defaultDay.value].hours[hourIndex].outOfStock
        };

        const readOnly = daysOptions.length === 1;
        const selectedPax = days[defaultDay.value].pax[defaultHour.value];
        const listOfPax = SessionStorage.getItem('orderedList').passengers;
        let selectedPaxOrder = [];

        // ordering selected pax in the same order of listOfPax
        listOfPax.map((singlePax) => {
            const paxNumber = singlePax.paxNumber;
            const orderItem = selectedPax.filter(
                (pax) => Math.floor(pax.paxNumber) === Math.floor(paxNumber)
            );

            selectedPaxOrder.push(orderItem[0] || singlePax);
        });

        const filteredArray = days[defaultDay.value].hours.filter(
            (hour) => hour.value === defaultHour.value
        );
        const lowStock = filteredArray[0].lowStock;

        let defaultCheckedBoxes, defaultTotal;
        if (this.state.checkedBoxes.length > 0) {
            defaultCheckedBoxes = this.state.checkedBoxes;
            defaultTotal = this.calculateTotal(selectedPaxOrder);
        } else {
            let selectedPaxOrderActive = selectedPaxOrder.filter(
                (pax, index) => {
                    return pax.value !== undefined;
                }
            );
            defaultCheckedBoxes = [selectedPaxOrderActive[0].paxNumber];
            defaultTotal = +selectedPaxOrderActive[0].value;
        }

        this.setState(
            () => ({
                daysOptions: daysOptions,
                days: days,
                readOnly: readOnly,
                hoursOptions: days[daysOptions[firstNotDisabledDay].value].hours,
                selectedDay: daysOptions.length > 1 ? {} : defaultDay,
                selectedHour: days[daysOptions[firstNotDisabledDay].value].hours.length > 1 ? {} : defaultHour,
                selectedPax: selectedPaxOrder,
                lowStock: lowStock,
                // mustRegisterInterest: defaultHour.mustRegister,
                interestRegistered: false,
                checkedBoxes: defaultCheckedBoxes,
                total: defaultTotal,
                productPrices: productPrices
            }) /*,
            () => this.resetCheckbox()*/
        );
    };

    updateForm = (name, value, title, event) => {
        // update value in form
        const { days } = this.state;
        const newSelected = {
            value: value,
            title: title
        };
        const hoursOptionOfThisDay = days[value].hours;
        // TODO: get first from en

        let selectedHour = {};

        hoursOptionOfThisDay && hoursOptionOfThisDay.length && hoursOptionOfThisDay.forEach((hour) => {
            if (!hour.disabled && Object.keys(selectedHour).length === 0) {
                selectedHour.value = hour.value,
                    selectedHour.title = hour.label
            }
        })

        const filteredArray = days[value].hours.filter(
            (hour) => hour.value === selectedHour.value
        );
        const lowStock = filteredArray[0].lowStock;

        // const defaultTotal = this.calculateTotal(
        //     days[newSelected.value].pax[selectedHour.value]
        // );

        this.setState(
            () => ({
                selectedDay: newSelected,
                hoursOptions: hoursOptionOfThisDay,
                selectedHour: hoursOptionOfThisDay.length > 1 ? {} : selectedHour,
                lowStock: lowStock
                // selectedPax: days[newSelected.value].pax[selectedHour.value]
                // mustRegisterInterest: selectedHour.mustRegister,
                // total: defaultTotal
            }),
            () => this.resetCheckbox()
        );
        // forceUpdate to rerender after setstate, resetCheckbox after forceUpdate
    };

    calculateTotal(selectedPax) {
        const { checkedBoxes } = this.state;
        return selectedPax.reduce((total, passenger) => {
            if (checkedBoxes.includes(passenger.paxNumber)) {
                total += +passenger.value;
            }
            return total;
        }, 0);
    }

    updateValue = (name, value, title, event) => {
        // update value in form
        const { days, selectedDay } = this.state;

        const newSelected = {
            value: value,
            title: title
        };

        const filteredArray = days[selectedDay.value].hours.filter(
            (hour) => hour.value === newSelected.value
        );
        const lowStock = filteredArray[0].lowStock;
        // const mustRegister = filteredArray[0].outOfStock;
        const defaultTotal = this.calculateTotal(
            days[selectedDay.value].pax[newSelected.value]
        );

        this.setState(
            () => ({
                selectedHour: newSelected,
                selectedPax: days[selectedDay.value].pax[newSelected.value],
                lowStock: lowStock,
                // mustRegisterInterest: mustRegister,
                total: defaultTotal
            }) /*,
            () => this.resetCheckbox()*/
        );
    };

    resetCheckbox = () => {
        const checkboxes =  (typeof document !== 'undefined' && Array.from(
            document.querySelectorAll(
                'input[name=checkboxPrice]:not([data-restricted])'
            )
        )) || [] ;
        const { lowStock } = this.state;

        checkboxes.map((checkbox, index) => {
            checkbox.checked = false;
            checkbox.disabled = false;
            if (typeof document !== 'undefined' && document.querySelectorAll(`[for=${checkbox.id}]`)[0]) {
                typeof document !== 'undefined' && document
                    .querySelectorAll(`[for=${checkbox.id}]`)[0]
                    .classList.remove('disabled');
            }
        });

        // checkboxes[0].checked = true;
        let validCheckboxes = checkboxes.filter((checkbox, index) => {
            return (
                checkbox.value.substring(checkbox.value.indexOf('-') + 1) > 0
            );
        });
        const checkboxVal = validCheckboxes[0].value;
        const price = checkboxVal.substring(checkboxVal.indexOf('-') + 1);
        const code = parseInt(checkboxVal.substring(0, checkboxVal.indexOf('-')));
        // const helpers = checkedBoxes;
        // helpers = helpers.push(code);

        this.setState(
            () => ({
                total: Math.ceil(price),
                checkedBoxes: [code]
            }),
            () => {
                validCheckboxes.map((checkbox, index) => {
                    const checkedBoxesElements =  (typeof document !== 'undefined' &&  Array.from(
                       document.querySelectorAll(
                            'input[name=checkboxPrice]:checked'
                        )
                    )) || [] ;

                    if (
                        lowStock &&
                        index >= lowStock &&
                        index !== code &&
                        lowStock === 1
                    ) {
                        checkbox.checked = false;
                        checkbox.disabled = true;
                        typeof document !== 'undefined' && document
                            .querySelectorAll(`[for=${checkbox.id}]`)[0]
                            .classList.add('disabled');
                    }
                });
            }
        );
    };

    updateTotal = (event) => {
        const { checked, value } = event.target;
        const { checkedBoxes, lowStock } = this.state;
        const splitValue = value.split('-');
        const price = splitValue[1];
        const paxNumber = splitValue[0];

        this.setState((prevState) => ({
            total:
                prevState.total + parseFloat(checked ? price : -price)
        }));

        // eliminate or add to state based on if checked
        const newCheckedBoxes = !checked
            ? checkedBoxes.filter((checkedBox) => +checkedBox !== +paxNumber)
            : [...checkedBoxes, +paxNumber];

        this.setState(() => ({
            checkedBoxes: newCheckedBoxes
        }));

        // check how may passengers are selected
        const checkedBoxesElements = (typeof document !== 'undefined' &&  Array.from(
            document.querySelectorAll('input[name=checkboxPrice]:checked')
        )) || [];
        const uncheckedBoxesElements = (typeof document !== 'undefined' && Array.from(
            document.querySelectorAll(
                'input[name=checkboxPrice]:not(:checked):not([data-restricted])'
            )
        )) || [];
        const paxSelected = checkedBoxesElements.length;

        this.setState(() => ({
            disabled: paxSelected === 0 ? 'cta-disabled' : ''
        }));

        // check how many passengers are selected
        // let checkedBoxes = document.querySelectorAll('input[name=checkboxPrice]:checked');
        // let paxSelected = checkedBoxes.length;
        // let checkboxesUnchecked = document.querySelectorAll('input[name=checkboxPrice]:not(:checked)');

        // if (lowStock) {
        //     this.setState(() => ({
        //         mustRegisterInterest: paxSelected > lowStock ? true : false
        //     }));
        if (lowStock && paxSelected >= lowStock) {
            // disabled all the others
            for (let i = 0; i < uncheckedBoxesElements.length; i++) {
                let label = typeof document !== 'undefined' && document.querySelectorAll(
                    `[for = ${uncheckedBoxesElements[i].id}]`
                )[0];

                typeof label !== 'undefined' && label.classList.add('disabled');
                uncheckedBoxesElements[i].disabled = true;
            }
        } else if (uncheckedBoxesElements.length > 0) {
            uncheckedBoxesElements.map((uncheckedBox, index) => {
                uncheckedBox.disabled = false;
                typeof document !== 'undefined' && document
                    .querySelectorAll(`[for=${uncheckedBox.id}]`)[0]
                    .classList.remove('disabled');
            });
        }
    };

    /**
     * pax are retreived from the list of passangers in SessionStorage
     * @returns {React-markup} list of passengers
     */
    renderPax() {
        const { labels } = this.props;
        const { selectedPax, checkedBoxes } = this.state;

        // get passengers from session storage
        const orderedList = SessionStorage.getItem('orderedList');
        const { passengers } = orderedList;

        const paxesLength = selectedPax.length > 0;

        return (
            paxesLength &&
            passengers.map((pax, index) => {
                let paxNumber = parseInt(pax.paxNumber);
                let currentIndex;
                let isRestricted = true;
                selectedPax.map((selected, i) => {
                    if (parseInt(selected.paxNumber) === paxNumber) {
                        currentIndex = i;
                        if (typeof selectedPax[currentIndex].value !== 'undefined') {
                            isRestricted = false;

                        }

                    }
                });


                const currencySymbol = !isRestricted
                    ? getPriceSymbolForCurrencyCode(
                        selectedPax[index].currencyIso
                    )
                    : '';

                const passengerName = `${pax.title} ${pax.firstName} ${
                    pax.lastName
                    }`;
                const paxChecked =
                    checkedBoxes.filter(
                        (checkedBox) => +checkedBox === +pax.paxNumber
                    ).length > 0;

                let isNotAvailable = false;
                if (this.state.lowStock === 1) {
                    isNotAvailable = index < this.state.lowStock ? false : true;
                }

                if (isRestricted) {
                    return (
                        <li
                            className="wrap wrap-restricted"
                            key={pax.paxNumber}
                        >
                            <input
                                disabled
                                type="checkbox"
                                className="input-check"
                                aria-labelledby="variation2-check"
                                name="checkboxPrice"
                                id={`checkbox${pax.paxNumber}`}
                                data-restricted
                            />
                            <label className="checkbox-label disabled">
                                <h5>
                                    <span className="passenger">
                                        {passengerName}
                                    </span>
                                </h5>
                                <span className="passenger-restricted">
                                    {labels.ageRestrictedLabel}
                                </span>
                            </label>
                        </li>
                    );
                } else if (isNotAvailable) {
                    return (
                        <li className="wrap" key={pax.paxNumber}>
                            <input
                                disabled
                                onChange={this.updateTotal}
                                value={`${pax.paxNumber}-${
                                    selectedPax[index].value
                                    }`}
                                type="checkbox"
                                className="input-check"
                                aria-labelledby="variation2-check"
                                name="checkboxPrice"
                                id={`checkbox${pax.paxNumber}`}
                                ref={(checkbox) => (this.checkbox = checkbox)}
                                checked={paxChecked}
                            />
                            <label
                                htmlFor={`checkbox${pax.paxNumber}`}
                                className={`checkbox-label disabled`}
                            >
                                <h5>
                                    <span className="passenger">
                                        {passengerName}
                                    </span>
                                    <span className="price">
                                        {currencySymbol}
                                        {selectedPax[index].value}
                                    </span>
                                </h5>
                            </label>
                            <span
                                className="error-label show-label"
                                ref="checkbox"
                            />
                        </li>
                    );
                } else {
                    return (
                        <li className="wrap" key={pax.paxNumber}>
                            <input
                                onChange={this.updateTotal}
                                value={`${pax.paxNumber}-${
                                    selectedPax[index].value
                                    }`}
                                type="checkbox"
                                className="input-check"
                                aria-labelledby="variation2-check"
                                name="checkboxPrice"
                                id={`checkbox${pax.paxNumber}`}
                                ref={(checkbox) => (this.checkbox = checkbox)}
                                checked={paxChecked}
                            />
                            <label
                                htmlFor={`checkbox${pax.paxNumber}`}
                                className={`checkbox-label `}
                            >
                                <h5>
                                    <span className="passenger">
                                        {passengerName}
                                    </span>
                                    <span className="price">
                                        {currencySymbol}
                                        {selectedPax[index].value}
                                    </span>
                                </h5>
                            </label>
                            <span
                                className="error-label show-label"
                                ref="checkbox"
                            />
                        </li>
                    );
                }
            })
        );
    }

    /**
     * adding the item to cart - calling update cart API
     */
    handleSubmit() {
        analytics.clickTracking(this);
        analytics.setAdditionalPageTrackAttributes({
            event: 'event308',
            skuID: ''
        })
        const { description, services, name, id, labels, port, language } = this.props;
        const { selectedHour, checkedBoxes, total, selectedDay, productPrices } = this.state;
        const url = services.urls.updateCartApi;
        const obj = {
            groupID: '',
            productCode: selectedHour.value,
            recipients: [],
            qty: checkedBoxes.length,
            productType: 'shorex'
        };

        const currencyLocale =
            typeof window !== 'undefined'
                ? window.configs.currencyLocale
                : '';

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
        // for checkbox.checked recipient.push
        checkedBoxes.map((checkedBox, index) => {
            obj.recipients.push({
                bookingRef: bookingRef,
                paxNo: checkedBox
            });
        });
        const configs = typeof window !== 'undefined' ? window.configs : {};
        const apiKey = configs.apikeyMycruise;
        if (selectedDay.value && selectedDay.value !== '' && selectedHour.value && selectedHour.value !== '') {
            fetchData(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CommonData': JSON.stringify(header),
                    'X-Source-Identity-Token-0': apiKey
                },
                body: JSON.stringify(obj)
            })
                .then((res) => {
                    // if (
                    //     !res.errors ||
                    //     !(parseInt(res.status) >= 400)
                    // ) {
                    // const selectedProductCode = obj.productCode;
                    let startDateTime = '';
                    // res.entries && res.entries.map((singleProduct) => {
                    //     if (singleProduct.product && singleProduct.product.code && singleProduct.product.code == selectedProductCode) {
                    //         startDateTime = singleProduct.attributes && singleProduct.attributes.startDateTime;
                    //     }
                    // })

                    let unitPriceAdult = '';
                    let unitPriceChild = '';
                    productPrices.length && productPrices.map((singlePax) => {
                        if (singlePax.userPriceGroup == "ADULT") {
                            unitPriceAdult = singlePax.value && convertValueToVaildDecimalPoint(singlePax.value);
                        }
                        if (singlePax.userPriceGroup == "CHILD") {
                            unitPriceChild = singlePax.value && convertValueToVaildDecimalPoint(singlePax.value);
                        }
                    })
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
                        product_add2cart_aib: [{
                            productName: "",
                            productType: "",
                            skuID: "",
                            skuName: "",
                            unitPrice_GBP: "",
                            unitPrice_local: "",
                            quantity: ""
                        }],
                        product_add2cart_other: {
                            productID: id,
                            productName: name,
                            skuID: id,
                            skuName: name,
                            productType: 'shorex',
                            startDateTime: startDateTime,
                            shorexAttributes: {
                                portName: port.longName,
                                activityLevel: "",
                                language: '',
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
                            quantity: obj.qty ? parseInt(obj.qty) : '',
                            unitPrice_GBP: unitPriceAdult,
                            unitPrice_local: unitPriceAdult,
                            unitSalePrice_GBP: unitPriceAdult,
                            unitSalePrice_local: unitPriceAdult,
                            unitPriceChild_GBP: unitPriceChild,
                            unitPriceChild_local: unitPriceChild
                        },

                        subtotal_GBP: total ? convertValueToVaildDecimalPoint(total) : '',
                        subtotal_local: total ? convertValueToVaildDecimalPoint(total) : '',
                    });
                    // }
                    // analytics.clickTracking(this);
                    if (
                        (res.errors && res.errors.length > 0) ||
                        parseInt(res.status) >= 400
                    ) {
                        this.showError(res);
                    } else {
                        // document.getElementsByClassName('cart-label').innerHTML = res.totalUnitCount;
                        this.showConfirmation(res);
                    }
                })
                .catch((error) => {
                    // TODO: error menagement
                });
        } else {
            this.showError();
        }
    }

    handleRegisterInterest() {
        const { services } = this.props;
        const url = services.urls.registerInterestApi;

        let header;

        // const header = SessionStorage.getItem('header');
        //     fetchData(url, {
        //         method: 'GET',
        //         //body: JSON.stringify(obj),
        //         headers: {
        //             'X-CommonData': header
        //         }
        //     })
        //         .then((res) => {
        //             if (res.errors && res.errors.length > 0) {
        //                 this.showRegisterError(res);
        //             } else {
        //                 this.showRegisterConfirmation(res);
        //             }
        //         })
        //         .catch((error) => {
        //             // TODO: error menagement
        //         });
        this.setState(() => ({
            interestRegistered: true
        }));
    }
    showRegisterConfirmation() { }
    showRegisterError() { }
    showConfirmation(res) {
        const { onExit, name } = this.props;
        const { selectedPax, total } = this.state;
        const numberOfItems = res.totalItemsCount;
        // close overlay
        onExit && onExit();

        const currency = selectedPax[0]
            ? getPriceSymbolForCurrencyCode(selectedPax[0].currencyIso)
            : '';

        // show popup mini-cart
        PubSub.publish(topics.ADD_TO_CART, {
            name,
            total,
            currency,
            numberOfItems
        });
        // PubSub.publish(topics.ADD_TO_CART_TOTAL, total);
    }

    showError(res) {
        const { labels, services, id } = this.props;
        if (res && res.errors && res.errors[0].type === 'InsufficientStockError') {
            if (res.errors[0].availableStock > 0) {
                this.setState(() => ({
                    errorMsg: labels.errorLimitedAvailability
                }));
                this.getInstances();
            } else {
                // verify if only instance out of stock or all instances
                const serviceUrl = services.urls.instancesApi;
                const url = serviceUrl.replace('{{productCode}}', id);

                const header = SessionStorage.getItem('header');
                const configs =
                    typeof window !== 'undefined' ? window.configs : {};
                const apiKey = configs.apikeyMycruise;

                fetchData(url, {
                    method: 'GET',
                    headers: {
                        'X-CommonData': JSON.stringify(header),
                        'X-Source-Identity-Token-0': apiKey
                    }
                }).then((res) => {
                    const { instances } = res;
                    const instanceWithStock = instances.filter(
                        (instance) =>
                            instance.stock.stockLevelStatus !== 'outOfStock'
                    );
                    const onlyInstanceOutOfStock = instanceWithStock.length > 0;
                    const errorToShow = onlyInstanceOutOfStock
                        ? labels.errorOutOfStockInstance
                        : labels.errorOutOfStockProduct;

                    // this.createForm(instances);
                    this.createForm(instances);

                    // if no more instances set everything as unclickable
                    if (!onlyInstanceOutOfStock) {
                        this.setState({
                            allOutOfStock: 'disableForm'
                        });
                    }
                    this.setState(() => ({
                        errorMsg: errorToShow
                    }));
                });
            }
        } else if (
            res && res.errors &&
            res.errors[0].type === 'NotAvailableProductError'
        ) {
            // not outofstock but not purchasable
            this.setState(() => ({
                errorMsg: labels.errorNoPurchasable
            }));
            this.getInstances();
        } else {
            // generic error
            this.setState(() => ({
                errorMsg: labels.genericError
            }));
            this.resetCheckbox();
        }
        // scroll up to show the error
        typeof document !== 'undefined' && this.scrollToTop(
            document.getElementsByClassName('modal-content-wrapper')[0]
        );
        this.setState(() => ({
            showError: true
        }));
    }

    // getLongNamePort() {
    //     const {port,services}=this.props;
    //     const url = `${ services.urls.extendedPortsApi }${ port.substring(0, 2) }/${ port }.itinerary.json`;
    //     fetchData( url, {
    //         method: 'GET'
    //     }).then(responseServlet => {
    //         this.setState({
    //             portName: responseServlet.longName
    //         });
    //     });
    // }

    handleError = (key, errorState, errorMsg) => {
        if (errorState) {
            this.setState({

            })
        }
    }

    renderDays() {
        const {
            selectValidate,
            selectedDay,
            daysOptions,
            readOnly
        } = this.state;
        const {
            labels
        } = this.props;
        return (
            <SelectField
                name="days"
                label={daysOptions.length > 1 ? labels.pleaseSelectDate : ""}
                validate={selectValidate}
                value={selectedDay.value}
                title={selectedDay.title}
                options={daysOptions}
                showLabel={false}
                errorMsg="error"
                disableDefaultOption={daysOptions.length <= 1}
                readOnly={daysOptions.length <= 0}
                changeCallback={(name, value, title, event) =>
                    this.updateForm(name, value, title, event)
                }
            // errorCallback={(errorState, errorMsg) => this.handleError('selectBox', errorState, errorMsg)}
            />
        );
    }
    renderHours() {
        const { selectValidate, selectedHour, hoursOptions } = this.state;
        const {
            labels
        } = this.props;
        return (
            <SelectField
                ref={(hours) => (this.hours = hours)}
                name="hours"
                label={hoursOptions.length > 1 ? labels.pleaseSelectTime : ''}
                validate={selectValidate}
                value={selectedHour.value}
                title={selectedHour.title}
                options={hoursOptions}
                showLabel={false}
                errorMsg="error"
                disableDefaultOption={hoursOptions.length <= 1}
                readOnly={hoursOptions.length <= 0}
                changeCallback={(name, value, title, event) =>
                    this.updateValue(name, value, title, event)
                }
            // errorCallback={(errorState, errorMsg) => this.handleError('selectBox', errorState, errorMsg)}
            />
        );
    }

    renderForm() {
        const { description, name, labels, port } = this.props;
        const {
            lowStock,
            selectedPax,
            showError,
            errorMsg,
            daysOptions,
            total,
            disabled
            // mustRegisterInterest
        } = this.state;
        const limitedAvailabilityPluralLabel = labels.limitedAvailabilityPluralLabel
            .toString()
            .replace('{places}', lowStock);
        const limitedAvailabilitySingularLabel = labels.limitedAvailabilitySingularLabel
            .toString()
            .replace('{places}', lowStock);
        let availablePaxs = selectedPax.filter((pax, index) => {
            return pax.value !== undefined;
        });
        const currency = selectedPax[0]
            ? getPriceSymbolForCurrencyCode(availablePaxs[0].currencyIso)
            : '';
        return (
            <div className="modal-content">
                {showError && (
                    <div className="modal-error">
                        <p>{errorMsg}</p>
                    </div>
                )}
                <div className="modal-header">
                    <h1 className="title"> {name} </h1>
                    <h5 className="subtitle"> {port.longName} </h5>
                    <p className="paragraph"> {description} </p>
                </div>
                {daysOptions.length > 0 && (
                    <form className="modal-body" onSubmit={this.handleSubmit}>
                        {this.renderDays()}
                        {this.renderHours()}
                        {lowStock && (
                            <span className="limAvailability">
                                {lowStock > 1
                                    ? limitedAvailabilityPluralLabel
                                    : limitedAvailabilitySingularLabel}
                            </span>
                        )}
                        {/* {mustRegisterInterest &&
                            !lowStock && (
                                <span className="limAvailability registerInterest">
                                    {labels.registerInterestMessage}
                                </span>
                            )} */}
                        <div className="guestsList">
                            <h4>{labels.selectGuestsLabel}</h4>
                            <ul>{this.renderPax()}</ul>
                            <div className="total">
                                <h3 className="total__label">
                                    {labels.totalLabel}
                                </h3>
                                <h3 className="total__price">
                                    {currency} {total}
                                </h3>
                            </div>
                        </div>
                        <div>
                            {/* {mustRegisterInterest && (
                                <p className="registerInterest-disclaimer">
                                    {labels.registerInterestDisclaimer}
                                </p>
                            )} */}
                            {/* {mustRegisterInterest ? (
                                <Link
                                    url=""
                                    ariaLabel={labels.registerInterestLabel}
                                    label={labels.registerInterestLabel}
                                    url="#"
                                    onClick={(e) =>
                                        this.handleRegisterInterest()
                                    }
                                    linkClassName={`${disabled} cta-primary-light-blue`}
                                    dataLinktext={labels.registerInterestLabel}
                                >
                                    {labels.registerInterestLabel}
                                </Link>
                            ) : ( */}
                            <Link
                                url=""
                                ariaLabel={labels.addToCartLabel}
                                label={labels.addToCartLabel}
                                url="#"
                                onClick={(e) => this.handleSubmit()}
                                linkClassName={`${disabled} cta-primary`}
                                dataLinktext={labels.addToCartLabel}
                            >
                                {labels.addToCartLabel}
                            </Link>
                            {/* )} */}
                        </div>
                    </form>
                )}
            </div>
        );
    }

    renderRegisterInterestConfirm() {
        const { continueShopping, labels } = this.props;
        return (
            <div className="modal-content full">
                <div className="conf-wrap">
                    <div className="registerInterest-confirmation">
                        <div>
                            <span className="icons-check" />
                        </div>
                        <h1 className="registerInterest-title">
                            {labels.registerInterestConfirmTitle}
                        </h1>
                        <span className="registerInterest-msg">
                            {labels.registerInterestConfirmText}
                        </span>
                    </div>
                </div>
                <div className="registerInterest-divider" />
                <ContinueShopping {...continueShopping} />
            </div>
        );
    }

    render() {
        const {
            onExit,
            baseDialogClass,
            dialogClass,
            baseUnderlayClass,
            underlayClass,
            labels
        } = this.props;
        const {
            hideLabel,
            allOutOfStock,
            verticallyCenter,
            interestRegistered
        } = this.state;
        const ctaType = this.props.ctaType || '';

        return (
            <ReactAriaModal
                {...this.props}
                dialogClass={`${baseDialogClass} ${dialogClass}`}
                underlayClass={`${baseUnderlayClass} ${underlayClass}`}
                onEnter={this.onEnter}
                titleText="configuration"
                verticallyCenter={verticallyCenter}
                getApplicationNode={this.getApplicationNode}
                includeDefaultStyles={false}
            >
                <div className="modal-close-wrap">
                    <button
                        className="close"
                        data-linktext={`${labels.closeLabel}`}
                        aria-label={`${ctaType} ${labels.closeLabel}`}
                        onClick={onExit}
                        ref={(close) => (this.close = close)}
                    >
                        <span
                            className={`close-label ${
                                hideLabel ? 'fade-out' : ''
                                }`}
                        >
                            {labels.closeLabel}
                        </span>
                    </button>
                </div>
                <div className={`modal-content-wrapper ${allOutOfStock}`}>
                    {interestRegistered
                        ? this.renderRegisterInterestConfirm()
                        : this.renderForm()}
                </div>
            </ReactAriaModal>
        );
    }
}

shorexOverlay.defaultProps = {
    baseUnderlayClass: 'aria-modal-underlay',
    baseDialogClass: 'aria-modal',
    underlayClass: '',
    dialogClass: '',
    verticallyCenter: true
};

export default shorexOverlay;
