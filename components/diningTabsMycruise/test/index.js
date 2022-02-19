import React from 'react';
import { mount } from 'enzyme';
import { assert } from 'chai';

import DiningTabsMycruise from '../index';
import data from '../data/po';
import Tabs from '../../commons/CUK/tabs';

describe('<DiningTabsMycruise />', () => {
    let wrapper;
    const customData = data.attributes;
    const services = data.services;

    beforeEach(() => {
        wrapper = mount(
            <DiningTabsMycruise {...customData} services={services} />
        );
    });

    test('Should mount without problems', () => {
        expect(wrapper.length).toEqual(1);
    });

    test('Dining tabs has element', () => {
        wrapper.setState({
            diningEvents: [
                {
                    duration: 120,
                    title: 'Cookery Club',
                    description: 'Description of this event will goes here',
                    durationUnit: 'MINUTE',
                    schedules: [
                        {
                            date: '2019-05-04T15:30:00Z',
                            purchasable: false,
                            nonPurchasabilityMessage: ['NO_PRICE']
                        },
                        {
                            date: '2019-03-03T21:00:00Z',
                            purchasable: true,
                            pricePerPax: {
                                currencyIso: 'USD',
                                maxValue: 17,
                                minValue: 17,
                                userPriceGroup: 'ALL'
                            }
                        }
                    ]
                }
            ]
        });
        expect(wrapper.find(Tabs).length).toEqual(1);
    });
});
