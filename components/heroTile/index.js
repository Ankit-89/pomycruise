import React from 'react';
import PropTypes from 'prop-types';
import HeroTileModule from '../commons/CUK/heroTileModule';

class heroTile extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return <HeroTileModule {...this.props} headingOneUsed={true} />;
    }
}

heroTile.propTypes = {
    type: PropTypes.string.isRequired,
    image: PropTypes.object,
    cardAlignment: PropTypes.string.isRequired,
    logo: PropTypes.object,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    ctaIcon: PropTypes.object,
    ctaType: PropTypes.string,
    contentLabel: PropTypes.string,
    viewCta: PropTypes.shape({
        label: PropTypes.string,
        url: PropTypes.string,
        isExternal: PropTypes.bool
    })
};

heroTile.defaultProps = {
    contentLabel: 'Hero Video Modal'
};

export default heroTile;
