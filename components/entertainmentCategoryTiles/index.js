/**
 * Dining titles
 * @exports spaTiles
 */
import React from 'react';
import EntertainmentCard from '../entertainmentCard';
import TitleH1Mycruise from '../../components/titleH1Mycruise';
import validateSession from '../commons/CUK/validateSession';
import analytics from '../commons/CUK/analytics';
import {
    VIEWPORT_TYPE,
    watchForBreakpoint
} from '../../library/js/config/breakpoints';
import FetchData from '../commons/CUK/fetch-data';
import SessionStorage from '../commons/CUK/session-storage';
import extractChildComponent from '../commons/CUK/extractChildComponent';
import { getConfig } from '../commons/CUK/utilities';
import moment from 'moment';

class entertainmentCategoryTiles extends React.Component {
    constructor(props) {
        super(props);

        this.headerData = {
            header: SessionStorage.getItem('header'),
            apiKey: getConfig('apikeyMycruise', '')
        };

        this.state = {
            products: [],
            isLVP: false,
            showUnderAge: false,
            showReserveSeat: false
        };
    }

    componentDidMount() {
        if (!validateSession.checkCookie(['wcmmode'])) {
            const picturefill = require('picturefill');
            const mqlLVP = watchForBreakpoint(VIEWPORT_TYPE.DESKTOP);

            // analytics.clickTracking(this);
            picturefill();

            this.handleResize(mqlLVP);
            mqlLVP.addListener((mql) => {
                this.handleResize(mql);
            });

            // this.initTiles();
        }

        const header = SessionStorage.getItem('header');
        const { embarkationDate } = header;
        // // New Date
        const dayOfCruiseDeparture = new Date(
            moment(embarkationDate, 'YYYY-MM-DD').format('ll')
        );
        const today = new Date();
        const oneDay = 1000 * 60 * 60 * 24;
        const dayToCruiseDeparture = Math.ceil(
            (dayOfCruiseDeparture.getTime() - today.getTime()) / oneDay
        );
        /////   ***************** //// ****************** ///////
        const xDays = getConfig('entertainmentDayX');

        const diffDays = +xDays - dayToCruiseDeparture;

        let userData = SessionStorage.getItem('userData');
        let underAge = userData.customer.age;

        if (underAge >= 16 && diffDays < 0) {
            this.setState({
                showReserveSeat: true
            });
        } else if (underAge < 16) {
            this.setState({ showUnderAge: true });
        }
    }

    /**
     * handleResize - Resize event for media devices
     *
     * @param {object} mql - Match media object
     */
    handleResize(mql) {
        this.setState({
            isLVP: mql.matches
        });
    }

    /**
     * ShoreXResults from current sort and filter
     * @param {Array} spaTiles - shoreXResults results from api
     * @returns {ReactDOMObject} Port cards.
     */
    renderTile = (product, i) => (
        <div className="spa-detail-tile tile-detail" key={i}>
            <EntertainmentCard
                {...product}
                key={i}
                index={i}
                labels={this.props.labels}
                categoryId={product.categoryId}
                showUnderAge={this.state.showUnderAge}
                showReserveSeat={this.state.showReserveSeat}
            />
        </div>
    );

    filterGridItems = (gridItem) =>
        gridItem.attributes.shipFilter &&
        gridItem.attributes.shipFilter.length > 0
            ? gridItem.attributes.shipFilter.indexOf(this.shipCode) > -1
            : true;

    render() {
        const header = SessionStorage.getItem('header');
        const { shipCode } = header;
        this.shipCode = shipCode;
        const { childComponents } = this.props;
        const newGridList = childComponents.filter(this.filterGridItems);
        const { products } = this.state;
        const titleH1Props = extractChildComponent(
            childComponents,
            'titleH1Mycruise'
        );

        return childComponents.length > 0 ? (
            <div>
                {/* <div className="tileH1-section">
                    {titleH1Props && (
                        <TitleH1Mycruise {...titleH1Props.attributes} />
                    )}
                </div> */}
                <div
                    className="spa-tiles-container"
                    ref={(c) => (this.tilesContainer = c)}
                >
                    <div className="tiles-container">
                        {newGridList.map(this.renderTile)}
                    </div>
                </div>
            </div>
        ) : null;
    }
}

export default entertainmentCategoryTiles;
