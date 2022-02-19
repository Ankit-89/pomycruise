import React from 'react';
import { mount } from 'enzyme';

import ToDoList from '../index';
import data from '../data/po';

describe('<ToDoList />', () => {
    let wrapper;
    const customData = data.attributes;

    beforeEach(() => {
        wrapper = mount(<ToDoList {...customData} />);
    });
    test('Should mount without problems', () => {
        expect(wrapper.length).toEqual(1);
    });
});
