import React, { useDebugValue } from 'react';
import moment from 'moment';
import Slider from 'react-slick';
import {
    breakpointsMax as Breakpoints,
    VIEWPORT_TYPE,
    watchForBreakpoint
} from '../../library/js/config/breakpoints';
import SessionStorage from '../commons/CUK/session-storage';
import debug from 'debug';

class diningDateRange extends React.Component {
    constructor(props) {
        super(props);

        this.settings = {
            accessibility: true,
            dots: false,
            infinite: false,
            slidesToShow: 7,
            slidesToScroll: 7,
            centerMode: false,
            arrows: false,
            responsive: [
                {
                    breakpoint: 1250,
                    settings: {
                        slidesToShow: 7,
                        slidesToScroll: 7,
                        swipe: false
                    }
                },
                {
                    breakpoint: 1200,
                    settings: {
                        slidesToShow: 7,
                        slidesToScroll: 7,
                        swipe: false
                    }
                },
                {
                    breakpoint: Breakpoints.tablet,
                    settings: {
                        slidesToShow: 3,
                        slidesToScroll: 3,
                        swipe: true
                    }
                },
                {
                    breakpoint: Breakpoints.mobileLandscape,
                    settings: {
                        slidesToShow: 3,
                        slidesToScroll: 3,
                        swipe: true,
                        centerPadding: '0px'
                    }
                },
                {
                    breakpoint: Breakpoints.mobile,
                    settings: {
                        slidesToShow: 3,
                        slidesToScroll: 3,
                        swipe: true,
                        centerPadding: '0px'
                    }
                }
            ],
            afterChange: this.setActiveSlide
        };

        this.state = {
            isDisabledPrevButton: true,
            nextBtnClick: false,
            prevBtnClick: false,
            selectedIndex: -1
        };

        this.setActiveSlide = this.setActiveSlide.bind(this);
    }

    // componentDidMount() {
    //     this.handleSlickPrevSlide();
    // }

    setActiveSlide = (currentSlide, mode) => {
        let ref = this[`day${currentSlide}`];
        //ref.click();
        let prevBtn = document.getElementsByClassName('nav_prev')[
            this.props.tabIndex
        ];
        let nextBtn = document.getElementsByClassName('nav_next')[
            this.props.tabIndex
        ];
        const slidesToScrollDays = this.slider.props.responsive.filter(
            (singleScreen) =>
                singleScreen.breakpoint == this.slider.state.breakpoint
        );
        const slideToShowOnSLider = slidesToScrollDays.length
            ? slidesToScrollDays[0].settings.slidesToShow
            : 7;
        this.props.calenderDateRange[currentSlide - 1] == void 0
            ? prevBtn.classList.add('disabled')
            : prevBtn.classList.remove('disabled');
        this.props.calenderDateRange.length - currentSlide <=
        slideToShowOnSLider
            ? nextBtn.classList.add('disabled')
            : nextBtn.classList.remove('disabled');
        const date = this.props.calenderDateRange[currentSlide];
        const {
            sliderChangeHandler,
            isSlickToGoCall,
            getShipEventAPIValue,
            selectedWheelchair,
            selectedGuest
        } = this.props;
        const value = isSlickToGoCall ? false : true;

        getShipEventAPIValue &&
            getShipEventAPIValue(
                selectedGuest.length ? selectedGuest[0] : 0,
                selectedWheelchair.length ? selectedWheelchair[0] : 0,
                date
            );
        // sliderChangeHandler &&
        //     sliderChangeHandler(
        //         date,
        //         this.state.nextBtnClick,
        //         this.state.prevBtnClick,
        //         slideToShowOnSLider,
        //         value
        //     );
    };

    renderDateSelector() {
        let sliderRange = 7;
        const mqlMVP = watchForBreakpoint(VIEWPORT_TYPE.TABLET, true);
        if (mqlMVP.matches) {
            sliderRange = 3;
        }
        const ShowButton = this.props.calenderDateRange.length > sliderRange;
        const disabled = this.state.isDisabledPrevButton ? 'disabled' : '';

        return (
            <div className="calendarViewDay">
                <div className="nav">
                    {ShowButton && (
                        <div
                            className={`nav_next`}
                            onClick={(e) => {
                                this.handleSlickNextSlide();
                            }}
                            data-linktext={'next day'}
                            data-componentname={this.props.type}
                        />
                    )}
                    {this.renderDaysNavigation()}
                    {ShowButton && (
                        <div
                            className={`${disabled} nav_prev`}
                            onClick={(e) => {
                                this.handleSlickPrevSlide();
                            }}
                            data-linktext={'prev day'}
                            data-componentname={this.props.type}
                        />
                    )}
                </div>
            </div>
        );
    }

    handleSlickNextSlide = () => {
        this.setState(
            {
                nextBtnClick: true,
                prevBtnClick: false,
                isDisabledPrevButton: false
            },
            () => {
                this.slider.slickNext();
            }
        );
    };

    handleSlickPrevSlide = () => {
        this.setState(
            {
                nextBtnClick: false,
                prevBtnClick: true
            },
            () => {
                this.slider.slickPrev();
            }
        );
    };

    handleClick = (day, index) => {
        const header = SessionStorage.getItem('header');
        const { embarkationDate } = header;
        const embarkMonth = moment(embarkationDate, 'YYYY-MM-DD').format(
            'MMM YY'
        );
        const isMonthSame =
            moment(
                this.props.calenderDateRange[index].date,
                'YYYY-MM-DD'
            ).format('MMM YY') == embarkMonth;
        let sliderRange = 7;
        const mqlMVP = watchForBreakpoint(VIEWPORT_TYPE.TABLET, true);
        if (mqlMVP.matches) {
            sliderRange = 3;
        }
        const { isSlickToGoCall } = this.props;
        const clickIndex =
            index <= sliderRange ? (isMonthSame ? 0 : index) : index;
        if (
            this.props.selectedGuest.length &&
            day.timeSlot.length &&
            !isSlickToGoCall
        ) {
            this.setState(
                {
                    selectedDay: day.date,
                    selectedIndex: index,
                    noActive: true
                },
                () => {
                    if (isSlickToGoCall) {
                        this.slider.slickGoTo(clickIndex);
                    }
                    const { dateChangeHnadler } = this.props;
                    dateChangeHnadler && dateChangeHnadler(day, index, false);
                }
            );
        } else {
            if (isSlickToGoCall) {
                this.slider.slickGoTo(clickIndex);
                const { dateChangeHandlerWhenNotInRange } = this.props;
                dateChangeHandlerWhenNotInRange &&
                    dateChangeHandlerWhenNotInRange();
            }
        }
    };

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
            <div className="calendarDay___details">
                <div className={`calendarDay___status ${className}`}>
                    <span className="calendarDay___icon" />
                    <span className="calendarDay___iconLabel">
                        {titleLabel}
                    </span>
                </div>
                <span className="calendarDay___iconDEPLabel">{depLabel}</span>
            </div>
        ) : null;
    };

    renderDaysNavigation = () => {
        // const {
        //     selectedPassenger,
        //     eventCatoryies,
        //     bookedEventData
        // } = this.props;

        // bookedEventData.length > 0 &&
        //     bookedEventData.map((eventsList, index) => {
        //         selectedPassenger.map((passenger, c) => {
        //             const checkGuest = eventsList.guests.find(
        //                 (e) => e.paxId == passenger
        //             );
        //             const guestBooked =
        //                 checkGuest != undefined ? passenger : '';
        //             // guestBookedValue.push(guestBooked);
        //         });
        //     });
        //debugger;
        console.log(this.props.calenderDateRange);
        const daysNav = this.props.calenderDateRange.map((day, index) => {
            const d = day.eventId;
            return (
                <div>
                    <div className="calendar__dayList" key={index}>
                        <div
                            className={`calendar__day ${
                                this.state.selectedIndex == index
                                    ? 'active'
                                    : ''
                            } ${
                                !day.timeSlot.length ? 'disabled' : ''
                            }                            
                            ${
                                day.idl === 'plus'
                                    ? 'calendar__day--idl--plus'
                                    : ''
                            }
                        ${
                            day.idl === 'minus'
                                ? 'calendar__day--idl--minus'
                                : ''
                        }`}
                            ref={(day) => (this[`day${index}`] = day)}
                            key={index}
                            onClick={(e) => {
                                // if (day.inRange) {
                                this.handleClick(day, index);
                                // }
                            }}
                        >
                            <div className="calendar__dayWrapper">
                                <div className="calendar__monthLabel">
                                    {moment(day.date).format('ddd')}
                                </div>

                                <div className="calendar__dayLabel">
                                    {day.formatedDay}
                                </div>
                            </div>
                        </div>
                    </div>
                    {this.calendarDayDetails(day)}
                </div>
            );
        });

        return (
            <Slider ref={(c) => (this.slider = c)} {...this.settings}>
                {daysNav}
            </Slider>
        );
    };

    render() {
        return this.renderDateSelector();
    }
}

export default diningDateRange;
