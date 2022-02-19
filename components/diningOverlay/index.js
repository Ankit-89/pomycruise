/*
 * React Modal
 *
 * For examples and features: https://github.com/davidtheclark/react-aria-modal
 */
'use strict';

import React from 'react';
import ReactAriaModal from 'react-aria-modal';

import DiningForm from './diningForm';
import DiningEventForm from './diningEventForm';

import scroller from '../commons/CUK/scroller';
import {
    VIEWPORT_TYPE,
    watchForBreakpoint
} from '../../library/js/config/breakpoints';

import fetchData from '../commons/CUK/fetch-data';
import PubSub from '../commons/CUK/pubsub';
import topics from '../../library/js/config/topics';
import SessionStorage from '../commons/CUK/session-storage';
import Loader from '../commons/CUK/loader';

// import { getCountryCode } from '../commons/CUK/utility';

class diningOverlay extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            showError: false,
            errorMsg: '',
            extCode: '',
            showThrobber: false,
        };
    }

    componentDidMount() {
        const mqlLVP = watchForBreakpoint(VIEWPORT_TYPE.DESKTOP);

        this.handleResize(mqlLVP);
        mqlLVP.addListener((mql) => {
            this.handleResize(mql);
        });
    }

    handleResize(mql) {
        this.setState(() => ({
            verticallyCenter: mql.matches
        }));
    }

    onEnter = () => {
        const picturefill = require('picturefill');

        this.content = typeof document !== 'undefined' && document.querySelector('.aria-modal');
        this.scroller = scroller({
            element: this.content,
            callback: this.handleScroll
        });

        picturefill();

        this.getData();
    };

    onExit = () => {
        const { onExit } = this.props;

        this.setState(() => ({
            showError: false,
            hideLabel: false,
            formData: undefined
        }));

        onExit && onExit(false);
    };

    handleScroll(ev) {
        const topPosition = this.content.getBoundingClientRect().top;

        this.setState((prevState) => {
            const { hideLabel } = prevState;
            if (topPosition > -20 && hideLabel) {
                return { hideLabel: true };
            } else if (topPosition <= -20 && !hideLabel) {
                return { hideLabel: false };
            } else {
                return {};
            }
        });
    }

    scrollToTop(ev) {
        const {
            parentNode: { parentNode }
        } = ev;
        const { content } = this;
        const { trackBackButton } = this.props;

        parentNode ? (parentNode.scrollTop = 0) : (content.scrollTop = 0);

        typeof trackBackButton === 'function' ? trackBackButton() : null;
    }

    getApplicationNode() {
        typeof document !== 'undefined' && document.querySelector('.wrapper');
    }

    getData() {
        const { chosenProduct, services, headerData, name, venue } = this.props;
        // const urlString = `${services.urls.instancesApi}?productCode=${chosenProduct.code}`;
        /* let urlString = `${services.urls.diningOverlayApi.replace(
             '{{shipCode}}_{{code}}',
             chosenProduct.externalCode
         )}`;  */

        const userData = SessionStorage.getItem('userData');
        const { shipCode } = userData;
        let externalCode = chosenProduct.externalCode ? chosenProduct.externalCode : `${chosenProduct.id}`;
        let urlString = `${services.urls.diningOverlayApi.replace("{{shipCode}}_{{code}}",
            externalCode
        )}`;
        // urlString = urlString.replace('{{shipCode}}', shipCode);
        this.setState({
            extCode: externalCode,
            showThrobber: true,
        });
        const apiKeyy =
            typeof window !== 'undefined'
                ? window.configs.apikeyMycruise
                : '';


        fetchData(urlString, {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Accept-Encoding': 'gzip,deflate',
                'X-CommonData': JSON.stringify(headerData.header),
                'X-Source-Identity-Token-0': apiKeyy
                //'X-Source-Identity-Token-0': headerData.apiKey // YD hard coding api key for now 27-07-19
            }
        }).then(
            (formData) => this.setState(() => ({
                formData,
                showThrobber: false
            })),
            (errArray) => { }
        );
    }

    showConfirmation = (currency, total, numberOfItems) => {
        const { onExit, chosenProduct } = this.props;
        let productName = chosenProduct.name ? chosenProduct.name : this.props.name ? this.props.name : '';
        this.onExit();
        PubSub.publish(topics.ADD_TO_CART, {
            name: productName,
            total,
            currency,
            numberOfItems
        });
    };

    showError = (errors) => {
        const { labels } = this.props;
        switch (errors[0].errorType) {
            case 'INSTANCE_IS_NOT_AVAILABLE':
                this.setState(() => ({
                    showError: true,
                    errorMsg:
                        errors[0].availableStock > 0
                            ? labels.errorLimitedAvailability
                            : labels.errorOutOfStockInstance
                }));
                break;
            case 'INSTANCE_OUT_OF_TABLE':
                this.setState(() => ({
                    showError: true,
                    errorMsg: labels.errorNoPurchasable
                }));
                break;
            case 'PRODUCT_OUT_OF_STOCK':
                this.setState(() => ({
                    showError: true,
                    errorMsg: labels.errorOutOfStockInstance
                }));
                break;
        }
        this.getData();
        // scroll up to show the error
        this.scrollToTop(
            document.getElementsByClassName('modal-content-wrapper')[0]
        );
    };

    render() {
        const {
            onExit,
            baseDialogClass,
            baseUnderlayClass,
            underlayClass,
            dialogClass,
            labels,
            chosenProduct,
            services,
            dates,
            headerData,
            name
        } = this.props;
        const { hideLabel, showError, errorMsg, formData, showThrobber } = this.state;

        let eventType =
            typeof window !== 'undefined'
                ? window.configs.eventType
                : undefined;

        let venueType = 'speciality';

        if (this.state.extCode && this.state.extCode.indexOf('CC') > -1) {
            venueType = 'COOKERY';
        }

        if (this.state.extCode && this.state.extCode.indexOf('LC') > -1) {
            venueType = 'ENTERTAINMENT';
        }
        return (
            <ReactAriaModal
                {...this.props}
                dialogClass={`${baseDialogClass} ${dialogClass}`}
                underlayClass={`${baseUnderlayClass} ${underlayClass}`}
                titleText={`Dining ${
                    chosenProduct.venueType !== 'DINING' ? 'Event ' : ''
                    }Configuration`}
                verticallyCenter={false}
                getApplicationNode={this.getApplicationNode}
                includeDefaultStyles={false}
                onEnter={this.onEnter}
            >
                {showThrobber && (
                    <div className="throbberOverlay">
                        <Loader show={showThrobber} />
                        <p className="throbberOverlay__text">
                            {this.props.labels.diningOverlayLoadingImageLabel}
                        </p>
                    </div>
                )}
                <div className="modal-close-wrap">
                    <button
                        className="close"
                        data-linktext={`${labels.closeLabel}`}
                        aria-label={`${labels.closeLabel}`}
                        onClick={onExit}
                        ref={(close) => (this.close = close)}
                    >
                        <span
                            className={`close-label ${
                                hideLabel ? 'fade-out' : ''
                                }`}
                        >
                            {labels.closeLabel}
                        </span>
                    </button>
                </div>
                <div className={`modal-content-wrapper`}>
                    <div className="modal-content">
                        {showError && (
                            <div className="modal-error">
                                <p>{errorMsg}</p>
                            </div>
                        )}
                        <div className="modal-header">
                            <h1 className="title">{name}</h1>
                            <p className="paragraph">
                                {chosenProduct.description}
                            </p>
                            {chosenProduct.venueType !== 'COOKERY' && (
                                <div className="disclaimerMessage">
                                    {labels.disclaimerMessage}
                                </div>
                            )}
                        </div>
                        {formData &&
                            // (chosenProduct.venueType !== 'DINING' 

                            ("speciality" === venueType ? (
                                <DiningForm
                                    type={chosenProduct.venueType}
                                    labels={labels}
                                    formData={formData}
                                    services={services.urls}
                                    errorHandler={this.showError}
                                    successHandler={this.showConfirmation}
                                    dates={dates}
                                    headerData={headerData}
                                    name={name}
                                />
                            ) : (
                                    <DiningEventForm
                                        type={venueType}
                                        labels={labels}
                                        formData={formData}
                                        services={services.urls}
                                        errorHandler={this.showError}
                                        successHandler={this.showConfirmation}
                                        dates={dates}
                                        headerData={headerData}
                                        name={name}
                                    />
                                ))}
                    </div>
                </div>
            </ReactAriaModal>
        );
    }
}

diningOverlay.defaultProps = {
    baseUnderlayClass: 'aria-modal-underlay',
    baseDialogClass: 'aria-modal',
    underlayClass: '',
    dialogClass: ''
};

export default diningOverlay;
