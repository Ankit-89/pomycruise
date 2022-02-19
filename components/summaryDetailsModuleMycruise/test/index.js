import React from 'react';
import { mount } from 'enzyme';

import data from '../data/po';
import SummaryDetailsModuleMycruise from '../index';

describe('<SummaryDetailsModuleMycruise />', () => {
    let wrapper;
    const services = data.services;
    const customData = data.attributes;

    beforeEach(() => {
        wrapper = mount(
            <SummaryDetailsModuleMycruise {...customData} services={services} />
        );
    });

    // test('Should mount without problems', () => {
    //     expect(wrapper.length).toEqual(1);
    // });

    test('validate componentDidMount function', () => {
        instance.componentDidMount();
        expect(wrapper.state('errors')).toEqual({});
    });
});
