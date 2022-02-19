'use strict';

import React from 'react';
import SessionStorage from '../commons/CUK/session-storage';
import HeroTileModuleMycruise from '../heroTileModuleMycruise';
import { getConfig } from '../commons/CUK/utilities';
import validateSession from '../commons/CUK/validateSession';
import SpaConfigLabels from '../spaConfigLabels';

class spaConfig extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            purchasable: true
        };
    }

    componentDidMount() {
        if (!validateSession.checkCookie(['wcmmode'])) {
            // window.addEventListener('beforeunload', this.setSessionStorageInfo);
        }
    }

    render() {
        const {
            labels: { ageRestrictedLabel = '', backLabel },
            treatmentData,
            bestPriceImageUrl
        } = this.props;
        const parsedTreatmentData = JSON.parse(treatmentData);
        const {
            overviewImage,
            descriptionAEM,
            productNameAEM,
            categoryId
        } = parsedTreatmentData;

        const image = [0, 376, 769].reduce(
            (image, resolution) => {
                image[resolution] = {
                    '1x': `${overviewImage}`,
                    '2x': `${overviewImage}`
                };
                return image;
            },
            { alt: productNameAEM }
        );

        const heroTileData = {
            title: productNameAEM,
            description: descriptionAEM,
            image: image,
            type: 'image',
            cardAlignment: 'center',
            heroTileVariation: 'C037.301a',
            backLabel: backLabel
        };
        const heroTileProps = { ...this.props, ...heroTileData };

        return (
            <div>
                <HeroTileModuleMycruise
                    {...heroTileProps}
                    headingOneUsed={true}
                    showReadMore={true}
                >
                    {/* <div className="subtitle subtitle-ageRestricted">
                        {ageRestrictedLabel}
                        <span
                            className="afar-label"
                            aria-label={ageRestrictedLabel}
                        />
                    </div> */}
                </HeroTileModuleMycruise>
                <SpaConfigLabels
                    labels={this.props.labels}
                    bestPriceImageUrl={bestPriceImageUrl}
                    services={this.props.services}
                    categoryId={categoryId}
                />
            </div>
        );
    }
}

spaConfig.defaultProps = {
    readMoreMaxHeight: {
        lvp: 154,
        mvp: 154,
        svp: 100
    }
};

export default spaConfig;
