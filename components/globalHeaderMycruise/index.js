import React, { Component } from 'react';
import UtilityNav from '../utilityNav/index';
import analytics from '../commons/CUK/analytics';
import Link from '../commons/CUK/link';
import SessionStorage from '../commons/CUK/session-storage';
import { breakpoint } from '../../library/js/config/index';
import scrollFocussedElement from '../commons/CUK/scrollFocussedElement';
import extractChildComponent from '../commons/CUK/extractChildComponent';
import {
    needsSalutation,
    getUserLabel
} from '../commons/CUK/login-data-utility';
import SessionLogout from '../commons/CUK/sessionLogout';
import PubSub from '../commons/CUK/pubsub';
import topics from '../../library/js/config/topics';
import { getConfig, sessionRedirectUrl } from '../commons/CUK/utilities';
import validateSession from '../commons/CUK/validateSession';
import { checkCookie, getCookie } from '../commons/CUK/cookies';

const VIEWPORT_TYPE = breakpoint.VIEWPORT_TYPE;
const watchForBreakpoint = breakpoint.watchForBreakpoint;

class globalHeaderMycruise extends Component {
    constructor(props) {
        super(props);
        this.state = {
            openMenu: false,
            isLVP: true,
            dayToCruiseDeparture: 0,
            numberOfItems: 0,
            showConfirmationPopup: false
        };
        this.mainNavItems = [];
        this.utilityNavObj = {};
    }

    componentWillMount() {
        if (!validateSession.checkCookie(['wcmmode'])) {
            const {
                navigationItems,
                secondaryNavItems,
                childComponents,
                services
            } = this.props;
            const enableEntertainmentValue = getConfig(
                'enableEntertainment',
                ''
            );
            const enableCookieEntertainment = getCookie('enableCookieEntertainment');
        
            const checkEntertainmentValue =
                enableEntertainmentValue == 'true' || enableCookieEntertainment == 'true' ? true : false;

            this.mainNavItems =
                navigationItems && navigationItems.length
                    ? navigationItems.map((navItem, index) => {
                        return this.generateMainNavigation(navItem, index);
                    })
                    : [];
            this.secondaryNavItems = !checkEntertainmentValue
                ? secondaryNavItems && secondaryNavItems.length
                    ? secondaryNavItems
                          .filter(
                              (e) =>
                                  e.directLinkTarget.split('/')[
                                      e.directLinkTarget.split('/').length - 1
                                  ] !== 'entertainment'
                          )
                          .map(this.generateSecondaryNavigation)
                    : []
                : secondaryNavItems && secondaryNavItems.length
                    ? secondaryNavItems.map(this.generateSecondaryNavigation)
                    : [];

            if (childComponents.length) {
                childComponents.map((component) => {
                    if (component !== null) {
                        this.utilityNavObj =
                            component.type === 'utilityNav'
                                ? component.attributes
                                : this.utilityNavObj;
                        this.utilityNavObj = {
                            ...this.utilityNavObj,
                            services
                        };
                    }
                });
            }
            this.getGreetingLabel();
            this.getCountDown();
            this.brand = getConfig('brand', '');

            PubSub.subscribe(topics.ADD_TO_CART, this.listenConfirmation);
        }
        const portCalls = SessionStorage.getItem('portCalls');
        if ((portCalls == undefined || portCalls == null) && !validateSession.checkCookie(['wcmmode'])) {
            sessionRedirectUrl();
        }
    }

    componentDidMount() {
        if (!validateSession.checkCookie(['wcmmode'])) {
            const mqlLVP = watchForBreakpoint(VIEWPORT_TYPE.DESKTOP);

            this.handleResize(mqlLVP);
            mqlLVP.addListener((mql) => {
                this.handleResize(mql);
            });
            // analytics.clickTracking(this);
            const alertHeaderWrapper = typeof document !== 'undefined' && document.getElementsByClassName(
                'alert-header-wrapper'
            )[0];
            if (typeof alertHeaderWrapper !== 'undefined') {
                setTimeout(() => {
                    const height = alertHeaderWrapper.offsetHeight;
                    scrollFocussedElement.scrollToFocus(height);
                }, 1000);
            }

            this.header = typeof document !== 'undefined' && document.querySelector('.global-header-wrapper');
            this.heightHeader = typeof this.header !== 'undefined' && this.header.getBoundingClientRect().height;
            typeof this.header !== 'undefined' && this.handleScroll(this.heightHeader);

            const header = SessionStorage.getItem('header');
            const cruiseData = SessionStorage.getItem('cruiseData');
            let dobArray = [];
            header.passengers.forEach((passenger) => {
                dobArray.push(passenger.birthDate);
            })
            const config =
                typeof window !== 'undefined'
                    ? window.configs
                    : '';
            const customCurrencyCode = config.brand.toLowerCase() === "po" ? "gbp" : "usd";

            analytics.setAdditionalPageTrackAttributes({
                myCruiseDetails: {
                    bookingNumber: header.bookingRef,
                    voyageID: header.cruiseCode,
                    voyageName: cruiseData.cruiseName,
                    shipName: cruiseData.shipName,
                    depDate: header.embarkationDate,
                    destName: "",
                    durationDays: header.physicalCruiseDuration,
                    depPortName: cruiseData.embarkPort,
                    destPortName: cruiseData.disembarkPort,
                    stateroomType: "",
                    numGuests: header.passengers.length,
                    dob: dobArray,
                },
                loginStatus: "logged in",
                loginType: (header.agent) ? header.agent.agentType : 'customer',
                AgentID: (header.agent) ? header.agent.id : '',
                crmID: "",
                country: header.market,
                languageSelected: header.language.substring(0, 2),
                customCurrencyCode: customCurrencyCode,
                memberLoyaltyLevel: header.customer.loyaltyTier,
                server: "",
                localDayTime: new Date().toString(),
                timePartingCodes: "",
                pageType: config.pageName,
                //Please refer Page and Content Hierarchy Tabs for below values
                sectionLevelOne: "",
                sectionLevelTwo: "",
                sectionLevelThree: "",
                sectionLevelFour: "",
                pageName: config.pageName,
                pageChannel: "",
                pageHier: "",
                //Please refer Page and Content Hierarchy Tabs for above values
                ecomStep: ''
            });
        }
    }

    listenConfirmation = (msg, data) => {
        this.setState(
            () => ({
                showConfirmationPopup: true,
                productName: data.name,
                productTotal: data.total,
                productCurrency: data.currency,
                numberOfItems: data.numberOfItems,
                event_product_description: data.eventDescription
                    ? data.eventDescription
                    : data.diningDescription
                        ? data.diningDescription
                        : '',
                event_lower_description: data.eventLowerDescription
                    ? data.eventLowerDescription
                    : data.diningLowerDescription
                        ? data.diningLowerDescription
                        : '',
                show_event_description: data.show_event_Description
                    ? data.show_event_Description
                    : data.show_dining_Description
                        ? data.show_dining_Description
                        : false,
                spa_product_description: data.spaDescription
                    ? data.spaDescription
                    : '',
                show_spa_description: data.show_spa_description
                    ? data.show_spa_description
                    : false
            }) //,
            //this.handleNumberOfItems(data.numberOfItems)
        );
        let popupTimeDelay = getConfig('popupTimeDelay', '');
        if (popupTimeDelay != '' && popupTimeDelay > 0) {
            this.closeDelayed(popupTimeDelay);
        }
        // scrolling the page will close the popUp
        // window.addEventListener('scroll',  this.closePopUp);

        //window.addEventListener('click', this.closePopUp);
    };

    keepOpen = () => {
        clearTimeout(this.time);
        this.setState(() => ({ showConfirmationPopup: true }));
    };

    closeDelayed = (popupTimeDelay) => {
        const tm = popupTimeDelay * 1000;
        // close poup after some sec
        this.time = setTimeout(() => {
            this.setState(() => ({ showConfirmationPopup: false }));
        }, tm);
    };

    generateMainNavigation(navItem, index) {
        const { isFlightPageLink } = navItem;
        const showFlight = SessionStorage.getItem('showFlight');
        return showFlight === true || isFlightPageLink !== true ? (
            <li key={index} className="main-nav-item" role="presentation">
                {this.getElement(navItem)}
            </li>
        ) : null;
    }

    generateSecondaryNavigation = (navItem, index) => (
        <li key={index} className="secondary-nav-item" role="presentation">
            {this.getElement(navItem)}
        </li>
    );

    getElement(navItem) {
        const { closeButtonText } = this.props;
        const { isLVP } = this.state;
        const linkClassName = navItem.active === true ? 'active' : '';
        const { directLinkTarget, globalNavigationTitle, active } = navItem;

        navItem = Object.assign({ closeButtonText }, navItem);
        
        return (
            <Link
                url={directLinkTarget ? directLinkTarget : '#'}
                ariaHaspopup="false"
                ariaLabel={globalNavigationTitle}
                ariaRole="menuitem"
                linkClassName={`main-nav-link ${linkClassName}`}
                dataLinktext={`primary Nav:${globalNavigationTitle}`}
            >
                {globalNavigationTitle}
            </Link>
        );
    }

    handleScroll = (height) => {
        window.addEventListener('scroll', (event) => {
            const isScrolled = window.pageYOffset > 0;
            this.header.classList.toggle('scrolled', isScrolled);
            this.header.classList.toggle('rev-scrolled', !isScrolled);
            typeof document !== 'undefined' && document.body.classList.toggle('marginBody', isScrolled);
        });
    };

    handleDayToDeparture = (dayToCruiseDeparture) => {
        this.setState(() => ({
            dayToCruiseDeparture
        }));
    };

    handleNumberOfItems = (numberOfItems) => {
        this.setState(() => ({
            numberOfItems
        }));
    };

    handleResize(mql) {
        this.setState(() => ({
            isLVP: mql.matches
        }));
    }

    componentDidUpdate() {
        // analytics.clickTracking(this);
        const { openMenu, isLVP } = this.state;
        /**
         * To retain focus inside menu in small viewports
         */
        if (!isLVP && typeof this.nav !== 'undefined') {
            this.nav.setAttribute(
                'style',
                `display: ${openMenu ? 'inline-block' : 'none'}`
            );
            openMenu ? this.close.focus() : this.toggle.focus();

            const anchors = this.nav.getElementsByTagName('a');
            const lastAnchor = anchors[anchors.length - 1];

            // To shift focus to close button after tabbing from last anchor
            lastAnchor.addEventListener('keydown', (e) => {
                e.keyCode === 9 && !e.shiftKey
                    ? (this.close.focus(),
                        e.preventDefault(),
                        e.stopPropagation())
                    : '';
            });
            // To shift focus to last anchor after reverse tabbing from close button
            this.close.addEventListener('keydown', (e) => {
                e.keyCode === 9 && e.shiftKey
                    ? (lastAnchor.focus(),
                        e.preventDefault(),
                        e.stopPropagation())
                    : '';
            });
        }
        // To display navigation after zooming out from small viewports
        if (isLVP) {
            this.nav.setAttribute('style', 'display: inline-block');
        }
    }

    toggleMenu = () => {
        analytics.clickTracking(this);
        this.setState(
            (prevState) => ({ openMenu: !prevState.openMenu }),
            () => {
                const { isLVP, openMenu } = this.state;
                !isLVP &&
                    typeof document !== 'undefined' && document.body.classList.toggle('openOverlay', !openMenu);
            }
        );
    };
    getGreetingLabel() {
        const salutationNeeded = needsSalutation();
        this.utilityNavObj.navItems.map((item) => {
            if (item !== null && item.navType === 'logout') {
                this.greetings = salutationNeeded ? item.title : '';
            }
        });
    }
    getCountDown() {
        this.utilityNavObj.navItems.forEach((item) => {
            if (item !== null && item.navType === 'countdown') {
                this.countdownText = item.title;
            }
        });
    }

    closePopUp = () => {
        analytics.clickTracking(this);
        this.setState(() => ({
            showConfirmationPopup: false
        }));
    };

    renderLogo() {
        const { headerLogo } = this.props;
        const { url, alt, image, isExternal } = headerLogo;
        let logoUrl = '';
        if (SessionStorage.getItem('userData')) {
            let shipCode = SessionStorage.getItem('userData').shipCode;
            let urlHomepage = getConfig('homepageUrl', '');
            logoUrl = urlHomepage.replace('{shipCode}', shipCode);
        } else {
            logoUrl = url;
        }

        return (
            <div className="nav-brand-logo">
                <Link
                    url={logoUrl}
                    ariaHaspopup="false"
                    ariaLabel="PO Logo"
                    // ariaRole="logo"
                    linkClassName="brand-logo"
                    dataLinktext={`header:${this.brand}:logo`}
                    dataContentname={`${this.brand} Logo`}
                    dataContenttype="image"
                    ariaLabel={alt}
                    isExternal={isExternal}
                >
                    <img src={image} alt={alt} />
                </Link>
            </div>
        );
    }

    handleRebookLabelCLick() {
        window.history.forward();
    }

    render() {
        const {
            closeButtonText,
            headerLogo,
            linkUrl,
            isExternal,
            label,
            childComponents,
            skipToContentLabel
        } = this.props;
        const {
            spa_product_description,
            show_spa_description,
            numberOfItems,
            dayToCruiseDeparture,
            showConfirmationPopup,
            productName,
            productCurrency,
            productTotal,
            openMenu,
            event_lower_description,
            event_product_description,
            show_event_description,
            isLVP
        } = this.state;

        const menuActive = openMenu ? ' active' : '';
        const utilityNavProps = extractChildComponent(
            childComponents,
            'addedToCart'
        );
        const { attributes } = utilityNavProps;

        const {
            addedToCartLabel,
            totalCost,
            goToCartLabel,
            continueShoppingCtaLabel,
            rebookServiceLabel
        } = attributes.labels;

        const userLabel = getUserLabel();
        let loginUrl = '';
        this.utilityNavObj.navItems.map((item) => {
            if (item !== null && item.navType === 'logout') {
                loginUrl = item.linkUrl;
            }
        });
        // const dayToCruiseDeparture = daysToDeparture(this.props.services.urls.upcomingCruises);

        const cartUrl = getConfig('cartUrl', '#');

        const addToCartPopUpData = SessionStorage.getItem('addToCartPopUp');

        return (
            <div className="global-header-wrapper">
                {skipToContentLabel && (
                    <Link
                        url="#content"
                        linkClassName="sr-only skip-to-content"
                    >
                        {skipToContentLabel}
                    </Link>
                )}
                <SessionLogout {...this.props} />
                <header className="global-header-container">
                    <nav className="global-header">
                        <div className="menu-bar-small">
                            {headerLogo && this.renderLogo()}
                            <div className="nav-toggle-btn">
                                <Link
                                    url={cartUrl || '#'}
                                    ariaRole="menuitem"
                                    isExternal={isExternal}
                                    linkClassName={`nav-link cart`}
                                    ariaLabel={label}
                                />
                                {numberOfItems > 0 && (
                                    <span className="cart-label">
                                        {numberOfItems}
                                    </span>
                                )}
                                <Link
                                    url="JavaScript:void(0)"
                                    onClick={this.toggleMenu}
                                    linkClassName="toggle-btn"
                                    reference={(toggle) =>
                                        (this.toggle = toggle)
                                    }
                                >
                                    <span className="sr-only">
                                        toggle button
                                    </span>
                                </Link>
                            </div>
                            <div className="nav-Curve" aria-hidden="true" />
                        </div>
                        {showConfirmationPopup && (
                            <div className="popup" onMouseEnter={this.keepOpen}>
                                <a
                                    href="#"
                                    className="popup__close"
                                    data-linktext={'popup-close'}
                                    onClick={this.closePopUp}
                                />
                                <h4 className="popup__title">
                                    {productName || ''}
                                </h4>
                                {show_spa_description && (
                                    <p className="popup__desc spa_product_description">
                                        {spa_product_description}
                                    </p>
                                )}
                                {show_event_description && (
                                    <p className="popup__desc spa_product_description">
                                        {event_product_description}
                                    </p>
                                )}
                                <p className="popup__desc">
                                    {addedToCartLabel}
                                </p>
                                <p className="popup__price">
                                    {`${totalCost} `}
                                    <span>
                                        {`${productCurrency}` || ''}
                                        {productTotal || '0.00'}
                                    </span>
                                </p>
                                {show_event_description && (
                                    <p className="popup__lower_desc">
                                        {event_lower_description}
                                    </p>
                                )}
                                <div
                                    className={`${
                                        show_spa_description ||
                                        show_event_description
                                            ? 'popup__cta__spa'
                                            : 'popup__cta'
                                    }`}
                                >
                                    <a
                                        href={cartUrl}
                                        onClick={this.closePopUp}
                                        data-linktext={'popup-close'}
                                        className="cta-primary"
                                    >
                                        {goToCartLabel}
                                    </a>
                                    <a
                                        href="JavaScript:void(0)"
                                        onClick={this.closePopUp}
                                        data-linktext={'popup-close'}
                                        className="cta-primary-light-blue"
                                    >
                                        {continueShoppingCtaLabel}
                                    </a>
                                </div>
                                {show_spa_description && (
                                    <div
                                        onclick={this.closePopUp}
                                        className="popup__desc rebookServiceLabel spa_product_description"
                                    >
                                        <a
                                            href={
                                                addToCartPopUpData.rebookRedirectUrl
                                                    ? addToCartPopUpData.rebookRedirectUrl
                                                    : ''
                                            }
                                        >
                                            {rebookServiceLabel}
                                        </a>
                                    </div>
                                )}
                            </div>
                        )}
                        <div
                            className="navigation"
                            ref={(nav) => (this.nav = nav)}
                        >
                            {isLVP && (
                                <UtilityNav
                                    {...this.utilityNavObj}
                                    className="lvp-utility-nav"
                                    isLVP={isLVP}
                                    numberOfItemsHandler={
                                        this.handleNumberOfItems
                                    }
                                    dayToDepartureHandler={
                                        this.handleDayToDeparture
                                    }
                                />
                            )}
                            <div className={`main-nav-container${menuActive}`}>
                                <div className="menu-bar">
                                    <div className="nav__countdown">
                                        <span className={`nav-text`}>
                                            {this.greetings} {userLabel}
                                        </span>
                                        <span className="nav-text">
                                            <span className="em">
                                                {`${dayToCruiseDeparture} `}
                                            </span>
                                            {this.countdownText}
                                        </span>
                                    </div>
                                    <div className="nav-close-btn">
                                        <Link
                                            url="JavaScript:void(0)"
                                            ariaRole="button"
                                            onClick={this.toggleMenu}
                                            linkClassName="close-btn"
                                            title={closeButtonText}
                                            reference={(close) =>
                                                (this.close = close)
                                            }
                                        >
                                            <span className="sr-only">
                                                {closeButtonText}
                                            </span>
                                        </Link>
                                    </div>
                                </div>
                                <ul className="main-nav" role="menubar">
                                    {this.mainNavItems}
                                </ul>
                                <ul className="secondary-nav" role="menubar">
                                    {this.secondaryNavItems}
                                </ul>

                                {!isLVP && (
                                    <UtilityNav
                                        {...this.utilityNavObj}
                                        className="svp-utility-nav"
                                        isLVP={isLVP}
                                        numberOfItemsHandler={
                                            this.handleNumberOfItems
                                        }
                                        dayToDepartureHandler={
                                            this.handleDayToDeparture
                                        }
                                    />
                                )}
                            </div>
                        </div>
                    </nav>
                </header>
                <div id="content" />
            </div>
        );
    }
}

export default globalHeaderMycruise;
