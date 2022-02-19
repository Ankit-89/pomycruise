'use strict';

// Modules
import polyfills from '../modules/polyfill';
import renderReact from '../modules/render-react';

// Global Components
// import AlertMessaging from '../../../components/alertMessaging';
import TitleH1Mycruise from '../../../components/titleH1Mycruise';
// import Article from '../../../components/article';
// import HelpWidget from '../../../components/helpWidget';
// import FullWidthImage from '../../../components/fullWidthImage';
import CopyBlockMycruise from '../../../components/copyBlockMycruise';
// import analytics from '../../../components/commons/analytics';
// import GlobalScripts from '../../../components/commons/globalScripts';

const mediator = {
    init() {
        polyfills();

        this.initUI();
    },

    initUI() {
        this.initReact();
    },

    initReact() {
        // renderReact(AlertMessaging, 'alertMessaging');
        renderReact(TitleH1Mycruise, 'titleH1Mycruise');
        // renderReact(Article, 'article');
        // renderReact(HelpWidget, 'helpWidget');
        // renderReact(FullWidthImage, 'fullWidthImage');
        renderReact(CopyBlockMycruise, 'copyBlockMycruise');
    }
};

typeof document !== 'undefined' && document.addEventListener('DOMContentLoaded', () => {
    mediator.init();
});
