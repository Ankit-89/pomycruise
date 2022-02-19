import React from 'react';
import { mount } from 'enzyme';

import HeroTileSpa from '../index';
import data from '../data/po';

describe('<HeroTileSpa />', () => {
    let wrapper;

    const customData = data.attributes;
    const services = data.services;

    beforeEach(() => {
        sessionStorage.setItem(
            'header',
            `{"bookingRef":"WM2G8R","brandCode":"PO","cruiseCode":"B902","embarkationDate":"2019-01-18","disembarkationDate":"2019-02-01","shipCode":"BR","market":"UK","language":"en_GB","physicalCruiseDate":"2019-01-18","embarkationPort":"BGI","customer":{"PaxNumber":"1","title":"MR","firstName":"SITFA","lastName":"MYCRUZFAM","email":"","customerType":"Passenger"},"passengers":[{"paxNumber":"1","title":"MR","firstName":"SITFA","lastName":"MYCRUZFAM","birthDate":"1980-12-12","status":"active"},{"paxNumber":"2","title":"MRS","firstName":"SITFB","lastName":"MYCRUZFAM","birthDate":"1985-12-12","status":"active"},{"paxNumber":"3","title":"MR","firstName":"SITFC","lastName":"MYCRUZFAM","birthDate":"2006-12-12","status":"active"},{"paxNumber":"4","title":"MISS","firstName":"SITFD","lastName":"MYCRUZFAM","birthDate":"2017-01-12","status":"active"}]}`
        );
        wrapper = mount(<HeroTileSpa {...customData} services={services} />);
    });

    test('HeroTileSpa contains <h1> desc tag', () => {
        expect(wrapper.find('h1').length).toEqual(1);
    });

    test('HeroTileSpa contains <p> desc tag', () => {
        expect(wrapper.find('.desc').length).toEqual(1);
    });

    test('HeroTileSpa contains back button', () => {
        expect(wrapper.find('.infocard-back').length).toEqual(1);
    });
});
