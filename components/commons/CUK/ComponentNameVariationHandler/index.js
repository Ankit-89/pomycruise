/* eslint no-underscore-dangle: ["error", { "allow": ["_satellite"] }] */
'use strict';
const ComponentNameVariationHandler = (() => {
    const privateProperties = new WeakMap();

    class ComponentNameVariationHandler {

        constructor( variationIdentifier, componentBaseName, componentID = '') {
            privateProperties.set(this, { variationIdentifier, componentBaseName, componentID });
        }

        get name() {
            const { componentBaseName, componentID, variationIdentifier } = privateProperties.get(this);

            if ( variationIdentifier ) {
                return `${componentBaseName}${componentID}${variationIdentifier}`;
            }

            return componentBaseName;
        }

        set props(variationIdentifier) {
            const { componentBaseName, componentID } = privateProperties.get(this);

            privateProperties.set(this, { variationIdentifier, componentBaseName, componentID });
        }
    }

    return ComponentNameVariationHandler;
})();

export class RoomDetailNameVariationHandler extends  ComponentNameVariationHandler {
    constructor(variationIdentifier) {
        super(variationIdentifier, 'roomDetail');
    }
}