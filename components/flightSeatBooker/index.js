'use strict';

import React from 'react';
import analytics from '../commons/CUK/analytics';
import SessionStorage from '../commons/CUK/session-storage';
import FetchData from '../commons/CUK/fetch-data';
import { getConfig } from '../commons/CUK/utilities';
const ERROR_CODES = {
    START_SALE_DATE_NOT_MET: 'notOnSaleYet',
    STOP_SALE_DATE_PASSED: 'notOnSaleAnymore'
};
class flightSeatBooker extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ccaTaLink: ''
        };
        // console.log('inside constructor of Flight seat booker...', this.props);
    }

    componentWillMount() {
        this.checkUrlEncrypted();
    }

    checkUrlEncrypted = () => {
        const apikeyMycruise = getConfig('apikeyMycruise', '');
        const dataEncryptionUrl = getConfig('dataEncryptionUrl', '');
        const header = SessionStorage.getItem('header');
        const { agent, bookingRef, brandCode } = header;
        const url = dataEncryptionUrl;
        const requestBody = {};
        if (agent && agent.agentType === 'customerServiceAgent') {
            requestBody['stringToEncrypt'] = `networkId:${
                agent.id
            }|bkRef:${bookingRef}|brand:${brandCode}`;
        } else if (agent && agent.agentType === 'travelAgencyAgent') {
            requestBody['stringToEncrypt'] = `abta:${
                agent.id
            }|aURN:|bkRef:${bookingRef}`;
        }

        if (agent) {
            const requestHeaders = {
                'Content-Type': 'application/json',
                'X-Source-Identity-Token-0': apikeyMycruise
            };
            return FetchData(url, {
                method: 'POST',
                body: JSON.stringify(requestBody),
                headers: requestHeaders
            }).then((res) => {
                this.setState({
                    ccaTaLink: res && res.encryptedString
                });
            });
        }
    };

    render() {
        const { title, bodyText1, bodyText2, ctaLink } = this.props;
        const { ccaTaLink } = this.state;
        const newctaLink =
            ccaTaLink != ''
                ? `${ctaLink.url}?string=${ccaTaLink}`
                : ctaLink.url;
        return (
            <div className="simpleText">
                <div className="simple-textAux">
                    <div className="simple-text-title">{title}</div>
                    <div
                        className="simple-text-body-text"
                        dangerouslySetInnerHTML={{ __html: bodyText1 }}
                    />
                    {bodyText2 && (
                        <div className="simple-text-body-text simple-text-body-text-small">
                            {bodyText2}
                        </div>
                    )}
                    {ctaLink && (
                        <a
                            className="simple-text-cta"
                            href={newctaLink}
                            data-linktext={ctaLink.label}
                            data-componentname={'simpleText'}
                        >
                            {ctaLink.label}
                        </a>
                    )}
                </div>
            </div>
        );
    }
}

export default flightSeatBooker;
