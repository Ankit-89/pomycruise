'use strict';

import React from 'react';
import SessionStorage from '../commons/CUK/session-storage';
import Loader from '../commons/CUK/loader';
import { getConfig } from '../commons/CUK/utilities';
import FetchData from '../commons/CUK/fetch-data';

class intermediateConfirmationLoader extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showThrobber: true
        };
    }

    componentDidMount() {
        setTimeout(() => {
            const billingDetails = SessionStorage.getItem('billingAddress');
            const transactionId = billingDetails.clientSystemTransactionId;
            const confirmationlink = window.configs.confirmationPageUrl;
            const refusedlink = window.configs.refusedPageUrl;
            const isIE = /*@cc_on!@*/ false || !!document.documentMode;
            let statusKey, params;
            if (isIE) {
                statusKey = this.decodeUrlParam('status');
            } else {
                params = new URLSearchParams(window.location.search);
                statusKey = params.get('status');
            }
            if (statusKey == 'success') {
                const successRedirectUrl = `${confirmationlink}?crId=${transactionId}`;
                window.location.href = successRedirectUrl;
            } else {
                const refusedRedirectUrl = `${refusedlink}?crId=${transactionId}`;

                window.location.href = refusedRedirectUrl;
            }
        }, 2000);
    }

    decodeUrlParam = (name) => {
        let results = new RegExp('[?&]' + name + '=([^&#]*)').exec(
            window.location.href
        );
        if (results == null) {
            return null;
        } else {
            return decodeURI(results[1]) || 0;
        }
    };

    render() {
        const { showThrobber } = this.state;
        const { labels } = this.props;
        return (
            <div className="">
                {showThrobber && (
                    <div className="throbberOverlay">
                        <Loader show={showThrobber} />
                        <p className="throbberOverlay__text">
                            {labels.confirmationPageLoadingMessage}
                        </p>
                    </div>
                )}
            </div>
        );
    }
}

export default intermediateConfirmationLoader;
