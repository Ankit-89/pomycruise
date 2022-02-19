'use strict';

import React from 'react';
import moment from 'moment';
import Image from '../commons/CUK/image';
import SessionStorage from '../commons/CUK/session-storage';
import Link from '../commons/CUK/link';
import debug from 'debug';
import PubSub from '../commons/CUK/pubsub';
import topics from '../../library/js/config/topics';

class entertainmentDetailHeroTile extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {}

    componentWillMount() {}

    render() {
        const { labels, eventsDetailsData } = this.props;
        const eventConfigPageData = SessionStorage.getItem(
            'eventConfigPageData'
        );
        const {
            title,
            portalDescription,
            bannerImage,
            thumbnailImage,
            location,
            startDateTime,
            endDateTime,
            inventory,
            eventDuration,
            categories
        } = eventConfigPageData;

        // const startTime =
        //     eventsDetailsData.startDateTime - eventsDetailsData.endDateTime;
        // // let stime = eventsDetailsData.startDateTime.replace(
        //     /^(\d{4})(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)$/,
        //     '$4:$5'
        // );
        // let etime = eventsDetailsData.endDateTime.replace(
        //     /^(\d{4})(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)$/,
        //     '$1-$2-$3 $4:$5'
        // );

        const minAge = eventsDetailsData.categories.find(
            (e) => e == 'MIN_AGE_16' || e == 'MIN_AGE_18'
        );
        const checkMinAge =
            minAge == 'MIN_AGE_16' || minAge == 'MIN_AGE_18' ? true : false;

        const thrumbnailImageValue = {
            alt: eventsDetailsData.title,
            0: {
                '1x': `${eventsDetailsData.bannerImage}.image.420.560.low.jpg`,
                '2x': `${eventsDetailsData.bannerImage}.image.420.560.low.jpg`
            },
            376: {
                '1x': `${
                    eventsDetailsData.bannerImage
                }.image.420.560.medium.jpg`,
                '2x': `${
                    eventsDetailsData.bannerImage
                }.image.420.560.medium.jpg`
            },
            769: {
                '1x': `${
                    eventsDetailsData.bannerImage
                }.image.420.560.medium.jpg`,
                '2x': `${
                    eventsDetailsData.bannerImage
                }.image.420.560.medium.jpg`
            }
        };
        const bannerImageValue = {
            alt: eventsDetailsData.title,
            0: {
                '1x': `${
                    eventsDetailsData.bannerImage
                }.image.1440.523.high.jpg`,
                '2x': `${
                    eventsDetailsData.bannerImage
                }.image.2880.1047.high.jpg`
            },
            376: {
                '1x': `${
                    eventsDetailsData.bannerImage
                }.image.1024.768.medium.jpg`,
                '2x': `${
                    eventsDetailsData.bannerImage
                }.image.2048.1536.medium.jpg`
            },
            769: {
                '1x': `${
                    eventsDetailsData.bannerImage
                }.image.375.281.medium.jpg`,
                '2x': `${
                    eventsDetailsData.bannerImage
                }.image.750.560.medium.jpg`
            }
        };

        let url = window.location.href + `/events`;

        return (
            <div className="entertainmentContainer">
                <div className="backGround">
                    {bannerImageValue && (
                        <Image
                            className="imageBackground"
                            {...bannerImageValue}
                        />
                    )}
                </div>
                <div
                    className={
                        eventsDetailsData.inventory.length
                            ? 'eventImage'
                            : 'eventImage_soldOut'
                    }
                >
                    {thrumbnailImageValue && (
                        <Image {...thrumbnailImageValue} />
                    )}
                    {!eventsDetailsData.inventory.length && (
                        <span className="soldOutText">{`Sold Out`}</span>
                    )}
                </div>
                <div className="eventBack">
                    <Link
                        ariaLabel={labels.backLabel}
                        url={url}
                        title={labels.backLabel}
                        linkClassName={`cta-button-outline`}
                        onClick={() => window.history.back()}
                    >
                        {labels.backLabel}
                    </Link>
                </div>
                <div className="eventTitleHeader">
                    <p>{eventsDetailsData.title}</p>
                </div>
                <div className="eventTimeContainer">
                    {checkMinAge && (
                        <div className="eventAgeRestricted">
                            <span className="ageRestrictionLable">
                                {labels.ageRestrictedLabel}
                            </span>
                        </div>
                    )}
                    <div
                        className={
                            checkMinAge
                                ? 'eventEstimatedTimeWithAge'
                                : 'eventEstimatedTimeWithoutAge'
                        }
                    >
                        <span className="estimatedTimeLable">
                            {labels.estimatedTimeLabel} {eventDuration}
                        </span>
                    </div>
                </div>
                <hr className="horizontalLine" />
                <div className="eventDescriptionHeader">
                    <p>{eventsDetailsData.description}</p>
                </div>
            </div>
        );
    }
}

export default entertainmentDetailHeroTile;
