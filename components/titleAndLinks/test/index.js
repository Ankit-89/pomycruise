import React from 'react';
import { mount } from 'enzyme';

import TitleAndLinks from '../index';
import data from '../data/po';

describe('<TitleAndLinks />', () => {
    let wrapper;
    const customData = data.attributes;

    beforeEach(() => {
        wrapper = mount(<TitleAndLinks {...customData} />);
    });
    test('Should mount without problems', () => {
        expect(wrapper.length).toEqual(1);
    });
});
