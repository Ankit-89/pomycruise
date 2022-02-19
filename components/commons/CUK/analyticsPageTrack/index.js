'use strict';

import React from 'react';
import analytics from '../analytics';
import sessionStorage from '../session-storage';

class AnalyticsPageTrack extends React.PureComponent {
    componentDidMount() {
        if (
            typeof window !== 'undefined' &&
            window.configs.template !== 'confirmationPage' &&
            window.configs.template !== 'paymentPage'
        ) {
            // Skip in SSR

            analytics.updateLoginData();

            analytics.analyticsPageTrack();

            if (
                window.loginConfig &&
                window.loginConfig.loginMethod === 'CAS' &&
                windowEncoded.location.href.indexOf('?ticket=') === -1
            ) {
                const casLoginAnalytics = sessionStorage.getItem(
                    'loginSuccessAnalytics'
                ); // Below code is for successful CAS login. The data is being set by Login component

                if (casLoginAnalytics && casLoginAnalytics.event) {
                    analytics.customClicks(casLoginAnalytics);

                    sessionStorage.removeItem('loginSuccessAnalytics');
                }
            }
        }
    }

    render() {
        return <div className="analytics-page-track" data-page-track="true" />;
    }
}

export default AnalyticsPageTrack;
