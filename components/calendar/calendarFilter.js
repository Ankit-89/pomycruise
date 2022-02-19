'use strict';

import React from 'react';
import {
    VIEWPORT_TYPE,
    watchForBreakpoint
} from '../../library/js/config/breakpoints';
import analytics from '../commons/CUK/analytics';

class calendarFilter extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            filterCount: {},
            isLVP: true,
            filters: ['all'],
            legendOpen: false,
            calendarTitle: this.props.attributes.labels.allBookingLabel
        };
    }

    componentDidMount() {
        const mqlLVP = watchForBreakpoint(VIEWPORT_TYPE.DESKTOP);

        this.handleResize(mqlLVP);

        mqlLVP.addListener((mql) => {
            this.handleResize(mql);
        });
        typeof document !== 'undefined' && document.addEventListener('click', (e) => {
            if (
                this.filtersDd !== null &&
                !this.filtersDd.contains(e.target) &&
                this.state.filter
            ) {
                this.setState({
                    filter: false
                });
            }
            if (
                this.legend !== null &&
                !this.legend.contains(e.target) &&
                this.state.legendOpen
            ) {
                this.setState({
                    legendOpen: false
                });
            }
        });

        // analytics.clickTracking(this);
    }

    // Handle resize to check if filters should stop or not the scroll

    handleResize = (mql) => {
        if (watchForBreakpoint(VIEWPORT_TYPE.DESKTOP).matches) {
            this.setState({
                isLVP: true
            });
        } else if (
            (watchForBreakpoint(VIEWPORT_TYPE.MOBILE_L).matches &&
                !watchForBreakpoint(VIEWPORT_TYPE.TABLET).matches) ||
            watchForBreakpoint(VIEWPORT_TYPE.TABLET_L).matches
        ) {
            this.setState({
                isLVP: false
            });
        } else {
            this.setState({
                isLVP: false
            });
        }
    };

    resetFilter = (e) => {
        e.preventDefault();
        let btns = typeof document !== 'undefined' && document.querySelectorAll('[data-filtercode]');
        let arr = [];
        let filterCount = this.state.filterCount;

        btns.forEach((btn) => {
            if (btn.classList.contains('selected')) {
                arr.push(btn);
            }
        });
        arr.forEach((r) => {
            r.classList.remove('selected');
            filterCount[r.dataset.category] = 0;
        });
        this.setState(
            {
                filter: !this.state.filter,
                filterCount: filterCount,
                filters: ['all'],
                tempFilters: []
            },
            () => {
                this.props.updateFilters(this.state.filters);
            }
        );
    };
    /**
     * toggleFilter - toggle filter by drop down
     */
    toggleFilter = () => {
        analytics.clickTracking(this);
        this.setState(
            {
                filter: !this.state.filter
            },
            () => {
                if (this.state.filter) {
                    this.setState({ tempFilters: [] });
                } else {
                    if (this.state.tempFilters.length > 0) {
                        // remove All
                        let temp = this.state.filters;
                        let index = temp.indexOf('all');

                        if (index > -1) {
                            temp.splice(index, 1);
                        }
                        this.setState({ filters: temp });
                    }
                    let newFilters = this.state.filters.concat(
                        this.state.tempFilters
                    );

                    newFilters = [...new Set(newFilters)];

                    this.setState({ filters: newFilters }, () => {
                        this.props.updateFilters(this.state.filters);

                        if (
                            this.state.filters.findIndex(
                                (f) => f === 'myBooking'
                            ) !== -1
                        ) {
                            this.setState({
                                calendarTitle: this.props.attributes.labels
                                    .myBookingLabel
                            });
                        } else {
                            this.setState({
                                calendarTitle: this.props.attributes.labels
                                    .allBookingLabel
                            });
                        }
                    });
                }
            }
        );
        if (!this.state.isLVP) {
            if (!this.state.filter) {
                typeof document !== 'undefined' && document.body.classList.add('openOverlay');
            } else {
                typeof document !== 'undefined' && document.body.classList.remove('openOverlay');
            }
        }
    };
    /**
     * toggleAccordion - toggle filter by accordion
     * @param { object } evt event object
     */
    toggleAccordion = (evt) => {
        evt.preventDefault();
        evt.currentTarget.parentElement.classList.toggle('open');
        let closeOrOpen = evt.currentTarget.parentElement.classList.contains(
            'open'
        )
            ? 'open'
            : 'close';
        
        if (closeOrOpen === 'open') {
            evt.currentTarget.setAttribute('aria-expanded', true);
        } else {
            evt.currentTarget.setAttribute('aria-expanded', false);
        }
        const analyticsParams = {
            componentName: this.props.component,
            linkText: `${this.props.attributes.labels.filterByLabel}:${
                evt.currentTarget.textContent
            }:${closeOrOpen}`
        };

        analytics.customClicks(analyticsParams);

        if (!this.state.isLVP) {
            typeof document !== 'undefined' && document.body.classList.toggle('openOverlay');
        }
    };

    toggleLegend = (evt) => {
        analytics.clickTracking(this)
        evt.preventDefault();
        this.setState({
            legendOpen: !this.state.legendOpen
        });
        if (!this.state.isLVP) {
            typeof document !== 'undefined' && document.body.classList.toggle('openOverlay');
        }
    };
    /**
     * handleFilterClick - handle click event of filter
     * @param { object } evt event object
     */

    handleFilterClick = (e, filter, category) => {
        e.preventDefault();
        analytics.clickTracking(this);
        e.target.classList.toggle('selected');
        let temp = this.state.filters;
        let currentFilterCount = this.state.filterCount[category]
            ? this.state.filterCount[category]
            : 0;
        let filterCount = this.state.filterCount;

        if (e.target.classList.contains('selected')) {
            temp.push(filter);
            this.setState({ tempFilters: temp });
            currentFilterCount += 1;
        } else {
            let index = temp.indexOf(filter);

            if (index > -1) {
                temp.splice(index, 1);
            }
            this.setState({ filters: temp });
            currentFilterCount -= 1;
        }

        filterCount[category] = currentFilterCount;

        this.setState({ filterCount: filterCount });
    };

    /**
     * generateItems - Returns filter HTML for chosen filter
     * @param { array } filters Filters array to generate options
     * @returns {ReactDOMObject} Filter By Options
     */
    generateItems = (filters) => {
        const filterItemHtml = filters.map((obj, i) => (
            <div
                className="item"
                key={i}
                // onChange={(e) => console.log('change')}
            >
                <button
                    aria-label={obj.name}
                    className="head"
                    data-linkText={obj.name}
                    onClick={(e) => this.toggleAccordion(e)}
                    data-linktext={obj.name}
                    data-componentname={this.props.type}
                    aria-expanded={false}
                >
                    {obj.name}{' '}
                    {this.state.filterCount[obj.code] > 0 && (
                        <span className="counter">
                            {this.state.filterCount[obj.code]}
                        </span>
                    )}{' '}
                </button>
                <div className="content">
                    {obj.values.map((filter, j) => {
                        // const filterCode = (filter.code || filter.code === false) && filter.code.toString();
                        let temp = this.state.filters;
                        let index = temp.indexOf(filter.code);
                        const checkSelect = index > -1 ? true : false;
                        const selectedClass = filter.selected ? 'selected' : '';
                        const disabled = filter.count <= 0;

                        return (
                            <button
                                aria-label={`
                                    ${
                                        checkSelect
                                            ? `${filter.name}Selected`
                                            : `${filter.name}Unselected`
                                    }`}
                                data-componentname={this.props.type}
                                data-linktext={filter.name}
                                data-filtercode={filter.code}
                                data-category={obj.code}
                                disabled={`${disabled ? 'disbaled' : ''}`}
                                key={j}
                                className={`${selectedClass} ${
                                    disabled ? 'disabled' : ''
                                }`}
                                onClick={(e) =>
                                    this.handleFilterClick(
                                        e,
                                        filter.code,
                                        obj.code
                                    )
                                }
                            >
                                {filter.name}
                            </button>
                        );
                    })}
                </div>
            </div>
        ));

        return filterItemHtml;
    };

    getFilters() {
        let {
            applyFilterLabel = '',
            resetFilterLabel = '',
            filterByLabel,
            closeLabel
        } = this.props.attributes.labels;
        const filterItem = this.generateItems(this.props.attributes.facets);

        return (
            <div
                className="filters-container"
                ref={(filters) => (this.filtersDd = filters)}
            >
                <div className="filters">
                    <div
                        onClick={() => this.toggleFilter()}
                        tabIndex="0"
                        role="button"
                        onKeyPress={() => this.toggleFilter()}
                        aria-expanded={this.state.filter ? true : false}
                        className={`select ${
                            this.state.filter ? 'active' : ''
                        }`}
                    >
                        {filterByLabel}
                    </div>
                </div>
                <div
                    className={`filter-container ${
                        this.state.filter ? 'open' : ''
                    }`}
                >
                    <div
                        className="filter-head"
                        onClick={() => this.toggleFilter()}
                        tabIndex="0"
                        role="button"
                        onKeyPress={() => this.toggleFilter()}
                    >
                        <span>{filterByLabel}</span>
                        <span className="cta-menu-close">
                            {closeLabel} Close
                        </span>
                    </div>
                    <div className="filter-content">
                        {filterItem}
                        <div className="cta-holder">
                            <button
                                className="btn"
                                onClick={() => this.toggleFilter()}
                                data-linktext={applyFilterLabel}
                                data-componentname={this.props.type}
                            >
                                {applyFilterLabel}
                            </button>
                            {Object.keys(this.state.filterCount).length > 0 && (
                                <button
                                    className="btn-secondary"
                                    onClick={(e) => this.resetFilter(e)}
                                    data-linktext={'reset filters'}
                                    data-componentname={this.props.type}
                                >
                                    {resetFilterLabel}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    render() {
        // const { title, labels } = this.props;
        let { product, information } = this.props.attributes.legend;
        let labels = this.props.attributes.labels;

        return (
            <div className="calendarToolbar">
                <a
                    tabIndex="0"
                    className="calendarToolbar__item"
                    data-linktext={labels.printLabel}
                    data-componentname={this.props.type}
                    onClick={(e) => {
                        //e.preventDefault();
                        window.print();
                    }}
                >
                    <span className="print__icon" />
                    <span className="">{labels.printLabel}</span>
                </a>
                <div
                    className={`calendarToolbar__item ${
                        this.state.legendOpen ? 'open' : ''
                    }`}
                    ref={(calendarLegend) => (this.legend = calendarLegend)}
                >
                    <a
                        tabIndex="0"
                        className="calendarToolbar__ddOpen"
                        onClick={(e) => this.toggleLegend(e)}
                        data-linktext={labels.legendLabel}
                        data-componentname={this.props.type}
                    >
                        <span className="legend__icon" />
                        <span className="">{labels.legendLabel}</span>
                        <span className="close">{labels.closeLabel}</span>
                    </a>
                    <div className="calendarToolbar__dd">
                        <ul className="calendarToolbar__list">
                            {product.map((singleLegendItem, index) => {
                                return (
                                    <li
                                        key={`item${index}`}
                                        className={`calendarToolbar__ddItem ${
                                            singleLegendItem.code
                                        } `}
                                    >
                                        {singleLegendItem.label}
                                    </li>
                                );
                            })}
                        </ul>
                        <ul className="calendarToolbar__list calendarToolbar__listAlt">
                            {information && information.length > 0 && information.map((singleLegendItem, index) => {
                                return (
                                    <li
                                        key={`itemAlt${index}`}
                                        className={`calendarToolbar__ddItem ${
                                            singleLegendItem.code
                                        } `}
                                    >
                                        {singleLegendItem.label}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
                <h1 className="calendarLabel">{this.state.calendarTitle}</h1>
                {this.getFilters()}
            </div>
        );
    }
}

calendarFilter.propTypes = {};

export default calendarFilter;
