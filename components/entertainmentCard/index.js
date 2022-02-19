'use strict';

import React from 'react';
import Card from '../commons/CUK/card';
import Image from '../commons/CUK/image';
import Link from '../commons/CUK/link';
import LinesEllipsis from 'react-lines-ellipsis';
import responsiveHOC from 'react-lines-ellipsis/lib/responsiveHOC';
import SessionStorage from '../commons/CUK/session-storage';
import { getConfig } from '../commons/CUK/utilities';
import moment from 'moment';

const ResponsiveEllipsis = responsiveHOC()(LinesEllipsis);

class entertainmentCard extends React.PureComponent {
    constructor(props) {
        super(props);
    }

    createDetailsCta() {
        const {
            name,
            url,
            labels: { seeDetailsLabel }
        } = this.props;

        return (
            <div className="cta-block">
                <Link
                    ariaLabel={`${name}, ${seeDetailsLabel}`}
                    url={url}
                    title={seeDetailsLabel}
                    dataLinktext={seeDetailsLabel}
                    linkClassName={`primary-cta`}
                    onClick={false}
                >
                    {seeDetailsLabel}
                </Link>
            </div>
        );
    }

    handleClick = (categoryId) => {
        SessionStorage.setItem('eventHeaderData', this.props.attributes);
        window.location.href = window.location.href + '/events/' + categoryId;
    };

    render() {
        const {
            categoryId,
            description = '',
            image,
            textAlignment,
            title = '',
            isbookable = Boolean,
            txDescription = '',
            iconCta
        } = this.props.attributes;
        const { showUnderAge, showReserveSeat } = this.props;

        let descriptionData = description !== '' ? description : txDescription;
        if (descriptionData && descriptionData.length > 240) {
            descriptionData = descriptionData.substr(0, 240);
            descriptionData = descriptionData.substr(
                0,
                Math.min(
                    descriptionData.length,
                    descriptionData.lastIndexOf(' ')
                )
            );
            descriptionData = descriptionData + '...';
        }

        //let url = `entertainmentDetail`;
        let url = window.location.href + `/events`;

        return (
            <div className="spa-card-container">
                <div
                    className="card-component spa-card content-align-left"
                    tabindex="0"
                >
                    <div className="card-container">
                        <div className="image-holder">
                            <div className="card-image">
                                <div className="image-lazy-loader">
                                    {image && <Image {...image} />}
                                </div>
                            </div>
                        </div>
                        <div className="content-holder">
                            <div className="text-content">
                                <div className="title-container">
                                    <h3 className="title">{title}</h3>
                                </div>
                            </div>
                            <div className="bottom-block">
                                <div className="spa-card-description">
                                    <div>{description}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {!showUnderAge &&
                    !showReserveSeat &&
                    isbookable && (
                        <div>
                            <div className="type additional">
                                <span>{`Included with your holiday`}</span>
                            </div>
                            <div className="category-book">
                                {/* <a
                                        href={url}
                                        onClick={this.handleClick(categoryId)}
                                    >
                                        <span>Book Now</span>
                                    </a> */}
                                <Link
                                    ariaLabel={iconCta.label}
                                    url={url}
                                    title={iconCta.label}
                                    //dataLinktext={seeDetailsLabel}
                                    linkClassName={`cta-button-outline`}
                                    onClick={(e) =>
                                        this.handleClick(categoryId)
                                    }
                                >
                                    {iconCta.label}{' '}
                                </Link>
                            </div>
                        </div>
                    )}
            </div>
        );
    }
}

export default entertainmentCard;
