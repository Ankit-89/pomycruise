import React from 'react';
import { mount } from 'enzyme';

import TableInformation from '../index';
import data from '../data/po';

describe('<TableInformation />', () => {
    let wrapper;
    let attributes = data.attributes;

    beforeEach(() => {
        wrapper = mount(<TableInformation {...attributes} />);
    });

    test('Table Information contains table', () => {
        expect(wrapper.find('table').length).toEqual(1);
    });
});
