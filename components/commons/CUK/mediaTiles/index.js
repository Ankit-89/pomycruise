'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import Image from '../image';
import Slider from 'react-slick';
import Link from '../link';
import analytics from '../analytics';
import videoplayer from '../videoplayer';
import { breakpoint } from '../../../../library/js/config/index';

const VIEWPORT_TYPE = breakpoint.VIEWPORT_TYPE;
const watchForBreakpoint = breakpoint.watchForBreakpoint;
const Breakpoints = breakpoint.breakpointsMax;

/**
 * generateMedia - Generate media
 *
 * @param {object} media Media object
 * {bool} onOverlay Generate on overlay or not
 * {bool} videoAutoplay Set video autoplay config
 * @param {function} onLoadHandler call back function on image load
 * @returns {html}
 */
export const generateMedia = (
    {
        media = {},
        onOverlay = false,
        videoAutoplay = false,
        videoMountCallback,
        galleryOpenLabel
    },
    onLoadHandler
) => {
    switch (media.mediaType) {
        case 'image':
            if (media.image) {
                return (
                    <div
                        className="image-holder"
                        data-contenttype="image"
                        aria-label={galleryOpenLabel ? galleryOpenLabel : ''}
                        data-contentname={media.image.alt}
                        data-linktext={media.image.alt}
                        tabIndex="0"
                        role="link"
                    >
                        {media.image && (
                            <Image
                                {...media.image}
                                onLoadHandler={onLoadHandler}
                                disableLazyLoad={true}
                            />
                        )}
                    </div>
                );
            } else {
                return <div className="image-holder" />;
            }

        case 'imageLink':
            let tilePosition = media.tilePosition;

            if (!tilePosition) {
                tilePosition = 'bottom-left';
            }
            if (media.image) {
                media.mediaCta.url =
                    media.mediaCta.url === '/'
                        ? 'javascript:void(0)'
                        : media.mediaCta.url;

                return (
                    <div className="image-holder">
                        <Link
                            {...media.mediaCta}
                            dataLinktext={`${media.imageCaption}:${
                                media.image.alt
                            }`}
                            dataContentname={media.imageCaption}
                            dataContenttype="image"
                            linkClassName={`gradient-${tilePosition}`}
                        >
                            {media.image && <Image {...media.image} />}
                        </Link>
                        <div className={`image-captions align-${tilePosition}`}>
                            <p>{media.imageCaption}</p>
                            {media.mediaCta.label !== '' && (
                                <Link
                                    {...media.mediaCta}
                                    ariaLabel={`${media.imageCaption} ${
                                        media.mediaCta.label
                                    }`}
                                    linkClassName="cta"
                                    dataLinktext={`${media.imageCaption}:${
                                        media.image.alt
                                    }`}
                                    dataContentname={media.imageCaption}
                                    dataContenttype="image"
                                />
                            )}
                        </div>
                    </div>
                );
            } else {
                return <div className="image-holder" />;
            }

        case '360Video':
        case 'threeSixtyImage':
            if (onOverlay && media.image) {
                return (
                    <div
                        className="threeSixtyImage-container"
                        data-linktext={`${media.imageCaption}:${
                            media.image.alt
                        }:${media.mediaType}`}
                        data-contenttype={'image'}
                        data-contentname={media.image.alt}
                        aria-label={media.image.alt}
                        tabIndex="0"
                        role="button"
                    >
                        <div className="icon">
                            <span
                                role="button"
                                aria-label="press play"
                                className="icons tourIcon"
                                tabIndex="0"
                            />
                        </div>
                        <iframe
                            title={media.mediaType}
                            className="videoIframe hide"
                            src={
                                media.virtualTour360Video ||
                                media.threeSixtyImageURL
                            }
                            width="100%"
                            tabIndex="-1"
                        />
                    </div>
                );
            } else if (media.image) {
                return (
                    <div
                        className="threeSixtyImage-container"
                        data-linktext={`${media.imageCaption}:${
                            media.image.alt
                        }:${media.mediaType}`}
                        data-contenttype={'image'}
                        data-contentname={media.image.alt}
                        aria-label={media.image.alt}
                        tabIndex="0"
                        role="button"
                    >
                        <div className="icon">
                            <span
                                role="button"
                                aria-label="press play"
                                className="icons tourIcon"
                                tabIndex="0"
                            />
                        </div>
                        {media.image && (
                            <Image
                                {...media.image}
                                onLoadHandler={onLoadHandler}
                                disableLazyLoad={true}
                            />
                        )}
                    </div>
                );
            } else {
                return <div className="threeSixtyImage-container" />;
            }

        case 'video':
            if (onOverlay && media.image) {
                const loadTracking = {
                    contentType: media.mediaType,
                    playerName: 'akamai',
                    contentName: media.image.alt
                };

                analytics.setAdditionalPageTrackAttributes(loadTracking);

                return (
                    <div
                        className="video-container"
                        data-linktext={`${media.imageCaption}:${
                            media.image.alt
                        }:${media.mediaType}:play`}
                        aria-label={media.image.alt}
                    >
                        <videoplayer
                            video={media.video}
                            autoplay={videoAutoplay}
                            componentMountCallback={videoMountCallback}
                        />
                    </div>
                );
            } else if (media.image) {
                return (
                    <div
                        className="video-container"
                        data-contenttype={'video'}
                        data-contentname={media.image.alt}
                        aria-label={media.image.alt}
                        tabIndex="0"
                    >
                        {media.video.posterRendition ? (
                            <Image {...media.video.posterRendition} />
                        ) : (
                            <img
                                srcSet={media.video.poster}
                                alt={media.video.title}
                            />
                        )}
                        <div className="icon">
                            <span
                                role="button"
                                aria-label="press play"
                                className="icons videoIcon"
                                tabIndex="0"
                            />
                        </div>
                    </div>
                );
            } else {
                return <div className="video-container" />;
            }
    }
};

class mediaTiles extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            totalSlide: '',
            activeSlide: 1,
            isLVP: true,
            disableNext: false,
            disablePrev: true,
            objSVP: {}
        };

        this.settings = {
            accessibility: true,
            dots: false,
            infinite: false,
            arrows: false,
            slidesToShow: 1,
            slidesToScroll: 1,
            swipe: false,
            responsive: [
                {
                    breakpoint: Breakpoints.mobile,
                    settings: {
                        slidesToShow: 1,
                        centerMode: true,
                        slidesToScroll: 1,
                        centerPadding: '24px',
                        swipe: true
                    }
                },
                {
                    breakpoint: Breakpoints.tablet,
                    settings: {
                        slidesToShow: 2,
                        centerMode: false,
                        centerPadding: '150px',
                        swipe: true
                    }
                },
                {
                    breakpoint: Breakpoints.tabletLandscape,
                    settings: {
                        slidesToShow: 2,
                        slidesToScroll: 2,
                        centerPadding: '30px',
                        centerMode: false,
                        swipe: true
                    }
                },
                {
                    breakpoint: Breakpoints.desktop,
                    settings: {
                        slidesToShow: 2,
                        slidesToScroll: 2,
                        centerPadding: '30px',
                        centerMode: false,
                        swipe: true
                    }
                }
            ],
            afterChange: this.setActiveSlide
        };
    }

    componentWillMount() {
        if (this.props.mediaRow) {
            this.renderJsonSVP();
        }
    }

    componentDidMount() {
        const mqlLVP = watchForBreakpoint(VIEWPORT_TYPE.DESKTOP);

        this.handleResize(mqlLVP);

        mqlLVP.addListener((mql) => {
            this.handleResize(mql);
        });
        // analytics.clickTracking(this);
    }

    /**
     * handleResize - Resize function to determine mobile or desktop
     * @param  {object} mql match object
     */
    handleResize = (mql) => {
        if (mql.matches) {
            this.setState({
                isLVP: true
            });
        } else {
            this.setState({
                isLVP: false
            });
        }
    };

    /**
     * renderJsonSVP - Construct mobile view json
     */
    renderJsonSVP() {
        const obj = [];

        for (let mediaItem of this.props.mediaRow) {
            obj.push(...mediaItem.media);
        }

        this.setState({
            objSVP: obj,
            totalSlide: obj.length
        });
    }

    /**
     * setActiveSlide - Set active slide in mobile view
     * @param  {number} index Index of the item
     */
    setActiveSlide = (index) => {
        const activeSlide = ++index;
        const disableNext = activeSlide === this.state.totalSlide;
        const disablePrev = activeSlide === 1;

        this.setState({
            activeSlide,
            disableNext,
            disablePrev
        });
    };

    /**
     * nextSlide - Slide next
     */
    nextSlide = () => {
        const tempObject = {
            linkText: `nextSlide`,
            componentName: 'mediaTiles'
        };

        analytics.customClicks(tempObject);
        this.slider.slickNext();
    };

    /**
     * previousSlide - Slide Previous
     */
    previousSlide = () => {
        const tempObject = {
            linkText: `PreviousSlide`,
            componentName: 'mediaTiles'
        };

        analytics.customClicks(tempObject);
        this.slider.slickPrev();
    };

    /**
     * generateMedia - Generate media
     *
     * @param {string} media Type of media
     * @param {bool} onOverlay Generate on overlay or not
     * @returns {html}
     */
    generateMedia = generateMedia;

    /**
     * buildSliderImageTile - Generate slider tile for mobile view
     *
     * @returns {html}
     */
    buildSliderImageTile = () => {
        const accesibilityLabels = this.props.accesibilityLabels ? this.props.accesibilityLabels : {};
        const galleryOpenLabel = accesibilityLabels.galleryOpenLabel ? accesibilityLabels.galleryOpenLabel : '';
        return (
            <div className="media-grid">
                <Slider ref={(c) => (this.slider = c)} {...this.settings}>
                    {this.state.objSVP.map((item, i) => (
                        <div
                            key={i}
                            role="button"
                            className="sliderItem"
                            onKeyPress={() => {
                                this.props.onSVPTileClick(i, item);
                            }}
                            onClick={() => {
                                this.props.onSVPTileClick(i, item);
                            }}
                        >
                            <div className={`media-item-${item.mediaSize}`}>
                                {this.generateMedia({
                                    media: item,
                                    autoplay: this.props.autoplay,
                                    isLVP: false,
                                    galleryOpenLabel: galleryOpenLabel
                                })}
                            </div>
                        </div>
                    ))}
                </Slider>
            </div>
        );
    };

    /**
     * buildImageTiles - Generate media tile for desktop
     *
     * @returns {html}
     */
    buildImageTiles = () => {
        let itemIndex = -1;
        const accesibilityLabels = this.props.accesibilityLabels ? this.props.accesibilityLabels : {};
        const galleryOpenLabel = accesibilityLabels.galleryOpenLabel ? accesibilityLabels.galleryOpenLabel : '';

        return (
            <div className="media-grid">
                {this.props.mediaRow.map((items, i) => {
                    return (
                        <div
                            className={`media-row elements-${
                                items.media.length
                            }`}
                            key={i}
                        >
                            {items.media.map((item, j) => {
                                let localIndex = ++itemIndex;

                                return (
                                    <div
                                        key={j}
                                        role="button"
                                        aria-label={galleryOpenLabel}
                                        className={`media-item-${
                                            item.mediaSize
                                        } tile-item`}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                this.props.onLVPTileClick(
                                                    localIndex,
                                                    item
                                                );
                                            }
                                        }}
                                        onClick={(e) => {
                                            this.props.onLVPTileClick(
                                                localIndex,
                                                item
                                            );
                                        }}
                                    >
                                        {this.generateMedia({ media: item,
                                            galleryOpenLabel: galleryOpenLabel
                                        })}
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        );
    };

    render() {
        const { dividerText } = this.props;

        return (
            <div className={`gallery-container ${this.props.containerClass}`}>
                {this.state.isLVP
                    ? this.buildImageTiles()
                    : this.buildSliderImageTile()}

                {!this.state.isLVP &&
                    this.state.totalSlide > 1 && (
                        <div className="gallery-carousel-controls">
                            <button
                                className={`button prev-btn ${
                                    this.state.disablePrev
                                        ? 'slick-disabled'
                                        : ''
                                }`}
                                data-linktext={'carousel-prev'}
                                onClick={this.previousSlide}
                            >
                                &#60;
                            </button>
                            <span>
                                {this.state.activeSlide} {dividerText}{' '}
                                {this.state.totalSlide}
                            </span>
                            <button
                                className={`button next-btn ${
                                    this.state.disableNext
                                        ? 'slick-disabled'
                                        : ''
                                }`}
                                data-linktext={'carousel-next'}
                                onClick={this.nextSlide}
                            >
                                &#62;
                            </button>
                        </div>
                    )}

                {this.props.children}
            </div>
        );
    }
}

mediaTiles.propTypes = {
    onLVPTileClick: PropTypes.func,
    onSVPTileClick: PropTypes.func,
    dividerText: PropTypes.string.isRequired,
    mediaRow: PropTypes.array,
    containerClass: PropTypes.string,
    autoplay: PropTypes.bool,
    component: PropTypes.string
};

mediaTiles.defaultProps = {
    dividerText: '',
    autoplay: false,
    onLVPTileClick: () => {},
    onSVPTileClick: () => {}
};

export default mediaTiles;
