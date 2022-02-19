'use strict';

import React from 'react';
import Image from '../commons/CUK/image';
// import analytics from '../commons/CUK/analytics';
import moment from 'moment';

class portItem extends React.PureComponent {
    constructor(props) {
        super(props);
    }

    render() {
        const {
            port: { portCall },
            image
        } = this.props;
        const { portFromCode, startDate, endDate } = portCall;

        let date;
        if (startDate !== endDate && endDate) {
            let newStartDate = moment(startDate, 'YYYY-MM-DD').format('D MMM');
            let newEndDate = moment(endDate, 'YYYY-MM-DD').format('D MMM');
            date = `${newStartDate} - ${newEndDate}`;
        } else {
            date = moment(startDate, 'YYYY-MM-DD').format('D MMM');
        }

        return (
            <div className="port-item ">
                <Image className="port-item-img" {...image} />
                <h3 className="port-item-title">{portFromCode.$}</h3>
                <h4 className="port-item-date">
                    <span>{date}</span>
                </h4>
            </div>
        );
    }
}

export default portItem;
