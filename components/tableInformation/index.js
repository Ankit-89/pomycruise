'use strict';

import React from 'react';
import analytics from '../commons/CUK/analytics';

class tableInformation extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            openRowIndex: ''
        };
    }

    openAccordion(index) {
        // TODO: only when mobile
        analytics.clickTracking(this)
        let newIndex = this.state.openRowIndex === index ? '' : index;

        this.setState({
            openRowIndex: newIndex
        });
    }

    render() {
        let questions = this.props.questions;
        let { labels, headings, rows } = this.props;
        let arrayTreatment = headings.columns;
        let objectTreatment = rows;
        return (
            <div className="spaPackages__table">
                {/* <div className="table__heading">
                    <div className="table__header table__cell">
                        <h5>{headings.rowTitle}</h5>
                    </div>
                    <ul className="onlyDesktop table__header table__cells">
                        {arrayTreatment.map((treat, index) => {
                            return <li>{treat}</li>;
                        })}
                        <li>{headings.price}</li>
                    </ul>
                </div>

                <ul className="">
                    {objectTreatment.map((product, index) => {
                        return (
                            <li
                                key={index}
                                className={`${
                                    this.state.openRowIndex === index
                                        ? 'visible'
                                        : ''
                                } qa__item `}
                            >
                                <span
                                    onClick={(e) => {
                                        this.openAccordion(index);
                                    }}
                                >
                                    {product.rowTitle}
                                </span>
                                <span className="onlyMobile">
                                    {product.price}
                                </span>
                                <ul className="table__row">
                                    {product.columns.map((treatment, j) => {
                                        return (
                                            <li key={j}>
                                                <span className="onlyMobile">
                                                    {arrayTreatment[j]}
                                                </span>
                                                <span>{treatment}</span>
                                            </li>
                                        );
                                    })}
                                    <li className="onlyDesktop">
                                        <span>{product.price}</span>
                                    </li>
                                </ul>
                            </li>
                        );
                    })}
                </ul> */}

                <table className="table">
                    <tr className="table__header">
                        <th className=" ">
                            <h5>{headings.rowTitle}</h5>
                        </th>
                        {/* <ul className="onlyDesktop table__header table__cells"> */}
                        {arrayTreatment.map((treat, index) => {
                            return (
                                <td
                                    key={`${index}-treat`}
                                    className="onlyDesktop"
                                >
                                    {treat}
                                </td>
                            );
                        })}
                        <td className="onlyDesktop">{headings.price}</td>
                        {/* </ul> */}
                    </tr>
                    {objectTreatment.map((product, index) => {
                        return (
                            <tr
                                key={index}
                                className={`${
                                    this.state.openRowIndex === index
                                        ? 'visible'
                                        : ''
                                } table__row`}
                            >
                                <th
                                    className="table__opener"
                                    onClick={(e) => {
                                        this.openAccordion(index);
                                    }}
                                >
                                    {product.rowTitle}
                                    <span className="onlyMobile table__price">
                                        {product.price}
                                    </span>
                                </th>

                                {product.columns.map((treatment, j) => {
                                    return (
                                        <td key={j} className="toBeOpen">
                                            <span className="onlyMobile">
                                                {arrayTreatment[j]}
                                            </span>
                                            <span className="table__quantity">
                                                {treatment}
                                            </span>
                                        </td>
                                    );
                                })}
                                <td className="onlyDesktop">
                                    <span>{product.price}</span>
                                </td>
                            </tr>
                        );
                    })}
                </table>
            </div>
        );
    }
}

export default tableInformation;
