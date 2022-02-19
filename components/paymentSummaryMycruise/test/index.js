import React from 'react';
import { mount } from 'enzyme';

import data from '../data/po';
import PaymentSummaryMycruise from '../index';

describe('<PaymentSummaryMycruise />', () => {
    let wrapper;

    const customData = data.attributes;
    const services = data.services;

    beforeEach(() => {
        wrapper = mount(
            <PaymentSummaryMycruise {...customData} services={services} />
        );
    });

    test('Should mount without problems', () => {
        expect(wrapper.length).toEqual(1);
    });
});
