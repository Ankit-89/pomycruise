'use strict';

import React from 'react';
import analytics from '../commons/CUK/analytics';
import SimpleText from '../simpleText';

const essentialInformation = ({ title, bodyText1, bodyText2 }) => (
    <SimpleText 
        title={title}
        bodyText1={bodyText1}
        bodyText2={bodyText2}
    />
);

export default essentialInformation;
