import React from 'react';
import Link from '../commons/CUK/link';
import moment from 'moment';

class entertainmentTimeRange extends React.Component {
    constructor(props) {
        super(props);
    }

    handleClick = (e) => {
        const { timeSlotChangeHnadler } = this.props;
        timeSlotChangeHnadler && timeSlotChangeHnadler(e);
    };

    renderSingleTime(time, index) {
        const { seletedTimeSlot } = this.props;
        const activeClassName = seletedTimeSlot.id == time.id ? 'active' : '';
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

    renderTimeSlots(d, i) {
        const { seletedTimeSlot } = this.props;
        const activeClassName = seletedTimeSlot.time == d.time ? 'active' : '';
        console.log('Time >>>>>', d);
        if (d.status == 'Available') {
            return (
                <Link
                    key={'timeslot-' + i}
                    linkClassName={`single_time_slot ${activeClassName}`}
                    onClick={() => this.handleClick(d)}
                >
                    <span className={`time_container`}>{d.time}</span>
                </Link>
            );
        } else {
            return '';
        }
    }

    render() {
        const { labels, selectedDay, selectedDayTreatmentList } = this.props;
        const selectedDate = moment(selectedDay.date).format('DD MMMM YYYY');
        return (
            <div className="continer">
                <div className="selectTime-wrapper">
                    {selectedDayTreatmentList.length > 0 && (
                        <div className="heading">
                            <div className="dateSection">
                                <span className="select_time_label">
                                    {labels.selectTimeLabel}
                                </span>
                                <span className="">{selectedDate}</span>
                            </div>
                        </div>
                    )}
                    <div className="details">
                        <div className="right-section">
                            {selectedDayTreatmentList.map((d, i) =>
                                this.renderTimeSlots(d, i)
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default entertainmentTimeRange;
