'use strict';

import React from 'react';

/**
 * OffersRibbon Component
 * @param {object} props - properties
 * @returns {object} - offer ribbon jsx
 */
export default ({
        className = '',
        offerName = '',
        onClick = () => {},
        ref = null
    } = {}) => (
        <div className={`offers-ribbon ${ className }`}>
            <button
                onClick={ onClick }
                ref={ ref }
                className='special-offer-btn'>
                    <span className='offers-icon'></span>
                    <span className='offers-label'>{ offerName }</span>
            </button>
        </div>
    );