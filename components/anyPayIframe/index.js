import React from 'react';
import SessionStorage from '../commons/CUK/session-storage';
import fetchData from '../commons/CUK/fetch-data';
import { getConfig, callForPaymentMonitoring } from '../commons/CUK/utilities';
import { checkCookie, getCookie } from '../commons/CUK/cookies';
import moment from 'moment';
import TitleH1Mycruise from '../titleH1Mycruise';

class anyPayIframe extends React.Component {
    constructor(props) {
        super(props);
        this.loadTracking = true;

        this.state = {
            iframeUrl: '',
            hasError: false,
            isHybrisPaymentSolutionEnabled: getConfig('isHybrisPaymentSolutionEnabled') || 'false',
        };
    }

    checkout = () => {
        const { psdenableCC, isIframeEnableCC } = this.props;
        SessionStorage.setItem('paymentComplete', false);
        // const shipCode = getConfig('shipCode', '');
        const intermediateConfirmationLoaderUrl = getConfig('intermediateConfirmationLoaderPageUrl');
        const header = SessionStorage.getItem('header');
        let { checkoutServlet, psdStoreId, psdUserId, merchantId, psdSkinId } = this.props;
        let url = checkoutServlet;
        let billingDetails = SessionStorage.getItem('billingAddress');
        let transactionId = billingDetails.clientSystemTransactionId;
        let obj = {};
        const { agent } = header;
        if (typeof agent !== 'undefined') {
            if ((agent.agentType && agent.agentType === 'customerServiceAgent') || (agent.agentType && agent.agentType === 'travelAgencyAgent')) {
                obj.type = 'mailorder.sale';
            }
        }
        else {
            obj.type = 'ecom.sale';
        }
        obj.merchantId = merchantId;
        obj.storeId = psdStoreId;
        obj.clientSystemTransactionId = transactionId;
        obj.amount = billingDetails.amount;
        if (billingDetails.amount === 0) {
            obj.type = 'ecom.accountVerification';
            delete obj.amount;
        }
        obj.currencyCode = billingDetails.currency;
        obj.userId = psdUserId;
        let confirmationlink = `${intermediateConfirmationLoaderUrl}?status=success`;
        let returnlink = `${intermediateConfirmationLoaderUrl}?status=failed`;
        let refusedlink = `${intermediateConfirmationLoaderUrl}?status=failed`;
        let cancellink = `${intermediateConfirmationLoaderUrl}?status=failed`;
        let pendinglink = `${intermediateConfirmationLoaderUrl}?status=failed`;
        let errorlink = `${intermediateConfirmationLoaderUrl}?status=failed`;
        obj.redirectDetails = {};
        obj.redirectDetails.returnUrl = returnlink + '&crId=' + transactionId;
        obj.redirectDetails.successUrl =
            confirmationlink + '&crId=' + transactionId;
        obj.redirectDetails.refusedUrl = refusedlink + '&crId=' + transactionId;
        obj.redirectDetails.cancelUrl = cancellink + '&crId=' + transactionId;
        obj.redirectDetails.pendingUrl = pendinglink + '&crId=' + transactionId;
        obj.redirectDetails.errorUrl = errorlink + '&crId=' + transactionId;

        obj.addressVerificationDetails = {};
        obj.addressVerificationDetails['address'] = billingDetails.line1 + ',' + billingDetails.line2;
        obj.addressVerificationDetails['zipPostalCode'] = billingDetails.postalCode;
        const locale = getConfig('locale', '').substring(0, getConfig('locale', '').indexOf("_")).toLowerCase();

        obj.checkoutDetails = {};
        obj.checkoutDetails.language = locale;
        obj.checkoutDetails.skinId = psdSkinId;
        obj.addressDetails = {};
        obj.addressDetails.billingAddress = {};
        obj.addressDetails.billingAddress['houseNumber'] = billingDetails.line1.length > 10 ? billingDetails.line1.substring(0,10) : billingDetails.line1;
        obj.addressDetails.billingAddress['street'] = billingDetails.line1;
        obj.addressDetails.billingAddress['zipPostalCode'] = billingDetails.postalCode;
        obj.addressDetails.billingAddress['city'] = billingDetails.town;
        obj.addressDetails.billingAddress['countryCode'] = billingDetails.isoCode;
        obj.addressVerificationDetails['countryCode'] = billingDetails.isoCode;

        if (typeof agent !== 'undefined') {
            if (agent.agentType && agent.agentType === 'customerServiceAgent') {
                const syntecDetails = {}
                syntecDetails['syntecSolution'] = true;
                if (isIframeEnableCC == 'true') {
                    obj.syntecDetails = syntecDetails;
                }

                if (getCookie('isSyntecEnabledForCCA') && getCookie('isSyntecEnabledForCCA') == "true") {
                    obj.syntecDetails = syntecDetails;
                } else if (getCookie('isSyntecEnabledForCCA') && getCookie('isSyntecEnabledForCCA') == "false") {
                  delete obj.syntecDetails;  
                }

            }
        }

        fetchData(url, {
            method: 'POST',
            body: JSON.stringify(obj)
        })
            .then((res) => {
                const responseCode = res.error || res.errors ? res : '200';
                if (res.error || res.errors) {
                    console.log('error response');
                    console.log(res, res.status);
                    this.setState({
                        hasError: true
                    })
                } else {
                    console.log(res, res.status);
                    let redirectUrl = res.redirectUrl;
                    console.log(redirectUrl);
                    this.setState({
                        iframeUrl: redirectUrl,
                        hasError: res.redirectUrl && res.redirectUrl == '' ? true : false
                    }, () => {
                        this.excuteCallForPaymentMonitoring(url, redirectUrl, responseCode);
                        document
                                .getElementById('HolderName')
                                .setAttribute('class', 'abc');
                    });
                }
            })
            .catch((error) => {
                this.setState({
                    hasError: true
                })
                console.log(error.JSON);
            });
    };

    checkoutCallThroughHybris = () => {
        const { isIframeEnableCC } = this.props;
        const apiKey = getConfig('apikeyMycruise', '');
        const userId = 'current';
        const cartId = 'current';
        const baseSiteId = 'PO-Site';
        const header = SessionStorage.getItem('header');
        const billingDetails = SessionStorage.getItem('billingAddress');
        const hybrisPaymentSolutionAPIURL = getConfig('hybrisPaymentSolutionAPIURL') || `/${baseSiteId}/users/${userId}/carts/${cartId}/paymenturl`;
        const url = hybrisPaymentSolutionAPIURL.replace('<baseSiteId>', baseSiteId).replace('<userId>', userId).replace('<cartId>', cartId);

        const postObject = {
            billingAddress: {
                title: billingDetails.title,
                firstName: billingDetails.firstName,
                lastName: billingDetails.lastName,
                streetNumber: billingDetails.line1.length > 10 ? billingDetails.line1.substring(0,10) : billingDetails.line1,
                line1: billingDetails.line1,
                line2: billingDetails.line2,
                town: billingDetails.town,
                postalCode: billingDetails.postalCode,
                email: billingDetails.email
            }
        };

        let country = {};
        country['isocode'] = billingDetails.country;
        postObject.billingAddress['country'] = country;

        if (typeof header.agent !== 'undefined') {
            if (header.agent.agentType && header.agent.agentType === 'customerServiceAgent') {
                const syntecDetails = {}
                syntecDetails['syntecSolution'] = true;
                if (isIframeEnableCC == 'true') {
                    postObject.syntecDetails = syntecDetails;
                }

                if (getCookie('isSyntecEnabledForCCA') && getCookie('isSyntecEnabledForCCA') == "true") {
                    postObject.syntecDetails = syntecDetails;
                } else if (getCookie('isSyntecEnabledForCCA') && getCookie('isSyntecEnabledForCCA') == "false") {
                  delete postObject.syntecDetails;  
                }

            }
        }

        fetchData(url, {
            method: 'POST',
            body: JSON.stringify(postObject),
            headers: {
                'X-CommonData': JSON.stringify(header),
                'X-Source-Identity-Token-0': apiKey,
                'Content-type': 'Application/json'
            }
        })
            .then((res) => {
                const responseCode = res.error || res.errors ? res : '200';
                if (res.error || res.errors) {
                    this.setState({
                        hasError: true
                    })
                    console.log('error response', res.status);
                } else {
                    console.log('response', res.status);
                    this.setState({
                        iframeUrl: res.redirectUrl,
                        orderNumber: res.orderNumber,
                        hasError: res.redirectUrl && res.redirectUrl == '' ? true : false
                    }, () => {
                        SessionStorage.setItem('orderResponse', res);
                        this.excuteCallForPaymentMonitoring(url, res.redirectUrl, responseCode);
                    });
                }
            })
            .catch((error) => {
                this.setState({
                    hasError: true
                })
                console.log(error.JSON);
            });
    };

    getPxpIframeUrl = () => {
        let iframeUrl = typeof window !== 'undefined'
            ? SessionStorage.getItem('anyPayurl')
            : '';
        this.setState({
            iframeUrl: iframeUrl
        });
    };

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

    componentDidMount = () => {
        const { isHybrisPaymentSolutionEnabled } = this.state;
        const valueOfHybrisPaymentSolutionCookie = getCookie('HybrisPaymentSolution');
        const isHybrisPaymentSolutionActive = ((valueOfHybrisPaymentSolutionCookie == 'true' ? true : false) || (!checkCookie("HybrisPaymentSolution") && (isHybrisPaymentSolutionEnabled == 'true' || isHybrisPaymentSolutionEnabled == 'True')))
        if (isHybrisPaymentSolutionActive) {
            this.checkoutCallThroughHybris();
        } else {
            if (SessionStorage.getItem('analyticsData')) {
                this.setState({
                    analyticsPageLoadData: SessionStorage.getItem('analyticsData')
                });
            }
            const shipcode = getConfig('shipCode', '');
            const brand = getConfig('brand', '')
            const locale = getConfig('locale', '').replace('_', '-').toLowerCase();
            const header = SessionStorage.getItem('header');
            const { agent } = header;
            let billingDetails = SessionStorage.getItem('billingAddress');
            let { syntecUrl, psdStoreId, psdUserId, syntecCustId, syntecEpId } = this.props;
            let isIframeEnableCC = this.props.isIframeEnableCC === 'true' ? true : false;

            if (typeof agent !== 'undefined') {
                if (agent.agentType && agent.agentType === 'customerServiceAgent' && isIframeEnableCC === false) {
                    let iframeUrl = `${syntecUrl}?custid=${syntecCustId}&epid=${syntecEpId}&amount=${billingDetails.amount}&clientSystemTransactionId=${billingDetails.clientSystemTransactionId}&address=${billingDetails.streetNumber} ${billingDetails.line1} ${billingDetails.line1}  &zipPostalCode=${billingDetails.postalCode}&countryCode=GBR&language=${locale}&env=dev.my-np&shipCode=${shipcode}&storeId=${psdStoreId}&userId=${psdUserId}&type=mailorder.sale&currencyCode=GBP&brand=${brand}`;
                    this.setState({
                        iframeUrl: iframeUrl

                    });
                }
                else {
                    this.checkout();
                }
            }
            else {
                this.checkout();
            }
        }
    };

    render() {
        const { error }= this.props;
        const titleH1Props = {
            title: error,
            description: '',
            type: 'h2'
        };

        if ( this.state.hasError ) {
            return <TitleH1Mycruise {...titleH1Props} />;
        }

        return (
            <div>
                <div width="100%" className="anypay-iframe" >
                    <iframe
                        src={this.state.iframeUrl}
                        width="100%"
                        height="100%"
                        tabIndex="-1"
                        style={{ minHeight: '800px' }}
                    />
                </div>
            </div>
        );
    }
}

export default anyPayIframe;
