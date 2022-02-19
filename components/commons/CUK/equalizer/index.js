/**
 * Equilizer - Equilizer method which sets max-height for the tile
 */

'use strict';

export default function(elements) {
    let maxHeight = 0;

    for (let i = 0; i < elements.length; i++) {
        const currentHeight = elements[i].offsetHeight;

        if (currentHeight > maxHeight) maxHeight = currentHeight;
    }

    if (maxHeight === 0) {
        maxHeight = 'auto';
    }

    for (let i = 0; i < elements.length; i++) {
        elements[i].style.height = `${maxHeight}px`;
    }
}
