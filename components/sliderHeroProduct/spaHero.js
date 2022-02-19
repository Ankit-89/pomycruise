'use strict';

import React from 'react';
import Card from '../commons/CUK/card';
import Link from '../commons/CUK/link';
import SpaOverlay from '../spaOverlay';
import SessionStorage from '../commons/CUK/session-storage';
import extractChildComponent from '../commons/CUK/extractChildComponent';
import { getConfig, generateUniqueCode } from '../commons/CUK/utilities';
import moment from 'moment';
import { calculateAge, calculateDiffDays } from '../commons/CUK/dateFormat';
import FetchData from '../commons/CUK/fetch-data';
import analytics from '../commons/CUK/analytics';

class spaHero extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            chosenProduct: false,
            showCta: false
        };
    }
    componentDidMount() {
        this.getProductsData();
        this.controlRestriction();
    }

    getProductsData = () => {
        const {
            name,
            description,
            services,
            baseProduct,
            externalCode,
            language,
            purchasable
        } = this.props;
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

        let instances = [];
        let instance = {};
        let instanceCodes = [];
        let product = {};
        product['baseProduct'] = baseProduct;
        product['language'] = language;
        product['name'] = name;
        product['description'] = description;
        product['purchasable'] = purchasable;
        instance['externalCode'] = externalCode;
        instanceCodes.push(externalCode);
        instances.push(instance);
        let productProps = { instances, instanceCodes, ...product };

        const uniqueCode = generateUniqueCode(bookingRef, firstName, birthDate);
        const requestHeaders = {
            'Content-Type': 'application/json',
            partnerId: brandCode === 'PO' ? 'PO' : 'CUNARD',
            reqDate: moment().format('YYYYMMDD'),
            requestId: uniqueCode,
            vesselId: shipCode
        };
        let servicesBodyPart = [];

        let service = {
            serviceStartTime: '0000',
            serviceEndTime: '2359',
            service: externalCode,
            startDate: moment(embarkationDate)
                .add(1, 'days')
                .format('YYYYMMDD'),
            endDate: moment(disembarkationDate)
                .subtract(1, 'days')
                .format('YYYYMMDD')
        };
        servicesBodyPart.push(service);

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

        /* PRODUCTION REQUEST */
        let products = {};

        return FetchData(spaAppointmentsApi, {
            method: 'POST',
            body: JSON.stringify(requestBody),
            // method: 'GET',
            headers: requestHeaders
        }).then((res) => {
            const { searchSpaAppointmentResponse } = res;
            const { services, responseHeaders } = searchSpaAppointmentResponse;
            if (responseHeaders) {
            } else {
                services.map((service) => {
                    const { responseStatus } = service;
                    if (responseStatus === 'success') {
                        productProps.instances[0] = {
                            ...productProps.instances[0],
                            ...service
                        };
                        this.setState({
                            showCta: true,
                            productProps: productProps
                        });
                        // return productProps;
                    }
                });
            }
        });
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

    createDetailsCta() {
        const {
            name,
            url,
            labels: { seeDetailsLabel, addToCartLabel }
        } = this.props;

        let { productProps } = this.state;

        return (
            <div className="cta-content">
                <div className="cta-block">
                    <Link
                        ariaLabel={`${name}, ${seeDetailsLabel}`}
                        url={url}
                        title={seeDetailsLabel}
                        dataLinktext={seeDetailsLabel}
                        linkClassName={`primary-cta`}
                        onClick={false}
                    >
                        {seeDetailsLabel}
                    </Link>
                </div>
                <div className="cta-block">
                    <Link
                        ariaLabel={`${addToCartLabel}`}
                        url={'javascript:void(0)'}
                        title={addToCartLabel}
                        dataLinktext={addToCartLabel}
                        linkClassName={`secondary-cta`}
                        onClick={(e) => this.handleOverlayOpen(productProps)}
                    >
                        {addToCartLabel}
                    </Link>
                </div>
            </div>
        );
    }
    handleOverlayOpen = (productItem = false) => {
        analytics.clickTracking(this);
        this.setState(() => ({
            chosenProduct: productItem
        }));
    };
    handleOverlayClose = (productItem = false) => {
        this.setState(() => ({
            chosenProduct: productItem
        }));
    };

    render() {
        const {
            image,
            textAlignment,
            overlay,
            duration,
            description,
            name
        } = this.props;
        const cardProps = {
            image,
            textAlignment,
            imageLink: false,
            title: name,
            titleLink: false
        };
        let { chosenProduct, showCta, productProps } = this.state;
        const cardAlignmentClass =
            textAlignment === 'center' ? textAlignment : 'left';

        return (
            <div>
                <Card
                    {...cardProps}
                    className={`spa-card content-align-${cardAlignmentClass}`}
                >
                    <p className="spaCard__tecnical">
                        <span className="spaCard__duration">{duration}</span>
                    </p>
                    <div className="spa-card-description">{description}</div>

                    {showCta > 0 && this.createDetailsCta()}
                </Card>
                {chosenProduct && (
                    <SpaOverlay
                        {...overlay.attributes}
                        mounted={chosenProduct ? true : false}
                        onExit={this.handleOverlayClose}
                        chosenProduct={productProps}
                        underlayClass="spa-overlay"
                    />
                )}
            </div>
        );
    }
}

export default spaHero;
