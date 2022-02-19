import React from 'react';
import { mount } from 'enzyme';
import ContinueShopping from '../index';
import data from '../data/po';

describe('<ContinueShopping />', () => {
    let wrapper;
    const customData = data.attributes;

    beforeEach(() => {
        wrapper = mount(<ContinueShopping {...customData} />);
    });

    test('ContinueShopping contains title', () => {
        expect(wrapper.find('.title').length).toEqual(1);
    });

    test('Number of icons', () => {
        let wrapperLength = wrapper.find('.icons-list-item').length;
        expect(customData.icons.length).toEqual(parseInt(wrapperLength));
    });

    // test('Icon is clicked', () => {
    //     wrapper.find('.icons-list-link').map((item, index) => {
    //         item.simulate('click');
    //     });
    // });
});
