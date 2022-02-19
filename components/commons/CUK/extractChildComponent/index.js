'use strict';

/**
 * Iterate and Extract the required Child Component
 *
 * @module modules/extractChildComponent
 * @example <caption>`childComponents` is the Array of Child Components and `childComponentType` is the Child Component which of it's attributes need to be returned</caption>
 * extractChildComponent( childComponents , childComponentType );
 */

/**
 * Accepts the childComponents , childComponentType and returns the Child Component attributes
 *
 * @param {Array} childComponents - Array of Child Components
 * @param {String} childComponentType - Child Component which of it's attributes need to be returned
 * @returns {Array} - Returns an array of filtered Child Components
 */
const extractChildComponent = (childComponents, childComponentType) => {
    if (childComponents && childComponents.filter) {
        let selectedComponent = childComponents.filter(
            (component) => component && childComponentType === component.type
        );

        return selectedComponent.length ? selectedComponent[0] : null;
    }

    return null;
};

export default extractChildComponent;
