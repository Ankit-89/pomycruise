import React from 'react';
import moment from 'moment';

class spaFormSummary extends React.Component {
    constructor(props) {
        super(props);
    }

    renderDetails = () => {
        const { seletedTimeSlot, selectedDay, durationType } = this.props;

        const dateLabel = `${moment(selectedDay.date).format('DD MMMM YY')}`;
        const timeLabel = `${moment(seletedTimeSlot.startDatetime).format(
            'h:mm A'
        )}`;

        return (
            <span className="left priceLabel">
                {durationType !== 'MULTI_DAY_PASS' ? dateLabel : ''}
                {durationType == 'SINGLE_SLOT' ? ` | ${timeLabel}` : ''}
            </span>
        );
    };

    renderPrice = () => {
        const {
            labels,
            seletedTimeSlot,
            currency,
            selectedSlotForMultiDayPass,
            selectedSlotForOneDayPass,
            durationType
        } = this.props;

        if (durationType == 'ONE_DAY_PASS') {
            return (
                <div className="right priceAmount">
                    {`${labels.amountLabel}: `}
                    {currency}
                    {selectedSlotForOneDayPass
                        ? selectedSlotForOneDayPass.promotionalPrice <
                          selectedSlotForOneDayPass.standardPrice
                            ? selectedSlotForOneDayPass.promotionalPrice
                            : selectedSlotForOneDayPass.standardPrice
                        : ''}
                </div>
            );
        }

        return durationType == 'MULTI_DAY_PASS' ? (
            <div className="right priceAmount">
                {`${labels.amountLabel}: `}
                {currency}
                {selectedSlotForMultiDayPass
                    ? selectedSlotForMultiDayPass.promotionalPrice <
                      selectedSlotForMultiDayPass.standardPrice
                        ? selectedSlotForMultiDayPass.promotionalPrice
                        : selectedSlotForMultiDayPass.standardPrice
                    : ''}
            </div>
        ) : (
            <div className="right priceAmount">
                {`${labels.amountLabel}: `}
                {currency}
                {seletedTimeSlot
                    ? seletedTimeSlot.promotionalPrice <
                      seletedTimeSlot.standardPrice
                        ? seletedTimeSlot.promotionalPrice
                        : seletedTimeSlot.standardPrice
                    : ''}
            </div>
        );
    };
    render() {
        const { durationType } = this.props;
        return (
            <div className="formSummary">
                <div className="total">
                    {durationType !== 'MULTI_DAY_PASS' && this.renderDetails()}
                    {this.renderPrice()}
                </div>
            </div>
        );
    }
}

export default spaFormSummary;
