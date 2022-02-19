'use strict';

import React from 'react';
import Card from '../commons/CUK/card';
import Link from '../commons/CUK/link';
import LinesEllipsis from 'react-lines-ellipsis';
import responsiveHOC from 'react-lines-ellipsis/lib/responsiveHOC';

const ResponsiveEllipsis = responsiveHOC()(LinesEllipsis);

class giftCard extends React.PureComponent {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
     
    }

    createDetailsCta() {
        // console.log('props inside createDetailsCta of gift card ', this.props);
        const name = this.props.attributes.title;
        const url = this.props.attributes.primaryCta.url;
        const seeDetailsLabel = this.props.attributes.primaryCta.label

        return (
            <div className="cta-block">
                <Link
                    ariaLabel={`${name}, ${seeDetailsLabel}`}
                    url={url}
                    title={seeDetailsLabel}
                    dataLinktext={seeDetailsLabel}
                    linkClassName={`primary-cta`}
                >
                    {seeDetailsLabel}
                </Link>
            </div>
        );
    }

    render() {
   
        const {
            props: {
                attributes: { image,
                textAlignment,
                title,
                description }
            }
        } = this;
                
        const cardProps = {
            image,
            textAlignment,
            imageLink: false,
            banner: 'offerBanner',
            title,
            titleLink: false,
            showOfferBanner: false
        };

        return (
            <div className="dining-card-container">
                <Card
                    {...cardProps}
                    className={`dining-card content-align-left`}
                >
                    <div className="dining-card-description">
                        <ResponsiveEllipsis
                            text={description}
                            maxLine="3"
                            ellipsis="..."
                            trimRight
                            basedOn="letters"
                        />
                    </div>
                </Card>
                <div className="cta-content">
                    {this.createDetailsCta()}
                </div>
            </div>
        );
    }
}

export default giftCard;
