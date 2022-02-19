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

    convertToAMPM(timeString) {
        let H = +timeString.substr(0, 2);
        let h = H % 12 || 12;
        let ampm = H < 12 ? ' am' : ' pm';
        return h + timeString.substr(2, 3) + ampm;
    }

    render() {
        const {
            labels,
            eventsDetailsShipData,
            eventsDetailsSolrData,
            checkSoldOutEvents,
            checkBookedPassengers
        } = this.props;

        let stime = eventsDetailsShipData.startDateTime.replace(
            /^(\d{4})(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)$/,
            '$4:$5'
        );
        let etime = eventsDetailsShipData.endDateTime.replace(
            /^(\d{4})(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)$/,
            '$4:$5'
        );
        let startTime = this.convertToAMPM(stime);
        let endTime = this.convertToAMPM(etime);
        var stTime = moment(startTime, 'HH:mm a');
        var enTime = moment(endTime, 'HH:mm a');
        var duration = moment.duration(enTime.diff(stTime));
        var hours = parseInt(duration.asHours());
        var minutes = parseInt(duration.asMinutes()) - hours * 60;
        const finalMintes = minutes == 0 ? hours * 60 : minutes;

        const minAge = eventsDetailsShipData.categories.find(
            (e) => e == 'MIN_AGE_16' || e == 'MIN_AGE_18'
        );
        const checkMinAge =
            minAge == 'MIN_AGE_16' || minAge == 'MIN_AGE_18' ? true : false;

        const thrumbnailImageValue = {
            alt: eventsDetailsSolrData.title,
            0: {
                '1x': `${
                    eventsDetailsSolrData.bannerImage
                }.image.325.434.low.jpg`,
                '2x': `${
                    eventsDetailsSolrData.bannerImage
                }.image.650.868.low.jpg`
            },
            376: {
                '1x': `${
                    eventsDetailsSolrData.bannerImage
                }.image.325.434.medium.jpg`,
                '2x': `${
                    eventsDetailsSolrData.bannerImage
                }.image.650.868.medium.jpg`
            },
            769: {
                '1x': `${
                    eventsDetailsSolrData.bannerImage
                }.image.325.434.high.jpg`,
                '2x': `${
                    eventsDetailsSolrData.bannerImage
                }.image.650.868.high.jpg`
            }
        };
        const bannerImageValue = {
            alt: eventsDetailsSolrData.title,
            0: {
                '1x': `${
                    eventsDetailsSolrData.bannerImage
                }.image.1336.892.low.jpg`,
                '2x': `${
                    eventsDetailsSolrData.bannerImage
                }.image.1336.892.low.jpg`
            },
            376: {
                '1x': `${
                    eventsDetailsSolrData.bannerImage
                }.image.1336.892.low.jpg`,
                '2x': `${
                    eventsDetailsSolrData.bannerImage
                }.image.1336.892.low.jpg`
            },
            769: {
                '1x': `${
                    eventsDetailsSolrData.bannerImage
                }.image.1336.892.low.jpg`,
                '2x': `${
                    eventsDetailsSolrData.bannerImage
                }.image.1336.892.low.jpg`
            }
        };
        let url = window.location.href + `/events`;

        return (
            <div className="entertainmentContainer hero-tile-container">
                <div className="backGround">
                    {bannerImageValue && (
                        <Image
                            className="imageBackground"
                            {...bannerImageValue}
                        />
                    )}
                </div>
                <div className="main-wrapper">
                    <div className="herotile-info-card-wrapper eventBack">
                        <Link
                            ariaLabel={labels.backLabel}
                            url={url}
                            title={labels.backLabel}
                            linkClassName={`infocard-back cta-button-outline`}
                            onClick={() => window.history.back()}
                        >
                            <span>{labels.backLabel}</span>
                        </Link>
                    </div>
                    <div
                        className={
                            !checkSoldOutEvents
                                ? !checkBookedPassengers
                                    ? 'eventImage'
                                    : 'eventImage_Booked'
                                : 'eventImage_soldOut'
                        }
                    >
                        {thrumbnailImageValue && (
                            <Image {...thrumbnailImageValue} />
                        )}
                        {checkSoldOutEvents && (
                            <span className="soldOutText">{`SOLD OUT`}</span>
                        )}
                        {checkBookedPassengers && (
                            <span className="alreadyBookedText">
                                {labels.alreadyBookedLabel}
                            </span>
                        )}
                    </div>

                    <div className="description-part">
                        <div className="eventTitleHeader">
                            <h1>{eventsDetailsSolrData.title}</h1>
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
                                    {labels.estimatedTimeLabel} {finalMintes}
                                    {` Mins`}
                                </span>
                            </div>
                        </div>
                        <hr className="horizontalLine" />
                        <div className="eventDescriptionHeader">
                            {eventsDetailsSolrData.description}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default entertainmentDetailHeroTile;
