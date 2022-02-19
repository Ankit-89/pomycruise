'use strict';

import React from 'react';
import Image from '../commons/CUK/image';

const imageAndText = ({
    classes,
    title,
    description,
    image,
    link,
    clickAction
}) => (
    <div className={`${classes} article--image_text`}>
        <div className="tile-image">
            <div className="tile-image--round">
                <Image {...image} />
            </div>
        </div>
        <div className="tile-content">
            <h2 className="tile-title">{title}</h2>
            <div
                className="tile-description"
                dangerouslySetInnerHTML={{ __html: description }}
            />
            <a href={link.url} className="tile-link">
                {link.label}
            </a>{' '}
        </div>
    </div>
);

export default imageAndText;
