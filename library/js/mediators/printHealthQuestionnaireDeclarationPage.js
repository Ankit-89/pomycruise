'use strict';
// Modules
import '../modules/commonComponents';
import React from 'react';
import renderReact from '../utils/renderReact';
import { uniqBy } from 'lodash';
import { redirectToCorrectShip } from '../../../components/commons/CUK/utilities';

// P&O Components
import printHealthQuestionnaireDeclaration from '../../../components/printHealthQuestionnaireDeclaration';

import 'postbooking-theme/styles/pages/printHealthQuestionnaireDeclaration/index.css';

const mediator = {
    init() {
        this.initReact();
    },

    initUI() {
        this.initReact();
    },

    handleRedirect() {
        let needRedirect = redirectToCorrectShip();
        if (!needRedirect) {
            this.initUI();
        }
    },

    initReact() {
        const _COMPONENTS = {
            body: [
                {
                    id: 'printHealthQuestionnaireDeclaration',
                    Component: printHealthQuestionnaireDeclaration
                }
            ]
        };
        // Then adds this snipit to the page
        const { body } = _COMPONENTS;
        if (process.env.NODE_ENV === 'development') {
            const render = require('react-dom').render;
            const Page = require('../../../components/page').default;
            const AppContainer = require('react-hot-loader').AppContainer;

            [...body].forEach((definition) => {
                const dataId = definition.dataId || 'po';

                definition.properties = SR.components.data.find(
                    (model) =>
                        model.type === definition.id && model.id === dataId
                );
            });

            render(
                <AppContainer>
                    <Page bodyComponents={body} />
                </AppContainer>,
                typeof document !== 'undefined' && document.querySelector('#main')
            );
        } else {
            uniqBy([ ...body], 'id').forEach(({ Component, id }) =>
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
