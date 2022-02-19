import React from 'react';
import { mount } from 'enzyme';
import IntermediateConfirmationLoader from '../index';
import data from '../data/cunard';

describe('<IntermediateConfirmationLoader/>', () => {
    let wrapper;
    const customData = data.attributes;
    const services = data.services;

    beforeEach(() => {
        wrapper = mount(
            <IntermediateConfirmationLoader {...customData} services={services} />
        );
    });
    test('Should mount without problems ', () => {
        expect(wrapper.length).toEqual(1);
    });
});
