import React from 'react';
import { mount } from 'enzyme';

import data from '../data/po';
import LoyaltyTierSlot from '../index';

describe('<LoyaltyTierSlot />', () => {
    let wrapper;

    const customData = data.attributes;

    beforeEach(() => {
        wrapper = mount(<LoyaltyTierSlot {...customData} />);
    });

    test('Should mount without problems', () => {
        expect(wrapper.length).toEqual(1);
    });
});
