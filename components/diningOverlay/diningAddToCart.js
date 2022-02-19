import React from 'react';
import Link from '../commons/CUK/link';
import fetchData from '../commons/CUK/fetch-data';
import analytics from '../commons/CUK/analytics';
import SessionStorage from '../commons/CUK/session-storage';
import { convertValueToVaildDecimalPoint } from '../commons/CUK/utilities'

class diningAddToCart extends React.Component {
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
            selectedGuests,
            selectedInstance,
            currency,
            name,
            dates,
            formData
        } = this.props;
        const total = selectedGuests.value * selectedInstance.price.value;
        const requestData = {
            //groupID: '',
            productCode: selectedInstance.code,
            productType: 'DINING',
            noOfGuests: selectedGuests.value,
            qty: 1,
            recipients: [
                {
                    paxNo: headerData.header.customer.PaxNumber,
                    bookingRef: headerData.header.bookingRef
                }
            ]
            //guests: selectedGuests.value
        };
        // const fetchDataConfig = {
        //     method: 'GET',
        //     body: JSON.stringify(requestData),
        //     headers: {
        //         'X-CommonData': JSON.stringify(headerData.header)
        //     }
        // };
        const apiKey = configs.apikeyMycruise;

        const fetchDataConfig = {
            method: 'POST', // CK
            body: JSON.stringify(requestData),
            headers: {
                'X-CommonData': JSON.stringify(headerData.header),
                'X-Source-Identity-Token-0': apiKey,
                "Content-Type": "application/json"
            }
        };

        const currencyLocale =
            typeof window !== 'undefined'
                ? window.configs.currencyLocale
                : '';

        let diningMealPeriod = '';
        formData && formData.products.forEach((values) => {
            if (values && values.mealPeriod) {
                diningMealPeriod = values.mealPeriod.name + ',' + diningMealPeriod;
            }
        });

        const header = SessionStorage.getItem('header');
        const cruiseData = SessionStorage.getItem('cruiseData');
        const diningEventType = SessionStorage.getItem('diningEventType');
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
                    let diningCategory = 'SelectDining';
                    if (diningEventType == 'ENTERTAINMENT') {
                        diningCategory = 'EventDining'
                    } else if (diningEventType == 'COOKERY') {
                        diningCategory = 'CookeryClub'
                    }

                    let skuID = '';
                    let productID = '';
                    let selectedInstanceCode = selectedInstance.code;
                    if (selectedInstanceCode) {
                        selectedInstanceCode = selectedInstanceCode.split('_');
                        if (selectedInstanceCode.length >= 4) {
                            skuID = selectedInstanceCode[3];
                            productID = `${selectedInstanceCode[1]}_${selectedInstanceCode[2]}`;
                        }
                    }

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
                            productID: productID,
                            productName: name,
                            skuID: diningCategory !== 'SelectDining' ? '' : skuID,
                            skuName: diningCategory !== 'SelectDining' ? name : '',
                            productType: "dining",
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
                            diningMealPeriod: diningMealPeriod,
                            diningCategory: diningCategory,
                            spaTreatmentType: "",
                            spaDuration: "",
                            unitPrice_GBP: convertValueToVaildDecimalPoint(selectedInstance.price.value),
                            unitSalePrice_GBP: convertValueToVaildDecimalPoint(selectedInstance.price.value),
                            unitSalePrice_local: convertValueToVaildDecimalPoint(selectedInstance.price.value),
                            unitPrice_local: convertValueToVaildDecimalPoint(selectedInstance.price.value),
                            quantity: requestData.noOfGuests ? parseInt(requestData.noOfGuests) : '',
                        },
                        subtotal_GBP: total ? convertValueToVaildDecimalPoint(total) : '',
                        subtotal_local: total ? convertValueToVaildDecimalPoint(total) : '',
                    });
                    successHandler && successHandler(currency, total, res.totalItemsCount);
                }
            })
            .catch((error) => {
                // TODO: error menagement
            });
    };

    //render
    render() {
        const { label, selectedInstance } = this.props;

        return (
            <Link
                label={label}
                url="#"
                onClick={this.handleSubmit}
                linkClassName={`${
                    !selectedInstance ? 'cta-disabled' : ''
                    } cta-primary`}
                dataLinktext={label}
            />
        );
    }
}

export default diningAddToCart;
