'use strict';

import React from 'react';
import moment from 'moment';
import Tabs from '../commons/CUK/tabs';
import Image from '../commons/CUK/image';
import fetchData from '../commons/CUK/fetch-data';
import SessionStorage from '../commons/CUK/session-storage';
import Link from '../commons/CUK/link';
import { getPriceSymbolForCurrencyCode } from '../commons/CUK/currencyFormat';
import { dateFormat3 } from '../commons/CUK/dateFormat';

class diningTabsMycruise extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            apiCalled: false,
            diningEvents: []
        };
    }

    componentWillMount() {
        // if (!this.state.apiCalled) {
        //     const serviceUrl = this.props.services.urls.productDiningDetailsApi;
        //     let eventType =
        //         typeof window !== 'undefined'
        //             ? window.configs.eventType
        //             : undefined;

        //     let diningCode =
        //         typeof window !== 'undefined'
        //             ? window.configs.productId
        //             : undefined;
        //     // console.log(eventType);
        //     if (diningCode && diningCode.indexOf('CC') > -1) {
        //         eventType = 'COOKERY';
        //     }
        //     if (diningCode && diningCode.indexOf('LC') > -1) {
        //         eventType = 'ENTERTAINMENT';
        //     }
        //     const userData = sessionStorage.getItem('userData');
        //     const { shipCode } = userData;

        //     let url;
        //     if (eventType.length > 0) {
        //         url = `${serviceUrl}/event/${eventType}`;
        //         url = url.replace('/venue', '');
        //     } else {
        //         url = `${serviceUrl}`;
        //     }

        //     //   url = url.replace('{{shipCode}}', shipCode);
        //     url = url.replace('{{diningCode}}', diningCode);

        //     const apiKey =
        //         typeof window !== 'undefined'
        //             ? window.configs.apikeyMycruise
        //             : '';
        //     let header = sessionStorage.getItem('header');

        //     fetchData(url, {
        //         method: 'GET',
        //         headers: {
        //             'X-CommonData': JSON.stringify(header),
        //             'X-Source-Identity-Token-0': apiKey
        //         }
        //     }).then((res) => {
        //         if (res.events) {
        //             res.events = res.events.map((product) => {
        //                 return { ...product, title: product.title };
        //             });
        //         }

        //         this.setState({
        //             apiCalled: true,
        //             diningEvents: res.events ? res.events : []
        //         });
        //     });
        // }
        this.setState({
            apiCalled: true
        });
    }
    getPortData(day) {
        // debugger;
        let caseArray = ['SEA', 'PV', 'EMB', 'DEB'];
        const portCalls = SessionStorage.getItem('portCalls');
        const matchingDay = portCalls.portCalls
            .filter(({ typeCode }) => caseArray.includes(typeCode.$))
            .find(({ port: { portCall } }) => portCall.startDate === day);

        if (matchingDay) {
            const { titleLabel, className } = this.getPortViewDetails(
                matchingDay
            );
            return `<span class="port-slot ${className}">${titleLabel}</span>`;
        } else {
            return ``;
        }
    }

    getPortViewDetails = (day) => {
        let className, titleLabel, depLabel;
        const { labels } = this.props;
        switch (day.typeCode.$) {
            case 'SEA':
                titleLabel = labels.seaDayTitleLabel;
                className = `sea-day`;
                break;
            case 'PV':
                titleLabel = labels.portDayTitleLabel.replace(
                    '{port}',
                    day.name
                );
                className = `port-day`;
                break;
            case 'EMB':
                titleLabel = labels.embarkationDayTitleLabel;
                className = 'embark-day';
                break;
            case 'DEB':
                titleLabel = labels.disembarkationDayTitleLabel;
                className = 'disembark-day';
                break;
        }

        return { titleLabel, className };
    };

    createImage(primaryImageUrl) {
        const image = {
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

    getDateandTime(inventory) {
        let dateList = {};
        inventory.map((d) => {
            if (d.status.toLowerCase() == 'available') {
                let time = d.availability.replace(
                    /^(\d{4})(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)$/,
                    '$4:$5'
                );
                let ctime = this.convertToAMPM(time);
                // ctime = moment(ctime, 'HH:mm a');
                let date = d.availability.replace(
                    /^(\d{4})(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)$/,
                    '$1-$2-$3'
                );
                if (dateList[date]) {
                    dateList[date].push(ctime);
                } else {
                    dateList[date] = [ctime];
                }
            }
        });
        return dateList;
    }
    handleRedirection = (ecode) => {
        let pageUrl = window.location.href.split('/');
        const type = pageUrl[pageUrl.length - 2];
        const code = pageUrl[pageUrl.length - 1];

        let pageEntUrl = window.location.href.split('/dining-listing');
        window.location.href =
            pageEntUrl[0] +
            '/dining-listing/booking/' +
            type +
            '/' +
            code +
            '/' +
            ecode;
    };
    showInventory(inventory) {
        let domList = '',
            dateList = this.getDateandTime(inventory);

        const portCalls = SessionStorage.getItem('portCalls');
        const port = portCalls['portCalls'].filter((singlePort) => {
            return singlePort.typeCode.$ !== 'PKG';
        });

        for (const key in dateList) {
            let fdd = moment(key).format('DD MMM');
            domList += `<li key=
                ${key}
            ><span class="dateTime">${fdd} | ${dateList[key].join(
                ', '
            )}</span>${this.getPortData(key)}</li>`;
            // console.log(`------->${domList}`);
        }
        return domList;
    }
    convertToAMPM(timeString) {
        let H = +timeString.substr(0, 2);
        let h = H % 12 || 12;
        let ampm = H < 12 ? ' AM' : ' PM';
        return h + timeString.substr(2, 3) + ampm;
    }
    getTime(startDateTime, endDateTime) {
        let stime = startDateTime.replace(
            /^(\d{4})(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)$/,
            '$4:$5'
        );
        let etime = endDateTime.replace(
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
        var finalMintes = '';
        finalMintes +=
            hours > 0 ? `${hours} ${this.props.labels.hoursLabel} ${' '}` : '';

        finalMintes +=
            minutes > 0 ? `${minutes} ${this.props.labels.minutesLabel}` : '';

        return finalMintes;
    }
    render() {
        return (
            <div className="react-component tabsMycruise">
                {this.props.diningEvents &&
                    this.props.diningEvents.length > 0 && (
                        <Tabs
                            selected={0}
                            componentName={this.props.component}
                            slider={true}
                        >
                            {this.props.diningEvents.map((item, i) => {
                                return (
                                    <div
                                        className="tabs-copy-block"
                                        title={item.title}
                                        key={i}
                                    >
                                        <div className="tile-holder">
                                            <div className="tileGrid image-holder">
                                                {item.bannerImage &&
                                                    this.createImage(
                                                        item.bannerImage
                                                    )}
                                            </div>
                                            <div className="tileGrid content">
                                                <div className="spacing-container">
                                                    <div className="title">
                                                        <h3 className="h2 heading">
                                                            {item.title}
                                                        </h3>
                                                    </div>
                                                    <div className="text-holder">
                                                        <div className="paragraph description-block">
                                                            <div className="description-block">
                                                                {
                                                                    item.description
                                                                }
                                                            </div>
                                                            <div className="event-duration">
                                                                <span>
                                                                    {item.startDateTime &&
                                                                        item.endDateTime &&
                                                                        this.getTime(
                                                                            item.startDateTime,
                                                                            item.endDateTime
                                                                        )}
                                                                </span>
                                                            </div>
                                                            {item.inventory &&
                                                                item.inventory
                                                                    .length && (
                                                                    <div className="dates">
                                                                        <ul
                                                                            className="dates-list"
                                                                            dangerouslySetInnerHTML={{
                                                                                __html: this.showInventory(
                                                                                    item.inventory
                                                                                )
                                                                            }}
                                                                        />
                                                                    </div>
                                                                )}
                                                            <div className="events_category-book">
                                                                <Link
                                                                    ariaLabel={
                                                                        this
                                                                            .props
                                                                            .labels
                                                                            .buttonLabel
                                                                    }
                                                                    onClick={() =>
                                                                        this.handleRedirection(
                                                                            item.eventCode
                                                                        )
                                                                    }
                                                                    title={
                                                                        this
                                                                            .props
                                                                            .labels
                                                                            .buttonLabel
                                                                    }
                                                                    linkClassName={`cta-button-outline`}
                                                                >
                                                                    {
                                                                        this
                                                                            .props
                                                                            .labels
                                                                            .buttonLabel
                                                                    }
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </Tabs>
                    )}
            </div>
        );
    }
}

export default diningTabsMycruise;
