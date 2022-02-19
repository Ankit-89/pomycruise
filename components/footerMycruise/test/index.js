import React from 'react';
import { mount } from 'enzyme';
import { assert } from 'chai';
import FooterMycruise from '../index';
import data from '../data/po';

describe('<FooterMycruise />', () => {
    let wrapper;
    const DATA = data.attributes;

    beforeEach(() => {
        wrapper = mount(<FooterMycruise {...DATA} />);
    });

    test('All Footer items should render', () => {
        expect(wrapper.find(`.sub-link`).length).toEqual(15);
    });

    test('Footer to render mobile view', () => {
        wrapper = mount(<FooterMycruise {...DATA} />);

        const mqlLVP = { matches: true };

        wrapper.instance().handleResize(mqlLVP);

        wrapper.setState({
            isLVP: false
        });
        expect(wrapper.length).toEqual(1);
    });
});
