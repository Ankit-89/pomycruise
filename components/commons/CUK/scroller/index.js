'use strict';

// * Export a standard `fetch` method containing necessary global options
// *
// * https://developer.mozilla.org/en-US/docs/Web/Events/scroll
// *
// * @module scroller
// * @param {Object} DOM element to attach listener to
// * @param {Func} Callback method to return event object
// * @returns {Func} Method to remove event listener from element
function scroller({ element, callback }) {
    let ticking = false;

    element.addEventListener('scroll', (e) => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                callback(e);
                ticking = false;
            });
        }

        ticking = true;
    });

    const remove = () => {
        element.removeEventListener('scroll', callback);
    };

    return {
        remove
    };
}

export default scroller;
