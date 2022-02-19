import React from 'react';
import { mount } from 'enzyme';
import { assert } from 'chai';

import Title from '../index';
import data from '../data/po';
// import customData from '../data/campaign7';

suite( '<TitleH1 />', () => {


    let wrapper;
    const dataWithText = data.attributes;
    // const dataWithIcon = customData.attributes;

    setup( () => {

        wrapper = mount( <Title { ...dataWithText }/> );
    });

    test( 'Title H1 contains one <h1> element', () => {

        assert.equal( wrapper.find( 'h1' ).length, 1 );
    });

    test( '<h1> element should not be empty', () => {

        assert.isAbove( wrapper.find( 'h1' ).text().length, 0 );
    });

    // test( 'Title decorator contains title decorator text element', () => {

    //     wrapper = mount( <Title { ...dataWithText }/> );

    //     assert.equal( wrapper.find( '.title-decorator' ).length, 1 );
    // });

    // test( 'Title decorator CSS driven', () => {

    //     wrapper = mount( <T itle { ...dataWithIcon }/> );

    //     assert.equal( wrapper.find( '.title-decorator-image' ).length, 1 );
    // });

    if (dataWithText.description ) {
        test( 'Title H1 contains one <p> element', () => {

            assert.equal( wrapper.find( 'p' ).length, 1 );
        });

        test( 'Show Description if text length is greater then 1', () => {

            assert.isAbove( wrapper.find( 'p' ).text().length, 0 );
        });
    }

});