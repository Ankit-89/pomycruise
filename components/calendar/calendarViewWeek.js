'use strict';

import React from 'react';
import CalendarEvent from './calendarEvent';
import moment from 'moment';
import analytics from '../commons/CUK/analytics';

class calendarViewWeek extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            activeWeek: 1
        };
    }

    componentWillMount = () => {
        this.divideDataToWeeks();
    };
    componentDidUpdate = () => {
        this.initStickyness();
        this.checkHeightOfRows();
    };
    componentDidMount = () => {
        this.initStickyness();
        this.checkHeightOfRows();

        // analytics.clickTracking(this);
    };

    checkHeightOfRows = () => {
        const { array24 } = this.props;
        let weeksWrapper = typeof document !== 'undefined' && document.querySelectorAll('.calendarViewWeek');

        weeksWrapper.forEach((week) => {
            let timeEventsEarly = week.querySelectorAll('.timeEvents--early');

            array24.map((time, index) => {
                let slotToFix = week.querySelectorAll(
                    `[data-hour="${time.time}"]`
                );

                let slotToFixHeight = 0;

                slotToFix.forEach((slot) => {
                    let slotHeight = 40;

                    if (slot.querySelectorAll('.dayBox__events').length !== 0) {
                        slot.querySelectorAll('.dayBox__events').forEach(
                            (item) => {
                                slotHeight += item.offsetHeight;
                            }
                        );
                    }

                    slotHeight > slotToFixHeight
                        ? (slotToFixHeight = slotHeight)
                        : null;
                });
                slotToFix.forEach((slot) => {
                    slot.style.height = `${slotToFixHeight}px`;
                });
            });
            let headerHeight = week.querySelectorAll('.calendar__days')[0]
                .offsetHeight;
            let noTimeEventsHeight = week.querySelectorAll(
                '[data-hour="NO-TIME"]'
            )[0].offsetHeight;
            let dayBoxHeaderHeight = 60;

            timeEventsEarly[0].style.top = `${headerHeight +
                noTimeEventsHeight +
                dayBoxHeaderHeight}px`;
        });
    };
    initStickyness = () => {
        const stickies = typeof document !== 'undefined' && document.querySelectorAll('.calendar__body');


        [].forEach.call(stickies, (sticky) => {
            sticky.setAttribute(
                'data-sticky-initial',
                sticky.getBoundingClientRect().top +
                    (typeof document !== 'undefined' && document.documentElement.scrollTop)
            );
            sticky.setAttribute(
                'data-sticky-final',
                sticky.getBoundingClientRect().top +
                    (typeof document !== 'undefined' && document.documentElement.scrollTop) +
                    sticky.offsetHeight
            );
        });
        document.addEventListener('scroll', () => {
            const top =
                (typeof document !== 'undefined' && document.documentElement.scrollTop) || (typeof document !== 'undefined' && document.body.scrollTop);

            [].forEach.call(stickies, (sticky) => {
                if (sticky.classList.contains('active')) {
                    const stickyInitial = parseInt(
                        sticky.getAttribute('data-sticky-initial'),
                        10
                    );
                    const stickyFinal = parseInt(
                        sticky.getAttribute('data-sticky-final'),
                        10
                    );

                    if (top >= stickyInitial && top < stickyFinal) {
                        sticky.classList.add('sticky');
                    } else {
                        sticky.classList.remove('sticky');
                    }
                }
            });
        });
    };
    divideDataToWeeks = () => {
        const { data } = this.props;

        let weeks = [];
        let size = 7;

        const weekRenderInfo = {};

        for (let i = 0; i < data.length; i += size) {
            let week = data.slice(i, i + size);

            weeks.push(week);
        }

        for (let j = 1; j < weeks.length + 1; j++) {
            let w = (weekRenderInfo[`week_${j}`] = {});

            w.earlytime = false;
            w.lateTime = false;
        }

        weeks.forEach((week) => {
            let weekEarlyEventsTot = 0;
            let weekLaterEventsTot = 0;

            week.map((days, i) => {
                weekEarlyEventsTot += days.earlyEventsTotal;
                weekLaterEventsTot += days.laterEventsTotal;
            });
            week.weekEarlyEventsTot = weekEarlyEventsTot;
            week.weekLaterEventsTot = weekLaterEventsTot;
        });

        this.setState(
            {
                weeks: weeks,
                totalWeeksNum: weeks.length,
                weekRenderInfo: weekRenderInfo
            },
            () => {}
        );
    };

    renderDay = (dayData, weekNum, dayNum) => {
        const day = dayData.hours.map((timeSlot, index) => {
            var tm = moment(timeSlot.time, ['h:mm A']).format('HH:mm');

            let earlyTimeSlot = parseInt(tm) < 7 ? true : false;
            let timeText = dayNum === 0 ? timeSlot.time : '';
            let isNoTime = timeSlot.time === 'NO-TIME' ? true : false;

            return (
                <div
                    role="row"
                    className={`dayBox__timeslot ${
                        earlyTimeSlot
                            ? !this.state.weekRenderInfo[`week_${weekNum}`]
                                  .earlytime
                                ? 'notActive'
                                : 'active'
                            : ''
                    }`}
                    key={index}
                    data-hour={timeSlot.time}
                >
                    <div className="dayBox__time">{timeText}</div>

                    <div className="dayBox__events">
                        {timeSlot.data &&
                            timeSlot.data.length > 0 && (
                                <ul className="event__list">
                                    {this.renderTimeSlotEvents(
                                        timeSlot.data,
                                        isNoTime
                                    )}
                                </ul>
                            )}
                    </div>
                </div>
            );
        });

        return day;
    };
    renderTimeSlotEvents = (eventsData, isNoTime) => {
        let temp = {};

        temp.sameTimeEvents = eventsData;

        return (
            <CalendarEvent
                data={temp}
                view="weekly"
                staticData={this.props.calendarEventData}
                filters={this.props.filters}
                isNoTime={isNoTime}
            />
        );
    };
    renderCalendarWeek = (week, weekNum) => {
        const days = week.map((day, index) => {
            let formatedDay = day.formatedDay;
            let formatedMonth = moment(day.date).format('MMM');
            let headerTxt = `${formatedDay} ${formatedMonth}`;
                // index === 0 || formatedDay === '01'
                //     ? `${formatedDay} ${formatedMonth}`
                //     : formatedDay;

            return (
                <div
                    tabIndex={`${!day.inRange ? '-1' : '0'}`}
                    className={`dayBox ${
                        !day.inRange ? 'dayBox--disabled' : ''
                    } ${
                        day.isDisembarkationDate
                            ? 'monthDayBox--disembarkationDay'
                            : ''
                    } ${
                        day.isEmbarkationDate
                            ? 'monthDayBox--embarkationDay'
                            : ''
                    } ${
                        day.dayType === 'port' && day.inRange ? 'portDay' : ''
                    } ${day.dayType === 'sea' && day.inRange ? 'seaDay' : ''} ${
                        day.idl === 'plus' ? 'dayBox--idl--plus' : ''
                    } ${day.idl === 'minus' ? 'dayBox--idl--minus' : ''}`}
                    key={index}
                >
                    <header
                        className="dayBox__header"
                        onClick={(e) => {
                            let indexToGo = (weekNum - 1) * 7 + index;

                            day.inRange
                                ? this.props.onDaySelect(day.date, indexToGo)
                                : null;
                        }}
                    >
                        <span className="dayBox__date">{headerTxt}</span>
                        <span className="dayBox__dl" />
                        <span className="dayBox__status" />
                    </header>
                    <div className="dayBox__body">
                        {this.renderDay(day, weekNum, index)}
                    </div>
                </div>
            );
        });

        return <div className="monthWeekBox">{days}</div>;
    };

    changeEarlyTimeVisibility = (weekNum) => {
        analytics.clickTracking(this)
        let weekRenderInfoState = this.state.weekRenderInfo;
        let visible = weekRenderInfoState[`week_${weekNum}`].earlytime
            ? false
            : true;

        weekRenderInfoState[`week_${weekNum}`].earlytime = visible;

        this.setState(
            {
                weekRenderInfo: weekRenderInfoState
            },
            () => {
                // this.forceUpdate()
            }
        );
    };
    renderAllWeeks = () => {
        const weeks = this.state.weeks.map((week, index) => {
            return (
                <div
                    className={`calendarViewWeek ${
                        this.state.activeWeek === index + 1
                            ? 'active'
                            : 'notActive'
                    }`}
                    key={index}
                >
                    <div className="calendar__wrapper">
                        <header className="calendar__days" ref={this.sticky}>
                            {this.renderWeekDays()}
                        </header>
                        <a
                            tabIndex="0"
                            className={`timeEvents timeEvents--early ${
                                this.state.weekRenderInfo[`week_${index + 1}`]
                                    .earlytime
                                    ? 'visible'
                                    : ''
                            }`}
                            aria-expanded={`${this.state.weekRenderInfo[`week_${index + 1}`].earlytime ? true : false }`}
                            onClick={(e) => {
                                this.changeEarlyTimeVisibility(index + 1);
                            }}
                            data-linktext={'Early time events'}
                            data-componentname={this.props.type}
                        >
                            <span className="timeEvents__wrapper">
                                <span className="events__notify">
                                    {week.weekEarlyEventsTot}
                                </span>Early time events
                            </span>
                        </a>
                        <div
                            className={`calendar__body ${
                                this.state.activeWeek === index + 1
                                    ? 'active'
                                    : 'notActive'
                            }`}
                        >
                            {this.renderCalendarWeek(week, index + 1)}
                        </div>
                        {/* <div className="timeEvents timeEvents--later">
                        <span className="timeEvents__wrapper">
                            <span className="events__notify">{week.weekLaterEventsTot}</span>Later time events
                        </span>
                    </div> */}
                    </div>
                </div>
            );
        });

        return <div>{weeks}</div>;
    };
    setWeek = (e, slot, scroll = false) => {
        analytics.clickTracking(this);
        let actualWeek = this.state.activeWeek;
        let weekToShow = actualWeek + slot;

        if (weekToShow !== 0 && weekToShow !== this.state.totalWeeksNum + 1) {
            this.setState(
                {
                    activeWeek: weekToShow
                },
                () => {
                    scroll ? window.scrollTo(0, 0) : null;
                }
            );
        }
    };
    renderWeekDays = () => {
        let weekdaysByMonday = moment.weekdaysShort();
        let sunday = weekdaysByMonday.shift();

        weekdaysByMonday.push(sunday);

        const weekDays = weekdaysByMonday.map((day, index) => {
            return (
                <span className="calendar__day" key={index}>
                    {day}.
                </span>
            );
        });

        return <div>{weekDays}</div>;
    };
    render() {
        const { labels } = this.props.attributes;

        return (
            <div className="allWeeks">
                <div className="weekNavigation">
                    <div
                        tabIndex="0"
                        className="nextWeekBtn"
                        onClick={(e) => {
                            this.setWeek(e, 1);
                        }}
                        data-linktext={'next week'}
                        data-componentname={this.props.type}
                    >
                        {labels.nextLabel}
                    </div>
                    <div
                        tabIndex="0"
                        className="prevWeekBtn"
                        onClick={(e) => {
                            this.setWeek(e, -1);
                        }}
                        data-componentname={this.props.type}
                        data-linktext={'prev week'}
                    >
                        {labels.prevLabel}
                    </div>
                </div>
                {this.renderAllWeeks()}
                <div className="weekNavigation">
                    <div
                        tabIndex="0"
                        className="nextWeekBtn"
                        onClick={(e) => {
                            this.setWeek(e, 1, true);
                        }}
                        data-linktext={'next week'}
                        data-componentname={this.props.type}
                    >
                        {labels.nextLabel}
                    </div>
                    <div
                        tabIndex="0"
                        className="prevWeekBtn"
                        onClick={(e) => {
                            this.setWeek(e, -1, true);
                        }}
                        data-componentname={this.props.type}
                        data-linktext={'prev week'}
                    >
                        {labels.prevLabel}
                    </div>
                </div>
            </div>
        );
    }
}

calendarViewWeek.propTypes = {};

export default calendarViewWeek;
