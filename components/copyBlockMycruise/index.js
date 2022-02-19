'use strict';

import React from 'react';
import PropTypes from 'prop-types';

// import './styles/index.css';
// import 'platform-theme/styles/components/copyBlock/index.css';

const copyBlockMycruise = (props) => {
    const { copyBlockList, backgroundToggle } = props;
    const columnLength = copyBlockList.length;

    return (
        <div
            className={`copy-block col-${columnLength} ${
                backgroundToggle ? 'dark-theme' : ''
            } `}
        >
            {copyBlockList.map((item, index) => (
                <div
                    key={index}
                    className="inner-copy-block"
                    dangerouslySetInnerHTML={{
                        __html: item.text
                            .replace(
                                '<table',
                                '<div class="table-container"><table'
                            )
                            .replace('</table>', '</table></div>')
                    }}
                />
            ))}
        </div>
    );
};

copyBlockMycruise.propTypes = {
    text: PropTypes.string
};

export default copyBlockMycruise;
