import React from 'react';
import { mount } from 'enzyme';
import SliderPopularShorex from '../index';
import data from '../data/po';

describe('<SliderPopularShorex />', () => {
    let wrapper;
    const customData = data.attributes;
    const services = data.services;

    beforeEach(() => {
        wrapper = mount(
            <SliderPopularShorex {...customData} services={services} />
        );
    });

    test('Slider Popular should render', () => {
        expect(wrapper.length).toEqual(1);
    });
});
