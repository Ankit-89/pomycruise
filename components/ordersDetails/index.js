import React from 'react';
import fetchData from '../commons/CUK/fetch-data';
import EmptyState from '../commons/CUK/emptyState';
import OrderDetail from '../ordersDetails/ordersDetail';
import sessionStorage from '../commons/CUK/session-storage';
import Title from '../titleH1Mycruise';

class ordersDetails extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            orders: [],
            openRowIndex: ''
        };
    }
    componentWillMount() {
        const { services } = this.props;
		 if (typeof services !== 'undefined' )
		{
		        const { urls } = services;
				if (typeof urls !== 'undefined' )
				{
			        let url = urls.orderHistoryApi;
			        let header = sessionStorage.getItem('header');
			        const apikey =
			            typeof window !== 'undefined' ? window.configs.apikeyMycruise : '';
			        fetchData(url, {
			            method: 'GET',
			            headers: {
			                'X-Source-Identity-Token-0': apikey,
			                'X-CommonData': JSON.stringify(header)
			            }
			        }).then((res) => {
			            this.setState({
			                orders: res.orders
			            });
			        });
				}
		}
    }

    handleToUpdate() {
        const { services } = this.props;
		 if (typeof services !== 'undefined' )
		{
	        const { urls } = services;
			if (typeof urls !== 'undefined' )
				{
			        let url = urls.orderHistoryApi;
			        let header = sessionStorage.getItem('header');
			        const apikey =
			            typeof window !== 'undefined' ? window.configs.apikeyMycruise : '';
			        fetchData(url, {
			            method: 'GET',
			            headers: {
			                'X-Source-Identity-Token-0': apikey,
			                'X-CommonData': JSON.stringify(header)
			            }
			        }).then((res) => {
			            this.setState({
			                orders: res.orders
			            });
			        });
				}
		}
    }

    render() {
        const { orders } = this.state;
        let handleToUpdate = this.handleToUpdate;
        let emptyState = this.props.childComponents[0].attributes;
        let { labels, hairLengthLabels } = this.props;
        const accesibilityLabels = this.props.accesibilityLabels ? this.props.accesibilityLabels : {};
        const titleH1Props = {
            title: this.props.title,
            description: '',
            type: 'h1'
        };

        return (
            <div>
                {orders !== null &&
                    orders.length > 0 && (
                        <div>
                            <Title {...titleH1Props} />
                            <ul>
                                {orders.length > 0 &&
                                    orders
                                        .reverse()
                                        .map((singleOrder, index) => (
                                            <OrderDetail
                                                {...singleOrder}
                                                key={singleOrder.code}
                                                index={index}
                                                services={this.props.services}
                                                labels={labels}
                                                accesibilityLabels={accesibilityLabels}
                                                hairLengthLabels={
                                                    hairLengthLabels
                                                }
                                                handleToUpdate={handleToUpdate.bind(
                                                    this
                                                )}
												status={singleOrder.status}
                                            />
                                        ))}
                            </ul>
                        </div>
                    )}
                {/* Empty state */}
                {orders !== null &&
                    orders.length === 0 && <EmptyState {...emptyState} />}
            </div>
        );
    }
}

export default ordersDetails;
