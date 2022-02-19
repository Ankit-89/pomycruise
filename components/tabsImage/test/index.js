import React from 'react';
import { mount } from 'enzyme';

import TabsImge from '../index';
import data from '../data/po';

describe('<TabsImge />', () => {
    let wrapper;
    const customData = data.attributes;

    beforeEach(() => {
        wrapper = mount(<TabsImge {...customData} />);
    });
    test('Should mount without problems', () => {
        expect(wrapper.length).toEqual(1);
    });
});
