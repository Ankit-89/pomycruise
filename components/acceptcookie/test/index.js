import React from 'react';
import { mount } from 'enzyme';
import data from '../data/costa';

import AcceptCookie from '../index';

describe('<AcceptCookie />', () => {

    let wrapper;

    const customData = data.attributes;

    window.location.href = 'cookie-acceptance-section';

    beforeEach(() => {

        wrapper = mount(<AcceptCookie { ...customData } />);
    });

    test('Component rendered dynamic results', () => {

        expect(wrapper.find( 'input' ).length).toEqual(4);
    });

    test('On radio change', () => {

        const id = `input#${customData.labels.refuse}1`;

        wrapper.find( id ).simulate( 'click' );

        expect(wrapper.find(`${id}`).is('[checked]')).toEqual(true);
    });

    // a better test would be to verify if the cookie is saved
    test('On submit change', () => {

        const classId = `.button`;

        wrapper.setState({
            disablePerfCookie: false
        });
        wrapper.find( classId ).simulate( 'click' );

        expect(wrapper.find( '.cookie-save-message' ).length).toEqual(1);
    });

    test(`on radio button change`, () => {

        wrapper.find('input[type="radio"]').first().simulate('change', {
            target: {
                name: 'radioBtn',
                value: 'true'
            }
        });

        expect(wrapper.state('radioBtn')).toEqual(true);
    });

});
