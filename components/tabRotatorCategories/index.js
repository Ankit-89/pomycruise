'use strict';

import React from 'react';
import SessionStorage from '../commons/CUK/session-storage';
import FetchData from '../commons/CUK/fetch-data';
import TabRotator from '../tabRotator';
import { cloneData, getConfig } from '../commons/CUK/utilities';
import validateSession from '../commons/CUK/validateSession';

class tabRotatorCategories extends React.Component {
    constructor(props) {
        super(props);
        this.state = { finalProps: false };
    }

    componentDidMount() {
        if (!validateSession.checkCookie(['wcmmode'])) {
            this.getApiData();
        }
        // if (!ValidateSession.checkCookie(['wcmmode'])) {

        // } else {
        //     this.setState(() => ({
        //         finalProps: this.props
        //     }));
        // }
    }

    getApiData() {
        const { services } = this.props;
        const { productSearchApi } = services.urls;
        const apiKey = getConfig('apikeyMycruise', '');

        const url = `${productSearchApi}?productType=SHOREX`;
        const header = SessionStorage.getItem('header') || {};
        FetchData(url, {
            method: 'GET',
            headers: {
                'X-CommonData': JSON.stringify(header),
                'X-Source-Identity-Token-0': apiKey
            }
        }).then((response) => {
            const { facets } = response;
            // get the list of the categories from the API --> specific for the cruise
            const categories = facets.find(
                (facet) => facet.code === 'tourCategory'
            );
            this.setState(() => {
                const modifiedProps = cloneData(this.props);
                const { activitiesList } = modifiedProps;
                const shorexActivitiesIndex = activitiesList.findIndex(
                    (activity) => activity.type === 'shorex'
                );
                activitiesList[
                    shorexActivitiesIndex
                ].storyList = activitiesList[
                    shorexActivitiesIndex
                ].storyList.filter(
                    (story) =>
                        categories.values.findIndex(
                            (category) => category.code === story.category
                        ) > -1
                );

                modifiedProps.activitiesList = modifiedProps.activitiesList.filter(
                    (activity) =>
                        activity.storyList && activity.storyList.length > 0
                );
                return {
                    finalProps: { ...modifiedProps }
                };
            });
        });
    }

    render() {
        const { finalProps } = this.state;
        return finalProps ? (
            <div className="tabRotator">
                <TabRotator {...finalProps} componentName="tabRotator" />
            </div>
        ) : null;
    }
}

export default tabRotatorCategories;
