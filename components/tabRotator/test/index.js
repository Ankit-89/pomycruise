import React from 'react';
import { mount } from 'enzyme';

import data from '../data/po';
import TabRotator from '../index';

describe('<TabRotator />', () => {
    let wrapper;

    const customData = data.attributes;

    beforeEach(() => {
        wrapper = mount(<TabRotator {...customData} />);
    });

    test('Should mount without problems', () => {
        expect(wrapper.length).toEqual(1);
    });
});
