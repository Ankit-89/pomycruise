import React from 'react';
import moment from 'moment';

import EntertainmentPassengersList from './entertainmentPassengersList';
import SpaTreatmentDuration from './spaTreatmentDuration';
import EntertainmentWheelChair from './entertainmentWheelChair';
import EntertainmentDateRange from './entertainmentDateRange';
import EntertainmentTimeRange from './entertainmentTimeRange';
import EntertainmentAddToCart from './entertainmentAddToCart';
import Link from '../commons/CUK/link';

class entertainmentForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hover: false
        };
        this.handlePassengerSelect = this.handlePassengerSelect.bind(this);
    }

    handlePassengerSelect(value, checked) {
        const { selectPassengerHandler } = this.props;
        selectPassengerHandler && selectPassengerHandler(value, checked);
    }

    handleDurationSelect = (value, type) => {
        const { selectDurationHandler } = this.props;
        selectDurationHandler && selectDurationHandler(value, type);
    };

    handleWheelchairSelect = (value, checked) => {
        const { selectWheelchairHandler } = this.props;
        selectWheelchairHandler && selectWheelchairHandler(value, checked);
    };

    handleDateChange = (day, index, value) => {
        const { dateChangeHnadler } = this.props;
        dateChangeHnadler && dateChangeHnadler(day, index, value);
    };

    handleDateChangeWhenNotInRange = () => {
        const { dateChangeHandlerWhenNotInRange } = this.props;
        dateChangeHandlerWhenNotInRange && dateChangeHandlerWhenNotInRange();
    };

    handleTimeSlotChangeHandler = (selectedTimeSlot) => {
        const { selectTimeslotHandler } = this.props;
        selectTimeslotHandler && selectTimeslotHandler(selectedTimeSlot);
    };

    handleMonthTabClick = (monthTab) => {
        const { monthTabClickHandler } = this.props;
        monthTabClickHandler && monthTabClickHandler(monthTab);
    };

    handleSliderChange = (
        date,
        nextBtnClick,
        prevBtnClick,
        sliderToScrollDays,
        value
    ) => {
        const { sliderChangeHandler } = this.props;
        sliderChangeHandler &&
            sliderChangeHandler(
                date,
                nextBtnClick,
                prevBtnClick,
                sliderToScrollDays,
                value
            );
    };

    handleTabClick = (index) => {
        const { tabClickHandler } = this.props;
        tabClickHandler && tabClickHandler(index);
    };

    renderDateSection() {
        const {
            labels,
            calenderDateRange,
            tabIndex,
            monthTabs,
            isMonthTabClicked,
            selectedPassenger,
            eventCatoryies,
            bookedEventData
        } = this.props;
        return Object.keys(calenderDateRange).length ? (
            <div className="spa-date-container">
                <h3>{labels.selectDateLabel}</h3>
                {/* <p>{labels.selectDateDescriptionLabel}</p> */}
                <div className="tabs">
                    <ul className="tabs-labels">
                        {monthTabs.map(this.renderMonthTab)}
                    </ul>
                </div>
                <EntertainmentDateRange
                    labels={labels}
                    calenderDateRange={calenderDateRange}
                    dateChangeHnadler={this.handleDateChange}
                    sliderChangeHandler={this.handleSliderChange}
                    dateChangeHandlerWhenNotInRange={
                        this.handleDateChangeWhenNotInRange
                    }
                    timeSlotChangeHnadler={this.handleTimeSlotChangeHandler}
                    selectedPassenger={selectedPassenger}
                    tabIndex={tabIndex}
                    isSlickToGoCall={isMonthTabClicked}
                    eventCatoryies={eventCatoryies}
                    bookedEventData={bookedEventData}
                />
            </div>
        ) : null;
    }

    renderMonthTab = (value, key) => {
        const { selectedDay, selectedMonthTab } = this.props;
        let linkClassName = '';
        if (
            selectedMonthTab !== void 0 &&
            Object.keys(selectedMonthTab).length
        ) {
            linkClassName =
                selectedMonthTab.month_date == value.month_date ? 'active' : '';
        } else {
            linkClassName = Object.keys(selectedDay).length
                ? moment(selectedDay.date).format('MMM YY') == value.month_date
                    ? 'active'
                    : ''
                : key == 0
                    ? 'active'
                    : '';
        }

        return (
            <li key={key} className={`first-element`}>
                <Link
                    url="JavaScript:void(0)"
                    linkClassName={linkClassName}
                    onClick={() => this.handleMonthTabClick(value)}
                >
                    <span>{value.month_date}</span>
                </Link>
            </li>
        );
    };

    renderCalendar = (keys, index) => {
        const { labels, calenderDateRange, tabIndex } = this.props;
        return (
            <EntertainmentDateRange
                labels={labels}
                calenderDateRange={calenderDateRange[keys]}
                dateChangeHnadler={this.handleDateChange}
                sliderChangeHandler={this.handleSliderChange}
                title={keys}
                tabIndex={tabIndex}
            />
        );
    };

    handleCheckWheelChair = (e) => {
        const { checkWheelChair, handleWheelChair } = this.props;
        const { checked, value } = e.target;

        handleWheelChair && handleWheelChair(value);
    };
    closeTooltip = (e) => {
        e.preventDefault();
        this.setState({ hover: false });
    };
    handleMouseIn = () => {
        this.setState({ hover: true });
    };

    handleMouseOut = () => {
        this.setState({ hover: false });
    };

    renderWheelChair = () => {
        const {
            checkWheelChairNo,
            checkWheelChair,
            labels,
            checkSoldOutInventories
        } = this.props;
        const { hover } = this.state;
        const display = hover ? 'block' : 'none';
        const tooltipStyle = { display };

        return (
            <div className="wheelChair-container">
                <h3>
                    {'Wheelchair Spaces required?'}

                    <span
                        className="tooltip__icon"
                        onMouseOver={this.handleMouseIn}
                        onMouseOut={this.handleMouseOut}
                    >
                        <div className="tooltip__dd" style={tooltipStyle}>
                            <a
                                className="tooltip__close"
                                onClick={this.closeTooltip}
                            />
                            <p>{labels.helpTextEntDetailLabel}</p>
                        </div>
                    </span>
                </h3>

                <ul>
                    <li key={1} className="radio-item">
                        <input
                            onChange={(e) => this.handleCheckWheelChair(e)}
                            value={'Yes'}
                            type="radio"
                            className="input-radio"
                            aria-labelledby="variation2-check"
                            name="wheelChairCheck"
                            id={1}
                            ref={(checkbox) => (this.checkbox = checkbox)}
                            checked={checkWheelChair}
                        />
                        <label htmlFor={1}>
                            <span className="passenger">{`Yes`}</span>
                        </label>
                        <span
                            className="error-label show-label"
                            ref="checkbox"
                        />
                    </li>
                    <li key={2} className="radio-item">
                        <input
                            onChange={(e) => this.handleCheckWheelChair(e)}
                            value={0}
                            type="radio"
                            className="input-radio"
                            aria-labelledby="variation2-check"
                            name="wheelChairCheck"
                            id={2}
                            ref={(checkbox) => (this.checkbox = checkbox)}
                            checked={checkWheelChairNo}
                        />
                        <label htmlFor={2}>
                            <span className="passenger">{`No`}</span>
                        </label>
                        <span
                            className="error-label show-label"
                            ref="checkbox"
                        />
                    </li>
                </ul>
                {checkWheelChairNo ||
                    (!checkWheelChair && (
                        <div className="hte-message">
                            <div className="hte_entertainment">
                                <div className="tooltip_icon_old" />
                                <span className="entertainmentDay">
                                    {labels.wheelChairMessageLabel}
                                </span>
                            </div>
                        </div>
                    ))}
                <div>
                    {checkSoldOutInventories && (
                        <div className="hte-message_sold_out">
                            <div className="hte_entertainment_sold_out">
                                <div className="tooltip_icon_sold_out" />
                                <span className="entertainmentDay_sold_out">
                                    {labels.noAvailabilityMessageLabel}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    render() {
        const {
            labels,
            selectedPassenger,
            maxSelectable,
            passengers,
            selectedDuration,
            embarkDate,
            disembarkDate,
            selectedDay,
            maxSelected,
            proceedForDurationSection,
            proceedForDateSection,
            proceedForTimeSection,
            selectedDayTreatmentList,
            modified,
            seletedTimeSlot,
            durationType,
            bestPriceImageUrl,
            checkWheelChair,
            checkWheelChairNo,
            selectedWheelchair,
            selectWheelchairHandler,
            proceedForAddtoCart,
            eventCatoryies,
            checkSoldOutInventories,
            bookedEventData
        } = this.props;
        const enableWheelChairSection = selectedPassenger.length > 0;
        return (
            <div>
                <EntertainmentPassengersList
                    labels={labels}
                    selectedPassenger={selectedPassenger}
                    selectPassengerHandler={this.handlePassengerSelect}
                    maxSelectable={0}
                    maxSelected={maxSelected}
                    passengers={passengers}
                    selectedDay={selectedDay}
                    disembarkDate={disembarkDate}
                    embarkDate={embarkDate}
                    eventCatoryies={eventCatoryies}
                    bookedEventData={bookedEventData}
                />
                {enableWheelChairSection &&
                    !checkWheelChair &&
                    this.renderWheelChair()}

                {enableWheelChairSection &&
                    checkWheelChair && (
                        <div>
                            {' '}
                            <EntertainmentWheelChair
                                labels={labels}
                                passengers={passengers}
                                selectedPassenger={selectedPassenger}
                                selectedWheelchair={selectedWheelchair}
                                selectWheelchairHandler={
                                    this.handleWheelchairSelect
                                }
                                eventCatoryies={eventCatoryies}
                            />
                            <div>
                                {checkSoldOutInventories && (
                                    <div className="wheelChair-container">
                                        <div className="hte-message_sold_out">
                                            <div className="hte_entertainment_sold_out">
                                                <div className="tooltip_icon_sold_out" />
                                                <span className="entertainmentDay_sold_out">
                                                    {
                                                        labels.noAvailabilityMessageLabel
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            {proceedForDateSection &&
                                selectedPassenger.length !== 0 &&
                                !checkSoldOutInventories &&
                                this.renderDateSection()}
                            {proceedForTimeSection &&
                                selectedPassenger.length !== 0 &&
                                !checkSoldOutInventories && (
                                    <EntertainmentTimeRange
                                        labels={labels}
                                        selectedDay={selectedDay}
                                        seletedTimeSlot={seletedTimeSlot}
                                        selectedDayTreatmentList={
                                            selectedDayTreatmentList
                                        }
                                        timeSlotChangeHnadler={
                                            this.handleTimeSlotChangeHandler
                                        }
                                        modified={modified}
                                        bestPriceImageUrl={bestPriceImageUrl}
                                        selectedPassenger={selectedPassenger}
                                    />
                                )}
                        </div>
                    )}
                {checkWheelChairNo &&
                    selectedPassenger.length !== 0 &&
                    !checkSoldOutInventories && (
                        <div>
                            {' '}
                            {proceedForDateSection && this.renderDateSection()}
                            {proceedForTimeSection && (
                                <EntertainmentTimeRange
                                    labels={labels}
                                    selectedDay={selectedDay}
                                    seletedTimeSlot={seletedTimeSlot}
                                    selectedDayTreatmentList={
                                        selectedDayTreatmentList
                                    }
                                    timeSlotChangeHnadler={
                                        this.handleTimeSlotChangeHandler
                                    }
                                    modified={modified}
                                    bestPriceImageUrl={bestPriceImageUrl}
                                    selectedPassenger={selectedPassenger}
                                />
                            )}
                        </div>
                    )}
            </div>
        );
    }
}

export default entertainmentForm;
