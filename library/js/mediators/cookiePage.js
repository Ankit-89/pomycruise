'use strict';
import React from 'react';
import renderReact from '../utils/renderReact';
import { uniqBy } from 'lodash';
// Common Components Module
// import './commonComponents';
import '../modules/commonComponents';

import validateSession from '../../../components/commons/CUK/validateSession';

// P&O Components
import acceptCookie from '../../../components/acceptcookie';
import copyBlockMycruise from '../../../components/copyBlockMycruise';

import globalHeaderLogin from '../../../components/globalHeaderLogin';

import 'postbooking-theme/styles/pages/cookiePage/index.css';

const mediator = {
    init() {
        // this.handleRedirect();
        this.initUI();
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
            head: [{ id: 'globalHeaderLogin', Component: globalHeaderLogin }],
            body: [
                {
                    id: 'copyBlockMycruise', Component: copyBlockMycruise
                },
                {
                    id: 'acceptCookie', Component: acceptCookie
                }
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
