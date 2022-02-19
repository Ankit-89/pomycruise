/*
 * React Modal
 *
 * For examples and features: https://github.com/davidtheclark/react-aria-modal
 */
'use strict';

import React from 'react';
import ReactAriaModal from 'react-aria-modal';

import SpaForm from './spaForm';

import scroller from '../commons/CUK/scroller';
import {
    VIEWPORT_TYPE,
    watchForBreakpoint
} from '../../library/js/config/breakpoints';

import { getConfig } from '../commons/CUK/utilities'

import PubSub from '../commons/CUK/pubsub';
import topics from '../../library/js/config/topics';
import SessionStorage from '../commons/CUK/session-storage';

class spaOverlay extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showError: false,
            errorMsg: ''
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
    };

    createFormData() {
        const { chosenProduct } = this.props;
        const formDataObj = chosenProduct.instances.reduce(
            (formDataObj, instance) => {
                if (!formDataObj[instance.externalCode]) {
                    formDataObj[instance.externalCode] = {};
                    formDataObj.instanceOptions.push({
                        value: instance.externalCode,
                        title: instance.externalCode
                    });
                }

                return formDataObj;
            },
            { instanceOptions: [] }
        );
    }

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

    showConfirmation = (currency, total, numberOfItems) => {
        const { onExit, chosenProduct } = this.props;

        onExit && onExit();

        PubSub.publish(topics.ADD_TO_CART, {
            name: chosenProduct.name,
            total,
            currency,
            numberOfItems
        });
    };

    showError = (errors) => {
        const { labels } = this.props;
        switch (errors[0].type) {
            case 'InsufficientStockError':
                this.setState(() => ({
                    showError: true,
                    errorMsg:
                        errors[0].availableStock > 0
                            ? labels.errorLimitedAvailability
                            : labels.errorOutOfStockInstance
                }));
                break;
            case 'NotAvailableProductError':
                this.setState(() => ({
                    showError: true,
                    errorMsg: labels.errorNoPurchasable
                }));
                break;
        }
        this.getData();
        // scroll up to show the error
        this.scrollToTop(
            typeof document !== 'undefined' && document.getElementsByClassName('modal-content-wrapper')[0]
        );
    };

    render() {
        const {
            baseDialogClass,
            baseUnderlayClass,
            underlayClass,
            dialogClass,
            labels,
            chosenProduct,
            services,
            dates,
            headerData
        } = this.props;
        const { name, description, baseProduct = '' } = chosenProduct;
        const { hideLabel, showError, errorMsg } = this.state;
        const header = SessionStorage.getItem('header');
        const { passengers = [] } = header;
        const maxSelectable = baseProduct.toLowerCase().includes("couples_treatments_oasis") ? 2 : 1;
        return (
            <ReactAriaModal
                {...this.props}
                dialogClass={`${baseDialogClass} ${dialogClass}`}
                underlayClass={`${baseUnderlayClass} ${underlayClass}`}
                titleText={`Spa Configuration`}
                verticallyCenter={false}
                getApplicationNode={this.getApplicationNode}
                includeDefaultStyles={false}
                onEnter={this.onEnter}
            >
                <div className="modal-close-wrap">
                    <button
                        className="close"
                        data-linktext={`${labels.closeLabel}`}
                        aria-label={`${labels.closeLabel}`}
                        onClick={this.onExit}
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
                            <p className="paragraph">{description}</p>
                        </div>
                        {chosenProduct && (
                            <SpaForm
                                labels={labels}
                                formData={chosenProduct}
                                services={services}
                                errorHandler={this.showError}
                                successHandler={this.showConfirmation}
                                dates={dates}
                                headerData={headerData}
                                maxSelectable={maxSelectable}
                                name={name}
                            />
                        )}
                    </div>
                </div>
            </ReactAriaModal>
        );
    }
}

spaOverlay.defaultProps = {
    baseUnderlayClass: 'aria-modal-underlay',
    baseDialogClass: 'aria-modal',
    underlayClass: '',
    dialogClass: ''
};

export default spaOverlay;
