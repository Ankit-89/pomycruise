/**
 *
 * A keyInfoDetail module that renders a div with an icon, a title and a list information.
 * @module modules/ProductCode
 *
 */
'use strict';

import React from 'react';
// import PropTypes from 'prop-types';

class productCode extends React.Component {
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
        let { shorexId, productCodeLabel } = this.props;
        return (
            <div className={`shorex-product-code`}>
                <p className={`shorex-product-code-content`}>
                    {productCodeLabel} {shorexId}
                </p>
            </div>
        );
    }
}
export default productCode;
