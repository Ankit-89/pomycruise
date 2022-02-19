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
        optionsArray.sort(
            (a, b) => (a.value < b.value ? 1 : b.value < a.value ? -1 : 0)
        );
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

export {
    createOptionsArray,
    createDaysOptions,
    createYearsOptions,
    composeName,
    createPassengersOptions,
    compareAndCreateOption
};
