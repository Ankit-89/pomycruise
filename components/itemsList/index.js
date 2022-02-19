'use strict';

import React from 'react';
import Title from '../titleH1Mycruise';

const itemsList = ({ title, list, type = 'h1', showIcon = false }) => (
    <div className="inner-container">
        <Title title={title} type={type} showIcon={showIcon} />

        <ul className="itemsList__list">
            {list.map((item, index) => {
                return (
                    <li key={index} className="itemsList__item">
                        <h5 className="titleItem">{item.title}</h5>
                        <p className="desc">{item.desc}</p>
                    </li>
                );
            })}
        </ul>
    </div>
);

export default itemsList;
