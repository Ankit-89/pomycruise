'use strict';

import React from 'react';
import SessionStorage from '../commons/CUK/session-storage';
import FetchData from '../commons/CUK/fetch-data';
import moment from 'moment';
import extractChildComponent from '../commons/CUK/extractChildComponent';
import EmptyState from '../commons/CUK/emptyState';
import InfoBanner from './infoBanner';
import TitleH1Mycruise from '../titleH1Mycruise';
import validateSession from '../commons/CUK/validateSession';
import { getConfig } from '../commons/CUK/utilities';
import analytics from '../commons/CUK/analytics';

class flightsInfo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            flightsArray: [],
            openFlightIndex: false
        };
    }

    componentWillMount() {
        if (!validateSession.checkCookie(['wcmmode'])) {
            const { services } = this.props;
            const { flightsApi } = services.urls;
            const apikeyMycruise = getConfig('apikeyMycruise', '');
            const userData = SessionStorage.getItem('userData');
            const leadPaxx = SessionStorage.getItem('leadPassenger');

            const {
                bookingRef,
                customer: { firstName, lastName, paxNumber },
                cruiseCode,
                shipCode,
                companyCode
            } = userData;

            const leadPaxNum = leadPaxx.paxNumber;

            let flightMessageFlag = SessionStorage.getItem('flagShowFlightMessage');

            let flightMessage = {
                2: { title: this.props.labels.flightYShYCukNotInformedCUKTitle, description: this.props.labels.flightYShYCukNotInformedCUK },
                3: { title: this.props.labels.flightYShNotCukNotInformedCUKTitle, description: this.props.labels.flightYShNotCukNotInformedCUK },
                4: { title: this.props.labels.flightYNotCukNotInformedCUKTitle, description: this.props.labels.flightYNotCukNotInformedCUK },
                5: { title: this.props.labels.flightYCukDetailsNotAvailableTitle, description: this.props.labels.flightYCukDetailsNotAvailable },
                6: { title: this.props.labels.flightYNotCUKInformedCUKTitle, description: this.props.labels.flightYNotCUKInformedCUK }

            };

            if (flightMessageFlag > 7) {
                //const url = `${flightsApi}?bookingRef=${bookingRef}&shipCode=${shipCode}&lastName=${lastName}&firstName=${firstName}`;

                if (true) {//actual lead user == logged in user //leadPaxNum == paxNumber

                    const maxUserInBooking = userData.passengers.length;
                    let mainResp = [];
                    let passengerToAppend = [];
                    let i = 0;

                    userData.passengers.map((passenger, indexofPax) => {
                        const paxInLoop = passenger.paxNumber;
                        const lastNameInLoop = passenger.lastName;
                        const firstNameInLoop = passenger.firstName;


                        const url = `${flightsApi}?bookingRef=${bookingRef}&shipCode=${shipCode}&lastName=${lastNameInLoop}&firstName=${firstNameInLoop}&companyCode=${companyCode}&cruiseCode=${cruiseCode}&paxNumber=${paxInLoop}`;
                        FetchData(url, {
                            method: 'GET',
                            headers: {
                                'X-Source-Identity-Token-0': apikeyMycruise
                            }
                        })
                            .then((resp) => {
                                let customResp = resp;
                                if(customResp && customResp.passengers && customResp.passengers.length){
                                    customResp.passengers.forEach(passenger => {
                                        let seatNumber;
                                        passenger && passenger.flightBookings && passenger.flightBookings.length && passenger.flightBookings.length == 2 && passenger.flightBookings.forEach((flight, i) => {
                                            if(i == 0 && flight.seatNumber && flight.seatNumber.$){
                                                seatNumber = flight.seatNumber.$;
                                                flight.seatNumber.$ = passenger.flightBookings[i + 1].seatNumber && passenger.flightBookings[i + 1].seatNumber.$;
                                            }
                                            if(i == 1 && flight.seatNumber && flight.seatNumber.$){
                                                flight.seatNumber.$ = seatNumber;
                                            }
                                        })
                                    });
                                }
                                if (paxNumber == paxInLoop) { //logged in user ==
                                    //this.combineDataApi(resp);
                                    passengerToAppend.push(customResp.passengers[0]);
                                    mainResp = customResp;
                                    i++;
                                }
                                else {
                                    passengerToAppend.push(customResp.passengers[0]);
                                    i++
                                }

                                if (i == maxUserInBooking) {
                                    mainResp.passengers = passengerToAppend;
                                    this.combineDataApi(mainResp);
                                }
                            })
                            .catch((error) => {
                                this.setState(() => ({
                                    hasEmptyState: true
                                }));
                            });
                    });
                }
                else {//Yd for non lead User
                    const url = `${flightsApi}?bookingRef=${bookingRef}&shipCode=${shipCode}&lastName=${lastName}&firstName=${firstName}&companyCode=${companyCode}&cruiseCode=${cruiseCode}&paxNumber=${paxNumber}`;
                    FetchData(url, {
                        method: 'GET',
                        headers: {
                            'X-Source-Identity-Token-0': apikeyMycruise
                        }
                    })
                        .then(this.combineDataApi)
                        .catch((error) => {
                            this.setState(() => ({
                                hasEmptyState: true
                            }));
                        });
                }
            }
            else {
                this.setState({
                    hasEmptyState: true,
                    emptyStateDescription:
                        flightMessageFlag !== null
                            ? flightMessage[flightMessageFlag].description
                            : '',
                    emptyStateTitle:
                        flightMessageFlag !== null
                            ? flightMessage[flightMessageFlag].title
                            : ''
                });
            }
        }
    }

    combineDataApi = (res) => {
        const {
            hasEmptyState,
            emptyStateDescription,
            emptyStateTitle
        } = this.emptyStateSwitch(res);
        if (hasEmptyState) {
            this.setState(() => ({
                hasEmptyState,
                emptyStateDescription,
                emptyStateTitle
            }));
        } else {
            const flightsObject = res.passengers.reduce(
                (flightsObj, passenger, paxIndex) => {
                    const {
                        flightBookings,
                        individual: { individualName }
                    } = passenger;
                    flightBookings.map((flightBooking, flightIndex) => {
                        const {
                            flightId,
                            meal,
                            flightClassType,
                            seatNumber,
                            ticketNumber,
                            airPNRCode,
                            flightClassCode,
                            flightType,
                            baggage,
                            sequenceNumInt,
                            blockCode,
                            blockMessage
                            //seatsConfirmedCode
                        } = flightBooking;

                        if (!flightsObj[flightId.$]) {
                            flightsObj[flightId.$] = {
                                ...flightBooking,
                                paxList: {},
                                classList: {}
                            };
                        }
                        flightsObj[flightId.$].paxList[paxIndex] = {
                            ...individualName,
                            meal,
                            flightClassType,
                            seatNumber,
                            flightType,
                            ticketNumber,
                            airPNRCode,
                            blockMessage
                        };
                        if (
                            !flightsObj[flightId.$].classList[flightClassCode.$]
                        ) {
                            flightsObj[flightId.$].classList[
                                flightClassCode.$
                            ] = {
                                flightClassType,
                                baggage
                            };
                        }
                        if (!flightsObj[flightId.$].seatBanner) {
                            flightsObj[flightId.$].seatBanner =
                                seatNumber === 'Seat Number Unavailable';
                        }
                    });
                    return flightsObj;
                },
                {}
            );

            this.setState(() => ({
                hasEmptyState,
                flightsObject
            }));
        }
    };

    openAccordion(index) {
        analytics.clickTracking(this);
        this.setState((prevState) => ({
            openFlightIndex: prevState.openFlightIndex === index ? false : index
        }));
    }

    renderBanner(
        icon,
        subtitle,
        bodyText,
        background,
        type,
        directionCode,
        additionalCode
    ) {
        return bodyText !== null ? (
            <InfoBanner
                key={`${directionCode}-${icon}${
                    additionalCode ? `-${additionalCode}` : ''
                    }`}
                icon={icon}
                subtitle={subtitle}
                bodyText={bodyText}
                type={type}
                background={background}
            />
        ) : null;
    }

    closeTooltip(e) {
        analytics.clickTracking(this);
        e.preventDefault();
        this.setState({ hover: false });
    }
    handleMouseIn = () => {
        this.setState({ hover: true });
    };

    handleMouseOut = () => {
        this.setState({ hover: false });
    };

    emptyStateSwitch(res) {
        const noFlight = this.noFlight(res);
        let hasEmptyState, emptyStateDescription, emptyStateTitle;
        if (noFlight) {
            hasEmptyState = true;
        } else {
            const { labels } = this.props;
            const tbaId = this.evalId(res, 'TBA');
            const id999 = this.evalId(res, '999');
            const idXXX = this.evalId(res, 'XX');

            const carrierCodeTBA = this.evalCarrierCodeXXX(res, 'TBA');
            const carrierCode999 = this.evalCarrierCodeXXX(res, '999');
            const carrierCodeXXX = this.evalCarrierCodeXXX(res, 'XX');

            const southamptonEmbark = this.evalSouthamptonEmbark();
            const chartered = this.evalChartered(res);
            const required = this.evalRequired(res);
            const cukPassenger = this.evalCukPassenger(res);

            const firstCondition =
                !southamptonEmbark &&
                required &&
                cukPassenger.hasP &&
                (carrierCodeXXX || carrierCodeTBA || carrierCode999 || idXXX || tbaId || id999);
            //(carrierCodeXXX || tbaId || (id999 && chartered));

            //const firstNwCondition = idXXX || tbaId || id999;

            const secondCondition = southamptonEmbark && cukPassenger.hasNotP;

            const thirdCondition =
                !southamptonEmbark && required && cukPassenger.hasNull;

            const fourthCondition =
                !southamptonEmbark && !required && cukPassenger.hasNull;

            const fifthCondition =
                !southamptonEmbark && required && cukPassenger.hasNotP;

            const sixthCondition =
                !southamptonEmbark && !required && cukPassenger.hasNotP;

            if (firstCondition) {
                hasEmptyState = true;
                emptyStateDescription = labels.flightYCukDetailsNotAvailable;
                emptyStateTitle = labels.flightYCukDetailsNotAvailableTitle;
            } else if (secondCondition) {
                hasEmptyState = true;
                emptyStateDescription = labels.flightYShNotCukNotInformedCUK;
                emptyStateTitle = labels.flightYShNotCukNotInformedCUKTitle;
            } else if (thirdCondition) {
                hasEmptyState = true;
                emptyStateDescription = labels.flightYNotCukNotInformedCUK;
                emptyStateTitle = labels.flightYNotCukNotInformedCUKTitle;
            } else if (fourthCondition) {
                hasEmptyState = true;
                emptyStateDescription = labels.flightNNotCUKNotInformedCUK;
                emptyStateTitle = labels.flightNNotCUKNotInformedCUKTitle;
            } else if (fifthCondition) {
                hasEmptyState = true;
                emptyStateDescription = labels.flightYNotCUKInformedCUK;
                emptyStateTitle = labels.flightYNotCUKInformedCUKTitle;
            } else if (sixthCondition) {
                hasEmptyState = true;
                emptyStateDescription = labels.flightNNotCUKInformedCUK;
                emptyStateTitle = labels.flightNNotCUKInformedCUKTitle;
            }
        }

        return { hasEmptyState, emptyStateDescription, emptyStateTitle };
    }

    noFlight(res) {
        return res.passengers.reduce((hasFlight, passenger, index) => {
            return passenger.flightBookings.length === 0 ? true : hasFlight;
        }, false);
    }

    evalSouthamptonEmbark() {
        const userData = SessionStorage.getItem('userData');
        const { embarkationCode, disembarkationCode } = userData;
        const southamptonEmbark =
            embarkationCode === 'SOU' && disembarkationCode === 'SOU';
        return southamptonEmbark;
    }

    evalId(res, idString) {
        return res.passengers.reduce((hasId, passenger, index) => {
            return passenger.flightBookings.reduce((hasId, flightBooking) => {
                const { flightId } = flightBooking;
                if (flightId.$.indexOf(idString) >= 0) {
                    if (idString == '999') {
                        return flightId.$.indexOf(idString) == 0 ? true : hasId;
                    }
                    else { return true; }
                }
                else {
                    return hasId
                }
                //return flightId.$.indexOf(idString) >= 0 ? true : hasId;
            }, hasId);
        }, false);
    }

    evalCarrierCodeXXX(res, idString) {
        return res.passengers.reduce((carrierCodeXXX, passenger, index) => {
            return passenger.flightBookings.reduce(
                (carrierCodeXXX, flightBooking) => {
                    const { flightCarrierCode } = flightBooking;
                    return flightCarrierCode.$.indexOf(idString) >= 0
                        ? true
                        : carrierCodeXXX;
                },
                carrierCodeXXX
            );
        }, false);
    }


    evalChartered(res) {
        return res.passengers.reduce((isChartered, passenger, index) => {
            return passenger.flightBookings.reduce(
                (isChartered, flightBooking) => {
                    const { flightType } = flightBooking;
                    return flightType === 'CS' || flightType === 'CU'
                        ? true
                        : isChartered;
                },
                isChartered
            );
        }, false);
    }
    evalRequired(res) {
        return res.passengers.reduce((isAirFlag, passenger, index) => {
            return passenger.flightBookings.reduce(
                (isAirFlag, flightBooking) => {
                    const { airFlag } = flightBooking;
                    if (airFlag && airFlag.$ === 'L') {
                        airFlag.$ = 'N';
                    }
                    if (airFlag && airFlag.$ === 'R') {
                        airFlag.$ = 'Y';
                    }
                    return airFlag && airFlag.$ === 'Y' ? true : isAirFlag;
                },
                isAirFlag
            );
        }, false);
    }
    evalCukPassenger(res) {
        return res.passengers.reduce(
            (isCukPassenger, passenger, index) => {
                return passenger.flightBookings.reduce(
                    (isCukPassenger, flightBooking) => {
                        const { paxAir } = flightBooking;
                        if (paxAir) {
                            switch (paxAir.$) {
                                case 'P':
                                    isCukPassenger.hasP = true;
                                    break;
                                case 'N':
                                    isCukPassenger.hasNotP = true;
                                    break;
                                case null:
                                    isCukPassenger.hasNull = true;
                                    break;
                                default:
                                    break;
                            }
                        }
                        return isCukPassenger;
                    },
                    isCukPassenger
                );
            },
            { hasP: false, hasNotP: false, hasNull: false }
        );
    }
    renderSinglePax = (pax, i) => {
        const { labels } = this.props;
        const { hover } = this.state;
        const {
            titleCode,
            firstNameText,
            familyNameText,
            seatNumber,
            airPNRCode,
            flightClassType,
            ticketNumber,
            meal
        } = pax;
        const {
            seatLabel,
            airlineRefLabel,
            ticketNumberLabel,
            requestedMealLabel
        } = labels;

        const display = hover ? 'block' : 'none';
        const tooltipStyle = { display };
        return (
            <li className="flight__dates" key={i}>
                <div className="flight__paxName">
                    <p className="flight__subtitle">
                        {`${titleCode.$} ${firstNameText} ${familyNameText}`}
                    </p>
                </div>
                <div className="flight__passenger">
                    <div className="primary__row">
                        <div className="flight__paxCol">
                            <p className="flight__txtColor">
                                {flightClassType}
                            </p>
                        </div>

                        <div className="flight__paxCol">
                            {seatNumber && (
                                <span className="flight__text">
                                    {seatLabel}
                                    <span className="flight__txtColor">
                                        {seatNumber.$}
                                    </span>
                                </span>
                            )}
                        </div>

                        <div className="flight__paxCol">
                            {airPNRCode.$ && (
                                <span className="flight__text">
                                    {airlineRefLabel}
                                    <span className="flight__txtColor">
                                        {airPNRCode.$}
                                    </span>
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="secondary__row">
                        <div className="flight__paxCol">
                            {ticketNumber.$ && (
                                <span className="flight__text">
                                    {ticketNumberLabel}
                                    <span className="">{ticketNumber.$}</span>
                                </span>
                            )}
                        </div>
                        <div className="flight__paxCol">
                            {meal && (
                                <span className="flight__text">
                                    {requestedMealLabel}
                                    <span className="flight__txtColor">
                                        {meal}
                                        <div
                                            className="tooltip__icon"
                                            onMouseOver={this.handleMouseIn}
                                            onMouseOut={this.handleMouseOut}
                                        >
                                            <div
                                                className="tooltip__dd"
                                                style={tooltipStyle}
                                            >
                                                <a
                                                    className="tooltip__close"
                                                    onClick={(e) =>
                                                        this.closeTooltip(e)
                                                    }
                                                />
                                                <p>
                                                    Lorem ipsum dolor sit amet,
                                                    consectetur adipiscing elit,
                                                    sed do eiusmod tempor
                                                    incididunt
                                                </p>
                                            </div>
                                        </div>
                                    </span>
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </li>
        );
    };

    renderSingleFlight = (flight, index) => {
        const { labels, childComponents } = this.props;
        const { openFlightIndex } = this.state;
        let {
            departure,
            arrival,
            flightDirectionCode,
            flightType,
            paxList,
            flightCarrierType,
            flightOperatorType,
            flightId,
            classList,
            seatBanner,
            sequenceNumInt,
            blockMessage
        } = flight;
        const {
            arriveCityCode,
            arrivalAirCity,
            arrivalAirPort,
            arrivalAirportTerminal,
            arrivalDate,
            arrivalTime
        } = arrival;
        const {
            departCityCode,
            departureAirCity,
            departureAirPort,
            departureAirportTerminal,
            departureDate,
            departureTime
        } = departure;
        const {
            inbound,
            inboundFlight,
            outbound,
            outboundFlight,
            from,
            toLabel,
            detailsLabel,
            flightLabel,
            operatorType,
            charterUnscheduledCU,
            charterScheduledCS,
            standardScheduledSS,
            guaranteedScheduledCG
        } = labels;

        const inboundTitleProps = {
            title: inboundFlight,
            type: 'h1',
            showIcon: false
        };
        const outboundTitleProps = {
            title: outboundFlight,
            type: 'h1',
            showIcon: false
        };

        const departDate = moment(departureDate, 'YYYYMMDD').format('LL');
        const arriveDate = moment(arrivalDate, 'YYYYMMDD').format('LL');

        const departTime = moment(departureTime, 'hhmm').format('HH:mm');
        const arriveTime = moment(arrivalTime, 'hhmm').format('HH:mm');
        const direction = flightDirectionCode.$ === 'O' ? outbound : inbound;

        blockMessage = blockMessage && blockMessage.replace('Cruise Personaliser', 'Flight Seat Booker')

        let flightTypeCode;

        switch (flightType) {
            case 'SS':
                flightTypeCode = standardScheduledSS;
                break;
            case 'CG':
                flightTypeCode = guaranteedScheduledCG;
                break;
            case 'CS':
                flightTypeCode = charterScheduledCS;
                break;
            case 'CU':
                flightTypeCode = charterUnscheduledCU;
                break;
            default:
                flightTypeCode = '';
                break;
        }

        return (
            <div
                key={`${index}${flightDirectionCode.$}`}
                className="flightInfo__singleFlight"
            >
                {sequenceNumInt === '01' ? (
                    <TitleH1Mycruise
                        {...(flightDirectionCode.$ === 'O'
                            ? outboundTitleProps
                            : inboundTitleProps)}
                    />
                ) : null}

                <div className="flight__header">
                    <div className="flight__left">
                        {`${from} `}
                        <span className="flight__city">{departureAirPort}</span>
                        {` ${toLabel} `}
                        <span className="flight__city">{arrivalAirPort}</span>
                    </div>
                    <div className="flight__right">
                        <ul className="flight__list">
                            {Object.values(paxList).map((pax, i) => (
                                <li className="flight__item" key={i}>
                                    {`${pax.titleCode.$} ${pax.firstNameText} ${
                                        pax.familyNameText
                                        }`}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className={`flight__body ${direction.toLowerCase()}`}>
                    <div className="flight__info">
                        <div className="flight__firstBox">
                            <h3
                            >{`${departureAirPort} (${departureAirCity})`}</h3>
                            <p className="flight__subtitle">
                                {`${departDate} - ${departTime}`}
                            </p>
                            <span className="flight__text">
                                {departureAirportTerminal}
                            </span>
                        </div>
                        <div className="flight__betweenBox">
                            <span className="flight__classes">
                                {flightCarrierType}
                            </span>
                            {flightOperatorType && (
                                <span className="flight__operator">
                                    {`${operatorType} ${flightOperatorType}`}
                                </span>
                            )}
                            <span className="flight__number">
                                {`${flightLabel} ${flightId.$}`}
                            </span>
                            <p className="flight__text">{flightTypeCode}</p>
                            <div className="flight__img" />
                        </div>
                        <div className="flight__secondBox">
                            <h3>{`${arrivalAirPort} (${arrivalAirCity})`}</h3>
                            <p className="flight__subtitle">
                                {`${arriveDate} - ${arriveTime}`}
                            </p>
                            <span className="flight__text">
                                {arrivalAirportTerminal}
                            </span>
                        </div>
                    </div>
                    <div
                        className={`flight__accordion ${
                            openFlightIndex ===
                                `${index}${flightDirectionCode.$}`
                                ? 'open'
                                : ''
                            }`}
                    >
                        <div className="flight__passengers">
                            <ul>
                                {Object.values(paxList).map(
                                    this.renderSinglePax
                                )}
                            </ul>
                        </div>
                        <div className="flight__footer">
                            <div className="flight__bannerTxt">
                                {Object.entries(classList).map((entry) => {
                                    return entry[1].baggage
                                        ? this.renderBanner(
                                            'classes',
                                            entry[1].flightClassType,
                                            entry[1].baggage,
                                            false,
                                            'baggageBanner',
                                            flightDirectionCode.$,
                                            entry[0]
                                        )
                                        : null;
                                })}
                            </div>
                            <div className="flight__bannerTxt">
                                {this.renderBanner(
                                    'info',
                                    undefined,
                                    blockMessage,
                                    true,
                                    'txtBanner',
                                    flightDirectionCode.$
                                )}
                            </div>
                        </div>
                    </div>
                    <span
                        className="flightClick__openAccordion"
                        onClick={(e) => {
                            e.preventDefault();
                            this.openAccordion(
                                `${index}${flightDirectionCode.$}`
                            );
                        }}
                    >
                        <a href="#" className="flightClick__icon">
                            {detailsLabel}
                        </a>
                    </span>
                </div>
            </div>
        );
    };

    render() {
        const { hasEmptyState } = this.state;
        if (hasEmptyState) {
            const { childComponents } = this.props;
            const { emptyStateDescription, emptyStateTitle } = this.state;
            let emptyState = extractChildComponent(
                childComponents,
                'emptyState'
            );
            if (emptyStateDescription) {
                emptyState.attributes.description = emptyStateDescription;
                emptyState.attributes.title = emptyStateTitle;
            }

            return (
                <div className="">
                    {<EmptyState {...emptyState.attributes} />}
                </div>
            );
        } else {
            const { flightsObject } = this.state;

            const flights = flightsObject ? Object.values(flightsObject) : [];//YD conversting an object to array
            return (
                <div className="">
                    {[
                        flights
                            .filter(
                                (flight) => flight.flightDirectionCode.$ === 'O'
                            )
                            .sort(
                                (flightA, flightB) =>
                                    flightA.sequenceNumInt <
                                        flightB.sequenceNumInt
                                        ? -1
                                        : 1
                            )
                            .map(this.renderSingleFlight),
                        flights
                            .filter(
                                (flight) => flight.flightDirectionCode.$ === 'T'
                            )
                            .sort(
                                (flightA, flightB) =>
                                    flightA.sequenceNumInt <
                                        flightB.sequenceNumInt
                                        ? -1
                                        : 1
                            )
                            .map(this.renderSingleFlight)
                    ]}
                </div>
            );
        }
    }
}

export default flightsInfo;
