import React from 'react';
import { mount } from 'enzyme';
import DATA from '../data/mock-data';
import AllInclusiveOverlay from '../index';
import po from '../data/po';

describe('<AllInclusiveOverlay />', () => {
    let wrapper;
    const overlayProps = po.attributes;
    const products = DATA.products;
    const basePackageCode = DATA.aibDefaultKidsPackageCode;
    const passengers = DATA.passengers;
    const shortDescription = DATA.shortDescription;
    const title = DATA.title;
    const embarkDate = new Date(DATA.embarkationDate);

    beforeEach(() => {
        wrapper = mount(
            <AllInclusiveOverlay
                products={products}
                basePackageCode={basePackageCode}
                passengers={passengers}
                mounted={true}
                onExit={() => this.handleOverlay(false)}
                shortDescription={shortDescription}
                title={title}
                underlayClass="allinclusive-overlay"
                minAlcoholicAge={21}
                isAdultLogged={false}
                embarkDate={embarkDate}
                cruiseLength={21}
                services={overlayProps.services}
                labels={overlayProps.labels}
            />
        );
    });
    test('Should mount without problems', () => {
        expect(wrapper.length).toEqual(1);
    });

});
