'use strict';

import React from 'react';
import Link from '../commons/CUK/link';
import Title from '../titleH1Mycruise';
import { renderBgStyle } from '../commons/CUK/utilities';
import analytics from '../commons/CUK/analytics';
import CarouselControls from '../commons/CUK/carouselControls';
import extractChildComponent from '../commons/CUK/extractChildComponent';
import ValidateSession from '../commons/CUK/validateSession';

import {
    VIEWPORT_TYPE,
    watchForBreakpoint,
    breakpointsMax as Breakpoints
} from '../../library/js/config/breakpoints';
import FetchData from '../commons/CUK/fetch-data';
import SessionStorage from '../commons/CUK/session-storage';
import Carousel from './carousel';

class storyRotatorMycruise extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            activeSlide: 0,
            isLVP: false,
            isMVP: false,
            slideWidth: '500',
            additionalStoryList: []
        };
        this.settings = {
            accessibility: true,
            arrows: false,
            dots: false,
            infinite: false,
            slidesToShow: 1,
            slidesToScroll: 1,
            swipe: false,
            beforeChange: this.handleSwipe,
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
        this.handleResize();
        const { additionalContent } = this.props;
        // analytics.clickTracking(this);
        window.addEventListener('resize', this.handleResize);

        if (!ValidateSession.checkCookie(['wcmmode'])) {
            additionalContent && this.handleAdditionalContent();
        }
    }

    componentDidUpdate() {
        // analytics.clickTracking(this);
    }

    handleAdditionalContent() {
        const {
            additionalContentSelector,
            additionalContentServlet
        } = this.props;
        const userData = SessionStorage.getItem('userData');
        const { shipCode } = userData;
        const url = `${additionalContentServlet}.${additionalContentSelector}.${shipCode}.json`;
        FetchData(url, { method: 'GET' })
            .then((res) => {
                const { storyList } = res;
                storyList &&
                    storyList.length > 0 &&
                    this.setState(() => ({ additionalStoryList: storyList }));
            })
            .finally(() => {
                window.dispatchEvent(new Event('resize'));
            });
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
    }
    resetSliderScroll = () => {
        this.sliderContainer.scrollLeft > 0
            ? (this.sliderContainer.scrollLeft = 0)
            : null;
    };

    handleResize = () => {
        const mqlLVP = watchForBreakpoint(VIEWPORT_TYPE.DESKTOP);
        const mqlMVP = watchForBreakpoint(VIEWPORT_TYPE.TABLET_L, true);
        this.setState({
            slideWidth: this.refs.infoCard.offsetWidth,
            isLVP: mqlLVP.matches,
            isMVP: mqlMVP.matches
        });
    };

    handleSwipe = (event, slick) => {
        this.setState({
            activeSlide: slick
        });
    };

    prevSlide = () => {
        this.handleActiveSlide(this.state.activeSlide - 1, 'previous');
    };

    nextSlide = () => {
        this.handleActiveSlide(this.state.activeSlide + 1, 'next');
    };

    handleActiveSlide = (activeSlideChange, currentState) => {
        setTimeout(() => {
            this.setState({
                activeSlide: activeSlideChange
            });
            this.handleImageSlideChange(this.state.activeSlide);
            if (currentState === 'previous') {
                this.carousel.slider.slickPrev();
            } else if (currentState === 'next') {
                this.carousel.slider.slickNext();
            }
        }, 500);
    };
    /**
     * handleTab - to handle tabbing
     *
     * @param {object} e - event object
     * @param {string} container - container string
     */
    handleTab = (e, container) => {
        const slideCount = this.props.storyList.length;
        const { activeSlide } = this.state;

        if (e.keyCode === 9) {
            e.stopPropagation();
            if (e.shiftKey && container === 'title' && !(activeSlide === 0)) {
                this.prevSlide();
            } else if (
                !e.shiftKey &&
                container === 'link' &&
                !(activeSlide === slideCount - 1)
            ) {
                this.nextSlide();
            }
        }
    };
    renderCta(items, titleValue, index) {
        const { infoCardCta } = items;
        const { label, url } = infoCardCta;
        if (label.length && url.length) {
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
        this.setState({
            activeSlide: currentSlide
        });
    };

    renderNav() {
        const {
            infoCardAlignement,
            dividerText,
            storyList,
            previousLabel,
            nextLabel
        } = this.props;
        const { activeSlide, additionalStoryList } = this.state;
        const slideCount = storyList.length + additionalStoryList.length;

        return (
            <div className={`custom-nav ${infoCardAlignement}`}>
                <CarouselControls
                    activeSlide={activeSlide + 1}
                    totalSlides={slideCount}
                    previousLabel={previousLabel}
                    nextLabel={nextLabel}
                    tabIndex={-1}
                    dividerText={dividerText}
                    disabledPrev={!activeSlide}
                    disabledNext={activeSlide === slideCount - 1}
                    prevSlide={this.prevSlide}
                    nextSlide={this.nextSlide}
                />
            </div>
        );
    }

    renderTitle() {
        const { childComponents } = this.props;
        const titleH1Props = extractChildComponent(
            childComponents,
            'titleH1Mycruise'
        );
        return (
            <div className="title-container">
                {titleH1Props && <Title {...titleH1Props.attributes} />}
            </div>
        );
    }

    renderStoryList = (items, i) => {
        const { title, desc, infoCardCta } = items;
        const { slideWidth, activeSlide } = this.state;
        const slideStyle = {};
        slideStyle.width = `${slideWidth}px`;
        const activeClass = activeSlide === i ? 'active' : '';
        return (
            <div
                className="slide"
                key={`slider-${i}`}
                tabIndex="0"
                onKeyDown={(e) => this.handleTab(e, 'title')}
            >
                <div
                    style={slideStyle}
                    className={`content-holder ${activeClass}`}
                    key={i}
                >
                    <div className="title">
                        <h3>{title}</h3>
                    </div>
                    <div className="description">
                        <p>{desc}</p>
                    </div>
                    {infoCardCta && this.renderCta(items, title, i)}
                </div>
            </div>
        );
    };

    render() {
        const {
            storyList,
            infoCardAlignement,
            showTexture,
            texture
        } = this.props;
        const { activeSlide, slideWidth, additionalStoryList } = this.state;
        let textureStyle = {};

        if (showTexture === 'true' && texture.length) {
            textureStyle.backgroundImage = renderBgStyle(
                texture
            ).backgroundImage;
            textureStyle.backgroundSize = 'cover';
            textureStyle.backgroundPosition = '50%';
        }

        const scrollPosition = { left: `-${activeSlide * slideWidth}px` };

        const theStoryList = [...storyList, ...additionalStoryList];
        const carouselProps = { ...this.props, storyList: theStoryList };

        return (
            theStoryList.length > 0 && (
                <div className="story-rotator">
                    {this.renderTitle()}
                    <div className="image-rotator">
                        <Carousel
                            ref={(c) => (this.carousel = c)}
                            renderCTA={this.renderCta}
                            handleSwipe={this.handleSwipe}
                            {...carouselProps}
                        />
                        <div className="info-card-wrap">
                            <div
                                ref="infoCardHolder"
                                className={`info-card-holder ${infoCardAlignement}`}
                                style={textureStyle}
                            >
                                <div className="info-card-background">
                                    <div className="info-card" ref="infoCard">
                                        <div
                                            className="position-adjust"
                                            ref={(sliderContainer) =>
                                                (this.sliderContainer = sliderContainer)
                                            }
                                            onScroll={this.resetSliderScroll}
                                        >
                                            <div
                                                style={scrollPosition}
                                                className="slides-holder"
                                            >
                                                {theStoryList.map(
                                                    this.renderStoryList
                                                )}
                                            </div>
                                        </div>

                                        {theStoryList.length > 1 &&
                                            this.renderNav()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        );
    }
}

storyRotatorMycruise.defaultProps = {
    infoCardAlignement: 'right'
};

export default storyRotatorMycruise;
