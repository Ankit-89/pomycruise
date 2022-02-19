'use strict';

import React from 'react';
// import './styles/index.css';

class bannerText extends React.PureComponent {
    constructor(props) {
        super(props);
    }

    render() {
        let { icon, bodyText, background } = this.props;

        return (
            <div className={`bannerText ${background ? 'background' : ''}`}>
                <div className="bannerText__cont">
                    <div className="bannerText__aux">
                        {icon && (
                            <span className="bannerText__icon">
                                <img src={icon} />
                            </span>
                        )}
                        <p className="bannerText__text">{bodyText}</p>
                    </div>
                </div>
            </div>
        );
    }
}

export default bannerText;
