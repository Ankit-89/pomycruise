'use strict';

import React from 'react';
import SessionStorage from '../commons/CUK/session-storage';
import Loader from '../commons/CUK/loader';
import { getConfig } from '../commons/CUK/utilities';
import FetchData from '../commons/CUK/fetch-data';

class eTicketPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showThrobber: true,
            count: 1,
            showGenericErrorMessage: false
        };
    }

    componentDidMount() {
        this.generateEticket()
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

    generateEticket() {
        const eticketServletUrl = getConfig('eTicketMicroServiceUrl', '');
        const isIE = /*@cc_on!@*/ false || !!document.documentMode;
        let key;
        if (isIE) {
            key = this.decodeUrlParam('id');
        } else {
            const params = new URLSearchParams(window.location.search);
            key = params.get('id');
        }
        key = window.atob(key);
        const apiKey = getConfig('apikeyMycruise', '');
        const encryptedDataForETicket = localStorage.getItem(
            'encryptedDataForETicket'
        )
            ? JSON.parse(localStorage.getItem('encryptedDataForETicket'))
            : {};
        const postData = {
            data: encryptedDataForETicket[`${key}`] || ''
        }
        const eticketurldataencryptionapi = getConfig('eTicketDataEncryptionUrl', '') || '/content/po/master_website/en_GB/mycruise.eticketurldataencryptionapi.json';
        const env = getConfig('microServiceApiParamEnvironment');
        const bookingRef = key.split('_')[2];
        FetchData(eticketServletUrl, {
            method: 'POST',
            body: JSON.stringify(postData),
            headers: {
                'Content-Type': 'application/json',
                'X-Source-Identity-Token-0': apiKey
            }
        })
            .then((response) => {
                const id = response.mctoken;
                FetchData(eticketurldataencryptionapi, {
                    method: 'POST',
                    body: JSON.stringify({ stringToEncrypt: `${bookingRef}` }),
                    headers: {
                        'X-Source-Identity-Token-0': apiKey,
                        'Content-type': 'Application/json'
                    }
                })
                    .then((res) => {
                        const bookingReference = res.encryptedString;
                        const getpdfapi = getConfig('eTicketMicroServiceGetPDFUrl', '') || "/api-mc/mc-microservice-eticket-getpdf/v1"
                        const url = `${getpdfapi}?id=${id}&env=${env}&ref=${encodeURIComponent(bookingReference)}`;
                        this.check_pdf_file_location(url)
                    })
            })
            .catch((err) => { });
    }

    check_pdf_file_location(url) {
        const apiKey = getConfig('apikeyMycruise', '');
        fetch(url, {
            method: 'GET',
            headers: {
                'X-Source-Identity-Token-0': apiKey
            }
        })
            .then(response => {
                this.handle_pdf_file_location_response(response, url);
            })
            .catch(err => {
                console.log('err', err)
            })
    }

    handle_pdf_file_location_response(response, url) {
        const eTicketMSXHits = getConfig('eTicketMSXHits') || 20;
        if (response.status == '200') {
            window.location.href = url;
        } else if (response.status == '404' || response.status == '403' || response.status == '400') {
            const { count } = this.state;
            this.setState({
                count: count + 1
            }, () => {
                if (this.state.count <= eTicketMSXHits) {
                    setTimeout(() => {
                        this.check_pdf_file_location(url);
                    }, 5000);
                }
                else {
                    //show generic message here
                    this.setState(() => ({
                        showGenericErrorMessage: true,
                        showThrobber: false
                    }));
                }
            })
        }
    }

    render() {
        //const style = { color: 'red' };
        const { showThrobber, showGenericErrorMessage } = this.state;
        return (
            <div className="">
                {showThrobber && (
                    <div className="throbberOverlay">
                        <Loader show={showThrobber} />
                        <p className="throbberOverlay__text">
                            {this.props.labels.eticketLoadingMessage}
                        </p>
                    </div>
                )}

                {showGenericErrorMessage && (
                    <p className="throbberOverlay__text">
                        {this.props.labels.genericErrorMessage}
                    </p>
                )}

            </div>
        );
    }
}

export default eTicketPage;
