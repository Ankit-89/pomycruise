import { breakpointsMax as Breakpoints } from '../../library/js/config/breakpoints';

const portsSliderConfig = {
    accessibility: true,
    dots: false,
    infinite: false,
    arrows: false,
    slidesToShow: 5,
    slidesToScroll: 5,
    swipe: false,
    responsive: [
        {
            breakpoint: Breakpoints.mobile,
            settings: {
                slidesToShow: 2.5,
                slidesToScroll: 2,
                centerMode: false,
                swipe: true,
                centerPadding: '24px',
                focusOnSelect: true
            }
        },
        {
            breakpoint: Breakpoints.mobileLandscape,
            settings: {
                slidesToShow: 3,
                slidesToScroll: 3,
                centerMode: false,
                swipe: true,
                centerPadding: '5px'
            }
        },
        {
            breakpoint: Breakpoints.tablet,
            settings: {
                slidesToShow: 3,
                slidesToScroll: 3,
                centerMode: false,
                centerPadding: '50px',
                swipe: true
            }
        },
        {
            breakpoint: Breakpoints.tabletLandscape,
            settings: {
                slidesToShow: 3,
                slidesToScroll: 1,
                centerPadding: '30px',
                centerMode: false,
                swipe: true
            }
        },
        {
            breakpoint: Breakpoints.desktop,
            settings: {
                slidesToShow: 5,
                slidesToScroll: 5,
                centerMode: false,
                centerPadding: '0px',
                swipe: true
            }
        }
    ]
};

export default portsSliderConfig;
