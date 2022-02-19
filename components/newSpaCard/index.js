'use strict';

import React from 'react';
import NewCard from '../commons/CUK/newCard';
import Link from '../commons/CUK/link';
import { getConfig } from '../commons/CUK/utilities';
import { calculateDiffDays } from '../commons/CUK/dateFormat';
import SessionStorage from '../commons/CUK/session-storage';
import {
    VIEWPORT_TYPE,
    watchForBreakpoint
} from '../../library/js/config/breakpoints';

class newSpaCard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // newType: false
        };
    }

    componentWillMount() {
        const { instances, name, purchasable, image } = this.props;
        const duration = [];
        const description = instances.length ? instances[0].description : '';
        instances.length &&
            instances.map((instance, index) => {
                duration.push(instance.duration);
            });
        this.setState({
            description: description,
            image: image,
            duration: duration,
            name: name,
            purchasable: purchasable,
            textAlignment: '',
            showFullDesc: false
        });
    }

    handleClickFromAnywhere = () => {
        const header = SessionStorage.getItem('header');
        const { embarkationDate } = header;
        const { purchasable } = this.props;

        const spaDayX = getConfig('spaDayX', 100);
        const isTooEarly =
            calculateDiffDays(Date.now(), new Date(embarkationDate)) > spaDayX;

        if (purchasable && !isTooEarly) {
            this.handleClick();
        }
    };

    handleClick = () => {
        const {
            configuratorClick,
            instances,
            name,
            purchasable,
            baseProduct
        } = this.props;
        const product = {
            instances: instances,
            name: name,
            baseProduct: baseProduct,
            purchasable: purchasable
        };
        configuratorClick && configuratorClick(product);
    };

    createDetailsCta() {
        const header = SessionStorage.getItem('header');
        const { embarkationDate } = header;
        const {
            name,
            url = '',
            labels: {
                spaAddToCartLabel,
                spaOnboardMessageLabel,
                notAvailableLabel
            },
            purchasable
        } = this.props;

        const spaDayX = getConfig('spaDayX', 100);
        const isTooEarly =
            calculateDiffDays(Date.now(), new Date(embarkationDate)) > spaDayX;

        if (isTooEarly) {
            return (
                <div className="cta-block">
                    <p className="labelMsg">{notAvailableLabel}</p>
                </div>
            );
        }

        if (!purchasable) {
            return (
                <div className="cta-block">
                    <p className="labelMsg">{spaOnboardMessageLabel}</p>
                </div>
            );
        }

        return (
            <div className="cta-block">
                <Link
                    ariaLabel={`${name}, ${spaAddToCartLabel}`}
                    url={url}
                    title={spaAddToCartLabel}
                    dataLinktext={spaAddToCartLabel}
                    linkClassName={``}
                    onClick={this.handleClick}
                >
                    {spaAddToCartLabel}
                </Link>
            </div>
        );
    }

    renderPrice() {
        const {
            labels: { from, perPersonLabel, currencyLabel },
            instances,
            purchasable
        } = this.props;

        const header = SessionStorage.getItem('header');
        const { embarkationDate } = header;
        const spaDayX = getConfig('spaDayX', 20);
        const isTooEarly =
            calculateDiffDays(Date.now(), new Date(embarkationDate)) > spaDayX;

        if (purchasable && !isTooEarly) {
            return (
                <div className="cta-block">
                    <div className="price-container">
                        <h5>{`${from} ${currencyLabel}${instances.reduce(
                            this.retrievePrice,
                            {}
                        )}`}</h5>
                        <p>{perPersonLabel}</p>
                    </div>
                </div>
            );
        }
    }

    concatenateDuration = (durationsObj, singleInstance, index, instances) => {
        if (!durationsObj[singleInstance.duration]) {
            durationsObj[singleInstance.duration] = true;
        }
        return index !== instances.length - 1
            ? durationsObj
            : Object.keys(durationsObj)
                .sort((a, b) => a - b)
                .reduce(
                    (durationsString, duration, index, durations) =>
                    (durationsString += `${duration}' ${index !== durations.length - 1 ? '/ ' : ''
                        }`),
                    ''
                );
    };

    retrievePrice = (priceObj, singleInstance, index, instances) => {
        priceObj = 0;
        if (
            singleInstance.services &&
            (priceObj > singleInstance.services.standardPrice || index == 0)
        ) {
            priceObj = singleInstance.services.standardPrice;
        }

        if (
            singleInstance.services &&
            ((singleInstance.services.promotionalPrice &&
                priceObj > singleInstance.services.promotionalPrice) ||
                index == 0)
        ) {
            priceObj = singleInstance.services.promotionalPrice;
        }

        return index !== instances.length - 1
            ? priceObj
            : singleInstance.services
                ? this.renderMinPrice(instances, priceObj)
                : priceObj;
    };

    renderMinPrice(instances, priceObj) {
        instances.forEach((singleInstance, index) => {
            if (
                singleInstance.services.standardPrice < priceObj ||
                index == 0
            ) {
                priceObj = singleInstance.services.standardPrice;
            }
            if (
                (singleInstance.services.promotionalPrice &&
                    singleInstance.services.promotionalPrice < priceObj) ||
                index == 0
            ) {
                priceObj = singleInstance.services.promotionalPrice;
            }
        });

        return priceObj;
    }

    getDescription = (description) => {
        let descriptionData = description;
        const mqlMVP = watchForBreakpoint(VIEWPORT_TYPE.MOBILE, true);
        if (mqlMVP.matches) {
            return descriptionData;
        }

        if (descriptionData && descriptionData.length > 161) {
            descriptionData = descriptionData.substr(0, 161);
            descriptionData = descriptionData.substr(
                0,
                Math.min(
                    descriptionData.length,
                    descriptionData.lastIndexOf(' ')
                )
            );
            descriptionData = descriptionData + '...';
        }

        return descriptionData;
    };

    createHandleMoreLink = () => {
        const mqlMVP = watchForBreakpoint(VIEWPORT_TYPE.MOBILE, true);
        const { labels } = this.props;

        return !mqlMVP.matches ? (
            <div className="know_more_btn_container" onClick={this.handleClick}>
                <span>{labels.knowMoreLabel}</span>
            </div>
        ) : null;
    };

    render() {
        const {
            description,
            image,
            duration,
            name,
            purchasable,
            textAlignment,
            showFullDesc
        } = this.state;
        const cardProps = {
            image,
            textAlignment,
            imageLink: false,
            title: name,
            titleLink: false
        };
        
        const cardAlignmentClass =
            textAlignment === 'center' ? textAlignment : 'left';

        return (
            <div className={`new-spa-card-container`}>
                <div>
                    <NewCard
                        {...cardProps}
                        className={`spa-card content-align-${cardAlignmentClass}`}
                    >
                        <div className="spaComponent__duration">
                            {this.props.instances.reduce(
                                this.concatenateDuration,
                                {}
                            )}
                        </div>
                        <div className="spa-card-description">
                            <div>{this.getDescription(description)}</div>
                        </div>
                    </NewCard>
                    {this.createHandleMoreLink()}
                </div>
                <div className="cta-content">
                    {this.renderPrice()}
                    {this.createDetailsCta()}
                </div>
            </div>
        );
    }
}

export default newSpaCard;
