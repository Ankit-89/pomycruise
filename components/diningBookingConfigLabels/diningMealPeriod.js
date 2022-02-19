import React from 'react';
import Link from '../commons/CUK/link';
import moment from 'moment';

class diningMealPeriod extends React.Component {
    constructor(props) {
        super(props);
    }

    handleClick = (e) => {
        const { mealPeriodChangeHnadler } = this.props;
        mealPeriodChangeHnadler && mealPeriodChangeHnadler(e);
    };

    renderTimeSlots(d, i) {
        const { labels, selectedDay, selectedMealPeriod } = this.props;

        const activeClassName = selectedMealPeriod == d ? 'active' : '';
        return (
            <Link
                key={'timeslot-' + i}
                linkClassName={`single_time_slot ${activeClassName}`}
                onClick={() => this.handleClick(d)}
            >
                <span className={`time_container`}>{d}</span>
            </Link>
        );
    }

    render() {
        const { labels, selectedDay, selectedDayTreatmentList } = this.props;
        const selectedDate = moment(selectedDay.date).format('DD MMMM YYYY');
        let categoriesList = [];
        let existValue = false;
        selectedDayTreatmentList
            .filter((items) => items.categories != '')
            .map((items) => {
                existValue = categoriesList.find((e) => e == items.categories)
                    ? true
                    : false;
                if (!existValue) {
                    categoriesList.push(items.categories);
                }
            });

        return (
            categoriesList.length > 1 && (
                <div className="continer">
                    <div className="selectTime-wrapper">
                        <div>
                            <div className="heading">
                                <div className="dateSection">
                                    <span className="select_time_label">
                                        {labels.selectMealPeriodLabel}
                                    </span>
                                    <span className="">{selectedDate}</span>
                                </div>
                            </div>
                            <div className="details">
                                <div className="right-section">
                                    {categoriesList.map((d, i) =>
                                        this.renderTimeSlots(d, i)
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        );
    }
}

export default diningMealPeriod;
