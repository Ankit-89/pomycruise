import React, { Component } from 'react';
import { getPriceSymbolForCurrencyCode } from '../commons/CUK/currencyFormat';

/**
 * /\<ul\b[^>]*>([.\n\s\t\>]*<li>.*<\/li>){1,}[.\n\s\t\>]*<\/ul>/gi => Regex to extract UL with content
 * in case available drinks list is inserted inside description text
 */

class packageComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            openRow: false
        };
    }

    /**
     * createPriceGroupAvailability - handles creation of specific priceGroup availability label.
     * In case of more than 2 pricegroups available, first are joined with spaced comma and
     * only the last will be joined with the andLabel value
     *
     * @returns  {JSX} resulting markup for priceGroup availability
     */
    createPriceGroupAvailability = () => {
        let { product, labels, minAlcoholicAge } = this.props;
        let adultLabel = labels.adultsLabel.replace(
            '{ageLimit}',
            minAlcoholicAge
        );

        let productAvailability = [
            {
                label: adultLabel,
                isAvailable: product.availableForAdults
            },
            {
                label: labels.childrenLabel,
                isAvailable: product.availableForChildren
            },
            {
                label: labels.infantsLabel,
                isAvailable: product.availableForInfants
            }
        ];

        return productAvailability
            .filter((availability) => availability.isAvailable)
            .reduce((label, availability, index, array) => {
                let joint;

                switch (index) {
                    case array.length - 2:
                        joint = ` ${labels.andLabel}`;
                        break;
                    case array.length - 1:
                        joint = '';
                        break;
                    default:
                        joint = `, `;
                        break;
                }

                return (label += ` ${availability.label}${joint}`);
            }, '');
    };

    /**
     * createPrice - Handles creation of price converting currencyIso to symbol
     * with imported helper function and adds "per day" label
     *
     * @returns  {JSX} resulting markup for price to show
     */
    createPrice = () => {
        let { product, labels } = this.props;

        return `${getPriceSymbolForCurrencyCode(
            product.fromPrice.currencyIso
        )}${product.fromPrice.value} ${labels.perDayLabel}`;
    };

    /**
     * createPriceGroupLabel - Handles creation of package label
     * with price and availability per priceGroup
     *
     * @returns {JSX} resulting markup for label to show
     */
    createPriceGroupLabel = () => {
        return (
            <span className="package-list-detail-price-group">
                {this.createPriceGroupAvailability()}{' '}
                <span className="divider">|</span>{' '}
                {this.props.product.fromPrice && this.createPrice()}
            </span>
        );
    };

    render() {
        let { product, accordionClick, isOpen } = this.props;

        /*
        let extractedList = product.description.match(
            /\<ul\b[^>]*>([.\n\s\t\>]*<li>.*<\/li>){1,}[.\n\s\t\>]*<\/ul>/gi
        );
        let extractedDescription = product.description.replace(
            extractedList,
            ''
        );
        */

        return (
            <div className="package-details__package">
                <div className="packages-detail__package--title">
                    <span>
                        <img src={product.primaryImageUrl} alt={product.code} />
                        {product.name}
                    </span>
                </div>
                <div className="packages-detail__package--details">
                    <div className="package__description">
                        {this.createPriceGroupLabel()}
                        <div dangerouslySetInnerHTML={{
                            __html: product.description
                        }} />

                    </div>
                    <a
                        href="#"
                        className={`${
                            isOpen ? 'open' : ''
                        } package__open-accordion`}
                        onClick={(e) => {
                            e.preventDefault();
                            accordionClick(e);
                        }}
                    >
                        <span>{this.props.labels.detailsLabel}</span>
                    </a>

                </div>
            </div>
        );
    }
}

export default packageComponent;
