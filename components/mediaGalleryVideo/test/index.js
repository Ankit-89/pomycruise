import React from 'react';
import { mount, shallow } from 'enzyme';
import MediaGalleryVideo from '../index';
import MediaTiles from '../../commons/CUK/mediaTiles';
import data from '../data/po';

describe('<MediaGalleryVideo />', () => {
    let wrapper;
    const customData = data.attributes;

    beforeEach(() => {
        wrapper = mount(<MediaGalleryVideo {...customData} />);
    });

    test('Should mount without problems ', () => {
        expect(wrapper.length).toEqual(1);
    });

    test('Should output a <MediaTiles /> component', () => {
        expect(wrapper.find(MediaTiles).length).toEqual(1);
    });
});
