'use strict';

import React from 'react';
import Slider from 'react-slick';
import CalendarEvent from './calendarEvent';
import CalendarEmptyState from './calendarEmptyState';
import { breakpointsMax as Breakpoints } from '../../library/js/config/breakpoints';
import moment from 'moment';
import analytics from '../commons/CUK/analytics';
import FetchData from '../commons/CUK/fetch-data';

class calendarViewDay extends React.Component {
    constructor(props) {
        super(props);
        const { data } = this.props;

        this.settings = {
            accessibility: true,
            dots: false,
            infinite: false,
            arrows: false,
            slidesToShow: 7,
            slidesToScroll: 1,
            swipe: true,
            centerMode: true,
            responsive: [
                {
                    breakpoint: Breakpoints.mobile,
                    settings: {
                        slidesToShow: 3,
                        slidesToScroll: 1,
                        swipe: true,
                        centerPadding: '0px',
                        onSwipe: this.setActiveSlideAndMove
                    }
                },
                {
                    breakpoint: Breakpoints.mobileLandscape,
                    settings: {
                        slidesToShow: 3,
                        slidesToScroll: 1,
                        swipe: true,
                        centerPadding: '0'
                    }
                },
                {
                    breakpoint: Breakpoints.tablet,
                    settings: {
                        slidesToShow: 3,
                        slidesToScroll: 1,
                        swipe: true
                    }
                },
                {
                    breakpoint: 1200,
                    settings: {
                        slidesToShow: 5,
                        slidesToScroll: 1,
                        swipe: true
                    }
                },
                {
                    breakpoint: 1250,
                    settings: {
                        slidesToShow: 7,
                        slidesToScroll: 1,
                        swipe: true
                    }
                }
            ],
            afterChange: this.setActiveSlide
        };

        this.state = {
            days: data,
            noActive: false,
            res: []
        };
    }

    setActiveSlide = (currentSlide, mode) => {
        let ref = this[`day${currentSlide}`];

        ref.click();
        let prevBtn = typeof document !== 'undefined' && document.getElementsByClassName('nav_prev')[0];
        let nextBtn = typeof document !== 'undefined' && document.getElementsByClassName('nav_next')[0];

        !this.state.days[currentSlide - 1].inRange &&
            this.state.days[currentSlide - 1].idleType === 'no'
            ? prevBtn.classList.add('disabled')
            : prevBtn.classList.remove('disabled');
        !this.state.days[currentSlide + 1].inRange &&
            this.state.days[currentSlide + 1].idleType === 'no'
            ? nextBtn.classList.add('disabled')
            : nextBtn.classList.remove('disabled');
    };
    componentDidMount() {
        // analytics.clickTracking(this);
    }

    componentWillMount = () => {
        let selectedDay, selectedIndex;

        if (this.props.selectedDay && this.props.selectedIndex) {
            selectedDay = this.props.selectedDay;
            selectedIndex = this.props.selectedIndex;
        } else {
            for (let i = 0; i < this.props.data.length; i++) {
                let day = this.props.data[i];
                if (!day.isNoEventDay || day.dayType === 'embarkation') {
                    selectedDay = day.date;
                    selectedIndex = i;
                    break;
                }
            }

            // this.props.data.map((day, index) => {
            //     // if (day.isEmbarkationDate) {
            //     //     selectedDay = day.date;
            //     //     selectedIndex = index;
            //     // }
            //     if(!day.isNoEventDay){
            //         selectedDay = day.date;
            //         selectedIndex = index;
            //         break;
            //     }
            // });
        }

        this.setState(
            { selectedDay: selectedDay, selectedIndex: selectedIndex },
            () => {
                this.slider.slickGoTo(selectedIndex);
                this.getDressCodeForDay();
            }
        );
    };

    getDressCodeForDay = () => {
        const { selectedDay } = this.state;
        const { urlDressCode } = this.props;
        const apikey =
            typeof window !== 'undefined' ? window.configs.apikeyMycruise : '';
        const userData = JSON.parse(sessionStorage.getItem('userData'));
        // const cruiseData = JSON.parse(sessionStorage.getItem('cruiseData'));
        // const { embarkDate, disembarkDate } = cruiseData
        const { shipCode, brandCode } = userData
        var brand = brandCode.toUpperCase();
        brand = brand === 'CUNARD' ? 'CU' : 'PO';
        const url = `${urlDressCode}?&itineraryStartDate=${
            selectedDay
            }&itineraryEndDate=${selectedDay}&brand=${
            brand
            }&shipCode=${shipCode.toUpperCase()}`;

        FetchData(url, {
            method: 'GET',
            headers: {
                'x-commondata': JSON.stringify(this.state.header),
                'Content-Type': 'application/json',
                'X-Source-Identity-Token-0': apikey//YD needed

            }
        })
            .then(this.showDressCodeForDay)
            .catch((error) => {//AS-R
                this.setState({ error })
            });

    };

    showDressCodeForDay = (res) => {

        if (res) {

            this.setState({
                res: res.dressDetails[0],
            })

        }

    };

    renderDaysNavigation = () => {
        const daysNav = this.state.days.map((day, index) => {
            // let ref = `day${index}`;

            return (
                <div className="calendar__dayList" key={index}>
                    <div
                        className={`calendar__day ${
                            this.state.selectedIndex === index ? 'active' : ''
                        } ${!day.inRange ? 'disabled' : ''} ${
                            day.idl === 'plus' ? 'calendar__day--idl--plus' : ''
                        }
                        ${
                            day.idl === 'minus'
                                ? 'calendar__day--idl--minus'
                                : ''
                        }`}
                        aria-label={`${
                            this.state.selectedIndex === index ? 'selected' : ''
                        }`}
                        ref={(day) => (this[`day${index}`] = day)}
                        key={index}
                        onClick={(e) => {
                            analytics.clickTracking(this);
                            if (day.inRange) {
                                this.setState(
                                    {
                                        selectedDay: day.date,
                                        selectedIndex: index,
                                        noActive: true
                                    },
                                    () => {
                                        this.slider.slickGoTo(index);
                                        this.getDressCodeForDay();
                                    }
                                );
                            }
                        }}
                    >
                        <div className="calendar__dayWrapper">
                            {/* { index === 0 || day.formatedDay === '01' &&
                        <div className="calendar__monthLabel">{moment(day.date).format('MMM')}</div>
                    } */}
                            <div className="calendar__monthLabel">
                                {moment(day.date).format('MMM')}
                            </div>

                            <div className="calendar__dayLabel">
                                {day.formatedDay}
                            </div>
                        </div>
                    </div>
                </div>
            );
        });

        return (
            <Slider ref={(c) => (this.slider = c)} {...this.settings}>
                {daysNav}
            </Slider>
        );
    };

    changeSelectedIndex = (dir, e = false) => {
        if (e && e.key != 'Enter') {
            return false;
        }
        analytics.clickTracking(this);
        let currentIndex = this.state.selectedIndex;
        let newIndex = currentIndex + dir;
        let idlCase = false;

        // Jump IDL if exist any
        if (!this.state.days[newIndex].inRange) {
            let tryNewIndex = newIndex + dir;
            if (this.state.days[tryNewIndex].inRange) {
                newIndex = tryNewIndex;
                idlCase = true;
            }
        }

        if (
            newIndex !== -1 &&
            newIndex < this.state.days.length - 1 &&
            this.state.days[newIndex].inRange
        ) {
            this.setState(
                {
                    selectedDay: this.state.days[newIndex].date,
                    selectedIndex: newIndex
                },
                () => {
                    this.slider.slickGoTo(newIndex);
                    this.getDressCodeForDay();
                }
            );
        }
    };

    renderDaysContent = () => {
        const daysContent = this.state.days.map((day, index) => {
            if (day.inRange) {
                if (day.isNoEventDay) {
                    return (
                        <div
                            tabIndex={
                                this.state.selectedDay === day.date ? '0' : '-1'
                            }
                            key={index}
                            className={`day__content ${
                                this.state.selectedDay === day.date
                                    ? 'active'
                                    : 'notActive'
                            }`}
                        >
                            {this.calendarDayDetails(day)}
                            <CalendarEmptyState
                                dayType={this.props.data[index].dayType}
                                {...this.props.emptyStateData}
                                port={day.port}
                            />
                        </div>
                    );
                } else {
                    let events = day.data ? day.data.calendarEvents : undefined;

                    {
                        const dayEvents = events.map((event, i) => {
                            return (
                                <CalendarEvent
                                    key={i}
                                    data={event}
                                    view="daily"
                                    staticData={this.props.calendarEventData}
                                    filters={this.props.filters}
                                    country={this.props.country}
                                />
                            );
                        });

                        return (
                            <div
                                tabIndex={
                                    this.state.selectedDay === day.date
                                        ? '0'
                                        : '-1'
                                }
                                key={index}
                                className={`day__content ${
                                    this.state.selectedDay === day.date
                                        ? 'active'
                                        : 'notActive'
                                }`}
                            >
                                {this.calendarDayDetails(day)}
                                <ul>{dayEvents}</ul>
                            </div>
                        );
                    }
                }
            }
        });

        return <div>{daysContent}</div>;
    };

    closeTooltip(e) {
        analytics.clickTracking(this);
        e.preventDefault();
        this.setState({ hover: false });
    }
    closeTooltipA(e) {
        analytics.clickTracking(this);
        e.preventDefault();
        this.setState({ hoverA: false });
    }
    handleMouseIn() {
        this.setState({ hover: true });
    }

    handleMouseOut() {
        this.setState({ hover: false });
    }

    handleMouseInA() {
        this.setState({ hoverA: true });
    }

    handleMouseOutA() {
        this.setState({ hoverA: false });
    }

    calendarDayDetails = (day) => {
        let tooltipStyle = {
            display: this.state.hover ? 'block' : 'none'
        };
        let tooltipStyleA = {
            display: this.state.hoverA ? 'block' : 'none'
        };
        let className, titleLabel;
        const { labels } = this.props.attributes;
        switch (day.dayType) {
            case 'sea':
                titleLabel = labels.seaDayTitleLabel;
                className = 'calendarDay__status--seaDay ';
                break;

            case 'port':
                titleLabel = labels.portDayTitleLabel.replace(
                    '{port}',
                    day.port.name
                );
                className = 'calendarDay__status--portDay';
                break;
            case 'embarkation':
                titleLabel = labels.embarkationDayTitleLabel;
                className = 'calendarDay__status--embarkationDay';
                break;

            case 'disEmbarkation':
                titleLabel = labels.disembarkationDayTitleLabel;
                className = 'calendarDay__status--disembarkationDay';
                break;
        }

        return (
            <div className="calendarDay__details">
                <div className={`calendarDay__status ${className}`}>
                    <span className="calendarDay__icon" />
                    <span className="calendarDay__statusLabel">
                        <h4 className="calendarDay__title">{titleLabel}</h4>
                        {day.dayType !== 'disEmbarkation' &&
                            day.dayType !== 'embarkation' && (
                                <p className="calendarDay__text">
                                    {labels.onBoardDescriptionLabel}
                                </p>
                            )}
                    </span>
                </div>
                <div className="calendarDay__info">
                    {(day.dayType === 'disEmbarkation' ||
                        day.dayType === 'embarkation' ||
                        day.dayType === 'port') &&
                        day.docking !== '' && (
                            <div className="calendarDay__infoItem">
                                <h4 className="calendarDay__title">
                                    {labels.dockingTitle}
                                </h4>
                                <div className="calendarDay__text">
                                    <span
                                        className="tooltip__icon"
                                        onMouseOver={this.handleMouseInA.bind(
                                            this
                                        )}
                                        onMouseOut={this.handleMouseOutA.bind(
                                            this
                                        )}
                                    >
                                        <div
                                            className="tooltip__dd"
                                            style={tooltipStyleA}
                                        >
                                            <a
                                                className="tooltip__close"
                                                onClick={(e) =>
                                                    this.closeTooltipA(e)
                                                }
                                            />
                                            <p>{labels.dockingTooltipLabel}</p>
                                        </div>
                                    </span>
                                    <span>{day.docking}</span>
                                </div>
                            </div>
                        )}
                    {<span className="calendarDay__infoItem">
                        <h4 className="calendarDay__title">
                            {labels.dressCodeLabel}
                        </h4>
                        <div className="calendarDay__text">
                            <span
                                className="tooltip__icon"
                                onMouseOver={this.handleMouseIn.bind(this)}
                                onMouseOut={this.handleMouseOut.bind(this)}
                            >
                                <div
                                    className="tooltip__dd"
                                    style={tooltipStyle}
                                >
                                    <a
                                        className="tooltip__close"
                                        onClick={(e) => this.closeTooltip(e)}
                                    />
                                    <p>{labels.dressCodeTooltipLabel}</p>
                                </div>
                            </span>
                            <span>{this.state.res.dressCode}</span>
                        </div>
                    </span>}
                </div>
            </div>
        );
    };

    getNextPrevAriaLabel = (type = 'prev') => {
        const { labels } = this.props.attributes;
        if( type == 'next') {
            return labels.arianextLabel ? `${labels.arianextLabel}` : '';
        } else {
            return labels.ariaprevLabel ? `${labels.ariaprevLabel}` : '';
        }
    }
    render() {
        return (
            <div className="calendarViewDay">
                <div className="nav">
                    <a
                        tabIndex="0"
                        className="nav_next"
                        onKeyPress={(e) => {
                            this.changeSelectedIndex(1, e);
                        }}
                        onClick={(e) => {
                            this.changeSelectedIndex(1);
                        }}
                        data-linktext={'next day'}
                        data-componentname={this.props.type}
                        aria-label={`carousel ${moment(
                            this.state.selectedDay
                        ).format('MMM')} ${moment(
                            this.state.selectedDay
                        ).format('DD')} ${this.getNextPrevAriaLabel('next')}`}
                    />
                    {this.renderDaysNavigation()}
                    <a
                        tabIndex="0"
                        className="nav_prev"
                        aria-label={`carousel ${moment(
                            this.state.selectedDay
                        ).format('MMM')} ${moment(
                            this.state.selectedDay
                        ).format('DD')} ${this.getNextPrevAriaLabel('prev')}`}
                        onKeyPress={(e) => {
                            this.changeSelectedIndex(-1, e);
                        }}
                        onClick={(e) => {
                            this.changeSelectedIndex(-1);
                        }}
                        data-linktext={'prev day'}
                        data-componentname={this.props.type}
                    />
                </div>
                {/* {this.calendarDayDetails()} */}

                <div className="dayContent">{this.renderDaysContent()}</div>
            </div>
        );
    }
}

calendarViewDay.propTypes = {};

export default calendarViewDay;
