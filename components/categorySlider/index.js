import React, { PureComponent } from 'react';
import PortItem from '../../components/portItem';
import Slider from 'react-slick';
// import { breakpointsMax as Breakpoints } from '../../library/js/config/breakpoints';
import fetchData from '../commons/CUK/fetch-data';
import CarouselControls from '../commons/CUK/carouselControls';
import { breakpoint } from '../../library/js/config/index';
import SessionStorage from '../commons/CUK/session-storage';
const VIEWPORT_TYPE = breakpoint.VIEWPORT_TYPE;
const watchForBreakpoint = breakpoint.watchForBreakpoint;
const Breakpoints = breakpoint.breakpointsMax;
import monthsSliderConfig from './monthsSliderConfig';
import portsSliderConfig from './portsSliderConfig';
import moment from 'moment';
import analytics from '../commons/CUK/analytics';

class categorySlider extends PureComponent {
    constructor() {
        super();
        this.dates = [];

        this.state = {
            portArray: [],
            totalPorts: 0,
            activeSlide: 1,
            tileChildObj: '',
            isLVP: true,
            totalSlide: 0,
            disableNext: false,
            disablePrev: true,
            slidesDisplayed: 1,
            opened: false,
            showAllPorts: true,
            activePort: false,
            indexOfActivePort: -1,
            oneMonth: false,
            activePortName: '',
            activePortInfo: '',
            firstLoad: true
        };
        this.slidesMVP = this.slidesMVP.bind(this);
        this.renderDdPort = this.renderDdPort.bind(this);
    }

    componentDidMount() {
        const mqlLVP = watchForBreakpoint(VIEWPORT_TYPE.DESKTOP);

        // mqlLVP.addListener((mql) => {
        //     this.handleResize(mql);
        // });
        this.initPortsData(mqlLVP);
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 400);
    }
    componentDidUpdate() {
        this.activateFilterFirstTime();
    }
    componentWillReceiveProps({ facetPort, activePort }) {
        // this.setActivePort();
        // if (facetPort) {
        this.setState({
            facetsArray: facetPort ? facetPort[1].values : facetPort
        });
        // }

        if (activePort && this.state.firstLoad === true) {
            this.setState({
                activePort: activePort,
                firstLoad: false
            });
        }
    }
    initPortsData(mqlLVP) {
        const { portCalls } = SessionStorage.getItem('portCalls');

        const tempPorts = portCalls.filter(
            (portItem) =>
                portItem.typeCode.$ === 'PV' || portItem.typeCode.$ === 'DEB'
        );

        this.setState(
            () => ({
                portArray: tempPorts,
                totalPorts: tempPorts.length
            }),
            () => this.handleResize(mqlLVP)
        );
    }

    // setActivePort() {
    //     if (this.props.activePort) {
    //         this.state.portArray.map((port, index) => {
    //             if (port.id === this.props.activePort) {
    //                 let activePortIndex = index;
    //                 let activePortDates = [
    //                     port.port.portCall.startDate,
    //                     port.port.portCall.endDate
    //                 ];
    //                 this.filterPorts(
    //                     null,
    //                     activePortDates,
    //                     this.props.activePort,
    //                     port.longName,
    //                     port.shortDescription,
    //                     port.longDescription,
    //                     true
    //                 );
    //             }
    //         });
    //     }
    // }

    activateFilterFirstTime() {
        const { portArray, totalPorts, activePort } = this.state;
        // indexCode array to connect the index of the item to the port code
        portArray.map((portItem, i) => {
            this.dates[i] = [
                portItem.port.portCall.startDate,
                portItem.port.portCall.endDate
            ];
            if (
                activePort ===
                moment(portItem.port.portCall.startDate).format(
                    'YYYY-MM-DDTHH:mm:ss[Z]'
                )
            ) {
                // this.setState({
                //     portToActivate: i
                // });
                this.refsCollection && this.refsCollection[i] && this.refsCollection[i].click();
            }
        });
    }

    handleResize = (mql) => {
        if (watchForBreakpoint(VIEWPORT_TYPE.DESKTOP).matches) {
            this.setState(
                (prevState) => ({
                    totalSlide: Math.ceil(prevState.totalPorts / 5),
                    isLVP: true,
                    slidesDisplayed: 5
                }),
                () => this.setActiveSlide()
            );
        } else if (
            (watchForBreakpoint(VIEWPORT_TYPE.MOBILE_L).matches &&
                !watchForBreakpoint(VIEWPORT_TYPE.TABLET).matches) ||
            watchForBreakpoint(VIEWPORT_TYPE.TABLET_L).matches
        ) {
            this.setState(
                (prevState) => ({
                    totalSlide: Math.ceil(prevState.totalPorts / 3),
                    isLVP: false,
                    slidesDisplayed: 3
                }),
                () => this.setActiveSlide()
            );
        } else {
            this.setState(
                (prevState) => ({
                    totalSlide: prevState.totalPorts,
                    isLVP: false,
                    slidesDisplayed: 2
                }),
                () => this.setActiveSlide()
            );
        }
    };

    setActiveSlide = (index) => {
        this.setState((prevState) => {
            const { slidesDisplayed, totalSlide, totalPorts } = prevState;
            const activeSlide = isNaN(Math.ceil(index / slidesDisplayed) + 1)
                ? 1
                : Math.ceil(index / slidesDisplayed) + 1;
            const disableNext = index + slidesDisplayed === totalPorts;
            const disablePrev = activeSlide === 1;
            return {
                activeSlide,
                disableNext,
                disablePrev
            };
        });
    };

    nextSlide = () => {
        this.sliderPort.slickNext();
    };

    previousSlide = () => {
        this.sliderPort.slickPrev();
    };

    filterPorts = (
        evt,
        activePortDates,
        activePortCode,
        name,
        description,
        info,
        slideToActive
    ) => {

        analytics.clickTracking(this);
        if (evt) {
            evt.preventDefault();
        }
        let temp;
        // set the index port as the active one so the other will became un-active
        // works both for the jumpToPortDd and the slider with image
        this.setState(() => ({
            activePort: activePortDates,
            activePortName: name,
            activePortInfo: info,
            activePortDescription: description
        }));
        // if selected from dropdown
        if (slideToActive) {
            // find index active element
            for (let i = 0; i < this.dates.length; i++) {
                if (
                    JSON.stringify(this.dates[i]) ===
                    JSON.stringify(activePortDates)
                ) {
                    temp = i;
                }
            }
            // slide to active element
            this.sliderPort.slickGoTo(temp);
            this.openDdPorts();
        }

        this.setState({
            showAllPorts: false
        });

        const queryToApply = `:startDate:startDate:${encodeURIComponent(
            moment(activePortDates[0]).format('YYYY-MM-DDTHH:mm:ss[Z]')
        )}:port:${activePortCode}`;

        if (evt) {
            // this.props.onSelectPort(activePortDates);
            // this.props.onSelectPort(datesToSend);
            this.props.onSelectPort(queryToApply);
        }
    };
    refsCollection = {};

    slidesMVP = () => {
        const { portArray, totalPorts, activePort } = this.state;
        // indexCode array to connect the index of the item to the port code
        let portToActivate;
        portArray.map((portItem, i) => {
            this.dates[i] = [
                portItem.port.portCall.startDate,
                portItem.port.portCall.endDate
            ];
        });
        if (totalPorts > 5) {
            return (
                <Slider
                    {...portsSliderConfig}
                    ref={(c) => (this.sliderPort = c)}
                    afterChange={this.setActiveSlide}
                >
                    {portArray.map((portItem, i) => (
                        <div
                            className={`port-item-wrapper ${
                                JSON.stringify(activePort) ===
                                    JSON.stringify(this.dates[i])
                                    ? 'active'
                                    : ''
                                }`}
                        >
                            <a
                                href="#"
                                key={`${i}-port`}
                                ref={(instance) =>
                                    (this.refsCollection[i] = instance)
                                }
                                onClick={(evt) =>
                                    this.filterPorts(
                                        evt,
                                        this.dates[i],
                                        portItem.port.startPortCode.$,
                                        portItem.longName,
                                        portItem.longDescription,
                                        portItem.shortDescription,
                                        false
                                    )
                                }
                            >
                                <PortItem key={i} index={i} {...portItem} />
                            </a>
                        </div>
                    ))}
                </Slider>
            );
        } else {
            return portArray.map((portItem, i) => {
                const isActive = (JSON.stringify(activePort) === JSON.stringify(this.dates[i]) || moment(activePort).format('YYYY-MM-DD') == this.dates[i][0]);
                return (
                    <a
                        href="#"
                        key={`${i}-port`}
                        className={`port-item-wrapper ${
                            isActive ? 'active' : ''
                        }`}
                        ref={(instance) =>
                            (this.refsCollection[i] = instance)
                        }
                        onClick={(evt) =>
                            this.filterPorts(
                                evt,
                                this.dates[i],
                                portItem.port.startPortCode.$,
                                portItem.longName,
                                portItem.longDescription,
                                portItem.shortDescription,
                                false
                            )
                        }
                    >
                        <PortItem key={i} index={i} {...portItem} />
                    </a>
                );
            });
        }
    };

    buildPorts = () => {
        const { portArray } = this.state;
        let tempPortsArray = [];
        let totalData = {};

        // filter to recognize the month
        // create object of month
        if (portArray.length > 0) {
            for (let monthCounter = 0; monthCounter < 12; monthCounter++) {
                tempPortsArray = portArray.filter((portItem) => {
                    const momentDate = moment(
                        portItem.port.portCall.startDate,
                        'YYYY-MM-DD'
                    );
                    return (
                        Math.ceil(momentDate.format('M') - 1) === monthCounter
                    );
                });
                if (tempPortsArray.length > 0) {
                    totalData[monthCounter] = tempPortsArray;
                }
            }
        }
        return totalData;
    };

    renderDdPort = (totalData, i) => {
        const { oneMonth, activePort } = this.state;
        if (totalData[i]) {
            const momentStartDate = moment(
                totalData[i][0].port.portCall.startDate,
                'YYYY-MM-DD'
            );
            const month = momentStartDate.format('MMM');
            const year = momentStartDate.format('gggg');

            return (
                <ul className="port-list">
                    {!oneMonth && (
                        <div className="port-date">
                            <span className="port-month"> {month} </span>
                            <span className="port-year"> {year} </span>
                        </div>
                    )}
                    {totalData[i].map((portItem, j) => {
                        const {
                            port: {
                                portCall: { startDate, endDate },
                                startPortCode
                            },
                            longName,
                            longDescription,
                            shortDescription
                        } = portItem;
                        const momentStartDate = moment(startDate, 'YYYY-MM-DD');
                        const isActive =
                            JSON.stringify([startDate, endDate]) ===
                            JSON.stringify(activePort);
                        return (
                            <li key={j} className="port-list-item">
                                <a
                                    className={`port-list-link ${
                                        isActive ? 'active' : ''
                                    }`}
                                    ref={(instance) =>
                                        (this.refsCollection[j] = instance)
                                    }
                                    onClick={(evt) =>
                                        this.filterPorts(
                                            evt,
                                            [startDate, endDate],
                                            startPortCode.$,
                                            longName,
                                            longDescription,
                                            shortDescription,
                                            true
                                        )
                                    }
                                >
                                    <span className="port-list-date">
                                        {momentStartDate.format('D')}
                                        <br />
                                        {momentStartDate.format('MMM')}
                                    </span>
                                    <span className="port-list-name">
                                        {longName}
                                    </span>
                                </a>
                            </li>
                        );
                    })}
                </ul>
            );
        }
    };

    openDdPorts = (evt) => {
        analytics.clickTracking(this);
        this.setState(
            (prevState) => ({
                // toggle value of `opened`
                opened: !prevState.opened
            }),
            () => {
                const { isLVP, opened } = this.state;
                typeof document !== 'undefined' && document.addEventListener(
                    'click',
                    this.handleDocumentClick,
                    false
                );

                if (!isLVP) {
                    if (!opened) {
                        typeof document !== 'undefined' && document.body.classList.add('openOverlay');
                    } else {
                        typeof document !== 'undefined' && document.body.classList.remove('openOverlay');
                    }
                }
            }
        );
    };

    handleDocumentClick = (e) => {
        let element = typeof document !== 'undefined' && document.getElementsByClassName('jumpToPort')[0];
        if (element) {
            return element.contains(e.target) ? false : this.closeDdPorts();
        }
    };

    closeDdPorts = (evt) => {
        this.setState(
            () => ({
                // toggle value of `opened`
                opened: false
            }),
            () => {
                const { isLVP, opened } = this.state;
                if (!isLVP) {
                    if (!opened) {
                        typeof document !== 'undefined' && document.body.classList.add('openOverlay');
                    } else {
                        typeof document !== 'undefined' && document.body.classList.remove('openOverlay');
                    }
                }
                typeof document !== 'undefined' && document.removeEventListener(
                    'click',
                    this.handleDocumentClick,
                    false
                );
            }
        );
    };

    showAllPorts = (evt) => {
        const { showAllPorts } = this.state;
        analytics.clickTracking(this);
        if (!showAllPorts) {
            this.setState(
                (prevState) => ({
                    showAllPorts: !prevState.showAllPorts
                        ? !prevState.showAllPorts
                        : prevState.showAllPorts,
                    activePort: false
                }),
                () => {
                    const { onSelectPort } = this.props;
                    onSelectPort && onSelectPort(false);
                }
            );
        }
    };
    render() {
        // const { labels } = this.props.labels;
        // let allPortsLabel, allPortsCopy, jumpToPort, previousLabel, nextLabel;
        const { labels } = this.props;
        const {
            showAllPorts,
            totalPorts,
            activePort,
            activePortName,
            activePortInfo,
            activePortDescription,
            portArray,
            isLVP,
            opened,
            activeSlide,
            totalSlide,
            disableNext,
            disablePrev
        } = this.state;

        const allPortsActive = showAllPorts === true ? ' active' : '';
        const totalData = this.buildPorts();

        let index = activePortName.indexOf('(');
        let id = index >= 0 ? activePortName.substr(0, index) : '';
        let text = index >= 0 ? activePortName.substr(index) : activePortName;

        return portArray.length > 1 ? (
            <div className="category-slider">
                <div className="category-sliderAux">
                    <div className="category-sliderContainer">
                        <div className="allPorts">
                            <p className="allPorts-text">
                                {labels.allPortsCopy}
                            </p>
                            <button
                                className={`allPorts-btn ${allPortsActive}`}
                                role="button"
                                onClick={(evt) => this.showAllPorts(evt)}
                            >
                                <label>{labels.allPortsLabel}</label>
                            </button>
                        </div>
                        {portArray.length > 5 &&
                            !isLVP && (
                                <div className="jumpToPort">
                                    <button
                                        className="jumpToPort-btn"
                                        onClick={(evt) => this.openDdPorts(evt)}
                                    >
                                        {labels.jumpToPort}
                                    </button>
                                    {opened && (
                                        <div className="jumpToPort-dd">
                                            <button
                                                className="cta-menu-close"
                                                onClick={(evt) =>
                                                    this.openDdPorts(evt)
                                                }
                                            >
                                                {labels.closeLabel}
                                            </button>
                                            <Slider
                                                ref={(c) => (this.slider = c)}
                                                {...monthsSliderConfig}
                                            >
                                                {[...Array(12)].map((x, i) =>
                                                    this.renderDdPort(
                                                        totalData,
                                                        i
                                                    )
                                                )}
                                            </Slider>
                                        </div>
                                    )}
                                </div>
                            )}
                        {portArray.length > 9 &&
                            isLVP && (
                                <div className="jumpToPort">
                                    <button
                                        className="jumpToPort-btn"
                                        onClick={(evt) => this.openDdPorts(evt)}
                                    >
                                        {labels.jumpToPort}
                                    </button>
                                    {opened && (
                                        <div className="jumpToPort-dd">
                                            <Slider
                                                ref={(c) => (this.slider = c)}
                                                {...this.settingsMonth}
                                            >
                                                {[...Array(12)].map((x, i) =>
                                                    this.renderDdPort(
                                                        totalData,
                                                        i
                                                    )
                                                )}
                                            </Slider>
                                        </div>
                                    )}
                                </div>
                            )}
                        <div className="ports-carousel">
                            {this.slidesMVP()}
                            {totalPorts > 5 && (
                                <CarouselControls
                                    activeSlide={activeSlide}
                                    totalSlides={totalSlide}
                                    disabledPrev={disablePrev}
                                    disabledNext={disableNext}
                                    prevSlide={this.previousSlide}
                                    nextSlide={this.nextSlide}
                                    previousLabel={labels.previousLabel}
                                    nextLabel={labels.nextLabel}
                                // tabIndex={-1}
                                />
                            )}
                        </div>
                    </div>
                </div>
                {activePort && (
                    <div className="port-block">
                        <h2 className="port-name">
                            <b>{id}</b>
                            <span>{text}</span>
                        </h2>

                        <h4
                            className="port-info"
                            dangerouslySetInnerHTML={{ __html: activePortInfo }}
                        />
                        <div
                            className="port-description"
                            dangerouslySetInnerHTML={{
                                __html: activePortDescription
                            }}
                        />
                    </div>
                )}
            </div>
        ) : null;
    }
}

export default categorySlider;
