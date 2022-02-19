'use strict';

import React from 'react';
import EntertainmentTiles from '../entertainmentTiles';
import NotificationBanner from '../../components/notificationBanner';

import { calculateAge, calculateDiffDays } from '../commons/CUK/dateFormat';
import FetchData from '../commons/CUK/fetch-data';
import SessionStorage from '../commons/CUK/session-storage';
import extractChildComponent from '../commons/CUK/extractChildComponent';
import analytics from '../commons/CUK/analytics';
import { getConfig, generateUniqueCode } from '../commons/CUK/utilities';
import moment from 'moment';

class entertainmentCardList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            purchasable: false,
            isTooLate: false,
            minorAgeCustomer: false,
            products: {},
            isNewSpaDetailTypeActive: true,
            customer: {},
            loadMore: 2,
            cardLoadonloadMore: 1
        };
        this.showMoreEvents = this.showMoreEvents.bind(this);
        debugger;
    }

    componentDidMount() {
        const { isNewSpaDetailTypeActive } = this.state;
        const brand = getConfig('brand', '');
        this.getProductsList();
    }

    showMoreEvents(e) {
        e.preventDefault();
        this.setState({
            loadMore: this.state.loadMore + this.state.cardLoadonloadMore
        });
    }
    /**
     * getProductList - API call to get the product instances
     */
    getProductsList() {
        console.log('props on entertainment card list', this.props);
        const apikeyMycruise = getConfig('apikeyMycruise', '');
        const { services, productDetailServlet, heroVariation } = this.props;
        const { brand } = services.headers;
        const { eventListApi, solarApi } = services.urls;
        const header = SessionStorage.getItem('header');
        const { customer } = header;

        const cruiseData = SessionStorage.getItem('cruiseData');
        const eventCategory = SessionStorage.getItem('eventCategory');
        header.passengers.forEach((passenger) => {
            if (customer.PaxNumber == passenger.paxNumber) {
                customer['guestId'] = passenger.guestId;
            }
        });
        const config = typeof window !== 'undefined' ? window.configs : '';
        const customCurrencyCode =
            config.brand.toLowerCase() === 'po' ? 'gbp' : 'usd';
        const { embarkationDate } = header;
        const API = `${eventListApi}/ship/${header.shipCode}`;
        const SolarAPI = `${solarApi}/${config.brand}_${
            config.locale
        }/select?fq=`;

        const servlet = eventListApi;
        const currentDate = new Date();
        const embarkationEndDate = new Date(header.disembarkationDate);
        const startDate = `${currentDate.getFullYear()}${(
            currentDate.getMonth() + 1
        )
            .toString()
            .padStart(2, '0')}${currentDate
            .getDate()
            .toString()
            .padStart(2, '0')}${currentDate
            .getHours()
            .toString()
            .padStart(2, '0')}${currentDate
            .getMinutes()
            .toString()
            .padStart(2, '0')}${currentDate
            .getSeconds()
            .toString()
            .padStart(2, '0')}`;

        const endDate = `${embarkationEndDate.getFullYear()}${(
            embarkationEndDate.getMonth() + 1
        )
            .toString()
            .padStart(2, '0')}${embarkationEndDate
            .getDate()
            .toString()
            .padStart(2, '0')}${embarkationEndDate
            .getHours()
            .toString()
            .padStart(2, '0')}${embarkationEndDate
            .getMinutes()
            .toString()
            .padStart(2, '0')}${embarkationEndDate
            .getSeconds()
            .toString()
            .padStart(2, '0')}`;
        debugger;
        const url = brand === 'po' ? API : servlet;

        const requestBody = {
            data: {
                startDateTime: startDate, //'20210401170800',
                endDateTime: endDate, //'20210530170800',
                guests: [customer.guestId],
                partySize: 1,
                numberOfWheelchairsInParty: 0,
                venueCodes: [],
                types: [],
                categories: [`${eventCategory}`]
                // categories: ['RECEPTION']
            }
        };
        const requestHeaders = {
            'Content-Type': 'application/json',
            'X-Source-Identity-Token-0': apikeyMycruise
        };
        return FetchData(url, {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: requestHeaders
        }).then((res) => {
            debugger;
            res = {
                success: 'true',
                data: [
                    {
                        events: [
                            {
                                venueCode: 'BR_DESK_RECEP',
                                venueName: 'Reception Desk',
                                eventId: '105512996',
                                eventCode: null,
                                eventName: 'Reception Desk',
                                description: null,
                                startDateTime: '20210507000000',
                                endDateTime: '20210507235900',
                                type: 'EVENT',
                                partySize: 1,
                                numberOfWheelchairsInParty: 0,
                                allowReservation: 'false',
                                allowWaitlist: 'true',
                                allowStandBy: 'false',
                                categories: ['RECEPTION'],
                                inventory: [
                                    {
                                        availability: '20210507000000',
                                        status: 'Available',
                                        capacity: ['1']
                                    }
                                ],
                                queuePosition: '0',
                                queueRemaining: '0'
                            },
                            {
                                venueCode: 'BR_DESK_RECEP',
                                venueName: 'Reception Desk',
                                eventId: '105512997',
                                eventCode: null,
                                eventName: 'Reception Desk',
                                description: null,
                                startDateTime: '20210507000000',
                                endDateTime: '20210507235900',
                                type: 'EVENT',
                                partySize: 1,
                                numberOfWheelchairsInParty: 0,
                                allowReservation: 'false',
                                allowWaitlist: 'true',
                                allowStandBy: 'false',
                                categories: ['RECEPTION'],
                                inventory: [
                                    {
                                        availability: '20210507000000',
                                        status: 'Available',
                                        capacity: ['1']
                                    }
                                ],
                                queuePosition: '0',
                                queueRemaining: '0'
                            },
                            {
                                venueCode: 'BR_DESK_RECEP',
                                venueName: 'Reception Desk',
                                eventId: '105512998',
                                eventCode: null,
                                eventName: 'Reception Desk',
                                description: null,
                                startDateTime: '20210507000000',
                                endDateTime: '20210507235900',
                                type: 'EVENT',
                                partySize: 1,
                                numberOfWheelchairsInParty: 0,
                                allowReservation: 'false',
                                allowWaitlist: 'true',
                                allowStandBy: 'false',
                                categories: ['RECEPTION'],
                                inventory: [
                                    {
                                        availability: '20210507000000',
                                        status: 'Available',
                                        capacity: ['1']
                                    }
                                ],
                                queuePosition: '0',
                                queueRemaining: '0'
                            },
                            {
                                venueCode: 'BR_DESK_RECEP',
                                venueName: 'Reception Desk',
                                eventId: '105512999',
                                eventCode: null,
                                eventName: 'Reception Desk',
                                description: null,
                                startDateTime: '20210507000000',
                                endDateTime: '20210507235900',
                                type: 'EVENT',
                                partySize: 1,
                                numberOfWheelchairsInParty: 0,
                                allowReservation: 'false',
                                allowWaitlist: 'true',
                                allowStandBy: 'false',
                                categories: ['RECEPTION'],
                                inventory: [
                                    {
                                        availability: '20210507000000',
                                        status: 'Available',
                                        capacity: ['1']
                                    }
                                ],
                                queuePosition: '0',
                                queueRemaining: '0'
                            }
                        ]
                    }
                ]
            };

            if (res.success === 'true') {
                if (res.data[0].events) {
                    //ship events found in list
                    const { events } = res.data[0];
                    let solarRequest = '';
                    events.map((e, i) => {
                        solarRequest +=
                            +i !== events.length - 1
                                ? `code:${e.eventCode} OR `
                                : `code:${e.eventCode}`;
                    });
                    solarRequest = `${SolarAPI}(${solarRequest} )`;
                    // console.log('solarRequest---->', solarRequest);

                    let solarResult = [
                        {
                            code: '105512996',
                            title: 'Joker (2019)',
                            description:
                                'In Gotham City, mentally troubled comedian Arthur Fleck is disregarded and mistreated by society. He then embarks on a downward spiral of revolution and bloody crime. This path brings him face-to-face with his alter-ego; the Joker',
                            portalDescription:
                                'In Gotham City, mentally troubled comedian Arthur Fleck is disregarded and mistreated by society.',
                            thumbnailImage:
                                '/content/dam/cunard/inventory-assets/events/EVENT_001/Joker.jpg.image.466.466.high.jpg',
                            bannerImage:
                                '/content/dam/cunard/inventory-assets/events/EVENT_001/Joker.jpg',
                            deck: '2D',
                            deckPlan:
                                '/content/dam/po/my-cruise/dining/select-dining-events/Sindhu-deckPlan.pdf',
                            location: 'Lvel 2',
                            availableOnMyCruise: true,
                            availableOnPortal: true,
                            lastPublished: '2016-08-29T09:12:33.001Z'
                        },
                        {
                            code: '105512997',
                            title: 'Joker (2019)',
                            description:
                                'In Gotham City, mentally troubled comedian Arthur Fleck is disregarded and mistreated by society. He then embarks on a downward spiral of revolution and bloody crime. This path brings him face-to-face with his alter-ego; the Joker',
                            portalDescription:
                                'In Gotham City, mentally troubled comedian Arthur Fleck is disregarded and mistreated by society.',
                            thumbnailImage:
                                '/content/dam/cunard/inventory-assets/events/EVENT_001/Joker.jpg.image.466.466.high.jpg',
                            bannerImage:
                                '/content/dam/cunard/inventory-assets/events/EVENT_001/Joker.jpg',
                            deck: '2D',
                            deckPlan:
                                '/content/dam/po/my-cruise/dining/select-dining-events/Sindhu-deckPlan.pdf',
                            location: 'Lvel 2',
                            availableOnMyCruise: true,
                            availableOnPortal: true,
                            lastPublished: '2016-08-29T09:12:33.001Z'
                        },
                        {
                            code: '105512998',
                            title: 'Joker (2019)',
                            description:
                                'In Gotham City, mentally troubled comedian Arthur Fleck is disregarded and mistreated by society. He then embarks on a downward spiral of revolution and bloody crime. This path brings him face-to-face with his alter-ego; the Joker',
                            portalDescription:
                                'In Gotham City, mentally troubled comedian Arthur Fleck is disregarded and mistreated by society.',
                            thumbnailImage:
                                '/content/dam/cunard/inventory-assets/events/EVENT_001/Joker.jpg.image.466.466.high.jpg',
                            bannerImage:
                                '/content/dam/cunard/inventory-assets/events/EVENT_001/Joker.jpg',
                            deck: '2D',
                            deckPlan:
                                '/content/dam/po/my-cruise/dining/select-dining-events/Sindhu-deckPlan.pdf',
                            location: 'Lvel 2',
                            availableOnMyCruise: true,
                            availableOnPortal: true,
                            lastPublished: '2016-08-29T09:12:33.001Z'
                        },
                        {
                            code: '105512999',
                            title: 'Joker (2019)',
                            description:
                                'In Gotham City, mentally troubled comedian Arthur Fleck is disregarded and mistreated by society. He then embarks on a downward spiral of revolution and bloody crime. This path brings him face-to-face with his alter-ego; the Joker',
                            portalDescription:
                                'In Gotham City, mentally troubled comedian Arthur Fleck is disregarded and mistreated by society.',
                            thumbnailImage:
                                '/content/dam/cunard/inventory-assets/events/EVENT_001/Joker.jpg.image.466.466.high.jpg',
                            bannerImage:
                                '/content/dam/cunard/inventory-assets/events/EVENT_001/Joker.jpg',
                            deck: '2D',
                            deckPlan:
                                '/content/dam/po/my-cruise/dining/select-dining-events/Sindhu-deckPlan.pdf',
                            location: 'Lvel 2',
                            availableOnMyCruise: true,
                            availableOnPortal: true,
                            lastPublished: '2016-08-29T09:12:33.001Z'
                        }
                    ];

                    let result = events.map((obj) => {
                        let data = solarResult.find(
                            (item) => item.code === obj.eventId
                        );
                        return { ...obj, ...data };
                    });
                    res = result;
                    console.log('result==>', JSON.stringify(result));

                    debugger;
                } else {
                    //no record found in particular category
                }
                const treatments = res;
            } else {
                //API error
            }
            const treatments = res;
            const newTreatments = treatments.map((treatment) => {
                const image = {
                    alt: treatment.title,
                    0: {
                        '1x': `https://sit.my-np.pocruises.com${
                            treatment.thumbnailImage
                        }.image.440.330.low.jpg`,
                        '2x': `https://sit.my-np.pocruises.com${
                            treatment.thumbnailImage
                        }.image.880.660.low.jpg`
                    },
                    376: {
                        '1x': `https://sit.my-np.pocruises.com${
                            treatment.thumbnailImage
                        }.image.440.330.medium.jpg`,
                        '2x': `https://sit.my-np.pocruises.com${
                            treatment.thumbnailImage
                        }.image.880.660.medium.jpg`
                    },
                    769: {
                        '1x': `https://my.pocruises.com/content/dam/po/my-cruise/spa/treatments/oasis_1095074_ELEMIS_R3_Total_Body_90min_iStock-1133527730-5.jpg`,
                        '2x': `https://my.pocruises.com/content/dam/po/my-cruise/spa/treatments/oasis_1095074_ELEMIS_R3_Total_Body_90min_iStock-1133527730-5.jpg`
                    }
                };
                treatment['image'] = image;
                return treatment;
            }, {});

            // analytics.setAdditionalPageTrackAttributes({
            //     myCruiseDetails: {
            //         bookingNumber: header.bookingRef,
            //         voyageID: header.cruiseCode,
            //         voyageName: cruiseData.cruiseName,
            //         shipName: cruiseData.shipName,
            //         depDate: header.embarkationDate,
            //         destName: '',
            //         durationDays: header.physicalCruiseDuration,
            //         depPortName: cruiseData.embarkPort,
            //         destPortName: cruiseData.disembarkPort,
            //         stateroomType: '',
            //         numGuests: header.passengers.length,
            //         dob: dobArray
            //     },
            //     loginStatus: 'logged in',
            //     loginType: header.agent ? header.agent.agentType : 'customer',
            //     AgentID: header.agent ? header.agent.id : '',
            //     crmID: '',
            //     country: header.market,
            //     languageSelected: header.language.substring(0, 2),
            //     customCurrencyCode: customCurrencyCode,
            //     memberLoyaltyLevel: header.customer.loyaltyTier,
            //     server: '',
            //     localDayTime: new Date().toString(),
            //     timePartingCodes: '',
            //     pageType: config.pageName,
            //     //Please refer Page and Content Hierarchy Tabs for below values
            //     sectionLevelOne: '',
            //     sectionLevelTwo: '',
            //     sectionLevelThree: '',
            //     sectionLevelFour: '',
            //     pageName: config.pageName,
            //     pageChannel: '',
            //     pageHier: '',
            //     //Please refer Page and Content Hierarchy Tabs for above values
            //     ecomStep: '',
            //     event: 'prodView',
            //     myCruiseProduct: {
            //         status: '',
            //         productID: productIdForAnalytics,
            //         productName: '',
            //         productType: 'spa',
            //         startDateTime: '',
            //         unitSalePrice_GBP: '',
            //         unitPrice_GBP: '',
            //         unitSalePrice_local: '',
            //         unitPrice_local: '',
            //         shorexAttributes: {
            //             portName: '',
            //             language: '',
            //             activityLevel: '',
            //             duration: '',
            //             transport: '',
            //             minAge: '',
            //             maxAge: '',
            //             tourType: [''],
            //             tourCategory: '',
            //             tourFeatures: ''
            //         },
            //         diningCategory: '',
            //         unitPriceChild_GBP: '',
            //         unitPriceChild_local: '',
            //         skus: skusArr
            //     }
            // });

            this.setState(
                () => ({
                    products: newTreatments,
                    embarkationDate
                }),
                () => Promise.resolve
            );
            debugger;
        });
    }

    renderNewSpaComponent = (product, index) => (
        <div className="entertainment-detail-tile tile-detail" key={index}>
            <EntertainmentTiles
                {...product}
                key={index}
                index={index}
                labels={this.props.labels}
                services={this.props.services}
                newType={true}
            />
        </div>
    );

    render() {
        const { childComponents, services, heroVariation } = this.props;
        const { brand } = services.headers;
        const {
            products,
            minorAgeCustomer,
            chosenProduct,
            isNewSpaDetailTypeActive
        } = this.state;
        const notificationBannerProps = extractChildComponent(
            childComponents,
            'notificationBanner'
        );
        const theProducts = Object.values(products);

        return (
            <div>
                {minorAgeCustomer && (
                    <NotificationBanner
                        {...notificationBannerProps.attributes}
                    />
                )}
                {isNewSpaDetailTypeActive && (
                    <div className="entertainment-tiles-container">
                        <div className="tiles-container">
                            {theProducts.length > 0 &&
                                theProducts
                                    .slice(0, this.state.loadMore)
                                    .map(this.renderNewSpaComponent)}
                        </div>
                        {theProducts.length &&
                        this.state.loadMore < theProducts.length ? (
                            <div className="cta-container">
                                <a
                                    onClick={this.showMoreEvents}
                                    href="/#"
                                    className="cta-primary"
                                    data-linktext={
                                        'label: ' + this.props.labels.loadMore
                                    }
                                >
                                    {this.props.labels.loadMore}
                                </a>
                            </div>
                        ) : (
                            ''
                        )}
                    </div>
                )}
            </div>
        );
    }
}

entertainmentCardList.defaultProps = {
    contentLabel: 'entertainmentCardList'
};

export default entertainmentCardList;
