'use strict';

import { assert } from 'chai';
import sampleModule from '../sample-module';

suite( 'SampleModule unit tests', function () {

    let mock;
    const config = {};
    const configDefault = {};

    setup( function () {

        config.min = 2;
        config.max = 12;

        configDefault.max = 10;
    });

    suite( 'Init', function () {

        test( 'counter sets properties with default values', function () {

            mock = sampleModule( configDefault );

            assert.equal( mock.max, 10 );
            assert.equal( mock.min, 0 );
            assert.equal( mock.counter, 0 );
        });

        test( 'counter sets properties with non-default values', function () {

            mock = sampleModule( config );

            assert.equal( mock.max, 12 );
            assert.equal( mock.min, 2 );
            assert.equal( mock.counter, 2 );
        });
    });

    suite( 'addValue', function () {

        test( 'increases counter', function () {

            mock = sampleModule( configDefault );

            mock.addValue( 5 );

            assert.equal( mock.counter, 5 );

            mock.addValue( 5 );

            assert.equal( mock.counter, 10 );
        });

        test( 'errors when max amount is reached', function () {

            mock = sampleModule( configDefault );

            mock.addValue( 11 );

            assert( mock.error.length > 0 );
            assert.equal( mock.counter, 0 );
        });

        test( 'removes error after successful addition', function () {

            mock = sampleModule( configDefault );

            mock.addValue( 8 );
            mock.addValue( 4 ); // error
            mock.addValue( 2 ); // remove error

            assert( mock.error.length === 0 );
        });
    });

    suite( 'subValue', function () {

        test( 'errors when minimum amount is reached', function () {

            mock = sampleModule( configDefault );

            mock.addValue( 3 );
            mock.subValue( 4 );

            assert.equal( mock.counter, 3 );
            assert( mock.error.length > 0 );
        });

        test( 'removes error after successful subtraction', function () {

            mock = sampleModule( configDefault );

            mock.addValue( 8 );
            mock.subValue( 12 ); // error
            mock.subValue( 5 ); // remove error

            assert( mock.error.length === 0 );
        });
        test( 'subValue decreases counter', function () {

            mock = sampleModule( configDefault );

            mock.addValue( 8 );
            mock.subValue( 7 );

            assert.equal( mock.counter, 1 );
        });
    });

    suite( 'displayError', function () {

        test( 'assigns an error to the module', function () {

            mock = sampleModule( configDefault );

            mock.displayError();

            assert( mock.error.length > 0 );
        });
    });

    suite( 'removeError', function () {

        test( 'removes error on the module', function () {

            mock = sampleModule( configDefault );

            mock.subValue( 1 );
            mock.removeError();

            assert( mock.error.length === 0 );
        });
    });
});