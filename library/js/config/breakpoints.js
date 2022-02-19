'use strict';

// Determines a breakpoints max-width. Max-width is needed for Slick Carousel implementations
const breakpointsMax = {
    mobile: 480,
    mobileLandscape: 767,
    tablet: 980,
    tabletLandscape: 1024,
    desktop: 1480,
    desktopXl: 1900,
    desktopXlSlider: 10000
};

// Min-widths
const breakpointsMin = {
    mobileLandscape: 481,
    tablet: 768,
    tabletLandscape: 981,
    desktop: 1025,
    desktopXl: 1481
};

// Min-width Values used for matchMedia/watchFor
const matchMediaMin = {
    mobileLandscape: `(min-width: ${breakpointsMin.mobileLandscape}px)`,
    tablet: `(min-width: ${breakpointsMin.tablet}px)`,
    tabletLandscape: `(min-width: ${breakpointsMin.tabletLandscape}px)`,
    desktop: `(min-width: ${breakpointsMin.desktop}px)`,
    desktopXl: `(min-width: ${breakpointsMin.desktopXl}px)`
};

// Max-width Values used for matchMedia/watchFor
const matchMediaMax = {
    mobile: `(max-width: ${breakpointsMax.mobile}px)`,
    mobileLandscape: `(max-width: ${breakpointsMax.mobileLandscape}px)`,
    tablet: `(max-width: ${breakpointsMax.tablet}px)`,
    tabletLandscape: `(max-width: ${breakpointsMax.tabletLandscape}px)`,
    desktop: `(max-width: ${breakpointsMax.desktop}px)`,
    desktopXl: `(max-width: ${breakpointsMax.desktopXl}px)`
};

const VIEWPORT_TYPE = {
    MOBILE: 'mobile',
    MOBILE_L: 'mobileLandscape',
    TABLET: 'tablet',
    TABLET_L: 'tabletLandscape',
    DESKTOP: 'desktop',
    DESKTOP_XL: 'desktopXl'
};

/**
 * Watches for breakpoint definitions that are required to meet component viewport requirements. This method passes those values to window.matchMedia, returning a configured instance of window.matchMedia.
 * @param {string} viewportType type of viewport - i.e. 'desktop', 'tablet'
 * @param {boolean} useMaxWidth required if a max-width value is needed by window.matchMedia
 * @returns {function} a configured instance of window.matchMedia
 */
const watchForBreakpoint = (viewportType, useMaxWidth) => {
    let matchMediaValue;
    let matchMediaObj = useMaxWidth ? matchMediaMax : matchMediaMin;

    if (Array.isArray(viewportType) && viewportType.length >= 3) {
        throw new Error(
            'viewportType array must only contain two values - a min and a max breakpoint definition.'
        );
    }

    if (Array.isArray(viewportType)) {
        viewportType.forEach((el, idx) => {
            matchMediaValue = `${matchMediaMin[el]} and ${matchMediaMax[el]}`;
        });
    } else {
        matchMediaValue = matchMediaObj[viewportType];
    }

    return window.matchMedia(matchMediaValue);
};

export { VIEWPORT_TYPE, breakpointsMax, breakpointsMin, watchForBreakpoint };
