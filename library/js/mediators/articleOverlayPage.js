'use strict';
// Modules
import '../modules/commonComponents';
import React from 'react';
import renderReact from '../utils/renderReact';
import { uniqBy } from 'lodash';
import validateSession from '../../../components/commons/CUK/validateSession';

// P&O Components
import articleHeader from '../../../components/articleHeader';
import titleAndParagraph from '../../../components/titleAndParagraph';
import titleAndLinks from '../../../components/titleAndLinks';
import singleVideo from '../../../components/singleVideo';
import imageAndText from '../../../components/imageAndText';

import 'postbooking-theme/styles/pages/articleOverlayPage/index.css';
import whatToWear from '../../../components/whatToWear';

const mediator = {
    init() {
        this.initUI();
        // this.handleRedirect();
    },

    initUI() {
        this.initReact();
    },

    handleRedirect() {
        if (
            validateSession.checkCookie(['wcmmode']) ||
            validateSession.checkSession(['userData'])
        ) {
            this.initUI();
        } else {
            if (typeof window !== 'undefined') {
                window.location.href = `${window.configs.mycruiseLoginPageUrl}`;
            }
        }
    },

    initReact() {
        const _COMPONENTS = {
            head: [],
            body: [
                { id: 'articleHeader', Component: articleHeader },
                { id: 'titleAndParagraph', Component: titleAndParagraph },
                { id: 'titleAndLinks', Component: titleAndLinks },
                { id: 'singleVideo', Component: singleVideo },
                { id: 'whatToWear', Component: whatToWear },
                { id: 'imageAndText', Component: imageAndText }
            ]
        };
        // Then adds this snipit to the page
        const { head, body } = _COMPONENTS;
        if (process.env.NODE_ENV === 'development') {
            const render = require('react-dom').render;
            const Page = require('../../../components/page').default;
            const AppContainer = require('react-hot-loader').AppContainer;

            [...head, ...body].forEach((definition) => {
                const dataId = definition.dataId || 'po';

                definition.properties = SR.components.data.find(
                    (model) =>
                        model.type === definition.id && model.id === dataId
                );
            });

            render(
                <AppContainer>
                    <Page headComponents={head} bodyComponents={body} />
                </AppContainer>,
                typeof document !== 'undefined' && document.querySelector('#main')
            );
        } else {
            uniqBy([...head, ...body], 'id').forEach(({ Component, id }) =>
                renderReact(Component, id)
            );
        }
    }
};

mediator.init();

if (module.hot) {
    module.hot.accept((err) => {
        if (!err) {
            mediator.init();
        }
    });
}
