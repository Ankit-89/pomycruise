'use strict';

import React from 'react';

import TitleH1Mycruise from '../titleH1Mycruise';
import Image from '../commons/CUK/image';

const articleHeader = ({ title, image }) => (
    <div className="article-header">
        <TitleH1Mycruise title={title} type={'h1'} />
        <div className="tile-image">
            <div className="tile-image--round">
                <Image {...image} />
            </div>
        </div>
    </div>
);

export default articleHeader;
