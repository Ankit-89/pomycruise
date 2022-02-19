'use strict';

import React from 'react';
import analytics from '@carnival-abg/framework/commons/analytics';
import { setBodyMargin } from '@carnival-abg/framework/commons/utility';
import LocalStorage from '@carnival-abg/framework/commons/localStorage';
import PubSub from '@carnival-abg/framework/commons/pubsub';
import topics from '@carnival-abg/framework/library/js/config/pubsubTopics';

class Alert extends React.Component {

    constructor(props) {

        super(props);

        this.state = {
            alert: 'enable'
        };
    }

    componentDidMount() {
        const newStartDate = Number(this.props.alertStartDate);
        const newEndDate = Number(this.props.alertEndDate);
        const presentDate = Date.parse(new Date().toGMTString());

        if (!(presentDate <= newEndDate && presentDate >= newStartDate) && newStartDate !== 0 && newEndDate !== 0) {
            this.handleAlert();
        }
        let currentElm = this;

        if ( window ) {
            window.setTimeout(() => {
                if (currentElm.alertMessagingInnerContainer !== null) {
                    setBodyMargin( 1, currentElm.alertMessagingInnerContainer.offsetHeight );
                    PubSub.publish(topics.UPDATE_CRUISE_DETAIL_OVERVIEW, 'resizeC022');
                }
            }, 500 );
        }

        // TODO: OverlayLoad need not fire on mount, only when it is opened after the pageload.
        // analytics.overlayLoad();
        // analytics.clickTracking(this);

        if (this.props.alertType === 'cookie' && this.alertCookieMessage !== '' ) {
            let anchor = this.alertCookieMessage.getElementsByTagName('a')[0];

            if (typeof anchor !== 'undefined') {
                anchor.addEventListener('click', this.analyticsClickHandler);
            }
        }
    }
    analyticsClickHandler = (event) => {
        const labelText = analytics.getCamelCasedText(event.target.textContent);
        const tempObject = {
            linkText: `cookieAlert:${labelText}`,
            componentName: this.props.component
        };

        analytics.customClicks(tempObject);
    }

    componentWillUnmount() {
        if (this.props.alertType === 'cookie' && this.alertCookieMessage !== '' ) {
            let anchor = this.alertCookieMessage.getElementsByTagName('a')[0];

            if (typeof anchor !== 'undefined') {
                anchor.removeEventListener('click', this.analyticsClickHandler);
            }
        }
    }

    /**
     * Sets the state as disable when present date doesnt lie within display date of response object
     * @param {string} alertType type of popup
     */
    handleAlert = (alertType) => {
        if (alertType !== undefined) {
            setBodyMargin( -1, this.alertMessagingInnerContainer.offsetHeight );
        }

        this.setState({
            alert: 'disable'
        });

        if (alertType === 'cookie') {
            LocalStorage.setItem('cookiePopupDisplay', true);
        }

        // Required for C022 Component
        PubSub.publish(topics.UPDATE_CRUISE_DETAIL_OVERVIEW, 'resizeC022');
    }

    /**
     * For handling Analytics(on anchor) present in alert Text which we get as rich text from backend
     * Also return the object if alertType is sitewise
     * @param  {object} e is event object used for getting selected target value
     */
    handleAnalytics = (e) => {
        if (e.target.nodeName === 'A') {
            const analyticsParams = {
                linkText: e.target.textContent,
                componentName: this.props.component
            };

            analytics.customClicks(analyticsParams);
        }
    }

    render() {

        const { alertType, alertMessage, closeLabel, enableAlertIcon } = this.props;

        let analyticsCloseLabel = analytics.getCamelCasedText(closeLabel);

        const closeLabelLinktext = (alertType === 'cookie') ? `cookieAlert:${ analyticsCloseLabel }` : analyticsCloseLabel;
        const cookieClass = (alertType === 'cookie') ? 'alert-cookie' : '';

        if ( this.state.alert === 'enable' ) {
            return (
                <div className='alert-messaging-inner-container' ref={ alertMessagingInnerContainer => this.alertMessagingInnerContainer = alertMessagingInnerContainer }>
                    { enableAlertIcon === 'true' &&
                        <div className='alert-icon'></div>
                    }
                    <div className={`alert-text ${ cookieClass }`} dangerouslySetInnerHTML={ { __html: alertMessage } } ref={ alertCookie =>  this.alertCookieMessage = cookieClass && alertCookie }/>
                    <button
                        aria-label={ closeLabel }
                        className='close'
                        data-linktext={ closeLabelLinktext }
                        onClick={ () => this.handleAlert(alertType) } >
                            <span className='close-label'>{ closeLabel }</span>
                            <span className='close-icon'></span>
                    </button>
                </div>
            );
        }
        else return null;
    }
}

export default Alert;