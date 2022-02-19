import React from 'react';
import fetchData from '../commons/CUK/fetch-data';
import { plainDateFormat } from '../commons/CUK/dateFormat';
import SessionStorage from '../commons/CUK/session-storage';
import { getPriceSymbolForCurrencyCode } from '../commons/CUK/currencyFormat';
import Modal from '../commons/CUK/modal';
import OrderItemShorex from './orderItemShorex';
import OrderItemAllInclusive from './orderItemAllInclusive';
import OrderItemDining from './orderItemDining';
import OrderItemSpa from './orderItemSpa';
import OrderItemEntertainment from './orderitementertainment';
import analytics from '../commons/CUK/analytics';
import { convertValueToVaildDecimalPoint } from '../commons/CUK/utilities';

class ordersDetail extends React.Component {
    constructor() {
        super();
        this.state = {
            openRowIndex: '',
            order: {},
            products: [],
            refaudable: undefined,
            showOverlay: false,
            type: '',
            id: ''
        };
    }
    componentDidMount() {
        // analytics.clickTracking(this);
        const { services } = this.props;
        const { code } = this.props;
        if (typeof services !== 'undefined' )
		{
 		const { urls } = services;
		
        const header = SessionStorage.getItem('header');
        const { passengers } = header;
        let url = `${urls.orderDetailsApi}${code}`;
        const configs = typeof window !== 'undefined' ? window.configs : {};
        const apiKey = configs.apikeyMycruise;

        fetchData(url, {
            method: 'GET',
            headers: {
                'X-CommonData': JSON.stringify(header),
                'X-Source-Identity-Token-0': apiKey
            }
        }).then((res) => {
            // create object of same shorex
            let temp = [];
            this.setState({
                totalChildDiscount: res.totalChildDiscount
            });
            res.entries.map((singleEntry, index) => {
                let newEntry = {};
                let groupID = singleEntry.groupID;
                let paxNumber = singleEntry.passenger.paxNo;
                let f = false;
                let infoPassenger = {};
                singleEntry.totalChildDiscount = this.state.totalChildDiscount;
                passengers.map((singlePassenger) => {
                    if (
                        Math.ceil(singlePassenger.paxNumber) ===
                        Math.ceil(paxNumber)
                    ) {
                        infoPassenger = singlePassenger;
                    }
                });

                if (temp.length > 0) {
                    temp.map((item, index) => {
                        if (groupID in item) {
                            f = index;
                        }
                    });
                }
                // singleEntry.passenger = infoPassenger;
                if (
                    singleEntry.product &&
                    singleEntry.product.productType &&
                    singleEntry.product.productType.toLowerCase() ==
                        'entertainment'
                ) {
                } else {
                    singleEntry.passenger = infoPassenger;
                }
                // check if exist
                if (typeof f === 'number') {
                    temp[f][groupID].push(singleEntry);
                } else {
                    newEntry[groupID] = [];
                    newEntry[groupID].push(singleEntry);
                    temp.push(newEntry);
                }
            });
            this.setState({
                products: temp
            });
        });
		}
    }

    /**
     * Open the overlay. In the overlay there is a message based on the refaudability of the item
     * @param {Number} type - type of the item, group if all product or entries if single product (passenger)
     * @param {Number} id - grupId or entryIndex
     * @param {Number} code - order code
     */

    cancelItem = (type, id, code) => {
        // console.log('inside cancelItem function of orderDetails component - type, id, code and props are ', type, id, code, this.props);
        // analytics.setAdditionalPageTrackAttributes({
        //     event: 'event312',
        //     productID: code,
        //     productType: type,
        //     cancelType: type
        // });
        const tempObject = {
            event: 'event312',
            productID: code,
            productType: type,
            cancelType: type
        };
        analytics.customClicks(tempObject);
        // analytics.clickTracking(this);
        const { services } = this.props;
		if (typeof services !== 'undefined' )
		{
 		const { urls } = services;
		
       
        let url = `${
            urls.orderDetailsApi
            }${code}/${type}/${id}/cancellation?mode=VERIFY`;
        const configs = typeof window !== 'undefined' ? window.configs : {};
        const apiKey = configs.apikeyMycruise;
        const header = SessionStorage.getItem('header');
        const { bookingRef } = header;
        const headers = {
            ...{
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'X-Source-Identity-Token-0': apiKey,
                'X-CommonData': JSON.stringify(header)
            }
        };

        // /{baseSiteId}/users/<userId>/orders/<orderId>/group/<groupId>/cancellation?mode=VERIFY
        // /{baseSiteId}/users/<userId>/orders/<orderId>/entries/<entryIndex>/cancellation?mode=VERIFY
        fetchData(url, {
            method: 'POST',
            headers: headers,
            mode: 'cors'
        })
            .then((res) => {
                let order = res.orders[0] ? res.orders[0] : {};
                let isRefaundable;
                if (type === 'group') {
                    order.entries.map((item, index) => {
                        if (
                            item.status !== 'CANCELLED' &&
                            item.status !== 'CANCELLING'
                        ) {
                            if (item.refundable === false) {
                                isRefaundable = false;
                            }
                        }
                    });

                    isRefaundable = isRefaundable === undefined ? true : false;
                } else {
                    isRefaundable = order.entries[0]
                        ? order.entries[0].refundable
                        : undefined;
                }

                this.setState({
                    refaudable: isRefaundable,
                    showOverlay: true,
                    type: type,
                    id: id
                });
            })
            .catch((error) => {
                // console.error(error);
            });
	}
        // var analyticsParams = {
        //     contentType: this.props.ctaType,
        //     contentName: analytics.handleSpecials(this.props.title),
        //     playerName: 'videoPlayer'
        // };

        // analytics.overlayLoad('screenLoad', analyticsParams);
    };

    componentWillReceiveProps(nextProps) {
        const { services } = nextProps;
        const { code } = nextProps;
        if (typeof services !== 'undefined' )
		{
 		const { urls } = services;
		
        let url = `${urls.orderDetailsApi}/${code}`;
        const header = SessionStorage.getItem('header');
        const { passengers } = header;
        const apikey =
            typeof window !== 'undefined' ? window.configs.apikeyMycruise : '';
        fetchData(url, {//YD hitting for particular order
            method: 'GET',
            headers: {
                'X-CommonData': JSON.stringify(header),
                'X-Source-Identity-Token-0': apikey
            }
        }).then((res) => {
            // create object of same shorex
            let temp = [];
            this.setState({
                totalChildDiscount: res.totalChildDiscount
            });
            res.entries.map((singleEntry, index) => {
                let newEntry = {};
                let groupID = singleEntry.groupID;
                let paxNumber = singleEntry.passenger.paxNo;
                let f = false;
                let infoPassenger = {};
                singleEntry.totalChildDiscount = this.state.totalChildDiscount;
                passengers.map((singlePassenger) => {
                    if (
                        Math.ceil(singlePassenger.paxNumber) ===
                        Math.ceil(paxNumber)
                    ) {
                        infoPassenger = singlePassenger;
                    }
                });
                //YD checking for the item exist in the temp array;
                if (temp.length > 0) {
                    temp.map((item, index) => {
                        if (groupID in item) {
                            f = index;
                        }
                    });
                }
                // singleEntry.passenger = infoPassenger;
                if (
                    singleEntry.product &&
                    singleEntry.product.productType &&
                    singleEntry.product.productType.toLowerCase() ==
                        'entertainment'
                ) {
                } else {
                    singleEntry.passenger = infoPassenger;
                }
                // check if exist
                if (typeof f === 'number') {
                    temp[f][groupID].push(singleEntry);
                } else {
                    newEntry[groupID] = [];
                    newEntry[groupID].push(singleEntry);
                    temp.push(newEntry);
                }
            });
            this.setState({
                products: temp
            }),
                () => this.forceUpdate();
        });
	}
    }
    /**
     * Delete one of the order product
     * @param {Number} code - order code
     */

    requestCancellation(code) {
        const currencyLocale =
            typeof window !== 'undefined'
                ? window.configs.currencyLocale
                : '';
        const { id, products } = this.state;
        let lineItem = [];
        products && products.length && products.forEach((product) => {
            if (product.hasOwnProperty(id)) {
                product[id].forEach((singleProduct) => {
                    const obj = {
                        skuName: singleProduct.attributes && singleProduct.attributes.name,
                        skuID: singleProduct.groupID,
                        unitPrice_GBP: singleProduct.totalPrice && convertValueToVaildDecimalPoint(singleProduct.totalPrice.value),
                        unitPrice_local: singleProduct.totalPrice && convertValueToVaildDecimalPoint(singleProduct.totalPrice.value),
                        Quantity: singleProduct.quantity ? parseInt(singleProduct.quantity) : ''
                    }
                    lineItem.push(obj);
                })
            }
        })
        // console.log('inside requestCancellation function of orderDetails component - code and props are ', code, this.props);
        const analyticsParamsCustom = {
            event: 'scCancel,event59',
            myCruiseCancellation: {
                cancellationID: code,
                transactionID:
                    (this.props.paymentInfo && this.props.paymentInfo.id) || '',
                orderTotal_GBP: parseFloat(this.props.total.value.toFixed(2)),
                orderTotal_local: parseFloat(this.props.total.value.toFixed(2)),
                lineItems: lineItem
            }
        };
        analytics.customClicks(analyticsParamsCustom);

        const { services } = this.props;
       if (typeof services !== 'undefined' )
		{
 		const { urls } = services;
		
        let url = `${urls.orderDetailsApi}${code}/${this.state.type}/${
            this.state.id
            }/cancellation?mode=CANCEL`;
        const configs = typeof window !== 'undefined' ? window.configs : {};
        const apiKey = configs.apikeyMycruise;
        const header = SessionStorage.getItem('header');
        const headers = {
            ...{
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'X-Source-Identity-Token-0': apiKey,
                'X-CommonData': JSON.stringify(header)
            }
        };

        // /{baseSiteId}/users/<userId>/orders/<orderId>/group/<groupId>/cancellation?mode=CANCEL
        // /{baseSiteId}/users/<userId>/orders/<orderId>/entries/<entryIndex>/cancellation?mode=CANCEL
        fetchData(url, {
            method: 'POST',
            headers: headers,
            mode: 'cors'
        })
            .then((res) => {
                // positive repsonse: close overlay
                this.setState({ showOverlay: false });
                // and re-render component. to do so, inform the parents that the orders value has changed
                // the response we get it's not like the one we get when retreiving all orders api
                // so we can't use those datas, we have to re-call the all orders api
                var handleToUpdate = this.props.handleToUpdate;

                handleToUpdate();
            })
            .catch((error) => {
                // console.error(error);
            });
	}
    }

    /**
     * print details of each product, previously grouped
     * @returns {React-markup} - Returns React markup to show product detail
     * @param {Number} code - order code
     */
    renderDetails(code) {
        const { products } = this.state;
        const { labels, hairLengthLabels, accesibilityLabels } = this.props;

        return products.map((singleProduct, index) => {
            // TODO: sistemare!!!
            let totPrice = 0;
            let totDiscount = 0;
            let generalProductInfo = Object.entries(singleProduct)[0][1][0];
            //   let currSymbol = getPriceSymbolForCurrencyCode(generalProductInfo.basePrice.currencyIso);
            let currSymbol = getPriceSymbolForCurrencyCode(
                generalProductInfo.basePrice.currencyIso
            );
            let cancelled = 0;
            let cancelling = 0;

            Object.entries(singleProduct)[0][1].map((item, index) => {
                totPrice += item.basePrice.value;
                if (item.product.productType === 'XDINING') {
                    totPrice = item.basePrice.value * item.noOfGuests;
                }
                totDiscount += item.loyaltyDiscount.value;
                if (item.status === 'CANCELLED') {
                    cancelled++;
                } else if (item.status === 'CANCELLING') {
                    cancelling++;
                }
            });

            let isCancelled =
                Object.entries(singleProduct)[0][1].length === cancelled
                    ? true
                    : false;
            let isCancelling =
                Object.entries(singleProduct)[0][1].length === cancelling
                    ? true
                    : false;
            let propsOrderDetail = {
                totPrice: totPrice,
                labels: labels,
                accesibilityLabels: accesibilityLabels,
                generalProductInfo: generalProductInfo,
                currSymbol: currSymbol,
                totDiscount: totDiscount,
                isCancelled: isCancelled,
                isCancelling: isCancelling,
                singleProduct: singleProduct,
                cancellationDate: this.props.cancellationDate
                    ? this.props.cancellationDate
                    : false,
                code: code,
                isCancellable:
                    generalProductInfo.cancellable === true &&
                    this.props.status !== 'CREATED' &&
                    this.props.status !== 'PAYMENT_AUTHORIZED'
                        ? true
                        : false
            };
            let typeOfProduct = generalProductInfo.product.productType;

            switch (typeOfProduct) {
                case 'SHOREX': {
                    return (
                        <OrderItemShorex
                            {...propsOrderDetail}
                            openOverlay={this.cancelItem}
                        />
                    );
                }
                case 'GIFT': {
                    return (
                        <OrderItemGift
                            {...propsOrderDetail}
                            openOverlay={this.cancelItem}
                        />
                    );
                }
                case 'AIBEVERAGE': {
                    return (
                        <OrderItemAllInclusive
                            {...propsOrderDetail}
                            openOverlay={this.cancelItem}
                        />
                    );
                }
                case 'XDINING': {
                    return (
                        <OrderItemDining
                            {...propsOrderDetail}
                            openOverlay={this.cancelItem}
                        />
                    );
                }
                case 'SPA': {
                    return (
                        <OrderItemSpa
                            {...propsOrderDetail}
                            hairLengthLabels={hairLengthLabels}
                            openOverlay={this.cancelItem}
                        />
                    );
                }
                case 'ENTERTAINMENT': {
                    return (
                        <OrderItemEntertainment
                            {...propsOrderDetail}
                            hairLengthLabels={hairLengthLabels}
                            openOverlay={this.cancelItem}
                        />
                    );
                }
            }
        });
    }

    openAccordion(index) {
        let newIndex = this.state.openRowIndex === index ? '' : index;

        this.setState({
            openRowIndex: newIndex
        });
    }

    handleModal = (bool) => {
        // console.log('inside handleModal function of order details value of this = ',this);
        analytics.clickTracking(this);
        this.setState({ showOverlay: bool });
    };

    createProductNumber = () => {
        return this.state.products.reduce((totalItems, currentItem) => {
            for (let productCode in currentItem) {
                let productEntries = currentItem[productCode];
                var availableItems = productEntries.reduce((total, entry) => {
                    return (total +=
                        entry.status !== 'CANCELLED' ||
                            entry.status !== 'CANCELLED'
                            ? 1
                            : 0);
                }, 0);
            }

            return (totalItems += availableItems);
        }, 0);
    };

    render() {
        const { code, index, labels } = this.props;
        const currency = getPriceSymbolForCurrencyCode(
            this.props.total.currencyIso
        );
        let tokenizedNumber, maskedNumber;
        if (
            this.props.paymentInfo &&
            this.props.paymentInfo.tokenizedCardNumber
        ) {
            tokenizedNumber = this.props.paymentInfo.tokenizedCardNumber.toString();
            maskedNumber = tokenizedNumber.substr(tokenizedNumber.length - 4);
        }

        let orderStatusProcessingOrFailed =
            this.props.status === 'CREATED' ||
            this.props.status === 'PAYMENT_AUTHORIZED' ||
            this.props.status === 'FAILED';
        let orderStatusProcessing =
            this.props.status === 'CREATED' ||
            this.props.status === 'PAYMENT_AUTHORIZED';

        return (
            <li className="orderRow">
                <div className="orderRow__header">
                    <h4>
                        {labels.orderNumberLabel} <span>{code} </span>
                    </h4>
                    <h4>
                        {' '}
                        {labels.placedLabel}{' '}
                        <span>
                            {' '}
                            {plainDateFormat(
                                new Date(this.props.created),
                                'DD MMM gggg'
                            )}{' '}
                        </span>
                    </h4>

                    {this.props.status === 'CANCELLED' && (
                        <h4 className="status">{labels.cancelledLabel}</h4>
                    )}
                    {this.props.status === 'CANCELLING' && (
                        <h4 className="status">{labels.cancellingLabel}</h4>
                    )}
                    {this.props.status === 'COMPLETED' && (
                        <h4 className="status">{labels.completedLabel}</h4>
                    )}
                    {this.props.status === 'FAILED' && (
                        <h4 className="status">{labels.failedLabel}</h4>
                    )}
                    {(orderStatusProcessing) && (
                        <h4 className="status">{labels.processingLabel}</h4>
                    )}

                </div>
                <div className="orderRow__body">
                    <div className="orderRow__column">
                        {!orderStatusProcessingOrFailed &&
                            this.props.paymentInfo && (
                                <div className="">
                                    <h5>{labels.billingInfoLabel}</h5>
                                    <span>
                                        {this.props.paymentInfo.billingAddress
                                            .title
                                            ? this.props.paymentInfo
                                                  .billingAddress.title
                                            : ''}
                                        {this.props.paymentInfo.billingAddress
                                            .firstName
                                            ? this.props.paymentInfo
                                                  .billingAddress.firstName
                                            : ''}
                                        {this.props.paymentInfo.billingAddress
                                            .lastName
                                            ? this.props.paymentInfo
                                                  .billingAddress.lastName
                                            : ''}
                                    </span>
                                    <span>
                                        {this.props.paymentInfo.billingAddress
                                            .line1
                                            ? this.props.paymentInfo
                                                  .billingAddress.line1 + ','
                                            : ''}
                                        {this.props.paymentInfo.billingAddress
                                            .Gliwice
                                            ? this.props.paymentInfo
                                                  .billingAddress.Gliwice
                                            : ''}
                                    </span>
                                    <span>
                                        {this.props.paymentInfo.billingAddress
                                            .country &&
                                        this.props.paymentInfo.billingAddress
                                            .country.name
                                            ? this.props.paymentInfo
                                                  .billingAddress.country.name +
                                              ' - '
                                            : ''}
                                        {this.props.paymentInfo.billingAddress
                                            .postalCode
                                            ? this.props.paymentInfo
                                                  .billingAddress.postalCode
                                            : ''}
                                    </span>
                                    <span>
                                        {
                                            this.props.paymentInfo
                                                .billingAddress.email
                                        }
                                    </span>
                                </div>
                            )}
                        {!orderStatusProcessingOrFailed &&
                            this.props.paymentInfo &&
                            this.props.paymentInfo.cardType && (
                                <div className="">
                                    <h5>{labels.paymentDetailsLabel}</h5>
                                    <span
                                        className={` cardImage ${
                                            this.props.paymentInfo.cardType.code
                                        }`}
                                    />
                                    <span className="cardNumber">
                                        {`****${maskedNumber}`}
                                    </span>
                                </div>
                            )}
                        {orderStatusProcessing && (
                            <div className="">
                                <h5>{labels.processingMsgTitle}</h5>
                                <span>{labels.processingMsg}</span>
                            </div>
                        )}
                    </div>
                    <div className="orderRow__column orderRow__column--pricing">
                        <p>
                            <span className="label__col">
                                {labels.subtotalLabel}
                            </span>
                            <span className="value__col">
                                {' '}
                                {currency}{' '}
                                {(this.props.total.value +
                                    this.props.productDiscounts.value).toFixed(2)}
                            </span>
                        </p>
                        {(this.props.totalChildDiscount
                            ? this.props.totalChildDiscount.value
                            : 0) > 0 && (
                                <p>
                                    <span className="label__col">
                                        {labels.childDiscountTotalLabel}
                                    </span>
                                    <span className="value__col">
                                        {' '}
                                        - {currency}{' '}
                                        {this.props.totalChildDiscount.value.toFixed(2)}
                                    </span>
                                </p>
                            )}
                        <p className="total-price">
                            <span className="label__col">
                                {labels.totalLabel}
                            </span>
                            <span className="value__col">
                                {currency} {this.props.total.value.toFixed(2)}
                            </span>
                        </p>
                    </div>
                </div>

                <div
                    className={`${
                        this.state.openRowIndex === index ? 'visible' : ''
                        }  orderRow__accordion`}
                >
                    {this.renderDetails(code)}
                </div>
                <a
                    href="#"
                    className="orderRow__openAccordion"
                    onClick={(e) => {
                        e.preventDefault();
                        this.openAccordion(index);
                    }}
                >
                    <span>
                        {labels.detailsLabel}
                        {/* {this.createProductNumber()} */}
                    </span>{' '}
                </a>
                <Modal
                    mounted={this.state.showOverlay}
                    onExit={() => this.handleModal(false)}
                    contentLabel="close"
                    ctaType="link"
                    underlayClass="confirmation-modal"
                >
                    {this.state.refaudable ? (
                        <h4>{labels.refundableProductLabel}</h4>
                    ) : (
                            <h4>{labels.notRefundableProductLabel}</h4>
                        )}
                    {this.state.type === 'entries' ? (
                        <h4>{labels.cancelPassangerLabel}</h4>
                    ) : (
                            <h4>{labels.cancelShorexLabel}</h4>
                        )}
                    <div className="modal-btns">
                        <button
                            className="cta-primary-light-blue"
                            data-linktext={labels.noLabel}
                            onClick={() => this.handleModal(false)}
                        >
                            {labels.noLabel}
                        </button>
                        <button
                            className="cta-primary"
                            data-linktext={labels.yesLabel}
                            onClick={() => this.requestCancellation(code)}
                        >
                            {labels.yesLabel}
                        </button>
                    </div>
                    <p>{labels.emailRefer}</p>
                </Modal>
            </li>
        );
    }
}
export default ordersDetail;
