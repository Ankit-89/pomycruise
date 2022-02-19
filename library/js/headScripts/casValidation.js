(function () {
    var hasStorage = true;

    if ( typeof window === 'undefined' || typeof sessionStorage === 'undefined' ) {
        hasStorage = false;
    }

    function getLoginStatus() {

        var loginStatus = sessionStorage.getItem( 'loginStatus' ) || '';

        if ( loginStatus !== 'not-logged-in' ) {

            sessionStorage.setItem('loginStatus', 'not-logged-in');
            window.location.href = window.loginConfig.ssoUrl + '?service=' + window.location.href.split('?')[0] + '&gateway=true';
        }
    }

    function getUserData(sessionToken) {

        if ( window.loginConfig && window.loginConfig.userDataUrl ) {

            var userDataUrl = `${window.loginConfig.userDataUrl  }?service=${  window.location.href.split('?')[0]  }&${  sessionToken}`;
            var apikey = (typeof window !== 'undefined' && window.configs.apikeyMycruise !== 'undefined') ? window.configs.apikeyMycruise : '',
                agencyId = (typeof window !== 'undefined' && window.configs.agencyId !== 'undefined') ? window.configs.agencyId : '',
                brand = (typeof window !== 'undefined' && window.configs.brand !== 'undefined') ? window.configs.brand : '',
                country = (typeof window !== 'undefined' && window.configs.country !== 'undefined') ? window.configs.country : '',
                locale = (typeof window !== 'undefined' && window.configs.locale !== 'undefined') ? window.configs.locale : '';

            var headers = {
                apikey: apikey,
                agencyId: agencyId,
                brand: brand,
                country: country,
                locale: locale
            };

            window.fetch(userDataUrl, {
                mode: 'cors',
                cache: 'default',
                method: 'POST',
                credentials: 'same-origin',
                headers: headers,
                body: '{}'
            })
            .then(function (response) {

                response.json()
                .then(function (json) {

                    sessionStorage.setItem('loginStatus', 'logged-in');
                    sessionStorage.setItem('userData', JSON.stringify(json.data));
                    window.location.href = window.location.href.split('?')[0];
                })
                .catch(function (e) {

                    // console.log(e);
                });
            })
            .catch(function (e) {
                // console.log(e);
            });
        }
    }

    if ( hasStorage ) {

        var userData = JSON.parse(sessionStorage.getItem( 'userData' ) || '{}');

        if ( !userData.mariner ) {

            var query = window.location.href.split('?')[1];
            var hasSessionToken = query ? query.indexOf('ticket=ST') > -1 : false;

            if ( hasSessionToken ) {

                getUserData(query);
            }
            else {

                getLoginStatus();
            }
        }
    }
})();