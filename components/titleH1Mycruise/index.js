'use strict';

import React from 'react';

const titleH1Mycruise = ({
    title,
    dividerType,
    dividerText,
    description,
    type = 'h2',
    showIcon
}) => (
    <div className="title-component">
        <div className="inner-container">
            {showIcon === true ? <span className="icon-heading" /> : null}

            {type.toLowerCase() === 'h1' ? (
                <h1 className="title" dangerouslySetInnerHTML={{
                    __html: title
                }}></h1>
            ) : (
                <h2 className="title" dangerouslySetInnerHTML={{
                    __html: title
                }}></h2>
            )}
            {dividerText ? (
                <span
                    className={
                        dividerType === 'text'
                            ? 'title-decorator divider-text'
                            : 'title-decorator-image'
                    }
                    role="presentation"
                >
                    {dividerType === 'text' && dividerText}
                </span>
            ) : null}
            {description && <p className="description">{description}</p>}
        </div>
    </div>
);

// TESTINFO: no render function, so error:
// Invariant Violation: Tester.render(): A valid React element (or null) must be returned. You may have returned undefined, an array or some other invalid object.

titleH1Mycruise.defaultProps = {
    showIcon: true
};
export default titleH1Mycruise;
