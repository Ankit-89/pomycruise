import React from 'react';
import { mount } from 'enzyme';

import data from '../data/po';
import ShipsGrid from '../index';

describe('<ShipsGrid />', () => {
    let wrapper;

    const customData = data.attributes;

    beforeEach(() => {
        sessionStorage.setItem(
            'header',
            `{"bookingRef":"WM2G8R","brandCode":"PO","cruiseCode":"B902","embarkationDate":"2019-01-18","disembarkationDate":"2019-02-01","shipCode":"BR","market":"UK","language":"en_GB","physicalCruiseDate":"2019-01-18","embarkationPort":"BGI","customer":{"paxNumber":"1","pastGuestNumber":"POFI62819X","title":"MR","firstName":"SITFA","lastName":"MYCRUZFAM","genderCode":"M","genderText":"","age":"38","email":"","customerType":"passenger","birthDate":"1980-12-12"},"passengers":[{"paxNumber":"1","pastGuestNumber":"POFI62819X","title":"MR","firstName":"SITFA","lastName":"MYCRUZFAM","birthDate":"1980-12-12","customerType":"passenger","genderCode":"M","genderText":"","age":"38"},{"paxNumber":"2","pastGuestNumber":"","title":"MRS","firstName":"SITFB","lastName":"MYCRUZFAM","birthDate":"1985-12-12","customerType":"passenger","genderCode":"F","genderText":"","age":"33"},{"paxNumber":"3","pastGuestNumber":"","title":"MR","firstName":"SITFC","lastName":"MYCRUZFAM","birthDate":"2006-12-12","customerType":"passenger","genderCode":"M","genderText":"","age":"12"},{"paxNumber":"4","pastGuestNumber":"","title":"MISS","firstName":"SITFD","lastName":"MYCRUZFAM","birthDate":"2017-01-12","customerType":"passenger","genderCode":"F","genderText":"","age":"2"}],"embarkationCode":"BGI","disembarkationCode":"CAE","cabinCode":"DB","cabinType":"B","cruiseName":"Cruise Name from servlet","fareCode":"SELECT"}`
        );
        wrapper = mount(<ShipsGrid {...customData} />);
    });

    test('Should mount without problems', () => {
        expect(wrapper.length).toEqual(1);
    });
});
