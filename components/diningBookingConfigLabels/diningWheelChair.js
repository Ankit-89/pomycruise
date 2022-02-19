'use strict';

import React from 'react';
import Link from '../commons/CUK/link';

class diningWheelChair extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            paxChecked: false,
            hover: false
        };
    }

    componentDidMount() {}

    componentWillMount() {}

    handleClick = (index) => {
        const { selectWheelchairHandler } = this.props;
        let value = 0;
        if (index === 'Yes') {
            value = 1;
        }
        selectWheelchairHandler && selectWheelchairHandler(value, index);
    };

    render() {
        const { labels, noButton, yesButton } = this.props;

        return (
            <div className="spa-duration-container">
                <h3>{labels.wheelchairSeatsLabel}</h3>
                <ul>
                    <Link
                        ariaLabel={labels.backLabel}
                        title={labels.backLabel}
                        //dataLinktext={seeDetailsLabel}
                        linkClassName={`${
                            !yesButton
                                ? 'cta-button-yes'
                                : 'cta-button-yes-active'
                        }`}
                        onClick={() => this.handleClick('Yes')}
                    >
                        <h6>{`Yes`}</h6>
                    </Link>
                    <Link
                        ariaLabel={labels.backLabel}
                        title={labels.backLabel}
                        //dataLinktext={seeDetailsLabel}
                        linkClassName={`${
                            !noButton ? 'cta-button-no' : 'cta-button-no-active'
                        }`}
                        onClick={() => this.handleClick('No')}
                    >
                        <h6>{`No`}</h6>
                    </Link>
                </ul>
            </div>
        );
    }
}

export default diningWheelChair;
