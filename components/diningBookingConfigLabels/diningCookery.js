'use strict';

import React from 'react';
import SelectField from '../commons/CUK/selectField';

class diningCookery extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            paxChecked: false,
            hover: false
        };
    }

    componentDidMount() {}

    componentWillMount() {}

    handleEventSelect = (name, value, title, event, index) => {
        const { selectCookeryVenue } = this.props;
        selectCookeryVenue && selectCookeryVenue(value);
    };

    render() {
        const { labels, limelightEvents, selectedCookeryVenue } = this.props;

        return (
            <div className="spa-duration-container">
                <h3>{labels.selectCookeryDiningLabel}</h3>
                <div className="events_select">
                    <SelectField
                        selectClassName="select-passenger"
                        name="diningEvent"
                        ariaRequired={false}
                        showLabel={false}
                        label={'Select Class'}
                        disableValidation={true}
                        value={selectedCookeryVenue.value}
                        title={selectedCookeryVenue.title}
                        options={limelightEvents}
                        //changeCallback={this.handleEventSelect}
                        changeCallback={(name, value, title, event, index) =>
                            this.handleEventSelect(
                                name,
                                value,
                                title,
                                event,
                                index
                            )
                        }
                    />
                </div>
            </div>
        );
    }
}

export default diningCookery;
