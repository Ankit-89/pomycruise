'use strict';

import React from 'react';
import analytics from '../commons/CUK/analytics';

const simpleText = ({ title, bodyText1, bodyText2, ctaLink  }) => {
    const configs = typeof window !== 'undefined' ? window.configs : {};
    let shipCode = configs.shipCode;
    const ctaLinkUrl = ctaLink &&  ctaLink.url.replace("/mycruise/articles","/mycruise/"+shipCode+"/articles");
    return (
        <div className="simple-text">
            <div className="simple-textAux">
                <div className="simple-text-title">{title}</div>
                <div className="simple-text-body-text" dangerouslySetInnerHTML={{__html:bodyText1}}/>
                {bodyText2 && (
                    <div className="simple-text-body-text simple-text-body-text-small">
                        {bodyText2}
                    </div>
                )}
                {ctaLink && (
                    <a
                        className="simple-text-cta"
                        href={ctaLinkUrl}
                        data-linktext={ctaLink.label}
                        data-componentname={'simpleText'}
                    >
                        {ctaLink.label}
                    </a>
                )}
            </div>
        </div>
    );
};

export default simpleText;