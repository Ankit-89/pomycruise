'use strict';

import React from 'react';
import Card from '../commons/CUK/card';
import Link from '../commons/CUK/link';
import LinesEllipsis from 'react-lines-ellipsis';
import responsiveHOC from 'react-lines-ellipsis/lib/responsiveHOC';

const ResponsiveEllipsis = responsiveHOC()(LinesEllipsis);

class diningCard extends React.PureComponent {
    constructor(props) {
        super(props);
        this.offerBanner = props.merchandiseCategories
            ? props.merchandiseCategories[0].code
            : false;
    }

    createDetailsCta() {
        const {
            props: {
                name,
                url,
                labels: { seeDetailsLabel }
            }
        } = this;

        return (
            <div className="cta-block">
                <Link
                    ariaLabel={`${name}, ${seeDetailsLabel}`}
                    url={url}
                    title={seeDetailsLabel}
                    dataLinktext={seeDetailsLabel}
                    linkClassName={`primary-cta`}
                    onClick={false}
                >
                    {seeDetailsLabel}
                </Link>
            </div>
        );
    }

    //createConfiguratorCta
    createConfiguratorCta() {
        let {
            props: {

                name,
                configuratorClick,
				url,
                labels: {
                    addToCartLabel,
                    bookableOnBoardLabel,
                    comingSoonLabel,
                    outOfStock,
                    notOnSaleAnymore,
					inculdedNonBookableVenueLabel,
                    genericVenueTypeLabel
                },
                diningDayX,
                purchasability,
                bookableOnBoard

            }
        } = this;
        let purchasabilityValue = '';

        if (
            (purchasability === 'speciality_bookable' ||
                purchasability === 'included_bookable' ||
                purchasability === 'limelight' ||
                purchasability === 'cookery') &&
            diningDayX === true
        ) {
            purchasabilityValue = 'addToCart';
        } else if (
            (purchasability === 'speciality_bookable' ||
                purchasability === 'included_bookable' ||
                purchasability === 'limelight' ||
                purchasability === 'cookery') &&
            diningDayX === false
        ) {
            purchasabilityValue = 'genericVenueType';
        }

        if (purchasability === 'included_nonbookable') {
            purchasabilityValue = 'inculdedNonBookableVenue';
        }

        if (purchasability === 'speciality_nonbookable') {
            purchasabilityValue = 'bookableOnBoard';
        }

        if (purchasability === true) {
            purchasabilityValue = 'addToCart'
        } else if (purchasability === false) {
            purchasabilityValue = 'genericVenueType';
        }

        switch (purchasabilityValue) {
            case 'genericVenueType':
                return (

                    <div className="cta-block dining-variant-title comingSoon">
                        {genericVenueTypeLabel}
                    </div>

                );
            case 'bookableOnBoard':
                return (
                    <div className="cta-block">
                        <h3 className="bookOnBoard">{bookableOnBoardLabel}</h3>
                    </div>

                );

            case 'outOfStock':
                return (
                    <div className="cta-block">
                        <h3 className="bookOnBoard">{outOfStock}</h3>
                    </div>
                );

            case 'addToCart':
                return (
                    <div className="cta-block cta-addToCart">
                        <Link
                            ariaLabel={`${name}, ${addToCartLabel}`}
                            url={url}
                            title={addToCartLabel}
                            dataLinktext={addToCartLabel}
                            linkClassName={`secondary-cta`}
                            onClick={false}
                        >
                            {addToCartLabel}
                        </Link>
                    </div>
                );
            default:
                return <div className="cta-block" />;
        }
    }

    render() {
        const {
            props: {
                name,
                description,
                image,
                textAlignment,
                overlay,
                // additionalSelector,
                included,
                notOnSaleAnymore,
                bannerNotOnSale = false,
                labels: {
                    additionalLabel,
                    includedLabel,
                    diningNotAvailableLabel
                },
                venueType
            },
            offerBanner
        } = this;
        const cardProps = {
            image,
            textAlignment,
            imageLink: false,
            banner: offerBanner,
            title: name,
            titleLink: false,
            showOfferBanner: true
        };
        const cardAlignmentClass = 'left';
        //textAlignment === 'center' ? textAlignment : 'left';
        const venueTypeValue = venueType != undefined ? venueType : '';
        let descriptionData = description;
        if (descriptionData && descriptionData.length > 240) {
            descriptionData = descriptionData.substr(0, 240);
            descriptionData = descriptionData.substr(0, Math.min(descriptionData.length, descriptionData.lastIndexOf(" ")));
            descriptionData = descriptionData + '...';
        }

        return (
            <div className="dining-card-container">
                <Card
                    {...cardProps}
                    className={`dining-card content-align-${cardAlignmentClass}`}
                >

                    <div className={`type bookableOnBoard`}>
                        <span>{this.purchasability}</span>
                    </div>

                    <div className={`type additional`}>
                        {venueTypeValue.toLowerCase() == 'included_bookable' ||
                        venueTypeValue.toLowerCase() ==
                            'included_nonbookable' ? (
                            <span>{includedLabel} </span>
                        ) : (
                            <span>{additionalLabel} </span>
                        )}
                    </div>
                    {/* )} */}
                    <div className="dining-card-description">
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
                    {/* {overlay && this.createModal()} */}
                </Card>
                <div className="cta-content">
                    {this.createDetailsCta()}
					{this.createConfiguratorCta()}
                </div>
            </div>
        );
    }
}

export default diningCard;