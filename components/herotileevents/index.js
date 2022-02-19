'use strict';

import React from 'react';
import SessionStorage from '../commons/CUK/session-storage';
import HeroTileModuleMycruise from '../heroTileModuleMycruise';
import { getConfig } from '../commons/CUK/utilities';
import validateSession from '../commons/CUK/validateSession';
import FetchData from '../commons/CUK/fetch-data';
import Link from '../commons/CUK/link';

class herotileevents extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        if (!validateSession.checkCookie(['wcmmode'])) {
            // this.getProductsList();
            // window.addEventListener('beforeunload', this.setSessionStorageInfo);
        }
    }

    /**
     * createCta - Handles markup creation for cta
     * providing error message with informational tooltip
     * in case of cta not available.
     *
     * @returns {JSX} resulting markup to show
     */

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
        const { ageRestrictedLabel, backLabel } = this.props.labels;
        const eventHeaderData = SessionStorage.getItem('eventHeaderData');
        // console.log('props in hero tile spa', this.props);
        const a = {
            type: 'image',
            title: 'Massage treatments',
            description:
                'Offers convenient, all-inclusive beverage packages to keep you refreshed throughout your voyage. Pay just one flat price and enoy a wide selection of beers, wines and spirits, plus non-alcoholic beverages, for the duration of your cruise. It’s the ultimate in convenience and value. Cheers! Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',

            backLabel: 'Back',
            image: {
                alt: 'Alt attribute copy',
                '0': {
                    '1x':
                        'https://s3-eu-west-1.amazonaws.com/de.costa.dam/zc11_f29f9854910c45a3b8e05ad3e2428883/f_im_jpg_375x281.jpg',
                    '2x':
                        'https://s3-eu-west-1.amazonaws.com/de.costa.dam/zc11_f29f9854910c45a3b8e05ad3e2428883/f_im_jpg_750x563.jpg',
                    aspectRatio: 1.3321492007104796
                },
                '376': {
                    '1x':
                        'https://s3-eu-west-1.amazonaws.com/de.costa.dam/zc11_f29f9854910c45a3b8e05ad3e2428883/f_im_jpg_768x575.jpg',
                    '2x':
                        'https://s3-eu-west-1.amazonaws.com/de.costa.dam/zc11_f29f9854910c45a3b8e05ad3e2428883/f_im_jpg_1536x1150.jpg',
                    aspectRatio: 1.3356521739130436
                },
                '769': {
                    '1x':
                        'https://s3-eu-west-1.amazonaws.com/de.costa.dam/zc11_f29f9854910c45a3b8e05ad3e2428883/f_im_jpg_1480x482.jpg',
                    '2x':
                        'https://s3-eu-west-1.amazonaws.com/de.costa.dam/zc11_f29f9854910c45a3b8e05ad3e2428883/f_im_jpg_2960x964.jpg',
                    aspectRatio: 3.070539419087137
                }
            }
        };
        debugger;
        return (
            <HeroTileModuleMycruise
                {...eventHeaderData}
                type={'image'}
                {...this.props}
                backLabel={backLabel}
                ageRestrictedLabel={ageRestrictedLabel}
                headingOneUsed={true}
                showReadMore={true}
            >
                {ageRestrictedLabel && (
                    <div className="subtitle subtitle-ageRestricted">
                        {ageRestrictedLabel}
                        <span
                            className="afar-label"
                            aria-label={ageRestrictedLabel}
                        />
                    </div>
                )}
            </HeroTileModuleMycruise>
        );
    }
}

herotileevents.defaultProps = {
    readMoreMaxHeight: {
        lvp: 154,
        mvp: 154,
        svp: 100
    },
    heroTileVariation: 'C037.301a'
};

export default herotileevents;
