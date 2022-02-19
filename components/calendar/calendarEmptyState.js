'use strict';

import React from 'react';
import Slider from 'react-slick';
import CarouselControls from '../commons/CUK/carouselControls';
import Image from '../commons/CUK/image';
import {
    VIEWPORT_TYPE,
    watchForBreakpoint,
    breakpointsMax as Breakpoints
} from '../../library/js/config/breakpoints';
import FetchData from '../commons/CUK/fetch-data';

class calendarEmptyState extends React.Component {
    constructor(props) {
        super(props);
        const { dayType } = this.props;

        this.state = {
            dayType: dayType,
            activeSlide: 1,
            tileChildObj: '',
            isLVP: true,
            totalEvents: 3,
            totalSlide: 1,
            disableNext: false,
            disablePrev: true,
            slidesDisplayed: 3
        };
        this.settings = {
            accessibility: true,
            dots: false,
            infinite: false,
            arrows: false,
            slidesToShow: 3,
            slidesToScroll: 3,
            swipe: true,
            afterChange: this.setActiveSlide,
            responsive: [
                {
                    breakpoint: Breakpoints.mobileLandscape,
                    settings: {
                        slidesToShow: 1,
                        slidesToScroll: 1,
                        centerMode: true,
                        swipe: true,
                        centerPadding: '0px'
                    }
                },
                {
                    breakpoint: Breakpoints.tablet,
                    settings: {
                        slidesToShow: 2,
                        slidesToScroll: 2,
                        centerMode: false,
                        swipe: true,
                        centerPadding: '0px'
                    }
                }
            ]
        };
    }
    componentDidMount() {
        // const mqlLVP = watchForBreakpoint( VIEWPORT_TYPE.DESKTOP );

        this.handleResize();
        window.addEventListener('resize', this.handleResize);

        // window.addEventListener('resize', this.handleResize.bind(this));
    }
    nextSlide = () => {
        this.sliderEs.slickNext();
    };

    previousSlide = () => {
        this.sliderEs.slickPrev();
    };

    goToSlide = (slide) => {
        this.sliderEs.slickGoTo(slide);
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
            watchForBreakpoint(VIEWPORT_TYPE.TABLET_L).matches
        ) {
            this.setState({
                totalSlide: Math.ceil(this.state.totalEvents / 3),
                isLVP: true,
                slidesDisplayed: 3
            });
        } else if (watchForBreakpoint(VIEWPORT_TYPE.TABLET).matches) {
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
        let activeSlide = 1;
        const disableNext = activeSlide === this.state.totalEvents;
        const disablePrev = activeSlide === 1;

        this.setState({
            activeSlide,
            disableNext,
            disablePrev
        });
    };

    componentWillMount() {
        const { port, attributes } = this.props;

        this.setState({
            portImage: port.image,
            portName: port.name,
            portDescription: port.longDescription
        });
    }
    renderPortDay() {
        let generalData = this.props.attributes;
        // let image = portData.image;
        const shorexListingUrl =
            typeof window !== 'undefined'
                ? window.configs.shorexListingUrl
                : '';

        return (
            <div className="calendarDay__emptyState calendarDay__emptyState--port">
                <header className="calendarDay__emptyStateHeader">
                    <span className="calendarDay__emptyStateIcon" />
                    <h3 className="calendarDay__emptyStateText">
                        {generalData.labels.titleLabel}
                    </h3>
                    <p className="calendarDay__emptyStateSubtext">
                        {generalData.labels.subtitleLabel}
                    </p>
                </header>
                <div className="calendarDay__emptyStateContent">
                    <div className="textImage">
                        <div className="full-image">
                            {this.state.portImage && (
                                <Image {...this.state.portImage} />
                            )}
                        </div>
                        <div className="conf-wrap">
                            <div className="textImage__text">
                                <h5 className="textImage__title">
                                    {this.state.portName}
                                </h5>
                                <p 
                                    className="textImage__par"
                                    dangerouslySetInnerHTML={{
                                        __html: this.state.portDescription
                                    }}
                                />
                                <a className='cta-secondary' href={shorexListingUrl}>{(generalData.labels.hasOwnProperty('seeAllShorexLabel')) ? generalData.labels.seeAllShorexLabel : 'SEE ALL SHORE EXCURSIONS'}</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div >
        );
    }

    renderSeaDay() {
        let generalData = this.props.attributes;

        return (
            <div className="calendarDay__emptyState calendarDay__emptyState--seaDay">
                <header className="calendarDay__emptyStateHeader">
                    <span className="calendarDay__emptyStateIcon" />
                    <h3 className="calendarDay__emptyStateText" dangerouslySetInnerHTML={{ __html: generalData.labels.titleLabel }}>
                    </h3>
                    <p className="calendarDay__emptyStateSubtext">
                        {generalData.labels.subtitleLabel}
                    </p>
                </header>
                <div className="calendarDay__emptyStateContent">
                    <Slider ref={(c) => (this.sliderEs = c)} {...this.settings}>
                        {generalData.sea.slider.map((slide, index) => {
                            return (
                                <div
                                    className="calendarDay__discoverWrapper"
                                    key={index}
                                >
                                    <div className="calendarDay__discoverItem">
                                        {slide.image && (
                                            <Image {...slide.image} />
                                        )}
                                        <div className="discoverItem__content">
                                            <h4 className="discoverItem__title">
                                                {slide.titleLabel}
                                            </h4>
                                            <p className="discoverItem__text">
                                                {slide.subtitleLabel}
                                            </p>
                                            <a
                                                href={slide.slideCta.url}
                                                className="discoverItem__link"
                                            >
                                                {slide.slideCta.label}
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </Slider>
                    {this.state.slidesDisplayed < 3 && (
                        <CarouselControls
                            activeSlide={this.state.activeSlide}
                            totalSlides={this.state.totalSlide}
                            disabledPrev={this.state.disablePrev}
                            disabledNext={this.state.disableNext}
                            prevSlide={this.previousSlide}
                            nextSlide={this.nextSlide}
                            previousLabel="prev"
                            nextLabel="next"
                            tabIndex={-1}
                        />
                    )}
                </div>
            </div>
        );
    }

    render() {
        return (
            <div>
                {this.state.dayType === 'sea' && this.renderSeaDay()}
                {this.state.dayType === 'port' && this.renderPortDay()}
            </div>
        );
    }
}

calendarEmptyState.propTypes = {};

export default calendarEmptyState;
