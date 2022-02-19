import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import FormNotifier from './formNotifier';

import Link from '../commons/CUK/link';
import analytics from '../commons/CUK/analytics';

class formSection extends Component {
    constructor(props) {
        super(props);
        this.state = {
            disabled: true,
            offsetTop: 0,
            complete: false,
            needsWidget: false,
            checkValidFlag: false
        };
    }
    componentDidMount() {
        this.evaluateWidget();
        // analytics.clickTracking(this);
    }
    componentDidUpdate() {
        this.state.needsWidget && this.evaluateCompletion();
        // analytics.clickTracking(this);
        this.checkValidation();
    }
    // componentWillReceiveProps(newProps) {
    //     if(newProps.valueChanged !== this.props.valueChanged){
    //         this.checkValidation();
    //     }
    // }
    evaluateWidget() {
        const node = ReactDOM.findDOMNode(this);
        const needsWidget = node.querySelectorAll('.required-field').length > 0;
        this.setState(
            () => ({
                needsWidget
            }),
            () => {
                this.evaluateCompletion();
            }
        );
    }

    evaluateCompletion() {
        const { complete } = this.state;
        const node = ReactDOM.findDOMNode(this);
        const completed =
            node.querySelectorAll('.form-missing-field').length <= 0;
        if (complete !== completed) {
            this.setState(() => ({
                complete: completed
            }));
        }
    }
    handleSubmit = () => {
        const { handleSubmit, section } = this.props;
        handleSubmit && handleSubmit(section);
    };
    handleEdit = (e) => {
        e.preventDefault();
        const { editModeHandler, section } = this.props;
        editModeHandler && editModeHandler(section);
    };
    editModeResetter = () => {
        const { editModeHandler, handleReset, section } = this.props;
        const sectionNode = ReactDOM.findDOMNode(this);
        handleReset && handleReset();
        editModeHandler && editModeHandler(false, sectionNode, section);
    };
    renderSingleCta() {
        const {
            labels: { editLabel }
        } = this.props;
        return (
            <div className="cta_container cta_container--edit">
                <Link
                    url="#"
                    ariaLabel={editLabel}
                    label={editLabel}
                    onClick={this.handleEdit}
                    linkClassName="cta-secondary"
                    dataLinktext="edit"
                    dataComponentname={'userDetails'}
                >
                    {editLabel}
                </Link>
            </div>
        );
    }
    checkValidation() {
        const checkValidField = (typeof document !== 'undefined' && document.getElementsByClassName('show-msg')) || [];
        const checkMissingField = (typeof document !== 'undefined' && document.getElementsByClassName('form-missing-field')) || [];
        const checkValidFlag = (checkValidField && checkValidField.length <= 0) && (checkMissingField && checkMissingField.length <= 0);
        if (this.state.checkValidFlag !== checkValidFlag) {
            this.setState({
                checkValidFlag: checkValidFlag
            })
        }
    }
    renderDoubleCta() {
        const {
            labels: { saveLabel, cancelLabel },
            modified,
            required
        } = this.props;
        const { complete, checkValidFlag } = this.state;
        // const checkValid = document.getElementsByClassName('show-msg');
        // const checkValidFlag = checkValid && checkValid.length === 0;
        return (
            <div className="cta_container">
                <Link
                    url="#"
                    ariaLabel={`${
                        checkValidFlag && ((this.props.modified && complete) || (this.props.modified && !required))
                            ? ''
                            : 'disabled'
                        } ${saveLabel}`}
                    label={saveLabel}
                    onClick={this.handleSubmit}
                    linkClassName={`${
                        checkValidFlag && ((this.props.modified && complete) || (this.props.modified && !required))
                            ? ''
                            : 'disabled'
                        } cta-primary`}
                    dataLinktext="save"
                    dataComponentname={'userDetails'}
                >
                    {saveLabel}
                </Link>
                <Link
                    url="#"
                    ariaLabel={cancelLabel}
                    label={cancelLabel}
                    onClick={this.editModeResetter}
                    linkClassName={'cta-secondary'}
                    dataLinktext={'cancel'}
                    dataComponentname={'userDetails'}
                >
                    {cancelLabel}
                </Link>
            </div>
        );
    }
    render() {
        const {
            editMode,
            section,
            labels,
            children,
            subtitle,
            required
        } = this.props;
        const { complete, needsWidget } = this.state;
        const { formIncompleteLabel, formCompleteLabel } = labels;
        return (
            <div id={section} className="passenger_form--section">
                <h3 className="form-title">
                    {labels[`${section}${editMode ? `Edit` : ``}Label`]}
                </h3>
                {section == 'personalInformation' && (
                    <p className="form-textEditDesc">
                        {labels.personalInformationEditMessageLabel}
                    </p>
                )}
                {subtitle && (
                    <p className="form-subtitle">
                        {
                            labels[
                            `${section}${
                            editMode ? `Edit` : ``
                            }SubtitleLabel`
                            ]
                        }
                    </p>
                )}
                <div className="form_wrapper">
                    {needsWidget && (section == "travelDocument" || section == "personalInformation") &&
                        !editMode && (
                            <FormNotifier
                                complete={complete}
                                incompleteLabel={formIncompleteLabel}
                                completeLabel={formCompleteLabel}
                            />
                        )}
                    {children}
                    {editMode ? this.renderDoubleCta() : this.props.hasConsent ? this.renderSingleCta() : ''}
                </div>
            </div>
        );
    }
}

export default formSection;
