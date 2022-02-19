'use strict';

import React from 'react';
import LocalStorage from '../commons/CUK/localStorage';
import analytics from '../commons/CUK/analytics';



class cookieHeader extends React.Component {
    constructor(props) {
        super(props);
        
        if (LocalStorage.getItem('cookiePolicyHeader')){
            this.state = {
                displayAlertContainer: true
            };
        }else{
            this.state = {
                displayAlertContainer: false
            };
        }
    }

    handleAlert = () => {
        analytics.clickTracking(this);
        LocalStorage.setItem('cookiePolicyHeader', true);
        const { displayAlertContainer } = this.state;
        this.setState({
            displayAlertContainer: !displayAlertContainer
        }, () => {
            const ele = typeof document !== 'undefined' && document.getElementsByClassName('cookiePolicyHeader');
            ele[0].removeAttribute('style');
        });
    };

    render() {
        // console.log('loading this component')
        const { previousLabel, previousLabelLinktext, cookieMessage } = this.props.labels;
        const { displayAlertContainer } = this.state;
        return (
            <div
                className={`alert-messaging-container ${
                    displayAlertContainer ? 'displayAlertContainer' : ''
                    }`}
            >
                <div className="alert-messaging-inner-container">
                    <div className="alert-icon"></div>
                    <div
                        className={`alert-text`}
                        dangerouslySetInnerHTML={{ __html: cookieMessage }}
                    />
                    <button
                        aria-label={previousLabel}
                        className="close"
                        data-linktext={previousLabelLinktext}
                        onClick={() => this.handleAlert()}
                    >
                        <span className="close-label">{previousLabel}</span>
                        <span className="close-icon"></span>
                    </button>
                </div>
            </div>
        );
    }
}

export default cookieHeader;
