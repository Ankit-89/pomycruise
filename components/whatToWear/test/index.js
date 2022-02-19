import React from 'react';
import { mount } from 'enzyme';
import { assert } from 'chai';

import LoginTALanding from '../index';
import data from '../data/po';

suite( '<LoginTALanding />', () => {

    let wrapper;

    const customData = data.attributes;

    const customDataVideo = data.customDataVideo;

    const customDataGif = data.customDataGif;

    const variation = data.variation;

    setup( () => {

        wrapper = mount( <LoginTALanding { ...customData }/> );
    });

    test( 'LoginTALanding contains <a> when type is URL', () => {

        assert.equal( wrapper.find( '.secondary' ).length, 1 );
    });

    test( 'LoginTALanding contains <p> desc tag', () => {

        assert.equal( wrapper.find( '.desc' ).length, 1 );
    });

    test( '<p> contains default text on it', () => {

        const expected = 'Test description';

        assert.equal( wrapper.find( '.desc' ).text(), expected );
    });

    test( 'LoginTALanding contains <img> tag if type is GIF ', () => {

        wrapper = mount( <LoginTALanding { ...customDataGif }/> );

        assert.equal( wrapper.find( '.ht-background' ).length, 1 );
    });

    // test( 'Modal is closed when close button click ', () => {

    //     wrapper = mount( <LoginTALanding { ...customDataVideo }/> );

    //     wrapper.instance().handleModal( false );

    //     assert.equal( wrapper.state( 'showModal' ), false );
    // });

    test( 'If background type image than render image ', () => {

        wrapper = mount( <LoginTALanding { ...customDataVideo }/> );

        assert.equal( wrapper.find( '.image-lazy-loader' ).length, 1 );

    });

    test( 'LoginTALanding C037a variation is mounted successfull ', () => {

        wrapper = mount( <LoginTALanding { ...variation }/> );
    });

    // test( 'Read More CTA click expanding read more content ', () => {

    //     wrapper = mount( <LoginTALanding { ...variation }/> );

    //     wrapper.setState({ readMore: true });

    //     wrapper.find( '.readmoreLink a' ).simulate( 'click' );

    //     setTimeout(() => {
    //         assert.equal( wrapper.state( 'active' ), true );
    //     }, 10);
    // });

    // test( 'LoginTALanding on video click pauses the video', () => {

    //     const evt = {
    //         'target': {
    //             'paused': true,
    //             'play': () => {
    //                 return true;
    //             }
    //         }
    //     };

    //     wrapper.instance().handleClick( evt );
    // });

    // test( 'LoginTALanding on video click plays the video on second click', () => {

    //     const evt = {
    //         'target': {
    //             'paused': false,
    //             'pause': () => {
    //                 return true;
    //             }
    //         }
    //     };

    //     wrapper.instance().handleClick( evt );
    // });
});
