'use strict';

import React from 'react';
import Image from '../commons/CUK/image';
import TitleH1Mycruise from '../titleH1Mycruise';
import analytics from '../commons/CUK/analytics';
import extractChildComponent from '../commons/CUK/extractChildComponent';
import fetchData from '../commons/CUK/fetch-data';
import SessionStorage from '../commons/CUK/session-storage';
import validateSession from '../commons/CUK/validateSession';

class shipsGridServlet extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            products: []
        };
    }
    componentDidUpdate() {
        // analytics.clickTracking(this);
    }

    componentDidMount = () => {
        // analytics.clickTracking(this);
        if (!validateSession.checkCookie(['wcmmode'])) {
            const {
                props: { productSearchServlet }
            } = this;
            const userData = SessionStorage.getItem('userData');
            const { shipCode, cabinCode } = userData;
            const urlString = `${productSearchServlet}.mainDining.${shipCode}.${cabinCode}.json`;

            fetchData(urlString, {
                method: 'GET'
            }).then(
                (response) => {
                    const { venues } = response;
                    this.setState({
                        products: venues.length ? venues : []
                    });
                },
                (error) => {
                    this.setState({
                        error
                    });
                }
            );
        }
    };

    renderDescription = ({
        type,
        description,
        textQuoteAuthor,
        textQuoteDescription
    }) => (
        <div>
            <div
                className={`description-block ${
                    type === 'quote' ? 'quote' : 'paragraph'
                }`}
                dangerouslySetInnerHTML={{ __html: description }}
            />

            {type === 'quote' && (
                <div className="quote-details">
                    <span className="quote-author">- {textQuoteAuthor}</span>
                    <span className="quote-description">
                        , {textQuoteDescription}
                    </span>
                </div>
            )}
        </div>
    );

    renderTitle() {
        const { childComponents, accessibilityHeading } = this.props;
        const titleH1Props = extractChildComponent(
            childComponents,
            'titleH1Mycruise'
        );

        return titleH1Props ? (
            <TitleH1Mycruise {...titleH1Props.attributes} />
        ) : (
            <div className="accessibility-header">
                <h2 className="sr-only">{accessibilityHeading}</h2>
            </div>
        );
    }

    renderProduct = (product, i) => {
        const { seeDetailsLabel, align, titleGrid } = this.props;
        const { overviewImage, url, name } = product;
        const image = {
            alt: name,
            0: {
                '1x': `${overviewImage}`,
                '2x': `${overviewImage}`
            },
            376: {
                '1x': `${overviewImage}`,
                '2x': `${overviewImage}`
            },
            769: {
                '1x': `${overviewImage}`,
                '2x': `${overviewImage}`
            }
        };

        return (
            <div className="tile-holder" key={i}>
                <div className="tileGrid content">
                    <div className={`spacing-container ${align}`}>
                        <div className="title">
                            <h3 className="h2 heading">{titleGrid}</h3>
                        </div>
                        <div className="text-holder">
                            {this.renderDescription(product)}
                        </div>
                        <div className="cta-icon-group">
                            <div className="cta-link">
                                <a href={url} data-linktext={seeDetailsLabel}>
                                    {seeDetailsLabel}
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="tileGrid image-holder">
                    {image && <Image {...image} />}
                </div>
            </div>
        );
    };

    render() {
        const { inverted } = this.props;
        const { products } = this.state;
        return (
            (products.length > 0 ||
                validateSession.checkCookie(['wcmmode'])) && (
                <div
                    className={`image-copy-block ${inverted ? 'inverted' : ''}`}
                >
                    {this.renderTitle()}
                    {products.map(this.renderProduct)}
                </div>
            )
        );
    }
}

shipsGridServlet.defaultProps = {
    contentLabel: 'shipsGridServlet'
};

export default shipsGridServlet;
