'use strict';

import React from 'react';
import Image from '../commons/CUK/image';

const editorialTile = ({
    classes,
    title,
    description,
    articleType,
    image,
    link,
    clickAction
}) => (
    <div className={`${classes} editorial-tile`}>
        <div className="tile-image">
            <Image {...image} />
        </div>
        <div tabIndex="0" className="tile-content">
            <h2 className="tile-title">{title}</h2>
            <div
                className="tile-description"
                dangerouslySetInnerHTML={{ __html: description }}
            />
            <a
                tabIndex="0"
                className="more-details--link"
                onClick={(e) => clickAction(true, link.url, articleType)}
            >
                {link.label}
            </a>
        </div>
    </div>
);

export default editorialTile;
