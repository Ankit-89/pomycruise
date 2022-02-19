export class DescriptionManager {
    constructor(
        shortDescription,
        longDescription,
        shortDescriptionDefault = false
    ) {
        this.shortDescription = shortDescription;
        this.longDescription = longDescription;
        this.shortDescriptionDefault = shortDescriptionDefault;
    }

    /**
     * CARNIVALCO-10887
     *
     * Appends the description to the short description, if shortDescriptionDefault = true.
     * Otherwise it returns the description.
     *
     * @returns {String} returns a version of the description text
     */
    getDescriptionText() {
        const {
            shortDescription,
            longDescription,
            shortDescriptionDefault
        } = this;

        return shortDescriptionDefault
            ? `${shortDescription} ${longDescription}`
            : longDescription;
    }
}
