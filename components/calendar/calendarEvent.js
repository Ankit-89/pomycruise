'use strict';

import React from 'react';
import moment from 'moment';
import analytics from '../commons/CUK/analytics';

class calendarEvent extends React.Component {
    // recieve array of event

    constructor(props) {
        super(props);

        const { data, view, staticData, isNoTime } = this.props;

        this.state = {
            data: data,
            view: view,
            staticData: staticData.attributes.labels,
            isNoTime: isNoTime ? isNoTime : false,
            filters: this.props.filters,
            country: this.props.country ? this.props.country : 'default'
        };
    }

    componentWillMount = () => {
        const { data } = this.props;

        if (data.sameTimeEvents.length === 1) {
            this.setState({ multiEvents: false });
        } else {
            this.setState({ multiEvents: true });
        }
    };
    componentDidUpdate = () => {
        if (this.state.filters !== this.props.filters) {
            this.setState({ filters: this.props.filters });
        }
    };
    findNoTimeLabel = (customEventType, event) => {
        let labelToShow =
            customEventType === 'gift'
                ? this.state.staticData.giftLabel
                : customEventType === 'transfer'
                    ? this.state.staticData.transferLabel
                    : customEventType === 'ips'
                        ? event.location
                        : customEventType === 'landtour'
                            ? this.state.staticData.landtourLabel
                            : customEventType === 'hotel'
                                ? this.state.staticData.hotelLabel
                                : this.state.staticData.noTimeInfoLabel;
        return labelToShow;
    };

    formatDurationLabel = (eventData) => {
        let eventDurationLabel = '';
        if (eventData.durationType === 'days') {
            let labelToShow =
                eventData.customEventType !== 'hotel'
                    ? this.state.staticData.durationDaysLabel
                    : this.state.staticData.hotelNightsLabel;
            eventDurationLabel = labelToShow.replace(
                '{duration}',
                eventData.duration
            );
        } else {
            eventDurationLabel = this.state.staticData.durationHoursLabel.replace(
                '{duration}',
                eventData.duration
            );
        }
        return eventDurationLabel;
    };

    renderSingleEventShort = () => {
        let eventData = this.state.data.sameTimeEvents[0];
        let customEventType = eventData.customEventType;
        let noTimeInfoLabel = this.findNoTimeLabel(customEventType, eventData);

        // let eventImage = eventData.primaryImageUrl;

        let isSpecialEvent = eventData.isSpecialEvent;
        let customHour = !isSpecialEvent
            ? eventData.customHour
            : noTimeInfoLabel;
        let eventDuration = eventData.hasDuration;
        // let eventCode = eventData.eventCode;
        // let eventSize = eventData.eventSize;
        let eventSource = eventData.eventSource;
        // let ownerPassenger = eventData.ownerPassenger;
        // let recipientPassengers = eventData.recipientPassengers;
        let loggedIsPartOf = eventData.loggedIsPartOf;
        let eventDurationLabel = eventDuration
            ? this.formatDurationLabel(eventData)
            : '';
        let isPurchased = eventSource === 'ORDER_SOURCE' ? true : false;
        let isWaitlisted = eventSource === 'WISHLIST_SOURCE' ? true : false;

        let dayCountLabel = '';

        if (eventData.dayCount && eventData.customEventType === 'landtour') {
            // dayCountLabel = this.state.staticData.landtourDurationLabel.replace(
            //     '{day}',
            //     eventData.dayCount
            // );
            dayCountLabel = 'Day ' + eventData.dayCount;
        }

        // month event--multiDays

        return (
            <div>
                <div
                    className={`event ${
                        eventDuration && !isSpecialEvent
                            ? 'event--multiDay'
                            : ''
                    } ${
                        eventData.customEventType === 'landtour'
                            ? 'event--landtour'
                            : ''
                    } ${
                        this.hasFilter('all') ||
                        this.hasFilter(
                            customEventType,
                            loggedIsPartOf,
                            isPurchased,
                            isWaitlisted
                        )
                            ? 'show'
                            : 'hide'
                    }`}
                >
                    <div className="event__icons">
                        <span className={`event__icon ${customEventType}`} />
                    </div>
                    <div className="event__txt">
                        <span className="event__hour">{customHour}</span>
                        {eventDuration &&
                            !isSpecialEvent && (
                                <span className="event__duration">
                                    {eventDurationLabel}
                                </span>
                            )}
                        {dayCountLabel !== '' && (
                            <span className="event__duration">
                                {dayCountLabel}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        );
    };
    renderSingleEventMedium = () => {
        const events = this.state.data.sameTimeEvents.map(
            (eventData, index) => {
                let customEventType = eventData.customEventType;
                let eventName =
                    customEventType === 'flight'
                        ? eventData.departureCityCode.$ +
                          ' - ' +
                          eventData.arrivalCityCode.$
                        : customEventType === 'hotel' ||
                          customEventType === 'transfer'
                            ? eventData.nameText
                            : eventData.name;
                // let eventImage = eventData.primaryImageUrl;
                let eventDesc =
                    customEventType === 'flight'
                        ? eventData.flightNumber.trim() === "TBA" || eventData.flightNumber.trim() === "XX" ? '' : eventData.flightNumber
                        : eventData.description;
                let eventDesc2Line =
                    customEventType === 'flight'
                        ? eventData.flightNumber.trim() === "TBA" || eventData.flightNumber.trim() === "XX" ? this.state.staticData.flightsTBC : eventData.carrierNameText
                        : '';
                // let eventType = eventData.eventType;

                let isSpecialEvent = eventData.isSpecialEvent;
                let noTimeInfoLabel = this.findNoTimeLabel(
                    customEventType,
                    eventData
                );

                let customHour = !isSpecialEvent
                    ? eventData.customHour
                    : noTimeInfoLabel;
                let eventDuration = eventData.hasDuration;
                // let eventCode = eventData.eventCode;

                let hasSize = eventData.eventSize ? true : false;
                let eventSize = hasSize ? eventData.eventSize : '';
                let eventSource = eventData.eventSource;
                // let ownerPassenger = eventData.ownerPassenger;
                // let recipientPassengers = eventData.recipientPassengers;
                let loggedIsPartOf = eventData.loggedIsPartOf;
                let eventDurationLabel = eventDuration
                    ? this.formatDurationLabel(eventData)
                    : '';
                let guestNumbers = '';
                let isPurchased = eventSource === 'ORDER_SOURCE' ? true : false;
                let isWaitlisted =
                    eventSource === 'WISHLIST_SOURCE' ? true : false;

                guestNumbers = this.state.staticData.guestsNumberLabel.replace(
                    '{guests}',
                    eventSize
                );

                // month event--multiDays

                return (
                    <div
                        className={`event ${
                            this.hasFilter('all') ||
                            this.hasFilter(
                                customEventType,
                                loggedIsPartOf,
                                isPurchased,
                                isWaitlisted
                            )
                                ? 'show'
                                : 'hide'
                        }`}
                        key={index}
                    >
                        <header className="event__header">
                            <span
                                className={`event__icon ${customEventType}`}
                            />
                            <span className="event__label">
                                {customEventType}
                            </span>
                        </header>
                        <div className="event__body">
                            <span className="event__hour">{customHour}</span>
                            {eventDuration && (
                                <span className="event__duration">
                                    {eventDurationLabel}
                                </span>
                            )}
                            <a href="#" className="event__name">
                                {eventName}
                            </a>
                            <p className="event__subname">{eventDesc}</p>
                            <p className="event__subname">{eventDesc2Line}</p>
                            {hasSize && (
                                <div className="event__guest">
                                    {guestNumbers}
                                    {loggedIsPartOf && (
                                        <span className="guest__icon" />
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                );
            }
        );

        return <div>{events}</div>;
    };

    closeTooltip(e) {
        analytics.clickTracking(this);
        e.preventDefault();
        this.setState({ hover: false });
    }
    handleMouseIn() {
        this.setState({ hover: true });
    }

    handleMouseOut() {
        this.setState({ hover: false });
    }
    /** tooltip Registered interested by */

    tooltipRegisteredInterested() {
        // let tooltipStyle = {
        //     display: this.state.hover ? 'block' : 'none'
        // };

        return (
            <span
                className="tooltip__icon"
                onMouseOver={this.handleMouseIn.bind(this)}
                onMouseOut={this.handleMouseOut.bind(this)}
            >
                <div className="tooltip__dd">
                    <a
                        className="tooltip__close"
                        onClick={(e) => this.closeTooltip(e)}
                    />
                    <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    </p>
                </div>
            </span>
        );
    }

    renderSingleEventLong = () => {
        // daily view
        const usOrder = this.state.country === 'US' ? true : false;
        const events = this.state.data.sameTimeEvents.map(
            (eventData, index) => {
                let customEventType = eventData.customEventType;
                let eventDepatureArivalDetail = customEventType === 'flight'
                 ? eventData.departureCityCode.$ +
                    '-' +
                    eventData.arrivalCityCode.$
                    : '';
                let eventName =
                    customEventType === 'flight'
                        ? // ? eventData.departureCityCode.$ +
                          //   '-' +
                          //   eventData.arrivalCityCode.$
                          eventData.flightNumber.trim() === 'TBA' || eventData.flightNumber.trim() === 'XX'
                          ? this.state.staticData.flightsTBC
                          : eventData.flightNumber +
                          ' - ' +
                          eventData.carrierNameText
                        : customEventType === 'hotel' ||
                          customEventType === 'transfer'
                            ? eventData.nameText
                            : customEventType === 'ips'
                                ? eventData.location
                                : eventData.name;

                // let eventImage = eventData.primaryImageUrl;
                let eventDesc = eventData.description;
                // let eventType = eventData.eventType;
                let noTimeInfoLabel = this.state.staticData.noTimeInfoLabel;
                // let noTimeInfoLabel = this.findNoTimeLabel(customEventType);
                let isSpecialEvent = eventData.isSpecialEvent;
                let customHour = !isSpecialEvent
                    ? eventData.customHour
                    : noTimeInfoLabel;

                let customDate = usOrder
                    ? moment(eventData.customDate).format('MMM DD')
                    : moment(eventData.customDate).format('DD MMM');
                let eventDuration = eventData.hasDuration;
                // let eventCode = eventData.eventCode;
                let hasSize = eventData.eventSize ? true : false;
                let eventSize = hasSize ? eventData.eventSize : '';
                let eventSource = eventData.eventSource;
                let ownerPassenger = eventData.ownerPassenger;
                let recipientPassengers = eventData.recipientPassengers;
                let loggedIsPartOf = eventData.loggedIsPartOf;
                // let recipientPassengers = true;
                let eventDurationLabel = eventDuration
                    ? this.formatDurationLabel(eventData)
                    : '';
                let guestNumbers = '';
                let guestNames = '';
                let isPurchased = eventSource === 'ORDER_SOURCE' ? true : false;
                let isWaitlisted =
                    eventSource === 'WISHLIST_SOURCE' ? true : false;

                guestNumbers = this.state.staticData.guestsNumberLabel.replace(
                    '{guests}',
                    eventSize
                );
                if (recipientPassengers) {
                    recipientPassengers.map((passenger, index) => {
                        let guestCompleteNames = `${passenger.title} ${
                            passenger.firstName
                        } ${passenger.lastName}`;

                        index < recipientPassengers.length - 1
                            ? (guestNames += `${guestCompleteNames}, `)
                            : (guestNames += guestCompleteNames);
                    });
                }
                // month event--multiDays

                let dayCountLabel = '';

                if (
                    eventData.dayCount &&
                    eventData.customEventType === 'landtour'
                ) {
                    // dayCountLabel = this.state.staticData.landtourDurationLabel.replace(
                    //     '{day}',
                    //     eventData.dayCount
                    // );
                    dayCountLabel = 'Day ' + eventData.dayCount;
                }

                return (
                    <div
                        className={`event ${
                            this.hasFilter('all') ||
                            this.hasFilter(
                                customEventType,
                                loggedIsPartOf,
                                isPurchased,
                                isWaitlisted
                            )
                                ? 'show'
                                : 'hide'
                        }`}
                        key={index}
                    >
                        <header className="event__header">
                            <span
                                className={`event__icon ${customEventType}`}
                            />
                            <span className="event__label">
                                {customEventType !== 'ips'
                                    ? customEventType
                                    : eventData.location}
                            </span>
                        </header>
                        <div className="event__body">
                            <div className="event__left">
                                {customEventType !== 'ips' ? (
                                    <div className="event__hour">
                                        <span>{customDate}</span>
                                        <span>{customHour}</span>
                                    </div>
                                ) : (
                                    <div className="event__hour">
                                        <span>
                                            {eventData.customArrivalTime}
                                        </span>
                                    </div>
                                )}

                                {eventDuration &&
                                    customEventType !== 'landtour' && (
                                        <span className="event__duration">
                                            {eventDurationLabel}
                                        </span>
                                    )}
                                {customEventType === 'landtour' && (
                                    <span className="event__duration">
                                        {dayCountLabel}
                                    </span>
                                )}
                                <a href="#" className="event__name">
                                    {eventName}
                                </a>
                                <p className="event__subname">
                                    {eventDepatureArivalDetail}
                                </p>
                                <p className="event__subname">{eventDesc}</p>
                                {customEventType !== 'ips' && (
                                    <div className="event__guest">
                                        <h5>{guestNumbers}</h5>
                                        {customEventType !== 'dining' &&
                                            recipientPassengers && (
                                                <div className="event__guestList">
                                                    <span className="">
                                                        {guestNames}
                                                    </span>
                                                </div>
                                            )}
                                    </div>
                                )}
                            </div>
                            {customEventType !== 'hotel' &&
                                customEventType !== 'flight' &&
                                customEventType !== 'ips' &&
                                customEventType !== 'transfer' &&
                                ownerPassenger && (
                                    <div className="event__right">
                                        <h5 className="event__label">
                                            {
                                                this.state.staticData
                                                    .purchasedByLabel
                                            }
                                        </h5>
                                        <p className="event__text">
                                            {ownerPassenger.title}{' '}
                                            {ownerPassenger.firstName}{' '}
                                            {ownerPassenger.lastName}
                                        </p>
                                        {loggedIsPartOf && (
                                            <span className="guest__icon" />
                                        )}
                                    </div>
                                )}
                        </div>
                    </div>
                );
            }
        );

        return <div>{events}</div>;
    };
    hasFilter = (
        eventFilter,
        loggedIsPartOf = false,
        isPurchased = false,
        isWaitlisted = false
    ) => {
        let bool = false;
        let partOfFiltering =
            this.props.filters.findIndex((f) => f === 'myBooking') !== -1
                ? true
                : false;
        let purchasedFiltering =
            this.props.filters.findIndex((f) => f === 'purchased') !== -1
                ? true
                : false;
        let waitlistFiltering =
            this.props.filters.findIndex((f) => f === 'waitlisted') !== -1
                ? true
                : false;

        this.props.filters.forEach((filter) => {
            if (filter === eventFilter) {
                bool = true;
            }
            if (partOfFiltering) {
                bool = loggedIsPartOf;
            }
            if (purchasedFiltering) {
                bool = isPurchased;
            }
            if (waitlistFiltering) {
                bool = isWaitlisted;
            }
        });

        return bool;
    };

    renderMultiEventShort = () => {
        let customHour = this.state.data.sameTimeEvents[0].customHour;
        let events = this.state.data.sameTimeEvents;

        let hasActiveFiltersNum = -1;
        let icons = events.map((d, index) => {
            let customEventType = d.customEventType;
            let noTimeInfoLabel = this.findNoTimeLabel(customEventType, d);
            let isSpecialEvent = d.isSpecialEvent;

            isSpecialEvent ? (customHour = noTimeInfoLabel) : null;

            let eventSource = d.eventSource;
            let loggedIsPartOf = d.loggedIsPartOf;
            let isPurchased = eventSource === 'ORDER_SOURCE' ? true : false;
            let isWaitlisted = eventSource === 'WISHLIST_SOURCE' ? true : false;

            this.hasFilter('all') ||
            this.hasFilter(
                customEventType,
                loggedIsPartOf,
                isPurchased,
                isWaitlisted
            )
                ? (hasActiveFiltersNum += 1)
                : null;
            let eventToRender =
                this.hasFilter('all') ||
                this.hasFilter(
                    customEventType,
                    loggedIsPartOf,
                    isPurchased,
                    isWaitlisted
                );

            while (hasActiveFiltersNum < 2 && eventToRender) {
                return (
                    <span
                        key={index}
                        className={`event__icon ${customEventType} ${
                            this.hasFilter('all') ||
                            this.hasFilter(
                                customEventType,
                                loggedIsPartOf,
                                isPurchased,
                                isWaitlisted
                            )
                                ? 'show'
                                : 'hide'
                        }`}
                    />
                );
            }
        });

        let moreThan2 = hasActiveFiltersNum >= 2 ? true : false;
        let hasSomeEvents = hasActiveFiltersNum === -1 ? false : true;

        return (
            <div
                className={`event ${moreThan2 ? 'event--plus2' : ''} ${
                    !hasSomeEvents ? 'hide' : ''
                }`}
            >
                <div className="event__icons">{icons}</div>
                <span className={`event__hour ${!hasSomeEvents ? 'hide' : ''}`}>
                    {customHour}
                </span>
            </div>
        );
    };

    render() {
        return (
            <li
                className={`event__item ${
                    this.state.hasFilter ? 'activeEvent' : ''
                }`}
            >
                {this.state &&
                    this.state.view === 'weekly' &&
                    this.state.multiEvents &&
                    this.state.isNoTime &&
                    // this.renderSingleEventWeek()
                    this.renderMultiEventShort()}
                {this.state &&
                    this.state.view === 'weekly' &&
                    !this.state.multiEvents &&
                    this.state.isNoTime &&
                    // this.renderSingleEventWeek()
                    this.renderSingleEventShort()}
                {this.state &&
                    this.state.view === 'weekly' &&
                    !this.state.isNoTime &&
                    this.renderSingleEventMedium()}
                {this.state &&
                    this.state.view === 'daily' &&
                    this.renderSingleEventLong()}
                {this.state &&
                    !this.state.multiEvents &&
                    this.state.view === 'monthly' &&
                    this.renderSingleEventShort()}
                {this.state &&
                    this.state.multiEvents &&
                    this.state.view === 'monthly' &&
                    this.renderMultiEventShort()}
            </li>
        );
    }
}

calendarEvent.propTypes = {};

export default calendarEvent;
