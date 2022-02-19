'use strict';

import React from 'react';
import fetchData from '../commons/CUK/fetch-data';
import sessionStorage from '../commons/CUK/session-storage';

import PackageComponent from './packageComponent';
import analytics from '../commons/CUK/analytics';

class packageList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            apiCalled: false,
            products: [],
            openRow: ''
        };
    }

    componentDidMount() {
        if (!this.state.apiCalled) {
            const header = sessionStorage.getItem('header');
            const serviceUrl = this.props.services.urls.productSearchApi;
            //const serviceLang = this.props.services.headers.locale;
            const configs = typeof window !== 'undefined' ? window.configs : {};
            const apiKey = configs.apikeyMycruise;
            const url = `${serviceUrl}?productType=AIBEVERAGE`;

            fetchData(url, {
                method: 'GET',
                headers: {
                    'X-CommonData': JSON.stringify(header),
                    'X-Source-Identity-Token-0': apiKey,
                    'Content-type': 'Application/json'
                }
            }).then((res) => {
		const aibProducts = res.products.filter(
                        (aibPackage) =>
                            aibPackage.stock && aibPackage.stock.stockLevel > 0
                    );
                this.setState({
                    apiCalled: true,
                    minAlcoholicAge: res.minAlcoholicAge,
                    products: aibProducts
                });
		let aibProductUrlParam = '';
		for(let i=0; i < aibProducts.length; i++) {
			const stringJoin = i < (aibProducts.length - 1) ? ',' : '';
			aibProductUrlParam = aibProductUrlParam + aibProducts[i].code + stringJoin;
		}
                sessionStorage.setItem('AIB_PRODUCT_CODES', aibProductUrlParam);
            });
        }
    }
    /**
     * toggleAccordion - handles state update for correct accordion opening
     *
     * @param {number} index index of related accordion's package
     */
    toggleAccordion = (index) => {
        analytics.clickTracking(this);
        this.setState((prevSate) => {
            return {
                openRow: prevSate.openRow === index ? '' : index
            };
        });
    };
    /**
     * createPackages - creates packages list markup and iterates through packages
     * to create single ones
     *
     * @returns {JSX} resulting markup to show
     */
    createPackages = () => {
        let products = [...this.state.products];
        let { labels } = this.props;
        return (
            <div className="packages-detail">
                <div className="packages-list">
                    {products.map((product, index) => (
                        <PackageComponent
                            accordionClick={(e) => this.toggleAccordion(index)}
                            key={index}
                            isOpen={this.state.openRow === index}
                            product={product}
                            labels={labels}
                            minAlcoholicAge={this.state.minAlcoholicAge}
                        />
                    ))}
                </div>
            </div>
        );
    };

    render() {
        return (
            <div
                className="package-list"
                ref={(packageList) => (this.packageList = packageList)}
            >
                {this.createPackages()}
            </div>
        );
    }
}

export default packageList;
