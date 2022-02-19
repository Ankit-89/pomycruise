import React from 'react';
import { mount } from 'enzyme';

import TitleAndParagraph from '../index';
import data from '../data/po';

describe('<TitleAndParagraph />', () => {
    let wrapper;
    const customData = data.attributes;

    beforeEach(() => {
        wrapper = mount(<TitleAndParagraph {...customData} />);
    });
    test('Should mount without problems', () => {
        expect(wrapper.length).toEqual(1);
    });
});
