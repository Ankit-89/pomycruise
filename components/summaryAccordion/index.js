'use strict';

import React from 'react';
import RoomItem from './roomItem';
import FetchData from '../commons/CUK/fetch-data';
import SessionStorage from '../commons/CUK/session-storage';
import ValidateSession from '../commons/CUK/validateSession';
import { getConfig } from '../commons/CUK/utilities';

// import './styles/index.css';
// import 'platform-theme/styles/components/summaryAccordion/index.css';

class summaryAccordion extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        if (!ValidateSession.checkCookie(['wcmmode'])) {
            this.getRoomItems();
        }
    }

    fetchCruiseSummary = () => {
        const {

        } = this.props;
        const apikeyMycruise = getConfig('apikeyMycruise', '');
        const userData = SessionStorage.getItem('userData');
        const {
            bookingRef,
            companyCode,
            customer: { firstName, lastName },
        } = userData;
        return fetchData(mycruiseSummaryApiUrl, {
            headers: {
                'X-Source-Identity-Token-0': apikeyMycruise
            }
        });
    };

    getRoomItems() {
        const { services } = this.props;
        const {
            mycruiseSummaryApiV1 = '/api-mc/mc-getCruiseSummary/v1',
            mycruiseItineraryApiV1 = '/api-mc/mc-getItinerary/v1',
        } = services.urls;
        const apikeyMycruise = getConfig('apikeyMycruise', '');
        const userData = SessionStorage.getItem('userData');
        const {
            bookingRef,
            customer: { firstName, lastName },
            companyCode,
            countryCode
        } = userData;

        const mycruiseSummaryApiUrl = `${mycruiseSummaryApiV1}?bookingRef=${bookingRef.toUpperCase()}&firstName=${firstName}&lastName=${lastName}&shipCode=${companyCode}`
        const mycruiseItineraryApiUrl = `${mycruiseItineraryApiV1}?bookingRef=${bookingRef.toUpperCase()}&firstName=${firstName}&lastName=${lastName}&shipCode=${companyCode}&countryCode=${countryCode}`
        let response = {};
        FetchData(mycruiseSummaryApiUrl, {
            method: 'GET',
            headers: {
                'X-Source-Identity-Token-0': apikeyMycruise
            }
        }).then((res) => {
            response = { ...res };
            FetchData(mycruiseItineraryApiUrl, {
                method: 'GET',
                headers: {
                    'X-Source-Identity-Token-0': apikeyMycruise
                }
            }).then((resData) => {
                response = { ...response, ...resData };
                this.resolveAPIData(response);
            })  
        });
    }

    resolveAPIData(res) {
        const { cabins, itineraryBooking, cruise } = res;
        const { cabinType, cabinCode } = SessionStorage.getItem('userData');
        const theCabin = cabins[0];
        const selectedBed = theCabin.beds.find(
            (bed) => bed.currentlyHeld === 'Y'
        );
        const cabin = {
            number: theCabin.number,
            deck: theCabin.deckNumber,
            roomAlignment: 'right',
            bed: selectedBed ? selectedBed.desc : '',
            type: cabinCode,
            number: theCabin.number
        };
        const deck = { position: itineraryBooking.cabinLuggageDoor };

        // call to servlet for missing info
        const { shipInfoServlet, deckInfoServlet } = this.props;
        const shipCode = cruise.ship.code.$;
        // const cabinCode = theCabin.typeCode.$;
        //get the deckNumber and remove leading zeroes, if any. This is one of the fixes for MCRSGLV-1474
        const deckCode = theCabin.deckNumber && theCabin.deckNumber.replace(/^0+/, '');
        const urlStringCabin = `${shipInfoServlet}.cabin.${shipCode}.${cabinType}.${cabinCode}.json`;
        const urlStringDeck = `${deckInfoServlet}.deckInfo.${shipCode}.${deckCode}.json`;
        let notAllocated = deckCode === 'GT' ? true : false;
        const dataPromises = [];
        dataPromises.push(
            FetchData(urlStringCabin, {
                method: 'GET'
            }).then((response) => {
                cabin.image = response.bedImage;
                cabin.marketDescription = response.cabinDesc;
                cabin.name = response.cabinName;
                cabin.area = response.area;
            })
        );
        dataPromises.push(
            FetchData(urlStringDeck, {
                method: 'GET'
            }).then((response) => {
                cabin.servicesIncluded = response.servicesIncluded;
                deck.title = response.title;
                deck.description = response.description;
                // deck.deckImage = response.deckImage;
                deck.deckDetailedImage = response.deckDetailedImage;
                deck.levelImage = response.levelImage;
                deck.sections = response.sections;

                // get json and image specific for the section
                const floorUrlObj = response.sections.find(
                    (section) =>
                        section.id === itineraryBooking.cabinLuggageDoor
                );

                deck.layoutUrl = floorUrlObj.deckJson;
                deck.deckImage = floorUrlObj.deckImage;
            })
        );

        Promise.all(dataPromises).then(() => {
            this.setState(() => ({
                roomItem: cabin,
                deckInfo: deck,
                notAllocated: notAllocated
            }));
        });
    }

    render() {
        const { /*hideAccordion,*/ labels } = this.props;
        const { roomItem, deckInfo, notAllocated } = this.state;
        // const roomItem = this.getRoomItems();
        return (
            <div className="state-room-acc-wrapper show-texture summaryAccordion">
                {/* {roomItems.map((roomTypes, i) => ( */}
                <div className="state-room-acc-container">
                    {roomItem &&
                        deckInfo && (
                            <RoomItem
                                roomTypes={roomItem}
                                deckInfo={deckInfo}
                                labels={labels}
                                notAllocated={notAllocated}
                            /*hideAccordion={hideAccordion}*/
                            />
                        )}
                </div>
                {/* ))} */}
            </div>
        );
    }
}

export default summaryAccordion;
