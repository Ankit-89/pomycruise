import React from 'react';
import { mount } from 'enzyme';

import TextCta from '../index';
import data from '../data/po';

describe('<TextCta />', () => {
    let wrapper;

    const customData = data.attributes;
    beforeEach(() => {
        wrapper = mount(<TextCta {...customData} />);
    });

    test('TextCta contains <p> ', () => {
        expect(wrapper.find('.textCta__text').length).toEqual(1);
    });
    test('TextCta my cruise has a CTA Link <a> element', () => {
        expect(wrapper.find('.cta-primary').length).toEqual(1);
    });

    test(`TextCta my cruise has a CTA Link label  '${
        customData.ctaLabel
    }'`, () => {
        const expected = customData.ctaLabel;
        wrapper = mount(<TextCta {...customData} />);
        expect(wrapper.find('.cta-primary').text()).toEqual('Go to my orders');
    });
});
