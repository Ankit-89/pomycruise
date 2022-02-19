import React from 'react';
import { mount } from 'enzyme';

import EditorialInformation from '../index';
import data from '../data/po';

describe('<EditorialInformation />', () => {
    let wrapper;
    const customData = data.attributes;

    beforeEach(() => {
        wrapper = mount(<EditorialInformation {...customData} />);
    });

    test('Should mount without problems', () => {
        expect(wrapper.length).toEqual(1);
    });
});
