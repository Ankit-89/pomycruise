import React from 'react';
import { mount } from 'enzyme';

import data from '../data/po';
import ShorexCard from '../index';

describe('<ShorexCard />', () => {
    let wrapper;

    const customData = data.attributes;

    beforeEach(() => {
        wrapper = mount(<ShorexCard {...customData} />);
    });

    test('Should mount without problems', () => {
        expect(wrapper.length).toEqual(1);
    });
});
