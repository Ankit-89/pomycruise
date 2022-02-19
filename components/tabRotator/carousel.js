import React from 'react';
import Slider from 'react-slick';
import Image from '../commons/CUK/image';
import {
    VIEWPORT_TYPE,
    watchForBreakpoint,
    breakpointsMax as Breakpoints
} from '../../library/js/config/breakpoints';

class carousel extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            isLVP: false,
            isMVP: false
        };

        this.settings = {
            accessibility: true,
            arrows: false,
            dots: false,
            infinite: false,
            slidesToShow: 1,
            slidesToScroll: 1,
            swipe: false,
            beforeChange: props.handleSwipe,
            responsive: [
                {
                    breakpoint: Breakpoints.tabletLandscape,
                    settings: {
                        swipe: true
                    }
                }
            ]
        };
    }

    componentDidMount() {
        const mqlLVP = watchForBreakpoint(VIEWPORT_TYPE.DESKTOP);
        const mqlMVP = watchForBreakpoint(VIEWPORT_TYPE.TABLET_L, true);

        this.checkLVP(mqlLVP);
        mqlLVP.addListener((mql) => {
            this.checkLVP(mql);
        });

        this.checkMVP(mqlMVP);
        mqlMVP.addListener((mql) => {
            this.checkMVP(mql);
        });
    }

    checkLVP = (mql) => {
        this.setState({
            isLVP: mql.matches
        });
    };
    checkMVP = (mql) => {
        this.setState({
            isMVP: mql.matches
        });
    };

    shouldComponentUpdate(nextProps, nextState) {
        return this.state.isMVP !== nextState.isMVP;
    }

    render() {
        const { storyList } = this.props;

        return (
            <Slider ref={(c) => (this.slider = c)} {...this.settings}>
                {storyList.map(({ image }, i) => (
                    <div className="story-slide-container" key={i}>
                        <div className="story-slide">
                            <div className="image-holder">
                                {image && <Image {...image} />}
                            </div>
                        </div>
                    </div>
                ))}
            </Slider>
        );
    }
}

export default carousel;
