import React from 'react';
import { mount } from 'enzyme';
import SliderViewed from '../index';
import data from '../data/po';

describe('<SliderViewed />', () => {
    let wrapper;
    const customData = data.attributes;

    beforeEach(() => {
        wrapper = mount(<SliderViewed {...customData} />);
        wrapper.setState({
            render: true
        });
    });

    test('Component should render', () => {
        expect(wrapper.length).toEqual(1);
    });
});
