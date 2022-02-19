import React from 'react';
import { mount } from 'enzyme';
import { assert } from 'chai';

import CopyBlockMycruise from '../index';
import data from '../data/po';

describe('<CopyBlockMycruise />', () => {
    let wrapper;
    const customData = data.attributes;

    beforeEach(() => {
        wrapper = mount(<CopyBlockMycruise {...customData} />);
    });

    test('Copy block has one or more child element', () => {
        expect(wrapper.length).toBeGreaterThan(0);
    });
});
