import React from 'react';
import moment from 'moment';

import SpaPassengersList from './spaPassengersList';
import SpaTreatmentDuration from './spaTreatmentDuration';
import SpaDateRange from './spaDateRange';
import SpaTimeRange from './spaTimeRange';
import Link from '../commons/CUK/link';

class spaForm extends React.Component {
    constructor(props) {
        super(props);

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

    handleDateChange = (day, index, value) => {
        const { dateChangeHnadler } = this.props;
        dateChangeHnadler && dateChangeHnadler(day, index, value);
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
            isMonthTabClicked
        } = this.props;
        return Object.keys(calenderDateRange).length ? (
            <div className="spa-date-container">
                <h3>{labels.selectDateLabel}</h3>
                <p>{labels.selectDateDescriptionLabel}</p>
                <div className="tabs">
                    <ul className="tabs-labels">
                        {monthTabs.map(this.renderMonthTab)}
                    </ul>
                </div>
                <SpaDateRange
                    labels={labels}
                    calenderDateRange={calenderDateRange}
                    dateChangeHnadler={this.handleDateChange}
                    sliderChangeHandler={this.handleSliderChange}
                    tabIndex={tabIndex}
                    isSlickToGoCall={isMonthTabClicked}
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
                selectedMonthTab.month_date === value.month_date
                    ? 'active'
                    : '';
        } else {
            linkClassName = Object.keys(selectedDay).length
                ? moment(selectedDay.date).format('MMM YY') === value.month_date
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
            <SpaDateRange
                labels={labels}
                calenderDateRange={calenderDateRange[keys]}
                dateChangeHnadler={this.handleDateChange}
                sliderChangeHandler={this.handleSliderChange}
                title={keys}
                tabIndex={tabIndex}
            />
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
            bestPriceImageUrl
        } = this.props;
        return (
            <div>
                <SpaPassengersList
                    labels={labels}
                    selectedPassenger={selectedPassenger}
                    selectPassengerHandler={this.handlePassengerSelect}
                    maxSelectable={maxSelectable}
                    maxSelected={maxSelected}
                    passengers={passengers}
                    selectedDay={selectedDay}
                    disembarkDate={disembarkDate}
                    embarkDate={embarkDate}
                />
                {proceedForDurationSection && (
                    <SpaTreatmentDuration
                        labels={labels}
                        selectedDuration={selectedDuration}
                        selectDurationHandler={this.handleDurationSelect}
                    />
                )}
                {proceedForDateSection &&
                    durationType !== 'MULTI_DAY_PASS' &&
                    this.renderDateSection()}
                {proceedForTimeSection &&
                    durationType == 'SINGLE_SLOT' && (
                        <SpaTimeRange
                            labels={labels}
                            selectedDay={selectedDay}
                            seletedTimeSlot={seletedTimeSlot}
                            selectedDayTreatmentList={selectedDayTreatmentList}
                            timeSlotChangeHnadler={
                                this.handleTimeSlotChangeHandler
                            }
                            modified={modified}
                            bestPriceImageUrl={bestPriceImageUrl}
                        />
                    )}
            </div>
        );
    }
}

export default spaForm;
