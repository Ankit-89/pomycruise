/**
 * Dining titles
 * @exports spaTiles
 */
import React from 'react';
import SpaCard from '../spaCard';
import TitleH1Mycruise from '../../components/titleH1Mycruise';
import validateSession from '../commons/CUK/validateSession';
import analytics from '../commons/CUK/analytics';
import {
    VIEWPORT_TYPE,
    watchForBreakpoint
} from '../../library/js/config/breakpoints';
import FetchData from '../commons/CUK/fetch-data';
import SessionStorage from '../commons/CUK/session-storage';
import extractChildComponent from '../commons/CUK/extractChildComponent';
import { getConfig } from '../commons/CUK/utilities';

class spaTiles extends React.Component {
    constructor(props) {
        super(props);

        this.headerData = {
            header: SessionStorage.getItem('header'),
            apiKey: getConfig('apikeyMycruise', '')
        };

        this.state = {
            products: [],
            isLVP: false
        };
    }

    componentDidMount() {
        if (!validateSession.checkCookie(['wcmmode'])) {
            const picturefill = require('picturefill');
            const mqlLVP = watchForBreakpoint(VIEWPORT_TYPE.DESKTOP);

            // analytics.clickTracking(this);
            picturefill();

            this.handleResize(mqlLVP);
            mqlLVP.addListener((mql) => {
                this.handleResize(mql);
            });

            this.initTiles();
        }
    }

    componentDidUpdate() {
        // analytics.clickTracking(this);
    }

    initTiles() {
        const {
            props: { productSearchServlet },
            headerData
        } = this;

        const { shipCode } = headerData.header;

        const urlString = `${productSearchServlet}.listing.${shipCode}.json`;
        FetchData(urlString, {
            method: 'GET'
        }).then(
            (response) => {
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
                const currencyLocale =
                    typeof window !== 'undefined'
                        ? window.configs.currencyLocale
                        : ''
                let productsArr = [];
                response.services.forEach((service, index) => {
                    let productObj = {
                        listPosition: index,
                        productID: '',
                        productName: service.txName,
                        startDateTime: '',
                        status: '',
                        shorexAttributes:{
                            portName: '',
                            activityLevel: '',
                            language:'',
                            duration: '',
                            transport:'',
                            minAge:'',
                            maxAge:'',
                            tourType:'',
                            tourCategory:'',
                            tourFeatures:''
                        },
                        diningCategory: '',
                        unitPrice_GBP: '',
                        unitSalePrice_GBP: '',
                        unitSalePrice_local: '',
                        unitPrice_local: ''
                    }
                    productsArr.push(productObj);
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
                    event: 'event305',
                    searchResultsNumber: response.services.length,
                    sortBy: '',
                    productType: 'SPA',
                    filterCategorySel: '',
                    searchSelections: '',
                    myCruiseListingItems: productsArr
                });
                // analytics.clickTracking(this);
                const treatments = response.services;

                const theTreatments =
                    treatments.length > 0
                        ? treatments.reduce((theTreatments, treatment) => {
                            const { primaryImageUrl, txName } = treatment;

                            theTreatments.push({
                                ...treatment,
                                image: {
                                    alt: txName,
                                    0: {
                                        '1x': `${primaryImageUrl}.image.440.330.low.jpg`,
                                        '2x': `${primaryImageUrl}.image.880.660.low.jpg`
                                    },
                                    376: {
                                        '1x': `${primaryImageUrl}.image.440.330.medium.jpg`,
                                        '2x': `${primaryImageUrl}.image.880.660.medium.jpg`
                                    },
                                    769: {
                                        '1x': `${primaryImageUrl}.image.440.330.high.jpg`,
                                        '2x': `${primaryImageUrl}.image.880.660.high.jpg`
                                    }
                                }
                            });
                            return theTreatments;
                        }, [])
                        : [];

                this.setState({
                    products: theTreatments
                });
            },
            (error) => {
                this.setState({
                    error
                });
            }
        );
    }

    /**
     * handleResize - Resize event for media devices
     *
     * @param {object} mql - Match media object
     */
    handleResize(mql) {
        this.setState({
            isLVP: mql.matches
        });
    }

    /**
     * ShoreXResults from current sort and filter
     * @param {Array} spaTiles - shoreXResults results from api
     * @returns {ReactDOMObject} Port cards.
     */
    renderTile = (product, i) => (
        <div className="spa-detail-tile tile-detail" key={i}>
            <SpaCard
                {...product}
                key={i}
                index={i}
                labels={this.props.labels}
            />
        </div>
    );

    render() {
        const { childComponents } = this.props;
        const { products } = this.state;
        const titleH1Props = extractChildComponent(
            childComponents,
            'titleH1Mycruise'
        );

        return products.length > 0 ? (
            <div>
                <div className="tileH1-section">
                    {titleH1Props && (
                        <TitleH1Mycruise {...titleH1Props.attributes} />
                    )}
                </div>
                <div
                    className="spa-tiles-container"
                    ref={(c) => (this.tilesContainer = c)}
                >
                    <div className="tiles-container">
                        {products.map(this.renderTile)}
                    </div>
                </div>
            </div>
        ) : null;
    }
}

export default spaTiles;
