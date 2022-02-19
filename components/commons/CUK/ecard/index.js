'use strict';

import React from 'react';
import Image from '../image';
import Link from '../link';
import LinesEllipsis from 'react-lines-ellipsis';
import Dotdotdot from 'react-dotdotdot';
import responsiveHOC from 'react-lines-ellipsis/lib/responsiveHOC';
import SessionStorage from '../session-storage';

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

const getImageText = (alreadyBooked, text) => {
    if (alreadyBooked && text) {
        return (
            <span className="imageText">
                <span className="rightIcon" />
                {text}
            </span>
        );
    } else {
        return null;
    }
};

const getSoldOutText = (text) => {
    if (text) {
        return <span className="soldOutText">{text}</span>;
    } else {
        return null;
    }
};

const getImage = (props) => {
    debugger;
    const {
        image,
        imageLink = {},
        banner,
        imageText,
        imageClass,
        events
    } = props;
    const clickable = imageLink.url && imageLink.url.length ? true : false;
    const { labels } = events;
    let inventory = [];
    if (events && events.inventory && events.inventory.length) {
        inventory = events.inventory.filter((e) => {
            if (e.status.toLowerCase() == 'available') {
                return true;
            }
        });
    }

    if (image && image[0]) {
        return (
            <div
                onClick={(e) => redirectToDetail(e, events)}
                className={
                    inventory.length
                        ? 'image-holder entertainment'
                        : 'image-holder soldOut'
                }
            >
                {props.showOfferBanner ? getBanner(banner) : ''}
                <CheckForLink
                    linkClassName="card-image"
                    clickable={clickable}
                    linkProps={imageLink}
                >
                    {image && <Image {...image} />}
                </CheckForLink>
                {getImageText(events.alreadyBooked, labels.alreadyBookedLabel)}
                {events &&
                    !inventory.length &&
                    getSoldOutText(labels.notAvaialbeLabel)}
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
const redirectToDetail = (e, props) => {
    // console.log('this.props after click', props);
    // debugger;
    e && e.preventDefault();
    SessionStorage.setItem('eventConfigPageData', props);
    let pageUrl = window.location.href.split('/');
    const eventCategory = pageUrl[pageUrl.length - 1];
    window.location.href =
        '../eventsDetails/' + eventCategory + '/' + props.eventCode;
    
    // window.location.href = 'eventsDetails';
};
const getContent = (props) => {
    const { title, contentBannerLabel, contentBannerClass, events } = props;
    return (
        <div className="content-holder">
            <div className="text-content">
                {contentBannerLabel && (
                    <div className={contentBannerClass}>
                        {contentBannerLabel}
                    </div>
                )}
                <div className="title-container">
                    <h3
                        className="title"
                        onClick={(e) => redirectToDetail(e, events)}
                    >
                        {title}
                    </h3>
                </div>
            </div>
        </div>
    );
};

const ecard = (props) => {
    const { className = '', cardLink = {}, events } = props;
    console.log('on entertainment card props-->', props);
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

export default ecard;
