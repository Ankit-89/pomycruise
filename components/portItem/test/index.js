import React from 'react';
import { mount } from 'enzyme';

import data from '../data/po';
import PortItem from '../index';

describe('<PortItem />', () => {
    let wrapper;

    const customData = data.attributes;

    beforeEach(() => {
        wrapper = mount(<PortItem {...customData} />);
    });

    test('Should mount without problems', () => {
        expect(wrapper.length).toEqual(1);
    });
});
