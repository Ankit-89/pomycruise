'use strict';

import React from 'react';
import Title from '../titleH1Mycruise';
import analytics from '../commons/CUK/analytics';

class continueShopping extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        // analytics.clickTracking(this);
    }

    componentDidUpdate() {
        // analytics.clickTracking(this);
    }

    renderIcons(iconList) {
        return (
            <div className="icons-list">
                <ul>
                    {iconList.map((item, i) => (
                        <li className="icons-list-item" key={i}>
                            <a
                                href={item.iconUrl}
                                className="icons-list-link"
                                data-linktext={item.iconName}
                                data-componentname={this.props.type}
                            >
                                <span className="icons-list-icon">
                                    <img
                                        src={item.iconImage}
                                        className="icons-list-img"
                                    />
                                </span>
                                <h5 className="icons-list-label">
                                    {item.iconName}
                                </h5>
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        );
    }

    render() {
        const titleH1Props = {
            title: this.props.titleLabel,
            description: '',
            dividerType: '',
            type: 'h1',
            showIcon: false
        };
        let iconList = this.props.icons;

        return (
            <div className="continue-shopping">
                {titleH1Props.title && <Title {...titleH1Props} />}
                {this.renderIcons(iconList)}
            </div>
        );
    }
}

export default continueShopping;
