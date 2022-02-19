import React from 'react';
import { mount, ReactWrapper } from 'enzyme';
import ReactAriaModal from 'react-aria-modal';
import ArticleOverlay from '../index';

describe('<ArticleOverlay />', () => {
    let wrapper;
    let overlayLabels = {
        labels: {
            backToTopLabel: 'Back To Top',
            closeLabel: 'close'
        }
    };

    beforeEach(() => {
        wrapper = mount(
            <ArticleOverlay
                mounted={true}
                underlayClass="article--overlay"
                serviceUrl=""
                labels={overlayLabels}
                overlaySelector="content"
            />
        );
    });

    test('ArticleOverlay contains React aria modal', () => {
        expect(wrapper.find(ReactAriaModal).length).toEqual(1);
    });

    test('Click on close button close the overlay', () => {
        wrapper.setState({ entered: true });
        const portalWrapper = new ReactWrapper(
            wrapper.find(ReactModal).node.portal,
            true
        );

        portalWrapper.find('.close').simulate('click');
        window.setTimeout(() => {
            expect(wrapper.state().entered).toBe(false);
        }, 50);
    });
});
