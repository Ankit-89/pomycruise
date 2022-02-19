import React, { Component } from 'react';
import fetchData from '../commons/CUK/fetch-data';
import { generateUniqueCode } from '../commons/CUK/utilities';
import SessionStorage from '../commons/CUK/session-storage';

import moment from 'moment';

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
        const { mycruiseSummaryApiService } = this.props;
        const userData = SessionStorage.getItem('userData');

        const {
            customer: { firstName, lastName, birthDate },
            bookingRef,
            companyCode
        } = userData;
        const apikey =
            typeof window !== 'undefined' ? window.configs.apikeyMycruise : '';
        const uniqueCode = generateUniqueCode(bookingRef, firstName, birthDate);
        const url = `${mycruiseSummaryApiService}?bookingRef=${bookingRef}&firstName=${firstName}&lastName=${lastName}&shipCode=${companyCode}`;

        fetchData(url, {
            method: 'GET',
            headers: {
                'Accept-Encoding': 'gzip,deflate',
                'X-Source-Identity-Token-0': apikey,
                'X-MessageID': uniqueCode
            }
        }).then((response) => this.handleResponse(response), (errArray) => {});
    }

    handleResponse(response) {
        const { day } = this.props;
        const { ItineraryEvents } = response;

        const matchingDay = ItineraryEvents.find((ItineraryEvent, index) => {
            const {
                port: {
                    portCall: { startDate }
                }
            } = ItineraryEvent;
            return day === startDate;
        });

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
