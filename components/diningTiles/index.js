/**
 * Dining titles
 * @exports diningTiles
 */
import React from 'react';
import DiningCard from '../diningCard';
import TitleH1Mycruise from '../../components/titleH1Mycruise';
import analytics from '../commons/CUK/analytics';
import {
    VIEWPORT_TYPE,
    watchForBreakpoint
} from '../../library/js/config/breakpoints';
import fetchData from '../commons/CUK/fetch-data';
import SessionStorage from '../commons/CUK/session-storage';
import DiningOverlay from '../diningOverlay';
import extractChildComponent from '../commons/CUK/extractChildComponent';
import validateSession from '../commons/CUK/validateSession';
import { getConfig } from '../commons/CUK/utilities';
import { calculateDiffDays } from '../commons/CUK/dateFormat';
import moment from 'moment';


const ERROR_CODES = {
    START_SALE_DATE_NOT_MET: 'notOnSaleYet',
    STOP_SALE_DATE_PASSED: 'notOnSaleAnymore',
    DINING_INSTANCE_NOT_VALID_FOR_CRUISE_SHIP: 'notOnSaleAnymore',
    PRODUCT_OUT_OF_STOCK: 'outOfStock',
    DINING_MASTER_NOT_APPROVED: 'notOnSaleAnymore',
    INSTANCE_IS_NOT_AVAILABLE: 'notOnSaleAnymore'
};

class diningTiles extends React.Component {
    constructor(props) {
        super(props);
        this.venueCodes = [
            'venueType:speciality_bookable',
            'venueType:speciality_nonbookable',
            'venueType:included_bookable',
            'venueType:included_nonbookable',
            'venueType:limelight',
            'venueType:cookery'
        ];
        this.headerData = {
            header: SessionStorage.getItem('header'),
            apiKey:
                typeof window !== 'undefined'
                    ? window.configs.apikeyMycruise
                    : ''
        };

        this.state = {
            isLoaded: false,
            chosenProduct: false,
            isLVP: false,
            purchasability: true,
            diningDayX: false
        };
    }

    componentDidMount() {
        const picturefill = require('picturefill');
        const mqlLVP = watchForBreakpoint(VIEWPORT_TYPE.DESKTOP);

        // analytics.clickTracking(this);
        picturefill();

        this.handleResize(mqlLVP);
        mqlLVP.addListener((mql) => {
            this.handleResize(mql);
        });

        const header = SessionStorage.getItem('header');
        const { embarkationDate } = header;
        const dayOfCruiseDeparture = new Date(
            moment(embarkationDate, 'YYYY-MM-DD').format('ll')
        );
        const today = new Date();
        const oneDay = 1000 * 60 * 60 * 24;
        const dayToCruiseDeparture = Math.ceil(
            (dayOfCruiseDeparture.getTime() - today.getTime()) / oneDay
        );
        const xDays = window.configs.diningDayX ? window.configs.diningDayX : "0";
        const diffDays = +xDays - dayToCruiseDeparture;

        if (diffDays >= 0) {
            this.setState({
                diningDayX: true
            });
        }

        if (!validateSession.checkCookie(['wcmmode'])) {
            this.initTiles();
        }
    }

    componentDidUpdate() {
        // analytics.clickTracking(this);
    }

    initTiles() {
        const {
            props: { solrCollectionName, solrCollectionNameVenue }
        } = this;

        const { pathSolrHandler } = this.props.services.urls;
        const userData = SessionStorage.getItem('userData');
        const header = SessionStorage.getItem('header');
        const cruiseData = SessionStorage.getItem('cruiseData');
        let dobArray = [];
        header.passengers.forEach((passenger) => {
            dobArray.push(passenger.birthDate);
        });
        const config = typeof window !== 'undefined' ? window.configs : '';
        const customCurrencyCode =
            config.brand.toLowerCase() === 'po' ? 'gbp' : 'usd';
        const currencyLocale =
            typeof window !== 'undefined' ? window.configs.currencyLocale : '';
        const {
            shipCode,
            cabinCode,
            embarkationDate,
            disembarkationDate
        } = userData;
        let venueList = [];
        const urlString = `${pathSolrHandler}${solrCollectionName}/getEvents?q=*%3A*&fq=(isHighlightedEvent:true AND shipCode:${shipCode} )&rows=99999`;
        
        fetchData(urlString, {
            method: 'GET'
        }).then(
            (res) => {
                if (res && res.response && res.response.numFound > 0) {
                    venueList = [...venueList, ...res.response.docs];
                }

                let vennuURL = `${pathSolrHandler}${solrCollectionNameVenue}/getVenues?q=*%3A*&fq=( (${this.venueCodes.join(' OR ')}) AND shipCode:${shipCode} )&rows=99999`;
                fetchData(vennuURL, {
                    method: 'GET'
                }).then((res) => {
                    if (res && res.response && res.response.numFound > 0) {
                        venueList = [...venueList, ...res.response.docs];
                    }
                    let productsArr = [];
                    this.setState({
                        isLoaded: true,
                        products: venueList.length ? venueList : false,
                        dates: {
                            embarkationDate,
                            disembarkationDate
                        }
                    });
                });
            },
            (error) => {
                this.setState({
                    isLoaded: true,
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
     * @param {Array} diningTiles - shoreXResults results from api
     * @returns {ReactDOMObject} Port cards.
     */
    createTiles() {
        const { labels } = this.props;
        const {
            products,
            purchasability,
            diningInstanceNotAvailable,
            complementryVenues,
            diningDayX
        } = this.state;
        // const { showShorePrice, hideCollectionBanner } = this.props;
        return products.map((product, i) => {
            const {
                title,
                code,
                masterWebsitePath,
                bannerImage,
                venueType
            } = product;

            const header = SessionStorage.getItem('header');
            const { shipCode } = header;
            const image = {
                alt: title,
                0: {
                    '1x': `${bannerImage}.image.440.330.low.jpg`,
                    '2x': `${bannerImage}.image.880.660.low.jpg`
                },
                376: {
                    '1x': `${bannerImage}.image.440.330.medium.jpg`,
                    '2x': `${bannerImage}.image.880.660.medium.jpg`
                },
                769: {
                    '1x': `${bannerImage}.image.440.330.high.jpg`,
                    '2x': `${bannerImage}.image.880.660.high.jpg`
                }
            };
            const name = title;
            const id = code;
            const url = masterWebsitePath;
            const purchasability = venueType ? venueType : diningDayX;
            product = {
                ...product,
                image,
                name,
                id,
                url,
                venueType
            };

            return (
                <div className="shore-detail-tile tile-detail" key={i}>
                    <DiningCard
                        {...product}
                        key={i}
                        index={i}
                        configuratorClick={() =>
                            this.handleOverlayOpen(product)
                        }
                        labels={labels}
                        purchasability={purchasability}
                        diningDayX={diningDayX}
                        // complementryVenues={complementryVenues[product.id]}
                        // bookableOnBoard={
                        //     diningInstanceNotAvailable[product.id]
                        // }
                    />
                </div>
            );
        });
    }

    getAvailability = () => {
        // call hybris api to get availability status
        ///{baseSiteId}/dining/venuePurchasability?venueCodes=venue1,venue2
        const { services } = this.props;
        const { products } = this.state;
        const serviceUrl = services.urls.diningAvailabilityApi;
        const header = SessionStorage.getItem('header');
        const apiKey = getConfig('apikeyMycruise', '');
        const { shipCode } = header;
        let venueCodes = this.state.products.map((product, index) => {
            return `${product.id}`;
        });
        venueCodes = venueCodes.join();
        const url = `${serviceUrl}?venueCodes=${venueCodes}`;
        // const urlDev = '/services/diningAvailability.json';

        fetchData(url, {
            method: 'GET',
            headers: {
                'X-CommonData': JSON.stringify(header),
                'X-Source-Identity-Token-0': apiKey
            }
        }).then(
            (response) => {
                let purchasabilityObject = {}; 
                let complementryObject = {};
                let diningInstanceNotAvailable = {};
                response.venues.map((venue, i) => {

                    let purchasability = response.venues[i].purchasable;
                    if (!purchasability) {
                        const nonPurchasabilityCode =
                            response.venues[i].nonAvailabilityMessage.code;
                        purchasability = ERROR_CODES[nonPurchasabilityCode];
                    }
                    if (response.venues[i].externalCode.toUpperCase() === 'IA_GL' || response.venues[i].externalCode.toUpperCase() === 'AR_OG' ||
                        response.venues[i].externalCode.toUpperCase() === 'AR_GL') {
                        complementryObject[response.venues[i].externalCode] = true;
                    }
                    else {
                        complementryObject[response.venues[i].externalCode] = false;
                    }
                    purchasabilityObject[response.venues[i].externalCode] = purchasability;

                    let diningInstanceAvailablity = products[i].venueType;
                    if (diningInstanceAvailablity === 'speciality_np') {
                        diningInstanceAvailablity = 'bookableOnBoard';
                    }
                    diningInstanceNotAvailable[response.venues[i].externalCode] = diningInstanceAvailablity
                });
                this.setState({
                    purchasability: purchasabilityObject,
                    complementryVenues: complementryObject,
                    diningInstanceNotAvailable: diningInstanceNotAvailable

                });
            },
            (error) => { }
        );
    };

    handleOverlayOpen = (productItem = false) => {
        this.setState(() => ({
            chosenProduct: productItem
        }));
    };

    handleOverlayClose = () => {
        this.setState(() => ({
            chosenProduct: false
        }));
    };

    render() {
        const titleH1Props = extractChildComponent(
            this.props.childComponents,
            'titleH1Mycruise'
        );
        const overlayProps = extractChildComponent(
            this.props.childComponents,
            'diningOverlay'
        );
        const { products, dates, chosenProduct } = this.state;

        return (
            <div>
                <div className="tileH1-section">
                    {titleH1Props && (
                        <TitleH1Mycruise {...titleH1Props.attributes} />
                    )}
                </div>
                <div
                    className="dining-tiles-container"
                    ref={(tilesContainer) =>
                        (this.tilesContainer = tilesContainer)
                    }
                >
                    <div className="dinings tiles-container">
                        {products && this.createTiles(products)}
                    </div>
                </div>
                {overlayProps && (
                    <DiningOverlay
                        {...overlayProps.attributes}
                        mounted={chosenProduct ? true : false}
                        headerData={this.headerData}
                        onExit={this.handleOverlayClose}
                        chosenProduct={chosenProduct}
                        underlayClass="dining-overlay"
                        dates={dates}
                        name={chosenProduct.name}
                    />
                )}
            </div>
        );
    }
}

export default diningTiles;
