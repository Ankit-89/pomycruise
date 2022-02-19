import React from 'react';
import { mount } from 'enzyme';
import data from '../data/po';

import SimpleText from '../index';

describe('<SimpleText />', () => {
    let wrapper;

    const customData = data.attributes;

    beforeEach(() => {
        wrapper = mount(<SimpleText {...customData} />);
    });

    test('SimpleText have 1 title', () => {
        expect(wrapper.find('.simple-text-title').length).toEqual(1);
    });
});
