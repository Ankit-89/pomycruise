import React from 'react';
import ReactDOM from 'react-dom';
import ReactAriaModal from 'react-aria-modal';
import Link from '../commons/CUK/link';
import scroller from '../commons/CUK/scroller';

import {
    VIEWPORT_TYPE,
    watchForBreakpoint
} from '../../library/js/config/breakpoints';

import ArticleHeader from '../articleHeader';
import TitleAndParagraph from '../titleAndParagraph';
import TitleAndLinks from '../titleAndLinks';
import SingleVideo from '../singleVideo';
import ImageAndText from '../imageAndText';
import analytics from '../commons/CUK/analytics';

class articleOverlay extends React.Component {
    constructor(props) {
        super(props);

        this.entered = false;
        this.underlayClass = 'aria-modal-underlay';
        this.dialogClass = 'aria-modal';
        this.state = {
            verticallyCenter:
                this.props.verticallyCenter !== undefined
                    ? this.props.verticallyCenter
                    : true
        };
    }

    fetchContent() {
        const {
            props: { overlaySelector, serviceUrl }
        } = this;
        const resourceUrl = `${serviceUrl}.${overlaySelector}.html`;

        if (typeof window !== 'undefined' && window.fetch) {
            fetch(resourceUrl)
                .then((response) => {
                    return response.text();
                })
                .then((html) => {
                    this.setState(
                        () => ({
                            overlayContent: html
                        }),
                        () => {
                            const components = typeof document !== 'undefined' && document
                                .getElementById('react-aria-modal-dialog')
                                .getElementsByClassName('react-component');

                            [...components].map(this.handleOverlayComponent);
                        }
                    );
                });
        }
    }

    handleOverlayComponent = (cycledComponent) => {
        const script = cycledComponent.querySelector('script');
        const raw = /push\((.*?)\);/g.exec(script.innerHTML)[1];
        const data = JSON.parse(raw);
        if (data.meta.render === 'dynamic') {
            const { type, attributes } = data;
            cycledComponent.innerHTML = '';
            switch (type) {
                case 'articleHeader':
                    ReactDOM.render(
                        <ArticleHeader {...attributes} />,
                        cycledComponent
                    );
                    break;
                case 'titleAndParagraph':
                    ReactDOM.render(
                        <TitleAndParagraph {...attributes} />,
                        cycledComponent
                    );
                    break;
                case 'titleAndLinks':
                    ReactDOM.render(
                        <TitleAndLinks {...attributes} />,
                        cycledComponent
                    );
                    break;
                case 'singleVideo':
                    ReactDOM.render(
                        <SingleVideo {...attributes} />,
                        cycledComponent
                    );
                    break;
                case 'imageAndText':
                    ReactDOM.render(
                        <ImageAndText {...attributes} />,
                        cycledComponent
                    );
                    break;
                case 'whatToWear':
                    ReactDOM.render(
                        <WhatToWear {...attributes} services={data.services} />,
                        cycledComponent
                    );
                    break;
            }
            // const Component = type[0].toUpperCase() + type.substring(1);
            // const DaComponent = (
            //     <Component {...attributes} ref={(c) => (component = c)} />
            // );
            // const DaVideo = <ArticleHeader {...attributes} />;
            // ReactDOM.render(DaComponent, cycledComponent);
        }
    };

    componentDidMount() {
        const mqlLVP = watchForBreakpoint(VIEWPORT_TYPE.DESKTOP);

        this.handleResize(mqlLVP);
        mqlLVP.addListener((mql) => {
            this.handleResize(mql);
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
    }

    scrollToTop = (ev) => {
        if (typeof document !== 'undefined' && document.getElementById("articleHeader")) {
            const elmnt = document.getElementById("articleHeader");
            elmnt.scrollIntoView();
        }
        if (ev.parentNode.parentNode) {
            ev.parentNode.parentNode.scrollTop = 0;
        } else {
            this.content.scrollTop = 0;
        }
        if (typeof this.props.trackBackButton === 'function') {
            this.props.trackBackButton();
        }
        analytics.clickTracking(this);
    };

    onEnter = () => {
        this.entered = true;
        this.content = typeof document !== 'undefined' && document.querySelector('.aria-modal');
        this.scroller = scroller({
            element: typeof document !== 'undefined' && document.querySelector('.aria-modal'),
            callback: this.handleScroll
        });

        this.props.onEnter && this.props.onEnter();

        this.fetchContent();
    };

    onExit = () => {
        this.entered = false;
    };

    getApplicationNode() {
        return typeof document !== 'undefined' && document.querySelector('.wrapper');
    }

    render() {
        const { onExit, underlayClass, dialogClass, labels } = this.props;
        const dialog = dialogClass
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
                titleText="Before You Sale"
                verticallyCenter={false}
                getApplicationNode={this.getApplicationNode}
                includeDefaultStyles={false}
            >
                <div className="modal-close-wrap">
                    <button
                        className="close"
                        data-linktext={`${labels.closeLabel}`}
                        aria-label={`${ctaType} ${labels.closeLabel}`}
                        onClick={onExit}
                        ref={(close) => (this.close = close)}
                    >
                        <span className="close-label">{labels.closeLabel}</span>
                    </button>
                </div>
                <div className="modal-content-wrapper">
                    {this.props.mounted && (
                        <div className="modal-content">
                            <div
                                className="modal-body"
                                dangerouslySetInnerHTML={{
                                    __html: this.state.overlayContent
                                }}
                            />
                            <div className="modal-footer">
                                <Link
                                    url=""
                                    ariaLabel={labels.backToTopLabel}
                                    label={labels.backToTopLabel}
                                    url="#"
                                    onClick={(e) =>
                                        this.scrollToTop(
                                            typeof document !== 'undefined' && document.getElementsByClassName(
                                                'modal-content-wrapper'
                                            )[0]
                                        )
                                    }
                                    linkClassName={`cta-secondary`}
                                    dataLinktext="back to top"
                                >
                                    {labels.backToTopLabel}
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </ReactAriaModal>
        );
    }
}

export default articleOverlay;
