import React from 'react';
import Image from '../commons/CUK/image';
import SessionStorage from '../commons/CUK/session-storage';
import fetchData from '../commons/CUK/fetch-data';
import analytics from '../commons/CUK/analytics';
import { getConfig, callForPaymentMonitoring } from '../commons/CUK/utilities';
import { checkCookie, getCookie } from '../commons/CUK/cookies';
import moment from 'moment';


class paymentRedirection extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            message: this.props.description
        };
    }

    componentDidMount() {
        const isHybrisPaymentSolutionEnabled = getConfig('isHybrisPaymentSolutionEnabled') || 'false';
        const valueOfHybrisPaymentSolutionCookie = getCookie('HybrisPaymentSolution');
        const isHybrisPaymentSolutionActive = ((valueOfHybrisPaymentSolutionCookie == 'true' ? true : false) || (!checkCookie("HybrisPaymentSolution") && (isHybrisPaymentSolutionEnabled == 'true' || isHybrisPaymentSolutionEnabled == 'True')))
        if (!isHybrisPaymentSolutionActive) { this.getPaymentStatus(); }
        const url = window.location.href;
        const isAnalyticsParams = url.indexOf('?') !== -1;
        const typeOfError = ['decline', 'error', 'refer'];
        let paymentFail = '';
        if (isAnalyticsParams) {
            const modifiedUrl = url.split('/');
            if (modifiedUrl.length) {
                if (modifiedUrl[modifiedUrl.length - 1].indexOf('?') !== -1) {
                    paymentFail = modifiedUrl[modifiedUrl.length - 1].substring(0, modifiedUrl[modifiedUrl.length - 1].indexOf('?'));
                }
            }
        }
        if (paymentFail !== '' && typeOfError.includes(paymentFail)) {
            switch (paymentFail) {
                case 'decline':
                    paymentFail = 'declined';
                    break;
                case 'error':
                    paymentFail = 'errored';
                    break;
                case 'refer':
                    paymentFail = 'referred';
                    break;
                default:
                    paymentFail = 'failed';
                    break;
            }
        }
        analytics.setAdditionalPageTrackAttributes({
            paymentFail: paymentFail
        })
        this.excuteCallForPaymentMonitoring('', '', '200');
    }

    excuteCallForPaymentMonitoring(apiEndPoint, iframePxPUrl, responseCode) {
        const pageName = getConfig('pageName', '');
        const billingAddress = SessionStorage.getItem('billingAddress');
        const cruiseData = SessionStorage.getItem('cruiseData');
        const isHybrisPaymentSolutionEnabled = getConfig('isHybrisPaymentSolutionEnabled') || 'false';
        const valueOfHybrisPaymentSolutionCookie = getCookie('HybrisPaymentSolution');
        const isHybrisPaymentSolutionActive = ((valueOfHybrisPaymentSolutionCookie == 'true' ? true : false) || (!checkCookie("HybrisPaymentSolution") && (isHybrisPaymentSolutionEnabled == 'true' || isHybrisPaymentSolutionEnabled == 'True')))

        const postData = {
            id: `${pageName.substr(pageName.lastIndexOf(':') + 1, pageName.length)}-${new Date().valueOf()}-${Math.random()}`,
            type: isHybrisPaymentSolutionActive ? "checkout pre auth" : "checkout",
            endPoint: apiEndPoint !== '' ? `${apiEndPoint}` : 'none',
            date: moment().format('YYYY-MM-DD'),
            pageName: `${pageName.substr(pageName.lastIndexOf(':') + 1, pageName.length)}`,
            project: "MyCruise",
            "user-agent": `${navigator.userAgent}`,
            sessionId: getCookie('mbox'),
            transactionId: billingAddress.clientSystemTransactionId ? `${billingAddress.clientSystemTransactionId}` : '',
            locale: getConfig('locale'),
            userCountry: `${(Intl.DateTimeFormat().resolvedOptions().timeZone)}`,
            brand: getConfig('brand'),
            cruiseID: cruiseData && cruiseData.sailingId,
            bookingCompleted: false,
            threeDSConfigured: isHybrisPaymentSolutionActive ? true : false,
            apiName: iframePxPUrl !== '' ? `${iframePxPUrl}` : 'none',
            errorCode: responseCode == "200" ? "200" : `${responseCode}`,
            errorDescription: responseCode == "200" ? "none" : 'iframe non loaded',
            status: responseCode == '200' ? true : false
        }

        callForPaymentMonitoring(postData)
            .then((res) => {
                // do nothing;
            })
            .catch((err) => {
                console.log('err', err)
            })
    }

    getPaymentStatus = () => {
        let { description } = this.props;
        let billingDetails = SessionStorage.getItem('billingAddress');
        const url = this.props.referenceAPIServlet;
        const merchantId = this.props.merchantId;
        const errors = this.props.errorLabels.pxp;
        let search = window.location.search;
        let isIE = /*@cc_on!@*/false || (typeof document !== 'undefined' && !!document.documentMode);
        let params;
        let clientsysId;

        if (isIE) {
            clientsysId = this.decodeUrlParam('crId')
        }
        else {
            params = new URLSearchParams(search);
            clientsysId = params.get('crId');
        }
        let obj = {};
        obj.merchantId = merchantId;
        const clientValue = SessionStorage.getItem('clientTransactionId');

        obj.clientSystemTransactionId = clientValue;
        fetchData(url, {
            method: 'POST',
            body: JSON.stringify(obj)
        }).then((res) => {
            if (res.code && errors[res.code]) {
                description = errors[res.code];

            }
        }).catch((error) => {
            console.log(error);
        });

        this.setState({
            message: description
        });
    };

    render() {
        const { image } = this.props;
        const header = SessionStorage.getItem('header');
        const { agent } = header;
        return (
            <div className="confirmation-hero-cont">
                <div className="full-image">
                    {image && <Image {...image} />}
                </div>
                <div className="conf-wrap">
                    <div className="confirmation-hero-text">
                        <h2 className="booking-title">
                            {' '}
                            {typeof agent == 'undefined' ? this.state.message : this.props.descriptionCCA}{' '}
                        </h2>
                    </div>
                </div>
            </div>
        );
    }
}

export default paymentRedirection;
