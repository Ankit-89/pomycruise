import React, { Component } from 'react';
import Link from '../commons/CUK/link';
import analytics from '../commons/CUK/analytics';
import validateSession from '../commons/CUK/validateSession';
import { getConfig } from '../commons/CUK/utilities';

class globalHeaderLogin extends Component {
    constructor(props) {
        super(props);
        this.brand = getConfig('brand', '');
    }

    componentDidMount() {
        !validateSession.checkCookie(['wcmmode']);
        // && analytics.clickTracking(this);
    }

    componentDidUpdate() {
        !validateSession.checkCookie(['wcmmode']);
        // &&  analytics.clickTracking(this);
    }

    //render method
    render() {
        const { primaryHeaderLoginLogo } = this.props;
        return (
            <div className="global-header-login">
                <div className="global-header-aux">
                    <div className="menu-bar-small">
                        {primaryHeaderLoginLogo && (
                            <div className="nav-brand-logo">
                                <Link
                                    url={primaryHeaderLoginLogo.url}
                                    linkClassName="brand-logo"
                                    isExternal={
                                        primaryHeaderLoginLogo.isExternal ||
                                        true
                                    }
                                    dataLinktext={`header:${this.brand}:logo`}
                                    dataContentname={`${this.brand} Logo`}
                                    dataContenttype="image"
                                    ariaLabel={primaryHeaderLoginLogo.alt}
                                >
                                    <img
                                        src={primaryHeaderLoginLogo.image}
                                        alt={primaryHeaderLoginLogo.alt}
                                    />
                                </Link>
                            </div>
                        )}
                        <div className="nav-Curve" aria-hidden="true" />
                    </div>
                </div>
            </div>
        );
    }
}

export default globalHeaderLogin;
