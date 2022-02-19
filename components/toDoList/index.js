'use strict';

import React from 'react';
import {
    getConfig,
    getToDoList,
    updateToDoList
} from '../commons/CUK/utilities';
import SessionStorage from '../commons/CUK/session-storage';
import {
    checkIfPrintIsAvailable,
    printEticketWithoutMicroservices,
    printLuggageLabel
} from '../commons/CUK/printUtilities';
// import './styles/index.css';
import {
    VIEWPORT_TYPE,
    watchForBreakpoint
} from '../../library/js/config/breakpoints';
import analytics from '../commons/CUK/analytics';
import { checkCookie, getCookie } from '../commons/CUK/cookies';

class toDoList extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            showList: false
        };
        this.toggleAccordion = this.toggleAccordion.bind(this);
    }

    componentDidMount() {
        const mqlLVP = watchForBreakpoint(VIEWPORT_TYPE.DESKTOP);

        this.handleResize(mqlLVP);
        mqlLVP.addListener((mql) => {
            this.handleResize(mql);
        });

        this.getData();
    }

    getData() {
        const { services } = this.props;
        const { toDoListApi } = services.urls;
        getToDoList(toDoListApi)
            .then(this.interpolateData)
            .catch(this.handleApiError);
    }

    interpolateData = (response) => {
        const { cruise } = response;
        const { passengers } = cruise;
        const checkListObj = passengers.reduce(this.reducePassengers, {});
        this.setState(() => ({
            checkList: checkListObj,
            eTicketsAvailable: checkIfPrintIsAvailable('eTicket'),
            luggageLabelAvailable: checkIfPrintIsAvailable('luggageLabel')
        }));
    };
    reducePassengers = (checkListObj, passenger) => {
        const { checklist } = passenger;
        Object.entries(checklist).reduce(this.reduceSteps, checkListObj);
        return checkListObj;
    };
    reduceSteps = (checkListObj, [key, val]) => {
        if (!checkListObj[key]) {
            checkListObj[key] = val;
        } else {
            if (
                (key === 'personalInformation' ||
                    key === 'travelDocument' ||
                    key === 'travelInsurance' ||
                    key === 'emergencyContact') &&
                val === ''
            ) {
                checkListObj[key] = val;
            }
        }
        return checkListObj;
    };
    handleApiError = (error) => {
        // console.log(error);
    };

    handleResize(mql) {
        this.setState(() => ({
            showList:
                watchForBreakpoint(VIEWPORT_TYPE.DESKTOP).matches ||
                watchForBreakpoint(VIEWPORT_TYPE.TABLET).matches ||
                watchForBreakpoint(VIEWPORT_TYPE.TABLET_L).matches
        }));
    }
    toggleAccordion() {
        analytics.clickTracking(this);
        this.setState((prevState) => ({
            showList:
                !watchForBreakpoint(VIEWPORT_TYPE.DESKTOP).matches ||
                !watchForBreakpoint(VIEWPORT_TYPE.TABLET).matches ||
                !watchForBreakpoint(VIEWPORT_TYPE.TABLET_L).matches
                    ? !prevState.showList
                    : prevState.showList
        }));
    }

    taskClickHandler = (e) => {
        analytics.clickTracking(this)
        const { id } = e.currentTarget;
        let beforeYouSailUrl = getConfig('beforeYouSailUrl', '');
        const shipUrl = getConfig('shipCode', '');
        beforeYouSailUrl = beforeYouSailUrl.replace('{shipCode}', shipUrl);

        const { services } = this.props;
        const { toDoListApi } = services.urls;
        const userData = SessionStorage.getItem('userData');
        const { paxNumber } = userData.customer;

        switch (id) {
            case 'personalInformation':
                window.location.href = `${beforeYouSailUrl}#personalDetails`;
                break;
            case 'vaccinationCheck':
                window.location.href = `${beforeYouSailUrl}#importantToKnow`;
                break;
            case 'visaInfoCheck':
                window.location.href = `${beforeYouSailUrl}#importantToKnow`;
                break;
            case 'e-ticket':
                updateToDoList(toDoListApi, id, paxNumber).then(() => {
                    const locale = getConfig('locale', '');
                    const userData = SessionStorage.getItem('userData');
                    const valueFromAEMeTicketSwitch = getConfig('isETicketMicroServiceEnabled');
                    const isCookieExistForMicroServicesEticket = checkCookie('microservicesEticket');
                    const valueOfMicroServicesEticketAPIcall = isCookieExistForMicroServicesEticket && getCookie('microservicesEticket');
                    if (valueFromAEMeTicketSwitch || (isCookieExistForMicroServicesEticket && valueOfMicroServicesEticketAPIcall == 'true')) {
                        const stringValue = `${locale}_${userData.bookingRef}_${
                            userData.customer.firstName
                        }_${userData.customer.lastName}`;
                        const encodedUriString = encodeURI(window.btoa(stringValue));
                        let url = `eticketpdfpage?id=${encodedUriString}`;
                        const eTicketPdfPageUrl = '';
                        // let url = `eticketpdfpage`;
                        if (eTicketPdfPageUrl.length) {
                            const pageUrl = eTicketPdfPageUrl.split('/');
                            url = pageUrl[pageUrl.length - 1];
                        }
                        const link = typeof document !== 'undefined' && document.createElement('a');
                        link.href = url;
                        link.target = '_blank';
                        link.click();
                    } else {
                        printEticketWithoutMicroservices()
                    }
                })
                    .catch((err) => { });
                break;
            case 'luggageLabel':
                updateToDoList(toDoListApi, id, paxNumber).then(() => {
                    const locale = getConfig('locale', '');
                    const userData = SessionStorage.getItem('userData');
                    const valueFromAEMluggageLabelSwitch = getConfig('isLuggagelabelMicroServiceEnabled');
                    const isCookieExistForMicroServicesLuggageLabel = checkCookie('microservicesLuggageLabel');
                    const valueOfMicroServicesLuggageLabelAPIcall = isCookieExistForMicroServicesLuggageLabel && getCookie('microservicesLuggageLabel');
                    if (valueFromAEMluggageLabelSwitch || (isCookieExistForMicroServicesLuggageLabel && valueOfMicroServicesLuggageLabelAPIcall == 'true')) {
                        const luggageLabelPdfPageUrl = '';
                        // let url = `luggagelabelpdfpage`;
                        const stringValue = `${locale}_${userData.bookingRef}_${
                            userData.customer.firstName
                        }_${userData.customer.lastName}`;
                        const encodedUriString = encodeURI(
                            window.btoa(stringValue)
                        );
                        let url = `luggagelabelpdfpage?id=${encodedUriString}`;
                        if (luggageLabelPdfPageUrl.length) {
                            const pageUrl = luggageLabelPdfPageUrl.split('/');
                            url = pageUrl[pageUrl.length - 1];
                        }
                        const link = typeof document !== 'undefined' && document.createElement('a');
                        link.href = url;
                        link.target = '_blank';
                        link.click();
                    } else {
                        printLuggageLabel()
                    }
                });
                break;
        }
    };

    renderChecklistItem = (listItem, index) => {
        const {
            checkList,
            eTicketsAvailable,
            luggageLabelAvailable
        } = this.state;
        const luggageLabelData = SessionStorage.getItem('luggageLabelData');
        const checkForflagPersonalDetail = SessionStorage.getItem('checkForflagPersonalDetail');
        const checkForflagTravelDocDetail = SessionStorage.getItem('checkForflagTravelDocDetail');
        const cabinInfoCheck = luggageLabelData ? (luggageLabelData.itineraryBookingCabinLuggageDoor !== '' && luggageLabelData.cabinsDeckNumber !== '' && luggageLabelData.cabinsNumber !== '') ? true : false : false;
        const checkEticketFlagAndLuggageLable = cabinInfoCheck && checkForflagPersonalDetail && checkForflagTravelDocDetail;
        const isDone =
            listItem.code === 'personalInformation'
                ? checkForflagPersonalDetail &&
                checkForflagTravelDocDetail
                : checkList[listItem.code] !== '';

        
                let isAvailable = true;

                if(listItem.code === 'e-ticket') {
                isAvailable = (eTicketsAvailable  && checkEticketFlagAndLuggageLable);
                }

                if(listItem.code === 'luggageLabel') {
                isAvailable = (luggageLabelAvailable && checkEticketFlagAndLuggageLable);
                }

        return (
            <li
                key={index}
                id={listItem.code}
                className={`${isDone ? 'active' : ''} ${
                    isAvailable ? 'available' : 'notAvailable'
                }  toDoList__listItem `}
                onClick={isAvailable ? this.taskClickHandler : ''}
            >
                {listItem.name}
            </li>
        );
    };
    render() {
        const { title, desc, list, labels } = this.props;
        const { checkList, showList } = this.state;
        const toBeCompleted = checkList
            ? Object.values(checkList).filter((value) => value === '')
            : [];
        return checkList ? (
            <div className={`toDoList__cont ${showList ? 'show' : 'hide'}`}>
                <h1 className="toDoList__title" onClick={this.toggleAccordion}>
                    {title}
                </h1>
                <p>{desc}</p>
                {toBeCompleted.length > 0 && (
                    <div className="toDoList__alert">
                        <span className="toDoList__alertMsg">
                            {labels.toBeCompletedLabel}
                        </span>
                    </div>
                )}
                <ul className="toDoList__list">
                    {list.map(this.renderChecklistItem)}
                </ul>
            </div>
        ) : null;
    }
}

export default toDoList;
