import React from 'react';
import PropTypes from 'prop-types';
import analytics from '../commons/CUK/analytics';
import AnalyticsPageTrack from '../commons/CUK/analyticsPageTrack';
import Link from '../commons/CUK/link';
import {
    VIEWPORT_TYPE,
    watchForBreakpoint
} from '../../library/js/config/breakpoints';

// import './styles/index.css';
// import 'platform-theme/styles/components/footer/index.css';

class footerMycruise extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            activeItem: { [0]: false },
            isLVP: false,
            oldIndex: 0,
            accordionItems: [],
            footerLinks: []
        };
        this.brand =
            typeof window !== 'undefined' &&
            typeof window.configs !== 'undefined' &&
            typeof window.configs.brand !== 'undefined'
                ? window.configs.brand
                : '';
    }

    componentWillMount = () => {
        const { topNavList, subNavList, searchCta } = this.props;

        let accordion = [];

        topNavList.forEach((item, index) => {
            if (
                index + 1 === topNavList.length &&
                searchCta &&
                searchCta.label &&
                searchCta.label !== ''
            ) {
                accordion.push(searchCta);
            }

            accordion.push({
                title: item.title,
                content: item,
                openMenu: false
            });

            if (
                topNavList.length === 1 &&
                index === 0 &&
                searchCta &&
                searchCta.label &&
                searchCta.label !== ''
            ) {
                accordion.push(searchCta);
            }
        });
        this.setState({
            accordionItems: accordion,
            footerLinks: subNavList
        });
    };

    componentDidMount = () => {
        // analytics.clickTracking(this);
        const mqlLVP = watchForBreakpoint(VIEWPORT_TYPE.DESKTOP);

        this.setState({
            isLVP: mqlLVP.matches
        });
        mqlLVP.addListener((mql) => {
            this.handleResize(mql);
        });
    };
    componentDidUpdate = () => {
        // analytics.clickTracking(this);
    };

    handleResize = (mql) => {
        this.setState({
            isLVP: mql.matches
        });
    };

    toggleMenu = (index) => {
        analytics.clickTracking(this);
        let prevIndex = this.state.oldIndex;

        let state = !this.state.activeItem[index];

        prevIndex === index
            ? this.setState({
                  activeItem: { [prevIndex]: state },
                  oldIndex: index
              })
            : this.setState({ activeItem: { [index]: true }, oldIndex: index });
    };

    domLVP = () => {
        let accordionItems = this.state.accordionItems;

        let sections = accordionItems.filter((item) => {
            return item.content && item.content.sublinkList;
        });
        let searchCta = accordionItems.filter((item) => {
            return !item.content || !item.content.sublinkList;
        });

        searchCta =
            searchCta[0] && Object.assign({}, { subLinkCta: searchCta[0] });

        sections = sections.map((item, index) => {
            if (sections.length === 1 && searchCta) {
                item.content.sublinkList.push(searchCta);
            } else if (index === 1 && searchCta) {
                item.content.sublinkList.push(searchCta);
            }
            let subTaskComponents = this.listComponent(
                item.content.sublinkList,
                item.title
            );

            return (
                <div className="accordion-item lvp-dom" key={index}>
                    <div className="title">
                        <p
                            className="footer-heading"
                            role="heading"
                            id={`accordion${index}`}
                            aria-level="2"
                        >
                            {item.title}
                        </p>
                    </div>
                    <div className="content">
                        <div>
                            {' '}
                            <ul
                                aria-labelledby={`accordion${index}`}
                                id={`list${index}`}
                            >
                                {subTaskComponents}
                            </ul>
                        </div>
                    </div>
                </div>
            );
        });

        return sections;
    };

    returnSocialIconListItems = (arr) => {
        const footerSocialIconListItems = arr.map((item, index) => {
            return (
                <div
                    className="social-icon-container"
                    role="listitem"
                    key={index}
                >
                    <Link
                        key={index}
                        linkClassName={item.icon}
                        url={item.socialIconCta.url}
                        isExternal={item.socialIconCta.isExternal}
                        dataLinktext={`footer:social:${item.icon}`}
                        tabIndex={item.icon && item.icon !== '' ? 0 : -1}
                        label={`<span>${item.icon}</span>`}
                    />
                </div>
            );
        });

        return footerSocialIconListItems;
    };

    returnSecondaryLogoListItems = (arr) => {
        const secondaryLogoListItems = arr.map((item, index) => {
            return item.logo ? (
                <Link
                    key={index}
                    linkClassName={`award-${index + 1}`}
                    {...item.secondaryLogoCta}
                    dataLinktext={`award-${index + 1}`}
                    dataContentname={`${this.brand} Logo`}
                    dataContenttype="image"
                >
                    <img src={item.logo.image} alt={item.logo.alt} />
                </Link>
            ) : null;
        });

        return secondaryLogoListItems;
    };

    returnFooterLinks = (arr) => {
        const footerLinks = arr.map((item, index) => {
            return (
                <li key={index}>
                    <Link
                        linkClassName="sub-link"
                        title={item.textCta.label}
                        {...item.textCta}
                        tabIndex={
                            item.textCta.label && item.textCta.label !== ''
                                ? 0
                                : -1
                        }
                        dataLinktext={`footer:${item.textCta.label}`}
                    >
                        {item.textCta.label}
                    </Link>
                </li>
            );
        });

        return footerLinks;
    };

    returnAwardsDiv = (secondaryLogoList, optionalSecondaryLogo) => {
        return (
            <div className="awards">
                {optionalSecondaryLogo &&
                    optionalSecondaryLogo.logo && (
                        <Link
                            linkClassName={`optional-secondary-logo`}
                            {...optionalSecondaryLogo.secondaryLogoCta}
                            dataLinktext={`award-optional`}
                            dataContentname={`${this.brand} Logo`}
                            dataContenttype="image"
                        >
                            {optionalSecondaryLogo.logo && (
                                <img
                                    src={optionalSecondaryLogo.logo.image}
                                    alt={optionalSecondaryLogo.logo.alt}
                                />
                            )}
                        </Link>
                    )}
                {secondaryLogoList &&
                    this.returnSecondaryLogoListItems(secondaryLogoList)}
            </div>
        );
    };

    returnFooter = () => {
        const {
            footerLogo,
            socialList,
            secondaryLogoList,
            optionalSecondaryLogo,
            countrySelectorCta,
            subNavList,
            copyrightLabel,
            ctaBrand
        } = this.props;

        return (
            <div className="main-container">
                <div className="accordion">
                    {this.state.isLVP ? this.domLVP() : this.domMVP()}
                    <div className="logo-wrapper">
                        {footerLogo && (
                            <div className="logo">
                                <Link
                                    url={footerLogo.url}
                                    linkClassName="logo-anchor"
                                    dataLinktext={`footer:${this.brand}:logo`}
                                    dataContentname={`${this.brand} Logo`}
                                    dataContenttype="image"
                                >
                                    <img
                                        src={footerLogo.image}
                                        alt={footerLogo.alt}
                                    />
                                </Link>
                            </div>
                        )}
                        {this.returnAwardsDiv(
                            secondaryLogoList,
                            optionalSecondaryLogo
                        )}
                        <Link
                            linkClassName="logo-link"
                            url={ctaBrand.url}
                            ariaLabel={ctaBrand.url}
                        >
                            {ctaBrand.label}
                        </Link>
                    </div>
                </div>

                <div id="footerContent" />

                <div className="footer-links-container">
                    {countrySelectorCta &&
                        this.returnChangeCountryDiv(countrySelectorCta)}
                    <div className="footer-links-div">
                        <ul>
                            {' '}
                            {subNavList &&
                                this.returnFooterLinks(subNavList)}{' '}
                        </ul>
                    </div>
                    <div className="social-share-icons">
                        <div className="social-share-wrapper" role={`list`}>
                            {socialList &&
                                this.returnSocialIconListItems(socialList)}
                        </div>
                    </div>
                </div>

                {copyrightLabel && (
                    <div
                        className="copyright-wrapper"
                        dangerouslySetInnerHTML={{
                            __html: `&copy; ${new Date().getFullYear()} ${copyrightLabel}`
                        }}
                    />
                )}
            </div>
        );
    };

    returnChangeCountryDiv = (data) => {
        const { label, url, isExternal } = data;

        if (label && label.length && url && url.length) {
            return (
                <div className="footer-change-country">
                    <Link
                        linkClassName="change-country-link"
                        title={label}
                        url={url}
                        tabIndex={label && label !== '' ? 0 : -1}
                        isExternal={isExternal}
                        dataLinktext={`footer:${label}`}
                    >
                        {label}
                    </Link>
                </div>
            );
        } else {
            return null;
        }
    };

    listComponent = (arrItems, titleValue) => {
        let listItems = arrItems.map((list, index) => {
            return (
                <li
                    key={index}
                    className={
                        list.subLinkCta.label === 'Search' ? 'search' : null
                    }
                >
                    <Link
                        linkClassName={`sub-link ${
                            list.subLinkCta.label === 'Search'
                                ? 'search-cta'
                                : null
                        }`}
                        {...list.subLinkCta}
                        isExternal={list.subLinkCta.isExternal}
                        tabIndex={
                            list.subLinkCta.label &&
                            list.subLinkCta.label !== ''
                                ? 0
                                : -1
                        }
                        dataLinktext={`footer:${titleValue}:${
                            list.subLinkCta.label
                        }`}
                    />
                </li>
            );
        });

        return listItems;
    };

    domMVP = () => {
        let sections = this.state.accordionItems.map((item, index) => {
            let subTaskComponents =
                item.content &&
                item.content.sublinkList &&
                this.listComponent(item.content.sublinkList, item.title);

            return (
                <div key={index}>
                    {subTaskComponents && (
                        <div className="accordion-item mvp-dom">
                            <button
                                className="title"
                                onClick={() => this.toggleMenu(index)}
                                data-linktext={item.title}
                            >
                                <span className="arrow-wrapper">
                                    <i
                                        className={`${
                                            this.state.activeItem[index]
                                                ? 'ffa-angle-down ffa-rotate-180'
                                                : 'ffa-angle-down'
                                        }`}
                                    />
                                </span>
                                <span
                                    className="footer-heading"
                                    role="heading"
                                    aria-level="2"
                                >
                                    {item.title}
                                </span>
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
                                    {' '}
                                    <div>
                                        <ul>{subTaskComponents}</ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {!subTaskComponents && (
                        <div className="accordion-item mvp-dom">
                            <Link
                                linkClassName="title search-link"
                                title={item.label}
                                url={item.url}
                                isExternal={item.isExternal}
                                dataLinktext={`${item.label}`}
                            >
                                <div className="arrow-wrapper search-arrow">
                                    <i
                                        className={`${
                                            this.state.activeItem[index]
                                                ? 'ffa-angle-down ffa-rotate-180'
                                                : 'ffa-angle-down'
                                        }`}
                                    />
                                </div>
                                <p
                                    className="footer-heading"
                                    role="heading"
                                    aria-level="2"
                                >
                                    {item.label}
                                </p>
                            </Link>
                        </div>
                    )}
                </div>
            );
        });

        return sections;
    };

    render = () => {
        const { skipToContentLabel } = this.props;

        return (
            <footer className="global-footer-container">
                {skipToContentLabel && (
                    <Link
                        url="#footerContent"
                        linkClassName="sr-only skip-to-content"
                    >
                        {skipToContentLabel}
                    </Link>
                )}
                <div className="grid-wrap">{this.returnFooter()}</div>
                <AnalyticsPageTrack />
            </footer>
        );
    };
}

footerMycruise.propTypes = {
    topNavList: PropTypes.array,
    subNavList: PropTypes.array,
    brandLogoURL: PropTypes.string,
    brandLogo: PropTypes.string,
    socialList: PropTypes.array,
    secondaryLogoList: PropTypes.array,
    brandLogoAltText: PropTypes.string
};

export default footerMycruise;
