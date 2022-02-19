'use strict';

import React from 'react';
// import PropTypes from 'prop-types';
import Link from '../commons/CUK/link';
import Image from '../commons/CUK/image';
import analytics from '../commons/CUK/analytics';
import Player from '../commons/CUK/videoplayer';
import ReadMoreOrLess from '../commons/CUK/readMoreOrLess';
import {
    VIEWPORT_TYPE,
    watchForBreakpoint
} from '../../library/js/config/breakpoints';
import { DescriptionManager } from '../commons/CUK/DescriptionManager';

class heroTileModuleMycruise extends React.PureComponent {
    constructor(props) {
        super(props);

        const {
            shortDescription,
            description,
            shortDescriptionDefault
        } = this.props;

        this.descriptionMngr = new DescriptionManager(
            shortDescription,
            description,
            shortDescriptionDefault
        );
        this.state = {
            showModal: false,
            isLVP: true,
            readMore: false,
            active: false,
            hasBackButton: false
        };

        this.maxHeight = props.readMoreMaxHeight;
    }

    componentDidMount() {
        const mqlLVP = watchForBreakpoint(VIEWPORT_TYPE.DESKTOP);

        const { heroTileVariation, showReadMore, campaignId } = this.props;

        this.checkLVP(mqlLVP);

        mqlLVP.addListener((mql) => {
            this.checkLVP(mql);
        });

        if (
            showReadMore ||
            (heroTileVariation &&
                (heroTileVariation === 'C037.301' ||
                    heroTileVariation === 'C037.301a'))
        ) {
            !this.state.readMore && this.readMore();
        }
        if (heroTileVariation && heroTileVariation === 'C037.301a') {
            this.setState({
                hasBackButton: true
            });
        }

        let analyticsParams = {
            hero: {
                internalCampaignIDs: campaignId || '',
                event: 'event43'
            }
        };

        analytics.setAdditionalPageTrackAttributes(analyticsParams);
        // analytics.clickTracking(this);
    }

    componentDidUpdate() {
        const { heroTileVariation, showReadMore } = this.props;

        if (
            showReadMore ||
            (heroTileVariation &&
                (heroTileVariation === 'C037.301' ||
                    heroTileVariation === 'C037.301a'))
        ) {
            !this.state.readMore && this.readMore();
        }

        // analytics.clickTracking(this);
    }

    /**
     * checkLVP - Checks for large viewport against media query list received
     *
     * @param {mediaQueryList} mql - mediaQueryList received from componentDidMountLogic
     */
    checkLVP = (mql) => {
        if (!mql.matches) {
            this.setState(
                {
                    isLVP: false
                },
                () => {
                    !this.state.readMore && this.readMore();
                }
            );
        }
    };

    /**
     * createBackground - Handles creation of hero's background
     * from prop "type" generating a videoPlayer or an image
     *
     * @returns {Component} Video Player or Image component
     */
    createBackground = () => {
        const { video, image, type } = this.props;

        switch (type) {
            case 'video':
                if (this.state.isLVP) {
                    return (
                        <Player
                            video={video}
                            autoplay={true}
                            muted={true}
                            loop={true}
                            playsInline={true}
                            isBackground={true}
                        />
                    );
                } else {
                    return <Image {...image} />;
                }
            case 'image':
                return <Image {...image} />;
        }
    };

    /**
     * readMore - Checks description's height against viewport's max-height
     * toggling state for "readMore" property
     */
    readMore = () => {
        const heroTile = this.domNode;

        const elm = heroTile.querySelectorAll('.desc') || [];

        let maxHeight = this.state.isLVP
            ? this.maxHeight['lvp']
            : this.maxHeight['smvp'];

        if (
            this.state.isLVP &&
            !(this.props.mapToolPortImagePin && this.state.displayPortMap)
        ) {
            maxHeight = 110;
        }
        if (elm.length && elm[0].offsetHeight > maxHeight) {
            this.setState({ readMore: true });
        }
    };
    /**
     * handleReadMore - Handles click event on showMore element
     * toggling state "active" property,
     * focusing on description container
     * and preventing default behaviour
     *
     * @param {object} { evt } event object from click
     * @returns {boolean} default on false to prevent propagation
     */
    handleReadMore = ({ evt }) => {
        this.setState({
            active: !this.state.active
        });
        this.descContainer.focus();
        evt.preventDefault();

        return false;
    };

    /**
     * evaluate - Handles bool-ish variables returning a boolean response
     *
     * @param {any} boolishVariable bool-ish variable to check
     * @returns {boolean} boolean representation of bool-ish value
     */
    evaluate = (boolishVariable) => {
        if (typeof boolishVariable === 'string') {
            return JSON.parse(boolishVariable.toLowerCase());
        } else if (typeof boolishVariable === 'boolean') {
            return boolishVariable;
        } else {
            return false;
        }
    };

    render() {
        const {
            cardAlignment = '',
            logo,
            title,
            bullets,
            heroTileVariation,
            readMoreLabel,
            readLessLabel,
            containerClass,
            externalContent,
            titleIconToggle,
            partnerLabel,
            accessibilityPartnerLabel,
            headingOneUsed,
            backLabel,
            children
        } = this.props;

        const showTitleIcon = this.evaluate(titleIconToggle);

        const description = this.descriptionMngr.getDescriptionText();

        let cardAlignmentValue = cardAlignment ? `:${cardAlignment}` : '';

        return (
            <div
                className={`hero-tile-container ${heroTileVariation &&
                    (heroTileVariation === 'C037.301' ||
                        heroTileVariation === 'C037.301a') &&
                    'variation'} ${containerClass}`}
                ref={(domNode) => (this.domNode = domNode)}
            >
                <div className="ht-background">{this.createBackground()}</div>
                <div className="herotile-info-card-wrapper">
                    {this.state.hasBackButton && (
                        // <a
                        //     href="#"
                        //     className="infocard-back"
                        //     onClick={() => window.history.back()}
                        // >
                        //     <span>{backLabel}</span>
                        // </a>
                        <Link
                            onClick={() => window.history.back()}
                            // ariaRole='menuitem'
                            linkClassName="infocard-back"
                            dataLinktext={`BACK`}
                        >
                            <span>{backLabel}</span>
                        </Link>
                    )}
                    <div
                        className={`infocard-wrapper ${cardAlignment}`}
                        ref="scrollTarget"
                    >
                        <div className="infocard">
                            {logo &&
                                logo.image && (
                                    <span className="infocard-logo">
                                        <img src={logo.image} alt={logo.alt} />
                                    </span>
                                )}
                            {!headingOneUsed && (
                                <h2
                                    className={`title heading ${
                                        showTitleIcon ? 'title-icon' : ''
                                    }`}
                                    dangerouslySetInnerHTML={{
                                        __html: title
                                    }}
                                >
                                </h2>
                            )}
                            {headingOneUsed && (
                                <h1
                                    className={`title heading ${
                                        showTitleIcon ? 'title-icon' : ''
                                    }`}
                                    dangerouslySetInnerHTML={{
                                        __html: title
                                    }}
                                >
                                </h1>
                            )}
                            {externalContent && (
                                <h2
                                    className="afar-container"
                                    aria-label={`${partnerLabel} ${accessibilityPartnerLabel}`}
                                >
                                    <div className="afar-text">
                                        {partnerLabel}
                                        <span
                                            className="afar-label"
                                            aria-label={`${accessibilityPartnerLabel}`}
                                        />
                                    </div>
                                </h2>
                            )}

                            {showTitleIcon ? (
                                <span className="title-decorator-image" />
                            ) : null}
                            <div className="hero-tile-variant">{children}</div>
                            <div
                                className={`desc-container ${
                                    this.state.readMore ? 'readmore' : ''
                                } ${this.state.active ? 'open' : ''}`}
                                ref={(node) => (this.descContainer = node)}
                            >
                                <div
                                    className={`desc`}
                                    dangerouslySetInnerHTML={{
                                        __html: description
                                    }}
                                />
                                {bullets &&
                                    bullets.length > 0 && (
                                        <ul className="desc-bullet-list">
                                            {bullets.map(
                                                (bulletPoint, index) => (
                                                    <li
                                                        className="desc-bullet"
                                                        key={index}
                                                    >
                                                        {bulletPoint}
                                                    </li>
                                                )
                                            )}
                                        </ul>
                                    )}
                            </div>
                            {this.state.readMore && (
                                <ReadMoreOrLess
                                    active={this.state.active}
                                    clickHandler={this.handleReadMore}
                                    readMoreLabel={readMoreLabel}
                                    readLessLabel={readLessLabel}
                                    scrollToTarget={this.refs.scrollTarget}
                                    name={title}
                                    linkText={`${title}${cardAlignmentValue}:${
                                        this.state.active
                                            ? readLessLabel
                                            : readMoreLabel
                                    }`}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

// heroTileModuleMycruise.propTypes = {
//     type: PropTypes.string.isRequired,
//     image: PropTypes.object,
//     videoURL: PropTypes.string,
//     cardAlignment: PropTypes.string.isRequired,
//     logo: PropTypes.object,
//     title: PropTypes.string.isRequired,
//     description: PropTypes.string.isRequired,
//     ctaIcon: PropTypes.object,
//     ctaType: PropTypes.string,
//     contentLabel: PropTypes.string,
//     viewCta: PropTypes.shape({
//         label: PropTypes.string,
//         url: PropTypes.string,
//         isExternal: PropTypes.bool
//     }),
//     partnerLabel: PropTypes.string,
//     accessibilityPartnerLabel: PropTypes.string,
//     externalContent: PropTypes.bool,
//     showReadMore: PropTypes.bool,
//     containerClass: PropTypes.string,
//     displayPortMap: PropTypes.bool,
//     readMoreMaxHeight: PropTypes.shape({
//         lvp: PropTypes.number,
//         smvp: PropTypes.number
//     }),
//     switchShipFactCaptions: PropTypes.bool,
//     shortDescription: PropTypes.string,
//     shortDescriptionDefault: PropTypes.bool,
//     backLabel: PropTypes.string
// };

heroTileModuleMycruise.defaultProps = {
    contentLabel: 'Hero Video Modal',
    showReadMore: false,
    containerClass: '',
    displayPortMap: false,
    readMoreMaxHeight: {
        lvp: 154,
        mvp: 154,
        svp: 100
    },
    externalContent: false,
    switchShipFactCaptions: false,
    shortDescription: '',
    shortDescriptionDefault: false
};

export default heroTileModuleMycruise;