'use strict';

import React from 'react';
import SessionStorage from '../commons/CUK/session-storage';
import moment from 'moment';
import SelectField from '../commons/CUK/selectField';
import analytics from '../commons/CUK/analytics';
import { calculateAge } from '../commons/CUK/dateFormat';
import FetchData from '../commons/CUK/fetch-data';
import { getConfig, getPaxConcent } from '../commons/CUK/utilities';
import Modal from '../commons/CUK/modal';

class healthQuestionnaire extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLeadPassenger: false,
      healthQuestionnaireDaysX: 3,
      dayToCruiseDeparture: 0,
      customerAge: 0,
      hasConsent: true,
      customerEmail: '',
      minAdultAge: getConfig('minAdultAge', ''),
      phaseLabel: getConfig('healthQuestionnaireApiParamPhase', ''),
      JWT__token: {
        guestId: '',
        userxtoken: ''
      },
      questionnaireResponseStatus: 'NOTCOMPLETE',
      selectedPassenger: {
        title: '',
        value: '',
      },
      questionSetID: '',
      getQuestionnaireResponse: {},
      confirmSubmitBtnEnabled: false,
      travelInsuranceCheckBoxChecked: false,
      travelInsuranceCheckBoxUnChecked: false,
      selectedCustomerUnderAge: false,
      firstTime: true,
      options: [],
      questions: [],
      showModal: false,
      errorModel: false,
      errorType: ''
    };

    this.retrieveSelectedPassengerQuestionnaireResponse = this.retrieveSelectedPassengerQuestionnaireResponse.bind(this);
    this.handlePrintClick = this.handlePrintClick.bind(this);
  }

  componentDidMount() {
    // if (!ValidateSession.checkCookie(['wcmmode'])) { };
  }

  componentWillMount() {
    this.getDaysToCruiseDeparture();
  }

  getJWT_token() {
    const { services } = this.props;
    const { urls } = services;
    const apiKey = getConfig('apikeyMycruise', '');
    const userData = SessionStorage.getItem('userData');
    const { bookingRef, customer: { firstName, lastName, birthDate } } = userData;
    const url = urls.jwtTokenUrl;

    const requestData = {
      bookingRef: bookingRef,
      firstName: firstName,
      lastName: lastName,
      dateOfBirth: birthDate.replace(/-/gi, '')
    }

    FetchData(url, {
      method: 'POST',
      body: JSON.stringify(requestData),
      headers: {
        'Content-Type': 'application/json',
        'X-Source-Identity-Token-0': apiKey
      }
    })
      .then((response) => {
        if (response.status == "00") {
          const JWT__token = {
            guestId: response.data.guestId,
            userxtoken: response.data.userxtoken
          }
          this.setState({
            errorModel: false,
            JWT__token: JWT__token
          }, () => {
            this.getQuestionnaireResponse();
          })
        } else {
          this.setState({
            errorModel: true,
            errorType: "status_error"
          })
        }
      })
  }

  getQuestionnaireResponse() {
    const { services } = this.props;
    const { JWT__token, options, selectedPassenger, phaseLabel } = this.state;
    const { urls } = services;
    const apiKey = getConfig('apikeyMycruise', '');

    const url = urls.questionnaireResponseAPI;

    // const getQuestionnaireResponse = `${url}?guestId=${JWT__token.guestId}&phase=${phaseLabel}`;
    const getQuestionnaireResponse = url.replace('{guestId}', JWT__token.guestId).replace('{phase}', phaseLabel);
    
    FetchData(getQuestionnaireResponse, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Source-Identity-Token-0': apiKey,
        'userxtoken': JWT__token.userxtoken,
      }
    })
      .then(response => {
        if (response.statuscode == '00') {
          const newOptions = [];
          response.guestDetails.forEach((singleGuest) => {
            options.forEach((singleOption) => {
              const singleOptionName = `${singleOption.firstName} ${singleOption.lastName}`;
              const singleGuestName = `${singleGuest.firstName} ${singleGuest.lastName}`;
              if (singleOptionName.toLowerCase() == singleGuestName.toLowerCase()) {
                singleOption[`guestId`]=singleGuest.guestId;
                singleOption[`guestHealthQuestionStatus`]=singleGuest.guestHealthQuestionStatus;
                singleOption[`phase`]=singleGuest.phase;
                singleOption[`dateOfBirth`]=singleGuest.dateOfBirth;
                newOptions.push(singleOption);
              }
            })
          })
          let guestDetails;
          if (selectedPassenger.value !== "") {
            guestDetails = response.guestDetails.filter((singleGuestDetails) => {
              const singleGuestDetailstName = `${singleGuestDetails.firstName} ${singleGuestDetails.lastName}`
              const seclectedGuestName = selectedPassenger.title;
              if (singleGuestDetailstName.toLowerCase() == seclectedGuestName.toLowerCase()) {
                return singleGuestDetails;
              }
            });
          } else {
            guestDetails = response.guestDetails.filter((singleGuestDetails) => {
              return singleGuestDetails.guestId == JWT__token.guestId;
            });
          }

          const questionnaireResponseStatus = guestDetails != void (0) ? guestDetails[0].guestHealthQuestionStatus : this.state.questionnaireResponseStatus;
          const questions = (guestDetails != void (0)) && guestDetails[0].hasOwnProperty('healthResponseDetails') ? [...guestDetails[0].healthResponseDetails] : this.state.questions;
          questions.length && questions.map((question) => {
            if (!question.hasOwnProperty('questionResponse')) {
              question.questionResponse = '';
            }
          })
          this.setState({
            errorModel: false,
            getQuestionnaireResponse: response,
            questionnaireResponseStatus: questionnaireResponseStatus,
            questions: questions,
            options: newOptions
          }, () => {
            const { questionnaireResponseStatus, isLeadPassenger } = this.state;
            if (questionnaireResponseStatus == 'NOTCOMPLETE') {
              this.retrieveQuestions();
            }
            if (isLeadPassenger) {
              this.handlePaxConsent();
            }
          })
        } else {
          this.setState({
            errorModel: true,
            errorType: "status_error"
          })
        }
      })
  }

  retrieveQuestions() {
    const { services } = this.props;
    const { JWT__token, phaseLabel } = this.state;
    const { urls } = services;
    const apiKey = getConfig('apikeyMycruise', '');
    const header = SessionStorage.getItem('header');
    const { cruiseCode, language } = header;
    const url = urls.retrieveQuestionAPI || "/api-mc/v1/mc-healthquestionnaire/retrieve";

    // const getQuestionAPI = `${url}?voyageCode=${cruiseCode}&phase=${phaseLabel}&lang=${language.substring(0, 2)}`;
    const getQuestionAPI = url.replace('{phase}', phaseLabel).replace('{lang}', language.substring(0, 2));
    
    FetchData(`${getQuestionAPI}?voyageCode=${cruiseCode}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Source-Identity-Token-0': apiKey,
        'userxtoken': JWT__token.userxtoken,
      }
    })
      .then((response) => {
        if (response.statuscode == '00') {
          const questions = [...response.questionDetails];
          const questionSetID = response.questionSetID;
          questions.length && questions.map((question) => {
            if (!question.hasOwnProperty('questionResponse')) {
              question.questionResponse = '';
            }
          })
          this.setState({
            errorModel: false,
            questions,
            questionSetID
          })
        } else {
          this.setState({
            errorModel: true,
            errorType: "question_error"
          })
        }
      })
      .catch((error) => (console.log(error)))
  }

  loadInitialData() {
    const userData = SessionStorage.getItem('userData');
    const header = SessionStorage.getItem('header');
    const leadPassenger = SessionStorage.getItem('leadPassenger');
    const healthQuestionnaireDaysX = getConfig('healthQuestionnaireDayX', '');
    const { customer, embarkationDate, passengers } = userData;
    const { agent } = header;
    const { paxNumber } = leadPassenger;
    const passengerBirth = new Date(customer.birthDate);
    const embarkDate = new Date(embarkationDate);
    // const age = calculateAge(passengerBirth.getTime());
    const ageAtEmbark = calculateAge(
      passengerBirth.getTime(),
      embarkDate.getTime()
    );

    const isLeadPassenger = customer.paxNumber == paxNumber;

    passengers.length && passengers.map((passenger) => {
      passenger.label = `${passenger.firstName} ${passenger.lastName}`
      passenger.value = passenger.paxNumber;
    })

    const email = this.retriveSelectedUserEmail(customer.paxNumber);

    const selectedPassenger = {
      title: passengers[customer.paxNumber - 1].label,
      value: passengers[customer.paxNumber - 1].value,
    }

    this.setState({
      customerAge: ageAtEmbark,
      isLeadPassenger: isLeadPassenger,
      customerEmail: email,
      options: [...passengers],
      selectedPassenger: selectedPassenger,
      healthQuestionnaireDaysX: healthQuestionnaireDaysX
    }, () => {
      const { customerAge, dayToCruiseDeparture, healthQuestionnaireDaysX, minAdultAge } = this.state;
      if ((customerAge >= minAdultAge) && (agent == void (0)) && dayToCruiseDeparture <= healthQuestionnaireDaysX) {
        this.getJWT_token();
      }
    });
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

    this.setState({
      dayToCruiseDeparture: dayToCruiseDeparture
    }, () => {
      this.loadInitialData();
    });
  }

  renderEventCardMessage(type, cardContentData) {
    const { labels: { printDeclarationCtaLabel, quesFailedGovtWebsiteUrl, quesFailedGovtWebsiteText, quesFailedFAQLinkText, quesFailedFAQLinkUrl } } = this.props;
    const { customerEmail } = this.state;
    const isCardTypeSuccess = type === 'success';
    const isCardTypeFailure = type === 'failure';
    // const isCardTypeEarly = type === 'early';
    const datalength = typeof cardContentData.linkContent !== 'undefined';
    const quesFailedGovtWebsiteUrlData = typeof cardContentData.quesFailedGovtWebsiteUrl !== 'undefined';
    return (
      <div className={`healthQuestionnaire__${type}State`} >
        <header className={`healthQuestionnaire__${type}StateHeader`}>
          <span className={`healthQuestionnaire__${type}StateIcon`} />
          <h3 className={`healthQuestionnaire__${type}StateText`}>
            {cardContentData.title}
          </h3>
          {isCardTypeSuccess && customerEmail.length > 0 && <p className={`healthQuestionnaire__${type}StateSubtext`} dangerouslySetInnerHTML={{ __html: cardContentData.subTitle }} />}
          {!isCardTypeSuccess && <span className={`healthQuestionnaire__${type}StateSubtext`}>{`${cardContentData.subTitle} `}</span>}
          {!isCardTypeSuccess && quesFailedGovtWebsiteUrlData && <a href={quesFailedGovtWebsiteUrl} className={`cta-secondary font_size`} >{quesFailedGovtWebsiteText}</a>}
        </header>

        { isCardTypeSuccess && <div className={`healthQuestionnaire__${type}StateContent`}>
          <div className="textImage">
            <a className='cta-secondary' onClick={this.handlePrintClick} href={"#"}>{cardContentData.linkContent}</a>
          </div>
        </div>}

        {
          isCardTypeFailure && datalength && <div className={`healthQuestionnaire__${type}StateContent`}>
            <div className="textImage">
              <div className="conf-wrap">
                <div className="textImage__text">
                  <p className="textImage__par">
                    {`${cardContentData.linkContent} `}
                    <a className='cta-secondary font_size' href={quesFailedFAQLinkUrl}>{quesFailedFAQLinkText}</a>
                  </p>
                  <div style={{ marginTop: '25px' }} className="textImage">
                    <a className='cta-secondary' onClick={this.handlePrintClick} href={"#"}>{printDeclarationCtaLabel}</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
      </div >
    );
  }

  handlePrintClick() {
    const { selectedPassenger, questionnaireResponseStatus } = this.state;
    const locale = getConfig('locale', '');
    const header = SessionStorage.getItem('header');
    const { passengers, embarkationDate } = header;
    const userData = SessionStorage.getItem('userData');
    const { bookingRef, cabinNumber } = userData;
    const cruiseData = SessionStorage.getItem('cruiseData');
    const { shipName, sailingId } = cruiseData;
    const stringValue = `${locale}_${userData.bookingRef}_${
        userData.customer.firstName
    }_${userData.customer.lastName}`;
    const encodedUriString = encodeURI(window.btoa(stringValue));
    const printDeclaration = {
        status: questionnaireResponseStatus,
        paxNumber: selectedPassenger.value,
        passengers: passengers,
        embarkationDate: embarkationDate,
        bookingRef: bookingRef,
        cabinNumber: cabinNumber,
        shipName: shipName,
        sailingId: sailingId
    };
    const printDeclarationData = localStorage.getItem(
        'printDeclarationData'
    )
        ? JSON.parse(localStorage.getItem('printDeclarationData'))
        : {};
    printDeclarationData[
        `${locale}_${bookingRef}_${userData.customer.firstName}_${userData.customer.lastName}`
    ] = printDeclaration;
    localStorage.setItem(
        'printDeclarationData',
        JSON.stringify(printDeclarationData)
    );
    // SessionStorage.setItem('printDeclaration', printDeclaration);
    const pageUrl = `print-health-questionnaire-declaration?id=${encodedUriString}`;
    const link = document.createElement('a');
    link.href = pageUrl;
    link.target = '_blank';
    link.click();
  }

  renderTitle() {
    const { labels } = this.props;
    return (
      <div className={`tileH1-section`}>
        <div className="title-component">
          <div className="inner-container">
            <span className="icon-heading" />
            <h1 className="title">{labels.yourAnswersLabel}</h1>
            <p className="description">{labels.cantChangeAnswerDescLabel}</p>
          </div>
        </div>
      </div>
    );
  }

  renderOverViewQuestionnaire(question) {
    const { questionText, questionID, questionResponse } = question
    return (
      <li key={questionID} className={`qa__item overView disable`}>
        <div className="qa__body">
          <div
            className="qa__question"
          >
            {questionText}
          </div>
          <div className="qa__answer">
            {this.renderSingleCta(questionResponse)}
          </div>
        </div>
      </li>
    );
  }

  renderQuestionnaire(question) {
    const { questionText, questionID, answerOptions, questionResponse } = question
    const { labels } = this.props;
    const { firstTime } = this.state;
    const filled = firstTime || (questionResponse != void (0) && questionResponse.length > 0);
    const error__show = !filled ? 'error__show' : '';
    return (
      <li key={questionID} className="qa__item edit__mode">
        <div className={`qa__body ${error__show}`}>
          <div
            className="qa__question"
          >
            {questionText}
          </div>
          <div className="qa__answer">
            {this.renderDoubleCta(answerOptions, questionResponse, questionID)}
          </div>
        </div>
        {!filled && <div className="error__msg">
          <span>{labels.questionNotAnsweredLabel}</span>
        </div>}
      </li>
    );
  }

  renderSingleCta(value, type) {
    const { labels: { yesButtonLabel, noButtonLabel, submitQuestionnaireCtaLabel } } = this.props;
    const buttonClass = (value == 'Y' || value == 'Yes') ? 'cta-primary' : 'cta-primary-light-blue'
    return (
      <button
        className={`${buttonClass}`}
        data-clicktype={type}
        data-linktext={value}
        onClick={(e) => this.handleClickBtn(e)}
      >
        {type == 'submitButton' ? submitQuestionnaireCtaLabel : ((value == 'Y' || value == 'Yes') ? yesButtonLabel : noButtonLabel)}
      </button>
    )
  }

  handleClickBtn = button => {
    const isTravelInsuranceEnabled = getConfig('isTravelInsuranceEnabled');
    const { travelInsuranceCheckBoxChecked } = this.state;
    let travelInsuranceCheckBoxCheckedValue = isTravelInsuranceEnabled ? travelInsuranceCheckBoxChecked : true;
    if (button.target.dataset.clicktype == 'submitButton') {
      const { questions } = this.state;
      const notAnsweredQuestion = questions.filter((question) => {
        if (question.hasOwnProperty('questionResponse')) {
          return question.questionResponse.length <= 0;
        };
        return !question.hasOwnProperty('questionResponse');
      });

      notAnsweredQuestion.length > 0 && notAnsweredQuestion.map((question, index) => {
        question.indexValue = index + 1;
      })

      if (
        notAnsweredQuestion.length == 0 &&
        travelInsuranceCheckBoxCheckedValue
    ) {
        this.setState({
          showModal: true,
        })
      } else {
        const analyticsParams = {
          componentName: this.props.title,
          linkType: "o",
          linkPageName: getConfig('pageName', ''),
          validationError: this.props.labels.questionNotAnsweredLabel,
          event: "event77"
        }
        analytics.customClicks(analyticsParams);
        this.setState({
          firstTime: false,
          travelInsuranceCheckBoxUnChecked: isTravelInsuranceEnabled
              ? !travelInsuranceCheckBoxChecked
              : false
        }, () => {
          const ele = typeof document !== 'undefined' && document.getElementsByClassName('error__show');
          if (ele.length) {
            ele[0].scrollIntoView(false);
          }
        })
      }

    }
  }

  renderDoubleCta(answerOptions, questionResponse, questionID) {
    const { labels: { yesButtonLabel, noButtonLabel } } = this.props;
    const isActiveClassAvailable = typeof questionResponse === "undefined";
    const isActiveClassAvailableForYes = !isActiveClassAvailable && questionResponse == 'Yes' || questionResponse == 'Y' ? "active" : "";
    const isActiveClassAvailableForNo = !isActiveClassAvailable && questionResponse == 'No' || questionResponse == 'N' ? "active" : "";
    return (
      <div className="buttonContainer">
        <button
          className={`cta-primary-light-blue ${isActiveClassAvailableForYes}`}
          data-clicktype={`Yes`}
          data-linktext={questionID}
          onClick={this.handleAnswerClick}
        >
          {yesButtonLabel}
        </button>
        <button
          className={`cta-primary-light-blue ${isActiveClassAvailableForNo}`}
          data-clicktype={`No`}
          data-linktext={questionID}
          onClick={this.handleAnswerClick}
        >
          {noButtonLabel}
        </button>
      </div>
    )
  }

  handleAnswerClick = (key) => {
    const { questions } = this.state;
    const value = key.target.dataset.clicktype;
    const id = key.target.dataset.linktext;
    questions.length && questions.map((question) => {
      if (question.questionID == id) {
        question['questionResponse'] = value;
      }
    });
    this.setState({
      questions: [...questions]
    })
  }

  handleSelectBoxChange = (name, value, title) => {
    const email = this.retriveSelectedUserEmail(value);
    const selectedPassenger = {
      title: title,
      value: value,
    }
    const guestDetails = this.retrieveSelectedPassengerQuestionnaireResponse(selectedPassenger);
    const questionnaireResponseStatus = guestDetails != void (0) ? guestDetails[0].guestHealthQuestionStatus : this.state.questionnaireResponseStatus;
    const questions = guestDetails != void (0) && guestDetails[0].hasOwnProperty('healthResponseDetails') ? [...guestDetails[0].healthResponseDetails] : this.state.questions;
    questions.length && questions.map((question) => {
      if (!question.hasOwnProperty('questionResponse')) {
        question.questionResponse = '';
      }
    })

    const userData = SessionStorage.getItem('userData');
    const { embarkationDate } = userData;
    const passengerBirth = new Date(`${guestDetails[0].dateOfBirth.substr(0, 4)}-${guestDetails[0].dateOfBirth.substr(4, 2)}-${guestDetails[0].dateOfBirth.substr(6, 2)}`);
    const embarkDate = new Date(embarkationDate);
    const ageAtEmbark = calculateAge(
      passengerBirth.getTime(),
      embarkDate.getTime()
    );

    this.setState({
      travelInsuranceCheckBoxChecked: false,
      selectedPassenger,
      customerEmail: email,
      questionnaireResponseStatus,
      questions,
      firstTime: true,
      selectedCustomerUnderAge: ageAtEmbark > this.state.minAdultAge ? false : true
    }, () => {
      const { questionnaireResponseStatus } = this.state;
      if (questionnaireResponseStatus == 'NOTCOMPLETE') {
        this.retrieveQuestions();
      }
      this.handlePaxConsent();
    });
  }

  retrieveSelectedPassengerQuestionnaireResponse(selectedPassenger) {
    const { getQuestionnaireResponse } = this.state
    const selectedPassengerQuestionnaireRes = getQuestionnaireResponse.guestDetails && getQuestionnaireResponse.guestDetails.filter((singlePassengerResp) => {
      const passengerFullname = `${singlePassengerResp.firstName} ${singlePassengerResp.lastName}`;
      if (passengerFullname.toLowerCase() == selectedPassenger.title.toLowerCase()) {
        return singlePassengerResp;
      }
    })
    return selectedPassengerQuestionnaireRes;
  }

  retriveSelectedUserEmail(value) {
    const cruiseSummaryData = SessionStorage.getItem('cruiseSummaryData');
    const { passengers } = cruiseSummaryData;
    const newPassengerArry = passengers.filter((passenger) => {
      return passenger.seqNumber.$ == value;
    })
    const selectedPassengerEmail = newPassengerArry[0].individual.contactPoints[0].emailAddress.fullAddressText;
    return selectedPassengerEmail;
  }

  handleEmailClickCTA() {
    const url = 'before-you-sail#personalDetails';
    typeof window !== 'undefined' && window.open(url, "_self");
    typeof window !== 'undefined' && window.location.reload();
  }

  handlePaxConsent() {
    let hasHoldConsent = false;
    // const userData = SessionStorage.getItem('userData');
    const { selectedPassenger, options, selectedCustomerUnderAge } = this.state;
    let value = '';
    if (selectedPassenger.value != '') {
      const filterArr = options.filter((singleOption) => {
        if (singleOption.value == selectedPassenger.value) {
          return singleOption;
        }
      })
      value = filterArr[0].paxNumber;
    } else {
      value = options[0].paxNumber;
    }
    getPaxConcent()
      .then((response) => {
        if (response && response.leadPaxId) {
          if (response && response.leadPaxId && response.leadPaxId.length) {
            hasHoldConsent = !(response.leadPaxId.includes(JSON.stringify(parseInt(value))));
          } else {
            hasHoldConsent = true;
          }
          if (selectedCustomerUnderAge) {
            hasHoldConsent = false;
          }
          this.setState({
            errorModel: false,
            hasConsent: hasHoldConsent
          })
        }
      })
      .catch((err) => { });
  }

  renderPageContent(key) {
    let {
      labels: {
        title,
        description,
        emailConfirmationLabel,
        changeEmailAddressLabel,
        daysToCompleteLabel,
        passengersLabel,
        questionTitleForLead,
        questionTitleForNonLead,
        changeEmailAddressCtaLabel,
        emailConfirmationLabelIfEmailAddressNotPresent,
        changeEmailAddressLabelIfEmailAddressNotPresent,
        privacyNoticeLink,
        privacyNoticeLabel
      }
    } = this.props;

    const { options,
      selectedPassenger,
      customerAge,
      isLeadPassenger,
      customerEmail,
      hasConsent,
      minAdultAge
    } = this.state;

    const header = SessionStorage.getItem('header');
    const { agent } = header;

    if (customerAge < minAdultAge || agent != void (0)) {
      return null;
    }

    emailConfirmationLabel = emailConfirmationLabel && emailConfirmationLabel.length > 0 && emailConfirmationLabel.replace(/{emailAddress}/gi, customerEmail);

    return (
      <div>
        <div className="description__container">
          <div className="description__body__left">
            <p>{description}</p>
            <p className="days_to_complete" dangerouslySetInnerHTML={{ __html: daysToCompleteLabel }}></p>
            <p className="days_to_complete">
              <a target="_blank" href={privacyNoticeLink}>{privacyNoticeLabel}</a>
            </p>
          </div>
          {hasConsent && <div className="description__body__right">
            <p dangerouslySetInnerHTML={{ __html: customerEmail.length > 0 ? emailConfirmationLabel : emailConfirmationLabelIfEmailAddressNotPresent }}></p>
            <p dangerouslySetInnerHTML={{ __html: customerEmail.length > 0 ? changeEmailAddressLabel : changeEmailAddressLabelIfEmailAddressNotPresent }}></p>
            <a href={'#'} onClick={this.handleEmailClickCTA}>{changeEmailAddressCtaLabel}</a>
          </div>}
        </div>
        {/* {
          this.renderPassengerSelectField()
        } */}
        <div className={"header"}>
          <h3 dangerouslySetInnerHTML={{ __html: isLeadPassenger ? questionTitleForLead : questionTitleForNonLead }}></h3>
        </div>
        {this.renderQuestionContent(key)}
        <div className={'submitButton__container'}>
          {this.renderTravelInsContent()}
          {this.renderSingleCta('Y', 'submitButton')}
        </div>
      </div >
    )
  }

  renderQuestionContent(key) {
    const { questions } = this.state;
    if (questions.length) {
      if (key == 'editMode') {
        return (
          <ul>
            {questions.map((question) => (this.renderQuestionnaire(question)))}
          </ul>
        )
      }

      return (
        <ul>
          {questions.map((question) => (this.renderOverViewQuestionnaire(question)))}
        </ul>
      )
    }

    return null;

  }

  renderTravelInsContent() {
    const isTravelInsuranceEnabled = getConfig(
        'isTravelInsuranceEnabled',
        false
    );
	const shipCode = getConfig('shipCode');

    let {
        labels: {
            travelInsuranceConfirmationLabel,
            travelInsuranceAcknowldegementMessageLabel
        }
    } = this.props;
    const {
        travelInsuranceCheckBoxChecked,
        travelInsuranceCheckBoxUnChecked
    } = this.state;

    if (!isTravelInsuranceEnabled) {
        return null;
    }
    if(travelInsuranceAcknowldegementMessageLabel && (travelInsuranceAcknowldegementMessageLabel.indexOf('href') > -1)){
    travelInsuranceAcknowldegementMessageLabel = travelInsuranceAcknowldegementMessageLabel.replace(
      '/mycruise',
      `/mycruise/${shipCode}`
    );
  }
    return (
        <li className="travel_insurance">
            <input
                type="checkbox"
                className="input-check"
                aria-labelledby="variation2-check"
                name="checkboxInsurance"
                id="checkboxTravelInsurance"
                checked={travelInsuranceCheckBoxChecked}
                onChange={(e) => this.handleTravelInsuranceCheckbox(e)}
            />
            <label className="checkbox-label">
                <p>
                    <span className="passenger">
                        {travelInsuranceConfirmationLabel}
                    </span>
                </p>
                {travelInsuranceCheckBoxUnChecked && (
                    <div
                        className="error_msg"
                        dangerouslySetInnerHTML={{
                            __html: travelInsuranceAcknowldegementMessageLabel
                        }}
                    />
                )}
            </label>
        </li>
    );
  }

  renderTitleHeader() {
    const { labels: { title } } = this.props;
    return (
      <div className="header">
        <h3 className="title">{title}</h3>
      </div>
    )
  }

  renderCorrectCard(value) {
    const header = SessionStorage.getItem('header');
    const { agent } = header;
    const {
      labels: {
        notAvailableYetTitleLabel,
		notAvailableYetDescLabel,
        leadPassengerTitleLabel,
        leadPassengerDescLabel,
        ccaTaTitleLabel,
        ccaTaDescLabel,
        successfulQuesCompletedTitleLabel,
        successfulQuesEmailConfirmLabel,
        printDeclarationCtaLabel,
        quesFailedTitleLabel,
        quesFailedDescLabel,
        quesFailedFAQDescLabel,
        quesFailedGovtWebsiteUrl
      }
    } = this.props;
    const {
      customerAge,
      customerEmail,
      dayToCruiseDeparture,
      healthQuestionnaireDaysX,
      questionnaireResponseStatus,
      minAdultAge
    } = this.state;

    const cardContent = {
      earlyCardContent: {
        title: notAvailableYetTitleLabel,
        subTitle: notAvailableYetDescLabel
      },
      underAgeCardContent: {
        title: leadPassengerTitleLabel,
        subTitle: leadPassengerDescLabel
      },
      TA_CCACardContent: {
        title: ccaTaTitleLabel,
        subTitle: ccaTaDescLabel
      },
      successCardContent: {
        title: successfulQuesCompletedTitleLabel,
        subTitle: successfulQuesEmailConfirmLabel && successfulQuesEmailConfirmLabel.length > 0 && successfulQuesEmailConfirmLabel.replace(/{emailAddress}/gi, customerEmail) || '',
        linkContent: printDeclarationCtaLabel
      },
      failureCardContent: {
        title: quesFailedTitleLabel,
        subTitle: quesFailedDescLabel,
        linkContent: quesFailedFAQDescLabel,
        quesFailedGovtWebsiteUrl: quesFailedGovtWebsiteUrl
      }
    }
    if (value != void (0) && value == 'checkStatus') {
      if (questionnaireResponseStatus == 'PASS') {
        const cardContentData = cardContent['successCardContent'];
        return this.renderEventCardMessage('success', cardContentData);
      } else if (questionnaireResponseStatus == 'FAIL') {
        const cardContentData = cardContent['failureCardContent'];
        return this.renderEventCardMessage('failure', cardContentData);
      }
    } else if (agent != void (0)) {
      const cardContentData = cardContent['TA_CCACardContent'];
      return this.renderEventCardMessage('underAge', cardContentData);
    } else if (customerAge < minAdultAge) {
      const cardContentData = cardContent['underAgeCardContent'];
      return this.renderEventCardMessage('underAge', cardContentData);
    } else if (dayToCruiseDeparture > healthQuestionnaireDaysX) {
      const cardContentData = cardContent['earlyCardContent'];
      return this.renderEventCardMessage('early', cardContentData);
    } else {
      return null;
    }
  }

  renderHrContent() {
    const { labels: { questionLabel, answerLabel } } = this.props;
    return (
      <div>
        <div className="que_ans_label_container">
          <div className="que_label_container">
            {questionLabel}
          </div>
          <div className="ans_label_container">
            {answerLabel}
          </div>
        </div>
        <hr />
      </div>
    )
  }

  renderPassengerSelectField(key = '') {
    const {
      labels: {
        passengersLabel
      }
    } = this.props;
    const {
      selectedPassenger, options, isLeadPassenger, dayToCruiseDeparture, healthQuestionnaireDaysX
    } = this.state;
    return (
      isLeadPassenger && dayToCruiseDeparture <= healthQuestionnaireDaysX ? <div className={`passengerSelectFieldContainer${key}`}>
        <p>{passengersLabel}</p>
        <SelectField
          selectClassName="select-passengerName"
          name="passengerName"
          showLabel={false}
          label={'Select passenger'}
          disableValidation={true}
          value={selectedPassenger.value}
          title={selectedPassenger.title}
          options={options}
          errorMsg="error"
          disableDefaultOption={true}
          changeCallback={this.handleSelectBoxChange}
        />
      </div> : null
    )
  }

  handleModalExpired = () => {
    const analyticsParams = {
      componentName: this.props.title,
      linkType: "o",
      linkText: `${this.props.labels.warningModalCancelLabel}`,
      linkPageName: getConfig('pageName', '')
    };
    analytics.customClicks(analyticsParams);

    this.setState({
      showModal: false,
      confirmSubmitBtnEnabled: false
    });
  };

  handleCheckbox = (e) => {
    this.setState({
      confirmSubmitBtnEnabled: e.target.checked
    })
  }

  handleTravelInsuranceCheckbox = (e) => {
    this.setState({
        travelInsuranceCheckBoxChecked: e.target.checked,
        travelInsuranceCheckBoxUnChecked: false
    });
  };

  handleModalConfirmBtn = () => {
    const { questions, JWT__token, questionSetID, options, selectedPassenger, isLeadPassenger, minAdultAge, customerEmail, phaseLabel } = this.state;
    const { services: { urls } } = this.props;
    const userData = SessionStorage.getItem('userData');
    const { embarkationDate, bookingRef, cabinNumber, cruiseCode, customer } = userData;
    const cruiseData = SessionStorage.getItem('cruiseData');
    const { shipName } = cruiseData;
    const postGuestDetails = [];
    const modifiedQuestions = questions.map((singleQuestion) => {
      delete singleQuestion['questionText'];
      delete singleQuestion['answerOptions'];
      delete singleQuestion['indexValue'];
      delete singleQuestion['response'];
      return singleQuestion;
    })
    if (isLeadPassenger && options.length) {
      options.map((singleOption) => {
        const passengerBirth = new Date(singleOption.birthDate);
        const embarkDate = new Date(embarkationDate);
        const ageAtEmbark = calculateAge(
          passengerBirth.getTime(),
          embarkDate.getTime()
        );
        if ((ageAtEmbark < minAdultAge) && (selectedPassenger.value == '1') && (singleOption.guestId !== JWT__token.guestId)) {
          const singlePersonRes = {
            guestId: singleOption.guestId,
            questionSetID: questionSetID,
            title: singleOption.title,
            firstname: singleOption.firstName,
            lastname: singleOption.lastName,
            healthQuestionDetails: [...modifiedQuestions]
          }
          postGuestDetails.push(singlePersonRes);
        } else if (selectedPassenger.value == singleOption.value) {
          const singlePersonRes = {
            guestId: singleOption.guestId,
            questionSetID: questionSetID,
            title: singleOption.title,
            firstname: singleOption.firstName,
            lastname: singleOption.lastName,
            healthQuestionDetails: [...modifiedQuestions]
          }
          postGuestDetails.push(singlePersonRes);
        }
      })
    } else {
      const singlePersonRes = {
        guestId: JWT__token.guestId,
        questionSetID: questionSetID,
        title: customer.title,
        firstname: customer.firstName,
        lastname: customer.lastName,
        healthQuestionDetails: [...modifiedQuestions]
      }
      postGuestDetails.push(singlePersonRes);
    }

    const analyticsParams = {
      componentName: this.props.title,
      linkType: "o",
      linkText: `${this.props.labels.warningModalConfirmLabel}`,
      linkPageName: getConfig('pageName', '')
    };
    analytics.customClicks(analyticsParams);

    const cruiseEmbarkationDate = moment(
      embarkationDate,
      'YYYY-MM-DD'
    ).format('DDMMYYYY');

    const postData = {
      guestDetails: postGuestDetails,
      emailDetails: {
        bookingno: bookingRef,
        cabin: cabinNumber,
        shipName: shipName,
        embarkationdate: cruiseEmbarkationDate,
        cruiseCode: cruiseCode,
        brand: getConfig('brand', '').toUpperCase() == 'PO' ? getConfig('brand', '').toUpperCase() : 'CU',
        locale: getConfig('locale', '').toLocaleLowerCase() == 'de_de' ? 'de' : getConfig('locale', '')
      },
    }

    if (isLeadPassenger) {
      postData.emailDetails.guestId = JWT__token.guestId
    }

    if (customerEmail.length) {
      postData.emailDetails.emailAddress = customerEmail
    }

    const apiKey = getConfig('apikeyMycruise', '');

    const postAnswerUrl = urls.postAnswerApi || '/api-mc/v1/mc-healthquestionnaire/amend';

    // const postAnswer = `${postAnswerUrl}?guestId=${JWT__token.guestId}&phase=${phaseLabel}&userxtoken=${JWT__token.userxtoken}&X-Source-Identity-Token-0=${apiKey}`;
    const postAnswerApi = postAnswerUrl.replace('{guestId}', JWT__token.guestId).replace('{phase}', phaseLabel); // code is changed re-garding new API implementation.

    FetchData(postAnswerApi, {
      method: 'POST',
      body: JSON.stringify(postData),
      headers: {
        'Content-Type': 'application/json',
        'X-Source-Identity-Token-0': apiKey,
        'userxtoken': JWT__token.userxtoken
      }
    })
      .then((response) => {
        if (response.statuscode == "00") {
          this.getQuestionnaireResponse();
          this.setState({
            errorModel: false,
            showModal: false,
            confirmSubmitBtnEnabled: false
          }, () => {
            window.scrollTo(0, 0);
          })
        } else {
          this.setState({
            errorModel: true,
            errorType: "submission_error"
          })
        }
      })
  }

  renderCardAccToConsent() {
    const { selectedCustomerUnderAge } = this.state;
    const { labels: {
      paxConsentLabel,
      leadPassengerTitleLabel,
      leadPassengerDescLabel
    } } = this.props;
    const cardContentDataForConsent = {
      title: paxConsentLabel,
      subTitle: "",
    }
    const underAgeCardContent = {
      title: leadPassengerTitleLabel,
      subTitle: leadPassengerDescLabel
    }

    if (selectedCustomerUnderAge) {
      return this.renderEventCardMessage('underAge', underAgeCardContent)
    } else {
      return this.renderEventCardMessage('failure', cardContentDataForConsent)
    }



  }

  render() {
    const {
      labels: {
        // healthQuestionnaireDaysX,
        errorPreventHealthDeclStatusDisplayMsgLabel,
        modelWariningMsg,
        warningModalConfirmLabel,
        warningModalCancelLabel,
        warningModalTitleLabel,
        warningModalCheckboxLabel,
        errorPreventHealthDeclStatusDisplayMsgSubtitleLabel,
        paxConsentLabel,
        errorPreventHealthDeclSubmissionMsgLabel,
        errorPreventHealthDeclSubmissionMsgSubtitleLabel,
        errorPreventQuestionsDisplayMsgLabel,
        errorPreventQuestionsDisplayMsgSubtitleLabel
      }
    } = this.props;
    const {
      dayToCruiseDeparture,
      questionnaireResponseStatus,
      healthQuestionnaireDaysX,
      showModal,
      errorModel,
      confirmSubmitBtnEnabled,
      hasConsent,
      errorType
    } = this.state;

    const disabledValue = !confirmSubmitBtnEnabled ? 'disabled' : '';

    const cardContentDataForConsent = {
      title: paxConsentLabel,
      subTitle: "",
    }

    if (errorModel) {
      const cardContentData = {
        title: '',
        subTitle: '',
      }
      if (errorType == 'status_error') {
        cardContentData.title = errorPreventHealthDeclStatusDisplayMsgLabel;
        cardContentData.subTitle = errorPreventHealthDeclStatusDisplayMsgSubtitleLabel;
      } else if (errorType == 'submission_error') {
        cardContentData.title = errorPreventHealthDeclSubmissionMsgLabel;
        cardContentData.subTitle = errorPreventHealthDeclSubmissionMsgSubtitleLabel;
      } else if (errorType == 'question_error') {
        cardContentData.title = errorPreventQuestionsDisplayMsgLabel;
        cardContentData.subTitle = errorPreventQuestionsDisplayMsgSubtitleLabel;
      }
      return (
        <div className="show-texture healthQuestionnaire">
          {this.renderEventCardMessage('failure', cardContentData)}
        </div>
      )
    }

    return (
      <div className="show-texture healthQuestionnaire">
        {this.renderPassengerSelectField('outSideFromContainer')}
        {this.renderTitleHeader()}
        {this.renderCorrectCard()}
        {dayToCruiseDeparture <= healthQuestionnaireDaysX ? hasConsent ? questionnaireResponseStatus == 'NOTCOMPLETE' && this.renderPageContent('editMode') : this.renderCardAccToConsent() : null}
        {questionnaireResponseStatus !== 'NOTCOMPLETE' && hasConsent && this.renderCorrectCard('checkStatus')}
        {questionnaireResponseStatus !== 'NOTCOMPLETE' && hasConsent && this.renderTitle()}
        {questionnaireResponseStatus !== 'NOTCOMPLETE' && hasConsent && this.renderHrContent()}
        {questionnaireResponseStatus !== 'NOTCOMPLETE' && hasConsent && this.renderQuestionContent()}
        {showModal && <Modal
          mounted={showModal}
          onExit={() => this.handleModalExpired(false)}
          contentLabel="warningModal"
          ctaType={'close'}
          underlayClass="warningModal"
        >
          <div className="model_body">
            <div className='icon__container'><span className="icon-heading" /></div>
            <h2>{warningModalTitleLabel}</h2>
            <p>
              {modelWariningMsg}
            </p>
            <li
              className="wrap"
            >
              <div style={{ marginLeft: 'auto', marginRight: 'auto' }}>
                <input
                  type="checkbox"
                  className="input-check"
                  aria-labelledby="variation2-check"
                  name="checkboxTerm"
                  id={`checkbox`}
                  checked={confirmSubmitBtnEnabled}
                  onChange={(e) => this.handleCheckbox(e)}
                />
                <label className="checkbox-label">
                  <h5>
                    <span className="passenger">
                      {warningModalCheckboxLabel}
                    </span>
                  </h5>
                </label>
              </div>
            </li>
          </div>

          <div className="modal-btns">
            <button
              className="cta-button-outline"
              onClick={this.handleModalExpired}
            >
              {warningModalCancelLabel}
            </button>
            <button
              className={`cta-primary ${disabledValue}`}
              onClick={() => this.handleModalConfirmBtn()}
            >
              {warningModalConfirmLabel}
            </button>
          </div>
        </Modal>}
      </div>
    );
  }
}

export default healthQuestionnaire;
