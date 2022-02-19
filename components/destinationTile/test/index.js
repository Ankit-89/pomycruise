// import React from 'react';
// import { mount } from 'enzyme';
// import { assert } from 'chai';

// import HotelCard from '../index';
// import data from '../data/po';

// suite( '<HotelCard />', () => {

//     let wrapper;
//     const customData = data.attributes;
//     const services = data.services;

//     setup( () => {

//         wrapper = mount(<HotelCard { ...customData } services={ services }/> );
//     });

//     test( 'Destination tile contains one <h3> element', () => {

//         assert.equal( wrapper.find( 'h3' ).length, 1 );
//     });

//     test( `h3 anchor contains custom text "${ customData.title }"`, () => {

//         const expected = `${ customData.title }`;

//         wrapper = mount( <HotelCard { ...customData }  services={ services }/>);
//         assert.equal( wrapper.find( '.title-container h3' ).text(), expected );
//     });

//     test( 'Destination tile contains one <picture> element', () => {

//         assert.equal( wrapper.find( '.image-lazy-loader' ).length, 1 );
//     });

//     test( 'Destination tile has a description element', () => {

//         assert.equal( wrapper.find( '.description-container' ).length, 1 );
//     });

//     test( `Destination tile has a description as  "${ customData.description }"`, () => {

//         const expected = `${ customData.description }`;

//         wrapper = mount( <HotelCard { ...customData }  services={ services }/>);
//         assert.equal( wrapper.find( '.description-container' ).text(), expected );
//     });

//     test( 'Destination tile has a CTA Link <a> element', () => {

//         assert.equal( wrapper.find( '.secondary-cta' ).length, 1 );
//     });

//     test( `Destination tile has a CTA Link label  "${ customData.primaryCta.label }"`, () => {

//         const expected = `${ customData.primaryCta.label }`;

//         wrapper = mount( <HotelCard { ...customData }  services={ services }/>);
//         assert.equal( wrapper.find( '.secondary-cta' ).text(), expected );
//     });

//     test( `Destination tile has a CTA Link url  "${ customData.primaryCta.url }"`, () => {

//         const expected = `${ customData.primaryCta.url }`;

//         wrapper = mount( <HotelCard { ...customData }  services={ services }/>);
//         assert.equal( wrapper.find( '.secondary-cta' ).prop( 'href' ), expected );
//     });

// });
