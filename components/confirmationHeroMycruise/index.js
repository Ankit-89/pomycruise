import React from 'react';
import Image from '../commons/CUK/image';
// import Link from '../commons/link';
// import analytics from '../commons/analytics';
// import { dateFormat } from '../commons/dateFormat';
// import TitleH1Mycruise from '../titleH1Mycruise';
import SessionStorage from '../commons/CUK/session-storage';
import PubSub from '../commons/CUK/pubsub';
import topics from '../../library/js/config/topics';
import fetchData from '../commons/CUK/fetch-data';
import { plainDateFormat } from '../commons/CUK/dateFormat';
import { getConfig, callForPaymentMonitoring } from '../commons/CUK/utilities';
import { checkCookie, getCookie } from '../commons/CUK/cookies';
import moment from 'moment';

class confirmationHeroMycruise extends React.Component {
    constructor(props) {
        super(props);
        this.loadTracking = true;
        this.state = {
            emailAddress: '',
            bookingNumber: '',
			isHybrisPaymentSolutionEnabled: false,
            orderId: false,
            zeroPayment: false
        };
    }

    componentWillMount() {
        let orderId = null;
        const url = window.location.href;
        if (url.indexOf('?') != -1) {
            orderId = this.getParameterByName('orderId', url);
            if (orderId) {
                const billingDetails = SessionStorage.getItem('billingAddress');
                this.setState({
                    orderId: orderId,
                    zeroPayment: true,
                    bookingNumber: orderId,
                    emailAddress: billingDetails.email
                });
            }
        }
    }
    componentDidMount = () => {
        if (!this.state.orderId && !this.state.zeroPayment) {
            const isHybrisPaymentSolutionEnabled  = getConfig('isHybrisPaymentSolutionEnabled') || 'false';
            const valueOfHybrisPaymentSolutionCookie = getCookie('HybrisPaymentSolution');
            const isHybrisPaymentSolutionActive = ((valueOfHybrisPaymentSolutionCookie == 'true' ? true : false) || (!checkCookie("HybrisPaymentSolution") && (isHybrisPaymentSolutionEnabled == 'true' || isHybrisPaymentSolutionEnabled == 'True')))
            const url = window.location.href;
            if(url.indexOf('?') != -1){
                if(!isHybrisPaymentSolutionActive){
                    this.getTranscationReference ();
                }else{
                    this.callForSqsQueue();
                    this.excuteCallForPaymentMonitoring('','','200');
                }
            }
            else {
            let orderNumber =typeof window !== 'undefined'
                            ? window.location.hash.substring(1)
                            : '';
            this.setState({
            bookingNumber: orderNumber
                });
            this.triggerEmail = PubSub.subscribe(
                        topics.BILLING_ADD_MAIL,
                        this.listenEmail
                    );

                }
            if (SessionStorage.getItem('analyticsData')) {
                    this.setState({
                        analyticsPageLoadData: SessionStorage.getItem('analyticsData')
                    });
                }
        }
        
    };
    getParameterByName = (name, url = window.location.href) => {
        name = name.replace(/[\[\]]/g, '\\$&');
        var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, ' '));
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

    getTranscationReference = () => {
        const url = this.props.referenceAPIServlet;
        const merchantId   = this.props.merchantId ;    
        let billingDetails = SessionStorage.getItem('billingAddress');
        let obj = {};
        obj.merchantId =merchantId;
        let search = window.location.search;
                //let isIE = /*@cc_on!@*/false || !!document.documentMode;
                //let params;
                // let clientsysId;

                // if(isIE){
                //     clientsysId= this.decodeUrlParam('crId')
                // }
                // else {
                //     params = new URLSearchParams(search);
                //     clientsysId = params.get('crId');
                // }
        
        const clientValue = SessionStorage.getItem('clientTransactionId');                
        obj.clientSystemTransactionId = clientValue;       
        fetchData(url, {
            method: 'POST',
            body: JSON.stringify(obj)
        }).then((res) => {
                if (res.error) {
                console.log('error getting transaction');
                   
                } else {
                    const isPaymentComplete = SessionStorage.getItem('paymentComplete') || false;
                    if (!isPaymentComplete) {
                        SessionStorage.setItem('paymentComplete', true);
                        this.finaliseOrder(res);
                    }
                }
            })
            .catch((error) => {
                console.log(error);
            });
    };

    callForSqsQueue = () => {
        const apiKey = getConfig('apikeyMycruise', '');
        const header = SessionStorage.getItem('header');
        const orderResponse = SessionStorage.getItem('orderResponse');
        const clientTransactionId = SessionStorage.getItem('clientTransactionId');
        const postData = {
            id: clientTransactionId,
            paymentData: orderResponse.paymentData
        }
        const sqsUrl = '/api-mc/v1/mc-payment/confirmation';
        fetchData(sqsUrl, {
            method: 'POST',
            headers: {
                'X-CommonData': JSON.stringify(header),
                'Content-Type': 'application/json',
                'X-Source-Identity-Token-0': apiKey
            },
            body: JSON.stringify(postData),
        })
            .then((response)=>{
                const billingDetails = SessionStorage.getItem('billingAddress');
                this.setState({
                    emailAddress: billingDetails.email,
                    bookingNumber: orderResponse.orderNumber,
					isHybrisPaymentSolutionEnabled: true
                });
            })
            .catch((error) =>{console.log('error', error)})
    }
    
    /**
     * Payment process last step: call Hybris API
     * @param {object} res pxp response
     */
    finaliseOrder = (res) => {
        const stopPxpReversalInCatch = getConfig('stopPxpReversalInCatch');
        const stopPxpReversalOnError = getConfig('stopPxpReversalOnError');
        let url = this.props.services.urls.finaliseOrderApi;
        let apikey =
            typeof window !== 'undefined' ? window.configs.apikeyMycruise : '';
        let header = SessionStorage.getItem('header');
        const headers = {
            'X-CommonData': JSON.stringify(header),
            'Content-Type': 'application/json',
            'X-Source-Identity-Token-0': apikey
        };
        let obj = {};

        let billingDetails = SessionStorage.getItem('billingAddress');
        res= res[0]; 
        obj.billingAddress = {};
        obj.billingAddress['title'] = billingDetails.title;
        obj.billingAddress['firstName'] = billingDetails.firstName;
        obj.billingAddress['lastName'] = billingDetails.lastName;
        obj.billingAddress['streetNumber'] = billingDetails.streetNumber;
        obj.billingAddress['line1'] = billingDetails.line1;
        obj.billingAddress['line2'] = billingDetails.line2;
        obj.billingAddress['town'] = billingDetails.town;
        obj.billingAddress['postalCode'] = billingDetails.postalCode;
        obj.billingAddress['email'] = billingDetails.email;

        let email = billingDetails.email;
 
        let country = {};
        //mock purpose
        country['isocode'] = billingDetails.country;
        let tokenizedcardnumber = res.accountDetails.tokenizedCardNumber;
        let transactionId = billingDetails.clientSystemTransactionId;
        let currencyCode = billingDetails.currency;
        let amount =  res.transactionAmount.toFixed(2);
        obj.billingAddress['country'] = country;
        obj.paymentInfo = {};
        obj.paymentInfo['approvalCode'] = res.stateDetails.approvalCode;
        obj.paymentInfo['tokenizedCardNumber'] =
            res.accountDetails.cardTokenizedNumber;
        obj.paymentInfo['transactionId'] = res.id;
        obj.paymentInfo['clientTransactionId'] = billingDetails.clientSystemTransactionId;
       // obj.paymentInfo['cardType'] = 'VIS' ;
        obj.paymentInfo['cardType'] = res.cardType.substring(res.cardType.lastIndexOf(".")+ 1).toUpperCase() ;
        obj.paymentInfo['merchantId'] = this.props.merchantId;
        obj.paymentInfo['storeId'] = billingDetails.storeId;
        obj.paymentInfo['capturedAmount']=  res.transactionAmount.toFixed(2);
        fetchData(url, {
            method: 'POST',
            body: JSON.stringify(obj),
            headers: headers
        }).then((res) => {
            try {
                const responseCode = res.errors ? res : '200';
				console.log('res: ', res);
                if (res.errors) {
                    // authorization reversal transaction
					if (res.status !== 409 && !stopPxpReversalOnError) {
						console.log('doing reversal in error');
                        this.reversalTransaction(tokenizedcardnumber, transactionId, amount, currencyCode);
                    }
                } else {
                    this.setState({
                        emailAddress: email,
                        bookingNumber: res.code
                    });
                    PubSub.publish(
                        topics.ORDER_ID,
                        res.code
                    );
                }
                this.excuteCallForPaymentMonitoring(url, '', responseCode)
            }
            catch (err) {
                // do nothing.
				console.log('do nothing inside catch');
            }
        }).catch((e)=>{
            if(!stopPxpReversalInCatch) {
				console.log('doing reversal in catch');
                this.reversalTransaction(tokenizedcardnumber,transactionId,amount,currencyCode);
            } 
        });
    };

    listenEmail = (msg, data) => {
        this.setState({
            emailAddress: data
        });
    };

    /**
     * If Hybris return an error at the finalize call, we have to reverse the already approved transaction
     * @param {String} transactionId transaction id created fe side
     */

    reversalTransaction(tokenizedCardNumber,origTransactionId,amount,currencyCode) {
        const userData = SessionStorage.getItem('userData');
        let bookingReference = userData.bookingRef;
        // let sequenceNumber = userData.customer.paxNumber;
        let sequenceNumber = '1';
        let date = plainDateFormat(new Date(), 'YYYYMMDDHHMMSS');
        //let transactionId = `${bookingReference}-${sequenceNumber}-${date}`;
		let transactionId = SessionStorage.getItem('clientTransactionId');                
        // Resource: POST /api/v5/transactions/[transactionId]/operations
        let url = this.props.servletTransaction;
        url = `${url}?transactionId=${transactionId}`;
        let obj = {};
        obj.merchantId = this.props.merchantId;
        obj.userId= this.props.userId;
        obj.storeId = this.props.storeId;
        obj.clientSystemTransactionId = transactionId;
        obj.clientSystemInvoiceId = origTransactionId;
        obj.type = 'reversalsale';
        obj.currencyCode = currencyCode;
        obj.amount = amount ;
        obj.accountDetails = {};
        obj.accountDetails['cardTokenizedNumber'] = tokenizedCardNumber;
        let redirectLink = window.configs.cancelPageUrl;
        fetchData(url, {
            method: 'POST',
            body: JSON.stringify(obj),
            headers: {
                'Content-Type': 'application/json'
            },
            mode: 'cors'
        }).then((res) => {
            window.location.href = `${redirectLink}?crId=${transactionId}&error=hybris`;
        });
    }


    render() {
        const { labels, image } = this.props;
        let displayMessage = labels.bookingConfirmationEmail.replace(
            '{emailAddress}',
            this.state.emailAddress
        );
        const {
            isHybrisPaymentSolutionEnabled,
            zeroPayment,
            orderId
        } = this.state;
        if (zeroPayment && orderId) {
            return (
                <div className="confirmation-hero-cont">
                    <div className="full-image">
                        {image && <Image {...image} />}
                    </div>
                    <div className="conf-wrap">
                        <div className="confirmation-hero-text">
                            <h2 className="booking-title">
                                {' '}
                                {isHybrisPaymentSolutionEnabled
                                    ? labels.bookingAcknowledgementMsg
                                    : labels.bookingConfirmationMsg}{' '}
                            </h2>
                            {this.state.emailAddress && (
                                <p
                                    className="confirmation-hero-par"
                                    dangerouslySetInnerHTML={{
                                        __html: displayMessage
                                    }}
                                />
                            )}
                            <span className="booking-msg">
                                {' '}
                                {labels.confirmationNumber}{' '}
                            </span>
                            <h3 className="booking-number">
                                {' '}
                                {this.state.bookingNumber}{' '}
                            </h3>
                        </div>
                    </div>
                </div>
            );
        } else {
            return (
                <div className="confirmation-hero-cont">
                    <div className="full-image">
                        {image && <Image {...image} />}
                    </div>
                    <div className="conf-wrap">
                        <div className="confirmation-hero-text">
                            <h2 className="booking-title">
                                {' '}
                                {isHybrisPaymentSolutionEnabled
                                    ? labels.bookingAcknowledgementMsg
                                    : labels.bookingConfirmationMsg}{' '}
                            </h2>
                            {this.state.emailAddress && (
                                <p
                                    className="confirmation-hero-par"
                                    dangerouslySetInnerHTML={{
                                        __html: displayMessage
                                    }}
                                />
                            )}
                            <span className="booking-msg">
                                {' '}
                                {labels.confirmationNumber}{' '}
                            </span>
                            <h3 className="booking-number">
                                {' '}
                                {this.state.bookingNumber}{' '}
                            </h3>
                        </div>
                    </div>
                </div>
            );
        }
    }
}

export default confirmationHeroMycruise;
