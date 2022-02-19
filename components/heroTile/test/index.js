import React from 'react';
import { mount } from 'enzyme';

import HeroTile from '../index';
import data from '../data/po';

describe('<HeroTile />', () => {
    let wrapper;

    const customData = data.attributes;

    beforeEach(() => {
        wrapper = mount(<HeroTile {...customData} />);
    });

    test('HeroTile contains <p> desc tag', () => {
        expect(wrapper.find('.desc').length).toEqual(1);
    });
});
