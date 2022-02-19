'use strict';

import React from 'react';
import WithTooltip from './withTooltip';
import analytics from '../commons/CUK/analytics';
import SessionStorage from '../commons/CUK/session-storage';

class loyaltyTierSlot extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loyaltyName: props.loyaltyName,
            loyaltyDesc: props.loyaltyDesc
        };
    }

    componentWillMount() {
        this.getLoyaltyTier();
    }

    componentDidMount() {
        const { loyaltyName } = this.state;
        analytics.setAdditionalPageTrackAttributes({
            memberLoyaltyLevel: loyaltyName.toLowerCase(),
        });
    }

    getLoyaltyTier() {
        const { pastGuestNumber } = this.props;
        if (pastGuestNumber !== '') {
            const { loyaltyApi, brandCode, pastGuestNumber } = this.props;
            // const url = `${loyaltyApi}${number}`;
            const url = loyaltyApi.replace('{{paxUrn}}', pastGuestNumber);

            const apikeyMycruise = typeof window !== 'undefined' ? window.configs.apikeyMycruise : '';
            //.replace('{{brand}}', brandCode);
            fetch(url, {
                method: 'GET',
                headers: {
                    'X-Source-Identity-Token-0': apikeyMycruise
                }
            })
                .then(this.transformResToJson, (err) => { })
                .catch((err) => { });
        }
    }

    transformResToJson = (res) => {
        res.json().then(this.assignApiResponse);
    };

    assignApiResponse = (res) => {
        SessionStorage.setItem('loyaltyData', res);
        const {
            LocyaltyAccount: [theAccount]
        } = res;
        const trans = this.getLoyaltyTranslation(theAccount.loyaltyTier.$);
        this.setState((prevState) => ({
            loyaltyDesc: trans ? trans.itemDescription : prevState.loyaltyDesc,
            loyaltyName: trans ? trans.itemLabel : prevState.loyaltyName
        }));
    };

    getLoyaltyTranslation(id) {
        const { loyaltyTiers } = this.props;
        return loyaltyTiers ? loyaltyTiers[id.toLowerCase()] : false;
    }

    componentWillReceiveProps(nextProps) {
        const { pastGuestNumber } = this.props;
        pastGuestNumber !== nextProps.pastGuestNumber && this.getLoyaltyTier();
    }

    render() {
        const { label, noTierLabel, hasTooltip = true } = this.props;
        const { loyaltyName, loyaltyDesc } = this.state;
        const hasLoyaltyTier = loyaltyName === 'No Tier' ? false : loyaltyName;

        const noTierBlock = noTierLabel ? <h5>{noTierLabel}</h5> : null;
        const tierBlock = hasLoyaltyTier && [
            <span
                key="loyaltyTxt"
                className="loyaltyTierSlot__txt"
            >{`${label} :`}</span>,
            <span key="loyaltyType" className="emp loyaltyTierSlot__type">
                {loyaltyName}
            </span>
        ];
        return hasLoyaltyTier ? (
            <div className="loyaltyTierSlot">
                {hasTooltip && loyaltyDesc !== '' ? (
                    <WithTooltip tooltipLabel={loyaltyDesc}>
                        {tierBlock}
                    </WithTooltip>
                ) : (
                        tierBlock
                    )}
            </div>
        ) : (
                noTierBlock
            );
    }
}

loyaltyTierSlot.defaultProps = {
    loyaltyName: '',
    loyaltyDesc: ''
};

export default loyaltyTierSlot;
