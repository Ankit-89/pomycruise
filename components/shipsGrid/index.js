'use strict';

import React from 'react';
import Image from '../commons/CUK/image';
import Modal from '../commons/CUK/modal';
import Link from '../commons/CUK/link';
import TitleH1Mycruise from '../titleH1Mycruise';
import analytics from '../commons/CUK/analytics';
import extractChildComponent from '../commons/CUK/extractChildComponent';
import { getCurrencyData } from '../commons/CUK/currencyFormat';
import Videoplayer from '../commons/CUK/videoplayer';
import SessionStorage from '../commons/CUK/session-storage';
import validateSession from '../commons/CUK/validateSession';
import fetchData from '../commons/CUK/fetch-data';
import {getConfig} from '../commons/CUK/utilities';

class shipsGrid extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            carouselModal: [],
            videoModal: [],
            render: false,
            gridList: [],
            drinkLandingPage: false,
            purchasable: false,
            showCtaLink : true
        };

        this.closeButton = [];
        this.openButton = [];
    }

    componentDidMount() {
        const { gridList = [] } = this.props;

         const { bookingMinDayX } = this.props;

        let newGridList;

        if (!validateSession.checkCookie(['wcmmode'])) {
            // analytics.clickTracking(this);
            const header = SessionStorage.getItem('header');
            const { shipCode } = header;

            this.shipCode = shipCode;
            newGridList = gridList.filter(this.filterGridItems);
        } else {
            newGridList = gridList;
        }
        const hasGridList = newGridList.length > 0;

        const modalObj = {
            showModal: false
        };
        const modalArray = newGridList.reduce((array) => {
            array.push(modalObj);
            return array;
        }, []);
        this.setState(() => ({
            render: hasGridList,
            gridList: hasGridList ? newGridList : false,
            carouselModal: modalArray,
            videoModal: modalArray
        }));

        const services = this.props.services;

        if (services && services.urls && services.headers) {
            this.setState({
                drinkLandingPage: true
            });

            let cruiseDuration = SessionStorage.getItem('cruiseData').durationCruise;
            if(!bookingMinDayX =='' &&  parseInt(cruiseDuration) <  parseInt(bookingMinDayX)){ //code forbookingMinDayX is pending
                 this.setState({
                 showCtaLink : false
                 });
             }
            const serviceUrl = services.urls.productSearchApi;
            const header = SessionStorage.getItem('header');
            const serviceLang = services.headers.locale;
            const configs = typeof window !== 'undefined' ? window.configs : {};
            const apiKey = configs.apikeyMycruise;
            // let url = `/products/search/?productType=AIBEVERAGE&lang=${serviceLang}`;
            const url = `${serviceUrl}?productType=AIBEVERAGE`;

            fetchData(url, {
                method: 'GET',
                headers: {
                    'X-CommonData': JSON.stringify(header),
                    'X-Source-Identity-Token-0': apiKey,
                    'Content-type': 'application/json'
                }
            }).then((res) => {
                this.handleCtaAvailability(res);
            });
        }
    }

    handleCtaAvailability = (res) => {
        let nonAvailabilityMessage = res.products[0].purchasable
            ? res.products[0].purchasable
            : '';

        if (nonAvailabilityMessage === true) {
            this.setState({
                purchasable: true
            });
        }
    };

    filterGridItems = (gridItem) =>
        gridItem.shipFilter && gridItem.shipFilter.length > 0
            ? gridItem.shipFilter.indexOf(this.shipCode) > -1
            : true;

    renderIconCta(
        iconType,
        iconCta,
        title,
        video,
        i,
        titleValue,
        contentLabel
    ) {
        const { backtopLabel, closeLabel} = this.props;
        const { videoModal } = this.state;
        const currencyCode = getCurrencyData().currencyCode || '';
        iconCta.url = iconCta.url.replace(
            `{{currencyCode}}`,
            currencyCode.toUpperCase()
        );


        return iconType === 'video' ? (
            <div className="cta-holder">
                <div className="cta-icon-group video-link">
                    <button
                        data-index={i}
                        onClick={this.handleVideoModalOpen}
                        aria-label={`${title} ${iconCta.label}`}
                    >
                        <span className="video-icon" />
                        <span>{iconCta.label}</span>
                    </button>
                    <Modal
                        backtopLabel={backtopLabel}
                        closeLabel={closeLabel}
                        contentLabel={contentLabel}
                        underlayClass="media-gallery-modal"
                        mounted={
                            videoModal.length > 0
                                ? videoModal[i].showModal
                                : false
                        }
                        onExit={() => this.handleVideoModalClose(i)}
                    >
                        <Videoplayer video={video} autoplay={true} />
                    </Modal>
                </div>
            </div>
        ) : (

            <div className="cta-icon-group">
                <div className="cta-link">
                    <Link
                        {...iconCta}
                        ariaLabel={`${titleValue} ${iconCta.label}`}
                        dataClicktype={`general`}
                        dataLinktext={`${titleValue}:${iconCta.label}`}
                    />
                </div>
            </div>
        );
    }

    handleCarouselModal = (modalIndex, state, item, action) => {
        let campaignArray = [];

        if (!action) {
            const loadTracking = {
                carousal: {
                    internalCampaignIDs: campaignArray.join('|'),
                    event: 'event43'
                }
            };

            analytics.setAdditionalPageTrackAttributes(loadTracking);
            analytics.overlayLoad('screenLoad', loadTracking);
        }

        let tempState = this.state;

        tempState.carouselModal[modalIndex].showModal = state;

        this.setState(tempState, () => {
            state
                ? this.closeButton[modalIndex].focus()
                : this.openButton[modalIndex].focus();
        });
    };

    handleVideoModalOpen = (e) => {
        analytics.clickTracking(this);
        const modalIndex = e.target.dataset.index;
        this.setState((prevState) => {
            const newState = prevState;
            newState.videoModal[modalIndex].showModal = true;
            return newState;
        });
    };

    handleVideoModalClose = (i) => {
        const modalIndex = i;
        this.setState((prevState) => {
            const newState = prevState;
            newState.videoModal[modalIndex].showModal = false;
            return newState;
        });
    };

    renderDescription(
        type,
        description,
        textQuoteAuthor,
        textQuoteDescription
    ) {
        const styleClass = type === 'quote' ? 'quote' : 'paragraph';

        return (
            <div>
                <div
                    className={`description-block ${styleClass}`}
                    dangerouslySetInnerHTML={{ __html: description }}
                />

                {type === 'quote' && (
                    <div className="quote-details">
                        <span className="quote-author">
                            - {textQuoteAuthor}
                        </span>
                        <span className="quote-description">
                            , {textQuoteDescription}
                        </span>
                    </div>
                )}
            </div>
        );
    }

    setFocusElements(e) {
        this.blurElement = this.focusElement;
        this.focusElement = e.currentTarget;
    }

    focusOnClose(e, closeRef) {
        if (this.focusElement.contains(closeRef)) {
            if (e.shiftKey) {
                closeRef.focus();
            }
        } else if (!this.blurElement.contains(closeRef)) {
            if (e.key === undefined && e.shiftKey === undefined) {
                closeRef.focus();
            }
        }
    }

    renderTitle() {
        const { childComponents, accessibilityHeading } = this.props;
        const titleH1Props = extractChildComponent(
            childComponents,
            'titleH1Mycruise'
        );
        const titleComponent = titleH1Props ? (
            <TitleH1Mycruise {...titleH1Props.attributes} />
        ) : (
            <div className="accessibility-header">
                <h2 className="sr-only">{accessibilityHeading}</h2>
            </div>
        );

        return titleComponent;
    }

    renderSubTitle(partnerLabel, accessibilityPartnerLabel) {
        return (
            <div className="icon-holder">
                {partnerLabel ? (
                    <div className="subtitle">
                        {partnerLabel}
                        <span
                            className="afar-label"
                            aria-label={`${accessibilityPartnerLabel}`}
                        />
                    </div>
                ) : (
                    <div className="gridIcon" />
                )}
            </div>
        );
    }

    renderIcon = ({ iconImage, label }) => (
        <li className="icons-list-item" key={iconImage}>
            <span className="icons-list-icon">
                <img src={iconImage} className="icons-list-img" />
            </span>

            <div className="icons-list-label">
                <h3>{label}</h3>
            </div>
        </li>
    );

    renderGridItem = (
        {
            image,
            externalContent,
            partnerLabel,
            accessibilityPartnerLabel,
            title,
            iconList,
            iconCta,
            aibNotAvailableLabel,
            align,
            type,
            description,
            textQuoteAuthor,
            textQuoteDescription,
            iconType,
            video,
            contentLabel
        },
        i
    ) => (
        <div className="tile-holder" key={i}>
            <div className="tileGrid image-holder">
                {image && <Image {...image} />}
            </div>
            <div className="tileGrid content">
                <div className={`spacing-container ${align}`}>
                    {externalContent &&
                        this.renderSubTitle(
                            partnerLabel,
                            accessibilityPartnerLabel
                        )}

                    <div className="title">
                        <h3 className="h2 heading" dangerouslySetInnerHTML={{
                            __html: title
                        }}></h3>
                    </div>
                    {iconList && (
                        <div className="icons-list">
                            <ul>{iconList.map(this.renderIcon)}</ul>
                        </div>
                    )}

                    <div className="text-holder">
                        {this.renderDescription(
                            type,
                            description,
                            textQuoteAuthor,
                            textQuoteDescription
                        )}
                    </div>
                    {iconCta &&
                        !this.state.drinkLandingPage &&
                        iconCta.label &&
                        iconCta.url &&
                        this.renderIconCta(
                            iconType,
                            iconCta,
                            title,
                            video,
                            i,
                            title,
                            contentLabel
                        )}
                    {iconCta &&
                        this.state.drinkLandingPage &&
                        this.state.purchasable &&
                        this.state.showCtaLink &&
                        iconCta.label &&
                        iconCta.url &&
                        this.renderIconCta(
                            iconType,
                            iconCta,
                            title,
                            video,
                            i,
                            title,
                            contentLabel
                        )}
                    {aibNotAvailableLabel &&
                        !this.state.purchasable &&
                        this.state.drinkLandingPage && (
                            <p>{aibNotAvailableLabel}</p>
                        )}
                </div>
            </div>
        </div>
    );
    render() {
        const gridList = this.state.gridList || this.props.gridList;
        const { render } = this.state;
        return render ? (
            <div className="image-copy-block">
                {this.renderTitle()}
                {gridList.map(this.renderGridItem)}
            </div>
        ) : null;
    }
}

shipsGrid.defaultProps = {
    contentLabel: 'shipsGrid'
};

export default shipsGrid;
