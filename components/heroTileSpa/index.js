'use strict';

import React from 'react';
import SessionStorage from '../commons/CUK/session-storage';
import HeroTileModuleMycruise from '../heroTileModuleMycruise';
import { getConfig } from '../commons/CUK/utilities';
import validateSession from '../commons/CUK/validateSession';
import FetchData from '../commons/CUK/fetch-data';
import Link from '../commons/CUK/link';

class heroTileSpa extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            purchasable: true
        };
    }

    componentDidMount() {
        if (!validateSession.checkCookie(['wcmmode'])) {
            this.getProductsList();
            // update session storage only when leaving the page, so doesnt show the current page in the recently viewed
            window.addEventListener('beforeunload', this.setSessionStorageInfo);
        }
        const { catgeoryId } = this.props;
        SessionStorage.setItem('catgeoryId', catgeoryId);
    }

    /**
     * getProductList - API call to get the product instances
     */
    getProductsList() {
        // const apikeyMycruise = getConfig('apikeyMycruise', '');

        // const { services } = this.props;
        // let { treatmentsApi } = services.urls;
        // const header = SessionStorage.getItem('header');

        const apikeyMycruise = getConfig('apikeyMycruise', '');
        const productId = getConfig('productId', '');
        const { services, productDetailServlet, heroVariation } = this.props;
        const { brand } = services.headers;
        let { treatmentsApi } = services.urls;
        const header = SessionStorage.getItem('header');
        const { embarkationDate } = header;
        const API = heroVariation
            ? `${treatmentsApi}${productId}_Oasis/treatments?${heroVariation}`
            : `${treatmentsApi}${productId}_Oasis/treatments`;
        const servlet = treatmentsApi;

        treatmentsApi = brand === 'po' ? API : servlet;

        return FetchData(treatmentsApi, {
            method: 'GET',
            headers: {
                'X-CommonData': JSON.stringify(header),
                'X-Source-Identity-Token-0': apikeyMycruise,
                'cache-control': 'no-cache'
            }
        }).then((res) => {
            const { treatments } = res;
            const allNotAvailable = treatments.reduce(
                (allNotAvailable, treatment) => ({
                    flag: treatment.purchasable ? false : allNotAvailable.flag,
                    code: treatment.purchasable
                        ? false
                        : treatment.nonAvailabilityMessage.code
                }),
                { flag: true, code: false }
            );
            this.setState(() => ({
                purchasable: !allNotAvailable.flag,
                nonAvailabilityMessage: allNotAvailable.code
            }));
        });
    }

    setSessionStorageInfo = () => {
        const { description, title, image, spaPageUrl } = this.props;

        const header = SessionStorage.getItem('header');
        const { bookingRef = '', customer } = header;
        const { firstName = '', lastName = '' } = customer;
        const productId = getConfig('productId', '');
        const locale = getConfig('locale', '');

        const viewed = localStorage.getItem('viewed')
            ? JSON.parse(localStorage.getItem('viewed'))
            : {};

        if (!viewed[`${locale}_${bookingRef}_${firstName}_${lastName}`]) {
            viewed[`${locale}_${bookingRef}_${firstName}_${lastName}`] = [];
        }

        // check if shorex is already in recently viewed, if it is, we delete it to push ot in forst position

        viewed[`${locale}_${bookingRef}_${firstName}_${lastName}`] = viewed[`${locale}_${bookingRef}_${firstName}_${lastName}`].filter(
            ({ code }) => code !== productId
        );

        viewed[`${locale}_${bookingRef}_${firstName}_${lastName}`] = [
            {
                type: 'spaCard',
                code: productId,
                description: description,
                name: title,
                url: spaPageUrl,
                image: image
            },
            ...viewed[`${locale}_${bookingRef}_${firstName}_${lastName}`]
        ];

        viewed[`${locale}_${bookingRef}_${firstName}_${lastName}`].length >= 12 && viewed[`${locale}_${bookingRef}_${firstName}_${lastName}`].pop();
        localStorage.setItem('viewed', JSON.stringify(viewed));
    };

    /**
     * createCta - Handles markup creation for cta
     * providing error message with informational tooltip
     * in case of cta not available.
     *
     * @returns {JSX} resulting markup to show
     */
    createCta() {
        const {
            notOnSaleAnymoreLabel,
            notOnSaleAnymoreInfo,
            comingSoonLabel,
            comingSoonInfo
        } = this.props;
        const addToCartLabel = "ADD TO CART";
        const { hover, purchasable, nonAvailabilityMessage } = this.state;
        const display = hover ? 'block' : 'none';
        const tooltipStyle = { display };
        const info =
            nonAvailabilityMessage ===
                'SPA_INSTANCE_SALABLE_DEADLINE_CRITERIA_MET'
                ? notOnSaleAnymoreInfo
                : comingSoonInfo;
        const label =
            nonAvailabilityMessage ===
                'SPA_INSTANCE_SALABLE_DEADLINE_CRITERIA_MET'
                ? notOnSaleAnymoreLabel
                : comingSoonLabel;
        return !purchasable ? (
            <div>
                <div className="cta-holder">
                    <Link
                        url=""
                        ariaLabel={`${addToCartLabel}`}
                        label={addToCartLabel}
                        url="#"
                        linkClassName=""
                        dataLinktext={addToCartLabel}
                    >
                        {addToCartLabel}
                    </Link>
                </div>
            </div>
        ) : (<div>
            <div className="cta-holder">
                <Link
                    url=""
                    ariaLabel={`${addToCartLabel}`}
                    label={addToCartLabel}
                    url="#"
                    linkClassName=""
                    dataLinktext={addToCartLabel}
                >
                    {addToCartLabel}
                </Link>
            </div>
        </div>);
    }

    closeTooltip = (event) => {
        event.preventDefault();
        this.setState({ hover: false });
    };

    handleMouseIn = () => {
        this.setState({ hover: true });
    };

    handleMouseOut = () => {
        this.setState({ hover: false });
    };

    render() {
        const { ageRestrictedLabel } = this.props;
        return (
            <HeroTileModuleMycruise
                {...this.props}
                headingOneUsed={true}
                showReadMore={true}
            >

                <div className="subtitle subtitle-ageRestricted">
                    {ageRestrictedLabel}
                    <span
                        className="afar-label"
                        aria-label={ageRestrictedLabel}
                    />
                </div>
            </HeroTileModuleMycruise>
        );
    }
}

heroTileSpa.defaultProps = {
    readMoreMaxHeight: {
        lvp: 154,
        mvp: 154,
        svp: 100
    }
};

export default heroTileSpa;
