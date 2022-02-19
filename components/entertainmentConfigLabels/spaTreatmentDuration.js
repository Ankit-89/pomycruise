import React from 'react';
import SessionStorage from '../commons/CUK/session-storage';

class spaTreatmentDuration extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            durations: [],
            type: ''
        };
    }

    componentWillMount() {
        this.buildDurationList();
    }

    componentDidMount() {
        const { selectDurationHandler } = this.props;
        const { type } = this.state;
        if (this.state.durations.length == 1) {
            const value = this.state.durations[0];
            selectDurationHandler && selectDurationHandler(value, type);
        }
    }

    buildDurationList() {
        const spaConfigPageData = SessionStorage.getItem('spaConfigPageData');
        const { instances } = spaConfigPageData;
        const durationList = [];
        let durationType = '';
        instances.map((singleInstance) => {
            durationType = singleInstance.productOffering;
            if (singleInstance.availableForAdult) {
                durationList.push(singleInstance);
            }
        });
        durationList.length > 0 &&
            durationList.sort((a, b) => {
                return a.duration - b.duration;
            });
        this.setState({ durations: durationList, type: durationType });
    }

    handleSelectDuration = (value) => {
        const { selectDurationHandler } = this.props;
        const { type } = this.state;
        selectDurationHandler && selectDurationHandler(value, type);
    };

    renderDuration = (instance, index) => {
        const { selectedDuration } = this.props;
        const durationChecked =
            selectedDuration.findIndex(
                (selectedIndex) =>
                    selectedIndex.externalCode == instance.externalCode
            ) >= 0;
        return (
            <li key={index} className="radio-item">
                <input
                    onChange={() => this.handleSelectDuration(instance)}
                    value={instance.externalCode}
                    type="radio"
                    className="input-radio"
                    aria-labelledby="variation2-check"
                    name="spaTreatmentDuration"
                    id={`checkbox${instance.externalCode}`}
                    ref={(checkbox) => (this.checkbox = checkbox)}
                    checked={durationChecked}
                />
                <label htmlFor={`checkbox${instance.externalCode}`}>
                    <span className="passenger">{`${
                        instance.duration
                    } Minutes`}</span>
                </label>
                <span className="error-label show-label" ref="checkbox" />
            </li>
        );
    };

    render() {
        const { durations, type } = this.state;

        if (type == 'MULTI_DAY_PASS') {
            return null;
        }

        if (type == 'ONE_DAY_PASS') {
            return null;
        }

        return (
            <div className="spa-duration-container">
                <h3>{'Wheelchair Spaces required?'}</h3>
                <ul>{durations.map(this.renderDuration)}</ul>
            </div>
        );
    }
}

export default spaTreatmentDuration;
