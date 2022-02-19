import React from 'react';
import { mount } from 'enzyme';

import data from '../data/po';
import StoryRotatorMycruise from '../index';

describe('<StoryRotatorMycruise />', () => {
    let wrapper;

    const customData = data.attributes;

    beforeEach(() => {
        wrapper = mount(<StoryRotatorMycruise {...customData} />);
    });

    test('Should mount without problems', () => {
        expect(wrapper.length).toEqual(1);
    });
});
