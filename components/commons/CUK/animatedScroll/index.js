'use strict';

/**
 * Animate page scroll.
 *
 * @module modules/animatedScroll
 * @example <caption>`1000` is the target pageY position and `500` is the duration in ms</caption>
 * animatedScroll( 1000 , 500 );
 */

/**
 * Returns the appropriate method if `requestAnimationFrame` is not supported.
 *
 * @returns {Function}
 */
const getAnimationFrame = () => {
    if (typeof window !== 'undefined') {
        if (window.requestAnimationFrame) {
            return window.requestAnimationFrame;
        } else if (window.webkitRequestAnimationFrame) {
            return window.webkitRequestAnimationFrame;
        } else {
            return (callback, element, delay) => {
                window.setTimeout(
                    callback,
                    delay || 1000 / 60,
                    new Date().getTime()
                );
            };
        }
    }
};

/**
 * Accepts the final scroll position and duration, and animates scroll accordingly.
 *
 * @param {Number} finalPosY - Final Y position to reach.
 * @param {Number} duration - scroll duration in ms.
 * @param {Object} scrollElement - Element in which scroll should happen (if any, other than window).
 */
const animatedScroll = (finalPosY, duration, scrollElement) => {
    const startingY = scrollElement
        ? scrollElement.scrollTop
        : window.pageYOffset || (typeof document !== 'undefined' && document.documentElement.scrollTop);
    const diff = finalPosY - startingY;
    const animationFrameFunction = getAnimationFrame();
    let start;

    function step(timestamp) {
        if (!start) start = timestamp;
        // Elapsed miliseconds since start of scrolling.
        let time = timestamp - start;
        // Get percent of completion in range [0, 1].
        let percent = Math.min(time / duration, 1);

        if (scrollElement) {
            scrollElement.scrollTop = startingY + diff * percent;
        } else {
            window.scrollTo(0, startingY + diff * percent);
        }

        // Proceed with animation as long as we wanted it to.
        if (time < duration) {
            animationFrameFunction(step);
        }
    }

    animationFrameFunction(step);
};

export default animatedScroll;
