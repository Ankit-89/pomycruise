import React from 'react';
import { mount } from 'enzyme';
import { assert } from 'chai';

import sliderHotel from '../index';
import data from '../data/po';

describe('<sliderHotel />', () => {
    let wrapper;
    const customData = data.attributes;
    const services = data.services;
    const hotelCardArray = customData.childComponents.filter((item) => {
        item.type === 'hotelCard';
    });
    const hotelCardNumber = hotelCardArray.length;
    beforeEach(() => {
        wrapper = mount(<sliderHotel {...customData} services={services} />);
    });

    test('Slider hotel contains the hotel cards passed', () => {
        expect(wrapper.find('.destination-tile-wrapper').length).toEqual(
            hotelCardNumber
        );
    });
});
