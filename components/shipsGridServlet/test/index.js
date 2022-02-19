import React from 'react';
import { mount } from 'enzyme';
import ShipsGridServlet from '../index';
import data from '../data/po';

describe('<ShipsGridServlet />', () => {
    let wrapper;
    const customData = data.attributes;

    beforeEach(() => {
        wrapper = mount(<ShipsGridServlet {...customData} />);
    });

    test('ShipsGrid Servlet should render', () => {
        wrapper.setState({
            products: [
                {
                    venueType: 'mainDining',
                    additional: false,
                    overviewImage:
                        '/content/dam/po/po-asset/HomePage/aey-akureyri-port-1.jpg',
                    name: 'Ocean Grill',
                    description: '',
                    id: 'OG_OR',
                    bookableOnBoard: false,
                    url:
                        'https://www.aem-qa.pocruises.com/en-gb/mycruise/BR/dining-listing/OG_OR'
                }
            ]
        });
        expect(wrapper.length).toEqual(1);
    });
});
