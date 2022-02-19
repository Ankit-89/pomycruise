'use strict';
// Modules
import '../modules/commonComponents';
import React from 'react';
import renderReact from '../utils/renderReact';
import { uniqBy } from 'lodash';
import globalHeaderMycruise from '../../../components/globalHeaderMycruise';
import { redirectToCorrectShip } from '../../../components/commons/CUK/utilities';
// P&O Components
//import heroTileEntertainment from '../../../components/heroTileEntertainment';
//import entireEntertainment from '../../../components/entireEntertainment';
import heroTile from '../../../components/heroTile';
import entertainmentCarouselTiles from '../../../components/entertainmentCarouselTiles';
import shipsGrid from '../../../components/shipsGrid';
import entertainmentGrid from '../../../components/entertainmentGrid';
import entertainmentCategoryTiles from '../../../components/entertainmentCategoryTiles';
import footerMycruise from '../../../components/footerMycruise';
import accordionMycruise from '../../../components/accordionMycruise';

import 'postbooking-theme/styles/pages/entertainment/index.css';

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
                { id: 'heroTile', Component: heroTile },
                { id: 'shipsGrid', Component: shipsGrid },
                {
                    id: 'entertainmentCategoryTiles',
                    Component: entertainmentCategoryTiles
                },
                {
                    id: 'entertainmentGrid',
                    Component: entertainmentGrid
                },
                {
                    id: 'entertainmentCarouselTiles',
                    Component: entertainmentCarouselTiles
                },
                { id: 'accordionMycruise', Component: accordionMycruise },

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
                document.querySelector('#main')
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
