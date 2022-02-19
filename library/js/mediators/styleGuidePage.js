'use strict';

// Common Components Module
// import './commonComponents';
import renderReact from '../modules/render-react';

// Components
import StyleGuide from '../../../components/styleGuide';

const mediator = {
    init() {
        this.initUI();
    },

    initUI() {
        this.initReact();
    },

    initReact() {
        renderReact(StyleGuide, 'styleGuide');
    }
};

typeof document !== 'undefined' && document.addEventListener('DOMContentLoaded', () => {
    mediator.init();
});
