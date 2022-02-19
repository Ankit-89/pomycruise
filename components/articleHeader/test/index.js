import React from 'react';
import { mount } from 'enzyme';

import ArticleHeader from '../index';
import data from '../data/po';

describe('<ArticleHeader />', () => {
    let wrapper;
    const customData = data.attributes;

    beforeEach(() => {
        wrapper = mount(<ArticleHeader {...customData} />);
    });

    test('ArticleHeader contains one <h1> element', () => {
        expect(wrapper.find('h1').length).toEqual(1);
    });

    test('Verify titleH1 has title content as given in data', () => {
        expect(wrapper.find('.title-component .title').length).toEqual(1);
        expect(wrapper.find('.title-component .title').text()).toEqual(
            'Passport & Visas'
        );
    });

    test('ArticleHeader contains one <image> element', () => {
        expect(wrapper.find('.tile-image--round').length).toEqual(1);
    });
});
