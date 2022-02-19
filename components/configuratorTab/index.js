'use strict';

import React from 'react';
import FetchData from '../commons/CUK/fetch-data';
import { calculateDiffDays } from '../commons/CUK/dateFormat';
import Tabs from '../commons/CUK/tabs';
import Image from '../commons/CUK/image';
import SessionStorage from '../commons/CUK/session-storage';
import Link from '../commons/CUK/link';
import SelectField from '../commons/CUK/selectField';
import { generateUniqueCode, getConfig } from '../commons/CUK/utilities';
import moment from 'moment';
import ValidateSession from '../commons/CUK/validateSession';
import analytics from '../commons/CUK/analytics';

// import './styles/index.css';
// import 'platform-theme/styles/components/configuratorTab/index.css';

class configuratorTab extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            activeBed: '',
            activeSitting: '',
            changingBed: false,
            beds: [],
            sitting: [],
            tableSize: {},
            optionTableSize: {},
            saver: false,
            embarkDate: '',
            oldOptionTableSize: {},
            oldSelectedTableSize: {},
			newSynchronizationId: '',
            diningTxtFareType: '',
            diningImage: '',
            diningUrl: ''
        };
    }

    componentDidMount() {
        this.loadInitialData();
    }

    loadInitialData() {
        const header = SessionStorage.getItem('header');
        const { services } = this.props;
        const {
            mycruiseSummaryApiV1 = '/api-mc/mc-getCruiseSummary/v1',
            mycruiseDiningAvailabilityApiV1 = '/api-mc/mc-getDiningAvailability/v1',
        } = services.urls;
        const apikeyMycruise = getConfig('apikeyMycruise', '');

        const userData = SessionStorage.getItem('userData') || {};
        const { customer = {}, bookingRef = '', companyCode = '' } = userData;
        const { firstName = '', lastName = '' } = customer;

        const mycruiseSummaryApiUrl = `${mycruiseSummaryApiV1}?bookingRef=${bookingRef.toUpperCase()}&firstName=${firstName}&lastName=${lastName}&shipCode=${companyCode}`
        const mycruiseDiningAvailabilityApiUrl = `${mycruiseDiningAvailabilityApiV1}?bookingRef=${bookingRef.toUpperCase()}&firstName=${firstName}&lastName=${lastName}&shipCode=${companyCode}`
        let response = {};

        FetchData(mycruiseSummaryApiUrl, {
            headers: {
                'X-Source-Identity-Token-0': apikeyMycruise
            }
        }).then((resData) => {
            response = { ...response, ...resData }
            FetchData(mycruiseDiningAvailabilityApiUrl, {
                headers: {
                    'X-Source-Identity-Token-0': apikeyMycruise
                }
            })
                .then((res) => {
                    response = { ...response, ...res }
                    this.resolveAPIData(response);
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

                    analytics.setAdditionalPageTrackAttributes({
                        myCruiseDetails: {
                            bookingNumber: header.bookingRef,
                            voyageID: header.cruiseCode,
                            voyageName: cruiseData.cruiseName,
                            shipName: cruiseData.shipName,
                            depDate: header.embarkationDate,
                            destName: "",
                            durationDays: header.physicalCruiseDuration,
                            depPortName: cruiseData.embarkPort,
                            destPortName: cruiseData.disembarkPort,
                            stateroomType: "",
                            numGuests: header.passengers.length,
                            dob: dobArray,
                        },
                        loginStatus: "logged in",
                        loginType: (header.agent) ? header.agent.agentType : 'customer',
                        AgentID: (header.agent) ? header.agent.id : '',
                        crmID: "",
                        country: header.market,
                        languageSelected: header.language.substring(0, 2),
                        customCurrencyCode: customCurrencyCode,
                        memberLoyaltyLevel: header.customer.loyaltyTier,
                        server: "",
                        localDayTime: new Date().toString(),
                        timePartingCodes: "",
                        pageType: config.pageName,
                        //Please refer Page and Content Hierarchy Tabs for below values
                        sectionLevelOne: "",
                        sectionLevelTwo: "",
                        sectionLevelThree: "",
                        sectionLevelFour: "",
                        pageName: config.pageName,
                        pageChannel: "",
                        pageHier: "",
                        //Please refer Page and Content Hierarchy Tabs for above values
                        ecomStep: "",
                    })

                    // analytics.clickTracking(this);
                })
        });
        this.shipInfo();
    }

    resolveAPIData(res) {
        const { labels } = this.props;
        const { cabins, diningSeatings, diningAvailability, fullPaymentReceivedInd } = res;

        const fullPaymentReceivedIndValue = fullPaymentReceivedInd !== "N" ? true : false;
        SessionStorage.setItem('fullPaymentReceivedInd', fullPaymentReceivedIndValue);

        const typeOfBeds = cabins[0].beds.reduce((typeOfBeds, bed) => {
            const { desc } = bed;
            bed.translatedDesc = labels[desc.toLowerCase() + 'Label'];
            typeOfBeds.push(bed);
            return typeOfBeds;
        }, []);

        const selectedBed = typeOfBeds.find((bed) => bed.currentlyHeld === 'Y');
        let dsDesc = diningSeatings.description
            .toLowerCase()
            .replace(/\s+/g, '');

        if (dsDesc.includes('anytimedining')) {
            dsDesc = "freedomdining"
        }

        const sittings = diningAvailability.DiningSeating.reduce(
            (sitting, singleDiningAvailability) => {
                if (diningSeatings.code.$ !== singleDiningAvailability.code.$) {
                    const dsDesc = singleDiningAvailability.description
                        .toLowerCase()
                        .replace(/\s+/g, '');
                    singleDiningAvailability.translatedDesc =
                        labels[dsDesc + 'Label'];
                    sitting.push(singleDiningAvailability);
                }
                return sitting;
            },
            [
                {
                    ...diningSeatings,
                    translatedDesc: labels[dsDesc + 'Label']
                }
            ]
        );

        const selectedTableSize = {
            title: diningSeatings.tableCode.$,
            value: diningSeatings.tableCode.$
        };

        // options for table size arriving from API need to have a different format

        let tableOptions = diningAvailability.tableSize.reduce(
            (tableOptions, singleOption, index) => {
                const key = singleOption.$;
                const rightLabel = labels[singleOption.$]
                    ? labels[singleOption.$]
                    : singleOption.$;
                tableOptions.push({
                    label: rightLabel,
                    value: key,
                    [key]: { label: rightLabel, value: key }
                });
                return tableOptions;
            },
            []
        );

        if (tableOptions && tableOptions.length) {
            let newTableOption = [];
            for (var i = 0; i < tableOptions.length; i++) {
                if (isNaN(tableOptions[i].value)) {
                    const obj = tableOptions.splice(i, 1);
                    newTableOption.push(obj[0]);
                }
            }
            tableOptions = tableOptions.concat(newTableOption);
        }

        this.setState(() => ({
            beds: typeOfBeds,
            sitting: sittings,
            activeBed: selectedBed.typeCode.$,
            activeSitting: diningSeatings.code.$,
            tableSize: selectedTableSize,
            optionTableSize: tableOptions,
            oldOptionTableSize: tableOptions,
            initialData: res,
            oldSelectedTableSize: selectedTableSize
        }));
    }

    // show the save button
    handleConfigurationChange = (event) => {
        const { target } = event;
        const { name, id } = target;
        if (name === 'Sitting' && id === '8') {
            this.setState((prevState) => ({
                optionTableSize: 0,
                oldOptionTableSize: prevState.optionTableSize
            }));
        } else {
            this.setState(() => ({
                optionTableSize: this.state.oldOptionTableSize,
                tableSize: this.state.oldSelectedTableSize
            }));
        }
        this.setState(() => ({
            [`changing${name}`]: true,
            [`active${name}`]: id
        }));
    };
    sendUpdate = (type) => {
        // update my cruise summay
        // creating body for update API
        // get info for generating the uniquecode
        const { component, labels } = this.props;
        analytics.customClicks(type === 'bed' ? {
            componentName: component,
            linkText: `${labels.saveLabel}`,
            event: 'event313',
            bedconfig_selected: this.state.activeBed === 'T2' ? 'twin' : 'queen',
            bedconfig_previous: this.state.activeBed === 'T2' ? 'queen' : 'twin'
        } : {
                componentName: component,
                linkText: `${labels.saveLabel}`,
                event: 'event314',
                diningType_selected: this.state.activeSitting === '1' ? 'firstseating' : (this.state.activeSitting === '2' ? 'secondseating' : 'freedomdining'),
                diningType_previous: this.state.initialData.diningSeatings.code.$ === '1' ? 'firstseating' : (this.state.initialData.diningSeatings.code.$ === '2' ? 'secondseating' : 'freedomdining')
            });

        const {
            services: { urls }
        } = this.props;
        const { initialData, activeBed, activeSitting, tableSize, newSynchronizationId } = this.state;
        const userData = SessionStorage.getItem('userData');
        const { shipCode, customer, bookingRef } = userData;

        const uniqueCode = generateUniqueCode(
            bookingRef,
            customer.firstName,
            customer.birthDate
        );

        // get APIKEY from configs
        const apikey =
            typeof window !== 'undefined' ? window.configs.apikeyMycruise : '';

        let url;
        if (type === 'bed') {
            url = urls.updateBedApi;
            const bedInitials = initialData.cabins[0].beds;
            // find the selected one and move it to first position
            let helpersArray = bedInitials;
            helpersArray.map((bed, index) => {
                if (bed.typeCode.$ === activeBed) {
                    helpersArray.unshift(helpersArray.splice(index, 1)[0]);
                }
            });
        }
        if (type === 'sitting') {
            // sitting could have change only the sitting or only hte table size or both
            url = urls.updateSittingApi;
            const sittingInitials = initialData.diningSeatings;
            if (activeSitting !== sittingInitials) {
                let helpersArray = sittingInitials;

                //updating diningSeatings
                sittingInitials.code.$ = activeSitting;
            }
            const tableSizeInitials = initialData.diningSeatings.tableCode.$;
            if (tableSize.value !== tableSizeInitials.toString()) {
                sittingInitials.tableCode.$ = tableSize.value;
            }
        }
		
		if (newSynchronizationId != '' && newSynchronizationId != null) {
			const returnedInitialData = Object.assign(initialData, {
				synchronizationId: newSynchronizationId
			});
			var newData = { CruiseSummaryCBO: returnedInitialData };
		} else {
			var newData = { CruiseSummaryCBO: initialData };
		}

        FetchData(url, {
            method: 'PUT',
            body: JSON.stringify(newData),
            headers: {
                'X-Source-Identity-Token-0': apikey,
                'X-MessageID': uniqueCode,
                'Content-Type': 'application/json'
            }
        }).then((response) => {
            this.setState(() => ({
                changingSitting: false,
                changingBed: false,
				newSynchronizationId: response.bookingStatus.description
            }));
        });
    }

    updateForm = (name, value, title, event) => {
        this.setState(() => ({
            changingSitting: true,
            tableSize: {
                title,
                value
            }
        }));
    };

    shipInfo() {
        const {
            props: {
                productSearchServlet,
                shipInfoServlet,
                fareTypeServlet,
                urlsList
            }
        } = this;
        const userData = SessionStorage.getItem('userData') || {};
        const {
            shipCode = '',
            // mainDiningCode = '',
            embarkationDate = '',
            cabinType = '',
            cabinCode,
            fareCode = ''
        } = userData;

        const fareCodeLowerCase = fareCode.toLowerCase().replace(/\s/g, '');
        const firstLetterCabinCode = cabinCode.substring(0, 1);
        let diningLandingUrlFull = '';
        let fareTypeTxt = '';

        if(urlsList.default != undefined){
            if (urlsList[cabinCode]) {
                diningLandingUrlFull = urlsList[cabinCode].mainDining;
                fareTypeTxt = urlsList[cabinCode].fareTypes[fareCodeLowerCase];
            } else if (urlsList[firstLetterCabinCode]) {
                diningLandingUrlFull = urlsList[firstLetterCabinCode].mainDining;
                fareTypeTxt =
                    urlsList[firstLetterCabinCode].fareTypes[fareCodeLowerCase];
            } else {
                diningLandingUrlFull = urlsList['default'].mainDining;
                fareTypeTxt = urlsList['default'].fareTypes[fareCodeLowerCase];
            }
        }
        const dayOfCruiseDeparture = new Date(
            moment(embarkationDate, 'YYYY-MM-DD').format('ll')
        );
        const today = new Date();

        this.daysToDeparture = calculateDiffDays(
            today.getTime(),
            dayOfCruiseDeparture.getTime()
        );

        const urlString = `${productSearchServlet}.mainDining.${shipCode}.${cabinCode}.json`;

        FetchData(urlString, {
            method: 'GET'
        }).then((response) => {
            if (response.venues[0] === '') {
                this.setState(() => ({
                    diningImage: '',
                    diningDesc: '',
                    diningUrl: '',
                    diningTxtFareType: fareTypeTxt
                }));   

            } else {
                const infoMainDining = response.venues[0];
                const { overviewImage, name } = infoMainDining;
                const image = [0, 376, 769].reduce(
                    (image, resolution) => {
                        image[resolution] = {
                            '1x': `${overviewImage}`,
                            '2x': `${overviewImage}`
                        };
                        return image;
                    },
                    { alt: name }
                );
    
                this.setState(() => ({
                    diningImage: image,
                    diningDesc: infoMainDining.description,
                    diningUrl: infoMainDining.url,
                    diningTxtFareType: fareTypeTxt
                }));
            
            }
            
        });

        const urlStringCabin = `${shipInfoServlet}.cabin.${shipCode}.${cabinType}.${cabinCode}.json`;

        FetchData(urlStringCabin, {
            method: 'GET'
        }).then((response) => {
            this.setState(() => ({
                cabinImage: response.bedImage,
                cabinDesc: response.cabinDesc,
                cabinName: response.cabinName
            }));
        });

        const urlServletFareType = fareTypeServlet.replace('{code}', fareCode);

        FetchData(urlServletFareType, {
            method: 'GET'
        }).then((response) => {
            this.setState(() => ({
                fareType: response.txTariffTitle
                //fareText: response.textBenefitTitle
            }));
        });
    }

    renderBed = (bedType, index) => {
        const { activeBed } = this.state;
        const { typeCode, desc, translatedDesc } = bedType;
        return (
            <fieldset key={index}>
                <input
                    type="radio"
                    name="Bed"
                    checked={activeBed === typeCode.$}
                    id={typeCode.$}
                    onChange={this.handleConfigurationChange}
                />
                <label htmlFor={typeCode.$}>
                    {/* {desc} */}
                    {translatedDesc}
                </label>
            </fieldset>
        );
    };

    renderBedConfiguration() {
        const { labels, tabAlignment } = this.props;
        const {
            beds,
            cabinName,
            cabinDesc,
            cabinImage,
            changingBed
        } = this.state;

        const userData = SessionStorage.getItem('userData') || {};
        const { shipCode = '' } = userData;
        const luggageLabelData = SessionStorage.getItem('luggageLabelData');
        const cabinInfoCheck = luggageLabelData ? (luggageLabelData.itineraryBookingCabinLuggageDoor !== '' && luggageLabelData.cabinsDeckNumber !== '' && luggageLabelData.cabinsNumber !== '') ? true : false : false;
        const beforeYouSailUrlBase = getConfig('beforeYouSailUrl', '');
        const beforeYouSailUrl = beforeYouSailUrlBase.replace(
            '{shipCode}',
            shipCode
        );

        const globalXdays = getConfig('globalXdays', '');

        const buttonClass = changingBed ? 'show' : 'hide';
        const changeable = this.daysToDeparture > globalXdays ? true : false;
        // let daysToDeparture = daysToDeparture();

        let minAdultAge =
            typeof window !== 'undefined' ? window.configs.minAdultAge : '';

        const orderedList = SessionStorage.getItem('orderedList');
        let currentlyLoggedPassenger;
        let passengerAge;
        currentlyLoggedPassenger = { ...orderedList.passengers[0] };
        passengerAge = currentlyLoggedPassenger.age;
        let isAdult = passengerAge >= minAdultAge;
        const formClass = changeable && isAdult ? '' : 'disable';

        return (
            <div title={labels.bedConfigurationLabel}>
                <div className="state-room-acc-container">
                    <div className="room-item-wrapper roomInfo">
                        <article className={`media media-${tabAlignment}`}>
                            <div className="image-wrapper">
                                <Image {...cabinImage} />
                                <p className="image__label">
                                    {labels.imageLabel}
                                </p>
                            </div>
                            <section className="section-wrapper bedConfiguration">
                                <h2>{cabinName}</h2>
                                <p
                                    dangerouslySetInnerHTML={{
                                        __html: cabinDesc
                                    }}
                                />
                                <div className="configurator__info">
                                    <h4>{labels.bedLabel}</h4>
                                    {cabinInfoCheck && <form className={formClass}>
                                        {beds.length > 1 &&
                                            beds.map(this.renderBed)}
                                        {beds.length === 1 && (
                                            <div className="radio--readOnly">
                                                {/* {beds[0].desc} */}
                                                {beds[0].translatedDesc}
                                            </div>
                                        )}
                                        <button
                                            type="button"
                                            className={`cta-primary bedConfiguration__submit ${buttonClass}`}
                                            onClick={() => {
                                                this.sendUpdate('bed');
                                            }}
                                        >
                                            {labels.saveLabel}
                                        </button>
                                    </form>}
                                    <div className="configurator__details">
                                        {(!cabinInfoCheck || beds.length === 0) && (
                                            <p className="configurator__par">
                                                {labels.notAllocatedLabel}
                                            </p>
                                        )}
                                        {!changeable && (
                                            <p className="configurator__par">
                                                {labels.noChangeText}
                                            </p>
                                        )}
                                        {!isAdult && (
                                            <p className="configurator__par">
                                                {labels.minAdultAgeLabel}
                                            </p>
                                        )}
                                        <p className="configurator__par">
                                            {labels.moreInfoLabel}
                                            <a href={beforeYouSailUrl}>
                                                {labels.clickHereLabel}
                                            </a>
                                        </p>
                                    </div>
                                </div>
                            </section>
                        </article>
                    </div>
                </div>
            </div>
        );
    }

    closeTooltip = (e) => {
        analytics.clickTracking(this);
        e.preventDefault();
        this.setState({ hover: false });
    };
    handleMouseIn = () => {
        this.setState({ hover: true });
    };

    handleMouseOut = () => {
        this.setState({ hover: false });
    };

    renderSitting = ({ code, translatedDesc, available, description, dinigSeatingstatusDescription }, index) => {
        const { activeSitting, hover } = this.state;
        const { labels } = this.props;
        const display = hover ? 'block' : 'none';
        const tooltipStyle = { display };
        return (
            <fieldset key={`sitting-${index}`}>
                <input
                    type="radio"
                    name="Sitting"
                    checked={activeSitting === code.$}
                    id={code.$}
                    onChange={this.handleConfigurationChange}
                />
                <label htmlFor={code.$}>
                    {/* {description} */}
                    {translatedDesc}
                </label>
                {/* TODO: if not vailable, register interest */}
                {(index === 0) ? (
                    <span className="configurator__moreInfo">
                        {labels.registerPreferenceLabel}
                        <span
                            className="tooltip__icon"
                            onMouseOver={this.handleMouseIn}
                            onMouseOut={this.handleMouseOut}
                        >
                            <div className="tooltip__dd" style={tooltipStyle}>
                                <a
                                    className="tooltip__close"
                                    onClick={this.closeTooltip}
                                />
                                <p>{labels.registerPreferenceTooltipLabel}</p>
                            </div>
                        </span>
                    </span>
                ) : (
                        <span className="configurator__moreInfo">
                            {dinigSeatingstatusDescription}
                        </span>
                    )}
            </fieldset>
        );
    };

    renderDiningConfiguration = () => {
        const { labels, tabAlignment } = this.props;
        const {
            diningImage,
            diningUrl,
            sitting,
            optionTableSize,
            tableSize,
            saver,
            fareType,
            changingSitting,
            diningTxtFareType,
            activeSitting
        } = this.state;
        const userData = SessionStorage.getItem('userData') || {};

        const {
            fareCode = '',
            shipCode = '',
            cabinCode = ''
        } = userData;
        const cabinCodeSubStrValue = cabinCode.substring(0, 2).toLowerCase();
        const diningLabelValue = cabinCodeSubStrValue === "a1" || cabinCodeSubStrValue === "a2" || cabinCodeSubStrValue.indexOf('p') === 0 || cabinCodeSubStrValue.indexOf('q') === 0
        let sittingIApref = '';
        if (sitting.length) {
            for (let i = 0; i < sitting.length; i++) {
                if (sitting[i].code.$ === '8') {
                    sittingIApref = sitting[i].translatedDesc;
                }
            }
        }
        const globalXdays = getConfig('globalXdays', '');
        const minAdultAge = getConfig('minAdultAge', '');

        const changeable = this.daysToDeparture > globalXdays ? true : false;
        const buttonClass = changingSitting ? 'show' : 'hide';

        const orderedList = SessionStorage.getItem('orderedList') || {};
        const { passengers = [] } = orderedList;
        const currentlyLoggedPassenger = passengers[0] || {};
        const { age = 999 } = currentlyLoggedPassenger;
        const isAdult = age >= minAdultAge;
        const formClass = changeable && isAdult ? '' : 'disable';
        return (
            <div title={labels.renderDiningConfiguration}>
                <div className="state-room-acc-container configurator">
                    <div className="room-item-wrapper roomInfo">
                        <article className={`media media-${tabAlignment}`}>
                            <div className="image-wrapper">
                                <Image {...diningImage} />
                            </div>
                            <section className="section-wrapper">
                                <span className="room-item__fare">
                                    {fareType}
                                </span>
                                <h2>{labels.mainDiningLabel}</h2>
                                {/* <Link
                                    url=""
                                    ariaLabel={labels.seeDetailsLabel}
                                    label={labels.seeDetailsLabel}
                                    url={diningUrl}
                                    linkClassName={`cta-secondary`}
                                    dataLinktext="back to top"
                                >
                                    {labels.seeDetailsLabel}
                                </Link> */}

                                {(fareCode && ((fareCode.indexOf('SELECT') > -1) || fareCode.indexOf('EARLY') > -1)) ? (<div className="configurator__info">
                                    <h5>{labels.diningLabel}</h5>
                                    <p className="configurator__par">
                                        {diningLabelValue ? labels.youHaveSelectedTimingsLabel : labels.youHaveSelectedLabel}
                                    </p>
                                    {shipCode !== 'IA' &&
                                        <form className={formClass}>
                                            {sitting.length > 1 &&
                                                sitting.map(this.renderSitting)}
                                            {optionTableSize.length > 0 && activeSitting !== '8' && (
                                                <div>
                                                    <h5>{labels.tableSizeLabel}</h5>

                                                    <SelectField
                                                        name="tableSize"
                                                        label={
                                                            labels.tableSizeLabel
                                                        }
                                                        disableValidation={true}
                                                        value={tableSize.value}
                                                        title={tableSize.title}
                                                        options={optionTableSize}
                                                        errorMsg="error"
                                                        showLabel={false}
                                                        disableDefaultOption={true}
                                                        defaultValue={
                                                            tableSize.value
                                                        }
                                                        readOnly={
                                                            !changeable || !isAdult
                                                        }
                                                        changeCallback={
                                                            this.updateForm
                                                        }
                                                    />
                                                </div>
                                            )}

                                            <button
                                                type="button"
                                                className={`cta-primary bedConfiguration__submit ${buttonClass}`}
                                                onClick={() =>
                                                    this.sendUpdate('sitting')
                                                }
                                            >
                                                {labels.saveLabel}
                                            </button>
                                        </form>
                                    }
                                    {
                                        shipCode === 'IA' &&
                                        <form className={''}>
                                            {sitting.length && (
                                                <div className="radio--readOnly">
                                                    {sittingIApref}
                                                </div>
                                            )}
                                        </form>
                                    }
                                    <div>
                                        {changeable &&
                                            isAdult && (
                                                <p className="configurator__par">
                                                    {diningTxtFareType}
                                                </p>
                                            )}
                                        {!changeable &&
                                            isAdult && (
                                                <p className="configurator__par">
                                                    {labels.noChangeText}
                                                </p>
                                            )}
                                        {!isAdult && (
                                            <p className="configurator__par">
                                                {labels.minAdultAgeLabel}
                                            </p>
                                        )}
                                    </div>
                                </div>) : (
                                        <div>
                                            {changeable &&
                                                isAdult && (
                                                    <p className="configurator__par">
                                                        {diningTxtFareType}
                                                    </p>
                                                )}
                                            {!changeable &&
                                                isAdult && (
                                                    <p className="configurator__par">
                                                        {labels.noChangeText}
                                                    </p>
                                                )}
                                            {!isAdult && (
                                                <p className="configurator__par">
                                                    {labels.minAdultAgeLabel}
                                                </p>
                                            )}
                                        </div>)}
                            </section>
                        </article>
                    </div>
                </div>
            </div>
        );
    }

    render() {
        return (
            <div className="">
                {this.state.initialData && (
                    <Tabs selected={0} componentName={this.props.component}>
                        {this.renderBedConfiguration()}
                        {this.renderDiningConfiguration()}
                    </Tabs>
                )}
            </div>
        );
    }
}

export default configuratorTab;
