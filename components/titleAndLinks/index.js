/*
 * React Modal
 *
 * For examples and features: https://github.com/davidtheclark/react-aria-modal
 */
'use strict';

import React from 'react';

const titleAndLinks = ({ title, links }) => (
    <div className="article--title_links">
        <h2>{title}</h2>
        <ul>
            {links.map((link, i) => (
                <li key={i}>
                    <a href={link.url}>{link.label}</a>
                </li>
            ))}
        </ul>
    </div>
);

export default titleAndLinks;
