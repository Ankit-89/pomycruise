'use strict';

import React from 'react';
import Link from '../link';
import { scrollToTop } from '../utilities';

/**
 * linkClickHandler - To create the animatedScroll
 * @param {obejct} evt - window event object
 * @param {object} props - properties like name and scroll container element, scroll to target element
 * @param {string} label - string readmore or readless label
 */
const linkClickHandler = (evt, props, label) => {
    const {
        active = false,
        scrollToTarget,
        clickHandler,
        name,
        scrollableElement
    } = props;
    let scroll;

    if (scrollableElement) {
        scroll = typeof document !== 'undefined' && document.querySelectorAll(scrollableElement)[0];
    }

    if (active) {
        scrollToTop(scrollToTarget, scroll);
    }
    clickHandler && clickHandler({ evt, linkText: label, name });
};

const readMoreOrLess = (props) => {
    const {
        className = 'readmoreLink',
        readMoreLabel = '',
        readLessLabel = '',
        active = false,
        isHidden = true
    } = props;
    let label = active ? readLessLabel : readMoreLabel,
        classname = active ? 'read-less' : 'read-more';

    return (
        <div className={`read-more-component ${className}`}>
            <Link
                linkClassName={classname}
                ariaLabel={`${props.name ? props.name : ''} ${label}`}
                url="javascript:void(0)"
                dataLinktext={props.linkText}
                ariaHidden={`${isHidden ? isHidden : false}`}
                onClick={(evt) => linkClickHandler(evt, props, label)}
            >
                {label}
            </Link>
        </div>
    );
};

export default readMoreOrLess;
