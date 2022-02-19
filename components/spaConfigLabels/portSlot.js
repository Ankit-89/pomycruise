import React, { Component } from 'react';
import SessionStorage from '../commons/CUK/session-storage';

class portSlot extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        this.getPortData();
    }

    componentDidUpdate(prevProps) {
        prevProps.day !== this.props.day && this.getPortData();
    }

    getPortData() {
        const { day } = this.props;
        const portCalls = SessionStorage.getItem('portCalls');
        const matchingDay = portCalls.portCalls
            .filter(({ typeCode }) => typeCode.$ !== 'PKG')
            .find(({ port: { portCall } }) => portCall.startDate === day);

        if (matchingDay) {
            const isSeaDay = matchingDay.typeCode.$ === 'SEA';
            const dayType = `${isSeaDay ? 'sea' : 'port'}-day`;
            const dayName = isSeaDay
                ? matchingDay.typeDesc
                : matchingDay.port.portCall.portFromCode.$;
            this.setState(() => ({
                dayType,
                dayName
            }));
        }
    }

    render() {
        const { dayType, dayName } = this.state;
        return (
            <div>
                <span className={`port-slot ${dayType}`}>{dayName}</span>
            </div>
        );
    }
}

export default portSlot;
