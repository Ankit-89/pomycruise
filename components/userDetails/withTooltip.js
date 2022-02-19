import React, { Component } from 'react';
import analytics from '../commons/CUK/analytics';

class withTooltip extends Component {
    constructor(props) {
        super(props);
        this.state = { tooltipHover: false };
    }

    handleMouseIn = () => {
        this.setState(() => ({ tooltipHover: true }));
    };

    handleMouseOut = () => {
        this.setState(() => ({ tooltipHover: false }));
    };
    closeTooltip = (e) => {
        analytics.clickTracking(this);
        e.preventDefault();
        this.setState(() => ({ tooltipHover: false }));
    };
    render() {
        const { children, tooltipLabel } = this.props;
        const { tooltipHover } = this.state;
        const display = tooltipHover ? 'block' : 'none';
        const tooltipStyle = { display };
        return (
            <div className="tooltip-wrapper">
                {children}
                <div
                    className={`tooltip__icon show-focus-outlines ${this.props.customClassName}`}
                    onMouseOver={this.handleMouseIn}
                    onMouseOut={this.handleMouseOut}
                    onFocus={this.handleMouseIn}
                    onBlur={this.handleMouseOut}
                    tabIndex="0" 
                    aria-label={tooltipLabel}
                >
                    <div className="tooltip__dd" style={tooltipStyle}>
                        <a
                            className="tooltip__close"
                            onClick={this.closeTooltip}
                        />
                        <p>{tooltipLabel}</p>
                    </div>
                </div>
            </div>
        );
    }
}

export default withTooltip;
