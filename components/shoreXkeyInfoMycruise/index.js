/**
 * Component - C035 - ShoreX key Information
 */
'use strict';

import React from 'react';
// import PropTypes from 'prop-types';
import Image from '../commons/CUK/image';
import analytics from '../commons/CUK/analytics';
import Link from '../commons/CUK/link';
import KeyFacts from './keyFacts';
import InfoDetail from './infoDetail';
import Cookie from '../commons/CUK/cookie';
import ProductCode from './productCode';
import PubSub from '../commons/CUK/pubsub';
import { topics } from '../../library/js/config/index';
import videoplayer from '../commons/CUK/videoplayer';
import { isLoggedIn } from '../commons/CUK/login-data-utility';
import updateFavourites from '../commons/CUK/updateFavourites';
import ReadMoreOrLess from '../commons/CUK/readMoreOrLess';
import fetchData from '../commons/CUK/fetch-data';
import SessionStorage from '../commons/CUK/session-storage';
import { breakpoint } from '../../library/js/config/index';
import ShorexOverlay from '../shorexOverlay';
import extractChildComponent from '../commons/CUK/extractChildComponent';
import validateSession from '../commons/CUK/validateSession';
import { convertValueToVaildDecimalPoint } from '../commons/CUK/utilities';

const { VIEWPORT_TYPE, watchForBreakpoint } = breakpoint;
const COOKIE_FAVORITE_SHOREX = 'favoriteShoreX';

class shoreXkeyInfoMycruise extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            showModal: false,
            isLVP: false,
            isMVP: false,
            hasReadMore: false,
            active: false,
            apiCalled: false,
            ageRestricted: false,
            pricesInfo: '',
            variations: '',
            portLabel: '',
            purchasable: true,
            portcode: ''
        };
    }

    componentWillMount() {
        const { excursionInfoData } = this.props;
        excursionInfoData.map((item) => {
            this.setState(() => {
                const stateObj = {};
                stateObj[item.key] = item.statistic;
                return stateObj;
            });
        });

        if (!this.state.apiCalled) {
            const {
                shorexId
            } = this.props;

            const urls = typeof this.props.services !== 'undefined' && typeof this.props.services.urls !== 'undefined' && this.props.services.urls;
            const url = (typeof urls !== 'undefined' && `${urls.productDetailsApi}/${shorexId}`) || "";
            const header = SessionStorage.getItem('header');
            const configs = typeof window !== 'undefined' ? window.configs : {};
            const apiKey = configs.apikeyMycruise;
            fetchData(url, {
                method: 'GET',
                headers: {
                    'X-CommonData': JSON.stringify(header),
                    'X-Source-Identity-Token-0': apiKey
                }
            }).then((res) => this.handleApiResponse(res));
        }
    }

    handleApiResponse(res) {

        let unitPrice = '';
        let unitPriceChild = '';
        res.prices.forEach((value) => {
            if (value.userPriceGroup === 'ADULT') {
                unitPrice = value.minValue;
            }
            if (value.userPriceGroup === 'CHILD') {
                unitPriceChild = value.minValue;
            }
        })

        const configs = typeof window !== 'undefined' ? window.configs : {};
        const currencyLocale = configs.currencyLocale;

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
            ecomStep: "",
            event: 'prodView',
            myCruiseProduct: {
                status: res.productStatus,
                productID: res.code,
                productName: res.name,
                productType: 'shorex',
                startDateTime: res.startDates.length ? res.startDates.join() : res.startDates,
                unitPrice_GBP: unitPrice ? convertValueToVaildDecimalPoint(unitPrice) : '',
                unitPrice_local: unitPrice ? convertValueToVaildDecimalPoint(unitPrice) : '',
                unitSalePrice_GBP: unitPrice ? convertValueToVaildDecimalPoint(unitPrice) : '',
                unitSalePrice_local: unitPrice ? convertValueToVaildDecimalPoint(unitPrice) : '',
                shorexAttributes: {
                    portName: res.port.longName,
                    language: "en",
                    activityLevel: "",
                    duration: "",
                    transport: "",
                    minAge: "",
                    maxAge: "",
                    tourType: [""],
                    tourCategory: "",
                    tourFeatures: ""
                },
                diningCategory: "",
                unitPriceChild_GBP: unitPriceChild,
                unitPriceChild_local: unitPriceChild,
                skus: [{ //Spa,AIB,CookeryClass,EventDining
                    skuID: res.code,
                    skuName: res.name,
                    spaTreatmentType: "",
                    spaDuration: "",
                    unitPrice_GBP: "",
                    unitPrice_local: ""
                }]
            }
        });
        const { prices, port, startDates, categories } = res;
        const isAgeRestricted =
            prices.length === 1 && prices[0].userPriceGroup === 'ADULT';
        // save port code to get lkong name in shorex overlay
        const purchasable = res.purchasable ? res.purchasable : false;
        /* const variations =
            res.instanceStatus === 'ON_HOLD'
                ? res.instanceStatus
                : res.stock
                    ? res.stock.stockLevelStatus
                    : 'outOfStock'; */ //RP
        let variations;
        if (purchasable) {
            variations = res.stock.stockLevelStatus;
        } else {

            const variationCode = res.nonAvailabilityMessage.code;
            switch (variationCode) {
                case 'PRODUCT_STATUS_ON_HOLD':
                    variations = 'ON_HOLD';
                    break;
                case 'BOOKING_USERGROUP_UNAVAILABLE':
                    variations = 'productNotAvailable';
                    break;
                case 'PRODUCT_OUT_OF_STOCK':
                    variations = 'outOfStock';
                    break;
                case 'PRODUCT_NOT_AVAILABLE':
                    variations = 'productNotAvailable';
                    break;
                case 'MASTER_NOT_APPROVED':
                    variations = 'masterNotApproved';
                    break;
                case 'MASTER_STATUS_NOT_ACTIVE':
                    variations = 'masterStatusNotActive';
                    break;
                case 'MASTER_SALABLE_FALSE':
                    variations = 'masterSalableFalse';
                    break;
                case 'MASTER_NOT_PUBLISHED_IN_AEM':
                    variations = 'masterNotPublishedInAem';
                    break;
                case 'MASTER_ALL_USERGROUP_UNAVAILABLE':
                    variations = 'masterAllUsergroupUnavailable';
                    break;
                case 'INSTANCE_INVALID_BASE_PRODUCT_TYPE ':
                    variations = 'instanceInvalidBaseProductType';
                    break;
                case 'INSTANCE_MISSING_START_DATE':
                    variations = 'instanceMissingStartDate';
                    break;
                case 'INSTANCE_MISSING_SHIPS':
                    variations = 'instanceMissingShips';
                    break;
                case 'INSTANCE_MISSING_BASE_PRODUCT':
                    variations = 'instanceMissingBaseProduct';
                    break;
                case 'INSTANCE_NOT_APPROVED':
                    variations = 'instanceNotApproved';
                    break;
                case 'INSTANCE_STATUS_CANCELLED':
                    variations = 'instanceStatusCancelled';
                    break;
                case 'INSTANCE_SALABLE_FALSE':
                    variations = 'instanceSalableFalse';
                    break;
                case 'INSTANCE_PRICE_FOR_ADULTS_MISSING':
                    variations = 'instancePriceForAdultsMissing';
                    break;
                case 'INSTANCE_PRICE_FOR_CHILDREN_MISSING':
                    variations = 'instancePriceForChildrenMissing';
                    break;
                case 'INSTANCE_PRICE_FOR_INFANTS_MISSING':
                    variations = 'instancePriceForInfantsMissing';
                    break;
                case 'START_SALE_DATE_NOT_MET':
                    variations = 'notOnSale';
                    break;
                case 'STOP_SALE_DATE_NOT_MET':
                    variations = 'notOnSale';
                    break;
                case 'INSTANCE_NOT_VALID_FOR_CRUISE_DATES':
                    variations = 'instanceNotValidForCruiseDates';
                    break;
                case 'INSTANCE_NOT_VALID_FOR_CRUISE_SHIP':
                    variations = 'instanceNotValidForCruiseShip';
                    break;
                /* case 'START_SALE_DATE_NOT_MET':
                    variations = 'productNotAvailable';	
                    break; */
                default:
                    break;
            }
        }

        this.setState(() => ({
            apiCalled: true,
            purchasable,
            port: port,
            startDates: startDates,
            merchandisingCategories: categories,
            ageRestricted: isAgeRestricted,
            variations
        }));

        if (res.prices.length && res.prices.length > 0) {
            const { perChildLabel, perInfantLabel, perAdultLabel } = this.props;
            const childPriceLabel = perChildLabel.toString();
            const infantPriceLabel = perInfantLabel.toString();
            const adultPriceLabel = perAdultLabel.toString();
            const fromPriceLabel = this.props.fromPriceLabel.toString();
            let infantLabel, childLabel, adultLabel;

            res.prices.map((price) => {
                const tempLabel = `${
                    price.minValue !== price.maxValue
                        ? `${fromPriceLabel} `
                        : ``
                    }${price.minValue} ${price.currencyIso}`;
                switch (price.userPriceGroup) {
                    case 'INFANT':
                        infantLabel = infantPriceLabel.replace(
                            '{price}',
                            tempLabel
                        );
                        break;
                    case 'CHILD':
                        childLabel = childPriceLabel.replace(
                            '{price}',
                            tempLabel
                        );
                        break;
                    case 'ADULT':
                        adultLabel = adultPriceLabel.replace(
                            '{price}',
                            tempLabel
                        );
                        break;
                    default:
                        break;
                }
            });
            infantLabel = infantLabel ? infantLabel : '';
            childLabel = childLabel ? childLabel : '';
            adultLabel = adultLabel ? adultLabel : '';
            const pricesInfo = `
                ${adultLabel && `<li>${adultLabel}</li>`}
                ${infantLabel && `<li>${infantLabel}</li>`}
                ${childLabel && `<li>${childLabel}</li>`}
            `;
            // const purchasable = res.purchasable ? res.purchasable : false;

            this.setState(() => ({
                pricesInfo
            }));
        }
    }

    componentDidMount() {
        const { DESKTOP, TABLET } = VIEWPORT_TYPE;
        const mqlLVP = watchForBreakpoint(DESKTOP);
        const mqlMVP = watchForBreakpoint([TABLET, DESKTOP]);

        window.addEventListener('beforeunload', this.setsessionStorageInfo);
        window.addEventListener('resize', () => {
            this.checkVP(mqlLVP, mqlMVP);
        });

        mqlLVP.addListener((mql) => {
            this.checkVP(mql, mqlMVP);
        });
        let { shorexId } = this.props;
        let datesShorex = !validateSession.checkCookie(['wcmmode'])
            ? SessionStorage.getItem('labelShorex')
            : [];
        this.setState({
            shorexDates: datesShorex ? datesShorex[shorexId] : undefined
        });
        setTimeout(() => {
            this.checkVP(mqlLVP, mqlMVP);
        }, 1000);

        // update session storage only when leaving the page, so doesnt show the current page in the recently viewed
    }

    /**
     * checkVP - Set the component state information pertaining large viewport
     * @param {Object} LVP - media query object for largeViewPort
     * @param {Object} MVP - media query object for mediumViewPort
     */
    checkVP = (LVP, MVP) => {
        this.setState(() => {
            const elm =
                this.shoreXkeyInfoMycruise.querySelectorAll('.desc') || [];
            const maxHeight = this.getMaxHeight();
            return {
                isLVP: LVP.matches,
                isMVP: MVP.matches,
                hasReadMore:
                    elm.length && elm[0].offsetHeight > maxHeight ? true : false
            };
        });
    };

    /**
     * toggleFavorite - set or reset favorites
     *
     * @param  {number} id  id of the itinerary
     * @param  {boolean} isFavorite flag status represents user favours this tour
     */
    toggleFavorite = (id, isFavorite) => {
        const { services } = this.props;
        const cookieParams = [COOKIE_FAVORITE_SHOREX, id, 730];

        isFavorite
            ? Cookie.addTo(...cookieParams)
            : Cookie.removeFrom(...cookieParams);

        const favouritesAPI = (typeof  services !== 'undefined' && typeof  services.urls !== 'undefined' && services.urls.favouritesAPI) || "";
        if (isLoggedIn() && favouritesAPI !== "") {
            updateFavourites({
                type: 'SHORE-X',
                action: isFavorite ? 'add' : 'remove',
                services,
                id
            });
        }

        PubSub.publish(topics.FAVOURITES_UPDATED);
    };

    createModal = () => {
        const { shorexId, shorexDescription, name, ctaType } = this.props;
        const { port, showModal } = this.state;
        const overlayProps = extractChildComponent(
            this.props.childComponents,
            'shorexOverlay'
        );

        return (
            port && (
                <ShorexOverlay
                    {...overlayProps.attributes}
                    mounted={showModal}
                    onExit={() => this.handleOverlay(false)}
                    id={shorexId}
                    description={shorexDescription}
                    name={name}
                    port={port}
                    ctaType={ctaType}
                    languages={overlayProps.attributes.guideLanguages}
                    underlayClass="shorex-overlay"
                />
            )
        );
    };

    handleOverlay = (isVisible) => {
        analytics.setAdditionalPageTrackAttributes({
            event: 'event308',
            skuID: ''
        });
        analytics.clickTracking(this);
        this.setState(() => {
            if (isVisible) {
                // var analyticsParams = {
                //     contentType: this.props.ctaType,
                //     contentName: analytics.handleSpecials(this.props.title),
                //     playerName: 'videoPlayer'
                // };
                // analytics.overlayLoad('screenLoad', analyticsParams);
            }
            return { showModal: isVisible };
        });
    };

    setsessionStorageInfo = () => {
        const {
            shorexId,
            shorexDescription,
            shorexPageUrl,
            name,
            sliderImage,
            services
        } = this.props;
        const { activityLevelLabel, port, startDates, merchandisingCategories } = this.state;
        const lang = typeof services !== 'undefined' && typeof services.headers !== 'undefined' && services.headers.locale;
        const header = SessionStorage.getItem('header');
        const { bookingRef = '', customer } = header;
        const { firstName = '', lastName = '' } = customer;
        let viewed = localStorage.getItem('viewed')
            ? JSON.parse(localStorage.getItem('viewed'))
            : {};
        !viewed[`${lang}_${bookingRef}_${firstName}_${lastName}`] && (viewed[`${lang}_${bookingRef}_${firstName}_${lastName}`] = []);

        // check if shorex is already in recently viewed, if it is, we delete it to push ot in forst position
        let filtered = viewed[`${lang}_${bookingRef}_${firstName}_${lastName}`].filter(
            (shorex) => shorex.code === shorexId
        );
        const viewedlength = filtered.length;
        var index = viewed[`${lang}_${bookingRef}_${firstName}_${lastName}`].indexOf(filtered[0]);

        const detailsInfo = {
            type: 'shorexCard',
            activityLevel: activityLevelLabel,
            code: shorexId,
            description: shorexDescription,
            name: name,
            //portName: portLabel,
            port: port,
            url: shorexPageUrl,
            image: sliderImage,
            startDates: startDates,
            merchandisingCategories: merchandisingCategories
        };
        if (viewedlength === 0) {
            viewed[`${lang}_${bookingRef}_${firstName}_${lastName}`].push(detailsInfo);
        } else {
            viewed[`${lang}_${bookingRef}_${firstName}_${lastName}`].splice(index, 1);
            viewedlength >= 12 && viewed[`${lang}_${bookingRef}_${firstName}_${lastName}`].pop();
            viewed[`${lang}_${bookingRef}_${firstName}_${lastName}`].unshift(detailsInfo);
        }
        // sessionStorage.setItem('viewed', viewed);
        localStorage.setItem('viewed', JSON.stringify(viewed));
    };

    renderVariants = () => {
        const {
            // ctaLink,
            // shorexId,
            notOnSaleAnymoreLabel,
            notOnSaleAnymoreInfo,
            addToCartLabel,
            registerInterestLabel
        } = this.props;
        const { hover, purchasable, variations } = this.state;
        const display = `${hover ? `block` : `none`}`;
        const tooltipStyle = { display };
        const productnotavailablelabel = this.props.productNotAvailableLabel || "Product Not Available";
        const masterNotApprovedLabel = this.props.masterNotApprovedLabel;
        const masterStatusNotActiveLabel = this.props.masterStatusNotActiveLabel;
        const masterSalableFalseLabel = this.props.masterSalableFalseLabel;
        const masterNotPublishedInAemLabel = this.props.masterNotPublishedInAemLabel;
        const masterAllUsergroupUnavailableLabel = this.props.masterAllUsergroupUnavailableLabel;
        const instanceInvalidBaseProductTypeLabel = this.props.instanceInvalidBaseProductTypeLabel;
        const instanceMissingStartDateLabel = this.props.instanceMissingStartDateLabel;
        const instanceMissingShipsLabel = this.props.instanceMissingShipsLabel;
        const instanceMissingBaseProductLabel = this.props.instanceMissingBaseProductLabel;
        const instanceNotApprovedLabel = this.props.instanceNotApprovedLabel;
        const instanceStatusCancelledLabel = this.props.instanceStatusCancelledLabel;
        const instanceSalableFalseLabel = this.props.instanceSalableFalseLabel;
        const instancePriceForAdultsMissingLabel = this.props.instancePriceForAdultsMissingLabel;
        const instancePriceForChildrenMissingLabel = this.props.instancePriceForChildrenMissingLabel;
        const instancePriceForInfantsMissingLabel = this.props.instancePriceForInfantsMissingLabel;
        const instanceNotValidForCruiseDatesLabel = this.props.instanceNotValidForCruiseDatesLabel;
        const instanceNotValidForCruiseShipLabel = this.props.instanceNotValidForCruiseShipLabel;
        // const { variations, title, description, name } = this.props.shoreXVariations;
        // let ctaUrl = `${ctaLink}#excursionIds=${shorexId}`;

        /*if (!purchasable && variations !== 'outOfStock') {
            return (
                <div>
                    <div className="shorex-variants-title">
                        <div
                            className="shorex-variants-title-info"
                            onMouseOver={(e) => {
                                this.handleMouse(true);
                            }}
                            onMouseOut={(e) => {
                                this.handleMouse(false);
                            }}
                        >
                            <div
                                className="shorex-variants-tooltip"
                                style={tooltipStyle}
                            >
                                <a
                                    className="shorex-close"
                                    onClick={(e) => this.closeTooltip(e)}
                                />
                                <p>{notOnSaleAnymoreInfo}</p>
                            </div>
                        </div>
                        {notOnSaleAnymoreLabel}
                    </div>
                </div>
            );
        } else { */
        switch (variations) {
            case 'lowStock':
            case 'inStock':
                return (
                    <div>
                        <div className="cta-holder">
                            <Link
                                url=""
                                ariaLabel={`${addToCartLabel}`}
                                label={addToCartLabel}
                                url="#"
                                onClick={(e) => this.handleOverlay(true)}
                                linkClassName=""
                                dataLinktext={addToCartLabel}
                            >
                                {addToCartLabel}
                            </Link>
                        </div>
                    </div>
                );
            case 'outOfStock':
                // return (
                //     <div>
                //         <div className="cta-holder">
                //             <Link
                //                 url=""
                //                 ariaLabel={`${registerInterestLabel}`}
                //                 label={registerInterestLabel}
                //                 url="#"
                //                 onClick={(e) => this.handleOverlay(true)}
                //                 linkClassName="register"
                //                 dataLinktext={registerInterestLabel}
                //             >
                //                 {registerInterestLabel}
                //             </Link>
                //         </div>
                //     </div>
                // );
                return (
                    <div>
                        <div className="shorex-variants-title">
                            {this.props.soldOutLabel}
                        </div>
                    </div>
                );
            case 'productNotAvailable':
                return (
                    <div>
                        <div className="shorex-variants-title">
                            {productnotavailablelabel}
                        </div>
                    </div>
                );

            case 'masterNotApproved':
                return (
                    <div>
                        <div className="shorex-variants-title">
                            {masterNotApprovedLabel}
                        </div>
                    </div>
                );

            case 'masterStatusNotActive':
                return (
                    <div>
                        <div className="shorex-variants-title">
                            {masterStatusNotActiveLabel}
                        </div>
                    </div>
                );
            case 'masterSalableFalse':
                return (
                    <div>
                        <div className="shorex-variants-title">
                            {masterSalableFalseLabel}
                        </div>
                    </div>
                );
            case 'masterNotPublishedInAem':
                return (
                    <div>
                        <div className="shorex-variants-title">
                            {masterNotPublishedInAemLabel}
                        </div>
                    </div>
                );
            case 'masterAllUsergroupUnavailable':
                return (
                    <div>
                        <div className="shorex-variants-title">
                            {masterAllUsergroupUnavailableLabel}
                        </div>
                    </div>
                );
            case 'instanceInvalidBaseProductType':
                return (
                    <div>
                        <div className="shorex-variants-title">
                            {instanceInvalidBaseProductTypeLabel}
                        </div>
                    </div>
                );
            case 'instanceMissingStartDate':
                return (
                    <div>
                        <div className="shorex-variants-title">
                            {instanceMissingStartDateLabel}
                        </div>
                    </div>
                );
            case 'instanceMissingShips':
                return (
                    <div>
                        <div className="shorex-variants-title">
                            {instanceMissingShipsLabel}
                        </div>
                    </div>
                );
            case 'instanceMissingBaseProduct':
                return (
                    <div>
                        <div className="shorex-variants-title">
                            {instanceMissingBaseProductLabel}
                        </div>
                    </div>
                );
            case 'instanceNotApproved':
                return (
                    <div>
                        <div className="shorex-variants-title">
                            {instanceNotApprovedLabel}
                        </div>
                    </div>
                );
            case 'instanceStatusCancelled':
                return (
                    <div>
                        <div className="shorex-variants-title">
                            {instanceStatusCancelledLabel}
                        </div>
                    </div>
                );
            case 'instanceSalableFalse':
                return (
                    <div>
                        <div className="shorex-variants-title">
                            {instanceSalableFalseLabel}
                        </div>
                    </div>
                );
            case 'instancePriceForAdultsMissing':
                return (
                    <div>
                        <div className="shorex-variants-title">
                            {instancePriceForAdultsMissingLabel}
                        </div>
                    </div>
                );
            case 'instancePriceForChildrenMissing':
                return (
                    <div>
                        <div className="shorex-variants-title">
                            {instancePriceForChildrenMissingLabel}
                        </div>
                    </div>
                );
            case 'instancePriceForInfantsMissing':
                return (
                    <div>
                        <div className="shorex-variants-title">
                            {instancePriceForInfantsMissingLabel}
                        </div>
                    </div>
                );
            case 'instanceNotValidForCruiseDates':
                return (
                    <div>
                        <div className="shorex-variants-title">
                            {instanceNotValidForCruiseDatesLabel}
                        </div>
                    </div>
                );
            case 'instanceNotValidForCruiseShip':
                return (
                    <div>
                        <div className="shorex-variants-title">
                            {instanceNotValidForCruiseShipLabel}
                        </div>
                    </div>
                );

            case 'ON_HOLD':
                return (
                    <div>
                        <div className="shorex-variants-title">
                            {this.props.onHoldLabel}
                        </div>
                    </div>
                );
            default:
                return (
                    <div>
                        <div className="shorex-variants-title">
                            <div
                                className="shorex-variants-title-info"
                                onMouseOver={(e) => {
                                    this.handleMouse(true);
                                }}
                                onMouseOut={(e) => {
                                    this.handleMouse(false);
                                }}
                            >
                                <div
                                    className="shorex-variants-tooltip"
                                    style={tooltipStyle}
                                >
                                    <a
                                        className="shorex-close"
                                        onClick={(e) => this.closeTooltip(e)}
                                    />
                                    <p>{notOnSaleAnymoreInfo}</p>
                                </div>
                            </div>
                            <div dangerouslySetInnerHTML={{ __html: notOnSaleAnymoreLabel }} />
                        </div>
                    </div>
                );
        }
        //}
    };

    closeTooltip(e) {
        analytics.clickTracking(this);
        e.preventDefault();
        this.setState(() => ({ hover: false }));
    }

    handleMouse(isHover) {
        this.setState(() => ({ hover: isHover }));
    }

    /**
     * createBackground - returns markup for background view
     * @returns {String} markup - appropriate html for background view
     */
    createBackground = () => {
        const { type, video, image, gifURL } = this.props;
        const { isLVP } = this.state;

        switch (type) {
            case 'video':
                return isLVP ? (
                    <videoplayer
                        video={video}
                        autoplay={true}
                        muted={true}
                        loop={true}
                        playsInline={true}
                        isBackground={true}
                    />
                ) : (
                        <Image {...image} />
                    );
            case 'image':
                return <Image {...image} />;
            case 'gif':
                return <img src={gifURL} alt="" />;
        }
    };

    /**
     * getMaxHeight - returns maxHeight set in available view
     * @returns {number} maxHeight - max height
     */
    getMaxHeight = () => {
        const { isLVP = false, isMVP = false } = this.state;
        const { maxHeight } = this.props;

        if (isLVP) {
            return maxHeight['lvp'];
        } else if (isMVP) {
            return maxHeight['mvp'];
        } else {
            return maxHeight['svp'];
        }
    };

    /**
     * handleReadMore - Click handler for readMore/readLess
     */
    handleReadMore = () => {
        this.setState(
            (prevState) => ({
                active: !prevState.active
            }),
            () => {
                const { readMore, readLess, component } = this.props;
                const { active } = this.state;
                const linkText = active ? readMore : readLess;

                const analyticsParams = {
                    linkText,
                    componentName: component
                };

                analytics.customClicks(analyticsParams);
            }
        );
    };

    /**
     * toggleFavorite - set or reset favorites
     *
     * @param  {number} favItemId  id of the shoreX
     * @returns {boolean} is shores users favorite?
     */
    isFavorite(favItemId) {
        return Cookie.get(COOKIE_FAVORITE_SHOREX).indexOf(favItemId) !== -1;
    }

    goBack = (e) => {
        analytics.clickTracking(this);
        e.preventDefault();
        window.history.go(-1);
    }
    render() {
        const {
            name,
            description,
            excursionInfoData,
            readMore,
            readLess,
            adultLabel,
            hidewheelchairAccess,
            hidemealsIncluded,
            hideminage,
            showShorePrice,
            currencyType,
            excursionInfoDataDetailed,
            ageRestrictedLabel,
            backLabel,
            shorexLimitedAvailabilityLabel,
            productCodeLabel,
            shorexId,
            shorexMealIncludedLabel,
            shorexRefreshmentIncludedLabel,
            shorexMealAndRefreshmentIncludedLabel
        } = this.props;

        const {
            ageRestricted,
            pricesInfo,
            variations,
            active,
            hasReadMore,
            shorexDates
        } = this.state;

        const keyFactsData = {
            adultLabel,
            hidewheelchairAccess,
            hidemealsIncluded,
            hideminage,
            showShorePrice,
            currencyType,
            shorexMealIncludedLabel,
            shorexRefreshmentIncludedLabel,
            shorexMealAndRefreshmentIncludedLabel
        };

        const hasExcursionInfoDataDetailed =
            excursionInfoDataDetailed.length !== 0;

        return (
            <div
                className="shorex-key-info"
                ref={(shoreXkeyInfoMycruise) =>
                    (this.shoreXkeyInfoMycruise = shoreXkeyInfoMycruise)
                }
            >
                <div className="ht-background">
                    <div className="overlay" />
                    {this.createBackground()}
                </div>
                <div className="infocard-wrapper">
                    <a
                        href="#"
                        className="infocard-back"
                        onClick={this.goBack}
                    >
                        <span>{backLabel}</span>
                    </a>
                    <div className="infocard-wrapperAux">
                        <div className="infocard">
                            <div className="header">
                                {shorexDates && (
                                    <p className="dates">{shorexDates}</p>
                                )}
                                <h1 className="title">{name}</h1>
                                <div className="subtitles">
                                    {pricesInfo !== '' &&
                                        variations !== 'ON_HOLD' &&
                                        showShorePrice && (
                                            <ul
                                                className="subtitle"
                                                dangerouslySetInnerHTML={{
                                                    __html: pricesInfo
                                                }}
                                            />
                                        )
                                        // <div className='subtitle' >
                                        //     {pricesInfo }
                                        // </div>
                                    }
                                    {ageRestricted && (
                                        <div className="subtitle subtitle-ageRestricted">
                                            {ageRestrictedLabel}
                                            <span
                                                className="afar-label"
                                                aria-label={`${ageRestrictedLabel}`}
                                            />
                                        </div>
                                    )}

                                    {variations === 'lowStock' && (
                                        <div className="subtitle subtitle-availability">
                                            {shorexLimitedAvailabilityLabel}
                                        </div>
                                    )}
                                </div>
                                <div className="shorex-variant">
                                    {this.renderVariants()}
                                </div>
                            </div>
                            <div
                                className="shorex-key-facts"
                                ref="scrollTarget"
                            >
                                {excursionInfoData && (
                                    <ul className="shorex-key-list">
                                        {excursionInfoData.map(
                                            (item, index) => (
                                                <KeyFacts
                                                    key={index}
                                                    id={item.key}
                                                    caption={item.caption}
                                                    statistic={item.statistic}
                                                    {...keyFactsData}
                                                />
                                            )
                                        )}
                                    </ul>
                                )}
                            </div>

                            {description && (
                                <div
                                    className={`desc ${
                                        hasReadMore ? 'readmore' : ''
                                        }${active ? 'open' : ''}`}
                                    dangerouslySetInnerHTML={{
                                        __html: description
                                    }}
                                />
                            )}
                            {description &&
                                hasReadMore && (
                                    <ReadMoreOrLess
                                        active={active}
                                        clickHandler={this.handleReadMore}
                                        readMoreLabel={readMore}
                                        readLessLabel={readLess}
                                        scrollToTarget={this.refs.scrollTarget}
                                        name={name}
                                        linkText={`${
                                            active ? readLess : readMore
                                            }`}
                                    />
                                )}
                        </div>
                    </div>
                </div>

                {excursionInfoDataDetailed &&
                    hasExcursionInfoDataDetailed && (
                        <div className="shorex-info-detail">
                            <div className="shorex-info-list">
                                {excursionInfoDataDetailed.map(
                                    (item, index) => (
                                        <InfoDetail
                                            key={index}
                                            type={item.type}
                                            title={item.title}
                                            list={item.list}
                                            icon={item.icon}
                                        />
                                    )
                                )}
                            </div>
                        </div>
                    )}

                {this.createModal()}
            </div>
        );
    }
}

shoreXkeyInfoMycruise.defaultProps = {
    maxHeight: {
        lvp: 154,
        mvp: 154,
        svp: 100
    }
};

export default shoreXkeyInfoMycruise;
