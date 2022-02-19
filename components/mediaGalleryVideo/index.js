/**
 * C010A Media Gallery Ship Info Port Component
 * @exports MediaGalleryShipInfo
 */
'use strict';

import React from 'react';
import Slider from 'react-slick';
import Modal from '../commons/CUK/modal';
import MediaTiles, { generateMedia } from '../commons/CUK/mediaTiles';
import analytics from '../commons/CUK/analytics';

class mediaGalleryVideo extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            totalSlide: '',
            objSVP: {},
            showModal: false,
            selectedTileIndex: 0
        };

        this.videosList = [];

        this.carouselSettings = {
            accessibility: true,
            dots: true,
            infinite: false,
            arrows: false,
            mobileFirst: true,
            slidesToShow: 1,
            slidesToScroll: 1,
            focusOnSelect: true,
            adaptiveHeight: true,
            beforeChange: (oldIndex) => {
                const activeItem = this.state.objSVP[oldIndex];
                const tempObject = {
                    linkText: `galleryOverlay:${
                        activeItem.mediaType
                    }:${oldIndex + 1}`,
                    componentName: this.props.component,
                    contentName: activeItem.image.alt,
                    contentType: activeItem.mediaType
                };

                this.pauseVideos();
                analytics.customClicks(tempObject);
            },
            customPaging: function(index) {
                return (
                    <button tabIndex="-1" aria-hidden="true">
                        {index}
                    </button>
                );
            }
        };

        this.slideRefs = [];
    }

    componentWillMount() {
        this.renderJsonSVP();
    }

    componentDidUpdate() {
        // analytics.clickTracking(this);
    }

    componentDidMount() {
        // analytics.clickTracking(this);
        window.onload = function handleFocusOnLoad() {
            let elements = typeof document !== 'undefined' && document.getElementsByClassName('videoIframe');

            for (let i = 0; i < elements.length; i++) {
                elements[i].classList.remove('hide');
                elements[i].blur();
            }
            if (typeof document !== 'undefined' && document.getElementsByClassName('global-header-wrapper')[0]) {
                document
                    .getElementsByClassName('global-header-wrapper')[0]
                    .focus();
                document.getElementsByClassName(
                    'global-header-wrapper'
                )[0].onblur = function setFocusToTop() {
                    this.focus();
                };
            }
        };
    }

    /**
     * resetSlideScroll - accessible Tab behaviour in slider
     */
    resetSlideScroll() {
        let slickElements = this.carouselContainer
            ? this.carouselContainer.querySelectorAll('.slick-list')
            : [];

        if (slickElements.length > 0) {
            slickElements[0].addEventListener('scroll', (e) => {
                e.target.scrollLeft = 0;
            });
        }
    }

    customFocusBehaviour(index) {
        if (index < this.state.objSVP.length) {
            this.carouselSlider.slickGoTo(index);
        }
    }

    customTabBackBehaviour(e) {
        if (e.keyCode === 9 && event.shiftKey) {
            this.carouselSlider.slickPrev();
        }
    }

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
     * pauseVideos - Pause all videos in the carousel
     */
    pauseVideos = () => {
        this.videosList.forEach((player, index, arr) => {
            if (player && player.pause) {
                try {
                    player.pause();
                } catch (e) {
                    // console.error(e.message);
                }
            }
        });
    };

    /**
     * handleMediaModal - Trigger modal popup
     *
     * @param {bool} bool true/false
     * @param {number} itemIndex Item index
     * @param {object} mediaItem Media details
     */
    handleMediaModal = (bool, itemIndex, mediaItem) => {
        // If overlay has been closed
        if (bool === false) {
            const { component } = this.props;
            const tempObject = {
                linkText: `galleryOverLay:Close`,
                componentName: `${component}`
            };

            analytics.customClicks(tempObject);
        }

        this.setState(
            {
                selectedTileIndex: itemIndex,
                showModal: bool
            },
            () => {
                if (itemIndex !== '') {
                    this.carouselSlider
                        ? this.carouselSlider.slickGoTo(parseInt(itemIndex))
                        : null;
                    const analyticsParams = {
                        contentType: mediaItem.mediaType,
                        contentName: mediaItem.image.alt
                    };

                    analytics.overlayLoad('screenLoad', analyticsParams);
                }

                bool && this.resetSlideScroll();
                this.slideRefs[parseInt(itemIndex)] &&
                    this.slideRefs[parseInt(itemIndex)].focus();
            }
        );
    };

    /**
     * handleMobileMediaModal - Trigger modal popup in mobile view
     * @param {bool} bool true/false
     * @param {number} itemIndex Item index
     * @param {object} mediaItem Media details
     */
    handleMobileMediaModal = (bool, itemIndex, mediaItem) => {
        this.setState(
            {
                selectedTileIndex: itemIndex,
                showModal: bool
            },
            () => {
                if (itemIndex !== '') {
                    this.carouselSlider
                        ? this.carouselSlider.slickGoTo(parseInt(itemIndex))
                        : null;

                    const analyticsParams = {
                        contentType: mediaItem.mediaType,
                        contentName: mediaItem.image.alt
                    };

                    analytics.overlayLoad('screenLoad', analyticsParams);
                }

                bool && this.resetSlideScroll();
            }
        );
    };

    /**
     * PreviousSlide - carousel slide next
     */
    carouselPreviousSlide = () => {
        analytics.clickTracking(this);
        this.carouselSlider.slickPrev();
    };

    /**
     * nextSlide - carousel slide next
     */
    carouselNextSlide = () => {
        analytics.clickTracking(this);
        this.carouselSlider.slickNext();
    };

    getCarousel() {
        const { previousLabel = 'previous', nextLabel = 'next' } = this.props;
        const { objSVP, selectedTileIndex } = this.state;
        let carouselMarkup = null;

        if (objSVP.length > 1) {
            carouselMarkup = (
                <div
                    className="carousel-container"
                    ref={(container) => (this.carouselContainer = container)}
                >
                    <Slider
                        ref={(ref) => (this.carouselSlider = ref)}
                        {...this.carouselSettings}
                        initialSlide={selectedTileIndex}
                    >
                        {objSVP.map((item, i) => (
                            <div
                                key={i}
                                onFocus={(e) => {
                                    this.customFocusBehaviour(i);
                                }}
                                onKeyDown={(e) => {
                                    this.customTabBackBehaviour(e);
                                }}
                                ref={(ref) => {
                                    this.slideRefs[i] = ref;
                                }}
                            >
                                <div
                                    className="media-item"
                                    tabIndex="0"
                                    role="slider"
                                    aria-valuemin="1"
                                    aria-valuenow={i}
                                    aria-valuemax={objSVP.length}
                                >
                                    {generateMedia({
                                        media: item,
                                        onOverlay: true,
                                        videoAutoplay:
                                            i === this.state.selectedTileIndex,
                                        videoMountCallback: (ampVideoRef) => {
                                            this.videosList.push(ampVideoRef);
                                        }
                                    })}
                                </div>
                            </div>
                        ))}
                    </Slider>

                    <div className="slide-controls">
                        <button
                            className="button prev-btn"
                            aria-label={previousLabel}
                            data-linktext={'mediagallery-prev'}
                            onClick={this.carouselPreviousSlide}
                        />
                        <button
                            className="button next-btn"
                            aria-label={nextLabel}
                            data-linktext={'mediagallery-next'}
                            onClick={this.carouselNextSlide}
                        />
                    </div>
                </div>
            );
        } else {
            carouselMarkup = (
                <div className="carousel-container">
                    <div>
                        <div
                            className="media-item"
                            tabIndex="0"
                            role="slider"
                            aria-valuemin="1"
                            aria-valuenow="1"
                            aria-valuemax="1"
                        >
                            {generateMedia({
                                media: objSVP[0],
                                onOverlay: true,
                                videoAutoplay: true,
                                videoMountCallback: (ampVideoRef) => {
                                    this.videosList.push(ampVideoRef);
                                }
                            })}
                        </div>
                    </div>
                </div>
            );
        }

        return carouselMarkup;
    }

    render() {
        const { dividerText } = this.props;
        const accesibilityLabels = this.props.accesibilityLabels ?  this.props.accesibilityLabels : {};

        return (
            <div>
                <MediaTiles
                    dividerText={dividerText}
                    mediaRow={this.props.mediaRow}
                    onLVPTileClick={(itemIndex, mediaItem) => {
                        this.handleMediaModal(true, itemIndex, mediaItem);
                    }}
                    onSVPTileClick={(row, mediaItem) => {
                        this.handleMobileMediaModal(true, row, mediaItem);
                    }}
                    component={this.props.component}
                    accesibilityLabels={accesibilityLabels}
                >
                    <Modal
                        mounted={this.state.showModal}
                        contentLabel={'media-gallery-modal'}
                        underlayClass="media-gallery-modal"
                        onExit={() => this.handleMediaModal(false, '')}
                    >
                        {this.getCarousel()}
                    </Modal>
                </MediaTiles>
            </div>
        );
    }
}

export default mediaGalleryVideo;
