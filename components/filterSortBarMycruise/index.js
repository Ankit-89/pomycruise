/**
 * C044a Filter SortBar Component
 * @exports FilterSortBar
 */
import React from 'react';
import ShorexCard from '../shorexCard';
import analytics from '../commons/CUK/analytics';
import { scrollToTop, convertValueToVaildDecimalPoint } from '../commons/CUK/utilities';
// import equalizer from '../commons/equalizer';
// const COOKIE_FAVORITE_SHOREX = 'favoriteShoreX';
// import Link from '../commons/CUK/link';
import CustomDropdown from '../commons/CUK/customDropdown';
import fetchData from '../commons/CUK/fetch-data';
import SessionStorage from '../commons/CUK/session-storage';
import CategorySlider from '../../components/categorySlider';
import NotificationBanner from '../../components/notificationBanner';
import extractChildComponent from '../commons/CUK/extractChildComponent';
import { breakpoint } from '../../library/js/config/index';
import validateSession from '../commons/CUK/validateSession';
import EmptyState from '../commons/CUK/emptyState';

const VIEWPORT_TYPE = breakpoint.VIEWPORT_TYPE;
const watchForBreakpoint = breakpoint.watchForBreakpoint;

class filterSortBarMycruise extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // ports: [],
            shore: [],
            sorts: [],
            // onboardActivityTiles: [],
            facets: [],
            filter: false,
            isLVP: false,
            filterCount: [],
            query: [],
            dates: [],
            possibleFacets: [],
            products: []
        };
        this.currentSortTitle = '';
        this.currentSortTagKey = '';

        this.currentFilterTagKey = '';
        this.pagination = {
            currentPage: 0,
            pageSize: 1,
            sort: 1,
            totalPages: 1,
            totalResults: 1
        };
        this.paginationDOM = '';
        this.totalResults = 0;
        this.filterApplied = [];
        this.appliedFilterHash = {};
        this.sortBySelectedItem = 'merchandised';
        this.notOnSaleAnymore = false;
    }

    componentDidMount() {
        // analytics.clickTracking(this);
        // const { filterTitle, filterTagKey } = this.props.sortBy[0];
        // this.currentSortTagKey ? this.filterResults() : this.sortBy({ filterTitle, filterTagKey });
        // this.filterResults();

        const picturefill = require('picturefill');

        picturefill();

        const mqlLVP = watchForBreakpoint(VIEWPORT_TYPE.DESKTOP);

        this.handleResize(mqlLVP);
        mqlLVP.addListener((mql) => {
            this.handleResize(mql);
        });

        this.onLoadHash();
    }

    sendApiRequest(query) {
        const { services } = this.props;
        const { productSearchApi } = services.urls;
        const configs = typeof window !== 'undefined' ? window.configs : {};
        const apiKey = configs.apikeyMycruise;
        const header = SessionStorage.getItem('header');
        const urlString = `${productSearchApi}${query}`;
        fetchData(urlString, {
            method: 'GET',
            headers: {
                'X-CommonData': JSON.stringify(header),
                'X-Source-Identity-Token-0': apiKey
            }
        }).then(
            (response) => {
                this.resolveAPIData(response, true);
            },
            (err) => {
                this.getFocus();
            }
        );
    }

    /**
     * handleResize - Resize event for media devices
     *
     * @param {object} mql - Match media object
     */
    handleResize(mql) {
        this.setState({
            isLVP: mql.matches
        });
    }

    componentDidUpdate() {
        // analytics.clickTracking(this);
    }

    onLoadHash() {
        // getting the # part
        const location =
            typeof window !== 'undefined'
                ? window.location.hash.replace(/^#\/?|\/$/g, '').split('/')
                : '';
        if (location.length > 0 && location[0] !== '') {
            // location is already ready for create the api call
            this.firstFilterResults(location);
        } else this.filterResults();
    }

    /**
     * get filterTagKey
     * @param {string} apiKey - selected filter information from URL
     * @returns {string} filterTagKey - selected filter TagKey from filter props
     */
    // getFilterTagKey = (apiKey) => {
    //     let filter = this.state.facets.filter(item => item.code === apiKey)[0];

    //     return filter && filter.code && filter.query.query.value;
    // }

    updateURLHash = (updateUrl) => {
        // const { start, rows } = this.pagination;
        if (typeof window !== 'undefined') {
            window.location.hash = `${updateUrl}`;
        }
    };

    /**
     * Setting filter information
     * @param {Object} Filter - new filter information
     * @param {Object} selectedItem - new option information
     */
    sortBy = ({ code, name }, selectedItem) => {
        this.sortBySelectedItem = code;
        this.filterResults();
    };

    /* filters on page load */
    firstFilterResults = (query) => {
        const queryForApi = `${query}`;
        this.sendApiRequest(queryForApi);
        // this.setState(() => ({ query }));
    };

    filterPort = (portCode) => {
        // portCode === false if all ports is active
        // const portDates = portCode ? portCode : false;
        // this.setState(
        //     () => ({
        //         dates: portDates
        //         // query
        //     }),
        //     () => {
        //         this.filterResults();
        //     }
        // );
        this.setState(
            () => ({
                // dates: portDates
                query: portCode
            }),
            () => {
                this.filterResults();
            }
        );
    };

    /**
     * Filter Results
     */
    filterResults = () => {
        const { component, labels } = this.props;
        const { query, dates } = this.state;
        // /{baseSiteId}/products/search baseSiteId --> pass by AEM
        const sort =
            this.sortBySelectedItem.length > 0
                ? `&sort=${this.sortBySelectedItem}`
                : '';

        let toUpdate = false;
        // this.filterApplied.map((singleFilter, index)=> {
        //     newQuery = (`${newQuery}:${singleFilter.cat}:${singleFilter.value}`);
        // });
        let newQuery = '';
        let newDates = '';
        if (query && query.length > 0 || query === false || dates.length > 0 || !dates) {
            if (dates.length > 0 || !dates) {
                newDates =
                    dates.length > 0 ? `:startDate:startDate:${dates[0]}&` : ``;
                toUpdate = true;
                this.setState({
                    query: ''
                });
            }
            newQuery =
                query.length > 0 || dates.length > 0
                    ? `&query=${newDates}${query}`
                    : ``;
            toUpdate = true;
        }
        // let newDates = '';
        // if (dates.length > 0 || !dates) {
        //     newDates =
        //         dates.length > 0 ? `&:startDate:startDate:${dates[0]}` : ``;
        //     toUpdate = true;
        // }
        let page = '';
        if (
            (this.pagination.page || this.pagination.page === 0) &&
            this.pagination.page !== this.pagination.currentPage
        ) {
            page = `&currentPage=${this.pagination.page}`;
            toUpdate = true;
        }
        const updateUrl = `?productType=SHOREX&pageSize=12${sort}${newQuery}${page}`;
        // const analyticsParams = {
        //     componentName: component,
        //     linkText: `${labels.filterByLabel}:${labels.resetFilterLabel}`
        // };

        // analytics.customClicks(analyticsParams);

        this.sendApiRequest(updateUrl);

        if (toUpdate) {
            this.updateURLHash(updateUrl);
        }
    };

    getFocus = () => {
        if (this.portFirstTile !== undefined) {
            this.portFirstTile.children[0].focus();
        }
    };

    /**
     * resolveAPIData
     * @param {object} response from API
     */
    resolveAPIData = (response, isFirstLoad) => {
        const header = SessionStorage.getItem('header');
        const cruiseData = SessionStorage.getItem('cruiseData');
        let dobArray = [];
        header.passengers.forEach((passenger) => {
            dobArray.push(passenger.birthDate);
        })
        const config =
            typeof window !== 'undefined'
                ? window.configs
                : '';
        const customCurrencyCode = config.brand.toLowerCase() === "po" ? "gbp" : "usd";
        const currencyLocale =
            typeof window !== 'undefined'
                ? window.configs.currencyLocale
                : ''
        let { results = 0, products, facets, sorts, breadcrumbs } = response;
        let newFacets = facets !== 'undefined' ? facets : [];
        let productsArr = [];
        response.products.forEach((product, index) => {
            let productObj = {
                listPosition: index,
                productID: product.code,
                skuID: product.code,
                skuName: product.name,
                productName: product.name,
                startDateTime: product.startDates.length ? product.startDates.join() : product.startDates,
                status: product.stock.stockLevelStatus,
                shorexAttributes: {
                    portName: product.port.shortName,
                    activityLevel: product.activityLevel,
                    language: '',
                    duration: product.duration,
                    transport: '',
                    minAge: '',
                    maxAge: '',
                    tourType: '',
                    tourCategory: '',
                    tourFeatures: ''
                },
                diningCategory: '',
                unitSalePrice_GBP: product.fromPrice && product.fromPrice.value ? convertValueToVaildDecimalPoint(product.fromPrice.value) : '',
                unitPrice_GBP: product.fromPrice && product.fromPrice.value ? convertValueToVaildDecimalPoint(product.fromPrice.value) : '',
                unitSalePrice_local: product.fromPrice && product.fromPrice.value ? convertValueToVaildDecimalPoint(product.fromPrice.value) : '',
                unitPrice_local: product.fromPrice && product.fromPrice.value ? convertValueToVaildDecimalPoint(product.fromPrice.value) : ''
            }
            productsArr.push(productObj);
        });
        const comp = this.filterSortBarContainer;
        const filterSelected = comp.querySelectorAll('.selected') || [];
        // analytics.setAdditionalPageTrackAttributes({
        //     myCruiseDetails: {
        //         bookingNumber: header.bookingRef,
        //         voyageID: header.cruiseCode,
        //         voyageName: cruiseData.cruiseName,
        //         shipName: cruiseData.shipName,
        //         depDate: header.embarkationDate,
        //         destName: "",
        //         durationDays: header.physicalCruiseDuration,
        //         depPortName: cruiseData.embarkPort,
        //         destPortName: cruiseData.disembarkPort,
        //         stateroomType: "",
        //         numGuests: header.passengers.length,
        //         dob: dobArray,
        //     },
        //     loginStatus: "logged in",
        //     loginType: (header.agent) ? header.agent.agentType : 'customer',
        //     AgentID: (header.agent) ? header.agent.id : '',
        //     crmID: "",
        //     country: header.market,
        //     languageSelected: header.language.substring(0, 2),
        //     customCurrencyCode: customCurrencyCode,
        //     memberLoyaltyLevel: header.customer.loyaltyTier,
        //     server: "",
        //     localDayTime: new Date().toString(),
        //     timePartingCodes: "",
        //     pageType: config.pageName,
        //     //Please refer Page and Content Hierarchy Tabs for below values
        //     sectionLevelOne: "",
        //     sectionLevelTwo: "",
        //     sectionLevelThree: "",
        //     sectionLevelFour: "",
        //     pageName: config.pageName,
        //     pageChannel: "",
        //     pageHier: "",
        //     //Please refer Page and Content Hierarchy Tabs for above values
        //     ecomStep: "",
        //     event: 'event305',
        //     searchResultsNumber: response.products.length,
        //     sortBy: 'Merchandise',
        //     listingProductType: 'SHOREX',
        //     filterCategorySel: filterSelected,
        //     searchSelections: filterSelected,
        //     myCruiseListingItems: productsArr
        // });
        // analytics.clickTracking(this);
        let newState = {};
        let stateChanged = false;

        // pass facet to category slider to map the date with the facet
        // this.setState({
        //     possibleFacets: facets
        // });

        this.pagination = response.pagination;
        this.totalResults = this.pagination.totalResults;
        this.paginationDOM = this.generatePagination();
        this.notOnSaleAnymore = response.notOnSaleAnymore;
        // if (products) {
        //     newState.shore = products;
        //     stateChanged = true;
        // }
        // if (facets && facets.length > 0) {
        //     newState.facets = facets;
        //     stateChanged = true;
        // }
        if (breadcrumbs.length > 0) {
            // newState.breadcrumbs = breadcrumbs;
            let activeFilters = {};
            breadcrumbs.map((activeFilter, index) => {
                const catId = activeFilter.facetCode;
                if (!activeFilters[catId]) {
                    activeFilters[catId] = 0;
                }
                activeFilters[catId] =
                    activeFilters[catId] >= 0
                        ? activeFilters[catId] + 1
                        : undefined;
                if (activeFilter.facetCode === 'startDate' && isFirstLoad) {
                    this.setState({
                        activePort: activeFilter.facetValueCode
                    });
                }
            });
            // if (isFirstLoad) {
            //     this.setState({
            //         query: response.currentQuery.query.value
            //     });
            // }
            // stateChanged = true;
            // newState.filterCount = activeFilters;
        }

        // if (sorts.length > 0) {
        //     newState.sorts = sorts;
        //     stateChanged = true;
        // }
        // if (stateChanged) {
        //     this.setState(() => newState);
        // }

        if (newFacets.length > 0) {
            let values = [];
            let i = 0;
            let actObj = newFacets.filter((singleFacet, index) => {
                if (singleFacet.code === 'activityLevel') { i = index; return true; }
                return false;
            });

            if (actObj[0].values) {
                if (actObj[0].values.length) {
                    actObj[0].values.forEach((value) => {
                        if (value.code === 'LOW') {
                            values.push(value);
                        }
                    });
                    actObj[0].values.forEach((value) => {
                        if (value.code === 'MODERATE') {
                            values.push(value);
                        }
                    });
                    actObj[0].values.forEach((value) => {
                        if (value.code === 'HIGH') {
                            values.push(value);
                        }
                    });
                }

                actObj[0].values = values;
                newFacets[i] = actObj[0];
            }
        }

        this.setState({
            products: products,
            possibleFacets: newFacets,
            sorts: sorts,
            breadcrumbs: breadcrumbs,
            shore: products,
            facets: newFacets
        });
    };

    /**
     * Pagination Markup
     * @param {Number} totalResults - Total results from current sort criteria.
     * @returns {ReactDOMObject} Pagination
     */
    generatePagination() {
        const { labels } = this.props;
        const { ofLabel, previousLabel } = labels;
        // const currentPage = Math.floor( this.pagination.start / noOfResults) + 1;
        // const totalPages = Math.ceil( totalResults / noOfResults ) || this.pagination.totalPages;
        const currentPage = Math.floor(this.pagination.currentPage) + 1;
        const totalPages = Math.floor(this.pagination.totalPages);
        const totalResults = this.pagination.totalResults;
        const prevDisabled = currentPage <= 1;
        const nextDisabled = currentPage === totalPages;

        // this.pagination.totalPages = totalPages;
        const elmnt = typeof document !== 'undefined' && document.getElementsByClassName("filter-sort-bar-main");
        if (elmnt && elmnt.length) { elmnt[0].scrollIntoView(); }

        return (
            <div className={`pagination ${totalResults > 0 ? '' : 'hide'}`}>
                <button
                    className={`prev ${prevDisabled ? 'disable' : ''}`}
                    onClick={(e) => this.gotoPage(currentPage - 2, e)}
                    aria-disabled={prevDisabled}
                    aria-label={previousLabel}
                    data-linktext={'filter-prev'}
                />
                <span className="pages">
                    <span className="current-page">{`${currentPage}`}</span>
                    <span className="of-label">{`${ofLabel}`}</span>
                    <span className="total-pages">{`${totalPages}`}</span>
                </span>
                <button
                    className={`next ${nextDisabled ? 'disable' : ''}`}
                    onClick={(e) => this.gotoPage(currentPage, e)}
                    aria-disabled={nextDisabled}
                    aria-label={labels.nextLabel}
                    data-linktext={'filter-next'}
                />
            </div>
        );
    }

    /**
     * Pagination
     * @param {Number} pageNumber - desired page number
     * @param {Object} event - triggered event
     */
    gotoPage = (pageNumber, event) => {
        // analytics.clickTracking(this);
        const targetElement = event.target.parentNode.parentElement;

        if (pageNumber >= 0 && pageNumber <= this.pagination.totalPages) {
            this.pagination = {
                ...this.pagination,
                page: pageNumber
                // start: (pageNumber - 1) * this.pagination.rows
            };
            this.filterResults();

            if (
                targetElement &&
                targetElement.classList.contains('bottom-pagination')
            ) {
                scrollToTop(this.filterSortBarContainer);
            }
        }
    };

    /**
     * ShoreXResults from current sort and filter
     * @param {Object} shoreXTiles - shoreXResults results from api
     * @returns {ReactDOMObject} Port cards.
     */
    generateShoreXTiles = () => {
        // const { showShorePrice, hideCollectionBanner } = this.props;
        const { childComponents, labels, services } = this.props;
        const { country } = services.headers;
        let overlayProps = extractChildComponent(
            childComponents,
            'shorexOverlay'
        );
        /* const { portCalls } = !validateSession.checkCookie(['wcmmode'])
            ? SessionStorage.getItem('portCalls')
            : []; */
        const { portCalls } = SessionStorage.getItem('portCalls');
        let shoreXTiles = this.state.shore;
        return shoreXTiles.map((shoreXTile, i) => {
            const imageUrl = shoreXTile.primaryImageUrl;
            const image = {
                alt: shoreXTile.name,
                0: {
                    '1x': `${imageUrl}.image.440.330.low.jpg`,
                    '2x': `${imageUrl}.image.880.660.low.jpg`
                },
                376: {
                    '1x': `${imageUrl}.image.440.330.medium.jpg`,
                    '2x': `${imageUrl}.image.880.660.medium.jpg`
                },
                769: {
                    '1x': `${imageUrl}.image.440.330.high.jpg`,
                    '2x': `${imageUrl}.image.880.660.high.jpg`
                }
            };
            /*const port = portCalls.find(
                (port) => port.id === shoreXTile.port.code
            );*/

            const port = shoreXTile.port;

            shoreXTile = { ...shoreXTile, image, port };
            overlayProps = {
                ...overlayProps,
                code: shoreXTile.code
            };
            return (
                <div className="shore-detail-tile tile-detail" key={i}>
                    <ShorexCard
                        key={i}
                        index={i}
                        {...shoreXTile}
                        overlay={overlayProps}
                        labels={labels}
                        languages={overlayProps.attributes.guideLanguages}
                        bannerNotOnSale={this.notOnSaleAnymore}
                        country={country}
                    />
                </div>
            );
        });
    };

    /**
     * toggleAccordion - toggle filter by accordion
     * @param { object } evt event object
     */
    toggleAccordion = (evt) => {
        const { component, labels } = this.props;
        const { currentTarget } = evt;
        currentTarget.parentElement.classList.toggle('open');

        // const analyticsParams = {
        //     componentName: component,
        //     linkText: `${labels.filterByLabel}:${currentTarget.textContent}`
        // };
        // analytics.customClicks(analyticsParams);
    };

    /**
     * handleFilterClick - handle click event of filter
     * @param { object } evt event object
     */

    handleFilterClick = (e, catId, subId, i, singleQuery) => {
        // analytics.clickTracking(this);
        const { filterCount } = this.state;
        e.preventDefault();
        this.currentFilterTagKey = subId;
        this.setState(
            () => ({
                query: singleQuery
            }),
            () => {
                this.filterResults();
            }
        );
        // verify if the filter is already selected
        if (!e.target.classList.contains('selected')) {
            this.filterApplied.push({ cat: catId, value: subId });
        } else {
            this.filterApplied = this.filterApplied.filter(
                (item) => item.value !== subId
            );
        }
        // e.target.classList.toggle('selected');
        // counts number of filters
        const filters = filterCount;
        if (!filters[catId]) {
            filters[catId] = 0;
        }
        filters[catId] = !e.target.classList.contains('selected')
            ? filters[catId] + 1
            : filters[catId] - 1;
        this.setState(() => ({
            filterCount: filters
        }));
    };

    closeAllAccordion = () => {
        let elementsOpen = typeof document !== 'undefined' && document.getElementsByClassName('open item');
        if (elementsOpen.length > 0) {
            [...elementsOpen].forEach((accordionOpen, index) => {
                accordionOpen.classList.remove('open');
            });
        }
    };

    /**
     * toggleFilter - toggle filter by drop down
     */
    toggleFilter = () => {
        // analytics.clickTracking(this);
        this.closeAllAccordion();
        this.setState({
            filter: !this.state.filter
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
        });

        if (!this.state.isLVP && typeof document !== 'undefined') {
            if (!this.state.filter) {
                document.body.classList.add('openOverlay');
            } else {
                document.body.classList.remove('openOverlay');
            }
        }
    };
    /**
     * generateItems - Returns filter HTML for chosen filter
     * @param { array } filters Filters array to generate options
     * @returns {ReactDOMObject} Filter By Options
     */
    // generateActiveFilters = (activeFilters) => {
    //     const activeFilterItemHtml = activeFilters.map((obj, i) => (
    //         <div
    //             className="item"
    //             key={i}
    //         >
    //             <button
    //                 className="head"
    //                 data-linkText={obj.facetName}
    //                 onClick={(e) => this.toggleAccordion(e)}
    //             >
    //                 {obj.facetName} <span className="counter">1</span>
    //                 )}
    //             </button>
    //             <div className="content">
    //                 <button
    //                     disabled={false}
    //                     className="selected"
    //                     onClick={(e) =>
    //                         this.handleFilterClick(
    //                             e,
    //                             obj.code,
    //                             filter.code,
    //                             i,
    //                             filter.query.query.value
    //                         )
    //                     }
    //                 >
    //                     {obj.facetValueName}
    //                 </button>
    //             </div>
    //         </div>
    //     ));
    //     return activeFilterItemHtml;
    // };
    /**
     * generateItems - Returns filter HTML for chosen filter
     * @param { array } filters Filters array to generate options
     * @returns {ReactDOMObject} Filter By Options
     */
    generateItems = (filters) => {
        let { labels } = this.props;
        const filterItemHtml = filters.map((obj, i) => {
            if (obj.code !== 'port' && obj.code !== 'startDate') {
                return (
                    <div className="item" key={i}>
                        <button
                            className="head"
                            data-linkText={obj.name}
                            onClick={(e) => this.toggleAccordion(e)}
                        >
                            {labels[obj.code]}
                            {this.state.filterCount[obj.code] > 0 && (
                                <span className="counter">
                                    {this.state.filterCount[obj.code]}
                                </span>
                            )}
                        </button>
                        <div className="content">
                            {obj.values.map((filter, j) => {
                                // const filterCode = (filter.code || filter.code === false) && filter.code.toString();
                                const selectedClass = filter.selected
                                    ? 'selected'
                                    : '';
                                const disabled = filter.count <= 0;

                                return (
                                    <button
                                        disabled={`${
                                            disabled ? 'disbaled' : ''
                                            }`}
                                        key={j}
                                        className={`${selectedClass} ${
                                            disabled ? 'disabled' : ''
                                            }`}
                                        onClick={(e) =>
                                            this.handleFilterClick(
                                                e,
                                                obj.code,
                                                filter.code,
                                                i,
                                                filter.query.query.value
                                            )
                                        }
                                    >
                                        {labels[filter.code]}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );
            }
        });

        return filterItemHtml;
    };
    /**
     * filterByMarkup - Returns filter HTML for chosen filter
     *
     * @returns {ReactDOMObject} Filter By Options
     */
    filterByMarkup = () => {
        const { labels } = this.props;
        let {
            applyFilterLabel = '',
            resetFilterLabel = ''
        } = this.props.labels;

        // const { facets } = this.props;
        let filters = {};
        const filterItem = this.generateItems(this.state.facets);
        // const activeFilterItem = this.state.breadcrumbs
        //     ? this.generateActiveFilters(this.state.breadcrumbs)
        //     : '';
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
                        className={`select ${
                            this.state.filter ? 'active' : ''
                            }`}
                    >
                        {this.props.labels.filterByLabel}
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
                        <span>{this.props.labels.filterByLabel}</span>
                        <span className="cta-menu-close">
                            {this.props.labels.closeLabel}
                        </span>
                    </div>
                    <div className="filter-content">
                        {/* {activeFilterItem} */}
                        {filterItem}
                        <div className="cta-holder">
                            <button
                                className="btn"
                                onClick={() => this.toggleFilter()}
                            >
                                {applyFilterLabel}
                            </button>
                            {Object.keys(this.state.filterCount).length > 0 && (
                                <button
                                    className="btn-secondary"
                                    onClick={() => this.resetFilter()}
                                >
                                    {resetFilterLabel}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };
    /**
     * resetFilter - Reset all the applied filters
     */
    resetFilter = () => {
        const { component, labels } = this.props;
        const comp = this.filterSortBarContainer;

        const filterSelected = comp.querySelectorAll('.selected') || [];

        for (let i = 0; i < filterSelected.length; i++) {
            filterSelected[i].classList.remove('selected');
        }

        this.setState(
            () => ({
                filter: false,
                filterCount: [],
                query: false
            }),
            () => this.filterResults()
        );

        this.filterApplied = [];
        this.appliedFilterHash = {};
        this.filterCount = 0;

        // const analyticsParams = {
        //     componentName: component,
        //     linkText: `${labels.filterByLabel}:${labels.resetFilterLabel}`
        // };

        // analytics.customClicks(analyticsParams);
    };

    /**
     * Show dropdown
     * @param {Object} value - If to be opened or not
     */
    show = (value) => {
        const { isLVP } = this.state;
        if (!isLVP && typeof document !== 'undefined') {
            document.body.classList.add('openOverlay');
        }

        this.setState(() => ({ dropdownShow: value }));
        typeof document !== 'undefined' && document.addEventListener('click', this.hide);
    };

    /**
     * Hide dropdown
     */
    hide = () => {
        // analytics.clickTracking(this);
        const { isLVP } = this.state;
        this.setState(() => ({ dropdownShow: false }));
        typeof document !== 'undefined' && document.removeEventListener('click', this.hide);

        if (!isLVP && typeof document !== 'undefined') {
            document.body.classList.remove('openOverlay');
        }
    };

    preventClose = (event) => {
        event.nativeEvent.stopImmediatePropagation
            ? event.nativeEvent.stopImmediatePropagation()
            : event.stopPropagation();
    };

    /**
     * Change dropdown
     * @param {Object} selectedItem - Selected dropdown option.
     */
    onChangeDropdown = (selectedItem) => {
       // console.log('sending analytics parameter from change dropdown function of filterSortByMycruise... selected item is ',selectedItem);
        // analytics.clickTracking(this);
        const { sorts } = this.state;
        this.sortBy(sorts[selectedItem.index], selectedItem);
    };

    generateDd = () => {
        const { labels = {} } = this.props;
        const { sorts, dropdownShow, isLVP } = this.state;
        let { sortByLabel = '', closeLabel = '' } = labels;
        let sortByText = `${sortByLabel}`;

        const dropdownClass = dropdownShow ? ' show' : '';
        // CK - removed Recommended from list
        const filteredList = sorts.filter((item, index) => {
            return item.name !== 'Recommended';
        });

        let filterItemHtml = (
            <div className={`sort-dropdown${dropdownClass}`}>
                {isLVP ? (
                    <CustomDropdown
                        label={sortByText !== 'country' ? sortByText : ''}
                        list={sorts.map((item) => item.name === 'Recommended' ? '' : item.name)}
                        // list={sorts.map((item) => labels[item.code])}
                        defaultSelection=""
                        onChangeDropdown={this.onChangeDropdown}
                        onChangeState={this.show}
                    />
                ) : (
                        <div className="sort-dropdown-overlay ">
                            {dropdownShow && (
                                <div className="action-bar">
                                    <span className="label"> {sortByText} </span>
                                    <button
                                        className="cta-menu-close"
                                        onClick={this.hide}
                                    >
                                        {closeLabel}
                                    </button>
                                </div>
                            )}

                            <CustomDropdown
                                onChangeState={this.show}
                                label={sortByText !== 'country' ? sortByText : ''}
                                //list={sorts.map((item) => labels[item.code])}
                                list={sorts.map((item) => labels[item.code])}
                                list={filteredList.map((item) => item.name)}

                                defaultSelection=""
                                onChangeDropdown={this.onChangeDropdown}
                            />
                        </div>
                    )}
            </div>
        );

        return filterItemHtml;
    };

    render() {
        const {
            labels = {},
            noResultsFound,
            childComponents,
            services
        } = this.props;
        const { shore, ports, products } = this.state;
        let { resultsLabel, singleResult } = labels;

        resultsLabel = this.totalResults > 1 ? resultsLabel : singleResult;
        // const ports = this.generatePorts(ports);
        const shoreXTiles =
            products === shore ? this.generateShoreXTiles() : [];
        const notOnSale = this.notOnSaleAnymore;
        const notificationProps = extractChildComponent(
            childComponents,
            'notificationBanner'
        );
        const categoryProps = extractChildComponent(
            childComponents,
            'categorySlider'
        );
        const emptyState = extractChildComponent(childComponents, 'emptyState');

        // let ports = this.state.facets.filter((facet, index) => {
        //     return facet.code === 'port';
        // });
        let filterFacet = Object.entries(this.state.possibleFacets).find(
            (facet, index) => {
                return facet[1].code === 'startDate';
            }
        );
        return (
            <div
                className={`filter-sort-bar-container `}
                ref={(filterSortBarContainer) =>
                    (this.filterSortBarContainer = filterSortBarContainer)
                }
            >
                <CategorySlider
                    {...categoryProps.attributes}
                    services={services}
                    onSelectPort={this.filterPort}
                    activePort={this.state.activePort}
                    facetPort={filterFacet}
                />
                {shore.length > 0 ? (
                    <div className="filter-sort-bar-main">
                        <div className="content-wrapper">
                            <div className="results-count">
                                <span className="total-results">
                                    {`${this.totalResults} `}
                                </span>
                                {resultsLabel}
                            </div>
                            {this.generateDd()}
                            <div className="top-pagination">
                                {this.paginationDOM}
                            </div>

                            {this.filterByMarkup()}
                        </div>
                    </div>
                ) : (
                        <EmptyState
                            {...emptyState.attributes}
                            className="shorexEmpty"
                        />
                    )}
                {notOnSale && (
                    <NotificationBanner {...notificationProps.attributes} />
                )}
                <div className="top-pagination-svp">{this.paginationDOM}</div>

                {/* {this.totalResults === 0 && (
                    <div className="no-results">{noResultsFound}</div>
                )} */}

                {shore.length > 0 && (
                    <div className="shores tiles-container">{shoreXTiles}</div>
                )}

                <div className="pagination-svp">
                    <div className="bottom-pagination">
                        {this.paginationDOM}
                    </div>
                </div>
            </div>
        );
    }
}

export default filterSortBarMycruise;
