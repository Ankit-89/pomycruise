'use strict';

import React from 'react';
import Slider from 'react-slick';
import TitleH1Mycruise from '../../components/titleH1Mycruise';
import ShorexCard from '../../components/shorexCard';
import DiningCard from '../../components/diningCard';
import SpaCard from '../../components/spaCard';
import analytics from '../commons/CUK/analytics';
import equalizer from '../commons/CUK/equalizer';
import CarouselControls from '../commons/CUK/carouselControls';
import { breakpoint } from '../../library/js/config/index';
// import { getConfig } from '../commons/CUK/utilities';
import fetchData from '../commons/CUK/fetch-data';
import SessionStorage from '../commons/CUK/session-storage';
import extractChildComponent from '../commons/CUK/extractChildComponent';
import validateSession from '../commons/CUK/validateSession';
import { convertValueToVaildDecimalPoint } from '../commons/CUK/utilities'

const VIEWPORT_TYPE = breakpoint.VIEWPORT_TYPE;
const watchForBreakpoint = breakpoint.watchForBreakpoint;
const Breakpoints = breakpoint.breakpointsMax;

class sliderRecommendedShorex extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            showCarousel: true,
            activeSlide: 1,
            tileChildObj: [],
            isLVP: true,
            totalSlide: '',
            disableNext: false,
            disablePrev: true,
            slidesDisplayed: 1
        };
        this.carousalSettings = {
            carousalShownLVP: 3
        };

        this.settings = {
            accessibility: true,
            dots: false,
            infinite: false,
            arrows: false,
            slidesToShow: 3,
            slidesToScroll: 3,
            swipe: false,
            responsive: [
                {
                    breakpoint: Breakpoints.mobile,
                    settings: {
                        slidesToShow: 1,
                        slidesToScroll: 1,
                        centerMode: true,
                        swipe: true,
                        centerPadding: '24px'
                    }
                },
                {
                    breakpoint: Breakpoints.mobileLandscape,
                    settings: {
                        slidesToShow: 1.5,
                        slidesToScroll: 1,
                        centerMode: false,
                        swipe: true,
                        centerPadding: '5px'
                    }
                },
                {
                    breakpoint: Breakpoints.tablet,
                    settings: {
                        slidesToShow: 2,
                        slidesToScroll: 2,
                        centerMode: false,
                        centerPadding: '50px',
                        swipe: true
                    }
                },
                {
                    breakpoint: Breakpoints.desktop,
                    settings: {
                        slidesToShow: 3,
                        slidesToScroll: 3,
                        centerMode: false,
                        centerPadding: '500px',
                        swipe: true
                    }
                },
                {
                    breakpoint: Breakpoints.desktopXlSlider,
                    settings: {
                        slidesToShow: 3,
                        slidesToScroll: 3,
                        centerMode: false,
                        centerPadding: '500px',
                        swipe: true
                    }
                }
            ],
            afterChange: this.setActiveSlide
        };
    }

    componentWillMount() {
        if (!validateSession.checkCookie(['wcmmode'])) {
            this.destinationTileArray();
        }
    }

    componentDidMount() {
        const mqlLVP = watchForBreakpoint(VIEWPORT_TYPE.DESKTOP);

        this.handleResize(mqlLVP);

        mqlLVP.addListener(this.handleResize);
        const container = this.sliderRecommendedShorex;
        if (container !== void (0)) {
            let cardTextContent = container.querySelectorAll(
                '.sliderRecommendedShorex .text-content'
            );
            window.requestAnimationFrame(() => {
                equalizer(cardTextContent);
            });
            // analytics.clickTracking(this);
        }
    }
    componentDidUpdate() {
        // analytics.clickTracking(this);
    }
    handleResize = (mql) => {
        if (
            watchForBreakpoint(VIEWPORT_TYPE.DESKTOP).matches ||
            watchForBreakpoint(VIEWPORT_TYPE.TABLET_L).matches
        ) {
            this.setState({
                totalSlide: Math.ceil(this.state.totalTiles / 3),
                isLVP: true,
                slidesDisplayed: 3
            });
        } else if (watchForBreakpoint(VIEWPORT_TYPE.TABLET).matches) {
            this.setState({
                totalSlide: Math.ceil(this.state.totalTiles / 2),
                isLVP: false,
                slidesDisplayed: 2
            });
        } else if (watchForBreakpoint(VIEWPORT_TYPE.MOBILE_L).matches) {
            this.setState({
                totalSlide: this.state.totalTiles,
                isLVP: false,
                slidesDisplayed: 1.5
            });
        } else {
            this.setState({
                totalSlide: this.state.totalTiles,
                isLVP: false,
                slidesDisplayed: 1
            });
        }
        this.setActiveSlide();
    };

    constructJSON = (arr) => {
        let splitArray = [],
            i,
            len,
            tempArray = arr;

        for (i = 0, len = tempArray.length; i < len; i += 3) {
            splitArray.push(tempArray.slice(i, i + 3));
        }

        this.setState({
            jsonLVP: splitArray
        });
    };

    nextSlide = () => {
        this.slider.slickNext();
    };

    previousSlide = () => {
        this.slider.slickPrev();
    };

    goToSlide = (slide) => {
        this.slider.slickGoTo(slide);
    };

    setActiveSlide = (index) => {
        const activeSlide = isNaN(
            Math.ceil(index / this.state.slidesDisplayed) + 1
        )
            ? 1
            : Math.ceil(index / this.state.slidesDisplayed) + 1;
        const disableNext = activeSlide === this.state.totalSlide;
        const disablePrev = activeSlide === 1;

        this.setState({
            activeSlide,
            disableNext,
            disablePrev
        });
    };

    async destinationTileArray() {
        let services = this.props.services;
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
        const currencyLocale =
            typeof window !== 'undefined'
                ? window.configs.currencyLocale
                : '';
        // retreive the information from tha Recommended API
        // URL /{baseSiteId}/products/{productOfferingCode}/recommendations
        // from AEM /{baseSiteId}/products/{{productCode}}/recommendations
        const configs = typeof window !== 'undefined' ? window.configs : {};
        const apiKey = configs.apikeyMycruise;
        let productId = configs.productId;
        const pageNm = configs.pageName;//YD TODO 
        // const url = services.urls.shorexRecommendationApi;
        let serviceUrl = services.urls.shorexRecommendationApi;
        let url = serviceUrl.replace('{{productCode}}', productId);
        let shipCode = configs.shipCode;
        let venueCode = productId;
        const page = configs.page;
        if (page.includes('dining-listing')) {
            serviceUrl = services.urls.productDiningRecommendApi;
            url = serviceUrl.replace("{{diningCode}}", venueCode);
        } else if (page.includes('AIB_PDP')) {
            const productSearchApi = `${services.urls.productSearchApi}?productType=AIBEVERAGE`;
            await fetchData(productSearchApi, {
                method: 'GET',
                headers: {
                    'X-CommonData': JSON.stringify(header),
                    'X-Source-Identity-Token-0': apiKey
                }
            }).then((res) => {
                const aibProducts = res.products.filter(
                    (aibPackage) =>
                        aibPackage.stock && aibPackage.stock.stockLevel > 0
                );
                let aibParam = '';
                for (let i = 0; i < aibProducts.length; i++) {
                    const stringJoin = i < (aibProducts.length - 1) ? ',' : '';
                    aibParam = aibParam + aibProducts[i].code + stringJoin;
                }
                serviceUrl = services.urls.aibRecommendationApi;
                url = serviceUrl + '?productOfferingCodes=' + aibParam;
            })
                .catch()
        } else if (page.includes('spa-services')) {
            serviceUrl = services.urls.shorexRecommendationApi;
            url = serviceUrl.replace('{{productCode}}', productId + "_Oasis");
        }
        else {
            serviceUrl = services.urls.shorexRecommendationApi;
            url = serviceUrl.replace('{{productCode}}', productId);
        }
        fetchData(url, {
            method: 'GET',
            headers: {
                'X-CommonData': JSON.stringify(header),
                'X-Source-Identity-Token-0': apiKey
            }
        }).then((response) => {
            let tileArray = response.recommendations;
            let productArr = [];
            tileArray.forEach((product, index) => {
                let diningCategory = '';
                if (product.productType && product.productType == 'DINNING') {
                    diningCategory = 'SelectDining';
                    if (diningEventType == 'ENTERTAINMENT') {
                        diningCategory = 'EventDining'
                    } else if (diningEventType == 'COOKERY') {
                        diningCategory = 'CookeryClub'
                    }
                }
                let formPrice = '';
                if (product.productType && product.productType == 'SHOREX') {
                    product.prices.forEach((price) => {
                        if (price.userPriceGroup === 'ADULT') {
                            formPrice = price.minValue && convertValueToVaildDecimalPoint(price.minValue);
                        }
                    })
                }
                if (product.productType && product.productType == "AIBEVERAGE") {
                    product.prices.forEach((price) => {
                        if (price.userPriceGroup === 'ALL') {
                            formPrice = price.minValue && convertValueToVaildDecimalPoint(price.minValue);
                        }
                    })
                }
                const singleProduct = {
                    listPosition: index,
                    productID: product.code && product.code,
                    productName: product.name && product.name,
                    productType: product.productType && product.productType,
                    startDateTime: new Date().toString(),
                    available: product.stock && product.stock.stockLevelStatus,
                    shorexAttributes: {
                        portName: product.productType === 'SHOREX' ? product.port.shortName : '',
                        activityLevel: product.productType === 'SHOREX' ? '' : '',
                        language: product.productType === 'SHOREX' ? '' : '',
                        duration: product.productType === 'SHOREX' ? '' : '',
                        transport: product.productType === 'SHOREX' ? '' : '',
                        minAge: product.productType === 'SHOREX' ? '' : '',
                        maxAge: product.productType === 'SHOREX' ? '' : '',
                        tourType: product.productType === 'SHOREX' ? '' : '',
                        tourCategory: product.productType === 'SHOREX' ? '' : '',
                        tourFeatures: product.productType === 'SHOREX' ? '' : ''
                    },
                    diningCategory: diningCategory,
                    unitPrice_GBP: formPrice,
                    unitPrice_local: formPrice,
                }
                productArr.push(singleProduct);
            })

            const myCruiseBlockData = {
                blockName: "RecommendedForYou",
                modelID: "",
                modelName: "",
                inView: this.settings.slidesToShow,
                sortBy: "",
                listItems: productArr
            }
            let myCruiseBlock = SessionStorage.getItem('myCruiseBlock') || [];
            myCruiseBlock.push(myCruiseBlockData);
            SessionStorage.setItem('myCruiseBlock', myCruiseBlock);

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
                event: "event301",
                myCruiseBlock: myCruiseBlock
            });
            this.setState({
                totalTiles: tileArray.length,
                tileChildObj: tileArray
            });
            if (tileArray.length <= this.carousalSettings.carousalShownLVP) {
                this.settings.responsive[3].settings = 'unslick';
                this.settings.responsive[4].settings = 'unslick';
            }

            this.constructJSON(tileArray);
            this.handleResize();
        });
    };

    returnCorrectCard = (items, i) => {
        let itemUrl = items.url;
        const excursionBasePath = window.configs.excursionBasePath;
        switch (items.productType) {
            case 'SHOREX':
                itemUrl = excursionBasePath.replace('excursions', itemUrl);
                break;
            case 'DINING':
                itemUrl = itemUrl.split('/');
                itemUrl = itemUrl[3] + '/' + itemUrl[4];
                itemUrl = excursionBasePath.replace('excursions', itemUrl);
                break;
            case 'SPA':
                itemUrl = `spa-services/${items.code}`
                itemUrl = excursionBasePath.replace('excursions', itemUrl);
                break;
        }
        let imageUrl =
            items.productType === 'DINING'
                ? items.overviewImage
                : items.primaryImageUrl;
        let image = {
            alt: items.name,
            0: {
                '1x': `${imageUrl}.image.440.330.low.jpg`,
                '2x': `${imageUrl}.image.880.660.low.jpg`
            },
            376: {
                '1x': `${imageUrl}.image.440.330.medium.jpg`,
                '2x': `${imageUrl}.image.880.660.medium.jpg`
            },
            769: {
                '1x': `${imageUrl}.image.440.330.high.jpg`,
                '2x': `${imageUrl}.image.880.660.high.jpg`
            }
        };
        let shorexOverlayProps = extractChildComponent(
            this.props.childComponents,
            'shorexOverlay'
        );
        let url = itemUrl;

        //items.url = window.location.href.split("excursions")[0] + items.url;

        items = { ...items, image, url };
        switch (items.productType) {
            case 'SHOREX':
                const { country } = typeof this.props !== 'undefined' && typeof this.props.services !== 'undefined' && this.props.services.headers;
                return (
                    <ShorexCard
                        key={i}
                        index={i}
                        {...items}
                        services={this.props.services}
                        labels={this.props.labels}
                        overlay={shorexOverlayProps}
                        languages={shorexOverlayProps.attributes.guideLanguages}
                        country={country}
                        blockName={'RecommendedForYou'}
                    />
                );
            case 'DINING':
                return (
                    <DiningCard
                        key={i}
                        index={i}
                        {...items}
                        overlay={false}
                        services={this.props.services}
                        labels={this.props.labels}
                        blockName={'RecommendedForYou'}
                    />
                );
            case 'SPA':
                return (
                    <SpaCard
                        key={i}
                        index={i}
                        {...items}
                        overlay={false}
                        services={this.props.services}
                        labels={this.props.labels}
                        blockName={'RecommendedForYou'}
                    />
                );
        }
    };

    slidesMVP = () =>
        this.state.tileChildObj ? (
            <Slider ref={(c) => (this.slider = c)} {...this.settings}>
                {this.state.tileChildObj.map((items, i) => (
                    <div key={i} className="destination-tile-wrapper">
                        {this.returnCorrectCard(items, i)}
                    </div>
                ))}
            </Slider>
        ) : null;

    render() {
        const { childComponents } = this.props;
        const { previousLabel, nextLabel } = this.props.labels;
        const tileCount = this.state.totalTiles;
        // const bgColor = ( backgroundColor ) ? '' : ' bg';
        const columnClass = tileCount > 2 ? ' col-3' : ' col-2';
        return (
            <div
                className={`three-up-container${columnClass}`}
                ref={(sliderRecommendedShorex) =>
                    (this.sliderRecommendedShorex = sliderRecommendedShorex)
                }
            >
                <div className="tileH1-section">
                    {childComponents.length > 0 &&
                        childComponents[0] !== null && (
                            <TitleH1Mycruise
                                {...childComponents[0].attributes}
                            />
                        )}
                </div>
                <div className="destination-tile-cards">{this.slidesMVP()}</div>
                {tileCount > this.state.slidesDisplayed && (
                    <CarouselControls
                        activeSlide={this.state.activeSlide}
                        totalSlides={this.state.totalSlide}
                        dividerText={this.props.labels.ofLabel}
                        disabledPrev={this.state.disablePrev}
                        disabledNext={this.state.disableNext}
                        prevSlide={this.previousSlide}
                        nextSlide={this.nextSlide}
                        previousLabel={previousLabel}
                        nextLabel={nextLabel}
                        tabIndex={-1}
                    />
                )}
            </div>
        );
    }
}

export default sliderRecommendedShorex;
