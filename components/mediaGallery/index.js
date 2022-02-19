'use strict';

import React from 'react';
import MediaTiles from '../commons/CUK/mediaTiles';

class mediaGallery extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <MediaTiles
                dividerText={this.props.dividerText}
                mediaRow={this.props.mediaRow.map((row) => {
                    row.media = row.media.map((media) => {
                        media.mediaType = 'imageLink';
                        media.imageAltText = media.image.alt;

                        return media;
                    });

                    return row;
                })}
                component={this.props.component}
            />
        );
    }
}

export default mediaGallery;
