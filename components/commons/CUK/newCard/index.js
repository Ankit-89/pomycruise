'use strict';

import React from 'react';
import Image from '../image';
import Link from '../link';
import CheckForLink from './checkForLink';
import LinesEllipsis from 'react-lines-ellipsis';
import Dotdotdot from 'react-dotdotdot';
import responsiveHOC from 'react-lines-ellipsis/lib/responsiveHOC';

const ResponsiveEllipsis = responsiveHOC()(LinesEllipsis);

class newCard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showImageContainer: true
        };
    }

    getBanner = (bannerLabel) => {
        if (bannerLabel) {
            return <div className="top-banner">{bannerLabel}</div>;
        } else {
            return null;
        }
    };

    getImage = () => {
        const { image, imageLink = {}, banner } = this.props;
        const clickable = imageLink.url && imageLink.url.length ? true : false;

        const { showImageContainer } = this.state;

        if (image && image[0]) {
            return (
                <div className="image-holder">
                    {this.props.showOfferBanner ? getBanner(banner) : ''}
                    <CheckForLink
                        linkClassName="card-image"
                        clickable={clickable}
                        linkProps={imageLink}
                    >
                        {showImageContainer && image && <Image {...image} />}
                    </CheckForLink>
                </div>
            );
        } else {
            return null;
        }
    };

    getDescription = (description) => {
        const { showImageContainer } = this.state;
        if (description && description.length) {
            return (
                <div className="description-container">
                    <ResponsiveEllipsis
                        text={description}
                        maxLine={showImageContainer ? '3' : '10'}
                        ellipsis="..."
                        trimRight
                        basedOn="letters"
                    />
                </div>
            );
        } else {
            return null;
        }
    };

    getCta = () => {
        const { ctaProps = {}, children } = this.props;

        if (ctaProps.url && ctaProps.url.length) {
            return (
                <div className="cta-container">
                    <Link {...ctaProps} />
                </div>
            );
        } else if (children) {
            return <div className="bottom-block">{children}</div>;
        } else {
            return null;
        }
    };

    getContent = () => {
        const {
            title,
            titleLink = {},
            description,
            contentBannerLabel,
            contentBannerClass
        } = this.props;
        const titleClick = titleLink.url && titleLink.url.length ? true : false;

        return (
            <div className="content-holder">
                <div className="text-content">
                    {contentBannerLabel && (
                        <div className={contentBannerClass}>
                            {contentBannerLabel}
                        </div>
                    )}
                    <CheckForLink
                        linkClassName="title-container"
                        clickable={titleClick}
                        linkProps={titleLink}
                    >
                        <Dotdotdot clamp={2}>
                            <h3 className="title">{title}</h3>
                        </Dotdotdot>
                    </CheckForLink>
                    {this.getDescription(description)}
                </div>
                {this.getCta()}
            </div>
        );
    };

    render() {
        const { className = '', cardLink = {}, cardType = false } = this.props;
        const cardClickable = cardLink.url && cardLink.url.length;
        const { showImageContainer } = this.state;

        return (
            <div className={`new-card-component ${className}`} tabIndex="0">
                <CheckForLink
                    clickable={cardClickable}
                    linkClassName="new-card-container"
                    linkProps={cardLink}
                >
                    {this.getImage()}
                    {this.getContent()}
                </CheckForLink>
            </div>
        );
    }
}

export default newCard;
