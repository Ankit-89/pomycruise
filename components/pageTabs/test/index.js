import React from 'react';
import { mount } from 'enzyme';

import data from '../data/po';
import PageTabs from '../index';

describe('<PageTabs />', () => {
    let wrapper;

    const customData = data.attributes;
    const services = data.services;

    beforeEach(() => {
        sessionStorage.setItem(
            'header',
            `{"bookingRef":"WM2G8R","brandCode":"PO","cruiseCode":"B902","embarkationDate":"2019-01-18","disembarkationDate":"2019-02-01","shipCode":"BR","market":"UK","language":"en_GB","physicalCruiseDate":"2019-01-18","embarkationPort":"BGI","customer":{"PaxNumber":"1","title":"MR","firstName":"SITFA","lastName":"MYCRUZFAM","email":"","customerType":"Passenger"},"passengers":[{"paxNumber":"1","title":"MR","firstName":"SITFA","lastName":"MYCRUZFAM","birthDate":"1980-12-12","status":"active"},{"paxNumber":"2","title":"MRS","firstName":"SITFB","lastName":"MYCRUZFAM","birthDate":"1985-12-12","status":"active"},{"paxNumber":"3","title":"MR","firstName":"SITFC","lastName":"MYCRUZFAM","birthDate":"2006-12-12","status":"active"},{"paxNumber":"4","title":"MISS","firstName":"SITFD","lastName":"MYCRUZFAM","birthDate":"2017-01-12","status":"active"}]}`
        );
        wrapper = mount(<PageTabs {...customData} services={services} />);
    });

    test('Should mount without problems', () => {
        expect(wrapper.length).toEqual(1);
    });

});
