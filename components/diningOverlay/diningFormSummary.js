import React from 'react';

const diningFormSummary = ({
    selectedInstance,
    pricePerPersonLabel,
    totalLabel,
    selectedGuests,
    currency
}) => (
    <div className="formSummary">
        <div className="pricePerPerson">
            <h5 className="left priceLabel">{pricePerPersonLabel}</h5>
            <h5 className="right priceAmount">
                {currency} {selectedInstance ? selectedInstance.price.value : 0}
            </h5>
        </div>
        <div className="total">
            <h6 className="left priceLabel">{totalLabel}</h6>
            <h1 className="right priceAmount">
                {currency}{' '}
                {selectedInstance
                    ? selectedGuests.value * selectedInstance.price.value
                    : 0}
            </h1>
        </div>
    </div>
);

export default diningFormSummary;
