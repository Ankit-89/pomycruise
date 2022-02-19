import React from 'react';
import { mount } from 'enzyme';
import { assert } from 'chai';

import KeyFacts from '../keyFacts';
import data from '../data/keyFacts';

suite( '<KeyFacts />', () => {

    let wrapper, newWrapper;

    const excursionInfoData = data.attributes.excursionInfoData[0];
    const excursionInfoNewData = data.attributes.excursionInfoNewData[0];

    window.configs.currencyMap = {
        'defaultValue': '$',
        'USD': '$',
        'AUD': '$',
        'INR': 'INR'
    };

    setup(() => {

        wrapper = mount(<ul className="key-fact-list"><KeyFacts { ...excursionInfoData } /></ul> );
    });


    test( 'keyFacts is created', () => {

        assert.equal( wrapper.find( '.key-fact' ).length, 1 );
    });

    test( 'verify key facts has icon', () => {

        assert.equal( wrapper.find( '.key-icon' ).length, 1 );

    });

    test( 'verify key facts has icon as specified', () => {
        assert.equal( wrapper.find( '.caption-icon' ).length, 0 );

    });

    test( 'keyFacts contains .caption and has caption as given', () => {
        assert.equal(wrapper.find('.caption').length, 2);
    });

    test( 'keyFacts contains .spec as specified', () => {
        assert.equal(wrapper.find('.stats').length, 1);
    });


    suite( 'keyFacts with new variation', () => {
        setup(() => {
            newWrapper = mount(<ul className="key-fact-list"><KeyFacts { ...excursionInfoNewData }/></ul> );
        });
        test( 'keyFacts contains costLabel', () => {
            assert.equal(newWrapper.find( '.key-fact' ).length, 1);
        });
    });
});
