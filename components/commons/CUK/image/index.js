/*
 * Image - Common component for images
 */
'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { Lazy } from 'react-lazy';
import { breakpoint } from '../../../../library/js/config';

const Breakpoints = breakpoint.breakpointsMin;
const watchForBreakpoint = breakpoint.watchForBreakpoint;

let picturefill;

class image extends React.PureComponent {
    buildSourceTags = (image) =>
        Object.keys(image)
            .sort()
            .reverse()
            .map((key) => {
                if (
                    key !== 'aspectRatio' &&
                    key !== 'alt' &&
                    key !== 'disableLazyLoad' &&
                    key !== 'onLoadHandler' &&
                    key !== 'className' &&
                    key !== 'onError' &&
                    key !== 'reevaluate'
                ) {
                    const srcSet =
                        typeof image[key] === 'object'
                            ? Object.keys(image[key])
                                  .filter((res) => res !== 'aspectRatio')
                                  .map(
                                      (res) =>
                                          `${encodeURI(image[key][res])} ${res}`
                                  )
                                  .join(',')
                            : '';
                    let breakpointMap = key;

                    if (key === '376') {
                        breakpointMap = Breakpoints.tablet;
                    } else if (key === '769') {
                        breakpointMap = Breakpoints.desktop;
                    }

                    return (
                        <source
                            key={key}
                            srcSet={srcSet}
                            media={`(min-width: ${breakpointMap}px)`}
                        />
                    );
                } else {
                    return null;
                }
            });

    removeSpinner(event) {
        this.LazyImage.el.classList.remove('spinner');
        this.LazyImage.el.style.display = 'inline';
    }

    componentDidUpdate() {
        if (this.props.reevaluate) {
            picturefill = picturefill ? picturefill : require('picturefill');
            this.imageElem &&
                picturefill({ reevaluate: true, elements: [this.imageElem] });
        }
    }

    componentDidMount() {
        if (
            this.LazyImage &&
            this.LazyImage.el &&
            this.props &&
            this.props['0']
        ) {
            const aspectRatio =
                watchForBreakpoint(['mobile']).matches ||
                watchForBreakpoint(['mobileLandscape']).matches
                    ? this.props['0'].aspectRatio
                    : watchForBreakpoint(['tablet']).matches ||
                      watchForBreakpoint(['tabletLandscape']).matches
                        ? this.props['376'].aspectRatio
                        : watchForBreakpoint(['desktop']).matches ||
                          watchForBreakpoint(['desktopXL']).matches
                            ? this.props['769'].aspectRatio
                            : undefined;

            this.calculateImageHeight(aspectRatio);
        }
    }

    calculateImageHeight = (aspectRatio) => {
        if (
            !aspectRatio ||
            typeof aspectRatio === 'undefined' ||
            !this.LazyImage.el.offsetWidth
        ) {
            return;
        }
        const width = this.LazyImage.el.offsetWidth;
        const height = width * (1 / aspectRatio);

        this.LazyImage.el.style.height = `${height}px`;
        this.LazyImage.el.style.display = 'block';
    };

    render() {
        const {
            ariaHidden,
            dataLinktext,
            dataContentname,
            dataContenttype,
            dataComponentname,
            onLoadHandler,
            alt = '',
            disableLazyLoad,
            className = '',
            onError
        } = this.props;
        const sourceTags = this.buildSourceTags(this.props);
        const baseImage =
            this.props['0'] !== undefined ? this.props['0']['2x'] : '';

        if (sourceTags.length) {
            if (!disableLazyLoad) {
                return (
                    <Lazy
                        cushion={1000}
                        className="image-lazy-loader spinner"
                        ref={(ref) => {
                            this.LazyImage = ref;
                        }}
                        onLoad={() => {
                            picturefill = picturefill
                                ? picturefill
                                : require('picturefill');
                            this.imageElem &&
                                picturefill({ elements: [this.imageElem] });
                        }}
                    >
                        <picture>
                            {sourceTags}
                            <img
                                ref={(imageElem) => {
                                    this.imageElem = imageElem;
                                }}
                                src={encodeURI(baseImage)}
                                aria-hidden={ariaHidden}
                                data-linktext={dataLinktext}
                                data-contentname={dataContentname}
                                data-contenttype={dataContenttype}
                                data-componentname={dataComponentname}
                                className={className}
                                onLoad={(event) => {
                                    onLoadHandler
                                        ? onLoadHandler()
                                        : this.removeSpinner(event);
                                }}
                                onError={(event) => {
                                    this.removeSpinner(event);
                                    onError && onError(event);
                                }}
                                alt={alt}
                            />
                        </picture>
                    </Lazy>
                );
            } else {
                return (
                    <div className="image-lazy-loader lazy-loading-disabled">
                        <picture>
                            {sourceTags}
                            <img
                                ref={(imageElem) => {
                                    this.imageElem = imageElem;
                                }}
                                src={encodeURI(baseImage)}
                                aria-hidden={ariaHidden}
                                data-linktext={dataLinktext}
                                data-contentname={dataContentname}
                                data-contenttype={dataContenttype}
                                data-componentname={dataComponentname}
                                className={className}
                                onLoad={(event) => {
                                    onLoadHandler ? onLoadHandler() : '';
                                }}
                                onError={(event) => {
                                    onError && onError(event);
                                }}
                                alt={alt}
                            />
                        </picture>
                    </div>
                );
            }
        } else {
            return null;
        }
    }
}

image.propTypes = {
    alt: PropTypes.string.isRequired,
    '0': PropTypes.object.isRequired
};

image.defaultProps = {
    disableLazyLoad: false
};

export default image;
