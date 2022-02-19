'use strict';

import React from 'react';
import CopyBlock from '../commons/CUK/copyBlock';
import cookie from '../commons/CUK/cookie';
import animatedScroll from '../commons/CUK/animatedScroll';
import { isCollectionEmpty } from '../commons/CUK/utilities';

import LocalStorage from '../commons/CUK/localStorage';
import analytics from '../commons/CUK/analytics';

const COOKIE_FAVORITE = 'favorites';
const COOKIE_FAVORITE_SHOREX = 'favoriteShoreX';

class acceptCookie extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            cookieSaved: false
        };
    }

    componentDidMount() {
        const { cookieList } = this.props;

        let newState = {};

        cookieList.forEach(
            (cookiesVal) =>
                (newState[cookiesVal.cookieName] =
                    !cookie.get(cookiesVal.cookieName)[0] ||
                    cookie.get(cookiesVal.cookieName)[0] === 'true')
        );

        this.setState(newState);

        if (/cookie-acceptance-section/.test(window.location.href)) {
            setTimeout(function () {
                let headerPos = 0;

                if (
                    typeof document !== 'undefined' && document.getElementsByClassName('global-header-wrapper')
                        .length > 0
                ) {
                    headerPos = typeof document !== 'undefined' && document.getElementsByClassName(
                        'global-header-wrapper'
                    )[0].clientHeight;
                }

                let scrollPos =
                    typeof document !== 'undefined' && document.getElementById('cookie-acceptance-section')
                        .offsetTop - headerPos;

                window.scrollTo(0, 0);
                animatedScroll(scrollPos, 500);
            }, 900);
        }
    }

    handleOptionChange = (event) => {
        let newState = {},
            { name, value } = event.target;

        newState[name] = value === 'true';
        this.setState(newState);
    };

    handleSubmit = () => {
        analytics.clickTracking(this);
        LocalStorage.setItem('cookiePolicyHeader', true);
        const { cookieList } = this.props;

        cookieList.forEach((cookiesVal) => {
            let cookieValue = this.state[cookiesVal.cookieName];

            cookie.delete(cookiesVal.cookieName);
            cookie.addTo(cookiesVal.cookieName, cookieValue, 730);
        });

        if (!this.state.disablePerfCookie) {
            this.clearFavoritesCookie();
        }
        this.setState({ cookieSaved: true });
    };

    clearFavoritesCookie = () => {
        cookie.delete(COOKIE_FAVORITE);
        cookie.delete(COOKIE_FAVORITE_SHOREX);
    };

    createMarkup = (html) => {
        return { __html: html };
    };

    renderDescription = () => {
        const { textBlockTitle, textBlock } = this.props;

        return (
            <div className="twelve-col-container">
                <h3>{textBlockTitle}</h3>
                <p>
                    <span
                        dangerouslySetInnerHTML={this.createMarkup(textBlock)}
                    ></span>
                </p>
            </div>
        );
    };

    renderCta = (labels) => {
        return (
            <div className="cta-holder">
                {this.state.cookieSaved && (
                    <p className="cookie-save-message"> {labels.cookieSaved}</p>
                )}
                <button
                    aria-label=""
                    className="button"
                    onClick={this.handleSubmit}
                    data-linktext={labels.save}
                >
                    {labels.save}
                </button>
            </div>
        );
    };

    renderRadio = (name, label, value, id, isChecked, isDisabled) => {
        return (
            <div>
                <input
                    type="radio"
                    name={name}
                    value={value}
                    id={id}
                    checked={isChecked}
                    disabled={isDisabled}
                    onChange={this.handleOptionChange}
                />
                <label htmlFor={id} data-linktext={value}>
                    <span className="option-text">{label}</span>
                </label>
            </div>
        );
    };

    renderQuestions = () => {
        const { cookieList, labels } = this.props;

        if (isCollectionEmpty(cookieList)) {
            return;
        }

        const html = cookieList.map((cookiesVal, i) => (
            <div key={`cookie-${i}`}>
                <div className="twelve-col-container">
                    <div className="ten-col-container">
                        <h3>{cookiesVal.cookieTitle}</h3>
                    </div>

                    <fieldset className="two-col-container">
                        <legend className="hidden">
                            {cookiesVal.cookieTitle}
                        </legend>
                        <ul className="cookie-check">
                            <li>
                                {this.renderRadio(
                                    cookiesVal.cookieName,
                                    labels.accept,
                                    true,
                                    labels.accept + i,
                                    this.state[cookiesVal.cookieName] === true
                                )}
                            </li>
                            <li>
                                {this.renderRadio(
                                    cookiesVal.cookieName,
                                    labels.refuse,
                                    false,
                                    labels.refuse + i,
                                    this.state[cookiesVal.cookieName] === false
                                )}
                            </li>
                        </ul>
                    </fieldset>
                </div>
                <div className="twelve-col-container">
                    <p>
                        <span
                            dangerouslySetInnerHTML={this.createMarkup(
                                cookiesVal.cookieDescription
                            )}
                        ></span>
                    </p>
                </div>
            </div>
        ));

        return html;
    };

    renderCopyBlock = () => {
        const { childComponents } = this.props;

        return (
            <div className="copy-block-container">
                {childComponents.length > 0 && childComponents[0] !== null && (
                    <CopyBlock {...childComponents[0].attributes} />
                )}
            </div>
        );
    };

    /* Render function to generate HTML for the Component */
    render() {
        const { labels } = this.props;

        return (
            <div id="cookie-acceptance-section" className="accept-cookie">
                <div className="inner-container">
                    <div className="content-container">
                        {this.renderDescription()}

                        {this.renderQuestions()}
                    </div>
                    {this.renderCta(labels)}

                    {this.renderCopyBlock()}
                </div>
            </div>
        );
    }
}

export default acceptCookie;
