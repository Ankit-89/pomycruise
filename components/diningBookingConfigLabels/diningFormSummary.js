import React from 'react';
import moment from 'moment';

class diningFormSummary extends React.Component {
    constructor(props) {
        super(props);
    }

    renderDetails = () => {
        const {
            seletedTimeSlot,
            selectedDay,
            selectedGuest,
            labels
        } = this.props;
        const dateLabel = `${moment(
            seletedTimeSlot.availability,
            'YYYYMMDDhhmmss'
        ).format('DD MMM YY')}`;
        const timeLabel = `${moment(
            seletedTimeSlot.availability,
            'YYYYMMDDhhmmss'
        ).format('h:mm A')}`;
        const guestLabel = `${labels.forLabel} ${selectedGuest[0]} ${
            labels.peopleLabel
        }`;
        return (
            <span className="left priceLabel">
                {`${dateLabel} ${'\u00a0\u00a0|\u00a0\u00a0'} ${timeLabel}  ${'\u00a0\u00a0|\u00a0\u00a0'} ${guestLabel}`}
            </span>
        );
    };

    renderPrice = () => {
        const {
            labels,
            seletedTimeSlot,
            currency,
            selectedGuest,
            checkIncluded
        } = this.props;
        const totalAmount = (
            Number(seletedTimeSlot.price) * selectedGuest[0]
        ).toFixed(2);

        return checkIncluded ? (
            <div className="type additional">
                <span>{labels.inculdedHolidayLabel}</span>
            </div>
        ) : (
            <div className="right priceAmount">
                {`${labels.amountLabel}: `}
                {currency}
                {totalAmount}
            </div>
        );
    };
    render() {
        const { checkIncluded } = this.props;
        return (
            <div className="formSummary">
                <div className="total">
                    {checkIncluded ? '' : this.renderDetails()}
                    {this.renderPrice()}
                </div>
            </div>
        );
    }
}

export default diningFormSummary;
