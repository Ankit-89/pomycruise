import React from 'react';
import SessionStorage from '../commons/CUK/session-storage';
import moment from 'moment';
import LoyaltyTierSlot from '../loyaltyTierSlot';
import analytics from '../commons/CUK/analytics';
import { getConfig, sessionRedirectUrl } from '../commons/CUK/utilities';
import validateSession from '../commons/CUK/validateSession';
import SessionLogout from '../commons/CUK/sessionLogout';
class confirmationHeaderMycruise extends React.Component {
    constructor(props) {
        super(props);
    }

    componentWillMount() {
        const portCalls = SessionStorage.getItem('portCalls');
        if ((portCalls == undefined || portCalls == null) && !validateSession.checkCookie(['wcmmode'])) {
            sessionRedirectUrl();
        }
    }

    componentDidUpdate() {}

    goBack = (e) => {
        analytics.clickTracking(this);
        e.preventDefault();
        if (window.configs.template === 'confirmationMycruisePage') {
            let shipUser = SessionStorage.getItem('userData').shipCode;
            const urlHomepage = getConfig('homepageUrl', '');
            window.location.href = urlHomepage.replace('{shipCode}', shipUser);
        } else {
            // window.history.back();
            const template = getConfig('template');
            const cartUrl = getConfig('cartUrl');
            if (template == 'paymentRedirectionPage') {
                window.location.href = cartUrl;
            } else {
                window.history.go(-1);
            }
        }
    };

    render() {
        const { logo, labels, services, loyaltyTiers } = this.props;
        const {
            backLabel,
            guestsLabel,
            yesLoyaltyLabel,
            noLoyaltyLabel
        } = labels;
        const { headers, urls } = typeof services !== 'undefined' && services;

        const userData = !validateSession.checkCookie(['wcmmode'])
            ? SessionStorage.getItem('userData')
            : {};
        const {
            embarkationDate,
            disembarkationDate,
            passengers,
            customer,
            cruiseName,
            brandCode
        } = userData;
        const { pastGuestNumber } = customer ? customer : '';

        const embarkationDay = embarkationDate
            ? moment(embarkationDate, 'YYYY-MM-DD').format('MMM DD gggg')
            : '';
        const disembarkationDay = disembarkationDate
            ? moment(disembarkationDate, 'YYYY-MM-DD').format('MMM DD gggg')
            : '';

        const guestNumber = passengers ? Object.keys(passengers).length : 0;
        return (
            <div className="confirmationHeaderMycruise__cont">
                <div className="confirmationHeaderMycruise__back">
                    <a
                        href="#"
                        onClick={this.goBack}
                        data-linktext={'confirmationHeaderMycruise-back'}
                        data-componentname={this.props.type}
                    >
                        {backLabel}
                    </a>
                </div>
                <SessionLogout
                    {...this.props}
                    sessionTimeoutIdlePromptTitle={
                        labels.sessionTimeoutIdlePromptTitle
                    }
                    sessionTimeoutIdlePromptDescription={
                        labels.sessionTimeoutIdlePromptDescription
                    }
                    sessionTimeoutIdlePromptCTALabel={
                        labels.sessionTimeoutIdlePromptCTALabel
                    }
                />
                <div className="confirmationHeaderMycruise__logo">
                    <a
                        className="primary-logo"
                        href={logo.url}
                        data-linktext={'confirmationHeaderMycruise-logo'}
                        data-componentname={this.props.type}
                    >
                        <img
                            className="confirmationHeaderMycruise__logoImg"
                            src={logo.image}
                            alt={logo.alt}
                        />
                    </a>
                </div>
                <div className="confirmationHeaderMycruise__center">
                    <h5 className="confirmationHeaderMycruise__title">
                        {cruiseName}
                    </h5>
                    <p className="confirmationHeaderMycruise__text">
                        <span>{embarkationDay}</span> -
                        <span> {disembarkationDay}</span> -
                        <span>
                            {guestNumber} {guestsLabel}
                        </span>
                    </p>
                </div>
                <div className="confirmationHeaderMycruise__right">
                    <div className="confirmationHeaderMycruise__loyality">
                        <LoyaltyTierSlot
                            label={yesLoyaltyLabel}
                            noTierLabel={noLoyaltyLabel}
                            loyaltyApi={urls.loyaltyApi}
                            pastGuestNumber={pastGuestNumber}
                            brandCode={brandCode}
                            loyaltyTiers={loyaltyTiers}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

export default confirmationHeaderMycruise;
