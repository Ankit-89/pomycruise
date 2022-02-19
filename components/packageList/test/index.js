import React from 'react';
import { mount } from 'enzyme';
import PackageList from '../index';
import PackageComponent from '../packageComponent';
import data from '../data/po';

describe('<PackageList />', () => {
    let wrapper;
    const customData = data.attributes;
    const services = data.services;

    beforeEach(() => {
        wrapper = mount(<PackageList {...customData} services={services} />);
    });

    test('Should mount without problems ', () => {
        expect(wrapper.length).toEqual(1);
    });
    test('Should output a <PackageComponent /> component', () => {
        wrapper.setState({
            apiCalled: true,
            products: [
                {
                    primaryImageUrl:
                        'http://bitcarnival.s3.amazonaws.com/pno/img/cards/card-1.jpg',
                    availableForAdults: true,
                    availableForChildren: true,
                    availableForInfants: true,
                    baseProduct: 'ALL_INCLUSIVE_BEVERAGE_KIDS',
                    code: 'ALL_INCLUSIVE_BEVERAGE_KIDS',
                    description:
                        'Description of allInclusiveBeverage for testing facets <ul><li>Prodotto 1</li><li>Prodotto 2</li><li>Prodotto 3</li><li>Prodotto 4</li></ul>',
                    fromPrice: {
                        currencyIso: 'GBP',
                        value: 121
                    },
                    name:
                        'allInclusiveBeverage of kids testing departure facets',
                    productType: 'AIBEVERAGE',
                    stock: {
                        stockLevel: 2147483647,
                        stockLevelStatus: 'inStock'
                    },
                    url: '/PO-Site/products/ALL_INCLUSIVE_BEVERAGE_KIDS'
                }
            ]
        });
        expect(wrapper.find(PackageComponent).length).toBeGreaterThan(0);
    });
});
