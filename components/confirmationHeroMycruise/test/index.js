import React from 'react';
import { mount } from 'enzyme';

import ConfirmationHeroMycruise from '../index';
import data from '../data/po';

describe('<ConfirmationHeroMycruise />', () => {
    let wrapper;
    const customData = data.attributes;
    const services = data.services;

    beforeEach(() => {
        wrapper = mount(
            <ConfirmationHeroMycruise {...customData} services={services} />
        );
    });

    test('Confirmation Hero contains title', () => {
        expect(wrapper.find('.booking-title').length).toEqual(1);
    });

    test('Confirmation Hero contains message', () => {
        expect(wrapper.find('.booking-msg').length).toEqual(1);
    });

    test('Confirmation Hero contains number booking', () => {
        expect(wrapper.find('.booking-number').length).toEqual(1);
    });

    test('Confirmation Hero contains image', () => {
        expect(wrapper.find('.full-image').length).toEqual(1);
    });
});
