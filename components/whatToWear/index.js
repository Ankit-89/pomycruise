'use strict';

import React from 'react';
import FetchData from '../commons/CUK/fetch-data';
import {getConfig} from '../commons/CUK/utilities';


class WhatToWear extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            res: []
        };
    }

    componentWillMount() {
        const userData = JSON.parse(sessionStorage.getItem('userData'));
        const cruiseData = JSON.parse(sessionStorage.getItem('cruiseData'));
        const { services } = this.props;
        const { whatTowearApi } = services.urls;
        const { embarkDate, disembarkDate } = cruiseData
        const { shipCode, brandCode } = userData
        var brand = brandCode.toUpperCase();
        brand = brand === 'CUNARD' ? 'CU' : 'PO';
        const url = `${whatTowearApi}?brand=${brand}&shipCode=${shipCode.toUpperCase()}&itineraryStartDate=${embarkDate}&itineraryEndDate=${disembarkDate}`;
        const apikeyMycruise = getConfig('apikeyMycruise', '');
        FetchData(url, {
            method: 'GET',
            'X-Source-Identity-Token-0': apikeyMycruise
        })
            .then((response) => {
                this.setState({
                    res: response.whatToPack
                });
            })
            .catch((error) => {
                // TODO: what to do if error
            });
    }

    renderHeadData() {
        const data = { col: 'Dress Code', no: 'Number of Items' };

        return (
            <tr className="tableHead_row">
                <th className="tableHead_col">{data.col}</th>
                <th className="tableHead_col">{data.no}</th>
            </tr>
        )
    }

    renderBodyData = (data) => {

    }

    render() {
        // const obj = '{"brand": "PO", "shipCode": "AC", "whatToPack":[{ "nightType": "FORMAL", "numberToPack": "4" },{ "nightType": "CASUAL", "numberToPack": "3" },{ "nightType": "SMART", "numberToPack": "1" },{ "nightType": "SEMICASUAL", "numberToPack": "5" }] }'
        const { res } = this.state;
        return (
            <div className="WhatToWear_TableBox article--title_paragraph">
                <table className="WhatToWear_Table">
                    <thead className="WhatToWear_TableHead">
                        {this.renderHeadData()}
                    </thead>
                    <tbody className="WhatToWear_TableBody">
                        {res.map(
                            (item, index) => (
                                <tr className="tableBody_row" key={`${index}`}>
                                    <td className="tableBody_col">{item.nightType}</td>
                                    <td className="tableBody_col">{item.numberToPack}</td>
                                </tr>
                            )
                        )}
                    </tbody>
                </table>
            </div>
        );
    }
}

export default WhatToWear;
