import React from 'react';
import { mount } from 'enzyme';

import GlobalHeaderLogin from '../index';
import data from '../data/po';

describe('<GlobalHeaderLogin />', () => {
    let wrapper;
    const customData = data.attributes;

    beforeEach(() => {
        wrapper = mount(<GlobalHeaderLogin {...customData} />);
    });

    test('Global header login has at least one logo', () => {
        expect(wrapper.find('.nav-brand-logo').length).toBeGreaterThan(0);
    });
});
