import React, { Component } from 'react';
import PropTypes from 'prop-types';
import analytics from '../analytics';
import Link from '../link';
import SessionStorage from '../session-storage';
import Slider from 'react-slick';

class tabs extends Component {
    constructor(props) {
        super(props);
        this.state = {
            nextButton: false,
            prevButton: false,
            resizeId: false,
            selected: this.props.selected,
            settings: {
                dots: false,
                arrows: true,
                infinite: false,
                speed: 500,
                slidesToShow: 5,
                slidesToScroll: 5,
                initialSlide: 0,
                responsive: [
                    {
                        breakpoint: 600,
                        settings: {
                            arrows: false,
                            slidesToShow: 3,
                            slidesToScroll: 3
                        }
                    },
                    {
                        breakpoint: 480,
                        settings: {
                            slidesToShow: 2,
                            slidesToScroll: 2
                        }
                    }
                ]
            }
        };
    }

    componentWillReceiveProps(props) {
        // const { selected } = this.props,
        //     selectedTab = this.props.children[selected];
        // console.log(selected, 'tabs');
        // this.setState({
        //     selected
        // });
        // const title = selectedTab && selectedTab.props.title;
        // const componentName = selectedTab && selectedTab.props.componentName;
        //commented for the child tabs in before you sale
        // this.handleClick(
        //     selected,
        //     title,
        //     componentName,
        //     new CustomEvent('tabSelect')
        // );
    }

    shouldComponentUpdate(nextProps, nextState) {
        return this.props !== nextProps || this.state !== nextState;
    }

    handleSlickNextSlide = () => {
        this.setState(
            {
                nextBtnClick: true,
                prevBtnClick: false,
                isDisabledPrevButton: false
            },
            () => {
                this.slider.slickNext();
            }
        );
    };

    handleSlickPrevSlide = () => {
        this.setState(
            {
                nextBtnClick: false,
                prevBtnClick: true
            },
            () => {
                this.slider.slickPrev();
            }
        );
    };

    handleClick = (index, tabName, linkText, componentName, event) => {
        event.preventDefault();

        const { tabClickHandler } = this.props;

        this.setState(
            {
                selected: index
            },
            () => {
                typeof window !== 'undefined' && window.dispatchEvent(
                    new CustomEvent('tabSelect', {
                        detail: [componentName, index]
                    })
                );
            }
        );

        this.props.children.length &&
            this.props.children.map((item, index) => {
                if (this.props.internal) {
                    this.tabContent.children[
                        `tabpanel-content-${index}`
                    ].className =
                        'tabpanel-content-hide';
                } else {
                    this.tabContent.children[`tab-content-${index}`].className =
                        'tab-content-hide';
                }
            });
        if (this.tabContent) {
            if (this.props.internal) {
                this.tabContent.children[
                    `tabpanel-content-${index}`
                ].className =
                    'tabpanel-content-show';
            } else {
                this.tabContent.children[`tab-content-${index}`].className =
                    'tab-content-show';
            }
        }

        const analyticsParams = {
            linkText: `tab: ${linkText}`,
            componentName: this.props.componentName
        };
        SessionStorage.setItem('selectedBeforeYouSailTab', tabName);
        
        analytics.customClicks(analyticsParams);

        tabClickHandler && tabClickHandler(index);
    };

    createTabClass = () => {
        const usableTabs = this.props.children.filter((tab) => !!tab);

        return usableTabs.length > 2 ? 'tabs-labels full-width' : 'tabs-labels';
    };

    labels = (child, index) => {
        var activeClass =
                typeof index !== 'undefined'
                    ? this.state.selected === index
                        ? 'active'
                        : ''
                    : 'active',
            ariaSelected = activeClass === 'active' ? true : false;

        if (child) {
            if (this.props.internal) {
                this.tabId = `tabpanel${index}`;
            } else {
                this.tabId = `tab${index}`;
            }

            return (
                <li
                    key={index}
                    role="tab"
                    // id={this.tabId}
                    // aria-selected={ariaSelected}
                    // aria-expanded={ariaSelected}
                    className={`${child.key ? child.key : ''} customlist`}
                >
                    <Link
                        url="JavaScript:void(0)"
                        linkClassName={activeClass}
                        tabIndex="0"
                        role="button role"
                        id={this.tabId}
                        aria-selected={ariaSelected}
                        // aria-expanded={ariaSelected}
                        // ariaRole="option"
                        ariaLabel={`${child.props.title} ${activeClass ? 'selected' : ''}`}
                        // ariaSelected={ariaSelected}
                        componentName={this.props.type}
                        onClick={this.handleClick.bind(
                            this,
                            index,
                            child.key,
                            child.props.title,
                            this.props.componentName
                        )}
                    >
                        <span>{child.props.title}</span>
                        {this.props.hasThumb && (
                            <div className="tab-image">
                                <img src={child.props.thumb} />
                            </div>
                        )}
                    </Link>
                </li>
            );
        } else {
            return;
        }
    };

    isScrolledIntoView = (element, scroll = false) => {
        let list = document.getElementsByClassName('slider');
        let customList = document.getElementsByClassName('customlist');

        if (scroll) {
            if (element == 'first') {
                var alreadyScrolled = 0;
                if (
                    customList[0].getBoundingClientRect().left <
                    list[0].getBoundingClientRect().left
                ) {
                    alreadyScrolled = -customList[0].getBoundingClientRect()
                        .left;
                }
                if (alreadyScrolled && alreadyScrolled > list[0].offsetWidth) {
                    list[0].scrollLeft =
                        list[0].scrollLeft - list[0].clientWidth;
                } else {
                    list[0].scrollLeft = 0;
                }
            } else if (element == 'last') {
                var alreadyScrolled = 0;
                if (
                    customList[0].getBoundingClientRect().left <
                    list[0].getBoundingClientRect().left
                ) {
                    alreadyScrolled = -customList[0].getBoundingClientRect()
                        .left;
                }
                list[0].scrollLeft = list[0].offsetWidth + alreadyScrolled;
            }
        }

        var elemLeft = customList[0].getBoundingClientRect().left;
        var elemRight = customList[
            customList.length - 1
        ].getBoundingClientRect().right;

        // Only completely visible elements return true:

        var isVisible =
            elemRight >= list[0].getBoundingClientRect().x &&
            parseInt(elemRight) <=
                parseInt(
                    list[0].offsetWidth + list[0].getBoundingClientRect().x
                );

        this.setState({
            nextButton: isVisible ? false : true,
            prevButton:
                elemLeft >= list[0].getBoundingClientRect().x ? false : true
        });

        // Partially visible elements return true:
        //isVisible = elemTop < window.innerHeight && elemBottom >= 0;
        // return isVisible;
    };
    nextClick = (scroll = false) => {
        let nextVisible = this.isScrolledIntoView('last', scroll);
    };

    prevClick = (scroll = false) => {
        let nextVisible = this.isScrolledIntoView('first', scroll);
    };
    renderTitles = () => {
        if (!this.props.children.length) {
            return (
                <ul className={this.createTabClass()} role="tablist">
                    {this.labels(this.props.children)}
                </ul>
            );
        } else {
            if (this.props.slider) {
                return (
                    <div className="slider-wrapper">
                        <span
                            className={
                                this.state.prevButton ? 'prev active' : 'prev'
                            }
                            onClick={(e) => {
                                this.state.prevButton
                                    ? this.isScrolledIntoView('first', true)
                                    : e.preventDefault();
                            }}
                        />
                        <ul
                            className={this.createTabClass() + ' slider'}
                            role="tablist"
                            onScroll={() => {
                                this.isScrolledIntoView(false, false);
                            }}
                        >
                            {/* <Slider {...this.state.settings}> */}
                            {this.props.children.map(this.labels.bind(this))}
                            {/* </Slider> */}
                        </ul>
                        <span
                            className={
                                this.state.nextButton ? 'next active' : 'next'
                            }
                            onClick={(e) => {
                                this.state.nextButton
                                    ? this.isScrolledIntoView('last', true)
                                    : e.preventDefault();
                            }}
                        />
                    </div>
                );
            } else {
                return (
                    <ul
                        className={this.createTabClass() + ' slider'}
                        role="tablist"
                    >
                        {this.props.children.map(this.labels.bind(this))}
                    </ul>
                );
            }
        }
    };

    renderContent = () => {
        if (!this.props.children.length) {
            return (
                <div
                    className="tabs-content"
                    role="tabpanel"
                    aria-labelledby={`${this.tabId}`}
                    aria-hidden="false"
                    tabIndex="0"
                >
                    {this.props.children}
                </div>
            );
        } else {
            return (
                <div
                    className="tabs-content"
                    role="tabpanel"
                    aria-labelledby={`${this.tabId}`}
                    aria-hidden="false"
                    ref={(tabContent) => (this.tabContent = tabContent)}
                >
                    {this.props.children.map((item, index) => {
                        let key = this.props.internal
                            ? `tabpanel-content-${index}`
                            : `tab-content-${index}`;
                        let id = this.props.internal
                            ? `tabpanel-content-${index}`
                            : `tab-content-${index}`;
                        return (
                            <div
                                role="tabpanel"
                                tabIndex="0"
                                aria-labelledby={`${this.tabId}`}
                                aria-hidden="false"
                                key={key}
                                id={id}
                            >
                                {' '}
                                {item}{' '}
                            </div>
                        );
                    })}
                </div>
            );
        }
    };

    checkonResize = () => {
        this.isScrolledIntoView(false, false);
    };

    componentDidMount() {
        if (this.props.slider) {
            this.isScrolledIntoView(false, false);
        }
        const { selected } = this.state;
        const title =
            this.props.children[selected] &&
            this.props.children[selected].props.title;
        const componentName =
            this.props.children[selected] && this.props.componentName;
        const selectedTabName = this.props.children[selected].key;

        let resizeId = window.addEventListener(
            'resize',
            this.checkonResize.bind(this)
        );
        this.setState({
            resizeId: resizeId
        });
        this.handleClick(
            selected,
            selectedTabName,
            title,
            componentName,
            new CustomEvent('tabSelect')
        );
    }
    componentWillUnmount() {
        this.state.resizeId &&
            window.removeEventListener('resize', this.state.resizeId);
    }

    render() {
        return (
            <div className="tabs">
                {this.renderTitles()}
                {this.renderContent()}
            </div>
        );
    }
}

tabs.propTypes = {
    selected: PropTypes.number
};

export default tabs;
