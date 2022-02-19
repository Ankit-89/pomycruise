import React from 'react';
import Link from '../commons/CUK/link';
import fetchData from '../commons/CUK/fetch-data';
import { getConfig, convertValueToVaildDecimalPoint } from '../commons/CUK/utilities';
import analytics from '../commons/CUK/analytics';
import SessionStorage from '../commons/CUK/session-storage';

class spaAddToCart extends React.Component {
    constructor(props) {
        super(props);
    }
    handleSubmit = () => {
        analytics.clickTracking(this);
        const {
            updateCartApiService,
            headerData,
            errorHandler,
            successHandler,
            selectedPassenger,
            selectedInstance,
            currency
        } = this.props;
        const {
            treatmentID,
            treatementPrice,
            treatmentDesc,
            resHoldID,
            serviceDate,
            serviceTime,
            serviceGroup
        } = selectedInstance;
        const apikeyMycruise = getConfig('apikeyMycruise', '');
        const currencyLocale =
            typeof window !== 'undefined'
                ? window.configs.currencyLocale
                : '';
        const requestData = {
            productCode: treatmentID,
            productType: 'SPA',
            productPrice: treatementPrice,
            resHoldId: resHoldID,
            serviceDate,
            serviceTime,
            qty: selectedPassenger.length,
            recipients: selectedPassenger.reduce((recipients, passenger) => {
                recipients.push({
                    paxNo: +passenger,
                    bookingRef: headerData.bookingRef
                });
                return recipients;
            }, [])
        };
        /* PROD */
        const fetchDataConfig = {
            method: 'POST',
            body: JSON.stringify(requestData),
            headers: {
                'Content-Type': 'application/json',
                'X-CommonData': JSON.stringify(headerData),
                'X-Source-Identity-Token-0': apikeyMycruise
            }
        };
        /* DEV */
        // const fetchDataConfig = {
        //     method: 'GET',
        //     headers: {
        //         'X-CommonData': JSON.stringify(headerData.header)
        //     }
        // };
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
        fetchData(updateCartApiService, fetchDataConfig)
            .then((res) => {
                if (res.errors && res.errors.length > 0) {
                    errorHandler && errorHandler(res.errors);
                } else {
                    const ProductId = treatmentID;
                    let selectedProductId = '';
                    let selectedProductName = '';
                    let selectedSkuName = '';
                    res.entries.length && res.entries.forEach((value) => {
                        if (value.product && value.product.code && value.product.code == ProductId) {
                            selectedProductId = value.product && value.product.baseProduct;
                            selectedProductName = value.product.attributes.name;
                            selectedSkuName = value.product && value.product.name;
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
                        event: "scAdd",
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
                            productID: selectedProductId,
                            productName: selectedProductName,
                            skuID: treatmentID,
                            skuName: selectedSkuName,
                            productType: "spa",
                            startDateTime: '',
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
                            spaTreatmentType: serviceGroup,
                            spaDuration: treatmentDesc && treatmentDesc.split('-')[1],
                            unitPrice_GBP: parseInt(treatementPrice),
                            unitSalePrice_GBP: parseInt(treatementPrice),
                            unitSalePrice_local: parseInt(treatementPrice),
                            unitPrice_local: parseInt(treatementPrice),
                            quantity: selectedPassenger.length ? parseInt(selectedPassenger.length) : '',
                        },

                        subtotal_GBP: convertValueToVaildDecimalPoint((treatementPrice * selectedPassenger.length)),
                        subtotal_local: convertValueToVaildDecimalPoint((treatementPrice * selectedPassenger.length))
                    });

                    successHandler &&
                        successHandler(currency, res.totalPrice.value, res.totalItemsCount);
                }
            })
            .catch((error) => {
                // TODO: error menagement
            });
    };

    render() {
        const { label, selectedInstance, maxSelected } = this.props;
        return (
            <Link
                label={label}
                url="#"
                onClick={this.handleSubmit}
                linkClassName={`${
                    selectedInstance && maxSelected ? '' : 'cta-disabled'
                    } cta-primary`}
                dataLinktext={label}
            />
        );
    }
}

export default spaAddToCart;
