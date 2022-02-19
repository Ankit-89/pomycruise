import React, { Component } from 'react';
import Link from '../link';
import SessionStorage from '../session-storage';
import Modal from '../modal';
import { getConfig } from '../utilities';
import { checkCookie, getCookie } from '../cookies';
import logoutHandler from '../logoutHandler';

class sessionLogout extends Component {
    constructor(props) {
        super(props);
        this.state = {
            seconds: getConfig('sessionIdleTime', 15) * 60,
            showModal: false
        };
        this.timer = 0;
    }

    componentDidMount() {
        const enableSessionTimeoutPrompt =
            getConfig('enableSessionTimeoutPrompt') == 'true' ||
            getConfig('enableSessionTimeoutPrompt') == true
                ? true
                : false;
        const valueOfSessionTimeoutPrompt =
            getCookie('enableSessionTimeoutPrompt') == 'true' ||
            getConfig('enableSessionTimeoutPrompt') == true
                ? true
                : false;
        if (enableSessionTimeoutPrompt || valueOfSessionTimeoutPrompt) {
            this.sessionTimeout();
        }
    }

    sessionTimeout = () => {
        if (this.state.seconds > 0) {
            this.timer = setInterval(this.updateTimer, 1000);
        }
        const header = SessionStorage.getItem('header');
        if (header) {
            window.addEventListener('mousemove', this.resetTimer);
            window.addEventListener('scroll', this.resetTimer);
            window.addEventListener('click', this.resetTimer);
            window.addEventListener('keyboard', this.resetTimer);
            window.addEventListener('touchend', this.resetTimer);
            window.addEventListener('touchmove', this.resetTimer);
        }
    };

    updateTimer = () => {
        const { sessionTimeoutRedirectURLs } = this.props;
        if (this.state.seconds > 0) {
            this.setState({ seconds: this.state.seconds - 1 });
        } else if (this.state.seconds == 0) {
            clearInterval(this.timer);
            this.setState({
                showModal: true
            });
            const header = SessionStorage.getItem('header');
            const selectedBeforeYouSailTab = SessionStorage.getItem(
                'selectedBeforeYouSailTab'
            );
            const { shipCode } = header;
            let newRedirectURL = window.location.href;
            if (
                (selectedBeforeYouSailTab != undefined ||
                    selectedBeforeYouSailTab == null) &&
                window.location.pathname.indexOf('before-you-sail') > -1
            ) {
                newRedirectURL =
                    window.location.href + '#' + selectedBeforeYouSailTab;
            }
            sessionTimeoutRedirectURLs.map((item) => {
                if (window.location.pathname.indexOf(item.keyword) > -1) {
                    let splitUrl = item.redirectURL.split('/mycruise');
                    let oldUrl = window.location.href.split('/' + shipCode);
                    newRedirectURL = oldUrl[0] + '/' + shipCode + splitUrl[1];
                }
            });
            SessionStorage.setItem('redirectPageUrl', newRedirectURL);
            SessionStorage.setItem(
                'deepLinkedPageUrl',
                newRedirectURL.toString()
            );
            SessionStorage.setItem('sessionRedirectPageUrl', newRedirectURL);
            //SessionStorage.removeItem('header');
            SessionStorage.removeItem('orderedList');
            SessionStorage.removeItem('portCalls');
        }
    };

    handleModalClose = () => {
        const linkUrl = window.configs.mycruiseLoginPageUrl.includes(
            '/mycruise/login'
        )
            ? window.configs.mycruiseLoginPageUrl
            : `${window.configs.mycruiseLoginPageUrl}/mycruise/login`;
        logoutHandler(linkUrl);
    };

    loginUrl = () => {
        const linkUrl = window.configs.mycruiseLoginPageUrl.includes(
            '/mycruise/login'
        )
            ? window.configs.mycruiseLoginPageUrl
            : `${window.configs.mycruiseLoginPageUrl}/mycruise/login`;
        logoutHandler(linkUrl);
    };

    resetTimer = () => {
        if (this.state.seconds > 0) {
            this.timer = 0;
            this.setState({ seconds: getConfig('sessionIdleTime', 15) * 60 });
            this.sessionTimeout;
        }
    };

    render() {
        const {
            sessionTimeoutIdlePromptTitle,
            sessionTimeoutIdlePromptDescription,
            sessionTimeoutIdlePromptCTALabel
        } = this.props;
        const { showModal } = this.state;
        let loginUrl = window.configs.mycruiseLoginPageUrl.includes(
            '/mycruise/login'
        )
            ? window.configs.mycruiseLoginPageUrl
            : `${window.configs.mycruiseLoginPageUrl}/mycruise/login`;

        return (
            showModal && (
                <Modal
                    mounted={showModal}
                    onExit={this.handleModalClose}
                    contentLabel="Session Timeout"
                    sessionClass="session-modal-dialog"
                    closeLabel=""
                >
                    <div className="model_body_session">
                        <h1>{sessionTimeoutIdlePromptTitle}</h1>
                        <p>{sessionTimeoutIdlePromptDescription}</p>
                    </div>

                    <div className="modal-btns_session">
                        <Link
                            ariaLabel={sessionTimeoutIdlePromptCTALabel}
                            url={loginUrl}
                            title={sessionTimeoutIdlePromptCTALabel}
                            linkClassName={`cta-primary`}
                            onClick={this.loginUrl}
                        >
                            {sessionTimeoutIdlePromptCTALabel}
                        </Link>
                    </div>
                </Modal>
            )
        );
    }
}

export default sessionLogout;
