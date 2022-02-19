'use strict';

import React from 'react';
// import './styles/index.css';

class emptyState extends React.PureComponent {
    constructor(props) {
        super(props);
    }

    render() {
        let { title, description } = this.props;

        return (
            <div className={`empty-container ${this.props.className} `}>
                <span className="empty-img" />
                <h4 className="empty-title" dangerouslySetInnerHTML={{
                            __html: title
                        }}></h4>
                {description && (
                    <p className="empty-description" dangerouslySetInnerHTML={{
                        __html: description
                    }}></p>
                )}
            </div>
        );
    }
}

export default emptyState;
