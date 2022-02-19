import React from 'react';
import { mount, shallow } from 'enzyme';
import MediaGallery from '../index';
import MediaTiles from '../../commons/CUK/mediaTiles';
import data from '../data/po';

describe('<MediaGallery />', () => {
    let wrapper;
    const customData = data.attributes;

    beforeEach(() => {
        wrapper = mount(<MediaGallery {...customData} />);
    });

    test('Should mount without problems ', () => {
        expect(wrapper.length).toEqual(1);
    });

    test('Should output a <MediaTiles /> component', () => {
        expect(wrapper.find(MediaTiles).length).toEqual(1);
    });
});
