import React from 'react';
import { mount } from 'enzyme';
import TabsMycruise from '../index';
import data from '../data/po';

describe('<TabsMycruise />', () => {
    let wrapper;
    const customData = data.attributes;
    let tabsLength = customData.tabs.length;

    beforeEach(() => {
        wrapper = mount(<TabsMycruise {...customData} />);
    });

    test('tabsMycruise contains as many <h3> elements as the tabs', () => {
        expect(wrapper.find('h3').length).toEqual(tabsLength);
    });
    test('tabsMycruise contains as many descriptions as the tabs', () => {
        expect(wrapper.find('.description-block').length).toEqual(tabsLength);
    });
    test('Tabs contains as many images as the tabs', () => {
        expect(wrapper.find('.image-holder').length).toEqual(tabsLength);
    });
});
