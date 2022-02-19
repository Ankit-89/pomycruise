import React from 'react';
import FetchData from '../commons/CUK/fetch-data';
import analytics from '../commons/CUK/analytics';
import SessionStorage from '../commons/CUK/session-storage';
import PubSub from '../commons/CUK/pubsub';
import TitleH1Mycruise from '../titleH1Mycruise';
import topics from '../../library/js/config/topics';
import { getPriceSymbolForCurrencyCode } from '../commons/CUK/currencyFormat';
import { convertValueToVaildDecimalPoint, getConfig } from '../commons/CUK/utilities'
import { checkCookie, getCookie } from '../commons/CUK/cookies';

/*
    C065 - Payment summary
*/

class paymentSummaryMycruise extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            subTotal: 0,
            loyaltyTier: '',
            totalDiscounts: {},
            totalPrice: {},
            order: '',
            email: '',
            orderId: false,
            zeroPayment: false
        };
    }
    componentWillMount() {
        let orderId = null;
        const url = window.location.href;
        if (url.indexOf('?') != -1) {
            orderId = this.getParameterByName('orderId', url);
            if (orderId) {
                this.setState({
                    orderId: orderId,
                    zeroPayment: true
                });
            }
        }
    }
    componentDidMount() {
        if (!this.state.orderId && !this.state.zeroPayment) {
            const isHybrisPaymentSolutionEnabled = getConfig('isHybrisPaymentSolutionEnabled') || 'false';
            const valueOfHybrisPaymentSolutionCookie = getCookie('HybrisPaymentSolution');
            const isHybrisPaymentSolutionActive = ((valueOfHybrisPaymentSolutionCookie == 'true' ? true : false) || (!checkCookie("HybrisPaymentSolution") && (isHybrisPaymentSolutionEnabled == 'true' || isHybrisPaymentSolutionEnabled == 'True')))
            const code = typeof window !== 'undefined' ? window.location.hash.substring(1) : '';
            if (code === "") {
                if (isHybrisPaymentSolutionActive) {
                    this.getOrderDetail();
                } else {
                    this.triggersummary = PubSub.subscribe(
                        topics.ORDER_ID,
                        this.listenorderid
                    );
                }
            } else {
                this.getDetails(code);
            }
        }
    }
    getOrderDetail = () => {
        const config = typeof window !== 'undefined' ? window.configs : '';
        const orderDetail = SessionStorage.getItem('reserveStockData');
        const {
            subTotal,
            loyaltyTier,
            totalChildDiscount,
            totalLoyaltyDiscount,
            totalDiscounts,
            totalPrice
        } = orderDetail;

        let newSubTotalAmount = subTotal.value;
        if (totalLoyaltyDiscount && totalLoyaltyDiscount.value > 0) {
            newSubTotalAmount = subTotal.value + totalLoyaltyDiscount.value;
        }
        if (totalChildDiscount && totalChildDiscount.value > 0) {
            newSubTotalAmount = newSubTotalAmount + totalChildDiscount.value;
        }

        this.setState(
            {
                subTotal: newSubTotalAmount,
                loyaltyTier,
                totalChildDiscount,
                totalLoyaltyDiscount,
                totalDiscounts,
                totalPrice
            },
            () => {
                PubSub.publish(
                    topics.BILLING_ADD_MAIL,
                    '' // this should have been passed from somewhere
                );
            }
        );

        const orderResponse = SessionStorage.getItem('orderResponse');
        const analyticsDataObjForHybrisSol = SessionStorage.getItem(
            'analyticsDataObjForHybrisSol'
        );
        analyticsDataObjForHybrisSol[`transactionID`] =
            orderResponse.orderNumber;
        analyticsDataObjForHybrisSol[`pageType`] = config.pageName;
        analyticsDataObjForHybrisSol[`pageName`] = config.pageName;

        analytics.setAdditionalPageTrackAttributes(
            analyticsDataObjForHybrisSol
        );
    };
    getParameterByName = (name, url = window.location.href) => {
        name = name.replace(/[\[\]]/g, '\\$&');
        var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, ' '));
    };
    listenorderid = (msg, data) => {
        this.getDetails(data);
    };

    getDetails = (code) => {

        const { services } = this.props;
        const { orderDetailsApi } = services.urls;

        // let url = urls.orderDetailsApi;
        const header = SessionStorage.getItem('header');
        const cruiseData = SessionStorage.getItem('cruiseData');

        const currencyLocale =
            typeof window !== 'undefined'
                ? window.configs.currencyLocale
                : '';
        const config =
            typeof window !== 'undefined'
                ? window.configs
                : '';
        const customCurrencyCode = config.brand.toLowerCase() === "po" ? "gbp" : "usd";
        const apiKey =
            typeof window.configs !== 'undefined'
                ? window.configs.apikeyMycruise
                : '';
        const url = `${orderDetailsApi}${code}`;
        // get data from api detail
        FetchData(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-CommonData': JSON.stringify(header),
                'X-Source-Identity-Token-0': apiKey
            }
        })
            .then((res) => {
                const {
                    entries,
                    customerInfo,
                    totalDiscounts,
                    totalPrice,
                    paymentInfo,
                    totalLoyaltyDiscount,
                    totalChildDiscount
                } = res;
                const subTotal = entries.reduce(
                    (subTotal, entry) => subTotal + ((entry.product.productType === 'DINING') ? (entry.basePrice.value * entry.noOfGuests) :
                        (entry.product.productType === 'AIBEVERAGE') ? (entry.basePrice.value * entry.quantity) :
                            entry.basePrice.value),
                    0
                );
                this.setState({
                    subTotal: subTotal,
                    loyaltyTier: customerInfo.customer.loyaltyTier,
                    totalChildDiscount: totalChildDiscount,
                    totalLoyaltyDiscount: totalLoyaltyDiscount,
                    totalDiscounts: totalDiscounts || {},
                    totalPrice: totalPrice
                });
                // update email for confirmationHero
                PubSub.publish(
                    topics.BILLING_ADD_MAIL,
                    paymentInfo.billingAddress.email
                );

                let dobArray = [];
                header.passengers.forEach((passenger) => {
                    dobArray.push(passenger.birthDate);
                })

                const lineItemsData = [];

                res.entries.forEach((resData) => {
                    let diningCategory = '';
                    if (resData.product.productType === 'DINING') {
                        if (resData.attributes && resData.attributes.name && resData.attributes.name.toLowerCase().includes('cookery')) {
                            diningCategory = 'CookeryClub'
                        } else if (resData.attributes && resData.attributes.name && resData.attributes.name.toLowerCase().includes('limelight')) {
                            diningCategory = 'EventDining'
                        } else if (resData.attributes && resData.attributes.name) {
                            diningCategory = 'SelectDining'
                        }
                    }

                    let skuID = resData.attributes.baseProduct;
                    let productID = '';
                    if (resData.product.productType === 'DINING') {
                        let currentProductSkusID = resData.attributes.baseProduct;
                        if (currentProductSkusID) {
                            currentProductSkusID = currentProductSkusID.split('_');
                            if (currentProductSkusID.length >= 4) {
                                skuID = currentProductSkusID[3];
                                productID = `${currentProductSkusID[1]}_${currentProductSkusID[2]}`;
                            }
                        }
                    }

                    const product = {
                        skuID:
                            resData.product.productType === 'SHOREX' ||
                                resData.product.productType === 'DINING'
                                ? diningCategory !== 'SelectDining'
                                    ? resData.product.productType === 'SHOREX'
                                        ? skuID
                                        : ''
                                    : skuID
                                : resData.product.externalCode,
                        productID: (resData.product.productType === 'SHOREX' || resData.product.productType === 'SPA') ? resData.attributes.baseProduct : (resData.product.productType === 'DINING') ? productID : resData.product.externalCode,
                        productName: (resData.product.productType === 'SPA') ? '' : resData.attributes.name,
                        skuName: diningCategory !== 'SelectDining' ? resData.attributes.name : '',
                        productType: (resData.product.productType === 'SHOREX' || resData.product.productType === 'DINING' || resData.product.productType === 'SPA') ? resData.product.productType : "aibeverage",
                        startDateTime: (resData.attributes.startDateTime) ? resData.attributes.startDateTime : (resData.product.productType === 'SPA') ? resData.attributes.startDateTime : '',
                        shorexAttributes: {
                            portName: (resData.product.productType === 'SHOREX') ? resData.attributes.port.shortName : '',
                            activityLevel: "",
                            language: (resData.product.productType === 'SHOREX') ? resData.attributes.language : '',
                            duration: "",
                            transport: "",
                            minAge: "",
                            maxAge: "",
                            tourType: [""],
                            tourCategory: "",
                            tourFeatures: ""
                        },
                        diningMealPeriod: resData.attributes.mealPeriod ? resData.attributes.mealPeriod : '',
                        diningCategory: diningCategory,
                        spaTreatmentType: (resData.product.productType === 'SPA') ? resData.attributes.treatmentType : '',
                        spaDuration: (resData.product.productType === 'SPA') ? resData.attributes.treatmentDuration : '',
                        quantity: (resData.product.productType === 'DINING') ? resData.noOfGuests : resData.quantity ? parseInt(resData.quantity) : '',
                        unitPrice_GBP: resData.basePrice.value ? convertValueToVaildDecimalPoint(resData.basePrice.value) : '',
                        unitSalePrice_GBP: resData.totalPrice.value ? convertValueToVaildDecimalPoint(resData.totalPrice.value) : '',
                        unitPrice_local: resData.basePrice.value ? convertValueToVaildDecimalPoint(resData.basePrice.value) : '',
                        unitSalePrice_local: resData.totalPrice.value ? convertValueToVaildDecimalPoint(resData.totalPrice.value) : ''
                    };

                    lineItemsData.push(product);
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
                    event: "purchase,event44",
                    paymentType: "Full",
                    paymentMethod: "Credit",
                    transactionID: res.code,
                    myCruiseOrder: {
                        orderSubtotal_GBP: convertValueToVaildDecimalPoint(subTotal),
                        orderTotal_GBP: convertValueToVaildDecimalPoint(subTotal),
                        orderSubtotal_local: convertValueToVaildDecimalPoint(subTotal),
                        orderTotal_local: convertValueToVaildDecimalPoint(subTotal),
                        loyaltyDiscount_GBP: res.totalLoyaltyDiscount.value,
                        loyaltyDiscount_local: res.totalLoyaltyDiscount.value,
                        lineItems: lineItemsData
                    }
                });
            })
            .catch((error) => { } /*console.error(error) */);

    };
    renderTitle() {
        const { labels } = this.props;
        const { summaryPaymentHeaderLabel } = labels;
        const titleH1Props = {
            title: summaryPaymentHeaderLabel,
            description: '',
            dividerType: '',
            showIcon: false
        };
        return titleH1Props.title ? (
            <TitleH1Mycruise {...titleH1Props} />
        ) : null;
    }
    renderSubTotalRow(currSymbol) {
        const { labels } = this.props;
        const { subTotal } = this.state;
        const { subtotalLabel } = labels;
        return (
            <tr className="summary-row">
                <td className="total-price-text">{subtotalLabel}</td>
                <td className="total-price">
                    {subTotal && (
                        <h3>
                            {currSymbol}
                            {subTotal.toFixed(2)}
                        </h3>
                    )}
                </td>
            </tr>
        );
    }
    renderLoyaltyDiscountRow(currSymbol) {
        const { labels } = this.props;
        const { loyaltyTier, totalLoyaltyDiscount } = this.state;
        const { loyaltyDiscountTotalLabel } = labels;
        const discountText =
            totalLoyaltyDiscount && totalLoyaltyDiscount.value > 0
                ? ` - ${currSymbol} ${totalLoyaltyDiscount.value.toFixed(2)}`
                : false;
        return discountText ? (
            <tr className="summary-row">
                <td className="total-price-text">
                    {loyaltyDiscountTotalLabel}
                    {loyaltyTier && (
                        <span className="total-price-loyality">
                            {loyaltyTier}
                        </span>
                    )}
                </td>
                <td className="total-price">
                    <h3>{discountText}</h3>
                </td>
            </tr>
        ) : null;
    }
    renderChildDiscountRow(currSymbol) {
        const { labels } = this.props;
        const { totalChildDiscount } = this.state;
        const { childDiscountTotalLabel } = labels;
        const discountText =
            totalChildDiscount && totalChildDiscount.value > 0
                ? ` - ${currSymbol} ${totalChildDiscount.value.toFixed(2)}`
                : false;
        return discountText ? (
            <tr className="summary-row">
                <td className="total-price-text">{childDiscountTotalLabel}</td>
                <td className="total-price">
                    <h3>{discountText}</h3>
                </td>
            </tr>
        ) : null;
    }
    renderTotalRow(currSymbol) {
        const { labels } = this.props;
        const { totalPrice } = this.state;
        const { totalLabel } = labels;
        return (
            <tr className="total">
                <td className="total-price-text">{totalLabel}</td>
                <td className="total-price">
                    {totalPrice.value && (
                        <h1>
                            {currSymbol}
                            {totalPrice.value.toFixed(2)}
                        </h1>
                    )}
                </td>
            </tr>
        );
    }

    render() {
        const { totalPrice, zeroPayment, orderId } = this.state;
        const currSymbol = getPriceSymbolForCurrencyCode(
            totalPrice.currencyIso
        );

        if (zeroPayment) {
            return <div />;
        } else {
            return (
                <div className="payment-summary">
                    <div className="payment-summary-container">
                        <div className="payment-summary-content">
                            {this.renderTitle()}
                            <div className="priceBreakdown">
                                <table tabIndex="0">
                                    <tbody>
                                        {this.renderSubTotalRow(currSymbol)}
                                        {this.renderLoyaltyDiscountRow(
                                            currSymbol
                                        )}
                                        {this.renderChildDiscountRow(
                                            currSymbol
                                        )}
                                        {this.renderTotalRow(currSymbol)}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    }
}

export default paymentSummaryMycruise;
