'use strict';

import React from 'react';
import Card from '../commons/CUK/card';
import Link from '../commons/CUK/link';
import { sameDateFormat } from '../commons/CUK/dateFormat';
import LinesEllipsis from 'react-lines-ellipsis';
import responsiveHOC from 'react-lines-ellipsis/lib/responsiveHOC';
import ShorexOverlay from '../shorexOverlay';
import { getPriceSymbolForCurrencyCode } from '../commons/CUK/currencyFormat';
import analytics from '../commons/CUK/analytics';

const ResponsiveEllipsis = responsiveHOC()(LinesEllipsis);

class shorexCard extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            title: '',
            description: '',
            image:{},
            showModal: false,
            portLabel: '',
            offerBanner: ''
        };
    }

    componentWillMount(){
        let title = this.props.name;
        let description = this.props.description;
        let image = this.props.image;
        let offerBanner = this.props.merchandisingCategories && this.props.merchandisingCategories.length > 0 ? this.props.merchandisingCategories[0].code : false
        this.setState({
            title,
            description,
            image,
            offerBanner
        })
    }

    renderDates = (arrayOfDates) => {
        const { country } = this.props;
        const dateFormat = country === 'US' ? 'MMM DD' : 'DD MMM';
        if (arrayOfDates.length > 1) {
            return (
                <div className="shorex-card-date">
                    {this.props.labels.multipleDates}
                </div>
            );
        } else {
            return (
                <div className="shorex-card-date">
                    {sameDateFormat(new Date(arrayOfDates[0]), dateFormat)}
                </div>
            );
        }
    };

    handleOverlay = (bool) => {
        analytics.clickTracking(this);
        const { blockName } = this.props;
        if (blockName) {
            let analyticsParams = '';
            if ('RecentlyViewed' === blockName) {
                analyticsParams = {
                    event: "event302,event304",
                    blockProductID: this.props.code,
                    blockPosition: this.props.index,
                    blockName: "RecentlyViewed",
                    // componentName: '',
                    linkText: this.props.labels.seeDetailsLabel
                }
            } else if ('RecommendedForYou' === blockName) {
                analyticsParams = {
                    event: "event302,event304",
                    blockProductID: this.props.code,
                    blockPosition: this.props.index,
                    blockName: "RecommendedForYou",
                    // componentName: '',
                    linkText: this.props.labels.seeDetailsLabel
                }
            } else if ('MostPopular' === blockName) {
                analyticsParams = {
                    event: "event302,event304",
                    blockProductID: this.props.code,
                    blockPosition: this.props.index,
                    blockName: "MostPopular",
                    // componentName: '',
                    linkText: this.props.labels.seeDetailsLabel
                }
            }
            analytics.customClicks(analyticsParams);
        }
        analytics.setAdditionalPageTrackAttributes({
            event: 'event307, event31',
            listingProductID: this.props.code,
            listPosition: 1
        });

        this.setState({ createModal: bool }, () => {
            if (this.state.createModal) {
                this.setState({
                    showModal: true
                });
                // var analyticsParams = {
                //     contentType: this.props.ctaType,
                //     contentName: analytics.handleSpecials(this.props.title),
                //     playerName: 'videoPlayer'
                // };
                // analytics.overlayLoad('screenLoad', analyticsParams);
            } else {
                this.setState({
                    showModal: false
                });
            }
        });
    };

    passDateAndRedirect = (e, url) => {
        analytics.clickTracking(this)
        const { blockName } = this.props;
        if (blockName) {
            let analyticsParams = '';
            if ('RecentlyViewed' === blockName) {
                analyticsParams = {
                    event: "event302,event303",
                    blockProductID: this.props.code,
                    blockPosition: this.props.index,
                    blockName: "RecentlyViewed",
                    // componentName: '',
                    linkText: this.props.labels.seeDetailsLabel
                }
            } else if ('RecommendedForYou' === blockName) {
                analyticsParams = {
                    event: "event302,event303",
                    blockProductID: this.props.code,
                    blockPosition: this.props.index,
                    blockName: "RecommendedForYou",
                    // componentName: '',
                    linkText: this.props.labels.seeDetailsLabel
                }
            } else if ('MostPopular' === blockName) {
                analyticsParams = {
                    event: "event302,event303",
                    blockProductID: this.props.code,
                    blockPosition: this.props.index,
                    blockName: "MostPopular",
                    // componentName: '',
                    linkText: this.props.labels.seeDetailsLabel
                }
            }
            analytics.customClicks(analyticsParams);
        }
        analytics.setAdditionalPageTrackAttributes({
            event: 'event306, event31',
            listingProductID: this.props.code,
            listPosition: 1
        });

        // analytics.clickTracking(this);
        e.preventDefault();
        let arrayOfDates = this.props.startDates;
        let datesToPrint = '';
        if (arrayOfDates) {
            if (arrayOfDates.length > 1) {
                datesToPrint = this.props.labels.multipleDates;
            } else {
                datesToPrint = sameDateFormat(new Date(arrayOfDates[0]), 'D MMM');
            }
        }
        let obj = {};
        obj[this.props.code] = datesToPrint;
        sessionStorage.setItem('labelShorex', JSON.stringify(obj));
        window.location.href = url;
    };

    createModal = () => {
        return (
            <ShorexOverlay
                mounted={this.state.showModal}
                onExit={() => this.handleOverlay(false)}
                id={this.props.code}
                description={this.props.description}
                name={this.props.name}
                port={this.props.port.longName}
                // ctaType={this.props.ctaType}
                underlayClass="shorex-overlay"
                services={this.props.overlay.attributes.services}
                labels={this.props.overlay.attributes.labels}
                languages={this.props.languages}
                country={this.props.country}
            />
        );
    };

    retrieveNonAvailabiltyMsg = () => {
        let flag, msg;
        if (this.props.variantOptions && this.props.variantOptions.length) {
            this.props.variantOptions.forEach((singleVarient) => {
                if (singleVarient.purchasable && !flag) {
                    flag = true;
                }
            });
        }

        if (!flag && this.props.variantOptions) {
            msg = this.props.variantOptions[0].nonAvailabilityMessage;
        }

        return msg;
    };

    render() {
        const {
            textAlignment,
            port,
            stock,
            startDates,
            prices,
            labels,
            url,
            instanceStatus
        } = this.props;
        const {
            seeDetailsLabel,
            from,
            outOfStock,
            addToCartLabel,
            limitedAvailability,
            perPersonLabel,
            shorexStartSaleDateNotMetLabel,
            notOnSaleAnymore,
            registerInterestLabel,
            onHoldLabel,
            productNotAvailableLabel,
            masterNotApprovedLabel,
            masterStatusNotActiveLabel,
            masterSalableFalseLabel,
            masterNotPublishedInAemLabel,
            masterAllUsergroupUnavailableLabel,
            instanceInvalidBaseProductTypeLabel,
            instanceMissingStartDateLabel,
            instanceMissingShipsLabel,
            instanceMissingBaseProductLabel,
            instanceNotApprovedLabel,
            instanceStatusCancelledLabel,
            instanceSalableFalseLabel,
            instancePriceForAdultsMissingLabel,
            instancePriceForChildrenMissingLabel,
            instancePriceForInfantsMissingLabel,
            instanceNotValidForCruiseDatesLabel,
            instanceNotValidForCruiseShipLabel

        } = labels;
        let { title = '', description, image } = this.props;
        if(title === ''){
            title = this.props.name;
        }
        const offerBanner = this.props.merchandisingCategories && this.props.merchandisingCategories.length > 0 ? this.props.merchandisingCategories[0].code : false;

        const fromPrice = this.props.fromPrice || {};
        //const notOnSale = this.props.notOnSaleAnymore || false;
        //const bannerNotOnSale = this.props.bannerNotOnSale || false;
        const isNonAvailabiltyMsg = this.props.nonAvailabilityMessage || this.retrieveNonAvailabiltyMsg();
        let notOnSale = false;
        let productNotAvailable = false;
        let masterNotApproved = false;
        let masterStatusNotActive = false;
        let masterSalableFalse = false;
        let masterNotPublishedInAem = false;
        let masterAllUsergroupUnavailable = false;
        let instanceInvalidBaseProductType = false;
        let instanceMissingStartDate = false;
        let instanceMissingShips = false;
        let instanceMissingBaseProduct = false;
        let instanceNotApproved = false;
        let instanceStatusCancelled = false;
        let instanceSalableFalse = false;
        let instancePriceForAdultsMissing = false;
        let instancePriceForChildrenMissing = false;
        let instancePriceForInfantsMissing = false;
        let instanceNotValidForCruiseDates = false;
        let instanceNotValidForCruiseShip = false;
        let startSaleDateNotMetValue = false;
        if (isNonAvailabiltyMsg) {

            productNotAvailable = (isNonAvailabiltyMsg.code === 'BOOKING_USERGROUP_UNAVAILABLE') ? true : false;
            masterNotApproved = (isNonAvailabiltyMsg.code === 'MASTER_NOT_APPROVED') ? true : false;
            masterStatusNotActive = (isNonAvailabiltyMsg.code === 'MASTER_STATUS_NOT_ACTIVE') ? true : false;
            masterSalableFalse = (isNonAvailabiltyMsg.code === 'MASTER_SALABLE_FALSE') ? true : false;
            masterNotPublishedInAem = (isNonAvailabiltyMsg.code === 'MASTER_NOT_PUBLISHED_IN_AEM') ? true : false;
            masterAllUsergroupUnavailable = (isNonAvailabiltyMsg.code === 'MASTER_ALL_USERGROUP_UNAVAILABLE') ? true : false;
            instanceInvalidBaseProductType = (isNonAvailabiltyMsg.code === 'INSTANCE_INVALID_BASE_PRODUCT_TYPE') ? true : false;
            instanceMissingStartDate = (isNonAvailabiltyMsg.code === 'INSTANCE_MISSING_START_DATE') ? true : false;
            instanceMissingShips = (isNonAvailabiltyMsg.code === 'INSTANCE_MISSING_SHIPS') ? true : false;
            instanceMissingBaseProduct = (isNonAvailabiltyMsg.code === 'INSTANCE_MISSING_BASE_PRODUCT') ? true : false;
            instanceNotApproved = (isNonAvailabiltyMsg.code === 'INSTANCE_NOT_APPROVED') ? true : false;
            instanceStatusCancelled = (isNonAvailabiltyMsg.code === 'INSTANCE_STATUS_CANCELLED ') ? true : false;
            instanceSalableFalse = (isNonAvailabiltyMsg.code === 'INSTANCE_SALABLE_FALSE') ? true : false;
            instancePriceForAdultsMissing = (isNonAvailabiltyMsg.code === 'INSTANCE_PRICE_FOR_ADULTS_MISSING') ? true : false;
            instancePriceForChildrenMissing = (isNonAvailabiltyMsg.code === 'INSTANCE_PRICE_FOR_CHILDREN_MISSING') ? true : false;
            instancePriceForInfantsMissing = (isNonAvailabiltyMsg.code === 'INSTANCE_PRICE_FOR_INFANTS_MISSING ') ? true : false;
            instanceNotValidForCruiseDates = (isNonAvailabiltyMsg.code === 'INSTANCE_NOT_VALID_FOR_CRUISE_DATES ') ? true : false;
            instanceNotValidForCruiseShip = (isNonAvailabiltyMsg.code === 'INSTANCE_NOT_VALID_FOR_CRUISE_SHIP') ? true : false;

            startSaleDateNotMetValue = isNonAvailabiltyMsg.code === 'START_SALE_DATE_NOT_MET' ? true : false;
            notOnSale = isNonAvailabiltyMsg.code === 'STOP_SALE_DATE_PASSED' ? true : false;


        }

        const bannerNotOnSale = startSaleDateNotMetValue || notOnSale || false;
        const isInStock = stock && stock.stockLevel > 0 ? true : false;
        const cta = {
            url: url,
            label: seeDetailsLabel
        };
        const isOnHold = typeof isNonAvailabiltyMsg !== 'undefined' && this.props.variantOptions && this.props.variantOptions[0].instanceStatus === 'ON_HOLD' ? true : false;

        const isAvailable =
            isInStock &&
            fromPrice &&
            !startSaleDateNotMetValue &&
            !notOnSale &&
            !bannerNotOnSale &&
            !isOnHold &&
            !productNotAvailable &&
            !masterNotApproved &&
            !masterStatusNotActive &&
            !masterSalableFalse &&
            !masterNotPublishedInAem &&
            !masterAllUsergroupUnavailable &&
            !instanceInvalidBaseProductType &&
            !instanceMissingStartDate &&
            !instanceMissingShips &&
            !instanceMissingBaseProduct &&
            !instanceNotApproved &&
            !instanceStatusCancelled &&
            !instanceSalableFalse &&
            !instancePriceForAdultsMissing &&
            !instancePriceForChildrenMissing &&
            !instancePriceForInfantsMissing &&
            !instanceNotValidForCruiseDates &&
            !instanceNotValidForCruiseShip;

        const cardProps = {
            image,
            textAlignment,
            imageLink: { url: url },
            banner: offerBanner,
            title,
            titleLink: false,
            showOfferBanner: true
        };
        let arrayOfPrices = [];
        let lblFrom = (startDates) ? (startDates.length > 1) ? from : '' : '';//PK

        if (!(Object.keys(fromPrice).length > 0) && prices) {
            if (prices.length > 0) {
                prices.map((item) => {
                    arrayOfPrices.push(item.minValue);
                });
                fromPrice.value = Math.max(...arrayOfPrices);
                fromPrice.currencyIso = getPriceSymbolForCurrencyCode(
                    prices[0].currencyIso
                );
            }
        }

        let descriptionData = description;
        if (descriptionData && description.length > 240) {
            descriptionData = descriptionData.substr(0, 240);
            descriptionData = descriptionData.substr(0, Math.min(descriptionData.length, descriptionData.lastIndexOf(" ")));
            descriptionData = descriptionData + '...';
        }

        return (
            <div className="shorex-card-container">
                <Card
                    {...cardProps}
                    className={`shorex-card content-align-${
                        textAlignment === 'center' ? 'center' : 'left'
                        }`}
                >
                    {startDates && (
                        <div className="shorex-card-dates">
                            {this.renderDates(startDates)}
                        </div>
                    )}

                    {port &&
                        port.longName && (
                            <div className="shorex-card-port">
                                {port.longName}
                            </div>
                        )}
                    {isInStock &&
                        fromPrice &&
                        !notOnSale &&
                        !bannerNotOnSale &&
                        !isOnHold && (
                            <div className="shorex-card-price">
                                {`${lblFrom} ${getPriceSymbolForCurrencyCode(
                                    fromPrice.currencyIso
                                )} ${fromPrice.value}`}
                            </div>
                        )}

                    {!isInStock &&
                        !notOnSale && <div className="shorex-card-noPrice" />}
                    {notOnSale && <div className="shorex-card-noPrice" />}
                    <div className="shorex-card-alert">
                        {stock && stock.stockLevelStatus === 'lowStock'
                            ? limitedAvailability
                            : ''}
                    </div>

                    <div className="shorex-card-description">
                        {/* <ResponsiveEllipsis
                            text={description}
                            maxLine="3"
                            ellipsis="..."
                            trimRight
                            basedOn="letters"
                        /> */}
                        <div>
                            {descriptionData}
                        </div>
                    </div>

                    {this.state.createModal && this.createModal()}
                </Card>
                <div className="cta-content">
                    <div className="cta-block">
                        <Link
                            ariaLabel={`${title}, ${cta.label}`}
                            url={cta.url}
                            title={cta.label}
                            dataLinktext={cta.label}
                            linkClassName={`primary-cta`}
                            onClick={(e) =>
                                this.passDateAndRedirect(e, cta.url)
                            }
                        >
                            {cta.label}
                        </Link>
                    </div>
                    {/* {!isInStock &&
                        !notOnSale &&
                        !bannerNotOnSale && (
                            <div className="cta-block cta-addToCart">
                                <Link
                                    ariaLabel={`${title}, ${registerInterestLabel}`}
                                    url={'javascript:void(0)'}
                                    title={registerInterestLabel}
                                    dataLinktext={registerInterestLabel}
                                    linkClassName={`secondary-cta`}
                                    onClick={(e) => this.handleOverlay(true)}
                                >
                                    {registerInterestLabel}
                                </Link>
                            </div>
                        )} */}
                    {isAvailable && (
                        <div className="cta-block cta-addToCart">
                            <Link
                                ariaLabel={`${title}, ${addToCartLabel}`}
                                url={'javascript:void(0)'}
                                title={addToCartLabel}
                                dataLinktext={addToCartLabel}
                                linkClassName={`secondary-cta`}
                                onClick={(e) => this.handleOverlay(true)}
                            >
                                {addToCartLabel}
                            </Link>
                        </div>
                    )}
                    {isOnHold && (
                        <div className="cta-block">
                            <div className="shorex-card-notOnSale">
                                {onHoldLabel}
                            </div>
                        </div>
                    )}

                    {productNotAvailable && (
                        <div className="cta-block">
                            <div className="shorex-card-notOnSale">
                                {productNotAvailableLabel || "Product Not Available"}
                            </div>
                        </div>
                    )}

                    {masterNotApproved && (
                        <div className="cta-block">
                            <div className="shorex-card-notOnSale">
                                {masterNotApprovedLabel}
                            </div>
                        </div>
                    )}

                    {masterStatusNotActive && (
                        <div className="cta-block">
                            <div className="shorex-card-notOnSale">
                                {masterStatusNotActiveLabel}
                            </div>
                        </div>
                    )}
                    {masterSalableFalse && (
                        <div className="cta-block">
                            <div className="shorex-card-notOnSale">
                                {masterSalableFalseLabel}
                            </div>
                        </div>
                    )}
                    {masterNotPublishedInAem && (
                        <div className="cta-block">
                            <div className="shorex-card-notOnSale">
                                {masterNotPublishedInAemLabel}
                            </div>
                        </div>
                    )}
                    {masterAllUsergroupUnavailable && (
                        <div className="cta-block">
                            <div className="shorex-card-notOnSale">
                                {masterAllUsergroupUnavailableLabel}
                            </div>
                        </div>
                    )}
                    {instanceInvalidBaseProductType && (
                        <div className="cta-block">
                            <div className="shorex-card-notOnSale">
                                {instanceInvalidBaseProductTypeLabel}
                            </div>
                        </div>
                    )}
                    {instanceMissingStartDate && (
                        <div className="cta-block">
                            <div className="shorex-card-notOnSale">
                                {instanceMissingStartDateLabel}
                            </div>
                        </div>
                    )}
                    {instanceMissingShips && (
                        <div className="cta-block">
                            <div className="shorex-card-notOnSale">
                                {instanceMissingShipsLabel}
                            </div>
                        </div>
                    )}
                    {instanceMissingBaseProduct && (
                        <div className="cta-block">
                            <div className="shorex-card-notOnSale">
                                {instanceMissingBaseProductLabel}
                            </div>
                        </div>
                    )}
                    {instanceNotApproved && (
                        <div className="cta-block">
                            <div className="shorex-card-notOnSale">
                                {instanceNotApprovedLabel}
                            </div>
                        </div>
                    )}
                    {instanceStatusCancelled && (
                        <div className="cta-block">
                            <div className="shorex-card-notOnSale">
                                {instanceStatusCancelledLabel}
                            </div>
                        </div>
                    )}
                    {instanceSalableFalse && (
                        <div className="cta-block">
                            <div className="shorex-card-notOnSale">
                                {instanceSalableFalseLabel}
                            </div>
                        </div>
                    )}
                    {instancePriceForAdultsMissing && (
                        <div className="cta-block">
                            <div className="shorex-card-notOnSale">
                                {instancePriceForAdultsMissingLabel}
                            </div>
                        </div>
                    )}
                    {instancePriceForChildrenMissing && (
                        <div className="cta-block">
                            <div className="shorex-card-notOnSale">
                                {instancePriceForChildrenMissingLabel}
                            </div>
                        </div>
                    )}
                    {instancePriceForInfantsMissing && (
                        <div className="cta-block">
                            <div className="shorex-card-notOnSale">
                                {instancePriceForInfantsMissingLabel}
                            </div>
                        </div>
                    )}

                    {instanceNotValidForCruiseDates && (
                        <div className="cta-block">
                            <div className="shorex-card-notOnSale">
                                {instanceNotValidForCruiseDatesLabel}
                            </div>
                        </div>
                    )}
                    {instanceNotValidForCruiseShip && (
                        <div className="cta-block">
                            <div className="shorex-card-notOnSale">
                                {instanceNotValidForCruiseShipLabel}
                            </div>
                        </div>
                    )}


                    {!isInStock &&
                        !bannerNotOnSale &&
                        !isOnHold && (
                            <div className="cta-block">
                                <div className="shorex-card-outOfStock">
                                    {outOfStock}
                                </div>
                            </div>
                        )}
                    {!isOnHold &&
                        notOnSale &&
                        bannerNotOnSale &&
                        isInStock && (
                            <div className="cta-block">
                                <div className="shorex-card-notOnSale">
                                    {notOnSaleAnymore}
                                </div>
                            </div>
                        )}
                    {!isOnHold &&
                        startSaleDateNotMetValue &&
                        bannerNotOnSale &&
                        isInStock && (
                            <div className="cta-block">
                                <div className="shorex-card-notOnSale">
                                    {shorexStartSaleDateNotMetLabel}
                                </div>
                            </div>
                        )}
                </div>
            </div>
        );
    }
}

export default shorexCard;
