'use strict';

import React from 'react';
import Link from '../commons/CUK/link';
import Tabs from '../commons/CUK/tabs';
import Pane from '../commons/CUK/pane';
import TitleH1Mycruise from '../titleH1Mycruise';
import { renderBgStyle } from '../commons/CUK/utilities';
import analytics from '../commons/CUK/analytics';
import CarouselControls from '../commons/CUK/carouselControls';
import extractChildComponent from '../commons/CUK/extractChildComponent';

import {
    VIEWPORT_TYPE,
    watchForBreakpoint,
    breakpointsMax as Breakpoints
} from '../../library/js/config/breakpoints';

import Carousel from './carousel';

class tabRotator extends React.Component {
    constructor(props) {
        super(props);
        this.mqlLVP = false;
        this.prevSlide = this.prevSlide.bind(this);
        this.nextSlide = this.nextSlide.bind(this);
        // this.handleImageSlideChange = this.handleImageSlideChange.bind(this);

        this.state = {
            isLVP: false,
            isMVP: false,
            slideWidth: '500',
            activeTabs: 0,
            activeSlides: {
                0: 0,
                1: 0,
                2: 0
            }
        };
        this.settings = {
            accessibility: true,
            arrows: false,
            dots: false,
            infinite: false,
            slidesToShow: 1,
            slidesToScroll: 1,
            swipe: false,
            // beforeChange: this.handleSwipe,
            responsive: [
                {
                    breakpoint: Breakpoints.mobileLandscape,
                    settings: {
                        swipe: this.handleSwipe
                    }
                },
                {
                    breakpoint: Breakpoints.tabletLandscape,
                    settings: {
                        swipe: this.handleSwipe
                    }
                }
            ]
        };
    }

    componentDidMount() {
        // analytics.clickTracking(this);
        setTimeout(() => {
            this.handleResize();
        }, 500);

        window.addEventListener('resize', this.handleResize);
        window.addEventListener('tabSelect', (e) => this.setActiveTab(e));
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 200);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
        window.removeEventListener('tabSelect', (e) => this.setActiveTab(e));
    }
    setActiveTab(event) {
        const {
            detail: [componentName, activeTabIndex]
        } = event;
        if (componentName === 'tabRotator') {
            this.setState(
                () => ({
                    activeTabs: activeTabIndex
                }),
                () => {
                    setTimeout(() => {
                        window.dispatchEvent(new Event('resize'));
                    }, 0);
                }
            );
        }
    }
    resetSliderScroll = () => {
        const { scrollLeft } = this.sliderContainer;
        this.sliderContainer.scrollLeft = scrollLeft > 0 ? 0 : scrollLeft;
    };
    handleResize = (index) => {
        const mqlLVP = watchForBreakpoint(VIEWPORT_TYPE.DESKTOP);
        const mqlMVP = watchForBreakpoint(VIEWPORT_TYPE.TABLET_L, true);
        this.setState((state) => ({
            slideWidth: this.refs['infoCard' + state.activeTabs].offsetWidth,
            isLVP: mqlLVP.matches,
            isMVP: mqlMVP.matches
        }));
    };

    handleSwipe = (event, slick) => {
        const { activeTabs, activeSlides } = this.state;
        activeSlides[activeTabs] = slick;
        this.setState(() => ({
            activeSlides
        }));
    };

    prevSlide = (index) => {
        this.handleActiveSlide(
            this.state.activeSlides[index] - 1,
            'previous',
            index
        );
    };

    nextSlide = (index) => {
        this.handleActiveSlide(
            this.state.activeSlides[index] + 1,
            'next',
            index
        );
    };

    handleActiveSlide = (activeSlideChange, currentState, index) => {
        const { activeSlides } = this.state;
        activeSlides[index] = activeSlideChange;

        setTimeout(() => {
            this.setState(
                () => ({
                    activeSlides
                }),
                () => {
                    const slider = this.refs['carousel' + index].slider;
                    this.handleImageSlideChange(activeSlides);
                    if (currentState === 'previous') {
                        slider.slickPrev();
                    } else if (currentState === 'next') {
                        slider.slickNext();
                    }
                }
            );
        }, 500);
    };
    /**
     * handleTab - to handle tabbing
     *
     * @param {object} e - event object
     * @param {string} container - container string
     */
    handleTab = (e, container, index) => {
        const { activitiesList } = this.props;
        const { activeSlides } = this.state;
        const slideCount = activitiesList[index].storyList.length;

        if (e.keyCode === 9) {
            e.stopPropagation();
            if (
                e.shiftKey &&
                container === 'title' &&
                !(activeSlides[index] === 0)
            ) {
                this.prevSlide();
            } else if (
                !e.shiftKey &&
                container === 'link' &&
                !(activeSlides[index] === slideCount - 1)
            ) {
                this.nextSlide();
            }
        }
    };
    renderCta(items, titleValue, index) {
        const { infoCardCta } = items;
        const { label, url } = infoCardCta;
        if (label && url) {
            return (
                <div
                    className="cta-holder"
                    onKeyDown={(e) => this.handleTab(e, 'link')}
                >
                    <Link
                        ariaLabel={`${titleValue}, ${label}`}
                        dataLinktext={`${titleValue}:${index + 1}:${label}`}
                        {...infoCardCta}
                    >
                        <span>{label}</span>
                    </Link>
                </div>
            );
        }

        return null;
    }

    handleImageSlideChange = (currentSlide) => {
        this.setState(() => ({
            activeSlides: currentSlide
        }));
    };

    renderNav(slideCount, index) {
        const {
            previousLabel,
            nextLabel,
            infoCardAlignment,
            dividerText
        } = this.props;
        const { activeSlides } = this.state;
        return (
            <div className={`custom-nav ${infoCardAlignment}`}>
                <CarouselControls
                    activeSlide={activeSlides[index] + 1}
                    totalSlides={slideCount}
                    previousLabel={previousLabel}
                    nextLabel={nextLabel}
                    tabIndex={-1}
                    dividerText={dividerText}
                    disabledPrev={!activeSlides[index]}
                    disabledNext={activeSlides[index] === slideCount - 1}
                    prevSlide={() => this.prevSlide(index)}
                    nextSlide={() => this.nextSlide(index)}
                />
            </div>
        );
    }

    renderTitle = () => {
        const { childComponents } = this.props;
        const titleProps = extractChildComponent(
            childComponents,
            'titleH1Mycruise'
        );
        return titleProps ? (
            <div className="title-container">
                <TitleH1Mycruise {...titleProps.attributes} />
            </div>
        ) : null;
    };

    generateSlide = (items, i, index) => {
        const { title, desc } = items;
        const { slideWidth, activeSlides } = this.state;
        const width = `${slideWidth}px`;
        const slideStyle = { width };
        const slideClassName = activeSlides[index] === i ? 'active' : '';
        return (
            <div
                className="slide"
                key={`slider-${i}`}
                tabIndex={i}
                // onKeyDown={(
                //     e
                // ) =>
                //     this.handleTab(
                //         e,
                //         'title', index
                //     )
                // }
            >
                <div
                    style={slideStyle}
                    className={`content-holder ${slideClassName}`}
                    key={i}
                >
                    <div className="title">
                        <h3>{title}</h3>
                    </div>
                    <div className="description">
                        <p>{desc}</p>
                    </div>
                    {this.renderCta(items, title, i)}
                </div>
            </div>
        );
    };

    generatePane = (activity, index) => {
        const { name, storyList } = activity;
        const { infoCardAlignment, showTexture, texture } = this.props;
        const { activeSlides, slideWidth } = this.state;
        const scrollPosition = [0, 1, 2].reduce((slidesObj, id) => {
            slidesObj[id] = { left: `-${activeSlides[id] * slideWidth}px` };
            return slidesObj;
        }, {});
        const textureStyle =
            showTexture === 'true' && texture.length
                ? {
                      backgroundImage: renderBgStyle(texture).backgroundImage,
                      backgroundSize: 'cover',
                      backgroundPosition: '50%'
                  }
                : {};
        return (
            <Pane
                title={name}
                componentName="tabRotator"
                className="image-rotator"
                key={index}
            >
                <Carousel
                    ref={'carousel' + index}
                    handleSwipe={this.handleSwipe}
                    {...activity}
                />
                <div className="info-card-wrap">
                    <div
                        ref="infoCardHolder"
                        className={`info-card-holder ${infoCardAlignment}`}
                        style={textureStyle}
                    >
                        <div className="info-card-background">
                            <div className="info-card" ref={`infoCard${index}`}>
                                <div
                                    className="position-adjust"
                                    ref={(sliderContainer) =>
                                        (this.sliderContainer = sliderContainer)
                                    }
                                    onScroll={this.resetSliderScroll}
                                >
                                    <div
                                        style={scrollPosition[index]}
                                        className="slides-holder"
                                    >
                                        {storyList.map((items, i) =>
                                            this.generateSlide(items, i, index)
                                        )}
                                    </div>
                                </div>

                                {storyList.length > 1 &&
                                    this.renderNav(storyList.length, index)}
                            </div>
                        </div>
                    </div>
                </div>
            </Pane>
        );
    };

    render() {
        const { activitiesList } = this.props;
        const { activeTabs } = this.state;
        return (
            <div className="story-rotator">
                {this.renderTitle()}
                {activitiesList.length > 0 && (
                    <Tabs
                        selected={activeTabs}
                        componentName={this.props.componentName}
                    >
                        {activitiesList.map((activity, index) =>
                            this.generatePane(activity, index)
                        )}
                    </Tabs>
                )}
            </div>
        );
    }
}
tabRotator.defaultProps = {
    infoCardAlignment: 'right'
};

export default tabRotator;
