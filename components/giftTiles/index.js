/**
 * Gift titles
 * @exports giftTiles
 */
import React from 'react';
import GiftCard from '../giftCard';
import SessionStorage from '../commons/CUK/session-storage';
import TitleH1Mycruise from '../../components/titleH1Mycruise';
const ERROR_CODES = {
    START_SALE_DATE_NOT_MET: 'notOnSaleYet',
    STOP_SALE_DATE_PASSED: 'notOnSaleAnymore'
};

class giftTiles extends React.Component {
    constructor(props) {
        super(props);
        this.headerData = {
            header: SessionStorage.getItem('header'),
            apiKey:
                typeof window !== 'undefined'
                    ? window.configs.apikeyMycruise
                    : ''
        };

        this.state = {
            isLoaded: false,
            chosenProduct: false,
            isLVP: false
        };
    }

    componentDidMount() {
        this.initTiles();
    }

    initTiles() {
        this.setState({
            isLoaded: true
        })
    }

    show = () => {
        // find the embakation and desembarkation port in Sessionstorage
        const userData = SessionStorage.getItem('userData');

        if (userData) {
            const { shipCode } = userData;
            const ports = this.props.ports;

            let filteredPorts = ports
                ? ports.filter(
                      (port) =>
                          port === shipCode
                  )
                : [];

            return filteredPorts.length > 0;
        } else {
            return true;
        }
    };

    createTiles(gifts) {
        return gifts.map((gift, i) => {

            if(i==0){
            }
            else{
                return (
                    <div className="shore-detail-tile tile-detail" key={i}>
                        
                            <GiftCard
                                {...gift}
                                key={i}
                                index={i}
                                labels={this.props.labels}
                            />
                        
                    </div>
                );
            }
        });
    }

    render() {
        // console.log('inside render function of giftTiles props are ', this.props, 'and child components are ', this.props.childComponents)
        return (
            this.show() && (
            <div>
                <div className="tileH1-section">
                    {this.props.childComponents.length > 0 &&
                        this.props.childComponents[0] !== null && (
                            <TitleH1Mycruise
                                {...this.props.childComponents[0].attributes}
                            />
                        )}
                </div>
                <div
                    className="dining-tiles-container"
                    ref={(tilesContainer) =>
                        (this.tilesContainer = tilesContainer)
                    }
                >
                    <div className="dinings tiles-container">
                        {this.props.childComponents && this.createTiles(this.props.childComponents)}
                    </div>
                </div>
            </div>
          )
        );
    }
}

export default giftTiles;
