/**
 * C046 Room Selector - floorLayout
 */
import React from 'react';
// import * as constants from './constants.js';
import CurrencyFormat from '../commons/CUK/currencyFormat';
// import { getRoomCategoryName } from './utility';

// import './styles/floorLayout/index.css';

class floorLayout extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            imageWidth: 0,
            imageHeight: 0,
            imageLoaded: false,
            showDrawer: false
        };

        // if (props.showLegend && props.legends && props.legends.list) {
        //     this.legendsList = props.legends.list.reduce(
        //         (accumulator, { legendId, legendText }) => {
        //             accumulator[legendId] = legendText;

        //             return accumulator;
        //         },
        //         {}
        //     );
        // }
    }

    /**
     * calculatePercentage - calculate percentage
     * @param {string} value - value
     * @param {number} max - max value
     * @returns {string} returns percentage
     */
    calculatePercentage(value, max) {
        const number = parseInt(value);

        const percentage = max > 0 ? ((number / max) * 100).toFixed(2) : 0;

        return `${percentage}%`;
    }

    /**
     * getRoomOverlayStyle - get room overlay style
     * @param {object} room - room object
     * @returns {object} style object
     */
    getRoomOverlayStyle(room) {
        const { roomWidth, roomHeight, roomLeft, roomTop } = room;
        let containerWidth, containerHeight;

        // if (this.props.parentState.useFullWidthImage) {
        if (false) {
            const imageWidth = this.state.imageWidth,
                imageHeight =
                    this.state.imageHeight *
                    (imageWidth / this.state.imageWidth);

            (containerWidth = imageWidth), (containerHeight = imageHeight);
        } else {
            const imageWidth = 335,
                imageHeight =
                    this.state.imageHeight *
                    (imageWidth / this.state.imageWidth);

            (containerWidth = imageWidth + 20),
                (containerHeight = imageHeight + 15);
        }

        return {
            top: this.calculatePercentage(roomTop, containerHeight),
            left: this.calculatePercentage(roomLeft, containerWidth),
            height: this.calculatePercentage(roomHeight, containerHeight),
            width: this.calculatePercentage(roomWidth, containerWidth)
        };
    }

    /**
     * getAvailability - get Available room
     * @param {object} room - room object
     * @returns {string} return unavailable | upgrade-available
     */
    getAvailability(room) {
        const { roomNumber } = room;
        const { availability } = this.props;

        if (!availability[roomNumber]) {
            return 'unavailable';
        } else {
            if (availability[roomNumber].upgradeAvailable) {
                return 'upgrade-available';
            }

            return 'available';
        }
    }

    /**
     * isActiveRoom - check if room is active
     * @param {object} room - room object
     * @returns {string} - if room present return selected room or empty
     */
    isActiveRoom(room) {
        if (this.props.activeRoom === room.roomNumber) {
            return 'selected-room';
        }

        return '';
    }

    /**
     * selectRoom - select room
     * @param {object} event - browser event
     * @param {object} room - room object
     */
    // selectRoom = (event, room) => {
    //     event.nativeEvent.stopImmediatePropagation
    //         ? event.nativeEvent.stopImmediatePropagation()
    //         : event.stopPropagation();

    //     this.setState({
    //         showDrawer: true
    //     });
    //     document.removeEventListener('click', this.hideDrawer);

    //     document.addEventListener('click', this.hideDrawer);

    //     this.props.roomSelectCallback(room);
    // };

    /**
     * getAccessibility - get accessibility label
     * @param {oject} room - room object
     * @returns {object} html - return markup
     */
    // getAccessibilityLabel(room) {

    //     const { roomNumber } = room;
    //     const { availability } = this.props;

    //     if (availability[roomNumber] && availability[roomNumber].wheelchairAccessible) {

    //         return (
    //             <div className='accessibility-holder'>
    //                 <span className='accessibility-icon'></span>
    //             </div>
    //         );
    //     }
    // }

    /**
     * getScreenReaderLabel - Returns label for screen readers for each room
     * @param {oject} room - room object
     * @returns {string} label - returns screen reader label
     */

    // getScreenReaderLabel( room ) {

    //     const { selectedRoomType, showLegend, availability: roomAvailability  } = this.props;
    //     const { rsCurrentLegendLabel, rsAvailableLegendLabel, rsUpgradeLegendLabel } = this.props.roomNumberLabel;
    //     let status = '', roomFacility = '';

    //     if ( this.isActiveRoom(room).length ) {

    //         status = rsCurrentLegendLabel;
    //     }
    //     else {

    //         const availability = this.getAvailability(room);

    //         if ( availability === 'available' ) {

    //             status = rsAvailableLegendLabel;
    //         }
    //         else if ( availability === 'upgrade-available' ) {

    //             status = rsUpgradeLegendLabel;
    //         }
    //         else {

    //             status = 'unavailable';
    //         }
    //     }

    //     if ( showLegend && status !== 'unavailable' && roomAvailability[room.roomNumber] && roomAvailability[room.roomNumber].legendsInfo && this.legendsList) {
    //         roomFacility = [ ...roomAvailability[room.roomNumber].legendsInfo ].reduce((accumulator, legend) => {
    //             accumulator = `${accumulator}, ${this.legendsList[legend]}`;

    //             return accumulator;
    //         }, '');
    //     }

    //     return `${ status } : ${ selectedRoomType } : ${ room.roomNumber } ${ roomFacility ? roomFacility : '' }`;
    // }

    // renderRoomDescription(roomDetails, rsSelectedTileDescriptionText) {
    //     const { currencyCode, masterObj } = this.props.parentState;

    //     return (
    //         <div className="room-number-description">
    //             <p className="description"> {rsSelectedTileDescriptionText}</p>
    //             <span className="price-value">
    //                 <CurrencyFormat
    //                     value={roomDetails.price}
    //                     currencyCode={currencyCode}
    //                 />
    //                 <span>{masterObj.commonLabels.rsPerPersonLabel}</span>
    //             </span>
    //         </div>
    //     );
    // }

    /**
     * getRoomLocations - get room locations
     * @param {object} styles - object containg styles to be applied to romm-locations\
     * @returns {object} html - return markup

     */
    getRoomLocations(styles) {
        const { floorMap, availability, parent } = this.props;

        // const {
        //     rsSelectedTileDescriptionText
        // } = parentState.masterObj.roomNumberTab;

        // const { roomID, roomCategoryID, useFullWidthImage } = parent;
        return (
            <div className="room-locations" style={styles}>
                {floorMap.map((room, index) => {
                    const roomOverlayStyle = this.getRoomOverlayStyle(room);
                    const drawerPosition =
                        parseInt(roomOverlayStyle.left) > 50
                            ? 'position-right'
                            : 'position-left';

                    return (
                        <div
                            className={`room-overlay ${room.roomShape} 
                            ${room.rotate ? room.rotate : 'no-rotate'} 
                            ${this.isActiveRoom(room)}`}
                            style={roomOverlayStyle}
                            key={index}
                        >
                            <div className="single-room-continer">
                                <button 
                                 //tabindex="-1"
                                 tabIndex={ -1 }
                                // onClick={(event) =>
                                //     this.selectRoom(event, room)
                                // }
                                // tabIndex={ this.getAvailability(room) === 'unavailable' ? -1 : 0 }
                                // aria-hidden={ this.getAvailability(room) === 'unavailable' ? true : false }
                                // aria-label={ this.getScreenReaderLabel(room) }
                                >
                                    {room.roomNumber}
                                </button>
                                <div
                                    className={`active-drawer ${drawerPosition} ${
                                        this.state.showDrawer
                                            ? 'show-drawer'
                                            : 'hide-drawer'
                                    }`}
                                >
                                    <div className="room-drawer">
                                        <div className="icon-holder">
                                            <span className="selected-icon" />
                                        </div>
                                        <div className="room-number-holder">
                                            <span className="room-number-holder">
                                                {room.roomNumber}
                                            </span>
                                        </div>
                                        {/* {useFullWidthImage && (
                                            <div className="room-category-Name">
                                                {getRoomCategoryName(
                                                    parentState,
                                                    roomID,
                                                    roomCategoryID
                                                )}
                                            </div>
                                        )} */}
                                        {/* {availability[room.roomNumber] !== undefined &&
                                            availability[room.roomNumber].upgradeAvailable &&
                                                this.renderRoomDescription(availability[room.roomNumber], rsSelectedTileDescriptionText)
                                        } */}
                                        {/* {this.getAccessibilityLabel(room)} */}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }

    /**
     * setImageDimensions - set image dimensions
     */
    setImageDimensions = () => {
        const imageHeight = this.floorImage.naturalHeight,
            imageWidth = this.floorImage.naturalWidth;

        const imageLoaded = true;

        this.setState({
            imageHeight,
            imageWidth,
            imageLoaded
        });
    };

    /**
     * setFloorImageRef - set floor image reference
     * @param {object} image - image object
     */
    setFloorImageRef = (image) => {
        if (!image) {
            return;
        }

        this.floorImage = image;

        if (!!image.naturalHeight && !!image.naturalWidth) {
            this.setImageDimensions();
        } else {
            image.onload = this.setImageDimensions;
        }
    };

    /**
     * hideDrawer - hide drawer
     */
    hideDrawer = () => {
        if (this.state.showDrawer) {
            this.setState({
                showDrawer: false
            });
            document.removeEventListener('click', this.hideDrawer);
        }
    };

    /**
     * handleHashChange - handle hash changes
     */
    handleHashChange = () => {
        if (
            windowEncoded.location.hash.replace('#', '') === constants.ROOM_NO
        ) {
            this.setState({
                showDrawer: true
            });

            document.addEventListener('click', this.hideDrawer);
        }
    };

    componentDidMount() {
        // window.addEventListener('hashchange', this.handleHashChange);
    }

    render() {
        let floorLayout, layoutContainer, imageStyles, roomStyles;
        // if (this.props.parentState.useFullWidthImage) {
        if (this.props.floorMap) {
            const floorMap = this.props.floorMap;
            const firstRoomHeight = floorMap[0].roomTop;

            const lastRoomHeight =
                parseInt(floorMap[floorMap.length - 1].roomTop) +
                parseInt(floorMap[floorMap.length - 1].roomHeight);
            const selectedShipSection = this.props.activeShipSection;
            switch (selectedShipSection) {
                case 'A':
                    floorLayout = {
                        width: this.state.imageWidth,
                        height: parseInt(
                            this.state.imageHeight - parseInt(firstRoomHeight)
                        )
                    };
                    layoutContainer = {
                        top: `-${firstRoomHeight}`
                    };

                    break;
                case 'N':
                    floorLayout = {
                        width: this.state.imageWidth,
                        height:
                            parseInt(
                                lastRoomHeight - parseInt(firstRoomHeight)
                            ) + 20
                    };
                    layoutContainer = {
                        top: `-${firstRoomHeight}`
                    };

                    break;
                case 'M':
                    layoutContainer = {
                        top: `-${firstRoomHeight}`
                    };
                    floorLayout = {
                        width: this.state.imageWidth,
                        height:
                            parseInt(
                                lastRoomHeight - parseInt(firstRoomHeight)
                            ) + 20
                    };
                    break;
                case 'L':
                    floorLayout = {
                        width: this.state.imageWidth,
                        height:
                            parseInt(
                                lastRoomHeight - parseInt(firstRoomHeight)
                            ) + 20
                    };
                    layoutContainer = {
                        top: `-${firstRoomHeight}`
                    };

                    break;
                case 'F':
                    layoutContainer = {
                        top: 0
                    };
                    floorLayout = {
                        width: this.state.imageWidth,
                        height: parseInt(lastRoomHeight)
                    };
                    break;
            }

            imageStyles = {
                width: `${this.state.imageWidth}px`,
                top: layoutContainer.top || 0,
                position: 'absolute',
                clip: `rect( ${-parseInt(layoutContainer.top)}px, ${
                    floorLayout.width
                }px, ${floorLayout.height -
                    parseInt(layoutContainer.top)}px,  0px)`,
                left: 0
            };

            roomStyles = {
                top: layoutContainer.top,
                height: `${this.state.imageHeight}px`
            };
        }

        return (
            <div className="floor-layout">
                <div className="width-controller">
                    <div className="layout-container">
                        <div className="floor-image" style={floorLayout}>
                            <img
                                src={this.props.floorImage}
                                alt=""
                                ref={this.setFloorImageRef}
                                style={imageStyles}
                            />
                        </div>
                        {this.state.imageLoaded &&
                            this.getRoomLocations(roomStyles)}
                    </div>
                </div>
            </div>
        );
    }
}

export default floorLayout;
