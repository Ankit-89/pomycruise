import React from 'react';
import { mount } from 'enzyme';
import CategorySlider from '../index';
import data from '../data/po';

describe('<CategorySlider/>', () => {
    let wrapper;
    const customData = data.attributes;
    const services = data.services;

    beforeEach(() => {
        sessionStorage.setItem(
            'portCalls',
            `{"portCalls": [{"typeCode": {"$": "PKG"},"statusCode": {"$": "A"},"seqNum": "001","typeDesc": "Package","statusText": "Active","eventCode": {"$": "NOXFR"},"eventNameText": "NO TRANSFER","packageText": "TN","supressFlagText": " ","paxNumberInt": "1234","port": {"startCityCode": {"$": "FR"},"portCall": {"endDate": "2019-01-18","startDate": "2019-01-18","startDayText": "FRI","endDayText": "FRI","durationTypeCode": {"$": "0000"},"portSchedule": {"descText": " NO TRANSFERS ARE PROVIDED"}}},"tickets": {"ticketPrintAirInd": {"$": ""}, "ticketPrintVoucherInd": {"$": " "}, "itineraryPrintInd": {"$": " "}},"vendor": {"Name": "", "Address": "", "City": "", "State": "", "stateName": "", "Country": "", "CountryName": "", "Zip": "", "Fax": "", "Contact": "", "Phone": ""}}`
        );
        wrapper = mount(<CategorySlider {...customData} services={services} />);
    });
    test('Should mount without problems ', () => {
        expect(wrapper.length).toEqual(1);
    });
});
