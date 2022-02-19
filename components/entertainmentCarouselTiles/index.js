'use strict';

import React from 'react';
import Slider from 'react-slick';
import Image from '../commons/CUK/image';
import SessionStorage from '../commons/CUK/session-storage';

class entertainmentCarouselTiles extends React.Component {
    constructor(props) {
        super(props);

        this.settings = {
            dots: false,
            infinite: false,
            speed: 500,
            slidesToShow: 4,
            slidesToScroll: 1,
            responsive: [
                {
                    breakpoint: 1025,
                    settings: {
                        slidesToShow: 3.5,
                        slidesToScroll: 1,
                        infinite: false,
                        dots: false,
                        activeSlide: 3,
                        prevArrow: false,
                        nextArrow: false,
                        arrows: false
                    }
                },
                // {
                //     breakpoint: 1000,
                //     settings: {
                //         slidesToShow: 3.5,
                //         activeSlide: 3,
                //         slidesToScroll: 1,
                //         infinite: false,
                //         dots: false,
                //         prevArrow: false,
                //         nextArrow: false,
                //         arrows: false
                //     }
                // },
                {
                    breakpoint: 768,
                    settings: {
                        slidesToShow: 2.5,
                        activeSlide: 2,
                        slidesToScroll: 1,
                        infinite: false,
                        prevArrow: false,
                        nextArrow: false,
                        arrows: false
                    }
                },
                {
                    breakpoint: 480,
                    settings: {
                        slidesToShow: 1.5,
                        activeSlide: 1,
                        slidesToScroll: 1,
                        prevArrow: false,
                        nextArrow: false,
                        arrows: false
                    }
                }
            ]
        };
    }

    componentDidMount() {}

    componentWillMount() {}
    redirectToeventsPage(slide) {
        SessionStorage.setItem('eventHeaderData', slide.attributes);
        window.location.href =
            slide.attributes.iconCta.url + '/' + slide.attributes.categoryId;
    }

    filterGridItems = (gridItem) =>
        gridItem.attributes.shipFilter &&
        gridItem.attributes.shipFilter.length > 0
            ? gridItem.attributes.shipFilter.indexOf(this.shipCode) > -1
            : true;

    render() {
        const header = SessionStorage.getItem('header');
        const { shipCode } = header;
        this.shipCode = shipCode;
        let sliderData = this.props.childComponents;
        const newGridList = sliderData.filter(this.filterGridItems);

        return (
            <div className="carousal-container">
                <div className="nav">
                    <Slider ref={(c) => (this.slider = c)} {...this.settings}>
                        {newGridList.map((slide, index) => {
                            return (
                                <div
                                    className="entertainmentImage"
                                    key={index}
                                    onClick={(e) =>
                                        slide.attributes.isbookable &&
                                        slide.attributes.iconCta.url
                                            ? this.redirectToeventsPage(slide)
                                            : e.preventDefault()
                                    }
                                    style={{
                                        cursor:
                                            slide.attributes.isbookable &&
                                            slide.attributes.iconCta.url
                                                ? 'pointer'
                                                : 'default'
                                    }}
                                >
                                    {slide.attributes.image && (
                                        <Image
                                            {...slide.attributes.image}
                                            className="carouselImage"
                                        />
                                    )}
                                    <div className="details">
                                        {slide.attributes.title && (
                                            <h4 className="title">
                                                {slide.attributes.title}
                                            </h4>
                                        )}
                                        {slide.attributes.description && (
                                            <span className="description">
                                                {slide.attributes.description}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </Slider>
                    {/* <div
                        className="nav_prev"
                        onClick={(e) => {
                            this.changeSelectedIndex(-1);
                        }}
                        data-linktext={'prev day'}
                        data-componentname={sliderData}
                    /> */}
                </div>
            </div>
        );
    }
}

export default entertainmentCarouselTiles;
