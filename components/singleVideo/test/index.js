import React from 'react';
import { mount } from 'enzyme';
import data from '../data/po';

import SingleVideo from '../index';

describe('<SingleVideo />', () => {
    let wrapper;

    const customData = data.attributes;

    beforeEach(() => {
        wrapper = mount(<SingleVideo {...customData} />);
    });

    test('SingleVideo should mount without problems', () => {
        expect(wrapper.length).toEqual(1);
    });
});
