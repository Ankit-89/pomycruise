import React from 'react';
import { mount } from 'enzyme';
import BookingSummaryMycruise from '../index';
import data from '../data/po';

//method describe
describe('<BookingSummaryMycruise/>', () => {
    let wrapper;
    const customData = data.attributes;
    const services = data.services;

    beforeEach(() => {
        wrapper = mount(
            <BookingSummaryMycruise {...customData} services={services} />
        );
    });
    test('Should mount without problems ', () => {
        expect(wrapper.length).toEqual(1);
    });
});
