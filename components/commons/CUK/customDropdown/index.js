/**
 * @exports customDropdown
 */
import React from 'react';

class customDropdown extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            initialstate: 0,
            selectedIndex:
                typeof this.props.defaultSelection !== 'undefined'
                    ? this.props.defaultSelection
                    : 'default'
        };
        this.linkElements = [];
    }

    componentDidMount() {
        this.setState({
            initialstate: this.state.selectedIndex
        });
        typeof document !== 'undefined' && document.addEventListener('click', (e) => {
            if (
                this.dropdownWrapper !== null &&
                !this.dropdownWrapper.contains(e.target) &&
                this.state.isOpen
            ) {
                this.setState({
                    isOpen: false,
                    selectedIndex: this.state.initialstate
                });
            }
        });
    }

    componentWillReceiveProps(newProps) {
        if (newProps.defaultSelection !== this.props.defaultSelection) {
            this.setState({
                selectedIndex: newProps.defaultSelection
            });
        }
    }

    toggleDropdown = () => {
        this.setState(
            {
                isOpen: !this.state.isOpen
            },
            () => {
                if (!this.state.isOpen) {
                    this.dropdownButton.focus();
                }
                this.props.onChangeState(this.state.isOpen);
            }
        );
    };

    navigateKeyDown = (e) => {
        const { list } = this.props;
        let { selectedIndex } = this.state;
        // const elem = selectedIndex

        if (selectedIndex === 'default') {
            selectedIndex = 0;
        }

        switch (e.keyCode) {
            case 38:
                e.preventDefault();
                !this.state.isOpen
                    ? this.setState({ initialstate: this.state.selectedIndex })
                    : null;
                this.setState(
                    {
                        isOpen: true
                    },
                    () => {
                        this.moveFocus();
                    }
                );
                if (selectedIndex > 0) {
                    let newSelectedIndex = selectedIndex - 1;

                    this.setState(
                        {
                            selectedIndex: newSelectedIndex
                        },
                        () => {
                            this.changeStatus(newSelectedIndex);
                        }
                    );
                }
                break;
            case 40:
                e.preventDefault();
                !this.state.isOpen
                    ? this.setState({ initialstate: this.state.selectedIndex })
                    : null;
                this.setState(
                    {
                        isOpen: true
                    },
                    () => {
                        this.moveFocus();
                    }
                );
                if (selectedIndex < list.length - 1) {
                    let newSelectedIndex = selectedIndex + 1;

                    this.setState(
                        {
                            selectedIndex: newSelectedIndex
                        },
                        () => {
                            this.changeStatus(newSelectedIndex);
                        }
                    );
                }
                break;
            case 9:
            case 27:
                if (this.state.isOpen) {
                    e.preventDefault();
                    this.setState({ selectedIndex: this.state.initialstate });
                    this.toggleDropdown();
                }
                break;
            case 13:
                if (e.target.classList.contains('dropdown-toggle')) {
                    e.preventDefault();
                    this.setState(
                        {
                            isOpen: true,
                            initialstate: this.state.selectedIndex
                        },
                        () => {
                            this.moveFocus();
                        }
                    );
                }
                break;
        }
    };

    changeStatus = (currentIndex) => {
        const { isOpen } = this.state;
        const { dropdownType, list } = this.props;

        if (isOpen) {
            this.moveFocus();
        } else {
            this.props.onChangeDropdown({
                item: list[currentIndex],
                index: currentIndex,
                dropdownType: dropdownType
            });
        }
    };

    moveFocus = () => {
        if (this.state.selectedIndex === 'default') {
            this.linkElements[0].focus();
        } else {
            this.linkElements[this.state.selectedIndex].focus();
        }
    };

    onChangeItem = (e, item, index) => {
        e.preventDefault();
        this.setState(
            {
                selectedIndex: index
            },
            () => {
                if (this.state.isOpen) {
                    this.toggleDropdown();
                }
            }
        );
        this.props.onChangeDropdown({
            item: item,
            index: index,
            dropdownType: this.props.dropdownType
        });
    };

    render() {
        const {
            dropdownClassName,
            dropdownId,
            list,
            label,
            ariaLabel,
            title,
            selectedDropdown,
            primaryRole = 'listbox',
            listRole = 'listbox',
            optionRole = 'option'
        } = this.props;
        const { selectedIndex, isOpen } = this.state;
        const selectedDropdownIndex =
            typeof selectedDropdown !== 'undefined' ? selectedDropdown : 0;

        title
            ? (list['default'] = title)
            : (list['default'] = list[selectedDropdownIndex]);

        const selectedLabel =
            typeof window !== 'undefined' && window.configs
                ? window.configs.accessibilitySeletedLabel
                : '';

        return (
            <div
                ref={(dropdownWrapper) => {
                    this.dropdownWrapper = dropdownWrapper;
                }}
                className={`custom-dropdown-wrapper ${
                    dropdownClassName ? dropdownClassName : ''
                } ${isOpen ? 'open' : ''}`}
            >
                <div
                    className={`dropdown-toggle`}
                    role={primaryRole}
                    tabIndex={0}
                    aria-owns={dropdownId}
                    aria-label={ariaLabel}
                    aria-haspopup="true"
                    aria-expanded={isOpen}
                    onClick={this.toggleDropdown}
                    ref={(dropdownButton) =>
                        (this.dropdownButton = dropdownButton)
                    }
                    onKeyDown={(e) => this.navigateKeyDown(e)}
                >
                    <span className="dropdown-label">
                        {label ? `${label}` : ''}
                    </span>{' '}
                    <span className="dropdown-value">
                        <span className="sr-only">{`${selectedLabel} `}</span>
                        {list[selectedIndex]}
                    </span>
                </div>
                {this.state.isOpen && (
                    <div
                        className="dropdown-menu"
                        id={dropdownId}
                        role={listRole}
                    >
                        {list.map((item, index) => {
                            return (
                                <a
                                    key={index}
                                    ref={(el) => {
                                        this.linkElements[index] = el;
                                    }}
                                    className={`dropdown-item ${
                                        selectedIndex === index ||
                                        (selectedIndex === 'default' &&
                                            index === selectedDropdownIndex &&
                                            list['default'] ===
                                                list[selectedDropdownIndex])
                                            ? 'active'
                                            : ''
                                    }`}
                                    href="javascript:void(0);"
                                    role={optionRole}
                                    onClick={(e) =>
                                        this.onChangeItem(e, item, index)
                                    }
                                    onKeyDown={(e) => this.navigateKeyDown(e)}
                                >
                                    {item}
                                </a>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }
}

/**
 * SortByDropdown proptypes.
 */
customDropdown.propTypes = {};

export default customDropdown;
