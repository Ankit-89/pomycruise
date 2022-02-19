'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import Card from '../commons/CUK/card';
import Link from '../commons/CUK/link';
import Price from '../commons/CUK/price';
import sessionStorage from '../commons/CUK/session-storage';
import { getCurrencyData, getCurrency, getPriceInformation } from '../commons/CUK/currencyFormat';
import { getCampaignId, getMarinerLevel }  from '../commons/CUK/login-data-utility';
import fetchData from '../commons/CUK/fetch-data';
import { cleanURL, getUserType, getCountryCode } from '../commons/CUK/utilities';
import { isLoggedIn, getMarinerId, getLoginToken } from '../commons/CUK/login-data-utility';
import OffersRibbon from '../commons/CUK/offersRibbon';
import { plainDateFormat } from '../commons/CUK/dateFormat';
import analytics from '../commons/CUK/analytics';

const USER = getUserType();

class HotelCard extends React.PureComponent {
    constructor(props) {
        super(props);

        let {
            title,
            image,
            description,
            offerBanner,
            price,
            currency,
            inlinePackage: packageType,
            roomTypeName,
            primaryCta = {},
            serviceCharges = [{}],
            portCharges = {},
            detailsCopy = ''
        } = props;

        if (detailsCopy) {
            primaryCta.label = detailsCopy;
        }
        this.state = {
            title,
            description,
            image,
            offerBanner: this.getOfferBanner([{ name: offerBanner }]),
            price,
            currency,
            packageType,
            serviceChargeLabel: '',
            roomTypeName,
            primaryCta,
            serviceCharges,
            portCharges,
            flight: {},
            isCardDetailAvailable: true,
            offers: []
        };

        this.campaigns = this.getListOfCampaigns();
        this.currencyData = getCurrencyData();
        this.currencyCode = this.currencyData.currencyCode;
        this.countryCode = getCountryCode();
        this.newProps = props;
    }

    /**
     *  Returns the list of campaigns (Loyalty status?)
     * @returns {*}
     */
    getListOfCampaigns = () => {
        let campaigns = getMarinerLevel() || getCampaignId();

        return campaigns.length > 0 ? ( typeof campaigns === 'object' ? [ ...campaigns, 'anonymous' ] : [ campaigns, 'anonymous' ] ) : [ 'anonymous' ];
    }

    /**
     * finds the lowest price based on url params
     * @param { Object } data - search result data
     * @param { Array } campaigns - campaign list
     * @param { String } priceLabel - price prefix label
     * @returns {*}
     */
    getLowestPrice = (data) => {
        const listOfPrices = this.campaigns.map( campaign => {
            return data[`price_${this.currencyCode}_${campaign}`];
        }).filter(price => price);

        return Math.min.apply(null, listOfPrices);
    }
    componentWillReceiveProps(props) {
        this.newProps = props;
        if (props.tileType === 'query' && (!(props.showOfferBanner || props.showTariff) || (props.specialOffersList && Object.keys(props.specialOffersList).length > 0))) {
            ( props.paxType || props.offerCode ) ? this.fetchPriceFromApi() : this.fetchPrice();
        }

        if ( !props.specialOffersDestination ) {
            let {
                    title,
                    image,
                    description,
                    offerBanner,
                    inlinePackage: packageType,
                    primaryCta = {},
                    tileType
                } = props,
                newStateObj = {
                    title,
                    description,
                    image,
                    offerBanner: this.getOfferBanner([{ name: offerBanner }]),
                    packageType,
                    primaryCta,
                    isCardDetailAvailable: true
                },
                oldStateObj = {
                    title: this.state.title,
                    description: this.state.description,
                    image: this.state.image,
                    offerBanner: this.state.offerBanner,
                    packageType: this.state.packageType,
                    primaryCta: this.state.primaryCta,
                    isCardDetailAvailable: this.state.isCardDetailAvailable
                };

            if ( JSON.stringify(oldStateObj) !== JSON.stringify(newStateObj) && tileType === 'inline') {
                this.setState(newStateObj);
            }
        }
    }
    getApiUrl = () => {
        const {
            culture = '',
            costaClubCategory = '',
            destination = '',
            departDateFrom = '',
            departDateTo = '',
            shipCode = '',
            departurePort = '',
            paxType = '',
            occupancy = '',
            offerCode = ''
        } = this.props;

        let query = `Culture=${culture}&CostaClubCategory=${costaClubCategory}&Destination=${destination}&ShipCode=${shipCode}&DeparturePort=${departurePort}&FareCode=${paxType}&MaxItems=1&Occupancy=${occupancy}&DiscountCode=${offerCode}&Available=true`;

        if (departDateFrom) {
            query += `&FromPeriod=${departDateFrom}`;
        }
        if (departDateTo) {
            query += `&ToPeriod=${departDateTo}`;
        }

        return query;

    }

    /**
     * fetchPriceFromApi - Get price data from API
     */
    fetchPriceFromApi = () => {
        fetchData(`${this.props.services.urls.cruiseList}?${ this.getApiUrl() }`, {
            method: 'GET',
            headers: this.props.services.headers
        }).then(response => {
            if (!response || (response && !response.data) || (response && response.data && !response.data.cruiseList)) {
                this.hideCardTile();

                return false;
            }

            const {
                    lowestPrice,
                    cruiseCode,
                    itineraryId,
                    tourId,
                    serviceCharges = [{
                        adultAmount: '',
                        childAmount: '',
                        infantAmount: '',
                        currency: ''
                    }],
                    portCharges = {
                        adultAmount: '',
                        childAmount: '',
                        infantAmount: '',
                        currencyCode: ''
                    },
                    taxesAndFeesCombined,
                    duration
                } = response.data.cruiseList[0],
                priceSolrUrl = this.props.priceSolrUrl.replace('{{cruiseId_itineraryId}}', `${cruiseCode}_${itineraryId}`),
                {
                    price,
                    flight,
                    promoCodes,
                    tax,
                    fare,
                    classification,
                    category
                } = lowestPrice;

            this.setState({
                roomsDataDetails: {
                    cruiseCode,
                    classification,
                    rateCode: fare,
                    categoryCode: category
                }
            });

            this.fetchPrice({ price, serviceCharges, portCharges, tax, tourId, taxesAndFeesCombined, flight, fare, classification, duration, promoCodes }, priceSolrUrl, false);

        }).catch(this.hideCardTile);
    }

    /**
     * getFormattedServiceCharges - Formats the service charge message
     * @param {string} serviceChargeLabel contains update price, currency from api
     * @param {object} portCharges list of prices for ports
     * @param {string} priceData priceData cruise price obj with service charge
     * @param {string} currency price related currency
     * @returns {string} serviceChargeLabel updated with applicable charges
     */
    getFormattedServiceCharges(serviceChargeLabel = '', portCharges, priceData, currency) {
        if (serviceChargeLabel) {
            const data = priceData;
            const serviceChargeCurrency = data && data.serviceCharges && data.serviceCharges.length ? getCurrency(data.serviceCharges[0].currency, window.configs) : '';
            const portChargesCurrency = portCharges ? getCurrency(portCharges.currencyCode, window.configs) : '';
            const priceCurrency = currency ? getCurrency(currency, window.config) : '';

            if (data.price) {
                serviceChargeLabel = serviceChargeLabel.replace('{{priceWithServiceCharge}}', `${data.price}${priceCurrency}`);
            }
            if (serviceChargeCurrency) {
                serviceChargeLabel = serviceChargeLabel.replace('{{serviceCharges.adultAmount}}', `${data.serviceCharges[0].adultAmount}${serviceChargeCurrency}`)
                    .replace('{{serviceCharges.childAmount}}', `${data.serviceCharges[0].childAmount}${serviceChargeCurrency}`);
            }
            if (portCharges) {
                serviceChargeLabel = serviceChargeLabel.replace('{{portCharges.adultAmount}}', `${portCharges.adultAmount}${portChargesCurrency}`)
                    .replace('{{portCharges.childAmount}}', `${portCharges.childAmount}${portChargesCurrency}`)
                    .replace('{{portCharges.infantAmount}}', `${portCharges.infantAmount}${portChargesCurrency}`);
            }
        }

        return serviceChargeLabel;
    }

    getRoomTypeName = (classification, fare, roomTypeName) => {
        let tariffTitleFound = '';

        if (classification === '') {
            classification = '*';
        }
        let specialOffersList = this.props.specialOffersList;

        specialOffersList && specialOffersList.tariffs && Object.keys(specialOffersList.tariffs).length > 0 ? Object.keys(specialOffersList.tariffs).map(key => {
            if (key.match(/||/i)[0]) {
                let tariffCodeArr = key.split['||'];

                if (tariffCodeArr > -1 && tariffCodeArr === `*-${classification}-${fare}`) {
                    tariffTitleFound = specialOffersList.tariffs[key].tariffTitle;
                }
            }
            else if (key === `*-${classification}-${fare}`) {
                tariffTitleFound = specialOffersList.tariffs[key].tariffTitle;
            }
        }) : '';


        // roomTypeName = tariffArr.length > 0 ? tariffArr[0].tariffTitle : roomTypeName;

        return tariffTitleFound;
    }

    getOffers = (fare, specialOffersList, promoCodes) => {
        const { promoFilterTypes } = this.props;
        let offers;

        if (fare && specialOffersList && specialOffersList.offerDeals && specialOffersList.offerDeals[fare]) {
            offers = [ specialOffersList.offerDeals[fare] ];
        }
        else if (promoCodes && promoCodes.length && specialOffersList && specialOffersList.specialOffers &&  Object.keys(specialOffersList.specialOffers).length) {
            offers = promoCodes.filter(item => specialOffersList.specialOffers[item]).map(item => specialOffersList.specialOffers[item]);
            if ( promoFilterTypes && Array.isArray(promoFilterTypes) && promoFilterTypes.length ) {
                offers = offers.filter(({ type }) => promoFilterTypes.indexOf(type) !== -1);
            }
        }

        return offers;
    }

    /**
     * fetchPrice - fetches the price dynamically
     * @param {object} data contains update price, currency from api
     * @param {string} priceSolrUrl url update with cruiseId and itineraryId options
     * @param {boolean} priceFromApi true by default so that filterZeroPrice will be added in url
     */
    fetchPrice = (data, priceSolrUrl, priceFromApi = true) => {

        const {
            image,
            navigateToSearchResult,
            searchPageFilterURL,
            services,
            labels,
            specialOffersList,
            dayLabel,
            nightLabel,
            from,
            primaryCta: defaultPrimaryCta,
            priceSolrUrl: defaultPriceSolrUrl
         } = this.newProps;

        const sortParam = '&sort=price_{{currencyCode}}_anonymous asc,departDate asc'.replace('{{currencyCode}}', this.currencyCode);
        let filterZeroPrice = '';

        if ( priceFromApi ) {
            filterZeroPrice = `&fq=price_${this.currencyCode}_anonymous:[1 TO *]`;
        }

        fetchData(`${services.urls.recentlyViewed}?${ priceSolrUrl || defaultPriceSolrUrl }${ sortParam }${ filterZeroPrice }`).then(response => {
            let [ itineraryData ] = response.itineraryTiles,
                price = this.getLowestPrice(itineraryData),
                {
                    currencyCode: currency,
                    currencySymbol: symbol
                } = this.currencyData,
                userType = this.campaigns.filter((campaign, index) => parseFloat(itineraryData[`price_${currency}_${campaign}`]) === price)[0],
                {
                    title: itineraryTitle,
                    description,
                    roomTypeName,
                    itineraryURL,
                    serviceChargeLabel = '',
                    portCharges,
                    serviceCharges,
                    documents,
                    duration,
                    departurePortName,
                    destinationNames,
                    departureDate,
                    [`offerNames_${currency}_${userType}`]: offerNames,
                    [`tax_${currency}_${userType}`]: tax,
                    [`taxesAndFeesCombined_${currency}_${userType}`]: taxesAndFeesCombined,
                    [`packageType_${currency}_${userType}`]: packageType,
                    [`fare_${currency}_${userType}`]: fare,
                    [`classification_${currency}_${userType}`]: classification,
                    [`airportName_${currency}_${USER}`]: airportName = ''
                } = itineraryData,
                airportData = {},
                flight,
                nightCountryCodes = typeof window !== 'undefined' && window.configs && window.configs.countryCodes ? window.configs.countryCodes.replace(/\s/g, '').split(',') : [],
                durationLabel = currency && nightCountryCodes.indexOf(currency) !== -1 ?  nightLabel : dayLabel,
                primaryCta = Object.assign({}, defaultPrimaryCta),
                title,
                promoCodes = offerNames ? offerNames.map(offer => offer.id) : [],
                offers = [];

            this.itineraryURL = cleanURL( itineraryURL );

            if (data) {
                price = data.price;
                portCharges = data.portCharges;
                serviceCharges = data.serviceCharges;
                tax = data.tax;
                flight = data.flight,
                taxesAndFeesCombined = data.taxesAndFeesCombined !== undefined ? data.taxesAndFeesCombined : '';
                fare = data.fare;
                classification = data.classification;
                duration = data.duration;
                promoCodes = data.promoCodes || promoCodes;
            }

            offers = this.getOffers(fare, specialOffersList, promoCodes);
            roomTypeName = this.getRoomTypeName(classification, fare, roomTypeName);
            taxesAndFeesCombined = taxesAndFeesCombined !== '' ? taxesAndFeesCombined : response.itineraryTiles[0][`taxesAndFeesCombined_${currency}_${USER}`];
            primaryCta = Object.assign({}, this.props.primaryCta);
            primaryCta.url = navigateToSearchResult ? searchPageFilterURL : cleanURL( itineraryURL );
            if (labels && labels.serviceChargeLabel) {
                let priceData = this.getPriceServiceChargeForFR(price, serviceCharges, currency);

                serviceChargeLabel = this.getFormattedServiceCharges(this.props.labels.serviceChargeLabel, portCharges, priceData, currency);
                price = priceData.price;
            }

            if (taxesAndFeesCombined !== undefined ) {
                this.tfpeHtml = labels && labels.enableSegment === 'true' ? this.getTFPEHtml( currency, taxesAndFeesCombined, tax, symbol ) : labels.tfpeDefaultText;
            }
            else {
                this.tfpeHtml = labels.tfpeDefaultText;
            }
            let destinationDisplayTypeMapping = {
                    duration: `${duration}-${durationLabel}`,
                    port: `${from} ${departurePortName}`,
                    destination: destinationNames.length ? destinationNames[0] : '',
                    date: plainDateFormat(new Date(departureDate), 'll')
                },
                offerBanner = this.getOfferBanner(offers);

            itineraryTitle = this.props.destinationDisplayType ? this.props.destinationDisplayType.split('-').map(type => destinationDisplayTypeMapping[type]).join(' ') : itineraryTitle;
            title = this.props.title ? this.props.title : itineraryTitle;
            description = this.props.description ? this.props.description : description;

            if ( (flight && flight.flightRequired === 'true') || (!flight && airportName)) {
                airportData = {
                    flightRequired: true,
                    flightLabel: labels ?
                                (labels.flightIncludedLegalModelDescription ? labels.flightIncludedLegalModelDescription.replace('{{airport.name}}', airportName) : '') :
                                (labels.flightNotIncludedLegalModelDescription)
                };
            }
            else {
                airportData = {
                    flightRequired: false,
                    flightNotincludedLabel: labels ? labels.flightNotIncludedLegalModelDescription : ''
                };
            }
            if (portCharges) {
                portCharges.currencyCode = currency;
            }
            this.setState({
                packageType,
                price,
                currency,
                image,
                title,
                description,
                roomTypeName,
                serviceChargeLabel,
                primaryCta,
                serviceCharges,
                portCharges,
                documents,
                flight: airportData,
                isCardDetailAvailable: true,
                offerBanner
            });
        }).catch(this.hideCardTile);
    }

    getTFPEHtml( currency, taxesAndFeesCombined, tax, symbol ) {
        let replaceMarkup;

        tax = tax !== undefined ? tax : 0;
        if ( this.props.tfpeLabels && Object.keys(this.props.tfpeLabels).length !== 0 ) {
            if ( ( currency ) && (currency === 'USD' && taxesAndFeesCombined && taxesAndFeesCombined !== 'false') ) {
                tax = `${symbol}${tax}`;
                replaceMarkup = this.props.tfpeLabels && this.props.tfpeLabels.taxLabelFrUsdTourIdRVY.replace('{{tax}}', tax);
                replaceMarkup = replaceMarkup.split('{{currency}}').join(`${currency}${symbol}`);
            }
            else if ( currency  &&  ( currency === 'USD' || currency === 'CAD' ) ) {
                tax = `${symbol}${tax}`;
                replaceMarkup = this.props.tfpeLabels && this.props.tfpeLabels.taxLabelFrRestUsdOrCad.replace('{{tax}}', tax);
                replaceMarkup = replaceMarkup.split('{{currency}}').join(`${currency}${symbol}`);
            }
            else {
                replaceMarkup = this.props.tfpeLabels &&  this.props.tfpeLabels.taxLabelFrRestAll;
                replaceMarkup = replaceMarkup.split('{{currency}}').join(`${currency}${symbol}`);
            }
        }

        return replaceMarkup;
    }

    getPriceServiceChargeForFR = (price, serviceCharges, currencyCode) => {
        let appliedServiceCharge = 0;

        if (serviceCharges && serviceCharges.length && currencyCode) {
            if (serviceCharges.length > 1) {
                appliedServiceCharge = serviceCharges.filter(charges => charges.currency === currencyCode);
            }
            else {
                appliedServiceCharge = serviceCharges;
            }
            if (this.props.showServiceLabel) {
                price = parseFloat(price) + (appliedServiceCharge[0].totalAdultAmount ? parseFloat(appliedServiceCharge[0].totalAdultAmount) : 0);
            }

        }

        return {
            price,
            serviceCharges: appliedServiceCharge
        };
    }

    setSelectedOffer = (offers) => {
        analytics.clickTracking(this);
        const itineraryUrl = this.props.specialOffersDestination ? cleanURL( this.props.itineraryURL ) : this.itineraryURL;

        this.props.offersSelectionHandler(offers, itineraryUrl);
    }
    getOfferBanner(offers) {
        const {
                specialOfferOverlayShow,
                specialOffersList,
                labels,
                tileType,
                specialOffersDestination
            } = this.props;
        let banner;

        if (offers && offers.length) {
            banner = offers.length > 1 ? labels.multiOfferLabel : offers[0].name;
        }

        if (banner) {
            if ( ( tileType === 'query' || specialOffersDestination ) && (( specialOfferOverlayShow && specialOffersList )) ) {
                return <OffersRibbon className="offer-container" onClick={ () => this.setSelectedOffer(offers) } offerName={ banner }/>;
            }
            else {
                return <OffersRibbon className="offer-container" offerName={ banner }/>;
            }
        }
    }

    setSession = () => {
        analytics.clickTracking(this);
        if ( this.state.roomsDataDetails ) {

            sessionStorage.setItem('roomsData', this.state.roomsDataDetails);
        }
    }

    constructHeader = () => {
        let headers, headersWithUserInfo = {};

        if (isLoggedIn()) {
            headersWithUserInfo = {
                sessionToken: getLoginToken(),
                loyaltyNumber: getMarinerId()
            };
            headers = Object.assign(this.props.services.headers, headersWithUserInfo);
        }
        else {
            headers = this.props.services.headers;
        }

        return headers;
    }

    /**
     * getFlightData - To get the aitport details in LegalModal
     * @param {string} url dynamic flight url to get the flight data
     * @param {string} flightLabel Flight Included label for legal Modal
     * @param {string} gatewaycode Flight Gateway code for legal Modal
     */
    getFlightData = (url, flightLabel, gatewaycode) => {
        fetch(url, {
            headers: this.constructHeader()
        }).then((response) => {
            const { name } = response;

            flightLabel = flightLabel && flightLabel.replace('{{airport.name}}', name);

            return {
                flightRequired: true,
                airportName: name,
                flightLabel,
                gatewaycode
            };
        });
    }

    render() {
        let {
            index,
            textAlignment,
            showPackage,
            labels,
            from,
            heroStartingFromLabel,
            perPersonLabel,
            startingFromLabel,
            showTariff,
            inlinePrice,
            inlineCurrency,
            inlineTariff,
            showPrice = true,
            tileType,
            closeLabel,
            itineraryCtaCopy,
            showPriceInLegalModel,
            documents,
            portCharges,
            serviceCharges,
            hideLegalAccordion,
            showOfferBanner = false,
            specialOffersDestination,
            currencyCode,
            showVisitingCountries,
            visitingCountries
        } = this.props;

        let {
            price,
            currency,
            title,
            description,
            image,
            packageType,
            offerBanner,
            roomTypeName,
            serviceChargeLabel,
            primaryCta,
            isCardDetailAvailable,
            flight
        } = this.state;

        if (tileType === 'inline') {
            price = inlinePrice;
            currency = inlineCurrency;
            roomTypeName = inlineTariff;
        }

        if ( specialOffersDestination ) {
            currency = currencyCode;
        }

        showPrice = specialOffersDestination ? true : ((showPrice && /\d/.test(+price)) ? true : false);
        let fromLabel = specialOffersDestination ? labels.fromLabel : (heroStartingFromLabel ? heroStartingFromLabel : fromLabel);

        startingFromLabel = startingFromLabel ? startingFromLabel : null;

        /* Show the tfpeLabel wherever we are showing price */
        if (showPrice) {
            this.tfpeHtml = this.tfpeHtml ? this.tfpeHtml : labels.tfpeDefaultText;
        }

        const cardProps = {
            image,
            imageLink: {
                ...primaryCta,
                title,
                dataLinktext: index !== undefined ? `${title}:${index + 1}:${ image ? image.alt : ''}` : `${title}:${image ? image.alt : ''}`,
                dataContentname: image ? image.alt : '',
                dataContenttype: 'image'
            },
            banner: offerBanner,
            contentBannerLabel: (showPackage && packageType) ? ( this.props[packageType] ? this.props[packageType] : this.props.labels[packageType] ) : '',
            contentBannerClass: `package-name ${packageType}`,
            showOfferBanner,
            title,
            titleLink: {
                ...primaryCta,
                title,
                dataClicktype: 'general',
                dataLinktext: title
            },
            description: ( showVisitingCountries && visitingCountries ) ? visitingCountries : description,
            ctaProps: {}
        };

        if ( specialOffersDestination && flight && flight.flightRequired ) {
            let { airportDetails } = this.props.services && this.props.services.urls;

            airportDetails = airportDetails && airportDetails.replace('{airportId}', flight.gatewaycode);
            flight = this.getFlightData(airportDetails, labels.flightIncludedLegalModelDescription, flight.gatewaycode);
        }
        else if ( specialOffersDestination && flight && !flight.flightRequired ) {
            flight = {
                flightRequired: false,
                flightNotincludedLabel: labels && labels.flightNotIncludedLegalModelDescription
            };
        }

        const legalModalData = {
            closeLabel: specialOffersDestination ? labels.closeLabel : closeLabel,
            contentLabel: specialOffersDestination ? labels.itineraryCtaCopy : itineraryCtaCopy,
            dynamicData: showPriceInLegalModel && ( specialOffersDestination ? { documents, portCharges, serviceCharges, flight } : this.state ),
            hideLegalAccordion: hideLegalAccordion
        };

        return isCardDetailAvailable ? (
            <Card  { ...cardProps } className={`destination-tile-card ${textAlignment === 'center' ? ' content-align-center' : ' content-align-left'}`}>
                <div ref={terms => this.terms = terms }>
                    <div className='cta-content'>
                        { showPrice &&
                            <Price
                                fromLabel = {from}
                                price = {price}
                                currency = {currency}
                                perPersonLabel = {perPersonLabel}
                                startingFromLabel={startingFromLabel}
                                termsAndConditionsText={labels ? this.tfpeHtml : ''}
                                legalModalData = { legalModalData }
                            />
                        }
                        <div className='cta-block'>
                            { (showTariff && roomTypeName) &&
                                <div className='room-type'>{roomTypeName}</div>
                            }
                            {primaryCta.url ?
                                <Link
                                    {...primaryCta}
                                    title={title}
                                    linkClassName={`secondary-cta ${!(showTariff && roomTypeName) && 'single'}`}
                                    ariaLabel={`${title} ${primaryCta.label}`}
                                    dataClicktype={`general`}
                                    dataLinktext={index !== undefined ? `${title}:${index + 1}:${primaryCta.label}` : `${title}:${primaryCta.label}`}
                                    onClick={this.setSession}
                                    allowDefault={true}/>
                                :
                                <Link
                                    ariaLabel={`${title}, ${primaryCta.label}`}
                                    url={'javascript:void(0)'} {...primaryCta}
                                    title={title}
                                    dataLinktext={index !== undefined ? `${title}:${index + 1}:${primaryCta.label}` : `${title}:${primaryCta.label}`}
                                    linkClassName={`secondary-cta ${!(showTariff && roomTypeName) && 'single'}`}
                                    onClick={this.setSession} />
                            }
                        </div>
                    </div>
                    {serviceChargeLabel && <div className="panel-text">{serviceChargeLabel}</div>}
                </div>
            </Card>
        ) : null;
    }

    hideCardTile = () => {
        this.setState({
            isCardDetailAvailable: false
        });
    }

    handleLegalModal = bool => {
        this.setState({
            showLegalModal: bool
        });
    }

    componentDidMount() {
        if (this.props.tileType === 'query' && (!(this.props.showOfferBanner || this.props.showTariff) || (this.props.specialOffersList && Object.keys(this.props.specialOffersList).length > 0))) {
            ( this.props.paxType || this.props.offerCode ) ? this.fetchPriceFromApi() : this.fetchPrice();
        }
        if ( this.props.specialOffersDestination ) {
            const { portCharges, serviceCharges, labels, imageObj, itineraryURL, lowestPrice = {}, specialOffersList, cruiseCode, currencyCode, loyaltyTier, fetchDetailsBasedOnFare } = this.props;
            const primaryCta = {
                label: labels.seeDetailsLabel,
                url: cleanURL( itineraryURL ),
                isExternal: false
            };
            let promoCodes = lowestPrice ? lowestPrice.promoCodes : this.props[`offerNames_${this.props.currencyCode}_${this.props.loyaltyTier}`];
            const roomTypeName = this.getRoomTypeName(lowestPrice && lowestPrice.classification, lowestPrice && lowestPrice.fare, this.props[`roomTypeName_${this.props.currencyCode}_${this.props.loyaltyTier}`]);
            const offers = this.getOffers(lowestPrice && lowestPrice.fare, specialOffersList, promoCodes);
            const offerBanner = offers && this.getOfferBanner(offers);
            let  serviceChargeLabel = labels.serviceChargeLabel;
            let price;

            if (portCharges) {
                portCharges.currencyCode = currencyCode;
            }

            price = fetchDetailsBasedOnFare ? this.props.price : this.props[`price_${currencyCode}_${loyaltyTier}`];

            if ( labels && labels.serviceChargeLabel) {
                let priceData = this.getPriceServiceChargeForFR(price, serviceCharges, currencyCode);

                serviceChargeLabel = this.getFormattedServiceCharges(labels.serviceChargeLabel, portCharges, priceData, currencyCode);
                price = priceData.price;
            }

            const {
                fare,
                classification,
                category
            } = lowestPrice;

            const roomsDataDetails = {
                cruiseCode,
                classification,
                rateCode: fare,
                categoryCode: category
            };

            this.setState({
                primaryCta,
                serviceChargeLabel,
                roomTypeName,
                offerBanner,
                roomsDataDetails,
                portCharges,
                lowestPrice,
                price,
                image: imageObj,
                packageType: this.props[`packageType_${currencyCode}_${loyaltyTier}`]
            });

            const { currency, symbol } = getPriceInformation(this.props);
            const tax = this.props.labels.enableSegment === 'true' ? this.props[`taxExpenses_${this.props.currencyCode}_${this.props.loyaltyTier}`] : null;
            const taxesAndFeesCombined = this.props.labels.enableSegment === 'true' ? this.props[`taxesAndFeesCombined_${this.props.currencyCode}_${this.props.loyaltyTier}`] : null;

            this.tfpeHtml = this.props.labels && this.props.labels.enableSegment === 'true' ? this.getTFPEHtml( currency, taxesAndFeesCombined, tax, symbol ) : this.props.labels.tfpeDefaultText;

        }
    }
}

HotelCard.propTypes = {
    image: PropTypes.object.isRequired,
    title: PropTypes.string,
    description: PropTypes.string,
    primaryCta: PropTypes.shape({
        label: PropTypes.string,
        url: PropTypes.string,
        isExternal: PropTypes.bool
    })
};

export default HotelCard;
