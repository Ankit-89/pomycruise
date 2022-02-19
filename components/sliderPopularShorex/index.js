'use strict';

import React from 'react';
import Slider from 'react-slick';
import TitleH1Mycruise from '../../components/titleH1Mycruise';
import EmptyState from '../../components/commons/CUK/emptyState';
import ShorexCard from '../../components/shorexCard';
import analytics from '../commons/CUK/analytics';
import equalizer from '../commons/CUK/equalizer';
import CarouselControls from '../commons/CUK/carouselControls';
import {
    VIEWPORT_TYPE,
    watchForBreakpoint,
    breakpointsMax as Breakpoints
} from '../../library/js/config/breakpoints';
import fetchData from '../commons/CUK/fetch-data';
import SessionStorage from '../commons/CUK/session-storage';
import extractChildComponent from '../commons/CUK/extractChildComponent';
import { getConfig, convertValueToVaildDecimalPoint } from '../commons/CUK/utilities';
import validateSession from '../commons/CUK/validateSession';

class sliderPopularShorex extends React.Component {
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
            slidesDisplayed: 1,
            totalTiles: 0,
            showEmptyState: false
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
        // analytics.clickTracking(this);
        const mqlLVP = watchForBreakpoint(VIEWPORT_TYPE.DESKTOP);

        this.handleResize(mqlLVP);

        mqlLVP.addListener(this.handleResize);
        const container = this.sliderPopularShorex
            ? this.sliderPopularShorex
            : false;

        let cardTextContent = container
            ? container.querySelectorAll('.sliderPopularShorex .text-content')
            : false;

        if (cardTextContent) {
            window.requestAnimationFrame(() => {
                equalizer(cardTextContent);
            });
        }

        equalizer(cardTextContent);
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

    destinationTileArray = () => {
        const { services } = this.props;
        const { productSearchApi } = services.urls;
        const productType = 'SHOREX';
        const pageSize = 1;
        let url = `${productSearchApi}?productType=${productType}&pageSize=${pageSize}`;
        const configs = typeof window !== 'undefined' ? window.configs : {};
        const apiKey = configs.apikeyMycruise;
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
        // check if there is ANY shorex
        fetchData(url, {
            method: 'GET',
            headers: {
                'X-CommonData': JSON.stringify(header),
                'X-Source-Identity-Token-0': apiKey
            }
        }).then((response) => {
            let tileArray = response.products;
            if (tileArray.length > 0) {
                // if there's more than one shorex, check if there are some popular one
                const query =
                    ':merchandised:merchandisingCategoryCodes:BESTSELLER';
                const pageSize = 6;
                url = `${productSearchApi}?productType=${productType}&pageSize=${pageSize}&query=${query}`;
                fetchData(url, {
                    method: 'GET',
                    headers: {
                        'X-CommonData': JSON.stringify(header),
                        'X-Source-Identity-Token-0': apiKey
                    }
                }).then((response) => {

                    let tileArrayPopular = response.products;

                    let productArr = [];
                    tileArrayPopular.forEach((product, index) => {

                        const singleProduct = {
                            listPosition: index,
                            productID: product.code && product.code,
                            productName: product.name && product.name,
                            productType: product.productType && product.productType,
                            startDateTime: new Date().toString(),
                            available: product.stock && product.stock.stockLevelStatus,
                            shorexAttributes: {
                                portName: product.productType === 'SHOREX' ? product.port.shortName : '',
                                activityLevel: product.productType === 'SHOREX' ? product.activityLevel : '',
                                language: product.productType === 'SHOREX' ? '' : '',
                                duration: product.productType === 'SHOREX' ? product.duration : '',
                                transport: product.productType === 'SHOREX' ? '' : '',
                                minAge: product.productType === 'SHOREX' ? '' : '',
                                maxAge: product.productType === 'SHOREX' ? '' : '',
                                tourType: product.productType === 'SHOREX' ? '' : '',
                                tourCategory: product.productType === 'SHOREX' ? '' : '',
                                tourFeatures: product.productType === 'SHOREX' ? '' : ''
                            },
                            diningCategory: '',
                            unitPrice_GBP: product.fromPrice && product.fromPrice.value? convertValueToVaildDecimalPoint(product.fromPrice.value) : '',
                            unitPrice_local: product.fromPrice && product.fromPrice.value? convertValueToVaildDecimalPoint(product.fromPrice.value) : '',
                        }
                        productArr.push(singleProduct);
                    })

                    const myCruiseBlockData = {
                        blockName: "MostPopular",
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
                        totalTiles: tileArrayPopular.length,
                        tileChildObj: tileArrayPopular
                    });
                    if (
                        tileArrayPopular.length <=
                        this.carousalSettings.carousalShownLVP
                    ) {
                        this.settings.responsive[3].settings = 'unslick';
                        this.settings.responsive[4].settings = 'unslick';
                    }

                    this.constructJSON(tileArrayPopular);
                    this.handleResize();
                });
            } else {
                // else, show the empty state
                this.setState({
                    showEmptyState: true
                });
            }
        });
    };

    slidesMVP = () => {
        return this.state.tileChildObj.map((items, i) => {
            let imageUrl = items.primaryImageUrl;
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

            items = { ...items, image };
            const overlayProps = extractChildComponent(
                this.props.childComponents,
                'shorexOverlay'
            );

            return (
                <div key={i} className="destination-tile-wrapper">
                    <ShorexCard
                        key={i}
                        index={i}
                        {...items}
                        overlay={overlayProps}
                        services={this.props.services}
                        labels={this.props.labels}
                        languages={overlayProps.attributes.guideLanguages}
                        blockName={'MostPopular'}
                    />
                </div>
            );
        });
    };

    render() {
        const { childComponents, labels } = this.props;
        const { previousLabel, nextLabel } = this.props.labels;
        const tileCount = this.state.totalTiles;

        const shorexListingUrl = getConfig('shorexListingUrl', '');
        // const bgColor = ( backgroundColor ) ? '' : ' bg';
        const columnClass = tileCount > 2 ? ' col-3' : ' col-2';
        const emptyState = extractChildComponent(childComponents, 'emptyState');

        return tileCount > 0 || validateSession.checkCookie(['wcmmode']) ? (
            <div
                className={`three-up-container${columnClass}`}
                ref={(sliderPopularShorex) =>
                    (this.sliderPopularShorex = sliderPopularShorex)
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
                <div className="destination-tile-cards">
                    <Slider ref={(c) => (this.slider = c)} {...this.settings}>
                        {this.slidesMVP()}
                    </Slider>
                </div>
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
                <div className="cta-container">
                    <a
                        href={shorexListingUrl}
                        className="cta-primary"
                        data-linktext={'label: ' + labels.viewAllLabel}
                        data-componentname={this.props.type}
                    >
                        {labels.viewAllLabel}
                    </a>
                </div>
            </div>
        ) : (
                this.state.showEmptyState && (
                    <EmptyState
                        {...emptyState.attributes}
                        className="shorexEmpty"
                    />
                )
            );
    }
}

export default sliderPopularShorex;
