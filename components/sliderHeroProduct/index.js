'use strict';

import React from 'react';
import Slider from 'react-slick';
import TitleH1Mycruise from '../titleH1Mycruise';
import FetchData from '../commons/CUK/fetch-data';
import SpaHero from './spaHero';
import ShorexCard from '../../components/shorexCard';
import DiningCard from '../../components/diningCard';
// import SpaCard from '../../components/spaCard';
// import ProductsVerticalTiles from '../../components/productsVerticalTiles';
import extractChildComponent from '../commons/CUK/extractChildComponent';
import DiningOverlay from '../diningOverlay';
import sliderConfig from './sliderConfig';
import SessionStorage from '../commons/CUK/session-storage';
import {
    VIEWPORT_TYPE,
    watchForBreakpoint,
    breakpointsMax as Breakpoints
} from '../../library/js/config/breakpoints';
import validateSession from '../commons/CUK/validateSession';

class sliderHeroProduct extends React.Component {
    constructor(props) {
        super(props);

        this.headerData = {
            header: SessionStorage.getItem('header'),
            apiKey:
                typeof window !== 'undefined'
                    ? window.configs.apikeyMycruise
                    : ''
        };

        this.state = {
            error: null,
            isLoaded: false,
            products: false,
            showModal: false,
            chosenProduct: false
        };
    }

//componentDidMount
    componentDidMount() {
        if (!validateSession.checkCookie(['wcmmode'])) {
            const {
                props: { productCategory, diningSearchServlet }
            } = this;
            let urlString;
            const shipCode = this.headerData.header.shipCode;
            const { services } = this.props;
            // if (!this.props.productType === 'SPA') {
            switch (this.props.productType) {
                case 'DINING':
                    urlString = `${diningSearchServlet}.hero.${shipCode}.${productCategory}.json`;
                    this.case = 'DINING';
                    break;
                case 'SPA':
                    // const { brand } = services.headers;
                    const header = SessionStorage.getItem('header');
                    const { embarkationDate } = header;
                    // const API = `${treatmentsApi}/${productId}_Oasis/treatments`;
                    const url = services.urls.spaHeroApi;
                    urlString = url;
                    this.case = 'SPA';
                    break;
                case 'SHOREX':
                    const { productSearchApi } = services.urls;
                    const pageSize = 6;
                    const productType = 'SHOREX';
                    const query =
                        ':merchandised:merchandisingCategoryCodes:HERO';
                    urlString = `${productSearchApi}?productType=${productType}&pageSize=${pageSize}&query=${query}`;
                    this.case = 'SHOREX';
                    break;
            }
            // const urlString = `${productSearchServlet}.hero.${shipCode}.${productCategory}.json`;
            FetchData(urlString, {
                method: 'GET',
                headers: {
                    'X-CommonData': JSON.stringify(this.headerData.header),
                    'X-Source-Identity-Token-0': this.headerData.apiKey
                }
            }).then(
                (response) => {
                    let products = [];
                    switch (this.case) {
                        case 'DINING':
                            products =
                                response.venues.length > 0
                                    ? response.venues
                                    : [];
                            break;
                        case 'SPA':
                            products =
                                response.treatments.length > 0
                                    ? response.treatments
                                    : [];
                            break;
                        case 'SHOREX':
                            products =
                                response.products.length > 0
                                    ? response.products
                                    : [];
                            break;
                    }
                    this.setState(
                        () => ({
                            isLoaded: true,
                            products: products
                        }),
                        () => {
                            window.dispatchEvent(new Event('resize'));
                        }
                    );
                },
                (error) => {
                    this.setState(
                        () => ({
                            isLoaded: true,
                            error,
                            products: false
                        }),
                        () => {
                            window.dispatchEvent(new Event('resize'));
                        }
                    );
                }
            );
            // }
        }
    }

    createTitle(h1TitleProps) {
        return;
    }

    createSlider(products) {
        const {
            props: { labels },
            handleOverlayOpen
        } = this;
        if (this.props.sliderAutoplay) {
            sliderConfig.autoplaySpeed = this.props.sliderAutoplay;
        }
        let image = {};
        const { childComponents, ctaType, productCategory } = this.props;
        const productsVerticalTilesProps = extractChildComponent(
            childComponents,
            'productsVerticalTiles'
        );
        return (
            <Slider {...sliderConfig} ref={(c) => (this.slider = c)}>
                {//     this.props.productType === 'SPA' ? (
                //     <ProductsVerticalTiles
                //         {...productsVerticalTilesProps.attributes}
                //         services={productsVerticalTilesProps.services}
                //         heroVariation={productCategory}
                //     />
                // ) :
                // (
                products.map((product, i) => {
                    switch (this.props.productType) {
                        case 'DINING':
                            const { overviewImage, name } = product;
                            image = {
                                alt: name,
                                0: {
                                    '1x': `${overviewImage}.image.440.330.low.jpg`,
                                    '2x': `${overviewImage}.image.880.660.low.jpg`
                                },
                                376: {
                                    '1x': `${overviewImage}.image.440.330.medium.jpg`,
                                    '2x': `${overviewImage}.image.880.660.medium.jpg`
                                },
                                769: {
                                    '1x': `${overviewImage}.image.440.330.high.jpg`,//YD 490*490
                                    '2x': `${overviewImage}.image.880.660.high.jpg`//YD 960*960
                                }
                            };

                            product = {
                                ...product,
                                image
                            };
                            return (
                                <div className="hero-product-wrapper" key={i}>
                                    <DiningCard
                                        {...product}
                                        key={i}
                                        index={i}
                                        configuratorClick={() =>
                                            this.handleOverlayOpen(product)
                                        }
                                        labels={labels}
                                    />
                                </div>
                            );
                        case 'SPA':
                            let imageUrlSpa = product.primaryImageUrl;
                            image = {
                                alt: product.name,
                                0: {
                                    '1x': `${overviewImage}.image.440.330.low.jpg`,
                                    '2x': `${overviewImage}.image.880.660.low.jpg`
                                },
                                376: {
                                    '1x': `${overviewImage}.image.490.490.medium.jpg`,
                                    '2x': `${overviewImage}.image.980.980.medium.jpg`
                                },
                                769: {
                                    '1x': `${overviewImage}.image.490.490.high.jpg`,
                                    '2x': `${overviewImage}.image.980.980.high.jpg`
                                }
                            };
                            let spaOverlay = extractChildComponent(
                                this.props.childComponents,
                                'spaOverlay'
                            );

                            product = { ...product, image };
                            return (
                                <div className="hero-product-wrapper" key={i}>
                                    <SpaHero
                                        {...product}
                                        labels={labels}
                                        overlay={spaOverlay}
                                        services={this.props.services}
                                    />
                                </div>
                            );
                        case 'SHOREX':
                            let imageUrl = product.primaryImageUrl;
                            image = {
                                alt: product.name,
                                0: {// YD css config according to screen
                                    '1x': `${imageUrl}.image.440.330.low.jpg`,//YD rendition work
                                    '2x': `${imageUrl}.image.880.660.low.jpg`
                                },
                                376: {
                                    '1x': `${imageUrl}.image.440.330.medium.jpg`,
                                    '2x': `${imageUrl}.image.880.660.medium.jpg`
                                },
                                769: {
                                    '1x': `${imageUrl}.image.440.330.high.jpg`,
                                    '2x': `${imageUrl}.image.880.660.high.jpg`// overviewImage
                                }
                            };
                            let shorexOverlayProps = extractChildComponent(
                                this.props.childComponents,
                                'shorexOverlay'
                            );

                            product = { ...product, image };//YD making clone of product and adding image object to product itself
                            return (
                                <div key={i} className="hero-product-wrapper">
                                    <ShorexCard
                                        {...product}
                                        services={this.props.services}
                                        labels={labels}
                                        overlay={shorexOverlayProps}
                                        languages={
                                            shorexOverlayProps.attributes
                                                .guideLanguages
                                        }
                                    />
                                </div>
                            );
                    }
                })
                // )
                }
            </Slider>
        );
    }

    handleOverlayOpen = (productItem = false) => {
        this.setState({
            chosenProduct: productItem
        });
    };

    handleOverlayClose = () => {
        this.setState({
            chosenProduct: false
        });
    };

    render() {
        const { childComponents, ctaType, productType } = this.props;
        const { products, chosenProduct } = this.state;

        const h1TitleProps = extractChildComponent(
            childComponents,
            'titleH1Mycruise'
        );
        const overlayProps = extractChildComponent(
            childComponents,
            'diningOverlay'
        );
        //*!this.props.productType === 'SPA' ? (*/
        return (
            !validateSession.checkCookie(['wcmmode']) &&
            products.length > 0 && (
                <div className="slider-hero-product">
                    <div className="tileH1-section">
                        {h1TitleProps && (
                            <TitleH1Mycruise {...h1TitleProps.attributes} />
                        )}
                    </div>
                    <div className="slider__wrapper">
                        <div className="slider__container">
                            {this.createSlider(products)}
                        </div>
                    </div>
                    {overlayProps && (
                        <DiningOverlay
                            {...overlayProps.attributes}
                            mounted={chosenProduct ? true : false}
                            headerData={this.headerData}
                            onExit={this.handleOverlayClose}
                            chosenProduct={chosenProduct}
                            ctaType={ctaType}
                            underlayClass="dining-overlay"
                        />
                    )}
                </div>
            )
        );
        // ) : (
        //     <ProductsVerticalTiles
        //         {...productsVerticalTilesProps.attributes}
        //         services={productsVerticalTilesProps.services}
        //         heroVariation={productCategory}
        //     />
        // );
    }
}

export default sliderHeroProduct;
