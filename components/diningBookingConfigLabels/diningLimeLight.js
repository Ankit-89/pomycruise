'use strict';

import React from 'react';
import SelectField from '../commons/CUK/selectField';

class diningLimeLight extends React.Component {
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
        const { selectLimelightEvent } = this.props;
        selectLimelightEvent && selectLimelightEvent(value);
    };

    render() {
        const { labels, limelightEvents, selectedLimelightEvent } = this.props;

        return (
            <div className="spa-duration-container">
                <h3>{labels.selectEntertainerDiningLabel}</h3>
                <div className="events_select">
                    <SelectField
                        selectClassName="select-passenger"
                        name="diningEvent"
                        ariaRequired={false}
                        disableValidation={true}
                        label={'Select Event'}
                        showLabel={false}
                        value={selectedLimelightEvent.value}
                        title={selectedLimelightEvent.title}
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

export default diningLimeLight;
