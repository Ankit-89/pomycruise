'use strict';

import React from 'react';

const titleAndParagraph = ({ title, description }) => (
    <div className="article--title_paragraph">
        <h2 dangerouslySetInnerHTML={{ __html: title }}></h2>
        <div
            className="body-container"
            dangerouslySetInnerHTML={{ __html: description }}
        />
    </div>
);

export default titleAndParagraph;
