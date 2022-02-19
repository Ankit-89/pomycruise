'use strict';
// Modules
import '../modules/commonComponents';
import React from 'react';
import renderReact from '../utils/renderReact';
import { uniqBy } from 'lodash';
import globalHeaderMycruise from '../../../components/globalHeaderMycruise';
import { redirectToCorrectShip } from '../../../components/commons/CUK/utilities';
// P&O Components
import heroTileSpa from '../../../components/heroTileSpa';
import productsVerticalTiles from '../../../components/productsVerticalTiles';
import sliderViewed from '../../../components/sliderViewed';
import simpleText from '../../../components/simpleText';
import sliderRecommendedShorex from '../../../components/sliderRecommendedShorex';
import footerMycruise from '../../../components/footerMycruise';

import 'postbooking-theme/styles/pages/spaDetailsPage/index.css';

const mediator = {
    init() {
        this.handleRedirect();
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
            head: [
                { id: 'globalHeaderMycruise', Component: globalHeaderMycruise }
            ],
            body: [
                { id: 'heroTileSpa', Component: heroTileSpa },
                {
                    id: 'productsVerticalTiles',
                    Component: productsVerticalTiles
                },
                { id: 'simpleText', Component: simpleText },
                {
                    id: 'sliderRecommendedShorex',
                    Component: sliderRecommendedShorex
                },
                { id: 'sliderViewed', Component: sliderViewed },
                { id: 'footerMycruise', Component: footerMycruise }
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
