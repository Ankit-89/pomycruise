'use strict';

import React from 'react';
import Card from '../commons/CUK/card';
import Link from '../commons/CUK/link';
import LinesEllipsis from 'react-lines-ellipsis';
import responsiveHOC from 'react-lines-ellipsis/lib/responsiveHOC';

const ResponsiveEllipsis = responsiveHOC()(LinesEllipsis);

class hotelCard extends React.PureComponent {
    constructor(props) {
        super(props);
    }

    render() {
        let {
            index,
            textAlignment,
            showVisitingCountries,
            visitingCountries,
            title,
            description,
            image,
            primaryCta,
            isRendered
        } = this.props;

        const cardProps = {
            image,
            imageLink: {
                ...primaryCta,
                title,
                dataLinktext:
                    index !== undefined
                        ? `${title}:${index + 1}:${image ? image.alt : ''}`
                        : `${title}:${image ? image.alt : ''}`,
                dataContentname: image ? image.alt : '',
                dataContenttype: 'image'
            },
            title,
            titleLink: {
                ...primaryCta,
                title,
                dataClicktype: 'general',
                dataLinktext: title
            },
            description: false,
            ctaProps: {}
        };

        return (
            <Card
                {...cardProps}
                className={`hotel-card ${
                    textAlignment === 'center'
                        ? ' content-align-center'
                        : ' content-align-left'
                }`}
            >
                <div>
                    {isRendered && (
                        <div className="description-container">
                            <ResponsiveEllipsis
                                text={description}
                                maxLine="3"
                                ellipsis="..."
                                trimRight
                                basedOn="letters"
                            />
                        </div>
                    )}
                    <div className="cta-content">
                        <div className="cta-block">
                            <Link
                                {...primaryCta}
                                title={title}
                                linkClassName={`secondary-cta`}
                                ariaLabel={`${title} ${primaryCta.label}`}
                                dataClicktype={`general`}
                                dataLinktext={
                                    index !== undefined
                                        ? `${title}:${index + 1}:${
                                              primaryCta.label
                                          }`
                                        : `${title}:${primaryCta.label}`
                                }
                                allowDefault={true}
                            />
                        </div>
                    </div>
                </div>
            </Card>
        );
    }
}

export default hotelCard;
