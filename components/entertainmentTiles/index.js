'use strict';

import React from 'react';
import Card from '../commons/CUK/ecard';
import Link from '../commons/CUK/link';
// import LinesEllipsis from 'react-lines-ellipsis';
// import responsiveHOC from 'react-lines-ellipsis/lib/responsiveHOC';

// const ResponsiveEllipsis = responsiveHOC()(LinesEllipsis);

class entertainmentTiles extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            newType: false
        };
        debugger;
    }

    componentWillMount() {
        const { newType } = this.props;
        if (newType) {
            const { description, title, image } = this.props;
            this.setState({
                description: description,
                image: image,
                name: title,
                textAlignment: 'center',
                newType: true
            });
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
        const {
            name = '',
            description = '',
            image,
            textAlignment,
            txName = '',
            txDescription = ''
        } = this.props;
        const cardProps = {
            image,
            textAlignment,
            imageLink: false,
            title: name !== '' ? name : txName,
            titleLink: false
        };
        if (this.state.newType) {
            cardProps[`image`] = image;
            cardProps[`textAlignment`] = this.state.textAlignment;
            cardProps[`imageLink`] = false;
            cardProps[`title`] = this.state.name;
            cardProps[`titleLink`] = false;
        }
        const cardAlignmentClass =
            textAlignment === 'center' ? textAlignment : 'left';

        let descriptionData = description !== '' ? description : txDescription;
        if (descriptionData == void 0 || descriptionData == '') {
            descriptionData = this.state.description;
        }
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
        return (
            <div className="entertainment-card-container">
                <Card
                    {...cardProps}
                    events={this.props}
                    className={`entertainment-card content-align-${cardAlignmentClass}`}
                />
            </div>
        );
    }
}

export default entertainmentTiles;
