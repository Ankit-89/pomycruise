import React from 'react';
import { mount } from 'enzyme';
import ShorexOverlay from '../index';
import data from '../data/po.json';

describe('<ShorexOverlay />', () => {
    let wrapper;
    const customData = data.attributes;
    const services = data.services;
    beforeEach(() => {
        wrapper = mount(<ShorexOverlay {...customData} services={services} />);
    });

    test('ShorexOverlay should mount without problems', () => {
        expect(wrapper.length).toEqual(1);
    });

    test('ShorexOverlay has a close button', () => {
        expect(wrapper.find(`.close`).length).toEqual(1);
    });
});
