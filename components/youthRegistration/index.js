'use strict';

import React from 'react';
import SessionStorage from '../commons/CUK/session-storage';
import moment from 'moment';
import Select, { components } from 'react-select';
import SelectField from '../commons/CUK/selectField';
import analytics from '../commons/CUK/analytics';
import { calculateAge } from '../commons/CUK/dateFormat';
import FetchData from '../commons/CUK/fetch-data';
import { getConfig, getCamelizeText } from '../commons/CUK/utilities';
import Modal from '../commons/CUK/modal';
import Loader from '../commons/CUK/loader';
import InputField from '../commons/CUK/inputField';
import { createDaysOptions, createYearsOptions } from './formHelpers';
import {
    VIEWPORT_TYPE,
    watchForBreakpoint
} from '../../library/js/config/breakpoints';
import extractChildComponent from '../commons/CUK/extractChildComponent';

class youthRegistration extends React.Component {
    constructor(props) {
        super(props);
        const header = SessionStorage.getItem('header');
        const { language } = header;
        this.state = {
            isFetching: false,
            jwtTokenHasError: false,
            questionHasError: false,
            validationHasError: false,
            postAnswerHasError: false,
            youthRegistrationDaysX: 3,
            dayToCruiseDeparture: 0,
            customerAge: 0,
            isGuestBooking: false,
            checkForCarerInfo: false,
            tooltipHover: {},
            carerInformationErrorRes: {},
            customerEmail: '',
            locale: language,
            menuIsOpen: false,
            carerInformationError: false,
            minAdultAge: getConfig('minAdultAge', ''),
            phaseLabel: getConfig('healthQuestionnaireApiParamPhase', ''),
            JWT__token: {
                guestId: '',
                userxtoken: ''
            },
            questionnaireResponseStatus: 'NOTCOMPLETE',
            selectedPassenger: {
                title: '',
                value: ''
            },
            questionSetID: '',
            showSuccessScreen: false,
            getQuestionnaireResponse: {},
            confirmSubmitBtnEnabled: false,
            selectedCustomerUnderAge: false,
            firstTime: true,
            acceptedTerms: false,
            confirmAndContinue: false,
            options: [],
            questions: [],
            error: {
                res: {},
                type: ''
            },
            showParentalResposibleOverlay: false,
            carerInformation: [
                {
                    bookingRef: '',
                    firstName: '',
                    lastName: '',
                    day: {
                        label: '',
                        value: ''
                    },
                    month: {
                        label: '',
                        value: ''
                    },
                    year: {
                        label: '',
                        value: ''
                    },
                    relationship: ''
                }
            ]
        };
    }

    componentDidMount() {
        // if (!ValidateSession.checkCookie(['wcmmode'])) { };
    }

    sendDataToAnalytics = (errorMsg, key) => {
        const { errorCodeMap } = this.props;
        let validationError = errorMsg;
        if (typeof errorMsg == 'object') {
            if (errorMsg.httpResponseStatus == '200') {
                if (errorMsg.statusCode) {
                    const objKey = `${key}.httpStatusCode.${
                        errorMsg.statusCode
                    }.title`;
                    if (errorCodeMap.hasOwnProperty(objKey)) {
                        validationError = errorCodeMap[objKey];
                    } else {
                        validationError = errorCodeMap['default.title'];
                    }
                } else {
                    validationError = errorCodeMap['default.title'];
                }
            } else if (errorMsg.httpResponseStatus != '200') {
                if (errorMsg.httpResponseStatus) {
                    const objKey = `${key}.httpResponseCode.${
                        errorMsg.httpResponseStatus
                    }.title`;
                    if (errorCodeMap.hasOwnProperty(objKey)) {
                        validationError = errorCodeMap[objKey];
                    } else {
                        validationError = errorCodeMap['default.title'];
                    }
                } else {
                    validationError = errorCodeMap['default.title'];
                }
            } else {
                validationError = errorCodeMap['default.title'];
            }
        }
        const analyticsObj = {
            componentName: `${this.props.component}`,
            linkType: 'o',
            linkPageName: getConfig('pageName'),
            validationError: `${validationError}`,
            event: 'event77'
        };
        analytics.customClicks(analyticsObj, 'errorTrack');
    };

    componentWillMount() {
        this.getDaysToCruiseDeparture();
    }

    createLabel (firstName, lastName) {
        let label = getCamelizeText(`${firstName} ${lastName}`);
        if (label && label.length > 19) {
            label = label.substr(0, 19);
            // label = label.substr(
            //     0,
            //     Math.min(
            //         label.length,
            //         label.lastIndexOf(' ')
            //     )
            // );
            label = label + '..';
        }
        return label;
    }

    getDaysToCruiseDeparture() {
        const userData = SessionStorage.getItem('userData');
        const { embarkationDate } = userData;
        const dayOfCruiseDeparture = new Date(
            moment(embarkationDate, 'YYYY-MM-DD').format('ll')
        );
        const today = new Date();
        const oneDay = 1000 * 60 * 60 * 24;
        const dayToCruiseDeparture = Math.ceil(
            (dayOfCruiseDeparture.getTime() - today.getTime()) / oneDay
        );
        this.loadInitialData(dayToCruiseDeparture);
    }

    loadInitialData(dayToCruiseDeparture) {
        const userData = SessionStorage.getItem('userData');
        const header = SessionStorage.getItem('header');
        const youthRegistrationDaysX =
            getConfig('youthRegistrationDayX', '100') || 100;
        const { customer, embarkationDate, passengers } = userData;
        const { agent } = header;
        const passengerBirth = new Date(customer.birthDate);
        const embarkDate = new Date(embarkationDate);
        const ageAtEmbark = calculateAge(
            passengerBirth.getTime(),
            embarkDate.getTime()
        );

        passengers.length &&
            passengers.map((passenger) => {
                passenger.label = this.createLabel(passenger.firstName, passenger.lastName);
                passenger.value = passenger.paxNumber;
                passenger.dob = passenger.birthDate;
                passenger.age = passenger.age;
            });

        const childPassengers =
            passengers.length &&
            passengers.filter((passenger) => {
                if (passenger.birthDate == '' && passenger.age == '') {
                    return false;
                }
                return (
                    calculateAge(
                        new Date(passenger.birthDate).getTime(),
                        embarkDate.getTime()
                    ) < 18 || passenger.age < 18
                );
            });

        const email = this.retriveSelectedUserEmail(customer.paxNumber);
        let selectedPassenger = {
            title: '',
            value: '',
            dob: '',
            age: ''
        };
        if (childPassengers.length) {
            selectedPassenger = {
                title: childPassengers[0].label,
                value: childPassengers[0].value,
                dob: childPassengers[0].birthDate,
                age: childPassengers[0].age
            };
        }

        this.setState(
            {
                customerAge: ageAtEmbark,
                customerEmail: email,
                options: [...childPassengers],
                selectedPassenger: selectedPassenger,
                dayToCruiseDeparture: dayToCruiseDeparture,
                youthRegistrationDaysX: youthRegistrationDaysX,
                isGuestBooking: agent == void 0
            },
            () => {
                const {
                    customerAge,
                    dayToCruiseDeparture,
                    youthRegistrationDaysX,
                    minAdultAge,
                    isGuestBooking
                } = this.state;
                if (
                    customerAge > minAdultAge &&
                    isGuestBooking &&
                    dayToCruiseDeparture < youthRegistrationDaysX
                ) {
                    this.getJWT_token();
                    this.retrieveQuestions();
                }
            }
        );
    }

    getJWT_token() {
        const youthRegJWTTokenAPIURL = getConfig('youthRegJWTTokenAPIURL');
        const apiKey = getConfig('apikeyMycruise', '');
        const userData = SessionStorage.getItem('userData');
        const {
            bookingRef,
            customer: { firstName, lastName, birthDate }
        } = userData;

        const requestData = {
            bookingRef: bookingRef,
            firstName: firstName,
            lastName: lastName,
            dateOfBirth: birthDate.replace(/-/gi, '')
        };

        FetchData(youthRegJWTTokenAPIURL, {
            method: 'POST',
            body: JSON.stringify(requestData),
            headers: {
                'Content-Type': 'application/json',
                'X-Source-Identity-Token-0': apiKey
            }
        })
            .then((response) => {
                if (response.status == '00') {
                    const JWT__token = {
                        guestId: response.data.guestId,
                        userxtoken: response.data.userxtoken
                    };
                    this.setState(
                        {
                            JWT__token: JWT__token,
                            jwtTokenHasError: false
                        },
                        () => {
                            this.retrieveYouthResponses();
                        }
                    );
                } else {
                    this.setState({
                        jwtTokenHasError: true,
                        error: {
                            res: response,
                            type: 'jwtToken'
                        }
                    });
                    this.sendDataToAnalytics(response, 'jwtToken');
                }
            })
            .catch((err) => {
                this.setState({
                    jwtTokenHasError: true,
                    error: {
                        res: err,
                        type: 'jwtToken'
                    }
                });
                this.sendDataToAnalytics(err, 'jwtToken');
            });
    }

    retrieveYouthResponses() {
        const { options, JWT__token } = this.state;
        const header = SessionStorage.getItem('header');
        const { passengers, customer } = header;
        const apiKey = getConfig('apikeyMycruise', '');
        const youthRegGetQuestionnaireResponseAPIURL =
            getConfig('youthRegGetQuestionnaireResponseAPIURL') ||
            '/services/registrationResponses.json';
        const loggedIdGuest = passengers.filter((singleGuest) => {
            return singleGuest.paxNumber == customer.PaxNumber;
        });
        const allChildQuestionResponses = [];
        const newOptionArray = options.length
            ? options.reduce((children, singleChild, index) => {
                  children.push(singleChild);
                  const { guestId } = singleChild;
                  const getQuestionnaireResponse = youthRegGetQuestionnaireResponseAPIURL
                      .replace('{childGuestId}', guestId)
                      .replace('{guestId}', loggedIdGuest[0].guestId);
                  allChildQuestionResponses.push(
                      FetchData(getQuestionnaireResponse, {
                          method: 'GET',
                          headers: {
                              'Content-Type': 'application/json',
                              'X-Source-Identity-Token-0': apiKey,
                              userxtoken: JWT__token.userxtoken
                          }
                      })
                          .then((res) => {
                              if (res.statusCode == '00') {
                                  children[index] = {
                                      ...children[index],
                                      ...res.data,
                                      ...{ registered: false }
                                  };
                                  if (
                                      res.data &&
                                      res.data.completedByguestId &&
                                      res.data.completedByguestId !== ''
                                  ) {
                                      children[index].registered = true;
                                  }
                              } else {
                                  this.sendDataToAnalytics(
                                      res,
                                      'getYouthResponse'
                                  );
                              }
                          })
                          .catch((err) => {
                              this.sendDataToAnalytics(err, 'getYouthResponse');
                          })
                  );
                  return children;
              }, [])
            : [];

        Promise.all(allChildQuestionResponses)
            .then(() => {
                this.setState(
                    {
                        options: newOptionArray
                    },
                    () => {
                        const sessionValue = [];
                        newOptionArray.map((singleOption) => {
                            sessionValue.push(
                                singleOption.registered ? true : false
                            );
                        });
                        SessionStorage.setItem('youthRegList', sessionValue);
                    }
                );
                console.log('newOptionArray', newOptionArray);
            })
            .finally(() => {});
    }

    retrieveQuestions() {
        const { JWT__token } = this.state;
        const apiKey = getConfig('apikeyMycruise', '');
        const header = SessionStorage.getItem('header');
        const userData = SessionStorage.getItem('userData');
        const { brandCode, language } = userData;
        const { cruiseCode } = header;
        const youthRegGetQuestionnaireAPIURL =
            getConfig('youthRegGetQuestionnaireAPIURL') ||
            '/services/mc-youthquestionnaire.retrieve.json';
        const getQuestionAPI = youthRegGetQuestionnaireAPIURL
            .replace('{brand}', brandCode)
            .replace('{lang}', language.substring(0, 2));

        this.setState(
            {
                isFetching: true
            },
            () => {
                FetchData(`${getQuestionAPI}?voyageCode=${cruiseCode}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Source-Identity-Token-0': apiKey,
                        userxtoken: JWT__token.userxtoken
                    }
                })
                    .then((response) => {
                        if (response.statusCode == '00') {
                            const questions = [
                                ...response.data.questionDetails
                            ];
                            const questionSetID = response.data.questionSetID;
                            questions.length &&
                                questions.map((question) => {
                                    if (
                                        !question.hasOwnProperty(
                                            'questionResponse'
                                        )
                                    ) {
                                        question.questionResponse = '';
                                    }
                                });
                            this.setState({
                                questionHasError: false,
                                isFetching: false,
                                questions,
                                questionSetID
                            });
                        } else {
                            this.setState({
                                questionHasError: true,
                                isFetching: false,
                                error: {
                                    res: response,
                                    type: 'getYouthRegistrationQuestions'
                                }
                            });
                            this.sendDataToAnalytics(
                                response,
                                'getYouthRegistrationQuestions'
                            );
                        }
                    })
                    .catch((error) => {
                        this.setState({
                            questionHasError: true,
                            isFetching: false,
                            error: {
                                res: error,
                                type: 'getYouthRegistrationQuestions'
                            }
                        });
                        this.sendDataToAnalytics(
                            error,
                            'getYouthRegistrationQuestions'
                        );
                    });
            }
        );
    }

    renderEarlyMessageCard() {
        const {
            labels: { notAvailableYetTitleLabel, notAvailableYetDescLabel }
        } = this.props;
        return (
            <div className={`youthRegistration__earlyState`}>
                <header className={`youthRegistration__earlyStateHeader`}>
                    <span className={`youthRegistration__earlyStateIcon`} />
                    <h3 className={`youthRegistration__earlyStateText`}>
                        {notAvailableYetTitleLabel}
                    </h3>
                    <p
                        className={`youthRegistration__earlyStateSubtext`}
                        dangerouslySetInnerHTML={{
                            __html: notAvailableYetDescLabel
                        }}
                    />
                </header>
            </div>
        );
    }

    renderNotAvailableMessageCard() {
        const {
            labels: {
                notAvailableForBookingTitleLabel,
                notAvailableForBookingDescLabel
            }
        } = this.props;
        return (
            <div className={`youthRegistration__underAgeState`}>
                <header className={`youthRegistration__underAgeStateHeader`}>
                    <span className={`youthRegistration__underAgeStateIcon`} />
                    <h3 className={`youthRegistration__underAgeStateText`}>
                        {notAvailableForBookingTitleLabel}
                    </h3>
                    <p
                        className={`youthRegistration__underAgeStateSubtext`}
                        dangerouslySetInnerHTML={{
                            __html: notAvailableForBookingDescLabel
                        }}
                    />
                </header>
            </div>
        );
    }

    renderUnderAgeMessageCard() {
        const {
            labels: {
                notAvailableForChildrenTitleLabel,
                notAvailableForChildrenDescLabel
            }
        } = this.props;
        return (
            <div className={`youthRegistration__underAgeState`}>
                <header className={`youthRegistration__underAgeStateHeader`}>
                    <span className={`youthRegistration__underAgeStateIcon`} />
                    <h3 className={`youthRegistration__underAgeStateText`}>
                        {notAvailableForChildrenTitleLabel}
                    </h3>
                    <p
                        className={`youthRegistration__underAgeStateSubtext`}
                        dangerouslySetInnerHTML={{
                            __html: notAvailableForChildrenDescLabel
                        }}
                    />
                </header>
            </div>
        );
    }

    renderBookingMessageWithoutChildCard() {
        const {
            labels: {
                notAvailableForBookingWithoutChildTitleLabel,
                notAvailableForBookingWithoutChildDescLabel
            }
        } = this.props;
        return (
            <div className={`youthRegistration__underAgeState`}>
                <header className={`youthRegistration__underAgeStateHeader`}>
                    <span className={`youthRegistration__underAgeStateIcon`} />
                    <h3 className={`youthRegistration__underAgeStateText`}>
                        {notAvailableForBookingWithoutChildTitleLabel}
                    </h3>
                    <p
                        className={`youthRegistration__underAgeStateSubtext`}
                        dangerouslySetInnerHTML={{
                            __html: notAvailableForBookingWithoutChildDescLabel
                        }}
                    />
                </header>
            </div>
        );
    }

    renderWithOutDOBMessageCard() {
        const {
            labels: {
                notAvailableForChildWithoutBirtDateTitleLabel,
                notAvailableForChildWithoutBirtDateDescLabel
            }
        } = this.props;
        return (
            <div className={`youthRegistration__underAgeState`}>
                <header className={`youthRegistration__underAgeStateHeader`}>
                    <span className={`youthRegistration__underAgeStateIcon`} />
                    <h3 className={`youthRegistration__underAgeStateText`}>
                        {notAvailableForChildWithoutBirtDateTitleLabel}
                    </h3>
                    <p
                        className={`youthRegistration__underAgeStateSubtext`}
                        dangerouslySetInnerHTML={{
                            __html: notAvailableForChildWithoutBirtDateDescLabel
                        }}
                    />
                </header>
            </div>
        );
    }

    renderCCATAMessageCard() {
        const {
            labels: { notAvailableCCATATitleLabel, notAvailableCCATADescLabel }
        } = this.props;
        return (
            <div className={`youthRegistration__earlyState`}>
                <header className={`youthRegistration__earlyStateHeader`}>
                    <span className={`youthRegistration__earlyStateIcon`} />
                    <h3 className={`youthRegistration__earlyStateText`}>
                        {notAvailableCCATATitleLabel}
                    </h3>
                    <p
                        className={`youthRegistration__earlyStateSubtext`}
                        dangerouslySetInnerHTML={{
                            __html: notAvailableCCATADescLabel
                        }}
                    />
                </header>
            </div>
        );
    }

    renderSuccessMessageCard() {
        let {
            labels: {
                yrSubmissionSuccessTitleLabel,
                yrSubmissionSuccessNameLabel,
                yrSubmissionSuccessEmailLabel,
                yrSubmissionSuccessNextStepsDescLabel,
                yrSubmissionSuccessNextStepsTextLabel,
                yrSubmissionSuccessNextStepsURLLabel,
                yrSubmissionSuccessOpenNextStepsInNewWindow,
                registerAnotherChildLabel
            }
        } = this.props;
        const { customerEmail, selectedPassenger } = this.state;
        const header = SessionStorage.getItem('header');
        const { passengers } = header;
        const guest = passengers.filter((passenger) => {
            return passenger.paxNumber == selectedPassenger.value;
        });

        yrSubmissionSuccessNameLabel = yrSubmissionSuccessNameLabel
            .replace('{Firstname}', getCamelizeText(guest[0].firstName))
            .replace('{Lastname}', getCamelizeText(guest[0].lastName));

        return (
            <div className={`youthRegistration__successState`}>
                <header className={`youthRegistration__successStateHeader`}>
                    <span className={`youthRegistration__successStateIcon`} />
                    <h3 className={`youthRegistration__successStateText`}>
                        {yrSubmissionSuccessTitleLabel}
                    </h3>
                    <p className={`youthRegistration__successStateSubtext`}>
                        {yrSubmissionSuccessNameLabel}
                    </p>
                    {customerEmail && (
                        <p className={`youthRegistration__successStateSubtext`}>
                            <p>{yrSubmissionSuccessEmailLabel}</p>
                            <p>{customerEmail.toLowerCase()}</p>
                        </p>
                    )}
                    <p className={`youthRegistration__successStateSubtext`}>
                        {yrSubmissionSuccessNextStepsDescLabel}
                    </p>
                    <a
                        className="cta-secondary noMargin"
                        target={
                            yrSubmissionSuccessOpenNextStepsInNewWindow == true
                                ? '_blank'
                                : ''
                        }
                        href={yrSubmissionSuccessNextStepsURLLabel}
                    >
                        {yrSubmissionSuccessNextStepsTextLabel}
                    </a>
                    <p
                        className="cta-secondary"
                        onClick={() => {
                            window.location.reload();
                        }}
                    >
                        {registerAnotherChildLabel}
                    </p>
                </header>
            </div>
        );
    }

    renderFailureMessageCard() {
        const { errorCodeMap } = this.props;
        const {
            error: { res, type }
        } = this.state;
        let titleLabel, descLabel;
        if (typeof res == 'object') {
            if (res.httpResponseStatus == '200') {
                if (res.statusCode) {
                    const objTitleKey = `${type}.httpStatusCode.${
                        res.statusCode
                    }.title`;
                    const objDescKey = `${type}.httpStatusCode.${
                        res.statusCode
                    }.desc`;
                    if (errorCodeMap.hasOwnProperty(objTitleKey)) {
                        titleLabel = errorCodeMap[objTitleKey];
                    } else {
                        titleLabel = errorCodeMap['default.title'];
                    }
                    if (errorCodeMap.hasOwnProperty(objDescKey)) {
                        descLabel = errorCodeMap[objDescKey];
                    } else {
                        descLabel = errorCodeMap['default.desc'];
                    }
                } else {
                    titleLabel = errorCodeMap['default.title'];
                    descLabel = errorCodeMap['default.desc'];
                }
            } else if (res.httpResponseStatus != '200') {
                if (res.httpResponseStatus) {
                    const objTitleKey = `${type}.httpResponseCode.${
                        res.httpResponseStatus
                    }.title`;
                    const objDescKey = `${type}.httpResponseCode.${
                        res.httpResponseStatus
                    }.desc`;
                    if (errorCodeMap.hasOwnProperty(objTitleKey)) {
                        titleLabel = errorCodeMap[objTitleKey];
                    } else {
                        titleLabel = errorCodeMap['default.title'];
                    }
                    if (errorCodeMap.hasOwnProperty(objDescKey)) {
                        descLabel = errorCodeMap[objDescKey];
                    } else {
                        descLabel = errorCodeMap['default.desc'];
                    }
                } else {
                    titleLabel = errorCodeMap['default.title'];
                    descLabel = errorCodeMap['default.desc'];
                }
            } else {
                titleLabel = errorCodeMap['default.title'];
                descLabel = errorCodeMap['default.desc'];
            }
        } else {
            titleLabel = errorCodeMap['default.title'];
            descLabel = errorCodeMap['default.desc'];
        }
        return (
            <div className={`youthRegistration__failureState`}>
                <header className={`youthRegistration__failureStateHeader`}>
                    <span className={`youthRegistration__failureStateIcon`} />
                    <h3 className={`youthRegistration__failureStateText`}>
                        {titleLabel}
                    </h3>
                    <p
                        className={`youthRegistration__failureStateSubtext`}
                        dangerouslySetInnerHTML={{
                            __html: descLabel
                        }}
                    />
                </header>
            </div>
        );
    }

    renderTitle() {
        const { labels } = this.props;
        return (
            <div className={`tileH1-section`}>
                <div className="title-component">
                    <div className="inner-container">
                        <span className="icon-heading" />
                        <h1 className="title">{labels.yourAnswersLabel}</h1>
                        <p className="description">
                            {labels.cantChangeAnswerDescLabel}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    handleMouseIn = (e) => {
        const { tooltipHover } = this.state;
        tooltipHover[e] = true;
        this.setState({
            tooltipHover
        });
    };

    handleMouseOut = (e) => {
        const { tooltipHover } = this.state;
        tooltipHover[e] = false;
        this.setState({
            tooltipHover
        });
    };

    renderQuestionnaire(question) {
        const {
            questionText,
            questionID,
            answerOptions,
            questionResponse,
            questionResponseExtraInfo = ''
        } = question;
        const { labels, gridList } = this.props;
        const tooltipDesc = gridList.filter((singleGrid) => {
            return questionID == singleGrid.title;
        });
        const { firstTime, tooltipHover } = this.state;
        const display = tooltipHover[questionID] ? 'block' : 'none';
        const tooltipStyle = { display };
        const filled =
            firstTime ||
            (questionResponse != void 0 && questionResponse.length > 0);
        const error__show = !filled ? 'error__show' : '';
        const filterArrayOption = answerOptions.filter((singleAnwer) => {
            return filled
                ? singleAnwer.responseType == questionResponse
                : false;
        });
        return (
            <li key={questionID} className="qa__item edit__mode">
                <div className={`qa__body ${error__show}`}>
                    <div className="mandatory_box">
                        <div className="qa__question">
                            {tooltipDesc.length > 0 ? (
                                <div className="tooltip-wrapper">
                                    <div>{questionText}</div>
                                    <div
                                        className={`tooltip__icon show-focus-outlines`}
                                        onMouseOver={() =>
                                            this.handleMouseIn(questionID)
                                        }
                                        onMouseOut={() =>
                                            this.handleMouseOut(questionID)
                                        }
                                        onFocus={() =>
                                            this.handleMouseIn(questionID)
                                        }
                                        onBlur={() =>
                                            this.handleMouseOut(questionID)
                                        }
                                        tabIndex="0" 
                                        aria-label={tooltipDesc[0].description}
                                    >
                                        <div
                                            className="tooltip__dd"
                                            style={tooltipStyle}
                                        >
                                            <p>{tooltipDesc[0].description}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div>{questionText}</div>
                            )}
                        </div>
                        <div className="qa__answer">
                            {this.renderDoubleCta(
                                answerOptions,
                                questionResponse,
                                questionID
                            )}
                        </div>
                    </div>
                    {filterArrayOption.length > 0 &&
                        filterArrayOption[0].doesResposeRequireAdditionalText ==
                            'Y' && (
                            <div className="additional_box">
                                <div className="additional__question">
                                    {filterArrayOption[0].additionalReponseText}
                                </div>
                                <textarea
                                    value={questionResponseExtraInfo}
                                    onChange={(e) => {
                                        this.handleTextAreaChange(
                                            e,
                                            questionID
                                        );
                                    }}
                                    className="additional__answer"
                                />
                            </div>
                        )}
                </div>
                {!filled && (
                    <div className="error__msg">
                        <span>{labels.questionNotAnsweredLabel}</span>
                    </div>
                )}
            </li>
        );
    }

    handleTextAreaChange = (e, questionID) => {
        const { questions } = this.state;
        let newQuestionArray = questions;
        newQuestionArray.map((singleQuestion) => {
            if (singleQuestion.questionID == questionID) {
                if (
                    !singleQuestion.hasOwnProperty('questionResponseExtraInfo')
                ) {
                    singleQuestion.questionResponseExtraInfo = '';
                }
                singleQuestion.questionResponseExtraInfo = e.target.value;
            }
        });
        this.setState({
            questions: newQuestionArray
        });
    };

    renderSingleCta(value, type) {
        const {
            labels: {
                yesButtonLabel,
                noButtonLabel,
                submitQuestionnaireCTALabel
            }
        } = this.props;
        const buttonClass =
            value == 'Y' || value == 'Yes'
                ? 'cta-primary'
                : 'cta-primary-light-blue';
        return (
            <button
                className={`${buttonClass}`}
                data-clicktype={type}
                data-linktext={value}
                onClick={(e) => this.handleClickBtn(e)}
            >
                {type == 'submitButton'
                    ? submitQuestionnaireCTALabel
                    : value == 'Y' || value == 'Yes'
                        ? yesButtonLabel
                        : noButtonLabel}
            </button>
        );
    }

    reArrangingTheAnswerPostion(answerOptions) {
        const newArray = [];
        const mql = watchForBreakpoint(VIEWPORT_TYPE.MOBILE_L, true);
        if (mql.matches) {
            for (var i = 0; i < answerOptions.length; i++) {
                if (answerOptions[i].responseType == 'Yes') {
                    newArray.push(answerOptions[i]);
                }
            }
            for (var i = 0; i < answerOptions.length; i++) {
                if (answerOptions[i].responseType == 'No') {
                    newArray.push(answerOptions[i]);
                }
            }
            for (var i = 0; i < answerOptions.length; i++) {
                if (answerOptions[i].responseType == 'Not Applicable') {
                    newArray.push(answerOptions[i]);
                }
            }
        } else {
            for (var i = 0; i < answerOptions.length; i++) {
                if (answerOptions[i].responseType == 'Not Applicable') {
                    newArray.push(answerOptions[i]);
                }
            }
            for (var i = 0; i < answerOptions.length; i++) {
                if (answerOptions[i].responseType == 'Yes') {
                    newArray.push(answerOptions[i]);
                }
            }
            for (var i = 0; i < answerOptions.length; i++) {
                if (answerOptions[i].responseType == 'No') {
                    newArray.push(answerOptions[i]);
                }
            }
        }

        return newArray;
    }

    renderDoubleCta(answerOptions, questionResponse, questionID) {
        const {
            labels: { yesButtonLabel, noButtonLabel, notApplicableButtonLabel }
        } = this.props;
        const newAnswerOptions = this.reArrangingTheAnswerPostion(
            answerOptions
        );
        return (
            <div className="buttonContainer">
                {newAnswerOptions.map((singleAnwer, index) => (
                    <button
                        className={`cta-primary-light-blue button_${index} ${
                            questionResponse == singleAnwer.responseType
                                ? 'active'
                                : ''
                        }`}
                        data-clicktype={singleAnwer.responseType}
                        data-linktext={questionID}
                        onClick={this.handleAnswerClick}
                    >
                        {singleAnwer.responseType.toLowerCase() == 'y' ||
                        singleAnwer.responseType.toLowerCase() == 'yes' ||
                        singleAnwer.responseType.toLowerCase() == 'ja'
                            ? yesButtonLabel
                            : null}
                        {singleAnwer.responseType.toLowerCase() == 'n' ||
                        singleAnwer.responseType.toLowerCase() == 'no' ||
                        singleAnwer.responseType.toLowerCase() == 'nein'
                            ? noButtonLabel
                            : null}
                        {singleAnwer.responseType.toLowerCase() ==
                        'not applicable'
                            ? notApplicableButtonLabel
                            : null}
                    </button>
                ))}
            </div>
        );
    }

    handleAnswerClick = (key) => {
        const { questions } = this.state;
        const value = key.target.dataset.clicktype;
        const id = key.target.dataset.linktext;
        questions.length &&
            questions.map((question) => {
                if (question.questionID == id) {
                    question['questionResponse'] = value;
                }
            });
        this.setState({
            questions: [...questions]
        });
    };

    handleSelectBoxChange = (value) => {
        const childPassengers =
            this.state.options &&
            this.state.options.find((child) => child.value == value.value);

        const selectedPassenger = {
            title: childPassengers.label,
            value: childPassengers.value,
            dob: childPassengers.birthDate,
            age: childPassengers.age
        };

        this.setState({
            selectedPassenger,
            firstTime: true,
            menuIsOpen: false,
            selectedCustomerUnderAge: childPassengers.age
        });
    };

    retriveSelectedUserEmail(value) {
        const cruiseSummaryData = SessionStorage.getItem('cruiseSummaryData');
        const { passengers } = cruiseSummaryData;
        const newPassengerArry = passengers.filter((passenger) => {
            return passenger.seqNumber.$ == value;
        });
        const selectedPassengerEmail =
            newPassengerArry[0].individual.contactPoints[0].emailAddress
                .fullAddressText;
        return selectedPassengerEmail;
    }

    handleEmailClickCTA() {
        const url = 'before-you-sail#personalDetails';
        window.open(url, '_self');
        window.location.reload();
    }

    renderPageDescription() {
        let {
            labels: {
                YRDescLabel,
                emailConfirmationMessageLabel,
                changeEmailAddressLabel,
                changeEmailAddressCTALabel,
                emailAddressNotPresentLabel,
                changeEmailIfEmailNotPresentLabel,
                embarkationDateLabel,
                cruiseNumberLabel,
                privacyNoticeLabel,
                privacyNoticeLink
            }
        } = this.props;

        const {
            customerEmail,
            options,
            selectedPassenger,
            minAdultAge,
            locale
        } = this.state;
        let isSeletedChildHasDob = false;
        const values = Object.values(selectedPassenger);
        if (options.length && values[0].length !== 0) {
            isSeletedChildHasDob =
                selectedPassenger.dob && selectedPassenger.age < minAdultAge;
        }

        const cruiseData = SessionStorage.getItem('cruiseData') || {};
        const { embarkDate = 0, sailingId = 0 } = cruiseData;
               
        return (
            <div className="description__container">
                <div className="description__body__left">
                    <p
                        className="description__body"
                        dangerouslySetInnerHTML={{
                            __html: YRDescLabel
                        }}
                    />
                    <p className="privacy__notice">
                        <a href={privacyNoticeLink}>{privacyNoticeLabel}</a>
                    </p>
                    <div className="cruiseInfo_container">
                        <div className="embarkDate_container">
                            <p>{embarkationDateLabel}</p>
                            <p className="value">
                                {moment(embarkDate).format(
                                    locale == 'en_US'
                                        ? 'MMM DD YYYY'
                                        : 'DD MMM YYYY'
                                )}
                            </p>
                        </div>
                        <div className="cruiseNumber_container">
                            <p>{cruiseNumberLabel}</p>
                            <p className="value">{sailingId}</p>
                        </div>
                    </div>
                </div>
                <div className="description__body__right">
                    <div>
                        <p
                            className="email_address_label"
                            dangerouslySetInnerHTML={{
                                __html:
                                    customerEmail.length > 0
                                        ? emailConfirmationMessageLabel
                                        : emailAddressNotPresentLabel
                            }}
                        />
                        <p
                            className="email_address_value"
                            dangerouslySetInnerHTML={{
                                __html:
                                    customerEmail.length > 0
                                        ? customerEmail.toLowerCase()
                                        : null
                            }}
                        />
                    </div>
                    <div>
                        <p
                            className="email_address_label"
                            dangerouslySetInnerHTML={{
                                __html:
                                    customerEmail.length > 0
                                        ? changeEmailAddressLabel
                                        : changeEmailIfEmailNotPresentLabel
                            }}
                        />
                        <a
                            className="email_address_value"
                            href="before-you-sail#personalDetails"
                        >
                            {changeEmailAddressCTALabel}
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    renderPageDescription2() {
        let {
            labels: {
                emailConfirmationMessageLabel,
                dobLabel,
                ageWhenEmbarkLabel,
                defaultDobLabel,
                defaultAgeLabel,
                dobIncorrectLabel,
                dobIncorrectContactNumber,
                faqDescLabel,
                faqLinkText,
                faqLinkURL,
                openFAQinNewTab,
                mandatoryLabel,
                dobNotAvailableLabel
            }
        } = this.props;

        const {
            customerEmail,
            options,
            selectedPassenger,
            minAdultAge,
            locale
        } = this.state;
        let isSeletedChildHasDob = false;
        const values = Object.values(selectedPassenger);
        if (options.length && values[0].length !== 0) {
            isSeletedChildHasDob =
                selectedPassenger.dob && selectedPassenger.age < minAdultAge;
        }

        emailConfirmationMessageLabel =
            emailConfirmationMessageLabel &&
            emailConfirmationMessageLabel.length > 0 &&
            emailConfirmationMessageLabel.replace(
                /{emailAddress}/gi,
                customerEmail
            );

        return (
            <div className="description__container">
                <div className="description__body__left">
                    {this.renderPassengerSelectField()}
                    <div className="dateOfBirth_container">
                        <div className="embarkDate_container">
                            <p>{dobLabel}</p>
                            <p style={{ marginTop: '5px' }}>
                                {selectedPassenger.dob
                                    ? moment(selectedPassenger.dob).format(
                                          locale == 'en_US'
                                              ? 'MM/DD/YYYY'
                                              : 'DD/MM/YYYY'
                                      )
                                    : defaultDobLabel}
                            </p>
                        </div>
                        <div className="cruiseNumber_container">
                            <p>{ageWhenEmbarkLabel}</p>
                            <p style={{ marginTop: '5px' }}>
                                {selectedPassenger.age
                                    ? selectedPassenger.age
                                    : defaultAgeLabel}
                            </p>
                        </div>
                    </div>
                    {isSeletedChildHasDob && (
                        <div className="note__container">
                            <p>
                                {dobIncorrectLabel}{' '}
                                <a className="cta-secondary font_size" href="">
                                    {dobIncorrectContactNumber}
                                </a>
                            </p>
                            <p style={{ marginTop: '5px' }}>
                                {faqDescLabel}{' '}
                                <a
                                    className="cta-secondary font_size"
                                    href={faqLinkURL}
                                    target={
                                        openFAQinNewTab == 'true'
                                            ? '_blank'
                                            : ''
                                    }
                                >
                                    {faqLinkText}
                                </a>
                            </p>
                        </div>
                    )}
                    {!isSeletedChildHasDob && (
                        <div className="note__container">
                            <p>{dobNotAvailableLabel}</p>
                        </div>
                    )}
                    {isSeletedChildHasDob && (
                        <p className="astrick-mandatory-label">
                            {mandatoryLabel}
                        </p>
                    )}
                </div>
            </div>
        );
    }

    renderQuestionContent() {
        const { questions } = this.state;
        if (questions.length) {
            return (
                <ul>
                    {questions.map((question) =>
                        this.renderQuestionnaire(question)
                    )}
                </ul>
            );
        }

        return null;
    }

    renderTitleHeader() {
        const {
            labels: { YRTitleLabel }
        } = this.props;
        return (
            <div className="header">
                <h3 className="title">{YRTitleLabel}</h3>
            </div>
        );
    }

    renderAssignCarerLabelHeader() {
        const {
            labels: { assignCarerLabel, assignCarerDesc }
        } = this.props;
        return (
            <div className="assignCarerHeaderLabel">
                <h3 className="title">{assignCarerLabel}</h3>
                <p className="description">{assignCarerDesc}</p>
            </div>
        );
    }

    handleTextChange = (evt, index) => {
        let newSelected = evt.target.value;
        let carerInformation = this.state.carerInformation;
        carerInformation[index][evt.target.name] = newSelected;
        carerInformation[index]['hasError'] = false;
        carerInformation[index]['valid'] = false;
        this.setState({
            carerInformation: carerInformation
        });
    };

    renderCarerInformation = (singleCarerInfo, index) => {
        const {
            labels: {
                firstNameLabel,
                lastNameLabel,
                bookingRefLabel,
                relationshipLabel,
                errorCarerValidationMsgLabel,
                errorCarerMandatoryMsgLabel,
                pleaseSelectLabel,
                removeGuardianLabel
            },
            errorCodeMap
        } = this.props;

        const {
            firstName,
            lastName,
            bookingRef,
            relationship,
            hasError = false,
            valid = false,
            httpRes = {}
        } = singleCarerInfo;

        let validationErrorText = errorCarerValidationMsgLabel;
        if (httpRes.httpResponseStatus && httpRes.httpResponseStatus == '200') {
            if (httpRes.statusCode) {
                const objTitleKey = `${'getYouthRegistrationTrustedCarer'}.httpStatusCode.${
                    httpRes.statusCode
                }.title`;
                if (errorCodeMap.hasOwnProperty(objTitleKey)) {
                    validationErrorText = errorCodeMap[objTitleKey];
                } else {
                    validationErrorText = errorCodeMap['default.title'];
                }
            } else {
                validationErrorText = errorCodeMap['default.title'];
            }
        }

        const isRemoveCtaShow = index > 0 ? true : false;

        return (
            <div className="form_container" key={`form_container_${index}`}>
                {hasError && (
                    <p className="error-msg-container">
                        {valid
                            ? validationErrorText
                            : errorCarerMandatoryMsgLabel}
                    </p>
                )}
                {isRemoveCtaShow && (
                    <span
                        onClick={() => this.removeCarerInfoContainer(index)}
                        className="removeCtaContainer"
                    >
                        {removeGuardianLabel}
                    </span>
                )}
                <div className="form-field-row">
                    <InputField
                        type="text"
                        inputClass={hasError ? 'show-error' : ''}
                        required={true}
                        id="firstName"
                        name="firstName"
                        changeCallback={(e) => this.handleTextChange(e, index)}
                        placeholder={`${firstNameLabel}*`}
                        value={firstName}
                        showAstrick={true}
                    />
                </div>
                <div className="form-field-row">
                    <InputField
                        type="text"
                        inputClass={hasError ? 'show-error' : ''}
                        required={true}
                        id="lastName"
                        name="lastName"
                        changeCallback={(e) => this.handleTextChange(e, index)}
                        placeholder={`${lastNameLabel}*`}
                        value={lastName}
                        showAstrick={true}
                    />
                </div>
                <div className="birthDate-container">
                    <p className="label">{pleaseSelectLabel}</p>
                    {this.renderBirthDateSelectSection(singleCarerInfo, index)}
                </div>
                <div className="form-field-row">
                    <InputField
                        type="text"
                        inputClass={hasError ? 'show-error' : ''}
                        required={true}
                        id="bookingRef"
                        name="bookingRef"
                        changeCallback={(e) => this.handleTextChange(e, index)}
                        placeholder={`${bookingRefLabel}*`}
                        value={bookingRef}
                        showAstrick={true}
                    />
                </div>
                <div className="form-field-row">
                    <InputField
                        type="text"
                        inputClass={hasError ? 'show-error' : ''}
                        required={true}
                        id="relationship"
                        name="relationship"
                        changeCallback={(e) => this.handleTextChange(e, index)}
                        placeholder={`${relationshipLabel}*`}
                        value={relationship}
                        showAstrick={true}
                    />
                </div>
            </div>
        );
    };

    removeCarerInfoContainer(index) {
        const { carerInformation } = this.state;
        if (index > -1) {
            carerInformation.splice(index, 1);
        }
        this.setState({
            carerInformation: carerInformation
        });
    }

    renderBirthDateSelectSection(singleCarerInfo, index) {
        const { checkForCarerInfo, locale } = this.state;
        const {
            yearsRange,
            daysRange,
            labels: { dayLabel, monthLabel, yearLabel },
            formFields: {
                month: { options }
            }
        } = this.props;

        const { day, month, year, hasError } = singleCarerInfo;

        const yearsOptions = createYearsOptions(yearsRange, 'birth');
        const daysOptions = createDaysOptions(daysRange);

        return locale == 'en_US' ? (
            <div className="birthDate-select-group">
                <SelectField
                    selectClassName={
                        hasError ? 'select-month show-error' : 'select-month'
                    }
                    name="month"
                    ariaRequired={false}
                    disableValidation={true}
                    label={monthLabel}
                    showLabel={false}
                    value={month.value}
                    title={month.label}
                    options={options}
                    changeCallback={(name, value, title, event) =>
                        this.handleSelectDate(name, value, title, event, index)
                    }
                    // errorMsg={month.error}
                />
                <SelectField
                    selectClassName={
                        hasError
                            ? 'select-day index-margin show-error'
                            : 'select-day index-margin'
                    }
                    name="day"
                    ariaRequired={false}
                    disableValidation={true}
                    label={dayLabel}
                    showLabel={false}
                    value={day.value}
                    title={day.label}
                    options={daysOptions.slice(0, daysRange)}
                    changeCallback={(name, value, title, event) =>
                        this.handleSelectDate(name, value, title, event, index)
                    }
                    // errorMsg={day.error}
                />
                <SelectField
                    selectClassName={
                        hasError ? 'select-year show-error' : 'select-year'
                    }
                    name="year"
                    ariaRequired={false}
                    disableValidation={true}
                    label={yearLabel}
                    showLabel={false}
                    value={year.value}
                    title={year.label}
                    options={yearsOptions}
                    changeCallback={(name, value, title, event) =>
                        this.handleSelectDate(name, value, title, event, index)
                    }
                    // errorMsg={year.error}
                />
            </div>
        ) : (
            <div className="birthDate-select-group">
                <SelectField
                    selectClassName={
                        hasError ? 'select-day show-error' : 'select-day'
                    }
                    name="day"
                    ariaRequired={false}
                    disableValidation={true}
                    label={dayLabel}
                    showLabel={false}
                    value={day.value}
                    title={day.label}
                    options={daysOptions.slice(0, daysRange)}
                    changeCallback={(name, value, title, event) =>
                        this.handleSelectDate(name, value, title, event, index)
                    }
                    // errorMsg={day.error}
                />
                <SelectField
                    selectClassName={
                        hasError
                            ? 'select-month index-margin show-error'
                            : 'select-month index-margin'
                    }
                    name="month"
                    ariaRequired={false}
                    disableValidation={true}
                    label={monthLabel}
                    showLabel={false}
                    value={month.value}
                    title={month.label}
                    options={options}
                    changeCallback={(name, value, title, event) =>
                        this.handleSelectDate(name, value, title, event, index)
                    }
                    // errorMsg={month.error}
                />
                <SelectField
                    selectClassName={
                        hasError ? 'select-year show-error' : 'select-year'
                    }
                    name="year"
                    ariaRequired={false}
                    disableValidation={true}
                    label={yearLabel}
                    showLabel={false}
                    value={year.value}
                    title={year.label}
                    options={yearsOptions}
                    changeCallback={(name, value, title, event) =>
                        this.handleSelectDate(name, value, title, event, index)
                    }
                    // errorMsg={year.error}
                />
            </div>
        );
    }

    handleSelectDate = (name, value, title, event, index) => {
        const selectedValue = {
            label: title,
            value: value
        };
        let carerInformation = this.state.carerInformation;
        carerInformation[index][name] = selectedValue;
        carerInformation[index]['hasError'] = false;
        this.setState({
            carerInformation: carerInformation
        });
    };

    renderParentalResponsibility() {
        const {
            labels: {
                parentalResponsibilityLabel,
                readAgainLabel,
                readAndAcknowledgeLabel,
                errorParentalResponsibilityNotSubmittedLabel
            }
        } = this.props;
        const { acceptedTerms, firstTime } = this.state;
        const errorClass = !firstTime && !acceptedTerms ? 'error__show' : '';
        return !acceptedTerms ? (
            <div>
                <div
                    className={`parentalResponsibility-container ${errorClass}`}
                >
                    <p className="parentalResponsibilityLabel">
                        {parentalResponsibilityLabel}
                    </p>
                    <p
                        className="readAgainLabel"
                        onClick={this.handleReadAgainLabel}
                    >
                        {readAndAcknowledgeLabel}
                    </p>
                </div>
                {errorClass && (
                    <p className="error-text">
                        {errorParentalResponsibilityNotSubmittedLabel}
                    </p>
                )}
            </div>
        ) : (
            <div className={`parentalResponsibility-container1`}>
                <div className="left-section">
                    <p className="parentalResponsibilityLabel">
                        {parentalResponsibilityLabel}
                    </p>
                    <p
                        className="readAgainLabel"
                        onClick={this.handleReadAgainLabel}
                    >
                        {readAgainLabel}
                    </p>
                </div>
                <div className="right-section">
                    <span>✔</span>
                </div>
            </div>
        );
    }

    handleReadAgainLabel = () => {
        this.setState({
            showParentalResposibleOverlay: true
        });
    };

    handleCloseCTA = () => {
        this.setState({
            showParentalResposibleOverlay: false,
            acceptedTerms: false
        });
    };

    renderPassengerSelectField(key = '') {
        const {
            labels: { childLabel, childRegisteredLabel, childUnRegisteredLabel }
        } = this.props;
        const {
            selectedPassenger,
            options,
            dayToCruiseDeparture,
            youthRegistrationDaysX,
            menuIsOpen
        } = this.state;

        const selectedPassengerArray = options.filter((singleOption) => {
            return selectedPassenger.value == singleOption.value;
        });

        const Option = (props) => {
            return (
                <components.Option {...props}>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'space-between'
                        }}
                    >
                        <span>{props.data.label}</span>
                        <span
                            style={{
                                marginRight: '25px',
                                fontSize: 16,
                                fontWeight: 'bold',
                                color: '#002776'
                            }}
                        >
                            {props.data.registered
                                ? childRegisteredLabel
                                : childUnRegisteredLabel}
                        </span>
                    </div>
                </components.Option>
            );
        };

        return dayToCruiseDeparture <= youthRegistrationDaysX ? (
            <div className={`passengerSelectFieldContainer${key}`}>
                <p>{childLabel}</p>
                <div
                    onClick={() => {
                        this.setState({ menuIsOpen: !menuIsOpen });
                    }}
                >
                    <Select
                        id="select-group-custom-one"
                        className="react-select-container select-group"
                        classNamePrefix="react-select"
                        placeholder={selectedPassenger.title}
                        isSearchable={false}
                        options={options}
                        menuIsOpen={menuIsOpen}
                        components={{ Option }}
                        onChange={this.handleSelectBoxChange}
                    />
                </div>
                {selectedPassenger && (
                    <span
                        style={{
                            fontSize: 16,
                            fontWeight: 'bold',
                            color: '#002776',
                            cursor: 'pointer',
                            position: 'absolute',
                            bottom: '15px',
                            right: '15%'
                        }}
                        onClick={() => {
                            this.setState({ menuIsOpen: !menuIsOpen });
                        }}
                    >
                        {selectedPassengerArray[0].registered
                            ? childRegisteredLabel
                            : childUnRegisteredLabel}
                    </span>
                )}
            </div>
        ) : null;
    }

    renderSubmitButton() {
        const {
            labels: { submitQuestionnaireCTALabel }
        } = this.props;

        return (
            <div className="submitButton__container">
                <button
                    className="cta-primary"
                    data-clicktype={submitQuestionnaireCTALabel}
                    data-linktext={submitQuestionnaireCTALabel}
                    onClick={() => this.handleSubmitClickBtn()}
                >
                    {submitQuestionnaireCTALabel}
                </button>
            </div>
        );
    }

    handleSubmitClickBtn = () => {
        let errorMsgOnScreen = '';
        this.setState(
            {
                firstTime: false
            },
            () => {
                const ele = document.getElementsByClassName('error__show');
                const { acceptedTerms, carerInformation } = this.state;
                let flag = !carerInformation.length;
                carerInformation.map((singleCarerInformation, index) => {
                    const {
                        bookingRef,
                        firstName,
                        lastName,
                        relationship,
                        day,
                        month,
                        year
                    } = singleCarerInformation;
                    if (
                        !flag &&
                        !index &&
                        (bookingRef == '' &&
                            firstName == '' &&
                            lastName == '' &&
                            relationship == '' &&
                            (day.value == '' || day.value == undefined) &&
                            (month.value == '' || month.value == undefined) &&
                            (year.value == '' || year.value == undefined))
                    ) {
                        flag = true;
                        singleCarerInformation.hasError = false;
                    } else {
                        flag = false;
                    }
                });
                if (ele.length) {
                    ele[0].scrollIntoView(false);
                    for (let i = 0; i < ele.length; i++) {
                        errorMsgOnScreen = `${errorMsgOnScreen}${
                            i ? '|' : ' '
                        }${ele[i].nextSibling.innerText}`;
                    }
                    this.sendDataToAnalytics(errorMsgOnScreen);
                } else if (flag && acceptedTerms) {
                    this.setState({
                        confirmAndContinue: true,
                        carerInformation: carerInformation
                    });
                } else {
                    this.handleCarerInfoValidation();
                }
            }
        );
    };

    handleCarerInfoValidation = () => {
        const header = SessionStorage.getItem('header');
        const { passengers, costomer, embarkationDate } = header;
        const { carerInformation, minAdultAge } = this.state;
        let isApiCall = false;
        const wrongDetail = {
            httpResponseStatus: 200,
            statusCode: '95',
            statusMessage: 'Adult pax not found',
            timeinMillis: 0
        };

        const childDetail = {
            httpResponseStatus: 200,
            statusCode: '93',
            statusMessage: 'Adult is too young',
            timeinMillis: 76
        };
        carerInformation.map((singleCarerInfo, index) => {
            const {
                bookingRef,
                firstName,
                lastName,
                relationship,
                day,
                month,
                year
            } = singleCarerInfo;

            let flag = false;

            if (
                bookingRef == '' ||
                firstName == '' ||
                lastName == '' ||
                relationship == '' ||
                day.value == '' ||
                month.value == '' ||
                year.value == ''
            ) {
                flag = true;
            }
            singleCarerInfo['isApiTriggred'] = true;
            if (header.bookingRef == bookingRef.trim()) {
                singleCarerInfo['isApiTriggred'] = false;
                if (!flag) {
                    const dob = `${year.value}-${month.value}-${day.value}`;
                    const trustedCarer = passengers.filter(
                        (singlePassenger) => {
                            return (
                                singlePassenger.birthDate == dob &&
                                singlePassenger.firstName.toLowerCase() ==
                                    firstName.trim().toLowerCase() &&
                                singlePassenger.lastName.toLowerCase() ==
                                    lastName.trim().toLowerCase()
                            );
                        }
                    );
                    if (trustedCarer.length) {
                        const { birthDate, guestId } = trustedCarer[0];
                        const passengerBirth = new Date(birthDate);
                        const embarkDate = new Date(embarkationDate);
                        const ageAtEmbark = calculateAge(
                            passengerBirth.getTime(),
                            embarkDate.getTime()
                        );
                        if (ageAtEmbark < minAdultAge) {
                            singleCarerInfo.hasError = true;
                            singleCarerInfo.valid = true;
                            singleCarerInfo.httpRes = childDetail;
                            this.sendDataToAnalytics(
                                childDetail,
                                'getYouthRegistrationTrustedCarer'
                            );
                        } else {
                            singleCarerInfo['guestId'] = guestId;
                            singleCarerInfo.hasError = false;
                            singleCarerInfo.valid = false;
                            singleCarerInfo.httpRes = {};
                        }
                    } else {
                        singleCarerInfo.hasError = true;
                        singleCarerInfo.valid = true;
                        singleCarerInfo.httpRes = wrongDetail;
                        this.sendDataToAnalytics(
                            wrongDetail,
                            'getYouthRegistrationTrustedCarer'
                        );
                    }
                } else {
                    singleCarerInfo.hasError = true;
                    singleCarerInfo.valid = false;
                    singleCarerInfo.httpRes = {};
                    this.sendDataToAnalytics(
                        this.props.labels.errorCarerMandatoryMsgLabel || ''
                    );
                }
            } else if (flag) {
                this.sendDataToAnalytics(
                    this.props.labels.errorCarerMandatoryMsgLabel || ''
                );
                singleCarerInfo.hasError = true;
                singleCarerInfo.valid = false;
                singleCarerInfo.httpRes = {};
            }
        });

        carerInformation.forEach((value, index) => {
            const { hasError = false, valid = false } = value;
            if ((hasError || valid) && !isApiCall) {
                isApiCall = true;
            }
        });

        if (!isApiCall) {
            this.setState(
                {
                    isFetching: true,
                    carerInformation: carerInformation
                },
                () => {
                    this.validateCarerInfo();
                }
            );
        } else {
            this.setState(
                {
                    carerInformation: carerInformation
                },
                () => {
                    this.showErrorLabelForTrustedCarer();
                }
            );
        }
    };

    validateCarerInfo = () => {
        const { selectedPassenger, carerInformation } = this.state;
        const header = SessionStorage.getItem('header');
        const { passengers } = header;
        const childDetail = passengers.filter((singleGuest) => {
            return singleGuest.paxNumber == selectedPassenger.value;
        });
        const carerInformationListData = [];
        const newCarerInfoArray = carerInformation.length
            ? carerInformation.reduce(
                  (carerInformationList, singleCarerInformation, index) => {
                      carerInformationList.push(singleCarerInformation);
                      const dob = `${singleCarerInformation.year.value}${
                          singleCarerInformation.month.value
                      }${singleCarerInformation.day.value}`;
                      const postData = {
                          data: {
                              childGuestId: childDetail.length
                                  ? childDetail[0].guestId
                                  : '',
                              guestTobeValidated: {
                                  firstName: singleCarerInformation.firstName.trim(),
                                  lastName: singleCarerInformation.lastName.trim(),
                                  dateOfBirth: dob,
                                  bookingNo: singleCarerInformation.bookingRef.trim()
                              }
                          }
                      };

                      const youthRegTrustedCarerValidationAPIURL = getConfig(
                          'youthRegTrustedCarerValidationAPIURL'
                      );
                      singleCarerInformation.isApiTriggred &&
                      carerInformationListData.push(
                          FetchData(youthRegTrustedCarerValidationAPIURL, {
                              method: 'POST',
                              body: JSON.stringify(postData),
                              headers: {
                                  'Content-Type': 'application/json',
                                  'X-Source-Identity-Token-0': getConfig(
                                      'apikeyMycruise'
                                  )
                              }
                          })
                              .then((res) => {
                                  carerInformationList[index].hasError = false;
                                  carerInformationList[index].valid = false;
                                  carerInformationList[index].failed = false;
                                  carerInformationList[index].type =
                                      'getYouthRegistrationTrustedCarer';
                                  if (res.httpResponseStatus == '200') {
                                      if (res.statusCode == '00') {
                                          if (
                                              res.validatedGuest &&
                                              res.validatedGuest.guestId
                                          ) {
                                              carerInformation[index][
                                                  'guestId'
                                              ] =
                                                  res.validatedGuest.guestId;
                                              carerInformationList[
                                                  index
                                              ].hasError = false;
                                              carerInformationList[
                                                  index
                                              ].failed = false;
                                              carerInformationList[
                                                  index
                                              ].valid = false;
                                          } else {
                                              carerInformationList[
                                                  index
                                              ].hasError = true;
                                              carerInformationList[
                                                  index
                                              ].valid = true;
                                              carerInformationList[
                                                  index
                                              ].failed = false;
                                              carerInformationList[
                                                  index
                                              ].httpRes = res;
                                              this.sendDataToAnalytics(
                                                  res,
                                                  'getYouthRegistrationTrustedCarer'
                                              );
                                          }
                                      } else {
                                          carerInformationList[
                                              index
                                          ].hasError = true;
                                          carerInformationList[
                                              index
                                          ].valid = true;
                                          carerInformationList[
                                              index
                                          ].failed = false;
                                          carerInformationList[
                                              index
                                          ].httpRes = res;
                                          this.sendDataToAnalytics(
                                              res,
                                              'getYouthRegistrationTrustedCarer'
                                          );
                                      }
                                  } else {
                                      carerInformationList[
                                          index
                                      ].hasError = true;
                                      carerInformationList[index].valid = false;
                                      carerInformationList[index].failed = true;
                                      carerInformationList[index].httpRes = res;
                                      this.sendDataToAnalytics(
                                          res,
                                          'getYouthRegistrationTrustedCarer'
                                      );
                                  }
                              })
                              .catch((res) => {
                                  carerInformationList[index].hasError = true;
                                  carerInformationList[index].vaild = true;
                                  carerInformationList[index].failed = true;
                                  this.sendDataToAnalytics(
                                      res,
                                      'getYouthRegistrationTrustedCarer'
                                  );
                              })
                      );
                      return carerInformationList;
                  },
                  []
              )
            : [];

        Promise.all(carerInformationListData).then(() => {
            let validationHasErrorValue = false;
            let isConfirmAndContinue = true;
            let response = {};
            newCarerInfoArray.length &&
                newCarerInfoArray.map((value) => {
                    if (value.failed && !validationHasErrorValue) {
                        validationHasErrorValue = true;
                        response = value.httpRes;
                    }
                    if (value.hasError) {
                        isConfirmAndContinue = false;
                    }
                });
            this.setState({
                carerInformation: newCarerInfoArray,
                isFetching: false,
                confirmAndContinue: isConfirmAndContinue,
                validationHasError: validationHasErrorValue,
                error: {
                    res: response,
                    type: 'getYouthRegistrationTrustedCarer'
                }
            });
        });
    };

    showErrorLabelForTrustedCarer() {
        const ele = document.getElementsByClassName('show-error');
        ele.length && ele[0].scrollIntoView(false);
    }

    renderSuccessAndFailureScreen() {
        const { showSuccessScreen } = this.state;

        if (showSuccessScreen) {
            window.scrollTo(0, 0);
            return this.renderSuccessMessageCard();
        }

        return this.renderFailureMessageCard();
    }

    renderCorrectCard() {
        const {
            youthRegistrationDaysX,
            dayToCruiseDeparture,
            customerAge,
            isGuestBooking,
            minAdultAge,
            options
        } = this.state;

        if (!isGuestBooking) {
            return this.renderCCATAMessageCard();
        }

        if (!options.length) {
            return this.renderBookingMessageWithoutChildCard();
        }

        if (customerAge < minAdultAge) {
            return this.renderUnderAgeMessageCard();
        }

        if (youthRegistrationDaysX < dayToCruiseDeparture) {
            return this.renderEarlyMessageCard();
        }

        return this.renderContent();
    }

    handleAddMoreCarerInfo = () => {
        const { carerInformation } = this.state;
        let newCarerInfo = carerInformation;
        newCarerInfo.push({
            bookingRef: '',
            firstName: '',
            lastName: '',
            day: {
                label: '',
                value: ''
            },
            month: {
                label: '',
                value: ''
            },
            year: {
                label: '',
                value: ''
            },
            relationship: ''
        });
        this.setState({
            carerInformation: newCarerInfo
        });
    };

    renderAddMoreParentalCta() {
        const {
            labels: { addGuardianLabel }
        } = this.props;
        return (
            <div className="add-more-parental-cta-container">
                <button
                    className="cta-primary-light-blue"
                    data-clicktype={addGuardianLabel}
                    data-linktext={addGuardianLabel}
                    onClick={this.handleAddMoreCarerInfo}
                >
                    {addGuardianLabel}
                </button>
            </div>
        );
    }

    renderContent() {
        const {
            carerInformation,
            options,
            selectedPassenger,
            minAdultAge
        } = this.state;
        let isSeletedChildHasDob = false;
        const values = Object.values(selectedPassenger);
        if (options.length && values[0].length !== 0) {
            isSeletedChildHasDob =
                selectedPassenger.dob && selectedPassenger.age < minAdultAge;
        }
        return (
            <div>
                {this.renderPageDescription()}
                {this.renderPageDescription2()}
                {isSeletedChildHasDob && this.renderQuestionContent()}
                {isSeletedChildHasDob && this.renderAssignCarerLabelHeader()}
                {isSeletedChildHasDob && (
                    <div className="carter_container">
                        {carerInformation.map(this.renderCarerInformation)}
                    </div>
                )}
                {isSeletedChildHasDob &&
                    carerInformation.length < 3 &&
                    this.renderAddMoreParentalCta()}
                {isSeletedChildHasDob && this.renderParentalResponsibility()}
                {isSeletedChildHasDob && this.renderSubmitButton()}
            </div>
        );
    }

    handleConfirmTC = () => {
        this.setState({
            acceptedTerms: true,
            showParentalResposibleOverlay: false
        });
    };

    handleCheckbox = (e) => {
        this.setState({
            confirmSubmitBtnEnabled: e.target.checked
        });
    };

    handleModalExpired = () => {
        this.setState({
            confirmAndContinue: false,
            confirmSubmitBtnEnabled: false
        });
    };

    handleModalConfirmBtn = () => {
        this.setState(
            {
                firstTime: true,
                confirmSubmitBtnEnabled: false,
                acceptedTerms: false,
                confirmAndContinue: false,
                isFetching: true
            },
            () => {
                let youthRegSubmitQuestionnaireResponseAPIURL = getConfig(
                    'youthRegSubmitQuestionnaireResponseAPIURL'
                );
                const apiKey = getConfig('apikeyMycruise');
                const {
                    selectedPassenger,
                    questions,
                    carerInformation,
                    JWT__token,
                    questionSetID
                } = this.state;
                const {
                    labels: { relationshipDefaultCarerValue = 'Parent' }
                } = this.props;
                const header = SessionStorage.getItem('header');
                const {
                    bookingRef,
                    cruiseCode,
                    language,
                    brandCode,
                    passengers,
                    customer
                } = header;
                const cruiseData = SessionStorage.getItem('cruiseData');
                const { shipName, embarkDate } = cruiseData;
                const guestDetail = passengers.filter((singleGuest) => {
                    return singleGuest.paxNumber == customer.PaxNumber;
                });
                const { title, firstName, lastName, guestId } = guestDetail[0];
                const childDetail = passengers.filter((singleGuest) => {
                    return singleGuest.paxNumber == selectedPassenger.value;
                });

                const youthQuestionDetails = [];
                questions.length &&
                    questions.map((singleQuestion) => {
                        const questionDetail = {
                            questionID: singleQuestion.questionID,
                            questionResponse: singleQuestion.questionResponse,
                            questionResponseExtraInfo: singleQuestion.questionResponseExtraInfo
                                ? singleQuestion.questionResponseExtraInfo
                                : ''
                        };
                        youthQuestionDetails.push(questionDetail);
                    });

                const trustedCarers = [
                    {
                        guestId: guestId,
                        relationshipToChild: relationshipDefaultCarerValue
                    }
                ];

                carerInformation.length &&
                    carerInformation.map((singleCarerInfo) => {
                        if (singleCarerInfo.guestId) {
                            trustedCarers.push({
                                guestId: singleCarerInfo.guestId,
                                relationshipToChild:
                                    singleCarerInfo.relationship
                            });
                        }
                    });

                const filteredTrustedCarers = trustedCarers.reduce(
                    (acc, current) => {
                        const x = acc.find(
                            (item) => item.guestId === current.guestId
                        );
                        if (!x) {
                            return acc.concat([current]);
                        } else {
                            return acc;
                        }
                    },
                    []
                );

                const postData = {
                    data: {
                        childGuestId: childDetail.length
                            ? childDetail[0].guestId
                            : '',
                        completedByguestId: guestId,
                        medicalConsentTimestamp: `${moment().format(
                            'YYYYMMDDhhmmss'
                        )}`,
                        confirmationTimestamp: `${moment().format(
                            'YYYYMMDDhhmmss'
                        )}`,
                        youthQuestionDetails: youthQuestionDetails,
                        youthOtherInformation: '',
                        trustedCarers: filteredTrustedCarers,
                        questionSetID: questionSetID,
                        emailDetails: {
                            bookingno: bookingRef,
                            emailAddress: customer.email,
                            shipName: shipName,
                            embarkationdate: moment(embarkDate).format(
                                'YYYYMMDD'
                            ),
                            cruiseCode: cruiseCode,
                            brand: brandCode,
                            locale: language,
                            childGuestId: childDetail.length
                                ? childDetail[0].guestId
                                : '',
                            childFirstName: childDetail.length
                                ? childDetail[0].firstName
                                : '',
                            childLastName: childDetail.length
                                ? childDetail[0].lastName
                                : '',
                            completedByguestId: guestId,
                            completedByTitle: title,
                            completedByLastName: lastName,
                            completedByFirstName: firstName
                        },
                        agentDetails: {
                            completedByAgent: '',
                            completedOnDevice: ''
                        }
                    }
                };

                youthRegSubmitQuestionnaireResponseAPIURL = youthRegSubmitQuestionnaireResponseAPIURL.replace(
                    '{guestId}',
                    guestId
                );

                FetchData(youthRegSubmitQuestionnaireResponseAPIURL, {
                    method: 'POST',
                    body: JSON.stringify(postData),
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Source-Identity-Token-0': apiKey,
                        userxtoken: JWT__token.userxtoken
                    }
                })
                    .then((response) => {
                        if (response.statusCode == '00') {
                            this.setState({
                                showSuccessScreen: true,
                                postAnswerHasError: false,
                                isFetching: false
                            });
                        } else {
                            this.setState({
                                postAnswerHasError: true,
                                isFetching: false,
                                error: {
                                    res: response,
                                    type:
                                        'submitYouthRegistrationQuestionsResponse'
                                }
                            });
                            this.sendDataToAnalytics(
                                response,
                                'submitYouthRegistrationQuestionsResponse'
                            );
                        }
                    })
                    .catch((err) => {
                        this.setState({
                            postAnswerHasError: true,
                            isFetching: false,
                            error: {
                                res: err,
                                type: 'youthPostResponse'
                            }
                        });
                        this.sendDataToAnalytics(err, 'youthPostResponse');
                    });
            }
        );
    };

    render() {
        const {
            labels: {
                confirmationPopupTitleLabel,
                confirmationPopupDescLabel,
                confirmationPopupCheckboxLabel,
                confirmationPopupGoBackLabel,
                confirmationPopupSubmitLabel,
                parentalResponsibilityPopupSubmitButtonLabel
            }
        } = this.props;

        const disabledValue = this.state.confirmSubmitBtnEnabled
            ? ''
            : 'disabled';

        const titleAndParagraph = extractChildComponent(
            this.props.childComponents,
            'titleAndParagraph'
        );

        const { title = '', description = '' } =
            (titleAndParagraph && titleAndParagraph.attributes) || {};

        const {
            showSuccessScreen,
            jwtTokenHasError,
            questionHasError,
            validationHasError,
            postAnswerHasError
        } = this.state;

        if (
            jwtTokenHasError ||
            questionHasError ||
            validationHasError ||
            postAnswerHasError
        ) {
            return (
                <div className="show-texture healthQuestionnaire">
                    {this.renderTitleHeader()}
                    {this.renderFailureMessageCard()}
                </div>
            );
        }

        return (
            <div>
                <div className="show-texture healthQuestionnaire">
                    {this.renderTitleHeader()}
                    {showSuccessScreen && this.renderSuccessAndFailureScreen()}
                    {!showSuccessScreen && this.renderCorrectCard()}
                </div>
                {this.state.showParentalResposibleOverlay && (
                    <Modal
                        mounted={this.state.showParentalResposibleOverlay}
                        onExit={() => this.handleCloseCTA()}
                        contentLabel="Error modal"
                        ctaType={this.props.ctaType}
                        underlayClass="parentalGuideLine-modal"
                    >
                        <div className="termsAndConditionContainer">
                            <h1>{title}</h1>
                            <p
                                dangerouslySetInnerHTML={{
                                    __html: description
                                }}
                            />
                        </div>

                        <div className="modal-btns">
                            <button
                                className="cta-primary"
                                onClick={() => this.handleConfirmTC()}
                            >
                                {parentalResponsibilityPopupSubmitButtonLabel}
                            </button>
                        </div>
                    </Modal>
                )}
                {this.state.confirmAndContinue && (
                    <Modal
                        mounted={this.state.confirmAndContinue}
                        onExit={() => this.handleModalExpired()}
                        contentLabel="warningModal"
                        ctaType={'close'}
                        underlayClass="warningModal"
                    >
                        <div className="model_body">
                            <div className="icon__container">
                                <span className="icon-heading" />
                            </div>
                            <h2>{confirmationPopupTitleLabel}</h2>
                            <p>{confirmationPopupDescLabel}</p>
                            <li className="wrap">
                                <div
                                    style={{
                                        marginLeft: 'auto',
                                        marginRight: 'auto'
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        className="input-check"
                                        aria-labelledby="variation2-check"
                                        name="checkboxTerm"
                                        id={`checkbox`}
                                        checked={
                                            this.state.confirmSubmitBtnEnabled
                                        }
                                        onChange={(e) => this.handleCheckbox(e)}
                                    />
                                    <label className="checkbox-label">
                                        <h5>
                                            <span className="passenger">
                                                {confirmationPopupCheckboxLabel}
                                            </span>
                                        </h5>
                                    </label>
                                </div>
                            </li>

                            <div className="modal-btn-container">
                                <button
                                    className="cta-secondary"
                                    onClick={this.handleModalExpired}
                                >
                                    {confirmationPopupGoBackLabel}
                                </button>
                                <button
                                    className={`cta-primary ${disabledValue}`}
                                    onClick={() => this.handleModalConfirmBtn()}
                                >
                                    {confirmationPopupSubmitLabel}
                                </button>
                            </div>
                        </div>
                    </Modal>
                )}
                {this.state.isFetching && (
                    <div className="throbberOverlay">
                        <Loader show={this.state.isFetching} />
                        <p className="throbberOverlay__text" />
                    </div>
                )}
            </div>
        );
    }
}

youthRegistration.defaultProps = {
    yearsRange: 137,
    daysRange: 31
};

export default youthRegistration;
