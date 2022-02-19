'use strict';

import React from 'react';
import Card from '../commons/CUK/card';
import Link from '../commons/CUK/link';
import LinesEllipsis from 'react-lines-ellipsis';
import responsiveHOC from 'react-lines-ellipsis/lib/responsiveHOC';
import { getConfig } from '../commons/CUK/utilities';

const ResponsiveEllipsis = responsiveHOC()(LinesEllipsis);

class spaCard extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            showCTA: getConfig('isSPAEnabled') == 'true' ? true : false || false
        }
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

    render() {
        const { name = '', description = '', image, textAlignment, txName = '', txDescription = '' } = this.props;
        const cardProps = {
            image,
            textAlignment,
            imageLink: false,
            title: name !== '' ? name : txName,
            titleLink: false
        };
        const cardAlignmentClass =
            textAlignment === 'center' ? textAlignment : 'left';

        let descriptionData = description !== '' ? description : txDescription;
        if (descriptionData && descriptionData.length > 240) {
            descriptionData = descriptionData.substr(0, 240);
            descriptionData = descriptionData.substr(0, Math.min(descriptionData.length, descriptionData.lastIndexOf(" ")));
            descriptionData = descriptionData + '...';
        }
        return (
            <div className="spa-card-container">
                <Card
                    {...cardProps}
                    className={`spa-card content-align-${cardAlignmentClass}`}
                >
                    <div className="spa-card-description">
                        {/* <ResponsiveEllipsis
                            text={description !== '' ? description : txDescription}
                            maxLine="3"
                            ellipsis="..."
                            trimRight
                            basedOn="letters"
                        /> */}
                        <div>
                            {descriptionData}
                        </div>
                    </div>
                </Card>
                {this.state.showCTA && <div className="cta-content">{this.createDetailsCta()}</div>}
            </div>
        );
    }
}

export default spaCard;
