/**
 *
 * Common Utility Module to handle anchor tag across the components
 *
 * @module Link
 *
 */
'use strict';

import React from 'react';
import PropTypes from 'prop-types';

/**
 * Handles Enter key press on Button
 * @param {object} e - click event
 * @param {function} callback - click callback
 * @param {boolean} allowDefault - allows default behavior
 */
const handleClick = (e, callback, allowDefault) => {
    if (callback) {
        if (!allowDefault) {
            e.preventDefault();
        }
        callback(e);
    }
};

/**
 * Gives markup for anchor tag
 * @param {React-props} props - Props passed to this module
 * @returns {React-markup} - Returns React markup to generate anchor tag
 */
const link = (props) => {
    const ctaLabel = props.label;
    const target = props.isExternal ? '_blank' : null;
    const rel = props.isExternal ? 'noopener noreferrer' : null;
    const ctaUrl = props.url ? props.url : 'javascript:void(0)';
    const className = props.linkClassName ? props.linkClassName : null;
    const title = props.title ? props.title : null;
    const ariaRole = props.ariaRole ? props.ariaRole : null;
    const tabIndex = props.tabIndex ? props.tabIndex : null;
    const ref = props.reference ? props.reference : null;
    const {
        dataLinktext,
        ariaLabelledby,
        dataContentname,
        dataContenttype,
        ariaLabel,
        ariaSelected,
        ariaHaspopup,
        ariaExpanded,
        dataComponentname,
        dataClicktype,
        ariaHidden,
        customData = {},
        styleValue
    } = props;

    return props.children ? (
        <a
            href={ctaUrl}
            ref={ref}
            aria-checked={ariaSelected}
            aria-expanded={ariaExpanded}
            aria-haspopup={ariaHaspopup}
            aria-hidden={ariaHidden}
            aria-labelledby={ariaLabelledby}
            aria-label={ariaLabel}
            role={ariaRole}
            tabIndex={tabIndex}
            target={target}
            rel={rel}
            className={className}
            title={title}
            onClick={(e) => {
                handleClick(e, props.onClick, props.allowDefault);
            }}
            data-linktext={dataLinktext}
            data-contentname={dataContentname}
            data-contenttype={dataContenttype}
            data-componentname={dataComponentname}
            data-clicktype={dataClicktype}
            {...customData}
            style={{ textTransform: styleValue }}
        >
            {props.children}
        </a>
    ) : (
        <a
            href={ctaUrl}
            ref={ref}
            aria-checked={ariaSelected}
            aria-expanded={ariaExpanded}
            role={ariaRole}
            aria-labelledby={ariaLabelledby}
            aria-label={ariaLabel}
            target={target}
            tabIndex={tabIndex}
            rel={rel}
            className={className}
            title={title}
            onClick={(e) => {
                handleClick(e, props.onClick, props.allowDefault);
            }}
            data-linktext={dataLinktext}
            data-contentname={dataContentname}
            data-contenttype={dataContenttype}
            data-componentname={dataComponentname}
            data-clicktype={dataClicktype}
            dangerouslySetInnerHTML={{ __html: ctaLabel }}
            {...customData}
            style={{ textTransform: styleValue }}
        />
    );
};

/**
 * propTypes
 * @property {object} passed properties to generate anchor tag
 */
link.propTypes = {
    /** @type {string} property used as label of anchor tag */
    label: PropTypes.string,
    /** @type {string} property used as href of anchor tag */
    url: PropTypes.string,
    /** @type {string} if true anchor tag will open in new tab */
    isExternal: PropTypes.bool,
    /** @type {string} if passed, property will be used as className of anchor tag */
    linkClassName: PropTypes.string,
    /** @type {string} if passed, property will be used as title of anchor tag */
    title: PropTypes.string
};

export default link;