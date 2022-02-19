'use strict';

import React from 'react';
import Link from '../link';
import Image from '../image';

class heroProduct extends React.PureComponent {
    constructor(props) {
        super(props);
    }

    createImage() {
        const {
            props: { name, primaryImageUrl }
        } = this;
        const image = {
            alt: name,
            0: {
                '1x': `${primaryImageUrl}.image.440.330.low.jpg`,
                '2x': `${primaryImageUrl}.image.880.660.low.jpg`
            },
            376: {
                '1x': `${primaryImageUrl}.image.440.330.medium.jpg`,
                '2x': `${primaryImageUrl}.image.880.660.medium.jpg`
            },
            769: {
                '1x': `${primaryImageUrl}.image.440.330.high.jpg`,
                '2x': `${primaryImageUrl}.image.880.660.high.jpg`
            }
        };

        return <Image {...image} />;
    }

    createDetailsCta() {
        const {
            props: {
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

    createConfiguratorCta() {
        const {
            props: {
                name,
                configuratorClick,
                labels: { addToCartLabel }
            }
        } = this;

        return (
            <div className="cta-block cta-addToCart">
                <Link
                    ariaLabel={`${name}, ${addToCartLabel}`}
                    url={'javascript:void(0)'}
                    title={addToCartLabel}
                    dataLinktext={addToCartLabel}
                    linkClassName={`secondary-cta`}
                    onClick={() => configuratorClick(true)}
                >
                    {addToCartLabel}
                </Link>
            </div>
        );
    }

    render() {
        const {
            props: {
                name,
                description,
                key,
                code,
                purchasable,
                bookableOnBoard,
                included,
                additionalSelector,
                additionalSelectorLabel,
                primaryImageUrl
            }
        } = this;

        return (
            <div className="tile-holder" key={key}>
                <div className="tileGrid image-holder">
                    {primaryImageUrl && this.createImage()}
                </div>
                <div className="tileGrid content">
                    <div className="spacing-container">
                        {bookableOnBoard ? (
                            <div className={`type bookableOnBoard`}>
                                <span>{additionalSelector}</span>
                            </div>
                        ) : (
                            <div className={`type ${additionalSelector}`}>
                                <span>{additionalSelector}</span>
                            </div>
                        )}
                        <div className="title">
                            <h3 className="h2 heading">{name}</h3>
                        </div>
                        <div className="text-holder">
                            <p>{description}</p>
                        </div>

                        <div className="cta-content">
                            {this.createDetailsCta()}
                            {purchasable && this.createConfiguratorCta()}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default heroProduct;
