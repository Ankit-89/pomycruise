'use strict';

import React from 'react';
import PropTypes from 'prop-types';


const CopyBlock = ( props ) => {

    const { copyBlockList, backgroundToggle } = props;
    const columnLength = copyBlockList && copyBlockList.length;

    return (
        <div className={`copy-block-wrap ${backgroundToggle ? 'dark-theme' : '' }`}>
            <div className={`copy-block col-${columnLength}`}>
            {
                copyBlockList.map((item, index) => (
                    <div key = {index} className='inner-copy-block' dangerouslySetInnerHTML={{ __html: (item.text).replace(/<table/g, '<div class="table-container"><table').replace(/<\/table>/g, '</table></div>') }}/>
                )
                )
            }
            </div>
        </div>

    );
};

CopyBlock.propTypes = {
    text: PropTypes.string
};

export default CopyBlock;