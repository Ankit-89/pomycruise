import React, { Component } from 'react';

class infoBanner extends Component {
    render() {
        let { icon, bodyText, subtitle, background, type } = this.props;
        return (
            <div
                className={`infoBanner ${background ? 'bgColor' : ''} ${
                    type !== '' ? type : ''
                }`}
            >
                <div className="infoBanner__wrapper">
                    <div className="infoBanner__cont">
                        <span
                            className={`infoBanner__icon ${
                                icon !== '' ? icon : ''
                            }`}
                        />
                        <div className="infoBanner__aux">
                            {subtitle && subtitle !== '' ? (
                                <h4 className="infobanner__subtitle">
                                    {subtitle}
                                </h4>
                            ) : null}
                            <p className="infobanner__par">{bodyText}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default infoBanner;
