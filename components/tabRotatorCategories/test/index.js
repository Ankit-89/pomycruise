import React from 'react';
import { mount } from 'enzyme';

import data from '../data/po';
import TabRotatorCategories from '../index';

describe('<TabRotatorCategories />', () => {
    let wrapper;

    const customData = data.attributes;
    const services = data.services;

    beforeEach(() => {
        wrapper = mount(
            <TabRotatorCategories {...customData} services={services} />
        );
    });

    test('Should mount without problems', () => {
        expect(wrapper.length).toEqual(1);
    });
});
