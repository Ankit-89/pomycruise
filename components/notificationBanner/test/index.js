import React from 'react';
import { mount } from 'enzyme';
import NotificationBanner from '../index';
import data from '../data/po';

describe('<NotificationBanner />', () => {
    let wrapper;
    const customData = data.attributes;

    beforeEach(() => {
        wrapper = mount(<NotificationBanner {...customData} />);
    });

    test('Should mount without problems ', () => {
        expect(wrapper.length).toEqual(1);
    });

});
