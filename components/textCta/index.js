'use strict';

import React from 'react';
import Link from '../commons/CUK/link';
import { getConfig } from '../commons/CUK/utilities';
import SessionStorage from '../commons/CUK/session-storage';

class textCta extends React.Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick() {
        const { ctaUrl } = this.props;
        const template = getConfig('template');
        if (template && template == 'paymentRedirectionPage') {
            const paymentFailRedirect = true;
            SessionStorage.setItem('paymentFailRedirect', paymentFailRedirect);
        }
        window.location.href = ctaUrl ? ctaUrl : '#';
    }

    render() {
        const { bodyText, ctaLabel, ctaUrl, icon } = this.props;

        return (
            <div className="textCta__cont">
                <div className="textCta__aux">
                    {icon && (
                        <span className="textCta__icon">
                            <img src={icon} />
                        </span>
                    )}
                    <p className="textCta__text">{bodyText}</p>
                    <Link
                        // url={ctaUrl ? ctaUrl : '#'}
                        // ariaRole='menuitem'
                        linkClassName="cta-primary"
                        dataLinktext={`link:${ctaLabel}`}
			onClick={this.handleClick}
                    >
                        {ctaLabel}
                    </Link>
                </div>
            </div>
        );
    }
}

export default textCta;
