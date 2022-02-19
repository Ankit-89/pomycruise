import React from 'react';
import { mount } from 'enzyme';

import data from '../data/po';
import ShoreXkeyInfoMycruise from '../index';

describe('<ShoreXkeyInfoMycruise />', () => {
    let wrapper;

    const customData = data.attributes;
    const services = data.services;

    beforeEach(() => {
        wrapper = mount(<ShoreXkeyInfoMycruise {...customData} services={services} />);
    });

    test('Should mount without problems', () => {
        expect(wrapper.length).toEqual(1);
    });
});
