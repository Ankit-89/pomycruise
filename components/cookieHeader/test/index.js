import React from 'react';
import { mount } from 'enzyme';
import AlertMessaging from '../index';
import Alert from '../alert';
import data from '../data/hal';

describe('<AlertMessaging/>', () => {

    const customData = {
        'alertIcon': 'true',
        'alertMessage': '<p>Alert1</p>',
        'alertStartDate': '1504263183000',
        'alertEndDate': '4070908800000',
        'alertType': 'siteWise',
        'closeLabel': 'CLOSE',
        'templateList': [
            '/apps/carnival/platform/templates/destinationDetailPageTemplate',
            '/apps/carnival/platform/templates/searchResultsPageTemplate'
        ],
        'destinationList': [
            '/content/costa/master_content/it_IT/destinations/CA',
            '/content/costa/master_content/it_IT/destinations/PG',
            '/content/costa/master_content/it_IT/destinations/IO'
        ],
        'portList': [
            '/content/costa/master_content/it_IT/ports/AAR',
            '/content/costa/master_content/it_IT/ports/ANU'
        ],
        'countryList': [
            '/content/costa/master_content/it_IT/countries/AUT',
            '/content/costa/master_content/it_IT/countries/AFG'
        ]
    };

    const customAlertData = {
        'alertIcon': 'true',
        'alertMessage': '<p>Alert1<a href="#" class="al-msg">alert message</a></p>',
        'alertStartDate': '1504263183000',
        'alertEndDate': '4070908800000',
        'alertType': 'cookie',
        'closeLabel': 'CLOSE',
        'templateList': [ '/content.html' ]
    };

    const customAlertDisabledData = {
        'alertIcon': 'true',
        'alertMessage': '<p>Alert1</p>',
        'alertType': 'cookie',
        'closeLabel': 'CLOSE',
        'templateList': [ '/content.html' ]
    };

    const response = {
        'alerts': [ customData ]
    };

    const alertData1 = [
        {
            'id': 1,
            'enableAlertIcon': 'true',
            'closeLabel': 'Chiudi',
            'alertMessage': '<p>Destination alert message here.</p>\r\n',
            'alertStartDate': '1558072789000',
            'alertEndDate': '1559072789000',
            'alertType': 'template',
            'templateList': [
                '/apps/carnival/platform/templates/destinationDetailPageTemplate',
                '/apps/carnival/platform/templates/searchResultsPageTemplate'
            ],
            'destinationList': [
                '/content/costa/master_content/it_IT/destinations/CA',
                '/content/costa/master_content/it_IT/destinations/PG',
                '/content/costa/master_content/it_IT/destinations/IO'
            ],
            'portList': [
                '/content/costa/master_content/it_IT/ports/AAR',
                '/content/costa/master_content/it_IT/ports/ANU'
            ],
            'countryList': [
                '/content/costa/master_content/it_IT/countries/AUT',
                '/content/costa/master_content/it_IT/countries/AFG'
            ],
            'continent': [],
            'country': []
        }
    ];

    const filteredAlertObjectArray = [ customData ];

    let wrapper;
    let alertWrapper;
    let setHeaderMargin = jest.fn();

    beforeEach(() => {

        wrapper = mount(<AlertMessaging {...data} />);
        alertWrapper = mount( <Alert { ...customAlertData} setDynamicHeaderMargin={setHeaderMargin}/> );
    });

    afterAll(() => {
        wrapper.unmount();
        alertWrapper.unmount();
    });

    test('Alert messaging component is rendered', () => {
        expect(wrapper.find('.alert-messaging-container').length).toEqual(1);
    });

    test('Check matchAlertMessage functionality', () => {
        wrapper.instance().setAlerts( filteredAlertObjectArray, response );
        expect(wrapper.state().filteredAlertObjectArray.length).toBeTruthy();
    });

    test('Check matchAlertMessage functionality', () => {
        customData.templateList = [];
        wrapper.instance().setAlerts( filteredAlertObjectArray, response );
        expect(wrapper.state().filteredAlertObjectArray.length).toBeTruthy();
    });

    test('Get Matched Country by path', () => {

        wrapper.instance().matchedCountryList(filteredAlertObjectArray, '/content/costa/master_content/it_IT/countries/AUT');
        expect(wrapper.state().entitySpecificAlertCount).toEqual(0);
    });

    test('Get Matched destination by path', () => {

        wrapper.instance().matchedDestinationList(filteredAlertObjectArray, '/content/costa/master_content/it_IT/destinations/CA');
        expect(wrapper.state().entitySpecificAlertCount).toEqual(0);
    });

    test('Get Matched port by path', () => {

        wrapper.instance().matchedPortList(filteredAlertObjectArray, '/content/costa/master_content/it_IT/ports/AAR');
        expect(wrapper.state().entitySpecificAlertCount).toEqual(0);
    });

    test('Filter alert against cookie id (used for Akamai country and continent)', () => {

        wrapper.instance().matchCookieId('country', 'countryCode', filteredAlertObjectArray);
        expect(wrapper.state().entitySpecificAlertCount).toEqual(0);
    });

    test('Filter the response and return the alert objects if current templatePath is present in anyone one of objects templateList', () => {

        wrapper.instance().matchAlertMessageList(response);
        expect(wrapper.state().entitySpecificAlertCount).toEqual(0);
    });

    test('Listen to search bar data Destination', () => {
        wrapper.setState({
            alertData: alertData1,
            entitySpecificAlertCount: 0,
            filteredAlertObjectArray
        });
        wrapper.instance().listenToSearchBarData( 'searchBar', { filterTagKey: '{!tag=destinationTag}destinationIds', param: 'PG' } );
        expect(wrapper.state().entitySpecificAlertCount).toEqual(1);
    });

    test('Listen to search bar data Port of call', () => {
        wrapper.setState({
            alertData: alertData1,
            entitySpecificAlertCount: 0,
            filteredAlertObjectArray
        });
        wrapper.instance().listenToSearchBarData( 'searchBar', { filterTagKey: '{!tag=portsTag}portsOfCall', param: 'ANU' } );
        expect(wrapper.state().entitySpecificAlertCount).toEqual(1);
    });

    test('Check component is calling handle Alert when not out of date', () => {
        expect(alertWrapper.state().alert).toEqual('enable');
    });

    test('Clicking on inline link does not change state', () => {
        let elem = alertWrapper.instance();

        jest.spyOn(elem, 'analyticsClickHandler');
        elem.alertCookieMessage.getElementsByTagName('a')[0].click({
            target: {
                textContent: 'alert cta'
            }
        });
        expect(alertWrapper.state().alert).toEqual('enable');
    });

    test('Check component is close calls handle Alert', () => {
        alertWrapper.find('.close').simulate('click');
        expect(alertWrapper.state().alert).toEqual('disable');
    });

    test('Is margin setting for alert-global-wrapper', () => {
        expect(setHeaderMargin).not.toHaveBeenCalled();
    });
    test('Is component getting closed on clicking the close button', () => {

        alertWrapper.setState({
            alert: 'enable'
        });

        alertWrapper.find('.close').first().simulate('click');
        expect(alertWrapper.state('alert')).toEqual('disable');
    });

    test('Check component is calling handle Alert when out of date', () => {
        let disabledAlert = mount(<Alert {...customAlertDisabledData} setDynamicHeaderMargin={setHeaderMargin} />);

        expect(disabledAlert.state().alert).toEqual('disable');
    });
});
