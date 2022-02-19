'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import analytics from '../commons/CUK/analytics';
import LegalModal from '../commons/CUK/legalModal';
import Link from '../commons/CUK/link';
import { cleanURL } from '../commons/CUK/utilities';

/**
 * Component - C081 - SpecialOffersOverlay
 */
class SpecialOffersOverlay extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            showModal: false
        };
    }

    /**
     * handleModal - showing and hiding Modal component
     *
     * @param {boolean} flag true for show | false for hide
     */
    handleModal = (flag) => {
        this.setState({ showModal: flag });
    }

    /**
     * createMarkup - rendering html
     *
     * @param {html} html for rendering html
     * @returns {html}
     */
    createMarkup = (html) => {
        return { __html: html };
    }

    componentDidMount() {

        // analytics.clickTracking(this);
        this.offersClose.focus();

        if (this.offerOverlay) {
            let overlayLinks = this.offerOverlay.getElementsByTagName('a');
            let lastLink = overlayLinks[(overlayLinks.length) - 1];

            lastLink ? lastLink.addEventListener('keydown', (e) => {
                (e.keyCode === 9 && !(e.shiftKey)) ? (this.offersClose.focus(), e.preventDefault(), e.stopPropagation()) : '';
            }) : '';
            this.offersClose ? this.offersClose.addEventListener('keydown', (e) => {
                (e.keyCode === 9 && (e.shiftKey)) ? (lastLink.focus(), e.preventDefault(), e.stopPropagation()) : '';
            }) : '';
        }
    }

    componentDidUpdate() {
        // analytics.clickTracking(this);
    }

    handleAnalytics(title, linktext) {

        const analyticsParams = {

            linkText: `${title}:${linktext}`,
            componentName: 'specialOffersOverlay'
        };

        analytics.customClicks(analyticsParams);

        this.props.hideOffersOverlay();
    }

    render() {
        const {
            itineraryCtaCopy,
            itineraryPath,
            hideOfferCTA
        } = this.props;

        if (this.props.showMultipleOffers) {
            const props = this.props.specialOffers && this.props.specialOffers.slice(0, 3);
            let containerClass;

            if (props && props.length === 3) {
                containerClass = 'offers-overlay-wrapper three-children';
            }
            else if (props && props.length === 2) {
                containerClass = 'offers-overlay-wrapper two-children';
            }
            else {
                containerClass = 'offers-overlay-wrapper';
            }
            const overlayStyle = {
                backgroundImage: `url(${props[0].backgroundTexture})`
            };

            return (
                <div className='special-offers-overlay' style={overlayStyle} ref={(offerOverlay) => this.offerOverlay = offerOverlay}>
                    <div className='offers-overlay-container'>
                        <header>
                            <button
                                href='JavaScript:void(0)'
                                ref={(offersClose) => this.offersClose = offersClose}
                                className='offers-close'
                                id='offersClose'
                                aria-label={`${props[0].name} ${this.props.closeLabel}`}
                                data-linktext={`${props[0].name} ${this.props.closeLabel}`}
                                onClick={() => this.handleAnalytics(props[0].name, this.props.closeLabel)}>
                                <span className='offers-close-img'></span>
                            </button>
                        </header>
                        <div className='offers-container'>
                            {props.map((item, i) => (
                                <div className={containerClass} key={i}>
                                    <div className='offers-overlay-main'>
                                        <div className='offers-main-wrapper'>
                                            <div className='offers-content-block'>
                                                <div className='offers-title-container'><span className='star-icon'></span><span className='offers-overlay-title' tabIndex='0'>{item.name}</span></div>
                                                <p tabIndex='0' dangerouslySetInnerHTML={{ __html: item.description }} />
                                                { !hideOfferCTA &&
                                                    <Link
                                                        url={ cleanURL( itineraryPath )}
                                                        linkClassName='cta-link'
                                                        dataComponentname='specialOffersOverlay'
                                                        ariaLabel={`${item.name}  ${itineraryCtaCopy}`}
                                                        dataLinktext={`${item.name}:${itineraryCtaCopy}`}>
                                                        {itineraryCtaCopy}
                                                    </Link>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }
        else {
            const {
                name,
                title,
                subHeader,
                description,
                termsCtaText,
                icon,
                backgroundTexture
            } = this.props.specialOffers[0];

            const overlayStyle = {
                backgroundImage: `url(${backgroundTexture})`
            };
            const legalModalLabel = <span dangerouslySetInnerHTML={this.createMarkup(termsCtaText)}></span>;

            return (
                <div className='special-offers-overlay' style={overlayStyle} ref={(offerOverlay) => this.offerOverlay = offerOverlay}>
                    <div className='offers-overlay-container'>
                        <div className='offers-overlay-wrapper'>
                            <header>
                                <a
                                    href='JavaScript:void(0)'
                                    role='button'
                                    ref={(offersClose) => this.offersClose = offersClose}
                                    className='offers-close'
                                    id='offersClose'
                                    aria-label={`${name} ${this.props.closeLabel}`}
                                    onClick={() => this.handleAnalytics(name, this.props.closeLabel)}>
                                    <span className='offers-close-label'>{this.props.closeLabel}</span>
                                    <span className='offers-close-img'></span>
                                </a>
                            </header>
                            <div className='offers-overlay-main'>
                                <div className='offers-main-wrapper'>
                                    <div className='offers-content-block'>
                                        {icon &&
                                            <img src={icon.image} alt={icon.alt} />
                                        }
                                        <div className='offers-title-container'><span className='star-icon'></span><span className='offers-overlay-title' tabIndex='0'>{title}</span></div>
                                        <hr className='static-decorator' />
                                        <div className='offers-overlay-subheader'>{subHeader}</div>
                                        <div className='overlay-description'>
                                            <p tabIndex='0'>{description}</p>
                                        </div>
                                        {!hideOfferCTA &&
                                        <div className='overlay-view-itinerary'>
                                            <Link
                                                url={ cleanURL( itineraryPath ) }
                                                linkClassName='cta-link'
                                                dataComponentname='specialOffersOverlay'
                                                ariaLabel={`${name}  ${itineraryCtaCopy}`}
                                                dataLinktext={`${name}:${itineraryCtaCopy}`}>
                                                {itineraryCtaCopy}
                                            </Link>
                                        </div>
                                        }
                                        <footer>
                                            <div className='terms-conditions-overlay'>
                                                <LegalModal
                                                closeLabel={this.props.closeLabel}
                                                contentLabel= {termsCtaText}
                                                underlayClass='legal-modal'
                                                hideLegalAccordion={this.props.hideLegalAccordion}
                                                taxFeesBlock ={legalModalLabel}/>
                                            </div>
                                        </footer>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    }
}

SpecialOffersOverlay.propTypes = {
    isImage: PropTypes.bool,
    icon: PropTypes.string,
    logoImage: PropTypes.string,
    logoText: PropTypes.string,
    title: PropTypes.string,
    subHeader: PropTypes.string,
    description: PropTypes.string,
    termsCtaText: PropTypes.string,
    termsModalText: PropTypes.string,
    termsModalBackToTop: PropTypes.string,
    backgroundTexture: PropTypes.string,
    hideOffersOverlay: PropTypes.func
};

export default SpecialOffersOverlay;
