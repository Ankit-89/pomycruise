/**
 * Component - C050 - Not on sale anymore banner
 */
'use strict';

import React from 'react';
import NotificationBanner from '../../components/notificationBanner';
import analytics from '../commons/CUK/analytics';

class NotificationBannerClose extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isVisible: true
        };
    }
    onExit (){
        analytics.clickTracking(this);
        this.setState({
            isVisible: false
        });
    }
    
    render() {
        let labels = this.props;
        // console.log(this.state.isVisible)
        return (
            
            <div>
            { this.state.isVisible  &&
                <NotificationBanner {...labels}>
                     <span className='notificationBanner__close' onClick={(evt) =>this.onExit()}></span>
                </NotificationBanner>
            }
            </div>
        );
    }
}

export default NotificationBannerClose;
