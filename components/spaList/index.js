/**
 * Gift titles
 * @exports giftTiles
 */
import React from 'react';
import GiftCard from '../giftCard';
import SessionStorage from '../commons/CUK/session-storage';
import TitleH1Mycruise from '../../components/titleH1Mycruise';
import VerticalProductListing from './verticalProductListing';

class spaList extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.initTiles();
    }

    initTiles() {
        this.setState({
            isLoaded: true
        });
    }

    createProductTiles(products) {
        return products.map((product, i) => {
            if (i == 0) {
            } else {
                return (
                    <div className="shore-detail-tile tile-detail" key={i}>
                        <VerticalProductListing
                            {...product}
                            key={i}
                            index={i}
                            labels={this.props.labels}
                        />
                    </div>
                );
            }
        });
    }

    show = () => {
        // find the port in Sessionstorage
        const userData = SessionStorage.getItem('userData');

        if (userData) {
            const { shipCode } = userData;
            const ports = this.props.ports;

            let filteredPorts = ports
                ? ports.filter((port) => port === shipCode)
                : [];

            return filteredPorts.length > 0;
        } else {
            return true;
        }
    };

    render() {
        return (
            <div>
                <div className="tileH1-section">
                    {this.props.childComponents.length > 0 &&
                        this.props.childComponents[0] !== null && (
                            <TitleH1Mycruise
                                {...this.props.childComponents[0].attributes}
                            />
                        )}
                </div>
                <div className="container">
                    {this.props.childComponents &&
                        this.createProductTiles(this.props.childComponents)}
                </div>
            </div>
        );
    }
}

export default spaList;
