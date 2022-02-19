import SessionStorage from '../commons/CUK/session-storage';

const createOptionsArray = (initialOptions) => {
    return initialOptions.reduce((optionsArrayOuter, option) => {
        Object.entries(option).map(([key, option]) => {
            optionsArrayOuter.push({
                ...option,
                value: key
            });
        });
        return optionsArrayOuter.sort((a, b) => a.value - b.value);
    }, []);
};

const createYearsOptions = (yearsRange, type) => {
    const currentYear = new Date().getFullYear();
    const pastYear = currentYear - parseInt(yearsRange);
    const futureYear = currentYear + parseInt(yearsRange);
    const aHundredYears = currentYear - parseInt(100);
    const optionsArray = [];
    if (type === 'expiry') {
        for (let i = currentYear; i < futureYear + 1; i++) {
            optionsArray.push({ label: i, value: i });
        }
    } else if (type === 'issue') {
        for (let i = pastYear; i < currentYear + 1; i++) {
            optionsArray.push({ label: i, value: i });
        }
    } else if (type === 'birth') {
        for (let i = aHundredYears; i < currentYear; i++) {
            optionsArray.push({ label: i, value: i });
        }
        optionsArray.sort((a,b) => (a.value < b.value) ? 1 : ((b.value < a.value) ? -1 : 0));
    }
    return optionsArray;
};

const createDaysOptions = (range) => {
    const optionsArray = [];
    for (let j = 1; j <= range; j++) {
        j = ('0' + j).slice(-2);
        optionsArray.push({ label: j, value: j });
    }
    return optionsArray;
};

const composeName = ({
    titleCode: { $ },
    firstNameText,
    middleNameText,
    familyNameText,
    suffixText
}) =>
    `${$} ${firstNameText}${
    middleNameText ? ` ${middleNameText}` : ``
    } ${familyNameText} ${suffixText}`;

const createPassengersOptions = (passengers) =>
    passengers.reduce(
        (
            passengersOptions,
            { seqNumber, individual: { individualName } },
            index
        ) => [
                ...passengersOptions,
                {
                    label: composeName(individualName),
                    value: index,
                    seqNumber: seqNumber.$
                }
            ],
        []
    );

const compareAndCreateOption = (where, val) => {
    return (
        where.find(
            (item) => item.value.toLowerCase() === val.toLowerCase()
        ) || {
            label: '',
            value: ''
        }
    );
};

const checkForEticketAndLuggageLable = (fname, lname, res) => {
    const { passengers } = res;
    let passenger = {};
    let flagPersonalDetail = false;
    let flagTravelDocDetail = false;
    for (let i = 0; i < passengers.length; i++) {
        if (passengers[i] &&
            passengers[i].individual &&
            passengers[i].individual.individualName &&
            passengers[i].individual.individualName.firstNameText &&
            passengers[i].individual.individualName.familyNameText
        ) {
            const {
                individual: {
                    individualName: {
                        firstNameText,
                        familyNameText
                    }
                }
            } = passengers[i];
            if (fname.toLowerCase() === firstNameText.toLowerCase() && lname.toLowerCase() === familyNameText.toLowerCase()) {
                passenger = passengers[i];
            }
        }
    }
    if (passenger) {

        if (passenger &&
            passenger.individual &&
            passenger.individual.birthDate &&
            passenger.individual.contactPoints &&
            passenger.individual.contactPoints.length &&
            passenger.individual.individualName.titleCode &&
            passenger.individual.individualName.titleCode.$ &&
            passenger.individual.contactPoints[0].phoneNumber &&
            passenger.individual.contactPoints[0].phoneNumber.numberText &&
            passenger.individual.contactPoints[0].emailAddress &&
            passenger.individual.contactPoints[0].emailAddress.fullAddressText
        ) {
            const {
                individual: {
                    individualName: {
                        titleCode,
                        firstNameText,
                        familyNameText
                    }
                }
            } = passenger;

            const {
                postalAddress,
                phoneNumber: { numberText },
                emailAddress: { fullAddressText }
            } = passenger.individual.contactPoints[0];

            if (postalAddress &&
                postalAddress.length &&
                postalAddress[0].postCode &&
                postalAddress[0].postCode.$ &&
                postalAddress[0].countryCode &&
                postalAddress[0].countryCode.$
            ) {
                const {
                    addressLine1,
                    cityNameText,
                    postCode: { $ },
                    countryCode
                } = postalAddress[0];
                if (
                    titleCode.$ !== '' &&
                    firstNameText !== '' &&
                    familyNameText !== '' &&
                    passenger.individual.birthDate !== '' &&
                    numberText !== '' &&
                    fullAddressText !== '' &&
                    addressLine1 !== '' &&
                    cityNameText !== '' &&
                    countryCode.$ !== '' &&
                    $ !== ''
                ) {
                    flagPersonalDetail = true;
                } else {
                    flagPersonalDetail = false;
                }
            }
        } else {
            flagPersonalDetail = false
        }

        if (passenger &&
            passenger.individual &&
            passenger.individual.identityDocuments &&
            passenger.individual.identityDocuments.length &&
            passenger.individual.identityDocuments[0].issueDate &&
            passenger.individual.identityDocuments[0].issuePlaceNameText &&
            passenger.individual.identityDocuments[0].birthPlaceName &&
            passenger.individual.identityDocuments[0].expiryDate &&
            passenger.individual.identityDocuments[0].id &&
            passenger.individual.identityDocuments[0].id.$ &&
            passenger.individual.identityDocuments[0].issuePlaceCode &&
            passenger.individual.identityDocuments[0].issuePlaceCode.$ &&
            passenger.individual.identityDocuments[0].birthPlaceCode &&
            passenger.individual.identityDocuments[0].birthPlaceCode.$
        ) {
            const {
                issueDate,
                issuePlaceCode,
                issuePlaceNameText,
                expiryDate,
                birthPlaceName,
                typeCode,
                birthPlaceCode,
                id
            } = passenger.individual.identityDocuments[0];

            if (
                id.$ !== '' &&
                issueDate !== '' &&
                issuePlaceCode.$ !== '' &&
                issuePlaceNameText !== '' &&
                birthPlaceCode.$ !== '' &&
                expiryDate !== '' &&
                birthPlaceName !== '' &&
                typeCode.$ !== ''
            ) {
                flagTravelDocDetail = true;
            } else {
                flagTravelDocDetail = false;
            }
        } else {
            flagTravelDocDetail = false;
        }
    }

    SessionStorage.setItem('checkForflagPersonalDetail', flagPersonalDetail);
    SessionStorage.setItem('checkForflagTravelDocDetail', flagTravelDocDetail);
}
export {
    createOptionsArray,
    createDaysOptions,
    createYearsOptions,
    composeName,
    createPassengersOptions,
    compareAndCreateOption,
    checkForEticketAndLuggageLable
};
