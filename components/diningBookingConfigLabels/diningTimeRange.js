import React from 'react';
import Link from '../commons/CUK/link';
import moment from 'moment';
import analytics from '../commons/CUK/analytics';

class diningTimeRange extends React.Component {
    constructor(props) {
        super(props);
    }

    handleClick = (e, i = 'dining') => {
        if (i == 'limelight') {
            analytics.setAdditionalPageTrackAttributes({
                event: 'event334'
            });
        } else {
            analytics.setAdditionalPageTrackAttributes({
                event: 'event332'
            });
        }

        const { timeSlotChangeHnadler } = this.props;
        timeSlotChangeHnadler && timeSlotChangeHnadler(e);
    };

    renderSingleTime(time, index) {
        const { seletedTimeSlot } = this.props;
        const activeClassName =
            seletedTimeSlot.availability == time.availability ? 'active' : '';
        return (
            <Link
                key={time.id}
                linkClassName={`single_time_slot ${activeClassName}`}
                onClick={() => this.handleClick(time)}
            >
                <span className={`time_container`}>
                    {moment(time.startDatetime).format('h:mm A')}
                </span>
            </Link>
        );
    }

    calendarDayDetails = (day) => {
        let className, titleLabel, depLabel;
        const { labels } = this.props;
        switch (day.dayType) {
            case 'SEA':
                titleLabel = labels.seaDayTitleLabel;
                className = 'calendarDay___status--seaDay';
                break;
            case 'PV':
                titleLabel = labels.portDayTitleLabel.replace(
                    '{port}',
                    day.name
                );
                // titleLabel = labels.portDayTitleLabel;
                className = 'calendarDay___status--portDay';
                break;
            case 'EMB':
                titleLabel = labels.embarkationDayTitleLabel;
                className = 'calendarDay___status--embarkationDay';
                break;
            case 'DEB':
                titleLabel = labels.disembarkationDayTitleLabel;
                className = 'calendarDay___status--disembarkationDay';
                break;
        }

        return titleLabel !== '' ? (
            <div
                className="calendarDay___details"
                style={{ justifyContent: 'left' }}
            >
                <div className={`calendarDay___status ${className}`}>
                    <span className="calendarDay___icon" />
                    <span className="calendarDay___iconLabel">
                        {titleLabel}
                    </span>
                </div>
            </div>
        ) : null;
    };

    renderTimeSlots(d, i) {
        const {
            seletedTimeSlot,
            labels,
            checkLimelightEvent,
            checkCookeryVenue
        } = this.props;
        const activeClassName =
            seletedTimeSlot.availability == d.availability ? 'active' : '';
        const priceLabel = `${labels.currencyLabel}${d.price} ${
            labels.perPlateLabel
        }`;
        if (checkLimelightEvent || checkCookeryVenue) {
            const newDateTime = `${d.time} | ${moment(
                d.date,
                'YYYY-MM-DD'
            ).format('DD MMM')}`;
            const pLabel = `${labels.currencyLabel}${d.price} ${
                labels.perPlateLabel
            }`;
            return (
                <div className="timeslot-with-date">
                    <Link
                        key={'timeslot-' + i}
                        linkClassName={`single_time_slot ${activeClassName}`}
                        onClick={() => this.handleClick(d, 'limelight')}
                    >
                        <span className={`time_container`}>{newDateTime}</span>
                        {d.price && (
                            <span className={`time_container`}>{pLabel}</span>
                        )}
                    </Link>
                    {this.calendarDayDetails(d)}
                </div>
            );
        } else {
            if (d.status == 'Available') {
                return (
                    <Link
                        key={'timeslot-' + i}
                        linkClassName={`single_time_slot ${activeClassName}`}
                        onClick={() => this.handleClick(d)}
                    >
                        <span className={`time_container`}>{d.time}</span>
                        {d.price && (
                            <span className={`time_container`}>
                                {priceLabel}
                            </span>
                        )}
                    </Link>
                );
            } else {
                return '';
            }
        }
    }

    renderGenericTimeSlot() {
        const {
            labels,
            selectedDay,
            selectedDayTreatmentList,
            selectedMealPeriod
        } = this.props;

        const timeSlotList = [];
        if (selectedMealPeriod !== '') {
            selectedDayTreatmentList
                .filter((items) => items.categories === selectedMealPeriod)
                .map((items) => {
                    timeSlotList.push(items);
                });
        } else if (selectedMealPeriod === '') {
            selectedDayTreatmentList.map((item) => {
                timeSlotList.push(item);
            });
        }
        const selectedDate = moment(selectedDay.date).format('DD MMMM YYYY');
        return (
            <div className="continer">
                <div className="selectTime-wrapper">
                    {timeSlotList.length > 0 && (
                        <div className="heading">
                            <div className="dateSection">
                                <span className="select_time_label">
                                    {labels.selectTimeLabel}
                                </span>
                                <span className="">{selectedDate}</span>
                            </div>
                        </div>
                    )}
                    <div className="details" style={{ flexWrap: 'wrap' }}>
                        <div className="right-section">
                            {timeSlotList.map((d, i) =>
                                this.renderTimeSlots(d, i)
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    renderLimelightTimeSlot() {
        const { labels, calenderDateRange } = this.props;

        const timeSlotList = [];
        calenderDateRange
            .filter((items) => items.timeSlot.length !== 0)
            .map((items) => {
                const newDateTimeList = {};
                items.timeSlot.map((t) => {
                    newDateTimeList['date'] = items.date;
                    newDateTimeList['dayType'] = items.dayType;
                    newDateTimeList['name'] = items.name;
                    newDateTimeList['time'] = t.time;
                    newDateTimeList['availability'] = t.availability;
                    newDateTimeList['price'] = t.price;
                    newDateTimeList['price'] = t.price;
                    newDateTimeList['eventCode'] = t.eventCode;
                    newDateTimeList['eventId'] = t.eventId;
                    newDateTimeList['categories'] = '';
                });
                timeSlotList.push(newDateTimeList);
            });
        return (
            <div className="continer">
                <div className="selectTime-wrapper">
                    {calenderDateRange.length > 0 && (
                        <div className="heading">
                            <div className="dateSection">
                                <span className="select_time_label">
                                    {labels.selectSessionDiningLabel}
                                </span>
                            </div>
                        </div>
                    )}
                    <div className="details" style={{ flexWrap: 'wrap' }}>
                        <div className="right-section">
                            {timeSlotList.map((d, i) =>
                                this.renderTimeSlots(d, i)
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    render() {
        const { checkLimelightEvent, checkCookeryVenue } = this.props;

        return checkLimelightEvent || checkCookeryVenue
            ? this.renderLimelightTimeSlot()
            : this.renderGenericTimeSlot();
    }
}

export default diningTimeRange;
