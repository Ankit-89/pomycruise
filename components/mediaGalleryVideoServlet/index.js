'use strict';

import React from 'react';
import FetchData from '../commons/CUK/fetch-data';
import SessionStorage from '../commons/CUK/session-storage';
import TitleH1Mycruise from '../titleH1Mycruise';
import MediaGalleryVideo from '../mediaGalleryVideo';
import ValidateSession from '../commons/CUK/validateSession';
import { getConfig } from '../commons/CUK/utilities';

class mediaGalleryVideoServlet extends React.Component {
    constructor(props) {
        super(props);
        this.state = { servletData: { title: false, mediaRows: [] } };
    }

    componentDidMount() {
        if (!ValidateSession.checkCookie(['wcmmode'])) {
            const { mediaGalleryServletUrl } = this.props;
            const apiKey = getConfig('apikeyMycruise', '');

            const { shipCode, cabinType, cabinCode } = SessionStorage.getItem(
                'userData'
            );
            const header = SessionStorage.getItem('header');
            const servletUrl = `${mediaGalleryServletUrl}.${shipCode}.${cabinType}.${cabinCode}.json`;

            FetchData(servletUrl, {
                method: 'GET',
                headers: {
                    'X-CommonData': JSON.stringify(header),
                    'X-Source-Identity-Token-0': apiKey
                }
            }).then((response) => {
                this.setState(() => ({
                    servletData: {
                        ...response,
                        mediaRows: this.createRows(response.media)
                    }
                }));
            });
        }
    }

    /* create the media row array as in the mediaGallery data contract: mediaRow > media > object */
    createRows(mediaArray) {
        let switchSide = false;
        let numberOfRow = 1;
        if (mediaArray !== 'undefined' ){
        return mediaArray.reduce((array, mediaItem, index, initialArray) => {
            if (mediaItem.mediaType === 'image') {
                const lastInArray = array[array.length - 1];
                if (
                    !lastInArray ||
                    (lastInArray.media.length === 1 &&
                        lastInArray.media[0].mediaType !== 'image') ||
                    lastInArray.media.length === 2
                ) {
                    array.push({
                        order: numberOfRow,
                        media: [
                            {
                                ...mediaItem,
                                mediaSize: !initialArray[index + 1]
                                    ? 12
                                    : switchSide
                                        ? 4
                                        : 8
                            }
                        ]
                    });
                } else if (
                    lastInArray &&
                    lastInArray.media.length === 1 &&
                    lastInArray.media[0].mediaType === 'image'
                ) {
                    array[array.length - 1].media.push({
                        ...mediaItem,
                        mediaSize: switchSide ? 8 : 4
                    });
                    switchSide = !switchSide;
                    numberOfRow++;
                }
            } else {
                array = [
                    {
                        order: numberOfRow,
                        media: [{ ...mediaItem, mediaSize: 12 }]
                    },
                    ...array
                ];
                numberOfRow++;
            }
            return array;
        }, []);
        }
    }

    render() {
        const {
            servletData: {
                title,
                mediaRows,
                previousLabel,
                nextLabel,
                dividerText
            }
        } = this.state;
        const accesibilityLabels = this.props.accesibilityLabels ? this.props.accesibilityLabels : {};
        return (
            mediaRows.length > 0 && (
                <div>
                    {title && <TitleH1Mycruise title={title} type="h1" />}
                    <MediaGalleryVideo
                        mediaRow={mediaRows}
                        previousLabel={previousLabel}
                        nextLabel={nextLabel}
                        numberOfTabs={mediaRows.length}
                        dividerText={dividerText}
                        accesibilityLabels={accesibilityLabels}

                    />
                </div>
            )
        );
    }
}

export default mediaGalleryVideoServlet;
