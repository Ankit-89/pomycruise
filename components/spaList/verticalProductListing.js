import React, { Component } from 'react';
import { getCurrency } from '../commons/CUK/currencyFormat';

import ReadMoreOrLess from '../commons/CUK/readMoreOrLess';
import Link from '../commons/CUK/link';
import Image from '../commons/CUK/image';
import SessionStorage from '../commons/CUK/session-storage';
import LinesEllipsis from 'react-lines-ellipsis';
import responsiveHOC from 'react-lines-ellipsis/lib/responsiveHOC';
import { getConfig } from '../commons/CUK/utilities';
const ResponsiveEllipsis = responsiveHOC()(LinesEllipsis);

class verticalProductListing extends Component {
    constructor(props) {
        super(props);
        this.state = {
            active: false,
            readMore: false,
            longText: '',
            readMoreState: false
        };
      
    }
    componentDidMount() {
        this.readMore();
        // this.controlRestriction();
    }
    /**
     * readMore - Checks description's height against viewport's max-height
     * toggling state for "readMore" property
     */
    readMore() {
        const elm = this.desc || [];

        if (elm.innerHTML.length > 247) {
            this.setState(() => {
                elm.innerHTML = elm.innerHTML.substr(0, 247);
                return {
                    readMoreState: true,
                    longText: elm.innerHTML
                };
            });
        }
    }
    /**
     * createPrice - Handles creation of price converting currencyIso to symbol
     * with imported helper function
     *
     * @returns  {JSX} resulting markup for price to show
     */
    createPrice(fromprice) {
      const {
             labels: { from }
       } = this.props;
       const currencyLabel = getConfig('defaultCurrencySymbol', '£');
       return `${from} ${currencyLabel}${fromprice}`;
   }


    render() {
     let { labels } = this.props;
     const { active, readMoreState } = this.state;
     const { from, readLess, readMore, addToCartLabel } = labels;
       // const { title, image } = product;

        const {
            props: {
                attributes: { image, title, description,fromprice,duration}
            }
        } = this;
        const readLabel = active ? readLess : readMore;
       
        return (
            <div className="spaComponent">
                <div className="spaComponent__image">
                    <span>
                        <Image {...image} />
                    </span>
                </div>
                <div className="spaComponent__details">

                <h3>{title}</h3>
                <div className="spaComponent__description">
                <p className="spaComponent__tecnical">
                                {fromprice && this.createPrice(fromprice)}
                                <span className="spaComponent__duration">
                                        {duration}
                                </span>
                            </p>
                    
                    <div ref={(desc) => (this.desc = desc)} >
                        <ResponsiveEllipsis
                            text={description}
                            maxLine="3"
                            ellipsis="..."
                            trimRight
                            basedOn="letters"
                        />
                    </div>
                </div>

                </div>
            </div>
        );
    }
}

export default verticalProductListing;
