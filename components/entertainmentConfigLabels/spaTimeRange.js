import React from 'react';
import Link from '../commons/CUK/link';
import moment from 'moment';

class spaTimeRange extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            data: [],
            modified: false
        };
    }

    componentWillMount() {}

    manipulateTimeString(timeStr, value) {
        var now = new Date();
        now.setHours(timeStr.substr(0, timeStr.indexOf(':')));
        now.setMinutes(
            parseInt(timeStr.substr(timeStr.indexOf(':') + 1)) + value
        );
        now.setSeconds(0);
        const timeString = moment(now.getTime()).format('h:mm');
        console.log('timeString', timeString);
        return timeString;
    }

    componentWillReceiveProps(nextProps) {debugger
        const config = typeof window !== 'undefined' ? window.configs : {};
        if (this.state.modified !== nextProps.modified) {
            const {
                selectedDayTreatmentList = [],
                selectedDay,
                labels: { morningLabel, eveningLabel, afternoonLabel }
            } = nextProps;
            const newData = [];
            if (selectedDayTreatmentList.length > 0) {
                selectedDayTreatmentList.map((singleTreatment) => {
                    let timeSlot = '';
                    if (
                        moment(singleTreatment.startDatetime).isBetween(
                            `${selectedDay.date}T${
                                config.spaMorningAppointmentTimeStart
                            }:00`,
                            `${selectedDay.date}T${
                                config.spaMorningAppointmentTimeEnd
                            }:00`,
                            'minute'
                        )
                    ) {
                        timeSlot = morningLabel;
                    } else if (
                        moment(singleTreatment.startDatetime).isBetween(
                            `${selectedDay.date}T${
                                config.spaAfternoonAppointmentTimeStart
                            }:00`,
                            `${selectedDay.date}T${
                                config.spaAfternoonAppointmentTimeEnd
                            }:00`,
                            'minute'
                        )
                    ) {
                        timeSlot = afternoonLabel;
                    } else if (
                        moment(singleTreatment.startDatetime).isBetween(
                            `${selectedDay.date}T${
                                config.spaEveningAppointmentTimeStart
                            }:00`,
                            `${selectedDay.date}T${
                                config.spaEveningAppointmentTimeEnd
                            }:00`,
                            'minute'
                        )
                    ) {
                        timeSlot = eveningLabel;
                    }
                    if (!newData.hasOwnProperty(timeSlot)) {
                        newData[`${timeSlot}`] = [];
                        newData[`${timeSlot}`].push(singleTreatment);
                    } else {
                        newData[`${timeSlot}`].push(singleTreatment);
                    }
                });
                this.setState({
                    data: newData,
                    modified: !this.state.modified
                });
            } else {
                this.setState({
                    data: newData,
                    modified: !this.state.modified
                });
            }
        }
    }

    handleClick = (e) => {
        this.setState(
            {
                modified: true
            },
            () => {
                const { timeSlotChangeHnadler } = this.props;
                timeSlotChangeHnadler && timeSlotChangeHnadler(e);
            }
        );
    };

    renderSingleTime(time, index) {
        const { seletedTimeSlot, bestPriceImageUrl } = this.props;
        const bestPrice = time.bestPrice ? 'bestPrice' : '';
        const activeClassName = seletedTimeSlot.id == time.id ? 'active' : '';
        const price =
            time.promotionalPrice < time.standardPrice
                ? time.promotionalPrice
                : time.standardPrice;
        return (
            <Link
                key={time.id}
                linkClassName={`single_time_slot ${activeClassName}`}
                onClick={() => this.handleClick(time)}
            >
                <span className={`time_container`}>
                    {moment(time.startDatetime).format('h:mm A')}
                </span>
                <div className="bottom_box">
                    <span className={`price_container ${bestPrice}`}>
                        {`£${price}`}
                    </span>
                    {time.bestPrice && (
                        <img src={bestPriceImageUrl} alt="alt" />
                    )}
                </div>
            </Link>
        );
    }

    renderTimeSlots(data, timeSpan) {
        // debugger;
        return (
            <div className="details" key={timeSpan}>
                <div className="left-section">{timeSpan}</div>
                <div className="right-section">
                    {data.map((time, index) =>
                        this.renderSingleTime(time, index)
                    )}
                </div>
            </div>
        );
    }

    render() {
        const { data } = this.state;
        const { labels, selectedDay } = this.props;
        const selectedDate = moment(selectedDay.date).format('DD MMMM YYYY');
        return (
            <div className="continer">
                <div className="selectTime-wrapper">
                    <div className="heading">
                        <div className="dateSection">
                            <span className="select_time_label">
                                {labels.selectTimeLabel}
                            </span>
                            <span className="">{selectedDate}</span>
                        </div>
                        <div className="bestPrice">
                            <img
                                src={
                                    'https://dev.my-np.pocruises.com/content/dam/pno/icons/tag.png'
                                }
                                alt="alt"
                            />
                            <span>{labels.bestPriceLabel}</span>
                        </div>
                    </div>
                    {Object.keys(data).map((singleData) =>
                        this.renderTimeSlots(data[singleData], singleData)
                    )}
                </div>
            </div>
        );
    }
}

export default spaTimeRange;
