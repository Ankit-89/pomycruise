import React from 'react';
import { mount } from 'enzyme';

import EditorialTile from '../index';
import data from '../data/po';

describe('<EditorialTile />', () => {
    let wrapper;
    const customData = data.attributes;

    beforeEach(() => {
        wrapper = mount(<EditorialTile {...customData} />);
    });

    test('Should mount without problems', () => {
        expect(wrapper.length).toEqual(1);
    });
});
