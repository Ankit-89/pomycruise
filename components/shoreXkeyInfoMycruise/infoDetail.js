/**
 *
 * A keyInfoDetail module that renders a div with an icon, a title and a list information.
 * @module modules/InfoDetail
 *
 */
'use strict';

import React from 'react';
import PropTypes from 'prop-types';

class infoDetail extends React.Component {
    /**
     * constructor
     * @param {React-props} props - Props passed to this module
     */
    constructor(props) {
        super(props);
    }

    /**
     * Gives markup for anchor tag
     * @returns {React-markup} - Returns React markup to generate anchor tag
     */

    render() {
        let { type, title, list, icon } = this.props;

        // const listItems = list.map(( item, index ) =>{
        //     return (
        //         <li key={index}> <span className='title'>{item.title}</span>{item.description}
        //         </li>
        //     );
        // });
        return (
            <div className={`shorex-detail-info-${type}`}>
                <div className="shorex-detail-info-title">
                    <img src={`${icon}`} className="shorex-detail-info-icon" />
                    <span> {title} </span>
                </div>
                <div
                    className="shorex-detail-info-details"
                    dangerouslySetInnerHTML={{ __html: list }}
                />
                {/* <ul className='shorex-detail-info-details'> {listItems} </ul> */}
            </div>
        );
    }
}
infoDetail.propTypes = {
    title: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    list: PropTypes.string
};
export default infoDetail;
