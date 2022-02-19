'use strict';

import React from 'react';
import CalendarEvent from './calendarEvent';
import moment from 'moment';
import analytics from '../commons/CUK/analytics';

class calendarViewMonth extends React.Component {
    constructor(props) {
        super(props);
        this.state = { footer: [], filters: this.props.filters };
    }

    componentDidMount() {
        const stickies = typeof document !== 'undefined' && document.querySelectorAll('.dayBox');
		
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
                    sticky.offsetHeight -
                    60
            );
        });

		
        document.addEventListener('scroll', () => {
            const top =
                (typeof document !== 'undefined' && document.documentElement.scrollTop) || document.body.scrollTop;

            [].forEach.call(stickies, (sticky) => {
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
            });
        });
        this.checkEventsNum();
        analytics.clickTracking(this);
    }

    componentDidUpdate = () => {
        if (this.props.filters !== this.state.filters) {
            this.checkEventsNum();
            this.setState({ filters: this.props.filters });
        }
    };
    renderCalendar = () => {
        const { data } = this.props;
        let alternating;
        const days = data.map((day, index) => {
            let formatedDay = day.formatedDay;
            let formatedMonth = moment(day.date).format('MMM');
            // port text to change in according with AEM to trasnlate to local language

            let portName = day.dayType === 'port' ? day.port.name : '';
            let headerTxt =
                index === 0 || formatedDay === '01'
                    ? `${formatedDay} ${formatedMonth}`
                    : formatedDay;
            let events = day.data ? day.data.calendarEvents : undefined;

            if (index === 0) {
                alternating = true;
            } else if (formatedDay === '01' && index !== 0) {
                alternating = alternating ? false : true;
            }

            return (
                <div
                    tabIndex={`${!day.inRange ? '-1' : '0'}`}
                    key={index}
                    onClick={(e) => {
                        day.inRange
                            ? this.props.onDaySelect(day.date, index)
                            : null;
                    }}
                    className={`dayBox ${
                        !day.inRange ? 'dayBox--disabled' : ''
                    } ${
                        day.dayType === 'port' && day.inRange ? 'portDay' : ''
                    } ${day.dayType === 'sea' && day.inRange ? 'seaDay' : ''} ${
                        day.isDisembarkationDate
                            ? 'monthDayBox--disembarkationDay'
                            : ''
                    } ${
                        day.isEmbarkationDate
                            ? 'monthDayBox--embarkationDay'
                            : ''
                    } ${day.idl === 'plus' ? 'monthDayBox--idl--plus' : ''}
                    ${day.idl === 'minus' ? 'monthDayBox--idl--minus' : ''} ${
                        alternating ? 'alter' : ''
                    }`}
                >
                    <header className="dayBox__header">
                        <div className="dayBox__txt">
                            <span className="dayBox__date">{headerTxt}</span>
                            <span className="dayBox__port">{portName}</span>
                        </div>
                        <span className="dayBox__dl" />
                        <span className="dayBox__status" />
                    </header>
                    <div className="dayBox__body">
                        {events && (
                            <ul>
                                {events.map((event, i) => {
                                    return (
                                        <CalendarEvent
                                            key={i}
                                            data={event}
                                            view="monthly"
                                            staticData={
                                                this.props.calendarEventData
                                            }
                                            filters={this.props.filters}
                                        />
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                    <footer className="dayBox__footer">
                        <span className="dayBox__more">
                            {this.state.footer[`dayBox${index}`]}
                        </span>
                    </footer>
                </div>
            );
        });

        return (
            <div className="calendar__wrapper">
                {this.renderWeekDays()}
                <div className="calendar__body">{days}</div>
            </div>
        );
    };
    checkEventsNum = () => {
        const { labels } = this.props.attributes;
        let dayBoxes = typeof document !== 'undefined' && document.querySelectorAll('.dayBox');

        let index = -1;

        dayBoxes.forEach((dayBox) => {
            index += 1;
            let eventItems = dayBox.querySelectorAll('.event__item');
            let visibleEventsNum = 0;

            eventItems.forEach((eventItem) => {
                eventItem.querySelectorAll('.show').length > 0
                    ? (visibleEventsNum += 1)
                    : null;
                visibleEventsNum > 4
                    ? eventItem.classList.add('hide')
                    : eventItem.classList.remove('hide');
            });

            let moreLabel = '';
            let actualState = this.state.footer;

            if (visibleEventsNum > 5) {
                let num = visibleEventsNum - 4;

                moreLabel = labels.moreLabel.replace('{events}', num);
            } else {
                moreLabel = '';
                visibleEventsNum === 5
                    ? eventItems.forEach((eventItem) => {
                          eventItem.classList.remove('hide');
                      })
                    : null;
            }
            actualState[`dayBox${index}`] = moreLabel;

            this.setState({ footer: actualState });
        });
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

        return <header className="calendar__days">{weekDays}</header>;
    };

    render() {
        const { data } = this.props;

        return (
            <div className="calendarViewMonth">
                {data && <div>{this.renderCalendar()}</div>}
            </div>
        );
    }
}

calendarViewMonth.propTypes = {};

export default calendarViewMonth;
