import React from 'react';
import { mount } from 'enzyme';
import { assert } from 'chai';

import FullWidthImage from '../index';
import data from '../data/po';

describe('<FullWidthImage />', () => {
    let wrapper;
    const customData = data.attributes;

    beforeEach(() => {
        wrapper = mount(<FullWidthImage {...customData} />);
    });

    test('Full width image has one <img> element', () => {
        expect(wrapper.find(`.full-width-image`).length).toEqual(1);
    });
});
