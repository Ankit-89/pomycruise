'use strict';

import React from 'react';
import Slider from 'react-slick';
import TitleH1Mycruise from '../../components/titleH1Mycruise';
import HotelCard from '../../components/hotelCard';
import analytics from '../commons/CUK/analytics';
import equalizer from '../commons/CUK/equalizer';
import CarouselControls from '../commons/CUK/carouselControls';
import { breakpoint } from '../../library/js/config/index';
import SessionStorage from '../commons/CUK/session-storage';

const VIEWPORT_TYPE = breakpoint.VIEWPORT_TYPE;
const watchForBreakpoint = breakpoint.watchForBreakpoint;
const Breakpoints = breakpoint.breakpointsMax;

class sliderHotel extends React.Component {
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
            isRendered: false
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
                        centerPadding: '12px'
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
    }

    componentWillMount() {
        this.destinationTileArray();
    }

    componentDidMount() {
        // analytics.clickTracking(this);
        const mqlLVP = watchForBreakpoint(VIEWPORT_TYPE.DESKTOP);

        this.handleResize(mqlLVP);

        mqlLVP.addListener(this.handleResize);

        const container = this.sliderHotel;
        let cardTextContent = container
            ? container.querySelectorAll('.sliderHotel .text-content')
            : [];

        // equalizer(cardTextContent);

        typeof window !== 'undefined' && window.requestAnimationFrame(() => {
            equalizer(cardTextContent);
        });

        setTimeout(() => {
            typeof window !== 'undefined' && window.dispatchEvent(new Event('resize'));
            this.setState({
                isRendered: true
            });
        }, 1000);
    }
    componentDidUpdate() {
        // analytics.clickTracking(this);
        //added to risolve slick bug on first load
        // const container = this.sliderHotel;
        // if (
        //     container.getElementsByClassName('LinesEllipsis-ellipsis').length <=
        //     0
        // ) {
        //     setTimeout(() => {
        //         window.dispatchEvent(new Event('resize'));
        //     }, 1000);
        // }
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
        let i = 1;
        const tileArray = [];

        for (i; i < this.props.childComponents.length; i++) {
            if (
                this.props.childComponents[i] !== null &&
                this.props.childComponents[i].type === 'hotelCard'
            ) {
                tileArray.push(this.props.childComponents[i]);
            }
        }
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
    };

    slidesMVP = () => {
        const { hideLegalAccordion, showPriceInLegalModel } = this.props;
        const { itineraryCtaCopy, closeLabel } = this.props.labels;
        const legalModelOptions = {
            hideLegalAccordion,
            showPriceInLegalModel,
            itineraryCtaCopy,
            closeLabel
        };

        return (
            <Slider ref={(c) => (this.slider = c)} {...this.settings}>
                {this.state.tileChildObj.map((items, i) => (
                    <div key={i} className="destination-tile-wrapper">
                        <HotelCard
                            key={i}
                            index={i}
                            {...items.attributes}
                            {...legalModelOptions}
                            services={this.props.services}
                            {...this.props.labels}
                            isRendered={this.state.isRendered}
                        />
                    </div>
                ))}
            </Slider>
        );
    };

    show = () => {
        // find the embakation and desembarkation port in Sessionstorage
        const userData = SessionStorage.getItem('userData');

        if (userData) {
            const { embarkationCode, disembarkationCode } = userData;
            const ports = this.props.ports;

            let filteredPorts = ports
                ? ports.filter(
                      (port) =>
                          port === embarkationCode ||
                          port === disembarkationCode
                  )
                : [];

            return filteredPorts.length > 0;
        } else {
            return true;
        }
    };

    render() {
        const { backgroundColor, childComponents } = this.props;
        const tileCount = this.state.totalTiles;
        const bgColor = backgroundColor ? '' : ' bg';
        const columnClass = tileCount > 2 ? ' col-3' : ' col-2';

        return (
            this.show() && (
                <div
                    className={`three-up-container${columnClass}${bgColor}`}
                    ref={(sliderHotel) => (this.sliderHotel = sliderHotel)}
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
                        {this.state.tileChildObj.length > 0 && this.slidesMVP()}
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
                            previousLabel={this.props.labels.previousLabel}
                            nextLabel={this.props.labels.nextLabel}
                            tabIndex={-1}
                        />
                    )}
                </div>
            )
        );
    }
}

export default sliderHotel;
