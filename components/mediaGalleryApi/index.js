'use strict';

import React from 'react';
import TitleH1Mycruise from '../titleH1Mycruise';
import extractChildComponent from '../commons/CUK/extractChildComponent';
import MediaTiles from '../commons/CUK/mediaTiles';
import FetchData from '../commons/CUK/fetch-data';
import SessionStorage from '../commons/CUK/session-storage';
import validateSession from '../commons/CUK/validateSession';
import { getConfig } from '../commons/CUK/utilities';

class mediaGalleryApi extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            mediaRow: []
        };
    }

    componentDidMount() {
        if (!validateSession.checkCookie(['wcmmode'])) {
            const { services } = this.props;
            const { productSearchApi } = services.urls;
            const apiKey = getConfig('apikeyMycruise', '');

            const url = `${productSearchApi}?productType=SHOREX`;
            const header = SessionStorage.getItem('header');
            FetchData(url, {
                method: 'GET',
                headers: {
                    'X-CommonData': JSON.stringify(header),
                    'X-Source-Identity-Token-0': apiKey
                }
            }).then((res) => {
                const categories = res.facets.find(
                    (facet) => facet.code === 'tourCategory'
                );
                // get the list of the categories from the API --> specific for the cruise
                if (categories) {
                    this.createRow(categories);
                }
            });
        }
    }

    /* create the media row array as in the mediaGallery data contract: mediaRow > media > object */
    createRow(categories) {
        const shorexListingUrl = getConfig('shorexListingUrl', '');
        const { values } = categories;
        const listOfMedia = values.reduce((listOfMedia, category) => {
            const { categories, viewMoreLabel } = this.props;
            const {
                code,
                query: { query }
            } = category;
            const categoryData = categories[code] || false;

            if (categoryData) {
                const { label, image } = categoryData;
                const queryUrl = `${shorexListingUrl}#?productType=SHOREX&query=${
                    query.value
                }`;
                listOfMedia.push({
                    imageCaption: label,
                    mediaType: 'imageLink',
                    mediaCta: {
                        label: viewMoreLabel,
                        url: queryUrl,
                        isExternal: false
                    },
                    tilePosition: 'bottom-left',
                    mediaSize: 4,
                    imageUrl: image,
                    image: this.generateImage(
                        { imageUrl: image, imageCaption: label },
                        'S'
                    )
                });
            }
            return listOfMedia;
        }, []);
        // create couples of media to create the mediaRow
        let numberOfRow = 1;

        const mediaRowConstructor = listOfMedia.reduce(
            (mediaRowConstructor, singleMedia, i, listOfMedia) => {
                const isLast = i === listOfMedia.length - 1;
                const isOdd = listOfMedia.length % 2 !== 0;
                if (i < listOfMedia.length / 2) {
                    const mediaArray = listOfMedia.slice(2 * i, 2 * i + 2);
                    const isEvenRow = numberOfRow % 2 === 0;
                    const largeMediaItemIndex = isEvenRow ? 1 : 0;
                    const isXLarge = isOdd && isLast && !isEvenRow;
                    mediaArray[largeMediaItemIndex] = {
                        ...mediaArray[largeMediaItemIndex],
                        mediaSize: isXLarge ? 12 : 8,
                        image: this.generateImage(
                            mediaArray[largeMediaItemIndex],
                            isXLarge ? 'L' : 'M'
                        )
                    };
                    mediaRowConstructor.push({
                        media: mediaArray,
                        order: numberOfRow
                    });
                    numberOfRow++;
                }
                return mediaRowConstructor;
            },
            []
        );
        this.setState({
            mediaRow: mediaRowConstructor
        });
    }

    generateImage({ imageUrl, imageCaption }, size) {
        let finalSize1x;
        let finalSize2x;
        let finalRatio;
        switch (size) {
            case 'L':
                finalSize1x = '1440.523';
                finalSize2x = '2880.1047';
                finalRatio = 2.7507163323782233;
                break;
            case 'M':
                finalSize1x = '770.434';
                finalSize2x = '1540.868';
                finalRatio = 1.7741935483870968;
                break;
            case 'S':
                finalSize1x = '325.434';
                finalSize2x = '650.868';
                finalRatio = 0.7488479262672811;
                break;
            default:
                break;
        }
        return {
            alt: imageCaption,
            0: {
                '1x': `${imageUrl}.image.250.334.low.jpg`,
                '2x': `${imageUrl}.image.500.668.low.jpg`,
                aspectRatio: 0.7485029940119761
            },
            376: {
                '1x': `${imageUrl}.image.465.620.medium.jpg`,
                '2x': `${imageUrl}.image.930.1240.medium.jpg`,
                aspectRatio: 0.75
            },
            769: {
                '1x': `${imageUrl}.image.${finalSize1x}.high.jpg`,
                '2x': `${imageUrl}.image.${finalSize2x}.high.jpg`,
                aspectRatio: finalRatio
            }
        };
    }

    render() {
        const { dividerText, component, childComponents } = this.props;
        const { mediaRow } = this.state;
        const titleProps = extractChildComponent(
            childComponents,
            'titleH1Mycruise'
        );
        return (
            mediaRow.length > 0 && (
                <div>
                    <TitleH1Mycruise {...titleProps.attributes} />
                    <MediaTiles
                        component={component}
                        dividerText={dividerText}
                        mediaRow={mediaRow}
                    />
                </div>
            )
        );
    }
}

export default mediaGalleryApi;
