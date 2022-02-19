/*
 * React Modal
 *
 * For examples and features: https://github.com/davidtheclark/react-aria-modal
 */
'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import ReactAriaModal from 'react-aria-modal';
import scroller from '../scroller';
import Button from '../button';
import { breakpoint } from '../../../../library/js/config/index';

const VIEWPORT_TYPE = breakpoint.VIEWPORT_TYPE;
const watchForBreakpoint = breakpoint.watchForBreakpoint;

class modal extends React.Component {
    constructor(props) {
        super(props);

        this.entered = false;
        this.underlayClass = 'aria-modal-underlay';
        this.dialogClass = 'aria-modal';
        this.state = {
            hideLabel: '',
            showBackToTop: false,
            verticallyCenter:
                this.props.verticallyCenter !== undefined
                    ? this.props.verticallyCenter
                    : true
        };
    }

    componentDidMount() {
        const mqlLVP = watchForBreakpoint(VIEWPORT_TYPE.DESKTOP);

        this.handleResize(mqlLVP);

        mqlLVP.addListener((mql) => {
            this.handleResize(mql);
        });
    }

    hideLabel(bool) {
        this.setState({
            hideLabel: bool
        });
    }

    handleScroll = (e) => {
        const topPosition = this.content.getBoundingClientRect().top;

        if (topPosition > -20 && this.state.hideLabel) this.hideLabel(false);
        if (topPosition <= -20 && !this.state.hideLabel) this.hideLabel(true);
    };

    handleResize(mql) {
        this.setState({
            verticallyCenter: mql.matches
        });

        this.checkContentHeight();
    }

    checkContentHeight = () => {
        let modalContent = typeof document !== 'undefined' && document.getElementsByClassName(
            'modal-content-wrapper'
        );

        setTimeout(() => {
            if (
                this.entered &&
                modalContent[0].scrollHeight > modalContent[0].clientHeight
            ) {
                this.setState({
                    showBackToTop: true
                });
            }
        }, 100);
    };

    scrollToTop = (ev) => {
        if (ev.target.parentNode.parentNode) {
            ev.target.parentNode.parentNode.scrollTop = 0;
        } else {
            this.content.scrollTop = 0;
        }
        if (typeof this.props.trackBackButton === 'function') {
            this.props.trackBackButton();
        }
    };

    onEnter = () => {
        this.entered = true;
        this.content = typeof document !== 'undefined' && document.querySelector('.aria-modal');
        this.scroller = scroller({
            element: typeof document !== 'undefined' && document.querySelector('.aria-modal'),
            callback: this.handleScroll
        });

        if (this.props.onEnter) this.props.onEnter();

        this.checkContentHeight();

        const picturefill = require('picturefill');

        picturefill();
    };

    onExit = () => {
        this.entered = false;
        this.hideLabel(false);
    };

    getApplicationNode() {
        return typeof document !== 'undefined' && document.querySelector('.wrapper');
    }

    render() {
        const {
            onExit,
            closeLabel,
            children,
            underlayClass,
            dialogClass,
            backtopLabel,
            contentLabel,
            sessionClass
        } = this.props;
        const dialog = sessionClass
            ? `${sessionClass}`
            : dialogClass
                ? `${this.dialogClass} ${dialogClass}`
                : this.dialogClass;
        const underlay = underlayClass
            ? `${this.underlayClass} ${underlayClass}`
            : this.underlayClass;
        const ctaType =
            typeof this.props.ctaType !== 'undefined' ? this.props.ctaType : '';

        return (
            <ReactAriaModal
                {...this.props}
                dialogClass={dialog}
                underlayClass={underlay}
                onEnter={this.onEnter}
                titleText={contentLabel}
                verticallyCenter={false}
                getApplicationNode={this.getApplicationNode}
                includeDefaultStyles={this.props.includeDefaultStyles}
            >
                <div className="modal-close-wrap">
                    <button
                        className="close"
                        data-linktext={`${closeLabel}`}
                        aria-label={`${ctaType} ${closeLabel}`}
                        onClick={onExit}
                        ref={(close) => (this.close = close)}
                    >
                        <span
                            className={`close-label${
                                this.state.hideLabel ? ' fade-out' : ''
                            }`}
                        >
                            {closeLabel}
                        </span>
                    </button>
                </div>
                <div className="modal-content-wrapper">
                    <div className="modal-content">
                        {children}
                        {this.state.showBackToTop &&
                            backtopLabel && (
                                <Button
                                    buttonClassName="back-to-top"
                                    dataLinktext={`${
                                        this.props.title
                                    }:${backtopLabel}`}
                                    onClick={(ev) => this.scrollToTop(ev)}
                                    tabIndex="-1"
                                >
                                    {backtopLabel}
                                </Button>
                            )}
                    </div>
                </div>
            </ReactAriaModal>
        );
    }
}

modal.propTypes = {
    onExit: PropTypes.func.isRequired,
    dialogClass: PropTypes.string,
    underlayClass: PropTypes.string,
    closeLabel: PropTypes.string.isRequired,
    backtopLabel: PropTypes.string.isRequired,
    mounted: PropTypes.bool.isRequired,
    contentLabel: PropTypes.string.isRequired,
    verticallyCenter: PropTypes.bool
};

modal.defaultProps = {
    mounted: false,
    closeLabel: 'Close', // Make global
    backtopLabel: 'Back to Top', // Make global
    underlayColor: false,
    includeDefaultStyles: false
};

export default modal;
