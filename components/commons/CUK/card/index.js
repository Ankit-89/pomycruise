'use strict';

import React from 'react';
import Image from '../image';
import Link from '../link';
import LinesEllipsis from 'react-lines-ellipsis';
import Dotdotdot from 'react-dotdotdot';
import responsiveHOC from 'react-lines-ellipsis/lib/responsiveHOC';

const ResponsiveEllipsis = responsiveHOC()(LinesEllipsis);

const CheckForLink = (props) => {
    const { clickable, children, linkProps = {}, linkClassName = '' } = props;

    if (clickable) {
        return (
            <Link {...linkProps} linkClassName={linkClassName}>
                {children}
            </Link>
        );
    } else {
        return <div className={linkClassName}>{children}</div>;
    }
};

const getBanner = (bannerLabel) => {
    if (bannerLabel) {
        return <div className="top-banner">{bannerLabel}</div>;
    } else {
        return null;
    }
};

const getImage = (props) => {
    const { image, imageLink = {}, banner } = props;
    const clickable = imageLink.url && imageLink.url.length ? true : false;

    if (image && image[0]) {
        return (
            <div className="image-holder">
                {props.showOfferBanner ? getBanner(banner) : ''}
                <CheckForLink
                    linkClassName="card-image"
                    clickable={clickable}
                    linkProps={imageLink}
                >
                    {image && <Image {...image} />}
                </CheckForLink>
            </div>
        );
    } else {
        return null;
    }
};

const getDescription = (description) => {
    if (description && description.length) {
        return (
            <div className="description-container">
                <ResponsiveEllipsis
                    text={description}
                    maxLine="3"
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

const getCta = (props) => {
    const { ctaProps = {}, children } = props;

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

const getContent = (props) => {
    const {
        title,
        titleLink = {},
        description,
        contentBannerLabel,
        contentBannerClass
    } = props;
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
                {getDescription(description)}
            </div>
            {getCta(props)}
        </div>
    );
};

const card = (props) => {
    const { className = '', cardLink = {} } = props;
    const cardClickable = cardLink.url && cardLink.url.length;

    return (
        <div className={`card-component ${className}`} tabIndex="0">
            <CheckForLink
                clickable={cardClickable}
                linkClassName="card-container"
                linkProps={cardLink}
            >
                {getImage(props)}
                {getContent(props)}
            </CheckForLink>
        </div>
    );
};

export default card;
