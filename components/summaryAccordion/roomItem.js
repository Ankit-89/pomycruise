'use strict';

import React from 'react';
// import TabPanel from './tabPanel';
import Image from '../commons/CUK/image';
import Tabs from '../commons/CUK/tabs';
import analytics from '../commons/CUK/analytics';
import validateSession from '../commons/CUK/validateSession';
import FloorLayout from './floorLayout';
import fetchData from '../commons/CUK/fetch-data';
import SessionStorage from '../commons/CUK/session-storage';

class roomItem extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            showCategories: false,
            expandButtonLabel: this.props.labels.viewMoreLabel,
            layoutData: {}
        };
    }

    componentDidMount() {
        // analytics.clickTracking(this);
        this.getLayoutFloorData();
    }

    componentDidUpdate(prevProps) {
        // if (
        //     this.props.roomTypes.deck !== prevProps.roomTypes.deck ||
        //     this.props.deckInfo.position !== prevProps.deckInfo.position
        // ) {
        //     this.getLayoutFloorData();
        // }
    }

    /**
     * handleClick - toggle the drawer
     */
    handleClick() {
        analytics.clickTracking(this);
        this.setState({
            showCategories: !this.state.showCategories,
            expandButtonLabel: this.state.showCategories
                ? this.props.labels.viewMoreLabel
                : this.props.labels.viewLessLabel
        });
    }
    /**
     * getDeckInfo - get deck info
     * @param {string} deckId - deck id
     * @returns {object} deckInfoObj - deck info obj
     */
    getDeckInfo = (deckId) => {
        const deckInfo = this.props.deckInfo;
        let deckInfoObj = deckInfo;

        return deckInfoObj;
    };

    /**
     * getDeckObj - get deck obj
     * @param {object} deck - deck object
     * @param {string} selectedSection - selected section
     * @returns {object} object - image and json object
     */
    getDeckObj = (deck, selectedSection) => {
        // return deck[0].sectionDeckInfo.filter((deck) => {
        return deck.sections.filter((deckItem) => {
            return deckItem.id === selectedSection;
        });
    };

    getLayoutFloorData = () => {
        let layoutUrl;
        // const floorObj = this.getDeckInfo(this.props.roomTypes.deck);
        // const floorObj = this.props.deckInfo;
        // const floorUrlObj =
        //     floorObj.length > 0
        //         ? this.getDeckObj(floorObj, this.props.deckInfo.position)
        //         : {};
        layoutUrl = this.props.deckInfo.layoutUrl;
        fetch(layoutUrl, {
            method: 'GET'
        })
            .then((response) => response.json())
            .then((response) => {
                this.layoutData = response;
                this.setState({
                    layoutDataAvailable: true,
                    layoutData: response
                });
            });
    };

    /**
     * renderRoomCategories - generate the Room Categories block jsx
     *
     * @param  {string} roomTypeName  name of the room type from props object
     * @param  {object} marketRoomCategories  props object for the modal
     * @param  {object} index  props object for the modal
     * @returns {object}       combined jsx object
     */
    // renderRoomCategories = (roomTypeName, marketRoomCategories, index) => {
    //     return (
    //         <TabPanel marketRoomCategories={marketRoomCategories} roomTypeName={roomTypeName} index={index} labels={this.props.labels}  />
    //     );
    // }

    render() {
        const {
            roomTypes,
            hideAccordion,
            index,
            labels,
            deckInfo,
            notAllocated
        } = this.props;
        // const redirectCTA = roomTypes.redirectURL;
        // let roomTypeLinkName = roomTypes.name,
        //     expandButtonLinkLabel = this.state.expandButtonLabel;

        //get guests list from sessionstorage
        const orderedList = SessionStorage.getItem('orderedList');
        const { passengers } = orderedList;
        return (
            <div className="room-item-wrapper roomInfo">
                <article className={`media media-${roomTypes.roomAlignment}`}>
                    {roomTypes.image && (
                        <div className="image-wrapper">
                            <Image {...roomTypes.image} />
                            <p className="image__label">{labels.imageLabel}</p>
                        </div>
                    )}
                    <section className="section-wrapper">
                        <h2>{roomTypes.name}</h2>
                        <p
                            dangerouslySetInnerHTML={{
                                __html: roomTypes.marketDescription
                            }}
                        />
                        <div className="roomInfo__divider">
                            <div className="roomInfo__first">
                                <h5>{labels.guestsLabel}</h5>
                                {passengers.map((guest, index) => {
                                    let comma =
                                        index === passengers.length - 1
                                            ? ''
                                            : ', ';
                                    return (
                                        <span key={index}>
                                            {`${guest.title} ${
                                                guest.firstName
                                            } ${guest.lastName} ${comma}`}
                                        </span>
                                    );
                                })}
                            </div>
                            <div className="roomInfo__item">
                                <h5>{labels.deckLabel}</h5>
                                {notAllocated ? (
                                    <p>{labels.notAllocatedLabel}</p>
                                ) : (
                                    <p>{roomTypes.deck}</p>
                                )}
                            </div>
                            <div className="roomInfo__item">
                                <h5>{labels.cabinLabel}</h5>

                                {notAllocated ? (
                                    <p>{labels.notAllocatedLabel}</p>
                                ) : (
                                    <p>{roomTypes.number}</p>
                                )}
                            </div>
                            <div className="roomInfo__item">
                                <h5>{labels.dimensionsLabel}</h5>
                                <p>{roomTypes.area}</p>
                            </div>
                        </div>

                        <div className="roomInfo__divider">
                            <h5>{labels.bedLabel}</h5>
                            <p>{roomTypes.bed}</p>
                        </div>
                        {/* {!hideAccordion && ( */}
                        <div
                            role="menu"
                            // data-linktext={`${roomTypeLinkName}:${expandButtonLinkLabel}`}
                            data-componentname="stateRoomAccordion"
                            aria-label={`${roomTypes.name} ${
                                this.state.expandButtonLabel
                            }`}
                            aria-controls={`tabpanel-wrapper-${index}`}
                            data-toggle="collapse"
                            aria-expanded={this.state.showCategories}
                            onClick={() => this.handleClick()}
                            className={`cta ${
                                this.state.showCategories ? 'is-opened' : ''
                            }`}
                            tabIndex={0}
                            onKeyPress={(e) => {
                                e.key === 'Enter' ? this.handleClick() : null;
                            }}
                        >
                            {this.state.expandButtonLabel}
                        </div>
                        {/* )} */}
                        {/* {hideAccordion && redirectCTA &&
                        <Link
                            {...redirectCTA}
                            dataComponentname='stateRoomAccordion'
                            dataLinktext={ `${roomTypeLinkName}:${expandButtonLinkLabel}` }/>
                        } */}
                        {/* { this.state.showCategories && <div className="arrow-down-line"></div> } */}
                    </section>
                </article>
                {/* { this.state.showCategories && this.renderRoomCategories( roomTypes.name, roomTypes.marketRoomCategories, index) } */}
                {this.state.showCategories && (
                    <Tabs selected={0} internal={true}>
                        <div title={labels.includedServicesLabel}>
                            <ul className="servicesList">
                                {roomTypes.servicesIncluded.map(
                                    (service, index) => {
                                        return (
                                            <li key={index}>
                                                <span>{service}</span>
                                            </li>
                                        );
                                    }
                                )}
                            </ul>
                        </div>
                        <div title={labels.deckPlanLabel} className="deckInfo">
                            <h4 className="deckInfo__title">
                                {labels.deckTitleLabel}
                            </h4>
                            <div className="deckInfo__images">
                                <div className="deckInfo__left">
                                    <div className="">
                                        <div>
                                            <h4 className="deckInfo__subtitle">
                                                {labels.sectionLabel}
                                            </h4>
                                            <h3 className="">
                                                {deckInfo.position}
                                            </h3>
                                        </div>

                                        <div className="deckInfo__sections">
                                            {deckInfo.sections.map(
                                                (section, index) => {
                                                    let opacityToSet =
                                                        section.id ===
                                                        deckInfo.position
                                                            ? 1
                                                            : 0.7;
                                                    return (
                                                        <div>
                                                            <img
                                                                className="deckInfo__section"
                                                                src={
                                                                    section.image
                                                                }
                                                                style={{
                                                                    opacity: opacityToSet
                                                                }}
                                                            />
                                                        </div>
                                                    );
                                                }
                                            )}
                                        </div>
                                    </div>
                                    <div className="deckInfo__detail">
                                        <div>
                                            <h4 className="deckInfo__subtitle">
                                                {labels.deckInternalLabel}
                                            </h4>
                                            <h3 className="deckInfo__data">
                                                {this.props.roomTypes.deck}
                                            </h3>
                                        </div>
                                        <img src={deckInfo.levelImage} />
                                    </div>
                                </div>
                                <div className="deckInfo__right">
                                    <FloorLayout
                                        floorMap={this.layoutData}
                                        // availability={this.availability}
                                        // showLegend = { showLegend }
                                        // legends={this.props.parentState.legends}
                                        activeRoom={roomTypes.number}
                                        // roomSelectCallback={this.setActiveRoom}
                                        activeShipSection={deckInfo.position}
                                        floorImage={deckInfo.deckImage}
                                        // selectedRoomType={selectedRoom.name}
                                        // roomNumberLabel={this.props.roomNumberLabel}
                                        // parent={parent}
                                    />
                                    <div className="deckInfo__rightText">
                                        <h4 className="deckInfo__subtitle">
                                            {labels.yourCabinLabel}
                                        </h4>
                                        <h3>{roomTypes.number}</h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Tabs>
                )}
            </div>
        );
    }
}

export default roomItem;
