import React from 'react';
import { mount } from 'enzyme';
import NotificationBannerClose from '../index';
import data from '../data/po';

describe('<NotificationBannerClose />', () => {
    let wrapper;
    const customData = data.attributes;

    beforeEach(() => {
        wrapper = mount(<NotificationBannerClose {...customData} />);
    });

    test('Should mount without problems ', () => {
        expect(wrapper.length).toEqual(1);
    });
});
