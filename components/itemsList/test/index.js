import React from 'react';
import { mount } from 'enzyme';

import ItemsList from '../index';
import data from '../data/po';

describe('<ItemsList />', () => {
    let wrapper;
    const customData = data.attributes;

    beforeEach(() => {
        wrapper = mount(<ItemsList {...customData} />);
    });

    test('Items List contains title', () => {
        expect(wrapper.find('.title').length).toEqual(1);
    });
});
