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
import {
    VIEWPORT_TYPE,
    watchForBreakpoint,
    breakpointsMax as Breakpoints
} from '../../library/js/config/breakpoints';
import extractChildComponent from '../commons/CUK/extractChildComponent';
import validateSession from '../commons/CUK/validateSession';
import SessionStorage from '../commons/CUK/session-storage';

class sliderViewed extends React.Component {
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
            render: false
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
                        centerPadding: '24px'
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

        // window is not defined
        this.lang =
            typeof window !== 'undefined' && window.configs
                ? window.configs.locale
                : 'en_us';
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
        const container = this.sliderViewed;

        if (container) {
            let cardTextContent = container.querySelectorAll(
                '.sliderViewed .content-holder'
            );

            // equalizer(cardTextContent);

            window.requestAnimationFrame(() => {
                equalizer(cardTextContent);
            });
        }

        // analytics.clickTracking(this);
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
        const header = SessionStorage.getItem('header');
        const cruiseData = SessionStorage.getItem('cruiseData');
        const diningEventType = SessionStorage.getItem('diningEventType');
        const { bookingRef = '', customer } = header;
        const { firstName = '', lastName = '' } = customer;
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
        let tileArray = [];

        // from session storage we can receive the info of the recently viewed products

        tileArray = JSON.parse(localStorage.getItem('viewed'));
        // access items in that lang
        tileArray = tileArray ? tileArray[`${this.lang}_${bookingRef}_${firstName}_${lastName}`] : [];
        // if there are resutl in that lang, set state of the shorex list
        if (tileArray && tileArray.length > 0) {
            // check if product is already in recently viewed, if it is, we delete it to push it in first position
            tileArray.map((product, index) => {
                if (product.code === window.configs.productId) {
                    tileArray.splice(index, 1);
                }
            });
            if (tileArray && tileArray.length > 0) {

                let productArr = [];
                tileArray.forEach((product, index) => {
                    let diningCategory = '';
                    if (product.type && product.type == '"diningCard"') {
                        diningCategory = 'SelectDining';
                        if (product.name.includes('Limelight')) {
                            diningCategory = 'EventDining'
                        } else if (product.name.includes('Cookery')) {
                            diningCategory = 'CookeryClub'
                        }
                    }
                    let ProductType = '';
                    if (product.type && product.type === "shorexCard") {
                        ProductType = 'SHOREX'
                    } else if (product.type && product.type === "diningCard") {
                        ProductType = 'DINING'
                    } else if (product.type && product.type === "spaCard") {
                        ProductType = 'SPA'
                    }
                    const singleProduct = {
                        listPosition: index,
                        productID: product.code && product.code,
                        productName: product.name && product.name,
                        productType: ProductType,
                        startDateTime: new Date().toString(),
                        available: '',
                        shorexAttributes: {
                            portName: product.type === "shorexCard" ? '' : '',
                            activityLevel: product.type === "shorexCard" ? '' : '',
                            language: product.type === "shorexCard" ? '' : '',
                            duration: product.type === "shorexCard" ? '' : '',
                            transport: product.type === "shorexCard" ? '' : '',
                            minAge: product.type === "shorexCard" ? '' : '',
                            maxAge: product.type === "shorexCard" ? '' : '',
                            tourType: product.type === "shorexCard" ? '' : '',
                            tourCategory: product.type === "shorexCard" ? '' : '',
                            tourFeatures: product.type === "shorexCard" ? '' : ''
                        },
                        diningCategory: diningCategory,
                        unitPrice_GBP: '',
                        unitPrice_local: '',
                    }
                    productArr.push(singleProduct);
                })


                const myCruiseBlockData = {
                    blockName: "RecentlyViewed",
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
                    tileChildObj: tileArray,
                    render: true
                });
                this.constructJSON(tileArray);
            }
        }
        if (tileArray && tileArray.length <= this.props.carouselShownLVP) {
            this.settings.responsive[3].settings = 'unslick';
            this.settings.responsive[4].settings = 'unslick';
        }
    };

    returnCorrectCard(items, i) {
        switch (items.type) {
            case 'shorexCard':
                return (
                    <ShorexCard
                        key={i}
                        index={i}
                        {...items}
                        overlay={false}
                        services={this.props.services}
                        labels={this.props.labels}
                        blockName={'RecentlyViewed'}
                    />
                );
            case 'diningCard':
                return (
                    <DiningCard
                        key={i}
                        index={i}
                        {...items}
                        overlay={false}
                        services={this.props.services}
                        blockName={'RecentlyViewed'}
                        labels={this.props.labels}
                    />
                );
            case 'spaCard':
                return (
                    <SpaCard
                        key={i}
                        index={i}
                        {...items}
                        overlay={false}
                        services={this.props.services}
                        blockName={'RecentlyViewed'}
                        labels={this.props.labels}
                    />
                );
        }
    }

    slidesMVP = () => {
        return (
            <Slider ref={(c) => (this.slider = c)} {...this.settings}>
                {this.state.tileChildObj.map((items, i) => (
                    <div key={i} className="destination-tile-wrapper">
                        {this.returnCorrectCard(items, i)}
                    </div>
                ))}
            </Slider>
        );
    };

    render() {
        const { childComponents } = this.props;
        const { previousLabel, nextLabel } = this.props.labels;
        const tileCount = this.state.totalTiles;
        const columnClass = tileCount > 2 ? ' col-3' : ' col-2';
        const titleH1MycruiseProps = extractChildComponent(
            childComponents,
            'titleH1Mycruise'
        );

        // tileArray[lang].length --> verify if there are any shorex in that lang
        return (
            (this.state.render || validateSession.checkCookie(['wcmmode'])) && (
                <div
                    className={`three-up-container${columnClass}`}
                    ref={(sliderViewed) => (this.sliderViewed = sliderViewed)}
                >
                    <div className="tileH1-section">
                        {titleH1MycruiseProps && (
                            <TitleH1Mycruise
                                {...titleH1MycruiseProps.attributes}
                            />
                        )}
                    </div>
                    <div className="destination-tile-cards">
                        {this.slidesMVP()}
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
                </div>
            )
        );
    }
}

sliderViewed.defaultProps = {
    carouselShownLVP: 3
};

export default sliderViewed;
