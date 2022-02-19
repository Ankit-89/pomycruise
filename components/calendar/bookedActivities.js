'use strict';

import React from 'react';
import Slider from 'react-slick';
import CarouselControls from '../commons/CUK/carouselControls';
import {
    VIEWPORT_TYPE,
    watchForBreakpoint,
    breakpointsMax as Breakpoints
} from '../../library/js/config/breakpoints';
import analytics from '../commons/CUK/analytics';

class bookedActivities extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            showCarousel: true,
            activeSlide: 1,
            tileChildObj: '',
            isLVP: true,
            totalEvents: this.props.data.length,
            totalSlide: this.props.data.length,
            disableNext: false,
            disablePrev: true,
            slidesDisplayed: this.props.data.length
        };
        this.settings = {
            accessibility: true,
            dots: false,
            infinite: false,
            arrows: false,
            slidesToShow: 2,
            slidesToScroll: 2,
            swipe: true,
            centerPadding: 0,
            afterChange: this.setActiveSlide,
            responsive: [
                {
                    breakpoint: Breakpoints.tablet,
                    settings: {
                        slidesToShow: 1,
                        slidesToScroll: 1,
                        centerMode: true
                    }
                }
            ]
        };
    }
    componentDidMount() {
        const mqlLVP = watchForBreakpoint(VIEWPORT_TYPE.TABLET);

        this.handleResize(mqlLVP);

        mqlLVP.addListener((mql) => {
            this.handleResize(mql);
        });

        //added to risolve slick bug on first load
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 1000);
        // analytics.clickTracking(this);
    }

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
    handleResize = (mql) => {
        if (
            watchForBreakpoint(VIEWPORT_TYPE.DESKTOP).matches ||
            watchForBreakpoint(VIEWPORT_TYPE.TABLET_L).matches ||
            watchForBreakpoint(VIEWPORT_TYPE.TABLET).matches
        ) {
            this.setState({
                totalSlide: Math.ceil(this.state.totalEvents / 2),
                isLVP: true,
                slidesDisplayed: 2
            });
        } else {
            this.setState({
                totalSlide: this.state.totalEvents,
                isLVP: false,
                slidesDisplayed: 1
            });
        }
        this.setActiveSlide();
    };
    convertEventType = (typeEvent) => {
        let type = '';
        typeEvent = typeof typeEvent !== 'string' ? typeEvent.$ : typeEvent;

        switch (typeEvent) {
            case 'SHOREX_EVENT':
                type = 'shorex';
                break;
            case 'GIFT_EVENT':
                type = 'gift';
                break;
            case 'DINING_EVENT':
            case 'DININGBASED_EVENT':
                type = 'dining';
                break;
            case 'SPA_EVENT':
            case 'SPAPACKAGE_EVENT':
                type = 'spa';
                break;
            case 'SERVICES_EVENT':
                type = 'services';
                break;
            case 'HOTEL_EVENT':
                type = 'hotel';
                break;
            case 'FLIGHT_EVENT':
                type = 'flight';
                break;
            case 'TRANSFER_EVENT':
                type = 'transfer';
                break;
            case 'ALLINCLUSIVE_EVENT':
            case 'AIBEVERAGE_EVENT':
            case 'ALL_INCLUSIVE_BEVERAGE_KIDS':
            case 'ALL_INCLUSIVE_BEVERAGE_ALCOHOL_90':
            case 'ALL_INCLUSIVE_BEVERAGE_NON_ALCOHOL':
                type = 'drink';
                break;
        }

        return type;
    };

    createSlides = () => {
        let slides = this.props.data.map((slide, index) => {
            let customEventType = this.convertEventType(slide.eventType);
            return (
                <div className="event-wrapper" key={index}>
                    <div className="event">
                        <header className="event__header">
                            <span
                                className={`event__icon ${customEventType}`}
                            />
                            <span className="event__label">
                                {slide.name}
                            </span>
                        </header>
                        <div className="event__body">
                            {/* <span className='event__hour'>{customHour}</span> */}
                            {/* {eventDuration && eventDuration > 1 &&
                                    <span className='event__duration'>{eventDurationLabel}</span>
                                } */}
                            {/* <a href="#" className="event__name">
                                {slide.description}
                            </a> */}
                            {/* <p className='event__subname'>{eventDesc}</p> */}
                            <span className="guest__icon" />
                            {/* {recipientPassengers &&
                                    <div className="event__guest">
                                    {guestNumbers}
                                    <span className="guest__icon"></span>
                                    </div>
                                } */}
                        </div>
                    </div>
                </div>
            );
        });
        return slides;
    };

    render() {
        const { attributes, data } = this.props;
        const { labels } = attributes;

        // let ctaUrl =
        //     typeof window !== 'undefined' ? window.configs.ordersPageUrl : '#';

        return (
            data.length > 0 && (
                <div className="bookedActivities">
                    <h1>{labels.titleLabel}</h1>
                    <Slider ref={(c) => (this.slider = c)} {...this.settings}>
                        {this.createSlides()}
                    </Slider>
                    <CarouselControls
                        activeSlide={this.state.activeSlide}
                        totalSlides={this.state.totalSlide}
                        disabledPrev={this.state.disablePrev}
                        disabledNext={this.state.disableNext}
                        prevSlide={this.previousSlide}
                        nextSlide={this.nextSlide}
                        previousLabel={'prev'}
                        nextLabel={'next'}
                        tabIndex={-1}
                        dataComponentName={this.props.type}
                        dataLinktextprev={'bookedActivities:slide:prev'}
                        dataLinktextnext={'bookedActivities:slide:next'}
                    />
                    {/* <a
                        href={ctaUrl}
                        className="cta-secondary"
                        data-linktext={labels.ctaLabel}
                        data-componentname={this.props.type}
                    >
                        {labels.ctaLabel}
                    </a> */}
                </div>
            )
        );
    }
}

export default bookedActivities;
