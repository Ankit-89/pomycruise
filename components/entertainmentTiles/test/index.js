import React from 'react';
import { mount } from 'enzyme';

import data from '../data/po';
import SpaCard from '../index';

describe('<SpaCard />', () => {
    let wrapper;

    const customData = data.attributes;

    beforeEach(() => {
        wrapper = mount(<SpaCard {...customData} />);
    });

    test('Should mount without problems', () => {
        expect(wrapper.length).toEqual(1);
    });
});
