'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import Modal from '../modal';
import { numberFormat, getPriceSymbolForCurrencyCode } from '../currencyFormat';
import fetchData from '../fetch-data';
import analytics from '../analytics';

class legalModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            activeItem: { [0]: false },
            accItems: [],
            termsLength: 0,
            accItemsModified: [],
            oldIndex: 0,
            secContent: [],
            showLegalModal: false,
            legalModalContent: ''
        };
    }

    attachClickEventOnTerms = () => {
        const termsArr = this.container.getElementsByClassName(
            'legal-container'
        );

        for (let i = 0; i < termsArr.length; i++) {
            if (termsArr[i].dataset && termsArr[i].dataset.legal) {
                termsArr[i].addEventListener('click', this.clickMenu);
            }
        }
    };

    removeClickEventsFromTerms = () => {
        const termsArr = this.container.getElementsByClassName(
            'legal-container'
        );

        for (let i = 0; i < termsArr.length; i++) {
            if (termsArr[i].dataset && termsArr[i].dataset.legal) {
                termsArr[i].removeEventListener('click', this.clickMenu);
            }
        }
    };

    clickMenu = (elem) => {
        elem.preventDefault();

        const terms = elem.currentTarget.dataset.legal.split(',');

        this.setState({
            secContent: terms
        });

        analytics.markupLinkTracking(
            elem,
            this.props.component || 'legalModal'
        );

        this.handleLegalModal(true);
    };

    handleLegalModal = (bool) => {
        bool ? this.callFetch() : this.setState({ showLegalModal: bool });
    };

    callFetch = () => {
        if (Object.keys(window.SR.legalContent).length > 0) {
            this.callLegalModal(window.SR.legalContent[0]);
        } else {
            const serviceUrl =
                typeof window !== 'undefined' && window.configs
                    ? window.configs.legalServiceUrl
                    : {};

            if (window.fetch) {
                fetchData(serviceUrl).then((response) => {
                    this.callLegalModal(response);
                    window.SR.legalContent.push(response);
                });
            }
        }
    };

    callLegalModal = (response) => {
        this.setState(
            {
                legalModalContent: response,
                showLegalModal: true
            },
            () => {
                const { dynamicData, hideLegalAccordion } = this.props;

                dynamicData &&
                    this.setAccItems(
                        this.state.secContent,
                        hideLegalAccordion,
                        dynamicData
                    );
                !dynamicData &&
                    this.setAccItems(this.state.secContent, hideLegalAccordion);
            }
        );
    };

    componentDidMount() {
        this.attachClickEventOnTerms();
    }

    componentDidUpdate() {
        this.attachClickEventOnTerms();
    }

    componentWillUnmount() {
        this.removeClickEventsFromTerms();
    }

    /**
     * updateLegalData - update legal content
     *
     * @param {data} data-object which has data to be replaced dynamically
     * @param {element} data-entity which needs to be replaced dynamically
     * @returns {object} updated object
     */

    updateLegalData = (data, element, type) => {
        // check for portCharges
        if (data.portCharges) {
            for (let key in data.portCharges) {
                let subStr = new RegExp(`\{\{portCharges\.${key}\}\}`, 'g');
                let currSymbol = getPriceSymbolForCurrencyCode(
                    data.portCharges.currencyCode
                );

                let subStrValue = isNaN(data.portCharges[key])
                    ? data.portCharges[key]
                    : numberFormat(data.portCharges[key]);

                element = element.replace(
                    subStr,
                    `${key !== 'currencyCode' ? currSymbol : ''}${subStrValue}`
                );
            }
        }

        // check for serviceCharges
        if (data.serviceCharges) {
            let matchCurrency = 0,
                { customCurrencyCode } = window.dtm_digitalData;

            data.serviceCharges.map((datum, index) => {
                // currencyCode matches with any currency in array
                if (
                    customCurrencyCode &&
                    customCurrencyCode === datum.currency
                ) {
                    for (let key in datum) {
                        let subStr = new RegExp(
                            `\{\{serviceCharges\.${key}\}\}`,
                            'g'
                        );
                        let currSymbol = getPriceSymbolForCurrencyCode(
                            datum.currency
                        );
                        let subStrValue = isNaN(datum[key])
                            ? datum[key]
                            : numberFormat(datum[key]);

                        element = element.replace(
                            subStr,
                            `${subStrValue}${
                                key !== 'currency' ? currSymbol : ''
                            }`
                        );
                    }
                    matchCurrency = 1;
                }
            });
            // currency doesn't match
            if (!matchCurrency) {
                let scChildAmounts = ``,
                    scAdultAmounts = ``,
                    scCurrencies = ``;

                data.serviceCharges.map((datum, index) => {
                    let currSymbol = getPriceSymbolForCurrencyCode(
                            datum.currency
                        ),
                        childAmount = datum.childAmount
                            ? numberFormat(datum.childAmount)
                            : datum.childAmount,
                        adultAmount = datum.adultAmount
                            ? numberFormat(datum.adultAmount)
                            : datum.adultAmount;

                    scChildAmounts += `${currSymbol}${childAmount}${
                        index + 1 !== data.serviceCharges.length ? '/ ' : ''
                    }`;
                    scAdultAmounts += `${currSymbol}${adultAmount}${
                        index + 1 !== data.serviceCharges.length ? '/ ' : ''
                    }`;
                    scCurrencies += `${currSymbol}${
                        index + 1 !== data.serviceCharges.length ? '/ ' : ''
                    }`;
                });
                element = element.replace(
                    /\{\{serviceCharges.childAmount\}\}/g,
                    scChildAmounts
                );
                element = element.replace(
                    /\{\{serviceCharges.adultAmount\}\}/g,
                    scAdultAmounts
                );
                element = element.replace(
                    /\{\{serviceCharges.currency\}\}/g,
                    scCurrencies
                );
            }
        }

        // check for mandatory documents
        if (
            data.documents &&
            Array.isArray(data.documents) &&
            data.documents.length
        ) {
            // hide documents RTE only in title
            element = element.replace(
                /\{\{documents\}\}/g,
                data.documents.join(', ')
            );
        } else if (type === 'title') {
            element = element.replace(
                'legal-gray-color',
                'legal-gray-color hide'
            );
        }
        // check for flight included
        if (
            data.flight &&
            data.flight.flightRequired &&
            data.flight.flightLabel
        ) {
            element = element
                .replace(/\{\{flight.included\}\}/g, data.flight.flightLabel)
                .replace(/\{\{flight.not.included\}\}/g, '');
        } else if (
            data.flight &&
            !data.flight.flightRequired &&
            data.flight.flightNotincludedLabel
        ) {
            element = element
                .replace(
                    /\{\{flight.not.included\}\}/g,
                    data.flight.flightNotincludedLabel
                )
                .replace(/\{\{flight.included\}\}/g, '');
        }

        return element;
    };

    /**
     * setAccItems - setAccItems function
     *
     * @param {accItems} accordion items to be picked from legalContent
     * @param {hideLegalAccordion} flag to determine accordion behaviour
     * @param {element} data-entity which needs to be replaced dynamically
     */

    setAccItems = (accItems, hideLegalAccordion, data) => {
        let tempArr = [],
            accItemsModified = [];

        accItems.map((item, index) => {
            let obj = { ...this.state.legalModalContent.legalContent[item] };

            // check if data needs to be modified
            if (data && Object.keys(obj).length !== 0) {
                let objectTitle = obj.title;
                let objectBodyCopy = obj.bodyCopy;

                objectTitle = this.updateLegalData(data, objectTitle, 'title');
                objectBodyCopy = this.updateLegalData(
                    data,
                    objectBodyCopy,
                    'bodyCopy'
                );

                obj.title = objectTitle;
                obj.bodyCopy = objectBodyCopy;
            }

            if (obj) tempArr.push(obj);
        });

        if (tempArr.length >= 2 && !hideLegalAccordion) {
            accItemsModified = tempArr.slice(1, tempArr.length);
        }

        this.setState({
            accItems: tempArr,
            accItemsModified
        });
    };

    /**
     * toggleMenu - toggleMenu function
     *
     * @param {index} index to open the accordion content
     * @param {object} e event object
     */

    toggleMenu = (index, e) => {
        let state = !this.state.activeItem[index];
        const stateLabel = state ? 'expanded' : 'collapse';
        const linkText = e.currentTarget.innerText;

        this.setState({ activeItem: { [index]: state } }, () => {
            analytics &&
                analytics.customClicks({
                    linkText: `${linkText}:${stateLabel}`,
                    componentName: 'legalModal'
                });
        });
    };

    /**
     * returnAccordionItems - returnAccordionItems function
     *
     * @param {items} list of accordion items
     */

    returnAccordionItems = (items) => {
        let sections = items.map((item, index) => {
            return (
                <div className="accordion-item mvp-dom" key={index}>
                    <button
                        className="title"
                        onClick={(e) => this.toggleMenu(index, e)}
                    >
                        <span
                            className="title-text"
                            dangerouslySetInnerHTML={{ __html: item.title }}
                        />
                        <div className="arrow-wrapper">
                            <i
                                className={`${
                                    this.state.activeItem[index]
                                        ? 'ffa-angle-down ffa-rotate-180'
                                        : 'ffa-angle-down'
                                }`}
                            />
                        </div>
                    </button>
                    <div
                        className={`${
                            this.state.activeItem[index]
                                ? 'content content-open'
                                : 'content'
                        }`}
                    >
                        <div
                            className={`${
                                this.state.activeItem[index]
                                    ? 'content-text content-text-open'
                                    : 'content-text'
                            }`}
                        >
                            <div
                                dangerouslySetInnerHTML={{
                                    __html: item.bodyCopy
                                }}
                            />
                        </div>
                    </div>
                </div>
            );
        });

        return sections;
    };

    /**
     * returnItems - returnItems function
     *
     * @param {items} list of accordion items
     */

    returnItems = (items) => {
        let sections = items.map((item, index) => {
            return (
                <div className="accordion-item mvp-dom" key={index}>
                    <span className="title">
                        <span
                            dangerouslySetInnerHTML={{ __html: item.title }}
                        />
                    </span>
                    <div className={'content'}>
                        <div className={'content-text'}>
                            <div
                                dangerouslySetInnerHTML={{
                                    __html: item.bodyCopy
                                }}
                            />
                        </div>
                    </div>
                </div>
            );
        });

        return sections;
    };

    /**
     * renderAccordionMarkup - return markup with accordion
     */

    renderAccordionMarkup = () => {
        const { title, bodyCopy } = { ...this.state.accItems[0] };

        return (
            <div className="inner-wrapper">
                <div className="header-block">
                    <h2
                        className="head-title"
                        dangerouslySetInnerHTML={{ __html: title }}
                    />
                    <div dangerouslySetInnerHTML={{ __html: bodyCopy }} />
                </div>
                <div className="accordion">
                    {this.state.accItems.length >= 2 &&
                        this.returnAccordionItems(this.state.accItemsModified)}
                </div>
            </div>
        );
    };

    /**
     * renderMarkup - return markup
     */

    renderMarkup = () => {
        return (
            <div className="inner-wrapper">
                <div className="accordion">
                    {this.returnItems(this.state.accItems)}
                </div>
            </div>
        );
    };

    render() {
        const {
            hideLegalAccordion,
            closeLabel,
            contentLabel,
            underlayClass,
            taxFeesBlock
        } = this.props;

        let renderTaxesFeesContainer = hideLegalAccordion
            ? this.renderMarkup()
            : this.renderAccordionMarkup();

        return (
            <div ref={(container) => (this.container = container)}>
                {taxFeesBlock}
                <Modal
                    closeLabel={closeLabel}
                    mounted={this.state.showLegalModal}
                    contentLabel={contentLabel ? contentLabel : 'content label'}
                    underlayClass={`${underlayClass} content-modal`}
                    onExit={() => this.handleLegalModal(false)}
                    backtopLabel=""
                >
                    <div
                        className="legal-modal-container"
                        role="presentation"
                        onKeyPress={(e) =>
                            analytics.markupLinkTracking(
                                e,
                                this.props.component || 'legalModal'
                            )
                        }
                        onClick={(e) =>
                            analytics.markupLinkTracking(
                                e,
                                this.props.component || 'legalModal'
                            )
                        }
                    >
                        {renderTaxesFeesContainer}
                    </div>
                </Modal>
            </div>
        );
    }
}

legalModal.propTypes = {
    closeLabel: PropTypes.string,
    contentLabel: PropTypes.string,
    underlayClass: PropTypes.string,
    hideLegalAccordion: PropTypes.bool,
    termsDomRef: PropTypes.object,
    mounted: PropTypes.bool
};

legalModal.defaultProps = {
    underlayClass: 'legal-modal',
    mounted: false
};

export default legalModal;
