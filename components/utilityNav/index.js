'use strict';

import React, { PureComponent } from 'react';
import Link from '../commons/CUK/link';
import PubSub from '../commons/CUK/pubsub';
import topics from '../../library/js/config/topics';
import {
    needsSalutation,
    getUserLabel,
    clearLoginData
} from '../commons/CUK/login-data-utility';
import logoutHandler from '../commons/CUK/logoutHandler';
// import { daysToDeparture } from '../commons/CUK/utilities';
import SessionStorage from '../commons/CUK/session-storage';
import FetchData from '../commons/CUK/fetch-data';
import moment from 'moment';
import validateSession from '../commons/CUK/validateSession';
import analytics from '../commons/CUK/analytics';

class utilityNav extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            isTooltipVisible: false,
            dayToCruiseDeparture: 0,
            numberOfItems: 0
        };
    }

    componentWillMount() {
	PubSub.subscribe(topics.ADD_TO_CART, this.updateCartOnContinueShoping);
    }

    componentDidMount() {
        // this.favCountSubscriber = PubSub.subscribe(topics.FAVOURITES_UPDATED, this.setFavoriteCount);
        if (!validateSession.checkCookie(['wcmmode'])) {
            this.getNumberOfItem();
            this.getDaysToCruiseDeparture();
        }
    }

    updateCartOnContinueShoping = (msg, data) => {
    	this.setState(
            () => ({
		numberOfItems: data.numberOfItems
            })
        );
    }

    // componentWillUnmount() {
    //     PubSub.unsubscribe(this.favCountSubscriber);
    // }

    getDaysToCruiseDeparture() {
        const userData = SessionStorage.getItem('userData');
        const { embarkationDate } = userData;

        const dayOfCruiseDeparture = new Date(
            moment(embarkationDate, 'YYYY-MM-DD').format('ll')
        );
        // parts = embarkationDate.split('-');
        // dayOfCruiseDeparture = new Date(parts[0], parts[1] - 1, parts[2]);
        const today = new Date();
        const oneDay = 1000 * 60 * 60 * 24;
        const dayToCruiseDeparture = Math.ceil(
            (dayOfCruiseDeparture.getTime() - today.getTime()) / oneDay
        );

        this.setState(
            () => ({
                dayToCruiseDeparture
            }),
            () => {
                const { dayToDepartureHandler } = this.props;
                const { dayToCruiseDeparture } = this.state;

                dayToDepartureHandler &&
                    dayToDepartureHandler(dayToCruiseDeparture);
            }
        );
    }

    getNumberOfItem() {
        const { services } = this.props;
        const { minicartApi } = services.urls;
        const configs = typeof window !== 'undefined' ? window.configs : {};
        const { locale, apikeyMycruise } = configs;
        const header = SessionStorage.getItem('header');

        // url = `${url}?lang=${window.configs.locale}`;
        const url = `${minicartApi}?lang=${locale}&fields=BASIC`;
        FetchData(url, {
            method: 'GET',
            headers: {
                'Cache-Control': 'no-cache',
                'X-Source-Identity-Token-0': apikeyMycruise,
                'X-CommonData': JSON.stringify(header)
            }
        }).then((res) => {
            if(res !== undefined && res !== '')
            {
		let countOfItems = res.totalItemsCount;
                this.setState(
                    () => ({
                        numberOfItems: res.totalItemsCount
                    }),
                    () => {
                        const { numberOfItemsHandler } = this.props;
                        const { numberOfItems } = this.state;

                        numberOfItemsHandler && numberOfItemsHandler(countOfItems);
                    }
                );
            }
        });
    }
    handleNavElement(item) {
        const { navType, showIcon, title, linkUrl, isExternal, label } = item;
        const { dayToCruiseDeparture, numberOfItems } = this.state;

        switch (navType) {
            case 'countdown':
                return (
                    <div className="nav__countdown">
                        <span className="nav-text">
                            <span className="em">{dayToCruiseDeparture}</span>
                            {title}
                        </span>
                    </div>
                );
            case 'logout':
                return (
                    <div>
                        <span className={`nav-text ${showIcon ? navType : ''}`}>
			    {title} {getUserLabel()}
                        </span>
                        <Link
                            url="#"
                            ariaRole="menuitem"
                            onClick={() => {
                                this.handleLogout(linkUrl);
                            }}
                            isExternal={isExternal}
                            linkClassName={`nav-link ${
                                showIcon ? navType : ''
                            }`}
                            ariaLabel={`${title} ${navType}`}
                        >
                            {label}
                        </Link>
                    </div>
                );
            case 'cart':
                // api call to Hybris to know how many items are in the cart
                // /{baseSiteId}/users/<userId>/carts/<cartId>/minicart
                // /pno/users/current/carts/current/minicart
                // lang from config
                return (
                    <div>
                        <Link
                            url={linkUrl ? linkUrl : '#'}
                            ariaRole="menuitem"
                            isExternal={isExternal}
                            linkClassName={`nav-link ${
                                showIcon ? navType : ''
                            }`}
                            ariaLabel={`${title} ${navType}`}
                        >
                            {label}
                        </Link>
                        {numberOfItems > 0 && (
                            <span className="cart-label">{numberOfItems}</span>
                        )}
                    </div>
                );
            case 'orders':
                return (
                    <div>
                        <Link
                            url={linkUrl ? linkUrl : '#'}
                            ariaRole="menuitem"
                            isExternal={isExternal}
                            linkClassName={`nav-link ${
                                showIcon ? navType : ''
                            }`}
                            ariaLabel={`${title} ${navType}`}
                        >
                            {label}
                        </Link>
                    </div>
                );
            default:
                return (
                    <div>
                        <Link
                            url={linkUrl ? linkUrl : '#'}
                            ariaRole="menuitem"
                            isExternal={isExternal}
                            linkClassName={`nav-link `}
                            ariaLabel={title}
                        >
                            {label}
                        </Link>
                    </div>
                );
        }
    }

    getElement = (item, index) => (
        <li
            key={index}
            className={`nav-item`}
            data-name={item.navType}
            role="presentation"
        >
            {this.handleNavElement(item)}
        </li>
    );

    /**
     * handleLogOut - Logs the user out
     * @param {object}  linkUrl  - link to redirect
     */
    handleLogout = (linkUrl) => {
        // logoutOptions not necessary for myCruise, for now
        // const { urls, headers } = this.props.services;
        // const logoutOptions = {
        //     logoutAPIUrl: urls.logoutAPIUrl,
        //     headers: headers,
        //     postLogout: this.resolveLogoutApiData
        // };

        // logoutHandler(logoutOptions);
        analytics.clickTracking(this);
        logoutHandler(linkUrl);
    };

    /**
     * resolveLogoutApiData - receive data from API and clear session and reload the page
     * @param {object}  response  - data received from API
     */
    resolveLogoutApiData = (response) => {
        const { errors } = response;
        if (!errors || errors[0].code === '5025') {
            clearLoginData();
            location.reload();
        }
    };

    render() {
        const { navItems, className } = this.props;

        const navItemsList =
            navItems && navItems.length ? navItems.map(this.getElement) : [];

        return (
            <div className={`utility-nav-container bg ${className}`}>
                <ul className="nav" role="menubar">
                    {navItemsList}
                </ul>
            </div>
        );
    }
}

utilityNav.defaultProps = {
    contentLabel: 'Header Call Me Back Modal',
    backtopLabel: 'Back To Top',
    closeLabel: 'Close'
};

export default utilityNav;
