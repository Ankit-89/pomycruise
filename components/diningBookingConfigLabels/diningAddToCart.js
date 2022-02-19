import React from 'react';
import Link from '../commons/CUK/link';

class diningAddToCart extends React.Component {
    constructor(props) {
        super(props);
    }
    handleSubmit = () => {
        const {
            submitButtonHandler,
            orderCanProceed,
            maxSelected
        } = this.props;
        submitButtonHandler &&
            orderCanProceed &&
            //maxSelected &&
            submitButtonHandler();
    };

    render() {
        const {
            labels = {},
            orderCanProceed,
            maxSelected,
            maxSelectable
        } = this.props;

        const cta_disabled =
            maxSelectable == 2 ? (maxSelected ? '' : 'cta-disabled') : '';

        return (
            <Link
                label={labels.addToCartLabel || 'Add To Basket'}
                url="#"
                onClick={this.handleSubmit}
                linkClassName={`${
                    orderCanProceed ? '' : 'cta-disabled'
                } cta-primary`}
                dataLinktext={labels.addToCartLabel}
            />
        );
    }
}

export default diningAddToCart;
