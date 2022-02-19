import React from 'react';
import PropTypes from 'prop-types';
import Modal from '../modal';
import Image from '../image';
import analytics from '../analytics';
import Link from '../link';
import videoplayer from '../videoplayer';
import ReadMoreOrLess from '../readMoreOrLess';
import { breakpoint } from '../../../../library/js/config/index';
import { DescriptionManager } from '../DescriptionManager';
import SessionStorage from '../session-storage';
import PubSub from '../pubsub';
import topics from '../../../../library/js/config/topics';
import { getConfig } from '../utilities';
import moment from 'moment';

const VIEWPORT_TYPE = breakpoint.VIEWPORT_TYPE;
const watchForBreakpoint = breakpoint.watchForBreakpoint;

class heroTileModule extends React.PureComponent {
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
            showUnderAge: false,
            showReserveSeat: false,
            showModal: false,
            isLVP: true,
            readMore: false,
            active: false,
            displayPortMap: this.props.displayPortMap,
            entertainmentDayX: getConfig('entertainmentDayX', ''),
            entertainmentReserveDate: '',
            showNewDate: '',
            bannerLinks: []
        };

        this.maxHeight = props.readMoreMaxHeight;

        this.maxRating = 5;

        this.shipFacts = [];
    }

    handleModal = (bool) => {
        this.setState({ showModal: bool }, () => {
            if (this.state.showModal) {
                var analyticsParams = {
                    contentType: this.props.ctaType,
                    contentName: analytics.handleSpecials(this.props.title),
                    playerName: 'videoPlayer'
                };

                analytics.overlayLoad('screenLoad', analyticsParams);

                // Not required as its triggering additional analytics call. Keeping it for validation purpose.
                /* analyticsParams = {
                    linkText: `${this.props.title}:${this.props.cardAlignment}:${this.props.viewCta.label}`,
                    componentName: this.props.component,
                    contentName: this.props.ctaType,
                    contentType: this.props.ctaType
                };

                analytics.customClicks(analyticsParams); */
            }
        });
    };

    componentDidMount() {
        const mqlLVP = watchForBreakpoint(VIEWPORT_TYPE.DESKTOP);

        const { heroTileVariation, showReadMore, campaignId } = this.props;

        this.checkLVP(mqlLVP);

        mqlLVP.addListener((mql) => {
            this.checkLVP(mql);
        });

        if (heroTileVariation && heroTileVariation === 'C037') {
            // TODO: : OverlayLoad need not fire on mount, only when it is opened after the pageload.
            // analytics.overlayLoad();
        }

        if (
            showReadMore ||
            (heroTileVariation && heroTileVariation === 'C037a')
        ) {
            !this.state.readMore && this.readMore();
        }

        let analyticsParams = {
            heroBanner: {
                internalCampaignIDs: campaignId || '',
                event: 'event43'
            }
        };

        analytics.setAdditionalPageTrackAttributes(analyticsParams);

        // analytics.clickTracking(this);

        const thePath = window.location.href;
        const getLastItem = thePath.substring(thePath.lastIndexOf('/') + 1);
        if (getLastItem == 'entertainment') {
            this.bannerConfig();
        }
        const addToCartPopUp = SessionStorage.getItem('addToCartPopUp') || {};
        if (
            Object.keys(addToCartPopUp).length &&
            addToCartPopUp.isDiningPopUpShow
        ) {
            const {
                name,
                total,
                currency,
                numberOfItems,
                diningDescription,
                diningLowerDescription,
                show_dining_Description
            } = addToCartPopUp;
            this.showConfirmation(
                name,
                currency,
                total,
                numberOfItems,
                diningDescription,
                diningLowerDescription,
                show_dining_Description
            );
            addToCartPopUp['isDiningPopUpShow'] = false;
            SessionStorage.setItem('addToCartPopUp', addToCartPopUp);
        }
    }

    showConfirmation = (
        name,
        currency,
        total,
        numberOfItems,
        diningDescription,
        diningLowerDescription,
        show_dining_Description
    ) => {
        PubSub.publish(topics.ADD_TO_CART, {
            name,
            currency,
            total,
            numberOfItems,
            diningDescription,
            diningLowerDescription,
            show_dining_Description
        });
    };

    bannerConfig = () => {
        const header = SessionStorage.getItem('header');
        const { durationCruise } = SessionStorage.getItem('cruiseData');
        const { bannerConfig, showBanner } = this.props;
        const { embarkationDate } = header;
        // // New Date
        const dayOfCruiseDeparture = new Date(
            moment(embarkationDate, 'YYYY-MM-DD').format('ll')
        );
        const today = new Date();
        const oneDay = 1000 * 60 * 60 * 24;
        const dayToCruiseDeparture = Math.ceil(
            (dayOfCruiseDeparture.getTime() - today.getTime()) / oneDay
        );
        /////   ***************** //// ****************** ///////
        const xDays = getConfig('entertainmentDayX');

        const diffDays = +xDays - dayToCruiseDeparture;
        const newDateForBooking = moment()
            .add(5, 'days')
            .calendar(today);

        const newDate = moment(today, 'DD-MM-YYYY')
            .add(-diffDays, 'days')
            .format('Do MMMM YYYY');

        console.log(dayToCruiseDeparture, diffDays, newDateForBooking, newDate);
        const thePath = window.location.href;
        const getLastItem = thePath.substring(thePath.lastIndexOf('/') + 1);

        let userData = SessionStorage.getItem('userData');
        let underAge = userData.customer.age;
        let newBannerConfig = [];
        bannerConfig.map((item) => {
            const checkBannerShow =
                Number(item.minCruiseDuration) <= Number(durationCruise) &&
                Number(item.maxCruiseDuration) >= Number(durationCruise) &&
                Number(item.minDaysToDeparture) <= dayToCruiseDeparture &&
                Number(item.maxDaysToDeparture) >= dayToCruiseDeparture
                    ? true
                    : false;
            if (checkBannerShow) {
                newBannerConfig.push(item);
            }
        });

        if (getLastItem == 'entertainment') {
            if (
                (showBanner == 'true' || showBanner == true) &&
                underAge >= 16 &&
                diffDays < 0
            ) {
                this.setState({
                    showReserveSeat: true,
                    showNewDate: newDate,
                    bannerLinks: newBannerConfig
                });
            } else if (underAge < 16) {
                this.setState({ showUnderAge: true });
            }
        } else {
            this.setState({
                showReserveSeat: false,
                showUnderAge: false
            });
        }
    };

    componentDidUpdate() {
        const { heroTileVariation, showReadMore } = this.props;

        if (
            showReadMore ||
            (heroTileVariation && heroTileVariation === 'C037a')
        ) {
            !this.state.readMore && this.readMore();
        }

        // analytics.clickTracking(this);
    }

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

    createBackground = () => {
        const { video, image, type } = this.props;

        switch (type) {
            case 'video':
                if (this.state.isLVP) {
                    return (
                        <videoplayer
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

    renderBanner = () => {
        const {
            descriptionUnderAge,
            descriptionAdult,
            descriptionAdultSeatReservationStartdateMessage,
            labelAnd,
            labelAvailableToBookNow
        } = this.props;
        const {
            showReserveSeat,
            showNewDate,
            showUnderAge,
            bannerLinks
        } = this.state;
        const header = SessionStorage.getItem('header');
        const { shipCode } = header;
        let bannerLinksObject = '';
        let sortedBannerLinks = [];
        let renderBannerObject = '';

        if (bannerLinks.length != 0) {
            bannerLinks.map((item, index) => {
                let splitUrl = item.productPageURL.split('/mycruise');
                let oldUrl = window.location.href.split('/' + shipCode);
                bannerLinks[index]['productPageURL'] =
                    oldUrl[0] + '/' + shipCode + splitUrl[1];
            });
            sortedBannerLinks = bannerLinks.sort(
                (a, b) => a.orderOfProductLabel - b.orderOfProductLabel
            );
            bannerLinksObject = [
                sortedBannerLinks
                    .slice(0, -1)
                    .map(
                        (item) =>
                            `<a class="banner_icon" href=${
                                item.productPageURL
                            }>${item.productLabel}</a>`
                    )
                    .join(', '),
                `<a class="banner_icon" href=${
                    sortedBannerLinks.slice(-1)[0].productPageURL
                }>
                    ${sortedBannerLinks.slice(-1)[0].productLabel}
                </a>`
            ].join(
                sortedBannerLinks.length < 2
                    ? ''
                    : ` ${' '} ${labelAnd} ${' '} `
            );
            
            renderBannerObject =
                bannerLinksObject + ` ${' '} ${labelAvailableToBookNow}`;
        }
        const descReservationMessage = descriptionAdultSeatReservationStartdateMessage.replace(
            '{date}',
            `${showNewDate}`
        );
        const seatReservationLabel = `${descriptionAdult} ${' '} <b>${descReservationMessage}</b></br></br> ${renderBannerObject}`;

        return (
            <div className="hte-message">
                <div className="hte_entertainment">
                    <div className="tooltip__icon" />
                    <p
                        className="entertainmentDay"
                        dangerouslySetInnerHTML={{
                            __html: showUnderAge
                                ? descriptionUnderAge
                                : showReserveSeat
                                    ? seatReservationLabel
                                    : ''
                        }}
                    />
                </div>
            </div>
        );
    };

    createModal = () => {
        return (
            <Modal
                mounted={this.state.showModal}
                onExit={() => this.handleModal(false)}
                contentLabel={this.props.contentLabel}
                ctaType={this.props.ctaType}
                underlayClass="media-gallery-modal"
            >
                <videoplayer
                    video={this.props.infoCardVideo.video}
                    autoplay={true}
                />
            </Modal>
        );
    };

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

    handleReadMore = ({ evt }) => {
        this.setState({
            active: !this.state.active
        });
        this.descContainer.focus();
        evt.preventDefault();

        return false;
    };

    handleImageErrored = () => {
        this.setState({ displayPortMap: false });
    };

    ratings = () => {
        const { ratings } = this.props;

        let html = [];

        for (let i = 0; i < this.maxRating; i++) {
            html.push(
                <span
                    className={`rate ${ratings > i ? 'active' : ''}`}
                    key={i}
                />
            );
        }

        return <div className="ratings">{html}</div>;
    };

    clickProp = () => {
        const { ctaType, viewCta } = this.props;

        let attr =
            ctaType === 'video'
                ? { onClick: () => this.handleModal(true) }
                : viewCta;

        return attr;
    };

    componentWillMount() {
        const { childComponents } = this.props;

        const shipFacts =
            childComponents &&
            childComponents.filter(function(obj) {
                if (obj !== null) {
                    return obj.type === 'heroTileShipfacts';
                }
            })[0];

        this.shipFacts = shipFacts ? shipFacts.attributes : [];
    }

    createShipFacts = () => {
        const shipFactsArray = this.shipFacts.factsBlockList || [];
        const { switchShipFactCaptions } = this.props;

        if (shipFactsArray.length) {
            const shipFactsHtml = shipFactsArray
                .filter((obj) => obj.caption.trim())
                .map((obj, i) => (
                    <div key={i} className="item">
                        {obj.keyFacts === 'custom' && obj.logo ? (
                            <span
                                className="icon"
                                aria-label={obj.accessibilityCopy}
                            >
                                <img src={obj.logo.image} alt={obj.logo.alt} />
                            </span>
                        ) : (
                            <span className={obj.keyFacts} />
                        )}

                        {obj.icon && <span className={`icon ${obj.icon}`} />}

                        {obj.accessibilityCopy && (
                            <span className="sr-only">
                                {obj.accessibilityCopy}
                            </span>
                        )}

                        {switchShipFactCaptions ? (
                            <div className="content switched">
                                <span className="caption">{obj.caption}</span>
                                <span className="statistic">
                                    {obj.statistic}
                                </span>
                            </div>
                        ) : (
                            <div className="content" tabIndex="0">
                                <span className="statistic">
                                    {obj.statistic}
                                </span>
                                <span className="caption">{obj.caption}</span>
                            </div>
                        )}
                    </div>
                ));

            return shipFactsHtml;
        }
    };

    evaluate = (boolishVariable) => {
        if (typeof boolishVariable === 'string') {
            return JSON.parse(boolishVariable.toLowerCase());
        } else if (typeof boolishVariable === 'boolean') {
            return boolishVariable;
        } else {
            return false;
        }
    };

    renderShipFacts = () => {
        const { shipFactsToggle } = this.props;
        const shouldRender =
            shipFactsToggle &&
            this.shipFacts.factsBlockList &&
            this.createShipFacts();

        return shouldRender ? (
            <div className="ship-facts-container">
                <div className="ship-facts">{this.createShipFacts()}</div>
            </div>
        ) : null;
    };

    render() {
        const {
            cardAlignment = '',
            logo,
            title,
            bullets,
            ctaType,
            viewCta,
            ctaIcon,
            heroTileVariation,
            hasBorder,
            readMoreLabel,
            readLessLabel,
            ratings,
            containerClass,
            mapToolPortImagePin,
            mapToolPortImageAlt,
            externalContent,
            titleIconToggle,
            partnerLabel,
            accessibilityPartnerLabel,
            headingOneUsed,
            showBackButton,
            backLabel
        } = this.props;
        const { showReserveSeat, showUnderAge } = this.state;
        const showTitleIcon = this.evaluate(titleIconToggle);
        const description = this.descriptionMngr.getDescriptionText();
        let analyticsOptions = {};

        if (ctaIcon && ctaIcon.image) {
            analyticsOptions.dataContentname = viewCta.label;
            analyticsOptions.dataContenttype = 'icon';
        }
        let cardAlignmentValue = cardAlignment ? `:${cardAlignment}` : '';

        return (
            <div
                className={`hero-tile-container ${heroTileVariation &&
                    heroTileVariation === 'C037a' &&
                    'variation'} ${containerClass} ${hasBorder &&
                    'hero-tile-container-border'}`}
                ref={(domNode) => (this.domNode = domNode)}
            >
                <div className="ht-background">
                    {this.createBackground()}
                    {showReserveSeat || showUnderAge
                        ? this.renderBanner()
                        : null}
                </div>
                <div className="herotile-info-card-wrapper">
                    {showBackButton && (
                        <a
                            href="#"
                            className="infocard-back"
                            onClick={() => window.history.back()}
                            data-linktext={'back-button'}
                        >
                            <span>{backLabel}</span>
                        </a>
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
                                />
                            )}
                            {headingOneUsed && (
                                <h1
                                    className={`title heading ${
                                        showTitleIcon ? 'title-icon' : ''
                                    }`}
                                    dangerouslySetInnerHTML={{
                                        __html: title
                                    }}
                                />
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
                            {ratings &&
                                ratings !== '' &&
                                ratings !== '0' &&
                                this.ratings()}
                            {this.renderShipFacts()}
                            {mapToolPortImagePin &&
                                this.state.displayPortMap && (
                                    <div className="port-map-image-container">
                                        <img
                                            className="port-map-image"
                                            src={mapToolPortImagePin}
                                            alt={
                                                mapToolPortImageAlt
                                                    ? mapToolPortImageAlt
                                                    : ''
                                            }
                                            onError={this.handleImageErrored}
                                        />
                                    </div>
                                )}

                            <div
                                className={`desc-container ${
                                    this.state.readMore ? 'readmore' : ''
                                } ${this.state.active ? 'open' : ''} ${
                                    mapToolPortImagePin &&
                                    this.state.displayPortMap
                                        ? ''
                                        : 'adjustheight'
                                }`}
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
                            {!this.state.isLVP &&
                                this.state.readMore && (
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
                            {viewCta &&
                                viewCta.url &&
                                viewCta.label && (
                                    <div className="cta-holder">
                                        <Link
                                            url=""
                                            ariaLabel={`${title} ${
                                                viewCta.label
                                            }`}
                                            ariaRole="button"
                                            dataLinktext={`${title}${cardAlignmentValue}:${
                                                viewCta.label
                                            }`}
                                            dataContenttype="CTA"
                                            {...analyticsOptions}
                                            {...this.clickProp()}
                                            linkClassName={`secondary ${
                                                ctaIcon && ctaIcon.image
                                                    ? 'cta-icon'
                                                    : 'cta-noIcon'
                                            }`}
                                        >
                                            {ctaIcon &&
                                                ctaIcon.image && (
                                                    <span>
                                                        <img
                                                            src={ctaIcon.image}
                                                            alt={ctaIcon.alt}
                                                        />
                                                    </span>
                                                )}
                                            {viewCta.label}
                                        </Link>
                                    </div>
                                )}
                            {this.state.isLVP &&
                                this.state.readMore && (
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
                            {ctaType === 'video' && this.createModal()}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

heroTileModule.propTypes = {
    type: PropTypes.string.isRequired,
    image: PropTypes.object,
    videoURL: PropTypes.string,
    cardAlignment: PropTypes.string.isRequired,
    logo: PropTypes.object,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    ctaIcon: PropTypes.object,
    ctaType: PropTypes.string,
    contentLabel: PropTypes.string,
    viewCta: PropTypes.shape({
        label: PropTypes.string,
        url: PropTypes.string,
        isExternal: PropTypes.bool
    }),
    partnerLabel: PropTypes.string,
    accessibilityPartnerLabel: PropTypes.string,
    externalContent: PropTypes.bool,
    showReadMore: PropTypes.bool,
    containerClass: PropTypes.string,
    displayPortMap: PropTypes.bool,
    readMoreMaxHeight: PropTypes.shape({
        lvp: PropTypes.number,
        smvp: PropTypes.number
    }),
    switchShipFactCaptions: PropTypes.bool,
    shortDescription: PropTypes.string,
    shortDescriptionDefault: PropTypes.bool
};

heroTileModule.defaultProps = {
    contentLabel: 'Hero Video Modal',
    showReadMore: false,
    containerClass: '',
    displayPortMap: false,
    readMoreMaxHeight: '100',
    externalContent: false,
    switchShipFactCaptions: false,
    shortDescription: '',
    shortDescriptionDefault: false
};

export default heroTileModule;
