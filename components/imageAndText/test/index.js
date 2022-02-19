import React from 'react';
import { mount } from 'enzyme';
import ImageAndText from '../index';
import data from '../data/po';

describe('<ImageAndText />', () => {
    let wrapper;
    const customData = data.attributes;

    beforeEach(() => {
        wrapper = mount(<ImageAndText {...customData} />);
    });

    test('ImageAndText has one image', () => {
        expect(wrapper.find('.tile-image').length).toEqual(1);
    });

    test('ImageAndText has one title', () => {
        expect(wrapper.find('.tile-title').length).toEqual(1);
    });

    test('ImageAndText has one description', () => {
        expect(wrapper.find('.tile-description').length).toEqual(1);
    });

    test('ImageAndText has one link', () => {
        expect(wrapper.find('.tile-link').length).toEqual(1);
    });
});
