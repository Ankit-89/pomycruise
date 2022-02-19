'use strict';

import React from 'react';
import SpaComponent from './spaComponent';
import NewSpaCard from '../newSpaCard';
import SpaOverlay from '../spaOverlay';
import NotificationBanner from '../../components/notificationBanner';

import { calculateAge, calculateDiffDays } from '../commons/CUK/dateFormat';
import FetchData from '../commons/CUK/fetch-data';
import SessionStorage from '../commons/CUK/session-storage';
import extractChildComponent from '../commons/CUK/extractChildComponent';
import analytics from '../commons/CUK/analytics';
import { getConfig, generateUniqueCode } from '../commons/CUK/utilities';
import moment from 'moment';
import PubSub from '../commons/CUK/pubsub';
import topics from '../../library/js/config/topics';

class productsVerticalTiles extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            purchasable: false,
            isTooLate: false,
            minorAgeCustomer: false,
            products: {},
            chosenProduct: false,
            steinerResponse: false,
            isNewSpaDetailTypeActive: true
        };
    }

    componentDidMount() {
        window.scroll(0, 0);
        const { isNewSpaDetailTypeActive } = this.state;
        const brand = getConfig('brand', '');
        const addToCartPopUp = SessionStorage.getItem('addToCartPopUp') || {};
        if (Object.keys(addToCartPopUp).length && addToCartPopUp.isPopUpShow) {
            const {
                currency,
                totalPrice,
                totalItemCount,
                spaDescription,
                show_spa_description
            } = addToCartPopUp;
            this.showConfirmation(
                currency,
                totalPrice,
                totalItemCount,
                spaDescription,
                show_spa_description
            );
            addToCartPopUp['isPopUpShow'] = false;
            SessionStorage.setItem('addToCartPopUp', addToCartPopUp);
        }

        this.getProductsList()
            .then(
                !isNewSpaDetailTypeActive && brand === 'po'
                    ? this.getProductsData
                    : () => Promise.resolve
            )
            .then(
                !isNewSpaDetailTypeActive && brand === 'po'
                    ? this.calculateFromPrice
                    : () => Promise.resolve
            )
            .then(this.controlRestriction)
            .catch((err) => {});
    }

    showConfirmation = (
        currency,
        total,
        numberOfItems,
        spaDescription,
        show_spa_description
    ) => {
        const { onExit } = this.props;
        const spaConfigPageData = SessionStorage.getItem('spaConfigPageData');

        onExit && onExit();

        PubSub.publish(topics.ADD_TO_CART, {
            name: spaConfigPageData.name,
            total,
            currency,
            numberOfItems,
            spaDescription,
            show_spa_description
        });
    };

    getProductAvailbilityDetails() {
        const apikeyMycruise = getConfig('apikeyMycruise', '');
        const brand = getConfig('brand', '');
        const shipCode = getConfig('shipCode', '');
        const catgeoryId = SessionStorage.getItem('catgeoryId');
        const header = SessionStorage.getItem('header');
        const { embarkationDate, disembarkationDate } = header;
        const embarkDate = moment(embarkationDate, 'YYYY-MM-DD').format(
            'YYYYMMDD'
        );
        const disEmbarkDate = moment(disembarkationDate, 'YYYY-MM-DD')
            .subtract(1, 'days')
            .format('YYYYMMDD');
        const url = getConfig('spaServiceAvailabilityAPIURL')
            .replace('{brand}', brand)
            .replace('{vesselCode}', shipCode)
            .replace('{categoryId}', catgeoryId)
            .replace('{embarkationDay}', embarkDate)
            .replace('{disembarkationDay}', disEmbarkDate);
        FetchData(url, {
            method: 'GET',
            headers: {
                'X-Source-Identity-Token-0': apikeyMycruise,
                'cache-control': 'no-cache'
            }
        }).then((response) => {
            if (response.data && response.data.length) {
                const { products } = this.state;
                const products_array = new Array();
                for (let items in products) {
                    products_array.push(products[items]);
                }
                const newTreatments = products_array.reduce(
                    (treatmentsObj, treatment) => {
                        const { name } = treatment;
                        const treatmentObj = treatment.instances.reduce(
                            (treatmentObj, instance) => {
                                let purchasability = false;
                                response.data.forEach((singleService) => {
                                    if (
                                        singleService.serviceId ==
                                        instance.externalCode
                                    ) {
                                        purchasability = true;
                                        if (!instance.services) {
                                            instance.services = {};
                                        }
                                        instance['services'] = singleService;
                                    }
                                });
                                treatmentObj['purchasable'] = treatmentObj[
                                    'purchasable'
                                ]
                                    ? purchasability
                                    : treatmentObj['purchasable'];
                                return treatmentObj;
                            },
                            treatment
                        );
                        treatmentsObj[name] = treatmentObj;
                        return treatmentsObj;
                    },
                    {}
                );
                this.setState({
                    products: newTreatments
                });
            } else {
                const { products } = this.state;
                const products_array = new Array();
                for (let items in products) {
                    products_array.push(products[items]);
                }
                const newTreatments = products_array.reduce(
                    (treatmentsObj, treatment) => {
                        const { name } = treatment;
                        const treatmentObj = treatment.instances.reduce(
                            (treatmentObj, instance) => {
                                treatmentObj['purchasable'] = false;
                                return treatmentObj;
                            },
                            treatment
                        );
                        treatmentsObj[name] = treatmentObj;
                        return treatmentsObj;
                    },
                    {}
                );
                this.setState({
                    products: newTreatments
                });
            }
        });
    }

    /**
     * getProductList - API call to get the product instances
     */
    getProductsList() {
        const apikeyMycruise = getConfig('apikeyMycruise', '');
        const productId = getConfig('productId', '');
        const { services, productDetailServlet, heroVariation } = this.props;
        const { brand } = services.headers;
        const { treatmentsApi } = services.urls;
        const header = SessionStorage.getItem('header');
        const cruiseData = SessionStorage.getItem('cruiseData');
        let dobArray = [];
        header.passengers.forEach((passenger) => {
            dobArray.push(passenger.birthDate);
        });
        const config = typeof window !== 'undefined' ? window.configs : '';
        const customCurrencyCode =
            config.brand.toLowerCase() === 'po' ? 'gbp' : 'usd';
        const { embarkationDate } = header;
        const API = heroVariation
            ? `${treatmentsApi}${productId}_Oasis/treatments?${heroVariation}`
            : `${treatmentsApi}${productId}_Oasis/treatments`;

        const servlet = treatmentsApi;

        const url = brand === 'po' ? API : servlet;

        return FetchData(url, {
            method: 'GET',
            headers: {
                'X-CommonData': JSON.stringify(header),
                'X-Source-Identity-Token-0': apikeyMycruise,
                'cache-control': 'no-cache'
            }
        }).then((res) => {
            const { treatments } = res;
            const newTreatments = treatments.reduce(
                (treatmentsObj, treatment) => {
                    const { name } = treatment;
                    const treatmentObj = treatment.instances.reduce(
                        (treatmentObj, instance) => {
                            if (!treatmentObj.instanceCodes) {
                                treatmentObj.instanceCodes = [];
                            }
                            treatmentObj.instanceCodes.push(
                                instance.externalCode
                            );
                            if (!treatmentObj.image) {
                                treatmentObj.image = {};
                            }
                            const image = {
                                alt: treatment.name,
                                0: {
                                    '1x': `${
                                        instance.primaryImageUrl
                                    }.image.440.330.low.jpg`,
                                    '2x': `${
                                        instance.primaryImageUrl
                                    }.image.880.660.low.jpg`
                                },
                                376: {
                                    '1x': `${
                                        instance.primaryImageUrl
                                    }.image.440.330.medium.jpg`,
                                    '2x': `${
                                        instance.primaryImageUrl
                                    }.image.880.660.medium.jpg`
                                },
                                769: {
                                    '1x': `${
                                        instance.primaryImageUrl
                                    }.image.440.330.high.jpg`,
                                    '2x': `${
                                        instance.primaryImageUrl
                                    }.image.880.660.high.jpg`
                                }
                            };
                            treatmentObj['image'] = image;
                            return treatmentObj;
                        },
                        treatment
                    );
                    treatmentsObj[name] = treatmentObj;
                    return treatmentsObj;
                },
                {}
            );

            let skusArr = [];
            let productIdForAnalytics = '';
            Object.values(newTreatments).forEach((entry) => {
                entry.instances.forEach((value) => {
                    const skusObj = {
                        skuID: value.externalCode,
                        skuName: entry.name,
                        unitPrice_GBP: '',
                        unitPrice_local: '',
                        spaTreatmentType: entry.baseProduct,
                        spaDuration: value.duration
                    };
                    productIdForAnalytics = entry.baseProduct;
                    skusArr.push(skusObj);
                });
            });
            const analyticsObject = {
                myCruiseDetails: {
                    bookingNumber: header.bookingRef,
                    voyageID: header.cruiseCode,
                    voyageName: cruiseData.cruiseName,
                    shipName: cruiseData.shipName,
                    depDate: header.embarkationDate,
                    destName: '',
                    durationDays: header.physicalCruiseDuration,
                    depPortName: cruiseData.embarkPort,
                    destPortName: cruiseData.disembarkPort,
                    stateroomType: '',
                    numGuests: header.passengers.length,
                    dob: dobArray
                },
                loginStatus: 'logged in',
                loginType: header.agent ? header.agent.agentType : 'customer',
                AgentID: header.agent ? header.agent.id : '',
                crmID: '',
                country: header.market,
                languageSelected: header.language.substring(0, 2),
                customCurrencyCode: customCurrencyCode,
                memberLoyaltyLevel: header.customer.loyaltyTier,
                server: '',
                localDayTime: new Date().toString(),
                timePartingCodes: '',
                pageType: config.pageName,
                //Please refer Page and Content Hierarchy Tabs for below values
                sectionLevelOne: '',
                sectionLevelTwo: '',
                sectionLevelThree: '',
                sectionLevelFour: '',
                pageName: config.pageName,
                pageChannel: '',
                pageHier: '',
                //Please refer Page and Content Hierarchy Tabs for above values
                ecomStep: '',
                event: 'prodView',
                myCruiseProduct: {
                    status: '',
                    productID: productIdForAnalytics,
                    productName: '',
                    productType: 'spa',
                    startDateTime: '',
                    unitSalePrice_GBP: '',
                    unitPrice_GBP: '',
                    unitSalePrice_local: '',
                    unitPrice_local: '',
                    shorexAttributes: {
                        portName: '',
                        language: '',
                        activityLevel: '',
                        duration: '',
                        transport: '',
                        minAge: '',
                        maxAge: '',
                        tourType: [''],
                        tourCategory: '',
                        tourFeatures: ''
                    },
                    diningCategory: '',
                    unitPriceChild_GBP: '',
                    unitPriceChild_local: '',
                    skus: skusArr
                }
            };
            analytics.setAdditionalPageTrackAttributes(analyticsObject);

            this.setState(
                () => ({
                    products: newTreatments,
                    embarkationDate
                }),
                () => this.getProductAvailbilityDetails(),
                () => Promise.resolve
            );
        });
    }

    getProductsData = () => {
        const { services } = this.props;
        const { products } = this.state;
        const { spaAppointmentsApi } = services.urls;

        const userData = SessionStorage.getItem('userData');
        const {
            customer: {
                firstName,
                lastName,
                birthDate,
                genderCode,
                age,
                loyaltyTier
            },
            brandCode,
            shipCode,
            bookingRef,
            cabinCode,
            embarkationDate,
            disembarkationDate
        } = userData;

        const apikeyMycruise = getConfig('apikeyMycruise', '');
        const uniqueCode = generateUniqueCode(bookingRef, firstName, birthDate);
        const requestHeaders = {
            'Content-Type': 'application/json',
            'X-Source-Identity-Token-0': apikeyMycruise,
            partnerid: brandCode === 'PO' ? 'PO' : 'CUNARD',
            reqdate: moment().format('YYYYMMDD'),
            requestid: uniqueCode,
            vesselid: shipCode
        };
        const servicesBodyPart = Object.values(products).reduce(
            (productsArray, product) => {
                const { instances } = product;
                productsArray = instances.reduce((productsArray, instance) => {
                    productsArray.push({
                        serviceStartTime: '0000',
                        serviceEndTime: '2359',
                        service: instance.externalCode,
                        startDate: moment(embarkationDate)
                            .add(1, 'days')
                            .format('YYYYMMDD'),
                        endDate: moment(disembarkationDate)
                            .subtract(1, 'days')
                            .format('YYYYMMDD')
                    });
                    return productsArray;
                }, productsArray);
                return productsArray;
            },
            []
        );

        const requestBody = {
            searchSpaAppointmentRequest: {
                services: servicesBodyPart,
                personalInfo: {
                    paxAge: age,
                    paxCabin: cabinCode,
                    paxGender: genderCode,
                    paxFirstName: firstName,
                    paxLastName: lastName,
                    paxLoyaltyID: loyaltyTier
                }
            }
        };

        return FetchData(spaAppointmentsApi, {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: requestHeaders
        }).then(
            (res) => {
                const { searchSpaAppointmentResponse } = res;
                this.setState({ steinerResponse: true });

                const {
                    services,
                    responseHeaders
                } = searchSpaAppointmentResponse;
                services.map((service) => {
                    const { responseStatus } = service;
                    if (responseStatus === 'success') {
                        Object.values(products).map((product) => {
                            const indexOfService = product.instanceCodes.indexOf(
                                service.service
                            );
                            if (indexOfService > -1) {
                                product.instances[indexOfService] = {
                                    ...product.instances[indexOfService],
                                    ...service
                                };
                            }
                        });
                    }
                });

                this.setState(() => ({ products }), () => Promise.resolve);
            },
            (errArray) => {}
        );
    };

    calculateFromPrice = () => {
        const { products } = this.state;
        const newProducts = Object.entries(products).reduce(
            (newProducts, [productKey, productData]) => {
                productData.fromPrice = productData.instances.reduce(
                    (fromPrice, instance) => {
                        return (
                            instance.appointments &&
                            instance.appointments[0].appointment.reduce(
                                (fromPrice, appointment) => {
                                    const { treatementPrice } = appointment;
                                    return +fromPrice === 0 ||
                                        +treatementPrice < +fromPrice
                                        ? treatementPrice
                                        : fromPrice;
                                },
                                fromPrice
                            )
                        );
                    },
                    0
                );
                newProducts[productKey] = productData;
                return newProducts;
            },
            {}
        );
        this.setState(
            () => ({
                products: newProducts
            }),
            () => Promise.resolve
        );
    };

    controlRestriction = () => {
        const globalXdays = getConfig('globalXdays', '');
        const minAdultAge = getConfig('minAdultAge', '');
        const header = SessionStorage.getItem('header');

        const { embarkationDate } = header;
        const isTooLate =
            calculateDiffDays(Date.now(), new Date(embarkationDate)) <
            globalXdays;
        if (!isTooLate) {
            const orderedList = SessionStorage.getItem('orderedList');
            const { birthDate } = orderedList.passengers[0];
            const passengerBirth = new Date(birthDate);
            const passengerAge = calculateAge(passengerBirth.getTime());
            const isAdult = passengerAge >= minAdultAge;

            this.setState({
                purchasable: isAdult,
                minorAgeCustomer: !isAdult
            });
        } else {
            this.setState({
                isTooLate: true
            });
        }
    };

    handleOverlayOpen = (productItem = false) => {
        this.setState(() => ({
            chosenProduct: productItem
        }));
    };
    handleOverlayClose = (productItem = false) => {
        this.setState(() => ({
            chosenProduct: productItem
        }));
    };

    handleClickButton = (product) => {
        const productId = getConfig('productId');
        product['productId'] = productId;
        SessionStorage.setItem('spaConfigPageData', product);
        const varientCode = product.instances[0].externalCode;
        const pageConfigUrl = `spaBooking?treatment=${varientCode}`;
        window.location.href = pageConfigUrl;
    };

    renderNewSpaComponent = (product, index) => (
        <div className="spa-detail-tile tile-detail" key={index}>
            <NewSpaCard
                {...product}
                key={index}
                index={index}
                labels={this.props.labels}
                configuratorClick={this.handleClickButton}
            />
        </div>
    );

    renderSpaComponent = (product, index) => (
        <SpaComponent
            product={product}
            key={index}
            labels={this.props.labels}
            purchasable={product.fromPrice}
            configuratorClick={this.handleOverlayOpen}
            steinerResponse={this.state.steinerResponse}
        />
    );
    render() {
        const { childComponents, services, heroVariation } = this.props;
        const { brand } = services.headers;
        const {
            products,
            minorAgeCustomer,
            chosenProduct,
            isNewSpaDetailTypeActive
        } = this.state;
        const overlayProps = extractChildComponent(
            childComponents,
            'spaOverlay'
        );
        const notificationBannerProps = extractChildComponent(
            childComponents,
            'notificationBanner'
        );
        const theProducts = Object.values(products);

        return (
            <div>
                {minorAgeCustomer && (
                    <NotificationBanner
                        {...notificationBannerProps.attributes}
                    />
                )}
                {!isNewSpaDetailTypeActive && (
                    <div className="container">
                        {theProducts.length > 0 &&
                            theProducts.map(this.renderSpaComponent)}
                    </div>
                )}
                {isNewSpaDetailTypeActive && (
                    <div className="spa-tiles-container">
                        <div className="tiles-container">
                            {theProducts.length > 0 &&
                                theProducts.map(this.renderNewSpaComponent)}
                        </div>
                    </div>
                )}
                {overlayProps && (
                    <SpaOverlay
                        {...overlayProps.attributes}
                        mounted={chosenProduct ? true : false}
                        onExit={this.handleOverlayClose}
                        chosenProduct={chosenProduct}
                        underlayClass="spa-overlay"
                        brand={brand}
                    />
                )}
            </div>
        );
    }
}

productsVerticalTiles.defaultProps = {
    contentLabel: 'productsVerticalTiles'
};

export default productsVerticalTiles;
