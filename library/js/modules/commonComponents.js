// Modules

import renderReact from '../utils/renderReact';

// Global Components
import TitleH1Mycruise from '../../../components/titleH1Mycruise';
import SingleVideo from '../../../components/singleVideo';
import CopyBlockMycruise from '../../../components/copyBlockMycruise';

const LANGUAGE_CODE_COOKIE = 'languageCode';

const commonComponents = {
    init() {
        this.initUI();

        if (
            window.configs &&
            window.configs.locale &&
            document.cookie.indexOf(LANGUAGE_CODE_COOKIE) === -1
        ) {
            document.cookie = `${LANGUAGE_CODE_COOKIE}=${
                window.configs.locale
            };path=/`;
        }
    },

    initUI() {
        this.initReact();
    },

    initReact() {
        if (process.env.NODE_ENV === 'production') {
            renderReact(TitleH1Mycruise, 'titleH1Mycruise');
            renderReact(SingleVideo, 'singleVideo');
            renderReact(CopyBlockMycruise, 'copyBlockMycruise');
        }
    }
};

commonComponents.init();
