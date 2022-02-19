/**
 * Component - C046 - Loading icon
 */
import React from 'react';

const loader = (props) => {
    const { show } = props;

    return (
        <div className={`loading ${show ? 'show' : 'hide'}`}>
            <span className="loading-icon" />
        </div>
    );
};

export default loader;
