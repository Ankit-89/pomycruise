/*
 * Utilities Module
 *
 */
'use strict';

import moment from 'moment';
import { getConfig, getPaxConcent } from '../utilities';
import SessionStorage from '../session-storage';
import FetchData from '../fetch-data';

const checkIfPrintIsAvailable = (type) => {
    const header = SessionStorage.getItem('header');
    const { embarkationDate } = header;
    /////   ***************** this is for the matching the case cruise to depature ****************** ///////
    const dayOfCruiseDeparture = new Date(
        moment(embarkationDate, 'YYYY-MM-DD').format('ll')
    );
    const today = new Date();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayToCruiseDeparture = Math.ceil(
        (dayOfCruiseDeparture.getTime() - today.getTime()) / oneDay
    );
    /////   ***************** //// ****************** ///////
    const xDays = getConfig(
        type === 'eTicket' ? 'eTicketDayX' : 'luggageLabelDayX',
        0
    );
    const diffDays = +xDays - dayToCruiseDeparture;
    return diffDays >= 0;
};

const callForEticketMicroServiceServlet = () => {
    const apikeyMycruise = getConfig('apikeyMycruise', '');
    const locale = getConfig('locale', '');
    const eticketurldataencryptionapi = getConfig('eticketurldataencryptionapi') || '/content/po/master_website/en_GB/mycruise.eticketurldataencryptionapi.json';
    const header = SessionStorage.getItem('header');
    const { bookingRef, brandCode, customer, passengers } = header;
    const leadPassenger = SessionStorage.getItem('leadPassenger');
    const { paxNumber } = leadPassenger;
    const cruiseSummary = SessionStorage.getItem('cruiseSummaryData') || {};
    const loyaltyData = SessionStorage.getItem('loyaltyData') || {};
    const showFlight = SessionStorage.getItem('showFlight') || false;
    const flagShowFlightMessage = SessionStorage.getItem('flagShowFlightMessage') || 0;
    const env = getConfig('microServiceApiParamEnvironment');
    let paxConsent = '';
    const stringToEncrypt = {
        cs: cruiseSummary,
        la: loyaltyData,
        env: env,
        brand: brandCode,
        firstName: customer.firstName,
        lastName: customer.lastName,
        showFlight: showFlight && (flagShowFlightMessage > 7),
        paxConsent: paxConsent,
    }

    getPaxConcent()
        .then((response) => {
            if (customer && customer.PaxNumber && customer.PaxNumber === paxNumber) {
                if (response && response.leadPaxId && response.leadPaxId.length) {
                    for (var i = 0; i < response.leadPaxId.length; i++) {
                        if (!i) {
                            paxConsent = response.leadPaxId[i];
                        } else {
                            paxConsent = paxConsent + "," + response.leadPaxId[i];
                        }
                    }
                }
                stringToEncrypt.paxConsent = paxConsent;
            } else {
                if (passengers && passengers.length) {
                    for (var i = 0; i < passengers.length; i++) {
                        if (passengers[i].paxNumber !== customer.PaxNumber) {
                            if (!i) {
                                paxConsent = passengers[i].paxNumber;
                            } else {
                                paxConsent = paxConsent + "," + passengers[i].paxNumber;
                            }
                        }
                    }
                }
                stringToEncrypt.paxConsent = paxConsent;
            }

            const postData = {
                stringToEncrypt: JSON.stringify(stringToEncrypt)
            }

            FetchData(eticketurldataencryptionapi, {
                method: 'POST',
                body: JSON.stringify(postData),
                headers: {
                    'X-Source-Identity-Token-0': apikeyMycruise,
                    'Content-type': 'Application/json'
                }
            })
                .then((response) => {
                    if (response.encryptedString) {
                        const encryptedDataForETicket = localStorage.getItem(
                            'encryptedDataForETicket'
                        )
                            ? JSON.parse(
                                localStorage.getItem(
                                    'encryptedDataForETicket'
                                )
                            )
                            : {};
                        encryptedDataForETicket[`${locale}_${bookingRef}_${customer.firstName}_${customer.lastName}`] = response.encryptedString;
                        localStorage.setItem('encryptedDataForETicket', JSON.stringify(encryptedDataForETicket));
                    }
                    if (!response.encryptedString) {
                        console.log('response', response);
                    }
                })
                .catch((err) => { });
        })
        .catch((err) => { });
}

const printEticketWithoutMicroservices = () => {
    const apikeyMycruise = getConfig('apikeyMycruise', '');
    const eticketServletUrl = getConfig('eticketServletUrl', '');
    const leadPassenger = SessionStorage.getItem('leadPassenger');
    const { paxNumber } = leadPassenger;
    const header = SessionStorage.getItem('header');
    const { bookingRef, brandCode, shipCode, embarkationPort, customer, passengers } = header;
    const { firstName, lastName } = customer
    const countryCodeData = SessionStorage.getItem('countryCodeData');
    const { countryCode } = countryCodeData;
    const luggageLabelData = SessionStorage.getItem('luggageLabelData');
    let { cabinsDeckName } = luggageLabelData;
    cabinsDeckName = cabinsDeckName.substring(0, 1);
    const brand = getConfig('brand', '') === 'po' ? 'POC' : 'CUN';
    const getEmbarkationTime = `${window.location.origin}/api-mc/v1/mc-getEmbarkationArrivalTime/retrieve?brand=${brandCode}&shipCode=${shipCode}&deck=${cabinsDeckName}&embarkationPort=${embarkationPort}`;

    FetchData(getEmbarkationTime, {
        method: 'GET',
        headers: {
            'x-source-identity-token-0': apikeyMycruise
        }
    }).then((response) => {
        if ((response !== undefined || response !== "") && response.embarkationArrivalTime && response.embarkationArrivalTime.trim() !== '') {
            let paxConsentList = '';
            const embarkTime = response.embarkationArrivalTime;
            let url = `${eticketServletUrl}?shipCode=${brand}&firstName=${firstName}&lastName=${lastName}&bookingRef=${bookingRef}&countryCode=${countryCode}&embarkTime=${embarkTime}`;

            getPaxConcent()
                .then((response) => {
                    if (customer && customer.PaxNumber && customer.PaxNumber === paxNumber) {
                        if (response && response.leadPaxId && response.leadPaxId.length) {
                            for (var i = 0; i < response.leadPaxId.length; i++) {
                                if (!i) {
                                    paxConsentList = response.leadPaxId[i];
                                } else {
                                    paxConsentList = paxConsentList + "," + response.leadPaxId[i];
                                }
                            }
                        }
                        url = url + `&paxConsentList=${paxConsentList}`;
                    } else {
                        if (passengers && passengers.length) {
                            for (var i = 0; i < passengers.length; i++) {
                                if (passengers[i].paxNumber !== customer.PaxNumber) {
                                    if (!i) {
                                        paxConsentList = passengers[i].paxNumber;
                                    } else {
                                        paxConsentList = paxConsentList + "," + passengers[i].paxNumber;
                                    }
                                }
                            }
                        }
                        url = url + `&paxConsentList=${paxConsentList}`;
                    }
                    window.open(url, '_blank');
                })
                .catch((err) => { });
        } else {
            const msg = response && response.message && response.message.trim() !== '' ? response.message : "Embarkation Time is Blank."
            alert(msg);
        }
    })
        .catch((err) => { });
};

const printEticket = () => {
    const eticketServletUrl = getConfig('eTicketMicroServiceUrl', '');
    const apiKey = getConfig('apikeyMycruise', '');
    const encryptedDataForETicket = SessionStorage.getItem('encryptedDataForETicket') || '';
    const postData = {
        "data": encryptedDataForETicket
    }
    fetch(eticketServletUrl, {
        method: 'POST',
        body: JSON.stringify(postData),
        headers: {
            'Content-Type': 'application/json',
            'X-Source-Identity-Token-0': apiKey
        }
    })
        .then(res => res.blob())
        .then(showFile)
        .catch((err) => { });


};

const callForLuggageLabelMicroServiceServlet = () => {
    const locale = getConfig('locale');
    const apiKey = getConfig('apikeyMycruise', '');
    const eticketurldataencryptionapi = getConfig('eticketurldataencryptionapi') || '/content/po/master_website/en_GB/mycruise.eticketurldataencryptionapi.json';
    const userData = SessionStorage.getItem('userData');
    const cruiseSummaryData = SessionStorage.getItem('cruiseSummaryData');
    const leadPassenger = SessionStorage.getItem('leadPassenger');
    const { paxNumber } = leadPassenger;
    const luggageLabelData = SessionStorage.getItem('luggageLabelData');
    const brandCode = getConfig('brand', '') === 'po' ? 'PO' : 'CUN';
    const env = getConfig('microServiceApiParamEnvironment');
    const { passengers } = cruiseSummaryData;
    const newPassengers = [];
    let paxConsentList = '';

    passengers.map((passenger) => {
        const phoneNumber = passenger.individual.contactPoints[0].phoneNumber ? passenger.individual.contactPoints[0].phoneNumber.numberText : '';
        const obj = {
            title: passenger.individual.individualName.titleCode.$,
            firstName: passenger.individual.individualName.firstNameText,
            lastName: passenger.individual.individualName.familyNameText,
            paxNumber: passenger.seqNumber.$,
            age: passenger.individual.ageQuantity.$,
            phoneNumber: phoneNumber
        }
        newPassengers.push(obj);
    })

    const {
        bookingRef,
        embarkationDate,
        embarkationCode,
        disembarkationDate,
        shipCode,
        cruiseCode,
        disembarkationCodeForLuggageLabel,
        customer
    } = userData;

    const {
        shipName,
        cabinsNumber,
        cabinsDeckName,
        cabinsDeckNumber,
        cabinsCabinLocationsTypeCode,
        cabinsCabinLocationsDesc,
        itineraryBookingCabinNumber,
        itineraryBookingCabinType,
        itineraryBookingCabinPosition,
        itineraryBookingCabinLuggageDoor
    } = luggageLabelData;

    const stringToEncrypt = {
        shipName: shipName,
        shipCode: shipCode,
        cruiseCode: cruiseCode,
        bookingRef: bookingRef,
        embarkDate: embarkationDate,
        embarkationPort: embarkationCode,
        disembarkDate: disembarkationDate,
        disembarkationPort: disembarkationCodeForLuggageLabel,
        cabinsNumber: cabinsNumber,
        cabinsDeckName: cabinsDeckName,
        cabinsDeckNumber: cabinsDeckNumber,
        cabinsCabinLocationsTypeCode: cabinsCabinLocationsTypeCode,
        cabinsCabinLocationsDesc: cabinsCabinLocationsDesc,
        itineraryBookingCabinNumber: itineraryBookingCabinNumber,
        itineraryBookingCabinType: itineraryBookingCabinType,
        itineraryBookingCabinPosition: itineraryBookingCabinPosition,
        itineraryBookingCabinLuggageDoor: itineraryBookingCabinLuggageDoor,
        brandCode: brandCode,
        leadPassengerNumber: customer.paxNumber,
        paxConsent: paxConsentList,
        env: env,
        passengers: newPassengers
    }

    getPaxConcent()
        .then((response) => {
            if (customer && customer.PaxNumber && customer.PaxNumber === paxNumber) {
                if (response && response.leadPaxId && response.leadPaxId.length) {
                    for (var i = 0; i < response.leadPaxId.length; i++) {
                        if (!i) {
                            paxConsentList = response.leadPaxId[i];
                        } else {
                            paxConsentList = paxConsentList + "," + response.leadPaxId[i];
                        }
                    }
                }
                stringToEncrypt.paxConsent = paxConsentList;
            } else {
                if (passengers && passengers.length) {
                    for (var i = 0; i < passengers.length; i++) {
                        if (passengers[i].paxNumber !== customer.PaxNumber) {
                            if (!i) {
                                paxConsentList = passengers[i].paxNumber;
                            } else {
                                paxConsentList = paxConsentList + "," + passengers[i].paxNumber;
                            }
                        }
                    }
                }
                stringToEncrypt.paxConsent = paxConsentList;
            }

            const postData = {
                stringToEncrypt: JSON.stringify(stringToEncrypt)
            }

            FetchData(eticketurldataencryptionapi, {
                method: 'POST',
                body: JSON.stringify(postData),
                headers: {
                    'X-Source-Identity-Token-0': apiKey,
                    'Content-type': 'Application/json'
                }
            })
                .then((response) => {
                    if (response.encryptedString) {
                        const encryptedDataForLuggageLabel = localStorage.getItem(
                            'encryptedDataForLuggageLabel'
                        )
                            ? JSON.parse(
                                  localStorage.getItem(
                                      'encryptedDataForLuggageLabel'
                                  )
                              )
                            : {};
                        encryptedDataForLuggageLabel[
                            `${locale}_${bookingRef}_${customer.firstName}_${
                                customer.lastName
                            }`
                        ] =
                            response.encryptedString;
                        localStorage.setItem(
                            'encryptedDataForLuggageLabel',
                            JSON.stringify(encryptedDataForLuggageLabel)
                        );
                    }
                    if (!response.encryptedString) {
                        console.log('response', response);
                    }
                })
                .catch((err) => { });
        })
        .catch((err) => { });
};

const generateLuggageLabel = () => {
    const eticketServletUrl = getConfig('eTicketMicroServiceUrl', '');
    const apiKey = getConfig('apikeyMycruise', '');
    const encryptedDataForLuggageLabel = SessionStorage.getItem('encryptedDataForLuggageLabel') || '';
    const postData = {
        "data": encryptedDataForLuggageLabel
    }
    fetch(eticketServletUrl, {
        method: 'POST',
        body: JSON.stringify(postData),
        headers: {
            'Content-Type': 'application/json',
            'X-Source-Identity-Token-0': apiKey
        }
    })
        .then(res => res.blob())
        .then(showFile)
        .catch((err) => { });
}

const showFile = (blob) => {
    // It is necessary to create a new blob object with mime-type explicitly set
    // otherwise only Chrome works like it should
    var newBlob = new Blob([blob], { type: "application/pdf" })

    // IE doesn't allow using a blob object directly as link href
    // instead it is necessary to use msSaveOrOpenBlob
    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(newBlob);
        return;
    }

    // For other browsers: 
    // Create a link pointing to the ObjectURL containing the blob.
    const data = window.URL.createObjectURL(newBlob);
    var link = typeof document !== 'undefined' && document.createElement('a');
    link.href = data;
    link.target = '_blank';
    // link.download = "file.pdf";
    link.click();
    setTimeout(function () {
        // For Firefox it is necessary to delay revoking the ObjectURL
        window.URL.revokeObjectURL(data);
    }, 100);
}

const printLuggageLabel = () => {
    const luggageLabelServletUrl = getConfig('luggageLabelServletUrl', '');
    const leadPassenger = SessionStorage.getItem('leadPassenger');
    const userData = SessionStorage.getItem('userData');
    const luggageLabelData = SessionStorage.getItem('luggageLabelData');
    const { title, firstName, lastName, phone = '' } = leadPassenger;
    const brandCode = getConfig('brand', '') === 'po' ? 'PO' : 'CUN';

    const {
        bookingRef,
        embarkationDate,
        embarkationCode,
        disembarkationDate,
        shipCode,
        cruiseCode,
        disembarkationCodeForLuggageLabel
    } = userData;

    const {
        shipName,
        cabinsNumber,
        cabinsDeckName,
        cabinsDeckNumber,
        cabinsCabinLocationsTypeCode,
        cabinsCabinLocationsDesc,
        itineraryBookingCabinNumber,
        itineraryBookingCabinType,
        itineraryBookingCabinPosition,
        itineraryBookingCabinLuggageDoor
    } = luggageLabelData;
    const url = `${luggageLabelServletUrl}?shipName=${shipName}&shipCode=${shipCode}&cruiseCode=${cruiseCode}&bookingRef=${bookingRef}&itineraryBookingBookingID=${bookingRef}&itineraryBookingVoyageId=${cruiseCode}&embarkDate=${embarkationDate}&embarkationPort=${embarkationCode}&disembarkDate=${disembarkationDate}&disembarkationPort=${disembarkationCodeForLuggageLabel}&cabinsNumber=${cabinsNumber}&cabinsDeckName=${cabinsDeckName}&cabinsDeckNumber=${cabinsDeckNumber}&cabinsCabinLocationsTypeCode=${cabinsCabinLocationsTypeCode}&cabinsCabinLocationsDesc=${cabinsCabinLocationsDesc}&itineraryBookingCabinNumber=${itineraryBookingCabinNumber}&itineraryBookingCabinType=${itineraryBookingCabinType}&itineraryBookingCabinPosition=${itineraryBookingCabinPosition}&itineraryBookingCabinLuggageDoor=${itineraryBookingCabinLuggageDoor}&leadPassengerTitle=${title}&leadPassengerFirstname=${firstName}&leadPassengerLastname=${lastName}&leadPassengerPhone=${''}&brandCode=${brandCode}`;

    window.open(url, '_blank');
};

const printUtilities = {
    checkIfPrintIsAvailable,
    printEticket,
    printLuggageLabel
};

export {
    checkIfPrintIsAvailable,
    printEticket,
    printLuggageLabel,
    callForEticketMicroServiceServlet,
    printEticketWithoutMicroservices,
    callForLuggageLabelMicroServiceServlet,
    generateLuggageLabel
};
export default printUtilities;
