import React from 'react';
import moment from 'moment';

import DiningGuestsList from './diningGuestsList';
import DiningWheelChair from './diningWheelChair';
import DiningDateRange from './diningDateRange';
import DiningTimeRange from './diningTimeRange';
import DiningMealPeriod from './diningMealPeriod';
import DiningLimeLight from './diningLimeLight';
import DiningCookery from './diningCookery';
import DiningAddToCart from './diningAddToCart';
import Link from '../commons/CUK/link';

class diningForm extends React.Component {
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

    handleGuestSelect = (value, checked) => {
        const { selectGuestHandler } = this.props;
        selectGuestHandler && selectGuestHandler(value, checked);
    };

    handleLimelightEvent = (value, checked) => {
        const { selectLimelightEvent } = this.props;
        selectLimelightEvent && selectLimelightEvent(value, checked);
    };
    handleCookeryVenue = (value, checked) => {
        const { selectCookeryVenue } = this.props;
        selectCookeryVenue && selectCookeryVenue(value, checked);
    };

    handleWheelchairSelect = (value, index) => {
        const { selectWheelchairHandler } = this.props;
        selectWheelchairHandler && selectWheelchairHandler(value, index);
    };

    handleDateChange = (day, index, value) => {
        const { dateChangeHnadler } = this.props;
        dateChangeHnadler && dateChangeHnadler(day, index, value);
    };

    handleDateChangeWhenNotInRange = () => {
        const { dateChangeHandlerWhenNotInRange } = this.props;
        dateChangeHandlerWhenNotInRange && dateChangeHandlerWhenNotInRange();
    };

    handleGetShipEventAPI = (e, i, d) => {
        const { getShipEventAPI } = this.props;
        getShipEventAPI && getShipEventAPI(e, i, d);
    };

    handleTimeSlotChangeHandler = (selectedTimeSlot) => {
        const { selectTimeslotHandler } = this.props;
        selectTimeslotHandler && selectTimeslotHandler(selectedTimeSlot);
    };

    handleMealPeriodChangeHandler = (e) => {
        const { selectMealPeriodHandler } = this.props;
        selectMealPeriodHandler && selectMealPeriodHandler(e);
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
            selectedGuest,
            eventCatoryies,
            bookedEventData,
            getShipEventAPI,
            selectedWheelchair
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
                <DiningDateRange
                    labels={labels}
                    calenderDateRange={calenderDateRange}
                    dateChangeHnadler={this.handleDateChange}
                    sliderChangeHandler={this.handleSliderChange}
                    dateChangeHandlerWhenNotInRange={
                        this.handleDateChangeWhenNotInRange
                    }
                    timeSlotChangeHnadler={this.handleTimeSlotChangeHandler}
                    selectedGuest={selectedGuest}
                    selectedWheelchair={selectedWheelchair}
                    tabIndex={tabIndex}
                    isSlickToGoCall={isMonthTabClicked}
                    eventCatoryies={eventCatoryies}
                    bookedEventData={bookedEventData}
                    getShipEventAPIValue={this.handleGetShipEventAPI}
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
            <DiningDateRange
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
            proceedForMealPeriod,
            selectedDayTreatmentList,
            modified,
            seletedTimeSlot,
            selectedMealPeriod,
            durationType,
            bestPriceImageUrl,
            checkWheelChair,
            checkWheelChairNo,
            selectedWheelchair,
            selectWheelchairHandler,
            proceedForAddtoCart,
            eventCatoryies,
            checkSoldOutInventories,
            bookedEventData,
            selectedGuest,
            yesButton,
            noButton,
            limelightEvents,
            selectedLimelightEvent,
            checkLimelightEvent,
            selectedCookeryVenue,
            checkCookeryVenue,
            calenderDateRange
        } = this.props;
        const enableWheelChairSection = selectedGuest.length > 0;

        return (
            <div>
                {checkLimelightEvent && (
                    <DiningLimeLight
                        labels={labels}
                        selectedGuest={selectedGuest}
                        selectGuestHandler={this.handleGuestSelect}
                        limelightEvents={limelightEvents}
                        selectLimelightEvent={this.handleLimelightEvent}
                        selectedLimelightEvent={selectedLimelightEvent}
                    />
                )}
                {checkCookeryVenue && (
                    <DiningCookery
                        labels={labels}
                        selectedGuest={selectedGuest}
                        selectGuestHandler={this.handleGuestSelect}
                        limelightEvents={limelightEvents}
                        selectCookeryVenue={this.handleCookeryVenue}
                        selectedCookeryVenue={selectedCookeryVenue}
                    />
                )}
                {(Object.keys(selectedLimelightEvent).length !== 0 ||
                    Object.keys(selectedCookeryVenue).length !== 0) && (
                    <DiningGuestsList
                        labels={labels}
                        selectedGuest={selectedGuest}
                        selectGuestHandler={this.handleGuestSelect}
                        eventCatoryies={eventCatoryies}
                    />
                )}
                {!checkCookeryVenue &&
                    !checkLimelightEvent && (
                        <DiningGuestsList
                            labels={labels}
                            selectedGuest={selectedGuest}
                            selectGuestHandler={this.handleGuestSelect}
                            eventCatoryies={eventCatoryies}
                        />
                    )}
                {enableWheelChairSection && (
                    <div>
                        {' '}
                        <DiningWheelChair
                            labels={labels}
                            selectedWheelchair={selectedWheelchair}
                            selectWheelchairHandler={
                                this.handleWheelchairSelect
                            }
                            yesButton={yesButton}
                            noButton={noButton}
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
                            selectedGuest.length !== 0 &&
                            !checkSoldOutInventories &&
                            !checkLimelightEvent &&
                            !checkCookeryVenue &&
                            this.renderDateSection()}
                        {proceedForMealPeriod &&
                            selectedGuest.length !== 0 &&
                            !checkSoldOutInventories &&
                            !checkLimelightEvent &&
                            !checkCookeryVenue && (
                                <DiningMealPeriod
                                    labels={labels}
                                    selectedDay={selectedDay}
                                    selectedMealPeriod={selectedMealPeriod}
                                    selectedDayTreatmentList={
                                        selectedDayTreatmentList
                                    }
                                    mealPeriodChangeHnadler={
                                        this.handleMealPeriodChangeHandler
                                    }
                                    modified={modified}
                                    bestPriceImageUrl={bestPriceImageUrl}
                                    selectedPassenger={selectedPassenger}
                                />
                            )}
                        {proceedForTimeSection &&
                            selectedGuest.length !== 0 &&
                            !checkSoldOutInventories && (
                                <DiningTimeRange
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
                                    selectedMealPeriod={selectedMealPeriod}
                                    checkLimelightEvent={checkLimelightEvent}
                                    checkCookeryVenue={checkCookeryVenue}
                                    calenderDateRange={calenderDateRange}
                                />
                            )}
                    </div>
                )}
            </div>
        );
    }
}

export default diningForm;
