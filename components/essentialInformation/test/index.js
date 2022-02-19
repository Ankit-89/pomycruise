import React from 'react';
import { mount } from 'enzyme';

import EssentialInformation from '../index';
import data from '../data/po';

describe('<EssentialInformation />', () => {
    let wrapper;
    const customData = data.attributes;

    beforeEach(() => {
        wrapper = mount(<EssentialInformation {...customData} />);
    });

    test('Should mount without problems', () => {
        expect(wrapper.length).toEqual(1);
    });
});
