import { breakpointsMax as Breakpoints } from '../../library/js/config/breakpoints';

const sliderConfig = {
    accessibility: true,
    arrows: false,
    dots: true,
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: false,
    autoplaySpeed: 4000,
    swipe: false,
    responsive: [
        {
            breakpoint: Breakpoints.mobile,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
                centerMode: true,
                centerPadding: '24px',
                swipe: true
            }
        },
        {
            breakpoint: Breakpoints.tablet,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
                centerMode: true,
                centerPadding: '60px',
                swipe: true
            }
        }
    ]
};

export default sliderConfig;
