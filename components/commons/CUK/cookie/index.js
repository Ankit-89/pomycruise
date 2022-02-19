'use strict';
/**
 * Cookie - Utility class for creating, retrieving, updating and deleting cookies
 */
export default {
    /**
     * get - Retrieve the cookie value
     *
     * @param   {string} key   keyname of the cookie
     * @returns {array}        returns an array containing the values
     */
    get: function(key) {
        if (
            typeof window !== 'undefined' &&
            typeof document !== 'undefined' &&
            typeof document.cookie !== 'undefined'
        ) {
            let cookieSet = document.cookie.split('; '),
                cookieArray = cookieSet.filter((cookie) => {
                    return cookie.indexOf(`${key}=`) === 0;
                }),
                cookie = cookieArray[0];

            return cookie
                ? cookie.split(`${key}=`)[1] !== ''
                    ? cookie
                          .split(`${key}=`)[1]
                          .replace(/(^[,\s]+)|([,\s]+$)/g, '')
                          .split(',')
                    : []
                : [];
        }

        return [];
    },

    /**
     * create - Create a cookie
     *
     * @param   {string} key          keyname of the cookie
     * @param   {any} value           value that needs to be given to the cookie
     * @param   {number} expiryDays   number of days from now the cookie should expire
     * @returns {boolean}             true - once the cookie is created | false - if code renders server side
     */
    create: function(key, value, expiryDays = 90) {
        if (typeof window !== 'undefined') {
            let currentDate = new Date(),
                expiryDate = new Date(
                    currentDate.getTime() + expiryDays * 24 * 60 * 60 * 1000
                ),
                newCookie = `${key}=${value};path=/;expires=${expiryDate}`;

		if (typeof document !== 'undefined' && typeof document.cookie !== 'undefined')
			{
			 document.cookie = newCookie;
			}          

            return true;
        }

        return false;
    },

    /**
     * delete - Delete a cookie
     *
     * @param   {string} key   keyname of the cookie
     * @returns {boolean}      returns true once the cookie is deleted  | returns false if code renders server side
     */
    delete: function(key) {
        if (typeof window !== 'undefined') {
            let newCookie = `${key}=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT`;

           if (typeof document !== 'undefined' && typeof document.cookie !== 'undefined')
				{
				 document.cookie = newCookie;
				}  

            return true;
        }

        return false;
    },

    /**
     * addTo - Add a value to an existing cookie
     *
     * @param   {string} key          keyname of the cookie
     * @param   {any} value           description
     * @param   {number} expiryDays   description
     * @returns {boolean}             return true once the value is added | returns false if code renders server side
     */
    addTo: function(key, value, expiryDays = 90) {
        if (typeof window !== 'undefined') {
            let currentDate = new Date(),
                expiryDate = new Date(
                    currentDate.getTime() + expiryDays * 24 * 60 * 60 * 1000
                ),
                cookieSet = typeof document !== 'undefined' && typeof document.cookie !== 'undefined' && document.cookie.split('; '),
                cookieArray = cookieSet.filter((cookie) => {
                    return cookie.indexOf(`${key}=`) === 0;
                }),
                cookie = cookieArray[0],
                cookieValue = cookie ? cookie.split(`${key}=`)[1] : '',
                cookieValueArray = cookieValue.split(',');

            const cookieIndex = cookieValueArray.indexOf(value);

            if (cookieValue && cookieIndex > -1) {
                cookieValueArray.splice(cookieIndex, 1);
            }

            cookieValueArray.push(value);

            if (
                cookieIndex === -1 &&
                (key === 'favoriteShoreX' || key === 'favorites')
            ) {
                cookieValueArray = cookieValueArray.slice(-30);
            }

			if (typeof document !== 'undefined' && typeof document.cookie !== 'undefined')
			{
			            document.cookie = `${key}=${cookieValueArray
			                .join(',')
			                .replace(
			                    /(^[,\s]+)|([,\s]+$)/g,
			                    ''
			                )};path=/;expires=${expiryDate.toUTCString()}`;

			}


            return true;
        }

        return false;
    },

    /**
     * removeFrom - Remove a value from an existing cookie
     *
     * @param   {string} key          keyname of the cookie
     * @param   {any} value           description
     * @param   {number} expiryDays   description
     * @returns {boolean}             return true once the value is added | returns false if code renders server side
     */
    removeFrom: function(key, value, expiryDays = 90) {
        if (typeof window !== 'undefined') {
            let currentDate = new Date(),
                expiryDate = new Date(
                    currentDate.getTime() + expiryDays * 24 * 60 * 60 * 1000
                ),
                cookieSet = typeof document !== 'undefined' && typeof document.cookie !== 'undefined' && document.cookie.split('; '),
                cookieArray = cookieSet.filter((cookie) => {
                    return cookie.indexOf(`${key}=`) === 0;
                }),
                cookie = cookieArray[0],
                cookieValue = cookie ? cookie.split(`${key}=`)[1] : '',
                cookieValueArray = cookieValue.split(',');

            cookieValueArray.splice(cookieValueArray.indexOf(value), 1);
            
			if (typeof document !== 'undefined' && typeof document.cookie !== 'undefined')
			{	
				document.cookie = `${key}=${cookieValueArray
                .join(',')
                .replace(
                    /(^[,\s]+)|([,\s]+$)/g,
                    ''
                )};path=/;expires=${expiryDate.toUTCString()}`;

			}


            return true;
        }

        return false;
    }
};
