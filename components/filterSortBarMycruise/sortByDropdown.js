/**
 * SortBy Dropdown of C044a
 * @exports SortByDropdown
 */
import React from 'react';
import analytics from '../commons/CUK/analytics';
import Link from '../commons/CUK/link';
import CustomDropdown from '../commons/CUK/customDropdown';
import { VIEWPORT_TYPE, watchForBreakpoint } from '../../library/js/config/breakpoints';

class SortByDropdown extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dropdownShow: false,
            isLVP: false
        };
        this.dropdownList = this.getDropdownList();
    }

    componentDidMount() {
        // analytics.clickTracking( this );
        const mqlLVP = watchForBreakpoint(VIEWPORT_TYPE.DESKTOP);

        this.handleResize( mqlLVP );
        mqlLVP.addListener(mql => {
            this.handleResize(mql);
        });
    }

    /**
     * handleResize - Resize event for media devices
     *
     * @param {object} mql - Match media object
     */
    handleResize(mql) {
        this.setState({
            isLVP: mql.matches
        });
    }

    /**
     * Generate Dropdown Markup
     * @returns {ReactDOMObject} dropdown items.
     */
    getDropdownList = () => {
        const { sortByFilter, sortByText } = this.props;

        return sortByFilter.map((item, index) => {

            return (
                <li className="dropdown-item" key={ index }>
                    <Link url='JavaScript:void(0)' ariaRole='button' onClick={ (e) => {
                        e.preventDefault();
                        // this.props.sortBy( item );
                        this.hide();
                    } }
                    dataLinktext = {`${sortByText}:${item.filterTitle}`}
                    dataComponentname = {this.props.componentname}
                    >
                    { item.filterTitle }
                    </Link>
                </li>
            );
        });
    }

    /**
     * Show dropdown
     */
    show = () => {
        analytics.clickTracking(this);
        this.setState({ dropdownShow: true });
        typeof document !== 'undefined' && document.addEventListener('click', this.hide);
    }

    /**
     * Hide dropdown
     */
    hide = () => {
        analytics.clickTracking(this);
        this.setState({ dropdownShow: false });
        typeof document !== 'undefined' && document.removeEventListener('click', this.hide);
    }

    /**
     * Change dropdown
     * @param {Object} selectedItem - Selected dropdown option.
     */
    onChangeDropdown = (selectedItem) => {
        const item = this.props.sortByFilter[selectedItem.index];

        this.props.sortBy( item, selectedItem );
    }

    /**
     * Prevent dropdown from closing
     * @param {EventObject} event - React Synthetic Event.
     */
    preventClose = (event) => {
        analytics.clickTracking(this);
        (event.nativeEvent.stopImmediatePropagation) ? event.nativeEvent.stopImmediatePropagation() : event.stopPropagation();
    }

    render() {
        const dropdownClass = (this.state.dropdownShow) ? ' show' : '';
        const { sortByLabel, closeLabel, sortByClass, sortByFilter, sortByText }  = this.props;
        const { isLVP } = this.state;

        return (
            <div className={`sort-dropdown${dropdownClass} ${sortByClass}`}>
                { isLVP ?
                    <CustomDropdown
                        label={ sortByText !== 'country' ? sortByText : '' }
						list={sortByFilter.map((item) => item.filterTitle)}
						defaultSelection = {this.props.selectedIndex}
                        onChangeDropdown={ this.onChangeDropdown }
                    />
                    :
                    <div>
                        <button className='dropdown-btn' onClick={this.show} data-linktext={'droptdown-btn'}> <span className='sort-by-label'> { sortByLabel } </span></button>
                        <div className='list-dropdown' tabIndex='0' role='button' onKeyPress={ this.preventClose } onClick={ this.preventClose }>
                            <div className='action-bar'>
                                <span className='label'> { sortByLabel } </span>
                                <button className="close" onClick={this.hide} data-linktext={'filter-close'}>{ closeLabel }</button>
                            </div>
                            <ul className='dropdown-list'>
                                { this.dropdownList }
                            </ul>
                        </div>
                    </div>
                }
            </div>
        );
    }
}


export default SortByDropdown;
