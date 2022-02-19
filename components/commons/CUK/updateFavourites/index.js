/**
 * Module to update favourites when favourited - if user loggedin
 */
'use strict';

import fetch from '../fetch-data';
import { getUserData } from '../login-data-utility';

/**
 * updateStore - makes API to update the favourites
 *
 * @param { object } services - has URL and header
 * @param { object } obj - data to be sent to API
 */
const updateStore = (services, obj) => {
    const { urls, headers } = services;

    const url = urls ? urls.favouritesAPI : '';

    if (typeof url !== 'undefined' && url !== '') {
        fetch(url, {
            method: 'POST',
            body: JSON.stringify(obj),
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                ...headers
            }
        }).then((res) => {
            if (res.data && res.data.favourites && res.data.favourites.length) {
                return true;
            }
        });
    }
};
/**
 * updateFavourites - processes the object to update favourites
 *
 * @param { object } props - expects services, type {SHORE-X/CRUISE}, id, action { remove/add}

*/
const updateFavourites = (props) => {
    const userData = getUserData();

    let obj = {},
        tempObj = {};

    switch (props.type) {
        case 'CRUISE':
            tempObj = {
                ...{ type: props.type },
                ...{ id1: props.id },
                ...{ action: props.action }
            };
            props.tourId && props.tourId.length
                ? (tempObj['id2'] = props.tourId)
                : null;

            break;
        case 'SHORE-X':
            tempObj = {
                ...{ type: props.type },
                ...{ id1: props.id },
                ...{ action: props.action }
            };
            break;
    }

    obj.emailAddress = userData ? userData.mariner.emailAddress : '';

    obj.favorites = [];

    obj.favorites.push(tempObj);

    updateStore(props.services, obj);
};

export default updateFavourites;
