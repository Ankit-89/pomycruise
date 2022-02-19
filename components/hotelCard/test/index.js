import React from 'react';
import { mount } from 'enzyme';

import HotelCard from '../index';
import data from '../data/po';

describe('<HotelCard />', () => {
    let wrapper;
    const customData = data.attributes;
    const services = data.services;

    beforeEach(() => {
        wrapper = mount(<HotelCard {...customData} services={services} />);
    });

    test('Hotel card contains one <h3> element', () => {
        expect(wrapper.find('h3').length).toEqual(1);
    });

    test('Hotel card contains one <picture> element', () => {
        expect(wrapper.find('picture').length).toEqual(1);
    });

    test('Hotel card has a description element', () => {
        expect(wrapper.find('.description-container').length).toEqual(1);
    });

    test('Hotel card has a CTA Link <a> element', () => {
        expect(wrapper.find('.secondary-cta').length).toEqual(1);
    });

    test(`Hotel card has a CTA Link label  "${
        customData.primaryCta.label
    }"`, () => {
        const expected = `${customData.primaryCta.label}`;

        wrapper = mount(<HotelCard {...customData} services={services} />);
        expect(wrapper.find('.secondary-cta').text()).toEqual(expected);
    });
});
