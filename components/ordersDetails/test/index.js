import React from 'react';
import { mount } from 'enzyme';
import OrdersDetails from '../index';
import data from '../data/po';

describe('<OrdersDetails />', () => {
    let wrapper;
    const customData = data.attributes;
    const services = data.services;

    beforeEach(() => {
        wrapper = mount(<OrdersDetails {...customData} services={services} />);
    });

    test('Should mount without problems ', () => {
        expect(wrapper.length).toEqual(1);
    });
});
