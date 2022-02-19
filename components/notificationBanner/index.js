/**
 * Component - C050 - Not on sale anymore banner
 */
'use strict';

import React from 'react';
import Link from '../commons/CUK/link';

class notificationBanner extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        const { title, description, children, cta, type, icon } = this.props;
        return (
            <div className={`notificationBanner ${type}`}>
                <div className="notificationBanner__container">
                    <div className="notificationBanner__content">
                        {icon && (
                            <span className="notificationBanner__icon">
                                <img src={icon} />
                            </span>
                        )}
                        <div>
                            {title && (
                                <h5 className="notificationBanner__title">
                                    {title}
                                </h5>
                            )}
                            {description && (
                                <p className="notificationBanner__text">
                                    {description}
                                    {cta && (
                                        <Link
                                            ariaLabel={cta.label}
                                            label={cta.label}
                                            url={cta.url}
                                            dataLinktext={cta.label}
                                            linkClassName="notificationBanner__cta"
                                        >
                                            {cta.label}
                                        </Link>
                                    )}
                                </p>
                            )}
                        </div>
                    </div>
                    {children}
                </div>
            </div>
        );
    }
}

export default notificationBanner;
