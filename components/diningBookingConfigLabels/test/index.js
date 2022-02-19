import React from 'react';
import { mount } from 'enzyme';

import data from '../data/po';
import SpaOverlay from '../index';

describe('<SpaOverlay />', () => {
    let wrapper;

    const customData = data.attributes;

    beforeEach(() => {
        wrapper = mount(<SpaOverlay {...customData} />);
    });

    test('Should mount without problems', () => {
        expect(wrapper.length).toEqual(1);
    });
});
