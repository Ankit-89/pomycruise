import React from 'react';
import { mount } from 'enzyme';
import { assert } from 'chai';

import DiningCard from '../index';
import data from '../data/po';
import Card from '../../commons/CUK/card';

describe('<DiningCard />', () => {
    let wrapper;
    const customData = data.attributes;
    const services = data.services;

    beforeEach(() => {
        wrapper = mount(<DiningCard {...customData} services={services} />);
    });

    test('Should mount without problems', () => {
        expect(wrapper.length).toEqual(1);
    });

    test('Dining card has element', () => {
        expect(wrapper.find(Card).length).toEqual(1);
    });
});
