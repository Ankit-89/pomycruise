'use strict';
import React from 'react';
// import PropTypes from 'prop-types';
import Link from '../commons/CUK/link';
import SessionStorage from '../commons/CUK/session-storage';
import { calculateAge, calculateDiffDays } from '../commons/CUK/dateFormat';
import fetchData from '../commons/CUK/fetch-data';
import HeroTileModuleMycruise from '../heroTileModuleMycruise';
import AllInclusiveOverlay from '../allInclusiveOverlay';
import validateSession from '../commons/CUK/validateSession';
import analytics from '../commons/CUK/analytics';
import { convertValueToVaildDecimalPoint } from '../commons/CUK/utilities'

class heroTileAllInclusive extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            minorAgeCustomer: false,
            showModal: false,
            purchasable: false,
            apiCalled: false,
            // shortLeaving: false,
            shortCruise: false,
            isTooLate: false
        };
    }
    componentDidMount() {
        if (
            !this.state.apiCalled &&
            !validateSession.checkCookie(['wcmmode'])
        ) {
            const header = SessionStorage.getItem('header');
            const cruiseData = SessionStorage.getItem('cruiseData');
            let embarkDate = new Date(header.embarkationDate);
            let disembarkDate = new Date(header.disembarkationDate);
            let cruiseLength =
                calculateDiffDays(
                    embarkDate.getTime(),
                    disembarkDate.getTime()
                );
            let isShortCruise = cruiseLength < this.props.embarkDisEmbarkDaysDiffLabel;
            //let isShortCruise = false;

            if (isShortCruise) {
                this.setState({
                    purchasable: false,
                    shortCruise: isShortCruise
                });
            } else {
                const serviceUrl = this.props.services.urls.productSearchApi;
                // const serviceLang = this.props.services.headers.locale;
                const configs =
                    typeof window !== 'undefined' ? window.configs : {};
                const apiKey = configs.apikeyMycruise;
                // let url = `/products/search/?productType=AIBEVERAGE&lang=${serviceLang}`;
                const url = `${serviceUrl}?productType=AIBEVERAGE`;
                let dobArray = [];
                header.passengers.forEach((passenger) => {
                    dobArray.push(passenger.birthDate);
                })
                const config =
                    typeof window !== 'undefined'
                        ? window.configs
                        : '';
                const customCurrencyCode = config.brand.toLowerCase() === "po" ? "gbp" : "usd";
                const currencyLocale =
                    typeof window !== 'undefined'
                        ? window.configs.currencyLocale
                        : '';

                fetchData(url, {
                    method: 'GET',
                    headers: {
                        'X-CommonData': JSON.stringify(header),
                        'X-Source-Identity-Token-0': apiKey,
                        'Content-type': 'application/json'
                    }
                }).then((res) => {
                    this.handleAllInclusiveListing(
                        res,
                        embarkDate,
                        cruiseLength
                    );

                    let skusArr = [];

                    res.products.forEach((entry) => {
                        const skusObj = { //Spa,AIB,CookeryClass,EventDining
                            productID: entry.code,
                            skuID: entry.code,
                            productName: entry.name,
                            skuName: entry.name,
                            unitPrice_GBP: entry.fromPrice && entry.fromPrice.value ? convertValueToVaildDecimalPoint(entry.fromPrice.value) : '',
                            unitSalePrice_GBP: entry.fromPrice && entry.fromPrice.value ? convertValueToVaildDecimalPoint(entry.fromPrice.value) : '',
                            unitPrice_local: entry.fromPrice && entry.fromPrice.value ? convertValueToVaildDecimalPoint(entry.fromPrice.value) : '',
                            unitSalePrice_local: entry.fromPrice && entry.fromPrice.value ? convertValueToVaildDecimalPoint(entry.fromPrice.value) : '',
                            status: entry.stock.stockLevelStatus,
                        }

                        skusArr.push(skusObj);
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
                        event: "prodView",
                        myCruiseProduct: {
                            status: '',
                            productID: '',
                            productName: '',
                            productType: "aibeverage",
                            startDateTime: '',
                            shorexAttributes: {
                                portName: "",
                                language: "",
                                activityLevel: "",
                                duration: "",
                                transport: "",
                                minAge: "",
                                maxAge: "",
                                tourType: [""],
                                tourCategory: "",
                                tourFeatures: ""
                            },
                            diningCategory: "",
                            unitPrice_GBP: "",
                            unitPrice_local: "",
                            unitPriceChild_GBP: "",
                            unitPriceChild_local: "",
                            skus: skusArr,
                        }
                    });
                });
            }
        }
    }
    /**
     * handleAllInclusiveListing - Handles response from search Api
     *
     * @param {object} res response from Api call
     * @param {Date} embarkDate embark date object
     * @param {number} cruiseLength cruise duration minus disembark date
     */
    handleAllInclusiveListing = (res, embarkDate, cruiseLength) => {
        let lastDateOfSale = new Date(res.lastDateOfSale);
        if (Date.now() > lastDateOfSale.getTime()) {
            this.setState({
                purchasable: false,
                isTooLate: true
            });
        } else {

            const orderedList = SessionStorage.getItem('orderedList');
            let currentlyLoggedPassenger;
            let passengerBirth;
            let passengerAge;
            let passengerIsAdult;

            let nonAvailabilityMessage = res.products[0].nonAvailabilityMessage
                ? res.products[0].nonAvailabilityMessage.code
                : '';

            let nonAvailabilityMessageCondition = nonAvailabilityMessage === 'STOP_SALE_DATE_PASSED' ? false : true;
            let purchasableValue = false;
            res.products.forEach((product) => {
                if (product.purchasable) {
                    purchasableValue = true;
                }
            })

            let lessThanFiveDaysToGo = calculateDiffDays(new Date().getTime(), embarkDate.getTime()) < this.props.lessThanXDaysToGoLabel;
            currentlyLoggedPassenger = { ...orderedList.passengers[0] };
            passengerBirth = new Date(currentlyLoggedPassenger.birthDate);
            passengerAge = calculateAge(passengerBirth.getTime());
            passengerIsAdult =
                passengerAge < res.minAlcoholicAge ? false : true;
            this.setState({
                purchasable: !lessThanFiveDaysToGo && nonAvailabilityMessageCondition && purchasableValue,
                productNonAvailabilityMessage: nonAvailabilityMessage,
                minorAgeCustomer: !passengerIsAdult,
                apiCalled: true,
                basePackageCode: res.aibDefaultKidsPackageCode,
                embarkDate: embarkDate,
                cruiseLength: cruiseLength,
                minAlcoholicAge: res.minAlcoholicAge,
                passengers: [...orderedList.passengers],
                products: [...res.products]
            });
        }
    };
    /**
     * createCta - Handles markup creation for cta
     * providing error message with informational tooltip
     * in case of cta not available.
     *
     * @returns {JSX} resulting markup to show
     */
    createCta = () => {
        const {
            notOnSaleLabel,
            notOnSaleInfo,
            notOnSaleAnymoreLabel,
            notOnSaleAnymoreInfo,
            addToCartLabel,
            bookOnBoardLabel,
            bookOnBoardMessage
        } = this.props;

        const tooltipStyle = { display: this.state.hover ? 'block' : 'none' };
        if (!this.state.purchasable) {
            let tooltipLabel, tooltipInfo;
            if (this.state.isTooLate) {
                tooltipLabel = notOnSaleAnymoreLabel;
                tooltipInfo = notOnSaleAnymoreInfo;
            } else if (this.state.shortCruise) {
                tooltipLabel = notOnSaleLabel;
                tooltipInfo = notOnSaleInfo;
            } else if (
                this.state.productNonAvailabilityMessage ===
                'STOP_SALE_DATE_PASSED'
            ) {
                tooltipLabel = bookOnBoardLabel;
                tooltipInfo = bookOnBoardMessage;
            }
            return (
                <div className="hero-tile-variants-title">
                    <div
                        className="hero-tile-variants-title-info"
                        onMouseOver={this.handleMouse.bind(this, true)}
                        onMouseOut={this.handleMouse.bind(this, false)}
                    >
                        <div
                            className="hero-tile-variants-tooltip"
                            style={tooltipStyle}
                        >
                            <a
                                className="hero-tile-close"
                                onClick={(e) => this.closeTooltip(e)}
                            />
                            <p>{tooltipInfo}</p>
                        </div>
                    </div>
                    {tooltipLabel}
                </div>
            );
        } else {
            return (
                <div className="cta-holder">
                    <Link
                        url=""
                        ariaLabel={`${addToCartLabel}`}
                        label={addToCartLabel}
                        url="#"
                        onClick={(e) => this.handleOverlay(true)}
                        linkClassName="secondary"
                        dataLinktext={`${addToCartLabel}`}
                    >
                        {addToCartLabel}
                    </Link>
                    {this.state.apiCalled && this.createModal()}
                </div>
            );
        }
    };
    /**
     * handleOverlay - Handles state change to show proper overlay
     *
     * @param {boolean} overlayState show state of overlay
     */
    handleOverlay = (overlayState) => {
        analytics.clickTracking(this)
        this.setState({
            showModal: overlayState
        });
    };
    /**
     * closeTooltip - handleClosing of tooltip preventing default click behaviour
     * and toggling state "hover" property to false.
     * TODO: Seems that is not needed because show/hide of tooltip is triggered with hover
     *
     * @param {any} event close button click event
     */
    closeTooltip = (event) => {
        analytics.clickTracking(this);
        event.preventDefault();
        this.setState({ hover: false });
    };
    /**
     * handleMouse - Handles "mouse" events toggling
     *  @param {boolean} state "hover" state property.
     */
    handleMouse = (state) => {
        this.setState({ hover: state });
    };
    /**
     * createModal - Handles creation of overlay coupled with hero tile cta
     *
     * @returns  {JSX} AllInclusiveOverlay component instance
     */
    createModal = () => {
        let overlayData = this.props.childComponents[0];
        return (
            <AllInclusiveOverlay
                products={this.state.products}
                basePackageCode={this.state.basePackageCode}
                passengers={this.state.passengers}
                mounted={this.state.showModal}
                onExit={() => this.handleOverlay(false)}
                shortDescription={this.props.shortDescription}
                title={this.props.title}
                underlayClass="allinclusive-overlay"
                minAlcoholicAge={this.state.minAlcoholicAge}
                isAdultLogged={!this.state.minorAgeCustomer}
                embarkDate={this.state.embarkDate}
                cruiseLength={this.state.cruiseLength}
                services={overlayData.attributes.services}
                labels={overlayData.attributes.labels}
            />
        );
    };
    render() {
        return (
            <HeroTileModuleMycruise
                {...this.props}
                headingOneUsed={true}
                showReadMore={true}
            >
                {this.createCta()}
            </HeroTileModuleMycruise>
        );
    }
}
// heroTileAllInclusive.propTypes = {
//     type: PropTypes.string.isRequired,
//     image: PropTypes.object,
//     cardAlignment: PropTypes.string.isRequired,
//     logo: PropTypes.object,
//     title: PropTypes.string.isRequired,
//     description: PropTypes.string.isRequired,
//     ctaIcon: PropTypes.object,
//     ctaType: PropTypes.string,
//     contentLabel: PropTypes.string,
//     viewCta: PropTypes.shape({
//         label: PropTypes.string,
//         url: PropTypes.string,
//         isExternal: PropTypes.bool
//     }),
//     backLabel: PropTypes.string
// };
heroTileAllInclusive.defaultProps = {
    readMoreMaxHeight: {
        lvp: 154,
        mvp: 154,
        svp: 100
    }
};
export default heroTileAllInclusive;
