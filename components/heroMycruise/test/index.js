import React from 'react';
import { mount } from 'enzyme';

import HeroMycruise from '../index';
import data from '../data/po';

describe('<HeroMycruise />', () => {
    let wrapper;
    const customData = data.attributes;
    const services = data.services;

    beforeEach(() => {
        wrapper = mount(<HeroMycruise {...customData} services={services} />);
    });

    test(`Hero contains ${customData.heroContentList.length} tiles`, () => {
        expect(wrapper.find('.slide').length).toEqual(
            customData.heroContentList.length
        );
    });

    test(`Navigation present for tiles`, () => {
        expect(wrapper.find('.slide-controls').length).toEqual(1);
    });

    test(`Navigation Dots present for tiles`, () => {
        expect(wrapper.find('.slick-dots').length).toEqual(1);
    });

    test(`Navigation has previous button`, () => {
        expect(wrapper.find('.slide-controls .prev-btn').length).toEqual(1);
    });

    test(`Navigation has previous button`, () => {
        expect(wrapper.find('.slide-controls .next-btn').length).toEqual(1);
    });

    test(`Previous button click takes to previous tiles`, () => {
        let elem = wrapper.instance().slider;
        spyOn(elem, 'slickPrev');
        wrapper.find('.slide-controls .prev-btn').simulate('click');
        expect(elem.slickPrev).toHaveBeenCalled();
    });

    test(`Title present for each tiles`, () => {
        expect(wrapper.find('h2').length).toEqual(2);
    });

    test(`Description present for each tiles`, () => {
        expect(wrapper.find('.info-section p').length).toEqual(2);
    });

    test(`Background images present for each tiles`, () => {
        expect(wrapper.find('.image-lazy-loader').length).toEqual(2);
    });
});
