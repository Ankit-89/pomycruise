import React from 'react';
import Image from '../commons/CUK/image';

const fullWidthImage = ({ image }) =>
    image ? (
        <div className="full-width-image">{<Image {...image} />}</div>
    ) : null;

export default fullWidthImage;
