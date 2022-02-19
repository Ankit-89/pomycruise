import React from 'react';
import { mount } from 'enzyme';

import AccordionMycruise from '../index';
import po from '../data/po';

describe('<AccordionMycruise />', () => {
    let wrapper;
    const customData = po.attributes;

    beforeEach(() => {
        wrapper = mount(<AccordionMycruise {...customData} />);
    });

    test('On tab change rerenders content', () => {
        wrapper
            .find('.qa__item .qa__open')
            .first()
            .simulate('click');

        expect(wrapper.find('.qa__item.visible').length).toEqual(1);
    });
});
