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
import { getConfig } from '../commons/CUK/utilities';
import { calculateAge } from '../commons/CUK/dateFormat';
import moment from 'moment';

class entertainmentGrid extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            carouselModal: [],
            videoModal: [],
            render: false,
            gridList: [],
            drinkLandingPage: false,
            purchasable: false,
            showCtaLink: true,
            showUnderAge: false,
            showReserveSeat: false,
            options: [],
            youthRegistrationDaysX: 0,
            dayToCruiseDeparture: 0,
            newYouthRegistrationDate: '',
            isChildBooking: false,
            isAgentBooking: false
        };

        this.closeButton = [];
        this.openButton = [];
    }

    componentWillMount() {
        this.getDaysToCruiseDeparture();
    }

    getDaysToCruiseDeparture() {
        const userData = SessionStorage.getItem('userData');
        const { embarkationDate } = userData;
        const dayOfCruiseDeparture = new Date(
            moment(embarkationDate, 'YYYY-MM-DD').format('ll')
        );
        const today = new Date();
        const oneDay = 1000 * 60 * 60 * 24;
        const dayToCruiseDeparture = Math.ceil(
            (dayOfCruiseDeparture.getTime() - today.getTime()) / oneDay
        );

        this.loadInitialData(dayToCruiseDeparture);
    }

    loadInitialData(dayToCruiseDeparture) {
        const today = new Date();
        const userData = SessionStorage.getItem('userData');
        const header = SessionStorage.getItem('header');
        const youthRegistrationDaysX =
            getConfig('youthRegistrationDayX', '100') || 100;
        const { customer, embarkationDate, passengers } = userData;
        const { language, agent } = header;
        const passengerBirth = new Date(customer.birthDate);
        const embarkDate = new Date(embarkationDate);
        const ageAtEmbark = calculateAge(
            passengerBirth.getTime(),
            embarkDate.getTime()
        );
        const diffDays = +youthRegistrationDaysX - dayToCruiseDeparture;
        const newDate = moment(today, 'DD-MM-YYYY')
            .add(-diffDays, 'days')
            .format(language == 'en_US' ? 'MMM DD YYYY' : 'DD MMM YYYY');
        const childPassengers =
            passengers.length &&
            passengers.filter((passenger) => {
                if (passenger.birthDate == '' && passenger.age == '') {
                    return false;
                }
                return (
                    calculateAge(
                        new Date(passenger.birthDate).getTime(),
                        embarkDate.getTime()
                    ) < 18 || passenger.age < 18
                );
            });

        this.setState({
            options: [...childPassengers],
            dayToCruiseDeparture: dayToCruiseDeparture,
            youthRegistrationDaysX: youthRegistrationDaysX,
            newYouthRegistrationDate: newDate,
            isChildBooking: ageAtEmbark < 18 ? true : false,
            isAgentBooking: agent ? true : false
        });
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
        const header = SessionStorage.getItem('header');
        const { embarkationDate } = header;
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

        let userData = SessionStorage.getItem('userData');
        let underAge = userData.customer.age;

        if (underAge >= 16 && diffDays < 0) {
            this.setState({
                showReserveSeat: true
            });
        } else if (underAge < 16) {
            this.setState({ showUnderAge: true });
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
        //console.log(services);
        if (services && services.urls && services.headers) {
            this.setState({
                drinkLandingPage: true
            });

            let cruiseDuration = SessionStorage.getItem('cruiseData')
                .durationCruise;
            if (
                !bookingMinDayX == '' &&
                parseInt(cruiseDuration) < parseInt(bookingMinDayX)
            ) {
                //code forbookingMinDayX is pending
                this.setState({
                    showCtaLink: false
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
        const { backtopLabel, closeLabel } = this.props;
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

    renderKnowMore(value) {
        return (
            <div className="cta-icon-group">
                <div className="cta-link">
                    <a
                        href="javascript:void(0)"
                        style={{
                            textTransform: 'none',
                            textDecoration: 'underline'
                        }}
                        className="knowMore"
                    >
                        {value}
                    </a>
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

    renderDescription(description) {
        return (
            <div>
                <div
                    className={`description-block paragraph`}
                    dangerouslySetInnerHTML={{ __html: description }}
                />
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

    handleClick = ({ image, title, categoryId, description, iconCta }) => {
        SessionStorage.setItem('eventHeaderData', {
            image,
            title,
            categoryId,
            description
        });
        if (categoryId.includes('youth')) {
            const header = SessionStorage.getItem('header');
            const { shipCode } = header;
            const iconCtaUrl = iconCta.url.split('/youthregistration');
            const newIconCtaUrl =
                iconCtaUrl[0] + '/' + shipCode + '/youthregistration';
            window.location.href = newIconCtaUrl;
        } else {
            window.location.href =
                window.location.href + '/events/' + categoryId;
        }
    };

    renderGridItem = (gridItems, i) => {
        const {
            image,
            title,
            categoryId,
            iconCta,
            align,
            type,
            description,
            iconType,
            video,
            imagealign,
            isButton,
            isbookable,
            contentLabel
        } = gridItems;
        const {
            options,
            dayToCruiseDeparture,
            youthRegistrationDaysX,
            newYouthRegistrationDate,
            isAgentBooking,
            isChildBooking
        } = this.state;
        const {
            entertainmentPageKnowMoreLabel,
            entertainmentPageNotAvailableYetLabel,
            entertainmentPageNotAvailableForBookingWithoutChildLabel,
            entertainmentPageNotAvailableForChildLabel,
            entertainmentPageNotAvailableForTACCALabel
        } = this.props;
        const header = SessionStorage.getItem('header');
        const { shipCode } = header;
        const iconCtaUrl = iconCta.url.split('/youthregistration');
        const newIconCtaUrl =
            iconCtaUrl[0] + '/' + shipCode + '/youthregistration';
        const url = categoryId.includes('youth')
            ? newIconCtaUrl
            : window.location.href + `/events`;
        
        const dateLabel = entertainmentPageNotAvailableYetLabel.replace(
            '{date}',
            newYouthRegistrationDate
        );
        if (categoryId.includes('youth')) {
            return (
                <div className="tile-holder" key={i}>
                    <div className="tileGrid image-holder">
                        {image && <Image {...image} />}
                    </div>
                    <div className="tileGrid content">
                        <div className={`spacing-container ${align}`}>
                            <div className="title">
                                <h3 className="h2 heading">{title}</h3>
                            </div>

                            <div className="text-holder">
                                {this.renderDescription(description)}
                            </div>
                            {this.renderKnowMore(
                                entertainmentPageKnowMoreLabel
                            )}
                            {options.length !== 0 &&
                                dayToCruiseDeparture <=
                                    youthRegistrationDaysX &&
                                !isChildBooking &&
                                !isAgentBooking && (
                                    <div>
                                        <div className="type additional">
                                            <span
                                            >{`Included with your holiday`}</span>
                                        </div>
                                        <div className="category-book">
                                            <Link
                                                ariaLabel={iconCta.label}
                                                url={url}
                                                title={iconCta.label}
                                                //dataLinktext={seeDetailsLabel}
                                                linkClassName={`cta-button-outline`}
                                                onClick={(e) =>
                                                    this.handleClick({
                                                        image,
                                                        title,
                                                        description,
                                                        categoryId,
                                                        iconCta
                                                    })
                                                }
                                                styleValue={'none'}
                                            >
                                                {iconCta.label}{' '}
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            {options.length !== 0 &&
                                dayToCruiseDeparture > youthRegistrationDaysX &&
                                !isChildBooking &&
                                !isAgentBooking && (
                                    <div>
                                        <div className="youthregistrationMessage">
                                            <span
                                                dangerouslySetInnerHTML={{
                                                    __html: dateLabel
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                            {options.length === 0 &&
                                dayToCruiseDeparture > youthRegistrationDaysX &&
                                !isChildBooking &&
                                !isAgentBooking && (
                                    <div>
                                        <div className="youthregistrationMessage">
                                            <span>
                                                {
                                                    entertainmentPageNotAvailableForBookingWithoutChildLabel
                                                }
                                            </span>
                                        </div>
                                    </div>
                                )}
                            {options.length === 0 &&
                                dayToCruiseDeparture <=
                                    youthRegistrationDaysX &&
                                !isChildBooking &&
                                !isAgentBooking && (
                                    <div>
                                        <div className="youthregistrationMessage">
                                            <span>
                                                {
                                                    entertainmentPageNotAvailableForBookingWithoutChildLabel
                                                }
                                            </span>
                                        </div>
                                    </div>
                                )}
                            {isChildBooking &&
                                !isAgentBooking && (
                                    <div>
                                        <div className="youthregistrationMessage">
                                            <span>
                                                {
                                                    entertainmentPageNotAvailableForChildLabel
                                                }
                                            </span>
                                        </div>
                                    </div>
                                )}
                            {isAgentBooking &&
                                !isChildBooking && (
                                    <div>
                                        <div className="youthregistrationMessage">
                                            <span>
                                                {
                                                    entertainmentPageNotAvailableForTACCALabel
                                                }
                                            </span>
                                        </div>
                                    </div>
                                )}
                        </div>
                    </div>
                </div>
            );
        } else {
            return (
                <div className="tile-holder" key={i}>
                    <div className="tileGrid image-holder">
                        {image && <Image {...image} />}
                    </div>
                    <div className="tileGrid content">
                        <div className={`spacing-container ${align}`}>
                            <div className="title">
                                <h3 className="h2 heading">{title}</h3>
                            </div>

                            <div className="text-holder">
                                {this.renderDescription(description)}
                            </div>
                            {!this.state.showUnderAge &&
                                !this.state.showReserveSeat &&
                                isbookable && (
                                    <div>
                                        <div className="type additional">
                                            <span
                                            >{`Included with your holiday`}</span>
                                        </div>
                                        <div className="category-book">
                                            <Link
                                                ariaLabel={iconCta.label}
                                                url={url}
                                                title={iconCta.label}
                                                //dataLinktext={seeDetailsLabel}
                                                linkClassName={`cta-button-outline`}
                                                onClick={(e) =>
                                                    this.handleClick({
                                                        image,
                                                        title,
                                                        description,
                                                        categoryId
                                                    })
                                                }
                                            >
                                                {iconCta.label}{' '}
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            {!isButton && (
                                <div>
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
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            );
        }
    };
    render() {
        const header = SessionStorage.getItem('header');
        const { shipCode } = header;
        this.shipCode = shipCode;
        const gridList = this.props.gridList;
        const newGridList = gridList.filter(this.filterGridItems);
        const { render } = this.state;

        return (
            <div className="image-copy-block">
                {this.renderTitle()}
                {newGridList.map((gridItems, i) =>
                    this.renderGridItem(gridItems, i)
                )}
            </div>
        );
    }
}

entertainmentGrid.defaultProps = {
    contentLabel: 'entertainmentGrid'
};

export default entertainmentGrid;
