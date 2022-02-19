'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import analytics from '../analytics';

class carouselControls extends React.PureComponent {
    /**
     * constructor
     * @param {React-props} props - Props passed to this module
     */
    constructor(props) {
        super(props);
    }

    componentDidUpdate() {
        // analytics.clickTracking(this);
    }
    /**
     * Gives markup for anchor tag
     * @returns {React-markup} - Returns React markup to generate anchor tag
     */
    render() {
        const dividerText = this.props.dividerText
            ? this.props.dividerText
            : 'OF';
        const ariaHidden = this.props.ariaHidden
            ? this.props.ariaHidden
            : 'true';
        const dataClicktype = this.props.dataClicktype
            ? this.props.dataClicktype
            : 'general';
        const {
            previousLabel,
            tabIndex,
            dataComponentName,
            paginationLabel,
            nextLabel,
            prevSlide,
            dataLinktextprev,
            dataLinktextnext,
            disablePrev,
            disableNext,
            activeSlide,
            totalSlides,
            nextSlide
        } = this.props;

        return (
            <div className="carousel-controls">
                <button
                    tabIndex={tabIndex}
                    className={`button prev-btn ${
                        this.props.disabledPrev ? 'slick-disabled' : ''
                    }`}
                    disabled={disablePrev}
                    aria-hidden={ariaHidden}
                    data-clicktype={dataClicktype}
                    data-linktext={dataLinktextprev}
                    data-componentname={dataComponentName}
                    onClick={prevSlide}
                >
                    <span>{previousLabel}</span>
                </button>
                <span>
                    {paginationLabel} {activeSlide} {dividerText} {totalSlides}
                </span>
                <button
                    className={`button next-btn ${
                        this.props.disabledNext ? 'slick-disabled' : ''
                    }`}
                    disabled={disableNext}
                    tabIndex={tabIndex}
                    aria-hidden={ariaHidden}
                    data-componentname={dataComponentName}
                    data-clicktype={dataClicktype}
                    data-linktext={dataLinktextnext}
                    onClick={nextSlide}
                >
                    <span>{nextLabel}</span>
                </button>
            </div>
        );
    }
}
/**
 * propTypes
 * @property {object} passed properties to generate carouselControls
 */
carouselControls.propTypes = {
    dividerText: PropTypes.string,
    prevSlide: PropTypes.func,
    nextSlide: PropTypes.func,
    disabledPrev: PropTypes.bool,
    disabledNext: PropTypes.bool
};

export default carouselControls;
