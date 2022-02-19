import React from 'react';

const spaFormSummary = ({
    selectedInstance,
    totalLabel,
    selectedPassenger,
    currency
}) => (
        <div className="formSummary">
            <div className="total">
                <h6 className="left priceLabel">{totalLabel}</h6>
                <h1 className="right priceAmount">
                    {currency}
                    {selectedInstance ? selectedInstance.treatementPrice : 0}
                </h1>
            </div>
        </div>
    );

export default spaFormSummary;
